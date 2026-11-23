"""Rebuild SEO-friendly static cards and vehicle detail pages from data.js."""
from pathlib import Path
from html import escape
import json, subprocess
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent
code = "global.window={}; require('./data.js'); console.log(JSON.stringify(window.CARS));"
CARS = json.loads(subprocess.check_output(['node', '-e', code], cwd=ROOT, text=True))

def esc(v):
    return escape(str(v), quote=True)

def fmt(n):
    return f'{n:,}'.replace(',', '.')

def gallery(c):
    return c.get('gallery') or [{'view':'front','large':f'assets/cars/{c["photo"]}-1536.webp','small':f'assets/cars/{c["photo"]}-640.webp','label':'Ön Görünüm'}]

def full(c):
    return gallery(c)[0]['large']

def small(c):
    return gallery(c)[0]['small']

def vehicle_name(c):
    return c['brand']+' '+c['model']

def price(c):
    return f'₺{fmt(c["price"])}'

def alt(c, view='front'):
    labels={'front':'ön görünüm','side':'yan görünüm','rear':'arka görünüm','cockpit':'ön konsol','rear-seat':'arka koltuk','trunk':'bagaj'}
    return f'{c["year"]} {vehicle_name(c)} {c["trim"]} {labels.get(view,"araç fotoğrafı")}'

def card(c):
    url=f'arac-{c["id"]}.html'
    specs=f'<span>▦ {c["year"]}</span><span>◷ {fmt(c["km"])} km</span><span>◉ {esc(c["fuel"])}</span><span>⚙ {esc(c["gear"])}</span>'
    return (f'<article class="car-card reveal"><div class="car-image">'
            f'<a class="car-image-link" href="{url}" aria-label="{esc(vehicle_name(c))} detayları">'
            f'<img src="{small(c)}" srcset="{small(c)} 640w, {full(c)} 1536w" sizes="(max-width:520px) calc(100vw - 36px), (max-width:780px) 48vw, (max-width:1140px) 33vw, 285px"'
            f' alt="{esc(alt(c))}" width="640" height="427" decoding="async" loading="lazy"></a>'
            f'<span class="pill">{esc(c["tag"])}</span><button class="fav" type="button" data-fav="{esc(c["id"])}" aria-label="Favorilere ekle" aria-pressed="false">♡</button></div>'
            f'<div class="car-info"><h3><a href="{url}">{esc(vehicle_name(c))}</a></h3>'
            f'<p class="trim">{esc(c["trim"])}</p><div class="specs">{specs}</div>'
            f'<div class="car-bottom"><strong class="price">{price(c)}</strong><a class="round-link" href="{url}" aria-label="Araç detayını aç">→</a></div></div></article>')

def thumbs(c):
    html=[]
    for i,item in enumerate(gallery(c)):
        cls=' class="current"' if i==0 else ''
        html.append(f'<button{cls} type="button" data-photo="{item["large"]}" data-alt="{esc(alt(c,item.get("view","front")))}" aria-label="{esc(item.get("label","Fotoğraf"))}" aria-pressed="{"true" if i==0 else "false"}"><img src="{item["small"]}" alt="" width="120" height="80" loading="lazy"></button>')
    return ''.join(html)

def detail(c):
    info=[('Model Yılı',c['year']),('Kilometre',fmt(c['km'])+' km'),('Yakıt',c['fuel']),('Vites',c['gear']),('Kasa',c['body']),('Renk',c['color']),('Motor',c['engine']),('Konum','Kadirli / Osmaniye')]
    specs=''.join(f'<div><dt>{esc(k)}</dt><dd>{esc(v)}</dd></div>' for k,v in info)
    return f'''<nav class="breadcrumbs" aria-label="Sayfa yolu"><a href="index.html">Ana Sayfa</a><span>›</span><a href="araclar.html">Araçlarımız</a><span>›</span><span aria-current="page">{esc(vehicle_name(c))}</span></nav>
<div class="demo-notice">Bu ilan ve görseller tanıtım amaçlıdır; araç özellikleri, fiyatlar ve stok bilgileri gerçek satış teklifi değildir.</div>
<div class="detail-grid">
<section class="detail-gallery" aria-label="{esc(vehicle_name(c))} araç fotoğrafları">
 <div class="main-photo-wrap"><img class="main-photo" id="big-car-photo" src="{full(c)}" alt="{esc(alt(c))}" fetchpriority="high" decoding="async" width="1536" height="1024"></div>
 <div class="thumbs" aria-label="Fotoğraf seçimi">{thumbs(c)}</div>
 <a id="full-photo-link" class="photo-open" href="{full(c)}" target="_blank" rel="noopener noreferrer">Fotoğrafı orijinal çözünürlükte aç ↗</a>
 <div class="detail-description"><h2>İlan Açıklaması</h2><p>{esc(c['description'])}</p><p>Bu örnek ilanda ön, yan, arka, iç mekân ve bagaj görselleri birlikte sunulmuştur. Gerçek ilanlarda ekspertiz, hasar, boya ve bakım bilgileri doğrulanmalıdır.</p></div>
</section>
<aside class="detail-box"><span class="eyebrow">Örnek Araç İlanı</span><h1>{esc(vehicle_name(c))}</h1><p class="trim">{esc(c['trim'])}</p><strong class="price">{price(c)}</strong>
 <dl class="detail-specs">{specs}</dl><a class="btn btn-primary" href="iletisim.html">İletişime Geç →</a><a class="btn btn-outline" href="araclar.html">← Diğer Araçları Gör</a>
</aside></div>'''

for page_name,container_id in [('index','featured-cars'),('araclar','listing-cards')]:
    f=ROOT/(page_name+'.html')
    soup=BeautifulSoup(f.read_text(),'html.parser')
    container=soup.select_one('#'+container_id)
    container.clear()
    container.append(BeautifulSoup(''.join(card(c) for c in CARS),'html.parser'))
    f.write_text(str(soup))

template=(ROOT/'arac.html').read_text()
for c in CARS:
    s=BeautifulSoup(template,'html.parser')
    s.title.string=f'{c["year"]} {vehicle_name(c)} {c["trim"]} | Onur Otomotiv'
    s.select_one('meta[name="description"]')['content']=f'{c["year"]} {vehicle_name(c)} {c["trim"]}, {fmt(c["km"])} km, {c["fuel"]}, {c["gear"]}. Onur Otomotiv Kadirli örnek araç ilanı.'
    root=s.select_one('#detail-root')
    root['data-car-id']=c['id']
    root.clear()
    root.append(BeautifulSoup(detail(c),'html.parser'))
    html='<!doctype html>\n'+str(s)
    (ROOT/f'arac-{c["id"]}.html').write_text(html)

legacy=ROOT/'arac.html'
legacy.write_text(legacy.read_text().replace('<meta name="robots" content="index,follow">','<meta name="robots" content="noindex,follow">'))
print('Generated',len(CARS),'vehicle pages + static card markup on home/listing.')
