/* AI 서비스 관리 합성 데이터 (결정적 생성) · 원천 배지 [합성]
   근거 : 운영평면대시보드·데이터관리·가명vs합성·HITL_flywheel 설계 문서, screens_S3_ai, ISP v1.11 T3-1~T3-3(AI 단계 '27 파일럿 5종 → '28 정식화)
   GPU 수치는 ISP v1.11 예산 기준('27 XE7740 + RTX PRO 6000×4, '28 4EA 증설) */
window.AI_DATA=(function(){
const rnd=(seed=>()=>{seed=(seed*9301+49297)%233280;return seed/233280;})(7);
const spark=(base,amp)=>Array.from({length:24},(_,h)=>Math.max(0,Math.round(base*(h<8?.25:h<16?1:.6)+(rnd()-.5)*amp)));
/* 모듈 9종 : 계층(A 결정적·B ML 추론·C LLM 생성), 단계(ISP) */
const modules=[
 {k:'rag',name:'진로진학 RAG',svc:'① RAG 대입상담',tier:'C',grade:'L',path:'O',tech:'Agentic RAG · BGE-M3 · 리랭커',stage:'1단계 파일럿 운영',pool:'C LLM',calls:spark(180,60),p95:2.4,err:.6,hitl:4.1,srcfail:1.8,tok:1850,cache:41,sess:38},
 {k:'cs',name:'상담 기록 요약',svc:'② 계열 (상담요약)',tier:'C',grade:'C',path:'Private',tech:'STT → Private LLM 요약',stage:'1단계 파일럿 운영',pool:'C LLM',calls:spark(40,16),p95:6.8,err:1.1,hitl:9.5,srcfail:0,tok:3200,cache:12,sess:6},
 {k:'deid',name:'개인정보 비식별화',svc:'공통 관문',tier:'B',grade:'공통',path:'Private',tech:'NER 비식별 · 가명키 안심구역',stage:'1단계 파일럿 운영',pool:'B ML',calls:spark(260,80),p95:.9,err:.2,hitl:0,srcfail:0,tok:0,cache:0,sess:0,pin:true},
 {k:'fx',name:'교과환산점 관리',svc:'⑤ 결정적 환산 (AI 아님)',tier:'A',grade:'규칙',path:'S',tech:'Rule Engine · 환산식 원장 P1~P7',stage:'산출식 AI 검증 (요강 판독보조)',pool:'A CPU·DB',calls:spark(900,200),p95:.3,err:.05,hitl:0,srcfail:0,tok:0,cache:0,sess:0},
 {k:'sb',name:'학생부 정밀분석',svc:'② 학생부 정밀분석',tier:'C',grade:'C',path:'Private',tech:'레이아웃 파싱 + LLM · GraphRAG 4축',stage:'2단계 정식화 대기 (배포 게이트)',pool:'C LLM',calls:spark(22,10),p95:11.2,err:1.8,hitl:14.2,srcfail:3.1,tok:9800,cache:5,sess:3},
 {k:'iv',name:'서류·면접 AI 평가',svc:'③ 면접지원',tier:'C',grade:'L',path:'O',tech:'STT → LLM → TTS · 루브릭',stage:'모듈 구축 · 학생 화면 미개방',pool:'C LLM',calls:spark(6,4),p95:4.1,err:.9,hitl:0,srcfail:0,tok:2400,cache:0,sess:2},
 {k:'ad',name:'AI 학업설계',svc:'④ 학업설계',tier:'B',grade:'C',path:'Private',tech:'LightGBM + CP-SAT · 위계 그래프',stage:'교사용 PoC 준비 (매핑 자산 구축)',pool:'B ML',calls:spark(3,2),p95:1.6,err:0,hitl:0,srcfail:0,tok:0,cache:0,sess:0},
 {k:'pd',name:'합격률지수 · 개인 예측',svc:'⑤ 합불예측',tier:'B',grade:'H',path:'S',tech:'LightGBM · Isotonic 보정 · Conformal · SHAP',stage:'2단계 정식화 대기 (5등급 재학습)',pool:'B ML',calls:spark(0,0),p95:0,err:0,hitl:0,srcfail:0,tok:0,cache:0,sess:0,shadow:true},
 {k:'run',name:'맞춤형 프로세스 실행',svc:'조합 실행',tier:'C',grade:'조합',path:'혼합',tech:'스텝퍼 · PDF 리포트',stage:'1단계 파일럿 운영',pool:'C LLM',calls:spark(14,6),p95:8.4,err:.7,hitl:6.0,srcfail:1.2,tok:5100,cache:18,sess:4}];
/* 모델 원장 */
const models=[
 ['① RAG 대입상담','Private 7B 생성 + 외부 API(O등급)','INT8','S존 vLLM · O존 게이트웨이','RTX PRO 6000 ×1 (C풀)','요강·FAQ 코퍼스 v2026.10','v1.4.2','CONFIRMED'],
 ['② 상담요약','Private LLM 7~8B','INT8','S존 vLLM','C풀 공유','상담 매뉴얼 11.2 코퍼스','v1.1.0','CONFIRMED'],
 ['② 학생부 정밀분석','Private LLM 70B급 (후보)','BF16','S존 (계획)','C풀 ×2 (28 증설 후)','성취도 컨텍스트·평가셋 (구축 중)','v0.3 (평가)','REVIEW'],
 ['③ 면접지원','STT(Whisper 계열) + 7B + TTS','INT8','S존','C풀 공유 · 음성 세션 상한 8','학과 인재상·예상질문 v1','v0.9','REVIEW'],
 ['④ 학업설계','LightGBM + CP-SAT','—','B풀 CPU','GPU 불필요','권장과목 매핑 (PoC)','v0.2','DRAFT'],
 ['⑤ 합불예측','LightGBM (9등급 현행) → 5등급 재학습','—','B풀 CPU','GPU 불필요','합불 라벨 3개년 (교육청 이관)','v2.0 → v3.0 섀도우','REVIEW'],
 ['공통 비식별','NER (한국어 개체명) + 규칙','INT8','S존 관문','B풀 소형 GPU','PII 골든셋 v4','v2.3','CONFIRMED'],
 ['임베딩·리랭커','BGE-M3 · bge-reranker-v2-m3','FP16','S존','B풀 공유','—','v1.0','CONFIRMED']];
/* 절대 합격선 · 현재값 */
const gates=[
 {svc:'① RAG',items:[['Faithfulness','≥0.95',0.962,true],['라우팅 정확도','≥0.95',0.951,true]]},
 {svc:'② 학생부 분석',items:[['PII 재현율','≥0.99',0.994,true],['교사-AI 동의율 κ','≥0.6',0.57,false]]},
 {svc:'③ 면접',items:[['STT CER','≤5%',4.2,true],['평가-교사 상관 ρ','≥0.7',0.66,false]]},
 {svc:'④ 학업설계',items:[['위계 위반율','0%',0,true],['권장과목 충족','≥95%',91,false]]},
 {svc:'⑤ 합불예측',items:[['AUROC','≥0.85',0.873,true],['ECE','≤0.05',0.061,false],['단정률','0%',0,true],['공정성 격차','≤5%p',3.8,true]]},
 {svc:'공통',items:[['가용성','99.9%',99.94,true],['HITL·고지','100%',100,true]]}];
/* 릴리스 게이트 묶음 */
const releases=[
 ['① RAG','v1.4.2','p-2026.10.3','—','통과 98.7%','카나리 완료 · 전체','녹'],
 ['② 상담요약','v1.1.0','p-2026.09.1','—','통과 97.1%','전체','녹'],
 ['② 학생부 분석','v0.3','p-2026.10.1','—','미측정','시범학교 3곳 (교사 검토만)','주황'],
 ['⑤ 합불예측','v3.0 섀도우','—','FX v2026.10 PROVISIONAL','ECE 미달','섀도우 (구모델 병행)','주황'],
 ['④ 학업설계','v0.2','—','—','권장과목 91%','PoC 준비','회']];
/* 학교별 서비스 등급 */
const schools=[['서울고','전체 9종',4210,78,92],['서울한빛고','전체 9종',3880,71,88],['송파고','표준 6종',2110,54,81],['강서고','표준 6종',1980,49,77],['노원고','표준 6종',1650,46,74],['마포고','기본 2종',420,18,60]];
/* 데이터 4등급 · 카탈로그 */
const datasets=[
 {id:'DS-R-01',name:'학생부 원문 (3-2 반)',cls:'REAL',n:21,owner:'담임 김민정',zone:'S존',purity:100,note:'반출 불가 · 목적 입력'},
 {id:'DS-P-01',name:'학생부 가명본 (서울고)',cls:'PSEUDO',n:210,owner:'진학부장',zone:'S존(가명)',purity:100,note:'1:1 대응 있음 · 가명키 안심구역'},
 {id:'DS-P-02',name:'합불 라벨 가명 (3개년)',cls:'PSEUDO',n:31200,owner:'SEN 데이터 관리자',zone:'학습 평면',purity:100,note:'교육청 이관 · 전형년도 키'},
 {id:'DS-S-01',name:'합성 배경 (서울 1세대)',cls:'SYNTH',n:2000,owner:'SEN',zone:'학습 평면',purity:92,note:'시드 DS-P-02 · 배수 ×1.5 · 1:1 대응 없음'},
 {id:'DS-S-02',name:'cns 상담 준비 합성 200',cls:'SYNTH',n:200,owner:'SEN',zone:'O존 시연',purity:88,note:'포털 cns.html 사용'},
 {id:'DS-D-01',name:'HITL feedback_record (10월)',cls:'DERIVED',n:4120,owner:'플라이휠',zone:'학습 평면',purity:100,note:'가명화 관문 통과 · 부모 PSEUDO'},
 {id:'DS-S-03',name:'합성 2세대 (시드 부족)',cls:'SYNTH',n:900,owner:'SEN',zone:'보류',purity:61,note:'순도 70 미만 → 시드 사용 차단'}];
const access=[['10.14 11:02','김민정(담임)','DS-R-01 실데이터','목적: 상담 준비 · 범위 내','정상'],['10.14 10:40','이재원(진학부장)','DS-P-01 가명 210','범위 내','정상'],['10.14 02:15','T-외부?','DS-P-02 대량 조회 1,200행','야간·대량','이상 플래그'],['10.13 16:20','서다은(SEN)','DS-S-01 배포','교육청 배포 → 학교 5','정상'],['10.13 15:05','김민정(담임)','3-1 반 (범위 밖)','범위 밖 조회','차단 · 합성 배경으로 대체']];
const flywheel={actions:[['승인',2890,'긍정 라벨'],['수정 후 승인',812,'보정 라벨 (가장 값짐)'],['반려',266,'부정 라벨'],['근거 보강 요청',152,'RAG 검색 실패 라벨']],
 reasons:[['R1 근거 오류',41,'출처 실패율 → RAG·정밀분석 검색 품질'],['R2 환산 오류',12,'환산식 원장 이슈 자동 등록 (P1~P7)'],['R3 학생 사정 반영',31,'학습 제외 (정상 보정)'],['R4 표현 완화',11,'프롬프트 버전 이슈 (단정률)'],['R5 기타',5,'분기별 수동 분류']],
 loops:[['L1 즉시','일 단위 누적','누적 4,120'],['L2 전달 후','주 단위 · L1 신뢰 가중치로만','이번 주 318'],['L3 결과 매칭','12~3월 실제 합불 → ⑤ 재학습·ECE 보정','전년 매칭 88%'],['L4 골든셋 승격','분기','3분기 승격 46건']],agree:[71,79]};
const gpu={y27:{host:'Dell XE7740 ×1',cards:'NVIDIA RTX PRO 6000 ×4 (96GB ×4 = 384GB)',pools:[['A 결정적 계산','CPU·DB','GPU 0','환산·합격률지수·게이트'],['B ML 추론','RTX PRO 6000 ×1 + CPU','비식별·임베딩·GBM(CPU)'],['C LLM 생성','RTX PRO 6000 ×3','RAG 7B · 상담요약 · 면접 STT/TTS · run']]},
 y28:{add:'RTX PRO 6000 4EA 증설 (누적 768GB) + 호스트','gate':'B2·B3 321.2백만원 · 증설 전까지 2단계 범위 축소(R-06)','use':'② 70B급 정밀분석 ×2 · 음성 세션 전용 풀 검토'},
 util:[['C풀 GPU-1 (RAG)',72,'상주'],['C풀 GPU-2 (요약·run)',58,'상주'],['C풀 GPU-3 (면접·예비)',21,'온디맨드'],['B풀 GPU-0 (비식별·임베딩)',44,'상주']],
 season:[['큐 p95 경고/위험','5초 / 20초','15초 / 60초'],['동접 상한','500','2,000'],['교사 레이트리밋','60건/분','30건/분'],['GPU 상주','A 상시 · B 1 · C 1','스케일아웃 상한 C 3']],
 charge:[['서울고',4210,12.4],['서울한빛고',3880,11.2],['송파고',2110,6.1],['강서고',1980,5.7],['노원고',1650,4.8],['미배분(태그 누락)',0,0]]};
return{modules,models,gates,releases,schools,datasets,access,flywheel,gpu};
})();
