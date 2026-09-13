import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, Section, ScreenHero, ToolExperienceCard } from './ui';
import { generatedAssets, getAsset } from './generatedAssets';
import { articles, pregnancyFaqs, faqCategories, searchFaqs, getFaqsByCategory, searchArticles } from './content';
import { playSound, stopSound } from './soundEngine';
import { speakText, stopSpeech, isSpeaking, compileArticleSpeechText } from './speechService';
import { getLocalizedArticle } from './articleTranslationsEn';

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

export function FoodSafetyChecker({ toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');

  const trCategories = [
    { id: 'all', label: 'Tümü' },
    { id: 'seafood', label: 'Deniz Ürünleri' },
    { id: 'meat', label: 'Et Ürünleri' },
    { id: 'dairy', label: 'Süt Ürünleri' },
    { id: 'beverage', label: 'İçecekler' },
    { id: 'tea', label: 'Bitki Çayları' },
    { id: 'staple', label: 'Temel Gıdalar' },
  ];

  const enCategories = [
    { id: 'all', label: 'All' },
    { id: 'seafood', label: 'Seafood' },
    { id: 'meat', label: 'Meat' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'beverage', label: 'Beverages' },
    { id: 'tea', label: 'Herbal Teas' },
    { id: 'staple', label: 'Staples' },
  ];

  const categories = isEn ? enCategories : trCategories;

  const enFoodDatabase = [
    { id: 'f1', catId: 'seafood', name: 'Sushi & Raw Fish', cat: 'Seafood', status: 'avoid', badge: '🔴 Avoid', reason: 'High risk of bacterial and parasitic infection from raw seafood.', alt: 'Cooked Salmon or Steamed White Fish' },
    { id: 'f2', catId: 'seafood', name: 'Canned Tuna', cat: 'Seafood', status: 'limit', badge: '🟡 Moderate Intake', reason: 'Due to mercury content, limit to 1-2 servings per week maximum.', alt: 'Sardines, Anchovies (Low mercury)' },
    { id: 'f3', catId: 'seafood', name: 'Cooked Salmon', cat: 'Seafood', status: 'safe', badge: '🟢 Safe & Beneficial', reason: 'Rich in Omega-3 and DHA; supports fetal brain and eye development.', alt: '1-2 servings per week is recommended.' },
    { id: 'f4', catId: 'dairy', name: 'Unpasteurized Cheeses · Roquefort, Brie', cat: 'Dairy', status: 'avoid', badge: '🔴 Avoid', reason: 'Carries risk of Listeria bacteria; can cause preterm birth or infection.', alt: 'Pasteurized white feta or cheddar' },
    { id: 'f5', catId: 'dairy', name: 'Pasteurized Yogurt & Kefir', cat: 'Dairy', status: 'safe', badge: '🟢 Safe & Beneficial', reason: 'Abundant calcium and probiotics; strengthens digestion and immunity.', alt: '1-2 bowls daily can be enjoyed.' },
    { id: 'f6', catId: 'beverage', name: 'Coffee & Filter Coffee', cat: 'Beverages', status: 'limit', badge: '🟡 Moderate Intake', reason: 'Daily caffeine intake should be limited to 200 mg (~1 cup).', alt: 'Decaf coffee or warm milk' },
    { id: 'f7', catId: 'tea', name: 'Sage & Rosemary Tea', cat: 'Herbal Teas', status: 'avoid', badge: '🔴 Avoid', reason: 'May contain compounds that trigger uterine contractions.', alt: 'Linden or Ginger tea' },
    { id: 'f8', catId: 'staple', name: 'Hard-Boiled Egg', cat: 'Staples', status: 'safe', badge: '🟢 Safe & Beneficial', reason: 'Great source of choline and high quality protein. Yolk must be fully firm.', alt: '1 hard-boiled egg every morning' },
    { id: 'f9', catId: 'seafood', name: 'Mussels & Shrimp Cocktail', cat: 'Seafood', status: 'avoid', badge: '🔴 Avoid', reason: 'Shellfish can accumulate heavy metals and environmental toxins.', alt: 'Well-cooked grilled sea bass' },
    { id: 'f10', catId: 'meat', name: 'Organ Meats & Offal', cat: 'Meat', status: 'avoid', badge: '🔴 Avoid', reason: 'Excessive vitamin A (retinol) and toxin risks; avoid during pregnancy.', alt: 'Well-cooked grilled chicken or meatballs' },
    { id: 'f11', catId: 'meat', name: 'Raw Cured Meats & Pastrami', cat: 'Meat', status: 'avoid', badge: '🔴 Avoid', reason: 'Raw cured meats carry toxoplasmosis risk. Must be thoroughly cooked.', alt: 'Pan-fried well-done meats' },
    { id: 'f12', catId: 'staple', name: 'Excess Raw Parsley', cat: 'Staples', status: 'limit', badge: '🟡 Moderate Intake', reason: 'High apiole content can stimulate contractions. Small amounts in salads are safe.', alt: 'Arugula, romaine lettuce, fresh spinach' },
    { id: 'f13', catId: 'staple', name: 'Bulgur Veggie Meatballs (Meatless)', cat: 'Staples', status: 'safe', badge: '🟢 Safe & Beneficial', reason: 'Hygienically prepared walnut or bulgur balls without meat are safe.', alt: 'With fresh lemon and lettuce' },
    { id: 'f14', catId: 'tea', name: 'Linden & Ginger Tea', cat: 'Herbal Teas', status: 'safe', badge: '🟢 Safe & Beneficial', reason: 'Relieves morning nausea and soothes the throat; safest herbal teas.', alt: '1-2 warm cups daily' },
  ];

  const db = isEn ? enFoodDatabase : foodDatabase.map(f => {
    const catMap = {
      'Deniz Ürünleri': 'seafood',
      'Et Ürünleri': 'meat',
      'Süt Ürünleri': 'dairy',
      'İçecekler': 'beverage',
      'Bitki Çayları': 'tea',
      'Temel Gıdalar': 'staple'
    };
    return { ...f, catId: catMap[f.cat] || 'all' };
  });

  const filtered = db.filter(f => {
    const q = query.toLowerCase();
    const matchesQuery = !q || f.name.toLowerCase().includes(q) || f.cat.toLowerCase().includes(q);
    const matchesCat = cat === 'all' || f.catId === cat;
    return matchesQuery && matchesCat;
  });

  return (
    <View style={es.container}>
      <ScreenHero
        kicker={isEn ? 'FOOD SAFETY' : 'BESİN GÜVENLİĞİ'}
        title={isEn ? 'Can I Eat This?' : 'Yenebilir mi?'}
        body={isEn ? 'Review foods you wonder about with clear risk notes and safer alternatives.' : 'Merak ettiğin gıdaları sade risk notları ve daha güvenli alternatiflerle incele.'}
        icon="bowl"
        asset="ui_food_safe_shield"
        stat={isEn ? `${filtered.length} results` : `${filtered.length} sonuç`}
        tint="#4F8464"
      />

      <ToolExperienceCard
        title={isEn ? 'Decide in under a minute' : 'Bir dakikadan kısa sürede karar ver'}
        steps={isEn
          ? ['Search the food or open a category.', 'Read the risk color and plain reason.', 'Choose the safer alternative if needed.']
          : ['Besini ara veya kategoriden aç.', 'Risk rengini ve sade sebebi oku.', 'Gerekiyorsa güvenli alternatifi seç.']}
        outcome={isEn ? 'Food choices feel clear at the market, cafe, or home.' : 'Market, kafe veya evde besin kararı netleşir.'}
        asset="ui_food_safe_shield"
        tint="#7A7E45"
        lang={lang}
      />

      {/* Arama Kutusu */}
      <View style={es.searchBox}>
        <Icon name="search" size={20} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={isEn ? 'Search food or beverage: Sushi, Coffee, Cheese...' : 'Gıda veya içecek ara: Suşi, Kahve, Peynir...'}
          placeholderTextColor={colors.muted}
          style={es.searchInput}
        />
        {query ? (
          <Tap onPress={() => setQuery('')} label={isEn ? 'Clear' : 'Temizle'}>
            <Icon name="close" size={16} color={colors.muted} />
          </Tap>
        ) : null}
      </View>

      {/* Kategori Filtreleri */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
        {categories.map(c => (
          <Tap
            key={c.id}
            onPress={() => setCat(c.id)}
            label={c.label}
            style={[es.catPill, cat === c.id && es.catPillActive]}
          >
            <T bold={cat === c.id} style={{ fontSize: 12, color: cat === c.id ? 'white' : colors.ink }}>
              {c.label}
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
                <T bold style={{ fontSize: 11, color: colors.purple, letterSpacing: 0.5 }}>
                  {isEn ? 'SAFER ALTERNATIVE:' : 'DAHA GÜVENLİ ALTERNATİF:'}
                </T>
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
  { id: 'pregnancy', title: 'Gebelikte Hafta Hafta Gelişim & Testler', titleEn: 'Week by Week Pregnancy & Tests', count: 4, art: 'blog_ultrasound_memory', image: 'blog_ultrasound_memory', color: '#F4EEF6' },
  { id: 'nutrition', title: 'Gebelikte Beslenme & Güvenli Gıdalar', titleEn: 'Nutrition & Safe Foods in Pregnancy', count: 3, art: 'blog_healthy_breakfast', image: 'blog_healthy_breakfast', color: '#F4F7F2' },
  { id: 'wellbeing', title: 'Trimester Egzersizleri & Doğum Yogası', titleEn: 'Trimester Exercises & Prenatal Yoga', count: 2, art: 'blog_yoga_stretch', image: 'blog_yoga_stretch', color: '#FAF1F5' },
  { id: 'birth', title: 'Doğum Planı, Çanta & Hastane Rehberi', titleEn: 'Birth Plan, Hospital Bag & Guide', count: 3, art: 'blog_hospital_bag_pack', image: 'blog_hospital_bag_pack', color: '#FAF4EF' },
  { id: 'baby', title: 'Yenidoğan Bakımı, Masaj & İlk Günler', titleEn: 'Newborn Care, Massage & First Days', count: 8, art: 'blog_newborn_hand', image: 'blog_newborn_hand', color: '#EEF4F7' },
  { id: 'postpartum', title: 'Lohusalık, İyileşme & Kendine Şefkat', titleEn: 'Postpartum Healing & Self-Care', count: 2, art: 'blog_postpartum_selfcare', image: 'blog_postpartum_selfcare', color: '#F7EFF7' },
  { id: 'partner', title: 'Eş & Baba Olmak: İlk Günlerde Destek', titleEn: 'Partner & Father: Early Day Support', count: 2, art: 'blog_father_baby_bond', image: 'blog_father_baby_bond', color: '#F0F5FA' },
];

export function TopicHubScreen({ openArticle, openFoodChecker, initialTab = 'articles', lang = 'tr' }) {
  const isEn = lang === 'en';
  const [hubTab, setHubTab] = useState(initialTab); // 'articles' | 'food' | 'infographics' | 'topics'
  const [articleQuery, setArticleQuery] = useState('');
  const [articleFilter, setArticleFilter] = useState('all');

  const topicFilters = isEn ? [
    { id: 'all', label: 'All' },
    { id: 't1', label: '1st Trimester' },
    { id: 't2', label: '2nd Trimester' },
    { id: 't3', label: '3rd Trimester' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'growth', label: 'Growth & Visits' },
    { id: 'birth', label: 'Birth Prep' },
    { id: 'baby', label: 'Baby & Newborn' },
    { id: 'postpartum', label: 'Postpartum' },
    { id: 'wellbeing', label: 'Wellbeing' },
    { id: 'partner', label: 'Partner & Dad' }
  ] : [
    { id: 'all', label: 'Tümü' },
    { id: 't1', label: '1. Trimester' },
    { id: 't2', label: '2. Trimester' },
    { id: 't3', label: '3. Trimester' },
    { id: 'nutrition', label: 'Beslenme' },
    { id: 'growth', label: 'Gelişim & Kontrol' },
    { id: 'birth', label: 'Doğuma Hazırlık' },
    { id: 'baby', label: 'Bebek & Yenidoğan' },
    { id: 'postpartum', label: 'Lohusalık & İyileşme' },
    { id: 'wellbeing', label: 'İyi Hisset & Ruh' },
    { id: 'partner', label: 'Eş & Baba' }
  ];

  const filteredArticles = articles.filter(a => {
    const q = articleQuery.toLowerCase();
    const matchesSearch = !q || 
      a.title.toLowerCase().includes(q) ||
      a.subtitle.toLowerCase().includes(q) ||
      (a.categoryName && a.categoryName.toLowerCase().includes(q)) ||
      (a.doctor && a.doctor.toLowerCase().includes(q));

    let matchesFilter = true;
    if (articleFilter === 't1') {
      matchesFilter = a.categoryName === '1. Trimester' || (a.weeks && a.weeks[0] <= 12);
    } else if (articleFilter === 't2') {
      matchesFilter = a.categoryName === '2. Trimester' || (a.weeks && a.weeks[0] >= 13 && a.weeks[0] <= 27);
    } else if (articleFilter === 't3') {
      matchesFilter = a.categoryName === '3. Trimester' || (a.weeks && a.weeks[0] >= 28);
    } else if (articleFilter === 'nutrition') {
      matchesFilter = a.topic === 'nutrition' || (a.categoryName && a.categoryName.includes('Beslenme'));
    } else if (articleFilter === 'growth') {
      matchesFilter = a.topic === 'pregnancy' || (a.categoryName && (a.categoryName.includes('Gelişim') || a.categoryName.includes('Ultrason') || a.categoryName.includes('Kontrol')));
    } else if (articleFilter === 'birth') {
      matchesFilter = a.topic === 'birth' || (a.categoryName && (a.categoryName.includes('Doğum') || a.categoryName.includes('Hastane')));
    } else if (articleFilter === 'baby') {
      matchesFilter = a.topic === 'baby' || (a.categoryName && (a.categoryName.includes('Bebek') || a.categoryName.includes('Yenidoğan') || a.categoryName.includes('Emzirme')));
    } else if (articleFilter === 'postpartum') {
      matchesFilter = a.topic === 'postpartum' || (a.categoryName && a.categoryName.includes('Lohusa'));
    } else if (articleFilter === 'wellbeing') {
      matchesFilter = a.topic === 'wellbeing' || (a.categoryName && a.categoryName.includes('Hisset'));
    } else if (articleFilter === 'partner') {
      matchesFilter = a.topic === 'partner' || (a.categoryName && a.categoryName.includes('Baba'));
    }

    return matchesSearch && matchesFilter;
  });

  const featuredArticle = articles[0];
  const isShowingLeadHero = !articleQuery && articleFilter === 'all' && featuredArticle;
  const listArticles = isShowingLeadHero ? filteredArticles.filter(a => a.id !== featuredArticle.id) : filteredArticles;

  return (
    <View style={es.container}>
      {/* Hub Üst Sekmeleri (Luxury Editorial Navigation - 3 Ana Alan) */}
      <View style={es.hubTabRow}>
        <Tap
          onPress={() => setHubTab('articles')}
          label={isEn ? 'Articles & Magazine' : 'Yazılar ve Magazin'}
          style={[es.hubTabBtn, hubTab === 'articles' && es.hubTabBtnActive]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="book" size={14} color={hubTab === 'articles' ? 'white' : colors.purple} />
            <T bold={hubTab === 'articles'} style={[es.hubTabText, hubTab === 'articles' && { color: 'white' }]}>
              {isEn ? 'Magazine' : 'Magazin'}
            </T>
          </View>
        </Tap>
        <Tap
          onPress={() => setHubTab('food')}
          label={isEn ? 'Food Safety' : 'Besin Güvenliği'}
          style={[es.hubTabBtn, hubTab === 'food' && es.hubTabBtnActive]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="leaf" size={14} color={hubTab === 'food' ? 'white' : colors.purple} />
            <T bold={hubTab === 'food'} style={[es.hubTabText, hubTab === 'food' && { color: 'white' }]}>
              {isEn ? 'Food Safety' : 'Besin Güvenliği'}
            </T>
          </View>
        </Tap>
        <Tap
          onPress={() => setHubTab('infographics')}
          label={isEn ? 'Infographics' : 'İnfografikler'}
          style={[es.hubTabBtn, hubTab === 'infographics' && es.hubTabBtnActive]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="sparkle" size={14} color={hubTab === 'infographics' ? 'white' : colors.purple} />
            <T bold={hubTab === 'infographics'} style={[es.hubTabText, hubTab === 'infographics' && { color: 'white' }]}>
              {isEn ? 'Infographics' : 'İnfografikler'}
            </T>
          </View>
        </Tap>
        <Tap
          onPress={() => setHubTab('topics')}
          label={isEn ? 'Collections' : 'Koleksiyonlar'}
          style={[es.hubTabBtn, hubTab === 'topics' && es.hubTabBtnActive]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="folder" size={14} color={hubTab === 'topics' ? 'white' : colors.purple} />
            <T bold={hubTab === 'topics'} style={[es.hubTabText, hubTab === 'topics' && { color: 'white' }]}>
              {isEn ? 'Collections' : 'Koleksiyonlar'}
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
              placeholder={isEn ? "Search topic, question, symptom or article..." : "Konu, soru, belirti veya makale ara..."}
              placeholderTextColor={colors.muted}
              style={es.searchInput}
            />
            {articleQuery ? (
              <Tap onPress={() => setArticleQuery('')} label={isEn ? "Clear" : "Temizle"}>
                <Icon name="close" size={16} color={colors.muted} />
              </Tap>
            ) : null}
          </View>

          {/* Kategori Filtre Hapları */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
            {topicFilters.map(t => (
              <Tap
                key={t.id}
                onPress={() => setArticleFilter(t.id)}
                label={t.label}
                style={[es.catPill, articleFilter === t.id && es.catPillActive]}
              >
                <T bold={articleFilter === t.id} style={{ fontSize: 12, color: articleFilter === t.id ? 'white' : colors.ink }}>
                  {t.label}
                </T>
              </Tap>
            ))}
          </ScrollView>

          {/* Öne Çıkan Başyazı (Featured Lead Story Hero - TAM RESİM) */}
          {!articleQuery && articleFilter === 'all' && featuredArticle && (() => {
            const feat = getLocalizedArticle(featuredArticle, lang);
            return (
              <Tap
                onPress={() => openArticle && openArticle(feat)}
                label={isEn ? "Featured Lead Story" : "Öne Çıkan Başyazı"}
                style={es.featuredHeroCard}
              >
                {/* Üst Kısım: Tam 16:9 Kesilmemiş Orijinal Fotoğraf */}
                <View style={es.featuredHeroImgBox}>
                  {(() => {
                    const featImg = generatedAssets[feat?.image] || getAsset(feat?.image) || generatedAssets['blog_pregnant_morning'];
                    return featImg ? (
                      <Image source={featImg} style={es.fitImage} resizeMode="contain" />
                    ) : null;
                  })()}
                  <View style={es.featuredHeroBadge}>
                    <Icon name="sparkle" size={12} color={colors.purple} />
                    <T bold style={{ fontSize: 10.5, color: colors.purple, letterSpacing: 0.8 }}>
                      {isEn ? "TODAY'S LEAD STORY" : "GÜNÜN BAŞYAZISI"}
                    </T>
                  </View>
                </View>

                {/* Alt Kısım: Beyaz Editoryal Gövde */}
                <View style={es.featuredHeroBody}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <View style={es.featuredCatPill}>
                      <T bold style={{ fontSize: 9.5, color: colors.purple, letterSpacing: 0.5 }}>
                        {feat.categoryName ? feat.categoryName.toLocaleUpperCase(isEn ? 'en' : 'tr') : (isEn ? 'GUIDE' : 'REHBER')}
                      </T>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Icon name="clock" size={11} color={colors.muted} />
                      <T style={{ fontSize: 11, color: colors.muted }}>{feat.minutes} {isEn ? 'min read' : 'dk okuma'}</T>
                    </View>
                  </View>
                  <T bold style={es.featuredHeroTitle}>{feat.title}</T>
                  <T numberOfLines={2} style={es.featuredHeroSub}>{feat.subtitle}</T>
                  <View style={es.featuredHeroFooter}>
                    <T numberOfLines={1} style={es.featuredHeroAuthor}>
                      {feat.doctor ? `🩺 ${feat.doctor.split('·')[0].trim()}` : (isEn ? '🩺 Momora Editorial Archive' : '🩺 Momora Editoryal Arşivi')}
                    </T>
                    <View style={es.featuredHeroReadBtn}>
                      <T bold style={{ fontSize: 11.5, color: colors.purple }}>{isEn ? 'Read Guide →' : 'Rehberi Oku →'}</T>
                    </View>
                  </View>
                </View>
              </Tap>
            );
          })()}

          {/* Makale Sayacı & Kapak Görünüm Ayarı */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <T bold style={{ fontSize: 13, color: colors.muted }}>
                {filteredArticles.length} {isEn ? 'Editorial Guides' : 'Editoryal Rehber'}
              </T>
              {articleFilter !== 'all' && (
                <Tap onPress={() => setArticleFilter('all')} label={isEn ? "Clear Filter" : "Filtreyi Temizle"}>
                  <T style={{ fontSize: 11.5, color: colors.purple }}>{isEn ? "(Show All ↺)" : "(Tümünü Göster ↺)"}</T>
                </Tap>
              )}
            </View>

          </View>

          {/* Makale Kartları Listesi (Vogue / Flo Kalitesinde Görsel Kartlar) */}
          <View style={{ gap: 14 }}>
            {listArticles.map(rawArticle => {
              const a = getLocalizedArticle(rawArticle, lang);
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
                      style={es.coverImage}
                      resizeMode="cover"
                    />
                    <View style={es.blogPostCategoryBadge}>
                      <T bold style={{ fontSize: 10, color: colors.purple }}>
                        {a.categoryName || (isEn ? 'Guide' : 'Rehber')}
                      </T>
                    </View>
                    <View style={es.blogPostTimeTag}>
                      <Icon name="clock" size={11} color="white" />
                      <T bold style={{ fontSize: 10.5, color: 'white' }}>{a.minutes} {isEn ? 'min' : 'dk'}</T>
                    </View>
                  </View>
                  <View style={{ padding: 16 }}>
                    <T bold style={es.blogPostTitle}>{a.title}</T>
                    <T numberOfLines={2} style={es.blogPostSub}>{a.subtitle}</T>

                    <View style={es.blogPostDocRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 }}>
                        <Icon name="check" size={13} color={colors.purple} />
                        <T numberOfLines={1} style={{ fontSize: 11.5, color: colors.muted, flex: 1, fontWeight: '500' }}>
                          {a.doctor ? (isEn ? `Source: ${a.doctor.split('·')[0]}` : `Kaynak: ${a.doctor.split('·')[0]}`) : (isEn ? 'Momora Editorial Archive' : 'Momora Editoryal')}
                        </T>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <T bold style={{ fontSize: 11.5, color: colors.purple }}>{isEn ? 'Read' : 'Oku'}</T>
                        <Icon name="chevron" size={14} color={colors.purple} />
                      </View>
                    </View>
                  </View>
                </Tap>
              );
            })}
          </View>

          <View style={es.libraryRitualStrip}>
            <View style={es.libraryRitualIcon}>
              <Icon name="book" size={15} color="#7C5B3F" />
            </View>
            <View style={{ flex: 1 }}>
              <T bold style={{ fontSize: 12.5, color: colors.ink }}>{isEn ? 'Open with one purpose' : 'Tek amaçla aç'}</T>
              <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 2, lineHeight: 16 }}>
                {isEn ? 'Read one guide, save one answer, return when a symptom or plan changes.' : 'Bir rehber oku, bir cevabı kaydet, belirti veya plan değişince geri dön.'}
              </T>
            </View>
          </View>
        </View>
      ) : hubTab === 'infographics' ? (
        /* 4. GÖRSEL İNFOGRAFİKLER & KLİNİK ŞABLONLAR */
        <View style={{ gap: 16 }}>
          <View style={{ gap: 4 }}>
            <T bold style={{ fontSize: 18, color: colors.ink, letterSpacing: -0.4 }}>
              {isEn ? 'Visual Health & Wellness Infographics' : 'Görsel Sağlık & Yaşam İnfografikleri'}
            </T>
            <T style={{ fontSize: 13, color: colors.muted }}>
              {isEn ? 'Explore complex clinical and care guidance through clean visual cards.' : 'Karmaşık klinik ve bakım bilgilerini sade, görsel şablonlarla keşfedin.'}
            </T>
          </View>

          {[
            {
              id: 'info-1',
              title: isEn ? 'Champion Mom Plate & Superfoods in Pregnancy' : 'Gebelikte Şampiyon Anne Tabağı & Süper Besinler',
              sub: isEn ? 'Optimal micronutrient balance accelerating baby brain, bone, and organ development across trimesters.' : 'Trimesterlar boyunca bebeğin beyin, kemik ve organ gelişimini hızlandıran optimal mikro besin dengesi.',
              tag: isEn ? 'NUTRITION & MICRONUTRIENTS' : 'BESLENME & MİKRO BESİN',
              asset: 'infographic_trimester_nutrition',
              fallback: 'blog_healthy_breakfast',
              tint: '#4A7C59',
              bullets: isEn
                ? ['Choline & DHA: Egg yolks and wild salmon', 'Folate & Iron: Dark leafy greens & lentils', 'Calcium: Probiotic yogurt and kefir']
                : ['Kolin & DHA: Yumurta sarısı ve somon', 'Folat & Demir: Koyu yeşil yapraklılar', 'Kalsiyum: Probiyotik yoğurt ve kefir']
            },
            {
              id: 'info-2',
              title: isEn ? 'Safe Baby Sleep Guide: ABC Rule' : 'Güvenli Bebek Uykusu Kılavuzu: ABC Kuralı',
              sub: isEn ? 'WHO-approved safe sleep guidelines reducing SIDS risk by up to 80%.' : 'Ani Bebek Ölümü Sendromu (SIDS) riskini %80 azaltan Dünya Sağlık Örgütü onaylı güvenli uyku rehberi.',
              tag: isEn ? 'NEWBORN SAFETY' : 'YENİDOĞAN GÜVENLİĞİ',
              asset: 'infographic_safe_sleep_abc',
              fallback: 'blog_sleeping_crib',
              tint: '#58638A',
              bullets: isEn
                ? ['A - Alone: Alone, no pillow, no toys', 'B - Back: Always on their back', 'C - Crib: In their own separate crib']
                : ['A - Alone: Yalnız, yastıksız ve oyuncaksız', 'B - Back: Her zaman sırtüstü yatış', 'C - Crib: Kendi bağımsız beşiğinde']
            },
            {
              id: 'info-3',
              title: isEn ? '3 Stages of Labor & The Body\'s Natural Transformation' : 'Doğumun 3 Aşaması ve Bedenin Doğal Dönüşümü',
              sub: isEn ? 'Anatomical stages from first contraction through delivery of placenta and skin-to-skin golden hour.' : 'İlk sancıdan plasentanın doğumuna ve ten tene temas saatine kadar doğum yolculuğunun anatomik evreleri.',
              tag: isEn ? 'BIRTH GUIDE' : 'DOĞUM REHBERİ',
              asset: 'infographic_labor_stages',
              fallback: 'blog_epidural_birth',
              tint: '#8C4A60',
              bullets: isEn
                ? ['Stage 1: Cervix effacement and 10 cm dilation', 'Stage 2: Descent of baby and pushing stage', 'Stage 3: Baby embrace & Golden Hour']
                : ['1. Evre: Rahim ağzının incelmesi ve 10 cm açılma', '2. Evre: Bebeğin inişi ve ıkınma aşaması', '3. Evre: Bebeğin kucaklaşması & Altın Saat']
            },
            {
              id: 'info-4',
              title: isEn ? 'Fetal Kick & Movement Tracking: Rule of 10' : 'Fetal Tekme ve Hareket Takibi: 10 Sayım Kuralı',
              sub: isEn ? 'Learn your baby\'s active rhythm, wake windows, and signals that warrant doctor notification.' : 'Bebeğinizin anne karnındaki ritmini, uyanıklık pencerelerini ve doktora bildirilmesi gereken sinyalleri öğrenin.',
              tag: isEn ? 'FETAL DEVELOPMENT' : 'FETAL GELİŞİM',
              asset: 'infographic_kick_counter_guide',
              fallback: 'blog_couple_bump',
              tint: '#9C6238',
              bullets: isEn
                ? ['10 clear movements within 2 hours after a meal', 'Blood flow peaks when lying on left side', 'Significant drops in movement require clinical consultation']
                : ['Yemekten sonra 2 saat içinde 10 net hareket', 'Sol yan yatışta kan akışı maksimuma çıkar', 'Harekette belirgin azalma hekime iletilmelidir']
            },
            {
              id: 'info-5',
              title: isEn ? 'Newborn Hunger & Crying Body Language' : 'Yenidoğan Açlık ve Ağlama Beden Dili',
              sub: isEn ? 'Decode subtle body signals before crying begins; keep feeding calm and peaceful.' : 'Bebek ağlamadan önceki ince beden dili işaretlerini çözün; beslenmeyi sakin ve stressiz tamamlayın.',
              tag: isEn ? 'BABY PSYCHOLOGY' : 'BEBEK PSİKOLOJİSİ',
              asset: 'infographic_baby_crying_cues',
              fallback: 'blog_baby_first_food',
              tint: '#6A5688',
              bullets: isEn
                ? ['Early Cue: Rooting, sucking fingers, turning head', 'Active Cue: Stretching, faster breathing, waving arms', 'Late Cue: Crying with red face (Soothe first)']
                : ['Erken Sinyal: Ağzı arama, parmak emme, başı çevirme', 'Aktif Sinyal: Gerinme, hızlı nefes, kollarını sallama', 'Geç Sinyal: Kırmızı yüzle ağlama (Önce sakinleştirin)']
            },
            {
              id: 'info-6',
              title: isEn ? 'Complete Birth & Hospital Bag Visual Checklist' : 'Eksiksiz Doğum ve Hastane Çantası Görsel Şablonu',
              sub: isEn ? 'Visual layout of essentials for mom, baby, and birth partner ready by week 32.' : '32. haftada hazır bulunması gereken anne, bebek ve refakatçi temel gereksinimlerinin görsel yerleşimi.',
              tag: isEn ? 'PREPARATION GUIDE' : 'HAZIRLIK REHBERİ',
              asset: 'infographic_hospital_checklist',
              fallback: 'blog_hospital_bag_pack',
              tint: '#785A48',
              bullets: isEn
                ? ['Mom: Front-opening gown, maternity pads, slippers', 'Baby: 3 sets of onesies, swaddles, diaper cream', 'Documents: ID, insurance, birth preferences plan']
                : ['Anne: Önden açılan gecelik, lohusa pedi, terlik', 'Bebek: 3 takım tulum, zıbın, müslin bez, pişik kremi', 'Evraklar: Kimlik, sigorta, doğum tercih planı']
            }
          ].map(info => {
            const imgSource = generatedAssets[info.asset] || generatedAssets[info.fallback] || generatedAssets['blog_pregnant_morning'];
            return (
              <Card key={info.id} style={{ padding: 0, overflow: 'hidden', borderRadius: 24, borderWidth: 1, borderColor: '#E8DCE4' }}>
                <View style={{ height: 210, width: '100%', backgroundColor: '#201525', overflow: 'hidden' }}>
                  {imgSource && (
                    <Image source={imgSource} style={es.fitImage} resizeMode="contain" />
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
        <FoodSafetyChecker lang={lang} />
      ) : (
        /* 3. TEMATİK DOSYALAR & KOLEKSİYONLAR */
        <View style={{ gap: 12 }}>
          <Section title={isEn ? "Thematic Collection Dossiers" : "Tematik Koleksiyon Dosyaları"} />
          {topicCollections.map(col => {
            const colImg = (col.art && (generatedAssets[col.art] || getAsset(col.art))) ||
                           (col.image && (generatedAssets[col.image] || getAsset(col.image))) ||
                           generatedAssets['blog_pregnant_morning'];
            const colTitle = isEn && col.titleEn ? col.titleEn : col.title;
            return (
              <Tap
                key={col.id}
                onPress={() => {
                  const match = articles.find(a => a.topic === col.id) || articles[0];
                  openArticle && openArticle(match);
                }}
                label={colTitle}
                style={[es.collectionCard, { backgroundColor: col.color }]}
              >
                {colImg && (
                  <Image source={colImg} style={es.colImg} resizeMode="contain" />
                )}
                <View style={es.colInfo}>
                  <T bold style={{ fontSize: 15, color: colors.ink, lineHeight: 21 }}>{colTitle}</T>
                  <T style={{ fontSize: 12, color: colors.muted, marginTop: 5 }}>{col.count} {isEn ? 'curated guides' : 'derlenmiş rehber'}</T>
                </View>
                <Icon name="chevron" size={18} color={colors.purple} />
              </Tap>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ─── EKRAN 15: MAKALE DETAY EKRANI (LUXURY MAGAZINE EDITORIAL FULLSCREEN READER) ────────
export function EditorialArticleScreen({ article, close, openArticle, toast, lang = 'tr' }) {
  const isEn = lang === 'en';
  const [playingAudio, setPlayingAudio] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [fontSizeStep, setFontSizeStep] = useState(0); // 0: 15px, 1: 17px, 2: 19px
  const [readProgress, setReadProgress] = useState(0);

  React.useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const defaultArticle = articles[0] || {
    title: '1. Trimester Sabah Bulantıları ve Yorgunlukla Başa Çıkma',
    titleEn: 'Coping with 1st Trimester Morning Sickness & Fatigue',
    doctor: 'Uzm. Dr. Elif Kaya · Kadın Hastalıkları ve Doğum Uzmanı',
    doctorEn: 'Spec. Dr. Elif Kaya · Ob-Gyn Specialist',
    time: '4 dk okuma',
    minutes: 4,
    audioDuration: '3:45',
    image: 'blog_pregnant_morning',
    keyPoints: [
      'Sabah yataktan kalkmadan önce tuzlu kraker atıştırmak mide asidini nötralize eder.',
      'Bebek bu haftalarda annenin depolarından beslendiği için kilo kaybı bebeğe zarar vermez.',
      'Günde 2000 ml sıvıyı yudum yudum ve yemek aralarında tüketmek bulantıyı azaltır.'
    ],
    keyPointsEn: [
      'Snacking on crackers before getting out of bed neutralizes stomach acid.',
      'Baby draws from maternal reserves in these weeks, so mild weight loss does not harm the fetus.',
      'Sipping 2000 ml of fluids between meals significantly reduces nausea.'
    ],
    sections: [
      {
        title: 'Neden Sabahları Daha Şiddetli?',
        titleEn: 'Why Is It More Intense in the Morning?',
        text: 'Gebelikte hızla yükselen insan koryonik gonadotropini (hCG) ve östrojen hormonları, sindirim sisteminin yavaşlamasına ve mide boşalmasının gecikmesine yol açar.',
        textEn: 'Rapidly rising hCG and estrogen slow digestive motility and delay gastric emptying, causing morning acid accumulation.',
        tip: '💡 Baş ucunuzda tuzlu galeta veya leblebi bulundurun; gözünüzü açtığınızda ayağa kalkmadan bir iki lokma atıştırıp 10 dakika uzanın.',
        tipEn: '💡 Keep crackers by your bedside; snack on a few bites before rising and rest for 10 minutes.'
      }
    ]
  };

  const a = getLocalizedArticle(article || defaultArticle, lang);
  const coverAsset = (a.image && (generatedAssets[a.image] || getAsset(a.image))) || generatedAssets['blog_sleeping_crib'];
  const readingTime = isEn ? `${a.minutes || 4} min read` : (a.time || (a.minutes ? `${a.minutes} dk okuma` : '4 dk okuma'));
  const rawDoctor = isEn ? (a.doctorEn || a.doctor) : a.doctor;
  const doctorName = rawDoctor ? (isEn ? `Source: ${rawDoctor}` : `Kaynak: ${rawDoctor}`) : (isEn ? 'Momora editorial archive · fact-checked' : 'Momora editoryal dosyası · kaynak kontrolü');
  const relatedArticles = articles.filter(other => other.id !== a.id && other.topic === a.topic).slice(0, 3);

  const displayTitle = isEn ? (a.titleEn || a.title) : a.title;
  const displaySubtitle = isEn ? (a.subtitleEn || a.subtitle) : a.subtitle;
  const displayKeyPoints = isEn ? (a.keyPointsEn || a.keyPoints) : a.keyPoints;

  const fontSizes = [
    { p: 15, lh: 24, h: 17 },
    { p: 17, lh: 27, h: 19 },
    { p: 19, lh: 30, h: 21 },
  ];
  const currentFont = fontSizes[fontSizeStep];

  return (
    <View style={es.fullscreenReaderRoot}>
      {/* ─── 1. STICKY TOP APP BAR (GERİ, İLERLEME ÇUBUĞU, FONT, FAVORİ) ─── */}
      <View style={es.readerTopBar}>
        {/* Okuma İlerleme Çizgisi (%0 -> %100) */}
        <View style={es.progressBarTrack}>
          <View style={[es.progressBarFill, { width: `${readProgress}%` }]} />
        </View>

        <View style={es.readerTopBarRow}>
          <Tap
            onPress={() => {
              stopSpeech();
              close && close();
            }}
            label={isEn ? "Back" : "Geri"}
            style={es.readerBackBtn}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M12 19l-7-7 7-7" stroke={colors.ink} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <T bold style={{ fontSize: 13.5, color: colors.ink }}>{isEn ? 'Back' : 'Geri'}</T>
          </Tap>

          <View style={es.readerTopCenter}>
            <T bold numberOfLines={1} style={{ fontSize: 11, color: colors.purple, letterSpacing: 0.6 }}>
              {isEn ? (a.categoryNameEn || 'EDITORIAL GUIDE') : (a.categoryName ? a.categoryName.toLocaleUpperCase('tr') : 'EDİTORYAL REHBER')}
            </T>
            <T numberOfLines={1} style={{ fontSize: 10.5, color: colors.muted, marginTop: 1 }}>
              %{Math.round(readProgress)} {isEn ? 'read' : 'okundu'}
            </T>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {/* Aa Yazı Boyutu Butonu */}
            <Tap
              onPress={() => {
                const next = (fontSizeStep + 1) % 3;
                setFontSizeStep(next);
                toast && toast(
                  next === 0
                    ? (isEn ? 'Font: Standard' : 'Yazı Boyutu: Standart')
                    : next === 1
                    ? (isEn ? 'Font: Medium' : 'Yazı Boyutu: Orta')
                    : (isEn ? 'Font: Large' : 'Yazı Boyutu: Büyük')
                );
              }}
              label="Font Size"
              style={es.readerActionBtn}
            >
              <T bold style={{ fontSize: fontSizeStep === 0 ? 12 : fontSizeStep === 1 ? 14 : 16, color: colors.purple }}>
                Aa
              </T>
            </Tap>

            {/* Favoriye Ekle / Kaydet */}
            <Tap
              onPress={() => {
                setBookmarked(!bookmarked);
                toast && toast(bookmarked ? (isEn ? 'Removed from saved' : 'Kaydedilenlerden kaldırıldı') : (isEn ? 'Saved to reading list 🔖' : 'Okuma listene kaydedildi 🔖'));
              }}
              label="Bookmark"
              style={es.readerActionBtn}
            >
              <Icon name="book" size={17} color={bookmarked ? colors.purple : colors.muted} />
            </Tap>
          </View>
        </View>
      </View>

      {/* ─── 2. SÜRÜKLEYİCİ MAKALE İÇERİĞİ (SCROLL VIEW) ─── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={es.readerScrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
          const maxScroll = Math.max(1, contentSize.height - layoutMeasurement.height);
          const percent = Math.min(100, Math.max(0, (contentOffset.y / maxScroll) * 100));
          setReadProgress(percent);
        }}
      >
        {/* Tam Genişlikte Kapak Fotoğrafı (Sıfır Kırpılma, Doğal Oran) */}
        <View style={es.fullscreenCoverBox}>
          {coverAsset ? (
            <Image source={coverAsset} style={es.fitImage} resizeMode="contain" />
          ) : (
            <LinearGradient colors={['#9A779A', '#664566']} style={StyleSheet.absoluteFill} />
          )}
        </View>

        {/* Porselen Beyaz Editoryal Başlık Bloğu */}
        <View style={es.readerHeaderBody}>
          <View style={es.readerBadgeRow}>
            <View style={es.readerCatBadge}>
              <T bold style={{ fontSize: 10, color: colors.purple, letterSpacing: 0.8 }}>
                {isEn ? (a.categoryNameEn || a.categoryName || 'EDITORIAL GUIDE') : (a.categoryName ? a.categoryName.toLocaleUpperCase('tr') : 'EDİTORYAL REHBER')}
              </T>
            </View>
            <View style={es.readerTimeBadge}>
              <Icon name="clock" size={12} color={colors.muted} />
              <T style={{ fontSize: 11.5, color: colors.muted }}>{readingTime}</T>
            </View>
          </View>

          <T bold style={es.readerMainTitle}>{displayTitle}</T>
          {displaySubtitle ? <T style={es.readerMainSub}>{displaySubtitle}</T> : null}
        </View>

        {/* İçerik Kartları & Gövde */}
        <View style={es.readerContentWrap}>
          {/* Kaynak Notu & Doktor Bilgisi */}
          <Card style={es.doctorCard}>
            <View style={es.docAvatar}>
              <Icon name="book" size={20} color={colors.purple} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <T bold style={{ fontSize: 13.5, color: colors.ink }}>{isEn ? 'Editorial Source Note' : 'Editoryal Kaynak Notu'}</T>
                <T style={{ fontSize: 12, color: colors.purple }}>✓</T>
              </View>
              <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 2 }}>{doctorName}</T>
            </View>
          </Card>

          {/* Momora Audio: Sesli Dinleme */}
          <Card style={es.audioBar}>
            <Tap
              onPress={() => {
                if (playingAudio) {
                  stopSpeech();
                  setPlayingAudio(false);
                  toast && toast(isEn ? 'Audio narration paused' : 'Sesli okuma durduruldu');
                } else {
                  const fullSpeechText = compileArticleSpeechText(a, lang);
                  setPlayingAudio(true);
                  speakText(fullSpeechText, {
                    lang,
                    rate: 0.92,
                    pitch: 1.0,
                    onStart: () => setPlayingAudio(true),
                    onDone: () => setPlayingAudio(false),
                    onError: () => setPlayingAudio(false),
                  });
                  toast && toast(isEn ? '🎙️ Reading article aloud...' : '🎙️ Makale sesli okunuyor...');
                }
              }}
              label={isEn ? (playingAudio ? "Pause narration" : "Listen to article") : (playingAudio ? "Sesli okumayı durdur" : "Yazıyı sesli dinle")}
              style={es.audioPlayBtn}
            >
              <T style={{ fontSize: 15 }}>{playingAudio ? '⏸️' : '▶️'}</T>
            </Tap>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <T bold style={{ fontSize: 13, color: colors.ink }}>
                {isEn ? 'Momora Text-to-Speech' : 'Momora Sesli Dinleme'}
              </T>
              <T style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                {playingAudio
                  ? (isEn ? 'Reading article aloud...' : 'Yazı seslendiriliyor...')
                  : `${a.audioDuration || (a.minutes ? `${a.minutes}:00` : '3:45')} · ${isEn ? 'AI Narrator' : 'Yapay Zeka Seslendirme'}`}
              </T>
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
              onPress={() => toast && toast(isEn ? 'Article link copied 🔗' : 'Makale bağlantısı kopyalandı 🔗')}
              label={isEn ? "Share" : "Paylaş"}
              style={{ padding: 8 }}
            >
              <Icon name="heart" size={19} color={colors.purple} />
            </Tap>
          </Card>

          {/* Özet: Önemli Noktalar Kartı */}
          {displayKeyPoints && displayKeyPoints.length > 0 && (
            <Card style={es.keyPointsCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <Icon name="sparkle" size={16} color={colors.purple} />
                <T bold style={{ fontSize: 13.5, color: colors.purple, letterSpacing: 0.5 }}>
                  {isEn ? 'IN BRIEF: KEY TAKEAWAYS' : 'ÖZETLE: ÖNE ÇIKAN NOKTALAR'}
                </T>
              </View>
              {displayKeyPoints.map((kp, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 6 }}>
                  <T style={{ color: colors.purple, fontSize: 14, marginTop: 1 }}>•</T>
                  <T style={{ fontSize: currentFont.p - 1, color: colors.ink, lineHeight: currentFont.lh - 3, flex: 1 }}>{kp}</T>
                </View>
              ))}
            </Card>
          )}

          {/* Makale Bölümleri & Geniş Görseller (16:9) */}
          <View style={{ gap: 16 }}>
            {a.sections ? (
              a.sections.map((sec, idx) => {
                const inlineAsset = sec.image && (generatedAssets[sec.image] || getAsset(sec.image));
                const secTitle = isEn ? (sec.titleEn || sec.title) : sec.title;
                const secText = isEn ? (sec.textEn || sec.text) : sec.text;
                const secTip = isEn ? (sec.tipEn || sec.tip) : sec.tip;
                const secCaption = isEn ? (sec.captionEn || sec.caption || `${secTitle} visual guide`) : (sec.caption || `${secTitle} görsel rehberi`);
                return (
                  <Card key={idx} style={{ padding: 18 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <View style={es.sectionNumberBadge}>
                        <T bold style={{ fontSize: 11, color: colors.purple }}>{String(idx + 1).padStart(2, '0')}</T>
                      </View>
                      <T bold style={{ fontSize: currentFont.h, color: colors.ink, lineHeight: currentFont.h * 1.35, flex: 1 }}>
                        {secTitle}
                      </T>
                    </View>

                    {inlineAsset && (
                      <View style={es.inlineFigureBox}>
                        <View style={es.inlineImgFrame}>
                          <Image source={inlineAsset} style={es.fitImage} resizeMode="contain" />
                        </View>
                        <View style={es.inlineCaptionRow}>
                          <Icon name="search" size={12} color="#7E6D82" style={{ marginRight: 5 }} />
                          <T style={es.inlineCaptionText}>
                            {secCaption}
                          </T>
                        </View>
                      </View>
                    )}

                    <T style={[es.articleP, { fontSize: currentFont.p, lineHeight: currentFont.lh }]}>
                      {secText}
                    </T>

                    {secTip && (
                      <View style={[
                        es.clinicTipBox,
                        secTip.includes('⚠️') && es.clinicWarningBox
                      ]}>
                        <T style={[
                          es.clinicTipText,
                          secTip.includes('⚠️') && { color: '#99352A' }
                        ]}>
                          {secTip}
                        </T>
                      </View>
                    )}
                  </Card>
                );
              })
            ) : a.paragraphs ? (
              a.paragraphs.map((p, idx) => (
                <Card key={idx} style={{ padding: 16 }}>
                  <T style={[es.articleP, { fontSize: currentFont.p, lineHeight: currentFont.lh }]}>{p}</T>
                </Card>
              ))
            ) : null}
          </View>

          {/* Benzer Rehberler */}
          {relatedArticles.length > 0 && (
            <View style={{ marginTop: 14, gap: 11 }}>
              <Section title={isEn ? "Related Guides" : "Konuyla İlgili Diğer Rehberler"} />
              {relatedArticles.map(rel => (
                <Tap
                  key={rel.id}
                  onPress={() => {
                    if (openArticle) {
                      openArticle(rel);
                    } else {
                      toast && toast(isEn ? `Opening "${rel.title}"...` : `"${rel.title}" açılıyor...`);
                    }
                  }}
                  label={rel.title}
                  style={es.relatedCard}
                >
                  {generatedAssets[rel.image] && (
                    <Image source={generatedAssets[rel.image]} style={es.relatedImg} resizeMode="contain" />
                  )}
                  <View style={{ flex: 1 }}>
                    <T bold numberOfLines={1} style={{ fontSize: 13.5, color: colors.ink }}>{rel.title}</T>
                    <T style={{ fontSize: 11.5, color: colors.muted, marginTop: 4 }}>⏱️ {rel.minutes} {isEn ? 'min read' : 'dk okuma'}</T>
                  </View>
                  <Icon name="chevron" size={16} color={colors.purple} />
                </Tap>
              ))}
            </View>
          )}

          {/* 7. Okuma Tamamlama & Kapatma Kartı */}
          <Card style={es.completionCard}>
            <T style={{ fontSize: 26 }}>🌸</T>
            <T bold style={{ fontSize: 16.5, color: colors.ink, marginTop: 6 }}>
              {isEn ? 'You finished this guide!' : 'Bu rehberi tamamladın!'}
            </T>
            <T style={{ fontSize: 12.5, color: colors.muted, textAlign: 'center', marginTop: 4, lineHeight: 18 }}>
              {isEn ? 'Gentle daily knowledge brings confidence throughout pregnancy.' : 'Bilgi, hamilelik yolculuğuna sakinlik ve güven katar.'}
            </T>
            <Tap
              onPress={() => {
                stopSpeech();
                close && close();
              }}
              style={es.backToExploreBtn}
            >
              <T bold style={{ fontSize: 14, color: 'white' }}>
                {isEn ? '← Return to Explore & Magazine' : '← Keşfet & Magazin’e Dön'}
              </T>
            </Tap>
          </Card>
        </View>
      </ScrollView>
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
  colImg: { width: 68, height: 68, borderRadius: 14, marginRight: 14, backgroundColor: '#F6F0F3' },
  colInfo: { flex: 1 },
  // Hub Tabs
  hubTabRow: { flexDirection: 'row', backgroundColor: '#EFE6F3', borderRadius: 16, padding: 3, gap: 4 },
  hubTabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  hubTabBtnActive: { backgroundColor: colors.purple },
  hubTabText: { fontSize: 11, color: '#795B82' },
  // Layout Switcher styles
  layoutToggleBox: { flexDirection: 'row', backgroundColor: '#EDE3EE', borderRadius: 12, padding: 2, gap: 2 },
  layoutToggleBtn: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  layoutToggleBtnActive: { backgroundColor: '#FFFFFF', ...shadow },
  layoutToggleText: { fontSize: 11, color: '#7A6780' },
  layoutToggleTextActive: { color: colors.purple },
  libraryRitualStrip: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFBF7', borderWidth: 1, borderColor: '#E7DAD1', borderRadius: 17, padding: 12 },
  libraryRitualIcon: { width: 34, height: 34, borderRadius: 14, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  fitImage: { width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', alignSelf: 'center' },
  coverImage: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', alignSelf: 'center' },
  // Featured Lead Story Hero (Full uncropped 16:9 photo + editorial white body)
  featuredHeroCard: { backgroundColor: '#FFFFFF', borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: '#ECE2EC', ...shadow },
  featuredHeroImgBox: { width: '100%', aspectRatio: 640 / 349, backgroundColor: '#F6F0F3', position: 'relative', overflow: 'hidden' },
  featuredHeroBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255, 255, 255, 0.94)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.6)', ...shadow },
  featuredHeroBody: { padding: 16 },
  featuredCatPill: { backgroundColor: '#F4EDF6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  featuredHeroTitle: { fontSize: 17, color: '#241828', lineHeight: 23 },
  featuredHeroSub: { fontSize: 12.5, color: '#5E5466', marginTop: 4, lineHeight: 18 },
  featuredHeroFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderColor: '#F5EDF6' },
  featuredHeroAuthor: { fontSize: 11.5, color: colors.muted, flex: 1, marginRight: 8 },
  featuredHeroReadBtn: { backgroundColor: '#F4EDF6', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 10 },
  // Blog Post Card styles (Magazine layout - Full uncropped 16:9 photo)
  blogPostCard: { backgroundColor: '#FFFFFF', borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: '#ECE2EC', ...shadow },
  blogPostImgBox: { width: '100%', aspectRatio: 640 / 349, backgroundColor: '#F6F0F3', position: 'relative', overflow: 'hidden' },
  blogPostCategoryBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255, 255, 255, 0.94)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.6)', ...shadow },
  blogPostTimeTag: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0, 0, 0, 0.58)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
  blogPostTitle: { fontSize: 16, color: '#241828', lineHeight: 22 },
  blogPostSub: { fontSize: 12.5, color: '#5E5466', marginTop: 4, lineHeight: 18 },
  blogPostDocRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderColor: '#F5EDF6' },
  // Compact Article Card styles (Digest layout)
  compactArticleCard: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#ECE2EC', gap: 14, ...shadow },
  compactImgBox: { width: 84, height: 84, borderRadius: 14, overflow: 'hidden', backgroundColor: '#F6F0F3', position: 'relative', borderWidth: 1, borderColor: '#EAE0EB' },
  compactCategoryBadge: { backgroundColor: '#F4EDF6', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  compactArticleTitle: { fontSize: 14, color: '#241828', lineHeight: 19 },
  compactArticleSub: { fontSize: 11.5, color: '#665D6E', marginTop: 3 },
  // FAQ styles
  faqIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F0E5F3', alignItems: 'center', justifyContent: 'center' },
  faqAnswerBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#EDE2EE' },
  faqAnswerText: { fontSize: 13.5, lineHeight: 22, color: '#443A48' },
  faqTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  faqTag: { backgroundColor: '#F5EDF7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  // Editorial Article Reader styles
  articleCoverBox: { width: '100%', aspectRatio: 640 / 349, backgroundColor: '#F6F0F3', position: 'relative', overflow: 'hidden' },
  coverMeta: { gap: 6 },
  coverBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  categoryPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.94)' },
  readingTimePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(0, 0, 0, 0.58)' },
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
  relatedImg: { width: 52, height: 52, borderRadius: 12, backgroundColor: '#F6F0F3' },
  // Fullscreen Magazine Reader Styles
  fullscreenReaderRoot: { flex: 1, backgroundColor: colors.canvas },
  readerTopBar: {
    backgroundColor: '#FAF6F4',
    borderBottomWidth: 1,
    borderColor: '#EBE2DE',
    zIndex: 10,
    elevation: 4,
  },
  progressBarTrack: { height: 3, width: '100%', backgroundColor: '#EFE5EB' },
  progressBarFill: { height: 3, backgroundColor: colors.purple },
  readerTopBarRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  readerBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F3ECE9',
  },
  readerTopCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  readerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3ECE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readerScrollContent: { paddingBottom: 48 },
  fullscreenCoverBox: {
    width: '100%',
    aspectRatio: 640 / 349,
    backgroundColor: '#F4ECEF',
    overflow: 'hidden',
  },
  readerHeaderBody: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
  },
  readerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  readerCatBadge: {
    backgroundColor: '#F4EDF6',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  readerTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0ECE8',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  readerMainTitle: {
    fontSize: 22,
    color: '#25172A',
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  readerMainSub: {
    fontSize: 13.5,
    color: '#655A6B',
    marginTop: 6,
    lineHeight: 20,
  },
  readerContentWrap: {
    paddingHorizontal: 18,
    gap: 14,
    marginTop: 8,
  },
  completionCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
    marginTop: 10,
    backgroundColor: '#FBF6FA',
    borderWidth: 1,
    borderColor: '#EFE3EE',
  },
  backToExploreBtn: {
    backgroundColor: colors.purple,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
});
