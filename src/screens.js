import React, { useState, useRef } from 'react';
import { View, Image, StyleSheet, TextInput, Keyboard, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { assets, colors, fonts, shadow } from './theme';
import { Icon, BrandMark, ProductArt, FruitArt, ComparisonArt } from './Icons';
import { generatedAssets, getAsset } from './generatedAssets';
import { T, Tap, Card, RoundButton, Section, Tabs, MoodPicker, Progress, SmallStat, Page, ScreenHero } from './ui';
import { getWeekInfo, formatWeight, formatLength, trimesterLabel, monthLabel, pregnancyProgress, TOTAL_WEEKS } from './weekData';
import { usePulse, useCrossFade } from './anim';
import { articles, searchArticles, searchFaqs } from './content';
import { TopicHubScreen } from './ExploreScreens';
import { CommunityHub } from './CommunityScreens';
import { getBabyLetterForWeek } from './babyLettersData';

export const journeys = [
  { key: 'pregnancy', title: 'Hamileyim', sub: 'Bebeğimle tanışmaya\nhazırlanıyorum', image: assets.pregnancy, tint: '#F5E7E8' },
  { key: 'postpartum', title: 'Yeni doğum yaptım', sub: 'Lohusalık sürecimde\nyanımda ol', image: assets.mother, tint: '#F5E5E7' },
  { key: 'baby', title: 'Bebeğimi\nbüyütüyorum', sub: 'Her gününde birlikte', image: assets.baby, tint: '#EAEAE3' },
];

export function Onboarding({ choose, update, toast }) {
  const [role, setRole] = useState('mother'); // 'mother' | 'father'
  const [showSyncInput, setShowSyncInput] = useState(false);
  const [partnerCode, setPartnerCode] = useState('');

  const fatherJourneys = [
    { key: 'pregnancy', title: 'Bebeğimizi Bekliyoruz', sub: 'Eşimin yanında, bebeğimizle\ntanışmaya hazırlanıyorum', image: assets.pregnancy, tint: '#EBF2F7' },
    { key: 'postpartum', title: 'Lohusalık Desteği', sub: 'Eşime ve bebeğime lohusalıkta\nen iyi desteği veriyorum', image: assets.mother, tint: '#EAF0F6' },
    { key: 'baby', title: 'Bebeğimizi Büyütüyoruz', sub: 'Gelişimini her gün\nbirlikte takip ediyoruz', image: assets.baby, tint: '#ECEEE7' },
  ];

  const currentJourneys = role === 'father' ? fatherJourneys : journeys;

  function selectJourney(key) {
    if (update) {
      update({
        role,
        name: role === 'father' ? 'Mehmet' : 'Zeynep',
        partnerName: role === 'father' ? 'Zeynep' : 'Mehmet',
        partnerRole: role === 'father' ? 'mother' : 'father',
        partnerConnected: true,
      });
    }
    toast && toast(role === 'father' ? 'Hoş geldin Baba! 👨‍🍼 Ortak yolculuğunuz başladı.' : 'Hoş geldin Anne! 🌸 Mucizeniz başladı.');
    choose(key);
  }

  function handleSyncSubmit() {
    if (!partnerCode.trim()) return;
    toast && toast('Eşinin aile hesabına başarıyla bağlandın! 💚');
    selectJourney('pregnancy');
  }

  return <Page contentStyle={s.onboarding}>
    <View style={s.brand}><BrandMark size={38}/><T style={s.wordmark}>MOMORA</T></View>
    
    <View style={s.welcome}>
      <T bold style={s.welcomeTitle}>Yolculuğun Nerede?</T>
      <T style={s.welcomeText}>Anne ve baba aynı hesaptan birlikte takip edebilir.{ '\n' }Sana en uygun deneyimi sunalım.</T>
    </View>

    {/* ─── ANNE / BABA ROL SEÇİCİ ─── */}
    <View style={{ marginBottom: 20 }}>
      <T bold style={{ fontSize: 13, color: colors.purple, marginBottom: 8, textAlign: 'center' }}>BEN KİMİM?</T>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Tap
          onPress={() => setRole('mother')}
          label="Anne Adayıyım"
          style={[
            { flex: 1, paddingVertical: 14, paddingHorizontal: 10, borderRadius: 18, alignItems: 'center', backgroundColor: '#FAF6FA', borderWidth: 2, borderColor: '#ECE0EE' },
            role === 'mother' && { backgroundColor: '#F7EDF5', borderColor: colors.purple, ...shadow },
          ]}
        >
          <T style={{ fontSize: 26 }}>🤰</T>
          <T bold style={{ fontSize: 13, color: role === 'mother' ? colors.purple : colors.ink, marginTop: 4 }}>
            Ben Anneyim
          </T>
          <T style={{ fontSize: 10, color: colors.muted, marginTop: 2, textAlign: 'center' }}>
            Hamilelik & Beden Takibi
          </T>
        </Tap>

        <Tap
          onPress={() => setRole('father')}
          label="Baba Adayıyım"
          style={[
            { flex: 1, paddingVertical: 14, paddingHorizontal: 10, borderRadius: 18, alignItems: 'center', backgroundColor: '#F6F9FB', borderWidth: 2, borderColor: '#DCE8F2' },
            role === 'father' && { backgroundColor: '#EBF3F9', borderColor: '#3E76A8', ...shadow },
          ]}
        >
          <T style={{ fontSize: 26 }}>👨‍🍼</T>
          <T bold style={{ fontSize: 13, color: role === 'father' ? '#3E76A8' : colors.ink, marginTop: 4 }}>
            Ben Babayım
          </T>
          <T style={{ fontSize: 10, color: colors.muted, marginTop: 2, textAlign: 'center' }}>
            Eş Desteği & Ortak Takip
          </T>
        </Tap>
      </View>
    </View>

    {/* EŞİNİN AİLE KODU İLE BAĞLAN BUTONU */}
    <View style={{ marginBottom: 18, alignItems: 'center' }}>
      <Tap
        onPress={() => setShowSyncInput(!showSyncInput)}
        label="Eşimin aile kodu var"
        style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#F0EAF2' }}
      >
        <T bold style={{ fontSize: 11, color: colors.purple }}>
          {showSyncInput ? '✕ Kapat' : '📲 Eşimin Aile Kodu Var · Ortak Hesaba Bağlan'}
        </T>
      </Tap>

      {showSyncInput && (
        <View style={{ width: '100%', marginTop: 10, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput
            value={partnerCode}
            onChangeText={setPartnerCode}
            placeholder="Örn: MOM-7829-TR"
            placeholderTextColor={colors.muted}
            style={{ flex: 1, height: 42, borderRadius: 12, borderWidth: 1, borderColor: colors.purple, paddingHorizontal: 12, backgroundColor: '#FFFFFF', fontSize: 13 }}
          />
          <Tap onPress={handleSyncSubmit} label="Bağlan" style={{ height: 42, paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' }}>
            <T bold style={{ color: 'white', fontSize: 12 }}>Eşime Bağlan</T>
          </Tap>
        </View>
      )}
    </View>

    {/* YOLCULUK KARTLARI */}
    <View style={{ gap: 16 }}>{currentJourneys.map(j => <Tap key={j.key} label={j.title.replace('\n',' ')} onPress={() => selectJourney(j.key)} style={[s.journey, { backgroundColor: j.tint }]}>
      <View style={s.journeyPhoto}><Image source={j.image} style={s.journeyImage} resizeMode="cover"/><LinearGradient colors={['transparent', j.tint]} start={{x:0.72,y:0}} end={{x:1,y:0}} style={StyleSheet.absoluteFill}/></View>
      <View style={s.journeyCopy}><T bold style={s.journeyTitle}>{j.title}</T><T style={s.journeySub}>{j.sub}</T></View><Icon name="chevron" size={22}/>
    </Tap>)}</View>

    <View style={s.motto}><Icon name="heart" color="#A68A9C" size={29}/><T style={s.handwritten}>Anne ve Baba el ele,{ '\n' }huzurlu bir yolculuk için</T></View>
  </Page>;
}

// ─── 3'lü Kıyaslama & Ultrason Hero (Pregnancy+ Stili) ─────────────────────────
function ComparisonHero({ week, info, onPress }) {
  const [mode, setMode] = useState('fruit'); // 'fruit' | 'animal' | 'sweet' | 'ultrasound'
  const scale = usePulse(0.94, 1.06, 1800);
  const fade  = useCrossFade(week + mode, 260);
  const progress = pregnancyProgress(week);

  let compName = info.fruitName;
  let compSub = 'büyüklüğünde';
  let compType = info.fruit;
  let compEmoji = '🍑';

  if (mode === 'animal') {
    compName = info.animalName || 'Sevimli Yavru';
    compSub = 'kadar sevimli';
    compType = info.animal || 'hamster';
    compEmoji = info.animalEmoji || '🐾';
  } else if (mode === 'sweet') {
    compName = info.sweetName || 'Tatlı Nesne';
    compSub = 'ağırlığında';
    compType = info.sweet || 'macaron';
    compEmoji = info.sweetEmoji || '🧁';
  } else if (mode === 'ultrasound') {
    compName = info.ultrasound?.scan || 'Ultrason';
    compSub = info.ultrasound?.badge || '2D / 4D Doppler';
    compType = 'ultrasound';
    compEmoji = '🩺';
  }

  return (
    <View style={s.compHeroCard}>
      {/* 3'lü Kıyaslama Switcher (Pregnancy+ Stili) */}
      <View style={s.compTabs}>
        {[
          { key: 'fruit', label: '🍏 Meyve' },
          { key: 'animal', label: '🧸 Hayvan' },
          { key: 'sweet', label: '🧁 Tatlı' },
          { key: 'ultrasound', label: '🩺 Ultrason' },
        ].map(t => (
          <Tap
            key={t.key}
            onPress={() => setMode(t.key)}
            label={t.label}
            accessibilityState={{ selected: mode === t.key }}
            style={[s.compTab, mode === t.key && s.compTabActive]}
          >
            <T style={[s.compTabLabel, mode === t.key && s.compTabLabelActive]}>{t.label}</T>
          </Tap>
        ))}
      </View>

      <Tap onPress={onPress} label="Bu haftaki gelişimi gör" style={s.fruitHero}>
        <LinearGradient colors={['#6A4F7A22', 'transparent']} start={{x:0,y:0}} end={{x:1,y:0}} style={StyleSheet.absoluteFill} />
        {/* Sol — sayısal bilgi */}
        <View style={s.fruitHeroLeft}>
          <View style={s.row}>
            <T bold style={s.fruitWeekNum}>{week}. Hafta</T>
            {mode === 'ultrasound' && (
              <View style={s.usBadge}>
                <T style={s.usBadgeText}>{info.ultrasound?.badge || 'Ultrason'}</T>
              </View>
            )}
          </View>
          <T style={s.fruitMeta}>{monthLabel(info.month)} · {trimesterLabel(info.trimester)}</T>

          {mode === 'ultrasound' ? (
            <View style={{ marginTop: 8, paddingRight: 4 }}>
              <T style={{ fontSize: 11, color: '#6A4878', lineHeight: 15 }}>
                {info.ultrasound?.milestone || 'Bebeğin organları ve yüz hatları inceleniyor.'}
              </T>
            </View>
          ) : (
            <View style={s.fruitStats}>
              <View style={s.fruitStat}>
                <Icon name="ruler" size={14} color="#9A779A"/>
                <T style={s.fruitStatVal}>{formatLength(info.lengthCm)}</T>
              </View>
              <View style={s.fruitStat}>
                <Icon name="scale" size={14} color="#9A779A"/>
                <T style={s.fruitStatVal}>{formatWeight(info.weightG)}</T>
              </View>
            </View>
          )}

          {/* İlerleme çubuğu */}
          <View style={{marginTop:10}}>
            <T style={{fontSize:10,color:'#B89DC0',marginBottom:4}}>{progress}% tamamlandı</T>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, {width: `${progress}%`}]} />
            </View>
          </View>
          <View style={s.fruitHeroBtn}>
            <T style={{fontSize:12,color:'#9A779A'}}>Detayları gör</T>
            <Icon name="arrow" size={15} color="#9A779A"/>
          </View>
        </View>

        {/* Sağ — animasyonlu kıyaslama görseli */}
        <Animated.View style={[s.fruitRight, {transform:[{scale}], opacity: fade}]}>
          <ComparisonArt
            mode={mode}
            type={compType}
            size={mode === 'ultrasound' ? 96 : 108}
            emoji={compEmoji}
            info={info}
            week={week}
          />
          <T numberOfLines={1} style={s.fruitName}>{compName}</T>
          <T style={s.fruitSub}>{compSub}</T>
        </Animated.View>
      </Tap>
    </View>
  );
}

// ─── Hamilelik Ekranı ─────────────────────────────────────────────────────────
export function Pregnancy({ state, update, open }) {
  const [timelineDay, setTimelineDay] = useState('bugun'); // 'dun' | 'bugun' | 'yarin'
  const week = state.week ?? 24;
  const info = getWeekInfo(week);
  const letter = getBabyLetterForWeek(week);

  // Hafta şeridi: mevcut hafta ±5, tüm geçerli hafta aralığında
  const strip = [];
  for (let w = Math.max(4, week - 4); w <= Math.min(TOTAL_WEEKS, week + 5); w++) strip.push(w);

  const moodLabels = ['Harika ✨', 'İyi 💛', 'Normal 🌿', 'Yorgun 🛌', 'Zor 💜'];

  const timelineContent = {
    dun: {
      baby: 'Bebeğinizin parmak uçlarında minik dokunma reseptörleri aktifleşti.',
      mom: 'Bel bölgenizde hafif tatlı bir ağırlık hissi oluşmuş olabilir.',
      tip: 'Akşam 20 dakikalık hafif tempolu temiz hava yürüyüşü uyku kalitenizi artırır.',
    },
    bugun: {
      baby: 'Bugün ilk hıçkırık refleksleri başlayabilir; bu durum diyafram kaslarını doğuma hazırlar!',
      mom: 'Kan hacminiz %40 arttı; hafif burun tıkanıklığı bu dönemde çok yaygındır.',
      tip: 'Magnezyum ve kalsiyum açısından zengin besinleri not etmek, randevuda beslenme düzenini konuşmayı kolaylaştırır.',
    },
    yarin: {
      baby: 'Yüz mimik kasları gülümseme ve kaş çatma hareketlerini denemeye devam ediyor.',
      mom: 'Enerjiniz yüksek seyredebilir; bebek odası planlamaları için harika bir gün.',
      tip: 'Günün sonunda ayaklarınızı bir yastıkla yukarı kaldırarak dinlendirmeyi unutmayın.',
    },
  };

  const tc = timelineContent[timelineDay];

  return <Page>
    {/* ─── 1. ÜST BAŞLIK & GERİ SAYIM ─── */}
    <View style={s.topline}>
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <T bold style={{ color: '#684574', fontSize: 18 }}>Merhaba, {state.name}</T>
          <T style={{ fontSize: 18 }}>🌸</T>
        </View>
        <T style={s.subtitle}>Bugün: 12 Eylül Cumartesi · {week}. Hafta 5. Gün</T>
      </View>
      <Tap onPress={() => open('appointment')} label="Randevularım" style={s.iconHit}>
        <Icon name="bell" size={26}/>
      </Tap>
    </View>

    {/* Geri Sayım Rozet Şeridi */}
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F6EFF7', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14 }}>
      <T bold style={{ fontSize: 12, color: colors.purple }}>
        ⏳ Doğuma {(40 - week) * 7} Gün Kaldı
      </T>
      <T style={{ fontSize: 11, color: '#7E6184' }}>
        Bebeğin: {state.babyName || 'Ada'} · {state.babyGender || 'Kız'}
      </T>
    </View>

    {/* ─── 2. HAFTA ŞERİDİ ─── */}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.weekStrip}>
      {strip.map(n => (
        <Tap key={n} label={n + '. hafta'} onPress={() => update({week:n})}
          accessibilityState={{selected: week === n}}
          style={[s.weekPill, week === n && s.weekActive]}>
          <T style={[{fontSize:13}, week === n && {color:'white',fontFamily:fonts.bold}]}>{n}</T>
          <T style={[{fontSize:9,marginTop:1,color: week===n?'#EEE5F4':colors.muted}]}>
            {getWeekInfo(n).fruitName.split(' ')[0]}
          </T>
        </Tap>
      ))}
    </ScrollView>

    {/* ─── 3. 3'LÜ KIYASLAMA & ULTRASON HERO ─── */}
    <ComparisonHero week={week} info={info} onPress={() => open('week', {week})} />

    {/* ─── 4. BEBEĞİN GÜNLÜK MEKTUBU (DOĞRUDAN SAYFADA AÇIK PARŞÖMEN) ─── */}
    <Card style={{ padding: 16, backgroundColor: '#FFFDF9', borderColor: '#EFE0D8' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#FCEEF2', alignItems: 'center', justifyContent: 'center' }}>
            <T style={{ fontSize: 18 }}>💌</T>
          </View>
          <View>
            <T bold style={{ fontSize: 14, color: colors.purple }}>Bebeğinden Günün Mektubu</T>
            <T style={{ fontSize: 10, color: colors.muted }}>{letter.dayText || (week + '. Hafta Mektubu')}</T>
          </View>
        </View>
        <Tap onPress={() => open('babyLetter')} style={{ padding: 4 }}>
          <T bold style={{ fontSize: 11, color: colors.purple }}>Tüm Mektuplar →</T>
        </Tap>
      </View>

      <T style={{ fontSize: 13.5, color: '#4B3F4B', lineHeight: 21, fontStyle: 'italic' }}>
        "{letter.text}"
      </T>

      {letter.milestone ? (
        <View style={{ marginTop: 10, backgroundColor: '#FAF3EF', padding: 8, borderRadius: 10 }}>
          <T style={{ fontSize: 11, color: '#885842' }}>🌱 Gelişim Notu: {letter.milestone}</T>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderColor: '#F5ECE5' }}>
        <T style={{ fontSize: 11, color: colors.muted }}>Seni çok seven bebeğin 💛</T>
        <Tap onPress={() => open('babyLetter')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <T bold style={{ fontSize: 11, color: colors.purple }}>Eşime Gönder</T>
          <Icon name="chevron" size={12} color={colors.purple}/>
        </Tap>
      </View>
    </Card>

    {/* ─── 5. GÜNLÜK AKIŞ & ZAMAN TÜNELİ (DÜN - BUGÜN - YARIN) ─── */}
    <Card style={{ padding: 15 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <T bold style={{ fontSize: 15, color: colors.ink }}>⏱️ Günlük Gelişim Akışı</T>
        {/* Dün - Bugün - Yarın Sekmeleri */}
        <View style={{ flexDirection: 'row', backgroundColor: '#EFE7F0', borderRadius: 12, padding: 2 }}>
          {[
            { id: 'dun', label: 'Dün' },
            { id: 'bugun', label: 'Bugün ✨' },
            { id: 'yarin', label: 'Yarın' },
          ].map(d => (
            <Tap
              key={d.id}
              onPress={() => setTimelineDay(d.id)}
              style={[
                { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
                timelineDay === d.id && { backgroundColor: 'white', ...shadow },
              ]}
            >
              <T bold={timelineDay === d.id} style={{ fontSize: 11, color: timelineDay === d.id ? colors.purple : colors.muted }}>
                {d.label}
              </T>
            </Tap>
          ))}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', gap: 10, backgroundColor: '#FAF6FA', padding: 10, borderRadius: 12 }}>
          <T style={{ fontSize: 18 }}>🍼</T>
          <View style={{ flex: 1 }}>
            <T bold style={{ fontSize: 12, color: colors.purple }}>Bebeğin</T>
            <T style={{ fontSize: 12.5, color: '#4E4252', marginTop: 1, lineHeight: 17 }}>{tc.baby}</T>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, backgroundColor: '#FDF3F5', padding: 10, borderRadius: 12 }}>
          <T style={{ fontSize: 18 }}>💜</T>
          <View style={{ flex: 1 }}>
            <T bold style={{ fontSize: 12, color: '#A03B64' }}>Bedenin</T>
            <T style={{ fontSize: 12.5, color: '#563D4A', marginTop: 1, lineHeight: 17 }}>{tc.mom}</T>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, backgroundColor: '#F3F8F4', padding: 10, borderRadius: 12 }}>
          <T style={{ fontSize: 18 }}>🌿</T>
          <View style={{ flex: 1 }}>
            <T bold style={{ fontSize: 12, color: '#38734A' }}>Günün Tavsiyesi</T>
            <T style={{ fontSize: 12.5, color: '#3A5442', marginTop: 1, lineHeight: 17 }}>{tc.tip}</T>
          </View>
        </View>
      </View>
    </Card>

    {/* ─── 6. BUGÜNÜN CANLI TAKİP GÜNLÜĞÜ (CHECKLIST & KAYIT LİSTESİ) ─── */}
    <Card style={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <T style={{ fontSize: 16 }}>📋</T>
          <T bold style={{ fontSize: 15, color: colors.ink }}>Bugünün Takip Günlüğü</T>
        </View>
        <Tap onPress={() => open('toolsHub')} style={{ padding: 4 }}>
          <T bold style={{ fontSize: 11, color: colors.purple }}>Takip merkezi →</T>
        </Tap>
      </View>

      <View style={{ gap: 8 }}>
        {/* 1. Su Takibi */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F2EAF3' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <T style={{ fontSize: 16 }}>💧</T>
            <View>
              <T bold style={{ fontSize: 13 }}>Su Takibi · {state.water || 4}/8 Bardak</T>
              <T style={{ fontSize: 11, color: colors.muted }}>{(state.water * 0.25).toFixed(1)} / 2.0 Litre tamamlandı</T>
            </View>
          </View>
          <Tap onPress={() => update(old => ({ water: Math.min(12, (old.water || 0) + 1) }))} style={{ backgroundColor: '#EDF5F8', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
            <T bold style={{ fontSize: 11, color: '#367B9E' }}>+1 Bardak</T>
          </Tap>
        </View>

        {/* 2. Vitamin Takibi */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F2EAF3' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <T style={{ fontSize: 16 }}>💊</T>
            <View>
              <T bold style={{ fontSize: 13 }}>Vitamin Notu</T>
              <T style={{ fontSize: 11, color: state.vitamin ? '#3A8253' : colors.muted }}>
                {state.vitamin ? 'Bugün alındı ✓' : 'Günlük doz bekleniyor'}
              </T>
            </View>
          </View>
          <Tap onPress={() => update(old => ({ vitamin: !old.vitamin }))} style={{ backgroundColor: state.vitamin ? '#EBF5ED' : '#F7ECEB', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
            <T bold style={{ fontSize: 11, color: state.vitamin ? '#2E6E43' : '#A8453E' }}>
              {state.vitamin ? 'Alındı ✓' : 'Alındı İşaretle'}
            </T>
          </Tap>
        </View>

        {/* 3. Tekme Takibi */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F2EAF3' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <T style={{ fontSize: 16 }}>🦶</T>
            <View>
              <T bold style={{ fontSize: 13 }}>Hareket Seansı</T>
              <T style={{ fontSize: 11, color: colors.muted }}>
                {state.kickSessions?.[0] ? `Son: ${state.kickSessions[0].kicks ?? state.kickSessions[0].count} hareket` : 'İlk seansı başlat'}
              </T>
            </View>
          </View>
          <Tap onPress={() => open('kickCounter')} style={{ backgroundColor: '#FAF1F5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
            <T bold style={{ fontSize: 11, color: '#A03B64' }}>Seans Başlat</T>
          </Tap>
        </View>

        {/* 4. Kilo Takibi */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F2EAF3' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <T style={{ fontSize: 16 }}>⚖️</T>
            <View>
              <T bold style={{ fontSize: 13 }}>Kilo Takibi · {state.weights?.[0]?.value || state.startWeight || 60} kg</T>
              <T style={{ fontSize: 11, color: '#3A8253' }}>Haftalık eğilimi güncelle</T>
            </View>
          </View>
          <Tap onPress={() => open('weight')} style={{ backgroundColor: '#EEF5F1', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
            <T bold style={{ fontSize: 11, color: '#34754B' }}>Kilo Kaydet</T>
          </Tap>
        </View>

        {/* 5. Ruh Hali */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <T style={{ fontSize: 16 }}>🌸</T>
            <View>
              <T bold style={{ fontSize: 13 }}>Günün Ruh Hali: {moodLabels[state.mood ?? 0]}</T>
              <T style={{ fontSize: 11, color: colors.muted }}>Bugünkü hissini kısa notla takip et</T>
            </View>
          </View>
          <Tap onPress={() => open('dailyMood')} style={{ backgroundColor: '#F3ECF5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
            <T bold style={{ fontSize: 11, color: colors.purple }}>Değiştir</T>
          </Tap>
        </View>
      </View>
    </Card>

    {/* ─── 7. GELİŞİM VE KONTROL KISAYOLLARI ─── */}
    <View style={[s.row,{gap:8}]}>
      <Tap
        onPress={() => open('ultrasoundAtlas')}
        label="Ultrason atlasını aç"
        style={{flex:1,padding:10,borderRadius:16,backgroundColor:'#F3EEF5',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#E6DCea'}}
      >
        <T style={{fontSize:16}}>🩺</T>
        <T bold style={{fontSize:11,color:colors.ink,marginTop:3}}>Ultrason Atlası</T>
      </Tap>
      <Tap
        onPress={() => open('organDevelopment')}
        label="Organ gelişimini aç"
        style={{flex:1,padding:10,borderRadius:16,backgroundColor:'#FDF2F4',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#EED9DF'}}
      >
        <T style={{fontSize:16}}>💓</T>
        <T bold style={{fontSize:11,color:colors.ink,marginTop:3}}>Organ & Kalp</T>
      </Tap>
      <Tap
        onPress={() => open('medicalTimeline')}
        label="Tıbbi takvimi aç"
        style={{flex:1,padding:10,borderRadius:16,backgroundColor:'#EEF5F2',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#D8E8E0'}}
      >
        <T style={{fontSize:16}}>📅</T>
        <T bold style={{fontSize:11,color:colors.ink,marginTop:3}}>Kontrol Takvimi</T>
      </Tap>
    </View>

    {/* ─── 8. BEBEK BU HAFTA ─── */}
    <Card style={{padding:14}}>
      <View style={[s.row,{gap:8,marginBottom:10}]}>
        <T bold style={{fontSize:15}}>🍼 Bebeğinde bu hafta ({week}. Hafta)</T>
      </View>
      {info.baby.map((b,i) => (
        <View key={i} style={[s.row,{gap:8,marginBottom:i<info.baby.length-1?8:0}]}>
          <View style={s.bullet}/>
          <T style={{fontSize:13,flex:1,lineHeight:19,color:'#555060'}}>{b}</T>
        </View>
      ))}
      <Tap onPress={() => open('week',{week})} style={s.seeMore}>
        <T style={{fontSize:13,color:colors.purple}}>Annenin bu haftasını ve not almayı gör</T>
        <Icon name="chevron" size={16} color={colors.purple}/>
      </Tap>
    </Card>

    {/* ─── 9. RANDEVU KARTI ─── */}
    <Tap onPress={() => open('appointment')} style={s.appointment}>
      <View style={{flex:1}}>
        <T style={{fontSize:13}}>{state.appointment.title}</T>
        <View style={[s.row,{marginTop:8,gap:13}]}>
          <Icon name="calendar" size={28}/>
          <T bold style={{fontSize:15,lineHeight:20}}>{state.appointment.date}{'\n'}{state.appointment.time}</T>
        </View>
      </View>
      <View style={s.appointmentIcon}><Icon name="bottle" size={23} color="#A69BCF" fill="#E5DDF6"/></View>
    </Tap>

    {/* ─── 10. GEBELİK SAYAÇLARI & ARAÇLAR ─── */}
    <View style={{marginTop:6}}>
      <Section title="Sık kullanılan araçlar" action="Koleksiyonu aç" onPress={()=>open('toolsHub')}/>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:10,paddingBottom:4}}>
        <Tap
          onPress={()=>open('kickCounter')}
          label="Tekme sayacını aç"
          style={{width:145,padding:14,borderRadius:18,backgroundColor:'#FAF1F5',borderWidth:1,borderColor:'#F0DFE8',...shadow}}
        >
          <View style={{width:38,height:38,borderRadius:19,backgroundColor:'white',alignItems:'center',justifyContent:'center',marginBottom:8}}>
            {generatedAssets['card_kick_counter'] ? (
              <Image source={generatedAssets['card_kick_counter']} style={{width:30,height:30}} resizeMode="contain"/>
            ) : (
              <Icon name="footprint" size={20} color="#9A5B80"/>
            )}
          </View>
          <T bold style={{fontSize:13,color:'#632D4C'}}>Tekme Sayacı</T>
          <T style={{fontSize:10,color:'#91637F',marginTop:2}}>10 tekme seansı</T>
        </Tap>

        <Tap
          onPress={()=>open('contractionTimer')}
          label="Kasılma sayacını aç"
          style={{width:145,padding:14,borderRadius:18,backgroundColor:'#F0F6FB',borderWidth:1,borderColor:'#DDE9F3',...shadow}}
        >
          <View style={{width:38,height:38,borderRadius:19,backgroundColor:'white',alignItems:'center',justifyContent:'center',marginBottom:8}}>
            {generatedAssets['card_contractions'] ? (
              <Image source={generatedAssets['card_contractions']} style={{width:30,height:30}} resizeMode="contain"/>
            ) : (
              <Icon name="contraction" size={20} color="#4F79A1"/>
            )}
          </View>
          <T bold style={{fontSize:13,color:'#274969'}}>Kasılma Sayacı</T>
          <T style={{fontSize:10,color:'#567594',marginTop:2}}>Süre & aralık</T>
        </Tap>

        <Tap
          onPress={()=>open('hospitalBag')}
          label="Hastane çantasını aç"
          style={{width:145,padding:14,borderRadius:18,backgroundColor:'#F4EEF7',borderWidth:1,borderColor:'#E7DAED',...shadow}}
        >
          <View style={{width:38,height:38,borderRadius:19,backgroundColor:'white',alignItems:'center',justifyContent:'center',marginBottom:8}}>
            {generatedAssets['card_hospital_bag'] ? (
              <Image source={generatedAssets['card_hospital_bag']} style={{width:30,height:30}} resizeMode="contain"/>
            ) : (
              <Icon name="bag" size={20} color="#7C5292"/>
            )}
          </View>
          <T bold style={{fontSize:13,color:'#452A56'}}>Doğum Çantası</T>
          <T style={{fontSize:10,color:'#7A6588',marginTop:2}}>Anne, bebek & refakatçi</T>
        </Tap>

        <Tap
          onPress={()=>open('weight')}
          label="Kilo takibini aç"
          style={{width:145,padding:14,borderRadius:18,backgroundColor:'#EBF3EE',borderWidth:1,borderColor:'#D7E8DD',...shadow}}
        >
          <View style={{width:38,height:38,borderRadius:19,backgroundColor:'white',alignItems:'center',justifyContent:'center',marginBottom:8}}>
            {generatedAssets['card_scale'] ? (
              <Image source={generatedAssets['card_scale']} style={{width:30,height:30}} resizeMode="contain"/>
            ) : (
              <Icon name="scale" size={20} color="#4F8464"/>
            )}
          </View>
          <T bold style={{fontSize:13,color:'#284F38'}}>Kilo Takibi</T>
          <T style={{fontSize:10,color:'#567E67',marginTop:2}}>Haftalık eğilim</T>
        </Tap>
      </ScrollView>
    </View>

    {/* ─── 11. HAFTANIN UZMAN REHBERLERİ ─── */}
    <View style={{marginTop:8}}>
      <Section title="Haftanın Seçilmiş Rehberleri" action="Tümünü gör" onPress={()=>open('topicHub')}/>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:12,paddingBottom:4}}>
        {articles.filter(a=>a.topic==='pregnancy'||a.topic==='nutrition'||a.topic==='wellbeing').slice(0,4).map(art=>(
          <Tap
            key={art.id}
            onPress={()=>open('editorialArticle',{article:art})}
            label={art.title}
            style={{width:220,borderRadius:18,backgroundColor:'#FFFFFF',overflow:'hidden',borderWidth:1,borderColor:'#EBE2EB',...shadow}}
          >
            {(() => {
              const coverImg = generatedAssets[art.image] || getAsset(art.image);
              return coverImg ? (
                <View style={{height:110,backgroundColor:'#F2EBF4'}}>
                  <Image source={coverImg} style={StyleSheet.absoluteFill} resizeMode="cover"/>
                  <View style={{position:'absolute',top:8,right:8,backgroundColor:'#00000077',paddingHorizontal:7,paddingVertical:2,borderRadius:8}}>
                    <T style={{fontSize:10,color:'white'}}>⏱️ {art.minutes} dk</T>
                  </View>
                </View>
              ) : null;
            })()}
            <View style={{padding:12}}>
              <T bold numberOfLines={2} style={{fontSize:13,color:colors.ink,lineHeight:18}}>{art.title}</T>
              <T numberOfLines={1} style={{fontSize:11,color:colors.muted,marginTop:4}}>{art.subtitle}</T>
            </View>
          </Tap>
        ))}
      </ScrollView>
    </View>
  </Page>;
}

export function Postpartum({state,update,open}) {
  const [tab,setTab]=useState('Bugün');
  const tasks=['Bol sıvı tüket','Hafif yürüyüş yap','Pelvik taban egzersizlerini yap','Kendine zaman ayır','Destek al, yalnız değilsin 💜'];
  return <Page>
    <View style={s.topline}><View><T bold style={s.pageTitle}>Lohusalık · 12. gün</T><T style={s.subtitle}>Bugünü küçük adımlarla toparlayalım 🌸</T></View><RoundButton icon="down" label="Yolculuğunu değiştir" onPress={()=>open('journey')}/></View>
    <Tabs items={['Bugün','İyileşme','Ruh Halim','Notlar']} active={tab} onChange={setTab}/>
    {tab==='Bugün'||tab==='Ruh Halim'?<Card style={{padding:13}}><MoodPicker postpartum value={state.postpartumMood} onChange={postpartumMood=>update({postpartumMood})}/>{tab==='Bugün'&&<View style={[s.row,{gap:10,marginTop:16,paddingTop:12,borderTopWidth:1,borderColor:colors.line}]}><SmallStat title="Uyku" value="6 sa 20 dk" icon="moon" tint="#F0EAF5" onPress={()=>open('log',{type:'Uyku'})}/><SmallStat title="Su" value={`${state.water}/8 bardak`} icon="drop" tint="#E6F0F4" onPress={()=>update(old=>({water:Math.min(8,old.water+1)}))}/></View>}</Card>:null}
    {(tab==='Bugün'||tab==='İyileşme')&&<><Card style={{padding:13}}><T bold style={{fontSize:16}}>Bugün yapabileceklerin</T><T style={s.taskMeta}>{state.tasks.filter(Boolean).length}/5 tamamlandı</T>{tasks.map((task,i)=><Tap key={task} label={task} accessibilityRole="checkbox" accessibilityState={{checked:state.tasks[i]}} onPress={()=>update(old=>({tasks:old.tasks.map((v,n)=>n===i?!v:v)}))} style={s.task}><View style={[s.checkbox,state.tasks[i]&&{backgroundColor:colors.sage,borderColor:colors.sage}]}>{state.tasks[i]&&<Icon name="check" color="white" size={16}/>}</View><T style={s.taskText}>{task}</T><Icon name="chevron" size={18} color={colors.muted}/></Tap>)}</Card><Card style={{padding:14}}><View style={s.topline}><T bold>İyileşme yolculuğun</T><Icon name="leaf" color={colors.sage} fill="#9FB7A4" size={28}/></View><View style={[s.row,{gap:12,marginTop:10}]}><Progress value={state.tasks.filter(Boolean).length*20} style={{flex:1}}/><T style={{fontSize:13}}>%{state.tasks.filter(Boolean).length*20}</T></View><T style={{fontSize:12,color:colors.muted,marginTop:9}}>Her gün biraz daha güçleniyorsun.</T></Card></>}
    {tab==='Notlar'&&<><Section title="Sana ait küçük notlar" action="Not ekle" onPress={()=>open('note')}/>{state.notes.length?state.notes.map(n=><Card key={n.id}><T style={{lineHeight:23}}>{n.text}</T></Card>):<Card><T style={{lineHeight:23}}>Bir his, küçük bir an, doktoruna sormak istediğin bir soru… Hepsine burada yer var.</T><Tap onPress={()=>open('note')} style={s.primary}><T style={{color:'white'}}>İlk notunu ekle</T></Tap></Card>}</>}
  </Page>;
}

const babyActions=[
  {type:'Emzirme',key:'btn_nursing',icon:'nursing',bg:'#FCF4F7',border:'#F5E1EC',titleColor:'#6E3958',sub:'Sağ meme • 15 dk'},
  {type:'Biberon',key:'btn_bottle',icon:'bottle',bg:'#F7F4FB',border:'#EBE1F8',titleColor:'#523977',sub:'120 ml'},
  {type:'Uyku',key:'btn_sleep',icon:'moon',bg:'#F2F5FB',border:'#DFE8F8',titleColor:'#38517B',sub:'1 sa 20 dk'},
  {type:'Bez',key:'btn_diaper',icon:'diaper',bg:'#F2F7F4',border:'#DDEEE4',titleColor:'#305D44',sub:'Temiz'}
];
export const sampleRecords=[{id:'s1',type:'Emzirme',value:'Sağ meme • 15 dk',time:'19:20'},{id:'s2',type:'Bez',value:'Temiz',time:'17:10'},{id:'s3',type:'Uyku',value:'1 sa 20 dk',time:'15:30'},{id:'s4',type:'Biberon',value:'120 ml',time:'13:10'}];
export function RecordList({records}) {return <View>{records.map(r=>{const a=babyActions.find(a=>a.type===r.type)||{icon:'heart',color:colors.purple};return <View key={r.id} style={s.record}><T style={s.recordTime}>{r.time}</T><View style={[s.recordIcon,{backgroundColor:a.titleColor+'22'}]}>{generatedAssets[a.key] ? <Image source={generatedAssets[a.key]} style={{width:24,height:24}} resizeMode="contain"/> : <Icon name={a.icon} size={23} color={a.titleColor}/>}</View><View style={{flex:1}}><T bold style={{fontSize:14}}>{r.type}</T><T style={s.recordValue}>{r.value}</T></View></View>})}</View>}
export function Baby({state,open}) {
  const records=[...state.records,...sampleRecords].slice(0,4);
  return <Page>
    <View style={s.topline}><View style={s.row}><View style={s.avatar}><Image source={assets.baby} style={s.avatarImage} resizeMode="cover"/></View><View style={{marginLeft:12}}><T bold style={{fontSize:19}}>{state.babyName} · 6 haftalık</T><T style={{fontSize:13,color:colors.muted,marginTop:7}}>Bugünün bakım ritmi</T></View></View><RoundButton icon="down" label="Yolculuğunu değiştir" onPress={()=>open('journey')}/></View>
    <View style={s.babyGrid}>
      {babyActions.map(a=>(
        <Tap
          key={a.type}
          onPress={() => {
            if (a.type === 'Emzirme' || a.type === 'Biberon') open('nursingTimer');
            else if (a.type === 'Uyku') open('sleepWhiteNoise');
            else if (a.type === 'Bez') open('diaperTracker');
            else open('log', { type: a.type });
          }}
          label={a.type+' kaydı ekle'}
          style={s.babyAction}
        >
          <View style={[s.babyCard, { backgroundColor: a.bg, borderColor: a.border }]}>
            <View style={s.babyHeroBox}>
              {generatedAssets[a.key] ? (
                <Image source={generatedAssets[a.key]} style={s.babyHeroImg} resizeMode="contain"/>
              ) : (
                <Icon name={a.icon} color={a.titleColor} size={50} strokeWidth={1.4}/>
              )}
            </View>
            <T bold style={[s.babyCardTitle, { color: a.titleColor }]}>{a.type}</T>
            <T style={s.babyCardSub}>{a.sub}</T>
          </View>
        </Tap>
      ))}
    </View>
    <Section title="Bugünkü kayıtlar" action="Tümünü gör" onPress={()=>open('records')}/><RecordList records={records}/>
    <Tap onPress={()=>open('sleepWhiteNoise')} style={s.nextSleep}><View style={s.sleepIcon}>{generatedAssets['banner_next_sleep'] ? <Image source={generatedAssets['banner_next_sleep']} style={{width:54,height:54}} resizeMode="contain"/> : <Icon name="moon" size={42} color="white" fill="#AE98D4"/>}</View><View style={{flex:1}}><T style={{fontSize:13}}>Bir sonraki uyku zamanı</T><T bold style={{fontSize:22,marginTop:5}}>1 sa 15 dk</T><T style={{fontSize:11,marginTop:6}}>{state.babyName} genellikle 21:00 civarı uyuyor. Beyaz gürültü aç →</T></View></Tap>

    {/* Bebek Bakım Rehberleri */}
    <View style={{marginTop:10}}>
      <Section title="Bebek Bakımı & Gelişim Rehberleri" action="Tümünü gör" onPress={()=>open('topicHub')}/>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:12,paddingBottom:4}}>
        {articles.filter(a=>a.topic==='baby'||a.topic==='postpartum').slice(0,5).map(art=>(
          <Tap
            key={art.id}
            onPress={()=>open('editorialArticle',{article:art})}
            label={art.title}
            style={{width:220,borderRadius:18,backgroundColor:'#FFFFFF',overflow:'hidden',borderWidth:1,borderColor:'#EBE2EB',...shadow}}
          >
            {(() => {
              const coverImg = generatedAssets[art.image] || getAsset(art.image);
              return coverImg ? (
                <View style={{height:110,backgroundColor:'#EEF4F7'}}>
                  <Image source={coverImg} style={StyleSheet.absoluteFill} resizeMode="cover"/>
                  <View style={{position:'absolute',top:8,right:8,backgroundColor:'#00000077',paddingHorizontal:7,paddingVertical:2,borderRadius:8}}>
                    <T style={{fontSize:10,color:'white'}}>⏱️ {art.minutes} dk</T>
                  </View>
                </View>
              ) : null;
            })()}
            <View style={{padding:12}}>
              <T bold numberOfLines={2} style={{fontSize:13,color:colors.ink,lineHeight:18}}>{art.title}</T>
              <T numberOfLines={1} style={{fontSize:11,color:colors.muted,marginTop:4}}>{art.subtitle}</T>
            </View>
          </Tap>
        ))}
      </ScrollView>
    </View>
  </Page>;
}

export function Discover({state,update,open}) {
  return <Page contentStyle={{gap:12}}>
    <TopicHubScreen
      openArticle={(article) => open('editorialArticle', { article })}
      openFoodChecker={() => open('foodSafety')}
    />
  </Page>;
}

export function Assistant({state,update,open,toast}) {
  return <Page contentStyle={{paddingHorizontal:0}}>
    <CommunityHub state={state} update={update} open={open} toast={toast} />
  </Page>;
}

const s=StyleSheet.create({
  row:{flexDirection:'row',alignItems:'center'},topline:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  onboarding:{paddingHorizontal:23,paddingTop:44,paddingBottom:24,gap:0},brand:{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:8},wordmark:{fontSize:29,fontWeight:'300',letterSpacing:-0.7},
  welcome:{alignItems:'center',marginTop:29,marginBottom:35},welcomeTitle:{fontSize:26,letterSpacing:-0.5},welcomeText:{textAlign:'center',fontSize:15,lineHeight:22,marginTop:10},
  journey:{minHeight:145,borderRadius:25,overflow:'hidden',flexDirection:'row',alignItems:'center',paddingRight:14,borderWidth:1,borderColor:'#EDE1E2',...shadow},journeyPhoto:{position:'absolute',left:0,top:0,bottom:0,width:140,overflow:'hidden'},journeyImage:{width:230,height:154,position:'absolute',left:-12,top:0},journeyCopy:{marginLeft:132,flex:1,paddingVertical:20},journeyTitle:{fontSize:18,lineHeight:24},journeySub:{fontSize:13,lineHeight:20,marginTop:7},motto:{alignItems:'center',marginTop:30,gap:7},handwritten:{fontFamily:fonts.script,fontSize:23,lineHeight:25,color:'#9A8495',textAlign:'center'},
  subtitle:{color:'#8C6B94',fontSize:15,marginTop:5},iconHit:{width:42,height:42,justifyContent:'center',alignItems:'center'},pageTitle:{fontSize:25,letterSpacing:-0.5},
  weekStrip:{flexDirection:'row',gap:7,paddingBottom:4},weekPill:{minWidth:58,alignItems:'center',paddingVertical:8,paddingHorizontal:6,borderRadius:20,backgroundColor:'#EEE8E6'},weekActive:{backgroundColor:'#A28ABB',shadowColor:'#9A80B4',shadowOpacity:0.35,shadowRadius:6,shadowOffset:{width:0,height:2}},
  // Comparison hero & tabs
  compHeroCard:{gap:8},
  compTabs:{flexDirection:'row',backgroundColor:'#EDE4F2',borderRadius:16,padding:3,gap:4},
  compTab:{flex:1,paddingVertical:6,alignItems:'center',justifyContent:'center',borderRadius:13},
  compTabActive:{backgroundColor:'#FFFFFF',shadowColor:'#6B4373',shadowOpacity:0.12,shadowRadius:4,shadowOffset:{width:0,height:2}},
  compTabLabel:{fontSize:11,color:'#886E91',fontFamily:fonts.bold},
  compTabLabelActive:{color:'#5A3366'},
  usBadge:{marginLeft:8,backgroundColor:'#695773',paddingHorizontal:7,paddingVertical:2,borderRadius:10},
  usBadgeText:{color:'#FFFFFF',fontSize:10,fontFamily:fonts.bold},
  // Fruit hero
  fruitHero:{borderRadius:24,overflow:'hidden',backgroundColor:'#F7F0FA',borderWidth:1,borderColor:'#EDE0EF',flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingLeft:18,paddingRight:8,paddingVertical:16,...shadow},
  fruitHeroLeft:{flex:1,paddingRight:8},
  fruitWeekNum:{fontSize:22,letterSpacing:-0.5,color:'#4A2860'},
  fruitMeta:{fontSize:12,color:'#9A779A',marginTop:3},
  fruitStats:{flexDirection:'row',gap:14,marginTop:10},
  fruitStat:{flexDirection:'row',alignItems:'center',gap:5},
  fruitStatVal:{fontSize:12,color:'#6A4878'},
  progressTrack:{height:6,backgroundColor:'#E5D8EE',borderRadius:4,overflow:'hidden'},
  progressFill:{height:'100%',backgroundColor:'#A28ABB',borderRadius:4},
  fruitHeroBtn:{flexDirection:'row',alignItems:'center',gap:4,marginTop:12},
  fruitRight:{alignItems:'center',paddingRight:6},
  fruitName:{fontSize:12,color:'#6A4878',marginTop:5,fontFamily:fonts.bold},
  fruitSub:{fontSize:10,color:'#9A779A'},
  // Bullet list
  bullet:{width:6,height:6,borderRadius:3,backgroundColor:'#C4A8D0',marginTop:6},
  seeMore:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:12,paddingTop:12,borderTopWidth:1,borderColor:'#EDE5F0'},
  // Legacy (kept for postpartum / baby / etc.)
  hero:{height:283,borderRadius:22,overflow:'hidden',backgroundColor:'#9C7789'},heroTitle:{fontSize:25,color:'white',letterSpacing:-0.3},heroTrimester:{fontSize:15,color:'white',marginTop:4},heroBottom:{position:'absolute',left:16,right:14,bottom:13},heroCaption:{color:'white',fontSize:13,lineHeight:17,textShadowColor:'#6A485A',textShadowRadius:2,textShadowOffset:{width:0,height:1}},heroBottomRow:{flexDirection:'row',alignItems:'center',gap:12,marginTop:4},melon:{width:62,height:55,alignItems:'center',justifyContent:'center'},heroLink:{flex:1,borderRadius:24,paddingHorizontal:14,paddingVertical:12,backgroundColor:'#FFFAF0E8',flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  appointment:{backgroundColor:'#F2EBF4',borderRadius:19,padding:15,flexDirection:'row',alignItems:'center'},appointmentIcon:{height:49,width:49,borderRadius:25,borderWidth:1.5,borderColor:'#CEC0E2',alignItems:'center',justifyContent:'center',backgroundColor:'#F7F2FA'},
  reminder:{minHeight:90,borderRadius:18,padding:10,flexDirection:'row',alignItems:'center',gap:8},reminderTitle:{fontSize:12},reminderSub:{fontSize:11,lineHeight:16,marginTop:7},
  taskMeta:{fontSize:12,color:colors.muted,marginTop:6,marginBottom:8},task:{flexDirection:'row',alignItems:'center',gap:11,paddingVertical:12,borderTopWidth:1,borderColor:'#F1EAE6'},checkbox:{width:22,height:22,borderRadius:12,borderWidth:1,borderColor:'#9B9CA0',alignItems:'center',justifyContent:'center'},taskText:{flex:1,fontSize:14,color:'#555460'},primary:{backgroundColor:colors.purple,borderRadius:18,padding:16,alignItems:'center',marginTop:20},
  avatar:{width:65,height:65,borderRadius:34,overflow:'hidden',borderWidth:2,borderColor:'#E6DACE',backgroundColor:'#EAE8E0'},avatarImage:{width:122,height:81,position:'absolute',left:-8,top:-2},
  babyGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:12,marginTop:6,marginBottom:4},
  babyAction:{width:'48%'},
  babyCard:{borderRadius:24,borderWidth:1.5,paddingVertical:18,paddingHorizontal:10,alignItems:'center',justifyContent:'center',...shadow},
  babyHeroBox:{width:84,height:84,alignItems:'center',justifyContent:'center',marginBottom:6},
  babyHeroImg:{width:84,height:84},
  babyCardTitle:{fontSize:16,letterSpacing:-0.3},
  babyCardSub:{fontSize:11,color:colors.muted,marginTop:3},
  record:{flexDirection:'row',alignItems:'center',gap:11,paddingVertical:10,borderTopWidth:1,borderColor:colors.line},recordTime:{fontSize:13,width:44},recordIcon:{width:38,height:38,borderRadius:19,alignItems:'center',justifyContent:'center'},recordValue:{fontSize:12,color:'#666175',marginTop:4},nextSleep:{backgroundColor:'#EEE5F5',borderRadius:19,padding:15,flexDirection:'row',alignItems:'center',gap:16,marginTop:4},sleepIcon:{height:50,width:50,borderRadius:25,backgroundColor:'#B9A2D9',alignItems:'center',justifyContent:'center'},
  search:{flexDirection:'row',alignItems:'center',gap:9,backgroundColor:'#EFEAE6',borderRadius:24,paddingHorizontal:14,minHeight:44},searchInput:{flex:1,fontFamily:fonts.regular,color:colors.ink,fontSize:13,paddingVertical:10,outlineStyle:'none'},article:{height:184,borderRadius:20,overflow:'hidden',backgroundColor:'#ECDED3'},articleImage:{position:'absolute',width:370,height:247,right:-170,top:-20,transform:[{scaleX:-1}]},articleTag:{position:'absolute',top:16,left:15,fontSize:11,color:'#686266',backgroundColor:'#FFFCF9EE',borderRadius:15,paddingHorizontal:12,paddingVertical:6},articleCopy:{position:'absolute',left:15,bottom:17},articleArrow:{position:'absolute',right:12,bottom:13,width:30,height:30,borderRadius:15,backgroundColor:'#FFFCF9',alignItems:'center',justifyContent:'center'},
  categories:{flexDirection:'row',flexWrap:'wrap',gap:10},category:{width:'48%',flexGrow:1,alignItems:'center',paddingVertical:6,borderRadius:14,borderWidth:1.5},product:{flex:1,borderWidth:1,borderColor:colors.line,borderRadius:16,padding:11,backgroundColor:'#FFFCF8',...shadow},productPlus:{position:'absolute',right:10,top:22,width:28,height:28,borderRadius:14,backgroundColor:'white',alignItems:'center',justifyContent:'center',...shadow},
  assistantHeader:{alignItems:'center',paddingTop:0,paddingBottom:7},assistantTitle:{fontSize:23,color:'#77518F',marginTop:5},bubble:{borderRadius:24,padding:17,backgroundColor:'#FEFBF8'},prompt:{borderWidth:1,borderColor:'#DED4D8',borderRadius:24,paddingVertical:12,paddingHorizontal:17,flexDirection:'row',alignItems:'center',backgroundColor:'#FCF9F5'},messageInput:{borderRadius:28,borderWidth:1,borderColor:'#DED5D5',flexDirection:'row',alignItems:'center',paddingLeft:17,paddingRight:6,minHeight:49,marginTop:11,backgroundColor:'#FFFCF9',...shadow},send:{height:33,width:33,borderRadius:20,backgroundColor:'#A0839E',alignItems:'center',justifyContent:'center'},sentMessage:{borderRadius:15,backgroundColor:'#F0E8F3',padding:12},smallAvatar:{width:32,height:32,borderRadius:16,overflow:'hidden'},postPhoto:{width:81,height:77,borderRadius:12,overflow:'hidden'},
});
