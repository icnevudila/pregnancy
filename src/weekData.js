// ─── MOMORA · 40 Haftalık Bebek Gelişimi Veritabanı ─────────────────────────
// Her giriş: meyve anahtarı, Türkçe adı, boy (cm), ağırlık (gr),
//            ay, trimester, bebeğin gelişimi (3 madde), annede değişimler (2 madde)

export const TOTAL_WEEKS = 40;
export const FIRST_WEEK = 4;

export const weekData = {
  4: {
    fruit: 'seed', fruitName: 'Haşhaş Tohumu',
    animal: 'ant', animalName: 'Minik Karınca', animalEmoji: '🐜',
    sweet: 'sprinkle', sweetName: 'Pasta Süsü', sweetEmoji: '🍬',
    ultrasound: {"scan":"Kese Taraması","milestone":"Blastokist rahim duvarına yerleşti","badge":"Erken Gebelik"},
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
    animal: 'ladybug', animalName: 'Uğur Böceği', animalEmoji: '🐞',
    sweet: 'candy', sweetName: 'Mini Bonbon', sweetEmoji: '🍭',
    ultrasound: {"scan":"Gestasyonel Kese","milestone":"Gebelik kesesi ultrasonda seçilebilir","badge":"2D Ultrason"},
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
    animal: 'bee', animalName: 'Bal Arısı', animalEmoji: '🐝',
    sweet: 'chocolate', sweetName: 'Çikolata Draje', sweetEmoji: '🍫',
    ultrasound: {"scan":"İlk Kalp Atışı","milestone":"Kalp atışı 110-150 bpm olarak izlenir","badge":"Doppler"},
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
    animal: 'caterpillar', animalName: 'Minik Tırtıl', animalEmoji: '🐛',
    sweet: 'blueberry_bonbon', sweetName: 'Yaban Mersini Şekeri', sweetEmoji: '🫐',
    ultrasound: {"scan":"Kol & Bacak Tomurcuğu","milestone":"Kollarda ve bacaklarda ilk tomurcuklanma","badge":"2D Ultrason"},
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
    animal: 'dragonfly', animalName: 'Yusufçuk', animalEmoji: '🪲',
    sweet: 'gummybear', sweetName: 'Jelibon Ayıcık', sweetEmoji: '🧸',
    ultrasound: {"scan":"Beyin Gelişimi","milestone":"Beyin yarım küreleri ve omurga şekilleniyor","badge":"2D Ultrason"},
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
    animal: 'snail', animalName: 'Minik Salyangoz', animalEmoji: '🐌',
    sweet: 'caramel', sweetName: 'Karamel Küpü', sweetEmoji: '🍬',
    ultrasound: {"scan":"Spontan Hareketler","milestone":"Bebeğin ilk minik gövde seğirmeleri başlar","badge":"2D Ultrason"},
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
    animal: 'grasshopper', animalName: 'Yeşil Çekirge', animalEmoji: '🦗',
    sweet: 'almond_candy', sweetName: 'Badem Şekeri', sweetEmoji: '🫒',
    ultrasound: {"scan":"Fetal Dönem Başlangıcı","milestone":"Tıbben embriyo evresinden fetusa geçildi","badge":"2D Ultrason"},
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
    animal: 'fish', animalName: 'Neon Balığı', animalEmoji: '🐠',
    sweet: 'turkish_delight', sweetName: 'Kuşlokumu', sweetEmoji: '🥟',
    ultrasound: {"scan":"Parmak Ayrışması","milestone":"El ve ayak parmak perdeleri açılıyor","badge":"2D Ultrason"},
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
    animal: 'chick', animalName: 'Sarı Civciv', animalEmoji: '🐥',
    sweet: 'macaron', sweetName: 'Fransız Makaronu', sweetEmoji: '🧁',
    ultrasound: {"scan":"İkili Tarama & NT","milestone":"Ense kalınlığı ve burun kemiği taranır","badge":"Altın Tarama"},
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
    animal: 'treefrog', animalName: 'Ağaç Kurbağası', animalEmoji: '🐸',
    sweet: 'cookie', sweetName: 'Çikolatalı Kurabiye', sweetEmoji: '🍪',
    ultrasound: {"scan":"Ses Telleri & Mimikler","milestone":"Ses telleri gelişiyor, yutkunma başladı","badge":"2D Ultrason"},
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
    animal: 'hamster', animalName: 'Tombik Hamster', animalEmoji: '🐹',
    sweet: 'teacup', sweetName: 'Porselen Çay Fincanı', sweetEmoji: '☕',
    ultrasound: {"scan":"2. Trimester Başlangıcı","milestone":"Bebek başparmağını emebilir!","badge":"4D Ultrason"},
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
    animal: 'sparrow', animalName: 'Minik Serçe', animalEmoji: '🐦',
    sweet: 'donut', sweetName: 'Çilekli Donut', sweetEmoji: '🍩',
    ultrasound: {"scan":"Işık Algısı","milestone":"Göz kapakları kapalı olsa da ışığı ayırt eder","badge":"2D Ultrason"},
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
    animal: 'hedgehog', animalName: 'Yavru Kirpi', animalEmoji: '🦔',
    sweet: 'cupcake', sweetName: 'Kremalı Cupcake', sweetEmoji: '🧁',
    ultrasound: {"scan":"Cinsiyet Tespiti","milestone":"Cinsiyet yüksek doğrulukla görüntülenebilir","badge":"Cinsiyet Müjdesi"},
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
    animal: 'squirrel', animalName: 'Yavru Sincap', animalEmoji: '🐿️',
    sweet: 'croissant', sweetName: 'Tereyağlı Kruvasan', sweetEmoji: '🥐',
    ultrasound: {"scan":"Kemikleşme Evresi","milestone":"Kıkırdaklar güçlü kemik dokusuna dönüşüyor","badge":"2D Ultrason"},
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
    animal: 'chameleon', animalName: 'Bukalemun', animalEmoji: '🦎',
    sweet: 'pretzel', sweetName: 'Çikolatalı Pretzel', sweetEmoji: '🥨',
    ultrasound: {"scan":"İşitme Başlangıcı","milestone":"Annenin kalp atışını ve sesini duyabilir","badge":"2D Ultrason"},
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
    animal: 'parakeet', animalName: 'Muhabbet Kuşu', animalEmoji: '🦜',
    sweet: 'pancake', sweetName: 'Ballı Pankek', sweetEmoji: '🥞',
    ultrasound: {"scan":"Verniks Tabakası","milestone":"Cildi koruyan kremsi verniks tabakası oluştu","badge":"2D Ultrason"},
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
    animal: 'bunny', animalName: 'Minik Tavşan', animalEmoji: '🐰',
    sweet: 'icecream', sweetName: 'Dondurma Külahı', sweetEmoji: '🍦',
    ultrasound: {"scan":"Detaylı Anatomi Taraması","milestone":"2. Düzey ultrason: Kalp odacıkları ve tüm organlar","badge":"Detaylı USG"},
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
    animal: 'chinchilla', animalName: 'Çinçilla', animalEmoji: '🐹',
    sweet: 'waffle', sweetName: 'Belçika Waffle', sweetEmoji: '🧇',
    ultrasound: {"scan":"Kemik İliği Aktivitesi","milestone":"Kemik iliği kan hücresi üretmeye başladı","badge":"2D Ultrason"},
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
    animal: 'ferret', animalName: 'Sevimli Gelincik', animalEmoji: '🦔',
    sweet: 'honeyjar', sweetName: 'Bal Kavanozu', sweetEmoji: '🍯',
    ultrasound: {"scan":"Yüz Çizgileri","milestone":"Kaşlar, kirpikler ve dudak hatları kusursuz","badge":"4D HD Canlı"},
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
    animal: 'duckling', animalName: 'Yavru Ördek', animalEmoji: '🦆',
    sweet: 'cheesecake', sweetName: 'Frambuazlı Çizkek', sweetEmoji: '🍰',
    ultrasound: {"scan":"REM Rüyaları","milestone":"Hızlı göz hareketleri; bebek rüya görebilir","badge":"2D Ultrason"},
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
    animal: 'kitten', animalName: 'Yumak Yavru Kedi', animalEmoji: '🐱',
    sweet: 'pie', sweetName: 'Elmalı Turta', sweetEmoji: '🥧',
    ultrasound: {"scan":"Akciğer Gelişimi","milestone":"Surfaktan üretimi ve yaşama eşiği (viability)","badge":"Kritik Eşik"},
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
    animal: 'puppy', animalName: 'Yavru Köpek', animalEmoji: '🐶',
    sweet: 'pancake_stack', sweetName: 'Katlı Pankek Kulesi', sweetEmoji: '🥞',
    ultrasound: {"scan":"Sese Tepki","milestone":"Dış seslere tekme ve sıçramayla yanıt verir","badge":"2D Ultrason"},
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
    animal: 'otter', animalName: 'Su Samuru', animalEmoji: '🦦',
    sweet: 'birthdaycake', sweetName: 'Kutlama Pastası', sweetEmoji: '🎂',
    ultrasound: {"scan":"Göz Açıp Kırpma","milestone":"Göz kapakları açıldı, göz kırpma refleksleri","badge":"4D Ultrason"},
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
    animal: 'raccoon', animalName: 'Minik Rakun', animalEmoji: '🦝',
    sweet: 'parfait', sweetName: 'Meyveli Parfe', sweetEmoji: '🍧',
    ultrasound: {"scan":"Hıçkırık Taraması","milestone":"Ritmik göğüs hareketleri ve hıçkırıklar izlenir","badge":"2D Ultrason"},
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
    animal: 'sloth', animalName: 'Tembel Hayvan', animalEmoji: '🦥',
    sweet: 'chocobox', sweetName: 'Çikolata Kutusu', sweetEmoji: '🍫',
    ultrasound: {"scan":"3. Trimester Başlangıcı","milestone":"Beyin kıvrımları hızla derinleşiyor","badge":"3. Trimester"},
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
    animal: 'badger', animalName: 'Sevimli Porsuk', animalEmoji: '🦨',
    sweet: 'sundae', sweetName: 'Karamelli Sundae', sweetEmoji: '🍨',
    ultrasound: {"scan":"Işık Takibi","milestone":"Karına tutulan ışığa başını çevirir","badge":"2D Ultrason"},
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
    animal: 'koala', animalName: 'Uykucu Koala', animalEmoji: '🐨',
    sweet: 'basket', sweetName: 'Hediye Sepeti', sweetEmoji: '🎁',
    ultrasound: {"scan":"Büyüme & Kilo Takibi","milestone":"Ağırlık ~1.3 kg; kemik iliği tam aktif","badge":"Biyometri"},
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
    animal: 'fennec', animalName: 'Çöl Tilkisi', animalEmoji: '🦊',
    sweet: 'pecan_pie', sweetName: 'Fındıklı Turta', sweetEmoji: '🥧',
    ultrasound: {"scan":"5 Duyu Aktif","milestone":"Tat, dokunma, işitme duyuları tamamen açık","badge":"2D Ultrason"},
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
    animal: 'kangaroo', animalName: 'Yavru Kanguru', animalEmoji: '🦘',
    sweet: 'giant_croissant', sweetName: 'Dev Kruvasan', sweetEmoji: '🥐',
    ultrasound: {"scan":"Tırnak & Saç Takibi","milestone":"El ve ayak tırnakları parmak ucuna ulaştı","badge":"4D HD Canlı"},
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
    animal: 'penguin', animalName: 'Yavru Penguen', animalEmoji: '🐧',
    sweet: 'teapot', sweetName: 'Porselen Demlik', sweetEmoji: '🫖',
    ultrasound: {"scan":"Amniyotik Sıvı Zirvesi","milestone":"Amniyotik sıvı miktarı en yüksek hacimde","badge":"AFI Ölçümü"},
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
    animal: 'beaver', animalName: 'Kunduz Yavrusu', animalEmoji: '🦫',
    sweet: 'cotton_candy', sweetName: 'Pamuk Şeker', sweetEmoji: '🍬',
    ultrasound: {"scan":"Bağışıklık Transferi","milestone":"Anneden bebeğe koruyucu antikor akışı zirvede","badge":"2D Ultrason"},
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
    animal: 'skunk', animalName: 'Minik Kokarca', animalEmoji: '🦡',
    sweet: 'strawberry_cake', sweetName: 'Çilekli Yaş Pasta', sweetEmoji: '🍰',
    ultrasound: {"scan":"Solunum Pratiği","milestone":"Akciğerlerle solunum deneme hareketleri","badge":"Biyofizik Profil"},
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
    animal: 'panda', animalName: 'Tombul Panda', animalEmoji: '🐼',
    sweet: 'tier_cake', sweetName: '2 Katlı Kutlama Pastası', sweetEmoji: '🎂',
    ultrasound: {"scan":"Doğum Pozisyonu","milestone":"Baş aşağı pelvis yönüne yerleşme (verteks)","badge":"Prezente Takibi"},
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
    animal: 'lamb', animalName: 'Sevimli Kuzu', animalEmoji: '🐑',
    sweet: 'mega_donut', sweetName: 'Büyük Festival Donutu', sweetEmoji: '🍩',
    ultrasound: {"scan":"Erken Term Olgunluk","milestone":"Artık erken term kabul edilir; ciğerler hazır","badge":"Term Eşiği"},
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
    animal: 'seal', animalName: 'Yavru Fok', animalEmoji: '🦭',
    sweet: 'picnic_hamper', sweetName: 'Piknik Sepeti', sweetEmoji: '🧺',
    ultrasound: {"scan":"Güçlü Kavrama","milestone":"Kavrama refleksi: Parmaklarını sımsıkı kenetler","badge":"4D Ultrason"},
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
    animal: 'bear_cub', animalName: 'Yavru Ayıcık', animalEmoji: '🐻',
    sweet: 'balloon_bouquet', sweetName: 'Kutlama Buketi', sweetEmoji: '🎈',
    ultrasound: {"scan":"Tam Dönem (Full Term)","milestone":"Tüm organlar dış dünya havasına ve sütüne hazır","badge":"Full Term"},
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
    animal: 'lion_cub', animalName: 'Minik Aslan', animalEmoji: '🦁',
    sweet: 'gift_box', sweetName: 'Büyük Hediye Paketi', sweetEmoji: '🎁',
    ultrasound: {"scan":"Büyük Buluşma","milestone":"Kordon kan akımı ve amniyotik sıvı kontrolü","badge":"Doğum Anı 🌸"},
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
