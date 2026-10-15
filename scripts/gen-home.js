// 홈(index.html) 본문 생성 — 디자인 원칙: 한 구역 = 한 메시지 = 한 행동, 사진은 '도로 위의 삶'
// <main> ~ 하단 탭 앞까지를 다시 쓰고, 한국어/English 사전(I18N)을 새 문구에 맞춰 갱신한다.
// <head>(메타·JSON-LD)와 FAQ 구역은 기존 것을 유지한다.
// 사용: node scripts/gen-home.js && node scripts/build-layout.js
const fs = require('fs');
const path = require('path');
const { esc, img, credit } = require('./lib/page');
const guides = require('../data/guides.json');

const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'index.html');

// ── 번역 수집: t('한국어', 'English') ─────────────────────────────
const PAIRS = new Map();
const t = (ko, en) => { PAIRS.set(ko, en); return esc(ko); };

// 공용 헤더·푸터·하단 탭 문구 (build-layout.js)
[
  ['살 때', 'Buying'], ['아플 때', 'Repairs'], ['관리', 'Care'], ['소식', 'News'], ['내 차', 'My car'], ['홈', 'Home'],
  ['도구', 'Tools'], ['매물 체크(차량 조회)', 'Listing check (vehicle lookup)'], ['리콜 조회', 'Recall lookup'],
  ['공식기관 가이드', 'Official-agency guide'], ['상품안내', 'Plans'], ['상황별 가이드', 'Guides by situation'],
  ['콘텐츠', 'Content'], ['전체 가이드', 'All guides'], ['중고차 체크리스트', 'Used-car checklist'],
  ['엔진 경고등', 'Engine warning light'], ['자동차 정기검사', 'Vehicle inspection'], ['회사·정책', 'Company / policy'],
  ['소개', 'About'], ['이용약관', 'Terms'], ['개인정보처리방침', 'Privacy policy'], ['본문으로 건너뛰기', 'Skip to content'],
  ['데이터 출처: 국토교통부 · 한국교통안전공단 · 보험개발원 카히스토리(외부 안내) · NHTSA vPIC · ISO 3779 · 사진: 위키미디어 공용',
    'Data sources: MOLIT · KOTSA · KIDI Carhistory (external) · NHTSA vPIC · ISO 3779 · Photos: Wikimedia Commons'],
  ['상호: 코하(Koha) · 대표: 김용헌 · 사업자등록번호: 108-16-82025 · 주소: 경기도 남양주시 진접읍 해밀예당1로 145 · 전화: 010-8947-1841 · 이메일: koha3d77@gmail.com',
    'Company: Koha · CEO: Kim Yong-heon · Business reg. no.: 108-16-82025 · Address: 145 Haemilyedang 1-ro, Jinjeop-eup, Namyangju-si, Gyeonggi-do · Tel: 010-8947-1841 · Email: koha3d77@gmail.com'],
  ['© 2026 ACHAJA by 코하(Koha). All Rights Reserved.', '© 2026 ACHAJA by Koha. All Rights Reserved.'],
].forEach(([k, v]) => PAIRS.set(k, v));

function guide(slug) {
  const s = fs.readFileSync(path.join(ROOT, 'blog', slug, 'index.html'), 'utf8');
  const title = s.match(/<h1[^>]*>([^<]+)</)[1].trim();
  const desc = s.match(/<meta name="description" content="([^"]*)"/)[1];
  const mins = (s.match(/약 (\d+)분/) || [])[1];
  const hub = Object.keys(guides.hubs).find((h) => guides.hubs[h].includes(slug));
  return { slug, title, short: title.split(' — ')[0].trim(), desc, mins, photo: guides.photo[slug], hub };
}
const HUB_LABEL = { buy: '살 때', repair: '아플 때', care: '관리' };

// ── 구역 ────────────────────────────────────────────────────────
function hero() {
  const ph = 'trails-curve';
  return `  <!-- 히어로: 사진 + 한 문장 + 조회 한 칸 -->
  <section class="relative isolate overflow-hidden" aria-labelledby="hero-title">
    <div class="absolute inset-0 -z-10">${img(ph, { cls: 'w-full h-full object-cover', eager: true })}</div>
    <div class="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-black/45 to-black/75"></div>
    <div class="max-w-3xl mx-auto px-margin pt-[72px] pb-xl md:pt-24 md:pb-[72px] text-center">
      <span class="inline-flex items-center gap-1 bg-white/15 text-white text-[12px] font-bold px-3 py-1 rounded-full backdrop-blur-sm"><span class="material-symbols-outlined text-[16px]" style="font-variation-settings:'FILL' 1;">bolt</span>${t('로그인 없이 · 100% 무료', 'No login · 100% free')}</span>
      <h1 id="hero-title" class="mt-md text-[34px] md:text-5xl leading-[1.15] font-extrabold tracking-tight text-white">${t('아픈 차, 한눈에', 'Spot a sick car')}<br/>${t('걸러내세요', 'at a glance')}</h1>
      <p class="mt-sm text-[15px] md:text-lg text-white/90">${t('차량번호 또는 VIN 한 줄이면 제조사·연식·리콜을 바로 확인해요.', 'One plate number or VIN shows the maker, year and recalls right away.')}</p>
      <form id="hero-form" class="mt-lg mx-auto max-w-xl bg-white rounded-full p-1.5 flex items-center shadow-2xl ring-1 ring-white/30" action="/history" method="get" role="search" aria-label="차량 조회">
        <label for="hero-q" class="sr-only">${t('차량번호 또는 VIN', 'Plate number or VIN')}</label>
        <input id="hero-q" name="q" class="flex-1 min-w-0 bg-transparent border-none text-slate-900 placeholder:text-slate-400 focus:ring-0 px-md text-base" placeholder="예: 12가3456 또는 VIN 17자리" type="text" autocomplete="off" required/>
        <button type="submit" class="bg-amber-400 hover:bg-amber-300 text-slate-900 px-lg py-3 rounded-full font-bold active:scale-95 transition shadow">${t('무료 조회', 'Check free')}</button>
      </form>
      <a href="/preview/free/" class="inline-block mt-md text-[13px] text-white/90 underline underline-offset-4 decoration-white/40 hover:decoration-white">${t('먼저 결과 예시 보기 →', 'See a sample result first →')}</a>
      <p class="photo-credit !text-white/55 mt-lg" data-noi18n>${credit(ph)}</p>
    </div>
  </section>`;
}

function situations() {
  const items = [
    ['/buy/', '살 때', 'Buying', '매물 보러 가기 전 확인할 것', 'What to check before viewing a car', 'kr-tollgate'],
    ['/repair/', '아플 때', 'Repairs', '경고등·이상 소음 대처', 'Warning lights and odd noises', 'gauges'],
    ['/care/', '관리', 'Care', '정비 주기·타이어·검사', 'Maintenance, tires, inspections', 'tire-stack'],
    ['/news', '소식', 'News', '신차·리콜·업계 뉴스', 'New cars, recalls, industry news', 'trails-avenue'],
  ];
  return `  <!-- 상황별 입구: 사진 카드 4개 -->
  <section class="max-w-5xl mx-auto px-margin pt-xl" aria-labelledby="situ-title">
    <h2 id="situ-title" class="text-xl font-bold">${t('지금 어떤 상황이세요?', 'What do you need right now?')}</h2>
    <div class="mt-md grid grid-cols-2 md:grid-cols-4 gap-sm md:gap-md">
${items.map(([href, ko, en, dko, den, ph]) => `      <a href="${href}" class="group relative isolate overflow-hidden rounded-2xl aspect-[4/5] md:aspect-[3/4] flex flex-col justify-end p-md text-white shadow-card">
        <div class="absolute inset-0 -z-10">${img(ph, { cls: 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500', sizes: '(min-width:768px) 25vw, 50vw' })}</div>
        <div class="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        <span class="text-xl md:text-2xl font-extrabold">${t(ko, en)}</span>
        <span class="text-[12px] md:text-[13px] text-white/85 mt-0.5 leading-snug">${t(dko, den)}</span>
        <span class="material-symbols-outlined absolute top-3 right-3 text-white/85 text-[20px]">arrow_outward</span>
      </a>`).join('\n')}
    </div>
  </section>`;
}

function trust() {
  const s = [
    ['941', '건', 'entries', '공식 리콜 데이터', 'Official recall data', '한국교통안전공단', 'KOTSA'],
    ['17', '자리', 'digits', 'VIN 해독', 'VIN decoding', 'ISO 3779 국제표준', 'ISO 3779 standard'],
    ['₩0', '', '', '모든 조회 무료', 'All lookups free', '결제·로그인 없음', 'No payment or login'],
    ['30', '초', 'sec', '평균 조회 시간', 'Avg. lookup time', '국산·수입차 모두', 'Domestic & imported'],
  ];
  return `  <!-- 신뢰 지표: 숫자 4개 한 줄 -->
  <section class="max-w-5xl mx-auto px-margin pt-xl" aria-labelledby="trust-title">
    <h2 id="trust-title" class="sr-only">${t('데이터 출처와 신뢰성', 'Data sources & reliability')}</h2>
    <dl class="grid grid-cols-2 md:grid-cols-4 gap-sm">
${s.map(([n, u, uen, ko, en, sub, suben]) => `      <div class="flex flex-col bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/60 rounded-2xl p-md">
        <dt class="text-[13px] font-bold text-on-surface order-2">${t(ko, en)}</dt>
        <dd class="order-1 text-3xl font-extrabold text-primary-container dark:text-primary tabular-nums leading-none mb-1">${n}${u ? `<span class="text-base font-bold ml-0.5">${t(u, uen)}</span>` : ''}</dd>
        <dd class="order-3 text-[12px] text-muted mt-0.5">${t(sub, suben)}</dd>
      </div>`).join('\n')}
    </dl>
  </section>`;
}

function guidesSection() {
  const picks = ['used-car-checklist', 'engine-warning-light', 'tire-replacement-guide', 'flood-damaged-car', 'vehicle-inspection-guide'].map(guide);
  const [f, ...rest] = picks;
  const chip = (g) => `<span class="text-[11px] font-bold text-primary-container dark:text-primary">${t(HUB_LABEL[g.hub], { buy: 'Buying', repair: 'Repairs', care: 'Care' }[g.hub])}</span>`;
  return `  <!-- 가이드: 대표 1 + 작은 카드 4 (Motor1식 크기 다른 카드, 슬라이더 없음) -->
  <section class="max-w-5xl mx-auto px-margin pt-xl" aria-labelledby="guide-title">
    <div class="flex items-end justify-between">
      <h2 id="guide-title" class="text-xl font-bold">${t('많이 보는 가이드', 'Popular guides')}</h2>
      <a href="/blog/" class="text-[13px] font-semibold text-primary-container dark:text-primary hover:underline">${t('전체 가이드 →', 'All guides →')}</a>
    </div>
    <div class="mt-md grid gap-md md:grid-cols-4">
      <a href="/blog/${f.slug}/" class="group flex flex-col md:col-span-2 md:row-span-2 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/60 rounded-3xl overflow-hidden hover:shadow-card transition">
        <div class="photo-frame md:flex-1 md:aspect-auto md:min-h-[280px]">${img(f.photo, { cls: 'group-hover:scale-[1.02] transition-transform duration-500', sizes: '(min-width:768px) 50vw, 100vw' })}</div>
        <div class="p-lg">
          ${chip(f)}
          <h3 class="mt-1 text-xl font-bold leading-snug group-hover:underline underline-offset-4" data-noi18n>${esc(f.title)}</h3>
          <p class="mt-sm text-[14px] text-on-surface-variant leading-relaxed line-clamp-2" data-noi18n>${esc(f.desc)}</p>
        </div>
      </a>
${rest.map((g) => `      <a href="/blog/${g.slug}/" class="group flex md:flex-col gap-3 md:gap-0 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/60 rounded-2xl overflow-hidden hover:shadow-card transition">
        <div class="photo-frame w-28 md:w-full flex-shrink-0 aspect-[4/3] md:aspect-video">${img(g.photo, { cls: 'group-hover:scale-[1.03] transition-transform duration-500', sizes: '(min-width:768px) 25vw, 112px' })}</div>
        <div class="py-3 pr-3 md:p-md min-w-0">
          ${chip(g)}
          <h3 class="mt-0.5 text-[15px] font-bold leading-snug group-hover:underline underline-offset-4" data-noi18n>${esc(g.short)}</h3>
        </div>
      </a>`).join('\n')}
    </div>
  </section>`;
}

function members() {
  const f = [
    ['campaign', '내 차 알림', 'My-car alerts', '리콜·정기검사·소모품 교체 시기', 'Recalls, inspections and maintenance timing'],
    ['new_releases', '신차 출시 알림', 'New-car launch alerts', '관심 차종이 나오면 바로', 'The moment a model you follow launches'],
    ['description', '매물 서류 판독 베타', 'Listing document check (beta)', '성능점검기록부·보험이력 위험 신호 (회원 무료)', 'Red flags in inspection and insurance records (free for members)'],
    ['bookmark', '매물 저장·비교', 'Save & compare listings', '보고 있는 차 2~3대 나란히', 'Put 2–3 cars side by side'],
  ];
  return `  <!-- 회원 기능: 한 카드, 버튼 하나 -->
  <section id="sample-preview" class="max-w-5xl mx-auto px-margin pt-xl" aria-labelledby="member-title">
    <div class="rounded-3xl bg-primary-container text-white dark:bg-surface-container dark:text-on-surface dark:border dark:border-outline-variant p-lg md:p-xl md:flex md:items-center md:gap-xl">
      <div class="md:w-2/5">
        <span class="inline-block text-[11px] font-bold bg-white/15 dark:bg-primary/15 dark:text-primary px-2.5 py-1 rounded-full">${t('준비 중', 'Coming soon')}</span>
        <h2 id="member-title" class="mt-sm text-2xl font-extrabold leading-snug">${t('내 차를 등록하면', 'Register your car and')}<br/>${t('필요한 때 알려드려요', "we'll tell you when it matters")}</h2>
        <p class="mt-sm text-[14px] opacity-85">${t('카카오·이메일로 간편하게 가입해요. 지금의 무료 조회는 그대로 무료예요.', 'Sign up with Kakao or email. Today\'s free lookups stay free.')}</p>
      </div>
      <ul class="mt-lg md:mt-0 md:flex-1 grid sm:grid-cols-2 gap-sm">
${f.map(([ic, ko, en, dko, den]) => `        <li class="flex gap-2 bg-white/10 dark:bg-surface-container-high rounded-2xl p-md"><span class="material-symbols-outlined text-[22px] flex-shrink-0" style="font-variation-settings:'FILL' 1;">${ic}</span><span><span class="block font-bold text-[14px]">${t(ko, en)}</span><span class="block text-[12px] opacity-80 mt-0.5">${t(dko, den)}</span></span></li>`).join('\n')}
      </ul>
    </div>
  </section>`;
}

// ── 조립 ────────────────────────────────────────────────────────
let s = fs.readFileSync(FILE, 'utf8');

// FAQ 구역은 그대로 유지 (구조화 데이터와 문구가 맞물려 있음)
const faqStart = s.indexOf('  <!-- FAQ -->');
const faqEnd = s.indexOf('</section>', faqStart) + '</section>'.length;
if (faqStart < 0) throw new Error('FAQ 구역 없음');
const faq = s.slice(faqStart, faqEnd)
  .replace('<section class="px-margin py-lg mb-xl"', '<section class="max-w-3xl mx-auto px-margin pt-xl"')
  .replace(/<h2 id="faq-heading" class="[^"]*">/, '<h2 id="faq-heading" class="text-xl font-bold mb-md">');

const main = `  <main id="main" class="pt-14">

${hero()}

${situations()}

${trust()}

${guidesSection()}

${members()}

${faq}
  </main>

  <!-- @footer -->
  <!-- /@footer -->

`;
const a = s.indexOf('  <main id="main"');
const b = s.indexOf('  <!-- BottomNav -->');
if (a < 0 || b < 0) throw new Error('홈 구조를 찾지 못함');
s = s.slice(0, a) + main + s.slice(b);

// 이전 하단 CTA 폼 처리 코드 제거 (해당 폼이 없어짐)
s = s.replace(/\n    var c=document\.querySelector\('form\[aria-label="하단 차량 조회"\]'\);[\s\S]*?\}\);\}/, '');

// I18N 사전: 기존 항목 중 본문에 남은 것 + 새 문구
const pair = /"((?:[^"\\]|\\.)*)":"((?:[^"\\]|\\.)*)"/g;
const iA = s.indexOf('    var I18N = {');
const iB = s.indexOf('\n    };', iA);
const old = new Map([...s.slice(iA, iB).matchAll(pair)].map((m) => [JSON.parse(`"${m[1]}"`), JSON.parse(`"${m[2]}"`)]));
const bodyText = s.slice(s.indexOf('<body'), s.indexOf('<!-- ACHAJA i18n'))
  .replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, '\n')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const nodes = new Set(bodyText.split('\n').map((x) => x.trim()).filter(Boolean));
const merged = new Map();
for (const [k, v] of old) if (nodes.has(k)) merged.set(k, v);
for (const [k, v] of PAIRS) merged.set(k, v);
const dict = [...merged].map(([k, v]) => `      ${JSON.stringify(k)}:${JSON.stringify(v)}`).join(',\n');
s = s.slice(0, iA) + `    var I18N = {\n${dict}\n` + s.slice(iB + 1);
s = s.replace('var PH = { "hero-q": "e.g. 12가3456 or a 17-digit VIN" };', 'var PH = { "hero-q": "e.g. 12가3456 or a 17-digit VIN" };');

fs.writeFileSync(FILE, s);
const missing = [...nodes].filter((k) => /[가-힣]/.test(k) && !merged.has(k));
console.log(`홈 생성 완료 · 번역 ${merged.size}개${missing.length ? ` · 번역 없는 문구 ${missing.length}개:\n  ` + missing.slice(0, 40).join('\n  ') : ''}`);
