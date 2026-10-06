(function(){
const {RES,GRADES,NOW_PICK,VIDEOS,EVENTS,TEACHER,PLAYLIST}=ND;const A=SEN_AUTH;const $=id=>document.getElementById(id);
const K='sen-lib-v1';let S=JSON.parse(localStorage.getItem(K)||'{"scrap":[],"applied":[]}');const save=()=>localStorage.setItem(K,JSON.stringify(S));
const GROUP={mid:'res',hs12:'res',hs3:'res',video:'media',briefing:'media',teacher:'media'};
const L3={mid:'중학생 자료',hs12:'고1·2 자료',hs3:'고3·졸업생 자료',video:'진로 영상',briefing:'진학 설명회',teacher:'교사 추천 자료'};
const L2={res:'맞춤 자료실',media:'영상·설명회 자료'};
const ICON={'자료집':'📘','안내서':'📗','가이드북':'📙','동영상':'🎬','워크시트':'📝'};
const needLogin=msg=>{if(A.logged())return false;showToast(msg);A.open();return true;};
/* ── 맞춤 자료실 ── */
const f={type:'',season:'',q:'',sort:'new'};
function renderRes(g){
  const pick=NOW_PICK[g].map(id=>RES.find(r=>r.id===id));
  $('resHead').innerHTML=`<div class="rbar" style="margin-top:0"><div><h2 class="section__title" style="font-size:24px">${GRADES[g]} 자료</h2><p class="section__sub">${A.logged()&&g==='hs12'?'✅ 김서울 님(고2) 학년에 맞춘 자료입니다':'학년과 시기에 맞춘 진로·진학 자료입니다'}</p></div></div>`;
  $('resNow').innerHTML=`<h3 class="lib__h">📌 10월, 지금 보면 좋은 자료</h3><div class="now">${pick.map((r,i)=>`<button class="now__c${i?'':' is-1'}" data-res="${r.id}"><span>${ICON[r.type]} ${r.type}</span><b>${r.title}</b><small>${r.src==='센터'?'서울진로진학정보센터':'쎈(SEN)진학 나침판'} · ${r.d}</small></button>`).join('')}</div>`;
  const types=[...new Set(RES.map(r=>r.type))],seasons=['학년초','1학기','여름','2학기','겨울'];
  $('resF').innerHTML=`<div class="fchips">${['',...types].map(t=>`<button class="fchip${f.type===t?' is-on':''}" data-ft="${t}">${t||'전체 유형'}</button>`).join('')}</div><div class="fchips">${['',...seasons].map(t=>`<button class="fchip${f.season===t?' is-on':''}" data-fs="${t}">${t||'전체 시기'}</button>`).join('')}</div>`;
  let L=RES.filter(r=>r.g===g&&(!f.type||r.type===f.type)&&(!f.season||r.season===f.season)&&(!f.q||(r.title+r.desc).includes(f.q)));
  L.sort((a,b)=>f.sort==='pop'?b.views-a.views:b.d.localeCompare(a.d));
  $('resCnt').innerHTML=`자료 <em>${L.length}</em>건`;
  $('resList').innerHTML=L.length?L.map(r=>{const sc=S.scrap.includes(r.id);return `<li class="row"><span class="row__ic">${ICON[r.type]}</span><button class="row__main" data-res="${r.id}"><b>${r.title}</b><span>${r.type} · ${r.season} · ${r.src==='센터'?'서울진로진학정보센터':'쎈(SEN)진학 나침판'} · ${r.d} · 조회 ${r.views.toLocaleString()}</span></button><div class="row__files">${r.files.map(x=>`<button class="file" data-dl="${r.title}" data-ext="${x}">${x}</button>`).join('')}</div><button class="save${sc?' is-on':''}" data-scrap="${r.id}" aria-label="스크랩">${sc?'❤️':'🤍'}</button></li>`;}).join(''):`<li class="empty-r"><b>조건에 맞는 자료가 없어요</b>필터를 바꿔보세요.</li>`;
  $('scrapN').textContent=S.scrap.length;
}
function openRes(id){const r=RES.find(x=>x.id===id),sc=S.scrap.includes(id);
  EX.drawer.open(`<div class="dh"><small>${GRADES[r.g]} · ${r.type}</small><h2>${r.title}</h2><p>${r.desc}</p></div>
  <div class="dact">${r.files.map(x=>`<button class="btn btn--primary btn--pill" data-dl="${r.title}" data-ext="${x}">${x} 내려받기</button>`).join('')}<button class="btn btn--ghost btn--pill" data-scrap="${id}" data-redraw="${id}">${sc?'❤️ 스크랩됨':'🤍 스크랩'}</button></div>
  <div class="prev">${r.type==='동영상'?'<span>▶</span>영상 미리보기':'<span>📄</span>문서 미리보기 (1/24쪽)'}</div>
  <dl class="dgrid" style="margin-top:18px"><div><dt>출처</dt><dd style="font-size:14px">${r.src==='센터'?'서울진로진학정보센터':'쎈(SEN)진학 나침판'}</dd></div><div><dt>등록일</dt><dd>${r.d}</dd></div><div><dt>추천 시기</dt><dd>${r.season}</dd></div><div><dt>조회</dt><dd>${r.views.toLocaleString()}</dd></div></dl>
  <p class="dsrc">※ 자료 목록 구성은 예시입니다 · 실제 파일은 각 기관 게시판에서 제공됩니다</p>`);}
/* ── 진로 영상 ── */
let vcat='전체',vidx=1;
function renderVideo(){const cats=['전체',...new Set(VIDEOS.map(v=>v[0]))];
  $('vPlayer').innerHTML=`<iframe src="https://www.youtube.com/embed/videoseries?list=${PLAYLIST}&index=${vidx}" title="쎈진학TV" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  $('vCats').innerHTML=cats.map(c=>`<button class="fchip${vcat===c?' is-on':''}" data-vc="${c}">${c}</button>`).join('');
  $('vList').innerHTML=VIDEOS.map((v,i)=>[v,i]).filter(([v])=>vcat==='전체'||v[0]===vcat).map(([v,i])=>`<button class="vit${vidx===i+1?' is-on':''}" data-vi="${i+1}"><span class="vit__th">▶</span><div><small>${v[0]}</small><b>${v[1]}</b></div></button>`).join('');}
/* ── 진학 설명회 ── */
let et='전체';const ST={open:['접수 중','ok'],full:['마감','full'],soon:['접수 예정','soon'],done:['종료 · 다시보기','done']};
function renderBrief(){
  $('eTabs').innerHTML=['전체','중3','고1·2','고3'].map(t=>`<button class="fchip${et===t?' is-on':''}" data-et="${t}">${t}</button>`).join('');
  const L=EVENTS.filter(e=>et==='전체'||e.target===et).sort((a,b)=>a.date.localeCompare(b.date));
  $('eList').innerHTML=L.map(e=>{const d=new Date(e.date),ap=S.applied.includes(e.id),pct=e.cap?Math.round(e.applied/e.cap*100):0,[lab,cls]=ST[e.status];
    return `<article class="ev"><div class="ev__d"><b>${d.getMonth()+1}.${String(d.getDate()).padStart(2,'0')}</b><span>${'일월화수목금토'[d.getDay()]}요일 ${e.time}</span></div><div class="ev__m"><div class="ev__tags"><span class="st st--${cls}">${lab}</span><span class="tb tb--1">${e.target}</span>${ap?'<span class="st st--ok">✓ 신청 완료</span>':''}</div><h3>${e.title}</h3><p>📍 ${e.place}</p>${e.cap?`<div class="cap"><div class="score__t"><div class="score__f" style="width:${pct}%;${pct>=100?'background:#C43B3B':''}"></div></div><span>${e.applied}/${e.cap}명</span></div>`:''}</div><div class="ev__a">${e.status==='open'?(ap?`<button class="btn btn--ghost btn--pill" data-cancel="${e.id}">신청 취소</button>`:`<button class="btn btn--primary btn--pill" data-apply="${e.id}">신청하기</button>`):e.status==='done'?`<button class="btn btn--ghost btn--pill" data-tab-go="video">다시보기</button>`:e.status==='soon'?`<button class="btn btn--ghost btn--pill" data-notify="${e.id}">🔔 접수 알림</button>`:`<button class="btn btn--ghost btn--pill" disabled>정원 마감</button>`}</div></article>`;}).join('');
}
/* ── 교사 추천 ── */
let tMine=false;
function renderTeacher(){$('tMine').classList.toggle('is-on',tMine);
  const L=TEACHER.filter(t=>!tMine||t.mine);
  $('tList').innerHTML=(tMine&&!A.logged())?A.gate('🏫','우리 학교 선생님 추천은 로그인 후 볼 수 있어요','학생 정보에 등록된 학교 선생님이 추천한 자료를 모아 보여드립니다.'):L.map(t=>`<article class="tc"><div class="fb__who"><span class="avatar" style="width:44px;height:44px;font-size:16px">${t.t[0]}</span><div><b>${t.t} 선생님</b><small>${t.sch} · ${t.sub}${t.mine&&A.logged()?' · 우리 학교':''}</small></div><span class="tb tb--2" style="margin-left:auto">${t.for} 추천</span></div><p class="tc__note">“${t.note}”</p><button class="tc__res" data-res="${t.rid}">📎 ${t.title}<span>›</span></button></article>`).join('');}
/* ── 탭 ── */
let tab='mid';
function rerender(){const g=GROUP[tab];
  $('ptabs').innerHTML=Object.keys(L3).filter(k=>GROUP[k]===g).map(k=>`<a class="ptab${k===tab?' is-on':''}" href="#${k}">${L3[k]}</a>`).join('');
  document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('is-on',p.id==='pane-'+(g==='res'?'res':tab)));
  $('crumbL2').textContent=L2[g];$('crumbL3').textContent=L3[tab];$('h1').textContent=L2[g];
  $('hdesc').textContent=g==='res'?'학년과 시기에 맞춘 진로·진학 자료를 찾아보고 내려받으세요. 스크랩한 자료는 나의 진로진학에 모입니다.':'진로 영상과 진학 설명회, 선생님이 추천한 자료를 한곳에서 봅니다.';
  if(g==='res')renderRes(tab);else({video:renderVideo,briefing:renderBrief,teacher:renderTeacher})[tab]();}
function setTab(){tab=(location.hash||'#mid').slice(1);if(!L3[tab])tab=A.logged()?'hs12':'mid';
  document.querySelectorAll('#lnb a').forEach(a=>a.classList.toggle('is-cur',a.getAttribute('href')==='library.html#'+tab));document.title=L3[tab]+' | 서울 진로진학 통합플랫폼';rerender();}
if(!location.hash&&A.logged())history.replaceState(null,'','#hs12');
$('lnb').dataset.current=L3[(location.hash||'#mid').slice(1)]||L3.mid;
addEventListener('hashchange',()=>{setTab();scrollTo({top:document.querySelector('.ptabs').offsetTop-90,behavior:'smooth'});});
document.addEventListener('sen-auth',rerender);
document.addEventListener('click',e=>{
  const c=x=>e.target.closest(x);let b;
  if(b=c('[data-scrap]')){e.stopPropagation();if(needLogin('스크랩은 로그인 후 이용할 수 있어요'))return;const id=b.dataset.scrap,i=S.scrap.indexOf(id);i>-1?S.scrap.splice(i,1):S.scrap.push(id);save();showToast(i>-1?'스크랩을 취소했어요':'스크랩했어요 · 나의 진로진학에서도 볼 수 있어요');rerender();if(b.dataset.redraw)openRes(b.dataset.redraw);return;}
  if(b=c('[data-dl]')){e.stopPropagation();showToast(`${b.dataset.ext} 파일을 내려받습니다 · ${b.dataset.dl}`);return;}
  if(b=c('[data-res]')){openRes(b.dataset.res);return;}
  if(b=c('[data-ft]')){f.type=b.dataset.ft;rerender();return;}
  if(b=c('[data-fs]')){f.season=b.dataset.fs;rerender();return;}
  if(b=c('[data-vc]')){vcat=b.dataset.vc;renderVideo();return;}
  if(b=c('[data-vi]')){vidx=+b.dataset.vi;renderVideo();return;}
  if(b=c('[data-et]')){et=b.dataset.et;renderBrief();return;}
  if(b=c('[data-apply]')){if(needLogin('설명회 신청은 로그인 후 이용할 수 있어요'))return;const ev=EVENTS.find(x=>x.id===b.dataset.apply);S.applied.push(ev.id);ev.applied++;save();renderBrief();showToast(`'${ev.title}' 신청 완료 · 하루 전 알림을 보내드려요`);return;}
  if(b=c('[data-cancel]')){const ev=EVENTS.find(x=>x.id===b.dataset.cancel);S.applied=S.applied.filter(x=>x!==ev.id);ev.applied--;save();renderBrief();showToast('신청을 취소했어요');return;}
  if(b=c('[data-notify]')){if(needLogin('접수 알림은 로그인 후 받을 수 있어요'))return;showToast('접수가 시작되면 알림을 보내드려요');return;}
  if(b=c('[data-tab-go]')){location.hash='#'+b.dataset.tabGo;return;}
  if(c('#tMine')){tMine=!tMine;renderTeacher();return;}
});
$('resQ').addEventListener('input',e=>{f.q=e.target.value.trim();renderRes(tab);});
$('resSort').addEventListener('change',e=>{f.sort=e.target.value;renderRes(tab);});
EVENTS.forEach(ev=>{if(S.applied.includes(ev.id))ev.applied++;});
setTab();
})();
