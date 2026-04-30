// 한국교통안전공단 자동차결함 리콜현황 프록시
// 환경변수 DATA_GO_KR_KEY 가 설정되면 공공데이터포털 실시간 API 호출,
// 없으면 정적 data/recalls.json 으로 graceful fallback.

const STATIC_FALLBACK_PATH = '/data/recalls.json';
const KOTSA_ENDPOINT = 'http://apis.data.go.kr/B552061/RecallInfo/getRecallInfo';
const CACHE_TTL_SECONDS = 60 * 60 * 6; // 6시간

async function fetchStaticFallback(env, request) {
  const url = new URL(request.url);
  url.pathname = STATIC_FALLBACK_PATH;
  url.search = '';
  const res = await env.ASSETS.fetch(new Request(url.toString()));
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'FALLBACK_UNAVAILABLE' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const body = await res.text();
  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Achaja-Source': 'static-fallback',
    },
  });
}

export async function onRequest({ request, env }) {
  if (!env.DATA_GO_KR_KEY) {
    return fetchStaticFallback(env, request);
  }

  const url = new URL(request.url);
  const pageNo = url.searchParams.get('pageNo') || '1';
  const numOfRows = Math.min(parseInt(url.searchParams.get('numOfRows') || '100', 10), 1000);
  const maker = url.searchParams.get('maker') || '';
  const carName = url.searchParams.get('model') || '';

  const params = new URLSearchParams({
    serviceKey: env.DATA_GO_KR_KEY,
    pageNo: String(pageNo),
    numOfRows: String(numOfRows),
    type: 'json',
  });
  if (maker) params.set('manufacturer', maker);
  if (carName) params.set('carName', carName);

  const apiUrl = `${KOTSA_ENDPOINT}?${params.toString()}`;
  const cacheKey = new Request(apiUrl, { method: 'GET' });
  const cache = caches.default;

  let cached = await cache.match(cacheKey);
  if (cached) {
    const headers = new Headers(cached.headers);
    headers.set('X-Achaja-Source', 'edge-cache');
    return new Response(cached.body, { status: cached.status, headers });
  }

  let upstream;
  try {
    upstream = await fetch(apiUrl, { cf: { cacheTtl: CACHE_TTL_SECONDS } });
  } catch (e) {
    return fetchStaticFallback(env, request);
  }

  if (!upstream.ok) {
    return fetchStaticFallback(env, request);
  }

  const data = await upstream.json().catch(() => null);
  if (!data || !data.response) {
    return fetchStaticFallback(env, request);
  }

  const items = data?.response?.body?.items?.item || [];
  const records = (Array.isArray(items) ? items : [items]).map(it => ({
    maker: it.manufacturer || it.MANUFACTURER || '',
    model: it.carName || it.CARNAME || '',
    from: it.prdtRngStart || it.PRDTRNGSTART || '',
    to: it.prdtRngEnd || it.PRDTRNGEND || '',
    date: it.recallDate || it.RECALLDATE || '',
    reason: it.recallSbst || it.RECALLSBST || '',
  }));

  const body = JSON.stringify({
    source: '한국교통안전공단 자동차리콜현황 (실시간 API)',
    updatedAt: new Date().toISOString().slice(0, 10),
    count: records.length,
    pageNo: Number(pageNo),
    numOfRows,
    records,
  });

  const response = new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
      'X-Achaja-Source': 'data.go.kr',
    },
  });
  await cache.put(cacheKey, response.clone());
  return response;
}
