import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section, ScreenHero, InfoNote, MetricCard, ToolExperienceCard } from './ui';
import { uid, formatLocalizedDate } from './domain.mjs';

const VACCINE_SCHEDULE = [
  // 0. Ay (Doğumda)
  {
    id: 'hepb_1',
    name: 'Hepatit B (1. Doz)',
    shortName: 'Hep-B 1',
    month: 0,
    monthLabelTr: 'Doğumda',
    monthLabelEn: 'At Birth',
    protectsTr: 'Hepatit B virüsü, karaciğer enfeksiyonu ve siroz',
    protectsEn: 'Hepatitis B virus, liver inflammation & cirrhosis',
    sideEffectsTr: 'Enjeksiyon yerinde hafif hassasiyet, hafif huzursuzluk.',
    sideEffectsEn: 'Mild tenderness at injection site, slight fussiness.',
    careTipsTr: 'Bebeği sık sık emzirin, aşı yerine sert masaj yapmayın.',
    careTipsEn: 'Breastfeed frequently, do not massage injection site.',
    isMandatory: true,
  },
  // 1. Ay
  {
    id: 'hepb_2',
    name: 'Hepatit B (2. Doz)',
    shortName: 'Hep-B 2',
    month: 1,
    monthLabelTr: '1. Ay',
    monthLabelEn: 'Month 1',
    protectsTr: 'Hepatit B virüsüne karşı kalıcı antikor koruması',
    protectsEn: 'Long-term antibody response against Hepatitis B',
    sideEffectsTr: 'Uygulama yerinde hafif kızarıklık, hafif uyku hali.',
    sideEffectsEn: 'Mild redness at site, slight sleepiness.',
    careTipsTr: 'Rahat ve gevşek kıyafetler giydirin.',
    careTipsEn: 'Dress baby in comfortable loose clothes.',
    isMandatory: true,
  },
  // 2. Ay
  {
    id: 'bcg_1',
    name: 'BCG (Verem Aşısı)',
    shortName: 'BCG (Verem)',
    month: 2,
    monthLabelTr: '2. Ay',
    monthLabelEn: 'Month 2',
    protectsTr: 'Tüberküloz (Verem) basilinin yayılmasını önler',
    protectsEn: 'Protects against tuberculosis bacilli',
    sideEffectsTr: 'Sol kolda 2-6 hafta sonra küçük kabuklu sivilce oluşması normaldir, iz bırakabilir.',
    sideEffectsEn: 'A small pimple/crust forms in 2-6 weeks, normal skin reaction.',
    careTipsTr: 'Kabuğu kesinlikle koparmayın, alkol sürmeyin, su değmesinde sakınca yoktur.',
    careTipsEn: 'Do not squeeze or apply alcohol to the crust.',
    isMandatory: true,
  },
  {
    id: 'dabt_1',
    name: "DaBT-İPA-Hib (5'li Karma - 1. Doz)",
    shortName: "5'li Karma 1",
    month: 2,
    monthLabelTr: '2. Ay',
    monthLabelEn: 'Month 2',
    protectsTr: 'Difteri, Boğmaca, Tetanoz, Çocuk Felci ve Menenjit',
    protectsEn: 'Diphtheria, Pertussis, Tetanus, Polio, Hib Meningitis',
    sideEffectsTr: 'Hafif subfebril ateş (37.5-38°C), bacakta hassasiyet, huysuzluk.',
    sideEffectsEn: 'Low-grade fever, leg soreness, irritability.',
    careTipsTr: 'Ateş 38°C üzerine çıkarsa hekiminizin önerdiği dozda ateş düşürücü verin; bol ten teması sağlayın.',
    careTipsEn: 'Monitor temperature, consult pediatrician if above 38°C.',
    isMandatory: true,
  },
  {
    id: 'kpa_1',
    name: 'KPA (Pnömokok / Zatürre - 1. Doz)',
    shortName: 'KPA 1',
    month: 2,
    monthLabelTr: '2. Ay',
    monthLabelEn: 'Month 2',
    protectsTr: 'Pnömokok bakterisinin neden olduğu zatürre ve orta kulak iltihabı',
    protectsEn: 'Streptococcus pneumoniae, pneumonia, otitis media',
    sideEffectsTr: 'İştahsızlık, enjeksiyon yerinde hafif şişlik.',
    sideEffectsEn: 'Temporary low appetite, mild local swelling.',
    careTipsTr: 'Bacağa ılık pansuman yapabilirsiniz, bol emzirin.',
    careTipsEn: 'Warm compress to thigh if recommended, feed frequently.',
    isMandatory: true,
  },
  {
    id: 'rota_1',
    name: 'Rota Virüs (1. Doz - Ağızdan)',
    shortName: 'Rota 1 (Özel)',
    month: 2,
    monthLabelTr: '2. Ay',
    monthLabelEn: 'Month 2',
    protectsTr: 'Ağır ishal ve kusmaya yol açan rota virüs gastroenteriti',
    protectsEn: 'Severe rotavirus diarrhea and dehydration',
    sideEffectsTr: 'Ağızdan damlatılır; nadiren hafif gaz veya gevşek dışkı.',
    sideEffectsEn: 'Given orally; very mild gas or loose stool possible.',
    careTipsTr: 'Aşıdan hemen önce ve sonra 15 dk bebeği beslemeyin (kusmayı önlemek için).',
    careTipsEn: 'Avoid nursing 15 min before and after to prevent spitting.',
    isMandatory: false,
  },
  // 4. Ay
  {
    id: 'dabt_2',
    name: "DaBT-İPA-Hib (5'li Karma - 2. Doz)",
    shortName: "5'li Karma 2",
    month: 4,
    monthLabelTr: '4. Ay',
    monthLabelEn: 'Month 4',
    protectsTr: 'Difteri, Boğmaca, Tetanoz, Polio ve Hib Menenjit',
    protectsEn: 'Diphtheria, Tetanus, Pertussis, Polio, Hib',
    sideEffectsTr: 'Hafif ateş ve huzursuzluk görülebilir.',
    sideEffectsEn: 'Mild fever and restless behavior.',
    careTipsTr: 'Oda sıcaklığını 21-22°C tutun, bebeği kalın giydirmeyin.',
    careTipsEn: 'Keep room temp 21-22°C, do not overdress.',
    isMandatory: true,
  },
  {
    id: 'kpa_2',
    name: 'KPA (Pnömokok - 2. Doz)',
    shortName: 'KPA 2',
    month: 4,
    monthLabelTr: '4. Ay',
    monthLabelEn: 'Month 4',
    protectsTr: 'Zatürre ve menenjit bakterilerine karşı pekiştirme',
    protectsEn: 'Booster against pneumococcal infections',
    sideEffectsTr: 'Hafif şişlik ve hassasiyet.',
    sideEffectsEn: 'Mild leg tenderness.',
    careTipsTr: 'Kucağınızda dinlendirin, sakinleştirici beyaz gürültü açabilirsiniz.',
    careTipsEn: 'Offer gentle contact naps and calming white noise.',
    isMandatory: true,
  },
  {
    id: 'rota_2',
    name: 'Rota Virüs (2. Doz)',
    shortName: 'Rota 2 (Özel)',
    month: 4,
    monthLabelTr: '4. Ay',
    monthLabelEn: 'Month 4',
    protectsTr: 'Ağır rota ishaline karşı tam koruyucu antikor kalkanı',
    protectsEn: 'Protective immunity against rotavirus diarrhea',
    sideEffectsTr: 'Ağızdan verilir, genellikle yan etki yapmaz.',
    sideEffectsEn: 'Oral drop; well tolerated with negligible symptoms.',
    careTipsTr: 'Aşı sonrası bezi hijyenik şekilde kapatıp çöpe atın, elleri yıkayın.',
    careTipsEn: 'Wash hands thoroughly after diaper changes.',
    isMandatory: false,
  },
  // 6. Ay
  {
    id: 'dabt_3',
    name: "DaBT-İPA-Hib (5'li Karma - 3. Doz)",
    shortName: "5'li Karma 3",
    month: 6,
    monthLabelTr: '6. Ay',
    monthLabelEn: 'Month 6',
    protectsTr: 'Bebeklik dönemi karma aşı serisinin tamamlanması',
    protectsEn: 'Completion of primary infant 5-in-1 combo series',
    sideEffectsTr: 'Aşı yerinde sertlik veya kızarıklık, hafif ateş.',
    sideEffectsEn: 'Injection site firmness, low fever.',
    careTipsTr: 'Ek gıdaya yeni başlanıyorsa o gün yeni tadım denemeyin.',
    careTipsEn: 'Avoid introducing new solid foods on vaccine day.',
    isMandatory: true,
  },
  {
    id: 'kpa_3',
    name: 'KPA (Pnömokok - 3. Doz)',
    shortName: 'KPA 3',
    month: 6,
    monthLabelTr: '6. Ay',
    monthLabelEn: 'Month 6',
    protectsTr: 'Zatürre bakterilerine karşı 1 yaşına kadar güçlü kalkan',
    protectsEn: 'Robust pneumonia protection through first year',
    sideEffectsTr: 'Hafif uyku hali veya huzursuzluk.',
    sideEffectsEn: 'Mild sleepiness or fussiness.',
    careTipsTr: 'Bol sıvı ve anne sütü/formül süt verin.',
    careTipsEn: 'Ensure adequate hydration and breastmilk/formula.',
    isMandatory: true,
  },
  {
    id: 'hepb_3',
    name: 'Hepatit B (3. Doz)',
    shortName: 'Hep-B 3',
    month: 6,
    monthLabelTr: '6. Ay',
    monthLabelEn: 'Month 6',
    protectsTr: 'Hepatit B serisinin ömür boyu kalıcı bağışıklık dozu',
    protectsEn: 'Final dose for lifelong Hepatitis B immunity',
    sideEffectsTr: 'Çok nadiren bacakta hafif hassasiyet.',
    sideEffectsEn: 'Rarely mild tenderness at injection site.',
    careTipsTr: 'Rutin banyo yaptırabilirsiniz.',
    careTipsEn: 'Routine warm bath is gentle and safe.',
    isMandatory: true,
  },
  {
    id: 'opa_1',
    name: 'OPA (Canlı Oral Polio / Çocuk Felci Damlası - 1)',
    shortName: 'OPA 1 (Ağızdan)',
    month: 6,
    monthLabelTr: '6. Ay',
    monthLabelEn: 'Month 6',
    protectsTr: 'Bağırsak florasında çocuk felci virüsünün çoğalmasını engeller',
    protectsEn: 'Oral polio vaccine for gut mucosal immunity',
    sideEffectsTr: 'Ağızdan 2 damla verilir; iğnesizdir, yan etki beklenmez.',
    sideEffectsEn: '2 oral drops; completely painless, no fever expected.',
    careTipsTr: 'Damla yutulur yutulmaz kusarsa hekime danışarak tekrarlanabilir.',
    careTipsEn: 'If baby spits up immediately, nurse may readminister.',
    isMandatory: true,
  },
  // 9. Ay
  {
    id: 'kkk_special',
    name: 'KKK (Özel Erken Doz - Salgın Dönemleri)',
    shortName: 'KKK (Erken Doz)',
    month: 9,
    monthLabelTr: '9. Ay',
    monthLabelEn: 'Month 9',
    protectsTr: 'Bakanlık kararıyla kızamık salgını riskinde erken koruma',
    protectsEn: 'Early measles surge outbreak protection',
    sideEffectsTr: '5-12 gün sonra hafif döküntü veya hafif ateş olabilir.',
    sideEffectsEn: 'Mild rash or low fever 5-12 days post-vaccine.',
    careTipsTr: 'Gecikmiş ateş durumunda panik yapmayın, hekime danışın.',
    careTipsEn: 'Late low fever is normal; consult doctor if above 38.5°C.',
    isMandatory: false,
  },
  // 12. Ay (1 Yaş)
  {
    id: 'kkk_1',
    name: 'KKK (Kızamık, Kızamıkçık, Kabakulak - 1. Doz)',
    shortName: 'KKK 1 (1 Yaş)',
    month: 12,
    monthLabelTr: '12. Ay',
    monthLabelEn: 'Month 12',
    protectsTr: 'Kızamık, Kızamıkçık ve Kabakulak virüslerine karşı ömür boyu kalkan',
    protectsEn: 'Measles, Mumps, Rubella lifelong antibody foundation',
    sideEffectsTr: 'Aşıdan 7-10 gün sonra hafif döküntü ve hafif ateş görülebilir.',
    sideEffectsEn: 'Mild rash/fever possible 7-10 days post injection.',
    careTipsTr: 'Geç başlayan ateşte ılık duş ve bol sıvı desteği sağlayın.',
    careTipsEn: 'Offer fluids and lukewarm comfort if late fever occurs.',
    isMandatory: true,
  },
  {
    id: 'kpa_rapel',
    name: 'KPA (Pnömokok Rapel - Pekiştirme)',
    shortName: 'KPA Rapel',
    month: 12,
    monthLabelTr: '12. Ay',
    monthLabelEn: 'Month 12',
    protectsTr: 'Zatürre korumasının çocukluk çağı boyunca pekiştirilmesi',
    protectsEn: 'Pneumococcal toddler booster',
    sideEffectsTr: 'Hafif iştahsızlık veya enjeksiyon yerinde kızarıklık.',
    sideEffectsEn: 'Mild redness or slight decrease in appetite.',
    careTipsTr: 'Bebeği sevdiği hafif gıdalarla besleyin.',
    careTipsEn: 'Offer favorite comforting toddler snacks and water.',
    isMandatory: true,
  },
  {
    id: 'sucicegi_1',
    name: 'Suçiçeği Aşısı (Varisella - 1. Doz)',
    shortName: 'Suçiçeği 1',
    month: 12,
    monthLabelTr: '12. Ay',
    monthLabelEn: 'Month 12',
    protectsTr: 'Suçiçeği virüsü ve olası cilt enfeksiyonu komplikasyonları',
    protectsEn: 'Varicella zoster virus & chickenpox blisters',
    sideEffectsTr: 'Aşı yerinde hassasiyet, 1-2 hafta sonra hafif döküntü.',
    sideEffectsEn: 'Local tenderness, very few mild spots 1-2 weeks later.',
    careTipsTr: 'Cildi nemlendirin, tırnaklarını kısa kesin.',
    careTipsEn: 'Keep nails trimmed to prevent scratching.',
    isMandatory: true,
  },
  // 18. Ay (1.5 Yaş)
  {
    id: 'dabt_rapel',
    name: "DaBT-İPA-Hib (5'li Karma Rapel)",
    shortName: "5'li Karma Rapel",
    month: 18,
    monthLabelTr: '18. Ay',
    monthLabelEn: 'Month 18',
    protectsTr: 'Okul öncesi döneme kadar tam karma koruma',
    protectsEn: 'Preschool 5-in-1 combo booster',
    sideEffectsTr: 'Kolda/bacakta ağrı, 1 gün sürebilen hafif ateş.',
    sideEffectsEn: 'Limb ache, low fever lasting up to 24 hours.',
    careTipsTr: 'Hareketi kısıtlamayın, oyunla sakinleştirin.',
    careTipsEn: 'Encourage gentle movement and calming play.',
    isMandatory: true,
  },
  {
    id: 'opa_2',
    name: 'OPA (Canlı Oral Polio - 2. Doz)',
    shortName: 'OPA 2 (Ağızdan)',
    month: 18,
    monthLabelTr: '18. Ay',
    monthLabelEn: 'Month 18',
    protectsTr: 'Çocuk felcine karşı toplum ve bireysel tam bağışıklık',
    protectsEn: 'Community and mucosal polio immunity booster',
    sideEffectsTr: 'Ağızdan verilir, yan etki beklenmez.',
    sideEffectsEn: 'Oral drop, no significant symptoms.',
    careTipsTr: 'Damla sonrası rahatça su ve yemek verebilirsiniz.',
    careTipsEn: 'Normal toddler routine can continue immediately.',
    isMandatory: true,
  },
  {
    id: 'hepa_1',
    name: 'Hepatit A (1. Doz)',
    shortName: 'Hep-A 1',
    month: 18,
    monthLabelTr: '18. Ay',
    monthLabelEn: 'Month 18',
    protectsTr: 'Besin ve su yoluyla bulaşan Hepatit A (Bulaşıcı Sarılık)',
    protectsEn: 'Infectious Hepatitis A jaundice transmitted via food/water',
    sideEffectsTr: 'Enjeksiyon yerinde hafif ağrı.',
    sideEffectsEn: 'Mild tenderness at injection site.',
    careTipsTr: 'Aşı yerine soğuk/ılık temiz bez koyabilirsiniz.',
    careTipsEn: 'Cool gentle compress to the site if sore.',
    isMandatory: true,
  },
  // 24. Ay (2 Yaş)
  {
    id: 'hepa_2',
    name: 'Hepatit A (2. Doz - Pekiştirme)',
    shortName: 'Hep-A 2 (2 Yaş)',
    month: 24,
    monthLabelTr: '24. Ay',
    monthLabelEn: 'Month 24',
    protectsTr: 'Hepatit A sarılığına karşı ömür boyu kalıcı koruma',
    protectsEn: 'Lifelong protection against Hepatitis A',
    sideEffectsTr: 'Genellikle sorunsuz tolere edilir.',
    sideEffectsEn: 'Generally very well tolerated.',
    careTipsTr: 'Bebeklik takvimi başarıyla tamamlanmıştır! Tebrikler!',
    careTipsEn: 'Toddler immunization schedule complete! Congratulations!',
    isMandatory: true,
  }
];

export function VaccineCalendarScreen({ state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const babyName = state?.babyName || (isEn ? 'Baby' : 'Bebeğim');

  // Completed vaccines stored in state.babyVaccines = { [id]: { done: true, date: '...', note: '...' } }
  const vaccineData = state?.babyVaccines || {};

  const [filterMonth, setFilterMonth] = useState('all'); // 'all' | '0-2' | '4-6' | '9-12' | '18-24'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'done'
  const [expandedId, setExpandedId] = useState(null);
  const [showFeverGuide, setShowFeverGuide] = useState(false);

  // Note editing state for expanded vaccine
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');

  // Total completion calculation
  const totalCount = VACCINE_SCHEDULE.length;
  const doneCount = useMemo(() => {
    return VACCINE_SCHEDULE.filter(v => vaccineData[v.id]?.done).length;
  }, [vaccineData]);
  const progressPercent = Math.round((doneCount / totalCount) * 100);

  function toggleVaccine(vId) {
    const current = vaccineData[vId];
    const isNowDone = !current?.done;
    const todayStr = new Date().toISOString().slice(0, 10);

    const updated = {
      ...vaccineData,
      [vId]: {
        done: isNowDone,
        date: isNowDone ? (current?.date || todayStr) : null,
        note: current?.note || ''
      }
    };

    update({ babyVaccines: updated });
    toast && toast(isNowDone 
      ? (isEn ? 'Vaccine marked as completed! 💉✨' : 'Aşı yapıldı olarak kaydedildi! 💉✨')
      : (isEn ? 'Vaccine status reset' : 'Aşı durumu geri alındı')
    );
  }

  function saveNote(vId) {
    const current = vaccineData[vId] || {};
    const updated = {
      ...vaccineData,
      [vId]: {
        ...current,
        note: noteText.trim()
      }
    };
    update({ babyVaccines: updated });
    setEditingNoteId(null);
    setNoteText('');
    toast && toast(isEn ? 'Clinical note saved' : 'Klinik not kaydedildi');
  }

  // Filtered list
  const filteredVaccines = useMemo(() => {
    return VACCINE_SCHEDULE.filter(v => {
      // Month range filter
      if (filterMonth === '0-2' && v.month > 2) return false;
      if (filterMonth === '4-6' && (v.month < 4 || v.month > 6)) return false;
      if (filterMonth === '9-12' && (v.month < 9 || v.month > 12)) return false;
      if (filterMonth === '18-24' && v.month < 18) return false;

      // Status filter
      const isDone = !!vaccineData[v.id]?.done;
      if (filterStatus === 'pending' && isDone) return false;
      if (filterStatus === 'done' && !isDone) return false;

      return true;
    });
  }, [filterMonth, filterStatus, vaccineData]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* Hero Banner */}
      <ScreenHero
        kicker={isEn ? 'PEDIATRIC IMMUNIZATION PROTOCOL' : 'PEDİATRİK BAĞIŞIKLAMA PROTOKOLÜ'}
        title={isEn ? 'Baby Vaccine Calendar' : 'Aşı & Bağışıklık Takvimi'}
        body={isEn
          ? '0–24 month Ministry of Health & WHO vaccine schedule, side-effect care guides, and dose tracking for ' + babyName + '.'
          : 'Sağlık Bakanlığı 0–24 ay aşı takvimi, ateş ve aşı sonrası bakım rehberleri ve ' + babyName + ' için doz takip paneli.'}
        icon="shield"
        art="card_vaccine_calendar"
        stat={`${doneCount} / ${totalCount}`}
        tint="#2B7CB0"
      />

      {/* Progress & Fever Guide Shortcut */}
      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View>
            <T bold style={styles.progressTitle}>
              {isEn ? `${babyName}'s Immunity Foundation` : `${babyName}'in Bağışıklık Kalkanı`}
            </T>
            <T style={styles.progressSub}>
              {doneCount} / {totalCount} {isEn ? 'doses completed' : 'aşı tamamlandı'} (%{progressPercent})
            </T>
          </View>
          <Tap onPress={() => setShowFeverGuide(!showFeverGuide)} style={styles.feverBtn}>
            <Icon name="thermometer" size={15} color="#C4485D" />
            <T bold style={styles.feverBtnText}>{isEn ? 'Fever Guide' : 'Ateş Rehberi'}</T>
          </Tap>
        </View>

        {/* Visual Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </Card>

      {/* Expandable Fever & Post-Vaccine Care Guide */}
      {showFeverGuide && (
        <Card style={styles.feverGuideCard}>
          <View style={styles.feverGuideHeader}>
            <Icon name="thermometer" size={18} color="#C4485D" />
            <T bold style={styles.feverGuideTitle}>
              {isEn ? 'Pediatric Post-Vaccine Fever Care' : 'Aşı Sonrası Ateş & Huzursuzluk Yönetimi'}
            </T>
          </View>

          <View style={styles.feverGuideItem}>
            <T bold style={styles.feverPointTitle}>🌡️ {isEn ? 'Fever Thresholds' : 'Ateş Eşikleri & Beklenen Seyir'}</T>
            <T style={styles.feverPointText}>
              {isEn
                ? 'Subfebrile temperature (37.5 - 38°C) is a normal immune response showing the vaccine is working. Measure with a reliable digital axillary or rectal thermometer.'
                : '37.5 - 38.0°C arası hafif ateş aşının bağışıklık sistemini çalıştırdığını gösteren doğal bir yanıttır. Koltuk altından dijital termometreyle takip edin.'}
            </T>
          </View>

          <View style={styles.feverGuideItem}>
            <T bold style={styles.feverPointTitle}>💧 {isEn ? 'Home Comfort Measures' : 'Evde Şefkatli Bakım ve Rahatlatma'}</T>
            <T style={styles.feverPointText}>
              {isEn
                ? 'Dress baby in light single-layer cotton clothes. Keep room at 21-22°C. Offer frequent breastmilk/hydration. Never use ice or cold alcohol compresses.'
                : 'Bebeğin üzerindeki kalın katmanları çıkarın, pamuklu tek kat giydirin. Oda sıcaklığını 21-22°C tutun. Bol anne sütü verin. Kesinlikle buz, sirke veya alkollü bez sürmeyin; yalnızca ılık ıslak bezle alın/koltuk altı kompresi yapın.'}
            </T>
          </View>

          <View style={styles.feverGuideItem}>
            <T bold style={styles.feverPointTitle}>💊 {isEn ? 'Medication Protocol' : 'İlaç & Parasetamol Kullanımı'}</T>
            <T style={styles.feverPointText}>
              {isEn
                ? 'Only administer pediatrician-approved paracetamol drops if fever exceeds 38°C or baby is in noticeable distress. Never give aspirin or unauthorized adult meds.'
                : 'Yalnızca ateş 38.0°C üzerine çıkarsa veya bebek çok huzursuzsa hekiminizin bebeğin kilosuna göre belirlediği parasetamol damlayı verin. Önceden koruyucu olarak ateş düşürücü vermek aşının etkinliğini azaltabilir.'}
            </T>
          </View>

          <View style={styles.feverGuideAlert}>
            <T bold style={{ color: '#A1283C', fontSize: 12.5 }}>
              🚨 {isEn ? 'When to Call Your Doctor Immediately:' : 'Ne Zaman Acil Hekime Başvurulmalı?'}
            </T>
            <T style={{ color: '#882232', fontSize: 12, lineHeight: 17, marginTop: 4 }}>
              {isEn
                ? 'Fever above 38.5°C persisting over 48 hours, inconsolable high-pitched crying for 3+ hours, difficulty breathing, or allergic facial hives.'
                : '48 saatten uzun süren dirençli 38.5°C üzeri ateş, 3 saatten uzun süren susturulamayan tiz ağlama, nefes almada zorluk veya yüzde yaygın alerjik döküntü durumunda derhal hekiminize başvurun.'}
            </T>
          </View>
        </Card>
      )}

      {/* Age Group Filters */}
      <View style={styles.filterChipsRow}>
        {[
          { id: 'all', label: isEn ? 'All Months' : 'Tümü' },
          { id: '0-2', label: '0–2 Ay' },
          { id: '4-6', label: '4–6 Ay' },
          { id: '9-12', label: '9–12 Ay' },
          { id: '18-24', label: '18–24 Ay' },
        ].map(chip => (
          <Tap
            key={chip.id}
            onPress={() => setFilterMonth(chip.id)}
            style={[styles.filterChip, filterMonth === chip.id && styles.filterChipActive]}
          >
            <T bold={filterMonth === chip.id} style={[styles.filterChipText, filterMonth === chip.id && styles.filterChipTextActive]}>
              {chip.label}
            </T>
          </Tap>
        ))}
      </View>

      {/* Status Filter (All / Pending / Done) */}
      <View style={styles.statusChipsRow}>
        {[
          { id: 'all', label: isEn ? 'All Doses' : 'Tüm Dozlar' },
          { id: 'pending', label: isEn ? 'Pending Only' : 'Bekleyenler' },
          { id: 'done', label: isEn ? 'Completed' : 'Tamamlananlar' },
        ].map(s => (
          <Tap
            key={s.id}
            onPress={() => setFilterStatus(s.id)}
            style={[styles.statusChip, filterStatus === s.id && styles.statusChipActive]}
          >
            <T bold={filterStatus === s.id} style={[styles.statusChipText, filterStatus === s.id && styles.statusChipTextActive]}>
              {s.label}
            </T>
          </Tap>
        ))}
      </View>

      {/* Vaccine Schedule List */}
      <View style={styles.vaccineList}>
        {filteredVaccines.map(v => {
          const isDone = !!vaccineData[v.id]?.done;
          const isExpanded = expandedId === v.id;
          const userDate = vaccineData[v.id]?.date;
          const userNote = vaccineData[v.id]?.note;

          return (
            <Card key={v.id} style={[styles.vaccineCard, isDone && styles.vaccineCardDone]}>
              {/* Card Header Row */}
              <View style={styles.vaccineHeader}>
                <Tap onPress={() => toggleVaccine(v.id)} style={[styles.checkCircle, isDone && styles.checkCircleDone]}>
                  {isDone && <Icon name="check" size={14} color="#FFFFFF" />}
                </Tap>

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <T bold style={[styles.vaccineName, isDone && styles.vaccineNameDone]}>
                      {v.name}
                    </T>
                    <View style={styles.monthBadge}>
                      <T bold style={styles.monthBadgeText}>{isEn ? v.monthLabelEn : v.monthLabelTr}</T>
                    </View>
                    {!v.isMandatory && (
                      <View style={[styles.monthBadge, { backgroundColor: '#FDF2F4' }]}>
                        <T bold style={[styles.monthBadgeText, { color: '#C24D64' }]}>{isEn ? 'Optional' : 'Özel Aşı'}</T>
                      </View>
                    )}
                  </View>

                  <T style={styles.protectsText}>
                    🛡️ {isEn ? v.protectsEn : v.protectsTr}
                  </T>
                </View>
              </View>

              {/* Completion date indicator if done */}
              {isDone && userDate && (
                <View style={styles.doneMetaRow}>
                  <Icon name="check" size={12} color="#2A7B5E" />
                  <T style={styles.doneMetaText}>
                    {isEn ? `Administered on ${formatLocalizedDate(userDate, lang)}` : `${formatLocalizedDate(userDate, lang)} tarihinde uygulandı`}
                  </T>
                </View>
              )}

              {/* Stored Note if available */}
              {userNote ? (
                <View style={styles.userNoteBox}>
                  <T style={styles.userNoteText}>📝 \"{userNote}\"</T>
                </View>
              ) : null}

              {/* Expandable Accordion: Side Effects & Care Guide */}
              {isExpanded && (
                <View style={styles.expandedDetails}>
                  <View style={styles.detailRow}>
                    <T bold style={styles.detailLabel}>⚡ {isEn ? 'Common Side Effects:' : 'Olası Yan Etkiler:'}</T>
                    <T style={styles.detailText}>{isEn ? v.sideEffectsEn : v.sideEffectsTr}</T>
                  </View>

                  <View style={styles.detailRow}>
                    <T bold style={styles.detailLabel}>🌸 {isEn ? 'Care & Comfort Tips:' : 'Şefkatli Bakım Notu:'}</T>
                    <T style={styles.detailText}>{isEn ? v.careTipsEn : v.careTipsTr}</T>
                  </View>

                  {/* Note Editing Field */}
                  {editingNoteId === v.id ? (
                    <View style={styles.editNoteBox}>
                      <TextInput
                        value={noteText}
                        onChangeText={setNoteText}
                        placeholder={isEn ? 'e.g. Health center, right thigh, mild evening fussiness...' : 'Örn: 2 No Sağlık Ocağı, sağ bacak, hafif huzursuzluk oldu...'}
                        placeholderTextColor="#A394A8"
                        style={styles.noteInput}
                      />
                      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
                        <Tap onPress={() => setEditingNoteId(null)} style={styles.noteCancelBtn}>
                          <T style={{ fontSize: 12, color: '#7E6B86' }}>{isEn ? 'Cancel' : 'Vazgeç'}</T>
                        </Tap>
                        <Tap onPress={() => saveNote(v.id)} style={styles.noteSaveBtn}>
                          <T bold style={{ fontSize: 12, color: '#FFFFFF' }}>{isEn ? 'Save' : 'Kaydet'}</T>
                        </Tap>
                      </View>
                    </View>
                  ) : (
                    <Tap onPress={() => { setEditingNoteId(v.id); setNoteText(userNote || ''); }} style={styles.addNoteLink}>
                      <Icon name="plus" size={13} color="#2B7CB0" />
                      <T bold style={{ fontSize: 12, color: '#2B7CB0' }}>
                        {userNote ? (isEn ? 'Edit note' : 'Notu düzenle') : (isEn ? 'Add clinic note' : 'Klinik notu ekle')}
                      </T>
                    </Tap>
                  )}
                </View>
              )}

              {/* Toggle Expand Button */}
              <Tap onPress={() => setExpandedId(isExpanded ? null : v.id)} style={styles.expandToggle}>
                <T style={styles.expandToggleText}>
                  {isExpanded ? (isEn ? 'Hide guidance' : 'Detayları gizle') : (isEn ? 'View side-effects & tips' : 'Yan etki & bakım rehberini gör')}
                </T>
                <Icon name={isExpanded ? 'chevronUp' : 'chevron'} size={14} color="#6F587B" />
              </Tap>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 16,
  },
  progressCard: {
    backgroundColor: '#F3F9FD',
    borderColor: '#D8ECF7',
    padding: 16,
    borderRadius: 18,
    gap: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTitle: {
    fontSize: 15.5,
    color: '#1E4C6D',
  },
  progressSub: {
    fontSize: 12.5,
    color: '#4B7B9E',
    marginTop: 2,
  },
  feverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FDEEF1',
    borderWidth: 1,
    borderColor: '#F7CBD3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  feverBtnText: {
    fontSize: 12,
    color: '#C4485D',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#D6EAF5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2B7CB0',
    borderRadius: 4,
  },
  feverGuideCard: {
    backgroundColor: '#FFF8F9',
    borderColor: '#F6D2D9',
    padding: 16,
    borderRadius: 18,
    gap: 12,
  },
  feverGuideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feverGuideTitle: {
    fontSize: 14.5,
    color: '#9E2D43',
  },
  feverGuideItem: {
    gap: 3,
  },
  feverPointTitle: {
    fontSize: 13,
    color: '#4A232B',
  },
  feverPointText: {
    fontSize: 12.5,
    color: '#6A414A',
    lineHeight: 18,
  },
  feverGuideAlert: {
    backgroundColor: '#FDE8EC',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#C4485D',
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F4EEF7',
  },
  filterChipActive: {
    backgroundColor: '#2B7CB0',
  },
  filterChipText: {
    fontSize: 12.5,
    color: '#6F597A',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  statusChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FAF5FA',
    borderWidth: 1,
    borderColor: '#ECE0EE',
  },
  statusChipActive: {
    backgroundColor: '#E7F2F9',
    borderColor: '#2B7CB0',
  },
  statusChipText: {
    fontSize: 11.5,
    color: '#846D8E',
  },
  statusChipTextActive: {
    color: '#2B7CB0',
  },
  vaccineList: {
    gap: 12,
  },
  vaccineCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ECE1EF',
    padding: 14,
    borderRadius: 16,
    gap: 10,
  },
  vaccineCardDone: {
    backgroundColor: '#FBFDFB',
    borderColor: '#D7EBDC',
  },
  vaccineHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#B3A1BA',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkCircleDone: {
    backgroundColor: '#359668',
    borderColor: '#359668',
  },
  vaccineName: {
    fontSize: 14.5,
    color: '#382046',
  },
  vaccineNameDone: {
    color: '#25543D',
  },
  monthBadge: {
    backgroundColor: '#EEF6FB',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  monthBadgeText: {
    fontSize: 11,
    color: '#2B7CB0',
  },
  protectsText: {
    fontSize: 12,
    color: '#7C6785',
    marginTop: 4,
    lineHeight: 17,
  },
  doneMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF7F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  doneMetaText: {
    fontSize: 11.5,
    color: '#256D48',
  },
  userNoteBox: {
    backgroundColor: '#FAF7FA',
    padding: 8,
    borderRadius: 8,
  },
  userNoteText: {
    fontSize: 12,
    color: '#553E61',
    fontStyle: 'italic',
  },
  expandedDetails: {
    backgroundColor: '#F8F4FA',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginTop: 2,
  },
  detailRow: {
    gap: 2,
  },
  detailLabel: {
    fontSize: 12,
    color: '#523862',
  },
  detailText: {
    fontSize: 12,
    color: '#6A5379',
    lineHeight: 17,
  },
  editNoteBox: {
    marginTop: 6,
  },
  noteInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFD0E2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: '#2E1E38',
  },
  noteCancelBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  noteSaveBtn: {
    backgroundColor: '#2B7CB0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  addNoteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F5EFF7',
  },
  expandToggleText: {
    fontSize: 12,
    color: '#7F678C',
  },
});
