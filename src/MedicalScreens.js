import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadow } from './theme';
import { Icon, FruitArt, ComparisonArt } from './Icons';
import { T, Tap, Card, Section, ScreenHero, ToolExperienceCard } from './ui';
import { getWeekInfo, formatLength, formatWeight, trimesterLabel } from './weekData';
import { generatedAssets } from './generatedAssets';
import { usePulse } from './anim';

// ─── EKRAN 10: 3'LÜ BOYUT KIYASLAMA REHBERİ (SIZE GUIDE HUB) ─────────────────
export function SizeComparisonHub({ state, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [week, setWeek] = useState(state.week || 24);
  const [mode, setMode] = useState('fruit'); // 'fruit' | 'animal' | 'sweet'
  const info = getWeekInfo(week, lang);

  return (
    <View style={ms.container}>
      <ScreenHero
        kicker={isEn ? 'WEEK-BY-WEEK SIZE' : 'HAFTA HAFTA BOYUT'}
        title={isEn ? "Feel your baby's scale" : "Bebeğinin ölçeğini hisset"}
        body={isEn ? "See the same week warmly and memorably through fruit, animal, or sweet metaphors." : "Meyve, hayvan veya tatlı metaforuyla aynı haftayı daha sıcak ve akılda kalıcı gör."}
        icon="melon"
        asset="sweet_macaron"
        tint="#7B4C80"
      />
      <ToolExperienceCard lang={lang} title={isEn ? 'Make growth tangible' : 'Boyutu üç farklı dille anlat'} steps={isEn ? ['Switch between fruit, animal, and sweet comparisons.', 'Move week by week.', 'Open the weekly detail when curious.'] : ['Meyve, hayvan ve tatlı kıyasını değiştir.', 'Hafta hafta ilerle.', 'Merak ettiğinde hafta detayını aç.']} outcome={isEn ? 'Growth feels visual and memorable.' : 'Gelişim görsel ve akılda kalıcı hale gelir.'} asset="fruit_apple" tint="#7B4C80" />

      {/* 4'lü Segment Seçici */}
      <View style={ms.segRow}>
        {[
          { id: 'fruit', label: isEn ? '🍏 Fruit' : '🍏 Meyve', sub: isEn ? 'Classic' : 'Klasik' },
          { id: 'ultrasound', label: isEn ? '🩺 Ultrasound' : '🩺 Ultrason', sub: isEn ? 'Medical' : 'Medikal' },
          { id: 'animal', label: isEn ? '🧸 Animal' : '🧸 Hayvan', sub: isEn ? 'Nature' : 'Doğa' },
          { id: 'sweet', label: isEn ? '🧁 Sweet' : '🧁 Tatlı', sub: isEn ? 'Delight' : 'Keyif' },
        ].map(s => (
          <Tap
            key={s.id}
            label={s.label}
            onPress={() => setMode(s.id)}
            style={[ms.segBtn, mode === s.id && ms.segBtnActive]}
          >
            <T bold={mode === s.id} style={[ms.segText, mode === s.id && { color: 'white' }]}>
              {s.label}
            </T>
          </Tap>
        ))}
      </View>

      {/* Ana Boyut Kartı */}
      <Card style={ms.heroCard}>
        <LinearGradient
          colors={['#F7EFF5', '#FDF8F5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={ms.heroMeta}>
          <T bold style={{ fontSize: 13, color: colors.purple }}>
            {week}. {isEn ? 'WEEK' : 'HAFTA'} · {trimesterLabel(info.trimester, lang).toLocaleUpperCase(isEn ? 'en' : 'tr')}
          </T>
          <T style={{ fontSize: 11, color: colors.muted }}>
            {isEn ? "Baby's Size Comparison" : "Bebeğin Boyut Eşleşmesi"}
          </T>
        </View>

        {/* Görsel Sahne */}
        <View style={ms.stage}>
          {mode === 'fruit' ? (
            <FruitArt type={info.fruit} size={150} />
          ) : mode === 'ultrasound' ? (
            <ComparisonArt mode="ultrasound" size={150} week={week} info={info} />
          ) : (
            <ComparisonArt
              mode={mode}
              type={mode === 'animal' ? info.animal : info.sweet}
              size={130}
              emoji={mode === 'animal' ? (info.animalEmoji || '🐾') : (info.sweetEmoji || '🧁')}
              info={info}
              week={week}
            />
          )}

          <T bold style={ms.stageTitle}>
            {mode === 'fruit'
              ? `${info.fruitName}`
              : mode === 'animal'
              ? `${info.animalName}`
              : mode === 'ultrasound'
              ? (info.ultrasound?.scan || (isEn ? 'Ultrasound Anatomy' : 'Ultrason Anatomisi'))
              : `${info.sweetName}`}
          </T>
          <T style={ms.stageSub}>{mode === 'ultrasound' ? (info.ultrasound?.badge || (isEn ? 'Growth scan' : 'Gelişim taraması')) : (isEn ? 'in size' : 'büyüklüğünde')}</T>
        </View>

        {/* Boy & Ağırlık Şeridi */}
        <View style={ms.metricsRow}>
          <View style={ms.metricItem}>
            <Icon name="ruler" size={16} color={colors.purple} />
            <View>
              <T style={ms.metricLabel}>{isEn ? 'Approx. Length' : 'Yaklaşık Boy'}</T>
              <T bold style={ms.metricVal}>{formatLength(info.lengthCm)}</T>
            </View>
          </View>
          <View style={ms.metricDivider} />
          <View style={ms.metricItem}>
            <Icon name="scale" size={16} color={colors.purple} />
            <View>
              <T style={ms.metricLabel}>{isEn ? 'Approx. Weight' : 'Yaklaşık Ağırlık'}</T>
              <T bold style={ms.metricVal}>{formatWeight(info.weightG)}</T>
            </View>
          </View>
        </View>
      </Card>

      {/* Hafta Seçici Şerit */}
      <Section title={isEn ? 'Change Week' : 'Haftayı Değiştir'} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
        {Array.from({ length: 37 }, (_, i) => i + 4).map(w => (
          <Tap
            key={w}
            label={isEn ? `Week ${w}` : `${w}. Hafta`}
            onPress={() => setWeek(w)}
            style={[ms.weekPill, week === w && ms.weekPillActive]}
          >
            <T bold={week === w} style={{ fontSize: 13, color: week === w ? 'white' : colors.ink }}>
              {w}
            </T>
            <T style={{ fontSize: 9, color: week === w ? '#EDE0EF' : colors.muted }}>{isEn ? 'wk' : 'hf'}</T>
          </Tap>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── EKRAN 11: 2D & 3D ULTRASON GALERİSİ (ULTRASOUND ATLAS) ─────────────────
export function UltrasoundAtlas({ state, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [tab, setTab] = useState('3d');
  const [activeMarker, setActiveMarker] = useState(null);
  const week = state.week || 20;
  const info = getWeekInfo(week, lang);
  const pulse = usePulse(0.95, 1.05, 1600);

  const markers = isEn ? [
    { id: 'spine', label: 'Spine Line', x: '46%', y: '38%', desc: 'Spinal bones and neural line are continuously closed.' },
    { id: 'heart', label: '4-Chamber Heart', x: '52%', y: '52%', desc: 'Heart chambers and valves pump blood rhythmically.' },
    { id: 'profile', label: 'Facial Profile & Nose', x: '35%', y: '28%', desc: 'Nasal bone, lips, and eye sockets are clearly visible.' },
  ] : [
    { id: 'spine', label: 'Omurga Hattı', x: '46%', y: '38%', desc: 'Omurga kemikleri ve nöral hat kesintisiz kapanmıştır.' },
    { id: 'heart', label: '4 Odacıklı Kalp', x: '52%', y: '52%', desc: 'Kalp odacıkları ve kapakçıklar ritmik kan pompalar.' },
    { id: 'profile', label: 'Yüz Profili & Burun', x: '35%', y: '28%', desc: 'Burun kemiği, dudaklar ve göz çukurları seçilir.' },
  ];

  return (
    <View style={ms.container}>
      <ScreenHero
        kicker={isEn ? 'ULTRASOUND GUIDE' : 'ULTRASON REHBERİ'}
        title={isEn ? `Week ${week} image reading` : `${week}. hafta görüntü okuma`}
        body={isEn ? 'A simple annotated view to help you understand what you are seeing in your scan.' : 'Görüntüde neye baktığını anlamana yardım eden sade, işaretli bir keşif ekranı.'}
        icon="calendar"
        asset="ui_ultrasound_hdlive_20w"
        tint="#5D4F88"
      />

      <ToolExperienceCard
        title={isEn ? 'Read the scan calmly' : 'Görüntüyü sakince oku'}
        steps={isEn
          ? ['Switch between 2D and 3D views.', 'Tap markers to learn what the scan area means.', 'Keep notes for your next clinical visit.']
          : ['2D ve 3D görünüm arasında geç.', 'İşaretlere dokunup o alanın ne anlattığını öğren.', 'Bir sonraki kontrol için notunu yanında tut.']}
        outcome={isEn ? 'Less confusion, better questions at the visit.' : 'Daha az kafa karışıklığı, kontrolde daha iyi soru.'}
        asset="ui_ultrasound_hdlive_20w"
        tint="#5D4F88"
        lang={lang}
      />

      {/* 2D vs 3D/HDLive Sekme */}
      <View style={ms.segRow}>
        <Tap
          onPress={() => setTab('2d')}
          label={isEn ? '2D Ultrasound Guide' : '2D Ultrason Rehberi'}
          style={[ms.segBtn, tab === '2d' && ms.segBtnActive]}
        >
          <T bold={tab === '2d'} style={[ms.segText, tab === '2d' && { color: 'white' }]}>
            {isEn ? '2D Ultrasound Guide' : '2D Ultrason Rehberi'}
          </T>
        </Tap>
        <Tap
          onPress={() => setTab('3d')}
          label={isEn ? '3D / 4D Color HDLive' : '3D / 4D Renkli HDLive'}
          style={[ms.segBtn, tab === '3d' && ms.segBtnActive]}
        >
          <T bold={tab === '3d'} style={[ms.segText, tab === '3d' && { color: 'white' }]}>
            {isEn ? '3D / 4D Color HDLive' : '3D / 4D Renkli HDLive'}
          </T>
        </Tap>
      </View>

      {/* Ultrason Ekranı Çerçevesi */}
      <Card style={ms.usgFrame}>
        <View style={ms.usgHeader}>
          <T bold style={{ color: '#E8D298', fontSize: 13 }}>
            {isEn ? `WEEK ${week} ULTRASOUND` : `${week}. HAFTA ULTRASONU`}
          </T>
          <View style={ms.usgBadge}>
            <T style={{ fontSize: 10, color: 'white' }}>{info.ultrasound?.badge || (isEn ? 'Detailed USG' : 'Detaylı USG')}</T>
          </View>
        </View>

        {/* Ultrason Görsel Alanı */}
        <View style={ms.usgVisual}>
          <LinearGradient
            colors={tab === '2d' ? ['#1A181C', '#0E0D10'] : ['#29181B', '#170E10']}
            style={StyleSheet.absoluteFill}
          />

          {(tab === '3d' ? generatedAssets['ui_ultrasound_hdlive_20w'] : generatedAssets['card_ultrasound_frame']) ? (
            <Image
              source={tab === '3d' ? (generatedAssets['ui_ultrasound_hdlive_20w'] || generatedAssets['card_ultrasound_frame']) : generatedAssets['card_ultrasound_frame']}
              style={ms.usgImage}
              resizeMode="contain"
            />
          ) : (
            <Icon name="milestone" size={80} color="#665063" />
          )}

          {/* İnteraktif Anatomik Sıcak Noktalar (Hotspots) */}
          {markers.map(m => (
            <Tap
              key={m.id}
              label={m.label}
              onPress={() => setActiveMarker(activeMarker === m.id ? null : m.id)}
              style={[ms.hotspot, { left: m.x, top: m.y }]}
            >
              <View style={[ms.hotspotDot, activeMarker === m.id && ms.hotspotDotActive]}>
                <View style={ms.hotspotInner} />
              </View>
            </Tap>
          ))}
        </View>

        {/* Seçilen Noktanın Açıklaması */}
        {activeMarker && (
          <View style={ms.markerCard}>
            <T bold style={{ color: '#E8D298', fontSize: 13 }}>
              📍 {markers.find(m => m.id === activeMarker)?.label}
            </T>
            <T style={{ color: '#E3DDE0', fontSize: 12, marginTop: 3 }}>
              {markers.find(m => m.id === activeMarker)?.desc}
            </T>
          </View>
        )}
      </Card>

      {/* Bu Hafta Neye Bakılır? */}
      <Card style={{ padding: 14 }}>
        <T bold style={{ fontSize: 15 }}>
          {isEn ? "What is discussed in this week's checkup?" : "Bu haftaki kontrolde neler konuşulur?"}
        </T>
        <T style={{ fontSize: 13, color: '#554D5A', marginTop: 6, lineHeight: 20 }}>
          {info.ultrasound?.milestone || (isEn ? 'Growth measurements, amniotic fluid, placental position, and baby position can be added to visit notes.' : 'Gelişim ölçümleri, amniyon sıvısı, plasenta konumu ve bebeğin pozisyonu kontrol notlarına eklenebilir.')}
        </T>
      </Card>
    </View>
  );
}

// ─── EKRAN 12: TIBBİ ZAMAN ÇİZELGESİ & TEST TAKVİMİ (MEDICAL TIMELINE) ────────
export const medicalMilestones = [
  { weekRange: '6-8. Hafta', title: 'İlk Muayene & Kalp Atışı', desc: 'Kese ve fetal kalp atımının teyidi', done: true, key: 'm1' },
  { weekRange: '11-14. Hafta', title: 'İkili Tarama & Ense Kalınlığı', desc: 'Kromozom anomalisi taraması ve burun kemiği', done: true, key: 'm2' },
  { weekRange: '16-18. Hafta', title: 'Dörtlü Tarama Testi', desc: 'Opsiyonel biyokimyasal risk taraması', done: true, key: 'm3' },
  { weekRange: '18-22. Hafta', title: 'Detaylı Anatomi Taraması · 2. Düzey USG', desc: 'Tüm iç organlar, beyin, kalp ve uzuvların tek tek incelenmesi', current: true, key: 'm4' },
  { weekRange: '24-28. Hafta', title: 'Şeker Yükleme & Tam Kan', desc: 'Gestasyonel diyabet ve kansızlık kontrolü', upcoming: true, key: 'm5' },
  { weekRange: '32-36. Hafta', title: 'Gelişim & NST Taramaları', desc: 'Bebek kalp atışı, hareket reaktivitesi ve pozisyonu', upcoming: true, key: 'm6' },
  { weekRange: '37-40. Hafta', title: 'Doğuma Hazırlık & Çatı Muayenesi', desc: 'Doğum kanalı, baş inişi ve son hazırlıklar', upcoming: true, key: 'm7' },
];

export function MedicalTimeline({ lang = 'tr' }) {
  const isEn = lang === 'en';
  const milestones = isEn ? [
    { weekRange: 'Weeks 6-8', title: 'First Exam & Heartbeat', desc: 'Confirmation of gestational sac and fetal heartbeat', done: true, key: 'm1' },
    { weekRange: 'Weeks 11-14', title: 'First Trimester Screening & NT', desc: 'Chromosomal abnormality screening and nuchal translucency', done: true, key: 'm2' },
    { weekRange: 'Weeks 16-18', title: 'Quad Screen Test', desc: 'Optional biochemical risk screening', done: true, key: 'm3' },
    { weekRange: 'Weeks 18-22', title: 'Detailed Anatomy Ultrasound · Level 2 USG', desc: 'Comprehensive scan of all internal organs, brain, heart, and limbs', current: true, key: 'm4' },
    { weekRange: 'Weeks 24-28', title: 'Glucose Screening & Full Blood Count', desc: 'Gestational diabetes and anemia screening', upcoming: true, key: 'm5' },
    { weekRange: 'Weeks 32-36', title: 'Growth & NST Scans', desc: 'Fetal heart rate monitoring, movement reactivity, and position', upcoming: true, key: 'm6' },
    { weekRange: 'Weeks 37-40', title: 'Birth Preparation & Pelvic Check', desc: 'Birth canal readiness, head engagement, and final preparations', upcoming: true, key: 'm7' },
  ] : medicalMilestones;

  return (
    <View style={ms.container}>
      <ScreenHero
        kicker={isEn ? 'CHECKUP TIMELINE' : 'KONTROL TAKVİMİ'}
        title={isEn ? '40-week roadmap' : '40 haftalık yol haritası'}
        body={isEn ? 'Follow routine checkups and upcoming milestones week by week in a single stream.' : 'Rutin kontrolleri ve yaklaşan başlıkları hafta hafta tek akışta gör.'}
        icon="milestone"
        asset="ui_timeline_sun_moon"
        tint="#915B38"
      />

      <ToolExperienceCard
        title={isEn ? 'Know what comes next' : 'Sıradaki kontrolü bil'}
        steps={isEn
          ? ['See completed, current, and upcoming visits.', 'Open each milestone as a preparation checklist.', 'Save questions before the appointment.']
          : ['Tamamlanan, mevcut ve yaklaşan kontrolleri ayır.', 'Her başlığı hazırlık listesi gibi oku.', 'Randevu öncesi sorularını kaybetme.']}
        outcome={isEn ? 'A calmer medical calendar.' : 'Daha sakin ve planlı bir kontrol takvimi.'}
        asset="ui_timeline_sun_moon"
        tint="#915B38"
        lang={lang}
      />

      {/* Dikey Metro Haritası */}
      <View style={ms.timeline}>
        {milestones.map((m, idx) => (
          <View key={m.key} style={ms.timelineItem}>
            {/* Sol Hat & Rozet */}
            <View style={ms.timelineCol}>
              <View
                style={[
                  ms.node,
                  m.done && ms.nodeDone,
                  m.current && ms.nodeCurrent,
                  m.upcoming && ms.nodeUpcoming,
                ]}
              >
                {m.done ? (
                  <Icon name="check" size={13} color="white" />
                ) : m.current ? (
                  <View style={ms.pulsingCore} />
                ) : (
                  <T style={ms.nodeLock}>🔒</T>
                )}
              </View>
              {idx < milestones.length - 1 && <View style={ms.lineTrack} />}
            </View>

            {/* Sağ İçerik Kartı */}
            <View style={[ms.milestoneContent, m.current && ms.milestoneContentCurrent]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <T bold style={{ fontSize: 11, color: m.current ? colors.purple : colors.muted }}>
                  {m.weekRange}
                </T>
                {m.current && (
                  <View style={ms.activeBadge}>
                    <T bold style={{ fontSize: 10, color: 'white' }}>{isEn ? 'CURRENT' : 'BU DÖNEM'}</T>
                  </View>
                )}
              </View>
              <T bold style={{ fontSize: 14, color: colors.ink, marginTop: 4 }}>{m.title}</T>
              <T style={{ fontSize: 12, color: colors.muted, marginTop: 3, lineHeight: 17 }}>{m.desc}</T>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── EKRAN 13: AYRINTILI ORGAN GELİŞİMİ & KALP SESİ ─────────────────────────
export function OrganDevelopment({ state, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState('heart');
  const [playing, setPlaying] = useState(false);
  const pulse = usePulse(0.9, 1.1, 800);

  const organs = isEn ? [
    {
      id: 'heart',
      title: 'Heart & Circulation',
      tabLabel: 'Heart',
      bpm: '145 BPM',
      icon: 'heart',
      desc: "Your baby's heart beats about 140-150 times per minute (twice an adult's!). Heart valves and 4 chambers are working perfectly.",
    },
    {
      id: 'brain',
      title: 'Brain & Nerves',
      tabLabel: 'Brain',
      bpm: null,
      icon: 'milestone',
      desc: 'Tens of thousands of new nerve cells connect every second. Centers for processing taste, smell, and sounds have activated.',
    },
    {
      id: 'senses',
      title: 'Senses & Movement',
      tabLabel: 'Senses',
      bpm: null,
      icon: 'footprint',
      desc: 'Eyelids react to light, recognizing your voice. Grasping reflex is practiced by clenching fingers.',
    },
    {
      id: 'bones',
      title: 'Bones & Fat',
      tabLabel: 'Bones',
      bpm: null,
      icon: 'scale',
      desc: 'Cartilage transforms into strong bone by storing calcium. Protective brown fat tissue accumulates under the skin.',
    },
  ] : [
    {
      id: 'heart',
      title: 'Kalp & Dolaşım',
      tabLabel: 'Kalp',
      bpm: '145 BPM',
      icon: 'heart',
      desc: 'Bebeğin kalbi dakikada yaklaşık 140-150 kez atar (yetişkinin iki katı!). Kalp kapakçıkları ve 4 odacık kusursuz çalışıyor.',
    },
    {
      id: 'brain',
      title: 'Beyin & Sinirler',
      tabLabel: 'Beyin',
      bpm: null,
      icon: 'milestone',
      desc: 'Her saniye on binlerce yeni sinir hücresi bağlantı kuruyor. Tat, koku ve sesleri işleme merkezleri aktifleşti.',
    },
    {
      id: 'senses',
      title: 'Duyular & Hareket',
      tabLabel: 'Duyular',
      bpm: null,
      icon: 'footprint',
      desc: 'Göz kapakları ışığa tepki veriyor, sesinizi tanıyor. El parmaklarını sıkarak kavrama refleksini çalıştırıyor.',
    },
    {
      id: 'bones',
      title: 'Kemikler & Yağ',
      tabLabel: 'Kemikler',
      bpm: null,
      icon: 'scale',
      desc: 'Kıkırdaklar kalsiyum depolayarak güçlü kemiklere dönüşüyor. Cilt altında koruyucu kahverengi yağ dokusu birikiyor.',
    },
  ];

  const currentOrgan = organs.find(o => o.id === activeTab) || organs[0];

  return (
    <View style={ms.container}>
      <ScreenHero
        kicker={isEn ? 'DEVELOPMENT FOCUS' : 'GELİŞİM ODAKLARI'}
        title={isEn ? 'Explore organ development' : 'Organ gelişimini bölümlere ayır'}
        body={isEn ? 'Follow heart, brain, senses, and bone development on a single screen with clear headings.' : 'Kalp, beyin, duyular ve kemik gelişimini tek ekranda sade başlıklarla takip et.'}
        icon="heart"
        asset="ui_fetal_heart_3d"
        tint="#A84D67"
      />

      <ToolExperienceCard
        title={isEn ? 'Follow one system at a time' : 'Her sistemi tek tek izle'}
        steps={isEn
          ? ['Choose heart, brain, senses, or bones.', 'Read the current development note.', 'Return weekly to see what changed.']
          : ['Kalp, beyin, duyular veya kemikleri seç.', 'O haftanın gelişim notunu oku.', 'Haftalık değişimi görmek için geri dön.']}
        outcome={isEn ? 'Development feels visible, not abstract.' : 'Gelişim soyut değil, görünür hissedilir.'}
        asset="ui_fetal_heart_3d"
        tint="#A84D67"
        lang={lang}
      />

      {/* Kalp Atış Simülatörü Kartı */}
      <Card style={ms.heartPlayerCard}>
        <LinearGradient
          colors={['#4A2E44', '#2B1A28']}
          style={StyleSheet.absoluteFill}
        />
        <View style={ms.heartPlayerContent}>
          <Animated.View style={{ transform: [{ scale: playing ? pulse : 1 }] }}>
            <Tap
              onPress={() => setPlaying(!playing)}
              label={isEn ? 'Listen to heartbeat' : 'Kalp atışını dinle'}
              style={ms.heartBtn}
            >
              {generatedAssets['ui_fetal_heart_3d'] ? (
                <Image source={generatedAssets['ui_fetal_heart_3d']} style={{ width: 44, height: 44 }} resizeMode="contain" />
              ) : (
                <Icon name="heart" size={38} color="#FF6E8F" fill={playing ? '#FF6E8F' : 'none'} />
              )}
            </Tap>
          </Animated.View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <T bold style={{ color: 'white', fontSize: 16 }}>
              {isEn ? 'Average Fetal Heart Rate' : 'Ortalama Fetal Kalp Atımı'}
            </T>
            <T style={{ color: '#FFB8CA', fontSize: 13, marginTop: 2 }}>
              {isEn ? '~145 BPM · Dynamic Rhythm' : '~145 BPM · Dinamik Ritim'}
            </T>
            <T style={{ color: '#D9C1CE', fontSize: 11, marginTop: 4 }}>
              {playing
                ? (isEn ? '🎵 Heart rhythm playing...' : '🎵 Kalp ritmi çalıyor...')
                : (isEn ? 'Tap to listen' : 'Dinlemek için dokunun')}
            </T>
          </View>
        </View>
      </Card>

      {/* Organ Seçici Butonlar */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {organs.map(o => (
          <Tap
            key={o.id}
            onPress={() => setActiveTab(o.id)}
            label={o.title}
            style={[ms.organPill, activeTab === o.id && ms.organPillActive]}
          >
            <T bold={activeTab === o.id} style={{ fontSize: 12, color: activeTab === o.id ? 'white' : colors.ink }}>
              {o.tabLabel}
            </T>
          </Tap>
        ))}
      </View>

      {/* Detay Açıklama Kartı */}
      <Card style={{ padding: 16 }}>
        <T bold style={{ fontSize: 16, color: colors.purple }}>{currentOrgan.title}</T>
        {currentOrgan.bpm && (
          <View style={ms.bpmBadge}>
            <T bold style={{ fontSize: 12, color: '#C24D68' }}>{currentOrgan.bpm}</T>
          </View>
        )}
        <T style={{ fontSize: 14, color: '#4E4856', lineHeight: 22, marginTop: 10 }}>
          {currentOrgan.desc}
        </T>
      </Card>
    </View>
  );
}

const ms = StyleSheet.create({
  container: { gap: 14, paddingBottom: 20 },
  segRow: { flexDirection: 'row', gap: 8, backgroundColor: '#EFE7EE', padding: 4, borderRadius: 20 },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  segBtnActive: { backgroundColor: colors.purple },
  segText: { fontSize: 12 },
  heroCard: { padding: 20, alignItems: 'center', overflow: 'hidden' },
  heroMeta: { alignItems: 'center', marginBottom: 12 },
  stage: { alignItems: 'center', marginVertical: 10 },
  emojiStage: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center' },
  stageTitle: { fontSize: 22, color: colors.ink, marginTop: 8 },
  stageSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  metricsRow: { flexDirection: 'row', width: '100%', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderColor: colors.line, justifyContent: 'space-around' },
  metricItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricLabel: { fontSize: 10, color: colors.muted },
  metricVal: { fontSize: 15, color: colors.ink },
  metricDivider: { width: 1, height: 28, backgroundColor: colors.line },
  weekPill: { minWidth: 44, paddingVertical: 8, borderRadius: 16, alignItems: 'center', backgroundColor: '#EDE4ED' },
  weekPillActive: { backgroundColor: colors.purple },
  // USG styles
  usgFrame: { backgroundColor: '#131114', borderRadius: 22, padding: 14, overflow: 'hidden' },
  usgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  usgBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: '#473444' },
  usgVisual: { height: 200, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  usgImage: { width: '90%', height: '90%' },
  hotspot: { position: 'absolute', width: 34, height: 34, marginLeft: -17, marginTop: -17, alignItems: 'center', justifyContent: 'center' },
  hotspotDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#E8D29888', alignItems: 'center', justifyContent: 'center' },
  hotspotDotActive: { backgroundColor: '#E8D298', transform: [{ scale: 1.3 }] },
  hotspotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'white' },
  markerCard: { marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: '#2C252B' },
  // Timeline styles
  timeline: { gap: 0, paddingLeft: 6 },
  timelineItem: { flexDirection: 'row', gap: 14 },
  timelineCol: { alignItems: 'center', width: 30 },
  node: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  nodeDone: { backgroundColor: colors.sage },
  nodeCurrent: { backgroundColor: colors.purple, borderWidth: 3, borderColor: '#DFC2E3' },
  nodeUpcoming: { backgroundColor: '#EDE5EE' },
  nodeLock: { fontSize: 11 },
  pulsingCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'white' },
  lineTrack: { width: 2, flex: 1, backgroundColor: '#E8DFE9', marginVertical: 4 },
  milestoneContent: { flex: 1, padding: 12, borderRadius: 16, backgroundColor: '#FFFDFA', borderWidth: 1, borderColor: '#F0EAE6', marginBottom: 12, ...shadow },
  milestoneContentCurrent: { borderColor: colors.purple, backgroundColor: '#FAF6FB' },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: colors.purple },
  // Heart styles
  heartPlayerCard: { padding: 18, borderRadius: 20, overflow: 'hidden' },
  heartPlayerContent: { flexDirection: 'row', alignItems: 'center' },
  heartBtn: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#573750', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FF9EBA' },
  organPill: { flex: 1, paddingVertical: 10, borderRadius: 16, backgroundColor: '#EFE7EE', alignItems: 'center' },
  organPillActive: { backgroundColor: colors.purple },
  bpmBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: '#FBE8ED', marginTop: 4 },
});
