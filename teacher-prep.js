/* 집 모드 「상담 준비」 (10-30 실무 의견 반영 5단계)
   근거 : 27년 논의자료 v1.2 5.3 「집 모드 24개 업무」 · 5.4 「집·학교 데이터 경계」
   - 학교(업무망)에서는 우리 반 상담을 100% 하고, 집(인터넷)에서는 학생 개인정보 없이 그 상담의 기초 작업을 한다.
   - 이 화면의 응답에는 학생 이름·학번·번호+성적 조합이 없다. 집계는 5명 미만 칸을 보여 주지 않는다.
   - 집에서 쓴 메모는 작업 번호로만 남기고, 학교 모드에서 학생과 연결한다.
   C(상담·설명회 준비) 5개 업무의 묶음은 장표 문구로만 정해져 원본 「교사_집모드_업무정의_v1」 확인 전까지 설계 가정이다. */
(function () {
  var MK = 'sen-prep-memo-v1';
  var memos = function () { try { return JSON.parse(sessionStorage.getItem(MK) || '[]'); } catch (e) { return []; } };
  var saveMemos = function (m) { try { sessionStorage.setItem(MK, JSON.stringify(m)); } catch (e) {} };
  var netNow = function () { try { return sessionStorage.getItem('sen-tch-net') || 'school'; } catch (e) { return 'school'; } };
  var e = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var K5 = function (n) { return n < 5 ? '<span class="pk5" title="5명 미만은 보여 주지 않아요 (k≥5)">5명 미만</span>' : n + '명'; };

  /* 가상 프로필 계산 : 교사가 임의로 넣은 등급 조합 (학생 데이터 아님) */
  var VP = { 국: 2, 수: 2, 영: 2, 탐1: 2, 탐2: 3 };
  var UNIS = [['서울시립대 경영 (가)', { 국: .3, 수: .3, 영: .2, 탐: .2 }, 612], ['국민대 경영 (나)', { 국: .35, 수: .25, 영: .2, 탐: .2 }, 600], ['숭실대 경영 (다)', { 국: .3, 수: .3, 영: .15, 탐: .25 }, 598]];
  var g2s = function (g) { return 1000 - (g - 1) * 70; }; /* 5등급 → 1000점 척도(시연용 단순 환산) */
  function vpCalc() {
    var t = (g2s(VP.탐1) + g2s(VP.탐2)) / 2;
    return UNIS.map(function (u) { var w = u[1], v = g2s(VP.국) * w.국 + g2s(VP.수) * w.수 + g2s(VP.영) * w.영 + t * w.탐; v = Math.round(v * 6.4) / 10; var gap = Math.round((v - u[2]) * 10) / 10; return [u[0], v, gap]; });
  }

  function sec(id, code, title, n, body, note) {
    return '<section class="pcard" id="prep-' + id + '"><h3 data-mk="home up1030" data-mk-note="' + (note || '장표 5.3 집 모드 업무') + '"><span class="pcode">' + code + '</span>' + title + ' <small>' + n + '개 업무</small></h3>' + body + '</section>';
  }

  window.prepHtml = function () {
    var M = memos();
    var vp = vpCalc();
    var A = sec('a', 'A', '입시 정보 분석', 6,
      '<ul class="plinks"><li><a href="univ.html">대학·전형 탐색</a></li><li><a href="univ.html#changes">학년도별 변화 분석</a></li><li><a href="univ.html#result">입결 분석 (3개년 공개 자료)</a></li><li><a href="#" data-prep-ai>AI 입시 Q&A (공개 요강만)</a></li></ul>'
      + '<div class="pbox"><b>환산점 규칙 확인</b> <span class="pnote">전년 대비 반영 비율 변화</span><table class="btable"><tr><th>대학</th><th>2027</th><th>2028</th><th>변화</th></tr><tr><td>서울시립대</td><td>국30 수30 영20 탐20</td><td>같음</td><td><span class="badge badge--ok">동일</span></td></tr><tr><td>국민대</td><td>국30 수30 영20 탐20</td><td>국35 수25</td><td><span class="badge badge--wait">10% 이내</span></td></tr><tr><td>숭실대</td><td>국25 수35 영15 탐25</td><td>국30 수30</td><td><span class="badge badge--wait">10% 이내</span></td></tr></table></div>'
      + '<div class="pbox"><b>가상 프로필로 미리 계산</b> <span class="pnote">선생님이 임의로 넣는 등급 조합이에요 · 학생 자료가 아니고 저장하지 않아요</span>'
      + '<div class="pvp">' + Object.keys(VP).map(function (k) { return '<label>' + k + '<select class="xsel" data-vp="' + k + '">' + [1, 2, 3, 4, 5].map(function (g) { return '<option' + (VP[k] === g ? ' selected' : '') + '>' + g + '</option>'; }).join('') + '</select></label>'; }).join('') + '</div>'
      + '<table class="btable"><tr><th>대학</th><th>가상 환산점</th><th>전년 70%컷과 차이</th></tr>' + vp.map(function (r) { return '<tr><td>' + r[0] + '</td><td><b>' + r[1] + '</b></td><td>' + (r[2] >= 0 ? '+' : '') + r[2] + '</td></tr>'; }).join('') + '</table><p class="pnote">시연용 단순 환산이에요 · 실제 학생 계산은 학교 모드 「환산점」에서</p></div>');
    var B = sec('b', 'B', '반·학년 집계', 6,
      '<p class="pnote">학급 단위 이상 집계만 보여요 · 5명 미만 칸은 「5명 미만」 · 교차표는 2차원까지 · 명단 없음</p>'
      + '<div class="pgrid2"><div class="pbox"><b>우리 반 내신 분포 (25명)</b><table class="btable"><tr><th>1등급대</th><th>2등급대</th><th>3등급대</th><th>4등급대 이하</th></tr><tr><td>' + K5(3) + '</td><td>' + K5(9) + '</td><td>' + K5(8) + '</td><td>' + K5(5) + '</td></tr></table></div>'
      + '<div class="pbox"><b>희망 계열 분포</b><table class="btable"><tr><th>인문·사회</th><th>자연·공학</th><th>의약</th><th>예체</th></tr><tr><td>' + K5(9) + '</td><td>' + K5(11) + '</td><td>' + K5(3) + '</td><td>' + K5(2) + '</td></tr></table></div>'
      + '<div class="pbox"><b>전형별 지원 고려 인원 (명단 없음)</b><table class="btable"><tr><th>학생부교과</th><th>학생부종합</th><th>논술</th><th>정시 위주</th></tr><tr><td>' + K5(10) + '</td><td>' + K5(8) + '</td><td>' + K5(3) + '</td><td>' + K5(4) + '</td></tr></table></div>'
      + '<div class="pbox"><b>상담 진행률</b><div class="pbar"><span style="width:64%"></span></div><p class="pnote">25명 중 16명 상담 완료 (64%) · 지난해 같은 시기 52%</p></div></div>'
      + '<ul class="plinks"><li><a href="#" data-view="stats">진학통계 · 보고서 (집계)</a></li><li>50명 이상 익명 코호트 전형 매칭 : 학년 전체 기준에서만</li></ul>');
    var memoRows = M.length ? '<table class="btable"><tr><th>작업 번호</th><th>메모</th><th>' + (netNow() === 'school' ? '학생과 연결 (학교 모드)' : '연결') + '</th></tr>' + M.map(function (m, i) {
      return '<tr><td><b>' + e(m.no) + '</b></td><td>' + e(m.t) + '</td><td>' + (netNow() === 'school'
        ? (m.stu ? '<span class="badge badge--ok">' + e(m.stu) + ' 학생과 연결됨</span>' : '<select class="xsel" data-memo-link="' + i + '"><option value="">학생 고르기</option>' + (typeof CLASS !== 'undefined' ? CLASS : []).map(function (c) { return '<option>' + c.n + '</option>'; }).join('') + '</select>')
        : (m.stu ? '<span class="badge badge--gray">학교에서 연결됨</span>' : '<span class="pnote">학교에서 연결해요</span>')) + '</td></tr>';
    }).join('') + '</table>' : '<p class="pnote">아직 메모가 없어요</p>';
    var C = sec('c', 'C', '상담·설명회 준비', 5,
      '<div class="pgrid2"><div class="pbox"><b>이번 주 상담 일정 (학생 이름 없음)</b><table class="btable"><tr><th>요일</th><th>건수</th><th>시간</th></tr><tr><td>9.6(월)</td><td>2건</td><td>15:00 · 16:30</td></tr><tr><td>9.8(수)</td><td>1건</td><td>15:00</td></tr><tr><td>9.9(목)</td><td>3건</td><td>14:00 · 15:00 · 16:30</td></tr></table><p class="pnote">위촉 상담 선생님 스케줄 1·2순위 조정도 이름 없이 시간으로만</p></div>'
      + '<div class="pbox"><b>상담 질문지 · 체크리스트</b><ul class="pck"><li>수시 6장 구성에서 가장 고민되는 한 장은?</li><li>수능 최저를 몇 개 영역으로 맞출 수 있을까?</li><li>희망 학과 권장과목을 얼마나 이수했나?</li><li>학부모와 합의한 지원 원칙은?</li></ul><p class="pnote">설명회 자료 · 학부모 안내문 초안도 여기서 써요</p></div></div>'
      + '<div class="pbox"><b>전략 메모 (작업 번호)</b> <span class="pnote">학생 이름 없이 작업 번호로만 써요 · 학교 업무망에서 학생과 연결하면 상담에 바로 쓰여요 · 이 탭을 닫으면 지워져요</span>'
      + '<div class="pmemo"><input class="xsel" id="prepMemo" placeholder="예 : 교과 위주 6장, 최저 2합 5 가능성 확인 필요" maxlength="120"><button type="button" class="btn btn--primary" data-memo-add>메모 추가</button></div>'
      + '<p class="pnote" data-memo-warn style="display:none;color:var(--warn)">학생 이름·학번처럼 보이는 글자가 있어요. 작업 번호로만 써 주세요</p>' + memoRows + '</div>',
      '장표 5.3 C · 5개 묶음은 설계 가정(원본 업무정의 확인 전)');
    var D = sec('d', 'D', '교사 협업', 4, '<ul class="plinks"><li><a href="library.html#teacher">교사 공유 자료 열람·작성</a></li><li><a href="news.html#policy">2028 브리핑</a></li><li><a href="library.html">교사 Q&A 게시판 (학생 사례는 비식별로)</a></li><li><a href="#" data-toast="위촉 상담 교사 풀 등록 요청을 보냈어요 (정보원 승인 후 반영)">위촉 상담 교사 풀 등록·승인 요청</a></li></ul>');
    var E = sec('e', 'E', '집계 보고서', 3, '<ul class="plinks"><li><a href="#" data-view="stats">학급 진학 현황 보고서 초안</a></li><li><a href="#" data-view="stats">학년·학교 집계 보고 (학생 단위 표 없음)</a></li><li>운영 대시보드 : 상담 진행률 64% · 과제 완료율 71% · 설명회 참석률 58% · 만족도 회신율 43%</li></ul>');
    var RULES = '<div class="prules"><div><b data-mk="home" data-mk-note="장표 5.4 집·학교 데이터 경계">집에서 볼 수 있는 것</b><ul><li>공개 정보 : 대학·전형·입결·산출식·일정</li><li>집계값 : 학급·학년 단위, 5명 미만 칸은 비표시</li><li>교사 자료 : 내 문서·템플릿·가상 조건 계산</li><li>작업 번호 + 메모 글</li></ul></div><div><b data-mk="school" data-mk-note="장표 5.4 · 학교 모드 전용">학교에서만 (집에서는 안 나와요)</b><ul><li>학생 이름·학번·출석번호·연락처·보호자</li><li>학생별 성적·학생부·희망 대학·상담 기록</li><li>학급 + 등급 + 희망 대학처럼 학생을 특정할 수 있는 조합</li><li>내려받기·인쇄·복사 (서버가 막아요)</li></ul></div></div>';
    return '<section class="section"><h2 class="t" data-mk="home up1030" data-mk-note="설계 전제 §6-2 · 장표 5.3 · 학교에서 100% 상담, 집에서는 상담 준비">상담 준비 <span class="badge badge--gray">집에서도 할 수 있어요</span></h2>'
      + '<p class="s">학교에서 우리 반 학생과 상담하기 전에, 학생 개인정보 없이 할 수 있는 기초 작업이에요 · 학교 업무망에서는 모든 상담을 할 수 있고, 여기서 만든 메모·계산·자료는 학교에서 학생과 연결해 써요</p>'
      + RULES + '<div class="pall">' + A + B + C + D + E + '</div>'
      + '<p class="caption">24개 업무 구성 출처 : 「서울시교육청 27년 사업 관련 논의자료 v1.2」 5.3·5.4 (교사_집모드_업무정의_v1 요약)</p></section>'
      + '<style>.pall{display:grid;gap:16px;margin-top:16px}.pcard{border:1px solid var(--line);border-radius:18px;padding:18px 20px;background:var(--bg)}.pcard h3{margin:0 0 10px;font-size:17px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}.pcard h3 small{color:var(--ink-3);font-weight:700;font-size:13px}.pcode{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:8px;background:#E1F5F4;color:#00676B;font-weight:900}.pbox{border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin-top:10px}.pbox b{font-size:15px}.pnote{font-size:13px;color:var(--ink-3);margin:6px 0 0}.pgrid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.plinks{margin:6px 0 0;padding-left:18px;line-height:1.9}.plinks a{color:var(--brand);font-weight:700}.pvp{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.pvp label{display:grid;gap:4px;font-size:13px;font-weight:700}.pk5{color:var(--ink-3);font-size:12.5px}.pbar{height:10px;border-radius:999px;background:var(--surface);overflow:hidden;margin-top:10px}.pbar span{display:block;height:100%;background:#2FA39B}.pmemo{display:flex;gap:8px;margin:10px 0}.pmemo input{flex:1}.pck{margin:6px 0 0;padding-left:18px;line-height:1.8}.prules{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}.prules>div{border-radius:14px;padding:14px 16px;border:1px solid var(--line)}.prules>div:first-child{background:#E1F5F4}.prules>div:last-child{background:#E8EEFB}.prules ul{margin:6px 0 0;padding-left:18px;line-height:1.8;font-size:14px}@media (max-width:860px){.pgrid2,.prules{grid-template-columns:1fr}}</style>';
  };

  window.bindPrep = function () {
    document.querySelectorAll('[data-vp]').forEach(function (s) { s.addEventListener('change', function () { VP[s.dataset.vp] = +s.value; renderAll(); var el = document.getElementById('prep-a'); if (el) el.scrollIntoView({ block: 'start' }); }); });
    var inp = document.getElementById('prepMemo'), warn = document.querySelector('[data-memo-warn]');
    var looksPersonal = function (v) { var names = (typeof CLASS !== 'undefined' ? CLASS : []).map(function (c) { return c.n; }); return names.some(function (n) { return v.indexOf(n) > -1; }) || /\d{5,}|[가-힣]{2,3}\s?학생/.test(v); };
    if (inp) inp.addEventListener('input', function () { if (warn) warn.style.display = looksPersonal(inp.value) ? '' : 'none'; });
    var add = document.querySelector('[data-memo-add]');
    if (add) add.addEventListener('click', function () {
      var v = (inp.value || '').trim(); if (!v) return;
      if (looksPersonal(v)) { if (warn) warn.style.display = ''; showToast('학생 이름·번호 없이 작업 번호로만 메모해 주세요'); return; }
      var m = memos(); m.push({ no: 'W-' + String(m.length + 1).padStart(2, '0'), t: v }); saveMemos(m); renderAll();
      showToast('작업 번호 메모를 추가했어요 · 학교 모드에서 학생과 연결해요');
    });
    document.querySelectorAll('[data-memo-link]').forEach(function (s) { s.addEventListener('change', function () { if (!s.value) return; var m = memos(); m[+s.dataset.memoLink].stu = s.value; saveMemos(m); renderAll(); showToast(s.value + ' 학생과 연결했어요 · 연결 기록이 남아요 (학교 모드)'); }); });
    document.querySelectorAll('[data-prep-ai]').forEach(function (a) { a.addEventListener('click', function (ev) { ev.preventDefault(); var f = document.querySelector('.senai-fab'); if (f) f.click(); else location.href = 'sen-ai-poc.html'; }); });
  };
})();
