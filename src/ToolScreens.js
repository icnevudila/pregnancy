import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section, Progress, ScreenHero, InfoNote, ProgressRing, MetricCard, StatusCard, ToolExperienceCard, CleanIcon } from './ui';
import { generatedAssets } from './generatedAssets';
import { usePulse } from './anim';
import { secondsLabel, uid, localDay } from './domain.mjs';
import { saveKickSessionCloud, saveContractionSessionCloud } from './backendSync';
import { offlineSyncQueue } from './services/offlineSyncQueue';
import { createTrackerEvent } from './domain/types';
import { playSound, stopSound, playBreathCue } from './soundEngine';
import { speakText, stopSpeech } from './speechService';

// ─── 1. TEKME SAYACI (ADVANCED KICK COUNTER) ──────────────────────────────────
export function KickCounter({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [sessionActive, setSessionActive] = useState(false);
  const [kicks, setKicks] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [selectedType, setSelectedType] = useState('kick'); // 'kick' | 'flutter' | 'roll' | 'hiccup'
  const [typeCounts, setTypeCounts] = useState({ kick: 0, flutter: 0, roll: 0, hiccup: 0 });
  const [lastKickTime, setLastKickTime] = useState(null);
  const [showFeelingModal, setShowFeelingModal] = useState(false);
  const [completedSummary, setCompletedSummary] = useState(null);
  const [selectedFeeling, setSelectedFeeling] = useState('normal');
  const [sessionNote, setSessionNote] = useState('');

  const pulse = usePulse(0.96, 1.04, 1200);
  const timerRef = useRef(null);
  const startedAtRef = useRef(null);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const ripple1Scale = useRef(new Animated.Value(1)).current;
  const ripple1Opacity = useRef(new Animated.Value(0)).current;
  const ripple2Scale = useRef(new Animated.Value(1)).current;
  const ripple2Opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (sessionActive) {
      if (!startedAtRef.current) startedAtRef.current = Date.now();
      timerRef.current = setInterval(() => {
        if (startedAtRef.current) {
          setSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
        }
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sessionActive]);

  const movementTypes = [
    { id: 'kick', label: isEn ? 'Kick' : 'Tekme', tint: '#9A5B80' },
    { id: 'flutter', label: isEn ? 'Flutter' : 'Kıpırtı', tint: '#B8789C' },
    { id: 'roll', label: isEn ? 'Roll' : 'Dönüş', tint: '#5C749A' },
    { id: 'hiccup', label: isEn ? 'Hiccup' : 'Hıçkırık', tint: '#6B8E71' },
  ];

  const feelingOptions = [
    { id: 'normal', label: isEn ? '🌸 Usual rhythm' : '🌸 Her zamanki gibi' },
    { id: 'lighter', label: isEn ? '🍃 Lighter than usual' : '🍃 Daha hafif' },
    { id: 'stronger', label: isEn ? '⚡ Stronger & active' : '⚡ Daha güçlü' },
    { id: 'different', label: isEn ? '❓ Different pattern' : '❓ Farklı hissettirdi' },
  ];

  function handleKick() {
    if (!sessionActive) {
      setSessionActive(true);
      startedAtRef.current = Date.now();
      setSeconds(0);
    }
    const nextKicks = kicks + 1;
    setKicks(nextKicks);
    setLastKickTime(new Date().toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }));

    // Tactile elastic spring bounce
    buttonScale.setValue(0.91);
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3.5,
      tension: 60,
      useNativeDriver: false,
    }).start();

    // Dual ripple waves radiating outward
    ripple1Scale.setValue(1);
    ripple1Opacity.setValue(0.7);
    ripple2Scale.setValue(1);
    ripple2Opacity.setValue(0.5);

    Animated.parallel([
      Animated.timing(ripple1Scale, { toValue: 1.5, duration: 650, useNativeDriver: false }),
      Animated.timing(ripple1Opacity, { toValue: 0, duration: 650, useNativeDriver: false }),
      Animated.sequence([
        Animated.delay(90),
        Animated.parallel([
          Animated.timing(ripple2Scale, { toValue: 1.7, duration: 700, useNativeDriver: false }),
          Animated.timing(ripple2Opacity, { toValue: 0, duration: 700, useNativeDriver: false }),
        ]),
      ]),
    ]).start();

    setTypeCounts(prev => ({
      ...prev,
      [selectedType]: (prev[selectedType] || 0) + 1,
    }));
  }

  function promptFinishSession() {
    if (kicks === 0) {
      setSessionActive(false);
      startedAtRef.current = null;
      setSeconds(0);
      return;
    }
    setShowFeelingModal(true);
  }

  function confirmFinishSession() {
    setShowFeelingModal(false);
    setSessionActive(false);
    const finalSecs = startedAtRef.current
      ? Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000))
      : Math.max(1, seconds);
    startedAtRef.current = null;

    const feelingLabel = feelingOptions.find(f => f.id === selectedFeeling)?.label || '';
    const newSession = {
      id: uid(),
      date: localDay(),
      time: new Date().toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
      kicks,
      durationSecs: finalSecs,
      week: state?.week || 28,
      feeling: selectedFeeling,
      note: sessionNote.trim(),
      breakdown: { ...typeCounts },
    };

    update(old => ({
      kickSessions: [newSession, ...(old.kickSessions || [])],
    }));

    setCompletedSummary({
      duration: finalSecs,
      kicks,
      feelingLabel,
      note: sessionNote.trim(),
    });

    saveKickSessionCloud({
      durationSeconds: finalSecs,
      kickCount: kicks,
      week: state?.week || 28,
      notes: `${feelingLabel} ${sessionNote ? '· ' + sessionNote : ''}`.trim(),
    }).catch(() => {});

    toast && toast(isEn ? `🌸 ${kicks} movements saved (${secondsLabel(finalSecs)})` : `🌸 ${kicks} hareket kaydedildi (${secondsLabel(finalSecs)})`);
    setKicks(0);
    setSeconds(0);
    setTypeCounts({ flutter: 0, kick: 0, roll: 0, hiccup: 0 });
    setSessionNote('');
  }

  function resetSession() {
    setSessionActive(false);
    startedAtRef.current = null;
    setKicks(0);
    setSeconds(0);
    setTypeCounts({ flutter: 0, kick: 0, roll: 0, hiccup: 0 });
    setCompletedSummary(null);
  }

  const pastSessions = state?.kickSessions || [];

  return (
    <View style={ts.container}>
      <ScreenHero
        asset="card_kick_counter"
        icon="footprint"
        kicker={isEn ? 'FETAL MOVEMENT & RHYTHM' : 'BEBEĞİN HAREKETLERİ'}
        title={isEn ? "Baby's Personal Rhythm" : "Bebeğinin Kişisel Ritmi"}
        body={isEn ? "Tune in to your baby's unique daily rhythm. Every baby moves at their own pace — track sessions when active." : "Bebeğinizin kendine özgü ritmini gözlemleyin. Her bebeğin hareket düzeni farklıdır; aktif hissettiğiniz anlarda sakince sayın."}
        stat={pastSessions[0] ? (isEn ? `Latest: ${pastSessions[0].kicks} movements (${secondsLabel(pastSessions[0].durationSecs || 0)})` : `Son: ${pastSessions[0].kicks} hareket (${secondsLabel(pastSessions[0].durationSecs || 0)})`) : (isEn ? 'Session ready' : 'Seans hazır')}
        tint="#9D5C80"
      />

      {/* Seans Tamamlanma Özeti */}
      {completedSummary && (
        <Card style={ts.summaryBanner}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={ts.trophyBadge}>
              <Icon name="check" size={20} color={colors.purple} />
            </View>
            <View style={{ flex: 1 }}>
              <T bold style={{ fontSize: 15, color: colors.purple }}>{isEn ? 'Movement Session Saved' : 'Hareket Seansı Kaydedildi'}</T>
              <T style={{ fontSize: 12, color: colors.ink, marginTop: 2 }}>
                <T bold>{completedSummary.kicks} {isEn ? 'movements' : 'hareket'}</T>
                {isEn ? ` recorded in ` : ` seans süresi: `}
                <T bold>{secondsLabel(completedSummary.duration)}</T>
                {completedSummary.feelingLabel ? ` · ${completedSummary.feelingLabel}` : ''}
              </T>
            </View>
            <Tap onPress={() => setCompletedSummary(null)} style={{ padding: 6 }}>
              <Icon name="close" size={16} color={colors.muted} />
            </Tap>
          </View>
        </Card>
      )}

      {/* İkili Metrik Kartları */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <MetricCard
          title={isEn ? "SESSION DURATION" : "SEANS SÜRESİ"}
          value={secondsLabel(seconds)}
          unit=""
          subtext={sessionActive ? (isEn ? "Counting in progress" : "Sayım devam ediyor") : (isEn ? "Tap button to start" : "Başlamak için dokunun")}
          icon="time"
          tint="#9D5C80"
        />
        <MetricCard
          title={isEn ? "RECORDED MOVEMENTS" : "KAYDEDİLEN HAREKET"}
          value={`${kicks}`}
          unit=""
          subtext={lastKickTime ? (isEn ? `Last: ${lastKickTime}` : `Son: ${lastKickTime}`) : (isEn ? "Waiting for kick" : "İlk hareket bekleniyor")}
          icon="footprint"
          tint="#6B8E71"
        />
      </View>

      {/* Hareket Türü Seçicisi (Opsiyonel Detay) */}
      <View style={ts.typeSelectorRow}>
        {movementTypes.map(t => {
          const isSelected = selectedType === t.id;
          const count = typeCounts[t.id] || 0;
          return (
            <Tap
              key={t.id}
              onPress={() => setSelectedType(t.id)}
              style={[ts.typePill, isSelected && { backgroundColor: t.tint, borderColor: t.tint }]}
            >
              <T bold={isSelected} style={[ts.typePillText, isSelected && { color: 'white' }]}>
                {t.label} {count > 0 ? `(${count})` : ''}
              </T>
            </Tap>
          );
        })}
      </View>

      {/* BÜYÜK MERKEZİ BUTON: HAREKET HİSSETTİM (SPEC 03_BABY_MOVEMENT) */}
      <Card style={ts.kickInteractiveCard}>
        <View style={{ position: 'relative', width: 230, height: 230, alignItems: 'center', justifyContent: 'center' }}>
          {/* Arka plan dalga halkaları */}
          <Animated.View
            style={[
              ts.rippleCircle,
              {
                transform: [{ scale: ripple1Scale }],
                opacity: ripple1Opacity,
                borderColor: '#9D5C80',
              },
            ]}
          />
          <Animated.View
            style={[
              ts.rippleCircle,
              {
                transform: [{ scale: ripple2Scale }],
                opacity: ripple2Opacity,
                borderColor: '#B8789C',
              },
            ]}
          />

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Tap
              onPress={handleKick}
              label={isEn ? "I felt a movement" : "Hareket hissettim"}
              style={ts.kickMainBtn}
            >
              <LinearGradient
                colors={['#A85885', '#863C65']}
                style={ts.kickGradient}
              >
                <Icon name="footprint" size={38} color="white" />
                <T bold style={ts.kickMainText}>
                  {isEn ? "I FELT A MOVEMENT" : "HAREKET HİSSETTİM"}
                </T>
                <T style={ts.kickSubCount}>
                  {kicks > 0 ? `${kicks} ${isEn ? 'movements' : 'hareket'}` : (isEn ? 'Tap each kick' : 'Her harekette dokun')}
                </T>
              </LinearGradient>
            </Tap>
          </Animated.View>
        </View>

        {/* Seans Kontrol Aksiyonları */}
        {sessionActive && (
          <View style={[ts.sessionActions, { marginTop: 18 }]}>
            <Tap onPress={() => setKicks(k => Math.max(0, k - 1))} style={ts.actionMiniBtn}>
              <T style={{ fontSize: 12, color: colors.ink }}>{isEn ? '↩ Undo 1' : '↩ 1 Geri Al'}</T>
            </Tap>
            <Tap onPress={promptFinishSession} style={[ts.actionMiniBtn, { backgroundColor: '#F0E4F2' }]}>
              <T bold style={{ fontSize: 12, color: colors.purple }}>{isEn ? '✓ Finish Session' : '✓ Seansı Bitir'}</T>
            </Tap>
            <Tap onPress={resetSession} style={ts.actionMiniBtn}>
              <T style={{ fontSize: 12, color: '#B35E6D' }}>{isEn ? '✕ Cancel' : '✕ İptal'}</T>
            </Tap>
          </View>
        )}
      </Card>

      {/* Post-Session Feeling Modal */}
      <Modal visible={showFeelingModal} transparent animationType="fade" onRequestClose={() => setShowFeelingModal(false)}>
        <View style={ts.modalBackdrop}>
          <Card style={ts.modalCard}>
            <T bold style={{ fontSize: 17, color: colors.ink }}>
              {isEn ? 'How did movements feel today?' : 'Bugünkü hareketler nasıl hissettirdi?'}
            </T>
            <T style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
              {isEn ? `${kicks} movements in ${secondsLabel(seconds)}` : `${secondsLabel(seconds)} içinde ${kicks} hareket`}
            </T>

            <View style={{ gap: 8, marginVertical: 14 }}>
              {feelingOptions.map(f => (
                <Tap
                  key={f.id}
                  onPress={() => setSelectedFeeling(f.id)}
                  style={[
                    ts.feelingOption,
                    selectedFeeling === f.id && ts.feelingOptionSelected,
                  ]}
                >
                  <T bold={selectedFeeling === f.id} style={{ fontSize: 13, color: selectedFeeling === f.id ? colors.purple : colors.ink }}>
                    {f.label}
                  </T>
                </Tap>
              ))}
            </View>

            <TextInput
              value={sessionNote}
              onChangeText={setSessionNote}
              placeholder={isEn ? 'Optional note (e.g. after lunch, lying on left side)...' : 'İsteğe bağlı not (örn. yemek sonrası, sol yana uzanırken)...'}
              placeholderTextColor="#A396A6"
              style={ts.noteInput}
              maxLength={140}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Tap onPress={() => setShowFeelingModal(false)} style={[ts.modalBtn, { backgroundColor: '#F0ECE8' }]}>
                <T bold style={{ color: colors.ink, fontSize: 13 }}>{isEn ? 'Back' : 'Geri'}</T>
              </Tap>
              <Tap onPress={confirmFinishSession} style={[ts.modalBtn, { backgroundColor: colors.purple, flex: 1 }]}>
                <T bold style={{ color: 'white', fontSize: 13 }}>{isEn ? 'Save Session' : 'Seansı Kaydet'}</T>
              </Tap>
            </View>
          </Card>
        </View>
      </Modal>

      {/* Statik Medikal Güvenlik Notu (Spec 03_BABY_MOVEMENT) */}
      <StatusCard
        level="info"
        title={isEn ? "Personal Rhythm & Clinical Guidance" : "Kişisel Ritim & Klinik Bilgilendirme"}
        body={isEn
          ? "Every baby establishes their own movement rhythm. If you notice a clear decrease, sudden cessation, or significant change in your baby's typical pattern, contact your obstetrician, midwife, or maternity unit without waiting. MOMORA does not produce medical diagnoses."
          : "Her bebeğin kendine özgü bir hareket ve uyku ritmi vardır. Bebeğinizin her zamanki hareket düzeninde belirgin bir azalma, hareketlerin durması veya ani bir farklılık hissederseniz beklemeden doktorunuza, ebenize veya hastaneye başvurun. MOMORA tıbbi tanı üretmez."
        }
        icon="heart"
      />

      {/* Son Seans Kayıtları */}
      <Section title={isEn ? "Recent Movement Sessions" : "Son Hareket Seansları"} />
      {pastSessions.length === 0 ? (
        <Card style={{ alignItems: 'center', padding: 20 }}>
          <T style={{ color: colors.muted, fontSize: 13 }}>{isEn ? "No movement sessions recorded yet." : "Henüz kaydedilmiş hareket seansı bulunmuyor."}</T>
        </Card>
      ) : (
        pastSessions.slice(0, 5).map(s => (
          <Card key={s.id} style={ts.historyItem}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <CleanIcon asset="card_kick_counter" size={34} imgSize={30} />
                <View>
                  <T bold style={{ fontSize: 14 }}>{s.kicks} {isEn ? "Movements" : "Hareket"}</T>
                  <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                    {s.date} · {s.time} {s.note ? `· ${s.note}` : ''}
                  </T>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <T bold style={{ fontSize: 14, color: colors.purple }}>{secondsLabel(s.durationSecs || s.duration || 0)}</T>
                {s.feeling && (
                  <T style={{ fontSize: 10, color: colors.purple, marginTop: 2 }}>
                    {feelingOptions.find(f => f.id === s.feeling)?.label.split(' ')[0] || ''}
                  </T>
                )}
              </View>
            </View>
          </Card>
        ))
      )}
    </View>
  );
}

// ─── 2. KASILMA SAYACI (ONE-TAP TIMER PER SPEC 01_CONTRACTION_COUNTER) ────────
export function ContractionTimer({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [active, setActive] = useState(false);
  const [duration, setDuration] = useState(0);
  const [intensity, setIntensity] = useState('Orta'); // 'Hafif' | 'Orta' | 'Güçlü'
  const [position, setPosition] = useState('sitting'); // 'standing' | 'sitting' | 'side'
  const [note, setNote] = useState('');
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [lastSavedEntry, setLastSavedEntry] = useState(null);
  const [undoCountdown, setUndoCountdown] = useState(8);
  const [showWaterNotice, setShowWaterNotice] = useState(false);

  const contractions = state?.contractionSessions || [];
  const timerRef = useRef(null);
  const startedAtRef = useRef(null);
  const undoTimerRef = useRef(null);

  const waveAnim = usePulse(0.96, 1.05, 800);
  const rippleScale = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (active) {
      const loop = Animated.loop(
        Animated.parallel([
          Animated.timing(rippleScale, { toValue: 1.55, duration: 1600, useNativeDriver: false }),
          Animated.sequence([
            Animated.timing(rippleOpacity, { toValue: 0.8, duration: 800, useNativeDriver: false }),
            Animated.timing(rippleOpacity, { toValue: 0, duration: 800, useNativeDriver: false }),
          ]),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      rippleScale.setValue(1);
      rippleOpacity.setValue(0.6);
    }
  }, [active]);

  useEffect(() => {
    if (lastSavedEntry) {
      setUndoCountdown(8);
      if (undoTimerRef.current) clearInterval(undoTimerRef.current);
      undoTimerRef.current = setInterval(() => {
        setUndoCountdown(c => {
          if (c <= 1) {
            clearInterval(undoTimerRef.current);
            setLastSavedEntry(null);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => { if (undoTimerRef.current) clearInterval(undoTimerRef.current); };
  }, [lastSavedEntry]);

  useEffect(() => {
    if (active) {
      if (!startedAtRef.current) startedAtRef.current = Date.now();
      timerRef.current = setInterval(() => {
        if (startedAtRef.current) {
          setDuration(Math.floor((Date.now() - startedAtRef.current) / 1000));
        }
      }, 400);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [active]);

  const lastContraction = contractions[0];
  const lastDuration = lastContraction?.durationSecs || lastContraction?.duration || 0;
  
  // Calculate time elapsed since last contraction ended
  const [timeSinceLast, setTimeSinceLast] = useState('--');
  useEffect(() => {
    if (!lastContraction || !lastContraction.timestamp) return;
    function updateElapsed() {
      const diffSecs = Math.max(0, Math.round((Date.now() - lastContraction.timestamp) / 1000));
      if (diffSecs < 60) setTimeSinceLast(isEn ? `${diffSecs}s ago` : `${diffSecs} sn önce`);
      else {
        const mins = Math.floor(diffSecs / 60);
        setTimeSinceLast(isEn ? `${mins}m ago` : `${mins} dk önce`);
      }
    }
    updateElapsed();
    const interval = setInterval(updateElapsed, 5000);
    return () => clearInterval(interval);
  }, [lastContraction]);

  // Average statistics
  let avgDurationSecs = 0;
  let avgIntervalMins = 0;
  if (contractions.length >= 2) {
    const recent = contractions.slice(0, 5);
    avgDurationSecs = Math.round(recent.reduce((sum, c) => sum + (c.durationSecs || c.duration || 0), 0) / recent.length);
    const intervals = recent.map(c => c.intervalSecs).filter(Boolean);
    if (intervals.length) {
      const avgIntervalSecs = Math.round(intervals.reduce((sum, i) => sum + i, 0) / intervals.length);
      avgIntervalMins = (avgIntervalSecs / 60).toFixed(1);
    }
  }

  function toggleContraction() {
    if (!active) {
      // START CONTRACTION
      setActive(true);
      startedAtRef.current = Date.now();
      setDuration(0);
      setLastSavedEntry(null);
      update({ activeContraction: { startedAt: startedAtRef.current } });
    } else {
      // STOP CONTRACTION
      setActive(false);
      const now = new Date();
      const finalDuration = startedAtRef.current
        ? Math.max(1, Math.round((now.getTime() - startedAtRef.current) / 1000))
        : Math.max(1, duration);
      startedAtRef.current = null;
      update({ activeContraction: null });

      let intervalSecs = null;
      if (lastContraction && lastContraction.timestamp) {
        intervalSecs = Math.max(0, Math.round((now.getTime() - lastContraction.timestamp) / 1000));
      }

      const entry = {
        id: uid ? uid() : Date.now().toString(),
        durationSecs: finalDuration,
        intervalSecs,
        intensity,
        position,
        note: note.trim(),
        timestamp: now.getTime(),
        time: now.toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
        date: localDay(now),
      };

      update(old => ({
        contractionSessions: [entry, ...(old.contractionSessions || [])],
      }));

      setLastSavedEntry(entry);
      saveContractionSessionCloud({
        durationSeconds: finalDuration,
        intervalSeconds: intervalSecs,
        intensity,
        notes: note.trim(),
      }).catch(() => {});

      toast && toast(isEn ? `Contraction saved (${finalDuration}s)` : `Kasılma kaydedildi (${finalDuration} sn)`);
      setDuration(0);
    }
  }

  function handleUndoContraction() {
    if (!lastSavedEntry) return;
    const targetId = lastSavedEntry.id;
    update(old => ({
      contractionSessions: (old.contractionSessions || []).filter(c => c.id !== targetId),
    }));
    setLastSavedEntry(null);
    if (undoTimerRef.current) clearInterval(undoTimerRef.current);
    toast && toast(isEn ? 'Contraction log undone.' : 'Kasılma kaydı geri alındı.');
  }

  function markWaterBroke() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = localDay(now);

    const waterEntry = {
      id: uid ? uid() : Date.now().toString(),
      type: 'water_broken',
      title: isEn ? '💧 Water Broke (Amniotic fluid)' : '💧 Su Geldi (Amniyotik sıvı)',
      timestamp: now.getTime(),
      time: timeStr,
      date: dateStr,
      note: isEn ? 'Water rupture marked' : 'Su gelişi işaretlendi',
    };

    update(old => ({
      waterBrokeEvent: waterEntry,
      notes: [{ id: uid(), text: `💧 ${waterEntry.title} - ${timeStr}` }, ...(old.notes || [])],
    }));

    setShowWaterNotice(true);
  }

  const intensityOptions = [
    { id: 'Hafif', label: isEn ? 'Mild 🟡' : 'Hafif 🟡' },
    { id: 'Orta', label: isEn ? 'Moderate 🟠' : 'Orta 🟠' },
    { id: 'Güçlü', label: isEn ? 'Strong 🔴' : 'Güçlü 🔴' },
  ];

  const positionOptions = [
    { id: 'standing', label: isEn ? 'Standing' : 'Ayakta' },
    { id: 'sitting', label: isEn ? 'Sitting' : 'Oturarak' },
    { id: 'side', label: isEn ? 'Left Side' : 'Sol Yana Yatarak' },
  ];

  return (
    <View style={ts.container}>
      {/* 1. Üst Hero */}
      <ScreenHero
        title={isEn ? "Contraction Timer" : "Kasılma Sayacı"}
        subtitle={isEn
          ? "Low-cognitive load, one-tap labor timer. Track duration, intervals, and pattern calmly."
          : "Doğum anında tek dokunuşla çalışan sade sayaç. Süreyi, sıklığı ve ritmi sakince takip edin."}
        badge={isEn ? "LABOR TIMER" : "KASILMA TAKİBİ"}
        badgeColor="#7A5688"
        icon="contraction"
        lang={lang}
      />

      {/* Anında Kayıt ve 8 sn Geri Al (Undo) */}
      {lastSavedEntry && (
        <Card style={{ backgroundColor: '#EEF7EE', borderColor: '#84B886', borderWidth: 1.5, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <T bold style={{ fontSize: 13.5, color: '#2D6632' }}>
              {isEn ? '✓ Contraction Logged' : '✓ Kasılma Kaydedildi'} · {secondsLabel(lastSavedEntry.durationSecs)} ({lastSavedEntry.intensity})
            </T>
            <T style={{ fontSize: 11, color: '#4E8855' }}>
              {isEn ? `Tap Undo to cancel (${undoCountdown}s)` : `Geri almak için dokun (${undoCountdown} sn)`}
            </T>
          </View>
          <Tap onPress={handleUndoContraction} style={{ backgroundColor: '#2D6632', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 }}>
            <T bold style={{ fontSize: 12, color: 'white' }}>{isEn ? 'Undo' : 'Geri Al'}</T>
          </Tap>
        </Card>
      )}

      {/* İkili Özet Metrikleri (IDLE / ACTIVE) */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <MetricCard
          title={isEn ? "LAST DURATION" : "SON SÜRE"}
          value={lastDuration > 0 ? secondsLabel(lastDuration) : '--'}
          unit=""
          subtext={timeSinceLast}
          icon="time"
          tint="#844E86"
        />
        <MetricCard
          title={isEn ? "AVERAGE INTERVAL" : "ORTALAMA ARALIK"}
          value={avgIntervalMins > 0 ? `${avgIntervalMins}` : '--'}
          unit={avgIntervalMins > 0 ? (isEn ? 'min' : 'dk') : ''}
          subtext={avgDurationSecs > 0 ? (isEn ? `Avg: ${avgDurationSecs}s` : `Ort. süre: ${avgDurationSecs} sn`) : (isEn ? "Need 2+ records" : "2+ kayıt bekleniyor")}
          icon="milestone"
          tint="#3A688F"
        />
      </View>

      {/* 2. BÜYÜK ONE-TAP KASILMA SAYACI BUTONU (SPEC 01_CONTRACTION_COUNTER) */}
      <Card style={[cs.counterCard, active && { borderColor: '#B54964', borderWidth: 2 }]}>
        {active ? (
          <View style={{ alignItems: 'center' }}>
            <T style={{ fontSize: 13, color: '#B54964', fontWeight: '700', letterSpacing: 1.5 }}>
              {isEn ? '● CONTRACTION IN PROGRESS' : '● KASILMA SÜRÜYOR'}
            </T>
            <T bold style={{ fontSize: 64, color: '#912B44', marginVertical: 12 }}>
              {secondsLabel(duration)}
            </T>
            <T style={{ fontSize: 12.5, color: colors.muted, marginBottom: 20 }}>
              {isEn ? 'Breathe out slowly and soften your shoulders.' : 'Nefesini yavaşça ver, omuzlarını ve çeneni serbest bırak.'}
            </T>

            <View style={{ width: '100%', maxWidth: 280, gap: 12 }}>
              <Tap
                onPress={toggleContraction}
                label={isEn ? "Contraction Ended" : "Kasılma Bitti"}
                style={cs.stopBtn}
              >
                <T bold style={{ color: 'white', fontSize: 17 }}>
                  {isEn ? "✓ Kasılma Bitti" : "✓ Kasılma Bitti"}
                </T>
              </Tap>

              {/* Nefes Koçu Çağrısı (Contraction Timer'ı durdurmaz) */}
              <Tap
                onPress={() => update({ activeBreathingOverlay: true })}
                style={cs.breathGuideBtn}
              >
                <T bold style={{ color: '#6A437E', fontSize: 13 }}>
                  {isEn ? "🌬️ Open Breathing Guide" : "🌬️ Nefes Rehberini Aç"}
                </T>
              </Tap>
            </View>
          </View>
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 10 }}>
            <Animated.View
              style={[
                cs.pulseRing,
                {
                  transform: [{ scale: rippleScale }],
                  opacity: rippleOpacity,
                },
              ]}
            />
            <Tap
              onPress={toggleContraction}
              label={isEn ? "Contraction Started" : "Kasılma Başladı"}
              style={cs.startBtn}
            >
              <LinearGradient colors={['#964872', '#723154']} style={cs.btnGradient}>
                <Icon name="contraction" size={36} color="white" />
                <T bold style={{ color: 'white', fontSize: 18, marginTop: 6, letterSpacing: 0.5 }}>
                  {isEn ? "KASILMA BAŞLADI" : "KASILMA BAŞLADI"}
                </T>
                <T style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 }}>
                  {isEn ? "Tap when the wave begins" : "Dalga başladığında dokunun"}
                </T>
              </LinearGradient>
            </Tap>
          </View>
        )}
      </Card>

      {/* Su Geldi Marker Butonu (Spec line 61: "su geldi" timestamp marker) */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Tap
          onPress={markWaterBroke}
          style={cs.waterBtn}
          label={isEn ? "Mark water broken" : "Su geldi işaretle"}
        >
          <T bold style={{ fontSize: 13, color: '#2B5A84' }}>
            {state.waterBrokeEvent
              ? (isEn ? `💧 Water Broke: ${state.waterBrokeEvent.time}` : `💧 Su Geldi: ${state.waterBrokeEvent.time}`)
              : (isEn ? '💧 Mark Water Broke' : '💧 Su Geldi İşaretle')}
          </T>
        </Tap>
      </View>

      {/* Su Geldi Bilgi Modalı */}
      <Modal visible={showWaterNotice} transparent animationType="fade" onRequestClose={() => setShowWaterNotice(false)}>
        <View style={ts.modalBackdrop}>
          <Card style={ts.modalCard}>
            <T bold style={{ fontSize: 17, color: '#2B5A84' }}>
              {isEn ? '💧 Water Rupture Recorded' : '💧 Su Gelişi Kaydedildi'}
            </T>
            <T style={{ fontSize: 13, color: colors.ink, marginTop: 8, lineHeight: 19 }}>
              {isEn
                ? 'The timestamp has been recorded. Inform your obstetrician or midwife about the time, fluid color (clear, pink, greenish), and your contraction pattern.'
                : 'Zaman kaydedildi. Sıvının rengini (berrak, pembe, yeşilimsi), miktarını ve geliş saatini doktorunuza veya ebenize bildiriniz.'}
            </T>
            <Tap onPress={() => setShowWaterNotice(false)} style={[ts.modalBtn, { backgroundColor: '#2B5A84', marginTop: 16 }]}>
              <T bold style={{ color: 'white', fontSize: 13 }}>{isEn ? 'Understood' : 'Anladım'}</T>
            </Tap>
          </Card>
        </View>
      </Modal>

      {/* Statik Medikal Güvenlik Notu (Spec 01_CONTRACTION_COUNTER) */}
      <StatusCard
        level="info"
        title={isEn ? "Labor Progression & Medical Notice" : "Doğum İlerlemesi & Bilgilendirme"}
        body={isEn
          ? "Contraction timer is for recording and personal awareness. It does not provide medical diagnoses or determine when active labor begins. Always follow the personalized guidelines provided by your doctor or midwife."
          : "Kasılma sayacı kayıt ve kişisel takip amaçlıdır. Tıbbi teşhis koymaz veya doğum başlangıcı kararı vermez. Hastaneye gidiş anı ve süreç için daima hekiminizin veya ebenizin size özel verdiği talimatları uygulayın."}
        icon="heart"
      />

      {/* Son Kasılma Geçmişi */}
      <Section title={isEn ? "Recent Contraction Logs" : "Son Kasılma Kayıtları"} />
      {contractions.length === 0 ? (
        <Card style={{ alignItems: 'center', padding: 20 }}>
          <T style={{ color: colors.muted, fontSize: 13 }}>{isEn ? "No contractions logged yet." : "Henüz kaydedilmiş kasılma bulunmuyor."}</T>
        </Card>
      ) : (
        contractions.slice(0, 5).map(c => (
          <Card key={c.id} style={cs.logItem}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <T bold style={{ fontSize: 15, color: colors.ink }}>
                  {secondsLabel(c.durationSecs || c.duration || 0)}
                  <T style={{ fontSize: 12, fontWeight: '400', color: colors.muted }}>
                    {c.intensity ? ` · ${c.intensity}` : ''}
                  </T>
                </T>
                <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                  {c.date} · {c.time}
                </T>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <T bold style={{ fontSize: 13, color: '#3A688F' }}>
                  {c.intervalSecs ? `${Math.round(c.intervalSecs / 60)} dk ${isEn ? 'apart' : 'aralık'}` : (isEn ? 'First record' : 'İlk kayıt')}
                </T>
              </View>
            </View>
          </Card>
        ))
      )}
    </View>
  );
}

// ─── 3. HASTANE ÇANTASI (6-CATEGORY PACKING PLANNER PER SPEC 08_HOSPITAL_BAG) ───
export function HospitalBag({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState('mother'); // 'mother' | 'baby' | 'partner' | 'docs' | 'delivery' | 'home'
  const [assignedFilter, setAssignedFilter] = useState('all'); // 'all' | 'partner' | 'mother'
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemPriority, setNewItemPriority] = useState('essential');
  const [newItemAssigned, setNewItemAssigned] = useState('mother');
  const [showAddModal, setShowAddModal] = useState(false);

  // 6 Categories with item states: notPrepared, prepared, packed
  const defaultBag = isEn ? {
    mother: [
      { id: 'm1', title: 'Button-front nursing nightgown (2 pcs)', priority: 'essential', status: 'packed', assignedTo: 'mother', quantity: 2 },
      { id: 'm2', title: 'Nursing bra & soft cotton underwear', priority: 'essential', status: 'packed', assignedTo: 'mother', quantity: 4 },
      { id: 'm3', title: 'Postpartum maternity pads', priority: 'essential', status: 'prepared', assignedTo: 'mother', quantity: 10 },
      { id: 'm4', title: 'Warm non-slip hospital slippers', priority: 'recommended', status: 'notPrepared', assignedTo: 'mother', quantity: 1 },
      { id: 'm5', title: 'Lanolin nipple balm & breast pads', priority: 'recommended', status: 'notPrepared', assignedTo: 'mother', quantity: 1 },
    ],
    baby: [
      { id: 'b1', title: 'Going-home newborn hospital exit set', priority: 'essential', status: 'packed', assignedTo: 'mother', quantity: 1 },
      { id: 'b2', title: '100% cotton newborn bodysuits & mittens', priority: 'essential', status: 'packed', assignedTo: 'mother', quantity: 3 },
      { id: 'b3', title: 'Newborn diapers & water wipes', priority: 'essential', status: 'prepared', assignedTo: 'mother', quantity: 1 },
      { id: 'b4', title: 'Soft muslin blankets & swaddles', priority: 'recommended', status: 'notPrepared', assignedTo: 'mother', quantity: 2 },
    ],
    partner: [
      { id: 'p1', title: 'Long-cord phone charger & powerbank', priority: 'essential', status: 'packed', assignedTo: 'partner', quantity: 1 },
      { id: 'p2', title: 'Change of comfortable t-shirt & sweatpants', priority: 'recommended', status: 'prepared', assignedTo: 'partner', quantity: 2 },
      { id: 'p3', title: 'Healthy snacks (dates, nuts, water bottle)', priority: 'recommended', status: 'notPrepared', assignedTo: 'partner', quantity: 1 },
      { id: 'p4', title: 'Cash / coins for hospital parking & vending', priority: 'optional', status: 'notPrepared', assignedTo: 'partner', quantity: 1 },
    ],
    docs: [
      { id: 'd1', title: 'Parent ID cards & insurance documents', priority: 'essential', status: 'packed', assignedTo: 'partner', quantity: 1 },
      { id: 'd2', title: 'All pregnancy prenatal & ultrasound files', priority: 'essential', status: 'packed', assignedTo: 'partner', quantity: 1 },
      { id: 'd3', title: 'Signed birth preferences plan copy', priority: 'recommended', status: 'prepared', assignedTo: 'partner', quantity: 1 },
    ],
    delivery: [
      { id: 'del1', title: 'Lip balm & hydrating facial mist', priority: 'recommended', status: 'prepared', assignedTo: 'mother', quantity: 1 },
      { id: 'del2', title: 'Warm thick labor socks', priority: 'essential', status: 'packed', assignedTo: 'mother', quantity: 2 },
      { id: 'del3', title: 'Wireless earbuds for calming playlist', priority: 'optional', status: 'notPrepared', assignedTo: 'partner', quantity: 1 },
    ],
    home: [
      { id: 'h1', title: 'ECE-approved infant car seat (installed)', priority: 'essential', status: 'prepared', assignedTo: 'partner', quantity: 1 },
      { id: 'h2', title: 'Weather-appropriate baby fleece blanket', priority: 'recommended', status: 'notPrepared', assignedTo: 'mother', quantity: 1 },
      { id: 'h3', title: 'Comfortable loose mom going-home outfit', priority: 'essential', status: 'prepared', assignedTo: 'mother', quantity: 1 },
    ],
  } : {
    mother: [
      { id: 'm1', title: 'Önden düğmeli lohusa geceliği (2 adet)', priority: 'essential', status: 'packed', assignedTo: 'mother', quantity: 2 },
      { id: 'm2', title: 'Emzirme sütyeni & yüksek bel pamuklu çamaşır', priority: 'essential', status: 'packed', assignedTo: 'mother', quantity: 4 },
      { id: 'm3', title: 'Lohusa doğum pedi & göğüs pedi', priority: 'essential', status: 'prepared', assignedTo: 'mother', quantity: 10 },
      { id: 'm4', title: 'Kaymayan sıcak oda terliği', priority: 'recommended', status: 'notPrepared', assignedTo: 'mother', quantity: 1 },
      { id: 'm5', title: 'Lanolin göğüs ucu kremi & nemlendirici', priority: 'recommended', status: 'notPrepared', assignedTo: 'mother', quantity: 1 },
    ],
    baby: [
      { id: 'b1', title: 'Hastane çıkışı zıbın & tulum seti', priority: 'essential', status: 'packed', assignedTo: 'mother', quantity: 1 },
      { id: 'b2', title: 'Yenidoğan pamuklu çıtçıtlı body & eldiven', priority: 'essential', status: 'packed', assignedTo: 'mother', quantity: 3 },
      { id: 'b3', title: '1 paket yenidoğan bebek bezi & saf su mendili', priority: 'essential', status: 'prepared', assignedTo: 'mother', quantity: 1 },
      { id: 'b4', title: 'Müslin örtü & kundak battaniye', priority: 'recommended', status: 'notPrepared', assignedTo: 'mother', quantity: 2 },
    ],
    partner: [
      { id: 'p1', title: 'Uzun kablolu şarj aleti & powerbank', priority: 'essential', status: 'packed', assignedTo: 'partner', quantity: 1 },
      { id: 'p2', title: 'Yedek rahat tişört & eşofman', priority: 'recommended', status: 'prepared', assignedTo: 'partner', quantity: 2 },
      { id: 'p3', title: 'Enerji atıştırmalıkları (hurma, kuruyemiş, su)', priority: 'recommended', status: 'notPrepared', assignedTo: 'partner', quantity: 1 },
      { id: 'p4', title: 'Hastane otoparkı / otomat için bozuk para & nakit', priority: 'optional', status: 'notPrepared', assignedTo: 'partner', quantity: 1 },
    ],
    docs: [
      { id: 'd1', title: 'Anne ve baba kimlik kartları & sigorta belgeleri', priority: 'essential', status: 'packed', assignedTo: 'partner', quantity: 1 },
      { id: 'd2', title: 'Tüm gebelik tahlil & ultrason takip dosyası', priority: 'essential', status: 'packed', assignedTo: 'partner', quantity: 1 },
      { id: 'd3', title: 'Doğum tercih planı çıktısı (2 nüsha)', priority: 'recommended', status: 'prepared', assignedTo: 'partner', quantity: 2 },
    ],
    delivery: [
      { id: 'del1', title: 'Dudak nemlendiricisi & ferahlatıcı termal sprey', priority: 'recommended', status: 'prepared', assignedTo: 'mother', quantity: 1 },
      { id: 'del2', title: 'Doğumhane için kalın sıcak çorap', priority: 'essential', status: 'packed', assignedTo: 'mother', quantity: 2 },
      { id: 'del3', title: 'Sakinleştirici müzik için kablosuz kulaklık', priority: 'optional', status: 'notPrepared', assignedTo: 'partner', quantity: 1 },
    ],
    home: [
      { id: 'h1', title: 'Oto güvenlik koltuğu / anakucağı (arabada hazır)', priority: 'essential', status: 'prepared', assignedTo: 'partner', quantity: 1 },
      { id: 'h2', title: 'Mevsime uygun kalın bebek battaniyesi', priority: 'recommended', status: 'notPrepared', assignedTo: 'mother', quantity: 1 },
      { id: 'h3', title: 'Anne için bol & rahat taburculuk kıyafeti', priority: 'essential', status: 'prepared', assignedTo: 'mother', quantity: 1 },
    ],
  };

  const bagData = state?.hospitalBag || defaultBag;
  const categories = [
    { id: 'mother', label: isEn ? 'Mother' : 'Anne', icon: 'bag' },
    { id: 'baby', label: isEn ? 'Baby' : 'Bebek', icon: 'baby' },
    { id: 'partner', label: isEn ? 'Partner' : 'Refakatçi', icon: 'heart' },
    { id: 'docs', label: isEn ? 'Documents' : 'Belgeler', icon: 'calendar' },
    { id: 'delivery', label: isEn ? 'Delivery' : 'Doğum Odası', icon: 'star' },
    { id: 'home', label: isEn ? 'Going Home' : 'Taburculuk', icon: 'home' },
  ];

  // Flatten items across categories
  const allItems = Object.values(bagData).flat();
  const totalCount = allItems.length;
  const packedCount = allItems.filter(i => i.status === 'packed').length;
  const preparedCount = allItems.filter(i => i.status === 'prepared' || i.status === 'packed').length;
  const totalPercent = totalCount ? Math.round((packedCount / totalCount) * 100) : 0;

  const currentCategoryItems = (bagData[activeTab] || []).filter(item => {
    if (assignedFilter === 'partner') return item.assignedTo === 'partner';
    if (assignedFilter === 'mother') return item.assignedTo === 'mother';
    return true;
  });

  // 3-Stage Status Cycle: notPrepared -> prepared -> packed -> notPrepared
  function cycleItemStatus(categoryKey, itemId) {
    const nextStatusMap = {
      notPrepared: 'prepared',
      prepared: 'packed',
      packed: 'notPrepared',
    };

    const updatedCategory = (bagData[categoryKey] || []).map(item => {
      if (item.id !== itemId) return item;
      const current = item.status || (item.done ? 'packed' : 'notPrepared');
      return { ...item, status: nextStatusMap[current] || 'notPrepared' };
    });

    const updatedBag = { ...bagData, [categoryKey]: updatedCategory };
    update({ hospitalBag: updatedBag });
  }

  function handleAddItem() {
    if (!newItemTitle.trim()) return;
    const newItem = {
      id: `custom-${Date.now()}`,
      title: newItemTitle.trim(),
      priority: newItemPriority,
      status: 'notPrepared',
      assignedTo: newItemAssigned,
      quantity: 1,
    };

    const updatedBag = {
      ...bagData,
      [activeTab]: [...(bagData[activeTab] || []), newItem],
    };

    update({ hospitalBag: updatedBag });
    setNewItemTitle('');
    setShowAddModal(false);
    toast && toast(isEn ? 'Item added to bag planner' : 'Yeni madde çantaya eklendi');
  }

  const priorityLabels = {
    essential: isEn ? 'Essential' : 'Zorunlu',
    recommended: isEn ? 'Recommended' : 'Önerilen',
    optional: isEn ? 'Optional' : 'İsteğe Bağlı',
  };

  const statusBadges = {
    notPrepared: { label: isEn ? 'Hazırlanmadı' : 'Hazırlanmadı', bg: '#F2EDEE', color: '#7E6B74' },
    prepared: { label: isEn ? 'Hazırlandı' : 'Hazırlandı', bg: '#FFF5E6', color: '#A06014' },
    packed: { label: isEn ? 'Çantada ✓' : 'Çantada ✓', bg: '#EAF6EC', color: '#2B6A38' },
  };

  return (
    <View style={ts.container}>
      <ScreenHero
        asset="ui_hospital_bag_3d"
        icon="bag"
        kicker={isEn ? 'BIRTH PREPARATION' : 'DOĞUM HAZIRLIĞI'}
        title={isEn ? 'Hospital Packing Planner' : 'Hastane Çantası Planlayıcı'}
        body={isEn ? 'A real packing planner with 6 essential zones, 3 preparation states, and partner assignment.' : 'Basit bir kontrol listesi değil; 6 bölümlü, 3 aşamalı (hazır / çantada) gerçek çanta planlayıcı.'}
        stat={isEn ? `%${totalPercent} Packed (${packedCount}/${totalCount})` : `%${totalPercent} Çantada (${packedCount}/${totalCount})`}
        tint="#744E8A"
      />

      {/* Genel İlerleme Kartı */}
      <Card style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <ProgressRing
            size={72}
            strokeWidth={7}
            progress={totalPercent}
            color={colors.purple}
            bgColor="#EDE4F0"
          >
            <T bold style={{ fontSize: 14.5, color: colors.purple }}>%{totalPercent}</T>
          </ProgressRing>
          <View style={{ flex: 1 }}>
            <T bold style={{ fontSize: 15, color: colors.ink }}>
              {isEn ? `${packedCount} of ${totalCount} items packed` : `${packedCount} / ${totalCount} eşya çantaya kondu`}
            </T>
            <T style={{ fontSize: 12, color: colors.muted, marginTop: 3 }}>
              {isEn ? `${preparedCount} items gathered and ready` : `${preparedCount} eşya hazırlandı, son yerleşim bekleniyor`}
            </T>
          </View>
        </View>
      </Card>

      {/* Partner Filtreleme Seçicisi (Spec 08: "Sana atananlar" / Shared progress) */}
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
        {[
          { id: 'all', label: isEn ? 'All Items' : 'Tüm Eşyalar' },
          { id: 'mother', label: isEn ? 'Mom Only' : 'Anneye Ait' },
          { id: 'partner', label: isEn ? 'Assigned to Partner 🤝' : 'Partnerime Atananlar 🤝' },
        ].map(filter => (
          <Tap
            key={filter.id}
            onPress={() => setAssignedFilter(filter.id)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 10,
              backgroundColor: assignedFilter === filter.id ? colors.purple : '#F2EEF4',
            }}
          >
            <T bold={assignedFilter === filter.id} style={{ fontSize: 11.5, color: assignedFilter === filter.id ? 'white' : colors.ink }}>
              {filter.label}
            </T>
          </Tap>
        ))}
      </View>

      {/* 6 Kategori Yatay Kaydırma */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
        {categories.map(cat => (
          <Tap
            key={cat.id}
            onPress={() => setActiveTab(cat.id)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 9,
              borderRadius: 14,
              backgroundColor: activeTab === cat.id ? '#EDE4EF' : '#FFFFFF',
              borderWidth: 1,
              borderColor: activeTab === cat.id ? colors.purple : '#EADCEE',
            }}
          >
            <T bold={activeTab === cat.id} style={{ fontSize: 12.5, color: activeTab === cat.id ? colors.purple : colors.muted }}>
              {cat.label} ({(bagData[cat.id] || []).length})
            </T>
          </Tap>
        ))}
      </ScrollView>

      {/* Eşya Listesi (3 Aşamalı Dokunmatik Durum) */}
      <View style={{ gap: 8 }}>
        {currentCategoryItems.map(item => {
          const currentStatus = item.status || (item.done ? 'packed' : 'notPrepared');
          const badge = statusBadges[currentStatus] || statusBadges.notPrepared;

          return (
            <Card key={item.id} style={{ padding: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: item.priority === 'essential' ? '#FCEEEF' : '#F6F6F6' }}>
                      <T bold style={{ fontSize: 10, color: item.priority === 'essential' ? '#B83244' : colors.muted }}>
                        {priorityLabels[item.priority] || item.priority}
                      </T>
                    </View>
                    {item.assignedTo === 'partner' && (
                      <T style={{ fontSize: 11, color: '#4B7B56' }}>🤝 Refakatçi</T>
                    )}
                  </View>
                  <T bold style={{ fontSize: 13.5, color: colors.ink, marginTop: 4 }}>
                    {item.title || item.name}
                  </T>
                </View>

                {/* 3 Aşamalı Durum Butonu */}
                <Tap
                  onPress={() => cycleItemStatus(activeTab, item.id)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 12,
                    backgroundColor: badge.bg,
                    borderWidth: 1,
                    borderColor: badge.color + '40',
                  }}
                >
                  <T bold style={{ fontSize: 11.5, color: badge.color }}>
                    {badge.label}
                  </T>
                </Tap>
              </View>
            </Card>
          );
        })}
      </View>

      {/* Yeni Eşya Ekle Butonu */}
      <Tap
        onPress={() => setShowAddModal(true)}
        style={{ paddingVertical: 13, borderRadius: 14, backgroundColor: '#FAF6FA', borderWidth: 1.5, borderColor: '#DECDE0', alignItems: 'center', borderStyle: 'dashed' }}
      >
        <T bold style={{ fontSize: 13, color: colors.purple }}>
          {isEn ? '+ Add Custom Item' : '+ Bu Kategoriye Özel Eşya Ekle'}
        </T>
      </Tap>

      {/* Eşya Ekleme Modalı */}
      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(20,10,25,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Card style={{ width: '100%', maxWidth: 360, padding: 20, borderRadius: 22, backgroundColor: 'white', gap: 12 }}>
            <T bold style={{ fontSize: 16, color: colors.ink }}>
              {isEn ? 'Add Hospital Bag Item' : 'Çantaya Eşya Ekle'}
            </T>

            <TextInput
              value={newItemTitle}
              onChangeText={setNewItemTitle}
              placeholder={isEn ? 'Item name...' : 'Eşya adı (örn. emzirme yastığı)...'}
              placeholderTextColor="#A79AA7"
              style={ws.noteInputBox}
            />

            <T bold style={{ fontSize: 12, color: colors.ink, marginTop: 4 }}>{isEn ? 'Priority:' : 'Öncelik:'}</T>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['essential', 'recommended', 'optional'].map(p => (
                <Tap
                  key={p}
                  onPress={() => setNewItemPriority(p)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 10,
                    alignItems: 'center',
                    backgroundColor: newItemPriority === p ? colors.purple : '#F2EEF4',
                  }}
                >
                  <T bold={newItemPriority === p} style={{ fontSize: 11, color: newItemPriority === p ? 'white' : colors.ink }}>
                    {priorityLabels[p]}
                  </T>
                </Tap>
              ))}
            </View>

            <T bold style={{ fontSize: 12, color: colors.ink, marginTop: 4 }}>{isEn ? 'Assigned to:' : 'Sorumlu:'}</T>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[
                { id: 'mother', label: isEn ? 'Mother' : 'Anne' },
                { id: 'partner', label: isEn ? 'Partner' : 'Refakatçi' },
              ].map(a => (
                <Tap
                  key={a.id}
                  onPress={() => setNewItemAssigned(a.id)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 10,
                    alignItems: 'center',
                    backgroundColor: newItemAssigned === a.id ? colors.purple : '#F2EEF4',
                  }}
                >
                  <T bold={newItemAssigned === a.id} style={{ fontSize: 11, color: newItemAssigned === a.id ? 'white' : colors.ink }}>
                    {a.label}
                  </T>
                </Tap>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Tap onPress={() => setShowAddModal(false)} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#EDE8ED', alignItems: 'center' }}>
                <T bold style={{ color: colors.ink }}>{isEn ? 'Cancel' : 'İptal'}</T>
              </Tap>
              <Tap onPress={handleAddItem} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.purple, alignItems: 'center' }}>
                <T bold style={{ color: 'white' }}>{isEn ? 'Add' : 'Ekle'}</T>
              </Tap>
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

// ─── 4. NEFES & GEVŞEME KOÇU (SPEC 02_BREATHING_COACH) ────────────────────────
export function LaborBreathingGuide({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';

  // 4 Modes strictly per spec 02_BREATHING_COACH.md (No medical claims)
  const modes = [
    {
      id: 'calm',
      title: isEn ? 'Calm Breath' : 'Sakin Nefes',
      shortTitle: isEn ? 'Calm' : 'Sakin',
      subtitle: isEn ? 'Slow natural grounding rhythm' : 'Doğal topraklanma ve sakinlik',
      inhale: 4, hold: 0, exhale: 5, hold2: 0,
      color: '#4A7C9D', bg: '#F0F5FA', ring: '#C5DBEC',
      desc: isEn ? 'Breathe in for 4s, breathe out gently for 5s.' : '4 saniye sakince al, 5 saniye yumuşakça ver.',
    },
    {
      id: 'labor',
      title: isEn ? 'During Contraction' : 'Kasılma Sırasında',
      shortTitle: isEn ? 'Contraction' : 'Kasılma',
      subtitle: isEn ? 'Steady wave breath during tension' : 'Dalga anında kesintisiz yumuşak nefes',
      inhale: 4, hold: 0, exhale: 6, hold2: 0,
      color: '#B25068', bg: '#FDF1F4', ring: '#F0CAD4',
      desc: isEn ? 'Inhale through nose for 4s, slow soft mouth release for 6s.' : 'Burundan 4 saniye al, dudakları aralayarak 6 saniye yavaşça ver.',
    },
    {
      id: 'relax',
      title: isEn ? 'Deep Relaxation' : 'Gevşeme',
      shortTitle: isEn ? 'Relax' : 'Gevşeme',
      subtitle: isEn ? 'Full body softening and release' : 'Tüm bedeni ve pelvik tabanı bırakış',
      inhale: 4, hold: 2, exhale: 6, hold2: 0,
      color: '#7E4E8A', bg: '#F9F1FB', ring: '#E3C9E8',
      desc: isEn ? 'Inhale 4s, hold gently for 2s, exhale completely for 6s.' : '4 saniye al, 2 saniye sakin kal, 6 saniye boyunca tamamen bırak.',
    },
    {
      id: 'sleep',
      title: isEn ? 'Pre-Sleep & Rest' : 'Uyku Öncesi',
      shortTitle: isEn ? 'Pre-Sleep' : 'Uyku Öncesi',
      subtitle: isEn ? 'Quiet mind and peaceful transition' : 'Zihni yatıştırma ve dinlendirici uyku',
      inhale: 4, hold: 0, exhale: 7, hold2: 0,
      color: '#3B7E58', bg: '#EEF6F1', ring: '#BDE2CB',
      desc: isEn ? 'Inhale 4s, elongated calm exhale for 7s.' : '4 saniye hafifçe al, 7 saniye uzun ve dingin nefes ver.',
    },
  ];

  const [selectedModeId, setSelectedModeId] = useState('calm');
  const [phase, setPhase] = useState('idle'); // 'idle' | 'inhale' | 'hold' | 'exhale'
  const [countdown, setCountdown] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [running, setRunning] = useState(false);
  const [totalSecs, setTotalSecs] = useState(0);
  const [guidanceType, setGuidanceType] = useState('visual'); // 'visual' | 'voice' | 'haptic'

  const circleScale = useRef(new Animated.Value(1)).current;
  const circleOpacity = useRef(new Animated.Value(0.5)).current;
  const cycleRef = useRef(null);
  const timerRef = useRef(null);
  const isRunning = useRef(false);

  const activeMode = modes.find(m => m.id === selectedModeId) || modes[0];

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setTotalSecs(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  useEffect(() => {
    return () => {
      if (cycleRef.current) clearInterval(cycleRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      stopSpeech();
    };
  }, []);

  function startBreathing() {
    setRunning(true);
    isRunning.current = true;
    setCycles(0);
    setTotalSecs(0);
    runPhase('inhale', activeMode.inhale);
  }

  function stopBreathing() {
    setRunning(false);
    isRunning.current = false;
    setPhase('idle');
    setCountdown(0);
    if (cycleRef.current) clearInterval(cycleRef.current);
    stopSpeech();
    Animated.parallel([
      Animated.timing(circleScale, { toValue: 1, duration: 500, useNativeDriver: false }),
      Animated.timing(circleOpacity, { toValue: 0.5, duration: 500, useNativeDriver: false }),
    ]).start();

    if (cycles > 0) {
      toast && toast(isEn ? `Completed ${cycles} breathing cycles (${secondsLabel(totalSecs)})` : `${cycles} nefes döngüsü tamamlandı (${secondsLabel(totalSecs)})`);
    }
  }

  function runPhase(targetPhase, secondsRemaining) {
    if (!isRunning.current) return;
    setPhase(targetPhase);
    setCountdown(secondsRemaining);

    // Voice cue
    if (guidanceType === 'voice') {
      if (targetPhase === 'inhale') speakText(isEn ? 'Breathe in' : 'Nefes al');
      else if (targetPhase === 'hold') speakText(isEn ? 'Hold' : 'Tut');
      else if (targetPhase === 'exhale') speakText(isEn ? 'Breathe out' : 'Yavaşça ver');
    }

    // Organic scale animation: grows on inhale, softens on exhale
    if (targetPhase === 'inhale') {
      Animated.parallel([
        Animated.timing(circleScale, { toValue: 1.45, duration: secondsRemaining * 1000, useNativeDriver: false }),
        Animated.timing(circleOpacity, { toValue: 0.85, duration: secondsRemaining * 1000, useNativeDriver: false }),
      ]).start();
    } else if (targetPhase === 'exhale') {
      Animated.parallel([
        Animated.timing(circleScale, { toValue: 1.0, duration: secondsRemaining * 1000, useNativeDriver: false }),
        Animated.timing(circleOpacity, { toValue: 0.45, duration: secondsRemaining * 1000, useNativeDriver: false }),
      ]).start();
    }

    let left = secondsRemaining;
    if (cycleRef.current) clearInterval(cycleRef.current);
    cycleRef.current = setInterval(() => {
      left--;
      setCountdown(left);
      if (left <= 0) {
        clearInterval(cycleRef.current);
        goToNextPhase(targetPhase);
      }
    }, 1000);
  }

  function goToNextPhase(currentPhase) {
    if (!isRunning.current) return;
    if (currentPhase === 'inhale') {
      if (activeMode.hold > 0) runPhase('hold', activeMode.hold);
      else runPhase('exhale', activeMode.exhale);
    } else if (currentPhase === 'hold') {
      runPhase('exhale', activeMode.exhale);
    } else if (currentPhase === 'exhale') {
      setCycles(c => c + 1);
      runPhase('inhale', activeMode.inhale);
    }
  }

  // Check if contraction is running in parallel (spec 02_BREATHING_COACH)
  const isContractionRunning = !!state?.activeContraction;

  return (
    <View style={ts.container}>
      {/* Kasılma Entegrasyon Bandı (Nefes koçu contraction session'ı durdurmaz) */}
      {isContractionRunning && (
        <Card style={{ backgroundColor: '#FCEDF0', borderColor: '#B54964', borderWidth: 1.5, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#B54964' }} />
            <T bold style={{ fontSize: 13, color: '#B54964' }}>
              {isEn ? 'Contraction in progress' : 'Kasılma sürüyor'}
            </T>
          </View>
          <T style={{ fontSize: 12, color: '#912B44' }}>
            {isEn ? 'Breathe with each wave' : 'Dalga bitene kadar nefese odaklan'}
          </T>
        </Card>
      )}

      {/* 1. Üst Hero */}
      <ScreenHero
        title={isEn ? "Breathing & Relaxation Coach" : "Nefes & Gevşeme Koçu"}
        subtitle={isEn
          ? "Organic, calm visual guide for labor waves and daily ease. No pressure, no scores."
          : "Doğum dalgaları ve günlük rahatlama için sakin görsel rehber. Skor veya başarı yüzdesi yok; sadece anın ritmi."}
        badge={isEn ? "BREATH COACH" : "NEFES KOÇU"}
        badgeColor={activeMode.color}
        icon="leaf"
        lang={lang}
      />

      {/* 2. Mod Seçici */}
      <View style={bs.modeSelectorRow}>
        {modes.map(m => (
          <Tap
            key={m.id}
            onPress={() => {
              if (!running) setSelectedModeId(m.id);
            }}
            style={[
              bs.modePill,
              selectedModeId === m.id && { backgroundColor: m.color, borderColor: m.color },
            ]}
          >
            <T bold={selectedModeId === m.id} style={[bs.modePillText, selectedModeId === m.id && { color: 'white' }]}>
              {m.shortTitle}
            </T>
          </Tap>
        ))}
      </View>

      {/* Rehberlik Tercihi (Sesli, Titreşim, Sessiz) */}
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', marginVertical: 6 }}>
        {[
          { id: 'visual', label: isEn ? '👁️ Silent Visual' : '👁️ Sessiz Görsel' },
          { id: 'voice', label: isEn ? '🗣️ Voice Guidance' : '🗣️ Sesli Rehber' },
          { id: 'haptic', label: isEn ? '📳 Haptic' : '📳 Titreşim' },
        ].map(opt => (
          <Tap
            key={opt.id}
            onPress={() => setGuidanceType(opt.id)}
            style={[
              bs.guidanceChip,
              guidanceType === opt.id && { backgroundColor: '#ECE4F0', borderColor: colors.purple },
            ]}
          >
            <T bold={guidanceType === opt.id} style={{ fontSize: 11, color: guidanceType === opt.id ? colors.purple : colors.muted }}>
              {opt.label}
            </T>
          </Tap>
        ))}
      </View>

      {/* 3. BÜYÜK ORGANİK MOMORA FORMU (SPEC 02_BREATHING_COACH) */}
      <Card style={bs.circleCard}>
        <View style={{ alignItems: 'center', justifyContent: 'center', height: 260 }}>
          <Animated.View
            style={[
              bs.organicCircle,
              {
                backgroundColor: activeMode.bg,
                borderColor: activeMode.ring,
                transform: [{ scale: circleScale }],
                opacity: circleOpacity,
              },
            ]}
          />

          <View style={bs.circleCenterContent}>
            {running ? (
              <>
                <T bold style={[bs.phaseName, { color: activeMode.color }]}>
                  {phase === 'inhale' ? (isEn ? 'Breathe In' : 'Nefes Al') : phase === 'hold' ? (isEn ? 'Soft Hold' : 'Sakin Kal') : (isEn ? 'Breathe Out' : 'Yavaşça Ver')}
                </T>
                <T bold style={[bs.countdownBig, { color: activeMode.color }]}>
                  {countdown}
                </T>
                <T style={bs.cycleCountText}>
                  {isEn ? `Cycle ${cycles + 1}` : `${cycles + 1}. Döngü`}
                </T>
              </>
            ) : (
              <>
                <Icon name="leaf" size={32} color={activeMode.color} />
                <T bold style={[bs.idleTitle, { color: activeMode.color, marginTop: 8 }]}>
                  {activeMode.title}
                </T>
                <T style={bs.idleDesc}>
                  {activeMode.desc}
                </T>
              </>
            )}
          </View>
        </View>

        {/* Aksiyon Butonu */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          <Tap
            onPress={running ? stopBreathing : startBreathing}
            style={[
              bs.mainActionBtn,
              { backgroundColor: running ? '#C93B58' : activeMode.color },
            ]}
          >
            <T bold style={{ color: 'white', fontSize: 16 }}>
              {running ? (isEn ? 'Bitir & Dinlen' : 'Bitir & Dinlen') : (isEn ? 'Nefese Başla' : 'Nefese Başla')}
            </T>
          </Tap>
        </View>
      </Card>

      {/* Seans İstatistiği (Spec: Süre & Döngü, No scores, no percentages) */}
      {cycles > 0 && !running && (
        <Card style={{ padding: 14, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#F8F4F9' }}>
          <View style={{ alignItems: 'center' }}>
            <T bold style={{ fontSize: 18, color: colors.purple }}>{cycles}</T>
            <T style={{ fontSize: 11, color: colors.muted }}>{isEn ? 'Cycles Completed' : 'Tamamlanan Döngü'}</T>
          </View>
          <View style={{ width: 1, backgroundColor: '#E4DAE6' }} />
          <View style={{ alignItems: 'center' }}>
            <T bold style={{ fontSize: 18, color: colors.purple }}>{secondsLabel(totalSecs)}</T>
            <T style={{ fontSize: 11, color: colors.muted }}>{isEn ? 'Duration' : 'Toplam Süre'}</T>
          </View>
        </Card>
      )}
    </View>
  );
}

const cs = StyleSheet.create({
  counterCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 2,
    borderColor: '#964872',
  },
  startBtn: {
    width: 190,
    height: 190,
    borderRadius: 95,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#723154',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  btnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  stopBtn: {
    backgroundColor: '#912B44',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  breathGuideBtn: {
    backgroundColor: '#F5ECF8',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DECBE4',
  },
  waterBtn: {
    flex: 1,
    backgroundColor: '#E8F1F7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C1D9EC',
    alignItems: 'center',
  },
  logItem: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'white',
  },
});

const bs = StyleSheet.create({
  modeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  modePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E6DEE8',
  },
  modePillText: {
    fontSize: 12,
    color: colors.ink,
  },
  guidanceChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EDE4EE',
    backgroundColor: 'white',
  },
  circleCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
  },
  organicCircle: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 3,
  },
  circleCenterContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  phaseName: {
    fontSize: 20,
    letterSpacing: 0.5,
  },
  countdownBig: {
    fontSize: 48,
    marginVertical: 4,
  },
  cycleCountText: {
    fontSize: 12,
    color: colors.muted,
  },
  idleTitle: {
    fontSize: 16,
  },
  idleDesc: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 4,
  },
  mainActionBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
});

const ts = StyleSheet.create({
  container: { gap: 14, paddingBottom: 24 },
  summaryBanner: {
    backgroundColor: '#FAF5FB',
    borderWidth: 1.5,
    borderColor: '#E6D2E9',
    padding: 14,
    borderRadius: 16,
  },
  trophyBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFE2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6DED6',
    backgroundColor: 'white',
  },
  typePillText: {
    fontSize: 12,
    color: colors.ink,
  },
  kickInteractiveCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDFA',
    borderRadius: 24,
  },
  rippleCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
  },
  kickMainBtn: {
    width: 175,
    height: 175,
    borderRadius: 88,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#863C65',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  kickGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  kickMainText: {
    fontSize: 13,
    color: 'white',
    letterSpacing: 1,
    marginTop: 6,
    textAlign: 'center',
  },
  kickSubCount: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  actionMiniBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F7F2F5',
    borderWidth: 1,
    borderColor: '#EADCE6',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,10,25,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    padding: 20,
    borderRadius: 22,
    backgroundColor: 'white',
  },
  feelingOption: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9F5F9',
    borderWidth: 1,
    borderColor: '#ECE2EE',
  },
  feelingOptionSelected: {
    backgroundColor: '#F2E4F4',
    borderColor: colors.purple,
    borderWidth: 1.5,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E2D6E4',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: colors.ink,
    backgroundColor: '#FAF7FA',
    marginTop: 4,
  },
  modalBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyItem: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'white',
  },
});