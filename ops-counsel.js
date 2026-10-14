/* 상담시스템 : 진학상담지원시스템 목업 v2.6 [정보원] 상담시스템을 포털 업무시스템 셸(ops-shell.js) 위에 그대로 이관
   기준일 2026.09.02 (수) · 모든 데이터는 ops-counsel-data.js(window.CNS) · 상태는 localStorage 'sen-ops-counsel-v1'
   역할 분리 : 정보원 실무사(office Role · 상담운영)는 실무사 대시보드 + 상담관리 콘솔, 위촉 상담 선생님(counselor)은 상담선생님 대시보드 + 내 스케줄만
   기본 기기: PC (실무사) · 태블릿(상담 선생님) */
(function(){
const D=window.CNS,esc=SEN_OPS.esc,KEY='sen-ops-counsel-v1';
const DEF={cd1View:'cal',cd1D:2,cd2St:{},cd2Ap:{},cd3Q:{},cd4Rm:false,copPay:0,cd5Pd:'m',cd5Qs:{3:true},cd5Ms:{8:true},cd5Xl:false,cd5By:'ch',
 grid:null,bkRm:{},olX:{},copAppr:{},copCoh:'all',rkSub:null,rkNo:false,fixed:{},
 mgT:0,mgSel:{},mgSent:null,mgDet:null,liveOv:{},detG:null,detHo:null,detSaved:false,vacSel:{},vacSent:null,
 olT:'all',olSel:null,olAct:null,olAi:null,olMs:{},olBulk:null,olSatRm:false,
 vcT:'all',vcSel:null,vcAct:null,vcPv:null,vcPdf:null,wvT:'all',wvSel:null,wvAct:null,wvPv:null,wvPdf:null,
 rpT:'all',rpSel:null,rpAct:null,rpX:{},stCh:'all',stDir:'asc',stFu:{},stRm:{},stBl:false,pyT:'all',pySel:{},pyDet:null,pyDl:null,
 esOff:window.innerWidth<1600,esW:400,esTab:'main',aiUse:false,
 ctEsOff:false,ct3V:'w',ct3D:2,ctRq:{},ctRqF:'all',ctRqSel:null,ctAct:{},ctSt:'상담중',ctRp:{},ctRpW:null,ctObj:false,ctPf:{'수시·학종':true,'정시':true},ctWd:{'수':true,'목':true},ctFaq:null,ctHp:'3m',ctHc:'all',ctHSel:null,ct8P:'m',ct8Xl:null,
 shr:{items:{infoLog:true,infoRpt:true},to:{담임:true,진로진학교사:true,상담교사:true},on:false,at:null,log:[],stuOk:false,schOn:false}};
const clone=o=>JSON.parse(JSON.stringify(o));
let S=(()=>{try{return Object.assign(clone(DEF),JSON.parse(localStorage.getItem(KEY)||'null')||{});}catch(e){return clone(DEF);}})();
/* 정책 연동 : 플랫폼관리(운영 모드·단가표) · AI 서비스 관리(STT 합격선) 상태를 읽어 반영 */
const ADM=()=>{try{return JSON.parse(localStorage.getItem('sen-ops-admin-v1')||'null')||{};}catch(e){return {};}};
const AIS=()=>{try{return JSON.parse(localStorage.getItem('sen-ops-ai-v1')||'null')||{};}catch(e){return {};}};
const MODE_L={norm:'상시',peak:'집중상담기간',special:'특별진학상담'};
const vcRate=()=>(ADM().unit||3)>=4?45000:40000;
const policyBand=()=>{const a=ADM(),ai=AIS();const m=a.mode||'norm';const stt=ai.stt;const parts=[`<span class="ch ch--sq" style="color:${m==='norm'?'#5b6680':'#fff'};background:${m==='norm'?'#e9edf4':m==='peak'?'#1f5ed4':'#7030a0'}">운영 모드 : ${MODE_L[m]}</span>`,`<span class="ft" style="margin:0">${m==='norm'?'학기당 1회 한도 · 게시판 SLA 48h':m==='peak'?'슬롯 마감 리마인드 D-3 · 큐 임계 완화 · 지원단 증원':'지원단 전원 편성 · 한도 예외(교사 추천 경로) · 센터 방문·화상 집중'}</span>`,`<span class="ch ch--sq" style="color:#16386f;background:#e8effc">단가표 v${a.unit||3} · 화상 ${vcRate().toLocaleString()}</span>`];if(stt!=null&&stt<2)parts.push(`<span class="ch ch--sq" style="color:#c03535;background:#fdeaea">AI 회의록 STT 합격선 ${stt===1?'카나리 중':'경계'} — 초안 지연 가능 (AI 서비스 관리 관제)</span>`);return `<div class="hilite" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px"><b style="font-size:12px;color:#16386f">플랫폼관리 발행 정책</b>${parts.join('')}</div>`;};
let cur=null,ctx=null;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}};
save(); /* 초기 상태도 저장 — 다른 업무시스템이 읽을 수 있게 */
const set=(p)=>{Object.assign(S,p);save();draw();};
const setK=(key,id,val)=>{const o=Object.assign({},S[key]);if(val===undefined)delete o[id];else o[id]=val;set({[key]:o});};
const toggleK=(key,id)=>setK(key,id,!S[key][id]);
const isCounselor=()=>ctx&&ctx.role&&ctx.role.k==='counselor';
/* ── 조각 ── */
const C={blue:['#1f5ed4','#e8effc'],green:['#157f3d','#e6f4ea'],amber:['#b3690a','#fdf1de'],red:['#c03535','#fdeaea'],gray:['#5b6680','#e9edf4'],purple:['#7030a0','#f0e6fa'],teal:['#1f7d76','#e5f4f3'],kakao:['#7a5410','#fdf1de'],navy:['#fff','#16386f'],link:['#1f4fa3','#e8effc'],dim:['#8a94ac','#f4f7fc'],cnt:['#fff','#e8544b'],off:['#8a94ac','#eef1f7']};
const chip=(t,fg,bg,cls='')=>`<span class="ch ${cls}" style="color:${fg};background:${bg}">${t}</span>`;
const chipC=(t,k,cls='')=>chip(t,C[k][0],C[k][1],cls);
const chipP=(t,pair,cls='')=>chip(t,pair[0],pair[1],cls);
const btn=(label,act,arg,cls='',attrs='')=>`<button type="button" class="cbtn ${cls}" data-act="${act}"${arg!=null?` data-arg="${esc(String(arg))}"`:''} ${attrs}>${label}</button>`;
const dbtn=(done,label,doneLabel,act,arg,cls='')=>done?`<button type="button" class="cbtn cbtn--done" disabled>${doneLabel}</button>`:btn(label,act,arg,cls);
const go=(k,l='이동하기 →')=>`<a class="cbtn cbtn--go" href="#${k}">${l}</a>`;
const ft=t=>`<p class="ft">${t}</p>`;
const ok=t=>`<div class="ok">${t}</div>`;
const card=(hd,bd,ftr='',bdCls='')=>`<section class="cc">${hd?`<div class="cc__hd">${hd}</div>`:''}<div class="cc__bd ${bdCls}">${bd}</div>${ftr?`<div class="cc__ft">${ftr}</div>`:''}</section>`;
const bar=(w,color='#1f4fa3',h=9)=>`<span class="bar9" style="height:${h}px"><i style="width:${w}%;background:${color}"></i></span>`;
const brow=(l,w,v,color='#1f4fa3',lw=120)=>`<div class="brow"><span class="l" style="width:${lw}px">${l}</span>${bar(w,color)}<span class="v">${v}</span></div>`;
const seg=(items,curK,act)=>`<span class="seg">${items.map(([k,l])=>`<button type="button" aria-pressed="${k===curK}" data-act="${act}" data-arg="${k}">${l}</button>`).join('')}</span>`;
const tgl=(on,label,act,arg,cls='')=>`<button type="button" class="tg ${cls}${on?' is-on':''}" aria-pressed="${on}" data-act="${act}" data-arg="${esc(String(arg))}">${label}</button>`;
const ck=(on,part)=>`<span style="color:${on||part?'#1f4fa3':'#c3cad8'}">${on?'☑':part?'◪':'☐'}</span>`;
const ctabs=(tabs,curK,act)=>`<div class="ctabs" role="tablist">${tabs.map(([k,l])=>`<button type="button" role="tab" aria-selected="${String(k)===String(curK)}" data-act="${act}" data-arg="${k}">${l}</button>`).join('')}</div>`;
const kv=(rows,w=92,cols=2)=>`<div class="kv${cols===1?' kv1':''}">${rows.map(([k,v])=>`<div><span style="width:${w}px">${k}</span><span>${v}</span></div>`).join('')}</div>`;
const gt=(cols,rows,opts={})=>{const tpl=opts.tpl.replace(/(\d*\.?\d+)fr/g,'minmax(0,$1fr)');const hd=`<div class="gt__hd" style="grid-template-columns:${tpl}">${cols.map(c=>`<div${c.cls?` class="${c.cls}"`:''}>${c.l}</div>`).join('')}</div>`;
 const body=rows.map(r=>`<div class="gt__r${r.cls?' '+r.cls:''}" style="grid-template-columns:${tpl}"${r.click?` data-click="${r.click}" data-arg="${esc(String(r.arg))}"`:''}>${r.c.map((x,i)=>`<div data-l="${esc(cols[i].l)}"${cols[i].cls?` class="${cols[i].cls}"`:''}>${x}</div>`).join('')}</div>`).join('');
 return `<div class="gt">${hd}${body}</div>`;};
const won=n=>n.toLocaleString('ko-KR');
const CHC=D.CHC;const chCh=ch=>chip(ch,CHC[ch][0],CHC[ch][1],'ch--sq');
/* ─────────────── 실무사 대시보드 ─────────────── */
function vHome(el){
  const cnt=D.CNT,sel=S.cd1D,selN=cnt[sel-1];
  /* ① 상담일정표 */
  const cal=`<div class="cga"><section class="cc"><div class="cc__bd"><div class="cal5">${['월','화','수','목','금'].map(w=>`<div class="wd">${w}</div>`).join('')}
   ${D.W2.flat().map(d=>d?`<button type="button" class="${d===sel?'is-on':''}" data-act="cd1D" data-arg="${d}" aria-pressed="${d===sel}"><b>${d}</b><span>${cnt[d-1]?cnt[d-1]+'건':'&nbsp;'}</span></button>`:`<button type="button" class="is-out" disabled><b>—</b><span>&nbsp;</span></button>`).join('')}</div>
   <div style="display:flex;gap:8px;align-items:center;margin-top:8px"><span class="ft" style="margin:0;flex:1">주말·공휴일 미운영 · 날짜를 누르면 우측에 일별 일정 표시 · 배정·통지는 시스템 자동</span>${go('book')}</div></div></section>
   <section class="cc"><div class="cc__hd"><span class="sp">9월 ${sel}일 (${D.wdOf(sel)}) — ${selN}건</span>${go('book')}</div><div class="cc__bd np">${selN===0?'<p class="ft" style="padding:18px 14px;text-align:center">해당 일자에 상담 일정 없음</p>':D.POOL.slice(0,Math.min(selN,5)).map(r=>`<div class="lr"><span class="t">${r[0]}</span>${chip(r[1],'#5b6680','#eef1f7','ch--sq')}<span class="sp">${r[2]}</span>${chipC('확정','green')}</div>`).join('')}</div></section></div>`;
  const list=card(`<span class="sp">9월 월별 리스트</span>${go('book')}`,gt([{l:'일자'},{l:'건수'},{l:'채널 구성'},{l:'비고'}],cnt.map((n,i)=>{const d=i+1;if(!n)return null;const vid=Math.ceil(n*.5),vis=Math.floor(n*.25),bd=n-vid-vis;const nt=D.NOTE[d];return {c:[`<b style="color:#16386f">9/${d} (${D.wdOf(d)})</b>`,`<b>${n}건</b>`,`화상 ${vid} · 방문 ${vis} · 게시판 답변 ${bd}`,nt?`<span style="color:${nt[1]};font-size:11.5px">${nt[0]}</span>`:'']};}).filter(Boolean),{tpl:'110px 70px 1fr 220px'}),'','np');
  /* ② 상담선생님 관리 */
  const t5=gt([{l:'성명'},{l:'지원단'},{l:'채널'},{l:'9월 실적'},{l:'전문 계열'},{l:'상태'}],D.T5.map((r,i)=>{const hold=S.cd2St[i]??(i===2);return {c:[`<b>${r[0]}</b>`,r[1],r[2],`<b>${r[3]}</b>`,`<span style="color:#6b7690">${r[4]}</span>`,`<button type="button" class="stt" style="color:${hold?'#b3690a':'#157f3d'};background:${hold?'#fdf1de':'#e6f4ea'}" data-act="cd2St" data-arg="${i}" aria-pressed="${hold}">${hold?'보류':'활동'}</button>`]};}),{tpl:'80px 100px 100px 90px 1fr 70px'});
  const sec2=`<div class="cga"><section class="cc"><div class="cc__hd"><span class="sp">2-1 기존 선생님 100분 관리</span>${chipC('활동 97','green')}${chipC('보류 3','amber')}${go('mg')}</div>
   <p class="ft" style="padding:8px 14px;margin:0">위촉 100명 (2026.4.1~2027.3.31) · 지원단 진로 38 · 진학 62 · 한 풀이 전 채널 담당 · 상태 칩을 누르면 활동↔보류 전환 (사유 기록)</p>${t5}<div class="cc__ft">계좌·통장사본은 정산 담당 Role만 (O-09 마스킹) · 만료 2027.3.31 자동 회수 · 연 단위 재승인</div></section>
   <div class="stack"><section class="cc"><div class="cc__bd"><div style="display:flex;gap:8px;align-items:center;margin-bottom:8px"><b class="sp" style="font-size:13.5px">2-2 결원 보충 (충원관리)</b>${go('mg')}</div>
    <div class="warnbox">현재 결원 2명 — 휴직 1 (진로 · 9.1) · 전보 1 (진학 · 8.20)</div>
    <p class="nt">절차 — 결원 확인 → 수시 충원 공문 → 후보 풀(대기 순위) 심사 → <b>잔여 위촉 기간</b>(~2027.3.31)으로 위촉 · 정기 주기는 3월 공문 · 선발 약 2:1</p>
    ${D.CAND.map(c=>`<div class="lr" style="padding:8px 0;border-top:1px solid #f0f3f8;border-bottom:0"><div class="sp"><b>${c[1]}</b><div class="ds">${c[2]}</div></div>${dbtn(S.cd2Ap[c[0]],'잔여 기간 위촉','✓ 위촉 완료 (~2027.3.31)','cd2Ap',c[0])}</div>`).join('')}
    ${ft('후보 풀 = 교원 인증 일반 선생님 412명 · 승인 시 역할 승격 + 위촉 등록 (O-01 공유)')}</div></section>
    <div class="soft">계열별 커버리지 공백 — <b>의약·예체능 진로 상담 가용 교사 부족</b> (풀 현황 히트맵 O-08) → 3월 정기 모집 시 우선 선발 계열로 반영</div></div></div>`;
  /* ③ 주 단위 */
  const rkN=D.RK.filter(r=>!S.cd3Q[r[0]]).length;
  const xN=olxOpen();const sec3=`<div class="cg3">${D.CARDS3.map((c,ci)=>{const mx=Math.max(...c[3]);const d=ci===0?`답변완료 35 · 답변중 6 — <b style="color:${xN.total?'#c03535':'#157f3d'}">미배정 ${xN.un} · SLA 초과 ${xN.sla} · 반려 대기 ${xN.rej}</b> (게시판 상담 화면에서 처리)`:c[2];return `<section class="cc"><div class="cc__bd"><div style="display:flex;gap:8px;align-items:center"><b class="sp" style="font-size:13px">${c[0]}</b>${go(c[4])}</div><div class="bignum" style="margin-top:4px">${c[1]}</div><div class="mini">${c[3].map(x=>`<i style="height:${Math.round(x*100/mx)}%"></i>`).join('')}</div><p class="nt" style="font-size:12px">${d}</p></div></section>`;}).join('')}</div>
   ${card(`<span class="sp">3-4 상담일정 변경·어긋남 (플랜B)</span>${chipC(rkN+'건','cnt')}${go('vc','화상 →')}${go('wv','방문 →')}`,riskRows(),'D-1 18시 이전 어긋남은 플랜B 완전 자동 — 여기 표시되는 건 당일 건·옵션 0개·무응답뿐 · 이번 주 어긋남 9건 중 자동 해결 7 · 처리는 화상·방문 상담 화면의 「일정 변경·어긋남」에서 — 교사 사유는 상담자관리 이력 원장, 학생 사유는 3개월 제한으로 자동 기록','np')}`;
  /* ④ 상담관리 */
  const pay=S.copPay||0;
  const sec4=`<div class="cg3"><section class="cc"><div class="cc__bd"><div style="display:flex;gap:8px;align-items:center"><b class="sp" style="font-size:13px">4-1 상담 보고서 관리</b>${go('rp')}</div>
   <p class="nt" style="font-size:12px;margin:6px 0 2px">제출 리드타임 당일 82% · 미확정 2건 — 확정 전에는 학생 열람 불가 (HITL)</p>
   ${D.REP4.map(r=>`<div class="lr" style="padding:7px 0;border-top:1px solid #f0f3f8;border-bottom:0"><span class="sp">${r[0]}</span>${chip(r[1],r[2],r[3])}</div>`).join('')}
   ${dbtn(S.cd4Rm,'미확정 2건 리마인드 발송','✓ 리마인드 발송됨 (2건 · C-02 채널)','cd4Rm',1,'cbtn--block')}${ft('실무사는 리마인드·재배정만 — 대리 작성 불가')}</div></section>
   <section class="cc"><div class="cc__bd"><div style="display:flex;gap:8px;align-items:center"><b class="sp" style="font-size:13px">4-2 상담 만족도 조사</b>${go('st')}</div>
   <div style="display:flex;gap:10px;align-items:baseline;margin-top:4px"><span class="bignum" style="font-size:24px;color:#157f3d">63%</span><span class="ft" style="margin:0">응답률 (현행 11% → 종결 트리거)</span></div>${bar(63,'#157f3d',8)}
   <p class="nt" style="margin-top:8px;font-size:12px">화상 71% — 종료 화면 인라인<br>게시판 58% — 답변 열람 하단<br>방문 55% — 체크아웃 알림톡</p>
   <p class="ft" style="border-top:1px solid #eef1f7;padding-top:7px">3문항 30초 · 미응답 48h 후 리마인드 1회 · 교사에게는 익명 집계만, 자유 의견은 실무사만</p></div></section>
   <section class="cc"><div class="cc__bd"><div style="display:flex;gap:8px;align-items:center"><b class="sp" style="font-size:13px">4-3 수당관리 — 8월 마감</b>${go('py')}</div>
   <p class="nt" style="font-size:12px;margin-top:4px">화상 812 × ${vcRate().toLocaleString()} · 방문 391 × 50,000<br>온라인 답변 81 × 15,000 · 전화 95 (수당 0)</p>
   <div style="border-top:1px solid #f0f3f8;margin-top:7px;padding-top:7px;font-weight:800;color:#16386f">계 1,284건 · 53,245,000원</div>
   ${payStages(pay)}${payBtn(pay,'cbtn--block')}${ft('채널별 완료 기준(K13) · 단가 손입력 폐지 · 콘솔 O-06과 상태 공유')}</div></section></div>`;
  /* ⑤ 통계관리 */
  const st=statBlock();
  el.innerHTML=`<div class="cns">${policyBand()}<div class="sub"><span>상담실무사 · 예외 관리자 · 상담운영 Role · 2026.09.02 (수)</span><span class="sp"></span>${btn('데모 상태 초기화','reset',null,'cbtn--line')}</div>
   <h2 class="sec" style="margin-top:0">1. 상담일정표 — 2026년 9월 · 전 채널<span class="sp"></span>${seg([['cal','달력'],['list','월별 리스트']],S.cd1View,'cd1View')}</h2>${S.cd1View==='cal'?cal:list}
   <h2 class="sec">2. 상담선생님 관리</h2>${sec2}
   <h2 class="sec">3. 주 단위 상담 현황 — 9/1 (월) ~ 9/5 (금)<small>막대 = 요일별 건수 (월~금)</small></h2>${sec3}
   <h2 class="sec">4. 상담관리</h2>${sec4}
   ${st}</div>`;
}
const olxOpen=()=>{const o={un:0,sla:0,rej:0,total:0};Object.entries(D.OLX).forEach(([no,x])=>{if(!S.olX[no]){o[x[0]]++;o.total++;}});return o;};
function riskRows(ch){return D.RK.filter(r=>!ch||r[6]===ch).map(r=>`<div class="lr">${chip(r[1],r[2],r[3],'ch--sq')}${ch?'':chCh(r[6]==='vc'?'화상':'방문')}<span class="sp">${r[4]}${r[7]?`<div class="ds">교사 사유 → ${r[7]} T 이력 원장에 사유 코드 자동 기입 (연 단위 재위촉 심사 참고)</div>`:r[8]?`<div class="ds">학생 사유 → ${r[8]} 신청 제한 3개월 자동 · 해제일 마이페이지 표시</div>`:''}</span>${dbtn(S.cd3Q[r[0]],r[5],'✓ 처리됨','cd3Q',r[0])}</div>`).join('');}
const tchRisk=name=>D.RK.filter(r=>r[7]===name&&S.cd3Q[r[0]]);
function payStages(pay){const st=[['자동 산정',true],['조서',pay>=1],['결재',pay>=2],['에듀파인 파일',pay>=2]];return `<div class="tgs" style="margin:9px 0">${st.map(([l,on])=>chipP(l,on?C.green:C.off)).join('')}</div>`;}
function payBtn(pay,cls=''){const L=['월 마감 · 수당지급조서 생성','결재 승인 (정보원 담당자)','✓ 에듀파인 업로드 파일 생성됨'];return pay>=2?`<button type="button" class="cbtn cbtn--done ${cls}" disabled>${L[2]}</button>`:btn(L[pay],'copPay',null,cls);}
/* ⑤ 통계관리 : 기간 모델 */
function statCalc(){const MT=D.MT5;let tot=0,lbl='';if(S.cd5Pd==='y'){tot=MT.reduce((a,b)=>a+b,0);lbl='2026년';}
 else if(S.cd5Pd==='q'){const qs=[1,2,3].filter(q=>S.cd5Qs[q]);qs.forEach(q=>{for(let m=(q-1)*3;m<q*3;m++)tot+=MT[m];});lbl='2026년 '+qs.join('·')+'분기';}
 else{const ms=[1,2,3,4,5,6,7,8].filter(m=>S.cd5Ms[m]);ms.forEach(m=>tot+=MT[m-1]);lbl='2026년 '+ms.join('·')+'월';}
 return {tot,lbl,f:tot/254};}
function statBlock(){const {tot,lbl,f}=statCalc();const R=n=>Math.round(n*f);
 let chips='';if(S.cd5Pd==='y')chips=`<span class="tg is-on is-fix">2026년 (위촉 4.1~)</span>`;
 else if(S.cd5Pd==='q')chips=[1,2,3,4].map(q=>q===4?`<span class="tg is-off">4분기</span>`:tgl(!!S.cd5Qs[q],(S.cd5Qs[q]?'☑ ':'☐ ')+q+'분기','cd5Q',q)).join('');
 else chips=[1,2,3,4,5,6,7,8,9,10,11,12].map(m=>m>8?`<span class="tg is-off">${m}월</span>`:tgl(!!S.cd5Ms[m],(S.cd5Ms[m]?'☑ ':'☐ ')+m+'월','cd5M',m)).join('');
 const mx=Math.max(1,...D.CH5.map(c=>R(c[1])));
 return `<h2 class="sec">5. 통계관리 — ${lbl}<span class="sp"></span><small>기간</small>${seg([['y','년'],['q','분기'],['m','월']],S.cd5Pd,'cd5Pd')}</h2>
 <div class="tgs" style="margin-bottom:6px">${chips}${btn('선택 결과 엑셀 출력','cd5Xl',null,'cbtn--green cbtn--xs')}</div>
 <p class="ft" style="margin:0 0 10px">분기·월 중복 선택 가능 · 9월 이후 미도래 · 1~3월은 위촉(4.1) 전 0건 · 전 통계 박스 동일 적용</p>
 ${S.cd5Xl?ok(`✓ 엑셀 출력 — ${lbl} 기준 선택 결과(채널별·분포·교사별 처리량·만족도 순위 ${won(tot)}건) 다운로드 · 개인정보(계좌 등) 제외 · 출력 이력 기록`)+'<div style="height:10px"></div>':''}
 <div class="tiles t3"><div class="tile"><b>0건</b><span>창구 간 통계 불일치 — 상담 원장 1개</span></div><div class="tile"><b>즉시</b><span>월 운영실적 산출 소요 — 수기 취합 폐지</span></div><div class="tile"><b>8,055건</b><span>과거 데이터 이관 (2020~) — 대사표 완료</span></div></div>
 <div class="cg2"><section class="cc"><div class="cc__bd"><b style="font-size:13px">${lbl} 채널별 완료 건수${tot===0?' — 위촉(4.1) 전 데이터 없음':''}</b><div style="margin-top:6px">${D.CH5.map(c=>brow(c[0],Math.round(R(c[1])*100/mx),won(R(c[1])),'#1f4fa3',130)).join('')}</div>
  <p class="nt" style="border-top:1px solid #eef1f7;margin-top:8px;padding-top:8px;font-size:12px">운영 모드별 — 상시 1,102 · 집중상담기간 582 · 특별진학상담 — (9.15 시즌 예정)<br><span style="color:#8a94ac">코드 2축(유형×계열)·모드 코드 전건 태그 — 세분화 구분별 통계 (K19)</span></p></div></section>
  <section class="cc"><div class="cc__bd"><b style="font-size:13px">선생님별 만족도 순위 — ${lbl}</b><div style="margin-top:6px">${D.RANK5.map((r,i)=>`<div class="brow"><span class="rk" style="${i<3?'color:#fff;background:#16386f':'color:#5b6680;background:#e9edf4'}">${i+1}</span><span class="l" style="width:64px;color:#1f4fa3;font-weight:800">${r[0]} T</span>${bar(r[3],'#157f3d',8)}<span class="v" style="color:#157f3d;min-width:30px">${r[1]}</span><span style="font-size:11px;color:#8a94ac;width:40px;text-align:right">${R(r[2])}건</span></div>`).join('')}</div>
  <div class="soft" style="margin-top:8px"><b>처리량 × 만족도 상관</b> — 상관계수 +0.31 (약한 양의 상관) · 처리량 상위(박선영 38건)와 만족도 상위가 병존 — 단, 주 12건 초과 과부하 구간에서는 만족도 하락 경향 → 부하 균등 배정 근거</div>${ft('교사에게는 본인 순위만 비공개 통지 — 코칭 참고용(평가·서열 공개 아님)')}</div></section></div>
 <div class="cg3" style="margin-top:14px"><section class="cc"><div class="cc__bd"><b style="font-size:13px">월별 상담 건수 추이 — 위촉 이후</b>
  <div class="vbars">${D.MON5.map(([m,n])=>{const bd=Math.round(n*.4),vc=Math.round(n*.38),vs=n-bd-vc,hb=Math.round(bd*100/n),hv=Math.round(vc*100/n),hs=100-hb-hv;return `<div class="vb" title="게 ${bd} · 화 ${vc} · 방 ${vs}"><b>${n}</b><div class="stk" style="height:${Math.round(n*100/302)}%"><i style="height:${hs}%;background:#16386f"></i><i style="height:${hv}%;background:#6f96d8"></i><i style="height:${hb}%;background:#c8d8f2"></i></div></div>`;}).join('')}</div>
  <div class="vlbl">${D.MON5.map(m=>`<span>${m[0]}</span>`).join('')}</div>
  <div class="legend"><span><i style="background:#c8d8f2"></i>게시판 40%</span><span><i style="background:#6f96d8"></i>온라인(화상) 38%</span><span><i style="background:#16386f"></i>방문 22%</span></div>
  <p class="ft" style="border-top:1px solid #eef1f7;padding-top:7px">막대에 마우스를 올리면 월별 채널 건수 표시 · 6월 최고(302건 — 기말 전 수요) · 9월은 특별진학상담 시즌으로 급증 예상 — 정원·대기열 사전 설정</p></div></section>
  <section class="cc"><div class="cc__bd"><div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"><b class="sp" style="font-size:13px">분포 — 기준 전환</b>${[['ch','채널'],['sch','학교급'],['cate','상담분류'],['mode','운영 모드']].map(([k,l])=>tgl(S.cd5By===k,l,'cd5By',k)).join('')}</div>
  <div style="margin-top:8px">${D.BY5[S.cd5By].map(r=>brow(r[0],r[2],r[1],'#1f4fa3',110)).join('')}</div>${ft('코드 2축(유형×계열)·모드 코드 전건 태그 — 어떤 기준으로도 원장에서 재계산 (K19)')}</div></section>
  <section class="cc"><div class="cc__bd"><b style="font-size:13px">교사별 처리량 TOP 5 — ${lbl}</b><div style="margin-top:6px">${D.TOP5.map(r=>`<div class="brow"><span class="l" style="width:64px;color:#1f4fa3;font-weight:800">${r[0]} T</span>${bar(r[2],'#1f4fa3',8)}<span class="v" style="min-width:40px">${R(r[1])}건</span></div>`).join('')}</div>
  <div class="mkpi"><div><b>97%</b><span>48h SLA 준수율</span></div><div><b>4.6 / 5</b><span>만족도 평균</span></div><div><b>78%</b><span>플랜B 자동 해결률</span></div><div><b>2.1%</b><span>노쇼율 (페널티 자동)</span></div></div>
  ${ft('처리량은 부하 균등 배정 참고 — 평가 지표 아님 · 상담 원장 1개에서 전 지표 재계산')}</div></section></div>`;}
/* ─────────────── 콘솔 : 상담자관리 ─────────────── */
const liveOf=(tab,i,no)=>tab===2?'후보':(S.liveOv[tab+'-'+no]||D.LIVE[i%6]);
const mgRows=()=>D.MGD[S.mgT];
function vMg(el){
  const tab=S.mgT,rows=mgRows();const selN=rows.filter(r=>S.mgSel[tab+'-'+r[0]]).length,allOn=selN===rows.length;
  const tbl=gt([{l:'',cls:'c'},{l:'No.'},{l:'학교급'},{l:'상담분류'},{l:'이름 (ID)'},{l:'학교명',cls:'el'},{l:'이메일',cls:'el'},{l:'가입일'},{l:'상태'}],rows.map((r,i)=>{const k=tab+'-'+r[0],st=liveOf(tab,i,r[0]);return {cls:S.mgDet===r[0]?'is-sel':'',c:[`<button type="button" class="ck" data-act="mgSel" data-arg="${k}" aria-label="선택">${ck(!!S.mgSel[k])}</button>`,r[0],r[1],r[2],`<button type="button" class="nm" data-act="mgDet" data-arg="${r[0]}">${r[3]} (${r[4]})</button>`,r[5],r[6],r[7],chipP(st,D.SC[st])]};}),{tpl:'26px 40px 68px 76px 1.1fr 1.2fr 1.1fr 82px 60px'});
  const hdCk=`<div class="gt__hd" style="grid-template-columns:26px 1fr;padding:0 14px;border:0;height:0;overflow:hidden"></div>`;
  const foot=tab===2?'선생님 = 교원 인증 개인회원(위촉 전 후보 풀) — 관리자 지정이 아니라 공고·신청·심사로 위촉 (⑪)':'상태 = 오늘 기준 실시간 — [상담중] 사전 일정(슬롯) 동기화 · [수업중] 시간표 · [휴식중] 공강 — 대체 상담 투입 가능, 그날그날 본인 설정 · [휴가중] 본인 설정 · [휴면중] 기간 신청 → 실무사 승인 · 이름 클릭 → 상세';
  let det='';const dr=rows.find(r=>r[0]===S.mgDet);
  if(dr){const i=rows.indexOf(dr),k=tab+'-'+dr[0],st=liveOf(tab,i,dr[0]),g=S.detG||(tab===0?'진로상담교사단':tab===1?'대학진학지도지원단':null);
   const ho=S.detHo;const hoL=ho==='ok'?chipC('✓ 승인됨 — 기간 중 배정 자동 제외','green'):ho==='rej'?chipC('반려됨 — 사유 통지 · 이전 상태 유지','red'):chipC('승인 대기','amber');
   det=`<div class="dh">${chipC('상세','navy')}<span>${dr[3]} (${dr[4]})</span>${chipP(st,D.SC[st])}<span class="sp"></span>${btn('수정 저장','detSave',null,'cbtn--xs')}<button type="button" class="xbt" data-act="mgDetClose" aria-label="닫기">✕</button></div>
   ${S.detSaved?`<div style="padding:8px 14px 0">${ok('✓ 수정 저장됨 — 변경 이력 기록 (감사 로그) · 위촉·상태 변경은 본인에게 자동 통지')}</div>`:''}
   <div class="cg2" style="padding:14px"><div class="box"><h4>선생님 정보 (기본 — 교원 인증 회원)</h4>${kv([['아이디',dr[4]],['이름',dr[3]],['이메일 ① 업무',dr[6]],['이메일 ② 상담 전용',dr[4]+'@counsel.sen.go.kr'],['학교 내선','02-2*4-6**3 (내선 2**)'],['휴대폰','010-****-*682 (비식별 — C-02 발신은 센터 번호)'],['학교명',dr[5]],['학교급',dr[1]],['가입일',dr[7]]],118,1)}${ft('이메일 2개 관리(K11) — 배정·리마인드는 상담 전용, 교원연수 등은 업무 메일 · 연락처는 비식별 표시, 원본은 통지 시스템만 사용')}</div>
   <div class="box"><h4>상담자 정보</h4><h5>상담자 구분 (지원단)</h5><div class="tgs">${['진로상담교사단','대학진학지도지원단'].map(x=>tgl(g===x,(g===x?'☑ ':'☐ ')+x,'detG',x,'is-soft')).join('')}</div>
    <h5>오늘 상태 (상담 관점 — 목록 칩과 실시간 연동)</h5><div class="tgs">${['상담중','수업중','휴식중','휴가중','휴면중'].map(x=>{const on=st===x;return `<button type="button" class="tg" style="${on?`color:${D.SC[x][0]};background:${D.SC[x][1]};border-color:${D.SC[x][0]}`:'color:#8a94ac'}" data-act="detSt" data-arg="${x}" aria-pressed="${on}">${on?'● ':'○ '}${x}</button>`;}).join('')}</div>
    ${ft('[상담중] 일정 동기화 · [수업중] 시간표 · [휴식중] 공강 — 대체 상담 가능, 그날그날 본인 설정 · [휴가중] 본인 설정 · [휴면중] 선택 시 아래 승인 절차')}
    <p class="nt" style="margin-top:8px">상담분류(전문 계열) — <b>${dr[2]}</b> · 태그 다중화 예정<br>채널 — 화상·방문 (한 풀이 전 채널, Q2)</p>
    ${ho?`<h5>휴면 신청 — 선생님이 기간 지정 → 실무사 승인</h5><div class="lr" style="padding:6px 0;border:0;flex-wrap:wrap"><span class="sp">9.20 ~ 10.4 · 사유: 학교 업무 집중 (2학기 수행평가)</span>${hoL}${ho==='pending'?btn('승인','detHoAp',null,'cbtn--xs cbtn--green')+btn('반려','detHoRj',null,'cbtn--xs cbtn--line cbtn--red'):''}</div>${ft('승인 시 기간 중 상태 [휴면중] · 자동 배정 제외 · 기존 확정 건은 플랜B 자동 제시 · 종료일 익일 자동 복귀')}`:''}</div>
   <div class="box"><h4>위촉 정보 (⑪ 수명주기)</h4><p class="nt">${tab===2?'위촉 전 — 후보 풀. 모집 공고 신청 시 심사 대상 (⑪ 수명주기: 공고 → 신청 → 심사 → 위촉)':'위촉 기간 2026.4.1 ~ 2027.3.31 · 연 단위 재승인 · 3월 공문 선발 (경쟁률 약 2:1, K16) · 만료 시 권한 자동 회수'}</p></div>
   <div class="box"><h4>교사 이력 원장 (⑪ 재위촉 심사 참고 — 페널티 아님)</h4>${(()=>{const h=tchRisk(dr[3]);return h.length?`<p class="nt">취소·미수락 <b>${h.length}건</b> — 사유 코드 자동 기입</p>${h.map(x=>`<div class="lr" style="padding:5px 0">${chip(x[1],x[2],x[3],'ch--sq')}<span class="sp" style="font-size:12px">${x[4]}</span></div>`).join('')}`:'<p class="nt">취소·미수락 0건 — 화상·방문 상담 「일정 변경·어긋남」에서 교사 사유 건이 처리되면 여기에 자동 기입됩니다</p>';})()}${ft('기록은 연 단위 재위촉 심사 참고용 · 학생 사유(노쇼·당일취소)는 학생 측 3개월 제한 이력으로 별도 관리')}</div>
   <div class="box"><h4>계좌 정보 (⑫ — 마스킹)</h4><p class="nt">예금주 강*영 · 거래은행 국민 · 계좌 ****-**-**4821 · 통장사본 S존 · 검증 ✓</p>${ft('전체 조회는 정산 담당 Role만 (열람 사유 로그) · 등록·수정은 교사 본인 T-01에서 — 현행 관리자 직접 입력(F3) 폐지')}</div></div>`;}
  el.innerHTML=`<div class="cns"><section class="cc"><div class="cc__hd"><span>상담자관리</span><span class="path">홈 &gt; 상담관리 &gt; 상담자관리</span><span class="sp"></span>${chipC('위촉 100명 · 후보 풀 412','gray')}</div>
   ${ctabs(D.MGTABS.map((l,i)=>[i,l]),tab,'mgT')}
   <div class="tbar"><span class="sel">학교급 ▾</span><span class="sel">상담분류 ▾</span><input type="search" placeholder="이름 · ID · 이메일 검색" aria-label="이름 · ID · 이메일 검색"><button type="button" class="cbtn cbtn--xs" data-act="noop" data-arg="검색 결과는 목업 목록과 동일합니다">검색</button><span class="sp"></span>${btn('단체문자 보내기'+(selN?` (${selN}명)`:''),'mgSend',null,selN?'':'cbtn--off')}</div>
   ${S.mgSent?`<div style="padding:8px 14px 0">${ok(`✓ 단체문자 ${S.mgSent}명 발송 완료 — 발신: 센터 대표번호 (C-02 마스킹 채널 · 개인 연락처 미노출) · 알림톡 → 실패 시 문자 폴백 · 발송 로그 기록`)}</div>`:''}
   <div class="gt"><div class="gt__hd" style="grid-template-columns:26px 1fr"><div><button type="button" class="ck" data-act="mgAll" aria-label="전체 선택">${ck(allOn,selN>0&&!allOn)}</button></div><div style="font-size:11px;color:#8a94ac;font-weight:600">전체 선택 · 선택 후 단체문자</div></div></div>${tbl}
   <div class="cc__ft" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><span class="sp">${foot}</span><span class="pg-num"><b>1</b><span>2</span><span>3</span><span>4</span></span></div>${det}</section></div>`;
}
/* ─────────────── 콘솔 : 리스크 관리 ─────────────── */
const vacPool=()=>{const out=[];[0,1].forEach(tab=>D.MGD[tab].forEach((r,i)=>{if(liveOf(tab,i,r[0])==='휴식중')out.push({tab,i,r});}));return out;};
/* ─────────────── 콘솔 : 온라인 게시판 상담 ─────────────── */
function vOl(el){
  const rows=D.OLR.filter(r=>S.olT==='all'||r[7]===S.olT);const msN=rows.filter(r=>S.olMs[r[0]]).length,allOn=msN===rows.length&&rows.length>0;
  const tbl=gt([{l:'',cls:'c'},{l:'번호'},{l:'학교급'},{l:'상담분류'},{l:'제목',cls:'el'},{l:'작성자'},{l:'등록일자'},{l:'답변일자'},{l:'상태'},{l:'상담선생님'}],rows.map(r=>({cls:S.olSel===r[0]?'is-sel':'',c:[`<button type="button" class="ck" data-act="olMs" data-arg="${r[0]}" aria-label="선택">${ck(!!S.olMs[r[0]])}</button>`,`<button type="button" class="nm" data-act="olSel" data-arg="${r[0]}">${r[0]}</button>`,r[1],r[2],`<button type="button" class="nm el" style="max-width:100%" data-act="olSel" data-arg="${r[0]}">${r[3]}</button>`,r[4],r[5],r[6],`<span class="tgs" style="gap:3px">${chipP(r[7],D.STC[r[7]])}${D.OLX[r[0]]&&!S.olX[r[0]]?chipC(D.OLX[r[0]][1],'red'):''}</span>`,r[8]]})),{tpl:'26px 46px 104px 76px 1fr 108px 86px 86px 96px 82px'});
  let det='';const r=D.OLR.find(x=>x[0]===S.olSel);
  if(r){const st=r[7],act=S.olAct,tch=r[8],vw=r[10],sa=r[11];
   const base=kv([['제목',r[3]],['작성자',r[4]],['학교급',r[1]],['상담분류',r[2]],['작성일',r[5]],['조회수',r[9]]],72);
   const content=st==='삭제요청'?'(본문 비공개 — 삭제요청 건 · 삭제사유 미작성 시 삭제 처리 안 됨)':'안녕하세요. 상담 요청드립니다 — 현재 상황과 궁금한 점을 정리해 올립니다. (본문 비공개 — 본인·배정교사·실무사만 열람)';
   let body='';
   const X=D.OLX[r[0]],xd=S.olX[r[0]];let xb='';
   if(X&&X[0]==='un'){xb=xd?ok(`✓ 수동 배정 — ${xd} 선생님 · 배정 통지 · 맥락 카드 전달 · 열람 권한 부여 · 이력 기록`):`<div class="box rd" style="margin-bottom:8px"><h4 style="color:#c03535">예외 — ${X[1]}</h4><p class="nt" style="font-size:12px">${X[2]}</p><div class="tgs" style="margin-top:6px"><span class="ft" style="margin:0">매칭 후보에서 수동 배정</span>${D.OLXCAND.map(c=>btn(c,'olxAssign',c,'cbtn--xs')).join('')}</div></div>`;}
   if(X&&X[0]==='sla'){xb=xd?ok('✓ 에스컬레이션 — 담당 교사 + 지원단장 통지 · 대체 교사 매칭 후보 제시 · 신청자 지연 안내 · 이력 기록'):`<div class="box rd" style="margin-bottom:8px"><h4 style="color:#c03535">예외 — ${X[1]}</h4><p class="nt" style="font-size:12px">${X[2]}</p><div class="acts" style="margin-top:6px">${btn('에스컬레이션 — 지원단장 통지 · 대체 교사 제시','olxEsc',null,'cbtn--xs cbtn--red')}<span class="ft" style="margin:0">실무사는 대리 답변 불가 — 재배정·에스컬레이션만</span></div></div>`;}
   if(st==='진행중'&&act!=='cat'&&act!=='catOk'){body=`${xb}<div class="box"><h4>답변작성</h4><p class="nt"><b>담당선생님</b> — ${xd&&X&&X[0]==='un'?xd+' 선생님 (수동 배정됨)':tch==='—'?'미지정 — 학교급×상담분류 매칭 후보에서 선택':tch+' 선생님 (배정됨)'}</p>
    <div class="box ai" style="margin:8px 0"><div class="tgs" style="margin-bottom:6px">${chipC('[AI 예상답변] RAG','purple')}<span class="ft" style="margin:0">신청 글 + 연결한 내 정보(동의) 기반 · 근거 없으면 '모른다'</span></div>
    <p class="nt">"학종 자소서는 2027 대입에서 대부분 폐지되었으나, 문의하신 전형은 서류평가에서 학생부 세특 중심으로 평가합니다. 연결된 성적(내신 2.55) 기준으로는 ○○ 전형 지원 시…" (초안 전문 3문단)</p>
    <div class="tgs" style="margin:6px 0">${chipC('근거 ① 2027 모집요강 p.34','link')}${chipC('근거 ② FAQ #212','link')}${chipC('근거 ③ 확정 답변 #3540 (가명)','link')}</div>
    ${S.olAi?ok('✓ 답변창에 반영됨 — 게시는 배정 교사 [확정] 후에만 (HITL) · 반영·수정 이력 기록'):btn('예상답변을 답변창에 반영','olAi',null,'cbtn--xs')}</div>
    <textarea aria-label="상담 답변 내용" placeholder="상담 답변 내용을 입력하세요 — 에디터 (교사 작성 원칙 · 실무사 대리 답변 불가, 긴급 허용은 [PROVISIONAL])">${S.olAi?'학종 자소서는 2027 대입에서 대부분 폐지되었으나, 문의하신 전형은 서류평가에서 학생부 세특 중심으로 평가합니다. (AI 예상답변 반영 — 교사 확정 전)':''}</textarea>
    ${ft('[AI 초안] 배정 교사 화면에는 RAG 초안 + 근거 링크 제공 — 교사 [확정] 전 게시 불가')}</div>
    <div class="acts">${btn('취소','olList',null,'cbtn--line')}${btn('분류변경','olCat',null,'cbtn--line')}${btn('답변','olAns')}<span class="sp"></span>${btn('삭제','olDel',null,'cbtn--line cbtn--red')}${btn('수정','noop','목업 — 수정은 작성 교사 화면에서','cbtn--line')}</div>`;}
   if(st==='완료'){body=`<div class="cg2"><div class="box"><h4>답변내용</h4>${kv([['담당선생님',tch+' 선생님'],['답변작성일',r[6]],['답변내용','(교사 확정 답변 본문) — 확정본만 게시·통지']],76,1)}</div>
    <div class="box"><h4>종결 조건 — 학생 확인 + 만족도 입력</h4><p class="nt" style="font-size:12px">답변 게시만으로 끝나지 않습니다 — 학생이 답변을 확인(열람)하고 만족도를 입력해야 프로세스가 종결됩니다</p>
    <div class="stack" style="gap:6px;margin-top:8px"><div class="lr" style="padding:0;border:0;flex-wrap:wrap"><span style="font-size:12px;width:150px">① 학생 답변 확인 (열람)</span>${vw?chipC('✓ 확인 완료 — 09.01 20:14 (열람 로그)','green'):chipC('대기 — 게시 통지·딥링크 발송됨','amber')}</div>
    <div class="lr" style="padding:0;border:0;flex-wrap:wrap"><span style="font-size:12px;width:150px">② 만족도 입력 (3문항)</span>${sa?chipC('✓ 응답 완료 — 익명 집계 반영','green'):chipC('대기 — 미응답 48h 후 리마인드 1회','amber')}</div>
    <div class="lr" style="padding:0;border:0;flex-wrap:wrap"><span style="font-size:12px;width:150px">프로세스 종결</span>${vw&&sa?chipC('✓ 종결 — 이력 원장 저장 · 수당 산정 확정','green'):chipC('미종결 — ①+② 충족 시 자동 종결 (7일 무응답 시 자동 종결 처리)','gray')}</div></div>
    ${!sa?(S.olSatRm?ok('✓ 만족도 리마인드 발송 — 센터 대표번호(C-02) · 딥링크 · 발송 로그 기록'):'<div class="acts">'+btn('만족도 리마인드 발송 (C-02)','olSatRm',null,'cbtn--xs')+'</div>'):''}</div></div>
    <div class="acts" style="justify-content:flex-end">${btn('목록','olList',null,'cbtn--line')}${btn('삭제','olDel',null,'cbtn--line cbtn--red')}${btn('수정','noop','목업 — 수정은 작성 교사 화면에서','cbtn--line')}</div>`;}
   if(st==='분류변경'||act==='cat'||act==='catOk'){body=`<div class="box bl"><h4>담당선생님변경 (분류변경)</h4><div class="tgs"><span class="sel tg">학교급 ▾</span><span class="sel tg">상담분류 ▾</span><span class="ft" style="margin:0">변경선생님 —</span>${[['정하늘 — 자연계열'],['윤가람 — 인문계열'],['오세훈 — 대입상담']].map(([x])=>btn(x,'olCatPick',x,'cbtn--xs cbtn--line')).join('')}</div>${ft('선택한 사항으로 담당선생님이 변경(수정)됩니다 — 변경 이력 기록 · 신·구 교사 양측 알림')}</div><div class="acts">${btn('목록','olList',null,'cbtn--line')}</div>`;}
   if(st==='삭제요청'){const rj=X&&X[0]==='rej'?(xd?ok(`✓ 반려 — 사유 코드 [${xd}] · 신청자에게 사유 통지 · 소프트 보관(삭제 아님 · 복원 가능) · 이력 기록`):`<div class="box rd" style="margin-bottom:8px"><h4 style="color:#c03535">예외 — ${X[1]}</h4><p class="nt" style="font-size:12px">${X[2]}</p><div class="tgs" style="margin-top:6px"><span class="ft" style="margin:0">사유 코드 선택 → 반려·통지</span>${D.REJCODES.map(c=>btn('반려 — '+c,'olxReject',c,'cbtn--xs')).join('')}</div></div>`):'';body=`${rj}<div class="box rd"><h4>삭제사유 (미작성 시 삭제 처리 안 됨)</h4><input class="in" aria-label="삭제 사유" placeholder="삭제 사유를 입력하세요 — 사유는 신청자에게 통지됩니다"></div><div class="acts">${btn('목록','olList',null,'cbtn--line')}${btn('삭제','olDel')}${btn('복원','olRest',null,'cbtn--gl')}</div>`;}
   if(st==='미등록'){body=`<div class="box"><h4>미등록 (임시저장)</h4><p class="nt">신청자가 임시저장한 건 — [확인] 시 저장(등록)되어 [진행중]에서 조회, [임시저장]은 미등록 유지 · 신청자 마이페이지 &gt; 온라인상담내역에 "미등록"으로 표시</p></div><div class="acts">${btn('목록','olList',null,'cbtn--line')}${btn('확인','noop','목업 — 등록 처리는 신청자 화면 기준')}${btn('임시저장','noop','목업 — 미등록 유지','cbtn--line')}</div>`;}
   const msg={ansOk:'✓ 답변 저장 — [탭] 완료에서 조회 · 답변 게시 통지(딥링크) 발송 · 만족도 요청',catOk:'✓ 담당선생님 변경 완료 — 변경 이력 기록 · 신·구 교사 양측 알림 · 열람 권한 이전',delOk:'삭제 처리 — 입력한 삭제사유로 처리·삭제일자 업데이트 (소프트 삭제 — 실질 DB 삭제는 되지 않음) · 사유 통지',rest:'✓ 복원 완료 — 해당 학교급·상담분류 목록에서 조회됩니다'}[act];
   det=`<div class="dh">${chipC('상담 신청 조회','navy')}<span class="sp"></span>${btn('목록','olList',null,'cbtn--xs cbtn--line')}</div><div class="cc__bd">${base}<p class="nt" style="margin:10px 0"><b>상담내용</b> — ${content}</p>${body}${msg?ok(msg):''}</div>`;}
  el.innerHTML=`<div class="cns"><section class="cc"><div class="cc__hd"><span>온라인 게시판 상담</span><span class="path">홈 &gt; 상담관리 &gt; 온라인 게시판 상담</span><span class="sp"></span>${(()=>{const x=olxOpen();return x.total?chipC(`예외 ${x.total}건 — 미배정 ${x.un} · SLA 초과 ${x.sla} · 반려 대기 ${x.rej}`,'red'):chipC('예외 0건','green');})()}${chipC('누적 17,574건 · SLA 48h','gray')}</div>
   ${ctabs(D.OLTABS,S.olT,'olT')}
   <div class="tbar"><span class="sel">2026-08-01</span>~<span class="sel">2026-09-02</span><span class="sel">학교급 ▾</span><span class="sel">상담분류 ▾</span><span class="sel">제목 ▾</span><input type="search" placeholder="검색어" aria-label="검색어"><button type="button" class="cbtn cbtn--xs" data-act="noop" data-arg="검색 결과는 목업 목록과 동일합니다">검색</button><button type="button" class="cbtn cbtn--xs cbtn--line" data-act="noop" data-arg="엑셀 — 개인정보 제외 · 출력 이력 기록">엑셀</button><span class="sp"></span>${btn('일괄 분류변경'+(msN?` (${msN})`:''),'olBulkCat',null,'cbtn--xs'+(msN?'':' cbtn--off'))}${btn('일괄 삭제'+(msN?` (${msN})`:''),'olBulkDel',null,'cbtn--xs '+(msN?'cbtn--red':'cbtn--off'))}</div>
   ${S.olBulk?`<div style="padding:8px 14px 0">${ok('✓ '+S.olBulk)}</div>`:''}
   <div class="gt"><div class="gt__hd" style="grid-template-columns:26px 1fr"><div><button type="button" class="ck" data-act="olAll" aria-label="전체 선택">${ck(allOn,msN>0&&!allOn)}</button></div><div style="font-size:11px;color:#8a94ac;font-weight:600">전체 선택 · 번호·제목 클릭 → 하단 상세</div></div></div>${tbl}
   <div class="cc__ft">행(제목) 클릭 → 하단 상세 · 답변일자 없는 진행중 건은 SLA 48h 관리(24h 교사 리마인드) · 예외(미배정 2h·SLA 48h 초과·반려 대기)는 행에 빨간 배지로 표시, 상세에서 수동 배정·에스컬레이션·반려로 처리 — 정상 건은 실무사 개입 없음 · 누적 17,574건 — 교사 확정 답변만 가명화 후 RAG 소스</div>${det}</section></div>`;
}
/* ─────────────── 콘솔 : 온라인(화상) · 방문 (공통 구조) ─────────────── */
const CC={진행중:C.blue,완료:C.green,일정변경:C.amber};
function vcwv(el,kind){
  const isV=kind==='vc';const P=isV?{t:'vcT',sel:'vcSel',act:'vcAct',pv:'vcPv',pdf:'vcPdf'}:{t:'wvT',sel:'wvSel',act:'wvAct',pv:'wvPv',pdf:'wvPdf'};
  const DATA=isV?D.VCR:D.WVR,TABS=isV?D.VCTABS:D.WVTABS;
  const F=isV?{sch:1,cate:2,t:3,wr:4,role:5,lk:6,rec:7,att:8,want:9,info:10,st:11,tch:12}:{sch:1,cate:2,t:3,wr:4,role:5,lk:6,rec:7,att:8,room:9,want:10,info:11,st:12,tch:13};
  const rows=DATA.filter(r=>S[P.t]==='all'||r[F.st]===S[P.t]);
  const lkChip=r=>r[F.lk]==='카톡'?chipC(isV?'카톡 링크':'카톡 안내','kakao'):chipC(isV?'이메일 링크':'이메일 안내','link');
  const roleChip=r=>chipC(r[F.role],r[F.role]==='학생'?'teal':'purple');
  const cols=isV?[{l:'번호'},{l:'학교급'},{l:'상담분류'},{l:'제목',cls:'el'},{l:'신청자 · 링크'},{l:'희망(확정) 일시'},{l:'연결한 내 정보'},{l:'상태'},{l:'선생님'}]:[{l:'번호'},{l:'학교급'},{l:'상담분류'},{l:'제목',cls:'el'},{l:'신청자 · 안내'},{l:'희망(확정) 일시'},{l:'상담실'},{l:'연결한 내 정보'},{l:'상태'},{l:'선생님'}];
  const tbl=gt(cols,rows.map(r=>{const c=[r[0],r[F.sch],r[F.cate],`<b style="color:#1f4fa3">${r[F.t]}</b>`,`<span class="tgs" style="gap:3px">${r[F.wr]} ${roleChip(r)}${lkChip(r)}</span>`,r[F.want]];if(!isV)c.push(r[F.room]);c.push(`<span style="font-size:11.5px">${r[F.info]}</span>`,S.fixed[kind+r[0]]?chipC('재확정 ✓','green'):chipP(r[F.st],CC[r[F.st]]),r[F.tch]);return {cls:S[P.sel]===r[0]?'is-sel':'',click:P.sel,arg:r[0],c};}),{tpl:isV?'40px 100px 72px 1fr 208px 158px 140px 62px 62px':'40px 100px 72px 1fr 208px 158px 64px 140px 62px 62px'});
  /* 일정 변경·어긋남 (플랜B) — 이 채널의 리스크 건 + 목록의 일정변경 건 */
  const chg=DATA.filter(x=>x[F.st]==='일정변경');const rkOpen=D.RK.filter(x=>x[6]===kind&&!S.cd3Q[x[0]]).length+chg.filter(x=>!S.fixed[kind+x[0]]).length;
  const chgRows=chg.map(x=>`<div class="lr">${chipC('신청자 변경 요청','amber','ch--sq')}<span class="sp">#${x[0]} ${x[F.t]} · ${x[F.wr]} · ${x[F.want]} · ${x[F.tch]} T<div class="ds">플랜B 옵션(대체 교사 / 다른 날) 제시됨 — 재확정 대기 · <button type="button" class="nm" data-act="${P.sel}" data-arg="${x[0]}" style="font-size:11px">상세 →</button></div></span>${S.fixed[kind+x[0]]?`<button type="button" class="cbtn cbtn--done" disabled>✓ 재확정 — 양측 통지</button>`:btn('대체 일정 확정 (플랜B)','fixed',kind+x[0])}</div>`).join('');
  let rkExtra='';
  if(isV){const vac=vacPool();const svN=vac.filter(v=>S.vacSel[v.tab+'-'+v.r[0]]).length;const sub=S.rkSub;const steps=[['① 대체 요청 문자',true],['② 이정민 T 승인',sub!==null],['③ 대체 확정',sub==='fix'],['④ 맥락 카드 전달',sub==='fix']];
   rkExtra=`<div class="cg2" style="padding:12px 14px 0"><div class="box"><h4><span class="sp">휴식중(공강) 선생님 — 대체 투입 가능 ${chipC(vac.length+'명','gray')}</span>${btn('대체 요청 문자'+(svN?` (${svN}명)`:''),'vacSend',null,'cbtn--xs'+(svN?'':' cbtn--off'))}</h4>
    ${S.vacSent?ok(`✓ 대체 상담 요청 문자 ${S.vacSent}명 발송 — 발신: 센터 대표번호 (C-02) · 수락 시 해당 건에 대체 교사로 배정 · 발송 로그 기록`):''}
    ${vac.length?vac.map((v,i)=>{const k=v.tab+'-'+v.r[0],pr=D.PR[i%3];return `<div class="lr" style="padding:7px 0;align-items:flex-start"><button type="button" class="ck" style="font-size:15px;background:none;border:0;padding:0;cursor:pointer" data-act="vacSel" data-arg="${k}" aria-label="선택">${ck(!!S.vacSel[k])}</button><div class="sp"><b style="color:#1f4fa3">${v.r[3]} (${v.r[4]})</b><div class="ds">${v.tab===0?'진로상담교사단':'대학진학지도지원단'} · ${v.r[5]} · ${pr[0]} · <b style="color:#157f3d">${pr[1]}</b></div></div></div>`;}).join(''):'<p class="ft">현재 휴식중(공강) 선생님 없음 — 상담자관리 상세에서 오늘 상태를 바꾸면 여기에 표시됩니다</p>'}
    ${ft('휴식중 = 공강 시간에 대신 상담 가능한 상태, 선생님이 그날그날 직접 설정 · 상담자관리 오늘 상태와 실시간 연동 · 교사 취소 건(9/3 박선영 T)의 대체 교사 풀')}</div>
   <div class="box"><h4>대체 확정 플로우 — 9/3 15:00 교사 취소 건</h4><div class="tgs" style="margin-bottom:8px">${steps.map(([l,on])=>chipP(l,on?C.green:C.off)).join('')}</div>
    ${sub===null?`<p class="nt" style="font-size:12px">이정민 선생님이 대체 요청 문자를 받고 <b>[승인]</b>을 누르면 → 실무사 화면에 [대체 확정] 버튼 생성</p>${btn('이정민 T — 문자 수신 → 승인 (수락 시뮬레이션)','rkAcc',null,'cbtn--xs cbtn--line')}`:''}
    ${sub==='acc'?ok('✓ 이정민 T 승인 (수락) — 9/3 15:00 화상 건 대체 가능 회신')+'<div class="acts">'+btn('대체 확정 — 배정 교체 · 양측 자동 통지','rkFix',null,'cbtn--xs')+'</div>':''}
    ${sub==='fix'?ok('✓ 대체 확정 — 박선영 T → 이정민 T 배정 교체 · 학생·교사 양측 자동 통지 · v-meeting URL 유지')+`<p class="nt" style="font-size:12px;margin-top:8px"><b>맥락 카드 자동 전달 — 이정민 T 화면에만</b> · 학생 이** (고3 · 미디어 계열 희망) — 성적 요약 · 진로검사 · 기존 상담이력 2건 · 사전 질문 · 동의 스코프 승계(재동의 불요)</p>`:''}</div></div>`;}
  else{rkExtra=`<div style="padding:12px 14px 0"><div class="box"><h4>상담 선생님이 없는 경우 — 9/12 14:00 플랜B 옵션 0개</h4><p class="nt" style="font-size:12px">공강 풀 0명 또는 전원 미수락 → 자동 분기: 학생(학부모)에게 <b>사과 문자 + 대체 일정 재예약 링크</b> 발송 · <b>우선 예약권</b>(예비 슬롯도 즉시 확정) 부여</p>${S.rkNo?ok('✓ 발송 완료 — 센터 대표번호 (C-02) · 딥링크 포함 · "예정된 상담이 부득이하게 취소되어 사과드립니다. 아래 링크에서 원하시는 일정으로 다시 예약하실 수 있습니다. [다시 예약하기 →]"'):btn('사과 문자 + 재예약 링크 발송','rkNo',null,'cbtn--xs')}</div></div>`;}
  const riskSec=`<section class="cc"><div class="cc__hd"><span>일정 변경·어긋남 (플랜B)</span>${chipC(rkOpen+'건','cnt')}<span class="path">D-1 18시 이전은 완전 자동 — 당일 건 · 옵션 0개 · 무응답 · 신청자 변경 요청만 실무사 처리</span></div><div class="cc__bd np">${riskRows(kind)}${chgRows}</div>${rkExtra}
   <div class="cc__ft">교사 사정(취소·미수락) → 사유 코드 자동 기입 → <b>교사 이력 원장</b>(상담자관리 상세 · 재위촉 심사 참고, 페널티 아님) · 학생(학부모) 사정(노쇼·당일취소) → <b>3개월 신청 제한</b> 자동 · 해제일 마이페이지 표시 · 실무사 예외 해제(사유 기록)</div></section>`;
  let det='';const r=DATA.find(x=>x[0]===S[P.sel]);
  if(r){const st=r[F.st],rec=r[F.rec],role=r[F.role],tch=r[F.tch],act=S[P.act],done=st==='완료';
   const want='1차 '+r[F.want].replace(/ \(1차\)| \(2차\)| → 변경 요청| \(완료\)/g,'')+' · 2차 동일일 오후 4시';
   const lk=(r[F.lk]==='카톡'?'카카오톡 kt*** (본인 인증)':'이메일 test***@gm***.com')+(isV?' — 신청 시 본인이 사전 설정 · 참석자별 개별 v-meeting 링크를 회의 30분 전 자동 발송':' — 신청 시 본인이 사전 설정 · 방문 안내·QR 입장권 D-1 자동 발송');
   const KV=isV?[['신청자',`${r[F.wr]} — ${role}`],['링크 수신 채널',lk],['화상회의 참석자',`${r[F.att]} — 입장·퇴장 로그 기록, 3자 상담은 각자 동의(⑩) · 학생·학부모 외 제3자(선생님·친구·친척) 참석은 신청 시 사전 고지 필수, 미고지 참석자는 입장 제한`],['개인정보 동의 (사전)',`정보 열람 ✓ (신청 시) · 녹화·녹취 ${rec?'동의 ✓ — 동의 건만 S존 저장·보존 기간 후 자동 파기':'미동의 ✗ — 녹취 없이 진행, 교사 메모 기반 요약'} · 결과 공유(학부모 열람) ${role==='학부모'?'✓':'—'} · 동의 3종 분리 · 철회 가능`],['학교급',r[F.sch]],['상담분류',r[F.cate]],['희망상담일시',want],['연락처','010-****-**37 (비식별 — 발신은 C-02 센터 번호)'],['이메일','test***@gm***.com'],['연결한 내 정보',r[F.info]+' — 신청자가 항목별 동의·연결'],['제목',r[F.t]]]
    :[['신청자',`${r[F.wr]} — ${role}`],['안내 수신 채널',lk],['방문 참석자',`${r[F.att]} — 체크인 로그 기록 · 학생·학부모 외 제3자(선생님·친구·친척)는 사전 고지 필수`],['개인정보 동의 (사전)',`정보 열람 ✓ (신청 시) · 대면 녹음(녹취) ${rec?'동의 ✓ — 상담실 녹음기기 · S존 저장·자동 파기':'미동의 ✗ — 교사 메모 기반 요약'} · 결과 공유 ${role==='학부모'?'✓':'—'}`],['학교급',r[F.sch]],['상담분류',r[F.cate]],['희망상담일시',want],['상담실',r[F.room]+' (센터 방문 — 방문은 센터만)'],['연락처','010-****-**37 (비식별 — 발신은 C-02 센터 번호)'],['연결한 내 정보',r[F.info]+' — 신청자가 항목별 동의·연결'],['제목',r[F.t]]];
   const preQ=isV?'(사전 질문 — 신청자 입력) 상담 전에 검토 부탁드립니다: ① 현재 성적 기준 지원 가능 범위 ② 남은 기간 우선순위. (본문 비공개 — 본인·배정교사·실무사만 열람)':'(사전 질문 — 신청자 입력) 방문 전에 검토 부탁드립니다: ① 지참 자료(학생부·성적표) 적정 여부 ② 상담에서 우선 다룰 항목. (본문 비공개)';
   const info=isV?{진행중:'온라인 화상회의 진행중 — 링크 자동 발송 14:30 (회의 30분 전 · 설정 채널로) · v-meeting 입장 15:02 · 신청자 입장 확인 · 녹취 동의 ✓ (S존)',완료:'완료 — 상담 종료 후 결과보고서 확정(교사) ✓ · 학생 열람본 게시 ✓ · 만족도 응답 ✓ 까지 완료된 건',일정변경:'온라인 화상회의 일정변경 — 신청자 변경 요청 접수 → 플랜B 옵션(대체 교사 / 다른 날) 제시, 재확정 대기'}[st]
    :{진행중:`방문 상담 진행중 — QR 체크인 14:02 (${r[F.room]}) · 시작 기록 = 수당 집계 근거 · ${rec?'대면 녹취 동의 ✓ (녹음기기 · S존)':'녹취 미동의 — 메모 기반'}`,완료:'완료 — 상담 종료 후 결과보고서 확정(교사) ✓ · 학생 열람본 게시 ✓ · 만족도 응답 ✓ 까지 완료된 건',일정변경:'방문 일정변경 — 신청자 변경 요청 접수 → 플랜B 옵션(대체 교사 / 다른 날) 제시, 재확정 대기 · 당일 취소는 3개월 제한'}[st];
   const chk=isV?[['1. 상담선생님 보고서',`작성·확정 ✓ — ${tch} T · 상담 당일 18:12 확정 (HITL — 확정본만 학생 게시)`,'green'],['2. 상담자 만족도','작성 완료 ✓ — 3문항 응답 (도움 정도 5점 · 재이용 의향 예) · 익명 집계 반영','green'],['3. 학생 열람','열람본 게시 ✓ · 신청자 열람 확인 (익일 20:14 · 열람 로그)','green'],['4. 수당 산정','자동 반영 ✓ — 화상 40,000원 · 완료 기준 = 보고서 확정 (K13)','green'],['5. 녹취 파기',rec?'S존 보존 중 — 상담 후 90일 자동 파기(정책값) · 즉시 삭제권 · 상호 동의 건만 STT':'해당 없음 — 녹취 미동의 건','amber'],['6. 후속 조치','다음 상담 제안 1건 — 재예약 링크 발송 · 통합 프로파일 이력 저장 (다음 교사에게 표시)','blue'],['7. 이의·정정','요청 없음 — 판정·보고서 이의제기 버튼 제공 (요청 시 교사 재검토 → 정정 이력 기록)','gray'],['8. 추가 질문','미발생 — 답변·보고서 게시 후 7일 내 1회 가능 (같은 교사 · 스레드 유지)','gray']]
    :[['1. 상담선생님 보고서',`작성·확정 ✓ — ${tch} T · 상담 당일 확정 (HITL — 확정본만 학생 게시)`,'green'],['2. 상담자 만족도','작성 완료 ✓ — 체크아웃 알림톡 3문항 응답 · 익명 집계 반영','green'],['3. 학생 열람','열람본 게시 ✓ · 신청자 열람 확인 (열람 로그)','green'],['4. 수당 산정','자동 반영 ✓ — 방문 50,000원 · 완료 기준 = 보고서 확정 (K13)','green'],['5. 녹취 파기',rec?'S존 보존 중 — 파기 예정일 등록 (자동 파기 · 즉시 삭제권)':'해당 없음 — 녹취 미동의 건','amber'],['6. 후속 조치','다음 상담 제안 — 재예약 링크 발송 · 통합 프로파일 이력 저장','blue'],['7. 이의·정정','요청 없음 — 이의제기 버튼 제공 (요청 시 교사 재검토 → 정정 이력)','gray'],['8. 추가 질문','미발생 — 게시 후 7일 내 1회 (같은 교사 · 스레드 유지)','gray']];
   const chkHtml=chk.map(c=>`<div class="lr" style="padding:5px 0;border:0;align-items:flex-start">${chipC(c[0],c[2])}<span class="sp" style="font-size:12px">${c[1]}</span></div>`).join('');
   const pdfMsg=isV?'✓ PDF 발송 완료 — 수신: 황주* (학부모 · 설정 채널) · 워터마크(수신자명·발송일시) 적용 · 무단 재배포 시 열람 이력 추적 · 발송 로그 기록':'✓ PDF 발송 완료 — 수신자명·발송일시 워터마크 · 무단 재배포 시 열람 이력 추적 · 발송 로그 기록';
   const left=`${kv(KV,92,1)}<p class="nt" style="margin:10px 0"><b>사전 질문</b> — ${preQ}</p><p class="nt"><b>상태</b> — ${info}</p>
    ${done?`<div class="box" style="margin-top:10px"><h4>완료 체크리스트</h4>${chkHtml}<div class="acts">${btn(S[P.pv]?'미리보기 닫기':'결과보고서 미리보기',P.pv+'Tg',null,'cbtn--xs')}${btn('워터마크 PDF 발송 — 학생(학부모)',P.pdf,null,'cbtn--xs cbtn--gl')}</div>${S[P.pdf]?ok(pdfMsg):''}</div>`:''}
    ${st==='일정변경'?`<div class="acts">${S.fixed[kind+r[0]]?'':btn('대체 일정 확정 (플랜B)',P.act,'fix')}${btn('문자전송',P.act,'msg','cbtn--line')}<span class="ft" style="margin:0">${isV?'v-meeting URL 1개 — 변경돼도 유지 · 발신은 센터 대표번호(C-02)만':'방문은 센터만(Q3) · 당일 취소·노쇼 3개월 제한 자동 · 발신은 센터 대표번호(C-02)만'}</span></div>`:st==='진행중'?`<div class="acts">${btn('문자전송',P.act,'msg','cbtn--line')}</div>`:''}
    ${act==='fix'||S.fixed[kind+r[0]]?ok(isV?'✓ 대체 일정 확정 — 재확정·양측 통지 · URL 유지 · 변경 이력 기록':'✓ 대체 일정 확정 — 재확정·양측 통지 · QR 입장권 재발송 · 변경 이력 기록'):''}${act==='msg'?ok('✓ 문자 발송 — 센터 대표번호(C-02 마스킹) · 발송 로그 기록'):''}`;
   let right='';
   if(!done&&isV){const first=r[F.wr].split(' ')[0];right=`<div class="vm"><h4><span class="sp">v-meeting — 화상 상담실 (자체 WebRTC · 개별 링크)</span>${rec?chipC('녹화·녹취 동의 ✓ (사전)','green'):chipC('녹화·녹취 미동의 ✗','red')}${chipP(st,CC[st])}</h4>
     <div class="vid"><div style="text-align:center"><div class="av" style="margin:0 auto 6px">T</div><div style="font-size:12px">${tch} T — 호스트</div></div>${st==='진행중'?(rec?'<span class="rec">● REC 녹취 (사전 동의 ✓ · S존)</span>':'<span class="rec no">녹취 없음 — 미동의 · 교사 메모 기반</span>'):''}</div>
     <div class="tiles2"><div>${role==='학부모'?'학부모 ':'학생 '}${first}</div>${(role==='학부모'||r[F.att].includes('학부모'))?`<div>${role==='학부모'?'학생 (동석)':'학부모'}</div>`:''}</div>
     <div class="ctl"><span>마이크</span><span>카메라</span><span>화면공유</span><span class="end">종료</span></div><p class="ft">자체 구축 WebRTC · 브라우저 기반 설치 0 · 참석자별 개별 링크(대기실 없음, 미고지 링크 미발급) · 동시 회의실 20 · 녹화 기본 차단(녹취는 상호 동의 시만, STT 회의록용) · 입장·퇴장 로그 = 실제 소요 기록 · 연결 끊김 자동 재접속, 장애 시 전화 전환(실적만 집계)</p></div>`;}
   else if(!done){right=`<div class="box"><h4><span class="sp">센터 방문 안내 — QR 체크인</span> ${chipP(st,CC[st])}</h4><div class="qr"><i></i></div><p class="ft" style="text-align:center;margin:0 0 8px">QR 입장권 — D-1 자동 발송 (설정 채널)</p><p class="nt" style="font-size:12px">체크인 = 상담 시작 기록 (수당 집계 근거)<br>상담실 배정 — 센터 상담실 6개 연동<br>대면 녹취는 사전 동의 시만 — 상담실 녹음기기 · S존</p>${ft('주소·오시는길 안내 포함 · 학생·학부모 외 제3자(선생님·친구·친척) 참석은 사전 고지 필수')}</div>`;}
   else{const src=isV?(rec?'녹취 STT 요약 [AI 초안] → 교사 수정 2건 → 확정':'교사 메모 [AI 초안] → 교사 수정 1건 → 확정'):(rec?'대면 녹취 STT 요약 [AI 초안] → 교사 수정 → 확정':'교사 태블릿 메모 [AI 초안] → 교사 수정 → 확정');
    right=`<div class="box"><h4><span class="sp">결과보고서 (확정본)</span>${chipC(isV?'교사 확정 ✓ 18:12':'교사 확정 ✓','green')}</h4>${kv(isV?[['작성자',tch+' 선생님 (배정 교사 — 유일 수기)'],['유형·채널','진학상담 · 화상 (v-meeting) · 실제 소요 42분'],['주제 태그','정시 지원선 · 수능최저 · 6장 조합'],['상담 요약','9월 학평 기준 정시 지원선 3개 군 검토 — 안정 축 1장 확보를 우선으로 합의. 수능최저(2합5) 충족 여부는 9월 모평 결과로 재확인하기로 함.'],['판정·근거 (표기 강제)','적정 — 참고점 957.9 · 전년 컷 2.38 · 유사 사례 38건 (교사에 따른 해석 차이를 근거 표기로 완화)'],['후속 권고','모의면접 2회 · 9월 모평 후 재상담 제안 (재예약 링크 발송됨)']]
     :[['작성자',tch+' 선생님 (배정 교사 — 유일 수기)'],['유형·채널','진학상담 · 방문 (센터 상담실) · 실제 소요 55분'],['상담 요약','지참 학생부·성적표 기준 수시 6장 조합 검토 — 안정 축 확보 합의 · 특성화고 전형 요건 확인.'],['판정·근거 (표기 강제)','적정 — 참고점·전년 컷·유사 사례 수 표기 (해석 차이 완화)'],['후속 권고','서류 보완 1건 · 9월 모평 후 재상담 제안 (재예약 링크 발송됨)']],100,1)}${ft(`초안 출처 — ${src} · 학생 열람본 게시 ✓ ${isV?'· 열람 확인 ✓ ':''}· 내부 메모 미포함(전달 분리)`)}</div>`;}
   let pv='';
   if(done&&S[P.pv]){pv=`<div class="wmk" data-wm="황주* (학부모) · 2026.09.02 · 재배포 금지" style="margin:0 14px 14px;border:1px solid #d4dcea;border-radius:10px;padding:12px 14px"><div class="dh" style="border:0;background:none;padding:0 0 8px"><span>결과보고서 미리보기 — 학생(학부모) 전달본 (PDF)</span>${chipC('워터마크 적용','gray')}<span class="sp"></span>${btn('워터마크 PDF 발송',P.pdf,null,'cbtn--xs')}<button type="button" class="xbt" data-act="${P.pv}Tg" aria-label="닫기">✕</button></div>
    <h4 style="margin:6px 0;font-size:12.5px">① 상담 신청 정보</h4>${kv(KV,92,2)}
    <h4 style="margin:12px 0 6px;font-size:12.5px">② 결과보고서 (확정본)</h4><p class="nt">${isV?`작성자 — ${tch} 선생님 (배정 교사) · 진학상담 · 화상 (v-meeting) · 42분 · 주제: 정시 지원선 · 수능최저 · 6장 조합<br><b>상담 요약</b> — 9월 학평 기준 정시 지원선 3개 군 검토. 안정 축 1장 확보 우선 합의 · 수능최저(2합5)는 9월 모평 결과로 재확인.<br><b>판정·근거</b> — 적정 (참고점 957.9 · 전년 컷 2.38 · 유사 사례 38건)<br><b>후속 권고</b> — 모의면접 2회 · 9월 모평 후 재상담 (재예약 링크)`:`작성자 — ${tch} 선생님 (배정 교사) · 진학상담 · 방문 (센터 상담실) · 55분<br><b>상담 요약</b> — 지참 학생부·성적표 기준 수시 6장 조합 검토, 안정 축 확보 합의.<br><b>판정·근거</b> — 적정 (참고점·전년 컷·유사 사례 표기)<br><b>후속 권고</b> — 서류 보완 1건 · 9월 모평 후 재상담 (재예약 링크)`}</p>
    <h4 style="margin:12px 0 6px;font-size:12.5px">③ 완료 체크리스트</h4>${chkHtml}${ft(isV?'본 문서는 워터마크(수신자명·발송일시)가 적용된 개인별 PDF로 발송됩니다 — 무단 재배포 시 열람 이력으로 추적 · 내부 메모 미포함(전달 분리) · 발송·열람 전건 로그':'워터마크(수신자명·발송일시) 적용 PDF — 무단 재배포 시 열람 이력 추적 · 내부 메모 미포함(전달 분리) · 발송·열람 전건 로그')}${isV&&S[P.pdf]?ok('✓ PDF 발송 완료 — 수신: 황주* (학부모 · 사전 설정 채널) · 발송 로그 기록'):''}</div>`;}
   det=`<div class="dh">${chipC('상담 신청 조회 — 신청자 입력','navy')}${chipP(st,CC[st])}<span class="sp"></span>${btn('목록',P.sel+'Close',null,'cbtn--xs cbtn--line')}</div><div class="cc__bd"><div class="cgb" style="gap:24px"><div>${left}</div><div>${right}</div></div></div>${pv}`;}
  el.innerHTML=`<div class="cns">${riskSec}<section class="cc"><div class="cc__hd"><span>${isV?'온라인(화상) 상담':'방문상담'}</span><span class="path">홈 &gt; 상담관리 &gt; ${isV?'온라인(화상) 상담':'방문상담'} — 상담자(학생·학부모) 입력 정보 중심</span><span class="sp"></span>${chipC(isV?'v-meeting':'센터 방문 · QR 체크인','gray')}</div>
   ${ctabs(TABS,S[P.t],P.t)}<p class="ft" style="padding:8px 14px 0;margin:0">상태 3종 — <b>진행중</b> ${isV?'온라인 회의 진행중':'방문 상담 진행중(QR 체크인)'} · <b>완료</b> 보고서·만족도까지 작성 완료 · <b>일정변경</b> ${isV?'화상회의':'방문'} 일정변경(플랜B)</p>
   <div style="height:8px"></div>${tbl}
   <div class="cc__ft">${isV?'행(제목) 클릭 → 하단 상세(신청자가 입력·동의한 정보) · <b>링크 수신 채널(카톡/이메일)은 신청 시 본인이 사전 설정 — v-meeting 링크는 회의 30분 전 자동 발송</b>(발송 로그 기록·실패 시 문자 폴백) · 게시판 상담과 별도 관리 · 완료 = 보고서·만족도까지 작성 완료':'행(제목) 클릭 → 하단 상세(신청자가 입력·동의한 정보) · <b>방문 안내·QR 입장권은 D-1 자동 발송</b>(설정 채널 · 발송 로그) · 방문은 센터만(Q3) · 학기당 1회 한도·당일취소 3개월 제한 자동 · 완료 = 보고서·만족도까지 작성 완료'}</div>${det}</section></div>`;
}
/* ─────────────── 콘솔 : 상담 보고서 관리 ─────────────── */
function vRp(el){
  const rows=D.RPR.filter(r=>S.rpT==='all'||r[7]===S.rpT);
  const tbl=gt([{l:'번호'},{l:'일자'},{l:'채널'},{l:'선생님'},{l:'상담자'},{l:'입력 방식 (초안 출처)'},{l:'입력 소요'},{l:'상태'}],rows.map(r=>({cls:S.rpSel===r[0]?'is-sel':'',click:'rpSel',arg:r[0],c:[r[0],r[1],r[2],`<b style="color:#1f4fa3">${r[3]} T</b>`,r[4],r[5],`<span style="color:${r[6].includes('⚠')?'#c03535':'#6b7690'};font-weight:700">${r[6]}</span>`,chipP(r[7],D.STC[r[7]])]})),{tpl:'34px 48px 46px 76px 1fr 1fr 70px 84px'});
  let det='';const r=D.RPR.find(x=>x[0]===S.rpSel);
  if(r){const st=r[7];const actL={'확정 대기':'교사 확정 리마인드 발송 (C-02)','초안 미생성':'메모 입력 요청 발송 (C-02)','자동 생성':'교사 확인 요청 발송'}[st];
   det=`<div class="dh">${chipC('상세','navy')}<span>#${r[0]} — ${r[1]} ${r[2]} · ${r[3]} T ↔ ${r[4]}</span>${chipP(st,D.STC[st])}<span class="sp"></span>${btn('목록','rpSelClose',null,'cbtn--xs cbtn--line')}</div><div class="cc__bd">${kv([['초안 출처',r[5]],['제출 리드타임',r[6]+' (목표: 상담 당일)'],['HITL 흐름','초안 생성 → 교사 수정 → [확정] → 학생 열람본 게시 — 확정 전 미노출'],['초안 요약',st==='초안 미생성'?'— 교사 메모 미입력으로 초안 생성 불가':'"상담 주제·판정(근거 표기)·후속 권고" 3개 필드 자동 채움 · [AI 초안] 배지 — 교사 화면에만']],92,1)}
   ${actL?`<div class="acts">${S.rpAct?`<button type="button" class="cbtn cbtn--done" disabled>✓ 발송됨</button>`:btn(actL,'rpAct')}<span class="ft" style="margin:0">대리 작성 불가 · 확정 없이는 저장·게시 불가 (HITL)</span></div>${S.rpAct?ok('✓ 발송 완료 — 상담 전용 메일 + 알림톡 (C-02) · 발송 로그 · 무응답 24h 후 자동 재발송 1회 · D+3 초과 시 자동 에스컬레이션'):''}`:ft('열람본 게시 완료 — 조치 불요')}</div>`;}
  const q=(id,l,done)=>done?`<button type="button" class="cbtn cbtn--done cbtn--xs" disabled>✓ ${l.replace(' 발송','됨').replace(' 생성','됨').replace(' 반영','됨')}</button>`:btn(l,'rpX',id,'cbtn--xs');
  el.innerHTML=`<div class="cns"><div class="tiles"><div class="tile"><b>6.2시간</b><span>평균 입력 소요 — 상담 종료 → 보고서 제출</span></div><div class="tile"><b>82%</b><span>당일 입력률 (목표: 상담 당일)</span></div><div class="tile"><b>2건</b><span>상담완료 후 현재 미입력 ⚠ — D+3 초과 시 자동 에스컬레이션</span></div><div class="tile"><b>71%</b><span>AI 초안 활용 (직접 입력 29%) · 초안 수정률 34%</span></div></div>
  <div class="cgc"><section class="cc"><div class="cc__hd"><span>상담 보고서 관리</span><span class="path">유일한 수기 구간(교사) — 실무사는 리마인드만</span><span class="sp"></span>${chipC('채널별 자동 초안 + HITL','purple')}</div>${ctabs(D.RPTABS,S.rpT,'rpT')}${tbl}${det}</section>
  <div class="stack"><section class="cc"><div class="cc__bd"><b style="font-size:13px">입력 속도 분포 — 상담 종료 후</b><div style="margin-top:6px">${[['당일',82],['D+1',10],['D+2 이상',8]].map(x=>brow(x[0],x[1],x[1]+'%','#1f4fa3',64)).join('')}</div>${ft('평균 6.2시간 · D+3 초과 시 실무사 큐 + 자동 에스컬레이션')}</div></section>
  <section class="cc"><div class="cc__bd"><b style="font-size:13px">교사별 평균 입력 시간 · 방식</b>${[['이정민 T','1.8h','AI 초안 96%'],['박선영 T','2.4h','AI 초안 88%'],['최수아 T','3.1h','자동 생성 (게시판)'],['김도현 T','5.9h','AI 초안 62%'],['한승우 T','9.4h','직접 입력 71%']].map(x=>`<div class="lr" style="padding:6px 0"><b style="color:#1f4fa3;width:64px">${x[0]}</b><b style="width:40px">${x[1]}</b><span class="sp ft" style="margin:0">${x[2]}</span></div>`).join('')}${ft('AI 초안 활용률·수정률은 품질 지표(자문) — 재위촉 심사 참고, 평가 아님')}</div></section>
  <section class="cc"><div class="cc__bd"><b style="font-size:13px">품질·개선 루프</b>
   <div class="lr" style="padding:8px 0;align-items:flex-start"><div class="sp"><b>① 판정 근거 미기재 자동 경고 — 1건</b><div class="ds">#48 한승우 T — 참고점·컷·사례 수 미기재 (필드 검증)</div></div>${q('qw','보완 요청 발송',S.rpX.qw)}</div>
   <div class="lr" style="padding:8px 0;align-items:flex-start"><div class="sp"><b>② 지연 상위 교사 — 월간 코칭 리포트</b><div class="ds">한승우 T 평균 9.4h (D+2 이상 3건) — 8월 대상</div></div>${q('coach','코칭 리포트 생성',S.rpX.coach)}</div>
   <div class="lr" style="padding:8px 0;align-items:flex-start;border:0"><div class="sp"><b>③ AI 초안 수정 패턴 → 프롬프트 개선</b><div class="ds">판정 문구 완화 41% · 후속 일정 구체화 27% · 근거 추가 18%</div></div>${q('fb','프롬프트 개선 백로그 반영',S.rpX.fb)}</div>
   ${ft('코칭 리포트는 자문·비평가 · 프롬프트 개선은 학습 평면(가명) 반영 — 승인 이력 기록')}</div></section></div></div></div>`;
}
/* ─────────────── 콘솔 : 상담 만족도 조사 ─────────────── */
function vSt(el){
  const ch=S.stCh,k=D.CHD[ch];const low=D.STLOW.slice().sort((a,b)=>S.stDir==='asc'?a[4]-b[4]:b[4]-a[4]);
  const scoreC=s=>s<=2?C.red:s===3?C.amber:C.gray;
  el.innerHTML=`<div class="cns"><div class="sub" style="margin-bottom:10px"><b style="font-size:15px;color:#1c2434">상담 만족도 조사 — 8월 · 3문항 30초</b><span class="sp"></span><span class="ft" style="margin:0">채널</span>${[['all','전체'],['화상','화상'],['게시판','게시판'],['방문','방문']].map(([x,l])=>tgl(ch===x,l,'stCh',x)).join('')}</div>
  <div class="tiles"><div class="tile"><b>${k[0]}</b><span>응답률 (현행 11% → 종결 트리거)</span></div><div class="tile"><b>${k[1]}</b><span>평균 만족도 — 3문항</span></div><div class="tile"><b>${k[2]}</b><span>8월 응답 수</span></div><div class="tile"><b>${k[3]}</b><span>${k[4]}</span></div></div>
  <div class="cgd"><div class="stack"><section class="cc"><div class="cc__hd">선생님 × 채널별 점수</div>${gt([{l:'선생님'},{l:'게시판',cls:'c'},{l:'온라인(화상)',cls:'c'},{l:'방문',cls:'c'}],D.STMAT.map(r=>({c:[`<b style="color:#1f4fa3">${r[0]}</b>`,...r.slice(1).map(v=>`<b style="color:${v!=='—'&&parseFloat(v)<4.5?'#b3690a':'#2a3550'}">${v}</b>`)]})),{tpl:'1fr 70px 70px 70px'})}<div class="cc__ft">4.5 미만은 주황 표시 · 교사에게는 익명 집계만 공유 — 코칭 참고용(평가 아님)</div></section>
   <section class="cc"><div class="cc__hd">문항별 — 현재 필터 기준</div><div class="cc__bd">${[['① 도움 정도',ch==='게시판'?'4.4':'4.7','94%'],['② 재이용 의향',ch==='방문'?'4.5':'4.6','91%'],['③ 한 줄 의견 (자유)','—',ch==='화상'?'46%':'38%']].map(x=>`<div class="lr" style="padding:7px 0"><span class="sp">${x[0]}</span><b style="color:#16386f">${x[1]}</b><span class="ft" style="margin:0;width:70px;text-align:right">응답 ${x[2]}</span></div>`).join('')}${ft('자유 의견은 실무사만 열람 — 교사에게는 주제 분류(AI)만')}</div></section></div>
  <div class="stack"><section class="cc"><div class="cc__hd"><span class="sp">낮은 만족도 응답 — 후속 관리</span>${btn('점수 '+(S.stDir==='asc'?'낮은순 ▲':'높은순 ▼'),'stDir',null,'cbtn--xs cbtn--line')}</div><div class="cc__bd">
    ${low.map(r=>`<div class="lr" style="padding:8px 0;align-items:flex-start">${chipP(r[4]+'점',scoreC(r[4]))}<div class="sp"><span style="font-size:12px">${r[1]} · ${r[2]} · ${r[3]} ${chipC(r[6],'purple')}</span><div class="ds" style="color:#2a3550">${r[5]}</div></div>${dbtn(S.stFu[r[0]],'후속 연락 (C-02)','✓ 후속 연락','stFu',r[0],'cbtn--xs')}</div>`).join('')}
    <div class="tgs" style="margin-top:8px"><span class="ft" style="margin:0">사유 태그 (AI 분류)</span>${['지연 42%','연결 품질 25%','용어 어려움 18%','기타 15%'].map(x=>chipC(x,'purple')).join('')}</div>${ft('2점 이하는 자동 알림 + 재상담 제안 발송 · 후속 연락은 C-02 채널 · 응답자 신원은 실무사만(교사 익명)')}</div></section>
   <section class="cc"><div class="cc__hd">미응답 관리</div><div class="cc__bd">${D.STNO.map(r=>`<div class="lr" style="padding:7px 0"><div class="sp"><b>${r[1]}</b><div class="ds">${r[2]}</div></div>${dbtn(S.stRm[r[0]],'리마인드 발송','✓ 발송됨','stRm',r[0],'cbtn--xs')}</div>`).join('')}${ft('미응답 48h 후 리마인드 1회(자동) — 수동 재발송도 C-02 · 7일 무응답 시 자동 종결')}</div></section>
   <section class="cc"><div class="cc__hd">자유 의견 (실무사만)</div><div class="cc__bd"><p class="nt">"선생님이 자료를 미리 보고 와서 상담이 빨랐어요" — 화상 · 5점<br>"답변이 구체적이었지만 링크가 많아 복잡했어요" — 게시판 · 4점<br>"상담실 안내가 편했어요. 주차 안내가 있으면 좋겠어요" — 방문 · 4점</p></div></section>
   <section class="cc"><div class="cc__hd">채널 개선 백로그 연동</div><div class="cc__bd">
    <div class="lr" style="padding:7px 0"><span class="sp">게시판 — 답변 지연 알림 강화 (24h 리마인드 → 12h)</span><button type="button" class="cbtn cbtn--done cbtn--xs" disabled>✓ 등록됨</button></div>
    <div class="lr" style="padding:7px 0"><span class="sp">화상 — 접속 사전 점검 체크리스트 발송</span><button type="button" class="cbtn cbtn--done cbtn--xs" disabled>✓ 등록됨</button></div>
    <div class="lr" style="padding:7px 0;border:0"><span class="sp">방문 — 안내문에 주차 정보 추가</span>${dbtn(S.stBl,'백로그 등록','✓ 등록됨','stBl',null,'cbtn--xs')}</div>
    <div class="soft" style="margin-top:8px"><b>만족도 × 재이용 상관</b> — 만족도 4.5 이상 → 재예약율 62% · 3점 이하 → 18% — 만족도 1점 상승 ≈ 재예약 +14%p (상관 참고 지표 · 인과 단정 금지)</div></div></section></div></div></div>`;
}
/* ─────────────── 콘솔 : 수당관리 ─────────────── */
const payCalc=r=>{const c=r[3],rate=r[2]==='화상'?vcRate():D.RATE[r[2]],amt=rate*c,tax=Math.round(amt*.03),res=Math.round(tax*.1);return {c,rate,amt,tax,res,sum:tax+res,net:amt-tax-res};};
function vPy(el){
  const rows=D.PYD.filter(r=>S.pyT==='all'||r[2]===S.pyT);const selN=rows.filter(r=>S.pySel[r[1]]).length,allOn=selN===rows.length&&rows.length>0;
  const tot=rows.reduce((a,r)=>{const p=payCalc(r);a.c+=p.c;a.amt+=p.amt;a.sum+=p.sum;a.net+=p.net;return a;},{c:0,amt:0,sum:0,net:0});
  const cols=[{l:'',cls:'c'},{l:'번호'},{l:'소속학교',cls:'el'},{l:'성명'},{l:'구분'},{l:'건수',cls:'num'},{l:'단위당 지급액',cls:'num'},{l:'지급액 계',cls:'num'},{l:'소득세',cls:'num'},{l:'주민세',cls:'num'},{l:'세액 계',cls:'num'},{l:'차인지급액',cls:'num'},{l:'거래은행'},{l:'계좌번호 · 지급'}];
  const body=rows.map((r,i)=>{const p=payCalc(r);return {cls:S.pyDet===r[1]?'is-sel':'',c:[`<button type="button" class="ck" data-act="pySel" data-arg="${r[1]}" aria-label="선택">${ck(!!S.pySel[r[1]])}</button>`,i+1,r[0],`<button type="button" class="nm" data-act="pyDet" data-arg="${r[1]}">${r[1]} 선생님</button>`,r[2],p.c,won(p.rate),won(p.amt),won(p.tax),won(p.res),won(p.sum),`<b>${won(p.net)}</b>`,r[4],`<span class="tgs" style="gap:4px">${r[5]} ${D.PAID[r[1]]?chipC('지급완료','green'):chipC('미지급','amber')}</span>`]};});
  body.push({cls:'is-sum',c:['','','총계','','',`<b>${tot.c}</b>`,'',`<b>${won(tot.amt)}</b>`,'','',`<b>${won(tot.sum)}</b>`,`<b>${won(tot.net)}</b>`,'','']});
  const tbl=gt(cols,body,{tpl:'24px 36px 1.2fr 100px 60px 44px 82px 88px 66px 60px 66px 88px 60px 120px'});
  const rateNote=`<div class="hilite" style="margin-bottom:10px">단가표 마스터 <b>v${ADM().unit||3}</b> — 온라인 15,000 · 화상 <b>${vcRate().toLocaleString()}</b> · 방문 50,000 · 전화 0 (플랫폼관리 「상담시스템 관리」에서 발행 · 이전 조서는 발행 당시 버전 고정)</div>`;
  const dl=S.pyDl;const dlL=dl==='x'?'✓ 엑셀 다운로드 — 검색 조건(구분·기간) 기준 통계 결과 · 계좌는 마스킹 상태로 출력':dl==='j'?'✓ 기간 전체 조서 작성 — 2026.8.1~8.31 완료 건 전원(6명 · 52건) 일괄 조서 생성 · 결재 상신 → 승인 후 에듀파인 업로드 파일 (수동 재입력 금지)':dl?`✓ 선택 조서 작성 — 선택한 ${dl.slice(1)}명 조서 생성 (부분 조서 — 추가 지급·정정분) · 결재 상신 → 에듀파인 파일 · 작성 이력 기록`:'';
  let det='';const r=D.PYD.find(x=>x[1]===S.pyDet);
  if(r){const p=payCalc(r),c=p.c,v1=Math.ceil(c*.5),v2=Math.floor(c*.25),v3=c-v1-v2,grp=['이정민','최수아','한승우'].includes(r[1])?'진로상담교사단':'대학진학지도지원단';
   let tc=0,ta=0,a8=0;const mon=[4,5,6,7,8].map((m,i)=>{const cc=Math.max(1,c-4+i),w1=Math.ceil(cc*.5),w2=Math.floor(cc*.25),w3=cc-w1-w2,amt=w1*40000+w2*50000+w3*15000;tc+=cc;ta+=amt;if(m===8)a8=amt;return {c:[`2026.0${m}`,cc+'건',`게시판 ${w3} · 온라인 ${w1} · 방문 ${w2}`,bar(Math.round(cc*100/c)),`<b>${won(amt)}원</b>`,m<8?chipC('지급완료','green'):chipC('미지급 (결재 대기)','amber')]};});
   det=`<div class="dh">${chipC('상세','navy')}<span>${r[1]} 선생님 — ${grp}</span><span class="sp"></span><button type="button" class="xbt" data-act="pyDetClose" aria-label="닫기">✕</button></div><div class="cc__bd">${kv([['소속학교',r[0]],['위촉 기간','2026.4.1 ~ 2027.3.31 (연 단위 재승인)'],['8월 상담건수',`${c}건 — 화상 ${v1} · 방문 ${v2} · 게시판 답변 ${v3} (전 채널 합산 · 완료 기준 K13)`],['만족도 평균',D.SAT[r[1]][0]+' — 익명 집계'],['보고서 리드타임',D.SAT[r[1]][1]+' 제출'],['노쇼·취소 관련',(()=>{const h=tchRisk(r[1]);return h.length?`${h.length}건 — ${h.map(x=>x[1]).join(' · ')} (교사 이력 원장 · 수당 차감 없음, 정책값)`:'0건 (교사 사유 취소 이력 없음)';})()],['8월 수당',`${won(p.amt)}원 · 세액 ${won(p.sum)}원 · 차인 ${won(p.net)}원`],['지급 이력','7월 지급완료 · 6월 지급완료 (에듀파인 전송분)'],['이의 제기','0건 — T-06에서 본인 실적·수당 조회·이의 제기 가능'],['계좌',`${r[4]} ${r[5]} — 마스킹 · 전체 조회는 정산 담당 Role만`]],96)}
   <div class="box" style="margin-top:12px;padding:0;overflow:hidden"><h4 style="padding:10px 13px 0">월별 수당 통계 — 위촉 이후</h4>${gt([{l:'월'},{l:'건수'},{l:'구분 (게시판·온라인·방문)'},{l:''},{l:'금액',cls:'num'},{l:'지급 상태'}],mon,{tpl:'76px 56px 170px 1fr 110px 130px'})}<p class="ft" style="padding:8px 13px 10px;margin:0">위촉(2026.4.1) 이후 누적 — ${tc}건 · ${won(ta)}원 (지급완료 ${won(ta-a8)}원 · 미지급 ${won(a8)}원) · 금액 = 채널별 단가(화상 4.0 · 방문 5.0 · 게시판 1.5만) 합산</p></div></div>`;}
  el.innerHTML=`<div class="cns">${rateNote}<section class="cc"><div class="cc__hd"><span>수당관리 (상담통계 · 수당지급조서)</span><span class="path">홈 &gt; 상담관리 &gt; 수당관리 — 2026년 8월 마감분</span><span class="sp"></span>${chipC('단가표 마스터 v3 — 손입력 폐지','green')}</div>
   <div class="tbar"><span class="lbl">상담구분</span>${[['all','전체'],['온라인','온라인 게시판'],['방문','방문상담'],['화상','화상상담']].map(([k,l])=>tgl(S.pyT===k,l,'pyT',k)).join('')}<span class="sel">기간 2026-08-01 ~ 2026-08-31</span><span class="sp"></span>${btn('엑셀다운','pyDl','x','cbtn--xs cbtn--line')}${btn('선택 조서 작성'+(selN?` (${selN}명)`:''),'pySelGo',null,'cbtn--xs'+(selN?'':' cbtn--off'))}${btn('기간 전체 조서 작성','pyDl','j','cbtn--xs')}</div>
   ${dl?`<div style="padding:8px 14px 0">${ok(dlL)}</div>`:''}
   <div class="gt"><div class="gt__hd" style="grid-template-columns:24px 1fr"><div><button type="button" class="ck" data-act="pyAll" aria-label="전체 선택">${ck(allOn,selN>0&&!allOn)}</button></div><div style="font-size:11px;color:#8a94ac;font-weight:600">전체 선택 · 성명 클릭 → 하단 상세</div></div></div>${tbl}
   <div class="cc__ft">성명 클릭 → 하단 상세(건수·만족도·리드타임·수당·지급 이력) · 채널별 완료 기준(K13) — 온라인: 답변 등록 교사만 · 방문/화상: 보고서 확정 · 전화: 수당 0 (실적만 집계) · 세액 = 사업소득세 3% + 주민세(소득세의 10%) · 단가 손입력(11.5) 폐지 — 단가표 마스터 × 완료 건 자동 산정 · 계좌는 마스킹, 전체 조회는 정산 담당 Role만(O-09) · 조서 결재 후 에듀파인 업로드 파일 자동 생성</div>${det}</section></div>`;
}
/* ─────────────── 스케줄·예약 (확정 가능 P1 · 예비 P2) ─────────────── */
function vBook(el){
  const g=S.grid||D.BKDEF;const teacher=isCounselor();
  if(!teacher){/* 실무사 : 선생님별 등록 현황 */
    const gp1=Object.values(g).filter(v=>v===1).length,gp2=Object.values(g).filter(v=>v===2).length;
    const rows=D.BKST.map(r=>{const p1=r[3]===null?gp1:r[3],p2=r[4]===null?gp2:r[4],reg=p1+p2>0;const at=r[0]==='박선영'?'09.02 (T-02 연동)':r[5];return {n:r[0],g:r[1],ch:r[2],p1,p2,reg,at};});
    const regN=rows.filter(r=>r.reg).length,unN=rows.length-regN,unAll=rows.filter(r=>!r.reg).every(r=>S.bkRm[r.n]);
    const tbl=gt([{l:'성명'},{l:'지원단'},{l:'채널'},{l:'확정 가능 (P1)',cls:'num'},{l:'예비 (P2)',cls:'num'},{l:'합계',cls:'num'},{l:'등록 상태'},{l:'최근 등록'},{l:'마감 리마인드'}],rows.map(r=>({cls:r.reg?'':'is-sel',c:[`<b style="color:#1f4fa3">${r.n} T</b>`,r.g,r.ch,r.p1,r.p2,`<b>${r.p1+r.p2}</b>`,r.reg?chipC('등록 완료','green'):chipC('미등록','red'),r.at||'—',r.reg?'<span class="ft" style="margin:0">—</span>':dbtn(S.bkRm[r.n],'리마인드 (C-02)','✓ 발송됨','bkRm',r.n,'cbtn--xs')]})),{tpl:'80px 100px 90px 90px 80px 60px 90px 120px 130px'});
    el.innerHTML=`<div class="cns"><div class="hilite">선생님이 T-02에서 등록한 확정 가능(P1)·예비(P2) 슬롯이 그대로 학생·학부모 예약 캘린더에 노출됩니다 — 실무사는 등록 현황 확인·마감 리마인드·집중/특별 모드 설정만, 슬롯 편집은 선생님 본인만</div>
    <div class="tiles"><div class="tile"><b>${rows.reduce((a,r)=>a+r.p1,0)}</b><span>이번 주 확정 가능(P1) 슬롯 — 9/7~9/11 · 표본 8명</span></div><div class="tile"><b>${rows.reduce((a,r)=>a+r.p2,0)}</b><span>이번 주 예비(P2) 슬롯</span></div><div class="tile"><b>${regN} / ${rows.length}</b><span>등록 완료 선생님 — 전체 위촉 100명 중 87명 등록</span></div><div class="tile"><b>D-23</b><span>10월분 슬롯 등록 마감 — 9/25 (매월 25일 · 현행 엑셀 제출 마감 승계)</span></div></div>
    <section class="cc"><div class="cc__hd"><span>선생님별 슬롯 등록 현황 — 이번 주 (9/7 ~ 9/11)</span>${chipC('미등록 '+unN+'명','red')}<span class="sp"></span>${btn('미등록 전원 리마인드'+(unN?` (${unN}명)`:''),'bkRmAll',null,'cbtn--xs'+(unN&&!unAll?'':' cbtn--off'))}</div>${tbl}<div class="cc__ft">확정 가능(P1) = 학생이 고르면 즉시 확정 · 예비(P2) = 요청 시 선생님 수락 후 확정 · 박선영 T 행은 상담 선생님 화면의 T-02 그리드와 실시간 연동 · 미등록 선생님에게는 마감 D-7 자동 리마인드 1회, 그 뒤 실무사 수동 발송(C-02 센터 번호) · 리마인드 후에도 미등록이면 해당 주 배정 제외</div></section>
    <div class="cg2"><section class="cc"><div class="cc__hd">학생·학부모에게 보이는 예약 캘린더 (S-01)</div><div class="cc__bd"><p class="nt">선생님이 등록한 슬롯만 노출 · 희망 1·2지망 등록과 유선 조율 폐지 — 슬롯 직접 선택으로 흡수 · 방문 슬롯은 센터 상담실 6개 연동(방문 = 센터만) · 학기당 1회 한도 · D-1 18시까지 셀프 변경·취소, 당일 취소·노쇼는 3개월 제한</p>${ft('신청 화면은 포털 counsel.html — 여기서는 노출 규칙만 관리')}</div></section>
    <section class="cc"><div class="cc__hd">집중·특별 상담 모드 설정 (정보원)</div><div class="cc__bd">${kv([['집중상담기간','9/15 ~ 10/10 · 정원 1일 60건 · 교사 풀 전원'],['특별진학상담','9/15 시즌 오픈 · 수시 원서 기간 · 정원 1일 40건 · 대학진학지도지원단 62명'],['대기열','정원 초과 시 대기 번호 발급 · 취소 슬롯 자동 승계'],['상시 모드','선생님 등록 슬롯 그대로 · 정원 제한 없음']],100,1)}${ft('모드 코드는 전건 태그 — 통계관리 「운영 모드별」 분포의 근거 · 설정 변경은 감사로그')}</div></section></div></div>`;return;}
  const cells=D.BKDAYS.map((d,di)=>`<div class="td">${d}</div>`+D.BKTMS.map((t,ti)=>{const v=g[di+'-'+ti]||0;return `<button type="button" class="${v===1?'p1':v===2?'p2':''}" data-act="grid" data-arg="${di}-${ti}" aria-label="${d} ${t} ${v===1?'확정 가능':v===2?'예비':'비어있음'}">${v===1?'확정':v===2?'예비':'+'}</button>`;}).join('')).join('');
  const slots=[];D.BKDAYS.forEach((d,di)=>D.BKTMS.forEach((t,ti)=>{const v=g[di+'-'+ti]||0;if(v)slots.push([d+' '+t+' · 화상 60분',v]);}));const p1=slots.filter(s=>s[1]===1).length;
  el.innerHTML=`<div class="cns"><div class="hilite">슬롯 등록(확정 가능 · 예비) — ${teacher?'내 주간 스케줄(T-02)':'교사 T-02(좌)'}에서 셀을 누르면 비어있음 → 확정 가능(P1) → 예비(P2) 순환. 신청자 S-01(우) 캘린더가 즉시 따라 바뀝니다 — 엑셀 공동편집·통화 조율의 대체</div>
  <div class="cgb"><section class="cc"><div class="cc__hd">${chipC('상담 선생님','navy')}<span>T-02 ${teacher?'내 상담 스케줄':'상담 스케줄'} — 주간</span><span class="sp"></span>${chipC('교사 본인만 수정','link')}</div><div class="cc__bd"><div class="pg"><div></div>${D.BKTMS.map(t=>`<div class="th">${t}</div>`).join('')}${cells}</div>
   ${ft('확정 = 확정 가능 슬롯(P1, 학생 선택 즉시 확정) · 예비 = 예비 슬롯(P2, 요청 시 선생님 수락 후 확정) · 슬롯 30/60분 · 채널(방문/화상 — 한 풀이 전 채널, Q2) · 방문 슬롯은 센터 상담실 6개 연동(방문=센터만, Q3) · 현행 매달 엑셀 신청(K5)은 월별 슬롯 등록 마감일로 승계 · 집중·특별 모드에서는 정보원이 기간·정원·교사 풀 설정')}</div></section>
  <div class="stack"><section class="cc"><div class="cc__hd">${chipC('학생·학부모','teal')}<span>S-01 예약 캘린더 (폰)</span></div><div class="cc__bd"><div class="hilite">이번 주 확정 가능 ${p1} · 예비 ${slots.length-p1} — 신청자에게 그대로 노출</div>
   ${slots.length?slots.map(s=>`<div class="lr" style="padding:7px 0"><span class="sp">${s[0]}</span>${s[1]===1?chipC('즉시 확정','green'):chipC('요청 후 확정','amber')}</div>`).join(''):'<p class="ft" style="text-align:center;padding:12px 0">등록된 슬롯 없음 — 좌측에서 확정 가능·예비 슬롯을 등록하세요</p>'}
   ${ft('희망 1·2지망 등록·유선 조율 폐지 — 슬롯 직접 선택으로 흡수 · 학생·학부모는 포털 상담 신청(counsel.html)에서 이 슬롯을 고릅니다')}</div></section>
  <section class="cc"><div class="cc__bd"><b style="font-size:13px">스케줄이 어긋나면 — 플랜 B</b><p class="nt" style="margin-top:6px">어긋남 이벤트 3종(교사 취소·신청자 변경·노쇼 10분) → <b>옵션 A</b> 대체 교사(같은 지원단·같은 슬롯) / <b>옵션 B</b> 다른 날(같은 교사의 확정 가능·예비 슬롯 2개) 자동 제시 · D-1 18시 이전은 완전 자동 · 옵션 0개·당일 건만 정보원 큐${teacher?'':' — <a href="#vc" style="color:#1f4fa3;font-weight:700">화상·방문 상담의 「일정 변경·어긋남」에서 처리 →</a>'}</p></div></section></div></div></div>`;
}
/* ─────────────── 우측 패널 (실무사 콘솔) ─────────────── */
const ES_VIEWS=['mg','ol','vc','wv'];
function esHtml(){
  const isOl=cur==='ol',isVc=cur==='vc'||cur==='wv';const tab=isOl?'alarm':(S.esTab||'main');
  const curL=tab==='alarm'?'AI 분석 및 상담이력':(isVc?'AI 회의록':'콘솔 정보');
  let body='';
  if(tab==='main'&&!isVc){const pay=S.copPay||0;
   body=`<div class="ekp"><div><b>94%</b><span>자동 배정률 (실무사 개입 0 목표)</span></div><div><b>3%</b><span>실무사 개입 건 비율 — 예외만</span></div><div><b>63%</b><span>만족도 응답률 (현행 11%)</span></div><div><b>0건</b><span>학생부 이메일 전달 · 발송 누락</span></div></div>
   <p class="ft" style="margin:0">예외는 별도 큐 없이 프로세스 안에서 처리 — 게시판 상담(미배정·SLA·반려) · 화상·방문 상담(일정 변경·어긋남 플랜B) 화면의 빨간 배지</p>
   <div class="ec"><h4>O-01 위촉 명부·승인 — 수명주기 (핵심 ⑪)</h4><p>풀(교원 인증 412명) → <b>3월 공문 모집</b> → 심사·선발(경쟁률 약 2:1, K16) → <b>4.1 위촉</b>(역할 승격·기간 등록) → 활동/보류 → <b>익년 3.31 자동 만료·회수</b> · 연 단위 재승인 — 현행 "상담중/보류" 1비트 대체</p>${D.APR.map(a=>`<div class="qrow"><div class="sp"><b>${a[1]}</b><div class="ds">${a[2]}</div></div>${dbtn(S.copAppr[a[0]],'심사 → 승인','✓ 위촉 승인','copAppr',a[0],'cbtn--xs')}</div>`).join('')}<div class="soft" style="margin-top:8px;background:#fdf1de;color:#7a5410">만료 예정 — 전원 2027.3.31 자동 회수 (연 1회 주기) · 풀 현황 히트맵(O-08): 진로상담교사단 38 · 대학진학지도지원단 62 · 한 풀이 전 채널 담당(Q2)</div></div>
   <div class="ec"><h4>O-06 수당 산정·조서 — 8월 (핵심 ⑨)</h4><p>화상 812건 × ${vcRate().toLocaleString()} = ${(812*vcRate()).toLocaleString()}<br>방문 391건 × 50,000 = 19,550,000<br>온라인 답변 81건 × 15,000 = 1,215,000</p><p style="font-weight:800;color:#16386f">계 1,284건 · ${(812*vcRate()+19550000+1215000).toLocaleString()}원 — 단가표 마스터 v${ADM().unit||3} (플랫폼관리 발행)</p>${payStages(pay)}${payBtn(pay,'cbtn--block cbtn--xs')}<p class="ft">채널별 완료 기준(K13) — 온라인: 답변 등록 교사만 · 방문/화상: 보고서 확정 · 전화: 실적만 집계, 수당 0 · 취소·노쇼는 정책값 · 단가 손입력·수동 재입력 폐지 · 교사는 T-06에서 본인 실적·이의 제기</p></div>
   <div class="ec"><h4>O-04·O-05 실적·과거 이관 (핵심 ⑧)</h4><p>상담 원장 1개(온라인·방문·화상·전화·현장) + 코드 2축(유형×계열) — 창구 3곳 통계 불일치 0 목표</p><div class="tgs">${[['all','전체'],['A','A 완전 71%'],['B','B 부분 22%'],['C','C 추정 7%']].map(([k,l])=>tgl(S.copCoh===k,l,'copCoh',k)).join('')}</div><div class="soft" style="margin-top:8px">${D.COH[S.copCoh]}</div></div>
   <div class="ec"><h4>O-09 정산 개인정보 (핵심 ⑫)</h4><p>박선영 — 국민 ****-**-**4821 · 검증 ✓ · 통장사본 S존<br>김도현 — 신한 ****-**-**0937 · 검증 대기</p><p class="ft">현행 평문 VARCHAR·화면 노출 → 암호화 저장 · 끝 4자리 마스킹 · 정산 담당 Role만 · 열람 사유 로그 · 위촉 만료 후 N년 파기</p></div>`;}
  else if(tab==='main'&&isVc){const wv=cur==='wv';
   body=`<div class="tgs">${chipC('[AI 초안] STT → 요약','purple')}${chipC('Private LLM · S존','gray')}${chipC('교사 확정 전 미노출','amber')}</div>
   <div class="ec"><h4><span>♪</span><span class="sp">rec_20260902_1500_C24.m4a</span>${chipC('동의 ✓','purple')}</h4><p class="ft" style="margin:0">녹취 원본 · 42:07 · 38.4MB · S존 격리 저장</p><div class="play"><span class="pb">▶</span>${bar(34,'#16386f',6)}<span style="font-size:11px;color:#8a94ac">14:22 / 42:07</span></div><p class="ft">다운로드 불가 — 스트리밍 청취만(열람 로그) · 보존 90일(보고서 확정·이의 제기 기간) 후 자동 파기 — 파기 예정 2026.12.01 · 즉시 삭제권 · 상호 동의 건만 STT</p></div>
   <div class="ec"><h4>${wv?'AI 회의록 — #14 특성화고 대입 방문 상담 (55분 · 대면 녹취)':'AI 회의록 — #24 정시 지원선 화상 상담 (42분)'}</h4>${(()=>{const st=AIS().stt;return st==null?'':st<2?`<p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#c03535">STT 합격선 ${st===1?'카나리 중':'경계 (CER 5.2%)'} — 요약 초안은 교사 원문 대조 필수 · AI 서비스 관리 관제 상태</p>`:`<p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#157f3d">STT 합격선 회복 (CER 4.6%) — AI 서비스 관리 관제 상태</p>`;})()}${[['15:02','인사·현황 공유 — 학부모 참석 확인, 상담 목적(정시 지원선) 합의'],['15:10','성적 분석 — 9월 학평 백분위 합 241.5 · 참고점 957.9 검토'],['15:25','수능최저 전략 — 2합5 충족 시나리오, 탐구 보완 우선'],['15:38','후속 합의 — 모의면접 2회 · 9월 모평 후 재상담 제안']].map(x=>`<div class="ai-row">${chipC(x[0],'gray')}<span class="sp">${x[1]}</span><a href="#" data-act="noop" data-arg="녹취 구간 재생 (목업)">▶ 원문</a></div>`).join('')}<div class="tgs" style="margin-top:6px">${['정시 지원선','수능최저 2합5','참고점 957.9','모의면접'].map(x=>chipC(x,'link')).join('')}</div><p class="ft">문장별 [▶ 원문] = 녹취 구간 재생 링크 — 요약 ↔ 원문 대조 검증 (T-07)</p></div>
   <div class="ec"><h4>상담선생님 활용 — 정하늘 T</h4><p>① 요약 검토 ✓ · ② 원문 구간 대조 ✓ (2곳)<br>③ 수정 2건 — 판정 문구 완화 · 후속 일정 구체화</p>${S.aiUse?ok('✓ 보고서 초안에 반영 — T-05에서 교사 [확정] 후 학생 열람본 게시 · 수정 이력 기록'):btn('④ 보고서 초안으로 반영 (T-05)','aiUse',null,'cbtn--xs cbtn--block')}<p class="ft">원 녹취는 보존 기간 후 자동 파기 · 요약은 학습 평면 반출 금지 · 교사 승인 없이는 저장·게시 불가 (HITL)</p></div>`;}
  else{body=aiAnalysisHtml(false);}
  return `<aside class="es" id="cnsEs" style="width:${S.esW||400}px" aria-label="${curL}"><div class="hdl" id="esHdl" aria-hidden="true"></div><div class="es__hd">${isOl?'':`<button type="button" class="arr" data-act="esTab" data-arg="main" aria-label="이전 탭" style="color:${tab==='alarm'?'#1f4fa3':'#c3cad8'}">◀</button>`}<span class="cur">${curL}<small>${tab==='alarm'?'2 / 2':'1 / 2'}</small></span>${isOl?'':`<button type="button" class="arr" data-act="esTab" data-arg="alarm" aria-label="다음 탭" style="color:${tab==='alarm'?'#c3cad8':'#1f4fa3'}">▶</button>`}<button type="button" class="xbt" data-act="esClose" aria-label="패널 닫기">✕</button></div>${body}</aside>`;
}
function aiAnalysisHtml(teacher){
  const ax=[['전공 적합성',82],['위계성',76],['연결성',71],['강화',68]].map(a=>`<div class="ax"><span class="l">${a[0]}</span>${bar(a[1],'#7030a0',7)}<span class="v">${a[1]}</span></div>`).join('');
  if(teacher)return `<div class="tgs">${chipC('[AI 분석보고서]','purple')}${chipC('다음 상담 학생 기반 · 동의 스코프','green')}${chipC('교사 참고용 — 학생 미노출','amber')}</div>
   <div class="ec"><h4>다음 상담 — 14:00 화상 · 강** (고3)</h4><p>연결 정보 — 성적 ✓ · 이전 상담 2건 · 사전 질문 ✓<br>학평 백분위 합 241.5 — <b style="color:#157f3d">+3.5p 상승 추세</b> · 내신 2.55<br>관건 — 수능최저 2합5 충족 시나리오 · 안정 축 1장</p></div>
   <div class="ec"><h4>4축 진단 (② 정밀분석)</h4>${ax}<p class="ft">각 축 클릭 시 근거 원문(세특·창체) 링크 — 출처 없는 항목 표시 금지</p></div>
   <div class="ec"><h4>과거 상담이력 (해당 학생)</h4><p>8.12 화상 — 수시 전략 · 국민대 안정권 확인<br>7.03 게시판 — 성적 상담 · 내신 2.6 → 2.55</p><p class="ft">확률·판정은 승인분만 인용 (단정 차단) · 최종 판단은 상담교사</p></div>
   <div class="ec"><h4>보고서 작성 — 미확정 건</h4>${D.REP2.map(p=>`<div class="qrow"><span class="sp">${p[1]}</span>${dbtn(S.ctRp[p[0]],'작성·확정','✓ 확정','ctRpW',p[0],'cbtn--xs')}</div>`).join('')}<p class="ft">[작성·확정] 클릭 → 본문 4. 결과보고서 할 일에 작성 폼(제목·요약·판정·후속)이 열립니다 · AI 초안 자동 채움 · 확정 전 학생 미노출 (HITL)</p></div>`;
  return `<div class="tgs">${chipC('[AI 분석보고서]','purple')}${chipC('신청 학생 정보 기반 · 동의 스코프','green')}${chipC('교사 참고용 — 학생 미노출','amber')}</div>
   <div class="ec"><h4>신청자 프로필 — 황** (고3 · 학부모 신청)</h4><p>연결 정보 — 성적(나침판) ✓ · 학생부 업로드 ✓ · 이전 상담 1건<br>희망 — 인문·미디어 계열 · 정시 병행</p></div>
   <div class="ec"><h4>성적 분석</h4><p>학평 백분위 합 241.5 — <b style="color:#157f3d">+3.5p 상승 추세</b> (3·4·7월)<br>내신 전교과 2.55 · 국수영사 2.41 (유리 조합)<br>수능 변환(보정) 237.3 — 정시 지원선 재탐색 권장</p></div>
   <div class="ec"><h4>4축 진단 (② 정밀분석)</h4>${ax}<p class="ft">각 축 클릭 시 근거 원문(세특·창체) 링크 — 출처 없는 항목 표시 금지</p></div>
   <div class="ec"><h4>추천 상담 포인트 (AI 제안 — 자문)</h4><p>① 수능최저 2합5 충족 시나리오 — 탐구 보완 우선<br>② 수시 6장 중 안정 축 1장 미확보 — 조합 재검토<br>③ 상승 추세 반영 — 정시 지원선 상향 재탐색</p><p class="ft">확률·판정은 승인분만 인용 (단정 표현 자동 차단) · 최종 판단은 상담교사 — 근거 상시 표시</p></div>
   <div class="ec"><h4>과거 상담이력 (통합 프로파일)</h4>${[['8.12 화상','수시 전략 — 국민대 안정권 확인 · 최저(2합5) 9월 모평 후 재확인 합의'],['7.03 게시판','성적 상담 — 내신 2.6 → 2.55 상승 · 유리 조합(국수영사) 확인'],['5.20 방문','진로 탐색 — 진로종합검사 해석 · 미디어·콘텐츠 흥미 상위 확인']].map(x=>`<div class="his">${chipC(x[0],'gray')}<span>${x[1]}</span></div>`).join('')}<p style="margin-top:6px"><b>진로 희망</b> — 미디어·콘텐츠 기획 (검사 결과와 일치)<br><b>진학 희망</b> — 미디어커뮤니케이션·신문방송 계열 · 수시 6장 + 정시 병행<br><b>학생·학부모 희망</b> — 일치 ✓ (불일치 시 3자 상담 권장)</p><p class="ft">이력 주체 = 학생 본인 · 상담자는 역할 단위 익명 표시 · 이전 이력은 다음 교사에게 자동 표시 (해석 차이 완화)</p></div>`;
}
function renderEs(){
  document.querySelectorAll('#cnsEs,#cnsRail').forEach(n=>n.remove());const main=document.getElementById('opsMain');if(!main)return;
  const teacher=isCounselor();const show=teacher?cur==='tdash':ES_VIEWS.includes(cur);const off=teacher?S.ctEsOff:S.esOff;
  main.classList.remove('cns-narrow');
  if(!show){main.style.marginRight='';return;}
  const tablet=window.matchMedia('(max-width:1023px)').matches;
  if(off){main.style.marginRight=tablet?'':'44px';main.insertAdjacentHTML('beforeend',`<div class="es-rail" id="cnsRail" role="button" tabindex="0" data-act="esOpen" aria-label="${teacher?'AI 분석 패널 열기':'콘솔 정보 패널 열기'}"><b>◀</b><span>${teacher?'AI 분석':'콘솔 정보'}</span></div>`);return;}
  const w=teacher?400:(S.esW||400);main.style.marginRight=tablet?'':(w+14)+'px';if(!tablet&&main.clientWidth<980)main.classList.add('cns-narrow');
  main.insertAdjacentHTML('beforeend',teacher?`<aside class="es" id="cnsEs" aria-label="AI 분석 및 상담이력"><div class="es__hd"><span class="cur">AI 분석 및 상담이력</span><button type="button" class="xbt" data-act="esClose" aria-label="패널 닫기">✕</button></div>${aiAnalysisHtml(true)}</aside>`:esHtml());
  const h=document.getElementById('esHdl');if(h)h.addEventListener('mousedown',e=>{const sx=e.clientX,sw=S.esW||400;document.body.style.userSelect='none';const mv=ev=>{const nw=Math.min(760,Math.max(340,sw+(sx-ev.clientX)));S.esW=nw;const p=document.getElementById('cnsEs');if(p)p.style.width=nw+'px';main.style.marginRight=(nw+14)+'px';main.classList.toggle('cns-narrow',main.clientWidth<980);};const up=()=>{window.removeEventListener('mousemove',mv);window.removeEventListener('mouseup',up);document.body.style.userSelect='';save();};window.addEventListener('mousemove',mv);window.addEventListener('mouseup',up);e.preventDefault();});
}
/* ─────────────── 상담선생님 대시보드 ─────────────── */
const WD3=['화','수','목','금','토','일','월'],wd3=d=>WD3[(d-1)%7];
function vTdash(el){
  const TA=D.TA,rqN=D.RQ.filter(r=>!S.ctRq[r[0]]).length,rpN=D.REP2.filter(p=>!S.ctRp[p[0]]).length;
  /* ① 내 일정 */
  let sch='';
  if(S.ct3V==='m'){const d=S.ct3D,items=TA[d]||[];sch=`<div class="cga" style="padding:12px 14px"><div class="cal5">${['월','화','수','목','금'].map(w=>`<div class="wd">${w}</div>`).join('')}${D.W2.flat().map(x=>x?`<button type="button" class="${x===d?'is-on':''}" data-act="ct3D" data-arg="${x}" aria-pressed="${x===d}"><b>${x}</b><span>${(TA[x]||[]).length?(TA[x].length+'건'):'&nbsp;'}</span></button>`:'<button type="button" class="is-out" disabled><b>—</b><span>&nbsp;</span></button>').join('')}</div>
    <div><b style="font-size:13px">9월 ${d}일 (${wd3(d)}) — ${items.length}건</b>${items.length?items.map(x=>`<div class="lr" style="padding:7px 0">${x}</div>`).join(''):'<p class="ft">일정 없음 — 확정 가능·예비 슬롯 등록 가능 (T-02)</p>'}</div></div>`;}
  else if(S.ct3V==='w'){sch=[1,2,3,4,5].map(d=>`<div class="week${d===2?' is-today':''}"><b>9/${d} (${wd3(d)})</b><span>${(TA[d]||[]).join('  ·  ')||'일정 없음 — 확정 가능·예비 슬롯 등록 가능'}</span></div>`).join('');}
  else{sch=`<div style="padding:10px 14px"><b style="font-size:13px">오늘 — 9/2 (수)</b>${TA[2].map(x=>`<div class="lr" style="padding:7px 0">${x}</div>`).join('')}${ft('공강(휴식중) 시간대는 대체 상담 요청이 올 수 있습니다 — 배정 요청함에서 수락·거절')}</div>`;}
  /* ② 공유 */
  const sh=S.shr;const toList=Object.entries(sh.to).filter(([k,v])=>v).map(([k])=>k);
  const cnt=(sh.stuOk?2:0)+(sh.on?Object.values(sh.items).filter(Boolean).length:0)+(sh.schOn?1:0);
  const share=`<section class="cc" style="border-color:#e3d5f2"><div class="cc__bd"><div class="tgs" style="margin-bottom:8px"><b style="color:#7030a0;font-size:13px">학생 상담정보 공유 — 재학교 지정 교사(담임·진로진학·상담)</b><span class="ft" style="margin:0">학생 김서연 · 서울○○고 2-3 · 동의 3종 ✓ · ${sh.stuOk?'학생 공유 승인 ✓ (포털)':'학생 포털 승인 대기 — 정보원 공유는 상담 동의 범위 내에서 가능'}</span><span class="sp"></span><span class="ft" style="margin:0">공유·열람 전건 감사로그</span></div>
   <div class="cg4" style="grid-template-columns:1.2fr 1fr 190px 1.3fr"><div><div class="ft" style="margin:0 0 4px">공유 항목</div><div class="tgs">${tgl(sh.items.infoLog,'정보원 상담 이력 (게시판·화상·방문)','shrItem','infoLog','is-pur')}${tgl(sh.items.infoRpt,'정보원 상담 보고서 (AI 회의록 요약)','shrItem','infoRpt','is-pur')}</div></div>
   <div><div class="ft" style="margin:0 0 4px">공유 대상</div><div class="tgs">${[['담임','담임 박서준'],['진로진학교사','진로진학교사 이하늘'],['상담교사','상담교사 정우진']].map(([k,l])=>tgl(sh.to[k],l,'shrTo',k,'is-pur')).join('')}</div></div>
   <div>${sh.on?`<button type="button" class="cbtn cbtn--block" style="background:#fff;color:#c0392b;border-color:#f3c9c4" data-act="shrGo">공유 중지</button><div class="ft">공유 중 → ${toList.join('·')||'대상 없음'} · ${sh.at}</div>`:`<button type="button" class="cbtn cbtn--block" style="background:#7030a0;border-color:#7030a0" data-act="shrGo">재학교 선생님과 공유</button><div class="ft">미공유 — 학생 동의(상담 신청 시 동의 3종) 확인됨 ✓</div>`}</div>
   <div style="border-left:1px solid #eef1f7;padding-left:12px">${sh.schOn?'<div class="soft" style="background:#fff3e6"><b style="color:#E07B00">담임 박서준</b> → 학교 상담 기록 공유됨 · 학생상담모드 사전정보에 병합</div>':''}<div class="ft" style="margin:0">${cnt}건 공유 원장 · 최근:${sh.log.length?sh.log.map(l=>`<span style="display:block">${l.t} ${l.who} — ${l.what} → ${l.to}</span>`).join(''):' 없음'}</div></div></div></div></section>`;
  /* ③ 배정 요청함 */
  const rq=D.RQ.filter(r=>S.ctRqF==='all'||r[1]===S.ctRqF).map(r=>{const st=S.ctRq[r[0]];let right=st==='ok'?`${chipC('✓ 수락 — 내 일정 추가 · 양측 통지','green')}${btn('사전정보 확인','ctRqSel',r[0],'cbtn--xs')}`:st==='no'?chipC('거절 — 사유 기록 · 자동 재배정(부하 균등)','red'):`${btn('수락','ctRqOk',r[0],'cbtn--xs cbtn--green')}${btn('거절','ctRqNo',r[0],'cbtn--xs cbtn--line cbtn--red')}`;
   return `<div class="lr" style="align-items:flex-start;flex-wrap:wrap">${chCh(r[1])}<div class="sp">${r[2]}<div class="ds">요청 ${r[3]} · 유형·계열 매칭으로 나에게 우선 제안됨</div></div><span class="tgs">${right}</span></div>`;}).join('');
  const rs=D.RQ.find(r=>r[0]===S.ctRqSel&&S.ctRq[r[0]]==='ok');
  const rqDet=rs?`<div class="dh is-ok">${chipP('수락 완료',['#fff','#157f3d'])}<span>수락 건 상세 — ${rs[1]} · ${rs[2].split(' — ')[0]}</span><span class="sp"></span><button type="button" class="xbt" data-act="ctRqSel" data-arg="${rs[0]}" aria-label="닫기">✕</button></div><div class="cc__bd"><div class="ft" style="margin:0 0 4px;font-weight:800">학생이 제공한 사전정보 (연결 동의 항목)</div><div class="soft" style="background:#eef3fb">${rs[4]}</div><div class="ft" style="margin:10px 0 4px;font-weight:800">과거 상담이력 (통합 프로파일 — 상담자는 역할 익명)</div>${rs[5].map(h=>`<div class="lr" style="padding:5px 0">${h}</div>`).join('')}${ft('열람 권한 = 수락(배정 확정) ~ 종료 후 N일 · 전건 열람 로그 — 학생이 "내 정보를 본 기록" 조회 가능')}</div>`:'';
  /* ④ 오늘 */
  const today=D.TODAY3.map(t=>`<div class="lr"><span class="t">${t[1]}</span>${chCh(t[2])}<span class="sp">${t[3]}</span>${dbtn(S.ctAct[t[0]],t[4],t[5],'ctAct',t[0],'cbtn--xs')}</div>`).join('');
  const stNote={휴면:'휴면 신청 — 기간 지정 → 실무사 승인 필요 · 승인 시 자동 배정 제외, 기존 확정 건은 플랜B 자동',휴식중:'휴식중(공강) — 대체 상담 투입 가능 상태로 실무사 리스크 풀에 표시됩니다'}[S.ctSt]||'실무사 상담자관리 목록의 오늘 상태 칩과 실시간 연동';
  /* ⑥ 보고서 */
  const rep=D.REP2.map(p=>`<div class="lr"><span class="sp">${p[1]}</span>${dbtn(S.ctRp[p[0]],'작성·확정','✓ 확정 — 학생 열람본 게시','ctRpW',p[0],'cbtn--xs')}</div>`).join('');
  const w=D.REP2.find(p=>p[0]===S.ctRpW&&!S.ctRp[p[0]]);
  const form=w?`<div class="box bl" style="margin:10px 14px 14px"><div class="tgs" style="margin-bottom:8px">${chipC('보고서 작성','navy')}${chipC(w[6],'purple')}<span class="sp"></span><button type="button" class="xbt" data-act="ctRpWClose" aria-label="닫기">✕</button></div>
   <label class="ft" style="margin:0;font-weight:800">제목<input class="in" style="font-weight:700;margin:3px 0 8px" value="${esc(w[2])}"></label><label class="ft" style="margin:0;font-weight:800">상담 요약<textarea style="margin:3px 0 8px">${esc(w[3])}</textarea></label><label class="ft" style="margin:0;font-weight:800">판정·근거 (표기 강제)<input class="in" style="margin:3px 0 8px" value="${esc(w[4])}"></label><label class="ft" style="margin:0;font-weight:800">후속 권고<input class="in" style="margin:3px 0 8px" value="${esc(w[5])}"></label>
   <div class="acts">${btn('완료 — 확정 · 학생 열람본 게시','ctRpOk',w[0],'cbtn--green')}<span class="ft" style="margin:0">확정 시 학생 게시·통지 · 만족도 요청 · 수당 산정 반영 (K13) · 수정 이력 기록</span></div></div>`:'';
  /* ⑨ 이력 */
  const hmin={'1m':'2026-08-02','3m':'2026-06-02',y:'2026-01-01',all:''}[S.ctHp];const his=D.HIS.filter(r=>r[1]>=hmin&&(S.ctHc==='all'||r[2]===S.ctHc));
  const hs=D.HIS.find(r=>r[0]===S.ctHSel);
  const hisT=gt([{l:'일자'},{l:'유형',cls:'c'},{l:'상담자',cls:'el'},{l:'분류'},{l:'주제',cls:'el'},{l:'만족도'}],his.map(r=>({cls:S.ctHSel===r[0]?'is-sel':'',click:'ctHSel',arg:r[0],c:[`<span style="color:#6b7690">${r[1]}</span>`,chCh(r[2]),r[3],r[4],`<b style="color:#1f4fa3">${r[5]}</b>`,`<b style="color:#157f3d">${r[6]}</b>`]})),{tpl:'88px 56px 1fr 96px 1.4fr 76px'});
  const hisD=hs?`<div class="dh">${chipC('상세 열람','navy')}<span>${hs[1]} · ${hs[2]} · ${hs[3]} — ${hs[5]}</span><span class="sp"></span><button type="button" class="xbt" data-act="ctHSel" data-arg="${hs[0]}" aria-label="닫기">✕</button></div><div class="cc__bd">${kv([['상담분류',hs[4]],['판정·근거',hs[7]],['후속 권고',hs[8]],['만족도',hs[6]+' (익명 응답)'],['보고서','확정본 열람 — 학생 게시본과 동일 · 내부 메모 별도'],['이력 연결','통합 프로파일 — 같은 학생 재상담 시 다음 교사에게 표시']],76)}</div>`:'';
  /* ⑩ 통계 */
  const f8={m:1,q:2.6,y:4.2}[S.ct8P],lbl8={m:'2026년 8월',q:'2026년 3분기 (진행중)',y:'2026년 (위촉 4.1~)'}[S.ct8P];const chv=[['화상',7],['방문',3],['게시판 답변',2]].map(x=>[x[0],Math.round(x[1]*f8)]);const mx8=Math.max(...chv.map(x=>x[1]));
  el.innerHTML=`<div class="cns"><div class="sub"><span>${esc(ctx.auth.name)} T · 대학진학지도지원단 · 위촉 2026.4.1~2027.3.31 · 2026.09.02 (수)</span><span class="sp"></span>${btn('데모 상태 초기화','reset',null,'cbtn--line cbtn--xs')}</div>
  <section class="cc"><div class="cc__hd"><span class="sp">내 일정 — 2026년 9월</span>${seg([['m','월 달력'],['w','주 일정'],['d','일 일정']],S.ct3V,'ct3V')}</div><div class="cc__bd np">${sch}</div></section>
  <div class="tiles"><div class="tile"><b>${rqN}건</b><span>배정 요청 대기 — 응답 기한 24h · 무응답 시 자동 재배정</span></div><div class="tile"><b>3건</b><span>오늘 내 상담 — 화상 1 · 방문 1 · 게시판 1</span></div><div class="tile is-click" role="button" tabindex="0" data-act="ctRpKpi"><b>${rpN}건</b><span>결과보고서 작성 미비 — 클릭 시 바로 작성 (HITL)</span></div><div class="tile"><b>495,000원</b><span>8월 수당 예정 — 12건 (미지급 · 결재 대기)</span></div></div>
  ${share}
  <section class="cc"><div class="cc__hd"><span>1. 배정 요청함 — 게시판·온라인(화상)·방문 선택</span>${chipC(rqN+'건','cnt')}<span class="sp"></span>${[['all','전체'],['게시판','게시판'],['화상','온라인(화상)'],['방문','방문']].map(([k,l])=>tgl(S.ctRqF===k,l,'ctRqF',k)).join('')}</div><div class="cc__bd np">${rq||'<p class="ft" style="padding:12px 14px">해당 채널 요청 없음</p>'}${rqDet}
   <div style="background:#fbfcfe;padding:8px 14px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:12px">${chipC('내 매칭 지표','link')}<span>수락률 86% · 평균 응답 42분 — 매칭 우선순위에 반영 (자문 지표) · 연속 거절 0회 (3회 시 실무사 협의 알림)</span></div></div>
   <div class="cc__ft">실무사 대시보드와의 가장 큰 차이 — <b>채널(게시판·화상·방문) 건을 선생님이 직접 수락·거절</b> · 응답 기한 24h, 무응답·거절 시 다음 매칭 후보에게 자동 재배정 · 거절 사유는 교사 이력(3-1)에 기록</div></section>
  <div class="cgb"><section class="cc"><div class="cc__hd"><span class="sp">2. 오늘 내 상담 — 채널별 바로가기</span>${chipC('배정 건만 열람 (G)','link')}</div><div class="cc__bd np"><div class="lr" style="background:#faf7fd;align-items:flex-start">${chipC('브리핑 (30분 전 푸시)','purple')}<span class="sp" style="font-size:12px">13:30 발송 — 14:00 화상 · 강** (고3): 백분위 합 241.5 (+3.5p 추세) · 최저 2합5 충족이 관건 · 이전 상담 2건(수시 전략·성적) · 사전 질문 1건</span></div>${today}</div><div class="cc__ft">맥락 카드(성적·검사·이전 상담) 자동 준비 · 열람 권한 종료 후 N일 만료 · 게시판은 [AI 예상답변] 초안 + 근거 링크 제공</div></section>
   <section class="cc"><div class="cc__bd"><b style="font-size:13px">3. 오늘 상태 · 내 스케줄</b><div class="tgs" style="margin:8px 0">${[['상담중','상담중'],['수업중','수업중'],['휴식중','휴식중 (공강)'],['휴가중','휴가중'],['휴면','휴면 신청']].map(([k,l])=>tgl(S.ctSt===k,(S.ctSt===k?'● ':'○ ')+l,'ctSt',k)).join('')}</div><div class="soft">${stNote}</div>
    <p class="nt" style="border-top:1px solid #eef1f7;margin-top:8px;padding-top:8px">이번 주 슬롯 — 확정 가능 4개 · 예비 3개 (화상 60%) · 월별 등록 마감 매월 25일<br>다음 상담 — 9/3 (목) 15:00 화상 (D-1 리마인드 자동)</p>${go('book','주간 그리드 열기 (T-02) →')}
    <div style="border-top:1px solid #eef1f7;margin-top:10px;padding-top:8px"><b class="ft" style="margin:0 0 6px;display:block">배정 제안 필터 — 관심 분야 · 요일 선호</b><div class="tgs" style="margin-bottom:6px">${['수시·학종','정시','논술','미디어·인문','자연·공학'].map(x=>tgl(!!S.ctPf[x],(S.ctPf[x]?'☑ ':'☐ ')+x,'ctPf',x,'is-soft')).join('')}</div><div class="tgs">${['월','화','수','목','금'].map(x=>tgl(!!S.ctWd[x],(S.ctWd[x]?'☑ ':'☐ ')+x,'ctWd',x,'is-soft')).join('')}</div>${ft('선택한 분야·요일 건이 배정 요청함에 우선 제안됩니다 (완전 제외 아님 — 부하 균등 병행)')}</div></div></section></div>
  <div class="cgb"><section class="cc"><div class="cc__hd">4. 결과보고서 할 일 — 확정 전 학생 미노출 (HITL)</div><div class="cc__bd np">${rep}<p class="ft" style="padding:8px 14px;margin:0">채널별 자동 초안(STT·메모·스레드) — 나는 고쳐서 [확정]만 · 판정 근거(참고점·컷·사례) 미기재 시 자동 경고 · 목표: 상담 당일 제출</p>${form}</div></section>
   <div class="stack"><section class="cc"><div class="cc__hd"><span class="sp">5. 내 실적·수당 — 월별</span><a href="#" data-act="noop" data-arg="정산 흐름은 정보원 수당관리(O-06)에서 처리됩니다" style="color:#1f4fa3;font-size:12px;font-weight:700">정산 흐름 →</a></div><div class="cc__bd">${D.PAYT.map(p=>`<div class="lr" style="padding:5px 0;border:0"><b style="color:#16386f;width:36px">${p[0]}</b><span>${p[1]}</span></div>`).join('')}${S.ctObj?`<button type="button" class="cbtn cbtn--done cbtn--xs" style="margin-top:8px" disabled>✓ 이의 제기 접수 — 정산 담당 검토 후 회신 (이력 기록)</button>`:btn('수당 이의 제기','ctObj',null,'cbtn--xs cbtn--line','style="margin-top:8px"')}${ft('완료 기준(K13) 자동 산정 · 계좌는 T-01 본인 관리(마스킹)')}</div></section>
    <section class="cc"><div class="cc__hd">6. C-02 메시지함 · 내 만족도</div><div class="cc__bd"><div class="lr" style="padding:5px 0;border:0"><b style="color:#8a94ac;width:80px;font-weight:700">강** 학부모</b><span>"일정 변경 가능할까요?" — 10:22 · 미확인 1</span></div><div class="lr" style="padding:5px 0;border:0"><b style="color:#8a94ac;width:80px;font-weight:700">정** 학생</b><span>"방문 시 준비물 확인했습니다" — 09:40</span></div>
     <div class="soft" style="margin-top:6px">내 만족도 평균 4.7 / 5 (익명 집계 · 본인만 열람) — 화상 4.7 · 게시판 4.6 · 방문 —</div>${ft('발신 = 센터 대표번호(K12) · 개인 연락처 상호 미노출 · 전건 이력')}
     <div style="border-top:1px solid #eef1f7;margin-top:8px;padding-top:8px"><b class="ft" style="color:#7030a0;margin:0 0 6px;display:block">FAQ 승격 제안 — 내 확정 답변 #3540 "최저 충족 시나리오"</b>${S.ctFaq==='ok'?chipC('✓ 동의 — 가명화 검토 후 FAQ·RAG 지식베이스 등록 (기여 이력 기록)','green'):S.ctFaq==='hold'?chipC('보류 — 다음 분기 재제안','gray'):`<div class="tgs">${btn('동의 — 가명화 후 FAQ 등록','ctFaq','ok','cbtn--xs')}${btn('보류','ctFaq','hold','cbtn--xs cbtn--line')}</div>`}</div>
     <div class="soft" style="margin-top:8px">역할 스위처 — <b>일반 선생님</b>(교사공간) ↔ <b>상담 선생님</b>(현재) · Step-up 2FA · 위촉 만료 시 자동 회수</div></div></section></div></div>
  <section class="cc"><div class="cc__hd"><span>7. 과거 상담이력</span>${chipC(his.length+'건','gray')}<span class="sp"></span><span class="ft" style="margin:0">기간</span>${[['1m','최근 1개월'],['3m','최근 3개월'],['y','2026년'],['all','전체']].map(([k,l])=>tgl(S.ctHp===k,l,'ctHp',k)).join('')}<span class="ft" style="margin:0 0 0 6px">유형</span>${[['all','전체'],['게시판','게시판'],['화상','화상'],['방문','방문']].map(([k,l])=>tgl(S.ctHc===k,l,'ctHc',k)).join('')}</div>${hisT}${hisD}<div class="cc__ft">행 클릭 → 확정 보고서 상세 열람 · 내 배정 건만 조회(G — 배정 외 차단) · 종료 후 N일 지나면 원문 자료는 만료, 확정 보고서·이력만 보존 · 같은 학생 재상담 시 이력이 자동 표시</div></section>
  <h2 class="sec">8. 내 통계 — ${lbl8}<span class="sp"></span><small>기간</small>${seg([['y','년'],['q','분기'],['m','월']],S.ct8P,'ct8P')}${btn('내 통계 엑셀 출력','ct8Xl',null,'cbtn--green cbtn--xs')}</h2>
  ${S.ct8Xl?ok(`✓ 내 통계 엑셀 출력 — ${lbl8} 기준 (본인 데이터만 · 비교값은 익명 평균) · 출력 이력 기록`)+'<div style="height:10px"></div>':''}
  <div class="cg3"><section class="cc"><div class="cc__bd"><b style="font-size:13px">내 채널별 완료 건수</b><div style="margin-top:6px">${chv.map(x=>brow(x[0],Math.round(x[1]*100/mx8),x[1]+'건','#1f4fa3',90)).join('')}</div>${ft('완료 기준(K13) 충족분만 — 수당 산정과 동일 집계')}</div></section>
   <section class="cc"><div class="cc__bd"><b style="font-size:13px">내 월별 상담 건수 — 위촉 이후</b><div class="vbars" style="height:76px">${[['4월',6],['5월',8],['6월',9],['7월',11],['8월',12]].map(m=>`<div class="vb"><b>${m[1]}</b><div class="stk" style="height:${Math.round(m[1]*100/12)}%;background:${m[1]===12?'#16386f':'#c8d8f2'}"></div></div>`).join('')}</div><div class="vlbl">${['4월','5월','6월','7월','8월'].map(m=>`<span>${m}</span>`).join('')}</div>${ft('완만한 증가 추세 — 주 12건 초과 과부하 구간 없음 (부하 균등)')}</div></section>
   <section class="cc"><div class="cc__bd"><b style="font-size:13px">내 지표 vs 전체 평균 (익명 비교)</b>${[['만족도 평균','4.7 / 5','전체 4.6'],['당일 입력률','92%','전체 82%'],['배정 수락률','86%','평균 78%'],['노쇼·취소 유발','0건','—']].map(x=>`<div class="lr" style="padding:6px 0"><span class="sp">${x[0]}</span><b style="color:#16386f">${x[1]}</b><span class="ft" style="margin:0;width:70px;text-align:right">${x[2]}</span></div>`).join('')}${ft('본인 데이터만 표시 — 타 교사 개별 수치 비공개 (익명 평균만) · 코칭 참고용, 평가 아님')}</div></section></div></div>`;
}
/* ─────────────── 액션 ─────────────── */
const toast=m=>window.showToast&&showToast(m);
const ACT={
 noop:(a)=>toast(a||'목업 — 이 조작은 시연용입니다'),
 reset:()=>{localStorage.removeItem(KEY);S=clone(DEF);draw();toast('데모 상태를 초기화했어요');},
 cd1View:a=>set({cd1View:a}),cd1D:a=>set({cd1D:+a}),cd2St:a=>{const i=+a;setK('cd2St',i,!(S.cd2St[i]??(i===2)));},cd2Ap:a=>{setK('cd2Ap',a,true);toast('잔여 위촉 기간(~2027.3.31)으로 위촉했어요 · 역할 승격 + 위촉 등록');},
 cd3Q:a=>{setK('cd3Q',a,true);toast('처리했어요 · 감사로그 기록');},cd4Rm:()=>{set({cd4Rm:true});toast('미확정 2건에 리마인드를 보냈어요 (C-02)');},
 copPay:()=>{const p=Math.min((S.copPay||0)+1,2);set({copPay:p});toast(p===1?'수당지급조서를 생성했어요':'결재 승인 · 에듀파인 업로드 파일을 생성했어요');},
 cd5Pd:a=>set({cd5Pd:a}),cd5Q:a=>{const q=+a,o=Object.assign({},S.cd5Qs);o[q]=!o[q];if(![1,2,3].some(x=>o[x]))return toast('분기는 최소 1개를 선택해야 해요');set({cd5Qs:o});},
 cd5M:a=>{const m=+a,o=Object.assign({},S.cd5Ms);o[m]=!o[m];if(![1,2,3,4,5,6,7,8].some(x=>o[x]))return toast('월은 최소 1개를 선택해야 해요');set({cd5Ms:o});},
 cd5Xl:()=>{set({cd5Xl:true});toast('엑셀로 출력했어요 · 출력 이력 기록');},cd5By:a=>set({cd5By:a}),
 /* 상담자관리 */
 mgT:a=>set({mgT:+a,mgSent:null,mgDet:null,detG:null,detSaved:false,detHo:null}),mgSel:a=>{toggleK('mgSel',a);S.mgSent=null;save();draw();},
 mgAll:()=>{const rows=mgRows(),tab=S.mgT,all=rows.every(r=>S.mgSel[tab+'-'+r[0]]);const o=Object.assign({},S.mgSel);rows.forEach(r=>o[tab+'-'+r[0]]=!all);set({mgSel:o,mgSent:null});},
 mgSend:()=>{const rows=mgRows(),tab=S.mgT,n=rows.filter(r=>S.mgSel[tab+'-'+r[0]]).length;if(!n)return toast('먼저 선생님을 선택하세요');const o=Object.assign({},S.mgSel);rows.forEach(r=>delete o[tab+'-'+r[0]]);set({mgSel:o,mgSent:n});toast(`단체문자 ${n}명 발송 — 센터 대표번호(C-02)`);},
 mgDet:a=>set({mgDet:+a,detG:null,detSaved:false,detHo:null}),mgDetClose:()=>set({mgDet:null,detG:null,detSaved:false,detHo:null}),detSave:()=>{set({detSaved:true});toast('수정 저장 — 변경 이력 기록');},
 detG:a=>set({detG:a,detSaved:false}),
 detSt:a=>{const k=S.mgT+'-'+S.mgDet;if(a==='휴면중')return set({detHo:'pending'});setK('liveOv',k,a);S.detHo=null;S.detSaved=false;save();draw();toast(`오늘 상태 [${a}] — 목록·리스크 풀에 즉시 반영`);},
 detHoAp:()=>{const k=S.mgT+'-'+S.mgDet;const o=Object.assign({},S.liveOv);o[k]='휴면중';set({liveOv:o,detHo:'ok'});toast('휴면 승인 — 기간 중 배정 자동 제외');},detHoRj:()=>{set({detHo:'rej'});toast('휴면 신청 반려 — 사유 통지');},
 /* 리스크 */
 vacSel:a=>{toggleK('vacSel',a);S.vacSent=null;save();draw();},vacSend:()=>{const n=Object.keys(S.vacSel).filter(k=>S.vacSel[k]).length;if(!n)return toast('먼저 선생님을 선택하세요');set({vacSel:{},vacSent:n});toast(`대체 요청 문자 ${n}명 발송`);},
 fixed:a=>{setK('fixed',a,true);toast('대체 일정 확정 — 재확정 · 양측 통지 · 변경 이력 기록');},
 rkAcc:()=>set({rkSub:'acc'}),rkFix:()=>{set({rkSub:'fix'});toast('대체 확정 — 박선영 T → 이정민 T · 양측 자동 통지');},rkNo:()=>{set({rkNo:true});toast('사과 문자 + 재예약 링크를 보냈어요');},
 /* 게시판 */
 olT:a=>set({olT:a,olSel:null,olAct:null}),olMs:a=>{toggleK('olMs',+a);S.olBulk=null;save();draw();},
 olAll:()=>{const rows=D.OLR.filter(r=>S.olT==='all'||r[7]===S.olT),all=rows.every(r=>S.olMs[r[0]]);const o=Object.assign({},S.olMs);rows.forEach(r=>o[r[0]]=!all);set({olMs:o,olBulk:null});},
 olBulkCat:()=>{const n=Object.keys(S.olMs).filter(k=>S.olMs[k]).length;if(!n)return toast('먼저 건을 선택하세요');set({olMs:{},olBulk:`분류변경 ${n}건 — 학교급·상담분류·담당선생님 일괄 변경 · 변경 이력 기록 · 양측 알림`});},
 olBulkDel:()=>{const n=Object.keys(S.olMs).filter(k=>S.olMs[k]).length;if(!n)return toast('먼저 건을 선택하세요');set({olMs:{},olBulk:`삭제요청 ${n}건 — 사유 코드 일괄 지정 · 소프트 삭제(복원 가능) · 신청자 통지`});},
 olSel:a=>set({olSel:+a,olAct:null,olAi:null}),olList:()=>set({olSel:null,olAct:null}),olAi:()=>set({olAi:true}),olCat:()=>set({olAct:'cat'}),olCatPick:()=>{set({olAct:'catOk'});toast('담당선생님 변경 — 신·구 교사 양측 알림');},
 olAns:()=>{set({olAct:'ansOk'});toast('답변 저장 — 게시 통지(딥링크) 발송');},olDel:()=>{set({olAct:'delOk'});toast('삭제 처리 — 소프트 삭제 · 사유 통지');},olRest:()=>{set({olAct:'rest'});toast('복원했어요');},olSatRm:()=>{set({olSatRm:true});toast('만족도 리마인드 발송 (C-02)');},
 /* 화상 · 방문 */
 vcT:a=>set({vcT:a,vcSel:null,vcAct:null,vcPv:null,vcPdf:null}),vcSel:a=>set({vcSel:+a,vcAct:null,vcPv:null,vcPdf:null}),vcSelClose:()=>set({vcSel:null,vcAct:null,vcPv:null,vcPdf:null}),vcAct:a=>{if(a==='fix')S.fixed=Object.assign({},S.fixed,{['vc'+S.vcSel]:true});set({vcAct:a});toast(a==='fix'?'대체 일정 확정 — 양측 통지 · URL 유지':'문자 발송 — 센터 대표번호(C-02)');},vcPvTg:()=>set({vcPv:!S.vcPv}),vcPdf:()=>{set({vcPdf:true});toast('워터마크 PDF 발송 — 발송 로그 기록');},
 wvT:a=>set({wvT:a,wvSel:null,wvAct:null,wvPv:null,wvPdf:null}),wvSel:a=>set({wvSel:+a,wvAct:null,wvPv:null,wvPdf:null}),wvSelClose:()=>set({wvSel:null,wvAct:null,wvPv:null,wvPdf:null}),wvAct:a=>{if(a==='fix')S.fixed=Object.assign({},S.fixed,{['wv'+S.wvSel]:true});set({wvAct:a});toast(a==='fix'?'대체 일정 확정 — QR 입장권 재발송':'문자 발송 — 센터 대표번호(C-02)');},wvPvTg:()=>set({wvPv:!S.wvPv}),wvPdf:()=>{set({wvPdf:true});toast('워터마크 PDF 발송 — 발송 로그 기록');},
 /* 보고서 · 만족도 · 수당 */
 rpT:a=>set({rpT:a,rpSel:null,rpAct:null}),rpSel:a=>set({rpSel:+a,rpAct:null}),rpSelClose:()=>set({rpSel:null,rpAct:null}),rpAct:()=>{set({rpAct:true});toast('발송 완료 — 상담 전용 메일 + 알림톡 (C-02)');},rpX:a=>{setK('rpX',a,true);toast('처리했어요 · 승인 이력 기록');},
 stCh:a=>set({stCh:a}),stDir:()=>set({stDir:S.stDir==='asc'?'desc':'asc'}),stFu:a=>{setK('stFu',a,true);toast('후속 연락 (C-02) — 이력 기록');},stRm:a=>{setK('stRm',a,true);toast('리마인드 발송 (C-02)');},stBl:()=>{set({stBl:true});toast('채널 개선 백로그에 등록했어요');},
 pyT:a=>set({pyT:a,pyDl:null}),pySel:a=>{toggleK('pySel',a);S.pyDl=null;save();draw();},
 pyAll:()=>{const rows=D.PYD.filter(r=>S.pyT==='all'||r[2]===S.pyT),all=rows.every(r=>S.pySel[r[1]]);const o=Object.assign({},S.pySel);rows.forEach(r=>o[r[1]]=!all);set({pySel:o,pyDl:null});},
 pySelGo:()=>{const n=Object.keys(S.pySel).filter(k=>S.pySel[k]).length;if(!n)return toast('먼저 선생님을 선택하세요');set({pySel:{},pyDl:'s'+n});toast(`선택 ${n}명 조서 생성 — 결재 상신`);},
 pyDl:a=>{set({pyDl:a});toast(a==='x'?'엑셀 다운로드 — 계좌 마스킹':'기간 전체 조서 생성 — 결재 상신');},pyDet:a=>set({pyDet:a,pyDl:null}),pyDetClose:()=>set({pyDet:null}),
 /* 스케줄 */
 bkRm:a=>{setK('bkRm',a,true);toast(a+' T에게 마감 리마인드 발송 (C-02)');},bkRmAll:()=>{const o=Object.assign({},S.bkRm);let n=0;D.BKST.forEach(r=>{if((r[3]||0)+(r[4]||0)===0&&r[3]!==null&&!o[r[0]]){o[r[0]]=true;n++;}});if(!n)return toast('미등록 선생님이 없거나 이미 발송했어요');set({bkRm:o});toast(`미등록 ${n}명에게 마감 리마인드 발송 (C-02)`);},
 grid:a=>{const g=Object.assign({},S.grid||D.BKDEF);g[a]=((g[a]||0)+1)%3;set({grid:g});},
 /* 패널 */
 olxAssign:a=>{setK('olX',S.olSel,a.split(' — ')[0]);toast('수동 배정 — 배정 통지 · 맥락 카드 전달');},olxEsc:()=>{setK('olX',S.olSel,'esc');toast('에스컬레이션 — 지원단장 통지 · 대체 교사 제시');},olxReject:a=>{setK('olX',S.olSel,a);toast(`반려 — 사유 코드 [${a}] · 신청자 통지`);},copAppr:a=>{setK('copAppr',a,true);toast('위촉 승인 — 역할 승격 · 기간 등록');},copCoh:a=>set({copCoh:a}),aiUse:()=>{set({aiUse:true});toast('보고서 초안에 반영 — 교사 확정 전 미노출');},
 esTab:a=>set({esTab:a}),esClose:()=>set(isCounselor()?{ctEsOff:true}:{esOff:true}),esOpen:()=>set(isCounselor()?{ctEsOff:false}:{esOff:false}),
 /* 상담선생님 */
 ct3V:a=>set({ct3V:a}),ct3D:a=>set({ct3D:+a}),ctRqF:a=>set({ctRqF:a}),ctRqOk:a=>{setK('ctRq',a,'ok');toast('수락 — 내 일정 추가 · 양측 통지');},ctRqNo:a=>{setK('ctRq',a,'no');toast('거절 — 사유 기록 · 자동 재배정');},ctRqSel:a=>set({ctRqSel:S.ctRqSel===a?null:a}),
 ctAct:a=>{setK('ctAct',a,true);toast('기록했어요 (로그)');},ctSt:a=>{set({ctSt:a});toast(a==='휴면'?'휴면 신청 — 실무사 승인 대기':`오늘 상태 [${a}] — 실무사 목록과 실시간 연동`);},ctPf:a=>toggleK('ctPf',a),ctWd:a=>toggleK('ctWd',a),
 ctRpW:a=>set({ctRpW:a}),ctRpWClose:()=>set({ctRpW:null}),ctRpKpi:()=>{const id=S.ctRp.p1?(S.ctRp.p2?null:'p2'):'p1';if(!id)return toast('미확정 보고서가 없어요');set({ctRpW:id});},
 ctRpOk:a=>{setK('ctRp',a,true);S.ctRpW=null;save();draw();toast('보고서 확정 — 학생 열람본 게시 · 만족도 요청 · 수당 산정 반영');},
 ctObj:()=>{set({ctObj:true});toast('이의 제기 접수 — 정산 담당 검토 후 회신');},ctFaq:a=>set({ctFaq:a}),ctHp:a=>set({ctHp:a,ctHSel:null}),ctHc:a=>set({ctHc:a,ctHSel:null}),ctHSel:a=>set({ctHSel:S.ctHSel===+a?null:+a}),ct8P:a=>set({ct8P:a,ct8Xl:null}),ct8Xl:()=>{set({ct8Xl:true});toast('내 통계 엑셀 출력 — 출력 이력 기록');},
 shrItem:a=>{const s=clone(S.shr);s.items[a]=!s.items[a];set({shr:s});},shrTo:a=>{const s=clone(S.shr);s.to[a]=!s.to[a];set({shr:s});},
 shrGo:()=>{const s=clone(S.shr);const now='2026-09-09 15:'+String(20+s.log.length*3).padStart(2,'0');const to=Object.entries(s.to).filter(([k,v])=>v).map(([k])=>k).join('·')||'대상 없음';
  if(s.on){s.on=false;s.log.push({t:now,who:'정보원 상담교사 '+ctx.auth.name,what:'공유 중지',to});toast('공유를 중지했어요');}
  else{s.on=true;s.at=now;const items=[s.items.infoLog?'정보원 상담 이력':null,s.items.infoRpt?'정보원 상담 보고서':null].filter(Boolean).join(', ')||'항목 없음';s.log.push({t:now,who:'정보원 상담교사 '+ctx.auth.name,what:'공유 · '+items,to});toast('재학교 선생님과 공유했어요 · 감사로그 기록');}
  set({shr:s});}
};
document.addEventListener('click',e=>{const t=e.target.closest('[data-act],[data-click]');if(!t||!t.closest('#opsView,#cnsEs,#cnsRail'))return;const name=t.dataset.act||t.dataset.click;const fn=ACT[name];if(!fn)return;if(t.tagName==='A')e.preventDefault();fn(t.dataset.arg,t);});
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const t=e.target.closest('[role="button"][data-act]');if(t&&t.closest('#opsView,#cnsRail')){e.preventDefault();ACT[t.dataset.act](t.dataset.arg,t);}});
/* ─────────────── 렌더 · 메뉴 · 초기화 ─────────────── */
const VIEWS={home:vHome,mg:vMg,ol:vOl,vc:el=>vcwv(el,'vc'),wv:el=>vcwv(el,'wv'),rp:vRp,st:vSt,py:vPy,book:vBook,tdash:vTdash};
function draw(){const el=document.getElementById('opsView');if(!el||!cur||!VIEWS[cur])return;const y=window.scrollY;VIEWS[cur](el);renderEs();syncBadges();window.scrollTo(0,y);}
function badges(){const r=window.SEN_AUTH&&SEN_AUTH.roleObj;if(r&&r.k==='counselor')return {tdash:D.RQ.filter(x=>!S.ctRq[x[0]]).length+D.REP2.filter(p=>!S.ctRp[p[0]]).length};
 const rk=ch=>D.RK.filter(x=>x[6]===ch&&!S.cd3Q[x[0]]).length;return {vc:rk('vc')+D.VCR.filter(x=>x[11]==='일정변경'&&!S.fixed['vc'+x[0]]).length,wv:rk('wv')+D.WVR.filter(x=>x[12]==='일정변경'&&!S.fixed['wv'+x[0]]).length,ol:olxOpen().total,rp:2};}
function syncBadges(){const b=badges();document.querySelectorAll('.ops-side a').forEach(a=>{const k=a.getAttribute('href').slice(1);let n=a.querySelector('.n');if(b[k]){if(!n){n=document.createElement('span');n.className='n';a.appendChild(n);}n.textContent=b[k];}else if(n)n.remove();});}
const MENUS_OFFICE=[{k:'home',label:'실무사 대시보드',grp:'대시보드'},{k:'mg',label:'상담자관리',grp:'상담관리 콘솔'},{k:'ol',label:'온라인 게시판 상담'},{k:'vc',label:'온라인(화상) 상담'},{k:'wv',label:'방문상담'},{k:'rp',label:'상담 보고서 관리'},{k:'st',label:'상담 만족도 조사'},{k:'py',label:'수당관리 (조서)'},{k:'book',label:'슬롯 등록 현황 (확정 가능·예비)'}];
const MENUS_COUNSELOR=[{k:'tdash',label:'상담선생님 대시보드',grp:'내 상담'},{k:'book',label:'내 상담 스케줄 (확정 가능·예비)'}];
SEN_OPS.init({sys:'counsel',title:'상담시스템',desc:'진로진학 상담 운영 · 배정 · 보고서 · 수당 — 상담 원장 1개',extraRoles:['counselor'],
 menus:r=>(r&&r.k==='counselor')?MENUS_COUNSELOR:MENUS_OFFICE,badges,
 views:Object.fromEntries(Object.keys(VIEWS).map(k=>[k,(el,c)=>{cur=k;ctx=c;VIEWS[k](el);}])),
 after:(k)=>{cur=k;renderEs();syncBadges();}});
window.addEventListener('resize',()=>{clearTimeout(window.__cnsRz);window.__cnsRz=setTimeout(renderEs,150);});
})();
