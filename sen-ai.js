/* 우하단 고정 AI PoC 버튼 + 서비스 선택 시트 (07 PoC 명세 · 2026.10.16 재정리 : 개인정보 원칙 · md 변환기 · 지식저장소 · RAG 어시스턴트 · 생기부 AI 활용) : 모든 화면 공통 */
(function(){
const css=`.senai-fab{position:fixed;right:22px;bottom:22px;z-index:90;display:inline-flex;align-items:center;gap:8px;padding:14px 20px;border-radius:999px;background:#2FA39B;color:#fff;font-weight:800;font-size:15px;box-shadow:0 8px 24px rgba(0,0,0,.22);transition:transform .2s}
.senai-fab:hover{transform:translateY(-2px)}
.senai-sheet{position:fixed;inset:0;z-index:96;display:grid;place-items:end center;background:rgba(10,12,18,.5);opacity:0;visibility:hidden;transition:opacity .25s,visibility .25s}
.senai-sheet.is-on{opacity:1;visibility:visible}
.senai-p{width:min(920px,100%);background:var(--bg,#fff);border-radius:20px 20px 0 0;padding:26px 26px 18px;position:relative;transform:translateY(24px);transition:transform .25s}
.senai-sheet.is-on .senai-p{transform:none}
.senai-p h2{margin:0 0 4px;font-size:20px;font-weight:900}
.senai-p>p{margin:0 0 16px;font-size:14px;color:var(--ink-3,#777)}
.senai-x{position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:50%;background:var(--surface,#f4f5f7)}
.senai-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.senai-c{display:flex;flex-direction:column;gap:6px;text-align:left;padding:20px;border-radius:16px;color:#fff;transition:transform .2s}
.senai-c:hover{transform:translateY(-2px);color:#fff}
.senai-c b{font-size:17px}.senai-c span{font-size:13.5px;opacity:.92;line-height:1.5}
.senai-c--md{background:#16386f}.senai-c--store{background:#fff;color:var(--ink,#17191D);border:2px dashed #16386f}.senai-c--store:hover{color:var(--ink,#17191D)}.senai-c--store b{color:#16386f}.senai-c .new{display:inline-block;margin-left:6px;font-size:12px;font-weight:800;color:#16386f;background:#E8EEF8;border-radius:999px;padding:1px 8px;vertical-align:middle}.senai-priv{display:inline-block;margin:0 0 14px;font-size:13.5px;font-weight:700;color:#16386f;text-decoration:underline}.senai-c--rag{background:#2FA39B}.senai-c--rec{background:#5B3FD6}
.senai-c .sub{display:inline-block;margin-top:8px;font-size:12.5px;font-weight:700;color:#fff;background:rgba(255,255,255,.18);border-radius:999px;padding:4px 10px;align-self:flex-start}
.senai-c .sub:hover{background:rgba(255,255,255,.3)}
.senai-c--cns{background:#fff;color:var(--ink,#17191D);border:2px solid #E07B00}
.senai-c--cns:hover{color:var(--ink,#17191D)}
.senai-c--cns b{color:#9A5500}.senai-c--cns .lock{font-size:12px;font-weight:800;color:#9A5500;background:#FDF3E7;border-radius:999px;padding:2px 9px;align-self:flex-start}
.senai-note{margin:14px 0 0;font-size:12.5px;color:var(--ink-3,#777);text-align:center}
@media (max-width:640px){.senai-cards{grid-template-columns:1fr}.senai-fab{right:14px;bottom:14px}}
@media (max-width:768px){.senai-fab{bottom:calc(84px + env(safe-area-inset-bottom));padding:11px 16px;font-size:14px}} /* 10-30 : 폰 하단 탭바를 가리지 않게 (R01 R02 R07) */
@media (prefers-reduced-motion:reduce){.senai-p,.senai-sheet,.senai-fab{transition:none}}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const fab=document.createElement('button');fab.className='senai-fab';fab.innerHTML='✦ AI에게 묻기';fab.title='AI에게 묻기 (AI PoC : 공개 요강 질문하기 · 학생부 읽기 예시) · 10-30 노출명 변경';fab.setAttribute('aria-haspopup','dialog');document.body.appendChild(fab);
const sh=document.createElement('div');sh.className='senai-sheet';sh.innerHTML=`<div class="senai-p" role="dialog" aria-modal="true" aria-label="AI PoC 서비스 선택">
<button class="senai-x" data-x aria-label="닫기">✕</button>
<h2>어떤 서비스를 이용하시겠어요?</h2><p>AI PoC 네 기능 : 모두 근거와 기준일을 함께 보여주는 참고 도구예요.</p><a class="senai-priv" href="sen-ai-poc.html#priv">처음이시면 개인정보 원칙부터 읽어 주세요 →</a>
<div class="senai-cards">
<a class="senai-c senai-c--md" href="sen-ai-poc.html#kb"><b>1. md 변환기</b><span>요강·자료집·보고서(hwp·docx·pdf)를 md로 변환합니다 · 변환 미리보기 · md 내려받기 · 지식저장소에 저장</span></a>
<a class="senai-c senai-c--store" href="sen-ai-poc.html#store"><b>2. 지식저장소<span class="new">신규</span></b><span>md 변환기에서 저장한 문서를 모아 RAG가 검색하는 지식DB로 만듭니다 · 분류 · 정보 수정 · 내보내기·불러오기</span></a>
<a class="senai-c senai-c--rag" href="sen-ai-poc.html#rag"><b>3. RAG 어시스턴트 (챗봇)</b><span>등록된 md 지식DB를 검색해 2028 대입 시행계획·제도 변화·학년별 준비를 출처와 함께 답합니다 · 모른다 카드</span></a>
<div class="senai-c senai-c--rec"><a href="sen-ai-poc.html#rec" style="color:#fff;display:flex;flex-direction:column;gap:6px"><b>4. 생기부 AI 활용</b><span>세특·창체 기록을 비식별 처리해 가명·합성 데이터로 만든 뒤 학업·진로·공동체 역량으로 분석합니다</span></a><a class="sub" href="cns.html" data-cns>교사 로그인 · 선생님 상담 준비(우리 반 생기부 + 진로검사 브리프) →</a></div>
</div><p class="senai-note">AI 응답은 참고 자료이며 선생님 확정 뒤에만 판단이 됩니다.</p></div>`;
document.body.appendChild(sh);
const open=()=>{sh.classList.add('is-on');const f=sh.querySelector('.senai-c a,.senai-c');if(f)f.focus();};
const close=()=>{sh.classList.remove('is-on');fab.focus();};
fab.addEventListener('click',open);
sh.addEventListener('click',e=>{if(e.target===sh||e.target.closest('[data-x]'))close();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sh.classList.contains('is-on'))close();});
document.addEventListener('click',e=>{const t=e.target.closest('[data-senai]');if(t){e.preventDefault();open();}});
sh.addEventListener('click',e=>{const t=e.target.closest('[data-cns]');if(!t)return;/* 시연: 교사 게이트 안내 후 이동 */});
window.SENAI_OPEN=open;
})();
