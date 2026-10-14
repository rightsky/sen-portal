/* 플랫폼관리(포털 관리자 모드) : 목업 v2.6 [전체] 플랫폼관리 5메뉴(CMS · 진학프로그램 관리 · 상담시스템 관리 · 통합관리자(+관계 콘솔) · 실시간 정보취합)를 업무시스템 셸 위에 이관하고,
   통합 적용 1~5단계(포털) · 상담시스템 · AI 서비스 관리 · 학습데이터 관리에서 정한 정책값을 「정책 원장」으로 현행화
   역할 : 정보원 Role — 콘텐츠(CMS) · 통계(관리통계·실시간 읽기) · 시스템(전체) · 상태 localStorage 'sen-ops-admin-v1' · 기본 기기: PC */
(function(){
const D=window.ADM_DATA,esc=SEN_OPS.esc,KEY='sen-ops-admin-v1';
const DEF={cmsTab:'codes',adOn:{},modOk:false,cntOk:{},gl:{},glMsg:'',fxRun:false,chgOk:false,hitl:{},mode:'norm',install:{},kTok:false,kMsg:'',cons:{},unit:3,consMsg:'',pend:{},acctMsg:'',sec:{},secMsg:'',relOk:{},audAck:{},audF:'all',statTab:'use',audit:[],fxTab:'gl'};
const clone=o=>JSON.parse(JSON.stringify(o));
let S=(()=>{try{return Object.assign(clone(DEF),JSON.parse(localStorage.getItem(KEY)||'null')||{});}catch(e){return clone(DEF);}})();
let cur=null,ctx=null;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}};
const set=p=>{Object.assign(S,p);save();draw();};
const setK=(key,id,val)=>{const o=Object.assign({},S[key]);if(val===undefined)delete o[id];else o[id]=val;set({[key]:o});};
const toast=m=>window.showToast&&showToast(m);
const now=()=>{const d=new Date();return `${d.getMonth()+1}.${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;};
const who=()=>ctx?`${ctx.auth.name}(${ctx.role.opsRole||''})`:'관리자';
const pushAudit=(act,target,why,before,after)=>{S.audit=[[now(),who(),act,target,why,before+' → '+after,'검증']].concat(S.audit||[]).slice(0,30);};
const stepUp=(why)=>{const A=window.SEN_AUTH;return A&&A.stepUp?A.stepUp(why):Promise.resolve(true);};
/* ── 조각 (상담·AI 업무시스템과 동일 규격 · ops-counsel.css 공유) ── */
const C={blue:['#1f5ed4','#e8effc'],green:['#157f3d','#e6f4ea'],amber:['#b3690a','#fdf1de'],red:['#c03535','#fdeaea'],gray:['#5b6680','#e9edf4'],purple:['#7030a0','#f0e6fa'],teal:['#0f766e','#e6f4f1'],navy:['#fff','#16386f'],link:['#1f4fa3','#e8effc'],dim:['#8a94ac','#eef1f7'],cnt:['#fff','#e8544b']};
const chip=(t,fg,bg,cls='')=>`<span class="ch ${cls}" style="color:${fg};background:${bg}">${t}</span>`;
const chipC=(t,k,cls='')=>chip(t,C[k][0],C[k][1],cls);
const btn=(label,act,arg,cls='',attrs='')=>`<button type="button" class="cbtn ${cls}" data-act="${act}"${arg!=null?` data-arg="${esc(String(arg))}"`:''} ${attrs}>${label}</button>`;
const ft=t=>`<p class="ft">${t}</p>`;
const ok=t=>`<div class="ok">${t}</div>`;
const bar=(w,color='#1f4fa3',h=9)=>`<span class="bar9" style="height:${h}px"><i style="width:${w}%;background:${color}"></i></span>`;
const seg=(items,curK,act)=>`<span class="seg">${items.map(([k,l])=>`<button type="button" aria-pressed="${k===curK}" data-act="${act}" data-arg="${k}">${l}</button>`).join('')}</span>`;
const tgl=(on,label,act,arg,cls='')=>`<button type="button" class="tg ${cls}${on?' is-on':''}" aria-pressed="${on}" data-act="${act}" data-arg="${esc(String(arg))}">${label}</button>`;
const kv=(rows,w=92,cols=2)=>`<div class="kv${cols===1?' kv1':''}">${rows.map(([k,v])=>`<div><span style="width:${w}px">${k}</span><span>${v}</span></div>`).join('')}</div>`;
const gt=(cols,rows,opts={})=>{const tpl=opts.tpl.replace(/(\d*\.?\d+)fr/g,'minmax(0,$1fr)');const hd=`<div class="gt__hd" style="grid-template-columns:${tpl}">${cols.map(c=>`<div>${c.l}</div>`).join('')}</div>`;
 const body=rows.map(r=>`<div class="gt__r${r.cls?' '+r.cls:''}" style="grid-template-columns:${tpl}${r.st?';'+r.st:''}"${r.click?` data-click="${r.click}" data-arg="${esc(String(r.arg))}"`:''}>${r.c.map((x,i)=>`<div data-l="${esc(cols[i].l)}">${x}</div>`).join('')}</div>`).join('');
 return `<div class="gt">${hd}${body}</div>`;};
const STC={CONFIRMED:C.green,REVIEW:C.amber,DRAFT:C.gray,PROVISIONAL:C.dim,ERROR:C.red,승인:C.green,검수중:C.amber,반려:C.red,완료:C.green,대기:C.gray,정상:C.green,'노출 중':C.green,예약:C.blue,종료:C.dim};
const stc=s=>chip(s,(STC[s]||C.gray)[0],(STC[s]||C.gray)[1],'ch--sq');
const desc=k=>`<div class="hilite">${D.desc[k]}</div>`;
const mono=t=>`<span style="font-family:ui-monospace,monospace;font-size:11px;color:#16386f">${t}</span>`;
const aiState=()=>{try{return JSON.parse(localStorage.getItem('sen-ops-ai-v1')||'null')||{};}catch(e){return {};}};
const cnsState=()=>{try{return JSON.parse(localStorage.getItem('sen-ops-counsel-v1')||'null')||{};}catch(e){return {};}};
const isSys=()=>ctx&&ctx.role&&ctx.role.opsRole==='시스템';
const hitlState=()=>{try{return JSON.parse(localStorage.getItem('sen-hitl-v1')||'null')||{};}catch(e){return {};}};
const tStore=()=>{try{return JSON.parse(localStorage.getItem('sen-teacher-store')||'null');}catch(e){return null;}};
const xsysLive=()=>{const ai=aiState(),cn=cnsState(),hs=hitlState();const hitlN=Object.keys(hs).filter(k=>!/_d$/.test(k)).length;const planB=Object.keys(cn.fixed||{}).length;const pre=Object.values(ai.preOk||{}).filter(Boolean).length;return [
 ['상담시스템',`플랜B 확정 ${planB}건 · 게시판 예외 처리 ${Object.keys(cn.olx||{}).length}건 · 단가표 v${S.unit} 적용 · 운영 모드 ${D.modes[S.mode][0]}`,'ops-counsel.html'],
 ['AI 서비스 관리',ai.stt==null?'이 브라우저에서 미진입 — 관제 상태 없음':`STT 합격선 ${ai.stt===2?'회복':ai.stt===1?'카나리':'경계'} · 정책 위반 ${ai.fixVio?0:1} · 승격 ${ai.promoted?'완료':'대기'} · 모델 교체 진행 ${Object.keys(ai.mdl||{}).length}건 · 효용 스냅샷 ${(ai.effSnap||[]).length}`,'ops-ai.html#home'],
 ['학습데이터 관리',`NEIS Plan ${ai.plan||'A'} · 전제조건 ${pre}/5 · 보관 위치 시연 ${ai.store==='pc'?'PC':'교육청'} · D7 확인 ${Object.keys(ai.d7Ack||{}).length}건`,'ops-ai.html#dz'],
 ['교사공간 (포털)',`HITL 처리 ${hitlN}건 (sen-hitl) · 반 실데이터 보관 위치 ${tStore()?(tStore().loc==='pc'?'선생님 PC':'교육청 저장소'):'기본값(교육청)'} · 2차 검토 ${(S.hitl[3]!=null?S.hitl[3]:D.hitlP[3][2])?'필수':'플래그'}`,'teacher.html']];};
const roleOf=()=>ctx&&ctx.role?ctx.role.opsRole:'';
const ro=()=>roleOf()==='통계';
/* ─────────────── 관리자 홈 ─────────────── */
function vHome(el){
  const pendN=D.members.pending.reduce((a,r)=>a+(S.pend[r[0]]?0:r[2]),0);const flag=D.audit.filter(r=>r[6]==='플래그'&&!S.audAck[r[0]]).length;
  const kpis=[['회원',D.members.total.toLocaleString(),'7역할 · 활성 관계 173,800','#16386f'],['승인 대기',pendN,'교사·학교관리자·상담교사·자녀 연결','#b3690a'],['연계 7종',D.integrations.filter(r=>r[2]==='정상').length+' 정상',D.integrations.filter(r=>r[2]!=='정상').map(r=>r[0]+' '+r[2]).join(' · '),'#157f3d'],['배치',D.batches.filter(r=>r[2]==='완료').length+' / '+D.batches.length+' 완료','학년도 전환 대기 (3/1)','#16386f'],['감사 플래그',flag,'야간·대량 조회','#c03535'],['요강 검수',D.guidelines.filter(r=>(S.gl[r[0]]||r[2])==='검수중').length+' 검수중','발행 승인은 2단계 인증','#b3690a']];
  const kpi=`<div class="tiles" style="grid-template-columns:repeat(6,1fr)">${kpis.map(k=>`<div class="tile"><span style="font-size:11.5px;color:#6b7690">${k[0]}</span><b style="color:${k[3]};font-size:22px">${k[1]}</b><span>${k[2]}</span></div>`).join('')}</div>`;
  const todo=D.todo.map(t=>`<div class="lr"><span class="sp">${t[0]}</span><a href="#${t[1]}" class="cbtn cbtn--xs cbtn--line">처리 →</a></div>`).join('');
  const xs=xsysLive().map(x=>`<div class="lr"><b style="min-width:130px">${x[0]}</b><span class="sp" style="font-size:12.5px">${x[1]}</span><a href="${x[2]}" class="cbtn cbtn--xs cbtn--line">열기 ↗</a></div>`).join('');
  const integ=gt([{l:'연계'},{l:'용도'},{l:'상태'},{l:'최근'}],D.integrations.map(r=>({c:[`<b>${r[0]}</b>`,r[1],`<b style="color:${r[2]==='정상'?'#157f3d':'#b3690a'}">${r[2]}</b>${r[0]==='나이스'?' <span class="ft" style="margin:0">(Plan A : 학교관리자 승인 등록 기준 · Plan B 전환 전)</span>':''}`,`<span style="color:#6b7690">${r[3]}</span>`]})),{tpl:'150px 1.4fr 1.2fr 90px'});
  const bat=gt([{l:'배치'},{l:'주기'},{l:'상태'},{l:'비고'}],D.batches.map(r=>({c:[`<b>${r[0]}</b>`,r[1],stc(r[2]),`<span style="color:#6b7690">${r[3]}</span>`]})),{tpl:'1.3fr 90px 80px 1.4fr'});
  el.innerHTML=`<div class="cns">${desc('home')}${kpi}
  <div class="cg2"><section class="cc"><div class="cc__hd"><span>오늘 할 일 — ${who()}</span>${chipC(roleOf()||'Role','navy')}</div><div class="cc__bd np">${todo}</div><div class="cc__ft">Role별로 보이는 메뉴가 다름 — 콘텐츠 : CMS · 통계 : 관리통계·실시간(읽기) · 시스템 : 전체</div></section>
  <section class="cc"><div class="cc__hd"><span>다른 시스템 현재 상태 — 같은 브라우저 상태를 읽음</span>${chipC('실시간 연동','teal')}</div><div class="cc__bd np">${xs}</div><div class="cc__ft">여기서 발행한 값이 가는 곳 — 운영 모드 → 상담시스템 띠·AI 관제·포털 상담 신청 한도 · 단가표 → 상담시스템 수당 · HITL 정책 → 교사공간 판정 승인 · 요강 발행 → AI D1 요강 원장 · 토큰 재발급 → AI D0·D7</div></section></div>
  <div class="cg2"><section class="cc"><div class="cc__hd">운영연계 7종 — 실패 큐</div>${integ}</section><section class="cc"><div class="cc__hd">배치 6종</div>${bat}</section></div></div>`;
}
/* ─────────────── 웹플랫폼 CMS ─────────────── */
function vCms(el){
  const T=S.cmsTab;let body='';
  if(T==='codes')body=`<section class="cc"><div class="cc__hd"><span>코드체계 14 — 마스터 참조 · 변경은 버전 +1</span></div>${gt([{l:'코드'},{l:'이름'},{l:'건수'},{l:'참조'}],D.codes.map(r=>({c:[mono(r[0]),`<b>${r[1]}</b>`,r[2].toLocaleString(),r[0]==='CD-ROLE'?'역할 6 + 업무시스템 Role 7 (권한 매트릭스)':r[0]==='CD-CHANNEL'?'게시판·화상·방문·전화 + 화상 CS-VM':r[0]==='CD-EVENT'?'통지 템플릿 8종 (상담시스템 관리)':r[0]==='CD-SCHOOL'?'학교 648 · 편제표 업로드 12/30 (AI 학업설계 전제)':r[0]==='CD-MENU'?'9대분류 IA · 역할 카드 2대 분기':'—']})),{tpl:'120px 1.2fr 80px 1.6fr'})}</section>`;
  else if(T==='boards')body=`<section class="cc"><div class="cc__hd"><span>게시판 33 → 15 통합 · 자료실 = RAG 지식베이스</span>${chipC('신고 대기 '+(S.modOk?0:2),S.modOk?'green':'cnt')}</div>${gt([{l:'코드'},{l:'게시판'},{l:'통합·정책'},{l:'게시물'},{l:'관리'}],D.boards.map(r=>({c:[mono(r[0]),`<b>${r[1]}</b>`,r[2],r[3].toLocaleString(),r[0]==='B-MOD'?(S.modOk?'<span class="cbtn cbtn--done cbtn--xs">✓ 처리</span>':btn('신고 2건 처리','modOk',null,'cbtn--xs')):r[0]==='B-DATA'?'<span class="ft" style="margin:0">태그 7축 · PII 검사 후 RAG 색인</span>':r[0]==='B-PASS'?'<span class="ft" style="margin:0">개인 식별 없음 · O존 공개 코퍼스</span>':'—']})),{tpl:'100px 1.1fr 1.6fr 80px 160px'})}<div class="cc__ft">공개 게시물은 O존 공개 코퍼스(D0) — PII 검사 ≥0.99 통과 후 게시 · 금칙어 사전 월 1회 갱신</div></section>`;
  else if(T==='ads')body=`<section class="cc"><div class="cc__hd"><span>광고·팝업 — 노출 기간·대상 지정</span></div>${gt([{l:'코드'},{l:'위치'},{l:'내용'},{l:'기간'},{l:'상태'}],D.ads.map(r=>{const st=S.adOn[r[0]]||r[4];return {c:[mono(r[0]),`<b>${r[1]}</b>`,r[2],r[3],`${stc(st)} ${ro()?'':tgl(st==='노출 중','노출','adOn',r[0]+'|노출 중')+tgl(st==='예약','예약','adOn',r[0]+'|예약')+tgl(st==='종료','종료','adOn',r[0]+'|종료')}`]};}),{tpl:'80px 150px 1.6fr 110px 300px'})}<div class="cc__ft">역할 카드 배너(AD-04)는 로그인 전 메인에만 · 특별진학상담 배너는 운영 모드 「특별진학상담」 전환 시 자동 노출</div></section>`;
  else if(T==='contents')body=`<section class="cc"><div class="cc__hd"><span>콘텐츠 마스터 — 입시일정 · 대학 자료 · 과목 길라잡이 · 평가요소 · 알림</span></div>${gt([{l:'항목'},{l:'내용'},{l:'갱신'},{l:'상태'}],D.contents.map(r=>{const st=S.cntOk[r[0]]||r[3];return {c:[`<b>${r[0]}</b>`,r[1],`<span style="color:#6b7690">${r[2]}</span>`,`${stc(st)} ${st==='REVIEW'&&!ro()?btn('승인','cntOk',r[0],'cbtn--xs cbtn--green'):''}`]};}),{tpl:'1fr 2fr 1fr 170px'})}<div class="cc__ft">포털에 반영된 마스터 — 78과목(school-data.js) · 2028 대입 기본자료 8종 캘린더(news) · 학부모 가이드(parent) · 계열·교과 탐구 예시 38건(cases-data.js) · 출처 표기 「서교연 2026 자료집 p.NN」</div></section>`;
  else if(T==='members'){const by=D.members.byRole;const mx=by[0][1];body=`<div class="cg2"><section class="cc"><div class="cc__hd">회원 ${D.members.total.toLocaleString()} — 역할 7</div><div class="cc__bd">${by.map(r=>`<div class="brow"><span class="l" style="width:110px">${r[0]}</span>${bar(Math.max(2,Math.round(r[1]/mx*100)),'#1f4fa3',8)}<span class="v" style="min-width:70px">${r[1].toLocaleString()}</span></div>`).join('')}${ft('역할 상태 8종(미인증 · 승인 대기 · 담임 · 과목교사 · 진학부장 · 정보원 상담교사 · 학교관리자 · 위촉 만료) · 겸직은 역할 2개(교사 + 학부모)')}</div></section><section class="cc"><div class="cc__hd">승인 대기 — 계정·권한 승인에서 처리</div><div class="cc__bd np">${D.members.pending.map(r=>`<div class="lr"><b class="sp">${r[0]}</b><span style="color:#6b7690">${r[1]}</span>${chipC((S.pend[r[0]]?0:r[2])+'건',S.pend[r[0]]?'green':'cnt')}</div>`).join('')}</div><div class="cc__ft"><a href="#acct" style="color:#1f4fa3;font-weight:700">계정·권한 승인 →</a></div></section></div>`;}
  else if(T==='search')body=`<section class="cc"><div class="cc__hd">검색 — 통합 색인 · 무결과 검색어</div><div class="cc__bd">${kv([['색인','매시 · 게시판 15 + 대학 368 + 과목 78 + 직업·학과 사전 · 공개 코퍼스만(O존)'],['무결과 검색어 41','「2028 변표」 12 · 「고교학점제 미이수」 9 · 「특별진학상담 11월」 7 … → FAQ·RAG 시드 후보'],['동의어·금칙어','동의어 318 · 금칙어 122 · 월 1회 갱신'],['RAG 연계','자료실·FAQ·합격 수기 = RAG 1차 응대 코퍼스 · 출처 인용 필수 · 모른다 카드']],110,1)}</div></section>`;
  else body=`<div class="cg2"><section class="cc"><div class="cc__hd">운영연계 7종</div>${gt([{l:'연계'},{l:'용도'},{l:'상태'},{l:'최근'}],D.integrations.map(r=>({c:[`<b>${r[0]}</b>`,r[1],`<b style="color:${r[2]==='정상'?'#157f3d':'#b3690a'}">${r[2]}</b>`,`<span style="color:#6b7690">${r[3]}</span>`]})),{tpl:'140px 1.4fr 1fr 90px'})}<div class="cc__ft">나이스 학적 동기화는 Plan B(배치 연계) 항목 — 전환 전에는 학교관리자 승인 등록 + Plan A 템플릿(AI 서비스 관리 D1) · 어디가는 API 미공개로 파일 수집 · 에듀파인은 수당 조서 수동 업로드</div></section><section class="cc"><div class="cc__hd">배치 6종</div>${gt([{l:'배치'},{l:'주기'},{l:'상태'},{l:'비고'}],D.batches.map(r=>({c:[`<b>${r[0]}</b>`,r[1],stc(r[2]),`<span style="color:#6b7690">${r[3]}</span>`]})),{tpl:'1.3fr 90px 80px 1.4fr'})}</section></div>`;
  el.innerHTML=`<div class="cns">${desc('cms')}<div class="tgs" style="margin-bottom:12px">${[['codes','코드체계 14'],['boards','게시판 15'],['ads','광고·팝업'],['contents','콘텐츠 마스터'],['members','회원'],['search','검색'],['link','운영연계·배치']].map(([k,l])=>tgl(T===k,l,'cmsTab',k)).join('')}</div>${body}</div>`;
}
/* ─────────────── SEN 진학프로그램 관리 : 요강·환산식 원장 ─────────────── */
function vFx(el){
  const T=S.fxTab;
  const glT=gt([{l:'기준표 · 요강'},{l:'원천 · 시기'},{l:'검수 상태'},{l:'비고'},{l:'처리'}],D.guidelines.map(r=>{const st=S.gl[r[0]]||r[2];return {c:[`<b>${r[0]}</b>`,`<span style="color:#6b7690">${r[1]}</span>`,stc(st),r[3],st==='검수중'&&!ro()?btn('발행 승인 (2FA)','glOk',r[0],'cbtn--xs cbtn--green')+btn('반려','glRej',r[0],'cbtn--xs cbtn--line cbtn--red'):st==='PROVISIONAL'?'<span class="ft" style="margin:0">파라미터 확정 대기</span>':'—']};}),{tpl:'1.3fr 1fr 100px 1.4fr 190px'});
  const fxT=gt([{l:'단계'},{l:'내용'},{l:'현황'}],D.fx.map(r=>({c:[`<b>${r[0]}</b>`,r[1],`<b style="color:${/ERROR|CHG_OVER/.test(r[2])?'#c03535':'#16386f'}">${r[2]}</b>`]})),{tpl:'190px 1.6fr 1.2fr'});
  const chg=S.chgOk?ok('✓ CHG_OVER 3건 승인 — AffectedScheme 41 재계산 · 교사공간 수시·정시 지도 환산 참고점 갱신 · 보관함 스냅샷은 [구버전] 표시'):`<div class="soft" style="background:#fdf1de;color:#7a5410"><b>P5 변화감지 — CHG_OVER 3건</b> : 서울시립대 컷 보정 · 건국대 가중치 · 한국외대 최저 — 영향 스킴 41 · 승인 전까지 교사 화면은 이전 CONFIRMED 유지${ro()?'':`<div class="acts">${btn('변경 승인 → 하류 41 재계산 (2FA)','chgOk',null,'cbtn--xs')}</div>`}</div>`;
  const integ=`<div class="gt">${D.integrity.map(r=>`<div class="gt__r" style="grid-template-columns:150px 1.6fr 90px"><div><b>${r[0]}</b></div><div style="color:#5b6680;font-size:12px">${r[1]}</div><div><b style="color:${r[2]?'#b3690a':'#157f3d'}">${r[2]?r[2]+'행 격리':'0'}</b></div></div>`).join('')}</div>`;
  const body=T==='gl'?`<section class="cc"><div class="cc__hd"><span>요강·기준표 원장 — 검수 상태 워크플로 (미검수 → 검수중 → 승인 / 반려)</span>${chipC('승인 '+D.guidelines.filter(r=>(S.gl[r[0]]||r[2])==='승인').length+' · 검수중 '+D.guidelines.filter(r=>(S.gl[r[0]]||r[2])==='검수중').length,'link')}</div>${glT}${S.glMsg?`<div style="padding:8px 14px 0">${ok(S.glMsg)}</div>`:''}<div class="cc__ft">발행 승인 = 교육청 운영담당 · 2단계 인증 · 감사로그(변경 전후 값) · 승인분만 AI 서비스 관리 D1 「모집요강 원장」과 교사공간 수시·정시 지도에 노출 · 대학 마스터 368교 · 2027 시행계획 391교 13시트</div></section>`
   :T==='fx'?`<section class="cc"><div class="cc__hd"><span>환산식 원장 P1~P7 — Zero-Defect 파이프라인</span>${S.fxRun?chipC('P7 골든셋 회귀 실행 — 통과 98.7% · 회귀 0','green'):(ro()?'':btn('P7 골든셋 회귀 실행','fxRun',null,'cbtn--xs cbtn--line'))}</div>${fxT}<div style="padding:10px 14px 12px">${chg}</div><div class="cc__ft">환산식은 결정론 원장(A 결정적 계산) — AI 접점은 요강 추출·전환 검증뿐 · 모델 변경 관리의 「변경 유형 : 환산식」은 이 원장의 버전과 묶여 계보 기록 · '26 고3 표준편차 → '27 성취도 분할점수 분기(NEIS 분석)</div></section>`
   :`<section class="cc"><div class="cc__hd"><span>입력 무결성 4종 — 적재 게이트 (AI 서비스 관리 D1 품질 게이트와 같은 규칙)</span></div><div class="cc__bd np">${integ}</div><div class="cc__ft">격리 행은 개인 식별 없이 행 단위로만 처리 · NEIS Plan A 템플릿 적재분과 학생 제공 데이터 모두 이 4종을 통과해야 S존 적재 · 학평 회차별 변환표 미수신 등록 사고 방지(E-CONSIST)</div></section>`;
  el.innerHTML=`<div class="cns">${desc('fx')}<div class="tgs" style="margin-bottom:12px">${[['gl','요강·기준표 원장 (검수)'],['fx','환산식 원장 P1~P7'],['integ','입력 무결성 4종']].map(([k,l])=>tgl(T===k,l,'fxTab',k)).join('')}</div>${body}</div>`;
}
/* ─────────────── 판정·HITL·AI 정책 ─────────────── */
function vHitl(el){
  const hp=D.hitlP.map((r,i)=>{const on=S.hitl[i]!=null?S.hitl[i]:r[2];return `<div class="lr"><b style="min-width:120px">${r[0]}</b><span class="sp" style="font-size:12.5px">${r[1]}</span>${ro()?chipC(on?'적용':'해제',on?'green':'gray'):tgl(on,on?'적용':'해제','hitl',i)}</div>`;}).join('');
  const ai=aiState();const dist=gt([{l:'구분'},{l:'모듈'},{l:'정책'}],D.aiDist.map(r=>({c:[`<b>${r[0]}</b>`,r[1],`<span style="color:#5b6680">${r[2]}</span>`]})),{tpl:'110px 1.6fr 1.6fr'});
  const eff=gt([{l:'지표'},{l:'규칙'}],D.effRule.map(r=>({c:[`<b>${r[0]}</b>`,r[1]]})),{tpl:'100px 1fr'});
  const gate=gt([{l:'모듈'},{l:'절대 합격선 · 승격 규칙'}],D.gate.map(r=>({c:[`<b>${r[0]}</b>`,r[1]]})),{tpl:'100px 1fr'});
  const live=`<div class="soft" style="background:#fafbfe;font-size:12px"><b>AI 서비스 관리 현재 상태</b> — ${ai.stt==null?'관제 상태 없음(이 브라우저에서 AI 서비스 관리 미진입)':`STT 합격선 ${ai.stt===2?'회복':ai.stt===1?'카나리 중':'경계'} · 정책 위반 ${ai.fixVio?'0':'1'} · 승격 ${ai.promoted?'완료':'대기'} · 효용 스냅샷 ${(ai.effSnap||[]).length}건`} · <a href="ops-ai.html#home" style="color:#1f4fa3;font-weight:700">관제 열기 ↗</a></div>`;
  el.innerHTML=`<div class="cns">${desc('hitl')}<div class="cg2"><section class="cc"><div class="cc__hd"><span>판정 승인(HITL) 정책 — 교사공간 「판정 승인」이 이 값으로 동작</span></div><div class="cc__bd np">${hp}</div><div class="cc__ft">토글 변경은 감사로그 · 교사 액션 4종(승인 · 수정 후 승인 · 반려 · 근거 보강) → 라벨 → 플라이휠 4루프</div></section>
  <section class="cc"><div class="cc__hd">AI 모듈 배분 정책 — 기본 제공 5 · 학교 선택 4</div>${dist}<div class="cc__ft">학교별 On/Off 운영은 AI 서비스 관리 「AI 모듈서비스」 · 여기서는 배분 원칙과 선택 조건만</div></section></div>
  <div class="cg2"><section class="cc"><div class="cc__hd"><span>AI 모듈 효용 평가 — 판정 규칙 ('28)</span>${chipC("'28 적용 · 관리통계에서 열람",'blue')}</div>${eff}</section>
  <section class="cc"><div class="cc__hd">릴리스 게이트 — 절대 합격선 · 모델 변경 승인(4-eyes)</div>${gate}<div style="padding:8px 14px 12px">${live}</div></section></div></div>`;
}
/* ─────────────── 시즌 · 상담모드 · 설치형 ─────────────── */
function vSeason(el){
  const m=D.modes[S.mode];
  const inst=gt([{l:'항목'},{l:'내용'},{l:'현황'},{l:'전환'}],D.install.map(r=>({c:[`<b>${r[0]}</b>`,r[1],`<span style="color:#5b6680">${r[2]}</span>`,r[0]==='IS-CMP'?(S.install.cmp?chipC('CS → 웹 4단계 진행 중 · DRM 통제 단계','blue'):(ro()?'—':btn('웹 전환 단계 진행','install',null,'cbtn--xs cbtn--line'))):r[0]==='IS-LIC'?chipC('2027.3 만료 — 전환 완료 전 1년 연장 검토','amber'):'—']})),{tpl:'150px 1.5fr 1.3fr 230px'});
  el.innerHTML=`<div class="cns">${desc('season')}<section class="cc"><div class="cc__hd"><span>운영 모드 3단 — 상담시스템 · AI 관제 시즌 프로파일 · 포털 배너가 함께 바뀜</span><span class="sp"></span>${ro()?chipC(m[0],'navy'):seg([['norm','상시'],['peak','집중상담기간'],['special','특별진학상담']],S.mode,'mode')}</div><div class="cc__bd">${ok(`<b>${m[0]}</b> — ${m[1]}`)}${kv([['상담시스템','한도·배정 규칙·슬롯 마감 리마인드가 모드별 값으로 · 특별진학상담은 지원단 전원 편성'],['AI 관제','시즌 토글(평시 · 수시 · 정시)과 연동 — 큐 임계 5s → 15s · 동접 500 → 2,000 · O존만 클라우드 버스트'],['포털','특별진학상담 배너(AD-01) 자동 노출 · 상담 신청 화면에 한도 예외(교사 추천 경로) 안내']],90,1)}</div></section>
  <div class="cg2"><section class="cc"><div class="cc__hd">학생상담모드 — 교사공간 (태블릿 기준)</div>${gt([{l:'항목'},{l:'정책'}],D.cmode.map(r=>({c:[`<b>${r[0]}</b>`,r[1]]})),{tpl:'90px 1fr'})}<div class="cc__ft">통합 6단계(교사공간 마무리) 대상 — 정책값은 여기서 먼저 고정</div></section>
  <section class="cc"><div class="cc__hd">설치형 운영 — 기존 교사용 쎈진학(로컬) 전환 기간</div>${inst}<div class="cc__ft">전환 기간 동안 설치본 데이터는 「담임 반 실데이터 보관 위치 : 선생님 PC」와 같은 규격(암호화 컨테이너 · 학년도 전환 파기)으로 통제 · 웹 전환 완료 시 설치본 라이선스 종료</div></section></div></div>`;
}
/* ─────────────── 데이터 정책 원장 ─────────────── */
function vDpol(el){
  const ai=aiState();const pre=ai.preOk||{};const preN=Object.values(pre).filter(Boolean).length;
  const zone=gt([{l:'존'},{l:'데이터'},{l:'보관 규칙'}],D.zoneSum.map(r=>({c:[`<b>${r[0]}</b>`,r[1],`<span style="color:#5b6680">${r[2]}</span>`]})),{tpl:'130px 2fr 1.2fr'});
  const key=D.keyP.map(r=>`<div class="lr"><b style="min-width:150px">${r[0]}</b><span class="sp" style="font-size:12.5px">${r[1]}</span></div>`).join('');
  const tokBtn=S.kTok?ok('✓ 토큰 전체 재발급 완료 (시연) — DATA 토큰 열 교체 · 계보 기록 · 담임 반 조인 서비스 재연결 · AI 서비스 관리 D7 통지'):(isSys()?`<div class="acts">${btn('토큰 전체 재발급 — KEY 유출·PC 분실 대응 (2FA)','kTok',null,'cbtn--xs cbtn--line cbtn--red')}<span class="ft" style="margin:0">시스템 Role만 · 실행 시 AI 서비스 관리 D7 접근 로그와 감사로그에 기록</span></div>`:ft('토큰 재발급은 시스템 Role만 실행'));
  const planBox=`<div class="soft" style="background:#fafbfe"><b>NEIS 획득 경로</b> — 기본 설계 <b>Plan A 현행 방식</b>(교사 다운로드 → 표준 템플릿 · 게이트) · Plan B 배치 연계는 전제조건 5종 충족 시 전환 — 현재 ${preN} / 5 충족 ${preN===5?chipC('전환 가능','green'):chipC('Plan A 유지','gray')}<div class="tgs" style="margin-top:6px">${['① 법적 근거·동의','② 연계 심의','③ 등급·망 배치','④ 코드·스키마 표준','⑤ 시험·운영 체계'].map(k=>chipC((pre[k]?'✓ ':'')+k,pre[k]?'green':'dim')).join('')}</div><p class="ft" style="margin:6px 0 0">충족 기록은 AI 서비스 관리 D1 「전제조건」 탭에서 · 협의 창구 : 교육연구정보원 나이스운영과 → 본청 학생역량·혁신교육과(학생부) · 중등교육과(학점제) · 정보보호팀 · 성과평가통계팀 · KERIS</p></div>`;
  el.innerHTML=`<div class="cns">${desc('dpol')}<div class="tiles t3"><div class="tile"><b style="color:#c03535">입고 시 비식별이 기본</b><span>교육청 서버 입고분은 가명 토큰 처리 후 저장 · 유일한 예외 = 담임 반 학생 실데이터</span></div><div class="tile"><b style="color:#b3690a">S존 = 데이터 ∥ Key 분리</b><span>KEY(성명·반·번호) / DATA(토큰·성적) — 키 A·B HSM 분리 · 계정·백업 분리 · 조인은 S존 서비스만</span></div><div class="tile"><b style="color:#1f5ed4">온톨로지 · LPG는 '28</b><span>'27 카탈로그·계보는 테이블 원장 · '28 DCAT·Croissant·PROV-O + LPG 구축 (2차 발주)</span></div></div>
  <section class="cc"><div class="cc__hd"><span>N²SF 존 분류 11종 — 상세는 AI 서비스 관리 D0</span><a href="ops-ai.html#dz" class="cbtn cbtn--xs cbtn--line">D0 열기 ↗</a></div>${zone}</section>
  <div class="cg2"><section class="cc"><div class="cc__hd"><span>담임 반 실데이터 보관 위치 — 정책값</span>${tStore()?chipC('이 브라우저 교사공간 선택 : '+(tStore().loc==='pc'?'선생님 PC':'교육청 저장소'),'link'):chipC('교사공간 선택 없음 — 기본값','gray')}</div>${gt([{l:'항목'},{l:'값'}],D.storeP.map(r=>({c:[`<b>${r[0]}</b>`,r[1]]})),{tpl:'110px 1fr'})}<div class="cc__ft">현황(학교별 PC/교육청 반 수)은 AI 서비스 관리 D1 · 선택 UI는 교사공간 「반 관리」</div></section>
  <section class="cc"><div class="cc__hd"><span>S존 KEY ∥ DATA 키 관리</span>${chipC('키 교체 연 1회 · 다음 2027.03','link')}</div><div class="cc__bd np">${key}</div><div class="cc__bd">${tokBtn}${S.kMsg?ok(S.kMsg):''}</div></section></div>
  <section class="cc"><div class="cc__hd">NEIS 연계 — Plan A / Plan B 전제조건 상태</div><div class="cc__bd">${planBox}</div></section>
  <div class="cg2"><section class="cc"><div class="cc__hd">재현데이터 재식별 위험 임계 (PROVISIONAL)</div>${gt([{l:'항목'},{l:'값'}],D.repP.map(r=>({c:[`<b>${r[0]}</b>`,r[1]]})),{tpl:'140px 1fr'})}<div class="cc__ft">재현은 S존 학습 평면 전용 · 배포 불가 · 교사 화면 노출 금지 · 합성(1:1 없음)만 O존 배포</div></section>
  <section class="cc"><div class="cc__hd">보존·파기</div>${gt([{l:'데이터'},{l:'기한'}],D.retention.map(r=>({c:[`<b>${r[0]}</b>`,r[1]]})),{tpl:'1fr 1.4fr'})}<div class="cc__ft">「N일·N년」은 열린 결정 — 확정 시 이 원장만 바꾸면 상담시스템·AI 서비스 관리에 같은 값이 보임</div></section></div></div>`;
}
/* ─────────────── 상담시스템 관리 ─────────────── */
function vCons(el){
  const pol=gt([{l:'정책'},{l:'값'},{l:'상담시스템'}],D.consPolicies.map(r=>{const v=r[0]==='단가표 마스터'?`지원단×유형×채널×시점 · 버전 v${S.unit} (온라인 15,000 · 화상 ${S.unit>=4?'45,000':'40,000'} · 방문 50,000 · 전화 0)`:r[0]==='동의·파기'?'동의 3종(제3자 제공 · 기록 연계 · 보호자) · 녹취 90일 · 상담 원장 시즌 후 60일 열람 종료 · 통장사본 N년(열린 결정)':r[0]==='운영 모드'?`상시 / 집중상담기간 / 특별진학상담(연 3회) — 현재 <b>${D.modes[S.mode][0]}</b> (시즌·상담모드에서 전환)`:r[0]==='플랜B'?'대체 교사(휴식중 풀) 또는 다음 슬롯 2개 · D-1 18시 이전 자동 · 사과 문자(방문) · 교사 사유는 교사 이력 원장·수당 상세에 자동 기입':r[1];return {c:[`<b>${r[0]}</b>`,v,r[2]!=='—'?`<a href="${r[2].replace('#','.html#')}" style="color:#1f4fa3;font-weight:700;font-size:12px">열기 ↗</a>`:'—']};}),{tpl:'130px 2.2fr 90px'});
  const vm=gt([{l:'항목'},{l:'정책값'}],D.vm.map(r=>({c:[`<b>${r[0]}</b>`,r[1]]})),{tpl:'100px 1fr'});
  const cns=cnsState();
  el.innerHTML=`<div class="cns">${desc('cons')}<section class="cc"><div class="cc__hd"><span>상담 정책 10 — 상담시스템은 이 값으로 동작</span><span class="sp"></span>${ro()?'':(S.unit>=4?chipC('단가표 v4 발행 — 화상 45,000','green'):btn('단가표 v4 개정 발행 — 화상 40,000 → 45,000 (2FA)','unit',null,'cbtn--xs cbtn--line'))}</div>${pol}${S.consMsg?`<div style="padding:8px 14px 0">${ok(S.consMsg)}</div>`:''}<div class="cc__ft">위촉 명부 100명 · 후보 풀 412 · 슬롯 등록 = 「확정 가능 · 예비」 라벨 · 예외 큐는 별도 패널 없이 게시판·화상·방문 화면에 녹임(상담시스템 결정) · 실무사 화면에 보이는 값은 모두 여기서 발행</div></section>
  <div class="cg2"><section class="cc"><div class="cc__hd"><span>화상 솔루션 정책 (CS-VM)</span>${chipC('자체 WebRTC · 동접 20 · 녹취 90일 · STT 상호 동의','teal')}</div>${vm}</section>
  <section class="cc"><div class="cc__hd">통지 템플릿 8종 · 위촉 명부</div><div class="cc__bd"><div class="tgs">${D.notif.map(n=>chipC(n,'link')).join('')}<span class="ft" style="margin:0">알림톡 → 문자 폴백 · 발신 센터 대표번호 · 이벤트 코드 CD-EVENT 8</span></div>${kv([['위촉 명부','100명 · 4.1 위촉 ~ 익년 3.31 만료 · 자동 회수 · 재위촉 연 단위'],['이 브라우저 상담시스템 상태',Object.keys(cns).length?'진입 기록 있음 — 실무사 화면 상태 '+Object.keys(cns).length+'키':'진입 기록 없음'],['신청 한도','학기당 1회(학부모 합산) · 센터 방문·화상 포함 · 교사 추천 경로 예외(특별진학상담)'],['만족도','종결 즉시 3문항 · 48h 리마인드 1회 · 교사 익명 집계 · 관리통계 반영']],130,1)}</div></section></div></div>`;
}
/* ─────────────── 통합관리자 : 계정·권한 승인 ─────────────── */
function vAcct(el){
  const idp=gt([{l:'보증'},{l:'IdP'},{l:'할 수 있는 것'},{l:'역할'}],D.idp.map(r=>({c:[chipC(r[0],r[0]==='L3'?'navy':r[0]==='L2'?'blue':'gray'),`<b>${r[1]}</b>`,r[2],`<span style="color:#6b7690">${r[3]}</span>`]})),{tpl:'60px 1fr 1.8fr 1fr'});
  const pend=D.members.pending.map(r=>`<div class="lr"><b style="min-width:200px">${r[0]}</b><span class="sp" style="color:#6b7690">${r[1]}</span>${S.pend[r[0]]?chipC('✓ 처리 완료 · 감사로그','green'):chipC(r[2]+'건','cnt')+(ro()?'':btn(r[0]==='학교관리자 지정'?'교육청 승인 (2FA)':'일괄 승인','pendOk',r[0],'cbtn--xs '+(r[0]==='학교관리자 지정'?'cbtn--green':'cbtn--line')))}</div>`).join('');
  const escT=gt([{l:'승격'},{l:'절차'},{l:'승인 Role'}],D.esc.map(r=>({c:[`<b>${r[0]}</b>`,r[1],chipC(r[2],'navy')]})),{tpl:'170px 2fr 120px'});
  let am='B';try{am=localStorage.getItem('sen-authmode')||'B';}catch(e){}
  el.innerHTML=`<div class="cns">${desc('acct')}<div class="cg2"><section class="cc"><div class="cc__hd"><span>승인 대기 큐</span>${chipC(D.members.pending.filter(r=>!S.pend[r[0]]).length+' 종류','link')}</div><div class="cc__bd np">${pend}</div>${S.acctMsg?`<div class="cc__bd">${ok(S.acctMsg)}</div>`:''}<div class="cc__ft">교사 가입 승인은 학교관리자(교사공간 「학교 관리 ① 승인함」)가 1차, 여기서는 정체·지연 건 일괄 처리 · 학교관리자 지정만 교육청 승인(2FA)</div></section>
  <section class="cc"><div class="cc__hd">인증 체계 — 통합 로그인 (포털 1단계)</div>${idp}<div class="cc__bd">${kv([['기본 방식','B안 교육디지털원패스 + Step-up 2FA · A안 GPKI는 비교용 스위치 (현재 <b>'+am+'안</b> · 교사공간 학교 관리에서 전환)'],['업무시스템 진입','원패스 L3 + 정보원 Role + 2단계 인증 · 관리자 세션 15분'],['회원가입','4단계 · 동의 2종 · 학생은 원패스 1순위 + 소셜 재로그인 · 교사·교육청은 원패스만']],100,1)}</div></section></div>
  <section class="cc"><div class="cc__hd">역할 승격 3종 (ESC)</div>${escT}<div class="cc__ft">인증 ≠ 계정 ≠ 역할 ≠ 관계 · 모든 역할에 임기(RoleTerm) · 겸직(교사 = 학부모)은 역할 2개 · 자녀 건 자동 제외</div></section></div>`;
}
/* ─────────────── 보안·인증 정책 10종 ─────────────── */
function vSec(el){
  const rows=D.security.map(r=>{const v=S.sec[r[0]]||r[2];return `<div class="lr" style="flex-wrap:wrap"><span style="font-family:ui-monospace,monospace;font-weight:800;color:#16386f;min-width:70px">${r[0]}</span><b style="min-width:150px">${r[1]}</b><span class="sp" style="font-size:12.5px">${v}</span>${r[0]==='SESS'&&isSys()?(S.sec.SESS?chipC('변경됨 · 감사로그','green'):btn('관리자 세션 15 → 10분 (2FA)','secEdit','SESS','cbtn--xs cbtn--line')):''}${r[0]==='2FA'?chipC('+ 모델 승격 승인 · 보관 위치 변경 · 토큰 재발급','link'):''}</div>`;}).join('');
  el.innerHTML=`<div class="cns">${desc('sec')}<section class="cc"><div class="cc__hd"><span>보안 정책 10종 (MG-A4)</span>${chipC('값 변경 = 2FA + 변경 전후 값 감사','red')}</div><div class="cc__bd np">${rows}</div>${S.secMsg?`<div class="cc__bd">${ok(S.secMsg)}</div>`:''}<div class="cc__ft">2026-10-14 추가된 Step-up 2FA 대상 : 모델 승격 승인(4-eyes) · 담임 반 실데이터 보관 위치 변경 · 토큰 전체 재발급 · 단가표 발행 · 요강 발행 승인 · 학교관리자 지정 · 상담교사 배정 수락 · 첫 HITL 승인(10분 유지)</div></section>
  <div class="cg2"><div class="soft"><b>데이터 보안과의 관계</b> — 계정·세션은 여기, 데이터 존·분리 보관·키는 「데이터 정책 원장」 · 두 원장이 함께 N²SF S존 요건을 구성</div><div class="soft"><b>워터마크</b> — 실데이터 열람 화면 · 내보내기 파일 「수신자·재배포 금지」 · 업무시스템 3종 하단 열람자·시각 표기</div></div></div>`;
}
/* ─────────────── 권한 매트릭스 ─────────────── */
function vPerm(el){
  const M=D.matrix;const cell=v=>v==='—'?'<span style="color:#c9d2e3">—</span>':chip(v,v.startsWith('A')?'#fff':v.startsWith('W')?'#7030a0':'#1f4fa3',v.startsWith('A')?'#16386f':v.startsWith('W')?'#f0e6fa':'#e8effc','ch--sq');
  const mat=`<div class="gt"><div class="gt__hd" style="grid-template-columns:110px repeat(${M.areas.length},1fr)"><div>역할 \\ 영역</div>${M.areas.map(a=>`<div style="font-size:11px">${a}</div>`).join('')}</div>${M.rows.map(r=>`<div class="gt__r" style="grid-template-columns:110px repeat(${M.areas.length},1fr)"><div><b>${r[0]}</b></div>${r.slice(1).map(v=>`<div>${cell(v)}</div>`).join('')}</div>`).join('')}</div>`;
  const om=gt([{l:'정보원 Role (데모 신원)'},{l:'상담시스템'},{l:'AI 서비스 관리'},{l:'플랫폼관리'}],D.opsMat.map(r=>({c:[`<b>${r[0]}</b>`,cell(r[1]),cell(r[2]),cell(r[3])]})),{tpl:'1.4fr 1fr 1fr 1fr'});
  const roles=gt([{l:'운영 역할'},{l:'범위'},{l:'할 수 있는 것'},{l:'회수 시점'}],D.opsRoles.map(r=>({c:[`<b>${r[0]}</b>`,r[1],r[2],`<span style="color:#6b7690">${r[3]}</span>`]})),{tpl:'150px 1fr 1.8fr 1fr'});
  el.innerHTML=`<div class="cns">${desc('perm')}<section class="cc"><div class="cc__hd"><span>포털 역할 6 × 영역 9 (MG-A2)</span><span class="path">R 읽기 · W 쓰기 · A 승인/관리 · 괄호 = 범위</span></div>${mat}<div class="cc__ft">UI · DB · API 3중 RBAC · 학년도 전환 시 일괄 재승인 · 교사의 AI W = 교사공간 HITL·학생상담모드, 플랫폼관리 A는 교육청·시스템만</div></section>
  <section class="cc"><div class="cc__hd">업무시스템 3종 × 정보원 Role 7 — ops-shell 게이트가 이 표로 진입을 막음</div>${om}<div class="cc__ft">콘텐츠 Role은 CMS만 · 통계 Role은 읽기(관리통계·실시간) · 시스템 Role은 전체 + 승인(모델 승격 4-eyes · 토큰 재발급 · 보안 정책) · 위촉 상담 선생님은 교사 역할로 들어와 게이트에서 상담교사로 전환</div></section>
  <section class="cc"><div class="cc__hd">운영 역할 10 — 범위 · 권한 · 회수</div>${roles}</section></div>`;
}
/* ─────────────── 관계 관리 콘솔 (famAdmin) ─────────────── */
function vRel(el){
  const R=D.rel;const kp=`<div class="tiles" style="grid-template-columns:repeat(6,1fr)">${R.kpi.map(k=>`<div class="tile"><span style="font-size:11.5px;color:#6b7690">${k[0]}</span><b style="font-size:22px;color:${/예외|초과|없는|차이/.test(k[0])?'#b3690a':'#16386f'}">${k[1].toLocaleString()}</b></div>`).join('')}</div>`;
  const q=R.queue.map((r,i)=>`<div class="lr"><b style="min-width:190px">${r[0]}</b><span style="min-width:180px">${r[1]}</span><span class="sp" style="color:#6b7690;font-size:12px">${r[2]}</span>${S.relOk[i]?chipC('✓ '+(r[3]==='검토'?'검토 완료':'승인')+' · 이벤트 기록','green'):(ro()?chipC(r[3]+' 대기','gray'):btn(r[3],'relOk',i,'cbtn--xs '+(r[3]==='승인'?'cbtn--green':'cbtn--line')))}</div>`).join('');
  const par=gt([{l:'정책'},{l:'값'}],R.params.map(r=>({c:[`<b>${r[0]}</b>`,r[1]]})),{tpl:'150px 1fr'});
  el.innerHTML=`<div class="cns">${desc('rel')}${kp}<section class="cc"><div class="cc__hd"><span>변동 큐 — 관계 이벤트 (append-only)</span>${chipC(R.queue.filter((r,i)=>!S.relOk[i]).length+'건 대기','cnt')}</div><div class="cc__bd np">${q}</div><div class="cc__ft">자녀 연결 3경로 : A 나이스 보호자 관계(Plan B 자동 · 지금은 학교 확인) · B 초대코드·QR → 자녀 승인 · C 학교 확인 요청 · 단독 지정 없음 · 상한 4명 · 열람은 자녀에게 기록</div></section>
  <div class="cg2"><section class="cc"><div class="cc__hd">나이스 동기화 — Plan A 전환 전 운영</div><div class="cc__bd">${kv([['현재','학적·담임·학급은 학교관리자 승인 등록(교사공간 학교 관리 ③ 학생 매핑) + NEIS Plan A 학적 템플릿 · 보호자 관계는 초대코드·학교 확인'],['차이 18건','학교 등록 vs NEIS 템플릿 불일치 → 변동 큐 · 학교관리자 확인 후 반영'],['Plan B 전환 시','독서로 방식 일배치 + 변동 실시간 · 보호자 승인 자동 연결 · 이 콘솔의 큐가 자동 생성'],['원패스','학생·교사 속성은 원패스 SSO에서 — 계정 보증 = 연결 IdP 최고값']],90,1)}</div></section>
  <section class="cc"><div class="cc__hd">관계 정책 5</div>${par}<div class="cc__ft">학년도 전환(3/1) 배치 : 담임 재지정 · 전임 14일 읽기 · 졸업생 보호자 관계 종료 · 담임 반 실데이터 보관 위치 재선택 안내</div></section></div></div>`;
}
/* ─────────────── 감사로그 ─────────────── */
function vAudit(el){
  const all=(S.audit||[]).map(r=>r.concat(['this'])).concat(D.audit);const F=S.audF;const rows=all.filter(r=>F==='all'||(F==='flag'?r[6]==='플래그':F==='this'?r[7]==='this':true));
  const t=gt([{l:'시각'},{l:'행위자'},{l:'행위'},{l:'대상'},{l:'사유·범위'},{l:'변경 전 → 후'},{l:'검증'}],rows.map(r=>({st:r[7]==='this'?'background:#f7faff':r[6]==='플래그'&&!S.audAck[r[0]]?'background:#fff8f8':'',c:[mono(r[0]),`<b>${r[1]}</b>`,chipC(r[2],/조회/.test(r[2])?'amber':/승인|배포|게시/.test(r[2])?'green':'link'),r[3],`<span style="color:#6b7690;font-size:12px">${r[4]}</span>`,`<span style="font-size:12px">${r[5]}</span>`,r[6]==='플래그'?(S.audAck[r[0]]?chipC('✓ 확인 · 사유 기록','green'):chipC('⚠ 플래그','red')+(ro()?'':btn('확인','audAck',r[0],'cbtn--xs cbtn--line'))):r[7]==='this'?chipC('이 세션','link'):chipC('검증','gray')]})),{tpl:'90px 120px 80px 1.2fr 1.2fr 1.2fr 150px'});
  el.innerHTML=`<div class="cns">${desc('audit')}<section class="cc"><div class="cc__hd"><span>감사로그 — 변경 전후 값 (MG-E3) · 이상 탐지</span><span class="sp"></span>${[['all','전체'],['flag','플래그'],['this','이 세션']].map(([k,l])=>tgl(F===k,l,'audF',k)).join('')}</div>${t}<div class="cc__ft">업무시스템 3종의 변경이 모두 여기로 — 상담시스템(배정·수당 결재) · AI 서비스 관리(승격 승인 · D7 접근 로그) · 플랫폼관리(정책값 · 권한) · 보존 5년 · 플래그는 담당자 확인·사유 기록 후 종결</div></section></div>`;
}
/* ─────────────── 관리통계 ─────────────── */
function vStat(el){
  const T=S.statTab;const ai=aiState();const snaps=ai.effSnap||[];
  const hs=hitlState();const hitlN=Object.keys(hs).filter(k=>!/_d$/.test(k)).length;const usage=D.usage.map(u=>u[0]==='HITL'?['HITL (교사공간 실시간)',`이 브라우저 처리 ${hitlN}건 · 대기 ${Math.max(0,4-hitlN)} · 10초 미만 연속 승인 알림 2 · 2차 검토 플래그 7`]:u);
  const use=`<div class="tiles" style="grid-template-columns:repeat(3,1fr)">${usage.map(u=>`<div class="tile"><b style="font-size:15px;color:#16386f">${u[0]}</b><span>${u[1]}</span></div>`).join('')}</div>`;
  const effT=gt([{l:'모듈'},{l:'활용률'},{l:'품질'},{l:'재사용'},{l:'교사 평가'},{l:'판정 초안'}],D.effStat.map(r=>({c:[`<b>${r[0]}</b>`,`${bar(r[1],r[1]>=60?'#157f3d':r[1]>=30?'#1f4fa3':'#b3690a',8)} <span class="v">${r[1]}%</span>`,r[2],r[3]?r[3]+'%':'—',r[4]==='—'?'—':`<b style="color:${r[4]>=4?'#157f3d':'#b3690a'}">${r[4]}</b>`,chipC(r[5],/보완|중단/.test(r[5])?'amber':'green')]})),{tpl:'1.1fr 1.3fr 1fr 70px 80px 1.2fr'});
  const snapL=snaps.length?snaps.map(s=>`<div class="lr"><span style="font-family:ui-monospace,monospace;font-size:11px;color:#8a94ac;min-width:88px">${s[0]}</span><b class="sp">${s[1]}</b><span style="color:#6b7690;font-size:12px">${s[2]}</span>${chipC('AI 서비스 관리에서 저장','teal')}</div>`).join(''):`<div class="lr"><span class="sp" style="color:#8a94ac">이 브라우저에 저장된 스냅샷 없음 — AI 서비스 관리 「AI 모듈서비스」에서 「분기 스냅샷 저장」을 누르면 여기 나타남</span><a href="ops-ai.html#mods" class="cbtn cbtn--xs cbtn--line">열기 ↗</a></div>`;
  const body=T==='use'?`${use}<section class="cc"><div class="cc__hd">보고서 — 소집단 억제 · 워터마크</div><div class="cc__bd">${kv([['소집단','5명 미만 셀 「<5」 · 개인 식별 조합 금지 · 반 단위 집계는 D1과 같은 규칙'],['산출','매일 03:00 배치(MG-C4) · 재산출 가능 · 산출 시점·원천 배지 필수'],['내보내기','PDF·엑셀 · 수신자·재배포 금지 워터마크 · 감사로그'],['역할','교육청 운영담당 · 통계 Role(읽기) · 학교는 교사공간 진학통계(6단계)에서 자기 학교만']],80,1)}</div></section>`
   :`<section class="cc"><div class="cc__hd"><span>AI 모듈 효용 평가 — 분기 스냅샷 열람</span>${chipC("'28 적용 기능 · 판정은 교육청 AI 거버넌스 연 1회",'blue')}</div><div class="cc__bd np">${snapL}</div></section><section class="cc"><div class="cc__hd"><span>'28 1Q 집계 (관내 전체 · 활용 · 품질 · 재사용 · 교사 평가)</span><span class="path">판정 규칙은 「판정·HITL·AI 정책」</span></div>${effT}<div class="cc__ft">학교별 값은 AI 서비스 관리 「AI 모듈서비스」 효용 평가 블록 · 여기서는 전체 집계와 판정 초안만 · '28 2회분으로 '29 배분 정책(기본·선택) 반영</div></section>`;
  el.innerHTML=`<div class="cns">${desc('stat')}<div class="tgs" style="margin-bottom:12px">${[['use','이용 통계'],['eff',"AI 모듈 효용 평가 ('28)"]].map(([k,l])=>tgl(T===k,l,'statTab',k)).join('')}</div>${body}</div>`;
}
/* ─────────────── 실시간 정보취합 ─────────────── */
function vLive(el){
  const L=D.live;const mx=L.top[0][1];
  const top=gt([{l:'#'},{l:'대학 · 학과'},{l:'관심 등록'},{l:'추세'}],L.top.map((r,i)=>({c:[`<b style="color:#8a94ac">${i+1}</b>`,`<b>${r[0]}</b>`,`${bar(Math.round(r[1]/mx*100),'#1f4fa3',8)} <span class="v">${r[1].toLocaleString()}</span>`,`<b style="color:${r[2].startsWith('▲')?'#c03535':r[2].startsWith('▼')?'#1f5ed4':'#8a94ac'}">${r[2]}</b>`]})),{tpl:'36px 1.4fr 1.6fr 70px'});
  el.innerHTML=`<div class="cns">${desc('live')}<div class="cga"><section class="cc"><div class="cc__hd"><span>선호 대학·학과 TOP 15</span>${chipC('5분 배치 · 가명 집계 · 1인 1일 1회','gray')}<span class="path">산출 ${now()} · 원천 [합성]</span></div>${top}</section>
  <div class="stack"><section class="cc"><div class="cc__hd">급상승 5</div><div class="cc__bd np">${L.surge.map(r=>`<div class="lr"><b class="sp">${r[0]}</b><b style="color:#c03535">${r[1]}</b><span style="color:#6b7690;font-size:12px">${r[2]}</span></div>`).join('')}</div></section>
  <section class="cc"><div class="cc__hd">자치구 · 원천</div><div class="cc__bd">${L.gu.map(g=>`<div class="brow"><span class="l" style="width:60px">${g[0]}</span>${bar(g[1]*6,'#7030a0',8)}<span class="v">${g[1]}%</span></div>`).join('')}<div style="margin-top:8px">${L.src.map(s=>`<div class="brow"><span class="l" style="width:200px;font-size:11.5px">${s[0]}</span>${bar(s[1],'#0f766e',8)}<span class="v">${s[1]}%</span></div>`).join('')}</div>${ft('학생 관심 등록 · 진로 찾기 · 빠른 진단 · 상담 희망(상담시스템) · 챗봇(RAG) 집계 — 개인 식별 없음 · 5명 미만 자치구 억제 · 특별진학상담 편성 근거')}</div></section></div></div></div>`;
}
/* ─────────────── 액션 ─────────────── */
const ACT={
 cmsTab:a=>set({cmsTab:a}),fxTab:a=>set({fxTab:a}),statTab:a=>set({statTab:a}),audF:a=>set({audF:a}),
 modOk:()=>{pushAudit('처리','B-MOD 신고 2건','금칙어 · 개인정보 노출','대기 2','처리 0');set({modOk:true});toast('신고 2건 처리 — 숨김 · 작성자 통지 · 감사로그');},
 adOn:a=>{const [id,st]=a.split('|');pushAudit('게시',id+' '+st,'노출 상태 변경',(S.adOn[id]||D.ads.find(r=>r[0]===id)[4]),st);setK('adOn',id,st);toast(`${id} → ${st}`);},
 cntOk:a=>{pushAudit('승인',a,'콘텐츠 마스터 검수','REVIEW','CONFIRMED');setK('cntOk',a,'CONFIRMED');toast(a+' 승인 — 포털 반영');},
 glOk:a=>{stepUp('요강 발행 승인').then(()=>{pushAudit('승인',a,'교육청 운영담당 발행 승인 · 2FA','검수중','승인');const g=Object.assign({},S.gl);g[a]='승인';set({gl:g,glMsg:`✓ ${a} 발행 승인 — AI 서비스 관리 D1 요강 원장 · 교사공간 수시·정시 지도에 반영`});toast('발행 승인 — 2단계 인증 · 감사로그');});},
 glRej:a=>{pushAudit('반려',a,'출처 대조 불일치 · 재검수','검수중','반려');const g=Object.assign({},S.gl);g[a]='반려';set({gl:g,glMsg:`${a} 반려 — 데이터 담당 재검수 큐`});},
 fxRun:()=>{pushAudit('실행','P7 골든셋 회귀','세트 2벌 · 가상학생','—','통과 98.7%');set({fxRun:true});toast('P7 골든셋 회귀 — 통과 98.7% · 회귀 0');},
 chgOk:()=>{stepUp('환산식 변경 승인').then(()=>{pushAudit('승인','P5 CHG_OVER 3건','AffectedScheme 41 재계산','이전 CONFIRMED','신규 CONFIRMED');set({chgOk:true});toast('변경 승인 — 하류 41 재계산 · 보관함 [구버전] 표시');});},
 hitl:a=>{const i=+a;const curV=S.hitl[i]!=null?S.hitl[i]:D.hitlP[i][2];pushAudit('정책','HITL · '+D.hitlP[i][0],'판정 승인 정책 토글',curV?'적용':'해제',curV?'해제':'적용');setK('hitl',i,!curV);toast(`${D.hitlP[i][0]} — ${curV?'해제':'적용'} · 교사공간 HITL 즉시 반영`);},
 mode:a=>{pushAudit('정책','운영 모드','상담시스템 · AI 관제 · 포털 배너 연동',D.modes[S.mode][0],D.modes[a][0]);set({mode:a});toast(`운영 모드 → ${D.modes[a][0]}`);},
 install:()=>{setK('install','cmp',true);toast('설치본 → 웹 전환 4단계 진행 — DRM 통제 단계');},
 kTok:()=>{stepUp('토큰 전체 재발급').then(()=>{pushAudit('실행','S존 토큰 전체 재발급','KEY 유출·PC 분실 대응 시연','토큰 v1','토큰 v2 (DATA 열 교체)');set({kTok:true,kMsg:'계보 기록 · 담임 반 조인 서비스 재연결 · AI 서비스 관리 D7 통지 — 소요 40분(시연은 즉시)'});toast('토큰 전체 재발급 — 2단계 인증 · 감사로그');});},
 unit:()=>{stepUp('단가표 v4 발행').then(()=>{pushAudit('발행','단가표 마스터','화상 단가 개정 · 10.31 조서부터 적용','v3 화상 40,000','v4 화상 45,000');set({unit:4,consMsg:'✓ 단가표 v4 발행 — 상담시스템 수당관리(조서)에 다음 조서부터 적용 · 이전 조서는 v3 고정'});toast('단가표 v4 발행 — 2단계 인증');});},
 pendOk:a=>{const go=()=>{pushAudit('승인',a,'승인 대기 큐 일괄 처리','pending','active');setK('pend',a,true);set({acctMsg:`✓ ${a} 처리 — 대상자 통지 · 역할 상태 active · 감사로그`});toast(a+' 처리');};if(a==='학교관리자 지정')stepUp('학교관리자 지정 승인').then(go);else go();},
 secEdit:a=>{stepUp('보안 정책 변경').then(()=>{pushAudit('정책','SESS 세션 만료','관리자 세션 단축','관리자 15분','관리자 10분');setK('sec',a,'일반 30분 · 관리자 10분 · 학생상담모드 무입력 10분');set({secMsg:'✓ SESS 변경 — 업무시스템 3종 다음 진입부터 10분 · 변경 전후 값 감사로그'});toast('보안 정책 변경 — 2단계 인증');});},
 relOk:a=>{const r=D.rel.queue[+a];pushAudit(r[3]==='승인'?'승인':'검토','관계 · '+r[0],r[1],r[2],'이벤트 기록');setK('relOk',a,true);toast(`${r[0]} — ${r[3]} · append-only 이벤트`);},
 audAck:a=>{setK('audAck',a,true);toast('플래그 확인 — 사유 기록 · 종결');},
 reset:()=>{S=clone(DEF);save();draw();toast('데모 상태 초기화');},
 noop:a=>toast(a||'목업')};
document.addEventListener('click',e=>{const t=e.target.closest('[data-act],[data-click]');if(!t||!t.closest('#opsView'))return;const fn=ACT[t.dataset.act||t.dataset.click];if(!fn)return;if(t.tagName==='A')e.preventDefault();fn(t.dataset.arg,t);});
/* ─────────────── 렌더 · 메뉴 · 초기화 ─────────────── */
const VIEWS={home:vHome,cms:vCms,fx:vFx,hitl:vHitl,season:vSeason,dpol:vDpol,cons:vCons,acct:vAcct,sec:vSec,perm:vPerm,rel:vRel,audit:vAudit,stat:vStat,live:vLive};
function draw(){const el=document.getElementById('opsView');if(!el||!cur||!VIEWS[cur])return;const y=window.scrollY;VIEWS[cur](el);syncBadges();window.scrollTo(0,y);}
function badges(){return {acct:D.members.pending.filter(r=>!S.pend[r[0]]).length,fx:D.guidelines.filter(r=>(S.gl[r[0]]||r[2])==='검수중').length,audit:D.audit.filter(r=>r[6]==='플래그'&&!S.audAck[r[0]]).length,rel:D.rel.queue.filter((r,i)=>!S.relOk[i]).length};}
function syncBadges(){const b=badges();document.querySelectorAll('.ops-side a').forEach(a=>{const k=a.getAttribute('href').slice(1);let n=a.querySelector('.n');if(b[k]){if(!n){n=document.createElement('span');n.className='n';a.appendChild(n);}n.textContent=b[k];}else if(n)n.remove();});}
const ALL=[{k:'home',label:'관리자 홈',grp:'플랫폼'},{k:'cms',label:'웹플랫폼 CMS',grp:'웹플랫폼'},{k:'fx',label:'요강·환산식 원장 (P1~P7)',grp:'SEN 진학프로그램 관리'},{k:'hitl',label:'판정·HITL·AI 정책'},{k:'season',label:'시즌·상담모드·설치형'},{k:'dpol',label:'데이터 정책 원장 (존·보관·키·NEIS)'},{k:'cons',label:'상담시스템 관리 (정책·CS-VM)',grp:'SEN 상담시스템 관리'},{k:'acct',label:'계정·권한 승인',grp:'통합관리자'},{k:'sec',label:'보안·인증 정책 10종'},{k:'perm',label:'권한 매트릭스'},{k:'rel',label:'관계 관리 콘솔'},{k:'audit',label:'감사로그'},{k:'stat',label:"관리통계 (효용 평가 '28)"},{k:'live',label:'실시간 정보취합',grp:'실시간'}];
const MENUS=r=>{const o=r&&r.opsRole;if(o==='콘텐츠')return ALL.filter(m=>['home','cms'].includes(m.k));if(o==='통계')return ALL.filter(m=>['home','stat','live','audit'].includes(m.k)).map(m=>m.k==='stat'?Object.assign({},m,{grp:'통계 (읽기)'}):m);return ALL;};
SEN_OPS.init({sys:'admin',title:'플랫폼관리',desc:'포털 전체의 계정·권한·콘텐츠·마스터·정책 원장·감사 · 상담시스템·AI 서비스 관리의 정책값 발행처',menus:MENUS,badges,
 views:Object.fromEntries(Object.keys(VIEWS).map(k=>[k,(el,c)=>{cur=k;ctx=c;VIEWS[k](el);syncBadges();}])),after:k=>{cur=k;syncBadges();}});
})();
