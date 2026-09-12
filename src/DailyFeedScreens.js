import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section, Progress, ScreenHero } from './ui';
import { generatedAssets } from './generatedAssets';
import { babyLettersData, getBabyLetterForWeek, getPastBabyLetters } from './babyLettersData';

// ─── EKRAN 17: BEBEĞİN GÜNLÜK MEKTUBU & MEKTUP ARŞİVİ ───────────────────────
export function DailyBabyLetterScreen({ state, toast }) {
  const [tab, setTab] = useState('current');
  const currentWeek = state?.week || 16;
  const currentLetter = getBabyLetterForWeek(currentWeek);
  const archiveLetters = getPastBabyLetters(currentWeek);

  return (
    <View style={ds.container}>
      <ScreenHero kicker="GÜNLÜK BAĞ" title={`${currentWeek}. hafta mektubu`} body="Bebeğinin haftalık gelişimini daha duygusal, paylaşılabilir ve sakin bir dille sakla." icon="send" asset="ui_baby_letter_envelope" stat={`${archiveLetters.length} arşiv`} tint={colors.purple} />

      {/* Sekmeler: Bugünün Mektubu / Mektup Arşivi */}
      <View style={ds.segRow}>
        <Tap
          onPress={() => setTab('current')}
          label="Günün mektubu"
          style={[ds.segBtn, tab === 'current' && ds.segBtnActive]}
        >
          <T bold={tab === 'current'} style={[ds.segText, tab === 'current' && { color: 'white' }]}>
            💌 Bugünün Mektubu
          </T>
        </Tap>
        <Tap
          onPress={() => setTab('archive')}
          label="Mektup arşivi"
          style={[ds.segBtn, tab === 'archive' && ds.segBtnActive]}
        >
          <T bold={tab === 'archive'} style={[ds.segText, tab === 'archive' && { color: 'white' }]}>
            📖 Mektup Arşivi ({archiveLetters.length})
          </T>
        </Tap>
      </View>

      {tab === 'current' ? (
        <>
          {/* Mektup Kağıdı Kartı */}
          <Card style={ds.letterCard}>
            <View style={ds.letterHeader}>
              <View style={ds.letterSeal}>
                {generatedAssets['ui_baby_letter_envelope'] ? (
                  <Image source={generatedAssets['ui_baby_letter_envelope']} style={{ width: 36, height: 36 }} resizeMode="contain" />
                ) : (
                  <T style={{ fontSize: 18 }}>💌</T>
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <T bold style={{ fontSize: 12, color: colors.purple }}>
                  MEKTUP #{currentLetter.letterNum} · {currentLetter.title}
                </T>
                <T style={{ fontSize: 11, color: colors.muted }}>{currentLetter.dayText || currentLetter.day}</T>
              </View>
            </View>

            <View style={ds.letterBody}>
              <T style={ds.letterText}>{currentLetter.text}</T>
              {currentLetter.milestone ? (
                <View style={{ marginTop: 12, backgroundColor: '#FAF2EE', padding: 8, borderRadius: 10 }}>
                  <T style={{ fontSize: 11, color: '#8F583D' }}>🌱 Gelişim Notu: {currentLetter.milestone}</T>
                </View>
              ) : null}
            </View>

            <View style={ds.letterFooter}>
              <T style={ds.letterSign}>Seni çok seven bebeğin 💛</T>
            </View>
          </Card>

          {/* Paylaş Butonları */}
          <Tap
            onPress={() => toast && toast('Mektup eşinle paylaşıldı! 🌸')}
            label="Mektubu eşime gönder"
            style={ds.shareBtn}
          >
            <LinearGradient
              colors={['#9D7D9D', '#845D84']}
              style={ds.shareBtnGrad}
            >
              <Icon name="heart" size={18} color="white" fill="white" />
              <T bold style={{ color: 'white', fontSize: 14 }}>Bu Mektubu Eşime Gönder</T>
            </LinearGradient>
          </Tap>
        </>
      ) : (
        /* Mektup Arşivi */
        <View style={{ gap: 10 }}>
          {archiveLetters.map(l => (
            <Card key={l.week || l.letterNum} style={{ padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <T bold style={{ fontSize: 13, color: colors.purple }}>{l.title || `Mektup #${l.letterNum}`}</T>
                <T style={{ fontSize: 11, color: colors.muted }}>{l.date}</T>
              </View>
              <T style={{ fontSize: 13, color: '#453D4E', marginTop: 8, lineHeight: 20 }}>
                {l.text}
              </T>
              {l.milestone ? (
                <T style={{ fontSize: 11, color: '#9A779A', marginTop: 6 }}>
                  ✨ {l.milestone}
                </T>
              ) : null}
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── EKRAN 18: GÜNLÜK ZAMAN TÜNELİ (TIMELINE FEED) ────────────────────────────
export function DailyTimelineFeed() {
  const [selectedDay, setSelectedDay] = useState('bugun');

  const days = [
    { id: 'dun', label: 'Dün', date: '11 Eylül' },
    { id: 'bugun', label: 'Bugün', date: '12 Eylül' },
    { id: 'yarin', label: 'Yarın', date: '13 Eylül' },
  ];

  const content = {
    dun: {
      baby: 'Bebeğinizin parmak uçlarında minik dokunma reseptörleri aktifleşti.',
      mom: 'Bel bölgenizde hafif tatlı bir ağırlık hissi oluşmuş olabilir.',
      tip: 'Akşam 20 dakikalık hafif tempolu temiz hava yürüyüşü uyku kalitenizi artırır.',
    },
    bugun: {
      baby: 'Bugün ilk hıçkırık refleksleri başlayabilir; bu durum diyafram kaslarını doğuma hazırlar!',
      mom: 'Kan hacminiz %40 arttı; hafif burun tıkanıklığı bu dönemde çok yaygındır.',
      tip: 'Magnezyum ve kalsiyum açısından zengin besinleri not etmek, randevuda beslenme düzenini konuşmayı kolaylaştırır.',
    },
    yarin: {
      baby: 'Yüz mimik kasları gülümseme ve kaş çatma hareketlerini denemeye devam ediyor.',
      mom: 'Enerjiniz yüksek seyredebilir; bebek odası planlamaları için harika bir gün.',
      tip: 'Günün sonunda ayaklarınızı bir yastıkla yukarı kaldırarak dinlendirmeyi unutmayın.',
    },
  };

  const c = content[selectedDay];

  return (
    <View style={ds.container}>
      <ScreenHero kicker="GÜNLÜK AKIŞ" title="Bugünün ritmi" body="Bebek, beden ve bakım notlarını tek sırada oku; gün içinde nerede olduğunu hızlıca hatırla." icon="calendar" asset="ui_timeline_sun_moon" stat={selectedDay === 'bugun' ? 'bugün' : selectedDay} tint={colors.purple} />

      {/* Gün Seçici */}
      <View style={ds.segRow}>
        {days.map(d => (
          <Tap
            key={d.id}
            label={d.label}
            onPress={() => setSelectedDay(d.id)}
            style={[ds.segBtn, selectedDay === d.id && ds.segBtnActive]}
          >
            <T bold={selectedDay === d.id} style={[ds.segText, selectedDay === d.id && { color: 'white' }]}>
              {d.label}
            </T>
            <T style={{ fontSize: 9, color: selectedDay === d.id ? '#EDE2EF' : colors.muted, marginTop: 1 }}>
              {d.date}
            </T>
          </Tap>
        ))}
      </View>

      {/* Akış Kartları */}
      <Card style={ds.feedCard}>
        <View style={ds.feedIconRow}>
          <View style={[ds.feedBadge, { backgroundColor: '#F3EBF5' }]}>
            <T style={{ fontSize: 16 }}>🍼</T>
          </View>
          <T bold style={{ fontSize: 15, color: colors.ink }}>Bebeğin Gelişimi</T>
        </View>
        <T style={ds.feedText}>{c.baby}</T>
      </Card>

      <Card style={ds.feedCard}>
        <View style={ds.feedIconRow}>
          <View style={[ds.feedBadge, { backgroundColor: '#FDF1F3' }]}>
            <T style={{ fontSize: 16 }}>💜</T>
          </View>
          <T bold style={{ fontSize: 15, color: colors.ink }}>Bedenindeki Değişim</T>
        </View>
        <T style={ds.feedText}>{c.mom}</T>
      </Card>

      <Card style={[ds.feedCard, { backgroundColor: '#F7FAF7', borderColor: '#E0EDE2' }]}>
        <View style={ds.feedIconRow}>
          <View style={[ds.feedBadge, { backgroundColor: '#E4F0E6' }]}>
            <T style={{ fontSize: 16 }}>🌿</T>
          </View>
          <T bold style={{ fontSize: 15, color: '#2C573A' }}>Günün İpucu Notu</T>
        </View>
        <T style={[ds.feedText, { color: '#3A5C44' }]}>{c.tip}</T>
      </Card>
    </View>
  );
}

// ─── EKRAN 19: SU & VİTAMİN DETAY MODALI ─────────────────────────────────────
export function WaterVitaminQuickModal({ state, update, toast }) {
  const waterGlasses = state.water || 0;
  const vitamins = state.vitaminsList || [
    { id: 'v1', name: 'Prenatal Multivitamin', done: state.vitamin || false },
    { id: 'v2', name: 'Omega-3 (DHA)', done: false },
    { id: 'v3', name: 'Demir & Folik Asit', done: false },
  ];

  function toggleVit(id) {
    const updated = vitamins.map(v => v.id === id ? { ...v, done: !v.done } : v);
    update({ vitaminsList: updated, vitamin: updated.some(v => v.done) });
    toast && toast('Vitamin durumu güncellendi');
  }

  function addWater() {
    update(old => ({ water: Math.min(12, (old.water || 0) + 1) }));
  }

  function removeWater() {
    update(old => ({ water: Math.max(0, (old.water || 0) - 1) }));
  }

  const liters = (waterGlasses * 0.25).toFixed(2);

  return (
    <View style={ds.container}>
      <ScreenHero kicker="GÜNLÜK BAKIM" title="Su ve vitamin düzeni" body="Günlük küçük bakım kayıtlarını sade tut; ana akışta neyin tamamlandığını hızlı gör." icon="drop" asset="card_water" stat={`${waterGlasses}/8 bardak`} tint="#589FB8" />

      {/* Su Takip Kartı */}
      <Card style={ds.waterCard}>
        <View style={{ alignItems: 'center' }}>
          <View style={ds.waterGlassBox}>
            <LinearGradient
              colors={['#8FC5DC', '#589FB8']}
              style={[ds.waterLevel, { height: `${Math.min(100, (waterGlasses / 8) * 100)}%` }]}
            />
            <T style={{ fontSize: 32, zIndex: 1 }}>💧</T>
          </View>
          <T bold style={{ fontSize: 26, color: colors.ink, marginTop: 10 }}>
            {liters} <T style={{ fontSize: 15, color: colors.muted }}>/ 2.0 Litre</T>
          </T>
          <T style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
            {waterGlasses} / 8 Bardak Tamamlandı
          </T>

          <View style={ds.waterControls}>
            <Tap onPress={removeWater} label="1 bardak eksilt" style={ds.waterCtrlBtn}>
              <T bold style={{ fontSize: 18, color: colors.purple }}>-</T>
            </Tap>
            <Tap onPress={addWater} label="1 bardak ekle" style={[ds.waterCtrlBtn, { backgroundColor: colors.purple }]}>
              <T bold style={{ fontSize: 18, color: 'white' }}>+ 1 Bardak</T>
            </Tap>
          </View>
        </View>
      </Card>

      {/* Günlük Takviyeler */}
      <Section title="Günlük Vitamin & Takviyeler" />
      <View style={{ gap: 8 }}>
        {vitamins.map(v => (
          <Tap
            key={v.id}
            onPress={() => toggleVit(v.id)}
            label={v.name}
            style={[ds.vitItem, v.done && ds.vitItemDone]}
          >
            <View style={[ds.vitCheck, v.done && ds.vitCheckDone]}>
              {v.done && <Icon name="check" size={14} color="white" />}
            </View>
            <T bold style={[ds.vitText, v.done && { textDecorationLine: 'line-through', color: colors.muted }]}>
              {v.name}
            </T>
          </Tap>
        ))}
      </View>
    </View>
  );
}

const ds = StyleSheet.create({
  container: { gap: 14, paddingBottom: 20 },
  segRow: { flexDirection: 'row', gap: 8, backgroundColor: '#EFE7EE', padding: 4, borderRadius: 20 },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  segBtnActive: { backgroundColor: colors.purple },
  segText: { fontSize: 12 },
  letterCard: { padding: 20, backgroundColor: '#FFFCF8', borderWidth: 1.5, borderColor: '#F0E2DE', borderRadius: 22, ...shadow },
  letterHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: 14, borderBottomWidth: 1, borderColor: '#F3E9E7' },
  letterSeal: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F7E7EB', alignItems: 'center', justifyContent: 'center' },
  letterBody: { paddingVertical: 14 },
  letterText: { fontSize: 15, lineHeight: 26, color: '#4E3A4A', fontFamily: fonts.regular },
  letterFooter: { alignItems: 'flex-end', paddingTop: 10 },
  letterSign: { fontSize: 13, color: '#916B89', fontFamily: fonts.script },
  shareBtn: { height: 50, borderRadius: 18, overflow: 'hidden', ...shadow },
  shareBtnGrad: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  // Feed styles
  feedCard: { padding: 16 },
  feedIconRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  feedBadge: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  feedText: { fontSize: 14, lineHeight: 22, color: '#524B5A' },
  // Water styles
  waterCard: { padding: 20 },
  waterGlassBox: { width: 70, height: 90, borderRadius: 16, borderWidth: 2, borderColor: '#86B5CA', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F7FB' },
  waterLevel: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  waterControls: { flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' },
  waterCtrlBtn: { flex: 1, height: 44, borderRadius: 16, backgroundColor: '#E8F2F7', alignItems: 'center', justifyContent: 'center' },
  vitItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: '#FFFDFA', borderWidth: 1, borderColor: '#EFE7EE', ...shadow },
  vitItemDone: { backgroundColor: '#FBF8FA', opacity: 0.8 },
  vitCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#C8BAC9', alignItems: 'center', justifyContent: 'center' },
  vitCheckDone: { backgroundColor: colors.sage, borderColor: colors.sage },
  vitText: { fontSize: 14, color: colors.ink },
});
