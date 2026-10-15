// 1회성 마이그레이션: Tailwind CDN + 인라인 tailwind.config → 빌드된 /css/app.css
// node scripts/migrate-css.js <file...>
const fs = require('fs');
const files = process.argv.slice(2);
let changed = 0;
for (const f of files) {
  let s = fs.readFileSync(f, 'utf8');
  const before = s;
  // CDN 스크립트 → 공용 CSS 링크
  // CDN은 <head> 끝에 스타일을 주입했으므로 같은 우선순위를 위해 </head> 직전에 링크를 둔다
  s = s.replace(/[ \t]*<script src="https:\/\/cdn\.tailwindcss\.com[^"]*"><\/script>[ \t]*\n?/, '');
  if (!s.includes('/css/app.css')) s = s.replace('</head>', '<link rel="stylesheet" href="/css/app.css"/>\n</head>');
  // 인라인 tailwind.config 스크립트 제거 (<script> 또는 <script id="tailwind-config">)
  s = s.replace(/[ \t]*<script(?: id="tailwind-config")?>\s*tailwind\.config\s*=[\s\S]*?<\/script>[ \t]*\n?/, '');
  if (s !== before) {
    if (/cdn\.tailwindcss|tailwind\.config\s*=/.test(s)) throw new Error('잔여 Tailwind CDN/config: ' + f);
    fs.writeFileSync(f, s); changed++;
  }
}
console.log('migrated', changed, 'of', files.length);
