import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section } from './ui';
import { generatedAssets } from './generatedAssets';

export const allTools = [
  // ─── 1. SAYAÇLAR & TAKİP ───
  {
    id: 'kickCounter',
    cat: 'counters',
    catTitle: 'Sayaçlar',
    title: 'Tekme Sayacı',
    subtitle: '10 tekme fetal hareket seansı',
    icon: 'footprint',
    art: 'card_kick_counter',
    color: '#FBF2F6',
    tint: '#9A5B80',
    available: true,
  },
  {
    id: 'contractionTimer',
    cat: 'counters',
    catTitle: 'Sayaçlar',
    title: 'Kasılma Sayacı',
    subtitle: '5-1-1 kuralı & doğum zamanı',
    icon: 'contraction',
    art: 'card_contractions',
    color: '#F0F6FB',
    tint: '#45729B',
    available: true,
  },
  {
    id: 'weight',
    cat: 'counters',
    catTitle: 'Sayaçlar',
    title: 'Kilo Takibi & BMI',
    subtitle: 'IOM standartlarında ideal kilo eğrisi',
    icon: 'scale',
    art: 'card_scale',
    color: '#EFF6F2',
    tint: '#467F5B',
    available: true,
  },

  // ─── 2. GELİŞİM & MEDİKAL İNCELEME ───
  {
    id: 'sizeGuide',
    cat: 'medical',
    catTitle: 'Gelişim & Medikal',
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
    catTitle: 'Gelişim & Medikal',
    title: 'Ultrason Atlası',
    subtitle: '2D ve 3D HDLive renkli taramalar',
    icon: 'calendar',
    art: 'card_ultrasound_frame',
    color: '#F0EDF6',
    tint: '#5D4F88',
    available: true,
  },
  {
    id: 'medicalTimeline',
    cat: 'medical',
    catTitle: 'Gelişim & Medikal',
    title: 'Tıbbi Test Takvimi',
    subtitle: 'Şeker yükleme, ikili test & NST',
    icon: 'milestone',
    art: 'card_appointment',
    color: '#F8F1EB',
    tint: '#915B38',
    available: true,
  },
  {
    id: 'organDevelopment',
    cat: 'medical',
    catTitle: 'Gelişim & Medikal',
    title: 'Organ Gelişimi & Kalp',
    subtitle: '145 BPM fetal kalp sesi simülatörü',
    icon: 'heart',
    art: 'fetus',
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
    art: 'card_hospital_bag',
    color: '#F4EEF8',
    tint: '#744E8A',
    available: true,
  },
  {
    id: 'birthPlan',
    cat: 'prep',
    catTitle: 'Doğuma Hazırlık',
    title: 'Doğum Planı',
    subtitle: 'Doktora özel tıbbi tercihler sihirbazı',
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
    art: 'card_ask_doctor',
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
    art: 'btn_nursing',
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
    art: 'btn_sleep',
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
    art: 'btn_diaper',
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
    art: 'blog_postpartum_selfcare',
    color: '#F7EFF8',
    tint: '#86518A',
    available: true,
  },
];

export function ToolsHub({ open, state, update, toast, inSheet = false, close }) {
  const [catFilter, setCatFilter] = useState('all');

  const categories = [
    { id: 'all', label: 'Tüm Appler (15)' },
    { id: 'counters', label: 'Sayaçlar (3)' },
    { id: 'medical', label: 'Gelişim & Tıp (4)' },
    { id: 'prep', label: 'Doğuma Hazırlık (4)' },
    { id: 'postpartum', label: 'Bebek & Lohusa (4)' },
  ];

  const displayedTools = catFilter === 'all'
    ? allTools
    : allTools.filter(t => t.cat === catFilter);

  const Container = inSheet ? View : ScrollView;
  const containerProps = inSheet
    ? { style: th.container }
    : { showsVerticalScrollIndicator: false, contentContainerStyle: th.container };

  return (
    <Container {...containerProps}>
      {/* Başlık ve Kicker */}
      <View style={th.header}>
        <T style={{ fontSize: 11, letterSpacing: 1.5, color: colors.purple, fontWeight: '700' }}>
          SAYAÇLAR, HESAPLAYICILAR & REHBERLER
        </T>
        <T bold style={th.title}>Momora Araçlar & Appler</T>
        <T style={th.subtitle}>
          Hamilelikten doğuma ve yenidoğan bakımına kadar ihtiyaç duyacağınız tüm akıllı araçlar.
        </T>
      </View>

      {/* Hızlı Aksiyon: Tekme & Kasılma Sayaçları Hero */}
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
              <Icon name="footprint" size={28} color="#9D5C80" />
            )}
          </View>
          <T bold style={{ fontSize: 15, color: '#632D4C' }}>Tekme Sayacı</T>
          <T style={{ fontSize: 11.5, color: '#91637F', marginTop: 3 }}>
            {(state.kickSessions || []).length} seans kayıtlı · 10 tekme kuralı
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
              <Icon name="contraction" size={28} color="#4F79A1" />
            )}
          </View>
          <T bold style={{ fontSize: 15, color: '#274969' }}>Kasılma Sayacı</T>
          <T style={{ fontSize: 11.5, color: '#567594', marginTop: 3 }}>
            5-1-1 kuralı · Doğum sinyalleri
          </T>
        </Tap>
      </View>

      {/* Kategori Filtre Butonları */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
        {categories.map(c => (
          <Tap
            key={c.id}
            onPress={() => setCatFilter(c.id)}
            label={c.label}
            style={[th.catTab, catFilter === c.id && th.catTabActive]}
          >
            <T bold={catFilter === c.id} style={{ fontSize: 12, color: catFilter === c.id ? 'white' : colors.ink }}>
              {c.label}
            </T>
          </Tap>
        ))}
      </ScrollView>

      {/* Tüm Araçlar Grid */}
      <View style={th.grid}>
        {displayedTools.map(tool => (
          <Tap
            key={tool.id}
            onPress={() => {
              if (tool.available) {
                open(tool.id);
              } else {
                toast && toast(`${tool.title} sonraki güncellemede aktif olacak ✨`);
              }
            }}
            label={tool.title}
            style={[th.toolCard, { backgroundColor: tool.color }]}
          >
            <View style={th.toolTop}>
              <View style={[th.toolIconBox, { backgroundColor: tool.tint + '18' }]}>
                {tool.art && generatedAssets[tool.art] ? (
                  <Image source={generatedAssets[tool.art]} style={{ width: 34, height: 34 }} resizeMode="contain" />
                ) : (
                  <Icon name={tool.icon} size={22} color={tool.tint} />
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
    </Container>
  );
}

const th = StyleSheet.create({
  container: { paddingHorizontal: 17, paddingTop: 16, paddingBottom: 32, gap: 14 },
  header: { marginBottom: 2 },
  title: { fontSize: 26, letterSpacing: -0.5, color: colors.ink, marginTop: 4 },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 4, lineHeight: 19 },
  quickRow: { flexDirection: 'row', gap: 12 },
  quickHero: { flex: 1, padding: 16, borderRadius: 22, borderWidth: 1, ...shadow },
  quickHeroIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginBottom: 10, ...shadow },
  catTab: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#EFEAEF' },
  catTabActive: { backgroundColor: colors.purple },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, justifyContent: 'space-between' },
  toolCard: { width: '48%', borderRadius: 22, padding: 15, minHeight: 136, borderWidth: 1, borderColor: '#ECE1EC', ...shadow },
  toolTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  toolIconBox: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  categoryTag: { backgroundColor: '#FFFFFF99', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
  toolTitle: { fontSize: 14.5, letterSpacing: -0.2 },
  toolSub: { fontSize: 11.5, color: colors.muted, marginTop: 4, lineHeight: 16 },
});
