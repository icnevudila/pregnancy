import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section, ScreenHero } from './ui';
import { generatedAssets } from './generatedAssets';
import { secondsLabel } from './domain.mjs';

export const allTools = [
  // ─── 1. SAYAÇLAR & TAKİP ───
  {
    id: 'kickCounter',
    cat: 'counters',
    catTitle: 'Günlük Takip',
    title: 'Tekme Sayacı',
    subtitle: 'Hareket düzenini sakince kaydet',
    icon: 'footprint',
    art: 'card_kick_counter',
    color: '#FBF2F6',
    tint: '#9A5B80',
    available: true,
  },
  {
    id: 'contractionTimer',
    cat: 'counters',
    catTitle: 'Günlük Takip',
    title: 'Kasılma Sayacı',
    subtitle: 'Süre, aralık ve şiddet günlüğü',
    icon: 'contraction',
    art: 'card_contractions',
    color: '#F0F6FB',
    tint: '#45729B',
    available: true,
  },
  {
    id: 'weight',
    cat: 'counters',
    catTitle: 'Günlük Takip',
    title: 'Kilo Takibi',
    subtitle: 'Haftalara göre kişisel kilo günlüğü',
    icon: 'scale',
    art: 'card_scale',
    color: '#EFF6F2',
    tint: '#467F5B',
    available: true,
  },

  // ─── 2. GELİŞİM & TAKİP ───
  {
    id: 'sizeGuide',
    cat: 'medical',
    catTitle: 'Gelişim & Takip',
    title: '3 Boyut Kıyaslama',
    subtitle: 'Meyve vs Hayvan vs Tatlı',
    icon: 'melon',
    art: 'fruit_apple',
    color: '#F7EFF8',
    tint: '#7B4C80',
    available: true,
  },
  {
    id: 'ultrasoundAtlas',
    cat: 'medical',
    catTitle: 'Gelişim & Takip',
    title: 'Ultrason Atlası',
    subtitle: 'Hafta hafta ultrason okuma rehberi',
    icon: 'calendar',
    art: 'card_ultrasound_frame',
    color: '#F0EDF6',
    tint: '#5D4F88',
    available: true,
  },
  {
    id: 'medicalTimeline',
    cat: 'medical',
    catTitle: 'Gelişim & Takip',
    title: 'Kontrol Takvimi',
    subtitle: 'Kontrol ve test hatırlatma notları',
    icon: 'milestone',
    art: 'card_appointment',
    color: '#F8F1EB',
    tint: '#915B38',
    available: true,
  },
  {
    id: 'organDevelopment',
    cat: 'medical',
    catTitle: 'Gelişim & Takip',
    title: 'Organ Gelişimi & Kalp',
    subtitle: 'Organ gelişimi ve kalp ritmi notları',
    icon: 'heart',
    art: 'ui_fetal_heart_3d',
    color: '#FDF2F4',
    tint: '#A84D67',
    available: true,
  },

  // ─── 3. DOĞUMA HAZIRLIK ───
  {
    id: 'hospitalBag',
    cat: 'prep',
    catTitle: 'Doğuma Hazırlık',
    title: 'Hastane Çantası',
    subtitle: 'Anne, bebek & refakatçi listesi',
    icon: 'bag',
    art: 'ui_hospital_bag_3d',
    color: '#F4EEF8',
    tint: '#744E8A',
    available: true,
  },
  {
    id: 'birthPlan',
    cat: 'prep',
    catTitle: 'Doğuma Hazırlık',
    title: 'Doğum Planı',
    subtitle: 'Doğum tercihlerini düzenli notlara çevir',
    icon: 'book',
    art: 'ui_birth_plan_scroll',
    color: '#FAF4EB',
    tint: '#946635',
    available: true,
  },
  {
    id: 'doctorQuestions',
    cat: 'prep',
    catTitle: 'Doğuma Hazırlık',
    title: 'Doktora Sorular',
    subtitle: 'Kontrol randevusu soru defteri',
    icon: 'chat',
    art: 'ui_doctor_prep_notebook',
    color: '#F5EEF5',
    tint: '#844E86',
    available: true,
  },
  {
    id: 'babyNames',
    cat: 'prep',
    catTitle: 'Doğuma Hazırlık',
    title: 'Bebek İsimleri',
    subtitle: 'Kaydırarak eşle isim bulucu',
    icon: 'heart',
    art: 'ui_baby_name_blocks',
    color: '#FDF2F5',
    tint: '#B8526F',
    available: true,
  },

  // ─── 4. BEBEK & LOHUSALIK ───
  {
    id: 'nursingTimer',
    cat: 'postpartum',
    catTitle: 'Bebek & Lohusalık',
    title: 'Emzirme & Biberon',
    subtitle: 'Sol/Sağ meme kronometresi & ml takibi',
    icon: 'nursing',
    art: 'ui_nursing_dual_timer',
    color: '#FBF1F5',
    tint: '#9E567B',
    available: true,
  },
  {
    id: 'sleepWhiteNoise',
    cat: 'postpartum',
    catTitle: 'Bebek & Lohusalık',
    title: 'Uyku & Beyaz Gürültü',
    subtitle: 'Fön, dalga, rahim içi sakinleştirici',
    icon: 'moon',
    art: 'ui_white_noise_headphones',
    color: '#ECEEF7',
    tint: '#4C589C',
    available: true,
  },
  {
    id: 'diaperTracker',
    cat: 'postpartum',
    catTitle: 'Bebek & Lohusalık',
    title: 'Bez Değiştirme Günlüğü',
    subtitle: 'Islak, kirli ve temiz bez sayaçları',
    icon: 'diaper',
    art: 'cat_diaper',
    color: '#EDF5F2',
    tint: '#437E65',
    available: true,
  },
  {
    id: 'postpartumCare',
    cat: 'postpartum',
    catTitle: 'Bebek & Lohusalık',
    title: 'Lohusa İyileşme Rehberi',
    subtitle: 'Fiziksel toparlanma & kendine şefkat',
    icon: 'leaf',
    art: 'ui_postpartum_lotus',
    color: '#F7EFF8',
    tint: '#86518A',
    available: true,
  },
];

export function ToolsHub({ open, state, update, toast, inSheet = false, close }) {
  const [hubTab, setHubTab] = useState('tracking'); // 'tracking' | 'apps'
  const [catFilter, setCatFilter] = useState('all');

  const categories = [
    { id: 'all', label: 'Tüm Araçlar' },
    { id: 'counters', label: 'Günlük Takip' },
    { id: 'medical', label: 'Gelişim & Kontrol' },
    { id: 'prep', label: 'Doğuma Hazırlık' },
    { id: 'postpartum', label: 'Bebek & Lohusa' },
  ];

  const groupedTools = categories
    .filter(cat => cat.id !== 'all' && (catFilter === 'all' || cat.id === catFilter))
    .map(cat => ({ ...cat, tools: allTools.filter(t => t.cat === cat.id) }))
    .filter(group => group.tools.length);

  const kickSessions = state.kickSessions || [];
  const contractionSessions = state.contractionSessions || [];
  const weights = state.weights || [];
  const bagItems = state.lists?.bag || [];
  const bagDone = bagItems.filter(i => i.done).length;
  const birthPlanDone = Object.values(state.birthPlan || {}).filter(Boolean).length;
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
          KİŞİSEL TAKİP MERKEZİ
        </T>
        <T bold style={th.title}>Takipler ve Hazırlık</T>
        <T style={th.subtitle}>
          Günlük sayaçların, hazırlık listelerin ve kişisel takip kayıtların tek yerde düzenli kalsın.
        </T>
      </View>

      <ScreenHero
        kicker="BUGÜNÜN ODAĞI"
        title={latestKick ? 'Kayıtların düzenli ilerliyor' : 'İlk kaydı oluştur'}
        body="Önce günlük takiplerini tamamla; hazırlık, gelişim ve bebek araçları altta ayrı koleksiyonlar halinde duruyor."
        icon="track"
        stat={`${kickSessions.length + contractionSessions.length + weights.length} kayıt`}
        tint={colors.purple}
      />

      {/* ─── ÜST İKİLİ SEKME (TAKİP KAYITLARIM vs TÜM ARAÇLAR) ─── */}
      <View style={th.hubTabs}>
        <Tap
          onPress={() => setHubTab('tracking')}
          label="Takiplerim"
          style={[th.hubTabBtn, hubTab === 'tracking' && th.hubTabBtnActive]}
        >
          <T bold={hubTab === 'tracking'} style={[th.hubTabLabel, hubTab === 'tracking' && th.hubTabLabelActive]}>
            📊 Günlük Kayıtlar
          </T>
        </Tap>
        <Tap
          onPress={() => setHubTab('apps')}
          label="Tüm Araçlar"
          style={[th.hubTabBtn, hubTab === 'apps' && th.hubTabBtnActive]}
        >
          <T bold={hubTab === 'apps'} style={[th.hubTabLabel, hubTab === 'apps' && th.hubTabLabelActive]}>
            🛠️ Araç Kütüphanesi
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
              label="Tekme sayacını aç"
              style={[th.quickHero, { backgroundColor: '#FDF2F5', borderColor: '#F3DBE3' }]}
            >
              <View style={th.quickHeroIcon}>
                {generatedAssets['card_kick_counter'] ? (
                  <Image source={generatedAssets['card_kick_counter']} style={{ width: 44, height: 44 }} resizeMode="contain" />
                ) : (
                  <Icon name="footprint" size={26} color="#9D5C80" />
                )}
              </View>
              <T bold style={{ fontSize: 14, color: '#632D4C' }}>Tekme Sayacı</T>
              <T style={{ fontSize: 11, color: '#91637F', marginTop: 2 }}>
                {latestKick ? `Son: ${latestKick.kicks ?? latestKick.count} hareket · ${secondsLabel(latestKick.durationSecs ?? latestKick.duration ?? 0)}` : 'İlk seansı başlat'}
              </T>
            </Tap>

            <Tap
              onPress={() => open('contractionTimer')}
              label="Kasılma sayacını aç"
              style={[th.quickHero, { backgroundColor: '#F0F6FB', borderColor: '#D7E5F1' }]}
            >
              <View style={th.quickHeroIcon}>
                {generatedAssets['card_contractions'] ? (
                  <Image source={generatedAssets['card_contractions']} style={{ width: 44, height: 44 }} resizeMode="contain" />
                ) : (
                  <Icon name="contraction" size={26} color="#4F79A1" />
                )}
              </View>
              <T bold style={{ fontSize: 14, color: '#274969' }}>Kasılma Sayacı</T>
              <T style={{ fontSize: 11, color: '#567594', marginTop: 2 }}>
                {latestContraction ? `Son: ${latestContraction.durationSecs ?? latestContraction.duration} sn · ${latestContraction.intensity || 'Not'}` : 'Süre ve aralık kaydet'}
              </T>
            </Tap>
          </View>

          {/* 1. Tekme Takip Kayıtları Listesi */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <T style={{ fontSize: 18 }}>🦶</T>
                <T bold style={{ fontSize: 15, color: colors.ink }}>Tekme Seansları Geçmişi</T>
              </View>
              <Tap onPress={() => open('kickCounter')} style={{ padding: 4 }}>
                <T bold style={{ fontSize: 12, color: colors.purple }}>+ Yeni Seans</T>
              </Tap>
            </View>

            <View style={{ gap: 8 }}>
              {kickSessions.map(ks => (
                <View key={ks.id} style={th.logRow}>
                  <View>
                    <T bold style={{ fontSize: 14, color: colors.ink }}>
                      {ks.kicks ?? ks.count} hareket kaydedildi
                    </T>
                    <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                      {ks.date} · {ks.time} · {ks.week ? (ks.week + '. Hafta') : 'Seans'}
                    </T>
                  </View>
                  <View style={th.logBadge}>
                    <T bold style={{ fontSize: 11, color: colors.purple }}>
                      {secondsLabel(ks.durationSecs ?? ks.duration ?? 0)}
                    </T>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* 2. Kasılma Takip Kayıtları Listesi */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <T style={{ fontSize: 18 }}>⏱️</T>
                <T bold style={{ fontSize: 15, color: colors.ink }}>Kasılma Kayıtları</T>
              </View>
              <Tap onPress={() => open('contractionTimer')} style={{ padding: 4 }}>
                <T bold style={{ fontSize: 12, color: colors.purple }}>+ Sayacı Başlat</T>
              </Tap>
            </View>

            <View style={{ gap: 8 }}>
              {contractionSessions.map(cs => (
                <View key={cs.id} style={th.logRow}>
                  <View>
                    <T bold style={{ fontSize: 14, color: colors.ink }}>
                      {cs.durationSecs ?? cs.duration} saniye sürdü · {cs.intensity || 'Şiddet notu yok'}
                    </T>
                    <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                      {cs.date} · {cs.time}
                    </T>
                  </View>
                  <View style={[th.logBadge, { backgroundColor: '#E9F1F9' }]}>
                    <T bold style={{ fontSize: 11, color: '#3A6A94' }}>
                      {cs.intervalSecs || cs.interval ? `${Math.floor((cs.intervalSecs ?? cs.interval) / 60)} dk aralık` : 'ilk kayıt'}
                    </T>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* 3. Kilo Takibi Listesi */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <T style={{ fontSize: 18 }}>⚖️</T>
                <T bold style={{ fontSize: 15, color: colors.ink }}>Kilo Takip Eğrisi & Ölçümler</T>
              </View>
              <Tap onPress={() => open('weight')} style={{ padding: 4 }}>
                <T bold style={{ fontSize: 12, color: colors.purple }}>+ Kilo Kaydet</T>
              </Tap>
            </View>

            <View style={{ gap: 8 }}>
              {weights.map(w => (
                <View key={w.id} style={th.logRow}>
                  <View>
                    <T bold style={{ fontSize: 14, color: colors.ink }}>
                      {w.value} kg · {w.week}. Hafta
                    </T>
                    <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                      {w.date} · {w.time}
                    </T>
                  </View>
                  <View style={[th.logBadge, { backgroundColor: '#EDF5F0' }]}>
                    <T bold style={{ fontSize: 11, color: '#3E7B54' }}>
                      {((w.value - 60.0) >= 0 ? '+' : '') + (w.value - 60.0).toFixed(1)} kg artış
                    </T>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* 4. Doğuma Hazırlık Listeleri İlerlemesi */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Tap
              onPress={() => open('hospitalBag')}
              label="Hastane çantasını aç"
              style={[th.statMiniCard, { backgroundColor: '#FAF4FC' }]}
            >
              <T style={{ fontSize: 20 }}>🎒</T>
              <T bold style={{ fontSize: 13, color: '#572E65', marginTop: 4 }}>Hastane Çantası</T>
              <T style={{ fontSize: 11, color: '#885899', marginTop: 2 }}>{bagDone}/{bagItems.length || 0} eşya hazır</T>
            </Tap>

            <Tap
              onPress={() => open('birthPlan')}
              label="Doğum planını aç"
              style={[th.statMiniCard, { backgroundColor: '#FDF7EE' }]}
            >
              <T style={{ fontSize: 20 }}>📋</T>
              <T bold style={{ fontSize: 13, color: '#684520', marginTop: 4 }}>Doğum Tercihleri</T>
              <T style={{ fontSize: 11, color: '#997042', marginTop: 2 }}>{birthPlanDone} tercih belirlendi</T>
            </Tap>
          </View>
        </View>
      )}

      {/* ─── 2. BÖLÜM: 15 AKILLI ARAÇ & APP GRID ─── */}
      {hubTab === 'apps' && (
        <View style={{ gap: 14 }}>
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
            <View key={group.id} style={{ gap: 10 }}>
              <View style={th.groupHeader}>
                <View>
                  <T bold style={{ fontSize: 16, color: colors.ink }}>{group.label}</T>
                  <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{group.tools.length} araç · düzenli akış</T>
                </View>
                <T style={{ fontSize: 18 }}>{group.id === 'counters' ? '📊' : group.id === 'medical' ? '🗓️' : group.id === 'prep' ? '🧳' : '🍼'}</T>
              </View>

              <View style={th.grid}>
                {group.tools.map(tool => (
                  <Tap
                    key={tool.id}
                    onPress={() => {
                      if (tool.available) {
                        open(tool.id);
                      } else {
                        toast && toast(tool.title + ' sonraki güncellemede aktif olacak ✨');
                      }
                    }}
                    label={tool.title}
                    style={[th.toolCard, { backgroundColor: tool.color }]}
                  >
                    <View style={th.toolTop}>
                      <View style={[th.toolIconBox, { backgroundColor: tool.tint + '18' }]}>
                        {tool.art && generatedAssets[tool.art] ? (
                          <Image source={generatedAssets[tool.art]} style={{ width: 46, height: 46 }} resizeMode="contain" />
                        ) : (
                          <Icon name={tool.icon} size={28} color={tool.tint} />
                        )}
                      </View>
                      <View style={th.categoryTag}>
                        <T style={{ fontSize: 9.5, color: tool.tint, fontWeight: 'bold' }}>{tool.catTitle}</T>
                      </View>
                    </View>
                    <T bold style={[th.toolTitle, { color: colors.ink }]}>{tool.title}</T>
                    <T style={th.toolSub}>{tool.subtitle}</T>
                  </Tap>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </Container>
  );
}

const th = StyleSheet.create({
  container: { paddingHorizontal: 17, paddingTop: 16, paddingBottom: 40, gap: 14 },
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
  quickHero: { flex: 1, padding: 15, borderRadius: 20, borderWidth: 1, ...shadow },
  quickHeroIcon: { width: 56, height: 56, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginBottom: 8, ...shadow },
  catTab: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#EFEAEF' },
  catTabActive: { backgroundColor: colors.purple },
  groupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, justifyContent: 'space-between' },
  toolCard: { width: '48%', borderRadius: 24, padding: 16, minHeight: 156, borderWidth: 1.2, borderColor: '#ECE1EC', ...shadow },
  toolTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  toolIconBox: { width: 58, height: 58, borderRadius: 18, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#886488', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  categoryTag: { backgroundColor: '#FFFFFF99', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
  toolTitle: { fontSize: 14.5, letterSpacing: -0.2 },
  toolSub: { fontSize: 11.5, color: colors.muted, marginTop: 4, lineHeight: 16 },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderColor: '#F2EAF3' },
  logBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: '#F3EBF5' },
  statMiniCard: { flex: 1, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#EFE4F1' },
});
