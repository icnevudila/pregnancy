import React, { useState, useRef } from 'react';
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
import { calculateDueDateFromWeek, resolveJourneyState } from './domain/journeyState';

export const getJourneys = (lang = 'tr') => [
  { key: 'pregnancy', title: lang === 'en' ? "I'm Pregnant" : 'Hamileyim', sub: lang === 'en' ? 'Preparing to meet\nmy baby' : 'Bebeğimle tanışmaya\nhazırlanıyorum', image: assets.pregnancy, tint: '#F5E7E8' },
  { key: 'postpartum', title: lang === 'en' ? 'Recently Delivered' : 'Yeni doğum yaptım', sub: lang === 'en' ? 'Be by my side in\npostpartum recovery' : 'Lohusalık sürecimde\nyanımda ol', image: assets.mother, tint: '#F5E5E7' },
  { key: 'baby', title: lang === 'en' ? 'Raising My Baby' : 'Bebeğimi\nbüyütüyorum', sub: lang === 'en' ? 'Together every single day' : 'Her gününde birlikte', image: assets.baby, tint: '#EAEAE3' },
];
export const journeys = getJourneys('tr');

export function Onboarding({ choose, update, toast, lang = 'tr', open, setPage }) {
  const isEn = lang === 'en';
  // 5 Aşamalı İnteraktif Onboarding (Flo / Apple Health Stili)
  const [step, setStep] = useState(1);

  // Kullanıcı Seçimleri
  const [role, setRole] = useState('mother'); // 'mother' | 'father'
  const [stage, setStage] = useState('pregnancy'); // 'pregnancy' | 'postpartum' | 'baby'
  const [week, setWeek] = useState(24);
  const [gender, setGender] = useState('surprise'); // 'girl' | 'boy' | 'surprise'
  const [firstBaby, setFirstBaby] = useState(true);
  const [babyAge, setBabyAge] = useState('newborn');
  const [babyName, setBabyName] = useState('Ada');
  const [selectedInterests, setSelectedInterests] = useState([
    'fetal3d', 'foodSafety', 'hospitalBag', 'counters'
  ]);
  const [showSyncInput, setShowSyncInput] = useState(false);
  const [partnerCode, setPartnerCode] = useState('');

  // 5. Adım: Analiz ve Hazırlanıyor Animasyonu
  const [prepProgress, setPrepProgress] = useState(0);
  const [prepComplete, setPrepComplete] = useState(false);

  React.useEffect(() => {
    if (step === 5) {
      let current = 0;
      const interval = setInterval(() => {
        current += 10;
        if (current >= 100) {
          current = 100;
          clearInterval(interval);
          setPrepProgress(100);
          setPrepComplete(true);
        } else {
          setPrepProgress(current);
        }
      }, 140);
      return () => clearInterval(interval);
    }
  }, [step]);

  function handleComplete() {
    const calculatedDueDate = calculateDueDateFromWeek(stage === 'pregnancy' ? week : 24);
    const assignedName = role === 'father' ? (isEn ? 'Alex' : 'Mehmet') : (isEn ? 'Emma' : 'Zeynep');
    const assignedPartnerName = role === 'father' ? (isEn ? 'Emma' : 'Zeynep') : (isEn ? 'Alex' : 'Mehmet');
    const effectiveBabyName = babyName.trim() || (isEn ? 'Maya' : 'Ada');
    const effectiveGender = gender === 'girl' ? (isEn ? 'Girl' : 'Kız') : gender === 'boy' ? (isEn ? 'Boy' : 'Erkek') : (isEn ? 'Surprise' : 'Henüz Sürpriz');

    if (update) {
      update({
        role,
        mode: stage,
        week: stage === 'pregnancy' ? week : 24,
        dueDate: calculatedDueDate,
        babyGender: effectiveGender,
        babyName: effectiveBabyName,
        name: assignedName,
        partnerName: assignedPartnerName,
        partnerRole: role === 'father' ? 'mother' : 'father',
        partnerConnected: true,
        firstBaby,
        interests: selectedInterests,
        user: {
          id: 'local-guest',
          isGuest: true,
          role,
          name: assignedName,
        },
        household: {
          id: 'hh-local-1',
          name: isEn ? 'Our Family' : 'Bizim Ailemiz',
          role,
          members: [
            { id: 'user-1', name: assignedName, role },
            { id: 'user-2', name: assignedPartnerName, role: role === 'father' ? 'mother' : 'father' },
          ],
        },
        pregnancy: {
          dueDate: calculatedDueDate,
          week: stage === 'pregnancy' ? week : 24,
          babyGender: effectiveGender,
          babyName: effectiveBabyName,
        },
        baby: {
          name: effectiveBabyName,
          gender: effectiveGender,
          birthDate: new Date().toISOString().slice(0, 10),
        },
      });
    }
    toast && toast(role === 'father'
      ? (isEn ? 'Welcome Father! Your family journey has begun.' : 'Hoş geldin Baba! Aile yolculuğunuz başladı.')
      : (isEn ? 'Welcome Mother! Your personalized journey is ready.' : 'Hoş geldin Anne! Kişisel yolculuğun hazır.'));
    choose(stage);
  }

  function handleSyncSubmit() {
    if (!partnerCode.trim()) return;
    toast && toast(isEn ? 'Successfully connected to partner account!' : 'Eşinin aile hesabına başarıyla bağlandın!');
    if (update) {
      update({
        role,
        partnerConnected: true,
        partnerSyncCode: partnerCode.trim(),
      });
    }
    setStep(3);
  }

  function toggleInterest(id) {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter(i => i !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  }

  // ─── ADIM 1: ROL SEÇİMİ ───
  function renderStep1() {
    return (
      <View style={{ gap: 16 }}>
        <View style={s.obHeading}>
          <T bold style={s.obStepKicker}>{isEn ? 'STEP 1 · CHOOSE YOUR ROLE' : 'ADIM 1 · ROLÜNÜ SEÇ'}</T>
          <T bold style={s.obTitle}>{isEn ? 'Welcome to Momora' : "Momora'ya Hoş Geldin"}</T>
          <T style={s.obSubtitle}>
            {isEn ? 'Let us get to know you first so we can offer the right guidance for you and your family.' : 'Sana ve ailene en doğru rehberliği sunabilmemiz için önce seni tanıyalım.'}
          </T>
        </View>

        {/* 2 Büyük Fotoğraflı Rol Kartı (No cheap emojis) */}
        <View style={{ gap: 14 }}>
          {/* Ben Anneyim */}
          <Tap
            onPress={() => setRole('mother')}
            label={isEn ? "I'm the Mother" : 'Ben Anneyim'}
            style={[s.obRoleCard, role === 'mother' && s.obRoleCardActive]}
          >
            <View style={s.obRolePhotoBox}>
              <Image
                source={generatedAssets['blog_pregnant_morning'] || generatedAssets['pregnancy']}
                style={StyleSheet.absoluteFill}
                resizeMode="contain"
              />
            </View>
            <View style={s.obRoleContent}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <T bold style={s.obRoleTitle}>{isEn ? "I'm the Mother" : 'Ben Anneyim'}</T>
                <View style={[s.obCheckCircle, role === 'mother' && s.obCheckCircleActive]}>
                  {role === 'mother' && <Icon name="check" size={13} color="white" />}
                </View>
              </View>
              <T style={s.obRoleDesc}>
                {isEn ? 'Pregnancy tracking, bodily wellness, fetal movements, and postpartum recovery guide.' : 'Hamilelik takibi, beden sağlığı, fetal hareketler ve doğum sonrası iyileşme rehberi.'}
              </T>
            </View>
          </Tap>

          {/* Ben Babayım */}
          <Tap
            onPress={() => setRole('father')}
            label={isEn ? "I'm the Father" : 'Ben Babayım'}
            style={[s.obRoleCard, role === 'father' && s.obRoleCardActive]}
          >
            <View style={s.obRolePhotoBox}>
              <Image
                source={generatedAssets['blog_father_baby_bond'] || generatedAssets['blog_couple_bump']}
                style={StyleSheet.absoluteFill}
                resizeMode="contain"
              />
            </View>
            <View style={s.obRoleContent}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <T bold style={s.obRoleTitle}>{isEn ? "I'm the Father" : 'Ben Babayım'}</T>
                <View style={[s.obCheckCircle, role === 'father' && s.obCheckCircleActive]}>
                  {role === 'father' && <Icon name="check" size={13} color="white" />}
                </View>
              </View>
              <T style={s.obRoleDesc}>
                {isEn ? 'Partner support, mutual growth tracking, baby care preparation, and family synchronization.' : 'Eş desteği, ortak gelişim takibi, bebek bakımı hazırlığı ve aile senkronizasyonu.'}
              </T>
            </View>
          </Tap>
        </View>

        {/* Eşimin Aile Kodu Var Bağlantısı */}
        <View style={s.obSyncSection}>
          <Tap
            onPress={() => setShowSyncInput(!showSyncInput)}
            label="Eşimin aile kodu var"
            style={s.obSyncToggleBtn}
          >
            <Icon name="community" size={16} color={colors.purple} />
            <T bold style={{ fontSize: 12.5, color: colors.purple }}>
              {showSyncInput ? (isEn ? 'Close Input' : 'Girişi Kapat') : (isEn ? "I Have Partner's Code · Link Account" : 'Eşimin Aile Kodu Var · Ortak Hesaba Bağlan')}
            </T>
          </Tap>

          {showSyncInput && (
            <View style={s.obSyncInputRow}>
              <TextInput
                value={partnerCode}
                onChangeText={setPartnerCode}
                placeholder="MOM-7829-TR"
                placeholderTextColor={colors.muted}
                style={s.obSyncInput}
              />
              <Tap onPress={handleSyncSubmit} label="Bağlan" style={s.obSyncSubmitBtn}>
                <T bold style={{ color: 'white', fontSize: 12 }}>{isEn ? 'Link' : 'Bağlan'}</T>
              </Tap>
            </View>
          )}
        </View>


        <Card style={{ padding: 15, backgroundColor: '#FFFCF8', borderColor: '#EEE2EA' }}>
          <T bold style={{ fontSize: 16, color: colors.ink }}>{isEn ? 'Why you will open Momora every day' : 'Momora’yı her gün açma sebebin'}</T>
          <View style={{ gap: 9, marginTop: 12 }}>
            {[
              [isEn ? 'A new baby letter' : 'Yeni bebek mektubu', isEn ? 'A small emotional update every morning.' : 'Her sabah küçük, duygusal bir gelişim notu.', 'ui_baby_letter_envelope'],
              [isEn ? 'Today’s tracker ritual' : 'Bugünün takip ritüeli', isEn ? 'Water, mood, movement and prep in one flow.' : 'Su, ruh hali, hareket ve hazırlık tek akışta.', 'ui_timeline_sun_moon'],
              [isEn ? 'Weekly 3D growth' : 'Haftalık 3D gelişim', isEn ? 'See the week, compare size, save memories.' : 'Haftayı gör, boyutu kıyasla, anı sakla.', 'fetus'],
            ].map(([title, sub, asset]) => (
              <View key={title} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <CleanIcon asset={asset} size={36} imgSize={32} />
                <View style={{ flex: 1 }}><T bold style={{ fontSize: 13.5 }}>{title}</T><T style={{ fontSize: 11.5, color: colors.muted, marginTop: 2 }}>{sub}</T></View>
              </View>
            ))}
          </View>
        </Card>

        {/* Devam Butonu */}
        <Tap onPress={() => setStep(2)} label={isEn ? 'Continue' : 'Devam Et'} style={s.obPrimaryBtn}>
          <T bold style={s.obPrimaryBtnText}>{isEn ? 'Continue' : 'Devam Et'}</T>
          <Icon name="chevron" size={16} color="white" />
        </Tap>

        {/* Zaten Hesabım Var Bağlantısı */}
        <View style={{ alignItems: 'center', marginTop: 4 }}>
          <Tap
            onPress={() => {
              if (setPage) setPage('auth');
              else if (open) open('auth');
            }}
            label={isEn ? 'Already have an account? Sign In' : 'Zaten bir hesabın var mı? Giriş Yap'}
          >
            <T style={{ fontSize: 13, color: colors.purple, fontWeight: '600' }}>
              {isEn ? 'Already have an account? Sign In →' : 'Zaten bir hesabın var mı? Giriş Yap →'}
            </T>
          </Tap>
        </View>
      </View>
    );
  }

  // ─── ADIM 2: YOLCULUK AŞAMASI ───
  function renderStep2() {
    const stages = [
      {
        id: 'pregnancy',
        title: role === 'father'
          ? (isEn ? 'Expecting Our Baby' : 'Bebeğimizi Bekliyoruz')
          : (isEn ? "I'm Pregnant" : 'Hamileyim'),
        desc: isEn ? 'Weekly 3D fetal growth, movements, body changes, and birth preparation.' : 'Haftalık 3D fetal gelişim, hareketler, beden değişimleri ve doğuma hazırlık.',
        photo: generatedAssets['pregnancy'] || generatedAssets['blog_pregnant_morning'],
      },
      {
        id: 'postpartum',
        title: role === 'father'
          ? (isEn ? 'In Postpartum Period' : 'Lohusalık Dönemindeyiz')
          : (isEn ? 'Recently Delivered' : 'Yeni Doğum Yaptım'),
        desc: isEn ? 'Physical recovery, postpartum support, nursing, and first weeks care.' : 'Fiziksel toparlanma, lohusa desteği, emzirme ve ilk haftaların bakımı.',
        photo: generatedAssets['mother-baby'] || generatedAssets['blog_skin_to_skin'],
      },
      {
        id: 'baby',
        title: role === 'father'
          ? (isEn ? 'Raising Our Baby' : 'Bebeğimizi Büyütüyoruz')
          : (isEn ? 'Raising My Baby' : 'Bebeğimi Büyütüyorum'),
        desc: isEn ? 'Feeding schedule, sleep rhythm, vaccine schedule, and growth leaps.' : 'Beslenme saatleri, uyku ritmi, aşı takvimi ve büyüme atakları takibi.',
        photo: generatedAssets['baby'] || generatedAssets['blog_baby_massage'],
      },
    ];

    return (
      <View style={{ gap: 16 }}>
        <View style={s.obHeading}>
          <T bold style={s.obStepKicker}>{isEn ? 'STEP 2 · CHOOSE STAGE' : 'ADIM 2 · AŞAMA SEÇİMİ'}</T>
          <T bold style={s.obTitle}>{isEn ? 'Where Are You on Your Journey?' : 'Yolculuğun Hangi Aşamada?'}</T>
          <T style={s.obSubtitle}>
            {isEn ? 'Select your current stage so we can curate a custom timeline for you and your family.' : 'Sana ve ailene özel takvimi hazırlayabilmemiz için mevcut döneminizi seçin.'}
          </T>
        </View>

        <View style={{ gap: 12 }}>
          {stages.map(st => {
            const isSelected = stage === st.id;
            return (
              <Tap
                key={st.id}
                onPress={() => setStage(st.id)}
                label={st.title}
                style={[s.obStageCard, isSelected && s.obStageCardActive]}
              >
                <View style={s.obStagePhotoBox}>
                  <Image source={st.photo} style={StyleSheet.absoluteFill} resizeMode="contain" />
                </View>
                <View style={s.obStageContent}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <T bold style={s.obStageTitle}>{st.title}</T>
                    <View style={[s.obCheckCircle, isSelected && s.obCheckCircleActive]}>
                      {isSelected && <Icon name="check" size={13} color="white" />}
                    </View>
                  </View>
                  <T style={s.obStageDesc}>{st.desc}</T>
                </View>
              </Tap>
            );
          })}
        </View>

        {/* Butonlar */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          <Tap onPress={() => setStep(1)} label={isEn ? 'Back' : 'Geri'} style={s.obSecondaryBtn}>
            <T bold style={s.obSecondaryBtnText}>{isEn ? '← Back' : '← Geri'}</T>
          </Tap>
          <Tap onPress={() => setStep(3)} label={isEn ? 'Continue' : 'Devam Et'} style={[s.obPrimaryBtn, { flex: 2 }]}>
            <T bold style={s.obPrimaryBtnText}>{isEn ? 'Continue' : 'Devam Et'}</T>
            <Icon name="chevron" size={16} color="white" />
          </Tap>
        </View>
      </View>
    );
  }

  // ─── ADIM 3: ZAMANLAMA & KİŞİSELLEŞTİRME ───
  function renderStep3() {
    const weeksList = [
      4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40
    ];

    const trimester = week <= 12
      ? (isEn ? '1st Trimester' : '1. Trimester')
      : week <= 27
        ? (isEn ? '2nd Trimester' : '2. Trimester')
        : (isEn ? '3rd Trimester' : '3. Trimester');

    return (
      <View style={{ gap: 16 }}>
        <View style={s.obHeading}>
          <T bold style={s.obStepKicker}>{isEn ? 'STEP 3 · DETAILS & TIMING' : 'ADIM 3 · DETAYLAR VE ZAMANLAMA'}</T>
          <T bold style={s.obTitle}>
            {stage === 'pregnancy'
              ? (isEn ? 'Which Week Are You In?' : 'Kaçıncı Haftadasın?')
              : (isEn ? "Baby's Details" : 'Bebeğinin Detayları')}
          </T>
          <T style={s.obSubtitle}>
            {isEn ? 'Let’s pinpoint the details so we can deliver timely guidance and trackers.' : 'İçerikleri ve sayaçları sana tam zamanında sunabilmemiz için detayları belirleyelim.'}
          </T>
        </View>

        {stage === 'pregnancy' ? (
          <>
            {/* Seçili Hafta Göstergesi */}
            <Card style={s.obWeekHeroCard}>
              <T style={{ fontSize: 11, color: colors.purple, letterSpacing: 1, fontWeight: '700' }}>
                {isEn ? 'SELECTED PREGNANCY PERIOD' : 'SEÇİLEN HAMİLELİK DÖNEMİ'}
              </T>
              <T bold style={{ fontSize: 32, color: colors.ink, marginTop: 2 }}>{isEn ? `Week ${week}` : `${week}. Hafta`}</T>
              <T style={{ fontSize: 12.5, color: colors.muted, marginTop: 2 }}>
                {trimester} · {isEn ? `Approx. ${(40 - week) * 7} days until arrival` : `Doğuma yaklaşık ${(40 - week) * 7} gün kaldı`}
              </T>
            </Card>

            {/* Yatay Hafta Şeridi */}
            <View>
              <T bold style={{ fontSize: 13, color: colors.ink, marginBottom: 8 }}>
                {isEn ? 'Select Pregnancy Week:' : 'Hamilelik Haftanı Seç:'}
              </T>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                {weeksList.map(w => (
                  <Tap
                    key={w}
                    onPress={() => setWeek(w)}
                    label={`${w}. hafta`}
                    style={[s.obWeekPill, week === w && s.obWeekPillActive]}
                  >
                    <T bold={week === w} style={{ fontSize: 14, color: week === w ? 'white' : colors.ink }}>
                      {w}
                    </T>
                    <T style={{ fontSize: 9.5, color: week === w ? '#E8DAEE' : colors.muted, marginTop: 1 }}>
                      {isEn ? 'Wk' : 'Hafta'}
                    </T>
                  </Tap>
                ))}
              </ScrollView>
            </View>

            {/* Cinsiyet Seçimi */}
            <View>
              <T bold style={{ fontSize: 13, color: colors.ink, marginBottom: 8 }}>
                {isEn ? "Baby's Gender:" : 'Bebeğin Cinsiyeti:'}
              </T>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { id: 'girl', label: isEn ? 'Girl' : 'Kız' },
                  { id: 'boy', label: isEn ? 'Boy' : 'Erkek' },
                  { id: 'surprise', label: isEn ? 'Surprise / Not Yet' : 'Henüz Öğrenmedik' },
                ].map(g => (
                  <Tap
                    key={g.id}
                    onPress={() => setGender(g.id)}
                    label={g.label}
                    style={[s.obOptionPill, gender === g.id && s.obOptionPillActive]}
                  >
                    <T bold={gender === g.id} style={{ fontSize: 12.5, color: gender === g.id ? 'white' : colors.ink }}>
                      {g.label}
                    </T>
                  </Tap>
                ))}
              </View>
            </View>

            {/* İlk Bebek mi? */}
            <View>
              <T bold style={{ fontSize: 13, color: colors.ink, marginBottom: 8 }}>
                {isEn ? 'Birth Experience:' : 'Doğum Deneyimi:'}
              </T>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Tap
                  onPress={() => setFirstBaby(true)}
                  label="İlk Bebeğim"
                  style={[s.obOptionPill, firstBaby && s.obOptionPillActive]}
                >
                  <T bold={firstBaby} style={{ fontSize: 12.5, color: firstBaby ? 'white' : colors.ink }}>
                    {isEn ? 'First Baby' : 'İlk Bebeğim'}
                  </T>
                </Tap>
                <Tap
                  onPress={() => setFirstBaby(false)}
                  label="Daha Önce Doğum Yaptım"
                  style={[s.obOptionPill, !firstBaby && s.obOptionPillActive]}
                >
                  <T bold={!firstBaby} style={{ fontSize: 12.5, color: !firstBaby ? 'white' : colors.ink }}>
                    {isEn ? 'Experienced Parent' : 'Daha Önce Doğum Yaptım'}
                  </T>
                </Tap>
              </View>
            </View>
          </>
        ) : (
          /* Postpartum veya Bebek Detayları */
          <>
            <View>
              <T bold style={{ fontSize: 13, color: colors.ink, marginBottom: 8 }}>
                {isEn ? "Baby's Name / Nickname:" : 'Bebeğinin Adı veya Lakabı:'}
              </T>
              <TextInput
                value={babyName}
                onChangeText={setBabyName}
                placeholder={isEn ? 'e.g. Maya' : 'Örn: Ada'}
                placeholderTextColor={colors.muted}
                style={s.obTextInput}
              />
            </View>

            <View>
              <T bold style={{ fontSize: 13, color: colors.ink, marginBottom: 8 }}>
                {isEn ? "Baby's Gender:" : 'Bebeğin Cinsiyeti:'}
              </T>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { id: 'girl', label: isEn ? 'Girl' : 'Kız' },
                  { id: 'boy', label: isEn ? 'Boy' : 'Erkek' },
                  { id: 'surprise', label: isEn ? 'Prefer not to say' : 'Belirtmek İstemiyorum' },
                ].map(g => (
                  <Tap
                    key={g.id}
                    onPress={() => setGender(g.id)}
                    label={g.label}
                    style={[s.obOptionPill, gender === g.id && s.obOptionPillActive]}
                  >
                    <T bold={gender === g.id} style={{ fontSize: 12.5, color: gender === g.id ? 'white' : colors.ink }}>
                      {g.label}
                    </T>
                  </Tap>
                ))}
              </View>
            </View>

            <View>
              <T bold style={{ fontSize: 13, color: colors.ink, marginBottom: 8 }}>
                {isEn ? "Baby's Age:" : 'Bebeğin Dönemi:'}
              </T>
              <View style={{ gap: 8 }}>
                {[
                  { id: 'newborn', label: isEn ? 'Newborn · First 40 Days' : 'Yenidoğan · İlk 40 Gün' },
                  { id: 'month1_3', label: isEn ? '1 - 3 Months' : '1 - 3 Aylık' },
                  { id: 'month3_6', label: isEn ? '3 - 6 Months' : '3 - 6 Aylık' },
                  { id: 'month6_plus', label: isEn ? '6 Months & Above' : '6 Ay ve Üzeri' },
                ].map(a => (
                  <Tap
                    key={a.id}
                    onPress={() => setBabyAge(a.id)}
                    label={a.label}
                    style={[s.obOptionRow, babyAge === a.id && s.obOptionRowActive]}
                  >
                    <T bold={babyAge === a.id} style={{ fontSize: 13, color: babyAge === a.id ? colors.purple : colors.ink }}>
                      {a.label}
                    </T>
                    <View style={[s.obCheckCircle, babyAge === a.id && s.obCheckCircleActive]}>
                      {babyAge === a.id && <Icon name="check" size={13} color="white" />}
                    </View>
                  </Tap>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Butonlar */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          <Tap onPress={() => setStep(2)} label={isEn ? 'Back' : 'Geri'} style={s.obSecondaryBtn}>
            <T bold style={s.obSecondaryBtnText}>{isEn ? '← Back' : '← Geri'}</T>
          </Tap>
          <Tap onPress={() => setStep(4)} label={isEn ? 'Continue' : 'Devam Et'} style={[s.obPrimaryBtn, { flex: 2 }]}>
            <T bold style={s.obPrimaryBtnText}>{isEn ? 'Continue' : 'Devam Et'}</T>
            <Icon name="chevron" size={16} color="white" />
          </Tap>
        </View>
      </View>
    );
  }

  // ─── ADIM 4: ÖNCELİKLİ İLGİ ALANLARI ───
  function renderStep4() {
    const interestOptions = [
      { id: 'fetal3d', label: isEn ? '3D Fetal Growth & Comparison' : '3D Fetal Gelişim & Kıyaslama', icon: 'heart', sub: isEn ? 'Weekly organ and size atlas' : 'Haftalık organ ve boyut atlası' },
      { id: 'foodSafety', label: isEn ? 'Food Safety Guide' : 'Besin Güvenliği Kılavuzu', icon: 'leaf', sub: isEn ? 'Can I eat this? / Is it safe?' : 'Yenebilir mi / Güvenli mi?' },
      { id: 'hospitalBag', label: isEn ? 'Hospital Bag & Birth Plan' : 'Hastane Çantası & Doğum Planı', icon: 'bag', sub: isEn ? 'Mom, baby, and birth preference lists' : 'Anne, bebek ve doğum tercihi listeleri' },
      { id: 'counters', label: isEn ? 'Kick & Contraction Timers' : 'Tekme & Kasılma Sayaçları', icon: 'footprint', sub: isEn ? 'Fetal movements and 5-1-1 alarms' : 'Fetal hareket ve 5-1-1 kuralı alarmları' },
      { id: 'partnerSync', label: isEn ? 'Partner Sync & Notes' : 'Eş Senkronizasyonu & Ortak Notlar', icon: 'community', sub: isEn ? 'Messaging and shared milestones' : 'Eşler arası mesajlaşma ve ortak takip' },
      { id: 'babyNames', label: isEn ? 'Baby Names Directory' : 'Geniş Bebek İsimleri Keşfi', icon: 'book', sub: isEn ? '9000+ meaningful names with origins' : '9000+ anlamlı Türkçe ve evrensel isim' },
      { id: 'whiteNoise', label: isEn ? 'White Noise & Soothing Sounds' : 'Beyaz Gürültü & Uyku Sesleri', icon: 'moon', sub: isEn ? 'Womb, rain, and calming sounds' : 'Rahim içi, fön ve sakinleştirici sesler' },
      { id: 'library', label: isEn ? 'Curated Momora Library' : 'Momora Editoryal Kütüphanesi', icon: 'search', sub: isEn ? 'Week-by-week guides and practical notes' : 'Hafta hafta rehberler ve pratik kaynak notları' },
    ];

    return (
      <View style={{ gap: 16 }}>
        <View style={s.obHeading}>
          <T bold style={s.obStepKicker}>{isEn ? 'STEP 4 · INTERESTS' : 'ADIM 4 · İLGİ ALANLARI'}</T>
          <T bold style={s.obTitle}>{isEn ? 'Your Priority Topics' : 'Öncelikli Konuların'}</T>
          <T style={s.obSubtitle}>
            {isEn ? 'Which topics would you like Momora to focus on? Select as many as you like.' : 'Momora sana en çok hangi konularda eşlik etsin? İstediklerini seçebilirsin.'}
          </T>
        </View>

        <View style={{ gap: 9 }}>
          {interestOptions.map(item => {
            const active = selectedInterests.includes(item.id);
            return (
              <Tap
                key={item.id}
                onPress={() => toggleInterest(item.id)}
                label={item.label}
                style={[s.obInterestCard, active && s.obInterestCardActive]}
              >
                <View style={[s.obInterestIconBox, active && { backgroundColor: colors.purple + '18' }]}>
                  <Icon name={item.icon} size={18} color={active ? colors.purple : colors.muted} />
                </View>
                <View style={{ flex: 1 }}>
                  <T bold style={[s.obInterestTitle, active && { color: colors.purple }]}>{item.label}</T>
                  <T style={s.obInterestSub}>{item.sub}</T>
                </View>
                <View style={[s.obCheckCircle, active && s.obCheckCircleActive]}>
                  {active && <Icon name="check" size={13} color="white" />}
                </View>
              </Tap>
            );
          })}
        </View>

        {/* Butonlar */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          <Tap onPress={() => setStep(3)} label={isEn ? 'Back' : 'Geri'} style={s.obSecondaryBtn}>
            <T bold style={s.obSecondaryBtnText}>{isEn ? '← Back' : '← Geri'}</T>
          </Tap>
          <Tap onPress={() => setStep(5)} label={isEn ? 'Create My Plan' : 'Planımı Oluştur'} style={[s.obPrimaryBtn, { flex: 2 }]}>
            <T bold style={s.obPrimaryBtnText}>{isEn ? 'Create My Plan' : 'Planımı Oluştur'}</T>
            <Icon name="chevron" size={16} color="white" />
          </Tap>
        </View>
      </View>
    );
  }

  // ─── ADIM 5: HAZIRLANIYOR ───
  function renderStep5() {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 20 }}>
        <View style={s.obPrepLogoBox}>
          <BrandMark size={64} />
        </View>

        <View style={{ alignItems: 'center', gap: 6 }}>
          <T bold style={{ fontSize: 24, letterSpacing: -0.5, color: colors.ink, textAlign: 'center' }}>
            {prepComplete
              ? (isEn ? 'Your Momora Experience is Ready' : 'Momora Deneyimin Hazır')
              : (isEn ? 'Curating Your Personal Experience...' : 'Kişisel Deneyimin Hazırlanıyor')}
          </T>
          <T style={{ fontSize: 13, color: colors.muted, textAlign: 'center', maxWidth: 300 }}>
            {prepComplete
              ? (isEn ? 'All health trackers and your weekly development plan have been configured for you.' : 'Tüm sağlık araçları ve haftalık gelişim planın senin için yapılandırıldı.')
              : (isEn ? 'Analyzing preferences, personalizing weekly biological timeline...' : 'Verilerin analiz ediliyor, haftalık biyolojik akışın yapılandırılıyor...')}
          </T>
        </View>

        {/* Progress Bar */}
        <View style={s.obProgressTrack}>
          <View style={[s.obProgressFill, { width: `${prepProgress}%` }]} />
        </View>
        <T bold style={{ fontSize: 13, color: colors.purple }}>%{prepProgress}</T>

        {/* Onay Adımları Listesi */}
        <View style={s.obChecklist}>
          <View style={s.obCheckItem}>
            <View style={[s.obMiniCheck, prepProgress >= 25 && s.obMiniCheckDone]}>
              {prepProgress >= 25 ? <Icon name="check" size={11} color="white" /> : <View style={s.obMiniDot} />}
            </View>
            <T style={[s.obCheckLabel, prepProgress >= 25 && s.obCheckLabelDone]}>
              {isEn ? `Week ${week} biological growth timeline loaded` : `${week}. hafta biyolojik gelişim takvimi yüklendi`}
            </T>
          </View>

          <View style={s.obCheckItem}>
            <View style={[s.obMiniCheck, prepProgress >= 50 && s.obMiniCheckDone]}>
              {prepProgress >= 50 ? <Icon name="check" size={11} color="white" /> : <View style={s.obMiniDot} />}
            </View>
            <T style={[s.obCheckLabel, prepProgress >= 50 && s.obCheckLabelDone]}>
              {isEn ? 'Trimester and food safety guides integrated' : 'Trimester ve besin güvenliği kılavuzları entegre edildi'}
            </T>
          </View>

          <View style={s.obCheckItem}>
            <View style={[s.obMiniCheck, prepProgress >= 75 && s.obMiniCheckDone]}>
              {prepProgress >= 75 ? <Icon name="check" size={11} color="white" /> : <View style={s.obMiniDot} />}
            </View>
            <T style={[s.obCheckLabel, prepProgress >= 75 && s.obCheckLabelDone]}>
              {isEn ? 'Partner sync code MOM-7829-TR configured' : 'Eş senkronizasyon kodu MOM-7829-TR tanımlandı'}
            </T>
          </View>

          <View style={s.obCheckItem}>
            <View style={[s.obMiniCheck, prepProgress >= 100 && s.obMiniCheckDone]}>
              {prepProgress >= 100 ? <Icon name="check" size={11} color="white" /> : <View style={s.obMiniDot} />}
            </View>
            <T style={[s.obCheckLabel, prepProgress >= 100 && s.obCheckLabelDone]}>
              {isEn ? '15 smart trackers and daily baby letter ready' : '15 akıllı sayaç ve bebeğin günlük mektubu hazır'}
            </T>
          </View>
        </View>


        {prepComplete && (
          <Card style={{ width: '100%', padding: 15, backgroundColor: '#FFFCF8', borderColor: '#EDE1EA' }}>
            <T bold style={{ fontSize: 16, color: colors.ink }}>{isEn ? 'Tomorrow is already waiting' : 'Yarınki akışın hazır'}</T>
            <T style={{ fontSize: 12, color: colors.muted, lineHeight: 18, marginTop: 4 }}>{isEn ? 'Momora will bring a new baby letter, a weekly insight, and one small action when you return.' : 'Tekrar geldiğinde yeni bebek mektubu, haftalık içgörü ve tek küçük aksiyon seni bekleyecek.'}</T>
          </Card>
        )}

        {/* Başlama Butonu */}
        {prepComplete && (
          <Tap onPress={handleComplete} label={isEn ? 'Start Exploring Momora' : "Momora'yı Keşfetmeye Başla"} style={[s.obPrimaryBtn, { width: '100%', marginTop: 10 }]}>
            <T bold style={s.obPrimaryBtnText}>{isEn ? 'Start Exploring Momora' : "Momora'yı Keşfetmeye Başla"}</T>
            <Icon name="chevron" size={16} color="white" />
          </Tap>
        )}
      </View>
    );
  }

  return (
    <Page contentStyle={s.obContainer}>
      {/* Üst Logo ve İlerleme Çubuğu */}
      {step < 5 && (
        <View style={s.obNavHeader}>
          <View style={s.obBrandRow}>
            <BrandMark size={32} />
            <T style={s.obWordmark}>MOMORA</T>
          </View>

          {/* İlerleme Çubuğu */}
          <View style={s.obStepTracker}>
            <View style={s.obStepBarTrack}>
              <View style={[s.obStepBarFill, { width: `${(step / 4) * 100}%` }]} />
            </View>
            <T style={s.obStepCountText}>{step} / 4</T>
          </View>
        </View>
      )}

      {/* Dinamik Adım */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
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
  const metrics = isEn
    ? [['Feeds', '6', 'ui_nursing_dual_timer'], ['Sleep', '8h 40m', 'ui_white_noise_headphones'], ['Diapers', '5', 'ui_diaper_wet_drop'], ['Growth', 'On track', 'btn_growth_tape']]
    : [['Beslenme', '6', 'ui_nursing_dual_timer'], ['Uyku', '8 sa 40 dk', 'ui_white_noise_headphones'], ['Bez', '5', 'ui_diaper_wet_drop'], ['Gelişim', 'Takipte', 'btn_growth_tape']];
  return (
    <Card style={{ padding: 16, backgroundColor: '#FFFCF8', borderColor: '#E5DDEB' }}>
      <View style={[s.topline, { marginBottom: 12 }]}><View><T bold style={{ fontSize: 17 }}>{isEn ? '24-hour care summary' : '24 saat bakım özeti'}</T><T style={{ fontSize: 12, color: colors.muted, marginTop: 3 }}>{isEn ? 'The fastest view before the next care log.' : 'Yeni kayıt girmeden önce günün hızlı görünümü.'}</T></View><Tap onPress={() => open('records')} style={{ paddingHorizontal: 10, paddingVertical: 7, borderRadius: 13, backgroundColor: '#F0E8F4' }}><T bold style={{ fontSize: 11, color: colors.purple }}>{isEn ? 'All logs' : 'Tüm kayıtlar'}</T></Tap></View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
        {metrics.map(([title, value, asset]) => <View key={title} style={{ width: '48%', padding: 12, borderRadius: 18, backgroundColor: '#F7F3FA', borderWidth: 1, borderColor: '#E9DFEF' }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><CleanIcon asset={asset} size={32} imgSize={28} /><View><T bold style={{ fontSize: 14 }}>{value}</T><T style={{ fontSize: 11, color: colors.muted }}>{title}</T></View></View></View>)}
      </View>
    </Card>
  );
}

export function Pregnancy({ state, update, open, lang = 'tr', setPage }) {
  const isEn = lang === 'en';
  const [timelineDay, setTimelineDay] = useState('bugun'); // 'dun' | 'bugun' | 'yarin'
  const week = state.week ?? 24;
  const info = getWeekInfo(week, lang);
  const letter = getBabyLetterForWeek(week, lang);

  // Hafta şeridi: mevcut hafta ±5, tüm geçerli hafta aralığında
  const strip = [];
  for (let w = Math.max(4, week - 4); w <= Math.min(TOTAL_WEEKS, week + 5); w++) strip.push(w);

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


    
    {/* ─── 2. HAFTA ŞERİDİ ─── */}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.weekStrip}>
      {strip.map(n => (
        <Tap key={n} label={n + (isEn ? ' week' : '. hafta')} onPress={() => update({week:n})}
          accessibilityState={{selected: week === n}}
          style={[s.weekPill, week === n && s.weekActive]}>
          <T style={[{fontSize:13}, week === n && {color:'white',fontFamily:fonts.bold}]}>{n}</T>
          <T style={[{fontSize:9,marginTop:1,color: week===n?'#EEE5F4':colors.muted}]}>
            {getWeekInfo(n, lang).fruitName.split(' ')[0]}
          </T>
        </Tap>
      ))}
    </ScrollView>

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

export function Postpartum({state,update,open,lang='tr'}) {
  const isEn = lang === 'en';
  const [tab,setTab]=useState(isEn ? 'Today' : 'Bugün');
  const tasks=isEn
    ? ['Drink plenty of fluids', 'Take a gentle walk', 'Do pelvic floor exercises', 'Make time for yourself', 'Ask for support, you are not alone 💜']
    : ['Bol sıvı tüket','Hafif yürüyüş yap','Pelvik taban egzersizlerini yap','Kendine zaman ayır','Destek al, yalnız değilsin 💜'];
  const tabItems=isEn ? ['Today','Recovery','My Mood','Notes'] : ['Bugün','İyileşme','Ruh Halim','Notlar'];
  return <Page>
    <ScreenHero
      kicker={isEn ? 'POSTPARTUM FEED' : 'LOHUSALIK AKIŞI'}
      title={isEn ? `Day ${daysSinceBirth} recovery` : `${daysSinceBirth}. gün toparlanma`}
      body={isEn ? 'Keep mood, recovery steps, and daily notes in the same gentle rhythm.' : 'Ruh hali, iyileşme adımları ve günlük notlar aynı bakım ritminde kalsın.'}
      icon="leaf"
      asset="ui_postpartum_lotus"
      stat={`${state.tasks.filter(Boolean).length}/5 ${isEn ? 'steps' : 'adım'}`}
      tint="#86518A"
    />

    
    <View style={s.topline}>
      <View>
        <T bold style={s.pageTitle}>{isEn ? `Postpartum · Day ${daysSinceBirth}` : `Lohusalık · ${daysSinceBirth}. gün`}</T>
        <T style={s.subtitle}>{isEn ? 'Taking small steps together today 🌸' : 'Bugünü küçük adımlarla toparlayalım 🌸'}</T>
      </View>
      <RoundButton icon="down" label={isEn ? 'Change journey' : 'Yolculuğunu değiştir'} onPress={()=>open('journey')}/>
    </View>
    <Tabs items={tabItems} active={tab} onChange={setTab}/>

    {tab==='Bugün'||tab==='Today'||tab==='Ruh Halim'||tab==='My Mood'?<Card style={{padding:13}}><MoodPicker postpartum value={state.postpartumMood} onChange={postpartumMood=>update({postpartumMood})} lang={lang}/>{(tab==='Bugün'||tab==='Today')&&<View style={[s.row,{gap:10,marginTop:16,paddingTop:12,borderTopWidth:1,borderColor:colors.line}]}><SmallStat title={isEn ? 'Sleep' : 'Uyku'} value={isEn ? '6 h 20 m' : '6 sa 20 dk'} icon="moon" tint="#F0EAF5" onPress={()=>open('log',{type:'Uyku'})}/><SmallStat title={isEn ? 'Water' : 'Su'} value={`${state.water}/8 ${isEn ? 'gls' : 'bardak'}`} icon="drop" tint="#E6F0F4" onPress={()=>update(old=>({water:Math.min(8,old.water+1)}))}/></View>}</Card>:null}
    {(tab==='Bugün'||tab==='Today'||tab==='İyileşme'||tab==='Recovery')&&<><Card style={{padding:13}}><T bold style={{fontSize:16}}>{isEn ? "Today's self-care checklist" : 'Bugün yapabileceklerin'}</T><T style={s.taskMeta}>{state.tasks.filter(Boolean).length}/5 {isEn ? 'completed' : 'tamamlandı'}</T>{tasks.map((task,i)=><Tap key={task} label={task} accessibilityRole="checkbox" accessibilityState={{checked:state.tasks[i]}} onPress={()=>update(old=>({tasks:old.tasks.map((v,n)=>n===i?!v:v)}))} style={s.task}><View style={[s.checkbox,state.tasks[i]&&{backgroundColor:colors.sage,borderColor:colors.sage}]}>{state.tasks[i]&&<Icon name="check" color="white" size={16}/>}</View><T style={s.taskText}>{task}</T><Icon name="chevron" size={18} color={colors.muted}/></Tap>)}</Card><Card style={{padding:14}}><View style={s.topline}><T bold>{isEn ? 'Your recovery journey' : 'İyileşme yolculuğun'}</T><Icon name="leaf" color={colors.sage} fill="#9FB7A4" size={28}/></View><View style={[s.row,{gap:12,marginTop:10}]}><Progress value={state.tasks.filter(Boolean).length*20} style={{flex:1}}/><T style={{fontSize:13}}>%{state.tasks.filter(Boolean).length*20}</T></View><T style={{fontSize:12,color:colors.muted,marginTop:9}}>{isEn ? 'You grow stronger each day.' : 'Her gün biraz daha güçleniyorsun.'}</T></Card></>}
    {(tab==='Notlar'||tab==='Notes')&&<><Section title={isEn ? 'Your personal notes' : 'Sana ait küçük notlar'} action={isEn ? 'Add note' : 'Not ekle'} onPress={()=>open('note')}/>{state.notes.length?state.notes.map(n=><Card key={n.id}><T style={{lineHeight:23}}>{n.text}</T></Card>):<Card><T style={{lineHeight:23}}>{isEn ? 'A feeling, a sweet moment, questions for your midwife... All are welcome here.' : 'Bir his, küçük bir an, doktoruna sormak istediğin bir soru… Hepsine burada yer var.'}</T><Tap onPress={()=>open('note')} style={s.primary}><T style={{color:'white'}}>{isEn ? 'Add your first note' : 'İlk notunu ekle'}</T></Tap></Card>}</>}
  </Page>;
}

export function Baby({state,open,lang='tr'}) {
  const isEn = lang === 'en';
  const babyActions=[
    {type:'Emzirme',display:isEn ? 'Nursing' : 'Emzirme',key:'btn_nursing',icon:'nursing',bg:'#FCF4F7',border:'#F5E1EC',titleColor:'#6E3958',sub:isEn ? 'Right breast • 15 m' : 'Sağ meme • 15 dk'},
    {type:'Biberon',display:isEn ? 'Bottle' : 'Biberon',key:'btn_bottle',icon:'bottle',bg:'#F7F4FB',border:'#EBE1F8',titleColor:'#523977',sub:'120 ml'},
    {type:'Uyku',display:isEn ? 'Sleep' : 'Uyku',key:'btn_sleep',icon:'moon',bg:'#F2F5FB',border:'#DFE8F8',titleColor:'#38517B',sub:isEn ? '1 h 20 m' : '1 sa 20 dk'},
    {type:'Bez',display:isEn ? 'Diaper' : 'Bez',key:'btn_diaper',icon:'diaper',bg:'#F2F7F4',border:'#DDEEE4',titleColor:'#305D44',sub:isEn ? 'Clean' : 'Temiz'}
  ];
  const records=[...state.records,...sampleRecords].slice(0,4);
  return <Page>
    <ScreenHero kicker={isEn ? 'BABY CARE' : 'BEBEK BAKIMI'} title={`${state.babyName || (isEn ? 'Your Baby' : 'Bebeğin')} · ${babyAgeText}`} body={isEn ? 'Feeding, sleep, diaper logs, and milestone guides gathered in one daily dashboard.' : 'Beslenme, uyku, bez kayıtları ve bakım rehberleri tek günlük panelde birleşir.'} icon="baby" asset="ui_baby_crib" stat={`${records.length} ${isEn ? 'logs' : 'kayıt'}`} tint="#6E5A96" />
    <View style={s.topline}><View style={s.row}><View style={s.avatar}><Image source={assets.baby} style={s.avatarImage} resizeMode="cover"/></View><View style={{marginLeft:12}}><T bold style={{fontSize:19}}>{state.babyName || (isEn ? 'Your Baby' : 'Bebeğin')} · ${babyAgeText}</T><T style={{fontSize:13,color:colors.muted,marginTop:7}}>{isEn ? "Today's daily rhythm" : 'Bugünün bakım ritmi'}</T></View></View><RoundButton icon="down" label={isEn ? 'Change journey' : 'Yolculuğunu değiştir'} onPress={()=>open('journey')}/></View>
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
  journey:{minHeight:145,borderRadius:25,overflow:'hidden',flexDirection:'row',alignItems:'center',paddingRight:14,borderWidth:1,borderColor:'#EDE1E2',...shadow},journeyPhoto:{position:'absolute',left:10,top:10,bottom:10,width:114,borderRadius:20,overflow:'hidden',backgroundColor:'#F6EEF3',alignItems:'center',justifyContent:'center'},journeyImage:{width:'100%',height:'100%',objectFit:'contain',objectPosition:'center',alignSelf:'center'},journeyCopy:{marginLeft:136,flex:1,paddingVertical:20},journeyTitle:{fontSize:18,lineHeight:24},journeySub:{fontSize:13,lineHeight:20,marginTop:7},motto:{alignItems:'center',marginTop:30,gap:7},handwritten:{fontFamily:fonts.script,fontSize:23,lineHeight:25,color:'#9A8495',textAlign:'center'},
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
  obChecklist: { width: '100%', backgroundColor: '#FAF6FA', padding: 16, borderRadius: 18, gap: 12, borderWidth: 1, borderColor: '#ECE0EB' },
  obCheckItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  obMiniCheck: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E2D4E2', alignItems: 'center', justifyContent: 'center' },
  obMiniCheckDone: { backgroundColor: '#388E5A' },
  obMiniDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#8E7B8E' },
  obCheckLabel: { fontSize: 12.5, color: colors.muted },
  obCheckLabelDone: { color: colors.ink, fontFamily: fonts.bold },

  obPrimaryBtn: { flexDirection: 'row', backgroundColor: colors.purple, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', gap: 8, ...shadow },
  obPrimaryBtnText: { color: 'white', fontSize: 14.5 },
  obSecondaryBtn: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, backgroundColor: '#EFE7EE', alignItems: 'center', justifyContent: 'center' },
  obSecondaryBtnText: { color: colors.ink, fontSize: 13.5 },
});
