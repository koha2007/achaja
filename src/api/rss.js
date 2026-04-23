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

function escapeXml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') || 'all';
  const query = CATEGORY_QUERIES[category] || CATEGORY_QUERIES.all;

  if (!env.NAVER_CLIENT_ID || !env.NAVER_CLIENT_SECRET) {
    return new Response('<?xml version="1.0"?><error>API_KEY_MISSING</error>', {
      status: 500,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }

  const apiUrl = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=30&sort=date`;

  let upstream;
  try {
    upstream = await fetch(apiUrl, {
      headers: {
        'X-Naver-Client-Id': env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': env.NAVER_CLIENT_SECRET,
      },
    });
  } catch {
    return new Response('<?xml version="1.0"?><error>UPSTREAM_FETCH_FAILED</error>', {
      status: 502,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }

  if (!upstream.ok) {
    return new Response(`<?xml version="1.0"?><error>UPSTREAM_${upstream.status}</error>`, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }

  const data = await upstream.json();
  const items = (data.items || []).map(item => {
    const title = stripHtml(item.title);
    const description = stripHtml(item.description);
    const link = item.originallink || item.link;
    const pubDate = item.pubDate;
    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${escapeXml(pubDate)}</pubDate>
    </item>`;
  }).join('\n');

  const lastBuildDate = new Date().toUTCString();
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ACHAJA 자동차 뉴스</title>
    <link>https://achaja.net/news</link>
    <atom:link href="https://achaja.net/rss.xml" rel="self" type="application/rss+xml" />
    <description>신차 출시, 리콜 공지, 중고차 시장 동향, 자동차 정책 뉴스를 매일 업데이트합니다.</description>
    <language>ko-KR</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <ttl>60</ttl>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    },
  });
}
