import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Switch, Image, Modal, Platform, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, fonts, shadow } from './theme';
import { Icon, BrandMark } from './Icons';
import { T, Tap, Card, ScreenHero, ToolExperienceCard, LanguageToggle } from './ui';
import { babyNamesList } from './babyNamesData';
import { dateLabel, pregnancyAt } from './domain.mjs';
import { resolveJourneyState } from './domain/journeyState';
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

export function ProfileScreen({ state, update, open, toast, choose, setPage, cloudStatus, refreshFromCloud }) {
  const lang = state?.lang || 'tr';
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'family' | 'personal' | 'favorites'
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

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
  const journey = resolveJourneyState(state);
  const remainingLabel = journey.daysRemaining >= 0
    ? `${journey.daysRemaining} ${isEn ? 'Days' : 'Gün'}`
    : (isEn ? 'Past Due' : 'Tarih Geçti');

  const permissions = state.sharingPermissions || {
    sharePregnancyWeek: true,
    shareAppointments: true,
    shareHospitalBag: true,
    shareBirthPreferences: true,
    shareBabyTrackers: true,
    shareMovementSummary: true,
    shareWeight: false,
    shareMood: false,
    shareHealthNotes: false,
  };

  function togglePermission(key) {
    const updated = { ...permissions, [key]: !permissions[key] };
    update({ sharingPermissions: updated });
    toast && toast(isEn ? 'Sharing privacy updated 🔒' : 'Paylaşım gizliliği güncellendi 🔒');
  }

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

  
  // Partner Hospital Bag Tasks (Sprint 11 Shared Tasks)
  const defaultPartnerTasks = isEn ? [
    { id: 'p1', title: 'Long-cord phone charger & powerbank', priority: 'essential', status: 'packed', catKey: 'partner' },
    { id: 'p2', title: 'Change of comfortable t-shirt & sweatpants', priority: 'recommended', status: 'prepared', catKey: 'partner' },
    { id: 'd1', title: 'Parent ID cards & insurance documents', priority: 'essential', status: 'packed', catKey: 'docs' },
    { id: 'd2', title: 'All pregnancy prenatal & ultrasound files', priority: 'essential', status: 'packed', catKey: 'docs' },
    { id: 'h1', title: 'ECE-approved infant car seat (installed in car)', priority: 'essential', status: 'prepared', catKey: 'home' },
  ] : [
    { id: 'p1', title: 'Uzun kablolu şarj aleti & powerbank', priority: 'essential', status: 'packed', catKey: 'partner' },
    { id: 'p2', title: 'Yedek rahat tişört & eşofman', priority: 'recommended', status: 'prepared', catKey: 'partner' },
    { id: 'd1', title: 'Anne ve baba kimlik kartları & sigorta belgeleri', priority: 'essential', status: 'packed', catKey: 'docs' },
    { id: 'd2', title: 'Tüm gebelik tahlil & ultrason takip dosyası', priority: 'essential', status: 'packed', catKey: 'docs' },
    { id: 'h1', title: 'Oto güvenlik koltuğu / anakucağı (arabada hazır)', priority: 'essential', status: 'prepared', catKey: 'home' },
  ];

  const bagData = state.hospitalBag || {};
  const actualPartnerTasks = Object.entries(bagData).flatMap(([catKey, list]) =>
    (Array.isArray(list) ? list : []).filter(item => item.assignedTo === 'partner').map(item => ({ ...item, catKey }))
  );
  const partnerTasks = actualPartnerTasks.length > 0 ? actualPartnerTasks : (state.partnerBagTasks || defaultPartnerTasks);

  function togglePartnerTask(task) {
    const nextStatus = task.status === 'packed' ? 'notPrepared' : 'packed';
    if (state.hospitalBag && state.hospitalBag[task.catKey]) {
      const updatedCat = (state.hospitalBag[task.catKey] || []).map(item =>
        item.id === task.id ? { ...item, status: nextStatus } : item
      );
      update({
        hospitalBag: {
          ...state.hospitalBag,
          [task.catKey]: updatedCat,
        },
      });
    } else {
      const updatedList = partnerTasks.map(t =>
        t.id === task.id ? { ...t, status: nextStatus } : t
      );
      update({ partnerBagTasks: updatedList });
    }
    toast && toast(isEn ? 'Partner task status updated 🎒' : 'Eş hazırlık görevi güncellendi 🎒');
  }

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
      {/* ─── 1. TEK VE DÜZENLİ PROFİL KARTI (CLEAN UNIFIED PROFILE HEADER) ─── */}
      <Card style={ps.profileHeaderCard}>
        {/* Üst Satır: Avatar, İsim, Rol Rozeti ve Eş Bilgisi */}
        <View style={ps.headerTopRow}>
          {/* Avatar & Kamera İkonu */}
          <Tap
            onPress={() => setShowAvatarModal(true)}
            label={isEn ? 'Change profile photo' : 'Profil fotoğrafını değiştir'}
            style={ps.avatarBox}
          >
            {state.avatarUri ? (
              <Image source={{ uri: state.avatarUri }} style={ps.avatarImg} resizeMode="cover" />
            ) : (
              <T style={{ fontSize: 30 }}>{state.avatarPreset || (currentRole === 'mother' ? '🌸' : '👨‍🍼')}</T>
            )}
            <View style={ps.avatarEditBadge}>
              <Icon name="camera" size={11} color="white" />
            </View>
          </Tap>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <T bold style={ps.profileName}>{state.name || userName}</T>
              <View style={[ps.roleBadge, currentRole === 'mother' ? ps.roleBadgeMom : ps.roleBadgeDad]}>
                <T bold style={[ps.roleBadgeText, currentRole === 'mother' ? { color: '#A23463' } : { color: '#225985' }]}>
                  {currentRole === 'mother'
                    ? (isEn ? '🌸 Mother-to-be' : '🌸 Anne Adayı')
                    : (isEn ? '👨‍🍼 Father-to-be' : '👨‍🍼 Baba Adayı')}
                </T>
              </View>
            </View>

            {/* Bağlı Eş / Aile Bilgisi */}
            <Tap
              onPress={() => setActiveTab('family')}
              label="Eş ve Aile Bilgisi"
              style={ps.partnerStatusPill}
            >
              <T style={{ fontSize: 11.5, color: '#2F6B42' }}>
                {isEn
                  ? `💚 Partner: ${state.partnerName || partnerName}`
                  : `💚 Eş: ${state.partnerName || partnerName} (Bağlı)`}
              </T>
            </Tap>
          </View>
        </View>

        {/* Orta Satır: Şık ve Kompakt Segmentli Ebeveyn Modu Seçici */}
        <View style={ps.roleSegmentContainer}>
          <Tap
            onPress={() => selectRole('mother')}
            label={isEn ? 'Mother Mode' : 'Anne Modu'}
            style={[
              ps.roleSegmentItem,
              currentRole === 'mother' && ps.roleSegmentItemMomActive
            ]}
          >
            <T style={{ fontSize: 15 }}>🌸</T>
            <T bold style={[ps.roleSegmentLabel, currentRole === 'mother' && { color: '#A23463' }]}>
              {isEn ? 'Mother Mode' : 'Anne Modu'}
            </T>
          </Tap>

          <Tap
            onPress={() => selectRole('father')}
            label={isEn ? 'Father Mode' : 'Baba Modu'}
            style={[
              ps.roleSegmentItem,
              currentRole === 'father' && ps.roleSegmentItemDadActive
            ]}
          >
            <T style={{ fontSize: 15 }}>👨‍🍼</T>
            <T bold style={[ps.roleSegmentLabel, currentRole === 'father' && { color: '#225985' }]}>
              {isEn ? 'Father Mode' : 'Baba Modu'}
            </T>
          </Tap>
        </View>

        {/* Alt Satır: Kompakt 3'lü İlerleme Özeti */}
        <View style={ps.glanceBar}>
          <View style={ps.glanceCol}>
            <T bold style={ps.glanceVal}>{journey.week}. {isEn ? 'Wk' : 'Hafta'}</T>
            <T style={ps.glanceSub}>{isEn ? 'Pregnancy' : 'İlerleme'}</T>
          </View>
          <View style={ps.glanceDiv} />
          <View style={ps.glanceCol}>
            <T bold style={ps.glanceVal}>{remainingLabel}</T>
            <T style={ps.glanceSub}>{isEn ? 'Remaining' : 'Kalan Süre'}</T>
          </View>
          <View style={ps.glanceDiv} />
          <View style={ps.glanceCol}>
            <T bold style={ps.glanceVal}>{babyName || (isEn ? 'Baby' : 'Bebek')}</T>
            <T style={ps.glanceSub}>{babyGender}</T>
          </View>
        </View>
      </Card>

      {/* ─── 2. DÜZENLİ VE FERAH 4'LÜ SEKME ÇUBUĞU ─── */}
      <View style={ps.tabContainer}>
        {[
          { key: 'settings', icon: '⚙️', label: isEn ? 'Settings' : 'Ayarlar' },
          { key: 'personal', icon: '👤', label: isEn ? 'Info' : 'Bilgiler' },
          { key: 'family', icon: '👨‍👩‍👧', label: isEn ? 'Family' : 'Aile', badge: partnerMessages.length },
          { key: 'favorites', icon: '⭐', label: isEn ? 'Memories' : 'Anılar', badge: favNames.length },
        ].map(t => {
          const isActive = activeTab === t.key;
          return (
            <Tap
              key={t.key}
              onPress={() => setActiveTab(t.key)}
              label={t.label}
              style={[ps.tabItem, isActive && ps.tabItemActive]}
            >
              <T style={{ fontSize: 14 }}>{t.icon}</T>
              <T bold={isActive} style={[ps.tabLabel, isActive && ps.tabLabelActive]}>
                {t.label}
              </T>
              {t.badge ? (
                <View style={[ps.tabBadge, isActive && { backgroundColor: colors.purple }]}>
                  <T bold style={{ fontSize: 9.5, color: 'white' }}>{t.badge}</T>
                </View>
              ) : null}
            </Tap>
          );
        })}
      </View>

      {/* ─── 3. TAB 1: AYARLAR & TERCİHLER ─── */}
      {activeTab === 'settings' && (
        <View style={{ gap: 12 }}>
          {/* UYGULAMA DİLİ */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <T style={{ fontSize: 18 }}>🌐</T>
              <View style={{ flex: 1 }}>
                <T bold style={{ fontSize: 14.5, color: colors.ink }}>
                  {isEn ? 'Application Language' : 'Uygulama Dili'}
                </T>
                <T style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>
                  {isEn ? 'Select interface and content language' : 'Arayüz ve editoryal içeriklerin dilini belirleyin'}
                </T>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {/* Türkçe */}
              <Tap
                onPress={() => {
                  update({ lang: 'tr' });
                  toast && toast('Dil Türkçe olarak güncellendi 🌸');
                }}
                label="Türkçe dili seç"
                style={[ps.langCardItem, lang === 'tr' && ps.langCardItemActive]}
              >
                <T style={{ fontSize: 22 }}>🇹🇷</T>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <T bold style={{ fontSize: 13, color: lang === 'tr' ? colors.purple : colors.ink }}>Türkçe</T>
                  <T style={{ fontSize: 10, color: colors.muted }}>Türkiye (TR)</T>
                </View>
                {lang === 'tr' && (
                  <View style={ps.langCheckCircle}>
                    <Icon name="check" size={11} color="white" />
                  </View>
                )}
              </Tap>

              {/* İngilizce */}
              <Tap
                onPress={() => {
                  update({ lang: 'en' });
                  toast && toast('Language switched to English 🌸');
                }}
                label="Select English language"
                style={[ps.langCardItem, lang === 'en' && ps.langCardItemActive]}
              >
                <T style={{ fontSize: 22 }}>🇬🇧</T>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <T bold style={{ fontSize: 13, color: lang === 'en' ? colors.purple : colors.ink }}>English</T>
                  <T style={{ fontSize: 10, color: colors.muted }}>Global (EN)</T>
                </View>
                {lang === 'en' && (
                  <View style={ps.langCheckCircle}>
                    <Icon name="check" size={11} color="white" />
                  </View>
                )}
              </Tap>
            </View>
          </Card>

          {/* YOLCULUK SEÇİMLERİ (ONBOARDING) */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FAF0FA', alignItems: 'center', justifyContent: 'center' }}>
                <T style={{ fontSize: 20 }}>🧭</T>
              </View>
              <View style={{ flex: 1 }}>
                <T bold style={{ fontSize: 14.5, color: colors.ink }}>
                  {isEn ? 'Journey Setup & Stage' : 'Yolculuk Tercihleri & Dönem'}
                </T>
                <T style={{ fontSize: 11, color: colors.muted, marginTop: 1, lineHeight: 15 }}>
                  {isEn
                    ? 'Reconfigure pregnancy, postpartum, due date, and focus areas.'
                    : 'Hamilelik, lohusalık veya bebek dönemi seçimlerini baştan yapılandırın.'}
                </T>
              </View>
            </View>

            <Tap
              onPress={() => {
                if (setPage) setPage('onboarding');
                else if (choose) choose('onboarding');
                toast && toast(isEn ? 'Opening onboarding setup 🧭' : 'Yolculuk seçimleri açılıyor 🧭');
              }}
              label={isEn ? "Re-run Onboarding Setup" : "Seçimleri Yeniden Yap (Onboarding)"}
              style={[ps.saveFullBtn, { marginTop: 12 }]}
            >
              <T bold style={{ color: 'white', fontSize: 13.5 }}>
                {isEn ? '🧭 Re-run Onboarding Choices →' : '🧭 Yolculuk Seçimlerini Yeniden Yap (Onboarding) →'}
              </T>
            </Tap>
          </Card>

          {/* BİLDİRİM MERKEZİ */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0EAF2', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="bell" size={18} color={colors.purple} />
              </View>
              <View style={{ flex: 1 }}>
                <T bold style={{ fontSize: 14.5, color: colors.ink }}>
                  {isEn ? 'Notification & Reminder Center' : 'Bildirim & Hatırlatıcı Merkezi'}
                </T>
                <T style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>
                  {isEn ? 'Hydration, vitamins, kicks & appointment alerts' : 'Su, vitamin, fetal tekme ve test alarmları'}
                </T>
              </View>
            </View>

            <Tap
              onPress={() => open && open('notifications')}
              label={isEn ? "Open Notification Settings" : "Bildirim Ayarlarını Aç"}
              style={[ps.secondaryBtn, { marginTop: 12 }]}
            >
              <T bold style={{ color: colors.purple, fontSize: 13 }}>
                {isEn ? '🔔 Manage All Reminders →' : '🔔 Tüm Hatırlatıcıları Yönet →'}
              </T>
            </Tap>
          </Card>

          {/* BULUT VE HESAP YÖNETİMİ */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <BrandMark size={28} />
                <View>
                  <T bold style={{ fontSize: 14.5, color: colors.ink }}>
                    {isEn ? 'Account & Cloud Sync' : 'Hesap & Momora Bulut'}
                  </T>
                  <T style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>
                    {cloudUser
                      ? `${isEn ? 'Connected:' : 'Bağlı:'} ${cloudUser.email}`
                      : (isEn ? 'Guest Mode · Local storage only' : 'Misafir Modu · Sadece bu cihazda')}
                  </T>
                </View>
              </View>
              <View style={{ backgroundColor: cloudUser ? '#EDF7ED' : '#F3EDF7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                <T bold style={{ fontSize: 10.5, color: cloudUser ? '#2E7D32' : colors.purple }}>
                  {cloudUser ? (isEn ? 'Cloud Active' : 'Bulut Aktif') : (isEn ? 'Guest' : 'Misafir')}
                </T>
              </View>
            </View>

            {cloudUser ? (
              <View style={{ marginTop: 10, gap: 8, paddingTop: 8, borderTopWidth: 1, borderColor: '#F0E6F0' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <T style={{ fontSize: 12, color: colors.muted }}>{isEn ? 'Family Sync Code' : 'Aile Eşleşme Kodu'}</T>
                  <T bold style={{ fontSize: 12, letterSpacing: 1, color: colors.ink }}>{state.familyCode || 'MOM-7829-TR'}</T>
                </View>
                <Tap onPress={handleSignOut} label={isEn ? 'Sign out' : 'Çıkış yap'} style={[ps.secondaryBtn, { marginTop: 4 }]}>
                  <T bold style={{ fontSize: 12.5, color: '#B42318' }}>{isEn ? 'Sign Out' : 'Oturumu Kapat'}</T>
                </Tap>
              </View>
            ) : (
              <View style={{ marginTop: 8 }}>
                <T style={{ fontSize: 11.5, color: '#5C5463', lineHeight: 16, marginBottom: 10 }}>
                  {isEn
                    ? 'Sign in to sync baby logs and notes with your partner across devices.'
                    : 'Eşinizle tüm verilerinizi eşitlemek ve bulutta yedeklemek için giriş yapın.'}
                </T>
                <Tap onPress={() => open && open('auth')} style={ps.saveFullBtn}>
                  <T bold style={{ color: 'white', fontSize: 13 }}>
                    {isEn ? 'Sign In / Create Account 🌸' : 'Giriş Yap / Hesap Oluştur 🌸'}
                  </T>
                </Tap>
              </View>
            )}
          </Card>

          {/* VERİ & GİZLİLİK PAYLAŞIM İZİNLERİ */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <T style={{ fontSize: 18 }}>🔒</T>
              <View style={{ flex: 1 }}>
                <T bold style={{ fontSize: 14.5, color: colors.ink }}>
                  {isEn ? 'Data & Partner Sharing Privacy' : 'Veri & Eş Paylaşım Gizliliği'}
                </T>
                <T style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>
                  {isEn ? 'Choose what data is shared with your connected partner' : 'Bağlı eşinizle hangi verilerin paylaşılacağını yönetin'}
                </T>
              </View>
            </View>

            <View style={{ gap: 8 }}>
              {[
                { key: 'sharePregnancyWeek', labelTr: 'Hamilelik Haftası ve Günleri', labelEn: 'Pregnancy Week & Progress', defaultVal: true },
                { key: 'shareAppointments', labelTr: 'Doktor Randevuları ve Soruları', labelEn: 'Doctor Appointments & Questions', defaultVal: true },
                { key: 'shareHospitalBag', labelTr: 'Doğum Çantası & Hazırlık Listesi', labelEn: 'Hospital Bag & Birth Plan', defaultVal: true },
                { key: 'shareBabyTrackers', labelTr: 'Bebek Sayaçları (Beslenme, Uyku)', labelEn: 'Baby Trackers (Feeding, Sleep)', defaultVal: true },
                { key: 'shareMovementSummary', labelTr: 'Fetal Hareket Özeti', labelEn: 'Fetal Movement Summary', defaultVal: true },
                { key: 'shareWeight', labelTr: 'Kilo Kayıtları', labelEn: 'Weight Entries', defaultVal: false, privateHint: true },
                { key: 'shareMood', labelTr: 'Ruh Hali & Günlük Duygu Kaydı', labelEn: 'Daily Mood & Emotional Check-in', defaultVal: false, privateHint: true },
                { key: 'shareHealthNotes', labelTr: 'Özel Sağlık ve Beden Notları', labelEn: 'Private Maternal Health Notes', defaultVal: false, privateHint: true },
              ].map(item => {
                const isChecked = permissions[item.key] !== undefined ? permissions[item.key] : item.defaultVal;
                return (
                  <View key={item.key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderColor: '#F2EEF4' }}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <T bold style={{ fontSize: 12, color: colors.ink }}>{isEn ? item.labelEn : item.labelTr}</T>
                      {item.privateHint && (
                        <T style={{ fontSize: 10, color: '#A23463', marginTop: 1 }}>
                          {isEn ? '🔒 Private by default' : '🔒 Mahremiyet gereği varsayılan kapalı'}
                        </T>
                      )}
                    </View>
                    <Switch
                      value={isChecked}
                      onValueChange={() => togglePermission(item.key)}
                      trackColor={{ false: '#DFD8E3', true: colors.purple }}
                      thumbColor={isChecked ? '#FFFFFF' : '#F4F3F7'}
                    />
                  </View>
                );
              })}
            </View>
          </Card>

          {/* TIBBİ BİLGİLENDİRME & SÜRÜM */}
          <Card style={{ padding: 14, backgroundColor: '#FFFDF9', borderColor: '#EFE2DA' }}>
            <Tap
              onPress={() => open && open('legal', { tab: 'medical' })}
              label={isEn ? 'Medical Guidance Disclaimer' : 'Tıbbi Sorumluluk Reddi'}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <T style={{ fontSize: 16 }}>🩺</T>
                <T bold style={{ fontSize: 13.5, color: '#7E3B1C' }}>
                  {isEn ? 'Medical Guidance Disclaimer' : 'Tıbbi Sorumluluk Reddi'}
                </T>
              </View>
              <T bold style={{ fontSize: 11, color: '#7E3B1C' }}>{isEn ? 'Details →' : 'Detaylar →'}</T>
            </Tap>
            <T style={{ fontSize: 11, color: '#664736', lineHeight: 16 }}>
              {isEn
                ? 'Momora is an educational wellness companion designed to support mothers and families. It does not provide clinical triage or treatment. Always consult your obstetrician for medical guidance.'
                : 'Momora, anne ve ailelerin yolculuğunu destekleyen eğitici bir sağlıklı yaşam arkadaşıdır. Tıbbi teşhis veya tedavi yerine geçmez. Sağlık kararlarınızı hekiminizle birlikte alınız.'}
            </T>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderColor: '#F2E4DB' }}>
              <T style={{ fontSize: 10.5, color: colors.muted }}>Momora v1.0.0 · Offline-first</T>
              <Tap
                onPress={() => open && open('legal', { tab: 'privacy' })}
                label={isEn ? 'Terms & Privacy' : 'Kullanım & Gizlilik'}
                style={{ paddingVertical: 4, paddingHorizontal: 2 }}
              >
                <T bold style={{ fontSize: 11, color: colors.purple }}>
                  {isEn ? 'Terms & Privacy Policy →' : 'Kullanım & Gizlilik İlkeleri →'}
                </T>
              </Tap>
            </View>
          </Card>
        </View>
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
          {/* ─── AİLE ÇEMBERİMİZ & HANE KARTI ─── */}
          <Card style={{ padding: 16, backgroundColor: '#FAF6FA', borderColor: '#EBE0ED' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View>
                <T bold style={{ fontSize: 15, color: colors.ink }}>
                  {isEn ? 'Our Family Circle' : 'Aile Çemberimiz & Hane'}
                </T>
                <T style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>
                  {isEn ? 'All synced family members tracking together' : 'Birlikte takip eden aile üyelerimiz'}
                </T>
              </View>
              <View style={{ backgroundColor: '#F0E3F3', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 }}>
                <T bold style={{ fontSize: 11, color: colors.purple }}>
                  {currentRole === 'mother' ? (isEn ? '🌸 Mother Active' : '🌸 Anne Aktif') : (isEn ? '👨‍🍼 Father Active' : '👨‍🍼 Baba Aktif')}
                </T>
              </View>
            </View>

            {/* Üyeler ve Roller Listesi */}
            <View style={{ gap: 8 }}>
              {[
                { name: state.role === 'father' ? (state.partnerName || 'Zeynep') : (state.name || 'Zeynep'), roleLabel: isEn ? 'Mother (Primary Account)' : 'Anne (Birincil Hesap)', emoji: '🌸', status: isEn ? 'Active' : 'Aktif' },
                { name: state.role === 'father' ? (state.name || 'Mehmet') : (state.partnerName || 'Mehmet'), roleLabel: isEn ? 'Father / Partner' : 'Baba / Eş', emoji: '👨‍🍼', status: isEn ? 'Connected' : 'Bağlı' },
                { name: babyName || (isEn ? 'Baby' : 'Bebek'), roleLabel: isEn ? `Baby (${babyGender}) · Week ${journey.week}` : `Bebek (${babyGender}) · ${journey.week}. Hafta`, emoji: '👶', status: isEn ? 'Growing' : 'Büyüyor' },
              ].map(m => (
                <View key={m.name + m.roleLabel} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderColor: '#F2E8F3' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FAF0FA', alignItems: 'center', justifyContent: 'center' }}>
                      <T style={{ fontSize: 16 }}>{m.emoji}</T>
                    </View>
                    <View>
                      <T bold style={{ fontSize: 13, color: colors.ink }}>{m.name}</T>
                      <T style={{ fontSize: 10.5, color: colors.muted }}>{m.roleLabel}</T>
                    </View>
                  </View>
                  <View style={{ backgroundColor: '#F0EAF2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <T bold style={{ fontSize: 10.5, color: colors.purple }}>{m.status}</T>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* ─── SPEC 21: FAMILY SYNC (INVITE LINK / CODE / QR) ─── */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View>
                <T bold style={{ fontSize: 15 }}>{isEn ? 'Family Pairing & Invites' : 'Aile Eşleşme & Davetler'}</T>
                <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                  {isEn ? 'Link accounts to synchronize timers, hospital bag & feeds' : 'Cihazları eşitlemek için davet kodu veya linki paylaşın'}
                </T>
              </View>
              <View style={{ backgroundColor: '#EDF6F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                <T bold style={{ fontSize: 10.5, color: '#2E7D32' }}>{isEn ? '⚡ Real-time Sync' : '⚡ Canlı Eşitleme'}</T>
              </View>
            </View>

            {/* Davet Butonları 3 lü Satır (KOD, LİNK, QR) */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <Tap
                onPress={() => toast && toast(isEn ? 'Family code copied! 📋' : 'Aile kodu kopyalandı! 📋')}
                label={isEn ? 'Copy code' : 'Kodu kopyala'}
                style={[ps.copyBtn, { flex: 1, justifyContent: 'center' }]}
              >
                <Icon name="check" size={13} color="white" />
                <T bold style={{ color: 'white', fontSize: 11.5 }}>{state.familyCode || 'MOM-7829-TR'}</T>
              </Tap>

              <Tap
                onPress={() => toast && toast(isEn ? 'Invite link copied to clipboard! 🔗' : 'Davet linki panoya kopyalandı! 🔗')}
                label={isEn ? 'Copy link' : 'Linki kopyala'}
                style={[ps.secondaryBtn, { flex: 1, paddingVertical: 8 }]}
              >
                <T bold style={{ fontSize: 11.5, color: colors.purple }}>
                  {isEn ? '🔗 Share Link' : '🔗 Link Paylaş'}
                </T>
              </Tap>

              <Tap
                onPress={() => setShowQrModal(true)}
                label={isEn ? 'Show QR' : 'QR Göster'}
                style={[ps.secondaryBtn, { width: 50, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' }]}
              >
                <T style={{ fontSize: 16 }}>📱</T>
              </Tap>
            </View>

            {/* Eş Kodu Girerek Bağlan */}
            <View style={{ paddingTop: 10, borderTopWidth: 1, borderColor: '#F0E6EF' }}>
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

          {/* ─── SPEC 21: PARTNER MODE & SHARED TASK BOARD ─── */}
          <Card style={{ padding: 16, backgroundColor: '#FAF8FC', borderColor: '#EBE0ED' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <T style={{ fontSize: 20 }}>🎒</T>
                <View>
                  <T bold style={{ fontSize: 14.5, color: colors.ink }}>
                    {isEn ? 'Partner Task Board & Hospital Bag' : 'Eş Görev Panosu & Doğum Çantası'}
                  </T>
                  <T style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>
                    {isEn ? 'Items and duties assigned specifically to partner' : 'Eşe özel atanan hastane ve refakatçi görevleri'}
                  </T>
                </View>
              </View>
              <Tap onPress={() => open && open('hospitalBag')}>
                <T bold style={{ fontSize: 11.5, color: colors.purple }}>{isEn ? 'All Bag →' : 'Çanta →'}</T>
              </Tap>
            </View>

            <View style={{ gap: 7, marginTop: 4 }}>
              {partnerTasks.map(task => {
                const isPacked = task.status === 'packed';
                return (
                  <Tap
                    key={task.id}
                    onPress={() => togglePartnerTask(task)}
                    label={task.title}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 10,
                      borderRadius: 12,
                      backgroundColor: isPacked ? '#F3FAF5' : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: isPacked ? '#C9E5D2' : '#EDE4EE',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <View style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        borderWidth: 1.5,
                        borderColor: isPacked ? '#2E7D32' : colors.line,
                        backgroundColor: isPacked ? '#2E7D32' : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {isPacked && <Icon name="check" size={12} color="white" />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <T bold style={{ fontSize: 12.5, color: isPacked ? '#2E7D32' : colors.ink, textDecorationLine: isPacked ? 'line-through' : 'none' }}>
                          {task.title}
                        </T>
                        <T style={{ fontSize: 10, color: colors.muted }}>
                          {isEn ? `Category: ${task.catKey || 'partner'}` : `Bölüm: ${task.catKey || 'refakatçi'}`}
                        </T>
                      </View>
                    </View>
                    <View style={{
                      paddingHorizontal: 7,
                      paddingVertical: 3,
                      borderRadius: 6,
                      backgroundColor: isPacked ? '#E4F4E8' : '#F5EDF6',
                    }}>
                      <T bold style={{ fontSize: 10, color: isPacked ? '#2E7D32' : colors.purple }}>
                        {isPacked ? (isEn ? 'Packed ✓' : 'Hazırlandı ✓') : (isEn ? 'To pack' : 'Hazırlanacak')}
                      </T>
                    </View>
                  </Tap>
                );
              })}
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
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowAvatarModal(false)} />
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
    
      {/* ─── AİLE EŞLEŞME QR MODALI (SPEC 21) ─── */}
      <Modal
        visible={showQrModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQrModal(false)}
      >
        <View style={ps.modalBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowQrModal(false)} />
          <View style={[ps.avatarModalBox, { alignItems: 'center', padding: 24 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 12 }}>
              <T bold style={{ fontSize: 16, color: colors.ink }}>
                {isEn ? 'Pair with Partner via QR' : 'QR ile Eşleş'}
              </T>
              <Tap onPress={() => setShowQrModal(false)} label="Kapat" style={ps.closeBtn}>
                <Icon name="close" size={18} />
              </Tap>
            </View>

            {/* QR Görsel Simülasyonu */}
            <View style={{ width: 180, height: 180, backgroundColor: '#FAF6FA', borderRadius: 16, borderWidth: 2, borderColor: colors.purple, alignItems: 'center', justifyContent: 'center', marginVertical: 14 }}>
              <View style={{ width: 140, height: 140, backgroundColor: '#FFFFFF', borderRadius: 8, padding: 8, justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ width: 34, height: 34, backgroundColor: colors.purple, borderRadius: 4 }} />
                  <View style={{ width: 34, height: 34, backgroundColor: colors.purple, borderRadius: 4 }} />
                </View>
                <View style={{ alignItems: 'center' }}>
                  <BrandMark size={28} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ width: 34, height: 34, backgroundColor: colors.purple, borderRadius: 4 }} />
                  <View style={{ width: 14, height: 14, backgroundColor: '#B84570', borderRadius: 2 }} />
                </View>
              </View>
            </View>

            <T bold style={{ fontSize: 16, color: colors.ink, letterSpacing: 2 }}>
              {state.familyCode || 'MOM-7829-TR'}
            </T>
            <T style={{ fontSize: 11.5, color: colors.muted, textAlign: 'center', marginTop: 6, lineHeight: 16 }}>
              {isEn
                ? 'Ask your partner to scan this code from Momora on their phone to connect immediately.'
                : 'Eşiniz telefonundaki Momora uygulamasından bu kodu taratarak veya girerek anında bağlanabilir.'}
            </T>

            <Tap
              onPress={() => {
                setShowQrModal(false);
                toast && toast(isEn ? 'Invite link shared! 🌸' : 'Davet bağlantısı paylaşıldı! 🌸');
              }}
              style={[ps.saveFullBtn, { width: '100%', marginTop: 16 }]}
            >
              <T bold style={{ color: 'white', fontSize: 13.5 }}>{isEn ? 'Done' : 'Tamam'}</T>
            </Tap>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const ps = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, gap: 12 },

  // Clean Unified Header Card
  profileHeaderCard: {
    padding: 16,
    backgroundColor: '#FFFCFA',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EFE5EE',
    ...shadow,
  },
  headerTopRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  avatarBox: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#F7EDF7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E8D2EB',
    position: 'relative',
  },
  avatarImg: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  profileName: {
    fontSize: 20,
    color: colors.ink,
  },
  roleBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  roleBadgeMom: {
    backgroundColor: '#FDF0F6',
  },
  roleBadgeDad: {
    backgroundColor: '#EEF5FA',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  partnerStatusPill: {
    marginTop: 4,
    backgroundColor: '#EDF7F1',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },

  // Role Segment Control
  roleSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3EAF3',
    borderRadius: 14,
    padding: 3,
    gap: 4,
    marginTop: 14,
  },
  roleSegmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 11,
  },
  roleSegmentItemMomActive: {
    backgroundColor: '#FFFFFF',
    ...shadow,
  },
  roleSegmentItemDadActive: {
    backgroundColor: '#FFFFFF',
    ...shadow,
  },
  roleSegmentLabel: {
    fontSize: 12.5,
    color: colors.muted,
  },

  // Glance Bar (Stats Strip)
  glanceBar: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#F0E6EE',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  glanceCol: {
    alignItems: 'center',
  },
  glanceVal: {
    fontSize: 14.5,
    color: colors.purple,
  },
  glanceSub: {
    fontSize: 10.5,
    color: colors.muted,
    marginTop: 2,
  },
  glanceDiv: {
    width: 1,
    height: 24,
    backgroundColor: '#EAE0EC',
  },

  // Tab Navigation Container
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EDE5EF',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 4,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    ...shadow,
  },
  tabLabel: {
    fontSize: 11.5,
    color: '#746678',
  },
  tabLabelActive: {
    color: colors.purple,
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: '#8E7394',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
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
