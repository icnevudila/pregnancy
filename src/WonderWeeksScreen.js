import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors, fonts, shadow } from './theme';
import { Icon } from './Icons';
import { T, Tap, Card, ScreenHero, InfoNote, MetricCard } from './ui';
import { formatLocalizedDate } from './domain.mjs';

export const WONDER_LEAPS = [
  {
    leapNumber: 1,
    startWeek: 4.5,
    endWeek: 5.5,
    peakWeek: 5,
    titleTr: '1. Sıçrama: Değişen Duyular Dünyası',
    titleEn: 'Leap 1: The World of Changing Sensations',
    shortDescTr: 'Metabolizma ve duyusal algı olgunlaşır; bebek çevresindeki ışık, ses ve dokuları ilk kez yetişkin benzeri netlikte deneyimler.',
    shortDescEn: 'Metabolism and sensory processing mature; baby perceives light, sound, and touch with newfound clarity.',
    stormSignalsTr: [
      'Aniden sebepsiz ağlama nöbetleri ve daha sık kucak isteme',
      'Memede veya biberonda huzursuzluk; emerken dikkat dağılması',
      'Etraftaki parlak ışıklara veya ani seslere sıçrayarak tepki verme',
    ],
    stormSignalsEn: [
      'Sudden intense crying spells and seeking constant physical contact',
      'Restlessness during nursing; pulling off the breast or bottle',
      'Heightened startle response to bright lights and household noises',
    ],
    newSkillsTr: [
      'İlk bilinçli sosyal gülümseme (Refleks olmayan gerçek tebessüm)',
      'İnsan yüzlerine ve özellikle annenin gözlerine daha uzun süre odaklanma',
      'İlk gerçek gözyaşlarının belirmesi',
      'Dokunulduğunda sakinleşme ve kalp atışını dinleme',
    ],
    newSkillsEn: [
      'First intentional social smile (not just sleep reflex)',
      'Prolonged eye contact and gazing at parental faces',
      'First real shed tears appear',
      'Calming quickly to gentle skin-to-skin touch',
    ],
    gamesTr: [
      'Yüz Yüze Göz Teması: Bebeğinizle 20-25 cm mesafeden göz teması kurup yumuşak ses tonuyla şarkı fısıldayın.',
      'Duyusal Ten Tene Temas: Göğsünüze yatırıp sırtını nazik dairesel hareketlerle sıvazlayın.',
      'Yavaş Nesne Takibi: Siyah-beyaz yüksek kontrastlı kartları göz hizasından yavaşça sağa ve sola kaydırın.',
    ],
    gamesEn: [
      'Face-to-Face Bonding: Hold baby 8-10 inches away and whisper melodic rhymes.',
      'Skin-to-Skin Serenity: Lay baby on your chest to hear your steady heartbeat.',
      'Contrast Card Tracking: Move black-and-white visual cards slowly across field of view.',
    ],
  },
  {
    leapNumber: 2,
    startWeek: 7.5,
    endWeek: 9.5,
    peakWeek: 8,
    titleTr: '2. Sıçrama: Desenler Dünyası',
    titleEn: 'Leap 2: The World of Patterns',
    shortDescTr: 'Bebek bedeninin sınırlarını, ellerini ve ayaklarını keşfeder; görsel desenleri ve ses ritimlerini ayırt etmeye başlar.',
    shortDescEn: 'Baby discovers their hands, feet, and physical body limits while recognizing visual patterns and repeating rhythms.',
    stormSignalsTr: [
      'Uykudan sık irkilerek uyanma; derin uykuya geçişte zorlanma',
      'Yalnız bırakıldığında anında feryat etme; sürekli tensel temas arzusu',
      'Beslenmeyi yarıda kesip etrafı inceleme telaşı',
    ],
    stormSignalsEn: [
      'Frequent startles awake; difficulty falling into deep restorative sleep',
      'Instant fussing when placed down; craving non-stop body wear',
      'Distracted feeding, pulling away to scan the ceiling and walls',
    ],
    newSkillsTr: [
      'Kendi ellerini yüzünün önüne getirip büyülenmiş gibi dakikalarca inceleme',
      'Sesli heceleme başlangıcı: "Agu", "Ooo", "Aaa" gibi ilk sesli harfler',
      'Başını dik tutma süresinin uzaması',
      'Kıyafetlerdeki çizgili ve puantiyeli desenleri gözleriyle tarama',
    ],
    newSkillsEn: [
      'Discovering hands: holding them in front of eyes in pure fascination',
      'Early cooing: making vocal vowel sounds like "aah", "ooh", "agu"',
      'Longer and steadier head control while resting on tummy',
      'Tracking striped and dotted high-contrast patterns across a room',
    ],
    gamesTr: [
      'El Dansı: Bebeğin ellerini hafifçe çırparak "fış fış kayıkçı" şarkısını söyleyin.',
      'Ayna Karşısında Tanışma: Kucağınızda aynanın karşısına geçin, ellerini gösterin.',
      'Karın Üstü Egzersizi (Tummy Time): Göğsünüze veya sert bir oyun matına yatırarak başını kaldırmasını teşvik edin.',
    ],
    gamesEn: [
      'Hand Dancing: Gently clap baby’s soft hands together with nursery rhymes.',
      'Mirror Discovery: Stand before a safe nursery mirror and smile together.',
      'Tummy Time Mastery: Place on firm play mat to strengthen neck and shoulder muscles.',
    ],
  },
  {
    leapNumber: 3,
    startWeek: 11.5,
    endWeek: 12.5,
    peakWeek: 12,
    titleTr: '3. Sıçrama: Yumuşak Geçişler Dünyası',
    titleEn: 'Leap 3: The World of Smooth Transitions',
    shortDescTr: 'Sert ve kesik hareketler yerini akıcı, yumuşak kas kontrolüne bırakır; ses tonundaki iniş çıkışları algılar.',
    shortDescEn: 'Jerky newborn motions transform into fluid, coordinated motor movements and tone modulations.',
    stormSignalsTr: [
      'Gece sık uyanmalar ve sadece kucakta sakinleşebilme',
      'Daha az emme veya tam tersi sürekli memede kalma isteği (konfor emmesi)',
      'Gündüz şekerlemelerinin 20-30 dakikada sonlanması',
    ],
    stormSignalsEn: [
      'Frequent night wakings and requiring rocking to settle',
      'Cluster feeding or feeding only for emotional comfort',
      'Catnapping: waking up after only 20-30 minutes of daytime sleep',
    ],
    newSkillsTr: [
      'Başını 90 derece dik tutarak etraftaki konuşan kişiyi arama',
      'Uzanma refleksi: Asılı duran oyuncağa doğru elini bilinçli savurma',
      'Kahkaha benzeri neşeli ciyaklamalar ve kıkırdamalar',
      'Ses tonunuzdaki sevinç veya sakinliği hissedip ona göre tepki verme',
    ],
    newSkillsEn: [
      'Holding head up at 90 degrees while scanning for voices',
      'Intentional swiping and batting at hanging gym toys',
      'First joyful squeals, chortles, and genuine baby chuckles',
      'Mirroring vocal inflections and responding to soothing vocal pitch',
    ],
    gamesTr: [
      'Uçak / Salıncak Oyunu: Kucağınızda nazikçe havada süzdürerek yumuşak hız değişimlerini hissettirin.',
      'Dokun-Hisset Kumaşlar: İpek eşarp, yumuşak kadife ve pamuklu kumaşları parmaklarına dokundurun.',
      'Sesli Diyalog: Çıkardığı sesleri aynen taklit ederek sırayla konuşma ritmi oluşturun.',
    ],
    gamesEn: [
      'Gentle Aeroplane: Gently glide baby through the air to perceive fluid motion.',
      'Texture Explorations: Touch fingers to silk scarves, cozy velvet, and ribbed cotton.',
      'Echo Dialogues: Repeat their coos back to teach back-and-forth conversation turn-taking.',
    ],
  },
  {
    leapNumber: 4,
    startWeek: 14.5,
    endWeek: 19.5,
    peakWeek: 19,
    titleTr: '4. Sıçrama: Olaylar Dünyası (4. Ay Regresyonu)',
    titleEn: 'Leap 4: The World of Events (4M Regression)',
    shortDescTr: 'En uzun ve zorlu zihinsel sıçrama! Neden-sonuç algısı doğar; uyku döngüleri yetişkin benzeri evrelere geçer.',
    shortDescEn: 'The longest developmental leap! Baby comprehends cause-and-effect as sleep architecture shifts to adult cycles.',
    stormSignalsTr: [
      'Şiddetli uyku gerilemesi: Saatte bir uyanma, yatağa konulduğunda feryat etme',
      'Anneye aşırı yapışma (Clinginess); babada veya başkasında sakinleşmeme',
      'Göz temasını kesip ağlayarak kucağa sığınma',
      'Gündüz uykuya dalışlarda dakikalarca direnme',
    ],
    stormSignalsEn: [
      'Severe sleep regression: waking every 60-90 minutes at night',
      'Intense clinginess; refusing settling from anyone except primary caregiver',
      'Sensory overwhelm: crying and burying face in caregiver chest',
      'Fierce bedtime resistance despite heavy eye rubbing',
    ],
    newSkillsTr: [
      'Neden-Sonuç: Çıngırağı salladığında ses çıktığını anlar ve tekrar tekrar sallar',
      'İki elini ortada birleştirerek nesneleri kavramak ve doğrudan ağza götürmek',
      'Kendi adını duyduğunda irkilerek dönüp bakma',
      'Düşen bir nesnenin ardından aşağıya doğru bakma',
    ],
    newSkillsEn: [
      'Cause & Effect: Realizing shaking a rattle creates joyful sound',
      'Bilateral coordination: Grasping objects with both hands and bringing to mouth',
      'Head turning reliably when hearing their own name called',
      'Tracking a dropped toy downwards to the floor',
    ],
    gamesTr: [
      'Ce-E (Peek-a-boo): Tülbentin arkasından aniden çıkıp gülümseyin; nesne sürekliliğinin ilk tohumudur.',
      'Çıngırak & Sesli Çoraplar: Ayaklarına çıngıraklı çorap giydirin; tekmeledikçe ses duymasını sağlayın.',
      'Su Şapırdatma: Banyo esnasında elleriyle suya vurmasına izin verin.',
    ],
    gamesEn: [
      'Peek-a-Boo Foundations: Hide behind a muslin cloth and pop out with a warm smile.',
      'Rattle Socks: Put wrist/ankle rattle booties on to link kicking with sound.',
      'Water Splashes: Encourage gentle bath splashing to witness cause-and-effect ripples.',
    ],
  },
  {
    leapNumber: 5,
    startWeek: 22.5,
    endWeek: 26.5,
    peakWeek: 26,
    titleTr: '5. Sıçrama: İlişkiler Dünyası (Ayrılık Kaygısı)',
    titleEn: 'Leap 5: The World of Relationships (Separation Anxiety)',
    shortDescTr: 'Mesafe ve ayrılık algısı başlar; bebek annesinin odadan çıkıp gidebileceğini ve tek başına kalabileceğini anlar.',
    shortDescEn: 'Spatial distance awareness dawns; baby realizes mom can physically walk away, sparking primal separation anxiety.',
    stormSignalsTr: [
      'Anne 1 metre uzaklaştığında bile panik halinde ağlama',
      'Tanıdık akrabalara ve yabancılara karşı ani çekingenlik / korku',
      'Gece boyunca anneyi yoklamak için sık sık hafifçe uyanma',
    ],
    stormSignalsEn: [
      'Panicked shrieks even if caregiver steps two feet away to the doorway',
      'Sudden stranger anxiety: crying when grandparents or friends approach',
      'Frequent micro-wakings to touch caregiver skin and confirm presence',
    ],
    newSkillsTr: [
      'Mesafe algısı: Bir nesnenin uzakta mı yakında mı olduğunu hesaplayabilir',
      'Düğmelere basma, kapakları açıp kapatma merakı',
      'Desteksiz veya hafif destekle oturma dengesi',
      'İki nesneyi birbirine vurarak ses çıkarma',
    ],
    newSkillsEn: [
      'Spatial depth judgment: Calculating whether a toy is within reaching reach',
      'Fascination with buttons, flaps, lids, and mechanical connections',
      'Tripod sitting and developing independent core balance',
      'Banging two blocks together rhythmically',
    ],
    gamesTr: [
      'Sesli Bağlantı: Başka odaya geçerken sürekli şarkı söyleyerek veya konuşarak sesinizle varlığınızı hissettirin.',
      'Kutuya Doldur-Boşalt: Geniş bir sepete yumuşak oyuncakları doldurup dökmesini sağlayın.',
      'Yastık Tırmanışı: Yere koyduğunuz minderlerin üzerinden emeklemesi için teşvik edin.',
    ],
    gamesEn: [
      'Vocal Tethering: Sing or narrate from the adjacent room so baby hears you remain close.',
      'Fill and Dump: Put wooden spoons into a bowl and dump them together.',
      'Cushion Obstacle Course: Encourage crawling over soft floor pillows.',
    ],
  },
  {
    leapNumber: 6,
    startWeek: 33.5,
    endWeek: 37.5,
    peakWeek: 37,
    titleTr: '6. Sıçrama: Kategoriler Dünyası',
    titleEn: 'Leap 6: The World of Categories',
    shortDescTr: 'Benzerlik ve farklılıkları ayırt eder; hayvanları, yiyecekleri ve şekilleri zihninde gruplandırır.',
    shortDescEn: 'Baby classifies objects by abstract attributes: recognizing dogs bark, apples are food, and textures differ.',
    stormSignalsTr: [
      'Sürekli huysuzluk, yiyecekleri fırlatma veya reddetme',
      'Giyinirken, bez değişirken yay gibi gerilip kaçmaya çalışma',
      'Yalnız uyumayı şiddetle reddetme',
    ],
    stormSignalsEn: [
      'Fussiness at meal times, throwing food and testing limits',
      'Alligator rolls during diaper changes; struggling against restraints',
      'Refusing to settle in crib without prolonged rocking',
    ],
    newSkillsTr: [
      'Kategori algısı: Resimli kitapta köpeğe dokunup "hav hav" sesini tanıma',
      'Duyusal keşif: Yere dökülen kırıntıyı baş parmak ve işaret parmağıyla (kıskaç kavrama) alma',
      'Basit komutları anlama: "Top nerede?", "Bana ver"',
      'Duygusal empati: Başka bir bebek ağladığında yüzünü asıp dudak bükme',
    ],
    newSkillsEn: [
      'Category recognition: Pointing to a dog in a book and imitating barking sounds',
      'Pincer grasp mastery: Picking up tiny crumbs with index finger and thumb',
      'Receptive language: Understanding "Where is the ball?", "Give to Mommy"',
      'Empathic responsiveness: Looking distressed when hearing another infant cry',
    ],
    gamesTr: [
      'Doğa Dokunuşları: Parkta ağaç kabuğuna, yapraklara, çimene ve çakıl taşlarına dokundurarak "sert", "yumuşak" kavramlarını anlatın.',
      'Hayvan Sesleri Kitabı: Resimli kartlarla hayvan seslerini taklit edin.',
      'Kıskaç Kavrama Tepsisi: Buharda pişmiş havuç veya bezelyeleri parmaklarıyla almasını teşvik edin.',
    ],
    gamesEn: [
      'Nature Sensory Walk: Touching tree bark, crunchy leaves, and soft grass.',
      'Animal Sound Rhymes: Linking farm pictures with funny vocalizations.',
      'Pincer Food Trays: Offering soft steamed peas or banana bites.',
    ],
  },
  {
    leapNumber: 7,
    startWeek: 41.5,
    endWeek: 46.5,
    peakWeek: 46,
    titleTr: '7. Sıçrama: Zincirleme Olaylar Dünyası',
    titleEn: 'Leap 7: The World of Sequences',
    shortDescTr: 'Bir hedefe ulaşmak için adımların belirli bir sırayla yapılması gerektiğini kavrar (Blokları sırayla dizme, kaşığı daldırıp ağza götürme).',
    shortDescEn: 'Understanding sequences: realizing steps must follow an order to accomplish a goal (scooping food, nesting cups).',
    stormSignalsTr: [
      'Öfke krizleri (Tantrum başlangıçları): İstediği ardışık hareketi yapamayınca bağırma',
      'Uyku saatlerinde ayağa kalkıp beşikten sarkarak uykuya direnme',
      'Sürekli ebeveynin elinden tutup peşinden sürükleme arzusu',
    ],
    stormSignalsEn: [
      'Proto-tantrums: Screaming in frustration when a tower falls over',
      'Standing up in the crib and refusing to lie back down for sleep',
      'Dragging caregiver by the hand to reach forbidden kitchen drawers',
    ],
    newSkillsTr: [
      'İç içe geçen kapları doğru sırayla dizme',
      'Kaşığı çorbaya daldırıp ağzına götürme provası',
      'Ayakkabısını veya çorabını ayağına geçirmeye çalışma',
      'İlk bilinçli sözcükler: "Anne", "Baba", "Dede", "Su"',
    ],
    newSkillsEn: [
      'Stacking nesting cups in accurate sequence',
      'Attempting self-feeding with child-safe spoon',
      'Trying to slide socks or shoes onto feet',
      'First true words with assigned meaning ("Mama", "Dada", "Water")',
    ],
    gamesTr: [
      'Halka Kulesi: Renkli halkaları kule çubuğuna sırayla geçirme oyunu.',
      'Bebek Beslemece: Oyuncak ayısına kaşıkla mama yedirmesini sağlayın.',
      'Mini Engel Parkuru: Koltuğa tutunup sıralayarak oyuncağa ulaşmasını izleyin.',
    ],
    gamesEn: [
      'Ring Stacker: Threading concentric rings onto the center peg in order.',
      'Pretend Feeding: Offering imaginary soup to a beloved teddy bear.',
      'Cruising Challenge: Motivating baby to cruise along the coffee table.',
    ],
  },
  {
    leapNumber: 8,
    startWeek: 50.5,
    endWeek: 54.5,
    peakWeek: 55,
    titleTr: '8. Sıçrama: Programlar Dünyası (1 Yaş Eşiği)',
    titleEn: 'Leap 8: The World of Programs (1 Year Milestone)',
    shortDescTr: 'Günün akışını ve aile rutinlerini bütünsel olarak anlar. Kapı anahtarı sesi eve birinin geldiğini, önlük takılması yemek zamanını ifade eder.',
    shortDescEn: 'Comprehending whole programs: recognizing daily routines like keys jingling means arrivals, and bibs mean mealtime.',
    stormSignalsTr: [
      '1 Yaş Uyku Direnci (Tek uykuya geçiş kafa karışıklığı)',
      'İnatlaşma ve sınırları zorlama',
      'Beslenmede katı yemek seçiciliği başlangıcı',
    ],
    stormSignalsEn: [
      '12-Month nap strike (fighting 2nd nap vigorously)',
      'Willfulness and testing boundaries by looking back while reaching for hazards',
      'Sudden toddler food pickiness',
    ],
    newSkillsTr: [
      'İlk bağımsız adımlar veya desteksiz dengede durma',
      'Ev işlerini taklit etme: Bezi alıp masayı silme, saçını taramaya çalışma',
      'Kendi kıyafetini giymeye yardım etme (kolunu montun koluna sokma)',
      'Basit işaret dili ve işaret parmağıyla yön gösterme',
    ],
    newSkillsEn: [
      'First independent balance and wobbly walking steps',
      'Domestic imitation: Wiping surfaces with a cloth, pretending to comb hair',
      'Cooperating with dressing by pushing arms through jacket sleeves',
      'Pointing decisively to express desires and shared attention',
    ],
    gamesTr: [
      'Ev İşi Taklit Köşesi: Minik bir bezle sehpayı silmesine veya çorapları sepete atmasına izin verin.',
      'Saklanan Eşyayı Bulma: Oyuncağı yastığın altına saklayıp bulmasını sağlayın.',
      'Şarkılı Hareketler: "Kırmızı Balık", "Ali Baba’nın Çiftliği" gibi hareketli şarkılarla dans edin.',
    ],
    gamesEn: [
      'Mini Helper Tasks: Putting plastic cups away in low kitchen cupboards.',
      'Complex Hide-and-Seek: Finding toys hidden beneath double blankets.',
      'Action Songs: Doing the "Wheels on the Bus" arm motions together.',
    ],
  },
  {
    leapNumber: 9,
    startWeek: 60.5,
    endWeek: 64.5,
    peakWeek: 64,
    titleTr: '9. Sıçrama: İlkeler Dünyası (Benlik & İrade)',
    titleEn: 'Leap 9: The World of Principles (Toddler Willpower)',
    shortDescTr: 'Benlik bilinci ve "Hayır!" dönemi. Bebek kendi iradesi olduğunu, seçim yapabileceğini ve kuralları esnetebileceğini fark eder.',
    shortDescEn: 'Emergence of autonomous willpower: exploring choices, asserting preferences, and understanding "No!".',
    stormSignalsTr: [
      'Şiddetli öfke patlamaları (Tantrum) ve kendini yere atma',
      'Her şeye "Hayır!" diyerek karşı çıkma',
      'Paylaşmayı kesinlikle reddetme ("Benim!")',
    ],
    stormSignalsEn: [
      'Full-blown emotional floor meltdowns when thwarted',
      'Reflexive contrarianism: screaming "No!" to desired snacks',
      'Fierce possessiveness over toys ("Mine!")',
    ],
    newSkillsTr: [
      'Seçim yapabilme: "Kırmızı kazağı mı mavi kazağı mı giymek istersin?"',
      'Mizah ve şaka anlayışı: Ebeveynin çorabını başına şapka gibi koyup gülme',
      'Duyguları adlandırma başlangıcı: "Korktum", "Mutlu"',
      'Kalemle kağıda bilinçli karalamalar yapma',
    ],
    newSkillsEn: [
      'Making intentional dual choices ("Red cup or blue cup?")',
      'Developing toddler humor: Putting a shoe on their head to elicit laughs',
      'Rudimentary emotion labeling: "Happy", "Sad", "Boo-boo"',
      'Deliberate scribbling on paper with chunky crayons',
    ],
    gamesTr: [
      'Kontrollü Seçimler: İki tişört veya iki meyve gösterip birini seçmesine izin verin; iradesini onurlandırın.',
      'Duygu Kartları: Mutlu, üzgün, şaşkın yüz mimiklerini aynada birlikte canlandırın.',
      'Kum ve Su Havuzu: Doğal materyallerle dökme, yoğurma ve şekil verme oyunları.',
    ],
    gamesEn: [
      'Empowered Choices: Offering two acceptable options to reduce power struggles.',
      'Mirror Emotions: Making exaggerated happy and surprised faces together.',
      'Sensory Water Tables: Scooping and pouring without adult correction.',
    ],
  },
  {
    leapNumber: 10,
    startWeek: 71.5,
    endWeek: 75.5,
    peakWeek: 75,
    titleTr: '10. Sıçrama: Sistemler Dünyası (Vicdan & Uyum)',
    titleEn: 'Leap 10: The World of Systems (Social Systems & Empathy)',
    shortDescTr: 'Ailenin ve toplumun kurallarını, başkalarının duygularını ve adalet kavramını anlamaya başlar.',
    shortDescEn: 'Internalizing social systems, compassion, family rules, and moral fairness as toddlerhood begins.',
    stormSignalsTr: [
      'Kural sınırlarını test etmek için kasıtlı yasak davranışlar',
      'Uyku saatinde su isteme, masal uzatma gibi bitmeyen ertelemeler',
      'Duygusal dalgalanmalar ve kıskançlık krizleri',
    ],
    stormSignalsEn: [
      'Testing family rules with deliberate eye contact before breaking them',
      'Elaborate bedtime stalling rituals ("One more hug, need water")',
      'Emotional mood swings and emerging sibling jealousy',
    ],
    newSkillsTr: [
      'Gerçek empati: Üzgün olan anneye sarılıp yanağını öpme veya oyuncağını uzatma',
      '2-3 kelimeli tam cümleler kurma: "Anne parka gidelim"',
      'Sembolik hayali oyunlar: Doktorculuk, araba yarıştırma, yemek pişirme',
      'Kuralları hatırlama ve uygulama: "Ayakkabılar kapıda çıkarılır"',
    ],
    newSkillsEn: [
      'Genuine compassion: Hugging a weeping sibling and offering a pacifier',
      'Stringing 2-3 word sentences: "Mommy go outside please"',
      'Elaborate pretend play: Stethoscope check-ups, tea parties',
      'Internalizing family routines: Putting shoes in the entryway rack',
    ],
    gamesTr: [
      'Rol Yapma Oyunları: Doktor çantası veya tamir seti ile hayali hikayeler kurun.',
      'Birlikte Masal Okuma: Kitaptaki karakterlerin ne hissettiğini sorarak duygusal zekasını besleyin.',
      'Büyük Boy Bloklar: Birlikte köprüler, evler ve garajlar inşa edin.',
    ],
    gamesEn: [
      'Pretend Play Roles: Caring for toy animals with blankets and pretend medicine.',
      'Interactive Storytime: Asking how picture book characters are feeling.',
      'Architectural Block Play: Building stable houses and tunnels together.',
    ],
  },
];

export function WonderWeeksScreen({ state, update, toast, close, lang: propLang }) {
  const lang = propLang || state?.lang || 'tr';
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState('radar'); // 'radar' | 'allLeaps' | 'coping'
  const [selectedLeapIndex, setSelectedLeapIndex] = useState(3); // Default to Leap 4 (19w)

  // Calculate baby age in weeks based on gestational due date (TDT) or birth date
  const babyAgeWeeks = useMemo(() => {
    const dueDateStr = state.dueDate || state.pregnancy?.dueDate;
    if (dueDateStr) {
      const due = new Date(dueDateStr);
      const now = new Date();
      const diffDays = Math.round((now - due) / (1000 * 60 * 60 * 24));
      const weeks = Math.max(1, Math.round(diffDays / 7));
      return weeks;
    }
    return 19; // Default fallback to 19th week (famous Leap 4)
  }, [state.dueDate, state.pregnancy?.dueDate]);

  // Find current leap or upcoming leap
  const currentLeapInfo = useMemo(() => {
    for (let i = 0; i < WONDER_LEAPS.length; i++) {
      const leap = WONDER_LEAPS[i];
      if (babyAgeWeeks >= leap.startWeek - 1 && babyAgeWeeks <= leap.endWeek + 1) {
        const isStormy = babyAgeWeeks >= leap.startWeek && babyAgeWeeks <= leap.endWeek;
        const daysToSun = Math.max(1, Math.round((leap.endWeek - babyAgeWeeks) * 7));
        return {
          leap,
          index: i,
          isStormy,
          daysToSun: isStormy ? daysToSun : 0,
          status: isStormy ? 'storm' : 'transition',
        };
      }
    }
    // If between leaps
    const nextLeap = WONDER_LEAPS.find(l => l.startWeek > babyAgeWeeks) || WONDER_LEAPS[WONDER_LEAPS.length - 1];
    const daysToStorm = Math.max(1, Math.round((nextLeap.startWeek - babyAgeWeeks) * 7));
    return {
      leap: nextLeap,
      index: WONDER_LEAPS.indexOf(nextLeap),
      isStormy: false,
      daysToSun: 0,
      daysToStorm,
      status: 'sunny',
    };
  }, [babyAgeWeeks]);

  const activeLeap = WONDER_LEAPS[selectedLeapIndex] || WONDER_LEAPS[3];

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHero
        title={isEn ? 'The Wonder Weeks™ (Mental Leaps)' : 'Harika Haftalar & Zihinsel Sıçramalar'}
        subtitle={isEn ? 'Predictable neurological fussy leaps & new mental skills' : 'Bebeğinizin nörolojik gelişim atakları, fırtınalı dönemler ve yeni beceriler'}
        coverAsset="card_wonder_leaps"
      />

      {/* Subtle Clinical Footnote */}
      <View style={styles.medicalFootnote}>
        <Icon name="check" size={12} color="#8A7A90" />
        <T style={styles.medicalFootnoteText}>
          {isEn
            ? 'Mental leaps reflect developmental psychology. If baby exhibits high fever or extreme lethargy, consult your pediatrician immediately.'
            : 'Zihinsel sıçramalar gelişim psikolojisine dayanır. Yüksek ateş veya aşırı halsizlik durumlarında çocuk doktorunuza danışınız.'}
        </T>
      </View>

      {/* Live Leap Radar Banner */}
      <Card style={[styles.radarCard, currentLeapInfo.status === 'storm' ? styles.radarCardStorm : styles.radarCardSun]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={styles.radarIconWrap}>
              <T style={{ fontSize: 26 }}>
                {currentLeapInfo.status === 'storm' ? '⚡' : '☀️'}
              </T>
            </View>
            <View>
              <T style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                {isEn ? `Current Age: ~${babyAgeWeeks} Weeks` : `Düzeltilmiş Yaş: ~${babyAgeWeeks}. Hafta`}
              </T>
              <T bold style={{ fontSize: 19, color: colors.ink }}>
                {currentLeapInfo.status === 'storm'
                  ? (isEn ? `Stormy Period: ${currentLeapInfo.leap.leapNumber}. Leap` : `Fırtınalı Dönem: ${currentLeapInfo.leap.leapNumber}. Sıçrama`)
                  : (isEn ? 'Sunny Calm Phase ☀️' : 'Güneşli & Sakin Evre ☀️')}
              </T>
            </View>
          </View>

          <View style={[styles.statusBadge, currentLeapInfo.status === 'storm' ? styles.badgeStorm : styles.badgeSun]}>
            <T bold style={[styles.badgeText, currentLeapInfo.status === 'storm' ? { color: '#B42318' } : { color: '#027A48' }]}>
              {currentLeapInfo.status === 'storm'
                ? (isEn ? `${currentLeapInfo.daysToSun} days to Sun` : `${currentLeapInfo.daysToSun} gün kaldı`)
                : (isEn ? 'Calm Growth' : 'Beceriler Oturuyor')}
            </T>
          </View>
        </View>

        <T style={styles.radarDesc}>
          {currentLeapInfo.status === 'storm'
            ? (isEn
              ? `Baby is currently experiencing intense brain rewiring. Expect sleep regression, clinginess, and crying. Hang in there!`
              : `Bebeğinizin beyninde milyarlarca yeni nöronal bağlantı kuruluyor. Uykuya direnme, memede huzursuzluk ve kucaktan inmeme çok normaldir.`)
            : (isEn
              ? `A peaceful sunny phase! Baby is delighting in their newly mastered skills and smiling with confidence.`
              : `Huzurlu ve güneşli bir dönemdesiniz! Bebeğiniz son sıçramada kazandığı yeni becerileri pekiştiriyor ve keyfi yerinde.`)}
        </T>

        <View style={styles.radarFooter}>
          <Tap
            onPress={() => {
              setSelectedLeapIndex(currentLeapInfo.index);
              setActiveTab('allLeaps');
            }}
            style={styles.radarActionBtn}
          >
            <T bold style={{ color: colors.purple, fontSize: 12.5 }}>
              {isEn ? `Explore ${currentLeapInfo.leap.leapNumber}. Leap Details →` : `${currentLeapInfo.leap.leapNumber}. Sıçramanın Detaylarını İncele →`}
            </T>
          </Tap>
        </View>
      </Card>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {[
          { key: 'radar', label: isEn ? 'Leap Guide' : 'Sıçrama Rehberi', icon: 'heart' },
          { key: 'allLeaps', label: isEn ? 'All 10 Leaps' : '10 Sıçrama Takvimi', icon: 'milestone' },
          { key: 'coping', label: isEn ? 'Parent Survival' : 'Ebeveyn Kurtarıcı', icon: 'shield' },
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

      {/* ─── TAB 1 & 2: LEAP DETAILS & TIMELINE ─── */}
      {(activeTab === 'radar' || activeTab === 'allLeaps') && (
        <View style={{ gap: 14 }}>
          {/* 10 Leaps Horizontal Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {WONDER_LEAPS.map((leap, idx) => {
              const isSelected = selectedLeapIndex === idx;
              const isCurrent = currentLeapInfo.index === idx;
              return (
                <Tap
                  key={leap.leapNumber}
                  onPress={() => setSelectedLeapIndex(idx)}
                  style={[
                    styles.leapPill,
                    isSelected && styles.leapPillActive,
                    isCurrent && styles.leapPillCurrent,
                  ]}
                >
                  <T style={{ fontSize: 16 }}>{idx % 2 === 0 ? '⚡' : '🧠'}</T>
                  <T bold={isSelected} style={[styles.leapPillText, isSelected && { color: '#FFFFFF' }]}>
                    {leap.leapNumber}. {isEn ? 'Leap' : 'Sıçrama'}
                  </T>
                  <T style={[styles.leapPillSub, isSelected && { color: '#F3E5F5' }]}>
                    {leap.peakWeek}. {isEn ? 'Wk' : 'Hafta'}
                  </T>
                </Tap>
              );
            })}
          </ScrollView>

          {/* Active Leap Comprehensive Card */}
          <Card style={{ padding: 18, gap: 14 }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={styles.leapBadgeNumber}>
                  <T bold style={{ color: '#FFFFFF', fontSize: 11 }}>{activeLeap.leapNumber}</T>
                </View>
                <T bold style={{ fontSize: 16, color: colors.ink }}>
                  {isEn ? activeLeap.titleEn : activeLeap.titleTr}
                </T>
              </View>
              <T style={{ fontSize: 12, color: colors.purple, marginTop: 4 }}>
                {isEn
                  ? `Peak: Around Week ${activeLeap.peakWeek} (Range: W${activeLeap.startWeek} – W${activeLeap.endWeek})`
                  : `Zirve: Yaklaşık ${activeLeap.peakWeek}. Hafta (${activeLeap.startWeek} – ${activeLeap.endWeek}. Haftalar arası)`}
              </T>
            </View>

            <T style={{ fontSize: 13, color: '#4D3B54', lineHeight: 18 }}>
              {isEn ? activeLeap.shortDescEn : activeLeap.shortDescTr}
            </T>

            {/* 1. Storm Signals (3 C's) */}
            <View style={styles.sectionBlock}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <T style={{ fontSize: 16 }}>⚡</T>
                <T bold style={{ fontSize: 13.5, color: '#B42318' }}>
                  {isEn ? 'Storm Phase Signals (Fussiness & Regression):' : 'Fırtına Fazı Sinyalleri (Huysuzluk & Uyku Direnci):'}
                </T>
              </View>
              {(isEn ? activeLeap.stormSignalsEn : activeLeap.stormSignalsTr).map((sig, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 6, marginBottom: 5 }}>
                  <T style={{ color: '#D92D20' }}>•</T>
                  <T style={{ flex: 1, fontSize: 12, color: '#573D43', lineHeight: 16 }}>{sig}</T>
                </View>
              ))}
            </View>

            {/* 2. New Skills Acquired */}
            <View style={styles.sectionBlockGreen}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <T style={{ fontSize: 16 }}>🌱</T>
                <T bold style={{ fontSize: 13.5, color: '#027A48' }}>
                  {isEn ? 'New Skills & Brain Rewiring:' : 'Kazanılacak Yeni Zihinsel Beceriler:'}
                </T>
              </View>
              {(isEn ? activeLeap.newSkillsEn : activeLeap.newSkillsTr).map((skill, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 6, marginBottom: 5 }}>
                  <T style={{ color: '#059669' }}>✓</T>
                  <T style={{ flex: 1, fontSize: 12, color: '#2D4E35', lineHeight: 16 }}>{skill}</T>
                </View>
              ))}
            </View>

            {/* 3. Recommended Games */}
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <T style={{ fontSize: 16 }}>🧸</T>
                <T bold style={{ fontSize: 13.5, color: colors.ink }}>
                  {isEn ? 'Stimulating Games & Activities:' : 'Bu Atakta Geliştirici Oyunlar:'}
                </T>
              </View>
              {(isEn ? activeLeap.gamesEn : activeLeap.gamesTr).map((game, i) => (
                <View key={i} style={styles.gameCard}>
                  <T style={{ fontSize: 12, color: '#44334B', lineHeight: 17 }}>
                    {game}
                  </T>
                </View>
              ))}
            </View>
          </Card>
        </View>
      )}

      {/* ─── TAB 3: COPING (Ebeveyn Kurtarıcı Kılavuz) ─── */}
      {activeTab === 'coping' && (
        <View style={{ gap: 14 }}>
          <Card style={{ padding: 16 }}>
            <T bold style={{ fontSize: 15, color: colors.ink, marginBottom: 8 }}>
              {isEn ? 'The Golden Rules of Surviving a Mental Leap' : 'Atak Haftalarında Hayatta Kalma Altın Kuralları'}
            </T>
            <T style={{ fontSize: 12.5, color: '#4C3B52', lineHeight: 18 }}>
              {isEn
                ? 'Remember: Your baby is not giving you a hard time; they are having a hard time. Their brain is processing a sudden flood of new sensory inputs.'
                : 'Unutmayın: Bebeğiniz size bilerek zorluk çıkarmıyor; beynine aniden dolan yepyeni algı dünyası karşısında korkuyor ve dünyası sarsılıyor. Ona güvenli liman olun.'}
            </T>
          </Card>

          {[
            {
              icon: '🤱',
              titleTr: 'Tensel Temas ve Kanguru / Sling Taşıma',
              titleEn: 'Wear Baby in a Wrap or Carrier',
              descTr: 'Bebeğinizi göğsünüze bağlamak kalp atışınızı duymasını sağlar, kortizol (stres) hormonunu yarı yarıya düşürür ve ellerinizi serbest bırakır.',
              descEn: 'Babywearing provides continuous calming contact, regulating infant heart rate and freeing your hands.',
            },
            {
              icon: '⏳',
              titleTr: 'Uyku Düzeninde Esneklik (Beklentiyi Düşürün)',
              titleEn: 'Lower Sleep Expectations Temporarily',
              descTr: 'Atak haftasında uyku eğitimine başlamayın veya katı saatlere zorlamayın. Gerekirse kucakta, puset gezintisinde veya memede uyumasına izin verin.',
              descEn: 'Never start rigid sleep training during an active storm. Allow contact naps and prioritize restorative rest.',
            },
            {
              icon: '🤝',
              titleTr: 'Eşle Vardiya Paylaşımı',
              titleEn: 'Divide Night Shifts with Partner',
              descTr: 'Geceleri 4 saatlik kesintisiz uyku blokları belirleyin. Anneler ve babalar vardiya usulü birbirini dinlendirmelidir.',
              descEn: 'Protect maternal sanity by establishing 4-hour uninterrupted partner night shifts.',
            },
            {
              icon: '🌳',
              titleTr: 'Ortam Değişikliği & Açık Hava',
              titleEn: 'Change the Scenery / Step Outside',
              descTr: 'Kriz anında balkona çıkmak veya pusetle 10 dakikalık bir yürüyüş yapmak bebeğin duyusal odak noktasını sıfırlar ve ağlamayı keser.',
              descEn: 'Stepping outside into fresh air instantly resets an overwhelmed infant’s nervous system.',
            },
          ].map((item, idx) => (
            <Card key={idx} style={{ padding: 14, gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <T style={{ fontSize: 20 }}>{item.icon}</T>
                <T bold style={{ fontSize: 13.5, color: colors.ink }}>
                  {isEn ? item.titleEn : item.titleTr}
                </T>
              </View>
              <T style={{ fontSize: 12, color: '#56425E', lineHeight: 17 }}>
                {isEn ? item.descEn : item.descTr}
              </T>
            </Card>
          ))}
        </View>
      )}

      {/* Scientific Reference Note */}
      <InfoNote
        title={isEn ? 'Dr. Frans Plooij & Scientific Basis' : 'Bilimsel Dayanak: Dr. Frans Plooij'}
        text={isEn
          ? 'Based on 35 years of infant developmental psychology research by Dr. Frans Plooij & Dr. Hetty van de Rijt. Leaps are calculated by the baby’s original estimated gestational due date.'
          : 'Harika Haftalar (The Wonder Weeks), Dr. Frans Plooij ve Dr. Hetty van de Rijt’ın 35 yıllık bebek gelişimi araştırmalarına dayanır. Hesaplamalar doğum tarihine göre değil, tahmini gebelik doğum tarihine (TDT) göre yapılır.'}
        tone="neutral"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  radarCard: {
    padding: 16,
    gap: 12,
    borderWidth: 1.5,
  },
  radarCardStorm: {
    backgroundColor: '#FFF8F8',
    borderColor: '#FED7D7',
  },
  radarCardSun: {
    backgroundColor: '#F6FEF9',
    borderColor: '#D1FADF',
  },
  radarIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeStorm: { backgroundColor: '#FEE4E2' },
  badgeSun: { backgroundColor: '#D1FADF' },
  badgeText: { fontSize: 11 },
  radarDesc: {
    fontSize: 12.5,
    color: '#49364F',
    lineHeight: 17,
  },
  radarFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#EFE5F5',
  },
  radarActionBtn: {
    alignSelf: 'flex-start',
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
  leapPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#FAF5FA',
    borderWidth: 1,
    borderColor: '#E8DCEB',
    alignItems: 'center',
    gap: 2,
    minWidth: 72,
  },
  leapPillActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
    ...shadow,
  },
  leapPillCurrent: {
    borderColor: '#E11D48',
    borderWidth: 1.5,
  },
  leapPillText: {
    fontSize: 11,
    color: colors.ink,
  },
  leapPillSub: {
    fontSize: 9.5,
    color: colors.muted,
  },
  leapBadgeNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBlock: {
    backgroundColor: '#FFF9F9',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  sectionBlockGreen: {
    backgroundColor: '#F6FEF9',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FADF',
  },
  gameCard: {
    backgroundColor: '#FAF6FA',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE3F2',
  },
  medicalFootnote: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F9F6FA',
    borderWidth: 1,
    borderColor: '#EFE7F2',
  },
  medicalFootnoteText: {
    fontSize: 11,
    color: '#8A7A90',
    lineHeight: 15,
    textAlign: 'center',
    flex: 1,
  },
});
