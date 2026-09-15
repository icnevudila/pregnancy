import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Modal } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, ScreenHero, InfoNote, MetricCard } from './ui';
import { saveTrackingEvent } from './backendSync';

export const SOLID_FOODS_100 = [
  // 1. Sebzeler (20 adet)
  { id: 'avocado', cat: 'veggies', nameTr: 'Avokado', nameEn: 'Avocado', icon: '🥑', allergen: false, month: '6+' },
  { id: 'sweet_potato', cat: 'veggies', nameTr: 'Tatlı Patates', nameEn: 'Sweet Potato', icon: '🍠', allergen: false, month: '6+' },
  { id: 'carrot', cat: 'veggies', nameTr: 'Havuç (Buharda)', nameEn: 'Carrot (Steamed)', icon: '🥕', allergen: false, month: '6+' },
  { id: 'zucchini', cat: 'veggies', nameTr: 'Balkabağı / Kabak', nameEn: 'Zucchini / Pumpkin', icon: '🥒', allergen: false, month: '6+' },
  { id: 'broccoli', cat: 'veggies', nameTr: 'Brokoli', nameEn: 'Broccoli', icon: '🥦', allergen: false, month: '6+' },
  { id: 'pumpkin', cat: 'veggies', nameTr: 'Balkabağı', nameEn: 'Butternut Squash', icon: '🎃', allergen: false, month: '6+' },
  { id: 'peas', cat: 'veggies', nameTr: 'Bezelye Püresi', nameEn: 'Green Peas', icon: '🟢', allergen: false, month: '6+' },
  { id: 'cauliflower', cat: 'veggies', nameTr: 'Karnabahar', nameEn: 'Cauliflower', icon: '🥣', allergen: false, month: '6+' },
  { id: 'spinach', cat: 'veggies', nameTr: 'Ispanak', nameEn: 'Spinach', icon: '🥬', allergen: false, month: '6+' },
  { id: 'beetroot', cat: 'veggies', nameTr: 'Kırmızı Pancar', nameEn: 'Beetroot', icon: '🟣', allergen: false, month: '7+' },
  { id: 'green_beans', cat: 'veggies', nameTr: 'Taze Fasulye', nameEn: 'Green Beans', icon: '🌱', allergen: false, month: '7+' },
  { id: 'bell_pepper', cat: 'veggies', nameTr: 'Kırmızı Kapya Biber', nameEn: 'Red Bell Pepper', icon: '🫑', allergen: false, month: '7+' },
  { id: 'eggplant', cat: 'veggies', nameTr: 'Fırınlanmış Patlıcan', nameEn: 'Eggplant (Roasted)', icon: '🍆', allergen: false, month: '8+' },
  { id: 'artichoke', cat: 'veggies', nameTr: 'Enginar', nameEn: 'Artichoke', icon: '🌿', allergen: false, month: '8+' },
  { id: 'asparagus', cat: 'veggies', nameTr: 'Kuşkonmaz', nameEn: 'Asparagus', icon: '🎋', allergen: false, month: '8+' },
  { id: 'tomato', cat: 'veggies', nameTr: 'Pişmiş Domates', nameEn: 'Cooked Tomato', icon: '🍅', allergen: false, month: '8+' },
  { id: 'celery', cat: 'veggies', nameTr: 'Kereviz', nameEn: 'Celery Root', icon: '🥔', allergen: false, month: '8+' },
  { id: 'leek', cat: 'veggies', nameTr: 'Pırasa', nameEn: 'Leek', icon: '🧅', allergen: false, month: '7+' },
  { id: 'cucumber', cat: 'veggies', nameTr: 'Salatalık (Soyulmuş)', nameEn: 'Cucumber Sticks', icon: '🥒', allergen: false, month: '7+' },
  { id: 'sweet_corn', cat: 'veggies', nameTr: 'Mısır Püresi', nameEn: 'Sweet Corn Puree', icon: '🌽', allergen: false, month: '8+' },

  // 2. Meyveler (20 adet)
  { id: 'banana', cat: 'fruits', nameTr: 'Muz', nameEn: 'Banana', icon: '🍌', allergen: false, month: '6+' },
  { id: 'apple', cat: 'fruits', nameTr: 'Elma (Buharda)', nameEn: 'Apple (Steamed)', icon: '🍎', allergen: false, month: '6+' },
  { id: 'pear', cat: 'fruits', nameTr: 'Armut', nameEn: 'Pear', icon: '🍐', allergen: false, month: '6+' },
  { id: 'peach', cat: 'fruits', nameTr: 'Şeftali', nameEn: 'Peach', icon: '🍑', allergen: false, month: '6+' },
  { id: 'apricot', cat: 'fruits', nameTr: 'Kayısı / Gün Kurusu', nameEn: 'Apricot', icon: '🟠', allergen: false, month: '6+' },
  { id: 'plum', cat: 'fruits', nameTr: 'Mürdüm Eriği', nameEn: 'Plum / Prune', icon: '🟣', allergen: false, month: '6+' },
  { id: 'blueberry', cat: 'fruits', nameTr: 'Yaban Mersini (Ezilmiş)', nameEn: 'Blueberries (Smashed)', icon: '🫐', allergen: false, month: '7+' },
  { id: 'mango', cat: 'fruits', nameTr: 'Mango', nameEn: 'Mango', icon: '🥭', allergen: false, month: '6+' },
  { id: 'watermelon', cat: 'fruits', nameTr: 'Karpuz (Çekirdeksiz)', nameEn: 'Watermelon (Seedless)', icon: '🍉', allergen: false, month: '7+' },
  { id: 'melon', cat: 'fruits', nameTr: 'Kavun', nameEn: 'Melon', icon: '🍈', allergen: false, month: '7+' },
  { id: 'strawberry', cat: 'fruits', nameTr: 'Çilek (Gözlemli)', nameEn: 'Strawberry', icon: '🍓', allergen: true, month: '8+' },
  { id: 'fig', cat: 'fruits', nameTr: 'Taze İncir', nameEn: 'Fresh Fig', icon: '🟤', allergen: false, month: '8+' },
  { id: 'grape', cat: 'fruits', nameTr: 'Üzüm (Uzunlamasına 4e bölünmüş!)', nameEn: 'Grapes (Quartered lengthways!)', icon: '🍇', allergen: false, month: '9+' },
  { id: 'cherry', cat: 'fruits', nameTr: 'Kiraz (Çekirdeksiz)', nameEn: 'Cherries (Pitted)', icon: '🍒', allergen: false, month: '8+' },
  { id: 'papaya', cat: 'fruits', nameTr: 'Papaya', nameEn: 'Papaya', icon: '🟡', allergen: false, month: '7+' },
  { id: 'orange', cat: 'fruits', nameTr: 'Portakal / Mandalina', nameEn: 'Orange / Clementine', icon: '🍊', allergen: false, month: '9+' },
  { id: 'kiwi', cat: 'fruits', nameTr: 'Kivi', nameEn: 'Kiwi', icon: '🥝', allergen: true, month: '9+' },
  { id: 'raspberry', cat: 'fruits', nameTr: 'Ahududu', nameEn: 'Raspberry', icon: '🔴', allergen: false, month: '8+' },
  { id: 'pomegranate', cat: 'fruits', nameTr: 'Nar Suyu (Tadım)', nameEn: 'Pomegranate Juice', icon: '🍷', allergen: false, month: '9+' },
  { id: 'pineapple', cat: 'fruits', nameTr: 'Ananas', nameEn: 'Pineapple', icon: '🍍', allergen: false, month: '9+' },

  // 3. Protein & Demir (20 adet)
  { id: 'egg_yolk', cat: 'protein', nameTr: 'Yumurta Sarısı (İyi Pişmiş)', nameEn: 'Egg Yolk (Hard-boiled)', icon: '🥚', allergen: true, month: '6+' },
  { id: 'lamb_mince', cat: 'protein', nameTr: 'Kuzu Kıyma (Çift Çekilmiş)', nameEn: 'Minced Lamb (Finely ground)', icon: '🥩', allergen: false, month: '7+' },
  { id: 'salmon', cat: 'protein', nameTr: 'Somon Balığı (Kılçıksız)', nameEn: 'Wild Salmon (Deboned)', icon: '🐟', allergen: true, month: '7+' },
  { id: 'chicken', cat: 'protein', nameTr: 'Organik Tavuk / Hindi But', nameEn: 'Organic Chicken / Turkey', icon: '🍗', allergen: false, month: '7+' },
  { id: 'bone_broth', cat: 'protein', nameTr: 'İlikli Kemik Suyu', nameEn: 'Bone Broth', icon: '🍲', allergen: false, month: '6+' },
  { id: 'red_lentils', cat: 'protein', nameTr: 'Kırmızı Mercimek', nameEn: 'Red Lentils', icon: '🟤', allergen: false, month: '6+' },
  { id: 'green_lentils', cat: 'protein', nameTr: 'Yeşil Mercimek', nameEn: 'Green Lentils', icon: '🟢', allergen: false, month: '7+' },
  { id: 'lamb_liver', cat: 'protein', nameTr: 'Kuzu Karaciğer (Haftada 1)', nameEn: 'Lamb Liver (Once weekly)', icon: '🫀', allergen: false, month: '8+' },
  { id: 'tuna', cat: 'protein', nameTr: 'Az Cıvalı Beyaz Balık (Levrek)', nameEn: 'Sea Bass / Low-mercury Fish', icon: '🐠', allergen: true, month: '8+' },
  { id: 'beef', cat: 'protein', nameTr: 'Dana İncik / Haşlama', nameEn: 'Slow-cooked Beef', icon: '🍖', allergen: false, month: '8+' },
  { id: 'chickpeas', cat: 'protein', nameTr: 'Nohut (Kabuksuz ezilmiş)', nameEn: 'Chickpeas (Skinned/mashed)', icon: '🟡', allergen: false, month: '8+' },
  { id: 'kidney_beans', cat: 'protein', nameTr: 'Barbunya', nameEn: 'Kidney Beans', icon: '🫘', allergen: false, month: '8+' },
  { id: 'tofu', cat: 'protein', nameTr: 'Soya / Tofu', nameEn: 'Tofu', icon: '🧊', allergen: true, month: '8+' },
  { id: 'egg_white', cat: 'protein', nameTr: 'Yumurta Beyazı (Pişmiş)', nameEn: 'Egg White (Well-cooked)', icon: '🍳', allergen: true, month: '8+' },
  { id: 'quinoa', cat: 'protein', nameTr: 'Kinoa', nameEn: 'Quinoa', icon: '🌾', allergen: false, month: '6+' },
  { id: 'turkey', cat: 'protein', nameTr: 'Hindi Göğsü', nameEn: 'Turkey Breast', icon: '🦃', allergen: false, month: '7+' },
  { id: 'sardines', cat: 'protein', nameTr: 'Sardalya (Kılçıksız)', nameEn: 'Sardines (Fresh)', icon: '🎣', allergen: true, month: '9+' },
  { id: 'peas_protein', cat: 'protein', nameTr: 'Kuru Bezelye', nameEn: 'Split Peas', icon: '🟢', allergen: false, month: '7+' },
  { id: 'chia', cat: 'protein', nameTr: 'Chia Tohumu (Islatılmış)', nameEn: 'Soaked Chia Seeds', icon: '⚫', allergen: false, month: '8+' },
  { id: 'flaxseed', cat: 'protein', nameTr: 'Öğütülmüş Keten Tohumu', nameEn: 'Ground Flaxseed', icon: '🌰', allergen: false, month: '8+' },

  // 4. Tahıllar & Karbonhidratlar (15 adet)
  { id: 'rolled_oats', cat: 'grains', nameTr: 'Yulaf Ezmesi / Yulaf Unu', nameEn: 'Rolled Oats / Oatmeal', icon: '🥣', allergen: false, month: '6+' },
  { id: 'semolina', cat: 'grains', nameTr: 'Bebek İrmiği', nameEn: 'Baby Semolina', icon: '🌾', allergen: false, month: '6+' },
  { id: 'wheat_germ', cat: 'grains', nameTr: 'Buğday Ruşeymi', nameEn: 'Wheat Germ', icon: '🌱', allergen: false, month: '7+' },
  { id: 'rice', cat: 'grains', nameTr: 'Esmer Pirinç / Pirinç Unu', nameEn: 'Brown Rice Puree', icon: '🍚', allergen: false, month: '6+' },
  { id: 'buckwheat', cat: 'grains', nameTr: 'Karabuğday (Greçka)', nameEn: 'Buckwheat', icon: '🌿', allergen: false, month: '7+' },
  { id: 'bulgur', cat: 'grains', nameTr: 'İnce Siyez Bulguru', nameEn: 'Cracked Einkorn Bulgur', icon: '🌾', allergen: false, month: '8+' },
  { id: 'whole_wheat_bread', cat: 'grains', nameTr: 'Tam Buğday Ekmeği İçi', nameEn: 'Whole Wheat Bread Crust', icon: '🍞', allergen: true, month: '7+' },
  { id: 'pasta', cat: 'grains', nameTr: 'Bebek Makarnası (Burgu)', nameEn: 'Spiral Fusilli Pasta', icon: '🍝', allergen: true, month: '8+' },
  { id: 'millet', cat: 'grains', nameTr: 'Darı / Darı Lapası', nameEn: 'Millet Porridge', icon: '🟡', allergen: false, month: '7+' },
  { id: 'couscous', cat: 'grains', nameTr: 'Kuskus', nameEn: 'Couscous', icon: '🍲', allergen: false, month: '8+' },
  { id: 'barley', cat: 'grains', nameTr: 'Arpa Şehriye', nameEn: 'Pearled Barley', icon: '🌾', allergen: false, month: '8+' },
  { id: 'polenta', cat: 'grains', nameTr: 'Polenta (Mısır İrmiği)', nameEn: 'Polenta', icon: '🌽', allergen: false, month: '7+' },
  { id: 'rye', cat: 'grains', nameTr: 'Çavdar Ekmeği', nameEn: 'Rye Bread', icon: '🥖', allergen: true, month: '8+' },
  { id: 'tarhana', cat: 'grains', nameTr: 'Ev Yapımı Bebek Tarhanası', nameEn: 'Fermented Tarhana Soup', icon: '🥣', allergen: false, month: '7+' },
  { id: 'pancake_baby', cat: 'grains', nameTr: 'Muzlu Bebek Pankeki', nameEn: 'Banana Oat Pancake', icon: '🥞', allergen: false, month: '8+' },

  // 5. Süt Ürünleri & Sağlıklı Yağlar (10 adet)
  { id: 'yogurt', cat: 'dairy', nameTr: 'Ev Yapımı Probiyotik Yoğurt', nameEn: 'Homemade Whole Milk Yogurt', icon: '🥛', allergen: true, month: '6+' },
  { id: 'lor_cheese', cat: 'dairy', nameTr: 'Tuzsuz Taze Lor Peyniri', nameEn: 'Unsalted Ricotta / Lor', icon: '🧀', allergen: true, month: '6+' },
  { id: 'labneh', cat: 'dairy', nameTr: 'Tuzsuz Bebek Labnesi', nameEn: 'Baby Labneh Cheese', icon: '🧈', allergen: true, month: '6+' },
  { id: 'kefir', cat: 'dairy', nameTr: 'Ev Kefiri', nameEn: 'Kefir', icon: '🍶', allergen: true, month: '7+' },
  { id: 'olive_oil', cat: 'dairy', nameTr: 'Soğuk Sıkım Sızma Zeytinyağı', nameEn: 'Extra Virgin Olive Oil', icon: '🫒', allergen: false, month: '6+' },
  { id: 'butter', cat: 'dairy', nameTr: 'Tuzsuz Sade Tereyağı', nameEn: 'Grass-fed Unsalted Butter', icon: '🧈', allergen: true, month: '7+' },
  { id: 'goat_cheese', cat: 'dairy', nameTr: 'Tuzsuz Keçi Peyniri', nameEn: 'Mild Goat Cheese', icon: '🧀', allergen: true, month: '8+' },
  { id: 'avocado_oil', cat: 'dairy', nameTr: 'Avokado Yağı', nameEn: 'Avocado Oil', icon: '🥑', allergen: false, month: '7+' },
  { id: 'cottage_cheese', cat: 'dairy', nameTr: 'Çökelek (Tuzsuz)', nameEn: 'Cottage Cheese', icon: '🥣', allergen: true, month: '8+' },
  { id: 'ghee', cat: 'dairy', nameTr: 'Sade Yağ (Ghee)', nameEn: 'Clarified Butter (Ghee)', icon: '🧈', allergen: false, month: '7+' },

  // 6. Büyük Alerjenler (15 adet)
  { id: 'peanut_butter', cat: 'allergens', nameTr: 'Yer Fıstığı Ezmesi (İnceltilmiş)', nameEn: 'Thinned Peanut Butter', icon: '🥜', allergen: true, month: '6+' },
  { id: 'tahini', cat: 'allergens', nameTr: 'Tahin (Susam)', nameEn: 'Tahini (Sesame Seed)', icon: '🫙', allergen: true, month: '6+' },
  { id: 'walnut_powder', cat: 'allergens', nameTr: 'Öğütülmüş Toz Ceviz', nameEn: 'Finely Ground Walnut Powder', icon: '🌰', allergen: true, month: '7+' },
  { id: 'almond_flour', cat: 'allergens', nameTr: 'Badem Unu / Toz Badem', nameEn: 'Ground Almond Meal', icon: '🌰', allergen: true, month: '7+' },
  { id: 'hazelnut_flour', cat: 'allergens', nameTr: 'Öğütülmüş Fındık', nameEn: 'Ground Hazelnut', icon: '🌰', allergen: true, month: '7+' },
  { id: 'fish_white', cat: 'allergens', nameTr: 'Beyaz Etli Balık (Mezgit)', nameEn: 'White Fish (Cod/Haddock)', icon: '🐟', allergen: true, month: '7+' },
  { id: 'cashew_butter', cat: 'allergens', nameTr: 'Kaju Ezmesi', nameEn: 'Cashew Butter', icon: '🥜', allergen: true, month: '8+' },
  { id: 'pistachio_powder', cat: 'allergens', nameTr: 'Antep Fıstığı Tozu', nameEn: 'Ground Pistachio', icon: '🟢', allergen: true, month: '8+' },
  { id: 'soy_milk', cat: 'allergens', nameTr: 'Soya Ürünü (Pankekte)', nameEn: 'Soy Product (in baking)', icon: '🥛', allergen: true, month: '8+' },
  { id: 'sunflower_butter', cat: 'allergens', nameTr: 'Ayçekirdeği Ezmesi', nameEn: 'Sunflower Seed Butter', icon: '🌻', allergen: true, month: '8+' },
  { id: 'shrimp_tasting', cat: 'allergens', nameTr: 'Karides / Kabuklu (1+ Yaş)', nameEn: 'Shellfish / Prawn (1+ yr)', icon: '🦐', allergen: true, month: '12+' },
  { id: 'sesame_oil', cat: 'allergens', nameTr: 'Susam Yağı', nameEn: 'Toasted Sesame Oil', icon: '🫙', allergen: true, month: '8+' },
  { id: 'pumpkin_seed_butter', cat: 'allergens', nameTr: 'Kabak Çekirdeği Ezmesi', nameEn: 'Pumpkin Seed Butter', icon: '🎃', allergen: true, month: '8+' },
  { id: 'cow_milk_baked', cat: 'allergens', nameTr: 'Pişmiş İnek Sütü (Kek/Muffin)', nameEn: 'Baked Cow Milk (in muffin)', icon: '🧁', allergen: true, month: '9+' },
  { id: 'clam_clam', cat: 'allergens', nameTr: 'Midye / İstiridye (Bebeklerde YASAK)', nameEn: 'Mollusks (Forbidden in infants)', icon: '🦪', allergen: true, month: '24+' },
];

export const FIRST_100_FOODS = SOLID_FOODS_100;

export function SolidFoodsScreen({ state, update, toast, close, lang: propLang }) {
  const lang = propLang || state?.lang || 'tr';
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState('foods'); // 'foods' | 'choking' | 'rules'
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);

  const solidFoodLogs = state.solidFoodLogs || {};

  const categories = [
    { id: 'all', labelTr: 'Tümü (100)', labelEn: 'All (100)' },
    { id: 'veggies', labelTr: 'Sebzeler (20)', labelEn: 'Veggies' },
    { id: 'fruits', labelTr: 'Meyveler (20)', labelEn: 'Fruits' },
    { id: 'protein', labelTr: 'Protein & Demir (20)', labelEn: 'Proteins' },
    { id: 'grains', labelTr: 'Tahıllar (15)', labelEn: 'Grains' },
    { id: 'dairy', labelTr: 'Süt & Yağlar (10)', labelEn: 'Dairy & Fats' },
    { id: 'allergens', labelTr: 'Alerjenler (15)', labelEn: 'Top Allergens' },
  ];

  const stats = useMemo(() => {
    const logs = Object.values(solidFoodLogs);
    const tried = logs.filter(l => l?.status === 'liked' || l?.status === 'disliked').length;
    const allergic = logs.filter(l => l?.status === 'allergic').length;
    const allergenTried = SOLID_FOODS_100.filter(f => f.allergen && (solidFoodLogs[f.id]?.status === 'liked' || solidFoodLogs[f.id]?.status === 'disliked')).length;

    return {
      tried,
      allergic,
      allergenTried,
      pct: Math.round((tried / 100) * 100),
    };
  }, [solidFoodLogs]);

  const filteredFoods = useMemo(() => {
    return SOLID_FOODS_100.filter(food => {
      const matchCat = selectedCat === 'all' || food.cat === selectedCat;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        food.nameTr.toLowerCase().includes(q) ||
        food.nameEn.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [selectedCat, searchQuery]);

  const updateFoodStatus = (foodId, status, reactionNote = '') => {
    const updated = {
      ...solidFoodLogs,
      [foodId]: {
        status,
        date: new Date().toISOString(),
        note: reactionNote,
      },
    };

    update({ solidFoodLogs: updated });
    saveTrackingEvent('solid_foods', updated).catch(() => {});

    setSelectedFood(null);
    toast && toast(
      status === 'liked'
        ? (isEn ? '😋 Marked as tried & liked!' : '😋 Denedi ve sevdi olarak kaydedildi!')
        : status === 'disliked'
        ? (isEn ? '😐 Marked as disliked for now' : '😐 Şimdilik sevmedi olarak işaretlendi')
        : status === 'allergic'
        ? (isEn ? '🚨 Allergy reaction logged!' : '🚨 Alerji tepkisi günlüğe kaydedildi!')
        : (isEn ? 'Reset to pending' : 'Henüz denenmediye alındı')
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHero
        title={isEn ? 'BLW & 100 First Foods Tracker' : 'BLW & 100 İlk Besin Takipçisi'}
        subtitle={isEn ? 'Pediatric 3-day rule, allergen introduction & choking safety' : '100 besin kontrol listesi, 3 gün alerji kuralı ve ilk yardım rehberi'}
        coverAsset="card_solid_foods"
      />

      {/* Top Pediatric & Safety Disclaimer */}
      <View style={styles.medicalDisclaimerCard}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <T style={{ fontSize: 16 }}>⚠️</T>
          <View style={{ flex: 1 }}>
            <T bold style={styles.medicalDisclaimerTitle}>
              {isEn ? 'Pediatric Feeding & Safety Notice' : 'Ek Gıda & Alerji Güvenliği Yasal Uyarısı'}
            </T>
            <T style={styles.medicalDisclaimerText}>
              {isEn
                ? 'BLW and 3-day allergen recommendations are for general guidance only. Always consult your pediatrician before introducing solids or major allergens. Never leave your baby unattended while eating, and familiarize yourself with infant choking first-aid protocols.'
                : 'BLW ve 3 gün alerji kuralı rehberliği genel pediatrik bilgilendirme amaçlıdır. Bebeğinize ek gıdaya başlamadan ve büyük alerjenleri sunmadan önce mutlaka çocuk doktorunuza danışınız. Bebeği yemek yerken ASLA yalnız bırakmayınız ve ilk yardım adımlarını önceden öğreniniz.'}
            </T>
          </View>
        </View>
      </View>

      {/* Metric Cards Banner */}
      <View style={styles.metricsRow}>
        <MetricCard
          label={isEn ? 'Tried Foods' : 'Denenen Besin'}
          value={`${stats.tried} / 100`}
          unit={isEn ? 'Foods' : 'Besin'}
          tone="lavender"
        />
        <MetricCard
          label={isEn ? 'Allergens Introduced' : 'Denenen Alerjen'}
          value={`${stats.allergenTried} / 15`}
          unit={isEn ? 'Top' : 'Büyük'}
          tone="sage"
        />
        <MetricCard
          label={isEn ? 'Progress' : 'Hedef Oranı'}
          value={`%${stats.pct}`}
          unit={isEn ? 'Mastered' : 'Tamamlandı'}
          tone="rose"
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {[
          { key: 'foods', label: isEn ? '100 Foods' : '100 Besin Listesi', icon: 'heart' },
          { key: 'rules', label: isEn ? '3-Day Rule' : '3 Gün Kuralı', icon: 'shield' },
          { key: 'choking', label: isEn ? 'Choking Safety' : 'Öğürme vs Boğulma', icon: 'book' },
        ].map(t => {
          const active = activeTab === t.key;
          return (
            <Tap
              key={t.key}
              onPress={() => setActiveTab(t.key)}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
            >
              <Icon name={t.icon} size={14} color={active ? colors.purple : '#7E6B87'} />
              <T bold={active} style={{ fontSize: 12, color: active ? colors.purple : '#7E6B87' }}>
                {t.label}
              </T>
            </Tap>
          );
        })}
      </View>

      {/* ─── TAB 1: 100 FOODS (Besin Listesi & Durumlar) ─── */}
      {activeTab === 'foods' && (
        <View style={{ gap: 12 }}>
          {/* Search Box */}
          <View style={styles.searchBox}>
            <Icon name="search" size={16} color="#8A7394" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={isEn ? 'Search food (e.g. Avocado, Salmon, Egg)...' : 'Besin ara (Avokado, Somon, Yumurta)...'}
              placeholderTextColor="#A394A8"
              style={styles.searchInput}
            />
            {searchQuery ? (
              <Tap onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <Icon name="close" size={14} color="#8A7394" />
              </Tap>
            ) : null}
          </View>

          {/* Category Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {categories.map(cat => (
              <Tap
                key={cat.id}
                onPress={() => setSelectedCat(cat.id)}
                style={[styles.catPill, selectedCat === cat.id && styles.catPillActive]}
              >
                <T bold={selectedCat === cat.id} style={{ fontSize: 11.5, color: selectedCat === cat.id ? '#FFFFFF' : '#6A5675' }}>
                  {isEn ? cat.labelEn : cat.labelTr}
                </T>
              </Tap>
            ))}
          </ScrollView>

          {/* Grid of Foods */}
          <View style={styles.foodGrid}>
            {filteredFoods.map(food => {
              const statusInfo = solidFoodLogs[food.id];
              const status = statusInfo?.status || 'pending';
              const isLiked = status === 'liked';
              const isDisliked = status === 'disliked';
              const isAllergic = status === 'allergic';

              return (
                <Tap
                  key={food.id}
                  onPress={() => setSelectedFood(food)}
                  style={[
                    styles.foodCard,
                    isLiked && styles.foodCardLiked,
                    isDisliked && styles.foodCardDisliked,
                    isAllergic && styles.foodCardAllergic,
                  ]}
                >
                  <T style={{ fontSize: 26 }}>{food.icon}</T>
                  <T bold style={[styles.foodCardTitle, isLiked && { color: '#027A48' }, isAllergic && { color: '#B42318' }]}>
                    {isEn ? food.nameEn : food.nameTr}
                  </T>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <View style={styles.monthBadge}>
                      <T style={{ fontSize: 9.5, color: colors.purple }}>{food.month}</T>
                    </View>
                    {food.allergen && (
                      <View style={styles.allergenTag}>
                        <T style={{ fontSize: 9, color: '#B42318' }}>⚠️ Alerjen</T>
                      </View>
                    )}
                  </View>

                  {/* Status Indicator */}
                  <View style={styles.statusIndicator}>
                    <T style={{ fontSize: 11 }}>
                      {isLiked ? '😋 Sevdi' : isDisliked ? '😐 Sevmedi' : isAllergic ? '🚨 Alerji' : '⏳ Bekliyor'}
                    </T>
                  </View>
                </Tap>
              );
            })}
          </View>
        </View>
      )}

      {/* ─── TAB 2: RULES (3 Gün Kuralı & Yasaklar) ─── */}
      {activeTab === 'rules' && (
        <View style={{ gap: 14 }}>
          <Card style={{ padding: 16 }}>
            <T bold style={{ fontSize: 15, color: colors.ink, marginBottom: 8 }}>
              {isEn ? 'The Pediatric 3-Day Waiting Rule' : '3 Gün Bekleme Kuralı Nedir?'}
            </T>
            <T style={{ fontSize: 12.5, color: '#4C3B52', lineHeight: 18 }}>
              {isEn
                ? 'When introducing a new single food, offer it in the morning for 3 consecutive days without introducing any other new ingredients. This isolates and accurately identifies any adverse allergic reactions.'
                : 'Yeni bir besine başlarken ardışık 3 gün boyunca sabah veya öğle saatinde küçük porsiyonlarla verilir. Bu 3 gün boyunca listeye başka hiçbir yeni gıda eklenmez; böylece gelişebilecek alerjik reaksiyonun kaynağı kesin olarak saptanır.'}
            </T>
          </Card>

          <Card style={{ padding: 16, backgroundColor: '#FFF7F7', borderColor: '#FED7D7' }}>
            <T bold style={{ fontSize: 14, color: '#B42318', marginBottom: 8 }}>
              {isEn ? '⚠️ FORBIDDEN BEFORE AGE 1 (Strict Pediatric Ban):' : '⚠️ 1 Yaşından Önce KESİNLİKLE YASAKLAR:'}
            </T>
            {[
              { itemTr: 'Bal', itemEn: 'Honey', reasonTr: 'Bebek botulizmi (Clostridium botulinum) ölümcül felç riski taşır.', reasonEn: 'Infant botulism risk from bacterial spores.' },
              { itemTr: 'Tuz ve Şeker', itemEn: 'Salt and Sugar', reasonTr: 'Gelişmekte olan bebek böbreklerine aşırı yük bindirir.', reasonEn: 'Overburdens immature infant kidneys.' },
              { itemTr: 'İnek / Keçi Sütü (Doğrudan içim)', itemEn: 'Direct Cow’s Milk', reasonTr: 'Bağırsak mikro-kanamalarına ve demir eksikliği anemisine yol açabilir (Peynir ve yoğurt serbesttir).', reasonEn: 'Can cause intestinal micro-bleeding and iron deficiency.' },
              { itemTr: 'Çiğ / Az Pişmiş Yumurta ve Et', itemEn: 'Raw Eggs / Undercooked Meat', reasonTr: 'Salmonella ve E. coli gıda zehirlenmesi riski.', reasonEn: 'Severe salmonella food poisoning.' },
              { itemTr: 'Boğulma Riski Taşıyan Yuvarlak Gıdalar', itemEn: 'Choking Hazard Round Foods', reasonTr: 'Bütün üzüm, kiraz, fındık, leblebi gibi soluk borusunu tam tıkayan sert yuvarlak gıdalar.', reasonEn: 'Whole grapes, whole nuts, cherry tomatoes.' },
            ].map((row, idx) => (
              <View key={idx} style={{ marginBottom: 8 }}>
                <T bold style={{ fontSize: 12.5, color: '#991B1B' }}>⛔ {isEn ? row.itemEn : row.itemTr}</T>
                <T style={{ fontSize: 11.5, color: '#573333', marginTop: 1, lineHeight: 15 }}>{isEn ? row.reasonEn : row.reasonTr}</T>
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* ─── TAB 3: CHOKING SAFETY (Öğürme vs Boğulma) ─── */}
      {activeTab === 'choking' && (
        <View style={{ gap: 14 }}>
          <Card style={{ padding: 16 }}>
            <T bold style={{ fontSize: 15, color: colors.ink, marginBottom: 8 }}>
              {isEn ? 'Gagging vs. Choking: Learn the Difference' : 'Öğürme (Gagging) ve Boğulma (Choking) Ayrımı'}
            </T>
            <T style={{ fontSize: 12.5, color: '#4B3A52', lineHeight: 18 }}>
              {isEn
                ? 'Gagging is a normal, noisy, protective reflex that moves food forward. Choking is quiet and deadly, requiring immediate emergency intervention.'
                : 'Öğürme bebeğin diliyle lokmayı öne iten doğal koruyucu refleksidir ve gürültülüdür. Boğulma ise sessizdir ve derhal ilk yardım müdahalesi gerektirir.'}
            </T>
          </Card>

          {/* Comparison Cards */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {/* Gagging */}
            <Card style={{ flex: 1, padding: 14, backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}>
              <T bold style={{ fontSize: 14, color: '#166534', marginBottom: 6 }}>
                🟢 {isEn ? 'Gagging (Normal)' : 'Öğürme (Normal)'}
              </T>
              <T style={{ fontSize: 11.5, color: '#14532D', lineHeight: 16 }}>
                {isEn
                  ? '• Loud coughing, spitting\n• Red face\n• Watery eyes\n• Baby solves it themselves!\n• DO NOT pat back; stay calm.'
                  : '• Sesli öksürük, tükürme\n• Kırmızı, kızarmış yüz\n• Gözler yaşarır\n• Bebek kendi çözer!\n• Sırtına VURMAYIN, sakin kalın.'}
              </T>
            </Card>

            {/* Choking */}
            <Card style={{ flex: 1, padding: 14, backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
              <T bold style={{ fontSize: 14, color: '#991B1B', marginBottom: 6 }}>
                🔴 {isEn ? 'Choking (Emergency)' : 'Boğulma (Acil)'}
              </T>
              <T style={{ fontSize: 11.5, color: '#7F1D1D', lineHeight: 16 }}>
                {isEn
                  ? '• SILENT (No sound)\n• Blue/pale lips\n• Panic in eyes\n• Cannot breathe or cry\n• ACT IMMEDIATELY: 5 back blows + 5 chest thrusts!'
                  : '• SESSİZDİR (Ses çıkmaz)\n• Moraran dudaklar\n• Panik dolu bakış\n• Nefes alamaz, ağlayamaz\n• HEMEN MÜDAHALE: 5 sırt vuruşu + 5 göğüs basısı!'}
              </T>
            </Card>
          </View>

          {/* Infant Heimlich Step by Step */}
          <Card style={{ padding: 16, backgroundColor: '#FAF5FA' }}>
            <T bold style={{ fontSize: 14, color: colors.purple, marginBottom: 8 }}>
              {isEn ? 'Infant Choking First Aid Protocol:' : 'Bebeklerde İlkyardım Adımları (Heimlich):'}
            </T>
            {[
              isEn ? '1. Place baby face down along your forearm, supporting jaw with fingers.' : '1. Bebeği kolunuzun üzerine yüzüstü yatırın, çenesini parmaklarınızla destekleyin (baş gövdeden aşağıda olmalıdır).',
              isEn ? '2. Deliver 5 firm back blows between shoulder blades with heel of hand.' : '2. Elinizin ayasıyla iki kürek kemiğinin tam ortasına ileri ve yukarı doğru 5 kez kuvvetlice vurun.',
              isEn ? '3. Turn baby face up on other arm; deliver 5 chest thrusts with 2 fingers.' : '3. Bebeği diğer kolunuza sırtüstü çevirin; göğüs kemiğinin alt yarısına 2 parmağınızla 5 kez bası uygulayın.',
              isEn ? '4. Repeat 5 back blows + 5 chest thrusts until object is expelled or 112 arrives.' : '4. Cisim çıkana veya 112 Acil Yardım gelene kadar bu döngüyü (5 sırt + 5 göğüs) sürdürün.',
            ].map((step, idx) => (
              <View key={idx} style={{ marginBottom: 6 }}>
                <T style={{ fontSize: 12, color: '#44314A', lineHeight: 16 }}>{step}</T>
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Food Status Modal */}
      {selectedFood && (
        <Modal transparent animationType="fade" visible={!!selectedFood} onRequestClose={() => setSelectedFood(null)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBox}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <T style={{ fontSize: 28 }}>{selectedFood.icon}</T>
                  <View>
                    <T bold style={{ fontSize: 16, color: colors.ink }}>
                      {isEn ? selectedFood.nameEn : selectedFood.nameTr}
                    </T>
                    <T style={{ fontSize: 11, color: colors.purple }}>
                      {selectedFood.month} {isEn ? 'Introduction' : 'Ayı Başlangıcı'}
                    </T>
                  </View>
                </View>
                <Tap onPress={() => setSelectedFood(null)} style={styles.modalCloseBtn}>
                  <Icon name="close" size={16} color="#7E6B87" />
                </Tap>
              </View>

              <View style={{ gap: 8 }}>
                <Tap
                  onPress={() => updateFoodStatus(selectedFood.id, 'liked')}
                  style={[styles.modalActionBtn, { backgroundColor: '#ECFDF3', borderColor: '#A7F3D0' }]}
                >
                  <T style={{ fontSize: 20 }}>😋</T>
                  <View style={{ flex: 1 }}>
                    <T bold style={{ fontSize: 13, color: '#027A48' }}>
                      {isEn ? 'Tried & Liked! 🎉' : 'Denedi & Çok Sevdi! 🎉'}
                    </T>
                    <T style={{ fontSize: 11, color: '#059669' }}>
                      {isEn ? 'Add to successfully mastered food list' : 'Başarıyla tamamlanan besinlere ekle'}
                    </T>
                  </View>
                </Tap>

                <Tap
                  onPress={() => updateFoodStatus(selectedFood.id, 'disliked')}
                  style={[styles.modalActionBtn, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}
                >
                  <T style={{ fontSize: 20 }}>😐</T>
                  <View style={{ flex: 1 }}>
                    <T bold style={{ fontSize: 13, color: '#B45309' }}>
                      {isEn ? 'Disliked for Now (Will retry)' : 'Şimdilik Sevmedi (Tekrar denenecek)'}
                    </T>
                    <T style={{ fontSize: 11, color: '#D97706' }}>
                      {isEn ? 'Babies need 10-15 exposures to accept a flavor' : 'Bir tadı kabul etmek 10-15 deneme gerektirebilir'}
                    </T>
                  </View>
                </Tap>

                <Tap
                  onPress={() => updateFoodStatus(selectedFood.id, 'allergic')}
                  style={[styles.modalActionBtn, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
                >
                  <T style={{ fontSize: 20 }}>🚨</T>
                  <View style={{ flex: 1 }}>
                    <T bold style={{ fontSize: 13, color: '#DC2626' }}>
                      {isEn ? 'Allergy Reaction Observed' : 'Alerji Reaksiyonu Gözlemlendi'}
                    </T>
                    <T style={{ fontSize: 11, color: '#B91C1C' }}>
                      {isEn ? 'Log symptoms and pause this food' : 'Kızarıklık, kusma vb. kaydedip ara verin'}
                    </T>
                  </View>
                </Tap>

                <Tap
                  onPress={() => updateFoodStatus(selectedFood.id, 'pending')}
                  style={[styles.modalActionBtn, { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }]}
                >
                  <T style={{ fontSize: 20 }}>⏳</T>
                  <View style={{ flex: 1 }}>
                    <T bold style={{ fontSize: 13, color: '#4B5563' }}>
                      {isEn ? 'Reset to Not Tried' : 'Denenmedi Olarak Sıfırla'}
                    </T>
                  </View>
                </Tap>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#EDE5EF',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...shadow,
  },
  medicalDisclaimerCard: {
    backgroundColor: '#FEF3F2',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FECDCA',
    padding: 12,
  },
  medicalDisclaimerTitle: {
    fontSize: 13,
    color: '#B42318',
    marginBottom: 4,
  },
  medicalDisclaimerText: {
    fontSize: 11.5,
    color: '#7A271A',
    lineHeight: 17,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DFD2E2',
    paddingHorizontal: 14,
    minHeight: 48,
    ...shadow,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 10,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FAF5FA',
    borderWidth: 1,
    borderColor: '#E8DCEB',
  },
  catPillActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  foodCard: {
    width: '48%',
    minHeight: 115,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE5F0',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 3,
    ...shadow,
  },
  foodCardLiked: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  foodCardDisliked: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  foodCardAllergic: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  foodCardTitle: {
    fontSize: 12.5,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 2,
  },
  monthBadge: {
    backgroundColor: '#F3EAF4',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  allergenTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  statusIndicator: {
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(25, 12, 30, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    ...shadow,
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3EAF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
});
