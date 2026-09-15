import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, ScreenHero, InfoNote } from './ui';

export const MEDICATION_DATABASE = [
  // Baş Ağrısı & Ağrı
  {
    id: 'paracetamol',
    category: 'pain',
    catTr: 'Ağrı & Ateş',
    catEn: 'Pain & Fever',
    nameTr: 'Parasetamol (Asetaminofen)',
    nameEn: 'Paracetamol (Acetaminophen)',
    tradeNames: 'Parol, Minoset, Panadol, Tylenol',
    safetyTier: 'safe', // 'safe' | 'caution' | 'avoid'
    tierLabelTr: '🟢 Genelde Güvenli (1. Basamak)',
    tierLabelEn: '🟢 First-line Safe',
    descTr: 'Gebelikte tüm trimesterlerde en güvenilir kabul edilen analjezik ve ateş düşürücüdür. Önerilen günlük dozu (maksimum 3000-4000 mg) aşmayınız.',
    descEn: 'Considered the safest analgesic and antipyretic in all trimesters of pregnancy. Do not exceed the maximum daily dose (3000-4000 mg).',
    naturalAlternativeTr: 'Karanlık ve sessiz bir odada dinlenme, şakaklara soğuk kompres, bol su tüketimi.',
    naturalAlternativeEn: 'Resting in a dark room, cool temple compress, staying well hydrated.',
  },
  {
    id: 'ibuprofen',
    category: 'pain',
    catTr: 'Ağrı & Ateş',
    catEn: 'Pain & Fever',
    nameTr: 'İbuprofen / NSAİİ',
    nameEn: 'Ibuprofen / NSAIDs',
    tradeNames: 'Arveles, Dolorex, Advil, Nurofen, Majezik',
    safetyTier: 'avoid',
    tierLabelTr: '🔴 KESİNLİKLE KAÇINILMALI (Özellikle 20. haftadan sonra)',
    tierLabelEn: '🔴 CONTRAINDICATED (Especially after 20 weeks)',
    descTr: 'FDA ve Türk Jinekoloji Derneği uyarısı: 20. haftadan sonra bebeğin böbrek fonksiyonlarını bozarak oligohidramniyosa (amniyon sıvısı azlığı) ve 3. trimesterde duktus arteriozus damarının erken kapanmasına yol açabilir.',
    descEn: 'FDA Black Box Warning: Causes fetal renal dysfunction, oligohydramnios after week 20, and premature closure of fetal ductus arteriosus in 3rd trimester.',
    naturalAlternativeTr: 'Parasetamol tercih edilmeli, kas gevşetici hafif masaj yapılmalıdır.',
    naturalAlternativeEn: 'Use paracetamol instead. Gentle neck and shoulder massage.',
  },

  // Mide Yanması & Reflü
  {
    id: 'antacids',
    category: 'heartburn',
    catTr: 'Mide Yanması & Reflü',
    catEn: 'Heartburn & Reflux',
    nameTr: 'Kalsiyum & Magnezyum Antiasitleri',
    nameEn: 'Calcium & Magnesium Antacids',
    tradeNames: 'Rennie, Gaviscon, Talcid, Tums',
    safetyTier: 'safe',
    tierLabelTr: '🟢 Güvenli (Gerektiğinde)',
    tierLabelEn: '🟢 Safe for As-Needed Use',
    descTr: 'Mide asidini mekanik olarak nötralize eder ve sistemik dolaşıma neredeyse geçmez. Alüminyum ve sodyum bikarbonat içeren yüksek sodyumlu formlardan kaçınınız.',
    descEn: 'Neutralizes stomach acid locally without significant systemic absorption. Avoid high-sodium bicarbonate effervescent formulas.',
    naturalAlternativeTr: 'Yatarken başı yüksekte tutma (çift yastık), yemekten hemen sonra uzanmama, yağlı ve baharatlı gıdaları sınırlama, ılık badem sütü.',
    naturalAlternativeEn: 'Elevating head with extra pillows, avoiding lying down within 2 hours of eating, small frequent meals, warm almond milk.',
  },

  // Bulantı & Kusma
  {
    id: 'b6_dimenhydrinate',
    category: 'nausea',
    catTr: 'Mide Bulantısı',
    catEn: 'Morning Sickness',
    nameTr: 'B6 Vitamini (Piridoksin) + Doksilamin',
    nameEn: 'Vitamin B6 (Pyridoxine) + Doxylamine',
    tradeNames: 'Diclegis, Prilosec, Emedur, Dramamine',
    safetyTier: 'safe',
    tierLabelTr: '🟢 1. Basamak Hekim Onaylı',
    tierLabelEn: '🟢 1st-Line Approved by ACOG',
    descTr: 'ACOG kılavuzuna göre gebelik bulantısında birinci basamak tedavidir. Günde 30-50 mg B6 vitamini tek başına veya doksilaminle hekim kontrolünde kullanılır.',
    descEn: 'First-line FDA-approved therapeutic protocol for morning sickness. Safe in the first trimester.',
    naturalAlternativeTr: 'Sabah yataktan kalkmadan önce tuzlu kraker atıştırmak, taze zencefil dilimli ılık su, akupresür bileklikleri (Neiguan noktası).',
    naturalAlternativeEn: 'Dry crackers before getting out of bed, fresh ginger tea, P6 acupressure wristbands.',
  },

  // Soğuk Algınlığı & Boğaz
  {
    id: 'saline_spray',
    category: 'cold',
    catTr: 'Soğuk Algınlığı & Burun',
    catEn: 'Cold & Sinus',
    nameTr: 'İzotonik Deniz Suyu & Tuzlu Su Spreyi',
    nameEn: 'Isotonic Saline Nasal Spray',
    tradeNames: 'Sterimar, Sinomarin, OtriBebe',
    safetyTier: 'safe',
    tierLabelTr: '🟢 %100 Güvenli & İlaçsız',
    tierLabelEn: '🟢 100% Safe & Drug-Free',
    descTr: 'Herhangi bir kimyasal içermez; burun mukozasını nemlendirir ve tıkalı sinüsleri mekanik olarak açar. İstenildiği sıklıkta kullanılabilir.',
    descEn: 'Natural isotonic saline solution. Completely safe for frequent use in all trimesters.',
    naturalAlternativeTr: 'Buhar banyosu, odada soğuk buhar makinesi çalıştırmak, C vitamini zengini ılık ıhlamur.',
    naturalAlternativeEn: 'Steam inhalation, cool mist humidifier, warm herbal tea with lemon.',
  },
  {
    id: 'pseudoephedrine',
    category: 'cold',
    catTr: 'Soğuk Algınlığı & Burun',
    catEn: 'Cold & Sinus',
    nameTr: 'Psödoefedrin (Burun Açıcı Ağız İlaçları)',
    nameEn: 'Pseudoephedrine (Oral Decongestants)',
    tradeNames: 'Sudafed, Theraflu, A-Ferin, Tylolhot',
    safetyTier: 'caution',
    tierLabelTr: '🟡 1. Trimesterde Kesin Kaçınılmalı',
    tierLabelEn: '🟡 Avoid in 1st Trimester',
    descTr: 'Kan damarlarını büzerek plasental kan akımını azaltabilir ve ilk trimesterde karın duvarı defekti (gastroşizis) riskini artırabilir. 2. ve 3. trimesterde sadece doktor reçetesiyle.',
    descEn: 'May cause vasoconstriction and reduced uteroplacental blood flow. Associated with gastroschisis in 1st trimester.',
    naturalAlternativeTr: 'Tuzlu su spreyi ve ılık buhar inhalasyonu tercih edilmelidir.',
    naturalAlternativeEn: 'Use saline nasal wash and warm honey-lemon lozenges instead.',
  },

  // Kabızlık & Bağırsak
  {
    id: 'docusate_lactulose',
    category: 'constipation',
    catTr: 'Kabızlık & Sindirim',
    catEn: 'Constipation & Bowel',
    nameTr: 'Laktuloz & Dokusat Sodyum',
    nameEn: 'Lactulose & Docusate Sodium',
    tradeNames: 'Duphalac, Osmolak, Colace',
    safetyTier: 'safe',
    tierLabelTr: '🟢 Güvenli (Bağırsaktan Emilmez)',
    tierLabelEn: '🟢 Safe (Non-absorbed Osmotic)',
    descTr: 'Bağırsaktan kana emilmeden yalnızca su çekerek dışkıyı yumuşatır. Rahim kasılmalarını tetiklemez.',
    descEn: 'Osmotic stool softeners that stay in the gastrointestinal tract without entering maternal bloodstream.',
    naturalAlternativeTr: 'Günde 2.5-3 litre su, kuru erik kompostosu, zeytinyağlı keten tohumu ve lifli beslenme.',
    naturalAlternativeEn: 'Drinking 2.5-3L water, stewed prunes, ground flaxseed, high-fiber fruits.',
  },

  // Alerji
  {
    id: 'cetirizine_loratadine',
    category: 'allergy',
    catTr: 'Alerji & Kaşıntı',
    catEn: 'Allergy & Itch',
    nameTr: 'Setirizin / Loratadin',
    nameEn: 'Cetirizine / Loratadine',
    tradeNames: 'Zyrtec, Allerset, Claritin',
    safetyTier: 'safe',
    tierLabelTr: '🟢 2. Kuşak Güvenli Antihistaminik',
    tierLabelEn: '🟢 2nd Generation Safe Antihistamine',
    descTr: 'Maternal alerjik rinit ve gebelik kaşıntılarında ACOG tarafından en güvenli kabul edilen 2. nesil antihistaminiklerdir.',
    descEn: 'Second-generation antihistamines with strong safety profile in pregnancy. Minimal sedation.',
    naturalAlternativeTr: 'Hava temizleyici filtreler, dışarıdan gelince kıyafetleri değiştirip yüzü yıkama.',
    naturalAlternativeEn: 'HEPA air purifiers, saline nasal rinses, avoiding outdoor pollen triggers.',
  },
];

export function SafeMedicationScreen({ state, update, toast, close, lang: propLang }) {
  const lang = propLang || state?.lang || 'tr';
  const isEn = lang === 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const categories = [
    { id: 'all', labelTr: 'Tümü', labelEn: 'All' },
    { id: 'pain', labelTr: 'Ağrı & Ateş', labelEn: 'Pain' },
    { id: 'heartburn', labelTr: 'Reflü', labelEn: 'Heartburn' },
    { id: 'nausea', labelTr: 'Bulantı', labelEn: 'Nausea' },
    { id: 'cold', labelTr: 'Grip & Soğuk', labelEn: 'Cold' },
    { id: 'constipation', labelTr: 'Kabızlık', labelEn: 'Bowel' },
    { id: 'allergy', labelTr: 'Alerji', labelEn: 'Allergy' },
  ];

  const filteredMeds = useMemo(() => {
    return MEDICATION_DATABASE.filter(med => {
      const matchesCat = selectedCat === 'all' || med.category === selectedCat;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        med.nameTr.toLowerCase().includes(q) ||
        med.nameEn.toLowerCase().includes(q) ||
        med.tradeNames.toLowerCase().includes(q) ||
        med.catTr.toLowerCase().includes(q) ||
        med.catEn.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [selectedCat, searchQuery]);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHero
        title={isEn ? 'Safe Medication & Symptom Guide' : 'Gebelikte Güvenli İlaç & Belirti Kılavuzu'}
        subtitle={isEn ? 'Evidence-based obstetric safety tiers, alternatives & warnings' : 'Kanıta dayalı klinik güvenlik dereceleri, trimester uyarıları ve doğal çözümler'}
        coverAsset="card_health_report"
      />

      {/* Top Clinical Safety Alert */}
      <View style={styles.medicalDisclaimerCard}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <T style={{ fontSize: 16 }}>⚠️</T>
          <View style={{ flex: 1 }}>
            <T bold style={styles.medicalDisclaimerTitle}>
              {isEn ? 'Strict Clinical Notice & Medical Disclaimer' : 'Tıbbi Güvenlik Uyarısı & Hekim Onayı Şartı'}
            </T>
            <T style={styles.medicalDisclaimerText}>
              {isEn
                ? 'This guide is compiled for educational reference based on FDA and ACOG obstetric tiers. Never take, stop, or alter any medication, supplement, or herbal product during pregnancy or lactation without direct consultation and approval from your obstetrician or pharmacist.'
                : 'Bu rehber FDA, ACOG ve uluslararası perinatoloji kılavuzları baz alınarak genel bilgilendirme amacıyla derlenmiştir. Gebelikte veya emzirme döneminde hekiminize veya eczacınıza danışmadan ASLA hiçbir reçeteli/reçetesiz ilaç, vitamin veya bitkisel takviye kullanmayınız.'}
            </T>
          </View>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Icon name="search" size={18} color="#8A7394" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={isEn ? 'Search drug or symptom (e.g. Parol, Ibuprofen, Reflux)...' : 'İlaç veya belirti ara (Parol, İbuprofen, Reflü)...'}
          placeholderTextColor="#A394A8"
          style={styles.searchInput}
        />
        {searchQuery ? (
          <Tap onPress={() => setSearchQuery('')} style={{ padding: 6 }}>
            <Icon name="close" size={16} color="#8A7394" />
          </Tap>
        ) : null}
      </View>

      {/* Category Filter Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {categories.map(cat => (
          <Tap
            key={cat.id}
            onPress={() => setSelectedCat(cat.id)}
            style={[styles.catPill, selectedCat === cat.id && styles.catPillActive]}
          >
            <T bold={selectedCat === cat.id} style={{ fontSize: 11.5, color: selectedCat === cat.id ? '#FFFFFF' : '#6A5675' }}>
              {isEn ? cat.labelEn : cat.labelTr}
            </T>
          </Tap>
        ))}
      </ScrollView>

      {/* Cards List */}
      <View style={{ gap: 12, marginTop: 4 }}>
        {filteredMeds.length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <T style={{ fontSize: 28 }}>💊</T>
            <T bold style={{ fontSize: 14, color: colors.ink, marginTop: 8 }}>
              {isEn ? 'No medications found' : 'Aramanızla eşleşen ilaç bulunamadı'}
            </T>
            <T style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
              {isEn ? 'Try another search term or consult your doctor.' : 'Farklı bir arama yapabilir veya hekiminize danışabilirsiniz.'}
            </T>
          </Card>
        ) : (
          filteredMeds.map(med => {
            const isSafe = med.safetyTier === 'safe';
            const isAvoid = med.safetyTier === 'avoid';

            return (
              <Card key={med.id} style={[styles.medCard, isAvoid && styles.medCardAvoid]}>
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <T bold style={{ fontSize: 15, color: colors.ink }}>
                        {isEn ? med.nameEn : med.nameTr}
                      </T>
                    </View>
                    <T style={{ fontSize: 11, color: colors.purple, marginTop: 2 }}>
                      {isEn ? `Common Brands: ${med.tradeNames}` : `Piyasa İsimleri: ${med.tradeNames}`}
                    </T>
                  </View>

                  <View style={[styles.tierBadge, isSafe ? styles.tierBadgeSafe : isAvoid ? styles.tierBadgeAvoid : styles.tierBadgeCaution]}>
                    <T bold style={[styles.tierBadgeText, isSafe ? { color: '#027A48' } : isAvoid ? { color: '#B42318' } : { color: '#B54708' }]}>
                      {isEn ? med.tierLabelEn : med.tierLabelTr}
                    </T>
                  </View>
                </View>

                {/* Clinical Explanation */}
                <T style={styles.medDesc}>
                  {isEn ? med.descEn : med.descTr}
                </T>

                {/* Natural Alternative Box */}
                <View style={styles.alternativeBox}>
                  <T bold style={{ fontSize: 11.5, color: '#166534' }}>
                    🌿 {isEn ? 'Natural Non-Drug Alternatives:' : 'İlaçsız Doğal Çözüm:'}
                  </T>
                  <T style={{ fontSize: 11.5, color: '#14532D', marginTop: 2, lineHeight: 16 }}>
                    {isEn ? med.naturalAlternativeEn : med.naturalAlternativeTr}
                  </T>
                </View>
              </Card>
            );
          })
        )}
      </View>

      {/* General Medical Disclaimer */}
      <InfoNote
        title={isEn ? 'Strict Medical Guidance Disclaimer' : 'Önemli Hekim Uyarısı'}
        text={isEn
          ? 'This guide is for informational purposes based on ACOG and FDA guidelines. Never begin, stop, or change any medication without first discussing it with your prescribing obstetrician.'
          : 'Bu rehber bilgilendirme amaçlıdır. Reçeteli veya reçetesiz herhangi bir ilacı kullanmadan veya kesmeden önce mutlaka sizi takip eden kadın doğum hekiminize danışınız.'}
        tone="alert"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  medicalDisclaimerCard: {
    backgroundColor: '#FEF3F2',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FECDCA',
    padding: 12,
  },
  medicalDisclaimerTitle: {
    fontSize: 13,
    color: '#B42318',
    marginBottom: 4,
  },
  medicalDisclaimerText: {
    fontSize: 11.5,
    color: '#7A271A',
    lineHeight: 17,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DFD2E2',
    paddingHorizontal: 14,
    minHeight: 48,
    ...shadow,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 10,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FAF5FA',
    borderWidth: 1,
    borderColor: '#E8DCEB',
  },
  catPillActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  medCard: {
    padding: 16,
    gap: 10,
  },
  medCardAvoid: {
    backgroundColor: '#FFF8F8',
    borderColor: '#FECDCA',
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierBadgeSafe: { backgroundColor: '#ECFDF3' },
  tierBadgeCaution: { backgroundColor: '#FFFAEB' },
  tierBadgeAvoid: { backgroundColor: '#FEF3F2' },
  tierBadgeText: {
    fontSize: 10.5,
  },
  medDesc: {
    fontSize: 12,
    color: '#49364F',
    lineHeight: 17,
  },
  alternativeBox: {
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
});
