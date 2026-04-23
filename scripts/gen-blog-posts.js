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
<script async src="https://www.googletagmanager.com/gtag/js?id=G-4GJW4DK0XK"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-4GJW4DK0XK');</script>
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

<main class="pt-14 max-w-3xl mx-auto px-margin">

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
];

for (const p of posts) {
  const dir = path.join(BLOG_ROOT, p.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const html = SHARED_HEAD(p);
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log(`✓ ${p.slug}/index.html`);
}
console.log(`\n총 ${posts.length}편 생성 완료.`);
