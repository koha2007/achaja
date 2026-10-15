// 1회성 마이그레이션 D2: 인라인 색 토큰 제거(→ /css/app.css 한 곳), Manrope/Inter → Pretendard
// node scripts/migrate-tokens.js <file...>
const fs = require('fs');
const PRETENDARD = '<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin/>\n<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" crossorigin/>';
let changed = 0;
for (const f of process.argv.slice(2)) {
  let s = fs.readFileSync(f, 'utf8');
  const before = s;
  // 내용이 --c-* 선언뿐인 :root{...} / html.dark{...} 규칙만 제거 (다른 규칙은 유지)
  s = s.replace(/[ \t]*(:root|html\.dark)\s*\{([^{}]*)\}[ \t]*\n?/g, (m, sel, body) => {
    const decls = body.split(';').map((d) => d.trim()).filter(Boolean);
    return decls.length && decls.every((d) => /^--c-[a-z-]+\s*:/.test(d)) ? '' : m;
  });
  // 본문 글꼴 링크 교체 (Material Symbols 링크는 유지)
  s = s.replace(/[ \t]*<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Manrope[^"]*" rel="stylesheet"\/>/, PRETENDARD);
  // 인라인 스타일의 Manrope 지정 → 본문 글꼴 상속
  s = s.replace(/font-family:Manrope,sans-serif/g, 'font-family:inherit');
  if (/--c-primary\s*:|family=Manrope|Manrope,/.test(s)) throw new Error('잔여 토큰/글꼴: ' + f);
  if (s !== before) { fs.writeFileSync(f, s); changed++; }
}
console.log('migrated', changed);
