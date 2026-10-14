/* 상담시스템 (정보원 실무사 업무시스템) · 기본 기기: PC
   화면 : 실무사 대시보드 5섹션(1-2) · 상담선생님 대시보드(1-1) · 정보원 콘솔 O-01~O-09 · 프로세스 정의(0)
   포털 연동 : 학생 신청(sen-counsel-v1.booking) → 접수 행으로 · 상담교사 배정 답변 상태(sen-assign-v1) → 배정 현황
   기능ID : CS-001~042 (기능명세 v1.0 [정보원] 상담시스템) */
(function(){
const D=window.CNS_DATA,O=window.SEN_OPS,esc=O.esc;
const badge=st=>({'접수':'badge--amber','확정':'badge--brand','진행':'badge--navy','결과 작성 중':'badge--amber','완료':'badge--ok','종결':'badge--gray','반려':'badge--warn','플랜B':'badge--warn','노쇼':'badge--warn'}[st]||'badge--gray');
const B=st=>`<span class="badge ${badge(st)}">${esc(st)}</span>`;
const SYN='<span class="badge badge--synth">합성</span>';
const ls=k=>{try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}};
/* 포털 연동 : 학생 신청 + 상담교사 배정 상태 */
function portalRows(){
  const rows=[];const bk=(ls('sen-counsel-v1')||{}).booking;
  if(bk){rows.push({id:'P-포털',kind:bk.type==='board'?'온라인':bk.type==='visit'?'방문':'화상',date:bk.date||'',time:bk.slot||'',stu:'김서울 (포털 신청)',topic:(bk.topics||[]).join('·')||'—',teacher:'자동 배정 대기',st:bk.proxy?'동의 대기':'접수',live:true});}
  const AS=ls('sen-assign-v1')||{};
  const ASG=[['a1','학생 A (고2)','온라인','통계학과 vs 컴퓨터공학과'],['a2','학생 B (고3)','화상','수시 지원 전략 · 수능 최저'],['a3','학생 C (고1)','온라인','진로 미정 · 검사 결과 해석'],['a4','학생 D (고2) · 학부모 대리','방문','학과 선택 · 과목 변경']];
  ASG.forEach(([id,stu,kind,topic])=>{const s=AS[id];rows.push({id,kind,date:'10.1'+(2+ASG.findIndex(x=>x[0]===id)),time:'',stu,topic,teacher:'박선영 (위촉)',st:s==='acc'?'진행':s==='done'?'완료':s==='rej'?'반려':'확정',live:true,note:s?'교사공간 「배정 답변」에서 바뀐 상태':'배정 요청 전달됨'});});
  return rows;
}
const kpiHome=()=>{const L=D.ledger;const tdy=L.filter(x=>x.date===D.iso(D.today));const q=D.queue.length;
  return O.kpi([{l:'오늘 상담',v:tdy.length+'건',s:'방문 '+tdy.filter(x=>x.kind==='방문').length+' · 화상 '+tdy.filter(x=>x.kind==='화상').length},{l:'온라인 48h 큐',v:L.filter(x=>x.kind==='온라인'&&['접수','확정','진행'].includes(x.st)).length+'건',s:'24h 경과 리마인드 3건'},{l:'예외 큐',v:q+'건',cls:q>4?'is-warn':'',s:'사람이 처리할 건만'},{l:'상담 가능 교사',v:D.teachers.filter(t=>t.status==='휴식중').length+'/100',s:'휴식중(공강) 기준'},{l:'이달 만족도 응답',v:D.survey.resp+'%',cls:'is-ok',s:'목표 60% 이상'},{l:'수당 조서',v:'10월 마감 D-17',s:'결재 대기 '+D.payout.filter(p=>p.st==='결재 대기').length+'건'}]);};
/* ── 1-2 실무사 대시보드 ── */
function home(el){
  const L=D.ledger,P=portalRows();
  const cal=(()=>{const first=new Date(2026,9,1),cells=[];for(let i=0;i<first.getDay();i++)cells.push('<div></div>');
    for(let day=1;day<=31;day++){const ds=`2026-10-${String(day).padStart(2,'0')}`;const ev=L.filter(x=>x.date===ds&&x.kind!=='온라인').slice(0,3);const on=L.filter(x=>x.date===ds&&x.kind==='온라인').length;
      cells.push(`<div class="d${day===14?' is-today':''}"><b>${day}${day===14?' 오늘':''}</b>${ev.map(e=>`<span class="ev ${e.kind==='방문'?'v':''}">${e.time} ${esc(e.kind)} ${esc(e.teacher)}</span>`).join('')}${on?`<span class="ev o">온라인 ${on}</span>`:''}</div>`);}
    return `<div class="cal" role="list">${cells.join('')}</div>`;})();
  const sec1=`<p class="hint">방문·화상은 슬롯 단위(P1 확정·P2 예비), 온라인은 건수. 색은 채널, 문자로도 구분. ${SYN} 2026년 10월</p>${cal}
   <h3>포털에서 들어온 신청·배정 (실시간)</h3>${O.table([{l:'건'},{l:'채널'},{l:'일시'},{l:'신청자'},{l:'주제'},{l:'배정'},{l:'상태'}],P.map(r=>[esc(r.id),esc(r.kind),esc(r.date+' '+r.time),esc(r.stu),esc(r.topic),esc(r.teacher),B(r.st)+(r.note?`<span class="sub">${esc(r.note)}</span>`:'')]))}
   <p class="hint">포털 상담 화면(counsel.html)에서 신청하거나 교사공간 「배정 답변」에서 수락·답변하면 이 표가 바뀝니다.</p>`;
  const stC={};D.teachers.forEach(t=>stC[t.status]=(stC[t.status]||0)+1);
  const sec2=`<div class="grid2"><div><h3>2-1 상담자 관리 · 오늘 상태 5종</h3>${O.kpi(['상담중','수업중','휴식중','휴가중','휴면중'].map(s=>({l:s+(s==='휴식중'?' (공강·대체 가능)':''),v:(stC[s]||0)+'명'})))}
    ${O.table([{l:'ID'},{l:'이름'},{l:'지원단'},{l:'계열'},{l:'오늘 상태'},{l:'P1/P2 슬롯'},{l:'10월 실적'},{l:''}],D.teachers.slice(0,12).map(t=>[esc(t.id),esc(t.name)+`<span class="sub">${esc(t.school)}</span>`,t.grp==='JINRO'?'진로상담교사단':'대학진학지도지원단',esc(t.field),B(t.status),`${t.p1}/${t.p2}`,`방문·화상 ${t.done} · 온라인 ${t.online}`,`<button class="btn btn--line btn--sm" data-toast="${esc(t.name)} 선생님에게 센터 대표번호(02-3111-362)로 발신 · 개인번호 마스킹">문자</button>`]))}
    <p class="hint">100명 중 12명 표시 · 전체는 O-01 위촉 명부</p></div>
    <div><h3>2-2 결원 보충</h3><ul class="list">${[['10.15 19:00 화상 · 공학 계열','배정 교사 당일 취소 → 플랜B 옵션 0건','예외 큐 Q1'],['10.17 14:00 방문 · 의약 계열','P1 슬롯 소진 · P2 2명 요청 가능','P2 확인 요청 발송'],['온라인 · 사회 계열','답변 중 3명 포화 · 미배정 2h 초과','부하 균등 재배정']].map(x=>`<li class="row"><div class="row__main"><b>${esc(x[0])}</b><span>${esc(x[1])}</span></div><div class="row__acts"><button class="btn btn--line btn--sm" data-toast="${esc(x[2])} 처리 화면으로 이동(목업)">${esc(x[2])}</button></div></li>`).join('')}</ul>
    <h3>단체 문자 (C-02)</h3><p class="hint">발신은 센터 대표번호·마스킹 채널만 (K12). 휴식중 교사에게 "오늘 15시 대체 상담 가능하신 분" 같은 결원 공지.</p><button class="btn btn--line" data-toast="휴식중 교사 ${stC['휴식중']||0}명에게 결원 공지를 보냈어요 (알림톡 → 문자 폴백)">휴식중 교사에게 결원 공지</button></div></div>`;
  const wk=L.filter(x=>x.date>=D.iso(D.d(-3))&&x.date<=D.iso(D.d(3)));
  const sec3=O.subtabs([
    {k:'board',l:'3-1 게시판',html:`<p class="hint">온라인 상담 매뉴얼 11.2 분류 · AI 예상답변은 교사 답변 초안으로만 · 일괄 분류변경·삭제는 재배정 이력으로 남음</p>${O.table([{l:'건'},{l:'접수'},{l:'분류'},{l:'학생'},{l:'배정 교사'},{l:'SLA'},{l:'상태'}],wk.filter(x=>x.kind==='온라인').slice(0,10).map(x=>[esc(x.id),esc(x.date),esc(x.topic),esc(x.stu+' · '+x.grade),esc(x.teacher),x.st==='접수'?'<span class="badge badge--warn">24h 경과</span>':'<span class="badge badge--ok">48h 이내</span>',B(x.st)]))}`},
    {k:'video',l:'3-2 화상',html:`<p class="hint">상태 3종(진행중·완료·일정변경) · 링크는 30분 전 자동 발송(v-meeting URL 유지) · 제3자 사전고지 · 녹취 동의 · 완료 체크리스트 8 · 워터마크 PDF</p>${O.table([{l:'건'},{l:'일시'},{l:'학생'},{l:'교사'},{l:'녹취 동의'},{l:'상태'}],wk.filter(x=>x.kind==='화상').slice(0,8).map(x=>[esc(x.id),esc(x.date+' '+x.time+' · '+x.dur),esc(x.stu+' · '+x.grade),esc(x.teacher),x.consent.rec?'<span class="badge badge--ok">학생·학부모 각각</span>':'<span class="badge badge--gray">미동의 · 메모 초안</span>',B(x.st)]))}`},
    {k:'visit',l:'3-3 방문',html:`<p class="hint">센터 방문만(특별상담은 부스) · QR 체크인 · 노쇼는 미출석 10분 → 플랜B 트리거</p>${O.table([{l:'건'},{l:'일시'},{l:'학생'},{l:'교사'},{l:'체크인'},{l:'상태'}],wk.filter(x=>x.kind==='방문').slice(0,8).map(x=>[esc(x.id),esc(x.date+' '+x.time+' · '+x.dur),esc(x.stu+' · '+x.grade),esc(x.teacher),['진행','완료','종결'].includes(x.st)?'<span class="badge badge--ok">QR 완료</span>':'<span class="badge badge--gray">대기</span>',B(x.st)]))}`},
    {k:'risk',l:'3-4 리스크',html:`<ul class="list">${[['플랜B 발동 · 10.15 19:00 화상','옵션 A 대체 교사 없음 → 옵션 B 다음 슬롯 2개 제안 중 · 무응답 시 자동 취소(열린 결정)','사과 문자 발송'],['노쇼 · 10.12 방문 박○○','3개월 신청 제한 자동 적용 · 해제 요청 Q4','패널티 이력'],['시즌 트래픽','특별진학상담 3차(11월) 대기열 K17 · 정원 사전 설정 필요','시즌 프리셋 열기']].map(x=>`<li class="row"><div class="row__main"><b>${esc(x[0])}</b><span>${esc(x[1])}</span></div><div class="row__acts"><button class="btn btn--line btn--sm" data-toast="${esc(x[2])} (목업)">${esc(x[2])}</button></div></li>`).join('')}</ul>`}]);
  const sec4=O.subtabs([
    {k:'rep',l:'4-1 보고서',html:`${O.kpi([{l:'AI 초안 승인',v:L.filter(x=>x.report==='AI 초안 승인').length+'건',s:'교사 확정 뒤 학생 열람본'},{l:'직접 작성',v:L.filter(x=>x.report==='직접 작성').length+'건'},{l:'작성 중',v:L.filter(x=>x.st==='결과 작성 중').length+'건',cls:'is-warn',s:'유일한 수기 구간'}])}<p class="hint">결과보고서는 교사가 쓰는 유일한 수기 구간. AI 초안(STT 요약·메모 기반)은 교사 승인 전 저장·게시 불가. 학생 화면에는 [AI 의견] 라벨 없음.</p>`},
    {k:'sat',l:'4-2 만족도',html:`${O.kpi([{l:'응답률',v:D.survey.resp+'%',cls:'is-ok',s:'목표 60% · 현행 11%'},{l:'응답 수',v:D.survey.n+'건'},...D.survey.items.map(i=>({l:i[0],v:i[1]+'/5'}))])}<p class="hint">종결 즉시 3문항 30초 · 미응답 48h 뒤 리마인드 1회 · 교사에게는 익명 집계만. 상세는 O-03.</p>`},
    {k:'pay',l:'4-3 수당',html:`<p class="hint">단가 : 화상 ${D.rate.화상.toLocaleString()} · 방문 ${D.rate.방문.toLocaleString()} · 온라인 ${D.rate.온라인.toLocaleString()} · 전화 0 (더미 단가표 v3) · 온라인은 답변 교사만, 방문·화상은 보고서 확정 시</p><div class="row__acts" style="margin-bottom:10px"><button class="btn btn--primary btn--sm" data-toast="10월 조서 100명분을 생성했어요 · 결재 상신 전 검토">조서 전체 생성</button><button class="btn btn--line btn--sm" data-toast="선택한 교사만 조서 생성(목업)">선택 생성</button></div><p class="hint">상세·에듀파인 파일은 O-06.</p>`}]);
  const sec5=`<p class="hint">원장 1개에서 재계산 · 분류 유형×계열 2축 · 소집단 "<5" 억제 · 년/분기/월 중복 선택 · 엑셀 내보내기(수신자 워터마크)</p>${O.table([{l:'구분'},{l:'온라인',num:true},{l:'방문',num:true},{l:'화상',num:true},{l:'합계',num:true}],[['2026.10 (진행 중)',L.filter(x=>x.kind==='온라인').length,L.filter(x=>x.kind==='방문').length,L.filter(x=>x.kind==='화상').length,L.length],['2026.9',412,96,104,612],['2026 2분기',1,0,0,'<5'],['2026 누적',2988,610,655,4253]])}<div class="row__acts" style="margin-top:10px"><button class="btn btn--line btn--sm" data-toast="엑셀로 내보냈어요 · 수신자 한지원 워터마크">엑셀</button></div><p class="hint">상세는 O-04 운영실적.</p>`;
  el.innerHTML=`<p class="ops-note"><b>운영 모드</b> 상시 <span class="badge badge--gray">집중상담기간 아님</span> <span class="badge badge--gray">특별진학상담 3차 11월 예정</span> · <b>실무사 역할</b> 예외만 처리 (반려·재배정·병합·페널티 해제·시즌 설정) · 대리 답변 불가</p>${kpiHome()}
  ${O.subtabs([{k:'s1',l:'① 상담일정표',html:sec1},{k:'s2',l:'② 상담선생님 관리',html:sec2},{k:'s3',l:'③ 주간 현황',html:sec3},{k:'s4',l:'④ 상담관리',html:sec4},{k:'s5',l:'⑤ 통계관리',html:sec5}])}`;
}
/* ── 1-1 상담선생님 대시보드 (포털 교사공간 「배정 답변」과 같은 데이터) ── */
function teacher(el){
  const AS=ls('sen-assign-v1')||{};const cnt={};D.ledger.forEach(x=>cnt[x.tid]=(cnt[x.tid]||0)+1);const t=D.teachers.slice().sort((a,b)=>(cnt[b.id]||0)-(cnt[a.id]||0))[0];
  const mine=D.ledger.filter(x=>x.tid===t.id).slice(0,6);
  const asg=[['a1','학생 A (고2 · 서울한빛고)','온라인','통계학과 vs 컴퓨터공학과 · 과목 선택','10.12 접수 · 기한 10.15'],['a2','학생 B (고3 · 서울남고)','화상 40분','수시 지원 전략 · 수능 최저','10.14 19:00 · 보호자 동반'],['a3','학생 C (고1 · 서울고)','온라인','진로 미정 · 검사 결과 해석','10.13 접수 · 기한 10.16'],['a4','학생 D (고2) · 학부모 대리','방문 50분','학과 선택 · 과목 변경','10.15 14:00 · 자녀 동의 대기']];
  el.innerHTML=`<p class="ops-note"><b>미리보기</b> 위촉 상담교사가 보는 화면(T-01~T-08)을 실무사 관점에서 확인합니다. 포털 교사공간의 「배정 답변」(teacher.html#assign)과 같은 원장·같은 상태를 씁니다 · 기준 교사 <b>박선영</b> (대학진학지도지원단 · 위촉 2026.4.1~2027.3.31)</p>
  ${O.kpi([{l:'배정 요청함',v:asg.filter(a=>!AS[a[0]]).length+'건',cls:'is-warn',s:'수락 시 2단계 인증'},{l:'답변 중',v:asg.filter(a=>AS[a[0]]==='acc').length+'건'},{l:'이번 달 실적',v:'방문·화상 9 · 온라인 17',s:'수당 예정 '+(9*45000+17*15000).toLocaleString()+'원'},{l:'내 만족도',v:'4.5/5',s:'익명 집계만'}])}
  <div class="grid2"><div class="card"><h2>배정 요청함 <small>T-02 · 수락·거절 · 사전정보 확인</small></h2>${O.table([{l:'학생'},{l:'채널'},{l:'주제'},{l:'일정'},{l:'상태'}],asg.map(a=>[esc(a[1]),esc(a[2]),esc(a[3]),esc(a[4]),AS[a[0]]==='acc'?B('진행'):AS[a[0]]==='done'?B('완료'):AS[a[0]]==='rej'?B('반려'):'<span class="badge badge--amber">수락 대기</span>']))}<p class="hint">수락·답변은 교사공간에서 합니다 → <a href="teacher.html#assign" class="badge badge--brand">교사공간 배정 답변 열기</a></p></div>
  <div class="card"><h2>내 일정 <small>T-02 스케줄 · P1 확정 / P2 예비</small></h2>${O.table([{l:'일시'},{l:'채널'},{l:'학생'},{l:'주제'},{l:'상태'}],mine.map(x=>[esc(x.date.slice(5).replace('-','.')+' '+x.time),esc(x.kind),esc(x.stu+' · '+x.grade),esc(x.topic),B(x.st)]))}<p class="hint">본인 일정만 수정 · 슬롯 30/60분 · P1이 없을 때만 P2가 "요청 가능"으로 노출</p></div></div>
  <div class="grid2"><div class="card"><h2>브리핑 · 맥락 카드 <small>T-04</small></h2><p>오늘 19:00 화상 · 학생 B(고3) · 공유 항목 : 관심 전형 4 · 입력 성적(등급대) · 지원계획 카드 · 보호자 동반. <span class="badge badge--gray">AI 초안</span> 사전 질문 요약은 교사 확인 전 참고용.</p><p class="hint">학생부는 S존 열람만 · 다운로드·이메일 전달 금지 · 열람은 배정 확정~종료 후 N일</p></div>
  <div class="card"><h2>결과보고서 · 실적 <small>T-05 · T-06 · T-07</small></h2><p>작성 대기 2건 (화상 10.9 · 방문 10.11). 녹취 동의 건은 STT 요약 초안을 승인 뒤 학생 열람본으로.</p><div class="row__acts"><button class="btn btn--line btn--sm" data-toast="보고서 작성 폼은 교사공간에서 (목업)">보고서 작성</button><button class="btn btn--line btn--sm" data-toast="10월 실적 · 수당 예정액 (단가표 v3) 확인">실적·수당</button></div></div></div>`;
}
/* ── O-01 위촉 명부 ── */
function appoint(el){
  const T=D.teachers;const jr=T.filter(t=>t.grp==='JINRO').length;
  el.innerHTML=`${O.kpi([{l:'위촉 교사',v:T.length+'명',s:'진로상담교사단 '+jr+' · 대학진학지도지원단 '+(T.length-jr)},{l:'위촉 기간',v:'2026.4.1~2027.3.31',s:'만료 시 상담 역할만 자동 회수'},{l:'승인 대기',v:'3명',cls:'is-warn',s:'2027 모집 사전 신청'},{l:'휴면',v:T.filter(t=>t.status==='휴면중').length+'명',s:'기간 신청 → 승인'}])}
  <div class="card"><h2>위촉 주기 <small>K16</small></h2><div class="row__acts">${['3월 공문 모집','선발 (경쟁률 약 2:1)','4.1 위촉 · 역할 추가','익년 3.31 만료 · 자동 회수','연 단위 재승인'].map((s,i)=>`<span class="chip">${i+1}. ${s}</span>`).join('')}</div><p class="hint">한 풀이 온라인·방문·화상을 모두 담당. 지원단 배분(38/62)은 더미값, 실제 배분은 확인 필요(열린 결정).</p></div>
  <div class="card"><h2>명부 <small>${SYN} 100명 중 30명 표시</small></h2>${O.table([{l:'ID'},{l:'이름 · 소속'},{l:'지원단'},{l:'계열'},{l:'채널'},{l:'위촉'},{l:'10월 실적'},{l:'만족도'},{l:''}],T.slice(0,30).map(t=>[esc(t.id),esc(t.name)+`<span class="sub">${esc(t.school)}</span>`,t.grp==='JINRO'?'진로상담교사단':'대학진학지도지원단',esc(t.field),t.ch.join('·'),'<span class="badge badge--ok">유효</span><span class="sub">'+t.term+'</span>',`${t.done+t.online}건`,t.sat,`<button class="btn btn--line btn--sm" data-toast="${esc(t.name)} 위촉 상세 · 계좌는 정산 Role만">상세</button>`]))}</div>`;
}
function queue(el){
  el.innerHTML=`<p class="ops-note"><b>예외 큐</b> D-1 18시 이전 건은 플랜B가 완전 자동 · 당일 건과 옵션 0건, 한도·페널티 예외, 병합 후보만 여기로 옵니다. 처리마다 사유를 기록합니다.</p>
  ${O.kpi([{l:'대기',v:D.queue.length+'건',cls:'is-warn'},{l:'오늘 처리',v:'7건'},{l:'평균 처리',v:'38분'},{l:'자동 처리율',v:'91%',cls:'is-ok',s:'플랜B 자동 해결 비율'}])}
  <ul class="list">${D.queue.map(q=>`<li class="row"><div class="row__main"><b>${esc(q.type)} <span class="badge badge--gray">${esc(q.age)} 대기</span></b><span>${esc(q.who)}</span><span class="sub" style="display:block;color:var(--ink-3);font-size:12.5px">${esc(q.why)}</span></div><div class="row__acts">${q.act.map(a=>`<button class="btn btn--line btn--sm" data-toast="${esc(q.id)} · ${esc(a)} 처리 · 사유 기록 (목업)">${esc(a)}</button>`).join('')}</div></li>`).join('')}</ul>`;
}
function survey(el){const S=D.survey;
  el.innerHTML=`${O.kpi([{l:'응답률',v:S.resp+'%',cls:'is-ok',s:'목표 '+S.target+'% · 현행(As-Is) 11%'},{l:'응답',v:S.n+'건',s:'10월 종결 건 기준'},...S.items.map(i=>({l:i[0],v:i[1]+'/5'}))])}
  <div class="grid2"><div class="card"><h2>채널별</h2>${O.table([{l:'채널'},{l:'평균',num:true},{l:'응답',num:true}],S.byCh.map(r=>[r[0],r[1],r[2]]))}<p class="hint">교사×채널 매트릭스는 익명 집계. 교사 개인에게는 본인 집계만.</p></div>
  <div class="card"><h2>자유의견 사유 태그 <small>AI 분류 · 교사 검수 전 참고</small></h2>${S.tags.map(t=>`<div style="margin:6px 0"><div style="display:flex;justify-content:space-between;font-size:13px"><span>${esc(t[0])}</span><b>${t[1]}</b></div><div class="bar${t[1]<40?' is-warn':''}"><i style="width:${t[1]/1.3}%"></i></div></div>`).join('')}</div></div>
  <div class="card"><h2>낮은 응답 추적</h2><ul class="list">${S.low.map(l=>`<li class="row"><div class="row__main"><b>${esc(l.t)}</b><span>${esc(l.who)}</span></div><div class="row__acts"><button class="btn btn--line btn--sm" data-toast="해당 건 원장으로 이동(목업)">원장 보기</button></div></li>`).join('')}</ul></div>`;
}
function stats(el){const L=D.ledger;const by=k=>FIELDS.map(f=>L.filter(x=>x.kind===k&&D.teachers.find(t=>t.id===x.tid).field===f).length);const FIELDS=['인문','사회','자연','공학','의약','예체능','교육'];
  const cell=n=>n<5&&n>0?'<span class="badge badge--gray">&lt;5</span>':n;
  el.innerHTML=`<p class="ops-note">${SYN} 원장 1개에서 재계산 · 2축(유형×계열) · 소집단 "&lt;5" 억제 · 산출 시점 ${D.iso(D.today)} 09:00</p>
  ${O.kpi([{l:'10월 접수',v:L.length+'건'},{l:'종결',v:L.filter(x=>x.st==='종결').length+'건'},{l:'온라인 48h 준수',v:'96%',cls:'is-ok'},{l:'플랜B 발동',v:'11건',s:'자동 해결 10'},{l:'노쇼',v:'4건',s:'페널티 적용 4'},{l:'학부모 신청 비율',v:Math.round(L.filter(x=>x.applicant==='학부모').length/L.length*100)+'%'}])}
  <div class="card"><h2>유형 × 계열</h2>${O.table([{l:'채널'},...FIELDS.map(f=>({l:f,num:true}))],['온라인','방문','화상'].map(k=>[k,...by(k).map(cell)]))}<div class="row__acts" style="margin-top:10px"><button class="btn btn--line btn--sm" data-toast="년/분기/월 중복 선택 · 엑셀 내보내기 (수신자 워터마크)">기간 선택·엑셀</button></div></div>`;
}
function migrate(el){const M=D.migrate;
  el.innerHTML=`${O.kpi([{l:'이관 대상',v:M.total.toLocaleString()+'건',s:'2020년 이후'},{l:'정합 A',v:'71%',cls:'is-ok',s:'그대로 통계 포함'},{l:'정합 B',v:'22%',s:'필드 보정 후 포함'},{l:'정합 C',v:'7%',cls:'is-warn',s:'통계 제외 (열린 결정)'}])}
  <div class="card"><h2>원천별 <small>현행 eGovFrame 3.8 · WizBuilder · 게시판·TBL_COUNSEL_*</small></h2>${O.table([{l:'원천'},{l:'건수',num:true},{l:'기간'},{l:'정합 등급'}],M.rows.map(r=>[r[0],r[1].toLocaleString(),r[2],r[3]]))}<p class="hint">현행 상태(진행중·완료·분류변경·삭제요청·미등록·신청중)는 원장 7단으로 매핑. 계좌 평문 VARCHAR는 이관 시 암호화. 이관 범위(전체 vs 최근 3년)는 열린 결정.</p></div>`;
}
function payout(el,ctx){const P=D.payout;const tot=P.reduce((a,b)=>a+b.amt,0);const isPay=ctx.role.opsRole==='정산'||ctx.role.opsRole==='시스템';
  el.innerHTML=`${O.kpi([{l:'10월 조서 합계',v:(tot/1e6).toFixed(1)+'백만원',s:'100명 · 단가표 v3'},{l:'결재 대기',v:P.filter(p=>p.st==='결재 대기').length+'건',cls:'is-warn'},{l:'결재 완료',v:P.filter(p=>p.st==='결재 완료').length+'건'},{l:'마감',v:'10.31',s:'→ 조서 → 결재 → 에듀파인 파일'}])}
  <p class="ops-note"><b>단가</b> 온라인 ${D.rate.온라인.toLocaleString()} · 방문 ${D.rate.방문.toLocaleString()} · 화상 ${D.rate.화상.toLocaleString()} · 전화 0 · 온라인은 답변 교사만, 방문·화상은 보고서 확정 시 · 단가표는 지원단×유형×채널×시점으로 버전 관리</p>
  <div class="card"><h2>조서 <small>${SYN} 100명 중 20명 표시</small></h2>${O.table([{l:'ID'},{l:'이름'},{l:'지원단'},{l:'온라인',num:true},{l:'방문',num:true},{l:'화상',num:true},{l:'금액',num:true},{l:'상태'}],P.slice(0,20).map(p=>[esc(p.id),esc(p.name),p.grp==='JINRO'?'진로':'진학',p.online,p.visit,p.video,p.amt.toLocaleString()+'원',B(p.st==='결재 완료'?'완료':p.st==='결재 대기'?'접수':'확정').replace(/>[^<]+</,'>'+p.st+'<')]))}
  <div class="row__acts" style="margin-top:10px"><button class="btn btn--primary btn--sm" data-toast="결재 상신 · 전자서명(GPKI) 필요 (목업)">결재 상신</button><button class="btn btn--line btn--sm" data-toast="에듀파인 업로드 파일을 만들었어요 · 자동 업로드 인터페이스는 미확인">에듀파인 파일</button></div>
  <p class="hint">${isPay?'계좌 정보는 O-09 정산 개인정보에서(사유 기록).':'계좌 정보는 정산 Role만 볼 수 있습니다. 현재 Role : '+esc(ctx.role.opsRole)}</p></div>`;
}
function consent(el){
  el.innerHTML=`<p class="ops-note"><b>동의 3종</b> 정보 열람 · 녹취 · 결과 공유 (학생·학부모 각각, 14세 미만은 법정대리인) · <b>파기</b> 녹취 원본 N일 · 학생부 자료 종료 후 N일 · 통장사본 위촉 만료 후 N년 · 특별상담 시즌 60일 (N은 열린 결정)</p>
  ${O.kpi([{l:'녹취 동의율',v:'68%',s:'화상·방문 건 기준'},{l:'결과 공유 동의',v:'85%'},{l:'삭제권 행사',v:'3건',s:'이달'},{l:'자동 파기',v:'41건',s:'이달 · 로그 보존 5년'}])}
  <div class="card"><h2>동의·파기 로그</h2>${O.table([{l:'일시'},{l:'유형'},{l:'대상'},{l:'처리'}],D.consent.map(r=>r.map(esc)))}</div>`;
}
function heat(el){const T=D.teachers;const F=['인문','사회','자연','공학','의약','예체능','교육'];
  const g=F.map(f=>['JINRO','JINHAK'].map(gr=>T.filter(t=>t.field===f&&t.grp===gr).length));
  const need={인문:9,사회:14,자연:12,공학:16,의약:7,예체능:5,교육:4};
  el.innerHTML=`<p class="ops-note">계열 × 지원단별 가용 교사와 수요(10월 접수 기준). 부족 칸은 문자와 색으로 표시 · 특별상담 Pool 중복 여부는 열린 결정</p>
  <div class="card">${O.table([{l:'계열'},{l:'진로상담교사단',num:true},{l:'대학진학지도지원단',num:true},{l:'합계',num:true},{l:'수요(건)',num:true},{l:'판정'}],F.map((f,i)=>{const s=g[i][0]+g[i][1];const d=need[f];return[f,g[i][0],g[i][1],s,d,d>s*1.2?'<span class="badge badge--warn">부족</span>':d>s*.8?'<span class="badge badge--amber">빠듯</span>':'<span class="badge badge--ok">여유</span>'];}))}</div>`;
}
function bank(el,ctx){const ok=ctx.role.opsRole==='정산'||ctx.role.opsRole==='시스템';
  if(!ok){el.innerHTML=`<div class="card"><h2>정산 개인정보 · 정산 Role 전용</h2><p>계좌·통장사본은 정산 담당 Role만 열람합니다. 현재 Role은 <b>${esc(ctx.role.opsRole)}</b>입니다. 열람이 필요하면 통합관리자에게 Role 부여를 요청하세요.</p></div>`;return;}
  el.innerHTML=`<p class="ops-note"><b>열람 사유 필수</b> 모든 계좌 열람은 사유 코드와 함께 감사로그에 남습니다 · 계좌는 컬럼 암호화 · 끝 4자리만 표시 · 교사가 T-01에서 직접 등록</p>
  <div class="card"><label class="sl" style="max-width:420px">열람 사유<select><option>수당 정산 검증</option><option>계좌 오류 문의 응대</option><option>에듀파인 반려 건 확인</option></select></label>
  <div style="margin-top:12px">${O.table([{l:'ID'},{l:'이름'},{l:'은행'},{l:'계좌(마스킹)'},{l:'통장사본'},{l:'등록'}],D.teachers.slice(0,8).map((t,i)=>[esc(t.id),esc(t.name),['국민','신한','우리','하나','농협'][i%5],'●●●●-●●-'+String(1000+i*137).slice(-4),'<span class="badge badge--ok">등록</span>','2026.4.'+(2+i)]))}</div><p class="hint">열람 8건 기록됨 · 통장사본은 위촉 만료 후 N년 파기</p></div>`;
}
function process(el){
  el.innerHTML=`<div class="grid2"><div class="card"><h2>As-Is 8단계 (수작업 6) → To-Be 5단계 (수기 1)</h2>${O.table([{l:'To-Be'},{l:'내용'},{l:'사람 개입'}],[['① 신청','유형 선택 · 자격 게이트(진로검사 완료 / 학생부·성적 연결) · 채널 · 슬롯 직접 선택 · 즉시 확정','없음'],['② 배정·통지','자동 배정(지정 > 계열 > 부하 균등) · 맥락 카드 · D-1 리마인드 · 플랜B','예외만'],['③ 상담','방문 QR 체크인 / v-meeting URL / 게시판 답변(48h)','교사'],['④ 결과','교사 결과보고서(유일 수기) · 만족도 3문항','교사'],['⑤ 집계','이력 · 통계 · 수당 자동','없음']])}</div>
  <div class="card"><h2>운영 모드 3단 · 핵심 규칙</h2><ul class="list">${[['상시','학기당 1회(학부모 합산) · D-1 18시 셀프 변경 · 노쇼 3개월 제한'],['집중상담기간','슬롯 월별 마감(K5) · 대기열 · 교사 레이트리밋'],['특별진학상담','연 3회 부스 대면 · 고3·졸업생·학부모 · 원패스 지역 게이트 · 시즌 종료 후 파기 · 대기열 K17']].map(x=>`<li class="row"><div class="row__main"><b>${esc(x[0])}</b><span>${esc(x[1])}</span></div></li>`).join('')}</ul><p class="hint">AI 접점(RAG 1차 응대 · 상담요약 · 분류 태깅 · 만족도 분류)은 분리 발주 · 교사 HITL 100% · '27 1단계 파일럿 범위(상담요약·RAG)만.</p></div></div>
  <div class="card"><h2>포털과의 연동</h2>${O.table([{l:'포털 화면'},{l:'업무시스템'},{l:'연결'}],[['상담 신청 (counsel.html)','① 신청 → 원장 접수','학생 신청이 실무사 일정표에 실시간 표시'],['교사공간 배정 답변 (teacher.html)','② 배정 · ③ 답변','수락·답변 상태가 원장 상태로'],['학부모 자녀 연결 (parent.html)','동의 3종 · 대리 신청','자녀 동의 전 확정 보류'],['MY 상담 이력 (my.html)','⑤ 집계','확정본만 학생 열람 · AI 표시 없음']])}</div>`;
}
O.init({sys:'counsel',title:'상담시스템',desc:'정보원 상담실무사가 운영하는 업무시스템. 예외 처리 · 위촉 · 만족도 · 수당 · 통계.',
  menus:[{k:'home',label:'실무사 대시보드',code:'1-2'},{k:'teacher',label:'상담선생님 대시보드',code:'1-1'},{k:'process',label:'프로세스 정의',code:'0'},
    {grp:'정보원 콘솔',k:'appoint',label:'위촉 명부·승인',code:'O-01'},{k:'queue',label:'예외 큐',code:'O-02'},{k:'survey',label:'만족도',code:'O-03'},{k:'stats',label:'운영실적·통계',code:'O-04'},{k:'migrate',label:'과거 이관',code:'O-05'},{k:'payout',label:'수당·조서',code:'O-06'},{k:'consent',label:'동의·파기 로그',code:'O-07'},{k:'heat',label:'풀 히트맵',code:'O-08'},{k:'bank',label:'정산 개인정보',code:'O-09'}],
  badges:()=>({queue:D.queue.length}),
  views:{home,teacher,process,appoint,queue,survey,stats,migrate,payout,consent,heat,bank}});
})();
