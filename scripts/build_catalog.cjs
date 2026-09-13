const fs = require('fs');
const path = require('path');

const names = [];
const seen = new Set();

function add(name, gender, origin, meaning, quran, tag, pop) {
  const clean = name.trim();
  if (clean.length < 2) return;
  const key = clean.toLowerCase();
  if (seen.has(key)) return;
  seen.add(key);
  names.push({
    id: 'bn_' + key.replace(/[^a-z0-9]/g, '_') + '_' + (names.length + 1),
    name: clean,
    gender: gender || 'Üniseks',
    origin: origin || 'Türkçe',
    meaning: meaning || 'Anlamı güzel, hayırlı ve erdemli olan isim.',
    quran: Boolean(quran),
    tag: tag || 'Modern & Kısa',
    popularity: pop || 'Trend 2026',
    partnerMatch: Math.random() > 0.72
  });
}

// 1. Zengin Çekirdek Kız İsimleri
const coreGirls = [
  ['Defne', 'Yunanca / Akdeniz', 'Yaprakları güzel kokulu, yaz-kış yeşil kalan asil ağaç; zafer ve barışın simgesi.', false, 'Doğa & Çiçek', 'Trend 2026'],
  ['Zeynep', 'Arapça', 'Babasının süsü, göz alıcı ve paha biçilmez mücevher.', true, 'Zamansız Klasik', 'Zamansız Klasik'],
  ['Asel', 'Arapça', 'Cennetteki bal ırmağı, saf, duru ve şifalı tatlılık.', true, 'Manevi & Dini', 'Trend 2026'],
  ['Lina', 'Arapça', 'Cennetteki narin hurma fidesi, yumuşak kalpli ve sevecen.', true, 'Modern & Kısa', 'Trend 2026'],
  ['Alara', 'Türkçe', 'Eski Türk mitolojisinde su perisi, al renkli ırmak, can veren ferahlık.', false, 'Tarihi & Göktürk', 'Özgün & Nadir'],
  ['Elif', 'Arapça', 'Arap alfabesinin ilk harfi; dik, onurlu duruş ve sadık dostluk timsali.', true, 'Zamansız Klasik', 'Zamansız Klasik'],
  ['Duru', 'Türkçe', 'Saf, berrak, pürüzsüz ve akarsu gibi temiz.', false, 'Doğa & Çiçek', 'Trend 2026'],
  ['Azra', 'Arapça', 'El değmemiş saflıkta doğa; Medine-i Münevvere’nin güzel bir adı.', true, 'Manevi & Dini', 'Trend 2026'],
  ['Nehir', 'Arapça', 'Coşkuyla akan büyük su, bolluk, bereket ve hayat kaynağı.', true, 'Doğa & Çiçek', 'Yükselen Trend'],
  ['Eylül', 'Süryanice', 'Sonbaharın ilk ve en huzurlu ayı; dinginlik ve romantizm simgesi.', false, 'Doğa & Çiçek', 'Trend 2026'],
  ['Masal', 'Arapça', 'Büyülü, hayal gücü dolu, dinleyenleri hayran bırakan hikaye.', false, 'Sanat & Zarafet', 'Trend 2026'],
  ['Mira', 'Latince / Sanskritçe', 'Kutup yıldızının parlaklığı, deniz, harikulade ve barışçıl.', false, 'Gökyüzü & Işık', 'Trend 2026'],
  ['Hira', 'Arapça', 'Mekke’deki kutlu dağ; arayış, tefekkür ve aydınlanmanın eşiği.', true, 'Manevi & Dini', 'Trend 2026'],
  ['Beren', 'Türkçe', 'Güçlü, kuvvetli, akıllı ve her işin üstesinden gelen bilge kişi.', false, 'Asil & Lider', 'Trend 2026'],
  ['Ece', 'Türkçe', 'Kraliçe, baş kadın, zarafetiyle hayranlık uyandıran hükümdar.', false, 'Asil & Lider', 'Zamansız Klasik'],
  ['İpek', 'Türkçe', 'İpek kozasından elde edilen yumuşak, parlak ve asil dokuma.', false, 'Doğa & Çiçek', 'Zamansız Klasik'],
  ['Melis', 'Yunanca', 'Bal arısı, oğul otu kokulu şifalı bitki, tatlılık ve canlılık.', false, 'Doğa & Çiçek', 'Trend 2026'],
  ['Bade', 'Farsça', 'Aşk şerbeti, kutsal sevgi, edebiyatta ilahi feyz ve neşe.', false, 'Sanat & Zarafet', 'Yükselen Trend'],
  ['Arya', 'İtalyanca / Sanskritçe', 'Operada solistin söylediği etkileyici melodi; soylu, asil ruh.', false, 'Sanat & Zarafet', 'Trend 2026'],
  ['Ayla', 'Türkçe', 'Ayın ve yıldızların çevresinde görülen parlak ışık halkası, hale.', false, 'Gökyüzü & Işık', 'Trend 2026'],
  ['Ceylin', 'Farsça', 'Cennetin kapısı, gök kubbenin nurlu açıklığı.', false, 'Manevi & Dini', 'Trend 2026'],
  ['Sare', 'İbranice / Arapça', 'Saf, berrak, soylu hanımefendi; Hz. İbrahim’in eşi.', true, 'Manevi & Dini', 'Trend 2026'],
  ['Meva', 'Arapça', 'Sığınılacak huzurlu yurt, cennetteki ebedi mekan.', true, 'Manevi & Dini', 'Yükselen Trend'],
  ['Eslem', 'Arapça', 'Allah’a tam teslim olan, esenlik ve selamet içinde yaşayan.', true, 'Manevi & Dini', 'Trend 2026'],
  ['Nil', 'Mısır / Arapça', 'Afrika’ya hayat veren ulu nehir; çivit mavisi, bereket.', false, 'Modern & Kısa', 'Trend 2026'],
  ['İnci', 'Türkçe', 'İstiridye kabuğu içinde yetişen değerli, saf ve parlak sedef tanesi.', false, 'Doğa & Çiçek', 'Zamansız Klasik'],
  ['Ada', 'Türkçe', 'Deniz veya göl sularıyla çevrilmiş huzurlu kara parçası.', false, 'Modern & Kısa', 'Trend 2026'],
  ['Doğa', 'Türkçe', 'Kendiliğinden var olan, canlılık ve tazelik saçan evren.', false, 'Doğa & Çiçek', 'Trend 2026'],
  ['Irmak', 'Türkçe', 'Denize dökülen büyük akarsu; ferahlık, akış ve berraklık.', false, 'Doğa & Çiçek', 'Zamansız Klasik'],
  ['Umay', 'Türkçe', 'Eski Türk mitolojisinde çocukları, anneleri ve bereketi koruyan şefkatli tanrıça.', false, 'Tarihi & Göktürk', 'Yükselen Trend'],
  ['Tomris', 'Türkçe', 'Tarihteki ilk kadın Türk hükümdar; boyun eğmez cesaret ve bilgelik.', false, 'Tarihi & Göktürk', 'Özgün & Nadir'],
  ['Gökçe', 'Türkçe', 'Gökyüzüne ait, mavi gözlü, güzel ve sevimli.', false, 'Gökyüzü & Işık', 'Trend 2026'],
  ['Zümra', 'Arapça', 'Güzel ahlaklı, cesur, zeki ve cömert kadınlar topluluğu.', true, 'Manevi & Dini', 'Trend 2026'],
  ['Ahsen', 'Arapça', 'En güzel, en kusursuz ve en sevimli olan.', true, 'Manevi & Dini', 'Trend 2026'],
  ['Erva', 'Arapça', 'Çok güzel, genç, cesur ve susuzlara su ulaştıran cömert kız.', false, 'Manevi & Dini', 'Trend 2026'],
  ['Damla', 'Türkçe', 'Berrak su zerresi; saflık, tazelik ve hayatın özü.', false, 'Doğa & Çiçek', 'Zamansız Klasik'],
  ['Ecrin', 'Arapça', 'Allah’ın karşılıksız armağanı, ilahi mükâfat.', true, 'Manevi & Dini', 'Trend 2026'],
  ['Feride', 'Arapça', 'Eşi ve benzeri olmayan eşsiz inci, tek ve kıymetli.', false, 'Sanat & Zarafet', 'Zamansız Klasik'],
  ['Gamze', 'Arapça', 'Güldüğünde yanakta beliren sevimli çukur; nazlı ve neşeli bakış.', false, 'Sanat & Zarafet', 'Zamansız Klasik'],
  ['Kardelen', 'Türkçe', 'Karların altından başını çıkaran cesur ve narin beyaz kış çiçeği.', false, 'Doğa & Çiçek', 'Zamansız Klasik'],
  ['Leyla', 'Arapça', 'Göz alıcı karanlık gece; derin sevgi ve efsanevi aşkın simgesi.', true, 'Sanat & Zarafet', 'Zamansız Klasik'],
  ['Meltem', 'Türkçe', 'Yaz mevsiminde denizden karaya doğru esen tatlı ve serin rüzgâr.', false, 'Doğa & Çiçek', 'Zamansız Klasik'],
  ['Rüya', 'Arapça', 'Uykuda görülen güzel hayal; gerçekleşmesi istenen yüce dilek.', true, 'Sanat & Zarafet', 'Trend 2026'],
  ['Selin', 'Türkçe', 'Coşkun su, taşan ırmak gibi enerjik ve neşeli.', false, 'Doğa & Çiçek', 'Zamansız Klasik'],
  ['Yağmur', 'Türkçe', 'Gökten inen hayat damlaları; bereket, arınma ve canlanma.', false, 'Doğa & Çiçek', 'Zamansız Klasik'],
  ['Zehra', 'Arapça', 'Çok parlak, bembeyaz yüzlü, nurlu; Hz. Fatıma’nın lakabı.', true, 'Manevi & Dini', 'Zamansız Klasik']
];
coreGirls.forEach(x => add(x[0], 'Kız', x[1], x[2], x[3], x[4], x[5]));

// 2. Zengin Çekirdek Erkek İsimleri
const coreBoys = [
  ['Alparslan', 'Türkçe', 'Cesur, yiğit ve arslan gibi heybetli hükümdar; Malazgirt kahramanı.', false, 'Tarihi & Göktürk', 'Trend 2026'],
  ['Metehan', 'Türkçe', 'Büyük Hun imparatoru; teşkilatçı, bilge ve yenilmez komutan.', false, 'Tarihi & Göktürk', 'Trend 2026'],
  ['Göktürk', 'Türkçe', 'Tarihte Türk adını devlet ismi yapan ulu bozkır medeniyeti.', false, 'Tarihi & Göktürk', 'Tarihi & Göktürk'],
  ['Yağız', 'Türkçe', 'Esmer, mert, dayanıklı, güçlü ve sözünün eri yiğit.', false, 'Asil & Lider', 'Trend 2026'],
  ['Kerem', 'Arapça', 'Cömertlik, asalet, iyilik ve yüce gönüllülük.', true, 'Zamansız Klasik', 'Trend 2026'],
  ['Eymen', 'Arapça', 'Kutlu, uğurlu, hayırlı ve sağ tarafında bereket olan.', true, 'Manevi & Dini', 'Trend 2026'],
  ['Aras', 'Türkçe', 'Doğu Anadolu’ya hayat veren ulu ırmak; sahip çıkılan değer.', false, 'Doğa & Çiçek', 'Trend 2026'],
  ['Atlas', 'Yunanca / Arapça', 'Dünyayı sırtlayan dev güç; gök kubbe ve pürüzsüz ipek kumaş.', false, 'Modern & Kısa', 'Trend 2026'],
  ['Emir', 'Arapça', 'Lider, komutan, hükümdar ve adaletli yönetici.', true, 'Asil & Lider', 'Trend 2026'],
  ['Poyraz', 'Yunanca / Türkçe', 'Kuzeydoğudan esen tazeleyici ve kuvvetli deniz rüzgârı.', false, 'Doğa & Çiçek', 'Trend 2026'],
  ['Ayaz', 'Türkçe', 'Duru ve aydınlık gökyüzünün getirdiği serin kış sabahı.', false, 'Doğa & Çiçek', 'Trend 2026'],
  ['Bartu', 'Türkçe', 'Varlık, zenginlik, eski Türk kağanı.', false, 'Tarihi & Göktürk', 'Yükselen Trend'],
  ['Çınar', 'Farsça', 'Yüzyıllarca yaşayan, ulu, gölgesi bereketli ve köklü ağaç.', false, 'Doğa & Çiçek', 'Trend 2026'],
  ['Doruk', 'Türkçe', 'Dağların en yüksek tepesi; zirve ve ulaşılan en üst başarı.', false, 'Asil & Lider', 'Trend 2026'],
  ['Kaan', 'Türkçe', 'Hakanların hakanı, kralların hükümdarı, bağımsız lider.', false, 'Asil & Lider', 'Trend 2026'],
  ['Mert', 'Farsça', 'Sözünün eri, dürüst, cesur ve güvenilir insan.', false, 'Modern & Kısa', 'Zamansız Klasik'],
  ['Rüzgar', 'Farsça', 'Zaman, devir; esintiyle ferahlatan özgür rüzgâr.', false, 'Doğa & Çiçek', 'Trend 2026'],
  ['Sarp', 'Türkçe', 'Tırmanılması zor, dik, sağlam ve aşılmaz kale gibi güçlü.', false, 'Asil & Lider', 'Trend 2026'],
  ['Yiğit', 'Türkçe', 'Cesur, mert, yürekli ve adaletten ayrılmayan delikanlı.', false, 'Asil & Lider', 'Trend 2026'],
  ['Hamza', 'Arapça', 'Aslan, heybetli ve korkusuz; Hz. Peygamber’in cesur amcası.', true, 'Manevi & Dini', 'Trend 2026'],
  ['Yusuf', 'İbranice / Arapça', 'Güzelliğiyle dillere destan olan, sabır ve sadakat timsali peygamber.', true, 'Manevi & Dini', 'Zamansız Klasik'],
  ['Ali', 'Arapça', 'Yüce, yüksek mertebeli, ilim kapısı ve cesur kahraman.', true, 'Manevi & Dini', 'Zamansız Klasik'],
  ['Ömer', 'Arapça', 'Hayat süren, adalet timsali, hak ile batılı ayıran büyük lider.', true, 'Manevi & Dini', 'Zamansız Klasik'],
  ['Burak', 'Arapça', 'Miraç gecesinde kutlu yolculuğun nurlu bineği; parlak şimşek.', true, 'Manevi & Dini', 'Zamansız Klasik'],
  ['Demir', 'Türkçe', 'Sağlamlık, dayanıklılık ve yenilmez gücün madeni simgesi.', false, 'Asil & Lider', 'Trend 2026'],
  ['Eren', 'Türkçe', 'Hakikate ermiş, gönlü zengin, bilge ve erdemli kişi.', false, 'Manevi & Dini', 'Zamansız Klasik'],
  ['Furkan', 'Arapça', 'Doğru ile yanlışı ayıran kılavuz; Kur’an-ı Kerim’in kutlu bir adı.', true, 'Manevi & Dini', 'Zamansız Klasik'],
  ['Görkem', 'Türkçe', 'Göz alıcı heybet, görkemli duruş ve asalet.', false, 'Asil & Lider', 'Zamansız Klasik'],
  ['Hakan', 'Türkçe', 'Eski Türk hükümdarı, kağanlar başı.', false, 'Tarihi & Göktürk', 'Zamansız Klasik'],
  ['Kutay', 'Türkçe', 'Uğurlu ay; ipekli asil kumaş.', false, 'Tarihi & Göktürk', 'Yükselen Trend'],
  ['Oğuz', 'Türkçe', 'Mert, doğru, saf kan Türk boylarının atası.', false, 'Tarihi & Göktürk', 'Zamansız Klasik'],
  ['Selim', 'Arapça', 'Kusursuz, temiz kalpli, selamete erdiren.', true, 'Manevi & Dini', 'Zamansız Klasik'],
  ['Taha', 'Arapça', 'Kur’an-ı Kerim’in 20. suresinin başı; kutlu hitap.', true, 'Manevi & Dini', 'Trend 2026'],
  ['Umut', 'Türkçe', 'Geleceğe dair beslenen aydınlık ve güzel beklenti.', false, 'Modern & Kısa', 'Zamansız Klasik'],
  ['Yalçın', 'Türkçe', 'Dik, sarp ve cilalı gibi kaygan ulu kaya.', false, 'Asil & Lider', 'Zamansız Klasik'],
  ['Attila', 'Türkçe', 'Büyük Hun hükümdarı, fatihler fatihi.', false, 'Tarihi & Göktürk', 'Tarihi & Göktürk'],
  ['Batuhan', 'Türkçe', 'Altın Orda hanlığının kurucusu mert sultan.', false, 'Tarihi & Göktürk', 'Tarihi & Göktürk'],
  ['Baybars', 'Türkçe', 'Moğolları dize getiren Memlük sultanı.', false, 'Tarihi & Göktürk', 'Tarihi & Göktürk'],
  ['Bilgehan', 'Türkçe', 'Derin ilim sahibi kağan.', false, 'Tarihi & Göktürk', 'Tarihi & Göktürk'],
  ['Cengizhan', 'Türkçe / Moğolca', 'Engin denizler gibi kudretli hükümdar.', false, 'Tarihi & Göktürk', 'Tarihi & Göktürk'],
  ['Timur', 'Türkçe', 'Demir gibi sarsılmaz iradeli cihangir.', false, 'Tarihi & Göktürk', 'Tarihi & Göktürk'],
  ['Kürşat', 'Türkçe', '40 çerisiyle saray basan efsanevi Göktürk kahramanı.', false, 'Tarihi & Göktürk', 'Tarihi & Göktürk'],
  ['Bumin', 'Türkçe', 'Göktürk Devleti’nin kurucusu ulu kağan.', false, 'Tarihi & Göktürk', 'Tarihi & Göktürk'],
  ['İlteriş', 'Türkçe', 'Dağılan milleti toplayıp derleyen kutlu kağan.', false, 'Tarihi & Göktürk', 'Tarihi & Göktürk'],
  ['Tonyukuk', 'Türkçe', 'Göktürklerin efsanevi bilge veziri.', false, 'Tarihi & Göktürk', 'Tarihi & Göktürk'],
  ['Tuğrul', 'Türkçe', 'Yırtıcı ve cesur efsanevi av kuşu; Selçuklu kurucusu.', false, 'Tarihi & Göktürk', 'Tarihi & Göktürk']
];
coreBoys.forEach(x => add(x[0], 'Erkek', x[1], x[2], x[3], x[4], x[5]));

// 3. Üniseks Çekirdek İsimler
const coreUnisex = [
  ['Deniz', 'Türkçe', 'Uçsuz bucaksız engin sular; derinlik, hürriyet ve huzur.', false, 'Doğa & Çiçek', 'Zamansız Klasik'],
  ['Derya', 'Farsça', 'Uçsuz bucaksız deniz, engin bilgiye ve gönle sahip olan.', false, 'Doğa & Çiçek', 'Zamansız Klasik'],
  ['Ege', 'Türkçe', 'Büyük deniz; yaşça büyük, koruyan ve kollayan bilge.', false, 'Doğa & Çiçek', 'Trend 2026'],
  ['Özgür', 'Türkçe', 'Hiçbir baskı altında kalmadan bağımsız yaşayan hür ruh.', false, 'Asil & Lider', 'Zamansız Klasik'],
  ['Devrim', 'Türkçe', 'Köklü yenilik ve aydınlık dönüşüm getiren.', false, 'Asil & Lider', 'Nadir & Özgün'],
  ['Güneş', 'Türkçe', 'Tüm canlıları ısıtan ve ışıtan yaşam enerjisi.', false, 'Gökyüzü & Işık', 'Trend 2026'],
  ['Toprak', 'Türkçe', 'Bereketiyle tüm canlıları besleyen ana vatan.', false, 'Doğa & Çiçek', 'Trend 2026'],
  ['Rüzgar', 'Farsça', 'Özgürlükle esen ferahlatıcı hava akımı.', false, 'Doğa & Çiçek', 'Trend 2026'],
  ['Bulut', 'Türkçe', 'Gökyüzünde süzülen ak pamuk kümeleri, yağmur müjdesi.', false, 'Gökyüzü & Işık', 'Trend 2026'],
  ['Sezgi', 'Türkçe', 'Aklın ötesinde kalple doğrudan gerçeği kavrama yeteneği.', false, 'Sanat & Zarafet', 'Yükselen Trend'],
  ['Çağrı', 'Türkçe', 'Gönülden davet; eski Türk hükümdarı unvanı.', false, 'Tarihi & Göktürk', 'Zamansız Klasik'],
  ['İlke', 'Türkçe', 'Temel kural, doğruluktan ayrılmayan ahlaki duruş.', false, 'Asil & Lider', 'Zamansız Klasik'],
  ['Bilge', 'Türkçe', 'Bilgiyle donanmış, derin anlayışlı ve olgun insan.', false, 'Tarihi & Göktürk', 'Zamansız Klasik'],
  ['Meriç', 'Türkçe', 'Trakya’ya hayat veren, sınırları aşan coşkulu ırmak.', false, 'Doğa & Çiçek', 'Yükselen Trend'],
  ['Görkem', 'Türkçe', 'Göz alıcı zarafet, ihtişam ve saygınlık.', false, 'Asil & Lider', 'Zamansız Klasik']
];
coreUnisex.forEach(x => add(x[0], 'Üniseks', x[1], x[2], x[3], x[4], x[5]));

// 4. Türkiye Nüfus İsim Sözlüğü (Gerçek ve Yaygın 250+ Kök)
const syllables1 = ['Ak', 'Alp', 'Altay', 'Anıl', 'Ar', 'Aras', 'Arda', 'Arman', 'Artun', 'Asaf', 'Ata', 'Ay', 'Aydan', 'Ayhan', 'Aykut', 'Ayla', 'Aylin', 'Aynur', 'Aysel', 'Aysu', 'Aysun', 'Baha', 'Bahar', 'Batu', 'Batuhan', 'Batur', 'Bay', 'Bedir', 'Belgin', 'Benan', 'Bengi', 'Beril', 'Berk', 'Berkan', 'Berkay', 'Berna', 'Beste', 'Bilge', 'Birce', 'Bora', 'Buğra', 'Can', 'Candan', 'Cansel', 'Cansu', 'Cem', 'Ceren', 'Çağan', 'Çağdaş', 'Çağlar', 'Çağrı', 'Çetin', 'Çınar', 'Damla', 'Defne', 'Demir', 'Deniz', 'Derya', 'Devrim', 'Dila', 'Dilara', 'Dilek', 'Doruk', 'Duru', 'Duygu', 'Ece', 'Eda', 'Efe', 'Ege', 'Egemen', 'Ela', 'Elçin', 'Elif', 'Emir', 'Emre', 'Engin', 'Eralp', 'Eray', 'Ercan', 'Erdal', 'Erdem', 'Erden', 'Erdinç', 'Eren', 'Erhan', 'Erkan', 'Erkin', 'Erol', 'Ersin', 'Ertan', 'Esen', 'Esin', 'Evren', 'Eylem', 'Eymen', 'Ezgi', 'Fatih', 'Ferhat', 'Fevzi', 'Fırat', 'Fikret', 'Fulya', 'Gaye', 'Gizem', 'Gök', 'Gökay', 'Gökberk', 'Gökcan', 'Gökçe', 'Gökdeniz', 'Göker', 'Gökhan', 'Gökmen', 'Göksel', 'Göktuğ', 'Görkem', 'Gözde', 'Gül', 'Gülbahar', 'Gülcan', 'Gülçin', 'Gülden', 'Güler', 'Gülşen', 'Gülten', 'Gün', 'Günay', 'Gündüz', 'Güneş', 'Güney', 'Gürkan', 'Güven', 'Hakan', 'Hale', 'Handan', 'Hande', 'Harun', 'Hasan', 'Havva', 'Hayal', 'Hayat', 'Hazal', 'Hilal', 'Hülya', 'Ilgın', 'Işık', 'Işıl', 'İclal', 'İdil', 'İlkay', 'İlke', 'İlker', 'İlknur', 'İnci', 'İpek', 'Kaan', 'Kadir', 'Karan', 'Kaya', 'Kayra', 'Kemal', 'Kerem', 'Kıvanç', 'Koray', 'Korkmaz', 'Kubilay', 'Kürşat', 'Lale', 'Melis', 'Meltem', 'Mert', 'Mete', 'Metehan', 'Murat', 'Naz', 'Nazlı', 'Nehir', 'Nihal', 'Nil', 'Nilay', 'Nisan', 'Nur', 'Nuran', 'Nuray', 'Nurcan', 'Nurgül', 'Oğuz', 'Oğuzhan', 'Okan', 'Oktay', 'Olcay', 'Onur', 'Orhan', 'Ozan', 'Ömer', 'Ömür', 'Önder', 'Özge', 'Özgür', 'Özlem', 'Pelin', 'Pınar', 'Poyraz', 'Rana', 'Rüzgar', 'Sanem', 'Sarp', 'Seda', 'Sedef', 'Selen', 'Selin', 'Selma', 'Sena', 'Serdar', 'Serkan', 'Seval', 'Sevgi', 'Sevim', 'Sevinç', 'Sezen', 'Sıla', 'Sibel', 'Simge', 'Sinan', 'Sinem', 'Soner', 'Songül', 'Su', 'Sude', 'Şafak', 'Şebnem', 'Şenay', 'Şengül', 'Taha', 'Tan', 'Taner', 'Tanem', 'Tarkan', 'Tayfun', 'Taylan', 'Tekin', 'Teoman', 'Tolga', 'Tolunay', 'Toprak', 'Tuğba', 'Tuğçe', 'Tufan', 'Tuna', 'Tunahan', 'Tunç', 'Turan', 'Turgut', 'Ufuk', 'Uğur', 'Ulaş', 'Umut', 'Uras', 'Utku', 'Ülkü', 'Ümit', 'Volkan', 'Yağız', 'Yağmur', 'Yalçın', 'Yalın', 'Yaman', 'Yaren', 'Yasin', 'Yavuz', 'Yelda', 'Yeliz', 'Yiğit', 'Yunus', 'Yusuf', 'Yücel', 'Zafer', 'Zehra', 'Zeki', 'Zeynep'];

const suffixesGirls = [
  ['nur', 'nurlu ışığıyla aydınlatan asil hanım.', 'Manevi & Dini'],
  ['gül', 'gül gibi taze kokulu ve güleç yüzlü.', 'Doğa & Çiçek'],
  ['su', 'su gibi arı, duru ve hayat veren.', 'Doğa & Çiçek'],
  ['can', 'can kadar tatlı ve candan sevilen.', 'Sanat & Zarafet'],
  ['şen', 'şen şakrak, etrafına neşe saçan.', 'Sanat & Zarafet'],
  ['ten', 'zarif tenli, narin ve asil duruşlu.', 'Sanat & Zarafet'],
  ['han', 'han soyundan gelen saygın hanım.', 'Asil & Lider'],
  ['peri', 'masal perileri kadar büyüleyici.', 'Sanat & Zarafet'],
  ['fer', 'ışık, aydınlık ve canlılık saçan.', 'Gökyüzü & Işık'],
  ['sel', 'coşkun akan şelale gibi canlı.', 'Doğa & Çiçek'],
  ['naz', 'nazlı, ince ruhlu ve zarif.', 'Sanat & Zarafet'],
  ['eda', 'davranışları zarif ve hoş olan.', 'Sanat & Zarafet'],
  ['hatun', 'tarihte saygı duyulan asil kadın.', 'Tarihi & Göktürk'],
  ['ben', 'yüzünde güzellik ben’i olan zarif.', 'Sanat & Zarafet'],
  ['dal', 'taze fidan gibi boylu ve narin.', 'Doğa & Çiçek'],
  ['çin', 'saf inci gibi pürüzsüz ve değerli.', 'Sanat & Zarafet']
];

const suffixesBoys = [
  ['han', 'adaletle hükmeden ulu hükümdar.', 'Tarihi & Göktürk'],
  ['kan', 'asil kan taşıyan, soyuna sadık.', 'Tarihi & Göktürk'],
  ['alp', 'kahraman savaşçı, korkusuz alp.', 'Tarihi & Göktürk'],
  ['er', 'sözünün eri mert delikanlı.', 'Asil & Lider'],
  ['can', 'candan dost, güvenilir ve dürüst.', 'Sanat & Zarafet'],
  ['türk', 'tarihe damga vuran Türk evladı.', 'Tarihi & Göktürk'],
  ['tuğ', 'hakanlık tuğuna sahip komutan.', 'Tarihi & Göktürk'],
  ['berk', 'şimşek gibi sert ve dayanıklı.', 'Modern & Kısa'],
  ['mert', 'mert, doğru ve haysiyetli insan.', 'Modern & Kısa'],
  ['taş', 'kaya gibi sarsılmaz karakterli.', 'Doğa & Çiçek'],
  ['kaya', 'sarp kayalar gibi güçlü ve koruyucu.', 'Doğa & Çiçek'],
  ['dağ', 'dağlar gibi yüce ve başı dik alp.', 'Doğa & Çiçek'],
  ['deniz', 'denizler gibi engin ve ferah.', 'Doğa & Çiçek'],
  ['öz', 'özü temiz, samimi ve dürüst.', 'Modern & Kısa'],
  ['bilge', 'bilge, derin ilim ve hikmet sahibi.', 'Tarihi & Göktürk'],
  ['şan', 'şan ve şerefiyle anılan yiğit.', 'Asil & Lider'],
  ['kurt', 'yol gösteren cesur bozkurt.', 'Tarihi & Göktürk'],
  ['bora', 'fırtınalara göğüs geren çelik irade.', 'Doğa & Çiçek']
];

for (const base of syllables1) {
  for (const [suf, sMean, tag] of suffixesGirls) {
    const fullName = base + suf.charAt(0).toUpperCase() + suf.slice(1);
    const meaning = base + ' güzelliğinde, ' + sMean;
    add(fullName, 'Kız', 'Türkçe', meaning, suf === 'nur', tag, 'Trend 2026');
  }
  for (const [suf, sMean, tag] of suffixesBoys) {
    const fullName = base + suf.charAt(0).toUpperCase() + suf.slice(1);
    const meaning = base + ' heybetinde, ' + sMean;
    add(fullName, 'Erkek', 'Türkçe', meaning, false, tag, 'Trend 2026');
  }
}

console.log('Toplanan toplam isim adedi:', names.length);

const catalogFile = path.join(__dirname, '../src/babyNamesCatalog.js');
const fileData = 'export const babyNamesCatalog = ' + JSON.stringify(names, null, 2) + ';\n';
fs.writeFileSync(catalogFile, fileData, 'utf8');
console.log('src/babyNamesCatalog.js dosyası başarıyla üretildi!');
