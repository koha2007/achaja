// TossPayments 결제 SDK v2 — 단건 결제 트리거
// 클라이언트 키는 frontend 노출 OK (시크릿 키와 다름)
const TOSS_CLIENT_KEY = 'test_ck_QbgMGZzorzKXvmBPMRZv8l5E1em4';

const PRODUCTS = {
  comprehensive: { name: '종합 리포트 (단건)', amount: 1900 },
  pack5: { name: '종합 리포트 묶음 5건', amount: 7900 },
};

function generateOrderId(productKey) {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `achaja_${productKey}_${ts}_${rand}`;
}

let tossPaymentsInstance = null;

async function ensureTossPayments() {
  if (tossPaymentsInstance) return tossPaymentsInstance;
  if (typeof window.TossPayments !== 'function') {
    throw new Error('TossPayments SDK가 로드되지 않았습니다.');
  }
  tossPaymentsInstance = window.TossPayments(TOSS_CLIENT_KEY);
  return tossPaymentsInstance;
}

async function requestPayment(productKey) {
  const product = PRODUCTS[productKey];
  if (!product) {
    alert('알 수 없는 상품입니다.');
    return;
  }

  try {
    const tossPayments = await ensureTossPayments();
    const payment = tossPayments.payment({ customerKey: 'ANONYMOUS' });
    const orderId = generateOrderId(productKey);

    sessionStorage.setItem(
      `achaja_order_${orderId}`,
      JSON.stringify({ productKey, productName: product.name, amount: product.amount, createdAt: Date.now() })
    );

    if (window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'KRW',
        value: product.amount,
        items: [{ item_id: productKey, item_name: product.name, price: product.amount, quantity: 1 }],
      });
    }

    await payment.requestPayment({
      method: 'CARD',
      amount: { currency: 'KRW', value: product.amount },
      orderId,
      orderName: `ACHAJA ${product.name}`,
      successUrl: `${window.location.origin}/payment/success/`,
      failUrl: `${window.location.origin}/payment/fail/`,
      card: {
        useEscrow: false,
        flowMode: 'DEFAULT',
        useCardPoint: false,
        useAppCardOnly: false,
      },
    });
  } catch (err) {
    if (err && err.code === 'USER_CANCEL') return;
    console.error('[payment] requestPayment error:', err);
    alert('결제 요청 중 오류가 발생했습니다: ' + (err?.message || err));
  }
}

window.achajaPayment = { request: requestPayment, products: PRODUCTS };
