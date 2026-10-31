repo: rightsky/sen-portal
branch: main

이 프로젝트가 원본(소스)이며, 저장소에는 프로젝트 파일을 업로드해 배포합니다 (저장소 → 프로젝트 방향 가져오기 아님).

## Last sync
date: 2026-10-14T03:15:00Z
### 로컬 원본 동기화 완료 (저장소 = 로컬)
- 기준 커밋 : 8593a42 (main)
- 로컬 원본 : C:\Users\wjd21\OneDrive\바탕 화면\dev\sen-portal
- 기존 29개는 저장소와 동일 확인, 없던 41개 추가 (삭제 없음, backup/ 은 저장소에 없어 제외)
- 2026-10-14 반영분 : 진로 콘텐츠 적용(17파일) · doc2md 합치기(9파일) · 통합 적용 1~5단계(auth.js, counsel.js, index.html, parent.html, teacher.html) · docs/2026-10-14-작업정리.md
- 원격 브랜치 정리 대기 : main에 모두 들어간 feat/subject-data, feat/doc2md, feat/unified-auth 는 삭제 가능 (세션 권한으로는 삭제가 막혀 GitHub 화면에서 직접 삭제). feat/ai-worker 는 미병합이라 유지

### 2026-10-06
- v1.6: teacher.html(교사공간 상세설계) · parent.html(학부모 서비스) 신규
- 메인·index 역할 카드 링크 연결 · backup/2026-10-06-v1.6-roles/ 스냅샷

## Sync history
- 2026-10-31: 남은 일 4건(특성화고 경로·알림 센터·모의지원·AI 답변 신고) + 상담시스템 폰 레이아웃 + 전체 품질 점검(22화면 × 17역할 자동 점검, 코드 리뷰 32건 수정)을 main에 직접 커밋(Claude 세션) · 상세 docs/2026-10-30-작업정리.md
- 2026-10-30: 실무 의견 반영 1~7단계를 main에 직접 커밋(Claude 세션) · 작업 전 복구 지점 a115f59(backup/20261030-before-major, restore-point/before-20261030) · 로컬 폴더는 `git pull`로 맞출 것 · 상세 docs/2026-10-30-작업정리.md
- 2026-10-14T12:15+09:00: 로컬 개발 폴더를 main(8593a42)으로 동기화(Claude 세션, 데스크톱 연결) · 병합 끝난 원격 브랜치 3개 확인(삭제는 GitHub 화면에서)
- 2026-10-14: 저장소 main에 직접 커밋(Claude 세션) — 로컬 원본은 사용자가 zip으로 동기화
- 2026-10-06T00:00:00+09:00: 저장소 연결 등록, index.html·README.md 생성

## Screen map
| 프로젝트 화면 | 저장소 경로 (업로드 시) |
|---|---|
| 전체 HTML/JS/CSS | 루트 동일 경로 |
| 메인 | index.html (main-everland-style.html 은 index.html 로 자동 이동) |
| 공통 | sen-ledger.js · sen-marks.js · auth.js · gnb.js · footer-sys.js |
| 교사공간 | teacher.html + teacher-1030.js(학교/집 모드·판정 확인 3단) · teacher-ext.js · teacher-prep.js(상담 준비) |
| 업무시스템 | ops-counsel.html(+ ops-counsel.js · ops-counsel-data.js) · ops-ai.html(+ ops-ai.js · ops-ai-data.js) · ops-admin.html(+ ops-admin.js · ops-admin-data.js) · ops-shell.js · ops.css · ops-counsel.css |
| 작업 기록 | docs/ |
| 백업 스냅샷 | backup/ |
