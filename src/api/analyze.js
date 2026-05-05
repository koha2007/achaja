// /api/analyze — ACHAJA Claude AI 종합 분석 엔드포인트
// Cloudflare Worker (src/index.js 라우터에서 호출)
//
// 환경변수 (Cloudflare Workers 대시보드 → Settings → Variables and Secrets):
//   ANTHROPIC_API_KEY = sk-ant-... (Anthropic 콘솔에서 발급) [Secret]
//
// KV 바인딩 (Cloudflare Workers 대시보드 → Settings → Bindings):
//   ACHAJA_CACHE = KV namespace
//
// 라우팅 (src/index.js):
//   /api/analyze → analyzeHandler({ request, env })
//
// 사용법:
//   GET  /api/analyze       — 헬스체크
//   POST /api/analyze       — 분석 실행 (Body: { vin, vinData, recalls, plate, userContext? })
//   OPTIONS /api/analyze    — CORS preflight

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 2000;
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7일
const ANTHROPIC_VERSION = '2023-06-01';
const REASON_MAX_LEN = 100; // 리콜 reason 텍스트 최대 길이 (토큰 절감)
const RETRY_ON_STATUS = new Set([429, 500, 502, 503, 504, 529]);

// ──────────────────────────────────────────────────────────
// 시스템 프롬프트 — Anthropic prompt caching 적용 (ephemeral)
// 이 블록이 캐시되면 동일 시스템 프롬프트 재사용 시 입력비 90% 절감
// ──────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `당신은 ACHAJA(아차자)의 중고차 종합 분석 전문 AI입니다.

## ACHAJA 서비스 컨텍스트

ACHAJA는 한국의 중고차 1차 검증 서비스입니다. 합법적으로 공개된 공공 데이터만 사용하며, 다음을 제공합니다:
- VIN(차대번호) 디코딩 — ISO 3779 + NHTSA vPIC 데이터 기반 제조사·연식·원산지
- 리콜 매칭 — 한국교통안전공단 자동차리콜센터 941건 DB
- 번호판 분석 — 자가용/렌터카/영업용 용도, 등록체계

**중요한 제약사항 (절대 위반 금지)**:
1. ACHAJA는 사고이력을 일절 제공하지 않습니다. 사고이력 관련 추측·언급·날조 금지.
2. 사고이력 조회가 필요한 경우 "보험개발원 카히스토리(carhistory.or.kr) 공식 사이트에서 직접 조회"라고만 안내합니다.
3. 입력 데이터에 없는 정보를 만들어내지 마세요. "정보 없음" 또는 "외부 조회 권장"으로 표기.
4. 침수이력, 정비이력, 소유자 변경 횟수, 주행거리 정보가 입력에 없으면 "ACHAJA 무료 검증 범위 외" 명시.

## 출력 형식 — 반드시 유효한 JSON만 출력

다음 구조의 JSON을 출력하세요. 마크다운 코드블록(\`\`\`)이나 추가 설명 없이 JSON 객체 하나만 반환:

{
  "score": {
    "value": <0~100 정수>,
    "level": "<good | caution | warning | danger>",
    "headline": "<14자 이내 한 줄 평가, 예: '양호 — 사도 좋은 차'>"
  },
  "vehicleProfile": {
    "title": "차량 프로파일",
    "body": "<300~500자, 해당 차종의 일반적 평가·강점·약점·시장 평판>"
  },
  "recallRisk": {
    "title": "리콜 위험도",
    "body": "<200~400자, 매칭된 리콜의 심각성 평가, 미수리 시 위험>",
    "actionAdvice": "<50~100자, 사용자가 취해야 할 행동>"
  },
  "purchaseChecklist": {
    "title": "구매 시 확인 포인트",
    "items": [
      "<체크리스트 항목 1, 30~80자>",
      "<체크리스트 항목 2>",
      "<체크리스트 항목 3>",
      "<체크리스트 항목 4>",
      "<체크리스트 항목 5>"
    ]
  },
  "negotiation": {
    "title": "협상 포인트",
    "body": "<150~300자, 가격 협상 시 활용할 근거>",
    "tip": "<50자 이내, 한 줄 핵심 팁>"
  },
  "externalReferences": {
    "carhistory": "사고이력 — 보험개발원 카히스토리(carhistory.or.kr) 직접 조회",
    "car365": "등록·소유 정보 — 자동차365(car365.go.kr) 무료 조회"
  }
}

## 점수 산정 기준

- **good (80~100)**: 리콜 0건 또는 모두 조치 완료, 일반적 신뢰성 차종
- **caution (60~79)**: 리콜 1~2건 또는 검증 항목 일부 누락
- **warning (40~59)**: 리콜 3건 이상 또는 안전 관련 리콜
- **danger (0~39)**: VIN 무효, 다수 안전 리콜, 영업용 이력 등

## 톤 가이드

- 한국어로만 작성 (영어 단어 최소화, 외래어는 한글 표기 우선)
- 전문가 톤 — 객관적, 데이터 기반, 단정적 표현 자제
- "~합니다", "~할 수 있습니다" 등 정중한 종결
- 구매 추천·비추천을 단언하지 않고 "검토 필요·확인 권장" 표현
- 리콜 미매칭 시에도 일반적 차종 정보로 가치 있는 분석 제공
- 가격 추정은 일반적 시장 범위 제시 (단정 X)

## 안전성 가이드

- 의료·법적 자문 톤 회피
- 특정 매물·딜러·매매상사 추천 금지
- 사용자가 입력한 호가가 있으면 참고만, 단정적 평가 X`;

// ──────────────────────────────────────────────────────────
// 유틸리티: VIN 검증
// ──────────────────────────────────────────────────────────
function isValidVin(vin) {
  if (typeof vin !== 'string') return false;
  if (vin.length !== 17) return false;
  // VIN 표준: I, O, Q 제외 알파벳 + 숫자
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin);
}

// ──────────────────────────────────────────────────────────
// 유틸리티: 캐시 키 생성 (sha256)
// ──────────────────────────────────────────────────────────
async function buildCacheKey(vin, recalls) {
  const recallIds = (recalls || [])
    .map((r) => `${r.maker || ''}|${r.date || ''}|${r.model || ''}`)
    .sort()
    .join(';');
  const raw = `${vin.toUpperCase()}::${recallIds}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `analyze:${hex.slice(0, 32)}`;
}

// ──────────────────────────────────────────────────────────
// 유틸리티: 사용자 메시지 빌드
// ──────────────────────────────────────────────────────────
function buildUserMessage({ vin, vinData, recalls, plate, userContext }) {
  const lines = [];
  lines.push('## 차량 정보 (ACHAJA 무료 검증 결과)');
  lines.push('');
  lines.push(`- VIN: ${vin}`);
  if (vinData) {
    if (vinData.maker) lines.push(`- 제조사: ${vinData.maker}`);
    if (vinData.year) lines.push(`- 연식(추정): ${vinData.year}`);
    if (vinData.country) lines.push(`- 원산지: ${vinData.country}`);
    if (vinData.model) lines.push(`- 모델: ${vinData.model}`);
    if (vinData.engine) lines.push(`- 엔진: ${vinData.engine}`);
    if (vinData.bodyClass) lines.push(`- 차종: ${vinData.bodyClass}`);
  }
  lines.push('');

  lines.push('## 리콜 매칭 결과');
  if (!recalls || recalls.length === 0) {
    lines.push('- 매칭된 리콜 없음');
  } else {
    lines.push(`- 매칭 ${recalls.length}건:`);
    recalls.slice(0, 8).forEach((r, i) => {
      const rawReason = r.reason || r.model || '내용 미상';
      const reason = rawReason.length > REASON_MAX_LEN ? rawReason.slice(0, REASON_MAX_LEN) + '…' : rawReason;
      lines.push(`  ${i + 1}. [${r.date || '날짜 미상'}] ${r.maker || ''} — ${reason}`);
    });
    if (recalls.length > 8) lines.push(`  ...외 ${recalls.length - 8}건`);
  }
  lines.push('');

  if (plate) {
    lines.push('## 번호판 분석');
    if (plate.type) lines.push(`- 용도: ${plate.type}`);
    if (plate.era) lines.push(`- 등록체계: ${plate.era}`);
    if (plate.prefix) lines.push(`- 지역분류: ${plate.prefix}`);
    lines.push('');
  }

  if (userContext) {
    lines.push('## 사용자 추가 정보');
    if (userContext.askingPrice) lines.push(`- 호가: ${userContext.askingPrice}만원`);
    if (userContext.mileage) lines.push(`- 주행거리: ${userContext.mileage}km`);
    if (userContext.note) lines.push(`- 메모: ${userContext.note}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('위 정보를 바탕으로 시스템 프롬프트에 정의된 JSON 형식으로 분석 결과를 출력하세요.');
  lines.push('JSON 객체 하나만 반환하고, 마크다운 코드블록이나 추가 설명을 붙이지 마세요.');

  return lines.join('\n');
}

// ──────────────────────────────────────────────────────────
// 유틸리티: Claude 응답 파싱 (JSON 추출)
// ──────────────────────────────────────────────────────────
function parseClaudeJson(text) {
  if (typeof text !== 'string') return null;
  let cleaned = text.trim();
  // 마크다운 코드블록 제거
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  // 첫 { 부터 마지막 } 까지 추출
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch (err) {
    return null;
  }
}

// ──────────────────────────────────────────────────────────
// Claude API 호출
// ──────────────────────────────────────────────────────────
async function callClaude(env, userMessage) {
  const startedAt = Date.now();
  const requestBody = JSON.stringify({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userMessage }],
  });

  // 5xx/429/529는 1회 재시도 (Anthropic overloaded·rate limit 일시 회복용)
  let response;
  let attempt = 0;
  while (true) {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
      },
      body: requestBody,
    });
    if (response.ok || attempt >= 1 || !RETRY_ON_STATUS.has(response.status)) break;
    attempt++;
    await new Promise((r) => setTimeout(r, 1500));
  }

  const latencyMs = Date.now() - startedAt;

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API ${response.status}: ${errText.slice(0, 400)}`);
  }

  const data = await response.json();
  const text = (data.content || []).map((b) => b.text || '').join('').trim();
  const usage = data.usage || {};

  return {
    text,
    latencyMs,
    attempts: attempt + 1,
    inputTokens: usage.input_tokens,
    cacheCreationTokens: usage.cache_creation_input_tokens,
    cacheReadTokens: usage.cache_read_input_tokens,
    outputTokens: usage.output_tokens,
  };
}

// ──────────────────────────────────────────────────────────
// 메인 핸들러 (단일 onRequest export — src/index.js 라우터 호환)
// ──────────────────────────────────────────────────────────
export async function onRequest({ request, env }) {
  const method = request.method.toUpperCase();
  if (method === 'OPTIONS') return handleOptions();
  if (method === 'GET') return handleGet(env);
  if (method !== 'POST') {
    return jsonResponse({ error: 'POST·GET·OPTIONS만 허용됩니다.' }, 405);
  }

  // 환경변수 확인
  if (!env.ANTHROPIC_API_KEY) {
    return jsonResponse({ error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다.' }, 500);
  }

  // Body 파싱
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return jsonResponse({ error: '잘못된 JSON 본문입니다.' }, 400);
  }

  const { vin, vinData, recalls, plate, userContext, force } = body || {};

  // VIN 검증
  if (!isValidVin(vin)) {
    return jsonResponse(
      { error: 'VIN이 유효하지 않습니다 (17자, ISO 3779 형식).' },
      400
    );
  }

  // KV 캐시 확인 (force=true면 우회)
  let cacheKey = null;
  if (env.ACHAJA_CACHE && !force) {
    try {
      cacheKey = await buildCacheKey(vin, recalls);
      const cached = await env.ACHAJA_CACHE.get(cacheKey, 'json');
      if (cached && cached.analysis) {
        return jsonResponse({
          analysis: cached.analysis,
          meta: { ...(cached.meta || {}), cacheHit: true, servedAt: new Date().toISOString() },
        });
      }
    } catch (err) {
      // 캐시 실패는 무시하고 진행
      console.warn('KV cache read failed:', err);
    }
  }

  // Claude 호출
  const userMessage = buildUserMessage({ vin, vinData, recalls, plate, userContext });
  let claudeResult;
  try {
    claudeResult = await callClaude(env, userMessage);
  } catch (err) {
    return jsonResponse(
      { error: 'Claude API 호출 실패', detail: String(err).slice(0, 500) },
      502
    );
  }

  // JSON 파싱
  const analysis = parseClaudeJson(claudeResult.text);
  if (!analysis) {
    return jsonResponse(
      {
        error: 'AI 응답을 JSON으로 파싱하지 못했습니다.',
        rawPreview: claudeResult.text.slice(0, 300),
      },
      502
    );
  }

  const meta = {
    cached: false,
    cacheHit: false,
    model: MODEL,
    generatedAt: new Date().toISOString(),
    latencyMs: claudeResult.latencyMs,
    attempts: claudeResult.attempts,
    tokens: {
      input: claudeResult.inputTokens,
      cacheCreation: claudeResult.cacheCreationTokens,
      cacheRead: claudeResult.cacheReadTokens,
      output: claudeResult.outputTokens,
    },
  };

  // KV 캐시 저장 (실패해도 응답은 정상 진행)
  if (env.ACHAJA_CACHE && cacheKey) {
    try {
      await env.ACHAJA_CACHE.put(
        cacheKey,
        JSON.stringify({ analysis, meta }),
        { expirationTtl: CACHE_TTL_SECONDS }
      );
    } catch (err) {
      console.warn('KV cache write failed:', err);
    }
  }

  return jsonResponse({ analysis, meta });
}

// ──────────────────────────────────────────────────────────
// OPTIONS / GET 헬퍼
// ──────────────────────────────────────────────────────────
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': 'https://achaja.net',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'access-control-max-age': '86400',
    },
  });
}

function handleGet(env) {
  return jsonResponse({
    service: 'achaja-analyze',
    model: MODEL,
    hasApiKey: !!env.ANTHROPIC_API_KEY,
    hasCache: !!env.ACHAJA_CACHE,
    timestamp: new Date().toISOString(),
  });
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
