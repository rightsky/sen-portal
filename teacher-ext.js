/* teacher-ext.js : 교사공간 6단계 (통합 적용 6단계)
   A 판정 승인(HITL) 보강 H1·H2·H4·F1 · B 비교·분석 · C 진학통계 · D 학생상담모드 M0~M5
   teacher.html 인라인 스크립트의 전역(HITL·HS·hsSave·CLASS·SHARES·state·view·showToast·authMode·confirmAdmin·hitlConfirm·renderAll)을
   렌더 시점에만 참조한다. 모든 데이터는 합성(실제 학생 아님) · 기준 시점 2027학년도 2학기(9월) */
(function(){
'use strict';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const lsGet=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v;}catch(e){return d;}};
const lsSet=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const policy=()=>lsGet('sen-ops-admin-v1',{})||{};
const twoFA=why=>(authMode()==='B'&&window.SEN_AUTH?SEN_AUTH.stepUp(why):confirmAdmin(why));
const pad=n=>String(n).padStart(2,'0');
const now=()=>{const d=new Date();return `${d.getMonth()+1}.${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;};
const teacherName=()=>(window.SEN_AUTH&&SEN_AUTH.logged()&&SEN_AUTH.name)||'박선우';
const gate=(t,p)=>`<div class="gate"><h2>${t}</h2><p>${p}</p></div>`;

/* ── 스타일 (6단계 전용 · 모바일 1열 · 터치 44px) ── */
const css=`
.xgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.xgrid--3{grid-template-columns:repeat(3,1fr)}
.xseg{display:flex;gap:6px;flex-wrap:wrap}
.xseg button{min-height:44px;padding:8px 16px;border-radius:999px;border:1.5px solid var(--line);background:var(--bg);font-weight:700;font-size:14px}
.xseg button.is-on{background:var(--t-strong);color:#fff;border-color:var(--t-strong)}
.xseg button[disabled]{opacity:.45;cursor:default}
.xb{min-height:44px;padding:10px 16px;font-size:14px}
.xbs{min-height:44px;padding:8px 14px;font-size:13.5px}
.xsel{font:inherit;font-size:14px;min-height:44px;padding:8px 12px;border:1.5px solid var(--line);border-radius:12px;background:var(--bg);color:var(--ink);width:100%}
.xta{width:100%;min-height:96px;font:inherit;font-size:13.5px;padding:10px 12px;border:1.5px solid var(--line);border-radius:12px;background:var(--bg);color:var(--ink)}
.xlab{display:block;margin-top:10px;font-size:13px;font-weight:700}
.xbar{display:flex;align-items:center;gap:8px;font-size:12.5px;margin-bottom:8px}
.xbar em{font-style:normal;flex:none;width:150px;font-weight:700}
.xbar span{flex:1;background:var(--surface-2);border-radius:999px;overflow:hidden;height:10px}
.xbar i{display:block;height:10px;border-radius:999px;background:var(--t-strong)}
.xbar b{width:28px;text-align:right;font-variant-numeric:tabular-nums}
.xchk{display:flex;gap:10px;align-items:flex-start;min-height:44px;padding:8px 10px;border:1px solid var(--line);border-radius:12px;font-size:14px;margin-bottom:6px;cursor:pointer}
.xchk input{width:20px;height:20px;margin-top:2px;flex:none}
.cmp-res{position:relative;overflow:hidden}
.cmp-res::after{content:attr(data-wm);position:absolute;left:-10%;top:42%;width:120%;text-align:center;transform:rotate(-16deg);font-size:22px;font-weight:900;color:rgba(17,19,24,.08);pointer-events:none;white-space:nowrap}
.lockband{position:sticky;top:72px;z-index:40;background:var(--navy);color:#fff;border-radius:14px;padding:12px 16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:16px;font-weight:700;font-size:14px}
.lockband .tm{font-variant-numeric:tabular-nums;background:rgba(255,255,255,.15);padding:4px 10px;border-radius:999px}
.lockband button{min-height:44px;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.16);color:#fff;font-weight:700;font-size:13.5px}
.lockband button.is-on{background:#fff;color:var(--navy)}
body.is-cmode #tgnb a:not([data-view="mode"]){pointer-events:none;opacity:.5}
body.is-cmode.is-mirror [data-teacher-only]{display:none !important}
[data-teacher-only]{border:1.5px dashed var(--t-strong)}
.xpin{position:fixed;inset:0;z-index:98;background:rgba(10,12,18,.5);display:grid;place-items:center;padding:20px}
.xpin>div{background:var(--bg);border-radius:20px;padding:28px;max-width:360px;width:100%;box-shadow:var(--shadow-2)}
.xpin h2{margin:0 0 6px;font-size:19px}
.xpin input{font:inherit;font-size:24px;letter-spacing:.4em;text-align:center;width:100%;min-height:52px;border:1.5px solid var(--line);border-radius:12px;margin:12px 0}
.xstage{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}
.xstage span{padding:6px 12px;border-radius:999px;background:var(--surface);font-size:12.5px;font-weight:700;color:var(--ink-3)}
.xstage span.is-on{background:var(--t-strong);color:#fff}
.xstage span.is-done{color:var(--ok)}
.mini-tbl{width:100%;border-collapse:collapse;font-size:13px;background:var(--bg)}
.mini-tbl th,.mini-tbl td{padding:7px 10px;border-bottom:1px solid var(--line);text-align:left;font-variant-numeric:tabular-nums}
.mini-tbl th{color:var(--ink-3);font-size:12px}
.xscroll{overflow-x:auto}
.xscroll .btable{min-width:520px}
@media (max-width:1000px){.xgrid,.xgrid--3{grid-template-columns:1fr}.lockband{top:0;border-radius:0;margin:0 -16px}.xbar em{width:110px}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* ═══════════ A. 판정 승인(HITL) : H1 세션 · H2 항목 검토 · H4 후속·인계 · F1 플라이휠 ═══════════ */
const SESS=[
 {id:'S-2027-0905-01',at:'2027.9.5 09:12',items:['h1','h2','h3','h4'],src:'수시 판정 생성'},
 {id:'S-2027-0904-02',at:'2027.9.4 16:40',items:['h5'],src:'수시 판정 생성 (겸직 제한 건)'},
 {id:'S-2027-0828-01',at:'2027.8.28 10:05',items:[],fixed:{stu:'최민준',n:1,st:'확정 · 전달 완료 (8.30)'},src:'학업 설계 판정'}];
const REASONS={R1:'근거 자료 오류 · RAG 품질',R2:'환산식 · 기준표',R3:'학생 사정 반영 (학습 제외)',R4:'표현 · 문구',R5:'기타 (수동 분류)'};
const LABELS=['안정','적정','소신','상향','보류'];
const LOGK='sen-hitl-log-v1';
let hSess=null,hEdit=null;
function hlog(t){const L=lsGet(LOGK,[]);L.unshift({at:now(),who:teacherName(),t});lsSet(LOGK,L.slice(0,30));}
const hById=id=>HITL.find(h=>h.id===id);
const curLabel=h=>HS[h.id+'_to']||h.draft;
function sessState(s){if(s.fixed)return {t:s.fixed.st,c:'badge--ok'};const sts=s.items.map(i=>HS[i]);if(sts.some(x=>x==='sec'))return {t:'2차 검토 대기',c:'badge--wait'};if(sts.every(x=>x&&x!=='more'))return {t:'확정',c:'badge--ok'};return {t:'검토 중',c:'badge--wait'};}
const stBadge=(id)=>{const s=HS[id];const map={ok:['승인 · 확정','badge--ok'],edit:['수정 후 승인 · 확정','badge--ok'],sec:['수정 후 승인 · 2차 검토 대기','badge--wait'],no:['반려 · 초안 폐기','badge--warn'],more:['근거 보강 요청 · 재생성 대기','badge--wait']};const m=map[s];return m?`<span class="badge ${m[1]}">${m[0]}</span>`:'<span class="badge badge--gray">검토 전</span>';};
window.hitlEditOpen=function(id){hEdit=id;hSess=(SESS.find(s=>s.items.includes(id))||{}).id||null;renderAll();const el=document.getElementById('h2');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});};
/* H0·H3 카드에 덧붙는 조각 : 교사 수정 라벨 · 2차 검토 플래그 · 비교·분석 근거 칩 */
window.hitlCardExtra=function(h){const id=h.id;let out='';const to=HS[id+'_to'];const changed=!!to&&to!==h.draft;
 if(HS[id]==='edit'||HS[id]==='sec'){out+='<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;align-items:center">';
  if(to)out+=`<span class="badge badge--teach">교사 수정 「${to}」 · 사유 ${HS[id+'_r']||'R5'}</span>`;
  if(changed)out+=HS[id]==='sec'?'<span class="badge badge--warn">방향이 AI와 다름 · 진학부장 2차 검토 필수</span>':'<span class="badge badge--wait">방향이 AI와 다름 · 2차 검토 플래그</span>';
  if(HS[id]==='sec')out+=state==='head'?`<button class="btn btn--primary xbs" data-hsec="${id}">2차 검토 승인</button>`:'<span style="font-size:12.5px;color:var(--ink-3)">진학부장 승인 뒤 확정·전달</span>';
  out+='</div>';}
 const ev=HS[id+'_ev'];if(Array.isArray(ev)&&ev.length)out+=`<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">${ev.map(e=>`<span class="badge badge--teach">비교·분석 · ${esc(e)}</span>`).join('')}</div>`;
 return out;};
function h1Html(){
 const rows=SESS.map(s=>{const ss=sessState(s);const n=s.fixed?s.fixed.n:s.items.length;const stus=s.fixed?1:new Set(s.items.map(i=>hById(i).stu)).size;
  return `<tr${hSess===s.id?' style="background:var(--t-soft)"':''}><td><button class="xbs" style="font-weight:800;color:var(--brand);padding-left:0;text-align:left" data-hsess="${s.id}" aria-label="세션 ${s.id} 항목 검토 열기">${s.id}</button></td><td>${s.at}</td><td>${stus}명</td><td>${n}건</td><td>v2.1</td><td><span class="badge ${ss.c}">${ss.t}</span></td></tr>`;}).join('');
 return `<h3 id="h1" style="margin:22px 0 8px;font-size:15px">H1 · 판정 세션 목록 <small style="color:var(--ink-3)">전문시스템에서 생성된 판정 묶음</small></h3>
 <div class="xscroll"><table class="btable"><tr><th>세션 ID</th><th>생성 일시</th><th>학생 수</th><th>항목 수</th><th>기준표 원장</th><th>상태</th></tr>${rows}</table></div>
 <p class="caption">세션 ID를 누르면 H2에서 항목별로 검토해요 · 세션은 전문시스템이 만들고, 포털은 승인 상태만 돌려보내요</p>`;}
function editorHtml(h){const cur=curLabel(h);const sec=(policy().hitl||{})[3]===true;
 return `<div style="margin-top:12px;padding:14px;border:1.5px solid var(--t-strong);border-radius:14px;background:var(--t-soft)" data-heditor="${h.id}">
 <b style="font-size:14px">수정 후 승인 · 편집</b>
 <p class="caption" style="margin:4px 0 10px">판정 라벨을 바꾸면 「방향이 AI와 다름」으로 표시되고, 플랫폼관리 정책에 따라 진학부장 2차 검토가 ${sec?'<b>필수</b>':'플래그(필수 아님)'}예요 · 저장 시 2단계 인증(10분 유지)</p>
 <div class="xseg" role="radiogroup" aria-label="판정 라벨">${LABELS.map(l=>`<button type="button" role="radio" aria-checked="${l===cur}" class="${l===cur?'is-on':''}" data-hlab="${l}">${l}</button>`).join('')}</div>
 <label class="xlab">수정 사유<select class="xsel" data-hreason>${Object.entries(REASONS).map(([k,v])=>`<option value="${k}"${HS[h.id+'_r']===k?' selected':''}>${k} · ${v}</option>`).join('')}</select></label>
 <label class="xlab">교사 메모 (학생에게는 가지 않아요)<textarea class="xta" data-hmemo placeholder="예: 9월 학평 반영 뒤 다시 보기">${esc(HS[h.id+'_m']||'')}</textarea></label>
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn btn--primary xb" data-hsave="${h.id}">저장 · 승인</button><button class="btn btn--line xb" data-hcancel>닫기</button></div></div>`;}
function h2Html(){if(!hSess)hSess=(SESS.find(x=>x.items.some(i=>HS[i]==='sec'))||SESS[0]).id;const s=SESS.find(x=>x.id===hSess);let body;
 if(!s)body='<p class="caption">H1에서 세션을 고르거나, H0에서 「수정 후 승인」을 누르면 여기에 항목이 열려요</p>';
 else if(s.fixed)body=`<p class="caption">${s.fixed.stu} · ${s.fixed.st} · 전달된 항목의 후속은 H4에서 봐요</p>`;
 else body=s.items.map(id=>{const h=hById(id);const st=HS[id];
  const act=h.mine?'<span class="badge badge--gray">본인 자녀 건 · 겸직 제한 · 진학부장 대리</span>':st?stBadge(id):`<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn--primary xbs" data-hitl="ok" data-id="${id}">승인</button><button class="btn btn--line xbs" data-hedit="${id}">수정 후 승인</button></div>`;
  return `<div class="card" style="padding:16px 18px"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><div><b>${h.stu}</b> · ${h.uni}<div style="margin-top:4px;font-size:12.5px;color:var(--ink-3)">AI 초안 「${h.draft}」 · 근거 ${h.ev.length} · ${h.gate}</div></div>${act}</div>${hitlCardExtra(h)}${hEdit===id?editorHtml(h):''}</div>`;}).join('');
 return `<h3 id="h2" style="margin:22px 0 8px;font-size:15px">H2 · 판정 항목 검토 ${s?`<small style="color:var(--ink-3)">${s.id} · ${s.src}</small>`:''}</h3><div style="display:grid;gap:10px">${body}</div>`;}
function h4Html(){const del=HITL.filter(h=>HS[h.id+'_d']);const L=lsGet(LOGK,[]);
 const rows=del.map(h=>`<tr><td><b>${h.stu}</b><br><small style="color:var(--ink-3)">${h.uni}</small></td><td><span class="badge badge--ok">[선생님 의견] 「${curLabel(h)}」</span></td><td><input type="date" class="xsel" style="width:auto;min-width:150px" value="${HS[h.id+'_f']||''}" data-hfollow="${h.id}" aria-label="${h.stu} 상담 예정일"></td><td>열람 9.7</td><td style="color:var(--ok);font-weight:700">✓ 기록</td></tr>`).join('');
 return `<h3 id="h4" style="margin:22px 0 8px;font-size:15px">H4 · 후속·인계</h3>
 <div class="xgrid">
  <div class="card" style="padding:18px 20px"><h2 style="font-size:16px">전달된 판정 후속 <small style="color:var(--ink-3);font-weight:700">${del.length}건</small></h2><p class="sub">전달 뒤에는 상담 예정일 등록 → 학생 열람 → 상담 원장 기록 순으로 챙겨요</p>${del.length?`<div class="xscroll"><table class="btable"><tr><th>학생</th><th>전달 내용</th><th>상담 예정일</th><th>학생 열람</th><th>상담 원장</th></tr>${rows}</table></div>`:'<p class="caption">H3에서 「학생에게 전달」을 체크하면 여기에 쌓여요</p>'}</div>
  <div class="card" style="padding:18px 20px"><h2 style="font-size:16px">인계</h2><p class="sub">담임 교체 시 전임 선생님은 14일간 읽기 전용 · 전달된 판정과 후속 기록은 그대로 후임에게 넘어가요</p>
   <div class="share__notice">인계 요청 → 2단계 인증 → 학교관리자 확인 → 후임 담임 매핑 · 전 과정 감사로그</div>
   <button class="btn btn--primary xb" data-hhand>인계 요청</button>
   <h3 style="margin:14px 0 6px;font-size:14px">감사로그 <small style="color:var(--ink-3)">HITL · 최근 ${Math.min(L.length,8)}건</small></h3>
   ${L.length?`<table class="audit">${L.slice(0,8).map(l=>`<tr><td>${l.at}</td><td><b>${esc(l.who)}</b></td><td>${esc(l.t)}</td></tr>`).join('')}</table>`:'<p class="caption">아직 기록이 없어요</p>'}</div></div>`;}
function f1Html(){const cnt={ok:0,edit:0,no:0,more:0};HITL.forEach(h=>{const s=HS[h.id];if(s==='sec')cnt.edit++;else if(cnt[s]!=null)cnt[s]++;});
 const rs={R1:0,R2:0,R3:0,R4:0,R5:0};HITL.forEach(h=>{const r=HS[h.id+'_r'];if(r&&rs[r]!=null)rs[r]++;});const rmax=Math.max(1,...Object.values(rs));
 const kp=(l,v,d)=>`<div class="kpi"><span>${l}</span><b>${v}건</b><span class="d">${d}</span></div>`;
 const loops=[['L1 즉시','승인·수정·반려가 바로 근거 품질 신호로'],['L2 전달 후','학생 열람·상담 원장 기록으로 쓰임새 확인'],['L3 실제 합불 매칭','12월 이후 · 판정과 결과 대조'],['L4 골든셋 승격','정보원이 검증한 사례만 기준 세트로']];
 return `<h3 id="f1" style="margin:22px 0 8px;font-size:15px">F1 · 플라이휠 현황 <span class="badge badge--gray">읽기 전용 · 이번 달</span></h3>
 <div class="kpis">${kp('승인',cnt.ok,'그대로 확정')}${kp('수정 후 승인',cnt.edit,'라벨·근거 교정')}${kp('반려',cnt.no,'초안 폐기')}${kp('근거 보강',cnt.more,'AI 재생성 큐')}</div>
 <div class="xgrid" style="margin-top:14px">
  <div class="card"><h2 style="font-size:16px">수정 사유 분포</h2><p class="sub">R1~R5 · 내 반 기여분</p>${Object.entries(REASONS).map(([k,v])=>`<div class="xbar"><em>${k} ${v}</em><span><i style="width:${rs[k]/rmax*100}%"></i></span><b>${rs[k]}</b></div>`).join('')}</div>
  <div class="card"><h2 style="font-size:16px">4루프</h2><p class="sub">선생님의 판단이 다음 초안을 어떻게 바꾸는지</p><ul class="rules" style="margin:0">${loops.map(([a,b])=>`<li><b>${a}</b> · ${b}</li>`).join('')}</ul></div></div>
 <p class="caption">라벨은 AI 서비스 관리(정보원)에서 학습 데이터로 집계 · 선생님 화면에서는 내 반 기여만</p>`;}
window.hitlExtMid=()=>h1Html()+h2Html();
window.hitlExtTail=()=>h4Html()+f1Html();
function bindHitl(){
 document.querySelectorAll('[data-hsess]').forEach(b=>b.addEventListener('click',()=>{hSess=b.dataset.hsess;hEdit=null;renderAll();const el=document.getElementById('h2');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}));
 document.querySelectorAll('[data-hedit]').forEach(b=>b.addEventListener('click',()=>hitlEditOpen(b.dataset.hedit)));
 document.querySelectorAll('[data-hlab]').forEach(b=>b.addEventListener('click',()=>{b.parentElement.querySelectorAll('[data-hlab]').forEach(x=>{x.classList.toggle('is-on',x===b);x.setAttribute('aria-checked',x===b);});}));
 document.querySelectorAll('[data-hcancel]').forEach(b=>b.addEventListener('click',()=>{hEdit=null;renderAll();}));
 document.querySelectorAll('[data-hsave]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.hsave,h=hById(id);const box=b.closest('[data-heditor]');const lab=(box.querySelector('[data-hlab].is-on')||{}).dataset?.hlab||h.draft;const r=box.querySelector('[data-hreason]').value;const memo=box.querySelector('[data-hmemo]').value.trim();
  hitlConfirm().then(()=>{const changed=lab!==h.draft;const sec=changed&&(policy().hitl||{})[3]===true;HS[id]=sec?'sec':'edit';HS[id+'_r']=r;HS[id+'_to']=lab;HS[id+'_m']=memo;HS[id+'_chg']=changed;hsSave();hlog(`${h.stu} 판정 수정 후 승인 · 「${h.draft}」→「${lab}」 · 사유 ${r}${sec?' · 진학부장 2차 검토 요청':''}`);hEdit=null;showToast(sec?'저장했어요 · 방향이 AI와 달라 진학부장 2차 검토로 넘어가요':changed?'수정 후 승인 · 2차 검토 플래그와 함께 확정':'수정 후 승인 · 수정 이력과 함께 확정');renderAll();});}));
 document.querySelectorAll('[data-hsec]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.hsec;twoFA('진학부장 2차 검토 승인').then(()=>{HS[id]='edit';hsSave();hlog(`${hById(id).stu} 2차 검토 승인 (진학부장)`);showToast('2차 검토 승인 · 확정 · 전달은 H3에서');renderAll();});}));
 document.querySelectorAll('[data-hfollow]').forEach(i=>i.addEventListener('change',()=>{HS[i.dataset.hfollow+'_f']=i.value;hsSave();showToast(i.value?'상담 예정일을 등록했어요 · 학생 알림 · 상담 원장 기록':'상담 예정일을 지웠어요');}));
 document.querySelectorAll('[data-deliver]').forEach(c=>c.addEventListener('change',()=>renderAll()));
 document.querySelectorAll('[data-hhand]').forEach(b=>b.addEventListener('click',()=>twoFA('담임 인계 요청').then(()=>{hlog('인계 요청 · 3학년 2반 → 후임 담임 매핑 대기 · 전임 14일 읽기 전용');showToast('인계 요청을 보냈어요 · 학교관리자 확인 후 후임 매핑 · 감사로그 기록');renderAll();})));}

/* ═══════════ 공통 바인딩 ═══════════ */
window.bindExt=function(){bindHitl();if(window.bindCompare)bindCompare();if(window.bindStats)bindStats();if(window.bindMode)bindMode();};
})();
