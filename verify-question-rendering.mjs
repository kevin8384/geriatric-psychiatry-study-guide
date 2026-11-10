import fs from 'node:fs';
import vm from 'node:vm';
const c={}; c.window=c;
c.esc=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
c.labelFor=v=>v;
for(const f of ['topics','learning-map-revisions','questions','review','option-notes','source-questions','option-revisions','review-revisions','early-year-revisions','review-completion','review-completion-notes','word113-questions','word113-notes','news115-questions','news115-notes','question-view'])vm.runInNewContext(fs.readFileSync(new URL(f+'.js',import.meta.url),'utf8'),c,{filename:f});
const errors=[],conditional=[];
let optionCount=0,labeledOptionCount=0,undeterminedOptionCount=0;
for(const q of [...c.EXAM_QUESTIONS,...c.REVIEW_QUESTIONS,...c.WORD_REVIEW_QUESTIONS,...c.NEWS115_QUESTIONS]){
 const key=q.year+'-'+q.number,html=c.questionCard(q);
 if(/<b>undefined\.|本項具體聲稱|需逐一核對族群|符合題意：|不符合題意：/.test(html))errors.push(key+': stale output');
 if(html.includes('逐項詳解待核對'))errors.push(key+': missing specific note');
 if(!html.includes(c.esc(q.text)))errors.push(key+': incomplete source question');
 if(html.includes('需看適用條件'))conditional.push(key);
 const combo=q.options.some(o=>/^[A-F](?:\s*[+＋,、]\s*[A-F])+$/.test(o.text.trim()));
 const opts=(combo?q.statements:q.options.map(o=>({letter:String(o.n),text:o.text})))||[];
 const notes=c.DETAILED_OPTION_NOTES?.[key]||{};
 for(const o of opts){
  optionCount++;
  const unknown=!o.text.trim()||!!c.DETAILED_OPTION_UNDETERMINED?.[key]?.[o.letter];
  if(unknown){undeterminedOptionCount++;continue;}
  const note=String(notes[o.letter]||'').trim();
  if(!/^(正確敘述|錯誤敘述)/.test(note))errors.push(key+' '+o.letter+': missing explicit truth label');
  else labeledOptionCount++;
  if(/本項具體聲稱|需逐一核對|本題需以題幹|公告答案未選|公告未選此項|不能只看單一概念|本項另聚焦|逐項詳解待核對|需看適用條件/.test(note))errors.push(key+' '+o.letter+': generic explanation remains');
 }
}
// A negative question must describe the statement's truth, not answer selection.
const fixed=c.questionCard(c.EXAM_QUESTIONS.find(q=>q.year===107&&q.number===5));
if(!fixed.includes('<b>5.</b><span>正確敘述</span>'))errors.push('107-5: stale truth overrides verified note');
const expectedCorrections={
 '107-4':{answer:'4'},
 '110-33':{giveaway:true},'110-45':{giveaway:true},
 '111-8':{giveaway:true},'111-34':{giveaway:true},'111-41':{giveaway:true},'111-48':{answer:'1'},
 '112-8':{accepted:['2','5']},'112-14':{accepted:['3','4']},'112-16':{giveaway:true},
 '112-25':{giveaway:true},'112-28':{giveaway:true},'112-35':{accepted:['1','2','3','5']},
 '112-45':{accepted:['3','4']},'112-50':{accepted:['1','2']},'112-52':{giveaway:true},'112-53':{giveaway:true},
 '113-14':{accepted:['3','4']},'113-18':{accepted:['3','5']}
};
for(const [key,want] of Object.entries(expectedCorrections)){
 const [year,number]=key.split('-').map(Number),q=c.EXAM_QUESTIONS.find(x=>x.year===year&&x.number===number);
 if(!q){errors.push(key+': corrected question missing');continue;}
 if(want.answer&&String(q.answer)!==want.answer)errors.push(key+': corrected answer not applied');
 if(want.giveaway&&!q.giveaway)errors.push(key+': giveaway not applied');
 if(want.accepted&&JSON.stringify(q.acceptedAnswers)!==JSON.stringify(want.accepted))errors.push(key+': accepted answers not applied');
 const card=c.questionCard(q);
 if(want.giveaway&&!card.includes('釋疑後送分'))errors.push(key+': giveaway not rendered');
 if(want.accepted&&!card.includes('釋疑後接受選項 '+want.accepted.join(' 或 ')))errors.push(key+': accepted answers not rendered');
}
if(c.STUDY_TOPICS?.length!==16)errors.push('learning map: expected 16 topics');
for(const topic of c.STUDY_TOPICS||[]){
 if(!topic.blocks?.some(block=>block.h.startsWith('考題審查後必會')))errors.push('learning map '+topic.id+': reviewed knowledge block missing');
}
if(undeterminedOptionCount!==6)errors.push('expected two old blank options and four unavailable source options from 115考訊-21');
const inventory=c.REVIEW_SOURCE_AUDIT;
if(c.REVIEW_QUESTIONS.length!==61||inventory?.questionCount!==61)errors.push('review source: expected 61 distinct questions');
for(const source of inventory?.items||[]){
 const q=c.REVIEW_QUESTIONS.find(q=>q.number===source.siteNumber);
 if(!q||q.sourceIndex!==source.sourceIndex)errors.push('review source '+source.sourceIndex+': missing mapping');
 if(!q?.sourcePages?.length)errors.push('review source '+source.sourceIndex+': missing PDF pages');
}
if(new Set(c.REVIEW_QUESTIONS.map(q=>q.sourceIndex)).size!==61)errors.push('review source: duplicate or missing source records');
if(new Set(c.REVIEW_QUESTIONS.map(q=>q.number)).size!==61)errors.push('review source: duplicate website IDs');
const updatedReview=c.REVIEW_QUESTIONS.find(q=>q.number===27);
if(updatedReview.answer!=='4')errors.push('review 27: source correction to 4 not applied');
if(JSON.stringify(c.REVIEW_QUESTIONS.find(q=>q.number===5).acceptedAnswers)!==JSON.stringify(['3','5']))errors.push('review 5: 3 or 5 not applied');
if(!c.questionCard(c.REVIEW_QUESTIONS.find(q=>q.number===40)).includes('正確敘述 B、C、D'))errors.push('review 40: direct letter answer not rendered');
if(!c.questionCard(c.REVIEW_QUESTIONS.find(q=>q.number===41)).includes('錯誤敘述 D、E'))errors.push('review 41: negative letter answer not rendered');
const word=c.WORD_REVIEW_QUESTIONS;
if(word.length!==45||c.WORD_REVIEW_AUDIT?.questionCount!==45)errors.push('Word source: expected 45 questions');
for(const [kind,count] of Object.entries({table:8,text:33,image:4}))if(word.filter(q=>q.sourceKind===kind).length!==count)errors.push('Word '+kind+': incorrect source classification');
if(word.some(q=>q.answerMissing||q.answer===null))errors.push('Word: highlighted source answers must not be marked missing');
const highlightedKeys={13:'ABC',14:'BCDE',15:'BDE',16:'ABC',17:'C',18:'ACD',19:'ACD',20:'D',21:'BDE',22:'BDE'};
for(const [number,key] of Object.entries(highlightedKeys)){
 const q=word.find(q=>q.number===Number(number));
 if(q.answerBasis!=='yellow-highlight'||q.sourceHighlightedOptions?.join('')!==key||q.answerStatements?.join('')!==key)errors.push('Word '+number+': yellow highlight answer was lost');
 if(!c.questionCard(q).includes('原檔答案（螢光標記）'))errors.push('Word '+number+': highlight source label missing');
}
if(word.reduce((sum,q)=>sum+q.statements.length,0)!==222)errors.push('Word: expected 222 source statements');
if(new Set(word.map(q=>q.year+'-'+q.number)).size!==45)errors.push('Word: duplicate question IDs');
for(const q of word){
 const html=c.questionCard(q);
 if(!q.sourceLocation||!html.includes(c.esc(q.sourceLocation)))errors.push('Word '+q.number+': missing source location');
 if(!c.DETAILED_OPTION_SOURCES?.['113考訊-'+q.number]?.length)errors.push('Word '+q.number+': no evidence');
 if(html.includes('選項 null')||html.includes('公告答案：'))errors.push('Word '+q.number+': invented official answer');
 if(q.answerMissing&&!html.includes('原檔未附答案'))errors.push('Word '+q.number+': missing-answer label lost');
 if(/PDF 第/.test(html))errors.push('Word '+q.number+': invented PDF page');
}
if(!c.questionCard(word.find(q=>q.number===40)).includes('正確敘述 C、D、E'))errors.push('Word 40: direct letter answers not rendered');
if(!c.questionCard(word.find(q=>q.number===26)).includes('甲狀腺'))errors.push('Word 26: source discrepancy missing');
const news=c.NEWS115_QUESTIONS;
if(news.length!==62||c.NEWS115_SOURCE_AUDIT?.questionCount!==62)errors.push('115 source: expected 62 MC questions');
if(news.reduce((sum,q)=>sum+q.statements.length,0)!==306)errors.push('115 source: expected 306 statement entries');
if(new Set(news.map(q=>q.year+'-'+q.number)).size!==62)errors.push('115 source: duplicate IDs');
if(news.some(q=>q.year!=='115考訊'||q.kind!=='pdf-review'||!q.sourcePages?.length))errors.push('115 source: missing year/type/page mapping');
for(const q of news){
 const card=c.questionCard(q);
 if(!card.includes('115考訊題')||!card.includes('考訊答案：')||card.includes('公告答案：'))errors.push('115-'+q.number+': incorrect source label');
 if(q.explanation&&!card.includes(c.esc(q.explanation)))errors.push('115-'+q.number+': original explanation not preserved');
 if(!card.includes('PDF 第 '+q.sourcePages.join('、')+' 頁'))errors.push('115-'+q.number+': source pages missing');
}
const missingCard=c.questionCard(news.find(q=>q.number===21));
if((missingCard.match(/<span>原檔未提供選項<\/span>/g)||[]).length!==4)errors.push('115-21: unavailable options must remain explicit');
for(const n of [8,16,25,58])if(!c.DETAILED_OPTION_KEY_MISMATCH?.['115考訊-'+n])errors.push('115-'+n+': known source discrepancy missing');
const negative=c.questionCard(news.find(q=>q.number===58));
if(!negative.includes('<b>A.</b><span>正確敘述</span>')||!negative.includes('<b>B.</b><span>錯誤敘述</span>'))errors.push('115-58: truth confused with answer selection');
const appSource=fs.readFileSync(new URL('app.js',import.meta.url),'utf8');
if(!appSource.includes('>114考訊（PDF）</option>')||!appSource.includes('>115考訊</option>'))errors.push('question year labels not updated');
if(!appSource.includes('...(window.NEWS115_QUESTIONS||[])'))errors.push('115 questions not included in filters');
console.log(JSON.stringify({questions:c.EXAM_QUESTIONS.length+c.REVIEW_QUESTIONS.length+word.length+news.length,reviewQuestions:c.REVIEW_QUESTIONS.length,wordQuestions:word.length,news115Questions:news.length,optionCount,labeledOptionCount,undeterminedOptionCount,errors,conditionalQuestions:conditional},null,2));
if(errors.length)process.exitCode=1;
