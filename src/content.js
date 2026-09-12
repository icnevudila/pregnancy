// Editorial guides: no fabricated authors or medical review claims.
export const topics = [
  {id:'pregnancy',title:'Hamilelik',image:'blog_couple_bump',subtitle:'Hafta hafta, birlikte'},
  {id:'wellbeing',title:'İyi hisset',image:'blog_herbal_tea_relax',subtitle:'Kendine de yer aç'},
  {id:'birth',title:'Doğuma hazırlık',image:'blog_hospital_bag_pack',subtitle:'Küçük adımlarla hazırlan'},
  {id:'baby',title:'Bebek bakımı',image:'blog_newborn_hand',subtitle:'Yeni ritminizi keşfedin'},
  {id:'postpartum',title:'Lohusalık',image:'blog_postpartum_selfcare',subtitle:'Senin iyileşme yolculuğun'},
];
export const articles = [
  {id:'appointment',topic:'pregnancy',title:'Randevuna hazırlan: aklındaki sorular yanında olsun',subtitle:'Görüşmeden önce, görüşmede ve sonrasında küçük bir plan.',image:'blog_ultrasound_memory',minutes:3,weeks:[4,40],action:{label:'Sorularımı hazırla',route:'checklist',data:{list:'questions'}},sections:[
    {title:'Gitmeden önce',text:'Aklına gelen soruları hatırlamaya çalışmak yerine tek bir yerde biriktir. Her soruya kısa bir başlık ver. Görüşmede önce konuşmak istediğin konuyu listenin başına al.'},
    {title:'Görüşme sırasında',text:'Anlamadığın bir kelime veya öneri olduğunda açıklamasını iste. Sana verilen planı kendi cümlelerinle tekrar etmek, doğru anladığından emin olmana yardımcı olabilir.'},
    {title:'Eve döndüğünde',text:'Bir sonraki randevuyu, beraberinde götürmen gerekenleri ve görüşmeden kalan notları kaydet. Randevu ile kişisel notlarını ayrı tutarak daha kolay bulabilirsin.'},
  ]},
  {id:'movement',topic:'wellbeing',title:'Hareketi kendi ritmine uydur',subtitle:'Kendini zorlamadan, bedenini dinleyerek.',image:'blog_yoga_stretch',minutes:2,weeks:[4,40],source:{title:'NHS · Exercise in pregnancy',url:'https://www.nhs.uk/pregnancy/keeping-well/exercise/'},sections:[
    {title:'Rahat hissettiğin tempoyu bul',text:'Gebelikte hareketini rahatlığına göre uyarlayabilirsin. Egzersiz sırasında konuşmakta zorlanıyorsan tempo fazla olabilir. Daha önce aktif değilsen aniden yoğun bir programa başlama.'},
    {title:'Sana uygun olanı konuş',text:'Sağlık ekibinin kişisel önerileri önceliklidir. Yeni bir etkinliğe başlamadan önce gebeliğine uygunluğunu konuş; eğitmene hamile olduğunu söyle. Sıcak havada yoğun efordan kaçın ve dinlenmeye yer ayır.'},
  ]},
  {id:'baby-movements',topic:'pregnancy',title:'Bebeğinin hareketlerini tanımak',subtitle:'Sayıdan önce, bebeğinin alışılmış düzeni.',image:'blog_couple_bump',minutes:2,weeks:[16,40],source:{title:'NHS · Your baby’s movements',url:'https://www.nhs.uk/pregnancy/keeping-well/your-babys-movements/'},action:{label:'Hareket günlüğünü aç',route:'counter',data:{type:'kick'}},sections:[
    {title:'Her bebeğin düzeni farklı',text:'Hareketler genellikle 16–24. haftalar arasında hissedilmeye başlar. Her gün ulaşılması gereken tek bir hareket sayısı yoktur. Bebeğinin kendine özgü düzenini tanımak önemlidir.'},
    {title:'Değişiklik fark ettiğinde',text:'Hareketlerde azalma, durma veya alışılmış düzende değişiklik varsa hemen ebenle veya doğum birimiyle iletişime geç. Ertesi günü ya da sayaç sonucunu bekleme. 24. haftaya kadar hiç hareket hissetmediysen sağlık ekibine bildir.'},
    {title:'Bu kayıt ne işe yarar?',text:'Momora, gözlemini tarih ve saatle saklamana yardımcı olur. Sayaç bir sağlık değerlendirmesi yapmaz; iyi veya kötü sonuç üretmez.'},
  ]},
  {id:'hospital-bag',topic:'birth',title:'Hastane çantası: sana ve bebeğine ait küçük bir liste',subtitle:'Hazırladıklarını işaretle, eksiklerini kolayca gör.',image:'blog_hospital_bag_pack',minutes:3,weeks:[24,40],source:{title:'NHS · Hospital bag checklist',url:'https://www.nhs.uk/best-start-in-life/pregnancy/preparing-for-labour-and-birth/hospital-bag-checklist/'},action:{label:'Çantamı hazırlamaya başla',route:'checklist',data:{list:'bag'}},sections:[
    {title:'Senin için',text:'Rahat kıyafetler, terlik, kişisel bakım ürünleri, telefon şarjı ve hastane belgelerini düşün. Hastanenin sağladığı malzemeleri önceden öğrenerek listeyi kendi ihtiyaçlarına göre düzenle.'},
    {title:'Bebeğin için',text:'Mevsime uygun kıyafet, bebek bezi ve battaniye gibi ihtiyaçları ayrı bir bölüme koy. Eve dönüşte kullanacağınız uygun bebek oto koltuğunu da hazırlık planına ekle.'},
    {title:'Son kontrol',text:'Listeyi bir oturuşta bitirmek zorunda değilsin. Hazır olanları işaretle; yanındaki kişiyle çantanın nerede olduğunu paylaş. Kullanacağın ilaçlarla ilgili sağlık ekibinin talimatını izle.'},
  ]},
  {id:'journal',topic:'pregnancy',title:'Birkaç cümleyle kendi hamilelik günlüğün',subtitle:'Her gün yazmak zorunda değilsin; hatırlamak istediğin anlar yeter.',image:'blog_postpartum_selfcare',minutes:3,weeks:[4,40],action:{label:'Bir anı kaydet',route:'journal'},sections:[
    {title:'Başlamak için tek bir soru',text:'Bugünden neyi hatırlamak isterdin? Bir his, yapılan bir konuşma veya küçük bir hazırlık olabilir. Metnin uzunluğu ya da düzgünlüğü önemli değil; sana ait olması yeterli.'},
    {title:'İstediğin kadar ayrıntı',text:'Notuna bir başlık ver, istersen ruh halini ekle. Bazı günler tek kelime, bazı günler birkaç paragraf yazabilirsin. Sonradan düzenlemek de mümkün.'},
    {title:'Biriktirdiklerine dön',text:'Geçmiş notları tarihleriyle incele. Doktoruna sormak istediğin konuları ise sorular listene ekleyerek görüşmede kolayca bulabilirsin.'},
  ]},
  {id:'support',topic:'postpartum',title:'Lohusalık için küçük bir destek planı',subtitle:'Kim, hangi konuda yanında olabilir?',image:'blog_postpartum_selfcare',minutes:3,weeks:[4,40],action:{label:'Planıma bir görev ekle',route:'checklist',data:{list:'todos'}},sections:[
    {title:'İhtiyaçlarını somutlaştır',text:'“Biraz desteğe ihtiyacım var” yerine yemek hazırlığı, alışveriş veya ev işi gibi tek bir ihtiyacı seç. Yardım etmek isteyen birine neyin işini kolaylaştıracağını anlat.'},
    {title:'Ziyaretleri kendi ritmine göre düzenle',text:'Dinlenmek veya yalnız kalmak istediğin saatleri paylaşabilirsin. Yakınlarının bebeği görme isteği kadar senin rahatlığın ve tercihlerin de önemlidir.'},
    {title:'Planın değişmesine izin ver',text:'İlk günler düşündüğünden farklı geçebilir. Görevleri azaltmak, ertelemek ve yeniden paylaşmak mümkün. Nasıl hissettiğini günlüğüne yazabilir, ihtiyaçlarını zamanla güncelleyebilirsin.'},
  ]},
  {id:'baby-records',topic:'baby',title:'Bebeğinin gününü birlikte takip etmek',subtitle:'Uyku, beslenme ve bez kayıtlarına kolay bir başlangıç.',image:'blog_newborn_hand',minutes:3,weeks:[4,40],action:{label:'Bebek kayıtlarını aç',route:'babyRecords'},sections:[
    {title:'Küçük kayıtlarla başla',text:'Beslenme saatini, uyku süresini veya bez değişimini kaydedebilirsin. Her ayrıntıyı tutmak zorunda değilsin. İşine yarayan birkaç kayıt türüyle başlamak daha kolay olabilir.'},
    {title:'Geçmişi okuyabilmek',text:'Kaydın zamanı ve türü aynı yerde görünsün. Yanlış bir miktar yazdığında düzenle. Günlük özet, tuttuğun kayıtlardan oluşur; kaydetmediğin bir etkinliği uygulama kendiliğinden bilemez.'},
    {title:'Kayıtlara anlam yüklerken',text:'Bu günlük, kendi gözlemlerini hatırlaman içindir. Sağlık sorularını kayıtlarınla birlikte sağlık ekibine ilet; uygulamadaki toplamları tanı veya kişisel beslenme hedefi olarak kullanma.'},
  ]},
  {id:'birth-plan',topic:'birth',title:'Doğum tercihlerini konuşmaya hazırlan',subtitle:'Senin için önemli olanları bir araya getir.',image:'blog_hospital_bag_pack',minutes:3,weeks:[20,40],action:{label:'Tercihlerimi yaz',route:'birthPlan'},sections:[
    {title:'Kimin yanında olmasını istersin?',text:'Doğum sırasında sana eşlik etmesini istediğin kişiyi ve iletişim tercihlerini not al. Hastanenin uygulamalarını önceden sormak, beklentilerini netleştirmene yardımcı olur.'},
    {title:'Aklındaki konuları yaz',text:'Ortam, bilgilendirilme şekli ve doğum sonrası ilk anlarla ilgili sorularını bir araya getir. Ağrı yönetimi seçeneklerini sağlık ekibinle konuşmak üzere ayrıca not edebilirsin.'},
    {title:'Esnek bir konuşma notu',text:'Doğum planın, tercihlerini paylaşmak için bir başlangıçtır. Koşullar değişebilir. Hangi durumda neden farklı bir karar gerektiğini sağlık ekibinden açıklamasını isteyebilirsin.'},
  ]},
];
export const articleById = id => articles.find(a=>a.id===id);
export const weeklyArticles = week => articles.filter(a=>a.topic!=='baby' && a.topic!=='postpartum' && week>=a.weeks[0] && week<=a.weeks[1]);
