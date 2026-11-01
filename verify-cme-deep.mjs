import fs from 'node:fs';
import vm from 'node:vm';
const ctx={};ctx.window=ctx;
for(const name of ['cme-data.js','cme-deep-notes.js'])vm.runInNewContext(fs.readFileSync(new URL(name,import.meta.url),'utf8'),ctx,{filename:name});
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
if(JSON.stringify(gaps)!==JSON.stringify(['114-1a','114-6']))errors.push('unexpected full-text availability claims');
if(notes.length!==15||notes.filter(n=>n.access==='full').length!==13)errors.push('coverage mismatch');
const scripts=fs.readFileSync(new URL('index.html',import.meta.url),'utf8');
if(scripts.indexOf('cme-deep-notes.js')>scripts.indexOf('src="cme.js')||!scripts.includes('reading-position.js'))errors.push('missing or unordered reading scripts');
console.log(JSON.stringify({papers:notes.length,fullText:notes.filter(n=>n.access==='full').length,fullTextGaps:gaps,tables:notes.reduce((n,p)=>n+p.tables.length,0),contentFocusPoints:notes.reduce((n,p)=>n+p.examFocus.length,0),errors},null,2));
if(errors.length)process.exitCode=1;
