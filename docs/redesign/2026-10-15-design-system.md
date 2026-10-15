# ACHAJA 대개편 — 디자인 벤치마크 & 디자인 시스템

작성일: 2026-10-15 · 상태: **D1~D5 완료 (2026-10-15, 커밋됨·미배포)**
선행 문서: `2026-10-15-free-redesign.md` 7장(디자인 대개편)

---

## 1. 글로벌 벤치마크 — 참고할 점

| 대상 | 확인한 사실 | ACHAJA에 적용 |
|---|---|---|
| **미국 자동차 사이트 사용성 벤치마크** (MeasuringU 2026) | 모든 사이트에서 가장 많은 불만은 **"화면이 어수선하다(visual clutter)"**. Edmunds는 "길을 잃기 쉽다"는 평. 사용성 1위 cars.com, 2위 Carvana | 지금 홈은 가격표·비교표·카드가 겹겹이 쌓여 어수선했다 → **한 구역 = 한 메시지 = 버튼 하나**. 홈 섹션 수를 절반 이하로 |
| **Carvana** | 깔끔하고 훑어보기 쉬운 화면, 월 납입금·주행거리·차종 필터 | 도구 화면은 입력 → 결과가 한눈에. 숫자(가격·점수)를 크게 |
| **CarGurus** | 매물마다 **딜 등급 라벨**(Great~Overpriced)이 정체성. 8년 묵은 홈을 디지털 우선 브랜드로 리프레시 | ACHAJA의 **신호등 판정 배지**(적정/주의/위험)를 사이트 전체의 시그니처로 |
| **Auto Trader UK** (Studio Output 리브랜딩) | 기존 파랑·빨강을 살린 넓어진 팔레트, 평면 일러스트, **차가 아니라 '차로 누리는 삶'을 보여 주는 라이프스타일 사진** | 남색 브랜드 유지 + 의미색 확장. 사진은 차 단독 컷보다 **도로·풍경·운전 장면** |
| **Motor1** (2024 전면 개편) | 슬라이더를 버리고 **크기가 다른 상자(카드) 그리드**로 기사 배치, 읽기 중심의 깔끔한 기사 페이지, 주제별 **컬렉션**, 그래픽 경량화로 빠른 로딩 | 소식·가이드는 **대표 카드 1개 + 작은 카드 여러 개** 그리드. 슬라이더 금지. 주제별 묶음(살 때/아플 때/관리) |
| **토스** (UX 라이팅·TDS) | 해요체 통일, 능동형·긍정형 문장, **빈 문장 금지**, 다음 화면을 예측할 수 있는 힌트, 원칙(가이드)과 컴포넌트 규칙(시스템)을 분리 | 모든 문구 해요체. 버튼은 "다음에 일어날 일"을 말한다("조회 →" 대신 "무료로 조회하기"). 장식용 문장 삭제 |
| **Pretendard** | 한글·영문·숫자 통합 글꼴, **동적 서브셋**(페이지에 필요한 글자 조각만 로드), 가변(variable) 버전이 가장 가벼움 | Manrope·Inter(한글 미지원) → **Pretendard Variable 동적 서브셋**으로 통일 |

---

## 2. 디자인 원칙 (ACHAJA)

1. **한 구역, 한 메시지, 한 행동** — 섹션마다 제목 1개, 핵심 문장 1개, 주 버튼 1개.
2. **판정은 신호등으로** — 초록(적정·안전) / 주황(주의) / 빨강(위험). 이 3색은 판정·긴급도·등락에만 쓴다.
3. **사진은 '도로 위의 삶'** — 도로·풍경·운전 장면. 번호판·얼굴이 식별되는 사진은 쓰지 않는다. 모든 사진에 출처 표기.
4. **숫자는 크고 정렬되게** — 가격·점수·유가는 고정폭 숫자(tabular-nums).
5. **해요체, 능동형, 빈 문장 없음** — 버튼은 결과를 말한다.
6. **빠르게** — 화면 스타일은 미리 만든 CSS 1개, 사진은 WebP + 지연 로딩, 첫 화면 사진만 우선 로딩.

---

## 3. 디자인 토큰

### 색
- **브랜드**: 남색 유지 — `primary` 0 49 120 / `primary-container` 13 71 161 (다크: 176 198 255 / 0 49 120)
- **표면**: 기존 Material 계열 표면 토큰을 하나로 통일(페이지마다 달랐던 값 정리)
- **의미색(신규)**: `go`(초록) / `caution`(주황) / `stop`(빨강) — 각각 진한 글자색 + 옅은 배경색, 다크 모드 별도
- **수정**: 다크 모드 `muted-strong`이 배경과 거의 같은 색(82 82 91)이라 푸터 글자가 거의 안 보였다 → 밝은 값으로 수정

### 글꼴
- `Pretendard Variable` (jsDelivr 동적 서브셋, 버전 고정 1.3.9) → 시스템 글꼴 폴백
- `font-headline`, `font-body` 모두 Pretendard (기존 클래스 이름 유지로 대량 수정 회피)

### 간격·모서리·그림자
- 간격 이름(xs 4 / sm 8 / md 16 / lg 24 / xl 32 / margin 20)은 유지
- 카드 모서리 16px(`rounded-2xl`) 기본, 큰 히어로 카드 24px
- 그림자는 아주 약하게(`shadow-card`), 테두리로 구분

---

## 4. 구조 (기술)

- **Tailwind CDN 제거 → 빌드된 CSS 1개** (`/css/app.css`). 소스: `css/src/app.css` + `tailwind.config.js`. 빌드: `npm run build:css`. 결과 파일은 저장소에 커밋한다(배포에 빌드 단계 불필요).
- **공용 헤더·푸터·하단 탭**: `partials/`의 조각을 `scripts/build-layout.js`가 각 페이지의 표시 구간(`<!-- @layout:header -->`)에 끼워 넣는다. 한 곳을 고치면 모든 페이지에 반영.
- 블로그 생성기(`scripts/gen-blog-posts.js`)도 같은 공용 조각을 사용.

---

## 5. 사진 라이브러리

- 위치: `img/photos/*.webp` + 목록 `data/photos.json` (파일·제목·작가·라이선스·원본 링크·태그)
- **1차 소스: 위키미디어 공용** — 파일별 라이선스가 명시돼 있어 확인 가능. **CC0·퍼블릭 도메인·CC BY만** 사용(CC BY-SA 등 동일조건 라이선스는 제외), 출처 캡션 필수.
- Unsplash·Pexels는 API 키 발급 후 추가(무료). 키가 없으면 검색 접근이 막혀 있음(2026-10-15 확인).
- 규칙: 가로 사진, 1600px 이상 원본, 번호판·얼굴 식별 불가, 태그(계절·날씨·도로·도시·야간·정비 등) 부여.

---

## 6. 구현 단계

| 단계 | 내용 | 검증 |
|---|---|---|
| D1 | 빌드 CSS 도입 (글꼴은 그대로) | 모든 페이지 CDN 대비 화면 비교(픽셀 차이) |
| D2 | 토큰 통일 + Pretendard + 다크 대비 수정 | 주요 페이지 스크린샷 |
| D3 | 공용 헤더·푸터·하단 탭 + 새 메뉴(살 때·아플 때·관리·소식·내 차) + 허브 페이지 | 모든 페이지 링크·활성 표시 |
| D4 | 사진 라이브러리 + 새 홈 | 모바일·데스크톱·다크 |
| D5 | 기사(블로그) 템플릿: 대표 사진·요약·관련 도구 | 생성기 재실행 결과 비교 |

### 진행 기록 (2026-10-15)
- D1 완료: 58개 페이지 CDN 대비 픽셀 비교 57개 동일(나머지 1개는 설정 누락 버그가 고쳐진 것)
- D2 완료: 토큰 통일, Pretendard, 다크 muted-strong 대비 수정
- D3 완료: 공용 헤더·하단 탭·푸터, 새 메뉴, 허브 3개, 사진 34장(위키미디어 공용)
- D4 완료: 새 홈(섹션 13 → 6), 영어 모드 번역 누락 0
- D5 완료: 가이드 43편 대표 사진·허브 경로·사진 카드 추천 글
- 검증: 61개 페이지 스크립트 오류 0, 내부 링크 깨짐 0
- **빌드**: `npm run build` (허브 → 홈 → 가이드 → CSS → 레이아웃), 커밋 전 `npm run check`
- 남은 디자인 작업: 이력조회·리콜·뉴스·마이·블로그 목록 페이지 내부 화면을 새 디자인 언어로(현재는 새 헤더·글꼴·토큰만 적용), `scripts/gen-blog-posts.js`는 구 템플릿이라 재실행 시 build-guides·migrate 스크립트를 함께 돌려야 함

## 출처
- MeasuringU 2026 자동차 사이트 UX 벤치마크: https://measuringu.com/ux-and-nps-benchmarks-of-third-party-automotive-websites-2026/
- Carvana·Edmunds 리뷰: https://www.edmunds.com/car-buying/best-used-car-websites.html , https://www.amerifreight.net/auto-shipping/15-best-car-buying-sites-online
- CarGurus 리프레시: https://caraphillips.studio/portfolios/cargurus
- Auto Trader 리브랜딩: https://www.creativeboom.com/inspiration/studio-output-shifts-perceptions-of-iconic-auto-trader-with-brand-refresh/ , https://magzter.com/stories/Computer-Mobile/NET/Auto-Trader
- Motor1 개편: https://www.motor1.com/news/738905/motor1-new-website-launch-2024/ , https://motorsportnetwork.com/press/motorsportcom-motor1-launches-new-website-to-enhance-user-experience
- 토스 라이팅: https://toss.tech/article/8-writing-principles-of-toss , https://developers-apps-in-toss.toss.im/design/ux-writing.html , https://toss.tech/article/rethinking-design-system
- Pretendard: https://github.com/orioncactus/pretendard , https://cdn.jsdelivr.net/npm/pretendard@1.3.9/docs/en/README.md
