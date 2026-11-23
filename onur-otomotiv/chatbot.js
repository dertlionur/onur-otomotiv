/* Onur Asistan: local, rule-based, no external API and no personal data transmission. */
(() => {
  'use strict';
  const root = document.querySelector('#onur-chatbot');
  if (!root || !Array.isArray(window.CARS)) return;

  const launch = root.querySelector('.chat-launch');
  const panel = root.querySelector('.chat-panel');
  const close = root.querySelector('.chat-close');
  const form = root.querySelector('.chat-compose');
  const input = root.querySelector('.chat-input');
  const messages = root.querySelector('.chat-messages');
  const suggestions = root.querySelector('.chat-suggestions');
  const status = root.querySelector('.chat-live');
  const currency = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
  const kmFormat = new Intl.NumberFormat('tr-TR');
  const prompts = [
    '900.000 TL altı araçlar',
    'Otomatik vites araçlar',
    'Dizel araçları göster',
    'SUV araçlarınız var mı?',
    'Ekspertiz ve hasar bilgisi',
    'Araç takası yapıyor musunuz?',
    'Randevu nasıl alabilirim?',
    'Adres ve çalışma saatleri'
  ];
  const norm = s => String(s || '').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').replace(/[^a-z0-9.,₺ ]/g, ' ').replace(/\s+/g, ' ').trim();
  const has = (s, words) => words.some(x => s.includes(x));
  const esc = v => String(v).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const money = n => currency.format(n);
  const name = c => `${c.brand} ${c.model} ${c.trim}`;
  const link = c => `arac-${encodeURIComponent(c.id)}.html`;
  const salesNote = 'Not: Buradaki araçlar, fiyatlar ve görseller tanıtım amaçlıdır; gerçek stok ve satış koşullarını temsil etmez.';
  let count = 0;

  function add(role, html, textOnly = false) {
    const div = document.createElement('div');
    div.className = `chat-message chat-${role}`;
    if (textOnly) div.textContent = html;
    else div.innerHTML = html;
    messages.append(div);
    messages.scrollTop = messages.scrollHeight;
    status.textContent = role === 'bot' ? 'Onur Asistan yanıt verdi.' : 'Mesaj gönderildi.';
    return div;
  }
  function text(html) { add('bot', `<p>${html}</p>`); }
  function showCards(cars, intro) {
    const limited = cars.slice(0,4);
    const cards = limited.map(c => `<a class="chat-car" href="${link(c)}"><span class="chat-car-title">${esc(c.year)} ${esc(c.brand)} ${esc(c.model)}</span><span class="chat-car-sub">${esc(c.gear)} · ${esc(c.fuel)} · ${kmFormat.format(c.km)} km</span><strong>${money(c.price)}</strong><span class="chat-arrow" aria-hidden="true">↗</span></a>`).join('');
    add('bot', `<p>${esc(intro)}</p>${cards}<a class="chat-all" href="araclar.html">Tüm örnek ilanları incele →</a><small class="chat-disclaimer">${esc(salesNote)}</small>`);
  }
  function parseBudget(s) {
    let m = s.match(/(?:₺\s*)?(\d[\d.,\s]*?)\s*(milyon|milyar|bin|k|tl|₺|lira)(?![a-z])/);
    if (!m) {
      m = s.match(/(?:alt[iy]|alti|ust[uü]|kadar|butce|fiyat|azami|maksimum|en fazla|en cok|gecmesin)\s*(\d[\d.,]*)/);
      if (!m) return null;
    }
    const token=m[1].replace(/\s/g,'');
    const unit=m[2] || '';
    let value;
    if (unit === 'milyon') value = Number(token.replace(',','.')) * 1e6;
    else if (unit === 'milyar') value = Number(token.replace(',','.')) * 1e9;
    else if (unit === 'bin' || unit === 'k') value = Number(token.replace(',','.')) * 1000;
    else value = Number(token.replace(/[.,]/g,''));
    if (!Number.isFinite(value) || value < 10000 || value > 100000000) return null;
    return value;
  }
  function displayReplies() {
    suggestions.innerHTML = '';
    prompts.slice(0, count ? 5 : 8).forEach(q => {
      const button = document.createElement('button');
      button.type='button'; button.textContent=q; button.className='chat-prompt';
      button.addEventListener('click', () => respond(q));
      suggestions.append(button);
    });
  }
  function respond(question) {
    const q = String(question || '').trim().slice(0,500);
    if (!q) return;
    count++;
    add('user', q, true);
    input.value = '';
    const s = norm(q);
    const brands = [...new Set(CARS.map(c=>c.brand))];
    const models = [...new Set(CARS.map(c=>c.model))];
    const selectedBrand = brands.find(b => s.includes(norm(b)));
    const selectedModel = models.find(m => s.includes(norm(m)));
    const wantsAutomatic = has(s, ['otomatik','automatic','auto vites']);
    const wantsManual = has(s, ['manuel','duz vites']);
    const wantsDiesel = has(s, ['dizel','diesel','motorin']);
    const wantsGasoline = has(s, ['benzin','petrol','lpg']);
    const wantsSUV = has(s, ['suv','jeep','cip','arazi','yuksek arac']);
    const wantsHatch = has(s, ['hatchback','hatch','kucuk araba','sehir ici']);
    const wantsSedan = has(s, ['sedan','aile araci','genis bagaj']);
    const wantsLowKm = has(s, ['dusuk km','az km','kilometresi az','az kilometre']);
    const yearMatch = s.match(/\b(20\d\d)\b/);
    const budget = parseBudget(s);
    const budgetQuery = budget !== null && (has(s,['fiyat','butce','tl','lira','₺','bin','milyon','kadar','alt','azami','maksimum','ucuz','arac','otomatik','manuel']) || /\d/.test(s));
    const minBudget = has(s,['ustu','uzeri','fazla','en az']) && !has(s,['alti','altinda','gecmesin','kadar','en fazla']);

    // Listings and combined filters are prioritized over generic FAQs.
    if (selectedBrand || selectedModel || wantsAutomatic || wantsManual || wantsDiesel || wantsGasoline || wantsSUV || wantsHatch || wantsSedan || wantsLowKm || budgetQuery || (yearMatch && has(s,['arac','model','yil']))) {
      let cars = CARS.filter(c =>
        (!selectedBrand || c.brand === selectedBrand) && (!selectedModel || c.model === selectedModel) &&
        (!wantsAutomatic || c.gear === 'Otomatik') && (!wantsManual || c.gear === 'Manuel') &&
        (!wantsDiesel || c.fuel === 'Dizel') && (!wantsGasoline || c.fuel.includes('Benzin')) &&
        (!wantsSUV || c.body === 'SUV') && (!wantsHatch || c.body === 'Hatchback') && (!wantsSedan || c.body === 'Sedan') &&
        (!yearMatch || c.year === Number(yearMatch[1])) &&
        (budget === null || (minBudget ? c.price >= budget : c.price <= budget))
      );
      if (wantsLowKm || has(s,['en ucuz','uygun fiyat','ucuz','en ekonomik'])) cars.sort((a,b)=> wantsLowKm ? a.km-b.km : a.price-b.price);
      if (cars.length) {
        const filterLabel = [selectedBrand, selectedModel, wantsAutomatic?'otomatik':wantsManual?'manuel':null, wantsDiesel?'dizel':wantsGasoline?'benzinli':null, wantsSUV?'SUV':wantsHatch?'hatchback':wantsSedan?'sedan':null, yearMatch?yearMatch[1]:null, budget!==null?`${money(budget)} ${minBudget?'üzeri':'altı'}`:null].filter(Boolean).join(' · ');
        showCards(cars, `${filterLabel ? `${filterLabel} kriterlerine göre` : 'Sorduğunuz kritere göre'} ${cars.length} örnek araç bulundu. İlk seçenekler:`);
      } else text(`Bu koşullara uyan örnek ilan bulunamadı. Marka, bütçe veya vites tercihini genişletebilirsiniz. <a href="araclar.html">Araç listesine göz atın →</a>`);
      return;
    }
    if (has(s,['merhaba','selam','hey','iyi gunler','iyi aksamlar','gunaydin','naber'])) {
      text('Merhaba! 👋 Onur Otomotiv sanal danışmanıyım. Bana bütçenizi, tercih ettiğiniz markayı, vites veya yakıt türünü yazabilirsiniz. Örnek: <strong>“1 milyon TL altında otomatik araç göster”</strong>.');
    } else if (has(s,['kimsin','yapay zeka','chatbot','bot musun','nasil calisiyorsun'])) {
      text('Ben Onur Asistan. Bu sitedeki örnek ilanları ve tanımlı sık sorulan soruları inceleyen, <strong>internete veya bir yapay zekâ API’sine bağlanmadan</strong> çalışan kural tabanlı bir yardımcıyım. Cevaplayamadığım sorularda iletişim sayfasına yönlendiririm.');
    } else if (has(s,['takas','aracimi sat','arac satmak','araba satmak','ikinci el aracimi'])) {
      text('Araç takası veya aracınızı satma talebinizi değerlendirecek bir işletme yetkilisi henüz bu demo sitede tanımlanmadı. Gerçek kullanımda marka, model, yıl, kilometre, hasar durumu ve araç fotoğrafları alınarak ön değerlendirme yapılabilir. <a href="iletisim.html">İletişim formuna geçin →</a>');
    } else if (has(s,['ekspertiz','hasar','boya','degisen','tramer','kaza','sasi','airbag','kontrol'])) {
      text('İkinci el araçta <strong>ekspertiz raporu</strong>, TRAMER/hasar kaydı, değişen-boyalı parçalar, kilometre geçmişi ve bakım kayıtları kontrol edilmelidir. Sitemizdeki araçlar demo olduğu için gerçek ekspertiz veya hasar raporu bulunmuyor; hiçbir aracı “hatasız” olarak garanti etmiyoruz. Gerçek ilanlarda bu belgeler araç bazında paylaşılabilir.');
    } else if (has(s,['kredi','taksit','finansman','pesinat','kredi kart','odeme','iban','kapora','faiz'])) {
      text('Kredi, taksit, finansman, kapora ve ödeme koşulları bu demo için belirlenmedi. Gerçek bir satışta banka kredisi uygunluğu, taksit imkânları, toplam maliyet ve sözleşme ayrıntıları yetkili satıcıdan teyit edilmelidir. Bu sohbet üzerinden ödeme veya kapora alınmaz.');
    } else if (has(s,['garanti','iade','cayma','satis sonrasi','sikayet','memnuniyet'])) {
      text('Garanti, iade ve satış sonrası destek koşulları araç ve satış türüne göre değişebilir. Onur Otomotiv demosu için geçerli bir garanti/iade politikası tanımlanmadı. Gerçek işlem öncesinde yazılı satış koşullarını, yasal haklarınızı ve varsa garantiyi satıcıdan öğrenin.');
    } else if (has(s,['randevu','test surusu','test surus','araci gorebilir','yerinde incele','ziyaret'])) {
      text('Araç görme veya test sürüşü için randevu talebi oluşturabilirsiniz; ancak <strong>bu demo otomatik randevu kaydetmiyor</strong>. İletişim sayfasından talebinizi iletmeniz için bir alan bulunuyor; gerçek gönderim için işletme iletişim bilgileri tanımlanmalı. <a href="iletisim.html">İletişim sayfası →</a>');
    } else if (has(s,['adres','nerede','konum','harita','kadirli','osmaniye','yol tarifi'])) {
      text('Proje <strong>Kadirli / Osmaniye</strong> için hazırlanmış bir galeri demosudur. Gerçek açık adres ve harita konumu henüz tanımlanmadı. Ziyaret etmeden önce işletmenin doğrulanmış adresini öğrenmek gerekir. <a href="iletisim.html">İletişim bilgileri →</a>');
    } else if (has(s,['saat','kacta','acik mi','hafta sonu','pazar','cumartesi','calisma gun','mesai'])) {
      text('Çalışma saatleri henüz gerçek işletme verisi olarak doğrulanmadı. Site 7/24 incelenebilir fakat fiziksel galeri çalışma saatleri için bu demoda kesin bilgi veremiyorum.');
    } else if (has(s,['telefon','ara','whatsapp','iletisim','mail','e posta','mesaj','numara'])) {
      text('İletişime geçmek için <a href="iletisim.html">iletişim sayfasını</a> açabilirsiniz. Telefon, WhatsApp ve e-posta adresleri henüz gerçek bir işletme hesabına bağlanmadığı için bu sohbet üzerinden doğrudan mesaj gönderimi yapmıyorum.');
    } else if (has(s,['noter','ruhsat','devir','satis islemi','evrak','belge','plaka','sigorta','kasko','muayene','vergi'])) {
      text('İkinci el alım-satımda kimlik/temsil yetkisi, ruhsat ve araç üzerindeki hukuki kayıtlar kontrol edilir; devir işlemleri ilgili resmi prosedürlere göre yapılır. Zorunlu trafik sigortası, muayene ve vergi durumları da incelenmelidir. Güncel mevzuatı ve masrafları resmi kaynaklardan veya işlem yapan yetkililerden doğrulayın.');
    } else if (has(s,['indirim','pazarlik','son fiyat','fiyat dusur','kampanya','firsat'])) {
      text('Sitedeki fiyatlar <strong>yalnızca örnek/demo fiyatlarıdır</strong>; gerçek pazarlık, kampanya veya indirim sözü veremem. Belirli bir bütçeniz varsa örneğin <strong>“850 bin TL altındaki araçlar”</strong> yazıp uygun örnek ilanlara bakabilirsiniz.');
    } else if (has(s,['fotograf','resim','gorsel','galeri','icerisi','ic mekan','bagaj','arka','on gorunum','donanim'])) {
      text('Her örnek aracın detay sayfasında <strong>6 görsel</strong> bulunur: ön, yan, arka, ön konsol, arka koltuk ve bagaj. Bunlar yapay zekâ ile hazırlanmış temsili görsellerdir, gerçek bir satış aracının fotoğrafı değildir. <a href="araclar.html">Araçları incele →</a>');
    } else if (has(s,['hangi araclar','markalar','modeller','arac listesi','stok','kac arac','tum arac','arac var','araba var'])) {
      const brandNames = [...new Set(CARS.map(c=>c.brand))].join(', ');
      text(`Şu anda <strong>${CARS.length} örnek araç</strong> listeleniyor. Markalar: ${esc(brandNames)}. Araçları marka, model, yıl, yakıt, vites ve fiyat aralığına göre filtreleyebilirsiniz. <a href="araclar.html">Araçlarımız →</a><small class="chat-disclaimer">${esc(salesNote)}</small>`);
    } else if (has(s,['tesekkur','sag ol','eyvallah','gorusuruz','bye'])) {
      text('Rica ederim! 😊 Başka bir sorunuz olursa buradayım. Keyifli araç incelemeleri dilerim.');
    } else {
      text('Sorunuzu tam anlayamadım. Bütçe, marka, model, otomatik/manuel vites, dizel/benzin, ekspertiz, takas, kredi, randevu, fotoğraflar ve iletişim hakkında yardımcı olabilirim. Örnek: <strong>“900 bin TL altında otomatik araç var mı?”</strong> Daha özel konular için <a href="iletisim.html">iletişim sayfasına</a> bakabilirsiniz.');
    }
    displayReplies();
  }

  function toggle(force) {
    const open = typeof force === 'boolean' ? force : panel.hidden;
    panel.hidden = !open;
    launch.setAttribute('aria-expanded', String(open));
    if (open) {
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    } else launch.focus();
  }
  launch.addEventListener('click', () => toggle());
  close.addEventListener('click', () => toggle(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) toggle(false); });
  form.addEventListener('submit', e => { e.preventDefault(); respond(input.value); });
  add('bot', '<p>Merhaba! 👋 Ben <strong>Onur Asistan</strong>. Bütçenize göre araç arayabilir, vites/yakıt tercihinizi sorabilir veya satış süreciyle ilgili sık sorulan sorulara yanıt alabilirsiniz.</p><small class="chat-disclaimer">Kural tabanlı demo asistanıyım; gerçek stok, randevu veya ödeme onayı veremem.</small>');
  displayReplies();
})();
