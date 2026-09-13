import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Switch, Image, Modal, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, fonts, shadow } from './theme';
import { Icon, BrandMark } from './Icons';
import { T, Tap, Card, ScreenHero, ToolExperienceCard, LanguageToggle } from './ui';
import { babyNamesList } from './babyNamesData';
import { dateLabel, pregnancyAt } from './domain.mjs';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import {
  signInWithEmail,
  signOut,
  cloudStatusLabel,
  saveCloudState,
  linkPartnerAccount,
} from './backendSync';

const avatarPresets = [
  { id: 'mom_preg', emoji: '🤰', labelTr: 'Hamile Anne', labelEn: 'Pregnant Mom', role: 'mother' },
  { id: 'mom_nurse', emoji: '🤱', labelTr: 'Emziren Anne', labelEn: 'Nursing Mom', role: 'mother' },
  { id: 'mom_casual', emoji: '👩', labelTr: 'Şefkatli Anne', labelEn: 'Loving Mom', role: 'mother' },
  { id: 'mom_red', emoji: '👩‍🦰', labelTr: 'Güleryüzlü Anne', labelEn: 'Joyful Mom', role: 'mother' },
  { id: 'dad_baby', emoji: '👨‍🍼', labelTr: 'Bebekli Baba', labelEn: 'Dad with Baby', role: 'father' },
  { id: 'dad_beard', emoji: '🧔', labelTr: 'Babacan', labelEn: 'Warm Dad', role: 'father' },
  { id: 'dad_casual', emoji: '👨', labelTr: 'Gururlu Baba', labelEn: 'Proud Dad', role: 'father' },
  { id: 'baby_cute', emoji: '👶', labelTr: 'Minik Melek', labelEn: 'Cute Baby', role: 'both' },
  { id: 'lotus', emoji: '🌸', labelTr: 'Pembe Lotus', labelEn: 'Pink Lotus', role: 'both' },
  { id: 'sprout', emoji: '🌱', labelTr: 'Minik Mucize', labelEn: 'Little Miracle', role: 'both' },
  { id: 'bear', emoji: '🧸', labelTr: 'Oyuncak Ayı', labelEn: 'Teddy Bear', role: 'both' },
  { id: 'bottle', emoji: '🍼', labelTr: 'Biberon & Sevgi', labelEn: 'Baby Bottle', role: 'both' },
];

export function ProfileScreen({ state, update, open, toast, choose, cloudStatus, refreshFromCloud }) {
  const lang = state?.lang || 'tr';
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'family' | 'personal' | 'favorites'
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Kişisel Form State'leri
  const [userName, setUserName] = useState(state.name || (isEn ? 'Emma' : 'Zeynep'));
  const [partnerName, setPartnerName] = useState(state.partnerName || (isEn ? 'Alex' : 'Mehmet'));
  const [babyName, setBabyName] = useState(state.babyName || (isEn ? 'Maya' : 'Ada'));
  const [babyGender, setBabyGender] = useState(state.babyGender || (isEn ? 'Girl' : 'Kız'));
  const [bloodType, setBloodType] = useState(state.bloodType || 'A Rh+');
  const [doctor, setDoctor] = useState(state.doctor || '');
  const [hospital, setHospital] = useState(state.hospital || '');
  const [dueDate, setDueDate] = useState(state.dueDate || '');

  // Mesajlaşma State'leri
  const [newPartnerMsg, setNewPartnerMsg] = useState('');
  const [inputPartnerCode, setInputPartnerCode] = useState('');
  const [partnerSyncBusy, setPartnerSyncBusy] = useState(false);
  const [newBabyLetter, setNewBabyLetter] = useState('');
  const [cloudUser, setCloudUser] = useState(null);

  const currentRole = state.role || 'mother'; // 'mother' | 'father'
  const journey = pregnancyAt(state);
  const remainingLabel = journey.remaining >= 0
    ? `${journey.remaining} ${isEn ? 'Days' : 'Gün'}`
    : (isEn ? 'Past Due' : 'Tarih Geçti');

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getUser().then(({ data }) => setCloudUser(data.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCloudUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Eşler Arası Varsayılan Mesajlar
  const defaultPartnerMessages = isEn ? [
    { id: 'pm-1', sender: 'father', senderName: partnerName, text: 'How are you feeling today sweetie? Bringing home some of your favorite fresh fruits tonight 💕', time: '12:45' },
    { id: 'pm-2', sender: 'mother', senderName: userName, text: 'Thank you so much darling! The baby was super active today, you must feel the kicks tonight 🌸', time: '13:10' },
    { id: 'pm-3', sender: 'father', senderName: partnerName, text: 'Wonderful news! I already added our Thursday ultrasound checkup to my calendar 🩺✨', time: '14:20' },
  ] : [
    { id: 'pm-1', sender: 'father', senderName: partnerName, text: 'Bugün nasılsın birtanem? Akşam senin sevdiğin meyvelerden alıp geliyorum 💕', time: '12:45' },
    { id: 'pm-2', sender: 'mother', senderName: userName, text: 'Çok teşekkür ederim sevgilim! Bebeğimiz bugün çok hareketliydi, tekmelerini akşam hissetmelisin 🌸', time: '13:10' },
    { id: 'pm-3', sender: 'father', senderName: partnerName, text: 'Harika bir haber! Perşembe günkü ultrason kontrolümüzü takvimime ekledim bile 🩺✨', time: '14:20' },
  ];

  // Bebeğe Yazılan Notlar
  const defaultBabyLetters = isEn ? [
    { id: 'bl-1', author: 'Mom & Dad', text: 'Our dearest baby, we entered week 24. We cannot wait for the day you bring joy and light to our world... 🤍', date: 'Today' },
    { id: 'bl-2', author: 'Dad', text: 'As your father, I am already practicing your first lullabies. Can’t wait to hold you, our little angel. 👶', date: '3 days ago' },
  ] : [
    { id: 'bl-1', author: 'Anne & Baba', text: 'Canımız bebeğimiz, 24. haftana girdik. Dünyamıza neşe ve ışık getireceğin günü sabırsızlıkla bekliyoruz... 🤍', date: 'Bugün' },
    { id: 'bl-2', author: 'Baba', text: 'Baban olarak ilk ninnini şimdiden ezberliyorum, seninle tanışmak için sabırsızlanıyorum küçük meleğim. 👶', date: '3 gün önce' },
  ];

  const partnerMessages = state.partnerMessages || defaultPartnerMessages;
  const babyLetters = state.babyLetters || defaultBabyLetters;
  const favNames = state.favNames || [];

  function selectRole(nextRole) {
    if (nextRole === currentRole) return;
    const nextName = nextRole === 'father' ? (partnerName || (isEn ? 'Alex' : 'Mehmet')) : (userName || (isEn ? 'Emma' : 'Zeynep'));
    const nextPartner = nextRole === 'father' ? (userName || (isEn ? 'Emma' : 'Zeynep')) : (partnerName || (isEn ? 'Alex' : 'Mehmet'));
    update({
      role: nextRole,
      name: nextName,
      partnerName: nextPartner,
      partnerRole: nextRole === 'father' ? 'mother' : 'father',
    });
    toast && toast(
      nextRole === 'father'
        ? (isEn ? 'Switched to Father view 👨‍🍼' : 'Baba moduna geçildi 👨‍🍼')
        : (isEn ? 'Switched to Mother view 🤰' : 'Anne moduna geçildi 🤰')
    );
  }

  function toggleRole() {
    selectRole(currentRole === 'mother' ? 'father' : 'mother');
  }

  async function pickImage() {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        toast && toast(isEn ? 'Please allow photo gallery access.' : 'Lütfen fotoğraf galerisi izni verin.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!res.canceled && res.assets && res.assets[0]?.uri) {
        const uri = res.assets[0].uri;
        update({ avatarUri: uri, avatarPreset: null });
        setShowAvatarModal(false);
        toast && toast(isEn ? 'Profile photo updated! 🌸' : 'Profil fotoğrafın güncellendi! 🌸');
      }
    } catch (err) {
      toast && toast(isEn ? 'Could not access photo library.' : 'Fotoğraf galerisine erişilemedi.');
    }
  }

  function selectPreset(emoji) {
    update({ avatarPreset: emoji, avatarUri: null });
    setShowAvatarModal(false);
    toast && toast(isEn ? `Avatar set to ${emoji} ✨` : `Avatar ${emoji} olarak seçildi ✨`);
  }

  function resetAvatar() {
    update({ avatarUri: null, avatarPreset: null });
    setShowAvatarModal(false);
    toast && toast(isEn ? 'Avatar reset to default.' : 'Avatar varsayılana sıfırlandı.');
  }

  function savePersonalInfo() {
    update({
      name: userName.trim(),
      partnerName: partnerName.trim(),
      babyName: babyName.trim(),
      babyGender,
      bloodType,
      doctor: doctor.trim(),
      hospital: hospital.trim(),
      dueDate: dueDate.trim(),
    });
    toast && toast(isEn ? 'Profile details updated successfully 🌸' : 'Profil bilgilerin başarıyla güncellendi 🌸');
  }

  async function handleLinkPartner() {
    if (!inputPartnerCode.trim()) {
      toast && toast(isEn ? "Please enter your partner's family code." : 'Lütfen eşinizin aile kodunu girin.');
      return;
    }
    setPartnerSyncBusy(true);
    const result = await linkPartnerAccount(inputPartnerCode.trim());
    setPartnerSyncBusy(false);

    if (result?.error) {
      toast && toast(result.error.message || (isEn ? 'Pairing failed.' : 'Eşleşme başarısız oldu.'));
      return;
    }

    if (result?.data) {
      update({
        partnerName: result.data.partner_name || partnerName,
        familyCode: result.data.family_code || inputPartnerCode.trim().toUpperCase(),
        dueDate: result.data.due_date || state.dueDate,
        babyName: result.data.baby_name || state.babyName,
      });
      setInputPartnerCode('');
      toast && toast(isEn ? 'Successfully paired with partner! 💚 All data synced.' : 'Eşinizle başarıyla eşleşildi! 💚 Tüm verileriniz senkronize.');
    }
  }

  function sendPartnerMessage() {
    if (!newPartnerMsg.trim()) return;
    const newMsg = {
      id: 'pm-' + Date.now(),
      sender: currentRole,
      senderName: currentRole === 'mother' ? userName : partnerName,
      text: newPartnerMsg.trim(),
      time: new Date().toLocaleTimeString(isEn ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };
    update(old => ({
      partnerMessages: [...(old.partnerMessages || defaultPartnerMessages), newMsg],
    }));
    setNewPartnerMsg('');
    toast && toast(isEn ? 'Message sent to partner 💌' : 'Eşine mesajın iletildi 💌');
  }

  function sendBabyLetter() {
    if (!newBabyLetter.trim()) return;
    const newLetter = {
      id: 'bl-' + Date.now(),
      author: currentRole === 'mother' ? (isEn ? 'Mom' : 'Anne') : (isEn ? 'Dad' : 'Baba'),
      text: newBabyLetter.trim(),
      date: isEn ? 'Today' : 'Bugün',
    };
    update(old => ({
      babyLetters: [newLetter, ...(old.babyLetters || defaultBabyLetters)],
    }));
    setNewBabyLetter('');
    toast && toast(isEn ? 'Letter lovingly saved for your baby 💌' : 'Bebeğine mektubun sevgiyle saklandı 💌');
  }

  async function handleSignOut() {
    await signOut();
    setCloudUser(null);
    toast && toast(isEn ? 'Signed out of cloud account.' : 'Bulut hesabından çıkıldı.');
  }

  const bloodTypes = ['A Rh+', 'A Rh-', 'B Rh+', 'B Rh-', '0 Rh+', '0 Rh-', 'AB Rh+', 'AB Rh-'];
  const matchedFavs = babyNamesList.filter(n => favNames.includes(n.id));

  return (
    <ScrollView contentContainerStyle={ps.container} showsVerticalScrollIndicator={false}>
      <ScreenHero
        kicker={isEn ? 'FAMILY PROFILE' : 'AİLE PROFİLİ'}
        title={`${currentRole === 'mother' ? userName : partnerName} · ${isEn ? `Week ${journey.week}` : `${journey.week}. hafta`}`}
        body={isEn
          ? 'Customize photo, mother/father role, language preferences, and cloud synchronization.'
          : 'Fotoğraf, anne/baba rolü, dil tercihleri ve bulut eşitlemesini tek merkezden yönetin.'}
        icon="profile"
        stat={cloudStatusLabel(cloudStatus)}
        tint={currentRole === 'mother' ? '#B84570' : '#2C6496'}
      />

      {/* ─── 1. ÜST PROFİL & AVATAR KARTI ─── */}
      <Card style={ps.heroCard}>
        <View style={ps.heroRow}>
          {/* Tıklanabilir Profil Avatarı & Kamera Rozeti */}
          <Tap
            onPress={() => setShowAvatarModal(true)}
            label={isEn ? 'Change profile picture' : 'Profil fotoğrafını değiştir'}
            style={ps.avatarWrap}
          >
            {state.avatarUri ? (
              <Image source={{ uri: state.avatarUri }} style={ps.avatarImg} resizeMode="cover" />
            ) : (
              <T style={{ fontSize: 34 }}>{state.avatarPreset || (currentRole === 'mother' ? '🤰' : '👨‍🍼')}</T>
            )}
            <View style={ps.avatarCameraBadge}>
              <Icon name="camera" size={12} color="white" />
            </View>
          </Tap>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <T bold style={ps.userName}>{currentRole === 'mother' ? userName : partnerName}</T>
              <View style={[ps.roleBadge, currentRole === 'mother' ? { backgroundColor: '#F9ECF4' } : { backgroundColor: '#EBF3FA' }]}>
                <T bold style={{ fontSize: 11, color: currentRole === 'mother' ? '#B84570' : '#2C6496' }}>
                  {currentRole === 'mother' ? (isEn ? '🤰 Mother-to-be' : '🤰 Anne Adayı') : (isEn ? '👨‍🍼 Father-to-be' : '👨‍🍼 Baba Adayı')}
                </T>
              </View>
            </View>

            <Tap onPress={() => setShowAvatarModal(true)} style={{ marginTop: 3 }}>
              <T style={{ fontSize: 11.5, color: colors.purple, fontWeight: '600' }}>
                {isEn ? 'Change photo or avatar 📸' : 'Fotoğraf veya avatar değiştir 📸'}
              </T>
            </Tap>

            {/* Bağlı Partner Bilgisi */}
            <View style={ps.partnerPill}>
              <T style={{ fontSize: 11, color: '#3E7D52' }}>
                {isEn
                  ? `💚 Connected: ${currentRole === 'mother' ? partnerName : userName}`
                  : `💚 Eş bağlı: ${currentRole === 'mother' ? partnerName : userName}`}
              </T>
            </View>
          </View>
        </View>

        {/* 2'Lİ ETKİLEŞİMLİ ROL SEÇİCİ KARTLARI (ANNE / BABA) */}
        <View style={{ marginTop: 14 }}>
          <T bold style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>
            {isEn ? 'SELECT ACTIVE ROLE' : 'AKTİF EBEVEYN ROLÜNÜ SEÇ'}
          </T>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {/* Anne Modu Kartı */}
            <Tap
              onPress={() => selectRole('mother')}
              label={isEn ? 'Mother Mode' : 'Anne Modu'}
              style={[
                ps.roleCardOption,
                currentRole === 'mother' && ps.roleCardOptionMomActive
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[ps.roleIconCircle, currentRole === 'mother' && { backgroundColor: '#F7E7F0' }]}>
                  <T style={{ fontSize: 22 }}>🤰</T>
                </View>
                <View style={{ flex: 1 }}>
                  <T bold style={{ fontSize: 13, color: currentRole === 'mother' ? '#A23463' : colors.ink }}>
                    {isEn ? 'Mother Mode' : 'Anne Modu'}
                  </T>
                  <T style={{ fontSize: 10.5, color: colors.muted }}>
                    {isEn ? 'Body & symptoms' : 'Beden & gelişim'}
                  </T>
                </View>
                {currentRole === 'mother' && (
                  <View style={[ps.miniCheck, { backgroundColor: '#A23463' }]}>
                    <Icon name="check" size={10} color="white" />
                  </View>
                )}
              </View>
            </Tap>

            {/* Baba Modu Kartı */}
            <Tap
              onPress={() => selectRole('father')}
              label={isEn ? 'Father Mode' : 'Baba Modu'}
              style={[
                ps.roleCardOption,
                currentRole === 'father' && ps.roleCardOptionDadActive
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[ps.roleIconCircle, currentRole === 'father' && { backgroundColor: '#E4EFF8' }]}>
                  <T style={{ fontSize: 22 }}>👨‍🍼</T>
                </View>
                <View style={{ flex: 1 }}>
                  <T bold style={{ fontSize: 13, color: currentRole === 'father' ? '#225985' : colors.ink }}>
                    {isEn ? 'Father Mode' : 'Baba Modu'}
                  </T>
                  <T style={{ fontSize: 10.5, color: colors.muted }}>
                    {isEn ? 'Support & partner' : 'Eş desteği & rehber'}
                  </T>
                </View>
                {currentRole === 'father' && (
                  <View style={[ps.miniCheck, { backgroundColor: '#225985' }]}>
                    <Icon name="check" size={10} color="white" />
                  </View>
                )}
              </View>
            </Tap>
          </View>
        </View>

        {/* Hafta & Kalan Gün Özeti */}
        <View style={ps.statStrip}>
          <View style={ps.statCol}>
            <T bold style={ps.statNum}>{journey.week}. {isEn ? 'Week' : 'Hafta'}</T>
            <T style={ps.statLbl}>{isEn ? 'Progress' : 'İlerleme'}</T>
          </View>
          <View style={ps.statDivider} />
          <View style={ps.statCol}>
            <T bold style={ps.statNum}>{remainingLabel}</T>
            <T style={ps.statLbl}>{isEn ? 'Time Left' : 'Kalan Süre'}</T>
          </View>
          <View style={ps.statDivider} />
          <View style={ps.statCol}>
            <T bold style={ps.statNum}>{babyName}</T>
            <T style={ps.statLbl}>{isEn ? `Baby (${babyGender})` : `Bebek (${babyGender})`}</T>
          </View>
        </View>
      </Card>

      {/* ─── 2. ALT SEKME NAVİGASYONU ─── */}
      <View style={ps.tabBar}>
        {[
          { key: 'settings', label: isEn ? '⚙️ Settings' : '⚙️ Ayarlar' },
          { key: 'personal', label: isEn ? '👤 Info' : '👤 Bilgiler' },
          { key: 'family', label: isEn ? '👨‍👩‍👧 Family' : '👨‍👩‍👧 Eş & Aile', badge: partnerMessages.length },
          { key: 'favorites', label: isEn ? '⭐ Memories' : '⭐ Anılar', badge: favNames.length },
        ].map(t => (
          <Tap
            key={t.key}
            onPress={() => setActiveTab(t.key)}
            label={t.label}
            style={[ps.tabBtn, activeTab === t.key && ps.tabBtnActive]}
          >
            <T bold={activeTab === t.key} style={[ps.tabText, activeTab === t.key && ps.tabTextActive]}>
              {t.label}
            </T>
            {t.badge ? (
              <View style={[ps.tabBadge, activeTab === t.key && { backgroundColor: colors.purple }]}>
                <T bold style={{ fontSize: 9.5, color: 'white' }}>{t.badge}</T>
              </View>
            ) : null}
          </Tap>
        ))}
      </View>

      {/* ─── 3. TAB 1: AYARLAR & DİL TERCİHLERİ ─── */}
      {activeTab === 'settings' && (
        <Card style={{ padding: 18 }}>
          {/* BÜYÜK & BELİRGİN DİL SEÇİM KARTI */}
          <View style={ps.settingSection}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <T style={{ fontSize: 20 }}>🌐</T>
              <View style={{ flex: 1 }}>
                <T bold style={{ fontSize: 15, color: colors.ink }}>
                  {isEn ? 'Application Language' : 'Uygulama Dili'}
                </T>
                <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 1 }}>
                  {isEn ? 'Select interface and clinical content language' : 'Arayüz ve editoryal içeriklerin dilini belirleyin'}
                </T>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {/* Türkçe Seçeneği */}
              <Tap
                onPress={() => {
                  update({ lang: 'tr' });
                  toast && toast('Dil Türkçe olarak güncellendi 🌸');
                }}
                label="Türkçe dili seç"
                style={[
                  ps.langCardItem,
                  lang === 'tr' && ps.langCardItemActive
                ]}
              >
                <T style={{ fontSize: 24 }}>🇹🇷</T>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <T bold style={{ fontSize: 13.5, color: lang === 'tr' ? colors.purple : colors.ink }}>Türkçe</T>
                  <T style={{ fontSize: 10.5, color: colors.muted }}>Türkiye (TR)</T>
                </View>
                {lang === 'tr' && (
                  <View style={ps.langCheckCircle}>
                    <Icon name="check" size={11} color="white" />
                  </View>
                )}
              </Tap>

              {/* İngilizce Seçeneği */}
              <Tap
                onPress={() => {
                  update({ lang: 'en' });
                  toast && toast('Language switched to English 🌸');
                }}
                label="Select English language"
                style={[
                  ps.langCardItem,
                  lang === 'en' && ps.langCardItemActive
                ]}
              >
                <T style={{ fontSize: 24 }}>🇬🇧</T>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <T bold style={{ fontSize: 13.5, color: lang === 'en' ? colors.purple : colors.ink }}>English</T>
                  <T style={{ fontSize: 10.5, color: colors.muted }}>Global (EN)</T>
                </View>
                {lang === 'en' && (
                  <View style={ps.langCheckCircle}>
                    <Icon name="check" size={11} color="white" />
                  </View>
                )}
              </Tap>
            </View>
          </View>

          {/* FOTOĞRAF VE AVATAR YÖNETİMİ KARTI */}
          <View style={[ps.settingSection, { marginTop: 16 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <T style={{ fontSize: 20 }}>📸</T>
                <View>
                  <T bold style={{ fontSize: 14.5, color: colors.ink }}>
                    {isEn ? 'Profile Photo & Persona' : 'Profil Fotoğrafı & Avatar'}
                  </T>
                  <T style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>
                    {state.avatarUri
                      ? (isEn ? 'Custom device photo uploaded' : 'Özel cihaz fotoğrafı yüklü')
                      : (state.avatarPreset ? `${state.avatarPreset} ${isEn ? 'preset avatar' : 'hazır avatar'}` : (isEn ? 'Default role avatar' : 'Varsayılan rol avatarı'))}
                  </T>
                </View>
              </View>
              <Tap onPress={() => setShowAvatarModal(true)} style={ps.smallActionBtn}>
                <T bold style={{ fontSize: 12, color: colors.purple }}>
                  {isEn ? 'Change ✎' : 'Değiştir ✎'}
                </T>
              </Tap>
            </View>
          </View>

          {/* BİLDİRİM MERKEZİ BUTONU */}
          <Card style={{ padding: 16, backgroundColor: '#FAF5FB', borderColor: '#EBDDEB', marginTop: 14, marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#F0E3F2', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="bell" size={19} color={colors.purple} />
                </View>
                <View>
                  <T bold style={{ fontSize: 14.5, color: colors.ink }}>
                    {isEn ? 'Notification & Reminder Center' : 'Bildirim & Hatırlatıcı Merkezi'}
                  </T>
                  <T style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>
                    {isEn ? 'Hydration, vitamins, kicks & test alerts' : 'Su, vitamin, fetal tekme ve test alarmları'}
                  </T>
                </View>
              </View>
            </View>

            <View style={{ marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderColor: '#EDE2EE' }}>
              <Tap
                onPress={() => open && open('notifications')}
                label={isEn ? "Open Notification Settings" : "Bildirim Ayarlarını Aç"}
                style={[ps.saveFullBtn, { marginTop: 6 }]}
              >
                <T bold style={{ color: 'white', fontSize: 13.5 }}>
                  {isEn ? '🔔 Manage All Reminders →' : '🔔 Tüm Hatırlatıcıları Yönet →'}
                </T>
              </Tap>
            </View>
          </Card>

          {/* BULUT VE EŞLEŞME BÖLÜMÜ */}
          <Card style={{ padding: 16, backgroundColor: '#FAF6FA', borderColor: '#EDE0EE', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <BrandMark size={30} />
                <View>
                  <T bold style={{ fontSize: 14.5, color: colors.ink }}>
                    {isEn ? 'Momora Cloud & Family Sync' : 'Momora Bulut & Aile Eşitlemesi'}
                  </T>
                  <T style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>
                    {cloudUser ? `${isEn ? 'Active:' : 'Aktif:'} ${cloudUser.email}` : (isEn ? 'Multi-device real-time sync' : 'Cihazlar arası anlık eşitleme')}
                  </T>
                </View>
              </View>
              {cloudUser && (
                <View style={{ backgroundColor: '#EDF7ED', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                  <T bold style={{ fontSize: 10.5, color: '#2E7D32' }}>{isEn ? 'Connected' : 'Bağlı'}</T>
                </View>
              )}
            </View>

            {cloudUser ? (
              <View style={{ marginTop: 12, gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderColor: '#EFE5F0' }}>
                  <T style={{ fontSize: 12, color: colors.muted }}>{isEn ? 'Family Sync Code' : 'Aile Eşleşme Kodu'}</T>
                  <T bold style={{ fontSize: 12, letterSpacing: 1, color: colors.ink }}>{state.familyCode || 'MOM-7829-TR'}</T>
                </View>
                <Tap onPress={handleSignOut} label={isEn ? 'Sign out' : 'Çıkış yap'} style={[ps.secondaryBtn, { marginTop: 6 }]}>
                  <T bold style={{ fontSize: 13, color: '#B42318' }}>{isEn ? 'Sign Out' : 'Oturumu Kapat'}</T>
                </Tap>
              </View>
            ) : (
              <View style={{ marginTop: 10 }}>
                <T style={{ fontSize: 11.5, color: '#5C5463', lineHeight: 17, marginBottom: 10 }}>
                  {isEn
                    ? 'Both parents can connect to the same family account and sync all logs and notes.'
                    : 'Anne ve baba olarak aynı hesaba bağlanabilir, tüm verilerinizi güvenle eşitleyebilirsiniz.'}
                </T>
                <Tap onPress={() => open && open('auth')} style={ps.saveFullBtn}>
                  <T bold style={{ color: 'white', fontSize: 13.5 }}>
                    {isEn ? 'Sign In / Create Account 🌸' : 'Giriş Yap / Hesap Oluştur 🌸'}
                  </T>
                </Tap>
              </View>
            )}
          </Card>

          {/* YOLCULUK MODU DEĞİŞTİR */}
          <Tap onPress={() => open && open('journey')} label={isEn ? 'Change journey' : 'Yolculuğu değiştir'} style={ps.secondaryBtn}>
            <T bold style={{ fontSize: 13.5, color: colors.purple }}>
              {isEn ? 'Change Journey Stage (Pregnancy / Baby)' : 'Yolculuk Aşamasını Değiştir (Hamilelik / Bebek)'}
            </T>
          </Tap>
        </Card>
      )}

      {/* ─── 4. TAB 2: KİŞİSEL & BEBEK BİLGİLERİ ─── */}
      {activeTab === 'personal' && (
        <Card style={{ padding: 18 }}>
          <T bold style={{ fontSize: 16, marginBottom: 14 }}>
            {isEn ? 'Personal & Baby Profile Details' : 'Kişisel ve Bebek Profil Bilgileri'}
          </T>

          <View style={ps.fieldGroup}>
            <T bold style={ps.fieldLabel}>{isEn ? 'Your Name' : 'Senin Adın'}</T>
            <TextInput value={userName} onChangeText={setUserName} style={ps.fieldInput} />
          </View>

          <View style={ps.fieldGroup}>
            <T bold style={ps.fieldLabel}>{isEn ? "Partner's Name" : 'Eşinin Adı'}</T>
            <TextInput value={partnerName} onChangeText={setPartnerName} style={ps.fieldInput} />
          </View>

          <View style={ps.fieldGroup}>
            <T bold style={ps.fieldLabel}>{isEn ? "Baby's Name / Nickname" : 'Bebeğin Adı / Hitap'}</T>
            <TextInput value={babyName} onChangeText={setBabyName} style={ps.fieldInput} />
          </View>

          <View style={ps.fieldGroup}>
            <T bold style={ps.fieldLabel}>{isEn ? "Baby's Gender" : 'Bebeğin Cinsiyeti'}</T>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[
                { id: 'Kız', label: isEn ? '👧 Girl' : '👧 Kız' },
                { id: 'Erkek', label: isEn ? '👦 Boy' : '👦 Erkek' },
                { id: 'Henüz Sürpriz 🤍', label: isEn ? '🤍 Surprise' : 'Henüz Sürpriz 🤍' },
              ].map(g => (
                <Tap
                  key={g.id}
                  onPress={() => setBabyGender(g.id)}
                  style={[ps.genderPick, babyGender === g.id && ps.genderPickActive]}
                >
                  <T bold={babyGender === g.id} style={{ fontSize: 12, color: babyGender === g.id ? colors.purple : colors.ink }}>
                    {g.label}
                  </T>
                </Tap>
              ))}
            </View>
          </View>

          <View style={ps.fieldGroup}>
            <T bold style={ps.fieldLabel}>{isEn ? 'Estimated Due Date' : 'Tahmini Doğum Tarihi'}</T>
            <TextInput value={dueDate} onChangeText={setDueDate} placeholder="2026-07-24" style={ps.fieldInput} />
            {!!dueDate && <T style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>{dateLabel(dueDate, isEn ? 'en-US' : 'tr-TR')}</T>}
          </View>

          <View style={ps.fieldGroup}>
            <T bold style={ps.fieldLabel}>{isEn ? "Mother's Blood Type" : 'Annenin Kan Grubu'}</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {bloodTypes.map(bt => (
                <Tap
                  key={bt}
                  onPress={() => setBloodType(bt)}
                  style={[ps.bloodPill, bloodType === bt && ps.bloodPillActive]}
                >
                  <T bold={bloodType === bt} style={{ fontSize: 11, color: bloodType === bt ? 'white' : colors.ink }}>
                    {bt}
                  </T>
                </Tap>
              ))}
            </View>
          </View>

          <View style={ps.fieldGroup}>
            <T bold style={ps.fieldLabel}>{isEn ? 'Attending Doctor' : 'Takip Eden Doktor'}</T>
            <TextInput value={doctor} onChangeText={setDoctor} style={ps.fieldInput} />
          </View>

          <View style={ps.fieldGroup}>
            <T bold style={ps.fieldLabel}>{isEn ? 'Planned Hospital / Birth Clinic' : 'Planlanan Doğum Hastanesi'}</T>
            <TextInput value={hospital} onChangeText={setHospital} style={ps.fieldInput} />
          </View>

          <Tap onPress={savePersonalInfo} label={isEn ? 'Save Info' : 'Bilgileri kaydet'} style={ps.saveFullBtn}>
            <T bold style={{ color: 'white', fontSize: 15 }}>{isEn ? 'Save My Details 🌸' : 'Bilgilerimi Kaydet 🌸'}</T>
          </Tap>
        </Card>
      )}

      {/* ─── 5. TAB 3: EŞ & AİLE ALANI ─── */}
      {activeTab === 'family' && (
        <View style={{ gap: 14 }}>
          {/* Eş Eşleşme Durumu & Aile Kodu */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <T bold style={{ fontSize: 15 }}>{isEn ? 'Family Pairing Code' : 'Aile Eşleşme Kodu'}</T>
                <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                  {isEn ? 'Share with your partner to sync logs' : 'Eşinizle paylaşarak cihazları eşitleyin'}
                </T>
              </View>
              <Tap
                onPress={() => toast && toast(isEn ? 'Family code copied! 📋' : 'Aile kodu kopyalandı! 📋')}
                label={isEn ? 'Copy code' : 'Kodu kopyala'}
                style={ps.copyBtn}
              >
                <Icon name="check" size={13} color="white" />
                <T bold style={{ color: 'white', fontSize: 11 }}>{state.familyCode || 'MOM-7829-TR'}</T>
              </Tap>
            </View>

            {/* Eş Kodu Girerek Bağlan */}
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#F0E6EF' }}>
              <T style={{ fontSize: 12, color: colors.ink, marginBottom: 6 }}>
                {isEn ? "Link with your partner's code:" : 'Eşinin aile kodunu girerek bağlan:'}
              </T>
              <View style={ps.inputRow}>
                <TextInput
                  value={inputPartnerCode}
                  onChangeText={setInputPartnerCode}
                  placeholder="Örn: MOM-1234-TR"
                  autoCapitalize="characters"
                  style={ps.input}
                />
                <Tap onPress={handleLinkPartner} label={isEn ? 'Connect' : 'Bağlan'} style={ps.sendBtn}>
                  <T bold style={{ color: 'white', fontSize: 12 }}>
                    {partnerSyncBusy ? '...' : (isEn ? 'Connect' : 'Bağlan')}
                  </T>
                </Tap>
              </View>
            </View>
          </Card>

          {/* Eşler Arası Sevgi Notları & Sohbet */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <T bold style={{ fontSize: 15 }}>
                {isEn ? 'Couple Heart Notes & Reminders' : 'Eşler Arası Kalp Notları'}
              </T>
              <T style={{ fontSize: 11, color: colors.muted }}>
                {userName} & {partnerName}
              </T>
            </View>

            <View style={{ gap: 8, maxHeight: 250 }}>
              {partnerMessages.map(m => {
                const isMe = m.sender === currentRole;
                return (
                  <View key={m.id} style={[ps.chatBubble, isMe ? ps.chatBubbleMe : ps.chatBubblePartner]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <T bold style={{ fontSize: 11, color: isMe ? '#A23463' : '#225985' }}>{m.senderName}</T>
                      <T style={{ fontSize: 9.5, color: colors.muted }}>{m.time}</T>
                    </View>
                    <T style={{ fontSize: 12.5, color: colors.ink, lineHeight: 18 }}>{m.text}</T>
                  </View>
                );
              })}
            </View>

            <View style={[ps.inputRow, { marginTop: 12 }]}>
              <TextInput
                value={newPartnerMsg}
                onChangeText={setNewPartnerMsg}
                placeholder={isEn ? 'Write a gentle note to your partner...' : 'Eşine nazik bir sevgi notu yaz...'}
                style={ps.input}
              />
              <Tap onPress={sendPartnerMessage} label={isEn ? 'Send' : 'Gönder'} style={ps.sendBtn}>
                <Icon name="send" size={16} color="white" />
              </Tap>
            </View>
          </Card>

          {/* Bebeğe Mektuplar & Notlar */}
          <Card style={{ padding: 16 }}>
            <T bold style={{ fontSize: 15, marginBottom: 8 }}>
              {isEn ? 'Letters to Our Baby' : 'Bebeğimize Mektuplar'}
            </T>
            <View style={{ gap: 8 }}>
              {babyLetters.map(bl => (
                <View key={bl.id} style={ps.letterCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                    <T bold style={{ fontSize: 11.5, color: colors.purple }}>{bl.author}</T>
                    <T style={{ fontSize: 10, color: colors.muted }}>{bl.date}</T>
                  </View>
                  <T style={{ fontSize: 12.5, color: '#453B4A', lineHeight: 18, fontStyle: 'italic' }}>
                    "{bl.text}"
                  </T>
                </View>
              ))}
            </View>
            <View style={[ps.inputRow, { marginTop: 12 }]}>
              <TextInput
                value={newBabyLetter}
                onChangeText={setNewBabyLetter}
                placeholder={isEn ? 'Write a tender thought to your baby...' : 'Bebeğine kalpten bir cümle yaz...'}
                style={ps.input}
              />
              <Tap onPress={sendBabyLetter} label={isEn ? 'Save' : 'Kaydet'} style={ps.sendBtn}>
                <Icon name="heart" size={16} color="white" fill="white" />
              </Tap>
            </View>
          </Card>
        </View>
      )}

      {/* ─── 6. TAB 4: ANILAR & FAVORİLER ─── */}
      {activeTab === 'favorites' && (
        <View style={{ gap: 14 }}>
          {/* Favori Bebek İsimleri */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <T bold style={{ fontSize: 15 }}>{isEn ? `Saved Baby Names (${favNames.length})` : `Beğendiğin Bebek İsimleri (${favNames.length})`}</T>
              <Tap onPress={() => open && open('babyNames')} style={{ padding: 4 }}>
                <T bold style={{ fontSize: 11.5, color: colors.purple }}>{isEn ? 'See All →' : 'Tümünü Gör →'}</T>
              </Tap>
            </View>

            {matchedFavs.length === 0 ? (
              <T style={{ fontSize: 12.5, color: colors.muted, paddingVertical: 10 }}>
                {isEn
                  ? 'No favorite names saved yet. Explore the Baby Names directory to save names you love.'
                  : 'Henüz favorilere isim eklemedin. Bebek İsimleri Kütüphanesini açarak beğendiklerini kalp ile kaydedebilirsin.'}
              </T>
            ) : (
              <View style={{ gap: 8 }}>
                {matchedFavs.map(n => (
                  <View key={n.id} style={ps.favNameRow}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <T bold style={{ fontSize: 14 }}>{n.name}</T>
                        <T style={{ fontSize: 10.5, color: colors.muted }}>({n.gender})</T>
                        {n.partnerMatch && <T style={{ fontSize: 10.5, color: '#B84570' }}>{isEn ? '💕 Partner Match' : '💕 Ortak Eşleşme'}</T>}
                      </View>
                      <T style={{ fontSize: 11, color: '#55485B', marginTop: 2 }} numberOfLines={1}>{n.meaning}</T>
                    </View>
                    <Icon name="heart" size={17} color="#C55B77" fill="#C55B77" />
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* Günlük Notları */}
          <Card style={{ padding: 16 }}>
            <T bold style={{ fontSize: 15, marginBottom: 8 }}>
              {isEn ? `Personal Notes (${state.notes.length})` : `Kişisel Notların (${state.notes.length})`}
            </T>
            {state.notes.length === 0 ? (
              <T style={{ fontSize: 12.5, color: colors.muted, paddingVertical: 8 }}>
                {isEn ? 'No notes saved yet. You can keep your first memory.' : 'Henüz kaydedilmiş notun yok. İlk küçük anını saklayabilirsin.'}
              </T>
            ) : (
              state.notes.slice(0, 5).map(n => (
                <View key={n.id} style={ps.noteItem}>
                  <T style={{ fontSize: 12.5, lineHeight: 18, color: colors.ink }}>{n.text}</T>
                </View>
              ))
            )}
          </Card>
        </View>
      )}

      {/* ─── FOTOĞRAF VE AVATAR SEÇİM MODALI ─── */}
      <Modal
        visible={showAvatarModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={ps.modalBackdrop}>
          <Tap label="Kapat" style={StyleSheet.absoluteFill} onPress={() => setShowAvatarModal(false)} />
          <View style={ps.avatarModalBox}>
            <View style={ps.modalHeader}>
              <View style={{ flex: 1 }}>
                <T bold style={{ fontSize: 17, color: colors.ink }}>
                  {isEn ? 'Profile Photo & Persona' : 'Profil Fotoğrafı & Avatar'}
                </T>
                <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 2 }}>
                  {isEn ? 'Choose from gallery or pick a character' : 'Galerinden yükle veya karakter seç'}
                </T>
              </View>
              <Tap onPress={() => setShowAvatarModal(false)} label="Kapat" style={ps.closeBtn}>
                <Icon name="close" size={18} />
              </Tap>
            </View>

            {/* Mevcut Avatar Önizlemesi */}
            <View style={ps.previewWrap}>
              <View style={ps.previewCircle}>
                {state.avatarUri ? (
                  <Image source={{ uri: state.avatarUri }} style={{ width: 80, height: 80, borderRadius: 40 }} resizeMode="cover" />
                ) : (
                  <T style={{ fontSize: 44 }}>{state.avatarPreset || (currentRole === 'mother' ? '🤰' : '👨‍🍼')}</T>
                )}
              </View>
              <T style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>
                {state.avatarUri ? (isEn ? 'Custom Photo' : 'Özel Fotoğraf') : (isEn ? 'Avatar Emoji' : 'Seçili Avatar')}
              </T>
            </View>

            {/* Seçenek 1: Galeriden Fotoğraf Seç */}
            <Tap onPress={pickImage} label={isEn ? 'Choose from Gallery' : 'Galeriden Fotoğraf Seç'} style={ps.pickGalleryBtn}>
              <Icon name="camera" size={18} color="white" />
              <T bold style={{ color: 'white', fontSize: 14 }}>
                {isEn ? 'Choose Photo from Gallery 📸' : 'Galeriden Fotoğraf Yükle 📸'}
              </T>
            </Tap>

            {/* Seçenek 2: Hazır Karakter Avatarları */}
            <T bold style={{ fontSize: 13, color: colors.ink, marginTop: 16, marginBottom: 8 }}>
              {isEn ? 'Or Pick a Persona Avatar' : 'Veya Hazır Bir Avatar Belirle'}
            </T>
            <View style={ps.presetsGrid}>
              {avatarPresets.map(p => (
                <Tap
                  key={p.id}
                  onPress={() => selectPreset(p.emoji)}
                  label={isEn ? p.labelEn : p.labelTr}
                  style={[
                    ps.presetItem,
                    state.avatarPreset === p.emoji && ps.presetItemActive
                  ]}
                >
                  <T style={{ fontSize: 28 }}>{p.emoji}</T>
                  <T numberOfLines={1} style={ps.presetLabel}>
                    {isEn ? p.labelEn : p.labelTr}
                  </T>
                </Tap>
              ))}
            </View>

            {/* Sıfırla Butonu */}
            {(state.avatarUri || state.avatarPreset) ? (
              <Tap onPress={resetAvatar} label={isEn ? 'Reset to Default' : 'Varsayılana Sıfırla'} style={ps.resetAvatarBtn}>
                <T style={{ fontSize: 12, color: colors.muted }}>
                  {isEn ? 'Reset to Default Persona' : 'Varsayılan Avatara Dön'}
                </T>
              </Tap>
            ) : null}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const ps = StyleSheet.create({
  container: { padding: 18, paddingBottom: 40, gap: 14 },
  heroCard: { padding: 18, backgroundColor: '#FFFDFA' },
  heroRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatarWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#F6ECF6', alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: '#E8D4EB', position: 'relative' },
  avatarImg: { width: 68, height: 68, borderRadius: 34 },
  avatarCameraBadge: { position: 'absolute', bottom: -1, right: -1, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'white' },
  userName: { fontSize: 21, color: colors.ink },
  roleBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
  partnerPill: { marginTop: 5, backgroundColor: '#EDF6F0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },

  // 2'li Rol Kartları
  roleCardOption: { flex: 1, padding: 11, borderRadius: 16, backgroundColor: '#FAF6FA', borderWidth: 1.5, borderColor: '#EFE3EE' },
  roleCardOptionMomActive: { borderColor: '#B84570', backgroundColor: '#FDF2F7', ...shadow },
  roleCardOptionDadActive: { borderColor: '#225985', backgroundColor: '#EFF6FB', ...shadow },
  roleIconCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F2E8F0', alignItems: 'center', justifyContent: 'center' },
  miniCheck: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },

  statStrip: { flexDirection: 'row', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderColor: colors.line, justifyContent: 'space-around' },
  statCol: { alignItems: 'center' },
  statNum: { fontSize: 15, color: colors.purple },
  statLbl: { fontSize: 10, color: colors.muted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.line, height: '80%', alignSelf: 'center' },

  tabBar: { flexDirection: 'row', backgroundColor: '#EDE5EF', borderRadius: 16, padding: 4, gap: 4 },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', justifyContent: 'center', borderRadius: 12, flexDirection: 'row', gap: 4 },
  tabBtnActive: { backgroundColor: 'white', ...shadow },
  tabText: { fontSize: 12, color: '#746678' },
  tabTextActive: { color: colors.purple },
  tabBadge: { backgroundColor: '#8E7394', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },

  // Ayarlar & Dil Stilleri
  settingSection: { paddingBottom: 6 },
  langCardItem: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1.5, borderColor: '#E5D6E6', backgroundColor: '#FAF5FA' },
  langCardItemActive: { borderColor: colors.purple, backgroundColor: '#FFFFFF', ...shadow },
  langCheckCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
  smallActionBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: '#F4ECF6' },

  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.purple, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  chatBubble: { padding: 12, borderRadius: 14, maxWidth: '90%' },
  chatBubbleMe: { alignSelf: 'flex-end', backgroundColor: '#FBEBF2', borderBottomRightRadius: 2 },
  chatBubblePartner: { alignSelf: 'flex-start', backgroundColor: '#EEF4FB', borderBottomLeftRadius: 2 },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 },
  input: { flex: 1, height: 44, borderRadius: 14, borderWidth: 1, borderColor: '#DDD2DF', paddingHorizontal: 12, backgroundColor: '#FFFDFA', fontSize: 13, color: colors.ink },
  sendBtn: { paddingHorizontal: 14, height: 44, borderRadius: 14, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
  letterCard: { padding: 12, borderRadius: 12, backgroundColor: '#FAF6FA', borderWidth: 1, borderColor: '#ECE0EE' },

  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, color: colors.muted, marginBottom: 6 },
  fieldInput: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#DFD5E0', paddingHorizontal: 12, backgroundColor: '#FFFDFA', fontSize: 14, color: colors.ink },
  genderPick: { flex: 1, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: '#E3D7E5', alignItems: 'center', backgroundColor: '#FAF7FA' },
  genderPickActive: { borderColor: colors.purple, backgroundColor: '#F5ECF6' },
  bloodPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: '#F0E9F2' },
  bloodPillActive: { backgroundColor: colors.purple },
  saveFullBtn: { backgroundColor: colors.purple, paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  favNameRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F0E8F2' },
  noteItem: { paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F0E8F2' },
  secondaryBtn: { paddingVertical: 12, borderRadius: 14, backgroundColor: '#F3E8F5', alignItems: 'center' },

  // Avatar Modal Stilleri
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(25, 12, 30, 0.65)', justifyContent: 'center', alignItems: 'center', padding: 18 },
  avatarModalBox: { width: '100%', maxWidth: 390, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, ...shadow },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F2E8F2', alignItems: 'center', justifyContent: 'center' },
  previewWrap: { alignItems: 'center', marginBottom: 16 },
  previewCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#FAF0FA', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.purple },
  pickGalleryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.purple, paddingVertical: 13, borderRadius: 14, ...shadow },
  presetsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  presetItem: { width: '30%', paddingVertical: 10, borderRadius: 14, backgroundColor: '#FAF6FA', borderWidth: 1.2, borderColor: '#EFE5F0', alignItems: 'center' },
  presetItemActive: { borderColor: colors.purple, backgroundColor: '#F5EBF5' },
  presetLabel: { fontSize: 10, color: '#6A5670', marginTop: 4 },
  resetAvatarBtn: { alignSelf: 'center', marginTop: 16, padding: 6 },
});
