/* Shared, DOM-free merge rules for immutable highlights and deletion records. */
(() => {
 'use strict';
 function clean(h){
  if(!h||typeof h.id!=='string'||!/^[\w-]{1,100}$/.test(h.id)||!Array.isArray(h.segments)||!h.segments.length||h.segments.length>200)return null;
  const segments=[];
  for(const s of h.segments){
   if(!s||typeof s.key!=='string'||!s.key.length||s.key.length>2000||typeof s.quote!=='string'||!s.quote.trim()||s.quote.length>30000||!Number.isSafeInteger(s.start)||!Number.isSafeInteger(s.end)||s.start<0||s.end<=s.start||s.end-s.start!==s.quote.length)return null;
   segments.push({key:s.key,start:s.start,end:s.end,quote:s.quote});
  }
  return {id:h.id,created:Number.isFinite(h.created)&&h.created>=0?h.created:0,segments};
 }
 function parse(value){
  if(value?.version!==1||!Array.isArray(value.highlights)||value.highlights.length>20000)throw new Error('這不是本網站的標記備份檔。');
  const highlights=value.highlights.map(clean);
  if(highlights.some(x=>!x)||new Set(highlights.map(x=>x.id)).size!==highlights.length)throw new Error('備份中的標記格式不完整，尚未匯入。');
  return highlights;
 }
 function diff(before,after){
  const old=new Map(before.map(h=>[h.id,h])),next=new Map(after.map(h=>[h.id,h])),ops=[];
  for(const h of after)if(!old.has(h.id))ops.push({id:h.id,deleted:false,highlight:h});
  for(const id of old.keys())if(!next.has(id))ops.push({id,deleted:true});
  return ops;
 }
 function reconcile(local,records,pending){
  const remote=new Map(records.map(r=>[r.id,r])),queue=new Map(pending.map(op=>[op.id,op])),live=new Map();
  for(const r of records)if(!r.deleted&&clean(r.highlight))live.set(r.id,clean(r.highlight));
  for(const h of local)if(!remote.has(h.id)&&!queue.has(h.id))queue.set(h.id,{id:h.id,deleted:false,highlight:h});
  for(const [id,op] of queue){
   if(remote.get(id)?.deleted){live.delete(id);if(!op.deleted)queue.delete(id);}
   else if(op.deleted)live.delete(id);
   else if(clean(op.highlight))live.set(id,clean(op.highlight));
  }
  return {highlights:[...live.values()].sort((a,b)=>a.created-b.created||a.id.localeCompare(b.id)),pending:[...queue.values()]};
 }
 globalThis.StudySyncModel={clean,parse,diff,reconcile};
})();
