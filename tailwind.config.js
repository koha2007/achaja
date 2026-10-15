// ACHAJA 디자인 시스템 — 모든 페이지 공용 Tailwind 설정 (이전: 페이지마다 인라인 tailwind.config)
// 색 토큰 값은 css/src/app.css 의 :root / html.dark 에 있다.
const c = (name) => `rgb(var(--c-${name})/<alpha-value>)`;
const tokens = [
  'primary', 'primary-container', 'on-primary', 'on-primary-container',
  'secondary', 'secondary-container', 'on-secondary-container', 'tertiary',
  'background', 'surface',
  'surface-container-lowest', 'surface-container-low', 'surface-container',
  'surface-container-high', 'surface-container-highest',
  'on-surface', 'on-surface-variant', 'outline', 'outline-variant',
  'error-container', 'on-error-container',
  'header-bg', 'nav-bg', 'card-alt', 'app-border', 'muted', 'muted-strong', 'active-bg',
  'glass', 'glass-border',
  'go', 'go-bg', 'caution', 'caution-bg', 'stop', 'stop-bg',
];
// 한글·영문·숫자 통합 글꼴 (jsDelivr 동적 서브셋, 각 페이지 <head>에서 로드) → 시스템 글꼴 폴백
const sans = ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto',
  '"Helvetica Neue"', '"Segoe UI"', '"Apple SD Gothic Neo"', '"Noto Sans KR"', '"Malgun Gothic"', 'sans-serif'];

module.exports = {
  darkMode: 'class',
  content: [
    './*.html',
    './!(node_modules|docs)/**/*.html',
    './js/**/*.js',
    './src/**/*.js',
    './scripts/**/*.js',
    './partials/**/*.html',
  ],
  theme: {
    extend: {
      colors: Object.fromEntries(tokens.map((t) => [t, c(t)])),
      fontFamily: {
        // 기존 클래스 이름(font-headline / font-body)은 유지하고 글꼴만 교체
        headline: sans,
        body: sans,
        sans,
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', gutter: '16px', margin: '20px' },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.04), 0 4px 16px rgb(0 0 0 / 0.04)',
      },
      fontSize: {
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'title-lg': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md': ['11px', { lineHeight: '16px', fontWeight: '500' }],
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')],
};
