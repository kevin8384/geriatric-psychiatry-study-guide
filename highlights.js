// Personal annotations remain on this browser; stable content anchors survive filtering and paging.
(() => {
 'use strict';
 const view=document.getElementById('view');
 if(!view)return;
 const STORAGE_KEY='geriatric-study-highlights-v1';
 const SELECTOR='h2,h3,h4,p,pre,.qtext,.notice,.official,.qhead strong';
 let highlights=readStorage(),blocks=[],pending=[],clickedIds=[],savedRange=null;
 let frame=0,selectionTimer=0,statusTimer=0,suppressSelection=false;

 function readStorage(){
  try{
   const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
   if(value?.version!==1||!Array.isArray(value.highlights))return [];
   return value.highlights.filter(item=>typeof item.id==='string'&&/^[\w-]+$/.test(item.id)&&Array.isArray(item.segments)).map(item=>({...item,segments:item.segments.filter(s=>typeof s.key==='string'&&typeof s.quote==='string'&&Number.isInteger(s.start)&&Number.isInteger(s.end)&&s.start>=0&&s.end>s.start)}));
  }catch{return [];}
 }
 function persist(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,highlights}));return true;}
  catch{return false;}
 }
 function hash(text){let value=2166136261;for(let i=0;i<text.length;i++)value=Math.imul(value^text.charCodeAt(i),16777619);return (value>>>0).toString(36)+'-'+text.length;}
 function scopeFor(element){
  const question=element.closest('.qcard');
  if(question)return 'question:'+question.querySelector('.qhead strong')?.textContent.replace(/\s+/g,'');
  const topic=element.closest('.topic-detail');
  if(topic)return 'topic:'+topic.querySelector('.topic-hero h2')?.textContent.trim();
  return 'page:'+document.getElementById('crumb')?.textContent.trim();
 }
 function collectBlocks(){
  const elements=[...view.querySelectorAll(SELECTOR)].filter(el=>!el.closest('button,summary,input,select,textarea')&&!el.parentElement.closest(SELECTOR));
  const occurrences=new Map();
  return elements.map(element=>{
   const text=element.textContent;
   const base=scopeFor(element)+'|'+element.tagName+'|'+hash(text);
   const occurrence=occurrences.get(base)||0;occurrences.set(base,occurrence+1);
   return {element,text,key:base+'|'+occurrence};
  });
 }
 function entriesFor(block){
  return highlights.flatMap(item=>item.segments.filter(s=>s.key===block.key&&block.text.slice(s.start,s.end)===s.quote).map(s=>({...s,id:item.id})));
 }
 function textNodes(element){
  const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  return nodes;
 }
 function paint(block){
  const entries=entriesFor(block);
  const signature=JSON.stringify(entries.map(s=>[s.id,s.start,s.end]));
  if(block.element.dataset.highlightPaint===signature)return;
  for(const mark of block.element.querySelectorAll('mark.study-highlight'))mark.replaceWith(...mark.childNodes);
  block.element.normalize();
  let offset=0;
  for(const node of textNodes(block.element)){
   const begin=offset,end=begin+node.length;offset=end;
   const active=entries.filter(s=>s.start<end&&s.end>begin);
   if(!active.length)continue;
   const cuts=[...new Set([begin,end,...active.flatMap(s=>[Math.max(begin,s.start),Math.min(end,s.end)])])].sort((a,b)=>a-b);
   const fragment=document.createDocumentFragment();
   for(let i=0;i<cuts.length-1;i++){
    const from=cuts[i],to=cuts[i+1],ids=active.filter(s=>s.start<to&&s.end>from).map(s=>s.id);
    const text=document.createTextNode(node.data.slice(from-begin,to-begin));
    if(ids.length){const mark=document.createElement('mark');mark.className='study-highlight';mark.dataset.highlightIds=ids.join(' ');mark.title='點一下可移除此螢光標記';mark.append(text);fragment.append(mark);}
    else fragment.append(text);
   }
   node.replaceWith(fragment);
  }
  block.element.dataset.highlightPaint=signature;
 }
 const observer=new MutationObserver(()=>scheduleRefresh());
 function observe(){observer.observe(view,{childList:true,subtree:true,characterData:true});}
 function refresh(){
  observer.disconnect();
  try{blocks=collectBlocks();for(const block of blocks)paint(block);}
  finally{observe();}
 }
 function scheduleRefresh(){if(!frame)frame=requestAnimationFrame(()=>{frame=0;hideToolbar();refresh();});}

 const launcher=document.createElement('button');launcher.className='pill-button highlight-launcher';launcher.type='button';launcher.textContent='螢光筆';launcher.title='先選取文字，再按螢光筆；標記會儲存於此瀏覽器';launcher.setAttribute('aria-expanded','false');launcher.setAttribute('aria-controls','highlight-toolbar');
 document.querySelector('.top-actions')?.append(launcher);
 const toolbar=document.createElement('div');toolbar.id='highlight-toolbar';toolbar.className='highlight-toolbar';toolbar.hidden=true;toolbar.setAttribute('role','region');toolbar.setAttribute('aria-label','文字螢光標記工具');
 toolbar.innerHTML='<div class="highlight-actions"><button type="button" data-action="add">螢光標記</button><button type="button" data-action="remove">移除標記</button><button type="button" data-action="close" aria-label="關閉螢光筆工具">關閉</button></div><p class="highlight-hint"></p>';
 document.body.append(toolbar);
 const status=document.createElement('div');status.className='highlight-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.hidden=true;document.body.append(status);
 const addButton=toolbar.querySelector('[data-action="add"]'),removeButton=toolbar.querySelector('[data-action="remove"]'),hint=toolbar.querySelector('.highlight-hint');
 function announce(message){clearTimeout(statusTimer);status.textContent=message;status.hidden=false;statusTimer=setTimeout(()=>{status.hidden=true;},4500);}
 function hideToolbar(){toolbar.hidden=true;launcher.setAttribute('aria-expanded','false');}
 function intersectingIds(segments){return highlights.filter(item=>item.segments.some(s=>segments.some(t=>s.key===t.key&&s.start<t.end&&s.end>t.start))).map(item=>item.id);}
 function captureSelection(){
  const selection=window.getSelection();
  if(!selection||selection.isCollapsed||!selection.rangeCount)return false;
  const range=selection.getRangeAt(0);
  if(!view.contains(range.startContainer)||!view.contains(range.endContainer))return false;
  const segments=[];
  for(const block of blocks){
   // Clip the selection to each readable block; offsets count text, including inline bold text.
   const part=document.createRange();
   try{
    if(block.element.contains(range.startContainer))part.setStart(range.startContainer,range.startOffset);else part.setStart(block.element,0);
    if(block.element.contains(range.endContainer))part.setEnd(range.endContainer,range.endOffset);else part.setEnd(block.element,block.element.childNodes.length);
    if(!range.intersectsNode(block.element)||part.collapsed)continue;
    const prefix=document.createRange();prefix.selectNodeContents(block.element);prefix.setEnd(part.startContainer,part.startOffset);
    const start=prefix.toString().length,quote=part.toString();
    if(quote.trim())segments.push({key:block.key,start,end:start+quote.length,quote});
   }catch{/* A view may have changed during an in-progress selection. */}
  }
  if(!segments.length)return false;
  pending=segments;savedRange=range.cloneRange();clickedIds=[];return true;
 }
 function showToolbar(rect){
  addButton.disabled=!pending.length;removeButton.disabled=!clickedIds.length&&!intersectingIds(pending).length;
  hint.textContent=pending.length||clickedIds.length?'標記保存在目前裝置的此瀏覽器；點標記可移除。':'先拖曳選取內容；手機可長按選取，再按「螢光標記」。標記保存在此瀏覽器。';
  toolbar.hidden=false;launcher.setAttribute('aria-expanded','true');
  const width=toolbar.offsetWidth,height=toolbar.offsetHeight;
  toolbar.style.left=Math.max(10,Math.min(rect.left,window.innerWidth-width-10))+'px';
  const below=rect.bottom+10;
  toolbar.style.top=Math.max(10,Math.min(below+height<window.innerHeight?below:rect.top-height-10,window.innerHeight-height-10))+'px';
 }
 function showSelection(){
  if(suppressSelection)return;
  if(captureSelection())showToolbar(savedRange.getBoundingClientRect());
  else if(clickedIds.length&&!toolbar.hidden)return;
  else if(!toolbar.contains(document.activeElement)){pending=[];savedRange=null;hideToolbar();}
 }
 function scheduleSelection(){clearTimeout(selectionTimer);selectionTimer=setTimeout(showSelection,180);}
 function finish(message){
  suppressSelection=true;clearTimeout(selectionTimer);window.getSelection()?.removeAllRanges();pending=[];clickedIds=[];savedRange=null;hideToolbar();refresh();
  const stored=persist();announce(stored?message+'（已儲存在此瀏覽器）':message+'；瀏覽器未允許儲存，重新載入後可能消失。');
  setTimeout(()=>{suppressSelection=false;},0);
 }
 toolbar.addEventListener('pointerdown',event=>event.preventDefault());
 toolbar.addEventListener('click',event=>{
  const action=event.target.closest('button')?.dataset.action;
  if(action==='close'){hideToolbar();launcher.focus();return;}
  if(action==='add'&&pending.length){
   if(!savedRange||!view.contains(savedRange.startContainer)){hideToolbar();return;}
   const id=typeof crypto.randomUUID==='function'?crypto.randomUUID():'h-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
   highlights.push({id,created:Date.now(),segments:pending.map(s=>({...s}))});finish('已增加螢光標記');
  }
  if(action==='remove'){
   const ids=new Set(clickedIds.length?clickedIds:intersectingIds(pending));
   if(ids.size){highlights=highlights.filter(item=>!ids.has(item.id));finish('已移除螢光標記');}
  }
 });
 launcher.addEventListener('pointerdown',event=>{captureSelection();event.preventDefault();});
 launcher.addEventListener('click',()=>{if(!toolbar.hidden){hideToolbar();return;}if(!captureSelection()){pending=[];clickedIds=[];}showToolbar(launcher.getBoundingClientRect());});
 view.addEventListener('contextmenu',event=>{if(captureSelection()){event.preventDefault();showToolbar({left:event.clientX,top:event.clientY,bottom:event.clientY});}});
 view.addEventListener('click',event=>{
  if(!window.getSelection()?.isCollapsed)return;
  const mark=event.target.closest('mark.study-highlight');
  if(mark){pending=[];savedRange=null;clickedIds=mark.dataset.highlightIds.split(' ');clearTimeout(selectionTimer);showToolbar(mark.getBoundingClientRect());}
 });
 document.addEventListener('selectionchange',scheduleSelection);
 view.addEventListener('pointerup',scheduleSelection);
 document.addEventListener('pointerdown',event=>{if(!toolbar.contains(event.target)&&event.target!==launcher&&!event.target.closest('mark.study-highlight'))hideToolbar();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')hideToolbar();});
 window.addEventListener('resize',hideToolbar);
 window.addEventListener('scroll',hideToolbar,{passive:true});
 window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY){highlights=readStorage();hideToolbar();refresh();}});
 refresh();
})();
