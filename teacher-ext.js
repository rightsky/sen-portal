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

/* ═══════════ B. 비교·분석 : 열람 목적 → 슬롯 A·B·배경 → 비교표 → HITL 근거 칩 · 워터마크 ═══════════ */
const CK='sen-compare-v1';
let CS=Object.assign({purpose:null,a:'s:강지우',b:'u:국민대',bg:'dist',target:''},lsGet(CK,{}));
const csSave=()=>lsSet(CK,CS);
const PURPOSE={prep:'상담 준비',ev:'판정 근거',cls:'학급 지도'};
/* 학생 (우리 반 7명 · CLASS 보강) · 등급대는 bn(막대용)으로만 쓰고 숫자는 화면에 내지 않음 */
const STU_X={강지우:{bn:2.3,min:'충족 가능성 보통 (2합 5)',act:3},김서연:{bn:3.2,min:'해당 없음 (최저 없는 전형 위주)',act:2},박서준:{bn:2.1,min:'충족 가능성 낮음 (2합 5) · 점검',act:2},윤태양:{bn:4.1,min:'점검 필요 (지원계획 미작성)',act:1},이하은:{bn:1.4,min:'충족 가능성 높음 (3합 6)',act:4},정우진:{bn:3.3,min:'점검 필요 (적재 오류)',act:1},최민준:{bn:2.2,min:'충족 가능성 높음 (2합 4)',act:3}};
const UNIS=[
 {k:'한국대',t:'한국대 · 학생부종합',band:'1~2등급대',bn:1.8,min:'최저 없음',act:2,actT:'전공 연계 활동 2건 이상 권장',req:'권장과목 : 미적분 · 확률과 통계',judge:'김하늘 적정 (겸직 제한 건)'},
 {k:'국민대',t:'국민대 · 학생부종합(학교생활우수자)',band:'2등급대 중앙',bn:2.3,min:'최저 없음',act:3,actT:'전공 연계 활동 3건 안팎',req:'권장과목 : 사회·문화 · 확률과 통계',judge:'강지우 AI 초안 「적정」'},
 {k:'한강대',t:'한강대 · 학생부교과',band:'전년 70%컷 1.9',bn:1.9,min:'2합 5',act:0,actT:'비교과 미반영',req:'권장과목 : 미적분',judge:'박서준 AI 초안 「소신」'},
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

/* ═══════════ 공통 바인딩 ═══════════ */
window.bindExt=function(){bindHitl();bindCompare();if(typeof bindStats==='function')bindStats();if(typeof bindMode==='function')bindMode();};
})();
