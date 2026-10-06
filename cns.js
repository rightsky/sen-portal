/* 08 교사 상담 준비 어시스턴트 (cns.html) · AI-CNS-01~05 · 데이터: cns-data.js (합성 200명) */
(function(){
const D=window.CNS_DATA;const $=id=>document.getElementById(id);
const K='sen-cns-v1';let P=JSON.parse(localStorage.getItem(K)||'{"dec":{},"share":{},"edit":{}}');const save=()=>localStorage.setItem(K,JSON.stringify(P));
const DETAIL=Object.fromEntries(D.상세.map(d=>[d.id,d]));
const CLS3=D.학생.filter(s=>s.반===3).sort((a,b)=>a.번호-b.번호);
let role='담임',evalMode=false,selId=CLS3.slice().sort((a,b)=>b.우선점수-a.우선점수)[0].id,tab='프로파일',sort='priority',filter='';
const T=['프로파일','사전 입력서','상담 브리프','공유'];
const stBadge=st=>({'초안':['초안','st--draft'],'검토 중':['검토 중','st--rev'],'확정':['확정','st--ok2'],'학생 공유':['학생 공유','st--share']}[st]||[st,'st--draft']);
const briefState=id=>{const d=DETAIL[id];if(!d||!d.브리프)return null;const ov=P.dec[id]||{};const n=d.브리프.항목.length,done=Object.keys(ov).length;
  if(P.share[id])return '학생 공유';if(d.브리프.상태==='학생 공유'&&P.share[id]!==false)return '학생 공유';
  if(done===n)return '확정';if(done>0)return '검토 중';return d.브리프.상태==='확정'?'확정':d.브리프.상태==='학생 공유'?'확정':'초안';};
/* C1 */
function renderList(){
  const pri=CLS3.filter(s=>s.우선점수>=4).length,chk=CLS3.filter(s=>s.규칙.some(r=>r!=='R4')).length,re=CLS3.filter(s=>s.규칙.includes('R4')).length;
  const brDone=CLS3.filter(s=>['확정','학생 공유'].includes(briefState(s.id))).length;
  $('kpis').innerHTML=[['상담 우선',pri+'명','우선점수 4 이상'],['검사 확인 필요',chk+'명','규칙 R1~R3 · R5~R7'],['재실시 필요',re+'명','응답 이상 (R4)'],['브리프 확정',brDone+' / '+CLS3.length,'교사 확정 기준']].map(x=>`<div class="ckpi"><span>${x[0]}</span><b>${x[1]}</b><small>${x[2]}</small></div>`).join('');
  const dist=(key,labels)=>{const c={};CLS3.forEach(s=>c[s[key]]=(c[s[key]]||0)+1);return labels.filter(l=>c[l]).map((l,i)=>`<div class="dist-r"><span>${l}</span><div class="dist-t"><i class="d${i}" style="width:${c[l]/CLS3.length*100}%"></i></div><b>${c[l]}</b></div>`).join('');};
  $('dists').innerHTML=`<div><h4>진로개발역량 유형</h4>${dist('개발역량유형',['자기주도 진로개발자','탐색 중 진로개발자','계획형 진로개발자','멈춰있는 진로개발자'])}</div><div><h4>진로실행력 증폭유형</h4>${dist('증폭유형',['상승형','유지형','성장필요형'])}</div>`;
  let L=CLS3.slice();
  if(filter==='pri')L=L.filter(s=>s.우선점수>=4);
  if(filter==='chk')L=L.filter(s=>s.규칙.some(r=>r!=='R4'));
  if(filter==='re')L=L.filter(s=>s.규칙.includes('R4'));
  if(filter==='br')L=L.filter(s=>!['확정','학생 공유'].includes(briefState(s.id)));
  if(sort==='priority')L.sort((a,b)=>b.우선점수-a.우선점수||a.번호-b.번호);
  $('fchips').innerHTML=[['pri','상담 우선'],['chk','검사 확인 필요'],['re','재실시 필요'],['br','브리프 미확정']].map(([k,l])=>`<button class="fchip${filter===k?' is-on':''}" data-f="${k}" aria-pressed="${filter===k}">${l}</button>`).join('');
  $('cnt').textContent=L.length+'명';
  $('list').innerHTML=L.map(s=>{const bs=briefState(s.id),[bl,bc]=stBadge(bs);const tags=s.우선사유.slice(0,2);
    return `<button class="srow${s.id===selId?' is-sel':''}" data-sid="${s.id}" aria-pressed="${s.id===selId}"><span class="srow__no">${s.번호}</span><span class="srow__m"><b>${s.이름}</b><small>${s.희망[2]||s.희망[1]||'–'}</small>${tags.length?`<span class="srow__tags">${tags.map(t=>`<i>${t}</i>`).join('')}${s.우선사유.length>2?`<i>외 ${s.우선사유.length-2}</i>`:''}</span>`:''}</span><span class="st ${bc}">${bl}</span></button>`;}).join('');
}
/* C2 */
const G=['국어','수학','영어','사회','과학'];
function profile(d,s){
  const tl=s.희망.map((h,i)=>{const chg=i>0&&h!==s.희망[i-1];return `<div class="tl-s"><small>${i+1}학년</small><b>${h||'–'}</b>${chg?'<em>변경</em>':''}</div>`;}).join('<span class="tl-a">→</span>');
  const grades=`<div class="ctable-w"><table class="ctbl"><thead><tr><th>교과</th><th>1학년</th><th>2학년</th><th>3학년</th></tr></thead><tbody>${G.map(g=>`<tr><th>${g}</th>${['1학년','2학년','3학년'].map(y=>{const v=d.학년별등급[y][g];return `<td>${v==null?'–':v.toFixed(1)}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>`;
  const t=d.검사,avgEff=Object.values(t.효능감).reduce((a,b)=>a+b,0)/9;
  const topApt=Object.entries(t.적성).filter(([k,v])=>typeof v==='number').sort((a,b)=>b[1]-a[1]).slice(0,3);
  const ri=['R','I','A','S','E','C'].map(k=>[k,t.흥미[k]]).sort((a,b)=>b[1]-a[1]);
  const effLow=Object.entries(t.효능감).filter(([k,v])=>v<avgEff-5&&v<45).map(x=>x[0]);
  const vals=Object.entries(t.가치관.점수).sort((a,b)=>a[1]-b[1]).slice(0,3).map(x=>x[0]);
  const cards=[
    ['직업흥미검사(H)',`일반흥미 상위 ${ri[0][0]}·${ri[1][0]} · 선호직업 ${t.흥미.선호1}·${t.흥미.선호2} · ${t.흥미.일치정도}`,`<dl class="mini-kv">${ri.map(([k,v])=>`<div><dt>${k}</dt><dd>${v.toFixed(1)}</dd></div>`).join('')}<div><dt>설문성실도</dt><dd>${t.흥미.설문성실도}</dd></div></dl>`],
    ['직업적성검사',`상위 ${topApt.map(x=>x[0]).join(' · ')}`,`<dl class="mini-kv">${topApt.map(([k,v])=>`<div><dt>${k}</dt><dd>백분위 ${v}</dd></div>`).join('')}<div><dt>응답성실도</dt><dd>${t.적성.응답성실도}</dd></div></dl>`],
    ['진로개발 효능감',effLow.length?`보완 판정: ${effLow.join(', ')}`:'보완 판정 영역 없음',`<dl class="mini-kv">${Object.entries(t.효능감).map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`],
    ['직업가치관검사',`${t.가치관.유형} · 중요가치 ${t.가치관.중요가치.join(' · ')}`,`<dl class="mini-kv">${Object.entries(t.가치관.점수).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl><p class="hint2">점수 하위 3개: ${vals.join(', ')}</p>`],
    ['진로개발역량검사',`${t.개발역량.유형} · 설계 ${t.개발역량.설계} · 준비 ${t.개발역량.준비}`,`<dl class="mini-kv">${['자기이해','직업이해','진로탐색','진로계획','낙관성','지속성','호기심','유연성','도전성','의사소통'].map(k=>`<div><dt>${k}</dt><dd>${t.개발역량[k]}</dd></div>`).join('')}</dl>`],
    ['진로실행력검사',`종합 T ${t.실행력.종합} · 탄력성 반영 T ${t.실행력.탄력성반영} · ${t.실행력.증폭유형}`,`<dl class="mini-kv">${['계획수립력','행동실천력','실천지속력','진로탄력성'].map(k=>`<div><dt>${k}</dt><dd>T ${t.실행력[k]}</dd></div>`).join('')}<div><dt>동일응답비율</dt><dd>${t.실행력.동일응답비율}%</dd></div></dl>`]];
  const rules=d.규칙결과.length?d.규칙결과.map(r=>`<div class="rrow"><b>${r.코드}</b><span>${r.설명}</span><button class="mini" data-rule="${r.코드}">관련 검사 보기</button></div>`).join(''):'<p class="ok-line">검사 결과끼리 크게 어긋나는 곳이 없습니다</p>';
  const allTxt=[...d.창체,...d.세특,...d.행특].map(x=>x.내용||x).join(' ');
  const C3=[['학업역량',['질문','탐구','분석','개념','발표','검증']],['진로역량',['진로','관심','전공','분야','희망']],['공동체역량',['협력','모둠','역할','조정','배려','소통','갈등']]].map(([n2,kws])=>[n2,kws.filter(k=>allTxt.includes(k)).length,kws.length]);
  const hope=(s.희망[2]||'').slice(0,2);
  const rep=hope?d.세특.filter(x=>((x.내용||'')+(x.학년과목||'')).includes(hope)).length:0;
  const comp3=`<div class="rules" style="margin-top:8px">${C3.map(([n2,hit,tot])=>`<div class="rrow"><b>${n2}</b><span>근거 키워드 ${hit}/${tot}개 확인 · ${hit>=3?'기록 흐름이 보임':hit>=1?'근거 적음 — 상담에서 확인':'근거 부족 — 상담에서 확인'}</span></div>`).join('')}${rep>=4?`<div class="rrow" style="border-color:#C43B3B"><b style="color:#C43B3B">⚠ 키워드 반복</b><span>'${hope}' 관련 키워드가 세특 ${rep}과목에 반복됩니다. 모든 과목에 전공 키워드가 붙으면 연결성이 아니라 인위성으로 읽힐 수 있어요 (참고용 · 판단은 교사 확정)</span></div>`:''}<p class="hint2" style="margin:6px 0 0">세 역량 점검·반복 키워드 찾기는 단순 키워드 규칙이에요. 합성 데이터 200명에서 검증 중이며, 결과는 교사 확정 뒤에만 출처와 함께 공유됩니다.</p></div>`;
  const rec=(arr,cls)=>arr.map((c,i)=>`<div class="rec-item" data-rec="${cls}:${i}">${c.학년?`<b>${c.학년}학년 ${c.영역}${c.희망분야?' · 희망 '+c.희망분야:''}</b>`:c.학년과목?`<b>${c.학년과목}</b>`:`<b>${(i+1)}학년 행동특성</b>`}<p>${c.내용||c}</p></div>`).join('');
  return `<p class="reason">열람 사유: 담임 진로 상담 준비 (자동 기록)</p>
  <h3 class="blk-h">진로 경로 타임라인 <span class="src src--syn">생기부</span></h3><div class="tl">${tl}</div>
  <h3 class="blk-h">교과 등급 추이 <span class="src src--syn">생기부</span></h3>${grades}
  <h3 class="blk-h">진로검사 6종 요약 <span class="src src--syn">커리어넷 형식 검사</span></h3>
  <div class="tcards">${cards.map((c,i)=>`<div class="tcard"><div class="tcard__h"><b>${c[0]}</b><button class="mini" data-exp="${i}" aria-expanded="false">펼치기</button></div><p>${c[1]}</p><div class="tcard__d" id="td${i}" hidden>${c[2]}</div><small>커리어넷 형식 · 합성 척도 · 검사일 ${t.검사일}</small></div>`).join('')}</div>
  <h3 class="blk-h">정합성 체크 <span class="src src--rule">규칙</span></h3><div class="rules">${rules}</div>
  <h3 class="blk-h">세 역량 점검표 · 반복 키워드 <span class="src src--rule">규칙</span></h3>${comp3}
  <h3 class="blk-h"><button class="blk-tg" data-tg="rawBlk" aria-expanded="false">생기부 원문 (펼치기) <span class="src src--syn">생기부</span></button></h3>
  <div id="rawBlk" hidden><h4 class="raw-h">창의적 체험활동</h4><div id="rawC">${rec(d.창체,'c')}</div><h4 class="raw-h">3학년 세부능력·특기사항</h4><div id="rawS">${rec(d.세특,'s')}</div><h4 class="raw-h">행동특성 및 종합의견</h4><div id="rawH">${rec(d.행특,'h')}</div></div>`;
}
/* C2b · 사전 입력서 (마스터 플랜 한 장) */
function masterPlan(d,s){
  const g=y=>{const o=d.학년별등급[y],v=G.map(k=>o[k]).filter(x=>x!=null);return v.length?(v.reduce((a,b)=>a+b,0)/v.length).toFixed(1):'–';};
  return `<p class="reason">학생이 상담 예약 시 미리 채운 사전 입력서입니다 · 내신·모의·최저·생기부 자가진단·카드를 한 장에 <span class="src src--syn">학생 작성</span></p>
  <div class="ctable-w"><table class="ctbl"><tbody>
  <tr><th style="width:160px">내신 흐름</th><td>1학년 ${g('1학년')} → 2학년 ${g('2학년')} → 3학년 ${g('3학년')}</td></tr>
  <tr><th>모의고사</th><td>최근 3회 평균·편차는 학생 MY '정시 안정도'에서 동의 시 공유됩니다</td></tr>
  <tr><th>수능최저 자가평가</th><td>"2합 5는 가능, 3합 7은 빠뛯해요" (학생 작성)</td></tr>
  <tr><th>생기부 자가진단</th><td>세 문장 점검 — 수업 속 질문 ○ · 내 역할 ○ · 생각의 변화 △ (학생 작성)</td></tr>
  <tr><th>핵심 탐구 활동</th><td>${d.세특[0]?((d.세특[0].내용||'').slice(0,70)+'…'):'–'}</td></tr>
  <tr><th>희망 수시 카드</th><td>${s.희망[2]||'–'} 계열 중심 4~6장 구상 · 탈락 원인 분산 여부 점검 요청</td></tr>
  <tr><th>상담에서 묻고 싶은 것</th><td>"최저 없는 카드를 하나 더 넣는 게 좋을까요?"</td></tr></tbody></table></div>
  <h3 class="blk-h">전형 유형별 평가 비중 참고 <span class="src src--rule">참고</span></h3>
  <div class="ctable-w"><table class="ctbl"><thead><tr><th></th><th>서류형</th><th>면접형</th></tr></thead><tbody><tr><th>학업역량</th><td><b>상대적으로 높음</b></td><td>보통</td></tr><tr><th>진로역량</th><td>보통</td><td><b>상대적으로 높음</b></td></tr><tr><th>공동체역량</th><td>보통</td><td>보통</td></tr></tbody></table></div>
  <p class="hint2">경향 참고용입니다. 대학별 공개 평가 기준(학종 안내서)으로 확인한 뒤에만 상담 근거로 쓰세요. 사전 입력서는 학생이 수정할 수 있고, 상담 후 후속 과제와 함께 다시 공유됩니다.</p>`;
}
/* C3 */
function brief(d,s){
  const ov=P.dec[s.id]||{},ed=P.edit[s.id]||{};
  if(role==='과목교사')return '<p class="hint2">과목교사 역할에는 상담 브리프 탭이 제공되지 않습니다.</p>';
  const items=d.브리프.항목.map((it,i)=>{const dec=ov[i];const txt=ed[i]??it.문장;
    const ev=it.근거.map(g=>g.인용!=null?`<button class="ev ev--q" data-ev="${encodeURIComponent(g.인용.slice(0,40))}">[${g.원천}] ${g.항목} · "${g.인용.length>42?g.인용.slice(0,42)+'…':g.인용}"</button>`:`<span class="ev">[${g.원천}] ${g.항목} · ${g.값}</span>`).join('');
    return `<div class="bcard${dec==='반려'?' is-rej':''}"><div class="bcard__top"><span class="bk bk--${{'강점':0,'확인 질문':1,'다음 활동':2}[it.구분]}">${it.구분}</span><span class="src src--ai">AI 계산</span></div>
    ${ed[i]!=null?`<p class="bcard__t">${txt}</p><p class="bcard__orig">AI 원문: ${it.문장}</p>`:`<p class="bcard__t" id="bt${i}">${txt}</p>`}
    <div class="bcard__ev">${ev}</div>
    <div class="bcard__act" role="group" aria-label="처리">${['채택','수정','반려'].map(k=>`<button class="mini${dec===k?' is-on':''}" data-dec="${i}:${k}" aria-pressed="${dec===k}">${dec===k?'✓ ':''}${k}</button>`).join('')}</div>
    <div class="bcard__editor" id="bedit${i}" hidden><textarea class="memo" style="min-height:70px">${txt}</textarea><div style="display:flex;gap:8px;margin-top:8px"><button class="mini is-on" data-edsave="${i}">수정 저장</button><button class="mini" data-edcancel="${i}">취소</button></div></div></div>`;}).join('');
  return `<div class="ai-label">AI 계산 · 출처 보기 : 선생님 의견이 아닙니다. 확정 전에는 학생에게 보이지 않습니다</div>
  <p class="gen-line">생성 표시: ${d.브리프.생성}</p>${items}
  <button class="btn-o" disabled title="AI 미연결">브리프 다시 만들기</button><p class="hint2">AI 미연결 상태 : 규칙 결과와 프로필은 그대로 볼 수 있습니다</p>`;
}
/* C4 */
function sharePane(d,s){
  const ov=P.dec[s.id]||{},n=d.브리프.항목.length,done=Object.keys(ov).length,st=briefState(s.id),[bl,bc]=stBadge(st);
  const undone=n-done;
  const accepted=d.브리프.항목.map((it,i)=>({it,i})).filter(x=>ov[x.i]&&ov[x.i]!=='반려');
  const qPick=accepted.filter(x=>x.it.구분==='확인 질문');
  const flow=['초안','검토 중','확정','학생 공유'];
  return `<div class="flow2">${flow.map(f=>`<span class="st ${f===st?stBadge(f)[1]:'st--dim'}">${f}</span>`).join('<i>›</i>')}</div>
  <div class="share-grid"><div>
  <h4 class="raw-h">처리 현황</h4><p class="hint2">${done}/${n} 카드 처리${undone?` · 확정하려면 ${undone}장을 처리하세요`:''}</p>
  ${st==='학생 공유'?`<div class="ok-line">학생 MY에 "선생님 의견"으로 공유 중입니다 · ShareGrant 범위 안 · 감사로그 1행 기록</div><button class="btn-o" data-unshare>공유 중지</button>`
   :st==='확정'?`<button class="btn-p" data-share>학생에게 공유</button><p class="hint2">반려한 카드는 공유에서 제외됩니다</p>`
   :`<button class="btn-p" disabled>확정</button><p class="hint2" role="status">처리하지 않은 카드 ${undone}장</p>`}
  <h4 class="raw-h" style="margin-top:20px">수정 이력</h4>${Object.keys(P.edit[s.id]||{}).length?Object.entries(P.edit[s.id]).map(([i,t])=>`<div class="rec-item"><b>카드 ${+i+1}</b><p>AI 원문: ${d.브리프.항목[i].문장}</p><p>교사 수정본: ${t}</p></div>`).join(''):'<p class="hint2">수정한 카드가 없습니다</p>'}
  </div><div>
  <h4 class="raw-h">학생 화면 미리보기 · "선생님 의견"</h4>
  <div class="preview-box">${st==='학생 공유'?`${accepted.filter(x=>x.it.구분!=='확인 질문').map(x=>`<p>· ${(P.edit[s.id]||{})[x.i]??x.it.문장}</p>`).join('')}${qPick.length?`<b>상담 때 이야기해 볼 것</b>${qPick.map(x=>`<p>· ${(P.edit[s.id]||{})[x.i]??x.it.문장}</p>`).join('')}`:''}<small>학생 화면에는 "AI" 표기 없이 "선생님 의견"으로 보입니다</small>`:'<p class="hint2">확정 전에는 학생에게 아무것도 보이지 않습니다</p>'}</div>
  </div></div>`;
}
/* 평가 모드 */
function evalPane(){const p=D.평가모드.규칙성능;
  const rows=['R1','R2','R3','R4'].map(k=>{const r=p[k];return `<tr><th>${k}</th><td>${r.주입유형}</td><td>${r.정답}</td><td>${r.탐지}</td><td>${r.오탐}</td><td>${r.재현율}</td><td>${r.정밀도}</td></tr>`;}).join('');
  return `<div class="eval"><h3 class="blk-h">규칙 성능 (운영자 전용 · 화면·AI 입력에 쓰지 않음)</h3>
  <div class="ctable-w"><table class="ctbl"><thead><tr><th>규칙</th><th>주입 유형</th><th>정답</th><th>탐지</th><th>오탐</th><th>재현율</th><th>정밀도</th></tr></thead><tbody>${rows}</tbody></table></div>
  <p class="hint2">주입 20명 중 19명 탐지 · R5 발생 ${p.R5.발생} · R6 발생 ${p.R6.발생} · R7 발생 ${p.R7.발생}</p>
  <p class="hint2">※ R2 오탐 6건은 생성 과정에서 자연히 생긴 흥미 불일치로, 실제 확인 가치가 있습니다</p>
  <h3 class="blk-h">교사 평가 집계 (입력 전)</h3>
  <div class="ctable-w"><table class="ctbl"><thead><tr><th></th><th>채택률</th><th>수정률</th><th>반려률</th><th>상담 준비 시간</th></tr></thead><tbody><tr><th>강점</th><td>–</td><td>–</td><td>–</td><td rowspan="3">– 분</td></tr><tr><th>확인 질문</th><td>–</td><td>–</td><td>–</td></tr><tr><th>다음 활동</th><td>–</td><td>–</td><td>–</td></tr></tbody></table></div></div>`;}
/* 상세 렌더 */
function renderDetail(){
  const s=CLS3.find(x=>x.id===selId),d=DETAIL[selId];
  if(evalMode){$('detail').innerHTML=evalPane();$('dtabs').innerHTML='';$('dhead').innerHTML='<b>평가 모드</b><span class="src src--gray">파생 · 집계</span>';return;}
  if(!d){$('dhead').innerHTML=`<b>${s.이름}</b><span class="hint2">시연 범위 밖</span>`;$('dtabs').innerHTML='';$('detail').innerHTML='<div class="empty2"><b>시연 범위 밖 학생입니다</b><p>상세 데이터는 3학년 3반 25명에만 들어 있습니다.</p></div>';return;}
  const tabs=role==='과목교사'?['프로파일']:T;
  $('dhead').innerHTML=`<b>${s.번호}번 ${s.이름}</b><span>${s.계열} · 3학년 희망: ${s.희망[2]||'–'} · 우선점수 ${s.우선점수}</span>${s.우선사유.map(t=>`<i class="ptag">${t}</i>`).join('')}`;
  $('dtabs').innerHTML=tabs.map(t2=>`<button class="dtab${t2===tab?' is-on':''}" data-dt="${t2}" aria-selected="${t2===tab}">${t2}</button>`).join('');
  $('detail').innerHTML=tab==='프로파일'?profile(d,s):tab==='사전 입력서'?masterPlan(d,s):tab==='상담 브리프'?brief(d,s):sharePane(d,s);
}
function renderAll(){renderList();renderDetail();
  $('evalBtn').style.display=role==='교육청'?'':'none';
  $('roleNote').textContent={'담임':'담당 반 전 기능','과목교사':'교과·세특만 · 검사/브리프 비표시','진학부장':'열람 사유 입력 · 확정 권한 없음','교육청':'집계만 · 평가 모드 사용 가능'}[role];
}
/* 이벤트 */
document.addEventListener('click',e=>{const c=x=>e.target.closest(x);let b;
  if(b=c('[data-sid]')){selId=b.dataset.sid;tab='프로파일';renderAll();return;}
  if(b=c('[data-f]')){filter=filter===b.dataset.f?'':b.dataset.f;renderList();return;}
  if(b=c('[data-dt]')){tab=b.dataset.dt;renderDetail();return;}
  if(b=c('[data-exp]')){const d2=$('td'+b.dataset.exp);d2.hidden=!d2.hidden;b.textContent=d2.hidden?'펼치기':'접기';b.setAttribute('aria-expanded',String(!d2.hidden));return;}
  if(b=c('[data-tg]')){const d2=$(b.dataset.tg);d2.hidden=!d2.hidden;b.setAttribute('aria-expanded',String(!d2.hidden));return;}
  if(b=c('[data-rule]')){tab='프로파일';renderDetail();setTimeout(()=>{const el=document.querySelector('.tcards');el&&scrollTo({top:el.getBoundingClientRect().top+scrollY-120,behavior:'smooth'});},50);return;}
  if(b=c('[data-dec]')){const [i,k]=b.dataset.dec.split(':');if(role!=='담임'){showT('이 역할에는 확정 권한이 없습니다');return;}
    if(k==='수정'){$('bedit'+i).hidden=false;return;}
    P.dec[selId]=P.dec[selId]||{};P.dec[selId][i]=k;save();renderAll();if(tab!=='상담 브리프'){tab='상담 브리프';renderDetail();}return;}
  if(b=c('[data-edsave]')){const i=b.dataset.edsave;const v=$('bedit'+i).querySelector('textarea').value.trim();P.edit[selId]=P.edit[selId]||{};P.edit[selId][i]=v;P.dec[selId]=P.dec[selId]||{};P.dec[selId][i]='수정';save();renderDetail();renderList();return;}
  if(b=c('[data-edcancel]')){$('bedit'+b.dataset.edcancel).hidden=true;return;}
  if(b=c('[data-ev]')){const q=decodeURIComponent(b.dataset.ev);tab='프로파일';renderDetail();setTimeout(()=>{const blk=$('rawBlk');blk.hidden=false;document.querySelector('[data-tg="rawBlk"]').setAttribute('aria-expanded','true');
    let hit=null;document.querySelectorAll('.rec-item p').forEach(p=>{if(!hit&&p.textContent.includes(q.slice(0,20)))hit=p;});
    if(hit){hit.innerHTML=hit.innerHTML.replace(q.slice(0,20),m=>`<mark>${m}</mark>`);const mk=hit.querySelector('mark');if(mk){mk.closest('.rec-item').classList.add('is-hl');scrollTo({top:mk.getBoundingClientRect().top+scrollY-160,behavior:'smooth'});}}
    },60);return;}
  if(c('[data-share]')){P.share[selId]=true;save();renderAll();showT('학생 MY "선생님 의견"으로 공유했습니다 · 감사로그 기록');return;}
  if(c('[data-unshare]')){P.share[selId]=false;save();renderAll();showT('공유를 중지했습니다 · 감사로그 기록');return;}
});
$('roleSel').addEventListener('change',e=>{role=e.target.value;evalMode=false;$('evalBtn')&&($('evalBtn').setAttribute('aria-pressed','false'));tab='프로파일';renderAll();});
$('sortSel').addEventListener('change',e=>{sort=e.target.value;renderList();});
$('evalBtn').addEventListener('click',()=>{evalMode=!evalMode;$('evalBtn').setAttribute('aria-pressed',String(evalMode));renderDetail();});
function showT(t){let el=$('toast2');if(!el){el=document.createElement('div');el.id='toast2';document.body.appendChild(el);}el.textContent=t;el.classList.add('is-on');clearTimeout(showT.t);showT.t=setTimeout(()=>el.classList.remove('is-on'),2600);}
const h=location.hash.match(/student=(SYN-\d+)/);if(h&&CLS3.some(s=>s.id===h[1]))selId=h[1];
renderAll();
})();
