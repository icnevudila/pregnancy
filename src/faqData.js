// Momora En Çok Sorulan Sorular (SSS) Veritabanı
// Gebelik, Doğum, Lohusalık ve Yenidoğan Bakımında En Çok Merak Edilen 40+ Soru ve Kanıta Dayalı Uzman Yanıtları

export const faqCategories = [
  'Tümü',
  '1. Trimester · Hafta 1-12',
  '2. Trimester · Hafta 13-27',
  '3. Trimester · Hafta 28-40',
  'Beslenme & Gıda Güvenliği',
  'Doğum & Hastane',
  'Lohusalık & İyileşme',
  'Yenidoğan & Emzirme',
];

export const pregnancyFaqs = [
  // ─── 1. TRIMESTER ───
  {
    id: 'faq-1',
    category: '1. Trimester · Hafta 1-12',
    q: 'Mide bulantısı ve kusma ne zaman geçer? Bebeğime zarar verir mi?',
    a: 'Mide bulantıları gebelik hormonu (hCG) artışına bağlıdır ve genellikle 6. haftada başlayıp 12-14. haftalarda belirgin şekilde azalır. Hafif ve orta derece bulantılar bebeğin gelişimini olumsuz etkilemez çünkü bebek ihtiyaç duyduğu besinleri vücudunuzun depolarından çeker. Sabah kalkmadan önce tuzlu kraker atıştırmak, az ve sık yemek ve zencefil çayı tüketmek rahatlatır. Hiçbir sıvı tutamıyorsanız doktorunuza danışmalısınız.',
    tags: ['bulantı', 'kusma', 'hcg', 'beslenme', 'ilk trimester']
  },
  {
    id: 'faq-2',
    category: '1. Trimester · Hafta 1-12',
    q: 'Erken gebelikte hafif lekelenme veya kasık batması normal mi?',
    a: 'Gebeliğin ilk haftalarında embriyonun rahim duvarına tutunması sırasında "yerleşme kanaması" (hafif pembe-kahverengi lekelenme) ve rahim kaslarının esnemesine bağlı batmalar çok yaygındır. Ancak kanama adet kanaması yoğunluğuna ulaşırsa, parlak kırmızı renkteyse veya şiddetli tek taraflı kasık ağrısı eşlik ediyorsa acilen hekiminize başvurmalısınız.',
    tags: ['lekelenme', 'kanama', 'kasık ağrısı', 'yerleşme kanaması']
  },
  {
    id: 'faq-3',
    category: '1. Trimester · Hafta 1-12',
    q: 'Folik asit ne kadar süre kullanılmalıdır?',
    a: 'Folik asit (günde en az 400 mcg), bebeğin beyin ve omurilik gelişiminde nöral tüp defektlerini önlemek için gebelik planlamasından başlayarak ilk 12. haftanın sonuna kadar kesintisiz kullanılmalıdır. 12. haftadan sonra hekiminiz ihtiyacınıza göre multivitamin veya demir/D vitamini takviyesine geçiş yapabilir.',
    tags: ['folik asit', 'vitamin', 'omurilik', 'nöral tüp']
  },
  {
    id: 'faq-4',
    category: '1. Trimester · Hafta 1-12',
    q: 'Gebelikte cinsel ilişki güvenli midir?',
    a: 'Doktorunuz tarafından düşük tehdidi, rahim ağzı yetmezliği veya plasenta previa gibi özel bir risk belirtilmediği sürece gebeliğin tüm dönemlerinde cinsel ilişki güvenlidir. Bebek rahim kasları ve amniyon kesesi içinde mükemmel şekilde korunmaktadır.',
    tags: ['cinsellik', 'ilişki', 'güvenlik', 'ilk aylar']
  },
  {
    id: 'faq-5',
    category: '1. Trimester · Hafta 1-12',
    q: 'Saç boyatmak veya oje sürmek bebeğe geçer mi?',
    a: 'Özellikle organ gelişiminin en hassas olduğu ilk 12 hafta boyunca kimyasal maruziyetini en aza indirmek için saç boyatma ertelenmelidir. 2. trimesterden sonra bitkisel/amonyaksız boyalar tercih edilebilir. Tırnak cilaları ve asetonlar iyi havalandırılan ortamlarda ara sıra kullanılabilir.',
    tags: ['saç boyası', 'kozmetik', 'oje', 'kimyasal']
  },

  // ─── 2. TRIMESTER ───
  {
    id: 'faq-6',
    category: '2. Trimester · Hafta 13-27',
    q: 'Bebeğimin tekmelerini ilk ne zaman hissederim?',
    a: 'İlk gebeliklerde tekmeler genellikle 18-22. haftalar arasında hissedilir; daha önce doğum yapmış anneler ise 16. haftadan itibaren bu hissi tanıyabilir. İlk hareketler gaz kabarcığı, seğirme veya kelebek kanadı çırpıntısı gibidir. 24. haftadan sonra hareketler net ve belirgin bir ritme kavuşur.',
    tags: ['tekme', 'hareket', 'hissetme', 'ikinci trimester']
  },
  {
    id: 'faq-7',
    category: '2. Trimester · Hafta 13-27',
    q: 'Detaylı (ayrıntılı) ultrason ne zaman yapılır ve neden önemlidir?',
    a: 'Detaylı ultrason genellikle 20-22. haftalar arasında perinatoloji uzmanı veya kadın doğum hekimi tarafından yapılır. Bebeğin beyin, kalp odacıkları, omurga, böbrek, yüz hatları ve parmakları milimetrik incelenir, plasentanın konumu ve amniyon sıvısı değerlendirilir.',
    tags: ['ultrason', 'detaylı ultrason', '20 hafta', 'perinatoloji']
  },
  {
    id: 'faq-8',
    category: '2. Trimester · Hafta 13-27',
    q: 'Şeker yükleme testi (OGTT) bebeğe zararlı mıdır?',
    a: 'Hayır. Uluslararası Kadın Doğum Dernekleri (ACOG, FIGO) şeker yükleme testinin bebeğe hiçbir zararı olmadığını, aksine teşhis edilmeyen gestasyonel diyabetin bebekte aşırı kilo, doğum travması ve erken doğum riskini artırdığını belirtmektedir. Testteki şeker miktarı yaklaşık 2 dilim baklava veya bir porsiyon tatlıya eşittir.',
    tags: ['şeker testi', 'ogtt', 'diyabet', 'gebelik şekeri']
  },
  {
    id: 'faq-9',
    category: '2. Trimester · Hafta 13-27',
    q: 'Sol tarafa yatmak gerçekten şart mı?',
    a: '20. haftadan sonra sol tarafa yatmak, vücudun ana toplardamarına (vena cava) yapılan baskıyı önler; plasentaya giden kan ve oksijen akışını artırır. Ancak uykuda sağa dönmekten korkmayın; bedeniniz rahatsız olduğunda uyanıp pozisyon değiştirmeniz yeterlidir. Bacak arasına yastık koymak omurganızı rahatlatır.',
    tags: ['uyku pozisyonu', 'sol taraf', 'yastık', 'vena cava']
  },
  {
    id: 'faq-10',
    category: '2. Trimester · Hafta 13-27',
    q: 'Gebelikte burun kanaması veya diş eti kanaması neden olur?',
    a: 'Artan östrojen hormonu ve %40-50 oranında yükselen kan hacmi mukozal dokulardaki kılcal damarları genişletir. Bu nedenle diş fırçalarken kanama veya sabahları burun tıkanıklığı/hafif kanama oldukça yaygındır. Yumuşak diş fırçası kullanmak ve odayı nemlendirmek iyi gelir.',
    tags: ['diş eti', 'burun kanaması', 'hormonlar', 'kan hacmi']
  },

  // ─── 3. TRIMESTER ───
  {
    id: 'faq-11',
    category: '3. Trimester · Hafta 28-40',
    q: 'Braxton Hicks kasılmaları ile gerçek doğum sancısı nasıl ayırt edilir?',
    a: 'Braxton Hicks kasılmaları düzensizdir, pozisyon değiştirince veya dinlenince geçer, şiddeti zamanla artmaz ve genellikle karında gerilme hissi verir. Gerçek doğum sancıları ise sırttan öne doğru dalga dalga yayılır, düzenli aralıklarla (örneğin 5 dakikada bir) gelir, yürümekle geçmez ve süresi 45-60 saniyeye ulaşır.',
    tags: ['braxton hicks', 'doğum sancısı', 'kasılma', 'yalancı sancı']
  },
  {
    id: 'faq-12',
    category: '3. Trimester · Hafta 28-40',
    q: 'Bebeğin hareketleri azaldı, ne yapmalıyım?',
    a: '28. haftadan sonra her anne bebeğinin hareket düzenini izlemelidir. Hareketlerde azalma hissederseniz sol yanınıza uzanın, bir bardak meyve suyu veya tatlı bir atıştırmalık tüketin ve 2 saat boyunca bebeğinize odaklanın. 2 saatte 10 net hareket hissetmezseniz vakit kaybetmeden doğum kliniğine veya hekiminize başvurmalısınız.',
    tags: ['tekme sayımı', 'bebek hareketi', 'acil durum', 'hareketsizlik']
  },
  {
    id: 'faq-13',
    category: '3. Trimester · Hafta 28-40',
    q: 'Kordon dolanması tehlikeli midir? Sezaryen sebebi midir?',
    a: 'Gebeliklerin yaklaşık %30\'unda kordonda bir veya iki tur boyuna dolanma görülür. Kordon dokusu "Wharton jölesi" adı verilen kaygan ve esnek bir maddeyle korunur; bebek boynunu sıkmaz. Çoğu bebek kordon dolanmasıyla sorunsuz normal doğum yapar. Doğum sırasında NST ile bebeğin kalp atışları takip edilerek güvenliği sağlanır.',
    tags: ['kordon dolanması', 'normal doğum', 'sezaryen', 'nst']
  },
  {
    id: 'faq-14',
    category: '3. Trimester · Hafta 28-40',
    q: 'Nişan gelmesi nedir, doğum ne zaman başlar?',
    a: 'Nişan (servikal mukus tıkacı), rahim ağzını enfeksiyonlardan koruyan sümüksü, pembe veya kahverengi çizgili jelimsi bir maddedir. Rahim ağzı yumuşayıp açılmaya başladığında düşer. Nişan geldikten sonra doğum birkaç saat içinde de başlayabilir, birkaç gün hatta 1 hafta sonra da.',
    tags: ['nişan gelmesi', 'mukus tıkacı', 'doğum belirtileri']
  },
  {
    id: 'faq-15',
    category: '3. Trimester · Hafta 28-40',
    q: 'Suyum gelirse ne yapmalıyım?',
    a: 'Amniyon kesesi açıldığında sıvı kontrolsüz bir şekilde bacaklardan aşağı sızabilir veya aniden boşalabilir. Suyunuz geldiğinde sakin olun, sıvının rengine dikkat edin (şeffaf/berrak normaldir, yeşil/kahverengimsi ise acildir), hijyenik ped yerleştirin ve kasılmanız olmasa dahi hekiminizle iletişime geçip hastaneye gidin.',
    tags: ['su gelmesi', 'amniyon sıvısı', 'doğum başlangıcı', 'acil']
  },

  // ─── BESLENME & GIDA GÜVENLİĞİ ───
  {
    id: 'faq-16',
    category: 'Beslenme & Gıda Güvenliği',
    q: 'Gebelikte kahve ve çay içilebilir mi? Sınır nedir?',
    a: 'Dünya Sağlık Örgütü ve ACOG, günlük kafein sınırını 200 mg olarak belirlemiştir. Bu miktar yaklaşık 1 fincan Türk kahvesine veya 1 kupa filtre kahveye, ya da 3-4 bardak açık siyah çaya denk gelir. Aşırı kafein plesantadan bebeğe geçer ve kalp ritmini hızlandırabilir.',
    tags: ['kahve', 'çay', 'kafein', 'beslenme']
  },
  {
    id: 'faq-17',
    category: 'Beslenme & Gıda Güvenliği',
    q: 'Hangi balıklar tüketilmeli, hangilerinden kaçınılmalı?',
    a: 'Somon, hamsi, sardalya, istavrit ve alabalık gibi küçük ve yüzey balıkları yüksek Omega-3 ve düşük cıva içerdiği için haftada 1-2 porsiyon önerilir. Kılıç balığı, köpek balığı, kral uskumru ve büyük ton balığı gibi derin deniz balıkları yüksek cıva biriktirdiği için tüketilmemelidir. Midye ve istiridye gibi kabuklulardan da kaçınılmalıdır.',
    tags: ['balık', 'omega-3', 'cıva', 'deniz ürünleri']
  },
  {
    id: 'faq-18',
    category: 'Beslenme & Gıda Güvenliği',
    q: 'Çiğ et, salam, sucuk ve pastırma neden yasak?',
    a: 'Çiğ veya az pişmiş et ürünlerinde "Toksoplazma gondii" paraziti ve "Listeria" bakterisi bulunabilir. Bu mikroorganizmalar bebeğin beyin gelişiminde hasara veya düşüğe yol açabilir. Salam, sosis, sucuk ve pastırma ancak çok iyi pişirilerek (tavada kızartılarak) tüketilmelidir.',
    tags: ['çiğ et', 'şarküteri', 'toksoplazma', 'sucuk', 'salam']
  },
  {
    id: 'faq-19',
    category: 'Beslenme & Gıda Güvenliği',
    q: 'Hangi bitki çayları güvenli, hangileri sakıncalı?',
    a: 'Güvenli bitki çayları: Ihlamur, zencefil, nane-limon ve rooibos çayıdır (günde 1-2 fincan). Sakıncalı bitki çayları: Adaçayı, biberiye, kekik, sinameki ve fesleğen çayları rahim kasılmalarını tetikleyebileceği için gebelikte önerilmez.',
    tags: ['bitki çayı', 'ıhlamur', 'adaçayı', 'zencefil']
  },

  // ─── DOĞUM & HASTANE ───
  {
    id: 'faq-20',
    category: 'Doğum & Hastane',
    q: 'Epidural anestezi (prenses doğum) ağrıyı tamamen keser mi?',
    a: 'Epidural anestezi bel bölgesine yerleştirilen ince bir kateterle ağrı iletimini bloke eder. Kasılmaların yarattığı şiddetli ağrıyı %90-95 oranında dindirirken, doğum dalgalarının basıncını hissetmenizi ve ıkınabilmenizi sağlar. Doğum konforunu ciddi ölçüde artırır.',
    tags: ['epidural', 'prenses doğum', 'ağrı yönetimi', 'anestezi']
  },
  {
    id: 'faq-21',
    category: 'Doğum & Hastane',
    q: 'Altın saat (Golden Hour) ve Ten Tene Temas neden bu kadar önemli?',
    a: 'Doğumdan hemen sonraki ilk 60 dakikada bebeğin annenin çıplak göğsüne yatırılmasına "Ten Tene Temas" denir. Bebeğin vücut ısısını dengeler, kalp ve solunum ritmini sakinleştirir, anne sütü hormonlarını (oksitosin ve prolaktin) zirveye çıkarır ve anne-bebek bağlanmasını derinleştirir.',
    tags: ['ten tene temas', 'altın saat', 'bağlanma', 'ilk emzirme']
  },
  {
    id: 'faq-22',
    category: 'Doğum & Hastane',
    q: 'Göbek kordonunun geç klemplenmesi nedir?',
    a: 'Kordonun bebek doğduktan sonra hemen değil, 1 ila 3 dakika beklenerek (atımı durduktan sonra) kesilmesidir. Bu uygulama bebeğe plasentadan ek 80-100 ml kan ve zengin demir depoları aktarılmasını sağlar; yenidoğan anemisini önler.',
    tags: ['kordon klempleme', 'demir', 'plasenta', 'doğum planı']
  },

  // ─── LOHUSALIK & İYİLEŞME ───
  {
    id: 'faq-23',
    category: 'Lohusalık & İyileşme',
    q: 'Lohusa hüznü (Baby Blues) ile doğum sonrası depresyon nasıl ayrılır?',
    a: 'Doğumdan sonraki ilk 2 hafta içinde ani hormon düşüşü ve uykusuzluğa bağlı ağlama krizleri, duygusal dalgalanmalar "Baby Blues" olarak adlandırılır ve %80 annede görülür, kendiliğinden geçer. Ancak hüzün, umutsuzluk, bebeğe bağlanamama hissi 2 haftadan uzun sürerse "Postpartum Depresyon" söz konusu olabilir ve profesyonel psikolojik destek alınmalıdır.',
    tags: ['lohusa hüznü', 'baby blues', 'depresyon', 'duygular']
  },
  {
    id: 'faq-24',
    category: 'Lohusalık & İyileşme',
    q: 'Lohusalık kanaması (Löşi) ne kadar sürer?',
    a: 'Löşi, doğumdan sonra rahmin kendini temizleme sürecidir ve genellikle 4 ila 6 hafta sürer. İlk günlerde kırmızı ve yoğundur; 2. haftadan sonra pembe-kahverengiye, ardından sarımsı-beyaz akıntıya döner. Saat başı ped dolduracak yoğun kanama veya büyük pıhtılar olursa hekime danışılmalıdır.',
    tags: ['löşi', 'kanama', 'iyileşme', 'lohusa bakımı']
  },
  {
    id: 'faq-25',
    category: 'Lohusalık & İyileşme',
    q: 'Sezaryen dikişi bakımı nasıl yapılmalı?',
    a: 'Dikiş bölgesi temiz ve kuru tutulmalıdır. İlk günlerde doktorun önerdiği pansuman yapılır; su geçirmez bant çıkarıldıktan sonra ılık duş alınabilir ancak yara yeri liflenmemeli, yumuşak havluyla tampon yaparak kurulanmalıdır. Kızarıklık, ısı artışı, akıntı veya açılma olursa doktora gösterilmelidir.',
    tags: ['sezaryen', 'dikiş bakımı', 'yara iyileşmesi']
  },

  // ─── YENİDOĞAN & EMZİRME ───
  {
    id: 'faq-26',
    category: 'Yenidoğan & Emzirme',
    q: 'Kolostrum (ilk süt) az geliyor gibi, bebeğim doyar mı?',
    a: 'Kolostrum altın sarısı, koyu kıvamlı ilk süttür ve yenidoğanın ilk aşısı kabul edilir. Doğumda bebeğin midesi sadece bir kiraz çekirdeği kadardır (5-7 ml)! Bu yüzden birkaç damla kolostrum bile bebeğin midesini tamamen doldurur ve bağışıklığını güçlendirir. Sütünüz 3-5. günlerde olgun süte dönüşerek artacaktır.',
    tags: ['kolostrum', 'ilk süt', 'mide boyutu', 'emzirme']
  },
  {
    id: 'faq-27',
    category: 'Yenidoğan & Emzirme',
    q: 'Bebeğimin doyduğunu nasıl anlarım?',
    a: 'En güvenilir gösterge bez sayısı ve kilo artışıdır: 5. günden itibaren günde en az 5-6 ıslak bez ve 3-4 sarı kaka yapıyorsa, memeyi bıraktığında sakin ve gevşemiş uyuyorsa bebeğiniz doyuyordur. Ağlamak her zaman açlık belirtisi değildir; gaz, sıcaklık veya sarılma ihtiyacı olabilir.',
    tags: ['doyma belirtileri', 'ıslak bez', 'kaka sayısı', 'emzirme']
  },
  {
    id: 'faq-28',
    category: 'Yenidoğan & Emzirme',
    q: 'Göbek kordonu ne zaman düşer ve nasıl temizlenir?',
    a: 'Yenidoğan göbek kordonu genellikle 7-14 gün arasında kuruyarak kendiliğinden düşer. Dünya Sağlık Örgütü "kuru bakım" önermektedir; kordona alkol veya tentürdiyot sürmeye gerek yoktur. Bebek bezinin bel kısmı kordonun altına katlanarak havalanması sağlanmalı ve ıslanmaktan korunmalıdır.',
    tags: ['göbek bağı', 'kordon bakımı', 'yenidoğan hijyen']
  },
  {
    id: 'faq-29',
    category: 'Yenidoğan & Emzirme',
    q: 'Bebeklerde gaz sancısı (kolik) ne zaman başlar, nasıl rahatlatılır?',
    a: 'Gaz sancıları genellikle 2-3. haftalarda başlar, 6. haftada zirveye ulaşır ve 3-4. aylarda sindirim sistemi olgunlaştıkça kendiliğinden biter. Emzirme sonrası gaz çıkarmak, karına saat yönünde ılık masaj yapmak, bacakları bisiklet gibi çevirmek ve beyaz gürültü (fön makinesi, anne karnı sesi) dinletmek rahatlatır.',
    tags: ['gaz sancısı', 'kolik', 'beyaz gürültü', 'bebek masajı']
  },
  {
    id: 'faq-30',
    category: 'Yenidoğan & Emzirme',
    q: 'Yenidoğan sarılığı nedir, ne zaman tehlikelidir?',
    a: 'Fizyolojik sarılık bebeklerin %60\'ında 2-4. günlerde ortaya çıkar ve karaciğerin bilirubini henüz tam işleyememesinden kaynaklanır. Bebeğin bol bol emzirilmesi bilirubinin kaka yoluyla atılmasını sağlar. Sarılık göğse ve bacaklara inerse, bebek sürekli uyuyup emmek istemiyorsa bilirubin seviyesi ölçülmeli ve fototerapi değerlendirilmelidir.',
    tags: ['sarılık', 'bilirubin', 'fototerapi', 'yenidoğan']
  }
];

export function searchFaqs(query = '') {
  const clean = query.trim().toLocaleLowerCase('tr');
  if (!clean) return pregnancyFaqs;
  return pregnancyFaqs.filter(faq => {
    return faq.q.toLocaleLowerCase('tr').includes(clean) ||
           faq.a.toLocaleLowerCase('tr').includes(clean) ||
           faq.tags.some(t => t.toLocaleLowerCase('tr').includes(clean));
  });
}

export function getFaqsByCategory(category = 'Tümü') {
  if (!category || category === 'Tümü') return pregnancyFaqs;
  return pregnancyFaqs.filter(faq => faq.category === category);
}
