# Onur Otomotiv — V3

Kadirli/Osmaniye için hazırlanmış, gerçek bir işletmeye ait olmayan **demo/portföy amaçlı** ikinci el otomobil galerisi web sitesidir. HTML, CSS ve JavaScript ile geliştirilmiştir. **10 farklı araç**, her biri için **6 fotoğraflı** ilan galerisi ve ayrı HTML detay sayfaları vardır.

## Başlatma
1. ZIP dosyasını bir klasöre çıkartın.
2. `onur-otomotiv` klasörünü VS Code ile açın.
3. `index.html` dosyasını Live Server ile başlatın (veya doğrudan tarayıcıda açın).
4. `araclar.html` sayfasında filtreleri, ilan kartlarını ve araç detaylarını inceleyin.

## Dosyalar
- `index.html`: ana sayfa, sabit logolu showroom görseli, arama ve vitrin ilanları.
- `araclar.html`: araç listeleme ve filtreleme.
- `arac-*.html`: 10 adet tekil araç detay sayfası.
- `iletisim.html`: iletişim formu (demo; gerçek mesaj göndermez).
- `data.js`: araç verileri, fiyatlar, fotoğraf galerileri.
- `app.js`: arama, favoriler, galeri değişimi, mobil menü, iletişim etkileşimi.
- `style.css`: responsive sayfa düzenleri, geçişler ve hover efektleri.
- `assets/showroom.webp` ve `assets/showroom-mobile.webp`: Onur Otomotiv logo panosu olan sabit galeri fotoğrafları.
- `assets/cars/`: 10 farklı aracın ön, yan, arka, ön konsol, arka koltuk ve bagaj görselleri, WebP formatında.
- `build_static_pages.py`: içerik verisinden HTML ilan sayfalarını üretmek için yardımcı betik.

## Önemli notlar
- Bu web sitesi ticari kullanım için gerçek stok ve doğrulanmış araç fotoğrafları içermez. Fiyatlar, araç özellikleri ve görseller demo amaçlıdır.
- WhatsApp/telefon/e-posta bağlantıları için `app.js` içindeki `SETTINGS` bilgilerini güncelleyin.
- SEO için statik araç detayları, açıklama ve alternatif görsel metinleri vardır. Gerçek Vercel alan adı belli olunca canonical URL ve sitemap güncellemesi yapılmalıdır.
- `index.html` birincil sayfadır; ücretsiz Vercel'de statik site olarak yayınlanabilir.
