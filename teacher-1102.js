/* 교사공간 11-02 추가 (RFP v0.76 반영)
   - 외부 접속(집에서 업무 화면 보기) : 교사 신청 · 학교관리자 승인 · 회수 · S존 진입 거부 안내 (SER-001 · SFR-AUTH-03 화면 4종 중 3종, 4번째 이력 조회는 플랫폼관리)
   - NEIS 학급 자료 올리기 흐름 : 학교 참여 등록 · 동의 명단 · 파일 게이트 · 서버 메모리 검사 · 적재 · 원본 파기 안내 (SFR-048 · 049 · 050)
   - O존 집계 억제 규칙 3줄 (SER-007)
   teacher-1030.js보다 먼저 읽힌다. 화면 그리기는 teacher-1030.js가 이 파일의 함수를 불러서 한다. */
(function () {
  var EK = 'sen-ext';
  var LIC = { total: 300, used: 214 };
  var get = function () { try { return JSON.parse(localStorage.getItem(EK) || 'null') || { st: 'none' }; } catch (e) { return { st: 'none' }; } };
  /* 화면 상태는 탭별 sessionStorage(privacy-store.js)라서, 포털 탭과 업무망 탭이 같은 신청 상태를 보도록 BroadcastChannel로 맞춘다 */
  var BC = window.BroadcastChannel ? new BroadcastChannel('sen-ext') : null;
  var save = function (v) { try { localStorage.setItem(EK, JSON.stringify(v)); } catch (e) {} };
  var put = function (v) { v.ts = Date.now(); save(v); if (BC) BC.postMessage({ v: v }); };
  if (BC) {
    BC.onmessage = function (e) {
      var d = e.data || {};
      if (d.ask) { var mine = get(); if (mine.st !== 'none' || mine.ts) BC.postMessage({ v: mine }); return; }
      if (d.v && (!get().ts || d.v.ts >= get().ts)) { save(d.v); if (window.renderAll) renderAll(); }
    };
    BC.postMessage({ ask: 1 });
  }
  var toast = function (t) { if (window.showToast) showToast(t); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ST = { none: ['신청 안 함', 'badge--gray'], req: ['승인 대기', 'badge--wait'], ok: ['승인됨', 'badge--ok'], rev: ['회수됨', 'badge--warn'] };
  /* 시연용 다른 선생님 신청 (학교관리자 승인함) */
  var OTHERS = [
    { n: '이도윤', r: '3-4 담임', why: '수시 원서 접수 주간 야간 상담 준비', per: '9.6 ~ 9.24', dev: '단말 검증 통과 · 에이전트 설치', st: 'req' },
    { n: '박서연', r: '진학부장', why: '학년 전체 판정 승인 마감', per: '9.1 ~ 12.31', dev: '단말 검증 통과', st: 'ok' },
    { n: '최하준', r: '3-7 담임', why: '육아 시간 단축 근무', per: '9.1 ~ 11.30', dev: '단말 검증 미완료 (백신 갱신 필요)', st: 'req' }
  ];

  window.SEN_EXT = {
    get: get,
    ok: function () { return get().st === 'ok'; },
    /* O존 홈 카드 : 교사 「집에서 업무 화면 보기」 신청 상태 */
    cardHtml: function () {
      var v = get(), s = ST[v.st] || ST.none;
      return '<div class="card" style="padding:16px 18px" data-mk="home sec1102" data-mk-note="RFP v0.76 SER-001 화면 ① : 교사 「집에서 업무 화면 보기」 신청 (솔루션 ZTNA · RBI는 발주기관 별도 도입)">'
        + '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between"><div style="min-width:0;flex:1 1 300px">'
        + '<h2 style="margin:0 0 4px;font-size:16px">집에서 업무 화면 보기 <span class="badge ' + s[1] + '">' + s[0] + '</span></h2>'
        + '<p class="sub" style="margin:0">집 · 개인 노트북에서 업무망(S존) 화면을 보려면 미리 신청해 학교 승인을 받아야 해요. 승인되면 ZTNA · 단말 검증 · MFA · RBI를 거쳐 화면만 전달되고, 파일 저장 · 복사 · 캡처는 막혀요.'
        + (v.st === 'req' || v.st === 'ok' ? '<br><small>사유 : ' + esc(v.why) + ' · 기간 : ' + esc(v.per) + ' · 단말 : ' + esc(v.dev) + '</small>' : '') + '</p></div>'
        + (v.st === 'none' || v.st === 'rev' ? '<button type="button" class="btn btn--line" data-ext-req>신청하기</button>' : v.st === 'req' ? '<button type="button" class="btn btn--line" data-ext-cancel>신청 취소</button>' : '<span class="badge badge--ok">라이선스 배정됨</span>')
        + '</div></div>';
    },
    /* S존 진입 거부 안내 (화면 ③) */
    denyHtml: function () {
      var v = get();
      return '<div data-mk="sec1102" data-mk-note="RFP v0.76 SER-001 화면 ③ : 경로가 확인되지 않으면 진입 거부 + 안내"><h2 style="margin:0 0 8px;font-size:18px">⛔ 이 경로로는 들어갈 수 없어요</h2>'
        + '<p class="sgate__d">외부 단말에서 업무망(S존) 화면을 열려면 「집에서 업무 화면 보기」 승인이 있어야 하고, ZTNA · 단말 검증 · MFA · RBI 경로가 확인돼야 해요. 지금 상태 : <b>' + (ST[v.st] || ST.none)[0] + '</b></p>'
        + '<ul class="sgate__n" style="margin:0 0 12px;padding-left:18px"><li>학교 · 정보원 업무망 PC에서는 신청 없이 2단계 인증만으로 열려요</li><li>신청은 포털 교사공간 홈 「집에서 업무 화면 보기」에서 · 학교관리자가 승인해요</li><li>이 거부 기록은 접속 경로 이력에 남아요</li></ul>'
        + '<div class="sgate__a"><button type="button" class="btn btn--line" data-sgx>닫기</button>' + (v.st === 'none' || v.st === 'rev' ? '<button type="button" class="btn btn--primary" data-ext-req data-sgx>신청하러 가기</button>' : '') + '</div></div>';
    },
    logDeny: function () { try { var a = JSON.parse(localStorage.getItem('sen-ext-log') || '[]'); a.unshift({ t: new Date().toTimeString().slice(0, 5), r: '거부 · 외부 단말 경로 미승인' }); localStorage.setItem('sen-ext-log', JSON.stringify(a.slice(0, 20))); } catch (e) {} }
  };

  function reqModal() {
    var m = document.createElement('div'); m.className = 'sgate'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = '<div class="sgate__p"><button type="button" class="sgate__x" data-x aria-label="닫기">✕</button><h2>집에서 업무 화면 보기 신청</h2>'
      + '<p class="sgate__d">학교관리자가 승인하면 교육청 외부 접속 라이선스(ZTNA · RBI)가 배정돼요. 남은 라이선스 ' + (LIC.total - LIC.used) + ' / ' + LIC.total + '</p>'
      + '<label class="xf"><span>사유</span><select id="exWhy"><option>수시 원서 접수 주간 상담 준비</option><option>판정 승인 마감</option><option>단축 근무 · 재택</option><option>기타 (학교관리자 확인)</option></select></label>'
      + '<label class="xf"><span>기간</span><select id="exPer"><option>9.1 ~ 9.30</option><option>9.1 ~ 12.31</option><option>11.1 ~ 11.30</option></select></label>'
      + '<label class="xf"><span>단말 등록</span><select id="exDev"><option>등록 완료 · 단말 검증 통과</option><option>등록 필요 (에이전트 설치 안내)</option></select></label>'
      + '<p class="sgate__n">개인 단말에는 자료가 남지 않아요 · 승인은 학년도 안에서만 유효 · 담임 교체 · 전보 시 자동 회수</p>'
      + '<div class="sgate__a"><button type="button" class="btn btn--line" data-x>취소</button><button type="button" class="btn btn--primary" data-go>신청</button></div></div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) {
      if (e.target.closest('[data-x]')) { m.remove(); return; }
      if (!e.target.closest('[data-go]')) return;
      put({ st: 'req', why: m.querySelector('#exWhy').value, per: m.querySelector('#exPer').value, dev: m.querySelector('#exDev').value, at: new Date().toISOString().slice(0, 10) });
      m.remove(); toast('신청했어요 · 학교관리자 승인 뒤 집에서 업무 화면을 열 수 있어요'); if (window.renderAll) renderAll();
    });
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-ext-req]')) { e.preventDefault(); setTimeout(reqModal, 0); return; }
    if (e.target.closest && e.target.closest('[data-ext-cancel]')) { put({ st: 'none' }); toast('신청을 취소했어요'); if (window.renderAll) renderAll(); }
  });

  /* ── S존 학교 관리 (학교관리자) : NEIS 업로드 흐름 + 외부 접속 승인 ── */
  var STEPS = ['복호화', '악성코드 검사', '표준 템플릿 형식', '참여 범위 (3학년 · 학적 · 성적 · 학생부)', '동의 명단 대조'];
  var U = { st: 'idle' };   /* idle → run → done → shred */
  function neisHtml() {
    var stepRows = STEPS.map(function (s, i) {
      var on = U.st === 'run' ? i < (U.k || 0) : U.st !== 'idle';
      return '<li style="display:flex;gap:8px;align-items:center;padding:4px 0"><span class="badge ' + (on ? 'badge--ok' : 'badge--gray') + '" style="min-width:24px;justify-content:center">' + (on ? '✓' : i + 1) + '</span>' + s + (i === 4 && U.st !== 'idle' && on ? ' <small style="color:var(--ink-3)">· 미동의 2명 행 제외</small>' : '') + '</li>';
    }).join('');
    var res = U.st === 'done' || U.st === 'shred'
      ? '<div class="share__notice" style="margin-top:10px"><b>적재 완료 · 23명 반영 · 2명 제외(미동의)</b> · 업로드 이력 U-2027-0901-032 · 파일 해시와 행 수만 기록 · 서버에 파일 없음</div>'
        + (U.st === 'shred' ? '<p class="sub" style="margin:8px 0 0">✓ 원본 파기 확인 ' + U.at + ' · 감사로그 기록 · 브라우저가 지원해 선택한 원본 파일도 삭제했어요</p>' : '')
      : '';
    return '<section class="section"><div class="card" data-mk="school sec1102" data-mk-note="RFP v0.76 SFR-048 · 049 · 050 : 학교 참여 등록 · 동의 명단 → 파일 게이트 → 서버 메모리 검사 5단계 → 적재 → 원본 파기 안내">'
      + '<h2>④ NEIS 학급 자료 올리기 <small style="font-weight:700;color:var(--ink-3)">업무망 PC · 파일 게이트</small></h2>'
      + '<div class="kpis" style="grid-template-columns:repeat(3,1fr)">'
      + '<div class="kpi"><span>⓪ 학교 참여 등록</span><b>승인됨</b><span class="d">2027학년도 1회 포괄 승인 · 3학년 10개 반 · 담당자 2명 · 학적 · 성적 · 학생부</span></div>'
      + '<div class="kpi"><span>동의 명단 (3-2)</span><b>23 / 25명</b><span class="d">미동의 2명은 적재하지 않음 · 철회 시 다음 날 제외</span></div>'
      + '<div class="kpi"><span>마지막 업로드</span><b>' + (U.st === 'idle' ? '8.20' : '오늘') + '</b><span class="d">파기 미확인 0건</span></div></div>'
      + '<ol style="list-style:none;margin:12px 0 0;padding:0;display:grid;gap:2px"><li><b>① NEIS에서 반 자료 내려받기</b> <small style="color:var(--ink-3)">암호 걸린 파일 · 업무망 PC</small></li><li><b>② 파일 게이트로 올리기</b> <button type="button" class="btn btn--line" style="padding:6px 12px;font-size:13px" data-neis-up' + (U.st === 'run' ? ' disabled' : '') + '>파일 선택 (시연)</button></li>'
      + '<li><b>③ 서버 메모리 검사</b> <small style="color:var(--ink-3)">디스크에 파일을 만들지 않고 검사 · 하나라도 실패하면 적재 안 함</small><ul style="list-style:none;margin:4px 0 0;padding:0 0 0 12px">' + stepRows + '</ul></li></ol>'
      + res + '</div></section>';
  }
  function shredModal() {
    var m = document.createElement('div'); m.className = 'sgate'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = '<div class="sgate__p" data-mk="school sec1102" data-mk-note="SFR-050 : 확인 전에는 다음 화면으로 못 감"><h2>⑥ 내려받은 원본 파일을 지워 주세요</h2>'
      + '<p class="sgate__d">교육청 서버에 반영됐어요. 업무 PC에 남은 NEIS 원본 파일을 지워야 끝나요.</p>'
      + '<ul class="sgate__n" style="padding-left:18px;margin:0 0 10px"><li>다운로드 폴더 · 바탕화면의 파일 (암호 파일 포함)</li><li>복사본과 휴지통까지 비우기</li><li>교육청 단말 개인정보 점검에서 파일명 규칙으로 다시 확인해요</li></ul>'
      + '<label class="sgate__o"><input type="checkbox" id="shOk"><span><b>파기했습니다</b><small>확인 시각 · 담당자 · 업로드 이력 번호가 감사로그에 남아요</small></span></label>'
      + '<div class="sgate__a"><button type="button" class="btn btn--primary" data-go disabled>확인</button></div></div>';
    document.body.appendChild(m);
    var go = m.querySelector('[data-go]');
    m.querySelector('#shOk').addEventListener('change', function (e) { go.disabled = !e.target.checked; });
    go.addEventListener('click', function () { U.st = 'shred'; U.at = new Date().toTimeString().slice(0, 5); m.remove(); toast('원본 파기 확인을 기록했어요'); if (window.renderAll) renderAll(); });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-neis-up]'); if (!b) return;
    U = { st: 'run', k: 0 }; if (window.renderAll) renderAll();
    var t = setInterval(function () { U.k++; if (U.k > STEPS.length) { clearInterval(t); U.st = 'done'; if (window.renderAll) renderAll(); setTimeout(shredModal, 250); return; } if (window.renderAll) renderAll(); }, 380);
  });

  function extAdmHtml() {
    var mine = get(), rows = OTHERS.slice();
    if (mine.st === 'req' || mine.st === 'ok' || mine.st === 'rev') rows.unshift({ n: '김민정', r: '3-2 담임', why: mine.why, per: mine.per, dev: mine.dev, st: mine.st, me: 1 });
    var used = LIC.used + rows.filter(function (r) { return r.st === 'ok'; }).length;
    return '<section class="section"><div class="card" data-mk="school sec1102" data-mk-note="RFP v0.76 SER-001 화면 ② : 학교관리자 승인 · 회수 · 라이선스 잔여 (솔루션은 발주기관 도입)">'
      + '<h2>⑤ 집에서 업무 화면 보기 신청 <small style="font-weight:700;color:var(--ink-3)">교육청 라이선스 ' + used + ' / ' + LIC.total + ' 사용</small></h2>'
      + '<div class="btable"><table class="table"><thead><tr><th>선생님</th><th>사유 · 기간</th><th>단말</th><th>상태</th><th></th></tr></thead><tbody>'
      + rows.map(function (r, i) {
        var s = ST[r.st] || ST.none;
        var act = r.st === 'req' ? '<button type="button" class="btn btn--primary" style="padding:6px 12px;font-size:13px" data-ext-ok="' + (r.me ? 'me' : i) + '"' + (/미완료/.test(r.dev) ? ' disabled title="단말 검증 뒤 승인"' : '') + '>승인</button>' : r.st === 'ok' ? '<button type="button" class="btn btn--line" style="padding:6px 12px;font-size:13px" data-ext-rev="' + (r.me ? 'me' : i) + '">회수</button>' : '';
        return '<tr><td><b>' + esc(r.n) + '</b><br><small>' + esc(r.r) + '</small></td><td>' + esc(r.why) + '<br><small>' + esc(r.per) + '</small></td><td><small>' + esc(r.dev) + '</small></td><td><span class="badge ' + s[1] + '">' + s[0] + '</span></td><td>' + act + '</td></tr>';
      }).join('') + '</tbody></table></div><p class="sub" style="margin:8px 0 0">승인 · 회수는 2단계 인증 · 감사로그 · 담임 교체 · 전보 · 학년도 전환 때 자동 회수 · 접속 경로 이력은 플랫폼관리 「보안·인증 정책」</p></div></section>';
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-ext-ok],[data-ext-rev]'); if (!a) return;
    var okAct = a.hasAttribute('data-ext-ok'), key = a.getAttribute(okAct ? 'data-ext-ok' : 'data-ext-rev');
    var p = window.SEN_AUTH ? SEN_AUTH.stepUp(okAct ? '외부 접속 승인' : '외부 접속 회수') : Promise.resolve(true);
    p.then(function (r) {
      if (!r) return;
      if (key === 'me') { var v = get(); v.st = okAct ? 'ok' : 'rev'; put(v); } else { OTHERS[+key - ((get().st === 'none') ? 0 : 1)].st = okAct ? 'ok' : 'rev'; }
      toast(okAct ? '승인했어요 · 라이선스 1개 배정' : '회수했어요 · 다음 접속부터 막혀요'); if (window.renderAll) renderAll();
    });
  });

  window.SEN_1102 = {
    schoolHtml: function () { return neisHtml() + extAdmHtml(); },
    /* O존 집계판 아래 억제 규칙 3줄 (SER-007) */
    supRules: '<ul class="sub" style="margin:8px 0 0;padding-left:18px;font-size:12.5px" data-mk="home sec1102" data-mk-note="RFP v0.76 SER-007 · DAR-001 : O존 집계 기준"><li>5명이 안 되는 묶음은 숫자를 가리고, 합계에서 빼서 역산하지 못하게 다른 칸도 함께 가려요(2차 억제)</li><li>반 단위는 건수만 · 분포와 비교는 학교 · 학년 이상 묶음으로만 보여요</li><li>집계는 개인 상담 판단 근거로 쓰지 않아요 · 학생별 판단은 업무망 화면에서</li></ul>'
  };
  var st = document.createElement('style');
  st.textContent = '.xf{display:grid;grid-template-columns:90px 1fr;gap:8px;align-items:center;margin:0 0 8px;font-size:14px}.xf span{font-weight:800;color:var(--ink-2)}.xf select{min-height:40px;border:1px solid var(--line);border-radius:10px;padding:0 10px;font-size:14px;background:var(--bg)}';
  document.head.appendChild(st);
})();
