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

// ─── 1. TEKME SAYACI (ADVANCED KICK COUNTER) ──────────────────────────────────
export function KickCounter({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [sessionActive, setSessionActive] = useState(false);
  const [kicks, setKicks] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [selectedType, setSelectedType] = useState('kick'); // 'kick' | 'flutter' | 'roll' | 'hiccup'
  const [typeCounts, setTypeCounts] = useState({ kick: 0, flutter: 0, roll: 0, hiccup: 0 });
  const [lastKickTime, setLastKickTime] = useState(null);
  const [completedSummary, setCompletedSummary] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const pulse = usePulse(0.96, 1.04, 1200);
  const timerRef = useRef(null);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const ripple1Scale = useRef(new Animated.Value(1)).current;
  const ripple1Opacity = useRef(new Animated.Value(0)).current;
  const ripple2Scale = useRef(new Animated.Value(1)).current;
  const ripple2Opacity = useRef(new Animated.Value(0)).current;
  const celebrationScale = useRef(new Animated.Value(0.3)).current;
  const celebrationOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (sessionActive) {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sessionActive]);

  const movementTypes = [
    { id: 'kick', label: isEn ? 'Clear Kick' : 'Net Tekme', tint: '#9A5B80' },
    { id: 'flutter', label: isEn ? 'Flutter' : 'Kıpırtı', tint: '#B8789C' },
    { id: 'roll', label: isEn ? 'Roll & Turn' : 'Dönüş & Dalga', tint: '#5C749A' },
    { id: 'hiccup', label: isEn ? 'Hiccup' : 'Hıçkırık', tint: '#6B8E71' },
  ];

  function handleKick() {
    if (!sessionActive) {
      setSessionActive(true);
    }
    const nextKicks = kicks + 1;
    setKicks(nextKicks);
    setLastKickTime(new Date().toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }));

    // 1. Tactile Elastic Spring Bounce on the Central Foot Button
    buttonScale.setValue(0.91);
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3.5,
      tension: 60,
      useNativeDriver: false,
    }).start();

    // 2. Dual Ripple Waves Radiating Outward
    ripple1Scale.setValue(1);
    ripple1Opacity.setValue(0.7);
    ripple2Scale.setValue(1);
    ripple2Opacity.setValue(0.5);

    Animated.parallel([
      Animated.timing(ripple1Scale, { toValue: 1.45, duration: 650, useNativeDriver: false }),
      Animated.timing(ripple1Opacity, { toValue: 0, duration: 650, useNativeDriver: false }),
      Animated.sequence([
        Animated.delay(100),
        Animated.parallel([
          Animated.timing(ripple2Scale, { toValue: 1.65, duration: 700, useNativeDriver: false }),
          Animated.timing(ripple2Opacity, { toValue: 0, duration: 700, useNativeDriver: false }),
        ]),
      ]),
    ]).start();

    setTypeCounts(prev => ({
      ...prev,
      [selectedType]: (prev[selectedType] || 0) + 1,
    }));

    if (nextKicks >= 10) {
      // 3. Milestone Confetti / Sparkle Burst at 10 Kicks
      setShowCelebration(true);
      celebrationScale.setValue(0.4);
      celebrationOpacity.setValue(1);
      Animated.sequence([
        Animated.spring(celebrationScale, { toValue: 1.1, friction: 4, tension: 50, useNativeDriver: false }),
        Animated.delay(1200),
        Animated.timing(celebrationOpacity, { toValue: 0, duration: 400, useNativeDriver: false }),
      ]).start(() => setShowCelebration(false));

      finishSession(nextKicks, seconds);
    }
  }

  function finishSession(finalKicks = kicks, finalSecs = seconds) {
    setSessionActive(false);
    if (finalKicks === 0) return;

    let activityRating = isEn ? 'Normal Rhythm' : 'Normal Ritim';
    if (finalSecs <= 1200) activityRating = isEn ? 'Very Active & Lively' : 'Çok Aktif & Canlı';
    else if (finalSecs <= 2700) activityRating = isEn ? 'Healthy Regular Rhythm' : 'Sağlıklı Düzenli Ritim';
    else activityRating = isEn ? 'Calm & Gentle Session' : 'Sakin & Yavaş Seans';

    const newSession = {
      id: uid(),
      date: localDay(),
      time: new Date().toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
      kicks: finalKicks,
      durationSecs: finalSecs,
      week: state?.week || 28,
      rating: activityRating,
      breakdown: { ...typeCounts, [selectedType]: (typeCounts[selectedType] || 0) + 1 },
    };

    update(old => ({
      kickSessions: [newSession, ...(old.kickSessions || [])],
    }));

    setCompletedSummary({
      duration: finalSecs,
      kicks: finalKicks,
      rating: activityRating,
    });

    saveKickSessionCloud({
      durationSeconds: finalSecs,
      kickCount: finalKicks,
      week: state?.week || 28,
      notes: `${isEn ? 'Grade: ' : 'Derece: '}${activityRating}`,
    }).catch(() => {});

    toast && toast(isEn ? `🌸 10 movements completed in ${secondsLabel(finalSecs)}!` : `🌸 10 hareket ${secondsLabel(finalSecs)} içinde tamamlandı!`);
    setKicks(0);
    setSeconds(0);
    setTypeCounts({ flutter: 0, kick: 0, roll: 0, hiccup: 0 });
  }

  function resetSession() {
    setSessionActive(false);
    setKicks(0);
    setSeconds(0);
    setTypeCounts({ flutter: 0, kick: 0, roll: 0, hiccup: 0 });
    setCompletedSummary(null);
  }

  const pastSessions = state?.kickSessions || [];
  const percent10 = Math.min(100, Math.round((kicks / 10) * 100));

  return (
    <View style={ts.container}>
      <ScreenHero
        asset="card_kick_counter"
        icon="footprint"
        kicker={isEn ? 'FETAL MOVEMENT PATTERN' : 'FETAL HAREKET DÜZENİ'}
        title={isEn ? "Count Baby's Rhythm" : "Bebeğinin Ritmini Say"}
        body={isEn ? 'Build a calm daily movement routine and compare sessions over time when your baby is active.' : 'Bebeğinin aktif olduğu saatlerde sakin bir hareket rutini oluştur; seansları zaman içinde karşılaştır.'}
        stat={pastSessions[0] ? (isEn ? `Latest: ${pastSessions[0].kicks} kicks (${secondsLabel(pastSessions[0].durationSecs || 0)})` : `Son: ${pastSessions[0].kicks} hareket (${secondsLabel(pastSessions[0].durationSecs || 0)})`) : (isEn ? 'First session ready' : 'İlk seans hazır')}
        tint="#9D5C80"
      />

      <ToolExperienceCard
        lang={lang}
        title={isEn ? 'Count, finish, compare' : 'Say, bitir, karşılaştır'}
        steps={isEn ? ['Start when baby is active.', 'Tap each movement without leaving the screen.', 'Save the session and compare recent rhythm.'] : ['Bebeğin aktifken seansı başlat.', 'Ekrandan çıkmadan her hareketi işle.', 'Seansı kaydet ve son ritimle karşılaştır.']}
        outcome={isEn ? 'The output is a clean session history, not a loose note.' : 'Çıktı dağınık bir not değil, okunur seans geçmişi olur.'}
        asset="card_kick_counter"
        tint="#B84570"
      />

      {/* Seans Tamamlanma Başarı Kartı */}
      {completedSummary && (
        <Card style={ts.summaryBanner}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={ts.trophyBadge}>
              <Icon name="check" size={20} color={colors.purple} />
            </View>
            <View style={{ flex: 1 }}>
              <T bold style={{ fontSize: 15, color: colors.purple }}>{isEn ? 'Session Completed Successfully' : 'Seans Başarıyla Tamamlandı'}</T>
              <T style={{ fontSize: 12, color: colors.ink, marginTop: 2 }}>
                {isEn ? `10 movements recorded in ` : `10 hareket `}
                <T bold>{secondsLabel(completedSummary.duration)}</T>
                {isEn ? `. (${completedSummary.rating})` : ` içinde kaydedildi. (${completedSummary.rating})`}
              </T>
              <Tap
                onPress={() => {
                  toast && toast(isEn ? '✓ Report ready to share with your doctor!' : '✓ Doktorla paylaşılacak seans notu hazırlandı!');
                }}
                style={{ marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#F2E8F4', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}
              >
                <T bold style={{ fontSize: 11.5, color: colors.purple }}>{isEn ? '📋 Copy for Doctor' : '📋 Doktora İlet / Kopyala'}</T>
              </Tap>
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
          subtext={sessionActive ? (isEn ? "Timer active" : "Sayaç aktif") : (isEn ? "Session ready" : "Seans bekleniyor")}
          icon="time"
          tint="#9D5C80"
        />
        <MetricCard
          title={isEn ? "LAST MOVEMENT" : "SON HAREKET"}
          value={lastKickTime || '--:--'}
          unit=""
          subtext={lastKickTime ? (isEn ? "Rhythm detected" : "Ritmik algılandı") : (isEn ? "No kicks yet" : "Henüz vuruş yok")}
          icon="footprint"
          tint="#6B8E71"
        />
      </View>

      {/* Hareket Türü Seçicisi (Canlı Sayaçlı) */}
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

      {/* MERKEZİ DOKUNSAL 3D TEKME ALANI (PROGRESS RING İLE) */}
      <Card style={ts.kickInteractiveCard}>
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 14, position: 'relative' }}>
          {/* Organik Dalga Yayılım Halkaları (Tactile Ripples) */}
          <Animated.View
            pointerEvents="none"
            style={[
              ts.kickRippleRing,
              {
                transform: [{ scale: ripple1Scale }],
                opacity: ripple1Opacity,
              },
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              ts.kickRippleRing,
              {
                borderColor: '#E8A6C5',
                transform: [{ scale: ripple2Scale }],
                opacity: ripple2Opacity,
              },
            ]}
          />

          <ProgressRing
            size={190}
            strokeWidth={10}
            progress={percent10}
            color={colors.purple}
            bgColor="#F2E6F2"
          >
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <Tap
                onPress={handleKick}
                label={isEn ? "I felt a kick" : "Tekme hissettim"}
                style={ts.kickCenterTap}
              >
                <LinearGradient
                  colors={sessionActive ? ['#FAF0F6', '#F3DFEE', '#E9CDE3'] : ['#FAF6F9', '#F0E6F0', '#E5D6E6']}
                  style={ts.kickCenterGradient}
                >
                  {generatedAssets['card_kick_counter'] ? (
                    <Image
                      source={generatedAssets['card_kick_counter']}
                      style={{ width: 76, height: 76 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Icon name="footprint" size={54} color={colors.purple} />
                  )}
                  <T bold style={ts.kickBigCount}>{kicks} / 10</T>
                  <T style={ts.kickSubPrompt}>
                    {sessionActive ? (isEn ? 'Tap on Kick' : 'Vuruşta Dokun') : (isEn ? 'Start Counting' : 'Saymaya Başla')}
                  </T>
                </LinearGradient>
              </Tap>
            </Animated.View>
          </ProgressRing>

          {/* 10. Vuruş Kutlama Kıvılcımları (Celebration Burst) */}
          {showCelebration && (
            <Animated.View
              pointerEvents="none"
              style={[
                ts.celebrationBurst,
                {
                  transform: [{ scale: celebrationScale }],
                  opacity: celebrationOpacity,
                },
              ]}
            >
              <T style={{ fontSize: 32 }}>🎉 ✨ 🌸 ✨ 🎉</T>
              <T bold style={{ fontSize: 13, color: colors.purple, marginTop: 4 }}>
                {isEn ? '10 Movements Reached!' : '10 Hareket Tamamlandı!'}
              </T>
            </Animated.View>
          )}
        </View>

        {/* 10 Adımlı Nokta İlerlemesi */}
        <View style={ts.dotGrid}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View
              key={i}
              style={[
                ts.dotItem,
                i < kicks && ts.dotItemFilled,
                i === kicks - 1 && ts.dotItemActive,
              ]}
            >
              {i < kicks ? (
                <Icon name="check" size={12} color="white" />
              ) : (
                <T style={ts.dotItemNum}>{i + 1}</T>
              )}
            </View>
          ))}
        </View>

        {/* Seans Kontrol Aksiyonları */}
        {sessionActive && (
          <View style={ts.sessionActions}>
            <Tap onPress={() => setKicks(k => Math.max(0, k - 1))} style={ts.actionMiniBtn}>
              <T style={{ fontSize: 12, color: colors.ink }}>{isEn ? '↩ Undo 1' : '↩ 1 Geri Al'}</T>
            </Tap>
            <Tap onPress={() => finishSession(kicks, seconds)} style={[ts.actionMiniBtn, { backgroundColor: '#F0E4F2' }]}>
              <T bold style={{ fontSize: 12, color: colors.purple }}>{isEn ? '✓ Finish Session' : '✓ Seansı Bitir'}</T>
            </Tap>
            <Tap onPress={resetSession} style={ts.actionMiniBtn}>
              <T style={{ fontSize: 12, color: '#B35E6D' }}>{isEn ? '✕ Reset' : '✕ Sıfırla'}</T>
            </Tap>
          </View>
        )}
      </Card>

      {/* Hareket Takibi Rehber Kartı */}
      <StatusCard
        level="info"
        title={isEn ? "Movement Tracking Note" : "Hareket Takibi Notu"}
        body={isEn ? "Counting in a calm moment helps you notice your baby’s rhythm. If movement feels unusual, follow your own care team’s guidance." : "Sakin bir anda saymak bebeğinin ritmini fark etmeyi kolaylaştırır. Hareket düzeni olağan dışı gelirse kendi bakım ekibinin yönlendirmesini izle."}
        icon="heart"
      />

      {/* Son Seans Kayıtları */}
      <Section title={isEn ? "Recent Kick Sessions" : "Son Seans Kayıtları"} />
      {pastSessions.length === 0 ? (
        <Card style={{ alignItems: 'center', padding: 20 }}>
          <T style={{ color: colors.muted, fontSize: 13 }}>{isEn ? "No kick sessions recorded yet." : "Henüz kaydedilmiş tekme seansı bulunmuyor."}</T>
        </Card>
      ) : (
        pastSessions.slice(0, 5).map(s => (
          <Card key={s.id} style={ts.historyItem}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <CleanIcon asset="card_kick_counter" size={34} imgSize={30} />
                <View>
                  <T bold style={{ fontSize: 14 }}>{s.kicks || 10} {isEn ? "Movements Completed" : "Hareket Tamamlandı"}</T>
                  <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                    {s.date} · {s.time} · {isEn ? `Week ${s.week}` : `${s.week}. Hafta`}
                  </T>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <T bold style={{ fontSize: 14, color: colors.purple }}>{secondsLabel(s.durationSecs || s.duration || 0)}</T>
                <T style={{ fontSize: 10, color: '#4B7B56', marginTop: 2 }}>{s.rating || (isEn ? 'Normal Rhythm' : 'Normal Ritim')}</T>
              </View>
            </View>
          </Card>
        ))
      )}
    </View>
  );
}

// ─── 2. KASILMA SAYACI & 5-1-1 DOĞUM KONSOLU (CLINICAL LABOR CONTRACTION SUITE) ───
export function ContractionTimer({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [active, setActive] = useState(false);
  const [duration, setDuration] = useState(0);
  const [intensity, setIntensity] = useState('Orta'); // 'Hafif' | 'Orta' | 'Şiddetli'
  const [showPartnerTips, setShowPartnerTips] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [justSavedEntry, setJustSavedEntry] = useState(null);
  const [undoCountdown, setUndoCountdown] = useState(8);
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
  const lastIntervalSecs = lastContraction?.intervalSecs;

  // ─── 5-1-1 & 4-1-1 ACOG Tıbbi Hesaplama Algoritması ───
  let isFiveOneOneActive = false;
  let statusLevel = 'safe';
  let statusTitle = isEn ? 'Early Labor / Braxton Hicks Phase' : 'Erken Evre / Yalancı Kasılma (Braxton Hicks)';
  let statusBody = isEn
    ? 'Contractions are irregular or mild. Rest on your left side, drink warm water, and observe wave patterns.'
    : 'Kasılmalar henüz düzensiz veya hafif. Sol yanınıza uzanıp ılık su için, dalgaları sakince gözlemleyin.';

  let avgDurationSecs = 0;
  let avgIntervalMins = 0;

  if (contractions.length >= 3) {
    const recent = contractions.slice(0, 5);
    avgDurationSecs = Math.round(recent.reduce((sum, c) => sum + (c.durationSecs || 0), 0) / recent.length);
    const intervals = recent.map(c => c.intervalSecs).filter(Boolean);
    const avgIntervalSecs = intervals.length ? Math.round(intervals.reduce((sum, i) => sum + i, 0) / intervals.length) : null;
    avgIntervalMins = avgIntervalSecs ? (avgIntervalSecs / 60).toFixed(1) : 0;

    if (avgIntervalSecs && avgIntervalSecs <= 300 && avgDurationSecs >= 50) {
      isFiveOneOneActive = true;
      statusLevel = 'alert';
      statusTitle = isEn ? '🚨 5-1-1 RULE: ACTIVE LABOR IN PROGRESS!' : '🚨 5-1-1 KURALI: AKTİF DOĞUM EVRESİ BAŞLADI!';
      statusBody = isEn
        ? 'Contractions are coming every 5 minutes and lasting at least 1 minute. Call your obstetrician and head to the hospital!'
        : 'Kasılmalarınız her 5 dakikada bir geliyor ve en az 1 dakika sürüyor. Lütfen hekiminizi veya doğum hastanenizi arayarak yola çıkın!';
    } else if (avgIntervalSecs && avgIntervalSecs <= 480) {
      statusLevel = 'warning';
      statusTitle = isEn ? 'Labor Accelerating (Getting Closer)' : 'Kasılmalar Sıklaşıyor & Düzenli Faz';
      statusBody = isEn
        ? 'Wave intervals dropped under 8 minutes. Double check your hospital bag and inform your birth partner.'
        : 'Kasılma aralıkları 8 dakikanın altına indi. Hastane çantanızı kontrol edin ve refakatçinizi yanınıza çağırın.';
    }
  }

  function toggleContraction() {
    if (!active) {
      setActive(true);
      startedAtRef.current = Date.now();
      setDuration(0);
      setJustSavedEntry(null);
    } else {
      setActive(false);
      const now = new Date();
      const finalDuration = startedAtRef.current
        ? Math.max(1, Math.round((now.getTime() - startedAtRef.current) / 1000))
        : Math.max(1, duration);
      startedAtRef.current = null;

      let intervalSecs = null;
      if (lastContraction && lastContraction.timestamp) {
        intervalSecs = Math.round((now.getTime() - lastContraction.timestamp) / 1000);
      }

      const entry = {
        id: uid ? uid() : Date.now().toString(),
        durationSecs: finalDuration,
        intervalSecs,
        intensity,
        timestamp: now.getTime(),
        time: now.toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
        date: localDay(now),
      };

      update(old => ({
        contractionSessions: [entry, ...(old.contractionSessions || [])],
      }));

      setJustSavedEntry(entry);

      offlineSyncQueue.enqueue(createTrackerEvent({
        type: 'contraction',
        metadata: {
          durationSecs: finalDuration,
          intervalSecs,
          intensity,
          startedAt: new Date(now.getTime() - finalDuration * 1000).toISOString(),
          statusAlert: isFiveOneOneActive ? '5-1-1 Rule Met' : 'Regular Monitoring',
        },
      })).catch(() => {});

      saveContractionSessionCloud({
        durationSeconds: finalDuration,
        intervalSeconds: intervalSecs,
        intensity,
        statusAlert: isFiveOneOneActive ? (isEn ? '5-1-1 Rule Met' : '5-1-1 Kuralı Karşılandı') : (isEn ? 'Regular Monitoring' : 'Normal Takip'),
      }).catch(() => {});

      toast && toast(isEn ? `Contraction saved (${finalDuration}s)` : `Sancı kaydedildi (${finalDuration} sn) ✨`);
      setDuration(0);
    }
  }

  function handleUndoContraction() {
    if (!justSavedEntry) return;
    const targetId = justSavedEntry.id;
    update(old => ({
      contractionSessions: (old.contractionSessions || []).filter(c => c.id !== targetId),
    }));
    setJustSavedEntry(null);
    if (undoTimerRef.current) clearInterval(undoTimerRef.current);
    toast && toast(isEn ? 'Contraction log undone.' : 'Sancı kaydı geri alındı.');
  }

  function generateDoctorReport() {
    const dateStr = new Date().toLocaleDateString(isEn ? 'en-US' : 'tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    const count = contractions.length;
    const reportText = isEn
      ? `🏥 MOMORA LABOR CONTRACTION REPORT\n📅 Date: ${dateStr}\n🔢 Recorded Contractions: ${count}\n⏳ Avg Duration: ${avgDurationSecs}s\n🔄 Avg Frequency: every ${avgIntervalMins} mins\n💥 Current Intensity: ${intensity}\n🩺 Clinical Triage: ${statusTitle}\n📝 Status: ${statusBody}`
      : `🏥 MOMORA DOĞUM SANCISI RAPORU\n📅 Tarih: ${dateStr}\n🔢 Kaydedilen Kasılma: ${count} adet\n⏳ Ortalama Süre: ${avgDurationSecs} sn\n🔄 Ortalama Sıklık: ${avgIntervalMins} dakikada bir\n💥 Son Şiddet: ${intensity}\n🩺 Klinik Durum: ${statusTitle}\n📝 Not: ${statusBody}`;

    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(reportText).then(() => {
        toast && toast(isEn ? '📋 Doctor report copied to clipboard!' : '📋 Hekim bilgilendirme raporu kopyalandı!');
      }).catch(() => {});
    } else {
      toast && toast(isEn ? 'Report generated.' : 'Rapor hazırlandı.');
    }
  }

  const intensityOptions = [
    { id: 'Hafif', label: isEn ? 'Mild 🟡' : 'Hafif 🟡', color: '#E5A93C', desc: isEn ? 'Can talk through it' : 'Konuşabiliyor' },
    { id: 'Orta', label: isEn ? 'Moderate 🟠' : 'Orta 🟠', color: '#D9733A', desc: isEn ? 'Needs to focus' : 'Nefese odaklanıyor' },
    { id: 'Şiddetli', label: isEn ? 'Intense 🔴' : 'Şiddetli 🔴', color: '#C93B58', desc: isEn ? 'Cannot speak, peak wave' : 'Zirve sancı, masaj şart' },
  ];

  return (
    <View style={ts.container}>
      {/* 1. Üst Hero */}
      <ScreenHero
        title={isEn ? "Contraction & Labor Console" : "Sancı & Doğum Konsolu"}
        subtitle={isEn
          ? "ACOG 5-1-1 protocol labor decision engine. Real-time frequency, duration & triage alert."
          : "ACOG 5-1-1 klinik doğum motoru. Gerçek zamanlı aralık, süre takibi ve hastaneye gidiş uyarısı."}
        badge={isEn ? "ACOG 5-1-1 ENGINE" : "5-1-1 PROTOKOLÜ"}
        badgeColor={isFiveOneOneActive ? '#C93B58' : '#3A688F'}
        icon="contraction"
        lang={lang}
      />

      {/* 2. 5-1-1 Klinik Tıbbi Durum Bildirim Kartı */}
      <StatusCard
        level={statusLevel}
        title={statusTitle}
        body={statusBody}
        action={isFiveOneOneActive ? (isEn ? "🚨 Call Maternity Hospital" : "🚨 Doğum Hastanesini / Doktoru Ara") : null}
        onAction={() => toast && toast(isEn ? 'Routing emergency call...' : 'Hekim / Hastane araması başlatılıyor...')}
      />

      {/* Anında Kayıt ve 8 sn Geri Al (Undo) */}
      {justSavedEntry && (
        <Card style={{ backgroundColor: '#EEF7EE', borderColor: '#84B886', borderWidth: 1.5, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <T bold style={{ fontSize: 13.5, color: '#2D6632' }}>
              {isEn ? '✓ Contraction Logged' : '✓ Sancı Kaydedildi'} · {secondsLabel(justSavedEntry.durationSecs)} ({justSavedEntry.intensity})
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

      {/* 3. Dev Taktil Canlı Sancı Düğmesi (Contraction Wave Console) */}
      <Card style={[ts.counterBox, active && { borderColor: '#D95370', backgroundColor: '#FDF2F4' }]}>
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
          {/* Canlı Dalgamsı Halka */}
          <View style={{ width: 170, height: 170, alignItems: 'center', justifyContent: 'center' }}>
            {active && (
              <Animated.View
                style={[
                  ts.activeWaveRing,
                  {
                    transform: [{ scale: rippleScale }],
                    opacity: rippleOpacity,
                  },
                ]}
              />
            )}
            <Tap
              onPress={toggleContraction}
              style={[
                ts.giantWaveBtn,
                { backgroundColor: active ? '#C93B58' : '#3A688F' },
              ]}
            >
              <Animated.View style={{ transform: [{ scale: active ? waveAnim : 1 }], alignItems: 'center' }}>
                <Icon name="contraction" size={36} color="white" />
                <T bold style={{ fontSize: 14, color: 'white', marginTop: 4, letterSpacing: 0.5 }}>
                  {active ? (isEn ? 'STOP & SAVE' : 'SANCI BİTTİ') : (isEn ? 'START WAVE' : 'SANCI BAŞLADI')}
                </T>
                <T style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                  {active ? (isEn ? 'Tap when peak passes' : 'Dalga bitince dokun') : (isEn ? 'Tap to track duration' : 'Tek dokunuşla kaydet')}
                </T>
              </Animated.View>
            </Tap>
          </View>

          {/* Sayaç Metni */}
          <View style={{ alignItems: 'center', marginTop: 14 }}>
            <T style={ts.counterLabel}>
              {active ? (isEn ? '〰️ ACTIVE CONTRACTION WAVE 〰️' : '〰️ AKTİF DOĞUM KASILMASI 〰️') : (isEn ? 'CONTRACTION TIMER' : 'SANCI KRONOMETRESİ')}
            </T>
            <T bold style={[ts.counterNumber, active && { color: '#C93B58' }]}>
              {secondsLabel(duration)}
            </T>
            {lastIntervalSecs && !active && (
              <T style={ts.counterSub}>
                {isEn ? 'Since last contraction: ' : 'Son kasılmadan bu yana: '}
                <T bold>{Math.round(lastIntervalSecs / 60)} {isEn ? 'min' : 'dk'} {lastIntervalSecs % 60} {isEn ? 'sec' : 'sn'}</T>
              </T>
            )}
          </View>
        </View>

        {/* Canlı Şiddet Seçici Segmenti */}
        <View style={{ borderTopWidth: 1, borderColor: active ? '#F5CCD6' : '#ECE4EE', paddingTop: 12, marginTop: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <T bold style={{ fontSize: 12.5, color: colors.ink }}>{isEn ? 'Wave Intensity:' : 'Kasılma Şiddeti:'}</T>
            <T style={{ fontSize: 11, color: colors.muted }}>
              {intensityOptions.find(o => o.id === intensity)?.desc}
            </T>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {intensityOptions.map(lvl => (
              <Tap
                key={lvl.id}
                onPress={() => setIntensity(lvl.id)}
                style={[
                  ts.intensityPill,
                  intensity === lvl.id && { backgroundColor: lvl.color, borderColor: lvl.color },
                ]}
              >
                <T
                  bold={intensity === lvl.id}
                  style={[ts.intensityText, intensity === lvl.id && { color: 'white' }]}
                >
                  {lvl.label}
                </T>
              </Tap>
            ))}
          </View>
        </View>
      </Card>

      {/* 4. Canlı İkili Klinik Metrikler */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <MetricCard
          title={isEn ? "LAST CONTRACTION" : "SON KASILMA"}
          value={lastContraction ? `${lastContraction.durationSecs || 0} ${isEn ? 's' : 'sn'}` : '--'}
          unit=""
          subtext={lastContraction ? `${isEn ? 'Intensity: ' : 'Şiddet: '}${lastContraction.intensity}` : (isEn ? 'Waiting for wave' : 'Kayıt bekleniyor')}
          icon="time"
          tint="#C93B58"
        />
        <MetricCard
          title={isEn ? "WAVE INTERVAL" : "SANCI SIKLIĞI"}
          value={lastIntervalSecs ? `${Math.round(lastIntervalSecs / 60)} ${isEn ? 'm' : 'dk'}` : '--'}
          unit=""
          subtext={lastIntervalSecs ? `${lastIntervalSecs % 60} ${isEn ? 'sec interval' : 'sn aralık'}` : (isEn ? 'First wave logged' : 'İlk sancı')}
          icon="contraction"
          tint="#3A688F"
        />
      </View>

      {/* 5. Görsel Kasılma Dalga Histogramı (Visual Wave Timeline) */}
      {contractions.length > 0 && (
        <Card style={{ padding: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="soundwave" size={16} color={colors.purple} />
              <T bold style={{ fontSize: 13.5, color: colors.ink }}>
                {isEn ? 'Contraction Wave Intensity History' : 'Son Kasılma Dalgaları & Şiddet'}
              </T>
            </View>
            <T style={{ fontSize: 11, color: colors.muted }}>
              {isEn ? 'Last 6 waves' : 'Son 6 dalga'}
            </T>
          </View>

          {/* Histogram Çubukları */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 85, paddingHorizontal: 4 }}>
            {contractions.slice(0, 6).reverse().map((c, idx) => {
              const dur = c.durationSecs || 30;
              const barHeight = Math.min(75, Math.max(22, (dur / 90) * 75));
              const barColor = c.intensity === 'Şiddetli' ? '#C93B58' : c.intensity === 'Orta' ? '#D9733A' : '#E5A93C';
              return (
                <View key={c.id || idx} style={{ alignItems: 'center', flex: 1 }}>
                  <T style={{ fontSize: 10, color: colors.muted, marginBottom: 2 }}>{dur}s</T>
                  <View
                    style={{
                      width: 22,
                      height: barHeight,
                      backgroundColor: barColor,
                      borderRadius: 6,
                    }}
                  />
                  <T style={{ fontSize: 9.5, color: colors.ink, marginTop: 4, fontWeight: '600' }}>
                    {c.time ? c.time.slice(0, 5) : `#${idx + 1}`}
                  </T>
                </View>
              );
            })}
          </View>
        </Card>
      )}

      {/* 6. Hekime & Ebeye Rapor Gönder Butonu */}
      <Tap
        onPress={generateDoctorReport}
        style={{
          backgroundColor: '#F5F1FA',
          borderWidth: 1.5,
          borderColor: '#D4C6E2',
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Icon name="chat" size={17} color={colors.purple} />
        <T bold style={{ fontSize: 13.5, color: colors.purple }}>
          {isEn ? '📋 Copy Clinical Report for Doctor / Midwife' : '📋 Doktor / Ebe İçin Klinik Raporu Kopyala'}
        </T>
      </Tap>

      {/* 7. Eş & Refakatçi Doğum Koçluğu Rehberi */}
      <Card style={{ padding: 14 }}>
        <Tap
          onPress={() => setShowPartnerTips(!showPartnerTips)}
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="heart" size={16} color={colors.purple} />
            <T bold style={{ fontSize: 13.5, color: colors.purple }}>
              {isEn ? 'Partner & Doula Coaching Guide' : 'Eş & Doğum Refakatçisi Koçluk Rehberi'}
            </T>
          </View>
          <Icon name={showPartnerTips ? "chevron" : "down"} size={16} color={colors.muted} />
        </Tap>
        {showPartnerTips && (
          <View style={{ marginTop: 10, gap: 8, borderTopWidth: 1, borderColor: '#F0E5F0', paddingTop: 10 }}>
            <T style={{ fontSize: 12, color: colors.ink, lineHeight: 18 }}>
              🌬️ <T bold>{isEn ? 'Breathing Rhythm:' : 'Nefes Ritmi:'}</T> {isEn ? 'Inhale deeply through your nose for 4 seconds as the contraction rises, then exhale gently through your mouth for 6 seconds.' : 'Kasılma dalgası yükselirken 4 saniye boyunca burundan derin nefes alın, 6 saniyede gevşeyerek ağızdan sakince üfleyin.'}
            </T>
            <T style={{ fontSize: 12, color: colors.ink, lineHeight: 18 }}>
              💆 <T bold>{isEn ? 'Partner Massage:' : 'Sakrum Baskısı:'}</T> {isEn ? 'Applying steady circular palm pressure to the lower back (sacrum) noticeably relieves contraction discomfort.' : 'Kasılma sırasında belin alt kısmına (sakrum bölgesi) iki el ayasıyla karşı baskı uygulamak sancı algısını yarı yarıya hafifletir.'}
            </T>
            <T style={{ fontSize: 12, color: colors.ink, lineHeight: 18 }}>
              💧 <T bold>{isEn ? 'Hydration & Calm:' : 'Sıvı Desteği:'}</T> {isEn ? 'Offer a small sip of water or ice chips between waves. Never let mother feel rushed.' : 'Dalga bittiğinde hemen bir yudum ılık su uzatın ve alnını nemli bezle serinletin.'}
            </T>
          </View>
        )}
      </Card>

      {/* 8. Geçmiş Kasılmalar Listesi */}
      <Section title={isEn ? "Recent Contraction Timeline" : "Son Kasılma Zaman Çizelgesi"} />
      {contractions.length === 0 ? (
        <Card style={{ alignItems: 'center', padding: 22 }}>
          <T style={{ color: colors.muted, fontSize: 13 }}>
            {isEn ? "No contractions logged yet. Tap the wave button when a contraction starts." : "Henüz kaydedilmiş kasılma bulunmuyor. Dalga başladığında butona dokunun."}
          </T>
        </Card>
      ) : (
        contractions.slice(0, 8).map(c => {
          const isIntense = c.intensity === 'Şiddetli';
          const isMod = c.intensity === 'Orta';
          const dotColor = isIntense ? '#C93B58' : isMod ? '#D9733A' : '#E5A93C';
          return (
            <Card key={c.id} style={[ts.historyItem, { borderLeftWidth: 3.5, borderLeftColor: dotColor }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <CleanIcon asset="card_contractions" size={34} imgSize={28} />
                  <View>
                    <T bold style={{ fontSize: 14 }}>{isEn ? 'Duration: ' : 'Süre: '}{secondsLabel(c.durationSecs || 0)}</T>
                    <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                      {c.date} · {c.time} · <T bold style={{ color: dotColor }}>{c.intensity || (isEn ? 'Moderate' : 'Orta')}</T>
                    </T>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <T bold style={{ fontSize: 13, color: '#3A688F' }}>
                    {c.intervalSecs ? `${Math.round(c.intervalSecs / 60)} ${isEn ? 'min' : 'dk'} ${c.intervalSecs % 60} ${isEn ? 'sec' : 'sn'}` : (isEn ? 'First wave' : 'İlk sancı')}
                  </T>
                  <T style={{ fontSize: 9.5, color: colors.muted, marginTop: 1 }}>{isEn ? 'interval' : 'aralık'}</T>
                </View>
              </View>
            </Card>
          );
        })
      )}
    </View>
  );
}

// ─── 3. HASTANE ÇANTASI (ADVANCED 4-CATEGORY HOSPITAL BAG) ─────────────────────
export function HospitalBag({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState('mother'); // 'mother' | 'baby' | 'partner' | 'docs'
  const [newItemName, setNewItemName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const defaultBag = isEn ? {
    mother: [
      { id: 'm1', name: 'Button-front nursing nightgown (2 pcs)', done: true },
      { id: 'm2', name: 'Nursing bra & tanks (2 pcs)', done: true },
      { id: 'm3', name: 'Postpartum maternity pads & cotton underwear', done: false },
      { id: 'm4', name: 'Non-slip comfortable hospital slippers', done: false },
      { id: 'm5', name: 'Nipple cream (Pure lanolin)', done: true },
      { id: 'm6', name: 'Lip balm & hairband / ties', done: false },
      { id: 'm7', name: 'Warm shawl / robe', done: false },
    ],
    baby: [
      { id: 'b1', name: 'Newborn take-home outfit (onesie, hat, mittens)', done: true },
      { id: 'b2', name: 'Newborn diapers (1 pack - size 1)', done: true },
      { id: 'b3', name: 'Cotton muslin swaddles & burp cloths (4 pcs)', done: false },
      { id: 'b4', name: 'Water wipes & barrier diaper cream', done: false },
      { id: 'b5', name: 'Season-appropriate baby blanket', done: true },
      { id: 'b6', name: 'Car seat properly installed for going home', done: false },
    ],
    partner: [
      { id: 'p1', name: 'Spare comfortable t-shirt & sweatpants', done: true },
      { id: 'p2', name: 'Long cable phone charger & powerbank', done: false },
      { id: 'p3', name: 'Healthy snacks (nuts, dates, water)', done: false },
      { id: 'p4', name: 'Cash / coins for parking & vending machines', done: false },
    ],
    docs: [
      { id: 'd1', name: 'Photo IDs for both parents', done: true },
      { id: 'd2', name: 'All pregnancy ultrasounds & lab results file', done: true },
      { id: 'd3', name: 'Health insurance card & hospital documents', done: false },
      { id: 'd4', name: 'Printed copy of signed birth plan', done: false },
    ],
  } : {
    mother: [
      { id: 'm1', name: 'Önden düğmeli lohusa geceliği (2 adet)', done: true },
      { id: 'm2', name: 'Emzirme sütyeni & atletleri (2 adet)', done: true },
      { id: 'm3', name: 'Lohusa depend pedi & pamuklu iç çamaşırı', done: false },
      { id: 'm4', name: 'Kaymayan rahat hastane terliği', done: false },
      { id: 'm5', name: 'Meme ucu kremi (Lanolin saf)', done: true },
      { id: 'm6', name: 'Dudak nemlendirici & saç bandı / toka', done: false },
      { id: 'm7', name: 'Geniş şal / sabahlık', done: false },
    ],
    baby: [
      { id: 'b1', name: 'Yenidoğan hastane çıkış seti (zıbın, tulum, şapka)', done: true },
      { id: 'b2', name: 'Yenidoğan bebek bezi (1 paket - 1 numara)', done: true },
      { id: 'b3', name: 'Pamuklu müslin örtüler & ağız mendilleri (4 adet)', done: false },
      { id: 'b4', name: 'Saf su içerikli ıslak mendil & pişik önleyici', done: false },
      { id: 'b5', name: 'Mevsime uygun bebek battaniyesi', done: true },
      { id: 'b6', name: 'Hastane çıkışı için oto koltuğu / puset', done: false },
    ],
    partner: [
      { id: 'p1', name: 'Yedek rahat tişört & eşofman', done: true },
      { id: 'p2', name: 'Uzun kablolu telefon şarj aleti & powerbank', done: false },
      { id: 'p3', name: 'Sağlıklı atıştırmalıklar (fındık, hurma, su)', done: false },
      { id: 'p4', name: 'Otopark & otomat için bozuk para / nakit', done: false },
    ],
    docs: [
      { id: 'd1', name: 'Anne ve baba kimlik kartları', done: true },
      { id: 'd2', name: 'Tüm gebelik ultrason & tahlil dosyası', done: true },
      { id: 'd3', name: 'Sağlık sigortası kartı / poliçe evrakları', done: false },
      { id: 'd4', name: 'İmzalanmış doğum planı çıktısı', done: false },
    ],
  };

  const bagData = state?.hospitalBag || defaultBag;
  const currentItems = bagData[activeTab] || [];

  // Toplam İlerleme Hesaplama
  const allItems = [...(bagData.mother || []), ...(bagData.baby || []), ...(bagData.partner || []), ...(bagData.docs || [])];
  const totalCount = allItems.length;
  const packedCount = allItems.filter(i => i.done).length;
  const totalPercent = totalCount ? Math.round((packedCount / totalCount) * 100) : 0;

  function toggleItem(id) {
    const updatedCategory = currentItems.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    const updatedBag = { ...bagData, [activeTab]: updatedCategory };
    update({ hospitalBag: updatedBag });
    toast && toast(isEn ? 'Bag checklist updated.' : 'Çanta listesi güncellendi.');
  }

  function handleAddItem() {
    if (!newItemName.trim()) return;
    const newItem = {
      id: 'custom-' + Date.now(),
      name: newItemName.trim(),
      done: false,
    };
    const updatedBag = {
      ...bagData,
      [activeTab]: [...(bagData[activeTab] || []), newItem],
    };
    update({ hospitalBag: updatedBag });
    setNewItemName('');
    setShowAddModal(false);
    toast && toast(isEn ? 'Item added to bag.' : 'Yeni madde çantaya eklendi.');
  }

  const tabs = [
    { id: 'mother', label: isEn ? 'Mom' : 'Anne' },
    { id: 'baby', label: isEn ? 'Baby' : 'Bebek' },
    { id: 'partner', label: isEn ? 'Partner' : 'Refakatçi' },
    { id: 'docs', label: isEn ? 'Documents' : 'Evraklar' },
  ];

  return (
    <View style={ts.container}>
      <ScreenHero
        asset="ui_hospital_bag_3d"
        icon="bag"
        kicker={isEn ? 'BIRTH PREPARATION' : 'DOĞUM HAZIRLIĞI'}
        title={isEn ? 'Hospital Bag Checklist' : 'Hastane Çantası Listesi'}
        body={isEn ? 'Recommended to be packed by weeks 32-34: essentials for mom, baby, and partner all in one place.' : '32-34. haftada hazır olması önerilen anne, bebek ve refakatçi gereksinimleri tek çatı altında.'}
        stat={isEn ? `%${totalPercent} Ready (${packedCount}/${totalCount})` : `%${totalPercent} Hazır (${packedCount}/${totalCount})`}
        tint="#744E8A"
      />
      <ToolExperienceCard lang={lang} title={isEn ? 'Pack by role' : 'Role göre çanta hazırla'} steps={isEn ? ['Separate mother, baby, partner, and document items.', 'Tick what is ready.', 'Add custom items for your hospital.'] : ['Anne, bebek, refakatçi ve evrakları ayır.', 'Hazır olanları işaretle.', 'Kendi hastanen için özel eşya ekle.']} outcome={isEn ? 'The result feels like a real hospital checklist.' : 'Sonuç gerçek hastane hazırlık listesi gibi görünür.'} asset="ui_hospital_bag_3d" tint="#7C5292" />

      {/* Genel İlerleme Dairesel Göstergesi */}
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
            <T bold style={{ fontSize: 16, color: colors.ink }}>
              {totalPercent === 100 ? (isEn ? '🎉 Bag Completely Packed!' : '🎉 Çantanız Tamamen Hazır!') : (isEn ? 'Packing Status' : 'Hazırlık Durumu')}
            </T>
            <T style={{ fontSize: 12, color: colors.muted, marginTop: 3 }}>
              {totalPercent === 100 ? (isEn ? 'Congratulations! Your hospital bag is all set.' : 'Tebrikler! Doğum çantanız eksiksiz hazır.') : (isEn ? `${packedCount} of ${totalCount} items packed (${totalCount - packedCount} remaining).` : `Toplam ${totalCount} eşyadan ${packedCount} tanesi çantada (${totalCount - packedCount} kalan).`)}
            </T>
          </View>
        </View>
      </Card>

      {/* Kategori Sekmeleri */}
      <View style={ts.bagTabRow}>
        {tabs.map(t => {
          const items = bagData[t.id] || [];
          const done = items.filter(i => i.done).length;
          return (
            <Tap
              key={t.id}
              onPress={() => setActiveTab(t.id)}
              style={[ts.bagTabBtn, activeTab === t.id && ts.bagTabBtnActive]}
            >
              <T bold={activeTab === t.id} style={[ts.bagTabText, activeTab === t.id && { color: colors.purple }]}>
                {t.label} ({done}/{items.length})
              </T>
            </Tap>
          );
        })}
      </View>

      {/* Eşya Listesi */}
      <View style={{ gap: 8 }}>
        {currentItems.map(item => {
          const itemDisplayName = isEn
            ? (defaultBag[activeTab]?.find(d => d.id === item.id)?.name || item.name)
            : (item.name);
          return (
            <Tap
              key={item.id}
              onPress={() => toggleItem(item.id)}
              style={[ts.bagItemRow, item.done && ts.bagItemRowDone]}
            >
              <View style={[ts.bagItemCheck, item.done && ts.bagItemCheckDone]}>
                {item.done && <Icon name="check" size={13} color="white" />}
              </View>
              <T style={[ts.bagItemText, item.done && ts.bagItemTextDone]}>
                {itemDisplayName}
              </T>
            </Tap>
          );
        })}
      </View>

      {/* Yeni Madde Ekleme Alanı */}
      <View style={ts.addItemRow}>
        <TextInput
          value={newItemName}
          onChangeText={setNewItemName}
          placeholder={isEn ? "Add a custom item to this category..." : "Bu kategoriye özel bir eşya ekle..."}
          placeholderTextColor={colors.muted}
          style={ts.addItemInput}
          onSubmitEditing={handleAddItem}
        />
        <Tap onPress={handleAddItem} style={ts.addItemBtn}>
          <Icon name="plus" size={16} color="white" />
          <T bold style={{ color: 'white', fontSize: 12 }}>{isEn ? 'Add' : 'Ekle'}</T>
        </Tap>
      </View>
    </View>
  );
}

// ─── 4. DOĞUM NEFES REHBERİ (PREMIUM CLINICAL LABOR BREATHING STUDIO) ──────────
export function LaborBreathingGuide({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';

  const techniques = [
    {
      id: '478',
      title: isEn ? '4-7-8 Deep Vagus Reset' : '4-7-8 Sakinleştirici & Vagus Dinlenmesi',
      shortTitle: '4·7·8 Vagus',
      subtitle: isEn ? 'Parasympathetic recovery between contractions' : 'Sancılar arası parasempatik toparlanma',
      inhale: 4, hold: 7, exhale: 8, hold2: 0,
      color: '#4A7C9D', bg: '#F0F5FA', ring: '#C5DBEC',
      desc: isEn
        ? 'Inhale 4s → hold 7s → exhale 8s. Activates the vagal nerve to rapidly drop heart rate and cortisol between contraction waves.'
        : '4 sn burundan al → 7 sn tut → 8 sn yavaşça ver. Vagus sinirini aktive ederek sancı aralarında nabzı ve stres hormonlarını hızla düşürür.',
      benefits: isEn ? 'Lowers blood pressure & restores maternal calm' : 'Tansiyonu dengeler ve doğum yorgunluğunu siler',
    },
    {
      id: 'lamaze',
      title: isEn ? 'Lamaze Active Wave' : 'Lamaze Zirve Sancı Dalgası',
      shortTitle: 'Lamaze Dalga',
      subtitle: isEn ? 'Controlled breathing during peak contractions' : 'Zirve kasılmalarda kontrollü oksijen',
      inhale: 4, hold: 0, exhale: 6, hold2: 0,
      color: '#B25068', bg: '#FDF1F4', ring: '#F0CAD4',
      desc: isEn
        ? 'Steady inhale (4s) → slow soft mouth exhale (6s). Keeps oxygen flooding to the baby without hyperventilating during peak uterine contractions.'
        : 'Sabit 4 sn al → yumuşak 6 sn ver. Sancının en yüksek anında hızlı solumayı önler, bebeğe kesintisiz bol oksijen akışı sağlar.',
      benefits: isEn ? 'Prevents panic & maximizes fetal oxygenation' : 'Panik hissini önler ve bebeğe oksijen taşır',
    },
    {
      id: 'candle',
      title: isEn ? 'Golden Thread & Softening' : 'Altın İplik & Doğum Açılma Nefesi',
      shortTitle: 'Altın İplik',
      subtitle: isEn ? 'Pelvic floor & cervical opening breath' : 'Pelvik taban & rahim ağzı gevşetme',
      inhale: 4, hold: 0, exhale: 8, hold2: 0,
      color: '#7E4E8A', bg: '#F9F1FB', ring: '#E3C9E8',
      desc: isEn
        ? 'Inhale through nose 4s → blow out gently through parted lips for 8s like flickering a candle without blowing it out. Releases the perineum.'
        : 'Burundan 4 sn al → dudakları aralayarak mum alevini söndürmeden hafifçe dalgalandırır gibi 8 sn üfle. Perine ve pelvik kasları açar.',
      benefits: isEn ? 'Relaxes pelvic muscles & aids gentle baby descent' : 'Pelvik tabanı yumuşatarak bebeğin inişini kolaylaştırır',
    },
    {
      id: 'box',
      title: isEn ? 'Box Breathing (Adrenaline Reset)' : 'Kutu Nefesi (Adrenalin Sıfırlama)',
      shortTitle: 'Kutu Nefesi',
      subtitle: isEn ? '4 equal sides for intense anxiety reset' : 'Doğum heyecanı ve stres yönetimi',
      inhale: 4, hold: 4, exhale: 4, hold2: 4,
      color: '#3B7E58', bg: '#EEF6F1', ring: '#BDE2CB',
      desc: isEn
        ? 'Inhale 4s → hold 4s → exhale 4s → hold 4s. Clinically proven square breathing technique used in hospital birth suites to halt adrenaline surges.'
        : 'Al 4 sn → tut 4 sn → ver 4 sn → tut 4 sn. Doğumhanelerde aşırı heyecan ve adrenalini sıfırlamak için kullanılan 4 eşit kenarlı klinik nefes.',
      benefits: isEn ? 'Steadies autonomic nervous system' : 'Otonom sinir sistemini merkezler',
    },
  ];

  const [selectedTech, setSelectedTech] = useState('478');
  const [phase, setPhase] = useState('idle'); // 'idle' | 'inhale' | 'hold' | 'exhale' | 'hold2'
  const [countdown, setCountdown] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [targetCycles, setTargetCycles] = useState(8); // 4, 8, 12, 0 (infinite)
  const [running, setRunning] = useState(false);
  const [totalSecs, setTotalSecs] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ambientSound, setAmbientSound] = useState('none'); // 'none' | 'waves' | 'rain' | 'fetalHeartbeat'

  const circleScale = useRef(new Animated.Value(1)).current;
  const haloScale = useRef(new Animated.Value(1)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const circleOpacity = useRef(new Animated.Value(0.45)).current;
  const cycleRef = useRef(null);
  const timerRef = useRef(null);
  const isRunning = useRef(false);
  const selectedRef = useRef('478');
  const soundEnabledRef = useRef(true);

  const tech = techniques.find(t => t.id === selectedTech) || techniques[0];
  const sessions = state?.breathingSessions || [];

  useEffect(() => {
    selectedRef.current = selectedTech;
  }, [selectedTech]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

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
      stopSound();
    };
  }, []);

  function handleAmbientToggle(soundKey) {
    if (ambientSound === soundKey) {
      setAmbientSound('none');
      stopSound();
    } else {
      setAmbientSound(soundKey);
      playSound(soundKey, { volume: 0.35 });
    }
  }

  function animatePhase(toScale, toOpacity, dur) {
    return new Promise(resolve => {
      Animated.parallel([
        Animated.timing(circleScale, { toValue: toScale, duration: dur * 1000, useNativeDriver: false }),
        Animated.timing(haloScale, { toValue: toScale * 1.32, duration: dur * 1000, useNativeDriver: false }),
        Animated.timing(ringScale, { toValue: toScale * 1.15, duration: dur * 1000, useNativeDriver: false }),
        Animated.timing(circleOpacity, { toValue: toOpacity, duration: dur * 1000, useNativeDriver: false }),
      ]).start(({ finished }) => { if (finished) resolve(); });
    });
  }

  function countdownPhase(dur, phaseName, resolve) {
    if (!isRunning.current) { resolve(); return; }
    setPhase(phaseName);
    setCountdown(dur);

    if (soundEnabledRef.current && (phaseName === 'inhale' || phaseName === 'hold' || phaseName === 'exhale')) {
      playBreathCue(phaseName);
    }

    let remaining = dur;
    const interval = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0 || !isRunning.current) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
    cycleRef.current = interval;
  }

  async function runCycle() {
    const t = techniques.find(x => x.id === selectedRef.current) || techniques[0];
    if (!isRunning.current) return;

    // 1. NEFES AL (INHALE)
    await Promise.all([
      animatePhase(1.36, 0.92, t.inhale),
      new Promise(r => countdownPhase(t.inhale, 'inhale', r)),
    ]);
    if (!isRunning.current) return;

    // 2. TUT (HOLD)
    if (t.hold > 0) {
      await Promise.all([
        animatePhase(1.38, 0.88, t.hold),
        new Promise(r => countdownPhase(t.hold, 'hold', r)),
      ]);
      if (!isRunning.current) return;
    }

    // 3. NEFES VER (EXHALE)
    await Promise.all([
      animatePhase(1.0, 0.45, t.exhale),
      new Promise(r => countdownPhase(t.exhale, 'exhale', r)),
    ]);
    if (!isRunning.current) return;

    // 4. İKİNCİ TUTMA (BOX BREATHING HOLD 2)
    if (t.hold2 > 0) {
      await Promise.all([
        animatePhase(0.96, 0.40, t.hold2),
        new Promise(r => countdownPhase(t.hold2, 'hold2', r)),
      ]);
      if (!isRunning.current) return;
    }

    setCycles(c => {
      const nextC = c + 1;
      if (targetCycles > 0 && nextC >= targetCycles) {
        setTimeout(() => stopSession(), 300);
      }
      return nextC;
    });

    if (isRunning.current) {
      runCycle();
    }
  }

  function startSession() {
    isRunning.current = true;
    setRunning(true);
    setCycles(0);
    setTotalSecs(0);
    setPhase('inhale');
    circleScale.setValue(1);
    haloScale.setValue(1);
    ringScale.setValue(1);
    circleOpacity.setValue(0.45);
    runCycle();
  }

  function stopSession() {
    isRunning.current = false;
    setRunning(false);
    setPhase('idle');
    setCountdown(0);
    if (cycleRef.current) clearInterval(cycleRef.current);
    Animated.parallel([
      Animated.timing(circleScale, { toValue: 1, duration: 600, useNativeDriver: false }),
      Animated.timing(haloScale, { toValue: 1, duration: 600, useNativeDriver: false }),
      Animated.timing(ringScale, { toValue: 1, duration: 600, useNativeDriver: false }),
      Animated.timing(circleOpacity, { toValue: 0.45, duration: 600, useNativeDriver: false }),
    ]).start();

    if (cycles > 0) {
      const entry = {
        id: uid ? uid() : Date.now().toString(),
        technique: selectedTech,
        cycles,
        durationSecs: totalSecs,
        date: new Date().toLocaleDateString(isEn ? 'en-US' : 'tr-TR', { day: 'numeric', month: 'short' }),
      };
      update(old => ({ breathingSessions: [entry, ...(old.breathingSessions || [])].slice(0, 20) }));
      offlineSyncQueue.enqueue(createTrackerEvent({
        type: 'postpartum_checkin',
        metadata: { breathing: selectedTech, cycles, durationSecs: totalSecs },
      })).catch(() => {});
      toast && toast(isEn ? `Breathing session saved — ${cycles} cycles` : `Nefes seansı kaydedildi — ${cycles} döngü ✨`);
    }
  }

  const phaseDetails = {
    idle: {
      title: isEn ? 'Ready to Begin' : 'Başlamaya Hazır',
      cue: isEn ? 'Settle comfortably and drop your shoulders.' : 'Rahat bir pozisyona geçin ve omuzlarınızı serbest bırakın.',
      icon: '🌬️',
    },
    inhale: {
      title: isEn ? 'Breathe In Deeply' : 'Derin Nefes Al',
      cue: isEn ? 'Fill belly through nose, expanding ribs...' : 'Burundan al, karnını ve kaburgalarını genişlet...',
      icon: '🌸',
    },
    hold: {
      title: isEn ? 'Hold & Soften' : 'Sakin Kal & Tut',
      cue: isEn ? 'Keep chest still, unclamp your jaw...' : 'Göğsünü kasmadan kal, çeneni ve dilini gevşet...',
      icon: '✨',
    },
    exhale: {
      title: isEn ? 'Breathe Out Gently' : 'Yavaşça Nefesi Bırak',
      cue: isEn ? 'Slowly release like flickering a candle...' : 'Dudaklarını aralayarak mum alevini titretir gibi üfle...',
      icon: '🍃',
    },
    hold2: {
      title: isEn ? 'Rest in Stillness' : 'Huzurla Dinlen',
      cue: isEn ? 'Pause in peaceful silence before next breath...' : 'Yeni nefes dalgasından önce dingince durakla...',
      icon: '🌿',
    },
  };

  const currentPhaseInfo = phaseDetails[phase] || phaseDetails.idle;

  return (
    <View style={ts.container}>
      {/* 1. Üst Hero */}
      <ScreenHero
        title={isEn ? "Clinical Labor & Calm Studio" : "Klinik Doğum & Nefes Stüdyosu"}
        subtitle={isEn
          ? "Harmonic rhythm breathwork to manage labor waves, lower cortisol & calm the nervous system."
          : "Doğum dalgalarını yönetmek, kortizolü düşürmek ve parasempatik sistemi aktive etmek için klinik nefes rehberi."}
        badge={isEn ? "HOSPITAL GRADE" : "KLİNİK REHBER"}
        badgeColor={tech.color}
        icon="leaf"
        lang={lang}
      />

      {/* 2. Klinik Teknik Kartı ve Seçici */}
      <View style={[bs.heroBox, { backgroundColor: tech.bg, borderColor: tech.ring, borderWidth: 1.5 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <T style={[bs.heroKicker, { color: tech.color }]}>{tech.shortTitle.toUpperCase()}</T>
            <T bold style={bs.heroTitle}>{tech.title}</T>
            <T style={bs.heroSub}>{tech.subtitle}</T>
          </View>
          <View style={[bs.benefitChip, { backgroundColor: 'white', borderColor: tech.ring }]}>
            <T style={{ fontSize: 18 }}>🩺</T>
            <T bold style={{ fontSize: 10, color: tech.color, marginTop: 2, textAlign: 'center' }}>
              {isEn ? 'ACOG' : 'Tıbbi'}
            </T>
          </View>
        </View>

        {/* Teknik Seçim Hapları (Pills) */}
        <View style={[bs.techRow, { marginTop: 12 }]}>
          {techniques.map(t => (
            <Tap
              key={t.id}
              onPress={() => {
                if (!running) {
                  setSelectedTech(t.id);
                  setPhase('idle');
                }
              }}
              style={[
                bs.techPill,
                selectedTech === t.id && { backgroundColor: t.color, borderColor: t.color },
              ]}
            >
              <T
                bold={selectedTech === t.id}
                style={[bs.techPillText, selectedTech === t.id && { color: 'white' }]}
              >
                {t.shortTitle}
              </T>
            </Tap>
          ))}
        </View>

        {/* Seçilen Teknik Detayı */}
        <View style={[bs.descCard, { backgroundColor: 'white', borderColor: tech.ring, marginTop: 12 }]}>
          <T style={[bs.descText, { color: colors.ink }]}>{tech.desc}</T>
          
          <View style={bs.timingRow}>
            <View style={bs.timingChip}>
              <T bold style={[bs.timingNum, { color: tech.color }]}>{tech.inhale}s</T>
              <T style={bs.timingLabel}>{isEn ? 'Inhale' : 'Al'}</T>
            </View>
            {tech.hold > 0 && (
              <View style={bs.timingChip}>
                <T bold style={[bs.timingNum, { color: '#8A5BA4' }]}>{tech.hold}s</T>
                <T style={bs.timingLabel}>{isEn ? 'Hold' : 'Tut'}</T>
              </View>
            )}
            <View style={bs.timingChip}>
              <T bold style={[bs.timingNum, { color: '#3B7E58' }]}>{tech.exhale}s</T>
              <T style={bs.timingLabel}>{isEn ? 'Exhale' : 'Ver'}</T>
            </View>
            {tech.hold2 > 0 && (
              <View style={bs.timingChip}>
                <T bold style={[bs.timingNum, { color: '#8A5BA4' }]}>{tech.hold2}s</T>
                <T style={bs.timingLabel}>{isEn ? 'Hold' : 'Tut'}</T>
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Icon name="check" size={13} color={tech.color} />
            <T style={{ fontSize: 11.5, color: tech.color, fontWeight: '600' }}>{tech.benefits}</T>
          </View>
        </View>
      </View>

      {/* 3. Ses ve Fon Ambiyansı Kontrol Paneli */}
      <View style={bs.soundBar}>
        <Tap
          onPress={() => setSoundEnabled(!soundEnabled)}
          style={[bs.soundToggleBtn, soundEnabled && { backgroundColor: tech.bg, borderColor: tech.ring }]}
        >
          <Icon name={soundEnabled ? "soundwave" : "bell"} size={16} color={soundEnabled ? tech.color : colors.muted} />
          <T bold style={{ fontSize: 12, color: soundEnabled ? tech.color : colors.muted }}>
            {soundEnabled ? (isEn ? 'Audio Chimes: ON' : 'Sesli Çan: AÇIK') : (isEn ? 'Audio: Muted' : 'Ses: KAPALI')}
          </T>
        </Tap>

        <View style={{ flexDirection: 'row', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
          {[
            { id: 'waves', icon: '🌊', label: isEn ? 'Waves' : 'Dalga' },
            { id: 'rain', icon: '🌧️', label: isEn ? 'Rain' : 'Yağmur' },
            { id: 'fetalHeartbeat', icon: '💓', label: isEn ? 'Heart' : 'Kalp' },
          ].map(amb => (
            <Tap
              key={amb.id}
              onPress={() => handleAmbientToggle(amb.id)}
              style={[
                bs.ambChip,
                ambientSound === amb.id && { backgroundColor: tech.color, borderColor: tech.color },
              ]}
            >
              <T style={{ fontSize: 12 }}>{amb.icon}</T>
              <T bold={ambientSound === amb.id} style={{ fontSize: 11, color: ambientSound === amb.id ? 'white' : colors.ink }}>
                {amb.label}
              </T>
            </Tap>
          ))}
        </View>
      </View>

      {/* 4. Hedef Döngü Seçici & İlerleme */}
      <View style={bs.targetRow}>
        <T style={{ fontSize: 12, color: colors.muted, fontWeight: '600' }}>
          {isEn ? 'Target Cycles:' : 'Hedef Döngü:'}
        </T>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[4, 8, 12, 0].map(cnt => (
            <Tap
              key={cnt}
              onPress={() => { if (!running) setTargetCycles(cnt); }}
              style={[
                bs.targetChip,
                targetCycles === cnt && { backgroundColor: tech.color, borderColor: tech.color },
              ]}
            >
              <T bold={targetCycles === cnt} style={{ fontSize: 11, color: targetCycles === cnt ? 'white' : colors.ink }}>
                {cnt === 0 ? (isEn ? 'Free' : 'Serbest') : `${cnt}x`}
              </T>
            </Tap>
          ))}
        </View>
      </View>

      {/* 5. Harmonik Canlı Nefes Küresi (Harmonic Breathing Orb) */}
      <View style={bs.circleArea}>
        {/* Dış Işıma Aurası */}
        <Animated.View
          style={[
            bs.haloCircle,
            {
              backgroundColor: tech.bg,
              borderColor: tech.ring,
              transform: [{ scale: haloScale }],
              opacity: circleOpacity,
            },
          ]}
        />
        {/* Orta Rezonans Halkası */}
        <Animated.View
          style={[
            bs.outerRing,
            {
              borderColor: tech.color,
              transform: [{ scale: ringScale }],
              opacity: circleOpacity,
            },
          ]}
        />
        {/* Ana Dolgulu Küre */}
        <Animated.View
          style={[
            bs.mainCircle,
            {
              backgroundColor: running ? tech.color : '#E6E0EA',
              transform: [{ scale: circleScale }],
              opacity: running ? 0.95 : 0.6,
            },
          ]}
        />
        {/* Küre İçi Bilgi & Sayaç */}
        <View style={bs.circleCenterContent}>
          {running ? (
            <>
              <T style={{ fontSize: 26 }}>{currentPhaseInfo.icon}</T>
              <T bold style={[bs.phaseLabel, { color: 'white' }]}>{currentPhaseInfo.title}</T>
              <T bold style={bs.countdownNum}>{countdown}</T>
              <T style={bs.cycleCounter}>
                {cycles} {targetCycles > 0 ? `/ ${targetCycles}` : ''} {isEn ? 'cycles' : 'döngü'}
              </T>
            </>
          ) : (
            <>
              <T style={bs.idleIcon}>🌬️</T>
              <T bold style={bs.idleLabel}>{currentPhaseInfo.title}</T>
              <T style={bs.idleTime}>{isEn ? 'Tap Start to begin guide' : 'Başlamak için dokunun'}</T>
            </>
          )}
        </View>
      </View>

      {/* Küre Altı Canlı Klinik Yönerge Kartı */}
      <View style={[bs.cueCard, { backgroundColor: tech.bg, borderColor: tech.ring }]}>
        <T style={{ fontSize: 15 }}>{currentPhaseInfo.icon}</T>
        <T bold style={[bs.cueText, { color: tech.color }]}>{currentPhaseInfo.cue}</T>
      </View>

      {/* 6. Başlat / Durdur Büyük Butonu */}
      <Tap
        onPress={running ? stopSession : startSession}
        style={[bs.startBtn, { backgroundColor: running ? '#B33650' : tech.color }]}
      >
        <LinearGradient
          colors={running ? ['#C9425E', '#A02B43'] : [tech.color, tech.color]}
          style={bs.btnGrad}
        >
          <Icon name={running ? "close" : "play"} size={20} color="white" />
          <T bold style={bs.startBtnText}>
            {running
              ? (isEn ? 'Stop & Complete Session' : 'Seansı Tamamla & Kaydet')
              : (isEn ? `Start ${tech.shortTitle} Session` : `${tech.shortTitle} Seansını Başlat`)}
          </T>
        </LinearGradient>
      </Tap>

      {running && (
        <View style={bs.sessionTimer}>
          <Icon name="time" size={14} color={tech.color} />
          <T style={{ fontSize: 12.5, color: colors.muted }}>{isEn ? 'Active Duration: ' : 'Aktif Nefes Süresi: '}</T>
          <T bold style={{ fontSize: 13, color: tech.color }}>{secondsLabel(totalSecs)}</T>
        </View>
      )}

      {/* 7. Doğumhane Klinik İpuçları */}
      <View style={bs.tipsCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Icon name="heart" size={15} color={colors.purple} />
          <T bold style={bs.tipsTitle}>{isEn ? 'Clinical Labor Room Guidance' : 'Doğumhane Klinik İpuçları'}</T>
        </View>
        {(isEn ? [
          'Inhale gently through the nose; never force or hyperventilate.',
          'Let your jaw, lips and shoulders completely relax — open jaw leads to open pelvic floor.',
          'Between contractions, take slow natural recovery breaths and sip water.',
          'Have your partner keep eye contact and count the breathing seconds rhythmically with you.',
        ] : [
          'Nefesi daima burundan nazikçe alın; asla ciğerlerinizi zorlamayın veya acele etmeyin.',
          'Çenenizi, dudaklarınızı ve omuzlarınızı tamamen serbest bırakın — gevşek çene, gevşek rahim ağzı demektir.',
          'Kasılmalar arasında sakin doğal nefese dönün, gözlerinizi kapatıp bir yudum su için.',
          'Refakatçinizden sizinle göz teması kurarak nefes saniyelerini sakin bir ses tonuyla saymasını isteyin.',
        ]).map((tip, i) => (
          <View key={i} style={bs.tipRow}>
            <View style={[bs.tipDot, { backgroundColor: tech.color }]} />
            <T style={bs.tipText}>{tip}</T>
          </View>
        ))}
      </View>

      {/* 8. Geçmiş Seanslar */}
      {sessions.length > 0 && (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <T bold style={{ fontSize: 14.5, color: colors.ink }}>
              {isEn ? 'Recent Breathwork Sessions' : 'Son Nefes Seansları'}
            </T>
            <T style={{ fontSize: 11.5, color: colors.muted }}>
              {sessions.length} {isEn ? 'saved' : 'kayıt'}
            </T>
          </View>
          {sessions.slice(0, 4).map(s => {
            const t = techniques.find(x => x.id === s.technique) || techniques[0];
            return (
              <View key={s.id} style={[bs.historyRow, { borderLeftColor: t.color }]}>
                <View style={{ flex: 1 }}>
                  <T bold style={{ fontSize: 13.5, color: colors.ink }}>{t.title}</T>
                  <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 2 }}>
                    {s.date} · {s.cycles} {isEn ? 'cycles completed' : 'döngü tamamlandı'} · {secondsLabel(s.durationSecs)}
                  </T>
                </View>
                <View style={[bs.historyBadge, { backgroundColor: t.bg }]}>
                  <T bold style={{ fontSize: 13, color: t.color }}>{s.cycles}</T>
                  <T style={{ fontSize: 9.5, color: t.color }}>{isEn ? 'cycles' : 'döngü'}</T>
                </View>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

const bs = StyleSheet.create({
  heroBox: { borderRadius: 20, padding: 18, paddingBottom: 16 },
  heroTextBox: { gap: 3 },
  heroKicker: { fontSize: 10, letterSpacing: 2.2, fontWeight: '800' },
  heroTitle: { fontSize: 20, color: colors.ink, marginTop: 2 },
  heroSub: { fontSize: 12.5, color: colors.muted, marginTop: 2 },
  benefitChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center', minWidth: 50,
  },
  techRow: { flexDirection: 'row', gap: 6 },
  techPill: {
    flex: 1, paddingVertical: 9, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#DDD6DD',
    alignItems: 'center', backgroundColor: 'white',
  },
  techPillText: { fontSize: 12, color: colors.ink },
  descCard: { borderRadius: 16, borderWidth: 1.5, padding: 14, gap: 10 },
  descText: { fontSize: 12.5, lineHeight: 18.5 },
  timingRow: { flexDirection: 'row', gap: 8 },
  timingChip: {
    flex: 1, alignItems: 'center', paddingVertical: 7,
    backgroundColor: '#F7F6F9', borderRadius: 10,
  },
  timingNum: { fontSize: 18, fontWeight: '800' },
  timingLabel: { fontSize: 10, color: colors.muted, marginTop: 1 },
  soundBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'white', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: '#EDE6EE',
  },
  soundToggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#E0DAE2',
  },
  ambChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#E8E2EA',
    backgroundColor: '#FAF9FB',
  },
  targetRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  targetChip: {
    paddingHorizontal: 11, paddingVertical: 5, borderRadius: 10,
    borderWidth: 1, borderColor: '#DDD7E0', backgroundColor: 'white',
  },
  circleArea: { height: 260, alignItems: 'center', justifyContent: 'center', marginVertical: 6 },
  haloCircle: {
    position: 'absolute', width: 250, height: 250,
    borderRadius: 125, borderWidth: 1.5,
  },
  outerRing: {
    position: 'absolute', width: 215, height: 215,
    borderRadius: 107.5, borderWidth: 2,
  },
  mainCircle: {
    position: 'absolute', width: 172, height: 172, borderRadius: 86,
  },
  circleCenterContent: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  phaseLabel: { fontSize: 13, letterSpacing: 0.5, fontWeight: '800' },
  countdownNum: { fontSize: 54, color: 'white', marginVertical: 1 },
  cycleCounter: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  idleIcon: { fontSize: 36, marginBottom: 4 },
  idleLabel: { fontSize: 14, color: '#4A4050', fontWeight: '700' },
  idleTime: { fontSize: 11.5, color: colors.muted, marginTop: 2 },
  cueCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10,
  },
  cueText: { flex: 1, fontSize: 12.5, lineHeight: 17 },
  startBtn: { height: 54, borderRadius: 16, overflow: 'hidden' },
  btnGrad: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  startBtnText: { fontSize: 15, color: 'white' },
  sessionTimer: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  tipsCard: {
    backgroundColor: '#FAF7FC', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#EDE4F2', gap: 8,
  },
  tipsTitle: { fontSize: 13, color: colors.ink },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  tipDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  tipText: { flex: 1, fontSize: 12, color: '#5A5060', lineHeight: 17 },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'white', borderRadius: 14, padding: 12,
    borderLeftWidth: 3.5, borderWidth: 1, borderColor: '#EEE6EE',
  },
  historyBadge: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
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
  stopwatchBox: {
    backgroundColor: '#F9F4F7',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDE0E8',
  },
  stopwatchLabel: {
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 1,
  },
  stopwatchTime: {
    fontSize: 34,
    color: colors.ink,
    marginVertical: 4,
  },
  lastKickText: {
    fontSize: 11,
    color: colors.purple,
  },
  kickInteractiveCard: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDFA',
  },
  kickRippleRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: '#C45778',
    zIndex: 0,
  },
  celebrationBurst: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2B8D2',
    ...shadow.soft,
    zIndex: 10,
  },
  breathGlowCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  breathCenterPuck: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  kickCenterTap: {
    width: 154,
    height: 154,
    borderRadius: 77,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kickCenterGradient: {
    width: 154,
    height: 154,
    borderRadius: 77,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  kickBigCount: {
    fontSize: 22,
    color: colors.ink,
    marginTop: 4,
  },
  kickSubPrompt: {
    fontSize: 10.5,
    color: colors.purple,
    fontWeight: '600',
    marginTop: 2,
  },
  segmentCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECE3EC',
    ...shadow.soft,
  },
  segmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dotGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  dotItem: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5ECF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotItemFilled: {
    backgroundColor: colors.purple,
  },
  dotItemActive: {
    borderWidth: 2,
    borderColor: '#4A2352',
  },
  dotItemNum: {
    fontSize: 11,
    color: colors.muted,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#F0E5F0',
  },
  actionMiniBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F3EBF3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FAF2F5',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEDCE3',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#5C3C4A',
    lineHeight: 18,
  },
  historyItem: {
    padding: 14,
    borderRadius: 14,
  },
  historyBadge: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  // Contraction styles
  statusBanner: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  activeWaveRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2.5,
    borderColor: '#C93B58',
    backgroundColor: 'rgba(201, 59, 88, 0.08)',
  },
  giantWaveBtn: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  intensityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  intensityPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2DBE2',
    alignItems: 'center',
  },
  intensityPillActive: {
    backgroundColor: '#4F79A1',
    borderColor: '#4F79A1',
  },
  intensityText: {
    fontSize: 12,
    color: colors.ink,
  },
  counterBox: {
    backgroundColor: '#F3F7FA',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCE6EE',
  },
  counterLabel: {
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 1,
  },
  counterNumber: {
    fontSize: 36,
    color: colors.ink,
    marginVertical: 4,
  },
  counterSub: {
    fontSize: 12,
    color: '#4B7396',
  },
  contractionBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    height: 56,
    ...shadow.soft,
  },
  contractionGrad: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  contractionBtnText: {
    fontSize: 15,
    color: 'white',
  },
  // Hospital Bag styles
  progressBox: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  bagTabRow: {
    flexDirection: 'row',
    backgroundColor: '#EAE2DC',
    borderRadius: 14,
    padding: 4,
  },
  bagTabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
  },
  bagTabBtnActive: {
    backgroundColor: 'white',
    ...shadow.soft,
  },
  bagTabText: {
    fontSize: 12,
    color: colors.muted,
  },
  bagItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: 'white',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAE1D9',
  },
  bagItemRowDone: {
    backgroundColor: '#F9F7F5',
    borderColor: '#ECE5DE',
    opacity: 0.75,
  },
  bagItemCheck: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#C6B9C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bagItemCheckDone: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  bagItemText: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
  },
  bagItemTextDone: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  addItemRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2DBD5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.ink,
  },
  addItemBtn: {
    backgroundColor: colors.purple,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
});
