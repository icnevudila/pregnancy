// Momora İçerik Kütüphanesi, Magazin & Uzman Rehberleri
// 25 Kapsamlı Pillar Makale, Zengin Görseller, Klinik İpuçları ve SSS Veritabanı
export { faqCategories, pregnancyFaqs, searchFaqs, getFaqsByCategory } from './faqData';

export const topics = [
  { id: 'pregnancy', title: 'Hamilelik & Gelişim', image: 'blog_couple_bump', subtitle: 'Hafta hafta tıp ve mucize' },
  { id: 'nutrition', title: 'Beslenme & Tarifler', image: 'blog_healthy_breakfast', subtitle: 'Temiz, güvenli ve lezzetli tabaklar' },
  { id: 'wellbeing', title: 'İyi Hisset & Yoga', image: 'blog_yoga_stretch', subtitle: 'Bedenine ve ruhuna alan aç' },
  { id: 'birth', title: 'Doğuma Hazırlık', image: 'blog_hospital_bag_pack', subtitle: 'Bilinçli ve huzurlu adımlar' },
  { id: 'baby', title: 'Bebek Bakımı', image: 'blog_newborn_hand', subtitle: 'İlk günden itibaren yeni ritim' },
  { id: 'postpartum', title: 'Lohusalık & İyileşme', image: 'blog_postpartum_selfcare', subtitle: 'Senin şefkatli iyileşme yolculuğun' },
  { id: 'partner', title: 'Eş & Baba Rehberi', image: 'blog_father_baby_bond', subtitle: 'Birlikte ebeveyn olmak' },
];

export const articles = [
  // ─── 1. HAMİLELİK & GELİŞİM ───
  {
    id: 'art-pregnant-morning',
    topic: 'pregnancy',
    categoryName: '1. Trimester',
    title: '1. Trimester Sabah Bulantıları ve Yorgunlukla Başa Çıkma',
    subtitle: 'Hormon fırtınasında bedeninizi dinlemenin ve rahatlamanın yolları.',
    image: 'blog_pregnant_morning',
    minutes: 4,
    weeks: [4, 14],
    doctor: 'Uzm. Dr. Elif Kaya · Kadın Hastalıkları ve Doğum Uzmanı',
    keyPoints: [
      'Sabah yataktan kalkmadan önce tuzlu kraker atıştırmak mide asidini nötralize eder.',
      'Bebek bu haftalarda annenin depolarından beslendiği için kilo kaybı bebeğe zarar vermez.',
      'Günde 2000 ml sıvıyı yudum yudum ve yemek aralarında tüketmek bulantıyı azaltır.'
    ],
    sections: [
      {
        title: 'Neden Sabahları Daha Şiddetli?',
        text: 'Gebelikte hızla yükselen insan koryonik gonadotropini (hCG) ve östrojen hormonları, sindirim sisteminin yavaşlamasına ve mide boşalmasının gecikmesine yol açar. Gece boyunca boş kalan mide asidi sabahları yoğun bulantıya neden olur.',
        tip: '💡 Baş ucunuzda tuzlu galeta veya leblebi bulundurun; gözünüzü açtığınızda ayağa kalkmadan bir iki lokma atıştırıp 10 dakika uzanın.'
      },
      {
        title: 'Beslenme Stratejileri',
        text: 'Büyük porsiyonlar yerine 2-3 saatte bir küçük atıştırmalıklar planlayın. Yağlı, kızartılmış ve ağır kokulu yemeklerden uzak durun. Soğuk veya oda sıcaklığındaki yiyecekler sıcak yemeklere göre daha az koku yaydığı için çok daha rahat tolere edilir.',
        image: 'card_scale'
      },
      {
        title: 'Ne Zaman Doktora Başvurulmalı?',
        text: 'Eğer gün içinde hiçbir sıvıyı midenizde tutamıyorsanız, idrar renginiz koyu kehribar rengine döndüyse ve 24 saatte 3 kilodan fazla su kaybettiyseniz bu durum "Hiperemezis Gravidarum" olabilir ve damar yoluyla sıvı desteği gerektirir.',
        tip: '⚠️ Dehidrasyon belirtileri başladığında vakit kaybetmeden kliniğinize danışın.'
      }
    ]
  },
  {
    id: 'art-ultrasound-memory',
    topic: 'pregnancy',
    categoryName: 'Ultrason & Tıp',
    title: 'Detaylı Ultrason Rehberi (20-22. Hafta): Neler İncelenir?',
    subtitle: 'Bebeğinizin parmak uçlarından kalp odacıklarına uzanan milimetrik tarama.',
    image: 'blog_ultrasound_memory',
    minutes: 5,
    weeks: [18, 24],
    doctor: 'Prof. Dr. Murat Demir · Perinatoloji & Fetal Tıp Uzmanı',
    keyPoints: [
      '2. düzey detaylı ultrason gebeliğin en kapsamlı anatomik taramasıdır.',
      'Bebeğin beyni, kalbi, omurgası, yüz profili ve uzuvları milimetrik ölçülür.',
      'Aç gitmenize gerek yoktur; hafif tok olmak bebeğin hareketliliğini artırır.'
    ],
    sections: [
      {
        title: 'Detaylı Ultrasonun Amacı Nedir?',
        text: 'Genellikle 20 ile 22. haftalar arasında gerçekleştirilen bu muayene, perinatoloji uzmanı tarafından yüksek çözünürlüklü cihazlarla yapılır. Bebeğin organ gelişiminin gebelik haftasıyla uyumu, plasentanın rahim içindeki yerleşimi ve amniyon sıvısının derinliği detaylıca raporlanır.',
        image: 'card_ultrasound_frame'
      },
      {
        title: 'İncelenen Temel Yapılar',
        text: 'Fetal beyincik, koroid pleksus, kalbin 4 odacığı ve çıkan ana damarlar, dudak-damak bütünlüğü, böbrek havuzcukları ve omurga çizgisi titizlikle taranır. Ayrıca göbek kordonundaki damar sayısı (2 arter, 1 ven) teyit edilir.',
        tip: '🩺 Randevudan 45 dakika önce taze sıkılmış meyve suyu veya hafif bir atıştırmalık almak bebeğin pozisyon değiştirmesini kolaylaştırır.'
      },
      {
        title: 'Renkli Doppler İncelemesi',
        text: 'Rahmi besleyen uterin arterlerdeki kan akım direnci ölçülür. Bu ölçüm, gebeliğin ilerleyen haftalarında preeklampsi (gebelik zehirlenmesi) veya gelişim geriliği risklerini aylar öncesinden öngörmede çok değerlidir.'
      }
    ]
  },
  {
    id: 'art-fetal-kicks',
    topic: 'pregnancy',
    categoryName: 'Fetal Takip',
    title: 'Bebeğin Hareketlerini Tanımak: İlk Kıpırtıdan 10 Tekme Seansına',
    subtitle: 'Kelebek kanadı vuruşundan ritmik tekmelere bebeğinle iletişim rehberi.',
    image: 'blog_couple_bump',
    minutes: 4,
    weeks: [16, 40],
    doctor: 'Uzm. Dr. Zeynep Aydın · Kadın Hastalıkları ve Doğum',
    keyPoints: [
      'İlk gebeliklerde tekmeler 18-22. haftalarda gaz baloncukları gibi hissedilir.',
      '28. haftadan sonra günde en az bir kez 10 tekme sayımı önerilir.',
      'Hareketlerde belirgin azalma hissedildiğinde asla ertesi gün beklenmemelidir.'
    ],
    sections: [
      {
        title: 'İlk Hareketler Nasıl Hissedilir?',
        text: 'Annelerin "kelebek kanadı çırpınışı", "içeride patlayan baloncuk" veya "minik bir seğirme" olarak tarif ettiği ilk fetal hareketler, 16-20. haftalarda başlar. Plasentası ön duvarda (anterior) olan anneler bu hissi birkaç hafta daha geç fark edebilir.',
        image: 'card_kick_counter'
      },
      {
        title: '10 Tekme Kuralı Nasıl Uygulanır?',
        text: 'Günün en sakin saatinde, tercihen yemekten sonra sol yanınıza uzanın. Ellerinizi karnınıza koyun. Bebeğinizin her güçlü dönüşünü, tekmesini veya gerinmesini sayın. 2 saat içinde 10 farklı hareket hissettiğinizde seans tamamlanmıştır.',
        tip: '💡 Bebekler genellikle annenin yemek yemesinden ve dinlenmeye geçmesinden 20-30 dakika sonra en aktif dönemlerine girerler.'
      }
    ]
  },
  {
    id: 'art-maternity-nature',
    topic: 'pregnancy',
    categoryName: 'Doğal Yaşam',
    title: 'Doğada Yürüyüş ve D Vitamini: Açık Havanın İyileştirici Gücü',
    subtitle: 'Temiz oksijen, güneş ışığı ve gebelikte zihinsel dinginlik.',
    image: 'blog_maternity_nature',
    minutes: 3,
    weeks: [4, 40],
    doctor: 'Dr. Kerem Arslan · Aile Hekimi & Yaşam Tarzı Tıbbı',
    keyPoints: [
      'Günde 20-30 dakikalık açık hava yürüyüşü tansiyonu ve kan şekerini dengeler.',
      'Güneş ışığı bebeğin kemik gelişimi için gerekli olan D vitamini sentezini sağlar.',
      'Toprak ve ağaç kokusu kortizol (stres) hormonunu %30 düşürür.'
    ],
    sections: [
      {
        title: 'Oksijen Bebeğe Nasıl Ulaşır?',
        text: 'Gebelikte artan kan hacmi daha fazla oksijen taşıma kapasitesi demektir. Temiz havada derin nefes alarak yapılan hafif yürüyüşler plasental dolaşımı güçlendirir, varis ve bacak ödemi oluşumunu engeller.',
        tip: '🌿 Sıcak yaz aylarında sabah 10:00 öncesi veya akşam 18:00 sonrası serin saatleri tercih edin.'
      },
      {
        title: 'Ruh Sağlığına Katkısı',
        text: 'Doğa yürüyüşleri gebelik kaygılarını yatıştırır ve gece melatonin salgısını düzenleyerek daha derin bir uyku çekmenize olanak tanır.'
      }
    ]
  },

  // ─── 2. BESLENME & TARİFLER ───
  {
    id: 'art-healthy-breakfast',
    topic: 'nutrition',
    categoryName: 'Gebelik Beslenmesi',
    title: 'Gebelikte Şampiyon Kahvaltı Tabağı: Kolin, Demir ve Protein',
    subtitle: 'Bebeğin zeka gelişimi ve annenin gün boyu enerjisi için ideal tabak dengesi.',
    image: 'blog_healthy_breakfast',
    minutes: 4,
    weeks: [4, 40],
    doctor: 'Dyt. Selin Erdem · Anne & Çocuk Beslenme Uzmanı',
    keyPoints: [
      'Yumurta, fetal beyin gelişimi için hayati olan kolin mineralinin bir numaralı kaynağıdır.',
      'Tam buğday veya ekşi mayalı çavdar ekmeği kan şekerini gün boyu dengede tutar.',
      'C vitamini (limon, yeşillik) demir emilimini 3 katına çıkarır.'
    ],
    sections: [
      {
        title: 'Tabağın 4 Temel Direği',
        text: 'İdeal bir gebelik kahvaltısı: 1-2 tam pişmiş yumurta (kolin & kaliteli protein), 1 dilim pastörize beyaz peynir veya lor (kalsiyum), bol yeşillik ve zeytinyağı (folik asit & E vitamini), 1-2 ceviz veya avokado (omega-3) içermelidir.',
        image: 'blog_healthy_breakfast'
      },
      {
        title: 'Çay ve Kahve Tüketim Zamanı',
        text: 'Kahvaltı sırasında çay veya kahve tüketmek yumurta ve peynirdeki demirin emilimini engeller. Sıcak içeceklerinizi kahvaltıdan en az 45 dakika sonra içmeye özen gösterin.',
        tip: '🍳 Yumurtanın sarısı mutlaka tamamen katılaşmış olmalıdır; cıvık yumurtada salmonella riski bulunur.'
      }
    ]
  },
  {
    id: 'art-prenatal-smoothie',
    topic: 'nutrition',
    categoryName: 'Sıvı & Vitamin',
    title: 'Hamilelikte 4 Besleyici Prenatal Smoothie Tarifi',
    subtitle: 'Mideyi yormayan, kalsiyum ve demir deposu ferah içecekler.',
    image: 'blog_prenatal_smoothie',
    minutes: 3,
    weeks: [8, 40],
    doctor: 'Dyt. Selin Erdem · Anne Beslenme Danışmanı',
    keyPoints: [
      'Ispanaklı ve muzlu yeşil smoothie kabızlığı önler.',
      'Kefir ve yaban mersini bağırsak florasını güçlendirir.',
      'Chia tohumu ve badem sütü bitkisel kalsiyum ve omega-3 sunar.'
    ],
    sections: [
      {
        title: 'Yeşil Güç Smoothiesi (Demir & Folik Asit)',
        text: 'Malzemeler: 1 avuç körpe ıspanak, 1 adet muz, 1 bardak taze portakal suyu, 1 yemek kaşığı chia tohumu. Portakaldaki bol C vitamini ıspanaktaki bitkisel demirin anında kana karışmasını sağlar.',
        image: 'card_vitamin'
      },
      {
        title: 'Mor Dinginlik (Probiyotik & Kalsiyum)',
        text: 'Malzemeler: 1 su bardağı ev yapımı pastörize kefir, yarım su bardağı yaban mersini veya böğürtlen, 1 tatlı kaşığı keten tohumu. Sindirim sistemini rahatlatır ve gebelik reflüsünü yatıştırır.'
      }
    ]
  },
  {
    id: 'art-herbal-tea-guide',
    topic: 'nutrition',
    categoryName: 'Bitki Çayları',
    title: 'Gebelikte Güvenli Bitki Çayları ve Kaçınılması Gerekenler',
    subtitle: 'Ihlamur, zencefil, adaçayı ve sinameki: Hangisi güvenli, hangisi riskli?',
    image: 'blog_herbal_tea_relax',
    minutes: 4,
    weeks: [4, 40],
    doctor: 'Ecz. Derya Güneş · Fitoterapi Uzmanı',
    keyPoints: [
      'Günde 1-2 fincan ıhlamur, zencefil ve nane-limon çayı güvenlidir.',
      'Adaçayı ve biberiye rahim kasılmalarını uyarabileceği için önerilmez.',
      'Poşet çaylar yerine güvenilir aktarlardan alınan yaprak çaylar tercih edilmelidir.'
    ],
    sections: [
      {
        title: 'Yeşil Işık Yanan Çaylar',
        text: 'Ihlamur (bağışıklığı destekler), taze dilimlenmiş zencefil çayı (bulantıyı anında keser), nane-limon (sindirimi rahatlatır) ve Rooibos (kafeinsiz güçlü antioksidan) gebeliğin tüm aylarında güvenle içilebilir.',
        tip: '☕ Günde 2 fincanı aşmamak ve çayları kaynatmak yerine 5-7 dakika demlemek en sağlıklı yöntemdir.'
      },
      {
        title: 'Kırmızı Işık Yanan Çaylar',
        text: 'Adaçayı, sinameki, civanperçemi, fesleğen ve meyan kökü çayları pelvik bölgede kan akışını hızlandırarak erken kasılmaları tetikleyebilir. Bu çaylardan gebelik süresince uzak durulmalıdır.'
      }
    ]
  },

  // ─── 3. İYİ HİSSET & YOGA ───
  {
    id: 'art-yoga-stretch',
    topic: 'wellbeing',
    categoryName: 'Doğum Yogası',
    title: 'Evde Güvenli Hamile Yogası: Bel ve Kalça Ağrısına 5 Poz',
    subtitle: 'Büyüyen karnın ağırlığını hafifleten ve pelvisi esneten nazik asanalar.',
    image: 'blog_yoga_stretch',
    minutes: 5,
    weeks: [12, 38],
    doctor: 'Ece Karadağ · Sertifikalı Doğum & Prenatal Yoga Eğitmeni',
    keyPoints: [
      'Yoga hareketleri pelvik taban kaslarını doğuma hazırlar.',
      'Sırtüstü uzun süre yatmaktan ve derin karın bükülmelerinden kaçınılmalıdır.',
      'Nefes alışverişiyle hareketlerin senkronize edilmesi doğum sancılarını yönetmeyi kolaylaştırır.'
    ],
    sections: [
      {
        title: '1. Kedi - İnek Dalgası (Marjaryasana-Bitilasana)',
        text: 'Eller omuzların, dizler kalçanın altında dört ayak pozisyonuna geçin. Nefes alırken belinizi hafif çukurlaştırıp göğsünüzü açın; nefes verirken sırtınızı yuvarlayıp başınızı serbest bırakın. Beldeki baskıyı anında hafifletir.',
        image: 'blog_yoga_stretch'
      },
      {
        title: '2. Genişletilmiş Çocuk Pozu (Balasana)',
        text: 'Dizlerinizi matın iki kenarına kadar açın, ayak başparmaklarınızı birleştirin. Kalçanızı topuklarınıza doğru indirirken göğsünüzü ve alnınızı yere doğru bırakın. Karnınız dizlerinizin arasında tamamen serbest kalmalıdır.',
        tip: '🧘‍♀️ Asla nefesinizi tutmayın; her harekette burnunuzdan derin alıp ağzınızdan yavaşça üfleyin.'
      },
      {
        title: '3. Tanrıça Pozu (Utkata Konasana)',
        text: 'Bacakları geniş açıp ayak uçlarını dışarı çevirin. Dizleri bükerek kalçayı hafifçe aşağı indirin. Bu poz leğen kemiği tabanını güçlendirir ve doğum kanalının açılmasına yardımcı olur.'
      }
    ]
  },
  {
    id: 'art-sleeping-crib',
    topic: 'wellbeing',
    categoryName: 'Uyku Sağlığı',
    title: 'İkinci ve Üçüncü Trimesterda Güvenli Uyku ve Yastık Desteği',
    subtitle: 'Sol yana yatış pozisyonu, kramp önleme ve gece uykusu konforu.',
    image: 'blog_sleeping_crib',
    minutes: 4,
    weeks: [16, 40],
    doctor: 'Uzm. Dr. Elif Kaya · Perinatal Uyku Danışmanı',
    keyPoints: [
      'Sol yana yatış plasentaya ve böbreklere giden kan akışını en üst düzeye çıkarır.',
      'Bacak arasına yerleştirilen U veya C tipi hamile yastığı leğen kemiği batmasını önler.',
      'Gece kramplarını engellemek için akşamları magnezyum takviyesi ve ılık duş etkilidir.'
    ],
    sections: [
      {
        title: 'Neden Sırtüstü Yatmamalısınız?',
        text: '20. haftadan sonra sırtüstü yatıldığında ağırlaşan rahim, omurganın önündeki ana toplardamara (vena cava) baskı yapar. Bu durum annede tansiyon düşmesi, baş dönmesi ve bebeğe giden oksijende azalmaya neden olabilir.',
        image: 'card_blood_pressure'
      },
      {
        title: 'Hamile Yastığının Doğru Kullanımı',
        text: 'Yastığın bir ucunu başınızın altına, gövdesini karnınızın altına ve alt ucunu dizlerinizin arasına sıkıştırın. Bu duruş bel omurlarının düz bir hatta kalmasını sağlayarak sabah bel tutulmalarını sıfıra indirir.',
        tip: '🛌 Gece sağa dönerek uyanırsanız paniklemeyin; sadece pozisyonunuzu sakin bir şekilde sola çevirin.'
      }
    ]
  },

  // ─── 4. DOĞUMA HAZIRLIK ───
  {
    id: 'art-hospital-bag',
    topic: 'birth',
    categoryName: 'Çanta Hazırlığı',
    title: 'Eksiksiz Doğum ve Hastane Çantası: Anne, Bebek ve Eş',
    subtitle: '34. haftada hazır olması gereken kritik ihtiyaçlar ve pratik tüyolar.',
    image: 'blog_hospital_bag_pack',
    minutes: 5,
    weeks: [30, 40],
    doctor: 'Ebe Nurgül Yıldız · Doğum Koçu',
    keyPoints: [
      'Çantayı 3 ayrı hurçta toplayın: Doğum anı, Anne odası ve Bebek odası.',
      'Önden düğmeli pamuklu gecelikler ilk emzirme seansını çok kolaylaştırır.',
      'Bebek için hastane çıkışı ve mevsime uygun oto koltuğu unutulmamalıdır.'
    ],
    sections: [
      {
        title: 'Anne İçin Olmazsa Olmazlar',
        text: '2 adet emzirme uyumlu gecelik veya pijama takımı, kalın tabanlı kaydırmaz terlik, 5 adet yüksek bel tek kullanımlık lohusa külodu, göğüs ucu kremi (lanolin), nemlendirici dudak balmı ve şarj aleti.',
        image: 'card_hospital_bag'
      },
      {
        title: 'Bebek İçin Temel İhtiyaçlar',
        text: '3 takım zıbın ve tulum, 2 adet pamuklu şapka ve eldiven, 1 paket 1 numara yenidoğan bebek bezi, saf su içerikli ıslak mendil, müslin örtüler ve eve dönüş battaniyesi.',
        tip: '🎒 Çantanın yerini eşinize veya refakatçinize mutlaka gösterin; acil durumda kapıdan kolayca alınabilecek bir yerde dursun.'
      }
    ]
  },
  {
    id: 'art-nursery-aesthetic',
    topic: 'birth',
    categoryName: 'Bebek Odası',
    title: 'Güvenli ve Huzurlu Bebek Odası: 20-22°C ve Toksik Olmayan Seçimler',
    subtitle: 'Beşik güvenliği, nefes alabilir tekstiller ve sakinleştirici pastel renkler.',
    image: 'blog_nursery_aesthetic',
    minutes: 4,
    weeks: [28, 40],
    doctor: 'Mimar & Ergonomi Uzmanı Defne Can',
    keyPoints: [
      'İlk 6 ay anne yanı beşiği ani bebek ölümü riskini %50 azaltır.',
      'Bebek yatağında yastık, yorgan veya peluş oyuncak asla bulunmamalıdır.',
      'İdeal oda sıcaklığı 20-22°C ve nem oranı %45-55 aralığında olmalıdır.'
    ],
    sections: [
      {
        title: 'Güvenli Uyku Alanı Kuralları',
        text: 'Beşik parmaklıkları arasındaki mesafe 6 cm\'den geniş olmamalıdır. Yatak orta sertlikte olmalı ve beşik kenarına tam oturmalıdır. Yatak kenarlarındaki kalın kumaş koruyucular (bumper) boğulma riski nedeniyle önerilmez.',
        image: 'ui_baby_crib'
      },
      {
        title: 'Aydınlatma ve Renk Psikolojisi',
        text: 'Göz yormayan sıcak sarı ışıklı gece lambaları ve adaçayı yeşili, lavanta veya sıcak krem gibi sakinleştirici pastel tonlar bebeğin melatonin dengesini destekler.'
      }
    ]
  },
  {
    id: 'art-skin-to-skin',
    topic: 'birth',
    categoryName: 'Altın Saat',
    title: 'Doğum Sonrası Altın Saat (Golden Hour): Ten Tene Temas',
    subtitle: 'İlk 60 dakikada anne göğsüne yatan bebeğin yaşadığı 10 mucizevi değişim.',
    image: 'blog_skin_to_skin',
    minutes: 4,
    weeks: [36, 40],
    doctor: 'Uzm. Dr. Hande Çetin · Yenidoğan Yoğun Bakım Uzmanı',
    keyPoints: [
      'Ten tene temas bebeğin kalp ritmini ve solunumunu dakikalar içinde stabilize eder.',
      'Anne göğsündeki yararlı bakteriler bebeğin bağışıklık sistemini mikrobiyomla zırhlar.',
      'Oksitosin patlaması sağlayarak anne sütünün hemen inmesine yardımcı olur.'
    ],
    sections: [
      {
        title: 'Bebek Memeyi Kendi Kendine Bulur (Breast Crawl)',
        text: 'Doğumdan hemen sonra annenin çıplak göğsüne yatırılan bebek, koku ve tat alma duyuları sayesinde yavaşça yukarı doğru sürünerek memeyi bulabilir. Bu doğal refleks emzirme başarısının temelidir.',
        image: 'blog_skin_to_skin'
      },
      {
        title: 'Ağlama ve Stres Seviyesini Düşürür',
        text: 'Anne teninin sıcaklığı ve bilindik kalp atışları, rahimden dış dünyaya çıkan bebeğin yabancılık hissini yok eder. Bebek kendini en güvende hissettiği alanda derin bir dinginliğe kavuşur.',
        tip: '💛 Sezaryen doğumlarda dahi ameliyathanede veya uyanma odasında baba veya anneyle ten tene temas derhal başlatılabilir.'
      }
    ]
  },

  // ─── 5. BEBEK BAKIMI ───
  {
    id: 'art-breastfeeding-cozy',
    topic: 'baby',
    categoryName: 'Emzirme',
    title: 'Acısız Emzirme Kılavuzu: Doğru Meme Kavrama (Latch-On)',
    subtitle: 'Meme ucu yaralarını ve çatlaklarını önleyen asimetrik kavrama sırrı.',
    image: 'blog_breastfeeding_cozy',
    minutes: 5,
    weeks: [36, 40],
    doctor: 'Ebe Nurgül Yıldız · IBCLC Uluslararası Emzirme Danışmanı',
    keyPoints: [
      'Emzirmede acı varsa bebek sadece meme ucunu tutuyor demektir.',
      'Bebek ağzını esner gibi kocaman açmalı ve kahverengi alanın alt kısmını kavramalıdır.',
      'Emzirme sonrası memeye birkaç damla anne sütü sürmek çatlakları doğal yolla onarır.'
    ],
    sections: [
      {
        title: 'Asimetrik Kavrama Tekniği',
        text: 'Bebeğin burnunu meme ucunuzun karşısına hizalayın. Başını hafifçe geriye atmasına izin verin. Ağzını genişçe açtığında çenesi önce memeye değmeli, ardından alt dudağı dışa doğru balık dudağı gibi kıvrılarak memenin altını tamamen sarmalıdır.',
        image: 'btn_nursing'
      },
      {
        title: 'Vakumu Nazikçe Bozun',
        text: 'Eğer canınız yanıyorsa bebeği zorla memeden çekmeyin. Temiz serçe parmağınızı bebeğin ağız kenarından damağına doğru kaydırarak vakumu bozun ve memeyi yeniden doğru açıyla verin.',
        tip: '🍼 İlk haftalarda her emzirmede iki memeyi de sırayla teklif edin; prolaktin seviyeniz dengelensin.'
      }
    ]
  },
  {
    id: 'art-newborn-hand',
    topic: 'baby',
    categoryName: 'İlk Günler',
    title: 'İlk 48 Saat: Yenidoğanın Beden Dili, Refleksler ve İpuçları',
    subtitle: 'Moro refleksi, yakalama refleksi ve bebeğin açlık sinyallerini okuma rehberi.',
    image: 'blog_newborn_hand',
    minutes: 4,
    weeks: [36, 40],
    doctor: 'Uzm. Dr. Hande Çetin · Çocuk Sağlığı ve Hastalıkları',
    keyPoints: [
      'Yenidoğan bebekler ellerini yumruk yapıp ağızlarına götürerek açlık sinyali verirler.',
      'Ağlama en son açlık belirtisidir; sakinleştirmeden önce emzirmek zorlaşabilir.',
      'İlk günlerde bebeklerin 1-3 kg arası doğum ağırlığının %7-10\'unu kaybetmesi fizyolojiktir.'
    ],
    sections: [
      {
        title: 'Yenidoğanın İlkel Refleksleri',
        text: 'Avucuna dokunduğunuzda sımsıkı kavraması (Palmar grasp) veya ani seste kollarını iki yana açıp kapatması (Moro refleksi) sağlıklı bir sinir sisteminin göstergeleridir.',
        image: 'blog_newborn_hand'
      },
      {
        title: 'Açlık Aşamaları',
        text: 'Erken sinyal: Başını sağa sola çevirme (aranma refleksi). Orta sinyal: Elleri emme, huzursuzlanma. Geç sinyal: Ağlama, kızarma. Bebeğinizi orta sinyalleri yakaladığınız anda emzirmeye alın.'
      }
    ]
  },
  {
    id: 'art-baby-burping',
    topic: 'baby',
    categoryName: 'Gaz & Sindirim',
    title: 'Bebeklerde Gaz Çıkarma Sanatı: 3 Etkili Pozisyon',
    subtitle: 'Omuz, kucak ve diz desteğiyle sıkışan hava kabarcıklarını kolayca tahliye etme.',
    image: 'blog_baby_burping',
    minutes: 3,
    weeks: [36, 40],
    doctor: 'Ebe Nurgül Yıldız · Bebek Hemşiresi',
    keyPoints: [
      'Biberonla veya memede hava yutan bebekler her beslenme ortasında ve sonunda gaz çıkarmalıdır.',
      'Sırtı sertçe vurmak yerine aşağıdan yukarıya dairesel sıvazlama hareketi yapılmalıdır.',
      'Gaz sancıları genellikle 3. haftada başlayıp 3. ayda sona erer.'
    ],
    sections: [
      {
        title: '1. Omuz Pozisyonu',
        text: 'Bebeğin çenesini omzunuza dayayın, bir elinizle poposunu desteklerken diğer elinizle sırtını nazikçe ovun. Bebeğin karnı omzunuza hafifçe baskı yaparak gazın çıkmasını hızlandırır.',
        image: 'blog_baby_burping'
      },
      {
        title: '2. Kucakta Oturma Pozisyonu',
        text: 'Bebeğinizi dizinize oturtun. Bir elinizin baş ve işaret parmağıyla çenesini ve göğsünü destekleyin (boğazını sıkmadan). Vücudunu hafifçe öne eğip sırtını yukarı doğru sıvazlayın.',
        tip: '💨 10-15 dakika denemenize rağmen gaz çıkmıyorsa bebeği zorlamayın; gaz bağırsaklara inmiş olabilir.'
      }
    ]
  },
  {
    id: 'art-baby-massage',
    topic: 'baby',
    categoryName: 'Masaj & Rahatlama',
    title: 'Kolik ve Gaz Sancısını Dindiren Masaj: "I Love You" Tekniği',
    subtitle: 'Ilık doğal yağlar eşliğinde bebeği gevşeten ve gazı söken adımlar.',
    image: 'blog_baby_massage',
    minutes: 4,
    weeks: [36, 40],
    doctor: 'Fzt. Banu Yılmaz · Bebek Masaj Terapisti',
    keyPoints: [
      'Masaj daima saat yönünde yapılmalıdır; bağırsakların akış yönü saat yönündedir.',
      'Soğuk sıkım tatlı badem yağı veya zeytinyağı cilt için en güvenli tercihtir.',
      'Bebek ağlarken veya tok karnına asla karın masajı yapılmamalıdır.'
    ],
    sections: [
      {
        title: '"I Love You" Adımları',
        text: 'I: Bebeğin karnının sol tarafından yukarıdan aşağıya düz bir çizgi çekin. L: Sağdan sola yatay ve ardından aşağıya ters bir L çizin. U: Sağ alttan başlayıp yukarı, sola ve aşağı ters bir U çizin. Bu hareketler gazı çıkışa yönlendirir.',
        image: 'blog_baby_massage'
      },
      {
        title: 'Bisiklet Hareketi',
        text: 'Bebeğin minik bacaklarını tutup bisiklet pedalı çevirir gibi ritmik hareket ettirin, ardından dizlerini nazikçe karnına doğru bastırıp 5 saniye bekletin.'
      }
    ]
  },
  {
    id: 'art-baby-bath',
    topic: 'baby',
    categoryName: 'Banyo & Hijyen',
    title: 'Bebeğin İlk Banyosu: 37°C Su Isısı ve Göbek Kordonu Koruması',
    subtitle: 'Göbek bağı düşene kadar sünger banyo, sonrasında küvet keyfi.',
    image: 'blog_baby_bath',
    minutes: 4,
    weeks: [36, 40],
    doctor: 'Uzm. Dr. Hande Çetin · Pediatrist',
    keyPoints: [
      'Göbek bağı düşene kadar bebeği suya sokmak yerine ılık sünger banyo önerilir.',
      'Su sıcaklığı dirsek içiyle kontrol edilmeli ve 36.5 - 37°C olmalıdır.',
      'Banyo süresi ilk aylarda 5-8 dakikayı geçmemelidir.'
    ],
    sections: [
      {
        title: 'Ortam Hazırlığı',
        text: 'Oda ısısı 24-26°C olmalıdır. Tüm havlular, bebek bezi ve temiz kıyafetler elinizin altında hazır bulunmalıdır. Bebeği asla bir saniyeliğine dahi su kenarında yalnız bırakmayın.',
        image: 'cat_bath'
      },
      {
        title: 'Nazik Kurulama',
        text: 'Cildi ovalayarak değil, yumuşak pamuklu havluyla tampon hareketlerle kurulayın. Boyun kıvrımları, koltuk altları ve kasık bölgelerinin kuru kaldığından emin olun.',
        tip: '🧼 İlk haftalarda her gün sabun veya şampuan kullanmaya gerek yoktur; sadece ılık duru su yeterlidir.'
      }
    ]
  },
  {
    id: 'art-baby-tummy-time',
    topic: 'baby',
    categoryName: 'Motor Gelişim',
    title: 'Karın Üstü Egzersizi (Tummy Time): Boyun ve Sırt Güçlendirme',
    subtitle: 'Düz kafa sendromunu önleyen ve emeklemeye hazırlayan günlük seanslar.',
    image: 'blog_baby_tummy_time',
    minutes: 3,
    weeks: [36, 40],
    doctor: 'Uzm. Fzt. Banu Yılmaz · Pediatrik Fizyoterapi',
    keyPoints: [
      'Doğumdan itibaren günde 2-3 kez 1-2 dakikalık seanslarla başlanabilir.',
      'Başını kaldırma çabası omuz ve boyun kaslarını hızla geliştirir.',
      'Sadece bebek uyanıkken ve bir yetişkinin gözetiminde yapılmalıdır.'
    ],
    sections: [
      {
        title: 'Eğlenceli Hale Getirin',
        text: 'Bebeğin önüne siyah-beyaz kontrastlı kartlar veya kırılmaz bir ayna koyun. Yere onunla aynı göz hizasına uzanarak seslenin; sesinizi duymak için başını kaldırmak isteyecektir.',
        image: 'btn_tummy_time'
      },
      {
        title: 'Anne-Baba Göğsünde Tummy Time',
        text: 'Yere yatmakta huysuzlanan bebekler için en iyi alternatif annenin veya babanın yarı uzanır pozisyondaki göğsüne yüzüstü yatmaktır.'
      }
    ]
  },
  {
    id: 'art-baby-first-food',
    topic: 'baby',
    categoryName: 'Ek Gıda',
    title: 'Ek Gıdaya Geçiş (6+ Ay): BLW Yöntemi ve Alerjen Kuralları',
    subtitle: 'Püre mi, parmak gıda mı? 3 gün bekleme kuralıyla güvenli tadımlar.',
    image: 'blog_baby_first_food',
    minutes: 5,
    weeks: [20, 40],
    doctor: 'Dyt. Selin Erdem · Bebek Beslenmesi',
    keyPoints: [
      'İlk 6 ay sadece anne sütü veya formül mama tek başına yeterlidir.',
      'Bebeğin desteksiz oturabilmesi ve dil itme refleksinin kaybolması hazır bulunuşluk işaretidir.',
      'Yeni her besin 3 gün kuralıyla tek tek denenmeli ve alerji kontrolü yapılmalıdır.'
    ],
    sections: [
      {
        title: 'İlk Başlangıç Sebzeleri',
        text: 'Buharda yumuşatılmış havuç, kabak, bal kabağı ve avokado bebeklerin ilk tat deneyimleri için mükemmeldir. Besinler parmak kalınlığında ve iki parmak arasında kolayca ezilecek yumuşaklıkta olmalıdır.',
        image: 'blog_baby_first_food'
      },
      {
        title: '1 Yaşından Önce Yasak Olanlar',
        text: 'Bal (botulizm riski), inek sütü (alerji ve böbrek yükü), tuz, şeker, çiğ yumurta beyazı ve boğulma riski taşıyan sert yuvarlak kuruyemişler 1 yaşından önce kesinlikle verilmemelidir.',
        tip: '🥑 Yemek saatlerini bir mücadeleye değil, eğlenceli bir duyusal keşif oyununa dönüştürün.'
      }
    ]
  },
  {
    id: 'art-baby-foot-kiss',
    topic: 'baby',
    categoryName: 'Cilt & Masumiyet',
    title: 'Yenidoğan Cilt Bakımı: Verniks Koruması, Konak ve Pişik Tedavisi',
    subtitle: 'Bebek teninin ipeksi bariyerini kimyasallardan koruma rehberi.',
    image: 'blog_baby_foot_kiss',
    minutes: 3,
    weeks: [36, 40],
    doctor: 'Uzm. Dr. Hande Çetin · Çocuk Dermatolojisi',
    keyPoints: [
      'Doğumdaki beyaz krem tabakası (verniks) cildin doğal nemlendiricisidir; silinmemelidir.',
      'Pişiği önlemenin en iyi yolu altı sık değiştirmek ve hava almasını sağlamaktır.',
      'Çinko oksit içeren bariyer kremler pişik oluşumunu engeller.'
    ],
    sections: [
      {
        title: 'Konak Nasıl Temizlenir?',
        text: 'Kafadaki sarı pullanmalar zararsızdır. Banyodan 30 dakika önce saç derisine ılık badem yağı sürün ve yumuşadıktan sonra yumuşak kıllı bebek fırçasıyla nazikçe tarayın.',
        image: 'blog_baby_foot_kiss'
      }
    ]
  },

  // ─── 6. LOHUSALIK & İYİLEŞME ───
  {
    id: 'art-postpartum-selfcare',
    topic: 'postpartum',
    categoryName: 'Lohusa İyileşmesi',
    title: 'Dördüncü Trimester: Bedenin İyileşme Takvimi ve Rahmin Toparlanması',
    subtitle: 'Löşi akıntısı, göğüs dolgunluğu ve hormonların fabrika ayarlarına dönüşü.',
    image: 'blog_postpartum_selfcare',
    minutes: 5,
    weeks: [36, 40],
    doctor: 'Dr. Zeynep Aydın · Kadın Hastalıkları ve Doğum',
    keyPoints: [
      'Rahim doğumdan sonraki 6 hafta içinde 1 kg ağırlıktan 60 gramlık eski boyutuna küçülür.',
      'Emzirdikçe hissedilen rahim kasılmaları rahmin toparlandığının doğal işaretidir.',
      'İlk haftalarda en önemli sorumluluğunuz dinlenmek ve bebeğinizle bağ kurmaktır.'
    ],
    sections: [
      {
        title: 'Löşi Akıntısının Aşamaları',
        text: 'İlk 3-4 gün parlak kırmızı (Lochia rubra), 4-10. günler pembe-kahverengi (Lochia serosa) ve 10-28. günler sarı-beyaz (Lochia alba) akıntı normaldir. Saat başı kalın ped dolduracak kanamada doktora başvurulmalıdır.',
        image: 'ui_postpartum_lotus'
      },
      {
        title: 'Kendine Şefkat Göster',
        text: 'Dağınık evler ve ertelenen işler hiçbir şey ifade etmez. Bebeğin uyuduğu her an siz de gözlerinizi kapatıp dinlenin. Destek istemek bir zayıflık değil, anneliğin en bilgece kararıdır.',
        tip: '🌸 Ağrı kesici ihtiyacınızı doktorunuza danışarak güvenle karşılayabilirsiniz; acı çekmek zorunda değilsiniz.'
      }
    ]
  },
  {
    id: 'art-postpartum-rest',
    topic: 'postpartum',
    categoryName: 'Ruh Sağlığı',
    title: 'Lohusa Hüznü (Baby Blues) ile Başa Çıkma: Yalnız Değilsin',
    subtitle: 'Hormonal iniş çıkışlar, sebepsiz ağlama nöbetleri ve şefkatli destek ağı.',
    image: 'blog_postpartum_rest',
    minutes: 4,
    weeks: [36, 40],
    doctor: 'Psk. Melis Akın · Perinatal Psikolog',
    keyPoints: [
      'Annelerin %80\'i doğumdan sonraki ilk 2 hafta içinde duygusal dalgalanmalar yaşar.',
      'Ani östrojen ve progesteron düşüşü Baby Blues\'un biyolojik tetikleyicisidir.',
      'Duygular 2 haftadan uzun sürer ve umutsuzluğa dönüşürse profesyonel destek şarttır.'
    ],
    sections: [
      {
        title: 'Neden Sürekli Ağlamak İstiyorum?',
        text: 'Doğum sonrası hormon seviyeleri tarihte hiçbir biyolojik süreçte olmadığı kadar dik bir düşüş yaşar. Buna kronik uykusuzluk ve sorumluluk hissi eklendiğinde ağlama krizleri çok doğaldır.',
        image: 'blog_postpartum_rest'
      },
      {
        title: 'Destek Ağı Nasıl Kurulur?',
        text: 'Eşinizden, ailenizden ve güvendiğiniz yakınlarınızdan yemek yapma, çamaşır yıkama ve market alışverişi gibi pratik işleri devralmalarını rica edin. Sizin önceliğiniz iyileşmektir.'
      }
    ]
  },

  // ─── 7. EŞ & BABA REHBERİ ───
  {
    id: 'art-father-baby-bond',
    topic: 'partner',
    categoryName: 'Babalık',
    title: 'Babalar İçin Yenidoğan Rehberi: İlk Günlerde En Büyük Kahraman Olmak',
    subtitle: 'Anneyi korumak, ten tene temas ve gaz nöbetlerinde eşit ortaklık.',
    image: 'blog_father_baby_bond',
    minutes: 4,
    weeks: [20, 40],
    doctor: 'Psk. Melis Akın & Dr. Kerem Arslan',
    keyPoints: [
      'Babanın ten tene temas yapması bebeğin kalp ritmini sakinleştirir ve baba-bebek bağını perçinler.',
      'En kritik babalık görevi: Ziyaretçi trafiğini yöneterek annenin uykusunu korumaktır.',
      'Gaz çıkarma ve alt değiştirme pratik yaptıkça 2 günde uzmanlaşılan becerilerdir.'
    ],
    sections: [
      {
        title: 'Eşinizi Nasıl Koruyabilirsiniz?',
        text: 'Lohusalık döneminde yeni annenin dinlenmeye ihtiyacı vardır. Kapıya gelen misafirlerin ziyaret süresini nezaketle 20-30 dakikayla sınırlandırmak babanın sorumluluğudur.',
        image: 'blog_father_baby_bond'
      },
      {
        title: 'Bebekle Bire Bir Zaman',
        text: 'Bebeği göğsünüze yatırıp ona gününüzü anlatın, hafif ritimlerle sırtını okşayın. Anne duş alırken veya uyurken bebeğin bakımını üstlenmek ailenizin en büyük gücü olacaktır.',
        tip: '👨‍👧 "Yardım eden eş" değil; doğum anından itibaren sürecin "tam ortağı" olduğunuzu unutmayın.'
      }
    ]
  },
  {
    id: 'art-baby-stroller-park',
    topic: 'baby',
    categoryName: 'Dış Yaşam',
    title: 'Bebekle Dışarı Çıkmak: Puset Seçimi ve Park Rutini',
    subtitle: 'Temiz hava, duyusal uyarım ve annenin dış dünyayla yeniden buluşması.',
    image: 'blog_baby_stroller_park',
    minutes: 3,
    weeks: [36, 40],
    doctor: 'Uzm. Dr. Hande Çetin · Pediatrist',
    keyPoints: [
      'Bebek 1 haftalık olduktan sonra hava koşulları uygunsa dışarı çıkarılabilir.',
      'Pusetin üzerine kalın battaniye örtmek içeride sera etkisi yaratarak oksijeni azaltır.',
      'Günde 30 dakikalık dış yürüyüş bebeğin gece uykusunu derinleştirir.'
    ],
    sections: [
      {
        title: 'Mevsimine Uygun Giydirme Kuralı',
        text: 'Genel kural: Kendi giydiğiniz katmandan tam 1 kat fazla pamuklu kıyafet giydirin. Aşırı giydirmek terlemeye ve huzursuzluğa neden olur; enseyi kontrol ederek sıcaklığı ölçebilirsiniz.',
        image: 'ui_baby_stroller'
      }
    ]
  },
  {
    id: 'art-baby-shoes-gift',
    topic: 'baby',
    categoryName: 'Gelişim & Adımlar',
    title: 'İlk Adımlar: Bebekler Ne Zaman Ayakkabı Giymelidir?',
    subtitle: 'Çıplak ayakla basmanın kemik ve denge gelişimine katkısı.',
    image: 'blog_baby_shoes_gift',
    minutes: 3,
    weeks: [20, 40],
    doctor: 'Op. Dr. Burak Sezgin · Ortopedi ve Travmatoloji',
    keyPoints: [
      'Evde çıplak ayak veya kaydırmaz çorapla yürümek ayak tabanı kavisini oluşturur.',
      'Sert tabanlı ayakkabılar denge hissiyatını zayıflatır.',
      'İlk ayakkabı sadece dışarıda zemindeki sert cisimlerden korumak için esnek tabanlı seçilmelidir.'
    ],
    sections: [
      {
        title: 'Esnek Taban Testi',
        text: 'Ayakkabıyı elinize aldığınızda tabanı ikiye katlanacak kadar esnek olmalı, parmak bölgesi geniş ve burnu hafif yukarı kıvrık olmalıdır.',
        image: 'blog_baby_shoes_gift'
      }
    ]
  },

  // ─── 8. YENİ KLİNİK & YAŞAM REHBERLERİ (10 YENİ BLOG) ───
  {
    id: 'art-safe-seafood',
    topic: 'nutrition',
    categoryName: 'Deniz Ürünleri',
    title: 'Gebelikte Güvenli Balık & Deniz Ürünleri: Hangileri Serbest, Hangileri Yasak?',
    subtitle: 'Bebeğin beyin gelişimi için Omega-3 (DHA) depoları ve cıva riskinden korunma.',
    image: 'blog_safe_seafood',
    minutes: 4,
    weeks: [4, 40],
    doctor: 'Dyt. Selin Erdem · Anne ve Çocuk Beslenmesi Uzmanı',
    keyPoints: [
      'Somon, hamsi ve sardalya yüksek DHA ve düşük cıva ile en güvenli 3 kaynaktır.',
      'Midye, kılıçbalığı ve dip balıkları ağır metal birikimi nedeniyle gebelikte tüketilmemelidir.',
      'Haftada 2 porsiyon (300 gr) tam pişmiş balık tüketmek bebeğin bilişsel skorunu artırır.'
    ],
    sections: [
      {
        title: 'Neden Balık Yemeliyiz?',
        text: 'Fetal beyin dokusunun ve retinanın %60\'ı Omega-3 yağ asitlerinden (özellikle DHA) oluşur. Anne adayının haftada 2 kez balık yemesi bebeğin sinir sistemi ve göz gelişimini doğrudan destekler.',
        image: 'blog_safe_seafood'
      },
      {
        title: 'Güvenli ve Zengin Seçenekler',
        text: 'Yüzeyde yaşayan küçük boy balıklar cıva tutmaz. Somon, hamsi, sardalya, palamut, uskumru ve alabalık hem protein hem de omega-3 yönünden kusursuzdur. Izgara veya fırında tam pişirilmelidir.',
        tip: '🐟 Balığın taze olması ve etinin kemiğinden kolayca ayrılacak kadar iyi pişmiş olması şarttır.'
      },
      {
        title: 'Uzak Durulması Gerekenler',
        text: 'Midye deniz suyunu süzdüğü için toksin ve ağır metal barındırır. Çiğ balık (sushi) listeria ve toksoplazma paraziti riski taşır. Kılıçbalığı ve köpekbalığı gibi yırtıcı büyük balıklar ise yüksek cıva içerir.'
      }
    ]
  },
  {
    id: 'art-morning-sickness-natural',
    topic: 'wellbeing',
    categoryName: 'Bulantı & Rahatlama',
    title: 'Sabah Bulantılarına Karşı 7 Doğal & Tıbbi Rahatlatıcı',
    subtitle: 'İlk trimesterin en zorlu döneminde mideni yatıştırmanın kanıtlanmış yolları.',
    image: 'blog_morning_sickness',
    minutes: 4,
    weeks: [4, 14],
    doctor: 'Dr. Zeynep Aydın · Kadın Hastalıkları ve Doğum Uzmanı',
    keyPoints: [
      'Taze zencefil çayı ve B6 vitamini takviyesi bulantı şiddetini %60 azaltır.',
      'Yataktan ayak basmadan önce tuzlu kraker veya sarı leblebi yemek mide asidini nötralize eder.',
      'Günde 4-5 kereden fazla kusma ve idrar koyulaşması varsa doktora başvurulmalıdır.'
    ],
    sections: [
      {
        title: 'Bulantının Gizli Nedeni',
        text: 'Gebelikte hızla tırmanan beta-hCG ve östrojen hormonları mide-bağırsak düz kaslarını gevşetir ve sindirimi yavaşlatır. Bu durum koku hassasiyetiyle birleştiğinde tipik gebelik bulantısına yol açar.',
        image: 'blog_morning_sickness'
      },
      {
        title: 'Zencefil ve B6 Vitamini Gücü',
        text: 'Taze zencefil kökünden hazırlanan ılık çay mide spazmlarını çözer. Hekiminizin önereceği B6 vitamini ise nörolojik bulantı merkezini sakinleştirir.',
        tip: '🍋 Mide bulantısı vurduğunda taze kesilmiş bir limon dilimini koklamak vagus sinirini uyararak anında ferahlık sağlar.'
      },
      {
        title: 'Beslenme Taktiği: Az ve Sık',
        text: 'Midenin ne tamamen boş kalmasına ne de tıka basa dolmasına izin verin. Sıvıları yemeklerle birlikte değil, öğünlerden yarım saat önce veya sonra yudumlayarak için.'
      }
    ]
  },
  {
    id: 'art-braxton-hicks-vs-real',
    topic: 'birth',
    categoryName: 'Kasılmalar & Doğum',
    title: 'Yalancı Sancı (Braxton Hicks) ile Gerçek Doğum Sancısı Nasıl Ayırt Edilir?',
    subtitle: 'Rahmin doğum provası ile gerçek doğum kasılmaları arasındaki 5 temel fark.',
    image: 'blog_braxton_hicks',
    minutes: 4,
    weeks: [24, 40],
    doctor: 'Op. Dr. Elif Kaya · Perinatoloji & Yüksek Riskli Gebelik',
    keyPoints: [
      'Yalancı sancılar dinlenince veya pozisyon değiştirince geçer; gerçek sancı durmaz.',
      'Gerçek doğum dalgaları belden başlar, tüm karına yayılır ve şiddeti giderek artar.',
      'Tıbbi 5-1-1 kuralı: 1 saattir her 5 dakikada bir gelen ve 1 dakika süren sancılar.'
    ],
    sections: [
      {
        title: 'Braxton Hicks: Rahmin Egzersizi',
        text: '20. haftadan sonra rahim kasları doğuma hazırlanmak için ara sıra sıkışıp gevşer. Karın basketbol topu gibi sertleşir ancak ağrı belinize vurmaz ve ritmik değildir.',
        image: 'blog_braxton_hicks'
      },
      {
        title: 'Gerçek Doğum Dalgaları',
        text: 'Gerçek kasılmalar tıpkı bir okyanus dalgası gibi tepe noktasına ulaşır ve yavaşça gevşer. Aralarındaki süre giderek kısalır (10 dk -> 7 dk -> 5 dk) ve şiddetleri yürümekle veya yatmakla azalmaz.',
        tip: '⏱️ Kasılmalarınız başladığında Momora Kasılma Sayacını açarak süreleri ve sıklığı saniyesi saniyesine kaydedin.'
      },
      {
        title: 'Ne Zaman Hastaneye Gitmeli?',
        text: 'Sancılar 5 dakikada bir gelmeye başladığında, suyunuz geldiğinde veya pembe/kırmızı lekelenme (nişan) görüldüğünde hekiminize bilgi verip hastaneye hareket edin.'
      }
    ]
  },
  {
    id: 'art-epidural-birth-facts',
    topic: 'birth',
    categoryName: 'Ağrı Yönetimi',
    title: 'Epidural Doğum Hakkında Merak Edilen 10 Gerçek: Ağrısız Doğum Rehberi',
    subtitle: 'İğne acıtır mı? Bebeğe geçer mi? Doğumu uzatır mı? Uzmanından yanıtlar.',
    image: 'blog_epidural_birth',
    minutes: 5,
    weeks: [28, 40],
    doctor: 'Uzm. Dr. Kerem Arslan · Anestezi ve Reanimasyon Uzmanı',
    keyPoints: [
      'Epidural kateter ağrısız biçimde lokal anestezi sonrasında yerleştirilir.',
      'Rahim ağzı 4 cm açıklığa ulaştığında yapılması doğum sürecini ideal hızlandırır.',
      'Yürüyen epidural (Walking Epidural) sayesinde anne bacaklarını hissedebilir ve ıkınabilir.'
    ],
    sections: [
      {
        title: 'Epidural Nasıl Etki Eder?',
        text: 'Bel omurları arasındaki epidural aralığa kılcal bir kateter takılır. Verilen lokal anestezik ilaç sadece belden aşağısındaki ağrı liflerini bloke eder; bilinciniz pırıl pırıl kalır.',
        image: 'blog_epidural_birth'
      },
      {
        title: 'Bebeğe Geçer mi?',
        text: 'İlaç kana değil, omurilik zarının dışındaki boşluğa verildiği için plasentadan bebeğe geçen miktar ihmal edilebilir düzeydedir. Bebeğin kalp atışlarına veya doğum sonrası emme refleksine zarar vermez.',
        tip: '💉 İşlem sırasında ebenizin rehberliğinde sırtınızı kedi gibi yuvarlayıp kıpırdamadan durmanız işlemin 2 dakikada bitmesini sağlar.'
      },
      {
        title: 'Doğum Anında Ikınma',
        text: 'Günümüz modern epidural dozlarında his tamamen sıfırlanmaz; kasılmanın geldiği basınç olarak algılanır. Bu sayede doğum eyleminde ebelerle tam uyum içinde ıkınabilirsiniz.'
      }
    ]
  },
  {
    id: 'art-hospital-bag-musthaves',
    topic: 'birth',
    categoryName: 'Çanta Hazırlığı',
    title: 'Doğum Çantasında Olmazsa Olmazlar: Anne, Bebek & Baba Kontrol Listesi',
    subtitle: 'Gereksiz ağırlıklardan arındırılmış, 32-34. haftada hazır olması gereken kusursuz liste.',
    image: 'blog_hospital_musthaves',
    minutes: 4,
    weeks: [30, 40],
    doctor: 'Ebe Gülfem Deniz · Doğum ve Emzirme Danışmanı',
    keyPoints: [
      'Çanta 32-34. haftalarda arabada veya kapı girişinde hazır bekletilmelidir.',
      'Önden düğmeli emzirme geceliği, lohusa külodu ve göğüs ucu lanolin kremi önceliktir.',
      'Bebek için hastane çıkışı, müslin örtüler ve araba koltuğu (ana kucağı) zorunludur.'
    ],
    sections: [
      {
        title: 'Anne İçin Konfor Paketi',
        text: 'Önden açılan pamuklu 2 takım gecelik/pijama, kaydırmaz tabanlı terlik, kalın çoraplar, doğum sonrası yüksek belli toparlayıcı külotlar, organik pamuk lohusa pedleri ve saf lanolin göğüs ucu merhemi.',
        image: 'blog_hospital_bag_pack'
      },
      {
        title: 'Bebek İçin İlk Kıyafetler',
        text: 'Önceden bebek deterjanıyla yıkanıp ütülenmiş 2 takım hastane çıkış seti (zıbın, patikli tulum, şapka, eldiven), 1 paket 1 numara bebek bezi, saf su içerikli ıslak mendil ve yumuşak nohut battaniye.',
        tip: '🚗 Hastaneden taburcu olurken güvenlik açısından oto koltuğu (ana kucağı) bulundurmak mecburi standarttır.'
      },
      {
        title: 'Baba & Refakatçi İhtiyaçları',
        text: '2-3 metre uzunluğunda telefon şarj kablosu, yedek tişört ve rahat eşofman, kuru meyve/fındık gibi enerji verici atıştırmalıklar ve tüm tıbbi evrakların toplandığı dosya.'
      }
    ]
  },
  {
    id: 'art-caffeine-coffee-pregnancy',
    topic: 'nutrition',
    categoryName: 'Kahve & İçecekler',
    title: 'Gebelikte Kahve & Çay Tüketimi: 200 mg Kafein Sınırı Ne Anlama Gelir?',
    subtitle: 'Sabah kahvesinden vazgeçmeli misin? Kafeinin plasentadan geçişi ve güvenli limitler.',
    image: 'blog_coffee_caffeine',
    minutes: 3,
    weeks: [4, 40],
    doctor: 'Dyt. Selin Erdem · Anne ve Çocuk Beslenmesi Uzmanı',
    keyPoints: [
      'ACOG ve NHS standardına göre günde 200 mg\'a kadar kafein güvenli kabul edilir.',
      '1 kupa filtre kahve ~140 mg, 1 fincan Türk kahvesi ~60 mg kafein içerir.',
      'Çikolata, kola ve yeşil çaydaki gizli kafein miktarları da hesaba katılmalıdır.'
    ],
    sections: [
      {
        title: 'Neden 200 mg Sınırı?',
        text: 'Kafein plasentayı kolayca geçerek bebeğe ulaşır. Ancak bebeğin minik karaciğeri kafeini parçalayacak enzimlere henüz sahip değildir. 200 mg altındaki tüketim bebek büyümesine zarar vermez.',
        image: 'blog_coffee_caffeine'
      },
      {
        title: 'Hangi İçecekte Ne Kadar Var?',
        text: 'Filtre kahve (200 ml): 130-150 mg. Türk kahvesi (fincan): 60 mg. Demleme siyah çay (bardak): 40-50 mg. Yeşil çay: 30 mg. Kutu kola: 35 mg. Bitter çikolata (40 gr): 25 mg.',
        tip: '☕ Kahvenizi sütlü tercih etmek mide asidini hafifletir ve günlük kalsiyum alımınıza katkıda bulunur.'
      },
      {
        title: 'Kafeinsiz Alternatifler',
        text: 'Günde 1 fincan kahvenin ardından canınız sıcak bir şeyler isterse su buharıyla kafeini alınmış kaliteli Decaf kahveleri veya Rooibos çayını keyifle tüketebilirsiniz.'
      }
    ]
  },
  {
    id: 'art-boost-breastmilk-natural',
    topic: 'postpartum',
    categoryName: 'Anne Sütü & Emzirme',
    title: 'Anne Sütünü Doğal Yollarla Artırmanın 8 Altın Kuralı',
    subtitle: 'En iyi süt artırıcı pahalı takviyeler değil; sık emzirme, bol su ve oksitosindir.',
    image: 'blog_breastmilk_boost',
    minutes: 5,
    weeks: [36, 40],
    doctor: 'Ebe Gülfem Deniz · Uluslararası Sertifikalı Emzirme Danışmanı (IBCLC)',
    keyPoints: [
      'Arz-talep dengesi: Göğüs ne kadar sık boşalırsa süt yapımı o denli hızlanır.',
      'Günde 3 litre su içmek ve her emzirmede 1 bardak su yudumlamak temel esastır.',
      'Yulaf, tahin, dereotu, çiğ badem ve rezene doğal prolaktin destekçileridir.'
    ],
    sections: [
      {
        title: 'Altın Kural: Boşalan Göğüs Süt Üretir',
        text: 'Göğüsler biriktirme kabı değildir. İçeride süt bekledikçe süt yapımını durduran FIL (Feedback Inhibitor of Lactation) proteini salgılanır. Bebeği sık sık emzirmek üretimi maksimuma çıkarır.',
        image: 'blog_breastmilk_boost'
      },
      {
        title: 'Süt Yapan Mucize Besinler',
        text: 'Beta-glukan zengini yulaf ezmesi, kalsiyum deposu tahin, çiğ badem, bol yeşil dereotu ve hurma süt miktarını ve yağ oranını gözle görülür şekilde destekler.',
        tip: '🥛 Her emzirme seansında baş ucunuzda dolu bir bardak su bulundurun ve bebek emerken yudumlayın.'
      },
      {
        title: 'Oksitosin: Sütü İndiren Sevgi Hormonu',
        text: 'Prolaktin sütü yapar, oksitosin ise kanallardan dışarı fışkırtır. Emzirirken sırtınızı yaslayın, bebeğinizin kokusunu içinize çekin ve sakinleştirici bir müzik açın.'
      }
    ]
  },
  {
    id: 'art-colic-baby-gas-massage',
    topic: 'baby',
    categoryName: 'Gaz & Kolik Çözümleri',
    title: 'Kolik & Gaz Sancısı Çeken Bebeği Rahatlatma: Adım Adım I Love U Masajı',
    subtitle: 'Akşam saatlerindeki sebepsiz ağlama krizlerine karşı 15 dakikalık yatıştırıcı rehber.',
    image: 'blog_colic_baby_massage',
    minutes: 4,
    weeks: [1, 16],
    doctor: 'Uzm. Fzt. Banu Yılmaz · Bebek Gelişimi ve Masaj Terapisti',
    keyPoints: [
      'Kolik geçici bir gelişim evresidir; bebeğin sindirim sistemi dünyaya adapte olmaktadır.',
      'I Love U karın masajı kalın bağırsağın anatomik yönünü takip ederek gazı iter.',
      'Beyaz gürültü (fön, süpürge, su sesi) anne karnı ortamını simüle ederek bebeği sakinleştirir.'
    ],
    sections: [
      {
        title: 'Kolik Ağlamasını Tanımak',
        text: 'Genellikle akşamüstü 18:00 - 22:00 arasında başlayan, bebeğin bacaklarını karnına çekip yüzünü kızartarak ağladığı krizlerdir. Bebek aç veya hasta değildir.',
        image: 'blog_colic_baby_massage'
      },
      {
        title: 'Adım Adım "I Love You" Masajı',
        text: 'Elinize birkaç damla ılık badem yağı damlatın. Bebeğin karnının sol tarafından aşağı doğru "I" çizgisi, göbeğin üstünden geçip sola inen ters "L", sağ alt kasıktan başlayıp sola inen ters "U" çizin.',
        tip: '🚴‍♂️ Masajın ardından bebeğin minik bacaklarını tutup nazikçe bisiklet pedalı gibi çevirip dizleri karna doğru 5 saniye bastırın.'
      },
      {
        title: 'Sakinleştirici Refleks: Beyaz Gürültü',
        text: 'Anne karnındaki kan akışı 85 desibel ses üretir. Bebeğinize Momora Ses Kütüphanesindeki beyaz gürültüyü açıp onu hafifçe kundaklayarak kucağınızda ritmik sallayın.'
      }
    ]
  },
  {
    id: 'art-safe-sleep-sids-prevention',
    topic: 'baby',
    categoryName: 'Güvenli Uyku',
    title: 'Güvenli Bebek Uykusu: Ani Bebek Ölümü Sendromunu (SIDS) Önleme Kuralları',
    subtitle: 'Beşik seçimi, oda sıcaklığı ve "Sırtüstü Uyku" kuralı ile bebeğinizi koruyun.',
    image: 'blog_safe_baby_sleep',
    minutes: 4,
    weeks: [1, 24],
    doctor: 'Prof. Dr. Murat Demir · Yenidoğan Yoğun Bakım Uzmanı',
    keyPoints: [
      'Bebeğiniz dönmeyi öğrenene kadar her uykuda DAİMA sırtüstü yatırılmalıdır.',
      'Beşikte yastık, yorgan, pelüş oyuncak ve kenar koruyucu ASLA bulunmamalıdır.',
      'İdeal oda sıcaklığı 20-22 derecedir; bebekler üşümekten değil aşırı sıcaktan risk yaşar.'
    ],
    sections: [
      {
        title: 'Altın Kural: Daima Sırtüstü (Back to Sleep)',
        text: 'Yüzüstü veya yan yatış bebeğin nefes yolunu kapatabilir veya soluduğu karbondioksiti tekrar içine çekmesine neden olabilir. Sırtüstü yatış en güvenli pozisyondur.',
        image: 'blog_safe_baby_sleep'
      },
      {
        title: 'Sade ve Boş Beşik İlkesi',
        text: 'Beşik içinde sadece yatağa sıkıca geçirilmiş pamuklu bir çarşaf olmalıdır. Battaniye yerine mevsime uygun tog derecesine sahip giyilebilir uyku tulumu tercih edilmelidir.',
        tip: '🌡️ Bebeğin sıcaklığını el ve ayaklarından değil, ensesinden veya göğsünden kontrol edin; ensesi ılık ve kuru olmalıdır.'
      },
      {
        title: 'Aynı Oda, Ayrı Yatak',
        text: 'Amerikan Pediatri Akademisi (AAP), ilk 6 ay boyunca bebeğin ebeveyn yatağında değil, ebeveynin hemen yanı başındaki bağımsız bir beşikte yatmasını tavsiye eder.'
      }
    ]
  },
  {
    id: 'art-baby-blues-vs-depression',
    topic: 'postpartum',
    categoryName: 'Ruh Sağlığı',
    title: 'Lohusalık Hüznü mü, Doğum Sonrası Depresyon mu? Belirtiler ve Destek Adımları',
    subtitle: 'Doğumdan sonra gelen ağlama krizleri, suçluluk hissi ve yalnız olmadığınız gerçeği.',
    image: 'blog_postpartum_blues',
    minutes: 5,
    weeks: [36, 40],
    doctor: 'Psk. Melis Akın · Perinatal Ruh Sağlığı & Çift Danışmanı',
    keyPoints: [
      'Annelerin %80\'i doğumdan sonraki ilk 2 haftada "Baby Blues" (Lohusalık Hüznü) yaşar.',
      'Ağlama nöbetleri ve yetersizlik hissi 2 haftayı aşıyorsa profesyonel destek alınmalıdır.',
      'Lohusalık depresyonu tedavi edilebilen tıbbi bir durumdur; asla kötü annelik göstergesi değildir.'
    ],
    sections: [
      {
        title: 'Baby Blues: Hormonların Geri Çekilişi',
        text: 'Doğumun hemen ardından plasentanın ayrılmasıyla östrojen ve progesteron seviyeleri saatler içinde dip yapar. Sebepsiz ağlama, kaygı ve duygusallık son derece yaygın ve geçicidir.',
        image: 'blog_postpartum_blues'
      },
      {
        title: 'Depresyon Ne Zaman Düşünülmeli?',
        text: 'Eğer yataktan kalkmak istememe, bebeğe karşı sevgi hissedememe suçluluğu, yoğun panik ataklar ve umutsuzluk 2 haftadan uzun sürüyorsa bu postpartum depresyondur.',
        tip: '🌸 "Ben yetersiz bir anneyim" düşüncesi zihninizin size fısıldadığı hormonal bir yanılsamadır; siz bebeğiniz için dünyadaki en doğru annesiniz.'
      },
      {
        title: 'İyileşme Adımları',
        text: 'Eşinizden ve ailenizden yardım istemekten çekinmeyin. Psikoterapi ve gerekirse emzirme dostu medikal destekle annelerin tamamına yakını bu süreci güvenle ve güçlenerek atlatır.'
      }
    ]
  }
];

export const articleById = id => articles.find(a => a.id === id);
export const articlesByTopic = topicId => articles.filter(a => a.topic === topicId);
export const weeklyArticles = week => articles.filter(a => a.weeks && week >= a.weeks[0] && week <= a.weeks[1]);

export function searchArticles(query = '') {
  const clean = query.trim().toLocaleLowerCase('tr');
  if (!clean) return articles;
  return articles.filter(a => {
    return a.title.toLocaleLowerCase('tr').includes(clean) ||
           a.subtitle.toLocaleLowerCase('tr').includes(clean) ||
           (a.categoryName && a.categoryName.toLocaleLowerCase('tr').includes(clean)) ||
           (a.sections && a.sections.some(s => s.title.toLocaleLowerCase('tr').includes(clean) || s.text.toLocaleLowerCase('tr').includes(clean)));
  });
}
