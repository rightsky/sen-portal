(function(){
const {RIASEC,JOBS,MAJORS,MAJOR_CATS,store,job,major,drawer}=EX;
const $=id=>document.getElementById(id);
const SUBJ=[...new Set(MAJORS.flatMap(m=>m.subjects))];
const st={q:'',cats:new Set(),subj:'',sort:'name',sel:null,mine:false};
const bar=(v,c)=>`<div class="score__t" style="flex:1"><div class="score__f" style="width:${v}%;${c?'background:'+c:''}"></div></div>`;
function card(m){
  const sv=store.isSaved('majors',m.id),cm=store.isCmp('majors',m.id);
  return `<article class="xcard" data-open="${m.id}" tabindex="0">
    <div class="xcard__top"><div><span class="xcard__cat">${m.cat}계열</span><h3>${m.name}</h3></div>
    <button class="save${sv?' is-on':''}" data-save="${m.id}" aria-label="${m.name} 관심 저장">${sv?'❤️':'🤍'}</button></div>
    <p>${m.desc}</p>
    <div class="ria">${m.subjects.slice(0,3).map(s=>`<span>${s}</span>`).join('')}</div>
    <div class="ind"><div>취업률 <b style="color:var(--ink)">${m.emp}%</b></div><div>진학률 <b style="color:var(--ink)">${m.grad}%</b></div><div>관련 직업 <b style="color:var(--ink)">${m.jobs.length}개</b></div><div>개설 대학 <b style="color:var(--ink)">${m.unis}곳</b></div></div>
    <div class="xcard__act"><button class="mini${cm?' is-on':''}" data-cmp="${m.id}">${cm?'✓ 비교함에 담김':'+ 비교함 담기'}</button></div>
  </article>`;
}
function renderFind(){
  $('fCat').innerHTML=MAJOR_CATS.map(c=>`<button class="fchip${st.cats.has(c)?' is-on':''}" data-v="${c}">${c}</button>`).join('');
  $('fSubj').innerHTML=['',...SUBJ].map(s=>`<option value="${s}"${st.subj===s?' selected':''}>${s||'전체 과목'}</option>`).join('');
  const q=st.q.trim();
  let list=MAJORS.filter(m=>(!q||(m.name+m.desc+m.learn.join('')+m.subjects.join('')).includes(q))&&(!st.cats.size||st.cats.has(m.cat))&&(!st.subj||m.subjects.includes(st.subj)));
  list.sort((a,b)=>st.sort==='emp'?b.emp-a.emp:st.sort==='grad'?b.grad-a.grad:a.name.localeCompare(b.name,'ko'));
  $('cnt').innerHTML=`학과 <em>${list.length}</em>개`;
  $('grid').innerHTML=list.length?list.map(card).join(''):`<div class="empty-r" style="grid-column:1/-1"><b>조건에 맞는 학과가 없어요</b>필터를 줄이거나 다른 검색어로 찾아보세요.</div>`;
}
/* 연결보기 */
function rel(){
  const s=st.sel,R={j:new Set(),m:new Set(),s:new Set()};if(!s)return R;
  if(s.t==='j'){const j=job(s.id);j.majors.forEach(x=>R.m.add(x));j.majors.forEach(x=>major(x).subjects.forEach(y=>R.s.add(y)));}
  if(s.t==='m'){const m=major(s.id);m.jobs.forEach(x=>R.j.add(x));JOBS.filter(j=>j.majors.includes(s.id)).forEach(j=>R.j.add(j.id));m.subjects.forEach(y=>R.s.add(y));}
  if(s.t==='s'){MAJORS.filter(m=>m.subjects.includes(s.id)).forEach(m=>{R.m.add(m.id);JOBS.filter(j=>j.majors.includes(m.id)).forEach(j=>R.j.add(j.id));});}
  return R;
}
function renderLink(){
  const R=rel(),s=st.sel,mineJ=store.list('jobs'),mineM=store.list('majors');
  let js=JOBS,ms=MAJORS,ss=SUBJ;
  if(st.mine){js=JOBS.filter(j=>mineJ.includes(j.id)||R.j.has(j.id)||(s&&s.t==='j'&&s.id===j.id));ms=MAJORS.filter(m=>mineM.includes(m.id)||R.m.has(m.id)||(s&&s.t==='m'&&s.id===m.id));const keep=new Set(ms.flatMap(m=>m.subjects));ss=SUBJ.filter(x=>keep.has(x));}
  const it=(t,id,name,mine)=>{const sel=s&&s.t===t&&s.id===id,r=R[t].has(id);return `<button class="lv__it${sel?' is-sel':''}${r?' is-rel':''}${mine?' is-mine':''}" data-lv="${t}:${id}">${name}</button>`;};
  $('lv').classList.toggle('has-sel',!!s);
  $('lvJ').innerHTML=`<h3>직업 <span>${js.length}</span></h3>`+js.map(j=>it('j',j.id,j.name,mineJ.includes(j.id))).join('');
  $('lvM').innerHTML=`<h3>대학 학과 <span>${ms.length}</span></h3>`+ms.map(m=>it('m',m.id,m.name,mineM.includes(m.id))).join('');
  $('lvS').innerHTML=`<h3>고교 선택과목 <span>${ss.length}</span></h3>`+ss.map(x=>it('s',x,x,false)).join('');
  $('lvToggle').classList.toggle('is-on',st.mine);
  /* 상세 */
  if(!s){$('lvDetail').innerHTML=`<div><h3>항목을 하나 눌러보세요</h3><p>직업을 누르면 관련 학과와 고교 과목이, 과목을 누르면 그 과목과 이어지는 학과·직업이 표시됩니다.</p></div>`;}
  else if(s.t==='j'){const j=job(s.id);$('lvDetail').innerHTML=`<div><h3>${j.name}</h3><p>관련 학과 ${R.m.size}개 · 고교에서 들어두면 좋은 과목 ${R.s.size}개</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn--ghost btn--pill" href="jinro-job.html?open=${j.id}#find">직업 상세 보기</a><button class="btn btn--primary btn--pill" data-toast="과목 선택 시뮬레이션(학교·과목설계)으로 이 과목들을 담아 이동합니다">이 과목으로 학업설계 →</button></div>`;}
  else if(s.t==='m'){const m=major(s.id);$('lvDetail').innerHTML=`<div><h3>${m.name}</h3><p>진출 직업 ${R.j.size}개 · 관련 고교 과목 ${R.s.size}개 · 취업률 ${m.emp}%</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn--ghost btn--pill" data-open="${m.id}">학과 상세 보기</button><button class="btn btn--primary btn--pill" data-toast="과목 선택 시뮬레이션(학교·과목설계)으로 이 과목들을 담아 이동합니다">이 과목으로 학업설계 →</button></div>`;}
  else {$('lvDetail').innerHTML=`<div><h3>${s.id}</h3><p>이 과목과 이어지는 학과 ${R.m.size}개 · 직업 ${R.j.size}개</p></div><button class="btn btn--ghost btn--pill" data-toast="선택과목 알아보기(학교·과목설계) 화면으로 이동합니다">과목 소개 보기</button>`;}
  requestAnimationFrame(drawLines);
}
function drawLines(){
  const svg=$('lvSvg'),box=$('lv').getBoundingClientRect();svg.innerHTML='';const s=st.sel;if(!s||innerWidth<=860)return;
  const el=(t,id)=>$('lv').querySelector(`[data-lv="${t}:${CSS.escape(id)}"]`);
  const pos=(e,side)=>{const r=e.getBoundingClientRect();return [side==='r'?r.right-box.left:r.left-box.left,r.top-box.top+r.height/2];};
  const line=(a,b)=>{if(!a||!b)return;const p=pos(a,'r'),q=pos(b,'l'),dx=(q[0]-p[0])/2;svg.insertAdjacentHTML('beforeend',`<path d="M${p[0]},${p[1]} C${p[0]+dx},${p[1]} ${q[0]-dx},${q[1]} ${q[0]},${q[1]}"/>`);};
  const R=rel();
  if(s.t==='j'){R.m.forEach(m=>{line(el('j',s.id),el('m',m));major(m).subjects.forEach(x=>line(el('m',m),el('s',x)));});}
  if(s.t==='m'){R.j.forEach(j=>line(el('j',j),el('m',s.id)));R.s.forEach(x=>line(el('m',s.id),el('s',x)));}
  if(s.t==='s'){R.m.forEach(m=>{line(el('m',m),el('s',s.id));JOBS.filter(j=>j.majors.includes(m)).forEach(j=>line(el('j',j.id),el('m',m)));});}
}
addEventListener('resize',()=>{if(tab==='link')drawLines();});
/* 비교 */
function renderCompare(){
  const saved=store.list('majors'),cmp=store.cmp('majors');
  $('cpick').innerHTML=saved.map(id=>{const m=major(id),on=cmp.includes(id);return `<label class="${on?'is-on':''}"><input type="checkbox" data-cmpchk="${id}"${on?' checked':''}>${m.name}<button data-save="${id}" aria-label="${m.name} 관심 해제">✕</button></label>`;}).join('');
  $('cmpCount').textContent=`관심 학과 ${saved.length}개 · 비교 중 ${cmp.length}/3`;
  if(!cmp.length){$('ctable').innerHTML=`<div class="empty-r"><b>${saved.length?'비교할 학과를 골라주세요':'아직 저장한 학과가 없어요'}</b>${saved.length?'위 목록에서 최대 3개까지 체크하면 나란히 비교합니다.':'학과 찾기에서 🤍를 눌러 관심 학과를 저장하세요.'}</div>`;return;}
  const ms=cmp.map(major);
  const best=f=>{const v=ms.map(f),mx=Math.max(...v);return v.map(x=>ms.length>1&&x===mx&&v.filter(y=>y===mx).length<ms.length);};
  const row=(t,f,num)=>{const b=num?best(num):ms.map(()=>false);return `<tr><th>${t}</th>${ms.map((m,i)=>`<td class="${b[i]?'best':''}">${f(m)}</td>`).join('')}</tr>`;};
  $('ctable').innerHTML=`<div class="ctable-w"><table class="ctable"><thead><tr><th></th>${ms.map(m=>`<th>${m.name}<div class="xcard__cat" style="margin-top:4px">${m.cat}계열</div></th>`).join('')}</tr></thead><tbody>
  ${row('취업률',m=>`<b style="font-size:20px">${m.emp}%</b><div style="display:flex;margin-top:6px">${bar(m.emp)}</div>`,m=>m.emp)}
  ${row('진학률',m=>`<b style="font-size:20px">${m.grad}%</b><div style="display:flex;margin-top:6px">${bar(m.grad,'var(--accent-purple)')}</div>`,m=>m.grad)}
  ${row('개설 대학',m=>`${m.unis}곳`,m=>m.unis)}
  ${row('주요 교과목',m=>m.learn.join(', '))}
  ${row('고교 관련 과목',m=>`<div class="lchips">${m.subjects.map(x=>`<span>${x}</span>`).join('')}</div>`)}
  ${row('진출 직업',m=>`<div class="lchips">${m.jobs.map(j=>`<a href="jinro-job.html?open=${j}#find">${job(j).name}</a>`).join('')}</div>`)}
  </tbody></table></div>`;
}
function openMajor(id){
  const m=major(id);if(!m)return;const sv=store.isSaved('majors',id),cm=store.isCmp('majors',id);
  drawer.open(`<div class="dh"><small>${m.cat}계열 · 학과정보</small><h2>${m.name}</h2><p>${m.desc}</p></div>
  <div class="dact"><button class="btn ${sv?'btn--ghost':'btn--primary'} btn--pill" data-save="${id}" data-redraw="${id}">${sv?'❤️ 저장됨':'🤍 관심 저장'}</button><button class="btn btn--ghost btn--pill" data-cmp="${id}" data-redraw="${id}">${cm?'✓ 비교함에 담김':'+ 비교함 담기'}</button></div>
  <div class="dsec"><h3>졸업 후 진로</h3><dl class="dgrid"><div><dt>취업률</dt><dd>${m.emp}% ${bar(m.emp)}</dd></div><div><dt>진학률</dt><dd>${m.grad}% ${bar(m.grad,'var(--accent-purple)')}</dd></div><div><dt>개설 대학</dt><dd>${m.unis}곳</dd></div><div><dt>계열</dt><dd>${m.cat}</dd></div></dl></div>
  <div class="dsec"><h3>대학에서 배우는 것</h3><div class="lchips">${m.learn.map(x=>`<span>${x}</span>`).join('')}</div></div>
  <div class="dsec"><h3>고교에서 들어두면 좋은 과목</h3><div class="lchips">${m.subjects.map(x=>`<span>${x}</span>`).join('')}</div></div>
  <div class="dsec"><h3>진출 직업</h3><div class="lchips">${m.jobs.map(j=>`<a href="jinro-job.html?open=${j}#find">${job(j).name}</a>`).join('')}</div></div>
  <div class="dsec" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn--ghost btn--pill" style="flex:1" data-lvgo="m:${id}">연결 보기 →</button><button class="btn btn--ghost btn--pill" style="flex:1" data-toast="대학·전형탐색 > 대학·학과 상세로 이동합니다">개설 대학 보기 →</button></div>
  <p class="dsrc">※ 출처: 커리어넷 학과정보·워크넷 학과정보 구조 참고 (화면의 수치는 예시입니다)</p>`);
}
function renderTray(){const c=store.cmp('majors');$('tray').classList.toggle('is-on',c.length>0&&tab!=='compare');$('trayN').textContent=`비교함 ${c.length}/3`;$('trayItems').innerHTML=c.map(id=>`<span>${major(id).name}</span>`).join('');}
function rerender(){if(tab==='find')renderFind();if(tab==='link')renderLink();if(tab==='compare')renderCompare();renderTray();$('tabSaved').textContent=store.list('majors').length;}
let tab='find';const L3={find:'학과 찾기',link:'직업-학과 연결보기',compare:'학과 비교·관심저장'};
function setTab(){tab=(location.hash||'#find').slice(1);if(!L3[tab])tab='find';
  document.querySelectorAll('.ptab').forEach(t=>t.classList.toggle('is-on',t.dataset.tab===tab));
  document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('is-on',p.id==='pane-'+tab));
  document.querySelectorAll('#lnb a').forEach(a=>a.classList.toggle('is-cur',a.getAttribute('href')==='jinro-major.html#'+tab));
  $('crumbL3').textContent=L3[tab];document.title=L3[tab]+' | 서울 진로진학 통합플랫폼';rerender();}
$('lnb').dataset.current=L3[(location.hash||'#find').slice(1)]||'학과 찾기';
window.addEventListener('hashchange',()=>{setTab();window.scrollTo({top:document.querySelector('.ptabs').offsetTop-90,behavior:'smooth'});});
let tq;$('q').addEventListener('input',e=>{clearTimeout(tq);tq=setTimeout(()=>{st.q=e.target.value;renderFind();},150);});
$('kw').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$('q').value=b.textContent;st.q=b.textContent;renderFind();});
$('fCat').addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b){st.cats.has(b.dataset.v)?st.cats.delete(b.dataset.v):st.cats.add(b.dataset.v);renderFind();}});
$('fSubj').addEventListener('change',e=>{st.subj=e.target.value;renderFind();});
$('fReset').addEventListener('click',()=>{st.cats.clear();st.subj='';st.q='';$('q').value='';renderFind();});
$('sort').addEventListener('change',e=>{st.sort=e.target.value;renderFind();});
$('lvToggle').addEventListener('click',()=>{st.mine=!st.mine;renderLink();});
$('lvClear').addEventListener('click',()=>{st.sel=null;renderLink();});
$('cpick').addEventListener('change',e=>{const c=e.target.closest('[data-cmpchk]');if(!c)return;const r=store.toggleCmp('majors',c.dataset.cmpchk);if(r==='full'){c.checked=false;showToast('최대 3개까지 비교할 수 있어요');return;}rerender();});
const parseSel=v=>{const i=v.indexOf(':');return {t:v.slice(0,i),id:v.slice(i+1)};};
document.addEventListener('click',e=>{
  const lvg=e.target.closest('[data-lvgo]');if(lvg){drawer.close();st.sel=parseSel(lvg.dataset.lvgo);location.hash='#link';if(tab==='link')renderLink();return;}
  const lv=e.target.closest('[data-lv]');if(lv){const s=parseSel(lv.dataset.lv);st.sel=st.sel&&st.sel.t===s.t&&st.sel.id===s.id?null:s;renderLink();return;}
  const sv=e.target.closest('[data-save]');if(sv){e.preventDefault();e.stopPropagation();const on=store.toggleSave('majors',sv.dataset.save);showToast(on?'관심 학과에 저장했어요 · 나의 진로진학에서도 볼 수 있어요':'관심 학과에서 뺐어요');rerender();if(sv.dataset.redraw)openMajor(sv.dataset.redraw);return;}
  const cm=e.target.closest('[data-cmp]');if(cm){e.preventDefault();e.stopPropagation();const r=store.toggleCmp('majors',cm.dataset.cmp);showToast(r==='full'?'비교함은 최대 3개까지 담을 수 있어요':r==='on'?'비교함에 담았어요':'비교함에서 뺐어요');rerender();if(cm.dataset.redraw)openMajor(cm.dataset.redraw);return;}
  const op=e.target.closest('[data-open]');if(op)openMajor(op.dataset.open);
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset&&e.target.dataset.open)openMajor(e.target.dataset.open);});
const P=new URLSearchParams(location.search);
const sel=P.get('sel');st.sel=sel?(/^j\d+$/.test(sel)?{t:'j',id:sel}:/^m\d+$/.test(sel)?{t:'m',id:sel}:{t:'s',id:sel}):{t:'j',id:'j1'};
setTab();
if(P.get('open'))openMajor(P.get('open'));
})();
