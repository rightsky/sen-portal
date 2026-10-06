(function(){
const {SUBJECTS,PRE,NOT_OFFERED,OPEN,SEMS,SEM_LABEL,CAT_REC,subj}=SC;const {MAJORS,MAJOR_CATS,major}=EX;const A=SEN_AUTH;const $=id=>document.getElementById(id);
const PKEY='sen-plan-v1';const P=()=>JSON.parse(localStorage.getItem(PKEY)||'null')||{major:'m2',sem:{'2-1':[],'2-2':[],'3-1':[],'3-2':[]},wish:[],submit:0,memo:''};
const saveP=p=>localStorage.setItem(PKEY,JSON.stringify(p));
const GROUPS=['전체','국어','수학','영어','사회','과학','정보','예술','교양'];const TYPES=['공통','일반','진로','융합'];
const TINFO={'공통':['1학년','모든 학생이 함께 배우는 기초 과목'],'일반':['2학년~','교과의 기본 내용을 배우는 과목'],'진로':['2·3학년','진로에 맞춰 심화 내용을 배우는 과목'],'융합':['2·3학년','여러 교과를 엮거나 실생활에 적용하는 과목']};
const badge=t=>`<span class="tb tb--${TYPES.indexOf(t)}">${t}</span>`;
const f={g:'전체',t:new Set(),q:''};
/* ── 선택과목 알아보기 ── */
function renderSubjects(){
  $('sgTabs').innerHTML=GROUPS.map(g=>`<button class="tab${f.g===g?' is-on':''}" data-g="${g}">${g}</button>`).join('');
  $('stChips').innerHTML=TYPES.map(t=>`<button class="fchip${f.t.has(t)?' is-on':''}" data-t="${t}">${t}</button>`).join('');
  const L=SUBJECTS.filter(s=>(f.g==='전체'||s.group===f.g)&&(!f.t.size||f.t.has(s.type))&&(!f.q||(s.name+s.desc).includes(f.q)));
  $('subCnt').innerHTML=`과목 <em>${L.length}</em>개`;
  $('subGrid').innerHTML=L.length?L.map(s=>`<button class="sj" data-sj="${s.name}">${badge(s.type)}<b>${s.name}</b><span>${s.desc}</span><small>${s.group}${A.logged()&&NOT_OFFERED.includes(s.name)?' · <em>우리 학교 미개설</em>':''}</small></button>`).join(''):`<div class="empty-r" style="grid-column:1/-1"><b>찾는 과목이 없어요</b>다른 검색어를 입력해 보세요.</div>`;
}
function openSubj(n){const s=subj(n);if(!s)return;const pre=PRE[n],next=Object.keys(PRE).filter(k=>PRE[k]===n),ms=MAJORS.filter(m=>m.subjects.includes(n));
  const evalTxt=s.type==='공통'||s.type==='일반'?'성취도(A~E) + 석차 등급(5등급) 함께 표기':'성취도(A~E) 중심 표기 (일부 과목 예외)';
  const wish=A.logged()&&P().wish.includes(n);
  EX.drawer.open(`<div class="dh"><small>${s.group} · ${s.type}선택${s.type==='공통'?'':''}</small><h2>${n}</h2><p>${s.desc}</p></div>
  <div class="dact"><button class="btn ${wish?'btn--ghost':'btn--primary'} btn--pill" data-wish="${n}">${wish?'✓ 학업설계에 담김':'+ 학업설계에 담기'}</button></div>
  <div class="dsec"><h3>기본 정보</h3><dl class="dgrid"><div><dt>과목 유형</dt><dd>${s.type}${s.type==='공통'?'과목':'선택'}</dd></div><div><dt>학점</dt><dd>4학점 (±1 조정 가능)</dd></div><div><dt>배우는 시기</dt><dd>${TINFO[s.type][0]}</dd></div><div><dt>성적 표기</dt><dd style="font-size:13.5px">${evalTxt}</dd></div></dl></div>
  ${pre?`<div class="dsec"><h3>먼저 들으면 좋은 과목</h3><div class="lchips"><a href="#" data-sj="${pre}">${pre}</a></div></div>`:''}
  ${next.length?`<div class="dsec"><h3>이어서 들을 수 있는 과목</h3><div class="lchips">${next.map(x=>`<a href="#" data-sj="${x}">${x}</a>`).join('')}</div></div>`:''}
  ${ms.length?`<div class="dsec"><h3>이 과목이 도움이 되는 학과</h3><div class="lchips">${ms.map(m=>`<a href="jinro-major.html?open=${m.id}#find">${m.name}</a>`).join('')}</div></div>`:''}
  <div class="dsec"><h3>우리 학교 개설 여부</h3><p>${A.logged()?(NOT_OFFERED.includes(n)?'서울한빛고에는 개설되지 않았어요. 공동교육과정이나 서울온라인학교로 들을 수 있습니다.':'서울한빛고에서 들을 수 있어요'):'<a class="link" href="#" data-loginopen>로그인하면 우리 학교 개설 여부를 확인할 수 있어요 ›</a>'}</p></div>
  <p class="dsrc">※ 2022 개정 교육과정 과목 구조 기준 · 성적 표기 방식은 학년도별 안내를 확인하세요</p>`);}
/* ── 진로·전공별 관련 과목 ── */
let mSel='m2',mCat='전체';
function plan4(list){const out={'2-1':[],'2-2':[],'3-1':[],'3-2':[]};const ord=[...list].sort((a,b)=>(subj(a).type==='일반'?0:1)-(subj(b).type==='일반'?0:1));
  ord.forEach(n=>{const s=subj(n);let k=s.type==='일반'?0:2;if(PRE[n]){const pi=SEMS.findIndex(x=>out[x].includes(PRE[n]));if(pi>=k)k=Math.min(pi+1,3);}while(out[SEMS[k]].length>=3&&k<3)k++;out[SEMS[k]].push(n);});return out;}
function renderByMajor(){
  $('mCats').innerHTML=['전체',...MAJOR_CATS].map(c=>`<button class="fchip${mCat===c?' is-on':''}" data-mc="${c}">${c}</button>`).join('');
  $('mPick').innerHTML=MAJORS.filter(m=>mCat==='전체'||m.cat===mCat).map(m=>`<button class="fchip${mSel===m.id?' is-on':''}" data-m="${m.id}">${m.name}</button>`).join('');
  const m=major(mSel),core=m.subjects.filter(subj),rec=(CAT_REC[m.cat]||[]).filter(x=>!core.includes(x));
  const li=(n,k)=>{const s=subj(n);return `<li><button data-sj="${n}">${badge(s.type)}<b>${n}</b>${PRE[n]?`<small>← ${PRE[n]} 먼저</small>`:''}</button></li>`;};
  $('mResult').innerHTML=`<div class="mres__head"><div><small>${m.cat}계열</small><h3>${m.name}</h3><p>${m.desc}</p></div><a class="link" href="jinro-major.html?open=${m.id}#find">학과 정보 ›</a></div>
  <div class="mres__cols"><div><h4>핵심 과목 <span>${core.length}</span></h4><p>이 학과 공부에 직접 쓰이는 과목</p><ul class="mres__list">${core.map(li).join('')}</ul></div><div><h4>함께 들으면 좋은 과목 <span>${rec.length}</span></h4><p>${m.cat}계열 공통으로 권장하는 과목</p><ul class="mres__list">${rec.map(li).join('')}</ul></div></div>`;
  const pl=plan4([...core,...rec].slice(0,10));
  $('mRoad').innerHTML=SEMS.map(k=>`<div class="road__c"><b>${SEM_LABEL[k]}</b>${pl[k].map(n=>`<span>${n}</span>`).join('')||'<em>자유 선택</em>'}</div>`).join('');
  $('mRoadBtn').dataset.tpl=JSON.stringify(pl);
}
/* ── 우리 학교 개설과목 ── */
let semTab='2-1';
function renderMySchool(){
  if(!A.logged()){$('msBody').innerHTML=A.gate('🏫','우리 학교 개설과목은 로그인 후 볼 수 있어요','학생 정보에 등록된 학교의 학기별 개설 과목과, 학교에 없는 과목을 듣는 방법을 알려드립니다.');return;}
  $('msBody').innerHTML=`<div class="ms__head"><div><small>나의 학교 (예시)</small><h3>서울한빛고등학교</h3><p>2026학년도 교육과정 편성표 기준 · 2학년 학생에게 보이는 과목입니다</p></div><div class="ms__stat"><div><b>${SEMS.reduce((a,k)=>a+OPEN[k].length,0)}</b><span>개설 과목</span></div><div><b>${NOT_OFFERED.length}</b><span>미개설 과목</span></div></div></div>
  <div class="tabs" style="margin:22px 0 16px">${SEMS.map(k=>`<button class="tab${semTab===k?' is-on':''}" data-sem="${k}">${SEM_LABEL[k]}</button>`).join('')}</div>
  <div class="ms__grid">${OPEN[semTab].map(n=>{const s=subj(n);return `<button class="sj" data-sj="${n}">${badge(s.type)}<b>${n}</b><small>${s.group} · 4학점</small></button>`;}).join('')}</div>
  <h3 class="ms__sub">우리 학교에 없는 과목, 이렇게 들을 수 있어요</h3>
  <div class="ms__alt"><div class="ms__altc"><b>🤝 공동교육과정</b><p>가까운 학교들이 함께 과목을 열어 방과 후·주말에 듣습니다</p><div class="lchips">${NOT_OFFERED.slice(0,3).map(n=>`<span>${n}</span>`).join('')}</div><button class="btn btn--ghost btn--pill" data-toast="공동교육과정 수강 신청은 학교 담당 선생님 확인 후 진행됩니다">수강 신청 안내</button></div><div class="ms__altc"><b>💻 서울온라인학교</b><p>온라인 실시간 수업으로 듣고 학교 성적으로 인정받습니다</p><div class="lchips">${NOT_OFFERED.slice(3).map(n=>`<span>${n}</span>`).join('')}</div><button class="btn btn--ghost btn--pill" data-toast="서울온라인학교 수강 신청 화면으로 이동합니다">수강 신청 안내</button></div></div>`;
}
/* ── 탭 ── */
let tab='subjects';const L3={subjects:'선택과목 알아보기',bymajor:'진로·전공별 관련 과목',myschool:'우리 학교 개설과목'};
function rerender(){({subjects:renderSubjects,bymajor:renderByMajor,myschool:renderMySchool})[tab]();}
function setTab(){tab=(location.hash||'#subjects').slice(1);if(!L3[tab])tab='subjects';
  document.querySelectorAll('.ptab').forEach(t=>t.classList.toggle('is-on',t.dataset.tab===tab));
  document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('is-on',p.id==='pane-'+tab));
  document.querySelectorAll('#lnb a').forEach(a=>a.classList.toggle('is-cur',a.getAttribute('href')==='subject-explore.html#'+tab));
  $('crumbL3').textContent=L3[tab];document.title=L3[tab]+' | 서울 진로진학 통합플랫폼';rerender();}
$('lnb').dataset.current=L3[(location.hash||'#subjects').slice(1)]||L3.subjects;
addEventListener('hashchange',()=>{setTab();scrollTo({top:document.querySelector('.ptabs').offsetTop-90,behavior:'smooth'});});
document.addEventListener('sen-auth',rerender);
$('typeStrip').innerHTML=TYPES.map(t=>`<button class="tstrip" data-t="${t}">${badge(t)}<b>${t}${t==='공통'?'과목':'선택'}</b><span>${TINFO[t][1]}</span><small>${TINFO[t][0]}</small></button>`).join('');
document.addEventListener('click',e=>{
  const w=e.target.closest('[data-wish]');if(w){if(!A.logged()){showToast('학업설계는 로그인 후 이용할 수 있어요');A.open();return;}const p=P(),n=w.dataset.wish,i=p.wish.indexOf(n);i>-1?p.wish.splice(i,1):p.wish.push(n);saveP(p);showToast(i>-1?'담은 과목에서 뺐어요':'학업설계 > 과목 선택 시뮬레이션에 담았어요');openSubj(n);return;}
  const sj=e.target.closest('[data-sj]');if(sj){e.preventDefault();openSubj(sj.dataset.sj);return;}
  const g=e.target.closest('[data-g]');if(g){f.g=g.dataset.g;renderSubjects();return;}
  const t=e.target.closest('[data-t]');if(t){if(tab!=='subjects')location.hash='#subjects';f.t.has(t.dataset.t)?f.t.delete(t.dataset.t):f.t.add(t.dataset.t);renderSubjects();return;}
  const mc=e.target.closest('[data-mc]');if(mc){mCat=mc.dataset.mc;renderByMajor();return;}
  const m=e.target.closest('[data-m]');if(m){mSel=m.dataset.m;renderByMajor();return;}
  const sm=e.target.closest('[data-sem]');if(sm){semTab=sm.dataset.sem;renderMySchool();return;}
  if(e.target.closest('#mRoadBtn')){if(!A.logged()){showToast('시뮬레이션은 로그인 후 이용할 수 있어요');A.open();return;}const p=P();p.major=mSel;p.sem=JSON.parse(e.target.closest('#mRoadBtn').dataset.tpl);saveP(p);location.href='study-plan.html#sim';}
});
$('subQ').addEventListener('input',e=>{f.q=e.target.value.trim();renderSubjects();});
const qm=new URLSearchParams(location.search).get('major');if(qm&&major(qm))mSel=qm;
setTab();
})();
