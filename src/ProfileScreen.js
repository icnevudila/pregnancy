import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Switch, Platform } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon, BrandMark } from './Icons';
import { T, Tap, Card, Section, ScreenHero } from './ui';
import { babyNamesList } from './babyNamesData';
import { dateLabel, pregnancyAt } from './domain.mjs';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import { signInWithEmail, signOut, cloudStatusLabel, saveCloudState } from './backendSync';

export function ProfileScreen({ state, update, open, toast, choose, cloudStatus, refreshFromCloud }) {
  const [activeTab, setActiveTab] = useState('family'); // 'family' | 'personal' | 'favorites' | 'settings'

  // Kişisel Form State'leri
  const [userName, setUserName] = useState(state.name || 'Zeynep');
  const [partnerName, setPartnerName] = useState(state.partnerName || 'Mehmet');
  const [babyName, setBabyName] = useState(state.babyName || 'Ada');
  const [babyGender, setBabyGender] = useState(state.babyGender || 'Kız');
  const [bloodType, setBloodType] = useState(state.bloodType || 'A Rh+');
  const [doctor, setDoctor] = useState(state.doctor || '');
  const [hospital, setHospital] = useState(state.hospital || '');
  const [dueDate, setDueDate] = useState(state.dueDate || '');

  // Mesajlaşma State'leri
  const [newPartnerMsg, setNewPartnerMsg] = useState('');
  const [newBabyLetter, setNewBabyLetter] = useState('');

  // Hatırlatıcı Toggle State'leri
  const [remindWater, setRemindWater] = useState(state.remindWater !== false);
  const [remindVitamin, setRemindVitamin] = useState(state.remindVitamin !== false);
  const [remindLetter, setRemindLetter] = useState(state.remindLetter !== false);
  const [remindPartner, setRemindPartner] = useState(state.remindPartner !== false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState('signin');
  const [cloudUser, setCloudUser] = useState(null);
  const [authBusy, setAuthBusy] = useState(false);

  const currentRole = state.role || 'mother'; // 'mother' | 'father'
  const journey = pregnancyAt(state);
  const remainingLabel = journey.remaining >= 0 ? `${journey.remaining} Gün` : 'Tarih Geçti';

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getUser().then(({ data }) => setCloudUser(data.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCloudUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Eşler Arası Varsayılan Mesajlar
  const defaultPartnerMessages = [
    { id: 'pm-1', sender: 'father', senderName: partnerName, text: 'Bugün nasılsın birtanem? Akşam senin sevdiğin meyvelerden alıp geliyorum 💕', time: '12:45' },
    { id: 'pm-2', sender: 'mother', senderName: userName, text: 'Çok teşekkür ederim sevgilim! Bebeğimiz bugün çok hareketliydi, tekmelerini akşam hissetmelisin 🌸', time: '13:10' },
    { id: 'pm-3', sender: 'father', senderName: partnerName, text: 'Harika bir haber! Perşembe günkü ultrason kontrolümüzü takvimime ekledim bile 🩺✨', time: '14:20' },
  ];

  // Bebeğe Yazılan Notlar
  const defaultBabyLetters = [
    { id: 'bl-1', author: 'Anne & Baba', text: 'Canımız kızımız, 24. haftana girdik. Dünyamıza neşe ve ışık getireceğin günü sabırsızlıkla bekliyoruz... 🤍', date: 'Bugün' },
    { id: 'bl-2', author: 'Baba', text: 'Baban olarak ilk ninnini şimdiden ezberliyorum, seninle tanışmak için sabırsızlanıyorum küçük meleğim. 👶', date: '3 gün önce' },
  ];

  const partnerMessages = state.partnerMessages || defaultPartnerMessages;
  const babyLetters = state.babyLetters || defaultBabyLetters;
  const favNames = state.favNames || [];

  function toggleRole() {
    const nextRole = currentRole === 'mother' ? 'father' : 'mother';
    const nextName = nextRole === 'father' ? (partnerName || 'Mehmet') : (userName || 'Zeynep');
    const nextPartner = nextRole === 'father' ? (userName || 'Zeynep') : (partnerName || 'Mehmet');
    update({
      role: nextRole,
      name: nextName,
      partnerName: nextPartner,
      partnerRole: nextRole === 'father' ? 'mother' : 'father',
    });
    toast && toast(nextRole === 'father' ? 'Baba moduna geçildi 👨‍🍼' : 'Anne moduna geçildi 🤰');
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
    toast && toast('Profil bilgilerin başarıyla güncellendi 🌸');
  }

  function sendPartnerMessage() {
    if (!newPartnerMsg.trim()) return;
    const newMsg = {
      id: 'pm-' + Date.now(),
      sender: currentRole,
      senderName: currentRole === 'mother' ? userName : partnerName,
      text: newPartnerMsg.trim(),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };
    update(old => ({
      partnerMessages: [...(old.partnerMessages || defaultPartnerMessages), newMsg],
    }));
    setNewPartnerMsg('');
    toast && toast('Eşine mesajın iletildi 💌');
  }

  function sendBabyLetter() {
    if (!newBabyLetter.trim()) return;
    const newLetter = {
      id: 'bl-' + Date.now(),
      author: currentRole === 'mother' ? 'Anne' : 'Baba',
      text: newBabyLetter.trim(),
      date: 'Bugün',
    };
    update(old => ({
      babyLetters: [newLetter, ...(old.babyLetters || defaultBabyLetters)],
    }));
    setNewBabyLetter('');
    toast && toast('Bebeğine mektubun sevgiyle saklandı 💌');
  }

  async function handleAuth() {
    if (!authEmail.trim() || authPassword.length < 6) {
      toast && toast('E-posta ve en az 6 karakter şifre yaz.');
      return;
    }
    setAuthBusy(true);
    const { error, data } = await signInWithEmail(authEmail.trim(), authPassword, authMode === 'signup');
    setAuthBusy(false);
    if (error) return toast && toast(error.message);
    setCloudUser(data.user || data.session?.user || null);
    const syncResult = refreshFromCloud ? await refreshFromCloud() : await saveCloudState(state);
    if (syncResult?.error) toast && toast('Giriş yapıldı; bulut kaydı daha sonra eşitlenecek.');
    else toast && toast(authMode === 'signup' ? 'Hesap oluşturuldu ve kayıtların hazırlandı.' : 'Bulut hesabına giriş yapıldı.');
  }

  async function handleSignOut() {
    await signOut();
    setCloudUser(null);
    toast && toast('Bulut hesabından çıkıldı.');
  }

  const bloodTypes = ['A Rh+', 'A Rh-', 'B Rh+', 'B Rh-', '0 Rh+', '0 Rh-', 'AB Rh+', 'AB Rh-'];

  // Favorilenen İsimleri Bul
  const matchedFavs = babyNamesList.filter(n => favNames.includes(n.id));

  return (
    <ScrollView contentContainerStyle={ps.container} showsVerticalScrollIndicator={false}>
      <ScreenHero
        kicker="AİLE PROFİLİ"
        title={`${currentRole === 'mother' ? userName : partnerName} · ${journey.week}. hafta`}
        body="Aile rolü, bebeğin bilgileri, favoriler ve eşitleme ayarları aynı merkezde düzenli kalır."
        icon="profile"
        stat={cloudStatusLabel(cloudStatus)}
        tint={currentRole === 'mother' ? '#B84570' : '#396F9E'}
      />

      {/* ─── 1. ÜST PROFİL HERO KARTI ─── */}
      <Card style={ps.heroCard}>
        <View style={ps.heroRow}>
          <View style={ps.avatarWrap}>
            <T style={{ fontSize: 36 }}>{currentRole === 'mother' ? '🤰' : '👨‍🍼'}</T>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <T bold style={ps.userName}>{currentRole === 'mother' ? userName : partnerName}</T>
              <View style={[ps.roleBadge, currentRole === 'mother' ? { backgroundColor: '#F9ECF4' } : { backgroundColor: '#E9F1F9' }]}>
                <T bold style={{ fontSize: 11, color: currentRole === 'mother' ? '#B84570' : '#396F9E' }}>
                  {currentRole === 'mother' ? '🤰 Anne Adayı' : '👨‍🍼 Baba Adayı'}
                </T>
              </View>
            </View>
            <T style={ps.userMotto}>"Her adımda, birlikte daha güçlüyüz."</T>
            
            {/* Bağlı Partner Bilgisi */}
            <View style={ps.partnerPill}>
              <T style={{ fontSize: 11, color: '#3E7D52' }}>💚 Aile profili: {currentRole === 'mother' ? partnerName : userName} ile ortak alan hazır</T>
            </View>
          </View>
        </View>

        {/* Rol Değiştirici Buton */}
        <Tap onPress={toggleRole} label="Rol değiştir" style={ps.roleSwitchBtn}>
          <Icon name="refresh" size={14} color={colors.purple} />
          <T bold style={{ fontSize: 12, color: colors.purple }}>
            {currentRole === 'mother' ? 'Baba Görünümüne Geç 👨‍🍼' : 'Anne Görünümüne Geç 🤰'}
          </T>
        </Tap>

        {/* Hafta & Kalan Gün Özeti */}
        <View style={ps.statStrip}>
          <View style={ps.statCol}>
            <T bold style={ps.statNum}>{journey.week}. Hafta</T>
            <T style={ps.statLbl}>Hamilelik İlerlemesi</T>
          </View>
          <View style={ps.statDivider} />
          <View style={ps.statCol}>
            <T bold style={ps.statNum}>{remainingLabel}</T>
            <T style={ps.statLbl}>Kalan Süre</T>
          </View>
          <View style={ps.statDivider} />
          <View style={ps.statCol}>
            <T bold style={ps.statNum}>{babyName}</T>
            <T style={ps.statLbl}>Bebeğin Adı ({babyGender})</T>
          </View>
        </View>
      </Card>

      {/* ─── 2. ALT SEKME NAVİGASYONU ─── */}
      <View style={ps.tabBar}>
        {[
          { key: 'family', label: '👨‍👩‍👧 Eş & Aile', badge: partnerMessages.length },
          { key: 'personal', label: '👤 Bilgiler' },
          { key: 'favorites', label: '⭐ Anılar', badge: favNames.length },
          { key: 'settings', label: '⚙️ Tercihler' },
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
            {t.badge > 0 && (
              <View style={[ps.tabBadge, activeTab === t.key && { backgroundColor: colors.purple }]}>
                <T style={{ fontSize: 9, color: 'white', fontWeight: 'bold' }}>{t.badge}</T>
              </View>
            )}
          </Tap>
        ))}
      </View>

      {/* ─── 3. TAB 1: EŞ SENKRONİZASYONU & MESAJLAR ─── */}
      {activeTab === 'family' && (
        <View style={{ gap: 14 }}>
          {/* Aile Senkronizasyon Kodu Kartı */}
          <Card style={{ padding: 16, backgroundColor: '#FAF6FA', borderColor: '#EDE0EE' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <T style={{ fontSize: 11, color: colors.muted, letterSpacing: 1 }}>AİLE SENKRONİZASYON KODU</T>
                <T bold style={{ fontSize: 20, color: colors.purple, marginTop: 2 }}>MOM-7829-TR</T>
              </View>
              <Tap
                onPress={() => toast && toast('Aile kodu kopyalandı! Eşinle paylaşabilirsin 📲')}
                label="Kodu Kopyala"
                style={ps.copyBtn}
              >
                <Icon name="share" size={14} color="white" />
                <T bold style={{ fontSize: 12, color: 'white' }}>Kodu Paylaş</T>
              </Tap>
            </View>
            <T style={{ fontSize: 12, color: '#66536C', marginTop: 8, lineHeight: 17 }}>
              Aile hesabı için hazırlanan alan. Supabase bağlantısı tamamlandığında bu kod gerçek eşleştirme ve ortak kayıt akışına bağlanacak.
            </T>
          </Card>

          {/* Eşler Arası Sevgi & Destek Sohbeti */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <T style={{ fontSize: 18 }}>💬</T>
              <T bold style={{ fontSize: 16, color: colors.ink }}>Eşler Arası Destek Sohbeti</T>
            </View>

            <View style={{ gap: 10, marginBottom: 14 }}>
              {partnerMessages.map(m => {
                const isMe = m.sender === currentRole;
                return (
                  <View
                    key={m.id}
                    style={[
                      ps.chatBubble,
                      isMe ? ps.chatBubbleMe : ps.chatBubblePartner,
                    ]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <T bold style={{ fontSize: 11, color: isMe ? '#893B60' : '#2A5D8A' }}>
                        {m.senderName} ({m.sender === 'mother' ? 'Anne' : 'Baba'})
                      </T>
                      <T style={{ fontSize: 9, color: colors.muted }}>{m.time}</T>
                    </View>
                    <T style={{ fontSize: 13, color: '#3A333F', lineHeight: 18 }}>{m.text}</T>
                  </View>
                );
              })}
            </View>

            {/* Mesaj Gönderme Girişi */}
            <View style={ps.inputRow}>
              <TextInput
                value={newPartnerMsg}
                onChangeText={setNewPartnerMsg}
                placeholder={currentRole === 'mother' ? 'Eşine bir sevgi notu yaz... 💕' : 'Eşine destek mesajı gönder... 🌸'}
                placeholderTextColor={colors.muted}
                style={ps.input}
                onSubmitEditing={sendPartnerMessage}
              />
              <Tap onPress={sendPartnerMessage} label="Gönder" style={ps.sendBtn}>
                <T bold style={{ color: 'white', fontSize: 13 }}>Gönder</T>
              </Tap>
            </View>
          </Card>

          {/* Bebeğimize Mektuplar & Notlar Defteri */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <T style={{ fontSize: 18 }}>💌</T>
              <T bold style={{ fontSize: 16, color: colors.ink }}>{babyName}'mıza Mektuplar</T>
            </View>

            <View style={{ gap: 10, marginBottom: 14 }}>
              {babyLetters.map(l => (
                <View key={l.id} style={ps.letterCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <T bold style={{ fontSize: 12, color: colors.purple }}>✍️ {l.author} Kaleme Aldı</T>
                    <T style={{ fontSize: 10, color: colors.muted }}>{l.date}</T>
                  </View>
                  <T style={{ fontSize: 13, color: '#4B4252', lineHeight: 19 }}>{l.text}</T>
                </View>
              ))}
            </View>

            {/* Bebeğe Yeni Mektup Ekleme */}
            <View style={ps.inputRow}>
              <TextInput
                value={newBabyLetter}
                onChangeText={setNewBabyLetter}
                placeholder="Bebeğine gelecekte okuyacağı bir not bırak..."
                placeholderTextColor={colors.muted}
                style={ps.input}
                onSubmitEditing={sendBabyLetter}
              />
              <Tap onPress={sendBabyLetter} label="Kaydet" style={ps.sendBtn}>
                <T bold style={{ color: 'white', fontSize: 13 }}>Sakla</T>
              </Tap>
            </View>
          </Card>
        </View>
      )}

      {/* ─── 4. TAB 2: KİŞİSEL & BEBEK BİLGİLERİ FORMU ─── */}
      {activeTab === 'personal' && (
        <Card style={{ padding: 18 }}>
          <T bold style={{ fontSize: 17, marginBottom: 14 }}>Aile & Gebelik Bilgileri</T>

          <View style={ps.fieldGroup}>
            <T bold style={ps.fieldLabel}>Anne Adayının Adı</T>
            <TextInput value={userName} onChangeText={setUserName} style={ps.fieldInput} />
          </View>

          <View style={ps.fieldGroup}>
            <T bold style={ps.fieldLabel}>Baba Adayının Adı</T>
            <TextInput value={partnerName} onChangeText={setPartnerName} style={ps.fieldInput} />
          </View>

          <View style={ps.fieldGroup}>
            <T bold style={ps.fieldLabel}>Bebeğin Adı / Lakabı</T>
            <TextInput value={babyName} onChangeText={setBabyName} style={ps.fieldInput} />
          </View>

          <View style={ps.fieldGroup}>
            <T bold style={ps.fieldLabel}>Bebeğin Cinsiyeti</T>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['Kız', 'Erkek', 'Henüz Sürpriz 🤍'].map(g => (
                <Tap
                  key={g}
                  onPress={() => setBabyGender(g)}
                  style={[ps.genderPick, babyGender === g && ps.genderPickActive]}
                >
                  <T bold={babyGender === g} style={{ fontSize: 12, color: babyGender === g ? colors.purple : colors.ink }}>
                    {g === 'Kız' ? '👧 Kız' : g === 'Erkek' ? '👦 Erkek' : g}
                  </T>
                </Tap>
              ))}
            </View>
          </View>

          <View style={ps.fieldGroup}>
            <T bold style={ps.fieldLabel}>Tahmini Doğum Tarihi</T>
            <TextInput value={dueDate} onChangeText={setDueDate} placeholder="2026-07-24" style={ps.fieldInput} />
            {!!dueDate && <T style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>{dateLabel(dueDate)}</T>}
          </View>

          <View style={ps.fieldGroup}>
            <T bold style={ps.fieldLabel}>Annenin Kan Grubu</T>
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
            <T style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>
              Bu alan doktor görüşmelerinde hızlı hatırlama içindir; tıbbi karar yerine geçmez.
            </T>
          </View>

          <View style={ps.fieldGroup}>
            <T bold style={ps.fieldLabel}>Takip Eden Doktor</T>
            <TextInput value={doctor} onChangeText={setDoctor} style={ps.fieldInput} />
          </View>

          <View style={ps.fieldGroup}>
            <T bold style={ps.fieldLabel}>Planlanan Doğum Hastanesi</T>
            <TextInput value={hospital} onChangeText={setHospital} style={ps.fieldInput} />
          </View>

          <Tap onPress={savePersonalInfo} label="Bilgileri kaydet" style={ps.saveFullBtn}>
            <T bold style={{ color: 'white', fontSize: 15 }}>Bilgilerimi Kaydet 🌸</T>
          </Tap>
        </Card>
      )}

      {/* ─── 5. TAB 3: FAVORİLER & ANILAR ─── */}
      {activeTab === 'favorites' && (
        <View style={{ gap: 14 }}>
          {/* Favori Bebek İsimleri */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <T bold style={{ fontSize: 16 }}>Beğendiğin Bebek İsimleri ({favNames.length})</T>
              <Tap onPress={() => open && open('babyNames')} style={{ padding: 4 }}>
                <T bold style={{ fontSize: 12, color: colors.purple }}>Tümünü Gör →</T>
              </Tap>
            </View>

            {matchedFavs.length === 0 ? (
              <T style={{ fontSize: 13, color: colors.muted, paddingVertical: 10 }}>
                Henüz favorilere isim eklemedin. Bebek İsimleri Kütüphanesini açarak beğendiklerini kalp ile kaydedebilirsin.
              </T>
            ) : (
              <View style={{ gap: 8 }}>
                {matchedFavs.map(n => (
                  <View key={n.id} style={ps.favNameRow}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <T bold style={{ fontSize: 15 }}>{n.name}</T>
                        <T style={{ fontSize: 11, color: colors.muted }}>({n.gender})</T>
                        {n.partnerMatch && <T style={{ fontSize: 11, color: '#B84570' }}>💕 Ortak Eşleşme</T>}
                      </View>
                      <T style={{ fontSize: 11, color: '#55485B', marginTop: 2 }} numberOfLines={1}>{n.meaning}</T>
                    </View>
                    <Icon name="heart" size={18} color="#C55B77" fill="#C55B77" />
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* Günlük Notları */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <T bold style={{ fontSize: 16 }}>Anı Defteri & Notlarım ({state.notes.length})</T>
              <Tap onPress={() => open && open('note')} style={{ padding: 4 }}>
                <T bold style={{ fontSize: 12, color: colors.purple }}>+ Not Yaz</T>
              </Tap>
            </View>

            {state.notes.length === 0 ? (
              <T style={{ fontSize: 13, color: colors.muted, paddingVertical: 8 }}>
                Henüz kaydedilmiş notun yok. İlk küçük anını saklayabilirsin.
              </T>
            ) : (
              state.notes.slice(0, 5).map(n => (
                <View key={n.id} style={ps.noteItem}>
                  <T style={{ fontSize: 13, lineHeight: 19, color: colors.ink }}>{n.text}</T>
                </View>
              ))
            )}
          </Card>
        </View>
      )}

      {/* ─── 6. TAB 4: TERCİHLER & AYARLAR ─── */}
      {activeTab === 'settings' && (
        <Card style={{ padding: 18 }}>
          <T bold style={{ fontSize: 17, marginBottom: 14 }}>Bildirimler & Tercihler</T>

          <Card style={{ padding: 16, backgroundColor: '#FAF6FA', borderColor: '#EDE0EE', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <BrandMark size={32} />
                <View>
                  <T bold style={{ fontSize: 15, color: colors.ink }}>Momora Bulut & Aile Hesabı</T>
                  <T style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                    {cloudUser ? `Aktif: ${cloudUser.email}` : 'Cihazlar arası anlık eşitleme'}
                  </T>
                </View>
              </View>
              {cloudUser && (
                <View style={{ backgroundColor: '#EDF7ED', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }}>
                  <T bold style={{ fontSize: 11, color: '#2E7D32' }}>Bağlı</T>
                </View>
              )}
            </View>

            {cloudUser ? (
              <View style={{ marginTop: 12, gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderColor: '#EFE5F0' }}>
                  <T style={{ fontSize: 12, color: colors.muted }}>Rol</T>
                  <T bold style={{ fontSize: 12, color: colors.purple }}>{currentRole === 'mother' ? 'Anne Hesabı' : 'Baba Hesabı'}</T>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderColor: '#EFE5F0' }}>
                  <T style={{ fontSize: 12, color: colors.muted }}>Eşleşme Kodu</T>
                  <T bold style={{ fontSize: 12, letterSpacing: 1, color: colors.ink }}>{state.familyCode || 'MOM-7829-TR'}</T>
                </View>
                <Tap onPress={handleSignOut} label="Çıkış yap" style={[ps.secondaryBtn, { marginTop: 6 }]}>
                  <T bold style={{ fontSize: 13, color: '#B42318' }}>Oturumu Kapat</T>
                </Tap>
              </View>
            ) : (
              <View style={{ marginTop: 12 }}>
                <T style={{ fontSize: 12, color: '#5C5463', lineHeight: 18, marginBottom: 12 }}>
                  Anne ve baba olarak aynı hesaba bağlanabilir, tüm verilerinizi ve eş notlarınızı güvenle senkronize edebilirsiniz.
                </T>
                <Tap onPress={() => open && open('auth')} style={ps.saveFullBtn}>
                  <T bold style={{ color: 'white', fontSize: 14 }}>Giriş Yap / Hesap Oluştur 🌸</T>
                </Tap>
              </View>
            )}
          </Card>

          <View style={ps.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <T bold style={{ fontSize: 14 }}>💧 Günlük Su Hatırlatıcısı</T>
              <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>Bildirim altyapısı bağlandığında günlük su hatırlatması al</T>
            </View>
            <Switch value={remindWater} onValueChange={v => { setRemindWater(v); update({ remindWater: v }); }} trackColor={{ true: colors.purple }} />
          </View>

          <View style={ps.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <T bold style={{ fontSize: 14 }}>💊 Sabah Vitamin Hatırlatıcısı</T>
              <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>Vitamin kaydını sabah akışında öne çıkar</T>
            </View>
            <Switch value={remindVitamin} onValueChange={v => { setRemindVitamin(v); update({ remindVitamin: v }); }} trackColor={{ true: colors.purple }} />
          </View>

          <View style={ps.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <T bold style={{ fontSize: 14 }}>💌 Bebeğin Günlük Mektubu</T>
              <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>Günün mektubunu ana akışta önceliklendir</T>
            </View>
            <Switch value={remindLetter} onValueChange={v => { setRemindLetter(v); update({ remindLetter: v }); }} trackColor={{ true: colors.purple }} />
          </View>

          <View style={ps.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <T bold style={{ fontSize: 14 }}>👨‍👩‍👧 Eş Sevgi Notu Bildirimleri</T>
              <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>Ortak aile hesabı bağlandığında eş notlarını öne çıkar</T>
            </View>
            <Switch value={remindPartner} onValueChange={v => { setRemindPartner(v); update({ remindPartner: v }); }} trackColor={{ true: colors.purple }} />
          </View>

          <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 16 }} />

          <T bold style={{ fontSize: 15, marginBottom: 10 }}>Yolculuk Modu</T>
          <Tap onPress={() => open && open('journey')} label="Yolculuğu değiştir" style={ps.secondaryBtn}>
            <T bold style={{ fontSize: 14, color: colors.purple }}>Yolculuk Aşamasını Değiştir</T>
          </Tap>

          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#48945A' }} />
              <T style={{ fontSize: 12, color: colors.muted }}>Momora Bulut Eşitleme · {isSupabaseConfigured ? 'Hazır' : 'Hazırlanıyor'}</T>
            </View>
            <T style={{ fontSize: 10, color: '#A092A3', marginTop: 4 }}>Yerel kayıtlar cihazda saklanıyor</T>
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

const ps = StyleSheet.create({
  container: { padding: 18, paddingBottom: 40, gap: 14 },
  heroCard: { padding: 18, backgroundColor: '#FFFDFA' },
  heroRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatarWrap: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#F5EBF5', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#E5D6E6' },
  userName: { fontSize: 21, color: colors.ink },
  roleBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
  userMotto: { fontSize: 12, color: colors.muted, fontStyle: 'italic', marginTop: 3 },
  partnerPill: { marginTop: 6, backgroundColor: '#EDF6F0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
  roleSwitchBtn: { marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F3E8F5', borderWidth: 1, borderColor: '#E5D2E8' },
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
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#F4EEF5' },
  secondaryBtn: { paddingVertical: 12, borderRadius: 14, backgroundColor: '#F3E8F5', alignItems: 'center' },
});
