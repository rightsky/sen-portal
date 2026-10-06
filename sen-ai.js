/* 우하단 고정 SEN AI 버튼 + 서비스 선택 시트 (07 PoC 명세) — 모든 화면 공통 */
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
.senai-cards{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.senai-c{display:flex;flex-direction:column;gap:6px;text-align:left;padding:20px;border-radius:16px;color:#fff;transition:transform .2s}
.senai-c:hover{transform:translateY(-2px);color:#fff}
.senai-c b{font-size:17px}.senai-c span{font-size:13.5px;opacity:.92;line-height:1.5}
.senai-c--rag{background:#2FA39B}.senai-c--rec{background:#5B3FD6}
.senai-c--cns{background:#fff;color:var(--ink,#17191D);border:2px solid #E07B00}
.senai-c--cns:hover{color:var(--ink,#17191D)}
.senai-c--cns b{color:#9A5500}.senai-c--cns .lock{font-size:12px;font-weight:800;color:#9A5500;background:#FDF3E7;border-radius:999px;padding:2px 9px;align-self:flex-start}
.senai-note{margin:14px 0 0;font-size:12.5px;color:var(--ink-3,#777);text-align:center}
@media (max-width:640px){.senai-cards{grid-template-columns:1fr}.senai-fab{right:14px;bottom:14px}}
@media (prefers-reduced-motion:reduce){.senai-p,.senai-sheet,.senai-fab{transition:none}}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const fab=document.createElement('button');fab.className='senai-fab';fab.innerHTML='✦ SEN AI';fab.setAttribute('aria-haspopup','dialog');document.body.appendChild(fab);
const sh=document.createElement('div');sh.className='senai-sheet';sh.innerHTML=`<div class="senai-p" role="dialog" aria-modal="true" aria-label="SEN AI 서비스 선택">
<button class="senai-x" data-x aria-label="닫기">✕</button>
<h2>어떤 서비스를 이용하시겠어요?</h2><p>두 서비스 모두 근거와 기준일을 함께 보여주는 참고 도구예요.</p>
<div class="senai-cards">
<a class="senai-c senai-c--rag" href="sen-ai-poc.html#rag"><b>대화형 AI 이용하기</b><span>2028 대입 시행계획·제도 변화·학년별 준비 등 등록된 지식DB를 검색해 출처와 함께 답합니다 (RAG)</span></a>
<a class="senai-c senai-c--rec" href="sen-ai-poc.html#rec"><b>생기부 어시스턴트 이용하기</b><span>세특·창체 기록을 비식별 처리해 가명·합성 데이터로 만든 뒤 학업·진로·공동체 역량으로 분석합니다</span></a>
<a class="senai-c senai-c--cns" href="cns.html" data-cns><span class="lock">교사 로그인 필요</span><b>선생님 상담 준비</b><span>우리 반 학생의 생기부와 진로검사를 함께 보고, 확인할 점과 상담 브리프를 준비합니다. 학생에게는 선생님이 확정한 내용만 공유됩니다</span></a>
</div><p class="senai-note">AI 응답은 참고 자료이며 선생님 확정 뒤에만 판단이 됩니다.</p></div>`;
document.body.appendChild(sh);
const open=()=>{sh.classList.add('is-on');sh.querySelector('.senai-c').focus();};
const close=()=>{sh.classList.remove('is-on');fab.focus();};
fab.addEventListener('click',open);
sh.addEventListener('click',e=>{if(e.target===sh||e.target.closest('[data-x]'))close();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sh.classList.contains('is-on'))close();});
document.addEventListener('click',e=>{const t=e.target.closest('[data-senai]');if(t){e.preventDefault();open();}});
sh.addEventListener('click',e=>{const t=e.target.closest('[data-cns]');if(!t)return;/* 시연: 교사 게이트 안내 후 이동 */});
window.SENAI_OPEN=open;
})();
