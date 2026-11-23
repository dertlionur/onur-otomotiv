'use strict';
const SETTINGS = { phone:'', whatsapp:'', email:'', address:'Kadirli / Osmaniye' };
const qs=(selector,root=document)=>root.querySelector(selector);
const qsa=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
const safe=(value)=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const carName=(car)=>`${car.brand} ${car.model}`;
const defaultGallery=car=>[
  {view:'front',label:'Ön Görünüm',large:`assets/cars/${car.photo}-1536.webp`,small:`assets/cars/${car.photo}-640.webp`}
];
const getGallery=car=>Array.isArray(car.gallery)&&car.gallery.length?car.gallery:defaultGallery(car);
const carPhoto=(car,size=640,view='front')=>{
  const gallery=getGallery(car);
  const item=gallery.find(x=>x.view===view)||gallery[0];
  return size>=1000?item.large:item.small;
};
const carAlt=(car,view='front')=>{
  const labels={front:'ön görünüm',side:'yan görünüm',rear:'arka görünüm',cockpit:'ön konsol', 'rear-seat':'arka koltuk', trunk:'bagaj'};
  return `${car.year} ${car.brand} ${car.model} ${car.trim} ${labels[view]||'araç fotoğrafı'}`;
};

function carCard(c){
  const url=`arac-${encodeURIComponent(c.id)}.html`;
  return `<article class="car-card reveal">
    <div class="car-image">
      <a class="car-image-link" href="${url}" aria-label="${safe(carName(c))} ilanının detaylarını görüntüle">
        <img src="${carPhoto(c,640,'front')}" srcset="${carPhoto(c,640,'front')} 640w, ${carPhoto(c,1536,'front')} 1536w"
          sizes="(max-width: 520px) calc(100vw - 36px), (max-width: 780px) 48vw, (max-width: 1140px) 33vw, 285px"
          alt="${safe(carAlt(c,'front'))}" loading="lazy" decoding="async" width="640" height="427">
      </a>
      <span class="pill">${safe(c.tag)}</span>
      <button class="fav" type="button" data-fav="${safe(c.id)}" aria-label="${safe(carName(c))} favorilere ekle" aria-pressed="false">♡</button>
    </div>
    <div class="car-info">
      <h3><a href="${url}">${safe(carName(c))}</a></h3>
      <p class="trim">${safe(c.trim)}</p>
      <div class="specs"><span>▦ ${c.year}</span><span>◷ ${formatKm(c.km)}</span><span>◉ ${safe(c.fuel)}</span><span>⚙ ${safe(c.gear)}</span></div>
      <div class="car-bottom"><strong class="price">${formatPrice(c.price)}</strong><a class="round-link" href="${url}" aria-label="${safe(carName(c))} detaylarını aç">→</a></div>
    </div>
  </article>`;
}
function renderCards(container,cars){
  if(!container)return;
  container.innerHTML=cars.length?cars.map(carCard).join(''):'<div class="empty">Bu filtrelere uygun araç bulunamadı. Başka seçenekler deneyin.</div>';
  syncFavorites();
  animateVisible();
}
function getFavs(){try{return JSON.parse(localStorage.getItem('onur-favs')||'[]');}catch{return [];}}
function syncFavorites(){
  const selected=new Set(getFavs());
  qsa('[data-fav]').forEach(button=>{
    const isFav=selected.has(button.dataset.fav);
    button.classList.toggle('is-fav',isFav);
    button.setAttribute('aria-pressed',String(isFav));
    button.textContent=isFav?'♥':'♡';
    button.title=isFav?'Favorilerden çıkar':'Favorilere ekle';
  });
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-fav]');
  if(!b)return;
  try{
    const fav=new Set(getFavs());
    fav.has(b.dataset.fav)?fav.delete(b.dataset.fav):fav.add(b.dataset.fav);
    localStorage.setItem('onur-favs',JSON.stringify([...fav]));
    syncFavorites();
  }catch{}
});
let observer;
function animateVisible(){
  const elements=qsa('.reveal:not(.visible)');
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window)){
    elements.forEach(x=>x.classList.add('visible'));return;
  }
  observer??=new IntersectionObserver(entries=>{
    for(const e of entries)if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}
  },{threshold:.04,rootMargin:'0px 0px 60px 0px'});
  elements.forEach(el=>observer.observe(el));
}
function setOptions(select,values,label){
  if(!select)return;
  select.innerHTML=`<option value="">${safe(label)}</option>`+values.map(v=>`<option value="${safe(v)}">${safe(v)}</option>`).join('');
}
function fillFilters(form){
  setOptions(qs('[name=brand]',form),[...new Set(CARS.map(c=>c.brand))].sort(),'Tüm Markalar');
  setOptions(qs('[name=model]',form),[...new Set(CARS.map(c=>c.model))].sort(),'Tüm Modeller');
  setOptions(qs('[name=fuel]',form),[...new Set(CARS.map(c=>c.fuel))].sort(),'Tüm Yakıt Türleri');
  setOptions(qs('[name=gear]',form),[...new Set(CARS.map(c=>c.gear))].sort(),'Tüm Vites Türleri');
  setOptions(qs('[name=year]',form),[...new Set(CARS.map(c=>c.year))].sort((a,b)=>b-a),'Tüm Yıllar');
  const brand=qs('[name=brand]',form),model=qs('[name=model]',form);
  const resetModel=()=>{
    if(!brand||!model)return;
    const old=model.value;
    const models=[...new Set(CARS.filter(c=>!brand.value||c.brand===brand.value).map(c=>c.model))].sort();
    setOptions(model,models,'Tüm Modeller');
    if(models.includes(old))model.value=old;
  };
  brand?.addEventListener('change',resetModel);
  return resetModel;
}
function filterCars(form){
  const params=new FormData(form);
  const get=k=>String(params.get(k)||'');
  return CARS.filter(c=>(!get('brand')||c.brand===get('brand'))&&(!get('model')||c.model===get('model'))&&
    (!get('fuel')||c.fuel===get('fuel'))&&(!get('gear')||c.gear===get('gear'))&&
    (!get('year')||String(c.year)===get('year'))&&(!get('maxPrice')||c.price<=Number(get('maxPrice'))));
}
function initListing(){
  const box=qs('#listing-cards'),form=qs('#listing-filter');
  if(!box||!form)return;
  const resetModel=fillFilters(form);
  const params=new URLSearchParams(location.search);
  ['brand','fuel','gear','year','maxPrice'].forEach(k=>{
    const input=qs(`[name="${k}"]`,form);
    if(input&&params.has(k))input.value=params.get(k);
  });
  resetModel?.();
  if(params.has('model')){const input=qs('[name=model]',form);if(input)input.value=params.get('model');}
  const update=()=>{
    const cars=filterCars(form);
    const sort=qs('#sort-cars')?.value;
    if(sort==='cheap')cars.sort((a,b)=>a.price-b.price);
    if(sort==='expensive')cars.sort((a,b)=>b.price-a.price);
    if(sort==='km')cars.sort((a,b)=>a.km-b.km);
    if(sort==='newest')cars.sort((a,b)=>b.year-a.year);
    renderCards(box,cars);
    const count=qs('#results-count');
    if(count)count.textContent=`${cars.length} örnek araç listeleniyor`;
  };
  form.addEventListener('submit',event=>{event.preventDefault();update();});
  form.addEventListener('change',update);
  qs('#sort-cars')?.addEventListener('change',update);
  update();
}
function galleryButtons(car){
  return getGallery(car).map((item,index)=>`<button ${index===0?'class="current"':''} type="button" data-photo="${item.large}" data-alt="${safe(carAlt(car,item.view))}" aria-label="${safe(item.label)} fotoğrafını görüntüle" aria-pressed="${index===0?'true':'false'}"><img src="${item.small}" alt="" width="120" height="80" loading="lazy"></button>`).join('');
}
function initDetail(){
  const container=qs('#detail-root');
  if(!container)return;
  const id=new URLSearchParams(location.search).get('id')||container.dataset.carId;
  const c=CARS.find(car=>car.id===id);
  if(!c){container.innerHTML='<div class="empty">Araç bulunamadı. <a href="araclar.html">Tüm araçları görüntüleyin.</a></div>';return;}
  document.title=`${c.year} ${carName(c)} ${c.trim} | Onur Otomotiv`;
  qs('meta[name="description"]')?.setAttribute('content',`${c.year} ${carName(c)} ${c.trim} – ${formatKm(c.km)}, ${c.fuel}, ${c.gear}. Onur Otomotiv demo araç ilanı.`);
  const main=carPhoto(c,1536,'front');
  container.innerHTML=`<nav class="breadcrumbs" aria-label="Sayfa yolu"><a href="index.html">Ana Sayfa</a><span>›</span><a href="araclar.html">Araçlarımız</a><span>›</span><span aria-current="page">${safe(carName(c))}</span></nav>
    <div class="demo-notice">Bu ilan ve görseller tanıtım amaçlıdır; araç özellikleri, fiyatlar ve stok bilgileri gerçek satış teklifi değildir.</div>
    <div class="detail-grid">
      <section class="detail-gallery" aria-label="${safe(carName(c))} araç fotoğrafları">
        <div class="main-photo-wrap"><img class="main-photo" id="big-car-photo" src="${main}" width="1536" height="1024" alt="${safe(carAlt(c,'front'))}" fetchpriority="high" decoding="async"></div>
        <div class="thumbs" aria-label="Fotoğraf seçimi">${galleryButtons(c)}</div>
        <a id="full-photo-link" class="photo-open" href="${main}" target="_blank" rel="noopener noreferrer">Fotoğrafı orijinal çözünürlükte aç ↗</a>
        <div class="detail-description"><h2>İlan Açıklaması</h2><p>${safe(c.description)}</p><p>Bu örnek ilanda ön, yan, arka, iç mekân ve bagaj görselleri birlikte sunulmuştur. Gerçek ilanlarda ekspertiz, hasar, boya ve bakım bilgileri ayrıca doğrulanmalıdır.</p></div>
      </section>
      <aside class="detail-box"><span class="eyebrow">Örnek Araç İlanı</span><h1>${safe(carName(c))}</h1><p class="trim">${safe(c.trim)}</p><strong class="price">${formatPrice(c.price)}</strong>
        <dl class="detail-specs">${[['Model Yılı',c.year],['Kilometre',formatKm(c.km)],['Yakıt',c.fuel],['Vites',c.gear],['Kasa',c.body],['Renk',c.color],['Motor',c.engine],['Konum','Kadirli / Osmaniye']].map(([k,v])=>`<div><dt>${safe(k)}</dt><dd>${safe(v)}</dd></div>`).join('')}</dl>
        <a class="btn btn-primary" href="iletisim.html">İletişime Geç →</a><a class="btn btn-outline" href="araclar.html">← Diğer Araçları Gör</a>
      </aside>
    </div>`;
  qsa('[data-photo]',container).forEach(button=>button.addEventListener('click',()=>{
    const img=qs('#big-car-photo'),link=qs('#full-photo-link');
    img.src=button.dataset.photo;img.alt=button.dataset.alt;link.href=button.dataset.photo;
    qsa('[data-photo]',container).forEach(el=>{el.classList.toggle('current',el===button);el.setAttribute('aria-pressed',String(el===button));});
  }));
}
function initContact(){
  const form=qs('#contact-form');if(!form)return;
  form.addEventListener('submit',e=>{
    e.preventDefault();if(!form.reportValidity())return;
    const data=new FormData(form);
    const msg=`Onur Otomotiv iletişim talebi\n\nAd Soyad: ${data.get('name')}\nTelefon: ${data.get('phone')}\nMesaj: ${data.get('message')}`;
    const note=qs('#form-message');
    if(SETTINGS.email){note.textContent='E-posta uygulamanız açılıyor; mesaj henüz gönderilmedi.';location.href=`mailto:${SETTINGS.email}?subject=${encodeURIComponent('Web Sitesi İletişim Talebi')}&body=${encodeURIComponent(msg)}`;}
    else note.textContent='Bu form demo amaçlıdır. Gerçek e-posta adresi veya form servisi eklenince gönderim aktif olacaktır.';
  });
}
function initLinks(){
  qsa('[data-phone]').forEach(a=>{
    if(SETTINGS.phone){a.href=`tel:${SETTINGS.phone.replace(/[^+\d]/g,'')}`;a.textContent=`☎ ${SETTINGS.phone}`;}
    else{a.href='iletisim.html';a.textContent='☎ İletişim';}
  });
  qsa('[data-whatsapp]').forEach(a=>{
    if(SETTINGS.whatsapp){a.href=`https://wa.me/${SETTINGS.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent('Merhaba, araçlarınız hakkında bilgi almak istiyorum.')}`;a.target='_blank';a.rel='noopener noreferrer';}
    else{a.href='iletisim.html';a.title='Demo: WhatsApp iletişim numarası henüz eklenmedi';}
  });
  qsa('[data-email]').forEach(a=>{
    a.textContent=SETTINGS.email||'E-posta bilgisi eklenecek';
    if(SETTINGS.email)a.href=`mailto:${SETTINGS.email}`;else a.removeAttribute('href');
  });
}
function initMenu(){
  const button=qs('#menu-toggle'),menu=qs('#main-links');if(!button||!menu)return;
  const close=()=>{menu.classList.remove('open');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Menüyü aç');};
  button.addEventListener('click',()=>{
    const open=menu.classList.toggle('open');button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Menüyü kapat':'Menüyü aç');
  });
  qsa('a',menu).forEach(a=>a.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  document.addEventListener('click',e=>{if(!menu.contains(e.target)&&!button.contains(e.target))close();});
}
document.addEventListener('DOMContentLoaded',()=>{
  document.documentElement.classList.add('js-motion');
  initMenu();
  const featured=qs('#featured-cars');
  if(featured)renderCards(featured,CARS);
  const count=qs('#sample-count');if(count)count.textContent=CARS.length;
  const search=qs('#hero-search');
  if(search){fillFilters(search);search.addEventListener('submit',e=>{
    e.preventDefault();const p=new URLSearchParams(new FormData(search));
    location.href=`araclar.html?${p.toString()}`;
  });}
  initListing();initDetail();initContact();initLinks();animateVisible();
});
