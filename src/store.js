import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultLists, extendedDefaults, migrateState } from './domain.mjs';
import { loadCloudState, saveCloudState, saveTrackingEvent, cloudStatusLabel } from './backendSync';
import {
  createTrackerRecord,
  applyOptimisticCreate,
  applyOptimisticUpdate,
  applyOptimisticDelete,
  applyUndoAction,
  enqueueOfflineRecord,
  UNDO_TIMEOUT_MS,
} from './domain/trackerEngine';

const KEY = 'momora.local.v1';
export const initialState = {
  lang: 'tr',
  mode: 'pregnancy',

  // Domain Entities (Sprint 0 Architecture)
  user: {
    id: 'usr_local_mother',
    displayName: 'Zeynep',
    locale: 'tr',
    activeRole: 'mother',
  },
  household: {
    id: 'hh_local_1',
    name: 'Zeynep & Mehmet',
  },
  pregnancy: {
    id: 'prg_local_1',
    dueDate: '2026-07-24',
    status: 'active',
  },
  baby: {
    id: 'bby_local_1',
    name: 'Ada',
    birthDate: '',
    sex: 'female',
  },
  postpartumProfile: {
    id: 'post_local_1',
    birthDate: '',
    deliveryType: 'vaginal',
  },

  // Flat fields for seamless backward compatibility
  name: 'Zeynep', partnerName: 'Mehmet', role: 'mother', partnerRole: 'father',
  babyName: 'Ada', babyGender: 'Kız', week: 24, day: 5, water: 4, vitamin: true,
  mood: 0, postpartumMood: null, lastMoodDate: new Date().toISOString().slice(0,10), tasks: [true, true, false, false, false],
  appointment: { title: 'Detaylı Ultrason Kontrolü', date: '16 Mayıs Cuma', time: '10:00' },
  notes: [
    { id: 'n1', text: '🌸 Harika · Bugün ilk kez minik bir tekme hissettim, kelebek kanadı gibiydi.' },
    { id: 'n2', text: 'Dr. Ayşe Hanım ile kontrolümüz harika geçti; organ gelişimi haftasıyla tam uyumlu.' },
  ],
  records: [
    { id: 'rec1', type: 'Tekme', value: '10 tekme • 18 dk seans', time: '14:25' },
    { id: 'rec2', type: 'Su', value: '4. bardak içildi · 1.0 L', time: '13:10' },
    { id: 'rec3', type: 'Vitamin', value: 'Prenatal Multivitamin alındı', time: '09:00' },
    { id: 'rec4', type: 'Kilo', value: '65.4 kg · Haftalık takip', time: '08:30' },
  ],
  trackerEvents: [
    {
      id: 'rec1',
      clientGeneratedId: 'cli_rec1',
      type: 'movement',
      title: 'Fetal Hareket',
      value: '10 hareket',
      unit: '',
      durationSeconds: 18 * 60,
      occurredAt: new Date().toISOString(),
      metadata: { count: 10, sessionDurationSeconds: 1080 },
      notes: '18 dk seans',
      syncState: 'synced',
    },
    {
      id: 'rec2',
      clientGeneratedId: 'cli_rec2',
      type: 'water',
      title: 'Su Takibi',
      value: '1.0',
      unit: 'L',
      occurredAt: new Date().toISOString(),
      metadata: { glassCount: 4 },
      notes: '4. bardak içildi',
      syncState: 'synced',
    },
    {
      id: 'rec3',
      clientGeneratedId: 'cli_rec3',
      type: 'vitamin',
      title: 'Prenatal Vitamin',
      value: 'Alındı',
      unit: '',
      occurredAt: new Date().toISOString(),
      metadata: { taken: true },
      notes: 'Prenatal Multivitamin alındı',
      syncState: 'synced',
    },
    {
      id: 'rec4',
      clientGeneratedId: 'cli_rec4',
      type: 'weight',
      title: 'Kilo Takibi',
      value: '65.4',
      unit: 'kg',
      occurredAt: new Date().toISOString(),
      metadata: { weight: 65.4 },
      notes: 'Haftalık takip',
      syncState: 'synced',
    },
  ],
  lastUndoAction: null,
  favorites: [], liked: false, messages: [],
  favNames: ['bn_defne', 'bn_lina', 'bn_atlas', 'bn_cinar'],
  // Extended state (tools & tracking)
  ...extendedDefaults,
};
export function useMomoraStore() {
  const [state, setState] = useState(initialState);
  const [ready, setReady] = useState(true);
  const [storageError, setStorageError] = useState(null);
  const [cloudStatus, setCloudStatus] = useState(cloudStatusLabel());
  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      let nextState = initialState;
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          if (saved && typeof saved === 'object') {
            nextState = migrateState(saved, initialState);
          }
        } catch (e) {}
      }
      setState(nextState);
      setReady(true);

      // Arka planda gecikmesiz bulut kontrolü (açılışı asla bekletmez)
      loadCloudState().then(cloud => {
        if (cloud?.error) {
          setCloudStatus('Bulut kaydı okunamadı; yerel kayıtla devam ediliyor.');
        } else if (cloud?.state) {
          const merged = migrateState(cloud.state, initialState);
          setState(merged);
          setCloudStatus('Bulut kaydı bu cihaza indirildi.');
        }
      }).catch(() => {});
    }).catch(() => {
      setStorageError('Önceki kayıtlar okunamadı. Bu oturumda devam edebilirsin.');
      setReady(true);
    });
  }, []);
  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => setStorageError('Cihazına kaydedilemedi. Kayıtlar yalnızca bu oturumda tutuluyor.'));
  }, [state, ready]);
  useEffect(() => {
    if (!ready) return undefined;
    const timer = setTimeout(() => {
      saveCloudState(state).then(result => {
        if (result?.ok) setCloudStatus('Bulut eşitleme güncel.');
        else if (result?.error) setCloudStatus('Bulut eşitleme bekliyor: ' + result.error.message);
      });
    }, 1300);
    return () => clearTimeout(timer);
  }, [state, ready]);
  const update = patch => setState(old => ({ ...old, ...(typeof patch === 'function' ? patch(old) : patch) }));
  const refreshFromCloud = async () => {
    const cloud = await loadCloudState();
    if (cloud.error) {
      setCloudStatus('Bulut kaydı okunamadı; yerel kayıtla devam ediliyor.');
      return { error: cloud.error };
    }
    if (cloud.state) {
      const nextState = migrateState(cloud.state, initialState);
      setState(nextState);
      setCloudStatus('Bulut kaydı bu cihaza indirildi.');
      return { ok: true, state: nextState };
    }
    const result = await saveCloudState(state);
    if (result?.ok) setCloudStatus('Bu cihazdaki kayıt buluta aktarıldı.');
    return result;
  };

  const addTrackerRecord = (params) => {
    const record = createTrackerRecord({
      ...params,
      householdId: state.household?.id || 'hh_local_1',
      createdBy: state.user?.id || 'user',
    });

    update(old => {
      const nextEvents = applyOptimisticCreate(old.trackerEvents || [], record);
      const legacyRecord = {
        id: record.id,
        type: record.title || record.type,
        value: record.value ? `${record.value} ${record.unit || ''}`.trim() : (record.notes || ''),
        time: new Date(record.occurredAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: record.occurredAt,
      };
      return {
        trackerEvents: nextEvents,
        records: [legacyRecord, ...(old.records || [])],
        lastUndoAction: { actionType: 'create', record, expiresAt: Date.now() + UNDO_TIMEOUT_MS },
      };
    });

    enqueueOfflineRecord(record).catch(() => {});
    saveTrackingEvent(record.type, { value: record.value, record }).catch(() => {});
    return record;
  };

  const updateTrackerRecord = (id, patch) => {
    update(old => {
      const nextEvents = applyOptimisticUpdate(old.trackerEvents || [], id, patch);
      return { trackerEvents: nextEvents };
    });
  };

  const deleteTrackerRecord = (id) => {
    update(old => {
      const { updatedList, deletedRecord } = applyOptimisticDelete(old.trackerEvents || [], id);
      return {
        trackerEvents: updatedList,
        records: (old.records || []).filter(r => r.id !== id),
        lastUndoAction: deletedRecord ? {
          actionType: 'delete',
          record: deletedRecord,
          expiresAt: Date.now() + UNDO_TIMEOUT_MS,
        } : old.lastUndoAction,
      };
    });
  };

  const undoLastAction = () => {
    update(old => {
      if (!old.lastUndoAction) return old;
      const nextEvents = applyUndoAction(old.trackerEvents || [], old.lastUndoAction);
      let nextRecords = old.records || [];
      if (old.lastUndoAction.actionType === 'delete' && old.lastUndoAction.record) {
        const r = old.lastUndoAction.record;
        nextRecords = [{
          id: r.id,
          type: r.title || r.type,
          value: r.value ? `${r.value} ${r.unit || ''}`.trim() : (r.notes || ''),
          time: new Date(r.occurredAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          createdAt: r.occurredAt,
        }, ...nextRecords];
      } else if (old.lastUndoAction.actionType === 'create' && old.lastUndoAction.record) {
        nextRecords = nextRecords.filter(r => r.id !== old.lastUndoAction.record.id);
      }
      return {
        trackerEvents: nextEvents,
        records: nextRecords,
        lastUndoAction: null,
      };
    });
  };

  const addRecord = (type, value) => {
    return addTrackerRecord({
      type,
      title: type,
      value,
    });
  };

  return {
    state,
    update,
    addRecord,
    addTrackerRecord,
    updateTrackerRecord,
    deleteTrackerRecord,
    undoLastAction,
    ready,
    storageError,
    cloudStatus,
    refreshFromCloud,
  };
}
