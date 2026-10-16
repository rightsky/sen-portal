/* 개인정보 보호 : 포털 화면에 입력한 내용을 브라우저에 오래 남기지 않는다 (2026-10-16)
   외부 위원이 실제 개인정보·민감정보를 입력할 수 있으므로, 모든 화면의 시연 상태(상담 채팅·학업설계·
   성적·관심 대학·교사공간·업무시스템 등)를 localStorage 대신 sessionStorage에 둔다.

   - 같은 탭에서 화면을 옮겨 다니는 동안에는 상태가 이어진다.
   - 탭이나 브라우저를 닫으면 모두 지워진다.
   - 브라우저의 「이전 탭 복원」으로 되살아나는 경우에 대비해, 마지막 사용 후 30분이 지나면 열 때 지운다.
   - 예전 버전이 localStorage에 남긴 기록은 화면을 열 때 지운다.
   - 화면 테마(밝게/어둡게)와 AI 중계 서버 주소만 개인정보가 아니므로 계속 기억한다.

   이 파일은 각 화면 <head>의 맨 앞에서, 다른 스크립트보다 먼저 읽혀야 한다. */
(function () {
  var KEEP = { 'sen-theme': 1, 'sen-ai-endpoint': 1 };
  var IDLE_MS = 30 * 60 * 1000;
  var SEEN = '__sen-last-active';
  var P = Storage.prototype;
  var get = P.getItem, set = P.setItem, del = P.removeItem, key = P.key;
  var L, S;
  try { L = window.localStorage; S = window.sessionStorage; } catch (e) { return; }
  if (!L || !S) return;

  function personal(k) { return !KEEP[String(k)]; }

  // 1) 예전 버전이 localStorage에 남긴 기록 지우기 (sen-로 시작하는 것, 테마·서버 주소 제외)
  try {
    var old = [];
    for (var i = 0; i < L.length; i++) { var k = key.call(L, i); if (k && k.indexOf('sen-') === 0 && personal(k)) old.push(k); }
    old.forEach(function (k) { del.call(L, k); });
  } catch (e) {}

  // 2) 오래 쓰지 않은 세션(탭 복원 등)은 열 때 지우기
  function wipe() {
    try {
      var ks = [];
      for (var i = 0; i < S.length; i++) { var k = key.call(S, i); if (k && (k.indexOf('sen-') === 0 || k === SEEN)) ks.push(k); }
      ks.forEach(function (k) { del.call(S, k); });
    } catch (e) {}
  }
  try {
    var last = Number(get.call(S, SEEN) || 0);
    if (last && Date.now() - last > IDLE_MS) wipe();
  } catch (e) {}
  function touch() { try { set.call(S, SEEN, String(Date.now())); } catch (e) {} }
  touch();
  setInterval(touch, 60 * 1000);
  addEventListener('pagehide', touch);

  // 3) 이후 localStorage 읽기·쓰기를 sessionStorage로 돌리기
  P.getItem = function (k) { return get.call(this === L && personal(k) ? S : this, k); };
  P.setItem = function (k, v) { return set.call(this === L && personal(k) ? S : this, k, v); };
  P.removeItem = function (k) { return del.call(this === L && personal(k) ? S : this, k); };

  // 화면에서 「내 입력 모두 지우기」를 만들 때 쓸 수 있게 공개
  window.SEN_PRIVACY = { wipe: function () { wipe(); touch(); }, idleMinutes: IDLE_MS / 60000 };
})();
