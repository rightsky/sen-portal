/* 상담시스템 합성 데이터 (가상 인물·가상 학교, 결정적 생성) · 원천 배지 [합성]
   근거 : 상담시스템 고도화 업무정의서 v0.1 · counseling_ops 8편 · ISP v1.11 T1-3
   규모 : 위촉 상담교사 100명(진로상담교사단 38 · 대학진학지도지원단 62) · 2026-10 원장 ~140건 · 운영 모드 상시 */
window.CNS_DATA=(function(){
const rnd=(seed=>()=>{seed=(seed*9301+49297)%233280;return seed/233280;})(20261014);
const pick=a=>a[Math.floor(rnd()*a.length)];
const SUR=['김','이','박','최','정','강','조','윤','장','임','한','오','서','신','권','황','안','송','류','홍'];
const NAM=['지원','민서','서준','하은','도윤','예린','시우','수아','준우','채원','지호','유진','현우','나은','태윤','서윤','민재','다은','은우','소율','준서','가은','선우','윤아','지안'];
const SCH=['서울고','서울남고','서울한빛고','서울미래고','성북고','강서고','노원고','마포고','송파고','동작고','강동고','양천고','관악고','은평고','구로고','영등포고','광진고','성동고','중랑고','도봉고'];
const FIELD=['인문','사회','자연','공학','의약','예체능','교육'];
const today=new Date(2026,9,14);
const d=(n)=>{const x=new Date(today);x.setDate(x.getDate()+n);return x;};
const ymd=x=>`${x.getMonth()+1}.${x.getDate()}`;
const iso=x=>`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
/* 위촉 상담교사 100명 */
const teachers=[];const used=new Set();
for(let i=0;i<100;i++){let n;do{n=pick(SUR)+pick(NAM);}while(used.has(n));used.add(n);
  const grp=i<38?'JINRO':'JINHAK';
  const status=pick(['상담중','수업중','휴식중','휴식중','휴식중','휴가중','휴면중']);
  teachers.push({id:'T'+String(i+1).padStart(3,'0'),name:n,school:pick(SCH),grp,field:pick(FIELD),ch:['온라인','방문','화상'],
    status:i<6?['상담중','수업중','휴식중','휴가중','휴면중','상담중'][i]:status,term:'2026.4.1~2027.3.31',
    done:Math.floor(rnd()*28),online:Math.floor(rnd()*40),sat:(3.8+rnd()*1.2).toFixed(1),noshow:rnd()<.12?1:0,p1:Math.floor(rnd()*6)+2,p2:Math.floor(rnd()*4)});}
/* 상담 원장 (10월) */
const TOPIC=['수시 지원 전략','정시 환산점 해석','과목 선택·학업설계','진로검사 결과 해석','학생부 보완 방향','면접 준비','최저 충족 가능성','전형 비교','학과 선택','고교 유형 선택'];
const KIND=['온라인','온라인','온라인','방문','화상','화상'];
const ST=['접수','확정','확정','진행','결과 작성 중','완료','종결','종결','종결'];
const ledger=[];
for(let i=0;i<140;i++){const kind=pick(KIND);const dd=d(Math.floor(rnd()*30)-20);const t=pick(teachers);
  let st=pick(ST);if(dd>today&&['완료','종결','결과 작성 중','진행'].includes(st))st='확정';if(dd<d(-3)&&['접수','확정'].includes(st))st='종결';
  const stu=pick(SUR)+'○○';const grade=pick(['고1','고2','고3','고3','졸업생']);
  ledger.push({id:'C'+String(260001+i),mode:'상시',kind,date:iso(dd),time:kind==='온라인'?'':pick(['14:00','15:00','16:00','17:00','19:00']),dur:kind==='온라인'?'':kind==='방문'?'50분':'40분',
    stu,grade,school:pick(SCH),applicant:rnd()<.25?'학부모':'학생',topic:pick(TOPIC),teacher:t.name,tid:t.id,grp:t.grp,st,
    consent:{view:true,rec:kind!=='온라인'&&rnd()<.7,share:rnd()<.85},report:['완료','종결'].includes(st)?(rnd()<.6?'AI 초안 승인':'직접 작성'):'',
    sat:st==='종결'&&rnd()<.63?Math.floor(3+rnd()*3):null,src:'합성'});}
ledger.sort((a,b)=>a.date<b.date?1:-1);
/* 예외 큐 O-02 */
const queue=[
 {id:'Q1',type:'플랜B 옵션 0건',who:'정○○ (고3 · 송파고) · 화상 10.15 19:00',why:'배정 교사 당일 취소, 같은 지원단·같은 슬롯 대체 없음',age:'1시간 12분',act:['다음 슬롯 2개 제안','다른 지원단 배정','반려']},
 {id:'Q2',type:'미배정 2h 초과',who:'온라인 #260132 · 전형 비교',why:'계열 매칭 후보 3명 모두 답변 중(48h 큐 포화)',age:'2시간 40분',act:['부하 균등 재배정','답변 기한 연장']},
 {id:'Q3',type:'한도 예외 요청',who:'김○○ (고2 · 강서고) · 학부모 신청',why:'학기 1회 한도 초과 · 사유 "진학 교사 추천 경로"',age:'어제',act:['예외 승인(사유 기록)','반려']},
 {id:'Q4',type:'노쇼 페널티 해제 요청',who:'박○○ (고3 · 동작고)',why:'10.2 방문 미출석 → 3개월 제한 중 · 병원 진단서 첨부',age:'2일',act:['해제(사유 기록)','유지']},
 {id:'Q5',type:'병합 후보',who:'온라인 #260140 · #260141',why:'같은 학생 ID · 같은 주제 2건 접수',age:'3시간',act:['병합','각각 유지']},
 {id:'Q6',type:'동의 미완 보류',who:'학부모 대리 신청 · 자녀 동의 대기 7일',why:'자녀 동의 없으면 확정 불가 · 자동 종결 D-1',age:'6일',act:['자녀에게 재알림','종결']}];
/* 만족도 O-03 (교사×채널 집계) */
const survey={resp:63,target:60,n:412,items:[['상담이 도움이 됐다',4.4],['설명이 이해하기 쉬웠다',4.3],['다시 신청하고 싶다',4.1]],
  byCh:[['온라인',4.2,214],['방문',4.6,98],['화상',4.4,100]],
  tags:[['구체적 조언',121],['빠른 답변',88],['자료 제공',64],['시간 부족',31],['답변 지연',19],['연결 문제',9]],
  low:[{t:'답변 지연 · 48h 초과 2건',who:'T017 · T044'},{t:'화상 연결 문제',who:'10.9 세션 2건'}]};
/* 수당 O-06 */
const rate={온라인:15000,방문:50000,화상:40000,전화:0};
const payout=teachers.slice(0,100).map(t=>{const on=t.online,vi=Math.floor(t.done*.4),vd=t.done-vi;return{id:t.id,name:t.name,grp:t.grp,online:on,visit:vi,video:vd,amt:on*rate.온라인+vi*rate.방문+vd*rate.화상,st:pick(['조서 생성','조서 생성','결재 대기','결재 완료'])};});
/* 과거 이관 O-05 */
const migrate={total:8055,rows:[['온라인(게시판)',4855,'2020~2026','A 71% · B 22% · C 7%'],['방문·화상',2310,'2021~2026','A 84% · B 13% · C 3%'],['수기 입력(전화·현장)',890,'2020~2026','C 100% (통계 제외)']]};
/* 동의·파기 로그 O-07 */
const consent=[['10.14 09:12','녹취 동의','학생 이○○ · 화상 C260112','동의(학생·학부모 각각)'],['10.14 08:40','학생부 자료 만료','C260071 · 종료 후 30일','자동 파기'],['10.13 18:05','삭제권 행사','학생 최○○ · 녹취 원본','즉시 삭제 · 요약본 유지'],['10.13 11:20','정보 열람 동의 철회','학부모 박○○','상담 내용 비공개로 전환'],['10.12 17:00','특별상담 시즌 데이터','2026 2차(8월) 접수분 1,004건','시즌 종료 60일 파기']];
return{teachers,ledger,queue,survey,rate,payout,migrate,consent,today,ymd,iso,d};
})();
