# 서울 진로진학 통합플랫폼 (SEN Portal) — UI 목업

학생·학부모·교사용 진로진학 통합 플랫폼의 HTML 목업입니다. 빌드 없이 정적 호스팅(GitHub Pages 등)으로 바로 동작합니다.

## 실행
- `index.html` (= `main-everland-style.html`) 을 열면 메인에서 전 화면으로 이동합니다.
- GitHub Pages: Settings → Pages → Branch `main` / root 선택.

## 주요 화면
| 파일 | 화면 |
|---|---|
| index.html / main-everland-style.html | 메인 (7대분류 GNB) |
| my.html | 나의 진로진학 (로드맵·활동 성장 노트·월말 점검) |
| strategy.html | 지원전략 (성적·3개년 입결·지원 매트릭스·면접) |
| univ.html | 대학·전형 탐색 (문서 버전 이력·전년 대비 변경) |
| subject-explore.html / study-plan.html | 과목 탐색·학업설계 (권장과목 겹쳐보기) |
| school-explore.html | 고교 탐색 |
| counsel.html | 상담·체험 (4단계 예약) |
| library.html / news.html | 자료·소식 (작성 틀·학부모 가이드·기록 윤리) |
| jinro-*.html | 미래탐색 (검사·직업·학과·변화) |
| cns.html | 교사 상담 준비 콘솔 (3역량 점검·사전 입력서) |
| sen-ai-poc.html | AI PoC (RAG 챗·생기부 어시스턴트) · AI 연결은 `worker/README.md` |

## 데이터·원칙
- 모든 수치·입결·전형 데이터는 예시/합성 데이터입니다.
- 학생 화면은 합격 판정을 하지 않으며, 판단은 상담(교사 확정)에서 합니다.
- 설계 근거: `backup/2026-10-06-v1.5-books/01_도서요약_학종_생기부_4권.md`, `02_기능매핑_통합플랫폼.md`
