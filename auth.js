/* 공용 로그인 상태 (목업) — localStorage 'sen-trait-state' : guest | empty | full */
(function(){
const KEY='sen-trait-state';
const A={get state(){return localStorage.getItem(KEY)||'guest';},logged(){return this.state!=='guest';},
 login(has){localStorage.setItem(KEY,has===false?'empty':'full');fire();},logout(){localStorage.setItem(KEY,'guest');fire();}};
const fire=()=>{renderWho();document.dispatchEvent(new CustomEvent('sen-auth'));};
window.SEN_AUTH=A;
const css=`.who{display:inline-flex;gap:10px;align-items:center}
.lmodal{position:fixed;inset:0;z-index:95;display:grid;place-items:center;padding:20px;background:rgba(10,12,18,.5);opacity:0;visibility:hidden;transition:opacity .2s,visibility .2s}
.lmodal.is-on{opacity:1;visibility:visible}
.lmodal__p{width:min(440px,100%);background:var(--bg);border-radius:var(--radius-xl);padding:32px;position:relative;display:flex;flex-direction:column;gap:14px}
.lmodal__p h2{margin:0;font-size:22px;font-weight:900}
.lmodal__x{position:absolute;top:18px;right:18px;width:36px;height:36px;border-radius:50%;background:var(--surface)}
.fld{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:700;color:var(--ink-2)}
.fld input{font:inherit;font-size:15px;padding:13px 14px;border-radius:var(--radius-md);border:1.5px solid var(--line);background:var(--bg);color:var(--ink);outline:0}
.fld input:focus{border-color:var(--brand)}
.lm-err{display:none;font-size:13.5px;color:#C43B3B;font-weight:700;margin:-4px 0 0}.lm-err.is-on{display:block}
.lm-note{font-size:13px;color:var(--ink-3);margin:0}
.gatebox{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:24px;align-items:center;background:linear-gradient(135deg,#1E5EFF,#7B5CFF);color:#fff;border-radius:var(--radius-xl);padding:32px 36px;box-shadow:var(--shadow-2)}
.gatebox__ic{width:64px;height:64px;border-radius:20px;background:rgba(255,255,255,.18);display:grid;place-items:center;font-size:28px}
.gatebox h3{margin:0 0 6px;font-size:22px;font-weight:900}
.gatebox p{margin:0;opacity:.92}
.gatebox .btn{background:#fff;color:var(--brand)}
@media (max-width:860px){.gatebox{grid-template-columns:1fr}}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const m=document.createElement('div');m.className='lmodal';m.id='lmodal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
m.innerHTML=`<form class="lmodal__p" novalidate><button type="button" class="lmodal__x" data-lmclose aria-label="닫기">✕</button><h2>학생 로그인</h2>
<label class="fld">아이디<input name="id" autocomplete="username" placeholder="통합 계정 아이디"></label>
<label class="fld">비밀번호<input name="pw" type="password" autocomplete="current-password" placeholder="비밀번호"></label>
<p class="lm-err">아이디와 비밀번호를 입력해 주세요</p>
<button class="btn btn--primary btn--pill" type="submit" style="padding:14px">로그인</button>
<p class="lm-note">목업: 아무 값이나 입력하면 '김서울(고2)' 계정으로 로그인됩니다</p></form>`;
document.body.appendChild(m);
const f=m.querySelector('form');
A.open=()=>{m.querySelector('.lm-err').classList.remove('is-on');m.classList.add('is-on');setTimeout(()=>f.id.focus(),50);};
const close=()=>m.classList.remove('is-on');
m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-lmclose]'))close();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
f.addEventListener('submit',e=>{e.preventDefault();if(!f.id.value.trim()||!f.pw.value.trim()){m.querySelector('.lm-err').classList.add('is-on');return;}f.pw.value='';close();A.login(true);window.showToast&&showToast('김서울 님, 환영합니다');});
/* 헤더 */
const util=document.querySelector('.brandbar__util');let who=document.getElementById('who');
if(util&&!who){const old=util.querySelector('a');who=document.createElement('span');who.className='who';who.id='who';old?old.replaceWith(who):util.prepend(who);}
function renderWho(){if(!who)return;who.innerHTML=A.logged()?'<span style="color:var(--ink)">김서울 님</span><a href="#" data-logout>로그아웃</a>':'<a href="#" data-loginopen>로그인</a>';}
document.addEventListener('click',e=>{if(e.target.closest('[data-loginopen]')){e.preventDefault();A.open();}if(e.target.closest('[data-logout]')){e.preventDefault();A.logout();window.showToast&&showToast('로그아웃했어요');}});
A.gate=(icon,title,desc)=>`<div class="gatebox"><div class="gatebox__ic">${icon}</div><div><h3>${title}</h3><p>${desc}</p></div><button class="btn btn--pill" data-loginopen>로그인하고 이용하기 →</button></div>`;
renderWho();
})();
