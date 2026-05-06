/* /api/send-result — 사용자에게 차량 이력 결과를 이메일로 발송
   Provider: Brevo (현재) / Resend (전환 가능 — env.EMAIL_PROVIDER로 분기)
   백엔드 미설정(API 키 없음) 시 503 응답 → 클라이언트 mailto 폴백 */

const RATE_LIMIT_HOURLY = 5;   // IP당 시간당 5회
const RATE_LIMIT_DAILY  = 20;  // IP당 일 20회
const RATE_LIMIT_GLOBAL = 200; // 글로벌 일 200회 (남용 방지 절대 상한)

const SENDER_EMAIL = 'noreply@achaja.net';
const SENDER_NAME  = 'ACHAJA';
const REPLY_TO_EMAIL = 'koha3d77@gmail.com';

const ALLOWED_ORIGINS = [
  'https://achaja.net',
  'https://www.achaja.net',
  'https://achaja-koha2007.pages.dev',
];

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function isValidEmail(s) {
  return typeof s === 'string'
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
    && s.length <= 254;
}

async function checkRateLimit(env, ip) {
  if (!env.ACHAJA_CACHE) return { ok: true }; // KV 미바인딩 시 우회
  const now = Date.now();
  const hourKey  = 'rl:send-result:hour:' + ip + ':' + Math.floor(now / 3_600_000);
  const dayKey   = 'rl:send-result:day:'  + ip + ':' + Math.floor(now / 86_400_000);
  const globalKey= 'rl:send-result:global:' + Math.floor(now / 86_400_000);

  const [hourCount, dayCount, globalCount] = await Promise.all([
    env.ACHAJA_CACHE.get(hourKey),
    env.ACHAJA_CACHE.get(dayKey),
    env.ACHAJA_CACHE.get(globalKey),
  ]);

  if (Number(hourCount || 0) >= RATE_LIMIT_HOURLY) return { ok: false, reason: 'hour' };
  if (Number(dayCount  || 0) >= RATE_LIMIT_DAILY)  return { ok: false, reason: 'day' };
  if (Number(globalCount || 0) >= RATE_LIMIT_GLOBAL) return { ok: false, reason: 'global' };

  // increment (best-effort, no atomic guarantee — Workers KV 특성상 충분)
  await Promise.all([
    env.ACHAJA_CACHE.put(hourKey,   String(Number(hourCount || 0) + 1),   { expirationTtl: 3600 }),
    env.ACHAJA_CACHE.put(dayKey,    String(Number(dayCount  || 0) + 1),   { expirationTtl: 86400 }),
    env.ACHAJA_CACHE.put(globalKey, String(Number(globalCount|| 0) + 1), { expirationTtl: 86400 }),
  ]);
  return { ok: true };
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

function buildEmailHtml(payload) {
  const vin = payload.vin || '';
  const plate = payload.plate || '';
  const url = payload.url || 'https://achaja.net/';
  const subject = payload.subject || 'ACHAJA 차량 이력 조회 결과';
  const bodyText = payload.body || '';

  const bodyHtml = escapeHtml(bodyText)
    .replace(/\n────────────?\n/g, '<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;"/>')
    .replace(/\n/g, '<br/>');

  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"/><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic','맑은 고딕','Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif;color:#111827;-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">

        <!-- Header -->
        <tr><td style="padding:24px;background:linear-gradient(135deg,#0d47a1 0%,#1565c0 100%);">
          <div style="font-size:24px;font-weight:800;color:white;letter-spacing:-0.5px;">ACHAJA</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:4px;">차량 이력 조회 결과</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:24px;">
          <h2 style="font-size:18px;font-weight:700;color:#0d47a1;margin:0 0 16px;line-height:1.4;">${escapeHtml(subject)}</h2>
          <div style="font-size:14px;line-height:1.7;color:#374151;">${bodyHtml}</div>

          ${(vin || plate) ? `
          <div style="margin-top:20px;padding:16px;background:#f9fafb;border-left:4px solid #0d47a1;border-radius:4px;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;font-weight:700;color:#6b7280;margin-bottom:8px;">조회 차량 정보</div>
            ${vin ? `<div style="font-size:13px;color:#111827;margin-bottom:4px;"><strong>VIN:</strong> <code style="font-family:monospace;background:#fff;padding:2px 6px;border-radius:3px;border:1px solid #e5e7eb;">${escapeHtml(vin)}</code></div>` : ''}
            ${plate ? `<div style="font-size:13px;color:#111827;"><strong>차량번호:</strong> <code style="font-family:monospace;background:#fff;padding:2px 6px;border-radius:3px;border:1px solid #e5e7eb;">${escapeHtml(plate)}</code></div>` : ''}
          </div>
          ` : ''}

          <a href="${escapeHtml(url)}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#0d47a1;color:white;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">결과 페이지에서 다시 보기 →</a>
        </td></tr>

        <!-- 외부 공식기관 안내 -->
        <tr><td style="padding:0 24px 16px;">
          <div style="padding:12px;background:#fef3c7;border-radius:6px;font-size:12px;color:#92400e;">
            <strong>📌 추가 조회 권장:</strong> 사고·침수 이력은 <a href="https://www.carhistory.or.kr" style="color:#92400e;font-weight:700;">카히스토리</a>(₩770~), 리콜 미수리는 <a href="https://car.go.kr" style="color:#92400e;font-weight:700;">자동차리콜센터</a>(무료), 소유·저당은 <a href="https://www.car365.go.kr" style="color:#92400e;font-weight:700;">자동차365</a>(무료)에서.
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:11px;color:#6b7280;line-height:1.6;">
          <div style="margin-bottom:6px;">발급: 코하(Koha) · 사업자 108-16-82025 · 010-8947-1841 · <a href="mailto:koha3d77@gmail.com" style="color:#0d47a1;">koha3d77@gmail.com</a></div>
          <div style="margin-bottom:6px;">데이터 출처: 한국교통안전공단 · NHTSA vPIC · ISO 3779 · ACHAJA 자체 분석</div>
          <div>※ ACHAJA는 사고·침수 이력을 직접 보관·재배포하지 않습니다. 본 메일은 사용자가 직접 발송 요청한 결과이며, 신청자 정보는 발송 후 즉시 폐기됩니다.</div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildEmailText(payload) {
  return (payload.body || '') +
    '\n\n────\n결과 페이지: ' + (payload.url || 'https://achaja.net/') +
    '\n\n발급: 코하(Koha) · 사업자 108-16-82025\n' +
    'koha3d77@gmail.com · achaja.net';
}

/* ──────────────────────────────────────────────────
   Provider 1: Brevo (api.brevo.com)
   ────────────────────────────────────────────────── */
async function sendViaBrevo(payload, env) {
  const apiKey = env.BREVO_API_KEY;
  if (!apiKey) return { ok: false, status: 503, error: 'email_provider_not_configured', detail: 'BREVO_API_KEY not set' };

  const body = {
    sender: { email: SENDER_EMAIL, name: SENDER_NAME },
    to: [{ email: payload.email }],
    replyTo: { email: REPLY_TO_EMAIL, name: 'ACHAJA 운영' },
    subject: payload.subject || 'ACHAJA 차량 이력 조회 결과',
    htmlContent: buildEmailHtml(payload),
    textContent: buildEmailText(payload),
    tags: ['achaja', payload.vin ? 'vin' : 'plate'],
  };

  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'content-type': 'application/json',
      'accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const errText = await r.text().catch(() => 'no body');
    return { ok: false, status: r.status, error: 'provider_error', detail: errText.slice(0, 500) };
  }

  const data = await r.json().catch(() => ({}));
  return { ok: true, messageId: data.messageId || null, provider: 'brevo' };
}

/* ──────────────────────────────────────────────────
   Provider 2: Resend (api.resend.com) — 전환 시 EMAIL_PROVIDER=resend
   ────────────────────────────────────────────────── */
async function sendViaResend(payload, env) {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, status: 503, error: 'email_provider_not_configured', detail: 'RESEND_API_KEY not set' };

  const body = {
    from: SENDER_NAME + ' <' + SENDER_EMAIL + '>',
    to: [payload.email],
    reply_to: REPLY_TO_EMAIL,
    subject: payload.subject || 'ACHAJA 차량 이력 조회 결과',
    html: buildEmailHtml(payload),
    text: buildEmailText(payload),
    tags: [{ name: 'kind', value: payload.vin ? 'vin' : 'plate' }],
  };

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'authorization': 'Bearer ' + apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const errText = await r.text().catch(() => 'no body');
    return { ok: false, status: r.status, error: 'provider_error', detail: errText.slice(0, 500) };
  }

  const data = await r.json().catch(() => ({}));
  return { ok: true, messageId: data.id || null, provider: 'resend' };
}

/* ──────────────────────────────────────────────────
   Main handler
   ────────────────────────────────────────────────── */
export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'method_not_allowed' }, 405);
  }

  // Origin 검증 (CSRF)
  const origin = request.headers.get('Origin') || '';
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return jsonResponse({ ok: false, error: 'origin_not_allowed' }, 403);
  }

  // IP 추출 + Rate limit
  const ip = request.headers.get('CF-Connecting-IP') ||
             request.headers.get('X-Forwarded-For') || 'unknown';
  const rl = await checkRateLimit(env, ip);
  if (!rl.ok) {
    return jsonResponse({
      ok: false,
      error: 'rate_limited',
      detail: '시간당 ' + RATE_LIMIT_HOURLY + '회 / 일 ' + RATE_LIMIT_DAILY + '회 한도',
    }, 429);
  }

  // 입력 파싱·검증
  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'invalid_json' }, 400);
  }

  if (!isValidEmail(payload.email)) {
    return jsonResponse({ ok: false, error: 'invalid_email' }, 400);
  }
  if (!payload.subject || !payload.body) {
    return jsonResponse({ ok: false, error: 'missing_fields', detail: 'subject and body required' }, 400);
  }

  // 길이 상한
  if (String(payload.body).length > 10000) {
    return jsonResponse({ ok: false, error: 'body_too_long' }, 400);
  }

  // Provider 선택 — env.EMAIL_PROVIDER로 전환 가능 (default: brevo)
  const provider = (env.EMAIL_PROVIDER || 'brevo').toLowerCase();
  let result;
  if (provider === 'resend') {
    result = await sendViaResend(payload, env);
  } else {
    result = await sendViaBrevo(payload, env);
  }

  if (!result.ok) {
    // 백엔드 미설정 → 503 (클라이언트가 mailto 폴백)
    return jsonResponse({
      ok: false,
      error: result.error,
      detail: result.detail || null,
    }, result.status || 500);
  }

  return jsonResponse({
    ok: true,
    provider: result.provider,
    messageId: result.messageId,
  }, 200);
}
