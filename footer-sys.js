/* 푸터 우측 「업무시스템 바로가기」 : 상담시스템 · AI 서비스 관리 · 플랫폼관리 (모든 페이지 공통) */
(function(){
const c=document.querySelector('footer.footer .container');
if(!c||c.querySelector('.fsys'))return;
const css=`.fsys{margin-left:auto;flex:0 0 auto;display:flex;flex-direction:column;gap:10px;min-width:0}
.fsys__h{font-size:14px;font-weight:800;color:#fff}
.fsys__nav{display:flex;flex-wrap:wrap;gap:8px}
.fsys__nav a{display:inline-flex;align-items:center;min-height:40px;padding:0 16px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);color:#fff;font-size:13.5px;font-weight:700;white-space:nowrap}
.fsys__nav a:hover,.fsys__nav a:focus-visible{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.32)}
.fsys__note{font-size:12px;color:#C7CBD3;opacity:.7}
@media (max-width:860px){.fsys{margin-left:0;width:100%}}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
/* 기존 푸터가 한 줄 텍스트형(교사공간·학부모)이면 좌측 텍스트 묶음 + 우측 바로가기 행으로 바꾼다 */
let row=[...c.children].find(el=>el.tagName==='DIV'&&/display:\s*flex/.test(el.getAttribute('style')||''));
if(!row){row=document.createElement('div');row.style.cssText='display:flex;flex-wrap:wrap;gap:24px 36px;align-items:center';
  const txt=document.createElement('div');txt.style.cssText='flex:1 1 420px;min-width:0;line-height:1.8';
  while(c.firstChild)txt.appendChild(c.firstChild);row.appendChild(txt);c.appendChild(row);}
const box=document.createElement('div');box.className='fsys';
box.innerHTML='<b class="fsys__h">업무시스템 바로가기</b>'
 +'<nav class="fsys__nav" aria-label="업무시스템 바로가기">'
 +'<a href="ops-counsel.html">상담시스템</a>'
 +'<a href="ops-ai.html">AI 서비스 관리</a>'
 +'<a href="ops-admin.html">플랫폼관리</a>'
 +'</nav><span class="fsys__note">정보원 담당자 전용 · 교육디지털원패스 L3 + 2단계 인증</span>';
/* 우측 빈칸에 한 줄로 들어가도록 가운데 텍스트 묶음의 기본 폭을 줄인다 */
[...row.children].forEach(el=>{if(el.tagName==='DIV'&&/flex:\s*1 1 420px/.test(el.getAttribute('style')||''))el.style.flex='1 1 300px';});
row.appendChild(box);
})();
