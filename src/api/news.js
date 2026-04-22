const CATEGORY_QUERIES = {
  all: '자동차',
  new: '신차 출시',
  used: '중고차',
  recall: '자동차 리콜',
  industry: '자동차 산업',
  policy: '자동차 정책',
};

function stripHtml(s) {
  if (!s) return '';
  return s.replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function extractSource(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return host.split('.')[0];
  } catch {
    return '';
  }
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') || 'all';
  const query = CATEGORY_QUERIES[category] || CATEGORY_QUERIES.all;
  const display = Math.min(parseInt(url.searchParams.get('display') || '20', 10), 30);

  if (!env.NAVER_CLIENT_ID || !env.NAVER_CLIENT_SECRET) {
    return new Response(JSON.stringify({ error: 'API_KEY_MISSING' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiUrl = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=${display}&sort=date`;

  let upstream;
  try {
    upstream = await fetch(apiUrl, {
      headers: {
        'X-Naver-Client-Id': env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': env.NAVER_CLIENT_SECRET,
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'UPSTREAM_FETCH_FAILED' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!upstream.ok) {
    const body = await upstream.text();
    return new Response(JSON.stringify({ error: 'UPSTREAM_ERROR', status: upstream.status, body }), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await upstream.json();
  const items = (data.items || []).map(item => ({
    title: stripHtml(item.title),
    description: stripHtml(item.description),
    link: item.originallink || item.link,
    source: extractSource(item.originallink || item.link),
    pubDate: item.pubDate,
  }));

  return new Response(JSON.stringify({ category, items }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  });
}
