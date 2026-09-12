import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section } from './ui';
import { generatedAssets } from './generatedAssets';

// ─── EKRAN 16: "YENEBİLİR Mİ / GÜVENLİ Mİ?" GIDA REHBERİ ────────────────────
export const foodDatabase = [
  { id: 'f1', name: 'Suşi & Çiğ Balık', cat: 'Deniz Ürünleri', status: 'avoid', badge: '🔴 Kaçınılmalı', reason: 'Çiğ deniz ürünlerinde bakteri ve parazit riski yüksektir.', alt: 'Pişmiş Somon veya Buharda Balık' },
  { id: 'f2', name: 'Ton Balığı (Konserve)', cat: 'Deniz Ürünleri', status: 'limit', badge: '🟡 Ölçülü Tüket', reason: 'Yüksek cıva içeriği nedeniyle haftada en fazla 1-2 porsiyon önerilir.', alt: 'Sardalya, Hamsi (Düşük cıvalı)' },
  { id: 'f3', name: 'Somon Balığı (İyi Pişmiş)', cat: 'Deniz Ürünleri', status: 'safe', badge: '🟢 Güvenli & Faydalı', reason: 'Omega-3 ve DHA zengini; bebeğin beyin ve göz gelişimini destekler.', alt: 'Haftada 2 porsiyon idealdir.' },
  { id: 'f4', name: 'Pastörize Edilmemiş Peynir (Rokfor, Brie)', cat: 'Süt Ürünleri', status: 'avoid', badge: '🔴 Kaçınılmalı', reason: 'Listeria bakterisi riski taşır; erken doğum veya enfeksiyon yapabilir.', alt: 'Pastörize beyaz peynir veya kaşar' },
  { id: 'f5', name: 'Yoğurt & Kefir (Pastörize)', cat: 'Süt Ürünleri', status: 'safe', badge: '🟢 Güvenli & Faydalı', reason: 'Kalsiyum ve probiyotik deposu; sindirimi ve bağışıklığı güçlendirir.', alt: 'Günde 1-2 kase tüketilebilir.' },
  { id: 'f6', name: 'Türk Kahvesi & Filtre Kahve', cat: 'İçecekler', status: 'limit', badge: '🟡 Ölçülü Tüket', reason: 'Günlük kafein miktarı 200 mg (yaklaşık 1 fincan) ile sınırlandırılmalıdır.', alt: 'Kafeinsiz kahve veya ılık süt' },
  { id: 'f7', name: 'Adaçayı & Biberiye Çayı', cat: 'Bitki Çayları', status: 'avoid', badge: '🔴 Kaçınılmalı', reason: 'Rahim kasılmalarını tetikleyebilecek bileşenler içerebilir.', alt: 'Ihlamur veya Zencefil çayı' },
  { id: 'f8', name: 'Yumurta (Tam Pişmiş / Katı)', cat: 'Temel Gıdalar', status: 'safe', badge: '🟢 Güvenli & Faydalı', reason: 'Kolin ve yüksek kaliteli protein kaynağıdır. Sarısı tamamen katı olmalıdır.', alt: 'Her sabah 1 adet haşlanmış yumurta' },
  { id: 'f9', name: 'Midye & Karides Kokteyli', cat: 'Deniz Ürünleri', status: 'avoid', badge: '🔴 Kaçınılmalı', reason: 'Kabuklu deniz canlıları toksin ve ağır metal biriktirebilir.', alt: 'İyi pişmiş ızgara levrek' },
  { id: 'f10', name: 'Kokoreç & Sakatat', cat: 'Et Ürünleri', status: 'avoid', badge: '🔴 Kaçınılmalı', reason: 'Yüksek A vitamini (retinol) ve toksin riski taşır; gebelikte tüketilmemelidir.', alt: 'İyi pişmiş ızgara tavuk veya köfte' },
  { id: 'f11', name: 'Pastırma & Sucuk (Çiğ)', cat: 'Et Ürünleri', status: 'avoid', badge: '🔴 Kaçınılmalı', reason: 'Çiğ kurutulmuş etlerde toksoplazma paraziti riski bulunur. İyice pişirilmelidir.', alt: 'Tavada tam pişmiş sucuklu yumurta' },
  { id: 'f12', name: 'Maydanoz (Aşırı Çiğ Tüketim)', cat: 'Sebze & Yeşillik', status: 'limit', badge: '🟡 Ölçülü Tüket', reason: 'Yüksek miktarda apiole içerir, rahim kasılmalarını uyarabilir. Salatalarda az miktar güvenlidir.', alt: 'Roka, marul, taze ıspanak' },
  { id: 'f13', name: 'Çiğ Köfte (Etsiz / Bulgurlu)', cat: 'Temel Gıdalar', status: 'safe', badge: '🟢 Güvenli & Faydalı', reason: 'Etsiz, hijyenik hazırlanan cevizli veya bulgurlu çiğ köfte güvenlidir.', alt: 'Bol limon ve taze marul ile' },
  { id: 'f14', name: 'Ihlamur & Zencefil Çayı', cat: 'Bitki Çayları', status: 'safe', badge: '🟢 Güvenli & Faydalı', reason: 'Mide bulantısını hafifletir ve boğazı rahatlatır; gebelikte en güvenli bitki çaylarıdır.', alt: 'Günde 1-2 fincan ılık tüketilebilir.' },
];

export function FoodSafetyChecker({ toast }) {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('Tümü');

  const filtered = foodDatabase.filter(f => {
    const matchesQuery = f.name.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr')) ||
                         f.cat.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'));
    const matchesCat = cat === 'Tümü' || f.cat === cat;
    return matchesQuery && matchesCat;
  });

  const categories = ['Tümü', 'Deniz Ürünleri', 'Et Ürünleri', 'Süt Ürünleri', 'İçecekler', 'Bitki Çayları', 'Temel Gıdalar'];

  return (
    <View style={es.container}>
      <Card style={{ padding: 14 }}>
        <T bold style={{ fontSize: 16 }}>Gebelikte Besin Güvenliği</T>
        <T style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
          "Bunu yiyebilir miyim?" diye merak ettiğiniz tüm yiyecekleri anında sorgulayın.
        </T>
      </Card>

      {/* Arama Kutusu */}
      <View style={es.searchBox}>
        <Icon name="search" size={20} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Yiyecek veya içecek ara (Örn: Suşi, Kahve)..."
          placeholderTextColor={colors.muted}
          style={es.searchInput}
        />
        {query ? (
          <Tap onPress={() => setQuery('')} label="Temizle">
            <Icon name="close" size={16} color={colors.muted} />
          </Tap>
        ) : null}
      </View>

      {/* Kategori Filtreleri */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {categories.map(c => (
          <Tap
            key={c}
            onPress={() => setCat(c)}
            label={c}
            style={[es.catPill, cat === c && es.catPillActive]}
          >
            <T bold={cat === c} style={{ fontSize: 12, color: cat === c ? 'white' : colors.ink }}>
              {c}
            </T>
          </Tap>
        ))}
      </ScrollView>

      {/* Sonuç Kartları */}
      <View style={{ gap: 10 }}>
        {filtered.map(food => {
          const isAvoid = food.status === 'avoid';
          const isLimit = food.status === 'limit';
          const badgeBg = isAvoid ? '#FDE8EC' : isLimit ? '#FEF6E8' : '#EAF4EF';
          const badgeColor = isAvoid ? '#B83852' : isLimit ? '#B87828' : '#2D754C';

          return (
            <Card key={food.id} style={es.foodCard}>
              <View style={es.foodCardTop}>
                <T bold style={{ fontSize: 16, color: colors.ink }}>{food.name}</T>
                <View style={[es.statusPill, { backgroundColor: badgeBg }]}>
                  <T bold style={{ fontSize: 11, color: badgeColor }}>{food.badge}</T>
                </View>
              </View>

              <T style={{ fontSize: 13, color: '#4E4856', marginTop: 6, lineHeight: 19 }}>
                {food.reason}
              </T>

              <View style={es.altBox}>
                <T bold style={{ fontSize: 11, color: colors.purple }}>ÖNERİLEN ALTERNATİF:</T>
                <T style={{ fontSize: 12, color: colors.ink, marginTop: 2 }}>{food.alt}</T>
              </View>
            </Card>
          );
        })}
      </View>
    </View>
  );
}

// ─── EKRAN 14: KONU KOLEKSİYONLARI, BLOG MAGAZİN & SSS KÜTÜPHANESİ ─────────
import { articles, pregnancyFaqs, faqCategories, searchFaqs, getFaqsByCategory, searchArticles } from './content';

export const topicCollections = [
  { id: 'pregnancy', title: 'Gebelikte Hafta Hafta Gelişim & Testler', count: 4, art: 'blog_ultrasound_memory', color: '#F4EEF6' },
  { id: 'nutrition', title: 'Gebelikte Beslenme & Güvenli Gıdalar', count: 3, art: 'blog_healthy_breakfast', color: '#F4F7F2' },
  { id: 'wellbeing', title: 'Trimester Egzersizleri & Doğum Yogası', count: 2, art: 'blog_yoga_stretch', color: '#FAF1F5' },
  { id: 'birth', title: 'Doğum Planı, Çanta & Hastane Rehberi', count: 3, art: 'blog_hospital_bag_pack', color: '#FAF4EF' },
  { id: 'baby', title: 'Yenidoğan Bakımı, Masaj & İlk Günler', count: 8, art: 'blog_newborn_hand', color: '#EEF4F7' },
  { id: 'postpartum', title: 'Lohusalık, İyileşme & Kendine Şefkat', count: 2, art: 'blog_postpartum_selfcare', color: '#F7EFF7' },
  { id: 'partner', title: 'Eş & Baba Olmak: İlk Günlerde Destek', count: 2, art: 'blog_father_baby_bond', color: '#F0F5FA' },
];

export function TopicHubScreen({ openArticle, openFoodChecker }) {
  const [hubTab, setHubTab] = useState('articles'); // 'articles' | 'topics' | 'faq'
  const [articleQuery, setArticleQuery] = useState('');
  const [articleTopic, setArticleTopic] = useState('Tümü');
  const [faqQuery, setFaqQuery] = useState('');
  const [faqCat, setFaqCat] = useState('Tümü');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const topicFilters = ['Tümü', 'pregnancy', 'nutrition', 'wellbeing', 'birth', 'baby', 'postpartum', 'partner'];
  const topicLabels = {
    'Tümü': 'Tümü',
    'pregnancy': 'Gelişim & Tıp',
    'nutrition': 'Beslenme',
    'wellbeing': 'İyi Hisset & Uyku',
    'birth': 'Doğum',
    'baby': 'Bebek Bakımı',
    'postpartum': 'Lohusalık',
    'partner': 'Eş & Baba'
  };

  const filteredArticles = articles.filter(a => {
    const matchesSearch = !articleQuery || 
      a.title.toLocaleLowerCase('tr').includes(articleQuery.toLocaleLowerCase('tr')) ||
      a.subtitle.toLocaleLowerCase('tr').includes(articleQuery.toLocaleLowerCase('tr'));
    const matchesTopic = articleTopic === 'Tümü' || a.topic === articleTopic;
    return matchesSearch && matchesTopic;
  });

  const displayedFaqs = faqQuery
    ? searchFaqs(faqQuery).filter(f => faqCat === 'Tümü' || f.category === faqCat)
    : getFaqsByCategory(faqCat);

  return (
    <View style={es.container}>
      {/* Hızlı Gıda Güvenliği Banner'ı */}
      <Tap
        onPress={openFoodChecker}
        label="Gıda güvenliği sorgula"
        style={es.foodBanner}
      >
        <LinearGradient
          colors={['#729584', '#557565']}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ flex: 1 }}>
          <T style={{ color: '#D4E8DC', fontSize: 11, letterSpacing: 1 }}>HIZLI KONTROL</T>
          <T bold style={{ color: 'white', fontSize: 16, marginTop: 2 }}>“Bunu yiyebilir miyim?”</T>
          <T style={{ color: '#EAF3ED', fontSize: 12, marginTop: 4 }}>
            Suşi, bitki çayı, peynir ve kahve rehberini aç →
          </T>
        </View>
        <View style={es.foodBannerIcon}>
          <Icon name="bowl" size={26} color="white" />
        </View>
      </Tap>

      {/* Hub Sekmeleri: Tüm Yazılar / Koleksiyonlar / SSS */}
      <View style={es.hubTabRow}>
        <Tap
          onPress={() => setHubTab('articles')}
          label="Tüm Yazılar"
          style={[es.hubTabBtn, hubTab === 'articles' && es.hubTabBtnActive]}
        >
          <T bold={hubTab === 'articles'} style={[es.hubTabText, hubTab === 'articles' && { color: 'white' }]}>
            📖 Yazılar ({articles.length})
          </T>
        </Tap>
        <Tap
          onPress={() => setHubTab('topics')}
          label="Koleksiyonlar"
          style={[es.hubTabBtn, hubTab === 'topics' && es.hubTabBtnActive]}
        >
          <T bold={hubTab === 'topics'} style={[es.hubTabText, hubTab === 'topics' && { color: 'white' }]}>
            📚 Koleksiyonlar
          </T>
        </Tap>
        <Tap
          onPress={() => setHubTab('faq')}
          label="Sıkça Sorulan Sorular"
          style={[es.hubTabBtn, hubTab === 'faq' && es.hubTabBtnActive]}
        >
          <T bold={hubTab === 'faq'} style={[es.hubTabText, hubTab === 'faq' && { color: 'white' }]}>
            ❓ SSS ({pregnancyFaqs.length})
          </T>
        </Tap>
      </View>

      {hubTab === 'articles' ? (
        /* Tüm Makaleler Listesi */
        <View style={{ gap: 12 }}>
          <View style={es.searchBox}>
            <Icon name="search" size={20} color={colors.muted} />
            <TextInput
              value={articleQuery}
              onChangeText={setArticleQuery}
              placeholder="Konu, belirti veya makale ara..."
              placeholderTextColor={colors.muted}
              style={es.searchInput}
            />
            {articleQuery ? (
              <Tap onPress={() => setArticleQuery('')} label="Temizle">
                <Icon name="close" size={16} color={colors.muted} />
              </Tap>
            ) : null}
          </View>

          {/* Konu Filtreleri */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {topicFilters.map(t => (
              <Tap
                key={t}
                onPress={() => setArticleTopic(t)}
                label={topicLabels[t]}
                style={[es.catPill, articleTopic === t && es.catPillActive]}
              >
                <T bold={articleTopic === t} style={{ fontSize: 11, color: articleTopic === t ? 'white' : colors.ink }}>
                  {topicLabels[t]}
                </T>
              </Tap>
            ))}
          </ScrollView>

          {/* Makale Kartları */}
          <View style={{ gap: 12 }}>
            {filteredArticles.map(a => {
              const imgAsset = generatedAssets[a.image];
              return (
                <Tap
                  key={a.id}
                  onPress={() => openArticle && openArticle(a)}
                  label={a.title}
                  style={es.blogPostCard}
                >
                  {imgAsset && (
                    <View style={es.blogPostImgBox}>
                      <Image source={imgAsset} style={StyleSheet.absoluteFill} resizeMode="cover" />
                      <View style={es.blogPostTimeTag}>
                        <T style={{ fontSize: 10, color: 'white' }}>⏱️ {a.minutes} dk</T>
                      </View>
                    </View>
                  )}
                  <View style={{ padding: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={es.blogPostCategoryTag}>
                        <T style={{ fontSize: 10, color: colors.purple }}>{a.categoryName || topicLabels[a.topic] || 'Rehber'}</T>
                      </View>
                      {a.weeks && (
                        <T style={{ fontSize: 10, color: colors.muted }}>• Hafta {a.weeks[0]}-{a.weeks[1]}</T>
                      )}
                    </View>

                    <T bold style={es.blogPostTitle}>{a.title}</T>
                    <T numberOfLines={2} style={es.blogPostSub}>{a.subtitle}</T>

                    {a.doctor && (
                      <View style={es.blogPostDocRow}>
                        <T style={{ fontSize: 13 }}>👩‍⚕️</T>
                        <T numberOfLines={1} style={{ fontSize: 11, color: colors.purple, flex: 1 }}>{a.doctor}</T>
                        <Icon name="chevron" size={16} color={colors.purple} />
                      </View>
                    )}
                  </View>
                </Tap>
              );
            })}
          </View>
        </View>
      ) : hubTab === 'topics' ? (
        /* Tematik Koleksiyonlar */
        <View style={{ gap: 12 }}>
          <Section title="Tematik Koleksiyonlar" />
          {topicCollections.map(col => (
            <Tap
              key={col.id}
              onPress={() => {
                const match = articles.find(a => a.topic === col.id) || articles[0];
                openArticle && openArticle(match);
              }}
              label={col.title}
              style={[es.collectionCard, { backgroundColor: col.color }]}
            >
              {generatedAssets[col.art] && (
                <Image source={generatedAssets[col.art]} style={es.colImg} resizeMode="cover" />
              )}
              <View style={es.colInfo}>
                <T bold style={{ fontSize: 15, color: colors.ink, lineHeight: 21 }}>{col.title}</T>
                <T style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>{col.count} uzman rehberi</T>
              </View>
              <Icon name="chevron" size={18} color={colors.purple} />
            </Tap>
          ))}
        </View>
      ) : (
        /* Sıkça Sorulan Sorular (SSS) */
        <View style={{ gap: 12 }}>
          <View style={es.searchBox}>
            <Icon name="search" size={20} color={colors.muted} />
            <TextInput
              value={faqQuery}
              onChangeText={setFaqQuery}
              placeholder="Soru veya konu ara (Örn: bulantı, kordon, dikiş)..."
              placeholderTextColor={colors.muted}
              style={es.searchInput}
            />
            {faqQuery ? (
              <Tap onPress={() => setFaqQuery('')} label="Temizle">
                <Icon name="close" size={16} color={colors.muted} />
              </Tap>
            ) : null}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {faqCategories.map(c => (
              <Tap
                key={c}
                onPress={() => setFaqCat(c)}
                label={c}
                style={[es.catPill, faqCat === c && es.catPillActive]}
              >
                <T bold={faqCat === c} style={{ fontSize: 11, color: faqCat === c ? 'white' : colors.ink }}>
                  {c}
                </T>
              </Tap>
            ))}
          </ScrollView>

          <View style={{ gap: 10 }}>
            {displayedFaqs.map(faq => {
              const isOpen = expandedFaq === faq.id;
              return (
                <Card key={faq.id} style={{ padding: 14 }}>
                  <Tap
                    onPress={() => setExpandedFaq(isOpen ? null : faq.id)}
                    label={faq.q}
                    style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}
                  >
                    <View style={es.faqIcon}>
                      <T style={{ fontSize: 14 }}>{isOpen ? '💬' : '❓'}</T>
                    </View>
                    <View style={{ flex: 1 }}>
                      <T bold style={{ fontSize: 14, color: colors.ink, lineHeight: 20 }}>
                        {faq.q}
                      </T>
                      <T style={{ fontSize: 10, color: colors.purple, marginTop: 4 }}>
                        {faq.category}
                      </T>
                    </View>
                    <Icon name={isOpen ? 'close' : 'chevron'} size={18} color={colors.purple} />
                  </Tap>

                  {isOpen && (
                    <View style={es.faqAnswerBox}>
                      <T style={es.faqAnswerText}>
                        {faq.a}
                      </T>
                      <View style={es.faqTagsRow}>
                        {faq.tags.map(t => (
                          <View key={t} style={es.faqTag}>
                            <T style={{ fontSize: 10, color: '#77587B' }}>#{t}</T>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── EKRAN 15: MAKALE DETAY EKRANI (SESLİ DİNLEME, GÖRSELLER & KLİNİK İPUÇLARI) ───
export function EditorialArticleScreen({ article, toast }) {
  const [playingAudio, setPlayingAudio] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const defaultArticle = articles[0] || {
    title: '1. Trimester Sabah Bulantıları ve Yorgunlukla Başa Çıkma',
    doctor: 'Uzm. Dr. Elif Kaya · Kadın Hastalıkları ve Doğum Uzmanı',
    time: '4 dk okuma',
    minutes: 4,
    audioDuration: '3:45',
    image: 'blog_pregnant_morning',
    keyPoints: [
      'Sabah yataktan kalkmadan önce tuzlu kraker atıştırmak mide asidini nötralize eder.',
      'Bebek bu haftalarda annenin depolarından beslendiği için kilo kaybı bebeğe zarar vermez.',
      'Günde 2000 ml sıvıyı yudum yudum ve yemek aralarında tüketmek bulantıyı azaltır.'
    ],
    sections: [
      {
        title: 'Neden Sabahları Daha Şiddetli?',
        text: 'Gebelikte hızla yükselen hCG ve östrojen hormonları sindirim sistemini yavaşlatır. Gece boyunca boş kalan mide asidi sabahları yoğun bulantıya neden olur.',
        tip: '💡 Baş ucunuzda tuzlu galeta veya leblebi bulundurun.'
      }
    ]
  };

  const a = article || defaultArticle;
  const coverAsset = (a.image && generatedAssets[a.image]) || generatedAssets['blog_sleeping_crib'];
  const readingTime = a.time || (a.minutes ? `${a.minutes} dk okuma` : '4 dk okuma');
  const doctorName = a.doctor || 'Dr. Zeynep Aydın · Kadın Hastalıkları ve Doğum Uzmanı';
  const relatedArticles = articles.filter(other => other.id !== a.id && other.topic === a.topic).slice(0, 3);

  return (
    <View style={es.container}>
      {/* Kapak Görseli */}
      <View style={es.articleCoverBox}>
        {coverAsset ? (
          <Image source={coverAsset} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <LinearGradient colors={['#9A779A', '#664566']} style={StyleSheet.absoluteFill} />
        )}
        <LinearGradient colors={['transparent', '#1B141CEE']} style={StyleSheet.absoluteFill} />
        <View style={es.coverMeta}>
          <View style={es.readingTimePill}>
            <T style={{ fontSize: 11, color: 'white' }}>⏱️ {readingTime}</T>
          </View>
          <T bold style={es.articleTitle}>{a.title}</T>
        </View>
      </View>

      {/* Doktor Onay Rozeti & Kaydet Butonu */}
      <Card style={es.doctorCard}>
        <View style={es.docAvatar}>
          <T style={{ fontSize: 20 }}>👩‍⚕️</T>
        </View>
        <View style={{ flex: 1 }}>
          <T bold style={{ fontSize: 13, color: colors.ink }}>Medikal Olarak Doğrulanmıştır</T>
          <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{doctorName}</T>
        </View>
        <Tap
          onPress={() => {
            setBookmarked(!bookmarked);
            toast && toast(bookmarked ? 'Yer imlerinden kaldırıldı' : 'Makale kaydedildi 🔖');
          }}
          label="Kaydet"
          style={es.bookmarkBtn}
        >
          <Icon name="book" size={20} color={bookmarked ? colors.purple : colors.muted} />
        </Tap>
      </Card>

      {/* Sesli Dinleme (Podcast Player) Barı */}
      <Card style={es.audioBar}>
        <Tap
          onPress={() => setPlayingAudio(!playingAudio)}
          label="Sesli dinle"
          style={es.audioPlayBtn}
        >
          <T style={{ fontSize: 14 }}>{playingAudio ? '⏸️' : '▶️'}</T>
        </Tap>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <T bold style={{ fontSize: 13, color: colors.ink }}>Sesli Dinle (Momora Audio)</T>
          <T style={{ fontSize: 11, color: colors.muted }}>
            {playingAudio ? 'Yazı seslendiriliyor...' : `${a.audioDuration || '3:45'} · Sakinleştirici ses`}
          </T>
        </View>
        <Tap
          onPress={() => toast && toast('Makale bağlantısı kopyalandı 🔗')}
          label="Paylaş"
          style={{ padding: 6 }}
        >
          <Icon name="heart" size={18} color={colors.purple} />
        </Tap>
      </Card>

      {/* Özetle: Önemli Noktalar Kutusu */}
      {a.keyPoints && a.keyPoints.length > 0 && (
        <Card style={es.keyPointsCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <T style={{ fontSize: 16 }}>✨</T>
            <T bold style={{ fontSize: 13, color: colors.purple }}>Özetle: 3 Önemli Nokta</T>
          </View>
          {a.keyPoints.map((kp, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 4 }}>
              <T style={{ color: colors.purple, fontSize: 14 }}>•</T>
              <T style={{ fontSize: 13, color: colors.ink, lineHeight: 19, flex: 1 }}>{kp}</T>
            </View>
          ))}
        </Card>
      )}

      {/* Makale Bölümleri & Satır İçi Görseller */}
      <View style={{ gap: 14 }}>
        {a.sections ? (
          a.sections.map((sec, idx) => {
            const inlineAsset = sec.image && generatedAssets[sec.image];
            return (
              <Card key={idx} style={{ padding: 16 }}>
                <T bold style={{ fontSize: 16, color: colors.ink, marginBottom: 8, lineHeight: 22 }}>
                  {sec.title}
                </T>

                {/* Satır İçi İllüstrasyon / Fotoğraf */}
                {inlineAsset && (
                  <View style={es.inlineImageBox}>
                    <Image source={inlineAsset} style={StyleSheet.absoluteFill} resizeMode="contain" />
                  </View>
                )}

                <T style={es.articleP}>
                  {sec.text}
                </T>

                {/* Klinik İpucu Kutusu */}
                {sec.tip && (
                  <View style={es.clinicTipBox}>
                    <T style={es.clinicTipText}>{sec.tip}</T>
                  </View>
                )}
              </Card>
            );
          })
        ) : a.paragraphs ? (
          a.paragraphs.map((p, idx) => (
            <Card key={idx} style={{ padding: 14 }}>
              <T style={es.articleP}>{p}</T>
            </Card>
          ))
        ) : null}
      </View>

      {/* Benzer Rehberler */}
      {relatedArticles.length > 0 && (
        <View style={{ marginTop: 12, gap: 10 }}>
          <Section title="Benzer Rehberler" />
          {relatedArticles.map(rel => (
            <Tap
              key={rel.id}
              onPress={() => toast && toast(`"${rel.title}" açılıyor...`)}
              label={rel.title}
              style={es.relatedCard}
            >
              {generatedAssets[rel.image] && (
                <Image source={generatedAssets[rel.image]} style={es.relatedImg} resizeMode="cover" />
              )}
              <View style={{ flex: 1 }}>
                <T bold numberOfLines={1} style={{ fontSize: 13, color: colors.ink }}>{rel.title}</T>
                <T style={{ fontSize: 11, color: colors.muted, marginTop: 3 }}>⏱️ {rel.minutes} dk okuma</T>
              </View>
              <Icon name="chevron" size={16} color={colors.purple} />
            </Tap>
          ))}
        </View>
      )}
    </View>
  );
}

const es = StyleSheet.create({
  container: { gap: 14, paddingBottom: 24 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFDFA', borderWidth: 1, borderColor: '#DED3DB', borderRadius: 18, paddingHorizontal: 14, height: 46, ...shadow },
  searchInput: { flex: 1, fontSize: 13, color: colors.ink },
  catPill: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#EFEAEF' },
  catPillActive: { backgroundColor: colors.purple },
  foodCard: { padding: 14 },
  foodCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  altBox: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: colors.line },
  // Hub styles
  foodBanner: { height: 95, borderRadius: 20, overflow: 'hidden', padding: 16, flexDirection: 'row', alignItems: 'center', ...shadow },
  foodBannerIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF33', alignItems: 'center', justifyContent: 'center' },
  collectionCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 18, borderWidth: 1, borderColor: '#EBE1EA', ...shadow },
  colImg: { width: 68, height: 68, borderRadius: 14, marginRight: 12 },
  colInfo: { flex: 1 },
  // Hub Tabs
  hubTabRow: { flexDirection: 'row', backgroundColor: '#EDE4F2', borderRadius: 16, padding: 3, gap: 4 },
  hubTabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  hubTabBtnActive: { backgroundColor: colors.purple },
  hubTabText: { fontSize: 11, color: '#795B82' },
  // Blog Post Card styles
  blogPostCard: { backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#ECE2EC', ...shadow },
  blogPostImgBox: { height: 145, backgroundColor: '#F0EAF1', position: 'relative' },
  blogPostTimeTag: { position: 'absolute', top: 12, right: 12, backgroundColor: '#00000077', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  blogPostCategoryTag: { backgroundColor: '#F4EDF6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  blogPostTitle: { fontSize: 16, color: colors.ink, marginTop: 8, lineHeight: 22 },
  blogPostSub: { fontSize: 12, color: '#635B69', marginTop: 4, lineHeight: 18 },
  blogPostDocRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderColor: '#F5EDF6' },
  // FAQ styles
  faqIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0E5F3', alignItems: 'center', justifyContent: 'center' },
  faqAnswerBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#EDE2EE' },
  faqAnswerText: { fontSize: 13, lineHeight: 21, color: '#483E4C' },
  faqTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  faqTag: { backgroundColor: '#F5EDF7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  // Editorial styles
  articleCoverBox: { height: 220, borderRadius: 22, overflow: 'hidden', justifyContent: 'flex-end', padding: 16, ...shadow },
  coverMeta: { gap: 8 },
  readingTimePill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#00000066' },
  articleTitle: { fontSize: 20, color: 'white', lineHeight: 26 },
  doctorCard: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  docAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EFE7EE', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  bookmarkBtn: { padding: 8 },
  audioBar: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#FAF6FA' },
  audioPlayBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
  keyPointsCard: { backgroundColor: '#F7F3FA', padding: 14, borderRadius: 18, borderWidth: 1, borderColor: '#EBE0F0' },
  inlineImageBox: { height: 150, borderRadius: 14, overflow: 'hidden', backgroundColor: '#F8F4F9', marginVertical: 10, alignItems: 'center', justifyContent: 'center' },
  articleP: { fontSize: 14, lineHeight: 23, color: '#3E3744' },
  clinicTipBox: { backgroundColor: '#FAF2F8', padding: 12, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: '#EEDEEA' },
  clinicTipText: { fontSize: 12, color: '#68406E', lineHeight: 18 },
  relatedCard: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#EAE1EB', gap: 10 },
  relatedImg: { width: 46, height: 46, borderRadius: 10 },
});
