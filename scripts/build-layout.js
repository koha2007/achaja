// ACHAJA 공용 레이아웃 빌더 — 헤더·하단 탭·푸터를 모든 페이지에 끼워 넣는다.
//
// 페이지 안의 표시 구간을 찾아 내용을 교체한다:
//   <!-- @header active=buy lang --> ... <!-- /@header -->
//   <!-- @tabbar active=buy -->      ... <!-- /@tabbar -->
//   <!-- @footer -->                 ... <!-- /@footer -->
// active 값: home | news | newcar | buy | repair | care | my | (없음)
// lang 플래그: 한국어/English 토글 버튼 표시 (홈만 사용)
//
// 또한 /css/app.css 링크에 내용 해시를 붙여 캐시를 갱신한다.
//
// 사용: node scripts/build-layout.js          (모든 페이지 갱신)
//       node scripts/build-layout.js --check  (변경이 필요하면 실패 — 커밋 전 확인용)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

// ── 메뉴 정의 (IA: 사용자 상황 기준) ─────────────────────────────
const NAV = [
  { key: 'news', href: '/news/', label: 'NEW', icon: 'fiber_new' },
  { key: 'newcar', href: '/newcar/', label: 'NEWCAR', icon: 'directions_car' },
  { key: 'buy', href: '/buy/', label: '살 때', icon: 'directions_car' },
  { key: 'repair', href: '/repair/', label: '아플 때', icon: 'car_repair' },
  { key: 'care', href: '/care/', label: '관리', icon: 'handyman' },
];
// 모바일 하단 탭: 매일 보는 것(NEW 소식·NEWCAR 신차) 우선, 상황별 가이드는 '가이드' 하나로 묶음
const TABS = [
  { key: 'home', href: '/', label: '홈', icon: 'home' },
  { key: 'news', href: '/news/', label: 'NEW', icon: 'fiber_new' },
  { key: 'newcar', href: '/newcar/', label: 'NEWCAR', icon: 'directions_car' },
  { key: 'guide', href: '/blog/', label: '가이드', icon: 'menu_book' },
  { key: 'my', href: '/my', label: '내 차', icon: 'garage' },
];
const TAB_OF = { buy: 'guide', repair: 'guide', care: 'guide' };

function header({ active, lang }) {
  const links = NAV.map((n) => {
    const on = n.key === active;
    return `        <a href="${n.href}"${on ? ' aria-current="page"' : ''} class="${on
      ? 'text-primary-container dark:text-primary bg-active-bg/50 dark:bg-active-bg/30 font-bold'
      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-semibold'} text-sm px-3 py-2 rounded-lg transition-colors">${n.label}</a>`;
  }).join('\n');
  const langBtn = lang ? `
        <button onclick="toggleLang()" id="lang-toggle" data-noi18n aria-label="Switch language / 언어 전환" title="한국어 / English" class="flex items-center gap-0.5 px-2 py-2 rounded-lg text-muted hover:text-on-surface active:scale-95 transition text-xs font-bold">
          <span class="material-symbols-outlined text-[18px]">language</span>
          <span id="lang-toggle-label">EN</span>
        </button>` : '';
  const myOn = active === 'my';
  return `<header class="fixed top-0 left-0 right-0 z-50 bg-header-bg/85 backdrop-blur-md border-b border-app-border">
    <div class="max-w-6xl mx-auto flex items-center justify-between gap-2 px-4 md:px-6 h-14">
      <a href="/" class="flex items-center gap-2" aria-label="ACHAJA 홈">
        <span class="font-headline text-lg font-extrabold tracking-tight text-primary-container dark:text-primary">ACHAJA</span>
      </a>
      <nav aria-label="주요 메뉴" class="hidden md:flex items-center gap-1">
${links}
      </nav>
      <div class="flex items-center gap-1">${langBtn}
        <button onclick="toggleTheme()" aria-label="테마 전환" class="p-2 rounded-lg text-muted hover:text-on-surface active:scale-95 transition-transform">
          <span class="material-symbols-outlined dark:hidden">dark_mode</span>
          <span class="material-symbols-outlined hidden dark:inline">light_mode</span>
        </button>
        <a href="/my"${myOn ? ' aria-current="page"' : ''} class="hidden md:inline-flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-lg ${myOn ? 'text-primary-container dark:text-primary bg-active-bg/50 dark:bg-active-bg/30' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'} transition-colors"><span class="material-symbols-outlined text-[20px]">garage</span>내 차</a>
      </div>
    </div>
  </header>`;
}

function tabbar({ active }) {
  active = TAB_OF[active] || active;
  const items = TABS.map((t) => {
    const on = t.key === active;
    return `      <a href="${t.href}"${on ? ' aria-current="page"' : ''} class="flex-1 flex flex-col items-center justify-center ${on ? 'text-primary-container dark:text-primary' : 'text-muted'}"><span class="material-symbols-outlined"${on ? ` style="font-variation-settings:'FILL' 1;"` : ''}>${t.icon}</span><span class="text-[10px] ${on ? 'font-bold' : 'font-medium'} mt-0.5">${t.label}</span></a>`;
  }).join('\n');
  return `<nav aria-label="하단 메뉴" class="md:hidden fixed bottom-0 left-0 w-full z-50 bg-nav-bg border-t border-app-border shadow-lg">
    <div class="max-w-2xl mx-auto flex justify-around items-stretch h-16 px-2 pb-safe">
${items}
    </div>
  </nav>`;
}

function footer() {
  const col = (title, links) => `      <div>
        <p class="font-bold text-[11px] uppercase tracking-wider text-on-surface mb-sm">${title}</p>
        <ul class="space-y-1.5">
${links.map(([href, label]) => `          <li><a href="${href}" class="text-[12px] text-muted hover:text-primary-container dark:hover:text-primary hover:underline">${label}</a></li>`).join('\n')}
        </ul>
      </div>`;
  return `<footer class="px-margin pt-xl pb-lg border-t border-app-border mt-xl">
    <nav aria-label="사이트맵" class="grid grid-cols-2 md:grid-cols-4 gap-md max-w-5xl mx-auto mb-lg text-left">
${col('도구', [['/history', '매물 체크(차량 조회)'], ['/parts', '리콜 조회'], ['/sources/', '공식기관 가이드'], ['/pricing/', '상품안내']])}
${col('둘러보기', [['/news/', 'NEW 오늘의 소식'], ['/newcar/', 'NEWCAR 새로 나온 차'], ['/buy/', '살 때'], ['/repair/', '아플 때'], ['/care/', '관리']])}
${col('콘텐츠', [['/blog/', '전체 가이드'], ['/blog/used-car-checklist/', '중고차 체크리스트'], ['/blog/engine-warning-light/', '엔진 경고등'], ['/blog/vehicle-inspection-guide/', '자동차 정기검사']])}
${col('회사·정책', [['/about/', '소개'], ['/terms/', '이용약관'], ['/privacy/', '개인정보처리방침']])}
    </nav>
    <div class="max-w-5xl mx-auto text-center border-t border-app-border pt-md space-y-1">
      <p class="text-[11px] text-muted-strong">데이터 출처: 국토교통부 · 한국교통안전공단 · 보험개발원 카히스토리(외부 안내) · NHTSA vPIC · ISO 3779 · 사진: Unsplash · 위키미디어 공용</p>
      <p class="text-[11px] text-muted">상호: 코하(Koha) · 대표: 김용헌 · 사업자등록번호: 108-16-82025 · 주소: 경기도 남양주시 진접읍 해밀예당1로 145 · 전화: 010-8947-1841 · 이메일: koha3d77@gmail.com</p>
      <p class="text-[11px] text-muted">© 2026 ACHAJA by 코하(Koha). All Rights Reserved.</p>
    </div>
  </footer>`;
}

// ── 표시 구간 처리 ───────────────────────────────────────────────
function parseArgs(str) {
  const o = {};
  for (const tok of (str || '').trim().split(/\s+/).filter(Boolean)) {
    const [k, v] = tok.split('=');
    o[k] = v === undefined ? true : v;
  }
  return o;
}

const RENDER = { header, tabbar, footer };

function render(html, cssHash) {
  for (const name of Object.keys(RENDER)) {
    const re = new RegExp(`<!-- @${name}([^>]*?)-->[\\s\\S]*?<!-- /@${name} -->`, 'g');
    html = html.replace(re, (m, args) => `<!-- @${name}${args}-->\n  ${RENDER[name](parseArgs(args))}\n  <!-- /@${name} -->`);
  }
  html = html.replace(/\/css\/app\.css(\?v=[0-9a-f]+)?"/g, `/css/app.css?v=${cssHash}"`);
  return html;
}

function main() {
  const check = process.argv.includes('--check');
  const css = fs.readFileSync(path.join(ROOT, 'css/app.css'));
  const cssHash = crypto.createHash('sha256').update(css).digest('hex').slice(0, 10);
  const files = execSync('git ls-files "*.html"; git ls-files --others --exclude-standard "*.html"', { cwd: ROOT })
    .toString().split('\n').filter((f) => f && !f.startsWith('partials/') && !f.startsWith('docs/'));
  let changed = 0;
  for (const f of [...new Set(files)]) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    const s = fs.readFileSync(p, 'utf8');
    const out = render(s, cssHash);
    if (out !== s) {
      changed++;
      if (check) console.log('갱신 필요:', f);
      else fs.writeFileSync(p, out);
    }
  }
  console.log(`${check ? '확인' : '갱신'}: ${changed}개 페이지 (css v=${cssHash})`);
  if (check && changed) process.exit(1);
}

if (require.main === module) main();
module.exports = { header, tabbar, footer, render };
