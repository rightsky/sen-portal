(function(){
const {UNIS,ADMS,KINDS,QUIZ,TERMS,CHANGES,DOCS,REGIONS,uni,adm}=UD;const {MAJORS,MAJOR_CATS,major,drawer,store}=EX;const A=SEN_AUTH;const $=id=>document.getElementById(id);
const K='sen-univ-v1';let S=JSON.parse(localStorage.getItem(K)||'{"saved":[],"cmp":[],"adms":[]}');const save=()=>localStorage.setItem(K,JSON.stringify(S));
const needLogin=m=>{if(A.logged())return false;showToast(m);A.open();return true;};
const GROUP={find:'u',detail:'u',majorinfo:'u',compare:'u',susi:'a',jeongsi:'a',fit:'a',terms:'i',changes:'i',docs:'i'};
const L3={find:'대학정보',detail:'대학 상세',majorinfo:'학과정보',compare:'대학·전형 비교',susi:'수시 전형',jeongsi:'정시 전형',fit:'나에게 맞는 전형 탐색',terms:'대입제도·용어',changes:'학년도별 변화',docs:'모집요강·전형자료'};
const L2={u:'대학·학과 찾기',a:'전형 찾기',i:'대입 이해하기'};
const myMajors=()=>store.list('majors');
/* ══ 대학정보 (어디가 '대학정보' 방식 + 개선) ══ */
const f={region:new Set(),type:'',size:new Set(),cat:'',major:'',q:'',mine:false,view:'card',sort:'name'};
const admCount=(uid,season)=>ADMS.filter(a=>a.uni===uid&&(!season||a.season===season)).length;
function ucard(u){const sv=S.saved.includes(u.id),cm=S.cmp.includes(u.id),ms=u.majors.map(major).filter(Boolean),hit=ms.filter(m=>myMajors().includes(m.id));
  return `<article class="xcard" data-uni="${u.id}" tabindex="0"><div class="xcard__top"><div><span class="xcard__cat">${u.region} · ${u.type} · ${u.size}</span><h3>${u.name}</h3></div><button class="save${sv?' is-on':''}" data-usave="${u.id}" aria-label="관심 대학 저장">${sv?'❤️':'🤍'}</button></div>
  <div class="ria">${ms.slice(0,4).map(m=>`<span${hit.includes(m)?' style="background:#E7F8F0;color:#0E8A57"':''}>${m.name}</span>`).join('')}${ms.length>4?`<span style="background:var(--surface);color:var(--ink-3)">+${ms.length-4}</span>`:''}</div>
  <div class="ind"><div>수시 전형 <b style="color:var(--ink)">${admCount(u.id,'수시')}개</b></div><div>정시 전형 <b style="color:var(--ink)">${admCount(u.id,'정시')}개</b></div><div>기숙사 <b style="color:var(--ink)">${u.dorm}</b></div><div>${hit.length?`내 관심 학과 <b style="color:#0E8A57">${hit.length}개</b>`:'<span></span>'}</div></div>
  <div class="xcard__act"><button class="mini${cm?' is-on':''}" data-ucmp="${u.id}">${cm?'✓ 비교함':'+ 비교'}</button><button class="mini" data-uni="${u.id}">상세 보기</button></div></article>`;}
function urow(u){const sv=S.saved.includes(u.id),hit=u.majors.filter(m=>myMajors().includes(m)).length;return `<tr class="trow" data-uni="${u.id}"><td><b>${u.name}</b>${hit?` <span class="st st--ok">관심학과 ${hit}</span>`:''}</td><td>${u.region}</td><td>${u.type}</td><td>${u.size}</td><td>${u.majors.length}개</td><td>${admCount(u.id,'수시')} / ${admCount(u.id,'정시')}</td><td>${u.dorm}</td><td><button class="save${sv?' is-on':''}" data-usave="${u.id}" aria-label="관심">${sv?'❤️':'🤍'}</button></td></tr>`;}
function renderFind(){
  $('fRegion').innerHTML=REGIONS.filter(r=>UNIS.some(u=>u.region===r)).map(r=>`<button class="fchip${f.region.has(r)?' is-on':''}" data-fr="${r}">${r}</button>`).join('');
  $('fType').innerHTML=['','국립','사립'].map(t=>`<button class="fchip${f.type===t?' is-on':''}" data-ft="${t}">${t||'전체'}</button>`).join('');
  $('fSize').innerHTML=['대규모','중규모','소규모'].map(t=>`<button class="fchip${f.size.has(t)?' is-on':''}" data-fs="${t}">${t}</button>`).join('');
  $('fCat').innerHTML=['',...MAJOR_CATS].map(c=>`<button class="fchip${f.cat===c?' is-on':''}" data-fc="${c}">${c||'전체 계열'}</button>`).join('');
  $('fMajor').innerHTML=['<option value="">전체 학과</option>',...MAJORS.filter(m=>!f.cat||m.cat===f.cat).map(m=>`<option value="${m.id}"${f.major===m.id?' selected':''}>${m.name}</option>`)].join('');
  $('fMine').classList.toggle('is-on',f.mine);$('fMine').style.display=A.logged()?'':'none';
  let L=UNIS.filter(u=>(!f.region.size||f.region.has(u.region))&&(!f.type||u.type===f.type)&&(!f.size.size||f.size.has(u.size))&&(!f.cat||u.majors.some(m=>major(m)&&major(m).cat===f.cat))&&(!f.major||u.majors.includes(f.major))&&(!f.q||(u.name+u.feats.join('')+u.region).includes(f.q))&&(!f.mine||u.majors.some(m=>myMajors().includes(m))));
  L.sort((x,y)=>f.sort==='adm'?admCount(y.id)-admCount(x.id):f.sort==='major'?y.majors.length-x.majors.length:x.name.localeCompare(y.name,'ko'));
  $('uCnt').innerHTML=`대학 <em>${L.length}</em>곳`;
  $('uView').querySelectorAll('button').forEach(x=>x.classList.toggle('is-on',x.dataset.view===f.view));
  $('uGrid').innerHTML=L.length?(f.view==='card'?L.map(ucard).join(''):`<div class="ctable-w" style="grid-column:1/-1"><table class="ctable utbl"><thead><tr><th>대학</th><th>지역</th><th>설립</th><th>규모</th><th>학과</th><th>수시/정시 전형</th><th>기숙사</th><th></th></tr></thead><tbody>${L.map(urow).join('')}</tbody></table></div>`):`<div class="empty-r" style="grid-column:1/-1"><b>조건에 맞는 대학이 없어요</b>조건을 줄여보세요.</div>`;
}
/* 대학 상세: 개요 · 모집단위 · 전형 · 전년도 결과 · 캠퍼스 */
let dUni=null,dTab='over',dMajor=null;
function renderDetail(){
  const saved=S.saved.map(uni);if(!dUni)dUni=(saved[0]||UNIS[0]).id;const u=uni(dUni);
  $('dPick').innerHTML=(saved.length?saved:UNIS.slice(0,6)).map(x=>`<button class="fchip${x.id===dUni?' is-on':''}" data-du="${x.id}">${x.name}</button>`).join('')+`<select class="sortsel" id="dSel" aria-label="다른 대학 선택"><option value="">다른 대학…</option>${UNIS.map(x=>`<option value="${x.id}">${x.name}</option>`).join('')}</select>`;
  const ms=u.majors.map(major).filter(Boolean),as=ADMS.filter(a=>a.uni===u.id),mine=myMajors();
  const T=[['over','개요'],['majors','모집단위·학과'],['adms','전형별 모집인원'],['result','전년도 입시결과'],['life','캠퍼스 생활']];
  let body='';
  if(dTab==='over')body=`<div class="ud"><div class="panel-c" style="border:1px solid var(--line);box-shadow:none"><h3>기본 정보</h3><dl class="dgrid" style="grid-template-columns:1fr 1fr"><div><dt>설립</dt><dd>${u.type} · ${u.estab}년</dd></div><div><dt>재학생</dt><dd>${u.students}</dd></div><div><dt>주소</dt><dd style="font-size:14px">${u.addr}</dd></div><div><dt>입학처</dt><dd style="font-size:14px">${u.tel}</dd></div><div><dt>홈페이지</dt><dd style="font-size:14px"><a class="link" href="#" data-toast="대학 입학처 홈페이지로 이동합니다">${u.site}</a></dd></div><div><dt>특징</dt><dd style="font-size:14px">${u.feats.join(', ')}</dd></div></dl></div>
    <div class="panel-c" style="border:1px solid var(--line);box-shadow:none"><h3>한눈에 보기</h3><div class="kv3"><div><b>${ms.length}</b><span>개설 학과 (예시)</span></div><div><b>${as.filter(a=>a.season==='수시').length}</b><span>수시 전형</span></div><div><b>${as.filter(a=>a.season==='정시').length}</b><span>정시 전형</span></div><div><b>${as.filter(a=>a.season==='수시'&&a.minType==='반영안함').length}</b><span>수능최저 없는 수시</span></div></div>${mine.length?`<p class="hint" style="margin:0">내 관심 학과 중 이 대학에 있는 학과: <b>${ms.filter(m=>mine.includes(m.id)).map(m=>m.name).join(', ')||'없음'}</b></p>`:''}</div></div>`;
  if(dTab==='majors')body=`<div class="ctable-w"><table class="ctable utbl"><thead><tr><th>학과 (모집단위)</th><th>계열</th><th>수시 전형</th><th>정시 전형</th><th>총 모집 (예시)</th><th></th></tr></thead><tbody>${ms.map(m=>{const am=as.filter(a=>a.majorIds.includes(m.id));const tot=am.reduce((s,a)=>s+(a.perMajor[m.id]?.quota||0),0);return `<tr class="trow" data-mj="${m.id}"><td><b>${m.name}</b>${mine.includes(m.id)?' <span class="st st--ok">♥ 관심</span>':''}</td><td>${m.cat}</td><td>${am.filter(a=>a.season==='수시').map(a=>a.name).join(', ')||'–'}</td><td>${am.filter(a=>a.season==='정시').map(a=>a.name).join(', ')||'–'}</td><td>${tot}명</td><td><a class="link" href="#detail" data-mj="${m.id}">학과정보 ›</a></td></tr>`;}).join('')}</tbody></table></div>`;
  if(dTab==='adms')body=`<div class="ctable-w"><table class="ctable utbl"><thead><tr><th>시기</th><th>전형명</th><th>유형</th><th>전형 방법</th><th>수능최저</th><th>모집 (예시)</th><th></th></tr></thead><tbody>${as.map(a=>`<tr class="trow" data-adm="${a.id}"><td><span class="tb tb--${a.season==='수시'?1:2}">${a.season==='수시'?'수시':'정시('+a.group+')'}</span></td><td><b>${a.name}</b></td><td>${a.kind}</td><td>${a.elems.map(e=>e[0]+' '+e[1]+'%').join(' + ')}</td><td>${a.minType==='반영안함'?'없음':a.minReq}</td><td>${Object.values(a.perMajor).reduce((s,x)=>s+x.quota,0)}명</td><td><i style="color:var(--ink-3)">›</i></td></tr>`).join('')}</tbody></table></div>`;
  if(dTab==='result'){const sel=dMajor&&u.majors.includes(dMajor)?dMajor:ms[0].id;dMajor=sel;const rows=as.filter(a=>a.majorIds.includes(sel)&&a.prev!=null);
    body=`<div class="utabs" style="margin:0 0 14px">${ms.map(m=>`<button class="tab${m.id===sel?' is-on':''}" data-rm="${m.id}">${m.name}</button>`).join('')}</div>
    <div class="ctable-w"><table class="ctable utbl"><thead><tr><th>전형</th><th>모집 (예시)</th><th>경쟁률</th><th>합격자 50% 컷</th><th>합격자 70% 컷</th></tr></thead><tbody>${rows.map(a=>{const p=a.perMajor[sel];return `<tr class="trow" data-adm="${a.id}"><td><b>${a.name}</b><div class="xcard__cat">${a.season} · ${a.kind}</div></td><td>${p.quota}명</td><td>${p.rate}:1</td><td><b>${p.prev50}</b>등급</td><td><b>${p.prev70}</b>등급</td></tr>`;}).join('')||'<tr><td colspan="5" class="hint">공개된 결과가 없어요</td></tr>'}</tbody></table></div>
    <div class="notice" style="margin-top:16px"><div class="notice__icon">💡</div><div><h3>등급은 5등급제 기준 참고값이에요</h3><p>대학이 공개한 전년도 합격자 등급을 2028학년도부터 적용되는 내신 5등급제 기준으로 바꿔 보여줍니다. "내 등급으로 될까?"는 이 표만으로 판단할 수 없어요. 상담에서 선생님과 성적표를 함께 보며 이야기하세요.</p></div></div>`;}
  if(dTab==='life')body=`<div class="kv3 kv3--w"><div><b>${u.dorm}</b><span>기숙사 수용률</span></div><div><b style="font-size:17px">${u.tuition}</b><span>등록금 (계열별 범위)</span></div><div><b>${u.students}</b><span>재학생</span></div><div><b style="font-size:17px">${u.feats[0]}</b><span>대표 프로그램</span></div></div><p class="hint">※ 캠퍼스 생활 정보는 대학알리미·대학 홈페이지 공시값을 연계해 보여줄 예정입니다 (현재 예시)</p>`;
  $('dBody').innerHTML=`<div class="uhead"><div><small>${u.region} · ${u.type} · ${u.size} · ${u.estab}년 설립</small><h2>${u.name}</h2><div class="ria">${u.feats.map(x=>`<span>${x}</span>`).join('')}</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ${S.saved.includes(u.id)?'btn--ghost':'btn--primary'} btn--pill" data-usave="${u.id}">${S.saved.includes(u.id)?'❤️ 관심 대학':'🤍 관심 대학 저장'}</button><button class="btn btn--ghost btn--pill" data-ucmp="${u.id}">${S.cmp.includes(u.id)?'✓ 비교함':'+ 비교함'}</button><a class="btn btn--ghost btn--pill" href="counsel.html#book">이 대학으로 상담</a></div></div>
  <div class="utabs">${T.map(([k,v])=>`<button class="tab${dTab===k?' is-on':''}" data-dt="${k}">${v}</button>`).join('')}</div>${body}`;
}
/* ══ 학과정보 (어디가 '학과정보' 방식: 계열 트리 → 학과 → 개설 대학) ══ */
let mjCat='전체',mjSel=null;
function renderMajorInfo(){
  const mine=myMajors();if(!mjSel)mjSel=mine[0]||MAJORS[0].id;const m=major(mjSel);
  $('mjCats').innerHTML=['전체',...MAJOR_CATS].map(c=>`<button class="fchip${mjCat===c?' is-on':''}" data-mjc="${c}">${c}</button>`).join('');
  $('mjList').innerHTML=MAJORS.filter(x=>mjCat==='전체'||x.cat===mjCat).map(x=>`<button class="mjit${x.id===mjSel?' is-on':''}" data-mj="${x.id}"><b>${x.name}${mine.includes(x.id)?' ♥':''}</b><span>${x.cat} · 개설 ${UNIS.filter(u=>u.majors.includes(x.id)).length}개 대학</span></button>`).join('');
  const us=UNIS.filter(u=>u.majors.includes(m.id));
  $('mjBody').innerHTML=`<div class="uhead"><div><small>${m.cat}계열 · 학과정보</small><h2>${m.name}</h2><p style="margin:0;color:var(--ink-2)">${m.desc}</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ${mine.includes(m.id)?'btn--ghost':'btn--primary'} btn--pill" data-mjsave="${m.id}">${mine.includes(m.id)?'❤️ 관심 학과':'🤍 관심 학과 저장'}</button><a class="btn btn--ghost btn--pill" href="jinro-major.html?open=${m.id}#find">진로 관점에서 보기</a></div></div>
  <div class="kv3" style="margin:18px 0"><div><b>${us.length}</b><span>개설 대학 (예시)</span></div><div><b>${m.emp}%</b><span>취업률</span></div><div><b>${m.grad}%</b><span>진학률</span></div><div><b>${ADMS.filter(a=>a.majorIds.includes(m.id)).length}</b><span>지원 가능 전형</span></div></div>
  <div class="ud"><div class="panel-c" style="border:1px solid var(--line);box-shadow:none"><h3>무엇을 배우나요</h3><div class="lchips">${m.learn.map(x=>`<span>${x}</span>`).join('')}</div><h3 style="margin-top:8px">고교에서 들어두면 좋은 과목</h3><div class="lchips">${m.subjects.map(x=>`<span>${x}</span>`).join('')}</div><h3 style="margin-top:8px">졸업 후 진로</h3><div class="lchips">${m.jobs.map(jid=>`<a href="jinro-job.html?open=${jid}#find">${EX.job(jid).name}</a>`).join('')}</div></div>
  <div class="panel-c" style="border:1px solid var(--line);box-shadow:none"><div class="panel-c__head"><h3>이 학과를 개설한 대학</h3><small>${us.length}곳</small></div><div class="ctable-w"><table class="ctable utbl"><thead><tr><th>대학</th><th>지역</th><th>수시</th><th>정시</th><th></th></tr></thead><tbody>${us.map(u=>{const am=ADMS.filter(a=>a.uni===u.id&&a.majorIds.includes(m.id));return `<tr class="trow" data-uni="${u.id}"><td><b>${u.name}</b></td><td>${u.region}</td><td>${am.filter(a=>a.season==='수시').length}</td><td>${am.filter(a=>a.season==='정시').length}</td><td><button class="save${S.saved.includes(u.id)?' is-on':''}" data-usave="${u.id}" aria-label="관심 대학">${S.saved.includes(u.id)?'❤️':'🤍'}</button></td></tr>`;}).join('')}</tbody></table></div><a class="link" href="#susi" data-majorgo="${m.id}">이 학과로 뽑는 전형 전체 보기 ›</a></div></div>`;
}
function arow(a){const u=uni(a.uni),sv=S.adms.includes(a.id),cm=S.cmpA&&S.cmpA.includes(a.id);return `<button class="arow" data-adm="${a.id}"><span class="tb tb--${a.season==='수시'?1:2}">${a.season==='수시'?'수시':'정시('+a.group+')'}</span><div><b>${a.name}</b><span>${u.name} · ${u.region} · ${a.kind} · ${a.elems.map(e=>e[0]+' '+e[1]+'%').join(' + ')}${a.night?' · 야간':''}</span></div><span class="arow__min">${a.minType==='반영안함'?'최저 없음':'최저('+a.minType+')'}${a.prev!=null?'<br>전년도 '+a.prev.toFixed(1)+'등급':''}</span><i>${sv?'❤️':cm?'⚖️':'›'}</i></button>`;}
function atrow(a){const u=uni(a.uni),sv=S.adms.includes(a.id),cm=(S.cmpA||[]).includes(a.id);return `<tr class="trow" data-adm="${a.id}"><td><span class="tb tb--${a.season==='수시'?1:2}">${a.season==='수시'?'수시':'정시('+a.group+')'}</span></td><td><b>${u.name}</b><div class="xcard__cat">${u.region}</div></td><td><b>${a.name}</b></td><td>${a.kind}</td><td>${a.majorIds.length}개 학과</td><td>${a.elems.map(e=>e[0]+' '+e[1]).join('+')}</td><td>${a.minType==='반영안함'?'없음':a.minType}</td><td>${a.prev!=null?a.prev.toFixed(1):'–'}</td><td style="white-space:nowrap"><button class="save${sv?' is-on':''}" data-asave="${a.id}" aria-label="관심 전형">${sv?'❤️':'🤍'}</button> <button class="mini${cm?' is-on':''}" data-acmp="${a.id}" style="padding:7px 9px">${cm?'✓':'비교'}</button></td></tr>`;}
function openAdm(id){const a=adm(id),u=uni(a.uni),sv=S.adms.includes(id),K=KINDS[a.kind],mine=myMajors();
  drawer.open(`<div class="dh"><small>${u.name} · ${a.season==='수시'?'수시':'정시('+a.group+'군)'} · ${a.kind}</small><h2>${a.name}</h2><p>${K[0]}</p></div>
  <div class="dact"><button class="btn ${sv?'btn--ghost':'btn--primary'} btn--pill" data-asave="${id}" data-redraw="${id}">${sv?'❤️ 관심 전형':'🤍 관심 전형 저장'}</button><button class="btn btn--ghost btn--pill" data-acmp="${id}" data-redraw="${id}">${(S.cmpA||[]).includes(id)?'✓ 비교함':'+ 전형 비교'}</button></div>
  <div class="dsec"><h3>전형 방법</h3><div class="elems">${a.elems.map(e=>`<div class="elem"><b>${e[1]}%</b><span>${e[0]}</span></div>`).join('')}<div class="elem elem--s"><b>${a.stage}</b><span>전형 단계</span></div></div></div>
  <div class="dsec"><h3>지원 요건</h3><dl class="dgrid" style="grid-template-columns:1fr"><div><dt>수능최저학력기준</dt><dd style="font-size:14.5px">${a.minReq}</dd></div>${a.reqNote?`<div><dt>그 밖의 요건</dt><dd style="font-size:14.5px">${a.reqNote}</dd></div>`:''}<div><dt>제출·응시</dt><dd style="font-size:14.5px">${a.docs.join(', ')}</dd></div>${a.sat.length?`<div><dt>수능 반영영역</dt><dd style="font-size:14.5px">${a.sat.join(', ')}</dd></div>`:''}</dl></div>
  <div class="dsec"><h3>모집단위별 모집인원 · 전년도 결과 (예시)</h3><div class="ctable-w"><table class="ctable utbl" style="min-width:0"><thead><tr><th>학과</th><th>모집</th><th>경쟁률</th><th>50% 컷</th></tr></thead><tbody>${a.majorIds.map(m=>{const p=a.perMajor[m];return `<tr><td style="font-size:14px">${major(m).name}${mine.includes(m)?' ♥':''}</td><td>${p.quota}</td><td>${p.rate}:1</td><td>${p.prev50!=null?p.prev50+'등급':'–'}</td></tr>`;}).join('')}</tbody></table></div></div>
  <div class="dsec"><h3>이런 학생에게 어울려요</h3><p>${K[1]}</p></div>
  <div class="dsec"><button class="btn btn--primary btn--pill" style="width:100%" href="counsel.html#book">이 전형으로 상담 신청</button></div>
  <div class="notice" style="padding:16px 18px"><div class="notice__icon" style="width:32px;height:32px;font-size:15px">🗣️</div><div><p style="font-size:13.5px">내 성적으로 지원할 만한지, 수능최저를 맞출 수 있을지는 <b>선생님과의 상담</b>에서 성적표를 함께 보며 확인해요. 이 화면은 전형 요건과 공개 결과 안내까지만 다룹니다.</p></div></div>
  <p class="dsrc">※ 전형명·비율·최저기준·결과는 예시입니다 · 실제 내용은 해당 학년도 모집요강과 대입정보포털 어디가를 확인하세요</p>`);}
/* ══ 비교: 대학 비교 + 전형 비교 ══ */
let cmpMode='u';
function renderCompare(){
  if(!S.cmpA)S.cmpA=[];
  $('cmpSeg').querySelectorAll('button').forEach(x=>x.classList.toggle('is-on',x.dataset.cm===cmpMode));
  if(cmpMode==='u'){
    $('cpick').innerHTML=S.saved.map(id=>{const u=uni(id),on=S.cmp.includes(id);return `<label class="${on?'is-on':''}"><input type="checkbox" data-ucmpchk="${id}"${on?' checked':''}>${u.name}<button data-usave="${id}" aria-label="관심 해제">✕</button></label>`;}).join('');
    $('cmpCount').textContent=`관심 대학 ${S.saved.length}곳 · 비교 중 ${S.cmp.length}/3`;
    const c=S.cmp.map(uni);
    if(!c.length){$('ctable').innerHTML=`<div class="empty-r"><b>${S.saved.length?'비교할 대학을 골라주세요':'아직 저장한 대학이 없어요'}</b>${S.saved.length?'위에서 최대 3곳까지 체크하세요.':'대학정보에서 🤍를 눌러 저장하세요.'}</div>`;return;}
    const mine=myMajors();const row=(t,fn)=>`<tr><th>${t}</th>${c.map(u=>`<td>${fn(u)}</td>`).join('')}</tr>`;
    $('ctable').innerHTML=`<div class="ctable-w"><table class="ctable"><thead><tr><th></th>${c.map(u=>`<th>${u.name}<div class="xcard__cat" style="margin-top:4px">${u.region} · ${u.type}</div></th>`).join('')}</tr></thead><tbody>
    ${row('규모 · 설립',u=>`${u.size} · ${u.estab}년`)}${row('재학생',u=>u.students)}${row('기숙사',u=>u.dorm)}${row('등록금 범위',u=>u.tuition)}
    ${row('내 관심 학과',u=>{const h=u.majors.filter(m=>mine.includes(m));return h.length?`<div class="lchips">${h.map(m=>`<span style="background:#E7F8F0;color:#0E8A57">${major(m).name}</span>`).join('')}</div>`:'<span style="color:var(--ink-3)">없음</span>';})}
    ${row('수시 전형',u=>ADMS.filter(a=>a.uni===u.id&&a.season==='수시').map(a=>`<div>${a.name} <small style="color:var(--ink-3)">· ${a.kind}</small></div>`).join('')||'–')}
    ${row('정시 전형',u=>ADMS.filter(a=>a.uni===u.id&&a.season==='정시').map(a=>`<div>${a.name}</div>`).join('')||'–')}
    ${row('수능최저 없는 수시',u=>{const n=ADMS.filter(a=>a.uni===u.id&&a.season==='수시'&&a.minType==='반영안함').length;return n?`${n}개`:'없음';})}
    ${row('특징',u=>u.feats.join(', '))}</tbody></table></div>`;
  } else {
    $('cpick').innerHTML=S.adms.map(id=>{const a=adm(id),on=S.cmpA.includes(id);return `<label class="${on?'is-on':''}"><input type="checkbox" data-acmpchk="${id}"${on?' checked':''}>${uni(a.uni).name} ${a.name}<button data-asave="${id}" aria-label="관심 해제">✕</button></label>`;}).join('');
    $('cmpCount').textContent=`관심 전형 ${S.adms.length}개 · 비교 중 ${S.cmpA.length}/3`;
    const c=S.cmpA.map(adm);
    if(!c.length){$('ctable').innerHTML=`<div class="empty-r"><b>${S.adms.length?'비교할 전형을 골라주세요':'아직 저장한 전형이 없어요'}</b>${S.adms.length?'위에서 최대 3개까지 체크하세요.':'전형정보에서 🤍를 눌러 저장하세요.'}</div>`;return;}
    const row=(t,fn)=>`<tr><th>${t}</th>${c.map(a=>`<td>${fn(a)}</td>`).join('')}</tr>`;
    $('ctable').innerHTML=`<div class="ctable-w"><table class="ctable"><thead><tr><th></th>${c.map(a=>`<th>${a.name}<div class="xcard__cat" style="margin-top:4px">${uni(a.uni).name}</div></th>`).join('')}</tr></thead><tbody>
    ${row('모집시기',a=>a.season==='수시'?'수시':'정시 '+a.group+'군')}${row('전형유형',a=>a.kind)}
    ${row('전형 방법',a=>`<div class="elems">${a.elems.map(e=>`<div class="elem" style="padding:8px;min-width:60px"><b style="font-size:16px">${e[1]}%</b><span>${e[0]}</span></div>`).join('')}</div><div class="xcard__cat" style="margin-top:6px">${a.stage}</div>`)}
    ${row('수능최저',a=>a.minReq)}${row('그 밖의 요건',a=>a.reqNote||'–')}${row('제출·응시',a=>a.docs.join(', '))}
    ${row('모집 학과',a=>`<div class="lchips">${a.majorIds.map(m=>`<span>${major(m).name}</span>`).join('')}</div>`)}
    ${row('전년도 평균등급 (참고)',a=>a.prev!=null?a.prev.toFixed(1)+'등급':'–')}
    ${row('어울리는 학생',a=>KINDS[a.kind][1])}</tbody></table></div><p class="hint">전형 비교는 요건을 나란히 보는 표입니다. 어느 쪽이 유리한지는 상담에서 성적과 함께 봅니다</p>`;
  }
}
/* ── 수시 / 정시 : 상세 필터 (어디가 방식 · 2027.5 오픈 · 내신 5등급제 기준) ── */
const HELP={'학생부위주(교과)':'내신 등급을 대학별 방식으로 점수화해 뽑는 전형','학생부위주(종합)':'학생부 전체(교과·활동·세특)를 종합 평가','실기/실적위주':'전공 실기나 수상 실적을 중심으로 선발','논술위주':'대학별 논술고사 중심','수능위주':'수능 성적 중심 (정시)','전형요소':'전형에서 점수로 반영하는 항목','학생부':'학생부 교과 성적 또는 서류 평가','서류':'학생부 등 제출 서류의 정성 평가','수능반영영역':'정시 또는 수능최저에서 반영하는 영역','전년도 입시결과':'대학이 공개한 전년도 합격자 평균 등급 범위(5등급제 환산 · 참고용). 내 성적과의 비교는 상담에서 합니다'};
const ELEM_MAP={'교과':'학생부','서류':'서류','면접':'면접/구술','논술':'논술','실기':'실기','수능':'수능','출결':'기타'};
const KIND_MAP={'학생부교과':'학생부위주(교과)','학생부종합':'학생부위주(종합)','실기':'실기/실적위주','논술':'논술위주','수능':'수능위주'};
const FDEF=()=>({group:new Set(),kind:new Set(),elem:new Set(),min:new Set(),sat:new Set(),unspec:new Set(),night:new Set(),prev:[1,5],region:new Set(),major:'',q:''});
let af=FDEF(),afDraft=FDEF(),fOpen=false,aView='table';
const clone=o=>({...o,group:new Set(o.group),kind:new Set(o.kind),elem:new Set(o.elem),min:new Set(o.min),sat:new Set(o.sat),unspec:new Set(o.unspec),night:new Set(o.night),region:new Set(o.region),prev:[...o.prev]});
const nActive=o=>['group','kind','elem','min','sat','unspec','night','region'].reduce((n,k)=>n+(o[k].size?1:0),0)+((o.prev[0]>1||o.prev[1]<5)?1:0)+(o.major?1:0);
function passes(a,o,season){const u=uni(a.uni);
  if(o.group.size&&!o.group.has(a.group))return false;
  if(o.kind.size&&!o.kind.has(KIND_MAP[a.kind]))return false;
  if(o.elem.size){const el=new Set(a.elems.map(e=>ELEM_MAP[e[0]]||'기타'));if(a.stage==='2단계'&&a.docs.includes('면접'))el.add('면접/구술');if(![...o.elem].some(x=>el.has(x)))return false;}
  if(o.min.size&&!o.min.has(a.minType))return false;
  if(o.sat.size&&![...o.sat].some(x=>a.sat.includes(x)))return false;
  if(o.unspec.size&&!o.unspec.has(a.unspec?'포함':'제외'))return false;
  if(o.night.size&&!o.night.has(a.night?'야간':'주간'))return false;
  if(a.prev!=null&&(a.prev<o.prev[0]||a.prev>o.prev[1]))return false;
  if(o.region.size&&!o.region.has(u.region))return false;
  if(o.major&&!a.majorIds.includes(o.major))return false;
  if(o.q&&!(a.name+u.name).includes(o.q))return false;
  return true;}
const cb=(k,v,label,help)=>`<label class="cbx${afDraft[k].has(v)?' is-on':''}"><input type="checkbox" data-fk="${k}" data-fv="${v}"${afDraft[k].has(v)?' checked':''}><span>${label||v}</span>${help?`<button type="button" class="help" data-help="${help}" aria-label="설명">?</button>`:''}</label>`;
function renderFilterPanel(season){
  const groups=season==='수시'?['수시','자율']:['가','나','다','추가'];const gl={'수시':'수시','자율':'전형기간 자율','가':'정시(가)','나':'정시(나)','다':'정시(다)','추가':'추가'};
  const kinds=season==='수시'?['학생부위주(교과)','학생부위주(종합)','실기/실적위주','논술위주','기타']:['수능위주','실기/실적위주','기타'];
  const row=(t,inner,help)=>`<div class="frow"><div class="frow__t">${t}${help?`<button type="button" class="help" data-help="${help}" aria-label="설명">?</button>`:''}</div><div class="frow__b">${inner}</div></div>`;
  $('fPanel').innerHTML=`
  ${row('모집시기',groups.map(g=>cb('group',g,gl[g])).join(''))}
  ${row('전형유형',kinds.map(k=>cb('kind',k,k,HELP[k])).join(''))}
  ${row('전형요소',['학생부','수능','면접/구술','논술','실기','서류','기타'].map(k=>cb('elem',k,k,HELP[k])).join(''),HELP['전형요소'])}
  ${row('최저학력기준',['수능','학생부','반영안함'].map(k=>cb('min',k)).join(''))}
  ${row('수능반영영역',['국어','수학','영어','탐구영역','제2외국어/한문','한국사'].map(k=>cb('sat',k)).join(''),HELP['수능반영영역'])}
  ${row('모집단위 미지정 모집',['포함','제외'].map(k=>cb('unspec',k)).join(''))}
  ${row('주야간 구분',['주간','야간'].map(k=>cb('night',k)).join(''))}
  ${row('전년도 입시결과',`<div class="rng2"><div class="rng2__track"><div class="rng2__fill" id="rgFill"></div><input type="range" min="1" max="5" step="0.5" id="rgLo" value="${afDraft.prev[0]}" aria-label="최소 등급"><input type="range" min="1" max="5" step="0.5" id="rgHi" value="${afDraft.prev[1]}" aria-label="최대 등급"></div><div class="rng2__lab"><b id="rgLoT">${afDraft.prev[0]}등급</b><span>5등급제 · 대학 공개 평균등급 (참고)</span><b id="rgHiT">${afDraft.prev[1]}등급</b></div></div>`,HELP['전년도 입시결과'])}
  ${row('지역',REGIONS.map(k=>cb('region',k)).join(''))}
  <div class="fapply"><button class="btn btn--ghost btn--pill" id="fClear">초기화</button><button class="btn btn--primary btn--pill" id="fApply" style="min-width:160px">적용${nActive(afDraft)?' ('+nActive(afDraft)+')':''}</button></div>`;
  updRange();
}
function updRange(){const lo=$('rgLo'),hi=$('rgHi');if(!lo)return;let a=+lo.value,b=+hi.value;if(a>b){[a,b]=[b,a];}afDraft.prev=[a,b];$('rgLoT').textContent=a+'등급';$('rgHiT').textContent=b+'등급';$('rgFill').style.left=((a-1)/4*100)+'%';$('rgFill').style.right=(100-(b-1)/4*100)+'%';}
function renderAdms(season){
  const kinds=[...new Set(ADMS.filter(a=>a.season===season).map(a=>a.kind))];
  $('aMajor').innerHTML=['<option value="">전체 학과</option>',...MAJORS.map(m=>`<option value="${m.id}"${af.major===m.id?' selected':''}>${m.name}${myMajors().includes(m.id)?' ♥':''}</option>`)].join('');
  const L=ADMS.filter(a=>a.season===season&&passes(a,af,season));
  const n=nActive(af);
  $('aCnt').innerHTML=`전형 <em>${L.length}</em>개${n?` <span class="chip chip--time">필터 ${n}개 적용 중</span>`:''}`;
  $('fToggle').textContent=(fOpen?'상세 필터 닫기 ▲':'상세 필터 열기 ▼')+(n?' · '+n:'');
  $('fPanelWrap').style.display=fOpen?'':'none';if(fOpen)renderFilterPanel(season);
  $('aKinds').innerHTML=kinds.map(k=>`<button class="kcard${af.kind.has(KIND_MAP[k])&&af.kind.size===1?' is-on':''}" data-akq="${KIND_MAP[k]}"><b>${k}</b><span>${KINDS[k][0]}</span><small>${KINDS[k][1]}</small></button>`).join('');
  $('aView').querySelectorAll('button').forEach(x=>x.classList.toggle('is-on',x.dataset.aview===aView));
  $('aList').innerHTML=L.length?(aView==='table'?`<div class="ctable-w"><table class="ctable utbl"><thead><tr><th>시기</th><th>대학</th><th>전형명</th><th>유형</th><th>모집단위</th><th>전형 방법</th><th>최저</th><th>전년도<br>등급</th><th></th></tr></thead><tbody>${L.map(atrow).join('')}</tbody></table></div>`:L.map(arow).join('')):`<div class="empty-r"><b>조건에 맞는 전형이 없어요</b>필터를 줄여보세요.</div>`;
  $('aSaved').innerHTML=S.adms.length?`<h3 class="lib__h">❤️ 관심 전형 ${S.adms.length}개</h3><div class="alist">${S.adms.map(adm).filter(a=>a.season===season).map(arow).join('')||'<p class="hint">이 시기에 저장한 전형이 없어요</p>'}</div>`:'';
}
/* ── 나에게 맞는 전형 탐색 ── */
let ans=[];
function renderFit(){
  const i=ans.length;
  if(i<QUIZ.length){const [q,opts]=QUIZ[i];$('fitBox').innerHTML=`<div class="qz__prog">${QUIZ.map((_,k)=>`<i class="${k<i?'on':k===i?'cur':''}"></i>`).join('')}<span>${i+1} / ${QUIZ.length}</span></div><h3>${q}</h3><div class="qz__opts">${opts.map((o,k)=>`<button class="qz__opt" data-fa="${k}">${o[0]}</button>`).join('')}</div>${i?'<button class="link" data-fback>← 이전</button>':''}`;return;}
  const sc={};ans.forEach((a,qi)=>Object.entries(QUIZ[qi][1][a][1]).forEach(([k,v])=>sc[k]=(sc[k]||0)+v));
  const top=Object.entries(sc).sort((a,b)=>b[1]-a[1]).filter(x=>x[1]>0).slice(0,2);
  const mine=myMajors();
  $('fitBox').innerHTML=`<div class="qz__prog">${QUIZ.map(()=>'<i class="on"></i>').join('')}<span>결과</span></div><h3>먼저 살펴볼 전형 종류</h3><p style="margin:-6px 0 4px;color:var(--ink-2);font-size:14.5px">답변을 바탕으로 고른 '출발점'이에요. 어느 전형이 유리한지는 성적과 학생부를 보고 선생님과 정해요.</p>
  <div class="qz__res">${top.map(([k],idx)=>`<div class="qz__card${idx?'':' is-1'}"><small>${idx?'함께 살펴볼 전형':'먼저 살펴볼 전형'}</small><b>${k}</b><p>${KINDS[k][0]}</p><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn--ghost btn--pill" href="#${k==='수능'?'jeongsi':'susi'}" data-kind="${k}">${k} 전형 보기</a></div></div>`).join('')}</div>
  ${mine.length?`<p class="hint" style="margin:0">내 관심 학과(${mine.map(m=>major(m).name).join(', ')})로 뽑는 ${top[0]?top[0][0]:''} 전형: <b>${ADMS.filter(a=>top[0]&&a.kind===top[0][0]&&a.majorIds.some(m=>mine.includes(m))).length}개</b></p>`:''}
  <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn--primary btn--pill" href="counsel.html#book">이 결과로 상담 신청</a><button class="link" data-freset>다시 해보기 ↺</button></div>`;
}
/* ── 용어 / 변화 / 자료 ── */
let tc='전체',tq='',openT=-1;
function renderTerms(){const cats=['전체',...new Set(TERMS.map(t=>t[2]))];$('tTabs').innerHTML=cats.map(c=>`<button class="fchip${tc===c?' is-on':''}" data-tc="${c}">${c}</button>`).join('');
  const L=TERMS.map((t,i)=>[t,i]).filter(([t])=>(tc==='전체'||t[2]===tc)&&(!tq||(t[0]+t[1]).includes(tq)));
  $('tList').innerHTML=L.length?L.map(([t,i])=>`<li class="faq${openT===i?' is-on':''}"><button class="faq__q" data-tq="${i}" aria-expanded="${openT===i}"><span style="font-size:11px">${t[2]}</span><b>${t[0]}</b><i>${openT===i?'−':'+'}</i></button><div class="faq__a"><p>${t[1]}</p></div></li>`).join(''):'<li class="empty-r"><b>찾는 용어가 없어요</b></li>';}
let cy=A.logged()?'2028':'';
function renderChanges(){$('cWho').innerHTML=CHANGES.map(c=>`<button class="fchip${cy===c.y?' is-on':''}" data-cy="${c.y}">${c.y}학년도 · ${c.who}${A.logged()&&c.y==='2028'?' (나)':''}</button>`).join('');
  const L=CHANGES.filter(c=>!cy||c.y===cy);
  $('cList').innerHTML=L.map(c=>`<li class="pol"><span class="pol__y">${c.y}</span><div class="pol__c">${A.logged()&&c.y==='2028'?'<span class="st st--ok">내 학년</span>':''}<h3>${c.y}학년도 대입 · ${c.who}</h3><ul style="margin:0;padding-left:18px;color:var(--ink-2);display:flex;flex-direction:column;gap:4px">${c.items.map(x=>`<li>${x}</li>`).join('')}</ul></div></li>`).join('');}
function renderDocs(){$('docList').innerHTML=DOCS.map(d=>`<li class="row"><span class="row__ic">${d[4]==='PDF'?'📄':'🔗'}</span><button class="row__main" data-toast="${d[4]==='PDF'?'자료를 내려받습니다':'해당 사이트로 이동합니다'} · ${d[0]}"><b>${d[0]}</b><span>${d[1]} · ${d[2]} · ${d[3]}</span></button><div class="row__files"><button class="file" data-toast="${d[0]}">${d[4]}</button></div></li>`).join('');}
/* ── 탭 ── */
let tab='find';
function renderTray(){$('tray').classList.toggle('is-on',S.cmp.length>0&&(tab==='find'||tab==='detail'));$('trayN').textContent=`비교함 ${S.cmp.length}/3`;$('trayItems').innerHTML=S.cmp.map(id=>`<span>${uni(id).name}</span>`).join('');}
function rerender(){const g=GROUP[tab];
  $('ptabs').innerHTML=Object.keys(L3).filter(k=>GROUP[k]===g).map(k=>`<a class="ptab${k===tab?' is-on':''}" href="#${k}">${L3[k]}${k==='compare'?` <small id="tabSaved">${S.saved.length}</small>`:''}</a>`).join('');
  document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('is-on',p.id==='pane-'+(['susi','jeongsi'].includes(tab)?'adms':tab)));
  $('crumbL2').textContent=L2[g];$('crumbL3').textContent=L3[tab];$('h1').textContent=L2[g];
  $('hdesc').textContent=g==='u'?'대학정보 → 학과정보 → 전형정보 순서로 이어 보며 관심 대학·학과·전형을 저장하고 비교하세요. 합격 가능성은 다루지 않고, 정보 확인까지만 돕습니다.':g==='a'?'전형의 종류와 요건을 이해하는 화면입니다. 내 성적으로 어디가 가능한지는 상담에서 선생님과 함께 봅니다.':'대입 제도와 용어, 학년도별 변화, 공식 자료를 모았습니다.';
  if(g==='u'&&!A.logged()){$('uNote').innerHTML='로그인하면 관심 학과를 바탕으로 대학을 추천하고, 관심 대학을 저장할 수 있어요 <a class="link" href="#" data-loginopen>로그인 ›</a>';$('uNote').style.display='';}else $('uNote').style.display='none';
  if(tab==='susi'||tab==='jeongsi'){$('aTitle').textContent=tab==='susi'?'수시 전형':'정시 전형';$('aSub').textContent=tab==='susi'?'9월 원서 접수 · 최대 6회 지원 · 학생부교과·학생부종합·논술·실기':'12~1월 원서 접수 · 가·나·다군 각 1회 · 수능 성적 중심';renderAdms(tab==='susi'?'수시':'정시');}
  else ({find:renderFind,detail:renderDetail,majorinfo:renderMajorInfo,compare:renderCompare,fit:renderFit,terms:renderTerms,changes:renderChanges,docs:renderDocs})[tab]();
  renderTray();$('tabSaved')&&($('tabSaved').textContent=S.saved.length);}
function setTab(){let h=(location.hash||'#find').slice(1);const Q=new URLSearchParams(location.search);if(h==='detail'&&!dUni&&Q.get('uni'))dUni=Q.get('uni');tab=h;if(!L3[tab])tab='find';document.querySelectorAll('#lnb a').forEach(a=>a.classList.toggle('is-cur',a.getAttribute('href')==='univ.html#'+tab||(tab==='detail'&&a.getAttribute('href')==='univ.html#find')));document.title=L3[tab]+' | 서울 진로진학 통합플랫폼';rerender();}
$('lnb').dataset.current={find:'조건으로 대학 찾기',detail:'조건으로 대학 찾기',majorinfo:'대학·학과 상세',compare:'대학·학과 비교'}[(location.hash||'#find').slice(1)]||L3[(location.hash||'#find').slice(1)]||'조건으로 대학 찾기';
addEventListener('hashchange',()=>{setTab();scrollTo({top:document.querySelector('.ptabs').offsetTop-90,behavior:'smooth'});});
document.addEventListener('sen-auth',()=>{cy=A.logged()?'2028':'';rerender();});
document.addEventListener('click',e=>{const c=x=>e.target.closest(x);let b;
  if(b=c('[data-usave]')){e.stopPropagation();if(needLogin('관심 대학 저장은 로그인 후 이용할 수 있어요'))return;const id=b.dataset.usave,i=S.saved.indexOf(id);if(i>-1){S.saved.splice(i,1);S.cmp=S.cmp.filter(x=>x!==id);}else S.saved.push(id);save();showToast(i>-1?'관심 대학에서 뺐어요':'관심 대학에 저장했어요 · 나의 진로진학에서도 볼 수 있어요');rerender();return;}
  if(b=c('[data-ucmp]')){e.stopPropagation();const id=b.dataset.ucmp,i=S.cmp.indexOf(id);if(i>-1)S.cmp.splice(i,1);else{if(S.cmp.length>=3){showToast('비교함은 최대 3곳까지 담을 수 있어요');return;}S.cmp.push(id);if(!S.saved.includes(id))S.saved.push(id);}save();showToast(i>-1?'비교함에서 뺐어요':'비교함에 담았어요');rerender();return;}
  if(b=c('[data-asave]')){e.stopPropagation();if(needLogin('관심 전형 저장은 로그인 후 이용할 수 있어요'))return;const id=b.dataset.asave,i=S.adms.indexOf(id);i>-1?S.adms.splice(i,1):S.adms.push(id);save();showToast(i>-1?'관심 전형에서 뺐어요':'관심 전형에 저장했어요');rerender();if(b.dataset.redraw)openAdm(id);return;}
  if(b=c('[data-uni]')){if(c('[data-usave],[data-ucmp]'))return;dUni=b.dataset.uni;dTab='over';dMajor=null;if(tab==='detail')renderDetail();else location.hash='#detail';return;}
  if(b=c('[data-dt]')){dTab=b.dataset.dt;renderDetail();return;}
  if(b=c('[data-rm]')){dMajor=b.dataset.rm;renderDetail();return;}
  if(b=c('[data-mj]')){e.preventDefault();mjSel=b.dataset.mj;if(tab==='majorinfo')renderMajorInfo();else location.hash='#majorinfo';return;}
  if(b=c('[data-mjc]')){mjCat=b.dataset.mjc;renderMajorInfo();return;}
  if(b=c('[data-mjsave]')){if(needLogin('관심 학과 저장은 로그인 후 이용할 수 있어요'))return;const on=store.toggleSave('majors',b.dataset.mjsave);showToast(on?'관심 학과에 저장했어요':'관심 학과에서 뺐어요');rerender();return;}
  if(b=c('[data-majorgo]')){af=FDEF();af.major=b.dataset.majorgo;afDraft=clone(af);return;}
  if(b=c('[data-acmp]')){e.stopPropagation();if(!S.cmpA)S.cmpA=[];const id=b.dataset.acmp,i=S.cmpA.indexOf(id);if(i>-1)S.cmpA.splice(i,1);else{if(S.cmpA.length>=3){showToast('전형 비교는 최대 3개까지예요');return;}S.cmpA.push(id);if(!S.adms.includes(id))S.adms.push(id);}save();showToast(i>-1?'전형 비교에서 뺐어요':'전형 비교함에 담았어요 · 대학·전형 비교에서 확인하세요');rerender();if(b.dataset.redraw)openAdm(id);return;}
  if(b=c('[data-cm]')){cmpMode=b.dataset.cm;renderCompare();return;}
  if(b=c('[data-adm]')){if(c('[data-asave],[data-acmp]'))return;openAdm(b.dataset.adm);return;}

  if(b=c('[data-view]')){f.view=b.dataset.view;renderFind();return;}
  if(b=c('[data-aview]')){aView=b.dataset.aview;rerender();return;}
  if(b=c('[data-fs]')){const v=b.dataset.fs;f.size.has(v)?f.size.delete(v):f.size.add(v);renderFind();return;}
  if(b=c('[data-du]')){dUni=b.dataset.du;dMajor=null;renderDetail();return;}
  if(b=c('[data-dm]')){dMajor=b.dataset.dm;renderDetail();return;}
  if(b=c('[data-fr]')){const v=b.dataset.fr;f.region.has(v)?f.region.delete(v):f.region.add(v);renderFind();return;}
  if(b=c('[data-ft]')){f.type=b.dataset.ft;renderFind();return;}
  if(b=c('[data-fc]')){f.cat=b.dataset.fc;f.major='';renderFind();return;}
  if(c('#fMine')){f.mine=!f.mine;renderFind();return;}
  if(c('#fReset')){f.region.clear();f.type='';f.size.clear();f.cat='';f.major='';f.q='';f.mine=false;$('uQ').value='';renderFind();return;}
  if(b=c('[data-akq]')){const v=b.dataset.akq;af.kind=(af.kind.has(v)&&af.kind.size===1)?new Set():new Set([v]);afDraft=clone(af);rerender();return;}
  if(b=c('[data-kind]')){af=FDEF();af.kind=new Set([KIND_MAP[b.dataset.kind]||b.dataset.kind]);afDraft=clone(af);return;}
  if(b=c('[data-help]')){e.preventDefault();showToast(b.dataset.help);return;}
  if(c('#fToggle')){fOpen=!fOpen;afDraft=clone(af);rerender();return;}
  if(c('#fApply')){af=clone(afDraft);fOpen=false;rerender();showToast(nActive(af)?'필터 '+nActive(af)+'개를 적용했어요':'모든 전형을 보여드려요');return;}
  if(c('#fClear')){afDraft=FDEF();afDraft.q=af.q;renderFilterPanel(tab==='susi'?'수시':'정시');return;}
  if(b=c('[data-fa]')){ans.push(+b.dataset.fa);renderFit();return;}
  if(c('[data-fback]')){ans.pop();renderFit();return;}
  if(c('[data-freset]')){ans=[];renderFit();return;}
  if(b=c('[data-tc]')){tc=b.dataset.tc;renderTerms();return;}
  if(b=c('[data-tq]')){const i=+b.dataset.tq;openT=openT===i?-1:i;renderTerms();return;}
  if(b=c('[data-cy]')){cy=cy===b.dataset.cy?'':b.dataset.cy;renderChanges();return;}
});
document.addEventListener('input',e=>{if(e.target.id==='rgLo'||e.target.id==='rgHi')updRange();});
document.addEventListener('change',e=>{const fk=e.target.closest('[data-fk]');if(fk){const k=fk.dataset.fk,v=fk.dataset.fv;e.target.checked?afDraft[k].add(v):afDraft[k].delete(v);fk.closest('label').classList.toggle('is-on',e.target.checked);const ap=$('fApply');if(ap)ap.textContent='적용'+(nActive(afDraft)?' ('+nActive(afDraft)+')':'');return;}if(e.target.id==='fMajor'){f.major=e.target.value;renderFind();}if(e.target.id==='aMajor'){af.major=e.target.value;afDraft.major=af.major;rerender();}if(e.target.id==='dSel'&&e.target.value){dUni=e.target.value;dTab='over';dMajor=null;renderDetail();}if(e.target.id==='uSort'){f.sort=e.target.value;renderFind();}
  const ack=e.target.closest('[data-acmpchk]');if(ack){const id=ack.dataset.acmpchk,i=S.cmpA.indexOf(id);if(i>-1)S.cmpA.splice(i,1);else{if(S.cmpA.length>=3){ack.checked=false;showToast('최대 3개까지 비교할 수 있어요');return;}S.cmpA.push(id);}save();rerender();}
  const ck=e.target.closest('[data-ucmpchk]');if(ck){const id=ck.dataset.ucmpchk,i=S.cmp.indexOf(id);if(i>-1)S.cmp.splice(i,1);else{if(S.cmp.length>=3){ck.checked=false;showToast('최대 3곳까지 비교할 수 있어요');return;}S.cmp.push(id);}save();rerender();}});
$('uQ').addEventListener('input',e=>{f.q=e.target.value.trim();renderFind();});
$('aQ').addEventListener('input',e=>{af.q=e.target.value.trim();afDraft.q=af.q;rerender();});
$('tQ').addEventListener('input',e=>{tq=e.target.value.trim();openT=-1;renderTerms();});
setTab();
})();
