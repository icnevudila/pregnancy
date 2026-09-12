import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultLists, extendedDefaults, migrateState } from './domain.mjs';
import { loadCloudState, saveCloudState, saveTrackingEvent, cloudStatusLabel } from './backendSync';

const KEY = 'momora.local.v1';
export const initialState = {
  mode: 'pregnancy', name: 'Zeynep', partnerName: 'Mehmet', role: 'mother', partnerRole: 'father',
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
  const addRecord = (type, value) => {
    const record = { id: Date.now().toString(), type, value, time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), createdAt: new Date().toISOString() };
    update(old => ({ records: [record, ...old.records] }));
    saveTrackingEvent(type, { value, record }).catch(() => {});
  };
  return { state, update, addRecord, ready, storageError, cloudStatus, refreshFromCloud };
}
