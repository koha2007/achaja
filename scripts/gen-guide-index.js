// 가이드 전체(/blog/) 페이지 생성 — 모바일 '가이드' 탭의 첫 화면.
// 살 때 · 아플 때 · 관리 순서로, 상황마다 사진 카드 그리드. (URL /blog/ 유지: 검색 유입 보존)
// 사용: node scripts/gen-guide-index.js && node scripts/build-layout.js
const fs = require('fs');
const path = require('path');
const { esc, img, head, THEME_SCRIPT } = require('./lib/page');
const guides = require('../data/guides.json');

const ROOT = path.resolve(__dirname, '..');
const HUBS = [
  ['buy', '살 때', '/buy/', '중고차 매물을 보러 가기 전에 확인할 것', 'u-hub-buy'],
  ['repair', '아플 때', '/repair/', '경고등·이상 소음·고장 대처', 'u-hub-repair'],
  ['care', '관리', '/care/', '정비 주기·타이어·검사·보험', 'u-hub-care'],
];

function info(slug) {
  const s = fs.readFileSync(path.join(ROOT, 'blog', slug, 'index.html'), 'utf8');
  const title = s.match(/<h1[^>]*>([^<]+)</)[1].trim();
  const mins = (s.match(/약 (\d+)분/) || [])[1];
  return { slug, short: title.split(' — ')[0].trim(), title, mins, photo: guides.photo[slug] };
}

const total = Object.values(guides.hubs).flat().length;

const sections = HUBS.map(([key, name, href, lead, hero]) => {
  const list = guides.hubs[key].map(info);
  return `  <section id="${key}" class="max-w-5xl mx-auto px-margin pt-xl scroll-mt-28" aria-labelledby="h-${key}">
    <a href="${href}" class="group relative isolate block overflow-hidden rounded-3xl text-white">
      <div class="absolute inset-0 -z-10">${img(hero, { cls: 'w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500', sizes: '(min-width:1024px) 1000px, 100vw' })}</div>
      <div class="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/45 to-black/10"></div>
      <div class="p-lg md:p-xl flex items-end justify-between gap-md min-h-[140px]">
        <div><h2 id="h-${key}" class="text-2xl md:text-3xl font-extrabold">${name}</h2><p class="text-[14px] text-white/90 mt-1">${esc(lead)} · ${list.length}편</p></div>
        <span class="flex-shrink-0 text-[13px] font-bold bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">도구까지 보기 →</span>
      </div>
    </a>
    <div class="mt-md grid gap-sm sm:grid-cols-2 lg:grid-cols-3">
${list.map((g) => `      <a href="/blog/${g.slug}/" class="group flex gap-3 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/60 rounded-2xl overflow-hidden hover:shadow-card transition">
        <div class="photo-frame w-24 flex-shrink-0 aspect-square">${img(g.photo, { sizes: '96px' })}</div>
        <div class="py-2.5 pr-3 min-w-0 flex flex-col justify-center">
          <h3 class="text-[14px] font-bold leading-snug line-clamp-2 group-hover:underline underline-offset-4">${esc(g.short)}</h3>
          ${g.mins ? `<p class="text-[11px] text-muted mt-0.5">${g.mins}분 읽기</p>` : ''}
        </div>
      </a>`).join('\n')}
    </div>
  </section>`;
}).join('\n\n');

const page = `${head({
  title: `자동차 가이드 ${total}편 — ACHAJA | 살 때·아플 때·관리`,
  description: `중고차 살 때, 차가 아플 때, 오래 잘 타기 위한 관리까지 — 상황별 자동차 가이드 ${total}편. 침수·사고이력·리콜·시세·경고등·정비·보험·세금.`,
  path: '/blog/',
  ogTitle: `자동차 가이드 ${total}편 — ACHAJA`,
  jsonld: [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `자동차 가이드 ${total}편`, url: 'https://achaja.net/blog/', inLanguage: 'ko-KR',
      hasPart: Object.values(guides.hubs).flat().map((s) => ({ '@type': 'Article', url: `https://achaja.net/blog/${s}/` })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://achaja.net/' },
      { '@type': 'ListItem', position: 2, name: '가이드', item: 'https://achaja.net/blog/' }] },
  ],
  extraStyle: '\n.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}',
})}
<body class="bg-background text-on-surface font-body min-h-screen pb-24 md:pb-0">
<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary-container focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">본문으로 건너뛰기</a>
  <!-- @header active=guide -->
  <!-- /@header -->

<main id="main" class="pt-14">
  <section class="max-w-5xl mx-auto px-margin pt-lg" aria-labelledby="guide-title">
    <nav aria-label="breadcrumb" class="text-[12px] text-muted mb-sm"><a href="/" class="hover:underline">홈</a> / <span class="text-on-surface">가이드</span></nav>
    <h1 id="guide-title" class="text-3xl md:text-4xl font-extrabold">가이드 <span class="text-muted font-bold text-xl">${total}편</span></h1>
    <p class="mt-sm text-[15px] text-on-surface-variant">지금 상황에 맞는 가이드를 골라 보세요.</p>
  </section>
  <nav aria-label="상황 바로가기" class="sticky top-14 z-40 bg-background/95 backdrop-blur border-b border-app-border mt-md">
    <div class="max-w-5xl mx-auto px-margin flex gap-1.5 overflow-x-auto hide-scrollbar py-2.5">
${HUBS.map(([key, name]) => `      <a href="#${key}" class="flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold border border-outline-variant bg-surface-container-lowest dark:bg-surface-container text-on-surface-variant hover:border-primary-container">${name}</a>`).join('\n')}
    </div>
  </nav>

${sections}
</main>

  <!-- @footer -->
  <!-- /@footer -->
  <!-- @tabbar active=guide -->
  <!-- /@tabbar -->

${THEME_SCRIPT}
</body></html>
`;

fs.writeFileSync(path.join(ROOT, 'blog/index.html'), page);
console.log('생성: /blog/ (가이드 ' + total + '편)');
