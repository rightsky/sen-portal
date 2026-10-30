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
const teacherName=()=>(window.SEN_AUTH&&SEN_AUTH.logged()&&SEN_AUTH.name)||'김민정';
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

/* ═══════════ B. 비교·분석 : 열람 목적 → 슬롯 A·B·배경 → 비교표 → HITL 근거 칩 · 워터마크 ═══════════ */
const CK='sen-compare-v1';
let CS=Object.assign({purpose:null,a:'s:강지우',b:'u:국민대',bg:'dist',target:''},lsGet(CK,{}));
const csSave=()=>lsSet(CK,CS);
const PURPOSE={prep:'상담 준비',ev:'판정 근거',cls:'학급 지도'};
/* 학생 (우리 반 7명 · CLASS 보강) · 등급대는 bn(막대용)으로만 쓰고 숫자는 화면에 내지 않음 */
const STU_X={강지우:{bn:2.3,min:'충족 가능성 보통 (2합 5)',act:3},김서연:{bn:3.2,min:'해당 없음 (최저 없는 전형 위주)',act:2},박서준:{bn:2.1,min:'충족 가능성 낮음 (2합 5) · 점검',act:2},윤태양:{bn:4.1,min:'점검 필요 (지원계획 미작성)',act:1},이하은:{bn:1.4,min:'충족 가능성 높음 (3합 6)',act:4},정우진:{bn:3.3,min:'점검 필요 (적재 오류)',act:1},최민준:{bn:2.2,min:'충족 가능성 높음 (2합 4)',act:3}};
const UNIS=[
 {k:'한국대',t:'한국대 · 학생부종합',band:'1~2등급대',bn:1.8,min:'최저 없음',act:2,actT:'전공 연계 활동 2건 이상 권장',req:'권장과목 : 미적분Ⅱ · 확률과 통계',judge:'김하늘 적정 (겸직 제한 건)'},
 {k:'국민대',t:'국민대 · 학생부종합(학교생활우수자)',band:'2등급대 중앙',bn:2.3,min:'최저 없음',act:3,actT:'전공 연계 활동 3건 안팎',req:'권장과목 : 사회와 문화 · 확률과 통계',judge:'강지우 AI 초안 「적정」'},
 {k:'한강대',t:'한강대 · 학생부교과',band:'전년 70%컷 1.9',bn:1.9,min:'2합 5',act:0,actT:'비교과 미반영',req:'권장과목 : 미적분Ⅱ',judge:'박서준 AI 초안 「소신」'},
 {k:'서울미래대',t:'서울미래대 · 논술',band:'논술 상위 15% 수준',bn:2.5,min:'3합 6',act:2,actT:'논술 모의 2회 이상',req:'해당 없음',judge:'이하은 AI 초안 「안정」'},
 {k:'서울과기대',t:'서울과기대 · 정시(수능위주)',band:'환산점 v2.1 기준',bn:2.4,min:'해당 없음 (수능 100%)',act:0,actT:'비교과 미반영',req:'해당 없음',judge:'정우진 AI 초안 「보류」'}];
const BGS={dist:{t:'3개년 합격자 분포 (합성 · 순도 0.6)',band:'2등급대 중앙',bn:2.2,min:'전형별 상이',act:2.6,actT:'평균 2.6건',req:'평균 4/5',judge:'해당 없음'},
 cut:{t:'전년 70%컷 (합성)',band:'1.9~2.4 등급대',bn:2.1,min:'전형별 상이',act:2.2,actT:'평균 2.2건',req:'평균 4/5',judge:'해당 없음'},
 cls:{t:'우리 반 평균 (등급대)',band:'2등급대 후반',bn:2.6,min:'미달 우려 2명 · 점검 2명',act:2.3,actT:'평균 2.3건',req:'평균 4/5',judge:'대기 4 · 확정 1'}};
function slotObj(v){if(!v)return null;const [k,n]=v.split(':');
 if(k==='s'){const c=CLASS.find(x=>x.n===n),x=STU_X[n];if(!c)return null;return {label:`학생 ${n}`,band:c.band,bn:x.bn,min:x.min,act:x.act,actT:`${x.act}건`,req:c.plan,judge:c.judge};}
 const u=UNIS.find(x=>x.k===n);if(!u)return null;return Object.assign({label:u.t},u);}
function slotSel(name,val){return `<select class="xsel" data-cslot="${name}" aria-label="슬롯 ${name.toUpperCase()}"><optgroup label="학생 (우리 반)">${CLASS.map(c=>`<option value="s:${c.n}"${val==='s:'+c.n?' selected':''}>${c.n} · ${c.band}</option>`).join('')}</optgroup><optgroup label="대학 · 전형 (가상)">${UNIS.map(u=>`<option value="u:${u.k}"${val==='u:'+u.k?' selected':''}>${u.t}</option>`).join('')}</optgroup></select>`;}
const bar=(v,max,inv)=>{const w=Math.max(4,Math.min(100,(inv?(max-v)/max:v/max)*100));return `<span style="display:block;height:10px;background:var(--surface-2);border-radius:999px;overflow:hidden;margin-top:4px"><i style="display:block;height:10px;width:${w}%;border-radius:999px;background:var(--t-strong)"></i></span>`;};
window.compareHtml=function(){
 if(state==='counselor')return gate('비교·분석은 학교 교사 역할에서만','상담교사 역할은 배정 건만 열람해요. 헤더에서 교사 역할로 전환하세요.');
 const ro=state==='subject';const A=slotObj(CS.a),B=slotObj(CS.b),G=BGS[CS.bg]||BGS.dist;
 const head=`<section class="section"><h2 class="t">비교·분석 <span class="badge badge--teach">${ro?'과목교사 · 읽기 전용':state==='head'?'진학부장 · 학년':state==='schooladmin'?'학교관리자':'담임 반 한정'}</span></h2><p class="s">학생·대학·전형을 슬롯 A·B에 놓고 배경(분포·컷·반 평균)과 나란히 봐요 · 확률 숫자는 없고, 결과는 판정 승인의 근거 칩으로만 보내요</p>
 <div class="share__notice">열람 목적은 감사로그와 학생의 「내 정보를 본 기록」에 남아요 · 화면에는 워터마크가 들어가요</div>
 <h3 style="margin:16px 0 8px;font-size:15px">① 열람 목적 <small style="color:var(--ink-3)">먼저 골라야 결과가 열려요</small></h3>
 <div class="xseg" role="radiogroup" aria-label="열람 목적">${Object.entries(PURPOSE).map(([k,v])=>`<button type="button" role="radio" aria-checked="${CS.purpose===k}" class="${CS.purpose===k?'is-on':''}" data-cpurpose="${k}">${v}</button>`).join('')}</div>`;
 const slots=`<h3 style="margin:20px 0 8px;font-size:15px">② 슬롯 조립</h3><div class="xgrid--3 xgrid"><div class="card" style="padding:16px 18px"><b>슬롯 A</b>${slotSel('a',CS.a)}</div><div class="card" style="padding:16px 18px"><b>슬롯 B</b>${slotSel('b',CS.b)}</div><div class="card" style="padding:16px 18px"><b>배경</b><select class="xsel" data-cbg aria-label="배경">${Object.entries(BGS).map(([k,v])=>`<option value="${k}"${CS.bg===k?' selected':''}>${v.t}</option>`).join('')}</select></div></div>`;
 if(!CS.purpose)return head+slots+`<div class="gate" style="margin:28px auto"><h2>열람 목적을 고르면 결과가 열려요</h2><p>상담 준비 · 판정 근거 · 학급 지도 중 하나 · 선택과 동시에 감사로그에 기록돼요</p></div></section>`;
 if(!A||!B)return head+slots+'<p class="caption">슬롯 A·B를 고르세요</p></section>';
 const rows=[['내신 등급대',x=>x.band+bar(x.bn,5,true)],['수능 최저 충족 가능성',x=>x.min],['전공 연계 활동 수',x=>x.actT+bar(x.act,5)],['권장과목 충족',x=>x.req],['판정 상태',x=>x.judge]];
 const tbl=`<div class="xscroll"><table class="btable"><tr><th>항목</th><th>A · ${A.label}</th><th>B · ${B.label}</th><th>배경 · ${G.t}</th></tr>${rows.map(([n,f])=>`<tr><td style="font-weight:700;color:var(--ink-2)">${n}</td><td>${f(A)}</td><td>${f(B)}</td><td style="color:var(--ink-2)">${f(G)}</td></tr>`).join('')}</table></div>`;
 const todo=HITL.filter(h=>!HS[h.id]&&!h.mine);
 const send=ro?'<p class="caption">과목교사 역할은 읽기 전용이라 근거 칩을 보낼 수 없어요</p>':`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:12px"><select class="xsel" style="width:auto;min-width:220px" data-ctarget aria-label="근거를 보낼 판정 대기 건">${todo.length?todo.map(h=>`<option value="${h.id}"${CS.target===h.id?' selected':''}>${h.stu} · ${h.uni}</option>`).join(''):'<option value="">대기 건 없음</option>'}</select><button class="btn btn--primary xb" data-csend${todo.length?'':' disabled'}>HITL 근거 칩으로 보내기</button></div>`;
 const wm=`${teacherName()} · 2027.09.05 · 열람 목적: ${PURPOSE[CS.purpose]} · 재배포 금지`;
 return head+slots+`<h3 style="margin:20px 0 8px;font-size:15px">③ 결과 <span class="badge badge--gray">합성 · 실제 학생 아님</span></h3>
 <div class="cmp-res" data-wm="${esc(wm)}">${tbl}</div>
 <p class="caption">막대는 등급대·활동 수를 상대적으로 보여줄 뿐, 합격 가능성 숫자가 아니에요 · 원문·개인 판정은 전문시스템</p>
 ${send}
 <p class="caption">화면 캡처·재배포 금지 · 열람 기록은 감사로그와 학생 「내 정보를 본 기록」에 남아요</p></section>`;};
function bindCompare(){
 document.querySelectorAll('[data-cpurpose]').forEach(b=>b.addEventListener('click',()=>{CS.purpose=b.dataset.cpurpose;csSave();hlog(`비교·분석 열람 · 목적 ${PURPOSE[CS.purpose]}`);showToast('열람 목적 기록 · 감사로그');renderAll();}));
 document.querySelectorAll('[data-cslot]').forEach(s=>s.addEventListener('change',()=>{CS[s.dataset.cslot]=s.value;csSave();renderAll();}));
 document.querySelectorAll('[data-cbg]').forEach(s=>s.addEventListener('change',()=>{CS.bg=s.value;csSave();renderAll();}));
 document.querySelectorAll('[data-ctarget]').forEach(s=>s.addEventListener('change',()=>{CS.target=s.value;csSave();}));
 document.querySelectorAll('[data-csend]').forEach(b=>b.addEventListener('click',()=>{const sel=document.querySelector('[data-ctarget]');const id=sel&&sel.value;if(!id)return;const A=slotObj(CS.a),B=slotObj(CS.b),G=BGS[CS.bg];
  const chip=`${A.label} vs ${B.label} · 내신 ${A.band} / ${B.band} · 배경 ${G.t}`;const ev=Array.isArray(HS[id+'_ev'])?HS[id+'_ev']:[];if(!ev.includes(chip))ev.push(chip);HS[id+'_ev']=ev;hsSave();hlog(`비교·분석 근거 칩 → ${hById(id).stu} 판정 대기 건`);showToast('HITL 근거 칩으로 보냈어요 · 판정 승인 H0·H2 카드에 표시');}));}

/* ═══════════ C. 진학통계 : 역할 스위처(범위) · 졸업생 진학결과(소집단 억제) · 보고서 빌더 ═══════════ */
const SK='sen-stats-v1';
let ST=Object.assign({scope:null,blocks:['apply','rate'],period:'2',to:'principal',preview:false},lsGet(SK,{}));
const stSave=()=>lsSet(SK,ST);
const SCOPES={cls:{t:'우리 반',sub:'3학년 2반 · 재학 25명 (졸업생 결과는 2027.2 졸업반)',roles:['homeroom','head','schooladmin']},grade:{t:'학년 (반 간 비교)',sub:'3학년 8학급 · 2027.2 졸업 312명',roles:['head','schooladmin']},school:{t:'학교',sub:'서울한빛고 · 2027.2 졸업 312명 · 계열별',roles:['head','schooladmin']}};
const defScope=()=>state==='homeroom'?'cls':state==='head'?'grade':'school';
const GRAD={cls:{type:[['학생부교과',21,6,4],['학생부종합',38,9,5],['논술',12,2,1],['정시(수능위주)',17,8,7]],line:[['인문',41,12,8],['자연',43,12,8],['예체능',4,1,1]]},
 grade:{type:[['학생부교과',205,58,41],['학생부종합',372,91,55],['논술',118,14,9],['정시(수능위주)',166,77,63]],line:[['인문',402,118,82],['자연',431,117,84],['예체능',28,5,2]],cls:[['1반',31,20],['2반',25,17],['3반',29,22],['4반',27,19],['5반',30,21],['6반',22,16],['7반',31,24],['8반',45,29]]},
 school:{type:[['학생부교과',205,58,41],['학생부종합',372,91,55],['논술',118,14,9],['정시(수능위주)',166,77,63]],line:[['인문',402,118,82],['자연',431,117,84],['예체능',28,5,2]]}};
const BLOCKS={apply:'지원 현황',rate:'전형별 합격률',min:'수능 최저 충족',cnt:'상담 건수',share:'공유 승인율',judge:'판정 확정 현황'};
const PERIODS={'1':'2027 1학기','2':'2027 2학기',y:'연간'};const TOS={principal:'학교장 보고',meet:'학년 협의회',parents:'학부모 설명회'};
const sup=n=>n<5?'<span class="badge badge--gray">5명 미만 · 비공개</span>':n;
function gradTbl(rows,heads){const any=rows.some(r=>r.slice(1).some(n=>n<5));
 return `<div class="xscroll"><table class="btable"><tr>${heads.map(h=>`<th>${h}</th>`).join('')}<th></th></tr>${rows.map(r=>{const f=r.slice(1).some(n=>n<5);return `<tr><td><b>${r[0]}</b></td>${r.slice(1).map(n=>`<td>${sup(n)}</td>`).join('')}<td>${f?'<span class="badge badge--wait">소집단 억제</span>':''}</td></tr>`;}).join('')}</table></div>${any?'<p class="caption">5명 미만 칸은 개인 추정을 막기 위해 비공개 · 플랫폼관리 관리통계와 같은 규칙</p>':''}`;}
const blockTbl=k=>{const t={apply:[['교과·종합·논술·정시 지원','88 · 110 · 12 · 17'],['1인당 수시 카드','5.6장']],rate:[['학생부교과','29%'],['학생부종합','24%'],['논술','5명 미만 · 비공개'],['정시','47%']],min:[['최저 있는 전형 지원','41건'],['충족 예상 · 미달 우려','31 · 6 · 점검 4']],cnt:[['학교 상담','54건'],['센터 방문·화상·게시판','9 · 6 · 14']],share:[['공유 요청 → 승인','47 → 41 (87%)'],['상담 한정 공유','6건']],judge:[['확정 · 전달','11 · 9'],['대기 · 2차 검토','4 · 1']]}[k];
 return `<div class="card" style="padding:14px 16px"><b style="font-size:14px">${BLOCKS[k]}</b><table class="mini-tbl" style="margin-top:6px">${t.map(r=>`<tr><td>${r[0]}</td><td style="text-align:right;font-weight:700">${r[1]}</td></tr>`).join('')}</table></div>`;};
window.statsHtml=function(){
 if(state==='counselor')return gate('진학통계는 학교 교사 역할에서만','상담교사 역할은 배정 건만 열람해요. 헤더에서 교사 역할로 전환하세요.');
 const ro=state==='subject';if(!ST.scope||!SCOPES[ST.scope].roles.includes(state))ST.scope=defScope();
 const sc=SCOPES[ST.scope],g=GRAD[ST.scope];
 const sw=`<div class="xseg" role="radiogroup" aria-label="통계 범위">${Object.entries(SCOPES).map(([k,v])=>{const ok=v.roles.includes(state);return `<button type="button" role="radio" aria-checked="${ST.scope===k}" class="${ST.scope===k?'is-on':''}" data-sscope="${k}"${ok?'':' disabled'} title="${ok?'':'이 역할에서는 열 수 없어요'}">${v.t}</button>`;}).join('')}</div><p class="caption">담임 = 우리 반 · 진학부장 = 학년(반 간 비교) · 학교관리자 = 학교 · 학년·학교 범위에는 개인 단위 자료가 없어요</p>`;
 const grad=`<h3 style="margin:20px 0 8px;font-size:15px">졸업생 진학결과 <span class="badge badge--gray">합성 · 실제 학생 아님</span> <small style="color:var(--ink-3)">${sc.sub} · 2027학년도 입학 기준</small></h3>
 <h4 style="margin:10px 0 6px;font-size:13.5px;color:var(--ink-2)">전형 유형별</h4>${gradTbl(g.type,['전형 유형','지원','합격','등록'])}
 <h4 style="margin:14px 0 6px;font-size:13.5px;color:var(--ink-2)">계열별</h4>${gradTbl(g.line,['계열','지원','합격','등록'])}
 ${g.cls?`<h4 style="margin:14px 0 6px;font-size:13.5px;color:var(--ink-2)">반 간 비교</h4>${gradTbl(g.cls,['학급','합격','등록'])}`:''}`;
 const builder=ro?'<p class="caption">과목교사 역할은 읽기 전용이라 보고서를 만들 수 없어요</p>':`<h3 style="margin:22px 0 8px;font-size:15px">보고서 빌더</h3>
 <div class="xgrid"><div class="card" style="padding:16px 18px"><b>블록</b><div style="margin-top:8px">${Object.entries(BLOCKS).map(([k,v])=>`<label class="xchk"><input type="checkbox" data-sblock="${k}"${ST.blocks.includes(k)?' checked':''}><span>${v}</span></label>`).join('')}</div></div>
 <div class="card" style="padding:16px 18px"><label class="xlab" style="margin-top:0">기간<select class="xsel" data-speriod>${Object.entries(PERIODS).map(([k,v])=>`<option value="${k}"${ST.period===k?' selected':''}>${v}</option>`).join('')}</select></label><label class="xlab">수신자<select class="xsel" data-sto>${Object.entries(TOS).map(([k,v])=>`<option value="${k}"${ST.to===k?' selected':''}>${v}</option>`).join('')}</select></label>
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn btn--line xb" data-spreview>미리보기</button><button class="btn btn--primary xb" data-spdf>PDF 내보내기(워터마크)</button></div><p class="caption">수신자·발송일시가 워터마크로 들어가고, 5명 미만 칸은 보고서에도 비공개예요</p></div></div>
 ${ST.preview?`<h4 style="margin:16px 0 8px;font-size:14px">미리보기 · ${PERIODS[ST.period]} · ${TOS[ST.to]} · ${sc.t}</h4>${ST.blocks.length?`<div class="xgrid--3 xgrid">${ST.blocks.map(blockTbl).join('')}</div>`:'<p class="caption">블록을 하나 이상 고르세요</p>'}`:''}`;
 return `<section class="section"><h2 class="t">진학통계 <span class="badge badge--teach">${ro?'과목교사 · 읽기 전용':sc.t}</span></h2><p class="s">반·학년·학교 단위 집계만 보여요 · 원문·개인 판정은 전문시스템 · 5명 미만은 비공개</p>
 <div class="share__notice">집계는 비식별 처리된 반·학년 단위 · 내보내기에는 워터마크와 수신자가 찍혀요</div>
 <h3 style="margin:16px 0 8px;font-size:15px">범위</h3>${sw}${grad}${builder}</section>`;};
function bindStats(){
 document.querySelectorAll('[data-sscope]').forEach(b=>b.addEventListener('click',()=>{ST.scope=b.dataset.sscope;stSave();renderAll();}));
 document.querySelectorAll('[data-sblock]').forEach(c=>c.addEventListener('change',()=>{const k=c.dataset.sblock;ST.blocks=c.checked?[...new Set([...ST.blocks,k])]:ST.blocks.filter(x=>x!==k);stSave();if(ST.preview)renderAll();}));
 document.querySelectorAll('[data-speriod]').forEach(s=>s.addEventListener('change',()=>{ST.period=s.value;stSave();if(ST.preview)renderAll();}));
 document.querySelectorAll('[data-sto]').forEach(s=>s.addEventListener('change',()=>{ST.to=s.value;stSave();if(ST.preview)renderAll();}));
 document.querySelectorAll('[data-spreview]').forEach(b=>b.addEventListener('click',()=>{ST.preview=true;stSave();renderAll();}));
 document.querySelectorAll('[data-spdf]').forEach(b=>b.addEventListener('click',()=>{hlog(`진학통계 PDF 내보내기 · ${SCOPES[ST.scope].t} · ${TOS[ST.to]}`);showToast('워터마크 PDF 생성 · 수신자·발송일시 표시 · 재배포 금지');}));}

/* ═══════════ D. 학생상담모드 M0~M5 : 잠금 띠 · 타 학생 마스킹 · 무입력 10분 · 해제 PIN · 미러링 · 세션 → 요약 초안 → 상담 원장 ═══════════ */
const MK='sen-cmode-v1',MLK='sen-cmode-log-v1',PIN='0000',IDLE=600;
let CM=lsGet(MK,null);const cmSave=()=>CM?lsSet(MK,CM):localStorage.removeItem(MK);
const MTYPES=['진로','수시','정시','학업설계'];const MSTAGE=['공유 자료 함께 보기','살펴볼 점','선생님 의견','다음 행동 합의'];
const cmActive=()=>!!(CM&&CM.stage>=1&&CM.stage<=4);
const mmss=s=>`${pad(Math.floor(Math.max(0,s)/60))}:${pad(Math.max(0,s)%60)}`;
const remain=()=>CM?IDLE-Math.floor((Date.now()-CM.last)/1000):IDLE;
function cmodeSync(){document.body.classList.toggle('is-cmode',cmActive());document.body.classList.toggle('is-mirror',cmActive()&&!!CM.mirror);}
function askPin(why){return new Promise(res=>{const m=document.createElement('div');m.className='xpin';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','해제 PIN');
 m.innerHTML=`<div><h2>해제 PIN</h2><p class="caption" style="margin:0">${esc(why)} · 선생님이 정한 4자리 PIN을 입력하세요</p><input type="password" inputmode="numeric" maxlength="4" autocomplete="off" aria-label="4자리 PIN"><p class="caption" data-err style="display:none;color:var(--warn);margin:0 0 8px">PIN이 맞지 않아요</p><div style="display:flex;gap:8px"><button class="btn btn--primary xb" style="flex:1" data-ok>확인</button><button class="btn btn--line xb" style="flex:1" data-no>취소</button></div></div>`;
 document.body.appendChild(m);const inp=m.querySelector('input');setTimeout(()=>inp.focus(),30);
 const done=v=>{m.remove();res(v);};const check=()=>{if(inp.value===PIN)done(true);else{m.querySelector('[data-err]').style.display='';inp.value='';inp.focus();}};
 m.querySelector('[data-ok]').addEventListener('click',check);m.querySelector('[data-no]').addEventListener('click',()=>done(false));inp.addEventListener('keydown',e=>{if(e.key==='Enter')check();if(e.key==='Escape')done(false);});});}
function mQuestions(){const c=CLASS.find(x=>x.n===CM.stu)||{};const q=[];
 if(!/✓/.test(c.plan||''))q.push(['권장과목',`희망 학과 권장과목 중 아직 담지 않은 과목이 있어요 (${c.plan||'미작성'}). 다음 학기에 넣을 수 있을까요?`]);
 if(/누락|오류/.test(c.load||''))q.push(['자료 적재',`자료에 빠진 부분이 있어요 (${c.load}). 어떻게 보완할지 같이 볼까요?`]);
 if(c.last&&c.last!=='—')q.push(['지난 상담',`지난 상담(${c.last})에서 정한 다음 행동은 어떻게 되고 있나요?`]);
 if(/대기/.test(c.judge||''))q.push(['판정 상태','지원 전형에 대한 선생님 의견이 준비 중이에요. 궁금한 전형부터 이야기해 볼까요?']);
 q.push(['상담 유형',{진로:'요즘 마음이 가는 분야는 어디예요? 진로검사 결과와 같은가요, 다른가요?',수시:'수시 6장 구성에서 가장 고민되는 한 장은 어떤 거예요?',정시:'9월 학평 뒤로 달라진 생각이 있나요? 군별로 하나씩 이야기해 볼까요?',학업설계:'다음 학기 과목 중 바꾸고 싶은 게 있나요? 이유도 함께 들려주세요.'}[CM.type]]);
 q.push(['활동','최근 활동 성장 노트 중 가장 기억에 남는 활동은 무엇이고, 왜 그랬나요?']);
 q.push(['공유 범위','오늘 함께 본 자료 말고 더 보여주고 싶은 자료가 있나요? 공유는 학생이 정해요.']);
 return q.slice(0,4);}
function mDraft(){const c=CLASS.find(x=>x.n===CM.stu)||{};return {t:`${CM.stu} 학생의 ${CM.type} 상담입니다. 공유된 과목 설계와 희망 학과 권장과목을 대조하면 ${c.plan||'계획 미작성'} 상태예요. ${/✓/.test(c.plan||'')?'권장과목은 충족했으니 활동의 깊이를 더하는 쪽으로 이야기해 보면 좋겠어요.':'아직 담지 않은 권장과목을 다음 학기에 넣는 방안을 함께 정해 보면 좋겠어요.'} 지원 방향은 전문시스템에서 확정한 의견만 전달할게요.`,ev:['과목 설계 (학생 공유)','권장과목 기준 (학과 안내)',`최근 상담 ${c.last||'없음'}`]};}
function mSummary(e){return `${e.stu} · ${e.type} 상담 · ${e.min}분 (${e.reason==='auto'?'무입력 10분 자동 종료':e.reason==='early'?'조기 종료':'정상 종료'})\n함께 본 자료 : ${e.shared||'공유 자료 없음'}\n살펴본 점 : ${e.q.join(' / ')}\n선생님 의견 : ${e.opOk?e.op:'(확정하지 않음 · 학생에게 전달되지 않음)'}\n합의한 다음 행동 : ${e.acts.length?e.acts.join(' / '):'없음'}\n다음 상담 : ${e.next||'미정'}`;}
function endMode(reason){if(!CM)return;const L=lsGet(MLK,[]);const shared=SHARES.filter(s=>s.who===CM.stu).map(s=>s.what).join(' · ');const acts=['권장과목 1개 다음 학기 반영','활동 성장 노트 1건 작성','다음 상담 전 질문 메모'].filter((_,i)=>CM.acts&&CM.acts[i]);
 const e={id:'CS-'+String(Date.now()).slice(-6),stu:CM.stu,type:CM.type,at:now(),min:Math.max(1,Math.round((Date.now()-CM.startedAt)/6e4)),reason,shared,q:mQuestions().map(x=>x[0]),op:CM.op||'',opOk:!!CM.opOk,acts,next:CM.next||'',confirmed:false};
 e.summary=mSummary(e);L.unshift(e);lsSet(MLK,L.slice(0,20));CM.stage=5;CM.logId=e.id;cmSave();cmodeSync();view='mode';localStorage.setItem('sen-teacher-view',view);renderAll();if(reason==='auto')showToast('무입력 10분 · 상담모드를 자동 종료했어요 · 요약 초안을 확인하세요');}
setInterval(()=>{if(!cmActive())return;const r=remain();const el=document.getElementById('cmTm');if(el)el.textContent=mmss(r);if(r<=0)endMode('auto');},1000);
['click','keydown','input'].forEach(ev=>document.addEventListener(ev,e=>{if(cmActive()&&e.target.closest&&e.target.closest('#main')){CM.last=Date.now();cmSave();}},true));
function m0Html(){const L=lsGet(MLK,[]);const mine=state==='counselor';
 const hist=L.length?`<h3 style="margin:20px 0 8px;font-size:15px">최근 상담 세션</h3><div class="xscroll"><table class="btable"><tr><th>세션</th><th>학생</th><th>유형</th><th>시각</th><th>상태</th></tr>${L.slice(0,5).map(e=>`<tr><td>${e.id}</td><td><b>${e.stu}</b></td><td>${e.type}</td><td>${e.at} · ${e.min}분</td><td>${e.confirmed?'<span class="badge badge--ok">상담 원장 기록</span>':'<span class="badge badge--wait">요약 초안 · 미확정</span>'}</td></tr>`).join('')}</table></div>`:'';
 const d={stu:mPre.stu||'강지우',type:mPre.type||'진로'};
 return `<section class="section"><h2 class="t">학생상담모드 <span class="badge badge--teach">M0 · 준비</span></h2><p class="s">태블릿을 학생과 함께 보며 상담하는 화면이에요 · 시작하면 다른 학생 정보가 가려지고, 학생이 공유한 항목과 확정된 [선생님 의견]만 보여요</p>
 <div class="share__notice">플랫폼관리 정책 : 잠금 띠 · 타 학생 마스킹 · 무입력 10분 세션 종료 · 해제 PIN · 종료 시 상담 세션 자동 생성 → 요약 초안 → 교사 확정 후 상담 원장 · 미러링 시 교사 전용 패널 제외</div>
 <div class="xgrid" style="margin-top:14px"><div class="card" style="padding:18px 20px"><label class="xlab" style="margin-top:0">학생 (${mine?'배정 학생':'우리 반'})<select class="xsel" data-mstu>${CLASS.map(c=>`<option value="${c.n}"${d.stu===c.n?' selected':''}>${c.n} · ${c.band} · ${/✓/.test(c.plan)?'권장과목 충족':c.plan}</option>`).join('')}</select></label>
 <p class="xlab">상담 유형</p><div class="xseg" role="radiogroup" aria-label="상담 유형">${MTYPES.map(t=>`<button type="button" role="radio" aria-checked="${d.type===t}" class="${d.type===t?'is-on':''}" data-mtype="${t}">${t}</button>`).join('')}</div></div>
 <div class="card" style="padding:18px 20px"><h2 style="font-size:16px">시작 전 확인</h2><ul class="rules" style="margin:0 0 12px"><li>학생이 공유한 항목만 보여요 · 성적 원문·판정 결과는 나오지 않아요</li><li>무입력 10분이면 자동 종료 · 조기 종료·잠금 해제는 PIN</li><li>태블릿을 학생에게 돌릴 때는 「미러링 보기」로 교사 전용 패널을 숨겨요</li></ul><button class="btn btn--primary xb" data-mstart>상담모드 시작 (2단계 인증)</button></div></div>${hist}</section>`;}
function mBand(){return `<div class="lockband" role="status" aria-live="polite"><span>🔒 학생상담모드 · <b>${CM.stu}</b> · ${CM.unlocked?'마스킹 해제됨 (교사 전용)':'다른 학생 정보 마스킹 중'} · 무입력 <span class="tm" id="cmTm">${mmss(remain())}</span> 남음</span><span style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap"><button type="button" class="${CM.mirror?'is-on':''}" data-mmirror aria-pressed="${!!CM.mirror}">미러링 보기${CM.mirror?' 중':''}</button><button type="button" data-munlock aria-label="잠금 해제 (PIN)">${CM.unlocked?'다시 잠금':'잠금 해제'}</button><button type="button" data-mend aria-label="상담모드 종료">종료</button></span></div>`;}
function mStageHtml(){const s=CM.stage;const shared=SHARES.filter(x=>x.who===CM.stu);const c=CLASS.find(x=>x.n===CM.stu)||{};
 let stu='',tea='';
 if(s===1){stu=shared.length?shared.map(x=>`<div style="margin-bottom:12px"><b>${x.what}</b> <span class="badge ${x.badge==='학생 승인'?'badge--ok':'badge--wait'}" style="font-size:11px">${x.badge}</span><dl class="kv2" style="margin-top:8px">${Object.entries(x.detail).map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></div>`).join(''):'<p class="caption">학생이 공유한 항목이 없어요 · 학생이 MY에서 공유를 승인하면 여기에 보여요</p>';
  tea=`<p style="margin:0 0 8px;font-size:13.5px">상담 유형 <b>${CM.type}</b> · 내신 ${c.band} · 자료 적재 ${c.load} · 최근 상담 ${c.last}</p><p class="caption" style="margin:0 0 8px">반 명단 (마스킹) : ${CLASS.map(x=>x.n===CM.stu?`<b>${x.n}</b>`:CM.unlocked?x.n:'●●●').join(' · ')}</p><p class="caption" style="margin:0">판정 상태 ${c.judge} · 확정·전달된 의견만 학생 패널에 보여요</p>`;}
 if(s===2){const q=mQuestions();stu=`<ol style="margin:0;padding-left:20px;font-size:15px;line-height:1.6">${q.map(x=>`<li style="margin-bottom:10px">${x[1]}</li>`).join('')}</ol>`;
  tea=`<p class="caption" style="margin:0 0 8px">규칙 기반 질문이에요 (AI 판단 아님) · 근거 : ${q.map(x=>x[0]).join(' · ')}</p><label class="xlab" style="margin-top:0">상담 메모 (교사 전용)<textarea class="xta" data-mmemo placeholder="학생 답변 요지">${esc(CM.memo||'')}</textarea></label>`;}
 if(s===3){stu=CM.opOk&&CM.op?`<div class="share__notice" style="background:#E2F4EE;color:var(--ok)">[선생님 의견]</div><p style="margin:0;font-size:15px;line-height:1.6;white-space:pre-wrap">${esc(CM.op)}</p>`:'<p class="caption">선생님이 의견을 확정하면 여기에 [선생님 의견]으로 보여요</p>';
  const d=CM.ai;tea=`<label class="xlab" style="margin-top:0">선생님 의견<textarea class="xta" data-mop placeholder="학생에게 전달할 의견 · 확률 숫자·단정적 합불 표현은 쓰지 않아요">${esc(CM.op||'')}</textarea></label><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><button class="btn btn--line xbs" data-mai>AI 초안 불러오기</button><button class="btn btn--primary xbs" data-mok>교사 확정 → 학생 패널에 표시</button>${CM.opOk?'<span class="badge badge--ok">확정됨</span>':''}</div>${d?`<div style="margin-top:10px;padding:12px;border:1px dashed var(--line);border-radius:12px;font-size:13.5px"><b>AI 초안</b> <span class="badge badge--gray">교사 확정 전에는 학생에게 보이지 않아요</span><p style="margin:6px 0;white-space:pre-wrap">${esc(d.t)}</p><div style="display:flex;gap:6px;flex-wrap:wrap">${d.ev.map(e=>`<span class="badge badge--gray">근거 · ${e}</span>`).join('')}</div><button class="btn btn--line xbs" style="margin-top:8px" data-mapply>초안을 의견 칸에 넣기</button></div>`:''}`;}
 if(s===4){const acts=['권장과목 1개 다음 학기 반영','활동 성장 노트 1건 작성','다음 상담 전 질문 메모'];
  stu=`<div>${acts.map((a,i)=>`<label class="xchk"><input type="checkbox" data-mact="${i}"${CM.acts&&CM.acts[i]?' checked':''}><span>${a}</span></label>`).join('')}</div><label class="xlab">다음 상담 예정일<input type="date" class="xsel" data-mnext value="${esc(CM.next||'')}" aria-label="다음 상담 예정일"></label>`;
  tea=`<p class="caption" style="margin:0">합의한 항목은 학생 「후속 과제」와 상담 원장에 함께 기록돼요 · 종료하면 요약 초안이 만들어져요</p>`;}
 return `<div class="xstage" aria-label="상담 단계">${MSTAGE.map((t,i)=>`<span class="${i+1===s?'is-on':i+1<s?'is-done':''}">M${i+1} ${t}</span>`).join('')}</div>
 <div class="xgrid" style="grid-template-columns:1.3fr 1fr"><div class="card" style="padding:18px 20px"><h2 style="font-size:16px">학생과 함께 보는 화면 <span class="badge badge--ok" style="font-size:11px">공유 항목만</span></h2><p class="sub">M${s} · ${MSTAGE[s-1]}</p>${stu}</div>
 <div class="card" style="padding:18px 20px" data-teacher-only><h2 style="font-size:16px">교사 전용 <span class="badge badge--teach" style="font-size:11px">미러링 시 숨김</span></h2><p class="sub">학생 화면에는 나가지 않아요</p>${tea}</div></div>
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn btn--line xb" data-mprev${s===1?' disabled':''}>← 이전</button><button class="btn btn--primary xb" data-mnextstage>${s===4?'종료 · 요약 초안 만들기':'다음 →'}</button></div>
 <style>@media (max-width:1000px){.xgrid[style*="1.3fr"]{grid-template-columns:1fr !important}}</style>`;}
function m5Html(){const L=lsGet(MLK,[]);const e=L.find(x=>x.id===CM.logId);if(!e){CM=null;cmSave();return m0Html();}
 return `<section class="section"><h2 class="t">학생상담모드 <span class="badge badge--teach">M5 · 종료</span></h2><p class="s">상담 세션 ${e.id}이 만들어졌어요 · 요약 초안을 확인하고 확정하면 상담 원장에 기록돼요</p>
 <div class="card" style="padding:18px 20px"><h2 style="font-size:16px">상담 기록 요약 초안 <span class="badge badge--gray">규칙 기반 · 입력한 내용으로 조립</span></h2><p class="sub">${e.stu} · ${e.type} · ${e.at} · ${e.min}분</p><pre style="margin:0;white-space:pre-wrap;font:inherit;font-size:14px;line-height:1.6;background:var(--surface);border-radius:12px;padding:14px">${esc(e.summary)}</pre>
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn btn--primary xb" data-mconfirm>교사 확정 → 상담 원장</button><button class="btn btn--line xb" data-mkeep>초안으로 두고 닫기</button></div>
 <p class="caption">학생에게는 확정한 [선생님 의견]과 합의한 다음 행동만 가요 · 교사 메모는 원장에 들어가지 않아요</p></div></section>`;}
window.modeHtml=function(){cmodeSync();
 if(!['homeroom','head','counselor'].includes(state))return gate('학생상담모드는 담임·진학부장·상담교사만','과목교사·학교관리자 역할은 학생과 1:1로 상담 화면을 열 수 없어요.');
 if(!CM)return m0Html();if(CM.stage===5)return m5Html();
 return `${mBand()}<section class="section" style="padding-top:20px"><h2 class="t">학생상담모드 <span class="badge badge--teach">M${CM.stage} · ${MSTAGE[CM.stage-1]}</span></h2><p class="s">${CM.stu} 학생 · ${CM.type} 상담 · 시작 ${new Date(CM.startedAt).toTimeString().slice(0,5)}</p>${mStageHtml()}</section>`;};
function bindMode(){cmodeSync();const $=s=>document.querySelector(s);
 document.querySelectorAll('[data-mstu]').forEach(s=>s.addEventListener('change',()=>{mPre.stu=s.value;}));
 document.querySelectorAll('[data-mtype]').forEach(b=>b.addEventListener('click',()=>{mPre.type=b.dataset.mtype;b.parentElement.querySelectorAll('[data-mtype]').forEach(x=>{x.classList.toggle('is-on',x===b);x.setAttribute('aria-checked',x===b);});}));
 document.querySelectorAll('[data-mstart]').forEach(b=>b.addEventListener('click',()=>{const stu=($('[data-mstu]')||{}).value||'강지우';const type=mPre.type||'진로';twoFA('학생상담모드 시작 · '+stu).then(()=>{CM={stu,type,startedAt:Date.now(),last:Date.now(),stage:1,mirror:false,unlocked:false,acts:[false,false,false],next:'',op:'',opOk:false,ai:null,memo:''};cmSave();hlog(`학생상담모드 시작 · ${stu} · ${type}`);showToast('상담모드 시작 · 다른 학생 정보를 가렸어요 · 무입력 10분이면 자동 종료');renderAll();window.scrollTo({top:0});});}));
 const keep=()=>{const m=$('[data-mmemo]');if(m)CM.memo=m.value;const o=$('[data-mop]');if(o)CM.op=o.value;const n=$('[data-mnext]');if(n)CM.next=n.value;};
 document.querySelectorAll('[data-mprev]').forEach(b=>b.addEventListener('click',()=>{keep();CM.stage=Math.max(1,CM.stage-1);cmSave();renderAll();}));
 document.querySelectorAll('[data-mnextstage]').forEach(b=>b.addEventListener('click',()=>{keep();if(CM.stage>=4){cmSave();endMode('done');return;}CM.stage++;cmSave();renderAll();}));
 document.querySelectorAll('[data-mend]').forEach(b=>b.addEventListener('click',()=>{keep();if(CM.stage>=4){cmSave();endMode('done');return;}askPin('조기 종료').then(ok=>{if(ok)endMode('early');});}));
 document.querySelectorAll('[data-munlock]').forEach(b=>b.addEventListener('click',()=>{if(CM.unlocked){CM.unlocked=false;cmSave();showToast('다시 잠갔어요 · 다른 학생 정보 마스킹');renderAll();return;}askPin('잠금 해제 · 교사 전용 보기').then(ok=>{if(!ok)return;CM.unlocked=true;cmSave();hlog(`학생상담모드 잠금 해제 · ${CM.stu} 상담 중`);showToast('잠금 해제 · 마스킹을 풀었어요 (감사로그)');renderAll();});}));
 document.querySelectorAll('[data-mmirror]').forEach(b=>b.addEventListener('click',()=>{keep();CM.mirror=!CM.mirror;cmSave();showToast(CM.mirror?'미러링 보기 · 교사 전용 패널을 숨겼어요':'미러링 해제');renderAll();}));
 document.querySelectorAll('[data-mai]').forEach(b=>b.addEventListener('click',()=>{keep();CM.ai=mDraft();cmSave();showToast('AI 초안을 불러왔어요 · 반드시 검토·확정 후에만 학생에게 보여요');renderAll();}));
 document.querySelectorAll('[data-mapply]').forEach(b=>b.addEventListener('click',()=>{const o=$('[data-mop]');if(o&&CM.ai)o.value=CM.ai.t;}));
 document.querySelectorAll('[data-mok]').forEach(b=>b.addEventListener('click',()=>{keep();if(!CM.op.trim()){showToast('의견을 입력해 주세요');return;}CM.opOk=true;cmSave();showToast('확정 · 학생 패널에 [선생님 의견]으로 표시');renderAll();}));
 document.querySelectorAll('[data-mact]').forEach(c=>c.addEventListener('change',()=>{CM.acts=CM.acts||[false,false,false];CM.acts[+c.dataset.mact]=c.checked;cmSave();}));
 document.querySelectorAll('[data-mnext]').forEach(i=>i.addEventListener('change',()=>{CM.next=i.value;cmSave();}));
 document.querySelectorAll('[data-mconfirm]').forEach(b=>b.addEventListener('click',()=>{const L=lsGet(MLK,[]);const e=L.find(x=>x.id===CM.logId);if(e)e.confirmed=true;lsSet(MLK,L);hlog(`상담 세션 ${CM.logId} 확정 · 상담 원장 기록 · ${CM.stu}`);CM=null;cmSave();cmodeSync();showToast('상담 원장에 기록 · 학생에게는 확정한 [선생님 의견]만');renderAll();}));
 document.querySelectorAll('[data-mkeep]').forEach(b=>b.addEventListener('click',()=>{CM=null;cmSave();cmodeSync();showToast('요약 초안으로 보관 · 최근 상담 세션 목록에 미확정으로 남아요');renderAll();}));}
const mPre={stu:null,type:'진로'};

/* ═══════════ 공통 바인딩 ═══════════ */
window.bindExt=function(){bindHitl();bindCompare();if(typeof bindStats==='function')bindStats();if(typeof bindMode==='function')bindMode();};
})();
