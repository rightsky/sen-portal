/* GNB 하부메뉴(드롭다운) + 서브페이지 로컬 메뉴 — 모든 페이지 공용 */
(function(){
const PAGES={'진로검사':'jinro-test.html','심리·스트레스·학습자유형 검사':'jinro-test.html#tests','대학별 평가요소':'strategy.html#record','합불사례':'strategy.html#result','진학지도 자료집·발간도서':'library.html','나의 진로특성':'jinro-trait.html','검사·관심 변화보기':'jinro-change.html','직업 찾기':'jinro-job.html#find','나에게 맞는 직업':'jinro-job.html#match','직업 비교·관심저장':'jinro-job.html#compare','학과 찾기':'jinro-major.html#find','직업-학과 연결보기':'jinro-major.html#link','학과 비교·관심저장':'jinro-major.html#compare','고교 유형 알아보기':'school-explore.html#types','학교 찾기·비교':'school-explore.html#schools','고입 전형·일정':'school-explore.html#admission','선택과목 알아보기':'subject-explore.html#subjects','진로·전공별 관련 과목':'subject-explore.html#bymajor','우리 학교 개설과목':'subject-explore.html#myschool','과목 선택 시뮬레이션':'study-plan.html#sim','학년별 이수계획':'study-plan.html#plan','계획 점검·교사와 상담':'study-plan.html#check','중학생 자료':'library.html#mid','고1·2 자료':'library.html#hs12','고3·졸업생 자료':'library.html#hs3','진로 영상':'library.html#video','진학 설명회':'library.html#briefing','교사 추천 자료':'library.html#teacher','입시 주요 일정':'news.html#schedule','정책·전형 변화':'news.html#policy','공지사항':'news.html#notice','서비스 이용안내':'news.html#guide','진로진학센터 안내':'news.html#center','FAQ':'news.html#faq','조건으로 대학 찾기':'univ.html#find','대학·학과 상세':'univ.html#majorinfo','대학·학과 비교':'univ.html#compare','수시 전형':'univ.html#susi','정시 전형':'univ.html#jeongsi','나에게 맞는 전형 탐색':'univ.html#fit','대입제도·용어':'univ.html#terms','학년도별 변화':'univ.html#changes','모집요강·전형자료':'univ.html#docs','내신·모의고사':'strategy.html#grades','학생부 관련 정보':'strategy.html#record','성적·기록 분석':'strategy.html#analysis','대학별 성적 환산':'strategy.html#convert','입시결과 비교':'strategy.html#result','지원가능성 참고분석':'strategy.html#possible','관심 전형 비교':'strategy.html#cmp','나의 지원계획':'strategy.html#plan','지원전략 점검':'strategy.html#check','면접 준비':'strategy.html#interview','AI 면접 연습':'strategy.html#aiint','대학별고사 자료':'strategy.html#exam','진로 질문':'counsel.html#career','대입 질문':'counsel.html#admission','내 정보로 질문하기':'counsel.html#mine','상담 유형 선택':'counsel.html#type','상담 예약·사전질문':'counsel.html#book','상담결과·후속과제':'counsel.html#result','진로체험':'counsel.html#exp','진학설명회':'counsel.html#brief','신청·예약':'counsel.html#apply','현재 단계':'my.html#stage','이번 달 할 일':'my.html#month','다음 추천 행동':'my.html#next','관심 직업·학과':'my.html#jobs','관심 고교':'my.html#schools','관심 대학·전형':'my.html#unis','진로검사·활동':'my.html#tests','학업설계':'my.html#plan','성적·상담·지원기록':'my.html#records','나의 진로진학 일정':'my.html#cal','마감 알림':'my.html#deadline','상담 일정':'my.html#counsel','학부모 연결':'my.html#parent','교사 공유':'my.html#teacher','개인정보·AI 설정':'my.html#privacy'};
const MENU={
'미래탐색':[['나 이해하기',['진로검사','심리·스트레스·학습자유형 검사','나의 진로특성','검사·관심 변화보기']],['직업 탐색',['직업 찾기','나에게 맞는 직업','직업 비교·관심저장']],['전공·학과 탐색',['학과 찾기','직업-학과 연결보기','학과 비교·관심저장']]],
'학교·과목설계':[['고교 탐색',['고교 유형 알아보기','학교 찾기·비교','고입 전형·일정']],['과목 탐색',['선택과목 알아보기','진로·전공별 관련 과목','우리 학교 개설과목']],['나의 학업설계',['과목 선택 시뮬레이션','학년별 이수계획','계획 점검·교사와 상담']]],
'대학·전형탐색':[['대학·학과 찾기',['조건으로 대학 찾기','대학·학과 상세','대학·학과 비교']],['전형 찾기',['수시 전형','정시 전형','나에게 맞는 전형 탐색']],['대입 이해하기',['대입제도·용어','학년도별 변화','모집요강·전형자료']]],
'지원전략':[['나의 성적·기록',['내신·모의고사','학생부 관련 정보','대학별 평가요소','성적·기록 분석']],['대학별 분석',['대학별 성적 환산','입시결과 비교','합불사례','지원가능성 참고분석']],['지원계획',['관심 전형 비교','나의 지원계획','지원전략 점검']],['면접·대학별고사',['면접 준비','AI 면접 연습','대학별고사 자료']]],
'상담·체험':[['AI 진로진학 안내',['진로 질문','대입 질문','내 정보로 질문하기']],['1:1 상담',['상담 유형 선택','상담 예약·사전질문','상담결과·후속과제']],['체험·설명회',['진로체험','진학설명회','신청·예약']]],
'나의 진로진학':[['나의 대시보드',['현재 단계','이번 달 할 일','다음 추천 행동']],['나의 목표·관심',['관심 직업·학과','관심 고교','관심 대학·전형']],['나의 계획·기록',['진로검사·활동','학업설계','성적·상담·지원기록']],['일정·알림',['나의 진로진학 일정','마감 알림','상담 일정']],['공유·권한',['학부모 연결','교사 공유','개인정보·AI 설정']]],
'자료·소식':[['맞춤 자료실',['중학생 자료','고1·2 자료','고3·졸업생 자료','진학지도 자료집·발간도서']],['영상·설명회 자료',['진로 영상','진학 설명회','교사 추천 자료']],['일정·소식',['입시 주요 일정','정책·전형 변화','공지사항']],['이용안내',['서비스 이용안내','진로진학센터 안내','FAQ']]]
};
window.SEN_PAGES=PAGES;
/* 폰 하단 탭바 5 (홈·검색·MY·상담·전체) · 768px 이하 */
(function(){const isMain=/main-everland-style\.html$|\/$/.test(location.pathname);const ic=p=>'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
const T=[['home','홈',ic('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),'main-everland-style.html'],['search','검색',ic('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),'main-everland-style.html?open=search'],['my','MY',ic('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'),'my.html#stage'],['counsel','상담',ic('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z"/>'),'counsel.html#type'],['all','전체',ic('<path d="M4 6h16M4 12h16M4 18h16"/>'),'main-everland-style.html?open=mega']];
const cur=isMain?'home':/my\.html/.test(location.pathname)?'my':/counsel\.html/.test(location.pathname)?'counsel':'';
const st=document.createElement('style');st.textContent='.tabbar{display:none}@media (max-width:768px){.tabbar{display:grid;grid-template-columns:repeat(5,1fr);position:fixed;left:0;right:0;bottom:0;z-index:80;background:var(--bg);border-top:1px solid var(--line);padding:6px 0 calc(6px + env(safe-area-inset-bottom))}.tabbar a{display:flex;flex-direction:column;align-items:center;gap:2px;min-height:48px;justify-content:center;font-size:11.5px;font-weight:700;color:var(--ink-3)}.tabbar a[aria-current]{color:var(--brand)}body{padding-bottom:72px}}';document.head.appendChild(st);
const nav=document.createElement('nav');nav.className='tabbar';nav.setAttribute('aria-label','하단 메뉴');nav.innerHTML=T.map(t=>'<a href="'+t[3]+'" data-tb="'+t[0]+'"'+(t[0]===cur?' aria-current="page"':'')+'>'+t[2]+'<span>'+t[1]+'</span></a>').join('');document.body.appendChild(nav);
const findBtn=k=>k==='search'?(document.getElementById('btnSearch')||document.querySelector('.header [aria-label*="검색"]')):document.getElementById('btnMega');
nav.addEventListener('click',e=>{const a=e.target.closest('[data-tb]');if(!a||!isMain)return;const k=a.dataset.tb;if(k!=='search'&&k!=='all')return;const b=findBtn(k);if(b){e.preventDefault();b.click();}});
if(isMain){const q=new URLSearchParams(location.search).get('open');if(q)setTimeout(()=>{const b=findBtn(q==='search'?'search':'all');b&&b.click();},300);}
})();
const link=(x,l1,l2,cur)=>PAGES[x]?`<a href="${PAGES[x]}"${x===cur?' class="is-cur" aria-current="page"':''}>${x}</a>`:`<a href="#" data-toast="'${x}' (${l1} > ${l2}) · 상세 화면은 다음 단계에서 설계합니다">${x}</a>`;
const css=`
.gnb-drop{position:absolute;left:0;right:0;top:100%;background:var(--bg);border-bottom:1px solid var(--line);box-shadow:0 18px 32px rgba(17,19,24,.08);opacity:0;visibility:hidden;transform:translateY(-6px);transition:opacity .18s,transform .18s,visibility .18s}
.gnb-drop.is-on{opacity:1;visibility:visible;transform:none}
.gnb-drop__in{max-width:var(--container);margin:0 auto;padding:28px var(--gutter) 32px;display:grid;grid-template-columns:220px 1fr;gap:32px}
.gnb-drop__l1{font-size:22px;font-weight:900;letter-spacing:-.02em;margin:0;color:var(--brand)}
.gnb-drop__cols{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:20px 28px}
.gnb-drop h4{margin:0 0 10px;font-size:15px;font-weight:800;padding-bottom:8px;border-bottom:1px solid var(--line)}
.gnb-drop ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
.gnb-drop li a{display:block;padding:6px 0;font-size:14.5px;color:var(--ink-2);font-weight:500}
.gnb-drop li a:hover,.gnb-drop li a:focus-visible{color:var(--brand)}
.gnb-drop li a[href*=".html"]{color:var(--ink);font-weight:700}
.gnb-drop li a[href*=".html"]::after{content:" ›";color:var(--brand)}
.lnb{position:sticky;top:72px;z-index:40;background:var(--bg);border-bottom:1px solid var(--line)}
.lnb__in{max-width:var(--container);margin:0 auto;padding:0 var(--gutter);display:flex;flex-wrap:wrap;align-items:stretch;gap:0}
@media (max-width:860px){.lnb__in{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;scroll-padding-left:var(--gutter)}}
.lnb__grp{display:flex;align-items:center;gap:4px;padding:10px 16px 10px 0;margin-right:16px;border-right:1px solid var(--line);flex-shrink:0}
.lnb__grp:last-child{border-right:0}
.lnb__grp b{font-size:12.5px;color:var(--ink-3);font-weight:700;margin-right:6px;white-space:nowrap}
.lnb__grp a{padding:7px 12px;border-radius:999px;font-size:14px;font-weight:600;color:var(--ink-2);white-space:nowrap}
.lnb__grp a:hover{background:var(--surface);color:var(--ink)}
.lnb__grp a.is-cur{background:var(--brand);color:#fff}
@media (max-width:1100px){.gnb-drop{display:none}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

const header=document.querySelector('.header'),gnb=document.querySelector('.gnb');
if(header&&gnb){
  const drop=document.createElement('div');drop.className='gnb-drop';drop.setAttribute('role','region');drop.setAttribute('aria-label','하부 메뉴');
  header.appendChild(drop);
  let cur=null,t;
  const show=a=>{const l1=a.textContent.trim(),m=MENU[l1];if(!m)return;clearTimeout(t);
    if(cur!==l1){cur=l1;drop.innerHTML=`<div class="gnb-drop__in"><p class="gnb-drop__l1">${l1}</p><div class="gnb-drop__cols">${m.map(([l2,l3])=>`<div><h4>${l2}</h4><ul>${l3.map(x=>`<li>${link(x,l1,l2)}</li>`).join('')}</ul></div>`).join('')}</div></div>`;}
    gnb.querySelectorAll('a').forEach(x=>x.classList.toggle('is-hover',x===a));drop.classList.add('is-on');};
  const hide=()=>{t=setTimeout(()=>{drop.classList.remove('is-on');gnb.querySelectorAll('a').forEach(x=>x.classList.remove('is-hover'));},120);};
  gnb.querySelectorAll('a').forEach(a=>{a.addEventListener('mouseenter',()=>show(a));a.addEventListener('focus',()=>show(a));});
  header.addEventListener('mouseleave',hide);
  drop.addEventListener('mouseenter',()=>clearTimeout(t));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')drop.classList.remove('is-on');});
  document.addEventListener('focusin',e=>{if(!header.contains(e.target))drop.classList.remove('is-on');});
  const s=document.createElement('style');s.textContent='.gnb a.is-hover::after{transform:scaleX(1)}';document.head.appendChild(s);
}
const lnb=document.getElementById('lnb');
if(lnb){const l1=lnb.dataset.l1,c=lnb.dataset.current;lnb.className='lnb';lnb.setAttribute('aria-label',l1+' 하부 메뉴');
  lnb.innerHTML=`<div class="lnb__in">${MENU[l1].map(([l2,l3])=>`<div class="lnb__grp"><b>${l2}</b>${l3.map(x=>link(x,l1,l2,c)).join('')}</div>`).join('')}</div>`;
  const on=lnb.querySelector('.is-cur'),inn=lnb.querySelector('.lnb__in');if(on&&inn.scrollWidth>inn.clientWidth){const grp=on.closest('.lnb__grp');inn.scrollLeft=grp.offsetLeft-inn.offsetLeft;}}
})();
