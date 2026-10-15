// 상황별 허브 페이지 생성: /buy/ (살 때), /repair/ (아플 때), /care/ (관리)
// 데이터: data/guides.json(분류·사진), 각 블로그 페이지의 제목·설명
// 사용: node scripts/gen-hubs.js && node scripts/build-layout.js
const fs = require('fs');
const path = require('path');
const { esc, img, credit, head, THEME_SCRIPT } = require('./lib/page');
const guides = require('../data/guides.json');

const ROOT = path.resolve(__dirname, '..');

function guideInfo(slug) {
  const s = fs.readFileSync(path.join(ROOT, 'blog', slug, 'index.html'), 'utf8');
  const title = (s.match(/<h1[^>]*>([^<]+)</) || [])[1];
  const desc = (s.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const mins = (s.match(/약 (\d+)분/) || [])[1];
  if (!title || !desc) throw new Error('제목/설명 없음: ' + slug);
  // 제목의 " — 부제"는 카드에서 생략
  return { slug, title: title.trim(), short: title.split(' — ')[0].trim(), desc, mins, photo: guides.photo[slug] };
}

const HUBS = {
  buy: {
    path: '/buy/',
    name: '살 때',
    title: '살 때 — 중고차 매물 확인부터 계약까지 | ACHAJA',
    h1: '살 때',
    lead: '중고차 매물을 보러 가기 전에 확인할 것을 한곳에 모았어요.',
    description: '중고차 살 때 필요한 무료 도구와 가이드. 매물 체크(VIN·리콜), 사고·침수 이력 확인법, 시세 계산, 사기 예방, 명의이전까지.',
    hero: 'kr-expressway-open',
    tools: [
      { href: '/history', icon: 'fact_check', name: '매물 체크', desc: 'VIN·차량번호로 제조사·연식·리콜·용도 확인', tag: '무료' },
      { href: '/parts', icon: 'campaign', name: '리콜 조회', desc: '제조사·차명으로 리콜 대상인지 확인', tag: '무료' },
      { href: '/sources/', icon: 'verified_user', name: '공식기관 가이드', desc: '카히스토리·자동차365·리콜센터 바로가기', tag: '무료' },
      { icon: 'description', name: '서류 판독 베타', desc: '성능점검기록부·보험이력 위험 신호', tag: '회원 무료 · 준비 중' },
      { icon: 'calculate', name: '신차 실구매가 계산기', desc: '차량가 + 취득세·공채·탁송 = 실제 내는 돈', tag: '준비 중' },
    ],
  },
  repair: {
    path: '/repair/',
    name: '아플 때',
    title: '아플 때 — 경고등·이상 소음·고장 대처 | ACHAJA',
    h1: '아플 때',
    lead: '경고등이 켜지거나 소리가 이상할 때, 먼저 확인할 것들이에요.',
    description: '차에 이상이 생겼을 때 보는 무료 가이드. 엔진 경고등 의미, 이상 소음 자가 진단, 브레이크·배터리·에어컨 점검, 리콜 무상수리 확인.',
    hero: 'gauges',
    tools: [
      { href: '/parts', icon: 'campaign', name: '리콜 조회', desc: '무상수리 대상인지 먼저 확인', tag: '무료' },
      { href: '/blog/engine-warning-light/', icon: 'warning', name: '경고등 가이드', desc: '색깔별 긴급도와 바로 할 일', tag: '무료' },
      { icon: 'stethoscope', name: '증상 진단', desc: '증상을 고르면 예상 원인·긴급도·수리비 범위', tag: '준비 중' },
    ],
  },
  care: {
    path: '/care/',
    name: '관리',
    title: '관리 — 정비 주기·타이어·검사·보험 | ACHAJA',
    h1: '관리',
    lead: '오래 잘 타려면 챙길 것들. 정비 주기부터 타이어, 검사, 보험까지.',
    description: '내 차 관리 무료 가이드. 엔진오일 교환 주기, 타이어 공기압·교체, 자동차 정기검사, 자동차세, 보험료 절약, 블랙박스.',
    hero: 'road-green-valley',
    tools: [
      { href: '/blog/vehicle-inspection-guide/', icon: 'event_available', name: '정기검사 가이드', desc: '주기·비용·미수검 과태료', tag: '무료' },
      { href: '/parts', icon: 'campaign', name: '리콜 조회', desc: '내 차 리콜이 새로 나왔는지 확인', tag: '무료' },
      { icon: 'local_gas_station', name: '오늘의 유가', desc: '전국·시도 평균, 어제보다 오른지 내린지', tag: '준비 중' },
      { icon: 'partly_cloudy_day', name: '날씨별 관리 팁', desc: '한파·폭우·폭염 때 챙길 것', tag: '준비 중' },
    ],
  },
};

function toolCard(t) {
  const ready = !!t.href;
  const inner = `
          <span class="w-10 h-10 rounded-xl ${ready ? 'bg-primary-container/10 dark:bg-primary/15 text-primary-container dark:text-primary' : 'bg-surface-container-high text-muted'} flex items-center justify-center flex-shrink-0"><span class="material-symbols-outlined">${t.icon}</span></span>
          <span class="flex-1 min-w-0">
            <span class="flex items-center gap-2 flex-wrap"><span class="font-bold text-[15px] text-on-surface">${esc(t.name)}</span><span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${ready ? 'badge-go' : 'bg-surface-container-high text-muted'}">${esc(t.tag)}</span></span>
            <span class="block text-[13px] text-on-surface-variant mt-0.5">${esc(t.desc)}</span>
          </span>${ready ? '\n          <span class="material-symbols-outlined text-outline">chevron_right</span>' : ''}`;
  return ready
    ? `        <a href="${t.href}" class="flex items-center gap-3 p-md bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/60 rounded-2xl hover:border-primary-container dark:hover:border-primary transition">${inner}\n        </a>`
    : `        <div class="flex items-center gap-3 p-md bg-surface-container-low border border-dashed border-outline-variant rounded-2xl" aria-disabled="true">${inner}\n        </div>`;
}

function featureCard(g) {
  return `      <a href="/blog/${g.slug}/" class="group flex flex-col md:col-span-2 md:row-span-2 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/60 rounded-3xl overflow-hidden hover:shadow-card transition">
        <div class="photo-frame md:flex-1 md:aspect-auto md:min-h-[260px]">${img(g.photo, { cls: 'group-hover:scale-[1.02] transition-transform duration-500', sizes: '(min-width:768px) 66vw, 100vw' })}</div>
        <div class="p-lg">
          <p class="text-[11px] font-bold text-primary-container dark:text-primary mb-1">추천 가이드${g.mins ? ` · ${g.mins}분` : ''}</p>
          <h3 class="text-xl font-bold text-on-surface leading-snug group-hover:underline underline-offset-4">${esc(g.title)}</h3>
          <p class="text-[14px] text-on-surface-variant mt-sm leading-relaxed line-clamp-2">${esc(g.desc)}</p>
        </div>
      </a>`;
}

function smallCard(g) {
  return `      <a href="/blog/${g.slug}/" class="group flex md:block gap-3 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/60 rounded-2xl overflow-hidden hover:shadow-card transition">
        <div class="photo-frame w-28 md:w-full flex-shrink-0 aspect-[4/3] md:aspect-video">${img(g.photo, { cls: 'group-hover:scale-[1.03] transition-transform duration-500', sizes: '(min-width:768px) 33vw, 112px' })}</div>
        <div class="py-3 pr-3 md:p-md min-w-0">
          <h3 class="text-[15px] font-bold text-on-surface leading-snug group-hover:underline underline-offset-4">${esc(g.short)}</h3>
          <p class="hidden md:block text-[13px] text-on-surface-variant mt-1 leading-relaxed line-clamp-2">${esc(g.desc)}</p>
          ${g.mins ? `<p class="text-[11px] text-muted mt-1">${g.mins}분 읽기</p>` : ''}
        </div>
      </a>`;
}

function hubPage(key) {
  const h = HUBS[key];
  const list = guides.hubs[key].map(guideInfo);
  const [feature, ...rest] = list;
  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${h.name} — ACHAJA`, url: `https://achaja.net${h.path}`, inLanguage: 'ko-KR', description: h.description,
      hasPart: list.map((g) => ({ '@type': 'Article', headline: g.title, url: `https://achaja.net/blog/${g.slug}/` })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://achaja.net/' },
      { '@type': 'ListItem', position: 2, name: h.name, item: `https://achaja.net${h.path}` }] },
  ];
  return `${head({ title: h.title, description: h.description, path: h.path, jsonld })}
<body class="bg-background text-on-surface font-body min-h-screen pb-24 md:pb-0">
<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary-container focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">본문으로 건너뛰기</a>
  <!-- @header active=${key} -->
  <!-- /@header -->

<main id="main" class="pt-14">
  <!-- 히어로: 사진 + 한 줄 -->
  <section class="relative isolate overflow-hidden" aria-labelledby="hub-title">
    <div class="absolute inset-0 -z-10">${img(h.hero, { cls: 'w-full h-full object-cover', eager: true })}</div>
    <div class="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/45 to-black/20"></div>
    <div class="max-w-5xl mx-auto px-margin pt-xl pb-lg min-h-[260px] md:min-h-[340px] flex flex-col justify-end">
      <nav aria-label="breadcrumb" class="text-[12px] text-white/80 mb-sm"><a href="/" class="hover:underline">홈</a> / <span class="text-white">${h.name}</span></nav>
      <h1 id="hub-title" class="text-4xl md:text-5xl font-extrabold tracking-tight text-white">${h.h1}</h1>
      <p class="text-white/90 text-[15px] md:text-base mt-sm max-w-xl leading-relaxed">${esc(h.lead)}</p>
      <p class="photo-credit !text-white/60 mt-md">${credit(h.hero)}</p>
    </div>
  </section>

  <!-- 도구 -->
  <section class="max-w-5xl mx-auto px-margin pt-xl" aria-labelledby="tools-title">
    <h2 id="tools-title" class="text-lg font-bold mb-md">바로 쓰는 도구</h2>
    <div class="grid gap-sm md:grid-cols-2">
${h.tools.map(toolCard).join('\n')}
    </div>
  </section>

  <!-- 가이드: 대표 1 + 나머지 (Motor1식 크기 다른 카드) -->
  <section class="max-w-5xl mx-auto px-margin pt-xl" aria-labelledby="guides-title">
    <div class="flex items-end justify-between mb-md">
      <h2 id="guides-title" class="text-lg font-bold">${h.name} 가이드 <span class="text-muted font-medium text-sm">${list.length}편</span></h2>
      <a href="/blog/" class="text-[13px] font-semibold text-primary-container dark:text-primary hover:underline">전체 가이드</a>
    </div>
    <div class="grid gap-md md:grid-cols-3">
${featureCard(feature)}
${rest.map(smallCard).join('\n')}
    </div>
  </section>

  <!-- 회원 기능 안내 (한 줄 + 버튼 하나) -->
  <section class="max-w-5xl mx-auto px-margin pt-xl">
    <a href="/my" class="flex items-center gap-3 p-md rounded-2xl bg-primary-container text-white dark:bg-primary dark:text-on-primary hover:opacity-95 transition">
      <span class="material-symbols-outlined text-3xl" style="font-variation-settings:'FILL' 1;">garage</span>
      <span class="flex-1 min-w-0"><span class="block font-bold">내 차를 등록하면 리콜·검사 시기를 알려드려요</span><span class="block text-[13px] opacity-85">카카오·이메일 간편 가입 · 준비 중</span></span>
      <span class="material-symbols-outlined">chevron_right</span>
    </a>
  </section>
</main>

  <!-- @footer -->
  <!-- /@footer -->
  <!-- @tabbar active=${key} -->
  <!-- /@tabbar -->

${THEME_SCRIPT}
</body></html>
`;
}

for (const key of Object.keys(HUBS)) {
  const dir = path.join(ROOT, key);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), hubPage(key));
  console.log('생성:', HUBS[key].path, guides.hubs[key].length + '편');
}
