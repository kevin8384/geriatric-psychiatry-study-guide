// One option key is used for its wording, truth judgment, explanation and evidence.
window.questionCard=function questionCard(q){
 const key=`${q.year}-${q.number}`, isReview=q.year==='考訊';
 const choices=q.options||[], isCombination=choices.some(o=>/^[A-F](?:\s*[+＋,、]\s*[A-F])+$/.test(o.text.trim()));
 const opts=(isCombination?q.statements||[]:choices.length?choices:q.statements||[]).map(o=>({letter:String(o.letter??o.n),text:o.text||''}));
 const first=q.text.search(/(?:^|\n)\s*(?:A|1)[.．、）)]\s*/);
 const stem=q.stem||(first>0?q.text.slice(0,first):q.text.split('\n')[0]);
 const asksFalse=/錯誤|錯的|為非|不正確|最不|不包含|不是|何者非|並非|有誤|不適合|不適當|不適切|不妥當|不屬於|未包括/.test(stem);
 const answerChoice=choices.find(o=>String(o.n)===String(q.answer));
 const chosen=isCombination&&answerChoice?new Set(answerChoice.text.match(/[A-F]/g)||[]):null;
 const notes=window.DETAILED_OPTION_NOTES?.[key]||{}, truths=window.DETAILED_OPTION_TRUTH?.[key]||{};
 const officialDetail=typeof reviewReasonMap==='function'?reviewReasonMap(q):{};
 const breakdown=opts.map(o=>{
  const blank=!o.text.trim(), unknown=blank||!!window.DETAILED_OPTION_UNDETERMINED?.[key]?.[o.letter];
  const specific=notes[o.letter];
  const sourceText=officialDetail[o.letter];
  const explanation=specific||(sourceText&&sourceText.length>=60?sourceText:'');
  let truth=!specific&&typeof truths[o.letter]==='boolean'?truths[o.letter]:null;
  if(truth===null&&specific){if(/^\s*錯誤/.test(specific))truth=false;else if(/^\s*正確/.test(specific))truth=true;}
  if(truth===null&&explanation&&!specific){const selected=chosen?chosen.has(o.letter):String(q.answer)===o.letter;truth=asksFalse?!selected:selected;}
  const pending=!explanation&&!unknown;
  const verdict=unknown?(blank?'原卷選項留白':'資料不足，待確認'):pending?'逐項詳解待核對':truth===null?'需看適用條件':truth?'正確敘述':'錯誤敘述';
  const reason=unknown?(specific||'原始題目沒有可判讀的完整敘述，無法判定正誤。'):explanation||'此選項尚未完成來源與具體理由的核對。';
  const state=unknown||pending||truth===null?'is-unknown':truth?'is-right':'is-wrong';
  return `<div class="option-analysis ${state}"><div class="option-top"><b>${esc(o.letter)}.</b><span>${esc(verdict)}</span></div><p class="option-statement">${esc(o.text||'[原卷留白]')}</p><p class="option-why"><b>判斷理由：</b>${esc(reason)}</p></div>`;
 }).join('');
 const accepted=q.acceptedAnswers?.length?q.acceptedAnswers:[String(q.answer)];
 const answerLabel=q.giveaway?'釋疑後送分':accepted.length>1?'釋疑後接受選項 '+accepted.join(' 或 '):'選項 '+q.answer+(answerChoice?'（'+answerChoice.text+'）':'');
 const mismatch=window.DETAILED_OPTION_KEY_MISMATCH?.[key];
 const evidence=(window.DETAILED_OPTION_SOURCES?.[key]||[]).map(s=>s.url&&/^https:\/\//.test(s.url)?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>`:esc(s.title)).join('；');
 return `<article class="qcard"><div class="qhead"><strong>${isReview?'考訊整理題':q.year+' 年'}　第 ${q.number} 題</strong><span class="tag">${esc(labelFor(q.tag))}${isReview&&q.code?' · '+esc(q.code):''}</span></div><div class="qbody"><div class="qtext full-question">${esc(q.text)}</div><div class="answer-line"><span class="official">${isReview?'考訊答案':'公告答案'}：${esc(answerLabel)}</span></div>${q.officialAnswerNote?`<p class="source-line">原卷釋疑註記：${esc(q.officialAnswerNote)}</p>`:''}${mismatch?`<div class="notice"><b>答案與來源核對：</b>${esc(mismatch)}</div>`:''}<h4 class="option-heading">每個選項的判定與理由</h4><div class="option-list">${breakdown||'題目選項待核對。'}</div>${isReview&&q.explanation?`<details class="source-exp"><summary>查看考訊原始詳解</summary><pre>${esc(q.explanation)}</pre></details>`:''}<p class="source-line">題目來源：${esc(q.exam||'考訊彙整.pdf')}${q.sourcePages?.length?'，PDF 第 '+q.sourcePages.join('、')+' 頁':''}。${q.sourceReference?'原卷參考資料：'+esc(q.sourceReference):''}</p>${evidence?`<p class="source-line">補充核對來源：${evidence}</p>`:''}</div></article>`;
};
