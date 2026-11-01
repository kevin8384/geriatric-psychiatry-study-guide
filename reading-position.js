// One automatic reading position and one explicit bookmark, kept on this browser.
(() => {
 'use strict';
 const view=document.getElementById('view');
 if(!view)return;
 const LAST='geriatric-study-last-position-v1',BOOKMARK='geriatric-study-bookmark-v1',AUTO='geriatric-study-auto-resume-v1';
 const TEXT='h2,h3,h4,h5,p,.qtext,.qhead';
 const normalize=s=>String(s||'').replace(/\s+/g,' ').trim();
 const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return (h>>>0).toString(36);};
 function read(key){try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}}
 function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
 function valid(r){return r?.version===1&&['topics','topic','questions','sources','trends','cme'].includes(r.view)&&Number.isFinite(r.scrollY)&&typeof r.label==='string';}
 const atEntry=read(LAST);
 let restoring=true,timer=0,statusTimer=0,refreshTimer=0,restoreId=0;
 let dirty=true,activityAt=Date.now();
 const tabId=typeof crypto.randomUUID==='function'?crypto.randomUUID():String(Math.random());
 const launcher=document.createElement('button');
 launcher.className='pill-button reading-launcher';launcher.type='button';launcher.textContent='閱讀位置';
 launcher.setAttribute('aria-expanded','false');launcher.setAttribute('aria-controls','reading-panel');
 document.querySelector('.top-actions')?.append(launcher);
 const panel=document.createElement('section');panel.id='reading-panel';panel.className='reading-panel';panel.hidden=true;
 panel.setAttribute('aria-label','閱讀位置與書籤');
 panel.innerHTML='<div class="reading-panel-head"><h2>閱讀位置</h2><button type="button" data-reading="close" aria-label="關閉閱讀位置">關閉</button></div><label class="reading-auto"><input type="checkbox" id="reading-auto"> 開啟網站時自動接續上次閱讀</label><p class="reading-last"></p><div class="reading-bookmark"><h3>我的書籤</h3><p class="reading-bookmark-label"></p><p class="reading-bookmark-excerpt"></p><div class="reading-buttons"><button type="button" data-reading="save">儲存目前位置</button><button type="button" data-reading="return">回到書籤</button></div></div><p class="reading-help">只保留最後一個書籤，新存的位置會取代舊書籤。閱讀位置與書籤保存在此瀏覽器，不會跨裝置同步。</p>';
 document.body.append(panel);
 const status=document.createElement('div');status.className='reading-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.hidden=true;document.body.append(status);
 const auto=panel.querySelector('#reading-auto');auto.checked=read(AUTO)!==false;
 function announce(message){clearTimeout(statusTimer);status.textContent=message;status.hidden=false;statusTimer=setTimeout(()=>{status.hidden=true;},5000);}
 function close(){panel.hidden=true;launcher.setAttribute('aria-expanded','false');}
 function describe(r){return valid(r)?r.label+' · '+new Date(r.savedAt).toLocaleString('zh-TW',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):'尚未儲存';}
 function refreshPanel(){
  panel.querySelector('.reading-last').textContent='上次位置：'+describe(read(LAST));
  const bookmark=read(BOOKMARK);panel.querySelector('.reading-bookmark-label').textContent=describe(bookmark);
  const quote=bookmark?.anchor?.quote||'';panel.querySelector('.reading-bookmark-excerpt').textContent=quote?'「'+quote.slice(0,85)+(quote.length>85?'…':'')+'」':'';
  panel.querySelector('[data-reading="return"]').disabled=!valid(bookmark);
 }
 function scopeFor(el){
  const paper=el.closest('.cme-paper');if(paper)return {kind:'paper',id:paper.id};
  const q=el.closest('.qcard');if(q)return {kind:'question',id:q.dataset.questionKey||normalize(q.querySelector('.qhead strong')?.textContent)};
  const card=el.closest('.content-card,.topic-hero,.hero,.cme-reading-summary');
  return card?{kind:'card',id:normalize(card.querySelector('h2,h3,h4')?.textContent)}:null;
 }
 function anchorAtViewport(){
  const candidates=[...view.querySelectorAll(TEXT)].filter(el=>{
   const r=el.getBoundingClientRect();return normalize(el.textContent)&&r.width>0&&r.height>0&&r.bottom>16&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;
  });
  const el=candidates.find(el=>el.getBoundingClientRect().top<=16)||candidates[0];
  if(!el)return null;
  const text=normalize(el.textContent),scope=scopeFor(el),scroll=el.closest('.cme-table-scroll');
  return {tag:el.tagName,hash:hash(text),quote:text.slice(0,180),scope,offset:el.getBoundingClientRect().top,
   tableId:scroll?.closest('figure')?.id||null,tableLeft:scroll?.scrollLeft||0};
 }
 function snapshot(){
  const mode=currentView,topic=activeTopic;
  const record={version:1,view:mode,label:normalize(document.getElementById('crumb')?.textContent),scrollY:scrollY,anchor:anchorAtViewport(),savedAt:Date.now()};
  const scope=record.anchor?.scope;
  if(scope?.kind==='paper')record.label=(mode==='cme'?new URL(location.href).searchParams.get('cme')+'CME':'文獻')+' / '+normalize(document.getElementById(scope.id)?.querySelector('h3')?.textContent);
  else if(scope?.kind==='question')record.label='考題詳解 / '+normalize(findScope(record.anchor).querySelector('.qhead strong')?.textContent);
  else if(scope?.kind==='card'&&scope.id)record.label+=' / '+scope.id;
  if(mode==='topic')record.topic=topic;
  if(mode==='cme')record.cme=new URL(location.href).searchParams.get('cme');
  if(mode==='questions')record.filters={year:String(yearFilter),tag:activeTag||'',query,page};
  record.hash=location.hash;record.activityAt=activityAt;record.tabId=tabId;
  return record;
 }
 function saveLast(){
  if(restoring||!dirty||!view.children.length)return;
  const latest=read(LAST);
  // Closing an older background tab must not replace a newer tab's reading activity.
  if(valid(latest)&&latest.tabId!==tabId&&(latest.activityAt||latest.savedAt)>activityAt){dirty=false;return;}
  if(write(LAST,snapshot()))dirty=false;
 }
 function scheduleSave(){if(restoring)return;dirty=true;activityAt=Date.now();clearTimeout(timer);timer=setTimeout(saveLast,300);}
 function findScope(anchor){
  const scope=anchor?.scope;if(!scope)return view;
  if(scope.kind==='paper')return document.getElementById(scope.id)||view;
  if(scope.kind==='question')return [...view.querySelectorAll('.qcard')].find(q=>(q.dataset.questionKey||normalize(q.querySelector('.qhead strong')?.textContent))===scope.id)||view;
  if(scope.kind==='card')return [...view.querySelectorAll('.content-card,.topic-hero,.hero,.cme-reading-summary')].find(c=>normalize(c.querySelector('h2,h3,h4')?.textContent)===scope.id)||view;
  return view;
 }
 function findAnchor(anchor){
  if(!anchor?.quote)return null;
  const candidates=[...findScope(anchor).querySelectorAll(TEXT)];
  return candidates.find(el=>el.tagName===anchor.tag&&hash(normalize(el.textContent))===anchor.hash)
   ||candidates.find(el=>el.tagName===anchor.tag&&normalize(el.textContent).startsWith(anchor.quote))||null;
 }
 function frame(){return new Promise(resolve=>requestAnimationFrame(resolve));}
 async function restore(record,kind){
  if(!valid(record)){announce('尚未儲存可返回的閱讀位置。');return;}
  const ticket=++restoreId;
  restoring=true;clearTimeout(timer);close();
  try{
   if(record.view==='cme'){
    if(!window.CME_COURSES?.some(c=>String(c.year)===String(record.cme)))throw new Error('course missing');
    window.openCme(record.cme);
   }else if(record.view==='topic'){
    if(!window.STUDY_TOPICS.some(t=>t.id===record.topic))throw new Error('topic missing');
    window.openTopic(record.topic);
   }else if(record.view==='questions'){
    const f=record.filters||{};window.showView('questions');
    yearFilter=[...document.getElementById('qyear').options].some(o=>o.value===f.year)?f.year:'all';
    activeTag=window.STUDY_TOPICS.some(t=>t.id===f.tag)?f.tag:'';query=typeof f.query==='string'?f.query:'';page=Math.max(1,Number(f.page)||1);
    const questionId=record.anchor?.scope?.kind==='question'?record.anchor.scope.id:null;
    if(questionId){const index=questionPool().findIndex(q=>`${q.year}-${q.number}`===questionId);if(index>=0)page=Math.floor(index/perPage)+1;}
    renderQuestions();
   }else window.showView(record.view);
   // Wait for fonts, layout and the highlight painter before locating the saved paragraph.
   if(document.fonts?.ready)await document.fonts.ready;
   await frame();await frame();
   if(ticket!==restoreId)return;
   const anchor=findAnchor(record.anchor);
   if(record.anchor?.tableId){const table=document.getElementById(record.anchor.tableId)?.querySelector('.cme-table-scroll');if(table)table.scrollLeft=Math.max(0,record.anchor.tableLeft||0);}
   const target=anchor?scrollY+anchor.getBoundingClientRect().top-Math.min(innerHeight-30,Number(record.anchor.offset)||16):record.scrollY;
   window.scrollTo({top:Math.max(0,target),behavior:'instant'});
   await frame();
   if(ticket!==restoreId)return;
   announce(kind==='bookmark'?'已回到書籤。':'已接續上次閱讀位置。');
  }catch{announce('這個位置的內容已更動，已開啟可用的頁面。');}
  finally{if(ticket===restoreId){restoring=false;dirty=true;activityAt=Date.now();}saveLast();}
 }
 launcher.addEventListener('click',()=>{
  if(!panel.hidden){close();return;}
  saveLast();refreshPanel();panel.hidden=false;launcher.setAttribute('aria-expanded','true');
 });
 panel.addEventListener('click',event=>{
  const action=event.target.closest('[data-reading]')?.dataset.reading;
  if(action==='close'){close();launcher.focus();}
  if(action==='save'){
   const ok=write(BOOKMARK,snapshot());refreshPanel();
   announce(ok?'已儲存目前位置，並取代先前書籤。':'瀏覽器未允許儲存，這次書籤無法保留。');
  }
  if(action==='return')restore(read(BOOKMARK),'bookmark');
 });
 auto.addEventListener('change',()=>{
  const ok=write(AUTO,auto.checked);
  announce(ok?(auto.checked?'已開啟自動接續。':'已關閉自動接續；仍可使用書籤。'):'瀏覽器未允許儲存設定。');
 });
 document.addEventListener('pointerdown',event=>{if(!panel.hidden&&!panel.contains(event.target)&&!launcher.contains(event.target))close();});
 function noteInteraction(){if(restoring){restoreId++;restoring=false;}dirty=true;activityAt=Date.now();}
 document.addEventListener('pointerdown',noteInteraction,{capture:true});
 document.addEventListener('keydown',noteInteraction,{capture:true});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
 window.addEventListener('scroll',scheduleSave,{passive:true});
 view.addEventListener('scroll',scheduleSave,{passive:true,capture:true});
 window.addEventListener('pagehide',()=>{clearTimeout(timer);saveLast();});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){clearTimeout(timer);saveLast();}});
 for(const name of ['showView','openTopic','openCme','showQuestions','goPage','renderResults']){
  const original=window[name];if(typeof original!=='function')continue;
  window[name]=function(...args){const result=original(...args);clearTimeout(refreshTimer);refreshTimer=setTimeout(scheduleSave,0);return result;};
 }
 window.addEventListener('storage',event=>{if(event.key===AUTO)auto.checked=read(AUTO)!==false;if([LAST,BOOKMARK,AUTO].includes(event.key)&&!panel.hidden)refreshPanel();});
 // An explicitly linked course/section takes priority over automatic restoration.
 const address=new URL(location.href),explicit=address.searchParams.has('cme')||Boolean(address.hash);
 const reloading=performance.getEntriesByType('navigation')[0]?.type==='reload';
 const sameCourse=atEntry?.view==='cme'&&String(atEntry.cme)===address.searchParams.get('cme');
 const sameFragment=!address.hash||address.hash===atEntry?.hash;
 if(auto.checked&&valid(atEntry)&&(!explicit||(reloading&&sameCourse&&sameFragment)))restore(atEntry,'last');
 else{restoring=false;requestAnimationFrame(saveLast);}
})();
