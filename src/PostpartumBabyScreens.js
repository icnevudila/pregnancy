import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section, Progress, ScreenHero, MetricCard, StatusCard, ProgressRing, ToolExperienceCard } from './ui';
import { secondsLabel, uid, localDay } from './domain.mjs';
import { generatedAssets } from './generatedAssets';
import { playSound, stopSound, setVolume as setEngineVolume, getCurrentSound, addSoundListener, playActionCue } from './soundEngine';
import { offlineSyncQueue } from './services/offlineSyncQueue';
import { createTrackerEvent } from './domain/types';
import { calculatePostpartumProgress } from './domain/journeyState';

// ─── EKRAN 22: EMZİRME / BİBERON / SAĞIM (FEEDING TRACKER PER SPEC 12_FEEDING) ───
export function NursingTimerScreen({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState('breast'); // 'breast' | 'bottle' | 'pump'
  
  // Breastfeeding State
  const initialFeeding = state?.activeFeeding || null;
  const initialElapsed = initialFeeding?.startedAt ? Math.max(0, Math.floor((Date.now() - initialFeeding.startedAt) / 1000)) : 0;
  const [activeSide, setActiveSide] = useState(initialFeeding?.side || null); // 'left' | 'right' | null
  const [lastSide, setLastSide] = useState(state.lastNursingSide || (isEn ? 'Right Breast' : 'Sağ Meme'));
  const [leftSecs, setLeftSecs] = useState(initialFeeding?.side === 'left' ? initialElapsed : 0);
  const [rightSecs, setRightSecs] = useState(initialFeeding?.side === 'right' ? initialElapsed : 0);
  const [isPaused, setIsPaused] = useState(false);

  // Bottle State
  const [bottleMl, setBottleMl] = useState(120);
  const [bottleType, setBottleType] = useState('breast_milk'); // 'breast_milk' | 'formula' | 'mixed'
  const [bottleNote, setBottleNote] = useState('');

  // Pumping State
  const [pumpLeftMl, setPumpLeftMl] = useState(60);
  const [pumpRightMl, setPumpRightMl] = useState(60);
  const [pumpMins, setPumpMins] = useState(15);
  const [pumpNote, setPumpNote] = useState('');

  // Undo & timers
  const [justSavedEntry, setJustSavedEntry] = useState(null);
  const [undoCountdown, setUndoCountdown] = useState(8);
  const timerRef = useRef(null);
  const startedAtRef = useRef(initialFeeding?.startedAt || null);
  const undoTimerRef = useRef(null);

  useEffect(() => {
    if (justSavedEntry) {
      setUndoCountdown(8);
      if (undoTimerRef.current) clearInterval(undoTimerRef.current);
      undoTimerRef.current = setInterval(() => {
        setUndoCountdown(c => {
          if (c <= 1) {
            clearInterval(undoTimerRef.current);
            setJustSavedEntry(null);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => { if (undoTimerRef.current) clearInterval(undoTimerRef.current); };
  }, [justSavedEntry]);

  // One-hand usable timer interval based on startedAt timestamp
  useEffect(() => {
    if (activeSide && !isPaused) {
      if (!startedAtRef.current) startedAtRef.current = Date.now();
      timerRef.current = setInterval(() => {
        if (activeSide === 'left') {
          setLeftSecs(s => s + 1);
        } else if (activeSide === 'right') {
          setRightSecs(s => s + 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeSide, isPaused]);

  function startNursing(side) {
    setActiveSide(side);
    setIsPaused(false);
    startedAtRef.current = Date.now();
    update({ activeFeeding: { side, startedAt: Date.now() } });
  }

  function switchSide() {
    const nextSide = activeSide === 'left' ? 'right' : 'left';
    setActiveSide(nextSide);
    startedAtRef.current = Date.now();
    update({ activeFeeding: { side: nextSide, startedAt: Date.now() } });
    toast && toast(isEn ? `Switched to ${nextSide === 'left' ? 'Left' : 'Right'} breast` : `${nextSide === 'left' ? 'Sol' : 'Sağ'} memeye geçildi`);
  }

  function handleUndoFeed() {
    if (!justSavedEntry) return;
    const targetId = justSavedEntry.id;
    update(old => ({
      records: (old.records || []).filter(r => r.id !== targetId),
    }));
    setJustSavedEntry(null);
    if (undoTimerRef.current) clearInterval(undoTimerRef.current);
    toast && toast(isEn ? 'Feeding log undone.' : 'Beslenme kaydı geri alındı.');
  }

  function finishNursing() {
    setActiveSide(null);
    setIsPaused(false);
    update({ activeFeeding: null });
    const totalSecs = leftSecs + rightSecs;
    if (totalSecs === 0) return;

    const totalMins = Math.max(1, Math.round(totalSecs / 60));
    const finalSide = rightSecs > leftSecs ? (isEn ? 'Right Breast' : 'Sağ Meme') : (isEn ? 'Left Breast' : 'Sol Meme');
    setLastSide(finalSide);

    const desc = leftSecs > 0 && rightSecs > 0
      ? (isEn ? `Left ${Math.round(leftSecs / 60)}m + Right ${Math.round(rightSecs / 60)}m (${totalMins}m total)` : `Sol ${Math.round(leftSecs / 60)} dk + Sağ ${Math.round(rightSecs / 60)} dk (Top. ${totalMins} dk)`)
      : (isEn ? `${finalSide} • ${totalMins} min` : `${finalSide} • ${totalMins} dk`);

    const newRecord = {
      id: uid(),
      type: 'Emzirme',
      value: desc,
      time: new Date().toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
    };

    update(old => ({
      lastNursingSide: finalSide,
      records: [newRecord, ...(old.records || [])],
    }));

    setJustSavedEntry(newRecord);
    offlineSyncQueue.enqueue(createTrackerEvent({
      type: 'breastfeeding',
      metadata: { side: finalSide, leftSecs, rightSecs, totalMins },
    })).catch(() => {});

    toast && toast(isEn ? `🍼 Nursing saved: ${totalMins} min` : `🍼 Emzirme kaydedildi: ${totalMins} dk`);
    setLeftSecs(0);
    setRightSecs(0);
  }

  function saveBottle() {
    const typeLabel = bottleType === 'breast_milk'
      ? (isEn ? 'Breast Milk' : 'Anne Sütü')
      : bottleType === 'formula'
      ? (isEn ? 'Formula' : 'Formül Mama')
      : (isEn ? 'Mixed' : 'Karışık');

    const desc = `${bottleMl} ml · ${typeLabel}${bottleNote ? ' · ' + bottleNote : ''}`;
    const newRecord = {
      id: uid(),
      type: 'Biberon',
      value: desc,
      time: new Date().toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
    };

    update(old => ({
      records: [newRecord, ...(old.records || [])],
    }));

    setJustSavedEntry(newRecord);
    offlineSyncQueue.enqueue(createTrackerEvent({
      type: 'bottle',
      metadata: { amountMl: bottleMl, bottleType, note: bottleNote },
    })).catch(() => {});

    toast && toast(isEn ? `🍼 Bottle logged: ${bottleMl} ml` : `🍼 Biberon kaydedildi: ${bottleMl} ml`);
    setBottleNote('');
  }

  function savePumping() {
    const totalMl = pumpLeftMl + pumpRightMl;
    const desc = `Sol ${pumpLeftMl} ml + Sağ ${pumpRightMl} ml (Toplam ${totalMl} ml)${pumpMins ? ` · ${pumpMins} dk` : ''}`;
    const newRecord = {
      id: uid(),
      type: 'Biberon',
      value: desc,
      time: new Date().toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
    };

    update(old => ({
      records: [newRecord, ...(old.records || [])],
    }));

    setJustSavedEntry(newRecord);
    toast && toast(isEn ? `⚡ Pumping logged: ${totalMl} ml` : `⚡ Sağım kaydedildi: ${totalMl} ml`);
  }

  const records = state?.records || [];
  const feedRecordsToday = records.filter(r => r.type === 'Emzirme' || r.type === 'Biberon');

  return (
    <View style={pbs.container}>
      <ScreenHero
        kicker={isEn ? 'NUTRITION & RHYTHM' : 'BESLENME & RİTİM'}
        title={isEn ? 'Feeding, Nursing & Pumping' : 'Emzirme, Biberon ve Sağım'}
        body={isEn ? 'Designed for 03:00 one-hand use. Track sides, bottle volume, and milk expression seamlessly.' : 'Gece 03:00’te tek elle kullanıma uygun sade tasarım. Meme tarafı, süre, biberon ve sağımı zahmetsizce kaydedin.'}
        icon="nursing"
        asset="ui_nursing_dual_timer"
        stat={`${feedRecordsToday.length} ${isEn ? 'feeds today' : 'beslenme bugün'}`}
        tint="#B66C7E"
      />

      {/* 3'lü Mod Seçici Tablar (Spec 12_FEEDING) */}
      <View style={{ flexDirection: 'row', backgroundColor: '#F6EFF4', borderRadius: 16, padding: 4 }}>
        {[
          { id: 'breast', label: isEn ? 'Breastfeeding' : 'Emzirme', icon: 'nursing' },
          { id: 'bottle', label: isEn ? 'Bottle' : 'Biberon', icon: 'bottle' },
          { id: 'pump', label: isEn ? 'Pumping' : 'Süt Sağımı', icon: 'drop' },
        ].map(tab => (
          <Tap
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              borderRadius: 12,
              backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
              elevation: activeTab === tab.id ? 2 : 0,
            }}
          >
            <T bold={activeTab === tab.id} style={{ fontSize: 13, color: activeTab === tab.id ? colors.purple : colors.muted }}>
              {tab.label}
            </T>
          </Tap>
        ))}
      </View>

      {/* Anında Kayıt ve 8 sn Geri Al (Undo) */}
      {justSavedEntry && (
        <Card style={{ backgroundColor: '#EEF7EE', borderColor: '#84B886', borderWidth: 1.5, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <T bold style={{ fontSize: 13.5, color: '#2D6632' }}>
              {isEn ? '✓ Feeding Logged' : '✓ Beslenme Kaydedildi'} · {justSavedEntry.value}
            </T>
            <T style={{ fontSize: 11, color: '#4E8855' }}>
              {isEn ? `Tap Undo to cancel (${undoCountdown}s)` : `Geri almak için dokun (${undoCountdown} sn)`}
            </T>
          </View>
          <Tap onPress={handleUndoFeed} style={{ backgroundColor: '#2D6632', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 }}>
            <T bold style={{ fontSize: 12, color: 'white' }}>{isEn ? 'Undo' : 'Geri Al'}</T>
          </Tap>
        </Card>
      )}

      {/* ─── TAB 1: EMZİRME DUAL TIMER (ONE-HAND USABLE) ─── */}
      {activeTab === 'breast' && (
        <>
          {/* Son Meme Hatırlatıcısı */}
          <Card style={{ padding: 12, backgroundColor: '#FDF7F9', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderColor: '#F2DDE6' }}>
            <T style={{ fontSize: 12, color: colors.muted }}>
              {isEn ? 'Last nursed side:' : 'En son emzirilen taraf:'}
            </T>
            <T bold style={{ fontSize: 13, color: '#9E3A66' }}>
              {lastSide}
            </T>
          </Card>

          {/* Çift Meme Sayacı Kartı */}
          <Card style={{ padding: 20, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 16, width: '100%', justifyContent: 'center' }}>
              {/* Sol Meme */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <T bold style={{ fontSize: 15, color: colors.ink }}>{isEn ? 'Left Breast' : 'Sol Meme'}</T>
                <T bold style={{ fontSize: 32, color: activeSide === 'left' ? '#B64A75' : colors.ink, marginVertical: 8 }}>
                  {secondsLabel(leftSecs)}
                </T>
                {activeSide === 'left' ? (
                  <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, backgroundColor: '#FCEEF3' }}>
                    <T bold style={{ fontSize: 11, color: '#B64A75' }}>{isEn ? '● Active' : '● Aktif'}</T>
                  </View>
                ) : (
                  <Tap
                    onPress={() => startNursing('left')}
                    style={{ backgroundColor: '#B64A75', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14, width: '100%', alignItems: 'center' }}
                  >
                    <T bold style={{ color: 'white', fontSize: 13 }}>{isEn ? 'Start Left' : 'Sol Başlat'}</T>
                  </Tap>
                )}
              </View>

              <View style={{ width: 1, backgroundColor: '#EFE7ED' }} />

              {/* Sağ Meme */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <T bold style={{ fontSize: 15, color: colors.ink }}>{isEn ? 'Right Breast' : 'Sağ Meme'}</T>
                <T bold style={{ fontSize: 32, color: activeSide === 'right' ? '#B64A75' : colors.ink, marginVertical: 8 }}>
                  {secondsLabel(rightSecs)}
                </T>
                {activeSide === 'right' ? (
                  <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, backgroundColor: '#FCEEF3' }}>
                    <T bold style={{ fontSize: 11, color: '#B64A75' }}>{isEn ? '● Active' : '● Aktif'}</T>
                  </View>
                ) : (
                  <Tap
                    onPress={() => startNursing('right')}
                    style={{ backgroundColor: '#B64A75', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14, width: '100%', alignItems: 'center' }}
                  >
                    <T bold style={{ color: 'white', fontSize: 13 }}>{isEn ? 'Start Right' : 'Sağ Başlat'}</T>
                  </Tap>
                )}
              </View>
            </View>

            {/* Aktif Seans Kontrolleri */}
            {activeSide && (
              <View style={{ width: '100%', marginTop: 20, gap: 10 }}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Tap
                    onPress={switchSide}
                    style={{ flex: 1, backgroundColor: '#F2E6ED', paddingVertical: 12, borderRadius: 14, alignItems: 'center' }}
                  >
                    <T bold style={{ color: '#9E3A66', fontSize: 13 }}>
                      {isEn ? '⇄ Switch Side' : '⇄ Tarafı Değiştir'}
                    </T>
                  </Tap>
                  <Tap
                    onPress={() => setIsPaused(!isPaused)}
                    style={{ flex: 1, backgroundColor: '#F0ECEE', paddingVertical: 12, borderRadius: 14, alignItems: 'center' }}
                  >
                    <T bold style={{ color: colors.ink, fontSize: 13 }}>
                      {isPaused ? (isEn ? '▶ Resume' : '▶ Devam Et') : (isEn ? '⏸ Pause' : '⏸ Duraklat')}
                    </T>
                  </Tap>
                </View>

                <Tap
                  onPress={finishNursing}
                  style={{ backgroundColor: '#2E663B', paddingVertical: 14, borderRadius: 14, alignItems: 'center' }}
                >
                  <T bold style={{ color: 'white', fontSize: 15 }}>
                    {isEn ? '✓ Finish Nursing Session' : '✓ Emzirmeyi Tamamla'}
                  </T>
                </Tap>
              </View>
            )}
          </Card>
        </>
      )}

      {/* ─── TAB 2: BİBERON (QUICK PRESETS & DIRECT INPUT) ─── */}
      {activeTab === 'bottle' && (
        <Card style={{ padding: 18, gap: 14 }}>
          <T bold style={{ fontSize: 15, color: colors.ink }}>
            {isEn ? 'Bottle Feed Amount' : 'Biberon Miktarı'}
          </T>

          {/* Hazır ml Butonları */}
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {[60, 90, 120, 150, 180].map(ml => (
              <Tap
                key={ml}
                onPress={() => setBottleMl(ml)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 12,
                  backgroundColor: bottleMl === ml ? colors.purple : '#F6EFF8',
                }}
              >
                <T bold={bottleMl === ml} style={{ color: bottleMl === ml ? 'white' : colors.ink, fontSize: 13 }}>
                  {ml} ml
                </T>
              </Tap>
            ))}
          </View>

          {/* Süt Tipi Seçici */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { id: 'breast_milk', label: isEn ? 'Breast Milk' : 'Anne Sütü' },
              { id: 'formula', label: isEn ? 'Formula' : 'Mama' },
              { id: 'mixed', label: isEn ? 'Mixed' : 'Karışık' },
            ].map(type => (
              <Tap
                key={type.id}
                onPress={() => setBottleType(type.id)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: bottleType === type.id ? '#EDE4EF' : '#F9F5FA',
                  borderWidth: 1,
                  borderColor: bottleType === type.id ? colors.purple : '#EADCEE',
                }}
              >
                <T bold={bottleType === type.id} style={{ fontSize: 12, color: bottleType === type.id ? colors.purple : colors.muted }}>
                  {type.label}
                </T>
              </Tap>
            ))}
          </View>

          <Tap
            onPress={saveBottle}
            style={{ backgroundColor: colors.purple, paddingVertical: 14, borderRadius: 14, alignItems: 'center' }}
          >
            <T bold style={{ color: 'white', fontSize: 14 }}>
              {isEn ? `Save ${bottleMl} ml Bottle` : `${bottleMl} ml Biberon Kaydet`}
            </T>
          </Tap>
        </Card>
      )}

      {/* ─── TAB 3: SAĞIM (PUMPING) ─── */}
      {activeTab === 'pump' && (
        <Card style={{ padding: 18, gap: 14 }}>
          <T bold style={{ fontSize: 15, color: colors.ink }}>
            {isEn ? 'Expressed Milk (Pumping)' : 'Süt Sağımı Kaydı'}
          </T>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: '#F8F4F9', alignItems: 'center' }}>
              <T style={{ fontSize: 12, color: colors.muted }}>{isEn ? 'Left Breast' : 'Sol Meme'}</T>
              <T bold style={{ fontSize: 24, color: colors.ink, marginVertical: 4 }}>{pumpLeftMl} ml</T>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Tap onPress={() => setPumpLeftMl(m => Math.max(0, m - 10))} style={{ padding: 6, backgroundColor: '#EAE0ED', borderRadius: 8 }}>
                  <T bold style={{ fontSize: 12 }}>-10</T>
                </Tap>
                <Tap onPress={() => setPumpLeftMl(m => m + 10)} style={{ padding: 6, backgroundColor: '#EAE0ED', borderRadius: 8 }}>
                  <T bold style={{ fontSize: 12 }}>+10</T>
                </Tap>
              </View>
            </View>

            <View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: '#F8F4F9', alignItems: 'center' }}>
              <T style={{ fontSize: 12, color: colors.muted }}>{isEn ? 'Right Breast' : 'Sağ Meme'}</T>
              <T bold style={{ fontSize: 24, color: colors.ink, marginVertical: 4 }}>{pumpRightMl} ml</T>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Tap onPress={() => setPumpRightMl(m => Math.max(0, m - 10))} style={{ padding: 6, backgroundColor: '#EAE0ED', borderRadius: 8 }}>
                  <T bold style={{ fontSize: 12 }}>-10</T>
                </Tap>
                <Tap onPress={() => setPumpRightMl(m => m + 10)} style={{ padding: 6, backgroundColor: '#EAE0ED', borderRadius: 8 }}>
                  <T bold style={{ fontSize: 12 }}>+10</T>
                </Tap>
              </View>
            </View>
          </View>

          <Tap
            onPress={savePumping}
            style={{ backgroundColor: colors.purple, paddingVertical: 14, borderRadius: 14, alignItems: 'center' }}
          >
            <T bold style={{ color: 'white', fontSize: 14 }}>
              {isEn ? `Save ${pumpLeftMl + pumpRightMl} ml Expressed Milk` : `Toplam ${pumpLeftMl + pumpRightMl} ml Sağımı Kaydet`}
            </T>
          </Tap>
        </Card>
      )}

      {/* Günlük Beslenme Geçmişi */}
      <Section title={isEn ? "Today's Feeding Timeline" : "Bugünkü Beslenme Kayıtları"} />
      {feedRecordsToday.length === 0 ? (
        <Card style={{ alignItems: 'center', padding: 20 }}>
          <T style={{ color: colors.muted, fontSize: 13 }}>
            {isEn ? 'No feeding records logged yet today.' : 'Bugün henüz beslenme kaydı girilmedi.'}
          </T>
        </Card>
      ) : (
        feedRecordsToday.map(r => (
          <Card key={r.id} style={{ padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8EEF5', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={r.type === 'Emzirme' ? 'nursing' : 'bottle'} size={18} color="#B66C7E" />
              </View>
              <View>
                <T bold style={{ fontSize: 14, color: colors.ink }}>{r.type}</T>
                <T style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{r.value}</T>
              </View>
            </View>
            <T style={{ fontSize: 12, color: colors.muted }}>{r.time}</T>
          </Card>
        ))
      )}
    </View>
  );
}

// ─── EKRAN 23: UYKU & BEYAZ GÜRÜLTÜ (SPEC 13_SLEEP_WHITE_NOISE) ────────────────
export function SleepWhiteNoiseScreen({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState('sleep'); // 'sleep' | 'sounds'
  const [playingNoise, setPlayingNoise] = useState(null);
  const [volume, setVolume] = useState(0.8);
  const [timerMins, setTimerMins] = useState(30);
  const [timerEndTime, setTimerEndTime] = useState(null);
  const [remainingSecs, setRemainingSecs] = useState(0);

  function getEstimatedOffTime(mins) {
    if (!mins) return null;
    const d = new Date(Date.now() + mins * 60 * 1000);
    return d.toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' });
  }

  // Live countdown ticker
  useEffect(() => {
    let interval = null;
    if (playingNoise && timerEndTime) {
      function tick() {
        const diff = Math.max(0, Math.round((timerEndTime - Date.now()) / 1000));
        setRemainingSecs(diff);
        if (diff <= 0) {
          setTimerEndTime(null);
        }
      }
      tick();
      interval = setInterval(tick, 1000);
    } else {
      setRemainingSecs(0);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [playingNoise, timerEndTime]);

  function handleSelectTimer(m) {
    setTimerMins(m);
    playActionCue && playActionCue('soft');
    if (m === 0) {
      setTimerEndTime(null);
      if (playingNoise) {
        playSound(playingNoise, { volume, timerMinutes: 0 });
      }
      toast && toast(isEn ? '♾️ Continuous playback selected (stays on)' : '♾️ Kesintisiz çalma seçildi (siz durdurana kadar devam eder)');
    } else {
      const offTime = getEstimatedOffTime(m);
      if (playingNoise) {
        const newEnd = Date.now() + m * 60 * 1000;
        setTimerEndTime(newEnd);
        playSound(playingNoise, { volume, timerMinutes: m });
      }
      toast && toast(isEn ? `🕒 Timer set: Turns off at ${offTime} (${m} min)` : `🕒 Zamanlayıcı: Saat ${offTime}'te otomatik kapanacak (${m} dk)`);
    }
  }

  // Sleep tracking state (tracker-data driven)
  const isAsleep = !!state?.activeSleep;
  const [sleepElapsedSecs, setSleepElapsedSecs] = useState(0);
  const sleepTimerRef = useRef(null);

  useEffect(() => {
    if (state?.activeSleep?.startedAt) {
      function updateSleepSecs() {
        const diff = Math.max(0, Math.round((Date.now() - state.activeSleep.startedAt) / 1000));
        setSleepElapsedSecs(diff);
      }
      updateSleepSecs();
      sleepTimerRef.current = setInterval(updateSleepSecs, 1000);
    } else {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
      setSleepElapsedSecs(0);
    }
    return () => { if (sleepTimerRef.current) clearInterval(sleepTimerRef.current); };
  }, [state?.activeSleep]);

  const whiteNoises = isEn ? [
    { id: 'womb', name: 'Womb Rhythm', icon: 'heart', desc: 'Blood flow & maternal heartbeat' },
    { id: 'lullaby', name: 'Classic Music Box Lullaby', icon: 'heart', desc: 'Gentle celesta & baby lullaby' },
    { id: 'lofi', name: 'Momora Lo-fi Radio', icon: 'music', desc: 'Warm comforting acoustic beats' },
    { id: 'shh', name: 'Rhythmic Shh', icon: 'star', desc: 'Gentle soothing whisper shh' },
    { id: 'rain', name: 'Gentle Rain', icon: 'drop', desc: 'Serene rainfall nature sound' },
    { id: 'fan', name: 'Fan & Airflow', icon: 'milestone', desc: 'Continuous calm soothing air hum' },
    { id: 'ocean', name: 'Ocean Surf', icon: 'water', desc: 'Peaceful rolling sea waves' },
    { id: 'stream', name: 'Mountain Brook', icon: 'water', desc: 'Soothing bubbling river water' },
    { id: 'birds', name: 'Forest Birds', icon: 'leaf', desc: 'Peaceful morning canopy birds' },
    { id: 'fire', name: 'Cozy Fireplace', icon: 'heart', desc: 'Warm embers & gentle crackle' },
    { id: 'tibetan', name: '432 Hz Healing Bowl', icon: 'star', desc: 'Harmonic deep relaxation tone' },
  ] : [
    { id: 'womb', name: 'Anne Karnı Sesi', icon: 'heart', desc: 'Amniyotik sıvı ve kalp ritmi' },
    { id: 'lullaby', name: 'Dandini Dandini · Ninni Kutusu', icon: 'heart', desc: 'Geleneksel huzurlu müzik kutusu ninnisi' },
    { id: 'lofi', name: 'Momora Lo-fi Radyo', icon: 'music', desc: 'Sıcak ve dinlendirici huzur melodisi' },
    { id: 'shh', name: 'Pişt Pişt / Shh', icon: 'star', desc: 'Yatıştırıcı ritmik fısıltı melodisi' },
    { id: 'rain', name: 'Ilık Yağmur', icon: 'drop', desc: 'Dingin ve rahatlatıcı doğa sesi' },
    { id: 'fan', name: 'Vantilatör & Hava Akımı', icon: 'milestone', desc: 'Sürekli sakin derin beyaz gürültü' },
    { id: 'ocean', name: 'Okyanus Dalgaları', icon: 'water', desc: 'Kıyıya vuran huzurlu dalgalar' },
    { id: 'stream', name: 'Dağ Deresi & Su Şırıltısı', icon: 'water', desc: 'Rahatlatıcı dingin su akıntısı' },
    { id: 'birds', name: 'Orman Sabahı & Kuş Sesleri', icon: 'leaf', desc: 'Ağaçlar arasında dingin kuş cıvıltıları' },
    { id: 'fire', name: 'Şömine Çıtırtısı', icon: 'heart', desc: 'Kütük çıtırtısı ve sıcacık huzur' },
    { id: 'tibetan', name: '432 Hz Tibet Şifa Çanı', icon: 'star', desc: 'Derin hücresel gevşeme ve sakinlik frekansı' },
  ];

  useEffect(() => {
    const unsub = addSoundListener(({ soundId, isPlaying }) => {
      setPlayingNoise(isPlaying ? soundId : null);
      if (!isPlaying) setTimerEndTime(null);
    });
    const current = getCurrentSound();
    if (current.isPlaying) {
      setPlayingNoise(current.soundId);
    }
    return () => {
      unsub();
      stopSound();
    };
  }, []);

  function handlePlayToggle(id) {
    if (playingNoise === id) {
      stopSound();
      setTimerEndTime(null);
      toast && toast(isEn ? '⏹️ Sound stopped' : '⏹️ Ses durduruldu');
    } else {
      playSound(id, { volume, timerMinutes: timerMins });
      const found = whiteNoises.find(w => w.id === id);
      if (timerMins > 0) {
        const end = Date.now() + timerMins * 60 * 1000;
        setTimerEndTime(end);
        const offTime = getEstimatedOffTime(timerMins);
        toast && toast(isEn
          ? `🎵 Playing ${found ? found.name : 'Sound'} · Turns off at ${offTime} (${timerMins} min) 🕒`
          : `🎵 ${found ? found.name : 'Ses'} çalınıyor · Saat ${offTime}'te kapanacak (${timerMins} dk) 🕒`);
      } else {
        setTimerEndTime(null);
        toast && toast(isEn
          ? `🎵 Playing ${found ? found.name : 'Sound'} · Continuous playback ♾️`
          : `🎵 ${found ? found.name : 'Ses'} çalınıyor · Kesintisiz çalma ♾️`);
      }
    }
  }

  function toggleSleepSession() {
    if (!isAsleep) {
      // UYUDU (Baby fell asleep)
      const now = Date.now();
      update({ activeSleep: { startedAt: now } });
      toast && toast(isEn ? '💤 Baby logged as asleep' : '💤 Bebek uykuya daldı');
    } else {
      // UYANDI (Baby woke up)
      const now = Date.now();
      const startedAt = state?.activeSleep?.startedAt || now;
      const durationSecs = Math.max(60, Math.round((now - startedAt) / 1000));
      const durationMins = Math.round(durationSecs / 60);
      const hours = Math.floor(durationMins / 60);
      const mins = durationMins % 60;
      const timeStr = hours > 0
        ? (isEn ? `${hours}h ${mins}m` : `${hours} sa ${mins} dk`)
        : (isEn ? `${mins} min` : `${mins} dk`);

      const newRecord = {
        id: uid(),
        type: 'Uyku',
        value: isEn ? `Slept ${timeStr}` : `${timeStr} uyudu`,
        time: new Date().toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
      };

      update(old => ({
        activeSleep: null,
        records: [newRecord, ...(old.records || [])],
      }));

      offlineSyncQueue.enqueue(createTrackerEvent({
        type: 'sleep',
        metadata: { durationSecs, durationMins },
      })).catch(() => {});

      toast && toast(isEn ? `☀️ Baby woke up (${timeStr})` : `☀️ Bebek uyandı (${timeStr})`);
    }
  }

  const sleepRecords = (state?.records || []).filter(r => r.type === 'Uyku');

  return (
    <View style={pbs.container}>
      <ScreenHero
        kicker={isEn ? 'REST & CALM' : 'DİNLENME & UYKU'}
        title={isEn ? 'Sleep Tracker & White Noise' : 'Uyku Takibi & Beyaz Gürültü'}
        body={isEn ? 'Track sleep intervals cleanly and play soothing nature sounds without screen clutter.' : 'Uyanıklık ve uyku pencerelerini takip edin, bebeği rahatlatan sakin frekansları çalın.'}
        icon="moon"
        asset="ui_white_noise_headphones"
        stat={isAsleep ? (isEn ? 'Baby is asleep' : 'Bebek uykuda') : (isEn ? 'Baby is awake' : 'Bebek uyanık')}
        tint="#4F6D96"
      />

      {/* 2 Temiz Tab: Uyku Takibi vs Beyaz Gürültü (Spec 13_SLEEP_WHITE_NOISE) */}
      <View style={{ flexDirection: 'row', backgroundColor: '#EDF2F7', borderRadius: 16, padding: 4 }}>
        <Tap
          onPress={() => setActiveTab('sleep')}
          style={{
            flex: 1,
            paddingVertical: 10,
            alignItems: 'center',
            borderRadius: 12,
            backgroundColor: activeTab === 'sleep' ? 'white' : 'transparent',
            elevation: activeTab === 'sleep' ? 2 : 0,
          }}
        >
          <T bold={activeTab === 'sleep'} style={{ fontSize: 13, color: activeTab === 'sleep' ? '#3B597F' : colors.muted }}>
            {isEn ? '💤 Sleep Tracker' : '💤 Uyku Takibi'}
          </T>
        </Tap>
        <Tap
          onPress={() => setActiveTab('sounds')}
          style={{
            flex: 1,
            paddingVertical: 10,
            alignItems: 'center',
            borderRadius: 12,
            backgroundColor: activeTab === 'sounds' ? 'white' : 'transparent',
            elevation: activeTab === 'sounds' ? 2 : 0,
          }}
        >
          <T bold={activeTab === 'sounds'} style={{ fontSize: 13, color: activeTab === 'sounds' ? '#3B597F' : colors.muted }}>
            {isEn ? '🎵 White Noise' : '🎵 Beyaz Gürültü'}
          </T>
        </Tap>
      </View>

      {/* ─── TAB 1: UYKU TAKİBİ (IDLE: UYUDU / ACTIVE: UYANDI) ─── */}
      {activeTab === 'sleep' && (
        <>
          <Card style={{ padding: 24, alignItems: 'center', borderRadius: 24, backgroundColor: isAsleep ? '#F0F4FA' : 'white', borderColor: isAsleep ? '#3B597F' : '#E6ECF2', borderWidth: 1.5 }}>
            {isAsleep ? (
              <View style={{ alignItems: 'center', width: '100%' }}>
                <T bold style={{ fontSize: 13, color: '#3B597F', letterSpacing: 1 }}>
                  {isEn ? '● BABY IS ASLEEP' : '● BEBEK UYUYOR'}
                </T>
                <T bold style={{ fontSize: 44, color: '#264268', marginVertical: 10 }}>
                  {secondsLabel(sleepElapsedSecs)}
                </T>
                <T style={{ fontSize: 12, color: colors.muted, marginBottom: 18 }}>
                  {isEn ? 'Tracking restorative nap & night sleep' : 'Dinlendirici uyku penceresi kaydediliyor'}
                </T>
                <Tap
                  onPress={toggleSleepSession}
                  style={{ width: '100%', maxWidth: 260, backgroundColor: '#2E663B', paddingVertical: 14, borderRadius: 16, alignItems: 'center' }}
                >
                  <T bold style={{ color: 'white', fontSize: 16 }}>
                    {isEn ? '☀️ UYANDI (Baby Woke Up)' : '☀️ UYANDI'}
                  </T>
                </Tap>
              </View>
            ) : (
              <View style={{ alignItems: 'center', width: '100%' }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#EDF3FA', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Icon name="moon" size={32} color="#3B597F" />
                </View>
                <T bold style={{ fontSize: 16, color: colors.ink }}>
                  {isEn ? 'Baby is currently awake' : 'Bebek şu an uyanık'}
                </T>
                <T style={{ fontSize: 12, color: colors.muted, marginTop: 4, marginBottom: 18 }}>
                  {isEn ? 'Tap below when your baby drifts off to sleep' : 'Bebeğiniz uykuya daldığında dokunun'}
                </T>
                <Tap
                  onPress={toggleSleepSession}
                  style={{ width: '100%', maxWidth: 260, backgroundColor: '#3B597F', paddingVertical: 14, borderRadius: 16, alignItems: 'center' }}
                >
                  <T bold style={{ color: 'white', fontSize: 16 }}>
                    {isEn ? '💤 UYUDU (Fell Asleep)' : '💤 UYUDU'}
                  </T>
                </Tap>
              </View>
            )}
          </Card>

          {/* 24 Saatlik Uyku Geçmişi */}
          <Section title={isEn ? "24h Sleep Logs" : "Son Uyku Kayıtları"} />
          {sleepRecords.length === 0 ? (
            <Card style={{ alignItems: 'center', padding: 20 }}>
              <T style={{ color: colors.muted, fontSize: 13 }}>
                {isEn ? 'No sleep sessions recorded yet today.' : 'Bugün henüz uyku seansı kaydedilmedi.'}
              </T>
            </Card>
          ) : (
            sleepRecords.map(r => (
              <Card key={r.id} style={{ padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#EDF3FA', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="moon" size={16} color="#3B597F" />
                  </View>
                  <T bold style={{ fontSize: 14, color: colors.ink }}>{r.value}</T>
                </View>
                <T style={{ fontSize: 12, color: colors.muted }}>{r.time}</T>
              </Card>
            ))
          )}
        </>
      )}

      {/* ─── TAB 2: BEYAZ GÜRÜLTÜ SESLERİ & PLAYER ─── */}
      {activeTab === 'sounds' && (
        <>
          <Card style={{ padding: 14, backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="clock" size={16} color="#3B597F" />
                <T bold style={{ fontSize: 14, color: '#1E293B' }}>
                  {isEn ? 'Auto-Off Timer' : 'Kapanma Zamanlayıcısı'}
                </T>
              </View>
              {timerMins > 0 ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#E0F2FE', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 }}>
                  <Icon name="clock" size={12} color="#0284C7" />
                  <T bold style={{ fontSize: 12, color: '#0369A1' }}>
                    {isEn ? `Off at ${getEstimatedOffTime(timerMins)}` : `Bitiş Saati: ${getEstimatedOffTime(timerMins)}`}
                  </T>
                </View>
              ) : (
                <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 }}>
                  <T bold style={{ fontSize: 11, color: '#64748B' }}>
                    {isEn ? 'Continuous ♾️' : 'Kesintisiz ♾️'}
                  </T>
                </View>
              )}
            </View>

            {/* Timer Pills */}
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              {[15, 30, 45, 60, 0].map(m => (
                <Tap
                  key={m}
                  onPress={() => handleSelectTimer(m)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: timerMins === m ? '#3B597F' : '#EDF2F7',
                    minWidth: 54,
                    alignItems: 'center',
                  }}
                >
                  <T bold={timerMins === m} style={{ fontSize: 12, color: timerMins === m ? 'white' : colors.ink }}>
                    {m === 0 ? (isEn ? '♾️ Sürekli' : '♾️ Sürekli') : `${m} dk`}
                  </T>
                </Tap>
              ))}
              {playingNoise && timerMins > 0 && (
                <Tap
                  onPress={() => handleSelectTimer(timerMins + 15)}
                  style={{
                    paddingHorizontal: 11,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: '#E0E7FF',
                    alignItems: 'center',
                  }}
                >
                  <T bold style={{ fontSize: 12, color: '#4338CA' }}>+15 dk</T>
                </Tap>
              )}
            </View>

            {/* Live Status & Clock Ticker Box */}
            <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <T style={{ fontSize: 12, color: colors.muted }}>
                  {timerMins > 0 ? (
                    isEn
                      ? `🕒 Stops at ${getEstimatedOffTime(timerMins)} (${timerMins} min)`
                      : `🕒 Saat ${getEstimatedOffTime(timerMins)}'te otomatik kapanacak (${timerMins} dk)`
                  ) : (
                    isEn
                      ? '♾️ Playing continuously until you stop it'
                      : '♾️ Ses siz durdurana kadar kesintisiz çalacak'
                  )}
                </T>
              </View>
              {playingNoise && timerEndTime && remainingSecs > 0 && (
                <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#16A34A' }} />
                  <T bold style={{ fontSize: 12, color: '#15803D' }}>
                    {Math.floor(remainingSecs / 60).toString().padStart(2, '0')}:{(remainingSecs % 60).toString().padStart(2, '0')}
                  </T>
                </View>
              )}
            </View>
          </Card>

          <View style={{ gap: 10 }}>
            {whiteNoises.map(noise => {
              const isPlaying = playingNoise === noise.id;
              return (
                <Card key={noise.id} style={{ padding: 14, borderColor: isPlaying ? '#3B597F' : '#EAEFF4', borderWidth: isPlaying ? 1.5 : 1, backgroundColor: isPlaying ? '#F8FAFC' : 'white' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {isPlaying && <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#16A34A' }} />}
                        <T bold style={{ fontSize: 15, color: isPlaying ? '#1E3A8A' : colors.ink }}>
                          {noise.name}
                        </T>
                      </View>
                      <T style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                        {noise.desc}
                      </T>
                      {isPlaying && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                          <View style={{ backgroundColor: '#E0F2FE', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                            <T bold style={{ fontSize: 11, color: '#0369A1' }}>
                              {timerMins > 0 ? `🕒 Bitiş: ${getEstimatedOffTime(timerMins)}` : '♾️ Kesintisiz'}
                            </T>
                          </View>
                          {timerEndTime && remainingSecs > 0 && (
                            <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                              <T bold style={{ fontSize: 11, color: '#15803D' }}>
                                {Math.floor(remainingSecs / 60).toString().padStart(2, '0')}:{(remainingSecs % 60).toString().padStart(2, '0')}
                              </T>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                    <Tap
                      onPress={() => handlePlayToggle(noise.id)}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: isPlaying ? '#27476F' : '#EDF2F7',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name={isPlaying ? 'pause' : 'play'} size={20} color={isPlaying ? 'white' : '#3B597F'} />
                    </Tap>
                  </View>
                </Card>
              );
            })}
          </View>

          {/* Canlı Ekran Oynatıcı & Bitiş Saati Barı */}
          {playingNoise && (
            <View style={{
              backgroundColor: '#1E293B',
              borderRadius: 18,
              padding: 14,
              marginTop: 12,
              marginBottom: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              borderWidth: 1,
              borderColor: '#334155',
            }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' }} />
                  <T bold style={{ color: 'white', fontSize: 14 }} numberOfLines={1}>
                    {whiteNoises.find(w => w.id === playingNoise)?.name || (isEn ? 'Sound' : 'Ses')}
                  </T>
                </View>
                <T style={{ color: '#94A3B8', fontSize: 12, marginTop: 3 }}>
                  {timerMins > 0
                    ? (isEn
                        ? `🕒 Auto-off at ${getEstimatedOffTime(timerMins)} · ⏱️ ${Math.floor(remainingSecs / 60).toString().padStart(2, '0')}:${(remainingSecs % 60).toString().padStart(2, '0')} left`
                        : `🕒 Saat ${getEstimatedOffTime(timerMins)}'te kapanacak · ⏱️ Kalan: ${Math.floor(remainingSecs / 60).toString().padStart(2, '0')}:${(remainingSecs % 60).toString().padStart(2, '0')}`)
                    : (isEn ? '♾️ Continuous playback (stays on)' : '♾️ Kesintisiz çalma (durdurana kadar)')}
                </T>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {timerMins > 0 && (
                  <Tap
                    onPress={() => handleSelectTimer(timerMins + 15)}
                    style={{
                      backgroundColor: '#334155',
                      paddingHorizontal: 11,
                      paddingVertical: 7,
                      borderRadius: 10,
                    }}
                  >
                    <T bold style={{ color: '#E2E8F0', fontSize: 11 }}>+15 dk</T>
                  </Tap>
                )}
                <Tap
                  onPress={() => handlePlayToggle(playingNoise)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#EF4444',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="close" size={18} color="white" />
                </Tap>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

// ─── EKRAN 24: BEZ DEĞİŞTİRME GÜNLÜĞÜ (FAST ACTION PER SPEC 14_DIAPER) ─────────
export function DiaperTrackerScreen({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [justSavedDiaper, setJustSavedDiaper] = useState(null);
  const [undoCountdown, setUndoCountdown] = useState(8);
  const [showColorGuide, setShowColorGuide] = useState(false);
  const [selectedStoolColor, setSelectedStoolColor] = useState(null);
  const undoTimerRef = useRef(null);

  useEffect(() => {
    if (justSavedDiaper) {
      setUndoCountdown(8);
      if (undoTimerRef.current) clearInterval(undoTimerRef.current);
      undoTimerRef.current = setInterval(() => {
        setUndoCountdown(c => {
          if (c <= 1) {
            clearInterval(undoTimerRef.current);
            setJustSavedDiaper(null);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => { if (undoTimerRef.current) clearInterval(undoTimerRef.current); };
  }, [justSavedDiaper]);

  const stoolColorGuide = isEn ? [
    { id: 'meconium', day: 'Days 1-2', name: 'Meconium', desc: 'Dark black / tarry green. The first natural clearing.', color: '#2B2E28' },
    { id: 'transitional', day: 'Days 3-4', name: 'Transitional Stool', desc: 'Greenish brown, looser consistency.', color: '#65683F' },
    { id: 'mustard', day: 'Day 5+', name: 'Mature Milk Stool', desc: 'Golden mustard yellow, seedy texture. Ideal.', color: '#D4A017' },
    { id: 'warning', day: 'Notice', name: 'Pediatric Warning', desc: 'Consult your doctor if chalky white or blood-streaked.', color: '#D9534F' },
  ] : [
    { id: 'meconium', day: '1-2. Gün', name: 'Mekonyum', desc: 'Koyu siyah / katran yeşili, yapışkan kıvam. Doğum sonrası ilk doğal temizlik.', color: '#2B2E28' },
    { id: 'transitional', day: '3-4. Gün', name: 'Geçiş Dışkısı', desc: 'Yeşilimsi kahverengi, gevşek kıvam. Olgun süte geçiş belirtisi.', color: '#65683F' },
    { id: 'mustard', day: '5+ Gün', name: 'Olgun Anne Sütü Kakası', desc: 'Altın hardal sarısı, pütürlü doku. Çok sağlıklı.', color: '#D4A017' },
    { id: 'warning', day: 'Uyarı', name: 'Doktora Danışma', desc: 'Kireç beyazı veya kan izi durumunda hekiminize danışın.', color: '#D9534F' },
  ];

  const records = state?.records || [];
  const diaperRecords = records.filter(r => r.type === 'Bez');
  const todayCount = diaperRecords.length;

  // Single tap fast action logging (spec 14_DIAPER: ISLAK, KİRLİ, İKİSİ)
  function fastLogDiaper(typeId) {
    const colorSuffix = selectedStoolColor ? ` (${selectedStoolColor})` : '';
    const valText = typeId === 'Islak'
      ? (isEn ? 'Wet diaper' : 'Islak bez')
      : typeId === 'Kirli'
      ? (isEn ? `Dirty diaper${colorSuffix}` : `Kirli bez${colorSuffix}`)
      : (isEn ? `Wet & Dirty diaper${colorSuffix}` : `Islak & Kirli bez${colorSuffix}`);

    const newRecord = {
      id: uid(),
      type: 'Bez',
      value: valText,
      time: new Date().toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
    };

    update(old => ({
      records: [newRecord, ...(old.records || [])],
    }));

    setJustSavedDiaper(newRecord);
    offlineSyncQueue.enqueue(createTrackerEvent({
      type: 'diaper',
      metadata: { diaperType: typeId, color: selectedStoolColor },
    })).catch(() => {});

    toast && toast(isEn ? `✓ ${valText} logged` : `✓ ${valText} kaydedildi`);
    setSelectedStoolColor(null);
  }

  function handleUndoDiaper() {
    if (!justSavedDiaper) return;
    const targetId = justSavedDiaper.id;
    update(old => ({
      records: (old.records || []).filter(r => r.id !== targetId),
    }));
    setJustSavedDiaper(null);
    if (undoTimerRef.current) clearInterval(undoTimerRef.current);
    toast && toast(isEn ? 'Diaper log undone.' : 'Bez kaydı geri alındı.');
  }

  return (
    <View style={pbs.container}>
      <ScreenHero
        kicker={isEn ? 'CARE TRACKING' : 'BEBEK BAKIMI'}
        title={isEn ? 'Diaper Change Log' : 'Bez Değiştirme Günlüğü'}
        body={isEn ? 'One-tap logging for wet, dirty, and mixed diapers. Observe hydration rhythm naturally.' : 'Islak, kirli ve karışık bezleri tek dokunuşla kaydedin. Hidrasyon ve bağırsak düzenini izleyin.'}
        icon="diaper"
        asset="ui_diaper_wet_drop"
        stat={`${todayCount} ${isEn ? 'diapers logged today' : 'bez bugün kaydedildi'}`}
        tint="#4896BC"
      />

      {/* Anında Kayıt ve 8 sn Geri Al (Undo) */}
      {justSavedDiaper && (
        <Card style={{ backgroundColor: '#EEF7EE', borderColor: '#84B886', borderWidth: 1.5, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <T bold style={{ fontSize: 13.5, color: '#2D6632' }}>
              {isEn ? '✓ Diaper Logged' : '✓ Bez Kaydedildi'} · {justSavedDiaper.value}
            </T>
            <T style={{ fontSize: 11, color: '#4E8855' }}>
              {isEn ? `Tap Undo to cancel (${undoCountdown}s)` : `Geri almak için dokun (${undoCountdown} sn)`}
            </T>
          </View>
          <Tap onPress={handleUndoDiaper} style={{ backgroundColor: '#2D6632', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 }}>
            <T bold style={{ fontSize: 12, color: 'white' }}>{isEn ? 'Undo' : 'Geri Al'}</T>
          </Tap>
        </Card>
      )}

      {/* 3 FAST ACTION BUTONU (SPEC 14_DIAPER: ISLAK, KİRLİ, İKİSİ) */}
      <Card style={{ padding: 18, gap: 12 }}>
        <T bold style={{ fontSize: 15, color: colors.ink }}>
          {isEn ? 'Fast Diaper Log (One Tap):' : 'Hızlı Bez Kaydet (Tek Dokunuş):'}
        </T>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Tap
            onPress={() => fastLogDiaper('Islak')}
            style={{ flex: 1, backgroundColor: '#E9F3F9', paddingVertical: 18, borderRadius: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#C3DFEE' }}
          >
            <T style={{ fontSize: 26 }}>💧</T>
            <T bold style={{ fontSize: 14, color: '#2B668B', marginTop: 4 }}>
              {isEn ? 'WET' : 'ISLAK'}
            </T>
          </Tap>

          <Tap
            onPress={() => fastLogDiaper('Kirli')}
            style={{ flex: 1, backgroundColor: '#FAF1E8', paddingVertical: 18, borderRadius: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#EDD6BE' }}
          >
            <T style={{ fontSize: 26 }}>💩</T>
            <T bold style={{ fontSize: 14, color: '#88582B', marginTop: 4 }}>
              {isEn ? 'DIRTY' : 'KİRLİ'}
            </T>
          </Tap>

          <Tap
            onPress={() => fastLogDiaper('İkisi')}
            style={{ flex: 1, backgroundColor: '#F4EEF7', paddingVertical: 18, borderRadius: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#DFCDE4' }}
          >
            <T style={{ fontSize: 26 }}>✨</T>
            <T bold style={{ fontSize: 14, color: '#68367A', marginTop: 4 }}>
              {isEn ? 'BOTH' : 'İKİSİ'}
            </T>
          </Tap>
        </View>
      </Card>

      {/* Dışkı Renk Rehberi Butonu & Modalı (Spec 14: separate sheet, does not dominate logger) */}
      <Tap
        onPress={() => setShowColorGuide(true)}
        style={{ padding: 12, borderRadius: 14, backgroundColor: '#FAF6F4', borderWidth: 1, borderColor: '#EFE7E4', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <T style={{ fontSize: 16 }}>🩺</T>
          <T bold style={{ fontSize: 13, color: colors.ink }}>
            {isEn ? 'Stool Color & Consistency Guide' : 'Dışkı Renk & Kıvam Rehberi'}
          </T>
        </View>
        <T bold style={{ fontSize: 12, color: colors.purple }}>
          {isEn ? 'View →' : 'İncele →'}
        </T>
      </Tap>

      <Modal visible={showColorGuide} transparent animationType="fade" onRequestClose={() => setShowColorGuide(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(20,10,25,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Card style={{ width: '100%', maxWidth: 360, padding: 20, borderRadius: 22, backgroundColor: 'white', gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <T bold style={{ fontSize: 17, color: colors.ink }}>
                {isEn ? 'Stool Color Guide' : 'Dışkı Renk Rehberi'}
              </T>
              <Tap onPress={() => setShowColorGuide(false)} style={{ padding: 6 }}>
                <Icon name="close" size={18} color={colors.muted} />
              </Tap>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              <View style={{ gap: 10 }}>
                {stoolColorGuide.map(guide => (
                  <View key={guide.id} style={{ padding: 12, borderRadius: 12, backgroundColor: '#FDFBF9', borderWidth: 1, borderColor: '#EEE7E4' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: guide.color }} />
                      <T bold style={{ fontSize: 13, color: colors.ink }}>{guide.name}</T>
                      <T style={{ fontSize: 11, color: colors.muted }}>({guide.day})</T>
                    </View>
                    <T style={{ fontSize: 11.5, color: '#554B58', marginTop: 4, lineHeight: 16 }}>
                      {guide.desc}
                    </T>
                  </View>
                ))}
              </View>
            </ScrollView>

            <Tap onPress={() => setShowColorGuide(false)} style={{ backgroundColor: colors.purple, paddingVertical: 12, borderRadius: 14, alignItems: 'center' }}>
              <T bold style={{ color: 'white', fontSize: 13 }}>{isEn ? 'Close' : 'Kapat'}</T>
            </Tap>
          </Card>
        </View>
      </Modal>

      {/* Günlük Bez Geçmişi */}
      <Section title={isEn ? "Today's Diaper Logs" : "Bugünkü Bez Kayıtları"} />
      {diaperRecords.length === 0 ? (
        <Card style={{ alignItems: 'center', padding: 20 }}>
          <T style={{ color: colors.muted, fontSize: 13 }}>
            {isEn ? 'No diaper changes recorded yet today.' : 'Bugün henüz bez kaydı girilmedi.'}
          </T>
        </Card>
      ) : (
        diaperRecords.map(r => (
          <Card key={r.id} style={{ padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#E9F3F9', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="diaper" size={16} color="#4896BC" />
              </View>
              <T bold style={{ fontSize: 14, color: colors.ink }}>{r.value}</T>
            </View>
            <T style={{ fontSize: 12, color: colors.muted }}>{r.time}</T>
          </Card>
        ))
      )}
    </View>
  );
}


// ─── EKRAN 25: ANNE İYİLEŞME & LOHUSA RUH HALİ (POSTPARTUM SELF-CARE) ─────────
export function PostpartumSelfCareScreen({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const postInfo = calculatePostpartumProgress(state?.postpartumProfile?.birthDate);
  const daysSinceBirth = postInfo?.daysSinceBirth || 14;
  const phase = postInfo?.phase || 'healing';
  const deliveryType = state?.postpartumProfile?.deliveryType || 'vaginal';

  const [tab, setTab] = useState(isEn ? 'Recovery' : 'İyileşme');
  const tabItems = isEn ? ['Recovery', 'Pelvic Floor', 'Hydration'] : ['İyileşme', 'Pelvik Taban', 'Hidrasyon'];

  // İyileşme Parametreleri
  const todayCheckin = state?.postpartumCheckin || {};
  const [painLevel, setPainLevel] = useState(todayCheckin.painLevel || 2);
  const [bleeding, setBleeding] = useState(todayCheckin.bleeding || 'normal');
  const [energy, setEnergy] = useState(todayCheckin.energy || 'balanced');
  const [incisionOrPerine, setIncisionOrPerine] = useState(todayCheckin.incisionOrPerine || 'healing');
  const [breast, setBreast] = useState(todayCheckin.breast || 'full');
  const [waterGlasses, setWaterGlasses] = useState(state.water || 4);

  // Kegel Egzersiz Motoru
  const [kegelStep, setKegelStep] = useState('Hazır');
  const [kegelReps, setKegelReps] = useState(0);
  const kegelTimerRef = useRef(null);

  function startKegelSession() {
    if (kegelStep !== 'Hazır' && kegelStep !== 'Tamam') return;
    setKegelReps(1);
    setKegelStep(isEn ? 'Contract (5s)' : 'Kas (5 sn)');

    let count = 1;
    let isContract = true;

    kegelTimerRef.current = setInterval(() => {
      if (isContract) {
        setKegelStep(isEn ? 'Relax (5s)' : 'Gevşe (5 sn)');
        isContract = false;
      } else {
        count += 1;
        if (count > 5) {
          clearInterval(kegelTimerRef.current);
          setKegelStep('Tamam');
          setKegelReps(5);
          toast && toast(isEn ? '🌸 Pelvic floor session completed!' : '🌸 Pelvik taban seansı tamamlandı!');
          return;
        }
        setKegelReps(count);
        setKegelStep(isEn ? 'Contract (5s)' : 'Kas (5 sn)');
        isContract = true;
      }
    }, 5000);
  }

  useEffect(() => {
    return () => {
      if (kegelTimerRef.current) clearInterval(kegelTimerRef.current);
    };
  }, []);

  function toggleWater(idx) {
    const nextVal = idx + 1 === waterGlasses ? idx : idx + 1;
    setWaterGlasses(nextVal);
    update({ water: nextVal });
    toast && toast(isEn ? `💧 ${nextVal}/8 glasses of water logged` : `💧 ${nextVal}/8 bardak su içildi`);
  }

  function saveCheckin() {
    const checkinData = {
      date: new Date().toISOString().slice(0, 10),
      painLevel,
      bleeding,
      energy,
      incisionOrPerine,
      breast,
      deliveryType,
    };
    update({
      postpartumCheckin: checkinData,
      postpartumCheckins: [checkinData, ...(state?.postpartumCheckins || []).slice(0, 30)],
    });
    toast && toast(isEn ? '✓ Recovery signals saved! 🌸' : '✓ İyileşme göstergeleri kaydedildi! 🌸');
  }

  return (
    <View style={pbs.container}>
      <ScreenHero
        kicker={isEn ? 'POSTPARTUM SELF-CARE' : 'LOHUSA KENDİNE ŞEFKAT'}
        title={isEn ? `Day ${daysSinceBirth} Recovery` : `${daysSinceBirth}. Gün İyileşme`}
        body={isEn
          ? 'Track healing signals, practice pelvic rhythm, and maintain hydration.'
          : 'İyileşme göstergelerini takip et, pelvik tabanı güçlendir ve sıvı dengeni koru.'}
        icon="leaf"
        asset="ui_postpartum_lotus"
        stat={`${daysSinceBirth}. ${isEn ? 'day' : 'gün'}`}
        tint="#86518A"
      />

      {/* 3'lü Sekmeler */}
      <View style={pbs.segRow}>
        {tabItems.map(t => (
          <Tap
            key={t}
            label={t}
            onPress={() => setTab(t)}
            style={[pbs.segBtn, tab === t && pbs.segBtnActive]}
          >
            <T bold={tab === t} style={[pbs.segText, tab === t && { color: 'white' }]}>
              {t}
            </T>
          </Tap>
        ))}
      </View>

      {/* 1. SEKME: İYİLEŞME */}
      {(tab === 'İyileşme' || tab === 'Recovery') && (
        <Card style={{ padding: 16, gap: 12 }}>
          <T bold style={{ fontSize: 15, color: colors.ink }}>{isEn ? 'Recovery Checklist & Signals' : 'İyileşme Göstergeleri'}</T>

          <View style={{ gap: 4 }}>
            <T bold style={{ fontSize: 12.5, color: colors.purple }}>{isEn ? 'Pain Level (1-5)' : 'Ağrı Düzeyi (1-5)'}</T>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(lvl => (
                <Tap
                  key={lvl}
                  onPress={() => setPainLevel(lvl)}
                  style={{ flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: painLevel === lvl ? colors.purple : '#F2EAF4', alignItems: 'center' }}
                >
                  <T bold={painLevel === lvl} style={{ fontSize: 12, color: painLevel === lvl ? 'white' : colors.ink }}>{lvl}</T>
                </Tap>
              ))}
            </View>
          </View>

          <View style={{ gap: 4 }}>
            <T bold style={{ fontSize: 12.5, color: colors.purple }}>{isEn ? 'Bleeding / Lochia' : 'Lohusalık Kanaması'}</T>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[
                { id: 'light', label: isEn ? 'Light' : 'Az' },
                { id: 'normal', label: isEn ? 'Normal' : 'Normal' },
                { id: 'heavy', label: isEn ? 'Heavy' : 'Yoğun' },
              ].map(opt => (
                <Tap
                  key={opt.id}
                  onPress={() => setBleeding(opt.id)}
                  style={{ flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: bleeding === opt.id ? colors.purple : '#F2EAF4', alignItems: 'center' }}
                >
                  <T bold={bleeding === opt.id} style={{ fontSize: 11, color: bleeding === opt.id ? 'white' : colors.ink }}>{opt.label}</T>
                </Tap>
              ))}
            </View>
          </View>

          <View style={{ gap: 4 }}>
            <T bold style={{ fontSize: 12.5, color: colors.purple }}>
              {deliveryType === 'csection' ? (isEn ? 'Incision Status' : 'Kesi Yeri Durumu') : (isEn ? 'Perineal Comfort' : 'Perine Bölgesi')}
            </T>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[
                { id: 'comfortable', label: isEn ? 'Comfortable' : 'Rahat' },
                { id: 'healing', label: isEn ? 'Tension' : 'Gergin' },
                { id: 'tender', label: isEn ? 'Tender' : 'Hassas' },
              ].map(opt => (
                <Tap
                  key={opt.id}
                  onPress={() => setIncisionOrPerine(opt.id)}
                  style={{ flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: incisionOrPerine === opt.id ? colors.purple : '#F2EAF4', alignItems: 'center' }}
                >
                  <T bold={incisionOrPerine === opt.id} style={{ fontSize: 11, color: incisionOrPerine === opt.id ? 'white' : colors.ink }}>{opt.label}</T>
                </Tap>
              ))}
            </View>
          </View>

          <Tap
            onPress={saveCheckin}
            style={{ backgroundColor: colors.purple, paddingVertical: 12, borderRadius: 14, alignItems: 'center', marginTop: 4 }}
          >
            <T bold style={{ color: 'white', fontSize: 13 }}>{isEn ? 'Save Recovery Signals 🌸' : 'İyileşme Durumunu Kaydet 🌸'}</T>
          </Tap>
        </Card>
      )}

      {/* 2. SEKME: PELVİK TABAN (KEGEL) */}
      {(tab === 'Pelvik Taban' || tab === 'Pelvic Floor') && (
        <Card style={pbs.kegelCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <T bold style={{ fontSize: 15, color: colors.ink }}>
                {isEn ? 'Pelvic Floor (Kegel) Rhythm' : 'Pelvik Taban (Kegel) Ritmi'}
              </T>
              <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                {isEn
                  ? 'Strengthen your pelvic floor and bladder base with 5s gentle contraction and 5s relaxation.'
                  : '5 sn nazik kasılma, 5 sn gevşeme ile rahim ve mesane tabanını güçlendir.'}
              </T>
            </View>
            <Tap
              onPress={startKegelSession}
              label={isEn ? 'Start Exercise' : 'Egzersiz Başlat'}
              style={[pbs.kegelStartBtn, kegelStep.startsWith('Kas') || kegelStep.startsWith('Gevşe') ? { backgroundColor: '#EADCEE' } : null]}
            >
              <T bold style={{ fontSize: 11, color: colors.purple }}>
                {kegelStep === 'Hazır'
                  ? (isEn ? 'Start ▶' : 'Başlat ▶')
                  : kegelStep === 'Tamam'
                  ? (isEn ? 'Repeat ↺' : 'Tekrarla ↺')
                  : (isEn ? 'In progress...' : 'Sürüyor...')}
              </T>
            </Tap>
          </View>

          <View style={pbs.kegelStatusBox}>
            <View style={pbs.kegelStepBadge}>
              <T bold style={{ fontSize: 13, color: colors.purple }}>
                {kegelStep === 'Hazır'
                  ? (isEn ? 'Tap to start' : 'Başlamak için dokun')
                  : kegelStep === 'Tamam'
                  ? (isEn ? '🎉 Session Completed' : '🎉 Seans Başarıyla Bitti')
                  : `${kegelStep} · ${isEn ? 'Rep' : 'Tekrar'} ${kegelReps}/5`}
              </T>
            </View>
            <T style={{ fontSize: 12, color: colors.muted, marginTop: 6, textAlign: 'center' }}>
              {kegelStep.startsWith('Kas') || kegelStep.startsWith('Contract')
                ? (isEn ? 'Inhale, gently draw pelvic floor inward.' : 'Nefes al, alt pelvik kaslarını nazikçe topla.')
                : kegelStep.startsWith('Gevşe') || kegelStep.startsWith('Relax')
                ? (isEn ? 'Slowly exhale, release all muscles.' : 'Yavaşça nefes ver, kasları tamamen serbest bırak.')
                : (isEn ? '2-3 short sessions daily support postpartum healing.' : 'Günde 2-3 kısa seans toparlanmayı destekler.')}
            </T>
          </View>
        </Card>
      )}

      {/* 3. SEKME: HİDRASYON (SU TAKİBİ) */}
      {(tab === 'Hidrasyon' || tab === 'Hydration') && (
        <Card style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <View>
              <T bold style={{ fontSize: 15, color: colors.ink }}>
                {isEn ? 'Daily Water Intake' : 'Günlük Su İhtiyacı'}
              </T>
              <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                {isEn
                  ? `Target for lactation and healing: ${waterGlasses}/8 glasses`
                  : `Süt üretimi ve doku rejenerasyonu için hedef: ${waterGlasses}/8 bardak`}
              </T>
            </View>
            <View style={pbs.dayPill}>
              <T bold style={{ fontSize: 12, color: '#3E7B54' }}>%{Math.round((waterGlasses / 8) * 100)}</T>
            </View>
          </View>

          <View style={pbs.waterGlassRow}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(idx => {
              const isFilled = idx < waterGlasses;
              return (
                <Tap
                  key={idx}
                  onPress={() => toggleWater(idx)}
                  label={isEn ? `Glass ${idx + 1}` : `Bardak ${idx + 1}`}
                  style={[pbs.waterGlassBtn, isFilled && pbs.waterGlassBtnFilled]}
                >
                  <T style={{ fontSize: 16 }}>{isFilled ? '💧' : '🥛'}</T>
                  <T style={{ fontSize: 9, color: isFilled ? colors.purple : colors.muted, marginTop: 2 }}>
                    {idx + 1}
                  </T>
                </Tap>
              );
            })}
          </View>
        </Card>
      )}
    </View>
  );
}

const pbs = StyleSheet.create({
  container: { gap: 14, paddingBottom: 20 },
  segRow: { flexDirection: 'row', gap: 8, backgroundColor: '#EFE7EE', padding: 4, borderRadius: 20 },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  segBtnActive: { backgroundColor: colors.purple },
  segText: { fontSize: 12 },
  dualBtnRow: { flexDirection: 'row', gap: 12 },
  breastBtn: { flex: 1, height: 140, borderRadius: 24, overflow: 'hidden', borderWidth: 1.5, borderColor: '#F2DEE5', ...shadow },
  breastBtnActive: { borderColor: '#E8879E', transform: [{ scale: 1.02 }] },
  breastGrad: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' },
  breastSideText: { fontSize: 13, letterSpacing: 1, color: '#7E3B5A' },
  breastTimerText: { fontSize: 26, letterSpacing: 1, color: '#522037', marginVertical: 6 },
  breastStatusText: { fontSize: 10, color: '#916377' },
  liveDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 4 },
  lastSideBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F8EEF8' },
  saveBtn: { height: 50, borderRadius: 18, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center', marginTop: 10, ...shadow },
  mlPill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#EFE8EE' },
  mlPillActive: { backgroundColor: colors.purple },
  // Sleep styles
  sleepStatusCard: { padding: 24, borderRadius: 24, overflow: 'hidden' },
  sleepToggleBtn: { marginTop: 16, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 18, backgroundColor: '#4C3D5A' },
  noiseCard: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  noiseCardActive: { borderColor: colors.purple, backgroundColor: '#FAF6FA' },
  noiseIconBox: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  noisePlayBtn: { padding: 8, borderRadius: 12 },
  // Diaper styles
  diaperBtn: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#EDE2EE', ...shadow },
  colorGuideCard: { padding: 16, backgroundColor: '#FFFDFA' },
  colorGuideRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F2EDE8' },
  colorSwatch: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: '#DDD' },
  dayPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: '#F3EAF5' },
  // Recovery styles
  recoveryCard: { padding: 20, borderRadius: 22, overflow: 'hidden' },
  dayBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: '#FFFFFFDD', marginBottom: 6 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.line },
  stepCheck: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  storageCard: { padding: 16, backgroundColor: '#F9F6FA', marginTop: 10 },
  storageRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  waterGlassRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 4, marginTop: 4 },
  waterGlassBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, backgroundColor: '#F5F2F6' },
  waterGlassBtnFilled: { backgroundColor: '#E1F0F5' },
  kegelCard: { padding: 16 },
  kegelStartBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#F3EAF5' },
  kegelStatusBox: { alignItems: 'center', padding: 14, borderRadius: 16, backgroundColor: '#FAF6FA', marginTop: 4 },
  kegelStepBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, backgroundColor: '#EFE3F2' },
});
