(function(){
const {RIASEC,WAGE,OUTLOOK,LV3,JOBS,JOB_CATS,ME,store,dots,job,major,drawer}=EX;
const $=id=>document.getElementById(id);
const st={q:'',cats:new Set(),ria:new Set(),wage:0,outlook:0,sort:'name',mode:'test',pick:new Set(['I','A']),w:{i:50,a:30,v:20}};
const meTop=Object.entries(ME.ria).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>x[0]);
/* 어울림 정도: 내부 정렬용 점수. 화면에는 숫자 대신 3단계 표현만 보여줍니다 */
const LEVEL=f=>f>=70?['잘 맞아요','hi']:f>=45?['살펴볼 만해요','mid']:['다른 면도 있어요','low'];
function fit(j){
  const i=st.mode==='test'?j.ria.reduce((s,k)=>s+ME.ria[k],0)/j.ria.length:(st.pick.size?j.ria.filter(k=>st.pick.has(k)).length/j.ria.length*100:0);
  const a=j.apt.filter(x=>ME.apt.includes(x)).length/j.apt.length*100;
  const v=j.val.filter(x=>ME.val.includes(x)).length/j.val.length*100;
  const W=st.w,sum=W.i+W.a+W.v||1;
  return Math.round(((W.i||0)*i+(W.a||0)*a+(W.v||0)*v)/sum);
}
const riaHit=k=>st.mode==='test'?meTop.includes(k):st.pick.has(k);
/* 카드 */
function card(j){
  const sv=store.isSaved('jobs',j.id),cm=store.isCmp('jobs',j.id);
  return `<article class="xcard" data-open="${j.id}" tabindex="0">
    <div class="xcard__top"><div><span class="xcard__cat">${j.cat}</span><h3>${j.name}</h3></div>
    <button class="save${sv?' is-on':''}" data-save="${j.id}" aria-label="${j.name} 관심 저장">${sv?'❤️':'🤍'}</button></div>
    <p>${j.desc}</p>
    <div class="ria">${j.ria.map(k=>`<span>${RIASEC[k]}</span>`).join('')}</div>
    <div class="ind"><div>평균연봉 ${dots(j.wage,4)}</div><div>직업전망 ${dots(j.outlook,4)}</div><div>일·가정 균형 ${dots(j.bal,3)}</div><div>사회공헌 ${dots(j.con,3)}</div></div>
    <div class="xcard__act"><button class="mini${cm?' is-on':''}" data-cmp="${j.id}">${cm?'✓ 비교함에 담김':'+ 비교함 담기'}</button></div>
  </article>`;
}
/* 직업 찾기 */
function chips(el,items,set,lab){el.innerHTML=items.map(([v,t])=>`<button class="fchip${set.has(v)?' is-on':''}" data-v="${v}">${t}</button>`).join('');}
function renderFind(){
  chips($('fCat'),JOB_CATS.map(c=>[c,c]),st.cats);
  chips($('fRia'),Object.entries(RIASEC),st.ria);
  $('fRia').querySelectorAll('.fchip').forEach(b=>{if(meTop.includes(b.dataset.v))b.classList.add('is-me');});
  $('fWage').innerHTML=WAGE.map((t,i)=>`<button class="fchip${st.wage===i?' is-on':''}" data-v="${i}">${i?t+(i<4?'':''):'전체'}</button>`).join('');
  $('fOut').innerHTML=OUTLOOK.map((t,i)=>`<button class="fchip${st.outlook===i?' is-on':''}" data-v="${i}">${i?t:'전체'}</button>`).join('');
  const q=st.q.trim();
  let list=JOBS.filter(j=>(!q||(j.name+j.desc+j.cat+j.does.join('')).includes(q))&&(!st.cats.size||st.cats.has(j.cat))&&(!st.ria.size||j.ria.some(k=>st.ria.has(k)))&&(!st.wage||j.wage===st.wage)&&(!st.outlook||j.outlook===st.outlook));
  const s=st.sort;list.sort((a,b)=>s==='wage'?b.wage-a.wage:s==='outlook'?b.outlook-a.outlook:s==='fit'?fit(b)-fit(a):a.name.localeCompare(b.name,'ko'));
  $('cnt').innerHTML=`직업 <em>${list.length}</em>개`;
  $('grid').innerHTML=list.length?list.map(card).join(''):`<div class="empty-r" style="grid-column:1/-1"><b>조건에 맞는 직업이 없어요</b>필터를 줄이거나 다른 검색어로 찾아보세요.</div>`;
}
/* 나에게 맞는 직업 */
function renderMatch(){
  $('modeSeg').querySelectorAll('button').forEach(b=>b.classList.toggle('is-on',b.dataset.mode===st.mode));
  $('meBox').style.display=st.mode==='test'?'':'none';
  $('pickBox').style.display=st.mode==='pick'?'':'none';
  chips($('pickRia'),Object.entries(RIASEC),st.pick);
  ['i','a','v'].forEach(k=>{$('w'+k).value=st.w[k];$('o'+k).textContent=st.w[k];});
  const list=JOBS.map(j=>[j,fit(j)]).sort((a,b)=>b[1]-a[1]).slice(0,10);
  $('mlist').innerHTML=list.map(([j,f],i)=>`<div class="mrow" data-open="${j.id}" tabindex="0">
    <span class="mrow__rk">${i+1}</span>
    <div><h3>${j.name} <span class="xcard__cat">· ${j.cat}</span></h3><div class="why">${j.ria.map(k=>`<span class="${riaHit(k)?'hit':''}">${RIASEC[k]}</span>`).join('')}${j.apt.map(x=>`<span class="${ME.apt.includes(x)?'hit':''}">${x}</span>`).join('')}${j.val.map(x=>`<span class="${ME.val.includes(x)?'hit':''}">${x}</span>`).join('')}</div></div>
    <div class="score"><span class="lv lv--${LEVEL(f)[1]}">${LEVEL(f)[0]}</span></div>
    <button class="save${store.isSaved('jobs',j.id)?' is-on':''}" data-save="${j.id}" aria-label="${j.name} 관심 저장">${store.isSaved('jobs',j.id)?'❤️':'🤍'}</button>
  </div>`).join('');
}
/* 비교 */
function renderCompare(){
  const saved=store.list('jobs'),cmp=store.cmp('jobs');
  $('cpick').innerHTML=saved.length?saved.map(id=>{const j=job(id),on=cmp.includes(id);return `<label class="${on?'is-on':''}"><input type="checkbox" data-cmpchk="${id}"${on?' checked':''}>${j.name}<button data-save="${id}" aria-label="${j.name} 관심 해제">✕</button></label>`;}).join(''):'';
  $('cmpCount').textContent=`관심 직업 ${saved.length}개 · 비교 중 ${cmp.length}/3`;
  if(!cmp.length){$('ctable').innerHTML=`<div class="empty-r"><b>${saved.length?'비교할 직업을 골라주세요':'아직 저장한 직업이 없어요'}</b>${saved.length?'위 목록에서 최대 3개까지 체크하면 나란히 비교합니다.':'직업 찾기에서 🤍를 눌러 관심 직업을 저장하세요.'}</div>`;return;}
  const js=cmp.map(job);
  const best=(f)=>{const vals=js.map(f),mx=Math.max(...vals);return vals.map(v=>js.length>1&&v===mx&&vals.filter(x=>x===mx).length<js.length);};
  const row=(t,f,num)=>{const b=num?best(num):js.map(()=>false);return `<tr><th>${t}</th>${js.map((j,i)=>`<td class="${b[i]?'best':''}">${f(j)}</td>`).join('')}</tr>`;};
  $('ctable').innerHTML=`<div class="ctable-w"><table class="ctable"><thead><tr><th></th>${js.map(j=>`<th>${j.name}<div class="xcard__cat" style="margin-top:4px">${j.cat}</div></th>`).join('')}</tr></thead><tbody>
  ${row('나와 어울리는 정도',j=>`<span class="lv lv--${LEVEL(fit(j))[1]}">${LEVEL(fit(j))[0]}</span>`)}
  ${row('흥미 유형',j=>`<div class="ria">${j.ria.map(k=>`<span>${RIASEC[k]}</span>`).join('')}</div>`)}
  ${row('평균연봉',j=>`${dots(j.wage,4)}<div>${WAGE[j.wage]}</div>`,j=>j.wage)}
  ${row('직업전망',j=>`${dots(j.outlook,4)}<div>${OUTLOOK[j.outlook]}</div>`,j=>j.outlook)}
  ${row('일·가정 균형',j=>`${dots(j.bal,3)} ${LV3[j.bal]}`,j=>j.bal)}
  ${row('사회공헌',j=>`${dots(j.con,3)} ${LV3[j.con]}`,j=>j.con)}
  ${row('필요한 능력',j=>j.apt.join(', '))}
  ${row('되는 길',j=>`<span style="font-size:14px;color:var(--ink-2)">${j.path}</span>`)}
  ${row('관련 학과',j=>`<div class="lchips">${j.majors.map(m=>`<a href="jinro-major.html?open=${m}#find">${major(m).name}</a>`).join('')}</div>`)}
  </tbody></table></div>`;
}
/* 상세 드로어 */
function openJob(id){
  const j=job(id);if(!j)return;const sv=store.isSaved('jobs',id),cm=store.isCmp('jobs',id),f=fit(j);
  const hits=[...j.ria.filter(k=>meTop.includes(k)).map(k=>RIASEC[k]),...j.apt.filter(x=>ME.apt.includes(x)),...j.val.filter(x=>ME.val.includes(x))];
  drawer.open(`<div class="dh"><small>${j.cat} · 직업정보</small><h2>${j.name}</h2><p>${j.desc}</p></div>
  <div class="fit"><span class="lv lv--${LEVEL(f)[1]}">${LEVEL(f)[0]}</span><span>${hits.length?hits.join(', ')+'이(가) 내 검사 결과와 겹쳐요':'내 검사 결과와 겹치는 항목은 없지만, 관심이 간다면 충분히 살펴볼 가치가 있어요'}</span></div>
  <div class="dact"><button class="btn ${sv?'btn--ghost':'btn--primary'} btn--pill" data-save="${id}" data-redraw="${id}">${sv?'❤️ 저장됨':'🤍 관심 저장'}</button><button class="btn btn--ghost btn--pill" data-cmp="${id}" data-redraw="${id}">${cm?'✓ 비교함에 담김':'+ 비교함 담기'}</button></div>
  <div class="dsec"><h3>하는 일</h3><ul>${j.does.map(x=>`<li>${x}</li>`).join('')}</ul></div>
  <div class="dsec"><h3>직업 지표</h3><dl class="dgrid"><div><dt>평균연봉</dt><dd>${WAGE[j.wage]} ${dots(j.wage,4)}</dd></div><div><dt>직업전망</dt><dd>${OUTLOOK[j.outlook]} ${dots(j.outlook,4)}</dd></div><div><dt>일·가정 균형</dt><dd>${LV3[j.bal]} ${dots(j.bal,3)}</dd></div><div><dt>사회공헌</dt><dd>${LV3[j.con]} ${dots(j.con,3)}</dd></div></dl></div>
  <div class="dsec"><h3>어울리는 흥미 유형 · 필요한 능력 · 중요한 가치</h3><div class="lchips">${j.ria.map(k=>`<span>${RIASEC[k]}</span>`).join('')}${j.apt.map(x=>`<span>${x}</span>`).join('')}${j.val.map(x=>`<span>${x}</span>`).join('')}</div></div>
  <div class="dsec"><h3>되는 길</h3><p>${j.path}</p></div>
  <div class="dsec"><h3>관련 학과</h3><div class="lchips">${j.majors.map(m=>`<a href="jinro-major.html?open=${m}#find">${major(m).name}</a>`).join('')}</div></div>
  ${j.cert&&j.cert.length?`<div class="dsec"><h3>관련 자격</h3><div class="lchips">${j.cert.map(x=>`<span>${x}</span>`).join('')}</div></div>`:''}
  <div class="dsec"><a class="btn btn--ghost btn--pill" href="jinro-major.html?sel=${id}#link" style="width:100%">직업-학과-과목 연결 보기 →</a></div>
  <p class="dsrc">※ 출처: 커리어넷 직업백과·워크넷 직업정보 구조 참고 (화면의 지표는 예시입니다)</p>`);
}
/* 비교함 트레이 */
function renderTray(){const c=store.cmp('jobs');$('tray').classList.toggle('is-on',c.length>0&&tab!=='compare');$('trayN').textContent=`비교함 ${c.length}/3`;$('trayItems').innerHTML=c.map(id=>`<span>${job(id).name}</span>`).join('');}
function rerender(){if(tab==='find')renderFind();if(tab==='match')renderMatch();if(tab==='compare')renderCompare();renderTray();$('tabSaved').textContent=store.list('jobs').length;}
/* 탭 */
let tab='find';const L3={find:'직업 찾기',match:'나에게 맞는 직업',compare:'직업 비교·관심저장'};
function setTab(){tab=(location.hash||'#find').slice(1);if(!L3[tab])tab='find';
  document.querySelectorAll('.ptab').forEach(t=>t.classList.toggle('is-on',t.dataset.tab===tab));
  document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('is-on',p.id==='pane-'+tab));
  document.querySelectorAll('#lnb a').forEach(a=>a.classList.toggle('is-cur',a.getAttribute('href')==='jinro-job.html#'+tab));
  $('crumbL3').textContent=L3[tab];document.title=L3[tab]+' | 서울 진로진학 통합플랫폼';rerender();}
$('lnb').dataset.current=L3[(location.hash||'#find').slice(1)]||'직업 찾기';
window.addEventListener('hashchange',()=>{setTab();window.scrollTo({top:document.querySelector('.ptabs').offsetTop-90,behavior:'smooth'});});
/* 이벤트 */
let tq;$('q').addEventListener('input',e=>{clearTimeout(tq);tq=setTimeout(()=>{st.q=e.target.value;renderFind();},150);});
$('kw').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$('q').value=b.textContent;st.q=b.textContent;renderFind();});
const tog=(set,v)=>set.has(v)?set.delete(v):set.add(v);
$('fCat').addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b){tog(st.cats,b.dataset.v);renderFind();}});
$('fRia').addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b){tog(st.ria,b.dataset.v);renderFind();}});
$('fWage').addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b){st.wage=+b.dataset.v;renderFind();}});
$('fOut').addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b){st.outlook=+b.dataset.v;renderFind();}});
$('fMe').addEventListener('click',()=>{st.ria=new Set(meTop);renderFind();showToast('내 흥미 유형(탐구형·예술형)으로 필터했어요');});
$('fReset').addEventListener('click',()=>{st.cats.clear();st.ria.clear();st.wage=0;st.outlook=0;st.q='';$('q').value='';renderFind();});
$('sort').addEventListener('change',e=>{st.sort=e.target.value;renderFind();});
$('modeSeg').addEventListener('click',e=>{const b=e.target.closest('[data-mode]');if(b){st.mode=b.dataset.mode;renderMatch();}});
$('pickRia').addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b){tog(st.pick,b.dataset.v);renderMatch();}});
['i','a','v'].forEach(k=>$('w'+k).addEventListener('input',e=>{st.w[k]=+e.target.value;renderMatch();}));
$('cpick').addEventListener('change',e=>{const c=e.target.closest('[data-cmpchk]');if(!c)return;const r=store.toggleCmp('jobs',c.dataset.cmpchk);if(r==='full'){c.checked=false;showToast('최대 3개까지 비교할 수 있어요');return;}rerender();});
document.addEventListener('click',e=>{
  const sv=e.target.closest('[data-save]');if(sv){e.preventDefault();e.stopPropagation();const on=store.toggleSave('jobs',sv.dataset.save);showToast(on?'관심 직업에 저장했어요 · 나의 진로진학에서도 볼 수 있어요':'관심 직업에서 뺐어요');rerender();if(sv.dataset.redraw)openJob(sv.dataset.redraw);return;}
  const cm=e.target.closest('[data-cmp]');if(cm){e.preventDefault();e.stopPropagation();const r=store.toggleCmp('jobs',cm.dataset.cmp);showToast(r==='full'?'비교함은 최대 3개까지 담을 수 있어요':r==='on'?'비교함에 담았어요':'비교함에서 뺐어요');rerender();if(cm.dataset.redraw)openJob(cm.dataset.redraw);return;}
  const op=e.target.closest('[data-open]');if(op){openJob(op.dataset.open);}
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'){const op=e.target.closest&&e.target.closest('[data-open]');if(op&&op===e.target)openJob(op.dataset.open);}});
setTab();
const p=new URLSearchParams(location.search).get('open');if(p)openJob(p);
})();
