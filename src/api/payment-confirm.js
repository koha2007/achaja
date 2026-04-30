// TossPayments 결제 승인 API 핸들러
// POST /api/payment/confirm
// Body: { paymentKey, orderId, amount }
// env.TOSS_SECRET_KEY (wrangler secret put TOSS_SECRET_KEY)

const VALID_AMOUNTS = new Set([4900, 2900, 1500, 1900]);

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return json({ ok: false, code: 'METHOD_NOT_ALLOWED', message: 'POST 요청만 허용됩니다.' }, 405);
  }

  if (!env.TOSS_SECRET_KEY) {
    return json({ ok: false, code: 'SECRET_NOT_CONFIGURED', message: '서버 설정 오류: 결제 시크릿 키가 등록되지 않았습니다.' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: 'INVALID_JSON', message: '잘못된 요청 본문입니다.' }, 400);
  }

  const { paymentKey, orderId, amount } = body || {};
  if (!paymentKey || !orderId || typeof amount !== 'number') {
    return json({ ok: false, code: 'MISSING_PARAMS', message: 'paymentKey, orderId, amount가 필요합니다.' }, 400);
  }

  if (!VALID_AMOUNTS.has(amount)) {
    return json({ ok: false, code: 'INVALID_AMOUNT', message: `허용되지 않은 결제 금액: ${amount}` }, 400);
  }

  const auth = 'Basic ' + btoa(env.TOSS_SECRET_KEY + ':');

  let tossRes, tossData;
  try {
    tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });
    tossData = await tossRes.json();
  } catch (err) {
    return json({ ok: false, code: 'TOSS_NETWORK_ERROR', message: 'PG 통신 오류: ' + (err?.message || err) }, 502);
  }

  if (!tossRes.ok) {
    return json({
      ok: false,
      code: tossData?.code || `TOSS_HTTP_${tossRes.status}`,
      message: tossData?.message || '결제 승인 실패',
    }, tossRes.status);
  }

  return json({
    ok: true,
    payment: {
      orderId: tossData.orderId,
      orderName: tossData.orderName,
      method: tossData.method,
      totalAmount: tossData.totalAmount,
      status: tossData.status,
      approvedAt: tossData.approvedAt,
      receipt: tossData.receipt?.url,
    },
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
