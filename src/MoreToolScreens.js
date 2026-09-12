import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section, Progress } from './ui';
import { uid, localDay } from './domain.mjs';

// ─── 4. KİLO TAKİBİ (WEIGHT TRACKER) ─────────────────────────────────────────
export function WeightTracker({ state, update, toast }) {
  const [weightInput, setWeightInput] = useState('');
  const weights = state.weights || [];
  const startWeight = state.startWeight || 60.0;
  const currentWeight = weights[0]?.value || startWeight;
  const totalGained = (currentWeight - startWeight).toFixed(1);

  // Haftaya göre ideal kilo artışı (IOM standartları: ortalama 0.35 - 0.45 kg / hafta)
  const week = state.week || 24;
  const minExpectedGain = Math.max(0, ((week - 12) * 0.35)).toFixed(1);
  const maxExpectedGain = Math.max(0.5, ((week - 12) * 0.50 + 2.0)).toFixed(1);

  function logWeight() {
    const val = parseFloat(weightInput.replace(',', '.'));
    if (isNaN(val) || val < 30 || val > 200) {
      toast && toast('Lütfen geçerli bir kilo girin (Örn: 65.5)');
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
            {week}. Hafta İdeal Artış Koridoru:
          </T>
          <T style={{ fontSize: 12, color: colors.ink, marginTop: 2 }}>
            +{minExpectedGain} kg ile +{maxExpectedGain} kg arası (IOM Sağlık Standardı)
          </T>
        </View>
      </Card>

      {/* Yeni Kilo Girişi */}
      <View style={ws.inputRow}>
        <TextInput
          value={weightInput}
          onChangeText={setWeightInput}
          placeholder="Bugünkü kilon (Örn: 66.2)"
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
          <T style={{ color: colors.muted, fontSize: 13 }}>Henüz kaydedilmiş kilo verisi yok.</T>
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
      <Card style={{ padding: 16 }}>
        <T bold style={{ fontSize: 16 }}>Doğum Tercihlerim</T>
        <T style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
          {selectedCount} tercih belirlendi · Doğum ekibiniz ve doktorunuzla paylaşabilirsiniz.
        </T>
      </Card>

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
      <Card style={{ padding: 14 }}>
        <T bold style={{ fontSize: 15 }}>Doktor Randevusu Hazırlığı</T>
        <T style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
          Muayene odasında aklınızdan çıkabilecek soruları önceden not edin.
        </T>
      </Card>

      <View style={ws.inputRow}>
        <TextInput
          value={newQ}
          onChangeText={setNewQ}
          placeholder="Doktorunuza sormak istediğiniz soru..."
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
    </View>
  );
}

// ─── 7. BEBEK İSİMLERİ (BABY NAME MATCHER) ───────────────────────────────────
const sampleNames = [
  { id: 'bn1', name: 'Mila', gender: 'Kız', origin: 'Slav', meaning: 'Sevgili, lütufkâr', votes: 420 },
  { id: 'bn2', name: 'Atlas', gender: 'Erkek', origin: 'Mitoloji', meaning: 'Gökyüzünü taşıyan, güçlü', votes: 512 },
  { id: 'bn3', name: 'Lina', gender: 'Kız', origin: 'Arapça', meaning: 'Hurma fidesi, yumuşak', votes: 389 },
  { id: 'bn4', name: 'Kaan', gender: 'Erkek', origin: 'Türkçe', meaning: 'Hükümdar, hanların hanı', votes: 450 },
  { id: 'bn5', name: 'Arya', gender: 'Üniseks', origin: 'Sanskritçe', meaning: 'Soylu, erdemli, ezgi', votes: 610 },
  { id: 'bn6', name: 'Deniz', gender: 'Üniseks', origin: 'Türkçe', meaning: 'Engin su kütlesi, ferahlık', votes: 540 },
];

export function BabyNameMatcher({ state, update, toast }) {
  const [filter, setFilter] = useState('Tümü');
  const favNames = state.favNames || [];

  function toggleFav(id) {
    const exists = favNames.includes(id);
    const updated = exists ? favNames.filter(x => x !== id) : [...favNames, id];
    update({ favNames: updated });
    toast && toast(exists ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi 💛');
  }

  const filtered = sampleNames.filter(n => filter === 'Tümü' || n.gender === filter);

  return (
    <View style={ws.container}>
      {/* Filtre Butonları */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {['Tümü', 'Kız', 'Erkek', 'Üniseks'].map(g => (
          <Tap
            key={g}
            onPress={() => setFilter(g)}
            label={g}
            style={[ws.filterPill, filter === g && ws.filterPillActive]}
          >
            <T bold={filter === g} style={{ fontSize: 12, color: filter === g ? 'white' : colors.ink }}>
              {g}
            </T>
          </Tap>
        ))}
      </View>

      <View style={{ gap: 10 }}>
        {filtered.map(n => {
          const isFav = favNames.includes(n.id);
          return (
            <Card key={n.id} style={ws.nameCard}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <T bold style={{ fontSize: 18, color: colors.ink }}>{n.name}</T>
                  <View style={ws.genderBadge}>
                    <T style={{ fontSize: 10, color: colors.purple }}>{n.gender}</T>
                  </View>
                </View>
                <T style={{ fontSize: 13, color: '#554A58', marginTop: 4 }}>{n.meaning}</T>
                <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>Köken: {n.origin}</T>
              </View>
              <Tap onPress={() => toggleFav(n.id)} label="Favoriye al" style={ws.favBtn}>
                <Icon name="heart" size={22} color={isFav ? '#C55B77' : colors.muted} fill={isFav ? '#C55B77' : 'none'} />
              </Tap>
            </Card>
          );
        })}
      </View>
    </View>
  );
}

const ws = StyleSheet.create({
  container: { gap: 14, paddingBottom: 20 },
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
  planCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: '#FFFDFA', borderWidth: 1, borderColor: '#F0EAE6', ...shadow },
  planCardActive: { borderColor: colors.purple, backgroundColor: '#FAF6FB' },
  planCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#C8BAC9', alignItems: 'center', justifyContent: 'center' },
  planCheckActive: { backgroundColor: colors.purple, borderColor: colors.purple },
  checkText: { flex: 1, fontSize: 13, color: colors.ink },
  filterPill: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#EFEAEF' },
  filterPillActive: { backgroundColor: colors.purple },
  nameCard: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  genderBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: '#EFE5F3' },
  favBtn: { padding: 8 },
});
