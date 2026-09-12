import React from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section } from './ui';
import { generatedAssets } from './generatedAssets';

export const toolCatalog = [
  {
    id: 'kickCounter',
    title: 'Tekme Sayacı',
    subtitle: 'Fetal hareket & 10 tekme seansı',
    icon: 'footprint',
    art: 'ui_kick_foot_button',
    color: '#F4E8EE',
    tint: '#9A5B80',
    available: true,
  },
  {
    id: 'contractionTimer',
    title: 'Kasılma Sayacı',
    subtitle: '5-1-1 kuralı & doğum zamanı',
    icon: 'contraction',
    art: 'ui_contraction_pulse_button',
    color: '#EBF1F8',
    tint: '#557EA8',
    available: true,
  },
  {
    id: 'hospitalBag',
    title: 'Hastane Çantası',
    subtitle: 'Anne, bebek & refakatçi listesi',
    icon: 'bag',
    art: 'ui_hospital_bag_3d',
    color: '#F2ECF7',
    tint: '#7C5292',
    available: true,
  },
  {
    id: 'weight',
    title: 'Kilo Takibi & BMI',
    subtitle: 'İdeal gebelik kilo koridoru',
    icon: 'scale',
    art: 'ui_weight_bmi_gauge',
    color: '#EAF3ED',
    tint: '#4F8464',
    available: true,
  },
  {
    id: 'birthPlan',
    title: 'Doğum Planı',
    subtitle: 'Doktorunuza özel tercihler',
    icon: 'milestone',
    art: 'ui_birth_plan_scroll',
    color: '#FAF1E8',
    tint: '#A3683A',
    available: true,
  },
  {
    id: 'doctorQuestions',
    title: 'Doktora Sorular',
    subtitle: 'Haftalık kontrol soru listesi',
    icon: 'chat',
    art: 'ui_doctor_prep_notebook',
    color: '#F6EFF6',
    tint: '#8C568E',
    available: true,
  },
  {
    id: 'babyNames',
    title: 'Bebek İsimleri',
    subtitle: 'Anlamları ve favori eşleşmeler',
    icon: 'heart',
    art: 'ui_baby_name_blocks',
    color: '#FDF2F4',
    tint: '#BD5773',
    available: true,
  },
  {
    id: 'bellyAlbum',
    title: 'Göbek Albümü',
    subtitle: 'Haftalık silüet & hatıralar',
    icon: 'calendar',
    art: 'card_ultrasound_frame',
    color: '#EDE8F5',
    tint: '#6D5B99',
    available: false,
  },
  {
    id: 'registry',
    title: 'İhtiyaç Listesi',
    subtitle: 'Bebek alışveriş & bütçe planı',
    icon: 'check',
    art: 'ui_baby_crib',
    color: '#F0F5F2',
    tint: '#4C7960',
    available: false,
  },
];

export function ToolsHub({ open, state, update, toast, inSheet = false }) {
  const Container = inSheet ? View : ScrollView;
  const containerProps = inSheet ? { style: th.container } : { showsVerticalScrollIndicator: false, contentContainerStyle: th.container };
  return (
    <Container {...containerProps}>
      <View style={th.header}>
        <T bold style={th.title}>Momora Araçlar</T>
        <T style={th.subtitle}>Hamilelik ve doğuma hazırlıkta en büyük yardımcıların.</T>
      </View>

      {/* Öne Çıkan Hızlı Sayaçlar */}
      <View style={th.quickRow}>
        <Tap
          onPress={() => open('kickCounter')}
          label="Tekme sayacını aç"
          style={[th.quickHero, { backgroundColor: '#FDF3F6', borderColor: '#F2DEE5' }]}
        >
          <View style={th.quickHeroIcon}>
            {generatedAssets['card_kick_counter'] ? (
              <Image source={generatedAssets['card_kick_counter']} style={{ width: 44, height: 44 }} resizeMode="contain" />
            ) : (
              <Icon name="footprint" size={28} color="#9D5C80" />
            )}
          </View>
          <T bold style={{ fontSize: 14, color: '#632D4C' }}>Tekme Sayacı</T>
          <T style={{ fontSize: 11, color: '#91637F', marginTop: 3 }}>
            {(state.kickSessions || []).length} seans kayıtlı
          </T>
        </Tap>

        <Tap
          onPress={() => open('contractionTimer')}
          label="Kasılma sayacını aç"
          style={[th.quickHero, { backgroundColor: '#F0F6FB', borderColor: '#DDE9F3' }]}
        >
          <View style={th.quickHeroIcon}>
            {generatedAssets['card_contractions'] ? (
              <Image source={generatedAssets['card_contractions']} style={{ width: 44, height: 44 }} resizeMode="contain" />
            ) : (
              <Icon name="contraction" size={28} color="#4F79A1" />
            )}
          </View>
          <T bold style={{ fontSize: 14, color: '#274969' }}>Kasılma Sayacı</T>
          <T style={{ fontSize: 11, color: '#567594', marginTop: 3 }}>5-1-1 kuralı hazır</T>
        </Tap>
      </View>

      {/* Tüm Araçlar Grid */}
      <Section title="Tüm Hazırlık Araçları" />
      <View style={th.grid}>
        {toolCatalog.map(tool => (
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
                  <Image source={generatedAssets[tool.art]} style={{ width: 32, height: 32 }} resizeMode="contain" />
                ) : (
                  <Icon name={tool.icon} size={22} color={tool.tint} />
                )}
              </View>
              {!tool.available && (
                <View style={th.soonBadge}>
                  <T style={th.soonText}>Yakında</T>
                </View>
              )}
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
  container: { paddingHorizontal: 17, paddingTop: 15, paddingBottom: 28, gap: 14 },
  header: { marginBottom: 4 },
  title: { fontSize: 25, letterSpacing: -0.5, color: colors.ink },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 4, lineHeight: 19 },
  quickRow: { flexDirection: 'row', gap: 12 },
  quickHero: { flex: 1, padding: 14, borderRadius: 20, borderWidth: 1, ...shadow },
  quickHeroIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginBottom: 10, ...shadow },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  toolCard: { width: '48%', borderRadius: 20, padding: 14, minHeight: 125, borderWidth: 1, borderColor: '#ECE3EC', ...shadow },
  toolTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  toolIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  soonBadge: { backgroundColor: '#FFFFFF99', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  soonText: { fontSize: 9, color: colors.muted, fontFamily: fonts.bold },
  toolTitle: { fontSize: 14, letterSpacing: -0.2 },
  toolSub: { fontSize: 11, color: colors.muted, marginTop: 4, lineHeight: 15 },
});
