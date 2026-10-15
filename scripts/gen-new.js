// NEW(/new/) 페이지 생성 — 새로 나온 차·부품·튜닝을 "사진 한 장 + 짧은 소개 + 핵심 숫자 3개"로.
// 기사처럼 길게 쓰지 않는다. 사실은 출처 링크로 확인할 수 있게 남긴다.
// 데이터: data/new.json  ·  사용: node scripts/gen-new.js && node scripts/build-layout.js
const fs = require('fs');
const path = require('path');
const { esc, head, THEME_SCRIPT } = require('./lib/page');

const ROOT = path.resolve(__dirname, '..');
const data = require('../data/new.json');
const items = [...data.items].sort((a, b) => b.date.localeCompare(a.date));

const fmtDate = (d) => { const [y, m, dd] = d.split('-').map(Number); return `${y}년 ${m}월 ${dd}일`; };
const STATUS_CLS = { '사전계약': 'badge-caution', '출시': 'badge-go', '국내 판매': 'badge-go', '국내 공개': 'badge-caution', '출시 예정': 'badge-caution' };

function card(n, i) {
  const p = n.photo;
  return `      <article id="${n.id}" data-kind="${esc(n.kind)}" class="new-card scroll-mt-32 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/60 rounded-3xl overflow-hidden shadow-card">
        <div class="relative bg-surface-container-high" style="aspect-ratio:${p.w}/${p.h}">
          <img src="${p.file800}" srcset="${p.file800} 800w, ${p.file} 1600w" sizes="(min-width:768px) 50vw, 100vw" width="${p.w}" height="${p.h}" alt="${esc(n.name)}" class="absolute inset-0 w-full h-full object-contain" ${i < 2 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"/>
          <span class="absolute top-3 left-3 text-[11px] font-black tracking-wider bg-amber-400 text-slate-900 px-2 py-0.5 rounded">NEW</span>
        </div>
        <div class="p-lg">
          <div class="flex flex-wrap items-center gap-2 text-[12px]">
            <span class="font-bold text-primary-container dark:text-primary">${esc(n.kind)}</span>
            <span class="${STATUS_CLS[n.status] || 'badge-caution'}">${esc(n.status)}</span>
            <time datetime="${n.date}" class="text-muted">${fmtDate(n.date)}</time>
          </div>
          <h2 class="mt-sm text-xl font-extrabold leading-snug">${esc(n.name)}</h2>
          <p class="mt-sm text-[15px] text-on-surface-variant leading-relaxed">${esc(n.summary)}</p>
          <dl class="mt-md grid grid-cols-3 gap-2">
${n.facts.map(([k, v]) => `            <div class="bg-surface-container-low dark:bg-surface-container-high rounded-xl p-2.5"><dt class="text-[11px] text-muted">${esc(k)}</dt><dd class="mt-0.5 text-[13px] font-bold leading-snug">${esc(v)}</dd></div>`).join('\n')}
          </dl>
          ${n.note ? `<p class="mt-sm text-[12px] text-muted leading-relaxed">※ ${esc(n.note)}</p>` : ''}
          <p class="mt-md text-[12px] text-muted">출처: ${n.sources.map(([name, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener nofollow" class="underline hover:text-on-surface">${esc(name)}</a>`).join(' · ')}</p>
          <p class="photo-credit mt-1">사진: <a href="${esc(p.source)}" target="_blank" rel="noopener" class="hover:underline">${esc(p.author)}</a> · <a href="${esc(p.licenseUrl)}" target="_blank" rel="noopener license" class="hover:underline">${esc(p.license)}</a> · 위키미디어 공용${p.license === 'CC0' && n.id === 'buick-electra-e7' ? ' · 번호판 가림 처리' : ''}</p>
        </div>
      </article>`;
}

const kindsWithItems = data.kinds.filter((k) => items.some((n) => n.kind === k));
const chips = [['all', '전체', true], ...data.kinds.map((k) => [k, k, kindsWithItems.includes(k)])];

const page = `${head({
  title: 'NEW — 새로 나온 차·부품·튜닝 | ACHAJA',
  description: '새로 나온 자동차·부품·튜닝 소식을 사진 한 장과 핵심 숫자로 짧게 소개해요. 가격·출력·주행거리와 출처 링크까지.',
  path: '/new/',
  jsonld: [
    { '@context': 'https://schema.org', '@type': 'ItemList', name: 'ACHAJA NEW', itemListElement: items.map((n, i) => ({ '@type': 'ListItem', position: i + 1, name: n.name, url: `https://achaja.net/new/#${n.id}` })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://achaja.net/' },
      { '@type': 'ListItem', position: 2, name: 'NEW', item: 'https://achaja.net/new/' }] },
  ],
  extraStyle: '\n.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}',
})}
<body class="bg-background text-on-surface font-body min-h-screen pb-24 md:pb-0">
<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary-container focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">본문으로 건너뛰기</a>
  <!-- @header active=new -->
  <!-- /@header -->

<main id="main" class="pt-14">
  <section class="max-w-5xl mx-auto px-margin pt-lg" aria-labelledby="new-title">
    <nav aria-label="breadcrumb" class="text-[12px] text-muted mb-sm"><a href="/" class="hover:underline">홈</a> / <span class="text-on-surface">NEW</span></nav>
    <h1 id="new-title" class="text-3xl md:text-4xl font-extrabold flex items-center gap-2"><span class="text-[13px] font-black tracking-wider bg-amber-400 text-slate-900 px-2 py-0.5 rounded">NEW</span>새로 나왔어요</h1>
    <p class="mt-sm text-[15px] text-on-surface-variant">새 차·부품·튜닝을 사진 한 장과 핵심 숫자로 짧게 소개해요. 자세한 내용은 출처 링크에서 확인하세요.</p>
  </section>

  <nav aria-label="NEW 종류" class="sticky top-14 z-40 bg-background/95 backdrop-blur border-b border-app-border mt-md">
    <div class="max-w-5xl mx-auto px-margin flex gap-1.5 overflow-x-auto hide-scrollbar py-2.5">
${chips.map(([k, label, on], i) => `      <button type="button" data-kind="${esc(k)}" ${on ? '' : 'disabled title="곧 올라와요"'} aria-pressed="${i === 0}" class="kind-btn flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold border transition ${i === 0 ? 'bg-primary-container text-white border-primary-container dark:bg-primary dark:text-on-primary dark:border-primary' : on ? 'bg-surface-container-lowest dark:bg-surface-container text-on-surface-variant border-outline-variant' : 'bg-surface-container-low text-muted border-dashed border-outline-variant cursor-not-allowed'}">${esc(label)}${on ? '' : ' · 곧'}</button>`).join('\n')}
    </div>
  </nav>

  <section class="max-w-5xl mx-auto px-margin pt-lg" aria-label="NEW 목록">
    <div id="new-list" class="grid gap-lg md:grid-cols-2 items-start">
${items.map(card).join('\n')}
    </div>
    <p class="mt-lg text-[12px] text-muted leading-relaxed">NEW에는 두 곳 이상의 보도나 공식 발표로 확인한 내용만 올려요. 사진은 이용 권한이 확인된 것만 쓰고(위키미디어 공용), 권한 있는 사진이 없는 소식은 사진이 생기면 올려요. 가격은 출시 시점·세제 기준에 따라 달라질 수 있어요.</p>
  </section>
</main>

  <!-- @footer -->
  <!-- /@footer -->
  <!-- @tabbar active=new -->
  <!-- /@tabbar -->

${THEME_SCRIPT}
<script>
(function(){
  var btns=document.querySelectorAll('.kind-btn'),cards=document.querySelectorAll('.new-card');
  var ON='bg-primary-container text-white border-primary-container dark:bg-primary dark:text-on-primary dark:border-primary',OFF='bg-surface-container-lowest dark:bg-surface-container text-on-surface-variant border-outline-variant';
  btns.forEach(function(b){if(b.disabled)return;b.addEventListener('click',function(){var k=b.dataset.kind;
    btns.forEach(function(x){if(x.disabled)return;var on=x===b;x.setAttribute('aria-pressed',on);ON.split(' ').forEach(function(c){x.classList.toggle(c,on);});OFF.split(' ').forEach(function(c){x.classList.toggle(c,!on);});});
    cards.forEach(function(c){c.classList.toggle('hidden',k!=='all'&&c.dataset.kind!==k);});});});
})();
</script>
</body></html>
`;

fs.mkdirSync(path.join(ROOT, 'new'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'new/index.html'), page);
console.log('생성: /new/', items.length + '건');
