(function(){
const {SCHED,POLICY,NOTICE,FAQ}=ND;const A=SEN_AUTH;const $=id=>document.getElementById(id);
const K='sen-news-v1';let S=JSON.parse(localStorage.getItem(K)||'{"my":[]}');const save=()=>localStorage.setItem(K,JSON.stringify(S));
const GROUP={schedule:'news',policy:'news',notice:'news',guide:'help',center:'help',faq:'help'};
const L3={schedule:'입시 주요 일정',policy:'정책·전형 변화',notice:'공지사항',guide:'서비스 이용안내',center:'진로진학센터 안내',faq:'FAQ'};
const L2={news:'일정·소식',help:'이용안내'};
const TC={'중3':'a','고1·2':'b','고3':'c'};
const today=new Date(2026,9,2);
/* ── 일정 ── */
let ym=[2026,9],tg=A.logged()?'고1·2':'전체',selDay=null;
function renderSched(){
  $('sTg').innerHTML=['전체','중3','고1·2','고3'].map(t=>`<button class="fchip${tg===t?' is-on':''}" data-tg="${t}">${t}${A.logged()&&t==='고1·2'?' (내 학년)':''}</button>`).join('');
  const [y,m]=ym,first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();
  const ev=SCHED.filter(s=>tg==='전체'||s[1]===tg);
  const on=d=>ev.filter(s=>s[0]===`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`);
  $('calT').textContent=`${y}년 ${m+1}월`;
  let h='';for(let i=0;i<first;i++)h+='<div></div>';
  for(let d=1;d<=days;d++){const E=on(d),isT=y===2026&&m===9&&d===2,key=`${y}-${m}-${d}`;h+=`<button class="cd${isT?' is-today':''}${selDay===key?' is-sel':''}${E.length?' has':''}" data-day="${key}"><b>${d}</b>${E.map(s=>`<i class="dot dot--${TC[s[1]]}"></i>`).join('')}</button>`;}
  $('cal').innerHTML=h;
  const list=selDay?ev.filter(s=>{const[a,b,c]=selDay.split('-').map(Number);return s[0]===`${a}-${String(b+1).padStart(2,'0')}-${String(c).padStart(2,'0')}`;}):ev.filter(s=>new Date(s[0])>=today).slice(0,6);
  $('upT').textContent=selDay?`${selDay.split('-')[1]*1+1}월 ${selDay.split('-')[2]}일 일정`:'다가오는 일정';
  $('up').innerHTML=list.length?list.map(s=>{const d=new Date(s[0]),dd=Math.ceil((d-today)/864e5),my=S.my.includes(s[0]+s[2]);return `<li class="up"><div class="up__d"><b>${d.getMonth()+1}.${String(d.getDate()).padStart(2,'0')}</b><span>${dd>0?'D-'+dd:dd===0?'오늘':'지남'}</span></div><div class="up__m"><span class="tb tb--${{a:2,b:1,c:3}[TC[s[1]]]}">${s[1]}</span><b>${s[2]}</b></div><button class="mini${my?' is-on':''}" data-my="${s[0]+s[2]}">${my?'✓ 내 일정':'+ 내 일정'}</button></li>`;}).join(''):'<li class="hint">이 날은 일정이 없어요</li>';
}
/* ── 정책 ── */
let pw=A.logged()?'고1·2':'전체';
function renderPolicy(){
  $('pWho').innerHTML=['전체','중학생','고1·2','고3'].map(t=>`<button class="fchip${pw===t?' is-on':''}" data-pw="${t}">${t}${A.logged()&&t==='고1·2'?' (내 학년)':''}</button>`).join('');
  const L=POLICY.filter(p=>pw==='전체'||p.who.includes(pw)).sort((a,b)=>b.y-a.y);
  $('pList').innerHTML=L.map(p=>`<li class="pol"><span class="pol__y">${p.y}</span><div class="pol__c">${A.logged()&&p.who.includes('고1·2')?'<span class="st st--ok">나에게 해당</span>':''}<h3>${p.t}</h3><p>${p.b}</p><div class="ria">${p.tags.map(t=>`<span>${t}</span>`).join('')}<span style="background:var(--surface);color:var(--ink-2)">대상 · ${p.who.join(', ')}</span></div></div></li>`).join('');
}
/* ── 공지 ── */
let nc='전체',nq='',page=1;const PER=6;
function renderNotice(){
  $('nTabs').innerHTML=['전체','공지','안내','보도','상담'].map(t=>`<button class="tab${nc===t?' is-on':''}" data-nc="${t}">${t}</button>`).join('');
  const L=NOTICE.filter(n=>(nc==='전체'||n.c===nc)&&(!nq||n.t.includes(nq))).sort((a,b)=>(b.pin||0)-(a.pin||0)||b.d.localeCompare(a.d));
  const pages=Math.max(1,Math.ceil(L.length/PER));page=Math.min(page,pages);
  $('nList').innerHTML=L.slice((page-1)*PER,page*PER).map((n,i)=>`<li><button class="nrow${n.pin?' is-pin':''}" data-notice="${NOTICE.indexOf(n)}"><span class="nrow__no">${n.pin?'📌':L.length-((page-1)*PER+i)}</span><span class="nrow__c">${n.c}</span><b>${n.t}</b><span class="nrow__d">${n.d}</span><span class="nrow__v">${n.v.toLocaleString()}</span></button></li>`).join('')||'<li class="empty-r"><b>검색 결과가 없어요</b></li>';
  $('nPage').innerHTML=Array.from({length:pages},(_,i)=>`<button class="pg${page===i+1?' is-on':''}" data-pg="${i+1}">${i+1}</button>`).join('');
  $('nCnt').innerHTML=`전체 <em>${L.length}</em>건`;
}
function openNotice(i){const n=NOTICE[i];EX.drawer.open(`<div class="dh"><small>${n.c} · ${n.d} · 조회 ${n.v.toLocaleString()}</small><h2>${n.t}</h2></div><div class="dsec"><p>게시글 본문이 이곳에 표시됩니다. 첨부파일과 관련 링크, 문의처가 함께 안내됩니다.</p></div><div class="dsec"><h3>첨부파일</h3><div class="lchips"><a href="#" data-toast="첨부파일을 내려받습니다">${n.t.slice(0,14)}….pdf</a></div></div><p class="dsrc">※ 게시글 제목은 쎈(SEN)진학 나침판·서울진로진학정보센터 게시물을 참고했습니다 · 본문은 예시입니다</p>`);}
/* ── FAQ ── */
let fc='전체',fq='',openF=0;
function renderFaq(){
  $('fTabs').innerHTML=['전체',...new Set(FAQ.map(f=>f[0]))].map(t=>`<button class="fchip${fc===t?' is-on':''}" data-fc="${t}">${t}</button>`).join('');
  const L=FAQ.map((f,i)=>[f,i]).filter(([f])=>(fc==='전체'||f[0]===fc)&&(!fq||(f[1]+f[2]).includes(fq)));
  $('fList').innerHTML=L.length?L.map(([f,i])=>`<li class="faq${openF===i?' is-on':''}"><button class="faq__q" data-fq="${i}" aria-expanded="${openF===i}"><span>Q</span><b>${f[1]}</b><i>${openF===i?'−':'+'}</i></button><div class="faq__a"><p>${f[2]}</p><div class="faq__fb">도움이 되었나요? <button class="mini" data-help="y">👍 네</button><button class="mini" data-help="n">아니요</button></div></div></li>`).join(''):`<li class="empty-r"><b>찾는 질문이 없나요?</b><button class="btn btn--primary btn--pill" style="margin-top:12px" data-toast="이용 문의 작성 화면은 다음 단계에서 설계합니다">이용 문의 남기기</button></li>`;
}
/* ── 탭 ── */
let tab='schedule';
function rerender(){const g=GROUP[tab];
  $('ptabs').innerHTML=Object.keys(L3).filter(k=>GROUP[k]===g).map(k=>`<a class="ptab${k===tab?' is-on':''}" href="#${k}">${L3[k]}</a>`).join('');
  document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('is-on',p.id==='pane-'+tab));
  $('crumbL2').textContent=L2[g];$('crumbL3').textContent=L3[tab];$('h1').textContent=L2[g];
  $('hdesc').textContent=g==='news'?'입시 주요 일정과 달라지는 제도, 공지사항을 확인하세요. 로그인하면 내 학년 기준으로 먼저 보여드립니다.':'서비스 이용 방법, 서울진로진학정보센터 안내, 자주 묻는 질문입니다.';
  ({schedule:renderSched,policy:renderPolicy,notice:renderNotice,faq:renderFaq,guide:renderGuide,center:()=>{}})[tab]();}
function renderGuide(){$('gLogin').innerHTML=A.logged()?'<span class="st st--ok">✓ 로그인됨 · 아래 모든 기능을 쓸 수 있어요</span>':'<button class="btn btn--primary btn--pill" data-loginopen>로그인하기</button>';}
function setTab(){tab=(location.hash||'#schedule').slice(1);if(!L3[tab])tab='schedule';document.querySelectorAll('#lnb a').forEach(a=>a.classList.toggle('is-cur',a.getAttribute('href')==='news.html#'+tab));document.title=L3[tab]+' | 서울 진로진학 통합플랫폼';rerender();}
$('lnb').dataset.current=L3[(location.hash||'#schedule').slice(1)]||L3.schedule;
addEventListener('hashchange',()=>{setTab();scrollTo({top:document.querySelector('.ptabs').offsetTop-90,behavior:'smooth'});});
document.addEventListener('sen-auth',()=>{if(A.logged()){tg='고1·2';pw='고1·2';}rerender();});
document.addEventListener('click',e=>{const c=x=>e.target.closest(x);let b;
  if(b=c('[data-tg]')){tg=b.dataset.tg;selDay=null;renderSched();return;}
  if(b=c('[data-cal]')){ym[1]+=+b.dataset.cal;if(ym[1]<0){ym[1]=11;ym[0]--;}if(ym[1]>11){ym[1]=0;ym[0]++;}selDay=null;renderSched();return;}
  if(b=c('[data-day]')){selDay=selDay===b.dataset.day?null:b.dataset.day;renderSched();return;}
  if(b=c('[data-my]')){if(!A.logged()){showToast('내 일정 추가는 로그인 후 이용할 수 있어요');A.open();return;}const k=b.dataset.my,i=S.my.indexOf(k);i>-1?S.my.splice(i,1):S.my.push(k);save();showToast(i>-1?'내 일정에서 뺐어요':'나의 진로진학 일정에 추가했어요 · 하루 전 알림을 보내드려요');renderSched();return;}
  if(b=c('[data-pw]')){pw=b.dataset.pw;renderPolicy();return;}
  if(b=c('[data-nc]')){nc=b.dataset.nc;page=1;renderNotice();return;}
  if(b=c('[data-pg]')){page=+b.dataset.pg;renderNotice();return;}
  if(b=c('[data-notice]')){openNotice(+b.dataset.notice);return;}
  if(b=c('[data-fc]')){fc=b.dataset.fc;renderFaq();return;}
  if(b=c('[data-fq]')){const i=+b.dataset.fq;openF=openF===i?-1:i;renderFaq();return;}
  if(b=c('[data-help]')){showToast(b.dataset.help==='y'?'의견 감사합니다':'더 나은 답변을 준비할게요 · 이용 문의를 남겨주셔도 좋아요');b.parentElement.innerHTML='의견을 보내주셔서 감사합니다';return;}
});
$('nQ').addEventListener('input',e=>{nq=e.target.value.trim();page=1;renderNotice();});
$('fQ').addEventListener('input',e=>{fq=e.target.value.trim();openF=-1;renderFaq();});
setTab();
})();
