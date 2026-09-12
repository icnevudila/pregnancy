import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section, Progress } from './ui';
import { secondsLabel, uid, localDay } from './domain.mjs';
import { generatedAssets } from './generatedAssets';

// ─── EKRAN 22: EMZİRME & BİBERON SAYACI (NURSING & FEEDING TIMER) ─────────────
export function NursingTimerScreen({ state, update, toast }) {
  const [activeSide, setActiveSide] = useState(null); // 'left' | 'right' | null
  const [leftSecs, setLeftSecs] = useState(0);
  const [rightSecs, setRightSecs] = useState(0);
  const [bottleMl, setBottleMl] = useState(120);
  const [feedMode, setFeedMode] = useState('breast'); // 'breast' | 'bottle'
  const timerRef = useRef(null);

  useEffect(() => {
    if (activeSide === 'left') {
      timerRef.current = setInterval(() => setLeftSecs(s => s + 1), 1000);
    } else if (activeSide === 'right') {
      timerRef.current = setInterval(() => setRightSecs(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeSide]);

  function saveNursing() {
    setActiveSide(null);
    const totalMins = Math.max(1, Math.round((leftSecs + rightSecs) / 60));
    const sideText = leftSecs > 0 && rightSecs > 0 ? `Sol (${Math.round(leftSecs/60)} dk) + Sağ (${Math.round(rightSecs/60)} dk)` : leftSecs > 0 ? `Sol meme • ${totalMins} dk` : `Sağ meme • ${totalMins} dk`;
    
    update(old => ({
      records: [{
        id: uid(),
        type: 'Emzirme',
        value: sideText,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
      }, ...(old.records || [])],
    }));
    toast && toast(`🍼 Emzirme kaydedildi: ${totalMins} dakika`);
    setLeftSecs(0);
    setRightSecs(0);
  }

  function saveBottle() {
    update(old => ({
      records: [{
        id: uid(),
        type: 'Biberon',
        value: `${bottleMl} ml anne sütü/mama`,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
      }, ...(old.records || [])],
    }));
    toast && toast(`🍼 Biberon kaydedildi: ${bottleMl} ml`);
  }

  return (
    <View style={pbs.container}>
      {/* Sekmeler: Emzirme / Biberon */}
      <View style={pbs.segRow}>
        <Tap
          onPress={() => setFeedMode('breast')}
          label="Emzirme"
          style={[pbs.segBtn, feedMode === 'breast' && pbs.segBtnActive]}
        >
          <T bold={feedMode === 'breast'} style={[pbs.segText, feedMode === 'breast' && { color: 'white' }]}>
            🤱 Meme Emzirme
          </T>
        </Tap>
        <Tap
          onPress={() => setFeedMode('bottle')}
          label="Biberon"
          style={[pbs.segBtn, feedMode === 'bottle' && pbs.segBtnActive]}
        >
          <T bold={feedMode === 'bottle'} style={[pbs.segText, feedMode === 'bottle' && { color: 'white' }]}>
            🍼 Biberon (ml)
          </T>
        </Tap>
      </View>

      {feedMode === 'breast' ? (
        <>
          {/* Çift Dokunsal Meme Butonları (Sol / Sağ) */}
          <View style={pbs.dualBtnRow}>
            {/* Sol Meme */}
            <Tap
              onPress={() => setActiveSide(activeSide === 'left' ? null : 'left')}
              label="Sol meme sayacını başlat"
              style={[pbs.breastBtn, activeSide === 'left' && pbs.breastBtnActive]}
            >
              <LinearGradient
                colors={activeSide === 'left' ? ['#E8879E', '#CF5875'] : ['#FAF2F5', '#F5E6EC']}
                style={pbs.breastGrad}
              >
                <T bold style={[pbs.breastSideText, activeSide === 'left' && { color: 'white' }]}>SOL MEME</T>
                <T bold style={[pbs.breastTimerText, activeSide === 'left' && { color: 'white' }]}>
                  {secondsLabel(leftSecs)}
                </T>
                <T style={[pbs.breastStatusText, activeSide === 'left' && { color: '#FFEBF1' }]}>
                  {activeSide === 'left' ? 'Emziriliyor...' : 'Başlamak için dokun'}
                </T>
              </LinearGradient>
            </Tap>

            {/* Sağ Meme */}
            <Tap
              onPress={() => setActiveSide(activeSide === 'right' ? null : 'right')}
              label="Sağ meme sayacını başlat"
              style={[pbs.breastBtn, activeSide === 'right' && pbs.breastBtnActive]}
            >
              <LinearGradient
                colors={activeSide === 'right' ? ['#E8879E', '#CF5875'] : ['#FAF2F5', '#F5E6EC']}
                style={pbs.breastGrad}
              >
                <T bold style={[pbs.breastSideText, activeSide === 'right' && { color: 'white' }]}>SAĞ MEME</T>
                <T bold style={[pbs.breastTimerText, activeSide === 'right' && { color: 'white' }]}>
                  {secondsLabel(rightSecs)}
                </T>
                <T style={[pbs.breastStatusText, activeSide === 'right' && { color: '#FFEBF1' }]}>
                  {activeSide === 'right' ? 'Emziriliyor...' : 'Başlamak için dokun'}
                </T>
              </LinearGradient>
            </Tap>
          </View>

          {/* Seansı Kaydet Butonu */}
          {(leftSecs > 0 || rightSecs > 0) && (
            <Tap onPress={saveNursing} label="Emzirmeyi kaydet" style={pbs.saveBtn}>
              <T bold style={{ color: 'white', fontSize: 15 }}>Emzirmeyi Kaydet ({Math.round((leftSecs + rightSecs)/60)} dk)</T>
            </Tap>
          )}
        </>
      ) : (
        /* Biberon Takibi */
        <Card style={{ padding: 20, alignItems: 'center' }}>
          <T style={{ fontSize: 13, color: colors.muted }}>Verilen Süt / Mama Miktarı</T>
          <T bold style={{ fontSize: 36, color: colors.ink, marginVertical: 8 }}>{bottleMl} ml</T>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            {[60, 90, 120, 150, 180].map(amount => (
              <Tap
                key={amount}
                onPress={() => setBottleMl(amount)}
                label={`${amount} ml`}
                style={[pbs.mlPill, bottleMl === amount && pbs.mlPillActive]}
              >
                <T bold={bottleMl === amount} style={{ fontSize: 12, color: bottleMl === amount ? 'white' : colors.ink }}>
                  {amount}
                </T>
              </Tap>
            ))}
          </View>
          <Tap onPress={saveBottle} label="Biberonu kaydet" style={[pbs.saveBtn, { width: '100%', marginTop: 20 }]}>
            <T bold style={{ color: 'white', fontSize: 14 }}>Biberon Kaydını Ekle</T>
          </Tap>
        </Card>
      )}
    </View>
  );
}

// ─── EKRAN 23: BEBEK UYKU TAKİBİ & BEYAZ GÜRÜLTÜ (SLEEP & WHITE NOISE) ────────
export function SleepWhiteNoiseScreen({ state, update, toast }) {
  const [isAsleep, setIsAsleep] = useState(false);
  const [playingNoise, setPlayingNoise] = useState(null);

  const whiteNoises = [
    { id: 'womb', name: 'Anne Karnı Sesi', icon: 'heart', desc: 'Ritmik kan akışı & amniyon' },
    { id: 'hairdryer', name: 'Fön Makinesi', icon: 'milestone', desc: 'Klasik sakinleştirici uğultu' },
    { id: 'rain', name: 'Ilık Yağmur', icon: 'drop', desc: 'Dingin doğa sesi' },
    { id: 'vacuum', name: 'Süpürge Sesi', icon: 'bell', desc: 'Sürekli monoton frekans' },
  ];

  function toggleSleep() {
    const nextState = !isAsleep;
    setIsAsleep(nextState);
    update(old => ({
      records: [{
        id: uid(),
        type: 'Uyku',
        value: nextState ? 'Uykuya daldı' : 'Uyandı',
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
      }, ...(old.records || [])],
    }));
    toast && toast(nextState ? '💤 Bebek uykuya kaydedildi' : '☀️ Bebek uyandı');
  }

  return (
    <View style={pbs.container}>
      {/* Uyku Durumu Kartı */}
      <Card style={[pbs.sleepStatusCard, isAsleep && { backgroundColor: '#201A28' }]}>
        <LinearGradient
          colors={isAsleep ? ['#322542', '#1B1425'] : ['#FAF4FB', '#EDE2EE']}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ alignItems: 'center' }}>
          <T style={{ fontSize: 44 }}>{isAsleep ? '🌙' : '☀️'}</T>
          <T bold style={{ fontSize: 20, color: isAsleep ? 'white' : colors.ink, marginTop: 8 }}>
            {isAsleep ? 'Bebeğiniz Şu An Uykuda' : 'Bebeğiniz Uyanık'}
          </T>
          <T style={{ fontSize: 12, color: isAsleep ? '#C6B2D4' : colors.muted, marginTop: 4 }}>
            {isAsleep ? 'Sessiz ve huzurlu bir uyku diliyoruz...' : 'Uyanıklık penceresi: ~90 dakika'}
          </T>

          <Tap
            onPress={toggleSleep}
            label={isAsleep ? 'Uyandı olarak işaretle' : 'Uyudu olarak işaretle'}
            style={[pbs.sleepToggleBtn, isAsleep && { backgroundColor: '#8E6E9E' }]}
          >
            <T bold style={{ color: 'white', fontSize: 14 }}>
              {isAsleep ? '☀️ Bebek Uyandı' : '🌙 Uykuya Yattı'}
            </T>
          </Tap>
        </View>
      </Card>

      {/* Dâhili Beyaz Gürültü Çalar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Section title="Sakinleştirici Beyaz Gürültü" />
        {generatedAssets['ui_white_noise_headphones'] && (
          <Image source={generatedAssets['ui_white_noise_headphones']} style={{ width: 32, height: 32 }} resizeMode="contain" />
        )}
      </View>
      <View style={{ gap: 10 }}>
        {whiteNoises.map(n => {
          const isPlaying = playingNoise === n.id;
          return (
            <Card key={n.id} style={[pbs.noiseCard, isPlaying && pbs.noiseCardActive]}>
              <View style={[pbs.noiseIconBox, isPlaying && { backgroundColor: colors.purple }]}>
                <Icon name={n.icon} size={20} color={isPlaying ? 'white' : colors.purple} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <T bold style={{ fontSize: 14, color: isPlaying ? colors.purple : colors.ink }}>{n.name}</T>
                <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{n.desc}</T>
              </View>
              <Tap
                onPress={() => setPlayingNoise(isPlaying ? null : n.id)}
                label={isPlaying ? 'Durdur' : 'Çal'}
                style={[pbs.noisePlayBtn, isPlaying && { backgroundColor: '#E8D4E8' }]}
              >
                <T style={{ fontSize: 15 }}>{isPlaying ? '⏸️' : '▶️'}</T>
              </Tap>
            </Card>
          );
        })}
      </View>
    </View>
  );
}

// ─── EKRAN 24: BEZ DEĞİŞTİRME GÜNLÜĞÜ (DIAPER TRACKER) ───────────────────────
export function DiaperTrackerScreen({ update, toast }) {
  const [diaperType, setDiaperType] = useState('Islak');

  function saveDiaper(type) {
    update(old => ({
      records: [{
        id: uid(),
        type: 'Bez',
        value: `${type} bez`,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
      }, ...(old.records || [])],
    }));
    toast && toast(`✨ ${type} bez kaydedildi`);
  }

  return (
    <View style={pbs.container}>
      <Card style={{ padding: 16 }}>
        <T bold style={{ fontSize: 16 }}>Bez Değiştirme</T>
        <T style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
          Yenidoğanın yeterli beslenip beslenmediğini günde en az 5-6 ıslak bez gösterir.
        </T>
      </Card>

      {/* 3 Hızlı Dokunsal Seçici */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[
          { id: 'Islak', icon: '💧', label: 'Islak (Çiş)', tint: '#4896BC', bg: '#EDF6FA' },
          { id: 'Kirli', icon: '💩', label: 'Kirli (Kaka)', tint: '#8A6840', bg: '#F9F4EE' },
          { id: 'Karışık', icon: '🔄', label: 'Karışık', tint: '#6E4D84', bg: '#F6EFF8' },
        ].map(item => (
          <Tap
            key={item.id}
            onPress={() => saveDiaper(item.id)}
            label={item.label}
            style={[pbs.diaperBtn, { backgroundColor: item.bg }]}
          >
            <T style={{ fontSize: 32 }}>{item.icon}</T>
            <T bold style={{ fontSize: 13, color: item.tint, marginTop: 8 }}>{item.label}</T>
            <T style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>Kaydetmek için dokun</T>
          </Tap>
        ))}
      </View>
    </View>
  );
}

// ─── EKRAN 25: ANNE İYİLEŞME & LOHUSA RUH HALİ (POSTPARTUM SELF-CARE) ─────────
export function PostpartumSelfCareScreen({ state, update, toast }) {
  const [day] = useState(14);
  const epdsQuestions = [
    'Kendimi neşeli hissedebiliyorum',
    'Olaylara gülümseyerek bakabiliyorum',
    'Gereksiz yere kendimi suçlamıyorum',
    'Nedensiz yere kaygılanıp paniklemiyorum',
  ];

  return (
    <View style={pbs.container}>
      {/* Lohusalık Gün Sayacı & Sevgi Notu */}
      <Card style={pbs.recoveryCard}>
        <LinearGradient
          colors={['#846284', '#664766']}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={pbs.dayBadge}>
              <T bold style={{ color: colors.purple, fontSize: 11 }}>LOHUSALIK · {day}. GÜN</T>
            </View>
            <T bold style={{ color: 'white', fontSize: 18 }}>“Harika bir iş çıkarıyorsun anneciğim.”</T>
            <T style={{ color: '#E8D5E8', fontSize: 13, lineHeight: 19 }}>
              Mükemmel olmak zorunda değilsin; bebeğin için en güvenli liman senin sıcak kucağın. Kendine şefkat göster. 💜
            </T>
          </View>
          {generatedAssets['ui_postpartum_lotus'] && (
            <Image source={generatedAssets['ui_postpartum_lotus']} style={{ width: 75, height: 75 }} resizeMode="contain" />
          )}
        </View>
      </Card>

      {/* İyileşme Kontrolleri */}
      <Section title="Bugünkü İyileşme Adımların" />
      <Card style={{ padding: 14 }}>
        {[
          { title: 'Bol Su & Sıvı Alımı', desc: 'Süt üretimini ve doku iyileşmesini hızlandırır' },
          { title: 'Pelvik Taban & Kegel Egzersizi', desc: 'Hafif ve nazikçe kasları güçlendirme' },
          { title: 'Dinlenme & Uyku Aralığı', desc: 'Bebek uyuduğunda gözlerini dinlendir' },
        ].map((item, i) => (
          <View key={i} style={pbs.stepRow}>
            <View style={pbs.stepCheck}>
              <Icon name="check" size={12} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <T bold style={{ fontSize: 13 }}>{item.title}</T>
              <T style={{ fontSize: 11, color: colors.muted }}>{item.desc}</T>
            </View>
          </View>
        ))}
      </Card>
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
  saveBtn: { height: 50, borderRadius: 18, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center', marginTop: 10, ...shadow },
  mlPill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#EFE8EE' },
  mlPillActive: { backgroundColor: colors.purple },
  // Sleep styles
  sleepStatusCard: { padding: 24, borderRadius: 24, overflow: 'hidden' },
  sleepToggleBtn: { marginTop: 16, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 18, backgroundColor: '#4C3D5A' },
  noiseCard: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  noiseCardActive: { borderColor: colors.purple, backgroundColor: '#FAF6FA' },
  noiseIconBox: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EFE7EE', alignItems: 'center', justifyContent: 'center' },
  noisePlayBtn: { padding: 8, borderRadius: 12 },
  // Diaper styles
  diaperBtn: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#EDE2EE', ...shadow },
  // Recovery styles
  recoveryCard: { padding: 20, borderRadius: 22, overflow: 'hidden' },
  dayBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: '#FFFFFFDD', marginBottom: 6 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.line },
  stepCheck: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
});
