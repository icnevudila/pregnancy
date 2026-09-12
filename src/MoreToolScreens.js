import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section, Progress, ScreenHero, InfoNote } from './ui';
import { uid, localDay } from './domain.mjs';
import { babyNamesList, nameThemes, nameOrigins } from './babyNamesData';

// ─── 4. KİLO TAKİBİ (WEIGHT TRACKER) ─────────────────────────────────────────
export function WeightTracker({ state, update, toast }) {
  const [weightInput, setWeightInput] = useState('');
  const weights = state.weights || [];
  const startWeight = state.startWeight || 60.0;
  const currentWeight = weights[0]?.value || startWeight;
  const totalGained = (currentWeight - startWeight).toFixed(1);

  // Haftaya göre kişisel kilo eğrisi için sade görsel aralık.
  const week = state.week || 24;
  const minExpectedGain = Math.max(0, ((week - 12) * 0.35)).toFixed(1);
  const maxExpectedGain = Math.max(0.5, ((week - 12) * 0.50 + 2.0)).toFixed(1);

  function logWeight() {
    const val = parseFloat(weightInput.replace(',', '.'));
    if (isNaN(val) || val < 30 || val > 200) {
      toast && toast('Lütfen geçerli bir kilo girin. Örn: 65.5');
      return;
    }
    const newEntry = {
      id: uid(),
      value: val,
      week: state.week || 24,
      date: localDay(),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };
    update(old => ({
      weights: [newEntry, ...(old.weights || [])],
    }));
    setWeightInput('');
    toast && toast(`Kilo kaydedildi: ${val} kg`);
  }

  return (
    <View style={ws.container}>
      <ScreenHero asset="card_scale"
        icon="scale"
        kicker="HAFTALIK EĞİLİM"
        title="Kilo takip paneli"
        body="Ölçümlerini tek çizgide tut; randevu öncesi değişimi hızlıca hatırla."
        stat={`${weights.length} ölçüm`}
        tint="#4F8464"
      />

      {/* Kilo Özeti Kartı */}
      <Card style={ws.summaryCard}>
        <View style={ws.summaryRow}>
          <View>
            <T style={ws.label}>GÜNCEL KİLO</T>
            <T bold style={ws.weightNum}>{currentWeight} <T style={{ fontSize: 18 }}>kg</T></T>
          </View>
          <View style={ws.gainPill}>
            <T bold style={{ color: colors.sage, fontSize: 13 }}>
              {totalGained >= 0 ? `+${totalGained}` : totalGained} kg
            </T>
            <T style={{ fontSize: 10, color: colors.muted }}>Toplam artış</T>
          </View>
        </View>

        <View style={ws.corridorBox}>
          <T bold style={{ fontSize: 12, color: colors.purple }}>
            {week}. Hafta Takip Aralığı:
          </T>
          <T style={{ fontSize: 12, color: colors.ink, marginTop: 2 }}>
            +{minExpectedGain} kg ile +{maxExpectedGain} kg arası kişisel izleme bandı
          </T>
        </View>
      </Card>

      <InfoNote icon="scale"
        title="Tek değere değil, eğriye bak"
        body="Kilo takibi en iyi haftalık eğilimle okunur. Ani değişim, iştah, ödem veya endişe varsa notunu randevuda doktorunla paylaş."
      />

      {/* Yeni Kilo Girişi */}
      <View style={ws.inputRow}>
        <TextInput
          value={weightInput}
          onChangeText={setWeightInput}
          placeholder="Bugünkü kilon · Örn: 66.2"
          placeholderTextColor={colors.muted}
          keyboardType="numeric"
          style={ws.input}
          onSubmitEditing={logWeight}
        />
        <Tap onPress={logWeight} label="Kaydet" style={ws.addBtn}>
          <T bold style={{ color: 'white', fontSize: 14 }}>Kaydet</T>
        </Tap>
      </View>

      {/* Geçmiş Kilo Kayıtları */}
      <Section title="Kilo Geçmişi" />
      {weights.length === 0 ? (
        <Card style={{ padding: 18, alignItems: 'center' }}>
          <T bold style={{ color: colors.ink, fontSize: 14 }}>İlk ölçümü ekle</T>
          <T style={{ color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
            Aynı tartı ve benzer saatlerde kayıt almak eğilimi daha okunur yapar.
          </T>
        </Card>
      ) : (
        weights.map(w => (
          <View key={w.id} style={ws.historyRow}>
            <View>
              <T bold style={{ fontSize: 15 }}>{w.value} kg</T>
              <T style={{ fontSize: 11, color: colors.muted }}>{w.date} · {w.week}. Hafta</T>
            </View>
            <View style={ws.badge}>
              <T style={{ fontSize: 12, color: colors.purple }}>
                {(w.value - startWeight).toFixed(1) >= 0 ? `+${(w.value - startWeight).toFixed(1)}` : (w.value - startWeight).toFixed(1)} kg
              </T>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

// ─── 5. DOĞUM PLANI (BIRTH PLAN BUILDER) ──────────────────────────────────────
const defaultBirthPlanOptions = [
  { id: 'bp1', cat: 'Doğum Ortamı', title: 'Loş ve sakin ışıklandırma', desc: 'Rahatlatıcı ve huzurlu bir oda atmosferi' },
  { id: 'bp2', cat: 'Doğum Ortamı', title: 'Sakinleştirici arka plan müziği', desc: 'Kendi hazırladığım çalma listesi' },
  { id: 'bp3', cat: 'Doğum Ortamı', title: 'Serbest hareket & pilates topu', desc: 'Yatakta sabit kalmak yerine aktif pozisyonlar' },
  { id: 'bp4', cat: 'Ağrı Yönetimi', title: 'Doğal nefes ve gevşeme teknikleri', desc: 'İlaçsız rahatlama yöntemleri' },
  { id: 'bp5', cat: 'Ağrı Yönetimi', title: 'Gerektiğinde epidural anestezi', desc: 'Ağrı eşiğim zorlandığında epidural tercihi' },
  { id: 'bp6', cat: 'Bebek Doğunca', title: 'İlk saat Ten Tene Temas', desc: 'Kordon kesildikten sonra hemen anne göğsüne verilmesi' },
  { id: 'bp7', cat: 'Bebek Doğunca', title: 'Geç kordon klempleme', desc: 'Kordon pulsasyonunun durması beklenerek kesilmesi' },
  { id: 'bp8', cat: 'Bebek Doğunca', title: 'İlk saat içinde ilk emzirme', desc: 'Altın saatte kolostrumla ilk temas' },
];

export function BirthPlanBuilder({ state, update, toast }) {
  const plan = state.birthPlan || {};

  function toggleOption(id) {
    const nextVal = !plan[id];
    update(old => ({
      birthPlan: { ...(old.birthPlan || {}), [id]: nextVal },
    }));
  }

  const selectedCount = Object.values(plan).filter(Boolean).length;

  return (
    <View style={ws.container}>
      <ScreenHero asset="card_health_report"
        icon="book"
        kicker="DOĞUM HAZIRLIĞI"
        title="Tercihlerini tek sayfada topla"
        body="Ortam, destek ve ilk temas tercihlerini sade, paylaşılabilir bir plana dönüştür."
        stat={`${selectedCount}/8 tercih`}
        tint="#946635"
      />

      <Card style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <T bold style={{ fontSize: 16 }}>Doğum Tercihlerim</T>
            <T style={{ fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 18 }}>
              {selectedCount} tercih belirlendi · Planı randevuda konuşmak için sade bir özet olarak kullan.
            </T>
          </View>
          <View style={ws.scoreRing}>
            <T bold style={{ fontSize: 18, color: colors.purple }}>{selectedCount}</T>
            <T style={{ fontSize: 10, color: colors.muted }}>seçim</T>
          </View>
        </View>
      </Card>

      <InfoNote icon="milestone"
        title="Plan esnek olmalı"
        body="Doğum planı kesin talimat değil; ekip, koşullar ve güvenlik önceliğine göre birlikte güncellenen bir tercih özeti gibi çalışır."
      />

      <View style={{ gap: 10 }}>
        {defaultBirthPlanOptions.map(opt => {
          const isSelected = !!plan[opt.id];
          return (
            <Tap
              key={opt.id}
              onPress={() => toggleOption(opt.id)}
              label={opt.title}
              style={[ws.planCard, isSelected && ws.planCardActive]}
            >
              <View style={[ws.planCheck, isSelected && ws.planCheckActive]}>
                {isSelected && <Icon name="check" size={14} color="white" />}
              </View>
              <View style={{ flex: 1 }}>
                <T bold style={{ fontSize: 14, color: isSelected ? colors.purple : colors.ink }}>
                  {opt.title}
                </T>
                <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{opt.desc}</T>
                <T style={{ fontSize: 10, color: '#A08EA0', marginTop: 4 }}>{opt.cat}</T>
              </View>
            </Tap>
          );
        })}
      </View>
    </View>
  );
}

// ─── 6. DOKTORA SORULAR (DOCTOR QUESTIONS) ───────────────────────────────────
export function DoctorQuestions({ state, update, toast }) {
  const [newQ, setNewQ] = useState('');
  const questions = state.lists?.questions || [
    { id: 'dq1', text: 'Bu hafta demir veya vitamin takviyelerimi artırmalı mıyım?', done: false },
    { id: 'dq2', text: 'Yolculuk veya uçuş için seyahat raporuna ihtiyacım var mı?', done: false },
    { id: 'dq3', text: 'Hissedilen kasılmalar Braxton Hicks mi yoksa doğum sancısı mı?', done: false },
  ];

  function toggleQ(id) {
    const updated = questions.map(q => q.id === id ? { ...q, done: !q.done } : q);
    update(old => ({
      lists: { ...(old.lists || {}), questions: updated },
    }));
  }

  function addQ() {
    if (!newQ.trim()) return;
    const item = { id: `q-${uid()}`, text: newQ.trim(), done: false };
    update(old => ({
      lists: { ...(old.lists || {}), questions: [item, ...(old.lists?.questions || questions)] },
    }));
    setNewQ('');
    toast && toast('Soru listeye eklendi');
  }

  return (
    <View style={ws.container}>
      <ScreenHero asset="card_ask_doctor"
        icon="chat"
        kicker="KONTROL HAZIRLIĞI"
        title="Randevuda unutma"
        body="Soruları açık, yanıtlananları kapalı tut; sonraki kontrol için gündemin kendiliğinden oluşsun."
        stat={`${questions.filter(q => !q.done).length} açık soru`}
        tint="#7C5C96"
      />

      <Card style={{ padding: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={ws.proNoteIcon}>
            <Icon name="chat" size={17} color={colors.purple} />
          </View>
          <View style={{ flex: 1 }}>
            <T bold style={{ fontSize: 15 }}>Randevu Soruları</T>
            <T style={{ fontSize: 12, color: colors.muted, marginTop: 2, lineHeight: 18 }}>
              {questions.filter(q => !q.done).length} açık soru · Muayene odasında aklından çıkabilecek başlıkları önceden sırala.
            </T>
          </View>
        </View>
      </Card>

      <View style={ws.inputRow}>
        <TextInput
          value={newQ}
          onChangeText={setNewQ}
          placeholder="Randevuda konuşmak istediğin soru..."
          placeholderTextColor={colors.muted}
          style={ws.input}
          onSubmitEditing={addQ}
        />
        <Tap onPress={addQ} label="Ekle" style={ws.addBtn}>
          <Icon name="plus" size={18} color="white" />
        </Tap>
      </View>

      <View style={{ gap: 8 }}>
        {questions.map(q => (
          <Tap
            key={q.id}
            onPress={() => toggleQ(q.id)}
            label={q.text}
            style={[ws.planCard, q.done && { backgroundColor: '#F8F5F8', opacity: 0.8 }]}
          >
            <View style={[ws.planCheck, q.done && ws.planCheckActive]}>
              {q.done && <Icon name="check" size={14} color="white" />}
            </View>
            <T style={[ws.checkText, q.done && { textDecorationLine: 'line-through', color: colors.muted }]}>
              {q.text}
            </T>
          </Tap>
        ))}
      </View>

      <InfoNote icon="check"
        title="Randevu sonrası kapat"
        body="Yanıt aldığın soruları işaretle; açık kalan konular bir sonraki kontrol için otomatik gündem gibi kalır."
      />
    </View>
  );
}

// ─── 7. BEBEK İSİMLERİ KÜTÜPHANESİ (BABY NAME MATCHER & DISCOVERY) ───────────
export function BabyNameMatcher({ state, update, toast }) {
  const [genderFilter, setGenderFilter] = useState('Tümü');
  const [themeFilter, setThemeFilter] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [randomPick, setRandomPick] = useState(null);
  const favNames = state.favNames || [];

  function toggleFav(id) {
    const exists = favNames.includes(id);
    const updated = exists ? favNames.filter(x => x !== id) : [...favNames, id];
    update({ favNames: updated });
    toast && toast(exists ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi 💛');
  }

  function pickRandom() {
    const pool = filtered.length ? filtered : babyNamesList;
    const randomIndex = Math.floor(Math.random() * pool.length);
    setRandomPick(pool[randomIndex]);
    toast && toast('Şanslı isim seçildi ✨');
  }

  // Filtreleme mantığı
  const filtered = babyNamesList.filter(n => {
    // Cinsiyet filtresi
    if (genderFilter !== 'Tümü' && n.gender !== genderFilter) return false;

    // Tema filtresi
    if (themeFilter === '💕 Ortak Eşleşmeler' && !n.partnerMatch) return false;
    if (themeFilter === '🌿 Doğa & Çiçek' && n.tag !== 'Doğa & Çiçek') return false;
    if (themeFilter === '🏛️ Tarihi & Göktürk' && n.tag !== 'Tarihi & Göktürk') return false;
    if (themeFilter === '✨ Modern & Kısa' && n.tag !== 'Modern & Kısa') return false;
    if (themeFilter === '📖 Kuran\'da Geçen' && !n.quran) return false;

    // Arama sorgusu
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = n.name.toLowerCase().includes(q);
      const matchMeaning = n.meaning.toLowerCase().includes(q);
      const matchOrigin = n.origin.toLowerCase().includes(q);
      if (!matchName && !matchMeaning && !matchOrigin) return false;
    }

    return true;
  });

  const partnerMatchesCount = babyNamesList.filter(n => n.partnerMatch).length;
  const originCount = Array.isArray(nameOrigins) ? nameOrigins.length : 0;

  return (
    <View style={ws.container}>
      <ScreenHero asset="baby"
        icon="heart"
        kicker="İSİM KEŞFİ"
        title="Anlam, köken ve favoriler"
        body="Filtrele, eşinle ortakları gör, beğendiklerini kısa listeye al."
        stat={`${favNames.length} favori`}
        tint="#9B4E76"
      />

      {/* İstatistik & Bilgi Kartı */}
      <Card style={{ padding: 14, backgroundColor: '#FAF6FA', borderColor: '#EFE5F0' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <T bold style={{ fontSize: 16, color: colors.purple }}>Bebek İsim Kütüphanesi</T>
            <T style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
              {babyNamesList.length} Seçkin İsim · {favNames.length} Favorin · 💕 {partnerMatchesCount} Eşinle Ortak
            </T>
          </View>
          <Tap onPress={pickRandom} label="Şanslı İsim" style={{ backgroundColor: '#F0E5F2', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <T style={{ fontSize: 13 }}>🎲</T>
            <T bold style={{ fontSize: 11, color: colors.purple }}>Şanslı İsim</T>
          </Tap>
        </View>

        {/* Rastgele Seçim Bildirimi */}
        {randomPick && (
          <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderColor: '#EAE0ED', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <T bold style={{ fontSize: 14, color: colors.purple }}>✨ Şanslı Öneri: {randomPick.name} ({randomPick.gender})</T>
              <T style={{ fontSize: 11, color: '#6A5670', marginTop: 2 }}>{randomPick.meaning}</T>
            </View>
            <Tap onPress={() => toggleFav(randomPick.id)} style={{ padding: 6 }}>
              <Icon name="heart" size={18} color={favNames.includes(randomPick.id) ? '#C55B77' : colors.muted} fill={favNames.includes(randomPick.id) ? '#C55B77' : 'none'} />
            </Tap>
          </View>
        )}
      </Card>

      <View style={ws.nameStatsRow}>
        <View style={ws.nameStat}>
          <T bold style={ws.nameStatNum}>{filtered.length}</T>
          <T style={ws.nameStatLabel}>sonuç</T>
        </View>
        <View style={ws.nameStat}>
          <T bold style={ws.nameStatNum}>{originCount}</T>
          <T style={ws.nameStatLabel}>köken</T>
        </View>
        <View style={ws.nameStat}>
          <T bold style={ws.nameStatNum}>{favNames.length}</T>
          <T style={ws.nameStatLabel}>favori</T>
        </View>
      </View>

      {/* Arama Çubuğu */}
      <View style={ws.inputRow}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="İsim, anlam veya kökene göre ara..."
          placeholderTextColor={colors.muted}
          style={ws.input}
        />
        {searchQuery ? (
          <Tap onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
            <T style={{ fontSize: 13, color: colors.muted }}>✕</T>
          </Tap>
        ) : null}
      </View>

      {/* Cinsiyet Filtresi */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {['Tümü', 'Kız', 'Erkek', 'Üniseks'].map(g => (
          <Tap
            key={g}
            onPress={() => setGenderFilter(g)}
            label={g}
            style={[ws.filterPill, genderFilter === g && ws.filterPillActive]}
          >
            <T bold={genderFilter === g} style={{ fontSize: 12, color: genderFilter === g ? 'white' : colors.ink }}>
              {g === 'Kız' ? '👧 Kız' : g === 'Erkek' ? '👦 Erkek' : g === 'Üniseks' ? '🤍 Üniseks' : 'Tümü'}
            </T>
          </Tap>
        ))}
      </View>

      {/* Tema & Kategori Rozetleri */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
        {nameThemes.map(t => (
          <Tap
            key={t}
            onPress={() => setThemeFilter(t)}
            label={t}
            style={[ws.themePill, themeFilter === t && ws.themePillActive]}
          >
            <T bold={themeFilter === t} style={{ fontSize: 11, color: themeFilter === t ? colors.purple : colors.muted }}>
              {t}
            </T>
          </Tap>
        ))}
      </ScrollView>

      {/* İsim Kartları Listesi */}
      <View style={{ gap: 10 }}>
        {filtered.length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <T style={{ fontSize: 14, color: colors.muted, textAlign: 'center' }}>
              Aramana uygun isim bulunamadı. Filtreleri sıfırlayabilir veya farklı bir harf deneyebilirsin.
            </T>
          </Card>
        ) : (
          filtered.map(n => {
            const isFav = favNames.includes(n.id);
            return (
              <Card key={n.id} style={ws.nameCard}>
                <View style={{ flex: 1 }}>
                  {/* İsim, Cinsiyet ve Eşleşme Rozeti */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <T bold style={{ fontSize: 18, color: colors.ink }}>{n.name}</T>
                    
                    <View style={[ws.genderBadge, n.gender === 'Kız' ? { backgroundColor: '#FBEBF2' } : n.gender === 'Erkek' ? { backgroundColor: '#EBF3FB' } : { backgroundColor: '#F0EEF5' }]}>
                      <T style={{ fontSize: 10, color: n.gender === 'Kız' ? '#B84570' : n.gender === 'Erkek' ? '#3B72A4' : '#6A5C78' }}>
                        {n.gender}
                      </T>
                    </View>

                    {n.partnerMatch && (
                      <View style={ws.matchBadge}>
                        <T style={{ fontSize: 10, color: '#9B3F63' }}>💕 Eşinle Ortak</T>
                      </View>
                    )}

                    {n.quran && (
                      <View style={[ws.matchBadge, { backgroundColor: '#EBF4ED' }]}>
                        <T style={{ fontSize: 9, color: '#3E7D52' }}>📖 Kuran'da Geçen</T>
                      </View>
                    )}
                  </View>

                  {/* Anlam */}
                  <T style={{ fontSize: 13, color: '#554A58', marginTop: 5, lineHeight: 18 }}>{n.meaning}</T>
                  
                  {/* Köken & Etiket */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
                    <T style={{ fontSize: 11, color: colors.muted }}>Köken: {n.origin}</T>
                    <T style={{ fontSize: 11, color: '#88708E' }}>• {n.tag}</T>
                    <T style={{ fontSize: 11, color: '#88708E' }}>• {n.popularity}</T>
                  </View>
                </View>

                {/* Kalp Butonu */}
                <Tap onPress={() => toggleFav(n.id)} label="Favoriye al" style={ws.favBtn}>
                  <Icon name="heart" size={24} color={isFav ? '#C55B77' : '#BFAEC2'} fill={isFav ? '#C55B77' : 'none'} />
                </Tap>
              </Card>
            );
          })
        )}
      </View>
    </View>
  );
}

const ws = StyleSheet.create({
  container: { gap: 14, paddingBottom: 20 },
  proNoteIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFFDFA', alignItems: 'center', justifyContent: 'center' },
  summaryCard: { padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 11, letterSpacing: 1.5, color: colors.muted },
  weightNum: { fontSize: 32, color: colors.ink, marginTop: 2 },
  gainPill: { alignItems: 'flex-end', backgroundColor: '#EAF4EF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  corridorBox: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderColor: colors.line },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: { flex: 1, height: 46, borderRadius: 16, borderWidth: 1, borderColor: '#DDD3DF', paddingHorizontal: 14, backgroundColor: '#FFFDFA', fontSize: 14, color: colors.ink },
  addBtn: { paddingHorizontal: 16, height: 46, borderRadius: 16, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.line },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#F3EAF5' },
  scoreRing: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#F3EAF5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E3D4E7' },
  planCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: '#FFFDFA', borderWidth: 1, borderColor: '#F0EAE6', ...shadow },
  planCardActive: { borderColor: colors.purple, backgroundColor: '#FAF6FB' },
  planCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#C8BAC9', alignItems: 'center', justifyContent: 'center' },
  planCheckActive: { backgroundColor: colors.purple, borderColor: colors.purple },
  checkText: { flex: 1, fontSize: 13, color: colors.ink },
  filterPill: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#EFEAEF' },
  filterPillActive: { backgroundColor: colors.purple },
  themePill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#FAF4FA', borderWidth: 1, borderColor: '#EBDDEB' },
  themePillActive: { backgroundColor: '#F0E2F1', borderColor: colors.purple },
  matchBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: '#FCEEF3' },
  nameStatsRow: { flexDirection: 'row', gap: 8 },
  nameStat: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 18, backgroundColor: '#FFFDFA', borderWidth: 1, borderColor: '#F0EAE6', ...shadow },
  nameStatNum: { fontSize: 17, color: colors.purple },
  nameStatLabel: { fontSize: 11, color: colors.muted, marginTop: 2 },
  nameCard: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  genderBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: '#EFE5F3' },
  favBtn: { padding: 8 },
});
