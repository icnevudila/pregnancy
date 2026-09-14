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
  hasCompletedOnboarding: false,

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
function saveStateToLocalDisk(nextState) {
  try {
    const serialized = JSON.stringify(nextState);
    AsyncStorage.setItem(KEY, serialized).catch(() => {});
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(KEY, serialized);
    }
  } catch (err) {}
}

export function useMomoraStore() {
  const [state, setState] = useState(initialState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(null);
  const [cloudStatus, setCloudStatus] = useState(cloudStatusLabel());
  const [syncState, setSyncState] = useState('guest'); // 'guest' | 'saving' | 'synced' | 'offline'
  const [lastSavedAt, setLastSavedAt] = useState(new Date().toISOString());

  // 1. Initial Load: Check localStorage first for instant hydration, then AsyncStorage, then Cloud
  useEffect(() => {
    let loadedState = null;

    // Fast synchronous web localStorage check
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const direct = window.localStorage.getItem(KEY);
        if (direct) {
          const parsed = JSON.parse(direct);
          if (parsed && typeof parsed === 'object') {
            loadedState = migrateState(parsed, initialState);
          }
        }
      } catch (e) {}
    }

    AsyncStorage.getItem(KEY).then(raw => {
      let nextState = loadedState || initialState;
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
      setLastSavedAt(new Date().toISOString());

      // Background cloud sync check (never blocks UI)
      loadCloudState().then(cloud => {
        if (cloud?.error) {
          setCloudStatus('Bulut kaydı okunamadı; yerel kayıtla devam ediliyor.');
          setSyncState('offline');
        } else if (cloud?.state) {
          // Merge local guest updates with cloud snapshot so nothing is lost
          const merged = migrateState({ ...cloud.state, ...nextState }, initialState);
          setState(merged);
          saveStateToLocalDisk(merged);
          setCloudStatus('Bulut kaydı bu cihaza indirildi.');
          setSyncState('synced');
        } else if (cloud?.user) {
          setSyncState('synced');
        }
      }).catch(() => {
        setSyncState('offline');
      });
    }).catch(() => {
      if (loadedState) {
        setState(loadedState);
      } else {
        setStorageError('Önceki kayıtlar okunamadı. Bu oturumda devam edebilirsin.');
      }
      setReady(true);
    });
  }, []);

  // 2. Debounced Cloud Save
  useEffect(() => {
    if (!ready) return undefined;
    setSyncState('saving');
    const timer = setTimeout(() => {
      saveCloudState(state).then(result => {
        if (result?.ok) {
          setCloudStatus('Bulut eşitleme güncel.');
          setSyncState('synced');
          setLastSavedAt(new Date().toISOString());
        } else if (result?.skipped && result?.guest) {
          setCloudStatus('Misafir modu · Cihazda kaydedildi');
          setSyncState('guest');
        } else if (result?.error) {
          setCloudStatus('Bulut eşitleme bekliyor: ' + (result.error.message || 'Bağlantı'));
          setSyncState('offline');
        }
      }).catch(() => {
        setSyncState('offline');
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [state, ready]);

  // Immediate state update with synchronous disk write
  const update = patch => {
    setState(old => {
      const next = { ...old, ...(typeof patch === 'function' ? patch(old) : patch) };
      saveStateToLocalDisk(next);
      setLastSavedAt(new Date().toISOString());
      return next;
    });
  };

  const flushStateToDisk = () => {
    saveStateToLocalDisk(state);
    setLastSavedAt(new Date().toISOString());
  };

  const refreshFromCloud = async () => {
    setSyncState('saving');
    const cloud = await loadCloudState();
    if (cloud.error) {
      setCloudStatus('Bulut kaydı okunamadı; yerel kayıtla devam ediliyor.');
      setSyncState('offline');
      return { error: cloud.error };
    }
    if (cloud.state) {
      const nextState = migrateState({ ...cloud.state, ...state }, initialState);
      setState(nextState);
      saveStateToLocalDisk(nextState);
      setCloudStatus('Bulut kaydı bu cihaza indirildi.');
      setSyncState('synced');
      setLastSavedAt(new Date().toISOString());
      return { ok: true, state: nextState };
    }
    const result = await saveCloudState(state);
    if (result?.ok) {
      setCloudStatus('Bu cihazdaki kayıt buluta aktarıldı.');
      setSyncState('synced');
      setLastSavedAt(new Date().toISOString());
    }
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

  const exportAllUserData = () => {
    return {
      exportedAt: new Date().toISOString(),
      profile: {
        name: state.name,
        babyName: state.babyName,
        week: state.week,
        dueDate: state.dueDate,
        doctor: state.doctor,
        hospital: state.hospital,
        bloodType: state.bloodType,
      },
      vitals: {
        weights: state.weights || [],
        bloodPressureLogs: state.bloodPressureLogs || [],
        bloodGlucoseLogs: state.bloodGlucoseLogs || [],
        kickSessions: state.kickSessions || [],
        contractionSessions: state.contractionSessions || [],
        waterGlasses: state.waterGlasses || state.water || 8,
      },
      care: {
        babyVaccines: state.babyVaccines || {},
        babyTeeth: state.babyTeeth || {},
        solidFoodLogs: state.solidFoodLogs || {},
        babyGrowthLogs: state.babyGrowthLogs || [],
        babyMilestones: state.babyMilestones || {},
        tummyTimeSessions: state.tummyTimeSessions || [],
        kegelSessions: state.kegelSessions || [],
        doctorReports: state.doctorReports || [],
        savedStoryCards: state.savedStoryCards || [],
        notes: state.notes || [],
        records: state.records || [],
      },
    };
  };

  const resetStateToDefaults = () => {
    saveStateToLocalDisk(initialState);
    setState(initialState);
    setLastSavedAt(new Date().toISOString());
    setSyncState('guest');
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
    syncState,
    lastSavedAt,
    refreshFromCloud,
    flushStateToDisk,
    exportAllUserData,
    resetStateToDefaults,
  };
}
