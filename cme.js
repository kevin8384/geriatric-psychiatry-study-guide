// Independent reading sections: no synthetic past questions or question counts.
(() => {
 'use strict';
 const courses=window.CME_COURSES||[],papers=window.CME_PAPERS||[];
 if(!courses.length)return;
 const courseMap=new Map(courses.map(c=>[String(c.year),c]));
 const paperMap=new Map(papers.map(p=>[p.id,p]));
 const notes=window.CME_DEEP_NOTES||[];
 const noteMap=new Map(notes.map(p=>[p.id,p]));
 const e=window.esc;
 const safeLink=(url,title)=>/^https:\/\//.test(url)?`<a href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(title)} ↗</a>`:e(title);
 const paragraph=text=>`<p>${e(text)}</p>`;
 const section=(title,text)=>`<section class="cme-block"><h4>${e(title)}</h4>${paragraph(text)}</section>`;

 function readingTable(t,index,paperId){
  const titleId=`table-${paperId}-${index+1}`;
  return `<figure class="cme-table-figure" id="${e(titleId)}"><figcaption><h5>${e(t.title)}</h5><p>${e(t.sourceLabel)}</p></figcaption>
   <p class="cme-table-hint">寬表可左右滑動，逐欄對照。</p><div class="cme-table-scroll" role="region" aria-labelledby="${e(titleId)}-caption" tabindex="0"><table class="cme-reading-table"><caption id="${e(titleId)}-caption">${e(t.title)}</caption><thead><tr>${t.columns.map(x=>`<th scope="col">${paragraph(x)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(row=>`<tr>${row.map((cell,i)=>i===0?`<th scope="row">${paragraph(cell)}</th>`:`<td>${paragraph(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
   <p class="cme-table-note">${e(t.note||'重要內容精選重整，並非原表逐字翻譯。')}</p><p class="cme-table-source">來源：${safeLink(t.sourceUrl,'原始文獻')} · ${e(t.sourceLabel)}</p></figure>`;
 }

 function renderDeepPaper(p,d){
  const sourceList=[...(d.fulltextSources||[]),...p.sources];
  const uniqueSources=sourceList.filter((s,i)=>sourceList.findIndex(x=>x.url===s.url)===i);
  const accessLabel=d.access==='full'?'原始全文導讀':d.access==='partial'?'部分原文可取得':'全文未取得・摘要核實';
  return `<article id="paper-${e(p.id)}" class="cme-paper cme-deep-paper" data-paper="${e(p.id)}" data-access="${e(d.access)}">
   <div class="cme-paper-top"><span class="cme-kind">${e(accessLabel)}</span><a class="cme-top-link" href="#cme-index-${p.year}">回導讀索引 ↑</a></div>
   <h3>${e(d.title||p.title)}</h3><p class="cme-original" lang="en">${e(p.original)}</p><p class="cme-citation">${e(p.citation)} · DOI: ${e(p.doi)}</p>
   <div class="cme-read-status"><p>${e(d.fulltextStatus)}</p></div>
   <section class="cme-takeaway"><h4>本篇核心結論</h4>${paragraph(d.synthesis)}</section>
   ${section('研究問題與設計',d.researchQuestion)}${section('研究對象／文獻範圍',d.design||p.design)}
   <section class="cme-block cme-deep-findings"><h4>重要發現與較一致的特徵</h4>${d.keyFindings.map((x,i)=>`<div class="cme-finding"><h5><span>${i+1}</span>${e(x.heading)}</h5>${paragraph(x.text)}</div>`).join('')}</section>
   <section class="cme-block cme-hypotheses"><h4>文章支持、未支持與尚待驗證的假說</h4>${d.hypotheses.map(x=>`<div class="cme-hypothesis"><h5>${e(x.claim)}</h5><p><strong>原文證據：</strong>${e(x.result)}</p><p><strong>能下的結論：</strong>${e(x.meaning)}</p></div>`).join('')}</section>
   <section class="cme-block cme-tables"><h4>重要表格與結果對照</h4><p class="cme-rebuild-note">保留關鍵比較與數據，中文精選重整；每表註明原表號或內文位置。無原表的文章會標示為內文歸納。</p>${d.tables.map((t,i)=>readingTable(t,i,p.id)).join('')}</section>
   <section class="cme-exams"><h4>考試應掌握的文章內容</h4><p class="cme-exam-label">依文章發現整理的複習方向，並非官方命題或對應考古題。</p>${d.examFocus.map(([title,reason])=>`<div class="cme-exam-point"><h5>${e(title)}</h5>${paragraph(reason)}</div>`).join('')}</section>
   ${section('研究限制與解讀邊界',d.cautions||p.limits)}
   ${d.update||p.update?`<section class="cme-update"><h4>年代與適用範圍補充</h4>${paragraph(d.update||p.update)}</section>`:''}
   <div class="cme-evidence">${p.file?`<p>指定原文：${e(p.file)}。重點位置見各表及全文閱讀說明。</p>`:''}<p>原文與核對來源：${uniqueSources.map(s=>safeLink(s.url,s.title)).join('　·　')}</p></div>
  </article>`;
 }

 function renderPaper(p){
  if(noteMap.has(p.id))return renderDeepPaper(p,noteMap.get(p.id));
  const sources=p.sources.map(s=>safeLink(s.url,s.title)).join('　·　');
  return `<article id="paper-${e(p.id)}" class="cme-paper" data-paper="${e(p.id)}">
   <div class="cme-paper-top"><span class="cme-kind">${e(p.level)}</span><a class="cme-top-link" href="#cme-index-${p.year}">回導讀索引 ↑</a></div>
   <h3>${e(p.title)}</h3><p class="cme-original" lang="en">${e(p.original)}</p><p class="cme-citation">${e(p.citation)} · DOI: ${e(p.doi)}</p>
   ${section('這篇在問什麼',p.question)}${section('研究設計與對象',p.design)}
   <section class="cme-block"><h4>原文重點與主要發現</h4><ol class="cme-findings">${p.findings.map(x=>`<li>${paragraph(x)}</li>`).join('')}</ol></section>
   ${section('如何理解與應用',p.interpretation)}${section('證據限制',p.limits)}
   ${p.update?`<section class="cme-update"><h4>文獻年代與適用範圍核對</h4>${paragraph(p.update)}</section>`:''}
   <section class="cme-exams"><h4>可能考點</h4><p class="cme-exam-label">以下為依文獻推估的複習方向，並非歷屆考題或官方命題。</p>${p.exams.map(([title,reason])=>`<div class="cme-exam-point"><h5>${e(title)}</h5>${paragraph(reason)}</div>`).join('')}</section>
   <div class="cme-evidence">${p.file?`<p>指定原文：${e(p.file)}；PDF ${e(p.pages)}。</p>`:''}<p>核對來源：${sources}</p></div>
  </article>`;
 }
 window.CME_RENDER_PAPER=renderPaper;

 function clearCmeAddress(){
  const url=new URL(location.href);
  if(url.searchParams.has('cme')){
   url.searchParams.delete('cme');
   if(/^#(?:cme-|paper-)/.test(url.hash))url.hash='';
   history.replaceState(null,'',url);
  }
 }
 for(const name of ['showView','openTopic','showQuestions']){
  const original=window[name];
  window[name]=function(...args){clearCmeAddress();return original(...args);};
 }

 window.openCme=function(year){
  const c=courseMap.get(String(year));if(!c)return;
  const yearNotes=notes.filter(p=>p.id.startsWith(`${c.year}-`));
  const fullCount=yearNotes.filter(p=>p.access==='full').length;
  const tableCount=yearNotes.reduce((n,p)=>n+p.tables.length,0);
  currentView='cme';activeTopic=null;activeTag=null;
  document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.id===`cme${c.year}`));
  window.setCrumb(`學習導覽　/　${c.title}　/　文獻導讀`);
  const url=new URL(location.href);url.searchParams.set('cme',String(c.year));url.hash='';history.replaceState(null,'',url);
  document.getElementById('view').innerHTML=`<div class="cme-detail">
   <section class="hero cme-hero"><div class="eyebrow">CONTINUING MEDICAL EDUCATION · LITERATURE NOTES</div><h2>${e(c.title)}</h2><p>${e(c.theme)}</p><div class="metrics"><div class="metric"><strong>6</strong><span>文獻導讀時段</span></div><div class="metric"><strong>${c.paperCount} 篇</strong><span>研究發現、假說與重要表格</span></div><div class="metric"><strong>${e(c.date)}</strong><span>節目表課程日期</span></div></div></section>
   <div class="cme-scope"><p>${e(c.sourceNote)}</p><p>本區整理原文及複習推論，不代稱講者投影片或課堂原話。CME未另建立對應考古題；原有題庫題數維持不變。</p></div>
   ${yearNotes.length?`<section class="cme-reading-summary"><h3>原始文獻深讀</h3><p>${fullCount}篇已取得並閱讀全文 · ${tableCount}張重點對照表。依研究發現、假說支持程度與回顧一致特徵整理。</p>${yearNotes.filter(p=>p.access!=='full').map(p=>`<p class="cme-access-gap"><strong>${e(paperMap.get(p.id).original)}</strong>：${p.access==='abstract'?'全文與原表尚未取得；本篇僅能依原始摘要核實。':'僅取得部分原文；閱讀範圍於該篇註明。'}</p>`).join('')}</section>`:''}
   <section class="cme-index" id="cme-index-${c.year}" aria-label="文獻導讀索引"><h3>六個時段，逐篇閱讀</h3><div class="cme-session-links">${c.sessions.map(s=>`<a href="#cme-session-${c.year}-${s.n}"><span>${s.n} · ${e(s.time)}</span>${e(s.title)}<small>${s.papers.length}篇文獻</small></a>`).join('')}</div></section>
   <section class="cme-foundations"><h3>先把這些概念讀懂</h3><p class="cme-foundation-source">以下為閱讀所需的基本概念，延續指定教材與既有章節的整理。</p><div class="cme-foundation-grid">${c.foundations.map(([title,text])=>`<div class="content-card"><h4>${e(title)}</h4>${paragraph(text)}</div>`).join('')}</div></section>
   ${c.sessions.map(s=>`<section class="cme-session" id="cme-session-${c.year}-${s.n}"><div class="section-head"><div><div class="eyebrow">${e(s.time)} · 文獻導讀 ${s.n}</div><h2>${e(s.title)}</h2></div><span class="cme-session-count">${s.papers.length}篇</span></div>${s.papers.map(id=>renderPaper(paperMap.get(id))).join('')}</section>`).join('')}
   <section class="content-card cme-related"><h3>延伸基本知識</h3><p>回到既有章節釐清名詞、評估與疾病表型。</p><div class="cme-related-links">${c.connections.filter(id=>window.STUDY_TOPICS.some(t=>t.id===id)).map(id=>`<button class="secondary" onclick="openTopic('${id}')">${e(window.STUDY_TOPICS.find(t=>t.id===id).title)} →</button>`).join('')}</div></section>
   <p class="cme-programme">課程對應：${e(c.programme)}。原始課程另列的11:45與15:45個案報告時段均未收錄。${notes.length?'<a href="cme-deep-source-audit-20261101.md" target="_blank" rel="noopener">逐篇閱讀與表格來源核對清單 ↗</a>':''}</p>
  </div>`;
  window.scrollTo({top:0,behavior:'instant'});
 };

 const baseNav=window.buildNav;
 window.buildNav=function(){
  baseNav();
  document.getElementById('nav').insertAdjacentHTML('beforeend',courses.map(c=>`<button class="cme-nav" data-id="cme${c.year}" onclick="openCme(${c.year})"><span>CME</span>${c.title}<span class="n">${c.paperCount}篇</span></button>`).join(''));
 };
 const baseTopics=window.renderTopics;
 window.renderTopics=function(){
  baseTopics();
  const grid=document.querySelector('#view > .grid');
  grid?.insertAdjacentHTML('afterend',`<section class="cme-home"><div class="section-head"><div><h2>年度CME文獻導讀</h2><p>依課程時段逐篇讀研究，再整理可能考點</p></div></div><div class="cme-home-grid">${courses.map(c=>`<button class="cme-home-card" onclick="openCme(${c.year})"><span class="eyebrow">${e(c.date)} · ${c.paperCount}篇文獻</span><strong>${c.title}</strong><span>${e(c.theme)}</span><small>閱讀研究重點與可能考點 →</small></button>`).join('')}</div></section>`);
 };
 window.buildNav();
 const entryAddress=new URL(location.href),requested=entryAddress.searchParams.get('cme');
 if(courseMap.has(requested)){
  window.openCme(requested);
  if(/^#(?:paper-|cme-)/.test(entryAddress.hash)){
   const target=document.getElementById(entryAddress.hash.slice(1));
   if(target){history.replaceState(null,'',entryAddress);requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));}
  }
 }else window.renderTopics();
})();
