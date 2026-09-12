import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, ScreenHero } from './ui';
import { generatedAssets } from './generatedAssets';
import { secondsLabel } from './domain.mjs';

export function getAllTools(lang = 'tr') {
  const isEn = lang === 'en';
  return [
    // ─── 1. SAYAÇLAR & TAKİP ───
    {
      id: 'kickCounter',
      cat: 'counters',
      catTitle: isEn ? 'Daily Trackers' : 'Günlük Takip',
      title: isEn ? 'Kick Counter' : 'Tekme Sayacı',
      subtitle: isEn ? 'Gently record baby movement patterns' : 'Hareket düzenini sakince kaydet',
      icon: 'footprint',
      art: 'card_kick_counter',
      color: '#FAF2F5',
      tint: '#C45778',
      available: true,
    },
    {
      id: 'contractionTimer',
      cat: 'counters',
      catTitle: isEn ? 'Daily Trackers' : 'Günlük Takip',
      title: isEn ? 'Contraction Timer' : 'Kasılma Sayacı',
      subtitle: isEn ? 'Log duration, interval & intensity' : 'Süre, aralık ve şiddet günlüğü',
      icon: 'contraction',
      art: 'card_contractions',
      color: '#FBF3F0',
      tint: '#D4634B',
      available: true,
    },
    {
      id: 'weight',
      cat: 'counters',
      catTitle: isEn ? 'Daily Trackers' : 'Günlük Takip',
      title: isEn ? 'Weight Tracker' : 'Kilo Takibi',
      subtitle: isEn ? 'Weekly personal pregnancy weight log' : 'Haftalara göre kişisel kilo günlüğü',
      icon: 'scale',
      art: 'card_scale',
      color: '#F4F7F4',
      tint: '#4E8865',
      available: true,
    },

    // ─── 2. GELİŞİM & TAKİP ───
    {
      id: 'sizeGuide',
      cat: 'medical',
      catTitle: isEn ? 'Growth & Tests' : 'Gelişim & Takip',
      title: isEn ? '3D Size Comparison' : '3 Boyut Kıyaslama',
      subtitle: isEn ? 'Fruit, animal & sweet comparisons' : 'Meyve, hayvan ve tatlı boyutu',
      icon: 'melon',
      art: 'sweet_macaron',
      color: '#F6F9F5',
      tint: '#5A8A62',
      available: true,
    },
    {
      id: 'ultrasoundAtlas',
      cat: 'medical',
      catTitle: isEn ? 'Growth & Tests' : 'Gelişim & Takip',
      title: isEn ? 'Ultrasound Atlas' : 'Ultrason Atlası',
      subtitle: isEn ? 'Week-by-week 3D HD scan guide' : 'Hafta hafta 3D HD ultrason okuma',
      icon: 'calendar',
      art: 'card_appointment',
      color: '#FDF7F0',
      tint: '#C27B32',
      available: true,
    },
    {
      id: 'medicalTimeline',
      cat: 'medical',
      catTitle: isEn ? 'Growth & Tests' : 'Gelişim & Takip',
      title: isEn ? 'Medical Timeline' : 'Kontrol Takvimi',
      subtitle: isEn ? 'Doctor visits and screening tests' : 'Muayene ve tarama testleri',
      icon: 'milestone',
      art: 'ui_timeline_sun_moon',
      color: '#FAF4FA',
      tint: '#8D5897',
      available: true,
    },
    {
      id: 'organDevelopment',
      cat: 'medical',
      catTitle: isEn ? 'Growth & Tests' : 'Gelişim & Takip',
      title: isEn ? 'Organ Growth & Heart' : 'Organ Gelişimi & Kalp',
      subtitle: isEn ? 'Fetal organ anatomy & heart rhythm' : 'Fetal organ gelişimi & kalp ritmi',
      icon: 'heart',
      art: 'card_blood_pressure',
      color: '#FDF2F4',
      tint: '#C24D64',
      available: true,
    },

    // ─── 3. DOĞUMA HAZIRLIK ───
    {
      id: 'hospitalBag',
      cat: 'prep',
      catTitle: isEn ? 'Birth Prep' : 'Doğuma Hazırlık',
      title: isEn ? 'Hospital Bag' : 'Hastane Çantası',
      subtitle: isEn ? 'Mom, baby & partner essentials' : 'Anne, bebek & refakatçi listesi',
      icon: 'bag',
      art: 'card_hospital_bag',
      color: '#FAF5F0',
      tint: '#A36840',
      available: true,
    },
    {
      id: 'birthPlan',
      cat: 'prep',
      catTitle: isEn ? 'Birth Prep' : 'Doğuma Hazırlık',
      title: isEn ? 'Birth Plan' : 'Doğum Planı',
      subtitle: isEn ? 'Turn birth preferences into a clear plan' : 'Doğum tercihlerini düzenli plana çevir',
      icon: 'book',
      art: 'card_health_report',
      color: '#F8F4FA',
      tint: '#845494',
      available: true,
    },
    {
      id: 'doctorQuestions',
      cat: 'prep',
      catTitle: isEn ? 'Birth Prep' : 'Doğuma Hazırlık',
      title: isEn ? 'Questions for Doctor' : 'Doktora Sorular',
      subtitle: isEn ? 'Prenatal visit notebook & questions' : 'Kontrol randevusu soru defteri',
      icon: 'chat',
      art: 'card_ask_doctor',
      color: '#F5F1FA',
      tint: '#6F4CA4',
      available: true,
    },
    {
      id: 'babyNames',
      cat: 'prep',
      catTitle: isEn ? 'Birth Prep' : 'Doğuma Hazırlık',
      title: isEn ? 'Baby Names' : 'Bebek İsimleri',
      subtitle: isEn ? 'Meanings, origins & partner favorites' : 'Anlam, köken & eşle ortak keşif',
      icon: 'heart',
      art: 'baby',
      color: '#FAF3F8',
      tint: '#B8507D',
      available: true,
    },

    // ─── 4. BEBEK & LOHUSALIK ───
    {
      id: 'nursingTimer',
      cat: 'postpartum',
      catTitle: isEn ? 'Baby & Postpartum' : 'Bebek & Lohusalık',
      title: isEn ? 'Nursing & Bottle' : 'Emzirme & Biberon',
      subtitle: isEn ? 'Left/Right timer & bottle ml tracker' : 'Sol/Sağ meme kronometresi & ml takibi',
      icon: 'nursing',
      art: 'btn_nursing',
      color: '#FAF2F5',
      tint: '#A84C7A',
      available: true,
    },
    {
      id: 'sleepWhiteNoise',
      cat: 'postpartum',
      catTitle: isEn ? 'Baby & Postpartum' : 'Bebek & Lohusalık',
      title: isEn ? 'Sleep & White Noise' : 'Uyku & Beyaz Gürültü',
      subtitle: isEn ? 'Soothing sounds & nap timer' : 'Sakinleştirici sesler & uyku sayacı',
      icon: 'moon',
      art: 'btn_sleep',
      color: '#F2F1FA',
      tint: '#5D50A2',
      available: true,
    },
    {
      id: 'diaperTracker',
      cat: 'postpartum',
      catTitle: isEn ? 'Baby & Postpartum' : 'Bebek & Lohusalık',
      title: isEn ? 'Diaper Tracker' : 'Bez Değiştirme Günlüğü',
      subtitle: isEn ? 'Wet/dirty logs & stool color guide' : 'Islak/kirli bez & kaka renk skalası',
      icon: 'diaper',
      art: 'btn_diaper',
      color: '#EDF6FA',
      tint: '#3C88B0',
      available: true,
    },
    {
      id: 'postpartumCare',
      cat: 'postpartum',
      catTitle: isEn ? 'Baby & Postpartum' : 'Bebek & Lohusalık',
      title: isEn ? 'Postpartum Recovery' : 'Lohusa İyileşme Rehberi',
      subtitle: isEn ? 'Pelvic floor, hydration & self-care' : 'Kegel ritmi, hidrasyon & şefkat',
      icon: 'leaf',
      art: 'ui_postpartum_lotus',
      color: '#FBF2F3',
      tint: '#B85265',
      available: true,
    },
  ];
}

export const allTools = getAllTools('tr');

export function ToolsHub({ open, state, update, toast, inSheet = false, close, lang: propLang }) {
  const lang = propLang || state?.lang || 'tr';
  const isEn = lang === 'en';
  const [hubTab, setHubTab] = useState('tracking'); // 'tracking' | 'apps'
  const [catFilter, setCatFilter] = useState('all');

  const toolsList = getAllTools(lang);

  const categories = [
    { id: 'all', label: isEn ? 'All Tools' : 'Tüm Araçlar' },
    { id: 'counters', label: isEn ? 'Daily Trackers' : 'Günlük Takip' },
    { id: 'medical', label: isEn ? 'Growth & Tests' : 'Gelişim & Kontrol' },
    { id: 'prep', label: isEn ? 'Birth Prep' : 'Doğuma Hazırlık' },
    { id: 'postpartum', label: isEn ? 'Baby & Postpartum' : 'Bebek & Lohusa' },
  ];

  const groupedTools = categories
    .filter(cat => cat.id !== 'all' && (catFilter === 'all' || cat.id === catFilter))
    .map(cat => ({ ...cat, tools: toolsList.filter(t => t.cat === cat.id) }))
    .filter(group => group.tools.length);

  const kickSessions = state?.kickSessions || [];
  const contractionSessions = state?.contractionSessions || [];
  const weights = state?.weights || [];
  const bagItems = state?.lists?.bag || [];
  const bagDone = bagItems.filter(i => i.done).length;
  const birthPlanDone = Object.values(state?.birthPlan || {}).filter(Boolean).length;
  const latestKick = kickSessions[0];
  const latestContraction = contractionSessions[0];

  const Container = inSheet ? View : ScrollView;
  const containerProps = inSheet
    ? { style: th.container }
    : { showsVerticalScrollIndicator: false, contentContainerStyle: th.container };

  return (
    <Container {...containerProps}>
      {/* Başlık ve Kicker */}
      <View style={th.header}>
        <T style={{ fontSize: 11, letterSpacing: 1.5, color: colors.purple, fontWeight: '700' }}>
          {isEn ? 'PERSONAL TRACKER HUB' : 'KİŞİSEL TAKİP MERKEZİ'}
        </T>
        <T bold style={th.title}>{isEn ? 'Trackers & Preparation' : 'Takipler ve Hazırlık'}</T>
        <T style={th.subtitle}>
          {isEn
            ? 'Keep your daily counters, checklists, and personal health logs organized in one place.'
            : 'Günlük sayaçların, hazırlık listelerin ve kişisel takip kayıtların tek yerde düzenli kalsın.'}
        </T>
      </View>

      <ScreenHero
        kicker={isEn ? "TODAY'S FOCUS" : "BUGÜNÜN ODAĞI"}
        title={latestKick ? (isEn ? 'Your logs are on track' : 'Kayıtların düzenli ilerliyor') : (isEn ? 'Create your first log' : 'İlk kaydı oluştur')}
        body={isEn
          ? 'Complete your daily tracking first; prep, development, and newborn tools are curated below.'
          : 'Önce günlük takiplerini tamamla; hazırlık, gelişim ve bebek araçları altta ayrı koleksiyonlar halinde duruyor.'}
        icon="track"
        stat={`${kickSessions.length + contractionSessions.length + weights.length} ${isEn ? 'records' : 'kayıt'}`}
        tint={colors.purple}
      />

      {/* ─── ÜST İKİLİ SEKME (TAKİP KAYITLARIM vs TÜM ARAÇLAR) ─── */}
      <View style={th.hubTabs}>
        <Tap
          onPress={() => setHubTab('tracking')}
          label={isEn ? 'My Logs' : 'Takiplerim'}
          style={[th.hubTabBtn, hubTab === 'tracking' && th.hubTabBtnActive]}
        >
          <T bold={hubTab === 'tracking'} style={[th.hubTabLabel, hubTab === 'tracking' && th.hubTabLabelActive]}>
            📊 {isEn ? 'Daily Logs' : 'Günlük Kayıtlar'}
          </T>
        </Tap>
        <Tap
          onPress={() => setHubTab('apps')}
          label={isEn ? 'All Tools' : 'Tüm Araçlar'}
          style={[th.hubTabBtn, hubTab === 'apps' && th.hubTabBtnActive]}
        >
          <T bold={hubTab === 'apps'} style={[th.hubTabLabel, hubTab === 'apps' && th.hubTabLabelActive]}>
            🛠️ {isEn ? 'Tool Library' : 'Araç Kütüphanesi'}
          </T>
        </Tap>
      </View>

      {/* ─── 1. BÖLÜM: CANLI TAKİP VE SAYAÇ GEÇMİŞİ LİSTESİ ─── */}
      {hubTab === 'tracking' && (
        <View style={{ gap: 14 }}>
          {/* Hızlı Aksiyon Kartları */}
          <View style={th.quickRow}>
            <Tap
              onPress={() => open('kickCounter')}
              label={isEn ? 'Open kick counter' : 'Tekme sayacını aç'}
              style={[th.quickHero, { backgroundColor: '#FDF5F8', borderColor: '#F5DEE7' }]}
            >
              <View style={th.quickHeroIcon}>
                {generatedAssets['ui_kick_foot_button'] ? (
                  <Image source={generatedAssets['ui_kick_foot_button']} style={{ width: 48, height: 48 }} resizeMode="contain" />
                ) : (
                  <Icon name="footprint" size={26} color="#C45778" />
                )}
              </View>
              <T bold style={{ fontSize: 14.5, color: '#4A1D2E' }}>{isEn ? 'Kick Counter' : 'Tekme Sayacı'}</T>
              <T style={{ fontSize: 11, color: '#8F5E73', marginTop: 2 }}>
                {latestKick
                  ? (isEn
                      ? `Latest: ${latestKick.kicks ?? latestKick.count} kicks · ${secondsLabel(latestKick.durationSecs ?? latestKick.duration ?? 0)}`
                      : `Son: ${latestKick.kicks ?? latestKick.count} hareket · ${secondsLabel(latestKick.durationSecs ?? latestKick.duration ?? 0)}`)
                  : (isEn ? 'Start 10-kick session' : '10 tekme seansı başlat')}
              </T>
            </Tap>

            <Tap
              onPress={() => open('contractionTimer')}
              label={isEn ? 'Open contraction timer' : 'Kasılma sayacını aç'}
              style={[th.quickHero, { backgroundColor: '#FBF5F2', borderColor: '#F2DDD3' }]}
            >
              <View style={th.quickHeroIcon}>
                {generatedAssets['card_contractions'] ? (
                  <Image source={generatedAssets['card_contractions']} style={{ width: 48, height: 48 }} resizeMode="contain" />
                ) : (
                  <Icon name="contraction" size={26} color="#D4634B" />
                )}
              </View>
              <T bold style={{ fontSize: 14.5, color: '#451E14' }}>{isEn ? 'Contraction Timer' : 'Kasılma Sayacı'}</T>
              <T style={{ fontSize: 11, color: '#8A5345', marginTop: 2 }}>
                {latestContraction
                  ? (isEn
                      ? `Latest: ${latestContraction.durationSecs ?? latestContraction.duration}s · ${latestContraction.intensity || 'Note'}`
                      : `Son: ${latestContraction.durationSecs ?? latestContraction.duration} sn · ${latestContraction.intensity || 'Not'}`)
                  : (isEn ? 'Track duration & interval' : 'Süre ve sıklık kaydet')}
              </T>
            </Tap>
          </View>

          {/* 1. Tekme Takip Kayıtları Listesi */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image source={generatedAssets['card_kick_counter'] || generatedAssets['ui_kick_foot_button']} style={{ width: 28, height: 28 }} resizeMode="contain" />
                <T bold style={{ fontSize: 15, color: colors.ink }}>{isEn ? 'Kick Sessions History' : 'Tekme Seansları Geçmişi'}</T>
              </View>
              <Tap onPress={() => open('kickCounter')} style={{ padding: 4 }}>
                <T bold style={{ fontSize: 12, color: colors.purple }}>{isEn ? '+ New Session' : '+ Yeni Seans'}</T>
              </Tap>
            </View>

            <View style={{ gap: 8 }}>
              {kickSessions.length === 0 ? (
                <T style={{ fontSize: 12, color: colors.muted, fontStyle: 'italic', paddingVertical: 4 }}>
                  {isEn ? 'No kick sessions logged yet. You can start one above.' : 'Henüz tekme seansı kaydedilmedi. Yukarıdan başlatabilirsiniz.'}
                </T>
              ) : (
                kickSessions.map(ks => (
                  <View key={ks.id} style={th.logRow}>
                    <View>
                      <T bold style={{ fontSize: 14, color: colors.ink }}>
                        {ks.kicks ?? ks.count} {isEn ? 'movements recorded' : 'hareket kaydedildi'}
                      </T>
                      <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                        {ks.date} · {ks.time} · {ks.week ? (isEn ? `Week ${ks.week}` : `${ks.week}. Hafta`) : (isEn ? 'Session' : 'Seans')}
                      </T>
                    </View>
                    <View style={th.logBadge}>
                      <T bold style={{ fontSize: 11, color: colors.purple }}>
                        {secondsLabel(ks.durationSecs ?? ks.duration ?? 0)}
                      </T>
                    </View>
                  </View>
                ))
              )}
            </View>
          </Card>

          {/* 2. Kasılma Takip Kayıtları Listesi */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image source={generatedAssets['ui_contraction_pulse_button'] || generatedAssets['card_contractions']} style={{ width: 28, height: 28 }} resizeMode="contain" />
                <T bold style={{ fontSize: 15, color: colors.ink }}>{isEn ? 'Contraction Logs' : 'Kasılma Kayıtları'}</T>
              </View>
              <Tap onPress={() => open('contractionTimer')} style={{ padding: 4 }}>
                <T bold style={{ fontSize: 12, color: colors.purple }}>{isEn ? '+ Start Timer' : '+ Sayacı Başlat'}</T>
              </Tap>
            </View>

            <View style={{ gap: 8 }}>
              {contractionSessions.length === 0 ? (
                <T style={{ fontSize: 12, color: colors.muted, fontStyle: 'italic', paddingVertical: 4 }}>
                  {isEn ? 'No contraction logs yet. You can measure duration when labor begins.' : 'Henüz sancı kaydı yok. Doğum başlangıcında süreyi ölçebilirsiniz.'}
                </T>
              ) : (
                contractionSessions.map(cs => (
                  <View key={cs.id} style={th.logRow}>
                    <View>
                      <T bold style={{ fontSize: 14, color: colors.ink }}>
                        {cs.durationSecs ?? cs.duration} {isEn ? 'seconds duration' : 'saniye sürdü'} · {cs.intensity || (isEn ? 'No note' : 'Şiddet notu yok')}
                      </T>
                      <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                        {cs.date} · {cs.time}
                      </T>
                    </View>
                    <View style={[th.logBadge, { backgroundColor: '#FDF0EC' }]}>
                      <T bold style={{ fontSize: 11, color: '#D4634B' }}>
                        {cs.intervalSecs || cs.interval
                          ? `${Math.floor((cs.intervalSecs ?? cs.interval) / 60)} ${isEn ? 'min interval' : 'dk aralık'}`
                          : (isEn ? 'first log' : 'ilk kayıt')}
                      </T>
                    </View>
                  </View>
                ))
              )}
            </View>
          </Card>

          {/* 3. Kilo Takibi Listesi */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image source={generatedAssets['ui_weight_bmi_gauge'] || generatedAssets['card_scale']} style={{ width: 28, height: 28 }} resizeMode="contain" />
                <T bold style={{ fontSize: 15, color: colors.ink }}>{isEn ? 'Weight Tracking Curve & Logs' : 'Kilo Takip Eğrisi & Ölçümler'}</T>
              </View>
              <Tap onPress={() => open('weight')} style={{ padding: 4 }}>
                <T bold style={{ fontSize: 12, color: colors.purple }}>{isEn ? '+ Log Weight' : '+ Kilo Kaydet'}</T>
              </Tap>
            </View>

            <View style={{ gap: 8 }}>
              {weights.length === 0 ? (
                <T style={{ fontSize: 12, color: colors.muted, fontStyle: 'italic', paddingVertical: 4 }}>
                  {isEn ? 'No weight measurements entered yet.' : 'Henüz kilo ölçümü girilmedi.'}
                </T>
              ) : (
                weights.map(w => (
                  <View key={w.id} style={th.logRow}>
                    <View>
                      <T bold style={{ fontSize: 14, color: colors.ink }}>
                        {w.value} kg · {isEn ? `Week ${w.week}` : `${w.week}. Hafta`}
                      </T>
                      <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                        {w.date} · {w.time}
                      </T>
                    </View>
                    <View style={[th.logBadge, { backgroundColor: '#EEF6F1' }]}>
                      <T bold style={{ fontSize: 11, color: '#3E7B54' }}>
                        {((w.value - 60.0) >= 0 ? '+' : '') + (w.value - 60.0).toFixed(1)} kg
                      </T>
                    </View>
                  </View>
                ))
              )}
            </View>
          </Card>

          {/* 4. Doğuma Hazırlık Listeleri İlerlemesi */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Tap
              onPress={() => open('hospitalBag')}
              label={isEn ? 'Open hospital bag' : 'Hastane çantasını aç'}
              style={[th.statMiniCard, { backgroundColor: '#FAF5F0', borderColor: '#F2E4D8' }]}
            >
              <Image source={generatedAssets['ui_hospital_bag_3d']} style={{ width: 38, height: 38 }} resizeMode="contain" />
              <T bold style={{ fontSize: 13, color: '#572E65', marginTop: 4 }}>{isEn ? 'Hospital Bag' : 'Hastane Çantası'}</T>
              <T style={{ fontSize: 11, color: '#885899', marginTop: 2 }}>{bagDone}/{bagItems.length || 0} {isEn ? 'items packed' : 'eşya hazır'}</T>
            </Tap>

            <Tap
              onPress={() => open('birthPlan')}
              label={isEn ? 'Open birth plan' : 'Doğum planını aç'}
              style={[th.statMiniCard, { backgroundColor: '#F8F4FA', borderColor: '#ECE0EE' }]}
            >
              <Image source={generatedAssets['ui_birth_plan_scroll']} style={{ width: 38, height: 38 }} resizeMode="contain" />
              <T bold style={{ fontSize: 13, color: '#684520', marginTop: 4 }}>{isEn ? 'Birth Preferences' : 'Doğum Tercihleri'}</T>
              <T style={{ fontSize: 11, color: '#997042', marginTop: 2 }}>{birthPlanDone} {isEn ? 'preferences set' : 'tercih belirlendi'}</T>
            </Tap>
          </View>
        </View>
      )}

      {/* ─── 2. BÖLÜM: 15 AKILLI ARAÇ & APP GRID ─── */}
      {hubTab === 'apps' && (
        <View style={{ gap: 16 }}>
          {/* Kategori Filtre Butonları */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
            {categories.map(cat => (
              <Tap
                key={cat.id}
                onPress={() => setCatFilter(cat.id)}
                label={cat.label}
                accessibilityState={{ selected: catFilter === cat.id }}
                style={[th.catTab, catFilter === cat.id && th.catTabActive]}
              >
                <T bold={catFilter === cat.id} style={{ fontSize: 12, color: catFilter === cat.id ? 'white' : colors.ink }}>
                  {cat.label}
                </T>
              </Tap>
            ))}
          </ScrollView>

          {groupedTools.map(group => (
            <View key={group.id} style={{ gap: 12 }}>
              <View style={th.groupHeader}>
                <View>
                  <T bold style={{ fontSize: 17, color: colors.ink }}>{group.label}</T>
                  <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 2 }}>
                    {group.tools.length} {isEn ? 'dedicated tools · interactive tracking' : 'özel araç · dokunsal takip'}
                  </T>
                </View>
                <View style={th.groupIconBadge}>
                  <T style={{ fontSize: 16 }}>
                    {group.id === 'counters' ? '📊' : group.id === 'medical' ? '🗓️' : group.id === 'prep' ? '🧳' : '🍼'}
                  </T>
                </View>
              </View>

              <View style={th.grid}>
                {group.tools.map(tool => {
                  let liveBadge = null;
                  if (tool.id === 'kickCounter') {
                    const ks = state?.kickSessions || [];
                    liveBadge = ks.length ? `${ks[0].kicks ?? ks[0].count} ${isEn ? 'kicks' : 'tekme'}` : null;
                  } else if (tool.id === 'contractionTimer') {
                    const cs = state?.contractionSessions || [];
                    liveBadge = cs.length ? `${cs[0].durationSecs ?? cs[0].duration}${isEn ? 's contraction' : 's sancı'}` : null;
                  } else if (tool.id === 'weight') {
                    const ws = state?.weights || [];
                    liveBadge = ws.length ? `${ws[0].value} kg` : null;
                  } else if (tool.id === 'hospitalBag') {
                    const items = state?.lists?.bag || [];
                    const done = items.filter(i => i.done).length;
                    liveBadge = items.length ? `%${Math.round((done / items.length) * 100)}` : null;
                  } else if (tool.id === 'birthPlan') {
                    const done = Object.values(state?.birthPlan || {}).filter(Boolean).length;
                    liveBadge = done ? `${done}/8 ${isEn ? 'choices' : 'tercih'}` : null;
                  } else if (tool.id === 'babyNames') {
                    const favs = state?.favNames || [];
                    liveBadge = favs.length ? `${favs.length} ${isEn ? 'favs' : 'favori'}` : null;
                  } else if (tool.id === 'doctorQuestions') {
                    const qs = state?.lists?.questions || [];
                    const openCount = qs.filter(q => !q.done).length;
                    liveBadge = openCount ? `${openCount} ${isEn ? 'questions' : 'soru'}` : null;
                  } else if (tool.id === 'nursingTimer') {
                    liveBadge = state?.lastNursingSide || null;
                  } else if (tool.id === 'diaperTracker') {
                    const diapers = (state?.records || []).filter(r => r.type === 'Bez');
                    liveBadge = diapers.length ? `${diapers.length} ${isEn ? 'diapers' : 'bez'}` : null;
                  }

                  const artSource = tool.art && generatedAssets[tool.art] ? generatedAssets[tool.art] : null;

                  return (
                    <Tap
                      key={tool.id}
                      onPress={() => {
                        if (tool.available) {
                          open(tool.id);
                        } else {
                          toast && toast(tool.title + (isEn ? ' will be active in the next update ✨' : ' sonraki güncellemede aktif olacak ✨'));
                        }
                      }}
                      label={tool.title}
                      style={[th.toolCard, { borderColor: tool.tint + '30' }]}
                    >
                      {/* Üst Alan: 3D Görsel + Canlı Durum / Ok İkonu */}
                      <View style={th.toolTop}>
                        <View style={[th.toolIconAura, { backgroundColor: tool.color }]}>
                          {artSource ? (
                            <Image source={artSource} style={{ width: 56, height: 56 }} resizeMode="contain" />
                          ) : (
                            <Icon name={tool.icon} size={28} color={tool.tint} />
                          )}
                        </View>

                        {liveBadge ? (
                          <View style={[th.liveBadge, { backgroundColor: tool.tint + '12', borderColor: tool.tint + '35' }]}>
                            <View style={[th.liveBadgeDot, { backgroundColor: tool.tint }]} />
                            <T bold style={{ fontSize: 9.5, color: tool.tint }}>{liveBadge}</T>
                          </View>
                        ) : (
                          <View style={[th.arrowBadge, { backgroundColor: tool.tint + '10' }]}>
                            <Icon name="chevron" size={11} color={tool.tint} />
                          </View>
                        )}
                      </View>

                      {/* Başlık ve Açıklama */}
                      <View style={{ marginTop: 12, flex: 1, justifyContent: 'flex-end' }}>
                        <T bold style={th.toolTitle}>{tool.title}</T>
                        <T numberOfLines={2} style={th.toolSub}>{tool.subtitle}</T>
                      </View>
                    </Tap>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}
    </Container>
  );
}

const th = StyleSheet.create({
  container: { paddingHorizontal: 17, paddingTop: 16, paddingBottom: 50, gap: 14 },
  header: { marginBottom: 2 },
  title: { fontSize: 26, letterSpacing: -0.5, color: colors.ink, marginTop: 4 },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 4, lineHeight: 19 },
  overline: { fontSize: 10, letterSpacing: 1.4, color: colors.purple, fontFamily: fonts.bold },
  overviewTitle: { fontSize: 18, color: colors.ink, marginTop: 4 },
  overviewText: { fontSize: 12, color: colors.muted, lineHeight: 18, marginTop: 4 },
  overviewMetric: { width: 62, height: 62, borderRadius: 22, backgroundColor: '#F3EAF5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2D3E7' },
  hubTabs: { flexDirection: 'row', backgroundColor: '#EDE4EF', borderRadius: 16, padding: 4, gap: 4 },
  hubTabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  hubTabBtnActive: { backgroundColor: 'white', ...shadow },
  hubTabLabel: { fontSize: 12, color: '#746678' },
  hubTabLabelActive: { color: colors.purple },
  quickRow: { flexDirection: 'row', gap: 12 },
  quickHero: { flex: 1, padding: 15, borderRadius: 22, borderWidth: 1, ...shadow },
  quickHeroIcon: { width: 62, height: 62, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginBottom: 10, ...shadow },
  catTab: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 18, backgroundColor: '#EFEAEF' },
  catTabActive: { backgroundColor: colors.purple },
  groupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 },
  groupIconBadge: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#F4EEF6', alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, justifyContent: 'space-between' },
  toolCard: { width: '48%', borderRadius: 24, padding: 14, minHeight: 168, backgroundColor: '#FFFFFF', borderWidth: 1.2, ...shadow },
  toolTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  toolIconAura: { width: 62, height: 62, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  liveBadgeDot: { width: 5, height: 5, borderRadius: 2.5 },
  arrowBadge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  toolTitle: { fontSize: 15, letterSpacing: -0.3, color: '#221929' },
  toolSub: { fontSize: 11.5, color: '#7A6D80', marginTop: 3, lineHeight: 16 },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderColor: '#F2EAF3' },
  logBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: '#F3EBF5' },
  statMiniCard: { flex: 1, padding: 14, borderRadius: 18, borderWidth: 1 },
});
