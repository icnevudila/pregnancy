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
import { T, Tap, Card, Section, Progress, ScreenHero, InfoNote, ProgressRing, MetricCard, StatusCard } from './ui';
import { generatedAssets } from './generatedAssets';
import { usePulse } from './anim';
import { secondsLabel, uid, localDay } from './domain.mjs';
import { saveKickSessionCloud, saveContractionSessionCloud } from './backendSync';

// ─── 1. TEKME SAYACI (ADVANCED KICK COUNTER) ──────────────────────────────────
export function KickCounter({ state, update, toast }) {
  const [sessionActive, setSessionActive] = useState(false);
  const [kicks, setKicks] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [selectedType, setSelectedType] = useState('kick'); // 'kick' | 'flutter' | 'roll' | 'hiccup'
  const [typeCounts, setTypeCounts] = useState({ kick: 0, flutter: 0, roll: 0, hiccup: 0 });
  const [lastKickTime, setLastKickTime] = useState(null);
  const [completedSummary, setCompletedSummary] = useState(null);

  const pulse = usePulse(0.96, 1.04, 1200);
  const timerRef = useRef(null);

  useEffect(() => {
    if (sessionActive) {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sessionActive]);

  const movementTypes = [
    { id: 'kick', label: 'Net Tekme', tint: '#9A5B80' },
    { id: 'flutter', label: 'Kıpırtı', tint: '#B8789C' },
    { id: 'roll', label: 'Dönüş & Dalga', tint: '#5C749A' },
    { id: 'hiccup', label: 'Hıçkırık', tint: '#6B8E71' },
  ];

  function handleKick() {
    if (!sessionActive) {
      setSessionActive(true);
    }
    const nextKicks = kicks + 1;
    setKicks(nextKicks);
    setLastKickTime(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));

    setTypeCounts(prev => ({
      ...prev,
      [selectedType]: (prev[selectedType] || 0) + 1,
    }));

    if (nextKicks >= 10) {
      finishSession(nextKicks, seconds);
    }
  }

  function finishSession(finalKicks = kicks, finalSecs = seconds) {
    setSessionActive(false);
    if (finalKicks === 0) return;

    let activityRating = 'Normal Ritim';
    if (finalSecs <= 1200) activityRating = 'Çok Aktif & Canlı';
    else if (finalSecs <= 2700) activityRating = 'Sağlıklı Düzenli Ritim';
    else activityRating = 'Sakin & Yavaş Seans';

    const newSession = {
      id: uid(),
      date: localDay(),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
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
      notes: `Derece: ${activityRating}`,
    }).catch(() => {});

    toast && toast(`🌸 10 hareket ${secondsLabel(finalSecs)} içinde tamamlandı!`);
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
        kicker="FETAL HAREKET DÜZENİ"
        title="Bebeğinin Ritmini Say"
        body="ACOG kılavuzuna göre 2 saatte 10 hareket beklenir. Bebeğinin aktifleştiği saatlerde seans başlat."
        stat={pastSessions[0] ? `Son: ${pastSessions[0].kicks} hareket (${secondsLabel(pastSessions[0].durationSecs || 0)})` : 'İlk seans hazır'}
        tint="#9D5C80"
      />

      {/* Seans Tamamlanma Başarı Kartı */}
      {completedSummary && (
        <Card style={ts.summaryBanner}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={ts.trophyBadge}>
              <Icon name="sparkle" size={20} color={colors.purple} />
            </View>
            <View style={{ flex: 1 }}>
              <T bold style={{ fontSize: 15, color: colors.purple }}>Seans Başarıyla Tamamlandı! ✨</T>
              <T style={{ fontSize: 12, color: colors.ink, marginTop: 2 }}>
                10 hareket <T bold>{secondsLabel(completedSummary.duration)}</T> içinde kaydedildi. ({completedSummary.rating})
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
          title="SEANS SÜRESİ"
          value={secondsLabel(seconds)}
          unit=""
          subtext={sessionActive ? "Sayaç aktif" : "Seans bekleniyor"}
          icon="time"
          tint="#9D5C80"
        />
        <MetricCard
          title="SON HAREKET"
          value={lastKickTime || '--:--'}
          unit=""
          subtext={lastKickTime ? "Ritmik algılandı" : "Henüz vuruş yok"}
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
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}>
          <ProgressRing
            size={190}
            strokeWidth={10}
            progress={percent10}
            color={colors.purple}
            bgColor="#F2E6F2"
          >
            <Animated.View style={{ transform: [{ scale: sessionActive ? pulse : 1 }] }}>
              <Tap
                onPress={handleKick}
                label="Tekme hissettim"
                style={ts.kickCenterTap}
              >
                <LinearGradient
                  colors={sessionActive ? ['#FAF0F6', '#F3DFEE', '#E9CDE3'] : ['#FAF6F9', '#F0E6F0', '#E5D6E6']}
                  style={ts.kickCenterGradient}
                >
                  {generatedAssets['card_kick_counter'] ? (
                    <Image
                      source={generatedAssets['card_kick_counter']}
                      style={{ width: 88, height: 88 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Icon name="footprint" size={54} color={colors.purple} />
                  )}
                  <T bold style={ts.kickBigCount}>{kicks} / 10</T>
                  <T style={ts.kickSubPrompt}>
                    {sessionActive ? 'Vuruşta Dokun' : 'Saymaya Başla'}
                  </T>
                </LinearGradient>
              </Tap>
            </Animated.View>
          </ProgressRing>
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
              <T style={{ fontSize: 12, color: colors.ink }}>↩ 1 Geri Al</T>
            </Tap>
            <Tap onPress={() => finishSession(kicks, seconds)} style={[ts.actionMiniBtn, { backgroundColor: '#F0E4F2' }]}>
              <T bold style={{ fontSize: 12, color: colors.purple }}>✓ Seansı Bitir</T>
            </Tap>
            <Tap onPress={resetSession} style={ts.actionMiniBtn}>
              <T style={{ fontSize: 12, color: '#B35E6D' }}>✕ Sıfırla</T>
            </Tap>
          </View>
        )}
      </Card>

      {/* ACOG Klinik Rehber Kartı */}
      <StatusCard
        level="info"
        title="ACOG Tıbbi Tavsiyesi: 2 Saatte 10 Hareket"
        body="Yemek yedikten sonra sol yanınıza uzanarak saymak bebeğin hareketlerini net hissetmenizi sağlar. Bebek uykudaysa bir bardak soğuk su için veya hafifçe karnınıza dokunun."
        icon="heart"
      />

      {/* Son Seans Kayıtları */}
      <Section title="Son Seans Kayıtları" />
      {pastSessions.length === 0 ? (
        <Card style={{ alignItems: 'center', padding: 20 }}>
          <T style={{ color: colors.muted, fontSize: 13 }}>Henüz kaydedilmiş tekme seansı bulunmuyor.</T>
        </Card>
      ) : (
        pastSessions.slice(0, 5).map(s => (
          <Card key={s.id} style={ts.historyItem}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={ts.historyBadge}>
                  <Icon name="footprint" size={16} color={colors.purple} />
                </View>
                <View>
                  <T bold style={{ fontSize: 14 }}>{s.kicks || 10} Hareket Tamamlandı</T>
                  <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                    {s.date} · {s.time} · {s.week}. Hafta
                  </T>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <T bold style={{ fontSize: 14, color: colors.purple }}>{secondsLabel(s.durationSecs || s.duration || 0)}</T>
                <T style={{ fontSize: 10, color: '#4B7B56', marginTop: 2 }}>{s.rating || 'Normal Ritim'}</T>
              </View>
            </View>
          </Card>
        ))
      )}
    </View>
  );
}

// ─── 2. KASILMA SAYACI & 5-1-1 MOTORU (ADVANCED CONTRACTION TIMER) ──────────────
export function ContractionTimer({ state, update, toast }) {
  const [active, setActive] = useState(false);
  const [duration, setDuration] = useState(0);
  const [intensity, setIntensity] = useState('Orta'); // 'Hafif' | 'Orta' | 'Şiddetli'
  const contractions = state?.contractionSessions || [];
  const timerRef = useRef(null);

  useEffect(() => {
    if (active) {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [active]);

  const lastContraction = contractions[0];
  const lastIntervalSecs = lastContraction?.intervalSecs;

  function toggleContraction() {
    if (!active) {
      // Sancı başladı
      setActive(true);
      setDuration(0);
    } else {
      // Sancı bitti
      setActive(false);
      const now = new Date();
      let intervalSecs = null;
      if (lastContraction && lastContraction.timestamp) {
        intervalSecs = Math.round((now.getTime() - lastContraction.timestamp) / 1000);
      }

      const entry = {
        id: uid(),
        durationSecs: duration,
        intervalSecs,
        intensity,
        timestamp: now.getTime(),
        time: now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        date: localDay(now),
      };

      update(old => ({
        contractionSessions: [entry, ...(old.contractionSessions || [])],
      }));

      saveContractionSessionCloud({
        durationSeconds: duration,
        intervalSeconds: intervalSecs,
        intensity,
        statusAlert: isFiveOneOneActive ? '5-1-1 Kuralı Karşılandı' : 'Normal Takip',
      }).catch(() => {});

      toast && toast('Kasılma kaydedildi.');
      setDuration(0);
    }
  }

  // 5-1-1 Kuralı Hesaplama Algoritması
  let isFiveOneOneActive = false;
  let medicalStatus = {
    badge: 'Normal Takip',
    color: '#4B7B56',
    bg: '#EFF7F1',
    border: '#C8E6D0',
    text: 'Kasılmalarınızı süre, aralık ve şiddet olarak kaydedin. Düzenli hale geldiklerinde sistem sizi bilgilendirecektir.',
  };

  if (contractions.length >= 3) {
    const recent = contractions.slice(0, 3);
    const avgDuration = recent.reduce((a, b) => a + (b.durationSecs || 0), 0) / 3;
    const intervals = recent.map(r => r.intervalSecs).filter(Boolean);
    const avgInterval = intervals.length ? (intervals.reduce((a, b) => a + b, 0) / intervals.length) : null;

    if (avgInterval && avgInterval <= 300 && avgDuration >= 50) {
      isFiveOneOneActive = true;
      medicalStatus = {
        badge: '🚨 5-1-1 KURALI: HASTANEYE GİTME VAKTİ!',
        color: '#B42318',
        bg: '#FEF3F2',
        border: '#FECDCA',
        text: 'Kasılmalarınız 5 dakikada bir veya daha sık geliyor ve en az 1 dakika sürüyor. Lütfen doktorunuzu veya doğum hastanenizi arayarak yola çıkın!',
      };
    } else if (avgInterval && avgInterval <= 480) {
      medicalStatus = {
        badge: 'Kasılmalar Sıklaşıyor',
        color: '#B54708',
        bg: '#FFFAEB',
        border: '#FEDF89',
        text: 'Aralıklar 8 dakikanın altına indi. Hastane çantanızı kontrol edin ve refakatçinizi yanınızda bulundurun.',
      };
    }
  }

  return (
    <View style={ts.container}>
      <ScreenHero
        asset="card_contractions"
        icon="contraction"
        kicker="DOĞUM SANCISI TAKİBİ"
        title="Kasılma & Doğum Sayacı"
        body="5-1-1 kuralı motoru ile sancı aralıklarınızı otomatik analiz edin. Hastaneye ne zaman gitmeniz gerektiğini öğrenin."
        stat={contractions.length ? `${contractions.length} kayıt` : 'İlk kayıt hazır'}
        tint="#4F79A1"
      />

      {/* 5-1-1 Tıbbi Durum Bildirim Kartı */}
      <View style={[ts.statusBanner, { backgroundColor: medicalStatus.bg, borderColor: medicalStatus.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: medicalStatus.color }} />
          <T bold style={{ color: medicalStatus.color, fontSize: 13 }}>{medicalStatus.badge}</T>
        </View>
        <T style={{ fontSize: 12, color: colors.ink, marginTop: 4, lineHeight: 18 }}>{medicalStatus.text}</T>

        {isFiveOneOneActive && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <Tap onPress={() => toast && toast('Acil arama yönlendiriliyor...')} style={[ts.callBtn, { backgroundColor: '#B42318' }]}>
              <Icon name="bell" size={14} color="white" />
              <T bold style={{ color: 'white', fontSize: 12 }}>Doktorumu / Hastaneyi Ara</T>
            </Tap>
          </View>
        )}
      </View>

      {/* Şiddet Seçimi */}
      <View style={ts.intensityRow}>
        <T bold style={{ fontSize: 12, color: colors.ink }}>Sancı Şiddeti:</T>
        {['Hafif', 'Orta', 'Şiddetli'].map(lvl => (
          <Tap
            key={lvl}
            onPress={() => setIntensity(lvl)}
            style={[ts.intensityPill, intensity === lvl && ts.intensityPillActive]}
          >
            <T bold={intensity === lvl} style={[ts.intensityText, intensity === lvl && { color: 'white' }]}>
              {lvl}
            </T>
          </Tap>
        ))}
      </View>

      {/* Canlı Sayaç Kartı */}
      <View style={ts.counterBox}>
        <T style={ts.counterLabel}>{active ? 'KASILMA SÜRÜYOR' : 'SANCI DURUMU'}</T>
        <T bold style={ts.counterNumber}>{secondsLabel(duration)}</T>
        {lastIntervalSecs && !active && (
          <T style={ts.counterSub}>
            Son sancıdan bu yana: <T bold>{Math.round(lastIntervalSecs / 60)} dk {lastIntervalSecs % 60} sn</T>
          </T>
        )}
      </View>

      {/* Başlat / Durdur Butonu */}
      <Tap
        onPress={toggleContraction}
        label={active ? 'Sancıyı Durdur' : 'Sancı Başladı'}
        style={ts.contractionBtn}
      >
        <LinearGradient
          colors={active ? ['#E8879E', '#CF5573'] : ['#8FABC8', '#6289B5']}
          style={ts.contractionGrad}
        >
          <Icon name="contraction" size={32} color="white" />
          <T bold style={ts.contractionBtnText}>
            {active ? 'Sancıyı Durdur ve Kaydet' : 'Sancı Başladı (Dokun)'}
          </T>
        </LinearGradient>
      </Tap>

      {/* Geçmiş Kayıtlar Tablosu */}
      <Section title="Son Kasılma Kayıtları" />
      {contractions.length === 0 ? (
        <Card style={{ alignItems: 'center', padding: 20 }}>
          <T style={{ color: colors.muted, fontSize: 13 }}>Henüz kaydedilmiş kasılma bulunmuyor.</T>
        </Card>
      ) : (
        contractions.slice(0, 5).map(c => (
          <Card key={c.id} style={ts.historyItem}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <T bold style={{ fontSize: 14 }}>Süre: {secondsLabel(c.durationSecs || 0)}</T>
                <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                  {c.date} · {c.time} · Şiddet: <T bold>{c.intensity || 'Orta'}</T>
                </T>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <T bold style={{ fontSize: 13, color: '#3A688F' }}>
                  {c.intervalSecs ? `${Math.round(c.intervalSecs / 60)} dk aralık` : 'İlk sancı'}
                </T>
              </View>
            </View>
          </Card>
        ))
      )}
    </View>
  );
}

// ─── 3. HASTANE ÇANTASI (ADVANCED 4-CATEGORY HOSPITAL BAG) ─────────────────────
export function HospitalBag({ state, update, toast }) {
  const [activeTab, setActiveTab] = useState('mother'); // 'mother' | 'baby' | 'partner' | 'docs'
  const [newItemName, setNewItemName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const defaultBag = {
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
    toast && toast('Çanta listesi güncellendi.');
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
    toast && toast('Yeni madde çantaya eklendi.');
  }

  const tabs = [
    { id: 'mother', label: 'Anne' },
    { id: 'baby', label: 'Bebek' },
    { id: 'partner', label: 'Refakatçi' },
    { id: 'docs', label: 'Evraklar' },
  ];

  return (
    <View style={ts.container}>
      <ScreenHero
        asset="card_hospital_bag"
        icon="bag"
        kicker="DOĞUM HAZIRLIĞI"
        title="Hastane Çantası Listesi"
        body="32-34. haftada hazır olması önerilen anne, bebek ve refakatçi gereksinimleri tek çatı altında."
        stat={`%${totalPercent} Hazır (${packedCount}/${totalCount})`}
        tint="#744E8A"
      />

      {/* Genel İlerleme Barı */}
      <Card style={ts.progressBox}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <T bold style={{ fontSize: 14 }}>Genel Hazırlık Durumu</T>
          <T bold style={{ color: colors.purple, fontSize: 15 }}>%{totalPercent} Hazır</T>
        </View>
        <Progress current={packedCount} total={totalCount} tint={colors.purple} height={8} />
        <T style={{ fontSize: 11, color: colors.muted, marginTop: 6 }}>
          {totalCount - packedCount === 0 ? 'Tebrikler! Hastane çantanız eksiksiz hazır.' : `Kalan: ${totalCount - packedCount} adet eşya`}
        </T>
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
        {currentItems.map(item => (
          <Tap
            key={item.id}
            onPress={() => toggleItem(item.id)}
            style={[ts.bagItemRow, item.done && ts.bagItemRowDone]}
          >
            <View style={[ts.bagItemCheck, item.done && ts.bagItemCheckDone]}>
              {item.done && <Icon name="check" size={13} color="white" />}
            </View>
            <T style={[ts.bagItemText, item.done && ts.bagItemTextDone]}>
              {item.name}
            </T>
          </Tap>
        ))}
      </View>

      {/* Yeni Madde Ekleme Alanı */}
      <View style={ts.addItemRow}>
        <TextInput
          value={newItemName}
          onChangeText={setNewItemName}
          placeholder="Bu kategoriye özel bir eşya ekle..."
          placeholderTextColor={colors.muted}
          style={ts.addItemInput}
          onSubmitEditing={handleAddItem}
        />
        <Tap onPress={handleAddItem} style={ts.addItemBtn}>
          <Icon name="plus" size={16} color="white" />
          <T bold style={{ color: 'white', fontSize: 12 }}>Ekle</T>
        </Tap>
      </View>
    </View>
  );
}

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
  touchButtonContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  bigKickButton: {
    width: 170,
    height: 170,
    borderRadius: 85,
    overflow: 'hidden',
    ...shadow.soft,
  },
  bigKickGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bigKickCount: {
    fontSize: 22,
    color: 'white',
  },
  bigKickSub: {
    fontSize: 11,
    color: '#FFECF4',
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
    borderRadius: 17,
    backgroundColor: '#F6ECF6',
    alignItems: 'center',
    justifyContent: 'center',
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
