import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section, Progress, ScreenHero, InfoNote, MetricCard, StatusCard, ProgressRing } from './ui';
import { uid, localDay } from './domain.mjs';
import { babyNamesList, nameThemes, nameOrigins } from './babyNamesData';

// ─── 4. KİLO TAKİBİ (WEIGHT TRACKER) ─────────────────────────────────────────
export function WeightTracker({ state, update, toast }) {
  const [weightInput, setWeightInput] = useState('');
  const weights = state.weights || [];
  const startWeight = state.startWeight || 60.0;
  const currentWeight = weights[0]?.value || startWeight;
  const totalGained = (currentWeight - startWeight).toFixed(1);

  // Haftaya göre kişisel kilo eğrisi
  const week = state.week || 24;
  const minExpectedGain = Math.max(0, ((week - 12) * 0.35)).toFixed(1);
  const maxExpectedGain = Math.max(0.5, ((week - 12) * 0.50 + 2.0)).toFixed(1);

  function logWeight(customVal) {
    const val = typeof customVal === 'number' ? customVal : parseFloat(weightInput.replace(',', '.'));
    if (isNaN(val) || val < 30 || val > 200) {
      toast && toast('Lütfen geçerli bir kilo girin. Örn: 65.5');
      return;
    }
    const newEntry = {
      id: uid(),
      value: parseFloat(val.toFixed(1)),
      week: state.week || 24,
      date: localDay(),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };
    update(old => ({
      weights: [newEntry, ...(old.weights || [])],
    }));
    setWeightInput('');
    toast && toast(`⚖️ Kilo kaydedildi: ${val.toFixed(1)} kg`);
  }

  function adjustQuick(delta) {
    const nextVal = currentWeight + delta;
    logWeight(nextVal);
  }

  const isGainInRange = totalGained >= minExpectedGain && totalGained <= maxExpectedGain;

  return (
    <View style={ws.container}>
      <ScreenHero
        asset="card_scale"
        icon="scale"
        kicker="HAFTALIK KİLO TAKİBİ"
        title="Gestasyonel Kilo Paneli"
        body="IOM ve DSÖ gebelik koridoruna göre kilo eğrinizi takip edin. Ölçümleri aynı saatte ve benzer kıyafetle yapın."
        stat={`${weights.length} ölçüm`}
        tint="#4F8464"
      />

      {/* İkili Metrik Kartları */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <MetricCard
          title="GÜNCEL KİLO"
          value={`${currentWeight}`}
          unit="kg"
          subtext={`Başlangıç: ${startWeight} kg`}
          icon="scale"
          tint="#4F8464"
        />
        <MetricCard
          title="TOPLAM DEĞİŞİM"
          value={totalGained >= 0 ? `+${totalGained}` : `${totalGained}`}
          unit="kg"
          subtext={isGainInRange ? "İdeal takip koridorunda" : "Kişisel eğilim"}
          icon="milestone"
          tint="#844E86"
        />
      </View>

      {/* IOM Kılavuz Kartı */}
      <StatusCard
        level={isGainInRange ? "safe" : "warning"}
        title={`${week}. Hafta Önerilen Kilo Bandı: +${minExpectedGain} kg ile +${maxExpectedGain} kg`}
        body={isGainInRange
          ? "Harika gidiyorsunuz! Kilo artışınız gebelik haftanıza göre uluslararası standart bantta ilerliyor."
          : "Kilo artışı haftalık eğilimle değerlendirilir. Ani ödem veya endişeniz olursa doktor kontrolünüzde danışın."
        }
        icon="sparkle"
      />

      {/* Hızlı Kilo Ekleme & Dokunmatik Butonlar */}
      <Card style={{ padding: 14 }}>
        <T bold style={{ fontSize: 13, color: colors.ink, marginBottom: 8 }}>Hızlı Kilo Kaydet:</T>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          {[-0.5, +0.2, +0.5, +1.0].map(delta => (
            <Tap
              key={delta}
              onPress={() => adjustQuick(delta)}
              style={[ws.stepBtn, { backgroundColor: delta > 0 ? '#F3F8F5' : '#FAF4F4' }]}
            >
              <T bold style={{ fontSize: 12, color: delta > 0 ? '#377E55' : '#994444' }}>
                {delta > 0 ? `+${delta}` : delta} kg
              </T>
            </Tap>
          ))}
        </View>

        <View style={ws.inputRow}>
          <TextInput
            value={weightInput}
            onChangeText={setWeightInput}
            placeholder={`Güncel kilonuz (Örn: ${currentWeight})`}
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            style={ws.input}
            onSubmitEditing={() => logWeight()}
          />
          <Tap onPress={() => logWeight()} label="Kaydet" style={ws.addBtn}>
            <T bold style={{ color: 'white', fontSize: 13.5 }}>Kaydet</T>
          </Tap>
        </View>
      </Card>

      {/* Geçmiş Kilo Kayıtları */}
      <Section title="Kilo Ölçüm Geçmişi" />
      {weights.length === 0 ? (
        <Card style={{ padding: 18, alignItems: 'center' }}>
          <T bold style={{ color: colors.ink, fontSize: 14 }}>İlk ölçümü ekleyin</T>
          <T style={{ color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
            Benzer saatlerde ve aç karnına tartılmak eğilimi daha güvenilir gösterir.
          </T>
        </Card>
      ) : (
        weights.map(w => {
          const diff = (w.value - startWeight).toFixed(1);
          return (
            <View key={w.id} style={ws.historyRow}>
              <View>
                <T bold style={{ fontSize: 15 }}>{w.value} kg</T>
                <T style={{ fontSize: 11, color: colors.muted }}>{w.date} · {w.week}. Hafta</T>
              </View>
              <View style={[ws.badge, { backgroundColor: '#EFF7F2' }]}>
                <T bold style={{ fontSize: 12, color: '#3E7B54' }}>
                  {diff >= 0 ? `+${diff}` : diff} kg
                </T>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

// ─── 5. DOĞUM PLANI (BIRTH PLAN BUILDER) ──────────────────────────────────────
const defaultBirthPlanOptions = [
  { id: 'bp1', cat: 'Doğum Ortamı', title: 'Loş ve sakin ışıklandırma', desc: 'Rahatlatıcı, loş ve huzurlu bir oda atmosferi' },
  { id: 'bp2', cat: 'Doğum Ortamı', title: 'Sakinleştirici arka plan müziği', desc: 'Kendi hazırladığım gevşeme ve dalga çalma listesi' },
  { id: 'bp3', cat: 'Doğum Ortamı', title: 'Serbest hareket & pilates topu', desc: 'Yatakta sabit kalmak yerine dikey ve aktif pozisyonlar' },
  { id: 'bp4', cat: 'Ağrı Yönetimi', title: 'Doğal nefes ve gevşeme teknikleri', desc: 'İlaçsız rahatlama ve derin nefes döngüleri' },
  { id: 'bp5', cat: 'Ağrı Yönetimi', title: 'Gerektiğinde epidural anestezi', desc: 'Ağrı eşiğim zorlandığında epidural opsiyonunun hazır olması' },
  { id: 'bp6', cat: 'Bebek Doğunca', title: 'İlk saat Ten Tene Temas', desc: 'Kordon kesildikten sonra hemen anne göğsüne verilmesi' },
  { id: 'bp7', cat: 'Bebek Doğunca', title: 'Geç kordon klempleme', desc: 'Kordon pulsasyonunun durması beklenerek (1-3 dk) klemplenmesi' },
  { id: 'bp8', cat: 'Bebek Doğunca', title: 'İlk saat kolostrum ile emzirme', desc: 'Altın saatte anne sütüyle ilk bağın kurulması' },
];

const birthPlanCategories = ['Tümü', 'Doğum Ortamı', 'Ağrı Yönetimi', 'Bebek Doğunca'];

export function BirthPlanBuilder({ state, update, toast }) {
  const plan = state.birthPlan || {};
  const [selectedCat, setSelectedCat] = useState('Tümü');
  const [showDoctorSheet, setShowDoctorSheet] = useState(false);

  function toggleOption(id) {
    const nextVal = !plan[id];
    update(old => ({
      birthPlan: { ...(old.birthPlan || {}), [id]: nextVal },
    }));
  }

  const selectedCount = Object.values(plan).filter(Boolean).length;
  const totalOptions = defaultBirthPlanOptions.length;
  const planPercent = Math.round((selectedCount / totalOptions) * 100);

  const filteredOptions = selectedCat === 'Tümü'
    ? defaultBirthPlanOptions
    : defaultBirthPlanOptions.filter(o => o.cat === selectedCat);

  const selectedList = defaultBirthPlanOptions.filter(o => plan[o.id]);

  return (
    <View style={ws.container}>
      <ScreenHero asset="card_health_report"
        icon="book"
        kicker="DOĞUM HAZIRLIĞI"
        title="Tercihlerini tek sayfada topla"
        body="Ortam, ağrı kontrolü ve ilk temas tercihlerini sade, paylaşılabilir bir plana dönüştür."
        stat={`${selectedCount}/${totalOptions} tercih`}
        tint="#946635"
      />

      {/* İlerleme & İstatistik Kartı */}
      <Card style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <T bold style={{ fontSize: 16, color: colors.ink }}>Doğum Tercih Özeti</T>
            <T style={{ fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 18 }}>
              {selectedCount === totalOptions
                ? 'Tüm temel tercihler belirlendi. Muayenede doktorunla inceleyebilirsin.'
                : `${totalOptions - selectedCount} başlık henüz seçilmedi. Doğum ekibin için rehber hazırla.`}
            </T>
            <Tap
              onPress={() => setShowDoctorSheet(!showDoctorSheet)}
              label="Doktora Sunum Özeti"
              style={[ws.presentationBtn, showDoctorSheet && { backgroundColor: '#EADCEE' }]}
            >
              <Icon name="clipboard" size={14} color={colors.purple} />
              <T bold style={{ fontSize: 11, color: colors.purple }}>
                {showDoctorSheet ? 'Düzenleme Moduna Dön' : '📋 Doktora Göster Modu'}
              </T>
            </Tap>
          </View>
          <ProgressRing
            size={74}
            strokeWidth={7}
            progress={planPercent}
            color={colors.purple}
            trackColor="#F0E5F2"
          >
            <T bold style={{ fontSize: 15, color: colors.purple }}>%{planPercent}</T>
            <T style={{ fontSize: 9, color: colors.muted }}>hazır</T>
          </ProgressRing>
        </View>
      </Card>

      {/* Doktora Göster / Klinik Sunum Modu */}
      {showDoctorSheet ? (
        <Card style={ws.clinicalSheet}>
          <View style={ws.clinicalHeader}>
            <View>
              <T bold style={{ fontSize: 16, color: '#2C3E50' }}>MOMORA DOĞUM TERCİH FORMU</T>
              <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                Anne Adayı: {state.user?.name || 'Momora Annesi'} · {state.week || 24}. Gebelik Haftası
              </T>
            </View>
            <View style={ws.clinicalBadge}>
              <T bold style={{ fontSize: 10, color: '#3E7B54' }}>ÖZET BELGE</T>
            </View>
          </View>

          {selectedList.length === 0 ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <T style={{ fontSize: 13, color: colors.muted }}>Henüz bir tercih seçilmedi.</T>
            </View>
          ) : (
            <View style={{ gap: 12, marginTop: 8 }}>
              {selectedList.map((item, idx) => (
                <View key={item.id} style={ws.clinicalItem}>
                  <T bold style={{ fontSize: 13, color: colors.purple }}>{idx + 1}. [{item.cat}]</T>
                  <T bold style={{ fontSize: 13, color: colors.ink, marginTop: 2 }}>{item.title}</T>
                  <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{item.desc}</T>
                </View>
              ))}
            </View>
          )}

          <T style={ws.clinicalFooter}>
            * Bu plan acil klinik gereksinimler ve doktor tavsiyeleri doğrultusunda esneklik göstermek üzere hazırlanmıştır.
          </T>
        </Card>
      ) : (
        <>
          <StatusCard
            level="info"
            icon="info"
            title="Klinik Esneklik İlkesi"
            description="Doğum planı bir talimatname değil, annenin konforunu ve ekiple iletişimi güçlendiren esnek bir rehberdir."
          />

          {/* Kategori Sekmeleri */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
            {birthPlanCategories.map(cat => (
              <Tap
                key={cat}
                onPress={() => setSelectedCat(cat)}
                label={cat}
                style={[ws.filterPill, selectedCat === cat && ws.filterPillActive]}
              >
                <T bold={selectedCat === cat} style={{ fontSize: 12, color: selectedCat === cat ? 'white' : colors.ink }}>
                  {cat}
                </T>
              </Tap>
            ))}
          </ScrollView>

          {/* Tercih Maddeleri */}
          <View style={{ gap: 10 }}>
            {filteredOptions.map(opt => {
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <T bold style={{ fontSize: 14, color: isSelected ? colors.purple : colors.ink }}>
                        {opt.title}
                      </T>
                      <View style={[ws.catChip, isSelected && { backgroundColor: '#F0E3F3' }]}>
                        <T style={{ fontSize: 9, color: isSelected ? colors.purple : colors.muted }}>{opt.cat}</T>
                      </View>
                    </View>
                    <T style={{ fontSize: 11, color: colors.muted, marginTop: 3 }}>{opt.desc}</T>
                  </View>
                </Tap>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

// ─── 6. DOKTORA SORULAR (DOCTOR QUESTIONS) ───────────────────────────────────
const suggestedTrimesterQuestions = [
  { text: '24-28. hafta Şeker Yükleme (OGTT) testi için doğru zaman nedir?', tag: 'Tahlil' },
  { text: 'Kan uyuşmazlığı iğnesi (Anti-D) bu kontrolde yapılacak mı?', tag: 'Aşı/İlaç' },
  { text: 'Gece krampları için magnezyum dozu yeterli mi?', tag: 'Semptom' },
  { text: 'Bebek hareketleri gün içinde nasıl takip edilmeli?', tag: 'Hareket' },
  { text: 'Doğum pozisyonu ve plasenta yerleşimi ne durumda?', tag: 'Ultrason' },
];

export function DoctorQuestions({ state, update, toast }) {
  const [newQ, setNewQ] = useState('');
  const [readingMode, setReadingMode] = useState(false);
  const questions = state.lists?.questions || [
    { id: 'dq1', text: 'Bu hafta demir veya vitamin takviyelerimi artırmalı mıyım?', done: false },
    { id: 'dq2', text: 'Yolculuk veya seyahat için hekim onayı raporu almalı mıyım?', done: false },
    { id: 'dq3', text: 'Hissedilen kasılmalar Braxton Hicks mi yoksa servikal açılma mı?', done: false },
  ];

  function toggleQ(id) {
    const updated = questions.map(q => q.id === id ? { ...q, done: !q.done } : q);
    update(old => ({
      lists: { ...(old.lists || {}), questions: updated },
    }));
  }

  function addQ(textToAdd) {
    const text = typeof textToAdd === 'string' ? textToAdd : newQ;
    if (!text.trim()) return;
    const item = { id: `q-${uid()}`, text: text.trim(), done: false };
    update(old => ({
      lists: { ...(old.lists || {}), questions: [item, ...(old.lists?.questions || questions)] },
    }));
    if (typeof textToAdd !== 'string') setNewQ('');
    toast && toast('Soru listeye eklendi');
  }

  const openCount = questions.filter(q => !q.done).length;
  const answeredCount = questions.filter(q => q.done).length;

  return (
    <View style={ws.container}>
      <ScreenHero asset="card_ask_doctor"
        icon="chat"
        kicker="KONTROL HAZIRLIĞI"
        title="Randevuda unutma"
        body="Soruları açık, yanıtlananları kapalı tut; sonraki muayene için gündemin eksiksiz olsun."
        stat={`${openCount} açık soru`}
        tint="#7C5C96"
      />

      {/* Metrik Göstergeleri */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <MetricCard
          title="AÇIK SORULAR"
          value={openCount}
          unit="adet"
          subtext="Muayenede sorulacak"
          icon="chat"
        />
        <MetricCard
          title="YANITLANANLAR"
          value={answeredCount}
          unit="tamamlandı"
          subtext="Önceki kontrollerde"
          icon="check"
        />
      </View>

      {/* Muayene Odası Okuma Modu Butonu */}
      <Card style={{ padding: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <T bold style={{ fontSize: 14 }}>Muayene Odası Okuma Modu</T>
            <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
              Doktora gösterirken büyük puntolu, yüksek kontrastlı ekran açar.
            </T>
          </View>
          <Tap
            onPress={() => setReadingMode(!readingMode)}
            label="Mod Değiştir"
            style={[ws.modeToggle, readingMode && { backgroundColor: colors.purple }]}
          >
            <T bold style={{ fontSize: 11, color: readingMode ? 'white' : colors.purple }}>
              {readingMode ? 'Standart Mod' : '🔍 Büyük Görünüm'}
            </T>
          </Tap>
        </View>
      </Card>

      {readingMode ? (
        /* Yüksek Kontrastlı Muayene Okuma Kartı */
        <Card style={ws.readingCard}>
          <T bold style={{ fontSize: 18, color: '#1B2A4A', marginBottom: 14 }}>
            📋 Doktoruma Sorulacaklar ({openCount})
          </T>
          {openCount === 0 ? (
            <T style={{ fontSize: 16, color: colors.muted, textAlign: 'center', paddingVertical: 20 }}>
              Şu an bekleyen açık soru bulunmuyor.
            </T>
          ) : (
            questions.filter(q => !q.done).map((q, idx) => (
              <View key={q.id} style={ws.readingItem}>
                <View style={ws.readingBadge}>
                  <T bold style={{ fontSize: 13, color: 'white' }}>{idx + 1}</T>
                </View>
                <T bold style={{ flex: 1, fontSize: 16, color: '#1A1824', lineHeight: 24 }}>
                  {q.text}
                </T>
              </View>
            ))
          )}
        </Card>
      ) : (
        <>
          {/* Yeni Soru Ekleme Alanı */}
          <View style={ws.inputRow}>
            <TextInput
              value={newQ}
              onChangeText={setNewQ}
              placeholder="Randevuda konuşmak istediğin soru..."
              placeholderTextColor={colors.muted}
              style={ws.input}
              onSubmitEditing={() => addQ()}
            />
            <Tap onPress={() => addQ()} label="Ekle" style={ws.addBtn}>
              <Icon name="plus" size={18} color="white" />
            </Tap>
          </View>

          {/* Haftaya Özel Önerilen Sorular */}
          <View style={{ gap: 8 }}>
            <T bold style={{ fontSize: 12, color: colors.muted, letterSpacing: 0.5 }}>
              💡 BU HAFTA İÇİN ÖNERİLEN MEDİKAL SORULAR
            </T>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
              {suggestedTrimesterQuestions.map((s, idx) => (
                <Tap
                  key={idx}
                  onPress={() => addQ(s.text)}
                  label={s.text}
                  style={ws.suggestedPill}
                >
                  <View style={ws.suggestedTag}>
                    <T style={{ fontSize: 9, color: colors.purple }}>{s.tag}</T>
                  </View>
                  <T numberOfLines={1} style={{ fontSize: 12, color: colors.ink, maxWidth: 220 }}>
                    {s.text}
                  </T>
                  <Icon name="plus" size={12} color={colors.purple} />
                </Tap>
              ))}
            </ScrollView>
          </View>

          {/* Soru Listesi */}
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

          <StatusCard
            level="safe"
            icon="check"
            title="Randevu Sonrası Tamamla"
            description="Doktorundan yanıt aldığın maddelerin üzerini tıkla; sonraki kontrol için otomatik olarak güncel kalır."
          />
        </>
      )}
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

      {/* Metrik Göstergeleri */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <MetricCard
          title="KÜTÜPHANE"
          value={babyNamesList.length}
          unit="seçkin isim"
          subtext="Anlam & kökenli"
          icon="sparkles"
        />
        <MetricCard
          title="EŞİMLE ORTAK"
          value={partnerMatchesCount}
          unit="eşleşme"
          subtext="İkinizin de beğendiği"
          icon="heart"
        />
      </View>

      {/* İstatistik & Bilgi Kartı */}
      <Card style={{ padding: 14, backgroundColor: '#FAF6FA', borderColor: '#EFE5F0' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <T bold style={{ fontSize: 15, color: colors.purple }}>Günün Şanslı İsmi</T>
            <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
              Karar vermekte zorlanıyorsan kütüphaneden rastgele bir ilham al.
            </T>
          </View>
          <Tap onPress={pickRandom} label="Şanslı İsim" style={{ backgroundColor: '#F0E5F2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <T style={{ fontSize: 14 }}>🎲</T>
            <T bold style={{ fontSize: 11, color: colors.purple }}>Rastgele Seç</T>
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

  // Luxury upgrades
  presentationBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, backgroundColor: '#F5ECF7', alignSelf: 'flex-start' },
  clinicalSheet: { padding: 18, backgroundColor: '#FAFAF9', borderWidth: 1.5, borderColor: '#D7D2CF' },
  clinicalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1.5, borderColor: '#E3DFDC', paddingBottom: 12, marginBottom: 12 },
  clinicalBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#E8F3EB' },
  clinicalItem: { paddingBottom: 10, borderBottomWidth: 1, borderColor: '#EFECE9' },
  clinicalFooter: { fontSize: 10, color: colors.muted, fontStyle: 'italic', marginTop: 14, lineHeight: 14 },
  catChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: '#F4EFF5' },
  modeToggle: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, backgroundColor: '#F5ECF7' },
  readingCard: { padding: 18, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: colors.purple },
  readingItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F0EAE6' },
  readingBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  suggestedPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: '#F9F4F9', borderWidth: 1, borderColor: '#EFE3F0' },
  suggestedTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: '#EFE2F1' },
});
