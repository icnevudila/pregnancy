import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Animated, PanResponder, Dimensions, Platform } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section, Progress, ScreenHero, InfoNote, MetricCard, StatusCard, ProgressRing, ToolExperienceCard } from './ui';
import { uid, localDay } from './domain.mjs';
import { babyNamesList, nameThemes, nameOrigins, getLocalizedBabyName } from './babyNamesData';
import { speakText, isSpeaking, stopSpeech } from './speechService';

// ─── 4. KİLO TAKİBİ (WEIGHT TRACKER) ─────────────────────────────────────────
export function WeightTracker({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
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
      toast && toast(isEn ? 'Please enter a valid weight. E.g. 65.5' : 'Lütfen geçerli bir kilo girin. Örn: 65.5');
      return;
    }
    const newEntry = {
      id: uid(),
      value: parseFloat(val.toFixed(1)),
      week: state.week || 24,
      date: localDay(),
      time: new Date().toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };
    update(old => ({
      weights: [newEntry, ...(old.weights || [])],
    }));
    setWeightInput('');
    toast && toast(isEn ? `⚖️ Weight logged: ${val.toFixed(1)} kg` : `⚖️ Kilo kaydedildi: ${val.toFixed(1)} kg`);
  }

  function adjustQuick(delta) {
    const nextVal = currentWeight + delta;
    logWeight(nextVal);
  }

  const isGainInRange = totalGained >= minExpectedGain && totalGained <= maxExpectedGain;

  return (
    <View style={ws.container}>
      <ScreenHero
        asset="ui_weight_bmi_gauge"
        icon="scale"
        kicker={isEn ? "WEEKLY WEIGHT TRACKER" : "HAFTALIK KİLO TAKİBİ"}
        title={isEn ? "Gestational Weight Dashboard" : "Gestasyonel Kilo Paneli"}
        body={isEn ? "Track your weight curve according to IOM and WHO pregnancy corridors. Weigh yourself at the same time and in similar clothes." : "IOM ve DSÖ gebelik koridoruna göre kilo eğrinizi takip edin. Ölçümleri aynı saatte ve benzer kıyafetle yapın."}
        stat={`${weights.length} ${isEn ? 'entries' : 'ölçüm'}`}
        tint="#4F8464"
      />
      <ToolExperienceCard lang={lang} title={isEn ? 'Watch the trend, not one number' : 'Tek sayıya değil eğilime bak'} steps={isEn ? ['Enter a weekly measurement.', 'Compare it with your personal curve.', 'Keep notes for your visit.'] : ['Haftalık ölçümü gir.', 'Kişisel eğrinle karşılaştır.', 'Kontrol için notunu sakla.']} outcome={isEn ? 'The tool becomes a pregnancy weight diary.' : 'Araç hamilelik kilo günlüğü gibi çalışır.'} asset="ui_weight_bmi_gauge" tint="#3E7B54" />

      {/* İkili Metrik Kartları */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <MetricCard
          title={isEn ? "CURRENT WEIGHT" : "GÜNCEL KİLO"}
          value={`${currentWeight}`}
          unit="kg"
          subtext={isEn ? `Starting: ${startWeight} kg` : `Başlangıç: ${startWeight} kg`}
          icon="scale"
          tint="#4F8464"
        />
        <MetricCard
          title={isEn ? "TOTAL CHANGE" : "TOPLAM DEĞİŞİM"}
          value={totalGained >= 0 ? `+${totalGained}` : `${totalGained}`}
          unit="kg"
          subtext={isGainInRange ? (isEn ? "In ideal target corridor" : "İdeal takip koridorunda") : (isEn ? "Personal trend" : "Kişisel eğilim")}
          icon="milestone"
          tint="#844E86"
        />
      </View>

      {/* IOM Kılavuz Kartı */}
      <StatusCard
        level={isGainInRange ? "safe" : "warning"}
        title={isEn ? `Week ${week} Recommended Band: +${minExpectedGain} kg to +${maxExpectedGain} kg` : `${week}. Hafta Önerilen Kilo Bandı: +${minExpectedGain} kg ile +${maxExpectedGain} kg`}
        body={isGainInRange
          ? (isEn ? "You are doing great! Your weight gain is progressing within international standard guidelines for your week." : "Harika gidiyorsunuz! Kilo artışınız gebelik haftanıza göre uluslararası standart bantta ilerliyor.")
          : (isEn ? "Weight gain is evaluated by weekly trends. If you experience sudden swelling, consult your doctor." : "Kilo artışı haftalık eğilimle değerlendirilir. Ani ödem veya endişeniz olursa doktor kontrolünüzde danışın.")
        }
        icon="scale"
      />

      {/* Hızlı Kilo Ekleme & Dokunmatik Butonlar */}
      <Card style={{ padding: 14 }}>
        <T bold style={{ fontSize: 13, color: colors.ink, marginBottom: 8 }}>{isEn ? 'Quick Log Weight:' : 'Hızlı Kilo Kaydet:'}</T>
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
            placeholder={isEn ? `Current weight (e.g. ${currentWeight})` : `Güncel kilonuz (Örn: ${currentWeight})`}
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            style={ws.input}
            onSubmitEditing={() => logWeight()}
          />
          <Tap onPress={() => logWeight()} label={isEn ? 'Log' : 'Kaydet'} style={ws.addBtn}>
            <T bold style={{ color: 'white', fontSize: 13.5 }}>{isEn ? 'Save' : 'Kaydet'}</T>
          </Tap>
        </View>
      </Card>

      {/* Geçmiş Kilo Kayıtları */}
      <Section title={isEn ? "Weight Measurement History" : "Kilo Ölçüm Geçmişi"} />
      {weights.length === 0 ? (
        <Card style={{ padding: 18, alignItems: 'center' }}>
          <T bold style={{ color: colors.ink, fontSize: 14 }}>{isEn ? "Add your first measurement" : "İlk ölçümü ekleyin"}</T>
          <T style={{ color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
            {isEn ? "Weighing yourself at similar times and on an empty stomach gives more reliable trends." : "Benzer saatlerde ve aç karnına tartılmak eğilimi daha güvenilir gösterir."}
          </T>
        </Card>
      ) : (
        weights.map(w => {
          const diff = (w.value - startWeight).toFixed(1);
          return (
            <View key={w.id} style={ws.historyRow}>
              <View>
                <T bold style={{ fontSize: 15 }}>{w.value} kg</T>
                <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                  {w.date} · {w.time} · {isEn ? `Week ${w.week}` : `${w.week}. Hafta`}
                </T>
              </View>
              <View style={[ws.badge, { backgroundColor: diff >= 0 ? '#EAF4EF' : '#F7ECEC' }]}>
                <T bold style={{ fontSize: 12, color: diff >= 0 ? '#38734B' : '#A03B3B' }}>
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
export function BirthPlanBuilder({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const plan = state.birthPlan || {};
  const [selectedCat, setSelectedCat] = useState(isEn ? 'All' : 'Tümü');
  const [showDoctorSheet, setShowDoctorSheet] = useState(false);

  const defaultBirthPlanOptions = isEn ? [
    { id: 'bp1', cat: 'Birth Environment', title: 'Dim and quiet lighting', desc: 'A soothing, warm, and peaceful room atmosphere' },
    { id: 'bp2', cat: 'Birth Environment', title: 'Calming background playlist', desc: 'My curated relaxation and gentle wave music' },
    { id: 'bp3', cat: 'Birth Environment', title: 'Freedom of movement & birth ball', desc: 'Vertical and active mobility rather than staying confined in bed' },
    { id: 'bp4', cat: 'Pain Relief', title: 'Natural breathing & hypnobirthing', desc: 'Non-pharmacological pain management and deep breathing cycles' },
    { id: 'bp5', cat: 'Pain Relief', title: 'Epidural available upon request', desc: 'Option to receive an epidural when pain threshold is reached' },
    { id: 'bp6', cat: 'When Baby Arrives', title: 'Immediate Golden Hour skin-to-skin', desc: 'Baby placed directly on mom’s chest right after delivery' },
    { id: 'bp7', cat: 'When Baby Arrives', title: 'Delayed cord clamping', desc: 'Wait 1-3 minutes until umbilical cord pulsations cease' },
    { id: 'bp8', cat: 'When Baby Arrives', title: 'First colostrum nursing in Golden Hour', desc: 'Initiate first breastfeeding within the very first hour of birth' },
  ] : [
    { id: 'bp1', cat: 'Doğum Ortamı', title: 'Loş ve sakin ışıklandırma', desc: 'Rahatlatıcı, loş ve huzurlu bir oda atmosferi' },
    { id: 'bp2', cat: 'Doğum Ortamı', title: 'Sakinleştirici arka plan müziği', desc: 'Kendi hazırladığım gevşeme ve dalga çalma listesi' },
    { id: 'bp3', cat: 'Doğum Ortamı', title: 'Serbest hareket & pilates topu', desc: 'Yatakta sabit kalmak yerine dikey ve aktif pozisyonlar' },
    { id: 'bp4', cat: 'Ağrı Yönetimi', title: 'Doğal nefes ve gevşeme teknikleri', desc: 'İlaçsız rahatlama ve derin nefes döngüleri' },
    { id: 'bp5', cat: 'Ağrı Yönetimi', title: 'Gerektiğinde epidural anestezi', desc: 'Ağrı eşiğim zorlandığında epidural opsiyonunun hazır olması' },
    { id: 'bp6', cat: 'Bebek Doğunca', title: 'İlk saat Ten Tene Temas', desc: 'Kordon kesildikten sonra hemen anne göğsüne verilmesi' },
    { id: 'bp7', cat: 'Bebek Doğunca', title: 'Geç kordon klempleme', desc: 'Kordon pulsasyonunun durması beklenerek (1-3 dk) klemplenmesi' },
    { id: 'bp8', cat: 'Bebek Doğunca', title: 'İlk saat kolostrum ile emzirme', desc: 'Altın saatte anne sütüyle ilk bağın kurulması' },
  ];

  const birthPlanCategories = isEn
    ? ['All', 'Birth Environment', 'Pain Relief', 'When Baby Arrives']
    : ['Tümü', 'Doğum Ortamı', 'Ağrı Yönetimi', 'Bebek Doğunca'];

  function toggleOption(id) {
    const nextVal = !plan[id];
    update(old => ({
      birthPlan: { ...(old.birthPlan || {}), [id]: nextVal },
    }));
  }

  const selectedCount = Object.values(plan).filter(Boolean).length;
  const totalOptions = defaultBirthPlanOptions.length;
  const planPercent = Math.round((selectedCount / totalOptions) * 100);

  const filteredOptions = (selectedCat === 'Tümü' || selectedCat === 'All')
    ? defaultBirthPlanOptions
    : defaultBirthPlanOptions.filter(o => o.cat === selectedCat);

  const selectedList = defaultBirthPlanOptions.filter(o => plan[o.id]);

  return (
    <View style={ws.container}>
      <ScreenHero
        asset="ui_birth_plan_scroll"
        icon="book"
        kicker={isEn ? 'BIRTH PREPARATION' : 'DOĞUM HAZIRLIĞI'}
        title={isEn ? 'Gather Your Birth Preferences' : 'Tercihlerini tek sayfada topla'}
        body={isEn ? 'Turn environment, pain control, and postpartum preferences into a clean, shareable plan.' : 'Ortam, ağrı kontrolü ve ilk temas tercihlerini sade, paylaşılabilir bir plana dönüştür.'}
        stat={isEn ? `${selectedCount}/${totalOptions} choices` : `${selectedCount}/${totalOptions} tercih`}
        tint="#946635"
      />
      <ToolExperienceCard lang={lang} title={isEn ? 'Turn preferences into a shareable summary' : 'Tercihleri paylaşılabilir özete çevir'} steps={isEn ? ['Choose comfort and support preferences.', 'Review the ready percentage.', 'Open the summary before your birth conversation.'] : ['Konfor ve destek tercihlerini seç.', 'Hazırlık yüzdesini gör.', 'Doğum görüşmesi öncesi özeti aç.']} outcome={isEn ? 'It feels like a finished birth preference form.' : 'Bitmiş bir doğum tercih formu hissi verir.'} asset="ui_birth_plan_scroll" tint="#8A5A2B" />

      {/* İlerleme & İstatistik Kartı */}
      <Card style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <T bold style={{ fontSize: 16, color: colors.ink }}>
              {isEn ? 'Birth Preference Summary' : 'Doğum Tercih Özeti'}
            </T>
            <T style={{ fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 18 }}>
              {selectedCount === totalOptions
                ? (isEn ? 'All core preferences set. Review with your doctor during visit.' : 'Tüm temel tercihler belirlendi. Muayenede doktorunla inceleyebilirsin.')
                : (isEn ? `${totalOptions - selectedCount} items pending. Prepare your birth team guide.` : `${totalOptions - selectedCount} başlık henüz seçilmedi. Doğum ekibin için rehber hazırla.`)}
            </T>
            <Tap
              onPress={() => setShowDoctorSheet(!showDoctorSheet)}
              label={isEn ? 'Doctor Presentation Summary' : 'Doktora Sunum Özeti'}
              style={[ws.presentationBtn, showDoctorSheet && { backgroundColor: '#EADCEE' }]}
            >
              <Icon name="clipboard" size={14} color={colors.purple} />
              <T bold style={{ fontSize: 11, color: colors.purple }}>
                {showDoctorSheet
                  ? (isEn ? 'Back to Edit Mode' : 'Düzenleme Moduna Dön')
                  : (isEn ? '📋 Share Summary' : '📋 Özeti Paylaş')}
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
            <T style={{ fontSize: 9, color: colors.muted }}>{isEn ? 'ready' : 'hazır'}</T>
          </ProgressRing>
        </View>
      </Card>

      {/* Paylaşılabilir Özet Modu */}
      {showDoctorSheet ? (
        <Card style={ws.clinicalSheet}>
          <View style={ws.clinicalHeader}>
            <View>
              <T bold style={{ fontSize: 16, color: '#2C3E50' }}>
                {isEn ? 'MOMORA BIRTH PREFERENCE FORM' : 'MOMORA DOĞUM TERCİH FORMU'}
              </T>
              <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                {isEn ? 'Mother-to-be: ' : 'Anne Adayı: '}{state.user?.name || (isEn ? 'Momora Mother' : 'Momora Annesi')} · {isEn ? `Week ${state.week || 24}` : `${state.week || 24}. Gebelik Haftası`}
              </T>
            </View>
            <View style={ws.clinicalBadge}>
              <T bold style={{ fontSize: 10, color: '#3E7B54' }}>{isEn ? 'SUMMARY DOC' : 'ÖZET BELGE'}</T>
            </View>
          </View>

          {selectedList.length === 0 ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <T style={{ fontSize: 13, color: colors.muted }}>{isEn ? 'No preferences selected yet.' : 'Henüz bir tercih seçilmedi.'}</T>
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
            {isEn
              ? '* This plan is a flexible conversation guide for your birth team.'
              : '* Bu plan doğum ekibiyle konuşmayı kolaylaştıran esnek bir tercih özetidir.'}
          </T>
        </Card>
      ) : (
        <>
          <StatusCard
            level="info"
            icon="info"
            title={isEn ? "Flexible Birth Preference" : "Esnek Doğum Tercihi"}
            body={isEn ? "A birth plan is a collaborative, flexible guide rather than a rigid contract." : "Doğum planı bir talimatname değil, annenin konforunu ve ekiple iletişimi güçlendiren esnek bir rehberdir."}
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
export function DoctorQuestions({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [newQ, setNewQ] = useState('');
  const [readingMode, setReadingMode] = useState(false);

  const suggestedTrimesterQuestions = isEn ? [
    { text: 'When is the right time for 24-28w Glucose Challenge Test (OGTT)?', tag: 'Labs' },
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
    { id: 'dq1', text: 'Should I increase my iron or prenatal vitamin supplements this week?', done: false },
    { id: 'dq2', text: 'Do I need a doctor clearance report for air travel or journeys?', done: false },
    { id: 'dq3', text: 'Are the tightenings Braxton Hicks or signs of cervical dilation?', done: false },
  ] : [
    { id: 'dq1', text: 'Bu hafta demir veya vitamin takviyelerimi artırmalı mıyım?', done: false },
    { id: 'dq2', text: 'Yolculuk veya seyahat için hekim onayı raporu almalı mıyım?', done: false },
    { id: 'dq3', text: 'Hissedilen kasılmalar Braxton Hicks mi yoksa servikal açılma mı?', done: false },
  ];

  const questions = state.lists?.questions || defaultQuestions;

  const defaultQMapEn = {
    'dq1': 'Should I increase my iron or prenatal vitamin supplements this week?',
    'dq2': 'Do I need a doctor clearance report for air travel or journeys?',
    'dq3': 'Are the tightenings Braxton Hicks or signs of cervical dilation?',
  };
  const getQText = q => (isEn ? (defaultQMapEn[q.id] || q.text) : q.text);

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
    toast && toast(isEn ? 'Question added to list' : 'Soru listeye eklendi');
  }

  const openCount = questions.filter(q => !q.done).length;
  const answeredCount = questions.filter(q => q.done).length;

  return (
    <View style={ws.container}>
      <ScreenHero
        asset="ui_doctor_prep_notebook"
        icon="chat"
        kicker={isEn ? 'VISIT PREP' : 'KONTROL HAZIRLIĞI'}
        title={isEn ? "Don't Forget at Visit" : "Randevuda unutma"}
        body={isEn ? 'Keep questions open and mark answered ones; keep your checklist ready for your next checkup.' : 'Soruları açık, yanıtlananları kapalı tut; sonraki muayene için gündemin eksiksiz olsun.'}
        stat={isEn ? `${openCount} open questions` : `${openCount} açık soru`}
        tint="#7C5C96"
      />
      <ToolExperienceCard lang={lang} title={isEn ? 'Never lose the important question' : 'Önemli soruyu kaybetme'} steps={isEn ? ['Add questions as they come to mind.', 'Group them before the visit.', 'Mark answered items afterwards.'] : ['Aklına geldikçe soruları ekle.', 'Kontrol öncesi gruplandır.', 'Sonra yanıtlananları işaretle.']} outcome={isEn ? 'The screen becomes a visit prep notebook.' : 'Ekran randevu hazırlık defteri gibi çalışır.'} asset="ui_doctor_prep_notebook" tint="#6A4482" />

      {/* Metrik Göstergeleri */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <MetricCard
          title={isEn ? "OPEN QUESTIONS" : "AÇIK SORULAR"}
          value={openCount}
          unit={isEn ? "items" : "adet"}
          subtext={isEn ? "To ask doctor" : "Muayenede sorulacak"}
          icon="chat"
        />
        <MetricCard
          title={isEn ? "ANSWERED" : "YANITLANANLAR"}
          value={answeredCount}
          unit={isEn ? "completed" : "tamamlandı"}
          subtext={isEn ? "In past checkups" : "Önceki kontrollerde"}
          icon="check"
        />
      </View>

      {/* Muayene Odası Okuma Modu Butonu */}
      <Card style={{ padding: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <T bold style={{ fontSize: 14 }}>{isEn ? 'Exam Room Reading Mode' : 'Muayene Odası Okuma Modu'}</T>
            <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
              {isEn ? 'Opens high-contrast, large text view for showing your doctor.' : 'Doktora gösterirken büyük puntolu, yüksek kontrastlı ekran açar.'}
            </T>
          </View>
          <Tap
            onPress={() => setReadingMode(!readingMode)}
            label={isEn ? 'Toggle Mode' : 'Mod Değiştir'}
            style={[ws.modeToggle, readingMode && { backgroundColor: colors.purple }]}
          >
            <T bold style={{ fontSize: 11, color: readingMode ? 'white' : colors.purple }}>
              {readingMode ? (isEn ? 'Standard Mode' : 'Standart Mod') : (isEn ? '🔍 Large View' : '🔍 Büyük Görünüm')}
            </T>
          </Tap>
        </View>
      </Card>

      {readingMode ? (
        /* Yüksek Kontrastlı Muayene Okuma Kartı */
        <Card style={ws.readingCard}>
          <T bold style={{ fontSize: 18, color: '#1B2A4A', marginBottom: 14 }}>
            {isEn ? `📋 Questions for My Doctor (${openCount})` : `📋 Doktoruma Sorulacaklar (${openCount})`}
          </T>
          {openCount === 0 ? (
            <T style={{ fontSize: 16, color: colors.muted, textAlign: 'center', paddingVertical: 20 }}>
              {isEn ? 'No pending questions at the moment.' : 'Şu an bekleyen açık soru bulunmuyor.'}
            </T>
          ) : (
            questions.filter(q => !q.done).map((q, idx) => (
              <View key={q.id} style={ws.readingItem}>
                <View style={ws.readingBadge}>
                  <T bold style={{ fontSize: 13, color: 'white' }}>{idx + 1}</T>
                </View>
                <T bold style={{ flex: 1, fontSize: 16, color: '#1A1824', lineHeight: 24 }}>
                  {getQText(q)}
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
              placeholder={isEn ? 'Question to ask during visit...' : 'Randevuda konuşmak istediğin soru...'}
              placeholderTextColor={colors.muted}
              style={ws.input}
              onSubmitEditing={() => addQ()}
            />
            <Tap onPress={() => addQ()} label={isEn ? 'Add' : 'Ekle'} style={ws.addBtn}>
              <Icon name="plus" size={18} color="white" />
            </Tap>
          </View>

          {/* Haftaya Özel Önerilen Sorular */}
          <View style={{ gap: 8 }}>
            <T bold style={{ fontSize: 12, color: colors.muted, letterSpacing: 0.5 }}>
              {isEn ? '💡 RECOMMENDED QUESTIONS FOR THIS WEEK' : '💡 BU HAFTA İÇİN ÖNERİLEN MEDİKAL SORULAR'}
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
            {questions.map(q => {
              const textToShow = getQText(q);
              return (
                <Tap
                  key={q.id}
                  onPress={() => toggleQ(q.id)}
                  label={textToShow}
                  style={[ws.planCard, q.done && { backgroundColor: '#F8F5F8', opacity: 0.8 }]}
                >
                  <View style={[ws.planCheck, q.done && ws.planCheckActive]}>
                    {q.done && <Icon name="check" size={14} color="white" />}
                  </View>
                  <T style={[ws.checkText, q.done && { textDecorationLine: 'line-through', color: colors.muted }]}>
                    {textToShow}
                  </T>
                </Tap>
              );
            })}
          </View>

          <StatusCard
            level="safe"
            icon="check"
            title={isEn ? "Check off after visit" : "Randevu Sonrası Tamamla"}
            description={isEn ? "Tap items answered by your doctor; automatically stays updated for next time." : "Doktorundan yanıt aldığın maddelerin üzerini tıkla; sonraki kontrol için otomatik olarak güncel kalır."}
          />
        </>
      )}
    </View>
  );
}

// ─── 7. BEBEK İSİMLERİ KÜTÜPHANESİ & TİNDER İSİM MOTORU ──────────────────────
export function BabyNameMatcher({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const favNames = state.favNames || [];

  // Tab mode: 'tinder' (Tinder Keşif) | 'catalog' (A-Z Fihrist) | 'favorites' (Kısa Liste)
  const [activeTab, setActiveTab] = useState('tinder');

  // Filtreler & Arama
  const [genderFilter, setGenderFilter] = useState('Tümü');
  const [themeFilter, setThemeFilter] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [letterFilter, setLetterFilter] = useState('Tümü');
  const [catalogPage, setCatalogPage] = useState(1);
  const [partnerModalName, setPartnerModalName] = useState(null);

  // Tinder Swipe Motoru Değişkenleri & Fizik
  const [cardIndex, setCardIndex] = useState(0);
  const [historyStack, setHistoryStack] = useState([]); // [{ index, nameId, direction }]
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

  // Filtre değiştiğinde Tinder kart indeksini güvenli sıfırla
  useEffect(() => {
    setCardIndex(0);
    pan.setValue({ x: 0, y: 0 });
  }, [genderFilter, themeFilter]);

  const currentCard = pool[cardIndex] || null;
  const nextCard = pool[cardIndex + 1] || null;
  const partnerMatchesCount = useMemo(() => babyNamesList.filter(n => n.partnerMatch).length, []);
  const favNamesObjects = useMemo(() => babyNamesList.filter(n => favNames.includes(n.id)), [favNames]);

  // Kart Fırlatma ve Kaydırma Mantığı (Swipe)
  function swipeCard(direction) {
    if (!currentCard) return;
    const targetX = direction === 'right' ? 500 : -500;
    Animated.timing(pan, {
      toValue: { x: targetX, y: 0 },
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      pan.setValue({ x: 0, y: 0 });
      setHistoryStack(prev => [{ index: cardIndex, nameId: currentCard.id, direction }, ...prev]);

      if (direction === 'right') {
        if (!favNames.includes(currentCard.id)) {
          update({ favNames: [...favNames, currentCard.id] });
        }
        if (currentCard.partnerMatch) {
          setPartnerModalName(currentCard);
        } else {
          toast && toast(isEn ? `Added "${currentCard.name}" to favorites ❤️` : `"${currentCard.name}" favorilere eklendi ❤️`);
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
      update({ favNames: favNames.filter(id => id !== lastAction.nameId) });
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
    update({ favNames: updated });
    toast && toast(exists ? (isEn ? 'Removed from favorites' : 'Favorilerden çıkarıldı') : (isEn ? 'Added to favorites 💛' : 'Favorilere eklendi 💛'));
  }

  // Kısa Listeyi Kopyala
  function copyShortlist() {
    if (favNamesObjects.length === 0) {
      toast && toast(isEn ? 'No favorites yet' : 'Henüz favori listeniz boş');
      return;
    }
    const text = favNamesObjects.map(n => `• ${n.name} (${n.gender}) - ${n.meaning} [${n.origin}]`).join('\n\n');
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
        icon="heart"
        kicker={isEn ? 'NAME DISCOVERY ENGINE' : 'İSİM KEŞİF MOTORU'}
        title={isEn ? '9000+ Names & Tinder Swipe' : '9000+ İsim & Tinder Kaydırma'}
        body={isEn ? 'Swipe right to love, left to pass. Uncover shared partner favorites and browse the extensive Turkish & universal archive.' : 'Sağa kaydırarak beğen, sola kaydırarak geç. Eşinle ortak beğendiklerini anında keşfet ve 9000+ zengin isim arşivinde gezin.'}
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
          subtext={isEn ? "Liked by your partner" : "Eşinin de beğendiği"}
          icon="heart"
          tint="#C55B77"
        />
      </View>

      {/* Görünüm Modu Değiştirici Tab Çubuğu */}
      <View style={ws.modeTabRow}>
        <Tap
          onPress={() => setActiveTab('tinder')}
          style={[ws.modeTabBtn, activeTab === 'tinder' && ws.modeTabBtnActive]}
        >
          <T style={{ fontSize: 13 }}>🃏</T>
          <T bold={activeTab === 'tinder'} style={{ fontSize: 12, color: activeTab === 'tinder' ? colors.purple : colors.muted }}>
            {isEn ? 'Tinder Swipe' : 'Tinder Keşif'}
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
          onPress={() => setActiveTab('favorites')}
          style={[ws.modeTabBtn, activeTab === 'favorites' && ws.modeTabBtnActive]}
        >
          <T style={{ fontSize: 13 }}>💕</T>
          <T bold={activeTab === 'favorites'} style={{ fontSize: 12, color: activeTab === 'favorites' ? colors.purple : colors.muted }}>
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

      {/* ─── 1. MOD: TINDER STİLİ İSİM KAYDIRMA (CARD SWIPER) ─── */}
      {activeTab === 'tinder' && (
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

                {/* Kart Başlığı: Cinsiyet, Köken, Kuran */}
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
                    <T bold style={{ fontSize: 34, color: colors.ink, letterSpacing: -0.5 }}>{currentCard.name}</T>
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

                  {/* Derin Şiirsel Anlam */}
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
                    {isEn ? '👈 Swipe Left to Pass · Swipe Right to Like 👉' : '👈 Pas Geçmek İçin Sola · Beğenmek İçin Sağa Çek 👉'}
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

          {/* Tinder Aksiyon Butonları Çubuğu */}
          <View style={ws.tinderControlsRow}>
            {/* ↩️ Geri Al (Undo) */}
            <Tap onPress={undoSwipe} label={isEn ? "Undo" : "Geri al"} style={ws.tinderRoundBtn}>
              <T style={{ fontSize: 20 }}>↩️</T>
            </Tap>

            {/* ❌ Geç (Pass) */}
            <Tap onPress={() => swipeCard('left')} label={isEn ? "Pass" : "Geç"} style={[ws.tinderBigRoundBtn, { borderColor: '#F5C6CB' }]}>
              <T style={{ fontSize: 28, color: '#D44343' }}>✕</T>
            </Tap>

            {/* 🔊 Sesli Oku */}
            <Tap onPress={() => currentCard && handlePronounce(currentCard.name)} label={isEn ? "Pronounce" : "Seslendir"} style={ws.tinderRoundBtn}>
              <T style={{ fontSize: 20 }}>🔊</T>
            </Tap>

            {/* ❤️ Beğen (Like) */}
            <Tap onPress={() => swipeCard('right')} label={isEn ? "Like" : "Beğen"} style={[ws.tinderBigRoundBtn, { borderColor: '#F8B4D9' }]}>
              <T style={{ fontSize: 28 }}>❤️</T>
            </Tap>

            {/* ⭐ Eşle Paylaş */}
            <Tap
              onPress={() => {
                if (currentCard) {
                  toggleFav(currentCard.id);
                  setPartnerModalName(currentCard);
                }
              }}
              label={isEn ? "Match" : "Eşleş"}
              style={ws.tinderRoundBtn}
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
              return (
                <Card key={n.id} style={ws.nameCard}>
                  <View style={{ flex: 1, paddingRight: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <T bold style={{ fontSize: 17, color: colors.ink }}>{n.name}</T>

                      <View style={[ws.genderBadge, n.gender === 'Kız' ? { backgroundColor: '#FBEBF2' } : n.gender === 'Erkek' ? { backgroundColor: '#EBF3FB' } : { backgroundColor: '#F0EEF5' }]}>
                        <T style={{ fontSize: 10, color: n.gender === 'Kız' ? '#B84570' : n.gender === 'Erkek' ? '#3B72A4' : '#6A5C78' }}>
                          {n.gender}
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

                  {/* Aksiyonlar: Sesli Oku & Favori */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Tap onPress={() => handlePronounce(n.name)} label={isEn ? "Pronounce" : "Dinle"} style={{ padding: 6 }}>
                      <T style={{ fontSize: 16 }}>🔊</T>
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

      {/* ─── 3. MOD: KISA LİSTE & ORTAK EŞLEŞMELER ─── */}
      {activeTab === 'favorites' && (
        <View style={{ gap: 14 }}>
          {/* Paylaş & Dışa Aktar Kartı */}
          <Card style={{ padding: 14, backgroundColor: '#FAF5FB', borderColor: '#EADCEE' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <T bold style={{ fontSize: 15, color: colors.purple }}>
                  {isEn ? 'Family Shortlist' : 'Aile Kısa Listeniz'}
                </T>
                <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 2 }}>
                  {isEn ? 'Share your liked names directly with your partner or family.' : 'Beğendiğiniz isimleri anlamlarıyla birlikte eşinize veya ailenize mesaj olarak gönderin.'}
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

          {/* Eşinizle Ortak Eşleşen İsimler Vurgusu */}
          {favNamesObjects.filter(n => n.partnerMatch).length > 0 && (
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <T style={{ fontSize: 16 }}>⭐</T>
                <T bold style={{ fontSize: 14, color: '#B37B24' }}>
                  {isEn ? 'Shared Partner Favorites (Mutual Matches)' : 'Eşinizle Ortak Beğendiğiniz İsimler'}
                </T>
              </View>
              {favNamesObjects.filter(n => n.partnerMatch).map(n => (
                <Card key={n.id} style={[ws.nameCard, { borderColor: '#F2D48E', backgroundColor: '#FEFCF5' }]}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <T bold style={{ fontSize: 18, color: colors.ink }}>{n.name}</T>
                      <View style={[ws.genderBadge, { backgroundColor: '#FCE7CC' }]}>
                        <T bold style={{ fontSize: 10, color: '#965E1E' }}>⭐ {isEn ? 'Mutual Match' : 'Ortak Seçim'}</T>
                      </View>
                    </View>
                    <T style={{ fontSize: 12.5, color: '#554A58', marginTop: 4 }}>{n.meaning}</T>
                  </View>
                  <Tap onPress={() => toggleFav(n.id)} style={ws.favBtn}>
                    <Icon name="heart" size={22} color="#C55B77" fill="#C55B77" />
                  </Tap>
                </Card>
              ))}
            </View>
          )}

          {/* Tüm Favori İsimler Listesi */}
          <Section title={isEn ? `All Saved Favorites (${favNamesObjects.length})` : `Kayıtlı Tüm Favoriler (${favNamesObjects.length})`} />
          {favNamesObjects.length === 0 ? (
            <Card style={{ padding: 28, alignItems: 'center' }}>
              <T style={{ fontSize: 32 }}>💛</T>
              <T bold style={{ fontSize: 14, color: colors.ink, marginTop: 8 }}>
                {isEn ? 'No favorites saved yet' : 'Henüz favori isim kaydetmediniz'}
              </T>
              <T style={{ fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 4 }}>
                {isEn ? 'Swipe right on the Tinder deck to add names to your shortlist.' : 'Tinder Keşif ekranında kartları sağa kaydırarak veya arama listesinden kalp butonuna basarak ekleyebilirsin.'}
              </T>
            </Card>
          ) : (
            <View style={{ gap: 10 }}>
              {favNamesObjects.map(n => (
                <Card key={n.id} style={ws.nameCard}>
                  <View style={{ flex: 1, paddingRight: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <T bold style={{ fontSize: 17, color: colors.ink }}>{n.name}</T>
                      <View style={[ws.genderBadge, n.gender === 'Kız' ? { backgroundColor: '#FBEBF2' } : n.gender === 'Erkek' ? { backgroundColor: '#EBF3FB' } : { backgroundColor: '#F0EEF5' }]}>
                        <T style={{ fontSize: 10, color: n.gender === 'Kız' ? '#B84570' : n.gender === 'Erkek' ? '#3B72A4' : '#6A5C78' }}>
                          {n.gender}
                        </T>
                      </View>
                      <T style={{ fontSize: 11, color: colors.muted }}>{n.origin}</T>
                    </View>
                    <T style={{ fontSize: 12.5, color: '#554A58', marginTop: 4, lineHeight: 18 }}>{n.meaning}</T>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Tap onPress={() => handlePronounce(n.name)} style={{ padding: 6 }}>
                      <T style={{ fontSize: 16 }}>🔊</T>
                    </Tap>
                    <Tap onPress={() => toggleFav(n.id)} style={ws.favBtn}>
                      <Icon name="heart" size={22} color="#C55B77" fill="#C55B77" />
                    </Tap>
                  </View>
                </Card>
              ))}
            </View>
          )}
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
              <T bold style={{ fontSize: 15, color: colors.ink }}>{partnerModalName.name} ({partnerModalName.gender})</T>
              <T style={{ fontSize: 12, color: '#6A5644', marginTop: 2 }}>{partnerModalName.meaning}</T>
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
                  setActiveTab('favorites');
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
