// 생성 페이지 공용 조각: <head>, 사진 태그, 문자열 이스케이프
const photos = require('../../data/photos.json').photos;
const byId = Object.fromEntries(photos.map((p) => [p.id, p]));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function photo(id) {
  const p = byId[id];
  if (!p) throw new Error('사진 없음: ' + id);
  return p;
}

// 출처 캡션 (CC BY 계열은 표기 의무, CC0·퍼블릭 도메인·Unsplash도 관례상 표기)
const site = (p) => p.site || '위키미디어 공용';
const creditText = (p) => (p.site ? `사진: ${p.author} · ${p.site}` : `사진: ${p.author} · ${p.license} · ${site(p)}`);
function credit(id) {
  const p = photo(id);
  return p.site
    ? `사진: <a href="${esc(p.source)}" target="_blank" rel="noopener" class="hover:underline">${esc(p.author)}</a> · ${esc(p.site)}`
    : `사진: <a href="${esc(p.source)}" target="_blank" rel="noopener" class="hover:underline">${esc(p.author)}</a> · ${esc(p.license)} · ${site(p)}`;
}

// 반응형 사진 <img> — 800/1600 WebP. eager=true는 첫 화면 사진만
function img(id, { cls = '', eager = false, sizes = '100vw' } = {}) {
  const p = photo(id);
  return `<img src="${p.file800}" srcset="${p.file800} 800w, ${p.file} 1600w" sizes="${sizes}" width="${p.w}" height="${p.h}" alt="${esc(p.title)}" class="${cls}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"/>`;
}

function head({ title, description, path, ogTitle, ogDescription, jsonld = [], extraStyle = '' }) {
  const url = `https://achaja.net${path}`;
  return `<!DOCTYPE html>
<html lang="ko"><head>
<!-- Microsoft Clarity -->
<script type="text/javascript">(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","wsg2fdrv80");</script>
<link rel="dns-prefetch" href="https://www.clarity.ms"/>
<!-- Google tag (gtag.js) — ACHAJA GA4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XD51EK8KES"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-XD51EK8KES');</script>
<link rel="dns-prefetch" href="https://www.googletagmanager.com"/>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}"/>
<meta name="author" content="ACHAJA"/>
<meta name="theme-color" content="#003178"/>
<meta name="naver-site-verification" content="1e39ff92cba7c69270ba89d91ed36828248a442c"/>
<meta name="robots" content="index,follow"/>
<link rel="canonical" href="${url}"/>
<link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
<link rel="apple-touch-icon" href="/apple-touch-icon.svg"/>
<link rel="manifest" href="/manifest.json"/>
<!-- Google AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5109067049933124" crossorigin="anonymous"></script>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="ACHAJA"/>
<meta property="og:locale" content="ko_KR"/>
<meta property="og:url" content="${url}"/>
<meta property="og:title" content="${esc(ogTitle || title)}"/>
<meta property="og:description" content="${esc(ogDescription || description)}"/>
<meta property="og:image" content="https://achaja.net/og-image.png"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(ogTitle || title)}"/>
<meta name="twitter:description" content="${esc(ogDescription || description)}"/>
<meta name="twitter:image" content="https://achaja.net/og-image.png"/>
${jsonld.map((j) => `<script type="application/ld+json">\n${JSON.stringify(j)}\n</script>`).join('\n')}
<script>(function(){var s=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(!s&&d))document.documentElement.classList.add('dark');})();</script>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="dns-prefetch" href="https://pagead2.googlesyndication.com"/>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin/>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;}
body{min-height:100dvh;}
.pb-safe{padding-bottom:env(safe-area-inset-bottom);}${extraStyle}
</style>
<link rel="stylesheet" href="/css/app.css"/>
</head>`;
}

const THEME_SCRIPT = `<script>function toggleTheme(){var h=document.documentElement;h.classList.toggle('dark');localStorage.setItem('theme',h.classList.contains('dark')?'dark':'light');}</script>`;

module.exports = { esc, photo, credit, creditText, img, head, THEME_SCRIPT, photos };
