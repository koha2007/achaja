// IndexNow로 네이버·빙에 사이트맵 URL 제출 (구글은 IndexNow 미지원 → Search Console에서 수동)
// 사용: npm run indexnow            → sitemap.xml 전체
//       npm run indexnow -- /newcar/ /news/  → 지정한 경로만
// 배포(푸시) 후 실제 사이트에 반영된 다음 실행할 것.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HOST = 'achaja.net';
const keyFile = fs.readdirSync(ROOT).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('루트에 IndexNow 키 파일(32자리 hex .txt)이 없습니다');
const key = keyFile.replace('.txt', '');

const args = process.argv.slice(2);
const urls = args.length
  ? args.map((p) => `https://${HOST}${p.startsWith('/') ? p : '/' + p}`)
  : [...fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const ENDPOINTS = ['https://searchadvisor.naver.com/indexnow', 'https://www.bing.com/indexnow'];

(async () => {
  const body = JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${keyFile}`, urlList: urls });
  for (const ep of ENDPOINTS) {
    const res = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body });
    console.log(`${ep} → ${res.status} ${res.statusText} (${urls.length}개)`);
  }
})();
