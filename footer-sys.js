/* 푸터 우측 「업무시스템 바로가기」 : 정보원 역할에만 노출 (10-30 수정) */
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
/* 10-30(§9 행 5, R01 R02 R07) : 정보원 역할로 로그인했을 때만 보인다. 위촉 상담 선생님이 상담교사 역할로 바꾸면 상담시스템만.
   담임·학생·학부모·비로그인에게는 숨긴다. */
const draw=()=>{const A=window.SEN_AUTH,r=A&&A.roleObj,k=r?r.k:'guest';
  const ALL={counsel:['ops-counsel.html','상담시스템'],ai:['ops-ai.html','AI 서비스 관리'],admin:['ops-admin.html','플랫폼관리']};
  /* 10-31 : 담당 업무시스템(r.ops)만 보인다 · 통합관리자는 셋 다 */
  const links=k==='office'?(Array.isArray(r.ops)&&r.ops.length?r.ops:['counsel','ai','admin']).map(x=>ALL[x]).filter(Boolean):k==='counselor'?[ALL.counsel]:[];
  if(!links.length){box.hidden=true;box.innerHTML='';return;}
  box.hidden=false;
  box.innerHTML='<b class="fsys__h" data-mk="up1030" data-mk-note="§9 행 5 · 정보원·상담교사 역할에만 노출 (R01 R02 R07)">업무시스템 바로가기</b>'
   +'<nav class="fsys__nav" aria-label="업무시스템 바로가기">'+links.map(([h,t])=>'<a href="'+h+'">'+t+'</a>').join('')+'</nav>'
   +'<span class="fsys__note">'+(k==='office'?'정보원 담당자 전용':'위촉 상담 선생님 · 상담교사 역할')+' · 2단계 인증</span>';};
draw();document.addEventListener('sen-auth',draw);
/* 우측 빈칸에 한 줄로 들어가도록 가운데 텍스트 묶음의 기본 폭을 줄인다 */
[...row.children].forEach(el=>{if(el.tagName==='DIV'&&/flex:\s*1 1 420px/.test(el.getAttribute('style')||''))el.style.flex='1 1 300px';});
row.appendChild(box);
})();
