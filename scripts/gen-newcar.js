// NEWCAR(/newcar/) 페이지 생성 — 새로 나온 차만. 카드 앞면은 "사진 + 두 문장 + 핵심 숫자 3개 + 특징 3개"로 짧게,
// 제원·디자인은 접어 두고 궁금한 사람만 펼쳐 본다. 사실은 출처 링크로 확인할 수 있게 남긴다.
// 데이터: data/newcar.json  ·  사용: node scripts/gen-newcar.js && node scripts/build-layout.js
const fs = require('fs');
const path = require('path');
const { esc, head, THEME_SCRIPT } = require('./lib/page');

const ROOT = path.resolve(__dirname, '..');
const data = require('../data/newcar.json');
const items = [...data.items].sort((a, b) => b.date.localeCompare(a.date));

const fmtDate = (d) => { const [y, m, dd] = d.split('-').map(Number); return `${y}년 ${m}월 ${dd}일`; };
const STATUS_CLS = { '사전계약': 'badge-caution', '출시': 'badge-go', '국내 판매': 'badge-go', '국내 공개': 'badge-caution', '출시 예정': 'badge-caution' };

function card(n, i) {
  const p = n.photo;
  return `      <article id="${n.id}" data-power="${esc(n.power)}" class="car-card scroll-mt-32 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/60 rounded-3xl overflow-hidden shadow-card">
        <div class="relative bg-surface-container-high" style="aspect-ratio:${p.w}/${p.h}">
          <img src="${p.file800}" srcset="${p.file800} 800w, ${p.file} 1600w" sizes="(min-width:768px) 50vw, 100vw" width="${p.w}" height="${p.h}" alt="${esc(n.name)}" class="absolute inset-0 w-full h-full object-contain" ${i < 2 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"/>
          <span class="absolute top-3 left-3 text-[11px] font-black tracking-wider bg-amber-400 text-slate-900 px-2 py-0.5 rounded">NEWCAR</span>
        </div>
        <div class="p-lg">
          <div class="flex flex-wrap items-center gap-2 text-[12px]">
            <span class="font-bold text-primary-container dark:text-primary">${esc(n.brand)} · ${esc(n.power)}</span>
            <span class="${STATUS_CLS[n.status] || 'badge-caution'}">${esc(n.status)}</span>
            <time datetime="${n.date}" class="text-muted">${fmtDate(n.date)}</time>
          </div>
          <h2 class="mt-sm text-xl font-extrabold leading-snug">${esc(n.name)}</h2>
          <p class="mt-sm text-[15px] text-on-surface-variant leading-relaxed">${esc(n.summary)}</p>
          <dl class="mt-md grid grid-cols-3 gap-2">
${n.facts.map(([k, v]) => `            <div class="bg-surface-container-low dark:bg-surface-container-high rounded-xl p-2.5"><dt class="text-[11px] text-muted">${esc(k)}</dt><dd class="mt-0.5 text-[13px] font-bold leading-snug">${esc(v)}</dd></div>`).join('\n')}
          </dl>
${n.points?.length ? `          <h3 class="mt-md text-[13px] font-bold">이 차만의 특징</h3>
          <ul class="mt-1.5 space-y-1.5">
${n.points.slice(0, 3).map((t) => `            <li class="flex gap-2 text-[14px] leading-snug"><span class="material-symbols-outlined text-[18px] text-amber-500" aria-hidden="true">bolt</span><span>${esc(t)}</span></li>`).join('\n')}
          </ul>` : ''}
${n.specs?.length || n.design ? `          <details class="group mt-md rounded-2xl border border-outline-variant/60">
            <summary class="flex items-center justify-between cursor-pointer list-none px-md py-2.5 text-[14px] font-semibold">제원 · 디자인 자세히<span class="material-symbols-outlined text-[20px] transition-transform group-open:rotate-180" aria-hidden="true">expand_more</span></summary>
            <div class="px-md pb-md">
${n.specs?.length ? `              <h3 class="text-[12px] font-bold text-muted">간단 제원</h3>
              <dl class="mt-1 divide-y divide-app-border text-[13px]">
${n.specs.map(([k, v]) => `                <div class="flex justify-between gap-3 py-1.5"><dt class="text-muted flex-shrink-0">${esc(k)}</dt><dd class="font-semibold text-right">${esc(v)}</dd></div>`).join('\n')}
              </dl>
${n.specNote ? `              <p class="mt-1 text-[12px] text-muted leading-relaxed">※ ${esc(n.specNote)}</p>` : ''}` : ''}
${n.design ? `              <h3 class="mt-md text-[12px] font-bold text-muted">디자인</h3>
              <p class="mt-1 text-[13px] font-bold">${esc(n.design.by)}</p>
              <p class="mt-1 text-[13px] text-on-surface-variant leading-relaxed">${esc(n.design.text)}</p>` : ''}
            </div>
          </details>` : ''}
          ${n.note ? `<p class="mt-sm text-[12px] text-muted leading-relaxed">※ ${esc(n.note)}</p>` : ''}
          <p class="mt-md text-[12px] text-muted">출처: ${n.sources.map(([name, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener nofollow" class="underline hover:text-on-surface">${esc(name)}</a>`).join(' · ')}</p>
          <p class="photo-credit mt-1">사진: <a href="${esc(p.source)}" target="_blank" rel="noopener" class="hover:underline">${esc(p.author)}</a> · <a href="${esc(p.licenseUrl)}" target="_blank" rel="noopener license" class="hover:underline">${esc(p.license)}</a> · 위키미디어 공용${p.license === 'CC0' && n.id === 'buick-electra-e7' ? ' · 번호판 가림 처리' : ''}</p>
        </div>
      </article>`;
}

const powersWithItems = data.powers.filter((k) => items.some((n) => n.power === k));
const chips = [['all', '전체', true], ...data.powers.map((k) => [k, k, powersWithItems.includes(k)])];

const page = `${head({
  title: 'NEWCAR — 새로 나온 차 | ACHAJA',
  description: '새로 나온 자동차를 사진 한 장과 핵심 숫자로 짧게 소개해요. 가격·출력·주행거리, 간단 제원, 디자인 이야기와 출처 링크까지.',
  path: '/newcar/',
  jsonld: [
    { '@context': 'https://schema.org', '@type': 'ItemList', name: 'ACHAJA NEWCAR', itemListElement: items.map((n, i) => ({ '@type': 'ListItem', position: i + 1, name: n.name, url: `https://achaja.net/newcar/#${n.id}` })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://achaja.net/' },
      { '@type': 'ListItem', position: 2, name: 'NEWCAR', item: 'https://achaja.net/newcar/' }] },
  ],
  extraStyle: '\n.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}\nsummary::-webkit-details-marker{display:none}',
})}
<body class="bg-background text-on-surface font-body min-h-screen pb-24 md:pb-0">
<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary-container focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">본문으로 건너뛰기</a>
  <!-- @header active=newcar -->
  <!-- /@header -->

<main id="main" class="pt-14">
  <section class="max-w-5xl mx-auto px-margin pt-lg" aria-labelledby="newcar-title">
    <nav aria-label="breadcrumb" class="text-[12px] text-muted mb-sm"><a href="/" class="hover:underline">홈</a> / <span class="text-on-surface">NEWCAR</span></nav>
    <h1 id="newcar-title" class="text-3xl md:text-4xl font-extrabold flex items-center gap-2"><span class="text-[13px] font-black tracking-wider bg-amber-400 text-slate-900 px-2 py-0.5 rounded">NEWCAR</span>새로 나온 차</h1>
    <p class="mt-sm text-[15px] text-on-surface-variant">새 차를 사진 한 장과 핵심 숫자로 짧게 소개해요. 제원과 디자인 이야기는 카드의 ‘자세히’를 눌러 보세요.</p>
  </section>

  <nav aria-label="동력 종류" class="sticky top-14 z-40 bg-background/95 backdrop-blur border-b border-app-border mt-md">
    <div class="max-w-5xl mx-auto px-margin flex gap-1.5 overflow-x-auto hide-scrollbar py-2.5">
${chips.map(([k, label, on], i) => `      <button type="button" data-power="${esc(k)}" ${on ? '' : 'disabled title="곧 올라와요"'} aria-pressed="${i === 0}" class="power-btn flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold border transition ${i === 0 ? 'bg-primary-container text-white border-primary-container dark:bg-primary dark:text-on-primary dark:border-primary' : on ? 'bg-surface-container-lowest dark:bg-surface-container text-on-surface-variant border-outline-variant' : 'bg-surface-container-low text-muted border-dashed border-outline-variant cursor-not-allowed'}">${esc(label)}${on ? '' : ' · 곧'}</button>`).join('\n')}
    </div>
  </nav>

  <section class="max-w-5xl mx-auto px-margin pt-lg" aria-label="NEWCAR 목록">
    <div id="car-list" class="grid gap-lg md:grid-cols-2 items-start">
${items.map(card).join('\n')}
    </div>
    <p class="mt-lg text-[12px] text-muted leading-relaxed">NEWCAR에는 두 곳 이상의 보도나 공식 발표로 확인한 내용만 올려요. 디자이너 이름은 회사가 공식으로 밝힌 경우에만 적고, 아니면 디자인 조직까지만 적어요. 사진은 이용 권한이 확인된 것만 쓰고(위키미디어 공용), 권한 있는 사진이 없는 차는 사진이 생기면 올려요. 가격은 출시 시점·세제 기준에 따라 달라질 수 있어요.</p>
  </section>
</main>

  <!-- @footer -->
  <!-- /@footer -->
  <!-- @tabbar active=newcar -->
  <!-- /@tabbar -->

${THEME_SCRIPT}
<script>
(function(){
  var btns=document.querySelectorAll('.power-btn'),cards=document.querySelectorAll('.car-card');
  var ON='bg-primary-container text-white border-primary-container dark:bg-primary dark:text-on-primary dark:border-primary',OFF='bg-surface-container-lowest dark:bg-surface-container text-on-surface-variant border-outline-variant';
  btns.forEach(function(b){if(b.disabled)return;b.addEventListener('click',function(){var k=b.dataset.power;
    btns.forEach(function(x){if(x.disabled)return;var on=x===b;x.setAttribute('aria-pressed',on);ON.split(' ').forEach(function(c){x.classList.toggle(c,on);});OFF.split(' ').forEach(function(c){x.classList.toggle(c,!on);});});
    cards.forEach(function(c){c.classList.toggle('hidden',k!=='all'&&c.dataset.power!==k);});});});
})();
</script>
</body></html>
`;

fs.mkdirSync(path.join(ROOT, 'newcar'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'newcar/index.html'), page);
console.log('생성: /newcar/', items.length + '건');
