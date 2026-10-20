// NEW(/news/) 페이지 생성 — 오늘의 자동차 소식. 카드 한 장에 "분야 + 제목(2줄) + 매체·시간" 세 가지만.
// 기사 발췌·사진은 넣지 않는다(읽을 게 많으면 훑어보기 힘들고, 기사 사진은 권리가 없음).
// 상단: 카테고리 사진 띠 + NEWCAR(새로 나온 차) 사진 띠, 본문: 주요 소식 3 + 날짜별 카드
// 데이터: /api/news (src/api/news.js v2), data/newcar.json (NEWCAR 카드)
// 사용: node scripts/gen-news.js && node scripts/build-layout.js
const fs = require('fs');
const path = require('path');
const { esc, img, head, THEME_SCRIPT, photo, creditText } = require('./lib/page');

const ROOT = path.resolve(__dirname, '..');
const CARS = fs.existsSync(path.join(ROOT, 'data/newcar.json')) ? [...require('../data/newcar.json').items].sort((a, b) => b.date.localeCompare(a.date)) : [];

// 카테고리 → 대표 사진(분위기용, 기사 사진 아님)
const CATS = [
  ['all', '전체', 'kr-expressway-open'],
  ['new', '신차', 'trails-curve'],
  ['recall', '리콜', 'workshop-lift'],
  ['ev', '전기차', 'ev-charging-night'],
  ['used', '중고차', 'kr-expressway-clear'],
  ['life', '생활·제도', 'kr-crosswalk-night'],
  ['industry', '업계', 'highway-city-day'],
];
const catPhotos = Object.fromEntries(CATS.map(([k, , id]) => {
  const p = photo(id);
  return [k, { src: p.file800, srcset: `${p.file800} 800w, ${p.file} 1600w`, alt: p.title, credit: creditText(p), source: p.source }];
}));

function carStrip() {
  if (!CARS.length) return '';
  const cards = CARS.slice(0, 6).map((n) => `        <a href="/newcar/#${n.id}" class="group flex-shrink-0 w-[180px] md:w-auto snap-start bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/60 rounded-2xl overflow-hidden hover:shadow-card transition">
          <div class="relative bg-surface-container-high" style="aspect-ratio:${n.photo.w}/${n.photo.h}"><img src="${n.photo.file800}" width="${n.photo.w}" height="${n.photo.h}" alt="${esc(n.name)}" class="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async"/></div>
          <div class="p-sm">
            <span class="text-[10px] font-bold text-primary-container dark:text-primary">${esc(n.brand)} · ${esc(n.status)}</span>
            <p class="font-bold text-[14px] leading-snug mt-0.5 group-hover:underline underline-offset-4">${esc(n.name)}</p>
          </div>
        </a>`).join('\n');
  return `  <!-- NEWCAR: 새로 나온 차 (사진 카드) -->
  <section class="max-w-5xl mx-auto px-margin pt-lg" aria-labelledby="newcar-title">
    <div class="flex items-end justify-between mb-sm">
      <h2 id="newcar-title" class="text-lg font-extrabold flex items-center gap-2"><span class="text-[11px] font-black tracking-wider bg-amber-400 text-slate-900 px-2 py-0.5 rounded">NEWCAR</span>새로 나온 차</h2>
      <a href="/newcar/" class="text-[13px] font-semibold text-primary-container dark:text-primary hover:underline">모두 보기 →</a>
    </div>
    <div class="flex md:grid md:grid-cols-${Math.min(4, CARS.length)} gap-sm overflow-x-auto snap-x hide-scrollbar -mx-margin px-margin md:mx-0 md:px-0 pb-1">
${cards}
    </div>
  </section>`;
}

const page = `${head({
  title: 'NEW — 오늘의 자동차 소식 | ACHAJA · 신차·리콜·전기차·중고차',
  description: '오늘의 자동차 소식을 한눈에. 같은 사건을 다룬 기사는 하나로 묶어 매체 수로 보여 드려요. 신차·리콜·전기차·중고차·생활·제도·업계.',
  path: '/news/',
  jsonld: [{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: '홈', item: 'https://achaja.net/' },
    { '@type': 'ListItem', position: 2, name: 'NEW', item: 'https://achaja.net/news/' }] }],
  extraStyle: '\n.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}',
})}
<body class="bg-background text-on-surface font-body min-h-screen pb-24 md:pb-0">
<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary-container focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">본문으로 건너뛰기</a>
  <!-- @header active=news -->
  <!-- /@header -->

<main id="main" class="pt-14">
  <!-- 카테고리 사진 띠 (분위기용 사진 — 기사 사진 아님) -->
  <section class="relative isolate overflow-hidden" aria-labelledby="news-title">
    <div class="absolute inset-0 -z-10">${img('kr-expressway-open', { cls: 'w-full h-full object-cover', eager: true }).replace('<img ', '<img id="cat-photo" ')}</div>
    <div class="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
    <div class="max-w-5xl mx-auto px-margin pt-lg pb-md min-h-[168px] md:min-h-[200px] flex flex-col justify-end">
      <h1 id="news-title" class="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-2"><span class="text-[13px] font-black tracking-wider bg-amber-400 text-slate-900 px-2 py-0.5 rounded">NEW</span>오늘의 자동차 소식</h1>
      <p class="text-white/90 text-[14px] mt-1">같은 사건 기사는 하나로 묶었어요. 카드를 누르면 원문 언론사로 이동해요.</p>
      <p class="photo-credit !text-white/55 mt-sm"><span id="cat-credit">${esc(creditText(photo('kr-expressway-open')))}</span> · 분위기 사진</p>
    </div>
  </section>

  <!-- 카테고리 (스크롤해도 따라옴) -->
  <nav aria-label="소식 카테고리" class="sticky top-14 z-40 bg-background/95 backdrop-blur border-b border-app-border">
    <div id="cats" class="max-w-5xl mx-auto px-margin flex gap-1.5 overflow-x-auto hide-scrollbar py-2.5">
${CATS.map(([k, label], i) => `      <button type="button" data-cat="${k}" aria-pressed="${i === 0}" class="cat-btn flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold border transition">${label}</button>`).join('\n')}
    </div>
  </nav>

${carStrip()}

  <!-- 주요 소식: 매체가 가장 많이 다룬 3건 -->
  <section class="max-w-5xl mx-auto px-margin pt-lg" aria-labelledby="top-title">
    <h2 id="top-title" class="text-lg font-extrabold mb-sm">주요 소식</h2>
    <div id="top" class="grid gap-sm md:grid-cols-3">
      <div class="h-28 rounded-2xl bg-surface-container animate-pulse"></div><div class="h-28 rounded-2xl bg-surface-container animate-pulse hidden md:block"></div><div class="h-28 rounded-2xl bg-surface-container animate-pulse hidden md:block"></div>
    </div>
  </section>

  <!-- 전체 목록 (날짜별) -->
  <section class="max-w-5xl mx-auto px-margin pt-lg" aria-labelledby="list-title">
    <h2 id="list-title" class="sr-only">소식 목록</h2>
    <p id="to-newcar" class="hidden mb-sm"><a href="/newcar/" class="flex items-center justify-between gap-2 px-md py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-400/10 border border-amber-300/60 text-[14px] font-semibold hover:underline underline-offset-4"><span><span class="text-[11px] font-black tracking-wider bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded mr-1.5">NEWCAR</span>신차 제원·디자인 정리는 여기서</span><span aria-hidden="true">→</span></a></p>
    <div id="list"></div>
    <div class="text-center mt-lg"><button id="more" type="button" class="hidden px-6 py-2.5 rounded-xl border border-outline-variant text-[14px] font-semibold hover:bg-surface-container">더 보기</button></div>
  </section>

  <div class="max-w-3xl mx-auto px-margin mt-xl">
    <div class="bg-surface-container rounded-2xl p-md border border-outline-variant">
      <p class="text-[12px] text-on-surface font-semibold mb-xs">뉴스 데이터 출처 안내</p>
      <p class="text-[11px] text-muted leading-relaxed">자동차 소식은 <a href="https://developers.naver.com/docs/serviceapi/search/news/news.md" target="_blank" rel="noopener" class="underline hover:text-on-surface">네이버 뉴스 검색 OpenAPI</a>에서 받은 제목·링크·발행일을 정리한 것이에요. ACHAJA는 기사 원문을 복제하거나 저장하지 않으며, 모든 저작권은 해당 언론사에 있어요. 상단 사진은 카테고리 분위기 사진으로 기사와 관련이 없어요.</p>
    </div>
  </div>
</main>

  <!-- @footer -->
  <!-- /@footer -->
  <!-- @tabbar active=news -->
  <!-- /@tabbar -->

${THEME_SCRIPT}
<script>
(function(){
  var PHOTOS=${JSON.stringify(catPhotos)};
  var LABEL={new:'신차',recall:'리콜',ev:'전기차',used:'중고차',life:'생활·제도',industry:'업계'};
  var CHIP={new:'badge-go',recall:'badge-stop',ev:'badge-go',used:'badge-caution',life:'badge-caution',industry:''};
  var state={cat:'all',items:[],shown:0}, PAGE=12, cache={};
  var $=function(id){return document.getElementById(id);};
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function ago(d){var m=Math.round((Date.now()-new Date(d))/60000);if(m<1)return '방금';if(m<60)return m+'분 전';var h=Math.round(m/60);if(h<24)return h+'시간 전';return Math.round(h/24)+'일 전';}
  function dayKey(d){var x=new Date(d),t=new Date();var s=function(a){return a.getFullYear()+'-'+a.getMonth()+'-'+a.getDate();};if(s(x)===s(t))return '오늘';t.setDate(t.getDate()-1);if(s(x)===s(t))return '어제';return (x.getMonth()+1)+'월 '+x.getDate()+'일';}
  function meta(it){return '<span>'+esc(it.source)+'</span>'+(it.related>1?'<span class="font-bold text-primary-container dark:text-primary">'+it.related+'개 매체</span>':'')+'<span>'+ago(it.pubDate)+'</span>';}
  var ICON={new:'directions_car',recall:'build',ev:'ev_station',used:'sell',life:'gavel',industry:'factory'};
  function chipIcon(c){return '<span class="'+(CHIP[c]||'bg-surface-container-high text-on-surface-variant')+' inline-flex items-center gap-1 rounded-full pl-1.5 pr-2 py-0.5 text-[11px] font-bold"><span class="material-symbols-outlined text-[14px]" aria-hidden="true">'+(ICON[c]||'article')+'</span>'+esc(LABEL[c]||'')+'</span>';}
  // 카드 한 장 = 분야 · 제목(2줄) · 매체·시간. 발췌는 넣지 않는다(훑어보기용).
  function card(it){return '<a href="'+esc(it.link)+'" target="_blank" rel="noopener nofollow" class="group flex flex-col gap-2 p-md rounded-2xl bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/60 hover:shadow-card hover:border-primary-container/40 transition">'+
    '<div class="flex items-center justify-between gap-2">'+chipIcon(it.category)+'<span class="material-symbols-outlined text-outline text-[16px]" aria-hidden="true">open_in_new</span></div>'+
    '<p class="text-[15px] font-bold leading-snug line-clamp-2 group-hover:underline underline-offset-4">'+esc(it.title)+'</p>'+
    '<p class="mt-auto flex flex-wrap gap-x-2 text-[12px] text-muted">'+meta(it)+'</p></a>';}
  function topCard(it){return '<a href="'+esc(it.link)+'" target="_blank" rel="noopener nofollow" class="group flex flex-col gap-2 p-md rounded-2xl bg-surface-container-lowest dark:bg-surface-container border-2 border-primary-container/30 dark:border-primary/30 hover:shadow-card transition">'+
    '<div class="flex items-center justify-between gap-2">'+chipIcon(it.category)+(it.related>1?'<span class="text-[11px] font-bold text-primary-container dark:text-primary">'+it.related+'개 매체 보도</span>':'')+'</div>'+
    '<p class="text-[17px] font-extrabold leading-snug line-clamp-3 group-hover:underline underline-offset-4">'+esc(it.title)+'</p>'+
    '<p class="mt-auto text-[12px] text-muted">'+esc(it.source)+' · '+ago(it.pubDate)+'</p></a>';}
  function renderList(){
    var groups=[],items=state.items.slice(3,3+state.shown);
    items.forEach(function(it){var k=dayKey(it.pubDate),g=groups[groups.length-1];if(!g||g.k!==k){g={k:k,a:[]};groups.push(g);}g.a.push(it);});
    $('list').innerHTML=groups.map(function(g){return '<h3 class="pt-md pb-sm text-[13px] font-bold text-muted">'+g.k+'</h3><div class="grid gap-sm sm:grid-cols-2 lg:grid-cols-3">'+g.a.map(card).join('')+'</div>';}).join('');
    $('more').classList.toggle('hidden',3+state.shown>=state.items.length);
  }
  function render(){
    // 주요 소식: 최근 48시간 안에서 매체가 많이 다룬 순, 카테고리당 1건(보도자료가 한 분야를 독점하지 않게)
    var recent=state.items.filter(function(x){return Date.now()-new Date(x.pubDate)<48*3600e3;}).slice().sort(function(a,b){return b.related-a.related;});
    var top=[],used={};recent.forEach(function(x){if(top.length<3&&!used[x.category]){used[x.category]=1;top.push(x);}});
    var topLinks=top.map(function(x){return x.link;});
    state.items=top.concat(state.items.filter(function(x){return topLinks.indexOf(x.link)<0;}));
    $('top').innerHTML=top.length?top.map(topCard).join(''):'<p class="text-muted text-[14px] py-md">지금은 소식을 불러오지 못했어요. 잠시 후 다시 확인해 주세요.</p>';
    state.shown=PAGE; renderList();
  }
  function setPhoto(c){var p=PHOTOS[c]||PHOTOS.all,im=$('cat-photo');if(!im)return;im.removeAttribute('fetchpriority');im.srcset=p.srcset;im.src=p.src;im.alt=p.alt;$('cat-credit').textContent=p.credit;}
  function setActive(c){document.querySelectorAll('.cat-btn').forEach(function(b){var on=b.dataset.cat===c;b.setAttribute('aria-pressed',on);
    b.className='cat-btn flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold border transition '+(on?'bg-primary-container text-white border-primary-container dark:bg-primary dark:text-on-primary dark:border-primary':'bg-surface-container-lowest dark:bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary-container');});}
  async function load(c){
    state.cat=c; setActive(c); setPhoto(c); $('to-newcar').classList.toggle('hidden',c!=='new');
    try{ if(!cache[c]){var r=await fetch('/api/news?category='+encodeURIComponent(c));cache[c]=(await r.json()).items||[];}
      if(state.cat!==c)return; state.items=cache[c].slice(); }catch(e){ state.items=[]; }
    render();
    try{history.replaceState(null,'',c==='all'?location.pathname:'#'+c);}catch(e){}
  }
  document.querySelectorAll('.cat-btn').forEach(function(b){b.addEventListener('click',function(){load(b.dataset.cat);});});
  $('more').addEventListener('click',function(){state.shown+=PAGE;renderList();});
  var h=(location.hash||'').slice(1); load(PHOTOS[h]?h:'all');
})();
</script>
</body></html>
`;

fs.mkdirSync(path.join(ROOT, 'news'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'news/index.html'), page);
console.log('생성: /news/', CARS.length ? `(NEWCAR ${CARS.length}건)` : '(NEWCAR 없음)');
