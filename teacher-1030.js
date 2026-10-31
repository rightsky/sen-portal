/* 교사공간 10-30 재편 (실무 의견 반영 4단계)
   - 탭 13 → 5 (홈 · 우리 반 · 진학지도 · 상담 · 자료), 진학지도·상담은 아래 줄에 하위 탭 (R01 R02 R06 R07 R08)
   - 학교 모드 / 집 모드 : 학교 업무망에서는 100% 상담·진학지도, 집 인터넷에서는 학생 개인정보 없이 상담 준비 (설계 전제 §6-2)
   - 판정 확인 3단 : AI 조언 → 선생님 확인·수정 → 상담 마무리 때 한 번 확정 후 학생 송부 (결정 3 제안값)
   - 환산점 : 「내 학생 자료 추가」 삭제, 합격률 문구 삭제, 선생님용 확정본 조회 (R01 R07 R10)
   - 반 실데이터 보관 위치 : 교육청 저장소 고정 (결정 2 제안값)
   이 파일은 teacher.html 본문 스크립트 다음에 읽혀 그 함수를 덮어쓴다. */
(function () {
  var NETK = 'sen-tch-net';
  var net = function () { try { return sessionStorage.getItem(NETK) || 'school'; } catch (e) { return 'school'; } };
  var setNet = function (v) { try { sessionStorage.setItem(NETK, v); } catch (e) {} };
  var GROUPS = [
    { k: 'home', t: '홈', views: ['home', 'prep'] },
    { k: 'class', t: '우리 반', views: ['class'] },
    { k: 'guide', t: '진학지도', views: ['susi', 'jeongsi', 'conv', 'hitl', 'compare', 'stats', 'mode'] },
    { k: 'counsel', t: '상담', views: ['assign', 'history'] },
    { k: 'data', t: '자료', href: 'library.html' }
  ];
  var VNAME = { home: '홈', class: '우리 반', susi: '수시', jeongsi: '정시', conv: '환산점', hitl: '판정 확인', compare: '비교', stats: '통계', mode: '학생상담모드', assign: '배정 답변', history: '상담 이력', prep: '상담 준비' };
  /* 화면별 접속 위치 : school = 학교 업무망 전용 · home = 집에서도 됨 · both = 집에서는 집계·배경만 */
  var NETOF = { home: 'both', class: 'school', susi: 'school', jeongsi: 'school', conv: 'school', hitl: 'school', compare: 'both', stats: 'home', mode: 'school', assign: 'both', history: 'school', prep: 'home' };
  var chips = function (v) {
    var n = NETOF[v];
    return n === 'school' ? ' data-mk="school"' : n === 'home' ? ' data-mk="home"' : ' data-mk="school home" data-mk-note="집에서는 집계·배경 정보만"';
  };
  var groupOf = function (v) { for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].views && GROUPS[i].views.indexOf(v) > -1) return GROUPS[i].k; return 'home'; };

  /* ── 탭 ── */
  function nav() {
    var g = document.getElementById('tgnb'); if (!g) return;
    var isCoun = state === 'counselor';
    var cur = groupOf(view);
    var top = GROUPS.filter(function (x) { return !isCoun || x.k === 'counsel' || x.k === 'data'; }).map(function (x) {
      if (x.href) return '<a href="' + x.href + '">' + x.t + '</a>';
      var first = x.views[0], badge = '';
      if (x.k === 'guide') badge = ' <span class="n" id="hitlN" style="display:none;place-items:center;min-width:20px;height:20px;border-radius:999px;background:var(--warn);color:#fff;font-size:11.5px;padding:0 6px"></span>';
      if (x.k === 'counsel') badge = ' <span class="n" id="asgN" style="display:none;place-items:center;min-width:20px;height:20px;border-radius:999px;background:var(--assign);color:#fff;font-size:11.5px;padding:0 6px"></span>';
      return '<a href="#" data-view="' + (x.k === 'counsel' && !isCoun ? 'assign' : first) + '" data-grp="' + x.k + '" class="' + (cur === x.k ? 'is-on' : '') + '">' + x.t + badge + '</a>';
    }).join('');
    var G = GROUPS.filter(function (x) { return x.k === cur; })[0];
    var sub = G && G.views && G.views.length > 1 ? '<div class="tsub" role="tablist" aria-label="' + G.t + ' 하위 메뉴">' + G.views.map(function (v) {
      return '<a href="#" role="tab" aria-selected="' + (v === view) + '" data-view="' + v + '" class="' + (v === view ? 'is-on' : '') + '"' + chips(v) + '>' + VNAME[v] + '</a>';
    }).join('') + '</div>' : '';
    g.innerHTML = '<div class="container">' + top + '<span class="tnet" data-mk="up1030 decide" data-mk-note="[의사결정] D4 교사공간 구조 : 10-19 두 쪽 일원화 ↔ 학교·집 모드 재정의 · §6-2 · 학교 모드 / 집 모드 (설계 검토용 전환 · 실제로는 접속 경로로 자동 결정)"><button type="button" data-net="school" class="' + (net() === 'school' ? 'is-on' : '') + '">학교 업무망</button><button type="button" data-net="home" class="' + (net() === 'home' ? 'is-on' : '') + '">집 인터넷</button></span></div>' + (sub ? '<div class="container">' + sub + '</div>' : '');
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-net]'); if (!b) return;
    e.preventDefault(); setNet(b.dataset.net); renderAll(); window.scrollTo({ top: 0 });
    showToast(b.dataset.net === 'home' ? '집 모드 : 학생 개인정보 없이 상담 준비만 할 수 있어요' : '학교 모드 : 우리 반 상담·진학지도를 모두 할 수 있어요');
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('#tgnb [data-view]'); if (!a) return;
    e.preventDefault(); e.stopImmediatePropagation();
    view = a.dataset.view; localStorage.setItem('sen-teacher-view', view); renderAll(); window.scrollTo({ top: 0 });
  }, true);

  /* ── 집 모드 안내 카드 ── */
  function homeGate(v) {
    return '<section class="section"><div class="gate" style="max-width:720px"><h2 data-mk="school up1030" data-mk-note="§6-2 판정 기준 : 화면에 학생 한 명을 가리키는 행이 있으면 학교 모드 전용">「' + VNAME[v] + '」은 학교에서 열 수 있어요</h2>'
      + '<p>이 화면에는 우리 반 학생의 이름·성적·학생부·상담 기록이 나와요. 개인정보 보호 때문에 학교 업무망 PC(또는 신청자 RBI 화면 전달)에서만 열려요.</p>'
      + '<p style="margin-top:12px"><b>집에서는 상담 준비를 해 두세요.</b> 입시 정보 분석, 가상 성적으로 미리 계산, 반 분포(명단 없음), 질문지·안내문, 작업 번호 메모까지 할 수 있고, 학교에 와서 학생과 연결하면 바로 상담에 쓸 수 있어요.</p>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:16px"><a class="btn btn--primary" href="#" data-view="prep">집에서 상담 준비하기</a><button type="button" class="btn btn--line" data-net="school">학교 모드로 보기(설계 검토)</button></div></div></section>';
  }

  /* ── 상단 띠 : 이름 · 학교 · 반 · 접속 위치 · 남은 시간 (R02 R06 : 인증 배지는 문제 있을 때만) ── */
  var _z1 = renderZ1;
  window.renderZ1 = renderZ1 = function () {
    _z1();
    var body = document.getElementById('z1Body'); if (!body || state === 'guest') { nav(); return; }
    var keep = [].slice.call(body.querySelectorAll('.badge--teach,[data-sess-left],.badge--warn,.badge--wait'));
    var name = body.querySelector('b'), spans = body.querySelectorAll(':scope > span:not(.badge):not(.sep)');
    var scope = spans.length ? spans[0].textContent : '';
    body.innerHTML = '<b>' + (name ? name.textContent : '') + '</b><span class="sep">|</span><span>' + scope + '</span><span class="sep">|</span>' + keep.map(function (k) { return k.outerHTML; }).join('')
      + '<span class="badge ' + (net() === 'home' ? 'badge--gray' : 'badge--ok') + '" data-mk="' + net() + '">' + (net() === 'home' ? '집 모드 · 상담 준비만' : '학교 모드 · 업무망') + '</span>';
    nav();
  };

  /* ── 진학지도 안내 띠 : 「학교 연계(PC)」 문구 대신 접속 위치 안내 ── */
  window.liteBand = liteBand = function (fn) {
    return '<div class="lite"><b>' + (net() === 'home' ? '집 모드' : '학교 모드') + '</b><span>' + fn + ' · 우리 반 25명 · 공식 판정과 학생 전달은 선생님 확정 뒤에만</span><span class="chip">SEN 진학프로그램과 같은 메뉴</span></div>';
  };

  /* ── 환산점 (§9 행 36·45) ── */
  window.convHtml = convHtml = function () {
    var rows = [['강지우', '국 3 · 수 2 · 영 3 · 탐 2·2', [['서울시립대 가군', '606.9'], ['국민대 나군', '603.3'], ['숭실대 다군', '599.0']]], ['김서연', '국 2 · 수 3 · 영 2 · 탐 2·3', [['서울시립대 가군', '612.4'], ['국민대 나군', '598.1'], ['숭실대 다군', '604.7']]], ['윤태양', '국 2 · 수 2 · 영 1 · 탐 3·3', [['서울시립대 가군', '618.2'], ['국민대 나군', '611.5'], ['숭실대 다군', '609.8']]]];
    var L = window.SEN_LEDGER.conv;
    var CF = [['2028', '서울시립대', '경영학부', '확정'], ['2028', '국민대', '경영학부', '확정'], ['2028', '숭실대', '경영학부', '확정'], ['2028', '한국대', '컴퓨터공학과', '업데이트 진행 중']];
    return '<section class="section"><h2 class="t" data-mk="school up1030" data-mk-note="§9 행 36 · 이름 「환산점」, 「내 학생 자료 추가」 삭제 (R01 R07)">환산점</h2>'
      + '<p class="s">학평·모의고사 성적으로 대학별 정시 환산점을 계산해요 (교과 성적이 아니라 수능형 성적 환산) · 환산식 원장 ' + L.version + ' · ' + L.state + ' (' + L.basis + ')</p>'
      + '<div class="card" style="margin-top:16px"><h2>우리 반 대학별 환산점</h2><p class="sub">잠정 = 9월 모의평가 기준 · 수능 성적 반영 전 · 값은 합성 데이터</p>'
      + '<table class="btable"><tr><th>학생</th><th>성적</th><th>대학·군</th><th>환산점</th><th>상태</th></tr>'
      + rows.map(function (r) { return r[2].map(function (u, i) { return '<tr>' + (i === 0 ? '<td rowspan="3"><b>' + r[0] + '</b> <small style="color:var(--ink-3)">3-2</small></td><td rowspan="3" style="font-size:13px">' + r[1] + '</td>' : '') + '<td>' + u[0] + '</td><td><b>' + u[1] + '</b> <small style="color:var(--ink-3)">/ 1000</small></td><td><span class="badge badge--wait">잠정</span></td></tr>'; }).join(''); }).join('')
      + '</table></div>'
      + '<div class="card" style="margin-top:16px"><h2 data-mk="up1030" data-mk-note="§9 행 45 · 선생님용 확정본 조회, 산출 근거는 업무시스템 (R10 R01 R05)">환산식 확정본 조회</h2><p class="sub">년도·대학·학과로 확정된 환산식을 봐요 · 산출 근거와 검수는 정보원 업무시스템에서 · 미확정은 「업데이트 진행 중」</p>'
      + '<table class="btable"><tr><th>학년도</th><th>대학</th><th>학과</th><th>상태</th></tr>' + CF.map(function (c) { return '<tr><td>' + c[0] + '</td><td>' + c[1] + '</td><td>' + c[2] + '</td><td>' + (c[3] === '확정' ? '<span class="badge badge--ok">확정</span>' : '<span class="badge" style="background:#FBEBEB;color:#B42318">' + c[3] + '</span>') + '</td></tr>'; }).join('') + '</table></div></section>';
  };

  /* ── 반 실데이터 보관 위치 : 교육청 저장소 고정 (결정 2 · R03) ── */
  window.storeHtml = storeHtml = function () {
    return '<h3 style="margin:20px 0 8px;font-size:15px" data-mk="up1030 decide" data-mk-note="[의사결정] D3 보관 위치 : 담임 선택(R01 R05 R07 · 10-14 결정) ↔ 교육청 통일(R02 R03 R08) · 지금은 교육청">우리 반 자료 보관 · 접근 기록</h3>'
      + '<div class="card" style="padding:16px 18px"><p style="margin:0 0 6px">우리 반 학생 원본은 <b>교육청 저장소(S존)</b>에만 있어요. 「이름·반·번호」와 「성적·내용」을 나눠 저장하고, 선생님 PC나 집 PC에는 내려받지 않아요.</p>'
      + '<ul class="rules" style="margin:0"><li>조회할 때마다 접근 기록이 남고, 학생·학부모에게 월간 열람 이력이 안내돼요</li><li>담당 학생은 「상담 준비」 사유가 자동으로 기록돼요(따로 고르지 않아요)</li><li>학년도 전환(3.1) 때 담당 범위가 자동으로 바뀌어요</li></ul></div>';
  };

  /* ── 판정 확인 3단 (결정 3 제안값 · R04 R06 R10 R09 R02) ── */
  var HK = 'sen-hitl3-v1';
  var H3 = (function () { try { return JSON.parse(sessionStorage.getItem(HK) || '{}'); } catch (e) { return {}; } })();
  var h3save = function () { try { sessionStorage.setItem(HK, JSON.stringify(H3)); } catch (e) {} };
  var REASONS = ['학생 활동·학생부를 더 반영', '수능 최저 충족 가능성 조정', '학생·학부모 지원 의사 반영', '자료 누락·오류', '기타(직접 입력)'];
  var STU = function () { var m = {}; HITL.forEach(function (h) { (m[h.stu] = m[h.stu] || []).push(h); }); return m; };
  window.pendingHitl = pendingHitl = function () { var m = STU(); return Object.keys(m).filter(function (k) { return !H3[k] && !m[k][0].mine; }).length; };
  window.hitlTodo = function () { var m = STU(); return Object.keys(m).filter(function (k) { return !H3[k] && !m[k][0].mine; }).map(function (k) { return { stu: k, list: m[k] }; }); };
  var sig = function (h) { return /교과/.test(h.uni) && h.draft !== '보류' ? '<span class="badge" title="판정 기준 : 3개년 합격자 내신 분포 대비 · 안정(중앙보다 0.3 이상 우위) · 적정(±0.3) · 소신(0.3~0.8 열위) · 상향(0.8 이상 열위)" style="background:color-mix(in srgb,' + JC[h.draft] + ' 14%,transparent);color:' + JC[h.draft] + '">교과 신호등 · ' + h.draft + '</span>' : ''; };
  window.hitlHtml = hitlHtml = function () {
    var m = STU();
    var card = function (stu) {
      var list = m[stu], st = H3[stu], mine = list[0].mine;
      var rows = list.map(function (h) {
        var e = (st && st.edit && st.edit[h.id]) || ((H3['_d'] || {})[stu] || {})[h.id] || {};
        return '<div style="padding:12px 0;border-top:1px solid var(--line)"><b>' + h.uni + '</b> ' + sig(h)
          + '<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">' + h.ev.map(function (x) { return '<span class="badge badge--gray">근거 · ' + x + '</span>'; }).join('') + '<span class="badge ' + (/통과/.test(h.gate) ? 'badge--ok' : 'badge--warn') + '">지원 자격 · ' + h.gate.replace('자격 게이트 ', '') + '</span>'
          + (typeof HS !== 'undefined' && Array.isArray(HS[h.id + '_ev']) ? HS[h.id + '_ev'].map(function (x) { return '<span class="badge badge--teach">비교·분석 · ' + String(x).replace(/</g, '&lt;') + '</span>'; }).join('') : '') + '</div>'
          + (st && st.done ? ((e.r || e.t) ? '<div style="margin-top:8px;font-size:13px;color:var(--ink-2)">' + (e.r ? '<span class="badge badge--gray">수정 사유 · ' + e.r + '</span> ' : '') + (e.t ? '<span>[선생님 의견] ' + String(e.t).replace(/</g, '&lt;') + '</span>' : '') + '</div>' : '<div style="margin-top:8px;font-size:13px;color:var(--ink-3)">그대로 확정 (수정 없음)</div>') : '<div style="display:grid;grid-template-columns:minmax(0,220px) 1fr;gap:8px;margin-top:8px"><select class="xsel" data-h3r="' + stu + '|' + h.id + '" aria-label="수정 사유"><option value="">그대로 (수정 없음)</option>' + REASONS.map(function (r) { return '<option' + (e.r === r ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select><input class="xsel" data-h3t="' + stu + '|' + h.id + '" placeholder="선생님 의견 (학생에게 갈 문장 · 확률 숫자·합불 단정 금지)" value="' + (e.t ? String(e.t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;') : '') + '"></div>')
          + '</div>';
      }).join('');
      return '<div class="card" style="padding:18px 20px"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><b style="font-size:16px">' + stu + ' <small style="color:var(--ink-3);font-weight:700">3-2 · 지원 후보 ' + list.length + '곳</small></b>'
        + (mine ? '<span class="badge badge--gray">본인 자녀 건 · 진학부장 대리</span>' : st && st.done ? '<span class="badge badge--ok">확정 · 학생에게 전달됨 (' + st.at + ')</span>' : '<button class="btn btn--primary" data-h3done="' + stu + '">③ 상담 마무리 · 한 번에 확정하고 전달</button>') + '</div>' + rows + '</div>';
    };
    var names = Object.keys(m);
    var todo = names.filter(function (k) { return !H3[k]; }), done = names.filter(function (k) { return H3[k]; });
    return '<section class="section"><h2 class="t" data-mk="school up1030" data-mk-note="결정 3 제안값 · 3단 + 한 번 확정 (R04 R06 R10 R09)">판정 확인 <span class="badge badge--wait">' + pendingHitl() + '명 대기</span></h2>'
      + '<p class="s">① AI 조언(근거만, 확률 숫자 없음) → ② 선생님 확인·수정(사유 선택 + 의견) → ③ 상담을 마칠 때 학생별로 한 번 확정하면 학생에게 [선생님 의견]으로 전달돼요 · 대학별로 따로 승인하지 않아요 · 승인은 담임이 해요</p>'
      + '<div class="share__notice" data-mk="decide" data-mk-note="[의사결정] D1 학생 화면 신호등 : 지금은 선생님 화면에만">학생 화면에는 확률 숫자와 「AI」 표시가 가지 않아요 · 교과 신호등은 선생님 화면에만, 판정 기준을 함께 보여요 · AI와 방향이 다른 확정은 진학부장에게 참고 표시(필수 검토 아님)</div>'
      + '<h3 style="margin:16px 0 8px;font-size:15px">확인할 학생 <small style="color:var(--ink-3)">' + todo.length + '명</small></h3><div style="display:grid;gap:10px">' + (todo.length ? todo.map(card).join('') : '<p class="caption">확인할 학생이 없어요</p>') + '</div>'
      + '<h3 style="margin:22px 0 8px;font-size:15px">확정·전달 <small style="color:var(--ink-3)">' + done.length + '명</small></h3><div style="display:grid;gap:10px">' + (done.length ? done.map(card).join('') : '<p class="caption">아직 확정한 학생이 없어요</p>') + '</div></section>';
  };
  document.addEventListener('change', function (e) {
    var r = e.target.closest && e.target.closest('[data-h3r],[data-h3t]'); if (!r) return;
    var key = (r.dataset.h3r || r.dataset.h3t).split('|'); var stu = key[0], id = key[1];
    H3['_d'] = H3['_d'] || {}; var d = (H3['_d'][stu] = H3['_d'][stu] || {}); d[id] = d[id] || {};
    if (r.dataset.h3r) d[id].r = r.value; else d[id].t = r.value; h3save();
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-h3done]'); if (!b) return;
    var stu = b.dataset.h3done;
    hitlConfirm().then(function () {
      H3[stu] = { done: true, at: (window.SEN_LEDGER ? SEN_LEDGER.fmt.today() : '2027.09.01'), edit: (H3['_d'] || {})[stu] || {} }; if (H3['_d']) delete H3['_d'][stu]; h3save();
      renderAll(); showToast(stu + ' 학생 판정을 확정했어요 · 학생 화면에 [선생님 의견]으로 전달돼요');
    });
  });

  /* ── 상담 이력 (§9 행 32 · 감사로그는 여기 아래로) ── */
  function historyHtml() {
    return '<section class="section"><h2 class="t" data-mk="school up1030">상담 이력</h2><p class="s">확정한 상담 기록과 열람 기록이 모여요 · 학교 업무망 전용</p><div class="card"><table class="btable"><tr><th>날짜</th><th>학생</th><th>유형</th><th>상태</th></tr><tr><td>2027.08.30</td><td><b>강지우</b></td><td>수시 지원 전략</td><td><span class="badge badge--ok">확정</span></td></tr><tr><td>2027.08.28</td><td><b>김서연</b></td><td>학업 설계</td><td><span class="badge badge--ok">확정</span></td></tr></table></div>'
      + '<h3 style="margin:20px 0 8px;font-size:15px">열람 기록</h3><p class="caption">담당 학생 열람은 「상담 준비」 사유가 자동으로 기록되고, 학생 알림은 하루에 한 번 묶어서 가요 (원칙 7-4 · 결정 21 제안값)</p></section>';
  }

  /* ── 화면 라우팅 덮어쓰기 ── */
  /* 탭 강조·배지 : teacher.html renderMain이 data-view 단위로 is-on을 바꾸므로, 그룹 탭(진학지도 등)·하위 탭·대기 수 배지를 다시 맞춘다 */
  function navSync() {
    var cur = groupOf(view);
    document.querySelectorAll('#tgnb [data-grp]').forEach(function (a) { a.classList.toggle('is-on', a.dataset.grp === cur); });
    document.querySelectorAll('#tgnb .tsub [data-view]').forEach(function (a) { var on = a.dataset.view === view; a.classList.toggle('is-on', on); a.setAttribute('aria-selected', on); });
    var hn = document.getElementById('hitlN'); if (hn) { var n = (state === 'subject' || state === 'counselor') ? 0 : pendingHitl(); hn.textContent = n; hn.style.display = n ? 'inline-grid' : 'none'; }
    var an = document.getElementById('asgN'); if (an) { var n2 = state === 'counselor' && window.pendingAsg ? pendingAsg() : 0; an.textContent = n2; an.style.display = n2 ? 'inline-grid' : 'none'; }
  }
  var _main = renderMain;
  window.renderMain = renderMain = function () { renderMain1(); navSync(); };
  function renderMain1() {
    var m = document.getElementById('main');
    if (state !== 'guest' && state !== 'expired') {
      if (net() === 'home' && NETOF[view] === 'school') { m.innerHTML = homeGate(view); bindExtra(); return; }
      if (net() === 'home' && view === 'home' && window.prepHtml) { m.innerHTML = prepHtml(); bindExtra(); if (window.bindPrep) bindPrep(); return; }
      if (view === 'history') { m.innerHTML = historyHtml(); return; }
      if (view === 'prep') { m.innerHTML = window.prepHtml ? prepHtml() : homeGate('home'); bindExtra(); if (window.bindPrep) bindPrep(); return; }
    }
    _main();
    if (net() === 'home' && state !== 'guest') homeMask(view);
  }
  /* 집 모드에서 홈·배정 답변·비교 : 학생 이름을 가리고 건수·시간만 (§6-2 · 결정 17) */
  function homeMask(v) {
    var m = document.getElementById('main'); if (!m) return;
    var names = (CLASS || []).map(function (c) { return c.n; }).concat(['김하늘', '김서연 모', '강지우', '학생 A', '학생 B', '학생 C', '학생 D']);
    var w = document.createTreeWalker(m, NodeFilter.SHOW_TEXT), n, t = [];
    while ((n = w.nextNode())) t.push(n);
    t.forEach(function (x) { var s = x.nodeValue, o = s; names.forEach(function (nm) { if (nm && s.indexOf(nm) > -1) s = s.split('학생 ' + nm).join('학생 ●').split(nm).join('학생 ●'); }); s = s.replace(/서울[가-힣]{1,4}고(?!등)/g, '○○고'); if (s !== o) x.nodeValue = s; });
    m.insertAdjacentHTML('afterbegin', '<div class="share__notice" style="margin-top:16px" data-mk="home up1030" data-mk-note="§6-2 · 집 모드는 학생 이름·학교를 보여 주지 않음">집 모드 : 학생 이름·학교는 가려져요 · 건수·시간과 집계만 볼 수 있어요 · 학생 단위 화면은 학교에서</div>');
  }

  /* 스타일 */
  var st = document.createElement('style');
  st.textContent = '.tgnb .container + .container{border-top:1px solid var(--line)}.tsub{display:flex;gap:4px;overflow-x:auto;padding:4px 0}.tsub a{padding:10px 14px;font-size:14px;font-weight:700;border-radius:999px;border:0;color:var(--ink-2);white-space:nowrap}.tsub a.is-on{background:#EEF3FF;color:var(--navy)}'
    + '.tnet{margin-left:auto;display:inline-flex;align-items:center;gap:4px;padding:6px 0}.tnet button{min-height:34px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--bg);font-weight:800;font-size:13px;color:var(--ink-2);cursor:pointer}.tnet button.is-on{background:var(--navy);border-color:var(--navy);color:#fff}'
    + '@media (max-width:768px){.tnet{margin-left:8px}}';
  document.head.appendChild(st);

  /* 교사 인증 : 교육디지털원패스만 + 2단계 인증 (10-30 사용자 결정 D5 · GPKI 쓰지 않음) */
  try { localStorage.setItem('sen-authmode', 'B'); } catch (e) {}
  if (['class', 'history'].indexOf(view) < 0 && !NETOF[view]) view = 'home';
  renderAll();
})();
