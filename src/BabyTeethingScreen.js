import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Modal } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, ScreenHero, InfoNote, MetricCard } from './ui';
import { uid, formatLocalizedDate } from './domain.mjs';
import { saveBabyTeethCloud } from './backendSync';

export const PRIMARY_TEETH = [
  // Upper Jaw (Maxillary) - 10 teeth
  { id: 't_u_m2_r', jaw: 'upper', pos: 'right', nameTr: 'Üst Sağ 2. Azı', nameEn: 'Upper Right 2nd Molar', rangeTr: '25-33 ay', rangeEn: '25-33 mos', order: 1 },
  { id: 't_u_m1_r', jaw: 'upper', pos: 'right', nameTr: 'Üst Sağ 1. Azı', nameEn: 'Upper Right 1st Molar', rangeTr: '13-19 ay', rangeEn: '13-19 mos', order: 2 },
  { id: 't_u_c_r', jaw: 'upper', pos: 'right', nameTr: 'Üst Sağ Köpek', nameEn: 'Upper Right Canine', rangeTr: '16-22 ay', rangeEn: '16-22 mos', order: 3 },
  { id: 't_u_i2_r', jaw: 'upper', pos: 'right', nameTr: 'Üst Sağ Yan Kesici', nameEn: 'Upper Right Lateral Incisor', rangeTr: '9-13 ay', rangeEn: '9-13 mos', order: 4 },
  { id: 't_u_i1_r', jaw: 'upper', pos: 'center', nameTr: 'Üst Sağ Ön Kesici', nameEn: 'Upper Right Central Incisor', rangeTr: '8-12 ay', rangeEn: '8-12 mos', order: 5 },
  { id: 't_u_i1_l', jaw: 'upper', pos: 'center', nameTr: 'Üst Sol Ön Kesici', nameEn: 'Upper Left Central Incisor', rangeTr: '8-12 ay', rangeEn: '8-12 mos', order: 6 },
  { id: 't_u_i2_l', jaw: 'upper', pos: 'left', nameTr: 'Üst Sol Yan Kesici', nameEn: 'Upper Left Lateral Incisor', rangeTr: '9-13 ay', rangeEn: '9-13 mos', order: 7 },
  { id: 't_u_c_l', jaw: 'upper', pos: 'left', nameTr: 'Üst Sol Köpek', nameEn: 'Upper Left Canine', rangeTr: '16-22 ay', rangeEn: '16-22 mos', order: 8 },
  { id: 't_u_m1_l', jaw: 'upper', pos: 'left', nameTr: 'Üst Sol 1. Azı', nameEn: 'Upper Left 1st Molar', rangeTr: '13-19 ay', rangeEn: '13-19 mos', order: 9 },
  { id: 't_u_m2_l', jaw: 'upper', pos: 'left', nameTr: 'Üst Sol 2. Azı', nameEn: 'Upper Left 2nd Molar', rangeTr: '25-33 ay', rangeEn: '25-33 mos', order: 10 },

  // Lower Jaw (Mandibular) - 10 teeth
  { id: 't_l_m2_r', jaw: 'lower', pos: 'right', nameTr: 'Alt Sağ 2. Azı', nameEn: 'Lower Right 2nd Molar', rangeTr: '23-31 ay', rangeEn: '23-31 mos', order: 11 },
  { id: 't_l_m1_r', jaw: 'lower', pos: 'right', nameTr: 'Alt Sağ 1. Azı', nameEn: 'Lower Right 1st Molar', rangeTr: '14-20 ay', rangeEn: '14-20 mos', order: 12 },
  { id: 't_l_c_r', jaw: 'lower', pos: 'right', nameTr: 'Alt Sağ Köpek', nameEn: 'Lower Right Canine', rangeTr: '17-23 ay', rangeEn: '17-23 mos', order: 13 },
  { id: 't_l_i2_r', jaw: 'lower', pos: 'right', nameTr: 'Alt Sağ Yan Kesici', nameEn: 'Lower Right Lateral Incisor', rangeTr: '10-16 ay', rangeEn: '10-16 mos', order: 14 },
  { id: 't_l_i1_r', jaw: 'lower', pos: 'center', nameTr: 'Alt Sağ Ön Kesici', nameEn: 'Lower Right Central Incisor', rangeTr: '6-10 ay', rangeEn: '6-10 mos', order: 15 },
  { id: 't_l_i1_l', jaw: 'lower', pos: 'center', nameTr: 'Alt Sol Ön Kesici', nameEn: 'Lower Left Central Incisor', rangeTr: '6-10 ay', rangeEn: '6-10 mos', order: 16 },
  { id: 't_l_i2_l', jaw: 'lower', pos: 'left', nameTr: 'Alt Sol Yan Kesici', nameEn: 'Lower Left Lateral Incisor', rangeTr: '10-16 ay', rangeEn: '10-16 mos', order: 17 },
  { id: 't_l_c_l', jaw: 'lower', pos: 'left', nameTr: 'Alt Sol Köpek', nameEn: 'Lower Left Canine', rangeTr: '17-23 ay', rangeEn: '17-23 mos', order: 18 },
  { id: 't_l_m1_l', jaw: 'lower', pos: 'left', nameTr: 'Alt Sol 1. Azı', nameEn: 'Lower Left 1st Molar', rangeTr: '14-20 ay', rangeEn: '14-20 mos', order: 19 },
  { id: 't_l_m2_l', jaw: 'lower', pos: 'left', nameTr: 'Alt Sol 2. Azı', nameEn: 'Lower Left 2nd Molar', rangeTr: '23-31 ay', rangeEn: '23-31 mos', order: 20 },
];

export function BabyTeethingScreen({ state, update, toast, close, lang: propLang }) {
  const lang = propLang || state?.lang || 'tr';
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'symptoms' | 'soothing'
  const [selectedTooth, setSelectedTooth] = useState(null);

  const teethData = state.babyTeeth || {};

  const stats = useMemo(() => {
    const values = Object.values(teethData);
    const eruptedCount = values.filter(v => v?.status === 'erupted').length;
    const swollenCount = values.filter(v => v?.status === 'swollen').length;
    return {
      erupted: eruptedCount,
      swollen: swollenCount,
      total: 20,
      pct: Math.round((eruptedCount / 20) * 100),
    };
  }, [teethData]);

  const updateToothStatus = (toothId, status) => {
    const updated = {
      ...teethData,
      [toothId]: {
        status,
        eruptedAt: status === 'erupted' ? new Date().toISOString() : null,
      },
    };

    update({ babyTeeth: updated });
    saveBabyTeethCloud(updated).catch(() => {});

    setSelectedTooth(null);
    toast && toast(
      status === 'erupted'
        ? (isEn ? '🎉 Tooth erupted! Marked on chart' : '🎉 İnci diş çıktı! Haritaya işlendi')
        : status === 'swollen'
        ? (isEn ? '⏳ Marked as teething/swollen' : '⏳ Patlamak üzere olarak işaretlendi')
        : (isEn ? 'Status reset' : 'Durum sıfırlandı')
    );
  };

  const upperTeeth = PRIMARY_TEETH.filter(t => t.jaw === 'upper');
  const lowerTeeth = PRIMARY_TEETH.filter(t => t.jaw === 'lower');

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHero
        title={isEn ? 'Baby Teething Chart & Milestones' : 'Bebek Diş Çıkarma Haritası'}
        subtitle={isEn ? 'Interactive 20-tooth pediatric dental map & soothing care' : '20 süt dişi anatomik haritası, patlama zamanları ve rahatlatma rehberi'}
        coverAsset="card_baby_teething"
      />

      {/* Subtle Clinical Footnote */}
      <View style={styles.medicalFootnote}>
        <Icon name="check" size={12} color="#8A7A90" />
        <T style={styles.medicalFootnoteText}>
          {isEn
            ? 'Teething timelines are typical averages. Persistent high fever (>38°C) is not a normal teething sign; consult your doctor.'
            : 'Diş çıkarma takvimi ortalama gelişim seyrini gösterir. Dirençli yüksek ateş diş çıkarma belirtisi değildir; hekiminize danışınız.'}
        </T>
      </View>

      {/* Progress Cards */}
      <View style={styles.metricsRow}>
        <MetricCard
          label={isEn ? 'Erupted Teeth' : 'Çıkan Dişler'}
          value={`${stats.erupted} / 20`}
          unit={isEn ? 'Pearls' : 'İnci'}
          tone="lavender"
        />
        <MetricCard
          label={isEn ? 'Teething Now' : 'Patlamak Üzere'}
          value={String(stats.swollen)}
          unit={isEn ? 'Swollen' : 'Kabarık'}
          tone="sage"
        />
        <MetricCard
          label={isEn ? 'Completion' : 'Tamamlanma'}
          value={`%${stats.pct}`}
          unit={isEn ? 'Deciduous' : 'Süt Dişi'}
          tone="rose"
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {[
          { key: 'chart', label: isEn ? 'Teeth Chart' : 'Diş Haritası', icon: 'heart' },
          { key: 'symptoms', label: isEn ? 'Symptom Guide' : 'Belirti & Ateş', icon: 'shield' },
          { key: 'soothing', label: isEn ? 'Soothing Tips' : 'Rahatlatıcı Bakım', icon: 'leaf' },
        ].map(t => {
          const active = activeTab === t.key;
          return (
            <Tap
              key={t.key}
              onPress={() => setActiveTab(t.key)}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
            >
              <Icon name={t.icon} size={14} color={active ? colors.purple : '#7E6B87'} />
              <T bold={active} style={{ fontSize: 12, color: active ? colors.purple : '#7E6B87' }}>
                {t.label}
              </T>
            </Tap>
          );
        })}
      </View>

      {/* ─── TAB 1: CHART (Diş Haritası) ─── */}
      {activeTab === 'chart' && (
        <View style={{ gap: 14 }}>
          {/* Upper Jaw Arch */}
          <Card style={styles.jawCard}>
            <View style={styles.jawHeader}>
              <T bold style={styles.jawTitle}>
                {isEn ? '👄 Upper Jaw (Maxillary Teeth)' : '👄 Üst Çene (10 Süt Dişi)'}
              </T>
              <T style={{ fontSize: 11, color: colors.muted }}>
                {isEn ? 'Right to Left Arch' : 'Sağdan Sola Kavis'}
              </T>
            </View>

            <View style={styles.archRow}>
              {upperTeeth.map(tooth => {
                const info = teethData[tooth.id];
                const status = info?.status || 'waiting';
                const isErupted = status === 'erupted';
                const isSwollen = status === 'swollen';

                return (
                  <Tap
                    key={tooth.id}
                    onPress={() => setSelectedTooth(tooth)}
                    style={[
                      styles.toothPill,
                      isErupted && styles.toothPillErupted,
                      isSwollen && styles.toothPillSwollen,
                    ]}
                  >
                    <T style={{ fontSize: isErupted ? 22 : 18 }}>
                      {isErupted ? '✨🦷' : isSwollen ? '⏳' : '🦷'}
                    </T>
                    <T bold style={[styles.toothName, isErupted && { color: '#027A48' }]}>
                      {isEn ? tooth.nameEn.split(' ')[2] || tooth.nameEn : tooth.nameTr.split(' ')[2] || tooth.nameTr}
                    </T>
                    <T style={styles.toothRange}>
                      {isEn ? tooth.rangeEn : tooth.rangeTr}
                    </T>
                  </Tap>
                );
              })}
            </View>
          </Card>

          {/* Lower Jaw Arch */}
          <Card style={styles.jawCard}>
            <View style={styles.jawHeader}>
              <T bold style={styles.jawTitle}>
                {isEn ? '👅 Lower Jaw (Mandibular Teeth)' : '👅 Alt Çene (10 Süt Dişi)'}
              </T>
              <T style={{ fontSize: 11, color: colors.muted }}>
                {isEn ? 'Usually central incisors erupt first (6-10m)' : 'Genellikle ilk ön kesiciler patlar (6-10 ay)'}
              </T>
            </View>

            <View style={styles.archRow}>
              {lowerTeeth.map(tooth => {
                const info = teethData[tooth.id];
                const status = info?.status || 'waiting';
                const isErupted = status === 'erupted';
                const isSwollen = status === 'swollen';

                return (
                  <Tap
                    key={tooth.id}
                    onPress={() => setSelectedTooth(tooth)}
                    style={[
                      styles.toothPill,
                      isErupted && styles.toothPillErupted,
                      isSwollen && styles.toothPillSwollen,
                    ]}
                  >
                    <T style={{ fontSize: isErupted ? 22 : 18 }}>
                      {isErupted ? '✨🦷' : isSwollen ? '⏳' : '🦷'}
                    </T>
                    <T bold style={[styles.toothName, isErupted && { color: '#027A48' }]}>
                      {isEn ? tooth.nameEn.split(' ')[2] || tooth.nameEn : tooth.nameTr.split(' ')[2] || tooth.nameTr}
                    </T>
                    <T style={styles.toothRange}>
                      {isEn ? tooth.rangeEn : tooth.rangeTr}
                    </T>
                  </Tap>
                );
              })}
            </View>
          </Card>

          {/* Legend */}
          <Card style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <T style={{ fontSize: 16 }}>✨🦷</T>
              <T style={{ fontSize: 11.5, color: colors.ink }}>{isEn ? 'Erupted' : 'Çıktı (İnci)'}</T>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <T style={{ fontSize: 16 }}>⏳</T>
              <T style={{ fontSize: 11.5, color: colors.ink }}>{isEn ? 'Swollen/Teething' : 'Patlamak Üzere'}</T>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <T style={{ fontSize: 16 }}>⚪</T>
              <T style={{ fontSize: 11.5, color: colors.ink }}>{isEn ? 'Awaiting' : 'Bekleniyor'}</T>
            </View>
          </Card>
        </View>
      )}

      {/* ─── TAB 2: SYMPTOMS (Belirti & Ateş Yönetimi) ─── */}
      {activeTab === 'symptoms' && (
        <View style={{ gap: 14 }}>
          <Card style={{ padding: 16 }}>
            <T bold style={{ fontSize: 14.5, color: colors.ink, marginBottom: 8 }}>
              {isEn ? 'Normal Teething Signs vs. Illness Warning' : 'Normal Diş Belirtileri ve Hastalık Ayrımı'}
            </T>
            <T style={{ fontSize: 12.5, color: '#4E3F54', lineHeight: 18 }}>
              {isEn
                ? 'Teething causes localized mild inflammation, increased drooling, and fussiness. It does NOT cause high fever (>38°C), diarrhea, or systemic illness.'
                : 'Diş çıkarma diş etinde hafif ödem, salya akışı ve huzursuzluk yaratır. Ancak 38°C üzerindeki yüksek ateş veya ishal diş çıkarmadan kaynaklanmaz; enfeksiyon şüphesiyle hekime danışılmalıdır.'}
            </T>
          </Card>

          <Card style={{ padding: 16, backgroundColor: '#FAF5FA' }}>
            <T bold style={{ fontSize: 13.5, color: colors.purple, marginBottom: 10 }}>
              {isEn ? 'Expected Normal Symptoms:' : 'Beklenen Normal Belirtiler:'}
            </T>
            {[
              { icon: '💧', tr: 'Yoğun salya akışı ve çene etrafında hafif kızarıklık', en: 'Copious drooling & mild chin redness' },
              { icon: '🖐️', tr: 'Elleri ve sert nesneleri sürekli ağza götürüp ısırma arzusu', en: 'Constant biting on fingers and hard objects' },
              { icon: '🌸', tr: 'Diş etinde kabarma, beyazımsı tepecik veya kızarıklık', en: 'Swollen gums with visible whitish bud' },
              { icon: '🌙', tr: 'Gece uykusunda hafif huzursuzluk ve sık uyanma', en: 'Mild sleep disruption and brief night wakings' },
              { icon: '🌡️', tr: 'Hafif vücut sıcaklığı artışı (<38.0°C sınırında)', en: 'Mild low-grade temperature (<38.0°C)' },
            ].map((item, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <T style={{ fontSize: 16 }}>{item.icon}</T>
                <T style={{ flex: 1, fontSize: 12, color: colors.ink }}>{isEn ? item.en : item.tr}</T>
              </View>
            ))}
          </Card>

          <InfoNote
            title={isEn ? 'Pediatric Emergency Red Flags' : 'Doktora Başvurulması Gereken Durumlar'}
            text={isEn
              ? 'Contact your pediatrician if your baby develops a fever ≥ 38.5°C, persistent vomiting, refusal to drink fluids, or lethargy.'
              : 'Bebeğinizde 38.5°C üzeri dirençli ateş, beslenmeyi ve sıvıyı tamamen reddetme, sürekli kusma veya halsizlik varsa vakit kaybetmeden çocuk hekiminize başvurun.'}
            tone="alert"
          />
        </View>
      )}

      {/* ─── TAB 3: SOOTHING (Rahatlatıcı Bakım) ─── */}
      {activeTab === 'soothing' && (
        <View style={{ gap: 14 }}>
          {[
            {
              icon: '🧊',
              titleTr: 'Soğutulmuş Diş Kaşıyıcılar',
              titleEn: 'Chilled (Not Frozen) Teethers',
              descTr: 'Buzdolabında soğutulmuş (dondurucuda taş gibi donmamış) BPA içermeyen silikon kaşıyıcılar diş etindeki yangıyı mucize gibi dindirir.',
              descEn: 'Refrigerated silicone teethers numb tender gums safely. Never freeze solid as rock-hard toys can bruise delicate gums.',
            },
            {
              icon: '☝️',
              titleTr: 'Temiz Parmak Masajı',
              titleEn: 'Clean Finger Gum Massage',
              descTr: 'Ellerinizi yıkayıp parmağınızla bebeğinizin kabarık diş etine dairesel hareketlerle hafifçe bastırarak masaj yapın.',
              descEn: 'Gently rub baby’s swollen gums with a clean, washed finger. The counter-pressure provides immense instant relief.',
            },
            {
              icon: '🍼',
              titleTr: 'Anne Sütü Buzu / Soğuk Meyve Süzgeci',
              titleEn: 'Breastmilk Popsicle / Fruit Feeder',
              descTr: 'Ek gıda dönemindeki bebekler için anne sütünden mini dondurmalar veya silikon meyve emziğine konulmuş soğuk armut dilimleri çok rahatlatıcıdır.',
              descEn: 'Breastmilk popsicles or cold apple/pear slices in a silicone mesh feeder soothe gums while providing gentle nourishment.',
            },
            {
              icon: '⚠️',
              titleTr: 'Kehribar Kolye & Uyuşturucu Jeller Uyarısı',
              titleEn: 'Warning: Amber Necklaces & Benzocaine Gels',
              descTr: 'Amerikan Pediatri Akademisi (AAP), boğulma riski nedeniyle kehribar kolyeleri ve kan oksijenini düşürebilen benzokainli jelleri kesinlikle önermez.',
              descEn: 'The AAP strongly warns against amber teething necklaces (strangulation hazard) and benzocaine-containing numbing gels.',
            },
          ].map((card, idx) => (
            <Card key={idx} style={{ padding: 14, gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <T style={{ fontSize: 20 }}>{card.icon}</T>
                <T bold style={{ fontSize: 13.5, color: colors.ink }}>
                  {isEn ? card.titleEn : card.titleTr}
                </T>
              </View>
              <T style={{ fontSize: 12, color: '#57465E', lineHeight: 17 }}>
                {isEn ? card.descEn : card.descTr}
              </T>
            </Card>
          ))}
        </View>
      )}

      {/* Tooth Edit Modal */}
      {selectedTooth && (
        <Modal transparent animationType="fade" visible={!!selectedTooth} onRequestClose={() => setSelectedTooth(null)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBox}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View>
                  <T bold style={{ fontSize: 16, color: colors.ink }}>
                    {isEn ? selectedTooth.nameEn : selectedTooth.nameTr}
                  </T>
                  <T style={{ fontSize: 12, color: colors.purple, marginTop: 2 }}>
                    {isEn ? `Expected: ${selectedTooth.rangeEn}` : `Beklenen Dönem: ${selectedTooth.rangeTr}`}
                  </T>
                </View>
                <Tap onPress={() => setSelectedTooth(null)} style={styles.modalCloseBtn}>
                  <Icon name="close" size={16} color="#7E6B87" />
                </Tap>
              </View>

              <View style={{ gap: 8, marginTop: 6 }}>
                <Tap
                  onPress={() => updateToothStatus(selectedTooth.id, 'erupted')}
                  style={[styles.modalActionBtn, { backgroundColor: '#ECFDF3', borderColor: '#A7F3D0' }]}
                >
                  <T style={{ fontSize: 18 }}>✨🦷</T>
                  <View style={{ flex: 1 }}>
                    <T bold style={{ fontSize: 13, color: '#027A48' }}>
                      {isEn ? 'Tooth Erupted! (Pearl)' : 'İnci Diş Çıktı! 🎉'}
                    </T>
                    <T style={{ fontSize: 11, color: '#059669' }}>
                      {isEn ? 'Mark as erupted with today’s milestone date' : 'Bugünün tarihi ile çıktı olarak kaydet'}
                    </T>
                  </View>
                </Tap>

                <Tap
                  onPress={() => updateToothStatus(selectedTooth.id, 'swollen')}
                  style={[styles.modalActionBtn, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}
                >
                  <T style={{ fontSize: 18 }}>⏳</T>
                  <View style={{ flex: 1 }}>
                    <T bold style={{ fontSize: 13, color: '#B45309' }}>
                      {isEn ? 'Teething / Swollen Gum' : 'Patlamak Üzere / Diş Eti Kabarık'}
                    </T>
                    <T style={{ fontSize: 11, color: '#D97706' }}>
                      {isEn ? 'Gums are swollen, eruption expected soon' : 'Diş eti beyazladı ve kabardı'}
                    </T>
                  </View>
                </Tap>

                <Tap
                  onPress={() => updateToothStatus(selectedTooth.id, 'waiting')}
                  style={[styles.modalActionBtn, { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }]}
                >
                  <T style={{ fontSize: 18 }}>⚪</T>
                  <View style={{ flex: 1 }}>
                    <T bold style={{ fontSize: 13, color: '#4B5563' }}>
                      {isEn ? 'Not Yet Erupted (Reset)' : 'Henüz Çıkmadı (Sıfırla)'}
                    </T>
                    <T style={{ fontSize: 11, color: '#6B7280' }}>
                      {isEn ? 'Awaiting milestone' : 'Bekleyen diş listesine geri al'}
                    </T>
                  </View>
                </Tap>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#EDE5EF',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...shadow,
  },
  jawCard: {
    padding: 16,
    gap: 12,
  },
  jawHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#F0E6F2',
  },
  jawTitle: {
    fontSize: 13.5,
    color: colors.ink,
  },
  archRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  toothPill: {
    width: '18%',
    minWidth: 55,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#FAF5FA',
    borderWidth: 1,
    borderColor: '#E8DCEA',
    alignItems: 'center',
    gap: 2,
  },
  toothPillErupted: {
    backgroundColor: '#ECFDF3',
    borderColor: '#34D399',
    ...shadow,
  },
  toothPillSwollen: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FBBF24',
  },
  toothName: {
    fontSize: 9.5,
    color: colors.ink,
    textAlign: 'center',
  },
  toothRange: {
    fontSize: 8,
    color: colors.muted,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(25, 12, 30, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    ...shadow,
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3EAF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  medicalFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F9F6FA',
    borderWidth: 1,
    borderColor: '#EFE7F2',
    marginTop: 2,
    marginBottom: 4,
  },
  medicalFootnoteText: {
    fontSize: 11,
    color: '#8A7A90',
    lineHeight: 15,
    textAlign: 'center',
    flex: 1,
  },
});
