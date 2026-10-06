(function(){
const {TYPES,QUIZ,SCHED,STEPS,SCHOOLS,TNAME}=SC;const A=SEN_AUTH;const $=id=>document.getElementById(id);
const KEY='sen-school-v1';let SV=JSON.parse(localStorage.getItem(KEY)||'{"saved":["h1","h5"],"cmp":[]}');const save=()=>localStorage.setItem(KEY,JSON.stringify(SV));
/* ── 고교 유형 ── */
let ans=[];
function renderTypes(){
  $('typeGrid').innerHTML=TYPES.map(t=>`<article class="xcard" data-type="${t.id}" tabindex="0"><div><span class="xcard__cat">${t.round} 선발</span><h3>${t.name}</h3></div><p>${t.desc}</p><div class="ria">${t.tags.map(x=>`<span>${x}</span>`).join('')}</div></article>`).join('');
  $('typeTable').innerHTML=`<div class="ctable-w"><table class="ctable"><thead><tr><th>유형</th><th>선발 시기</th><th>선발 방식</th><th>이런 학생에게 어울려요</th></tr></thead><tbody>${TYPES.map(t=>`<tr><th style="color:var(--ink);font-size:15px">${t.name}</th><td>${t.round}</td><td>${t.sel}</td><td>${t.fit}</td></tr>`).join('')}</tbody></table></div>
  <div class="ud" style="margin-top:24px"><div class="panel-c" style="border:1px solid var(--line);box-shadow:none"><h3>고교 선택의 첫 기준은 '내신 확보 가능성'</h3><p style="margin:0;color:var(--ink-2);font-size:14.5px">명성이나 입결이 아니라, 우리 아이가 이 학교에서 필요한 과목을 선택하고 끝까지 성취할 수 있는가가 기준이에요.</p><ul class="reading"><li><b>비교는 이 네 가지로</b>교육과정표 · 개설 과목 · 공동교육과정 유무 · 통학과 생활 리듬</li><li><b>아이 성향도 함께</b>경쟁 스트레스를 어느 정도 감당하는지, 미리 배운 내용을 스스로 소화했는지</li></ul></div>
  <div class="panel-c" style="background:var(--surface);box-shadow:none"><h3>학교 선택 뒤에는 주전형 구도를</h3><ul class="reading"><li><b>내신 확보가 쉬운 학교</b>교과 전형 주력 + 학종 보조가 기본 구도예요</li><li><b>경쟁이 치열한 학교</b>심화된 학교생활 기록 기반 학종이나 정시 주력을 고려해요</li><li><b>어느 쪽이든</b>수능 최저를 못 맞추면 교과 전형은 의미가 없으니 기본 학력은 항상 함께 가요</li></ul><p class="hint" style="margin:0">진로진학 도서의 원칙을 재구성한 안내예요 · 유형별 유불리는 상담에서 아이 상황으로 함께 봅니다</p></div></div>`;
  renderQuiz();
}
function renderQuiz(){
  const i=ans.length;
  if(i<QUIZ.length){const [q,opts]=QUIZ[i];
    $('quiz').innerHTML=`<div class="qz__prog">${QUIZ.map((_,k)=>`<i class="${k<i?'on':k===i?'cur':''}"></i>`).join('')}<span>${i+1} / ${QUIZ.length}</span></div><h3>${q}</h3><div class="qz__opts">${opts.map((o,k)=>`<button class="qz__opt" data-qa="${k}">${o[0]}</button>`).join('')}</div>${i?'<button class="link" data-qback>← 이전 질문</button>':''}`;return;}
  const sc={};ans.forEach((a,qi)=>Object.entries(QUIZ[qi][1][a][1]).forEach(([k,v])=>sc[k]=(sc[k]||0)+v));
  const top=Object.entries(sc).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>TYPES.find(t=>t.id===x[0]));
  $('quiz').innerHTML=`<div class="qz__prog">${QUIZ.map(()=>'<i class="on"></i>').join('')}<span>결과</span></div><h3>이런 고교 유형을 살펴보세요</h3><div class="qz__res">${top.map((t,k)=>`<div class="qz__card${k?'':' is-1'}"><small>${k?'함께 살펴볼 유형':'가장 잘 맞는 유형'}</small><b>${t.name}</b><p>${t.fit}</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn--ghost btn--pill" data-type="${t.id}">자세히</button><a class="btn btn--primary btn--pill" href="#schools" data-findtype="${t.id}">이 유형 학교 찾기</a></div></div>`).join('')}</div><button class="link" data-qreset>다시 해보기 ↺</button>`;
}
function openType(id){const t=TYPES.find(x=>x.id===id),n=SCHOOLS.filter(s=>s.type===id).length;
  EX.drawer.open(`<div class="dh"><small>고교 유형 · ${t.round} 선발</small><h2>${t.name}</h2><p>${t.desc}</p></div><div class="dsec"><h3>선발 방식</h3><p>${t.sel}</p></div><div class="dsec"><h3>이런 학생에게 어울려요</h3><p>${t.fit}</p></div><div class="dsec"><h3>특징</h3><div class="lchips">${t.tags.map(x=>`<span>${x}</span>`).join('')}</div></div><div class="dsec"><a class="btn btn--primary btn--pill" style="width:100%" href="#schools" data-findtype="${id}">${t.name} 찾기 (예시 ${n}곳) →</a></div><p class="dsrc">※ 선발 방식·일정은 학년도별 서울시교육청 고입 전형 기본계획을 확인하세요</p>`);}
/* ── 학교 찾기·비교 ── */
const f={gu:'',types:new Set(),coed:'',sort:'commute',q:''};
function renderSchools(){
  const gus=[...new Set(SCHOOLS.map(s=>s.gu))].sort();
  $('fGu').innerHTML=['<option value="">전체 자치구</option>',...gus.map(g=>`<option${f.gu===g?' selected':''}>${g}</option>`)].join('');
  $('fType').innerHTML=TYPES.map(t=>`<button class="fchip${f.types.has(t.id)?' is-on':''}" data-v="${t.id}">${t.name}</button>`).join('');
  $('fCoed').innerHTML=['','남녀공학','남고','여고'].map(c=>`<button class="fchip${f.coed===c?' is-on':''}" data-v="${c}">${c||'전체'}</button>`).join('');
  let L=SCHOOLS.filter(s=>(!f.gu||s.gu===f.gu)&&(!f.types.size||f.types.has(s.type))&&(!f.coed||s.coed===f.coed)&&(!f.q||(s.name+s.feats.join('')).includes(f.q)));
  L.sort((a,b)=>f.sort==='subj'?b.subj-a.subj:f.sort==='name'?a.name.localeCompare(b.name,'ko'):a.commute-b.commute);
  $('sCnt').innerHTML=`학교 <em>${L.length}</em>곳`;
  $('sGrid').innerHTML=L.length?L.map(s=>{const sv=SV.saved.includes(s.id),cm=SV.cmp.includes(s.id);return `<article class="xcard"><div class="xcard__top"><div><span class="xcard__cat">${s.gu} · ${TNAME[s.type]} · ${s.coed}</span><h3>${s.name}</h3></div><button class="save${sv?' is-on':''}" data-ssave="${s.id}" aria-label="${s.name} 관심 저장">${sv?'❤️':'🤍'}</button></div><div class="ria">${s.feats.map(x=>`<span>${x}</span>`).join('')}</div><div class="ind"><div>개설 과목 <b style="color:var(--ink)">${s.subj}개</b></div><div>학생 수 <b style="color:var(--ink)">${s.students}명</b></div><div>${A.logged()?'우리 집에서':'통학 예상'} <b style="color:var(--ink)">${s.commute}분</b></div><div>공동교육과정 <b style="color:var(--ink)">${s.joint?'참여':'–'}</b></div></div><div class="xcard__act"><button class="mini${cm?' is-on':''}" data-scmp="${s.id}">${cm?'✓ 비교 중':'+ 비교하기'}</button></div></article>`;}).join(''):`<div class="empty-r" style="grid-column:1/-1"><b>조건에 맞는 학교가 없어요</b>필터를 바꿔보세요.</div>`;
  renderCmp();
}
function renderCmp(){const c=SV.cmp.map(id=>SCHOOLS.find(s=>s.id===id));$('sCmpWrap').style.display=c.length?'':'none';$('sCmpN').textContent=`${c.length}/3`;
  if(!c.length)return;
  const best=(fn,low)=>{const v=c.map(fn),t=low?Math.min(...v):Math.max(...v);return v.map(x=>c.length>1&&x===t&&v.filter(y=>y===t).length<c.length);};
  const row=(t,fn,num,low)=>{const b=num?best(num,low):c.map(()=>0);return `<tr><th>${t}</th>${c.map((s,i)=>`<td class="${b[i]?'best'+(low?' low':''):''}">${fn(s)}</td>`).join('')}</tr>`;};
  $('sCmp').innerHTML=`<div class="ctable-w"><table class="ctable"><thead><tr><th></th>${c.map(s=>`<th>${s.name}<button class="link" style="display:block;font-size:12.5px;margin-top:4px" data-scmp="${s.id}">비교에서 빼기</button></th>`).join('')}</tr></thead><tbody>
  ${row('유형',s=>TNAME[s.type])}${row('위치',s=>s.gu)}${row('구분',s=>s.coed)}
  ${row('개설 과목 수',s=>`<b style="font-size:18px">${s.subj}</b>개`,s=>s.subj)}
  ${row('학생 수',s=>`${s.students}명`)}
  ${row('통학 시간',s=>`<b style="font-size:18px">${s.commute}</b>분`,s=>s.commute,true)}
  ${row('공동교육과정',s=>s.joint?'참여':'미참여')}
  ${row('특색',s=>s.feats.join(', '))}</tbody></table></div>`;
}
/* ── 고입 전형·일정 ── */
let round='all',step=0;
const MONTHS=[8,9,10,11,12,1,2];
function renderAdm(){
  $('roundSeg').querySelectorAll('button').forEach(b=>b.classList.toggle('is-on',b.dataset.r===round));
  const rows=SCHED.filter(s=>round==='all'||s.round===round);
  const idx=m=>MONTHS.indexOf(m);
  $('gantt').innerHTML=`<div class="gt__head"><span></span>${MONTHS.map(m=>`<span>${m}월</span>`).join('')}</div>`+rows.map(s=>{const a=idx(s.m[0]),b=idx(s.m[1]);return `<div class="gt__row" data-sched="${s.name}"><span class="gt__name"><em class="gt__r gt__r--${s.round==='전기'?'a':'b'}">${s.round}</em>${s.name}</span><div class="gt__track"><i style="left:${a/MONTHS.length*100}%;width:${(b-a+1)/MONTHS.length*100}%" class="gt__bar gt__bar--${s.round==='전기'?'a':'b'}"></i></div></div>`;}).join('');
  $('stepper').innerHTML=STEPS.map((s,i)=>`<button class="stp${i===step?' is-on':''}${i<step?' is-past':''}" data-step="${i}"><b>${s[0]}</b><span>${s[1]}</span></button>`).join('');
  $('stepDesc').innerHTML=`<b>${STEPS[step][0]} · ${STEPS[step][1]}</b><p>${STEPS[step][2]}</p>${A.logged()?`<p class="hint" style="margin-top:8px">김서울 님 거주지(종로구) 기준 학교군: <b>중부학교군</b> (예시)</p>`:''}`;
  const now=new Date(),dl=new Date(now.getFullYear(),11,10);if(dl<now)dl.setFullYear(dl.getFullYear()+1);
  $('dday').textContent='D-'+Math.ceil((dl-now)/864e5);
}
/* ── 탭 ── */
let tab='types';const L3={types:'고교 유형 알아보기',schools:'학교 찾기·비교',admission:'고입 전형·일정'};
function rerender(){({types:renderTypes,schools:renderSchools,admission:renderAdm})[tab]();$('loginNote').innerHTML=A.logged()?'✅ 김서울 님 · 거주지 <b>종로구</b> 기준으로 통학 시간과 학교군을 보여드려요':'로그인하면 관심 고교를 저장하고, 우리 집 기준 통학 시간과 학교군을 볼 수 있어요 <a class="link" href="#" data-loginopen>로그인 ›</a>';}
function setTab(){tab=(location.hash||'#types').slice(1);if(!L3[tab])tab='types';
  document.querySelectorAll('.ptab').forEach(t=>t.classList.toggle('is-on',t.dataset.tab===tab));
  document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('is-on',p.id==='pane-'+tab));
  document.querySelectorAll('#lnb a').forEach(a=>a.classList.toggle('is-cur',a.getAttribute('href')==='school-explore.html#'+tab));
  $('crumbL3').textContent=L3[tab];document.title=L3[tab]+' | 서울 진로진학 통합플랫폼';rerender();}
$('lnb').dataset.current=L3[(location.hash||'#types').slice(1)]||L3.types;
addEventListener('hashchange',()=>{setTab();scrollTo({top:document.querySelector('.ptabs').offsetTop-90,behavior:'smooth'});});
document.addEventListener('sen-auth',rerender);
/* ── 이벤트 ── */
document.addEventListener('click',e=>{
  const q=e.target.closest('[data-qa]');if(q){ans.push(+q.dataset.qa);renderQuiz();return;}
  if(e.target.closest('[data-qback]')){ans.pop();renderQuiz();return;}
  if(e.target.closest('[data-qreset]')){ans=[];renderQuiz();return;}
  const ft=e.target.closest('[data-findtype]');if(ft){EX.drawer.close();f.types=new Set([ft.dataset.findtype]);if(tab==='schools')renderSchools();return;}
  const ty=e.target.closest('[data-type]');if(ty){openType(ty.dataset.type);return;}
  const sv=e.target.closest('[data-ssave]');if(sv){if(!A.logged()){showToast('관심 고교 저장은 로그인 후 이용할 수 있어요');A.open();return;}const id=sv.dataset.ssave,i=SV.saved.indexOf(id);i>-1?SV.saved.splice(i,1):SV.saved.push(id);save();showToast(i>-1?'관심 고교에서 뺐어요':'관심 고교에 저장했어요');renderSchools();return;}
  const cm=e.target.closest('[data-scmp]');if(cm){const id=cm.dataset.scmp,i=SV.cmp.indexOf(id);if(i>-1)SV.cmp.splice(i,1);else{if(SV.cmp.length>=3){showToast('최대 3곳까지 비교할 수 있어요');return;}SV.cmp.push(id);}save();renderSchools();if(i===-1&&SV.cmp.length>=2)showToast('아래 비교표에 추가했어요');return;}
  const fb=e.target.closest('#fType [data-v]');if(fb){const v=fb.dataset.v;f.types.has(v)?f.types.delete(v):f.types.add(v);renderSchools();return;}
  const fc=e.target.closest('#fCoed [data-v]');if(fc){f.coed=fc.dataset.v;renderSchools();return;}
  const r=e.target.closest('[data-r]');if(r){round=r.dataset.r;renderAdm();return;}
  const sp=e.target.closest('[data-step]');if(sp){step=+sp.dataset.step;renderAdm();return;}
  const gr=e.target.closest('[data-sched]');if(gr){const s=SCHED.find(x=>x.name===gr.dataset.sched);showToast(`${s.name} · ${s.desc}`);return;}
});
$('fGu').addEventListener('change',e=>{f.gu=e.target.value;renderSchools();});
$('sSort').addEventListener('change',e=>{f.sort=e.target.value;renderSchools();});
$('sQ').addEventListener('input',e=>{f.q=e.target.value.trim();renderSchools();});
$('fReset').addEventListener('click',()=>{f.gu='';f.types.clear();f.coed='';f.q='';$('sQ').value='';renderSchools();});
setTab();
})();
