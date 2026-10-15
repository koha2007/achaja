// 가이드(블로그 글) 공용 구역 빌더 — 대표 사진·상황별 경로·함께 보면 좋은 글(사진 카드)
//
// 각 글의 표시 구간을 채운다(처음 실행 시 기존 마크업을 표시 구간으로 바꾼다):
//   <!-- @guide-crumb -->  홈 / 살 때 / 글 이름          (이전: 홈 / 블로그 / 글 이름)
//   <!-- @guide-cover -->  제목 아래 대표 사진 + 출처      (data/guides.json photo)
//   <!-- @guide-related --> 함께 보면 좋은 글 3편(사진) + 허브 링크 (data/guides.json related)
// 구조화 데이터 BreadcrumbList의 2단계도 허브로 맞춘다.
// 사용: node scripts/build-guides.js
const fs = require('fs');
const path = require('path');
const { esc, img, credit } = require('./lib/page');
const guides = require('../data/guides.json');

const ROOT = path.resolve(__dirname, '..');
const HUB = {
  buy: { name: '살 때', href: '/buy/' },
  repair: { name: '아플 때', href: '/repair/' },
  care: { name: '관리', href: '/care/' },
};
const hubOf = {};
for (const [h, list] of Object.entries(guides.hubs)) for (const s of list) hubOf[s] = h;

const read = (slug) => fs.readFileSync(path.join(ROOT, 'blog', slug, 'index.html'), 'utf8');
const titleOf = (html) => html.match(/<h1[^>]*>([^<]+)</)[1].trim();

function crumb(slug, html) {
  const hub = HUB[hubOf[slug]];
  // 기존 경로의 마지막(짧은 이름)은 유지
  const last = (html.match(/<nav aria-label="breadcrumb"[\s\S]*?<span class="text-on-surface">([^<]+)<\/span>/) || [])[1]
    || titleOf(html).split(' — ')[0];
  return `<nav aria-label="breadcrumb" class="pt-lg text-xs text-muted">
  <a href="/" class="hover:underline">홈</a> / <a href="${hub.href}" class="hover:underline">${hub.name}</a> / <span class="text-on-surface">${esc(last)}</span>
</nav>`;
}

function cover(slug) {
  const id = guides.photo[slug];
  return `<figure class="mb-lg -mx-margin md:mx-0">
    <div class="photo-frame md:rounded-2xl">${img(id, { eager: true, sizes: '(min-width:768px) 720px, 100vw' })}</div>
    <figcaption class="photo-credit px-margin md:px-0 mt-1.5">${credit(id)}</figcaption>
  </figure>`;
}

function related(slug) {
  const hub = HUB[hubOf[slug]];
  const cards = guides.related[slug].map((s) => {
    const t = titleOf(read(s)).split(' — ')[0];
    const h = HUB[hubOf[s]];
    return `      <a href="/blog/${s}/" class="group block bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/60 rounded-2xl overflow-hidden hover:shadow-card transition">
        <div class="photo-frame">${img(guides.photo[s], { cls: 'group-hover:scale-[1.03] transition-transform duration-500', sizes: '(min-width:768px) 240px, 100vw' })}</div>
        <div class="p-md">
          <div class="text-[11px] font-bold text-primary-container dark:text-primary">${h.name}</div>
          <div class="mt-0.5 font-bold text-[15px] leading-snug group-hover:underline underline-offset-4">${esc(t)}</div>
        </div>
      </a>`;
  }).join('\n');
  const count = guides.hubs[hubOf[slug]].length;
  return `<section class="pb-xl" aria-labelledby="related-title">
    <h2 id="related-title" class="text-lg font-bold mb-md">함께 보면 좋은 글</h2>
    <div class="grid gap-md sm:grid-cols-3">
${cards}
    </div>
    <a href="${hub.href}" class="mt-md flex items-center justify-between gap-2 p-md rounded-2xl bg-surface-container border border-outline-variant/60 hover:border-primary-container dark:hover:border-primary transition">
      <span class="text-[14px] font-semibold">${hub.name} 가이드 ${count}편과 무료 도구 모두 보기</span>
      <span class="material-symbols-outlined text-outline">chevron_right</span>
    </a>
  </section>`;
}

function wrap(name, inner) { return `<!-- @${name} -->\n${inner}\n<!-- /@${name} -->`; }
function fill(html, name, inner, firstTimeRe) {
  const re = new RegExp(`<!-- @${name} -->[\\s\\S]*?<!-- /@${name} -->`);
  if (re.test(html)) return html.replace(re, wrap(name, inner));
  if (!firstTimeRe.test(html)) throw new Error(`${name}: 위치를 찾지 못함`);
  return html.replace(firstTimeRe, (m) => (name === 'guide-cover' ? `${m}\n\n  ${wrap(name, inner)}` : wrap(name, inner)));
}

let changed = 0;
for (const slug of Object.values(guides.hubs).flat()) {
  const p = path.join(ROOT, 'blog', slug, 'index.html');
  const before = fs.readFileSync(p, 'utf8');
  let s = before;
  s = fill(s, 'guide-crumb', crumb(slug, s), /<nav aria-label="breadcrumb"[\s\S]*?<\/nav>/);
  s = fill(s, 'guide-cover', cover(slug), /<article class="py-lg prose">\s*<header[\s\S]*?<\/header>/);
  s = fill(s, 'guide-related', related(slug), /<section class="pb-xl">[\s\S]*?<\/section>/);
  // 구조화 데이터 경로 2단계: 블로그 → 허브
  const hub = HUB[hubOf[slug]];
  s = s.replace(/\{"@type":"ListItem","position":2,"name":"[^"]*","item":"https:\/\/achaja\.net\/(?:blog|buy|repair|care)\/"\}/,
    `{"@type":"ListItem","position":2,"name":"${hub.name}","item":"https://achaja.net${hub.href}"}`);
  // 공용 푸터가 좁은 본문(main) 안에 있으면 main 밖으로
  const ft = s.match(/\n[ \t]*<!-- @footer -->[\s\S]*?<!-- \/@footer -->/);
  if (ft && s.indexOf(ft[0]) < s.indexOf('</main>')) {
    s = s.replace(ft[0], '');
    s = s.replace('</main>', `</main>\n${ft[0].trimStart().replace(/^/, '  ')}`);
  }
  if (s !== before) { fs.writeFileSync(p, s); changed++; }
}
console.log('가이드 갱신:', changed);
