import fs from 'node:fs';
import vm from 'node:vm';
const ctx={};ctx.window=ctx;
for(const name of ['cme-data.js','cme-deep-notes.js','cme-visual-notes.js'])vm.runInNewContext(fs.readFileSync(new URL(name,import.meta.url),'utf8'),ctx,{filename:name});
const errors=[],notes=ctx.CME_DEEP_NOTES||[],expected=ctx.CME_PAPERS.map(p=>p.id),seen=new Set();
for(const note of notes){
 if(!expected.includes(note.id)||seen.has(note.id))errors.push('unexpected or duplicate paper '+note.id);seen.add(note.id);
 if(!['full','partial','abstract'].includes(note.access))errors.push('missing access scope '+note.id);
 for(const name of ['fulltextStatus','researchQuestion','synthesis'])if(!note[name]?.trim())errors.push('missing '+name+' '+note.id);
 for(const name of ['hypotheses','keyFindings','tables','examFocus','fulltextSources'])if(!Array.isArray(note[name])||!note[name].length)errors.push('missing '+name+' '+note.id);
 for(const table of note.tables||[]){
  if(!table.title||!table.sourceLabel||!/^https:\/\//.test(table.sourceUrl))errors.push('uncited table '+note.id);
  if(table.columns.length<2||!table.rows.length||table.rows.some(r=>r.length!==table.columns.length||r.some(c=>typeof c!=='string'||!c.trim())))errors.push('invalid table cells '+note.id+' '+table.title);
 }
 for(const source of note.fulltextSources||[])if(!source.title||!/^https:\/\//.test(source.url))errors.push('invalid source '+note.id);
 for(const h of note.hypotheses||[])if(!h.claim||!h.result||!h.meaning)errors.push('incomplete hypothesis '+note.id);
 for(const f of note.keyFindings||[])if(!f.heading||!f.text)errors.push('empty finding '+note.id);
 for(const p of note.examFocus||[])if(p.length!==2||p.some(x=>!x))errors.push('empty content focus '+note.id);
}
for(const id of expected)if(!seen.has(id))errors.push('paper omitted '+id);
const gaps=notes.filter(n=>n.access!=='full').map(n=>n.id).sort();
if(gaps.length||notes.length!==15)errors.push('full-text coverage mismatch');
const visuals=ctx.CME_VISUAL_NOTES||{};
for(const id of expected){
 const entries=visuals[id];
 if(!Array.isArray(entries)||!entries.length){errors.push('missing visual notes '+id);continue;}
 if(new Set(entries.map(entry=>entry.label)).size!==entries.length)errors.push('duplicate visual labels '+id);
 for(const entry of entries){
  if(['label','page','title','read','takeaway','trap'].some(field=>typeof entry[field]!=='string'||!entry[field].trim()))errors.push('incomplete visual note '+id);
  const sourceUrl=entry.url||entry.sourceUrl;
  if(sourceUrl&&!/^https:\/\//.test(sourceUrl))errors.push('invalid visual source '+id);
 }
}
for(const id of Object.keys(visuals))if(!expected.includes(id))errors.push('unexpected visual paper '+id);
if(!visuals['115-1']?.every(entry=>entry.kind==='narrative'))errors.push('115-1 narrative scope mismatch');
const scripts=fs.readFileSync(new URL('index.html',import.meta.url),'utf8');
const renderAt=scripts.indexOf('src="cme.js');
if(renderAt<0||['cme-deep-notes.js','cme-visual-notes.js'].some(file=>scripts.indexOf(file)<0||scripts.indexOf(file)>renderAt)||!scripts.includes('reading-position.js'))errors.push('missing or unordered reading scripts');
console.log(JSON.stringify({papers:notes.length,fullText:notes.length-gaps.length,fullTextGaps:gaps,tables:notes.reduce((n,p)=>n+p.tables.length,0),originalVisuals:Object.values(visuals).flat().filter(entry=>entry.kind!=='narrative').length,contentFocusPoints:notes.reduce((n,p)=>n+p.examFocus.length,0),errors},null,2));
if(errors.length)process.exitCode=1;
