/* 설계 검토 표시 (2026-10-30, 실무 의견 반영 1단계)
   [6open]  2027년 6월 1차 개방형 오픈에 들어가는 화면·기능
   [up1030] 2026-10-30 실무 의견 검토로 바뀌거나 새로 생긴 곳 (마우스를 올리면 근거)
   [school] 학교 업무망에서만 되는 교사 기능 (학생 단위 성적·학생부·상담·판정)
   [home]   집 인터넷에서도 되는 상담 준비 기능 (학생 개인정보 없음, 장표 5.3의 24개 업무)

   쓰는 법
   - HTML : <h2 data-mk="6open up1030" data-mk-note="결정 7 · R04 R06">…</h2>
   - JS   : SENMarks.add(요소 또는 선택자, ['up1030'], '근거')
   - 화면 단위 표시는 아래 PAGES 표에서 정한다.
   상단 띠의 「표시 끄기」로 모든 표시를 숨긴다(이 브라우저 탭에서만 기억). */
(function () {
  if (window.SENMarks) return;
  var KINDS = {
    '6open':  { t: '6open',  d: '2027.6 1차 개방형 오픈 범위' },
    'up1030': { t: 'up1030', d: '10-30 실무 의견 검토로 바뀐 곳' },
    'school': { t: 'school', d: '학교 업무망에서만 (학생 단위 정보)' },
    'home':   { t: 'home',   d: '집 인터넷에서도 가능 (학생 개인정보 없음)' }
  };
  /* 화면 단위 표시 : 6open = 1차 개방형 포함 화면, 그 밖은 2차(S존 개통 후) */
  var PAGES = {
    'index.html':          { m: ['6open', 'up1030'], n: '1차는 비로그인 메인. 로그인 뒤 역할별 화면은 2차' },
    'jinro-test.html':     { m: ['6open'], n: '검사 안내·외부 연결은 1차, 결과 저장은 2차' },
    'jinro-trait.html':    { m: ['6open'] }, 'jinro-job.html': { m: ['6open'] }, 'jinro-major.html': { m: ['6open'] },
    'jinro-change.html':   { m: ['6open'] },
    'school-explore.html': { m: ['6open'], n: '공개 편제 탐색은 1차' },
    'subject-explore.html':{ m: ['6open'], n: '과목 탐색은 1차, 학업설계 저장은 2차' },
    'univ.html':           { m: ['6open'], n: '대학·전형·입결(공개데이터)은 1차' },
    'news.html':           { m: ['6open'] }, 'library.html': { m: ['6open'] },
    'counsel.html':        { m: ['6open', 'up1030'], n: '1차는 상담 안내·기존 상담 사이트 연결, 신청·예약은 2차' },
    'parent.html':         { m: ['6open', 'up1030'], n: '1차는 학부모 가이드, 자녀 연결·열람은 2차' },
    'sen-ai-poc.html':     { m: ['6open', 'up1030'], n: '1차는 공개 요강 질문하기(O등급 문서)만, 학생부 분석은 2차' },
    'strategy.html':       { m: ['up1030'], n: '2차 화면. 공개 입시결과 조회만 1차 후보' },
    'my.html':             { m: ['up1030'], n: '2차 화면(로그인 필요)' },
    'study-plan.html':     { m: [], n: '2차 화면(학업설계 저장)' },
    'teacher.html':        { m: ['up1030'], n: '2차 화면. 학교 모드/집 모드로 나뉨' },
    'cns.html':            { m: ['school', 'up1030'], n: '2차 화면. 학생 단위 정보라 학교 업무망 전용' },
    'ops-counsel.html':    { m: ['up1030'], n: '업무시스템(정보원 업무망), 2차' },
    'ops-ai.html':         { m: [], n: '업무시스템(정보원 업무망), 2차' },
    'ops-admin.html':      { m: [], n: '업무시스템(정보원 업무망), 2차' }
  };
  var page = (location.pathname.split('/').pop() || 'index.html');
  var isOps = /^ops-/.test(page);
  var OFF_KEY = 'sen-marks-off';
  var off = false;
  try { off = sessionStorage.getItem(OFF_KEY) === '1'; } catch (e) {}

  var css = ''
    + '.mk{display:inline-flex;align-items:center;gap:3px;margin:0 0 0 6px;padding:1px 7px;border-radius:999px;font:800 10.5px/1.6 system-ui,-apple-system,"Pretendard","Noto Sans KR",sans-serif;letter-spacing:.01em;vertical-align:middle;white-space:nowrap;border:1px solid;cursor:help;text-transform:none}'
    + '.mk::before{content:"[";opacity:.55}.mk::after{content:"]";opacity:.55}'
    + '.mk--6open{color:#0b6b3a;background:#e6f6ec;border-color:#9fd8b5}'
    + '.mk--up1030{color:#9a4a00;background:#fff1e0;border-color:#f3c088}'
    + '.mk--school{color:#173a7a;background:#e8eefb;border-color:#a9bde8}'
    + '.mk--home{color:#00676b;background:#e1f5f4;border-color:#93d3d0}'
    + 'html.mk-off .mk,html.mk-off .mkbar{display:none!important}'
    + '.mkbar{position:relative;z-index:60;display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;padding:6px 16px;background:#fbfaf6;border-bottom:1px dashed #d9d4c4;font:600 12px/1.5 system-ui,-apple-system,"Pretendard","Noto Sans KR",sans-serif;color:#5b5648}'
    + '.mkbar b{color:#3a362c}.mkbar .mk{margin:0}.mkbar__legend{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center}'
    + '.mkbar__legend span.l{display:inline-flex;align-items:center;gap:4px}'
    + '.mkbar button{margin-left:auto;min-height:28px;padding:0 10px;border-radius:8px;border:1px solid #d9d4c4;background:#fff;color:#3a362c;font:700 12px/1 inherit;cursor:pointer}'
    + '.mkon{position:fixed;left:12px;bottom:12px;z-index:90;display:none;min-height:32px;padding:0 12px;border-radius:999px;border:1px solid #d9d4c4;background:#fff;color:#5b5648;font:700 12px/1 system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.12);cursor:pointer}'
    + 'html.mk-off .mkon{display:inline-flex;align-items:center}'
    + '@media (max-width:768px){.mkon{bottom:84px}.mkbar{padding:5px 12px;gap:4px 8px;font-size:11.5px}.mkbar__legend,.mkbar .d{display:none}.mkbar>b{display:none}.mkbar button{min-height:26px;padding:0 8px}}'
    + '@media (prefers-color-scheme:dark){html:not([data-theme="light"]) .mkbar{background:#22211d;color:#c9c4b4;border-color:#4a463b}html:not([data-theme="light"]) .mkbar b{color:#efe9d8}html:not([data-theme="light"]) .mkbar button,html:not([data-theme="light"]) .mkon{background:#2c2a25;color:#efe9d8;border-color:#4a463b}}';

  function chip(k, note) {
    var K = KINDS[k]; if (!K) return null;
    var s = document.createElement('span');
    s.className = 'mk mk--' + k; s.textContent = K.t;
    s.title = K.d + (note ? ' · ' + note : '');
    s.setAttribute('aria-label', '표시 ' + K.t + ' : ' + s.title);
    s.setAttribute('data-mk-chip', k);
    return s;
  }
  function decorate(el, kinds, note) {
    if (!el || !kinds || !kinds.length) return;
    kinds.forEach(function (k) {
      if (el.querySelector(':scope > [data-mk-chip="' + k + '"]')) return;
      var c = chip(k, note); if (c) el.appendChild(c);
    });
  }
  var REG = [];
  function scan(root) {
    root = root || document;
    var list = root.querySelectorAll ? root.querySelectorAll('[data-mk]') : [];
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      decorate(el, (el.getAttribute('data-mk') || '').split(/\s+/).filter(Boolean), el.getAttribute('data-mk-note'));
    }
    REG.forEach(function (r) {
      var els = typeof r.sel === 'string' ? document.querySelectorAll(r.sel) : [r.sel];
      for (var j = 0; j < els.length; j++) decorate(els[j], r.kinds, r.note);
    });
  }

  /* 용어 사전 치환 : 화면 글자만 바꾸고 입력칸·코드·스크립트는 건드리지 않는다 */
  var TERMS = (window.SEN_TERMS || []).slice().sort(function (a, b) { return b[0].length - a[0].length; });
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, CODE: 1, PRE: 1, NOSCRIPT: 1, OPTION: 0 };
  function termsWalk(root) {
    if (isOps || !TERMS.length || !root) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        while (p && p !== document.body) {
          if (SKIP[p.nodeName] || (p.hasAttribute && (p.hasAttribute('data-terms-off') || p.isContentEditable))) return NodeFilter.FILTER_REJECT;
          p = p.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n, todo = [];
    while ((n = w.nextNode())) todo.push(n);
    todo.forEach(function (t) {
      var v = t.nodeValue, o = v;
      for (var i = 0; i < TERMS.length; i++) if (v.indexOf(TERMS[i][0]) > -1) v = v.split(TERMS[i][0]).join(TERMS[i][1]);
      if (v !== o) t.nodeValue = v;
    });
    /* 버튼·링크의 title·aria-label도 함께 */
    var attrs = root.querySelectorAll ? root.querySelectorAll('[title],[aria-label],[placeholder]') : [];
    for (var a = 0; a < attrs.length; a++) {
      ['title', 'aria-label', 'placeholder'].forEach(function (an) {
        var el = attrs[a], v = el.getAttribute(an); if (!v || el.hasAttribute('data-mk-chip')) return;
        var o = v; for (var i = 0; i < TERMS.length; i++) if (v.indexOf(TERMS[i][0]) > -1) v = v.split(TERMS[i][0]).join(TERMS[i][1]);
        if (v !== o) el.setAttribute(an, v);
      });
    }
    if (document.title) { var dt = document.title, od = dt; for (var k = 0; k < TERMS.length; k++) dt = dt.split(TERMS[k][0]).join(TERMS[k][1]); if (dt !== od) document.title = dt; }
  }

  function bar() {
    if (document.querySelector('.mkbar')) return;
    var P = PAGES[page] || { m: [], n: '' };
    var b = document.createElement('div'); b.className = 'mkbar'; b.setAttribute('role', 'note');
    var legend = Object.keys(KINDS).map(function (k) { return '<span class="l"><span class="mk mk--' + k + '">' + KINDS[k].t + '</span><span class="d">' + KINDS[k].d + '</span></span>'; }).join('');
    var here = P.m.length ? P.m.map(function (k) { return '<span class="mk mk--' + k + '" title="' + KINDS[k].d + '">' + KINDS[k].t + '</span>'; }).join(' ') : '<span>2차(S존 개통 후)</span>';
    b.innerHTML = '<b>설계 검토 표시</b><span>이 화면 : ' + here + (P.n ? ' <span class="d">· ' + P.n + '</span>' : '') + '</span>'
      + '<span class="mkbar__legend">' + legend + '</span><button type="button" data-mk-toggle>표시 끄기</button>';
    document.body.insertBefore(b, document.body.firstChild);
    var on = document.createElement('button'); on.type = 'button'; on.className = 'mkon'; on.textContent = '검토 표시 켜기'; on.setAttribute('data-mk-toggle', '');
    document.body.appendChild(on);
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-mk-toggle]'); if (!t) return;
      off = !document.documentElement.classList.contains('mk-off');
      document.documentElement.classList.toggle('mk-off', off);
      try { sessionStorage.setItem(OFF_KEY, off ? '1' : '0'); } catch (er) {}
    });
  }

  var queued = false;
  function run() { queued = false; scan(document); termsWalk(document.body); }
  function queue() { if (!queued) { queued = true; setTimeout(run, 60); } }

  window.SENMarks = {
    kinds: KINDS,
    add: function (sel, kinds, note) { REG.push({ sel: sel, kinds: kinds, note: note }); queue(); },
    refresh: queue,
    terms: function (s) { s = String(s); for (var i = 0; i < TERMS.length; i++) s = s.split(TERMS[i][0]).join(TERMS[i][1]); return s; }
  };

  function init() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    if (off) document.documentElement.classList.add('mk-off');
    bar(); run();
    var mo = new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) {
        var t = ms[i].target;
        if (t && t.nodeType === 1 && t.hasAttribute && t.hasAttribute('data-mk-chip')) continue;
        queue(); return;
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
