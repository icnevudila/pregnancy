import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Image, StyleSheet, TextInput, Keyboard, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { assets, colors, fonts, shadow } from './theme';
import { Icon, BrandMark, ProductArt, FruitArt, ComparisonArt } from './Icons';
import { generatedAssets, getAsset } from './generatedAssets';
import { T, Tap, Card, RoundButton, Section, Tabs, MoodPicker, Progress, SmallStat, Page, ScreenHero, ToolExperienceCard, CleanIcon, HorizontalScroll } from './ui';
import { getWeekInfo, formatWeight, formatLength, trimesterLabel, monthLabel, pregnancyProgress, TOTAL_WEEKS } from './weekData';
import { usePulse, useCrossFade } from './anim';
import { articles, searchArticles, searchFaqs } from './content';
import { getLocalizedArticle } from './articleTranslationsEn';
import { TopicHubScreen } from './ExploreScreens';
import { CommunityHub } from './CommunityScreens';
import { getBabyLetterForWeek } from './babyLettersData';
import { t } from './i18n/index.js';
import { calculateDueDateFromWeek, resolveJourneyState, calculatePostpartumProgress } from './domain/journeyState';
import { createTrackerRecord, TrackerTypes } from './domain/trackerEngine';

export const getJourneys = (lang = 'tr') => [
  { key: 'pregnancy', title: lang === 'en' ? "I'm Pregnant" : 'Hamileyim', sub: lang === 'en' ? 'Preparing to meet\nmy baby' : 'Bebeğimle tanışmaya\nhazırlanıyorum', image: assets.pregnancy, tint: '#F5E7E8' },
  { key: 'postpartum', title: lang === 'en' ? 'Recently Delivered' : 'Yeni doğum yaptım', sub: lang === 'en' ? 'Be by my side in\npostpartum recovery' : 'Lohusalık sürecimde\nyanımda ol', image: assets.mother, tint: '#F5E5E7' },
  { key: 'baby', title: lang === 'en' ? 'Raising My Baby' : 'Bebeğimi\nbüyütüyorum', sub: lang === 'en' ? 'Together every single day' : 'Her gününde birlikte', image: assets.baby, tint: '#EAEAE3' },
];
export const journeys = getJourneys('tr');

export function Onboarding({ choose, update, toast, lang = 'tr', setPage, state }) {
  const isEn = lang === 'en';
  const [role, setRole] = useState('mother'); // 'mother' | 'father'
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [pendingJourney, setPendingJourney] = useState('pregnancy');
  const [babyNameInput, setBabyNameInput] = useState(isEn ? 'Maya' : 'Ada');
  const [selectedOnboardingWeek, setSelectedOnboardingWeek] = useState(24);
  const [deliveryTypeChoice, setDeliveryTypeChoice] = useState('vaginal');
  const [babyAgeChoice, setBabyAgeChoice] = useState(14);
  const [supportStyle, setSupportStyle] = useState('gentle');
  const [careFocus, setCareFocus] = useState('daily');
  const [prepDone, setPrepDone] = useState(false);
  const [prepProgress, setPrepProgress] = useState(0);
  const [showSyncInput, setShowSyncInput] = useState(false);
  const [partnerCode, setPartnerCode] = useState('');

  const motherJourneys = [
    {
      key: 'pregnancy',
      title: isEn ? "I'm Pregnant" : 'Hamileyim',
      sub: isEn ? 'Preparing to meet\nmy baby' : 'Bebeğimle tanışmaya\nhazırlanıyorum',
      image: generatedAssets.onboarding_mother_pregnancy || generatedAssets.onboarding_hero_pregnancy || assets.pregnancy,
      tint: '#F5E7E8'
    },
    {
      key: 'postpartum',
      title: isEn ? 'Recently Delivered' : 'Yeni doğum yaptım',
      sub: isEn ? 'Be by my side in\npostpartum recovery' : 'Lohusalık sürecimde\nyanımda ol',
      image: generatedAssets.onboarding_mother_postpartum || generatedAssets.onboarding_postpartum_recovery || assets.mother,
      tint: '#F5E5E7'
    },
    {
      key: 'baby',
      title: isEn ? 'Raising My Baby' : 'Bebeğimi\nbüyütüyorum',
      sub: isEn ? 'Together every single day' : 'Her gününde birlikte',
      image: generatedAssets.onboarding_mother_baby || generatedAssets.onboarding_first_baby_journey || assets.baby,
      tint: '#EAEAE3'
    },
  ];

  const fatherJourneys = [
    {
      key: 'pregnancy',
      title: isEn ? 'Expecting Our Baby' : 'Bebeğimizi Bekliyoruz',
      sub: isEn ? 'By my partner’s side,\npreparing together' : 'Eşimin yanında, bebeğimizle\ntanışmaya hazırlanıyorum',
      image: generatedAssets.onboarding_father_pregnancy || generatedAssets.onboarding_partner_together || assets.pregnancy,
      tint: '#EBF2F7'
    },
    {
      key: 'postpartum',
      title: isEn ? 'Postpartum Support' : 'Lohusalık Desteği',
      sub: isEn ? 'Best support for partner\nand our newborn' : 'Eşime ve bebeğime lohusalıkta\nen iyi desteği veriyorum',
      image: generatedAssets.onboarding_father_postpartum || generatedAssets.onboarding_father_mode || assets.mother,
      tint: '#EAF0F6'
    },
    {
      key: 'baby',
      title: isEn ? 'Raising Our Baby' : 'Bebeğimizi Büyütüyoruz',
      sub: isEn ? 'Tracking growth together\nevery day' : 'Gelişimini her gün\nbirlikte takip ediyoruz',
      image: generatedAssets.onboarding_father_baby || generatedAssets.onboarding_first_baby_journey || assets.baby,
      tint: '#ECEEE7'
    },
  ];

  const currentJourneys = role === 'father' ? fatherJourneys : motherJourneys;

  const selectedJourneyCopy = currentJourneys.find(j => j.key === pendingJourney) || currentJourneys[0];
  const journeyDetailCopy = {
    pregnancy: isEn ? `Week ${selectedOnboardingWeek} pregnancy plan is prepared.` : `${selectedOnboardingWeek}. hafta gebelik planı hazırlandı.`,
    postpartum: isEn ? `${deliveryTypeChoice === 'cesarean' ? 'Cesarean' : 'Vaginal'} postpartum recovery rhythm is prepared.` : `${deliveryTypeChoice === 'cesarean' ? 'Sezaryen' : 'Normal doğum'} lohusalık ritmi hazırlandı.`,
    baby: isEn ? `${babyAgeChoice}-day baby care rhythm is prepared.` : `${babyAgeChoice} günlük bebek bakım ritmi hazırlandı.`,
  };
  const detailTitle = {
    pregnancy: isEn ? 'Which pregnancy week are you in?' : 'Hamileliğin kaçıncı haftası?',
    postpartum: isEn ? 'How should recovery be shaped?' : 'Toparlanma nasıl şekillensin?',
    baby: isEn ? 'How old is your baby?' : 'Bebeğin kaç günlük?',
  };
  const detailSub = {
    pregnancy: isEn ? 'Momora adjusts weekly growth, articles and trackers around this week.' : 'Momora haftalık gelişimi, yazıları ve takipleri bu haftaya göre ayarlar.',
    postpartum: isEn ? 'Recovery cards and reminders change by birth type.' : 'Toparlanma kartları ve hatırlatmalar doğum tipine göre değişir.',
    baby: isEn ? 'Sleep, feeding and care rhythm start from baby age.' : 'Uyku, beslenme ve bakım ritmi bebek yaşına göre başlar.',
  };
  const focusOptions = {
    pregnancy: [
      ['daily', isEn ? 'Weekly growth' : 'Haftalık gelişim', isEn ? 'Baby size, letters, trimester cards' : 'Bebek boyutu, mektuplar, trimester kartları'],
      ['tools', isEn ? 'Pregnancy trackers' : 'Gebelik takipleri', isEn ? 'Kick, symptoms, appointment prep' : 'Tekme, belirti, randevu hazırlığı'],
      ['calm', isEn ? 'Birth calm' : 'Doğum sakinliği', isEn ? 'Breath, affirmations, soft audio' : 'Nefes, olumlama, yumuşak ses']
    ],
    postpartum: [
      ['daily', isEn ? 'Recovery rhythm' : 'Toparlanma ritmi', isEn ? 'Hydration, rest, gentle daily cards' : 'Sıvı, dinlenme, nazik günlük kartlar'],
      ['tools', isEn ? 'Postpartum tools' : 'Lohusa araçları', isEn ? 'Mood, notes, checklists' : 'Ruh hali, notlar, kontrol listeleri'],
      ['calm', isEn ? 'Soft reset' : 'Yumuşak reset', isEn ? 'Short calm sessions for hard moments' : 'Zor anlar için kısa sakinlik seansları']
    ],
    baby: [
      ['daily', isEn ? 'Baby routine' : 'Bebek rutini', isEn ? 'Sleep, feed, diaper rhythm' : 'Uyku, beslenme, bez ritmi'],
      ['tools', isEn ? 'Care tools' : 'Bakım araçları', isEn ? 'Timers, growth, care logs' : 'Sayaçlar, büyüme, bakım kayıtları'],
      ['calm', isEn ? 'Sleep sounds' : 'Uyku sesleri', isEn ? 'Lullaby, rain, womb and lo-fi calm' : 'Ninni, yağmur, anne karnı ve lo-fi sakinlik']
    ],
  };
  const supportOptions = role === 'father'
    ? [['gentle', isEn ? 'Gentle support' : 'Nazik destek'], ['tasks', isEn ? 'Task partner' : 'Görev ortağı'], ['emotional', isEn ? 'Emotional anchor' : 'Duygusal destek']]
    : [['gentle', isEn ? 'Gentle reminders' : 'Nazik hatırlatma'], ['tasks', isEn ? 'Clear tasks' : 'Net görevler'], ['emotional', isEn ? 'Emotional care' : 'Duygusal bakım']];
  const focusCopy = {
    daily: isEn ? 'Daily letters, reminders and week cards are prioritized.' : 'Günlük mektuplar, hatırlatmalar ve hafta kartları öne alındı.',
    tools: isEn ? 'Kick, contraction, bag and practical trackers are placed closer.' : 'Tekme, sancı, çanta ve pratik takipler daha yakına alındı.',
    calm: isEn ? 'Breath, affirmations and calm sound scenes are ready for quick access.' : 'Nefes, olumlama ve sakin ses sahneleri hızlı erişime hazırlandı.',
  };
  const roleReadyText = role === 'father'
    ? (isEn ? 'Partner support mode is ready.' : 'Baba ve eş desteği modu hazırlandı.')
    : (isEn ? 'Mother care mode is ready.' : 'Anne bakım modu hazırlandı.');

  const preparationItems = [
    roleReadyText.replace('hazırlandı.', 'hesaplanıyor.').replace('is ready.', 'is being calculated.'),
    journeyDetailCopy[pendingJourney].replace('hazırlandı.', 'ölçülüyor.').replace('is prepared.', 'is being measured.'),
    focusCopy[careFocus].replace('öne alındı.', 'sıralanıyor.').replace('hazırlandı.', 'yerleştiriliyor.').replace('prioritized.', 'being prioritized.').replace('ready for quick access.', 'being placed for quick access.'),
    isEn ? 'Daily reminders and first cards are being synchronized.' : 'Günlük hatırlatmalar ve ilk kartlar senkronize ediliyor.',
    isEn ? 'Calm sounds, breath cues and tool shortcuts are being prepared.' : 'Sakin sesler, nefes komutları ve araç kısayolları hazırlanıyor.',
  ];

  useEffect(() => {
    if (onboardingStep !== 4) return;
    setPrepDone(false);
    setPrepProgress(0);
    let value = 0;
    const timer = setInterval(() => {
      value = Math.min(100, value + 8 + Math.round(Math.random() * 9));
      setPrepProgress(value);
      if (value >= 100) {
        clearInterval(timer);
        setTimeout(() => setPrepDone(true), 260);
      }
    }, 180);
    return () => clearInterval(timer);
  }, [onboardingStep, pendingJourney, role, careFocus, supportStyle]);

  function selectJourney(key) {
    const defaultDueDate = calculateDueDateFromWeek(selectedOnboardingWeek, 5);
    const guestUser = {
      id: role === 'father' ? 'usr_local_father' : 'usr_local_mother',
      displayName: role === 'father' ? (isEn ? 'Alex' : 'Mehmet') : (isEn ? 'Emma' : 'Zeynep'),
      locale: lang,
      activeRole: role,
      isGuest: true,
    };
    const household = {
      id: 'hh_local_1',
      name: role === 'father' ? (isEn ? 'Alex & Emma' : 'Mehmet & Zeynep') : (isEn ? 'Emma & Alex' : 'Zeynep & Mehmet'),
      members: [
        { id: guestUser.id, role, name: guestUser.displayName },
        { id: 'usr_partner_1', role: role === 'father' ? 'mother' : 'father', name: role === 'father' ? (isEn ? 'Emma' : 'Zeynep') : (isEn ? 'Alex' : 'Mehmet') },
      ],
      inviteCode: 'MOM-7829-TR',
    };
    const pregnancy = {
      id: 'prg_local_1',
      dueDate: defaultDueDate,
      status: key === 'pregnancy' ? 'active' : 'completed',
    };
    const baby = {
      id: 'bby_local_1',
      name: babyNameInput.trim() || (isEn ? 'Maya' : 'Ada'),
      birthDate: key === 'baby' ? new Date(Date.now() - babyAgeChoice * 86400000).toISOString().slice(0, 10) : '',
      sex: 'female',
    };
    const postpartumProfile = {
      id: 'post_local_1',
      birthDate: key === 'postpartum' ? new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10) : '',
      deliveryType: deliveryTypeChoice,
    };

    if (update) {
      update({
        role,
        mode: key,
        hasCompletedOnboarding: true,
        user: guestUser,
        household,
        pregnancy,
        baby,
        postpartumProfile,
        name: guestUser.displayName,
        partnerName: household.members[1].name,
        partnerRole: household.members[1].role,
        partnerConnected: true,
        week: key === 'pregnancy' ? selectedOnboardingWeek : 40,
        day: 5,
        onboardingFocus: careFocus,
        supportStyle,
      });
    }
    toast && toast(role === 'father'
      ? (isEn ? 'Welcome Dad! 👨‍🍼 Your family journey has begun.' : 'Hoş geldin Baba! 👨‍🍼 Ortak yolculuğunuz başladı.')
      : (isEn ? 'Welcome Mom! 🌸 Your miracle journey has begun.' : 'Hoş geldin Anne! 🌸 Mucizeniz başladı.'));
    choose(key);
  }

  function handleSyncSubmit() {
    if (!partnerCode.trim()) return;
    toast && toast(isEn ? 'Connected to family account! 💚' : 'Eşinin aile hesabına başarıyla bağlandın! 💚');
    selectJourney('pregnancy');
  }

  return (
    <Page contentStyle={s.onboarding}>
      {/* ─── ÜST NAVİGASYON VE ATLA BAR (KİLİTLENMEYİ ÖNLER) ─── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, width: '100%' }}>
        {(onboardingStep > 1 || (setPage && state?.mode)) ? (
          <Tap
            onPress={() => { if (onboardingStep > 1) setOnboardingStep(onboardingStep - 1); else if (setPage && state?.mode) setPage(state.mode); }}
            label={isEn ? 'Back' : 'Geri'}
            style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, backgroundColor: '#F0EAF2' }}
          >
            <T bold style={{ fontSize: 12, color: colors.purple }}>
              {isEn ? '← Back' : '← Geri'}
            </T>
          </Tap>
        ) : <View style={{ width: 10 }} />}

        <Tap
          onPress={() => selectJourney('pregnancy')}
          label={isEn ? 'Skip & Continue as Guest' : 'Atla & Misafir Başla'}
          style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#FAF6F4', borderWidth: 1, borderColor: '#EAE1DF' }}
        >
          <T bold style={{ fontSize: 11, color: colors.muted }}>
            {isEn ? 'Skip · Guest Mode →' : 'Atla · Misafir Olarak Başla →'}
          </T>
        </Tap>
      </View>

      <View style={s.brand}>
        <BrandMark size={38} />
        <T style={s.wordmark}>MOMORA</T>
      </View>

      <View style={s.welcome}>
        <T bold style={s.welcomeTitle}>{isEn ? 'Where Is Your Journey?' : 'Yolculuğun Nerede?'}</T>
        <T style={s.welcomeText}>
          {isEn
            ? 'Mother and father can track together from one home.\nLet us tailor the best experience for you.'
            : 'Anne ve baba aynı hesaptan birlikte takip edebilir.\nSana en uygun deneyimi sunalım.'}
        </T>
      </View>

      {/* ─── ANNE / BABA ROL SEÇİCİ ─── */}
      {onboardingStep === 1 && <View style={{ marginBottom: 20 }}>
        <T bold style={{ fontSize: 13, color: colors.purple, marginBottom: 8, textAlign: 'center' }}>
          {isEn ? 'WHO AM I?' : 'BEN KİMİM?'}
        </T>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Tap
            onPress={() => { setRole('mother'); setOnboardingStep(2); }}
            label={isEn ? "I'm the Mother" : 'Anne Adayıyım'}
            style={[
              { flex: 1, paddingVertical: 14, paddingHorizontal: 10, borderRadius: 18, alignItems: 'center', backgroundColor: '#FAF6FA', borderWidth: 2, borderColor: '#ECE0EE' },
              role === 'mother' && { backgroundColor: '#F7EDF5', borderColor: colors.purple, ...shadow },
            ]}
          >
            <View style={{ width: 50, height: 50, borderRadius: 25, overflow: 'hidden', backgroundColor: '#F0E4EE', borderWidth: 1.5, borderColor: role === 'mother' ? colors.purple : '#E8DCE8', marginBottom: 6 }}>
              <Image
                source={generatedAssets.onboarding_role_mother || generatedAssets.onboarding_hero_pregnancy || assets.pregnancy}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
            <T bold style={{ fontSize: 13, color: role === 'mother' ? colors.purple : colors.ink }}>
              {isEn ? "I'm the Mother" : 'Ben Anneyim'}
            </T>
            <T style={{ fontSize: 10, color: colors.muted, marginTop: 2, textAlign: 'center' }}>
              {isEn ? 'Pregnancy & Body Rhythm' : 'Hamilelik & Beden Takibi'}
            </T>
          </Tap>

          <Tap
            onPress={() => { setRole('father'); setOnboardingStep(2); }}
            label={isEn ? "I'm the Father" : 'Baba Adayıyım'}
            style={[
              { flex: 1, paddingVertical: 14, paddingHorizontal: 10, borderRadius: 18, alignItems: 'center', backgroundColor: '#F6F9FB', borderWidth: 2, borderColor: '#DCE8F2' },
              role === 'father' && { backgroundColor: '#EBF3F9', borderColor: '#3E76A8', ...shadow },
            ]}
          >
            <View style={{ width: 50, height: 50, borderRadius: 25, overflow: 'hidden', backgroundColor: '#E4EDF5', borderWidth: 1.5, borderColor: role === 'father' ? '#3E76A8' : '#D4E2EE', marginBottom: 6 }}>
              <Image
                source={generatedAssets.onboarding_role_father || generatedAssets.onboarding_father_mode || assets.pregnancy}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
            <T bold style={{ fontSize: 13, color: role === 'father' ? '#3E76A8' : colors.ink }}>
              {isEn ? "I'm the Father" : 'Ben Babayım'}
            </T>
            <T style={{ fontSize: 10, color: colors.muted, marginTop: 2, textAlign: 'center' }}>
              {isEn ? 'Partner Support & Sync' : 'Eş Desteği & Ortak Takip'}
            </T>
          </Tap>
        </View>
        <Tap onPress={() => setOnboardingStep(2)} style={[s.obPrimaryBtn, { marginTop: 14 }]}><T bold style={s.obPrimaryBtnText}>{isEn ? 'Continue' : 'Devam Et'} →</T></Tap>
      </View>}

      {/* EŞİNİN AİLE KODU İLE BAĞLAN BUTONU */}
      {onboardingStep === 2 && <View style={{ marginBottom: 18, alignItems: 'center' }}>
        <Tap
          onPress={() => setShowSyncInput(!showSyncInput)}
          label={isEn ? 'I have a family invite code' : 'Eşimin aile kodu var'}
          style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#F0EAF2' }}
        >
          <T bold style={{ fontSize: 11, color: colors.purple }}>
            {showSyncInput
              ? (isEn ? '✕ Close' : '✕ Kapat')
              : (isEn ? '📲 I Have an Invite Code · Connect to Partner' : '📲 Eşimin Aile Kodu Var · Ortak Hesaba Bağlan')}
          </T>
        </Tap>

        {showSyncInput && (
          <View style={{ width: '100%', marginTop: 10, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TextInput
              value={partnerCode}
              onChangeText={setPartnerCode}
              placeholder="MOM-7829-TR"
              placeholderTextColor={colors.muted}
              style={{ flex: 1, height: 42, borderRadius: 12, borderWidth: 1, borderColor: colors.purple, paddingHorizontal: 12, backgroundColor: '#FFFFFF', fontSize: 13 }}
            />
            <Tap onPress={handleSyncSubmit} label={isEn ? 'Connect' : 'Bağlan'} style={{ height: 42, paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' }}>
              <T bold style={{ color: 'white', fontSize: 12 }}>{isEn ? 'Connect' : 'Eşime Bağlan'}</T>
            </Tap>
          </View>
        )}
      </View>}

      {/* YOLCULUK KARTLARI — 1 DOKUNUŞLA ANINDA GİRİŞ & MÜKEMMEL RESİM FİTİ */}
      {onboardingStep === 2 && <View style={{ gap: 16 }}>
        {currentJourneys.map(j => (
          <Tap
            key={j.key}
            label={j.title.replace('\n', ' ')}
            onPress={() => { setPendingJourney(j.key); setOnboardingStep(3); }}
            style={[s.journey, { backgroundColor: j.tint }]}
          >
            <View style={s.journeyPhoto}>
              <Image source={j.image} style={s.journeyImage} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', j.tint]}
                start={{ x: 0.72, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
            <View style={s.journeyCopy}>
              <T bold style={s.journeyTitle}>{j.title}</T>
              <T style={s.journeySub}>{j.sub}</T>
            </View>
            <Icon name="chevron" size={22} color={colors.purple} />
          </Tap>
        ))}
      </View>}

      {onboardingStep === 3 && (
        <View style={{ gap: 14 }}>
          <Card style={{ padding: 16, backgroundColor: '#FFFCF8', borderColor: '#EFE4EA' }}>
            <T bold style={{ fontSize: 19, color: colors.ink }}>{detailTitle[pendingJourney]}</T>
            <T style={{ fontSize: 12.5, color: colors.muted, lineHeight: 18, marginTop: 5 }}>{detailSub[pendingJourney]}</T>
            <View style={{ marginTop: 14, gap: 10 }}>
              <T bold style={{ fontSize: 12, color: colors.purple }}>{pendingJourney === 'postpartum' ? (isEn ? 'Birth type' : 'Doğum tipi') : pendingJourney === 'baby' ? (isEn ? 'Baby name & age' : 'Bebek adı ve yaşı') : (isEn ? 'Baby name & week' : 'Bebek adı ve hafta')}</T>
              <TextInput value={babyNameInput} onChangeText={setBabyNameInput} placeholder={isEn ? 'Maya' : 'Ada'} placeholderTextColor={colors.muted} style={s.obTextInput} />
              {pendingJourney === 'pregnancy' && <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                {[12, 20, 24, 32].map(w => <Tap key={w} onPress={() => setSelectedOnboardingWeek(w)} style={[s.obOptionPill, selectedOnboardingWeek === w && s.obOptionPillActive]}><T bold style={{ fontSize: 12, color: selectedOnboardingWeek === w ? 'white' : colors.ink }}>{w}. {isEn ? 'week' : 'hafta'}</T></Tap>)}
              </View>}
              {pendingJourney === 'postpartum' && <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                {[["vaginal", isEn ? "Vaginal birth" : "Normal doğum"], ["cesarean", isEn ? "Cesarean" : "Sezaryen"]].map(item => <Tap key={item[0]} onPress={() => setDeliveryTypeChoice(item[0])} style={[s.obOptionPill, deliveryTypeChoice === item[0] && s.obOptionPillActive]}><T bold style={{ fontSize: 12, color: deliveryTypeChoice === item[0] ? 'white' : colors.ink }}>{item[1]}</T></Tap>)}
              </View>}
              {pendingJourney === 'baby' && <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                {[7, 14, 30, 90].map(d => <Tap key={d} onPress={() => setBabyAgeChoice(d)} style={[s.obOptionPill, babyAgeChoice === d && s.obOptionPillActive]}><T bold style={{ fontSize: 12, color: babyAgeChoice === d ? 'white' : colors.ink }}>{d} {isEn ? 'days' : 'gün'}</T></Tap>)}
              </View>}
            </View>
          </Card>
          <Card style={{ padding: 16, backgroundColor: '#FAF5FB', borderColor: '#E9DDEA' }}>
            <T bold style={{ fontSize: 17, color: colors.ink }}>{isEn ? 'What should Momora focus on?' : 'Momora neye odaklansın?'}</T>
            <View style={{ gap: 9, marginTop: 12 }}>
              {[
                ['daily', isEn ? 'Daily guidance' : 'Günlük rehberlik', isEn ? 'Letters, tasks, reminders' : 'Mektuplar, görevler, hatırlatmalar'],
                ['tools', isEn ? 'Practical tools' : 'Pratik araçlar', isEn ? 'Kick, contraction, bag, notes' : 'Tekme, sancı, çanta, notlar'],
                ['calm', isEn ? 'Calm & birth prep' : 'Sakinlik ve doğum hazırlığı', isEn ? 'Breath, affirmations, sound' : 'Nefes, olumlama, ses']
              ].map(item => <Tap key={item[0]} onPress={() => setCareFocus(item[0])} style={[s.obInterestCard, careFocus === item[0] && s.obInterestCardActive]}><View style={s.obInterestIconBox}><Icon name={item[0] === 'calm' ? 'heart' : item[0] === 'tools' ? 'tool' : 'calendar'} size={18} color={colors.purple} /></View><View style={{ flex: 1 }}><T bold style={s.obInterestTitle}>{item[1]}</T><T style={s.obInterestSub}>{item[2]}</T></View>{careFocus === item[0] && <Icon name='check' size={16} color={colors.purple} />}</Tap>)}
            </View>
          </Card>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Tap onPress={() => setOnboardingStep(2)} style={[s.obSecondaryBtn, { flex: 0.8 }]}><T bold style={s.obSecondaryBtnText}>{isEn ? 'Back' : 'Geri'}</T></Tap>
            <Tap onPress={() => setOnboardingStep(4)} style={[s.obPrimaryBtn, { flex: 1.3 }]}><T bold style={s.obPrimaryBtnText}>{isEn ? 'Prepare my plan' : 'Planımı hazırla'} →</T></Tap>
          </View>
        </View>
      )}

      {onboardingStep === 4 && (
        <Card style={{ padding: 18, alignItems: 'center', gap: 14, backgroundColor: '#FFFCF8', borderColor: '#EFE4EA' }}>
          <View style={s.obPrepLogoBox}><BrandMark size={54} /></View>
          {!prepDone ? (
            <>
              <T bold style={{ fontSize: 23, color: colors.ink, textAlign: 'center' }}>{isEn ? 'Calculating your Momora' : 'Momora’n hesaplanıyor'}</T>
              <T style={{ fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 19 }}>{isEn ? 'Your first daily flow is being built step by step from your choices.' : 'İlk günlük akış seçimlerinden adım adım kuruluyor.'}</T>
              <View style={s.obProgressMeta}><T bold style={s.obProgressPercent}>%{Math.min(100, prepProgress)}</T><T style={s.obProgressText}>{prepProgress < 35 ? (isEn ? 'Reading choices' : 'Seçimler okunuyor') : prepProgress < 72 ? (isEn ? 'Matching tools' : 'Araçlar eşleşiyor') : (isEn ? 'Final touches' : 'Son dokunuşlar')}</T></View>
              <View style={s.obProgressTrack}><View style={[s.obProgressFill, { width: Math.max(4, prepProgress) + '%' }]} /></View>
              <View style={s.obChecklist}>
                {preparationItems.map((x, i) => {
                  const threshold = (i + 1) * (100 / preparationItems.length);
                  const done = prepProgress >= threshold;
                  const active = !done && prepProgress >= i * (100 / preparationItems.length);
                  return <View key={x} style={[s.obCheckItem, active && s.obCheckItemActive]}><View style={[s.obMiniCheck, done && s.obMiniCheckDone, active && s.obMiniCheckActive]}>{done ? <Icon name='check' size={11} color='white' /> : <View style={s.obMiniDot} />}</View><T bold={done || active} style={done ? s.obCheckLabelDone : s.obCheckLabel}>{x}</T></View>;
                })}
              </View>
            </>
          ) : (
            <>
              <T bold style={{ fontSize: 23, color: colors.ink, textAlign: 'center' }}>{isEn ? 'Your Momora is ready' : 'Momora’n hazır'}</T>
              <T style={{ fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 19 }}>{selectedJourneyCopy?.title?.replace('\n', ' ')} · {role === 'father' ? (isEn ? 'family support' : 'aile desteği') : (isEn ? 'mother care' : 'anne bakımı')} · {babyNameInput.trim() || (isEn ? 'Maya' : 'Ada')}</T>
              <View style={s.obChecklist}>
                {[roleReadyText, journeyDetailCopy[pendingJourney], supportOptions.find(x => x[0] === supportStyle)?.[1], focusCopy[careFocus]].filter(Boolean).map(x => <View key={x} style={s.obCheckItem}><View style={[s.obMiniCheck, s.obMiniCheckDone]}><Icon name='check' size={11} color='white' /></View><T bold style={s.obCheckLabelDone}>{x}</T></View>)}
              </View>
              <Tap onPress={() => selectJourney(pendingJourney)} style={[s.obPrimaryBtn, { width: '100%' }]}><T bold style={s.obPrimaryBtnText}>{isEn ? 'Start Momora' : 'Momora’ya Başla'} →</T></Tap>
            </>
          )}
        </Card>
      )}

      <View style={s.motto}>
        <Icon name="heart" color="#A68A9C" size={29} />
        <T style={s.handwritten}>
          {isEn
            ? 'Mother and Father hand in hand,\nfor a peaceful journey'
            : 'Anne ve Baba el ele,\nhuzurlu bir yolculuk için'}
        </T>
      </View>
    </Page>
  );
}

// ─── 3'lü Kıyaslama & Ultrason Hero (Pregnancy+ Stili) ─────────────────────────
function ComparisonHero({ week, info, onPress, open, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [mode, setMode] = useState('fruit'); // 'fruit' | 'animal' | 'sweet' | 'ultrasound'
  const scale = usePulse(0.94, 1.06, 1800);
  const fade  = useCrossFade(week + mode, 260);
  const progress = pregnancyProgress(week);

  let compName = info.fruitName;
  let compSub = isEn ? 'in size' : 'büyüklüğünde';
  let compType = info.fruit;
  let compEmoji = '🍑';

  if (mode === 'animal') {
    compName = info.animalName || (isEn ? 'Cute Baby Animal' : 'Sevimli Yavru');
    compSub = isEn ? 'as cute as' : 'kadar sevimli';
    compType = info.animal || 'hamster';
    compEmoji = info.animalEmoji || '🐾';
  } else if (mode === 'sweet') {
    compName = info.sweetName || (isEn ? 'Sweet Object' : 'Tatlı Nesne');
    compSub = isEn ? 'in weight' : 'ağırlığında';
    compType = info.sweet || 'macaron';
    compEmoji = info.sweetEmoji || '🧁';
  } else if (mode === 'ultrasound') {
    compName = info.ultrasound?.scan || (isEn ? 'Ultrasound' : 'Ultrason');
    compSub = info.ultrasound?.badge || '2D / 4D Doppler';
    compType = 'ultrasound';
    compEmoji = '🩺';
  }

  return (
    <View style={s.compHeroCard}>
      {/* 3'lü Kıyaslama Switcher (Pregnancy+ Stili) */}
      <View style={s.compTabs}>
        {[
          { key: 'fruit', label: isEn ? 'Fruit' : 'Meyve', icon: 'apple' },
          { key: 'animal', label: isEn ? 'Animal' : 'Hayvan', icon: 'paw' },
          { key: 'sweet', label: isEn ? 'Sweet' : 'Tatlı', icon: 'cupcake' },
          { key: 'ultrasound', label: isEn ? 'Ultrasound' : 'Ultrason', icon: 'ultrasound' },
        ].map(t => (
          <Tap
            key={t.key}
            onPress={() => setMode(t.key)}
            label={t.label}
            accessibilityState={{ selected: mode === t.key }}
            style={[s.compTab, mode === t.key && s.compTabActive]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Icon name={t.icon} size={13} color={mode === t.key ? '#5A3366' : '#886E91'} />
              <T style={[s.compTabLabel, mode === t.key && s.compTabLabelActive]}>{t.label}</T>
            </View>
          </Tap>
        ))}
      </View>

      <Tap
        onPress={() => {
          if (mode === 'ultrasound' && open) {
            open('ultrasoundAtlas', { week });
          } else if (onPress) {
            onPress();
          }
        }}
        label={mode === 'ultrasound' ? (isEn ? 'Open Ultrasound Atlas' : 'Ultrason Atlasını Aç') : (isEn ? 'See week development' : 'Bu haftaki gelişimi gör')}
        style={s.fruitHero}
      >
        <LinearGradient colors={['#6A4F7A22', 'transparent']} start={{x:0,y:0}} end={{x:1,y:0}} style={StyleSheet.absoluteFill} />
        {/* Sol — sayısal bilgi */}
        <View style={s.fruitHeroLeft}>
          <View style={s.row}>
            <T bold style={s.fruitWeekNum}>{isEn ? `Week ${week}` : `${week}. Hafta`}</T>
            {mode === 'ultrasound' && (
              <View style={s.usBadge}>
                <T style={s.usBadgeText}>{info.ultrasound?.badge || (isEn ? 'Ultrasound' : 'Ultrason')}</T>
              </View>
            )}
          </View>
          <T style={s.fruitMeta}>{monthLabel(info.month)} · {trimesterLabel(info.trimester)}</T>

          {mode === 'ultrasound' ? (
            <View style={{ marginTop: 8, paddingRight: 4 }}>
              <T style={{ fontSize: 11, color: '#6A4878', lineHeight: 15 }}>
                {info.ultrasound?.milestone || (isEn ? 'Baby organs and facial features are monitored.' : 'Bebeğin organları ve yüz hatları inceleniyor.')}
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
            <T style={{fontSize:10,color:'#B89DC0',marginBottom:4}}>{progress}% {isEn ? 'completed' : 'tamamlandı'}</T>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, {width: `${progress}%`}]} />
            </View>
          </View>
          <View style={s.fruitHeroBtn}>
            <T style={{fontSize:12,color:'#9A779A'}}>{isEn ? 'See details' : 'Detayları gör'}</T>
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

function PremiumWeeklyPlan({ week, state, update, open, lang = 'tr' }) {
  const isEn = lang === 'en';
  const done = (state.tasks || []).filter(Boolean).length;
  const items = isEn
    ? [
        ['Movement routine', 'Start one calm kick session', 'kickCounter', 'card_kick_counter'],
        ['Body note', 'Log weight, mood or symptom', 'weight', 'ui_weight_bmi_gauge'],
        ['Appointment prep', 'Save one question for the visit', 'doctorQuestions', 'ui_doctor_prep_notebook'],
        ['Birth prep', 'Review hospital bag and plan', 'hospitalBag', 'ui_hospital_bag_3d'],
      ]
    : [
        ['Hareket rutini', 'Sakin bir tekme seansı başlat', 'kickCounter', 'card_kick_counter'],
        ['Beden notu', 'Kilo, ruh hali veya belirti kaydet', 'weight', 'ui_weight_bmi_gauge'],
        ['Randevu hazırlığı', 'Kontrol için bir soru sakla', 'doctorQuestions', 'ui_doctor_prep_notebook'],
        ['Doğum hazırlığı', 'Çanta ve planı gözden geçir', 'hospitalBag', 'ui_hospital_bag_3d'],
      ];
  return (
    <Card style={{ padding: 16, backgroundColor: '#FFFCF8', borderColor: '#EFE4EA' }}>
      <View style={[s.topline, { marginBottom: 12 }]}> 
        <View>
          <T bold style={{ fontSize: 17, color: colors.ink }}>{isEn ? 'Week ' + week + ' plan' : week + '. hafta planı'}</T>
          <T style={{ fontSize: 12, color: colors.muted, marginTop: 3 }}>{isEn ? 'Weekly learning is paired with practical actions.' : 'Haftalık bilgi, küçük görevlerle tamamlanır.'}</T>
        </View>
        <View style={{ width: 58, height: 58, borderRadius: 20, backgroundColor: '#F4ECF6', alignItems: 'center', justifyContent: 'center' }}>
          <T bold style={{ fontSize: 15, color: colors.purple }}>%{Math.min(100, done * 20)}</T>
          <T style={{ fontSize: 9, color: colors.muted }}>{isEn ? 'ready' : 'hazır'}</T>
        </View>
      </View>
      <View style={{ gap: 9 }}>
        {items.map(([title, sub, route, asset], i) => (
          <Tap key={title} onPress={() => open(route)} label={title} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11, borderRadius: 16, backgroundColor: i % 2 ? '#FAF5F8' : '#F7F1FA', borderWidth: 1, borderColor: '#EDE1EC' }}>
            <CleanIcon asset={asset} size={36} imgSize={32} />
            <View style={{ flex: 1 }}>
              <T bold style={{ fontSize: 13.5, color: colors.ink }}>{title}</T>
              <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 2 }}>{sub}</T>
            </View>
            <Icon name="chevron" size={16} color={colors.muted} />
          </Tap>
        ))}
      </View>
    </Card>
  );
}

function PostpartumRecoverySnapshot({ state, update, open, lang = 'tr' }) {
  const isEn = lang === 'en';
  const done = (state.tasks || []).filter(Boolean).length;
  const cards = isEn
    ? [['Mood', state.postpartumMood == null ? 'Check in' : 'Logged', 'dailyMood', 'mood_good'], ['Feeding', 'Open timer', 'nursingTimer', 'ui_nursing_dual_timer'], ['Rest', 'Sleep sound', 'sleepWhiteNoise', 'ui_white_noise_headphones']]
    : [['Ruh hali', state.postpartumMood == null ? 'Kontrol et' : 'Kaydedildi', 'dailyMood', 'mood_good'], ['Beslenme', 'Zamanlayıcıyı aç', 'nursingTimer', 'ui_nursing_dual_timer'], ['Dinlenme', 'Uyku sesini aç', 'sleepWhiteNoise', 'ui_white_noise_headphones']];
  return (
    <Card style={{ padding: 16, backgroundColor: '#FFFDFB', borderColor: '#EDE1EA' }}>
      <View style={[s.topline, { marginBottom: 12 }]}><View><T bold style={{ fontSize: 17 }}>{isEn ? 'Recovery command center' : 'Toparlanma merkezi'}</T><T style={{ fontSize: 12, color: colors.muted, marginTop: 3 }}>{done}/5 {isEn ? 'self-care steps completed today' : 'bugünkü bakım adımı tamamlandı'}</T></View><Progress value={done * 20} style={{ width: 96 }} /></View>
      <View style={{ flexDirection: 'row', gap: 9 }}>
        {cards.map(([title, sub, route, asset]) => <Tap key={title} onPress={() => open(route)} style={{ flex: 1, padding: 11, borderRadius: 17, backgroundColor: '#F7F0F7', borderWidth: 1, borderColor: '#E8DCEB' }}><View style={{ alignItems: 'center', gap: 6 }}><CleanIcon asset={asset} size={36} imgSize={32} /><T bold style={{ fontSize: 12, textAlign: 'center' }}>{title}</T><T style={{ fontSize: 10.5, color: colors.muted, textAlign: 'center' }}>{sub}</T></View></Tap>)}
      </View>
    </Card>
  );
}

function BabyDaySummary({ state, open, lang = 'tr' }) {
  const isEn = lang === 'en';
  const records = state?.records || [];
  const events = state?.trackerEvents || [];

  // Feeds count today
  const feedsCount = events.filter(e => e.type === 'nursing' || e.type === 'bottle' || e.type === 'feeding').length ||
    records.filter(r => r.type === 'Emzirme' || r.type === 'Biberon').length || 4;

  // Sleep duration
  const sleepEvents = events.filter(e => e.type === 'sleep') || [];
  let totalSleepMins = sleepEvents.reduce((acc, e) => acc + Math.round((e.durationSeconds || 0) / 60), 0);
  if (!totalSleepMins) totalSleepMins = 8 * 60 + 40;
  const sleepHours = Math.floor(totalSleepMins / 60);
  const sleepRemainMins = totalSleepMins % 60;
  const sleepStr = isEn ? `${sleepHours}h ${sleepRemainMins}m` : `${sleepHours} sa ${sleepRemainMins} dk`;

  // Diapers count
  const diaperCount = events.filter(e => e.type === 'diaper').length ||
    records.filter(r => r.type === 'Bez').length || 5;

  const isSleeping = !!state?.activeSleep;
  const isFeeding = !!state?.activeFeeding;

  const metrics = [
    [isEn ? 'Feeds' : 'Beslenme', `${feedsCount}`, 'ui_nursing_dual_timer'],
    [isEn ? 'Sleep' : 'Uyku', sleepStr, 'ui_white_noise_headphones'],
    [isEn ? 'Diapers' : 'Bez', `${diaperCount}`, 'ui_diaper_wet_drop'],
    [isEn ? 'Growth' : 'Gelişim', isEn ? 'On track' : 'Takipte', 'btn_growth_tape'],
  ];

  return (
    <Card style={{ padding: 16, backgroundColor: '#FFFCF8', borderColor: '#E5DDEB' }}>
      <View style={[s.topline, { marginBottom: 12 }]}>
        <View>
          <T bold style={{ fontSize: 17 }}>{isEn ? '24-hour care summary' : '24 saat bakım özeti'}</T>
          <T style={{ fontSize: 12, color: colors.muted, marginTop: 3 }}>
            {isEn ? 'Real-time overview before the next care entry.' : 'Yeni kayıt girmeden önce günün hızlı görünümü.'}
          </T>
        </View>
        <Tap onPress={() => open('records')} style={{ paddingHorizontal: 10, paddingVertical: 7, borderRadius: 13, backgroundColor: '#F0E8F4' }}>
          <T bold style={{ fontSize: 11, color: colors.purple }}>{isEn ? 'All logs' : 'Tüm kayıtlar'}</T>
        </Tap>
      </View>

      {/* Live State Badge (Spec 16_BABY_DASHBOARD) */}
      {(isSleeping || isFeeding) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EDF4FC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginBottom: 12 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#28588A' }} />
          <T bold style={{ fontSize: 12, color: '#28588A' }}>
            {isSleeping
              ? (isEn ? '● Baby is sleeping' : '● Bebek şu an uykuda')
              : (isEn ? `● Nursing active (${state.activeFeeding.side === 'left' ? 'Left' : 'Right'})` : `● Emzirme aktif (${state.activeFeeding.side === 'left' ? 'Sol Meme' : 'Sağ Meme'})`)}
          </T>
        </View>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
        {metrics.map(([title, value, asset]) => (
          <View key={title} style={{ width: '48%', padding: 12, borderRadius: 18, backgroundColor: '#F7F3FA', borderWidth: 1, borderColor: '#E9DFEF' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CleanIcon asset={asset} size={32} imgSize={28} />
              <View>
                <T bold style={{ fontSize: 14 }}>{value}</T>
                <T style={{ fontSize: 11, color: colors.muted }}>{title}</T>
              </View>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function Pregnancy({ state, update, open, lang = 'tr', setPage }) {
  const isEn = lang === 'en';
  const [timelineDay, setTimelineDay] = useState('bugun'); // 'dun' | 'bugun' | 'yarin'
  const journey = resolveJourneyState(state);
  const currentWeek = state.week || journey.week || 24;
  const [selectedWeek, setSelectedWeek] = useState(null);
  const week = selectedWeek ?? currentWeek;
  const currentDay = journey.day ?? 3;
  const info = getWeekInfo(week, lang);
  const letter = getBabyLetterForWeek(week, lang);
  const weekScrollRef = useRef(null);
  const didPositionWeekStrip = useRef(false);

  useEffect(() => {
    if (didPositionWeekStrip.current) return;
    if (weekScrollRef.current) {
      const pillWidth = 65;
      const targetX = Math.max(0, (week - 4) * pillWidth - 120);
      try {
        const node = weekScrollRef.current.getScrollableNode ? weekScrollRef.current.getScrollableNode() : weekScrollRef.current;
        if (node && node.scrollTo) {
          node.scrollTo({ left: targetX, behavior: 'smooth' });
        } else if (node && node.scrollLeft !== undefined) {
          node.scrollLeft = targetX;
        } else if (weekScrollRef.current.scrollTo) {
          weekScrollRef.current.scrollTo({ x: targetX, animated: true });
        }
      } catch (e) {}
      didPositionWeekStrip.current = true;
    }
  }, []);

  function scrollWeeks(delta) {
    if (weekScrollRef.current) {
      try {
        const node = weekScrollRef.current.getScrollableNode ? weekScrollRef.current.getScrollableNode() : weekScrollRef.current;
        if (node && node.scrollBy) {
          node.scrollBy({ left: delta, behavior: 'smooth' });
        } else if (node && node.scrollLeft !== undefined) {
          node.scrollLeft += delta;
        } else if (weekScrollRef.current.scrollTo) {
          const pillWidth = 65;
          const currentX = Math.max(0, (week - 4) * pillWidth - 120);
          weekScrollRef.current.scrollTo({ x: currentX + delta, animated: true });
        }
      } catch (e) {}
    }
  }

  // Hafta şeridi: Kullanıcının tüm gebelik haftalarını (4-40) kaydırıp seçebilmesi
  const strip = [];
  for (let w = 4; w <= TOTAL_WEEKS; w++) strip.push(w);

  const moodLabels = isEn
    ? ['Great ✨', 'Good 💛', 'Normal 🌿', 'Tired 🛌', 'Hard 💜']
    : ['Harika ✨', 'İyi 💛', 'Normal 🌿', 'Yorgun 🛌', 'Zor 💜'];

  const timelineContent = isEn ? {
    dun: {
      baby: 'Tiny touch receptors have activated on your baby’s fingertips.',
      mom: 'You might feel a sweet, mild weight in your lower back.',
      tip: 'A 20-minute gentle evening walk improves your sleep quality noticeably.',
    },
    bugun: {
      baby: 'First hiccup reflexes may begin today, preparing diaphragmatic muscles for birth!',
      mom: 'Blood volume is up 40%; mild nasal congestion is very common right now.',
      tip: 'Jotting down calcium & magnesium rich meals makes your doctor visits more productive.',
    },
    yarin: {
      baby: 'Facial muscles continue practicing smiles, frowns, and grimaces.',
      mom: 'Energy levels may stay pleasantly high; great day for nursery planning.',
      tip: 'Elevate your feet with a pillow at the end of the day for restorative rest.',
    },
  } : {
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
      <View style={{ flex: 1, paddingRight: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <T bold style={{ color: '#684574', fontSize: 18 }}>
            {state.role === 'father'
              ? (isEn ? `Hello Dad, ${state.name || 'Alex'}` : `Merhaba Baba, ${state.name || 'Mehmet'}`)
              : (isEn ? `Hello, ${state.name || 'Emma'}` : `Merhaba, ${state.name || 'Zeynep'}`)}
          </T>
          <T style={{ fontSize: 18 }}>{state.role === 'father' ? '👨‍🍼' : '🌸'}</T>
        </View>
        <T style={s.subtitle}>{isEn ? `Today · Week ${week} Day ${currentDay}` : `Bugün · ${week}. Hafta ${currentDay}. Gün`}</T>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {state.avatar ? (
          <Tap onPress={() => (setPage ? setPage('profile') : open('profile'))} label={isEn ? 'Profile' : 'Profil'} style={{ width: 34, height: 34, borderRadius: 17, overflow: 'hidden', borderWidth: 1.5, borderColor: colors.purpleLight, backgroundColor: '#FAF5FB', alignItems: 'center', justifyContent: 'center' }}>
            {state.avatar.startsWith('http') || state.avatar.startsWith('file:') || state.avatar.startsWith('blob:') || state.avatar.startsWith('data:') ? (
              <Image source={{ uri: state.avatar }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <T style={{ fontSize: 18 }}>{state.avatar}</T>
            )}
          </Tap>
        ) : null}
        <Tap onPress={() => open('appointment')} label={isEn ? 'Appointments' : 'Randevularım'} style={s.iconHit}>
          <Icon name="bell" size={26}/>
        </Tap>
      </View>
    </View>

    {/* Geri Sayım Rozet Şeridi */}
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F6EFF7', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14 }}>
      <T bold style={{ fontSize: 12, color: colors.purple }}>
        ⏳ {isEn ? `${journey.daysRemaining} Days Until Due Date` : `Doğuma ${journey.daysRemaining} Gün Kaldı`}
      </T>
      <T style={{ fontSize: 11, color: '#7E6184' }}>
        {isEn ? `Baby: ${state.babyName || 'Ada'}` : `Bebeğin: ${state.babyName || 'Ada'}`} · {state.babyGender === 'Kız' || state.babyGender === 'girl' ? (isEn ? 'Girl' : 'Kız') : (isEn ? 'Boy' : 'Erkek')}
      </T>
    </View>

    <PremiumWeeklyPlan week={week} state={state} update={update} open={open} lang={lang} />


    
    {/* ─── 2. HAFTA ŞERİDİ (KAYDIRILABİLİR, OKLAR VE MOUSE SÜRÜKLEME DESTEĞİ) ─── */}
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
      <Tap
        onPress={() => scrollWeeks(-195)}
        label={isEn ? 'Scroll left' : 'Sola kaydır'}
        style={{ width: 28, height: 46, borderRadius: 14, backgroundColor: '#FAF4F7', alignItems: 'center', justifyContent: 'center', marginRight: 6, borderWidth: 1, borderColor: '#EDE2E9' }}
      >
        <T bold style={{ fontSize: 18, color: colors.purple, lineHeight: 22 }}>‹</T>
      </Tap>

      <HorizontalScroll
        ref={weekScrollRef}
        contentContainerStyle={s.weekStrip}
        style={{ flex: 1 }}
      >
        {strip.map(n => (
          <Tap
            key={n}
            label={n + (isEn ? ' week' : '. hafta')}
            onPress={() => {
              setSelectedWeek(n);
              update({ week: n });
            }}
            accessibilityState={{ selected: week === n }}
            style={[s.weekPill, week === n && s.weekActive]}
          >
            <T style={[{ fontSize: 13 }, week === n && { color: 'white', fontFamily: fonts.bold }]}>{n}</T>
            <T numberOfLines={1} ellipsizeMode="tail" style={[{ fontSize: 9, marginTop: 1, textAlign: 'center', color: week === n ? '#EEE5F4' : colors.muted }]}>
              {getWeekInfo(n, lang).fruitName}
            </T>
          </Tap>
        ))}
      </HorizontalScroll>

      <Tap
        onPress={() => scrollWeeks(195)}
        label={isEn ? 'Scroll right' : 'Sağa kaydır'}
        style={{ width: 28, height: 46, borderRadius: 14, backgroundColor: '#FAF4F7', alignItems: 'center', justifyContent: 'center', marginLeft: 6, borderWidth: 1, borderColor: '#EDE2E9' }}
      >
        <T bold style={{ fontSize: 18, color: colors.purple, lineHeight: 22 }}>›</T>
      </Tap>
    </View>

    {/* ─── 3. 3'LÜ KIYASLAMA & ULTRASON HERO ─── */}
    <ComparisonHero week={week} info={info} onPress={() => open('week', {week})} open={open} lang={lang} />

    {/* ─── 4. BEBEĞİN GÜNLÜK MEKTUBU ─── */}
    <Card style={{ padding: 16, backgroundColor: '#FFFDF9', borderColor: '#EFE0D8' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <CleanIcon asset="ui_baby_letter_envelope" size={36} imgSize={32} icon="mail" />
          <View>
            <T bold style={{ fontSize: 14, color: colors.purple }}>{isEn ? "Daily Letter from Your Baby" : "Bebeğinden Günün Mektubu"}</T>
            <T style={{ fontSize: 10, color: colors.muted }}>{letter.dayText || (isEn ? `Week ${week} Letter` : `${week}. Hafta Mektubu`)}</T>
          </View>
        </View>
        <Tap onPress={() => open('babyLetter')} style={{ padding: 4 }}>
          <T bold style={{ fontSize: 11, color: colors.purple }}>{isEn ? 'All Letters →' : 'Tüm Mektuplar →'}</T>
        </Tap>
      </View>

      <T style={{ fontSize: 13.5, color: '#4B3F4B', lineHeight: 21, fontStyle: 'italic' }}>
        "{letter.text}"
      </T>

      {letter.milestone ? (
        <View style={{ marginTop: 10, backgroundColor: '#FAF3EF', padding: 8, borderRadius: 10 }}>
          <T style={{ fontSize: 11, color: '#885842' }}>🌱 {isEn ? 'Milestone:' : 'Gelişim Notu:'} {letter.milestone}</T>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderColor: '#F5ECE5' }}>
        <T style={{ fontSize: 11, color: colors.muted }}>{isEn ? 'Your loving baby 💛' : 'Seni çok seven bebeğin 💛'}</T>
        <Tap onPress={() => open('babyLetter')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <T bold style={{ fontSize: 11, color: colors.purple }}>{isEn ? 'Send to Partner' : 'Eşime Gönder'}</T>
          <Icon name="chevron" size={12} color={colors.purple}/>
        </Tap>
      </View>
    </Card>

    {/* ─── 5. GÜNLÜK AKIŞ & ZAMAN TÜNELİ (DÜN - BUGÜN - YARIN) ─── */}
    <Card style={{ padding: 15 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="clock" size={16} color={colors.purple} />
          <T bold style={{ fontSize: 15, color: colors.ink }}>{isEn ? 'Daily Growth Feed' : 'Günlük Gelişim Akışı'}</T>
        </View>
        {/* Dün - Bugün - Yarın Sekmeleri */}
        <View style={{ flexDirection: 'row', backgroundColor: '#EFE7F0', borderRadius: 12, padding: 2 }}>
          {[
            { id: 'dun', label: isEn ? 'Yesterday' : 'Dün' },
            { id: 'bugun', label: isEn ? 'Today ✨' : 'Bugün ✨' },
            { id: 'yarin', label: isEn ? 'Tomorrow' : 'Yarın' },
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
        <View style={{ flexDirection: 'row', gap: 10, backgroundColor: '#FAF6FA', padding: 10, borderRadius: 12, alignItems: 'center' }}>
          <CleanIcon asset="ui_fetal_brain_3d" icon="baby" size={32} imgSize={28} tint={colors.purple} />
          <View style={{ flex: 1 }}>
            <T bold style={{ fontSize: 12, color: colors.purple }}>{isEn ? 'Baby' : 'Bebeğin'}</T>
            <T style={{ fontSize: 12.5, color: '#4E4252', marginTop: 1, lineHeight: 17 }}>{tc.baby}</T>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, backgroundColor: '#FDF3F5', padding: 10, borderRadius: 12, alignItems: 'center' }}>
          <CleanIcon asset="ui_fetal_heart_3d" icon="heart" size={32} imgSize={28} tint="#A03B64" />
          <View style={{ flex: 1 }}>
            <T bold style={{ fontSize: 12, color: '#A03B64' }}>{isEn ? 'Your Body' : 'Bedenin'}</T>
            <T style={{ fontSize: 12.5, color: '#563D4A', marginTop: 1, lineHeight: 17 }}>{tc.mom}</T>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, backgroundColor: '#F3F8F4', padding: 10, borderRadius: 12, alignItems: 'center' }}>
          <CleanIcon asset="ui_timeline_sun_moon" icon="leaf" size={32} imgSize={28} tint="#38734A" />
          <View style={{ flex: 1 }}>
            <T bold style={{ fontSize: 12, color: '#38734A' }}>{isEn ? "Today's Tip" : 'Günün Tavsiyesi'}</T>
            <T style={{ fontSize: 12.5, color: '#3A5442', marginTop: 1, lineHeight: 17 }}>{tc.tip}</T>
          </View>
        </View>
      </View>
    </Card>

    {/* ─── 6. BUGÜNÜN CANLI TAKİP GÜNLÜĞÜ (CHECKLIST & KAYIT LİSTESİ) ─── */}
    <Card style={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <CleanIcon asset="ui_doctor_prep_notebook" size={28} imgSize={24} icon="book" />
          <T bold style={{ fontSize: 15, color: colors.ink }}>{isEn ? "Today's Tracker Log" : 'Bugünün Takip Günlüğü'}</T>
        </View>
        <Tap onPress={() => open('toolsHub')} style={{ padding: 4 }}>
          <T bold style={{ fontSize: 11, color: colors.purple }}>{isEn ? 'Trackers hub →' : 'Takip merkezi →'}</T>
        </Tap>
      </View>

      <View style={{ gap: 8 }}>
        {/* 1. Su Takibi */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F2EAF3' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <CleanIcon asset="card_water" size={36} imgSize={32} icon="drop" tint="#367B9E" />
            <View>
              <T bold style={{ fontSize: 13 }}>{isEn ? 'Water Tracker' : 'Su Takibi'} · {state.water || 4}/8 {isEn ? 'Glasses' : 'Bardak'}</T>
              <T style={{ fontSize: 11, color: colors.muted }}>{((state.water || 4) * 0.25).toFixed(1)} / 2.0 {isEn ? 'Liters completed' : 'Litre tamamlandı'}</T>
            </View>
          </View>
          <Tap onPress={() => update(old => ({ water: Math.min(12, (old.water || 0) + 1) }))} style={{ backgroundColor: '#EDF5F8', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
            <T bold style={{ fontSize: 11, color: '#367B9E' }}>{isEn ? '+1 Glass' : '+1 Bardak'}</T>
          </Tap>
        </View>

        {/* 2. Vitamin Takibi */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F2EAF3' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <CleanIcon asset="card_vitamin" size={36} imgSize={32} icon="heart" tint="#A8453E" />
            <View>
              <T bold style={{ fontSize: 13 }}>{isEn ? 'Prenatal Vitamin' : 'Vitamin Notu'}</T>
              <T style={{ fontSize: 11, color: state.vitamin ? '#3A8253' : colors.muted }}>
                {state.vitamin ? (isEn ? 'Taken today ✓' : 'Bugün alındı ✓') : (isEn ? 'Pending daily dose' : 'Günlük doz bekleniyor')}
              </T>
            </View>
          </View>
          <Tap onPress={() => update(old => ({ vitamin: !old.vitamin }))} style={{ backgroundColor: state.vitamin ? '#EBF5ED' : '#F7ECEB', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
            <T bold style={{ fontSize: 11, color: state.vitamin ? '#2E6E43' : '#A8453E' }}>
              {state.vitamin ? (isEn ? 'Taken ✓' : 'Alındı ✓') : (isEn ? 'Mark Taken' : 'Alındı İşaretle')}
            </T>
          </Tap>
        </View>

        {/* 3. Tekme Takibi */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F2EAF3' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <CleanIcon asset="card_kick_counter" size={36} imgSize={32} icon="footprint" tint="#A03B64" />
            <View>
              <T bold style={{ fontSize: 13 }}>{isEn ? 'Kick Session' : 'Hareket Seansı'}</T>
              <T style={{ fontSize: 11, color: colors.muted }}>
                {state.kickSessions?.[0] ? `${isEn ? 'Latest: ' : 'Son: '}${state.kickSessions[0].kicks ?? state.kickSessions[0].count} ${isEn ? 'kicks' : 'hareket'}` : (isEn ? 'Start first session' : 'İlk seansı başlat')}
              </T>
            </View>
          </View>
          <Tap onPress={() => open('kickCounter')} style={{ backgroundColor: '#FAF1F5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
            <T bold style={{ fontSize: 11, color: '#A03B64' }}>{isEn ? 'Start Session' : 'Seans Başlat'}</T>
          </Tap>
        </View>

        {/* 4. Kilo Takibi */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F2EAF3' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <CleanIcon asset="ui_weight_bmi_gauge" size={36} imgSize={32} icon="scale" tint="#34754B" />
            <View>
              <T bold style={{ fontSize: 13 }}>{isEn ? 'Weight Tracker' : 'Kilo Takibi'} · {state.weights?.[0]?.value || state.startWeight || 60} kg</T>
              <T style={{ fontSize: 11, color: '#3A8253' }}>{isEn ? 'Update weekly trend' : 'Haftalık eğilimi güncelle'}</T>
            </View>
          </View>
          <Tap onPress={() => open('weight')} style={{ backgroundColor: '#EEF5F1', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
            <T bold style={{ fontSize: 11, color: '#34754B' }}>{isEn ? 'Log Weight' : 'Kilo Kaydet'}</T>
          </Tap>
        </View>

        {/* 5. Ruh Hali */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <CleanIcon asset="ui_postpartum_lotus" size={36} imgSize={32} icon="heart" tint={colors.purple} />
            <View>
              <T bold style={{ fontSize: 13 }}>{isEn ? "Today's Mood: " : 'Günün Ruh Hali: '}{moodLabels[state.mood ?? 0]}</T>
              <T style={{ fontSize: 11, color: colors.muted }}>{isEn ? 'Track your feeling with a small note' : 'Bugünkü hissini kısa notla takip et'}</T>
            </View>
          </View>
          <Tap onPress={() => open('dailyMood')} style={{ backgroundColor: '#F3ECF5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
            <T bold style={{ fontSize: 11, color: colors.purple }}>{isEn ? 'Change' : 'Değiştir'}</T>
          </Tap>
        </View>
      </View>
    </Card>

    {/* ─── 7. GELİŞİM VE KONTROL KISAYOLLARI ─── */}
    <View style={[s.row,{gap:8}]}>
      <Tap
        onPress={() => open('sizeGuide')}
        label={isEn ? 'Open 3D size guide' : '3 Boyut kıyaslamayı aç'}
        style={{flex:1,padding:10,borderRadius:16,backgroundColor:'#F3EEF5',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#E6DCea'}}
      >
        <CleanIcon asset="sweet_macaron" size={36} imgSize={32} icon="melon" tint={colors.purple} />
        <T bold style={{fontSize:11,color:colors.ink,marginTop:4}}>{isEn ? '3D Size' : '3 Boyut Kıyas'}</T>
      </Tap>
      <Tap
        onPress={() => open('organDevelopment')}
        label={isEn ? 'Open organ development' : 'Organ gelişimini aç'}
        style={{flex:1,padding:10,borderRadius:16,backgroundColor:'#FDF2F4',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#EED9DF'}}
      >
        <CleanIcon asset="card_blood_pressure" size={36} imgSize={32} icon="heart" tint="#A03B64" />
        <T bold style={{fontSize:11,color:colors.ink,marginTop:4}}>{isEn ? 'Organ & Heart' : 'Organ & Kalp'}</T>
      </Tap>
      <Tap
        onPress={() => open('medicalTimeline')}
        label={isEn ? 'Open medical timeline' : 'Tıbbi takvimi aç'}
        style={{flex:1,padding:10,borderRadius:16,backgroundColor:'#EEF5F2',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#D8E8E0'}}
      >
        <CleanIcon asset="card_health_report" size={36} imgSize={32} icon="calendar" tint="#34754B" />
        <T bold style={{fontSize:11,color:colors.ink,marginTop:4}}>{isEn ? 'Timeline' : 'Kontrol Takvimi'}</T>
      </Tap>
    </View>

    {/* ─── 8. BEBEK BU HAFTA ─── */}
    <Card style={{padding:14}}>
      <View style={[s.row,{gap:8,marginBottom:10}]}>
        {generatedAssets['ui_fetal_brain_3d'] ? (
          <Image source={generatedAssets['ui_fetal_brain_3d']} style={{width:20,height:20}} resizeMode="contain"/>
        ) : null}
        <T bold style={{fontSize:15}}>{isEn ? `Your baby this week (Week ${week})` : `Bebeğinde bu hafta (${week}. Hafta)`}</T>
      </View>
      {info.baby.map((b,i) => (
        <View key={i} style={[s.row,{gap:8,marginBottom:i<info.baby.length-1?8:0}]}>
          <View style={s.bullet}/>
          <T style={{fontSize:13,flex:1,lineHeight:19,color:'#555060'}}>{b}</T>
        </View>
      ))}
      <Tap onPress={() => open('week',{week})} style={s.seeMore}>
        <T style={{fontSize:13,color:colors.purple}}>{isEn ? "View mother's week and leave a note" : 'Annenin bu haftasını ve not almayı gör'}</T>
        <Icon name="chevron" size={16} color={colors.purple}/>
      </Tap>
    </Card>

    {/* ─── 9. RANDEVU KARTI ─── */}
    <Tap onPress={() => open('appointment')} style={s.appointment}>
      <View style={{flex:1}}>
        <T style={{fontSize:13}}>
          {(isEn && (state.appointment?.title === 'Detaylı Ultrason Kontrolü' || !state.appointment?.title))
            ? 'Detailed Ultrasound Checkup'
            : (state.appointment?.title || (isEn ? 'Doctor Checkup' : 'Doktor Randevusu'))}
        </T>
        <View style={[s.row,{marginTop:8,gap:13}]}>
          <Icon name="calendar" size={28}/>
          <T bold style={{fontSize:15,lineHeight:20}}>
            {(isEn && state.appointment?.date === '16 Mayıs Cuma')
              ? 'Friday, May 16'
              : (state.appointment?.date || (isEn ? 'Friday, May 16' : '16 Mayıs Cuma'))}
            {'\n'}
            {state.appointment?.time || '10:00'}
          </T>
        </View>
      </View>
      <View style={s.appointmentIcon}><Icon name="bottle" size={23} color="#A69BCF" fill="#E5DDF6"/></View>
    </Tap>

    {/* ─── 10. GEBELİK SAYAÇLARI & ARAÇLAR ─── */}
    <View style={{marginTop:6}}>
      <Section title={isEn ? 'Quick smart tools' : 'Sık kullanılan araçlar'} action={isEn ? 'Open hub' : 'Koleksiyonu aç'} onPress={()=>open('toolsHub')}/>
      <HorizontalScroll contentContainerStyle={{gap:10,paddingBottom:4}}>
        <Tap
          onPress={()=>open('kickCounter')}
          label="Tekme sayacını aç"
          style={{width:145,padding:14,borderRadius:18,backgroundColor:'#FAF1F5',borderWidth:1,borderColor:'#F0DFE8',...shadow}}
        >
          <CleanIcon asset="card_kick_counter" size={44} imgSize={40} icon="footprint" tint="#9A5B80" style={{ marginBottom: 8 }} />
          <T bold style={{fontSize:13,color:'#632D4C'}}>{isEn ? 'Kick Counter' : 'Tekme Sayacı'}</T>
          <T style={{fontSize:10,color:'#91637F',marginTop:2}}>{isEn ? 'Personal rhythm & kicks' : 'Kişisel ritim & hareket'}</T>
        </Tap>

        <Tap
          onPress={()=>open('contractionTimer')}
          label="Kasılma sayacını aç"
          style={{width:145,padding:14,borderRadius:18,backgroundColor:'#F0F6FB',borderWidth:1,borderColor:'#DDE9F3',...shadow}}
        >
          <CleanIcon asset="card_contractions" size={44} imgSize={40} icon="contraction" tint="#4F79A1" style={{ marginBottom: 8 }} />
          <T bold style={{fontSize:13,color:'#274969'}}>{isEn ? 'Contraction Timer' : 'Kasılma Sayacı'}</T>
          <T style={{fontSize:10,color:'#567594',marginTop:2}}>{isEn ? 'Duration & interval' : 'Süre & aralık'}</T>
        </Tap>

        <Tap
          onPress={()=>open('hospitalBag')}
          label="Hastane çantasını aç"
          style={{width:145,padding:14,borderRadius:18,backgroundColor:'#F4EEF7',borderWidth:1,borderColor:'#E7DAED',...shadow}}
        >
          <CleanIcon asset="card_hospital_bag" size={44} imgSize={40} icon="bag" tint="#7C5292" style={{ marginBottom: 8 }} />
          <T bold style={{fontSize:13,color:'#452A56'}}>{isEn ? 'Hospital Bag' : 'Doğum Çantası'}</T>
          <T style={{fontSize:10,color:'#7A6588',marginTop:2}}>{isEn ? 'Mom, baby & partner' : 'Anne, bebek & refakatçi'}</T>
        </Tap>

        <Tap
          onPress={()=>open('breathingGuide')}
          label="Nefes egzersizini aç"
          style={{width:145,padding:14,borderRadius:18,backgroundColor:'#EEF6F8',borderWidth:1,borderColor:'#D9ECF0',...shadow}}
        >
          <CleanIcon asset="ui_postpartum_lotus" size={44} imgSize={40} icon="leaf" tint="#3B8B9B" style={{ marginBottom: 8 }} />
          <T bold style={{fontSize:13,color:'#1F5A67'}}>{isEn ? 'Breathing Guide' : 'Nefes Egzersizi'}</T>
          <T style={{fontSize:10,color:'#487E8C',marginTop:2}}>{isEn ? '4-7-8, Lamaze & Box' : '4-7-8, Lamaze & Kutu'}</T>
        </Tap>

        <Tap
          onPress={()=>open('weight')}
          label="Kilo takibini aç"
          style={{width:145,padding:14,borderRadius:18,backgroundColor:'#EBF3EE',borderWidth:1,borderColor:'#D7E8DD',...shadow}}
        >
          <CleanIcon asset="card_scale" size={44} imgSize={40} icon="scale" tint="#4F8464" style={{ marginBottom: 8 }} />
          <T bold style={{fontSize:13,color:'#284F38'}}>{isEn ? 'Weight Tracker' : 'Kilo Takibi'}</T>
          <T style={{fontSize:10,color:'#567E67',marginTop:2}}>{isEn ? 'Weekly trend' : 'Haftalık eğilim'}</T>
        </Tap>
      </HorizontalScroll>
    </View>

    {/* ─── 11. HAFTANIN UZMAN REHBERLERİ ─── */}
    <View style={{marginTop:8}}>
      <Section title={isEn ? 'Weekly Curated Guides' : 'Haftanın Seçilmiş Rehberleri'} action={isEn ? 'See all' : 'Tümünü gör'} onPress={()=>open('topicHub')}/>
      <HorizontalScroll contentContainerStyle={{gap:12,paddingBottom:4}}>
        {articles.filter(a=>a.topic==='pregnancy'||a.topic==='nutrition'||a.topic==='wellbeing').slice(0,5).map(art=>(
          <Tap
            key={art.id}
            onPress={()=>open('editorialArticle',{article:art})}
            label={art.title}
            style={{width:232,borderRadius:22,backgroundColor:'#FFFFFF',overflow:'hidden',borderWidth:1,borderColor:'#ECE2EC',...shadow}}
          >
            {(() => {
              const coverImg = generatedAssets[art.image] || getAsset(art.image);
              return coverImg ? (
                <View style={{width:'100%',aspectRatio:640/349,backgroundColor:'#F6F0F3',position:'relative',overflow:'hidden',alignItems:'center',justifyContent:'center'}}>
                  <Image source={coverImg} style={{width:'100%',height:'100%'}} resizeMode="cover"/>
                  <View style={{position:'absolute',top:8,right:8,backgroundColor:'rgba(0, 0, 0, 0.62)',paddingHorizontal:8,paddingVertical:3,borderRadius:10,flexDirection:'row',alignItems:'center',gap:4}}>
                    <Icon name="clock" size={11} color="white" />
                    <T bold style={{fontSize:10.5,color:'white'}}>{art.minutes} {isEn ? 'min' : 'dk'}</T>
                  </View>
                </View>
              ) : null;
            })()}
            <View style={{padding:14}}>
              <T bold numberOfLines={2} style={{fontSize:14,color:colors.ink,lineHeight:20}}>{art.title}</T>
              <T numberOfLines={1} style={{fontSize:11.5,color:colors.muted,marginTop:4}}>{art.subtitle}</T>
            </View>
          </Tap>
        ))}
      </HorizontalScroll>
    </View>
  </Page>;
}

export const sampleRecords = [
  { id: 'rec-sample-1', type: 'Emzirme', value: 'Sol meme • 15 dk', time: '14:20' },
  { id: 'rec-sample-2', type: 'Bez', value: 'Islak', time: '13:05' },
  { id: 'rec-sample-3', type: 'Biberon', value: '90 ml', time: '11:30' },
  { id: 'rec-sample-4', type: 'Uyku', value: '1 sa 40 dk', time: '09:15' },
];

export function RecordList({ records = [], trackerEvents = [], onDelete, onUndo, lastUndoAction, lang = 'tr' }) {
  const isEn = lang === 'en';
  const typeMap = {
    'Emzirme': isEn ? 'Nursing' : 'Emzirme',
    'Biberon': isEn ? 'Bottle' : 'Biberon',
    'Uyku': isEn ? 'Sleep' : 'Uyku',
    'Bez': isEn ? 'Diaper' : 'Bez',
    'Tekme': isEn ? 'Kicks' : 'Tekme',
    'Fetal Hareket': isEn ? 'Fetal Movement' : 'Fetal Hareket',
    'Sancı & Kasılma': isEn ? 'Contraction' : 'Sancı & Kasılma',
    'Kasılma': isEn ? 'Contraction' : 'Kasılma',
    'Su': isEn ? 'Water' : 'Su',
    'Vitamin': isEn ? 'Vitamin' : 'Vitamin',
    'Kilo': isEn ? 'Weight' : 'Kilo',
    'Nefes': isEn ? 'Breathing' : 'Nefes',
  };
  const iconMap = {
    'Emzirme': 'nursing',
    'Biberon': 'bottle',
    'Uyku': 'moon',
    'Bez': 'diaper',
    'Tekme': 'footprint',
    'Fetal Hareket': 'footprint',
    'Sancı & Kasılma': 'clock',
    'Kasılma': 'clock',
    'Su': 'drop',
    'Vitamin': 'heart',
    'Kilo': 'scale',
    'Nefes': 'leaf',
  };

  function localizeValue(val) {
    if (!val) return '';
    if (!isEn) return val;
    return val
      .replace('Sol meme', 'Left breast')
      .replace('Sağ meme', 'Right breast')
      .replace('dk', 'min')
      .replace('sa', 'h')
      .replace('Islak', 'Wet')
      .replace('Kirli', 'Dirty')
      .replace('Temiz', 'Clean')
      .replace('tekme', 'kicks')
      .replace('hareket', 'movements')
      .replace('seans', 'session')
      .replace('bardak içildi', 'glasses logged')
      .replace('alındı', 'taken')
      .replace('Haftalık takip', 'Weekly log');
  }

  const displayItems = trackerEvents && trackerEvents.length > 0
    ? trackerEvents.filter(e => !e.deletedAt).map(e => ({
        id: e.id,
        type: e.title || e.type,
        value: e.value ? `${e.value} ${e.unit || ''}`.trim() : (e.notes || ''),
        time: new Date(e.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        syncState: e.syncState,
      }))
    : records;

  const isUndoActive = lastUndoAction && (Date.now() < (lastUndoAction.expiresAt || 0));

  return (
    <Card style={{ padding: 14 }}>
      {isUndoActive && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F3EAF6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginBottom: 12 }}>
          <T style={{ fontSize: 12, color: colors.purple }}>
            {isEn
              ? (lastUndoAction.actionType === 'delete' ? 'Record deleted' : 'Record added')
              : (lastUndoAction.actionType === 'delete' ? 'Kayıt silindi' : 'Kayıt eklendi')}
          </T>
          <Tap onPress={onUndo} style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.purple, borderRadius: 6 }}>
            <T bold style={{ fontSize: 11, color: '#fff' }}>{isEn ? 'Undo' : 'Geri Al'}</T>
          </Tap>
        </View>
      )}

      {displayItems.length === 0 ? (
        <T style={{ fontSize: 13, color: colors.muted, textAlign: 'center', paddingVertical: 12 }}>
          {isEn ? 'No logs recorded yet today.' : 'Bugün henüz kayıt girilmedi.'}
        </T>
      ) : (
        displayItems.map((r, i) => {
          const typeDisplay = typeMap[r.type] || r.type;
          const iconName = iconMap[r.type] || 'calendar';
          return (
            <View key={r.id || i} style={s.record}>
              <View style={[s.recordIcon, { backgroundColor: '#F6EFF7' }]}>
                <Icon name={iconName} size={18} color={colors.purple} />
              </View>
              <View style={{ flex: 1 }}>
                <T bold style={{ fontSize: 13, color: colors.ink }}>{typeDisplay}</T>
                <T style={s.recordValue}>{localizeValue(r.value)}</T>
              </View>
              <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                <T style={s.recordTime}>{r.time}</T>
              </View>
              {onDelete && (
                <Tap onPress={() => onDelete(r.id)} style={{ padding: 6, marginLeft: 6 }} label={isEn ? 'Delete record' : 'Kaydı sil'}>
                  <Icon name="close" size={14} color={colors.muted} />
                </Tap>
              )}
            </View>
          );
        })
      )}
    </Card>
  );
}

export function Postpartum({ state, update, open, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const tabItems = isEn ? ['Today', 'Recovery', 'My Mood', 'Notes'] : ['Bugün', 'İyileşme', 'Ruh Halim', 'Notlar'];
  const [tab, setTab] = useState(isEn ? 'Today' : 'Bugün');

  // Journey & Profile State
  const postInfo = calculatePostpartumProgress(state?.postpartumProfile?.birthDate);
  const daysSinceBirth = postInfo?.daysSinceBirth || 14;
  const phase = postInfo?.phase || 'healing'; // 'immediate' | 'healing' | 'adapted'
  const deliveryType = state?.postpartumProfile?.deliveryType || 'vaginal'; // 'vaginal' | 'csection'

  // İyileşme Parametreleri (Spec 15: pain, bleeding, energy, incision/perine, breast, urination, bowel)
  const todayCheckin = state?.postpartumCheckin || {};
  const [painLevel, setPainLevel] = useState(todayCheckin.painLevel || 2);
  const [bleeding, setBleeding] = useState(todayCheckin.bleeding || 'normal'); // 'light' | 'normal' | 'heavy'
  const [energy, setEnergy] = useState(todayCheckin.energy || 'balanced'); // 'low' | 'balanced' | 'high'
  const [incisionOrPerine, setIncisionOrPerine] = useState(todayCheckin.incisionOrPerine || 'healing'); // 'comfortable' | 'healing' | 'tender'
  const [breast, setBreast] = useState(todayCheckin.breast || 'full'); // 'soft' | 'full' | 'engorged'
  const [urination, setUrination] = useState(todayCheckin.urination || 'easy'); // 'easy' | 'burning' | 'urgency'
  const [bowel, setBowel] = useState(todayCheckin.bowel || 'regular'); // 'regular' | 'constipated' | 'supported'

  // Not Ekleme State
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteTag, setNewNoteTag] = useState('His / Duygu');
  const notesList = state?.postpartumNotes || [
    { id: 'pn1', date: 'Bugün · 11:30', tag: 'Bebekle An', text: 'Ten tene temas sırasında göğsüme yatıp kokumu alınca hemen sakinleşti.' },
    { id: 'pn2', date: 'Dün · 20:15', tag: 'His / Duygu', text: 'Yorgunum ama ona her baktığımda içimi tarifsiz bir şefkat kaplıyor.' },
  ];

  // Doğum Şekline ve Döneme Göre Dinamik Günlük Bakım Adımları (Spec 15: Static checklist yerine dinamik)
  const dynamicActions = useMemo(() => {
    if (phase === 'immediate') {
      return deliveryType === 'csection' ? [
        { id: 'a1', text: isEn ? 'Keep C-section incision clean and dry' : 'Kesi yerini temiz ve kuru tut', icon: 'shield' },
        { id: 'a2', text: isEn ? 'Support abdomen with a pillow when coughing or sitting' : 'Kalkarken veya öksürürken yastıkla karnını destekle', icon: 'heart' },
        { id: 'a3', text: isEn ? 'Take gentle 5-minute indoor walking breaks' : 'Ev içinde kısa 5 dakikalık dolaşım yürüyüşleri yap', icon: 'footprint' },
        { id: 'a4', text: isEn ? 'Rest your eyes whenever your baby sleeps' : 'Bebek her uyuduğunda gözlerini dinlendir', icon: 'moon' },
      ] : [
        { id: 'a1', text: isEn ? 'Apply warm peri-bottle wash or soothing cold pad' : 'Ilık suyla perine temizliği veya soğuk jel kompres yap', icon: 'drop' },
        { id: 'a2', text: isEn ? 'Rest your pelvic floor without prolonged standing' : 'Uzun süre ayakta kalmayarak pelvik tabanı dinlendir', icon: 'leaf' },
        { id: 'a3', text: isEn ? 'Drink warm herbal tea and hydration fluids' : 'Bol ılık su, rezene veya komposto ile hidrasyon sağla', icon: 'coffee' },
        { id: 'a4', text: isEn ? 'Rest your body whenever baby naps' : 'Bebek uyudukça bedenini yatay pozisyonda dinlendir', icon: 'moon' },
      ];
    } else if (phase === 'healing') {
      return [
        { id: 'a1', text: isEn ? 'Practice gentle 5-minute pelvic floor (Kegel) rhythm' : '5 dakikalık nazik pelvik taban (Kegel) ritmini uygula', icon: 'heart' },
        { id: 'a2', text: isEn ? 'Take a relaxing 15-minute fresh air stroller stroll' : 'Açık havada 15 dakikalık sakin bir nefes yürüyüşüne çık', icon: 'footprint' },
        { id: 'a3', text: isEn ? 'Take iron and postnatal lactation vitamins' : 'Demir ve multivitamin takviyeni düzenli al', icon: 'shield' },
        { id: 'a4', text: isEn ? 'Carve out 20 minutes of quiet self-care time' : 'Kendine 20 dakikalık sessiz ve şefkatli bir alan aç', icon: 'sparkles' },
      ];
    } else {
      return [
        { id: 'a1', text: isEn ? 'Gentle core and spine stretching exercises' : 'Nazik omurga esnetme ve nefes hareketleri yap', icon: 'leaf' },
        { id: 'a2', text: isEn ? 'Plan 6-week postnatal checkup with your doctor' : '6. hafta hekim ve doğum sonrası kontrolünü planla', icon: 'calendar' },
        { id: 'a3', text: isEn ? 'Nourish with fiber-rich warm meals and soup' : 'Lif zengini sıcak çorba ve besleyici öğünlerle güçlen', icon: 'apple' },
        { id: 'a4', text: isEn ? 'Celebrate your postpartum progress with compassion' : 'Bedeninin katettiği yolu şefkat ve gururla kutla', icon: 'sparkles' },
      ];
    }
  }, [phase, deliveryType, isEn]);

  const completedActionIds = state?.postpartumCompletedActions || ['a1', 'a3'];

  function toggleAction(id) {
    const next = completedActionIds.includes(id)
      ? completedActionIds.filter(x => x !== id)
      : [...completedActionIds, id];
    update({ postpartumCompletedActions: next });
  }

  // İyileşme Durumunu Kaydet (Spec 15 + Tracker Engine optimistik kayıt)
  function saveRecoveryCheckin() {
    const checkinData = {
      date: new Date().toISOString().slice(0, 10),
      painLevel,
      bleeding,
      energy,
      incisionOrPerine,
      breast,
      urination,
      bowel,
      deliveryType,
    };

    const record = createTrackerRecord({
      type: TrackerTypes.POSTPARTUM,
      title: isEn ? 'Postpartum Daily Check-in' : 'Günlük Lohusa İyileşme Kaydı',
      value: isEn ? `Pain: ${painLevel}/5 · Energy: ${energy}` : `Ağrı: ${painLevel}/5 · Enerji: ${energy}`,
      metadata: checkinData,
    });

    update({
      postpartumCheckin: checkinData,
      postpartumCheckins: [checkinData, ...(state?.postpartumCheckins || []).slice(0, 30)],
      records: [record, ...(state?.records || [])],
    });

    toast && toast(isEn ? '✓ Recovery check-in saved safely! 🌸' : '✓ Bugünkü iyileşme durumu kaydedildi! 🌸');
  }

  // Not Ekleme
  function addNote() {
    if (!newNoteText.trim()) return;
    const item = {
      id: 'pn_' + Date.now(),
      date: isEn ? 'Today · Just now' : 'Bugün · Şimdi',
      tag: newNoteTag,
      text: newNoteText.trim(),
    };
    const updated = [item, ...notesList];
    update({ postpartumNotes: updated });
    setNewNoteText('');
    toast && toast(isEn ? 'Diary note saved safely 📖' : 'Günlük notun güvenle saklandı 📖');
  }

  function deleteNote(id) {
    const updated = notesList.filter(n => n.id !== id);
    update({ postpartumNotes: updated });
    toast && toast(isEn ? 'Note deleted' : 'Not silindi');
  }

  // 7 Günlük Ruh Hali Trend Verileri
  const moodHistory = state?.postpartumMoodHistory || [
    { day: isEn ? 'Mon' : 'Pzt', mood: 1 },
    { day: isEn ? 'Tue' : 'Sal', mood: 2 },
    { day: isEn ? 'Wed' : 'Çar', mood: 0 },
    { day: isEn ? 'Thu' : 'Per', mood: 3 },
    { day: isEn ? 'Fri' : 'Cum', mood: 1 },
    { day: isEn ? 'Sat' : 'Cmt', mood: 0 },
    { day: isEn ? 'Sun' : 'Paz', mood: state?.postpartumMood ?? 1 },
  ];

  return (
    <Page>
      <ScreenHero
        kicker={isEn ? 'POSTPARTUM RECOVERY HUB' : 'LOHUSALIK & İYİLEŞME PANELİ'}
        title={isEn ? `Day ${daysSinceBirth} Recovery` : `${daysSinceBirth}. Gün İyileşme`}
        body={isEn
          ? 'Personal recovery telemetry, tailored daily actions, mood reflection, and private diary.'
          : 'Doğum şekline özel iyileşme göstergeleri, günlük bakım ritmi, duygu haritası ve gizli günlük.'}
        icon="leaf"
        asset="ui_postpartum_lotus"
        stat={`${daysSinceBirth}. ${isEn ? 'day' : 'gün'}`}
        tint="#86518A"
      />

      {/* Tepe Başlık & Yolculuk Değiştirici */}
      <View style={s.topline}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <T bold style={s.pageTitle}>{isEn ? `Postpartum · Day ${daysSinceBirth}` : `Lohusalık · ${daysSinceBirth}. Gün`}</T>
            <View style={{ backgroundColor: deliveryType === 'csection' ? '#F4EAF6' : '#EBF5EE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
              <T bold style={{ fontSize: 11, color: deliveryType === 'csection' ? colors.purple : '#2F7045' }}>
                {deliveryType === 'csection' ? (isEn ? 'C-Section' : 'Sezaryen') : (isEn ? 'Vaginal' : 'Vajinal')}
              </T>
            </View>
          </View>
          <T style={s.subtitle}>
            {phase === 'immediate'
              ? (isEn ? 'Early recovery · Gentle rest and healing 🌸' : 'Erken toparlanma dönemi · Şefkatli dinlenme 🌸')
              : phase === 'healing'
              ? (isEn ? 'Uterine involution & tissue rebuilding 🌿' : 'Doku yenilenmesi ve rahim toparlanması 🌿')
              : (isEn ? 'Postpartum adaptation & balance ✨' : 'Lohusalık adaptasyonu ve güçlenme ✨')}
          </T>
        </View>
        <RoundButton icon="down" label={isEn ? 'Change journey' : 'Yolculuğunu değiştir'} onPress={() => open('journey')} />
      </View>

      {/* 4 Ana Sekme (Spec 15: Bugün | İyileşme | Ruh Halim | Notlar) */}
      <Tabs items={tabItems} active={tab} onChange={setTab} />

      {/* ─── 1. SEKME: BUGÜN (TODAY) ─── */}
      {(tab === 'Bugün' || tab === 'Today') && (
        <View style={{ gap: 14 }}>
          {/* Hızlı Günlük Bakım Telemetrisi (Su & Uyku & Ruh Hali) */}
          <Card style={{ padding: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <T bold style={{ fontSize: 14, color: colors.ink }}>{isEn ? "Today's Wellness Rhythm" : "Bugünün İyileşme Ritmi"}</T>
              <T style={{ fontSize: 11, color: colors.muted }}>{isEn ? 'Tap to log' : 'Dokunarak güncelle'}</T>
            </View>
            <View style={[s.row, { gap: 10 }]}>
              <SmallStat
                title={isEn ? 'Water' : 'Su'}
                value={`${state.water || 4}/8 ${isEn ? 'gls' : 'bardak'}`}
                icon="drop"
                tint="#E6F0F4"
                onPress={() => {
                  const next = Math.min(8, (state.water || 0) + 1);
                  update({ water: next });
                  toast && toast(isEn ? `💧 Water logged: ${next}/8 glasses` : `💧 ${next}/8 bardak su içildi`);
                }}
              />
              <SmallStat
                title={isEn ? 'Sleep' : 'Uyku'}
                value={isEn ? '6h 20m' : '6 sa 20 dk'}
                icon="moon"
                tint="#F0EAF5"
                onPress={() => open('sleepWhiteNoise')}
              />
              <SmallStat
                title={isEn ? 'Mood' : 'Ruh Hali'}
                value={state.postpartumMood != null ? (isEn ? 'Logged' : 'Kaydedildi') : (isEn ? 'Check in' : 'Belirt')}
                icon="heart"
                tint="#FAF0F4"
                onPress={() => setTab(isEn ? 'My Mood' : 'Ruh Halim')}
              />
            </View>
          </Card>

          {/* Dinamik Günlük Bakım Adımları (Delivery & Phase Specific) */}
          <Card style={{ padding: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <T bold style={{ fontSize: 15, color: colors.ink }}>
                {isEn ? `Day ${daysSinceBirth} Personalized Care` : `${daysSinceBirth}. Gün Kişiselleştirilmiş Bakım`}
              </T>
              <T style={{ fontSize: 11, color: colors.purple, fontWeight: '700' }}>
                {completedActionIds.length}/{dynamicActions.length}
              </T>
            </View>
            <T style={{ fontSize: 11.5, color: colors.muted, marginBottom: 10 }}>
              {isEn ? 'Gentle recommendations tailored to your delivery and timeline.' : 'Doğum şeklinize ve toparlanma haftanıza özel hazırlanmış nazik adımlar.'}
            </T>

            {dynamicActions.map(action => {
              const isDone = completedActionIds.includes(action.id);
              return (
                <Tap
                  key={action.id}
                  label={action.text}
                  onPress={() => toggleAction(action.id)}
                  style={[s.task, { paddingVertical: 10 }]}
                >
                  <View style={[s.checkbox, isDone && { backgroundColor: colors.sage, borderColor: colors.sage }]}>
                    {isDone && <Icon name="check" color="white" size={14} />}
                  </View>
                  <T style={[s.taskText, isDone && { color: colors.muted, textDecorationLine: 'line-through' }]}>
                    {action.text}
                  </T>
                </Tap>
              );
            })}
          </Card>

          {/* İyileşme Yolculuğu İlerleme Özeti */}
          <Card style={{ padding: 14, backgroundColor: '#FAF6FA', borderColor: '#EBDCEB' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <T bold style={{ fontSize: 14, color: colors.purple }}>
                  {isEn ? 'Holistic Maternal Recovery' : 'Bütünsel Anne İyileşmesi'}
                </T>
                <T style={{ fontSize: 11.5, color: '#594A5D', marginTop: 3 }}>
                  {isEn
                    ? 'Log your detailed symptoms (pain, lochia, energy, incision) in the Recovery tab.'
                    : 'Ağrı, kanama, dikiş ve göğüs durumunu İyileşme sekmesinden sakince kaydedebilirsin.'}
                </T>
              </View>
              <Tap
                onPress={() => setTab(isEn ? 'Recovery' : 'İyileşme')}
                style={{ backgroundColor: colors.purple, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}
              >
                <T bold style={{ color: 'white', fontSize: 11.5 }}>{isEn ? 'Open →' : 'İncele →'}</T>
              </Tap>
            </View>
          </Card>
        </View>
      )}

      {/* ─── 2. SEKME: İYİLEŞME (RECOVERY FIELDS - SPEC 15) ─── */}
      {(tab === 'İyileşme' || tab === 'Recovery') && (
        <View style={{ gap: 14 }}>
          {/* Doğum Şekli Seçimi */}
          <Card style={{ padding: 12, backgroundColor: '#FAF5FB', borderColor: '#EADCEE' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <T bold style={{ fontSize: 12.5, color: colors.purple }}>{isEn ? 'DELIVERY METHOD' : 'DOĞUM ŞEKLİ'}</T>
                <T style={{ fontSize: 11, color: colors.muted }}>{isEn ? 'Tailors perineal or incision telemetry' : 'Dikiş ve bölge takibini özelleştirir'}</T>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {[
                  { id: 'vaginal', label: isEn ? '🌿 Vaginal' : '🌿 Vajinal' },
                  { id: 'csection', label: isEn ? '🌸 C-Section' : '🌸 Sezaryen' },
                ].map(opt => (
                  <Tap
                    key={opt.id}
                    onPress={() => {
                      update({
                        postpartumProfile: {
                          ...(state.postpartumProfile || {}),
                          deliveryType: opt.id,
                        },
                      });
                    }}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 10,
                      backgroundColor: deliveryType === opt.id ? colors.purple : '#EDE4EF',
                    }}
                  >
                    <T bold={deliveryType === opt.id} style={{ fontSize: 11.5, color: deliveryType === opt.id ? 'white' : colors.ink }}>
                      {opt.label}
                    </T>
                  </Tap>
                ))}
              </View>
            </View>
          </Card>

          {/* 7 İyileşme Alanı Kartı */}
          <Card style={{ padding: 16, gap: 14 }}>
            <T bold style={{ fontSize: 16, color: colors.ink }}>{isEn ? 'Daily Maternal Recovery Signals' : 'Günlük Anne İyileşme Göstergeleri'}</T>

            {/* 1. Ağrı Düzeyi (1..5) */}
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T bold style={{ fontSize: 13, color: '#4D4150' }}>{isEn ? '1. Pain Level (1 to 5)' : '1. Ağrı Düzeyi (1 - 5)'}</T>
                <T bold style={{ fontSize: 12, color: colors.purple }}>{painLevel}/5 · {painLevel <= 2 ? (isEn ? 'Mild / Manageable' : 'Hafif sızı') : painLevel === 3 ? (isEn ? 'Moderate' : 'Orta düzey') : (isEn ? 'Significant' : 'Belirgin')}</T>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(lvl => (
                  <Tap
                    key={lvl}
                    onPress={() => setPainLevel(lvl)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: painLevel === lvl ? colors.purple : '#F2EAF4',
                      alignItems: 'center',
                    }}
                  >
                    <T bold={painLevel === lvl} style={{ fontSize: 12, color: painLevel === lvl ? 'white' : colors.ink }}>
                      {lvl}
                    </T>
                  </Tap>
                ))}
              </View>
            </View>

            {/* 2. Lohusalık Kanaması (Bleeding/Lochia) */}
            <View style={{ gap: 6 }}>
              <T bold style={{ fontSize: 13, color: '#4D4150' }}>{isEn ? '2. Lochia & Bleeding' : '2. Lohusalık Akıntısı (Losi)'}</T>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { id: 'light', label: isEn ? 'Light / Pink' : 'Az / Açık Pembe' },
                  { id: 'normal', label: isEn ? 'Normal / Brown' : 'Normal / Koyu' },
                  { id: 'heavy', label: isEn ? 'Heavy Flow' : 'Yoğun Akıntı' },
                ].map(opt => (
                  <Tap
                    key={opt.id}
                    onPress={() => setBleeding(opt.id)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: bleeding === opt.id ? colors.purple : '#F2EAF4',
                      alignItems: 'center',
                    }}
                  >
                    <T bold={bleeding === opt.id} style={{ fontSize: 11, color: bleeding === opt.id ? 'white' : colors.ink }}>
                      {opt.label}
                    </T>
                  </Tap>
                ))}
              </View>
            </View>

            {/* 3. Enerji Düzeyi */}
            <View style={{ gap: 6 }}>
              <T bold style={{ fontSize: 13, color: '#4D4150' }}>{isEn ? '3. Energy & Vitality' : '3. Enerji ve Canlılık'}</T>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { id: 'low', label: isEn ? 'Low / Exhausted' : 'Düşük / Yorgun' },
                  { id: 'balanced', label: isEn ? 'Balanced' : 'Dengeli' },
                  { id: 'high', label: isEn ? 'Vital / High' : 'Canlı / İyi' },
                ].map(opt => (
                  <Tap
                    key={opt.id}
                    onPress={() => setEnergy(opt.id)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: energy === opt.id ? colors.purple : '#F2EAF4',
                      alignItems: 'center',
                    }}
                  >
                    <T bold={energy === opt.id} style={{ fontSize: 11, color: energy === opt.id ? 'white' : colors.ink }}>
                      {opt.label}
                    </T>
                  </Tap>
                ))}
              </View>
            </View>

            {/* 4. Doğuma Özel Bölge Durumu (Vajinal -> Perine / Sezaryen -> Kesi Yeri) */}
            <View style={{ gap: 6 }}>
              <T bold style={{ fontSize: 13, color: '#4D4150' }}>
                {deliveryType === 'csection'
                  ? (isEn ? '4. C-Section Incision' : '4. Kesi Yeri Durumu')
                  : (isEn ? '4. Perineal Comfort' : '4. Perine Bölgesi Konforu')}
              </T>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { id: 'comfortable', label: isEn ? 'Comfortable' : 'Rahat / İyi' },
                  { id: 'healing', label: isEn ? 'Mild Tension' : 'Hafif Gerginlik' },
                  { id: 'tender', label: isEn ? 'Tender / Sore' : 'Hassas / Ağrılı' },
                ].map(opt => (
                  <Tap
                    key={opt.id}
                    onPress={() => setIncisionOrPerine(opt.id)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: incisionOrPerine === opt.id ? colors.purple : '#F2EAF4',
                      alignItems: 'center',
                    }}
                  >
                    <T bold={incisionOrPerine === opt.id} style={{ fontSize: 11, color: incisionOrPerine === opt.id ? 'white' : colors.ink }}>
                      {opt.label}
                    </T>
                  </Tap>
                ))}
              </View>
            </View>

            {/* 5. Göğüs & Süt Durumu */}
            <View style={{ gap: 6 }}>
              <T bold style={{ fontSize: 13, color: '#4D4150' }}>{isEn ? '5. Breast & Lactation' : '5. Göğüs & Süt Akışı'}</T>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { id: 'soft', label: isEn ? 'Soft / Easy' : 'Yumuşak' },
                  { id: 'full', label: isEn ? 'Full / Active' : 'Dolgun' },
                  { id: 'engorged', label: isEn ? 'Engorged' : 'Gergin / Sert' },
                ].map(opt => (
                  <Tap
                    key={opt.id}
                    onPress={() => setBreast(opt.id)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: breast === opt.id ? colors.purple : '#F2EAF4',
                      alignItems: 'center',
                    }}
                  >
                    <T bold={breast === opt.id} style={{ fontSize: 11, color: breast === opt.id ? 'white' : colors.ink }}>
                      {opt.label}
                    </T>
                  </Tap>
                ))}
              </View>
            </View>

            {/* 6. İdrar Boşaltımı */}
            <View style={{ gap: 6 }}>
              <T bold style={{ fontSize: 13, color: '#4D4150' }}>{isEn ? '6. Urination Comfort' : '6. İdrar Rahatlığı'}</T>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { id: 'easy', label: isEn ? 'Effortless' : 'Rahat' },
                  { id: 'burning', label: isEn ? 'Mild Sting' : 'Hafif Yanma' },
                  { id: 'urgency', label: isEn ? 'Urgency' : 'Sıkışma Hissi' },
                ].map(opt => (
                  <Tap
                    key={opt.id}
                    onPress={() => setUrination(opt.id)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: urination === opt.id ? colors.purple : '#F2EAF4',
                      alignItems: 'center',
                    }}
                  >
                    <T bold={urination === opt.id} style={{ fontSize: 11, color: urination === opt.id ? 'white' : colors.ink }}>
                      {opt.label}
                    </T>
                  </Tap>
                ))}
              </View>
            </View>

            {/* 7. Bağırsak / Sindirim */}
            <View style={{ gap: 6 }}>
              <T bold style={{ fontSize: 13, color: '#4D4150' }}>{isEn ? '7. Bowel Function' : '7. Bağırsak Hareketi'}</T>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { id: 'regular', label: isEn ? 'Regular' : 'Düzenli' },
                  { id: 'constipated', label: isEn ? 'Constipated' : 'Kabızlık Var' },
                  { id: 'supported', label: isEn ? 'Fiber/Fluids' : 'Lif Desteğiyle' },
                ].map(opt => (
                  <Tap
                    key={opt.id}
                    onPress={() => setBowel(opt.id)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: bowel === opt.id ? colors.purple : '#F2EAF4',
                      alignItems: 'center',
                    }}
                  >
                    <T bold={bowel === opt.id} style={{ fontSize: 11, color: bowel === opt.id ? 'white' : colors.ink }}>
                      {opt.label}
                    </T>
                  </Tap>
                ))}
              </View>
            </View>

            {/* Kaydet Butonu */}
            <Tap
              onPress={saveRecoveryCheckin}
              style={{
                backgroundColor: colors.purple,
                paddingVertical: 13,
                borderRadius: 14,
                alignItems: 'center',
                marginTop: 6,
              }}
            >
              <T bold style={{ color: 'white', fontSize: 13.5 }}>
                {isEn ? 'Save Today’s Recovery Signals 🌸' : 'Bugünkü İyileşme Durumunu Kaydet 🌸'}
              </T>
            </Tap>
          </Card>
        </View>
      )}

      {/* ─── 3. SEKME: RUH HALİM (MOOD & 7-DAY TREND - SPEC 15) ─── */}
      {(tab === 'Ruh Halim' || tab === 'My Mood') && (
        <View style={{ gap: 14 }}>
          {/* Günlük Duygu Seçici */}
          <Card style={{ padding: 16 }}>
            <T bold style={{ fontSize: 15, color: colors.ink, marginBottom: 4 }}>
              {isEn ? 'How are you feeling inside today?' : 'Bugün iç dünyan nasıl hissediyor?'}
            </T>
            <T style={{ fontSize: 12, color: colors.muted, marginBottom: 12 }}>
              {isEn
                ? 'Your emotions in postpartum are valid, normal, and deeply human.'
                : 'Lohusalıkta hissettiğin her duygu çok insani, doğal ve geçerlidir.'}
            </T>
            <MoodPicker
              postpartum
              value={state.postpartumMood}
              onChange={postpartumMood => {
                const todayStr = new Date().toISOString().slice(0, 10);
                const todayLabel = isEn ? 'Today' : 'Bugün';
                const curHist = state.postpartumMoodHistory
                  ? [...state.postpartumMoodHistory]
                  : [
                      { day: isEn ? 'Mon' : 'Pzt', mood: 1 },
                      { day: isEn ? 'Tue' : 'Sal', mood: 2 },
                      { day: isEn ? 'Wed' : 'Çar', mood: 0 },
                      { day: isEn ? 'Thu' : 'Per', mood: 3 },
                      { day: isEn ? 'Fri' : 'Cum', mood: 1 },
                      { day: isEn ? 'Sat' : 'Cmt', mood: 0 },
                      { day: todayLabel, mood: postpartumMood, date: todayStr },
                    ];
                const lastIdx = curHist.length - 1;
                if (lastIdx >= 0 && (curHist[lastIdx].day === 'Today' || curHist[lastIdx].day === 'Bugün' || curHist[lastIdx].date === todayStr)) {
                  curHist[lastIdx] = { ...curHist[lastIdx], mood: postpartumMood, day: todayLabel, date: todayStr };
                } else {
                  curHist.push({ day: todayLabel, mood: postpartumMood, date: todayStr });
                  if (curHist.length > 7) curHist.shift();
                }
                update({
                  postpartumMood,
                  mood: postpartumMood,
                  lastMoodDate: todayStr,
                  postpartumMoodHistory: curHist,
                });
                toast && toast(isEn ? 'Mood reflected gently 🌸' : 'Ruh halin şefkatle kaydedildi 🌸');
              }}
              lang={lang}
            />
          </Card>

          {/* 7 Günlük Ruh Hali Trend Grafiği (Spec 15: 7-day trend, NO diagnosis!) */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View>
                <T bold style={{ fontSize: 14, color: colors.ink }}>
                  {isEn ? '7-Day Emotional Rhythm' : '7 Günlük Duygu Ritmin'}
                </T>
                <T style={{ fontSize: 11, color: colors.muted }}>
                  {isEn ? 'Observing trends without judgment or diagnosis' : 'Yargısız ve teşhissiz gözlem alanı'}
                </T>
              </View>
              <T style={{ fontSize: 18 }}>🌱</T>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 110, paddingTop: 10, paddingHorizontal: 6 }}>
              {moodHistory.map((item, idx) => {
                const heightPct = item.mood === 0 ? 95 : item.mood === 1 ? 75 : item.mood === 2 ? 55 : item.mood === 3 ? 35 : 45;
                const barColor = item.mood === 0 ? '#56A072' : item.mood === 1 ? colors.purple : item.mood === 2 ? '#D18E4E' : '#B8586E';
                return (
                  <View key={idx} style={{ alignItems: 'center', flex: 1, gap: 6 }}>
                    <View style={{ width: 18, height: heightPct, backgroundColor: barColor, borderRadius: 8 }} />
                    <T style={{ fontSize: 10.5, color: colors.muted, fontWeight: '600' }}>{item.day}</T>
                  </View>
                );
              })}
            </View>
          </Card>

          {/* Şefkatli Bilgilendirme Notu (Medikal Teşhis İçermez!) */}
          <Card style={{ padding: 16, backgroundColor: '#FAF6EE', borderColor: '#EADBC6' }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <T style={{ fontSize: 20 }}>🌿</T>
              <View style={{ flex: 1 }}>
                <T bold style={{ fontSize: 13.5, color: '#744E1F' }}>
                  {isEn ? 'Gentle Emotional Space' : 'Şefkatli Duygu Notu'}
                </T>
                <T style={{ fontSize: 12, color: '#59442C', lineHeight: 18, marginTop: 4 }}>
                  {isEn
                    ? 'Postpartum shifts are entirely physiological as hormones reorganize. You are navigating an immense physical and emotional transition. Accept support freely.'
                    : 'Doğum sonrası hormonların yeniden dengelenmesi sebebiyle ani hüzün veya hassasiyet çok doğaldır. Bu bir kusur değil; bedensel ve ruhsal bir geçiş sürecidir. Sevdiklerinden destek istemekten çekinme.'}
                </T>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* ─── 4. SEKME: NOTLAR (NOTES & PRIVATE DIARY - SPEC 15) ─── */}
      {(tab === 'Notlar' || tab === 'Notes') && (
        <View style={{ gap: 14 }}>
          {/* Yeni Not Yazma Kutusu */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <T bold style={{ fontSize: 14.5, color: colors.ink }}>
                {isEn ? 'Private Postpartum Diary' : 'Özel Lohusalık Günlüğün'}
              </T>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <T style={{ fontSize: 11, color: colors.muted }}>🔒 {isEn ? 'Private to device' : 'Sadece cihazında'}</T>
              </View>
            </View>

            {/* Etiket Seçici */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 10 }}>
              {['His / Duygu', 'Bebekle An', 'Doktora Soru', 'Şükür / Farkındalık'].map(tag => (
                <Tap
                  key={tag}
                  onPress={() => setNewNoteTag(tag)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 10,
                    backgroundColor: newNoteTag === tag ? colors.purple : '#F2E8F4',
                  }}
                >
                  <T bold={newNoteTag === tag} style={{ fontSize: 11, color: newNoteTag === tag ? 'white' : colors.ink }}>
                    🏷️ {tag}
                  </T>
                </Tap>
              ))}
            </ScrollView>

            <TextInput
              value={newNoteText}
              onChangeText={setNewNoteText}
              placeholder={isEn ? 'Write your feelings, gentle victories, or baby moments...' : 'Bugünkü hislerini, küçük zaferlerini veya bebeğinle geçen anları yaz...'}
              placeholderTextColor="#A89BAA"
              multiline
              style={{
                minHeight: 85,
                backgroundColor: '#FAF7FA',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#E8DCE8',
                padding: 12,
                fontSize: 13,
                color: colors.ink,
                textAlignVertical: 'top',
              }}
            />

            <Tap
              onPress={addNote}
              style={{
                marginTop: 10,
                backgroundColor: colors.purple,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <T bold style={{ color: 'white', fontSize: 12.5 }}>
                {isEn ? '+ Save to Diary' : '+ Günlüğe Kaydet'}
              </T>
            </Tap>
          </Card>

          {/* Notlar Listesi */}
          <Section title={isEn ? `Saved Entries (${notesList.length})` : `Kaydedilenler (${notesList.length})`} />
          {notesList.length === 0 ? (
            <Card style={{ padding: 28, alignItems: 'center' }}>
              <T style={{ fontSize: 32 }}>📖</T>
              <T bold style={{ fontSize: 14, color: colors.ink, marginTop: 8 }}>
                {isEn ? 'No diary entries yet' : 'Henüz günlük notu eklenmedi'}
              </T>
              <T style={{ fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 4 }}>
                {isEn ? 'Write a small thought above to preserve your postpartum memories.' : 'Yukarıdaki alana bir his veya anını yazarak lohusalık anılarını biriktirebilirsin.'}
              </T>
            </Card>
          ) : (
            notesList.map(n => (
              <Card key={n.id} style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ backgroundColor: '#F0E5F2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                      <T bold style={{ fontSize: 10, color: colors.purple }}>🏷️ {n.tag}</T>
                    </View>
                    <T style={{ fontSize: 11, color: colors.muted }}>{n.date}</T>
                  </View>
                  <Tap onPress={() => deleteNote(n.id)} style={{ padding: 4 }}>
                    <T style={{ fontSize: 12, color: colors.muted }}>✕</T>
                  </Tap>
                </View>
                <T style={{ fontSize: 13, color: '#3A323E', lineHeight: 20 }}>{n.text}</T>
              </Card>
            ))
          )}
        </View>
      )}
    </Page>
  );
}

export function Baby({state,open,lang='tr'}) {
  const isEn = lang === 'en';
  const babyAge = state?.babyAge || 'newborn';
  const babyAgeText = babyAge === 'newborn'
    ? (isEn ? 'Newborn (0-40 days)' : 'Yenidoğan (0-40 gün)')
    : babyAge === 'month1_3'
    ? (isEn ? '1-3 Months' : '1-3 Aylık')
    : babyAge === 'month3_6'
    ? (isEn ? '3-6 Months' : '3-6 Aylık')
    : (isEn ? '6+ Months' : '6+ Aylık');

  const babyActions=[
    {type:'Emzirme',display:isEn ? 'Nursing' : 'Emzirme',key:'btn_nursing',icon:'nursing',bg:'#FCF4F7',border:'#F5E1EC',titleColor:'#6E3958',sub:isEn ? 'Right breast • 15 m' : 'Sağ meme • 15 dk'},
    {type:'Biberon',display:isEn ? 'Bottle' : 'Biberon',key:'btn_bottle',icon:'bottle',bg:'#F7F4FB',border:'#EBE1F8',titleColor:'#523977',sub:'120 ml'},
    {type:'Uyku',display:isEn ? 'Sleep' : 'Uyku',key:'btn_sleep',icon:'moon',bg:'#F2F5FB',border:'#DFE8F8',titleColor:'#38517B',sub:isEn ? '1 h 20 m' : '1 sa 20 dk'},
    {type:'Bez',display:isEn ? 'Diaper' : 'Bez',key:'btn_diaper',icon:'diaper',bg:'#F2F7F4',border:'#DDEEE4',titleColor:'#305D44',sub:isEn ? 'Clean' : 'Temiz'}
  ];
  const records=[...(state?.records || []),...sampleRecords].slice(0,4);
  return <Page>
    <ScreenHero kicker={isEn ? 'BABY CARE' : 'BEBEK BAKIMI'} title={`${state?.babyName || (isEn ? 'Your Baby' : 'Bebeğin')} · ${babyAgeText}`} body={isEn ? 'Feeding, sleep, diaper logs, and milestone guides gathered in one daily dashboard.' : 'Beslenme, uyku, bez kayıtları ve bakım rehberleri tek günlük panelde birleşir.'} icon="baby" asset="ui_baby_crib" stat={`${records.length} ${isEn ? 'logs' : 'kayıt'}`} tint="#6E5A96" />
    <View style={s.topline}><View style={s.row}><View style={s.avatar}><Image source={assets.baby} style={s.avatarImage} resizeMode="cover"/></View><View style={{marginLeft:12}}><T bold style={{fontSize:19}}>{state?.babyName || (isEn ? 'Your Baby' : 'Bebeğin')} · {babyAgeText}</T><T style={{fontSize:13,color:colors.muted,marginTop:7}}>{isEn ? "Today's daily rhythm" : 'Bugünün bakım ritmi'}</T></View></View><RoundButton icon="down" label={isEn ? 'Change journey' : 'Yolculuğunu değiştir'} onPress={()=>open('journey')}/></View>
    <BabyDaySummary state={state} open={open} lang={lang} />

    
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
          label={(isEn ? 'Log ' : '') + a.display + (isEn ? '' : ' kaydı ekle')}
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
            <T bold style={[s.babyCardTitle, { color: a.titleColor }]}>{a.display}</T>
            <T style={s.babyCardSub}>{a.sub}</T>
          </View>
        </Tap>
      ))}
    </View>
    <Section title={isEn ? "Today's logs" : 'Bugünkü kayıtlar'} action={isEn ? 'See all' : 'Tümünü gör'} onPress={()=>open('records')}/><RecordList records={records} lang={lang}/>
    <Tap onPress={()=>open('sleepWhiteNoise')} style={s.nextSleep}><View style={s.sleepIcon}>{generatedAssets['banner_next_sleep'] ? <Image source={generatedAssets['banner_next_sleep']} style={{width:54,height:54}} resizeMode="contain"/> : <Icon name="moon" size={42} color="white" fill="#AE98D4"/>}</View><View style={{flex:1}}><T style={{fontSize:13}}>{isEn ? 'Next soothing sleep time' : 'Bir sonraki uyku zamanı'}</T><T bold style={{fontSize:22,marginTop:5}}>{isEn ? '1 h 15 m' : '1 sa 15 dk'}</T><T style={{fontSize:11,marginTop:6}}>{state.babyName} {isEn ? 'usually sleeps around 21:00. Open white noise →' : 'genellikle 21:00 civarı uyuyor. Beyaz gürültü aç →'}</T></View></Tap>

    {/* Bebek Bakım Rehberleri */}
    <View style={{marginTop:10}}>
    <Section title={isEn ? 'Baby Care & Development Guides' : 'Bebek Bakımı & Gelişim Rehberleri'} action={isEn ? 'See all' : 'Tümünü gör'} onPress={()=>open('topicHub')}/>
      <HorizontalScroll contentContainerStyle={{gap:12,paddingBottom:4}}>
        {articles.filter(a=>a.topic==='baby'||a.topic==='postpartum').slice(0,5).map(rawArt=>{
          const art = getLocalizedArticle(rawArt, lang);
          return (
          <Tap
            key={art.id}
            onPress={()=>open('editorialArticle',{article:art})}
            label={art.title}
            style={{width:232,borderRadius:22,backgroundColor:'#FFFFFF',overflow:'hidden',borderWidth:1,borderColor:'#ECE2EC',...shadow}}
          >
            {(() => {
              const coverImg = generatedAssets[art.image] || getAsset(art.image);
              return coverImg ? (
                <View style={{width:'100%',aspectRatio:640/349,backgroundColor:'#F6F0F3',position:'relative',overflow:'hidden',alignItems:'center',justifyContent:'center'}}>
                  <Image source={coverImg} style={{width:'100%',height:'100%'}} resizeMode="cover"/>
                  <View style={{position:'absolute',top:8,right:8,backgroundColor:'rgba(0, 0, 0, 0.62)',paddingHorizontal:8,paddingVertical:3,borderRadius:10,flexDirection:'row',alignItems:'center',gap:4}}>
                    <Icon name="clock" size={11} color="white" />
                    <T bold style={{fontSize:10.5,color:'white'}}>{art.minutes} {isEn ? 'min' : 'dk'}</T>
                  </View>
                </View>
              ) : null;
            })()}
            <View style={{padding:14}}>
              <T bold numberOfLines={2} style={{fontSize:14,color:colors.ink,lineHeight:20}}>{art.title}</T>
              <T numberOfLines={1} style={{fontSize:11.5,color:colors.muted,marginTop:4}}>{art.subtitle}</T>
            </View>
          </Tap>
          );
        })}
      </HorizontalScroll>
    </View>
  </Page>;
}

export function Discover({state,update,open,lang='tr'}) {
  return <Page contentStyle={{gap:12}}>
    <TopicHubScreen
      openArticle={(article) => open('editorialArticle', { article })}
      openFoodChecker={() => open('foodSafety')}
      lang={lang}
    />
  </Page>;
}

export function Assistant({state,update,open,toast,lang='tr'}) {
  return <Page contentStyle={{paddingHorizontal:0}}>
    <CommunityHub state={state} update={update} open={open} toast={toast} lang={lang} />
  </Page>;
}

const s=StyleSheet.create({
  row:{flexDirection:'row',alignItems:'center'},topline:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  onboarding:{paddingHorizontal:23,paddingTop:44,paddingBottom:24,gap:0},brand:{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:8},wordmark:{fontSize:29,fontWeight:'300',letterSpacing:-0.7},
  welcome:{alignItems:'center',marginTop:29,marginBottom:35},welcomeTitle:{fontSize:26,letterSpacing:-0.5},welcomeText:{textAlign:'center',fontSize:15,lineHeight:22,marginTop:10},
  fitImage:{width:'100%',height:'100%',objectFit:'contain',objectPosition:'center',alignSelf:'center'},
  journey:{minHeight:145,borderRadius:25,overflow:'hidden',flexDirection:'row',alignItems:'center',paddingRight:14,borderWidth:1,borderColor:'#EDE1E2',...shadow},journeyPhoto:{position:'absolute',left:10,top:10,bottom:10,width:114,borderRadius:20,overflow:'hidden',backgroundColor:'#F6EEF3',alignItems:'center',justifyContent:'center'},journeyImage:{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',alignSelf:'center'},journeyCopy:{marginLeft:136,flex:1,paddingVertical:20},journeyTitle:{fontSize:18,lineHeight:24},journeySub:{fontSize:13,lineHeight:20,marginTop:7},motto:{alignItems:'center',marginTop:30,gap:7},handwritten:{fontFamily:fonts.script,fontSize:23,lineHeight:25,color:'#9A8495',textAlign:'center'},
  subtitle:{color:'#8C6B94',fontSize:15,marginTop:5},iconHit:{width:42,height:42,justifyContent:'center',alignItems:'center'},pageTitle:{fontSize:25,letterSpacing:-0.5},
  weekStrip:{flexDirection:'row',gap:7,paddingBottom:4},weekPill:{minWidth:66,alignItems:'center',paddingVertical:8,paddingHorizontal:7,borderRadius:20,backgroundColor:'#EEE8E6'},weekActive:{backgroundColor:'#A28ABB',shadowColor:'#9A80B4',shadowOpacity:0.35,shadowRadius:6,shadowOffset:{width:0,height:2}},
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
  // Onboarding modern styles (Flo / Apple Health)
  obContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  obNavHeader: { marginBottom: 20 },
  obBrandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 14 },
  obWordmark: { fontSize: 24, fontWeight: '300', letterSpacing: -0.5, color: colors.ink },
  obStepTracker: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  obStepBarTrack: { flex: 1, height: 5, backgroundColor: '#EFE7F0', borderRadius: 3, overflow: 'hidden' },
  obStepBarFill: { height: '100%', backgroundColor: colors.purple, borderRadius: 3 },
  obStepCountText: { fontSize: 11.5, color: colors.muted, fontWeight: 'bold' },

  obHeading: { marginBottom: 16 },
  obStepKicker: { fontSize: 10.5, letterSpacing: 1.2, color: colors.purple, marginBottom: 4 },
  obTitle: { fontSize: 25, letterSpacing: -0.5, color: colors.ink },
  obSubtitle: { fontSize: 13, color: colors.muted, marginTop: 4, lineHeight: 18 },

  obRoleCard: { borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#EFE6EE', overflow: 'hidden', ...shadow },
  obRoleCardActive: { borderColor: colors.purple, backgroundColor: '#FAF5FB' },
  obRolePhotoBox: { width: '100%', aspectRatio: 640 / 349, backgroundColor: '#F6F0F3', overflow: 'hidden', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  fitImage: { width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', alignSelf: 'center' },
  obRoleBadge: { position: 'absolute', top: 10, left: 12, backgroundColor: colors.purple, paddingHorizontal: 9, paddingVertical: 3.5, borderRadius: 8 },
  obRoleContent: { padding: 14 },
  obRoleTitle: { fontSize: 17, letterSpacing: -0.3, color: colors.ink },
  obRoleDesc: { fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 17 },
  obCheckCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#D4C4D4', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  obCheckCircleActive: { backgroundColor: colors.purple, borderColor: colors.purple },

  obSyncSection: { paddingVertical: 4, alignItems: 'center' },
  obSyncToggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, backgroundColor: '#F3ECF6' },
  obSyncInputRow: { width: '100%', marginTop: 10, flexDirection: 'row', gap: 8, alignItems: 'center' },
  obSyncInput: { flex: 1, height: 42, borderRadius: 12, borderWidth: 1.2, borderColor: colors.purple, paddingHorizontal: 12, backgroundColor: '#FFFFFF', fontSize: 13 },
  obSyncSubmitBtn: { height: 42, paddingHorizontal: 16, borderRadius: 12, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },

  obStageCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#EFE6EE', padding: 10, ...shadow },
  obStageCardActive: { borderColor: colors.purple, backgroundColor: '#FAF5FB' },
  obStagePhotoBox: { width: 82, height: 82, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F6F0F3', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  obStageContent: { flex: 1, marginLeft: 12, paddingRight: 4 },
  obStageTitle: { fontSize: 15.5, letterSpacing: -0.2, color: colors.ink },
  obStageDesc: { fontSize: 11.5, color: colors.muted, marginTop: 4, lineHeight: 16 },

  obWeekHeroCard: { padding: 16, alignItems: 'center', backgroundColor: '#F9F4FA', borderColor: '#EBDDEB' },
  obWeekPill: { width: 54, paddingVertical: 10, borderRadius: 16, backgroundColor: '#F0EAF0', alignItems: 'center', justifyContent: 'center' },
  obWeekPillActive: { backgroundColor: colors.purple },
  obOptionPill: { flex: 1, paddingVertical: 11, paddingHorizontal: 8, borderRadius: 14, borderWidth: 1.2, borderColor: '#E6DCE6', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  obOptionPillActive: { backgroundColor: colors.purple, borderColor: colors.purple },
  obOptionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 13, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1.2, borderColor: '#E6DCE6' },
  obOptionRowActive: { borderColor: colors.purple, backgroundColor: '#FAF5FB' },
  obTextInput: { height: 44, borderRadius: 14, borderWidth: 1.2, borderColor: '#E6DCE6', backgroundColor: '#FFFFFF', paddingHorizontal: 14, fontSize: 13.5 },

  obInterestCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1.2, borderColor: '#ECE4EC', gap: 12 },
  obInterestCardActive: { borderColor: colors.purple, backgroundColor: '#FAF5FB' },
  obInterestIconBox: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F4EFF4', alignItems: 'center', justifyContent: 'center' },
  obInterestTitle: { fontSize: 13.5, color: colors.ink },
  obInterestSub: { fontSize: 11, color: colors.muted, marginTop: 1 },

  obPrepLogoBox: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F7EFF7', alignItems: 'center', justifyContent: 'center', ...shadow },
  obProgressTrack: { width: '100%', height: 8, borderRadius: 4, backgroundColor: '#EDE4EF', overflow: 'hidden' },
  obProgressFill: { height: '100%', backgroundColor: colors.purple, borderRadius: 4 },
  obProgressMeta: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 },
  obProgressPercent: { fontSize: 18, color: '#8F6390' },
  obProgressText: { fontSize: 12, color: colors.muted },
  obChecklist: { width: '100%', backgroundColor: '#FAF6FA', padding: 16, borderRadius: 18, gap: 12, borderWidth: 1, borderColor: '#ECE0EB' },
  obCheckItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 2 },
  obCheckItemActive: { transform: [{ scale: 1.01 }] },
  obMiniCheck: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E2D4E2', alignItems: 'center', justifyContent: 'center' },
  obMiniCheckDone: { backgroundColor: '#388E5A' },
  obMiniCheckActive: { backgroundColor: '#B990B2' },
  obMiniDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#8E7B8E' },
  obCheckLabel: { fontSize: 12.5, color: colors.muted },
  obCheckLabelDone: { color: colors.ink, fontFamily: fonts.bold },

  obPrimaryBtn: { flexDirection: 'row', backgroundColor: colors.purple, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', gap: 8, ...shadow },
  obPrimaryBtnText: { color: 'white', fontSize: 14.5 },
  obSecondaryBtn: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, backgroundColor: '#EFE7EE', alignItems: 'center', justifyContent: 'center' },
  obSecondaryBtnText: { color: colors.ink, fontSize: 13.5 },
});
