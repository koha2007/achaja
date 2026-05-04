# Claude AI 분석 API 설정 가이드

ACHAJA 유료 종합 리포트의 핵심 기능 — Claude Sonnet 4.6 기반 AI 분석.

## 0. 사전 요구사항

- Anthropic 콘솔 계정 (https://console.anthropic.com)
- Cloudflare Pages 계정 (이미 ACHAJA 배포 중)
- Cloudflare KV 사용 권한 (Pages 무료 플랜 포함)

---

## 1. Anthropic API 키 발급

1. https://console.anthropic.com/settings/keys 접속
2. **Create Key** 클릭 → 이름: `achaja-production`
3. 생성된 키 복사 (sk-ant-... 로 시작)
4. **즉시 안전한 곳에 저장** — 다시 볼 수 없음
5. https://console.anthropic.com/settings/billing 에서 **$5~$10 크레딧 충전**
   - $5 = 약 1만 건 호출 가능 (Sonnet 4.6 기준, 캐시 적용 시 더 많음)
   - 자동 충전 OFF 권장 (예산 보호)

---

## 2. Cloudflare KV 네임스페이스 생성

캐싱용. 동일 차량 재조회 시 비용 0원으로 즉시 반환.

### Cloudflare 대시보드에서:
1. **Workers & Pages** → 좌측 **KV** 메뉴
2. **Create a namespace** 클릭
3. 이름: `ACHAJA_CACHE`
4. 생성 후 namespace ID 복사 (필수 아님, 바인딩 시 이름으로 연결)

---

## 3. Cloudflare Pages 환경변수 설정

### 대시보드에서:
1. **Workers & Pages** → ACHAJA 프로젝트 선택
2. **Settings** → **Environment variables** 탭
3. **Production** 환경에 추가:

| Variable | Value |
|----------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` (1단계에서 발급한 키) |

> **Encrypt** 옵션 반드시 ON (시크릿 키)

4. **Save** 클릭

---

## 4. KV 바인딩 설정 (가장 중요)

### 대시보드에서:
1. **Settings** → **Functions** 탭 (또는 **Bindings**)
2. **KV namespace bindings** 섹션 → **Add binding**:

| Variable name | KV namespace |
|---------------|--------------|
| `ACHAJA_CACHE` | `ACHAJA_CACHE` (2단계에서 만든 것) |

3. **Save** 클릭
4. **재배포 필요** — 다음 push 또는 대시보드에서 **Redeploy** 클릭

---

## 5. 배포 후 동작 확인

### 5-1. 헬스체크 (GET)
```bash
curl https://achaja.net/api/analyze
```

기대 응답:
```json
{
  "service": "achaja-analyze",
  "model": "claude-sonnet-4-6",
  "hasApiKey": true,
  "hasCache": true,
  "timestamp": "2026-05-04T..."
}
```

`hasApiKey: false` 면 환경변수 미설정, `hasCache: false` 면 KV 바인딩 미설정.

### 5-2. 실제 분석 호출 (POST)
```bash
curl -X POST https://achaja.net/api/analyze \
  -H "content-type: application/json" \
  -d '{
    "vin": "KMHLS81UMMU123456",
    "vinData": {
      "maker": "현대자동차",
      "year": "2021",
      "country": "한국",
      "model": "아반떼",
      "bodyClass": "세단"
    },
    "recalls": [
      {
        "maker": "현대자동차",
        "date": "2022-03-15",
        "model": "아반떼 CN7",
        "reason": "엔진 ECU 소프트웨어 결함으로 시동 꺼짐 가능"
      }
    ],
    "plate": {
      "type": "자가용",
      "era": "2006~"
    }
  }'
```

기대 응답: 5섹션 JSON (score, vehicleProfile, recallRisk, purchaseChecklist, negotiation, externalReferences) + meta.

### 5-3. 캐시 히트 확인
같은 요청을 두 번째 실행 → meta.cacheHit: true, latencyMs 50~200ms로 떨어져야 정상.

---

## 6. 비용 모니터링

### Anthropic 콘솔
- https://console.anthropic.com/settings/usage 에서 일일 사용량 확인
- 토큰별 비용:
  - 입력 (캐시 미사용): $3/1M tokens
  - 입력 (캐시 적중): $0.30/1M tokens (90% 할인)
  - 출력: $15/1M tokens
- 1건 평균: 입력 1,500 + 출력 1,500 = 약 ₩15~20
- 캐시 적중 시: 약 ₩10

### KV 모니터링
- Cloudflare 대시보드 → KV → ACHAJA_CACHE → Metrics
- 무료 플랜: 일 100,000 reads / 1,000 writes / 1GB 저장
- 캐시 적중률 계산 가능

---

## 7. 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| `ANTHROPIC_API_KEY가 설정되지 않았습니다` | 환경변수 미설정 또는 재배포 안 됨 | 3단계 재확인 + Redeploy |
| `Claude API 401` | API 키 잘못 또는 무효화 | Anthropic 콘솔에서 새 키 발급 |
| `Claude API 429` | Rate limit 초과 | 분당 호출 제한, 잠시 대기 |
| `Claude API 529` | Anthropic overloaded | 몇 초 후 재시도 |
| `AI 응답을 JSON으로 파싱하지 못했습니다` | 모델이 마크다운 포함 출력 | 정상 — `rawPreview` 확인 후 프롬프트 보강 |
| `KV cache read failed` | KV 바인딩 미설정 | 4단계 재확인 |

---

## 8. 다음 단계 (Phase 2 이후)

- [ ] 결과 화면 연동 (`/history` 페이지에서 결제 후 호출)
- [ ] 결제 검증 미들웨어 (토스 secret key로 결제 완료 확인 후 분석 트리거)
- [ ] PDF 생성 (Cloudflare Browser Rendering)
- [ ] 사용량 통계 대시보드 (캐시 적중률, 평균 비용)

---

## 9. 보안 체크리스트

- [x] API 키는 Cloudflare 환경변수(Encrypted)에만 저장 — 코드·git에 노출 X
- [x] 클라이언트 → 서버 → Claude 흐름 (API 키 브라우저 노출 X)
- [x] CORS 설정: achaja.net 만 허용
- [ ] Rate limit (Cloudflare WAF Rules로 IP당 분당 호출 제한 권장)
- [ ] 결제 검증 후에만 호출 가능하도록 게이트 (Phase 3)
