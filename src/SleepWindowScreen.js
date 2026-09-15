import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, ScreenHero, InfoNote, MetricCard } from './ui';

export const WAKE_WINDOW_TABLE = [
  { id: '0-1m', labelTr: '0 - 1 Ay', labelEn: '0 - 1 Month', minMins: 45, maxMins: 60, napsTr: '4-5 gündüz uykusu', napsEn: '4-5 naps', descTr: 'Yenidoğan çok çabuk yorulur. 45-60 dk uyanık kalması yeterlidir.' },
  { id: '2m', labelTr: '2 Ay', labelEn: '2 Months', minMins: 60, maxMins: 90, napsTr: '4 gündüz uykusu', napsEn: '4 naps', descTr: 'Göz teması artar. 60-90 dk sonrası aşırı uyarılmaya dikkat edilmeli.' },
  { id: '3m', labelTr: '3 Ay', labelEn: '3 Months', minMins: 75, maxMins: 100, napsTr: '3-4 gündüz uykusu', napsEn: '3-4 naps', descTr: 'Sirkadiyen ritim oluşmaya başlar. Gece uykusu hafifçe uzar.' },
  { id: '4m', labelTr: '4 Ay (Kritik Dönem)', labelEn: '4 Months (Regression)', minMins: 90, maxMins: 120, napsTr: '3-4 gündüz uykusu', napsEn: '3-4 naps', descTr: '4. ay uyku gerilemesi yaşanabilir. Uyku döngüleri yetişkin benzeri faza geçer.' },
  { id: '5-6m', labelTr: '5 - 6 Ay', labelEn: '5 - 6 Months', minMins: 120, maxMins: 150, napsTr: '3 gündüz uykusu', napsEn: '3 naps', descTr: '2 - 2.5 saatlik uyanıklık pencereleri idealdir. Akşam uykusu erkene çekilebilir.' },
  { id: '7-9m', labelTr: '7 - 9 Ay', labelEn: '7 - 9 Months', minMins: 150, maxMins: 210, napsTr: '2 gündüz uykusu', napsEn: '2 naps', descTr: '2 uykuya geçiş dönemi. Sabah ve öğleden sonra uykusu oturur.' },
  { id: '10-12m', labelTr: '10 - 12 Ay', labelEn: '10 - 12 Months', minMins: 180, maxMins: 240, napsTr: '2 gündüz uykusu', napsEn: '2 naps', descTr: '3 - 4 saat uyanık kalabilir. Ayaklanma ve emekleme yorgunluğu artırır.' },
  { id: '13-18m', labelTr: '13 - 18 Ay', labelEn: '13 - 18 Months', minMins: 240, maxMins: 300, napsTr: '1-2 gündüz uykusu', napsEn: '1-2 naps', descTr: 'Tek uykuya geçiş denemeleri. 4 - 5 saatlik uyanıklık penceresi.' },
  { id: '19-24m', labelTr: '19 - 24 Ay', labelEn: '19 - 24 Months', minMins: 300, maxMins: 360, napsTr: '1 öğle uykusu', napsEn: '1 nap', descTr: 'Günde tek bir 1.5 - 2.5 saatlik kaliteli öğle uykusu yeterlidir.' },
];

export function SleepWindowScreen({ state, update, toast, close, open, lang: propLang }) {
  const lang = propLang || state?.lang || 'tr';
  const isEn = lang === 'en';

  const [selectedAge, setSelectedAge] = useState('4m');
  const [wakeHour, setWakeHour] = useState(() => {
    const d = new Date();
    return d.getHours();
  });
  const [wakeMinute, setWakeMinute] = useState(() => {
    const d = new Date();
    return Math.floor(d.getMinutes() / 5) * 5;
  });
  const [ritualChecked, setRitualChecked] = useState([false, false, false, false]);

  const ageData = useMemo(() => {
    return WAKE_WINDOW_TABLE.find(w => w.id === selectedAge) || WAKE_WINDOW_TABLE[3];
  }, [selectedAge]);

  // Calculate SweetSpot time and remaining minutes
  const calculation = useMemo(() => {
    const now = new Date();
    const wakeDate = new Date();
    wakeDate.setHours(wakeHour, wakeMinute, 0, 0);

    // If wake time is set in future for today, treat as earlier today or past
    if (wakeDate.getTime() > now.getTime() + 10 * 60 * 1000) {
      wakeDate.setDate(wakeDate.getDate() - 1);
    }

    const avgWindowMins = Math.round((ageData.minMins + ageData.maxMins) / 2);
    const targetNapDate = new Date(wakeDate.getTime() + avgWindowMins * 60 * 1000);
    const earliestNapDate = new Date(wakeDate.getTime() + ageData.minMins * 60 * 1000);
    const latestNapDate = new Date(wakeDate.getTime() + ageData.maxMins * 60 * 1000);

    const diffMins = Math.round((targetNapDate.getTime() - now.getTime()) / (60 * 1000));

    const formatTime = (d) => d.toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' });

    let status = 'good';
    let statusText = '';

    if (diffMins > 20) {
      status = 'awake';
      statusText = isEn
        ? `Baby is in active play phase. Next nap in ${diffMins} mins.`
        : `Bebeğiniz aktif uyanıklık evresinde. Uykuya ${diffMins} dakika var.`;
    } else if (diffMins >= -10 && diffMins <= 20) {
      status = 'sweetspot';
      statusText = isEn
        ? `✨ SWEETSPOT ACTIVE! Begin wind-down ritual now for easiest sleep.`
        : `✨ SWEETSPOT VAKTİ! Kolay uykuya dalış için odaya geçip rutini başlatın.`;
    } else {
      status = 'overtired';
      statusText = isEn
        ? `⚠️ Potential overtiredness (${Math.abs(diffMins)}m past optimal). Soothe gently with white noise.`
        : `⚠️ Aşırı yorgunluk eşiği geçildi (${Math.abs(diffMins)} dk gecikme). Loş ışık ve beyaz gürültü ile sakinleştirin.`;
    }

    return {
      sweetSpotTime: formatTime(targetNapDate),
      earliestTime: formatTime(earliestNapDate),
      latestTime: formatTime(latestNapDate),
      diffMins,
      status,
      statusText,
    };
  }, [wakeHour, wakeMinute, ageData, isEn]);

  const setWakeTimeToNow = () => {
    const d = new Date();
    setWakeHour(d.getHours());
    setWakeMinute(Math.floor(d.getMinutes() / 5) * 5);
    toast && toast(isEn ? 'Wake time set to now ☀️' : 'Uyanma saati şimdi olarak ayarlandı ☀️');
  };

  const toggleRitual = (idx) => {
    const updated = [...ritualChecked];
    updated[idx] = !updated[idx];
    setRitualChecked(updated);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHero
        title={isEn ? 'Sleep Window & SweetSpot™' : 'Akıllı Uyku Penceresi (SweetSpot)'}
        subtitle={isEn ? 'Age-indexed wake windows to prevent overtiredness & crying' : 'Aşırı yorgunluğu ve ağlama krizlerini önleyen uyanıklık ve uyku tahmin motoru'}
        coverAsset="card_sleep_window"
      />

      {/* Subtle Clinical Footnote */}
      <View style={styles.medicalFootnote}>
        <Icon name="check" size={12} color="#8A7A90" />
        <T style={styles.medicalFootnoteText}>
          {isEn
            ? 'Wake windows and SweetSpot estimates are pediatric hygiene averages. Always follow safe sleep guidelines (back to sleep, clear crib).'
            : 'Uyanıklık ve uyku tahminleri genel ortalamalardır. Daima güvenli uyku kurallarına (sırtüstü yatırma, boş ve sert beşik) uyunuz.'}
        </T>
      </View>

      {/* SweetSpot Target Banner */}
      <Card style={[styles.sweetSpotCard, calculation.status === 'overtired' && styles.sweetSpotOvertired]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={styles.moonIconWrap}>
              <Icon name="moon" size={20} color={colors.purple} />
            </View>
            <View>
              <T style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                {isEn ? 'Optimal Nap Time (SweetSpot™)' : 'Hedeflenen Uyku Vakti (SweetSpot)'}
              </T>
              <T bold style={{ fontSize: 28, color: colors.ink }}>
                {calculation.sweetSpotTime}
              </T>
            </View>
          </View>

          <View style={[styles.statusBadge, calculation.status === 'sweetspot' ? styles.statusBadgeGreen : calculation.status === 'overtired' ? styles.statusBadgeRed : styles.statusBadgeBlue]}>
            <T bold style={[styles.statusBadgeText, calculation.status === 'sweetspot' ? { color: '#027A48' } : calculation.status === 'overtired' ? { color: '#B42318' } : { color: '#175CD3' }]}>
              {calculation.diffMins > 0 ? `${calculation.diffMins} dk kaldı` : `${Math.abs(calculation.diffMins)} dk geçti`}
            </T>
          </View>
        </View>

        <T style={styles.sweetSpotDesc}>{calculation.statusText}</T>

        <View style={styles.windowRangeRow}>
          <T style={{ fontSize: 11.5, color: '#6A5675' }}>
            {isEn ? `Safe window: ${calculation.earliestTime} – ${calculation.latestTime}` : `Güvenli aralık: ${calculation.earliestTime} – ${calculation.latestTime}`}
          </T>
          <T bold style={{ fontSize: 11.5, color: colors.purple }}>
            {ageData.minMins}-{ageData.maxMins} dk
          </T>
        </View>
      </Card>

      {/* 1. Baby Age Selector */}
      <Card style={{ padding: 16, gap: 10 }}>
        <T bold style={{ fontSize: 13.5, color: colors.ink }}>
          {isEn ? '1. Select Baby Age' : '1. Bebeğin Yaşını Seçin'}
        </T>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {WAKE_WINDOW_TABLE.map(item => (
            <Tap
              key={item.id}
              onPress={() => setSelectedAge(item.id)}
              style={[styles.agePill, selectedAge === item.id && styles.agePillActive]}
            >
              <T bold={selectedAge === item.id} style={{ fontSize: 11.5, color: selectedAge === item.id ? '#FFFFFF' : colors.ink }}>
                {isEn ? item.labelEn : item.labelTr}
              </T>
            </Tap>
          ))}
        </ScrollView>
        <T style={{ fontSize: 11.5, color: colors.muted, lineHeight: 16 }}>
          💡 {isEn ? ageData.descTr : ageData.descTr} ({isEn ? ageData.napsEn : ageData.napsTr})
        </T>
      </Card>

      {/* 2. Last Wake-Up Time */}
      <Card style={{ padding: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T bold style={{ fontSize: 13.5, color: colors.ink }}>
            {isEn ? '2. Last Wake-Up Time' : '2. Son Uyanma Saati'}
          </T>
          <Tap onPress={setWakeTimeToNow} style={styles.nowBtn}>
            <T bold style={{ fontSize: 11, color: colors.purple }}>{isEn ? 'Set to Now ☀️' : 'Şimdi Uyandı ☀️'}</T>
          </Tap>
        </View>

        <View style={styles.timeSelectorBox}>
          {/* Hour Controls */}
          <View style={styles.timeCol}>
            <T style={styles.timeColLabel}>{isEn ? 'Hour' : 'Saat'}</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Tap onPress={() => setWakeHour(h => (h === 0 ? 23 : h - 1))} style={styles.timeAdjustBtn}>
                <T bold style={styles.timeAdjustText}>-</T>
              </Tap>
              <T bold style={styles.timeValText}>{String(wakeHour).padStart(2, '0')}</T>
              <Tap onPress={() => setWakeHour(h => (h === 23 ? 0 : h + 1))} style={styles.timeAdjustBtn}>
                <T bold style={styles.timeAdjustText}>+</T>
              </Tap>
            </View>
          </View>

          <T bold style={{ fontSize: 24, color: '#9883A3' }}>:</T>

          {/* Minute Controls */}
          <View style={styles.timeCol}>
            <T style={styles.timeColLabel}>{isEn ? 'Minute' : 'Dakika'}</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Tap onPress={() => setWakeMinute(m => (m <= 0 ? 55 : m - 5))} style={styles.timeAdjustBtn}>
                <T bold style={styles.timeAdjustText}>-</T>
              </Tap>
              <T bold style={styles.timeValText}>{String(wakeMinute).padStart(2, '0')}</T>
              <Tap onPress={() => setWakeMinute(m => (m >= 55 ? 0 : m + 5))} style={styles.timeAdjustBtn}>
                <T bold style={styles.timeAdjustText}>+</T>
              </Tap>
            </View>
          </View>
        </View>
      </Card>

      {/* 3. Pre-Sleep Wind-Down Ritual (15-Minute Checklist) */}
      <Card style={{ padding: 16, gap: 10 }}>
        <T bold style={{ fontSize: 13.5, color: colors.ink }}>
          {isEn ? '3. 15-Min Wind-Down Ritual Checklist' : '3. 15 Dakikalık Sakinleşme Rutini'}
        </T>
        <T style={{ fontSize: 11.5, color: colors.muted }}>
          {isEn ? 'Consistent pre-nap cues help baby transition smoothly into deep sleep:' : 'Uyku öncesi tutarlı işaretler bebeğin derin uykuya sakin geçmesini sağlar:'}
        </T>

        {[
          { icon: '💡', tr: 'Işıkları loşlaştırın & perdeleri kapatın', en: 'Dim lights & draw blackout curtains' },
          { icon: '🩲', tr: 'Bezi kontrol edin & uyku tulumunu giydirin', en: 'Check diaper & put on cozy sleep sack' },
          { icon: '🔊', tr: 'Beyaz gürültü veya anne karnı sesini açın', en: 'Turn on soothing white noise / womb rhythm' },
          { icon: '📖', tr: 'Kucakta ninni fısıldayın veya kısa masaj yapın', en: 'Sing gentle lullaby or gentle back stroke' },
        ].map((item, idx) => {
          const checked = ritualChecked[idx];
          return (
            <Tap
              key={idx}
              onPress={() => toggleRitual(idx)}
              style={[styles.ritualRow, checked && styles.ritualRowChecked]}
            >
              <View style={[styles.checkCircle, checked && styles.checkCircleChecked]}>
                {checked && <Icon name="check" size={10} color="#FFFFFF" />}
              </View>
              <T style={{ fontSize: 16 }}>{item.icon}</T>
              <T style={[styles.ritualText, checked && styles.ritualTextChecked]}>
                {isEn ? item.en : item.tr}
              </T>
            </Tap>
          );
        })}

        {/* Shortcut to Momora White Noise player */}
        <Tap
          onPress={() => open && open('sleepWhiteNoise')}
          style={styles.whiteNoiseShortcut}
        >
          <Icon name="music" size={16} color={colors.purple} />
          <T bold style={{ color: colors.purple, fontSize: 13 }}>
            {isEn ? 'Open White Noise & Soothing Sound Player 🎧' : 'Beyaz Gürültü & Ninni Çaları Aç 🎧'}
          </T>
        </Tap>
      </Card>

      {/* 4. Overtiredness Signals */}
      <InfoNote
        title={isEn ? 'Overtired vs. Sleepy Signals' : 'Aşırı Yorgunluk ve Uyku İşaretleri'}
        text={isEn
          ? 'Sleepy cues (Ideal time): Staring into space, slower movements, quietness. Overtired cues (Too late): Eye rubbing, crying, arching back, frantic waving. Try to catch the sleepy phase!'
          : 'Uykusu gelen bebek (İdeal an): Boşluğa dalma, hareketlerde yavaşlama, sakinleşme. Aşırı yorulan bebek (Geç kalındı): Göz ovuşturma, huysuz ağlama, sırtını geriye yay gibi germe. İdeal anı yakalamaya özen gösterin.'}
        tone="neutral"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  sweetSpotCard: {
    padding: 16,
    gap: 12,
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D8FD',
  },
  sweetSpotOvertired: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FED7D7',
  },
  moonIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeGreen: { backgroundColor: '#ECFDF3' },
  statusBadgeRed: { backgroundColor: '#FEF3F2' },
  statusBadgeBlue: { backgroundColor: '#EFF8FF' },
  statusBadgeText: { fontSize: 11.5 },
  sweetSpotDesc: {
    fontSize: 12.5,
    color: '#49364F',
    lineHeight: 17,
  },
  windowRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#EFE5F5',
  },
  agePill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FAF5FA',
    borderWidth: 1,
    borderColor: '#E8DCEB',
  },
  agePillActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  nowBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F3EAF4',
  },
  timeSelectorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#FAF6FA',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EBDDEE',
  },
  timeCol: {
    alignItems: 'center',
    gap: 4,
  },
  timeColLabel: {
    fontSize: 10.5,
    color: colors.muted,
  },
  medicalFootnote: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F9F6FA',
    borderWidth: 1,
    borderColor: '#EFE7F2',
  },
  medicalFootnoteText: {
    fontSize: 11,
    color: '#8A7A90',
    lineHeight: 15,
    textAlign: 'center',
    flex: 1,
  },
  timeAdjustBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2D3E5',
    ...shadow,
  },
  timeAdjustText: {
    fontSize: 18,
    color: colors.purple,
  },
  timeValText: {
    fontSize: 26,
    color: colors.ink,
    minWidth: 36,
    textAlign: 'center',
  },
  ritualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FAF7FA',
    borderWidth: 1,
    borderColor: '#EFE6F1',
  },
  ritualRowChecked: {
    backgroundColor: '#F3EAF4',
    borderColor: colors.purple,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#A394A8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleChecked: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  ritualText: {
    flex: 1,
    fontSize: 12,
    color: colors.ink,
  },
  ritualTextChecked: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  whiteNoiseShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5ECF6',
    marginTop: 4,
  },
});
