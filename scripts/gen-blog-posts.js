#!/usr/bin/env node
// 블로그 포스트 일괄 생성 스크립트 (개발 도구용)
// 템플릿 + posts 배열에서 각 /blog/<slug>/index.html 생성

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_ROOT = path.resolve(__dirname, '..', 'blog');

const SHARED_HEAD = (p) => `<!DOCTYPE html>
<html lang="ko"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<title>${p.title} — ACHAJA 블로그</title>
<meta name="description" content="${p.description}"/>
<meta name="author" content="ACHAJA"/>
<meta name="theme-color" content="#003178"/>
<meta name="robots" content="index,follow"/>
<link rel="canonical" href="https://achaja.net/blog/${p.slug}/"/>
<link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
<link rel="apple-touch-icon" href="/apple-touch-icon.svg"/>
<link rel="manifest" href="/manifest.webmanifest"/>
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-VZSZCMMFK0"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-VZSZCMMFK0');</script>
<meta property="og:type" content="article"/>
<meta property="og:site_name" content="ACHAJA"/>
<meta property="og:locale" content="ko_KR"/>
<meta property="og:url" content="https://achaja.net/blog/${p.slug}/"/>
<meta property="og:title" content="${p.title}"/>
<meta property="og:description" content="${p.ogDesc || p.description}"/>
<meta property="og:image" content="https://achaja.net/og-image.png"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${p.title}"/>
<meta name="twitter:description" content="${p.ogDesc || p.description}"/>
<meta name="twitter:image" content="https://achaja.net/og-image.png"/>
<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
{"@type":"BlogPosting","headline":"${p.title}","description":"${p.description}","image":"https://achaja.net/og-image.png","author":{"@type":"Organization","name":"ACHAJA"},"publisher":{"@type":"Organization","name":"ACHAJA","logo":{"@type":"ImageObject","url":"https://achaja.net/og-image.png"}},"datePublished":"2026-04-23","dateModified":"2026-04-23","mainEntityOfPage":{"@type":"WebPage","@id":"https://achaja.net/blog/${p.slug}/"},"inLanguage":"ko-KR"},
{"@type":"BreadcrumbList","itemListElement":[
{"@type":"ListItem","position":1,"name":"홈","item":"https://achaja.net/"},
{"@type":"ListItem","position":2,"name":"블로그","item":"https://achaja.net/blog/"},
{"@type":"ListItem","position":3,"name":"${p.title}","item":"https://achaja.net/blog/${p.slug}/"}
]}
]}
</script>
<script>(function(){var s=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(!s&&d))document.documentElement.classList.add('dark');})();</script>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
:root{--c-primary:0 49 120;--c-primary-container:13 71 161;--c-on-primary:255 255 255;--c-background:248 249 250;--c-surface:248 249 250;--c-surface-container:237 238 239;--c-surface-container-low:243 244 245;--c-on-surface:25 28 29;--c-on-surface-variant:67 70 82;--c-outline:115 119 131;--c-outline-variant:195 198 212;--c-header-bg:248 249 250;--c-nav-bg:255 255 255;--c-app-border:225 227 228;--c-muted:100 116 139;--c-muted-strong:71 85 105;--c-active-bg:219 234 254;}
html.dark{--c-primary:176 198 255;--c-primary-container:0 49 120;--c-on-primary:0 45 111;--c-background:18 19 24;--c-surface:18 19 24;--c-surface-container:30 31 36;--c-surface-container-low:26 27 32;--c-on-surface:226 226 232;--c-on-surface-variant:196 198 210;--c-outline:142 144 156;--c-outline-variant:67 70 81;--c-header-bg:2 6 23;--c-nav-bg:15 23 42;--c-app-border:39 39 42;--c-muted:161 161 170;--c-muted-strong:82 82 91;--c-active-bg:30 58 138;}
.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;}
body{min-height:100dvh;}
.pb-safe{padding-bottom:env(safe-area-inset-bottom);}
.prose h2{font-family:Manrope,sans-serif;font-weight:600;font-size:1.25rem;line-height:1.75rem;margin-top:2rem;margin-bottom:0.75rem;}
.prose h3{font-family:Manrope,sans-serif;font-weight:600;font-size:1rem;line-height:1.5rem;margin-top:1.5rem;margin-bottom:0.5rem;}
.prose p{font-size:0.95rem;line-height:1.75rem;margin-bottom:1rem;}
.prose ul{margin-bottom:1rem;padding-left:1.25rem;}
.prose li{font-size:0.95rem;line-height:1.6rem;margin-bottom:0.375rem;list-style:disc;}
.prose ol{margin-bottom:1rem;padding-left:1.5rem;}
.prose ol li{font-size:0.95rem;line-height:1.6rem;margin-bottom:0.5rem;list-style:decimal;}
.prose strong{font-weight:600;color:rgb(var(--c-primary-container));}
html.dark .prose strong{color:rgb(var(--c-primary));}
.prose table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:0.85rem;}
.prose th,.prose td{border:1px solid rgb(var(--c-outline-variant));padding:0.5rem;text-align:left;}
.prose th{background:rgb(var(--c-surface-container));font-weight:600;}
</style>
<script>tailwind.config={darkMode:"class",theme:{extend:{colors:{"primary":"rgb(var(--c-primary)/<alpha-value>)","primary-container":"rgb(var(--c-primary-container)/<alpha-value>)","background":"rgb(var(--c-background)/<alpha-value>)","surface":"rgb(var(--c-surface)/<alpha-value>)","surface-container":"rgb(var(--c-surface-container)/<alpha-value>)","surface-container-low":"rgb(var(--c-surface-container-low)/<alpha-value>)","on-surface":"rgb(var(--c-on-surface)/<alpha-value>)","on-surface-variant":"rgb(var(--c-on-surface-variant)/<alpha-value>)","outline":"rgb(var(--c-outline)/<alpha-value>)","outline-variant":"rgb(var(--c-outline-variant)/<alpha-value>)","header-bg":"rgb(var(--c-header-bg)/<alpha-value>)","nav-bg":"rgb(var(--c-nav-bg)/<alpha-value>)","app-border":"rgb(var(--c-app-border)/<alpha-value>)","muted":"rgb(var(--c-muted)/<alpha-value>)","muted-strong":"rgb(var(--c-muted-strong)/<alpha-value>)","active-bg":"rgb(var(--c-active-bg)/<alpha-value>)"},fontFamily:{"headline":["Manrope"],"body":["Inter"]},spacing:{"lg":"24px","xs":"4px","md":"16px","sm":"8px","xl":"32px","margin":"20px"}}}};</script>
</head>
<body class="bg-background text-on-surface font-body min-h-screen pb-24">
<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary-container focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold">본문으로 건너뛰기</a>

<header class="fixed top-0 left-0 right-0 z-50 bg-header-bg/85 backdrop-blur-md border-b border-app-border">
  <div class="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 h-14">
    <a href="/" class="flex items-center gap-2"><span class="font-headline text-lg font-bold tracking-tight text-primary-container dark:text-primary">ACHAJA</span></a>
    <nav class="hidden md:flex items-center gap-1">
      <a href="/" class="text-muted hover:text-on-surface font-headline text-xs font-semibold px-3 py-1.5 rounded-lg">홈</a>
      <a href="/news" class="text-muted hover:text-on-surface font-headline text-xs font-semibold px-3 py-1.5 rounded-lg">뉴스</a>
      <a href="/blog/" class="text-primary-container dark:text-primary bg-active-bg/40 dark:bg-active-bg/20 font-headline text-xs font-bold px-3 py-1.5 rounded-lg">블로그</a>
      <a href="/history" class="text-muted hover:text-on-surface font-headline text-xs font-semibold px-3 py-1.5 rounded-lg">이력조회</a>
      <a href="/parts" class="text-muted hover:text-on-surface font-headline text-xs font-semibold px-3 py-1.5 rounded-lg">리콜</a>
      <a href="/my" class="text-muted hover:text-on-surface font-headline text-xs font-semibold px-3 py-1.5 rounded-lg">마이</a>
    </nav>
    <div class="flex items-center gap-1">
      <button onclick="toggleTheme()" aria-label="테마 전환" class="p-2 rounded-lg text-muted"><span class="material-symbols-outlined dark:hidden">dark_mode</span><span class="material-symbols-outlined hidden dark:inline">light_mode</span></button>
      <a href="/my" aria-label="내 프로필" class="p-2 rounded-lg text-muted"><span class="material-symbols-outlined">account_circle</span></a>
    </div>
  </div>
</header>

<main id="main" class="pt-14 max-w-3xl mx-auto px-margin">

<nav aria-label="breadcrumb" class="pt-lg text-xs text-muted">
  <a href="/" class="hover:underline">홈</a> / <a href="/blog/" class="hover:underline">블로그</a> / <span class="text-on-surface">${p.breadcrumb}</span>
</nav>

<article class="py-lg prose">
  <header class="mb-lg pb-md border-b border-outline-variant">
    <div class="flex items-center gap-2 mb-sm"><span class="material-symbols-outlined text-primary-container dark:text-primary">${p.icon}</span><span class="text-xs text-muted">${p.category}</span></div>
    <h1 class="font-headline text-2xl md:text-3xl font-semibold tracking-tight leading-tight mb-sm">${p.title}</h1>
    <p class="text-xs text-muted">2026년 4월 23일 · ACHAJA 에디터 · 약 ${p.readTime}분 소요</p>
  </header>

${p.body}

  <div class="my-xl p-lg bg-surface-container rounded-2xl border border-outline-variant">
    <h3 class="font-headline font-semibold text-base mb-sm">${p.ctaTitle}</h3>
    <p class="text-sm text-on-surface-variant mb-md">${p.ctaText}</p>
    <a href="${p.ctaHref}" class="inline-block bg-primary-container dark:bg-primary text-white dark:text-on-primary px-md py-2 rounded-xl text-sm font-bold hover:opacity-90 transition">${p.ctaBtn} →</a>
  </div>
</article>

<section class="pb-xl">
  <h2 class="font-headline text-lg font-semibold mb-md">함께 보면 좋은 글</h2>
  <div class="grid gap-md md:grid-cols-2">
${p.related.map(r => `    <a href="${r.href}" class="block bg-surface-container-low border border-outline-variant rounded-2xl p-md hover:border-primary-container dark:hover:border-primary transition-colors">
      <div class="text-xs text-muted mb-xs">${r.cat}</div>
      <div class="font-headline font-semibold text-sm">${r.title}</div>
    </a>`).join('\n')}
  </div>
</section>

<footer class="px-margin py-lg border-t border-app-border text-center mt-xl">
  <p class="text-[10px] text-muted-strong">데이터 출처: 국토교통부, 보험개발원, 한국교통안전공단</p>
  <p class="mt-xs text-[10px] text-muted">© 2026 ACHAJA Corp. All Rights Reserved.</p>
  <p class="mt-xs text-[10px] text-muted"><a href="/about/" class="hover:underline">소개</a> · <a href="/terms/" class="hover:underline">이용약관</a> · <a href="/privacy/" class="hover:underline">개인정보처리방침</a></p>
</footer>

</main>

<nav class="fixed bottom-0 left-0 w-full z-50 bg-nav-bg border-t border-app-border shadow-lg">
  <div class="max-w-2xl mx-auto flex justify-around items-stretch h-16 px-2 pb-safe">
    <a href="/" class="flex-1 flex flex-col items-center justify-center text-muted"><span class="material-symbols-outlined">home</span><span class="font-headline text-[10px] font-medium mt-0.5">홈</span></a>
    <a href="/news" class="flex-1 flex flex-col items-center justify-center text-muted"><span class="material-symbols-outlined">newspaper</span><span class="font-headline text-[10px] font-medium mt-0.5">뉴스</span></a>
    <a href="/blog/" class="flex-1 flex flex-col items-center justify-center text-primary-container dark:text-primary"><span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">article</span><span class="font-headline text-[10px] font-bold mt-0.5">블로그</span></a>
    <a href="/history" class="flex-1 flex flex-col items-center justify-center text-muted"><span class="material-symbols-outlined">history</span><span class="font-headline text-[10px] font-medium mt-0.5">이력조회</span></a>
    <a href="/parts" class="flex-1 flex flex-col items-center justify-center text-muted"><span class="material-symbols-outlined">campaign</span><span class="font-headline text-[10px] font-medium mt-0.5">리콜</span></a>
  </div>
</nav>

<script>function toggleTheme(){var h=document.documentElement;h.classList.toggle('dark');localStorage.setItem('theme',h.classList.contains('dark')?'dark':'light');}</script>
</body></html>
`;

const posts = [
  {
    slug: 'ev-battery-life',
    title: '전기차 배터리 수명과 중고 구매 시 꼭 체크할 것',
    breadcrumb: '전기차 배터리',
    description: '전기차 배터리 수명의 실제 기준과 중고 전기차 구매 시 배터리 상태(SOH) 확인 방법. 보증 승계, 배터리 리스 포함 체크.',
    ogDesc: '전기차 배터리 수명 실측과 중고 구매 필수 체크 포인트.',
    category: '전기차 가이드',
    icon: 'battery_charging_full',
    readTime: 4,
    ctaTitle: 'ACHAJA 이력조회로 배터리 관련 리콜도 확인',
    ctaText: '전기차 주요 리콜은 배터리·BMS 관련이 대부분. 차량번호로 리콜 이력까지 한 번에.',
    ctaBtn: '이력조회 바로가기',
    ctaHref: '/history',
    related: [
      { href: '/blog/used-car-checklist/', cat: '구매 체크리스트', title: '중고차 살 때 꼭 확인해야 할 10가지' },
      { href: '/blog/recall-check-guide/', cat: '리콜 조회', title: '자동차 리콜 조회하는 법' },
    ],
    body: `  <p>전기차는 내연기관 차량과 달리 <strong>배터리가 전체 가치의 30~40%</strong>를 차지합니다. 따라서 중고 전기차 구매 시 배터리 상태를 제대로 파악하지 못하면 수백만 원을 손해볼 수 있습니다. 이 글에서는 배터리 수명의 실제 기준과, 중고 구매 시 반드시 확인해야 할 포인트를 정리했습니다.</p>

  <h2>전기차 배터리의 현실적 수명</h2>
  <p>제조사가 공식적으로 보증하는 배터리 수명은 <strong>8년 또는 16만 km(SOH 70% 이상 유지)</strong>입니다. 실제로는 일반적인 사용 패턴에서 10~15년, 20만 km 이상 사용해도 일상 주행에는 문제가 없는 경우가 많습니다.</p>
  <p>다만 아래 조건에서는 배터리 열화가 빨라집니다.</p>
  <ul>
    <li>급속 충전 비율이 높은 차량 (90% 이상)</li>
    <li>고온 지역에서 장기 주차</li>
    <li>0~100% 완전 충·방전 반복</li>
    <li>택시·렌터카·배달 용도로 사용된 이력</li>
  </ul>

  <h2>SOH(State of Health) 확인이 핵심</h2>
  <p>배터리의 실제 건강 상태는 <strong>SOH</strong>로 측정합니다. 100%가 신차 기준이며, 80% 이상이면 양호, 70% 이하면 보증 범위 내 교체 대상입니다.</p>
  <p>SOH 확인 방법은 다음과 같습니다.</p>
  <h3>1) 제조사 서비스센터 진단</h3>
  <p>가장 정확한 방법입니다. 현대·기아·테슬라 등 대부분의 브랜드가 공식 서비스센터에서 배터리 진단 리포트를 유료(2~5만 원) 또는 무료로 발급합니다. 구매 전 판매자에게 SOH 리포트 제공을 요구하는 것이 안전합니다.</p>

  <h3>2) OBD-II 진단기 활용</h3>
  <p>스마트폰 OBD 앱(Car Scanner, EV Notify 등)과 동글(1~3만 원)을 연결하면 실시간으로 SOH를 확인할 수 있습니다. 테슬라는 앱 자체에서 최대 주행가능거리를 보고 역산할 수 있습니다.</p>

  <h3>3) 전비(kWh/km)로 간접 확인</h3>
  <p>동일 차종의 신차 공인 전비와 비교해 <strong>20% 이상 나빠졌다면</strong> 배터리 열화를 의심해야 합니다. 겨울철 수치는 제외하고 여름철 평균으로 비교하세요.</p>

  <h2>중고 전기차 구매 체크리스트</h2>
  <ol>
    <li><strong>보증 승계 가능 여부</strong>: 제조사마다 중고 구매 시 보증 승계 조건이 다릅니다. 현대·기아는 대부분 자동 승계, 테슬라는 일부 조건부, 수입 전기차는 승계 불가 경우도 많습니다.</li>
    <li><strong>배터리 리스 차량 주의</strong>: 르노조에 등 일부 모델은 배터리 별도 리스. 차량만 구매해도 월 배터리 사용료를 계속 내야 합니다.</li>
    <li><strong>리콜 이력 확인</strong>: 전기차 리콜 중 배터리·BMS 관련은 안전 직결이므로 반드시 시정 완료 여부 확인.</li>
    <li><strong>충전 이력</strong>: 제조사 커넥티드 앱에 남은 누적 충전 기록(급속·완속 비율)으로 사용 패턴 파악.</li>
    <li><strong>계절별 주행 거리</strong>: 겨울철 주행가능거리가 공인 대비 60% 이하면 열화 의심.</li>
  </ol>

  <h2>배터리 교체 비용 참고</h2>
  <p>만약 배터리 교체가 필요한 경우 비용은 차종별로 다음 수준입니다.</p>
  <ul>
    <li>경형·소형 전기차: 800~1,500만 원</li>
    <li>준중형 (아이오닉5·EV6 등): 1,500~2,500만 원</li>
    <li>중대형·프리미엄: 2,500~5,000만 원</li>
  </ul>
  <p>교체 비용이 차량 가격을 상회할 수 있으므로, 보증 잔여 기간과 SOH는 <strong>구매 가격 협상의 핵심 지표</strong>로 활용하세요.</p>`,
  },

  {
    slug: 'used-car-price-guide',
    title: '중고차 시세 정확하게 계산하는 5가지 방법',
    breadcrumb: '중고차 시세',
    description: '중고차 시세 조회 사이트 비교, 감가 계산 공식, 실거래가 확인법. 합리적 구매가 책정을 위한 실전 가이드.',
    ogDesc: '중고차 시세 파악 5가지 방법과 감가 계산 공식.',
    category: '시세 분석',
    icon: 'monitoring',
    readTime: 4,
    ctaTitle: 'ACHAJA 시세 정밀분석 (1,900원)',
    ctaText: '동급 매물 실거래가와 3년 잔존가치까지 예측해 적정 구매가를 알려드립니다.',
    ctaBtn: '시세 분석 바로가기',
    ctaHref: '/history',
    related: [
      { href: '/blog/used-car-checklist/', cat: '구매 체크리스트', title: '중고차 살 때 꼭 확인해야 할 10가지' },
      { href: '/blog/car-loan-vs-lease/', cat: '구매 방법', title: '자동차 할부 vs 리스 비교' },
    ],
    body: `  <p>중고차 시장에서 같은 차종·연식·주행거리여도 매물마다 가격이 수백만 원씩 차이 납니다. "얼마가 적정한 가격인지" 감이 없다면 호가만 보고 결정해 비싸게 사기 쉽습니다. 이 글에서는 중고차 시세를 정확히 파악하는 5가지 방법을 소개합니다.</p>

  <h2>1. 공식 시세표 확인 — KB차차차·엔카·SK엔카</h2>
  <p>국내 대표 중고차 플랫폼은 각각 자체 시세표를 제공합니다.</p>
  <ul>
    <li><strong>KB차차차 (KB캐피탈)</strong>: 금융권 데이터 기반, 금융감독원 공시 참고치로도 사용.</li>
    <li><strong>엔카·SK엔카</strong>: 매물 등록 건수 기반 실시간 시세.</li>
    <li><strong>카즈</strong>: 전국 매매상사 평균 매입가 참고 가능.</li>
  </ul>
  <p>세 플랫폼의 시세를 평균 내면 왜곡을 줄일 수 있습니다. 시세표상 <strong>"하한가 ~ 상한가"</strong>가 표시되며, 실제 거래는 하한가에 가깝게 이뤄집니다.</p>

  <h2>2. 감가 공식으로 연식 감안</h2>
  <p>차종마다 다르지만 일반적인 중고차 감가는 다음 패턴을 따릅니다.</p>
  <ul>
    <li><strong>1년 차</strong>: 신차 대비 20~25% 감가</li>
    <li><strong>2년 차</strong>: 누적 30~35%</li>
    <li><strong>3년 차</strong>: 누적 40~45%</li>
    <li><strong>5년 차</strong>: 누적 55~60%</li>
    <li><strong>10년 차</strong>: 누적 75~85%</li>
  </ul>
  <p>프리미엄 수입차는 감가가 더 가파릅니다(1년 30%, 3년 50%). 반대로 인기 하이브리드·일부 SUV는 감가가 완만합니다.</p>

  <h2>3. 주행거리 보정</h2>
  <p>같은 연식이라도 주행거리에 따라 시세가 달라집니다. 한국 평균 연간 주행거리는 <strong>15,000km</strong>입니다.</p>
  <ul>
    <li>평균 대비 많음 (+5,000km/년 이상): 시세 -5~10%</li>
    <li>평균 대비 적음 (-5,000km/년 이하): 시세 +3~7%</li>
    <li>극저주행 (-10,000km/년 이하): 의심 신호. 주행거리 조작 확인 필요.</li>
  </ul>

  <h2>4. 옵션·색상·사고이력 조정</h2>
  <p>시세표는 기본형 기준이므로 실제 매물에는 다음 요소를 가감해야 합니다.</p>
  <ul>
    <li><strong>선루프·내비게이션·가죽시트</strong>: +50만 ~ +150만 원</li>
    <li><strong>무채색(검정·회색·흰색)</strong>: 시세 유지, 유채색은 -30~80만 원</li>
    <li><strong>사고이력 (단순 외판 교환)</strong>: -3~8%</li>
    <li><strong>주요 부품 교환 (프레임·골격)</strong>: -15~30%</li>
    <li><strong>침수 이력</strong>: -30~50% (구매 자체 비권장)</li>
  </ul>

  <h2>5. 실거래가 확인 — 자동차365·네이버 중고차</h2>
  <p>호가가 아닌 <strong>실제 성사된 거래가</strong>를 확인하는 것이 가장 정확합니다.</p>
  <ul>
    <li><strong>자동차365 실거래가 조회</strong>: 국토부 등록 데이터 기반, 차종·연식별 평균 거래가 공개.</li>
    <li><strong>네이버 중고차 시세 검색</strong>: 월별 거래 평균 그래프 제공, 계절성 파악 유용.</li>
    <li><strong>매매상사 매입가</strong>: "내 차 팔기" 견적을 받아보면 도매가(매입가)를 알 수 있음. 여기에 100~200만 원 얹은 가격이 소매가.</li>
  </ul>

  <h2>가격 협상의 기준점 활용</h2>
  <p>위 5가지 방법으로 파악한 시세를 종합하면 <strong>"이 매물의 적정 가격 범위"</strong>를 ±50만 원 수준으로 좁힐 수 있습니다. 딜러와 협상 시 이 범위를 제시하며 근거 자료(시세표 캡처, 사고이력 리포트)를 함께 보여주면 무리한 호가를 방어할 수 있습니다.</p>`,
  },

  {
    slug: 'car-tax-calculator',
    title: '자동차 취득세·등록세 계산법과 절세 팁',
    breadcrumb: '자동차 세금',
    description: '취득세 7% 기본, 하이브리드·전기차 감면, 등록세, 공채 매입까지. 중고차·신차 구매 시 실제 지출 미리 계산하는 법.',
    ogDesc: '자동차 구매 시 세금 계산과 합법적 절세 방법.',
    category: '세금·공채',
    icon: 'calculate',
    readTime: 4,
    ctaTitle: '구매 전 세금까지 계산된 총 지출 파악',
    ctaText: '차량 가격만 보고 결정하지 마세요. 세금·공채·보험까지 더한 실제 비용을 확인하세요.',
    ctaBtn: '이력조회로 시세 확인',
    ctaHref: '/history',
    related: [
      { href: '/blog/used-car-price-guide/', cat: '시세 분석', title: '중고차 시세 정확하게 계산하는 5가지 방법' },
      { href: '/blog/car-loan-vs-lease/', cat: '구매 방법', title: '자동차 할부 vs 리스 비교' },
    ],
    body: `  <p>자동차를 구매할 때 차량 가격 외에 <strong>취득세·등록세·공채 매입</strong> 등으로 차량가의 7~10%가 추가로 발생합니다. 중형 세단 기준 200~400만 원 수준이므로, 구매 전 반드시 계산에 포함해야 합니다. 이 글은 세금 구조와 합법적 절세 방법을 정리합니다.</p>

  <h2>자동차 구매 시 발생하는 세금 구조</h2>
  <p>구매 가격 외에 납부하는 항목은 다음과 같습니다.</p>
  <table>
    <thead><tr><th>항목</th><th>세율·비율</th><th>비고</th></tr></thead>
    <tbody>
      <tr><td>취득세</td><td>7% (비영업 승용차)</td><td>영업용·경차·특수차는 별도 세율</td></tr>
      <tr><td>등록세</td><td>취득세에 포함</td><td>2011년부터 취득세로 통합</td></tr>
      <tr><td>공채 매입</td><td>차량가 4~20% (시·도별 상이)</td><td>할인 매각 가능(실제 부담 1~3%)</td></tr>
      <tr><td>자동차세</td><td>배기량·전기차별 차등</td><td>연 1~2회 납부</td></tr>
    </tbody>
  </table>

  <h2>취득세 계산법</h2>
  <p>취득세는 <strong>"취득가액 × 7%"</strong>로 계산합니다. 여기서 취득가액은 부가세 포함 차량 가격입니다.</p>
  <p>예시: 차량가 3,000만 원 (부가세 포함) 승용차</p>
  <ul>
    <li>취득세: 3,000만 원 × 7% = <strong>210만 원</strong></li>
  </ul>
  <p>경차(배기량 1,000cc 이하 + 차폭 1.6m 이하)는 취득세 50만 원까지 감면, 자동차세도 일반차의 1/2 수준입니다.</p>

  <h2>친환경차 취득세 감면</h2>
  <p>2026년 현재 기준으로 다음 감면 혜택이 있습니다.</p>
  <ul>
    <li><strong>전기차</strong>: 최대 140만 원 감면 (차량가에 따라 차등)</li>
    <li><strong>수소차</strong>: 최대 140만 원 감면</li>
    <li><strong>하이브리드</strong>: 최대 40만 원 감면 (기본형만 해당, 고급 트림 제외)</li>
    <li><strong>장애인·유공자</strong>: 일정 조건 충족 시 100% 면제</li>
    <li><strong>다자녀 가구 (3자녀 이상)</strong>: 최대 140만 원 감면 (지자체별 상이)</li>
  </ul>
  <p>감면 혜택은 <strong>차량 등록 시 자동 적용되지 않는 경우</strong>도 있으니, 구청·시청 방문 시 반드시 해당 감면 대상임을 명시해야 합니다.</p>

  <h2>공채 매입이 가장 헷갈리는 항목</h2>
  <p>차량 등록 시 <strong>지역개발공채 또는 도시철도공채</strong>를 의무 매입해야 합니다. 매입 금액은 차종·배기량·지역에 따라 차량가의 4~20%까지 다양합니다.</p>
  <p>하지만 실제로는 <strong>매입 즉시 할인 매각</strong>이 가능합니다. 구청·시청에서 공채 매입과 동시에 할인 매각을 선택하면, 실제 부담은 차량가의 1~3% 수준으로 줄어듭니다.</p>
  <p>공채 할인율은 매일 변동되며, 2026년 4월 기준 대략 15~20% 할인율입니다. 100만 원어치 공채를 매입 후 할인 매각하면 실제 지출은 15~20만 원 정도가 됩니다.</p>

  <h2>자동차세 — 연간 유지비</h2>
  <p>자동차세는 구매 시 일회성이 아닌 <strong>매년 2회(6월·12월)</strong> 납부합니다. 배기량 기준으로 계산됩니다.</p>
  <ul>
    <li>1,000cc 이하: 80원/cc</li>
    <li>1,600cc 이하: 140원/cc</li>
    <li>2,000cc 이하: 200원/cc</li>
    <li>전기차: 일괄 10만 원 (2026년 기준, 향후 인상 예정)</li>
  </ul>
  <p>예: 2,000cc 승용차 → 2,000 × 200 = 연 40만 원 + 교육세 30% = <strong>약 52만 원/년</strong></p>
  <p>연초(1월) 일시 납부 시 <strong>9.15% 할인</strong>이 적용되므로, 여유 자금이 있다면 1월 납부를 추천합니다.</p>

  <h2>중고차 구매 시 세금 주의사항</h2>
  <p>중고차도 신차와 동일한 취득세율(7%)이 적용됩니다. 단, <strong>과세표준은 "실제 거래가"가 아닌 "정부 기준시가"</strong>로 계산하므로, 매매상사에서 제시하는 "세금 포함 가격"이 정확한지 지자체 기준시가와 비교하세요.</p>
  <p>또한 <strong>소유권 이전은 15일 이내에 완료</strong>해야 합니다. 지연 시 과태료(10~50만 원)가 부과됩니다.</p>`,
  },

  {
    slug: 'mileage-fraud',
    title: '중고차 주행거리 조작 의심되는 7가지 신호',
    breadcrumb: '주행거리 조작',
    description: '미터기 조작은 여전히 발생. 실내 마모도, 정비기록, 타이밍벨트 교체 등 7가지 판별 포인트.',
    ogDesc: '중고차 주행거리 조작 판별 7가지 신호와 대응법.',
    category: '미터기 조작',
    icon: 'speed',
    readTime: 3,
    ctaTitle: '주행거리 이력 조회로 조작 의심 차량 사전 차단',
    ctaText: 'ACHAJA는 검사 이력·정비 기록 기준 주행거리 추이를 분석합니다.',
    ctaBtn: '이력조회 바로가기',
    ctaHref: '/history',
    related: [
      { href: '/blog/used-car-checklist/', cat: '구매 체크리스트', title: '중고차 살 때 꼭 확인해야 할 10가지' },
      { href: '/blog/accident-history-check/', cat: '사고이력', title: '중고차 사고이력 조회 무료로 하는 법' },
    ],
    body: `  <p>디지털 계기판 시대가 되었어도 <strong>주행거리 조작(미터기 조작)</strong>은 여전히 발생합니다. 전용 장비로 ECU 값을 변경하면 10만 km 주행 차량을 5만 km로 위장할 수 있습니다. 육안으로 판별할 수 있는 7가지 신호를 소개합니다.</p>

  <h2>1. 운전석 시트·핸들의 마모도</h2>
  <p>운전석 시트와 핸들은 주행거리에 비례해 마모됩니다. <strong>주행거리가 5만 km 미만</strong>이라고 표시된 차량인데:</p>
  <ul>
    <li>시트 좌우 지지부의 가죽·패브릭이 헤졌거나</li>
    <li>핸들 그립 부분이 반들반들하게 닳았거나</li>
    <li>운전석 도어 손잡이 주변 크롬이 벗겨졌다면</li>
  </ul>
  <p>→ 실제 주행거리가 훨씬 많을 가능성이 큽니다.</p>

  <h2>2. 브레이크·가속 페달 고무</h2>
  <p>페달 고무는 한 달에도 수천 번 밟히는 소모품입니다. 주행거리 3만 km 미만 차량은 <strong>페달 고무 표면의 격자무늬</strong>가 선명하게 남아있어야 합니다. 격자가 닳아 평평해졌다면 주행거리 대비 과도한 사용 흔적입니다.</p>

  <h2>3. 정비 이력의 주행거리 기록</h2>
  <p>정비소는 차량 입고 시 주행거리를 기록합니다. <strong>최근 정비 이력보다 현재 주행거리가 적으면</strong> 100% 조작입니다.</p>
  <p>확인 방법:</p>
  <ul>
    <li>보험개발원 카히스토리 (유료, 정비 이력 주행거리 표시)</li>
    <li>매매상사 성능점검기록부 (최근 점검일 주행거리)</li>
    <li>자동차 공식 정비이력 앱 (현대 블루핸즈, 기아 매직카 등)</li>
  </ul>

  <h2>4. 타이밍벨트·오일 교환 이력</h2>
  <p>제조사 권장 교체 주기와 맞지 않으면 의심해야 합니다.</p>
  <ul>
    <li><strong>타이밍벨트</strong>: 보통 8~10만 km에 교체. 5만 km 차량에 "타이밍벨트 교체" 기록이 있다면 실제 주행이 더 많았을 가능성.</li>
    <li><strong>엔진오일</strong>: 1만 km마다 교체. 교체 기록 간격이 짧거나 불규칙하면 이력 조작 가능성.</li>
  </ul>

  <h2>5. 타이어 DOT 코드 vs 주행거리</h2>
  <p>타이어에는 제조 시기를 나타내는 4자리 DOT 코드(예: 2322 = 2022년 23주차 제작)가 찍혀 있습니다.</p>
  <p>평균적으로 <strong>타이어는 4~5만 km 주행 후 교체</strong>합니다. 다음과 같은 경우 의심:</p>
  <ul>
    <li>주행거리 5만 km 미만인데 타이어가 신품으로 교체돼 있거나</li>
    <li>타이어 DOT가 2년 이상 된 것인데 마모가 거의 없는 경우 (장기 주차 후 미터기 조작 가능성)</li>
  </ul>

  <h2>6. 검사소·국토부 이력 조회</h2>
  <p>2년마다 받는 자동차 정기검사 시 주행거리가 기록됩니다. <strong>자동차365 또는 자동차 검사 이력 조회</strong>에서 차량번호로 검사 당시 주행거리를 확인할 수 있습니다.</p>
  <p>직전 검사 때의 주행거리보다 현재가 적다면 명백한 조작 증거입니다.</p>

  <h2>7. 문·연료캡의 스티커</h2>
  <p>정비소는 엔진오일 교환 시 <strong>다음 교환 예정 주행거리</strong>를 적은 스티커를 운전석 문틀이나 엔진룸에 붙입니다. 이 스티커의 숫자보다 현재 주행거리가 적다면 미터기 조작 정황입니다.</p>

  <h2>조작 의심 시 대응 방법</h2>
  <ol>
    <li><strong>계약 보류</strong>: 의심 신호 2개 이상이면 계약하지 마세요. 할인을 제안하더라도 주행거리 조작은 법적 분쟁의 씨앗입니다.</li>
    <li><strong>공식 진단 요구</strong>: 제작사 서비스센터에서 유상(2~5만 원) 진단을 요구. ECU 원본 데이터를 읽어 실제 주행거리를 확인합니다.</li>
    <li><strong>법적 대응</strong>: 구매 후 조작이 확인되면 <strong>자동차관리법 위반</strong>으로 고발 가능. 계약 취소 + 손해배상 청구권이 발생합니다.</li>
  </ol>
  <p>주행거리 조작 적발 시 제작사는 3년 이하 징역 또는 3천만 원 이하 벌금에 처해집니다(자동차관리법 제80조).</p>`,
  },

  {
    slug: 'car-loan-vs-lease',
    title: '자동차 할부 vs 리스 비교 — 뭐가 더 유리할까',
    breadcrumb: '할부 vs 리스',
    description: '자동차 할부와 리스(운용·금융) 차이, 세금 혜택, 총 비용 비교. 개인·법인별 최적 선택 가이드.',
    ogDesc: '할부·운용리스·금융리스 총 비용 비교와 선택 가이드.',
    category: '구매 방법',
    icon: 'credit_card',
    readTime: 4,
    ctaTitle: '구매 전 시세·리스료 비교로 합리적 선택',
    ctaText: '할부·리스 견적을 받기 전 해당 차량의 중고 시세부터 확인하세요.',
    ctaBtn: '시세 조회 바로가기',
    ctaHref: '/history',
    related: [
      { href: '/blog/used-car-price-guide/', cat: '시세 분석', title: '중고차 시세 정확하게 계산하는 5가지 방법' },
      { href: '/blog/car-tax-calculator/', cat: '세금', title: '자동차 취득세·등록세 계산법과 절세 팁' },
    ],
    body: `  <p>새 차를 구매할 때 크게 <strong>일시불, 할부, 리스</strong> 세 가지 선택지가 있습니다. 리스 역시 운용리스와 금융리스로 나뉘어 실질 부담과 세제 혜택이 전혀 다릅니다. 개인·법인별 최적 선택을 위해 핵심 차이를 비교했습니다.</p>

  <h2>세 가지 방식의 기본 구조</h2>
  <table>
    <thead><tr><th>구분</th><th>할부</th><th>운용리스</th><th>금융리스</th></tr></thead>
    <tbody>
      <tr><td>소유권</td><td>구매자</td><td>리스회사</td><td>리스회사 (만기 시 이전 가능)</td></tr>
      <tr><td>계약 기간</td><td>12~60개월</td><td>12~60개월</td><td>36~60개월</td></tr>
      <tr><td>초기 비용</td><td>취득세·공채 포함 차량가 10%</td><td>보증금 10~30%</td><td>보증금 5~20%</td></tr>
      <tr><td>중도 해지</td><td>잔여 원금 일시 상환</td><td>위약금 (월납 ×30~50%)</td><td>위약금 + 이자 손실</td></tr>
      <tr><td>보험</td><td>본인 가입</td><td>리스사 통합 가능</td><td>본인 가입</td></tr>
      <tr><td>세금 혜택</td><td>없음 (개인)</td><td>법인 전액 비용처리</td><td>법인 일부 비용처리</td></tr>
    </tbody>
  </table>

  <h2>개인은 할부가 유리한 이유</h2>
  <p>개인 소비자에게는 대부분의 경우 <strong>할부가 가장 유리</strong>합니다.</p>
  <ul>
    <li>만기 후 차량이 본인 자산 → 추가 비용 없이 계속 사용 가능</li>
    <li>리스 대비 총 지불 금액이 10~20% 저렴</li>
    <li>보험료 인상, 자동차세 등 모든 비용이 본인 부담이지만 투명</li>
    <li>중도 매각이 자유로움 (명의 이전 후 처분 가능)</li>
  </ul>
  <p>단, 할부는 <strong>취득세·등록세·공채를 현금으로 선납</strong>해야 합니다. 3,000만 원 차량 기준 약 250~350만 원 초기 자금이 필요합니다.</p>

  <h2>법인은 운용리스가 핵심 절세 수단</h2>
  <p>법인 사업자는 <strong>운용리스가 압도적으로 유리</strong>합니다.</p>
  <ul>
    <li>월 리스료 전액을 <strong>비용 처리</strong> → 법인세 절감 효과</li>
    <li>초기 자금 부담 적음 (보증금만 납부)</li>
    <li>고정 지출로 예산 관리 용이</li>
    <li>만기 시 반납 옵션 → 감가 리스크 없음</li>
  </ul>
  <p>단, 법인 명의 차량은 <strong>업무 외 사용 금지</strong>가 원칙입니다. 업무용 사용 일지를 기록해야 하며, 기재 소홀 시 세무조사에서 불이익이 있을 수 있습니다.</p>

  <h2>금융리스 — 할부 + 리스의 중간</h2>
  <p>금융리스는 리스회사가 차량을 보유하지만, 만기 시 잔존가치를 지불하면 소유권을 이전받는 구조입니다.</p>
  <ul>
    <li>초기 자금 부담이 할부보다 적음</li>
    <li>만기 시 차량 인수 or 반환 선택 가능</li>
    <li>법인은 비용 처리 일부 가능 (원금 상환분 제외)</li>
    <li>총 비용이 할부와 운용리스의 중간</li>
  </ul>
  <p>개인이 최대 월 부담을 낮추고 싶지만 차량을 계속 타고 싶을 때 고려할 만한 옵션입니다.</p>

  <h2>월 납입금 기준 총 비용 비교 (3,000만 원 차량, 3년 기준)</h2>
  <ul>
    <li><strong>할부 (금리 4.5%)</strong>: 월 89만 원 × 36개월 = 3,204만 원 + 취득세 210만 원 = <strong>3,414만 원</strong></li>
    <li><strong>금융리스 (금리 5.5%)</strong>: 월 75만 원 × 36개월 + 만기 잔가 1,200만 원 = <strong>3,900만 원</strong></li>
    <li><strong>운용리스 (반납)</strong>: 월 65만 원 × 36개월 = <strong>2,340만 원 (차량 무소유)</strong></li>
  </ul>
  <p>운용리스는 숫자만 보면 저렴해 보이지만 차량을 <strong>반납</strong>해야 하므로, 실제로는 월 렌탈 개념입니다. 3년 후에도 차량이 필요하면 다시 계약해야 합니다.</p>

  <h2>선택 가이드 — 상황별 최적 방식</h2>
  <ul>
    <li><strong>여유 자금 있는 개인</strong>: 일시불 (할인 협상 가능, 이자 없음)</li>
    <li><strong>장기 보유 예정 개인</strong>: 할부 (총 비용 최저)</li>
    <li><strong>3~5년마다 차량 교체</strong>: 운용리스 반납 (편리함)</li>
    <li><strong>법인 사업자</strong>: 운용리스 (비용 처리 + 법인세 절감)</li>
    <li><strong>초기 자금 부족한 개인</strong>: 금융리스 (만기 잔가 선택권)</li>
  </ul>

  <h2>계약 전 확인할 4가지</h2>
  <ol>
    <li><strong>APR (연이율)</strong>: "월 얼마"가 아닌 연이율로 비교해야 실제 비용 차이가 보입니다.</li>
    <li><strong>중도 해지 위약금</strong>: 리스는 위약금이 잔여 월납의 50%까지 가는 경우도 있음.</li>
    <li><strong>주행거리 제한</strong>: 운용리스는 연 2만 km 등 제한 있음. 초과 시 km당 100~300원 추가.</li>
    <li><strong>원상복구 비용</strong>: 반납 시 스크래치·찍힘은 본인 부담. 생각보다 크게 나올 수 있음.</li>
  </ol>`,
  },

  {
    slug: 'car-insurance-first-time',
    title: '자동차 보험 첫 가입 가이드 — 보장·특약·할인 전부 정리',
    breadcrumb: '자동차 보험',
    description: '자동차 보험 첫 가입 시 꼭 알아야 할 의무·임의 보장, 자기차량손해, 자기신체사고, 마일리지·블랙박스 할인까지 실전 정리.',
    ogDesc: '자동차 보험 초보자용 보장·특약·할인 완전 정리.',
    category: '자동차 보험',
    icon: 'shield',
    readTime: 6,
    ctaTitle: 'ACHAJA 이력조회로 내 차 리콜·침수 확인',
    ctaText: '보험 가입 전 차량 이력을 확인하면 사고 할증 요인을 미리 파악할 수 있습니다.',
    ctaBtn: '이력조회 바로가기',
    ctaHref: '/history',
    related: [
      { href: '/blog/car-loan-vs-lease/', cat: '구매 방법', title: '자동차 할부 vs 리스 비교' },
      { href: '/blog/car-tax-calculator/', cat: '세금·공채', title: '자동차 취득세·등록세 계산법' },
    ],
    body: `  <p>처음 차를 사면 바로 마주치는 숙제가 <strong>자동차 보험</strong>입니다. 보험사 7~8곳이 비슷한 상품을 팔고, 특약만 수십 개라 처음 보면 무엇을 넣고 빼야 할지 막막합니다. 이 글은 자동차 보험의 기본 구조와 특약 선택, 실제로 효과 있는 할인까지 한 번에 정리합니다.</p>

  <h2>자동차 보험의 3가지 층위</h2>
  <p>자동차 보험은 크게 <strong>의무보험 + 임의보험 + 특약</strong>으로 구성됩니다. 순서대로 이해하면 쉽습니다.</p>
  <h3>1) 의무보험 — 법으로 강제 (미가입 시 운전 불가)</h3>
  <ul>
    <li><strong>대인배상Ⅰ</strong>: 사고로 타인이 사망·부상 시 법정 한도까지 보상.</li>
    <li><strong>대물배상</strong>: 타인의 차·물건을 파손한 경우 2천만 원까지 의무 보장 (부족하므로 임의로 상향).</li>
  </ul>
  <h3>2) 임의보험 — 사실상 모두 가입</h3>
  <ul>
    <li><strong>대인배상Ⅱ (무한)</strong>: 대인Ⅰ 한도 초과분. <strong>반드시 "무한"</strong>으로 설정. 수억 원대 배상 판례가 많아 한도 설정은 위험합니다.</li>
    <li><strong>대물배상 (1~10억 원)</strong>: 고급차·버스 사고 대비 최소 3억, 가능하면 10억 권장. 월 1~2천 원 차이.</li>
    <li><strong>자기신체사고/자동차상해</strong>: 본인·가족 부상 보상. 자동차상해가 보장이 더 폭넓어 추천.</li>
    <li><strong>무보험차상해</strong>: 무보험 차량에 당했을 때 나와 가족 보상.</li>
    <li><strong>자기차량손해 (자차)</strong>: 내 차 수리비. 차량가액 500만 원 이상이면 거의 필수. 자차를 빼면 보험료가 30~40% 싸지지만 사고 시 수리비 전액 자비.</li>
  </ul>

  <h2>자차 보험 — 필수인가 선택인가</h2>
  <p>자차는 보험료의 상당 부분을 차지하므로 합리적 판단이 필요합니다.</p>
  <ul>
    <li><strong>자차 가입 권장</strong>: 신차·준신차, 차량가액 1,000만 원 이상, 주차 환경이 노출된 경우.</li>
    <li><strong>자차 제외 고려</strong>: 10년 이상 구형, 차량가액 300만 원 이하, 수리비를 자비 부담할 여력이 있는 경우.</li>
  </ul>
  <p>자차 보험에서도 자기부담금(예: 20만 원~50만 원)을 설정할 수 있습니다. 부담금을 높이면 보험료가 내려가지만 소액 사고 시 직접 부담이 커집니다.</p>

  <h2>꼭 챙겨야 할 특약 5가지</h2>
  <ol>
    <li><strong>긴급출동 서비스</strong>: 배터리 방전·타이어 펑크·잠금 해제·견인. 연 2~3만 원에 10회 내외 무료 출동. 가성비 최고.</li>
    <li><strong>자동차사고변호사 선임비용</strong>: 중상해 사고로 형사처벌 우려 있을 때 변호사 비용 보장. 월 1천 원 수준.</li>
    <li><strong>다른 자동차 운전 특약</strong>: 렌터카·지인 차 운전 시 보장. 연 1~2만 원.</li>
    <li><strong>법률비용지원</strong>: 차량 보수 분쟁 소송비 보장.</li>
    <li><strong>형사합의금 지원</strong>: 사고로 상대방 중상해·사망 시 합의금 일부 보장.</li>
  </ol>

  <h2>보험료를 낮추는 실질 할인 7가지</h2>
  <ul>
    <li><strong>마일리지 할인</strong>: 연간 주행거리가 1만 km 이하면 최대 38% 할인. 출퇴근 없는 차는 큰 혜택.</li>
    <li><strong>블랙박스 할인</strong>: 3~5%. 대부분 기본 적용.</li>
    <li><strong>안전운전 할인 (T맵·DB운전습관)</strong>: 앱으로 운전 습관 측정 후 최대 10%.</li>
    <li><strong>온라인 가입 (다이렉트)</strong>: 대면 대비 10~15% 저렴. 보장 내용 동일.</li>
    <li><strong>자녀 할인</strong>: 만 12세 이하 자녀 있으면 3~8%.</li>
    <li><strong>사고무경력 할인</strong>: 3년간 무사고 시 자동 적용. 보험사 변경해도 승계됨.</li>
    <li><strong>대중교통 이용 할인</strong>: 후불형 교통카드 실적 연계, 5% 내외.</li>
  </ul>

  <h2>생애 첫 가입자가 흔히 하는 실수</h2>
  <ul>
    <li><strong>최저가만 보고 가입</strong>: 대인Ⅱ를 "한도"로 잡거나 대물을 2천만 원으로 두는 경우. 사고 한 번에 억대 배상 발생 가능.</li>
    <li><strong>특약 다 빼기</strong>: 긴급출동·자상·무보험차상해까지 빼면 막상 필요할 때 전혀 도움 안 됨.</li>
    <li><strong>자차 자기부담금 최저로</strong>: 작은 수리마다 보험 처리하면 다음 해 보험료 할증이 더 큼. 자부담금은 30~50만 원대 권장.</li>
    <li><strong>운전자 범위 "누구나"</strong>: 본인·부부·가족으로 좁힐수록 싸집니다. 꼭 필요한 사람만 지정.</li>
  </ul>

  <h2>연령·운전자 범위 설정 팁</h2>
  <p>보험료는 <strong>최연소 운전자의 연령</strong>으로 결정됩니다. 만 30세 부모가 본인만 설정하면 저렴하지만, 21세 자녀를 포함하면 크게 올라갑니다. 자녀가 가끔만 운전한다면 <strong>임시운전자 확대특약</strong>(일 단위) 고려.</p>
  <p>운전자 범위 옵션은 크게: "1인 한정" → "부부한정" → "가족한정" → "누구나" 순으로 보장이 넓어지며 보험료도 올라갑니다. 실제 운전자만 포함하세요.</p>

  <h2>갱신 전 체크리스트</h2>
  <ol>
    <li>보험료 비교 사이트(보험다모아, 굿모아 등)에서 3~4곳 견적 비교.</li>
    <li>올해 주행거리 10,000 km 이하면 마일리지 특약 사전 등록.</li>
    <li>사고가 있었다면 할증율 확인 (보험개발원 포털에서 조회 가능).</li>
    <li>자녀가 성인이 되면 운전자 범위에서 제외해 보험료 절감.</li>
  </ol>

  <p>자동차 보험은 매년 갱신되므로 한 번 잘 설계해두면 긴 시간 혜택이 누적됩니다. 첫 가입에서 위 체크리스트만 따라가도 연 수십만 원 절감이 가능합니다.</p>`,
  },

  {
    slug: 'tire-replacement-guide',
    title: '타이어 교체 시기와 선택법 — 제조일·트레드·사계절 vs 스노우',
    breadcrumb: '타이어 교체',
    description: '타이어 교체 주기, DOT 제조일 해석, 트레드 마모 측정, 사계절·스노우·서머 타이어 선택 기준까지 실전 타이어 가이드.',
    ogDesc: '타이어 교체 타이밍과 종류 선택 실전 가이드.',
    category: '정비·관리',
    icon: 'trip',
    readTime: 5,
    ctaTitle: '타이어 관련 리콜도 한 번에 확인',
    ctaText: '과거 타이어 공기압 경고·TPMS 관련 리콜이 종종 발생합니다. 내 차도 대상인지 확인.',
    ctaBtn: '리콜 조회',
    ctaHref: '/parts',
    related: [
      { href: '/blog/used-car-checklist/', cat: '구매 체크리스트', title: '중고차 살 때 꼭 확인해야 할 10가지' },
      { href: '/blog/mileage-fraud/', cat: '미터기 조작', title: '중고차 주행거리 조작 의심 7가지 신호' },
    ],
    body: `  <p>타이어는 차량에서 유일하게 <strong>지면과 접촉하는 부품</strong>이라 안전과 직결됩니다. 교체 시기를 놓치면 제동거리가 급격히 길어지고 빗길·눈길에서 사고 위험이 커집니다. 이 글은 타이어 교체 타이밍과 선택 기준을 한 번에 정리합니다.</p>

  <h2>타이어 교체 시기 — 3가지 판단 기준</h2>
  <h3>1) 트레드 깊이 (홈 깊이)</h3>
  <p>신품 타이어의 트레드는 일반적으로 7~8 mm입니다. <strong>1.6 mm 이하</strong>로 줄어들면 법적으로 교체 대상이며, 실제 안전을 위해서는 <strong>3 mm</strong>에서 교체를 권장합니다.</p>
  <p>홈 안쪽에 있는 <strong>마모 한계 표시(삼각형 ▲)</strong>와 같은 높이가 되면 1.6 mm에 도달한 것입니다. 100원 동전을 트레드에 거꾸로 끼웠을 때 이순신 장군의 감투가 보이면 3 mm 이하로 볼 수 있습니다.</p>

  <h3>2) 제조일 (DOT 코드)</h3>
  <p>타이어 옆면에 있는 <strong>DOT 코드</strong> 끝 4자리가 제조 연·주입니다. 예: "DOT XXXX XXXX <strong>2423</strong>"이면 <strong>2023년 24주 (6월 중순)</strong> 제조.</p>
  <p>사용 기간이 <strong>5년 이상</strong>이면 주행거리가 적더라도 고무 경화로 그립이 떨어집니다. 10년 이상 된 타이어는 즉시 교체해야 합니다.</p>

  <h3>3) 눈에 보이는 손상</h3>
  <ul>
    <li>측면 부풀어오름(belt 손상): 폭발 위험, 즉시 교체.</li>
    <li>못·이물질 박힘: 트레드 중앙에 지름 6 mm 이하면 펑크 수리 가능, 측면은 반드시 교체.</li>
    <li>균열(crack): 표면 잔주름은 노화 신호, 깊은 크랙은 교체.</li>
    <li>편마모: 정렬(얼라인먼트) 문제. 원인 수정 후 교체.</li>
  </ul>

  <h2>타이어 종류 — 3가지 기본 카테고리</h2>
  <p>국내 승용차는 대부분 <strong>사계절(All-Season)</strong> 타이어가 기본 장착됩니다. 하지만 주행 환경에 따라 선택지가 다릅니다.</p>
  <ul>
    <li><strong>사계절 타이어</strong>: 여름·겨울 모두 무난. 영하 7도 이하에서는 그립 급락. 서울·수도권 가벼운 겨울 기준 OK.</li>
    <li><strong>서머 타이어 (퍼포먼스)</strong>: 그립·핸들링 최고, 연비 좋음. 영하에서 사실상 사용 불가. 스포츠카 소유자 권장.</li>
    <li><strong>윈터(스노우) 타이어</strong>: 영하에서 고무가 부드러워 설상·빙판 그립 확보. 강원·산간·스키장 이용자 필수. 여름에 쓰면 마모 가속.</li>
  </ul>

  <h2>사이즈와 속도·하중 지수 읽는 법</h2>
  <p>타이어 옆면의 "<strong>225/55R17 97V</strong>" 표기는 다음과 같이 해석합니다.</p>
  <ul>
    <li><strong>225</strong>: 단면 폭(mm)</li>
    <li><strong>55</strong>: 편평비(%) — 폭의 55% 높이</li>
    <li><strong>R</strong>: 래디얼 구조</li>
    <li><strong>17</strong>: 휠 지름(inch)</li>
    <li><strong>97</strong>: 하중 지수 (730 kg/개)</li>
    <li><strong>V</strong>: 속도 지수 (240 km/h 허용)</li>
  </ul>
  <p>차량등록증·운전석 도어 프레임 안쪽 스티커에 <strong>권장 사이즈·공기압</strong>이 적혀 있습니다. 사이즈 변경 시 하중 지수는 원본 이상으로 맞춰야 안전합니다.</p>

  <h2>교체 시 주의사항 4가지</h2>
  <ol>
    <li><strong>4짝 동시 교체 권장</strong>: 2짝만 교체하면 좌우 그립 차이로 눈·빗길 스핀 위험. 비용 문제라면 <strong>같은 축(앞 또는 뒤) 2짝</strong>을 함께 교체하고, 새 타이어를 뒤축에 장착하세요.</li>
    <li><strong>휠 얼라인먼트 재조정</strong>: 교체 후 편마모 예방을 위해 얼라인먼트 측정이 필요합니다. 평균 3~5만 원.</li>
    <li><strong>휠밸런스</strong>: 고속에서 핸들·차체 떨림을 잡아주는 필수 작업. 타이어 교체 시 함께 진행.</li>
    <li><strong>제조일 확인</strong>: "새 타이어"라고 해도 창고 보관 2~3년 된 제품일 수 있음. 결제 전 DOT 코드 확인.</li>
  </ol>

  <h2>공기압 관리 — 가장 쉬운 안전·연비 개선</h2>
  <p>타이어 공기압은 매달 또는 장거리 주행 전 체크하는 것이 좋습니다. 권장값보다 <strong>20% 낮으면 연비가 3~5% 악화</strong>되고 측면 마모가 급격히 증가합니다.</p>
  <p>주유소에 대부분 무료 공기주입기가 있고, 차량에 TPMS(공기압 센서)가 장착된 경우 계기판에 알림이 뜹니다. 여름 주행 전·가을 냉각 후에 특히 재측정하세요.</p>

  <h2>수명 연장 팁 5가지</h2>
  <ul>
    <li>8,000~10,000 km마다 <strong>앞뒤 타이어 위치 교체(rotation)</strong>: 마모 균일화로 수명 20~30% 연장.</li>
    <li>과도한 급제동·급가속 자제.</li>
    <li>최소 월 1회 공기압 점검.</li>
    <li>연석 주행·깊은 포트홀 진입 피하기.</li>
    <li>주차 시 직사광선 피해 고무 노화 지연.</li>
  </ul>

  <p>타이어 교체 비용은 준중형 승용차 기준 1개당 8~15만 원, 4짝 교체 시 공임 포함 40~70만 원 수준입니다. 가격만 보고 저가 모델을 선택하기보다, <strong>제조일·평판·DOT 코드</strong>를 확인해 품질을 확보하는 것이 장기적으로 더 경제적입니다.</p>`,
  },

  {
    slug: 'engine-oil-interval',
    title: '엔진오일 교환 주기와 종류 선택 — 광유·부분합성·합성유 차이',
    breadcrumb: '엔진오일',
    description: '엔진오일 교환 주기(km·개월), 광유·부분합성·합성유의 차이, 점도(SAE) 해석, API·ILSAC 규격까지 실전 정리.',
    ogDesc: '엔진오일 교환 주기와 선택 기준을 한 번에 정리.',
    category: '정비·관리',
    icon: 'oil_barrel',
    readTime: 5,
    ctaTitle: '내 차 리콜 이력 확인',
    ctaText: '엔진 관련 리콜이 있는지 확인해 무상 수리를 놓치지 마세요.',
    ctaBtn: '리콜 조회',
    ctaHref: '/parts',
    related: [
      { href: '/blog/tire-replacement-guide/', cat: '정비·관리', title: '타이어 교체 시기와 선택법' },
      { href: '/blog/used-car-checklist/', cat: '구매 체크리스트', title: '중고차 살 때 꼭 확인해야 할 10가지' },
    ],
    body: `  <p>엔진오일은 엔진 내부 윤활·냉각·청정·밀봉을 담당하는 자동차의 "혈액"입니다. 교환 주기를 놓치면 엔진 마모가 가속되고, 반대로 너무 자주 갈면 불필요한 비용이 듭니다. 이 글은 엔진오일 교환의 현실적 기준과 선택 요령을 정리합니다.</p>

  <h2>교환 주기 — 제조사 공식 vs 현실</h2>
  <p>제조사 매뉴얼은 대부분 <strong>가솔린 10,000~15,000 km / 1년, 디젤 10,000 km / 1년, 가혹조건 5,000~7,500 km</strong>를 권장합니다. 그러나 한국 주행 환경은 "가혹조건"에 해당하는 경우가 많습니다.</p>
  <h3>가혹조건 정의 (매뉴얼에 명시)</h3>
  <ul>
    <li>짧은 거리 반복 주행 (10 km 이하)</li>
    <li>잦은 공회전·정체 구간</li>
    <li>먼지·모래 많은 환경</li>
    <li>영하 기온에서 잦은 시동</li>
    <li>산길·급경사 주행</li>
  </ul>
  <p>출퇴근이 시내 위주이고 거리가 짧다면 대부분 가혹조건에 해당합니다. <strong>7,000~10,000 km 또는 8~10개월</strong>을 권장합니다.</p>

  <h2>엔진오일 3가지 종류와 가격대</h2>
  <ul>
    <li><strong>광유(Mineral)</strong>: 원유 정제 기본 오일. 저렴하지만 열·마찰에 약함. 구형 차량용. 1L 3~7천 원.</li>
    <li><strong>부분합성유(Semi-Synthetic)</strong>: 광유 + 합성유 혼합. 가성비 최고. 1L 7천~1만 원. 일반 준중형·중형 세단에 충분.</li>
    <li><strong>합성유(Fully Synthetic)</strong>: 분자 설계 오일. 열·마찰 저항 최고, 엔진 보호 우수. 1L 1.5만~3만 원. 터보·고성능·고연식 차량 권장.</li>
  </ul>
  <p>대부분의 최신 가솔린 엔진은 합성유가 표준입니다. 매뉴얼에 "Fully Synthetic Only"라고 명시되어 있으면 반드시 합성유 사용.</p>

  <h2>점도(SAE) 해석 — "5W-30"의 의미</h2>
  <p>엔진오일 용기에 적힌 "<strong>5W-30</strong>" 같은 표기는 점도 지수입니다.</p>
  <ul>
    <li><strong>5W</strong>: 저온(Winter) 점도. 숫자 낮을수록 영하에서 잘 흐름.</li>
    <li><strong>30</strong>: 고온 점도 (100℃ 기준). 숫자 높을수록 고온에서 점도 유지.</li>
  </ul>
  <p>한국 일반 승용차는 <strong>0W-20, 5W-30, 5W-40</strong>이 주류입니다. <strong>차량 매뉴얼에 적힌 권장 점도를 무조건 따르세요.</strong> 엉뚱한 점도를 넣으면 연비·엔진 수명에 악영향을 줍니다.</p>

  <h2>API·ILSAC 규격 — 품질 등급</h2>
  <p>SAE는 점도, <strong>API·ILSAC</strong>는 품질 규격입니다.</p>
  <ul>
    <li><strong>API SP</strong>: 2020년 이후 현행 최신 가솔린 규격. LSPI(저속조기점화) 방지.</li>
    <li><strong>API SN+</strong>: 그 전 세대. 터보 GDI 엔진은 SP 이상이 안전.</li>
    <li><strong>ILSAC GF-6</strong>: 북미 기준. 연비·엔진 보호 강화. SP와 세트로 표기되는 경우 많음.</li>
    <li><strong>ACEA A/B, C</strong>: 유럽 규격. 디젤·수입차는 이 규격 요구 사례 많음.</li>
  </ul>
  <p>매뉴얼에 "API SP 이상" 또는 "ACEA C3" 같은 요구 스펙이 적혀 있습니다. 그 미만 등급은 피하세요.</p>

  <h2>직접 교환 vs 정비소 — 비용과 리스크</h2>
  <p>직접 교환은 부품값만 들어서 저렴하지만, 폐유 처리·볼트 토크·오일필터 장착 오류 등 초보에게는 리스크가 있습니다.</p>
  <h3>비용 비교 (준중형 세단 4.5L 기준)</h3>
  <ul>
    <li><strong>직접 교환</strong>: 합성유 4.5L 5~8만 원 + 오일필터 5천 원 + 드레인 플러그 와셔 1천 원 = 6~9만 원.</li>
    <li><strong>블루핸즈·공식 서비스센터</strong>: 합성유 기준 12~18만 원 (공임 포함, 순정 오일·필터).</li>
    <li><strong>사설 카센터</strong>: 8~13만 원 (오일 브랜드 선택 가능).</li>
    <li><strong>엔진오일 전문점(스피드메이트 등)</strong>: 10~15만 원 (빠르고 깔끔).</li>
  </ul>
  <p>중형 SUV·수입차는 30% 이상 비싸집니다. 오일량이 많고 필터가 복잡한 경우가 있기 때문입니다.</p>

  <h2>함께 교체하는 소모품</h2>
  <ul>
    <li><strong>오일필터</strong>: 엔진오일과 함께 매번 교체가 원칙.</li>
    <li><strong>에어필터</strong>: 1~2만 km 또는 1년. 검게 오염되면 교체.</li>
    <li><strong>에어컨필터</strong>: 1~2만 km. 겨울 직전 교체 권장.</li>
    <li><strong>미션오일</strong>: 자동변속기 오일. 60,000~100,000 km마다. 교체 잘못하면 변속기 손상 위험이 있어 정비소 권장.</li>
  </ul>

  <h2>오일 상태 직접 체크 (게이지 확인)</h2>
  <ol>
    <li>평지에 주차 후 시동 끄고 10분 대기 (오일이 오일팬으로 떨어지도록).</li>
    <li>엔진룸의 노란색 손잡이 게이지 뽑아 휴지로 닦음.</li>
    <li>다시 끝까지 꽂았다 뽑음.</li>
    <li>게이지 끝의 MIN~MAX 표시 중 오일이 어디쯤 묻었는지 확인.</li>
    <li>색상 — 황금색/갈색이면 정상, <strong>검은색·점도 없음</strong>이면 교체 시기.</li>
  </ol>

  <h2>주의사항 — 흔한 실수</h2>
  <ul>
    <li><strong>"더 비싼 오일 = 더 좋다"는 오해</strong>: 매뉴얼 스펙을 지키는 것이 먼저. 스펙 넘는 고가 오일은 낭비.</li>
    <li><strong>과주입</strong>: MAX 이상 넣으면 크랭크축이 오일을 저어 저항↑, 오일 거품 발생. 반드시 MIN~MAX 사이.</li>
    <li><strong>오래된 재고</strong>: 엔진오일도 개봉 전 5년 이상 지나면 품질 저하. 구입 날짜 확인.</li>
    <li><strong>주행 직후 교환</strong>: 고온 오일이 위험. 30분~1시간 냉각 후 작업.</li>
  </ul>

  <p>엔진오일은 주기·종류·점도만 제대로 지키면 큰 돈이 들지 않는 관리입니다. 반대로 관리를 소홀히 하면 엔진 오버홀(수백만 원) 원인이 되므로 <strong>차량 매뉴얼 + 본인의 주행 패턴</strong>을 기준으로 교환 일정을 세워두세요.</p>`,
  },

  {
    slug: 'hybrid-vs-ev',
    title: '하이브리드 vs 전기차 — 총 소유비용·연비·유지비 비교',
    breadcrumb: '하이브리드 vs 전기차',
    description: '하이브리드(HEV·PHEV)와 전기차(BEV)의 실제 연비, 보조금, 유지비, 감가까지 5년 총 소유비용(TCO) 관점에서 비교.',
    ogDesc: '하이브리드와 전기차의 5년 총비용을 숫자로 비교.',
    category: '친환경차',
    icon: 'eco',
    readTime: 6,
    ctaTitle: '친환경차 리콜도 확인',
    ctaText: '전기차·하이브리드는 배터리·고전압 관련 리콜 빈도가 높습니다. 내 차 대상 여부 확인.',
    ctaBtn: '리콜 조회',
    ctaHref: '/parts',
    related: [
      { href: '/blog/ev-battery-life/', cat: '전기차', title: '전기차 배터리 수명과 중고 구매 팁' },
      { href: '/blog/car-tax-calculator/', cat: '세금·공채', title: '자동차 취득세·등록세 계산법' },
    ],
    body: `  <p>신차 구매 시 "하이브리드로 갈까, 전기차로 갈까" 고민하는 분이 많습니다. 단순히 연비만 비교하면 답이 안 나옵니다. 차량가, 보조금, 충전·주유비, 유지비, 5년 후 중고가(감가)까지 모두 넣은 <strong>총 소유비용(TCO)</strong> 관점에서 비교해야 정확합니다.</p>

  <h2>먼저 용어 정리 — HEV·PHEV·BEV·FCEV</h2>
  <ul>
    <li><strong>HEV (하이브리드)</strong>: 엔진 + 작은 배터리. 외부 충전 불가. 연비 향상 목적. 예: 쏘나타 하이브리드, 그랜저 하이브리드.</li>
    <li><strong>PHEV (플러그인 하이브리드)</strong>: HEV + 외부 충전 가능한 큰 배터리. 30~80 km는 전기만으로 주행 가능. 예: BMW 530e, 볼보 XC60 T8.</li>
    <li><strong>BEV (순수 전기차)</strong>: 배터리 + 전기 모터. 엔진 없음. 예: 아이오닉5, EV6, 테슬라 모델3.</li>
    <li><strong>FCEV (수소연료전지)</strong>: 수소 + 전기. 국내 현대 넥쏘. 인프라 제약 커서 이 글에서는 제외.</li>
  </ul>

  <h2>1. 차량가 + 보조금 비교 (2026년 기준)</h2>
  <p>동급 중형 SUV 기준 대략적인 구매가를 비교하면 다음과 같습니다.</p>
  <ul>
    <li><strong>가솔린 SUV</strong>: 3,500만 원.</li>
    <li><strong>하이브리드 SUV</strong>: 3,900만 원 (취득세 혜택 200만 원 한도).</li>
    <li><strong>PHEV SUV</strong>: 5,500만 원 (보조금 단계적 폐지, 취득세 감면만).</li>
    <li><strong>BEV SUV</strong>: 5,800만 원 - 국고보조금 300만~690만 + 지자체 200만~500만 = <strong>실구매가 4,800~5,300만 원</strong>.</li>
  </ul>
  <p>초기 비용은 가솔린이 가장 저렴하고, 전기차는 보조금으로 격차를 좁힙니다. 하이브리드는 중간 위치.</p>

  <h2>2. 연료비 비교 (연 15,000 km 기준)</h2>
  <p>2026년 유가·전기요금을 가정해 계산합니다.</p>
  <ul>
    <li><strong>가솔린 12 km/L × 1,700원/L × 15,000 km = 212만 원</strong></li>
    <li><strong>하이브리드 18 km/L × 1,700원/L × 15,000 km = 142만 원</strong></li>
    <li><strong>전기차 5.2 km/kWh, 완속 기준 200원/kWh × 2,884 kWh = 58만 원</strong></li>
    <li><strong>전기차 급속 중심 350원/kWh × 2,884 kWh = 101만 원</strong></li>
  </ul>
  <p>전기차는 완속(가정) 충전 비중에 따라 연료비가 크게 차이납니다. 아파트 지하·직장 완속 충전기 사용이 가능하면 가솔린 대비 <strong>연 150만 원 이상 절약</strong>.</p>

  <h2>3. 유지비 — 정비·소모품</h2>
  <ul>
    <li><strong>가솔린</strong>: 엔진오일·필터·점화플러그·변속기오일. 연 30~40만 원.</li>
    <li><strong>하이브리드</strong>: 엔진 소모품은 가솔린과 동일, 배터리 수명 문제로 10년 후 교체 비용(400~800만 원) 고려.</li>
    <li><strong>전기차</strong>: 엔진 자체가 없어 엔진오일·점화플러그·변속기오일 불필요. 브레이크 패드도 회생제동으로 수명 2배. 연 15~20만 원.</li>
  </ul>
  <p>전기차는 정기 정비 비용이 가장 낮지만, <strong>배터리 교체 리스크</strong>가 있습니다. 8년/16만 km 제조사 보증 내에서는 대부분 교체 없이 사용 가능.</p>

  <h2>4. 세제 혜택 — 취득세·자동차세</h2>
  <ul>
    <li><strong>가솔린</strong>: 취득세 7%.</li>
    <li><strong>하이브리드</strong>: 취득세 40만 원 감면(2026년), 연간 자동차세는 배기량 기준으로 일반과 동일.</li>
    <li><strong>전기차</strong>: 취득세 최대 140만 원 감면, 자동차세 <strong>연 13만 원 정액</strong> (대형 세단도 동일).</li>
  </ul>
  <p>대형 SUV·세단일수록 전기차의 자동차세 혜택이 커집니다. 배기량 3,000 cc 가솔린은 연 자동차세만 80만 원 수준인데 전기차는 13만 원입니다.</p>

  <h2>5. 감가 — 5년 후 중고가</h2>
  <ul>
    <li><strong>가솔린</strong>: 원가 대비 5년 후 <strong>55~60%</strong> 잔존가치.</li>
    <li><strong>하이브리드</strong>: 원가 대비 <strong>60~65%</strong>. 연비 선호로 중고 수요 안정적.</li>
    <li><strong>전기차</strong>: 원가 대비 <strong>40~55%</strong>. 신차 보조금 때문에 원가에서 차감된 실구매가 기준으로 보면 감가가 더 큼. 배터리 수명 불확실성이 중고시장에서 할인 요인.</li>
  </ul>
  <p>감가는 전기차가 가장 큽니다. 단, 모델별 편차가 커서 테슬라·아이오닉5·EV6 같은 인기 모델은 가솔린 수준의 감가율을 보이기도 합니다.</p>

  <h2>5년 TCO(총 소유비용) 종합 비교</h2>
  <p>중형 SUV 기준, 5년간 15,000 km/년 가정:</p>
  <table>
    <thead>
      <tr><th>항목</th><th>가솔린</th><th>하이브리드</th><th>전기차(완속)</th></tr>
    </thead>
    <tbody>
      <tr><td>초기 비용 (보조금 차감)</td><td>3,500만</td><td>3,700만</td><td>4,900만</td></tr>
      <tr><td>5년 연료비</td><td>1,060만</td><td>710만</td><td>290만</td></tr>
      <tr><td>5년 정비비</td><td>175만</td><td>175만</td><td>85만</td></tr>
      <tr><td>5년 자동차세·보험</td><td>600만</td><td>550만</td><td>450만</td></tr>
      <tr><td>5년 후 중고 추정가</td><td>-2,050만</td><td>-2,300만</td><td>-2,450만</td></tr>
      <tr><td><strong>실부담 TCO</strong></td><td><strong>3,285만</strong></td><td><strong>2,835만</strong></td><td><strong>3,275만</strong></td></tr>
    </tbody>
  </table>
  <p>이 가정에서는 <strong>하이브리드가 가장 저렴</strong>합니다. 다만 전기차는 완속 충전 인프라 유무에 따라 TCO가 수백만 원 움직입니다. 급속만 사용한다면 가솔린과 비슷해지고, 아파트 완속 사용이 원활하면 하이브리드보다 저렴해질 수 있습니다.</p>

  <h2>누가 어떤 차를 선택해야 하나</h2>
  <ul>
    <li><strong>하이브리드 추천</strong>: 아파트 완속 충전 불가, 장거리 출장·여행 잦음, 연 2만 km 이상, 5년 이상 보유 예정.</li>
    <li><strong>전기차 추천</strong>: 아파트·직장 완속 확보, 출퇴근 50 km 이내, 중형급 이상 세단·SUV로 자동차세 혜택 극대화.</li>
    <li><strong>PHEV 추천</strong>: 단거리 출퇴근 + 주말 장거리 병행, 충전 인프라 모호, 가솔린→전기 징검다리.</li>
    <li><strong>가솔린 추천</strong>: 초기 비용 부담 최소화, 소형차, 연 1만 km 이하로 연료비 비중 낮음.</li>
  </ul>

  <p>친환경차 선택의 핵심은 <strong>"내가 실제로 쓰는 주행 패턴"</strong>입니다. 연비만 보고 전기차로 갔다가 충전 스트레스로 후회하는 경우도, 하이브리드가 안전한 선택으로 자리 잡은 이유도 모두 이 패턴에서 나옵니다. 5년간 주유·충전·정비 영수증을 계산해보고 결정하세요.</p>`,
  },
];

for (const p of posts) {
  const dir = path.join(BLOG_ROOT, p.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const html = SHARED_HEAD(p);
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log(`✓ ${p.slug}/index.html`);
}
console.log(`\n총 ${posts.length}편 생성 완료.`);
