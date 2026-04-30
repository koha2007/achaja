/* ACHAJA VIN 디코더
   ISO 3779 VIN 17자리 표준 + NHTSA vPIC 무료 API 결합.
   1차: WMI/연식/체크디지트 (오프라인, 즉시).
   2차: NHTSA API로 모델·트림·엔진·공장 보강 (수입차/한국 수출차).
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

  // 11번째 자리 = 생산공장. 제조사별로 다르므로 WMI 별 매핑.
  // 출처: NHTSA vPIC + 제조사 공식 자료. 확실한 것만.
  var PLANT = {
    // 현대 (KMH/KM8/KMF)
    'HYUNDAI': {
      'A': '아산공장 (한국)',
      'U': '울산공장 (한국)',
      '5': '울산공장 (한국)',
      'M': '첸나이 (인도)',
      'T': '알라바마 (미국)',
      'C': '노소비체 (체코)',
      'B': '베이징 (중국)'
    },
    // 기아 (KNA/KNB/KNC/KND/KNE/KNF/KNH)
    'KIA': {
      'T': '화성공장 (한국)',
      'U': '광주공장 (한국)',
      'P': '소하리(광명) 공장 (한국)',
      '5': '조지아 (미국)',
      '6': '몬테레이 (멕시코)',
      'M': '질리나 (슬로바키아)'
    },
    // 제네시스 (KPT)
    'GENESIS': {
      'A': '아산공장 (한국)',
      'U': '울산공장 (한국)'
    }
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

  // 한국 제조사 공장 룩업 (11번째 자리 기반)
  function decodePlant(vin, maker) {
    if (!vin || vin.length !== 17 || !maker) return null;
    var pos11 = vin.charAt(10);
    var key = null;
    if (/현대/.test(maker)) key = 'HYUNDAI';
    else if (/기아/.test(maker)) key = 'KIA';
    else if (/제네시스/.test(maker)) key = 'GENESIS';
    if (!key) return null;
    return (PLANT[key] && PLANT[key][pos11]) || null;
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
    var plant = decodePlant(vin, maker);

    return {
      valid: true,
      vin: vin,
      country: country,
      maker: maker,
      makerCode: wmi3,
      year: year,
      plant: plant,
      checkDigitValid: checkValid,
      // 북미 외 VIN은 체크디지트 미준수가 많아 경고만 표시
      checkDigitStrict: vin.charAt(0) === '1' || vin.charAt(0) === '4' || vin.charAt(0) === '5' || vin.charAt(0) === '2'
    };
  }

  // === NHTSA vPIC API 보강 (모델·트림·엔진·공장) ===

  // 영문 → 한글 변환 사전 (NHTSA 응답 정규화)
  var I18N = {
    bodyClass: {
      'Sedan/Saloon': '세단',
      'Hatchback/Liftback/Notchback': '해치백',
      'Coupe': '쿠페',
      'Convertible/Cabriolet': '컨버터블',
      'Wagon': '왜건',
      'Sport Utility Vehicle (SUV)/Multi-Purpose Vehicle (MPV)': 'SUV/MPV',
      'Sport Utility Vehicle (SUV)': 'SUV',
      'Multi-Purpose Vehicle (MPV)': 'MPV(미니밴)',
      'Pickup': '픽업트럭',
      'Van': '밴',
      'Minivan': '미니밴',
      'Crossover Utility Vehicle (CUV)': 'CUV',
      'Truck': '트럭',
      'Bus': '버스',
      'Motorcycle - Standard': '오토바이'
    },
    fuel: {
      'Gasoline': '가솔린',
      'Diesel': '디젤',
      'Electric': '전기',
      'Compressed Natural Gas (CNG)': 'CNG',
      'Liquefied Petroleum Gas (LPG)': 'LPG',
      'Flexible Fuel Vehicle (FFV)': 'FFV',
      'Ethanol (E85)': 'E85',
      'Hydrogen': '수소',
      'Hybrid': '하이브리드',
      'Plug-in Hybrid Electric Vehicle (PHEV)': '플러그인 하이브리드'
    },
    vehicleType: {
      'PASSENGER CAR': '승용차',
      'TRUCK': '트럭',
      'TRUCK ': '트럭',
      'MULTIPURPOSE PASSENGER VEHICLE (MPV)': 'MPV',
      'BUS': '버스',
      'MOTORCYCLE': '오토바이',
      'INCOMPLETE VEHICLE': '미완성 차량'
    },
    driveType: {
      'AWD/All-Wheel Drive': 'AWD (4륜구동)',
      '4WD/4-Wheel Drive/4x4': '4WD (4륜구동)',
      'FWD/Front-Wheel Drive': 'FWD (전륜구동)',
      'RWD/Rear-Wheel Drive': 'RWD (후륜구동)'
    },
    transmission: {
      'Automatic': '자동',
      'Manual/Standard': '수동',
      'Continuously Variable Transmission (CVT)': 'CVT',
      'Dual-Clutch Transmission (DCT)': 'DCT',
      'Direct Drive': '직결식'
    },
    plantCountry: {
      'JAPAN': '일본',
      'GERMANY': '독일',
      'UNITED STATES (USA)': '미국',
      'KOREA, REPUBLIC OF (SOUTH KOREA)': '대한민국',
      'KOREA (SOUTH)': '대한민국',
      'SOUTH KOREA': '대한민국',
      'REPUBLIC OF KOREA': '대한민국',
      'UNITED KINGDOM (UK)': '영국',
      'MEXICO': '멕시코',
      'CANADA': '캐나다',
      'CHINA': '중국',
      'INDIA': '인도',
      'CZECH REPUBLIC': '체코',
      'SLOVAKIA': '슬로바키아',
      'SPAIN': '스페인',
      'FRANCE': '프랑스',
      'ITALY': '이탈리아',
      'BRAZIL': '브라질',
      'AUSTRALIA': '호주',
      'TURKEY': '터키',
      'BELGIUM': '벨기에',
      'AUSTRIA': '오스트리아',
      'NETHERLANDS': '네덜란드',
      'SWEDEN': '스웨덴',
      'POLAND': '폴란드',
      'HUNGARY': '헝가리',
      'ROMANIA': '루마니아'
    }
  };

  function ko(category, value) {
    if (!value) return null;
    if (I18N[category] && I18N[category][value]) return I18N[category][value];
    return value;
  }

  // NHTSA API 호출. 실패 시 null 반환 (절대 throw 안 함).
  function fetchNhtsa(vin) {
    if (!vin || vin.length !== 17) return Promise.resolve(null);
    if (typeof fetch !== 'function') return Promise.resolve(null);
    var url = 'https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/' + vin + '?format=json';
    // 8초 타임아웃
    var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function(){ ctrl.abort(); }, 8000) : null;
    return fetch(url, ctrl ? { signal: ctrl.signal } : undefined)
      .then(function(r){ if (timer) clearTimeout(timer); return r.ok ? r.json() : null; })
      .then(function(j){
        if (!j || !j.Results) return null;
        function pick(name){
          var r;
          for (var i = 0; i < j.Results.length; i++){
            r = j.Results[i];
            if (r.Variable === name && r.Value && r.Value !== 'Not Applicable') return r.Value;
          }
          return null;
        }
        var make = pick('Make');
        var model = pick('Model');
        var year = pick('Model Year');
        var trim = pick('Trim');
        var series = pick('Series');
        var bodyClass = pick('Body Class');
        var cylinders = pick('Engine Number of Cylinders');
        var displacementL = pick('Displacement (L)');
        var displacementCC = pick('Displacement (CC)');
        var fuel = pick('Fuel Type - Primary');
        var plantCity = pick('Plant City');
        var plantCountry = pick('Plant Country');
        var vehicleType = pick('Vehicle Type');
        var driveType = pick('Drive Type');
        var transmission = pick('Transmission Style');

        // 모델·트림·엔진 정보가 하나라도 있어야 의미 있음
        var hasContent = !!(make || model || trim || cylinders || fuel || plantCountry);
        if (!hasContent) return null;

        // 배기량 정리: L 우선, 없으면 CC를 L로 환산
        var disp = null;
        if (displacementL) disp = parseFloat(displacementL).toFixed(1) + 'L';
        else if (displacementCC) disp = (parseInt(displacementCC,10)/1000).toFixed(1) + 'L';

        // 엔진 요약 (4기통 2.0L 가솔린)
        var engineParts = [];
        if (cylinders) engineParts.push(cylinders + '기통');
        if (disp) engineParts.push(disp);
        var fuelKo = ko('fuel', fuel);
        if (fuelKo) engineParts.push(fuelKo);
        var engineSummary = engineParts.length ? engineParts.join(' ') : null;

        // 공장 요약 (도시, 국가 한글)
        var plantParts = [];
        if (plantCity) plantParts.push(plantCity);
        var plantCountryKo = ko('plantCountry', plantCountry);
        if (plantCountryKo) plantParts.push('(' + plantCountryKo + ')');
        var plantSummary = plantParts.length ? plantParts.join(' ') : null;

        return {
          source: 'nhtsa',
          make: make,
          model: model,
          year: year,
          trim: trim,
          series: series,
          bodyClass: bodyClass,
          bodyClassKo: ko('bodyClass', bodyClass),
          cylinders: cylinders,
          displacement: disp,
          fuel: fuel,
          fuelKo: fuelKo,
          engineSummary: engineSummary,
          plantCity: plantCity,
          plantCountry: plantCountry,
          plantCountryKo: plantCountryKo,
          plantSummary: plantSummary,
          vehicleType: vehicleType,
          vehicleTypeKo: ko('vehicleType', vehicleType),
          driveType: driveType,
          driveTypeKo: ko('driveType', driveType),
          transmission: transmission,
          transmissionKo: ko('transmission', transmission)
        };
      })
      .catch(function(){
        if (timer) clearTimeout(timer);
        return null;
      });
  }

  // 한국 차량번호 검증 + 용도 추정
  // 2006년 이후 신형 번호판: "12가3456" 또는 "123가4567"
  var PLATE_RE = /^([0-9]{2,3})([가-힣])([0-9]{4})$/;
  // 용도 기호 (2006년 신 번호판 체계)
  var PURPOSE = {
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
    detect: detect,
    fetchNhtsa: fetchNhtsa,
    ko: ko
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.AchajaVin = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
