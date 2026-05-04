import { onRequest as newsHandler } from './api/news.js';
import { onRequest as rssHandler } from './api/rss.js';
import { onRequest as paymentConfirmHandler } from './api/payment-confirm.js';
import { onRequest as recallsHandler } from './api/recalls.js';
import { onRequest as analyzeHandler } from './api/analyze.js';

// CSP Report-Only — 1주 모니터링 후 강제 모드 전환 예정.
// AdSense, GA4, Clarity, TossPayments, Google Fonts, Tailwind CDN 모두 허용.
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.googletagservices.com https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://www.clarity.ms https://*.clarity.ms https://cdn.tailwindcss.com https://js.tosspayments.com https://*.tosspayments.com https://ajax.googleapis.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https: http:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.clarity.ms https://*.clarity.ms https://www.googletagmanager.com https://api.tosspayments.com https://*.tosspayments.com https://vpic.nhtsa.dot.gov https://apis.data.go.kr https://achaja.net",
  "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://*.tosspayments.com https://*.toss.im",
  "frame-ancestors 'self'",
  "form-action 'self' https://*.tosspayments.com",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests"
].join('; ');

const SECURITY_HEADERS = {
  'Content-Security-Policy-Report-Only': CSP_DIRECTIVES,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(self "https://*.tosspayments.com")'
};

function withSecurityHeaders(response) {
  // 새 Response 생성해서 보안 헤더 추가 (기존 헤더 보존)
  const newHeaders = new Headers(response.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    newHeaders.set(k, v);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let response;
    if (url.pathname === '/api/news') {
      response = await newsHandler({ request, env });
    } else if (url.pathname === '/api/recalls') {
      response = await recallsHandler({ request, env });
    } else if (url.pathname === '/api/payment/confirm') {
      response = await paymentConfirmHandler({ request, env });
    } else if (url.pathname === '/api/analyze') {
      response = await analyzeHandler({ request, env });
    } else if (url.pathname === '/rss.xml') {
      response = await rssHandler({ request, env });
    } else {
      response = await env.ASSETS.fetch(request);
    }
    return withSecurityHeaders(response);
  },
};
