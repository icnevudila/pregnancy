import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Linking, Platform } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section, ScreenHero, InfoNote, MetricCard, ToolExperienceCard } from './ui';
import { uid, formatLocalizedDate } from './domain.mjs';
import { saveBloodGlucoseCloud } from './backendSync';

export function getBloodGlucoseCategory(timing, value, isEn = false) {
  const val = Number(value);
  if (!Number.isFinite(val) || val <= 0) return null;

  if (val < 60) {
    return {
      status: 'hypo',
      label: isEn ? 'HYPOGLYCEMIA ALERT (<60 mg/dL)' : 'DÜŞÜK ŞEKER ALARMI (<60 mg/dL)',
      color: '#B42318',
      bgColor: '#FEF3F2',
      badgeColor: '#FEE4E2',
      desc: isEn
        ? 'Rule of 15: Take 15g fast-acting carbs (1/2 cup fruit juice or 3-4 glucose tablets). Re-check in 15 minutes.'
        : '15 Kuralı: Hemen 15g hızlı karbonhidrat alın (yarım bardak meyve suyu veya 3 kesme şeker). 15 dk sonra tekrar ölçün.',
      isAlert: true,
    };
  }

  // Fasting thresholds: Target <=95
  if (timing === 'fasting') {
    if (val <= 95) {
      return {
        status: 'normal',
        label: isEn ? 'Optimal Fasting (≤95 mg/dL)' : 'Hedefte Açlık (≤95 mg/dL)',
        color: '#027A48',
        bgColor: '#ECFDF3',
        badgeColor: '#D1FADF',
        desc: isEn ? 'Within recommended obstetric fasting target range.' : 'Gebelik için hedeflenen ideal açlık aralığında.',
        isAlert: false,
      };
    }
    if (val <= 125) {
      return {
        status: 'elevated',
        label: isEn ? 'Elevated Fasting (96-125 mg/dL)' : 'Sınırda Açlık (96-125 mg/dL)',
        color: '#B54708',
        bgColor: '#FFFAEB',
        badgeColor: '#FEDF89',
        desc: isEn ? 'Slightly above fasting target. Review bedtime snack and track regularly.' : 'Açlık hedefinin biraz üzerinde. Gece ara öğününüzü gözden geçirin ve takip edin.',
        isAlert: false,
      };
    }
    return {
      status: 'high',
      label: isEn ? 'High Fasting (≥126 mg/dL)' : 'Yüksek Açlık (≥126 mg/dL)',
      color: '#D92D20',
      bgColor: '#FFF4F2',
      badgeColor: '#FECDCA',
      desc: isEn ? 'Significantly elevated fasting level. Consult your endocrinologist / obstetrician.' : 'Belirgin yüksek açlık şekeri. Kadın doğum veya endokrinoloji hekiminize danışın.',
      isAlert: true,
    };
  }

  // 1-Hour Postprandial: Target <=140
  if (timing === 'post1h') {
    if (val <= 140) {
      return {
        status: 'normal',
        label: isEn ? 'Optimal 1-Hr Postprandial (≤140 mg/dL)' : 'Hedefte 1. Saat Tokluk (≤140 mg/dL)',
        color: '#027A48',
        bgColor: '#ECFDF3',
        badgeColor: '#D1FADF',
        desc: isEn ? 'Within recommended obstetric 1-hour target.' : 'Yemekten 1 saat sonraki ideal hedef aralığında.',
        isAlert: false,
      };
    }
    return {
      status: 'high',
      label: isEn ? 'High 1-Hr Postprandial (>140 mg/dL)' : 'Yüksek 1. Saat Tokluk (>140 mg/dL)',
      color: '#D92D20',
      bgColor: '#FFF4F2',
      badgeColor: '#FECDCA',
      desc: isEn ? 'Above postprandial target. Try a gentle 15-minute walk and adjust carb portion.' : 'Tokluk hedefinin üzerinde. 15 dakikalık hafif yürüyüş yapın ve karbonhidrat miktarını dengeleyin.',
      isAlert: true,
    };
  }

  // 2-Hour Postprandial: Target <=120
  if (timing === 'post2h') {
    if (val <= 120) {
      return {
        status: 'normal',
        label: isEn ? 'Optimal 2-Hr Postprandial (≤120 mg/dL)' : 'Hedefte 2. Saat Tokluk (≤120 mg/dL)',
        color: '#027A48',
        bgColor: '#ECFDF3',
        badgeColor: '#D1FADF',
        desc: isEn ? 'Within recommended obstetric 2-hour target.' : 'Yemekten 2 saat sonraki ideal hedef aralığında.',
        isAlert: false,
      };
    }
    return {
      status: 'high',
      label: isEn ? 'High 2-Hr Postprandial (>120 mg/dL)' : 'Yüksek 2. Saat Tokluk (>120 mg/dL)',
      color: '#D92D20',
      bgColor: '#FFF4F2',
      badgeColor: '#FECDCA',
      desc: isEn ? 'Above target. Log the meal ingredients and share with your dietitian/physician.' : 'Hedefin üzerinde. Öğün içeriğinizi not edin ve hekiminizle/diyetisyeninizle paylaşın.',
      isAlert: true,
    };
  }

  // Random or Bedtime: Target <=120
  if (val <= 120) {
    return {
      status: 'normal',
      label: isEn ? 'Normal Reading (≤120 mg/dL)' : 'Normal Değer (≤120 mg/dL)',
      color: '#027A48',
      bgColor: '#ECFDF3',
      badgeColor: '#D1FADF',
      desc: isEn ? 'Comfortably within safe maternal glucose limits.' : 'Gebelik için güvenli glukoz sınırları içerisinde.',
      isAlert: false,
    };
  }
  return {
    status: 'elevated',
    label: isEn ? 'Elevated Glucose (>120 mg/dL)' : 'Yüksek Glukoz (>120 mg/dL)',
    color: '#B54708',
    bgColor: '#FFFAEB',
    badgeColor: '#FEDF89',
    desc: isEn ? 'Slightly above routine bedtime target.' : 'Rutin gece hedefinin üzerinde seyrediyor.',
    isAlert: false,
  };
}

export function BloodGlucoseScreen({ state, update, toast, close, lang: propLang }) {
  const lang = propLang || state?.lang || 'tr';
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState('measure'); // 'measure' | 'ogtt' | 'history'
  const [value, setValue] = useState('95');
  const [timing, setTiming] = useState('fasting'); // 'fasting' | 'post1h' | 'post2h' | 'bedtime'
  const [mealTag, setMealTag] = useState(isEn ? 'Breakfast' : 'Kahvaltı');
  const [note, setNote] = useState('');

  const logs = state.bloodGlucoseLogs || [];

  const category = useMemo(() => {
    return getBloodGlucoseCategory(timing, value, isEn);
  }, [timing, value, isEn]);

  // Statistics
  const stats = useMemo(() => {
    if (logs.length === 0) return { avg: 0, inTargetPct: 100, count: 0 };
    const vals = logs.map(l => Number(l.value)).filter(v => Number.isFinite(v) && v > 0);
    if (vals.length === 0) return { avg: 0, inTargetPct: 100, count: 0 };
    const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    const inTarget = logs.filter(l => {
      const cat = getBloodGlucoseCategory(l.timing, l.value, isEn);
      return cat && cat.status === 'normal';
    }).length;
    const inTargetPct = Math.round((inTarget / logs.length) * 100);
    return { avg, inTargetPct, count: logs.length };
  }, [logs, isEn]);

  const handleSaveMeasurement = () => {
    const num = Number(value);
    if (!Number.isFinite(num) || num < 20 || num > 500) {
      toast && toast(isEn ? 'Please enter a valid glucose reading (20-500 mg/dL)' : 'Lütfen geçerli bir kan şekeri değeri girin (20-500 mg/dL)');
      return;
    }

    const newLog = {
      id: uid('glu_'),
      value: num,
      timing,
      mealTag,
      note: note.trim(),
      date: new Date().toISOString(),
      status: category?.status || 'normal',
    };

    update(old => ({
      bloodGlucoseLogs: [newLog, ...(old.bloodGlucoseLogs || [])],
    }));

    saveBloodGlucoseCloud(newLog).catch(() => {});

    toast && toast(isEn ? 'Blood glucose reading recorded 🩸' : 'Kan şekeri ölçümü kaydedildi 🩸');
    setNote('');
  };

  const handleDeleteLog = (id) => {
    update(old => ({
      bloodGlucoseLogs: (old.bloodGlucoseLogs || []).filter(l => l.id !== id),
    }));
    toast && toast(isEn ? 'Measurement deleted' : 'Ölçüm kaydı silindi');
  };

  const shareWithDoctorWhatsApp = () => {
    if (logs.length === 0) {
      toast && toast(isEn ? 'No measurements to share yet' : 'Paylaşılacak kayıt bulunmuyor');
      return;
    }
    const recent = logs.slice(0, 5);
    let text = isEn
      ? `🌸 *Momora Blood Glucose Dossier*\nPatient: ${state.name || 'Mother'}\nGestational Week: ${state.week || 24}\n\n*Recent Readings:*`
      : `🌸 *Momora Kan Şekeri Takip Raporu*\nAnne Adayı: ${state.name || 'Anne'}\nGebelik Haftası: ${state.week || 24}. Hafta\n\n*Son Ölçümler:*`;

    recent.forEach(r => {
      const d = formatLocalizedDate(r.date, lang);
      const tLabel = {
        fasting: isEn ? 'Fasting' : 'Açlık',
        post1h: isEn ? '1h Post' : '1.s Tokluk',
        post2h: isEn ? '2h Post' : '2.s Tokluk',
        bedtime: isEn ? 'Bedtime' : 'Gece',
      }[r.timing] || r.timing;
      text += `\n• ${d} | ${tLabel} (${r.mealTag}): *${r.value} mg/dL* ${r.note ? `[${r.note}]` : ''}`;
    });

    text += isEn
      ? `\n\n*Summary:* Avg ${stats.avg} mg/dL | ${stats.inTargetPct}% in ADA target range.`
      : `\n\n*Özet:* Ortalama ${stats.avg} mg/dL | %${stats.inTargetPct} ADA hedefinde.`;

    const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
    Linking.canOpenURL(url).then(supp => {
      if (supp) Linking.openURL(url);
      else {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(text);
          toast && toast(isEn ? 'Report copied to clipboard' : 'Rapor panoya kopyalandı');
        } else {
          toast && toast(isEn ? 'WhatsApp not available' : 'WhatsApp bulunamadı');
        }
      }
    }).catch(() => {});
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHero
        title={isEn ? 'Blood Glucose & Gestational Diabetes' : 'Kan Şekeri & Gestasyonel Diyabet'}
        subtitle={isEn ? 'ADA & ACOG clinical thresholds, OGTT guide & tracking' : 'ADA ve ACOG hedefleri, şeker yükleme testi ve günlük takibi'}
        coverAsset="card_blood_glucose"
      />

      {/* Metric Cards Banner */}
      <View style={styles.metricsRow}>
        <MetricCard
          label={isEn ? 'Target Fasting' : 'Açlık Hedefi'}
          value="≤ 95"
          unit="mg/dL"
          tone="sage"
        />
        <MetricCard
          label={isEn ? 'Target 1h Post' : '1s Tokluk Hedefi'}
          value="≤ 140"
          unit="mg/dL"
          tone="lavender"
        />
        <MetricCard
          label={isEn ? 'Target Range' : 'Hedefte Oran'}
          value={stats.count > 0 ? `%${stats.inTargetPct}` : '-%'}
          unit={stats.count > 0 ? `${stats.count} kayıt` : ''}
          tone="rose"
        />
      </View>

      {/* Segmented Tab Selector */}
      <View style={styles.tabsRow}>
        {[
          { key: 'measure', label: isEn ? 'Log Reading' : 'Ölçüm Yap', icon: 'heart' },
          { key: 'history', label: isEn ? 'History & Trends' : 'Kayıtlar & Eğilim', icon: 'track', badge: logs.length },
          { key: 'ogtt', label: isEn ? 'OGTT Test Guide' : 'Şeker Yükleme (OGTT)', icon: 'book' },
        ].map(t => {
          const active = activeTab === t.key;
          return (
            <Tap
              key={t.key}
              onPress={() => setActiveTab(t.key)}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
            >
              <Icon name={t.icon} size={14} color={active ? colors.purple : '#7E6B87'} />
              <T bold={active} style={{ fontSize: 12, color: active ? colors.purple : '#7E6B87' }}>
                {t.label}
              </T>
              {t.badge ? (
                <View style={[styles.badge, active && { backgroundColor: colors.purple }]}>
                  <T bold style={{ fontSize: 10, color: '#FFFFFF' }}>{t.badge}</T>
                </View>
              ) : null}
            </Tap>
          );
        })}
      </View>

      {/* ─── TAB 1: MEASURE (Yeni Ölçüm) ─── */}
      {activeTab === 'measure' && (
        <View style={{ gap: 14 }}>
          <Card style={styles.inputCard}>
            <T bold style={styles.cardHeaderTitle}>
              {isEn ? 'Blood Glucose Level (mg/dL)' : 'Kan Şekeri Değeri (mg/dL)'}
            </T>

            {/* Timing Pills */}
            <View style={styles.timingRow}>
              {[
                { key: 'fasting', labelTr: 'Açlık (Sabah)', labelEn: 'Fasting' },
                { key: 'post1h', labelTr: '1. Saat Tokluk', labelEn: '1h Postprandial' },
                { key: 'post2h', labelTr: '2. Saat Tokluk', labelEn: '2h Postprandial' },
                { key: 'bedtime', labelTr: 'Gece / Rastgele', labelEn: 'Bedtime / Other' },
              ].map(item => (
                <Tap
                  key={item.key}
                  onPress={() => setTiming(item.key)}
                  style={[styles.timingPill, timing === item.key && styles.timingPillActive]}
                >
                  <T bold={timing === item.key} style={{ fontSize: 11, color: timing === item.key ? '#FFFFFF' : '#6A5675' }}>
                    {isEn ? item.labelEn : item.labelTr}
                  </T>
                </Tap>
              ))}
            </View>

            {/* Main Dial Input */}
            <View style={styles.dialBox}>
              <Tap
                onPress={() => setValue(old => String(Math.max(30, Number(old || 95) - 5)))}
                style={styles.adjustBtn}
              >
                <T bold style={styles.adjustBtnText}>-5</T>
              </Tap>

              <View style={styles.valueDisplay}>
                <TextInput
                  value={value}
                  onChangeText={setValue}
                  keyboardType="numeric"
                  maxLength={3}
                  style={styles.dialInput}
                />
                <T style={styles.dialUnit}>mg/dL</T>
              </View>

              <Tap
                onPress={() => setValue(old => String(Math.min(400, Number(old || 95) + 5)))}
                style={styles.adjustBtn}
              >
                <T bold style={styles.adjustBtnText}>+5</T>
              </Tap>
            </View>

            {/* Live Clinical Diagnostic Feedback */}
            {category && (
              <View style={[styles.statusBox, { backgroundColor: category.bgColor, borderColor: category.badgeColor }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={[styles.statusDot, { backgroundColor: category.color }]} />
                  <T bold style={[styles.statusTitle, { color: category.color }]}>
                    {category.label}
                  </T>
                </View>
                <T style={styles.statusDesc}>{category.desc}</T>
              </View>
            )}

            {/* Meal Tag Selector */}
            <View style={{ marginTop: 8 }}>
              <T style={styles.metaLabel}>{isEn ? 'Meal / Event' : 'Öğün / Durum'}</T>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                {[
                  isEn ? 'Breakfast' : 'Kahvaltı',
                  isEn ? 'Lunch' : 'Öğle Yemeği',
                  isEn ? 'Dinner' : 'Akşam Yemeği',
                  isEn ? 'Snack' : 'Ara Öğün',
                  isEn ? 'Post-Walk' : 'Yürüyüş Sonrası',
                ].map(tag => (
                  <Tap
                    key={tag}
                    onPress={() => setMealTag(tag)}
                    style={[styles.miniChip, mealTag === tag && styles.miniChipActive]}
                  >
                    <T bold={mealTag === tag} style={{ fontSize: 11.5, color: mealTag === tag ? '#FFFFFF' : '#6A5675' }}>
                      {tag}
                    </T>
                  </Tap>
                ))}
              </View>
            </View>

            {/* Note Input */}
            <View style={{ marginTop: 10 }}>
              <T style={styles.metaLabel}>{isEn ? 'Notes / Insulin (optional)' : 'Not / İnsülin / Diyet Notu (opsiyonel)'}</T>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={isEn ? 'e.g. 4 units insulin, salad with olive oil...' : 'Örn: Salata ve çorba sonrası, 15 dk yüründü...'}
                placeholderTextColor="#A394A8"
                style={styles.noteInput}
              />
            </View>

            {/* Save Button */}
            <Tap onPress={handleSaveMeasurement} style={styles.saveBtn}>
              <Icon name="check" size={18} color="#FFFFFF" />
              <T bold style={styles.saveBtnText}>
                {isEn ? 'Save Glucose Reading' : 'Kan Şekeri Ölçümünü Kaydet'}
              </T>
            </Tap>
          </Card>

          {/* Quick Doctor WhatsApp Share */}
          <Tap onPress={shareWithDoctorWhatsApp} style={styles.whatsAppBtn}>
            <Icon name="chat" size={17} color="#FFFFFF" />
            <T bold style={{ color: '#FFFFFF', fontSize: 13.5 }}>
              {isEn ? 'Export Glucose Dossier via WhatsApp' : "Şeker Değerlerini WhatsApp'la Doktora Gönder"}
            </T>
          </Tap>

          <InfoNote
            title={isEn ? 'ADA & ACOG Target Reference' : 'ADA & ACOG Klinik Hedef Değerleri'}
            text={isEn
              ? 'American Diabetes Association targets for gestational diabetes: Fasting ≤95 mg/dL, 1-hour postprandial ≤140 mg/dL, 2-hour postprandial ≤120 mg/dL. Always consult your obstetrician.'
              : 'Gebelikte Amerikan Diyabet Birliği (ADA) hedefleri: Açlık ≤95 mg/dL, 1. saat tokluk ≤140 mg/dL, 2. saat tokluk ≤120 mg/dL olarak kabul edilir.'}
            tone="neutral"
          />
        </View>
      )}

      {/* ─── TAB 2: HISTORY (Kayıtlar & Geçmiş) ─── */}
      {activeTab === 'history' && (
        <View style={{ gap: 12 }}>
          {logs.length === 0 ? (
            <Card style={{ padding: 24, alignItems: 'center' }}>
              <T style={{ fontSize: 32 }}>🩸</T>
              <T bold style={{ fontSize: 15, color: colors.ink, marginTop: 8 }}>
                {isEn ? 'No Glucose Logs Yet' : 'Henüz Şeker Kaydı Bulunmuyor'}
              </T>
              <T style={{ fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 4 }}>
                {isEn ? 'Log your daily fasting and postprandial readings.' : 'Açlık ve tokluk ölçümlerinizi kaydederek trendinizi takip edin.'}
              </T>
            </Card>
          ) : (
            logs.map(item => {
              const cat = getBloodGlucoseCategory(item.timing, item.value, isEn);
              const dateStr = formatLocalizedDate(item.date, lang);
              const tLabel = {
                fasting: isEn ? 'Fasting' : 'Açlık',
                post1h: isEn ? '1h Post' : '1. Saat Tokluk',
                post2h: isEn ? '2h Post' : '2. Saat Tokluk',
                bedtime: isEn ? 'Bedtime' : 'Gece / Rastgele',
              }[item.timing] || item.timing;

              return (
                <Card key={item.id} style={styles.logCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={[styles.logDot, { backgroundColor: cat?.color || colors.purple }]} />
                      <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <T bold style={{ fontSize: 17, color: colors.ink }}>
                            {item.value} <T style={{ fontSize: 12, color: colors.muted }}>mg/dL</T>
                          </T>
                          <View style={[styles.timingBadge, { backgroundColor: '#F0EAF5' }]}>
                            <T bold style={{ fontSize: 10, color: colors.purple }}>{tLabel}</T>
                          </View>
                        </View>
                        <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                          {dateStr} · {item.mealTag}
                        </T>
                      </View>
                    </View>

                    <Tap
                      onPress={() => handleDeleteLog(item.id)}
                      style={styles.deleteBtn}
                    >
                      <Icon name="trash" size={14} color="#A394A8" />
                    </Tap>
                  </View>

                  {item.note ? (
                    <View style={styles.logNoteBox}>
                      <T style={{ fontSize: 11.5, color: '#5C4A66' }}>💬 {item.note}</T>
                    </View>
                  ) : null}
                </Card>
              );
            })
          )}
        </View>
      )}

      {/* ─── TAB 3: OGTT GUIDE (Şeker Yükleme Testi Rehberi) ─── */}
      {activeTab === 'ogtt' && (
        <View style={{ gap: 14 }}>
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <T style={{ fontSize: 20 }}>🧪</T>
              <T bold style={{ fontSize: 15, color: colors.ink }}>
                {isEn ? 'OGTT (Oral Glucose Tolerance Test) 101' : '75g Şeker Yükleme Testi (OGTT) Kılavuzu'}
              </T>
            </View>
            <T style={{ fontSize: 12.5, color: '#4D3E54', lineHeight: 18 }}>
              {isEn
                ? 'Performed routinely between gestational weeks 24 and 28. It screens for gestational diabetes to safeguard maternal health and ensure optimal fetal growth without excessive macrosomia.'
                : 'Gebeliğin 24. ile 28. haftaları arasında rutin olarak yapılır. Gestasyonel diyabeti erken saptayarak bebeğin iri doğum (makrozomi) ve annenin ilerleyen haftalardaki tansiyon risklerini önler.'}
            </T>
          </Card>

          <Card style={{ padding: 16, backgroundColor: '#FAF6FA' }}>
            <T bold style={{ fontSize: 13.5, color: colors.purple, marginBottom: 8 }}>
              {isEn ? 'Diagnostic Criteria (75g 2-Hour OGTT):' : 'Tanı Kriterleri (75g 2 Saatlik OGTT):'}
            </T>
            {[
              { label: isEn ? 'Fasting (Açlık)' : 'Açlık Şekeri', threshold: '≥ 92 mg/dL' },
              { label: isEn ? '1st Hour (1. Saat)' : '1. Saat Değeri', threshold: '≥ 180 mg/dL' },
              { label: isEn ? '2nd Hour (2. Saat)' : '2. Saat Değeri', threshold: '≥ 153 mg/dL' },
            ].map((row, idx) => (
              <View key={idx} style={styles.ogttRow}>
                <T style={{ fontSize: 12.5, color: colors.ink }}>{row.label}</T>
                <T bold style={{ fontSize: 13, color: '#B42318' }}>{row.threshold}</T>
              </View>
            ))}
            <T style={{ fontSize: 11, color: colors.muted, marginTop: 8 }}>
              {isEn
                ? 'According to IADPSG and Turkish Obstetric Society, any single value equal to or exceeding these thresholds establishes a gestational diabetes diagnosis.'
                : 'IADPSG ve Türk Jinekoloji Derneği kriterlerine göre bu 3 değerden herhangi birinin eşik değere eşit veya üzerinde olması tanı için yeterlidir.'}
            </T>
          </Card>

          <Card style={{ padding: 16 }}>
            <T bold style={{ fontSize: 13.5, color: colors.ink, marginBottom: 8 }}>
              {isEn ? 'Preparation Tips for the Test:' : 'Test Öncesi Hazırlık İpuçları:'}
            </T>
            {[
              isEn ? 'Fast for 8 to 10 hours overnight (water is allowed).' : 'En az 8-10 saatlik gece açlığı ile gidin (su serbesttir).',
              isEn ? 'Do not restrict carbs for 3 days before the test; eat normally.' : 'Testten önceki 3 gün diyeti kısıtlamayın, normal beslenin.',
              isEn ? 'Sit quietly during the 2 hours; avoid brisk walking or stress.' : 'İçeceği içtikten sonraki 2 saat boyunca sakin oturun, hareket etmeyin.',
              isEn ? 'Bring a light protein snack for immediately after the test.' : 'Test biter bitmez yemek için yanınızda ceviz, peynirli sandviç gibi sağlıklı bir atıştırmalık bulundurun.',
            ].map((tip, idx) => (
              <View key={idx} style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
                <T style={{ color: colors.purple }}>•</T>
                <T style={{ flex: 1, fontSize: 12, color: '#4D3E54', lineHeight: 16 }}>{tip}</T>
              </View>
            ))}
          </Card>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#EDE5EF',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...shadow,
  },
  badge: {
    backgroundColor: '#8E7394',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  inputCard: {
    padding: 16,
    gap: 10,
  },
  cardHeaderTitle: {
    fontSize: 13.5,
    color: colors.ink,
  },
  timingRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  timingPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FAF5FA',
    borderWidth: 1,
    borderColor: '#E8DEEA',
  },
  timingPillActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  dialBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#FAF6FA',
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#EBDDEE',
    marginTop: 4,
  },
  adjustBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5D6E8',
    ...shadow,
  },
  adjustBtnText: {
    fontSize: 14,
    color: colors.purple,
  },
  valueDisplay: {
    alignItems: 'center',
  },
  dialInput: {
    fontSize: 38,
    fontWeight: '900',
    color: colors.ink,
    textAlign: 'center',
    padding: 0,
    minWidth: 80,
  },
  dialUnit: {
    fontSize: 11,
    color: colors.muted,
    marginTop: -2,
  },
  statusBox: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTitle: {
    fontSize: 12.5,
  },
  statusDesc: {
    fontSize: 11.5,
    color: '#49364F',
    lineHeight: 16,
  },
  metaLabel: {
    fontSize: 11.5,
    color: colors.muted,
  },
  miniChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FAF5FA',
    borderWidth: 1,
    borderColor: '#E8DFE9',
  },
  miniChipActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  noteInput: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DFD2E2',
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    fontSize: 12.5,
    color: colors.ink,
    marginTop: 4,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.purple,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 6,
    ...shadow,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
  },
  whatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    paddingVertical: 12,
    borderRadius: 14,
    ...shadow,
  },
  logCard: {
    padding: 14,
    gap: 8,
  },
  logDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timingBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deleteBtn: {
    padding: 6,
  },
  logNoteBox: {
    backgroundColor: '#FAF6FA',
    padding: 8,
    borderRadius: 8,
  },
  ogttRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#EFE5F0',
  },
});
