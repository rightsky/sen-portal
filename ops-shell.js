/* SEN 업무시스템 공통 셸 : 관리자 게이트(원패스 L3 + Role + 2단계 인증) · 상단 바 · 사이드바 · 해시 라우팅 · 관리자 세션 15분 · 감사 문구
   사용 : SEN_OPS.init({sys:'counsel', title:'상담시스템', desc:'…', menus:[{k,label,code,grp}], views:{k:(el,ctx)=>{}} , badges:()=>({k:n}) })
   권한 : SEN_AUTH.roleObj.ops 에 sys 가 들어 있어야 진입. 없으면 게이트. 진입 시 세션당 1회 2단계 인증(sessionStorage 'sen-ops-2fa').
   기본 기기 : PC (태블릿은 사이드바 접힘, 표는 카드로) */
(function(){
const SYS={counsel:{label:'상담시스템',file:'ops-counsel.html'},ai:{label:'AI 서비스 관리',file:'ops-ai.html'},admin:{label:'플랫폼관리',file:'ops-admin.html'}};
const SESSION_MIN=15;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let cfg=null,cur=null,timer=null,sessEnd=0;
const toastEl=()=>{let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.className='toast';t.id='toast';t.setAttribute('role','status');document.body.appendChild(t);}return t;};
let tt;window.showToast=m=>{const t=toastEl();t.textContent=m;t.classList.add('is-on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('is-on'),2600);};
const A=()=>window.SEN_AUTH;
const allowed=()=>{const a=A();if(!a||!a.logged())return false;const r=a.roleObj;if(!r)return false;if(r.k==='office'&&Array.isArray(r.ops)&&r.ops.includes(cfg.sys))return true;return !!(cfg.extraRoles&&cfg.extraRoles.includes(r.k));};
const menusFor=()=>{const a=A();const r=a&&a.roleObj;return (typeof cfg.menus==='function')?cfg.menus(r):cfg.menus;};
const twofa=()=>{try{const v=JSON.parse(sessionStorage.getItem('sen-ops-2fa')||'null');return v&&v.sys===cfg.sys&&Date.now()<v.until;}catch(e){return false;}};
const setTwofa=()=>{sessEnd=Date.now()+SESSION_MIN*60000;sessionStorage.setItem('sen-ops-2fa',JSON.stringify({sys:cfg.sys,until:sessEnd}));};

function top(){
  const a=A(),r=a&&a.roleObj;
  const sw=Object.entries(SYS).map(([k,v])=>{const ok=r&&r.ops&&r.ops.includes(k);return `<a href="${ok?v.file:'#'}"${k===cfg.sys?' class="is-on" aria-current="page"':''}${ok?'':' data-nosys="'+esc(v.label)+'"'}>${v.label}</a>`;}).join('');
  return `<a class="skip" href="#opsMain">본문 바로가기</a><header class="ops-top"><button class="ops-top__menu" id="opsMenuBtn" aria-label="메뉴 열기" aria-expanded="false">☰</button>
  <div class="ops-top__brand"><span class="mark" aria-hidden="true"></span><span class="txt">SEN 업무시스템</span> <span class="ops-top__sys">${esc(cfg.title)}</span></div>
  <nav class="ops-top__sw" aria-label="업무시스템 전환">${sw}</nav>
  <div class="ops-top__right" id="opsWho"></div></header>`;
}
function who(){
  const a=A(),el=document.getElementById('opsWho');if(!el)return;
  if(!a||!a.logged()){el.innerHTML='<a class="btn btn--line btn--sm" href="index.html">포털로</a><button class="btn btn--primary btn--sm" data-loginopen>관리자 로그인</button>';return;}
  const r=a.roleObj;
  el.innerHTML=`<span class="ops-who"><b>${esc(a.name)}</b><span class="r">${esc(r?(r.opsRole||(r.k==='counselor'?'상담 선생님':a.roleLabel(r.k))):'역할 없음')}</span><span class="badge badge--navy">L${a.level}</span></span>
  <span class="ops-sess" id="opsSess" aria-live="polite"></span>
  <a class="btn btn--line btn--sm" href="index.html">포털로</a><button class="btn btn--line btn--sm" data-logout>로그아웃</button>`;
  tick();
}
function tick(){const s=document.getElementById('opsSess');if(!s)return;clearInterval(timer);
  const f=()=>{if(!twofa()){s.innerHTML='2단계 인증 전';return;}const left=Math.max(0,sessEnd-Date.now());const m=Math.floor(left/60000),sec=Math.floor(left%60000/1000);s.classList.toggle('is-warn',left<120000);
    s.innerHTML=`관리자 세션 <b>${m}:${String(sec).padStart(2,'0')}</b> <button class="btn btn--line btn--sm" data-extend>연장</button>`;
    if(left<=0){sessionStorage.removeItem('sen-ops-2fa');clearInterval(timer);render();showToast('관리자 세션이 끝났어요. 다시 2단계 인증을 해 주세요');}};
  f();timer=setInterval(f,1000);}

function side(){
  const b=cfg.badges?cfg.badges():{};let g='';
  const items=menusFor().map(m=>{let h='';if(m.grp&&m.grp!==g){g=m.grp;h=`<div class="grp">${esc(g)}</div>`;}
    return h+`<a href="#${m.k}"${m.k===cur?' aria-current="page"':''}>${m.code?`<span class="code">${esc(m.code)}</span>`:''}<span>${esc(m.label)}</span>${b[m.k]?`<span class="n">${b[m.k]}</span>`:''}</a>`;}).join('');
  return `<aside class="ops-side" id="opsSide"><h2>${esc(cfg.title)}</h2><nav aria-label="${esc(cfg.title)} 메뉴">${items}</nav><div class="side-foot">${esc(cfg.desc||'')}<br>인가된 정보원 담당자 전용 · 모든 열람·변경은 감사로그에 남습니다</div></aside>`;
}
function gate(){
  const a=A();const logged=a&&a.logged();const r=logged&&a.roleObj;
  let why,acts;
  if(!logged){why='<p>이 업무시스템은 교육연구정보원의 인가된 담당자만 씁니다. 교육디지털원패스(L3)로 로그인한 뒤, 부여된 Role에 따라 들어갈 수 있는 시스템이 정해집니다.</p>';acts='<button class="btn btn--primary" data-loginopen>관리자 로그인 (교육디지털원패스)</button>';}
  else if(!r||(r.k!=='office'&&!(cfg.extraRoles&&cfg.extraRoles.includes(r.k)))){const rs=a.session.roles||[];let i=rs.findIndex(x=>x.k==='office');let sl='정보원 담당자';if(i<0&&cfg.extraRoles){i=rs.findIndex(x=>cfg.extraRoles.includes(x.k));if(i>-1)sl=a.roleLabel(rs[i].k);}why=`<p><b>${esc(a.name)}</b> 님의 현재 역할은 <b>${esc(a.roleLabel(a.role))}</b>이라 ${esc(cfg.title)}에 들어갈 수 없습니다.${i>-1?` ${esc(sl)} 역할로 전환하면 들어갈 수 있어요.`:' 정보원 소속 Role이 부여된 계정으로 로그인하세요.'}</p>`;acts=i>-1?`<button class="btn btn--primary" data-opsswitch="${i}" data-opsswitchl="${esc(sl)}">${esc(sl)} 역할로 전환</button>`:'<button class="btn btn--primary" data-logout>다른 계정으로 로그인</button>';}
  else if(!allowed()){why=`<p><b>${esc(a.name)}</b> 님의 Role(<b>${esc(r.opsRole||'')}</b>)은 ${esc(cfg.title)} 권한이 없습니다. 들어갈 수 있는 시스템 : ${(r.ops||[]).map(k=>`<a class="badge badge--navy" href="${SYS[k].file}">${SYS[k].label}</a>`).join(' ')||'없음'}</p>`;acts='<a class="btn btn--line" href="index.html">포털로</a><button class="btn btn--line" data-logout>다른 계정으로</button>';}
  else{why='<p>Role은 확인됐습니다. 업무시스템은 승인권·개인정보가 걸린 화면이라 들어갈 때 한 번 더 확인합니다(세션 15분, 연장 가능).</p>';acts='<button class="btn btn--primary" data-ops2fa>2단계 인증하고 들어가기</button>';}
  return `<main class="ops-main" id="opsMain" style="max-width:none"><div class="ops-gate"><h1>${esc(cfg.title)} · 관리자 전용</h1>${why}
  <ol><li>교육디지털원패스 로그인 (교원·공무원 L3)</li><li>정보원 내부 RBAC로 부여된 Role 확인 (콘텐츠 · 상담운영 · 정산 · 통계 · 시스템 · 데이터·AI)${cfg.extraRoles?' · 위촉 상담 선생님은 상담교사 역할로':''}</li><li>2단계 인증 (세션 15분, 5회 실패 시 잠금)</li></ol>
  <div class="acts">${acts}<a class="btn btn--line" href="index.html">포털로 돌아가기</a></div>
  <p class="hint" style="font-size:12.5px;color:var(--ink-3);margin:0">목업 : 로그인 창에서 교육디지털원패스 → 「정보원 담당자」 그룹의 데모 신원을 고르세요. 전자서명이 필요한 기능(수능 전송·정산 승인)은 GPKI 인증서를 추가로 요구합니다(인증 방식 비교 스위치는 교사공간과 같은 sen-authmode).</p></div></main>`;
}
function render(){
  const root=document.getElementById('ops');if(!root)return;
  const MENUS=menusFor();const h=location.hash.slice(1);cur=MENUS.some(m=>m.k===h)?h:MENUS[0].k;
  if(!(allowed()&&twofa())){root.innerHTML=top()+gate();who();return;}
  root.innerHTML=top()+`<div class="ops">${side()}<main class="ops-main" id="opsMain"></main></div>`;who();
  const m=MENUS.find(x=>x.k===cur);const main=document.getElementById('opsMain');
  const a=A();
  main.innerHTML=`<div class="ops-crumb">SEN 업무시스템 › <b>${esc(cfg.title)}</b> › ${esc(m.label)}</div><h1>${m.code?`<span class="badge badge--gray" style="vertical-align:middle;margin-right:8px">${esc(m.code)}</span>`:''}${esc(m.label)}</h1><div id="opsView"></div><p class="wm">열람자 ${esc(a.name)} · ${esc(a.roleObj.opsRole||(a.roleObj.k==='counselor'?'상담 선생님':a.roleLabel(a.roleObj.k)))} · ${new Date().toLocaleString('ko-KR',{hour12:false})} · 이 화면의 열람·변경은 감사로그에 기록됩니다 · 내보내기 파일에는 수신자·재배포 금지 워터마크가 붙습니다</p>`;
  const v=cfg.views[cur];const el=document.getElementById('opsView');
  if(v)v(el,{auth:a,role:a.roleObj,toast:showToast,esc,cur});else el.innerHTML='<div class="card"><p>이 메뉴는 다음 단계에서 채웁니다.</p></div>';
  if(cfg.after)cfg.after(cur,a);
  document.title=`${m.label} | ${cfg.title} · SEN 업무시스템`;
}
document.addEventListener('click',e=>{
  const sw=e.target.closest('[data-opsswitch]');if(sw){e.preventDefault();A().stepUp((sw.dataset.opsswitchl||'정보원 담당자')+' 역할로 전환').then(()=>{A().switchRole(+sw.dataset.opsswitch);});return;}
  const t=e.target.closest('[data-ops2fa]');if(t){e.preventDefault();A().stepUp(cfg.title+' 진입').then(()=>{setTwofa();render();showToast(cfg.title+'에 들어왔어요');});return;}
  const x=e.target.closest('[data-extend]');if(x){e.preventDefault();setTwofa();tick();showToast('세션을 15분 연장했어요');return;}
  const ns=e.target.closest('[data-nosys]');if(ns){e.preventDefault();showToast(ns.dataset.nosys+' 권한이 없는 Role이에요');return;}
  const mb=e.target.closest('#opsMenuBtn');if(mb){const s=document.getElementById('opsSide');const on=s.classList.toggle('is-open');mb.setAttribute('aria-expanded',on);return;}
  const sl=e.target.closest('.ops-side a');if(sl){const s=document.getElementById('opsSide');s&&s.classList.remove('is-open');}
  const tb=e.target.closest('[data-subtab]');if(tb){const box=tb.closest('.subtabs');box.querySelectorAll('[data-subtab]').forEach(b=>b.setAttribute('aria-selected',b===tb));const wrap=box.parentElement;wrap.querySelectorAll('[data-pane]').forEach(p=>p.hidden=p.dataset.pane!==tb.dataset.subtab);return;}
  const tz=e.target.closest('[data-toast]');if(tz){e.preventDefault();showToast(tz.dataset.toast);}
});
window.addEventListener('hashchange',render);
document.addEventListener('sen-auth',render);
window.SEN_OPS={init(c){cfg=c;const v=(()=>{try{return JSON.parse(sessionStorage.getItem('sen-ops-2fa')||'null');}catch(e){return null;}})();if(v&&v.sys===c.sys)sessEnd=v.until;render();},rerender:()=>render(),esc,SYS,
  /* 공용 조각 */
  kpi:(items)=>`<div class="kpis">${items.map(i=>`<div class="kpi${i.cls?' '+i.cls:''}"><span>${esc(i.l)}</span><b>${esc(i.v)}</b>${i.s?`<small>${esc(i.s)}</small>`:''}</div>`).join('')}</div>`,
  table:(cols,rows)=>`<table class="tbl"><thead><tr>${cols.map(c=>`<th${c.num?' class="num"':''}>${esc(c.l)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${cols.map((c,i)=>`<td data-l="${esc(c.l)}"${c.num?' class="num"':''}>${r[i]??''}</td>`).join('')}</tr>`).join('')}</tbody></table>`,
  subtabs:(tabs)=>`<div class="subtabs" role="tablist">${tabs.map((t,i)=>`<button role="tab" data-subtab="${t.k}" aria-selected="${i===0}">${esc(t.l)}</button>`).join('')}</div>${tabs.map((t,i)=>`<div data-pane="${t.k}"${i?' hidden':''}>${t.html}</div>`).join('')}`,
  src:(t)=>`<span class="badge badge--gray">${esc(t)}</span>`
};
})();
