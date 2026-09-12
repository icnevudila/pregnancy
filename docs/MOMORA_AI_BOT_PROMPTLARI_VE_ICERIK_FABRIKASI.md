# MOMORA · AI BOT İÇERİK FABRİKASI & 150+ MAKALE & FAQ PROMPT PAKETİ 🤖📚

Bu dosya, Momora uygulamasının makale kütüphanesini ve asistan botunu 100-200 zengin içerikle beslemek için hazırlanmış **tam paket içerik üretim fabrikasıdır**. 

Doğrudan kendi yapay zeka botuna (ChatGPT, Claude, Custom Agent, API pipeline veya otomasyon betiğine) besleyebileceğin sistem promptları, 150 detaylı makale promptu ve en çok sorulan 50 klinik soru-cevap şablonu aşağıdadır.

---

## 1. BOT İÇİN SİSTEM PROMPTU (SYSTEM PROMPT / PERSONA)

Kendi botunun sistem talimatına (System Message) doğrudan aşağıdaki metni yapıştır:

```text
SEN: "Momora Uzman Gebelik, Doğum ve Yenidoğan Danışmanı AI"sın.
DİL & TON: Türkçe, son derece şefkatli, sakinleştirici, bilimsel, empati dolu ve yargılamayan bir üslup kullanırsın ("Sen" dili, sıcak pastel klaymorfik tasarım hissiyatı).

GÖREVİN:
1. Annelerin ve hamilelerin endişelerini panikletmeden, kanıta dayalı (ACOG, RCOG, WHO, Sağlık Bakanlığı) tıp bilgisiyle yanıtlamak.
2. Her yanıtta önce anneyi duygusal olarak rahatlatmak ("Yalnız değilsin", "Bedenin muhteşem bir iş başarıyor"), ardından net medikal ve pratik tavsiyeler vermek.
3. Asla kişisel kesin tıbbi teşhis koymamak; acil kırmızı bayrak durumlarında (parlak kırmızı kanama, şiddetli baş ağrısı/görme bozukluğu, 28+ haftada 2 saatte 10 hareket olmaması, su gelmesi) derhal hekime başvurulmasını hatırlatmak.
4. Yanıtlarını Momora'nın JSON şemasına uygun olarak üretmek.
```

---

## 2. MAKALE ÜRETİMİ İÇİN JSON ÇIKTI ŞABLONU

Botuna makale yazdırırken çıktı formatı olarak bu JSON şemasını iste:

```json
{
  "id": "benzersiz-slug-ornegin-ilk-trimester-bulanti",
  "topic": "pregnancy | wellbeing | birth | baby | postpartum",
  "title": "Makalenin Çarpıcı ve Rahatlatıcı Başlığı",
  "subtitle": "Tek cümlelik sıcak alt başlık",
  "image": "blog_pregnant_morning | blog_prenatal_smoothie | blog_yoga_stretch | blog_hospital_bag_pack | blog_sleeping_crib | blog_newborn_hand | blog_skin_to_skin | blog_breastfeeding_cozy | blog_postpartum_selfcare",
  "minutes": 4,
  "weeks": [4, 16],
  "doctorVerified": true,
  "verifiedBy": "Kadın Hastalıkları ve Doğum Uzmanı Dr. Elif Kaya",
  "sections": [
    {
      "title": "1. Bölüm Başlığı",
      "text": "Bölümün detaylı, samimi ve bilimsel açıklaması."
    },
    {
      "title": "2. Bölüm Başlığı",
      "text": "Pratik öneriler ve rahatlatıcı adımlar."
    },
    {
      "title": "3. Ne Zaman Doktora Danışmalı?",
      "text": "Klinik kırmızı bayraklar ve hekim kontrolü gerektiren durumlar."
    }
  ],
  "quickTips": [
    "Pratik ipucu 1",
    "Pratik ipucu 2"
  ]
}
```

---

## 3. 150 MAKALE PROMPTU (KATEGORİLERE GÖRE SIRALI)

Botuna sırayla gönderebileceğin 150 konu başlığı ve prompt komutları:

### 🌸 Kategori 1: 1. Trimester (Hafta 1 - 13) — 30 Makale Promptu
1. **P001:** "Hamilelik testinde silik çizgi ne anlama gelir? Kimyasal gebelik nedir, ne zaman doktora gidilmeli?"
2. **P002:** "Yerleşme (İmplantasyon) kanaması ile adet kanaması ve düşük kanaması arasındaki 4 temel fark."
3. **P003:** "Sabah bulantıları (Morning Sickness) ile baş etmenin 7 doğal yolu: Zencefil, kraker ve akupresür noktaları."
4. **P004:** "Hyperemesis Gravidarum nedir? Ağır gebelik bulantısı ne zaman hastaneye yatış gerektirir?"
5. **P005:** "Folik asit kullanımı: Hangi form (Metilfolat mı, Folik asit mi?), ne kadar süre ve neden elzem?"
6. **P006:** "İlk trimesterda aşırı yorgunluk ve uyku hali: Progesteron fırtınasıyla nasıl barışılır?"
7. **P007:** "İlk ultrason muayenesi (6-8. Hafta): Kese, yolk sac ve kalp atışını ilk kez duymak."
8. **P008:** "Koku hassasiyeti ve tiksinmeler: Mutfaktan uzaklaşmadan nasıl beslenilir?"
9. **P009:** "İlk trimesterda kasık batması ve hafif kramplar normal mi? Rahmin genişleme sancıları."
10. **P010:** "Gebelikte göğüs hassasiyeti ve sutyen seçimi: Büyüyen göğüsleri rahatlatma tüyoları."
11. **P011:** "Gebelikte sık idrara çıkma: Hormonlar mı, enfeksiyon mu? İdrar yolu enfeksiyonu belirtileri."
12. **P012:** "İkili Tarama Testi ve Ense Kalınlığı (NT) ölçümü: 11-14. haftada neye bakılır?"
13. **P013:** "Fetal DNA (NIPT) testi nedir? Kimler yaptırmalı, güvenilirlik oranı nedir?"
14. **P014:** "İlk trimesterda cinsellik güvenli mi? Hangi durumlarda ara verilmeli?"
15. **P015:** "Gebelikte diş ve diş eti kanamaları (Hamilelik Gingivitisi) ve güvenli ağız bakımı."
16. **P016:** "İlk 12 haftada kilo alamamak hatta kilo vermek bebeğe zarar verir mi?"
17. **P017:** "Düşük korkusu ve anksiyetesi ile başa çıkmak: Zihni sakinleştiren farkındalık pratikleri."
18. **P018:** "İlk trimesterda güvenli ve tehlikeli bitki çayları tam listesi."
19. **P019:** "Gebelikte kafein tüketimi: Günde kaç fincan kahve içilebilir?"
20. **P020:** "Çiğ et, salamura ve toksoplazma riski: Mutfak hijyeninde altın kurallar."
21. **P021:** "Gebelikte saç boyatmak, oje sürmek ve cilt bakımı: İlk trimesterda neler güvenli?"
22. **P022:** "Hamile olduğunu aileye ve iş yerine duyurmak için en doğru zaman ne zaman?"
23. **P023:** "İlk trimesterda uçak yolculuğu ve uzun araba seyahatleri güvenli mi?"
24. **P024:** "Boş gebelik (Anembriyonik gebelik) nedir? Belirtileri ve teşhisi."
25. **P025:** "Dış gebelik belirtileri: Tek taraflı şiddetli omuz ve kasık ağrısı neden ciddiye alınmalı?"
26. **P026:** "Gebelikte baş ağrıları ve migren: Parasetamol kullanımı ve ilaçsız rahatlama."
27. **P027:** "İlk trimesterda spor: Yürüyüş, yüzme ve hafif pilatese nasıl başlanır?"
28. **P028:** "Gebelikte kabızlık ve şişkinlik: Lifli beslenme, su ve probiyotik tüyoları."
29. **P029:** "Hamilelikte vajinal akıntı değişiklikleri: Normal akıntı vs mantar enfeksiyonu."
30. **P030:** "İlk trimesterın sonu (13. Hafta): Plasentanın görevi devralışı ve enerjinin dönüşü."

---

### 🌿 Kategori 2: 2. Trimester (Hafta 14 - 27) — Altın Dönem — 30 Makale Promptu
31. **P031:** "2. Trimester balayı dönemi: Neden kendinizi aniden çok enerjik hissediyorsunuz?"
32. **P032:** "Bebeğin ilk tekmeleri ne zaman hissedilir? Kanat çırpışı, gaz hissi mi yoksa tekme mi?"
33. **P033:** "Round Ligament Ağrısı: Ani ayağa kalkınca giren kasık kramplarını dindirme yöntemleri."
34. **P034:** "Detaylı Anatomi Ultrasonu (18-22. Hafta - 2. Düzey USG): Organlar nasıl taranır?"
35. **P035:** "Gebelikte çatlak önleme rehberi: Badem yağı, hyaluronik asit, shea butter ve genetik faktör."
36. **P036:** "Gebelikte bacak krampları ve huzursuz bacak sendromu: Magnezyum eksikliği ve esneme hareketleri."
37. **P037:** "Gebelikte Şeker Yükleme Testi (OGTT) zararlı mı? Gestasyonel diyabet hakkında tüm gerçekler."
38. **P038:** "Gestasyonel diyabet teşhisi konduysa beslenme: Düşük glisemik indeksli tabak hazırlama."
39. **P039:** "Gebelikte uyku pozisyonları: Neden sol yan pozisyonu altın standarttır?"
40. **P040:** "Hamile yastığı çeşitleri: C tipi mi, U tipi mi, bel desteği mi?"
41. **P041:** "Linea Nigra (Göbek çizgisi) ve Chloasma (Hamilelik maskesi): Lekeler kalıcı mı?"
42. **P042:** "Gebelikte burun tıkanıklığı ve burun kanamaları (Hamilelik Riniti) neden olur?"
43. **P043:** "Gebelikte varis ve hemoroid: Ayakları kaldırma, soğuk uygulama ve lif desteği."
44. **P044:** "Gebelikte cinsel istek artışı veya azalması: 2. trimester hormonlarının etkisi."
45. **P045:** "Bebeğin cinsiyet tahmini ve ultrason yanılmaları: Kordon mu, genital organ mı?"
46. **P046:** "Gebelikte D vitamini, B12 ve Omega-3 (DHA) takviyesi bebeğin beyin gelişimini nasıl etkiler?"
47. **P047:** "Kansızlık (Anemi) ve Demir takviyesi: Kabızlık yapmadan demir ilacı nasıl içilir?"
48. **P048:** "Gebelikte diş hekimi tedavisi, dolgu ve lokal anestezi güvenli mi?"
49. **P049:** "Gebelikte araç kullanımı ve emniyet kemeri bağlamanın doğru şekli."
50. **P050:** "Bebeğinizin işitme duyusu gelişti (20+ Hafta): Anne karnında müzik ve sesleri tanıma."
51. **P051:** "Bebek hareket sayımı (Kick Counter): 24-28. haftalarda hareket ritmini takip etme."
52. **P052:** "Gebelikte aşırı terleme ve sıcak basması: Doğal lifli kıyafetler ve hidrasyon."
53. **P053:** "Hamilelikte göz kuruluğu ve kontakt lens kullanımı: Hormonların gözyaşına etkisi."
54. **P054:** "Baby Shower ve Cinsiyet Partisi planlaması: Anne yorulmadan nasıl organize edilir?"
55. **P055:** "Gebelikte güvenli egzersizler: Doğum yogası, kegel ve yürüyüş rehberi."
56. **P056:** "Bebek odası hazırlığı: Zehirsiz boyalar, ergonomik beşik ve organik tekstil seçimi."
57. **P057:** "Anne-bebek bağlanması (Prenatal Bonding): Karına dokunma, mektup yazma ve konuşma ritüelleri."
58. **P058:** "Gebelikte tansiyon takibi: Normal tansiyon aralıkları ve Preaklamsi erken sinyalleri."
59. **P059:** "Gebelikte ayakkabı seçimi ve taban çökmesi: Büyüyen ayak numarası kalıcı mı?"
60. **P060:** "2. Trimesterın sonu (27. Hafta): Bebek gözlerini açıp kırpmaya başlıyor!"

---

### ⏳ Kategori 3: 3. Trimester & Doğuma Hazırlık (Hafta 28 - 40) — 30 Makale Promptu
61. **P061:** "3. Trimester başladı (28. Hafta): Bebeğin kilo alma atağı ve annenin ağırlaşması."
62. **P062:** "Braxton Hicks (Yalancı Sancılar) ile Gerçek Doğum Sancıları arasındaki 5 kesin fark."
63. **P063:** "5-1-1 Kuralı nedir? Kasılmalar ne sıklıkta olduğunda hastaneye gidilmeli?"
64. **P064:** "Mide yanması ve reflü: Bebeğin saçları mı çıkarıyor? Mide asidini ilaçsız yatıştırma."
65. **P065:** "Gebelikte ödem ve şişen ayaklar: Ne zaman normal, ne zaman preeklampsi belirtisi?"
66. **P066:** "Bebeğin doğum pozisyonu: Baş gelişi (Sefalik) mi, makat gelişi (Breech) mi?"
67. **P067:** "Makat gelişi bebeği baş aşağı döndürme yolları: Kedi-deve pozu, yürüyüş ve Webster tekniği."
68. **P068:** "Hastane doğum çantası eksiksiz kontrol listesi: Anne, bebek ve refakatçi için."
69. **P069:** "Doğum Planı hazırlama rehberi: Doğum odasında neleri talep edebilirsiniz?"
70. **P070:** "Epidural anestezi hakkında tüm merak edilenler: Ne zaman takılır, riskleri var mı?"
71. **P072:** "Doğal doğumda ağrıyla başa çıkma: Nefes teknikleri, sıcak duş, masaj ve hareket özgürlüğü."
72. **P072:** "Doğum dalgalarında pilates topu kullanımı: Pelvisi açan 4 temel hareket."
73. **P073:** "Nişan gelmesi (Mukus tıkacı düşmesi) nedir? Doğuma kaç gün/saat kaldığını gösterir?"
74. **P074:** "Suyun gelmesi (Amniyotik kese açılması): Sızıntı mı, akıntı mı, idrar mı? Nasıl ayırt edilir?"
75. **P075:** "Perine masajı nasıl yapılır? Doğumda yırtık ve epizyotomi riskini azaltma teknikleri."
76. **P076:** "NST (Non-Stres Testi) nedir? Bebeğin kalp atışları ve rahim kasılmaları nasıl okunur?"
77. **P077:** "Sezaryen doğuma hazırlık: Planlı sezaryen günü sizi neler bekler?"
78. **P078:** "SSVD (Sezaryen Sonrası Vajinal Doğum) mümkün mü? Kimler aday olabilir?"
79. **P079:** "Doğum ebe veya doğum koçu (Doula) desteği: Doula ne yapar, ne yapmaz?"
80. **P080:** "36. Haftada GBS (Grup B Streptokok) tarama testi ve antibiyotik protokolü."
81. **P081:** "Doğum çantasına konulacak emzirme sutyeni ve lohusa geceliği rehberi."
82. **P082:** "Çatı muayenesi (Pelvik muayene) nedir? Acıtır mı, neden yapılır?"
83. **P083:** "Doğum korkusu (Tokofobi) ile başa çıkma: Korkuyu güvene dönüştürmek."
84. **P084:** "Eşler için doğuma hazırlık: Doğumhanede eşinize nasıl en büyük destek olabilirsiniz?"
85. **P085:** "Doğumun evreleri: Açılma, ıkınma ve plasentanın çıkışı (3. evre)."
86. **P086:** "Bebek doğar doğmaz Altın Saat (Golden Hour): Ten tene temasın mucizevi faydaları."
87. **P087:** "Geç kordon klempleme (Delayed Cord Clamping): Bebeğin kan hacmi için neden önemlidir?"
88. **P088:** "40. Haftayı geçmek (Post-term gebelik): Suni sancı (İndüksiyon) ne zaman gerekir?"
89. **P089:** "Eve dönüş hazırlıkları: Derin dondurucu yemekleri ve lohusalık destek ekibi."
90. **P090:** "Doğum anı geldi: Hastaneye giderken arabada ve giriş kapısında sakin kalma rehberi."

---

### 🤱 Kategori 4: Lohusalık & Anne Toparlanması (4. Trimester) — 30 Makale Promptu
91. **P091:** "4. Trimester nedir? Bebeğin dünyaya, annenin yeni bedenine alışma süreci."
92. **P092:** "Löşi (Lohusalık kanaması): Kaç gün sürer, rengi nasıl değişir, ne zaman doktora gidilmeli?"
93. **P093:** "Lohusa Hüznü (Baby Blues) ile Postpartum Depresyon (PPD) arasındaki kritik farklar."
94. **P094:** "Edinburgh Doğum Sonrası Depresyon Ölçeği (EPDS) nedir? Kendinizi nasıl test edersiniz?"
95. **P095:** "Normal doğum dikişleri (Epizyotomi) bakımı: Ilık oturma banyosu ve hijyen kuralları."
96. **P096:** "Sezaryen dikişi bakımı: Duş alma, pansuman ve karın korsesi kullanımı."
97. **P097:** "İlk günlerde emzirirken rahimde kramplar hissetmek: Oksitosin ve rahmin küçülmesi."
98. **P098:** "Sütün gelmesi (Engorgement / Dolgunluk): 3. günde taş gibi sertleşen memeleri rahatlatma."
99. **P099:** "Göğüs ucu yaraları ve çatlakları: Gümüş kapaklar, lanolin ve doğru kavrama tekniği."
100. **P100:** "Mastit (Meme iltihabı) belirtileri: Ateş, kızarıklık ve tıkalı süt kanalını açma."
101. **P101:** "Lohusalıkta gece terlemeleri: Hamilelik ödeminin atılma süreci."
102. **P102:** "Doğum sonrası ilk tuvalet korkusu: Kabızlığı önleme ve ıkınmadan rahatlama tüyoları."
103. **P103:** "Lohusalıkta saç dökülmesi (Telogen Effluvium): Dökülme ne zaman durur?"
104. **P104:** "Lohusalıkta beslenme ve süt artıran (Galaktogog) gıdalar: Yulaf, su, tahin ve rezene."
105. **P105:** "Lohusa korsesi ne zaman takılır? Normal doğum vs sezaryen korsesi."
106. **P106:** "Diastasis Recti (Karın kası ayrılması) testi: Evde nasıl kontrol edilir, hangi egzersizler yapılmaz?"
107. **P107:** "Lohusalıkta ziyaretçi yönetimi: Kırkı çıkmadan sınır çizme ve 'Hayır' diyebilme sanatı."
108. **P108:** "Doğum sonrası ilk 40 gün eş ilişkisi: İletişim, duygusal destek ve görev paylaşımı."
109. **P109:** "Lohusalıkta cinselliğe dönüş: 6 haftalık doktor kontrolü ve korunma yöntemleri."
110. **P110:** "Emzirirken kilo verme: Emzirme kaç kalori yaktırır, diyet yapılabilir mi?"
111. **P111:** "Lohusalıkta D vitamini, kalsiyum ve demir takviyelerine devam edilmeli mi?"
112. **P112:** "Emzirirken güvenli ilaç kullanımı: Ağrı kesiciler ve antibiyotikler süte geçer mi?"
113. **P113:** "Anne sütü sağma (Göğüs pompası) rehberi: Manuel mi elektrikli mi, ne sıklıkta sağılmalı?"
114. **P114:** "Anne sütü saklama kuralları (3-3-3 kuralı): Oda sıcaklığı, buzdolabı ve dondurucu."
115. **P115:** "Lohusa yogası ve pelvik taban toparlanması: Ne zaman hafif spora başlanabilir?"
116. **P116:** "Doğum sonrası hormon düşüşü: Aniden ağlama krizleri ve duygu dalgalanmaları."
117. **P117:** "Uykusuz gecelerle baş etme: 'Bebek uyurken uyu' kuralı pratikte nasıl uygulanır?"
118. **P118:** "Yetersiz süt hissi ve anne yetersizliği psikolojisi: Bebeğin doyduğu nasıl anlaşılır?"
119. **P119:** "Lohusa banyosu ve 40 uçurma ritüelleri: Gelenekler ve modern annelik."
120. **P120:** "Lohusalığın sonu (40. Gün): Bedeninizin ve ruhunuzun doğumdan sonraki yeni gücü."

---

### 👶 Kategori 5: Yenidoğan & Bebek Bakımı (0 - 6 Ay) — 30 Makale Promptu
121. **P121:** "Yenidoğanın ilk günleri: Mekonyum (ilk kaka), kilo kaybı ve sarılık takibi."
122. **P122:** "Yenidoğan Sarılığı (Fizyolojik sarılık): Hangi değerde fototerapi gerekir?"
123. **P123:** "Doğru emzirme pozisyonları: Beşik, futbol tutuşu ve biyolojik yatış (Laid-back)."
124. **P124:** "Bebeğin memeyi doğru kavraması (Deep Latch): Can acımadan emzirmenin püf noktaları."
125. **P125:** "Yenidoğan gaz sancısı ve Kolik (İnfantil Kolik): 5S kuralı (Kundak, Sallama, Ses vb.)."
126. **P126:** "Bebek gazı çıkarma teknikleri: Omuzda, dizde ve kucakta gaz çıkarma pozisyonları."
127. **P127:** "Bebek masajı rehberi: Kolik ve kabızlığı rahatlatan 'I Love You' karın masajı."
128. **P128:** "Yenidoğan uyku düzeni: Uyanıklık pencereleri (Wake Windows) nedir, bebek ne kadar uyanık kalabilir?"
129. **P129:** "Güvenli Uyku kuralları (SIDS riskini sıfırlama): Sırtüstü yatış, sert yatak, yastıksız beşik."
130. **P130:** "Kundak kullanımı: Yarım kundak mı, tam kundak mı? Moro refleksi ne zaman biter?"
131. **P131:** "Beyaz gürültü (White noise) kullanımı: Kaç desibel olmalı, bağımlılık yapar mı?"
132. **P132:** "Göbek bağı bakımı: Nasıl temiz tutulur, ne zaman düşer, iltihap belirtileri nelerdir?"
133. **P133:** "Yenidoğan ilk banyosu: Göbek bağı düşmeden yıkanır mı? Sünger banyosu tekniği."
134. **P134:** "Bez bölgesi bakımı ve pişik önleme: Çinko oksit krem, havalandırma ve ıslak mendil seçimi."
135. **P135:** "Bebek kakası rehberi: Sarı hardal, yeşil, siyah, mukuslu kaka ne anlama gelir?"
136. **P136:** "Bebek bezi sızdırması neden olur? Doğru bez numarası seçimi ve lastik tüyoları."
137. **P137:** "Tummy Time (Karın üstü aktivite): Neden ilk haftadan başlanmalı, nasıl sevdirilir?"
138. **P138:** "Düz kafa sendromu (Plagiosefali) önleme: Yatış yönünü değiştirme ve kucak pozisyonları."
139. **P139:** "Biberonla besleme rehberi: Paced Bottle Feeding (Bebek tempolu besleme) tekniği."
140. **P140:** "Meme reddi (Nursing Strike) neden olur? Biberon karmaşası ve memeye geri döndürme."
141. **P141:** "Yalancı emzik kullanımı: Ne zaman verilmeli, emzirmeyi bozar mı, ortodontik emzikler."
142. **P142:** "Bebek giydirme kuralı: 'Senden 1 kat fazla' kuralı ve oda sıcaklığı (20-22°C)."
143. **P143:** "Bebek tırnak kesimi: Bebek uyurken elektrikli tırnak törpüsü kullanımı."
144. **P144:** "Göz çapaklanması ve gözyaşı kanalı tıkanıklığı: Anne sütü damlatılır mı, masaj nasıl yapılır?"
145. **P145:** "Bebeklerde konak (Seboreik dermatit): Badem yağı ve yumuşak fırça ile temizleme."
146. **P146:** "Bebek taşıma (Babywearing): Ergonomik kanguru ve sling seçimi, M pozisyonu."
147. **P147:** "Büyüme atakları (Wonder Weeks) ve Küme emzirme (Cluster feeding) dönemleri."
148. **P148:** "4. Ay uyku gerilemesi (Sleep Regression): Neden olur, uyku düzeni nasıl toparlanır?"
149. **P149:** "Bebek aşı takvimi: İlk 6 ayda hangi aşılar yapılır, aşı sonrası ateş yönetimi."
150. **P150:** "Ek gıdaya geçiş sinyalleri (6. Ay): BLW (Bebek liderliğinde beslenme) mi, püre mi?"

---

## 4. EN ÇOK SORULAN 20 SORU & UZMAN CEVAP ŞABLONU (FAQ VERİTABANI)

Bu soruları doğrudan botuna FAQ olarak öğretebilirsin:

1. **S: "Gebelikte hafif pembe veya kahverengi lekelenme oldu, düşük mü yapıyorum?"**  
   *C:* "İlk trimesterda rahim ağzı damarlanması arttığı için ilişkiden, muayeneden sonra veya yerleşme sürecinde pembe/kahverengi lekelenmeler sık görülür. Ağrısız ve leke tarzındaysa genellikle tehlikeli değildir. Ancak parlak kırmızı, adet kanaması gibi artan veya şiddetli krampların eşlik ettiği kanamalarda beklemeden doktorunuza başvurmalısınız."

2. **S: "Gebelikte suşi, çiğ köfte veya pastırma yersem ne olur?"**  
   *C:* "Çiğ et ve balıklar 'Toksoplazma' ve 'Listeria' enfeksiyonu riski taşır. Bu bakteriler plasentayı geçerek bebeğe zarar verebilir. Etsiz çiğ köfte güvenlidir. Pastırma ve sucuk ise tavada iyice pişirilerek tüketilebilir. Balık mutlaka buharda veya ızgarada tam pişmiş olmalıdır."

3. **S: "Bebeğim bugün daha az hareket ediyor, ne yapmalıyım?"**  
   *C:* "28. haftadan sonra: Bir bardak taze portakal suyu için veya tatlı bir atıştırmalık yiyin, sol yanınıza uzanıp sessiz bir odada karnınıza odaklanın. Bebekler günün belirli saatlerinde 20-40 dakikalık derin uyku evresine girer. Eğer 2 saatlik odaklanmada 10 belirgin hareket sayamazsanız derhal hekiminizi veya doğum servisini arayın."

4. **S: "Kasılmalarım başladı, hastaneye ne zaman gitmeliyim?"**  
   *C:* "5-1-1 kuralını uygulayın: Kasılmalarınız her 5 dakikada bir geliyorsa, her biri en az 1 dakika (60 saniye) sürüyorsa ve bu düzen 1 saat boyunca aralıksız devam ediyorsa hastaneye gitme zamanınız gelmiştir. Suyunuz geldiyse veya parlak kanama varsa kasılma sıklığını beklemeden derhal gidin."

5. **S: "Epidural doğum anestezi omurilikte felç yapar mı?"**  
   *C:* "Uzman anestezi hekimleri tarafından yapılan epidural son derece güvenlidir. İğne omuriliğe değil, omuriliği çevreleyen 'epidural boşluğa' uygulanır. Ağrıyı %90+ oranında keserek annenin doğumda dinlenmesini ve enerjisini ıkınmaya saklamasını sağlar."

6. **S: "Günde kaç bardak su içmeliyim?"**  
   *C:* "Gebelikte kan hacmi %40-50 artar ve amniyon sıvısı sürekli yenilenir. Günlük hedef en az 8-10 bardak (yaklaşık 2 - 2.5 litre) temiz sudur. İdrar renginizin açık saman sarısı olması yeterli sıvı aldığınızın en net göstergesidir."

7. **S: "Göğüs ucum hiç yok / içe dönük, emzirebilir miyim?"**  
   *C:* "Kesinlikle evet! Bebek göğüs ucunu değil, göğsün kahverengi halkasını (areola) kavrayarak emer. Göğüs ucu sadece bir yol göstericidir. Doğumdan sonra doğru kavrama tekniği ile içe dönük göğüslerle de harika şekilde emzirebilirsiniz."

8. **S: "Bebek kakası ne sıklıkta olmalı?"**  
   *C:* "Sadece anne sütü alan bebekler günde 5-6 kez hardal sarısı pütürlü kaka yapabileceği gibi, 3-5 günde bir kaka yapması da normaldir (anne sütü neredeyse tamamen emilir). Bebek huzurluysa ve karnı yumuşaksa endişelenmeyin."

9. **S: "Bebek kundaklanmalı mı?"**  
   *C:* "İlk 2-3 ayda bebeklerin 'Moro' (irkilme) refleksi uykularını böler. Kolların içeride, kalça ve bacakların ise kurbağa gibi serbest hareket edebildiği yarım kundak bebeğe anne karnı güveni verir. Dönmeye başladığı anda kundak bırakılmalıdır."

10. **S: "Lohusalıkta dikişler ne zaman iyileşir?"**  
    *C:* "Normal doğum (epizyotomi) dikişleri genellikle kendiliğinden eriyen ipliklerle dikilir ve 10-14 günde büyük oranda toparlanır. Sezaryen kesisi ise 7-10 günde kaynar, tam doku iyileşmesi 6 haftayı bulur."
