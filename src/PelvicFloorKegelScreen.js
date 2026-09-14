import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, ScreenHero, InfoNote, MetricCard } from './ui';
import { saveTrackingEvent } from './backendSync';

export const KEGEL_MODES = {
  quick: {
    id: 'quick',
    titleTr: 'Hızlı Kasılma (Quick Flicks)',
    titleEn: 'Quick Flicks',
    descTr: '2 sn Sık - 2 sn Gevşe. Hızlı refleks gücü ve ani kaçırmaları (öksürme/hapşırma) önleme.',
    descEn: '2s Squeeze - 2s Relax. Strengthens fast-twitch fibers to prevent stress incontinence.',
    squeezeSec: 2,
    holdSec: 0,
    relaxSec: 2,
    targetReps: 10,
  },
  endurance: {
    id: 'endurance',
    titleTr: 'Dayanıklılık (Endurance Hold)',
    titleEn: 'Endurance Hold',
    descTr: '5 sn Sık - 5 sn Tut - 5 sn Gevşe. Pelvik organ sarkmalarını önleyen derin kas dayanıklılığı.',
    descEn: '5s Squeeze - 5s Hold - 5s Relax. Deep endurance to support uterus and bladder.',
    squeezeSec: 5,
    holdSec: 5,
    relaxSec: 5,
    targetReps: 8,
  },
  release: {
    id: 'release',
    titleTr: 'Doğum Gevşemesi (Birth Release)',
    titleEn: 'Birth Release',
    descTr: '4 sn Yavaşça Bırak - 6 sn Tam Gevşe. Doğum kanalını açmak ve bebeğin inişine izin vermek için gevşeme.',
    descEn: '4s Gentle Release - 6s Deep Melting Relax. Prepares pelvic floor to open for birth.',
    squeezeSec: 3,
    holdSec: 2,
    relaxSec: 6,
    targetReps: 6,
  },
};

export function PelvicFloorKegelScreen({ state, update, toast, close, lang: propLang }) {
  const lang = propLang || state?.lang || 'tr';
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState('kegel'); // 'kegel' | 'perineal' | 'benefits'
  const [selectedModeKey, setSelectedModeKey] = useState('quick');
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState('squeeze'); // 'squeeze' | 'hold' | 'relax'
  const [phaseCountdown, setPhaseCountdown] = useState(2);
  const [currentRep, setCurrentRep] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const mode = KEGEL_MODES[selectedModeKey];

  // Visual pulse animation for rhythmic feedback
  useEffect(() => {
    if (isRunning) {
      if (phase === 'squeeze') {
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: mode.squeezeSec * 1000,
          useNativeDriver: true,
        }).start();
      } else if (phase === 'hold') {
        // Keep large
      } else {
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: mode.relaxSec * 1000,
          useNativeDriver: true,
        }).start();
      }
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isRunning, phase, mode, pulseAnim]);

  // Main countdown timer loop
  useEffect(() => {
    let timer = null;
    if (isRunning) {
      timer = setInterval(() => {
        setPhaseCountdown((prev) => {
          if (prev > 1) return prev - 1;

          // Transition to next phase
          if (phase === 'squeeze') {
            if (mode.holdSec > 0) {
              setPhase('hold');
              return mode.holdSec;
            } else {
              setPhase('relax');
              return mode.relaxSec;
            }
          } else if (phase === 'hold') {
            setPhase('relax');
            return mode.relaxSec;
          } else {
            // Relax finished -> increment rep
            const nextRep = currentRep + 1;
            if (nextRep >= mode.targetReps) {
              // Set complete!
              setIsRunning(false);
              setCurrentRep(mode.targetReps);
              toast && toast(isEn ? '🎉 Kegel set complete! Excellent work!' : '🎉 Kegel seti tamamlandı! Harika iş çıkardın!');

              // Save session
              const newSession = {
                id: `keg_${Date.now()}`,
                date: new Date().toISOString(),
                mode: selectedModeKey,
                reps: mode.targetReps,
              };
              const pastSessions = state.kegelSessions || [];
              update && update({ kegelSessions: [newSession, ...pastSessions] });

              saveTrackingEvent({
                type: 'kegel_session',
                title: 'Kegel Egzersiz Seansı',
                value: `${mode.targetReps} tekrar (${mode.titleTr})`,
                metadata: newSession,
              }).catch(() => {});

              return 0;
            } else {
              setCurrentRep(nextRep);
              setPhase('squeeze');
              return mode.squeezeSec;
            }
          }
        });
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning, phase, mode, currentRep, selectedModeKey, toast, isEn, state.kegelSessions, update]);

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      if (currentRep >= mode.targetReps) {
        setCurrentRep(0);
      }
      setPhase('squeeze');
      setPhaseCountdown(mode.squeezeSec);
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentRep(0);
    setPhase('squeeze');
    setPhaseCountdown(mode.squeezeSec);
  };

  const pastSessions = state.kegelSessions || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
      <ScreenHero
        title={isEn ? 'Pelvic Floor & Perineal Massage' : 'Pelvik Taban & Perine Masajı'}
        subtitle={isEn ? 'RCOG / ACOG evidence-based Kegel trainer & antenatal birth prep' : 'Doğum yırtıklarını önleyen kanıta dayalı Kegel koçu ve perine masajı'}
        badge="RCOG / ACOG 2022"
        badgeColor="#9333EA"
        art="card_pelvic_kegel"
      />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Tap
          onPress={() => setActiveTab('kegel')}
          style={[styles.tabBtn, activeTab === 'kegel' && styles.tabBtnActive]}
        >
          <T bold={activeTab === 'kegel'} style={{ color: activeTab === 'kegel' ? colors.primary : colors.textMuted, fontSize: 13 }}>
            🌸 {isEn ? 'Kegel Trainer' : 'Kegel Koçu'}
          </T>
        </Tap>
        <Tap
          onPress={() => setActiveTab('perineal')}
          style={[styles.tabBtn, activeTab === 'perineal' && styles.tabBtnActive]}
        >
          <T bold={activeTab === 'perineal'} style={{ color: activeTab === 'perineal' ? colors.primary : colors.textMuted, fontSize: 13 }}>
            🌿 {isEn ? '34+ Wk Perineal' : '34+ Hf Perine Masajı'}
          </T>
        </Tap>
        <Tap
          onPress={() => setActiveTab('benefits')}
          style={[styles.tabBtn, activeTab === 'benefits' && styles.tabBtnActive]}
        >
          <T bold={activeTab === 'benefits'} style={{ color: activeTab === 'benefits' ? colors.primary : colors.textMuted, fontSize: 13 }}>
            📖 {isEn ? 'Clinical Guide' : 'Klinik Bilgi'}
          </T>
        </Tap>
      </View>

      {activeTab === 'kegel' && (
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          {/* Mode Selector */}
          <Card style={styles.modeCard}>
            <T bold style={{ fontSize: 14.5, color: colors.textDark, marginBottom: 8 }}>
              {isEn ? 'Select Exercise Mode' : 'Egzersiz Seviyesi Seç'}
            </T>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {Object.keys(KEGEL_MODES).map((key) => {
                const m = KEGEL_MODES[key];
                const active = selectedModeKey === key;
                return (
                  <Tap
                    key={key}
                    onPress={() => {
                      if (!isRunning) {
                        setSelectedModeKey(key);
                        setCurrentRep(0);
                        setPhase('squeeze');
                        setPhaseCountdown(m.squeezeSec);
                      }
                    }}
                    style={[styles.modeBtn, active && styles.modeBtnActive]}
                  >
                    <T bold style={{ color: active ? 'white' : colors.textDark, fontSize: 12.5, textAlign: 'center' }}>
                      {key === 'quick' ? '⚡ Hızlı' : key === 'endurance' ? '⏳ Dayanıklılık' : '🕊️ Doğum'}
                    </T>
                  </Tap>
                );
              })}
            </View>
            <T style={{ fontSize: 12.5, color: colors.textSecondary, marginTop: 10, lineHeight: 18 }}>
              {isEn ? mode.descEn : mode.descTr}
            </T>
          </Card>

          {/* Animated Coach Circle */}
          <Card style={[styles.coachCard, { marginTop: 16 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <T style={{ fontSize: 13, color: colors.textMuted }}>
                {isEn ? 'Repetition:' : 'Tekrar:'} <T bold style={{ color: colors.textDark }}>{currentRep} / {mode.targetReps}</T>
              </T>
              <T bold style={{ fontSize: 13, color: colors.primary }}>
                {isEn ? mode.titleEn : mode.titleTr}
              </T>
            </View>

            {/* Pulsing Visual Circle */}
            <Animated.View
              style={[
                styles.pulseCircle,
                {
                  transform: [{ scale: pulseAnim }],
                  backgroundColor:
                    phase === 'squeeze'
                      ? '#F43F5E'
                      : phase === 'hold'
                      ? '#E11D48'
                      : '#10B981',
                },
              ]}
            >
              <T bold style={styles.pulsePhaseText}>
                {phase === 'squeeze'
                  ? (isEn ? 'SQUEEZE' : 'SIK')
                  : phase === 'hold'
                  ? (isEn ? 'HOLD' : 'TUT')
                  : (isEn ? 'RELAX' : 'GEVŞE')}
              </T>
              <T bold style={styles.pulseCountdownText}>{phaseCountdown}s</T>
            </Animated.View>

            {/* Instruction Tip */}
            <T style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginVertical: 12, lineHeight: 19 }}>
              {phase === 'squeeze'
                ? (isEn ? 'Lift pelvic floor muscles up and in, like stopping urination.' : 'İdrarınızı tutar gibi pelvik taban kaslarını içeri ve yukarı çekin.')
                : phase === 'hold'
                ? (isEn ? 'Keep holding steady without tensing buttocks or holding breath.' : 'Nefesinizi tutmadan, kalçayı kasmadan kasılmayı koruyun.')
                : (isEn ? 'Fully release and melt muscles down. Breathing out gently.' : 'Pelvik tabanı tamamen serbest bırakıp derin nefes verin.')}
            </T>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 10, width: '100%', marginTop: 8 }}>
              <Tap
                onPress={handleStartStop}
                style={[
                  styles.controlBtn,
                  { backgroundColor: isRunning ? '#EF4444' : colors.primary, flex: 2 },
                ]}
              >
                <T bold style={{ color: 'white', fontSize: 15 }}>
                  {isRunning ? (isEn ? '⏸️ Pause' : '⏸️ Duraklat') : (isEn ? '▶️ Start Kegel Set' : '▶️ Başlat')}
                </T>
              </Tap>
              <Tap onPress={handleReset} style={[styles.controlBtn, { backgroundColor: '#F3F4F6', flex: 1 }]}>
                <T bold style={{ color: colors.textDark, fontSize: 14 }}>
                  🔄 {isEn ? 'Reset' : 'Sıfırla'}
                </T>
              </Tap>
            </View>
          </Card>

          {/* History log */}
          {pastSessions.length > 0 && (
            <Card style={[styles.modeCard, { marginTop: 16 }]}>
              <T bold style={{ fontSize: 14, color: colors.textDark, marginBottom: 8 }}>
                📋 {isEn ? `Completed Sets (${pastSessions.length})` : `Tamamlanan Setler (${pastSessions.length})`}
              </T>
              {pastSessions.slice(0, 3).map((s, idx) => (
                <View key={s.id || idx} style={styles.historyRow}>
                  <T style={{ fontSize: 12.5, color: colors.textSecondary }}>
                    {new Date(s.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'tr-TR', { day: 'numeric', month: 'short' })}
                  </T>
                  <T bold style={{ fontSize: 13, color: '#059669' }}>
                    {s.reps} {isEn ? 'reps' : 'tekrar'} ({s.mode})
                  </T>
                </View>
              ))}
            </Card>
          )}
        </View>
      )}

      {activeTab === 'perineal' && (
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          {/* Main Protocol Card */}
          <Card style={styles.protocolCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <T bold style={{ fontSize: 16, color: '#6B21A8' }}>
                🌿 {isEn ? 'Antenatal Perineal Massage Protocol' : 'Doğuma Hazırlık: Perine Masajı'}
              </T>
            </View>
            <T style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20 }}>
              {isEn
                ? 'RCOG and Cochrane reviews confirm that regular perineal massage from 34 weeks of pregnancy reduces the risk of 2nd/3rd degree perineal tears by 16% and episiotomy by 15% in first-time mothers.'
                : 'Cochrane ve RCOG (İngiliz Kadın Doğum Derneği) kanıtlarına göre; 34. gebelik haftasından itibaren yapılan düzenli perine masajı, ilk doğumlarda yırtık riskini %16, epizyotomi (dikişli doğum) oranını %15 oranında azaltmaktadır.'}
            </T>

            {/* Step by step guide */}
            <View style={{ marginTop: 16, gap: 12 }}>
              <View style={styles.stepItem}>
                <View style={styles.stepNum}><T bold style={{ color: 'white', fontSize: 12 }}>1</T></View>
                <View style={{ flex: 1 }}>
                  <T bold style={{ fontSize: 13.5, color: colors.textDark }}>
                    {isEn ? 'Timing & Frequency' : 'Zamanlama & Sıklık'}
                  </T>
                  <T style={styles.stepDesc}>
                    {isEn
                      ? 'Start at 34-35 weeks. Perform 3-4 times per week for 5-10 minutes each session. Best done after a warm shower when tissues are supple.'
                      : '34-35. haftada başlayın. Haftada 3-4 kez, günde 5-10 dakika uygulayın. Ilık bir duş sonrası dokuların gevşediği an en ideal zamandır.'}
                  </T>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNum}><T bold style={{ color: 'white', fontSize: 12 }}>2</T></View>
                <View style={{ flex: 1 }}>
                  <T bold style={{ fontSize: 13.5, color: colors.textDark }}>
                    {isEn ? 'Safe Natural Oils' : 'Güvenli Doğal Yağlar'}
                  </T>
                  <T style={styles.stepDesc}>
                    {isEn
                      ? 'Use pure sweet almond oil, cold-pressed olive oil, or organic coconut oil. NEVER use baby oil, petroleum jelly (Vaseline), or scented lotions.'
                      : 'Saf tatlı badem yağı, soğuk sıkım zeytinyağı veya organik Hindistan cevizi yağı kullanın. Asla bebek yağı, vazelin veya parfümlü losyon KULLANMAYIN.'}
                  </T>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNum}><T bold style={{ color: 'white', fontSize: 12 }}>3</T></View>
                <View style={{ flex: 1 }}>
                  <T bold style={{ fontSize: 13.5, color: colors.textDark }}>
                    {isEn ? 'The "U-Shape" Stretch Technique' : '"U-Hareketi" Esnetme Tekniği'}
                  </T>
                  <T style={styles.stepDesc}>
                    {isEn
                      ? 'Insert thumb 3-4 cm into the vagina. Press gently downward toward the rectum, then sweep side-to-side in a U-shape motion (from 3 to 9 o\'clock). A mild stretching/burning sensation is normal, but it should not cause sharp pain.'
                      : 'Temiz başparmağınızı vajina içine 3-4 cm yerleştirin. Makata doğru nazikçe aşağı bastırıp ardından saat 3\'ten 9 yönüne doğru hafif U-şeklinde esnetin. Hafif bir karıncalanma/yanma hissi normaldir, batıcı şiddetli ağrı olmamalıdır.'}
                  </T>
                </View>
              </View>
            </View>
          </Card>

          {/* Contraindications Note */}
          <Card style={[styles.contraCard, { marginTop: 14 }]}>
            <T bold style={{ fontSize: 14, color: '#B91C1C', marginBottom: 6 }}>
              ⚠️ {isEn ? 'When NOT to Do Perineal Massage' : 'Kimler Perine Masajı Yapmamalı?'}
            </T>
            <T style={{ fontSize: 12.5, color: '#991B1B', lineHeight: 18 }}>
              {isEn
                ? '• Active vaginal infection (yeast infection, herpes).\n• Preterm labor risk or cervical shortening.\n• Placenta previa or vaginal bleeding.\n• Premature rupture of membranes (water broke).'
                : '• Aktif vajinal mantar, genital uçuk veya idrar yolu enfeksiyonu.\n• Erken doğum riski veya rahim ağzı kısalığı (servikal yetmezlik).\n• Plasenta previa veya vajinal kanama.\n• Suların gelmesi (amniyon sıvısı sızıntısı).'}
            </T>
          </Card>
        </View>
      )}

      {activeTab === 'benefits' && (
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <Card style={styles.guideCard}>
            <T bold style={{ fontSize: 15, color: '#1E3A8A', marginBottom: 8 }}>
              🩺 {isEn ? 'Why Train the Pelvic Floor?' : 'Pelvik Taban Neden Bu Kadar Önemli?'}
            </T>
            <T style={styles.guideBody}>
              {isEn
                ? 'The pelvic floor is a sling of muscles supporting your bladder, uterus, and bowels. Pregnancy hormones (relaxin) and the growing weight of the baby place immense pressure on these muscles.\n\nRegular Kegel exercises strengthen support to prevent urine leakage during laughter or coughing and dramatically accelerate postpartum recovery.'
                : 'Pelvik taban; rahmi, mesaneyi ve bağırsakları yerinde tutan hamak benzeri kas grubudur. Gebelikte salgılanan relaksin hormonu ve büyüyen bebeğin ağırlığı bu kasları esnetir.\n\nDüzenli Kegel egzersizleri hem doğumda ıkınma kontrolünü artırır, hem gülme/öksürme anındaki idrar kaçırmayı önler, hem de doğum sonrası rahmin eski yerine hızla toparlanmasını sağlar.'}
            </T>
          </Card>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: 'white',
    ...shadow.sm,
  },
  modeCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'white',
    ...shadow.sm,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  coachCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    ...shadow.sm,
  },
  pulseCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
    ...shadow.md,
  },
  pulsePhaseText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  pulseCountdownText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  controlBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  protocolCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'white',
    ...shadow.sm,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9333EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepDesc: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 3,
  },
  contraCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  guideCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  guideBody: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 20,
  },
});
