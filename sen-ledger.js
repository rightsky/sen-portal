/* 공통 원장 · 용어 사전 (2026-10-30, 실무 의견 반영 1단계)
   화면마다 달랐던 일정 · 학년도 · 세션 · 상담 시간 · 환산점 상태를 이 파일 한 곳에서 읽는다(R01 R02).
   시연 기준 : 2028학년도 대입, 2027학년도 2학기(2027.9), 요일은 2027 달력.
   일정 출처 : 2028학년도 대학입학전형 시행계획(대교협 2026.4 발표) 주요 일정. 세부 일정은 대학별로 다를 수 있음. */
(function () {
  var L = {
    year: { admission: 2028, school: 2027, term: '2학기', basis: '2027.9', curriculum: '2022 개정', grade: '5등급제' },
    schedule: {
      susiApply:   { from: '2027.9.20(월)', to: '9.23(목)', label: '수시 원서접수' },
      csat:        { date: '2027.11.18(목)', label: '대학수학능력시험' },
      csatScore:   { date: '2027.12.10(금)', label: '수능 성적 통지' },
      susiResult:  { date: '2027.12.21(화)', label: '수시 합격자 발표 마감' },
      jeongsiApply:{ from: '2028.1.3(월)', to: '1.6(목)', label: '정시 원서접수' }
    },
    session: {          /* 분 단위. 업무시스템은 결정 23(15 → 30분, R13) */
      student: 30, parent: 30, teacher: 30, ops: 30, warnBefore: 5
    },
    counsel: { visitMin: 40, videoMin: 40, boardReplyHours: 24, boardReplyBasis: '교사 배정 후' },
    conv: { version: 'v2.1', state: '확정', stateCode: 'CONFIRMED', basis: '2027.8.31 대학 공개 요강 기준' },
    demoToday: '2027-09-01',   /* 시연 기준일 : 화면의 D-day·달력은 이 날을 오늘로 계산 */
    source: '2028학년도 대학입학전형 시행계획(대교협)'
  };
  L.fmt = {
    susiApply: function () { var s = L.schedule.susiApply; return s.from + ' ~ ' + s.to; },
    jeongsiApply: function () { var s = L.schedule.jeongsiApply; return s.from + ' ~ ' + s.to; }
  };
  window.SEN_LEDGER = L;

  /* 화면 문구 용어 사전 : 개발 용어 → 쉬운 우리말(R01 R02 R03 R06 R07 R10 R11).
     긴 표현부터 바꾼다. 업무시스템(ops-*) 화면은 정보원 실무 용어를 그대로 둔다. */
  window.SEN_TERMS = [
    ['판정·승인 HITL', '판정 확인'],
    ['판정 · 승인 (HITL)', '판정 확인'],
    ['판정 승인(HITL)', '판정 확인'],
    ['판정·승인(HITL)', '판정 확인'],
    ['HITL', '판정 확인'],
    ['상담 브리프', '상담 요약'],
    ['브리프', '요약'],
    ['NEIS 일괄 적재', 'NEIS 일괄 반영'],
    ['적재', '반영'],
    ['보고서 빌더', '보고서 만들기'],
    ['비교 조립판', '비교 만들기'],
    ['자격게이트 조회', '지원 자격 확인'],
    ['자격 게이트', '지원 자격 확인'],
    ['자격게이트', '지원 자격 확인'],
    ['학교 연계 서비스는', 'SEN 진학프로그램은'], ['학교 연계 서비스가', 'SEN 진학프로그램이'], ['학교 연계 서비스를', 'SEN 진학프로그램을'], ['학교 연계 서비스와', 'SEN 진학프로그램과'],
    ['학교 연계 서비스', 'SEN 진학프로그램'],
    ['센진학', '쎈진학'],
    ['생기부', '학생부'],
    ['2FA', '2단계 인증'],
    ['나침판', '나침반']
  ];
})();
/* 조사 자동 선택 (R01 「강지우은(는)」 「진로검사 결과을(를)」 지적) : JOSA('강지우','은는') → '강지우는' */
window.JOSA = function (w, pair) {
  w = String(w); var c = w.replace(/[\s)\]」』"'.]+$/, '').slice(-1).charCodeAt(0);
  var has = c >= 0xAC00 && c <= 0xD7A3 ? (c - 0xAC00) % 28 : /[013678]$/.test(w) ? 1 : 0;
  var rieul = c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 === 8;
  var P = { '은는': ['은', '는'], '이가': ['이', '가'], '을를': ['을', '를'], '과와': ['과', '와'], '으로로': [rieul ? '로' : '으로', '로'] }[pair] || ['', ''];
  return w + (has ? P[0] : P[1]);
};
