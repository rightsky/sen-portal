(function(){
const {adm,uni}=UD;const {major,drawer,store}=EX;const A=SEN_AUTH;const $=id=>document.getElementById(id);
const K='sen-counsel-v1';let P=JSON.parse(localStorage.getItem(K)||'null')||{chats:{career:[],admission:[],mine:[]},booking:null,history:[],tasks:{},apps:[]};const save=()=>localStorage.setItem(K,JSON.stringify(P));
const GROUP={career:'ai',admission:'ai',mine:'ai',type:'c',book:'c',result:'c',exp:'e',brief:'e',apply:'e'};
const L3={career:'진로 질문',admission:'대입 질문',mine:'내 정보로 질문하기',type:'상담 유형 선택',book:'상담 예약·사전질문',result:'상담결과·후속과제',exp:'진로체험',brief:'진학설명회',apply:'신청·예약'};
const L2={ai:'AI 진로진학 안내',c:'1:1 상담',e:'체험·설명회'};
const OPEN=new Set(['career','admission','type','exp','brief']);
/* ── AI 안내: 근거·기준일 표시, 판정 금지, 상담 연결 ── */
const SRC={career:['커리어넷 직업백과','커리어넷 학과정보','서울진로진학정보센터 진로검사 안내'],admission:['2027학년도 대학입학전형시행계획 (대교협, 2025.05)','2028 대입제도 개편 확정안 (교육부, 2023.12)','서울진로진학정보센터 고3 진학지도 자료집 (2025.02)'],mine:['내 진로검사 결과 (2026.09.28)','내 관심 직업·학과·전형','내가 저장한 성적 (2026.10.02)']};
const SUG={career:['생명과학에 관심 있는데 어떤 직업이 있나요?','디자인과 과학을 둘 다 좋아하면?','UX 디자이너가 되려면 무슨 과를 가야 하나요?','진로검사 결과는 어떻게 읽어요?'],admission:['수시와 정시 차이가 뭐예요?','수능최저가 뭔가요?','2028 대입은 뭐가 달라지나요?','학생부종합전형은 뭘 보나요?'],mine:['내 흥미 유형에 맞는 학과는?','내 관심 전형 중 면접 있는 건?','내 성적 흐름을 설명해 줘','상담 전에 뭘 준비하면 좋을까?']};
function answer(mode,q){
  const mine=store.list('majors').map(major).filter(Boolean),jobs=store.list('jobs').map(EX.job).filter(Boolean);
  let a='',chips=[],next=[];
  if(mode==='career'){
    if(/생명|과학/.test(q)){a='생명과학에 관심이 있다면 <b>생명과학 연구원, 약사, 환경공학 기술자, 과학 커뮤니케이터</b> 같은 직업을 먼저 살펴볼 수 있어요. 연구 쪽이라면 생명과학과·화학과, 사람을 돕는 쪽이라면 간호학과·약학과처럼 같은 관심이 여러 학과로 이어집니다.';chips=['생명과학 연구원','약사','과학 커뮤니케이터'];next=[['직업 찾기에서 보기','jinro-job.html?open=j3#find'],['학과 연결 보기','jinro-major.html?sel=j3#link']];}
    else if(/디자인|예술/.test(q)){a='과학과 디자인을 함께 좋아하는 학생은 <b>UX 디자이너, 산업디자이너, 과학 커뮤니케이터, 건축가</b>처럼 분석과 표현이 함께 있는 직업에서 즐겁게 일하는 경우가 많아요. 흥미검사에서 탐구형(I)과 예술형(A)이 함께 높게 나오는 유형이에요.';chips=['UX 디자이너','건축가','산업디자인학과'];next=[['나에게 맞는 직업 보기','jinro-job.html#match']];}
    else if(/검사|결과/.test(q)){a='진로검사 결과는 \'나는 이런 사람이다\'라는 판정이 아니라 <b>나를 이해하는 출발점</b>이에요. 흥미 유형 상위 2개, 강점 적성 3개, 중요한 가치 3개를 함께 보면 어울리는 직업군이 보입니다. 결과 해석이 어렵다면 진로교사·전문상담사와 함께 읽어보세요.';next=[['나의 진로특성 보기','jinro-trait.html'],['상담 신청','#type']];}
    else{a='좋은 질문이에요. 진로는 <b>흥미(무엇을 좋아하나) → 적성(무엇을 잘하나) → 가치(무엇이 중요한가)</b> 순서로 좁혀 가면 찾기 쉬워요. 아직 검사를 하지 않았다면 진로검사부터, 했다면 \'나에게 맞는 직업\'에서 추천을 살펴보세요.';next=[['진로검사','jinro-test.html'],['직업 찾기','jinro-job.html#find']];}
  } else if(mode==='admission'){
    if(/수시|정시/.test(q)&&/차이|뭐/.test(q)){a='<b>수시</b>는 9월에 원서를 내고 학생부(교과·종합), 논술, 실기로 뽑는 전형이에요. 최대 6번 지원할 수 있어요. <b>정시</b>는 수능 뒤 12~1월에 가·나·다군 각 1번씩, 수능 성적 중심으로 뽑아요. 수시에 합격하면 정시 지원은 할 수 없어요.';next=[['수시 전형 보기','univ.html#susi'],['용어 사전','univ.html#terms']];}
    else if(/최저/.test(q)){a='<b>수능최저학력기준</b>은 수시에서 합격하려면 넘어야 하는 최소 수능 성적이에요. 예를 들어 "3개 영역 등급합 7 이내"면 국어 2·수학 2·탐구 3등급처럼 세 영역 등급을 더해 7 이하여야 해요. 전형마다 있기도 하고 없기도 합니다.';next=[['최저 없는 전형 찾기','univ.html#susi'],['용어 사전','univ.html#terms']];}
    else if(/2028|달라/.test(q)){a='<b>2028학년도 대입</b>(지금 고2가 치르는 입시)부터 수능 선택과목이 없어지고 탐구는 통합사회·통합과학으로 봐요. 내신은 5등급제가 처음 적용돼요. 학생부 평가 방식의 세부 변화는 2026년 발표되는 대학별 시행계획에서 확인해야 해요.';next=[['학년도별 변화','univ.html#changes'],['정책·전형 변화','news.html#policy']];}
    else if(/학종|종합/.test(q)){a='<b>학생부종합전형</b>은 교과 성적뿐 아니라 세특(수업 중 모습), 창의적 체험활동, 행동특성을 함께 봐요. 진로와 학교생활이 얼마나 이어지는지를 중요하게 봅니다. 수상·개인봉사·독서는 2024학년도부터 반영되지 않아요.';next=[['학생부 돌아보기','strategy.html#record'],['학종 전형 보기','univ.html#susi']];}
    else{a='대입 질문은 <b>제도(수시·정시·전형 종류) → 요건(최저·추천·지역) → 일정</b> 순서로 이해하면 좋아요. 궁금한 단어가 있으면 용어 사전에서 찾아보고, "내 성적으로 어디가 가능해요?" 같은 질문은 상담에서 선생님과 함께 봐요.';next=[['대입 용어 사전','univ.html#terms'],['상담 신청','#type']];}
  } else {
    if(/흥미|학과/.test(q)){a=`내 흥미 유형은 <b>탐구형 + 예술형(IA)</b>이에요. 이 조합과 가까운 학과로 ${mine.length?'내가 저장한 <b>'+mine.map(m=>m.name).join(', ')+'</b>이 있고':'아직 저장한 학과는 없지만'}, 통계학과·산업디자인학과·생명과학과·미디어커뮤니케이션학과도 살펴볼 만해요.`;chips=mine.map(m=>m.name);next=[['나에게 맞는 직업','jinro-job.html#match'],['학과 찾기','jinro-major.html#find']];}
    else if(/전형|면접/.test(q)){const s=JSON.parse(localStorage.getItem('sen-univ-v1')||'{"adms":[]}').adms.map(adm).filter(Boolean);const iv=s.filter(x=>x.docs.includes('면접'));a=s.length?`내 관심 전형 ${s.length}개 중 면접이 있는 전형은 <b>${iv.length}개</b>예요${iv.length?': '+iv.map(x=>uni(x.uni).name+' '+x.name).join(', '):''}. 면접 유형은 전형마다 달라서 면접 준비 메뉴에서 유형별로 확인하세요.`:'아직 저장한 관심 전형이 없어요. 전형정보에서 🤍를 눌러 저장하면 면접·최저 여부를 모아 알려드릴 수 있어요.';next=[['면접 준비','strategy.html#interview'],['전형 찾기','univ.html#susi']];}
    else if(/성적|흐름/.test(q)){const g=JSON.parse(localStorage.getItem('sen-strategy-v1')||'null');const sem=g?Object.entries(g.grades).filter(([k,v])=>Object.keys(v).length).map(([k,v])=>{const vals=Object.values(v).filter(Boolean);return k+' '+(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1);}):[];a=sem.length?`저장된 내신 평균은 <b>${sem.join(' → ')}</b>등급이에요. 1학년에서 2학년으로 오면서 좋아지는 흐름이에요. 이 숫자는 교과군 평균만 본 것이라 대학별 환산이나 합격 가능성과는 달라요. 그 부분은 상담에서 선생님과 봐요.`:'아직 저장한 성적이 없어요. 지원전략 > 내신·모의고사에서 교과군 평균 등급만 입력하고 저장하면 흐름을 설명해 드릴 수 있어요.';next=[['성적·기록 분석','strategy.html#analysis'],['상담 신청','#type']];}
    else{a=`상담 전에는 <b>① 진로검사 결과 확인 ② 관심 직업·학과·전형 저장 ③ 성적 입력·저장 ④ 궁금한 점 메모</b>를 해두면 좋아요. 지금 저장된 것: 관심 학과 ${mine.length}개, 관심 직업 ${jobs.length}개. 이 내용은 상담 예약 때 사전자료로 자동 정리돼요.`;next=[['상담 예약하기','#book']];}
  }
  return {a,chips,next,src:SRC[mode].slice(0,2),date:'2026.10.02 기준'};
}
let mode='career';
function renderChat(){const log=P.chats[mode]||[];
  $('chatSrc').innerHTML=`<b>이 안내가 참고하는 자료</b> ${SRC[mode].map(s=>`<span>${s}</span>`).join('')}`;
  $('chatLog').innerHTML=log.length?log.map(m=>m.role==='u'?`<div class="msg msg--u"><p>${m.t}</p></div>`:`<div class="msg msg--a"><p>${m.a}</p>${m.chips&&m.chips.length?`<div class="ria">${m.chips.map(c=>`<span>${c}</span>`).join('')}</div>`:''}<div class="msg__src">근거: ${m.src.join(' · ')} · ${m.date}</div>${m.next.length?`<div class="msg__next">${m.next.map(n=>`<a class="mini" href="${n[1]}">${n[0]} ›</a>`).join('')}</div>`:''}</div>`).join('')+`<div class="msg msg--sys">AI 안내는 정보를 쉽게 설명하는 도우미예요. 합격 가능성이나 지원 여부 판단은 하지 않아요. 더 깊은 이야기는 <a class="link" href="#type">상담</a>에서 해요.</div>`:`<div class="chat-empty"><b>${mode==='career'?'진로가 궁금할 때':mode==='admission'?'대입이 궁금할 때':'내 정보를 바탕으로'}</b><p>${mode==='mine'?'로그인한 내 검사 결과·관심 목록·성적을 바탕으로 답해요. 내 정보는 이 대화에만 쓰이고, 저장 여부는 내가 정해요.':'아래 질문을 눌러보거나 직접 물어보세요. 답변마다 참고한 자료와 기준일을 함께 보여드려요.'}</p></div>`;
  $('chatSug').innerHTML=SUG[mode].map(q=>`<button class="fchip" data-sug="${q}">${q}</button>`).join('');
  $('chatLog').scrollTop=$('chatLog').scrollHeight;
  $('chatSave').innerHTML=mode==='mine'?`<label class="cbx" style="min-width:0;font-size:13px"><input type="checkbox" id="chatKeep"${P.keep?' checked':''}><span>이 대화를 상담 사전자료에 포함</span></label>`:'';}
function ask(q){if(!q.trim())return;(P.chats[mode]=P.chats[mode]||[]).push({role:'u',t:q});save();renderChat();
  $('chatLog').insertAdjacentHTML('beforeend','<div class="msg msg--a msg--typing"><p>답변을 준비하고 있어요…</p></div>');$('chatLog').scrollTop=1e6;
  setTimeout(()=>{P.chats[mode].push({role:'a',...answer(mode,q)});save();renderChat();},700);}
/* ── 상담 유형 선택 ── */
const TYPES=[
 {id:'teacher',name:'학교 선생님 상담',who:'담임·진로진학 선생님',how:'학교에서 대면',when:'학교 일정에 따라',good:'내 학생부와 성적을 가장 잘 아는 분과 이야기할 때',note:'학교 선생님은 NEIS에서 내 자료를 직접 봅니다',icon:'🏫'},
 {id:'visit',name:'센터 방문 상담',who:'서울진로진학정보센터 전문상담사',how:'센터 방문 · 50분',when:'평일 09:00~17:00',good:'전형 선택, 지원 전략, 진로 고민을 깊이 이야기할 때',note:'내가 동의한 범위의 자료와 직접 가져온 자료로 상담해요',icon:'🗣️'},
 {id:'video',name:'화상 상담',who:'서울진로진학정보센터 전문상담사',how:'온라인 화상 · 40분',when:'평일 저녁 시간대 포함',good:'센터가 멀거나 보호자와 함께 참여하고 싶을 때',note:'학부모 동반 가능',icon:'💻'},
 {id:'board',name:'온라인(게시판) 상담',who:'센터 상담사 답변',how:'글로 질문 · 2~3일 내 답변',when:'언제든',good:'간단한 질문, 자료 안내가 필요할 때',note:'비공개 글로 작성, 개인정보는 최소한으로',icon:'✉️'}
];
const Q=[['지금 가장 큰 고민은?',[['진로가 아직 안 정해졌어요',['teacher','visit']],['전형·대학을 고르고 있어요',['visit','video']],['간단히 물어볼 게 있어요',['board','teacher']]]],['어떻게 만나고 싶나요?',[['직접 만나서',['teacher','visit']],['집에서 온라인으로',['video','board']],['상관없어요',['visit','video','teacher']]]],['보호자와 함께 하나요?',[['네',['video','visit']],['아니요',['teacher','board','visit']]]]];
let qa=[];
function renderType(){const i=qa.length;
  $('typeGrid').innerHTML=TYPES.map(t=>`<article class="xcard" style="cursor:default"><div class="xcard__top"><div><span class="xcard__cat">${t.who}</span><h3>${t.icon} ${t.name}</h3></div></div><div class="ind" style="grid-template-columns:1fr;border:0;padding:0"><div><span>방법</span><b style="color:var(--ink)">${t.how}</b></div><div><span>시간</span><b style="color:var(--ink)">${t.when}</b></div></div><p style="-webkit-line-clamp:3">${t.good}</p><small class="hint" style="margin:0">${t.note}</small><div class="xcard__act"><a class="mini is-on" href="#book" data-pick="${t.id}">이 유형으로 예약</a></div></article>`).join('');
  if(i<Q.length){const [q,o]=Q[i];$('typeQuiz').innerHTML=`<div class="qz__prog">${Q.map((_,k)=>`<i class="${k<i?'on':k===i?'cur':''}"></i>`).join('')}<span>${i+1} / ${Q.length}</span></div><h3>${q}</h3><div class="qz__opts">${o.map((x,k)=>`<button class="qz__opt" data-qa="${k}">${x[0]}</button>`).join('')}</div>${i?'<button class="link" data-qback>← 이전</button>':''}`;}
  else{const sc={};qa.forEach((a,qi)=>Q[qi][1][a][1].forEach((t,r)=>sc[t]=(sc[t]||0)+(3-r)));const top=Object.entries(sc).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>TYPES.find(t=>t.id===x[0]));
    $('typeQuiz').innerHTML=`<div class="qz__prog">${Q.map(()=>'<i class="on"></i>').join('')}<span>결과</span></div><h3>이런 상담이 맞을 것 같아요</h3><div class="qz__res">${top.map((t,k)=>`<div class="qz__card${k?'':' is-1'}"><small>${k?'이것도 좋아요':'추천'}</small><b>${t.icon} ${t.name}</b><p>${t.good}</p><a class="btn ${k?'btn--ghost':'btn--primary'} btn--pill" href="#book" data-pick="${t.id}">예약하기</a></div>`).join('')}</div><button class="link" data-qreset>다시 해보기 ↺</button>`;}}
/* ── 상담 예약·사전질문 (4단계) ── */
let B={step:0,type:null,date:null,slot:null,topics:new Set(),q:'',share:{test:true,saved:true,grades:true,plan:true,chat:false},parent:false};
const DATES=[['10.6 (화)',true],['10.7 (수)',true],['10.8 (목)',false],['10.13 (화)',true],['10.14 (수)',true],['10.15 (목)',true]];const SLOTS=['10:00','11:00','13:00','14:00','15:00','16:00','19:00'];
const TOPICS=['진로 방향','학과 선택','과목 선택','전형 선택','지원 계획','면접·논술','학생부 관리','성적 고민','기타'];
function renderBook(){
  if(P.booking&&B.step===0){const b=P.booking;$('bookBody').innerHTML=`<div class="done"><div class="done__ic">✅</div><h2>${b.type==='board'?'질문을 등록했어요':'상담이 예약되었어요'}</h2><p><b>${TYPES.find(t=>t.id===b.type).name}</b> · ${b.type==='board'?'2~3일 내 비공개 답변 · 답변이 오면 알림을 보내드려요':b.date+' '+b.slot+(b.parent?' · 보호자 동반':'')}</p><p class="hint" style="margin:0">사전자료(${Object.entries(b.share).filter(([k,v])=>v).length}개 항목)와 사전질문이 상담 선생님께 전달되었어요 · 하루 전 알림을 보내드려요</p><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button class="btn btn--ghost btn--pill" data-bcancel>예약 취소</button><a class="btn btn--primary btn--pill" href="#result">상담 준비 체크리스트 →</a></div></div>`;return;}
  const isBoard=B.type==='board';const steps=['상담 유형',isBoard?'날짜·시간 (생략)':'날짜·시간','사전질문','공유 범위 확인'];
  let body='';
  if(B.step===0)body=`<div class="pick-grid">${TYPES.map(t=>`<button class="pick${B.type===t.id?' is-sel':''}" data-bt="${t.id}">${t.icon} ${t.name}<small>${t.how}</small></button>`).join('')}</div>`;
  if(B.step===1)body=`<p class="blab">날짜</p><div class="pick-grid">${DATES.map(([d,ok])=>`<button class="pick${B.date===d?' is-sel':''}" data-bd="${d}"${ok?'':' disabled'}>${d}${ok?'':'<small>마감</small>'}</button>`).join('')}</div><p class="blab">시간</p><div class="pick-grid pick-grid--7">${SLOTS.map((s,i)=>`<button class="pick${B.slot===s?' is-sel':''}" data-bs="${s}"${[1,4].includes(i)?' disabled':''}>${s}</button>`).join('')}</div>${B.type==='video'?'':'<p class="hint">19:00는 화상 상담만 가능해요</p>'}<label class="cbx" style="min-width:0"><input type="checkbox" data-bp${B.parent?' checked':''}><span>보호자와 함께 참여해요</span></label>`;
  if(B.step===2)body=`${isBoard?'<div class="notice" style="padding:12px 16px;margin-bottom:6px"><div class="notice__icon" style="width:32px;height:32px;font-size:15px">✉️</div><div><p style="font-size:13.5px">게시판 상담은 날짜를 고르지 않아요. 질문을 남기면 <b>2~3일 안에</b> 센터 상담사가 비공개로 답변해요. 질문은 꼭 적어주세요.</p></div></div>':''}<p class="blab">이야기하고 싶은 주제 (여러 개 가능)</p><div class="fchips">${TOPICS.map(t=>`<button class="fchip${B.topics.has(t)?' is-on':''}" data-btp="${t}">${t}</button>`).join('')}</div><p class="blab">${isBoard?'질문 (필수)':'선생님께 미리 남길 질문'}</p><textarea class="memo" id="bq" placeholder="예: 통계학과와 컴퓨터공학과 중 어디가 저와 더 맞을지, 과목 선택은 어떻게 할지 궁금해요">${B.q}</textarea><p class="hint" style="margin:0">미리 적어두면 상담 시간을 더 알차게 쓸 수 있어요</p>`;
  if(B.step===3){const items=[['test','진로검사 결과','흥미 IA · 적성·가치 상위 3'],['saved','관심 직업·학과·대학·전형','저장한 목록'],['grades','내가 입력한 성적','교과군 평균·모의고사 등급 (2026.10.02 저장)'],['plan','과목 계획·지원계획','학업설계 시뮬레이션·수시/정시 카드'],['chat','AI 안내 대화 기록','내 정보로 질문하기 대화']];
    body=`<p class="blab">상담 선생님께 전달할 내 자료를 고르세요</p><div class="reclist">${items.map(([k,n,d])=>`<label class="cbx${B.share[k]?' is-on':''}" style="min-width:0;align-items:flex-start"><input type="checkbox" data-bsh="${k}"${B.share[k]?' checked':''}><span><b style="display:block">${n}</b><small style="color:var(--ink-3)">${d}</small></span></label>`).join('')}</div><div class="notice" style="padding:14px 16px;margin-top:12px"><div class="notice__icon" style="width:32px;height:32px;font-size:15px">🔒</div><div><p style="font-size:13.5px">학생부·성적 원문은 여기서 전달되지 않아요. 센터 상담에서 필요하면 <b>내가(미성년자는 보호자도) 동의</b>한 뒤 제공되거나, 내가 직접 가져온 자료로 봅니다. 공유 범위는 언제든 바꿀 수 있어요.</p></div></div>
    <div class="bsum"><b>예약 내용</b><span>${TYPES.find(t=>t.id===B.type)?.name||'–'} · ${isBoard?'2~3일 내 답변':(B.date||'–')+' '+(B.slot||'')}${B.parent?' · 보호자 동반':''}</span><span>주제: ${[...B.topics].join(', ')||'–'}</span>${B.q?`<span>질문: ${B.q.slice(0,60)}${B.q.length>60?'…':''}</span>`:''}</div>`;}
  const ok=B.step===0?!!B.type:B.step===1?!!(B.date&&B.slot):B.step===2&&isBoard?!!B.q.trim():true;
  $('bookBody').innerHTML=`<div class="steps">${steps.map((s,i)=>`<span class="step${i===B.step?' is-on':''}${i<B.step||(isBoard&&i===1)?' is-done':''}${isBoard&&i===1?' is-skip':''}">${i+1}. ${s}</span>`).join('')}</div>${body}<div class="modal-foot" style="margin-top:18px">${B.step?'<button class="btn btn--ghost btn--pill" data-bprev>← 이전</button>':'<span></span>'}<button class="btn btn--primary btn--pill" data-bnext${ok?'':' disabled'}>${B.step===3?(isBoard?'질문 등록':'이 내용으로 예약'):'다음 →'}</button></div>`;}
/* ── 상담결과·후속과제 ── */
const HIST=[{d:'2026.09.30',type:'visit',t:'이진로 선생님 · 센터 방문 상담',sum:'흥미검사 변화(IR→IA)를 함께 봤어요. 디자인 계열 체험을 권유받았고, 통계학과·산업디자인학과를 관심 학과로 유지하기로 했어요. 2학년 2학기 과목은 미적분Ⅰ·확률과 통계를 우선 넣기로 했습니다.',tasks:[['t1','디자인 계열 진로체험 1개 신청하기','exp'],['t2','과목 선택 시뮬레이션에 미적분Ⅰ·확률과 통계 담기','study-plan.html#sim'],['t3','UX 디자이너 직업인 인터뷰 영상 보기','library.html#video']],next:'10월 중 · 9월 모의고사 결과 반영'},{d:'2026.05.20',type:'teacher',t:'담임 선생님 · 학교 상담',sum:'1학년 성적 흐름과 동아리 활동을 점검했어요. 수학에 자신감이 생겼다는 이야기를 나눴고, 진로검사를 다시 해보기로 했어요.',tasks:[['t4','직업흥미검사(H) 다시 하기','jinro-test.html'],['t5','관심 직업 3개 저장하기','jinro-job.html#find']],next:'완료'}];
function renderResult(){
  if(!P.tasks.t4){P.tasks.t4=true;P.tasks.t5=true;save();}
  const open=HIST.flatMap(h=>h.tasks).filter(t=>!P.tasks[t[0]]).length;
  $('resBody').innerHTML=`<div class="rbar" style="margin-top:0"><div><h3 style="margin:0;font-size:20px">후속 과제 <span style="color:var(--brand)">${open}</span>개 남음</h3><p class="section__sub" style="font-size:14px">상담에서 함께 정한 다음 행동이에요. 끝내면 체크하세요</p></div>${P.booking?`<span class="st st--ok">${P.booking.type==='board'?'게시판 답변 대기':'다음 상담 '+P.booking.date+' '+P.booking.slot}</span>`:'<a class="btn btn--primary btn--pill" href="#book">다음 상담 예약</a>'}</div>
  <ol class="tl" style="margin-top:20px">${HIST.map(h=>{const T=TYPES.find(t=>t.id===h.type);return `<li class="tl__item tl__item--talk"><span class="tl__date">${h.d.slice(2)}</span><span class="tl__dot"></span><div class="tl__card" style="flex-direction:column;align-items:stretch;gap:12px"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><b>${T.icon} ${h.t}</b><span class="tl__kind">${h.next}</span></div><p style="margin:0">${h.sum}</p><div class="reclist">${h.tasks.map(t=>`<label class="cbx${P.tasks[t[0]]?' is-on':''}" style="min-width:0;justify-content:space-between"><span style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-task="${t[0]}"${P.tasks[t[0]]?' checked':''}><span${P.tasks[t[0]]?' style="text-decoration:line-through;color:var(--ink-3)"':''}>${t[1]}</span></span><a class="link" href="${t[2]==='exp'?'#exp':t[2]}" style="font-size:13px">바로가기 ›</a></label>`).join('')}</div></div></li>`;}).join('')}</ol>
  <div class="ud" style="margin-top:8px"><div class="panel-c" style="background:var(--surface);box-shadow:none"><h3>상담 준비 체크리스트</h3><div class="reclist">${['진로검사 결과를 다시 읽어봤어요','관심 직업·학과·전형을 저장했어요','성적을 입력하고 저장했어요','궁금한 점을 사전질문에 적었어요'].map((x,i)=>`<label class="cbx" style="min-width:0"><input type="checkbox" data-prep="${i}"${(P.prep||[]).includes(i)?' checked':''}><span>${x}</span></label>`).join('')}</div></div><div class="panel-c" style="border:1px solid var(--line);box-shadow:none"><h3>상담 기록은 누가 보나요?</h3><p style="margin:0;color:var(--ink-2);font-size:14.5px">상담 요약과 후속 과제는 나와 상담 선생님만 봐요. 학부모·학교 선생님과 공유할지는 <a class="link" href="my.html#privacy">공유 설정</a>에서 내가 정합니다. 교내 상담 기록과의 연결도 내 동의가 있어야 해요.</p></div></div>`;}
/* ── 체험·설명회 ── */
const EXP=[{id:'x1',t:'UX 디자이너와 함께하는 앱 화면 설계 체험',org:'서울진로직업체험센터',cat:'디자인·IT',date:'2026-10-18',time:'14:00~17:00',place:'센터 체험실',cap:20,app:14,target:'중3~고2',fit:true},{id:'x2',t:'생명과학 연구실 하루 체험 (대학 연계)',org:'서울미래대 생명과학과',cat:'과학·연구',date:'2026-10-25',time:'10:00~15:00',place:'대학 실험실',cap:16,app:16,target:'고1~2',fit:true},{id:'x3',t:'데이터로 세상 읽기 · 통계 분석 워크숍',org:'서울진로진학정보센터',cat:'수학·데이터',date:'2026-11-01',time:'13:00~16:00',place:'센터 강의실',cap:24,app:9,target:'고1~3',fit:true},{id:'x4',t:'병원 직업인 만남의 날 (간호사·물리치료사)',org:'서울진로직업체험센터',cat:'보건·의료',date:'2026-11-08',time:'14:00~16:00',place:'온라인',cap:100,app:41,target:'중3~고3',fit:false},{id:'x5',t:'법원 견학과 모의재판',org:'서울진로직업체험센터',cat:'사회·법',date:'2026-11-15',time:'10:00~13:00',place:'서울중앙지법',cap:30,app:30,target:'고1~2',fit:false},{id:'x6',t:'초등교사 직업 탐방 (교대 캠퍼스 투어)',org:'서울교육대학교',cat:'교육',date:'2026-11-22',time:'14:00~16:00',place:'대학 캠퍼스',cap:40,app:12,target:'고1~3',fit:false}];
let xf={cat:'전체',mine:false};
function renderExp(){const cats=['전체',...new Set(EXP.map(x=>x.cat))];
  $('expF').innerHTML=cats.map(c=>`<button class="fchip${xf.cat===c?' is-on':''}" data-xc="${c}">${c}</button>`).join('')+(A.logged()?`<button class="fchip${xf.mine?' is-on':''}" id="xMine" style="margin-left:auto">♥ 내 흥미(탐구·예술)와 맞는 것만</button>`:'');
  const L=EXP.filter(x=>(xf.cat==='전체'||x.cat===xf.cat)&&(!xf.mine||x.fit));
  $('expList').innerHTML=L.map(x=>{const d=new Date(x.date),ap=P.apps.includes(x.id),full=x.app>=x.cap;return `<article class="ev"><div class="ev__d"><b>${d.getMonth()+1}.${String(d.getDate()).padStart(2,'0')}</b><span>${'일월화수목금토'[d.getDay()]} ${x.time}</span></div><div class="ev__m"><div class="ev__tags"><span class="tb tb--2">${x.cat}</span><span class="tb tb--1">${x.target}</span>${x.fit&&A.logged()?'<span class="st st--ok">♥ 내 흥미와 맞아요</span>':''}${ap?'<span class="st st--ok">✓ 신청 완료</span>':full?'<span class="st st--full">마감</span>':'<span class="st st--ok">접수 중</span>'}</div><h3>${x.t}</h3><p>${x.org} · 📍 ${x.place}</p><div class="cap"><div class="score__t"><div class="score__f" style="width:${Math.min(100,x.app/x.cap*100)}%;${full?'background:#C43B3B':''}"></div></div><span>${x.app}/${x.cap}명</span></div></div><div class="ev__a">${ap?`<button class="btn btn--ghost btn--pill" data-xcancel="${x.id}">신청 취소</button>`:full?`<button class="btn btn--ghost btn--pill" data-xwait="${x.id}">대기 신청</button>`:`<button class="btn btn--primary btn--pill" data-xapply="${x.id}">신청하기</button>`}</div></article>`;}).join('');}
function renderBrief(){$('briefBody').innerHTML=`<div class="empty-r" style="text-align:left;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap"><div><b>진학설명회 일정과 신청은 자료·소식에 모아 두었어요</b>접수 중인 설명회, 다시보기 영상, 설명회 자료를 한곳에서 봅니다.</div><a class="btn btn--primary btn--pill" href="library.html#briefing">진학설명회 보기 →</a></div>`;}
function renderApply(){const apps=P.apps.map(id=>EXP.find(x=>x.id===id)).filter(Boolean);const ev=JSON.parse(localStorage.getItem('sen-lib-v1')||'{"applied":[]}').applied;
  $('applyBody').innerHTML=`<div class="ud"><div class="panel-c" style="border:1px solid var(--line);box-shadow:none"><div class="panel-c__head"><h3>신청한 체험</h3><small>${apps.length}건</small></div>${apps.length?`<div class="alist">${apps.map(x=>`<div class="arow" style="cursor:default"><span class="tb tb--2">${x.cat}</span><div><b>${x.t}</b><span>${x.date} ${x.time} · ${x.place}</span></div><button class="mini" data-xcancel="${x.id}" style="flex:none">취소</button></div>`).join('')}</div>`:'<p class="hint" style="margin:0">아직 신청한 체험이 없어요. <a class="link" href="#exp">진로체험 보기 ›</a></p>'}</div>
  <div class="panel-c" style="border:1px solid var(--line);box-shadow:none"><div class="panel-c__head"><h3>신청한 설명회</h3><small>${ev.length}건</small></div>${ev.length?`<p style="margin:0;color:var(--ink-2)">설명회 ${ev.length}건을 신청했어요. 자세한 내용은 <a class="link" href="library.html#briefing">진학설명회</a>에서 확인하세요.</p>`:'<p class="hint" style="margin:0">신청한 설명회가 없어요. <a class="link" href="library.html#briefing">진학설명회 보기 ›</a></p>'}</div></div>
  <div class="panel-c" style="margin-top:20px;border:1px solid var(--line);box-shadow:none"><div class="panel-c__head"><h3>예약한 상담</h3></div>${P.booking?`<div class="arow" style="cursor:default"><span class="tb tb--1">상담</span><div><b>${TYPES.find(t=>t.id===P.booking.type).name}</b><span>${P.booking.type==='board'?'2~3일 내 답변 예정':P.booking.date+' '+P.booking.slot}${P.booking.parent?' · 보호자 동반':''}</span></div><a class="mini" href="#book" style="flex:none">자세히</a></div>`:'<p class="hint" style="margin:0">예약한 상담이 없어요. <a class="link" href="#book">상담 예약 ›</a></p>'}</div>
  <p class="hint">신청·예약 내역은 나의 진로진학 > 일정·알림에도 함께 표시되고, 하루 전 알림을 보내드려요</p>`;}
/* ── 탭 ── */
let tab='career';
const R={career:renderChat,admission:renderChat,mine:renderChat,type:renderType,book:renderBook,result:renderResult,exp:renderExp,brief:renderBrief,apply:renderApply};
function rerender(){const g=GROUP[tab];
  $('ptabs').innerHTML=Object.keys(L3).filter(k=>GROUP[k]===g).map(k=>`<a class="ptab${k===tab?' is-on':''}" href="#${k}">${L3[k]}</a>`).join('');
  $('crumbL2').textContent=L2[g];$('crumbL3').textContent=L3[tab];$('h1').textContent=L2[g];
  $('hdesc').textContent={ai:'궁금한 것을 쉽게 설명하는 AI 안내입니다. 답변마다 참고 자료와 기준일을 표시하고, 합격 가능성 같은 판단은 하지 않아요.',c:'고민될 때 언제든 선생님·전문상담사와 만납니다. 내가 저장해 둔 것이 사전자료로 전달되어 상담이 더 알차져요.',e:'직접 해보고 들어보는 시간입니다. 내 흥미와 맞는 체험을 찾아 신청하세요.'}[g];
  const gated=!OPEN.has(tab)&&!A.logged();
  $('gateBox').innerHTML=gated?A.gate('🔒',L3[tab]+'은(는) 로그인 후 이용할 수 있어요',tab==='mine'?'내 검사 결과·관심 목록·성적을 바탕으로 답하는 기능이라 본인 확인이 필요합니다.':'예약과 기록은 본인 계정에 저장됩니다. 학부모 계정은 자녀 연결 후 함께 예약할 수 있어요.'):'';
  document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('is-on',!gated&&p.id==='pane-'+(['career','admission','mine'].includes(tab)?'chat':tab)));
  if(['career','admission','mine'].includes(tab))mode=tab;
  if(!gated)R[tab]();}
function setTab(){tab=(location.hash||'#career').slice(1);if(!L3[tab])tab='career';document.querySelectorAll('#lnb a').forEach(a=>a.classList.toggle('is-cur',a.getAttribute('href')==='counsel.html#'+tab));document.title=L3[tab]+' | 서울 진로진학 통합플랫폼';rerender();}
$('lnb').dataset.current=L3[(location.hash||'#career').slice(1)]||L3.career;
addEventListener('hashchange',()=>{setTab();scrollTo({top:document.querySelector('.ptabs').offsetTop-90,behavior:'smooth'});});
document.addEventListener('sen-auth',rerender);
document.addEventListener('click',e=>{const c=x=>e.target.closest(x);let b;
  if(b=c('[data-sug]')){ask(b.dataset.sug);return;}
  if(c('#chatSend')){const i=$('chatIn');ask(i.value);i.value='';return;}
  if(c('#chatClear')){P.chats[mode]=[];save();renderChat();return;}
  if(b=c('[data-qa]')){qa.push(+b.dataset.qa);renderType();return;}
  if(c('[data-qback]')){qa.pop();renderType();return;}
  if(c('[data-qreset]')){qa=[];renderType();return;}
  if(b=c('[data-pick]')){B.type=b.dataset.pick;B.step=A.logged()?1:0;if(!A.logged()){showToast('예약은 로그인 후 진행돼요');}return;}
  if(b=c('[data-bt]')){B.type=b.dataset.bt;if(B.type==='board'){B.date=null;B.slot=null;}renderBook();return;}
  if(b=c('[data-bd]')){B.date=b.dataset.bd;renderBook();return;}
  if(b=c('[data-bs]')){B.slot=b.dataset.bs;renderBook();return;}
  if(b=c('[data-btp]')){const t=b.dataset.btp;B.topics.has(t)?B.topics.delete(t):B.topics.add(t);renderBook();return;}
  if(c('[data-bprev]')){if($('bq'))B.q=$('bq').value;B.step-=(B.type==='board'&&B.step===2)?2:1;renderBook();return;}
  if(c('[data-bnext]')){if($('bq'))B.q=$('bq').value;if(B.step<3){B.step+=(B.type==='board'&&B.step===0)?2:1;renderBook();}else{P.booking={type:B.type,date:B.date,slot:B.slot,topics:[...B.topics],q:B.q,share:{...B.share},parent:B.parent};save();B.step=0;renderBook();showToast(B.type==='board'?'질문을 등록했어요 · 답변이 오면 알려드려요':'상담을 예약했어요 · 사전자료가 선생님께 전달됩니다');}return;}
  if(c('[data-bcancel]')){P.booking=null;save();B={step:0,type:null,date:null,slot:null,topics:new Set(),q:'',share:{test:true,saved:true,grades:true,plan:true,chat:false},parent:false};renderBook();showToast('예약을 취소했어요');return;}
  if(b=c('[data-xc]')){xf.cat=b.dataset.xc;renderExp();return;}
  if(c('#xMine')){xf.mine=!xf.mine;renderExp();return;}
  if(b=c('[data-xapply]')){if(!A.logged()){showToast('체험 신청은 로그인 후 이용할 수 있어요');A.open();return;}const x=EXP.find(y=>y.id===b.dataset.xapply);P.apps.push(x.id);x.app++;save();renderExp();showToast(`'${x.t}' 신청 완료 · 하루 전 알림을 보내드려요`);return;}
  if(b=c('[data-xcancel]')){const x=EXP.find(y=>y.id===b.dataset.xcancel);P.apps=P.apps.filter(i=>i!==x.id);x.app--;save();rerender();showToast('신청을 취소했어요');return;}
  if(b=c('[data-xwait]')){if(!A.logged()){A.open();return;}showToast('대기 신청했어요 · 자리가 나면 알려드려요');return;}
});
document.addEventListener('change',e=>{const c=x=>e.target.closest(x);let b;
  if(b=c('[data-bsh]')){B.share[b.dataset.bsh]=e.target.checked;b.closest('label').classList.toggle('is-on',e.target.checked);return;}
  if(c('[data-bp]')){B.parent=e.target.checked;return;}
  if(c('#chatKeep')){P.keep=e.target.checked;save();showToast(P.keep?'대화를 상담 사전자료에 포함해요':'대화를 사전자료에서 뺐어요');return;}
  if(b=c('[data-task]')){P.tasks[b.dataset.task]=e.target.checked;save();renderResult();if(e.target.checked)showToast('후속 과제를 끝냈어요 👏');return;}
  if(b=c('[data-prep]')){P.prep=P.prep||[];const i=+b.dataset.prep;e.target.checked?P.prep.push(i):P.prep=P.prep.filter(x=>x!==i);save();return;}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='chatIn'){ask(e.target.value);e.target.value='';}});
EXP.forEach(x=>{if(P.apps.includes(x.id))x.app++;});
setTab();
})();
