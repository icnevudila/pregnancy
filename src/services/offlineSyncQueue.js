import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabaseClient';
import { SyncStates } from '../domain/types';

const QUEUE_STORAGE_KEY = '@momora_offline_sync_queue';

class OfflineSyncQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.init();
  }

  async init() {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (raw) {
        this.queue = JSON.parse(raw);
      }
    } catch (e) {
      this.queue = [];
    }
  }

  async persist() {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      // ignore
    }
  }

  /**
   * Enqueue a new tracker event for offline-first sync
   */
  async enqueue(event) {
    const item = {
      ...event,
      queuedAt: new Date().toISOString(),
      retryCount: 0,
      syncState: SyncStates.PENDING,
    };
    this.queue.push(item);
    await this.persist();
    this.processQueue();
    return item;
  }

  /**
   * Process all pending items in background
   */
  async processQueue() {
    if (this.isProcessing || !supabase) return;
    this.isProcessing = true;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        this.isProcessing = false;
        return;
      }

      const pending = this.queue.filter(i => i.syncState === SyncStates.PENDING || i.syncState === SyncStates.FAILED);

      for (const item of pending) {
        item.syncState = SyncStates.SYNCING;
        try {
          // Attempt table insert depending on event type
          let res = null;
          if (item.type === 'contraction') {
            res = await supabase.from('contraction_sessions').upsert({
              id: item.clientGeneratedId || item.id,
              user_id: userData.user.id,
              started_at: item.metadata?.startedAt || item.occurredAt,
              duration_sec: item.metadata?.durationSecs || 0,
              intensity: item.metadata?.intensity || 'Orta',
              status_alert: item.metadata?.statusAlert || null,
              created_at: item.occurredAt,
            });
          } else if (item.type === 'movement') {
            res = await supabase.from('movement_sessions').upsert({
              id: item.clientGeneratedId || item.id,
              user_id: userData.user.id,
              kicks: item.metadata?.kicks || 0,
              duration_secs: item.metadata?.durationSecs || 0,
              created_at: item.occurredAt,
            });
          } else if (item.type === 'diaper') {
            res = await supabase.from('diaper_entries').upsert({
              id: item.clientGeneratedId || item.id,
              user_id: userData.user.id,
              type: item.metadata?.type || 'wet',
              color: item.metadata?.color || null,
              created_at: item.occurredAt,
            });
          } else {
            // General event store
            res = await supabase.from('tracker_events').upsert({
              id: item.clientGeneratedId || item.id,
              user_id: userData.user.id,
              type: item.type,
              metadata: item.metadata,
              created_at: item.occurredAt,
            });
          }

          if (res?.error) {
            item.syncState = SyncStates.FAILED;
            item.retryCount = (item.retryCount || 0) + 1;
          } else {
            item.syncState = SyncStates.SYNCED;
          }
        } catch (err) {
          item.syncState = SyncStates.FAILED;
          item.retryCount = (item.retryCount || 0) + 1;
        }
      }

      // Filter out synced items older than 24 hours to keep storage lean
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      this.queue = this.queue.filter(i => i.syncState !== SyncStates.SYNCED || new Date(i.occurredAt).getTime() > cutoff);
      await this.persist();
    } catch (e) {
      // ignore
    } finally {
      this.isProcessing = false;
    }
  }

  getPendingCount() {
    return this.queue.filter(i => i.syncState === SyncStates.PENDING || i.syncState === SyncStates.FAILED).length;
  }
}

export const offlineSyncQueue = new OfflineSyncQueue();
export default offlineSyncQueue;
