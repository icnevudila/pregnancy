import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Image, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadow } from './theme';
import { Icon, BrandMark } from './Icons';
import { T, Tap, Card, Section, ScreenHero, ToolExperienceCard } from './ui';
import { uid, localDay } from './domain.mjs';
import { generatedAssets } from './generatedAssets';
import { articles, searchFaqs } from './content';
import { fetchCommunityPostsCloud, createCommunityPostCloud, addCommunityCommentCloud, fetchCommunityCommentsCloud } from './backendSync';

// ─── BAŞLANGIÇ FORUM VE TOPLULUK GÖNDERİLERİ ─────────────────────────────────
export const initialCommunityPosts = [
  {
    id: 'p1',
    user: 'Merve B.',
    week: '24. Hafta',
    weekEn: 'Week 24',
    title: 'Ayrıntılı ultrason için Anadolu yakasında perinatolog önerisi olan var mı?',
    titleEn: 'Anyone have a perinatologist recommendation for detailed ultrasound on the Anatolian side?',
    desc: 'Anadolu yakasında 20-22. hafta detaylı ultrasonu çektiren anneler, hekiminizden memnun kaldınız mı? Neye dikkat etmeliyim?',
    descEn: 'Moms who had their 20-22 week anomaly scan on the Anatolian side, were you pleased with your physician? What should I pay attention to?',
    likes: 38,
    comments: 14,
    cat: 'Kontrol & Hastane',
    catEn: 'Visits & Hospital',
    verified: true,
    verifiedBy: 'Momora Moderasyon Notu',
    verifiedByEn: 'Momora Moderator Note',
    verifiedAnswer: 'Detaylı ultrason için randevu alırken hekimin deneyimini, cihaz bilgisini, rapor formatını ve takip eden doktorunun yönlendirmesini birlikte değerlendirmen iyi olur.',
    verifiedAnswerEn: 'When booking a detailed ultrasound, evaluate physician experience, imaging capabilities, report format, and your attending physician\'s guidance together.',
    time: '2 saat önce',
    timeEn: '2 hours ago',
  },
  {
    id: 'p2',
    user: 'Deniz K.',
    week: '32. Hafta',
    weekEn: 'Week 32',
    title: 'İlk gebeliğimde normal doğum korkumu nasıl yendim? · Umut olsun diye yazıyorum 💕',
    titleEn: 'How I overcame my fear of vaginal birth in my first pregnancy · Sharing to inspire hope 💕',
    desc: 'Başlarda doğum kelimesi bile kalbimi çarptırıyordu. Doğum nefesi egzersizleri, perine masajı ve eşimin desteğiyle korkularım güvene dönüştü. Kimse korkmasın!',
    descEn: 'At first even the word labor made my heart race. With breathing exercises, perineal massage, and my partner\'s support, fears turned into confidence. Don\'t be afraid!',
    likes: 84,
    comments: 29,
    cat: 'Doğum Hikayesi',
    catEn: 'Birth Story',
    verified: false,
    time: '4 saat önce',
    timeEn: '4 hours ago',
    blogRef: 'art-skin-to-skin',
  },
  {
    id: 'p3',
    user: 'Gözde S. · Anonim',
    userEn: 'Gözde S. · Anonymous',
    week: '18. Hafta',
    weekEn: 'Week 18',
    title: 'Geceleri şiddetli bacak krampları yaşayan var mı?',
    titleEn: 'Does anyone else experience severe leg cramps at night?',
    desc: 'Uykudan uyandıran kramplar başladı. Doktorum magnezyum önerdi, siz nasıl rahatladınız? Bitkisel bir çözümü var mı?',
    descEn: 'Waking up with painful cramps has started. My doctor recommended magnesium, how did you find relief? Any natural remedies?',
    likes: 42,
    comments: 19,
    cat: 'Belirtiler & Aşerme',
    catEn: 'Symptoms & Cravings',
    verified: true,
    verifiedBy: 'Momora Moderasyon Notu',
    verifiedByEn: 'Momora Moderator Note',
    verifiedAnswer: 'Kramp notlarını saat, süre ve eşlik eden belirtilerle yazmak randevuda anlatmayı kolaylaştırır. Takviye ve ilaç kararını kendi doktorunla netleştirmen gerekir.',
    verifiedAnswerEn: 'Logging cramps with time, duration, and accompanying symptoms helps when explaining to your physician. Discuss any supplement choices with your doctor.',
    time: '5 saat önce',
    timeEn: '5 hours ago',
  },
  {
    id: 'p4',
    user: 'Selin T.',
    week: '30. Hafta',
    weekEn: 'Week 30',
    title: 'Bebek arabası seçimi: Travel sistem mi, kabin boy mu?',
    titleEn: 'Stroller selection: Travel system or cabin size?',
    desc: 'Apartmanda asansör var ama araba bagajımız küçük. Şehir içi pratik kullanım için hangisini tavsiye edersiniz? Deneyimlerinize çok ihtiyacım var.',
    descEn: 'Our building has an elevator but our car trunk is compact. Which do you recommend for practical city use? I would love your advice.',
    likes: 56,
    comments: 34,
    cat: 'Bebek Alışverişi',
    catEn: 'Baby Shopping',
    verified: false,
    time: '7 saat önce',
    timeEn: '7 hours ago',
  },
  {
    id: 'p5',
    user: 'Burcu A.',
    week: '14. Gün Lohusa',
    weekEn: 'Day 14 Postpartum',
    title: 'Sürekli ağlama isteği ve yetersizlik hissi normal mi? Yalnız hissetmek istemiyorum...',
    titleEn: 'Is crying frequently and feeling inadequate normal? I don\'t want to feel alone...',
    desc: 'Bebeğime yetemediğimi düşünüyorum, eşim destek olsa da sebepsiz gözyaşlarım durmuyor. Bu geçici mi, siz ne zaman toparlandınız? 🌸',
    descEn: 'I feel like I am not enough for my baby, and even with my partner\'s support tears keep coming. Is this temporary, when did you feel better? 🌸',
    likes: 92,
    comments: 46,
    cat: 'Dertleşme',
    catEn: 'Heart-to-Heart',
    verified: true,
    verifiedBy: 'Momora Destek Notu',
    verifiedByEn: 'Momora Support Note',
    verifiedAnswer: 'Bu duyguyu not etmek, destek istemek ve güvendiğin bir sağlık profesyoneliyle paylaşmak değerli. Kendine yalnız kalmayacağın küçük bir destek planı kur.',
    verifiedAnswerEn: 'Acknowledging this feeling, asking for support, and sharing with a trusted health professional is invaluable. Set up a gentle support plan so you are not alone.',
    time: '8 saat önce',
    timeEn: '8 hours ago',
    blogRef: 'art-postpartum-rest',
  },
  {
    id: 'p6',
    user: 'Ezgi Y.',
    week: '26. Hafta',
    weekEn: 'Week 26',
    title: 'Momora\'daki "Sol Yana Yatış" yazısını okuduktan sonra hamile yastığı aldım, hayatım değişti!',
    titleEn: 'After reading the "Sleeping on the Left Side" article on Momora, I bought a pregnancy pillow and my life changed!',
    desc: 'Kütüphanedeki uyku rehberi gerçekten çok açıklayıcı olmuş. Bel batmalarım bitti, bebeğin hareketlerini de çok daha rahat hissediyorum.',
    descEn: 'The sleep guide in the library is so clear. My lower back pain vanished, and I feel baby\'s movements much more comfortably.',
    likes: 67,
    comments: 21,
    cat: 'Blog & Deneyim',
    catEn: 'Blog & Experience',
    verified: false,
    time: '12 saat önce',
    timeEn: '12 hours ago',
    blogRef: 'art-safe-sleeping',
  }
];

// ─── TOPLULUK & FORUM ANA EKRANI (COMMUNITY HUB) ─────────────────────────────
// ─── TOPLULUK & FORUM ANA EKRANI (COMMUNITY HUB - SADE VE HUZURLU) ─────────────
export function CommunityHub({ open, state, update, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState('forum'); // 'forum' | 'club'
  const [filterCat, setFilterCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState(initialCommunityPosts);
  const [likedPosts, setLikedPosts] = useState({});
  const [newPostModal, setNewPostModal] = useState(false);

  React.useEffect(() => {
    fetchCommunityPostsCloud().then(res => {
      if (res?.data && res.data.length > 0) {
        const mapped = res.data.map(p => ({
          id: p.id,
          user: p.author_name,
          week: p.week_label || (isEn ? 'Mom' : 'Anne'),
          title: p.title,
          desc: p.body,
          likes: p.likes_count || 0,
          comments: p.comments_count || 0,
          cat: p.category,
          verified: false,
          time: new Date(p.created_at).toLocaleDateString(isEn ? 'en-US' : 'tr-TR'),
        }));
        setPosts(prev => {
          const existingIds = new Set(prev.map(x => x.id));
          const unique = mapped.filter(x => !existingIds.has(x.id));
          return [...unique, ...prev];
        });
      }
    }).catch(() => {});
  }, [isEn]);

  // Yeni gönderi formu
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState('Dertleşme');
  const [isAnon, setIsAnon] = useState(false);

  const categories = isEn ? [
    { id: 'all', label: 'All' },
    { id: 'Kontrol & Hastane', label: 'Visits & Hospital' },
    { id: 'Doğum Hikayesi', label: 'Birth Story' },
    { id: 'Belirtiler & Aşerme', label: 'Symptoms & Cravings' },
    { id: 'Bebek Alışverişi', label: 'Baby Shopping' },
    { id: 'Dertleşme', label: 'Heart-to-Heart' },
  ] : [
    { id: 'all', label: 'Tümü' },
    { id: 'Kontrol & Hastane', label: 'Kontrol & Hastane' },
    { id: 'Doğum Hikayesi', label: 'Doğum Hikayesi' },
    { id: 'Belirtiler & Aşerme', label: 'Belirtiler & Aşerme' },
    { id: 'Bebek Alışverişi', label: 'Bebek Alışverişi' },
    { id: 'Dertleşme', label: 'Dertleşme' },
  ];

  const catMap = {
    'Kontrol & Hastane': 'Visits & Hospital',
    'Doğum Hikayesi': 'Birth Story',
    'Belirtiler & Aşerme': 'Symptoms & Cravings',
    'Bebek Alışverişi': 'Baby Shopping',
    'Dertleşme': 'Heart-to-Heart',
    'Blog & Deneyim': 'Blog & Experience',
  };

  const filteredPosts = posts.filter(p => {
    const matchesCat = filterCat === 'all' || p.cat === filterCat;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.titleEn && p.titleEn.toLowerCase().includes(q)) ||
      (p.desc && p.desc.toLowerCase().includes(q)) ||
      (p.descEn && p.descEn.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  function handleCreatePost() {
    if (!newTitle.trim() || !newDesc.trim()) {
      toast && toast(isEn ? 'Please enter a title and details.' : 'Lütfen konu başlığı ve açıklama yazın.');
      return;
    }
    const created = {
      id: uid(),
      user: isAnon ? (isEn ? 'Anonymous Mom' : 'Anonim Anne') : (state.name || (isEn ? 'Me' : 'Ben')),
      week: state.week ? (isEn ? `Week ${state.week}` : `${state.week}. Hafta`) : (isEn ? 'Mom' : 'Anne'),
      title: newTitle.trim(),
      desc: newDesc.trim(),
      likes: 1,
      comments: 0,
      cat: newCat,
      verified: false,
      time: isEn ? 'Just now' : 'Az önce',
    };
    setPosts([created, ...posts]);
    setNewTitle('');
    setNewDesc('');
    setNewPostModal(false);
    toast && toast(isEn ? '🌸 Your question was published in the community feed!' : '🌸 Sorun topluluk akışında paylaşıldı!');
  }

  function toggleLike(postId) {
    const isLiked = !!likedPosts[postId];
    setLikedPosts(old => ({ ...old, [postId]: !isLiked }));
    setPosts(old => old.map(p => {
      if (p.id === postId) {
        return { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    }));
    toast && toast(isLiked ? (isEn ? 'Like removed' : 'Beğeni geri alındı') : (isEn ? 'Liked 💛' : 'Beğenildi 💛'));
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={cs.container}>
      {/* Sade & Şık Başlık Çubuğu */}
      <View style={cs.headerRow}>
        <View style={{ flex: 1 }}>
          <T bold style={cs.pageTitle}>{isEn ? 'Community' : 'Topluluk'}</T>
          <T style={cs.headerSub}>
            {isEn ? 'Mother experiences, calm questions and moderation notes in one feed.' : 'Anne deneyimleri, sakin sorular ve moderasyon notları tek akışta.'}
          </T>
        </View>
        <Tap
          onPress={() => setNewPostModal(true)}
          label={isEn ? "Ask New Question" : "Yeni Soru Sor"}
          style={cs.newPostBtn}
        >
          <T bold style={{ fontSize: 12.5, color: 'white' }}>{isEn ? '+ Ask Question' : '+ Soru Sor'}</T>
        </Tap>
      </View>

      <ScreenHero
        kicker={isEn ? "SAFE SHARING SPACE" : "GÜVENLİ PAYLAŞIM ALANI"}
        title={isEn ? `${filteredPosts.length} active topics` : `${filteredPosts.length} aktif konu`}
        body={isEn ? "Share experiences; always prioritize your attending healthcare provider's guidance for medical decisions." : "Deneyim paylaş; sağlık kararı gerektiren başlıklarda kendi uzmanının yönlendirmesini merkeze al."}
        icon="chat"
        asset="ui_community_mothers_circle"
        stat={isEn ? "moderation notes" : "moderasyon notları"}
        tint={colors.purple}
      />

      <ToolExperienceCard
        title={isEn ? 'Use the community safely' : 'Topluluğu güvenle kullan'}
        steps={isEn
          ? ['Start with a category, not endless scrolling.', 'Read similar experiences without treating them as diagnosis.', 'Save useful replies and ask your clinician for medical decisions.']
          : ['Sonsuz akış yerine kategoriyle başla.', 'Benzer deneyimleri tanı gibi görmeden oku.', 'İşe yarayan yanıtları kaydet, tıbbi kararları uzmanına sor.']}
        outcome={isEn ? 'Support stays warm, organized, and responsible.' : 'Destek sıcak, düzenli ve sorumlu kalır.'}
        asset="ui_community_mothers_circle"
        tint="#8A6BBE"
        lang={lang}
      />

      {/* Sade 2 Sekmeli Segment: Anne Sohbetleri / Doğum Kulübüm */}
      <View style={cs.hubTabs}>
        <Tap
          onPress={() => setActiveTab('forum')}
          label={isEn ? "Mom Chats" : "Anne Sohbetleri"}
          style={[cs.hubTab, activeTab === 'forum' && cs.hubTabActive]}
        >
          <T bold={activeTab === 'forum'} style={[cs.hubTabText, activeTab === 'forum' && { color: 'white' }]}>
            {isEn ? '💬 Mom Chats' : '💬 Anne Sohbetleri'}
          </T>
        </Tap>
        <Tap
          onPress={() => setActiveTab('club')}
          label={isEn ? "Birth Club" : "Doğum Kulübüm"}
          style={[cs.hubTab, activeTab === 'club' && cs.hubTabActive]}
        >
          <T bold={activeTab === 'club'} style={[cs.hubTabText, activeTab === 'club' && { color: 'white' }]}>
            {isEn ? '🌸 My Birth Club' : '🌸 Doğum Kulübüm'}
          </T>
        </Tap>
      </View>

      {activeTab === 'forum' ? (
        <View style={{ gap: 12 }}>
          {/* Arama Barı */}
          <View style={cs.searchBox}>
            <Icon name="search" size={18} color={colors.muted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={isEn ? "Search topics or questions..." : "Konularda veya sorularda ara..."}
              placeholderTextColor={colors.muted}
              style={cs.searchInput}
            />
            {searchQuery ? (
              <Tap onPress={() => setSearchQuery('')} label={isEn ? "Clear" : "Temizle"}>
                <Icon name="close" size={16} color={colors.muted} />
              </Tap>
            ) : null}
          </View>

          {/* Kategori Filtreleri */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, paddingVertical: 2 }}>
            {categories.map(c => (
              <Tap
                key={c.id}
                onPress={() => setFilterCat(c.id)}
                label={c.label}
                style={[cs.filterPill, filterCat === c.id && cs.filterPillActive]}
              >
                <T bold={filterCat === c.id} style={{ fontSize: 11.5, color: filterCat === c.id ? 'white' : colors.ink }}>
                  {c.label}
                </T>
              </Tap>
            ))}
          </ScrollView>

          {/* Gönderi Kartları - Sade, Ferah, Okunabilir */}
          <View style={{ gap: 11 }}>
            {filteredPosts.map(post => {
              const isLiked = !!likedPosts[post.id];
              const pTitle = (isEn && post.titleEn) ? post.titleEn : post.title;
              const pDesc = (isEn && post.descEn) ? post.descEn : post.desc;
              const pWeek = (isEn && post.weekEn) ? post.weekEn : post.week;
              const pCat = (isEn && (post.catEn || catMap[post.cat])) ? (post.catEn || catMap[post.cat]) : post.cat;
              const pTime = (isEn && post.timeEn) ? post.timeEn : post.time;
              const pUser = (isEn && post.userEn) ? post.userEn : post.user;
              return (
                <Card key={post.id} style={cs.postCard}>
                  {/* Başlık ve Yazar Bilgisi */}
                  <View style={cs.postHeader}>
                    <View style={cs.avatar}>
                      <T style={{ fontSize: 14 }}>👩</T>
                    </View>
                    <View style={{ flex: 1, marginLeft: 9 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <T bold style={{ fontSize: 13, color: colors.ink }}>{pUser}</T>
                        <View style={cs.weekTag}>
                          <T style={{ fontSize: 10, color: colors.purple, fontWeight: '600' }}>{pWeek}</T>
                        </View>
                      </View>
                      <T style={{ fontSize: 10.5, color: colors.muted, marginTop: 1 }}>
                        {pTime} · {pCat}
                      </T>
                    </View>
                    {post.verified && (
                      <View style={cs.verifiedBadge}>
                        <T bold style={{ fontSize: 10, color: '#2D754C' }}>
                          {isEn ? '✓ Moderator Note' : '✓ Moderasyon Notu'}
                        </T>
                      </View>
                    )}
                  </View>

                  {/* Soru / Konu İçeriği */}
                  <Tap
                    onPress={() => open && open('communityThread', { ...post, lang })}
                    label={pTitle}
                    style={{ marginTop: 10 }}
                  >
                    <T bold style={cs.postTitle}>{pTitle}</T>
                    <T numberOfLines={2} style={cs.postDesc}>{pDesc}</T>
                  </Tap>

                  {/* Etkileşim Satırı */}
                  <View style={cs.postFooter}>
                    <Tap
                      onPress={() => toggleLike(post.id)}
                      label={isEn ? "Like" : "Beğen"}
                      style={cs.actionItem}
                    >
                      <Icon
                        name="heart"
                        size={16}
                        color={isLiked ? '#C75B7A' : colors.muted}
                        fill={isLiked ? '#C75B7A' : 'none'}
                      />
                      <T bold={isLiked} style={{ fontSize: 11.5, color: isLiked ? '#C75B7A' : colors.muted }}>
                        {post.likes}
                      </T>
                    </Tap>

                    <Tap
                      onPress={() => open && open('communityThread', { ...post, lang })}
                      label={isEn ? "Replies" : "Yanıtlar"}
                      style={cs.actionItem}
                    >
                      <Icon name="chat" size={16} color={colors.muted} />
                      <T style={{ fontSize: 11.5, color: colors.muted }}>
                        {post.comments} {isEn ? 'replies' : 'yanıt'}
                      </T>
                    </Tap>

                    <View style={{ flex: 1 }} />

                    <Tap
                      onPress={() => open && open('communityThread', { ...post, lang })}
                      label={isEn ? "Reply" : "Yanıtla"}
                      style={{ paddingVertical: 4 }}
                    >
                      <T bold style={{ fontSize: 11.5, color: colors.purple }}>
                        {isEn ? 'Join Discussion →' : 'Sohbete Katıl →'}
                      </T>
                    </Tap>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>
      ) : (
        /* ─── DOĞUM AYI KULÜBÜ (TEMMUZ 2026 ANNELERİ) ─────────────── */
        <BirthMonthClubScreen onOpenThread={p => open && open('communityThread', { ...p, lang })} lang={lang} />
      )}

      {/* YENİ GÖNDERİ PAYLAŞMA MODALİ */}
      <Modal visible={newPostModal} transparent animationType="slide" onRequestClose={() => setNewPostModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={cs.modalBackdrop}>
          <View style={cs.modalSheet}>
            <View style={cs.modalHandle} />
            <View style={cs.modalHead}>
              <T bold style={{ fontSize: 17, color: colors.ink }}>
                {isEn ? 'Ask the Community ✍️' : 'Topluluğa Soru Sor ✍️'}
              </T>
              <Tap onPress={() => setNewPostModal(false)} label={isEn ? "Close" : "Kapat"} style={{ padding: 6 }}>
                <Icon name="close" size={20} color={colors.muted} />
              </Tap>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 20 }}>
              <T style={{ fontSize: 12.5, color: colors.muted }}>
                {isEn
                  ? 'Share your question or experience. Get support from fellow mothers and Momora reference notes.'
                  : 'Sorunu veya tecrübeni paylaş. Benzer süreçlerden geçen annelerden ve Momora kaynak notlarından destek al.'}
              </T>

              {/* Kategori Seçici */}
              <T bold style={{ fontSize: 12.5, marginTop: 4 }}>
                {isEn ? 'Topic Category:' : 'Konu Kategorisi:'}
              </T>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {categories.filter(c => c.id !== 'all').map(c => (
                  <Tap
                    key={c.id}
                    onPress={() => setNewCat(c.id)}
                    label={c.label}
                    style={[cs.modalCatPill, newCat === c.id && cs.modalCatPillActive]}
                  >
                    <T bold={newCat === c.id} style={{ fontSize: 11, color: newCat === c.id ? 'white' : colors.ink }}>
                      {c.label}
                    </T>
                  </Tap>
                ))}
              </ScrollView>

              {/* Başlık Girişi */}
              <T bold style={{ fontSize: 12.5, marginTop: 4 }}>
                {isEn ? 'Question or Topic Title:' : 'Soru veya Konu Başlığı:'}
              </T>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder={isEn ? "E.g. Any recommendations for 20th week detailed scan?" : "Örn: 20. hafta detaylı ultrason için önerileriniz var mı?"}
                placeholderTextColor={colors.muted}
                style={cs.modalInput}
              />

              {/* Açıklama Girişi */}
              <T bold style={{ fontSize: 12.5, marginTop: 4 }}>
                {isEn ? 'Details:' : 'Detaylar:'}
              </T>
              <TextInput
                value={newDesc}
                onChangeText={setNewDesc}
                placeholder={isEn ? "Write what is on your mind, symptoms, or what you are curious about..." : "Aklına takılanları, belirtilerini veya merak ettiklerini buraya yazabilirsin..."}
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
                style={[cs.modalInput, { minHeight: 90, textAlignVertical: 'top' }]}
              />

              {/* Anonim Seçeneği */}
              <Tap
                onPress={() => setIsAnon(!isAnon)}
                label={isEn ? "Share anonymously" : "Anonim olarak paylaş"}
                style={cs.anonRow}
              >
                <View style={[cs.checkbox, isAnon && cs.checkboxActive]}>
                  {isAnon && <T style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>✓</T>}
                </View>
                <T style={{ fontSize: 12.5, color: colors.ink }}>
                  {isEn ? 'Hide my name · Publish as Anonymous Mom' : 'İsmimi gizle · Anonim Anne olarak yayınla'}
                </T>
              </Tap>

              {/* Paylaş Butonu */}
              <Tap
                onPress={handleCreatePost}
                label={isEn ? "Submit Post" : "Paylaşımı Gönder"}
                style={cs.submitPostBtn}
              >
                <T bold style={{ color: 'white', fontSize: 14 }}>
                  {isEn ? 'Publish Post ✨' : 'Paylaşımı Yayınla ✨'}
                </T>
              </Tap>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

export function BirthMonthClubScreen({ onOpenThread, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [filter, setFilter] = useState('all');
  const filters = isEn ? [
    { id: 'all', label: 'All' },
    { id: 'Kontrol & Hastane', label: 'Visits & Hospital' },
    { id: 'Belirtiler & Aşerme', label: 'Symptoms & Cravings' },
    { id: 'Bebek Alışverişi', label: 'Baby Shopping' },
    { id: 'Dertleşme', label: 'Heart-to-Heart' }
  ] : [
    { id: 'all', label: 'Tümü' },
    { id: 'Kontrol & Hastane', label: 'Kontrol & Hastane' },
    { id: 'Belirtiler & Aşerme', label: 'Belirtiler & Aşerme' },
    { id: 'Bebek Alışverişi', label: 'Bebek Alışverişi' },
    { id: 'Dertleşme', label: 'Dertleşme' }
  ];

  const catMap = {
    'Kontrol & Hastane': 'Visits & Hospital',
    'Belirtiler & Aşerme': 'Symptoms & Cravings',
    'Bebek Alışverişi': 'Baby Shopping',
    'Dertleşme': 'Heart-to-Heart',
  };

  const filtered = initialCommunityPosts.filter(p => filter === 'all' || p.cat === filter);

  return (
    <View style={{ gap: 14 }}>
      {/* Kulüp Başlık Banner'ı */}
      <Card style={cs.clubBanner}>
        <LinearGradient
          colors={['#8F6E8F', '#6D4E6D']}
          style={StyleSheet.absoluteFill}
        />
        <View style={cs.bannerRow}>
          <View style={cs.bannerIcon}>
            <T style={{ fontSize: 24 }}>🌸</T>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <T bold style={{ color: 'white', fontSize: 17 }}>
              {isEn ? 'July 2026 Moms' : 'Temmuz 2026 Anneleri'}
            </T>
            <T style={{ color: '#E8D5E8', fontSize: 12, marginTop: 2 }}>
              {isEn ? '4,280 Moms · Meeting in the same month 💕' : '4.280 Anne · Aynı ayda kavuşuyoruz 💕'}
            </T>
          </View>
        </View>
      </Card>

      {/* Konu Filtreleri */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {filters.map(f => (
          <Tap
            key={f.id}
            onPress={() => setFilter(f.id)}
            label={f.label}
            style={[cs.filterPill, filter === f.id && cs.filterPillActive]}
          >
            <T bold={filter === f.id} style={{ fontSize: 12, color: filter === f.id ? 'white' : colors.ink }}>
              {f.label}
            </T>
          </Tap>
        ))}
      </ScrollView>

      {/* Gönderi Kartları */}
      <View style={{ gap: 12 }}>
        {filtered.map(post => {
          const pTitle = (isEn && post.titleEn) ? post.titleEn : post.title;
          const pDesc = (isEn && post.descEn) ? post.descEn : post.desc;
          const pWeek = (isEn && post.weekEn) ? post.weekEn : post.week;
          const pCat = (isEn && (post.catEn || catMap[post.cat])) ? (post.catEn || catMap[post.cat]) : post.cat;
          const pUser = (isEn && post.userEn) ? post.userEn : post.user;
          return (
            <Tap
              key={post.id}
              onPress={() => onOpenThread && onOpenThread({ ...post, lang })}
              label={pTitle}
              style={cs.postCard}
            >
              <View style={cs.postHeader}>
                <View style={cs.avatar}>
                  <T style={{ fontSize: 13 }}>👩</T>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <T bold style={{ fontSize: 13 }}>{pUser}</T>
                  <T style={{ fontSize: 10, color: colors.muted }}>{pWeek} · {pCat}</T>
                </View>
                {post.verified && (
                  <View style={cs.verifiedBadge}>
                    <T style={{ fontSize: 10, color: colors.purple }}>
                      {isEn ? 'Moderator Note ✓' : 'Moderasyon Notu ✓'}
                    </T>
                  </View>
                )}
              </View>

              <T bold style={{ fontSize: 14, color: colors.ink, marginTop: 8, lineHeight: 20 }}>
                {pTitle}
              </T>
              <T style={{ fontSize: 12, color: '#554A5A', marginTop: 4, lineHeight: 18 }}>
                {pDesc}
              </T>

              <View style={cs.postFooter}>
                <View style={cs.statRow}>
                  <Icon name="heart" size={15} color={colors.muted} />
                  <T style={{ fontSize: 12, color: colors.muted }}>{post.likes}</T>
                </View>
                <View style={cs.statRow}>
                  <Icon name="chat" size={15} color={colors.muted} />
                  <T style={{ fontSize: 12, color: colors.muted }}>
                    {post.comments} {isEn ? 'replies' : 'yanıt'}
                  </T>
                </View>
              </View>
            </Tap>
          );
        })}
      </View>
    </View>
  );
}

// ─── EKRAN 21: TOPLULUK TARTIŞMA & SOHBET DETAY EKRANI ───────────────────────
export function CommunityThreadScreen({ post, toast, lang: propLang }) {
  const lang = propLang || post?.lang || 'tr';
  const isEn = lang === 'en';
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(isEn ? [
    {
      id: 'c1',
      author: 'Midwife Ayşe Yılmaz',
      role: 'Momora Community Guide',
      isExpert: true,
      text: 'Logging cramps with time, duration, and accompanying symptoms makes discussions at visits much easier. Warm showers, gentle stretches, and hydration tracking can help; confirm any supplement choices with your own physician.',
      time: '3 hours ago',
      helpful: 42,
    },
    {
      id: 'c2',
      author: 'Deniz K.',
      role: 'Week 26',
      isExpert: false,
      text: 'I increased banana intake and placed a rolled towel under my legs while sleeping, it made a huge difference!',
      time: '1 hour ago',
      helpful: 12,
    },
    {
      id: 'c3',
      author: 'Elif M.',
      role: 'Week 20',
      isExpert: false,
      text: 'We experienced the exact same cramps; taking notes and discussing them at our checkup clarified what to adjust.',
      time: '35 min ago',
      helpful: 6,
    }
  ] : [
    {
      id: 'c1',
      author: 'Ebe Ayşe Yılmaz',
      role: 'Momora Topluluk Rehberi',
      isExpert: true,
      text: 'Kramp notlarını saat, süre ve eşlik eden belirtilerle yazmak randevuda anlatmayı kolaylaştırır. Ilık duş, nazik esneme ve su takibi bazı annelerde rahatlatıcı olabilir; takviye kararını kendi hekiminle netleştir.',
      time: '3 saat önce',
      helpful: 42,
    },
    {
      id: 'c2',
      author: 'Deniz K.',
      role: '26. Hafta',
      isExpert: false,
      text: 'Ben muz tüketimini artırdım ve yatarken bacaklarımın altına rulo havlu koydum, gerçekten çok fark etti!',
      time: '1 saat önce',
      helpful: 12,
    },
    {
      id: 'c3',
      author: 'Elif M.',
      role: '20. Hafta',
      isExpert: false,
      text: 'Biz de aynı krampları yaşıyorduk; not tutup kontrol randevusunda konuşunca neyi değiştireceğimizi daha net anladık.',
      time: '35 dk önce',
      helpful: 6,
    }
  ]);

  const p = post || initialCommunityPosts[0];
  const pTitle = (isEn && p.titleEn) ? p.titleEn : p.title;
  const pDesc = (isEn && p.descEn) ? p.descEn : p.desc;
  const pWeek = (isEn && p.weekEn) ? p.weekEn : p.week;
  const pCat = (isEn && p.catEn) ? p.catEn : p.cat;
  const pTime = (isEn && p.timeEn) ? p.timeEn : p.time;
  const pUser = (isEn && p.userEn) ? p.userEn : p.user;

  function addComment() {
    if (!commentText.trim()) return;
    const newC = {
      id: uid(),
      author: isEn ? 'You' : 'Sen',
      role: isEn ? 'Week 24' : '24. Hafta',
      isExpert: false,
      text: commentText.trim(),
      time: isEn ? 'Just now' : 'Az önce',
      helpful: 0,
    };
    setComments([...comments, newC]);
    setCommentText('');
    toast && toast(isEn ? '🌸 Your reply was added to the community chat!' : '🌸 Yanıtınız topluluk sohbetine eklendi!');
  }

  return (
    <View style={{ gap: 14, paddingBottom: 24 }}>
      {/* Ana Soru Kartı */}
      <Card style={cs.mainThreadCard}>
        <View style={cs.postHeader}>
          <View style={cs.avatar}>
            <T style={{ fontSize: 16 }}>👩</T>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <T bold style={{ fontSize: 14.5, color: colors.ink }}>{pUser}</T>
            <T style={{ fontSize: 11, color: colors.muted }}>{pWeek} · {pCat} · {pTime}</T>
          </View>
          {p.verified && (
            <View style={cs.verifiedBadge}>
              <T bold style={{ fontSize: 10, color: '#2D754C' }}>
                {isEn ? '✓ Moderator Note' : '✓ Moderasyon Notu'}
              </T>
            </View>
          )}
        </View>

        <T bold style={{ fontSize: 17, color: colors.ink, marginTop: 12, lineHeight: 23 }}>
          {pTitle}
        </T>
        <T style={{ fontSize: 14, color: '#4E4453', marginTop: 8, lineHeight: 22 }}>
          {pDesc}
        </T>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderColor: '#F2E8F2' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Icon name="heart" size={16} color="#C75B7A" fill="#C75B7A" />
            <T bold style={{ fontSize: 12, color: '#C75B7A' }}>
              {p.likes} {isEn ? 'Mothers liked this' : 'Anne beğendi'}
            </T>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Icon name="chat" size={16} color={colors.purple} />
            <T bold style={{ fontSize: 12, color: colors.purple }}>
              {comments.length} {isEn ? 'Participant Replies' : 'Katılımcı Yanıtı'}
            </T>
          </View>
        </View>
      </Card>

      <Section title={isEn ? `Chat & Replies (${comments.length})` : `Sohbet & Yanıtlar (${comments.length})`} />

      {/* Yanıtlar Akışı */}
      <View style={{ gap: 11 }}>
        {comments.map(c => (
          <Card
            key={c.id}
            style={[
              cs.commentCard,
              c.isExpert && { borderColor: '#8E6E8E', backgroundColor: '#FAF5FA' },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[cs.commentAvatar, c.isExpert && { backgroundColor: '#8E6E8E' }]}>
                <T style={{ fontSize: 13, color: c.isExpert ? 'white' : colors.ink }}>
                  {c.isExpert ? '✓' : '💬'}
                </T>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <T bold style={{ fontSize: 13.5 }}>{c.author}</T>
                  {c.isExpert ? (
                    <View style={cs.expertTag}>
                      <T bold style={{ fontSize: 9.5, color: 'white' }}>
                        {isEn ? 'GUIDE NOTE' : 'REHBER NOTU'}
                      </T>
                    </View>
                  ) : (
                    <T style={{ fontSize: 10.5, color: colors.muted }}>({c.role})</T>
                  )}
                </View>
                <T style={{ fontSize: 10.5, color: colors.muted, marginTop: 2 }}>{c.time}</T>
              </View>
            </View>

            <T style={{ fontSize: 13.5, color: '#413A47', marginTop: 10, lineHeight: 21 }}>
              {c.text}
            </T>
          </Card>
        ))}
      </View>

      {/* Yanıt Yazma Çubuğu */}
      <View style={cs.replyBar}>
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder={isEn ? "Share your thought, advice, or experience..." : "Düşünceni, tavsiyeni veya deneyimini paylaş..."}
          placeholderTextColor={colors.muted}
          style={cs.replyInput}
          onSubmitEditing={addComment}
        />
        <Tap onPress={addComment} label={isEn ? "Send" : "Gönder"} style={cs.replySend}>
          <Icon name="send" size={17} color="white" />
        </Tap>
      </View>
    </View>
  );
}

const cs = StyleSheet.create({
  container: { paddingHorizontal: 17, paddingTop: 14, paddingBottom: 32, gap: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  pageTitle: { fontSize: 25, letterSpacing: -0.5, color: colors.ink, marginTop: 3 },
  headerSub: { fontSize: 12.5, color: colors.muted, marginTop: 3, lineHeight: 18 },
  newPostBtn: { backgroundColor: colors.purple, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 16, ...shadow },
  clubMiniBanner: { borderRadius: 18, overflow: 'hidden', padding: 12, flexDirection: 'row', alignItems: 'center', ...shadow },
  hubTabs: { flexDirection: 'row', backgroundColor: '#EDE4F2', borderRadius: 16, padding: 3, gap: 3 },
  hubTab: { flex: 1, paddingVertical: 7, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  hubTabActive: { backgroundColor: colors.purple },
  hubTabText: { fontSize: 10.5, color: '#795B82' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFDFA', borderWidth: 1, borderColor: '#DED3DB', borderRadius: 18, paddingHorizontal: 14, height: 44, ...shadow },
  searchInput: { flex: 1, fontSize: 13, color: colors.ink },
  filterPill: { paddingVertical: 6, paddingHorizontal: 13, borderRadius: 15, backgroundColor: '#EFEAEF' },
  filterPillActive: { backgroundColor: colors.purple },
  postCard: { padding: 16, borderRadius: 20 },
  postHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3EAF4', alignItems: 'center', justifyContent: 'center' },
  weekTag: { backgroundColor: '#F3EBF4', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  verifiedBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: '#EBF5EF' },
  postTitle: { fontSize: 15, color: colors.ink, lineHeight: 21 },
  postDesc: { fontSize: 13, color: '#554A5A', marginTop: 5, lineHeight: 19 },
  verifiedPreviewBox: { marginTop: 10, padding: 10, borderRadius: 12, backgroundColor: '#FAF4FA', borderWidth: 1, borderColor: '#EEDCEE' },
  postFooter: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderColor: '#F2E8F2' },
  actionItem: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4 },
  joinChatBtn: { paddingVertical: 4 },
  // Blog discussion styles
  blogDiscussionCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#ECE2EC', gap: 12, ...shadow },
  blogDiscussionImg: { width: 72, height: 72, borderRadius: 14 },
  categoryBadge: { backgroundColor: '#F4EEF6', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 7 },
  // Modal styles
  modalBackdrop: { flex: 1, backgroundColor: '#211A304D', alignItems: 'center', justifyContent: 'flex-end' },
  modalSheet: { width: '100%', maxWidth: 440, maxHeight: '88%', backgroundColor: colors.canvas, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 22, paddingTop: 12 },
  modalHandle: { height: 4, width: 40, borderRadius: 2, backgroundColor: '#D9CDD7', alignSelf: 'center', marginBottom: 16 },
  modalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderColor: colors.line },
  modalCatPill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#EFEAEF' },
  modalCatPillActive: { backgroundColor: colors.purple },
  modalInput: { borderWidth: 1, borderColor: '#DED3DB', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#FFFDFA', fontSize: 13.5, color: colors.ink },
  anonRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: '#B5A6B5', alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: colors.purple, borderColor: colors.purple },
  submitPostBtn: { backgroundColor: colors.purple, borderRadius: 18, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  // Assistant Card
  promptCard: { flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDE4EC', ...shadow },
  chatInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 10 },
  chatTextInput: { flex: 1, height: 46, borderRadius: 18, borderWidth: 1, borderColor: '#DED3DB', paddingHorizontal: 14, backgroundColor: '#FFFDFA', fontSize: 13.5, color: colors.ink },
  chatSendBtn: { width: 46, height: 46, borderRadius: 18, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
  // Thread styles
  clubBanner: { height: 95, borderRadius: 20, overflow: 'hidden', padding: 16, justifyContent: 'center' },
  bannerRow: { flexDirection: 'row', alignItems: 'center' },
  bannerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF33', alignItems: 'center', justifyContent: 'center' },
  mainThreadCard: { padding: 18 },
  commentCard: { padding: 15 },
  commentAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#EEE6F0', alignItems: 'center', justifyContent: 'center' },
  expertTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: colors.purple },
  replyBar: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 12 },
  replyInput: { flex: 1, height: 46, borderRadius: 18, borderWidth: 1, borderColor: '#DED3DB', paddingHorizontal: 14, backgroundColor: '#FFFDFA', fontSize: 13, color: colors.ink },
  replySend: { width: 46, height: 46, borderRadius: 18, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
});
