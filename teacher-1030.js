/* 교사공간 10-30 재편 (실무 의견 반영 4단계)
   - 탭 13 → 5 (홈 · 우리 반 · 진학지도 · 상담 · 자료), 진학지도·상담은 아래 줄에 하위 탭 (R01 R02 R06 R07 R08)
   - 학교 모드 / 집 모드 : 학교 업무망에서는 100% 상담·진학지도, 집 인터넷에서는 학생 개인정보 없이 상담 준비 (설계 전제 §6-2)
   - 판정 확인 3단 : AI 조언 → 선생님 확인·수정 → 상담 마무리 때 한 번 확정 후 학생 송부 (결정 3 제안값)
   - 환산점 : 「내 학생 자료 추가」 삭제, 합격률 문구 삭제, 선생님용 확정본 조회 (R01 R07 R10)
   - 반 실데이터 보관 위치 : 교육청 저장소 고정 (결정 2 제안값)
   이 파일은 teacher.html 본문 스크립트 다음에 읽혀 그 함수를 덮어쓴다. */
(function () {
  /* 11-02 보안 검토 : 교사공간을 O존 포털(teacher.html)과 S존 교사 업무 화면(teacher-school.html)으로 나눈다.
     단말로 모드를 나누던 「학교 업무망 / 집 인터넷」 전환은 없앴다. 어느 존인지는 <meta name="sen-zone">로 정한다. */
  var ZONE = ((document.querySelector('meta[name="sen-zone"]') || {}).content === 'S') ? 'S' : 'O';
  window.SEN_ZONE = ZONE;
  var net = function () { return ZONE === 'S' ? 'school' : 'home'; };
  var SZK = 'sen-szone';
  var sPass = function () { try { var v = JSON.parse(sessionStorage.getItem(SZK) || 'null'); return v && Date.now() < v.until ? v : null; } catch (e) { return null; } };
  var sGrant = function (path) { var v = { path: path, until: Date.now() + 30 * 60000 }; try { sessionStorage.setItem(SZK, JSON.stringify(v)); } catch (e) {} return v; };
  var PATHS = { lan: '교육청 업무망 PC (모델 4 · 인터넷 연계체계)', ext: '외부 단말 : VPN/ZTNA + MFA + 단말 검증 + RBI/VDI (모델 9 · 신청자)' };
  var GROUPS = ZONE === 'S' ? [
    { k: 'home', t: '홈', views: ['home'] },
    { k: 'class', t: '우리 반', views: ['class'] },
    { k: 'guide', t: '진학지도', views: ['susi', 'jeongsi', 'conv', 'hitl', 'compare', 'mode'] },
    { k: 'counsel', t: '상담', views: ['assign', 'history'] },
    { k: 'portal', t: '포털 교사공간', href: 'teacher.html' }
  ] : [
    { k: 'home', t: '홈', views: ['home'] },
    { k: 'prep', t: '상담 준비', views: ['prep'] },
    { k: 'stats', t: '통계', views: ['stats'] },
    { k: 'counsel', t: '배정 답변', views: ['assign'] },
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
    var zc = ZONE === 'S'
      ? '<span class="tnet" data-mk="school sec1102" data-mk-note="보안 검토 11-02 · 2-1 ⑤ : S존 화면은 업무망 PC 또는 VPN · MFA · 단말 검증 · RBI 경로로만"><span class="zbadge zbadge--s">S존 · 교육청 업무망 화면</span>' + (sPass() ? '<small>접속 경로 : ' + (PATHS[sPass().path] || '').split(' (')[0] + '</small>' : '') + '</span>'
      : '<span class="tnet" data-mk="home sec1102" data-mk-note="보안 검토 11-02 · 2-1 ①~③ : 포털(O존)에는 건수 · 집계 · 상담 준비만, 학생 단위 화면은 S존 별도 접속"><span class="zbadge zbadge--o">O존 · 포털 교사공간</span><button type="button" data-senter="home">교육청 업무망 화면 열기 ›</button></span>';
    g.innerHTML = '<div class="container">' + top + zc + '</div>' + (sub ? '<div class="container">' + sub + '</div>' : '');
  }
  /* O존에서 학생 단위 view(S존)로 가는 모든 클릭은 진입 창을 거쳐 teacher-school.html 새 창으로 */
  var S_ONLY = { class: 1, susi: 1, jeongsi: 1, conv: 1, hitl: 1, compare: 1, mode: 1, history: 1 };
  function enterS(v, why) {
    var m = document.createElement('div'); m.className = 'sgate'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = '<div class="sgate__p"><button type="button" class="sgate__x" data-sgx aria-label="닫기">✕</button><h2 data-mk="sec1102" data-mk-note="보안 검토 11-02 · 2-1 ⑤ : 진입 경로 명시 (업무망 PC 모델 4 · 외부 단말 VPN/ZTNA + MFA + 단말 검증 + RBI 모델 9)">교육청 업무망(S존) 화면으로 들어가요</h2>'
      + '<p class="sgate__d">' + (why || '학생 한 명을 가리키는 화면(우리 반 · 진학지도 · 판정 확인 · 학생상담모드 · 상담 이력)') + '은 포털이 아니라 교육청 업무망 화면에서 열려요. 어디서 접속하는지 고르면 2단계 인증 뒤 새 창으로 열립니다.</p>'
      + '<label class="sgate__o"><input type="radio" name="spath" value="lan" checked><span><b>① ' + PATHS.lan + '</b><small>학교 · 정보원 업무망 PC. 추가 장비 없이 2단계 인증만</small></span></label>'
      + '<label class="sgate__o"><input type="radio" name="spath" value="ext"><span><b>② ' + PATHS.ext + '</b><small>집 · 개인 노트북. 재택 접속 신청자만 · 화면만 전달되고 파일 저장 · 복사 · 캡처는 막혀요</small></span></label>'
      + '<p class="sgate__n">「2단계 인증만으로는 부족」 : 업무망 밖에서는 VPN · MFA · 단말 검증 · RBI를 모두 거친 단말만 들어올 수 있어요 (N2SF 모델 9)</p>'
      + '<div class="sgate__a"><button type="button" class="btn btn--line" data-sgx>취소</button><button type="button" class="btn btn--primary" data-sgo>2단계 인증 뒤 열기</button></div></div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) {
      if (e.target.closest('[data-sgx]')) { m.remove(); return; }
      if (!e.target.closest('[data-sgo]')) return;
      var path = (m.querySelector('input[name="spath"]:checked') || {}).value || 'lan';
      m.style.display = 'none'; /* 2단계 인증 창이 위에 보이게 */
      var ok = window.SEN_AUTH ? SEN_AUTH.stepUp('교육청 업무망 화면 진입 (' + (path === 'lan' ? '업무망 PC' : '외부 단말 · RBI') + ')') : Promise.resolve(true);
      ok.then(function (r) { if (!r) { m.style.display = ''; return; } m.remove(); sGrant(path);
        var url = v === 'pro' ? (typeof PRO_URL !== 'undefined' ? PRO_URL : 'sen-pro.html') : v === 'rec' ? 'sen-ai-poc.html?zone=S#rec' : 'teacher-school.html?path=' + path + '#' + (v || 'home');
        var w = window.open(url, v === 'pro' ? 'senpro' : 'senschool'); if (!w) location.href = url;
        showToast(path === 'lan' ? '업무망 PC 경로로 열었어요 · 세션 30분' : '외부 단말 · RBI 경로로 열었어요 · 화면만 전달 · 세션 30분'); });
    });
  }
  window.enterS = enterS;
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-senter]'); if (!b) return;
    e.preventDefault(); e.stopImmediatePropagation(); enterS(b.dataset.senter || 'home', b.dataset.senterWhy);
  }, true);
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-view]'); if (!a) return;
    var v = a.dataset.view;
    if (ZONE === 'O' && S_ONLY[v]) { e.preventDefault(); e.stopImmediatePropagation(); enterS(v); return; }
    if (!a.closest('#tgnb')) return;
    e.preventDefault(); e.stopImmediatePropagation();
    view = v; localStorage.setItem('sen-teacher-view', view); renderAll(); window.scrollTo({ top: 0 });
  }, true);

  /* ── 상단 띠 : 이름 · 학교 · 반 · 접속 위치 · 남은 시간 (R02 R06 : 인증 배지는 문제 있을 때만) ── */
  var _z1 = renderZ1;
  window.renderZ1 = renderZ1 = function () {
    _z1();
    var body = document.getElementById('z1Body'); if (!body || state === 'guest') { nav(); return; }
    var keep = [].slice.call(body.querySelectorAll('.badge--teach,[data-sess-left],.badge--warn,.badge--wait'));
    var name = body.querySelector('b'), spans = body.querySelectorAll(':scope > span:not(.badge):not(.sep)');
    var scope = spans.length ? spans[0].textContent : '';
    body.innerHTML = '<b>' + (name ? name.textContent : '') + '</b><span class="sep">|</span><span>' + scope + '</span><span class="sep">|</span>' + keep.map(function (k) { return k.outerHTML; }).join('')
      + '<span class="badge ' + (ZONE === 'O' ? 'badge--gray' : 'badge--ok') + '" data-mk="' + net() + '">' + (ZONE === 'O' ? 'O존 포털 · 건수 · 상담 준비' : 'S존 · 교육청 업무망') + '</span>';
    nav();
  };

  /* ── 진학지도 안내 띠 : 「학교 연계(PC)」 문구 대신 접속 위치 안내 ── */
  window.liteBand = liteBand = function (fn) {
    return '<div class="lite"><b>' + (ZONE === 'O' ? 'O존 포털' : 'S존 업무망') + '</b><span>' + fn + ' · 우리 반 25명 · 공식 판정과 학생 전달은 선생님 확정 뒤에만</span><span class="chip">SEN 진학프로그램과 같은 메뉴</span></div>';
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
  /* ── O존 포털 홈 : 건수 카드 · 집계판 · 업무망 화면 입구 (보안 검토 11-02 · 2-1 ①~③, 3-3) ── */
  var SUP = function (n) { return n < 5 ? '5명 미만' : n + '명'; };   /* 5명 미만 억제 : 숫자 자체를 가린다 (실명과 무관) */
  var LGR = window.SEN_LEDGER;
  function oHomeHtml() {
    var C = typeof CLASS !== 'undefined' ? CLASS : [], S = typeof SHARES !== 'undefined' ? SHARES : [], AU = typeof AUDIT !== 'undefined' ? AUDIT : [], SU = typeof SUSI !== 'undefined' ? SUSI : [], T = typeof TODO !== 'undefined' ? TODO : [];
    var req = (T.filter(function (t) { return t.k === 'req'; })[0] || {}).n || 0;
    var bands = [['1등급대', 4], ['2등급대', 9], ['3등급대', 8], ['4등급대 이하', 4]]; /* 25명 (상담 준비 B 묶음과 같은 값) · 시연 명단(CLASS)은 8명뿐이라 반 전체 값은 고정 */
    var cards = SU.reduce(function (a, r) { a[0] += r.cards.교과; a[1] += r.cards.종합; a[2] += r.cards.논술; return a; }, [0, 0, 0]);
    var minChk = SU.filter(function (r) { return /미달|점검/.test(r.min); }).length;
    var isCoun = state === 'counselor', isAdm = state === 'schooladmin', isSubj = state === 'subject';
    var k = function (t, v, d, mk) { return '<div class="kpi"' + (mk ? ' data-mk="' + mk + '"' : '') + '><span>' + t + '</span><b>' + v + '</b><span class="d">' + d + '</span></div>'; };
    var counts = '<div class="kpis" style="grid-template-columns:repeat(4,1fr)">'
      + k('상담 요청', req + '건', '희망일 9.6~9.8 · 학부모 신청 1건 · 상세 · 일정 확정은 업무망 화면', 'home sec1102')
      + k('공유 승인', S.length + '건', '새 승인 2건 · 상담 한정 1건 · 카드는 업무망 화면')
      + k('오늘 열람', AU.length + '건', '이번 주 12건 · 사유 변경 1건 · 기록은 업무망 화면')
      + k('판정 확인 대기', (isSubj || isCoun ? 0 : pendingHitl()) + '명', '상담 마칠 때 한 번 확정 · 업무망 화면') + '</div>';
    var enter = '<div class="card is-navy" style="padding:18px 20px" data-mk="sec1102" data-mk-note="보안 검토 11-02 · 3절 : 포털에는 링크와 건수만, 학생 단위 화면은 S존 호스팅"><div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;justify-content:space-between"><div style="min-width:0;flex:1 1 320px"><h2 style="margin:0 0 6px">교육청 업무망(S존) 화면 <small style="font-weight:700;opacity:.8">학생 한 명을 가리키는 화면은 여기서</small></h2><p class="sub" style="margin:0;opacity:.9">우리 반 명단 · 수시/정시 학생별 지도 · 학생별 환산점 · 판정 확인 · 비교·분석(우리 반) · 학생상담모드 · 상담 이력 · 공유 자료 · 열람 기록 · 학교 관리 · SEN 진학프로그램 · 학생부 읽기 도우미</p><p style="margin:8px 0 0;font-size:13px;opacity:.85">들어가는 길 : ① 학교 · 정보원 업무망 PC ② 외부 단말은 VPN/ZTNA + MFA + 단말 검증 + RBI(재택 접속 신청자) · 2단계 인증 · 세션 30분</p></div><button class="btn btn--primary" data-senter="home" style="flex:none">업무망 화면 열기 ›</button></div></div>';
    var agg = '<section class="section"><h2 class="t" data-mk="home sec1102 rep" data-mk-note="보안 검토 11-02 · 3-4 : S존 화면마다 O존용 집계판 · 반 단위는 건수 · 5명 미만 억제, 이름 없음">우리 반 집계판 <small style="color:var(--ink-3);font-weight:700">이름 없음 · 숫자만</small></h2><p class="s">학생 한 명을 가리키는 행은 없어요 · 5명이 안 되는 묶음은 숫자도 가려요 · 학생별로 보려면 업무망 화면</p>'
      + '<div class="kpis" style="grid-template-columns:repeat(4,1fr)">'
      + k('반 관리', '25명', 'NEIS 반영 완료 22 · 누락·오류 3 · 공유 동의 ' + S.length)
      + k('내신 분포', bands.map(function (b) { return b[0].replace('등급대', '') + ' ' + SUP(b[1]); }).join(' · '), '등급대별 · 5명 미만 억제')
      + k('수시 지원 카드', (cards[0] + cards[1] + cards[2]) + '장', '교과 ' + cards[0] + ' · 종합 ' + cards[1] + ' · 논술 ' + cards[2] + ' · 최저 점검 ' + SUP(minChk))
      + k('상담 이력', '2건', '이번 달 · 수시 전략 1 · 학업 설계 1 · 유형별 집계만')
      + '</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">' + ['class|우리 반 명단', 'susi|수시 학생별', 'jeongsi|정시 학생별', 'hitl|판정 확인', 'history|상담 이력 · 열람 기록'].map(function (x) { var a = x.split('|'); return '<button type="button" class="btn btn--line" style="padding:7px 12px;font-size:13px" data-senter="' + a[0] + '">' + a[1] + ' › 업무망</button>'; }).join('') + '</div></section>';
    var sys = '<section class="section"><h2 class="t">업무 시스템 입구</h2><p class="s">아래는 모두 S존(교육청 업무망) 화면이에요 · 포털에서는 입구만</p><div class="sys">'
      + '<article class="is-navy pro"><div class="pro__head"><div class="ico">🖥️</div><div><h3>SEN 진학프로그램 <small>전문시스템 · S존</small></h3><p data-mk="sec1102" data-mk-note="보안 검토 11-02 · 2-1 ⑤ : 「2단계 인증만으로는 부족」, 접속 경로 명시">교육청 업무망 PC 또는 VPN · MFA · 단말 검증 · RBI를 거친 단말에서만 · NEIS 일괄 반영 · 반 전체 공식 판정</p></div></div><button class="btn btn--primary" data-pro="SEN 진학프로그램 열기">업무망 경로로 열기 ›</button></article>'
      + '<article><div class="ico">📖</div><h3>학생부 읽기 도우미 <small style="font-weight:700;color:var(--ink-3)">교사용 · S존 메뉴</small></h3><p data-mk="sec1102" data-mk-note="보안 검토 11-02 · 2-1 ⑥ : 포털에서 직접 열지 않고 S존 전문시스템 메뉴로, 처리 위치가 S존 RAG임을 명시">학생부 원문과 가명 요약은 S존 RAG에서만 처리해요 · 포털에서는 열리지 않아요</p><button class="btn btn--line" data-senter="rec" data-senter-why="학생부 읽기 도우미(교사용)">업무망 화면에서 열기 ›</button></article>'
      + (isCoun ? '<article><div class="ico">🗓️</div><h3>정보원 상담시스템</h3><p>배정 상담 · 방문·화상 상담 운영 (S존 업무시스템)</p><a class="btn btn--line" href="ops-counsel.html">열기 ›</a></article>' : '')
      + '<article><div class="ico">💾</div><h3>기존 교사용 쎈진학 <small style="font-weight:700;color:var(--ink-3)">전환 기간</small></h3><p data-mk="sec1102 decide" data-mk-note="보안 검토 11-02 · 2-1 ⑦ · [의사결정] D14 : 전환 순서와 폐쇄 시점 명시 (날짜는 제안값)">설치형 프로그램 · ① 병행 ~2027.8 → ② 배포 중단 2027.9(제안) → ③ 폐쇄 2027.12(D14 ★) · 집에서는 쓰지 않아요</p><button class="btn btn--line" data-toast="설치형 쎈진학은 학교 업무망 PC에서만 · 2027.12 폐쇄 예정">업무망 PC에서 실행</button></article>'
      + '</div></section>';
    var res = typeof RES !== 'undefined' ? '<section class="section"><h2 class="t">교사 전용 자료 · 연수</h2><p class="s">교사 인증 열람분 · 전문(全文)은 이 공간에서만 · 서가는 자료실과 공용</p><div class="res">' + RES.map(function (r) { return '<article><h3>' + r.t + (/세특|사례/.test(r.p) ? ' <span class="badge badge--gray" data-mk="sec1102 syn" data-mk-note="보안 검토 11-02 · 2-1 ⑧ : 세특 기록 예시는 가공 예시임을 자료와 메타데이터에 표기 · [확인 필요] 원천">가공 예시 · 실제 학생부 아님</span>' : '') + '</h3><p>' + r.p + '</p><a href="' + r.href + '"' + (r.toast ? ' data-toast="' + r.toast + '"' : '') + '>' + r.a + '</a></article>'; }).join('') + '</div></section>' : '';
    var brief = '<section class="section"><h2 class="t">2028 대입 교사 브리핑 <span class="badge badge--src">대교협 · 2026.4.29 기준</span></h2><p class="s">학급 지도 전에 한 번 읽는 요약 · 공개 자료</p><div class="kpis">'
      + k('2028 전체 모집인원', '348,789명', '+3,072') + k('수시 · 정시', '80.8% · 19.2%', '수시 비중 유지') + k('학생부종합', '+2,773명', '증가')
      + k('수시 원서접수', LGR ? LGR.fmt.susiApply() : '9.20~9.23', '수능 ' + (LGR ? LGR.schedule.csat.date : '11.18') + ' · 정시 ' + (LGR ? LGR.fmt.jeongsiApply() : '1.3~1.6')) + '</div></section>';
    var rules = '<section class="section"><div class="card"><h2>권한 원칙</h2><ul class="rules"><li>담당 학년·반 학생만 · 전체보기는 관리자 설정 + 사유 기록</li><li>화면·저장소·연계 세 곳 모두에서 담당 학생만 볼 수 있게 막아요 · 학년도 전환 시 일괄 재승인</li><li>위촉 만료 시 권한 자동 회수</li><li>학생 성적 원문·판정 결과·반영 파일은 포털에 표시하지 않음 · 포털(O존)에는 저장·캐시하지 않음</li></ul><p class="caption" data-mk="sec1102" data-mk-note="보안 검토 11-02 · 2-1 ⑨ : 접근통제_ABAC_RLS_설계_v1 과 번호로 연결 (절 번호는 사용자 문서 기준으로 채움)">설계 근거 : 접근통제_ABAC_RLS_설계_v1 §(번호 확인 중) · 열람 사유는 기본값 「상담 준비」가 자동으로 들어가고 바꿀 수 있어요</p></div></section>';
    var adm = isAdm ? '<section class="section"><div class="card"><h2>학교 관리 <small style="font-weight:700;color:var(--ink-3)">승인함 · 교사 등록 · 담당 매핑</small></h2><p class="sub">승인 대기 ' + (typeof REQS !== 'undefined' ? REQS.length : 3) + '건 · 교원 이름과 편성표 대조는 업무망 화면에서</p><button class="btn btn--line" data-senter="home" data-senter-why="학교 관리(승인함 · 교사 등록 · 담당 매핑)">업무망 화면에서 처리 ›</button></div></section>' : '';
    return counts + enter + adm + agg + sys + res + brief + rules;
  }

  /* ── S존 진입 게이트 (teacher-school.html) ── */
  function sGateHtml() {
    return '<section class="section"><div class="gate" style="max-width:760px"><h2 data-mk="school sec1102" data-mk-note="보안 검토 11-02 · 3-1 : S존 화면은 별도 접속 경로 · 포털 GNB 없음">교육청 업무망(S존) 교사 업무 화면</h2>'
      + '<p>이 화면에는 우리 반 학생의 이름 · 성적 · 학생부 · 상담 기록이 나와요. 접속 경로를 확인하고 2단계 인증을 거친 뒤 열립니다.</p>'
      + '<div style="display:grid;gap:8px;text-align:left;margin:14px auto;max-width:560px">'
      + '<label class="sgate__o"><input type="radio" name="spath2" value="lan" checked><span><b>① ' + PATHS.lan + '</b><small>학교 · 정보원 업무망 PC</small></span></label>'
      + '<label class="sgate__o"><input type="radio" name="spath2" value="ext"><span><b>② ' + PATHS.ext + '</b><small>재택 접속 신청자 · 화면만 전달</small></span></label></div>'
      + '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button type="button" class="btn btn--primary" data-sgate-go>2단계 인증 뒤 열기</button><a class="btn btn--line" href="teacher.html">포털 교사공간으로</a></div>'
      + '<p class="tel" style="margin-top:14px">세션 30분 · 무입력 20분 잠금 · 캡처 · 재배포 금지 · 열람은 기록되고 학생에게 하루 묶음으로 알림</p></div></section>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-sgate-go]'); if (!b) return;
    var path = (document.querySelector('input[name="spath2"]:checked') || {}).value || 'lan';
    (window.SEN_AUTH ? SEN_AUTH.stepUp('교육청 업무망 화면 진입 (' + (path === 'lan' ? '업무망 PC' : '외부 단말 · RBI') + ')') : Promise.resolve(true)).then(function (r) { if (!r) return; sGrant(path); renderAll(); });
  });
  function sBand() {
    var old = document.querySelector('.sband'); if (old) old.remove();
    var p = sPass(); if (ZONE !== 'S' || !p) return;
    var m = document.getElementById('main'); if (!m) return;
    m.insertAdjacentHTML('afterbegin', '<div class="sband" data-mk="school sec1102" data-mk-note="보안 검토 11-02 · 3-1 : 상단 띠 「교육청 업무망(S존) 화면 · 세션 30분 · 캡처 · 재배포 금지」"><b>교육청 업무망(S존) 화면</b><span>접속 경로 : ' + (PATHS[p.path] || '').split(' (')[0] + '</span><span>세션 ' + Math.max(1, Math.round((p.until - Date.now()) / 60000)) + '분 남음</span><span>캡처 · 재배포 금지 · 열람 기록</span><span data-mk="syn" data-mk-note="시연 데이터는 합성 · 실제 학생 아님">시연 데이터</span><a href="teacher.html" style="margin-left:auto">포털 교사공간 ›</a></div>');
  }

  var _main = renderMain;
  window.renderMain = renderMain = function () { renderMain1(); navSync(); sBand(); };
  function renderMain1() {
    var m = document.getElementById('main');
    if (state === 'guest' || state === 'expired') { _main(); return; }
    if (ZONE === 'S') {
      if (!sPass()) { m.innerHTML = sGateHtml(); var g = document.getElementById('tgnb'); if (g) g.style.display = 'none'; return; }
      var g2 = document.getElementById('tgnb'); if (g2) g2.style.display = '';
      if (view === 'history') { m.innerHTML = historyHtml(); return; }
      if (view === 'prep' || view === 'stats') { view = 'home'; }
      _main(); return;
    }
    /* O존 */
    if (S_ONLY[view]) { view = 'home'; localStorage.setItem('sen-teacher-view', 'home'); }
    if (view === 'home') { m.innerHTML = oHomeHtml(); bindExtra(); return; }
    if (view === 'prep') { m.innerHTML = window.prepHtml ? prepHtml() : ''; bindExtra(); if (window.bindPrep) bindPrep(); return; }
    _main();
    if (view === 'assign') { /* 결정 17 : 비식별 게시판 답변 · 신청자 학교명도 가림 */ m.innerHTML = m.innerHTML.replace(/ · 서울[가-힣]{1,6}고\)/g, ')').replace(/\(고(\d) · [^)]*\)/g, '(고$1)'); bindExtra(); m.insertAdjacentHTML('afterbegin', '<div class="share__notice" style="margin-top:16px" data-mk="home sec1102" data-mk-note="결정 17 · 보안 검토 11-02 2-4 : 포털에서는 신청자 이름 · 학교 · 연락처를 가린 화면으로만 답변, 식별 가능 질문은 S존 상담시스템에서만">포털 배정 답변 : 신청자 이름 · 학교 · 연락처는 가려져요 · 식별 가능한 질문은 S존 상담시스템에서만 답해요</div>'); }
  }

  /* 스타일 */
  var st = document.createElement('style');
  st.textContent = '.tgnb .container + .container{border-top:1px solid var(--line)}.tsub{display:flex;gap:4px;overflow-x:auto;padding:4px 0}.tsub a{padding:10px 14px;font-size:14px;font-weight:700;border-radius:999px;border:0;color:var(--ink-2);white-space:nowrap}.tsub a.is-on{background:#EEF3FF;color:var(--navy)}'
    + '.tnet{margin-left:auto;display:inline-flex;align-items:center;gap:4px;padding:6px 0}.tnet button{min-height:34px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--bg);font-weight:800;font-size:13px;color:var(--ink-2);cursor:pointer}.tnet button.is-on{background:var(--navy);border-color:var(--navy);color:#fff}'
    + '@media (max-width:768px){.tnet{margin-left:8px}}'
    + '.zbadge{display:inline-flex;align-items:center;min-height:30px;padding:0 10px;border-radius:999px;font-weight:800;font-size:12.5px}.zbadge--o{background:#e1f5f4;color:#00676b}.zbadge--s{background:#e8eefb;color:#173a7a}.tnet small{color:var(--ink-3);font-size:12px}'
    + '.sgate{position:fixed;inset:0;z-index:90;background:rgba(10,14,28,.55);display:grid;place-items:center;padding:16px}.sgate__p{position:relative;background:var(--bg);border-radius:18px;padding:22px 22px 18px;max-width:560px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3)}.sgate__p h2{margin:0 0 8px;font-size:18px}.sgate__d{margin:0 0 12px;color:var(--ink-2);font-size:14px}.sgate__x{position:absolute;top:10px;right:10px;border:0;background:none;font-size:18px;cursor:pointer}'
    + '.sgate__o{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:1px solid var(--line);border-radius:12px;margin-bottom:8px;cursor:pointer}.sgate__o input{margin-top:4px}.sgate__o span{display:grid;gap:2px;min-width:0}.sgate__o b{font-size:14px}.sgate__o small{color:var(--ink-3);font-size:12.5px}.sgate__n{font-size:12.5px;color:var(--ink-3);margin:4px 0 12px}.sgate__a{display:flex;gap:8px;justify-content:flex-end}'
    + '.sband{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;margin-top:14px;padding:10px 14px;border-radius:12px;background:#e8eefb;color:#173a7a;font-size:13px}.sband b{font-size:14px}.sband a{font-weight:800;color:#173a7a}';
  document.head.appendChild(st);

  /* 교사 인증 : 교육디지털원패스만 + 2단계 인증 (10-30 사용자 결정 D5 · GPKI 쓰지 않음) */
  (function () { var q = new URLSearchParams(location.search).get('path'); if (ZONE === 'S' && q && !sPass()) sGrant(q); var h = location.hash.replace('#', ''); if (ZONE === 'S' && h && (NETOF[h] || h === 'class' || h === 'history')) { view = h; localStorage.setItem('sen-teacher-view', h); } if (ZONE === 'S' && h === 'rec') { location.href = 'sen-ai-poc.html?zone=S#rec'; } })();
  if (['class', 'history'].indexOf(view) < 0 && !NETOF[view]) view = 'home';
  if (ZONE === 'O' && S_ONLY[view]) view = 'home';
  renderAll();
})();
