import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Animated, PanResponder, Dimensions, Platform } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section, Progress, ScreenHero, InfoNote, MetricCard, StatusCard, ProgressRing, ToolExperienceCard } from './ui';
import { uid, localDay } from './domain.mjs';
import { babyNamesList, nameThemes, nameOrigins, getLocalizedBabyName } from './babyNamesData';
import { speakText, isSpeaking, stopSpeech } from './speechService';

// ─── 4. KİLO TAKİBİ (SPEC 04_WEIGHT_TRACKER) ─────────────────────────────────
export function WeightTracker({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [weightInput, setWeightInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [showPreWeightEdit, setShowPreWeightEdit] = useState(false);
  const [preWeightInput, setPreWeightInput] = useState('');

  const weights = state.weights || [];
  const startWeight = Number(state.startWeight || 60.0);
  const currentWeight = Number(weights[0]?.value || startWeight);
  const totalGained = (currentWeight - startWeight).toFixed(1);
  const week = state.week || 24;

  // 4-week trend calculation
  const fourWeeksAgoEntry = weights.find(w => (w.week || 0) <= week - 4) || weights[weights.length - 1];
  const fourWeekChange = fourWeeksAgoEntry ? (currentWeight - Number(fourWeeksAgoEntry.value)).toFixed(1) : null;

  function logWeight() {
    const val = parseFloat(weightInput.replace(',', '.'));
    if (isNaN(val) || val < 30 || val > 220) {
      toast && toast(isEn ? 'Please enter a valid weight (e.g. 65.5)' : 'Lütfen geçerli bir kilo girin (örn. 65.5)');
      return;
    }
    const newEntry = {
      id: uid(),
      value: parseFloat(val.toFixed(1)),
      week: state.week || 24,
      date: localDay(),
      time: new Date().toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
      note: noteInput.trim(),
    };
    update(old => ({
      weights: [newEntry, ...(old.weights || [])],
    }));
    setWeightInput('');
    setNoteInput('');
    toast && toast(isEn ? `⚖️ Weight logged: ${val.toFixed(1)} kg` : `⚖️ Kilo kaydedildi: ${val.toFixed(1)} kg`);
  }

  function saveStartWeight() {
    const sw = parseFloat(preWeightInput.replace(',', '.'));
    if (!isNaN(sw) && sw > 30 && sw < 200) {
      update({ startWeight: parseFloat(sw.toFixed(1)) });
      setShowPreWeightEdit(false);
      toast && toast(isEn ? 'Pre-pregnancy baseline updated' : 'Gebelik öncesi başlangıç kilosu güncellendi');
    }
  }

  return (
    <View style={ws.container}>
      {/* 1. Hero: 65.4 kg, 24. hafta, Gebelik öncesine göre +5.4 kg (Spec 04_WEIGHT_TRACKER) */}
      <ScreenHero
        asset="ui_weight_bmi_gauge"
        icon="scale"
        kicker={isEn ? "WEEKLY WEIGHT TRACKER" : "HAFTALIK KİLO TAKİBİ"}
        title={isEn ? "Weight Curve & Trends" : "Kilo Eğrisi & Değişim"}
        body={isEn
          ? "Observe your personal weight progression throughout pregnancy with neutral weekly observations."
          : "Haftalık ölçümlerle kişisel kilo seyrinizi takip edin. Ölçümleri sabah aynı saatte ve benzer kıyafetle yapmak en tutarlı eğilimi sunar."}
        stat={`${weights.length} ${isEn ? 'entries' : 'ölçüm'}`}
        tint="#4F8464"
      />

      {/* İkili Metrik Kartları */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <MetricCard
          title={isEn ? "CURRENT WEIGHT" : "GÜNCEL KİLO"}
          value={`${currentWeight}`}
          unit="kg"
          subtext={isEn ? `Week ${week}` : `${week}. Hafta`}
          icon="scale"
          tint="#4F8464"
        />
        <MetricCard
          title={isEn ? "TOTAL CHANGE" : "TOPLAM DEĞİŞİM"}
          value={Number(totalGained) >= 0 ? `+${totalGained}` : `${totalGained}`}
          unit="kg"
          subtext={isEn ? `Baseline: ${startWeight} kg` : `Başlangıç: ${startWeight} kg`}
          icon="milestone"
          tint="#844E86"
        />
      </View>

      {/* Başlangıç Kilosu Ayar Satırı */}
      <Card style={{ padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F6FAF7' }}>
        <View>
          <T style={{ fontSize: 11, color: colors.muted }}>{isEn ? 'Pre-pregnancy weight:' : 'Gebelik öncesi kilo:'}</T>
          <T bold style={{ fontSize: 13, color: colors.ink }}>{startWeight} kg</T>
        </View>
        <Tap onPress={() => setShowPreWeightEdit(true)} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#E4EFE7' }}>
          <T bold style={{ fontSize: 11, color: '#317349' }}>{isEn ? 'Edit Baseline' : 'Başlangıcı Düzenle'}</T>
        </Tap>
      </Card>

      {/* Baseline Düzenleme Modalı */}
      <Modal visible={showPreWeightEdit} transparent animationType="fade" onRequestClose={() => setShowPreWeightEdit(false)}>
        <View style={ws.modalBackdrop}>
          <Card style={ws.modalCard}>
            <T bold style={{ fontSize: 16, color: colors.ink }}>{isEn ? 'Set Pre-Pregnancy Weight' : 'Gebelik Öncesi Kilonuzu Belirleyin'}</T>
            <T style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
              {isEn ? 'Used to compute overall pregnancy weight change.' : 'Toplam kilo değişimini doğru hesaplamak için kullanılır.'}
            </T>
            <TextInput
              value={preWeightInput}
              onChangeText={setPreWeightInput}
              keyboardType="decimal-pad"
              placeholder={`${startWeight}`}
              placeholderTextColor="#A396A6"
              style={[ws.weightInputBox, { marginTop: 12 }]}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Tap onPress={() => setShowPreWeightEdit(false)} style={[ws.modalActionBtn, { backgroundColor: '#EDE8E6' }]}>
                <T bold style={{ color: colors.ink }}>{isEn ? 'Cancel' : 'İptal'}</T>
              </Tap>
              <Tap onPress={saveStartWeight} style={[ws.modalActionBtn, { backgroundColor: '#317349', flex: 1 }]}>
                <T bold style={{ color: 'white' }}>{isEn ? 'Save' : 'Kaydet'}</T>
              </Tap>
            </View>
          </Card>
        </View>
      </Modal>

      {/* 2. TREND ÇİZELGESİ (X = HAFTA, Y = KİLO) */}
      <Card style={{ padding: 16 }}>
        <T bold style={{ fontSize: 14, color: colors.ink }}>{isEn ? 'Weekly Weight Trend' : 'Haftalık Kilo Eğilimi'}</T>
        <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 2, marginBottom: 12 }}>
          {isEn ? 'Neutral observational graph across pregnancy weeks' : 'Haftalara göre kilo ölçümlerinin seyri'}
        </T>

        {weights.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <T style={{ fontSize: 12.5, color: colors.muted }}>{isEn ? 'No weight records yet. Add your first log below.' : 'Henüz kilo kaydı yok. İlk ölçümünüzü aşağıdan ekleyin.'}</T>
          </View>
        ) : (
          <View style={{ height: 130, flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingVertical: 10 }}>
            {weights.slice(0, 8).reverse().map((w, idx) => {
              const diffFromBase = Math.max(0, w.value - (startWeight - 2));
              const barHeight = Math.min(100, Math.max(20, diffFromBase * 8));
              return (
                <View key={w.id || idx} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                  <T style={{ fontSize: 10, color: '#317349', fontWeight: '700' }}>{w.value}</T>
                  <View style={{ width: '80%', height: barHeight, backgroundColor: '#8DB89B', borderRadius: 6 }} />
                  <T style={{ fontSize: 9, color: colors.muted }}>{w.week ? `H.${w.week}` : ''}</T>
                </View>
              );
            })}
          </View>
        )}
      </Card>

      {/* 3. QUICK ADD (SPEC 04_WEIGHT_TRACKER) */}
      <Card style={{ padding: 16 }}>
        <T bold style={{ fontSize: 14, color: colors.ink, marginBottom: 10 }}>
          {isEn ? 'Log Current Weight:' : 'Yeni Kilo Ölçümü Ekle:'}
        </T>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <TextInput
            value={weightInput}
            onChangeText={setWeightInput}
            keyboardType="decimal-pad"
            placeholder={isEn ? `Weight in kg (e.g. ${currentWeight})` : `Kilo (Örn: ${currentWeight})`}
            placeholderTextColor="#A79AA7"
            style={[ws.weightInputBox, { flex: 1 }]}
          />
          <Tap onPress={logWeight} style={ws.addBtn}>
            <T bold style={{ color: 'white', fontSize: 14 }}>{isEn ? 'Save' : 'Kaydet'}</T>
          </Tap>
        </View>

        <TextInput
          value={noteInput}
          onChangeText={setNoteInput}
          placeholder={isEn ? 'Optional note (e.g. morning fasting, new shoes)...' : 'İsteğe bağlı not (örn. sabah aç karnına)...'}
          placeholderTextColor="#A79AA7"
          style={[ws.noteInputBox, { marginTop: 8 }]}
          maxLength={80}
        />
      </Card>

      {/* 4. TARAFIZ BİLGİLENDİRME (SPEC: NEUTRAL LANGUAGE, NO JUDGMENTAL WORDING) */}
      <StatusCard
        level="info"
        title={isEn ? "Weight Insight & Care Team Guidance" : "Kilo Eğilimi & Bilgilendirme"}
        body={isEn
          ? "Weight gain varies across individuals depending on pre-pregnancy physiology, genetics, and hydration. If you experience sudden dramatic swelling or have questions, discuss your individual curve with your obstetrician."
          : "Gebelikte kilo artışı metabolizma, sıvı tutulumu ve kişisel anatomiye bağlı olarak değişkenlik gösterir. Ani ve beklenmedik ödem veya sorularınız olduğunda doktorunuzun size özel değerlendirmesini izleyin."}
        icon="scale"
      />

      {/* Ölçüm Geçmişi */}
      <Section title={isEn ? "Weight History" : "Ölçüm Geçmişi"} />
      {weights.length === 0 ? (
        <Card style={{ alignItems: 'center', padding: 20 }}>
          <T style={{ color: colors.muted, fontSize: 13 }}>{isEn ? "No measurements logged yet." : "Henüz ölçüm kaydedilmedi."}</T>
        </Card>
      ) : (
        weights.map(w => {
          const diff = (w.value - startWeight).toFixed(1);
          return (
            <Card key={w.id} style={ws.historyCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <T bold style={{ fontSize: 15, color: colors.ink }}>{w.value} kg</T>
                  <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                    {w.date} · {w.time} {w.week ? `· ${w.week}. Hafta` : ''} {w.note ? `· ${w.note}` : ''}
                  </T>
                </View>
                <T bold style={{ fontSize: 13, color: Number(diff) >= 0 ? '#317349' : '#8A4E7A' }}>
                  {Number(diff) >= 0 ? `+${diff} kg` : `${diff} kg`}
                </T>
              </View>
            </Card>
          );
        })
      )}
    </View>
  );
}

// ─── 5. DOĞUM PLANI (8-SECTION GUIDED BUILDER PER SPEC 09_BIRTH_PREFERENCES) ───
export function BirthPlanBuilder({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const plan = state.birthPlan || {};
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [showSummarySheet, setShowSummarySheet] = useState(false);

  // 8 Sections strictly per spec 09_BIRTH_PREFERENCES.md
  const sections = isEn ? [
    {
      id: 'env',
      title: '1. Birth Environment',
      icon: 'star',
      desc: 'Lighting, music, and support team present in the birth room',
      options: [
        { id: 'bp_dim_lights', title: 'Dim and calm lighting', desc: 'Soft warm room atmosphere during labor' },
        { id: 'bp_playlist', title: 'Personal soothing playlist', desc: 'Play relaxation music or nature sounds freely' },
        { id: 'bp_partner_presence', title: 'Partner present at all times', desc: 'Continuous physical and emotional birth companion support' },
      ],
    },
    {
      id: 'movement',
      title: '2. Movement & Positions',
      icon: 'footprint',
      desc: 'Active mobility, vertical positions, and labor props',
      options: [
        { id: 'bp_birth_ball', title: 'Birth ball & active movement', desc: 'Freedom to walk, rock, and change positions' },
        { id: 'bp_vertical_birth', title: 'Upright or side-lying birth', desc: 'Gravitational support rather than flat on back' },
        { id: 'bp_shower', title: 'Warm shower / hydrotherapy', desc: 'Use warm water to ease labor tension' },
      ],
    },
    {
      id: 'pain',
      title: '3. Pain Relief & Comfort',
      icon: 'heart',
      desc: 'Natural techniques and medical analgesia preferences',
      options: [
        { id: 'bp_breath_first', title: 'Breathwork & counter-pressure massage', desc: 'Non-pharmacological comfort techniques first' },
        { id: 'bp_epidural_on_request', title: 'Epidural available upon my request', desc: 'Administered when I ask, without premature pressure' },
      ],
    },
    {
      id: 'interventions',
      title: '4. Interventions & Care',
      icon: 'milestone',
      desc: 'Informed consent on routine procedures',
      options: [
        { id: 'bp_informed_consent', title: 'Informed consent before interventions', desc: 'Explain reasons and options prior to medical procedures' },
        { id: 'bp_no_routine_episiotomy', title: 'No routine episiotomy', desc: 'Avoid unless clinically emergency strictly necessary' },
      ],
    },
    {
      id: 'moment',
      title: '5. The Birth Moment',
      icon: 'baby',
      desc: 'Baby emergence and umbilical cord management',
      options: [
        { id: 'bp_delayed_cord', title: 'Delayed umbilical cord clamping', desc: 'Wait 1-3 minutes until cord stops pulsating' },
        { id: 'bp_partner_cuts_cord', title: 'Partner cuts umbilical cord', desc: 'Partner participates in clamping and cutting' },
      ],
    },
    {
      id: 'plan_b',
      title: '6. Plan B & Cesarean',
      icon: 'bag',
      desc: 'Preferences if birth changes to cesarean birth',
      options: [
        { id: 'bp_partner_in_or', title: 'Partner present in operating room', desc: 'Companion stays beside mom throughout procedure' },
        { id: 'bp_immediate_skin_cesarean', title: 'Early skin-to-skin in recovery', desc: 'Chest contact as soon as mom and baby are stable' },
      ],
    },
    {
      id: 'golden_hour',
      title: '7. Golden Hour (First Minutes)',
      icon: 'heart',
      desc: 'Uninterrupted first contact after birth',
      options: [
        { id: 'bp_golden_hour', title: 'Uninterrupted 60m skin-to-skin', desc: 'Immediate placement on maternal chest' },
        { id: 'bp_delay_weighing', title: 'Delay newborn weighing / measuring', desc: 'Complete first bonding hour before routine checks' },
      ],
    },
    {
      id: 'newborn',
      title: '8. Newborn Care & Feeding',
      icon: 'nursing',
      desc: 'First feed, bath, and nursery preferences',
      options: [
        { id: 'bp_exclusive_nursing', title: 'Exclusive breastfeeding support', desc: 'No pacifiers or formula without maternal consultation' },
        { id: 'bp_delay_bath', title: 'Delay first bath for 24-48 hours', desc: 'Preserve natural vernix protective coating on skin' },
      ],
    },
  ] : [
    {
      id: 'env',
      title: '1. Doğum Ortamı',
      icon: 'star',
      desc: 'Oda aydınlatması, müzik ve refakatçi mevcudiyeti',
      options: [
        { id: 'bp_dim_lights', title: 'Loş ve sakin oda ışığı', desc: 'Gözü yormayan sıcak ve huzurlu doğum ortamı' },
        { id: 'bp_playlist', title: 'Kişisel gevşeme müzik listesi', desc: 'Dalga sesleri veya hafif müziklerin serbestçe çalınabilmesi' },
        { id: 'bp_partner_presence', title: 'Partnerin doğum boyunca yanımda olması', desc: 'Fiziksel ve duygusal desteğin kesintisiz sürmesi' },
      ],
    },
    {
      id: 'movement',
      title: '2. Hareket & Pozisyonlar',
      icon: 'footprint',
      desc: 'Aktif hareket serbestliği ve pilates topu',
      options: [
        { id: 'bp_birth_ball', title: 'Pilates topu ve serbest dolaşım', desc: 'Yatakta sabit kalmak yerine odada hareket edebilme' },
        { id: 'bp_vertical_birth', title: 'Yerçekimini kullanan dikey / yan yatış pozisyonu', desc: 'Sırtüstü yerine bedenin doğal akışına uygun açı' },
        { id: 'bp_shower', title: 'Ilık duş / hidroterapi', desc: 'Sancı dalgalarını hafifletmek için ılık su imkanı' },
      ],
    },
    {
      id: 'pain',
      title: '3. Ağrı Yönetimi & Rahatlama',
      icon: 'heart',
      desc: 'Doğal rahatlama yöntemleri ve medikal anestezi',
      options: [
        { id: 'bp_breath_first', title: 'Nefes teknikleri ve masaj desteği', desc: 'İlaç öncesi doğal parasempatik rahatlama yöntemleri' },
        { id: 'bp_epidural_on_request', title: 'Talep ettiğimde epidural seçeneği', desc: 'Baskı hissetmeden kendi kararımla uygulanabilmesi' },
      ],
    },
    {
      id: 'interventions',
      title: '4. Müdahaleler & İletişim',
      icon: 'milestone',
      desc: 'Tıbbi işlemler öncesi bilgilendirme ve onay',
      options: [
        { id: 'bp_informed_consent', title: 'Müdahaleler öncesi bilgilendirilmiş onam', desc: 'Rutin işlemlerin gerekçesinin önceden paylaşılması' },
        { id: 'bp_no_routine_episiotomy', title: 'Rutin epizyotomi uygulanmaması', desc: 'Yalnızca klinik acil gereklilik halinde başvurulması' },
      ],
    },
    {
      id: 'moment',
      title: '5. Doğum Anı',
      icon: 'baby',
      desc: 'Bebeğin çıkışı ve göbek kordonu yönetimi',
      options: [
        { id: 'bp_delayed_cord', title: 'Geç kordon klempleme (1-3 dakika)', desc: 'Kordondaki nabız atışı durana kadar beklenmesi' },
        { id: 'bp_partner_cuts_cord', title: 'Kordonu partnerin kesmesi', desc: 'Eşin doğuma aktif ve sembolik katılımı' },
      ],
    },
    {
      id: 'plan_b',
      title: '6. Plan B & Sezaryen',
      icon: 'bag',
      desc: 'Doğum şekli değişirse geçerli tercihler',
      options: [
        { id: 'bp_partner_in_or', title: 'Eşin ameliyathanede yanımda olması', desc: 'Sezaryen sürecinde refakatçinin desteğinin sürmesi' },
        { id: 'bp_immediate_skin_cesarean', title: 'Uyanma odasında erken ten tene temas', desc: 'İlk stabil anda bebeğin göğsüme verilmesi' },
      ],
    },
    {
      id: 'golden_hour',
      title: '7. Altın Saat (İlk Dakikalar)',
      icon: 'heart',
      desc: 'Doğumdan hemen sonra kesintisiz bağ kurma',
      options: [
        { id: 'bp_golden_hour', title: 'Doğar doğmaz 60 dk ten tene temas', desc: 'İlk kontrollerden önce anne göğsünde sıcak kalması' },
        { id: 'bp_delay_weighing', title: 'Kilo ve boy ölçümünün ilk saat ertelenmesi', desc: 'Rutin ölçümlerin anne-bebek bağı sonrasına bırakılması' },
      ],
    },
    {
      id: 'newborn',
      title: '8. Yenidoğan Bakımı & Beslenme',
      icon: 'nursing',
      desc: 'İlk emzirme, banyo ve biberon yaklaşımı',
      options: [
        { id: 'bp_exclusive_nursing', title: 'Sadece anne sütü & emzirme önceliği', desc: 'Tıbbi zorunluluk olmadıkça mama verilmemesi' },
        { id: 'bp_delay_bath', title: 'İlk banyonun 24-48 saat ertelenmesi', desc: 'Koruyucu verniks tabakasının ciltte emilmesi' },
      ],
    },
  ];

  // Choice options per spec 09: Prefer, Discuss, Prefer Not, No Preference
  const choiceOptions = [
    { id: 'prefer', label: isEn ? 'Prefer 👍' : 'Tercih Ederim 👍', bg: '#EDF7EE', color: '#2B6638' },
    { id: 'discuss', label: isEn ? 'Discuss 💬' : 'Hekimle Görüşülecek 💬', bg: '#FFF7E6', color: '#A06312' },
    { id: 'prefer_not', label: isEn ? 'Prefer Not 🚫' : 'Tercih Etmem 🚫', bg: '#FDEEEF', color: '#B32F3D' },
    { id: 'no_pref', label: isEn ? 'No Preference ⚪' : 'Fark Etmez ⚪', bg: '#F2EEF4', color: '#6A5F70' },
  ];

  function setPreference(optionId, choiceId) {
    const updatedPlan = { ...plan, [optionId]: choiceId };
    update({ birthPlan: updatedPlan });
  }

  // Calculate completed sections (a section is completed if all its options are answered)
  const allOptions = sections.flatMap(s => s.options);
  const answeredCount = allOptions.filter(o => !!plan[o.id]).length;
  const completedSectionsCount = sections.filter(s => s.options.every(o => !!plan[o.id])).length;
  const currentSection = sections[activeSectionIndex] || sections[0];

  function generateSummaryText() {
    let out = isEn ? "📋 MY BIRTH PREFERENCES PLAN\n" : "📋 DOĞUM TERCİHLERİ PLANI\n";
    for (const sec of sections) {
      const answeredInSec = sec.options.filter(o => plan[o.id] && plan[o.id] !== 'no_pref');
      if (answeredInSec.length) {
        out += `\n${sec.title.toUpperCase()}:\n`;
        for (const opt of answeredInSec) {
          const choice = choiceOptions.find(c => c.id === plan[opt.id]);
          out += `• ${opt.title} (${choice ? choice.label : ''})\n`;
        }
      }
    }
    return out;
  }

  return (
    <View style={ws.container}>
      <ScreenHero
        asset="ui_birth_plan_compass"
        icon="star"
        kicker={isEn ? 'GUIDED BUILDER' : 'REHBERLİ PLANLAYICI'}
        title={isEn ? 'Birth Preferences Plan' : 'Doğum Tercihleri Planı'}
        body={isEn ? 'A guided 8-section companion to align desires, discussion points, and care team expectations.' : 'Basit bir onay kutusu yerine 8 bölümlü rehber. Beklentilerinizi doktorunuz ve ebenizle uyumlu hale getirin.'}
        stat={`${completedSectionsCount}/8 ${isEn ? 'sections completed' : 'bölüm tamamlandı'}`}
        tint="#A66848"
      />

      {/* İlerleme ve Bölüm Başlığı Kartı */}
      <Card style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T bold style={{ fontSize: 13, color: '#A66848' }}>
            {isEn ? `SECTION ${activeSectionIndex + 1} OF 8` : `BÖLÜM ${activeSectionIndex + 1} / 8`}
          </T>
          <Tap
            onPress={() => setShowSummarySheet(true)}
            style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#FAF1EA' }}
          >
            <T bold style={{ fontSize: 11.5, color: '#A66848' }}>
              {isEn ? '📄 View Summary' : '📄 Özeti Gör'}
            </T>
          </Tap>
        </View>

        <T bold style={{ fontSize: 17, color: colors.ink, marginTop: 8 }}>
          {currentSection.title}
        </T>
        <T style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
          {currentSection.desc}
        </T>
      </Card>

      {/* 8 Bölüm Seçim Şeridi */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
        {sections.map((sec, idx) => {
          const isDone = sec.options.every(o => !!plan[o.id]);
          const isActive = idx === activeSectionIndex;
          return (
            <Tap
              key={sec.id}
              onPress={() => setActiveSectionIndex(idx)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 12,
                backgroundColor: isActive ? '#EDE2DB' : '#FFFFFF',
                borderWidth: 1,
                borderColor: isActive ? '#A66848' : '#EDE4DF',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {isDone && <T style={{ fontSize: 11 }}>✓</T>}
              <T bold={isActive} style={{ fontSize: 12, color: isActive ? '#7A4328' : colors.ink }}>
                {sec.title.split('.')[1]?.trim() || sec.title}
              </T>
            </Tap>
          );
        })}
      </ScrollView>

      {/* Bölüm İçeriği & Seçenekler */}
      <View style={{ gap: 12 }}>
        {currentSection.options.map(opt => {
          const currentChoice = plan[opt.id] || null;
          return (
            <Card key={opt.id} style={{ padding: 16, gap: 10 }}>
              <T bold style={{ fontSize: 15, color: colors.ink }}>{opt.title}</T>
              <T style={{ fontSize: 12, color: colors.muted, lineHeight: 17 }}>{opt.desc}</T>

              {/* 4 Seçenek Butonu */}
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {choiceOptions.map(choice => {
                  const isSelected = currentChoice === choice.id;
                  return (
                    <Tap
                      key={choice.id}
                      onPress={() => setPreference(opt.id, choice.id)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 7,
                        borderRadius: 10,
                        backgroundColor: isSelected ? choice.bg : '#F8F6F8',
                        borderWidth: 1,
                        borderColor: isSelected ? choice.color : '#EDE6EE',
                      }}
                    >
                      <T bold={isSelected} style={{ fontSize: 11.5, color: isSelected ? choice.color : colors.muted }}>
                        {choice.label}
                      </T>
                    </Tap>
                  );
                })}
              </View>
            </Card>
          );
        })}
      </View>

      {/* Navigasyon Butonları: Önceki / Sonraki Bölüm */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <Tap
          onPress={() => setActiveSectionIndex(i => Math.max(0, i - 1))}
          disabled={activeSectionIndex === 0}
          style={{ flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#EDE4DF', alignItems: 'center', opacity: activeSectionIndex === 0 ? 0.5 : 1 }}
        >
          <T bold style={{ color: colors.ink, fontSize: 13 }}>{isEn ? '← Previous' : '← Önceki Bölüm'}</T>
        </Tap>
        <Tap
          onPress={() => {
            if (activeSectionIndex < sections.length - 1) setActiveSectionIndex(i => i + 1);
            else setShowSummarySheet(true);
          }}
          style={{ flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#8F5335', alignItems: 'center' }}
        >
          <T bold style={{ color: 'white', fontSize: 13 }}>
            {activeSectionIndex < sections.length - 1 ? (isEn ? 'Next Section →' : 'Sonraki Bölüm →') : (isEn ? 'Review Plan ✓' : 'Planı Tamamla ✓')}
          </T>
        </Tap>
      </View>

      {/* Özet Form Modalı (Spec 09: Concise hospital summary) */}
      <Modal visible={showSummarySheet} transparent animationType="fade" onRequestClose={() => setShowSummarySheet(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(20,10,25,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Card style={{ width: '100%', maxWidth: 360, padding: 20, borderRadius: 22, backgroundColor: 'white', gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <T bold style={{ fontSize: 17, color: colors.ink }}>
                {isEn ? 'Birth Preferences Summary' : 'Doğum Tercihleri Özeti'}
              </T>
              <Tap onPress={() => setShowSummarySheet(false)} style={{ padding: 6 }}>
                <Icon name="close" size={18} color={colors.muted} />
              </Tap>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              <T style={{ fontSize: 12.5, color: colors.ink, lineHeight: 20, fontFamily: fonts.regular }}>
                {generateSummaryText()}
              </T>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <Tap
                onPress={() => {
                  const txt = generateSummaryText();
                  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(txt);
                    toast && toast(isEn ? 'Plan copied to clipboard!' : 'Plan panoya kopyalandı!');
                  }
                }}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FAF1EA', borderWidth: 1, borderColor: '#DEC8BB', alignItems: 'center' }}
              >
                <T bold style={{ color: '#8F5335', fontSize: 12 }}>{isEn ? '📋 Copy Text' : '📋 Metni Kopyala'}</T>
              </Tap>
              <Tap onPress={() => setShowSummarySheet(false)} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#8F5335', alignItems: 'center' }}>
                <T bold style={{ color: 'white', fontSize: 12 }}>{isEn ? 'Close' : 'Kapat'}</T>
              </Tap>
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

// ─── 6. DOKTORA SORULAR (SPEC 10_APPOINTMENT_QUESTIONS) ──────────────────────
export function DoctorQuestions({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState('before'); // 'before' | 'exam' | 'after'
  const [newQ, setNewQ] = useState('');
  const [isTop3Priority, setIsTop3Priority] = useState(false);
  const [activeExamIndex, setActiveExamIndex] = useState(0);

  // After-visit answer state
  const [selectedQForAnswer, setSelectedQForAnswer] = useState(null);
  const [answerNote, setAnswerNote] = useState('');
  const [followUpType, setFollowUpType] = useState('follow_up'); // 'follow_up' | 'lab_test' | 'medication' | 'next_visit'

  const suggestedTrimesterQuestions = isEn ? [
    { text: 'When is the right time for the 24-28w Glucose Challenge Test (OGTT)?', tag: 'Labs' },
    { text: 'Will the Anti-D Rh shot be administered during this checkup?', tag: 'Medication' },
    { text: 'Is my magnesium dosage sufficient for night leg cramps?', tag: 'Symptom' },
    { text: 'How should baby movements be monitored throughout the day?', tag: 'Fetal Kicks' },
    { text: 'What is the current baby position and placenta location?', tag: 'Ultrasound' },
  ] : [
    { text: '24-28. hafta Şeker Yükleme (OGTT) testi için doğru zaman nedir?', tag: 'Tahlil' },
    { text: 'Kan uyuşmazlığı iğnesi (Anti-D) bu kontrolde yapılacak mı?', tag: 'Aşı/İlaç' },
    { text: 'Gece krampları için magnezyum dozu yeterli mi?', tag: 'Semptom' },
    { text: 'Bebek hareketleri gün içinde nasıl takip edilmeli?', tag: 'Hareket' },
    { text: 'Doğum pozisyonu ve plasenta yerleşimi ne durumda?', tag: 'Ultrason' },
  ];

  const defaultQuestions = isEn ? [
    { id: 'dq1', text: 'Should I increase my iron or prenatal vitamin supplements this week?', priority: 'top3', done: false },
    { id: 'dq2', text: 'Do I need a doctor clearance report for air travel or journeys?', priority: 'normal', done: false },
    { id: 'dq3', text: 'Are the tightenings Braxton Hicks or signs of cervical dilation?', priority: 'top3', done: false },
  ] : [
    { id: 'dq1', text: 'Bu hafta demir veya vitamin takviyelerimi artırmalı mıyım?', priority: 'top3', done: false },
    { id: 'dq2', text: 'Yolculuk veya seyahat için hekim onayı raporu almalı mıyım?', priority: 'normal', done: false },
    { id: 'dq3', text: 'Hissedilen kasılmalar Braxton Hicks mi yoksa servikal açılma mı?', priority: 'top3', done: false },
  ];

  const questions = state.lists?.questions || defaultQuestions;

  function addQuestion(textToAdd) {
    const text = typeof textToAdd === 'string' ? textToAdd : newQ;
    if (!text.trim()) return;
    const item = {
      id: `q-${uid()}`,
      text: text.trim(),
      priority: isTop3Priority ? 'top3' : 'normal',
      done: false,
      answer: '',
      followUpType: '',
    };
    update(old => ({
      lists: { ...(old.lists || {}), questions: [item, ...(old.lists?.questions || questions)] },
    }));
    if (typeof textToAdd !== 'string') {
      setNewQ('');
      setIsTop3Priority(false);
    }
    toast && toast(isEn ? 'Question added to visit list' : 'Soru randevu listesine eklendi');
  }

  function toggleQuestionDone(id) {
    const updated = questions.map(q => q.id === id ? { ...q, done: !q.done } : q);
    update(old => ({
      lists: { ...(old.lists || {}), questions: updated },
    }));
  }

  function saveAnswer(id) {
    if (!answerNote.trim()) return;
    const updated = questions.map(q => q.id === id ? { ...q, answer: answerNote.trim(), followUpType, done: true } : q);
    update(old => ({
      lists: { ...(old.lists || {}), questions: updated },
    }));
    setSelectedQForAnswer(null);
    setAnswerNote('');
    toast && toast(isEn ? 'Doctor answer saved' : 'Doktor yanıtı kaydedildi');
  }

  const openQuestions = questions.filter(q => !q.done);
  const answeredQuestions = questions.filter(q => q.done);
  const currentExamQ = openQuestions[activeExamIndex] || openQuestions[0];

  const followUpLabels = {
    follow_up: isEn ? 'Follow Up' : 'Takip Et',
    lab_test: isEn ? 'Lab Test' : 'Tetkik / Tahlil',
    medication: isEn ? 'Medication Note' : 'İlaç / Takviye',
    next_visit: isEn ? 'Ask Next Visit' : 'Sonraki Randevuda Sor',
  };

  return (
    <View style={ws.container}>
      <ScreenHero
        asset="ui_doctor_prep_notebook"
        icon="chat"
        kicker={isEn ? 'VISIT COMPANION' : 'RANDEVU REHBERİ'}
        title={isEn ? "Doctor Questions" : "Doktora Sorulacaklar"}
        body={isEn ? "Organize questions before the visit, open distraction-free Exam Mode during, and log answers after." : "Muayene öncesi sorularınızı önceliklendirin, odada dikkatsizce tek tek okuyun ve sonrasında doktorun yanıtlarını kaydedin."}
        stat={`${openQuestions.length} ${isEn ? 'open questions' : 'açık soru'}`}
        tint="#7C5C96"
      />

      {/* 3 Aşamalı Yolculuk Tabları: Öncesi → Muayene → Sonrası (Spec 10) */}
      <View style={{ flexDirection: 'row', backgroundColor: '#F3EDF5', borderRadius: 16, padding: 4 }}>
        {[
          { id: 'before', label: isEn ? '1. Before Visit' : '1. Öncesi' },
          { id: 'exam', label: isEn ? '2. Exam Mode' : '2. Muayene Odası' },
          { id: 'after', label: isEn ? '3. After Visit' : '3. Sonrası' },
        ].map(tab => (
          <Tap
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              borderRadius: 12,
              backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
              elevation: activeTab === tab.id ? 2 : 0,
            }}
          >
            <T bold={activeTab === tab.id} style={{ fontSize: 12.5, color: activeTab === tab.id ? colors.purple : colors.muted }}>
              {tab.label}
            </T>
          </Tap>
        ))}
      </View>

      {/* ─── AŞAMA 1: ÖNCESİ (BEFORE VISIT) ─── */}
      {activeTab === 'before' && (
        <>
          {/* Yeni Soru Ekleme Kartı */}
          <Card style={{ padding: 16, gap: 10 }}>
            <T bold style={{ fontSize: 14, color: colors.ink }}>
              {isEn ? 'Add a Question for Next Visit:' : 'Sonraki Kontrol İçin Soru Ekle:'}
            </T>
            <TextInput
              value={newQ}
              onChangeText={setNewQ}
              placeholder={isEn ? 'What is on your mind? (e.g. cramps, flying, vitamins)...' : 'Aklınıza takılan konu (örn. kramplar, seyahat, takviyeler)...'}
              placeholderTextColor="#A79AA7"
              style={ws.noteInputBox}
              maxLength={200}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <Tap
                onPress={() => setIsTop3Priority(!isTop3Priority)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: isTop3Priority ? '#F2E8F4' : '#F6F6F6' }}
              >
                <T style={{ fontSize: 14 }}>{isTop3Priority ? '⭐️' : '☆'}</T>
                <T bold={isTop3Priority} style={{ fontSize: 12, color: isTop3Priority ? colors.purple : colors.muted }}>
                  {isEn ? 'Top 3 Priority' : 'Öncelikli Soru'}
                </T>
              </Tap>

              <Tap onPress={() => addQuestion(newQ)} style={ws.addBtn}>
                <T bold style={{ color: 'white', fontSize: 13 }}>{isEn ? '+ Add' : '+ Ekle'}</T>
              </Tap>
            </View>
          </Card>

          {/* Önerilen Sorular Şeridi */}
          <Card style={{ padding: 14 }}>
            <T bold style={{ fontSize: 13, color: colors.ink, marginBottom: 8 }}>
              {isEn ? 'Suggested Questions for this Trimester:' : 'Bu Dönem İçin Önerilen Sorular:'}
            </T>
            <View style={{ gap: 8 }}>
              {suggestedTrimesterQuestions.slice(0, 3).map((sugg, idx) => (
                <Tap
                  key={idx}
                  onPress={() => addQuestion(sugg.text)}
                  style={{ padding: 10, borderRadius: 10, backgroundColor: '#FAF6FB', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <T style={{ flex: 1, fontSize: 12.5, color: colors.ink, paddingRight: 8 }}>{sugg.text}</T>
                  <T bold style={{ fontSize: 11, color: colors.purple }}>+ Ekle</T>
                </Tap>
              ))}
            </View>
          </Card>

          {/* Açık Sorular Listesi */}
          <Section title={isEn ? "My Visit Questions" : "Hazırlanan Sorularım"} />
          {openQuestions.length === 0 ? (
            <Card style={{ alignItems: 'center', padding: 20 }}>
              <T style={{ color: colors.muted, fontSize: 13 }}>
                {isEn ? 'No pending questions. Add one above!' : 'Bekleyen soru yok. Yukarıdan ekleyin!'}
              </T>
            </Card>
          ) : (
            openQuestions.map(q => (
              <Card key={q.id} style={{ padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {q.priority === 'top3' && (
                      <View style={{ backgroundColor: '#F4EBF6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                        <T bold style={{ fontSize: 10, color: colors.purple }}>⭐️ ÖNCELİKLİ</T>
                      </View>
                    )}
                  </View>
                  <T bold style={{ fontSize: 14, color: colors.ink, marginTop: 4 }}>{q.text}</T>
                </View>
                <Tap onPress={() => toggleQuestionDone(q.id)} style={{ padding: 8, backgroundColor: '#F0ECEE', borderRadius: 10 }}>
                  <Icon name="check" size={16} color={colors.muted} />
                </Tap>
              </Card>
            ))
          )}
        </>
      )}

      {/* ─── AŞAMA 2: MUAYENE ODASI MODU (EXAM MODE - ONE QUESTION AT A TIME) ─── */}
      {activeTab === 'exam' && (
        <>
          {openQuestions.length === 0 ? (
            <Card style={{ alignItems: 'center', padding: 30, gap: 10 }}>
              <T style={{ fontSize: 28 }}>🎉</T>
              <T bold style={{ fontSize: 16, color: colors.ink }}>
                {isEn ? 'All questions answered!' : 'Tüm sorular yanıtlandı!'}
              </T>
              <T style={{ fontSize: 12, color: colors.muted, textAlign: 'center' }}>
                {isEn ? 'Great job preparing for your checkup.' : 'Doktor kontrolünüz için harika bir hazırlık yaptınız.'}
              </T>
            </Card>
          ) : (
            <Card style={{ padding: 24, borderRadius: 24, backgroundColor: '#FFFDF9', borderColor: '#EBDDEB', borderWidth: 1.5, minHeight: 280, justifyContent: 'space-between' }}>
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <T bold style={{ fontSize: 12, color: colors.purple, letterSpacing: 1 }}>
                    {isEn ? `QUESTION ${activeExamIndex + 1} OF ${openQuestions.length}` : `SORU ${activeExamIndex + 1} / ${openQuestions.length}`}
                  </T>
                  {currentExamQ?.priority === 'top3' && (
                    <T bold style={{ fontSize: 11, color: colors.purple }}>⭐️ {isEn ? 'Top Priority' : 'Öncelikli'}</T>
                  )}
                </View>

                {/* Büyük Odaklı Yazı Tipi */}
                <T bold style={{ fontSize: 20, color: '#1B2A4A', marginTop: 24, lineHeight: 28 }}>
                  {currentExamQ?.text}
                </T>
              </View>

              <View style={{ gap: 12, marginTop: 30 }}>
                <Tap
                  onPress={() => {
                    if (currentExamQ) toggleQuestionDone(currentExamQ.id);
                    if (activeExamIndex > 0) setActiveExamIndex(i => i - 1);
                  }}
                  style={{ backgroundColor: '#2E663B', paddingVertical: 14, borderRadius: 14, alignItems: 'center' }}
                >
                  <T bold style={{ color: 'white', fontSize: 14 }}>
                    {isEn ? '✓ Mark Answered by Doctor' : '✓ Doktor Yanıtladı Olarak İşaretle'}
                  </T>
                </Tap>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Tap
                    onPress={() => setActiveExamIndex(i => Math.max(0, i - 1))}
                    disabled={activeExamIndex === 0}
                    style={{ flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#EDE4ED', alignItems: 'center', opacity: activeExamIndex === 0 ? 0.5 : 1 }}
                  >
                    <T bold style={{ color: colors.ink, fontSize: 12 }}>{isEn ? '← Previous' : '← Önceki'}</T>
                  </Tap>
                  <Tap
                    onPress={() => setActiveExamIndex(i => Math.min(openQuestions.length - 1, i + 1))}
                    disabled={activeExamIndex >= openQuestions.length - 1}
                    style={{ flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#EDE4ED', alignItems: 'center', opacity: activeExamIndex >= openQuestions.length - 1 ? 0.5 : 1 }}
                  >
                    <T bold style={{ color: colors.ink, fontSize: 12 }}>{isEn ? 'Next →' : 'Sonraki →'}</T>
                  </Tap>
                </View>
              </View>
            </Card>
          )}
        </>
      )}

      {/* ─── AŞAMA 3: SONRASI (AFTER VISIT NOTES & FOLLOW-UPS) ─── */}
      {activeTab === 'after' && (
        <>
          <Section title={isEn ? "Answered Questions & Doctor Notes" : "Yanıtlanan Sorular & Notlar"} />
          {answeredQuestions.length === 0 ? (
            <Card style={{ alignItems: 'center', padding: 20 }}>
              <T style={{ color: colors.muted, fontSize: 13 }}>
                {isEn ? 'No answered questions yet.' : 'Henüz yanıtlanan soru bulunmuyor.'}
              </T>
            </Card>
          ) : (
            answeredQuestions.map(q => (
              <Card key={q.id} style={{ padding: 14, gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <T bold style={{ fontSize: 14, color: colors.ink, flex: 1 }}>{q.text}</T>
                  <Tap onPress={() => toggleQuestionDone(q.id)} style={{ padding: 4 }}>
                    <Icon name="check" size={16} color="#317349" />
                  </Tap>
                </View>

                {q.answer ? (
                  <View style={{ backgroundColor: '#F8F4FA', padding: 10, borderRadius: 10, marginTop: 4 }}>
                    <T style={{ fontSize: 11, color: colors.purple, fontWeight: '700' }}>
                      {isEn ? 'Doctor Answer / Advice:' : 'Doktorun Yanıtı / Tavsiyesi:'}
                    </T>
                    <T style={{ fontSize: 12.5, color: colors.ink, marginTop: 2 }}>{q.answer}</T>
                    {q.followUpType && (
                      <View style={{ alignSelf: 'flex-start', backgroundColor: '#EDE0F0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 6 }}>
                        <T bold style={{ fontSize: 10, color: colors.purple }}>
                          {followUpLabels[q.followUpType] || q.followUpType}
                        </T>
                      </View>
                    )}
                  </View>
                ) : (
                  <Tap
                    onPress={() => setSelectedQForAnswer(q)}
                    style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#FAF5FA', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#E8DAEA' }}
                  >
                    <T bold style={{ fontSize: 11.5, color: colors.purple }}>
                      {isEn ? '+ Add Doctor Answer Note' : '+ Doktor Yanıtı Ekle'}
                    </T>
                  </Tap>
                )}
              </Card>
            ))
          )}

          {/* Yanıt Notu Ekleme Modalı */}
          <Modal visible={!!selectedQForAnswer} transparent animationType="fade" onRequestClose={() => setSelectedQForAnswer(null)}>
            <View style={{ flex: 1, backgroundColor: 'rgba(20,10,25,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <Card style={{ width: '100%', maxWidth: 360, padding: 20, borderRadius: 22, backgroundColor: 'white', gap: 12 }}>
                <T bold style={{ fontSize: 16, color: colors.ink }}>{isEn ? 'Doctor Answer & Follow-up' : 'Doktor Yanıtı & Takip'}</T>
                <T style={{ fontSize: 12, color: colors.muted }}>{selectedQForAnswer?.text}</T>

                <TextInput
                  value={answerNote}
                  onChangeText={setAnswerNote}
                  multiline
                  placeholder={isEn ? 'Doctor recommendations, dosage, or advice...' : 'Doktorun tavsiyesi, dozaj veya yönlendirmesi...'}
                  placeholderTextColor="#A79AA7"
                  style={[ws.noteInputBox, { minHeight: 80, textAlignVertical: 'top' }]}
                />

                <T bold style={{ fontSize: 12, color: colors.ink, marginTop: 4 }}>{isEn ? 'Follow-up Type:' : 'Takip Türü:'}</T>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  {Object.entries(followUpLabels).map(([key, label]) => (
                    <Tap
                      key={key}
                      onPress={() => setFollowUpType(key)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: followUpType === key ? colors.purple : '#F2EEF4',
                      }}
                    >
                      <T bold={followUpType === key} style={{ fontSize: 11, color: followUpType === key ? 'white' : colors.ink }}>
                        {label}
                      </T>
                    </Tap>
                  ))}
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                  <Tap onPress={() => setSelectedQForAnswer(null)} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#EDE8ED', alignItems: 'center' }}>
                    <T bold style={{ color: colors.ink, fontSize: 12 }}>{isEn ? 'Cancel' : 'İptal'}</T>
                  </Tap>
                  <Tap
                    onPress={() => {
                      if (selectedQForAnswer) saveAnswer(selectedQForAnswer.id);
                    }}
                    style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.purple, alignItems: 'center' }}
                  >
                    <T bold style={{ color: 'white', fontSize: 12 }}>{isEn ? 'Save' : 'Kaydet'}</T>
                  </Tap>
                </View>
              </Card>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

// ─── 7. BEBEK İSİMLERİ KÜTÜPHANESİ & TİNDER İSİM MOTORU ──────────────────────
// Hece sayısı hesaplama (Türkçe sesli harf kuralı)
function countSyllables(name) {
  if (!name) return 1;
  const vowels = name.match(/[aeıioöuüAEIİOÖUÜ]/g);
  return vowels ? vowels.length : 1;
}

export function BabyNameMatcher({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const favNames = state?.favNames || [];
  const finalistNames = state?.finalistNames || [];
  const [activeTab, setActiveTab] = useState('deck'); // 'deck' | 'catalog' | 'shortlist'
  const [genderFilter, setGenderFilter] = useState('Tümü');
  const [themeFilter, setThemeFilter] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [letterFilter, setLetterFilter] = useState('Tümü');
  const [catalogPage, setCatalogPage] = useState(1);
  const [partnerModalName, setPartnerModalName] = useState(null);
  const [surname, setSurname] = useState(state?.surname || '');
  const [shortlistFilter, setShortlistFilter] = useState('all'); // 'all' | 'matches' | 'finalists'

  // İsim Keşif Motoru Değişkenleri & Fizik
  const [cardIndex, setCardIndex] = useState(0);
  const [historyStack, setHistoryStack] = useState([]); // [{ index, nameId, direction, wasFav, wasFinalist }]
  const pan = useRef(new Animated.ValueXY()).current;

  // Filtrelenmiş İsim Havuzu
  const pool = useMemo(() => {
    return babyNamesList.filter(n => {
      // Cinsiyet
      if (genderFilter !== 'Tümü' && genderFilter !== 'All' && n.gender !== genderFilter) return false;

      // Kategori / Tema
      if ((themeFilter === '💕 Ortak Eşleşmeler' || themeFilter === '💕 Partner Matches') && !n.partnerMatch) return false;
      if ((themeFilter === '🌿 Doğa & Çiçek' || themeFilter === '🌿 Nature & Flowers') && n.tag !== 'Doğa & Çiçek') return false;
      if ((themeFilter === '🏛️ Tarihi & Göktürk' || themeFilter === '🏛️ Historical & Classic') && n.tag !== 'Tarihi & Göktürk') return false;
      if ((themeFilter === '💎 Modern & Kısa' || themeFilter === '💎 Modern & Short') && n.tag !== 'Modern & Kısa') return false;
      if ((themeFilter === "📖 Kuran'da Geçen" || themeFilter === "📖 Quranic Names") && !n.quran) return false;
      if (themeFilter === '👑 Güç & Asalet' && n.tag !== 'Güç & Asalet') return false;
      if (themeFilter === '✨ Zarafet & Sanat' && n.tag !== 'Zarafet & Sanat') return false;
      if (themeFilter === '🌟 Özgün & Nadir' && n.tag !== 'Özgün & Nadir') return false;
      if (themeFilter === '⏳ Zamansız Klasik' && n.tag !== 'Zamansız Klasik') return false;

      // Alfabe harfi
      if (letterFilter !== 'Tümü' && !n.name.toLocaleUpperCase('tr-TR').startsWith(letterFilter)) return false;

      // Canlı arama
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = n.name.toLowerCase().includes(q);
        const matchMeaning = n.meaning.toLowerCase().includes(q);
        const matchOrigin = n.origin.toLowerCase().includes(q);
        if (!matchName && !matchMeaning && !matchOrigin) return false;
      }

      return true;
    });
  }, [genderFilter, themeFilter, letterFilter, searchQuery]);

  // Filtre değiştiğinde kart indeksini güvenli sıfırla
  useEffect(() => {
    setCardIndex(0);
    pan.setValue({ x: 0, y: 0 });
  }, [genderFilter, themeFilter, letterFilter]);

  const currentCard = pool[cardIndex] || null;
  const nextCard = pool[cardIndex + 1] || null;
  const partnerMatchesCount = useMemo(() => babyNamesList.filter(n => n.partnerMatch).length, []);
  const favNamesObjects = useMemo(() => babyNamesList.filter(n => favNames.includes(n.id)), [favNames]);
  const finalistNamesObjects = useMemo(() => babyNamesList.filter(n => finalistNames.includes(n.id)), [finalistNames]);

  // Kart Fırlatma ve Kaydırma Mantığı (Swipe)
  function swipeCard(direction, isSpecialFavorite = false) {
    if (!currentCard) return;
    const targetX = direction === 'right' ? 500 : -500;
    Animated.timing(pan, {
      toValue: { x: targetX, y: 0 },
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      pan.setValue({ x: 0, y: 0 });
      setHistoryStack(prev => [{
        index: cardIndex,
        nameId: currentCard.id,
        direction,
        isSpecialFavorite,
      }, ...prev]);

      if (direction === 'right' || isSpecialFavorite) {
        let newFavs = favNames;
        if (!favNames.includes(currentCard.id)) {
          newFavs = [...favNames, currentCard.id];
        }
        let newFinalists = finalistNames;
        if (isSpecialFavorite && !finalistNames.includes(currentCard.id)) {
          newFinalists = [...finalistNames, currentCard.id];
        }
        update({ favNames: newFavs, finalistNames: newFinalists });

        if (currentCard.partnerMatch) {
          setPartnerModalName(currentCard);
        } else {
          toast && toast(isSpecialFavorite
            ? (isEn ? `Added "${currentCard.name}" to Finalists ⭐` : `"${currentCard.name}" finalistlere eklendi ⭐`)
            : (isEn ? `Added "${currentCard.name}" to favorites ❤️` : `"${currentCard.name}" favorilere eklendi ❤️`));
        }
      }
      setCardIndex(idx => idx + 1);
    });
  }

  // ↩️ Son Kartı Geri Al (Undo)
  function undoSwipe() {
    if (historyStack.length === 0) {
      toast && toast(isEn ? 'No cards to undo' : 'Geri alınacak kart bulunmuyor');
      return;
    }
    const lastAction = historyStack[0];
    setHistoryStack(prev => prev.slice(1));
    setCardIndex(lastAction.index);

    if (lastAction.direction === 'right') {
      update({
        favNames: favNames.filter(id => id !== lastAction.nameId),
        finalistNames: finalistNames.filter(id => id !== lastAction.nameId),
      });
    }
    toast && toast(isEn ? 'Card restored ↩️' : 'Kart geri getirildi ↩️');
  }

  // 🔊 İsmi Seslendir
  function handlePronounce(name) {
    speakText(name, { lang: 'tr' });
    toast && toast(isEn ? `Pronouncing "${name}" 🔊` : `"${name}" seslendiriliyor 🔊`);
  }

  // Favori Ekle / Çıkar
  function toggleFav(id) {
    const exists = favNames.includes(id);
    const updated = exists ? favNames.filter(x => x !== id) : [...favNames, id];
    const updatedFinalists = exists ? finalistNames.filter(x => x !== id) : finalistNames;
    update({ favNames: updated, finalistNames: updatedFinalists });
    toast && toast(exists ? (isEn ? 'Removed from favorites' : 'Favorilerden çıkarıldı') : (isEn ? 'Added to favorites 💛' : 'Favorilere eklendi 💛'));
  }

  // Finalist Ekle / Çıkar
  function toggleFinalist(id) {
    const exists = finalistNames.includes(id);
    const updated = exists ? finalistNames.filter(x => x !== id) : [...finalistNames, id];
    let newFavs = favNames;
    if (!exists && !favNames.includes(id)) {
      newFavs = [...favNames, id];
    }
    update({ finalistNames: updated, favNames: newFavs });
    toast && toast(exists ? (isEn ? 'Removed from finalists' : 'Finalistlerden çıkarıldı') : (isEn ? 'Marked as Finalist ⭐' : 'Finalist olarak işaretlendi ⭐'));
  }

  // Kısa Listeyi Kopyala
  function copyShortlist() {
    const targetList = shortlistFilter === 'finalists'
      ? finalistNamesObjects
      : shortlistFilter === 'matches'
      ? favNamesObjects.filter(n => n.partnerMatch)
      : favNamesObjects;

    if (targetList.length === 0) {
      toast && toast(isEn ? 'List is currently empty' : 'Listeniz henüz boş');
      return;
    }
    const text = targetList.map(n => {
      const fullname = surname ? `${n.name} ${surname}` : n.name;
      return `• ${fullname} (${n.gender}, ${countSyllables(n.name)} Hece) - ${n.meaning} [${n.origin}]`;
    }).join('\n\n');

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    toast && toast(isEn ? '✓ Shortlist copied to clipboard!' : '✓ Bebek isimleri listesi panoya kopyalandı!');
  }

  // PanResponder Dokunma & Sürükleme Algılayıcı
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 || Math.abs(g.dy) > 10,
      onPanResponderMove: (_, g) => {
        pan.setValue({ x: g.dx, y: g.dy });
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx > 110) {
          swipeCard('right');
        } else if (g.dx < -110) {
          swipeCard('left');
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            tension: 50,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // Animasyon Değerleri & İnterpolasyonlar
  const rotateCard = pan.x.interpolate({
    inputRange: [-240, 0, 240],
    outputRange: ['-14deg', '0deg', '14deg'],
    extrapolate: 'clamp',
  });

  const likeStampOpacity = pan.x.interpolate({
    inputRange: [20, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const passStampOpacity = pan.x.interpolate({
    inputRange: [-100, -20],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const nextCardScale = pan.x.interpolate({
    inputRange: [-150, 0, 150],
    outputRange: [1, 0.94, 1],
    extrapolate: 'clamp',
  });

  const nextCardOpacity = pan.x.interpolate({
    inputRange: [-150, 0, 150],
    outputRange: [1, 0.85, 1],
    extrapolate: 'clamp',
  });

  const alphabet = ['Tümü', 'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'H', 'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'];

  const genderOptions = [
    { id: 'Tümü', label: isEn ? 'All' : 'Tümü' },
    { id: 'Kız', label: isEn ? '👧 Girl' : '👧 Kız' },
    { id: 'Erkek', label: isEn ? '👦 Boy' : '👦 Erkek' },
    { id: 'Üniseks', label: isEn ? '🤍 Unisex' : '🤍 Üniseks' },
  ];

  return (
    <View style={ws.container}>
      <ScreenHero
        asset="ui_baby_name_blocks"
        icon="sparkles"
        kicker={isEn ? 'BABY NAME DISCOVERY' : 'BEBEK İSİM KEŞFİ'}
        title={isEn ? 'Name Discovery & Partner Match' : 'İsim Keşfi & Eşleşme'}
        body={isEn
          ? 'Explore names with syllable counts, surname previews, and partner matching in an extensive Turkish & universal archive.'
          : 'Hece analizi, soyadı uyumu ve eşinizle ortak eşleşme desteğiyle 9000+ zengin isim arşivini keşfedin.'}
        stat={`${favNames.length} ${isEn ? 'shortlisted' : 'favori'}`}
        tint="#9B4E76"
      />

      {/* İkili Metrik Kartları */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <MetricCard
          title={isEn ? "ARCHIVE" : "KÜTÜPHANE"}
          value={babyNamesList.length}
          unit={isEn ? "curated names" : "zengin isim"}
          subtext={isEn ? "Meanings, origins, tags" : "Anlam, köken ve tahlil"}
          icon="book"
        />
        <MetricCard
          title={isEn ? "SHARED MATCHES" : "EŞİMLE ORTAK"}
          value={partnerMatchesCount}
          unit={isEn ? "matches" : "eşleşme"}
          subtext={isEn ? "Mutual favorites" : "Eşinin de beğendiği"}
          icon="heart"
          tint="#C55B77"
        />
      </View>

      {/* Soyadı Önizleme Kutusu (Spec 11: Surname preview) */}
      <Card style={{ padding: 12, backgroundColor: '#FAF6FA', borderColor: '#EADBEC' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <T style={{ fontSize: 16 }}>✍️</T>
          <View style={{ flex: 1 }}>
            <T bold style={{ fontSize: 12, color: colors.purple }}>
              {isEn ? 'SURNAME PREVIEW' : 'SOYADI İLE UYUM DENEYİN'}
            </T>
            <T style={{ fontSize: 10.5, color: colors.muted }}>
              {isEn ? 'Enter your family surname to see how names sound' : 'Bebeğin soyadını girin, isimle melodisini anında görün'}
            </T>
          </View>
          <TextInput
            value={surname}
            onChangeText={txt => {
              setSurname(txt);
              update({ surname: txt });
            }}
            placeholder={isEn ? "e.g. Yılmaz" : "Örn: Yılmaz"}
            placeholderTextColor="#B9A5BE"
            style={{ width: 110, backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: '#DFC7E2', paddingHorizontal: 10, paddingVertical: 5, fontSize: 13, color: colors.ink }}
          />
        </View>
      </Card>

      {/* Görünüm Modu Değiştirici Tab Çubuğu (Spec 11: NO Tinder branding!) */}
      <View style={ws.modeTabRow}>
        <Tap
          onPress={() => setActiveTab('deck')}
          style={[ws.modeTabBtn, activeTab === 'deck' && ws.modeTabBtnActive]}
        >
          <T style={{ fontSize: 13 }}>🃏</T>
          <T bold={activeTab === 'deck'} style={{ fontSize: 12, color: activeTab === 'deck' ? colors.purple : colors.muted }}>
            {isEn ? 'Name Discovery' : 'İsim Keşfi'}
          </T>
        </Tap>

        <Tap
          onPress={() => setActiveTab('catalog')}
          style={[ws.modeTabBtn, activeTab === 'catalog' && ws.modeTabBtnActive]}
        >
          <T style={{ fontSize: 13 }}>📋</T>
          <T bold={activeTab === 'catalog'} style={{ fontSize: 12, color: activeTab === 'catalog' ? colors.purple : colors.muted }}>
            {isEn ? 'A-Z Catalog' : 'A-Z Fihrist'}
          </T>
        </Tap>

        <Tap
          onPress={() => setActiveTab('shortlist')}
          style={[ws.modeTabBtn, activeTab === 'shortlist' && ws.modeTabBtnActive]}
        >
          <T style={{ fontSize: 13 }}>💕</T>
          <T bold={activeTab === 'shortlist'} style={{ fontSize: 12, color: activeTab === 'shortlist' ? colors.purple : colors.muted }}>
            {isEn ? `Shortlist (${favNames.length})` : `Kısa Liste (${favNames.length})`}
          </T>
        </Tap>
      </View>

      {/* Cinsiyet Filtreleme Butonları */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {genderOptions.map(g => (
          <Tap
            key={g.id}
            onPress={() => setGenderFilter(g.id)}
            label={g.label}
            style={[ws.filterPill, (genderFilter === g.id || (g.id === 'Tümü' && genderFilter === 'All')) && ws.filterPillActive]}
          >
            <T bold={(genderFilter === g.id || (g.id === 'Tümü' && genderFilter === 'All'))} style={{ fontSize: 12, color: (genderFilter === g.id || (g.id === 'Tümü' && genderFilter === 'All')) ? 'white' : colors.ink }}>
              {g.label}
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
            style={[ws.themePill, (themeFilter === t || (t === 'All' && themeFilter === 'Tümü')) && ws.themePillActive]}
          >
            <T bold={(themeFilter === t || (t === 'All' && themeFilter === 'Tümü'))} style={{ fontSize: 11, color: (themeFilter === t || (t === 'All' && themeFilter === 'Tümü')) ? colors.purple : colors.muted }}>
              {t}
            </T>
          </Tap>
        ))}
      </ScrollView>

      {/* ─── 1. MOD: İSİM KEŞFİ KART DECK (CARD SWIPER) ─── */}
      {activeTab === 'deck' && (
        <View>
          <View style={ws.deckContainer}>
            {/* Alt Katmandaki Kart (Next Card Preview) */}
            {nextCard && (
              <Animated.View
                style={[
                  ws.tinderCard,
                  {
                    transform: [{ scale: nextCardScale }, { translateY: 10 }],
                    opacity: nextCardOpacity,
                    zIndex: 1,
                  },
                ]}
              >
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={[ws.genderBadge, nextCard.gender === 'Kız' ? { backgroundColor: '#FBEBF2' } : nextCard.gender === 'Erkek' ? { backgroundColor: '#EBF3FB' } : { backgroundColor: '#F0EEF5' }]}>
                      <T style={{ fontSize: 11, color: nextCard.gender === 'Kız' ? '#B84570' : nextCard.gender === 'Erkek' ? '#3B72A4' : '#6A5C78' }}>
                        {nextCard.gender === 'Kız' ? '👧 Kız' : nextCard.gender === 'Erkek' ? '👦 Erkek' : '🤍 Üniseks'}
                      </T>
                    </View>
                    <T style={{ fontSize: 11, color: colors.muted }}>{nextCard.origin}</T>
                  </View>
                  <T bold style={{ fontSize: 32, color: colors.ink, marginTop: 14 }}>{nextCard.name}</T>
                  <T style={{ fontSize: 14, color: '#594B5E', marginTop: 10, lineHeight: 21 }}>{nextCard.meaning}</T>
                </View>
              </Animated.View>
            )}

            {/* Üstteki Aktif Kart (PanResponder ile Sürüklenebilir) */}
            {currentCard ? (
              <Animated.View
                {...panResponder.panHandlers}
                style={[
                  ws.tinderCard,
                  {
                    transform: [
                      { translateX: pan.x },
                      { translateY: pan.y },
                      { rotate: rotateCard },
                    ],
                    zIndex: 2,
                  },
                ]}
              >
                {/* Dinamik BEĞEN Damgası */}
                <Animated.View style={[ws.stampBadge, ws.likeStamp, { opacity: likeStampOpacity }]} pointerEvents="none">
                  <T bold style={ws.likeStampText}>{isEn ? 'LIKE' : 'BEĞEN'}</T>
                </Animated.View>

                {/* Dinamik GEÇ Damgası */}
                <Animated.View style={[ws.stampBadge, ws.passStamp, { opacity: passStampOpacity }]} pointerEvents="none">
                  <T bold style={ws.passStampText}>{isEn ? 'PASS' : 'GEÇ'}</T>
                </Animated.View>

                {/* Kart Başlığı */}
                <View>
                  {currentCard.partnerMatch && (
                    <View style={ws.partnerRibbon}>
                      <T style={{ fontSize: 14 }}>⭐</T>
                      <T bold style={{ fontSize: 12, color: '#B37B24' }}>
                        {isEn ? 'PARTNER MATCH! Both of you love this' : 'ORTAK EŞLEŞME! Eşin de bu ismi çok beğendi'}
                      </T>
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      <View style={[ws.genderBadge, currentCard.gender === 'Kız' ? { backgroundColor: '#FBEBF2' } : currentCard.gender === 'Erkek' ? { backgroundColor: '#EBF3FB' } : { backgroundColor: '#F0EEF5' }]}>
                        <T bold style={{ fontSize: 11.5, color: currentCard.gender === 'Kız' ? '#B84570' : currentCard.gender === 'Erkek' ? '#3B72A4' : '#6A5C78' }}>
                          {currentCard.gender === 'Kız' ? '👧 Kız' : currentCard.gender === 'Erkek' ? '👦 Erkek' : '🤍 Üniseks'}
                        </T>
                      </View>
                      <View style={{ backgroundColor: '#F0EAF2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                        <T style={{ fontSize: 10.5, color: colors.purple, fontWeight: '700' }}>
                          {countSyllables(currentCard.name)} {isEn ? 'Syllables' : 'Hece'}
                        </T>
                      </View>
                      {currentCard.quran && (
                        <View style={[ws.matchBadge, { backgroundColor: '#EBF4ED' }]}>
                          <T bold style={{ fontSize: 10, color: '#3E7D52' }}>{isEn ? '📖 Quran' : "📖 Kuran'da Var"}</T>
                        </View>
                      )}
                    </View>

                    <T style={{ fontSize: 11.5, color: colors.muted }}>{currentCard.origin}</T>
                  </View>

                  {/* Büyük İsim & Sesli Oku */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                    <View>
                      <T bold style={{ fontSize: 34, color: colors.ink, letterSpacing: -0.5 }}>{currentCard.name}</T>
                      {surname ? (
                        <T bold style={{ fontSize: 16, color: colors.purple, marginTop: 2 }}>
                          {currentCard.name} {surname} ✨
                        </T>
                      ) : null}
                    </View>
                    <Tap
                      onPress={() => handlePronounce(currentCard.name)}
                      label={isEn ? "Pronounce" : "Sesli oku"}
                      style={{ padding: 8, backgroundColor: '#F4EEF5', borderRadius: 20 }}
                    >
                      <T style={{ fontSize: 18 }}>🔊</T>
                    </Tap>
                  </View>

                  {/* Etiketler */}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                    <View style={ws.catChip}>
                      <T style={{ fontSize: 11, color: '#745778' }}>🏷️ {currentCard.tag}</T>
                    </View>
                    <View style={ws.catChip}>
                      <T style={{ fontSize: 11, color: '#745778' }}>✨ {currentCard.popularity}</T>
                    </View>
                  </View>

                  {/* Anlam & Sembolizm */}
                  <View style={{ backgroundColor: '#FAF7FA', padding: 14, borderRadius: 16, marginTop: 14, borderWidth: 1, borderColor: '#EDE2EE' }}>
                    <T style={{ fontSize: 11, color: colors.purple, letterSpacing: 1, fontWeight: '700' }}>{isEn ? 'MEANING & SYMBOLISM' : 'ANLAM & SEMBOLİZM'}</T>
                    <T style={{ fontSize: 14, color: '#443847', marginTop: 4, lineHeight: 22 }}>
                      {currentCard.meaning}
                    </T>
                  </View>
                </View>

                {/* Kart İpucu */}
                <View style={{ alignItems: 'center', paddingTop: 6 }}>
                  <T style={{ fontSize: 11, color: colors.muted }}>
                    {isEn ? '👈 Swipe Left: Pass · Swipe Right: Like · Star: Finalist 👉' : '👈 Sola: Geç · Sağa: Beğen · Yıldız: Finalist Yap 👉'}
                  </T>
                </View>
              </Animated.View>
            ) : (
              <Card style={{ padding: 32, alignItems: 'center', width: '100%' }}>
                <T style={{ fontSize: 36 }}>✨</T>
                <T bold style={{ fontSize: 16, color: colors.ink, marginTop: 8 }}>
                  {isEn ? 'All names in this filter explored!' : 'Bu filtredeki tüm isimleri incelediniz!'}
                </T>
                <T style={{ fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 4 }}>
                  {isEn ? 'Reset filters or switch to A-Z catalog to discover more.' : 'Filtreleri değiştirebilir veya A-Z fihrist moduna geçip 9000+ isim arasında gezinebilirsin.'}
                </T>
                <Tap
                  onPress={() => setCardIndex(0)}
                  style={{ marginTop: 14, backgroundColor: colors.purple, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 14 }}
                >
                  <T bold style={{ color: 'white', fontSize: 13 }}>{isEn ? 'Restart Deck 🔄' : 'Desteyi Başa Sar 🔄'}</T>
                </Tap>
              </Card>
            )}
          </View>

          {/* İsim Keşif Aksiyon Butonları (Spec 11: Skip, Like, Favorite, Undo) */}
          <View style={ws.tinderControlsRow}>
            {/* ↩️ Geri Al (Undo) */}
            <Tap onPress={undoSwipe} label={isEn ? "Undo" : "Geri al"} style={ws.tinderRoundBtn}>
              <T style={{ fontSize: 20 }}>↩️</T>
            </Tap>

            {/* ❌ Geç (Skip) */}
            <Tap onPress={() => swipeCard('left')} label={isEn ? "Pass" : "Geç"} style={[ws.tinderBigRoundBtn, { borderColor: '#F5C6CB' }]}>
              <T style={{ fontSize: 28, color: '#D44343' }}>✕</T>
            </Tap>

            {/* 🔊 Sesli Oku */}
            <Tap onPress={() => currentCard && handlePronounce(currentCard.name)} label={isEn ? "Pronounce" : "Seslendir"} style={ws.tinderRoundBtn}>
              <T style={{ fontSize: 20 }}>🔊</T>
            </Tap>

            {/* ❤️ Beğen (Like) */}
            <Tap onPress={() => swipeCard('right', false)} label={isEn ? "Like" : "Beğen"} style={[ws.tinderBigRoundBtn, { borderColor: '#F8B4D9' }]}>
              <T style={{ fontSize: 28 }}>❤️</T>
            </Tap>

            {/* ⭐ Finalist / Özel Favori */}
            <Tap
              onPress={() => {
                if (currentCard) {
                  swipeCard('right', true);
                }
              }}
              label={isEn ? "Finalist" : "Finalist"}
              style={[ws.tinderRoundBtn, { backgroundColor: '#FFF7E6', borderColor: '#F2D48E' }]}
            >
              <T style={{ fontSize: 20 }}>⭐</T>
            </Tap>
          </View>
        </View>
      )}

      {/* ─── 2. MOD: A-Z FİHRİST & CANLI ARAMA (9000+ İSİM) ─── */}
      {activeTab === 'catalog' && (
        <View style={{ gap: 12 }}>
          {/* Canlı Arama Kutusu */}
          <View style={ws.inputRow}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={isEn ? 'Search in 9000+ names, meanings...' : '9000+ isim, anlam veya kökende ara...'}
              placeholderTextColor={colors.muted}
              style={ws.input}
            />
            {searchQuery ? (
              <Tap onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
                <T style={{ fontSize: 13, color: colors.muted }}>✕</T>
              </Tap>
            ) : null}
          </View>

          {/* Alfabe Kaydırıcısı (A-Z Harf Seçimi) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ws.alphaScroller}>
            {alphabet.map(letter => (
              <Tap
                key={letter}
                onPress={() => {
                  setLetterFilter(letter);
                  setCatalogPage(1);
                }}
                style={[ws.alphaPill, letterFilter === letter && ws.alphaPillActive]}
              >
                <T bold={letterFilter === letter} style={{ fontSize: 12, color: letterFilter === letter ? 'white' : colors.ink }}>
                  {letter}
                </T>
              </Tap>
            ))}
          </ScrollView>

          {/* Bulunan İsim Sayısı Bildirimi */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <T style={{ fontSize: 12, color: colors.muted }}>
              {isEn ? `${pool.length} names found` : `${pool.length} isim listeleniyor`}
            </T>
            <T style={{ fontSize: 11, color: colors.purple }}>
              {isEn ? `Showing 1 - ${Math.min(catalogPage * 40, pool.length)}` : `Gösterilen: 1 - ${Math.min(catalogPage * 40, pool.length)}`}
            </T>
          </View>

          {/* İsim Kartları */}
          <View style={{ gap: 10 }}>
            {pool.slice(0, catalogPage * 40).map(n => {
              const isFav = favNames.includes(n.id);
              const isFinalist = finalistNames.includes(n.id);
              return (
                <Card key={n.id} style={ws.nameCard}>
                  <View style={{ flex: 1, paddingRight: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <T bold style={{ fontSize: 17, color: colors.ink }}>
                        {surname ? `${n.name} ${surname}` : n.name}
                      </T>

                      <View style={[ws.genderBadge, n.gender === 'Kız' ? { backgroundColor: '#FBEBF2' } : n.gender === 'Erkek' ? { backgroundColor: '#EBF3FB' } : { backgroundColor: '#F0EEF5' }]}>
                        <T style={{ fontSize: 10, color: n.gender === 'Kız' ? '#B84570' : n.gender === 'Erkek' ? '#3B72A4' : '#6A5C78' }}>
                          {n.gender}
                        </T>
                      </View>

                      <View style={{ backgroundColor: '#F2ECF4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                        <T style={{ fontSize: 9.5, color: colors.purple, fontWeight: '700' }}>
                          {countSyllables(n.name)} Hece
                        </T>
                      </View>

                      {n.partnerMatch && (
                        <View style={ws.matchBadge}>
                          <T style={{ fontSize: 9.5, color: '#9B3F63' }}>{isEn ? '💕 Partner Match' : '💕 Eşinle Ortak'}</T>
                        </View>
                      )}

                      {n.quran && (
                        <View style={[ws.matchBadge, { backgroundColor: '#EBF4ED' }]}>
                          <T style={{ fontSize: 9, color: '#3E7D52' }}>{isEn ? '📖 Quranic' : "📖 Kuran'da Var"}</T>
                        </View>
                      )}
                    </View>

                    <T style={{ fontSize: 12.5, color: '#554A58', marginTop: 4, lineHeight: 18 }}>{n.meaning}</T>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <T style={{ fontSize: 10.5, color: colors.muted }}>{n.origin}</T>
                      <T style={{ fontSize: 10.5, color: '#88708E' }}>• {n.tag}</T>
                    </View>
                  </View>

                  {/* Aksiyonlar: Sesli Oku & Favori & Finalist */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Tap onPress={() => handlePronounce(n.name)} label={isEn ? "Pronounce" : "Dinle"} style={{ padding: 6 }}>
                      <T style={{ fontSize: 16 }}>🔊</T>
                    </Tap>
                    <Tap onPress={() => toggleFinalist(n.id)} label={isEn ? 'Finalist' : 'Finalist yap'} style={{ padding: 6 }}>
                      <T style={{ fontSize: 18 }}>{isFinalist ? '⭐' : '☆'}</T>
                    </Tap>
                    <Tap onPress={() => toggleFav(n.id)} label={isEn ? 'Favorite' : 'Favoriye al'} style={ws.favBtn}>
                      <Icon name="heart" size={22} color={isFav ? '#C55B77' : '#BFAEC2'} fill={isFav ? '#C55B77' : 'none'} />
                    </Tap>
                  </View>
                </Card>
              );
            })}
          </View>

          {/* Daha Fazla Göster Butonu */}
          {pool.length > catalogPage * 40 && (
            <Tap
              onPress={() => setCatalogPage(p => p + 1)}
              style={{ paddingVertical: 12, alignItems: 'center', backgroundColor: '#F2E8F4', borderRadius: 14, marginVertical: 8 }}
            >
              <T bold style={{ fontSize: 13, color: colors.purple }}>
                {isEn ? `Show More Names (+40) · ${pool.length - catalogPage * 40} Remaining` : `Daha Fazla İsim Yükle (+40) · Kalan: ${pool.length - catalogPage * 40}`}
              </T>
            </Tap>
          )}
        </View>
      )}

      {/* ─── 3. MOD: KISA LİSTE, EŞLEŞMELER & FİNALİSTLER (Spec 11) ─── */}
      {activeTab === 'shortlist' && (
        <View style={{ gap: 14 }}>
          {/* Paylaş & Dışa Aktar Kartı */}
          <Card style={{ padding: 14, backgroundColor: '#FAF5FB', borderColor: '#EADCEE' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <T bold style={{ fontSize: 15, color: colors.purple }}>
                  {isEn ? 'Family Shortlist' : 'Aile Kısa Listeniz'}
                </T>
                <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 2 }}>
                  {isEn ? 'Share your chosen names directly with your partner or family.' : 'Beğendiğiniz isimleri anlam ve hece tahlilleriyle birlikte paylaşın.'}
                </T>
              </View>
              <Tap
                onPress={copyShortlist}
                style={{ backgroundColor: colors.purple, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <T style={{ fontSize: 13 }}>📋</T>
                <T bold style={{ fontSize: 11.5, color: 'white' }}>{isEn ? 'Copy List' : 'Listeyi Kopyala'}</T>
              </Tap>
            </View>
          </Card>

          {/* Alt Kategori Filtre Butonları (Tüm Favoriler, Ortak Eşleşmeler, Finalistler) */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { id: 'all', label: isEn ? `All (${favNamesObjects.length})` : `Tümü (${favNamesObjects.length})` },
              { id: 'matches', label: isEn ? `Shared (${favNamesObjects.filter(n => n.partnerMatch).length})` : `Ortak (${favNamesObjects.filter(n => n.partnerMatch).length})` },
              { id: 'finalists', label: isEn ? `Finalists (${finalistNamesObjects.length})` : `Finalistler (${finalistNamesObjects.length})` },
            ].map(tab => (
              <Tap
                key={tab.id}
                onPress={() => setShortlistFilter(tab.id)}
                style={[ws.filterPill, shortlistFilter === tab.id && ws.filterPillActive]}
              >
                <T bold={shortlistFilter === tab.id} style={{ fontSize: 11.5, color: shortlistFilter === tab.id ? 'white' : colors.ink }}>
                  {tab.label}
                </T>
              </Tap>
            ))}
          </View>

          {/* Liste Çıktısı */}
          {(() => {
            const listToShow = shortlistFilter === 'finalists'
              ? finalistNamesObjects
              : shortlistFilter === 'matches'
              ? favNamesObjects.filter(n => n.partnerMatch)
              : favNamesObjects;

            if (listToShow.length === 0) {
              return (
                <Card style={{ padding: 28, alignItems: 'center' }}>
                  <T style={{ fontSize: 32 }}>💛</T>
                  <T bold style={{ fontSize: 14, color: colors.ink, marginTop: 8 }}>
                    {isEn ? 'No names found in this category' : 'Bu kategoride kayıtlı isim bulunmuyor'}
                  </T>
                  <T style={{ fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 4 }}>
                    {isEn
                      ? 'Explore cards in discovery mode or star names from the catalog.'
                      : 'İsim Keşfi ekranında kartları sağa kaydırarak veya fihristten yıldızlayarak listeye ekleyebilirsiniz.'}
                  </T>
                </Card>
              );
            }

            return (
              <View style={{ gap: 10 }}>
                {listToShow.map(n => {
                  const isFinalist = finalistNames.includes(n.id);
                  return (
                    <Card key={n.id} style={[ws.nameCard, n.partnerMatch && { borderColor: '#F2D48E', backgroundColor: '#FEFCF5' }]}>
                      <View style={{ flex: 1, paddingRight: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <T bold style={{ fontSize: 17, color: colors.ink }}>
                            {surname ? `${n.name} ${surname}` : n.name}
                          </T>
                          <View style={[ws.genderBadge, n.gender === 'Kız' ? { backgroundColor: '#FBEBF2' } : n.gender === 'Erkek' ? { backgroundColor: '#EBF3FB' } : { backgroundColor: '#F0EEF5' }]}>
                            <T style={{ fontSize: 10, color: n.gender === 'Kız' ? '#B84570' : n.gender === 'Erkek' ? '#3B72A4' : '#6A5C78' }}>
                              {n.gender}
                            </T>
                          </View>
                          <View style={{ backgroundColor: '#F2ECF4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                            <T style={{ fontSize: 9.5, color: colors.purple, fontWeight: '700' }}>
                              {countSyllables(n.name)} Hece
                            </T>
                          </View>
                          {n.partnerMatch && (
                            <View style={[ws.genderBadge, { backgroundColor: '#FCE7CC' }]}>
                              <T bold style={{ fontSize: 9.5, color: '#965E1E' }}>⭐ {isEn ? 'Mutual Match' : 'Ortak Seçim'}</T>
                            </View>
                          )}
                        </View>
                        <T style={{ fontSize: 12.5, color: '#554A58', marginTop: 4, lineHeight: 18 }}>{n.meaning}</T>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <T style={{ fontSize: 10.5, color: colors.muted }}>{n.origin}</T>
                          <T style={{ fontSize: 10.5, color: '#88708E' }}>• {n.tag}</T>
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Tap onPress={() => handlePronounce(n.name)} style={{ padding: 6 }}>
                          <T style={{ fontSize: 16 }}>🔊</T>
                        </Tap>
                        <Tap onPress={() => toggleFinalist(n.id)} style={{ padding: 6 }}>
                          <T style={{ fontSize: 18 }}>{isFinalist ? '⭐' : '☆'}</T>
                        </Tap>
                        <Tap onPress={() => toggleFav(n.id)} style={ws.favBtn}>
                          <Icon name="heart" size={22} color="#C55B77" fill="#C55B77" />
                        </Tap>
                      </View>
                    </Card>
                  );
                })}
              </View>
            );
          })()}
        </View>
      )}

      {/* ─── 4. ORTAK EŞLEŞME KUTLAMA MODALİ (PARTNER MATCH MODAL) ─── */}
      {partnerModalName && (
        <View style={ws.matchModalOverlay}>
          <Card style={ws.matchModalCard}>
            <T style={{ fontSize: 44, textAlign: 'center' }}>🎉 ⭐ 💕</T>
            <T bold style={{ fontSize: 20, color: '#884D1A', textAlign: 'center', marginTop: 8 }}>
              {isEn ? 'IT’S A MUTUAL MATCH!' : 'HARİKA BİR EŞLEŞME!'}
            </T>
            <T style={{ fontSize: 13, color: '#594432', textAlign: 'center', marginTop: 6, lineHeight: 19 }}>
              {isEn
                ? `Both you and your partner loved "${partnerModalName.name}". It is now pinned to your shared shortlist!`
                : `İkiniz de "${partnerModalName.name}" ismini çok beğendiniz! Bebeğiniz için ortak kısa listenize eklendi.`}
            </T>

            <View style={{ backgroundColor: '#FBF5EE', padding: 12, borderRadius: 14, marginVertical: 12, borderWidth: 1, borderColor: '#EDD6BD' }}>
              <T bold style={{ fontSize: 15, color: colors.ink }}>
                {surname ? `${partnerModalName.name} ${surname}` : partnerModalName.name} ({partnerModalName.gender})
              </T>
              <T style={{ fontSize: 12, color: '#6A5644', marginTop: 2 }}>{partnerModalName.meaning}</T>
              <T style={{ fontSize: 11, color: colors.purple, marginTop: 4 }}>
                {countSyllables(partnerModalName.name)} Hece · {partnerModalName.origin}
              </T>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Tap
                onPress={() => setPartnerModalName(null)}
                style={{ flex: 1, paddingVertical: 11, alignItems: 'center', backgroundColor: '#F0E5D8', borderRadius: 14 }}
              >
                <T bold style={{ fontSize: 12.5, color: '#664B35' }}>{isEn ? 'Keep Swiping' : 'Keşfe Devam Et'}</T>
              </Tap>
              <Tap
                onPress={() => {
                  setPartnerModalName(null);
                  setActiveTab('shortlist');
                }}
                style={{ flex: 1, paddingVertical: 11, alignItems: 'center', backgroundColor: colors.purple, borderRadius: 14 }}
              >
                <T bold style={{ fontSize: 12.5, color: 'white' }}>{isEn ? 'View Shortlist' : 'Kısa Listeyi Gör'}</T>
              </Tap>
            </View>
          </Card>
        </View>
      )}
    </View>
  );
}

const ws = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,10,25,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  modalActionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  weightInputBox: {
    borderWidth: 1,
    borderColor: '#D8CADC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: 'white',
  },
  noteInputBox: {
    borderWidth: 1,
    borderColor: '#E6DEE8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.ink,
    backgroundColor: '#FAFAF8',
  },
  historyCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'white',
  },
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

  // Tinder Card & Swipe Engine Styles
  deckContainer: {
    height: 410,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  tinderCard: {
    position: 'absolute',
    width: '100%',
    height: 390,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#EAE1EC',
    justifyContent: 'space-between',
    ...shadow.soft,
  },
  stampBadge: {
    position: 'absolute',
    top: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 3,
    zIndex: 10,
  },
  likeStamp: {
    right: 20,
    borderColor: '#2E9E52',
    transform: [{ rotate: '15deg' }],
  },
  likeStampText: {
    color: '#2E9E52',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  },
  passStamp: {
    left: 20,
    borderColor: '#D44343',
    transform: [{ rotate: '-15deg' }],
  },
  passStampText: {
    color: '#D44343',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  },
  partnerRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF6E4',
    borderWidth: 1,
    borderColor: '#F2D288',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  tinderControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 4,
    paddingBottom: 6,
  },
  tinderRoundBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E6DCE6',
    ...shadow.soft,
  },
  tinderBigRoundBtn: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F0D4E0',
    ...shadow.soft,
  },
  alphaScroller: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  alphaPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3EAF4',
  },
  alphaPillActive: {
    backgroundColor: colors.purple,
  },
  modeTabRow: {
    flexDirection: 'row',
    backgroundColor: '#EAE1EC',
    borderRadius: 16,
    padding: 4,
  },
  modeTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
  },
  modeTabBtnActive: {
    backgroundColor: 'white',
    ...shadow.soft,
  },
  matchModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 20,
  },
  matchModalCard: {
    width: '100%',
    maxWidth: 380,
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F2D48E',
    ...shadow.card,
  },

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
