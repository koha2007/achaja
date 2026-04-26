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
<!-- Microsoft Clarity -->
<script type="text/javascript">(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "whie0ep4hs");</script>
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

<nav class="md:hidden fixed bottom-0 left-0 w-full z-50 bg-nav-bg border-t border-app-border shadow-lg">
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
  {
    slug: 'vehicle-inspection-guide',
    title: '자동차 정기검사 완전정리 — 주기·비용·장소·미수검 과태료',
    breadcrumb: '정기검사',
    description: '자동차 정기검사 주기(2년·1년·6개월), 검사 비용, 종합검사 vs 정기검사 차이, 미수검 과태료 60만 원까지 한 번에 정리.',
    ogDesc: '자동차 정기검사 주기·비용·미수검 과태료 한 번에 정리.',
    category: '정기검사',
    icon: 'fact_check',
    readTime: 4,
    ctaTitle: '검사 전 리콜 미시정 확인',
    ctaText: '리콜 미시정 차량은 정기검사에서 부적합 처리될 수 있습니다. 차량번호로 리콜 여부 먼저 확인하세요.',
    ctaBtn: '리콜 조회',
    ctaHref: '/parts',
    related: [
      { href: '/blog/recall-check-guide/', cat: '리콜 조회', title: '자동차 리콜 조회하는 법' },
      { href: '/blog/engine-oil-interval/', cat: '정비·관리', title: '엔진오일 교환 주기와 종류 선택' },
    ],
    body: `  <p>자동차 정기검사는 <strong>법으로 정한 의무</strong>입니다. 기간 내 검사를 받지 않으면 최대 60만 원 과태료, 등록 말소 절차까지 진행됩니다. 차종·연식별 검사 주기와 비용, 미수검 시 불이익을 한눈에 정리했습니다.</p>

  <h2>검사 주기 — 차종·연식별</h2>
  <table>
    <thead><tr><th>차종</th><th>최초 검사</th><th>이후 주기</th></tr></thead>
    <tbody>
      <tr><td>비사업용 승용차 (4년 이하)</td><td>4년</td><td>2년마다</td></tr>
      <tr><td>비사업용 승용차 (5년 초과)</td><td>—</td><td>2년마다 (대도시 종합검사)</td></tr>
      <tr><td>사업용 승용차</td><td>2년</td><td>1년마다</td></tr>
      <tr><td>경형·소형 화물차</td><td>1년</td><td>1년마다</td></tr>
      <tr><td>중·대형 화물차 (2년 초과)</td><td>—</td><td>6개월마다</td></tr>
      <tr><td>택시·버스 등 사업용</td><td>1년</td><td>6개월~1년</td></tr>
    </tbody>
  </table>
  <p>검사 만료일은 자동차등록증에 표기되며, <strong>유효기간 만료 31일 전부터 60일 후까지 91일</strong> 안에 받으면 됩니다.</p>

  <h2>정기검사 vs 종합검사 차이</h2>
  <ul>
    <li><strong>정기검사</strong>: 안전·배출가스 기본 항목. 비대도시·신차에 적용.</li>
    <li><strong>종합검사</strong>: 정기검사 항목 + 정밀 배출가스 측정. 대기관리권역(서울·6대 광역시 등) 차량 또는 5년 초과 차량 의무.</li>
  </ul>
  <p>2026년 기준 대기관리권역은 수도권 + 부산·대구·광주·대전·울산·세종 + 충남·전남 일부. 이 지역 등록 차량은 정밀검사를 받아야 합니다.</p>

  <h2>검사 비용</h2>
  <ul>
    <li><strong>정기검사</strong>: 23,000원 (경형·소형) ~ 28,000원 (중형)</li>
    <li><strong>종합검사</strong>: 54,000원 (경형) ~ 75,000원 (대형)</li>
    <li><strong>재검사</strong>: 부적합 시 7일 이내 1차 무료, 그 후 정상 비용 부담</li>
  </ul>
  <p>검사장 외 한국교통안전공단 직영 검사소가 더 저렴합니다 (사설 지정 정비공장 대비 5,000~10,000원 차이).</p>

  <h2>검사 받는 곳</h2>
  <h3>1) 한국교통안전공단 직영 검사소</h3>
  <p>전국 56개소. 가격이 가장 저렴하고 객관적이지만 예약이 빨리 차고 거리가 멀 수 있음. <a href="https://www.kotsa.or.kr" target="_blank" rel="noopener" class="underline">kotsa.or.kr</a>에서 예약.</p>

  <h3>2) 민간 지정 정비공장</h3>
  <p>약 1,800개소로 접근성 우수. 일부는 검사와 동시에 정비도 받을 수 있어 부적합 시 즉시 수리 후 재검사 가능. 단, 일부 업체에서 부적합을 부풀려 정비를 권유하는 경우가 있어 비교 필요.</p>

  <h2>검사 항목 — 무엇을 보는가</h2>
  <ul>
    <li>제동장치 (브레이크 작동력·편차)</li>
    <li>조향장치 (얼라인먼트, 휠 유격)</li>
    <li>등화장치 (헤드라이트 광량·각도, 방향지시등)</li>
    <li>배출가스 (CO·HC·NOx 농도, 매연)</li>
    <li>섀시·차체 (부식, 균열, 차고 변형)</li>
    <li>안전벨트, 경음기, 와이퍼, 후사경 작동</li>
    <li>타이어 트레드 1.6 mm 이상</li>
  </ul>

  <h2>미수검 과태료</h2>
  <p>유효기간 만료일 다음날부터 과태료가 부과됩니다.</p>
  <ul>
    <li><strong>30일 이내</strong>: 4만 원</li>
    <li><strong>30~115일</strong>: 4만 원 + 매 3일당 2만 원 추가</li>
    <li><strong>115일 초과</strong>: 최대 60만 원</li>
  </ul>
  <p>또한 2년 이상 미검 시 자동차등록 직권 말소 가능. 보험 갱신 거부, 검사 받지 않은 상태로 사고 시 보험금 감액 등 추가 불이익이 있습니다.</p>

  <h2>검사 통과 팁</h2>
  <ol>
    <li><strong>1주일 전 셀프 점검</strong>: 헤드라이트·후미등·방향지시등 모두 점등, 와이퍼 작동, 경음기 음량.</li>
    <li><strong>엔진 예열 후 입고</strong>: 배출가스는 엔진 정상 온도(80~90℃)에서 측정해야 정확.</li>
    <li><strong>스크래치·튜닝 정리</strong>: 불법 튜닝(머플러 개조, 헤드라이트 색온도 등)은 즉시 부적합.</li>
    <li><strong>리콜 미시정 확인</strong>: 일부 결함 리콜은 검사 부적합 사유. 사전에 ACHAJA 리콜 조회로 확인 후 무상 시정 받고 검사받기.</li>
  </ol>`,
  },
  {
    slug: 'insurance-renewal-tips',
    title: '자동차 보험 갱신 시 절약하는 7가지 방법',
    breadcrumb: '보험 갱신',
    description: '자동차 보험 갱신 시 보험료 평균 15~30% 절약하는 7가지 실전 방법. 비교사이트 활용, 특약 정리, 마일리지·블랙박스 할인, 우량 등급 유지법.',
    ogDesc: '자동차 보험 갱신 시 평균 15~30% 절약하는 7가지 방법.',
    category: '자동차 보험',
    icon: 'savings',
    readTime: 5,
    ctaTitle: '내 차 사고 이력도 함께 확인',
    ctaText: '갱신 전 본인 차량의 사고·정비 이력을 차량번호로 1차 확인. 협상 카드로 활용하세요.',
    ctaBtn: '이력조회',
    ctaHref: '/history',
    related: [
      { href: '/blog/car-insurance-first-time/', cat: '자동차 보험', title: '자동차 보험 첫 가입 가이드' },
      { href: '/blog/accident-history-check/', cat: '사고이력', title: '중고차 사고이력 조회 무료로 하는 법' },
    ],
    body: `  <p>자동차 보험은 매년 갱신하는데, 같은 보장이라도 회사·시기·옵션 조합에 따라 <strong>30% 이상 차이</strong>가 납니다. 갱신 안내장이 도착했을 때 그대로 자동 갱신하지 말고, 다음 7가지를 확인하세요.</p>

  <h2>1. 비교사이트로 5개 이상 견적 받기</h2>
  <p>같은 운전자·차량 조건이라도 손해보험사마다 보험료가 다릅니다. 다이렉트 보험은 설계사 수수료를 빼서 평균 10~15% 저렴합니다.</p>
  <ul>
    <li><strong>비교 채널</strong>: 보험다모아(공식), 보맵, 토스 자동차보험 비교, 다이렉트 보험사 직접 견적</li>
    <li><strong>주의</strong>: 광고비 받은 회사가 상위 노출되는 경우 있으니 최소 2개 비교사이트 활용</li>
    <li><strong>실제 절약</strong>: 평균 15~25만 원/년</li>
  </ul>

  <h2>2. 마일리지·블랙박스 할인 챙기기</h2>
  <ul>
    <li><strong>마일리지 할인</strong>: 연 12,000 km 이하 운행 시 5~30% 할인. 갱신 전 계기판 사진으로 신청.</li>
    <li><strong>블랙박스 할인</strong>: 4~7% 할인. 사진 1장으로 증빙.</li>
    <li><strong>하이브리드·전기차</strong>: 친환경차 할인 3~10% 별도 적용.</li>
    <li><strong>차선이탈경고·자동긴급제동</strong>: ADAS 장착 차량 추가 할인.</li>
  </ul>
  <p>이 4개를 합치면 최대 20%까지 추가 할인 가능. 신청 누락이 가장 흔한 절약 기회입니다.</p>

  <h2>3. 자기부담금 조정</h2>
  <p>자차 보험 자기부담금을 20만 → 50만 원으로 올리면 보험료 약 8~12% 절감. 단, 잦은 사고를 내는 운전자라면 오히려 손해. 무사고 3년 이상이면 자기부담금 상향 권장.</p>

  <h2>4. 불필요한 특약 정리</h2>
  <p>매년 자동 갱신되며 쌓이는 특약을 점검하세요.</p>
  <ul>
    <li><strong>긴급출동</strong>: 보험사 자체 서비스가 충분하다면 별도 특약 불필요</li>
    <li><strong>벌금·형사합의금</strong>: 무사고 운전자는 가입률 낮아짐</li>
    <li><strong>차량 견인 거리 확장</strong>: 출퇴근 거리·여행 패턴에 맞게 조정</li>
    <li><strong>대물 한도</strong>: 1억 → 5억 → 10억은 비용 차이 적으니 10억 권장 (외제차 사고 대비)</li>
  </ul>
  <p>특약 정리만으로 평균 5~10만 원 절감.</p>

  <h2>5. 우량 등급 유지 — 사고 처리 신중히</h2>
  <p>1점짜리 사고도 등급 5단계 하락 가능. 자기 차 단독 사고나 소액 대물 사고는 보험 처리 대신 자비 처리가 유리한 경우가 많습니다.</p>
  <ul>
    <li><strong>50만 원 미만 단독 사고</strong>: 보험 처리 시 향후 3년 누적 보험료 인상이 100~200만 원 → 자비 처리 고려</li>
    <li><strong>대물 사고</strong>: 상대방 청구액 100만 원 미만이면 자비 합의 후 보험사 미신고 검토</li>
    <li><strong>경미사고 환급제</strong>: 일부 보험사는 사고 후 1년 내 자비로 환급하면 등급 회복 옵션 제공</li>
  </ul>

  <h2>6. 운전자 범위 정리</h2>
  <p>가족 한정·1인 한정으로 좁힐수록 보험료가 낮아집니다.</p>
  <ul>
    <li><strong>누구나 운전</strong>: 기준 100%</li>
    <li><strong>가족 한정</strong>: 약 -10~15%</li>
    <li><strong>1인 한정</strong>: 약 -20~25%</li>
    <li><strong>임시 운전 특약</strong>: 친구·지인이 가끔 운전할 때만 1일 단위로 추가 (보험사 앱)</li>
  </ul>

  <h2>7. 갱신 시점 활용</h2>
  <p>일부 보험사는 만기 전 30일 사전 갱신 시 추가 할인을 제공합니다. 또한 결제 방법에 따라 차이가 있습니다.</p>
  <ul>
    <li><strong>일시납</strong>: 분납 대비 약 3~5% 저렴</li>
    <li><strong>카드 무이자 할부</strong>: 일시납 할인은 못 받지만 카드 포인트·캐시백 적립으로 상쇄 가능</li>
    <li><strong>휴대폰 결제·자동이체</strong>: 일부 보험사 1~2% 추가 할인</li>
  </ul>

  <h2>실제 절약 예시</h2>
  <table>
    <thead><tr><th>조치</th><th>절약액 (연간)</th></tr></thead>
    <tbody>
      <tr><td>비교사이트 5개사 견적</td><td>15~25만 원</td></tr>
      <tr><td>마일리지 + 블랙박스 + ADAS 할인</td><td>10~20만 원</td></tr>
      <tr><td>자기부담금 상향</td><td>5~8만 원</td></tr>
      <tr><td>불필요 특약 정리</td><td>5~10만 원</td></tr>
      <tr><td>운전자 범위 축소</td><td>10~20만 원</td></tr>
      <tr><td><strong>총 절약액</strong></td><td><strong>45~83만 원</strong></td></tr>
    </tbody>
  </table>
  <p>모든 항목 동시 적용은 어렵지만 3~4가지만 실행해도 <strong>30~50만 원 절약</strong>이 현실적입니다. 보험은 무조건 싸게 가입하는 것보다 보장 범위를 이해하고 본인 운전 패턴에 맞춰 최적화하는 것이 핵심입니다.</p>`,
  },
  {
    slug: 'diesel-end-of-life',
    title: '디젤차 폐차 시점과 조기폐차 보조금 — 5등급 차량 가이드',
    breadcrumb: '디젤 폐차',
    description: '5등급 디젤 차량 운행 제한 지역 확대, 조기폐차 보조금 최대 800만 원, 폐차 시점 판단 기준과 신청 절차를 정리.',
    ogDesc: '5등급 디젤차 조기폐차 보조금 최대 800만 원 신청 가이드.',
    category: '폐차·환경규제',
    icon: 'eco',
    readTime: 4,
    ctaTitle: '내 디젤차 리콜 미시정 확인',
    ctaText: '폐차 전 리콜 미시정 차량은 보조금 신청 시 불이익. 차량번호로 사전 점검하세요.',
    ctaBtn: '리콜 조회',
    ctaHref: '/parts',
    related: [
      { href: '/blog/recall-check-guide/', cat: '리콜 조회', title: '자동차 리콜 조회하는 법' },
      { href: '/blog/car-tax-calculator/', cat: '세금', title: '자동차 취득세·등록세 계산법' },
    ],
    body: `  <p>2018년 등록 5등급 디젤차는 운행 제한과 조기폐차 보조금이라는 두 가지 압박을 동시에 받고 있습니다. 폐차 시점을 놓치면 보조금도 못 받고 운행 과태료까지 누적될 수 있어 정확한 판단이 필요합니다.</p>

  <h2>내 차가 5등급인지 확인</h2>
  <p>자동차 배출가스 등급은 <a href="https://emissiongrade.mecar.or.kr" target="_blank" rel="noopener" class="underline">자동차 배출가스 등급제</a>(emissiongrade.mecar.or.kr) 차량번호 조회로 확인합니다.</p>
  <ul>
    <li><strong>1·2등급</strong>: 전기·수소·하이브리드, 최신 가솔린·LPG</li>
    <li><strong>3등급</strong>: 2009년 이후 가솔린·LPG, 2009~2017 디젤(유로5~6)</li>
    <li><strong>4등급</strong>: 2006~2008 디젤(유로4)</li>
    <li><strong>5등급</strong>: 2005년 이전 디젤·일부 LPG</li>
  </ul>

  <h2>5등급 차량 운행 제한</h2>
  <p>2026년 기준 다음 지역에서 운행 제한이 적용 또는 확대됩니다.</p>
  <ul>
    <li><strong>서울 사대문 안 녹색교통지역</strong>: 24시간 운행 금지, 위반 시 25만 원 과태료</li>
    <li><strong>수도권 계절관리제 (12월~3월)</strong>: 평일 06~21시 운행 제한, 위반 시 10만 원/일</li>
    <li><strong>부산·대구·광주 등 광역시</strong>: 일부 시간대 제한 시범 운영</li>
  </ul>
  <p>저감장치(DPF) 부착 차량은 제한에서 제외되지만, 노후 차량은 부착 비용 대비 잔존가치가 낮아 폐차가 더 유리한 경우가 많습니다.</p>

  <h2>조기폐차 보조금 — 최대 800만 원</h2>
  <p>2026년 기준 환경부 조기폐차 보조금 단가입니다.</p>
  <table>
    <thead><tr><th>차량 분류</th><th>보조금 한도</th></tr></thead>
    <tbody>
      <tr><td>경형·소형 승용</td><td>최대 100만 원</td></tr>
      <tr><td>중형 승용</td><td>최대 200만 원</td></tr>
      <tr><td>대형 승용·경형 화물</td><td>최대 300만 원</td></tr>
      <tr><td>중형 화물</td><td>최대 600만 원</td></tr>
      <tr><td>대형 화물·버스</td><td>최대 3,000만 원 (총중량별 차등)</td></tr>
    </tbody>
  </table>
  <p>실제 지급액은 <strong>차량 보험개발원 기준가의 70~100%</strong> 이내. 신차 구매 시 추가 인센티브가 있어 전기차로 교체 시 가장 유리합니다.</p>

  <h2>신청 자격</h2>
  <ul>
    <li>5등급 또는 4등급(저감장치 미부착) 경유차</li>
    <li>최종 소유자가 6개월 이상 보유</li>
    <li>관할 지자체 등록 차량 (주민등록 기준)</li>
    <li>지자체 한정 예산 — 선착순 또는 추첨</li>
  </ul>

  <h2>신청 절차</h2>
  <ol>
    <li><strong>지자체 공고 확인</strong>: 매년 1~2월 환경부·지자체 홈페이지 공고. 예산 소진 시 마감.</li>
    <li><strong>온라인 신청</strong>: 한국자동차환경협회(<a href="https://www.aea.or.kr" target="_blank" rel="noopener" class="underline">aea.or.kr</a>) 통합 신청.</li>
    <li><strong>대상 통보</strong>: 7~14일 내 SMS·이메일 통보.</li>
    <li><strong>지정 폐차장 입고</strong>: 통보 후 60일 이내 폐차 완료.</li>
    <li><strong>보조금 입금</strong>: 폐차 증명서 제출 후 14~30일.</li>
  </ol>

  <h2>폐차 vs 매각 어느 쪽이 유리한가</h2>
  <ul>
    <li><strong>차량가 200만 원 미만 5등급</strong>: 조기폐차 보조금이 매각가보다 큼 → 폐차 유리</li>
    <li><strong>차량가 300~500만 원 4등급 + 저감장치 부착</strong>: 매각이 유리. 동남아·중동 수출 수요 있음</li>
    <li><strong>1톤 화물 디젤</strong>: 사업자라면 LPG 1톤 신차 + 보조금 패키지가 가장 유리</li>
  </ul>

  <h2>주의 — 폐차 전 체크</h2>
  <ol>
    <li><strong>리콜 미시정 정리</strong>: 미시정 리콜 있으면 일부 지자체에서 보조금 차감 또는 거부</li>
    <li><strong>자동차세 정산</strong>: 폐차 시점 일할 계산 환급</li>
    <li><strong>의무보험 해지 환급</strong>: 만기 전 폐차 시 잔여기간 보험료 환급</li>
    <li><strong>번호판 영치 해제</strong>: 압류·체납 있으면 폐차 불가, 사전 해소 필수</li>
    <li><strong>개인정보 삭제</strong>: 내비·블랙박스의 위치·전화번호 데이터 삭제 후 입고</li>
  </ol>
  <p>폐차는 한 번 진행되면 되돌릴 수 없습니다. 보조금 안내 문자만 믿지 말고 지자체·한국자동차환경협회 공식 채널로 다시 확인하세요. 사기성 폐차업체가 시세보다 낮게 폐차 후 보조금만 가져가는 사례가 매년 발생합니다.</p>`,
  },
  {
    slug: 'first-car-buyer-guide',
    title: '첫차 구매 완전 가이드 — 20대 초년생 예산·차종·실전 체크',
    breadcrumb: '첫차 가이드',
    description: '첫차 구매 시 예산 설정, 신차 vs 중고차, 추천 차종, 보험·유지비, 계약 체크리스트까지 20~30대 초년 운전자 실전 가이드.',
    ogDesc: '첫차 구매 20대 초년생을 위한 예산·차종·계약 가이드.',
    category: '첫차 구매',
    icon: 'rocket_launch',
    readTime: 5,
    ctaTitle: '첫차 후보 매물 1차 검증',
    ctaText: '관심 매물의 차량번호로 사고·침수·리콜을 무료로 1차 확인. 사기 매물 거르고 시작하세요.',
    ctaBtn: '무료 이력조회',
    ctaHref: '/history',
    related: [
      { href: '/blog/used-car-checklist/', cat: '구매 체크리스트', title: '중고차 살 때 꼭 확인해야 할 10가지' },
      { href: '/blog/car-insurance-first-time/', cat: '자동차 보험', title: '자동차 보험 첫 가입 가이드' },
    ],
    body: `  <p>첫차 구매는 인생 두세 번째 큰 지출입니다. 광고와 영업 사원의 권유에 휩쓸리면 5년간 후회할 수 있습니다. 첫차를 처음 사는 20~30대 초년 운전자를 위해 예산부터 계약까지 실전 가이드를 정리했습니다.</p>

  <h2>1단계: 예산 설계 — 차값만 보면 망한다</h2>
  <p>차량 가격은 5년 총 지출의 약 60%에 불과합니다. 5년간 총 보유비용(TCO)을 먼저 계산하세요.</p>
  <table>
    <thead><tr><th>항목</th><th>준중형 신차</th><th>준중형 중고 (3년)</th></tr></thead>
    <tbody>
      <tr><td>차량가</td><td>2,800만 원</td><td>1,800만 원</td></tr>
      <tr><td>취득세·등록세 (7%)</td><td>196만 원</td><td>126만 원</td></tr>
      <tr><td>5년 보험료 (초년 운전자)</td><td>650만 원</td><td>650만 원</td></tr>
      <tr><td>5년 자동차세</td><td>250만 원</td><td>250만 원</td></tr>
      <tr><td>5년 유류비 (1.2만 km/년, 휘발유)</td><td>950만 원</td><td>950만 원</td></tr>
      <tr><td>5년 정비·소모품</td><td>300만 원</td><td>500만 원</td></tr>
      <tr><td>5년 후 잔존가치</td><td>-1,400만 원</td><td>-700만 원</td></tr>
      <tr><td><strong>5년 실비용</strong></td><td><strong>3,746만 원</strong></td><td><strong>3,576만 원</strong></td></tr>
    </tbody>
  </table>
  <p>의외로 신차와 3년 중고차의 5년 총비용은 비슷합니다. 핵심은 <strong>월 60~70만 원</strong>의 차량 관련 지출이 가능한지입니다.</p>

  <h2>2단계: 신차 vs 중고차 결정 기준</h2>
  <ul>
    <li><strong>신차 추천</strong>: 안정적 직장·자금 여유, 5년 이상 보유 예정, 보증·정비 편의 중요</li>
    <li><strong>준신차(1~2년) 추천</strong>: 신차 감가 회피하고 싶지만 상태 양호한 차 원함. 가성비 가장 우수</li>
    <li><strong>3~5년 중고 추천</strong>: 예산 한정, 첫 운전 사고 리스크 부담 → 부담 적은 가격대</li>
    <li><strong>10년 이상 비추천</strong>: 정비 빈도 폭증, 조기폐차 대상 위험, 매각도 어려움</li>
  </ul>

  <h2>3단계: 첫차 추천 차종</h2>
  <h3>국산차 — 가성비·정비망</h3>
  <ul>
    <li><strong>현대 캐스퍼</strong>: 경차, 자동차세 면제, 도심·주차 유리 (1,400~1,800만)</li>
    <li><strong>기아 모닝/레이</strong>: 경차 클래식, 박스카 레이는 적재 우수 (1,300~1,800만)</li>
    <li><strong>현대 아반떼</strong>: 준중형 베스트셀러, 신차·중고 시장 모두 풍부 (2,000~2,800만)</li>
    <li><strong>기아 K3</strong>: 아반떼 동급, 디자인 호불호 적음 (1,900~2,600만)</li>
  </ul>

  <h3>하이브리드 — 유류비 부담 완화</h3>
  <ul>
    <li><strong>현대 아반떼 하이브리드</strong>: 21 km/L, 신차 약 +200만 원 옵션</li>
    <li><strong>토요타 코롤라/프리우스</strong>: 안정적 하이브리드 기술, 중고 가성비 우수</li>
  </ul>

  <h3>비추천</h3>
  <ul>
    <li><strong>고배기량 세단·SUV</strong>: 보험료·유류비·세금 폭증</li>
    <li><strong>수입 노후 차량</strong>: 부품값·공임이 국산의 2~3배</li>
    <li><strong>스포츠 쿠페·튜닝차</strong>: 보험 할증 + 사고 위험 + 매각 난이도</li>
  </ul>

  <h2>4단계: 보험 — 초년 운전자 함정</h2>
  <p>경력 1년 미만의 초년 운전자는 보험료가 평균 운전자의 <strong>2~3배</strong>입니다.</p>
  <ul>
    <li>가족 차량을 1년 이상 부운전자로 등록 후 본인 차 가입 시 경력 인정</li>
    <li>대인·대물 + 자손·자상은 의무로 가입, 자차는 차값 1,500만 미만이면 자기부담금 50만 권장</li>
    <li>다이렉트 보험 5개사 이상 비교 (보험다모아·토스·보맵)</li>
  </ul>

  <h2>5단계: 계약 전 실전 체크</h2>
  <h3>중고차 매물</h3>
  <ol>
    <li>차량번호 무료 조회 → 사고·침수·리콜 1차 검증</li>
    <li>카히스토리 보험사고 이력 (770~2,200원)</li>
    <li>지정 정비소 정밀 점검 (5~10만 원, 필수)</li>
    <li>시운전 (시동·소음·경고등·에어컨·조향)</li>
    <li>자동차등록증·인감 진위 확인</li>
    <li>매매상사 매물의 경우 영업사원 명함·매매허가증 사진 보관</li>
  </ol>

  <h3>신차 계약</h3>
  <ol>
    <li>이번 달 프로모션 + 카드사 제휴 할인 비교</li>
    <li>금융 옵션: 할부 vs 장기렌트 vs 운용리스 (3가지 견적 받기)</li>
    <li>사전 옵션 패키지 거품 점검 (필요 없는 패키지 빼기)</li>
    <li>계약서 명의·차대번호·VIN·옵션 체크 후 서명</li>
    <li>출고 전 인도 점검(PDI) — 외관·계기판 km·옵션 작동 모두 확인</li>
  </ol>

  <h2>첫차 구매 시 가장 흔한 실수 5</h2>
  <ol>
    <li><strong>예산 초과</strong>: 월 차량비용 = 월소득의 15% 넘으면 빠르게 부담</li>
    <li><strong>옵션 과욕</strong>: 풀옵션 +400만 원이 잔존가치엔 +100만 원만 반영</li>
    <li><strong>1차 검증 생략</strong>: 무료 차량번호 조회만 해도 사기 매물 70% 거름</li>
    <li><strong>보험 비교 안 함</strong>: 그대로 가입하면 연 30만 원 손해 흔함</li>
    <li><strong>긴 할부</strong>: 60개월 할부는 이자 부담 + 잔존가치보다 잔액이 큰 "하수상태" 위험</li>
  </ol>
  <p>첫차는 단순한 이동수단이 아니라 <strong>5년치 라이프스타일 결정</strong>입니다. 충분히 비교하고 1차 검증한 후 계약하세요. 처음 한 달 후회하는 것보다, 처음 한 달 더 알아보는 게 훨씬 이득입니다.</p>`,
  },
  {
    slug: 'lease-early-termination',
    title: '자동차 리스 중도해지 — 위약금 계산·옵션·대안 완전정리',
    breadcrumb: '리스 중도해지',
    description: '운용리스·금융리스 중도해지 위약금 계산법, 승계·매입 옵션, 사고 후 처리 방법까지. 손해 최소화 전략.',
    ogDesc: '자동차 리스 중도해지 위약금 계산과 손해 최소화 전략.',
    category: '리스·금융',
    icon: 'currency_exchange',
    readTime: 4,
    ctaTitle: '내 차 시세부터 확인',
    ctaText: '리스 잔액 vs 차량 시세 비교가 핵심. 차량번호로 사고 이력 무료 확인 후 시세 협상하세요.',
    ctaBtn: '이력조회',
    ctaHref: '/history',
    related: [
      { href: '/blog/car-loan-vs-lease/', cat: '구매 방법', title: '자동차 할부 vs 리스 비교' },
      { href: '/blog/business-vs-personal-car/', cat: '절세·사업', title: '법인차 vs 개인차 — 부가세·운행기록부' },
    ],
    body: `  <p>자동차 리스는 계약 기간(보통 36~60개월)을 채우는 것을 전제로 설계됩니다. 중간에 해지하면 위약금이 발생하는데, 운용리스와 금융리스의 계산법이 다릅니다. 손해를 최소화하는 4가지 방법을 알아봅니다.</p>

  <h2>운용리스 vs 금융리스 — 중도해지 차이</h2>
  <table>
    <thead><tr><th>항목</th><th>운용리스</th><th>금융리스</th></tr></thead>
    <tbody>
      <tr><td>소유권</td><td>리스사</td><td>이용자 (계약 만료 자동 이전)</td></tr>
      <tr><td>중도해지 위약금 산정</td><td>잔여 리스료 × 30~60%</td><td>잔여 원리금 × 80~100%</td></tr>
      <tr><td>차량 반납</td><td>의무</td><td>선택 (소유권 이전 후 매각 가능)</td></tr>
      <tr><td>총비용</td><td>높음 (월 부담 적음)</td><td>낮음 (할부와 유사)</td></tr>
    </tbody>
  </table>
  <p>운용리스는 차량 반납으로 끝낼 수 있는 대신 위약금이 잔여 리스료 기반으로 계산되어 비쌉니다. 금융리스는 잔여 원금 일시납 부담이 큽니다.</p>

  <h2>중도해지 위약금 실제 계산 예시</h2>
  <h3>운용리스 (36개월 중 18개월차 해지)</h3>
  <ul>
    <li>월 리스료: 65만 원</li>
    <li>잔여 18개월 × 65만 = 1,170만 원</li>
    <li>위약금: 1,170만 × 50% = <strong>585만 원</strong></li>
    <li>차량 반납 (감가 매입가는 잔존가 기준)</li>
  </ul>

  <h3>금융리스 (60개월 중 30개월차 해지)</h3>
  <ul>
    <li>잔여 원리금: 1,800만 원</li>
    <li>위약금: 1,800만 × 90% = <strong>1,620만 원</strong></li>
    <li>일시 납부 후 차량 명의 본인 이전, 본인이 매각 가능</li>
  </ul>

  <h2>손해 최소화 4가지 방법</h2>
  <h3>1) 리스 승계 — 가장 유리</h3>
  <p>새 사용자에게 리스 계약 명의를 이전하는 방식. 위약금이 거의 없거나 명의이전수수료(약 30~80만 원)만 부담.</p>
  <ul>
    <li>리스 승계 전문 카페·플랫폼 (리스픽, 리스승계마켓 등)</li>
    <li>본인 차량 사양과 잔여 기간이 매력적이어야 거래 성사</li>
    <li>승계자 신용도가 리스사 기준 통과해야 함</li>
    <li>중고차 시세보다 리스 잔존가가 낮으면 인수 매력 ↑</li>
  </ul>

  <h3>2) 본인 매입 후 매각 (금융리스 한정)</h3>
  <p>잔여 원금을 일시 납입하고 본인 명의로 이전. 그 후 중고차 시장에 매각. 차량 시세가 잔여 원금 + 매각 비용보다 크면 이득.</p>
  <ul>
    <li>리스 잔여 원금 1,800만 + 명의이전 50만 = 1,850만 부담</li>
    <li>중고차 시세 2,200만 매각 시 → 350만 회수</li>
    <li>시세 < 잔여원금이면 손해, 진행 전 시세 정확히 파악 필수</li>
  </ul>

  <h3>3) 사고·고장 → 보험 종합 처리</h3>
  <p>전손 사고(차량가 70% 이상 파손) 발생 시 보험금으로 잔여 리스료 정산이 가능합니다. 단, 자손·자상·차량가입 보험 가입이 필수. 단순 고장은 적용 안 됩니다.</p>

  <h3>4) 잔여기간 단축 협상</h3>
  <p>리스사와 직접 협상해 잔여 기간 단축, 월납액 조정, 차량 교체 옵션. 보통 2년 이상 사용자, 연체 없음, 사고 없음 조건에서만 가능. 리스사마다 정책 다르니 영업담당과 직접 통화.</p>

  <h2>중도해지 시 추가 부담</h2>
  <ul>
    <li><strong>차량 손상 보상</strong>: 운용리스 반납 시 표준 마모 초과분(긁힘·찌그러짐) 별도 청구</li>
    <li><strong>주행거리 초과 페널티</strong>: 약정 km/년 초과 시 km당 50~150원 청구</li>
    <li><strong>잔액 정산 수수료</strong>: 중도해지 행정비용 약 10~30만 원</li>
    <li><strong>잔여 자동차세 정산</strong>: 보유 일수만큼 청구</li>
  </ul>

  <h2>해지 전 마지막 체크</h2>
  <ol>
    <li>현재 리스 형태 확인 (운용 vs 금융) — 계약서 또는 리스사 앱</li>
    <li>잔여 기간·잔여 원리금 정확히 산출</li>
    <li>중고차 시세 (KB차차차·엔카 동급 매물) 평균값 확인</li>
    <li>리스 승계 가능성·승계 수요 점검</li>
    <li>본인 매입 시 추가 자금 마련 가능 여부</li>
    <li>리스사에 중도해지 견적 공식 요청 (서면)</li>
  </ol>
  <p>가장 큰 손해는 <strong>"감정적으로 빨리 해지"</strong>하는 경우입니다. 해지 비용 vs 사용 지속 비용을 6개월 단위로 시뮬레이션해보고, 가능하면 승계 우선, 그다음 매입 후 매각, 최후로 위약금 해지 순으로 검토하세요.</p>`,
  },
  {
    slug: 'car-warranty-guide',
    title: '신차·중고차 보증 완전정리 — 제조사 보증 vs 연장 보증',
    breadcrumb: '자동차 보증',
    description: '신차 제조사 보증 기간(파워트레인 5년/10만, 일반 3년/6만), 중고차 보증 승계 조건, 연장 보증 가입 시 체크 포인트까지.',
    ogDesc: '신차·중고차 보증 기간, 승계, 연장 보증 가입 가이드.',
    category: '보증·정비',
    icon: 'verified_user',
    readTime: 4,
    ctaTitle: '보증 적용 여부, 리콜 매칭으로 확인',
    ctaText: '리콜 시정 차량은 별도 무상 수리 가능. 차량번호로 리콜 미시정 항목 확인하세요.',
    ctaBtn: '리콜 조회',
    ctaHref: '/parts',
    related: [
      { href: '/blog/recall-check-guide/', cat: '리콜 조회', title: '자동차 리콜 조회하는 법' },
      { href: '/blog/import-car-maintenance-cost/', cat: '정비·관리', title: '수입차 정비비·부품값 비교' },
    ],
    body: `  <p>자동차 보증은 단순히 "고장 나면 무상 수리"가 아닙니다. 부품별·기간별 적용 범위가 다르고, 중고차로 거래되면 일부만 승계되며, 일부 행위(튜닝·정비 누락)로 보증이 무효화됩니다. 보증 구조를 정확히 알면 수리비 수백만 원을 아낄 수 있습니다.</p>

  <h2>제조사 신차 보증 기본 구조</h2>
  <table>
    <thead><tr><th>보증 항목</th><th>국산차 평균</th><th>수입차 평균</th></tr></thead>
    <tbody>
      <tr><td>일반 보증 (전체 차량)</td><td>3년 / 6만 km</td><td>3년 / 무제한</td></tr>
      <tr><td>파워트레인 (엔진·변속기)</td><td>5년 / 10만 km</td><td>4~5년 / 8~10만 km</td></tr>
      <tr><td>차체 부식</td><td>5년 / 무제한</td><td>10년 / 무제한 (BMW·벤츠 등)</td></tr>
      <tr><td>전기차 배터리·구동모터</td><td>10년 / 16만 km (SOH 70% 보증)</td><td>8년 / 16만 km</td></tr>
      <tr><td>하이브리드 배터리</td><td>10년 / 20만 km</td><td>8년 / 16만 km</td></tr>
    </tbody>
  </table>
  <p>"먼저 도래하는 기간 또는 거리"가 적용 기준입니다. 5년 6만 km 차량은 파워트레인 보증 만료(거리 미달이지만 기간 도래).</p>

  <h2>보증 적용 안 되는 항목 (대부분 사용자 부담)</h2>
  <ul>
    <li><strong>소모품</strong>: 엔진오일·필터·타이어·브레이크패드·디스크·와이퍼·배터리(12V)·전구</li>
    <li><strong>외부 충격·사고</strong>: 자기 책임 사고로 인한 손상</li>
    <li><strong>천재지변</strong>: 우박·낙뢰·홍수 등 (보험 처리)</li>
    <li><strong>비순정 부품 사용</strong>: 인증 안 된 부품 장착 후 발생한 고장</li>
    <li><strong>과실에 의한 손상</strong>: 과적·튜닝·경주용 사용</li>
  </ul>

  <h2>중고차 보증 승계 — 가능 / 불가능</h2>
  <h3>국산차</h3>
  <ul>
    <li><strong>현대·기아</strong>: 명의 이전 시 자동 승계. 추가 절차 없음.</li>
    <li><strong>한국지엠·르노</strong>: 자동 승계 또는 1만 원 수수료로 승계 가능</li>
    <li><strong>KGM (구 쌍용)</strong>: 자동 승계</li>
  </ul>

  <h3>수입차 — 브랜드별 차이 큼</h3>
  <ul>
    <li><strong>BMW·벤츠</strong>: 정식 딜러 인증중고차 프로그램 통해 1년 추가 보증 제공. 일반 거래는 잔여 기간만 승계</li>
    <li><strong>아우디·폭스바겐</strong>: 잔여 기간 승계, 단 정비이력 정상 관리 필요</li>
    <li><strong>테슬라</strong>: 차량 보증은 자동 승계, 배터리 보증도 승계되지만 슈퍼차저 무료 정책은 비승계</li>
    <li><strong>일부 럭셔리·스포츠</strong>: 페라리·람보르기니 등은 정식 딜러 인증 차량만 보증 승계</li>
  </ul>

  <h2>연장 보증 가입 — 정말 필요한가</h2>
  <p>제조사·딜러는 보통 신차 보증 만료 직전 연장 보증(2~3년 추가)을 권유합니다. 차종별로 가입 가치가 다릅니다.</p>

  <h3>가입 권장</h3>
  <ul>
    <li>수입차 — 부품·공임이 비싸 한 번의 큰 수리로 본전 회수</li>
    <li>전기차 — 배터리·인버터 등 핵심 부품 고가</li>
    <li>5년 이상 보유 예정 차량</li>
    <li>주행거리 연 2만 km 이상의 고운행 차량</li>
  </ul>

  <h3>가입 불필요</h3>
  <ul>
    <li>국산 베스트셀러 — 부품·공임 저렴, 신뢰도 높음</li>
    <li>5년 내 매각 예정 차량 (보증 양도 가치 불확실)</li>
    <li>보증 가격이 차량가 5% 초과하는 경우</li>
  </ul>

  <h2>보증 무효 사유 — 이것은 피하세요</h2>
  <ol>
    <li><strong>지정 정비주기 누락</strong>: 보증서에 명시된 정기점검·소모품 교환을 비공식 정비소에서 해도 무방하지만, <strong>영수증·기록지를 보관해야</strong> 보증 분쟁 시 인정됩니다.</li>
    <li><strong>비순정 튜닝</strong>: ECU 맵핑, 흡기·배기 튜닝, 휠·브레이크 사이즈 변경은 해당 부위 보증 무효.</li>
    <li><strong>주행거리 조작</strong>: 즉시 보증 전체 무효 + 매도 시 사기죄.</li>
    <li><strong>리콜 미시정</strong>: 미시정으로 인한 2차 고장은 보증 거부.</li>
    <li><strong>비공식 부품 사용</strong>: 비순정 부품 장착 후 그 부품에 인접한 부위 고장 발생 시 보증 거부.</li>
  </ol>

  <h2>보증 활용 팁</h2>
  <ul>
    <li>구매 시 보증서·정비 매뉴얼·영수증 폴더로 따로 보관</li>
    <li>리콜 통보 받으면 즉시 무상 시정 (보증 신뢰도 유지)</li>
    <li>보증 만료 1개월 전 점검 입고 → 잠재 결함 확인 후 무상 수리 챙기기</li>
    <li>전기차는 매년 SOH 측정 리포트 발급 (배터리 보증 청구 시 증빙)</li>
    <li>딜러 정비 vs 사설 정비 비용 비교 후 보증 항목만 딜러에서 해결</li>
  </ul>
  <p>보증은 <strong>"고장 났을 때 쓰는 카드"</strong>가 아니라 <strong>"5~10년 차량 운영의 안전망"</strong>입니다. 가입·승계·관리 한 번 더 점검하면 5년간 200만 원 이상 절약 가능합니다.</p>`,
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
