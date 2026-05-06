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
    console.error('[payment-confirm] TOSS_SECRET_KEY not configured');
    return json({ ok: false, code: 'SERVICE_UNAVAILABLE', message: '결제 시스템 점검 중입니다. 잠시 후 다시 시도해주세요.' }, 503);
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
    console.error('[payment-confirm] toss network error:', err);
    return json({ ok: false, code: 'NETWORK_ERROR', message: '결제 승인 통신 오류입니다. 잠시 후 다시 시도해주세요.' }, 502);
  }

  if (!tossRes.ok) {
    console.error('[payment-confirm] toss declined', tossRes.status, tossData?.code, tossData?.message);
    return json({
      ok: false,
      code: tossData?.code || 'PAYMENT_DECLINED',
      message: tossData?.message || '결제 승인에 실패했습니다.',
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
