# 서울 진로진학 통합플랫폼 (SEN Portal) — UI 목업

학생·학부모·교사용 진로진학 통합 플랫폼의 HTML 목업입니다. 빌드 없이 정적 호스팅(GitHub Pages 등)으로 바로 동작합니다.

## 실행
- `index.html` (= `main-everland-style.html`) 을 열면 메인에서 전 화면으로 이동합니다.
- GitHub Pages: Settings → Pages → Branch `main` / root 선택.

## 주요 화면
| 파일 | 화면 |
|---|---|
| index.html / main-everland-style.html | 메인 (7대분류 GNB) |
| sen-pro.html | SEN 진학프로그램(전문시스템) = 진학상담지원시스템 목업 ver2.1 독립실행본(7MB). 교사공간 「SEN 진학프로그램 열기」가 2단계 인증 뒤 새 창으로 엶 |
| my.html | 나의 진로진학 (로드맵·활동 성장 노트·월말 점검) |
| strategy.html | 지원전략 (성적·3개년 입결·지원 매트릭스·면접) |
| univ.html | 대학·전형 탐색 (문서 버전 이력·전년 대비 변경) |
| subject-explore.html / study-plan.html | 과목 탐색·학업설계 (권장과목 겹쳐보기) |
| school-explore.html | 고교 탐색 |
| counsel.html | 상담·체험 (4단계 예약) |
| library.html / news.html | 자료·소식 (작성 틀·학부모 가이드·기록 윤리) |
| jinro-*.html | 미래탐색 (검사·직업·학과·변화) |
| teacher.html | 교사공간 (반 관리·판정 승인 HITL·수시/정시 지도·배정 답변·학교 관리·승격) — 역할 상태 8종 |
| parent.html | 학부모 서비스 (자녀 연결 3경로·동의 범위·대리 상담 신청) |
| cns.html | 교사 상담 준비 콘솔 (3역량 점검·사전 입력서) |
| sen-ai-poc.html | AI PoC (RAG 챗·생기부 어시스턴트) · AI 연결은 `worker/README.md` · 지식베이스는 한글(hwp·hwpx)·워드·PDF를 브라우저에서 md로 변환해 등록 (`doc2md.js`, 라이브러리는 `vendor/`) |

## 로그인·역할 (auth.js)
- IdP 3종 : 교육디지털원패스(L3) · 디지털원패스(L2) · 네이버/카카오(L1). 역할(학생·학부모·교사·상담교사·학교관리자·정보원)은 승인·위촉·학적 동기화로 부여되며, 승인권·배정 건·전문시스템 진입은 Step-up 2FA.
- 모두 목업(localStorage) 데모 신원이며 실제 인증은 없습니다. 작업 기록은 `docs/`.

## 데이터·원칙
- 모든 수치·입결·전형 데이터는 예시/합성 데이터입니다.
- 학생 화면은 합격 판정을 하지 않으며, 판단은 상담(교사 확정)에서 합니다.
- 설계 근거: `backup/2026-10-06-v1.5-books/01_도서요약_학종_생기부_4권.md`, `02_기능매핑_통합플랫폼.md`
