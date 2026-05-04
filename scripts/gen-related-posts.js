#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'blog');

const posts = {
  'accident-history-check': { title: '중고차 사고이력 조회 어디서 하나요? — 카히스토리 가이드', label: '사고이력', cat: 'used-car', tags: ['사고이력', '카히스토리', '외부조회'] },
  'brake-pad-replacement': { title: '브레이크 패드 교체 시기와 비용', label: '정비', cat: 'maintenance', tags: ['브레이크', '정비', '비용'] },
  'business-vs-personal-car': { title: '법인차 vs 개인차 — 부가세·비용처리 비교', label: '세금·금융', cat: 'finance', tags: ['법인차', '부가세', '절세'] },
  'car-ac-refrigerant': { title: '자동차 에어컨 가스 충전 시기와 비용', label: '정비', cat: 'maintenance', tags: ['에어컨', '정비', '비용'] },
  'car-battery-12v': { title: '12V 자동차 배터리 교체 시기와 자가 진단법', label: '정비', cat: 'maintenance', tags: ['배터리', '정비', '소모품'] },
  'car-insurance-first-time': { title: '자동차 보험 첫 가입 가이드', label: '보험', cat: 'insurance', tags: ['보험', '신규가입', '특약'] },
  'car-loan-vs-lease': { title: '자동차 할부 vs 리스 비교', label: '금융', cat: 'finance', tags: ['할부', '리스', '비교'] },
  'car-noise-diagnosis': { title: '차량 이상 소음 자가 진단', label: '정비', cat: 'maintenance', tags: ['소음', '진단', '자가점검'] },
  'car-rental-vs-lease': { title: '렌트 vs 리스 vs 구매 비교', label: '금융', cat: 'finance', tags: ['리스', '렌트', '비교'] },
  'car-residual-value': { title: '중고차 잔존가치 계산법', label: '시세', cat: 'used-car', tags: ['시세', '감가', '잔존가치'] },
  'car-tax-calculator': { title: '자동차 취득세·등록세 계산법', label: '세금', cat: 'tax', tags: ['세금', '취득세', '계산'] },
  'car-title-transfer': { title: '자동차 명의이전 절차 완전정리', label: '세금·법규', cat: 'tax', tags: ['명의이전', '절차', '세금'] },
  'car-warranty-guide': { title: '신차·중고차 보증 완전정리', label: '구매가이드', cat: 'used-car', tags: ['보증', '신차', '중고차'] },
  'carhistory-vs-insurance': { title: '카히스토리 vs 보험개발원 — 무엇이 다른가', label: '사고이력', cat: 'used-car', tags: ['사고이력', '카히스토리', '비교'] },
  'dashcam-buying-guide': { title: '블랙박스 선택·설치 완벽 가이드', label: '안전·악세서리', cat: 'insurance', tags: ['블랙박스', '안전', '보험할인'] },
  'diesel-end-of-life': { title: '디젤차 폐차 시점과 조기폐차 보조금', label: '친환경', cat: 'eco', tags: ['디젤', '폐차', '보조금'] },
  'engine-oil-interval': { title: '엔진오일 교환 주기와 종류 선택', label: '정비', cat: 'maintenance', tags: ['엔진오일', '소모품', '주기'] },
  'engine-warning-light': { title: '엔진 경고등(체크엔진) 의미와 대처법', label: '정비', cat: 'maintenance', tags: ['경고등', '진단', '엔진'] },
  'ev-battery-life': { title: '전기차 배터리 수명과 중고 구매 체크', label: '친환경', cat: 'eco', tags: ['전기차', '배터리', '중고차'] },
  'first-car-buyer-guide': { title: '첫차 구매 완전 가이드', label: '구매가이드', cat: 'used-car', tags: ['첫차', '예산', '초보'] },
  'flood-damaged-car': { title: '중고차 침수 여부 확인하는 5가지 방법', label: '침수차', cat: 'used-car', tags: ['침수차', '점검', '구매전'] },
  'hybrid-vs-ev': { title: '하이브리드 vs 전기차 — 총 소유비용 비교', label: '친환경', cat: 'eco', tags: ['하이브리드', '전기차', '비교'] },
  'import-car-maintenance-cost': { title: '수입차 정비비·부품값 비교', label: '정비', cat: 'maintenance', tags: ['수입차', '정비', '비용'] },
  'insurance-discount-tips': { title: '자동차보험료 할인 받는 10가지 방법', label: '보험', cat: 'insurance', tags: ['보험', '할인', '특약'] },
  'insurance-renewal-tips': { title: '자동차 보험 갱신 시 절약하는 7가지', label: '보험', cat: 'insurance', tags: ['보험', '갱신', '할인'] },
  'lease-early-termination': { title: '자동차 리스 중도해지 — 위약금·대안', label: '금융', cat: 'finance', tags: ['리스', '중도해지', '위약금'] },
  'mileage-fraud': { title: '중고차 주행거리 조작 의심되는 7가지 신호', label: '사고이력', cat: 'used-car', tags: ['주행거리', '사기', '점검'] },
  'new-vs-used-car-tco': { title: '신차 vs 중고차 5년 총비용 비교', label: '시세', cat: 'used-car', tags: ['신차', '중고차', '비교'] },
  'recall-check-guide': { title: '자동차 리콜 조회하는 법', label: '리콜', cat: 'maintenance', tags: ['리콜', '무상수리', '조회'] },
  'road-tax-payment': { title: '자동차세 납부 가이드 — 분기별·연납', label: '세금', cat: 'tax', tags: ['자동차세', '납부', '연납'] },
  'tire-pressure-guide': { title: '타이어 공기압 적정치와 자가 점검', label: '정비', cat: 'maintenance', tags: ['타이어', '공기압', '소모품'] },
  'tire-replacement-guide': { title: '타이어 교체 시기와 선택법', label: '정비', cat: 'maintenance', tags: ['타이어', '교체', '소모품'] },
  'traffic-fine-lookup': { title: '자동차 과태료·범칙금 조회 가이드', label: '법규', cat: 'tax', tags: ['과태료', '범칙금', '조회'] },
  'used-car-checklist': { title: '중고차 살 때 꼭 확인해야 할 10가지', label: '구매가이드', cat: 'used-car', tags: ['구매전', '체크리스트', '구매가이드'] },
  'used-car-price-guide': { title: '중고차 시세 정확하게 계산하는 5가지 방법', label: '시세', cat: 'used-car', tags: ['시세', '계산', '구매전'] },
  'used-car-scam-types': { title: '중고차 사기 유형 7가지와 예방법', label: '구매가이드', cat: 'used-car', tags: ['사기', '예방', '구매전'] },
  'used-car-where-to-buy': { title: '중고차 어디서 사야 하나 — 채널 비교', label: '구매가이드', cat: 'used-car', tags: ['구매채널', '구매가이드', '비교'] },
  'vehicle-inspection-guide': { title: '자동차 정기검사 완전정리', label: '법규', cat: 'tax', tags: ['정기검사', '과태료', '법규'] },
  'vin-lookup': { title: '차량번호로 차대번호(VIN) 확인하는 방법', label: '차량정보', cat: 'used-car', tags: ['VIN', '차대번호', '조회'] },
  'window-tinting-law': { title: '자동차 썬팅 합법 기준과 추천 농도', label: '법규', cat: 'tax', tags: ['썬팅', '법규', '정기검사'] },
};

function score(a, b) {
  let s = 0;
  if (a.cat === b.cat) s += 3;
  for (const t of a.tags) if (b.tags.includes(t)) s += 1;
  return s;
}

function relatedFor(slug) {
  const me = posts[slug];
  const ranked = Object.entries(posts)
    .filter(([s]) => s !== slug)
    .map(([s, p]) => ({ slug: s, post: p, score: score(me, p) }))
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug));
  return ranked.slice(0, 3);
}

function buildSection(slug) {
  const related = relatedFor(slug);
  const cards = related.map(({ slug: s, post }) => `      <a href="/blog/${s}/" class="block bg-surface-container-low border border-outline-variant rounded-2xl p-md hover:border-primary-container dark:hover:border-primary transition-colors">
        <div class="text-xs text-muted mb-xs">${post.label}</div>
        <div class="font-headline font-semibold text-sm leading-snug">${post.title}</div>
      </a>`).join('\n');
  return `<section class="pb-xl">
    <h2 class="font-headline text-lg font-semibold mb-md">함께 보면 좋은 글</h2>
    <div class="grid gap-md md:grid-cols-3">
${cards}
    </div>
  </section>`;
}

function applyToFile(slug) {
  const file = path.join(BLOG_DIR, slug, 'index.html');
  if (!fs.existsSync(file)) return { slug, status: 'missing' };
  let html = fs.readFileSync(file, 'utf8');

  const newSection = buildSection(slug);
  const sectionRegex = /<section[^>]*>\s*<h2[^>]*>(?:함께 보면 좋은 글|관련 글)<\/h2>[\s\S]*?<\/section>/;

  if (sectionRegex.test(html)) {
    html = html.replace(sectionRegex, newSection);
  } else {
    html = html.replace(/(<footer\b)/, `${newSection}\n\n$1`);
  }

  fs.writeFileSync(file, html);
  return { slug, status: 'updated' };
}

const slugs = Object.keys(posts);
const results = slugs.map(applyToFile);
const updated = results.filter(r => r.status === 'updated').length;
const missing = results.filter(r => r.status === 'missing');
console.log(`Updated ${updated}/${slugs.length} blog posts.`);
if (missing.length) console.log('Missing:', missing.map(m => m.slug).join(', '));
