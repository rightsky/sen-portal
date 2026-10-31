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
/* ── 10-30 (R01 R02) 로그인 학년에 맞춘 첫 화면 : 고등학생은 주소 없이 들어오면 과목 탐색으로 ── */
(function(){try{const g=A.logged()&&A.session&&A.session.person&&A.session.person.grade;if(!location.hash&&g&&/^고/.test(g)&&!sessionStorage.getItem('sen-se-stay')){sessionStorage.setItem('sen-se-stay','1');location.replace('subject-explore.html#subjects');}}catch(e){}})();
/* ── 10-31 (R01) 특성화고·마이스터고 학생 경로 : 전문교과(NCS) → 취업 · 선취업 후진학 · 대학 진학 ── */
function renderVoc(){const card=(ic,t,b,li)=>`<div class="panel-c" style="border:1px solid var(--line);box-shadow:none"><h3 style="margin:0 0 6px">${ic} ${t}</h3><p style="margin:0 0 8px;color:var(--ink-2)">${b}</p><ul class="reading" style="margin:0">${li.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
 $('vocBody').innerHTML=`<div class="rbar" style="margin-top:0" data-mk="6open up1030" data-mk-note="R01 : 특성화고·마이스터고 학생 경로 (NCS 전문교과 · 취업 · 선취업 후진학 · 재직자·특성화고 특별전형)"><div><h2 class="section__title" style="font-size:24px">특성화고·마이스터고 학생의 길</h2><p class="section__sub">전문교과를 배우고, 졸업 뒤에는 바로 취업 · 일하면서 진학 · 대학 진학 세 갈래로 나아가요</p></div></div>
 <div class="voc3 voc3--2">${card('🏭','학교에서 배우는 것','일반고 과목에 더해 직업 분야의 전문교과를 배워요.',['<b>NCS(국가직무능력표준)</b>에 맞춘 능력단위 · 실무 과목','직업기초능력 (의사소통·문제해결·정보 등)','국가기술자격 등 <b>자격증</b> 준비','현장실습 · 산학 연계 프로젝트'])}
 ${card('🏫','학교 유형','',['<b>특성화고</b> : 직업 분야별 학과 운영 (예 : 인공지능과·기계과·회계과)','<b>마이스터고</b> : 산업 수요에 맞춘 학과 · 취업 중심 교육과정','<b>일반고 직업계 위탁</b> : 일반고 학생이 직업교육 과정을 위탁으로 이수','학교마다 학과·지원 제도가 달라요 → 「학교 찾기·비교」에서 확인'])}</div>
 <h3 style="margin:26px 0 10px;font-size:19px">졸업 뒤 세 갈래</h3>
 <div class="voc3">${card('💼','① 바로 취업','배운 전공으로 일을 시작해요.',['학교 취업지원부 · 현장실습 연계 채용','공공기관·공기업 고졸 채용','기업 채용 공고와 자격증 요건 확인'])}
 ${card('🔁','② 일하면서 진학 (선취업 후진학)','일을 하면서 대학 공부를 이어가요.',['<b>특성화고 등을 졸업한 재직자 특별전형</b> : 정원 외 · 산업체 재직 경력 요건이 있어요 (기간은 대학마다 확인)','계약학과 · 사내대학 · 일학습병행','야간·주말 수업이 있는 학과도 있어요'])}
 ${card('🎓','③ 대학 진학','졸업 후 바로 대학에 진학해요.',['<b>특성화고교 출신자 특별전형</b> : 정원 외 · 고교 학과와 같은 계열 모집단위에 지원하는 경우가 많아요','일반 전형(수시·정시)으로도 지원할 수 있어요','동일 계열 기준표는 대학 모집요강에서 확인'])}</div>
 <div class="voc2"><div class="panel-c" style="border:1px solid var(--line);box-shadow:none"><h3>학년별 준비</h3><ul class="reading" style="margin:0"><li><b>1학년</b> 전공 기초 과목 · 기초 자격증 · 학과가 나와 맞는지 확인</li><li><b>2학년</b> 실무 과목 · 현장 체험 · 취업과 진학 중 방향 정하기</li><li><b>3학년</b> 현장실습 · 취업 준비 또는 특성화고 특별전형 원서 · 재직자 전형을 생각한다면 경력 요건 미리 확인</li></ul></div>
 <div class="panel-c" style="background:var(--surface);box-shadow:none"><h3>학생부에서 보여 줄 것</h3><ul class="reading" style="margin:0"><li>NCS 능력단위 이수 내역과 성취</li><li>자격증 · 현장실습 기록</li><li>전공과 이어진 프로젝트 · 동아리</li></ul><p class="hint" style="margin:8px 0 0">진로진학 AI 챗봇의 「학생부 읽기」에 NCS 이수 내역을 읽는 관점을 넣을 예정이에요 (R01)</p></div></div>
 <div class="band" style="margin-top:20px;padding:18px 22px"><div><b>전형 요건은 대학·학년도마다 달라요</b><p style="margin:4px 0 0">지원 전에 대학 모집요강을 꼭 확인하고, 학교 취업지원부·진로 선생님과 함께 정하세요</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn--ghost btn--pill" href="univ.html">대학·전형 찾기</a><a class="btn btn--primary btn--pill" href="counsel.html#guide">상담 안내</a></div></div>`;}
/* ── 탭 ── */
let tab='types';const L3={types:'고교 유형 알아보기',schools:'학교 찾기·비교',admission:'고입 전형·일정',voc:'특성화고·마이스터고 경로'};
function rerender(){({types:renderTypes,schools:renderSchools,admission:renderAdm,voc:renderVoc})[tab]();$('loginNote').innerHTML=A.logged()?'✅ '+(A.name||'김서울')+' 님 · 거주지 <b>종로구</b> 기준으로 통학 시간과 학교군을 보여드려요':'로그인하면 관심 고교를 저장하고, 우리 집 기준 통학 시간과 학교군을 볼 수 있어요 <a class="link" href="#" data-loginopen>로그인 ›</a>';}
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
