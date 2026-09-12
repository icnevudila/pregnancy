import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section, ScreenHero } from './ui';
import { generatedAssets, getAsset } from './generatedAssets';
import { articles, pregnancyFaqs, faqCategories, searchFaqs, getFaqsByCategory, searchArticles } from './content';
import { playSound, stopSound } from './soundEngine';

// ─── EKRAN 16: "YENEBİLİR Mİ / GÜVENLİ Mİ?" GIDA REHBERİ ────────────────────
export const foodDatabase = [
  { id: 'f1', name: 'Suşi & Çiğ Balık', cat: 'Deniz Ürünleri', status: 'avoid', badge: '🔴 Kaçınılmalı', reason: 'Çiğ deniz ürünlerinde bakteri ve parazit riski yüksektir.', alt: 'Pişmiş Somon veya Buharda Balık' },
  { id: 'f2', name: 'Konserve Ton Balığı', cat: 'Deniz Ürünleri', status: 'limit', badge: '🟡 Ölçülü Tüket', reason: 'Yüksek cıva içeriği nedeniyle haftada en fazla 1-2 porsiyon önerilir.', alt: 'Sardalya, Hamsi (Düşük cıvalı)' },
  { id: 'f3', name: 'Pişmiş Somon Balığı', cat: 'Deniz Ürünleri', status: 'safe', badge: '🟢 Güvenli & Faydalı', reason: 'Omega-3 ve DHA zengini; bebeğin beyin ve göz gelişimini destekler.', alt: 'Haftada 1-2 porsiyon tercih edilebilir.' },
  { id: 'f4', name: 'Pastörize Edilmemiş Peynir · Rokfor, Brie', cat: 'Süt Ürünleri', status: 'avoid', badge: '🔴 Kaçınılmalı', reason: 'Listeria bakterisi riski taşır; erken doğum veya enfeksiyon yapabilir.', alt: 'Pastörize beyaz peynir veya kaşar' },
  { id: 'f5', name: 'Pastörize Yoğurt & Kefir', cat: 'Süt Ürünleri', status: 'safe', badge: '🟢 Güvenli & Faydalı', reason: 'Kalsiyum ve probiyotik deposu; sindirimi ve bağışıklığı güçlendirir.', alt: 'Günde 1-2 kase tüketilebilir.' },
  { id: 'f6', name: 'Türk Kahvesi & Filtre Kahve', cat: 'İçecekler', status: 'limit', badge: '🟡 Ölçülü Tüket', reason: 'Günlük kafein miktarı 200 mg (yaklaşık 1 fincan) ile sınırlandırılmalıdır.', alt: 'Kafeinsiz kahve veya ılık süt' },
  { id: 'f7', name: 'Adaçayı & Biberiye Çayı', cat: 'Bitki Çayları', status: 'avoid', badge: '🔴 Kaçınılmalı', reason: 'Rahim kasılmalarını tetikleyebilecek bileşenler içerebilir.', alt: 'Ihlamur veya Zencefil çayı' },
  { id: 'f8', name: 'Tam Pişmiş Katı Yumurta', cat: 'Temel Gıdalar', status: 'safe', badge: '🟢 Güvenli & Faydalı', reason: 'Kolin ve yüksek kaliteli protein kaynağıdır. Sarısı tamamen katı olmalıdır.', alt: 'Her sabah 1 adet haşlanmış yumurta' },
  { id: 'f9', name: 'Midye & Karides Kokteyli', cat: 'Deniz Ürünleri', status: 'avoid', badge: '🔴 Kaçınılmalı', reason: 'Kabuklu deniz canlıları toksin ve ağır metal biriktirebilir.', alt: 'İyi pişmiş ızgara levrek' },
  { id: 'f10', name: 'Kokoreç & Sakatat', cat: 'Et Ürünleri', status: 'avoid', badge: '🔴 Kaçınılmalı', reason: 'Yüksek A vitamini (retinol) ve toksin riski taşır; gebelikte tüketilmemelidir.', alt: 'İyi pişmiş ızgara tavuk veya köfte' },
  { id: 'f11', name: 'Çiğ Pastırma & Sucuk', cat: 'Et Ürünleri', status: 'avoid', badge: '🔴 Kaçınılmalı', reason: 'Çiğ kurutulmuş etlerde toksoplazma paraziti riski bulunur. İyice pişirilmelidir.', alt: 'Tavada tam pişmiş sucuklu yumurta' },
  { id: 'f12', name: 'Aşırı Çiğ Maydanoz Tüketimi', cat: 'Sebze & Yeşillik', status: 'limit', badge: '🟡 Ölçülü Tüket', reason: 'Yüksek miktarda apiole içerir, rahim kasılmalarını uyarabilir. Salatalarda az miktar güvenlidir.', alt: 'Roka, marul, taze ıspanak' },
  { id: 'f13', name: 'Etsiz Bulgurlu Çiğ Köfte', cat: 'Temel Gıdalar', status: 'safe', badge: '🟢 Güvenli & Faydalı', reason: 'Etsiz, hijyenik hazırlanan cevizli veya bulgurlu çiğ köfte güvenlidir.', alt: 'Bol limon ve taze marul ile' },
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
      <ScreenHero kicker="BESİN GÜVENLİĞİ" title="Yenebilir mi?" body="Merak ettiğin gıdaları sade risk notları ve daha güvenli alternatiflerle incele." icon="bowl" asset="prod_baby_food" stat={`${filtered.length} sonuç`} tint="#4F8464" />

      {/* Arama Kutusu */}
      <View style={es.searchBox}>
        <Icon name="search" size={20} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Gıda veya içecek ara: Suşi, Kahve, Peynir..."
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
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
      <View style={{ gap: 11 }}>
        {filtered.map(food => {
          const isAvoid = food.status === 'avoid';
          const isLimit = food.status === 'limit';
          const badgeBg = isAvoid ? '#FDE8EC' : isLimit ? '#FEF6E8' : '#EAF4EF';
          const badgeColor = isAvoid ? '#B83852' : isLimit ? '#B87828' : '#2D754C';

          return (
            <Card key={food.id} style={es.foodCard}>
              <View style={es.foodCardTop}>
                <T bold style={{ fontSize: 16, color: colors.ink }}>{food.name}</T>
                <View style={[es.statusPill, { backgroundColor: badgeBg, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
                  {isAvoid && generatedAssets['ui_food_avoid_shield'] ? (
                    <Image source={generatedAssets['ui_food_avoid_shield']} style={{ width: 14, height: 14 }} resizeMode="contain" />
                  ) : isLimit && generatedAssets['ui_food_moderate_shield'] ? (
                    <Image source={generatedAssets['ui_food_moderate_shield']} style={{ width: 14, height: 14 }} resizeMode="contain" />
                  ) : generatedAssets['ui_food_safe_shield'] ? (
                    <Image source={generatedAssets['ui_food_safe_shield']} style={{ width: 14, height: 14 }} resizeMode="contain" />
                  ) : null}
                  <T bold style={{ fontSize: 11, color: badgeColor }}>{food.badge.replace(/^[🔴🟡🟢]\s*/, '')}</T>
                </View>
              </View>

              <T style={{ fontSize: 13, color: '#4E4856', marginTop: 8, lineHeight: 20 }}>
                {food.reason}
              </T>

              <View style={es.altBox}>
                <T bold style={{ fontSize: 11, color: colors.purple, letterSpacing: 0.5 }}>DAHA GÜVENLİ ALTERNATİF:</T>
                <T style={{ fontSize: 13, color: colors.ink, marginTop: 3 }}>{food.alt}</T>
              </View>
            </Card>
          );
        })}
      </View>
    </View>
  );
}

// ─── EKRAN 14: KONU KOLEKSİYONLARI, BLOG MAGAZİN & SSS KÜTÜPHANESİ ─────────
export const topicCollections = [
  { id: 'pregnancy', title: 'Gebelikte Hafta Hafta Gelişim & Testler', count: 4, art: 'blog_ultrasound_memory', color: '#F4EEF6' },
  { id: 'nutrition', title: 'Gebelikte Beslenme & Güvenli Gıdalar', count: 3, art: 'blog_healthy_breakfast', color: '#F4F7F2' },
  { id: 'wellbeing', title: 'Trimester Egzersizleri & Doğum Yogası', count: 2, art: 'blog_yoga_stretch', color: '#FAF1F5' },
  { id: 'birth', title: 'Doğum Planı, Çanta & Hastane Rehberi', count: 3, art: 'blog_hospital_bag_pack', color: '#FAF4EF' },
  { id: 'baby', title: 'Yenidoğan Bakımı, Masaj & İlk Günler', count: 8, art: 'blog_newborn_hand', color: '#EEF4F7' },
  { id: 'postpartum', title: 'Lohusalık, İyileşme & Kendine Şefkat', count: 2, art: 'blog_postpartum_selfcare', color: '#F7EFF7' },
  { id: 'partner', title: 'Eş & Baba Olmak: İlk Günlerde Destek', count: 2, art: 'blog_father_baby_bond', color: '#F0F5FA' },
];

export function TopicHubScreen({ openArticle, openFoodChecker, initialTab = 'articles' }) {
  const [hubTab, setHubTab] = useState(initialTab); // 'articles' | 'food' | 'topics'
  const [articleQuery, setArticleQuery] = useState('');
  const [articleFilter, setArticleFilter] = useState('Tümü');

  const topicFilters = [
    'Tümü',
    '1. Trimester',
    '2. Trimester',
    '3. Trimester',
    'Beslenme',
    'Gelişim & Kontrol',
    'Doğuma Hazırlık',
    'Bebek & Yenidoğan',
    'Lohusalık & İyileşme',
    'İyi Hisset & Ruh',
    'Eş & Baba'
  ];

  const filteredArticles = articles.filter(a => {
    const q = articleQuery.toLocaleLowerCase('tr');
    const matchesSearch = !q || 
      a.title.toLocaleLowerCase('tr').includes(q) ||
      a.subtitle.toLocaleLowerCase('tr').includes(q) ||
      (a.categoryName && a.categoryName.toLocaleLowerCase('tr').includes(q)) ||
      (a.doctor && a.doctor.toLocaleLowerCase('tr').includes(q));

    let matchesFilter = true;
    if (articleFilter === '1. Trimester') {
      matchesFilter = a.categoryName === '1. Trimester' || (a.weeks && a.weeks[0] <= 12);
    } else if (articleFilter === '2. Trimester') {
      matchesFilter = a.categoryName === '2. Trimester' || (a.weeks && a.weeks[0] >= 13 && a.weeks[0] <= 27);
    } else if (articleFilter === '3. Trimester') {
      matchesFilter = a.categoryName === '3. Trimester' || (a.weeks && a.weeks[0] >= 28);
    } else if (articleFilter === 'Beslenme') {
      matchesFilter = a.topic === 'nutrition' || (a.categoryName && a.categoryName.includes('Beslenme'));
    } else if (articleFilter === 'Gelişim & Kontrol') {
      matchesFilter = a.topic === 'pregnancy' || (a.categoryName && (a.categoryName.includes('Gelişim') || a.categoryName.includes('Ultrason') || a.categoryName.includes('Kontrol')));
    } else if (articleFilter === 'Doğuma Hazırlık') {
      matchesFilter = a.topic === 'birth' || (a.categoryName && (a.categoryName.includes('Doğum') || a.categoryName.includes('Hastane')));
    } else if (articleFilter === 'Bebek & Yenidoğan') {
      matchesFilter = a.topic === 'baby' || (a.categoryName && (a.categoryName.includes('Bebek') || a.categoryName.includes('Yenidoğan') || a.categoryName.includes('Emzirme')));
    } else if (articleFilter === 'Lohusalık & İyileşme') {
      matchesFilter = a.topic === 'postpartum' || (a.categoryName && a.categoryName.includes('Lohusa'));
    } else if (articleFilter === 'İyi Hisset & Ruh') {
      matchesFilter = a.topic === 'wellbeing' || (a.categoryName && a.categoryName.includes('Hisset'));
    } else if (articleFilter === 'Eş & Baba') {
      matchesFilter = a.topic === 'partner' || (a.categoryName && a.categoryName.includes('Baba'));
    }

    return matchesSearch && matchesFilter;
  });

  const featuredArticle = articles[0];

  return (
    <View style={es.container}>
      
      {/* Hub Üst Sekmeleri (Luxury Editorial Navigation - 3 Ana Alan) */}
      <View style={es.hubTabRow}>
        <Tap
          onPress={() => setHubTab('articles')}
          label="Yazılar ve Magazin"
          style={[es.hubTabBtn, hubTab === 'articles' && es.hubTabBtnActive]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="book" size={14} color={hubTab === 'articles' ? 'white' : colors.purple} />
            <T bold={hubTab === 'articles'} style={[es.hubTabText, hubTab === 'articles' && { color: 'white' }]}>
              Magazin
            </T>
          </View>
        </Tap>
        <Tap
          onPress={() => setHubTab('food')}
          label="Besin Güvenliği"
          style={[es.hubTabBtn, hubTab === 'food' && es.hubTabBtnActive]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="leaf" size={14} color={hubTab === 'food' ? 'white' : colors.purple} />
            <T bold={hubTab === 'food'} style={[es.hubTabText, hubTab === 'food' && { color: 'white' }]}>
              Besin Güvenliği
            </T>
          </View>
        </Tap>
        <Tap
          onPress={() => setHubTab('infographics')}
          label="İnfografikler"
          style={[es.hubTabBtn, hubTab === 'infographics' && es.hubTabBtnActive]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="sparkle" size={14} color={hubTab === 'infographics' ? 'white' : colors.purple} />
            <T bold={hubTab === 'infographics'} style={[es.hubTabText, hubTab === 'infographics' && { color: 'white' }]}>
              İnfografikler
            </T>
          </View>
        </Tap>
        <Tap
          onPress={() => setHubTab('topics')}
          label="Koleksiyonlar"
          style={[es.hubTabBtn, hubTab === 'topics' && es.hubTabBtnActive]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="folder" size={14} color={hubTab === 'topics' ? 'white' : colors.purple} />
            <T bold={hubTab === 'topics'} style={[es.hubTabText, hubTab === 'topics' && { color: 'white' }]}>
              Koleksiyonlar
            </T>
          </View>
        </Tap>
      </View>

      {hubTab === 'articles' ? (
        /* 1. TÜM EDİTORYAL YAZILAR & MAGAZİN FEED'İ (65 MAKALE) */
        <View style={{ gap: 14 }}>
          {/* Arama Barı */}
          <View style={es.searchBox}>
            <Icon name="search" size={20} color={colors.muted} />
            <TextInput
              value={articleQuery}
              onChangeText={setArticleQuery}
              placeholder="Konu, soru, belirti veya makale ara..."
              placeholderTextColor={colors.muted}
              style={es.searchInput}
            />
            {articleQuery ? (
              <Tap onPress={() => setArticleQuery('')} label="Temizle">
                <Icon name="close" size={16} color={colors.muted} />
              </Tap>
            ) : null}
          </View>

          {/* Kategori Filtre Hapları */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
            {topicFilters.map(t => (
              <Tap
                key={t}
                onPress={() => setArticleFilter(t)}
                label={t}
                style={[es.catPill, articleFilter === t && es.catPillActive]}
              >
                <T bold={articleFilter === t} style={{ fontSize: 12, color: articleFilter === t ? 'white' : colors.ink }}>
                  {t}
                </T>
              </Tap>
            ))}
          </ScrollView>

          {/* Öne Çıkan Başyazı (Featured Lead Story) */}
          {!articleQuery && articleFilter === 'Tümü' && featuredArticle && (
            <Tap
              onPress={() => openArticle && openArticle(featuredArticle)}
              label="Öne Çıkan Başyazı"
              style={es.featuredHeroCard}
            >
              {(() => {
                const featImg = generatedAssets[featuredArticle?.image] || getAsset(featuredArticle?.image) || generatedAssets['blog_pregnant_morning'];
                return featImg ? (
                  <Image source={featImg} style={StyleSheet.absoluteFill} resizeMode="cover" />
                ) : null;
              })()}
              <LinearGradient
                colors={['rgba(20,10,25,0.05)', 'rgba(20,10,25,0.78)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={es.featuredHeroBadge}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Icon name="sparkle" size={11} color="white" />
                  <T bold style={{ fontSize: 10, color: 'white', letterSpacing: 0.8 }}>GÜNÜN BAŞYAZISI</T>
                </View>
              </View>
              <View style={es.featuredHeroContent}>
                <T bold style={es.featuredHeroTitle}>{featuredArticle.title}</T>
                <T numberOfLines={2} style={es.featuredHeroSub}>{featuredArticle.subtitle}</T>
                <View style={es.featuredHeroMeta}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Icon name="clock" size={12} color="#E4D6E6" />
                    <T style={{ fontSize: 11, color: '#E4D6E6' }}>{featuredArticle.minutes} dk okuma</T>
                  </View>
                  <T style={{ fontSize: 11, color: '#E4D6E6' }}>• {featuredArticle.doctor ? featuredArticle.doctor.split('·')[0] : 'Klinik Ekip'}</T>
                </View>
              </View>
            </Tap>
          )}

          {/* Makale Sayacı */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 }}>
            <T bold style={{ fontSize: 13, color: colors.muted }}>
              {filteredArticles.length} Editoryal Rehber
            </T>
            {articleFilter !== 'Tümü' && (
              <Tap onPress={() => setArticleFilter('Tümü')} label="Filtreyi Temizle">
                <T style={{ fontSize: 12, color: colors.purple }}>Tümünü Göster ↺</T>
              </Tap>
            )}
          </View>

          {/* Makale Kartları Listesi (Vogue / Flo Kalitesinde Görsel Kartlar) */}
          <View style={{ gap: 14 }}>
            {filteredArticles.map(a => {
              const imgAsset = generatedAssets[a.image] || getAsset(a.image) || generatedAssets['blog_pregnant_morning'];
              return (
                <Tap
                  key={a.id}
                  onPress={() => openArticle && openArticle(a)}
                  label={a.title}
                  style={es.blogPostCard}
                >
                  <View style={es.blogPostImgBox}>
                    <Image
                      source={imgAsset}
                      style={StyleSheet.absoluteFill}
                      resizeMode="cover"
                    />
                    <View style={es.blogPostTimeTag}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Icon name="clock" size={11} color="white" />
                        <T style={{ fontSize: 10, color: 'white', fontWeight: 'bold' }}>{a.minutes} dk</T>
                      </View>
                    </View>
                  </View>
                  <View style={{ padding: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <View style={es.blogPostCategoryTag}>
                        <T bold style={{ fontSize: 10, color: colors.purple }}>{a.categoryName || 'Rehber'}</T>
                      </View>
                      {a.weeks && (
                        <T style={{ fontSize: 11, color: colors.muted }}>• Hafta {a.weeks[0]}-{a.weeks[1]}</T>
                      )}
                    </View>

                    <T bold style={es.blogPostTitle}>{a.title}</T>
                    <T numberOfLines={2} style={es.blogPostSub}>{a.subtitle}</T>

                    {a.doctor && (
                      <View style={es.blogPostDocRow}>
                        <Icon name="check" size={13} color={colors.purple} />
                        <T numberOfLines={1} style={{ fontSize: 11, color: colors.purple, flex: 1, fontWeight: '600' }}>
                          {`Kaynak: ${a.doctor}`}
                        </T>
                        <Icon name="chevron" size={16} color={colors.purple} />
                      </View>
                    )}
                  </View>
                </Tap>
              );
            })}
          </View>
        </View>
      ) : hubTab === 'infographics' ? (
        /* 4. GÖRSEL İNFOGRAFİKLER & KLİNİK ŞABLONLAR */
        <View style={{ gap: 16 }}>
          <View style={{ gap: 4 }}>
            <T bold style={{ fontSize: 18, color: colors.ink, letterSpacing: -0.4 }}>Görsel Sağlık & Yaşam İnfografikleri</T>
            <T style={{ fontSize: 13, color: colors.muted }}>Karmaşık klinik ve bakım bilgilerini sade, görsel şablonlarla keşfedin.</T>
          </View>

          {[
            {
              id: 'info-1',
              title: 'Gebelikte Şampiyon Anne Tabağı & Süper Besinler',
              sub: 'Trimesterlar boyunca bebeğin beyin, kemik ve organ gelişimini hızlandıran optimal mikro besin dengesi.',
              tag: 'BESLENME & MİKRO BESİN',
              asset: 'infographic_trimester_nutrition',
              fallback: 'blog_healthy_breakfast',
              tint: '#4A7C59',
              bullets: ['Kolin & DHA: Yumurta sarısı ve somon', 'Folat & Demir: Koyu yeşil yapraklılar', 'Kalsiyum: Probiyotik yoğurt ve kefir']
            },
            {
              id: 'info-2',
              title: 'Güvenli Bebek Uykusu Kılavuzu: ABC Kuralı',
              sub: 'Ani Bebek Ölümü Sendromu (SIDS) riskini %80 azaltan Dünya Sağlık Örgütü onaylı güvenli uyku rehberi.',
              tag: 'YENİDOĞAN GÜVENLİĞİ',
              asset: 'infographic_safe_sleep_abc',
              fallback: 'blog_sleeping_crib',
              tint: '#58638A',
              bullets: ['A - Alone: Yalnız, yastıksız ve oyuncaksız', 'B - Back: Her zaman sırtüstü yatış', 'C - Crib: Kendi bağımsız beşiğinde']
            },
            {
              id: 'info-3',
              title: 'Doğumun 3 Aşaması ve Bedenin Doğal Dönüşümü',
              sub: 'İlk sancıdan plasentanın doğumuna ve ten tene temas saatine kadar doğum yolculuğunun anatomik evreleri.',
              tag: 'DOĞUM REHBERİ',
              asset: 'infographic_labor_stages',
              fallback: 'blog_epidural_birth',
              tint: '#8C4A60',
              bullets: ['1. Evre: Rahim ağzının incelmesi ve 10 cm açılma', '2. Evre: Bebeğin inişi ve ıkınma aşaması', '3. Evre: Bebeğin kucaklaşması & Altın Saat']
            },
            {
              id: 'info-4',
              title: 'Fetal Tekme ve Hareket Takibi: 10 Sayım Kuralı',
              sub: 'Bebeğinizin anne karnındaki ritmini, uyanıklık pencerelerini ve doktora bildirilmesi gereken sinyalleri öğrenin.',
              tag: 'FETAL GELİŞİM',
              asset: 'infographic_kick_counter_guide',
              fallback: 'blog_couple_bump',
              tint: '#9C6238',
              bullets: ['Yemekten sonra 2 saat içinde 10 net hareket', 'Sol yan yatışta kan akışı maksimuma çıkar', 'Harekette belirgin azalma hekime iletilmelidir']
            },
            {
              id: 'info-5',
              title: 'Yenidoğan Açlık ve Ağlama Beden Dili',
              sub: 'Bebek ağlamadan önceki ince beden dili işaretlerini çözün; beslenmeyi sakin ve stressiz tamamlayın.',
              tag: 'BEBEK PSİKOLOJİSİ',
              asset: 'infographic_baby_crying_cues',
              fallback: 'blog_baby_first_food',
              tint: '#6A5688',
              bullets: ['Erken Sinyal: Ağzı arama, parmak emme, başı çevirme', 'Aktif Sinyal: Gerinme, hızlı nefes, kollarını sallama', 'Geç Sinyal: Kırmızı yüzle ağlama (Önce sakinleştirin)']
            },
            {
              id: 'info-6',
              title: 'Eksiksiz Doğum ve Hastane Çantası Görsel Şablonu',
              sub: '32. haftada hazır bulunması gereken anne, bebek ve refakatçi temel gereksinimlerinin görsel yerleşimi.',
              tag: 'HAZIRLIK REHBERİ',
              asset: 'infographic_hospital_checklist',
              fallback: 'blog_hospital_bag_pack',
              tint: '#785A48',
              bullets: ['Anne: Önden açılan gecelik, lohusa pedi, terlik', 'Bebek: 3 takım tulum, zıbın, müslin bez, pişik kremi', 'Evraklar: Kimlik, sigorta, doğum tercih planı']
            }
          ].map(info => {
            const imgSource = generatedAssets[info.asset] || generatedAssets[info.fallback] || generatedAssets['blog_pregnant_morning'];
            return (
              <Card key={info.id} style={{ padding: 0, overflow: 'hidden', borderRadius: 24, borderWidth: 1, borderColor: '#E8DCE4' }}>
                <View style={{ height: 210, width: '100%', backgroundColor: '#201525', overflow: 'hidden' }}>
                  {imgSource && (
                    <Image source={imgSource} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  )}
                  <LinearGradient
                    colors={['rgba(25,12,30,0.1)', 'rgba(25,12,30,0.82)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={{ position: 'absolute', top: 14, left: 14, backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 }}>
                    <T bold style={{ fontSize: 10, color: info.tint, letterSpacing: 0.8 }}>{info.tag}</T>
                  </View>
                  <View style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
                    <T bold style={{ fontSize: 18, color: 'white', lineHeight: 23, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 3 }}>
                      {info.title}
                    </T>
                  </View>
                </View>

                <View style={{ padding: 18, gap: 10, backgroundColor: '#FFFAF8' }}>
                  <T style={{ fontSize: 13, color: colors.ink, lineHeight: 19 }}>
                    {info.sub}
                  </T>
                  <View style={{ height: 1, backgroundColor: '#EFE7EE', marginVertical: 2 }} />
                  <View style={{ gap: 6 }}>
                    {info.bullets.map((b, bIdx) => (
                      <View key={bIdx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: info.tint }} />
                        <T style={{ fontSize: 12, color: '#55485E', fontWeight: '500' }}>{b}</T>
                      </View>
                    ))}
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      ) : hubTab === 'food' ? (
        /* 2. BESİN GÜVENLİĞİ KILAVUZU */
        <FoodSafetyChecker />
      ) : (
        /* 3. TEMATİK DOSYALAR & KOLEKSİYONLAR */
        <View style={{ gap: 12 }}>
          <Section title="Tematik Koleksiyon Dosyaları" />
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
                <T style={{ fontSize: 12, color: colors.muted, marginTop: 5 }}>{col.count} derlenmiş rehber</T>
              </View>
              <Icon name="chevron" size={18} color={colors.purple} />
            </Tap>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── EKRAN 15: MAKALE DETAY EKRANI (LUXURY MAGAZINE EDITORIAL READER) ────────
export function EditorialArticleScreen({ article, toast }) {
  const [playingAudio, setPlayingAudio] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const defaultArticle = articles[0] || {
    title: '1. Trimester Sabah Bulantıları ve Yorgunlukla Başa Çıkma',
    doctor: 'Momora editoryal kaynak dosyası',
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
        text: 'Gebelikte hızla yükselen insan koryonik gonadotropini (hCG) ve östrojen hormonları, sindirim sisteminin yavaşlamasına ve mide boşalmasının gecikmesine yol açar.',
        tip: '💡 Baş ucunuzda tuzlu galeta veya leblebi bulundurun; gözünüzü açtığınızda ayağa kalkmadan bir iki lokma atıştırıp 10 dakika uzanın.'
      }
    ]
  };

  const a = article || defaultArticle;
  const coverAsset = (a.image && (generatedAssets[a.image] || getAsset(a.image))) || generatedAssets['blog_sleeping_crib'];
  const readingTime = a.time || (a.minutes ? `${a.minutes} dk okuma` : '4 dk okuma');
  const doctorName = a.doctor ? `Kaynak: ${a.doctor}` : 'Momora editoryal dosyası · kaynak kontrolü';
  const relatedArticles = articles.filter(other => other.id !== a.id && other.topic === a.topic).slice(0, 3);

  return (
    <View style={es.container}>
      {/* 1. Büyük Editoryal Kapak (16:9 Hero Image with Vignette Gradient) */}
      <View style={es.articleCoverBox}>
        {coverAsset ? (
          <Image source={coverAsset} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <LinearGradient colors={['#9A779A', '#664566']} style={StyleSheet.absoluteFill} />
        )}
        <LinearGradient
          colors={['rgba(35,22,40,0.2)', 'rgba(25,16,30,0.94)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={es.coverMeta}>
          <View style={es.coverBadgeRow}>
            <View style={es.categoryPill}>
              <T bold style={{ fontSize: 10, color: 'white', letterSpacing: 0.8 }}>
                {a.categoryName ? a.categoryName.toLocaleUpperCase('tr') : 'EDİTORYAL REHBER'}
              </T>
            </View>
            <View style={es.readingTimePill}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Icon name="clock" size={11} color="white" /><T style={{ fontSize: 11, color: 'white' }}>{readingTime}</T></View>
            </View>
          </View>
          <T bold style={es.articleTitle}>{a.title}</T>
          <T style={es.articleCoverSub}>{a.subtitle}</T>
        </View>
      </View>

      {/* 2. Kaynak Notu & Yer İmleri Butonu */}
      <Card style={es.doctorCard}>
        <View style={es.docAvatar}>
          <Icon name="book" size={20} color={colors.purple} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <T bold style={{ fontSize: 13.5, color: colors.ink }}>Editoryal Kaynak Notu</T>
            <T style={{ fontSize: 12, color: colors.purple }}>✓</T>
          </View>
          <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 2 }}>{doctorName}</T>
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

      {/* 3. Momora Audio: Sesli Dinleme (Podcast Bar) */}
      <Card style={es.audioBar}>
        <Tap
          onPress={() => {
            const next = !playingAudio;
            setPlayingAudio(next);
            if (next) {
              playSound('ocean', { volume: 0.4 });
              toast && toast('🎵 Sakinleştirici fon sesi başlatıldı');
            } else {
              stopSound();
            }
          }}
          label="Sesli dinle"
          style={es.audioPlayBtn}
        >
          <T style={{ fontSize: 15 }}>{playingAudio ? '⏸️' : '▶️'}</T>
        </Tap>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <T bold style={{ fontSize: 13, color: colors.ink }}>Momora Sesli Dinleme</T>
          <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
            {playingAudio ? 'Yazı seslendiriliyor...' : `${a.audioDuration || '3:45'} · Sakinleştirici ses`}
          </T>
          {/* Dalga Formu / Waveform Görselleştirmesi */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 }}>
            {[8, 14, 20, 12, 18, 10, 16, 22, 14, 8, 12].map((h, i) => (
              <View
                key={i}
                style={{
                  width: 3,
                  height: playingAudio ? (i % 2 === 0 ? h : h * 0.7) : 5,
                  borderRadius: 2,
                  backgroundColor: playingAudio ? colors.purple : '#D8CCD8',
                }}
              />
            ))}
          </View>
        </View>
        <Tap
          onPress={() => toast && toast('Makale bağlantısı kopyalandı 🔗')}
          label="Paylaş"
          style={{ padding: 8 }}
        >
          <Icon name="heart" size={19} color={colors.purple} />
        </Tap>
      </Card>

      {/* 4. Özetle: Önemli Noktalar Kartı */}
      {a.keyPoints && a.keyPoints.length > 0 && (
        <Card style={es.keyPointsCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <Icon name="sparkle" size={16} color={colors.purple} />
            <T bold style={{ fontSize: 13.5, color: colors.purple, letterSpacing: 0.5 }}>
              ÖZETLE: ÖNE ÇIKAN NOKTALAR
            </T>
          </View>
          {a.keyPoints.map((kp, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 6 }}>
              <T style={{ color: colors.purple, fontSize: 14, marginTop: 1 }}>•</T>
              <T style={{ fontSize: 13.5, color: colors.ink, lineHeight: 20, flex: 1 }}>{kp}</T>
            </View>
          ))}
        </Card>
      )}

      {/* 5. Makale Bölümleri & Geniş Editoryal Görseller (16:9) */}
      <View style={{ gap: 16 }}>
        {a.sections ? (
          a.sections.map((sec, idx) => {
            const inlineAsset = sec.image && generatedAssets[sec.image];
            return (
              <Card key={idx} style={{ padding: 18 }}>
                {/* Bölüm Başlığı & Numara Rozeti */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <View style={es.sectionNumberBadge}>
                    <T bold style={{ fontSize: 11, color: colors.purple }}>{String(idx + 1).padStart(2, '0')}</T>
                  </View>
                  <T bold style={{ fontSize: 17, color: colors.ink, lineHeight: 23, flex: 1 }}>
                    {sec.title}
                  </T>
                </View>

                {/* 16:9 Geniş Fotoğraf ve İtalyan Altyazı Kartı */}
                {inlineAsset && (
                  <View style={es.inlineFigureBox}>
                    <View style={es.inlineImgFrame}>
                      <Image source={inlineAsset} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    </View>
                    <View style={es.inlineCaptionRow}>
                      <Icon name="search" size={12} color="#7E6D82" style={{ marginRight: 5 }} />
                      <T style={es.inlineCaptionText}>
                        {sec.caption || `${sec.title} görsel rehberi`}
                      </T>
                    </View>
                  </View>
                )}

                {/* Paragraf Metni */}
                <T style={es.articleP}>
                  {sec.text}
                </T>

                {/* Kaynak İpucu / Uyarı Kutusu */}
                {sec.tip && (
                  <View style={[
                    es.clinicTipBox,
                    sec.tip.includes('⚠️') && es.clinicWarningBox
                  ]}>
                    <T style={[
                      es.clinicTipText,
                      sec.tip.includes('⚠️') && { color: '#99352A' }
                    ]}>
                      {sec.tip}
                    </T>
                  </View>
                )}
              </Card>
            );
          })
        ) : a.paragraphs ? (
          a.paragraphs.map((p, idx) => (
            <Card key={idx} style={{ padding: 16 }}>
              <T style={es.articleP}>{p}</T>
            </Card>
          ))
        ) : null}
      </View>

      {/* 6. Benzer Rehberler */}
      {relatedArticles.length > 0 && (
        <View style={{ marginTop: 14, gap: 11 }}>
          <Section title="Konuyla İlgili Diğer Rehberler" />
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
                <T bold numberOfLines={1} style={{ fontSize: 13.5, color: colors.ink }}>{rel.title}</T>
                <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 4 }}>⏱️ {rel.minutes} dk okuma</T>
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
  container: { gap: 14, paddingBottom: 28 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFDFA', borderWidth: 1, borderColor: '#DED3DB', borderRadius: 18, paddingHorizontal: 14, height: 46, ...shadow },
  searchInput: { flex: 1, fontSize: 13, color: colors.ink },
  catPill: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#EFEAEF' },
  catPillActive: { backgroundColor: colors.purple },
  foodCard: { padding: 15 },
  foodCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  altBox: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: colors.line },
  // Hub styles
  foodBanner: { height: 95, borderRadius: 20, overflow: 'hidden', padding: 16, flexDirection: 'row', alignItems: 'center', ...shadow },
  foodBannerIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF33', alignItems: 'center', justifyContent: 'center' },
  collectionCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18, borderWidth: 1, borderColor: '#EBE1EA', ...shadow },
  colImg: { width: 68, height: 68, borderRadius: 14, marginRight: 14 },
  colInfo: { flex: 1 },
  // Hub Tabs
  hubTabRow: { flexDirection: 'row', backgroundColor: '#EFE6F3', borderRadius: 16, padding: 3, gap: 4 },
  hubTabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  hubTabBtnActive: { backgroundColor: colors.purple },
  hubTabText: { fontSize: 11, color: '#795B82' },
  // Featured Lead Story Hero
  featuredHeroCard: { height: 230, borderRadius: 22, overflow: 'hidden', justifyContent: 'flex-end', padding: 16, position: 'relative', ...shadow },
  featuredHeroBadge: { position: 'absolute', top: 14, left: 14, backgroundColor: '#7E4E8AEE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  featuredHeroContent: { gap: 6 },
  featuredHeroTitle: { fontSize: 18, color: 'white', lineHeight: 24 },
  featuredHeroSub: { fontSize: 12, color: '#F0E5F2', lineHeight: 17 },
  featuredHeroMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  // Blog Post Card styles
  blogPostCard: { backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#ECE2EC', ...shadow },
  blogPostImgBox: { height: 180, width: '100%', backgroundColor: '#F0EAF1', position: 'relative', overflow: 'hidden' },
  blogPostTimeTag: { position: 'absolute', top: 12, right: 12, backgroundColor: '#00000077', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  blogPostCategoryTag: { backgroundColor: '#F4EDF6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  blogPostTitle: { fontSize: 16, color: colors.ink, lineHeight: 22 },
  blogPostSub: { fontSize: 12.5, color: '#5C5463', marginTop: 4, lineHeight: 18 },
  blogPostDocRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderColor: '#F5EDF6' },
  // FAQ styles
  faqIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F0E5F3', alignItems: 'center', justifyContent: 'center' },
  faqAnswerBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#EDE2EE' },
  faqAnswerText: { fontSize: 13.5, lineHeight: 22, color: '#443A48' },
  faqTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  faqTag: { backgroundColor: '#F5EDF7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  // Editorial Article Reader styles
  articleCoverBox: { height: 260, borderRadius: 24, overflow: 'hidden', justifyContent: 'flex-end', padding: 18, position: 'relative', ...shadow },
  coverMeta: { gap: 6 },
  coverBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  categoryPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#784882CC' },
  readingTimePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#00000066' },
  articleTitle: { fontSize: 21, color: 'white', lineHeight: 27 },
  articleCoverSub: { fontSize: 13, color: '#E8DBEA', lineHeight: 18 },
  doctorCard: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  docAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EFE7EE', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  bookmarkBtn: { padding: 8 },
  audioBar: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#FAF6FA' },
  audioPlayBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
  keyPointsCard: { backgroundColor: '#F8F3FA', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#EBE0F0' },
  sectionNumberBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#F0E5F2', alignItems: 'center', justifyContent: 'center' },
  inlineFigureBox: { marginVertical: 14 },
  inlineImgFrame: { width: '100%', height: 220, borderRadius: 18, overflow: 'hidden', backgroundColor: '#F4EEF5', borderWidth: 1, borderColor: '#ECE2EC', position: 'relative', ...shadow },
  inlineCaptionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingTop: 8 },
  inlineCaptionText: { fontSize: 11.5, color: '#7E6D82', fontStyle: 'italic', flex: 1, lineHeight: 16 },
  articleP: { fontSize: 14.5, lineHeight: 24, color: '#3A3240' },
  clinicTipBox: { backgroundColor: '#FAF3F8', padding: 14, borderRadius: 14, marginTop: 14, borderLeftWidth: 4, borderLeftColor: colors.purple },
  clinicWarningBox: { backgroundColor: '#FDF4F2', borderLeftColor: '#C44E3F' },
  clinicTipText: { fontSize: 12.5, color: '#634468', lineHeight: 19 },
  relatedCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#EAE1EB', gap: 12 },
  relatedImg: { width: 52, height: 52, borderRadius: 12 },
});
