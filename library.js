(function(){
const {RES,GRADES,NOW_PICK,VIDEOS,EVENTS,TEACHER,PLAYLIST}=ND;const A=SEN_AUTH;const $=id=>document.getElementById(id);
const K='sen-lib-v1';let S=JSON.parse(localStorage.getItem(K)||'{"scrap":[],"applied":[]}');const save=()=>localStorage.setItem(K,JSON.stringify(S));
const GROUP={mid:'res',hs12:'res',hs3:'res',video:'media',briefing:'media',teacher:'media',guides:'guide',parents:'guide',ethics:'guide'};
const L3={mid:'중학생 자료',hs12:'고1·2 자료',hs3:'고3·졸업생 자료',video:'진로 영상',briefing:'진학 설명회',teacher:'교사 추천 자료',guides:'탐구·활동 작성 틀',parents:'학부모 가이드',ethics:'기록 윤리 안내'};
const L2={res:'맞춤 자료실',media:'영상·설명회 자료',guide:'작성 틀·안내'};
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
/* ── 작성 틀·안내 ── */
const RGF=[['mot','동기','왜 이 주제였나요? (수업·책·경험에서 시작)'],['q','질문','답할 수 있는 크기로 좁힌 질문 한 개'],['mth','방법','무엇을 어떻게 조사·실험·비교했나요?'],['ev','근거','찾은 자료와 결과. 출처를 함께'],['lim','한계','이 방법으로 알 수 없는 것, 다음 질문']];
function renderGuides(){const d=JSON.parse(localStorage.getItem('sen-report-v1')||'{}');
  $('guidesBody').innerHTML=`<div class="rbar" style="margin-top:0"><div><h2 class="section__title" style="font-size:24px">탐구보고서 작성 틀</h2><p class="section__sub">동기 → 질문 → 방법 → 근거 → 한계. 분량이 짧아도 이 다섯 단계가 있으면 검증 가능한 글이 돼요</p></div><button class="btn btn--ghost btn--pill" data-dl="탐구보고서 작성 틀" data-ext="HWP">틀 내려받기</button></div>
  <div class="ud" style="margin-top:18px"><div class="panel-c" style="border:1px solid var(--line);box-shadow:none"><h3>온라인으로 작성하기</h3>${RGF.map(f=>`<label class="fld">${f[1]}<textarea class="memo" data-rg="${f[0]}" placeholder="${f[2]}" style="min-height:64px">${d[f[0]]||''}</textarea></label>`).join('')}<div style="display:flex;gap:8px"><button class="btn btn--primary btn--pill" id="rgSave">임시 저장</button><button class="btn btn--ghost btn--pill" data-toast="작성한 내용을 파일로 내려받습니다">파일로 내보내기</button></div><p class="hint" style="margin:0">이 기기에만 저장돼요. 완성본은 수업 담당 선생님과 공유하세요 — 생기부는 선생님이 관찰한 것을 적는 문서라, 탐구 과정을 적극적으로 공유하는 게 중요해요.</p></div>
  <div><div class="panel-c" style="background:var(--surface);box-shadow:none"><h3>단계별 팁</h3><ul class="reading"><li><b>질문 좁히기</b>관찰 대상·비교 기준·자료 범위를 좁히면 답할 수 있는 질문이 돼요</li><li><b>근거 ≠ 결론</b>결과가 예상과 달라도 좋아요. 왜 다른지가 다음 질문이 돼요</li><li><b>한계 쓰기</b>한계를 정직하게 쓰면 오히려 사고 과정이 잘 보여요</li></ul></div>
  <div class="panel-c" style="margin-top:16px;border:1px solid var(--line);box-shadow:none"><h3>함께 쓰면 좋은 도구</h3><ul class="reading"><li><b>활동 성장 노트</b>계기·질문·과정·변화·다음 5문장 기록 <a class="link" href="my.html#notes">바로가기 ›</a></li><li><b>60초 설명 연습</b>탐구를 내 말로 설명하는 연습 <a class="link" href="strategy.html#interview">바로가기 ›</a></li></ul></div></div></div>`;}
function renderParents(){const d=JSON.parse(localStorage.getItem('sen-parent-v1')||'{}');
  const QC=[['성적 왜 이렇게 떨어졌어?','이번 시험에서 제일 아쉬운 과목은 뭐고, 다음에 뭘 바꿔볼 생각이야?'],['이 활동 생기부에 도움 돼?','그 활동 하면서 제일 궁금했던 게 뭐였어?'],['진로 아직도 못 정했어?','요즘 어떤 문제를 보면 더 알고 싶어져?'],['그 책 다 읽었어?','그 책에서 생각이 바뀐 부분이 있었어?'],['동아리에서 뭐 했어?','동아리에서 네 역할은 뭐였고, 어려웠던 건 어떻게 풀었어?'],['이 과목 왜 골랐어?','그 과목 수업에서 요즘 무슨 질문이 생겼어?']];
  $('parentsBody').innerHTML=`<div class="rbar" style="margin-top:0"><div><h2 class="section__title" style="font-size:24px">학부모 질문 카드</h2><p class="section__sub">부모는 기록을 평가하는 사람이 아니라, 아이가 자기 경험을 설명하도록 묻는 사람이에요</p></div></div>
  <div class="preview" style="margin-top:18px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">${QC.map(q=>`<div style="display:flex;flex-direction:column;gap:6px"><span style="font-size:13px;color:#C43B3B;text-decoration:line-through">${q[0]}</span><b>💬 ${q[1]}</b></div>`).join('')}</div>
  <div class="ud" style="margin-top:24px"><div class="panel-c" style="border:1px solid var(--line);box-shadow:none"><div class="panel-c__head"><h3>월간 정리 문장</h3><small>한 달에 세 칸</small></div><p style="margin:0;color:var(--ink-2);font-size:14.5px">이번 달 아이를 관찰한 것을 세 문장으로만 남겨요.</p><label class="fld">이번 달 아이가 관심을 보인 것<input class="gsel" style="width:100%;text-align:left" data-pm="a" value="${d.a||''}" placeholder="예: 통계 그래프 만드는 일"></label><label class="fld">아이가 어려워한 것<input class="gsel" style="width:100%;text-align:left" data-pm="b" value="${d.b||''}" placeholder="예: 수학 시험 시간 부족"></label><label class="fld">내가 도운 방법 (혐다·고친다가 아니라)<input class="gsel" style="width:100%;text-align:left" data-pm="c" value="${d.c||''}" placeholder="예: 설명을 끝까지 들었다"></label><button class="btn btn--primary btn--pill" id="pmSave" style="align-self:flex-start">저장</button></div>
  <div><div class="panel-c" style="background:var(--surface);box-shadow:none"><h3>보호자가 볼 수 있는 것</h3><ul class="reading"><li><b>아이가 허락한 항목만</b>검사 결과·관심 목록·계획 등, 활동 노트는 아이가 공유 표시한 것만 열람할 수 있어요</li><li><b>함께 정하는 것</b>수시 카드의 등록 의사와 위험 감수 수준은 가족이 같은 사실을 놓고 합의해요</li><li><b>연결하기</b><a class="link" href="my.html#parent">나의 진로진학 → 학부모 연결</a>에서 아이가 연결을 시작해요</li></ul></div>
  <div class="panel-c" style="margin-top:16px;border:1px solid var(--line);box-shadow:none"><h3>이번 학기 질문 3개</h3><p style="margin:0;color:var(--ink-2);font-size:14.5px">자녀 학년 기준의 질문 3개는 <a class="link" href="my.html#roadmap">학년별 로드맵(학부모용)</a>에서 보여드려요.</p></div></div></div>`;}
function renderEthics(){
  $('ethicsBody').innerHTML=`<div class="rbar" style="margin-top:0"><div><h2 class="section__title" style="font-size:24px">기록 윤리 안내</h2><p class="section__sub">대필·과장·표절은 전략이 아니라 신뢰의 문제예요</p></div></div>
  <div class="ud" style="margin-top:18px"><div class="panel-c" style="border:1px solid var(--line);box-shadow:none"><h3>하지 말아야 할 것</h3><ul class="reading"><li><b>대필·대리 작성</b>타인이 써 준 탐구·자료는 면접에서 바로 드러나고, 적발 시 불이익이 커요</li><li><b>과장·허위</b>하지 않은 활동을 부풀리면 기록 전체의 신뢰가 무너져요</li><li><b>표절</b>자료를 쓰면 출처를 남기고, 인용과 내 생각을 구분해요</li><li><b>공동 작업 무임승차</b>역할과 기여를 기록해 내 몶을 설명할 수 있게 해요</li></ul></div>
  <div class="panel-c" style="border:1px solid var(--line);box-shadow:none"><h3>AI 도구 사용</h3><ul class="reading"><li><b>학교 규정 먼저</b>과제·수행평가의 AI 사용 허용 범위는 학교와 교과 선생님 지침을 먼저 확인해요</li><li><b>보조 도구로</b>아이디어 탐색·자료 찾기에 쓰되, 글은 내가 쓰고 사용 사실을 밝혀요</li><li><b>이 플랫폼의 AI</b>정보 안내만 하고 판정하지 않으며, 내 글을 대신 써주지 않아요</li></ul></div></div>
  <div class="panel-c" style="margin-top:20px;background:var(--surface);box-shadow:none"><h3>대입 반영 기준은 공식 문서로만 확인하세요</h3><p style="margin:0;color:var(--ink-2);font-size:14.5px">학교폭력 조치사항의 전형 반영, 학생부 미반영 항목 같은 기준은 해마다 바뀔 수 있어요. 이 화면은 요약하지 않고 원문 링크만 안내해요.</p><div class="lchips" style="margin-top:10px"><a href="https://www.kcue.or.kr" target="_blank" rel="noopener">대교협 · 2028학년도 대입전형 기본사항 ↗</a><a href="https://www.moe.go.kr" target="_blank" rel="noopener">교육부 · 학생부 기재요령 ↗</a><a href="https://www.adiga.kr" target="_blank" rel="noopener">어디가 · 대학별 모집요강 ↗</a></div></div>`;}
/* ── 탭 ── */
let tab='mid';
function rerender(){const g=GROUP[tab];
  $('ptabs').innerHTML=Object.keys(L3).filter(k=>GROUP[k]===g).map(k=>`<a class="ptab${k===tab?' is-on':''}" href="#${k}">${L3[k]}</a>`).join('');
  document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('is-on',p.id==='pane-'+(g==='res'?'res':tab)));
  $('crumbL2').textContent=L2[g];$('crumbL3').textContent=L3[tab];$('h1').textContent=L2[g];
  $('hdesc').textContent=g==='res'?'학년과 시기에 맞춘 진로·진학 자료를 찾아보고 내려받으세요. 스크랩한 자료는 나의 진로진학에 모입니다.':g==='guide'?'탐구보고서 틀, 학부모 질문 카드, 기록 윤리까지 — 직접 쓰고 묻는 데 필요한 틀과 안내를 모았습니다.':'진로 영상과 진학 설명회, 선생님이 추천한 자료를 한곳에서 봅니다.';
  if(g==='res')renderRes(tab);else if(g==='guide')({guides:renderGuides,parents:renderParents,ethics:renderEthics})[tab]();else({video:renderVideo,briefing:renderBrief,teacher:renderTeacher})[tab]();}
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
  if(c('#rgSave')){const d={};document.querySelectorAll('[data-rg]').forEach(t=>d[t.dataset.rg]=t.value.trim());localStorage.setItem('sen-report-v1',JSON.stringify(d));showToast('탐구보고서 초안을 임시 저장했어요');return;}
  if(c('#pmSave')){const d={};document.querySelectorAll('[data-pm]').forEach(t=>d[t.dataset.pm]=t.value.trim());localStorage.setItem('sen-parent-v1',JSON.stringify(d));showToast('월간 정리 문장을 저장했어요');return;}
});
$('resQ').addEventListener('input',e=>{f.q=e.target.value.trim();renderRes(tab);});
$('resSort').addEventListener('change',e=>{f.sort=e.target.value;renderRes(tab);});
EVENTS.forEach(ev=>{if(S.applied.includes(ev.id))ev.applied++;});
setTab();
})();
