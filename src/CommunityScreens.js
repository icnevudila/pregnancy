import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Image, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadow } from './theme';
import { Icon, BrandMark } from './Icons';
import { T, Tap, Card, Section, ScreenHero } from './ui';
import { uid, localDay } from './domain.mjs';
import { generatedAssets } from './generatedAssets';
import { articles, searchFaqs } from './content';

// ─── BAŞLANGIÇ FORUM VE TOPLULUK GÖNDERİLERİ ─────────────────────────────────
export const initialCommunityPosts = [
  {
    id: 'p1',
    user: 'Merve B.',
    week: '24. Hafta',
    title: 'Ayrıntılı ultrason için Anadolu yakasında perinatolog önerisi olan var mı?',
    desc: 'Anadolu yakasında 20-22. hafta detaylı ultrasonu çektiren anneler, hekiminizden memnun kaldınız mı? Neye dikkat etmeliyim?',
    likes: 38,
    comments: 14,
    cat: 'Kontrol & Hastane',
    verified: true,
    verifiedBy: 'Momora Moderasyon Notu',
    verifiedAnswer: 'Detaylı ultrason için randevu alırken hekimin deneyimini, cihaz bilgisini, rapor formatını ve takip eden doktorunun yönlendirmesini birlikte değerlendirmen iyi olur.',
    time: '2 saat önce',
  },
  {
    id: 'p2',
    user: 'Deniz K.',
    week: '32. Hafta',
    title: 'İlk gebeliğimde normal doğum korkumu nasıl yendim? · Umut olsun diye yazıyorum 💕',
    desc: 'Başlarda doğum kelimesi bile kalbimi çarptırıyordu. Doğum nefesi egzersizleri, perine masajı ve eşimin desteğiyle korkularım güvene dönüştü. Kimse korkmasın!',
    likes: 84,
    comments: 29,
    cat: 'Doğum Hikayesi',
    verified: false,
    time: '4 saat önce',
    blogRef: 'art-skin-to-skin',
  },
  {
    id: 'p3',
    user: 'Gözde S. · Anonim',
    week: '18. Hafta',
    title: 'Geceleri şiddetli bacak krampları yaşayan var mı?',
    desc: 'Uykudan uyandıran kramplar başladı. Doktorum magnezyum önerdi, siz nasıl rahatladınız? Bitkisel bir çözümü var mı?',
    likes: 42,
    comments: 19,
    cat: 'Belirtiler & Aşerme',
    verified: true,
    verifiedBy: 'Momora Moderasyon Notu',
    verifiedAnswer: 'Kramp notlarını saat, süre ve eşlik eden belirtilerle yazmak randevuda anlatmayı kolaylaştırır. Takviye ve ilaç kararını kendi doktorunla netleştirmen gerekir.',
    time: '5 saat önce',
  },
  {
    id: 'p4',
    user: 'Selin T.',
    week: '30. Hafta',
    title: 'Bebek arabası seçimi: Travel sistem mi, kabin boy mu?',
    desc: 'Apartmanda asansör var ama araba bagajımız küçük. Şehir içi pratik kullanım için hangisini tavsiye edersiniz? Deneyimlerinize çok ihtiyacım var.',
    likes: 56,
    comments: 34,
    cat: 'Bebek Alışverişi',
    verified: false,
    time: '7 saat önce',
  },
  {
    id: 'p5',
    user: 'Burcu A.',
    week: '14. Gün Lohusa',
    title: 'Sürekli ağlama isteği ve yetersizlik hissi normal mi? Yalnız hissetmek istemiyorum...',
    desc: 'Bebeğime yetemediğimi düşünüyorum, eşim destek olsa da sebepsiz gözyaşlarım durmuyor. Bu geçici mi, siz ne zaman toparlandınız? 🌸',
    likes: 92,
    comments: 46,
    cat: 'Dertleşme',
    verified: true,
    verifiedBy: 'Momora Destek Notu',
    verifiedAnswer: 'Bu duyguyu not etmek, destek istemek ve güvendiğin bir sağlık profesyoneliyle paylaşmak değerli. Kendine yalnız kalmayacağın küçük bir destek planı kur.',
    time: '8 saat önce',
    blogRef: 'art-postpartum-rest',
  },
  {
    id: 'p6',
    user: 'Ezgi Y.',
    week: '26. Hafta',
    title: 'Momora\'daki "Sol Yana Yatış" yazısını okuduktan sonra hamile yastığı aldım, hayatım değişti!',
    desc: 'Kütüphanedeki uyku rehberi gerçekten çok açıklayıcı olmuş. Bel batmalarım bitti, bebeğin hareketlerini de çok daha rahat hissediyorum.',
    likes: 67,
    comments: 21,
    cat: 'Blog & Deneyim',
    verified: false,
    time: '12 saat önce',
    blogRef: 'art-safe-sleeping',
  }
];

// ─── TOPLULUK & FORUM ANA EKRANI (COMMUNITY HUB) ─────────────────────────────
// ─── TOPLULUK & FORUM ANA EKRANI (COMMUNITY HUB - SADE VE HUZURLU) ─────────────
export function CommunityHub({ open, state, update, toast }) {
  const [activeTab, setActiveTab] = useState('forum'); // 'forum' | 'club'
  const [filterCat, setFilterCat] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState(initialCommunityPosts);
  const [likedPosts, setLikedPosts] = useState({});
  const [newPostModal, setNewPostModal] = useState(false);

  // Yeni gönderi formu
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState('Dertleşme');
  const [isAnon, setIsAnon] = useState(false);

  const categories = ['Tümü', 'Kontrol & Hastane', 'Doğum Hikayesi', 'Belirtiler & Aşerme', 'Bebek Alışverişi', 'Dertleşme'];

  const filteredPosts = posts.filter(p => {
    const matchesCat = filterCat === 'Tümü' || p.cat === filterCat;
    const matchesSearch = !searchQuery || 
      p.title.toLocaleLowerCase('tr').includes(searchQuery.toLocaleLowerCase('tr')) ||
      p.desc.toLocaleLowerCase('tr').includes(searchQuery.toLocaleLowerCase('tr'));
    return matchesCat && matchesSearch;
  });

  function handleCreatePost() {
    if (!newTitle.trim() || !newDesc.trim()) {
      toast && toast('Lütfen konu başlığı ve açıklama yazın.');
      return;
    }
    const created = {
      id: uid(),
      user: isAnon ? 'Anonim Anne' : (state.name || 'Ben'),
      week: state.week ? `${state.week}. Hafta` : 'Anne',
      title: newTitle.trim(),
      desc: newDesc.trim(),
      likes: 1,
      comments: 0,
      cat: newCat,
      verified: false,
      time: 'Az önce',
    };
    setPosts([created, ...posts]);
    setNewTitle('');
    setNewDesc('');
    setNewPostModal(false);
    toast && toast('🌸 Sorun topluluk akışında paylaşıldı!');
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
    toast && toast(isLiked ? 'Beğeni geri alındı' : 'Beğenildi 💛');
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={cs.container}>
      {/* Sade & Şık Başlık Çubuğu */}
      <View style={cs.headerRow}>
        <View style={{ flex: 1 }}>
          <T bold style={cs.pageTitle}>Topluluk</T>
          <T style={cs.headerSub}>
            Anne deneyimleri, sakin sorular ve moderasyon notları tek akışta.
          </T>
        </View>
        <Tap
          onPress={() => setNewPostModal(true)}
          label="Yeni Soru Sor"
          style={cs.newPostBtn}
        >
          <T bold style={{ fontSize: 12.5, color: 'white' }}>+ Soru Sor</T>
        </Tap>
      </View>

      <ScreenHero
        kicker="GÜVENLİ PAYLAŞIM ALANI"
        title={`${filteredPosts.length} aktif konu`}
        body="Deneyim paylaş; sağlık kararı gerektiren başlıklarda kendi uzmanının yönlendirmesini merkeze al."
        icon="chat"
        stat="moderasyon notları"
        tint={colors.purple}
      />

      {/* Sade 2 Sekmeli Segment: Anne Sohbetleri / Doğum Kulübüm */}
      <View style={cs.hubTabs}>
        <Tap
          onPress={() => setActiveTab('forum')}
          label="Anne Sohbetleri"
          style={[cs.hubTab, activeTab === 'forum' && cs.hubTabActive]}
        >
          <T bold={activeTab === 'forum'} style={[cs.hubTabText, activeTab === 'forum' && { color: 'white' }]}>
            💬 Anne Sohbetleri
          </T>
        </Tap>
        <Tap
          onPress={() => setActiveTab('club')}
          label="Doğum Kulübüm"
          style={[cs.hubTab, activeTab === 'club' && cs.hubTabActive]}
        >
          <T bold={activeTab === 'club'} style={[cs.hubTabText, activeTab === 'club' && { color: 'white' }]}>
            🌸 Doğum Kulübüm
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
              placeholder="Konularda veya sorularda ara..."
              placeholderTextColor={colors.muted}
              style={cs.searchInput}
            />
            {searchQuery ? (
              <Tap onPress={() => setSearchQuery('')} label="Temizle">
                <Icon name="close" size={16} color={colors.muted} />
              </Tap>
            ) : null}
          </View>

          {/* Kategori Filtreleri */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, paddingVertical: 2 }}>
            {categories.map(c => (
              <Tap
                key={c}
                onPress={() => setFilterCat(c)}
                label={c}
                style={[cs.filterPill, filterCat === c && cs.filterPillActive]}
              >
                <T bold={filterCat === c} style={{ fontSize: 11.5, color: filterCat === c ? 'white' : colors.ink }}>
                  {c}
                </T>
              </Tap>
            ))}
          </ScrollView>

          {/* Gönderi Kartları - Sade, Ferah, Okunabilir */}
          <View style={{ gap: 11 }}>
            {filteredPosts.map(post => {
              const isLiked = !!likedPosts[post.id];
              return (
                <Card key={post.id} style={cs.postCard}>
                  {/* Başlık ve Yazar Bilgisi */}
                  <View style={cs.postHeader}>
                    <View style={cs.avatar}>
                      <T style={{ fontSize: 14 }}>👩</T>
                    </View>
                    <View style={{ flex: 1, marginLeft: 9 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <T bold style={{ fontSize: 13, color: colors.ink }}>{post.user}</T>
                        <View style={cs.weekTag}>
                          <T style={{ fontSize: 10, color: colors.purple, fontWeight: '600' }}>{post.week}</T>
                        </View>
                      </View>
                      <T style={{ fontSize: 10.5, color: colors.muted, marginTop: 1 }}>
                        {post.time} · {post.cat}
                      </T>
                    </View>
                    {post.verified && (
                      <View style={cs.verifiedBadge}>
                        <T bold style={{ fontSize: 10, color: '#2D754C' }}>✓ Moderasyon Notu</T>
                      </View>
                    )}
                  </View>

                  {/* Soru / Konu İçeriği */}
                  <Tap
                    onPress={() => open && open('communityThread', post)}
                    label={post.title}
                    style={{ marginTop: 10 }}
                  >
                    <T bold style={cs.postTitle}>{post.title}</T>
                    <T numberOfLines={2} style={cs.postDesc}>{post.desc}</T>
                  </Tap>

                  {/* Etkileşim Satırı */}
                  <View style={cs.postFooter}>
                    <Tap
                      onPress={() => toggleLike(post.id)}
                      label="Beğen"
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
                      onPress={() => open && open('communityThread', post)}
                      label="Yanıtlar"
                      style={cs.actionItem}
                    >
                      <Icon name="chat" size={16} color={colors.muted} />
                      <T style={{ fontSize: 11.5, color: colors.muted }}>{post.comments} yanıt</T>
                    </Tap>

                    <View style={{ flex: 1 }} />

                    <Tap
                      onPress={() => open && open('communityThread', post)}
                      label="Yanıtla"
                      style={{ paddingVertical: 4 }}
                    >
                      <T bold style={{ fontSize: 11.5, color: colors.purple }}>Sohbete Katıl →</T>
                    </Tap>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>
      ) : (
        /* ─── DOĞUM AYI KULÜBÜ (TEMMUZ 2026 ANNELERİ) ─────────────── */
        <BirthMonthClubScreen onOpenThread={p => open && open('communityThread', p)} />
      )}

      {/* YENİ GÖNDERİ PAYLAŞMA MODALİ */}
      <Modal visible={newPostModal} transparent animationType="slide" onRequestClose={() => setNewPostModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={cs.modalBackdrop}>
          <View style={cs.modalSheet}>
            <View style={cs.modalHandle} />
            <View style={cs.modalHead}>
              <T bold style={{ fontSize: 17, color: colors.ink }}>Topluluğa Soru Sor ✍️</T>
              <Tap onPress={() => setNewPostModal(false)} label="Kapat" style={{ padding: 6 }}>
                <Icon name="close" size={20} color={colors.muted} />
              </Tap>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 20 }}>
              <T style={{ fontSize: 12.5, color: colors.muted }}>
                Sorunu veya tecrübeni paylaş. Benzer süreçlerden geçen annelerden ve Momora kaynak notlarından destek al.
              </T>

              {/* Kategori Seçici */}
              <T bold style={{ fontSize: 12.5, marginTop: 4 }}>Konu Kategorisi:</T>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {categories.filter(c => c !== 'Tümü').map(c => (
                  <Tap
                    key={c}
                    onPress={() => setNewCat(c)}
                    label={c}
                    style={[cs.modalCatPill, newCat === c && cs.modalCatPillActive]}
                  >
                    <T bold={newCat === c} style={{ fontSize: 11, color: newCat === c ? 'white' : colors.ink }}>
                      {c}
                    </T>
                  </Tap>
                ))}
              </ScrollView>

              {/* Başlık Girişi */}
              <T bold style={{ fontSize: 12.5, marginTop: 4 }}>Soru veya Konu Başlığı:</T>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Örn: 20. hafta detaylı ultrason için önerileriniz var mı?"
                placeholderTextColor={colors.muted}
                style={cs.modalInput}
              />

              {/* Açıklama Girişi */}
              <T bold style={{ fontSize: 12.5, marginTop: 4 }}>Detaylar:</T>
              <TextInput
                value={newDesc}
                onChangeText={setNewDesc}
                placeholder="Aklına takılanları, belirtilerini veya merak ettiklerini buraya yazabilirsin..."
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
                style={[cs.modalInput, { minHeight: 90, textAlignVertical: 'top' }]}
              />

              {/* Anonim Seçeneği */}
              <Tap
                onPress={() => setIsAnon(!isAnon)}
                label="Anonim olarak paylaş"
                style={cs.anonRow}
              >
                <View style={[cs.checkbox, isAnon && cs.checkboxActive]}>
                  {isAnon && <T style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>✓</T>}
                </View>
                <T style={{ fontSize: 12.5, color: colors.ink }}>İsmimi gizle · Anonim Anne olarak yayınla</T>
              </Tap>

              {/* Paylaş Butonu */}
              <Tap
                onPress={handleCreatePost}
                label="Paylaşımı Gönder"
                style={cs.submitPostBtn}
              >
                <T bold style={{ color: 'white', fontSize: 14 }}>Paylaşımı Yayınla ✨</T>
              </Tap>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

export function BirthMonthClubScreen({ onOpenThread }) {
  const [filter, setFilter] = useState('Tümü');
  const filters = ['Tümü', 'Kontrol & Hastane', 'Belirtiler & Aşerme', 'Bebek Alışverişi', 'Dertleşme'];

  const filtered = initialCommunityPosts.filter(p => filter === 'Tümü' || p.cat === filter);

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
            <T bold style={{ color: 'white', fontSize: 17 }}>Temmuz 2026 Anneleri</T>
            <T style={{ color: '#E8D5E8', fontSize: 12, marginTop: 2 }}>
              4.280 Anne · Aynı ayda kavuşuyoruz 💕
            </T>
          </View>
        </View>
      </Card>

      {/* Konu Filtreleri */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {filters.map(f => (
          <Tap
            key={f}
            onPress={() => setFilter(f)}
            label={f}
            style={[cs.filterPill, filter === f && cs.filterPillActive]}
          >
            <T bold={filter === f} style={{ fontSize: 12, color: filter === f ? 'white' : colors.ink }}>
              {f}
            </T>
          </Tap>
        ))}
      </ScrollView>

      {/* Gönderi Kartları */}
      <View style={{ gap: 12 }}>
        {filtered.map(post => (
          <Tap
            key={post.id}
            onPress={() => onOpenThread && onOpenThread(post)}
            label={post.title}
            style={cs.postCard}
          >
            <View style={cs.postHeader}>
              <View style={cs.avatar}>
                <T style={{ fontSize: 13 }}>👩</T>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <T bold style={{ fontSize: 13 }}>{post.user}</T>
                <T style={{ fontSize: 10, color: colors.muted }}>{post.week} · {post.cat}</T>
              </View>
              {post.verified && (
                <View style={cs.verifiedBadge}>
                  <T style={{ fontSize: 10, color: colors.purple }}>Moderasyon Notu ✓</T>
                </View>
              )}
            </View>

            <T bold style={{ fontSize: 14, color: colors.ink, marginTop: 8, lineHeight: 20 }}>
              {post.title}
            </T>
            <T style={{ fontSize: 12, color: '#554A5A', marginTop: 4, lineHeight: 18 }}>
              {post.desc}
            </T>

            <View style={cs.postFooter}>
              <View style={cs.statRow}>
                <Icon name="heart" size={15} color={colors.muted} />
                <T style={{ fontSize: 12, color: colors.muted }}>{post.likes}</T>
              </View>
              <View style={cs.statRow}>
                <Icon name="chat" size={15} color={colors.muted} />
                <T style={{ fontSize: 12, color: colors.muted }}>{post.comments} yanıt</T>
              </View>
            </View>
          </Tap>
        ))}
      </View>
    </View>
  );
}

// ─── EKRAN 21: TOPLULUK TARTIŞMA & SOHBET DETAY EKRANI ───────────────────────
export function CommunityThreadScreen({ post, toast }) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
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

  function addComment() {
    if (!commentText.trim()) return;
    const newC = {
      id: uid(),
      author: 'Sen',
      role: '24. Hafta',
      isExpert: false,
      text: commentText.trim(),
      time: 'Az önce',
      helpful: 0,
    };
    setComments([...comments, newC]);
    setCommentText('');
    toast && toast('🌸 Yanıtınız topluluk sohbetine eklendi!');
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
            <T bold style={{ fontSize: 14.5, color: colors.ink }}>{p.user}</T>
            <T style={{ fontSize: 11, color: colors.muted }}>{p.week} · {p.cat} · {p.time}</T>
          </View>
          {p.verified && (
            <View style={cs.verifiedBadge}>
              <T bold style={{ fontSize: 10, color: '#2D754C' }}>✓ Moderasyon Notu</T>
            </View>
          )}
        </View>

        <T bold style={{ fontSize: 17, color: colors.ink, marginTop: 12, lineHeight: 23 }}>
          {p.title}
        </T>
        <T style={{ fontSize: 14, color: '#4E4453', marginTop: 8, lineHeight: 22 }}>
          {p.desc}
        </T>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderColor: '#F2E8F2' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Icon name="heart" size={16} color="#C75B7A" fill="#C75B7A" />
            <T bold style={{ fontSize: 12, color: '#C75B7A' }}>{p.likes} Anne beğendi</T>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Icon name="chat" size={16} color={colors.purple} />
            <T bold style={{ fontSize: 12, color: colors.purple }}>{comments.length} Katılımcı Yanıtı</T>
          </View>
        </View>
      </Card>

      <Section title={`Sohbet & Yanıtlar (${comments.length})`} />

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
                      <T bold style={{ fontSize: 9.5, color: 'white' }}>REHBER NOTU</T>
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
          placeholder="Düşünceni, tavsiyeni veya deneyimini paylaş..."
          placeholderTextColor={colors.muted}
          style={cs.replyInput}
          onSubmitEditing={addComment}
        />
        <Tap onPress={addComment} label="Gönder" style={cs.replySend}>
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
