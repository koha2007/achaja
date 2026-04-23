/* ACHAJA VIN 디코더
   ISO 3779 VIN 17자리 표준 기반. 공개 데이터(WMI·연식 코드)만 사용하므로
   사업자등록/유료 API 없이 제조사·국가·연식 추정이 가능하다.
   소유주 동의가 필요한 사고·정비 이력은 이 모듈 범위 밖이다. */
(function (global) {
  'use strict';

  // 국가 (1자리): ISO 3780 일부
  var COUNTRY = {
    '1': '미국', '4': '미국', '5': '미국',
    '2': '캐나다',
    '3': '멕시코',
    '6': '호주',
    '9': '브라질',
    'J': '일본',
    'K': '대한민국',
    'L': '중국',
    'M': '인도',
    'S': '영국', 'T': '체코/슬로바키아',
    'V': '프랑스/스페인',
    'W': '독일',
    'X': '러시아',
    'Y': '스웨덴/핀란드',
    'Z': '이탈리아'
  };

  // WMI (1~3자리) → 제조사. 실제 recalls.json 데이터에 등장하는 브랜드 위주.
  var WMI = {
    // 한국
    'KMH': '현대자동차', 'KMF': '현대자동차', 'KM8': '현대자동차',
    'KNA': '기아', 'KNB': '기아', 'KNC': '기아', 'KND': '기아', 'KNE': '기아', 'KNF': '기아',
    'KNH': '기아', 'KNM': '르노코리아',
    'KPT': '제네시스',
    'KPA': '르노코리아', 'KPB': 'KG모빌리티(쌍용)', 'KPH': 'KG모빌리티(쌍용)',
    'KL1': '한국지엠(쉐보레)', 'KL3': '한국지엠(쉐보레)', 'KL4': '한국지엠(쉐보레)',
    'KL5': '한국지엠(쉐보레)', 'KL7': '한국지엠(대우)', 'KL8': '한국지엠(쉐보레)',
    'KLA': '한국지엠(대우)', 'KLY': '한국지엠(다마스)',

    // 일본
    'JH4': '혼다(아큐라)', 'JHM': '혼다', 'JHL': '혼다', 'JHF': '혼다',
    'JT1': '도요타', 'JT2': '도요타', 'JT3': '도요타', 'JT4': '도요타',
    'JT5': '도요타', 'JT6': '도요타', 'JT7': '도요타', 'JTD': '도요타',
    'JTE': '도요타', 'JTF': '도요타', 'JTG': '도요타', 'JTH': '렉서스',
    'JTJ': '렉서스', 'JTK': '도요타', 'JTL': '도요타', 'JTM': '도요타',
    'JTN': '도요타',
    'JN1': '닛산', 'JN3': '닛산(인피니티)', 'JN6': '닛산', 'JN8': '닛산',
    'JF1': '스바루', 'JF2': '스바루',
    'JS2': '스즈키', 'JS3': '스즈키',
    'JM1': '마쓰다', 'JM3': '마쓰다',

    // 독일
    'WAU': '아우디', 'WA1': '아우디',
    'WBA': 'BMW', 'WBS': 'BMW M', 'WBY': 'BMW i',
    'WBW': '미니(BMW)',
    'WDB': '메르세데스벤츠', 'WDC': '메르세데스벤츠(ML/GL)', 'WDD': '메르세데스벤츠',
    'WDF': '메르세데스벤츠(밴)', 'W1K': '메르세데스벤츠', 'W1N': '메르세데스벤츠',
    'WMW': '미니', 'WME': '스마트',
    'WP0': '포르쉐', 'WP1': '포르쉐(SUV)',
    'WVW': '폭스바겐', 'WV1': '폭스바겐(상용)', 'WV2': '폭스바겐(상용)', 'WVG': '폭스바겐',

    // 영국
    'SAL': '랜드로버', 'SAJ': '재규어', 'SCC': '로터스', 'SCF': '애스턴마틴',
    'SCA': '롤스로이스', 'SCB': '벤틀리',

    // 스웨덴
    'YV1': '볼보', 'YV4': '볼보', 'YV7': '볼보트럭',

    // 이탈리아
    'ZAR': '알파로메오', 'ZFA': '피아트', 'ZFF': '페라리', 'ZHW': '람보르기니',
    'ZFC': '피아트(밴)',

    // 미국
    '1FA': '포드', '1FB': '포드', '1FC': '포드', '1FD': '포드', '1FM': '포드',
    '1FT': '포드(트럭)', '2FA': '포드(캐나다)',
    '1G1': '쉐보레', '1G6': '캐딜락', '1GC': '쉐보레(트럭)',
    '5YJ': '테슬라', '7SA': '테슬라',

    // 중국
    'LYV': '볼보(중국생산)', 'LVS': '포드(중국)', 'LRB': '뷰익(중국)',

    // 프랑스
    'VF1': '르노', 'VF3': '푸조', 'VF7': '시트로엥'
  };

  // 10번째 자리 = 모델연도. A~Y(I·O·Q·U·Z 제외) 와 1~9 순환.
  // 30년 주기라 1980/2010 모두 'A'지만, 현대차 컨텍스트에선 최신 주기로 판단.
  // 7번째 자리가 숫자면 2009년 이전, 알파벳이면 2010년 이후 (SAE J1980 가이드).
  var YEAR_CODES = 'ABCDEFGHJKLMNPRSTVWXY123456789';

  function decodeYear(code, pos7) {
    var idx = YEAR_CODES.indexOf(code);
    if (idx < 0) return null;
    // idx 0 == 'A' == 1980 또는 2010
    var oldYear = 1980 + idx;     // 1980 ~ 2008 (A~9)
    var newYear = 2010 + idx;     // 2010 ~ 2038
    // 7번째 자리가 알파벳이면 최신 주기
    if (/[A-Z]/i.test(pos7)) return newYear;
    // 기본값: 최신 주기(2010~). 2010년 이전 차량은 드뭄.
    return newYear;
  }

  // 체크디지트(9번째 자리) 검증 — 북미 차량만 필수지만 VIN 오타 감지에 유용
  var TRANS = {
    A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,J:1,K:2,L:3,M:4,N:5,P:7,R:9,
    S:2,T:3,U:4,V:5,W:6,X:7,Y:8,Z:9,
    '0':0,'1':1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9
  };
  var WEIGHTS = [8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2];

  function checkDigit(vin) {
    if (vin.length !== 17) return false;
    var sum = 0;
    for (var i = 0; i < 17; i++) {
      var v = TRANS[vin.charAt(i).toUpperCase()];
      if (v === undefined) return false;
      sum += v * WEIGHTS[i];
    }
    var r = sum % 11;
    var expected = (r === 10) ? 'X' : String(r);
    return vin.charAt(8).toUpperCase() === expected;
  }

  function decodeVin(raw) {
    if (!raw) return { valid: false, reason: 'empty' };
    var vin = String(raw).trim().toUpperCase().replace(/\s/g, '');
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      return { valid: false, reason: 'format', vin: vin };
    }
    var wmi3 = vin.substr(0, 3);
    var wmi2 = vin.substr(0, 2);
    var country = COUNTRY[vin.charAt(0)] || '알 수 없음';
    var maker = WMI[wmi3] || WMI[wmi2] || null;
    var year = decodeYear(vin.charAt(9), vin.charAt(6));
    var checkValid = checkDigit(vin);

    return {
      valid: true,
      vin: vin,
      country: country,
      maker: maker,
      makerCode: wmi3,
      year: year,
      checkDigitValid: checkValid,
      // 북미 외 VIN은 체크디지트 미준수가 많아 경고만 표시
      checkDigitStrict: vin.charAt(0) === '1' || vin.charAt(0) === '4' || vin.charAt(0) === '5' || vin.charAt(0) === '2'
    };
  }

  // 한국 차량번호 검증 + 용도 추정
  // 2006년 이후 신형 번호판: "12가3456" 또는 "123가4567"
  var PLATE_RE = /^([0-9]{2,3})([가-힣])([0-9]{4})$/;
  // 용도 기호 (2006년 신 번호판 체계)
  var PURPOSE = {
    // 자가용 승용차: 가 ~ 마 / 거 ~ 저 / 고 ~ 조 / 구 ~ 주
    // 아래는 대표 범주만. 전수 매핑은 과도 — 사용자에 정확한 안내만 제공.
    rental: ['하', '허', '호'], // 렌터카
    business: ['아', '바', '사', '자'], // 영업용/택시/버스/화물 (일부)
    diplomat: ['외'] // 외교용
  };

  function decodePlate(raw) {
    if (!raw) return { valid: false };
    var plate = String(raw).trim().replace(/\s/g, '');
    var m = plate.match(PLATE_RE);
    if (!m) return { valid: false, plate: plate };
    var kana = m[2];
    var type = '자가용 승용';
    if (PURPOSE.rental.indexOf(kana) >= 0) type = '렌터카';
    else if (PURPOSE.business.indexOf(kana) >= 0) type = '영업용';
    else if (PURPOSE.diplomat.indexOf(kana) >= 0) type = '외교용';

    return {
      valid: true,
      plate: plate,
      prefix: m[1],
      kana: kana,
      suffix: m[3],
      type: type,
      cc: m[1].length === 3 ? '2019년 이후 신규발급' : '2006년~현재 전국번호판'
    };
  }

  function detect(input) {
    if (!input) return { kind: 'empty' };
    var s = String(input).trim().toUpperCase().replace(/\s/g, '');
    if (/^[A-HJ-NPR-Z0-9]{17}$/.test(s)) return { kind: 'vin', result: decodeVin(s) };
    var p = decodePlate(input);
    if (p.valid) return { kind: 'plate', result: p };
    return { kind: 'invalid' };
  }

  var api = {
    decodeVin: decodeVin,
    decodePlate: decodePlate,
    detect: detect
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.AchajaVin = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
