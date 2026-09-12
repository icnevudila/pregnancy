import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultLists, extendedDefaults, migrateState } from './domain.mjs';

const KEY = 'momora.local-demo.v1';
export const initialState = {
  mode: null, name: 'Zeynep', babyName: 'Ada', week: 24, water: 3, vitamin: false,
  mood: null, postpartumMood: null, lastMoodDate: null, tasks: [true, true, false, false, false],
  appointment: { title: 'Doktor randevun', date: '16 Mayıs Cuma', time: '10:00' },
  notes: [], records: [], favorites: [], liked: false, messages: [],
  // Extended state (tools & tracking)
  ...extendedDefaults,
};
export function useDemoStore() {
  const [state, setState] = useState(initialState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(null);
  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === 'object') {
          setState(migrateState(saved, initialState));
        }
      }
    }).catch(() => setStorageError('Önceki kayıtlar okunamadı. Bu oturumda devam edebilirsin.')).finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => setStorageError('Cihazına kaydedilemedi. Kayıtlar yalnızca bu oturumda tutuluyor.'));
  }, [state, ready]);
  const update = patch => setState(old => ({ ...old, ...(typeof patch === 'function' ? patch(old) : patch) }));
  const addRecord = (type, value) => update(old => ({ records: [{ id: Date.now().toString(), type, value, time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), createdAt: new Date().toISOString() }, ...old.records] }));
  return { state, update, addRecord, ready, storageError };
}
