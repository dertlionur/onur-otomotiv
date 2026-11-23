# Onur Otomotiv — V5 (Onur Otomotiv Asistanı + favicon)

Kadirli/Osmaniye için hazırlanmış, gerçek bir işletmeye ait olmayan **demo/portföy amaçlı** ikinci el otomobil galerisi web sitesidir. HTML, CSS ve JavaScript ile geliştirilmiştir. **10 farklı araç**, her biri için **6 fotoğraflı** ilan galerisi ve ayrı HTML detay sayfaları vardır.

## Başlatma
1. ZIP dosyasını bir klasöre çıkartın.
2. `onur-otomotiv` klasörünü VS Code ile açın.
3. `index.html` dosyasını Live Server ile başlatın (veya doğrudan tarayıcıda açın).
4. `araclar.html` sayfasında filtreleri, ilan kartlarını ve araç detaylarını inceleyin.

## Dosyalar
- `index.html`: ana sayfa, üç görselli otomatik geçişli showroom arka planı, arama ve vitrin ilanları.
- `araclar.html`: araç listeleme ve filtreleme.
- `arac-*.html`: 10 adet tekil araç detay sayfası.
- `iletisim.html`: iletişim formu (demo; gerçek mesaj göndermez).
- `data.js`: araç verileri, fiyatlar, fotoğraf galerileri.
- `app.js`: arama, favoriler, galeri değişimi, mobil menü, iletişim etkileşimi.
- `style.css`: responsive sayfa düzenleri, geçişler ve hover efektleri.
- `chatbot.js`: API gerektirmeyen, yazılı soruları belirlenen kurallara göre yanıtlayan Onur Otomotiv Asistanı.
- `chatbot.css`: mobil uyumlu sohbet penceresi ve açılır düğme stili.
- `assets/favicon.png` ve `assets/apple-touch-icon.png`: Onur Otomotiv logosundan oluşturulmuş tarayıcı/telefon simgeleri.
- `assets/showroom.webp` ve `assets/showroom-mobile.webp`: Galerinin arka duvarında ışıklı Onur Otomotiv yazısı olan sabit görseller.
- `assets/cars/`: 10 farklı aracın ön, yan, arka, ön konsol, arka koltuk ve bagaj görselleri, WebP formatında.
- `build_static_pages.py`: içerik verisinden HTML ilan sayfalarını üretmek için yardımcı betik.

## Önemli notlar
- Bu web sitesi ticari kullanım için gerçek stok ve doğrulanmış araç fotoğrafları içermez. Fiyatlar, araç özellikleri ve görseller demo amaçlıdır.
- WhatsApp/telefon/e-posta bağlantıları için `app.js` içindeki `SETTINGS` bilgilerini güncelleyin.
- SEO için statik araç detayları, açıklama ve alternatif görsel metinleri vardır. Gerçek Vercel alan adı belli olunca canonical URL ve sitemap güncellemesi yapılmalıdır.
- `index.html` birincil sayfadır; ücretsiz Vercel'de statik site olarak yayınlanabilir.

## Onur Otomotiv Asistanı nasıl çalışır?
Sağ alttaki lacivert robot simgesine basın. Hazır sorulardan birini seçebilir veya serbest metin yazabilirsiniz: “900 bin TL altındaki otomatik araçlar”, “Dizel SUV var mı?”, “Ekspertiz hakkında bilgi”, “Adres nerede?”, “Takas olur mu?” gibi. Bot `data.js` içindeki demo araçları sorgular; API anahtarı, sunucu veya ücretli yapay zekâ gerektirmez. Girilen mesajlar bu sürümde yalnızca ziyaretçinin tarayıcısında işlenir ve herhangi bir sunucuya kaydedilmez. Canlı stok, ödeme, randevu, kredi ya da gerçek satış onayı vermez.

## Vercel üzerinde mevcut siteyi güncelleme
Dosyaların hepsini mevcut GitHub repository klasörüne kopyalayın; ardından terminalde `git add .`, `git commit -m "Add Onur Otomotiv Asistanı chatbot and branded favicon"`, `git push` komutlarını çalıştırın. GitHub ile bağlı Vercel güncellemeyi yayınlar. Projeyi silmek gerekmez. Vercel'de Root Directory olarak `index.html` dosyasının bulunduğu klasörü seçin.

## V7: Chatbot adlandırması
Sohbet penceresinin adı ve karşılama metinleri **Onur Otomotiv Asistanı** olarak güncellendi. Diğer site sayfalarının içeriği ve çalışma biçimi korunmuştur.
