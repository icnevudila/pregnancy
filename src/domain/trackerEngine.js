/**
 * MOMORA Unified Tracker Engine & Offline Queue
 * Complies with:
 * - 03_PRODUCT_ARCHITECTURE.md (Unified timeline & common event layer)
 * - 04_BACKEND_DATA_MODEL.md (Standard tracker entities & client_generated_id)
 * - 05_OFFLINE_SYNC_SECURITY.md (Local-first, pending/synced states, timestamp-based timers)
 * - 10_FOREGROUND_INTERACTION_RULES.md (Optimistic UI, immediate feedback, 5-8s undo)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncStates, createId } from './types.js';

export const OFFLINE_QUEUE_KEY = 'momora.offline_queue.v1';
export const UNDO_TIMEOUT_MS = 8000; // 8 seconds per interaction spec

export const TrackerTypes = {
  MOVEMENT: 'movement',
  CONTRACTION: 'contraction',
  WEIGHT: 'weight',
  NURSING: 'nursing',
  BOTTLE: 'bottle',
  PUMPING: 'pumping',
  SLEEP: 'sleep',
  DIAPER: 'diaper',
  WATER: 'water',
  VITAMIN: 'vitamin',
  MOOD: 'mood',
  APPOINTMENT: 'appointment',
  POSTPARTUM: 'postpartum_checkin',
};

/**
 * Standardized Tracker Record Factory
 * Enforces timestamp-based intervals for any timer-based tracker.
 */
export function createTrackerRecord({
  type,
  value,
  unit = '',
  title = '',
  startedAt = null,
  endedAt = null,
  occurredAt = new Date().toISOString(),
  metadata = {},
  notes = '',
  source = 'manual',
  householdId = 'hh_local_1',
  createdBy = 'user',
}) {
  const id = createId(`evt_${type}`);
  const clientGeneratedId = createId('cli');
  
  // Calculate elapsed time strictly from timestamps if available
  let durationSeconds = null;
  if (startedAt && endedAt) {
    const s = typeof startedAt === 'string' ? new Date(startedAt).getTime() : startedAt;
    const e = typeof endedAt === 'string' ? new Date(endedAt).getTime() : endedAt;
    durationSeconds = Math.max(0, Math.round((e - s) / 1000));
  } else if (metadata.durationSeconds) {
    durationSeconds = metadata.durationSeconds;
  }

  return {
    id,
    clientGeneratedId,
    type,
    title: title || formatDefaultTitle(type),
    value,
    unit,
    durationSeconds,
    startedAt: startedAt ? new Date(startedAt).toISOString() : null,
    endedAt: endedAt ? new Date(endedAt).toISOString() : null,
    occurredAt: new Date(occurredAt).toISOString(),
    metadata: { ...metadata, durationSeconds },
    notes: (notes || '').trim(),
    source,
    householdId,
    createdBy,
    syncState: SyncStates.PENDING,
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function formatDefaultTitle(type) {
  switch (type) {
    case TrackerTypes.MOVEMENT: return 'Fetal Hareket';
    case TrackerTypes.CONTRACTION: return 'Sancı & Kasılma';
    case TrackerTypes.WEIGHT: return 'Kilo Takibi';
    case TrackerTypes.NURSING: return 'Emzirme';
    case TrackerTypes.BOTTLE: return 'Biberon';
    case TrackerTypes.PUMPING: return 'Süt Sağımı';
    case TrackerTypes.SLEEP: return 'Bebek Uykusu';
    case TrackerTypes.DIAPER: return 'Bez Değişimi';
    case TrackerTypes.WATER: return 'Su Takibi';
    case TrackerTypes.VITAMIN: return 'Prenatal Vitamin';
    case TrackerTypes.MOOD: return 'Ruh Hali';
    case TrackerTypes.POSTPARTUM: return 'Lohusalık İyileşme Kaydı';
    default: return 'Takip Kaydı';
  }
}

/**
 * Optimistic UI Mutation Helpers
 */

export function applyOptimisticCreate(eventsList = [], newRecord) {
  return [newRecord, ...eventsList];
}

export function applyOptimisticUpdate(eventsList = [], recordId, patch) {
  return eventsList.map(item => {
    if (item.id !== recordId) return item;
    return {
      ...item,
      ...patch,
      updatedAt: new Date().toISOString(),
      syncState: SyncStates.PENDING,
    };
  });
}

export function applyOptimisticDelete(eventsList = [], recordId) {
  const target = eventsList.find(item => item.id === recordId);
  const updatedList = eventsList.filter(item => item.id !== recordId);
  return { updatedList, deletedRecord: target || null };
}

export function applyUndoAction(eventsList = [], undoAction) {
  if (!undoAction || !undoAction.record) return eventsList;
  if (Date.now() > undoAction.expiresAt) return eventsList;

  if (undoAction.actionType === 'delete') {
    // Restore deleted record at its original or top position
    return [undoAction.record, ...eventsList.filter(i => i.id !== undoAction.record.id)];
  }

  if (undoAction.actionType === 'create') {
    // Revert created record
    return eventsList.filter(i => i.id !== undoAction.record.id);
  }

  return eventsList;
}

/**
 * Offline Sync Queue Management
 */

export async function getOfflineQueue() {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Failed to read offline queue:', err);
    return [];
  }
}

export async function enqueueOfflineRecord(record) {
  try {
    const current = await getOfflineQueue();
    const filtered = current.filter(item => item.id !== record.id);
    const next = [...filtered, record];
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(next));
    return next;
  } catch (err) {
    console.warn('Failed to enqueue offline record:', err);
    return [];
  }
}

export async function dequeueOfflineRecord(recordId) {
  try {
    const current = await getOfflineQueue();
    const next = current.filter(item => item.id !== recordId);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(next));
    return next;
  } catch (err) {
    console.warn('Failed to dequeue offline record:', err);
    return [];
  }
}

/**
 * Background Queue Processor
 * Silently attempts to sync pending events to Supabase if connected
 */
export async function flushOfflineQueue(syncHandler) {
  if (typeof syncHandler !== 'function') return { processed: 0 };
  const queue = await getOfflineQueue();
  if (!queue.length) return { processed: 0 };

  let processed = 0;
  for (const record of queue) {
    try {
      const res = await syncHandler(record);
      if (res?.ok) {
        await dequeueOfflineRecord(record.id);
        processed++;
      }
    } catch (err) {
      // Keep in queue for next sync window
      break;
    }
  }
  return { processed, remaining: queue.length - processed };
}

/**
 * Unified Timeline Aggregator
 * Merges modern TrackerEvents with legacy records, filters soft-deleted items,
 * and sorts chronologically descending with day-grouping.
 */
export function getUnifiedTimeline(trackerEvents = [], legacyRecords = [], lang = 'tr') {
  const isEn = lang === 'en';
  const timeline = [];

  // 1. Process structured TrackerEvents
  for (const evt of trackerEvents) {
    if (evt.deletedAt) continue;
    timeline.push({
      id: evt.id,
      type: evt.type,
      title: evt.title || formatDefaultTitle(evt.type),
      value: evt.value,
      unit: evt.unit || '',
      notes: evt.notes || '',
      occurredAt: evt.occurredAt,
      time: formatDisplayTime(evt.occurredAt),
      durationSeconds: evt.durationSeconds,
      metadata: evt.metadata || {},
      syncState: evt.syncState,
      isLegacy: false,
    });
  }

  // 2. Normalize legacy records if not already represented
  for (const rec of legacyRecords) {
    if (!rec || !rec.id) continue;
    const exists = timeline.some(t => t.id === rec.id);
    if (!exists) {
      timeline.push({
        id: rec.id,
        type: mapLegacyType(rec.type),
        title: rec.type,
        value: rec.value,
        unit: '',
        notes: '',
        occurredAt: rec.createdAt || new Date().toISOString(),
        time: rec.time || '12:00',
        durationSeconds: null,
        metadata: {},
        syncState: SyncStates.SYNCED,
        isLegacy: true,
      });
    }
  }

  // Sort descending by occurrence date
  timeline.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  // Group by date
  const groups = {};
  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  for (const item of timeline) {
    const dateKey = item.occurredAt.slice(0, 10);
    let label = dateKey;
    if (dateKey === todayStr) {
      label = isEn ? 'Today' : 'Bugün';
    } else if (dateKey === yesterday) {
      label = isEn ? 'Yesterday' : 'Dün';
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }

  return {
    raw: timeline,
    grouped: Object.keys(groups).map(day => ({
      day,
      items: groups[day],
    })),
    count: timeline.length,
  };
}

function formatDisplayTime(isoString) {
  if (!isoString) return '12:00';
  const d = new Date(isoString);
  return isNaN(d.getTime()) ? '12:00' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function mapLegacyType(rawType) {
  switch (rawType) {
    case 'Tekme': return TrackerTypes.MOVEMENT;
    case 'Kasılma': return TrackerTypes.CONTRACTION;
    case 'Kilo': return TrackerTypes.WEIGHT;
    case 'Emzirme': return TrackerTypes.NURSING;
    case 'Biberon': return TrackerTypes.BOTTLE;
    case 'Uyku': return TrackerTypes.SLEEP;
    case 'Bez': return TrackerTypes.DIAPER;
    case 'Su': return TrackerTypes.WATER;
    case 'Vitamin': return TrackerTypes.VITAMIN;
    default: return rawType?.toLowerCase() || 'tracker';
  }
}
