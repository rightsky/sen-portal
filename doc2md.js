/* doc2md.js : 한글(hwp·hwpx)·워드(docx)·PDF → Markdown 변환기 (브라우저 전용)
 *
 * 파일은 서버로 보내지 않고 이 브라우저 안에서만 읽는다.
 * 무거운 라이브러리(vendor/)는 해당 형식을 처음 변환할 때만 불러온다.
 *
 *   const r = await Doc2MD.convert(file, { numberedHeadings: true });
 *   r = { md, format, stats:{chars,headings,tables,pages?}, warnings:[] }
 *
 * 형식별 방식
 *   hwpx : zip 안의 Contents/section*.xml 을 직접 읽음 (개요 스타일 → 제목, 표 → md 표)
 *   hwp  : OLE 복합문서(CFB) → BodyText/Section* 레코드 해석 (문단·표·글상자)
 *   docx : mammoth(HTML) → turndown(md), 표는 자체 변환(병합 셀 처리)
 *   pdf  : pdf.js 텍스트 좌표 → 줄·문단 재구성, 글자 크기로 제목 추정, 머리말·쪽번호 제거
 */
(function(){
'use strict';

const BASE = (function(){
  const s = document.currentScript && document.currentScript.src;
  return s ? s.replace(/[^/]*$/, '') : '';
})();
const LIB = {
  jszip:   ['vendor/jszip.min.js', () => window.JSZip],
  pako:    ['vendor/pako_inflate.min.js', () => window.pako],
  mammoth: ['vendor/mammoth.browser.min.js', () => window.mammoth],
  turndown:['vendor/turndown.js', () => window.TurndownService],
  pdfjs:   ['vendor/pdf.min.js', () => window.pdfjsLib],
};
const loading = {};
function need(name){
  const [path, get] = LIB[name];
  if (get()) return Promise.resolve(get());
  if (!loading[name]) loading[name] = new Promise((res, rej) => {
    const el = document.createElement('script');
    el.src = BASE + path;
    el.onload = () => get() ? res(get()) : rej(new Error(name + ' 라이브러리를 불러오지 못했어요'));
    el.onerror = () => { delete loading[name]; rej(new Error(name + ' 라이브러리를 불러오지 못했어요 (' + path + ')')); };
    document.head.appendChild(el);
  });
  return loading[name];
}

/* ---------- 공통: 표 → Markdown ---------- */
// grid: 2차원 배열(문자열). 1×1 표는 상자 글로 보고 인용문으로 바꾼다.
function cellText(s){ return String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\s*\n\s*/g, '<br>').trim(); }
function gridToMd(grid){
  grid = grid.filter(r => r && r.some(c => String(c || '').trim()));
  if (!grid.length) return '';
  const cols = Math.max(...grid.map(r => r.length));
  if (cols === 1 && grid.length === 1){
    return String(grid[0][0] || '').trim().split(/\n+/).map(l => '> ' + l.trim()).join('\n');
  }
  const rows = grid.map(r => { const a = r.slice(); while (a.length < cols) a.push(''); return a.map(cellText); });
  const out = ['| ' + rows[0].join(' | ') + ' |', '|' + Array(cols).fill(' --- ').join('|') + '|'];
  rows.slice(1).forEach(r => out.push('| ' + r.join(' | ') + ' |'));
  return out.join('\n');
}
// cells: [{row,col,rowSpan,colSpan,text}] → grid. 세로 병합은 값을 반복(검색 맥락 유지), 가로 병합은 빈칸.
function cellsToGrid(cells, nRows, nCols){
  nRows = Math.max(nRows || 0, ...cells.map(c => c.row + (c.rowSpan || 1)));
  nCols = Math.max(nCols || 0, ...cells.map(c => c.col + (c.colSpan || 1)));
  const g = Array.from({length: nRows}, () => Array(nCols).fill(''));
  cells.forEach(c => {
    for (let r = c.row; r < c.row + (c.rowSpan || 1) && r < nRows; r++){
      g[r][c.col] = c.text;
      for (let k = c.col + 1; k < c.col + (c.colSpan || 1) && k < nCols; k++) g[r][k] = '';
    }
  });
  return g;
}

/* ---------- 공통: 번호 제목 인식 ---------- */
// 스타일 정보가 없는 공문서형 문서에서 "Ⅰ. 추진 배경", "1. 현황" 같은 줄을 제목으로 올린다.
const ROMAN = /^(?:[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]{1,3}|[IVX]{1,4})\s*[.．]\s*\S/;
const ARABIC = /^\d{1,2}\s*[.．)]\s*[^\d\s]/;
const HANGUL = /^[가-하]\s*[.．]\s*\S/;
function numberedHeadings(blocks){
  return blocks.map(b => {
    if (b.type !== 'p') return b;
    const t = b.text.trim();
    if (t.length > 50 || /[다요]\.$/.test(t) || t.includes('\n')) return b;
    if (ROMAN.test(t)) return {type:'h', level:2, text:t};
    if (ARABIC.test(t)) return {type:'h', level:3, text:t};
    if (HANGUL.test(t) && t.length <= 30) return {type:'h', level:4, text:t};
    return b;
  });
}
function blocksToMd(blocks){
  const out = [];
  blocks.forEach(b => {
    if (b && b.type === 'li' && out.length && out[out.length - 1].type === 'li'){ out[out.length - 1].text += '\n- ' + b.text.trim(); return; }
    if (b) out.push(b.type === 'li' ? {type: 'li', text: b.text.trim()} : b);
  });
  return out.map(b => {
    if (b.type === 'h') return '#'.repeat(Math.min(6, Math.max(1, b.level))) + ' ' + b.text.replace(/\s+/g, ' ').trim();
    if (b.type === 'table') return b.md;
    if (b.type === 'li') return '- ' + b.text.trim();
    return b.text.replace(/[ \t]+\n/g, '\n').trim();
  }).filter(Boolean).join('\n\n');
}
const BULLET = /^[•·∙◦▪▫■□◆◇○●◎▶▷►※\-–]\s*/;
function textBlock(text){
  const t = text.replace(/ /g, ' ').replace(/[ \t]{2,}/g, ' ').trim();
  if (!t) return null;
  return {type:'p', text:t};
}

/* ---------- HWPX ---------- */
const kids = (el, name) => Array.from(el.children).filter(c => c.localName === name);
const kid = (el, name) => Array.from(el.children).find(c => c.localName === name);

async function hwpx(buf, opt){
  const JSZip = await need('jszip');
  const zip = await JSZip.loadAsync(buf);
  const xml = async p => { const f = zip.file(p); return f ? new DOMParser().parseFromString(await f.async('string'), 'application/xml') : null; };
  const warnings = [];

  // 스타일 id → 제목 수준 (개요 1~7, Outline 1~7)
  const styleLevel = {};
  const header = await xml('Contents/header.xml');
  if (header) header.querySelectorAll('*').forEach(el => {
    if (el.localName !== 'style') return;
    const nm = (el.getAttribute('name') || '') + ' ' + (el.getAttribute('engName') || '');
    const m = nm.match(/(?:개요|Outline)\s*(\d)/i);
    if (m) styleLevel[el.getAttribute('id')] = Math.min(6, +m[1]);
  });

  const sections = Object.keys(zip.files).filter(n => /^Contents\/section\d+\.xml$/i.test(n))
    .sort((a, b) => +a.match(/(\d+)\.xml/i)[1] - +b.match(/(\d+)\.xml/i)[1]);
  if (!sections.length) throw new Error('한글 문서 본문(Contents/section*.xml)을 찾지 못했어요');

  const blocks = [];
  let styled = 0, tables = 0;

  // 문단 하나의 글자. 표·글상자는 따로 모아 문단 뒤에 놓는다.
  function para(p, out, inCell){
    let text = '';
    const after = [];
    const walk = el => {
      for (const c of el.children){
        const n = c.localName;
        if (n === 't'){
          for (const x of c.childNodes){
            if (x.nodeType === 3) text += x.nodeValue;
            else if (x.localName === 'tab') text += '\t';
            else if (x.localName === 'lineBreak') text += '\n';
          }
        } else if (n === 'tbl'){
          after.push(c);
        } else if (n === 'subList' || n === 'drawText'){
          // 글상자 안의 문단
          const holder = n === 'drawText' ? kid(c, 'subList') || c : c;
          kids(holder, 'p').forEach(pp => para(pp, after, inCell));
        } else if (n === 'secPr' || n === 'colPr' || n === 'header' || n === 'footer' || n === 'pageNum' || n === 'linesegarray'){
          // 쪽 설정·머리말/꼬리말은 본문에서 뺀다
        } else {
          walk(c);
        }
      }
    };
    walk(p);
    const lv = styleLevel[p.getAttribute('styleIDRef')];
    const t = text.replace(/\t+/g, ' ');
    if (t.trim()){
      if (lv && !inCell && t.trim().length <= 80){ out.push({type:'h', level:lv, text:t.trim()}); styled++; }
      else out.push(textBlock(t));
    }
    after.forEach(x => {
      if (x && x.localName === 'tbl'){ out.push({type:'table', md: table(x)}); tables++; }
      else if (x) out.push(x);
    });
  }
  function cellPlain(tc){
    const tmp = [];
    const sub = kid(tc, 'subList') || tc;
    kids(sub, 'p').forEach(p => para(p, tmp, true));
    return tmp.filter(Boolean).map(b => b.type === 'table' ? b.md.replace(/\n/g, ' ') : b.text).join('\n');
  }
  function table(tbl){
    const cells = [];
    kids(tbl, 'tr').forEach((tr, ri) => {
      kids(tr, 'tc').forEach((tc, ci) => {
        const a = kid(tc, 'cellAddr'), sp = kid(tc, 'cellSpan');
        cells.push({
          row: a ? +a.getAttribute('rowAddr') : ri,
          col: a ? +a.getAttribute('colAddr') : ci,
          rowSpan: sp ? +sp.getAttribute('rowSpan') || 1 : 1,
          colSpan: sp ? +sp.getAttribute('colSpan') || 1 : 1,
          text: cellPlain(tc),
        });
      });
    });
    return gridToMd(cellsToGrid(cells, +tbl.getAttribute('rowCnt') || 0, +tbl.getAttribute('colCnt') || 0));
  }

  for (const s of sections){
    const doc = await xml(s);
    if (!doc || doc.querySelector('parsererror')) { warnings.push(s + ' 를 읽지 못해 건너뛰었어요'); continue; }
    kids(doc.documentElement, 'p').forEach(p => para(p, blocks, false));
  }
  let bl = blocks.filter(Boolean);
  if (!styled && opt.numberedHeadings) bl = numberedHeadings(bl);
  if (zip.file(/^BinData\//).length) warnings.push('그림 ' + zip.file(/^BinData\//).length + '개는 변환하지 않았어요 (글만 추출)');
  return {md: blocksToMd(bl), warnings, tables};
}

/* ---------- HWP 5.0 (OLE 복합문서) ---------- */
function readCfb(u8){
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  if (dv.getUint32(0, true) !== 0xE011CFD0 || dv.getUint32(4, true) !== 0xE11AB1A1)
    throw new Error('한글 97 이전 문서이거나 손상된 파일이에요. 한글에서 hwpx로 다시 저장해 주세요');
  const ss = 1 << dv.getUint16(30, true), mss = 1 << dv.getUint16(32, true);
  const nFat = dv.getUint32(44, true), dirStart = dv.getUint32(48, true), miniCut = dv.getUint32(56, true);
  const miniFatStart = dv.getUint32(60, true), difatStart = dv.getUint32(68, true);
  const END = 0xFFFFFFFA;
  const off = i => (i + 1) * ss;
  const fatSecs = [];
  for (let k = 0; k < 109 && fatSecs.length < nFat; k++) fatSecs.push(dv.getUint32(76 + k * 4, true));
  let d = difatStart, guard = 0;
  while (d < END && fatSecs.length < nFat && guard++ < 10000){
    for (let k = 0; k < ss / 4 - 1 && fatSecs.length < nFat; k++) fatSecs.push(dv.getUint32(off(d) + k * 4, true));
    d = dv.getUint32(off(d) + ss - 4, true);
  }
  const fat = [];
  fatSecs.forEach(s => { for (let k = 0; k < ss / 4; k++) fat.push(dv.getUint32(off(s) + k * 4, true)); });
  const chain = (start, table) => { const r = []; let s = start, g = 0; while (s < END && g++ < 1e6){ r.push(s); s = table[s]; } return r; };
  const readBig = (start, size) => {
    const secs = chain(start, fat), out = new Uint8Array(secs.length * ss);
    secs.forEach((s, i) => out.set(u8.subarray(off(s), off(s) + ss), i * ss));
    return size == null ? out : out.subarray(0, size);
  };
  const dir = readBig(dirStart), ddv = new DataView(dir.buffer);
  const entries = [];
  for (let o = 0; o + 128 <= dir.length; o += 128){
    const nl = ddv.getUint16(o + 64, true);
    let name = '';
    for (let k = 0; k < Math.max(0, nl / 2 - 1); k++) name += String.fromCharCode(ddv.getUint16(o + k * 2, true));
    entries.push({name, type: dir[o + 66], left: ddv.getUint32(o + 68, true), right: ddv.getUint32(o + 72, true),
      child: ddv.getUint32(o + 76, true), start: ddv.getUint32(o + 116, true), size: ddv.getUint32(o + 120, true)});
  }
  const root = entries[0];
  const mini = root.size ? readBig(root.start, root.size) : new Uint8Array(0);
  const miniFat = [];
  if (miniFatStart < END){ const m = readBig(miniFatStart), mdv = new DataView(m.buffer); for (let o = 0; o + 4 <= m.length; o += 4) miniFat.push(mdv.getUint32(o, true)); }
  const paths = {};
  const visit = (id, prefix, depth) => {
    if (id >= END || !entries[id] || depth > 64) return;
    const e = entries[id];
    visit(e.left, prefix, depth + 1);
    const p = prefix + '/' + e.name;
    paths[p] = e;
    if (e.type === 1) visit(e.child, p, depth + 1);
    visit(e.right, prefix, depth + 1);
  };
  visit(root.child, '', 0);
  return {
    has: p => !!paths[p],
    list: prefix => Object.keys(paths).filter(p => p.startsWith(prefix)),
    read(p){
      const e = paths[p]; if (!e) return null;
      if (e.size < miniCut){
        const secs = chain(e.start, miniFat), out = new Uint8Array(secs.length * mss);
        secs.forEach((s, i) => out.set(mini.subarray(s * mss, s * mss + mss), i * mss));
        return out.subarray(0, e.size);
      }
      return readBig(e.start, e.size);
    },
  };
}
function hwpRecords(u8){
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const roots = [], stack = [];
  let pos = 0;
  while (pos + 4 <= u8.length){
    const h = dv.getUint32(pos, true); pos += 4;
    const tag = h & 0x3FF, level = (h >>> 10) & 0x3FF;
    let size = (h >>> 20) & 0xFFF;
    if (size === 0xFFF){ if (pos + 4 > u8.length) break; size = dv.getUint32(pos, true); pos += 4; }
    const rec = {tag, level, data: u8.subarray(pos, pos + size), children: []};
    pos += size;
    while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
    (stack.length ? stack[stack.length - 1].children : roots).push(rec);
    stack.push(rec);
  }
  return roots;
}
const T = {STYLE: 26, PARA_HEADER: 66, PARA_TEXT: 67, CTRL_HEADER: 71, LIST_HEADER: 72, TABLE: 77};
const ctrlId = d => d.length < 4 ? '' : String.fromCharCode(d[3], d[2], d[1], d[0]);
function paraText(d){
  let s = '';
  const n = d.length >> 1;
  for (let i = 0; i < n; i++){
    const c = d[i * 2] | (d[i * 2 + 1] << 8);
    if (c >= 32){ s += String.fromCharCode(c); continue; }
    if (c === 10) s += '\n';
    else if (c === 13) {}
    else if (c === 9){ s += '\t'; i += 7; }
    else if (c === 24) s += '-';
    else if (c === 30 || c === 31) s += ' ';
    else if (c === 0 || (c >= 25 && c <= 29)) {}
    else i += 7; // 확장·인라인 컨트롤은 8글자(16바이트)를 차지한다
  }
  return s;
}

async function hwp(buf, opt){
  const u8 = new Uint8Array(buf);
  const cfb = readCfb(u8);
  const fh = cfb.read('/FileHeader');
  if (!fh) throw new Error('한글 문서 머리(FileHeader)가 없어요. 손상된 파일일 수 있어요');
  const prop = new DataView(fh.buffer, fh.byteOffset).getUint32(36, true);
  if (prop & 2) throw new Error('암호가 걸린 한글 문서예요. 한글에서 암호를 푼 뒤 다시 올려 주세요');
  if (prop & 4) throw new Error('배포용 한글 문서라 본문이 잠겨 있어요. 한글에서 일반 문서로 저장한 뒤 올려 주세요');
  const compressed = !!(prop & 1);
  let pako = null;
  if (compressed) pako = await need('pako');
  const inflate = d => { if (!compressed) return d; try { return pako.inflateRaw(d); } catch (e) { return pako.inflate(d); } };
  const warnings = [];

  // 스타일 이름 (개요 1 → 제목 1)
  const styleLevel = [];
  const di = cfb.read('/DocInfo');
  if (di){
    try {
      let idx = 0;
      const walk = rs => rs.forEach(r => {
        if (r.tag === T.STYLE){
          const dv = new DataView(r.data.buffer, r.data.byteOffset, r.data.byteLength);
          let o = 0; const str = () => { const n = dv.getUint16(o, true); o += 2; let s = ''; for (let k = 0; k < n; k++){ s += String.fromCharCode(dv.getUint16(o, true)); o += 2; } return s; };
          const nm = str() + ' ' + str();
          const m = nm.match(/(?:개요|Outline)\s*(\d)/i);
          styleLevel[idx++] = m ? Math.min(6, +m[1]) : 0;
        }
        walk(r.children);
      });
      walk(hwpRecords(inflate(di)));
    } catch (e) { warnings.push('스타일 정보를 읽지 못해 제목 수준은 번호로만 추정했어요'); }
  }

  const sections = cfb.list('/BodyText/').filter(p => /\/Section\d+$/.test(p))
    .sort((a, b) => +a.match(/(\d+)$/)[1] - +b.match(/(\d+)$/)[1]);
  if (!sections.length) throw new Error('한글 문서 본문(BodyText)을 찾지 못했어요');

  const blocks = [];
  let styled = 0, tables = 0, pics = 0;
  const SKIP = new Set(['head', 'foot', 'pghd', 'pgnp', 'secd', 'cold', 'atno', 'nwno', 'pgct', 'bokm', 'tdut', 'tcmt']);

  function paragraph(ph, out, inCell){
    let text = '';
    const after = [];
    ph.children.forEach(r => {
      if (r.tag === T.PARA_TEXT) text += paraText(r.data);
      else if (r.tag === T.CTRL_HEADER){
        const id = ctrlId(r.data);
        if (id === 'tbl ') after.push({type:'table', md: table(r)});
        else if (id === 'gso '){ const tmp = []; nested(r, tmp, inCell); if (tmp.length) after.push(...tmp); else pics++; }
        else if (!SKIP.has(id.trim()) && !SKIP.has(id)) nested(r, after, inCell);
      }
    });
    const sid = ph.data.length >= 11 ? ph.data[10] : -1;
    const lv = styleLevel[sid];
    const t = text.replace(/\t+/g, ' ');
    if (t.trim()){
      if (lv && !inCell && t.trim().length <= 80){ out.push({type:'h', level:lv, text:t.trim()}); styled++; }
      else out.push(textBlock(t));
    }
    after.forEach(b => { if (b && b.type === 'table') tables++; out.push(b); });
  }
  function nested(node, out, inCell){
    node.children.forEach(c => { if (c.tag === T.PARA_HEADER) paragraph(c, out, inCell); else nested(c, out, inCell); });
  }
  function table(ctrl){
    let nRows = 0, nCols = 0, seen = false;
    const cells = [], caption = [];
    let cur = null;
    ctrl.children.forEach(c => {
      if (c.tag === T.TABLE && c.data.length >= 8){
        const dv = new DataView(c.data.buffer, c.data.byteOffset, c.data.byteLength);
        nRows = dv.getUint16(4, true); nCols = dv.getUint16(6, true); seen = true; cur = null;
      } else if (!seen){
        // TABLE 레코드 앞의 목록은 표 캡션이다
        if (c.tag === T.PARA_HEADER) paragraph(c, caption, true);
      } else if (c.tag === T.LIST_HEADER){
        const dv = new DataView(c.data.buffer, c.data.byteOffset, c.data.byteLength);
        cur = c.data.length >= 16
          ? {col: dv.getUint16(8, true), row: dv.getUint16(10, true), colSpan: dv.getUint16(12, true) || 1, rowSpan: dv.getUint16(14, true) || 1, parts: []}
          : {col: cells.length, row: 0, colSpan: 1, rowSpan: 1, parts: []};
        cells.push(cur);
        // 셀 문단이 LIST_HEADER 아래에 붙는 파일도 있다
        c.children.forEach(cc => { if (cc.tag === T.PARA_HEADER) paragraph(cc, cur.parts, true); });
      } else if (c.tag === T.PARA_HEADER && cur){
        paragraph(c, cur.parts, true);
      }
    });
    cells.forEach(c => {
      c.text = c.parts.filter(Boolean).map(b => b.type === 'table' ? b.md.replace(/\n/g, ' ') : b.text).join('\n');
      if (nCols && (c.col >= nCols || c.col + c.colSpan > nCols)) { c.col = Math.min(c.col, nCols - 1); c.colSpan = 1; }
      if (nRows && (c.row >= nRows || c.row + c.rowSpan > nRows)) { c.row = Math.min(c.row, nRows - 1); c.rowSpan = 1; }
    });
    const md = gridToMd(cellsToGrid(cells, nRows, nCols));
    const cap = caption.filter(Boolean).map(b => b.text).join(' ').trim();
    return cap ? md + '\n\n*' + cap.replace(/\*/g, '') + '*' : md;
  }

  for (const s of sections){
    const raw = cfb.read(s);
    let data;
    try { data = inflate(raw); } catch (e) { warnings.push(s.split('/').pop() + ' 압축을 풀지 못해 건너뛰었어요'); continue; }
    hwpRecords(data).forEach(r => { if (r.tag === T.PARA_HEADER) paragraph(r, blocks, false); });
  }
  let bl = blocks.filter(Boolean);
  if (!styled && opt.numberedHeadings) bl = numberedHeadings(bl);
  if (pics) warnings.push('그림·도형 ' + pics + '개는 글자가 없어 건너뛰었어요');
  if (!bl.length) warnings.push('본문 글자를 찾지 못했어요. 한글에서 hwpx로 저장해 다시 올려 보세요');
  return {md: blocksToMd(bl), warnings, tables};
}

/* ---------- DOCX ---------- */
async function docx(buf, opt){
  const [mammoth, Turndown] = await Promise.all([need('mammoth'), need('turndown')]);
  let imgs = 0;
  const res = await mammoth.convertToHtml({arrayBuffer: buf}, {
    styleMap: [
      "p[style-name='제목 1'] => h1:fresh", "p[style-name='제목 2'] => h2:fresh", "p[style-name='제목 3'] => h3:fresh",
      "p[style-name='제목 4'] => h4:fresh", "p[style-name='Title'] => h1:fresh", "p[style-name='제목'] => h1:fresh",
    ],
    convertImage: mammoth.images.imgElement(() => { imgs++; return {src: ''}; }),
  });
  const td = new Turndown({headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced', emDelimiter: '*'});
  // 지식DB용이라 "1\." "\-" 같은 이스케이프는 넣지 않는다
  td.escape = s => s;
  let tables = 0;
  td.addRule('img', {filter: 'img', replacement: () => ''});
  td.addRule('table', {
    filter: n => n.nodeName === 'TABLE',
    replacement: (_, node) => {
      if (node.parentNode && node.parentNode.closest && node.parentNode.closest('table')) return '';
      tables++;
      const cells = [], taken = {};
      Array.from(node.rows).forEach((tr, r) => {
        let c = 0;
        Array.from(tr.cells).forEach(cell => {
          while (taken[r + ',' + c]) c++;
          const rs = +cell.getAttribute('rowspan') || 1, cs = +cell.getAttribute('colspan') || 1;
          for (let i = 0; i < rs; i++) for (let j = 0; j < cs; j++) taken[(r + i) + ',' + (c + j)] = 1;
          const ps = cell.querySelectorAll('p,li');
          const text = ps.length ? Array.from(ps).map(p => p.textContent.trim()).filter(Boolean).join('\n') : cell.textContent.trim();
          cells.push({row: r, col: c, rowSpan: rs, colSpan: cs, text});
          c += cs;
        });
      });
      return '\n\n' + gridToMd(cellsToGrid(cells, 0, 0)) + '\n\n';
    },
  });
  let md = td.turndown(res.value || '');
  md = md.replace(/\n{3,}/g, '\n\n').trim();
  const warnings = [];
  if (imgs) warnings.push('그림 ' + imgs + '개는 변환하지 않았어요 (글만 추출)');
  const hasHeading = /^#{1,6}\s/m.test(md);
  if (!hasHeading && opt.numberedHeadings){
    const bl = md.split(/\n{2,}/).map(t => /^\|/.test(t) || /^[-*>]\s/.test(t) ? {type:'table', md:t} : {type:'p', text:t.replace(/\\([.)])/g, '$1')});
    md = blocksToMd(numberedHeadings(bl));
  }
  return {md, warnings, tables};
}

/* ---------- PDF ---------- */
async function pdf(buf, opt){
  const lib = await need('pdfjs');
  lib.GlobalWorkerOptions.workerSrc = BASE + 'vendor/pdf.worker.min.js';
  let doc;
  try { doc = await lib.getDocument({data: new Uint8Array(buf), isEvalSupported: false}).promise; }
  catch (e){
    if (e && e.name === 'PasswordException') throw new Error('암호가 걸린 PDF예요. 암호를 푼 뒤 다시 올려 주세요');
    throw new Error('PDF를 열지 못했어요 (' + (e && e.message || e) + ')');
  }
  const pages = [];
  for (let n = 1; n <= doc.numPages; n++){
    const page = await doc.getPage(n);
    const vp = page.getViewport({scale: 1});
    const tc = await page.getTextContent();
    const items = tc.items.filter(it => it.str !== undefined).map(it => ({
      s: it.str, x: it.transform[4], y: it.transform[5], w: it.width,
      h: Math.abs(it.transform[3]) || it.height || 10,
    })).filter(it => it.s.trim() || it.w > 0);
    items.sort((a, b) => (b.y - a.y) || (a.x - b.x));
    const lines = [];
    items.forEach(it => {
      const L = lines.find(l => Math.abs(l.y - it.y) < Math.max(2, Math.min(l.h, it.h) * 0.4));
      if (L){ L.items.push(it); L.h = Math.max(L.h, it.h); }
      else lines.push({y: it.y, h: it.h, items: [it]});
    });
    lines.forEach(l => {
      l.items.sort((a, b) => a.x - b.x);
      let s = '', end = null;
      l.items.forEach(it => {
        if (end !== null){
          const gap = it.x - end;
          if (gap > it.h * 0.2 && !/\s$/.test(s) && !/^\s/.test(it.s)) s += gap > it.h * 3 ? '  ' : ' ';
        }
        s += it.s; end = it.x + it.w;
      });
      l.endSpace = /\s$/.test(s);
      l.text = s.replace(/\s+/g, ' ').trim();
      l.x = l.items[0].x;
    });
    pages.push({lines: lines.filter(l => l.text), height: vp.height});
    page.cleanup();
  }
  const warnings = [];
  const total = pages.reduce((a, p) => a + p.lines.reduce((b, l) => b + l.text.length, 0), 0);
  if (total < 30 * pages.length) warnings.push('글자가 거의 없어요. 스캔 이미지 PDF라면 OCR이 먼저 필요해요');

  // 머리말·꼬리말: 3쪽 이상에서 절반 넘게 같은 위치에 반복되는 줄, 쪽번호
  const key = t => t.replace(/\d+/g, '#');
  const rep = {};
  if (pages.length >= 3) pages.forEach(p => {
    const edge = p.lines.filter(l => l.y > p.height * 0.9 || l.y < p.height * 0.1);
    new Set(edge.map(l => key(l.text))).forEach(k => rep[k] = (rep[k] || 0) + 1);
  });
  let dropped = 0;
  pages.forEach(p => { p.lines = p.lines.filter(l => {
    const edge = l.y > p.height * 0.9 || l.y < p.height * 0.1;
    if (/^[-–\s]*\d{1,4}[-–\s]*$|^\d+\s*\/\s*\d+$|^-\s*\d+\s*-$/.test(l.text) && edge){ dropped++; return false; }
    if (edge && rep[key(l.text)] > pages.length / 2){ dropped++; return false; }
    return true;
  }); });

  // 본문 글자 크기(글자 수 가중 최빈값)
  const hist = {};
  pages.forEach(p => p.lines.forEach(l => { const k = Math.round(l.h * 2) / 2; hist[k] = (hist[k] || 0) + l.text.length; }));
  const body = +Object.entries(hist).sort((a, b) => b[1] - a[1])[0]?.[0] || 10;

  const blocks = [];
  let fontHeads = 0;
  pages.forEach(p => {
    let cur = null, prev = null;
    const push = () => { if (cur) blocks.push(cur); cur = null; };
    p.lines.forEach(l => {
      const ratio = l.h / body;
      const lv = ratio >= 1.6 ? 1 : ratio >= 1.3 ? 2 : ratio >= 1.12 ? 3 : 0;
      if (lv && l.text.length <= 80){
        if (cur && cur.type === 'h' && cur.level === lv && prev && prev.y - l.y < l.h * 1.6){ cur.text += ' ' + l.text; prev = l; return; }
        push(); cur = {type:'h', level: lv, text: l.text}; fontHeads++; prev = l; return;
      }
      const gap = prev ? prev.y - l.y : 0;
      const isBullet = BULLET.test(l.text) || /^[①-⑳]/.test(l.text);
      const newPara = !cur || cur.type !== 'p' || isBullet || gap > l.h * 1.9 || Math.abs((prev?.h || l.h) - l.h) > 1.5;
      if (newPara){ push(); cur = {type: 'p', text: l.text}; }
      else {
        // 한글끼리 이어지고 앞 줄 끝에 공백이 없으면 단어 중간 줄바꿈으로 본다
        const glue = !prev.endSpace && /[가-힣]$/.test(cur.text) && /^[가-힣]/.test(l.text);
        cur.text += (glue ? '' : ' ') + l.text;
      }
      prev = l;
    });
    push();
  });
  let bl = blocks.map(b => b.type === 'p' && BULLET.test(b.text) && !/^-\d/.test(b.text) ? {type:'li', text: b.text.replace(BULLET, '')} : b);
  if (!fontHeads && opt.numberedHeadings) bl = numberedHeadings(bl);
  if (dropped) warnings.push('머리말·쪽번호 ' + dropped + '줄을 뺐어요');
  warnings.push('PDF의 표는 칸 구분 없이 줄글로 바뀌어요. 표가 중요하면 원본 한글·워드 파일을 올려 주세요');
  return {md: blocksToMd(bl), warnings, tables: 0, pages: pages.length};
}

/* ---------- 진입점 ---------- */
const FORMATS = {hwp: '한글', hwpx: '한글', docx: '워드', pdf: 'PDF', md: 'Markdown'};
function sniff(name, u8){
  const ext = (name.match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase() || '';
  const zip = u8[0] === 0x50 && u8[1] === 0x4B, ole = u8[0] === 0xD0 && u8[1] === 0xCF, pdfSig = u8[0] === 0x25 && u8[1] === 0x50 && u8[2] === 0x44 && u8[3] === 0x46;
  if (pdfSig) return 'pdf';
  if (ole) return ext === 'doc' ? 'doc' : 'hwp';
  if (zip) return ext === 'docx' ? 'docx' : ext === 'hwpx' ? 'hwpx' : ext;
  return ext;
}
function stats(md){
  return {
    chars: md.replace(/\s/g, '').length,
    headings: (md.match(/^#{1,6}\s/gm) || []).length,
    tables: (md.match(/^\|(?:\s*-{3,}\s*\|)+\s*$/gm) || []).length,
  };
}

async function convert(file, opt){
  opt = Object.assign({numberedHeadings: true, frontMatter: true}, opt || {});
  const buf = await file.arrayBuffer();
  const u8 = new Uint8Array(buf.slice(0, 8));
  const fmt = sniff(file.name, u8);
  let r;
  if (fmt === 'md' || fmt === 'markdown' || fmt === 'txt'){
    r = {md: new TextDecoder('utf-8').decode(buf), warnings: []};
  } else if (fmt === 'hwpx') r = await hwpx(buf, opt);
  else if (fmt === 'hwp') r = await hwp(buf, opt);
  else if (fmt === 'docx') r = await docx(buf, opt);
  else if (fmt === 'pdf') r = await pdf(buf, opt);
  else if (fmt === 'doc') throw new Error('옛 워드(.doc) 형식은 지원하지 않아요. 워드에서 .docx로 저장해 주세요');
  else throw new Error('지원하지 않는 형식이에요 (hwp·hwpx·docx·pdf·md만 가능)');

  let md = r.md.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  const base = file.name.replace(/\.[^.]+$/, '');
  if (fmt !== 'md' && opt.frontMatter){
    const today = new Date().toISOString().slice(0, 10);
    const head = '원천: ' + file.name + ' · ' + (FORMATS[fmt] || fmt) + '(' + fmt + ')에서 md로 변환 · 변환일 ' + today;
    md = (/^#\s/m.test(md.split('\n').slice(0, 3).join('\n')) ? '' : '# ' + base + '\n\n') + head + '\n\n' + md;
  }
  return {
    name: base + '.md', source: file.name, format: fmt, label: FORMATS[fmt] || fmt,
    md, warnings: r.warnings || [], stats: Object.assign(stats(md), r.pages ? {pages: r.pages} : {}),
  };
}

window.Doc2MD = {convert, ACCEPT: '.hwp,.hwpx,.docx,.pdf,.md', _test: {gridToMd, cellsToGrid, numberedHeadings, readCfb, paraText}};
})();
