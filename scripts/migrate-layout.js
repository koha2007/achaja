// 1회성 마이그레이션 D3: 페이지마다 다른 헤더·하단 탭·푸터 → 공용 표시 구간(<!-- @header --> 등)
// 이후에는 scripts/build-layout.js 가 구간 내용을 채운다.
const fs = require('fs');
const { execSync } = require('child_process');
const guides = require('../data/guides.json');

const hubOf = {};
for (const [hub, slugs] of Object.entries(guides.hubs)) for (const s of slugs) hubOf[s] = hub;

function activeFor(f) {
  if (f === 'index.html') return 'home';
  const m = f.match(/^blog\/([^/]+)\/index\.html$/);
  if (m) return hubOf[m[1]] || '';
  if (/^(history|parts|sources|preview\/free)\//.test(f)) return 'buy';
  if (/^news\//.test(f)) return 'news';
  if (/^my\//.test(f)) return 'my';
  return '';
}

// 푸터 안에 있던 페이지 고유 안내문 → 본문 끝(푸터 앞)으로 이동
const NOTES = {
  'news/index.html': (ft) => ft.match(/<div class="max-w-2xl bg-surface-container[\s\S]*?<\/div>/)[0]
    .replace('class="max-w-2xl ', 'class="max-w-2xl mx-auto mt-12 '),
  'parts/index.html': (ft) => ft.match(/<p class="text-\[11px\] text-muted text-center max-w-xl[\s\S]*?<\/p>/)[0]
    .replace('class="text-[11px]', 'class="mt-12 mx-auto text-[11px]'),
  'history/index.html': (ft) => `<div class="pt-xl text-center">\n    ${ft.match(/<p class="text-muted-strong text-\[11px\] font-medium">정보제공처<\/p>\s*<p[^>]*>[\s\S]*?<\/p>/)[0]}\n  </div>`,
};

const files = execSync('git ls-files "*.html"').toString().trim().split('\n')
  .filter((f) => !['preview/index.html', 'preview/pdf-sample/index.html', '404.html'].includes(f));
let n = 0;
for (const f of files) {
  let s = fs.readFileSync(f, 'utf8');
  if (s.includes('<!-- @header')) continue;
  const active = activeFor(f);
  const a = active ? ` active=${active}` : '';
  const lang = f === 'index.html' ? ' lang' : '';
  const h = s.match(/[ \t]*<header class="fixed top-0[^"]*">[\s\S]*?<\/header>/);
  if (!h) throw new Error('헤더 없음: ' + f);
  s = s.replace(h[0], `  <!-- @header${a}${lang} -->\n  <!-- /@header -->`);
  const t = s.match(/[ \t]*<nav class="md:hidden fixed bottom-0[^"]*">[\s\S]*?<\/nav>/);
  if (t) s = s.replace(t[0], `  <!-- @tabbar${a} -->\n  <!-- /@tabbar -->`);
  const ft = s.match(/[ \t]*<footer[\s\S]*?<\/footer>/);
  if (!ft) throw new Error('푸터 없음: ' + f);
  const note = NOTES[f] ? NOTES[f](ft[0]) + '\n' : '';
  s = s.replace(ft[0], `  ${note}  <!-- @footer -->\n  <!-- /@footer -->`);
  fs.writeFileSync(f, s);
  n++;
  console.log(`${f}  active=${active || '-'}${t ? '' : '  (하단 탭 없음)'}${note ? '  (안내문 이동)' : ''}`);
}
console.log('migrated', n);
