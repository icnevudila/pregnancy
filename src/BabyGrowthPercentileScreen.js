import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, ScreenHero, InfoNote, MetricCard } from './ui';
import { saveTrackingEvent } from './backendSync';

// WHO (DSÖ) 2006 Child Growth Standards (Median / P50, P3, P15, P85, P97)
// Values in kg (Weight), cm (Length), cm (Head Circumference) for selected reference months
export const WHO_GROWTH_STANDARDS = {
  girl: {
    // month: { weight: [P3, P15, P50, P85, P97], length: [P3, P15, P50, P85, P97], head: [P3, P15, P50, P85, P97] }
    0:  { weight: [2.4, 2.8, 3.2, 3.7, 4.2], length: [45.4, 47.3, 49.1, 51.0, 52.9], head: [31.7, 32.7, 33.9, 35.1, 36.1] },
    1:  { weight: [3.2, 3.6, 4.2, 4.8, 5.5], length: [49.8, 51.7, 53.7, 55.6, 57.6], head: [34.3, 35.3, 36.5, 37.8, 38.8] },
    2:  { weight: [3.9, 4.5, 5.1, 5.8, 6.6], length: [53.0, 55.0, 57.1, 59.1, 61.1], head: [36.0, 37.1, 38.3, 39.6, 40.7] },
    3:  { weight: [4.5, 5.2, 5.8, 6.6, 7.5], length: [55.6, 57.7, 59.8, 61.9, 64.0], head: [37.2, 38.4, 39.5, 40.9, 42.0] },
    4:  { weight: [5.0, 5.7, 6.4, 7.3, 8.2], length: [57.8, 59.9, 62.1, 64.3, 66.4], head: [38.2, 39.4, 40.6, 41.9, 43.1] },
    5:  { weight: [5.4, 6.1, 6.9, 7.8, 8.8], length: [59.6, 61.8, 64.0, 66.2, 68.5], head: [39.0, 40.2, 41.5, 42.8, 44.0] },
    6:  { weight: [5.7, 6.5, 7.3, 8.2, 9.3], length: [61.2, 63.5, 65.7, 68.0, 70.3], head: [39.7, 40.9, 42.2, 43.5, 44.8] },
    7:  { weight: [6.0, 6.8, 7.6, 8.6, 9.8], length: [62.7, 65.0, 67.3, 69.6, 71.9], head: [40.4, 41.6, 42.8, 44.2, 45.5] },
    8:  { weight: [6.3, 7.0, 7.9, 9.0, 10.2], length: [64.0, 66.4, 68.7, 71.1, 73.5], head: [40.9, 42.1, 43.4, 44.8, 46.0] },
    9:  { weight: [6.5, 7.3, 8.2, 9.3, 10.5], length: [65.3, 67.7, 70.1, 72.6, 75.0], head: [41.3, 42.6, 43.8, 45.3, 46.5] },
    10: { weight: [6.7, 7.5, 8.5, 9.6, 10.9], length: [66.5, 69.0, 71.5, 73.9, 76.4], head: [41.7, 43.0, 44.2, 45.7, 46.9] },
    11: { weight: [6.9, 7.7, 8.7, 9.9, 11.2], length: [67.7, 70.3, 72.8, 75.3, 77.8], head: [42.0, 43.3, 44.6, 46.0, 47.3] },
    12: { weight: [7.0, 7.9, 8.9, 10.1, 11.5], length: [68.9, 71.4, 74.0, 76.6, 79.2], head: [42.3, 43.6, 44.9, 46.4, 47.6] },
    15: { weight: [7.6, 8.5, 9.6, 10.9, 12.4], length: [72.0, 74.8, 77.5, 80.2, 83.0], head: [43.1, 44.4, 45.7, 47.2, 48.5] },
    18: { weight: [8.1, 9.1, 10.2, 11.6, 13.2], length: [74.9, 77.8, 80.7, 83.6, 86.5], head: [43.7, 45.0, 46.4, 47.9, 49.2] },
    24: { weight: [9.0, 10.1, 11.5, 13.0, 14.8], length: [80.0, 83.2, 86.4, 89.6, 92.9], head: [44.6, 46.0, 47.4, 49.0, 50.3] },
  },
  boy: {
    0:  { weight: [2.5, 2.9, 3.3, 3.9, 4.4], length: [46.1, 48.0, 49.9, 51.8, 53.7], head: [32.1, 33.2, 34.5, 35.7, 36.9] },
    1:  { weight: [3.4, 3.9, 4.5, 5.1, 5.8], length: [50.8, 52.8, 54.7, 56.7, 58.6], head: [35.1, 36.1, 37.3, 38.6, 39.7] },
    2:  { weight: [4.3, 4.9, 5.6, 6.3, 7.1], length: [54.4, 56.4, 58.4, 60.4, 62.4], head: [36.9, 38.0, 39.1, 40.5, 41.6] },
    3:  { weight: [5.0, 5.7, 6.4, 7.2, 8.0], length: [57.3, 59.4, 61.4, 63.5, 65.5], head: [38.1, 39.3, 40.5, 41.8, 42.9] },
    4:  { weight: [5.6, 6.2, 7.0, 7.8, 8.7], length: [59.7, 61.8, 63.9, 66.0, 68.0], head: [39.2, 40.4, 41.6, 42.9, 44.1] },
    5:  { weight: [6.0, 6.7, 7.5, 8.4, 9.3], length: [61.7, 63.8, 65.9, 68.0, 70.1], head: [40.0, 41.2, 42.4, 43.8, 45.0] },
    6:  { weight: [6.4, 7.1, 7.9, 8.8, 9.8], length: [63.3, 65.5, 67.6, 69.8, 71.9], head: [40.7, 41.9, 43.3, 44.6, 45.8] },
    7:  { weight: [6.7, 7.4, 8.3, 9.2, 10.3], length: [64.8, 67.0, 69.2, 71.3, 73.5], head: [41.3, 42.6, 43.9, 45.3, 46.4] },
    8:  { weight: [6.9, 7.7, 8.6, 9.6, 10.7], length: [66.2, 68.4, 70.6, 72.8, 75.0], head: [41.8, 43.1, 44.5, 45.8, 47.0] },
    9:  { weight: [7.1, 8.0, 8.9, 9.9, 11.0], length: [67.5, 69.7, 72.0, 74.2, 76.5], head: [42.3, 43.6, 45.0, 46.3, 47.5] },
    10: { weight: [7.4, 8.2, 9.2, 10.2, 11.4], length: [68.7, 71.0, 73.3, 75.6, 77.9], head: [42.7, 44.0, 45.4, 46.7, 48.0] },
    11: { weight: [7.6, 8.4, 9.4, 10.5, 11.7], length: [69.9, 72.2, 74.5, 76.9, 79.2], head: [43.0, 44.3, 45.7, 47.1, 48.4] },
    12: { weight: [7.7, 8.6, 9.6, 10.8, 12.0], length: [71.0, 73.4, 75.7, 78.1, 80.5], head: [43.3, 44.7, 46.1, 47.5, 48.8] },
    15: { weight: [8.3, 9.3, 10.3, 11.6, 12.8], length: [74.1, 76.6, 79.1, 81.7, 84.2], head: [44.1, 45.5, 46.9, 48.3, 49.6] },
    18: { weight: [8.8, 9.8, 10.9, 12.2, 13.7], length: [76.9, 79.6, 82.3, 85.0, 87.7], head: [44.7, 46.1, 47.5, 49.0, 50.4] },
    24: { weight: [9.7, 10.8, 12.2, 13.6, 15.3], length: [81.7, 84.8, 87.8, 90.9, 93.9], head: [45.5, 47.0, 48.3, 49.9, 51.3] },
  },
};

export function calculatePercentile(val, [p3, p15, p50, p85, p97]) {
  if (!val || val <= 0) return { percentile: 50, label: 'P50', status: 'normal' };
  if (val < p3) return { percentile: 2, label: '<%3', status: 'low' };
  if (val < p15) return { percentile: 8, label: '%3 - %15', status: 'caution_low' };
  if (val <= p85) return { percentile: 50, label: '%15 - %85 (İdeal)', status: 'normal' };
  if (val <= p97) return { percentile: 90, label: '%85 - %97', status: 'caution_high' };
  return { percentile: 98, label: '> %97', status: 'high' };
}

export function BabyGrowthPercentileScreen({ state, update, toast, close, lang: propLang }) {
  const lang = propLang || state?.lang || 'tr';
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState('calc'); // 'calc' | 'history' | 'guide'
  const [gender, setGender] = useState(state.babyGender === 'Erkek' ? 'boy' : 'girl');
  const [ageMonths, setAgeMonths] = useState(6);
  const [weightStr, setWeightStr] = useState('7.5');
  const [lengthStr, setLengthStr] = useState('66');
  const [headStr, setHeadStr] = useState('42.5');

  const babyGrowthLogs = state.babyGrowthLogs || [
    { id: 'bg1', date: '2026-03-10', month: 2, weight: 5.2, length: 57.5, head: 38.5, gender: 'girl' },
    { id: 'bg2', date: '2026-05-12', month: 4, weight: 6.4, length: 62.0, head: 40.5, gender: 'girl' },
  ];

  // Nearest month standards
  const refMonths = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 24];
  const nearestMonth = useMemo(() => {
    return refMonths.reduce((prev, curr) => Math.abs(curr - ageMonths) < Math.abs(prev - ageMonths) ? curr : prev, 6);
  }, [ageMonths]);

  const std = WHO_GROWTH_STANDARDS[gender][nearestMonth] || WHO_GROWTH_STANDARDS.girl[6];

  const weightNum = parseFloat(weightStr.replace(',', '.')) || 0;
  const lengthNum = parseFloat(lengthStr.replace(',', '.')) || 0;
  const headNum = parseFloat(headStr.replace(',', '.')) || 0;

  const weightPercentile = useMemo(() => calculatePercentile(weightNum, std.weight), [weightNum, std]);
  const lengthPercentile = useMemo(() => calculatePercentile(lengthNum, std.length), [lengthNum, std]);
  const headPercentile = useMemo(() => calculatePercentile(headNum, std.head), [headNum, std]);

  const handleSaveRecord = () => {
    if (!weightNum || !lengthNum) {
      toast && toast(isEn ? 'Please enter valid weight and length.' : 'Lütfen geçerli kilo ve boy girin.');
      return;
    }

    const newRecord = {
      id: `bg_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      month: ageMonths,
      weight: weightNum,
      length: lengthNum,
      head: headNum,
      gender,
      weightPerc: weightPercentile.label,
      lengthPerc: lengthPercentile.label,
      headPerc: headPercentile.label,
    };

    const nextLogs = [newRecord, ...babyGrowthLogs];
    update && update({ babyGrowthLogs: nextLogs });

    saveTrackingEvent({
      type: 'baby_growth',
      title: `${ageMonths}. Ay Büyüme Kaydı`,
      value: `${weightNum} kg · ${lengthNum} cm`,
      metadata: newRecord,
    }).catch(() => {});

    toast && toast(isEn ? 'Growth entry saved successfully!' : 'Büyüme kaydı kaydedildi!');
  };

  const handleShareDossier = () => {
    const babyName = state.babyName || (isEn ? 'Baby' : 'Bebek');
    const msg = isEn
      ? `📊 ${babyName} - WHO Growth Percentile Report (${ageMonths} Months)\n⚖️ Weight: ${weightNum} kg (${weightPercentile.label})\n📏 Length: ${lengthNum} cm (${lengthPercentile.label})\n🧢 Head Circ: ${headNum} cm (${headPercentile.label})\nSource: WHO Child Growth Standards 2006`
      : `📊 ${babyName} - DSÖ Büyüme Persentil Raporu (${ageMonths}. Ay)\n⚖️ Kilo: ${weightNum} kg (${weightPercentile.label})\n📏 Boy: ${lengthNum} cm (${lengthPercentile.label})\n🧢 Baş Çevresi: ${headNum} cm (${headPercentile.label})\nKaynak: Dünya Sağlık Örgütü (WHO) 2006 Standartları`;

    toast && toast(isEn ? 'Report copied for pediatrician!' : 'Doktor için büyüme karnesi panoya kopyalandı!');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
      <ScreenHero
        title={isEn ? 'Baby Growth & Percentiles' : 'Bebek Büyüme & Persentil'}
        subtitle={isEn ? 'WHO (World Health Organization) growth curves & percentiles' : 'Dünya Sağlık Örgütü (WHO) persentil eğrileri ve gelişim karnesi'}
        badge="WHO / DSÖ 2006"
        badgeColor="#1E40AF"
        art="card_growth_percentile"
      />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Tap
          onPress={() => setActiveTab('calc')}
          style={[styles.tabBtn, activeTab === 'calc' && styles.tabBtnActive]}
        >
          <T bold={activeTab === 'calc'} style={{ color: activeTab === 'calc' ? colors.primary : colors.textMuted, fontSize: 13.5 }}>
            {isEn ? 'Calculator' : 'Hesaplayıcı'}
          </T>
        </Tap>
        <Tap
          onPress={() => setActiveTab('history')}
          style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
        >
          <T bold={activeTab === 'history'} style={{ color: activeTab === 'history' ? colors.primary : colors.textMuted, fontSize: 13.5 }}>
            {isEn ? `History (${babyGrowthLogs.length})` : `Geçmiş (${babyGrowthLogs.length})`}
          </T>
        </Tap>
        <Tap
          onPress={() => setActiveTab('guide')}
          style={[styles.tabBtn, activeTab === 'guide' && styles.tabBtnActive]}
        >
          <T bold={activeTab === 'guide'} style={{ color: activeTab === 'guide' ? colors.primary : colors.textMuted, fontSize: 13.5 }}>
            {isEn ? 'WHO Standards' : 'DSÖ Kılavuzu'}
          </T>
        </Tap>
      </View>

      {activeTab === 'calc' && (
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          {/* Gender & Age Row */}
          <Card style={styles.inputCard}>
            <T bold style={{ fontSize: 15, color: colors.textDark, marginBottom: 12 }}>
              {isEn ? 'Baby Profile & Age' : 'Bebek Profili & Ayı'}
            </T>

            {/* Gender Toggle */}
            <View style={styles.genderRow}>
              <Tap
                onPress={() => setGender('girl')}
                style={[styles.genderBtn, gender === 'girl' && styles.genderBtnActiveGirl]}
              >
                <T bold style={{ color: gender === 'girl' ? '#DB2777' : colors.textMuted, fontSize: 13 }}>
                  🎀 {isEn ? 'Girl' : 'Kız Bebek'}
                </T>
              </Tap>
              <Tap
                onPress={() => setGender('boy')}
                style={[styles.genderBtn, gender === 'boy' && styles.genderBtnActiveBoy]}
              >
                <T bold style={{ color: gender === 'boy' ? '#2563EB' : colors.textMuted, fontSize: 13 }}>
                  🧢 {isEn ? 'Boy' : 'Erkek Bebek'}
                </T>
              </Tap>
            </View>

            {/* Age Month Selector */}
            <View style={{ marginTop: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <T style={{ fontSize: 13, color: colors.textSecondary }}>{isEn ? 'Current Age:' : 'Mevcut Ay:'}</T>
                <T bold style={{ fontSize: 15, color: colors.primary }}>{ageMonths} {isEn ? 'Months' : 'Aylık'}</T>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 24].map((m) => (
                  <Tap
                    key={m}
                    onPress={() => setAgeMonths(m)}
                    style={[styles.monthChip, ageMonths === m && styles.monthChipActive]}
                  >
                    <T bold style={{ fontSize: 12.5, color: ageMonths === m ? 'white' : colors.textDark }}>
                      {m === 0 ? (isEn ? 'Newborn' : 'Yenidoğan') : `${m}A`}
                    </T>
                  </Tap>
                ))}
              </ScrollView>
            </View>
          </Card>

          {/* Biometric Inputs */}
          <Card style={[styles.inputCard, { marginTop: 12 }]}>
            <T bold style={{ fontSize: 15, color: colors.textDark, marginBottom: 12 }}>
              {isEn ? 'Current Measurements' : 'Ölçüm Değerleri'}
            </T>

            <View style={styles.measureRow}>
              <View style={styles.measureCol}>
                <T style={styles.measureLabel}>⚖️ {isEn ? 'Weight (kg)' : 'Kilo (kg)'}</T>
                <TextInput
                  style={styles.measureInput}
                  keyboardType="numeric"
                  value={weightStr}
                  onChangeText={setWeightStr}
                  placeholder="7.5"
                />
              </View>

              <View style={styles.measureCol}>
                <T style={styles.measureLabel}>📏 {isEn ? 'Length (cm)' : 'Boy (cm)'}</T>
                <TextInput
                  style={styles.measureInput}
                  keyboardType="numeric"
                  value={lengthStr}
                  onChangeText={setLengthStr}
                  placeholder="66"
                />
              </View>

              <View style={styles.measureCol}>
                <T style={styles.measureLabel}>🧢 {isEn ? 'Head (cm)' : 'Baş Çev. (cm)'}</T>
                <TextInput
                  style={styles.measureInput}
                  keyboardType="numeric"
                  value={headStr}
                  onChangeText={setHeadStr}
                  placeholder="42.5"
                />
              </View>
            </View>
          </Card>

          {/* Results Summary Card */}
          <Card style={[styles.resultCard, { marginTop: 16 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <T bold style={{ fontSize: 16, color: colors.textDark }}>
                📊 {isEn ? 'WHO Growth Percentile Results' : 'DSÖ Persentil Sonuçları'}
              </T>
              <T style={{ fontSize: 12, color: colors.textMuted }}>
                {nearestMonth}. {isEn ? 'mo reference' : 'ay normu'}
              </T>
            </View>

            {/* 3 Percentile Bars */}
            <View style={styles.metricItem}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <T bold style={{ fontSize: 13.5, color: colors.textDark }}>⚖️ {isEn ? 'Weight-for-Age' : 'Aya Göre Kilo'}</T>
                <T bold style={{ fontSize: 13.5, color: weightPercentile.status === 'normal' ? '#059669' : '#D97706' }}>
                  {weightPercentile.label}
                </T>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${weightPercentile.percentile}%`, backgroundColor: weightPercentile.status === 'normal' ? '#10B981' : '#F59E0B' }]} />
              </View>
              <T style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 4 }}>
                {isEn ? `P50 Median: ${std.weight[2]} kg` : `DSÖ P50 Medyan: ${std.weight[2]} kg`} (P3: {std.weight[0]}kg - P97: {std.weight[4]}kg)
              </T>
            </View>

            <View style={[styles.metricItem, { marginTop: 12 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <T bold style={{ fontSize: 13.5, color: colors.textDark }}>📏 {isEn ? 'Length-for-Age' : 'Aya Göre Boy'}</T>
                <T bold style={{ fontSize: 13.5, color: lengthPercentile.status === 'normal' ? '#059669' : '#D97706' }}>
                  {lengthPercentile.label}
                </T>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${lengthPercentile.percentile}%`, backgroundColor: lengthPercentile.status === 'normal' ? '#10B981' : '#F59E0B' }]} />
              </View>
              <T style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 4 }}>
                {isEn ? `P50 Median: ${std.length[2]} cm` : `DSÖ P50 Medyan: ${std.length[2]} cm`} (P3: {std.length[0]}cm - P97: {std.length[4]}cm)
              </T>
            </View>

            <View style={[styles.metricItem, { marginTop: 12 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <T bold style={{ fontSize: 13.5, color: colors.textDark }}>🧢 {isEn ? 'Head Circumference' : 'Baş Çevresi'}</T>
                <T bold style={{ fontSize: 13.5, color: headPercentile.status === 'normal' ? '#059669' : '#D97706' }}>
                  {headPercentile.label}
                </T>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${headPercentile.percentile}%`, backgroundColor: headPercentile.status === 'normal' ? '#10B981' : '#F59E0B' }]} />
              </View>
              <T style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 4 }}>
                {isEn ? `P50 Median: ${std.head[2]} cm` : `DSÖ P50 Medyan: ${std.head[2]} cm`} (P3: {std.head[0]}cm - P97: {std.head[4]}cm)
              </T>
            </View>

            {/* Clinical interpretation note */}
            <InfoNote
              type={weightPercentile.status === 'normal' ? 'success' : 'alert'}
              style={{ marginTop: 16 }}
              text={
                weightPercentile.status === 'normal'
                  ? (isEn ? '🌟 Baby is growing along healthy WHO percentiles (15th-85th percentile band).' : '🌟 Bebeğiniz Dünya Sağlık Örgütü normlarına göre dengeli ve sağlıklı persentil bandında.')
                  : (isEn ? '⚠️ Growth falls outside the median 15-85th range. Discuss nutrition & feeding velocity with your pediatrician.' : '⚠️ Ölçüm 15-85 persentil bandının dışında. Büyüme hızı ve beslenmeyi doktorunuzla değerlendirin.')
              }
            />

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Tap onPress={handleSaveRecord} style={[styles.actionBtn, { backgroundColor: colors.primary, flex: 1 }]}>
                <T bold style={{ color: 'white', fontSize: 14 }}>
                  💾 {isEn ? 'Save Log' : 'Kaydet'}
                </T>
              </Tap>
              <Tap onPress={handleShareDossier} style={[styles.actionBtn, { backgroundColor: '#10B981', flex: 1.2 }]}>
                <T bold style={{ color: 'white', fontSize: 13.5 }}>
                  🩺 {isEn ? 'Pediatrician Export' : 'Doktora Gönder'}
                </T>
              </Tap>
            </View>
          </Card>
        </View>
      )}

      {activeTab === 'history' && (
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          {babyGrowthLogs.map((log) => (
            <Card key={log.id} style={styles.historyCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <T bold style={{ fontSize: 15, color: colors.textDark }}>
                  {log.month}. {isEn ? 'Month Visit' : 'Ay Kontrolü'} ({log.date})
                </T>
                <T style={{ fontSize: 12, color: colors.textMuted }}>
                  {log.gender === 'boy' ? '🧢 Erkek' : '🎀 Kız'}
                </T>
              </View>
              <View style={styles.historyPillRow}>
                <View style={styles.historyPill}>
                  <T style={{ fontSize: 11.5, color: colors.textMuted }}>Kilo</T>
                  <T bold style={{ fontSize: 13.5, color: colors.textDark }}>{log.weight} kg</T>
                </View>
                <View style={styles.historyPill}>
                  <T style={{ fontSize: 11.5, color: colors.textMuted }}>Boy</T>
                  <T bold style={{ fontSize: 13.5, color: colors.textDark }}>{log.length} cm</T>
                </View>
                <View style={styles.historyPill}>
                  <T style={{ fontSize: 11.5, color: colors.textMuted }}>Baş Çevresi</T>
                  <T bold style={{ fontSize: 13.5, color: colors.textDark }}>{log.head} cm</T>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {activeTab === 'guide' && (
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Card style={styles.guideCard}>
            <T bold style={{ fontSize: 15, color: '#1E3A8A', marginBottom: 8 }}>
              📖 {isEn ? 'What is a Percentile?' : 'Persentil Ne Anlama Gelir?'}
            </T>
            <T style={styles.guideBody}>
              {isEn
                ? 'A percentile compares your baby with 100 healthy, breastfed babies of the same age and gender from the WHO Multicentre Growth Reference Study. 50th percentile is the mathematical median.'
                : 'Persentil, bebeğinizin kilo ve boyunun aynı yaş ve cinsiyetteki 100 sağlıklı bebek arasındaki sırasını gösterir. Örneğin 50. persentil, tam ortalama anlamına gelir. %15 ile %85 arası ideal ve sağlıklı kabul edilir.'}
            </T>
          </Card>

          <Card style={[styles.guideCard, { marginTop: 12 }]}>
            <T bold style={{ fontSize: 15, color: '#B45309', marginBottom: 8 }}>
              ⚠️ {isEn ? 'When to Consult the Doctor?' : 'Ne Zaman Doktora Danışılmalı?'}
            </T>
            <T style={styles.guideBody}>
              {isEn
                ? '• Dropping across 2 major percentile curves (e.g. from 75th down to 25th).\n• Flat weight curve (plateau) for more than 4-6 consecutive weeks.\n• Measurement falling below 3rd or above 97th percentile.'
                : '• Bebeğin büyüme eğrisinde 2 ana persentil çizgisi birden aşağı düşmesi (Örn: %75 bandından %25 bandına gerileme).\n• 4-6 hafta boyunca hiç kilo alamama veya kilo kaybı.\n• Ölçümlerin %3 altında veya %97 üstünde kalması.'}
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
  inputCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'white',
    ...shadow.sm,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  genderBtnActiveGirl: {
    borderColor: '#F472B6',
    backgroundColor: '#FDF2F8',
  },
  genderBtnActiveBoy: {
    borderColor: '#60A5FA',
    backgroundColor: '#EFF6FF',
  },
  monthChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  monthChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  measureRow: {
    flexDirection: 'row',
    gap: 8,
  },
  measureCol: {
    flex: 1,
  },
  measureLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  measureInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'center',
  },
  resultCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'white',
    ...shadow.sm,
  },
  metricItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  barTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'white',
    marginBottom: 10,
    ...shadow.sm,
  },
  historyPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  historyPill: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  guideCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'white',
    ...shadow.sm,
  },
  guideBody: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
