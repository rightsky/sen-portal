/* 공용 로그인·역할 상태 (목업)
   설계: 「SEN 진학프로그램·상담시스템 통합 적용 기획(안)」 2026-10-13 · 인증 ≠ 계정 ≠ 역할 ≠ 관계
   - 역할은 로그인 때 고르지 않는다. 인증 수단이 돌려준 속성(학적·교원)과 승인 기록으로 시스템이 붙인다
   - 보증 수준: L1 소셜(열람·알림) / L2 디지털원패스 본인확인(자녀 연결·상담 신청·동의) / L3 교육디지털원패스 교원·학적(교사 콘솔·학교 관리)
   - 저장: localStorage 'sen-auth-v2' = {idp, level, person, roles:[{k,label,status,scope,term}], cur}
   - 하위 호환: 학생 화면이 읽는 'sen-trait-state'(guest|empty|full)를 함께 맞춘다 */
(function(){
const KEY='sen-auth-v2',LEGACY='sen-trait-state';
const ROLE_LABEL={student:'학생',student2:'학생(비재학)',parent:'학부모',teacher:'교사',counselor:'상담교사',schooladmin:'학교관리자',office:'교육청·정보원',guest:'일반 사용자'};
const ROLE_HOME={student:'my.html#stage',student2:'my.html#stage',parent:'parent.html',teacher:'teacher.html',counselor:'teacher.html',schooladmin:'teacher.html',office:'ops-admin.html',guest:'index.html'};
const IDP={eduonepass:{name:'교육디지털원패스',level:3,desc:'나이스 학적·교원 정보로 역할이 자동으로 붙어요',who:'학생 · 선생님 · 정보원 담당자'},onepass:{name:'디지털원패스',level:2,desc:'본인확인. 자녀 연결·상담 신청·동의에 필요해요',who:'학부모 · 비재학생'},naver:{name:'네이버',level:1,desc:'간편 로그인. 열람·알림·관심 저장만',who:'일반 사용자'},kakao:{name:'카카오',level:1,desc:'간편 로그인. 열람·알림·관심 저장만',who:'일반 사용자'}};
/* 역할별 주 로그인 수단 (로그인 모달 상단 안내) */
const MAIN_WAY=[
 ['학생','eduonepass','교육디지털원패스','나이스 재학 정보로 학교·학년·반이 자동으로 붙어요 (비재학생은 디지털원패스 본인확인)'],
 ['학부모','onepass','디지털원패스','본인확인 뒤 자녀 초대코드로 연결 · 네이버·카카오는 열람만'],
 ['선생님','eduonepass','교육디지털원패스 (교원)','교원 확인 뒤 학교관리자 승인으로 담임·과목 권한 (GPKI는 비교용 A안)'],
 ['정보원 담당자','eduonepass','교육디지털원패스 + 2단계 인증','업무시스템(상담·AI·플랫폼관리) 진입 때 휴대폰 6자리 · 통합관리자는 GPKI 추가']];
/* 인증 수단별 데모 신원 (실제 서비스에서는 IdP가 돌려주는 속성으로 결정됨) */
const DEMO={
 eduonepass:[
  {id:'stu',t:'김서울 · 서울한빛고 2학년',sub:'나이스 재학 정보 → 학생(재학) 자동 부여',person:{name:'김서울',grade:'고2',school:'서울한빛고'},roles:[{k:'student',status:'active',scope:'본인',term:'재학 중'}]},
  {id:'tch',t:'김민정 · 서울고 교원',sub:'교원 속성 → 학교관리자가 담임으로 승인함 (3-1)',person:{name:'김민정',school:'서울고'},roles:[{k:'teacher',status:'active',scope:'3학년 1반 담임',term:'2027학년도'},{k:'parent',status:'active',scope:'자녀 1명 연결',term:'자녀 졸업까지'}]},
  {id:'pend',t:'이정민 · 서울고 교원 (승인 대기)',sub:'교원 속성은 확인됐지만 학교관리자 승인 전 → 권한 0',person:{name:'이정민',school:'서울고'},roles:[{k:'teacher',status:'pending',scope:'담임 신청(자기 선언)',term:'승인 전'}]},
  {id:'cns',t:'박선영 · 정보원 위촉 상담교사',sub:'교원 + 정보원 위촉 승인 → 교사·상담교사 역할 2개',person:{name:'박선영',school:'서울남고'},roles:[{k:'teacher',status:'active',scope:'2학년 과목교사',term:'2027학년도'},{k:'counselor',status:'active',scope:'배정 건',term:'2027.4.1~2028.3.31'}]},
  {id:'adm',t:'이재원 · 서울고 진학부장 (학교관리자)',sub:'교육청 승인으로 학교관리자 승격',person:{name:'이재원',school:'서울고'},roles:[{k:'teacher',status:'active',scope:'진학부장',term:'2027학년도'},{k:'schooladmin',status:'active',scope:'서울고',term:'담당 교체 시 회수'}]},
  {id:'off',grp:'정보원 담당자 (업무시스템)',t:'한지원 · 정보원 상담운영 담당',sub:'내부 RBAC Role 상담운영 → 상담시스템 (위촉·배정 예외·만족도·수당 조서)',person:{name:'한지원',school:'교육연구정보원'},roles:[{k:'office',status:'active',scope:'상담운영 Role',term:'인사 발령',opsRole:'상담운영',ops:['counsel']}]},
  {id:'off2',grp:'정보원 담당자 (업무시스템)',t:'최민호 · 정보원 정산 담당',sub:'상담시스템 중 수당·계좌(정산 개인정보)만 열람 · 계좌 열람은 사유 기록',person:{name:'최민호',school:'교육연구정보원'},roles:[{k:'office',status:'active',scope:'정산 Role',term:'인사 발령',opsRole:'정산',ops:['counsel']}]},
  {id:'off3',grp:'정보원 담당자 (업무시스템)',t:'서다은 · SEN 데이터·AI 관리자',sub:'AI 서비스 관리 (관제·모델 원장·학습데이터·GPU) · 가명 L3·전체 계보',person:{name:'서다은',school:'교육연구정보원'},roles:[{k:'office',status:'active',scope:'데이터·AI Role',term:'인사 발령',opsRole:'데이터·AI',ops:['ai']}]},
  {id:'off4',grp:'정보원 담당자 (업무시스템)',t:'오경수 · 정보원 콘텐츠 담당',sub:'플랫폼관리 중 CMS·자료실·공지·대학 마스터',person:{name:'오경수',school:'교육연구정보원'},roles:[{k:'office',status:'active',scope:'콘텐츠 Role',term:'인사 발령',opsRole:'콘텐츠',ops:['admin']}]},
  {id:'off5',grp:'정보원 담당자 (업무시스템)',t:'강수연 · 정보원 통계 담당',sub:'상담시스템·플랫폼관리의 통계·운영실적 읽기 전용',person:{name:'강수연',school:'교육연구정보원'},roles:[{k:'office',status:'active',scope:'통계 Role (읽기)',term:'인사 발령',opsRole:'통계',ops:['counsel','admin']}]},
  {id:'off6',grp:'정보원 담당자 (업무시스템)',t:'윤태희 · 정보원 시스템관리자 (통합관리자)',sub:'세 업무시스템 모두 · 계정·권한 승인·보안 정책·감사로그 · 2FA + GPKI',person:{name:'윤태희',school:'교육연구정보원'},roles:[{k:'office',status:'active',scope:'시스템 Role (통합관리자)',term:'인사 발령',opsRole:'시스템',ops:['counsel','ai','admin']}]}],
 onepass:[
  {id:'par',t:'김보호 · 학부모 (자녀 연결됨)',sub:'본인확인 L2 + 자녀 김서울 연결(초대코드 승인)',person:{name:'김보호'},roles:[{k:'parent',status:'active',scope:'자녀 김서울 · 기본 동의',term:'자녀 졸업까지'}]},
  {id:'par0',t:'새 학부모 (자녀 연결 전)',sub:'본인확인은 됐지만 자녀 연결 전 → 열람 항목 없음',person:{name:'새 학부모'},roles:[{k:'parent',status:'pending',scope:'자녀 연결 전',term:'—'}]},
  {id:'stu2',t:'재수생 (비재학)',sub:'학적 연동 없음 → 응시연도 자기신고 트랙',person:{name:'비재학 학생'},roles:[{k:'student2',status:'active',scope:'본인(자기신고)',term:'—'}]}],
 naver:[{id:'n1',t:'네이버 계정',sub:'일반 사용자(L1). 열람·알림·관심 저장만',person:{name:'네이버 사용자'},roles:[]}],
 kakao:[{id:'k1',t:'카카오 계정',sub:'일반 사용자(L1). 열람·알림·관심 저장만',person:{name:'카카오 사용자'},roles:[]}]};
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){return null;}};
let S=load();
const syncLegacy=()=>{localStorage.setItem(LEGACY,S?'full':'guest');};
const A={
 get state(){return localStorage.getItem(LEGACY)||'guest';},
 logged(){return !!S;},
 get session(){return S;},
 get role(){if(!S)return 'guest';const r=S.roles[S.cur];return r?r.k:'guest';},
 get roleObj(){return S?S.roles[S.cur]||null:null;},
 get level(){return S?S.level:0;},
 get name(){return S?S.person.name:'';},
 roleLabel(k){return ROLE_LABEL[k]||k;},
 home(){const r=this.roleObj;if(r&&r.k==='office'&&r.ops&&r.ops.length){const f={counsel:'ops-counsel.html',ai:'ops-ai.html',admin:'ops-admin.html'};return f[r.ops[0]];}return ROLE_HOME[this.role]||'index.html';},
 /* 레거시 호출(login(true/false))은 학생 데모로 */
 login(has){const d=DEMO.eduonepass[0];this.signIn('eduonepass',d);if(has===false)localStorage.setItem(LEGACY,'empty');},
 signIn(idp,demo){S={idp,level:IDP[idp].level,person:demo.person,roles:demo.roles,cur:0,at:Date.now()};localStorage.setItem(KEY,JSON.stringify(S));syncLegacy();fire();},
 addRole(r){if(!S)return;const i=S.roles.findIndex(x=>x.k===r.k);if(i>-1)S.roles[i]=r;else S.roles.push(r);localStorage.setItem(KEY,JSON.stringify(S));fire();},
 switchRole(i){if(!S||!S.roles[i])return;S.cur=i;localStorage.setItem(KEY,JSON.stringify(S));fire();},
 logout(){S=null;localStorage.removeItem(KEY);localStorage.setItem(LEGACY,'guest');fire();},
 /* 보증 수준 올리기: 필요한 수준 미달이면 안내 모달 */
 need(level,why){if(this.level>=level)return true;openStep(level,why);return false;},
 /* Step-up 2FA (승인권·상담교사 배정 건·관리자 기능): 성공 시 resolve */
 stepUp(why){return new Promise(res=>{open2fa(why,res);});}
};
const fire=()=>{renderWho();document.dispatchEvent(new CustomEvent('sen-auth'));};
window.SEN_AUTH=A;window.SEN_ROLES=ROLE_LABEL;
/* ── 스타일 ── */
const css=`.who{display:inline-flex;gap:10px;align-items:center;flex-wrap:wrap}
.who__role{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;background:var(--surface);font-size:12.5px;font-weight:800;color:var(--ink-2)}
.who__role b{color:var(--brand)}.who__lv{font-size:11px;color:var(--ink-3);font-weight:700}
.who select{font:inherit;font-size:12.5px;font-weight:700;padding:3px 8px;border-radius:999px;border:1px solid var(--line);background:var(--bg);color:var(--ink)}
.lmodal{position:fixed;inset:0;z-index:95;display:grid;place-items:center;padding:20px;background:rgba(10,12,18,.5);opacity:0;visibility:hidden;transition:opacity .2s,visibility .2s}
.lmodal.is-on{opacity:1;visibility:visible}
.lmodal__p{width:min(520px,100%);max-height:92vh;overflow:auto;background:var(--bg);border-radius:var(--radius-xl);padding:28px;position:relative;display:flex;flex-direction:column;gap:14px}
.lmodal__p h2{margin:0;font-size:21px;font-weight:900}.lmodal__p h3{margin:0;font-size:15px;font-weight:800}
.lmodal__x{position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:50%;background:var(--surface)}
.idp{display:grid;gap:8px}.idp button{display:flex;align-items:center;gap:12px;text-align:left;padding:12px 14px;border:1.5px solid var(--line);border-radius:var(--radius-md);background:var(--bg);font:inherit;color:var(--ink)}
.idp button:hover{border-color:var(--brand)}.idp b{display:block;font-size:15px}.idp small{display:block;color:var(--ink-3);font-size:12.5px}
.idp .lv{margin-left:auto;flex:none;font-size:11.5px;font-weight:800;padding:3px 8px;border-radius:999px;background:var(--surface);color:var(--ink-2)}
.idp .lv--3{background:color-mix(in srgb,var(--brand) 14%,transparent);color:var(--brand)}
.idp .idp__who{color:var(--brand);font-weight:700;margin-top:2px}
.lm-way{display:grid;gap:6px;padding:10px;border-radius:var(--radius-md);background:var(--surface)}
.lm-way__t{margin:0 0 2px;font-size:13px;font-weight:800;color:var(--ink-2)}
.lm-way__r{display:grid;grid-template-columns:88px minmax(0,1fr) auto;gap:10px;align-items:center;text-align:left;padding:9px 10px;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--bg);font:inherit;color:var(--ink);cursor:pointer}
.lm-way__r:hover{border-color:var(--brand)}
.lm-way__role{font-size:13.5px;font-weight:900;color:var(--brand)}
.lm-way__m b{display:block;font-size:13.5px}.lm-way__m small{display:block;color:var(--ink-3);font-size:11.5px;line-height:1.4}
.lm-way__lv{flex:none;font-size:11px;font-weight:800;padding:2px 7px;border-radius:999px;background:var(--bg);border:1px solid var(--line);color:var(--ink-2)}
.lm-way__lv.lv--3{background:color-mix(in srgb,var(--brand) 14%,transparent);color:var(--brand);border-color:transparent}
@media (max-width:430px){.lm-way__r{grid-template-columns:minmax(0,1fr) auto}.lm-way__role{grid-column:1/-1}}
.demo{display:grid;gap:6px}.demo button{text-align:left;padding:10px 12px;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--surface);font:inherit;color:var(--ink)}
.demo button:hover{border-color:var(--brand)}.demo b{display:block;font-size:14px}.demo small{color:var(--ink-3);font-size:12px}
.fld{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:700;color:var(--ink-2)}
.fld input{font:inherit;font-size:15px;padding:12px 14px;border-radius:var(--radius-md);border:1.5px solid var(--line);background:var(--bg);color:var(--ink);outline:0}
.fld input:focus{border-color:var(--brand)}
.lm-err{display:none;font-size:13.5px;color:#C43B3B;font-weight:700;margin:-4px 0 0}.lm-err.is-on{display:block}
.lm-note{font-size:12.5px;color:var(--ink-3);margin:0;line-height:1.5}
.lm-steps{display:flex;gap:6px;flex-wrap:wrap}.lm-steps span{font-size:12px;font-weight:800;padding:4px 10px;border-radius:999px;background:var(--surface);color:var(--ink-3)}.lm-steps span.is-on{background:var(--brand);color:#fff}
.lm-res{border:1.5px solid var(--line);border-radius:var(--radius-md);padding:12px 14px;font-size:13.5px;display:grid;gap:4px}.lm-res b{font-size:14.5px}
.cbx2{display:flex;gap:8px;align-items:flex-start;font-size:13.5px;font-weight:600;color:var(--ink-2)}
.gatebox{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:24px;align-items:center;background:linear-gradient(135deg,#1E5EFF,#7B5CFF);color:#fff;border-radius:var(--radius-xl);padding:32px 36px;box-shadow:var(--shadow-2)}
.gatebox__ic{width:64px;height:64px;border-radius:20px;background:rgba(255,255,255,.18);display:grid;place-items:center;font-size:28px}
.gatebox h3{margin:0 0 6px;font-size:22px;font-weight:900}.gatebox p{margin:0;opacity:.92}.gatebox .btn{background:#fff;color:var(--brand)}
@media (max-width:860px){.gatebox{grid-template-columns:1fr}}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
/* ── 모달 ── */
const m=document.createElement('div');m.className='lmodal';m.id='lmodal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');document.body.appendChild(m);
const close=()=>m.classList.remove('is-on');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const idpList=(mode)=>`<div class="idp">${Object.entries(IDP).map(([k,v])=>`<button data-idp="${k}" data-mode="${mode}"><span><b>${v.name}</b><small>${v.desc}</small><small class="idp__who">주 사용 : ${v.who}</small></span><span class="lv lv--${v.level}">L${v.level}</span></button>`).join('')}</div>`;
const mainWay=()=>`<div class="lm-way"><p class="lm-way__t">누가 어떻게 로그인하나요?</p>${MAIN_WAY.map(([r,k,n,d])=>`<button type="button" class="lm-way__r" data-idp="${k}" data-mode="login"><span class="lm-way__role">${r}</span><span class="lm-way__m"><b>${n}</b><small>${d}</small></span><span class="lm-way__lv lv--${IDP[k].level}">L${IDP[k].level}</span></button>`).join('')}</div>`;
function openLogin(){m.innerHTML=`<div class="lmodal__p"><button type="button" class="lmodal__x" data-lmclose aria-label="닫기">✕</button><h2>로그인</h2><p class="lm-note">역할(학생·학부모·교사)을 고르지 않아요. 인증 수단이 확인해 주는 학적·교원 정보와 학교 승인으로 역할이 자동으로 붙어요.</p>
  ${mainWay()}
  <p class="lm-note" style="margin-top:2px;font-weight:800;color:var(--ink-2)">인증 수단 고르기</p>
  ${idpList('login')}
  <details><summary style="cursor:pointer;font-size:13.5px;font-weight:700;color:var(--ink-2)">아이디·비밀번호로 로그인</summary><form id="lmForm" novalidate style="display:grid;gap:10px;margin-top:10px"><label class="fld">아이디<input name="id" autocomplete="username" placeholder="통합 계정 아이디"></label><label class="fld">비밀번호<input name="pw" type="password" autocomplete="current-password" placeholder="비밀번호"></label><p class="lm-err">아이디와 비밀번호를 입력해 주세요</p><button class="btn btn--primary btn--pill" type="submit" style="padding:13px">로그인</button><p class="lm-note">10자 이상 · 90일 변경 · 5회 실패 시 잠금(본인확인 재인증으로 해제) · 아이디 로그인은 인증 수단을 연결한 뒤에만 쓸 수 있어요</p></form></details>
  <p class="lm-note">아직 계정이 없나요? <a href="#" class="link" data-joinopen>회원가입</a> · 목업: 인증 수단을 누르면 데모 신원을 고를 수 있어요</p></div>`;m.classList.add('is-on');}
function openDemo(idp,mode){const v=IDP[idp];m.innerHTML=`<div class="lmodal__p"><button type="button" class="lmodal__x" data-lmclose aria-label="닫기">✕</button><h2>${v.name}에서 돌아왔어요</h2><p class="lm-note">실제 서비스에서는 ${v.name}가 확인한 정보로 아래 중 하나가 자동으로 정해져요. 목업이니 직접 골라 보세요.</p>
  <div class="demo">${(()=>{let g='';return DEMO[idp].map(d=>{let h='';if((d.grp||'')!==g){g=d.grp||'';if(g)h=`<p class="lm-note" style="margin:8px 0 2px;font-weight:800;color:var(--ink-2)">${esc(g)}</p>`;}return h+`<button data-demo="${d.id}" data-idp="${idp}" data-mode="${mode}"><b>${esc(d.t)}</b><small>${esc(d.sub)}</small></button>`;}).join('');})()}</div>
  <p class="lm-note"><a href="#" class="link" data-loginopen>← 다른 수단으로</a></p></div>`;}
function openJoin(){m.innerHTML=`<div class="lmodal__p"><button type="button" class="lmodal__x" data-lmclose aria-label="닫기">✕</button><h2>회원가입</h2><div class="lm-steps"><span class="is-on">① 인증 수단</span><span>② 본인 확인</span><span>③ 역할 확인</span><span>④ 동의</span></div>
  <p class="lm-note">역할을 고르는 단계는 없어요. 재학생은 교육디지털원패스로 학교·학년·반이 자동으로 들어오고, 교사는 교원 확인 뒤 학교 담당자(관리자) 승인을 받아야 권한이 생겨요. 학부모는 디지털원패스 본인확인 뒤 자녀를 연결해요.</p>
  ${idpList('join')}
  <p class="lm-note">이미 계정이 있나요? <a href="#" class="link" data-loginopen>로그인</a></p></div>`;m.classList.add('is-on');}
function openJoinResult(idp,d){const roles=d.roles;const v=IDP[idp];const minor=d.id==='stu';
  m.innerHTML=`<div class="lmodal__p"><button type="button" class="lmodal__x" data-lmclose aria-label="닫기">✕</button><h2>회원가입</h2><div class="lm-steps"><span>① 인증 수단</span><span>② 본인 확인</span><span class="is-on">③ 역할 확인</span><span>④ 동의</span></div>
  <div class="lm-res"><b>${esc(d.person.name)} · ${v.name} 확인됨 (보증 수준 L${v.level})</b>${roles.length?roles.map(r=>`<span>${ROLE_LABEL[r.k]} · ${esc(r.scope)} · ${r.status==='active'?'<b style="color:var(--accent-green,#1f9d55)">바로 사용</b>':'<b style="color:#C43B3B">승인 전 권한 없음</b>'}</span>`).join(''):'<span>부여되는 역할 없음 → 일반 사용자(열람·알림·관심 저장). 자녀 연결이나 학적 연동이 필요하면 디지털원패스·교육디지털원패스를 추가로 연결해요</span>'}</div>
  ${roles.some(r=>r.k==='teacher'&&r.status==='pending')?'<p class="lm-note">교사 역할은 자기 선언만으로는 생기지 않아요. 학교 담당자(관리자)가 나이스 편성표를 보고 승인하면 담당 학생 범위가 붙고, 그때까지는 로그인은 되지만 학생 정보는 볼 수 없어요.</p>':''}
  ${minor?'<label class="cbx2"><input type="checkbox" id="jMinor"> 만 14세 미만이면 법정대리인 동의가 필요해요 (해당 시 체크)</label>':''}
  <label class="cbx2"><input type="checkbox" id="j1"> [필수] 개인정보 수집·이용 동의 : 성명·소속·연락처 (계정 관리 목적)</label>
  ${roles.some(r=>r.k==='teacher'||r.k==='counselor'||r.k==='schooladmin')?'<label class="cbx2"><input type="checkbox" id="j2"> [필수] 학생 개인정보 취급 서약 : 담당 학생 외 열람 금지 · 모든 열람은 이력으로 기록됨에 동의</label>':''}
  <p class="lm-err" id="jErr">필수 동의에 체크해 주세요</p>
  <button class="btn btn--primary btn--pill" style="padding:13px" data-joindone="${d.id}" data-idp="${idp}">가입하고 시작하기</button>
  <p class="lm-note">가입 뒤 세션 30분(관리자 15분) · 1년 미접속 시 휴면 · 역할마다 임기가 있어 만료되면 삭제가 아니라 상태가 바뀌어요</p></div>`;}
function openStep(level,why){const need=level>=3?'교육디지털원패스':'디지털원패스';m.innerHTML=`<div class="lmodal__p"><button type="button" class="lmodal__x" data-lmclose aria-label="닫기">✕</button><h2>본인확인이 더 필요해요</h2><p class="lm-note">${esc(why||'이 기능')}은(는) 보증 수준 L${level}(${need})이 필요해요. 지금 계정은 L${A.level}이에요. 계정은 그대로 두고 ${need}를 연결하면 돼요.</p><div class="idp"><button data-idp="${level>=3?'eduonepass':'onepass'}" data-mode="login"><span><b>${need} 연결</b><small>연결하면 계정 보증 수준이 L${level}로 올라가요</small></span><span class="lv lv--${level}">L${level}</span></button></div></div>`;m.classList.add('is-on');}
function open2fa(why,res){m.innerHTML=`<div class="lmodal__p"><button type="button" class="lmodal__x" data-lmclose aria-label="닫기">✕</button><h2>추가 확인 (2단계 인증)</h2><p class="lm-note">${esc(why||'이 작업')}은(는) 승인권이 걸린 기능이라 한 번 더 확인해요. 등록된 휴대폰으로 보낸 6자리 숫자를 입력하세요.</p><form id="tfaForm" novalidate style="display:grid;gap:10px"><label class="fld">인증번호<input name="code" inputmode="numeric" maxlength="6" placeholder="목업: 아무 6자리"></label><p class="lm-err">6자리 숫자를 입력해 주세요</p><button class="btn btn--primary btn--pill" type="submit" style="padding:13px">확인</button><p class="lm-note">휴대폰을 쓸 수 없으면 학교 담당자(관리자)에게 임시 코드를 요청하거나 GPKI 인증서로 대신할 수 있어요 (비교용 A안)</p></form></div>`;m.classList.add('is-on');
  m.querySelector('#tfaForm').addEventListener('submit',e=>{e.preventDefault();const v=e.target.code.value.trim();if(!/^\d{6}$/.test(v)){m.querySelector('.lm-err').classList.add('is-on');return;}close();res(true);});}
A.open=openLogin;A.openJoin=openJoin;
m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-lmclose]')){close();return;}
  const j=e.target.closest('[data-joindone]');if(j){const ok=m.querySelector('#j1').checked&&(!m.querySelector('#j2')||m.querySelector('#j2').checked);if(!ok){m.querySelector('#jErr').classList.add('is-on');return;}const demo=DEMO[j.dataset.idp].find(x=>x.id===j.dataset.joindone);A.signIn(j.dataset.idp,demo);close();window.showToast&&showToast(`${demo.person.name} 님, 가입했어요`);return;}
  const b=e.target.closest('[data-idp]');if(b&&!b.dataset.demo){e.preventDefault();openDemo(b.dataset.idp,b.dataset.mode||'login');return;}
  const d=e.target.closest('[data-demo]');if(d){e.preventDefault();const demo=DEMO[d.dataset.idp].find(x=>x.id===d.dataset.demo);if(d.dataset.mode==='join'){openJoinResult(d.dataset.idp,demo);}else{A.signIn(d.dataset.idp,demo);close();window.showToast&&showToast(`${demo.person.name} 님, ${A.roleObj?ROLE_LABEL[A.role]+'(으)로':'일반 사용자로'} 로그인했어요`);}return;}
  if(e.target.closest('[data-joinopen]')){e.preventDefault();openJoin();return;}
  if(e.target.closest('[data-loginopen]')){e.preventDefault();openLogin();return;}});
m.addEventListener('submit',e=>{if(e.target.id!=='lmForm')return;e.preventDefault();const f=e.target;if(!f.id.value.trim()||!f.pw.value.trim()){f.querySelector('.lm-err').classList.add('is-on');return;}f.pw.value='';A.signIn('eduonepass',DEMO.eduonepass[0]);close();window.showToast&&showToast('김서울 님, 환영합니다');});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
/* ── 헤더 ── */
const util=document.querySelector('.brandbar__util');let who=document.getElementById('who');
if(util&&!who){const old=util.querySelector('a');who=document.createElement('span');who.className='who';who.id='who';old?old.replaceWith(who):util.prepend(who);
  const join=util.querySelector('a[data-toast*="회원가입"]');if(join){join.removeAttribute('data-toast');join.setAttribute('data-joinopen','');}}
function renderWho(){if(!who)return;
  if(!A.logged()){who.innerHTML='<a href="#" data-loginopen>로그인</a>';return;}
  const r=A.roleObj,roles=S.roles;
  const sw=roles.length>1?`<select data-roleswitch aria-label="역할 전환">${roles.map((x,i)=>`<option value="${i}"${i===S.cur?' selected':''}>${ROLE_LABEL[x.k]}${x.status==='pending'?' (승인 대기)':''}</option>`).join('')}</select>`:'';
  who.innerHTML=`<span style="color:var(--ink)">${esc(A.name)} 님</span><span class="who__role"><b>${r?ROLE_LABEL[r.k]:'일반 사용자'}</b>${r&&r.status==='pending'?'<span style="color:#C43B3B">승인 대기</span>':''}<span class="who__lv">L${A.level}</span></span>${sw}<a href="${A.home()}" style="font-size:13px">내 공간</a><a href="#" data-logout>로그아웃</a>`;}
document.addEventListener('click',e=>{if(e.target.closest('[data-loginopen]')){e.preventDefault();openLogin();}if(e.target.closest('[data-joinopen]')){e.preventDefault();openJoin();}if(e.target.closest('[data-logout]')){e.preventDefault();A.logout();window.showToast&&showToast('로그아웃했어요');}});
document.addEventListener('change',e=>{const s=e.target.closest('[data-roleswitch]');if(!s)return;const i=+s.value,r=S.roles[i];
  if(r&&(r.k==='counselor'||r.k==='schooladmin'||r.k==='office')){A.stepUp(ROLE_LABEL[r.k]+' 역할로 전환').then(()=>{A.switchRole(i);window.showToast&&showToast(ROLE_LABEL[r.k]+' 역할로 전환했어요');});s.value=S.cur;}else{A.switchRole(i);}});
A.gate=(icon,title,desc)=>`<div class="gatebox"><div class="gatebox__ic">${icon}</div><div><h3>${title}</h3><p>${desc}</p></div><button class="btn btn--pill" data-loginopen>로그인하고 이용하기 →</button></div>`;
renderWho();
})();
