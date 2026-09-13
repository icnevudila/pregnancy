import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section, Progress, ScreenHero, MetricCard, StatusCard, ProgressRing, ToolExperienceCard } from './ui';
import { secondsLabel, uid, localDay } from './domain.mjs';
import { generatedAssets } from './generatedAssets';
import { playSound, stopSound, setVolume as setEngineVolume, getCurrentSound, addSoundListener } from './soundEngine';

// ─── EKRAN 22: EMZİRME & BİBERON SAYACI (NURSING & FEEDING TIMER) ─────────────
export function NursingTimerScreen({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [activeSide, setActiveSide] = useState(null); // 'left' | 'right' | null
  const [lastSide, setLastSide] = useState(state.lastNursingSide || (isEn ? 'Left Breast' : 'Sol Meme'));
  const [leftSecs, setLeftSecs] = useState(0);
  const [rightSecs, setRightSecs] = useState(0);
  const [bottleMl, setBottleMl] = useState(120);
  const [bottleType, setBottleType] = useState('Anne Sütü'); // 'Anne Sütü' | 'Formül Mama'
  const [pumpMl, setPumpMl] = useState(80);
  const [feedMode, setFeedMode] = useState('breast'); // 'breast' | 'bottle' | 'pump'
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
    const chosenSide = rightSecs > leftSecs ? (isEn ? 'Right Breast' : 'Sağ Meme') : (isEn ? 'Left Breast' : 'Sol Meme');
    setActiveSide(null);
    setLastSide(chosenSide);
    const totalMins = Math.max(1, Math.round((leftSecs + rightSecs) / 60));
    const sideText = leftSecs > 0 && rightSecs > 0
      ? (isEn ? `Left ${Math.round(leftSecs / 60)} min + Right ${Math.round(rightSecs / 60)} min` : `Sol ${Math.round(leftSecs / 60)} dk + Sağ ${Math.round(rightSecs / 60)} dk`)
      : leftSecs > 0
      ? (isEn ? `Left breast • ${totalMins} min` : `Sol meme • ${totalMins} dk`)
      : (isEn ? `Right breast • ${totalMins} min` : `Sağ meme • ${totalMins} dk`);

    update(old => ({
      lastNursingSide: chosenSide,
      records: [{
        id: uid(),
        type: 'Emzirme',
        value: sideText,
        time: new Date().toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
      }, ...(old.records || [])],
    }));
    toast && toast(isEn ? `🍼 Nursing logged: ${totalMins} minutes` : `🍼 Emzirme kaydedildi: ${totalMins} dakika`);
    setLeftSecs(0);
    setRightSecs(0);
  }

  function saveBottle() {
    const bottleTypeDisplay = (bottleType === 'Anne Sütü' && isEn) ? 'Breast Milk' : (bottleType === 'Formül Mama' && isEn) ? 'Formula' : bottleType;
    update(old => ({
      records: [{
        id: uid(),
        type: 'Biberon',
        value: `${bottleMl} ml ${bottleTypeDisplay}`,
        time: new Date().toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
      }, ...(old.records || [])],
    }));
    toast && toast(isEn ? `🍼 Bottle logged: ${bottleMl} ml (${bottleTypeDisplay})` : `🍼 Biberon kaydedildi: ${bottleMl} ml (${bottleType})`);
  }

  function savePump() {
    update(old => ({
      records: [{
        id: uid(),
        type: 'Süt Sağma',
        value: isEn ? `${pumpMl} ml breast milk expressed` : `${pumpMl} ml anne sütü sağıldı`,
        time: new Date().toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
      }, ...(old.records || [])],
    }));
    toast && toast(isEn ? `✨ Pumping logged: ${pumpMl} ml` : `✨ Süt sağma kaydedildi: ${pumpMl} ml`);
  }

  const records = state.records || [];
  const feedRecordsToday = records.filter(r => r.type === 'Emzirme' || r.type === 'Biberon');
  const lastFeed = feedRecordsToday[0];

  return (
    <View style={pbs.container}>
      <ScreenHero
        kicker={isEn ? 'FEEDING RHYTHM' : 'BESLENME RİTMİ'}
        title={isEn ? 'Nursing, Bottle and Pumping' : 'Emzirme, Biberon ve Sağma'}
        body={isEn ? 'Track feeding sessions with duration, side, and milliliter precision in one place.' : 'Beslenme seanslarını süre, taraf ve mililitre hassasiyetiyle tek noktadan takip et.'}
        icon="nursing"
        asset={feedMode === 'pump' ? 'btn_breast_pump' : feedMode === 'bottle' ? 'btn_bottle' : 'ui_nursing_dual_timer'}
        stat={feedMode === 'breast' ? (activeSide ? (isEn ? 'nursing' : 'emziriliyor') : lastSide) : feedMode === 'bottle' ? `${bottleMl} ml` : `${pumpMl} ml`}
        tint="#9B4E76"
      />
      <ToolExperienceCard lang={lang} title={isEn ? 'Log feeding without friction' : 'Beslenmeyi zahmetsiz kaydet'} steps={isEn ? ['Pick breast or bottle mode.', 'Track side, duration, or amount.', 'Save one clean entry.'] : ['Meme veya biberon modunu seç.', 'Taraf, süre ya da miktarı izle.', 'Tek temiz kayıt olarak sakla.']} outcome={isEn ? 'A daily feeding rhythm emerges over time.' : 'Zamanla günlük beslenme ritmi oluşur.'} asset="ui_nursing_dual_timer" tint="#C75B7A" />

      {/* Metrik Göstergeleri */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <MetricCard
          title={isEn ? 'LAST SESSION' : 'SON SEANS'}
          value={lastFeed ? lastFeed.time : '--:--'}
          unit={lastFeed ? (isEn && lastFeed.type === 'Emzirme' ? 'Nursing' : isEn && lastFeed.type === 'Biberon' ? 'Bottle' : lastFeed.type) : (isEn ? 'No logs' : 'Kayıt yok')}
          subtext={lastSide ? (isEn ? `Last side: ${lastSide}` : `Son taraf: ${lastSide}`) : (isEn ? 'Start session' : 'Seans başlatın')}
          icon="clock"
        />
        <MetricCard
          title={isEn ? "TODAY'S SESSIONS" : 'BUGÜNKÜ SEANSLAR'}
          value={feedRecordsToday.length}
          unit={isEn ? 'feeds' : 'öğün'}
          subtext={isEn ? '24-hour cycle' : '24 saatlik döngü'}
          icon="heart"
        />
      </View>

      {/* Sekmeler: Meme Emzirme / Biberon / Süt Sağma */}
      <View style={pbs.segRow}>
        <Tap
          onPress={() => setFeedMode('breast')}
          label={isEn ? 'Nursing' : 'Emzirme'}
          style={[pbs.segBtn, feedMode === 'breast' && pbs.segBtnActive]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {generatedAssets['btn_nursing'] ? (
              <Image source={generatedAssets['btn_nursing']} style={{ width: 18, height: 18 }} resizeMode="contain" />
            ) : null}
            <T bold={feedMode === 'breast'} style={[pbs.segText, feedMode === 'breast' && { color: 'white' }]}>
              {isEn ? 'Breast' : 'Meme'}
            </T>
          </View>
        </Tap>

        <Tap
          onPress={() => setFeedMode('bottle')}
          label={isEn ? 'Bottle' : 'Biberon'}
          style={[pbs.segBtn, feedMode === 'bottle' && pbs.segBtnActive]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {generatedAssets['btn_bottle'] ? (
              <Image source={generatedAssets['btn_bottle']} style={{ width: 18, height: 18 }} resizeMode="contain" />
            ) : null}
            <T bold={feedMode === 'bottle'} style={[pbs.segText, feedMode === 'bottle' && { color: 'white' }]}>
              {isEn ? 'Bottle' : 'Biberon'}
            </T>
          </View>
        </Tap>

        <Tap
          onPress={() => setFeedMode('pump')}
          label={isEn ? 'Pump' : 'Süt Sağma'}
          style={[pbs.segBtn, feedMode === 'pump' && pbs.segBtnActive]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {generatedAssets['btn_breast_pump'] ? (
              <Image source={generatedAssets['btn_breast_pump']} style={{ width: 18, height: 18 }} resizeMode="contain" />
            ) : null}
            <T bold={feedMode === 'pump'} style={[pbs.segText, feedMode === 'pump' && { color: 'white' }]}>
              {isEn ? 'Pump' : 'Sağma'}
            </T>
          </View>
        </Tap>
      </View>

      {/* MOD 1: MEME EMZİRME */}
      {feedMode === 'breast' && (
        <>
          <View style={pbs.lastSideBanner}>
            <Icon name="heart" size={14} color={colors.purple} />
            <T bold style={{ fontSize: 12, color: colors.purple }}>
              {isEn
                ? `Tip: Last nursed side was ${lastSide}. We recommend starting with the other breast for balance.`
                : `Öneri: Son emzirilen ${lastSide}. Denge için diğer memeyle başlaman önerilir.`}
            </T>
          </View>

          {/* Çift Dokunsal Meme Butonları (Sol / Sağ) */}
          <View style={pbs.dualBtnRow}>
            {/* Sol Meme */}
            <Tap
              onPress={() => setActiveSide(activeSide === 'left' ? null : 'left')}
              label={isEn ? 'Start left breast timer' : 'Sol meme sayacını başlat'}
              style={[pbs.breastBtn, activeSide === 'left' && pbs.breastBtnActive]}
            >
              <LinearGradient
                colors={activeSide === 'left' ? ['#E8879E', '#CF5875'] : ['#FAF2F5', '#F5E6EC']}
                style={pbs.breastGrad}
              >
                <T bold style={[pbs.breastSideText, activeSide === 'left' && { color: 'white' }]}>
                  {isEn ? 'LEFT BREAST' : 'SOL MEME'}
                </T>
                <T bold style={[pbs.breastTimerText, activeSide === 'left' && { color: 'white' }]}>
                  {secondsLabel(leftSecs)}
                </T>
                <View style={[pbs.liveDot, activeSide === 'left' ? { backgroundColor: '#FFF' } : { backgroundColor: '#C8A8B6' }]} />
                <T style={[pbs.breastStatusText, activeSide === 'left' && { color: '#FFEBF1' }]}>
                  {activeSide === 'left' ? (isEn ? 'Nursing...' : 'Emziriliyor...') : (isEn ? 'Tap to start' : 'Başlamak için dokun')}
                </T>
              </LinearGradient>
            </Tap>

            {/* Sağ Meme */}
            <Tap
              onPress={() => setActiveSide(activeSide === 'right' ? null : 'right')}
              label={isEn ? 'Start right breast timer' : 'Sağ meme sayacını başlat'}
              style={[pbs.breastBtn, activeSide === 'right' && pbs.breastBtnActive]}
            >
              <LinearGradient
                colors={activeSide === 'right' ? ['#E8879E', '#CF5875'] : ['#FAF2F5', '#F5E6EC']}
                style={pbs.breastGrad}
              >
                <T bold style={[pbs.breastSideText, activeSide === 'right' && { color: 'white' }]}>
                  {isEn ? 'RIGHT BREAST' : 'SAĞ MEME'}
                </T>
                <T bold style={[pbs.breastTimerText, activeSide === 'right' && { color: 'white' }]}>
                  {secondsLabel(rightSecs)}
                </T>
                <View style={[pbs.liveDot, activeSide === 'right' ? { backgroundColor: '#FFF' } : { backgroundColor: '#C8A8B6' }]} />
                <T style={[pbs.breastStatusText, activeSide === 'right' && { color: '#FFEBF1' }]}>
                  {activeSide === 'right' ? (isEn ? 'Nursing...' : 'Emziriliyor...') : (isEn ? 'Tap to start' : 'Başlamak için dokun')}
                </T>
              </LinearGradient>
            </Tap>
          </View>

          {/* Seansı Kaydet Butonu */}
          {(leftSecs > 0 || rightSecs > 0) && (
            <Tap onPress={saveNursing} label={isEn ? 'Save nursing' : 'Emzirmeyi kaydet'} style={pbs.saveBtn}>
              <T bold style={{ color: 'white', fontSize: 15 }}>
                {isEn ? `✓ Save Nursing (${Math.round((leftSecs + rightSecs) / 60)} min)` : `✓ Emzirmeyi Kaydet (${Math.round((leftSecs + rightSecs) / 60)} dk)`}
              </T>
            </Tap>
          )}

          <StatusCard
            level="safe"
            icon="heart"
            title={isEn ? 'Nursing Rhythm Note' : 'Emzirme Ritmi Notu'}
            description={isEn
              ? "Recording side and duration helps you discuss feeding rhythm with your care team when needed."
              : "Taraf ve süre kaydı, gerekirse beslenme ritmini bakım ekibinle konuşmanı kolaylaştırır."}
          />
        </>
      )}

      {/* MOD 2: BİBERON TAKİBİ */}
      {feedMode === 'bottle' && (
        <Card style={{ padding: 20, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            {['Anne Sütü', 'Formül Mama'].map(t => (
              <Tap
                key={t}
                onPress={() => setBottleType(t)}
                label={t}
                style={[pbs.mlPill, bottleType === t && pbs.mlPillActive]}
              >
                <T bold={bottleType === t} style={{ fontSize: 12, color: bottleType === t ? 'white' : colors.ink }}>
                  {t === 'Anne Sütü' ? (isEn ? '🥛 Breast Milk' : '🥛 Anne Sütü') : (isEn ? '🍼 Formula' : '🍼 Formül Mama')}
                </T>
              </Tap>
            ))}
          </View>

          <T style={{ fontSize: 13, color: colors.muted }}>{isEn ? 'Liquid Amount Given' : 'Verilen Sıvı Miktarı'}</T>
          <T bold style={{ fontSize: 40, color: colors.ink, marginVertical: 8 }}>{bottleMl} ml</T>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[30, 60, 90, 120, 150, 180, 210].map(amount => (
              <Tap
                key={amount}
                onPress={() => setBottleMl(amount)}
                label={`${amount} ml`}
                style={[pbs.mlPill, bottleMl === amount && pbs.mlPillActive]}
              >
                <T bold={bottleMl === amount} style={{ fontSize: 12, color: bottleMl === amount ? 'white' : colors.ink }}>
                  {amount} ml
                </T>
              </Tap>
            ))}
          </View>

          <Tap onPress={saveBottle} label={isEn ? 'Save bottle' : 'Biberonu kaydet'} style={[pbs.saveBtn, { width: '100%', marginTop: 20 }]}>
            <T bold style={{ color: 'white', fontSize: 15 }}>
              {isEn ? `🍼 Add Bottle Entry (${bottleMl} ml)` : `🍼 Biberon Kaydını Ekle (${bottleMl} ml)`}
            </T>
          </Tap>
        </Card>
      )}

      {/* MOD 3: SÜT SAĞMA (PUMPING) */}
      {feedMode === 'pump' && (
        <>
          <Card style={{ padding: 20, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {generatedAssets['btn_breast_pump'] ? (
                <Image source={generatedAssets['btn_breast_pump']} style={{ width: 28, height: 28 }} resizeMode="contain" />
              ) : null}
              <T bold style={{ fontSize: 16, color: colors.ink }}>
                {isEn ? 'Pumped Milk Amount' : 'Sağılan Süt Miktarı'}
              </T>
            </View>
            <T bold style={{ fontSize: 40, color: colors.purple, marginVertical: 8 }}>{pumpMl} ml</T>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[40, 60, 80, 100, 120, 150, 180].map(amount => (
                <Tap
                  key={amount}
                  onPress={() => setPumpMl(amount)}
                  label={`${amount} ml`}
                  style={[pbs.mlPill, pumpMl === amount && pbs.mlPillActive]}
                >
                  <T bold={pumpMl === amount} style={{ fontSize: 12, color: pumpMl === amount ? 'white' : colors.ink }}>
                    {amount} ml
                  </T>
                </Tap>
              ))}
            </View>

            <Tap onPress={savePump} label={isEn ? 'Save pumping' : 'Sağmayı kaydet'} style={[pbs.saveBtn, { width: '100%', marginTop: 20 }]}>
              <T bold style={{ color: 'white', fontSize: 15 }}>
                {isEn ? `✨ Add Pump Entry (${pumpMl} ml)` : `✨ Sağma Kaydını Ekle (${pumpMl} ml)`}
              </T>
            </Tap>
          </Card>

          {/* Süt Saklama Rehberi Kartı */}
          <Card style={pbs.storageCard}>
            <T bold style={{ fontSize: 14, color: '#3A2E44', marginBottom: 8 }}>
              {isEn ? '🧊 Golden Rules of Breast Milk Storage (3-3-3 Rule)' : '🧊 Anne Sütü Saklama Altın Kuralları (3-3-3 Kuralı)'}
            </T>
            <View style={{ gap: 8 }}>
              <View style={pbs.storageRow}>
                <T bold style={{ fontSize: 12, color: colors.purple, width: 80 }}>{isEn ? '3 HOURS' : '3 SAAT'}</T>
                <T style={{ fontSize: 12, color: colors.ink, flex: 1 }}>{isEn ? 'At room temperature (19-26°C)' : 'Oda sıcaklığında (19-26°C)'}</T>
              </View>
              <View style={pbs.storageRow}>
                <T bold style={{ fontSize: 12, color: colors.purple, width: 80 }}>{isEn ? '3 DAYS' : '3 GÜN'}</T>
                <T style={{ fontSize: 12, color: colors.ink, flex: 1 }}>{isEn ? 'On refrigerator shelf (0-4°C, not door)' : 'Buzdolabı rafında (0-4°C, kapakta değil)'}</T>
              </View>
              <View style={pbs.storageRow}>
                <T bold style={{ fontSize: 12, color: colors.purple, width: 80 }}>{isEn ? '3 MONTHS' : '3 AY'}</T>
                <T style={{ fontSize: 12, color: colors.ink, flex: 1 }}>{isEn ? 'In deep freezer (-18°C)' : 'Derin dondurucuda (-18°C)'}</T>
              </View>
            </View>
          </Card>
        </>
      )}
    </View>
  );
}

// ─── EKRAN 23: BEBEK UYKU TAKİBİ & BEYAZ GÜRÜLTÜ (SLEEP & WHITE NOISE) ────────
export function SleepWhiteNoiseScreen({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [isAsleep, setIsAsleep] = useState(false);
  const [playingNoise, setPlayingNoise] = useState(null);
  const [volume, setVolume] = useState(0.8);
  const [timerMins, setTimerMins] = useState(30);

  const whiteNoises = isEn ? [
    { id: 'womb', name: 'Womb Sounds', icon: 'heart', desc: 'Rhythmic blood flow & amniotic hum' },
    { id: 'hairdryer', name: 'Hair Dryer', icon: 'milestone', desc: 'Classic soothing pink noise' },
    { id: 'rain', name: 'Gentle Rain', icon: 'drop', desc: 'Serene and relaxing nature sound' },
    { id: 'vacuum', name: 'Vacuum Cleaner', icon: 'bell', desc: 'Continuous steady motor hum' },
    { id: 'lullaby', name: 'Music Box & Lullaby', icon: 'star', desc: 'Brahms kalimba sleep melody' },
    { id: 'ocean', name: 'Ocean Waves', icon: 'water', desc: 'Peaceful rolling surf' },
  ] : [
    { id: 'womb', name: 'Anne Karnı Sesi', icon: 'heart', desc: 'Ritmik kan akışı & amniyon uğultusu' },
    { id: 'hairdryer', name: 'Fön Makinesi', icon: 'milestone', desc: 'Klasik sakinleştirici pembe gürültü' },
    { id: 'rain', name: 'Ilık Yağmur', icon: 'drop', desc: 'Dingin ve rahatlatıcı doğa sesi' },
    { id: 'vacuum', name: 'Süpürge Sesi', icon: 'bell', desc: 'Sürekli monoton motor frekansı' },
    { id: 'lullaby', name: 'Müzik Kutusu & Ninni', icon: 'star', desc: 'Brahms kalimba uyku melodisi' },
    { id: 'ocean', name: 'Okyanus Dalgaları', icon: 'water', desc: 'Kıyıya vuran huzurlu dalgalar' },
  ];

  useEffect(() => {
    const unsub = addSoundListener(({ soundId, isPlaying }) => {
      setPlayingNoise(isPlaying ? soundId : null);
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
      toast && toast(isEn ? '⏹️ Sound stopped' : '⏹️ Ses durduruldu');
    } else {
      playSound(id, { volume, timerMinutes: timerMins });
      const found = whiteNoises.find(w => w.id === id);
      toast && toast(isEn
        ? `🎵 Playing ${found ? found.name : 'Sound'} (${timerMins ? timerMins + ' min' : 'Continuous'})`
        : `🎵 ${found ? found.name : 'Ses'} çalınıyor (${timerMins ? timerMins + ' dk' : 'Sürekli'})`);
    }
  }

  function handleVolumeChange(vol) {
    setVolume(vol);
    setEngineVolume(vol);
  }

  function handleTimerChange(mins) {
    setTimerMins(mins);
    if (playingNoise) {
      playSound(playingNoise, { volume, timerMinutes: mins });
      toast && toast(mins
        ? (isEn ? `⏱️ Timer: Set to ${mins} minutes` : `⏱️ Zamanlayıcı: ${mins} dakika ayarlandı`)
        : (isEn ? '⏱️ Continuous playback mode' : '⏱️ Sürekli çalma modu'));
    }
  }

  function toggleSleep() {
    const nextState = !isAsleep;
    setIsAsleep(nextState);
    update(old => ({
      records: [{
        id: uid(),
        type: 'Uyku',
        value: nextState ? (isEn ? 'Fell asleep' : 'Uykuya daldı') : (isEn ? 'Woke up' : 'Uyandı'),
        time: new Date().toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
      }, ...(old.records || [])],
    }));
    toast && toast(nextState
      ? (isEn ? '💤 Baby logged as asleep' : '💤 Bebek uykuya kaydedildi')
      : (isEn ? '☀️ Baby woke up' : '☀️ Bebek uyandı'));
  }

  const activeSoundObj = whiteNoises.find(w => w.id === playingNoise);

  return (
    <View style={pbs.container}>
      <ScreenHero
        kicker={isEn ? 'SLEEP RHYTHM' : 'UYKU RİTMİ'}
        title={isEn ? 'Sleep and Soothing Sounds' : 'Uyku ve Sakin Sesler'}
        body={isEn ? 'Log sleep state, observe wake windows, and play white noise with controlled timers.' : 'Uyku durumunu kaydet, uyanıklık penceresini izle ve beyaz gürültüyü kontrollü zamanlayıcıyla çal.'}
        icon="moon"
        asset="ui_white_noise_headphones"
        stat={isEn ? (isAsleep ? 'asleep' : 'awake') : (isAsleep ? 'uykuda' : 'uyanık')}
        tint="#6E5A96"
      />
      <ToolExperienceCard lang={lang} title={isEn ? 'Create a sleep ritual' : 'Uyku ritüeli oluştur'} steps={isEn ? ['Choose a calming sound.', 'Set the timer.', 'Save what worked for next time.'] : ['Sakinleştirici sesi seç.', 'Zamanlayıcıyı ayarla.', 'İşe yarayanı sonraki uyku için sakla.']} outcome={isEn ? 'This becomes a repeatable bedtime routine.' : 'Tekrarlanabilir uyku rutini hissi verir.'} asset="screen_hero_white_noise" tint="#6E5A96" />

      {/* Metrik Göstergeleri */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <MetricCard
          title={isEn ? 'CURRENT STATUS' : 'MEVCUT DURUM'}
          value={isEn ? (isAsleep ? 'Asleep' : 'Awake') : (isAsleep ? 'Uykuda' : 'Uyanık')}
          unit={isEn ? (isAsleep ? '🌙 Resting' : '☀️ Active') : (isAsleep ? '🌙 Dinleniyor' : '☀️ Aktif')}
          subtext={isEn ? (isAsleep ? 'Growth accelerates in sleep' : 'Window: ~60-90 min') : (isAsleep ? 'Gelişim uykuda hızlanır' : 'Pencere: ~60-90 dk')}
          icon="moon"
        />
        <MetricCard
          title={isEn ? 'SOUND PLAYER' : 'SES ÇALAR'}
          value={activeSoundObj ? activeSoundObj.name.split(' ')[0] : (isEn ? 'Off' : 'Kapalı')}
          unit={activeSoundObj ? `${timerMins || '∞'} ${isEn ? 'min' : 'dk'}` : (isEn ? 'Ready' : 'Hazır')}
          subtext={activeSoundObj ? (isEn ? 'White noise active' : 'Beyaz gürültü aktif') : (isEn ? 'Tap to play' : 'Dinletmek için dokun')}
          icon="sparkles"
        />
      </View>

      {/* Gece Göğü / Uyku Durumu Kartı */}
      <Card style={[pbs.sleepStatusCard, isAsleep && { backgroundColor: '#181222' }]}>
        <LinearGradient
          colors={isAsleep ? ['#2A1D3B', '#150E20'] : ['#FAF4FB', '#EDE2EE']}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ alignItems: 'center' }}>
          <T style={{ fontSize: 44 }}>{isAsleep ? '🌙' : '☀️'}</T>
          <T bold style={{ fontSize: 20, color: isAsleep ? 'white' : colors.ink, marginTop: 8 }}>
            {isAsleep
              ? (isEn ? 'Your Baby is Currently Asleep' : 'Bebeğiniz Şu An Uykuda')
              : (isEn ? 'Your Baby is Awake' : 'Bebeğiniz Uyanık')}
          </T>
          <T style={{ fontSize: 12, color: isAsleep ? '#C6B2D4' : colors.muted, marginTop: 4 }}>
            {isAsleep
              ? (isEn ? 'Wishing a calm and peaceful sleep...' : 'Sessiz ve huzurlu bir uyku diliyoruz...')
              : (isEn ? 'Ideal newborn wake window: 60 - 90 minutes' : 'Yenidoğan ideal uyanıklık penceresi: 60 - 90 dakika')}
          </T>

          <Tap
            onPress={toggleSleep}
            label={isAsleep
              ? (isEn ? 'Mark as awake' : 'Uyandı olarak işaretle')
              : (isEn ? 'Mark as asleep' : 'Uyudu olarak işaretle')}
            style={[pbs.sleepToggleBtn, isAsleep && { backgroundColor: colors.purple }]}
          >
            <T bold style={{ color: 'white', fontSize: 14 }}>
              {isAsleep
                ? (isEn ? '☀️ Baby Woke Up' : '☀️ Bebek Uyandı')
                : (isEn ? '🌙 Put to Sleep' : '🌙 Uykuya Yattı')}
            </T>
          </Tap>
        </View>
      </Card>

      {/* Aktif Çalan Ses Kontrol Paneli */}
      {playingNoise && (
        <Card style={{ padding: 16, backgroundColor: '#FAF3FB', borderColor: colors.purple, borderWidth: 1.5 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' }}>
                <T style={{ fontSize: 18 }}>🔊</T>
              </View>
              <View style={{ flex: 1 }}>
                <T bold style={{ fontSize: 15, color: colors.ink }}>
                  {activeSoundObj ? activeSoundObj.name : (isEn ? 'White Noise' : 'Beyaz Gürültü')}
                </T>
                <T style={{ fontSize: 11.5, color: colors.purple, marginTop: 2 }}>
                  {timerMins
                    ? (isEn ? `⏳ Timer: shuts off in ~${timerMins} min` : `⏳ Zamanlayıcı: ~${timerMins} dk sonra kapanacak`)
                    : (isEn ? '♾️ Continuous Playback Mode' : '♾️ Kesintisiz Çalma Modu')}
                </T>
              </View>
            </View>

            <Tap onPress={() => stopSound()} label={isEn ? 'Stop Sound' : 'Sesi Durdur'} style={{ backgroundColor: '#D8465C', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
              <T bold style={{ color: 'white', fontSize: 12 }}>{isEn ? '⏹️ Stop' : '⏹️ Durdur'}</T>
            </Tap>
          </View>

          {/* Animasyonlu Ses Dalgaları */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 28, marginVertical: 12 }}>
            {[14, 24, 18, 28, 12, 22, 16, 26, 20, 14, 24, 18].map((h, i) => (
              <View
                key={i}
                style={{
                  width: 3.5,
                  height: h,
                  backgroundColor: colors.purple,
                  borderRadius: 2,
                  opacity: 0.85,
                }}
              />
            ))}
          </View>

          {/* Ses Seviyesi (Volume) */}
          <View style={{ marginTop: 4 }}>
            <T bold style={{ fontSize: 11, color: colors.muted, marginBottom: 6 }}>
              {isEn ? 'VOLUME LEVEL:' : 'SES SEVİYESİ:'}
            </T>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[
                { label: isEn ? 'Quiet · 25%' : 'Sessiz · %25', val: 0.25 },
                { label: isEn ? 'Med · 50%' : 'Orta · %50', val: 0.5 },
                { label: isEn ? 'Ideal · 80%' : 'İdeal · %80', val: 0.8 },
                { label: isEn ? 'Max · 100%' : 'Yüksek · %100', val: 1.0 },
              ].map(v => (
                <Tap
                  key={v.val}
                  onPress={() => handleVolumeChange(v.val)}
                  label={v.label}
                  style={{
                    flex: 1,
                    paddingVertical: 5,
                    alignItems: 'center',
                    borderRadius: 10,
                    backgroundColor: volume === v.val ? colors.purple : '#EFE8F2'
                  }}
                >
                  <T bold={volume === v.val} style={{ fontSize: 10, color: volume === v.val ? 'white' : colors.ink }}>
                    {v.label.split(' ')[0]}
                  </T>
                </Tap>
              ))}
            </View>
          </View>

          {/* Zamanlayıcı (Timer) */}
          <View style={{ marginTop: 10 }}>
            <T bold style={{ fontSize: 11, color: colors.muted, marginBottom: 6 }}>
              {isEn ? 'SLEEP TIMER:' : 'UYKU ZAMANLAYICISI:'}
            </T>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[
                { label: isEn ? '15 min' : '15 dk', val: 15 },
                { label: isEn ? '30 min' : '30 dk', val: 30 },
                { label: isEn ? '45 min' : '45 dk', val: 45 },
                { label: isEn ? '60 min' : '60 dk', val: 60 },
                { label: isEn ? 'Continuous' : 'Sürekli', val: null },
              ].map(t => (
                <Tap
                  key={String(t.val)}
                  onPress={() => handleTimerChange(t.val)}
                  label={t.label}
                  style={{
                    flex: 1,
                    paddingVertical: 5,
                    alignItems: 'center',
                    borderRadius: 10,
                    backgroundColor: timerMins === t.val ? '#8A6D96' : '#EFE8F2'
                  }}
                >
                  <T bold={timerMins === t.val} style={{ fontSize: 10, color: timerMins === t.val ? 'white' : colors.ink }}>
                    {t.label}
                  </T>
                </Tap>
              ))}
            </View>
          </View>
        </Card>
      )}

      {/* Dâhili Beyaz Gürültü Çalar Listesi */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <Section title={isEn ? 'Soothing White Noise & Sounds' : 'Sakinleştirici Beyaz Gürültü & Sesler'} />
        {generatedAssets['btn_sleep'] && (
          <Image source={generatedAssets['btn_sleep']} style={{ width: 32, height: 32 }} resizeMode="contain" />
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
                <T bold style={{ fontSize: 14.5, color: isPlaying ? colors.purple : colors.ink }}>{n.name}</T>
                <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 2 }}>{n.desc}</T>
              </View>
              <Tap
                onPress={() => handlePlayToggle(n.id)}
                label={isPlaying ? (isEn ? 'Stop' : 'Durdur') : (isEn ? 'Play' : 'Çal')}
                style={[pbs.noisePlayBtn, isPlaying && { backgroundColor: '#E8D4E8' }]}
              >
                <T style={{ fontSize: 16 }}>{isPlaying ? '⏸️' : '▶️'}</T>
              </Tap>
            </Card>
          );
        })}
      </View>

      <StatusCard
        level="safe"
        icon="moon"
        title={isEn ? 'Safe Baby Sleep Guidelines' : 'Güvenli Bebek Uykusu Kılavuzu'}
        description={isEn
          ? 'Always place baby on their back to sleep. Never keep pillows, plush toys, or heavy blankets inside the crib.'
          : 'Bebeği daima sırtüstü yatırın, beşik içinde yastık, pelüş oyuncak veya kalın battaniye bulundurmayın.'}
      />
    </View>
  );
}

// ─── EKRAN 24: BEZ DEĞİŞTİRME GÜNLÜĞÜ (DIAPER TRACKER) ───────────────────────
export function DiaperTrackerScreen({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const stoolColorGuide = isEn ? [
    { day: 'Days 1-2', name: 'Meconium', desc: 'Dark black / tarry green, sticky texture. The first natural postpartum clearing.', color: '#2B2E28' },
    { day: 'Days 3-4', name: 'Transitional Stool', desc: 'Greenish brown, looser consistency. Marks transition from colostrum to mature milk.', color: '#65683F' },
    { day: 'Day 5+', name: 'Mature Breast Milk Stool', desc: 'Golden mustard yellow, seedy/curdy texture. Ideal and healthy digestion.', color: '#D4A017' },
    { day: 'Warning', name: 'When to Consult a Doctor', desc: 'Consult your pediatrician immediately if stool is chalky white/clay-colored or contains bright red blood.', color: '#D9534F' },
  ] : [
    { day: '1-2. Gün', name: 'Mekonyum', desc: 'Koyu siyah / katran yeşili, yapışkan kıvam. Doğum sonrası ilk doğal temizlik.', color: '#2B2E28' },
    { day: '3-4. Gün', name: 'Geçiş Dışkısı', desc: 'Yeşilimsi kahverengi, gevşek kıvam. Kolostrumdan olgun süte geçiş belirtisi.', color: '#65683F' },
    { day: '5+ Gün', name: 'Olgun Anne Sütü Kakası', desc: 'Altın hardal sarısı, hafif taneli/pütürlü. İdeal ve çok sağlıklı sindirim.', color: '#D4A017' },
    { day: 'Uyarı', name: 'Dikkat Edilmesi Gerekenler', desc: 'Kireç beyazı/kil rengi veya parlak kırmızı kan izi durumunda derhal hekime danışın.', color: '#D9534F' },
  ];

  const records = state?.records || [];
  const diaperRecords = records.filter(r => r.type === 'Bez');
  const wetCount = diaperRecords.filter(r => r.value?.includes('Islak') || r.value?.includes('Wet') || r.value?.includes('Karışık') || r.value?.includes('Mixed')).length;
  const targetWet = 6;
  const wetPercent = Math.min(100, Math.round((wetCount / targetWet) * 100));

  function saveDiaper(typeId) {
    const valText = isEn
      ? `${typeId === 'Islak' ? 'Wet' : typeId === 'Kirli' ? 'Dirty' : 'Mixed'} diaper`
      : `${typeId} bez`;
    update(old => ({
      records: [{
        id: uid(),
        type: 'Bez',
        value: valText,
        time: new Date().toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
      }, ...(old.records || [])],
    }));
    toast && toast(isEn ? `✨ ${typeId === 'Islak' ? 'Wet' : typeId === 'Kirli' ? 'Dirty' : 'Mixed'} diaper logged` : `✨ ${typeId} bez kaydedildi`);
  }

  return (
    <View style={pbs.container}>
      <ScreenHero
        kicker={isEn ? 'CARE TRACKING' : 'BAKIM TAKİBİ'}
        title={isEn ? 'Diaper Changes and Hydration' : 'Bez Değiştirme ve Hidrasyon'}
        body={isEn ? 'Quickly log wet, dirty, and mixed diapers; track your daily target of 6+ wet diapers.' : 'Islak, kirli ve karışık bez kayıtlarını anında işle; günlük 6+ ıslak bez hedefini takip et.'}
        icon="diaper"
        asset="ui_diaper_wet_drop"
        stat={isEn ? `${wetCount}/6 wet diapers` : `${wetCount}/6 ıslak bez`}
        tint="#4896BC"
      />
      <ToolExperienceCard lang={lang} title={isEn ? 'See the care rhythm quickly' : 'Bakım ritmini hızlı gör'} steps={isEn ? ['Choose wet, dirty, or mixed.', 'Add the moment to today.', 'Review the 24-hour pattern.'] : ['Islak, kirli veya karışık seç.', 'Bugünün akışına ekle.', '24 saatlik düzeni gözden geçir.']} outcome={isEn ? 'The tool becomes a clear daily care log.' : 'Araç net bir günlük bakım günlüğüne dönüşür.'} asset="ui_diaper_wet_drop" tint="#3E7B54" />

      {/* 24 Saatlik Hidrasyon & Bez Hedef Kartı */}
      <Card style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <T bold style={{ fontSize: 16, color: colors.ink }}>
              {isEn ? 'Daily Hydration Target' : 'Günlük Hidrasyon Hedefi'}
            </T>
            <T style={{ fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 18 }}>
              {wetCount >= targetWet
                ? (isEn
                    ? '🎉 Congratulations! Your baby reached the daily 6+ wet diaper goal, indicating good feeding and hydration.'
                    : '🎉 Tebrikler! Bebeğin günlük 6+ ıslak bez hedefine ulaştı, beslenme ve sıvı alımı gayet iyi.')
                : (isEn
                    ? `${wetCount} wet diapers logged today. In newborns, at least 6 wet diapers a day is the main sign of adequate milk intake.`
                    : `Bugün ${wetCount} ıslak bez kaydedildi. Yenidoğanda yeterli süt alımının ana göstergesi günde en az 6 ıslak bezdir.`)}
            </T>
          </View>
          <ProgressRing
            size={72}
            strokeWidth={7}
            progress={wetPercent}
            color="#4896BC"
            trackColor="#E1EFF5"
          >
            <T bold style={{ fontSize: 15, color: '#4896BC' }}>{wetCount}/6</T>
            <T style={{ fontSize: 9, color: colors.muted }}>{isEn ? 'wet' : 'ıslak'}</T>
          </ProgressRing>
        </View>
      </Card>

      {/* 3 Hızlı Dokunsal Seçici */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[
          { id: 'Islak', asset: 'ui_diaper_wet_drop', label: isEn ? 'Wet Diaper' : 'Islak Bez', tint: '#4896BC', bg: '#EDF6FA' },
          { id: 'Kirli', asset: 'ui_diaper_dirty', label: isEn ? 'Dirty Diaper' : 'Kirli Bez', tint: '#8A6840', bg: '#F9F4EE' },
          { id: 'Karışık', asset: 'btn_diaper', label: isEn ? 'Mixed Diaper' : 'Karışık', tint: '#6E4D84', bg: '#F6EFF8' },
        ].map(item => (
          <Tap
            key={item.id}
            onPress={() => saveDiaper(item.id)}
            label={item.label}
            style={[pbs.diaperBtn, { backgroundColor: item.bg }]}
          >
            {generatedAssets[item.asset] ? (
              <Image source={generatedAssets[item.asset]} style={{ width: 44, height: 44 }} resizeMode="contain" />
            ) : null}
            <T bold style={{ fontSize: 13, color: item.tint, marginTop: 8 }}>{item.label}</T>
            <T style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>{isEn ? 'Log' : 'Kaydet'}</T>
          </Tap>
        ))}
      </View>

      {/* Yenidoğan Dışkı (Kaka) Renk Skalası */}
      <Card style={pbs.colorGuideCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Icon name="palette" size={16} color={colors.purple} />
          <T bold style={{ fontSize: 14, color: colors.ink }}>
            {isEn ? 'Newborn Stool Color Guide' : 'Yenidoğan Dışkı (Kaka) Renk Skalası'}
          </T>
        </View>
        <View style={{ gap: 10 }}>
          {stoolColorGuide.map((item, idx) => (
            <View key={idx} style={pbs.colorGuideRow}>
              <View style={[pbs.colorSwatch, { backgroundColor: item.color }]} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <T bold style={{ fontSize: 13, color: colors.ink }}>{item.name}</T>
                  <View style={pbs.dayPill}>
                    <T style={{ fontSize: 9, color: colors.purple }}>{item.day}</T>
                  </View>
                </View>
                <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{item.desc}</T>
              </View>
            </View>
          ))}
        </View>
      </Card>

      <StatusCard
        level="info"
        icon="info"
        title={isEn ? 'Pink / Orange Stains (Urate Crystals)' : 'Pembe / Turuncu Leke (Ürat Kristalleri)'}
        description={isEn
          ? 'Brick-colored stains in the diaper in the first few days are usually urate crystals from concentrated urine. If it continues, consult your pediatrician regarding fluid intake.'
          : 'İlk birkaç günde bezde görülen kiremit rengi leke genellikle yoğun idrardaki ürat kristalleridir. Devam ederse sıvı alımı açısından doktorunuza danışın.'}
      />
    </View>
  );
}

// ─── EKRAN 25: ANNE İYİLEŞME & LOHUSA RUH HALİ (POSTPARTUM SELF-CARE) ─────────
export function PostpartumSelfCareScreen({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const motherAffirmations = isEn ? [
    '“For your baby, you are the safest haven in the world.”',
    '“You do not have to be perfect; your love is more than enough.”',
    '“Your body brought a miraculous life into this world; give it kindness and time.”',
    '“Feeling exhausted is completely human; resting is your natural right.”',
  ] : [
    '“Bebeğin için dünyanın en güvenli limanı sensin.”',
    '“Mükemmel olmak zorunda değilsin; sevgin fazlasıyla yeterli.”',
    '“Bedenin mucizevi bir can dünyaya getirdi, ona şefkat ve zaman tanı.”',
    '“Yorulmak çok insani, dinlenmek senin en doğal hakkın.”',
  ];

  const [day] = useState(14);
  const [waterGlasses, setWaterGlasses] = useState(state.waterGlassesToday || 4);
  const [kegelStep, setKegelStep] = useState('Hazır'); // 'Hazır' | 'Kas' | 'Gevşe' | 'Tamam'
  const [kegelReps, setKegelReps] = useState(0);
  const kegelTimerRef = useRef(null);

  function toggleWater(glassIdx) {
    const nextVal = glassIdx + 1 === waterGlasses ? glassIdx : glassIdx + 1;
    setWaterGlasses(nextVal);
    update({ waterGlassesToday: nextVal });
    toast && toast(isEn ? `💧 ${nextVal}/8 glasses of water logged` : `💧 ${nextVal}/8 bardak su içildi`);
  }

  function startKegelSession() {
    if (kegelStep !== 'Hazır' && kegelStep !== 'Tamam') return;
    setKegelReps(1);
    setKegelStep('Kas (5 sn)');

    let count = 1;
    let isContract = true;

    kegelTimerRef.current = setInterval(() => {
      if (isContract) {
        setKegelStep('Gevşe (5 sn)');
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
        setKegelStep('Kas (5 sn)');
        isContract = true;
      }
    }, 5000);
  }

  useEffect(() => {
    return () => {
      if (kegelTimerRef.current) clearInterval(kegelTimerRef.current);
    };
  }, []);

  const currentQuote = motherAffirmations[(day % motherAffirmations.length)];

  return (
    <View style={pbs.container}>
      <ScreenHero
        kicker={isEn ? 'POSTPARTUM CARE' : 'LOHUSA BAKIMI'}
        title={isEn ? `Day ${day} Recovery` : `${day}. Gün Toparlanma`}
        body={isEn ? 'Follow recovery steps, pelvic floor exercises, and daily hydration gently.' : 'İyileşme adımlarını, pelvik taban egzersizini ve günlük sıvı ihtiyacını şefkatle takip et.'}
        icon="leaf"
        asset="ui_postpartum_lotus"
        stat={isEn ? 'gentle care' : 'şefkatli bakım'}
        tint="#86518A"
      />
      <ToolExperienceCard lang={lang} title={isEn ? 'Make recovery visible' : 'Toparlanmayı görünür yap'} steps={isEn ? ['Check mood and body signals.', 'Pick one gentle action.', 'Keep a note for your support circle.'] : ['Ruh hali ve beden sinyalini kontrol et.', 'Tek nazik aksiyon seç.', 'Destek çevren için not sakla.']} outcome={isEn ? 'The screen gives a reason to return each day.' : 'Ekran her gün geri dönmek için anlamlı sebep verir.'} asset="ui_postpartum_lotus" tint="#86518A" />

      {/* Lohusalık Gün Sayacı & Sevgi Notu */}
      <Card style={pbs.recoveryCard}>
        <LinearGradient
          colors={['#846284', '#664766']}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={pbs.dayBadge}>
              <T bold style={{ color: colors.purple, fontSize: 11 }}>
                {isEn ? `POSTPARTUM · DAY ${day}` : `LOHUSALIK · ${day}. GÜN`}
              </T>
            </View>
            <T bold style={{ color: 'white', fontSize: 17 }}>{currentQuote}</T>
            <T style={{ color: '#E8D5E8', fontSize: 12, lineHeight: 18 }}>
              {isEn
                ? "Respect your body's healing process. Give yourself and your baby time. 💜"
                : 'Bedeninin toparlanma sürecine saygı duy. Kendine ve bebeğine zaman tanı. 💜'}
            </T>
          </View>
          {generatedAssets['mother-baby'] && (
            <Image source={generatedAssets['mother-baby']} style={{ width: 75, height: 75, borderRadius: 20 }} resizeMode="cover" />
          )}
        </View>
      </Card>

      {/* Günlük Sıvı & Su Takibi (8 Bardak Hedefi) */}
      <Card style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <View>
            <T bold style={{ fontSize: 15, color: colors.ink }}>
              {isEn ? 'Daily Water Intake' : 'Günlük Su İhtiyacı'}
            </T>
            <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
              {isEn
                ? `Target for milk production and tissue healing: ${waterGlasses}/8 glasses`
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

      {/* İnteraktif Pelvik Taban & Kegel Egzersiz Rehberi */}
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
                : `${isEn ? (kegelStep.startsWith('Kas') ? 'Contract (5s)' : 'Relax (5s)') : kegelStep} · ${isEn ? 'Rep' : 'Tekrar'} ${kegelReps}/5`}
            </T>
          </View>
          <T style={{ fontSize: 12, color: colors.muted, marginTop: 6, textAlign: 'center' }}>
            {kegelStep.startsWith('Kas')
              ? (isEn
                  ? 'Inhale, gently draw your lower pelvic floor muscles upward and inward.'
                  : 'Nefes al, alt pelvik kaslarını yukarı ve içeriye doğru nazikçe topla.')
              : kegelStep.startsWith('Gevşe')
                ? (isEn
                    ? 'Slowly exhale, release all muscles completely and relax.'
                    : 'Yavaşça nefes ver, tüm kasları tamamen serbest bırak ve rahatla.')
                : (isEn
                    ? '2-3 short sessions daily are recommended to support postpartum healing.'
                    : 'Doğum sonrası doku toparlanmasını desteklemek için günde 2-3 kısa seans önerilir.')}
          </T>
        </View>
      </Card>

      <StatusCard
        level="safe"
        icon="heart"
        title={isEn ? 'Emotional Recovery (Baby Blues)' : 'Duygusal İyileşme (Baby Blues)'}
        description={isEn
          ? 'Sudden crying and mood swings due to hormonal shifts in the first two weeks are very natural. If it persists past two weeks, do not hesitate to consult your doctor.'
          : 'İlk 2 haftada hormon dalgalanmalarına bağlı ani ağlama ve hüzün çok doğaldır. 2 haftadan uzun sürerse hekiminize danışmaktan çekinmeyin.'}
      />
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
  noiseIconBox: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EFE7EE', alignItems: 'center', justifyContent: 'center' },
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
