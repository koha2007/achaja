// 자동차 뉴스 v2 — 네이버 뉴스 검색 API를 카테고리별 여러 검색어로 모은 뒤
// ① 제목 키워드로 자동차 관련 기사만 남기고 ② 주식·투자 기사 같은 잡음을 빼고
// ③ 같은 사건을 다룬 기사들을 하나로 묶어(매체 수 표시) ④ 최신순으로 돌려준다.
// 원문은 저장·복제하지 않는다 — 제목·발췌·링크·발행일만 사용 (기존 원칙 유지).

// 신차 소식은 NEWCAR(/newcar/)에서 다루므로 NEW 소식에서는 뺀다 (2026-10-20)
export const CATEGORIES = {
  recall: {
    label: '리콜',
    queries: ['자동차 리콜', '차량 무상수리'],
    include: /리콜|무상\s?수리|결함|시정조치/,
  },
  ev: {
    label: '전기차',
    queries: ['전기차 충전', '전기차 보조금', '전기차 배터리 화재'],
    include: /전기차|EV|충전|배터리|하이브리드|수소차/,
  },
  used: {
    label: '중고차',
    queries: ['중고차 시세', '중고차 시장'],
    include: /중고차|중고 ?차량|매매상사|성능점검/,
  },
  life: {
    label: '생활·제도',
    queries: ['자동차세', '자동차보험료', '교통 과태료 단속', '운전면허 제도'],
    include: /자동차세|보험료|자동차보험|과태료|단속|면허|교통법|도로교통|번호판|정기검사|유류세|기름값|유가/,
  },
  industry: {
    label: '업계',
    queries: ['완성차 판매 실적', '자동차 수출', '현대차 기아 판매'],
    include: /판매|수출|생산|공장|실적|점유율|완성차|수입차/,
  },
};

// 주식·투자·인사 등 운전자에게 의미가 적은 기사
const EXCLUDE = /특징주|종목|주가|증시|목표가|투자의견|매수|코스피|코스닥|상한가|하한가|ETF|공시|인사\]|부고|\[포토\]|게시판|게임|듀얼센스/;
// 신차 출시·공개 기사 (다른 카테고리 검색어에 걸려 들어와도 뺀다)
const NEWCAR = /신차|출시|사전계약|론칭|런칭|데뷔|첫선|시승|월드\s?프리미어/;
// 자동차 맥락 확인 (카테고리 키워드가 넓은 경우 대비)
const CAR = /차|EV|SUV|세단|모빌리티|운전|도로|주행|타이어|엔진|배터리|충전|현대|기아|제네시스|테슬라|BMW|벤츠|아우디|볼보|포르쉐|토요타|렉서스|KGM|르노|쉐보레|GM/;

const OUTLETS = {
  yna: '연합뉴스', yonhapnewstv: '연합뉴스TV', hankyung: '한국경제', mk: '매일경제', chosun: '조선일보', biz: '조선비즈',
  joongang: '중앙일보', donga: '동아일보', hani: '한겨레', khan: '경향신문', sedaily: '서울경제', edaily: '이데일리',
  mt: '머니투데이', newsis: '뉴시스', news1: '뉴스1', etnews: '전자신문', zdnet: '지디넷코리아', dailycar: '데일리카',
  motorgraph: '모터그래프', autoherald: '오토헤럴드', fnnews: '파이낸셜뉴스', asiae: '아시아경제', heraldcorp: '헤럴드경제',
  heraldk: '헤럴드경제', kmib: '국민일보', seoul: '서울신문', segye: '세계일보', munhwa: '문화일보', hankookilbo: '한국일보',
  nocutnews: '노컷뉴스', ytn: 'YTN', sbs: 'SBS', kbs: 'KBS', imbc: 'MBC', jtbc: 'JTBC', mbn: 'MBN', ohmynews: '오마이뉴스',
  newspim: '뉴스핌', ajunews: '아주경제', bizwatch: '비즈워치', thebell: '더벨', inews24: '아이뉴스24', dt: '디지털타임스',
  wikitree: '위키트리', insight: '인사이트', autoview: '오토뷰', carwiki: '카위키', topdaily: '탑데일리', g_enews: '글로벌이코노믹',
  economist: '이코노미스트', dailian: '데일리안', ddaily: '디지털데일리', businesspost: '비즈니스포스트', smarttoday: '스마트투데이',
};

export function stripHtml(s) {
  if (!s) return '';
  return s.replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .trim();
}

export function outletName(url) {
  try {
    const host = new URL(url).hostname.replace(/^(www|m|news|biz)\./, '');
    const key = host.split('.')[0].replace(/-/g, '_');
    return OUTLETS[key] || host;
  } catch {
    return '';
  }
}

// 제목 정규화 → 글자 2개씩 묶음(바이그램) 집합
function grams(title) {
  const t = title.replace(/\[[^\]]*\]|\([^)]*\)|[“”"'‘’…·,.!?~\-–—:;|<>]/g, '').replace(/\s+/g, '');
  const g = new Set();
  for (let i = 0; i < t.length - 1; i++) g.add(t.slice(i, i + 2));
  return g;
}
// 사건을 가리키는 핵심 낱말 (흔한 말·조사 제거) — 제목 표현이 달라도 같은 사건이면 겹친다
const STOP = new Set(['자동차', '차량', '출시', '공개', '신차', '국내', '최초', '리콜', '중고차', '판매', '시장', '업계', '전기차',
  '한국', '대한', '이유', '이번', '올해', '내년', '단독', '종합', '속보', '확인', '진행', '발표', '기준', '모델', '브랜드', '고객']);
function keyTokens(title) {
  return new Set(title.replace(/\[[^\]]*\]/g, ' ').split(/[^가-힣A-Za-z0-9]+/)
    .map((w) => w.replace(/(으로|에서|에게|까지|부터|이다|했다|한다|된다|은|는|이|가|을|를|의|에|도|만|와|과|로)$/, ''))
    .filter((w) => w.length >= 2 && !STOP.has(w)));
}
function shared(a, b) { let n = 0; for (const x of a) if (b.has(x)) n++; return n; }

function similar(a, b) {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / Math.max(1, Math.min(a.size, b.size));
}

// items: {title, description, link, pubDate, category} (최신순 정렬 전제)
export function curate(items, { limit = 30 } = {}) {
  const out = [];
  for (const it of items) {
    const cat = CATEGORIES[it.category];
    if (!cat || !cat.include.test(it.title) || EXCLUDE.test(it.title) || NEWCAR.test(it.title) || !CAR.test(it.title)) continue;
    const g = grams(it.title);
    const k = keyTokens(it.title);
    const t = new Date(it.pubDate).getTime();
    const dup = out.find((o) => similar(o._g, g) >= 0.38
      || (shared(o._k, k) >= 3 && Math.abs(o._t - t) < 48 * 3600e3));
    if (dup) {
      dup.related += it.related || 1;
      for (const o of it.outlets || [it.source]) if (!dup.outlets.includes(o)) dup.outlets.push(o);
      continue;
    }
    out.push({ ...it, _g: g, _k: k, _t: t, related: it.related || 1, outlets: [...(it.outlets || [it.source])] });
    if (out.length >= limit) break;
  }
  return out.map(({ _g, _k, _t, outlets, ...o }) => ({ ...o, outlets: outlets.slice(0, 4) }));
}

async function searchNaver(env, query) {
  const res = await fetch(`https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=50&sort=date`, {
    headers: { 'X-Naver-Client-Id': env.NAVER_CLIENT_ID, 'X-Naver-Client-Secret': env.NAVER_CLIENT_SECRET },
  });
  if (!res.ok) throw new Error(`naver ${res.status}`);
  const data = await res.json();
  return (data.items || []).map((item) => {
    const link = item.originallink || item.link;
    return { title: stripHtml(item.title), description: stripHtml(item.description).slice(0, 140), link, source: outletName(link), pubDate: item.pubDate };
  });
}

async function categoryItems(env, key, limit) {
  const cat = CATEGORIES[key];
  const lists = await Promise.all(cat.queries.map((q) => searchNaver(env, q).catch((e) => { console.error('[news]', key, q, e.message); return []; })));
  const merged = lists.flat().map((x) => ({ ...x, category: key }));
  // 같은 링크 중복 제거 후 최신순
  const seen = new Set();
  const uniq = merged.filter((x) => (seen.has(x.link) ? false : seen.add(x.link)));
  uniq.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  return curate(uniq, { limit });
}

const json = (obj, maxAge = 600) => new Response(JSON.stringify(obj), {
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${maxAge}` },
});

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') || 'all';
  const key = category === 'all' || CATEGORIES[category] ? category : 'all';

  if (!env.NAVER_CLIENT_ID || !env.NAVER_CLIENT_SECRET) {
    console.error('[news] NAVER_CLIENT_ID/SECRET not configured');
    return json({ category: key, items: [], error: 'unavailable' }, 60);
  }

  // KV 캐시 (검색어 여러 개를 쓰므로 호출량 절약) — 10분
  const cacheKey = `news:v3:${key}`;
  if (env.ACHAJA_CACHE) {
    const hit = await env.ACHAJA_CACHE.get(cacheKey, 'json').catch(() => null);
    if (hit) return json(hit);
  }

  let items;
  try {
    if (key === 'all') {
      const per = await Promise.all(Object.keys(CATEGORIES).map((k) => categoryItems(env, k, 8)));
      const all = per.flat().sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      // 카테고리를 넘나드는 같은 사건도 한 번 더 묶는다
      items = curate(all, { limit: 40 });
    } else {
      items = await categoryItems(env, key, 30);
    }
  } catch (e) {
    console.error('[news] failed', e);
    return json({ category: key, items: [], error: 'unavailable' }, 60);
  }

  const body = {
    category: key,
    categories: Object.fromEntries(Object.entries(CATEGORIES).map(([k, v]) => [k, v.label])),
    items,
    updatedAt: new Date().toISOString(),
  };
  if (env.ACHAJA_CACHE && items.length) {
    await env.ACHAJA_CACHE.put(cacheKey, JSON.stringify(body), { expirationTtl: 600 }).catch(() => {});
  }
  return json(body);
}
