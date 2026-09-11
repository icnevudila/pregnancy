# MOMORA — mobil tasarım hedefi

Tek görsel kaynak: kullanıcının sağladığı `9ecb89ab-204a-429d-9c90-d826a5c37190.png`.
Kullanıcı tek kaynağın birebir uyarlanmasını istediği için farklı referanslar birleştirilmez.

| Karar | Görseldeki kaynak ve görev |
| --- | --- |
| Sıcak kırık beyaz #FAF7F3 | Tüm ekranların ana zemini |
| Koyu lacivert-mor #252044 | Başlıklar, ana metin ve gezinme |
| Mauve #9D7D9D | Seçili hap düğmeler, marka ve ana eylemler |
| Pastel pembe, lavanta, mavi, adaçayı | Sırasıyla emzirme, biberon, uyku ve bez |
| Lato regular/bold | Referanstaki dar, yumuşak sans-serif yazı karakterine eşleme |
| Caveat | Yalnızca başlangıç altındaki el yazısı slogan |
| 18–24 px köşe, çok hafif gölge | Kartlar ve yumuşak yüzey ayrımı |
| Anne, anne-bebek, bebek ve fetüs | Referans pozlarına göre ayrı üretilmiş yerel görseller |

Altı ekran: başlangıç; hamilelik; lohusalık; bebek; keşfet; asistan/topluluk.
Uygulama JavaScript React Native bileşenlerinden oluşur. HTML, WebView veya TypeScript kaynak kodu içermez.
Expo web yalnızca aynı bileşenlerin bilgisayarda yerel görsel kontrolü içindir; telefon çalıştırma hedefi Expo Go'dur.

Referans bir raster konsepttir; fotoğraflar yeniden üretildiği ve yazı tipi dosyası sağlanmadığı için piksel düzeyinde aynılık iddia edilmez. Kompozisyon, içerik sırası, renk görevleri, kart oranları ve ekranlar referansa göre eşlenir.
