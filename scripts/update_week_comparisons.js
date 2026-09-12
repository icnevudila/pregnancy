const fs = require('fs');
const path = require('path');

const weekDataFile = path.join(__dirname, '..', 'src', 'weekData.js');
let content = fs.readFileSync(weekDataFile, 'utf8');

const extraData = {
  4: { animal: 'ant', animalName: 'Minik Karınca', animalEmoji: '🐜', sweet: 'sprinkle', sweetName: 'Pasta Süsü', sweetEmoji: '🍬', ultrasound: { scan: 'Kese Taraması', milestone: 'Blastokist rahim duvarına yerleşti', badge: 'Erken Gebelik' } },
  5: { animal: 'ladybug', animalName: 'Uğur Böceği', animalEmoji: '🐞', sweet: 'candy', sweetName: 'Mini Bonbon', sweetEmoji: '🍭', ultrasound: { scan: 'Gestasyonel Kese', milestone: 'Gebelik kesesi ultrasonda seçilebilir', badge: '2D Ultrason' } },
  6: { animal: 'bee', animalName: 'Bal Arısı', animalEmoji: '🐝', sweet: 'chocolate', sweetName: 'Çikolata Draje', sweetEmoji: '🍫', ultrasound: { scan: 'İlk Kalp Atışı', milestone: 'Kalp atışı 110-150 bpm olarak izlenir', badge: 'Doppler' } },
  7: { animal: 'caterpillar', animalName: 'Minik Tırtıl', animalEmoji: '🐛', sweet: 'blueberry_bonbon', sweetName: 'Yaban Mersini Şekeri', sweetEmoji: '🫐', ultrasound: { scan: 'Kol & Bacak Tomurcuğu', milestone: 'Kollarda ve bacaklarda ilk tomurcuklanma', badge: '2D Ultrason' } },
  8: { animal: 'dragonfly', animalName: 'Yusufçuk', animalEmoji: '🪲', sweet: 'gummybear', sweetName: 'Jelibon Ayıcık', sweetEmoji: '🧸', ultrasound: { scan: 'Beyin Gelişimi', milestone: 'Beyin yarım küreleri ve omurga şekilleniyor', badge: '2D Ultrason' } },
  9: { animal: 'snail', animalName: 'Minik Salyangoz', animalEmoji: '🐌', sweet: 'caramel', sweetName: 'Karamel Küpü', sweetEmoji: '🍬', ultrasound: { scan: 'Spontan Hareketler', milestone: 'Bebeğin ilk minik gövde seğirmeleri başlar', badge: '2D Ultrason' } },
  10: { animal: 'grasshopper', animalName: 'Yeşil Çekirge', animalEmoji: '🦗', sweet: 'almond_candy', sweetName: 'Badem Şekeri', sweetEmoji: '🫒', ultrasound: { scan: 'Fetal Dönem Başlangıcı', milestone: 'Tıbben embriyo evresinden fetusa geçildi', badge: '2D Ultrason' } },
  11: { animal: 'fish', animalName: 'Neon Balığı', animalEmoji: '🐠', sweet: 'turkish_delight', sweetName: 'Kuşlokumu', sweetEmoji: '🥟', ultrasound: { scan: 'Parmak Ayrışması', milestone: 'El ve ayak parmak perdeleri açılıyor', badge: '2D Ultrason' } },
  12: { animal: 'chick', animalName: 'Sarı Civciv', animalEmoji: '🐥', sweet: 'macaron', sweetName: 'Fransız Makaronu', sweetEmoji: '🧁', ultrasound: { scan: 'İkili Tarama & NT', milestone: 'Ense kalınlığı ve burun kemiği taranır', badge: 'Altın Tarama' } },
  13: { animal: 'treefrog', animalName: 'Ağaç Kurbağası', animalEmoji: '🐸', sweet: 'cookie', sweetName: 'Çikolatalı Kurabiye', sweetEmoji: '🍪', ultrasound: { scan: 'Ses Telleri & Mimikler', milestone: 'Ses telleri gelişiyor, yutkunma başladı', badge: '2D Ultrason' } },
  14: { animal: 'hamster', animalName: 'Tombik Hamster', animalEmoji: '🐹', sweet: 'teacup', sweetName: 'Porselen Çay Fincanı', sweetEmoji: '☕', ultrasound: { scan: '2. Trimester Başlangıcı', milestone: 'Bebek başparmağını emebilir!', badge: '4D Ultrason' } },
  15: { animal: 'sparrow', animalName: 'Minik Serçe', animalEmoji: '🐦', sweet: 'donut', sweetName: 'Çilekli Donut', sweetEmoji: '🍩', ultrasound: { scan: 'Işık Algısı', milestone: 'Göz kapakları kapalı olsa da ışığı ayırt eder', badge: '2D Ultrason' } },
  16: { animal: 'hedgehog', animalName: 'Yavru Kirpi', animalEmoji: '🦔', sweet: 'cupcake', sweetName: 'Kremalı Cupcake', sweetEmoji: '🧁', ultrasound: { scan: 'Cinsiyet Tespiti', milestone: 'Cinsiyet yüksek doğrulukla görüntülenebilir', badge: 'Cinsiyet Müjdesi' } },
  17: { animal: 'squirrel', animalName: 'Yavru Sincap', animalEmoji: '🐿️', sweet: 'croissant', sweetName: 'Tereyağlı Kruvasan', sweetEmoji: '🥐', ultrasound: { scan: 'Kemikleşme Evresi', milestone: 'Kıkırdaklar güçlü kemik dokusuna dönüşüyor', badge: '2D Ultrason' } },
  18: { animal: 'chameleon', animalName: 'Bukalemun', animalEmoji: '🦎', sweet: 'pretzel', sweetName: 'Çikolatalı Pretzel', sweetEmoji: '🥨', ultrasound: { scan: 'İşitme Başlangıcı', milestone: 'Annenin kalp atışını ve sesini duyabilir', badge: '2D Ultrason' } },
  19: { animal: 'parakeet', animalName: 'Muhabbet Kuşu', animalEmoji: '🦜', sweet: 'pancake', sweetName: 'Ballı Pankek', sweetEmoji: '🥞', ultrasound: { scan: 'Verniks Tabakası', milestone: 'Cildi koruyan kremsi verniks tabakası oluştu', badge: '2D Ultrason' } },
  20: { animal: 'bunny', animalName: 'Minik Tavşan', animalEmoji: '🐰', sweet: 'icecream', sweetName: 'Dondurma Külahı', sweetEmoji: '🍦', ultrasound: { scan: 'Detaylı Anatomi Taraması', milestone: '2. Düzey ultrason: Kalp odacıkları ve tüm organlar', badge: 'Detaylı USG' } },
  21: { animal: 'chinchilla', animalName: 'Çinçilla', animalEmoji: '🐹', sweet: 'waffle', sweetName: 'Belçika Waffle', sweetEmoji: '🧇', ultrasound: { scan: 'Kemik İliği Aktivitesi', milestone: 'Kemik iliği kan hücresi üretmeye başladı', badge: '2D Ultrason' } },
  22: { animal: 'ferret', animalName: 'Sevimli Gelincik', animalEmoji: '🦔', sweet: 'honeyjar', sweetName: 'Bal Kavanozu', sweetEmoji: '🍯', ultrasound: { scan: 'Yüz Çizgileri', milestone: 'Kaşlar, kirpikler ve dudak hatları kusursuz', badge: '4D HD Canlı' } },
  23: { animal: 'duckling', animalName: 'Yavru Ördek', animalEmoji: '🦆', sweet: 'cheesecake', sweetName: 'Frambuazlı Çizkek', sweetEmoji: '🍰', ultrasound: { scan: 'REM Rüyaları', milestone: 'Hızlı göz hareketleri; bebek rüya görebilir', badge: '2D Ultrason' } },
  24: { animal: 'kitten', animalName: 'Yumak Yavru Kedi', animalEmoji: '🐱', sweet: 'pie', sweetName: 'Elmalı Turta', sweetEmoji: '🥧', ultrasound: { scan: 'Akciğer Gelişimi', milestone: 'Surfaktan üretimi ve yaşama eşiği (viability)', badge: 'Kritik Eşik' } },
  25: { animal: 'puppy', animalName: 'Yavru Köpek', animalEmoji: '🐶', sweet: 'pancake_stack', sweetName: 'Katlı Pankek Kulesi', sweetEmoji: '🥞', ultrasound: { scan: 'Sese Tepki', milestone: 'Dış seslere tekme ve sıçramayla yanıt verir', badge: '2D Ultrason' } },
  26: { animal: 'otter', animalName: 'Su Samuru', animalEmoji: '🦦', sweet: 'birthdaycake', sweetName: 'Kutlama Pastası', sweetEmoji: '🎂', ultrasound: { scan: 'Göz Açıp Kırpma', milestone: 'Göz kapakları açıldı, göz kırpma refleksleri', badge: '4D Ultrason' } },
  27: { animal: 'raccoon', animalName: 'Minik Rakun', animalEmoji: '🦝', sweet: 'parfait', sweetName: 'Meyveli Parfe', sweetEmoji: '🍧', ultrasound: { scan: 'Hıçkırık Taraması', milestone: 'Ritmik göğüs hareketleri ve hıçkırıklar izlenir', badge: '2D Ultrason' } },
  28: { animal: 'sloth', animalName: 'Tembel Hayvan', animalEmoji: '🦥', sweet: 'chocobox', sweetName: 'Çikolata Kutusu', sweetEmoji: '🍫', ultrasound: { scan: '3. Trimester Başlangıcı', milestone: 'Beyin kıvrımları hızla derinleşiyor', badge: '3. Trimester' } },
  29: { animal: 'badger', animalName: 'Sevimli Porsuk', animalEmoji: '🦨', sweet: 'sundae', sweetName: 'Karamelli Sundae', sweetEmoji: '🍨', ultrasound: { scan: 'Işık Takibi', milestone: 'Karına tutulan ışığa başını çevirir', badge: '2D Ultrason' } },
  30: { animal: 'koala', animalName: 'Uykucu Koala', animalEmoji: '🐨', sweet: 'basket', sweetName: 'Hediye Sepeti', sweetEmoji: '🎁', ultrasound: { scan: 'Büyüme & Kilo Takibi', milestone: 'Ağırlık ~1.3 kg; kemik iliği tam aktif', badge: 'Biyometri' } },
  31: { animal: 'fennec', animalName: 'Çöl Tilkisi', animalEmoji: '🦊', sweet: 'pecan_pie', sweetName: 'Fındıklı Turta', sweetEmoji: '🥧', ultrasound: { scan: '5 Duyu Aktif', milestone: 'Tat, dokunma, işitme duyuları tamamen açık', badge: '2D Ultrason' } },
  32: { animal: 'kangaroo', animalName: 'Yavru Kanguru', animalEmoji: '🦘', sweet: 'giant_croissant', sweetName: 'Dev Kruvasan', sweetEmoji: '🥐', ultrasound: { scan: 'Tırnak & Saç Takibi', milestone: 'El ve ayak tırnakları parmak ucuna ulaştı', badge: '4D HD Canlı' } },
  33: { animal: 'penguin', animalName: 'Yavru Penguen', animalEmoji: '🐧', sweet: 'teapot', sweetName: 'Porselen Demlik', sweetEmoji: '🫖', ultrasound: { scan: 'Amniyotik Sıvı Zirvesi', milestone: 'Amniyotik sıvı miktarı en yüksek hacimde', badge: 'AFI Ölçümü' } },
  34: { animal: 'beaver', animalName: 'Kunduz Yavrusu', animalEmoji: '🦫', sweet: 'cotton_candy', sweetName: 'Pamuk Şeker', sweetEmoji: '🍬', ultrasound: { scan: 'Bağışıklık Transferi', milestone: 'Anneden bebeğe koruyucu antikor akışı zirvede', badge: '2D Ultrason' } },
  35: { animal: 'skunk', animalName: 'Minik Kokarca', animalEmoji: '🦡', sweet: 'strawberry_cake', sweetName: 'Çilekli Yaş Pasta', sweetEmoji: '🍰', ultrasound: { scan: 'Solunum Pratiği', milestone: 'Akciğerlerle solunum deneme hareketleri', badge: 'Biyofizik Profil' } },
  36: { animal: 'panda', animalName: 'Tombul Panda', animalEmoji: '🐼', sweet: 'tier_cake', sweetName: '2 Katlı Kutlama Pastası', sweetEmoji: '🎂', ultrasound: { scan: 'Doğum Pozisyonu', milestone: 'Baş aşağı pelvis yönüne yerleşme (verteks)', badge: 'Prezente Takibi' } },
  37: { animal: 'lamb', animalName: 'Sevimli Kuzu', animalEmoji: '🐑', sweet: 'mega_donut', sweetName: 'Büyük Festival Donutu', sweetEmoji: '🍩', ultrasound: { scan: 'Erken Term Olgunluk', milestone: 'Artık erken term kabul edilir; ciğerler hazır', badge: 'Term Eşiği' } },
  38: { animal: 'seal', animalName: 'Yavru Fok', animalEmoji: '🦭', sweet: 'picnic_hamper', sweetName: 'Piknik Sepeti', sweetEmoji: '🧺', ultrasound: { scan: 'Güçlü Kavrama', milestone: 'Kavrama refleksi: Parmaklarını sımsıkı kenetler', badge: '4D Ultrason' } },
  39: { animal: 'bear_cub', animalName: 'Yavru Ayıcık', animalEmoji: '🐻', sweet: 'balloon_bouquet', sweetName: 'Kutlama Buketi', sweetEmoji: '🎈', ultrasound: { scan: 'Tam Dönem (Full Term)', milestone: 'Tüm organlar dış dünya havasına ve sütüne hazır', badge: 'Full Term' } },
  40: { animal: 'lion_cub', animalName: 'Minik Aslan', animalEmoji: '🦁', sweet: 'gift_box', sweetName: 'Büyük Hediye Paketi', sweetEmoji: '🎁', ultrasound: { scan: 'Büyük Buluşma', milestone: 'Kordon kan akımı ve amniyotik sıvı kontrolü', badge: 'Doğum Anı 🌸' } }
};

let modifiedCount = 0;
for (let w = 4; w <= 40; w++) {
  const ex = extraData[w];
  if (!ex) continue;
  
  const reg = new RegExp(`(${w}:\\s*\\{[\\s\\S]*?fruitName:\\s*['"][^'"]+['"],)`);
  if (reg.test(content)) {
    const addition = `\n    animal: '${ex.animal}', animalName: '${ex.animalName}', animalEmoji: '${ex.animalEmoji}',\n    sweet: '${ex.sweet}', sweetName: '${ex.sweetName}', sweetEmoji: '${ex.sweetEmoji}',\n    ultrasound: ${JSON.stringify(ex.ultrasound)},`;
    content = content.replace(reg, `$1${addition}`);
    modifiedCount++;
  }
}

fs.writeFileSync(weekDataFile, content, 'utf8');
console.log(`✅ weekData.js ${modifiedCount} hafta için başarıyla güncellendi!`);
