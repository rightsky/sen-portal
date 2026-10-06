(function(){
const {SUBJECTS,PRE,NOT_OFFERED,SEMS,SEM_LABEL,CAT_REC,subj}=SC;const {MAJORS,major}=EX;const A=SEN_AUTH;const $=id=>document.getElementById(id);
const PKEY='sen-plan-v1';
let p=JSON.parse(localStorage.getItem(PKEY)||'null')||{major:'m2',sem:{'2-1':[],'2-2':[],'3-1':[],'3-2':[]},wish:[],submit:0,memo:''};
const save=()=>localStorage.setItem(PKEY,JSON.stringify(p));
const TYPES=['공통','일반','진로','융합'];const badge=t=>`<span class="tb tb--${TYPES.indexOf(t)}">${t}</span>`;
const G1=SUBJECTS.filter(s=>s.type==='공통');
const GROUPS=['전체','국어','수학','영어','사회','과학','정보','예술','교양'];
let active='2-1',pg='전체',pq='',recOnly=false;
const all=()=>SEMS.flatMap(k=>p.sem[k]);
const where=n=>SEMS.find(k=>p.sem[k].includes(n));
const recSet=()=>{const m=major(p.major);return new Set([...m.subjects,...(CAT_REC[m.cat]||[])].filter(subj));};
/* 점검 */
function checks(){const out=[],m=major(p.major),core=m.subjects.filter(subj),A_=all();
  /* 학생 화면은 '판정'하지 않고 '함께 살펴볼 점'만 모읍니다. 적정 과목 수·순서·누락 여부의 판단은 선생님 상담에서 합니다 */
  SEMS.forEach(k=>{const n=p.sem[k].length;if(n&&(n<4||n>7))out.push(['q',`${SEM_LABEL[k]}에 ${n}과목을 담았어요`,'학기별 과목 수가 적당한지 선생님과 함께 확인해 보세요']);});
  const ord=A_.filter(n=>PRE[n]&&(SEMS.indexOf(where(PRE[n]))===-1||SEMS.indexOf(where(PRE[n]))>=SEMS.indexOf(where(n))));
  if(ord.length)out.push(['q',`순서를 물어볼 과목 ${ord.length}개`,ord.map(n=>`${n} (${PRE[n]}와 이어지는 과목)`).join(', ')+' · 어느 학기에 듣는 게 좋을지 상담에서 확인하세요']);
  const miss=core.filter(x=>!A_.includes(x));if(miss.length)out.push(['q',`${m.name}에서 자주 권하는 과목 중 아직 담지 않은 것`,miss.join(', ')+' · 꼭 들어야 하는지는 선생님과 이야기해 보세요']);
  const no=A_.filter(x=>NOT_OFFERED.includes(x));if(no.length)out.push(['info',`우리 학교에 없는 과목 ${no.length}개`,`${no.join(', ')} → 공동교육과정·서울온라인학교로 들을 수 있어요. 신청 방법은 선생님께 문의하세요`]);
  const adv=A_.filter(x=>['진로','융합'].includes(subj(x).type)).length;out.push(['info',`진로·융합선택 ${adv}과목, 일반선택 ${A_.length-adv}과목`,'진로와 얼마나 이어지는 구성인지 상담에서 함께 봐요']);
  if(!out.some(c=>c[0]==='q'))out.unshift(['ok','특별히 걸리는 점은 없어 보여요','그래도 최종 확인은 선생님과 함께 하세요']);
  return out;}
/* 시뮬레이션 */
function renderSim(){
  $('majorSel').innerHTML=MAJORS.map(m=>`<option value="${m.id}"${p.major===m.id?' selected':''}>${m.name} (${m.cat})</option>`).join('');
  $('pGroups').innerHTML=GROUPS.map(g=>`<button class="fchip${pg===g?' is-on':''}" data-pg="${g}">${g}</button>`).join('');
  $('recOnly').classList.toggle('is-on',recOnly);
  const R=recSet(),A_=all();
  let L=SUBJECTS.filter(s=>s.type!=='공통'&&(pg==='전체'||s.group===pg)&&(!pq||s.name.includes(pq))&&(!recOnly||R.has(s.name)));
  L.sort((a,b)=>(R.has(b.name)-R.has(a.name))||(TYPES.indexOf(a.type)-TYPES.indexOf(b.type)));
  const wish=p.wish.filter(n=>!A_.includes(n));
  $('wishBox').innerHTML=wish.length?`<div class="wish"><b>과목 탐색에서 담아둔 과목</b><div>${wish.map(n=>`<button class="pal__it" draggable="true" data-add="${n}">${badge(subj(n).type)}${n}</button>`).join('')}</div></div>`:'';
  $('palette').innerHTML=L.map(s=>{const used=A_.includes(s.name);return `<button class="pal__it${used?' is-used':''}" draggable="${!used}" data-add="${s.name}"${used?' aria-disabled="true"':''}>${badge(s.type)}<span>${s.name}</span>${R.has(s.name)?'<i title="목표 학과 추천">★</i>':''}${NOT_OFFERED.includes(s.name)?'<i class="no" title="우리 학교 미개설">공동</i>':''}${used?`<small>${SEM_LABEL[where(s.name)].replace('학년 ','-').replace('학기','')}</small>`:''}</button>`;}).join('');
  $('g1').innerHTML=G1.map(s=>`<span>${s.name}</span>`).join('');
  $('board').innerHTML=SEMS.map(k=>{const L2=p.sem[k],n=L2.length,cls=n<4?'low':n>7?'high':'ok';return `<div class="sem${active===k?' is-active':''}" data-sem="${k}"><button class="sem__h" data-act="${k}"><b>${SEM_LABEL[k]}</b><span class="sem__n sem__n--${cls}">${n}과목 · ${n*4}학점</span></button><div class="sem__list">${L2.map(x=>`<div class="chipx" draggable="true" data-chip="${x}" data-from="${k}">${badge(subj(x).type)}<span>${x}</span>${NOT_OFFERED.includes(x)?'<i class="no">공동</i>':''}<button data-rm="${x}" aria-label="${x} 빼기">✕</button></div>`).join('')||'<p class="sem__empty">왼쪽에서 과목을 눌러 담거나<br>끌어다 놓으세요</p>'}</div></div>`;}).join('');
  const C=checks(),w=C.filter(c=>c[0]==='q').length;
  $('simChecks').innerHTML=`<div class="ck__sum"><b>${w?`선생님과 함께 살펴볼 점 ${w}개`:'함께 살펴볼 점이 정리되었어요'}</b><span>총 ${A_.length}과목 · ${A_.length*4}학점 (2·3학년 선택과목)</span></div>`+C.map(c=>`<div class="ck ck--${c[0]}"><i>${c[0]==='ok'?'✓':c[0]==='q'?'?':'i'}</i><div><b>${c[1]}</b>${c[2]?`<span>${c[2]}</span>`:''}</div></div>`).join('');
}
function add(n,k){k=k||active;if(all().includes(n)){showToast(`${n}은(는) 이미 ${SEM_LABEL[where(n)]}에 있어요`);return;}if(p.sem[k].length>=8){showToast('한 학기에 8과목까지 담을 수 있어요');return;}p.sem[k].push(n);p.submit=p.submit>=1?0:p.submit;save();renderSim();}
function move(n,from,to){if(from===to)return;p.sem[from]=p.sem[from].filter(x=>x!==n);p.sem[to].push(n);save();renderSim();}
/* 이수계획 */
function renderPlan(){const groups=[...new Set(SUBJECTS.map(s=>s.group))];const A_=all();
  $('planTable').innerHTML=`<div class="ctable-w"><table class="ctable ptbl"><thead><tr><th>교과군</th><th>1학년 (공통)</th>${SEMS.map(k=>`<th>${SEM_LABEL[k]}</th>`).join('')}<th>학점</th></tr></thead><tbody>${groups.map(g=>{const g1=G1.filter(s=>s.group===g).map(s=>s.name),cells=SEMS.map(k=>p.sem[k].filter(x=>subj(x).group===g)),cr=(g1.length+cells.flat().length)*4;return `<tr><th>${g}</th><td>${g1.join('<br>')||'–'}</td>${cells.map(c=>`<td>${c.map(x=>`<div>${x}</div>`).join('')||'–'}</td>`).join('')}<td><b>${cr}</b></td></tr>`;}).join('')}<tr><th>합계</th><td><b>${G1.length*4}</b></td>${SEMS.map(k=>`<td><b>${p.sem[k].length*4}</b></td>`).join('')}<td><b>${(G1.length+A_.length)*4}</b></td></tr></tbody></table></div>`;
  const by={};A_.forEach(x=>{const g=subj(x).group;by[g]=(by[g]||0)+4;});const mx=Math.max(4,...Object.values(by));
  $('planBars').innerHTML=Object.keys(by).length?Object.entries(by).sort((a,b)=>b[1]-a[1]).map(([g,v])=>`<div class="bar is-top" style="grid-template-columns:56px 1fr 52px"><span>${g}</span><div class="bar__track"><div class="bar__fill" style="width:${v/mx*100}%"></div></div><span class="bar__val">${v}학점</span></div>`).join(''):'<p class="hint">아직 담은 선택과목이 없어요. <a class="link" href="#sim">시뮬레이션에서 과목 담기 ›</a></p>';
  const tc={};A_.forEach(x=>{const t=subj(x).type;tc[t]=(tc[t]||0)+1;});
  $('planTypes').innerHTML=['일반','진로','융합'].map(t=>`<div><dt>${t}선택</dt><dd>${tc[t]||0}과목</dd></div>`).join('')+`<div><dt>목표 학과</dt><dd style="font-size:14px">${major(p.major).name}</dd></div>`;
}
/* 점검·상담 */
const FLOW=['작성 중','선생님께 제출','선생님 확인 중','피드백 도착'];let fT;
function renderCheck(){const C=checks();
  $('ckList').innerHTML=C.map(c=>`<div class="ck ck--${c[0]}"><i>${c[0]==='ok'?'✓':c[0]==='q'?'?':'i'}</i><div><b>${c[1]}</b>${c[2]?`<span>${c[2]}</span>`:''}</div></div>`).join('');
  $('flow').innerHTML=FLOW.map((x,i)=>`<div class="fl${i<=p.submit?' is-on':''}${i===p.submit?' is-cur':''}"><i>${i<p.submit?'✓':i+1}</i><span>${x}</span></div>`).join('');
  $('memo').value=p.memo||'';$('memo').disabled=p.submit>0&&p.submit<3;
  $('btnSubmit').textContent=p.submit===0?'선생님께 계획 보내기':p.submit<3?'선생님이 확인하고 있어요…':'수정해서 다시 보내기';$('btnSubmit').disabled=p.submit>0&&p.submit<3;
  $('fb').innerHTML=p.submit===3?`<div class="fb"><div class="fb__who"><span class="avatar" style="width:44px;height:44px;font-size:16px">이</span><div><b>이진로 선생님</b><small>2학년 진로 담당 · 방금</small></div></div><p>${major(p.major).name}을 목표로 세운 계획 잘 받았어요. ${C.filter(c=>c[0]==='q').length?'살펴볼 점으로 표시된 부분은 상담 때 성적과 생활기록부를 함께 보면서 정해요.':'상담 때 계획과 성적을 함께 보고 다음 단계를 정해요.'} 상담 예약을 잡아 주세요.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn--primary btn--pill" href="counsel.html#book">선생님과 상담 예약</a><a class="btn btn--ghost btn--pill" href="#sim">계획 고치기</a></div></div>`:'';
}
function submit(){p.memo=$('memo').value;p.submit=1;save();renderCheck();showToast('선생님께 학업설계를 보냈어요');clearTimeout(fT);fT=setTimeout(()=>{p.submit=2;save();renderCheck();fT=setTimeout(()=>{p.submit=3;save();renderCheck();showToast('선생님 답장이 도착했어요');},1800);},1400);}
/* 탭·로그인 */
let tab='sim';const L3={sim:'과목 선택 시뮬레이션',plan:'학년별 이수계획',check:'계획 점검·교사와 상담'};
function rerender(){const on=A.logged();$('gateBox').innerHTML=on?'':A.gate('🔒','나의 학업설계는 로그인 후 이용할 수 있어요','내 학교 개설과목과 목표 학과를 바탕으로 계획을 만들고, 저장한 계획을 선생님께 보내 점검받을 수 있습니다.');$('gateWrap').style.display=on?'none':'';$('planWrap').style.display=on?'':'none';if(!on)return;({sim:renderSim,plan:renderPlan,check:renderCheck})[tab]();}
function setTab(){tab=(location.hash||'#sim').slice(1);if(!L3[tab])tab='sim';
  document.querySelectorAll('.ptab').forEach(t=>t.classList.toggle('is-on',t.dataset.tab===tab));
  document.querySelectorAll('.pane').forEach(x=>x.classList.toggle('is-on',x.id==='pane-'+tab));
  document.querySelectorAll('#lnb a').forEach(a=>a.classList.toggle('is-cur',a.getAttribute('href')==='study-plan.html#'+tab));
  $('crumbL3').textContent=L3[tab];document.title=L3[tab]+' | 서울 진로진학 통합플랫폼';rerender();}
$('lnb').dataset.current=L3[(location.hash||'#sim').slice(1)]||L3.sim;
addEventListener('hashchange',()=>{setTab();scrollTo({top:document.querySelector('.ptabs').offsetTop-90,behavior:'smooth'});});
document.addEventListener('sen-auth',rerender);
document.addEventListener('click',e=>{
  const ad=e.target.closest('[data-add]');if(ad&&!ad.classList.contains('is-used')){add(ad.dataset.add);return;}
  const rm=e.target.closest('[data-rm]');if(rm){const n=rm.dataset.rm;SEMS.forEach(k=>p.sem[k]=p.sem[k].filter(x=>x!==n));save();renderSim();return;}
  const ac=e.target.closest('[data-act]');if(ac){active=ac.dataset.act;renderSim();return;}
  const se=e.target.closest('.sem');if(se&&!e.target.closest('.chipx')){active=se.dataset.sem;renderSim();return;}
  const g=e.target.closest('[data-pg]');if(g){pg=g.dataset.pg;renderSim();return;}
});
$('recOnly').addEventListener('click',()=>{recOnly=!recOnly;renderSim();});
$('palQ').addEventListener('input',e=>{pq=e.target.value.trim();renderSim();});
$('majorSel').addEventListener('change',e=>{p.major=e.target.value;save();renderSim();showToast(`목표 학과를 ${major(p.major).name}(으)로 바꿨어요 · ★ 추천 과목이 달라집니다`);});
$('btnAuto').addEventListener('click',()=>{const m=major(p.major),list=[...m.subjects,...(CAT_REC[m.cat]||[])].filter((x,i,a)=>subj(x)&&a.indexOf(x)===i);
  PRE_ADD:{list.slice().forEach(n=>{if(PRE[n]&&!list.includes(PRE[n]))list.push(PRE[n]);});}
  const out={'2-1':[],'2-2':[],'3-1':[],'3-2':[]},used=()=>Object.values(out).flat();
  const gen=list.filter(n=>subj(n).type==='일반'),adv=list.filter(n=>subj(n).type!=='일반');
  const nextIn=(ks,n)=>{const pre=PRE[n],pi=pre?SEMS.indexOf(SEMS.find(k=>out[k].includes(pre))):-1;const c=ks.filter(k=>SEMS.indexOf(k)>pi&&out[k].length<6);return c.sort((x,y)=>out[x].length-out[y].length)[0]||SEMS.filter(k=>SEMS.indexOf(k)>pi).pop()||'3-2';};
  gen.sort((x,y)=>(PRE[x]?1:0)-(PRE[y]?1:0)).forEach(n=>out[nextIn(['2-1','2-2'],n)].push(n));
  adv.forEach(n=>out[nextIn(['3-1','3-2','2-2'],n)].push(n));
  const FILL={'2-1':['문학','영어Ⅰ','사회와 문화','세계사','대수'],'2-2':['화법과 언어','영어Ⅱ','현대사회와 윤리','독서와 작문','확률과 통계'],'3-1':['주제 탐구 독서','영어 독해와 작문','윤리와 사상','심화 영어','문학과 영상'],'3-2':['매체 의사소통','영어 발표와 토론','독서 토론과 글쓰기','사회문제 탐구','실용 통계']};
  SEMS.forEach(k=>{for(const n of FILL[k]){if(out[k].length>=5)break;if(!used().includes(n))out[k].push(n);}});
  p.sem=out;save();renderSim();showToast(m.name+' 추천 과목으로 채웠어요 · 자유롭게 고쳐보세요');});
$('btnClear').addEventListener('click',()=>{if(!all().length)return;p.sem={'2-1':[],'2-2':[],'3-1':[],'3-2':[]};save();renderSim();showToast('계획을 비웠어요');});
$('btnSubmit').addEventListener('click',submit);
$('memo').addEventListener('input',e=>{p.memo=e.target.value;save();});
/* 드래그 앤 드롭 */
let drag=null;
document.addEventListener('dragstart',e=>{const a=e.target.closest('[data-add],[data-chip]');if(!a)return;drag=a.dataset.chip?{n:a.dataset.chip,from:a.dataset.from}:{n:a.dataset.add};e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',drag.n);});
document.addEventListener('dragover',e=>{const s=e.target.closest('.sem');if(s&&drag){e.preventDefault();document.querySelectorAll('.sem').forEach(x=>x.classList.toggle('is-over',x===s));}});
document.addEventListener('dragleave',e=>{if(!e.relatedTarget||!e.relatedTarget.closest||!e.relatedTarget.closest('.sem'))document.querySelectorAll('.sem').forEach(x=>x.classList.remove('is-over'));});
document.addEventListener('drop',e=>{const s=e.target.closest('.sem');document.querySelectorAll('.sem').forEach(x=>x.classList.remove('is-over'));if(!s||!drag)return;e.preventDefault();drag.from?move(drag.n,drag.from,s.dataset.sem):add(drag.n,s.dataset.sem);drag=null;});
document.addEventListener('dragend',()=>{drag=null;document.querySelectorAll('.sem').forEach(x=>x.classList.remove('is-over'));});
setTab();
})();
