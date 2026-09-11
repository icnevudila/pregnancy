// ─── MOMORA · 40 Haftalık Bebek Gelişimi Veritabanı ─────────────────────────
// Her giriş: meyve anahtarı, Türkçe adı, boy (cm), ağırlık (gr),
//            ay, trimester, bebeğin gelişimi (3 madde), annede değişimler (2 madde)

export const TOTAL_WEEKS = 40;
export const FIRST_WEEK = 4;

export const weekData = {
  4: {
    fruit: 'seed', fruitName: 'Haşhaş Tohumu',
    lengthCm: 0.2, weightG: 0,
    month: 1, trimester: 1,
    baby: [
      'Embriyo oluşmaya başladı',
      'Nöral tüp — beyin ve omurganın temeli — şekilleniyor',
      'Plasenta ve göbek kordonu gelişimi başladı',
    ],
    mom: [
      'Test pozitif! İlk büyük an.',
      'Göğüslerde hassasiyet ve hafif yorgunluk normal',
    ],
  },
  5: {
    fruit: 'seed', fruitName: 'Susam Tohumu',
    lengthCm: 0.5, weightG: 0,
    month: 2, trimester: 1,
    baby: [
      'Kalp atmaya başladı — dakikada ~150 atım',
      'Beyin ve omurga hızla gelişiyor',
      'Küçük kol ve bacak tomurcukları oluşuyor',
    ],
    mom: [
      'Bulantı başlayabilir — sabah en yoğun olabilir',
      'Yorgunluk çok normal, dinlenmeye çalış',
    ],
  },
  6: {
    fruit: 'pea', fruitName: 'Bezelye',
    lengthCm: 0.8, weightG: 1,
    month: 2, trimester: 1,
    baby: [
      'Yüz hatları — göz ve burun çukurları — oluşmaya başladı',
      'El ve ayak tomurcukları belirginleşti',
      'Kalp artık ultrasonla görüntülenebilir',
    ],
    mom: [
      'Mide bulantısı ve tat değişimleri sürüyor olabilir',
      'Koku hassasiyeti artabilir — bu normal bir hamilelik belirtisi',
    ],
  },
  7: {
    fruit: 'blueberry', fruitName: 'Yaban Mersini',
    lengthCm: 1.3, weightG: 1,
    month: 2, trimester: 1,
    baby: [
      'Beyin, haftada yüz binlerce yeni hücre üretiyor',
      'Parmaklar ayrışmaya başlıyor',
      'Karaciğer ilk kan hücrelerini üretiyor',
    ],
    mom: [
      'Bulantı en yoğun dönemde olabilir — geçeceğini bil',
      'Bol su ve hafif atıştırmalar yardımcı olur',
    ],
  },
  8: {
    fruit: 'raspberry', fruitName: 'Ahududu',
    lengthCm: 1.6, weightG: 1,
    month: 2, trimester: 1,
    baby: [
      'Tüm temel organlar yerleşti',
      'Hareket etmeye başlıyor — henüz hissetmiyorsun',
      'İnsan yüzü belirginleşiyor: gözler, kulaklar, ağız',
    ],
    mom: [
      'Göğüsler büyüyebilir ve hassaslaşabilir',
      'Sık idrara çıkma bu dönemde çok normal',
    ],
  },
  9: {
    fruit: 'grape', fruitName: 'Üzüm',
    lengthCm: 2.3, weightG: 2,
    month: 3, trimester: 1,
    baby: [
      'Kaslar gelişiyor ve beyin komutlara yanıt veriyor',
      'Kulaklar, gözler ve burun net şekillendi',
      'Küçük eller yüze yaklaşıyor',
    ],
    mom: [
      'Duygu dalgalanmaları normal — hormonlar çalışıyor',
      'İlk doktor kontrolü için güzel bir dönem',
    ],
  },
  10: {
    fruit: 'kumquat', fruitName: 'Kümkuat',
    lengthCm: 3.1, weightG: 4,
    month: 3, trimester: 1,
    baby: [
      'Kemikler sertleşmeye başladı',
      'Küçük tırnaklar oluşuyor',
      'Diş tomurcukları yerleşti',
    ],
    mom: [
      'Karın fark edilmeye başlayabilir — ya da henüz değil, ikisi de normal',
      'Enerji biraz artabilir',
    ],
  },
  11: {
    fruit: 'fig', fruitName: 'İncir',
    lengthCm: 4.1, weightG: 7,
    month: 3, trimester: 1,
    baby: [
      'Eller açılıp kapanabiliyor',
      'Yutkunma refleksi gelişti',
      'İskelet tamamen şekillendi, artık kıkırdaktan kemiğe dönüşüyor',
    ],
    mom: [
      'Saç ve tırnaklar daha hızlı büyüyebilir',
      'Ruh hali dengeleniyor',
    ],
  },
  12: {
    fruit: 'plum', fruitName: 'Erik',
    lengthCm: 5.4, weightG: 14,
    month: 3, trimester: 1,
    baby: [
      'Refleksler aktif — yüzüne dokunulunca tepki veriyor',
      'Sindirim sistemi hareket ediyor',
      '1. trimester bitiyor — en kritik dönem geride kaldı',
    ],
    mom: [
      'Bulantı azalıyor — enerji geri geliyor 🌟',
      'İştah açılıyor, dengeli beslenme zamanı',
    ],
  },
  13: {
    fruit: 'lemon', fruitName: 'Limon',
    lengthCm: 7.4, weightG: 23,
    month: 4, trimester: 2,
    baby: [
      'Parmak izleri tamamlandı — dünyada sadece ona ait',
      'Ses duyabiliyor — sesin ona ulaşıyor',
      'Yüz kasları mimik yapabiliyor',
    ],
    mom: [
      '2. trimester başladı — altın dönemine hoş geldin ✨',
      'Enerji artışı hissedebilirsin',
    ],
  },
  14: {
    fruit: 'peach', fruitName: 'Şeftali',
    lengthCm: 8.7, weightG: 43,
    month: 4, trimester: 2,
    baby: [
      'Cinsiyet belirginleşiyor',
      'Yüz kasları ilk mimikleri yapıyor',
      'Böbrekler idrar üretiyor',
    ],
    mom: [
      'Karın yuvarlaklaşıyor, giysi seçimi değişebilir',
      'Enerji yüksek kalabilir — bu dönemi iyi değerlendir',
    ],
  },
  15: {
    fruit: 'apple', fruitName: 'Elma',
    lengthCm: 10.4, weightG: 70,
    month: 4, trimester: 2,
    baby: [
      'Tüy (lanugo) vücudu kaplamaya başladı — ısısını koruyor',
      'Bacak hareketleri güçlendi',
      'Yuttuğu amniyon sıvısını böbrekleriyle işliyor',
    ],
    mom: [
      'Bel ağrısı için hafif egzersiz çok faydalı',
      'Hamile kıyafetleri zamanı olabilir',
    ],
  },
  16: {
    fruit: 'avocado', fruitName: 'Avokado',
    lengthCm: 11.6, weightG: 100,
    month: 4, trimester: 2,
    baby: [
      'Gözler ışığa duyarlı hale geldi',
      'Kemikler kalsiyum depolayan kemiğe dönüşüyor',
      'Kalp atışı stetoskopla net duyuluyor',
    ],
    mom: [
      'Hamilelik ışıltısı — cilt parlaklığı görünebilir',
      'Karın ağırlığı hissedilmeye başlar',
    ],
  },
  17: {
    fruit: 'pear', fruitName: 'Armut',
    lengthCm: 13, weightG: 140,
    month: 5, trimester: 2,
    baby: [
      'Vücut yağ dokusu biriktiriyor — daha yumuşak olacak',
      'Kemikler giderek sertleşiyor',
      'Seslere anlık tepki veriyor',
    ],
    mom: [
      'İyi bir hamile yastığı sırt ağrısını azaltır',
      'Karın büyüdükçe denge değişir — yavaş hareket',
    ],
  },
  18: {
    fruit: 'sweetpotato', fruitName: 'Tatlı Patates',
    lengthCm: 14.2, weightG: 190,
    month: 5, trimester: 2,
    baby: [
      'Hareketleri güçleniyor — yakında hissedebilirsin',
      'Sinirler miyelin kılıfla kaplanıyor — iletişim hızlanıyor',
      'Kız bebeklerde yumurtalıklar, erkeklerde testisler oluştu',
    ],
    mom: [
      'İlk hareketleri bu haftalarda hissedebilirsin 🦋',
      'Karın çevresi hızla büyüyor',
    ],
  },
  19: {
    fruit: 'mango', fruitName: 'Mango',
    lengthCm: 15.3, weightG: 240,
    month: 5, trimester: 2,
    baby: [
      'Verniks (beyaz koruyucu tabaka) oluşuyor',
      'Duyu gelişimi hız kazandı — tat, dokunma, ses',
      'Yüz kasları gülümseyebiliyor',
    ],
    mom: [
      'Sırt ağrısı için kısa yürüyüşler çok iyi',
      'Bol su içmek özellikle bu dönemde önemli',
    ],
  },
  20: {
    fruit: 'banana', fruitName: 'Muz',
    lengthCm: 25, weightG: 300,
    month: 5, trimester: 2,
    baby: [
      '🎉 Tam orta nokta — yarı yoldasın!',
      'Kollar ve bacaklar artık orantılı',
      'Yutma ve emme refleksini çalıştırıyor',
    ],
    mom: [
      '20. hafta ultrasonunu kaçırma — önemli kontrol',
      'Göbek dışarı çıkmaya başlayabilir',
    ],
  },
  21: {
    fruit: 'carrot', fruitName: 'Havuç',
    lengthCm: 26.7, weightG: 360,
    month: 6, trimester: 2,
    baby: [
      'Kaşlar ve kirpikler belirginleşti',
      'Uyku-uyanıklık düzeni oluşuyor',
      'Beyin hızla büyüyor',
    ],
    mom: [
      'Karın çok daha belirgin — fotoğraf çektir!',
      'Hamile yastığı artık çok işe yarıyor',
    ],
  },
  22: {
    fruit: 'coconut', fruitName: 'Hindistan Cevizi',
    lengthCm: 27.8, weightG: 430,
    month: 6, trimester: 2,
    baby: [
      'Eller çok aktif — nesneleri kavramaya çalışıyor',
      'Parmak izleri tamamlandı',
      'Göz kapakları gelişiyor',
    ],
    mom: [
      'Şişkinlik hissedebilirsin',
      'Kan testinde demir değerini kontrol ettir',
    ],
  },
  23: {
    fruit: 'grapefruit', fruitName: 'Greyfurt',
    lengthCm: 28.9, weightG: 500,
    month: 6, trimester: 2,
    baby: [
      'İç kulak gelişti — dengesi var',
      'Sesler, aydınlık-karanlık ve dokunuşa tepki veriyor',
      'Cilt hâlâ ince ama gelişiyor',
    ],
    mom: [
      'Gece bacak krampları için magnezyum faydalı',
      'Yatmadan önce hafif egzersiz iyi gelir',
    ],
  },
  24: {
    fruit: 'melon', fruitName: 'Kavun',
    lengthCm: 30, weightG: 600,
    month: 6, trimester: 2,
    baby: [
      'Akciğerler surfaktan üretiyor — doğuma hazırlık',
      'Göz kapakları artık açılıp kapanabiliyor',
      'Seslere ve müziğe tepki veriyor',
    ],
    mom: [
      'Nefes darlığı başlayabilir — uterus diyaframa baskı yapıyor',
      'Ayak bilekleri şişebilir — ayakları yükselterek dinlen',
    ],
  },
  25: {
    fruit: 'cauliflower', fruitName: 'Karnabahar',
    lengthCm: 34.6, weightG: 660,
    month: 7, trimester: 3,
    baby: [
      'Saçlar çıkmaya başlıyor',
      'Yağ depolamaya devam ediyor',
      'Beyinde katmanlar oluşuyor',
    ],
    mom: [
      '3. trimester kapıda — doktor kontrolleri sıklaşacak',
      'Gestasyonel diyabet testi bu dönemde yapılır',
    ],
  },
  26: {
    fruit: 'cucumber', fruitName: 'Salatalık',
    lengthCm: 35.6, weightG: 760,
    month: 7, trimester: 3,
    baby: [
      'Beyin aktivitesi hızla artıyor',
      'Akciğerler gelişmeye devam ediyor',
      'Gözler artık renk algılayabiliyor',
    ],
    mom: [
      'Oturup kalkarken yavaş ve dikkatli ol',
      'Sırt ağrısı artabilir — yüzme veya yürüyüş yardımcı olur',
    ],
  },
  27: {
    fruit: 'cabbage', fruitName: 'Lahana',
    lengthCm: 36.6, weightG: 900,
    month: 7, trimester: 3,
    baby: [
      'Beyin katmanları oluşuyor',
      'Kas gücü artıyor',
      'REM uykusuna giriyor — rüya görüyor olabilir',
    ],
    mom: [
      'Mide yanması artabilir — küçük öğünler faydalı',
      'Sol yanda uyumak bebeğe iyi geliyor',
    ],
  },
  28: {
    fruit: 'eggplant', fruitName: 'Patlıcan',
    lengthCm: 37.6, weightG: 1000,
    month: 7, trimester: 3,
    baby: [
      '🎉 1 kilo oldu!',
      'Gözler açık ve ışığa tepki veriyor',
      'Kemik iliği kan hücresi üretiyor',
    ],
    mom: [
      'Braxton Hicks kasılmaları (alıştırma) başlayabilir',
      'Derin nefes almak hem seni hem bebeği rahatlatır',
    ],
  },
  29: {
    fruit: 'squash', fruitName: 'Balkabağı',
    lengthCm: 38.6, weightG: 1150,
    month: 8, trimester: 3,
    baby: [
      'Kemikler tamamen gelişti',
      'Kas koordinasyonu artıyor',
      'Muhtemelen baş aşağı dönüyor',
    ],
    mom: [
      'Nefes darlığı artabilir — bu biter, merak etme',
      'Kısa yürüyüşler enerji verir',
    ],
  },
  30: {
    fruit: 'cabbage', fruitName: 'Büyük Lahana',
    lengthCm: 39.9, weightG: 1300,
    month: 8, trimester: 3,
    baby: [
      'Beyin gelişimi doruk noktada',
      'Gözler odaklanabiliyor',
      'Vücut ısı düzenlemesini öğreniyor',
    ],
    mom: [
      'Sol yanda uyumak en rahat pozisyon',
      'Yorgunluk artabilir — kendinle nazik ol',
    ],
  },
  31: {
    fruit: 'pineapple', fruitName: 'Ananas',
    lengthCm: 41.1, weightG: 1500,
    month: 8, trimester: 3,
    baby: [
      'Tüm duyu organları aktif çalışıyor',
      'Bağışıklık sistemi anneden antikor alıyor',
      'Aktif ve uyku dönemleri belirli',
    ],
    mom: [
      'Bebek hareketlerini günlük takip et',
      'Sık idrara çıkma artar — bu son dönemin parçası',
    ],
  },
  32: {
    fruit: 'zucchini', fruitName: 'Kabak',
    lengthCm: 42.4, weightG: 1700,
    month: 8, trimester: 3,
    baby: [
      'Kemikler tamamen sertleşiyor',
      'Akciğerler neredeyse hazır',
      'Uyku-uyanıklık döngüsü düzenlendi',
    ],
    mom: [
      'Doğuma hazırlık sınıfı için iyi bir dönem',
      'Hastane çantasını hazırlamaya başla',
    ],
  },
  33: {
    fruit: 'pineapple', fruitName: 'Büyük Ananas',
    lengthCm: 43.7, weightG: 1900,
    month: 9, trimester: 3,
    baby: [
      'Kemikler neredeyse tam — kafa kemiği hâlâ esnek',
      'Doğum kanalına hazırlanıyor',
      'Gözler açık ve görmek için hazır',
    ],
    mom: [
      'Nefes darlığı zirve yapabilir — bebek biraz inecek',
      'Doğum belirtilerini öğrenmek için iyi zaman',
    ],
  },
  34: {
    fruit: 'melon', fruitName: 'Büyük Kavun',
    lengthCm: 45, weightG: 2150,
    month: 9, trimester: 3,
    baby: [
      'Merkezi sinir sistemi olgunlaşıyor',
      'Yağ tabakası tamamlandı — tatlı toparlak 💛',
      'Refleksler tamamen gelişti',
    ],
    mom: [
      'Pelvik ağrı olabilir — bebek aşağı iniyor',
      'Bebek pozisyonunu doktora kontrol ettir',
    ],
  },
  35: {
    fruit: 'honeydew', fruitName: 'Bal Kabağı',
    lengthCm: 46.2, weightG: 2380,
    month: 9, trimester: 3,
    baby: [
      'Böbrekler tam çalışıyor',
      'Karaciğer işlevsel hale geldi',
      'Her gün biraz daha kilo alıyor',
    ],
    mom: [
      'Pelvik kemikler genişliyor — yürümek zorlaşabilir',
      'Az ve sık yemek mide için en iyi seçenek',
    ],
  },
  36: {
    fruit: 'watermelon', fruitName: 'Karpuz',
    lengthCm: 47.4, weightG: 2620,
    month: 9, trimester: 3,
    baby: [
      'Erken doğum riski artık çok düşük',
      'Yüz hatları tamamen gelişti',
      'Muhtemelen baş aşağı pozisyonda',
    ],
    mom: [
      'Doğum çantası hazır olsun',
      'Doğum belirtilerini iyi tanı — sancı, su gelmesi, gösterme',
    ],
  },
  37: {
    fruit: 'watermelon', fruitName: 'Büyük Karpuz',
    lengthCm: 48.6, weightG: 2860,
    month: 9, trimester: 3,
    baby: [
      '✅ Term bebek — hazır sayılır!',
      'Emme refleksi mükemmel gelişti',
      'Vücut ısısını düzenleyebiliyor',
    ],
    mom: [
      'Her kasılmayı takip et',
      'Huzurlu ol — yakında tanışacaksınız 💜',
    ],
  },
  38: {
    fruit: 'watermelon', fruitName: 'Dev Karpuz',
    lengthCm: 49.8, weightG: 3080,
    month: 9, trimester: 3,
    baby: [
      'Akciğerler tamamen hazır',
      'Bağırsak sistemi aktif',
      'Saçlar büyümüş olabilir',
    ],
    mom: [
      'Günlük bebek hareketlerini takip et',
      'Hastaneye ne zaman gideceğini bil',
    ],
  },
  39: {
    fruit: 'watermelon', fruitName: 'Dev Karpuz',
    lengthCm: 50.7, weightG: 3290,
    month: 9, trimester: 3,
    baby: [
      'Doğuma tamamen hazır',
      'Antikor transferi son dakikaya kadar sürüyor',
      'Yağ dokusu tam — sıcak ve yumuşak',
    ],
    mom: [
      'Her an olabilir!',
      'Derin nefes al — inandığından çok daha güçlüsün 💜',
    ],
  },
  40: {
    fruit: 'pumpkin', fruitName: 'Balkabağı',
    lengthCm: 51.2, weightG: 3400,
    month: 9, trimester: 3,
    baby: [
      '💜 Buluşma zamanı!',
      'Her şey hazır, seni bekliyor',
      'Dünyadaki en büyük serüven başlıyor',
    ],
    mom: [
      'Bugün veya yarın olabilir',
      'İnandığından çok daha güçlüsün 🌸',
    ],
  },
};

/** Haftaya ait veriyi döner; sınır dışı haftalarda en yakın veriyi verir */
export function getWeekInfo(week) {
  const w = Math.max(FIRST_WEEK, Math.min(TOTAL_WEEKS, Math.round(week)));
  return weekData[w] || weekData[24];
}

/** Ağırlığı okunabilir formata çevirir */
export function formatWeight(g) {
  if (g < 1) return '< 1 gr';
  if (g < 1000) return `~${g} gr`;
  return `~${(g / 1000).toFixed(1)} kg`;
}

/** Boyu okunabilir formata çevirir */
export function formatLength(cm) {
  if (cm < 1) return `${Math.round(cm * 10)} mm`;
  return `~${cm} cm`;
}

/** Hangi trimester olduğunu Türkçe döner */
export function trimesterLabel(t) {
  return [``, '1. Trimester', '2. Trimester', '3. Trimester'][t] || '';
}

/** Kaçıncı ayda olduğunu döner */
export function monthLabel(m) {
  return `${m}. Ay`;
}

/** 0–100 arasında gebelik ilerlemesini döner */
export function pregnancyProgress(week) {
  return Math.round(((week - FIRST_WEEK) / (TOTAL_WEEKS - FIRST_WEEK)) * 100);
}
