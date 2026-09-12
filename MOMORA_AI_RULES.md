# Momora AI Rules — ekran, içerik ve backend çalışma standardı

Bu dosya Momora üzerinde çalışan tüm yapay zeka ajanları içindir. Amaç, uygulamanın her ekranını aynı profesyonel çizgide tutmak ve yeni eklenen parçaların hazır şablon gibi görünmesini engellemektir.

## Ürün hedefi

Momora sıcak, premium ve sakin bir anne-bebek uygulamasıdır. Hedef, Pregnancy+, BabyCenter, Flo gibi en çok satan hamilelik uygulamalarının kalite hissine yaklaşmak; fakat Momora'nın mevcut yumuşak, kırık beyaz, lavanta, pembe ve aile odaklı dilini korumaktır.

Uygulama basit demo gibi görünmemelidir. Her ekran kullanıcının bugün ne yapacağını, hangi kaydı tutacağını, hangi içeriği okuyacağını ve sonraki adımı nasıl anlayacağını net göstermelidir.

## Değişmeyen tasarım dili

- Ana zemin sıcak kırık beyaz / krem kalır.
- Ana metin koyu mor-lacivert çizgide kalır.
- Birincil marka tonu mauve / lavanta morudur.
- Pembe, lavanta, mavi, adaçayı ve sıcak şeftali tonları kategori ayrımı için kullanılır.
- Köşeler yumuşak, kartlar ferah, gölgeler hafif olmalıdır.
- Ekranlar yoğun olabilir ama karışık olmamalıdır; her bölümün amacı ilk bakışta anlaşılmalıdır.
- Görseller anne, bebek, fetüs, günlük bakım ve aile hissini desteklemelidir. Rastgele ikon dizmek yeterli değildir.

## Ortak ekran kalıbı

Yeni veya düzenlenen ana ekranlarda mümkünse `ScreenHero` kullanılmalıdır. Bu bileşen ekranların aynı çizgide görünmesi için ana giriş kalıbıdır.

Beklenen sıra:

1. `ScreenHero`: ekranın amacı, kısa açıklaması, küçük stat veya durum çipi.
2. Ana eylem veya bugün kartı.
3. İçerik / araç / kayıt bölümleri.
4. İkincil notlar, geçmiş kayıtlar veya önerilen sonraki adımlar.

Ekran başında üç farklı başlık, rastgele büyük kartlar ve tekrar eden açıklamalar bırakılmamalıdır. Bir ekranın giriş hissi tek bir güçlü hero ile başlamalıdır.

## Araç ekranları

Araçlar küçük demo modülü gibi durmamalıdır. Her araç şu hissi vermelidir:

- Neden kullanıldığı belli.
- Bugünkü durum veya kayıt özeti var.
- Ana aksiyon büyük, anlaşılır ve dokunulabilir.
- Geçmiş kayıtlar veya hazırlık listeleri düzenli.
- Boş durum varsa profesyonel açıklama ve bir sonraki adım var.

Tekme sayacı, kasılma sayacı, kilo takibi, doğum çantası, doğum planı, randevu soruları, bebek isimleri, su/vitamin, emzirme, uyku sesi, bez takibi ve lohusa bakım ekranları aynı kart, ritim, başlık ve not dilini izlemelidir.

## İçerik dili

Momora tıbbi karar veren bir ürün gibi konuşmamalıdır. Uygulama destekleyici, düzenleyici ve kayıt tutmayı kolaylaştırıcı bir anne asistanı gibi konuşur.

Kullanılacak dil:

- “notunu randevuda paylaş”
- “takibini kolaylaştırır”
- “kişisel ritmini görmene yardım eder”
- “kendi hekiminin yönlendirmesini merkeze al”
- “bugünkü küçük adım”
- “hazırlık listesi”
- “kaynak notu”
- “moderasyon notu”

Kaçınılacak dil:

- “klinik olarak kanıtlı”
- “uzman kesin öneriyor”
- “%80 azaltır”
- “ideal / kesin / garanti”
- “bu normaldir, endişelenme” gibi tanılayıcı cümleler
- “demo”, “örnek uygulama”, “placeholder” gibi satış hissini bozan ifadeler

Toplulukta “uzman cevabı” yerine “moderasyon notu”, “destek notu” veya “kaynak notu” tercih edilir.

## Kütüphane ve rehberler

Makale ekranları blog şablonu gibi görünmemelidir. Kapak görseli, kaynak notu, öne çıkan noktalar, okunabilir bölüm kartları ve ilgili içerikler birlikte düzenli olmalıdır.

Kategori adlarında soğuk veya hastane sistemi hissi veren ifadeler yerine kullanıcı dostu ifadeler tercih edilir:

- “Gelişim & Kontrol”
- “Doğuma Hazırlık”
- “Bebek & Yenidoğan”
- “Lohusalık & İyileşme”
- “İyi Hisset & Ruh”

## Backend standardı

Backend eklenirken uygulama önce yerel çalışmaya devam etmelidir. Supabase veya başka servis yoksa ekranlar kırılmamalıdır.

Beklenen yaklaşım:

- Yerel state / AsyncStorage davranışı korunur.
- Backend bağlıysa kayıtlar kullanıcı hesabıyla eşitlenir.
- Gizli anahtarlar repoya yazılmaz.
- `.env.example` sadece gerekli değişken isimlerini gösterir.
- Supabase tablolarında RLS açık olmalıdır.
- Kullanıcı verileri `user_id` ile ayrılmalıdır.
- Kayıt tipleri açık tutulmalıdır: profil, randevu, not, günlük kayıt, araç kayıtları, favoriler, topluluk taslakları.

Backend çalışması yaparken önce veri modeli ve güvenli eşitleme tamamlanmalı, sonra ekranlara bağlanmalıdır.

## Kod düzeni

- Ortak görsel parçalar `src/ui.js` içinde tutulmalıdır.
- Aynı işi yapan yerel `Hero`, `Note`, `Card` varyasyonları çoğaltılmamalıdır.
- Yeni ekran eklenirse önce mevcut tema, `Card`, `Section`, `ScreenHero`, `InfoNote`, `Progress`, `Tap`, `T` bileşenleri kullanılmalıdır.
- Rastgele inline stiller yalnızca küçük yerel düzen farkları için kullanılmalıdır.
- Büyük görsel davranış değişikliklerinde aynı çizgide kalmak için önce mevcut ekranlardan örnek alınmalıdır.

## Kalite çıtası

Bir ekran tamamlandı sayılmadan önce şu sorulara cevap evet olmalıdır:

- İlk bakışta bu ekranın amacı anlaşılıyor mu?
- Ana aksiyon açık mı?
- Kartlar aynı tasarım ailesinden mi?
- Metinler anneye yardımcı ama tıbbi iddia taşımayan bir dilde mi?
- Boş durumlar veya kayıt geçmişi profesyonel görünüyor mu?
- Ekran “AI template” gibi değil, gerçek ürün parçası gibi mi duruyor?

## Push ve test notu

Kullanıcı hızlı iterasyon istediğinde önce küçük, güvenli ve okunabilir değişiklikler yapılabilir. Büyük görsel QA, cihaz testi veya build testi ayrıca istenmedikçe zorunlu değildir; fakat sözdizimi kırılmaması için düşük maliyetli statik kontrol yapılması önerilir.
