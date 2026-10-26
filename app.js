window.DETAILED_OPTION_TRUTH=Object.assign(window.DETAILED_OPTION_TRUTH||{}, {'107-44':{A:true,B:false,C:false,D:true,E:false},'108-37':{A:false,B:true,C:true,D:false,E:true}});
const $=s=>document.querySelector(s);let activeTopic=null,activeTag=null,currentView='topics',yearFilter='all',query='',page=1,perPage=20;
const EXAM_QUESTIONS=[...window.EXAM_QUESTIONS,...(window.REVIEW_QUESTIONS||[])];
const topicMap=Object.fromEntries(STUDY_TOPICS.map(t=>[t.id,t]));
const tagTopic={assessment:'assessment',labs:'labs',nonlab:'nonlab',teamcare:'teamcare',longterm:'longterm'};
const labelFor=id=>topicMap[tagTopic[id]||id]?.title||'綜合評估';
const countFor=id=>EXAM_QUESTIONS.filter(q=>id==='nonlab'?q.tag==='assessment':q.tag===id).length;
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function htmlLines(s){return esc(s).replace(/\n/g,'<br>')}
function buildNav(){const nav=$('#nav');nav.innerHTML=STUDY_TOPICS.map((t,i)=>`<button data-id="${t.id}" onclick="openTopic('${t.id}')"><span>${String(i+1).padStart(2,'0')}</span>${esc(t.title)}<span class="n">${countFor(t.id)||''}</span></button>`).join('')}
function setCrumb(s){$('#crumb').textContent=s}
function showView(view){currentView=view;activeTopic=null;activeTag=null;page=1;document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));if(view==='topics')renderTopics();else if(view==='questions')renderQuestions();else if(view==='trends')renderTrends();else renderSources()}
function renderTopics(){setCrumb('學習地圖　/　16 個領域');$('#view').innerHTML=`<section class="hero"><div class="eyebrow">FROM FOUNDATIONS TO CLINICAL REASONING</div><h2>把老年精神醫學<br>讀成一張有脈絡的地圖</h2><p>先認識正常老化與評估方法，再學疾病表現、鑑別診斷和照護原則。每個主題都連著 107–114 年考題，幫你把概念用回題目。</p><div class="metrics"><div class="metric"><strong>16</strong><span>學習領域</span></div><div class="metric"><strong>480</strong><span>官方歷屆試題</span></div><div class="metric"><strong>8 年</strong><span>107–114 年</span></div></div></section><div class="section-head"><div><h2>從哪裡開始</h2><p>依基礎 → 評估 → 疾病 → 照護與倫理排序</p></div><button class="secondary" onclick="showView('trends')">看考題分布 →</button></div><div class="grid">${STUDY_TOPICS.map((t,i)=>`<article class="topic-card" onclick="openTopic('${t.id}')"><div class="num">${String(i+1).padStart(2,'0')}　/　${countFor(t.id)} 題</div><h3>${esc(t.title)}</h3><p>${esc(t.short)}</p><div class="count">讀核心概念　→</div></article>`).join('')}</div><div class="section-head"><div><h2>建議學習順序</h2><p>先建立概念，再練習區辨容易混淆的疾病表型</p></div></div><div class="trend"><div class="trend-card"><h3>第一輪｜看懂老年特有的變化</h3><p>基礎老年醫學 → 評估 → 檢查 → 非實驗室評估。先學會正常老化和疾病的分界。</p></div><div class="trend-card"><h3>第二輪｜疾病鑑別與臨床處置</h3><p>失智症、譫妄、精神病、情感疾患、焦慮與睡眠。每題都問自己：病程、功能、誘因、風險和處置順序是什麼？</p></div></div><div class="notice"><b>題庫說明：</b>網站保留考古題題幹和公告答案。各題「詳解」提供概念導向的推理及正確選項文字；公告版未附逐選項解析者，網站不會假稱那是官方詳解。</div>`}
function openTopic(id){activeTopic=id;currentView='topic';const t=topicMap[id];document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.id===id));setCrumb('學習地圖　/　'+t.title);const qs=EXAM_QUESTIONS.filter(q=>id==='nonlab'?q.tag==='assessment':q.tag===id);const years=[...new Set(qs.map(q=>q.year).filter(y=>Number.isInteger(Number(y))).map(Number))].sort((a,b)=>a-b);const yearText=years.length?years.join('、'):'無歷屆年度題';$('#view').innerHTML=`<div class="topic-detail"><button class="backlink" onclick="showView('topics')">← 回學習地圖</button><div class="topic-hero"><div class="eyebrow">STUDY MODULE · ${String(STUDY_TOPICS.findIndex(x=>x.id===id)+1).padStart(2,'0')}</div><h2>${esc(t.title)}</h2><p>${esc(t.lead)}</p></div>${t.blocks.map(b=>`<section class="content-card"><h3>${esc(b.h)}</h3><p>${esc(b.p)}</p></section>`).join('')}<div class="exam-strip"><p><b>本領域考題：</b>題數：${qs.length} 題｜年份：${yearText}</p><button class="secondary" onclick="showQuestions('${id}')">看本領域題目與解析 →</button></div><section class="content-card"><h3>學習提醒</h3><p>先用自己的話重述病程／理論，再對照考題選項。考古題有些依當年的文獻或法規版本設計；涉及現行臨床與法律時，請以最新正式來源查核。</p></section></div>`}
function showQuestions(tag=''){currentView='questions';activeTopic=null;activeTag=tag||'';yearFilter='all';query='';page=1;document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));renderQuestions()}
function questionPool(){return EXAM_QUESTIONS.filter(q=>(!activeTag||(activeTag==='nonlab'?q.tag==='assessment':q.tag===activeTag))&&(yearFilter==='all'||String(q.year)===String(yearFilter))&&(!query||(`${q.year} ${q.number} ${q.text} ${labelFor(q.tag)}`).toLowerCase().includes(query.toLowerCase())))}
function renderQuestions(){currentView='questions';setCrumb('考題詳解　/　'+(activeTag?labelFor(activeTag):'全部領域'));const tagOpts=STUDY_TOPICS.map(t=>`<option value="${t.id}" ${activeTag===t.id?'selected':''}>${esc(t.title)}</option>`).join('');let years=[107,108,109,110,111,112,113,114];$('#view').innerHTML=`<div class="hero"><div class="eyebrow">PAST PAPERS · OFFICIAL KEY</div><h2>用考題練習<br>從答案走回概念</h2><p>107–114 年考題依領域與年度分類。每題題幹與選項直接展開，並逐項標示判定與理由；考訊彙整中的文獻導讀題另呈現原始逐題詳解。</p><div class="metrics"><div class="metric"><strong>519</strong><span>考題與考訊練習</span></div><div class="metric"><strong>480 + 39</strong><span>歷屆題 + 考訊解析題</span></div></div></div><div class="question-tools"><input id="qsearch" type="search" placeholder="搜尋題幹、題號、關鍵字…" value="${esc(query)}"><select id="qyear"><option value="all">全部年度與考訊</option>${years.map(y=>`<option value="${y}" ${yearFilter===String(y)?'selected':''}>${y} 年</option>`).join('')}<option value="考訊" ${yearFilter==='考訊'?'selected':''}>考訊詳解題</option></select><select id="qtag"><option value="">全部領域</option>${tagOpts}</select></div><div id="qresults"></div>`;$('#qsearch').addEventListener('input',e=>{query=e.target.value;page=1;renderResults()});$('#qyear').addEventListener('change',e=>{yearFilter=e.target.value;page=1;renderResults()});$('#qtag').addEventListener('change',e=>{activeTag=e.target.value;page=1;renderResults()});renderResults()}
function renderResults(){const all=questionPool(),pages=Math.max(1,Math.ceil(all.length/perPage));if(page>pages)page=pages;let subset=all.slice((page-1)*perPage,page*perPage);$('#qresults').innerHTML=`<div class="result-line">找到 <b>${all.length}</b> 題${activeTag?'｜'+esc(labelFor(activeTag)):''}　·　顯示第 ${page}/${pages} 頁</div>${subset.map(q=>questionCard(q)).join('')}<div class="pagination">${Array.from({length:Math.min(pages,8)},(_,i)=>{let pn=pages<=8?i+1:Math.max(1,Math.min(pages-7,page-3))+i;return `<button class="${pn===page?'active':''}" onclick="goPage(${pn})">${pn}</button>`}).join('')}</div>`}
function goPage(p){page=p;renderResults();window.scrollTo({top:0,behavior:'smooth'})}
function reviewReasonMap(q){const map={};if(!q.explanation)return map;for(const m of q.explanation.matchAll(/(?:^|\n)\s*([A-E])\.\s*([\s\S]*?)(?=\n\s*[A-E]\.\s*|$)/g))map[m[1]]=m[2].trim();return map}
function optionKnowledge(q,s){const x=(s+' '+q.text).toLowerCase();const rules=[
[/\bmo?ca\b|mmse|cdr|gds|madrs|mmse|量表|測驗|執行功能|工作記憶/,'量表與神經心理測驗各測量不同構念；分數要連同工具範圍、教育／語言背景、感官狀態及日常功能解讀，不能單靠單一分數確診。'],
[/cam|confusion assessment|譫妄|瞻妄|delirium|help\b|4at|3d-cam/,'譫妄的辨識重點是急性或波動的注意力與認知改變。CAM採「急性／波動＋注意力不集中，再加思考混亂或意識改變」；定向障礙不是必要條件。'],
[/dwi|diffusion|梗塞|中風|ischemi|stroke/,'急性缺血與陳舊病灶需依影像序列和病程判讀；擴散加權MRI對急性缺血較敏感，CT則常用於急性出血或快速初評。'],
[/路易|lewy|dlb|mibg|α-synuclein|synuclein|視幻覺|REM sleep behavio/,'DLB核心表現包括認知波動、反覆視幻覺、REM睡眠行為障礙及自發性巴金森徵象；自主神經功能障礙與抗精神病藥敏感也要納入。'],
[/額顳|frontotemporal|bvftd|ftd|hyperorality|過度口慾|運動神經元/,'bvFTD常以漸進的社會認知與行為改變起始，如去抑制、淡漠、刻板行為或飲食改變；家屬病史和MRI／功能影像有助於和精神疾病鑑別。'],
[/阿茲|alzheimer|\bad\b|amyloid|類澱粉|tau|t-tau|p-tau/,'AD常見新學習與情節記憶障礙；CSF常見Aβ42下降、p-tau與總tau上升，但生物標記須配合臨床表型，不能單獨視為病因確證。'],
[/mci|輕度認知|認知障礙|認知功能/,'MCI有客觀認知下降，但基本獨立生活功能通常大致保留；是否已影響獨立功能，是和失智症區分的重要界線。'],
[/睡眠|insomnia|失眠|osa|呼吸中止|rbd|REM|睡眠效率|cbt-i|睡眠限制/,'老化常使慢波睡眠減少、睡眠片段化與夜間醒來增加。CBT-I以刺激控制、睡眠限制及認知重建為核心；睡眠衛生是輔助。'],
[/憂鬱|抑鬱|depress|ect|rTMS|抗憂鬱|suicid|自殺/,'老年憂鬱可能呈現身體抱怨、睡眠與認知主訴；治療需同時評估功能及自殺風險。ECT、rTMS與藥物選擇取決於嚴重度、病史、共病及風險。'],
[/酒精|acamprosate|naltrexone|disulfiram|aud|飲酒|物質/,'AUD治療需區分戒酒維持與減少大量飲酒目標，並把肝腎功能、opioid使用、戒斷風險及多重用藥納入選藥。'],
[/app?elbaum|decision|決策能力|understanding|appreciation|reasoning|表達選擇/,'Appelbaum決策能力按特定決定評估四項能力：理解、體認／適用於自身、推理及表達選擇；患者選擇與醫療團隊不同，不等於缺乏能力。'],
[/病人自主|預立醫療|安寧|餵食管|精神衛生法|行為能力|司法|駕駛|法規|法律/,'倫理與法規題需依作答年度的適用條文判斷，並區分臨床決策能力、法律行為能力與正式預立醫療決定；實務使用前應核對現行法規。'],
[/焦慮|anxiety|恐慌|強迫|ocd|benzodiazepine|苯二氮/,'老年焦慮常與憂鬱、睡眠和身體疾病共病；新發焦慮需排除藥物及身體原因。BZD會增加嗜睡、跌倒、認知影響與依賴風險。'],
[/人格|hoarding|儲物|囤積|五因素|neuroticism/,'晚年新發人格改變要排除神經認知疾病。儲物症可造成跌倒、火災與居住衛生風險，病識感不足時常需家訪與環境安全支持。'],
[/長期照護|long-term|ltc|bpsd|機構|照顧者/,'長照情境先找疼痛、感染、便祕、藥物、感官與環境誘因，優先個別化非藥物措施；藥物需設定症狀目標並定期檢討效益和傷害。'],
[/老化|正常老化|disposable soma|氧化|自由基|telomere|端粒|衰弱|生理變化/,'老化理論是互補假說，需區分機轉假說、動物研究、相關性與人類因果證據。正常老化降低器官儲備，不等於必然失能或精神疾病。']
];const hit=rules.find(([re])=>re.test(x));return hit?hit[1]:(window.STUDY_EXPLANATIONS[q.tag]||window.STUDY_EXPLANATIONS.assessment)}
function questionCard(q){const topic=labelFor(q.tag),isReview=q.year==='考訊',yearLabel=isReview?'考訊整理題':`${q.year} 年`,opts=q.statements||[],answerChoice=(q.options||[]).find(o=>o.n===Number(q.answer)),combo=answerChoice&&/[A-E](?:\s*[+＋,、]\s*[A-E])/.test(answerChoice.text),chosenLetters=combo?new Set(answerChoice.text.match(/[A-E]/g)):null,negative=/錯誤|為非|不正確|最不|不包含|不是|何者非|並非/.test(q.text.split(/\n選項/)[0]);const exact=reviewReasonMap(q);const breakdown=opts.map(o=>{let correct;if(chosenLetters)correct=chosenLetters.has(o.letter);else if(/^\d+$/.test(o.letter))correct=Number(o.letter)===Number(q.answer);else correct=!!chosenLetters&&chosenLetters.has(o.letter);let label=chosenLetters?(correct?'正確敘述':'錯誤敘述'):(/^\d+$/.test(o.letter)?(Number(o.letter)===Number(q.answer)?(negative?'錯誤敘述':'正確敘述'):(negative?'正確敘述':'錯誤敘述')):(correct?'正確敘述':'錯誤敘述'));let why=exact[o.letter]||`${correct?'本題公告組合將此敘述列為正確。':'本題公告組合未將此敘述列入正確組合。'} ${optionKnowledge(q,o.text)}`;return `<div class="option-analysis ${correct?'is-right':'is-wrong'}"><div class="option-top"><b>${esc(o.letter)}.</b><span>${esc(label)}</span></div><p class="option-statement">${esc(o.text)}</p><p class="option-why"><b>判斷理由：</b>${esc(why)}</p></div>`}).join('');return `<article class="qcard"><div class="qhead"><strong>${yearLabel}　第 ${q.number} 題</strong><span class="tag">${esc(topic)}${isReview?' · '+esc(q.code||'文獻導讀'):''}</span></div><div class="qbody"><div class="qtext full-question">${esc(q.text)}</div><div class="answer-line"><span class="official">${isReview?'考訊答案':'公告答案'}：選項 ${esc(q.answer)}${answerChoice?'（'+esc(answerChoice.text)+'）':''}${window.DETAILED_OPTION_TRUTH?.[`${q.year}-${q.number}`]?'　⚠ 逐項文獻核對與公告答案組合不一致，請看各項說明。':''}</span></div><h4 class="option-heading">逐項解析</h4><div class="option-list">${breakdown||`<div class="option-analysis"><p>題目未能自動拆出各選項文字，請以上方完整題幹與公告答案為準。</p></div>`}</div>${isReview&&q.explanation?`<details class="source-exp"><summary>查看考訊原始詳解</summary><pre>${esc(q.explanation)}</pre></details>`:''}<p class="source-line">來源：${isReview?'考訊彙整 PDF，領域 '+esc(q.code||'文獻導讀'):`${q.year} 年公告版／釋疑版考題`}。考題無逐項官方解析時，逐項判讀依課本整理；請參照該領域學習頁。</p></div></article>`}
function optionKnowledge(q,s,correct,asksFalse){const t=s.toLowerCase();let head=q.text||'';head=head.replace(new RegExp('^\\s*'+q.number+'[.．、]\\s*'),'');const cut=head.search(/\n\s*(?:[A-F][.．、）)]|1[.．、）)]|選項\s*[:：]?)/);if(cut>=0)head=head.slice(0,cut);const x=t+' '+head.toLowerCase();if(/mci|輕度認知障礙|輕微認知缺損/.test(x)&&/視覺記憶|visual memory/.test(t))return '此選項比較 MCI 與中度 AD 的視覺記憶表現；不能只因兩組都有記憶受損就說程度相同。題目所引研究顯示兩組在此測驗領域有差異，故「大致相同」不成立。';if(/mci|輕度認知障礙|輕微認知缺損/.test(x)&&/學習|learning/.test(t))return '此題所引研究中，MCI 的學習能力並非與正常老人相同；「命名接近正常」不能推論「學習也正常」，因新資訊學習／延遲記憶是常受影響的認知域。';
if(/cam|confusion assessment|譫妄|delirium/.test(x)){if(/定向|disorientation/.test(t))return 'CAM 的必要組合是急性／波動及注意力不集中，再加思考混亂或意識程度改變；定向障礙雖常見，並非四項必要特徵之一。';if(/急性|波動|acute onset|fluctuat/.test(t))return '急性起病或症狀波動是 CAM 的第一項必要特徵；應由照顧者或病歷確認相較基線的時間變化。';if(/注意|inattention/.test(t))return '注意力不集中是 CAM 的第二項必要特徵，須與急性／波動同時存在，再加思考混亂或意識改變。';if(/思考|意識|disorganized|altered level/.test(t))return '思考混亂與意識程度改變是 CAM 第三／四特徵，符合其一即可與前兩項共同構成陽性演算法。';}
if(/app?elbaum|決策能力|understanding|appreciation|reasoning/.test(x)){if(/理解|understand/.test(t))return '理解是四項決策能力之一，評估患者能否用自己的話重述相關資訊，而非只看是否同意醫療建議。';if(/體認|appreciat/.test(t))return '體認是把資訊連結到自己處境與可能後果的能力；單純記得資訊但否認其與自身有關，可能顯示此項受損。';if(/推理|reason/.test(t))return '推理是比較選項、後果與個人價值的過程；結論與醫療團隊不同本身不代表推理能力缺損。';if(/選擇|choice/.test(t))return '表達選擇是四項能力之一；穩定表達偏好不代表其他理解、體認及推理項目自然都完整。';}
if(/dlb|路易氏體|lewy|mibg|α-synuclein|dopamine transporter/.test(x)){if(/mibg/.test(t))return 'DLB 的心肌 I-123 MIBG 攝取通常降低，反映心臟交感神經去支配；攝取增加的說法方向相反。';if(/dat|dopamine transporter|多巴胺轉運/.test(t))return 'DLB 的多巴胺轉運體影像通常呈基底核攝取降低，支持黑質紋狀體多巴胺神經元受損。';if(/視幻|波動|rem|巴金森|parkinson/.test(t))return '這項描述對應 DLB 的核心臨床特徵之一；需辨認具體視幻覺、認知波動、RBD、自發性巴金森徵象，不能只靠單一症狀確診。';}
if(/阿茲|alzheimer|amyloid|aβ|tau|海馬|hippocamp/.test(x)){if(/aβ|amyloid|類澱粉/.test(t)&&/降低|下降|decreas|low/.test(t))return 'AD 的 CSF Aβ42 或 Aβ42/40 比值常降低，因可溶性 Aβ 被沉積於腦內；腦脊髓液與 PET 的指標方向要分清。';if(/aβ|amyloid|類澱粉/.test(t)&&/增加|升高|高/.test(t))return '腦內類澱粉沉積可使 amyloid PET 訊號增加，但 CSF Aβ42 常是降低；須看題目說的是哪一種檢體／影像。';if(/p-tau|phosphorylated tau|磷酸化tau/.test(t))return 'AD 的 CSF p-tau 常升高，支持 tau 病理；總 tau 也會受其他急性神經元損傷影響，不能混為同一種特異性。';if(/海馬|hippocamp|內側顳葉/.test(t))return '典型 AD 早期常見內側顳葉與海馬萎縮，並與情節記憶／新學習受損相呼應；影像仍須和病史及功能整合。';if(/記憶|learning|recall/.test(t))return '典型 AD 先傷害新資訊學習與延遲回憶的儲存；提示通常不如正常老化單純提取困難那樣明顯改善。';}
if(/mci|輕度認知障礙/.test(x)){if(/日常|獨立|functional|activities/.test(t))return 'MCI 的區分點是有客觀認知下降，但基本獨立生活能力大致保留；日常功能已明顯受損時應評估是否達失智症。';if(/命名|praxis|應用功能/.test(t))return 'MCI 是異質性臨床狀態，不代表所有認知領域都正常；某些個案命名或動作運用仍可保留，但不能將此推廣到每位患者。';}
if(/額顳|frontotemporal|bvftd|ftd|tau|tdp-43/.test(x)){if(/去抑制|淡漠|同理|口慾|飲食|刻板|社會認知/.test(t))return '這些是 bvFTD 常見的早期行為／社會認知變化；要確認其為相較基線漸進出現，並排除情緒疾患、藥物及其他神經病因。';if(/額葉|前顳|frontal|temporal|萎縮|代謝/.test(t))return 'FTLD 影像通常顯示額葉或前顳葉網絡萎縮／低代謝，分布可依 bvFTD 或語言亞型不同；早期影像正常不能完全排除。';}
if(/血管性|vascular|腔隙|白質|梗塞|中風/.test(x)){if(/階梯|突然|步態|執行|處理速度|白質|腔隙/.test(t))return '血管性認知障礙的表型取決於病灶位置與負荷；中風後階梯下降、小血管病的速度／執行功能與步態問題較典型，影像病灶須能解釋症狀。';}
if(/b12|維他命.?b12|葉酸|folate|homocysteine/.test(x)){if(/大球性|macrocyt/.test(t))return 'B12 缺乏可同時造成血液學與神經精神表現；神經症狀不一定等到大球性貧血出現才發生，因此不能以正常血球排除。';if(/homocysteine/.test(t))return 'B12／葉酸不足通常可能使 homocysteine 升高，而非降低；此指標需結合腎功能及營養狀況解讀。';if(/視覺空間|流暢|language|譫妄/.test(t))return 'B12 缺乏可造成多樣神經精神表現，但不能把單一認知表型說成其特異或最常見表現；應以檢驗及臨床背景判斷。';}
if(/ect|電痙攣/.test(x))return /不到\s*50|低於\s*50|無效|禁忌/.test(t)?'老年憂鬱症的 ECT 療效通常不止題目所稱的低門檻；嚴重、精神病性、拒食或需快速改善時可評估，並管理麻醉與認知風險。':'ECT 可用於嚴重或需快速治療的憂鬱症（例如拒食致身體惡化）；年齡本身不是排除理由，仍須評估個別風險。';
if(/benzodiazepine|苯二氮|鎮靜劑|戒斷/.test(x))return '高齡者對 benzodiazepine 較易有鎮靜、跌倒、譫妄、認知影響及依賴風險；是否使用應看明確適應症、最低劑量、療程及停藥計畫，不能只用「很少使用」概括所有情境。';
if(/feeding tube|餵食管|管灌/.test(x))return '晚期失智患者的管灌不保證預防吸入性肺炎或改善生活品質，且可能帶來管路不適與約束；需以患者價值及照護目標比較舒適餵食等方案。';
if(/運動|physical activity|exercise/.test(x))return '依身體能力調整的運動可支持老年人的功能及健康；衰弱或高齡不是「運動完全無效」的理由，需個別評估安全性與可行性。';
if(/睡眠呼吸|osa|ahi|rbd|cbt-i|睡眠限制|刺激控制/.test(x)){if(/rbd|rem/.test(t))return 'RBD 是 REM 期肌張力抑制消失而出現夢境演出，可能是 α-synuclein 疾病的前驅線索；需先確保睡眠環境安全。';if(/osa|呼吸中止|ahi/.test(t))return 'OSA 由反覆上呼吸道阻塞造成睡眠呼吸事件，應依睡眠檢查與臨床症狀判斷；單靠打鼾不能確診。';return 'CBT-I 的核心包括刺激控制、睡眠限制與認知策略；睡眠衛生可輔助，但單獨通常不是完整的 CBT-I。';}
if(/association|相關性|因果|健保資料庫/.test(x))return '健保資料庫或其他觀察性研究可支持「兩者相關」，但無法單憑相關性證明因果、藥物預防效果或未納入研究的族群風險。';
if(/人格五因素|neuroticism|外向性|開放性|友善性|嚴謹性|conscientiousness/.test(x))return '五因素模型為神經質、外向性、開放性、友善性與嚴謹性；認知障礙症相關人格變化常見神經質／外向性／開放性下降、友善性與嚴謹性下降的方向須依題目所述研究核對，不能把五個向度一律視為上升。';
const claim=s.replace(/\s+/g,' ').trim(),shortClaim=claim.length>190?claim.slice(0,187)+'…':claim;
if(/\d/.test(claim)||/研究|比例|盛行|風險|增加|降低|上升|下降|較高|較低/.test(claim))return `本選項提出的具體主張是：「${shortClaim}」；判定須核對題目指定族群、比較組、方向及研究設計。公告答案只能確認本項是否被列入答案，不能單靠答案推導數值或因果。`;
return `本選項主張：「${shortClaim}」。請依題幹所問的診斷／處置／定義逐點比對；${correct?'它與公告答案所列的正確主張相符。':'它未被公告答案列為正確主張。'}該年度原卷未附本項獨立釋疑時，不應把答案標記誤當成完整的病理或臨床理由。`}
function renderTrends(){currentView='trends';setCrumb('考題分布　/　年度與領域');let counts=STUDY_TOPICS.map(t=>({t,n:countFor(t.id)})).sort((a,b)=>b.n-a.n),max=Math.max(...counts.map(x=>x.n));$('#view').innerHTML=`<div class="hero"><div class="eyebrow">EXAM SIGNALS</div><h2>八年考題，<br>哪些概念最常回來？</h2><p>以下為考題依題幹關鍵詞自動歸入一個主要領域的粗略分布。跨領域題只計入一類，因此適合用來安排複習順序，不代表正式命題配分。</p></div><div class="trend"><section class="trend-card"><h3>主要考點分布（480 題）</h3>${counts.map(x=>`<div class="barrow"><span>${esc(x.t.title)}</span><div class="bar"><i style="width:${Math.max(3,100*x.n/max)}%"></i></div><b>${x.n}</b></div>`).join('')}</section><section class="trend-card"><h3>跨年度反覆出現的答題能力</h3><p>① 由起病速度、波動與日常功能區分譫妄和失智。</p><p>② 對照認知表型辨認AD、DLB、血管性及FTD。</p><p>③ 知道量表、MRI／CT／PET與CSF各自能回答什麼問題。</p><p>④ 高齡用藥同時考慮腎肝功能、抗膽鹼負荷、跌倒與交互作用。</p><p>⑤ 將病人偏好、安全、家屬和照護資源放進倫理及治療決策。</p></section></div><div class="section-head"><div><h2>依年度練習</h2><p>每年度 60 題，保留公告答案</p></div></div><div class="grid">${[107,108,109,110,111,112,113,114].map(y=>`<article class="topic-card" onclick="showView('questions');yearFilter='${y}';renderQuestions()"><div class="num">ARCHIVE</div><h3>${y} 年考題</h3><p>60 題 · 公告答案／釋疑版</p><div class="count">開始練習　→</div></article>`).join('')}</div><div class="notice">領域分布是依關鍵詞自動初分，少數題目可同時屬於數個考試領域。複習請以題幹和官方考點為準。</div>`}
function renderSources(){currentView='sources';setCrumb('資料來源　/　教材、考訊與法規');$('#view').innerHTML=`<section class="hero"><div class="eyebrow">REFERENCES & SCOPE</div><h2>每個結論，<br>回到它的來源</h2><p>主體知識來自課本資料夾三本教材；題目與公告答案來自 107–114 年考古卷。考訊資料用來補充認知領域、疾病比較和文獻導讀。法律與駕駛規範會變動，另附官方查核入口。</p></section><h2 class="section-head">指定教材</h2>${[['The APA Publishing Textbook of Geriatric Psychiatry','../../課本/The APA Publishing Textbook of Geriatric Psychiatry.pdf','APA Publishing, 6th ed. (2023)'],['Seminars in Old Age Psychiatry','../../課本/Seminars in Old Age Psychiatry_2019_Cambridge University Press.pdf','Cambridge University Press, 2nd ed. (2019)'],['GERIATRIC PSYCHIATRY','../../課本/GERIATRIC PSYCHIATRY.pdf','課本資料夾提供之教材 PDF']].map(x=>`<div class="resource"><div><p><b>${esc(x[0])}</b></p><small>${esc(x[2])}</small></div><a href="${x[1]}" target="_blank">開啟教材 PDF ↗</a></div>`).join('')}<h2 class="section-head">考古卷與考訊</h2>${[['107 年甄審筆試考題','107年甄審筆試考題(公告版答案) 更正 (2018-11-21).pdf'],['108 年甄審筆試考題','108年甄審筆試考題(公告版) (2019-11-18).pdf'],['109 年甄審筆試考題','109年甄審筆試考題(公告版) (2020-11-16).pdf'],['110 年甄審筆試考題','110年甄審筆試考題(公告版) (2021-11-22) 釋疑後.pdf'],['111 年甄審筆試考題','111年甄審筆試考題(公告版) 釋疑後 (2022-11-22).pdf'],['112 年甄審筆試考題','112年甄審筆試考題-釋疑後(網站公告版) (2023-11-21).pdf'],['113 年甄審筆試考題','113年甄審筆試考題-釋疑後(網站公告版) (2024-11-18).pdf'],['114 年甄審筆試考題','114年甄審筆試考題(公告版) (2025-11-16).pdf'],['考訊彙整（含文獻導讀題與解析）','考訊彙整.pdf'],['113 年考訊（認知功能、失智比較與題目）','113考訊.docx']].map(x=>`<div class="resource"><div><p><b>${esc(x[0])}</b></p><small>本機資料來源</small></div><a href="../../考古/${encodeURIComponent(x[1]).replace(/%2F/g,'/')}" target="_blank">開啟來源 ↗</a></div>`).join('')}<div class="section-head"><div><h2>現行官方參考</h2><p>法律與行政規則會更新；考題版本與現行實務分開核對。</p></div></div><div class="resource"><div><p><b>精神衛生法</b></p><small>全國法規資料庫</small></div><a href="https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0020030" target="_blank">查看現行法規 ↗</a></div><div class="resource"><div><p><b>病人自主權利法與預立醫療決定</b></p><small>衛生福利部</small></div><a href="https://www.mohw.gov.tw/dl-78263-f1454e84-65f1-4b7b-933c-b29647baf207.html" target="_blank">查看衛福部資料 ↗</a></div><div class="resource"><div><p><b>高齡駕駛人駕照管理制度</b></p><small>交通部公路局</small></div><a href="https://www.thb.gov.tw/cp.aspx?n=169" target="_blank">查看制度說明 ↗</a></div><div class="notice"><b>解析界線：</b>題目中的正確答案依原考卷公布。題庫沒有附詳解的題目，網站的「詳解」是依教材歸納的學習推理，不是官方逐選項解答；考訊 PDF 內已有原始詳解時，應以該份文獻／課程解析為準。題庫自動分類只標主要領域，跨域考題可能出現在相鄰主題。</div>`}
function reviewReasonMap(q){const map={};if(!q.explanation)return map;for(const m of q.explanation.matchAll(/(?:^|\n)\s*([A-F]|[1-5])\.\s*([\s\S]*?)(?=\n\s*(?:[A-F]|[1-5])\.\s*|$)/g))map[m[1]]=m[2].trim();return map}
function optionKnowledge(q,s,isTrue){const x=(s+' '+q.text).toLowerCase();
if(/cbt|認知行為治療/.test(x)&&/憂鬱|depress/.test(x)){if(/75|frail|衰弱/.test(s))return '研究支持CBT可治療老年憂鬱，但「大於75歲或衰弱者已有足夠證據」說得過滿；高齡、衰弱族群研究較少，需把證據強度與可行性分開。';return 'CBT是老年憂鬱有實證支持的心理治療之一；需依認知、聽視力、功能與患者偏好調整介入方式。'}
if(/ect|電痙攣/.test(x))return /不到\s*50|低於\s*50|無效|禁忌/.test(s)?'老年憂鬱的ECT緩解率通常不止此低門檻；在嚴重、精神病性、拒食或需快速反應情況可評估使用，並衡量麻醉與認知風險。':'ECT可用於嚴重或需快速治療的憂鬱症（如拒食致身體惡化）；並非只因年齡而排除，需衡量麻醉及認知風險。';
if(/運動|physical activity|exercise/.test(x))return /沒有助益|無效|不會改善|不能改善/.test(s)?'運動並非「沒有助益」；依能力設計的身體活動可支持情緒、功能與健康，需個別調整強度及安全。':'身體活動可作為情緒與功能照護的一部分，不能把觀察相關性直接等同為單一治療因果。';
if(/cam|confusion assessment|譫妄|瞻妄|delirium/.test(x))return /定向|disorientation/.test(s)?'CAM四特徵是急性／波動、注意力不集中、思考混亂、意識程度改變；定向障礙雖常見，並非CAM必要項。':'CAM須同時有急性／波動及注意力不集中，再加思考混亂或意識改變；定向感不是必要條件。';
if(/app?elbaum|決策能力|understanding|appreciation|reasoning|expressing a choice/.test(x))return 'Appelbaum能力評估看理解、體認（將資訊連結自身）、推理及表達選擇四項；它是特定決定、特定時間的臨床評估，不等同法律行為能力。';
if(/dlb|路易氏體|lewy|mibg|視幻覺|rem sleep behavio/.test(x))return /mibg/.test(x)?'DLB/PDD的心肌I-123 MIBG攝取通常降低，反映心臟交感神經去支配；不能寫成攝取增加。':'DLB核心特徵為認知波動、反覆視幻覺、REM睡眠行為障礙及自發性巴金森徵象；跌倒、便祕、姿勢性低血壓等屬支持線索。';
if(/ftd|額顳|frontotemporal|bvftd|過度口慾|hyperorality/.test(x))return /過度口慾|hyperorality/.test(s)?'過度口慾可表現為飲食增加、偏好改變或攝取非食物物質；與FTLD相關但不是FTD專屬或單獨確診特徵。':'bvFTD需見漸進的行為／社會認知改變；家屬病史、社會認知測驗與結構／功能影像共同協助和精神疾患鑑別。';
if(/mci|輕度認知/.test(x))return /日常|功能|獨立/.test(s)?'MCI可有客觀認知下降，但日常獨立功能大致保留；已明顯影響獨立生活時需考慮失智症。':'MCI常見認知下降，但不同認知領域受影響程度不一；不能假設每個領域都與正常老人完全相同或已達失智程度。';
if(/amyloid|類澱粉|aβ|tau|t-tau|p-tau/.test(x))return /p-tau|磷酸化tau/.test(s)?'CSF p-tau在AD常升高，特異性相對較佳；仍須依檢驗方法、臨床表型與其他標記合併判讀。':/aβ|amyloid|類澱粉/.test(s)?'AD的CSF Aβ42通常降低；PET陽性或單一標記不能單獨證明症狀必由AD造成。':'Tau亦可在其他神經疾病改變，不是AD專屬標記。';
if(/dwi|diffusion|新.*中風|舊.*中風|acute infarct|梗塞/.test(x))return 'MRI擴散加權影像對急性缺血性病灶敏感，適合協助區分新發梗塞與陳舊腔隙；影像要結合起病時間及神經學表現。';
if(/normal aging|正常老化|提取|retrieval|consolidation|固化/.test(x))return '正常老化常見處理速度及自由提取效率下降，提示後可能改善；AD較常見新資訊學習／儲存障礙。不能把兩種記憶錯誤方向顛倒。';
if(/osa|睡眠呼吸中止|ahi|rbd|cbt-i|睡眠限制|刺激控制|REM/.test(x))return '老年睡眠需區分正常睡眠架構變化、失眠、OSA與RBD。OSA依AHI及症狀診斷；CBT-I的刺激控制、睡眠限制和認知重建是核心，睡眠衛生主要為輔助。';
if(/naltrexone|acamprosate|disulfiram|酒精|飲酒|aud/.test(x))return 'Naltrexone主要減少酒精獎賞／大量飲酒；acamprosate較常用於維持戒酒；disulfiram需監督且高齡副作用限制較多。選藥要看肝腎功能、opioid及戒斷風險。';
if(/benzodiazepine|苯二氮|鎮靜|跌倒/.test(x))return '高齡者使用benzodiazepine需注意鎮靜、跌倒、譫妄、認知影響與依賴；若使用應有明確適應症、短期目標與停藥計畫。';
if(/hoard|儲物|囤積/.test(x))return '儲物症常為慢性且可能逐步加重，並非通常隨年齡自然緩解；居家安全、病識感及實際丟棄／分類訓練是老年照護重點。';
if(/feeding tube|餵食管|管灌/.test(x))return '晚期失智症人工管灌不保證預防吸入性肺炎或提升生活品質，可能增加不適與約束；要依患者價值討論舒適餵食與照護目標。';
if(/association|相關性|因果|健保資料庫|研究顯示/.test(x))return '觀察性資料顯示相關不等於因果；不能僅由關聯推論疾病成因、藥物預防效果或未測量族群的風險。';
if(/正常|老人|老化|衰弱|器官|生理/.test(x))return '老化通常降低器官儲備、增加多病因共同作用的可能；方向與幅度要看具體器官與題目條件，不能把老化等同疾病。';
return `本選項的判定為「${isTrue?'正確敘述':'不正確敘述'}」。請把這句拆成定義、族群、病程／方向及因果四個主張逐一核對；題目來源未附獨立逐項解析時，這份整理不會杜撰額外數據。`}
function questionCard(q){const topic=labelFor(q.tag),isReview=q.year==='考訊',yearLabel=isReview?'考訊整理題':`${q.year} 年`,opts=q.statements||[],answerChoice=(q.options||[]).find(o=>o.n===Number(q.answer)),combo=!!(answerChoice&&/^[A-F](?:\s*[+＋,、]\s*[A-F])+$/.test(answerChoice.text.trim())),chosen=combo?new Set(answerChoice.text.match(/[A-F]/g)):null;let allText=q.text;allText=allText.replace(new RegExp('^\\s*'+q.number+'[.．、]\\s*'),'');;const firstAlpha=allText.search(/(?:^|\n)\s*A[.．、）)]\s*/),firstNum=allText.search(/(?:^|\n)\s*1[.．、）)]\s*/),stem=(firstAlpha>=0?allText.slice(0,firstAlpha):firstNum>=0?allText.slice(0,firstNum):allText.split(/\n\s*選項/)[0]).replace(/\n\s*選項\s*[:：]?\s*/g,' '),asksFalse=/錯誤|錯的|為非|不正確|最不|不包含|不是|何者非|並非|有誤|不適合|不適當|不適切|不妥當/.test(stem),exact=reviewReasonMap(q);const breakdown=opts.map(o=>{const isCombo=!!chosen,selected=isCombo?chosen.has(o.letter):Number(o.letter)===Number(q.answer),isTrue=isCombo?(window.DETAILED_OPTION_TRUTH?.[`${q.year}-${q.number}`]?.[o.letter]??(asksFalse?!selected:selected)):null;let verdict;if(isCombo)verdict=isTrue?'正確敘述':'錯誤敘述';else if(selected)verdict=asksFalse?'錯誤敘述':'正確敘述';else verdict=asksFalse?'正確敘述':'錯誤敘述';let sourceExplanation=exact[o.letter];let why=sourceExplanation&&sourceExplanation.length>18?`考訊原文依據：${sourceExplanation}`:optionKnowledge(q,o.text,isCombo?isTrue:selected,asksFalse);return `<div class="option-analysis ${(isCombo?isTrue:selected)?'is-right':'is-wrong'}"><div class="option-top"><b>${esc(o.letter)}.</b><span>${esc(verdict)}</span></div><p class="option-statement">${esc(o.text)}</p><p class="option-why"><b>判斷理由：</b>${esc(why)}</p></div>`}).join('');return `<article class="qcard"><div class="qhead"><strong>${yearLabel}　第 ${q.number} 題</strong><span class="tag">${esc(topic)}${isReview?' · '+esc(q.code||'文獻導讀'):''}</span></div><div class="qbody"><div class="qtext full-question">${esc(q.text)}</div><div class="answer-line"><span class="official">${isReview?'考訊答案':'公告答案'}：選項 ${esc(q.answer)}${answerChoice?'（'+esc(answerChoice.text)+'）':''}${window.DETAILED_OPTION_TRUTH?.[`${q.year}-${q.number}`]?'　⚠ 逐項文獻核對與公告答案組合不一致，請看各項說明。':''}</span></div><h4 class="option-heading">每個選項的判定與理由</h4><div class="option-list">${breakdown||'此題未能拆出選項，請核對原卷。'}</div>${isReview&&q.explanation?`<details class="source-exp"><summary>查看考訊原始詳解</summary><pre>${esc(q.explanation)}</pre></details>`:''}<p class="source-line">來源：${isReview?'考訊彙整 PDF，領域 '+esc(q.code||'文獻導讀'):`${q.year} 年公告版／釋疑版考題`}。法律與臨床指引按考題年份作答；實務請核對現行來源。</p></div></article>`}
function optionKnowledge(q,s,correct,asksFalse){const t=s.replace(/\s+/g,' ').toLowerCase();let head=q.text||'';head=head.replace(new RegExp('^\\s*'+q.number+'[.．、]\\s*'),'');const cut=head.search(/\n\s*(?:[A-F][.．、）)]|1[.．、）)]|選項\s*[:：]?)/);if(cut>=0)head=head.slice(0,cut);const x=t+' '+head.toLowerCase();
const examKey=String(q.year)+'-'+String(q.number);const optionKey=q.options?.find(o=>o.text===s)?.n??q.statements?.find(o=>o.text===s)?.letter??String(s).match(/^[A-F1-5]/)?.[0];const detailed=window.DETAILED_OPTION_NOTES?.[examKey]?.[optionKey];if(detailed)return detailed;
if(examKey==='107-7'){
if(/視覺記憶|visual memory/.test(t))return '此題引用的神經心理研究並未支持 MCI 與中度 AD 的視覺記憶「大致相同」；兩組皆可能受損，但程度／測驗表現不能因此視為相等。';
if(/學習能力|learning/.test(t))return 'MCI 的命名可相對保留，但新資訊學習通常已下降；此選項把命名相對正常錯誤延伸到學習能力。';
if(/命名|praxis|應用功能/.test(t))return '題目所引研究中，MCI 樣本的命名與動作運用表現接近正常組；這是特定樣本的結果，不能推成所有 MCI 個案各認知域都正常。';
if(/流暢|fluency/.test(t))return '語言流暢度牽涉詞彙提取與執行功能，MCI 和中度 AD 的表現不能概括為差異不大；中度 AD 通常已有較廣泛缺損。';
if(/記憶力|記憶/.test(t))return 'MCI 與中度 AD 都可能比正常老年人有較差的記憶表現；AD 常見新學習和延遲回憶的儲存受損，提示後改善有限。';}
if(examKey==='107-8'){
if(/突然失去意識/.test(t))return '突發意識改變先以無顯影頭部 CT 快速排除顱內出血；是否使用顯影劑須依疑似病因，不是一般初步首選。';
if(/新的中風|新.*中風|舊.*中風/.test(t))return '區分急性與陳舊梗塞時，MRI DWI/ADC 對急性缺血最有幫助；顯影 CT 不是判斷梗塞新舊的標準首選。';
if(/腦下垂體|pituitary/.test(t))return '疑似腦下垂體腫瘤以專用 MRI（常需顯影）較能評估微小軟組織病灶；無顯影 CT 不足以作為最佳確診檢查。';
if(/海馬|hippocamp/.test(t))return 'MRI 可評估海馬／內側顳葉體積，協助辨認典型 AD 萎縮型態；仍須和認知病程及功能變化合併判讀。';
if(/中腦出血|韋尼克|wernicke/.test(t))return 'MRI 對中腦出血與韋尼克腦病的軟組織及典型病灶分布較有鑑別力；疑似硫胺素缺乏時不應等影像才治療。';}
if(examKey==='107-11'){
if(/風險因\s*子|危險因\s*子/.test(t))return '血管性失智照護首重預防再發中風及控制高血壓、糖尿病、血脂與心血管風險；這是核心策略。';
if(/建議.*給予|應給予/.test(t))return '純血管性失智不宜一概「建議」所有患者使用膽鹼酯酶抑制劑或 memantine；藥物通常需依合併 AD／DLB 或個別症狀評估，故此項說得過於普遍。';
if(/small cognitive|改善一些|認知功能/.test(t))return '試驗顯示部分膽鹼酯酶抑制劑或 memantine 對血管性失智可能有小幅認知分數改善，但臨床功能效益有限，不能等同疾病逆轉。';
if(/副作用|安慰劑/.test(t))return '血管性失智使用膽鹼酯酶抑制劑時，研究中不良事件可能較安慰劑多；需權衡有限認知效益與噁心、心搏過慢等風險。';
if(/混合型|mixed vascular/.test(t))return '混合 AD／血管性病理患者可能因 AD 成分而受益於膽鹼酯酶抑制劑；這不同於把藥物常規套用到純血管性失智。';}
if(examKey==='109-12'){
if(/thyroid-stimulating\s+ hormone|thyroid-stimulating\s+hormone|tsh/.test(t))return '原發性甲狀腺功能低下時，甲狀腺素不足解除對腦下垂體的負回饋，TSH 通常升高；亞臨床型也定義為 TSH 高而 FT4 正常。';
if(/free thyroxine/.test(t))return /原發性/.test(t)?'原發性甲狀腺功能低下時 FT4 下降；亞臨床型則 FT4 維持正常，因此要分清兩個選項所指型態。':'亞臨床甲低的 FT4 應在正常範圍；若已下降即較符合顯性甲低。';
if(/triiodothyronine|t3/.test(t))return '原發性甲低時 T3 不會上升；典型檢驗是 TSH 升高、FT4 降低，T3 可能較晚才下降，但不應判為增加。';}
if(examKey==='109-18'){
if(/認知功能起伏|fluctuating/.test(t))return '注意力與警覺度明顯波動是 DLB 核心臨床特徵；常呈清醒程度或認知表現日內／日間起伏。';
if(/視幻覺|visual hallucination/.test(t))return 'DLB 的典型視幻覺通常反覆、具體且成形（如人物或動物）；把內容描述成多為短暫模糊影像不符合典型特徵。';
if(/REM|快速動眼/.test(t))return 'RBD 可在認知症狀前多年出現，是 α-synuclein 病理的重要前驅線索；須詢問夢境演出並注意睡眠受傷風險。';
if(/巴金森症狀|parkinsonism/.test(t))return 'DLB 巴金森徵象以動作遲緩及僵硬常見；顫抖可有可無，並非每位患者都須同時具備三項。';
if(/probable|indicative biomarkers|兩項/.test(t))return '依 DLB 診斷標準，兩項以上核心特徵可支持 probable DLB；一項核心特徵加一項 indicative biomarker 也可，故不能把生物標記寫成無關緊要。';}
if(examKey==='110-47'){
if(/右半球|aphasia|失語/.test(t))return '失語、失讀與失寫多與優勢半球（通常左半球）病灶相關；把它們歸為右半球典型表現是此敘述的錯誤處。';
if(/patchy deficit/.test(t))return '多發性梗塞造成病灶散在、位置不一，臨床可呈不均勻的 patchy deficits；這是多發梗塞型血管性失智的描述。';
if(/心理運動速度|注意力/.test(t)&&!/執行功能/.test(t))return '皮質下小血管病常傷及額葉—皮質下白質迴路，造成注意力、處理速度及心理運動速度下降。';
if(/執行功能/.test(t))return '皮質下血管性病變常比典型 AD 更突出執行功能與處理速度障礙，反映額葉—皮質下網絡受損。';
if(/賓氏|binswanger|小便失禁/.test(t))return 'Binswanger 病可見步態障礙、尿失禁與假性延髓徵象，常伴廣泛白質病變；臨床須結合影像與血管風險。';}
if(examKey==='111-5'){
if(/老年期強迫症/.test(t))return '強迫症多在較早年齡起病並延續至晚年，老年期新發較少；不能說老年期比成年期更常見。';
if(/basal ganglion|基底核/.test(t))return '基底核—額葉迴路可能參與部分晚發強迫症，病灶或神經退化是晚年新發症狀的重要鑑別方向。';
if(/儲物症.*常見|老年期儲物症/.test(t))return '儲物障礙常呈慢性累積，年齡增加可使居住空間更受影響，但不能據此說診斷盛行率必然高於成年期。';
if(/否認|urge|衝動/.test(t))return '儲物障礙患者常認為物品有用或難以丟棄，對囤積問題的病識感可低；但「常否認收藏衝動」不是其典型診斷描述。';
if(/dsm-5|強迫症及相關/.test(t))return 'DSM-5 將 hoarding disorder 列在強迫症及相關障礙症章節；它是獨立診斷，不等於 OCD 的一種亞型。';}
if(examKey==='111-42'){
if(/choroidal fissure|脈絡膜裂/.test(t))return '海馬及內側顳葉萎縮會使脈絡膜裂間隙變寬，屬常用的內側顳葉萎縮影像線索。';
if(/一般從|接著|entorhinal|杏仁核|海馬旁迴/.test(t))return 'AD 病理常先累及內嗅皮質及內側顳葉記憶網絡；海馬萎縮也很早可見，但不能把病理擴展順序簡化成固定的海馬優先序。';if(/hippocampus|海馬迴/.test(t))return '海馬萎縮會使其高度／體積下降；MRI 可量化，但需考慮年齡與整體腦萎縮。';
if(/temporal horn|顳角/.test(t))return '顳葉萎縮會使側腦室顳角擴大而非變窄；這是腦組織流失後的代償性腦室擴張。';
if(/medial temporal|內側顳葉/.test(t))return '典型 AD 早期即常累及內側顳葉記憶網絡（內嗅皮質、海馬旁區與海馬），因此此處萎縮是早期影像變化。';
if(/entorhinal|杏仁核|海馬旁迴/.test(t))return 'AD 病理常先累及內嗅皮質與內側顳葉網絡；此選項列出結構順序，應避免把海馬視為必然唯一最先受損部位。';}
if(examKey==='112-60'){
if(/essential tremor|原發性震顫/.test(t))return '原發性震顫通常保留紋狀體 DAT 攝取，DLB 常降低，因此 DAT 可協助區分這兩者。';
if(/額顳葉|ftd/.test(t))return 'FTD 通常不造成黑質紋狀體 DAT 攝取下降；DAT 可協助和 DLB 區分，但結果仍須結合臨床。';
if(/vascular parkinsonism|血管性巴金森/.test(t))return '血管性巴金森症的 DAT 表現取決於梗塞位置，可呈局部或不對稱改變；影像須與病灶位置對照。';
if(/atypical|非典型/.test(t))return 'DAT 可顯示突觸前多巴胺缺損，但通常不能可靠區分 DLB、巴金森病與多種非典型巴金森症候群。';
if(/antipsychotic|抗精神病藥物/.test(t))return '抗精神病藥引起的巴金森症通常是突觸後 D2 阻斷，DAT 攝取多保留；可協助和 DLB 的突觸前退化區分。';}
if(examKey==='113-29'){
if(/central sleep apnea|中樞型/.test(t))return '老年人最常見的睡眠呼吸障礙仍是阻塞型睡眠呼吸中止症；中樞型較常見於特定心臟、神經疾病或鴉片類用藥情境。';
if(/女性|female/.test(t))return 'OSA 的典型風險包括男性、高齡、肥胖及上呼吸道解剖因素；把女性列為三大典型風險因素方向不當。';
if(/隨著年齡|增長而升高/.test(t))return 'BMI 與 OSA 的關聯在高齡未必隨年齡更強；老年人的解剖、肌張力與共病也影響風險，不能簡化成線性增強。';
if(/49%|6-17|盛行率/.test(t))return '題目引用的研究報告老年族群 OSA 可高達約49%，高於一般成年人的估計；這是特定研究、診斷門檻及樣本的盛行率，不宜當成每個族群的固定值。';
if(/5 至15|5-15|輕度/.test(t))return '依 AHI，輕度 OSA 為每小時 5 至未滿 15 次，中度 15 至未滿 30，重度至少 30；此分類描述正確。';}
if(examKey==='114-25'){
if(/acamprosate/.test(t)&&/gaba|機轉/.test(t))return 'Acamprosate 主要被認為調節谷胺酸／GABA 神經傳導平衡；把它說成單純改變 GABA 傳導過於簡化。';
if(/naltrexone/.test(t))return 'Naltrexone 阻斷 opioid receptor，可降低重度飲酒／臨床顯著飲酒風險；中老年研究亦支持降低渴求，但須評估肝功能與止痛藥需求。';
if(/disulfiram/.test(t))return 'Disulfiram 透過抑制 aldehyde dehydrogenase 引發飲酒後不適；高齡共病、心血管風險與認知問題使其較少使用。';
if(/一般族群|戒酒效果/.test(t))return 'Acamprosate 可協助維持戒酒，主要適用於已停止飲酒者；腎功能不全須減量或避免。';
if(/老年族群|老年.*有效性/.test(t))return 'Acamprosate 在一般成人有證據，但高齡專屬有效性資料有限；不能把一般族群試驗直接說成老年族群已證實。';}
if(examKey==='114-55'){
if(/feeding tube|餵食管/.test(t)&&/不建議|仍不建議/.test(t))return '晚期失智的常規永久餵食管未證明能改善重要臨床結局；可採個別化手餵／舒適餵食並處理可逆吞嚥問題。';
if(/吸入性肺炎/.test(t))return '管灌不能消除胃食道逆流或口咽分泌物吸入，故不能保證預防吸入性肺炎；也可能帶來管路併發症。';
if(/體重|生活品質/.test(t))return '管灌未證實能可靠改善晚期失智的生活品質或長期營養結果；需和舒適餵食、患者價值及照顧目標比較。';
if(/約束|不適/.test(t))return '患者可能拉扯管路，照護中有時導致身體或藥物約束；這會增加不適與活動限制，需將風險納入共同決策。';}

if(examKey==='107-10'){
if(/MMSE/.test(t))return '研究中身體活動和 MMSE 分數呈正相關，表示活動量與認知表現一起變動；觀察相關不等於運動必然造成分數上升。';
if(/腦容積/.test(t))return '身體活動與腦容積的正向關聯可反映健康、血管風險及選擇偏差等因素，不能單由相關研究證明運動直接增加腦體積。';
if(/中強度|高強度/.test(t))return '此敘述把認知與憂鬱的運動強度門檻分開陳述；應依題目引用的統合分析比較強度，而不是推成只有高強度才可能改善情緒。';
if(/心理治療|抗憂鬱劑/.test(t))return '運動對憂鬱症狀有支持證據，但和心理治療或抗憂鬱藥的相對效益會因研究族群、運動處方及比較方法而異，不能視為可互換治療。';}
if(examKey==='107-21'||examKey==='109-59'){
if(/治療反應/.test(t))return '焦慮性憂鬱常伴較高症狀負荷與較差治療反應；須把共病狀態和單純憂鬱症區分。';
if(/生活品質/.test(t))return '憂鬱與焦慮都會降低生活品質，影響大小會隨量表、症狀嚴重度及樣本而變；不能一概說憂鬱影響遠大於焦慮。';
if(/自殺意念/.test(t))return '憂鬱合併焦慮與較高自殺意念風險有關；仍要直接評估個人意念、計畫、意圖與保護因子，不能只用群體關聯替代評估。';
if(/長期|導致焦慮|導致憂鬱/.test(t))return '「憂鬱導致焦慮」和「焦慮導致憂鬱」涉及時間順序與病程，觀察性追蹤不能簡化為單一固定方向；須看題目引用研究。';
if(/記憶力退化/.test(t))return '焦慮合併憂鬱可能與後續認知／記憶變化相關，但這不等於已證明焦慮直接造成神經退化；應控制年齡、藥物及基線認知等因素。';}
if(examKey==='107-28'){
if(/free recall|自由回憶/.test(t))return '憂鬱常使注意力與自發提取／自由回憶下降；辨認線索提供後表現相對保留，故此組合可與 AD 的儲存缺損區分。';
if(/辨認記憶.*受損/.test(t))return '憂鬱相關記憶困難常較像提取效率下降，辨認線索下可相對改善；把辨認記憶也說成必然受損不符合題目所引比較。';
if(/acquisition|獲取/.test(t))return 'AD 常見新資訊獲取／學習受損，延遲回憶低；這是海馬記憶網絡受損的典型表現。';
if(/preserved|保存/.test(t))return 'AD 的記憶保存／延遲保留也會受損，不能說保存能力比獲取能力好；此點和憂鬱較偏提取困難不同。';
if(/努力/.test(t))return '不能把 AD 測驗低分直接歸因於患者不努力；須考量記憶儲存病理、測驗效度及臨床功能，避免污名化。';}
if(examKey==='107-50'){
if(/10-15%/.test(t))return 'FTLD 與運動神經元疾病可共病，約一成上下的病例可能合併；比例會受病型與研究族群影響。';
if(/語言亞型/.test(t))return 'FTLD-運動神經元病最典型關聯是行為變異型 FTD，而非概括說語言亞型最常合併；語言亞型也需再分 PPA 類型。';
if(/之後/.test(t)&&/運動神經元病/.test(t))return 'FTD 與運動神經元病的症狀先後並不固定；運動神經元症狀可先、同時或後於認知／行為表現。';
if(/ALS.*不會|不會有合併 FTLD/.test(t))return 'FTLD 與 ALS 存在雙向臨床重疊；ALS 患者也可能出現執行、語言或行為改變，不是只有 FTLD 後來出現 ALS。';
if(/致病基因|完全不同/.test(t))return 'FTLD-ALS、PSP 與 corticobasal syndrome 的臨床表現可重疊；病理及致病基因並非一概完全不同，部分 tau／MAPT 關聯可跨表型。';}
if(examKey==='107-55'){
if(/cholinesterase inhibitor/.test(t))return 'FTD 通常不建議常規使用膽鹼酯酶抑制劑，且部分患者可能出現行為惡化；需避免把 AD 的標準治療直接外推。';
if(/memantine/.test(t))return 'Memantine 對 FTD 的效益未獲充分支持，試驗未顯示可作常規認知治療；照護以症狀管理及非藥物策略為主。';
if(/agitation/.test(t))return '膽鹼酯酶抑制劑在部分 FTD 患者可能加劇激躁或脫抑制，因此要辨認此類藥物的病型差異與行為副作用。';
if(/血清素再回收|ssri/.test(t)&&/行為/.test(t))return 'SSRI 對 FTD 的部分行為症狀（如強迫、飲食或脫抑制）有臨床／研究支持，但證據等級和適應症須依題目引用共識判讀。';
if(/認知功能缺損/.test(t))return 'SSRI 可能改善某些行為症狀，並不代表能逆轉 FTLD 神經退化或恢復核心認知功能；要區分行為治療效果與認知病程。';}
if(examKey==='109-33'){
if(/不要突然停藥|逐漸減量/.test(t)&&!/venlafaxine/.test(t))return '抗憂鬱劑停藥應和醫師討論逐步減量；突然停藥可能造成頭暈、感冒樣症狀、噁心、失眠或情緒改變。';
if(/立刻回診/.test(t))return '出現明顯停藥症狀應聯絡醫療團隊評估；需區分停藥症候群、憂鬱復發及其他病因，依嚴重度決定處置。';
if(/一週內自行消失/.test(t))return '停藥症狀嚴重度與持續時間不一，可能超過一週或影響功能；不能保證大多數個案都輕微且自行消失。';
if(/4 週|四週/.test(t))return 'Venlafaxine 半衰期短、停藥症狀風險較高；減量速度應按療程、劑量、既往反應個別化，固定四週並非人人適用的規則。';
if(/不用再回門診/.test(t))return '停藥後仍需安排追蹤復發、戒斷症狀與自殺風險；緩解一年不代表不再需要回診。';}
if(examKey==='109-39'){
if(/意思表示無效/.test(t))return '受監護宣告者為無行為能力人，其法律行為原則上無效；判斷須依民法身分宣告，不以當下臨床狀態替代。';
if(/無意識或精神錯亂/.test(t))return '民法第75條規定，非無行為能力人若在無意識或精神錯亂中作意思表示，該表示仍無效。';
if(/無識別|判斷/.test(t))return '「無意識」著重欠缺意識／識別能力，需就表示當時判斷；不能把一般認知障礙診斷直接等同無意識。';
if(/自由決定/.test(t))return '精神錯亂須達精神作用障礙而喪失自由決定意思的程度；單有精神疾病診斷不足以使所有法律行為無效。';
if(/睡夢|泥醉|昏沈/.test(t))return '睡夢、嚴重醉酒或疾病昏沉可能使當時意思表示欠缺有效意識，但須依具體程度及證據判定，不能只憑情境名稱自動推定。';}
if(examKey==='109-48'||examKey==='110-25'){
if(/視幻覺/.test(t))return '巴金森病精神病常見視幻覺，比例依病程、藥物及研究定義而異；數字須對照原研究族群。';
if(/minor phenomena/.test(t))return 'Minor hallucinations（如 passage、presence、錯覺）可早期出現，並不等同完整、成形的視幻覺；研究估計會隨定義不同。';
if(/聽幻覺/.test(t))return '巴金森病精神病中視幻覺比聽幻覺常見；聽幻覺可能合併出現但通常不是盛行率較高的型態。';
if(/病程愈久/.test(t))return '病程與多巴胺藥物暴露增加，精神病症狀風險通常上升；仍須排除譫妄、視力缺損及其他藥物。';
if(/80%|36 個月|3 年以上/.test(t))return '長期追蹤可發現相當比例患者出現至少一種 psychosis-spectrum symptom；百分比依追蹤長度和症狀定義而變，不能當成每人必然發生。';}
if(examKey==='111-26'){
if(/idiopathic|RBD/.test(t))return '孤立性 RBD 是突觸核蛋白病的重要前驅狀態，日後轉化為 PD、DLB 或多系統萎縮的風險明顯高於一般人。';
if(/20%-40%|5 年/.test(t))return '轉化風險會隨追蹤年限累積；五年 20–40% 是研究估計，不表示每位患者都會在五年內轉化。';
if(/zolpidem|dyskinesia/.test(t))return 'Zolpidem 可能在特定研究中短暫改善部分 PD 症狀，但不是一般 dyskinesia 的標準治療；須留意高齡者跌倒、混亂與依賴。';
if(/dopaminergic|早醒|後半段/.test(t))return '多巴胺治療可能造成夢境、嗜睡或睡眠片段化；PD 本身、夜間運動症狀及其他藥物也會造成早醒，不能單一歸因。';}
if(examKey==='111-43'){
if(/背側前額葉|枕葉膽鹼/.test(t))return 'PD 視幻覺與視覺皮質處理、膽鹼功能及額葉—視覺網絡有關；此選項提出的具體腦區與膽鹼機轉須依原研究核對，不能只用「Lewy bodies」概括。';
if(/unimodal|無聲/.test(t))return '早期 PD 視幻覺可先以單一感官、常為視覺影像出現，之後可能變得更具體或複雜。';
if(/兒童或動物|fear-provoking/.test(t))return '人物、兒童或動物是常見成形視幻覺內容；情緒反應可中性、愉悅或恐懼，不是每位患者都會害怕。';
if(/multimodal|多模式/.test(t))return '幻覺可跨視覺、聽覺或其他感官形成多模式經驗；需和譫妄、視聽感官缺損及藥物效應鑑別。';
if(/visuospatial|視覺空間/.test(t))return 'PD 合併視幻覺者常有較明顯視覺空間與視覺處理缺損；可評估視覺認知、光線和視力等可介入因素。';}
if(examKey==='112-9'){
if(/近半數|遺傳相關/.test(t))return '家族性／遺傳性 FTD 佔比取決於是否計入家族史或已知致病變異；近半數可有家族史，明確致病突變比例較低，兩概念不能混同。';
if(/MAPT|GRN|C9orf72/.test(t))return 'MAPT、GRN 與 C9orf72 是家族性 FTD 最重要的致病基因之一；它們分別關聯 tau、TDP-43 等不同病理。';
if(/不對稱|fronto-temporo-parietal/.test(t))return 'MAPT 變異常見對稱或偏前顳葉萎縮型態；高度不對稱額顳頂萎縮不是 MAPT 的典型專屬影像。';
if(/progranulin|眶額葉/.test(t))return 'GRN 變異常呈不對稱額葉、顳葉及頂葉萎縮；分布可變，不能固定描述為相對對稱的前內側顳葉／眶額葉。';
if(/C9orf72|丘腦/.test(t))return 'C9orf72 擴展可有較對稱、廣泛額顳葉萎縮，並可累及丘腦及其他皮質下結構；影像表型具有變異。';}
if(examKey==='112-17'){
if(/四分之一|白質/.test(t))return '小血管病常是血管性認知障礙的重要病因，但診斷不以白質病灶超過固定四分之一為必要門檻；須看病灶位置、負荷與臨床關聯。';
if(/弱相關/.test(t))return '白質高訊號也常見於認知正常的高齡者，但負荷增加與血管風險、處理速度及認知下降有關；「僅弱相關」過度淡化臨床關聯。';
if(/時序性|臨床上/.test(t))return '血管性失智診斷要求認知下降與腦血管病灶在時間及臨床上合理連結；單有影像血管變化不足以診斷。';
if(/丘腦|穹窿|記憶/.test(t))return '雙側丘腦或穹窿等策略性梗塞可破壞記憶迴路，即使病灶不大也可能造成顯著記憶缺損。';
if(/多發性梗塞/.test(t))return '多發性皮質梗塞若涉及重要認知網絡，與認知障礙的臨床關聯較強；需按病灶位置與病程判讀。';}
if(examKey==='113-8'||examKey==='114-13'){
if(/五因素模型|五大特質/.test(t))return '五因素模型包含神經質、外向性、開放性、友善性與嚴謹性；只要名稱與範疇配對正確，此項是在考模型內容。';
if(/神經質/.test(t)&&/負面情緒/.test(t))return '神經質較高與較常、較強烈的負面情緒反應相關，包括憂鬱、焦慮與易怒。';
if(/認知障礙|前驅/.test(t))return '人格特質變化可能早於失智確診並提示需評估認知，但不是診斷生物標記；需確認相較病前人格的持續改變。';
if(/嚴謹性|衝動控制/.test(t))return '嚴謹性低通常與自我控制、計畫及持續性較弱相關；若題目說兩者正相關，需注意描述方向。';
if(/阿茲海默|神經質下降|外向性上升/.test(t))return 'AD 的人格變化常見神經質上升、外向性與開放性下降、友善性與嚴謹性下降；本題所列方向若顛倒即不成立。';}
if(examKey==='113-32'){
if(/DAT scan/.test(t))return 'FTD 的影像診斷看額顳葉結構萎縮／代謝或灌流模式；DAT scan 評估突觸前多巴胺系統，並非 FTD 的標準診斷準則。';
if(/右側|不對稱/.test(t))return 'PPA 常呈左側語言優勢網絡較明顯的不對稱萎縮；右側較嚴重不是典型概括。';
if(/non-fluent|島葉|perisylvian/.test(t))return '非流暢型 PPA 常累及左下額回、島葉及周裂區，符合語音產出／語法障礙的網絡定位。';
if(/semantic|posterior temporal/.test(t))return '語意型 PPA 典型為前顳葉，常左側較重；只說後顳葉萎縮可能把語意型與其他 PPA 病型定位混淆。';
if(/logopaenic|AD pathology/.test(t))return 'logopenic PPA 常與 AD 病理相關，影像多見左側顳頂交界網絡；仍需生物標記／病理確認。';}
if(examKey==='113-55'){
if(/阿茲海默|不受影響/.test(t))return 'AD 的周邊交感神經通常較少呈現 DLB 那樣的心臟去神經支配；因此 MIBG 可作為 DLB 的支持性生物標記。';
if(/主要是使用|noradrenaline/.test(t))return '心肌 I-123 MIBG 評估心臟交感神經末梢攝取；它是核醫心肌交感顯像，非用腦灌流 SPECT 來替代。';
if(/特徵性的增加/.test(t))return 'DLB／PDD 的心肌 MIBG 攝取通常降低，因節後交感神經去支配；說成增加是方向顛倒。';
if(/節後交感|結合/.test(t))return 'MIBG 是去甲腎上腺素類似物，進入並儲存在心臟交感神經末梢，反映其完整性與攝取功能。';
if(/α-synuclein|去神經支配/.test(t))return 'α-synuclein 病理可造成周邊自主神經退化；心肌 MIBG 低攝取可反映交感去神經支配。';}
if(examKey==='114-32'){
if(/中度到重度/.test(t))return '孤立性 RBD 可出現自主神經功能異常，但嚴重度與個體差異很大；不能概括為通常中度至重度。';
if(/心率變異性|MIBG/.test(t))return '孤立性 RBD 可伴自主神經異常；心率變異性、心肌 MIBG 等能評估不同自主神經路徑。';
if(/便祕|勃起障礙/.test(t))return '便祕、勃起功能障礙等自主神經症狀與孤立性 RBD 轉化為突觸核蛋白病的風險相關，但不能單獨預測個人轉化。';
if(/僅限於心血管/.test(t))return '自主神經受累可能涉及心血管、泌尿生殖、胃腸及汗腺等系統，並非只限於心血管。';
if(/晚期才/.test(t))return '自主神經症狀可在運動症狀前或轉化前出現；不應一概視為神經退化晚期才出現。';}
if(examKey==='114-36'){
if(/第二常見|中樞神經性/.test(t))return '老年人最常見睡眠呼吸障礙是 OSA；中樞型睡眠呼吸中止較常見於特定心衰竭、腦幹病變或藥物情境。';
if(/超過 15 秒|15 秒/.test(t))return '此題依所引教材將阻塞事件描述為口咽塌陷並可持續超過15秒，因此列為正確特徵；臨床睡眠檢查對呼吸中止事件的操作性定義另以至少10秒為門檻，兩者用途不同。';
if(/ahi/.test(t)&&/症狀/.test(t))return '正式診斷須按睡眠檢查與臨床標準判定；本題選項所列症狀組合沒有完整涵蓋相符症狀／共病要求，不能把片段描述當成診斷標準。成人常用門檻為 AHI ≥5 且有症狀，或 AHI ≥15。';
if(/輕度|中度|重度/.test(t))return '依本題採用的教材分級，AHI 約 5–15 為輕度、16–30 為中度、超過 30 為重度；臨床指引常以每小時 5、15、30 次作切點，遇邊界值要看題目所引版本。';
if(/盛行率|49%|6%-17%/.test(t))return 'OSA 盛行率會隨年齡、AHI 門檻、症狀要求及研究樣本改變；老年樣本可報告較高比例，但不能把不同定義的估計當固定常數。';}
if(examKey==='114-48'){
if(/任一種失智症/.test(t))return '大型族群研究提示 OCD 與後續失智風險可能相關，但相關性不證明 OCD 導致失智，也受年齡、共病與監測偏差影響。';
if(/阿茲海默/.test(t)&&/血管性/.test(t))return '若研究指出女性 OCD 患者的 AD 風險高於血管性失智，須限於該性別分層結果；不能外推到所有 OCD 患者或推論因果。';
if(/年輕型失智/.test(t))return 'OCD 與年輕型失智的關聯須按該研究的年齡界定、病例數和統計不確定性解讀；不能只以整體失智關聯代替。';
if(/男性|女性/.test(t)&&/任一失智/.test(t))return '男女差異必須由性別分層結果支持；不能只因女性亞型 AD 的關聯較強，就推出女性總體失智風險較低。';}

if(/cam|confusion assessment|譫妄|delirium/.test(x)){if(/定向|disorientation/.test(t))return 'CAM 的必要組合是急性／波動及注意力不集中，再加思考混亂或意識程度改變；定向障礙雖常見，並非四項必要特徵之一。';if(/急性|波動|acute onset|fluctuat/.test(t))return '急性起病或症狀波動是 CAM 的第一項必要特徵；應由照顧者或病歷確認相較基線的時間變化。';if(/注意|inattention/.test(t))return '注意力不集中是 CAM 的第二項必要特徵，須與急性／波動同時存在，再加思考混亂或意識程度改變。';if(/思考|意識|disorganized|altered level/.test(t))return '思考混亂與意識程度改變是 CAM 第三／四特徵，符合其一即可與前兩項共同構成陽性演算法。';}
if(/app?elbaum|決策能力|understanding|appreciation|reasoning/.test(x)){if(/理解|understand/.test(t))return '理解是四項決策能力之一，評估患者能否用自己的話重述相關資訊，而非只看是否同意醫療建議。';if(/體認|appreciat/.test(t))return '體認是把資訊連結到自己處境與可能後果的能力；只記住資訊但無法連結自身，可能顯示此項受損。';if(/推理|reason/.test(t))return '推理是比較選項、後果與個人價值的過程；結論與醫療團隊不同本身不代表推理能力缺損。';if(/選擇|choice/.test(t))return '表達選擇是四項能力之一；穩定表達偏好不代表理解、體認及推理自然都完整。';}
if(/dlb|路易氏體|lewy|mibg|α-synuclein|dopamine transporter/.test(x)){if(/mibg/.test(t))return 'DLB 的心肌 I-123 MIBG 攝取通常降低，反映心臟交感神經去支配；攝取增加的說法方向相反。';if(/dat|dopamine transporter|多巴胺轉運/.test(t))return 'DLB 的多巴胺轉運體影像通常呈基底核攝取降低，支持黑質紋狀體多巴胺神經元受損。';if(/視幻|波動|rem|巴金森|parkinson/.test(t))return '這項描述對應 DLB 的核心臨床特徵之一；須辨認視幻覺、認知波動、RBD、自發性巴金森徵象，不能只靠單一症狀確診。';}
if(/阿茲|alzheimer|amyloid|aβ|tau|海馬|hippocamp/.test(x)){if(/aβ|amyloid|類澱粉/.test(t)&&/降低|下降|decreas|low/.test(t))return 'AD 的腦脊髓液 Aβ42 或 Aβ42/40 比值常降低，因可溶性 Aβ 被沉積於腦內；需和類澱粉 PET 的訊號方向分開記。';if(/aβ|amyloid|類澱粉/.test(t)&&/增加|升高|高/.test(t))return '腦內類澱粉沉積可使 amyloid PET 訊號增加，但腦脊髓液 Aβ42 常是降低；判讀要先看檢體或影像類型。';if(/p-tau|phosphorylated tau|磷酸化tau/.test(t))return 'AD 的腦脊髓液 p-tau 常升高，支持 tau 病理；總 tau 也會受其他急性神經元損傷影響，不能視為同等特異。';if(/海馬|hippocamp|內側顳葉/.test(t))return '典型 AD 早期常見內側顳葉與海馬萎縮，並與新學習／情節記憶受損相呼應；影像仍須和病史、功能整合。';if(/記憶|learning|recall/.test(t))return '典型 AD 先傷害新資訊學習與延遲回憶的儲存；提示通常不如正常老化的提取困難那樣明顯改善。';}
if(/mci|輕度認知障礙|輕微認知缺損/.test(x)){if(/日常|獨立|functional|activities/.test(t))return 'MCI 有客觀認知下降但基本獨立生活能力大致保留；日常功能已明顯受損時應評估是否達失智症。';if(/學習|learning/.test(t))return '此題所引研究中，MCI 的學習能力並非與正常老人相同；「命名接近正常」不能推論「學習也正常」，因新資訊學習／延遲記憶是常受影響的認知域。';if(/命名|praxis|應用功能/.test(t))return '此研究描述的 MCI 樣本在命名與動作運用等部分能力仍可接近正常；這是該研究的群體結果，不代表所有 MCI 患者都沒有這些領域缺損。';if(/視覺記憶|visual memory/.test(t))return '此選項比較 MCI 與中度 AD 的視覺記憶表現；不能只因兩組都有記憶受損就說程度相同。題目所引研究顯示兩組在此測驗領域有差異，故「大致相同」不成立。';if(/fluency|流暢/.test(t))return '語言流暢度會隨整體疾病嚴重度與額葉執行功能受影響；此題所引研究不支持把 MCI 和中度 AD 的表現概括為差異不大。';}
if(/額顳|frontotemporal|bvftd|ftd|tau|tdp-43/.test(x)){if(/去抑制|淡漠|同理|口慾|飲食|刻板|社會認知/.test(t))return '這些是 bvFTD 常見早期行為／社會認知變化；需確認相較基線漸進出現，並鑑別情緒疾患、藥物及其他神經病因。';if(/額葉|前顳|frontal|temporal|萎縮|代謝/.test(t))return 'FTLD 影像通常呈額葉或前顳葉網絡萎縮／低代謝，分布依行為或語言亞型不同；早期影像未顯著不能單獨排除。';}
if(/white matter hyperintens|白質高亮度/.test(t))return '老年妄想症研究曾報告較多白質高訊號，可能反映額葉—皮質下網絡連結受影響；這是群體影像關聯，不是個人確診標記。';
if(/血管性|vascular|腔隙|白質|梗塞|中風/.test(t)){if(/新.*中風|舊.*中風|新的中風/.test(t))return '區分新舊缺血病灶時，MRI 的 DWI/ADC 對急性梗塞特別有助；無顯影 CT 常用於急性初評及排除出血，顯影 CT 並非判斷新舊梗塞的首選依據。';return '血管性認知障礙表型取決於病灶位置與負荷：中風後階梯下降、小血管病的速度／執行功能和步態問題較典型；病灶須能解釋症狀。';}
if(/b12|維他命.?b12|葉酸|folate|homocysteine/.test(x)){if(/大球性|macrocyt/.test(t))return 'B12 缺乏可同時有血液學與神經精神表現，神經症狀不一定等到大球性貧血出現才發生；正常血球不能排除。';if(/homocysteine/.test(t))return 'B12／葉酸不足通常可能使 homocysteine 升高，而非降低；這個指標仍須結合腎功能及營養狀況解讀。';if(/視覺空間|流暢|language|譫妄/.test(t))return 'B12 缺乏可造成多樣神經精神表現，但單一認知表型不是其特異診斷依據；應以檢驗與臨床背景判斷。';}
if(/cholinesterase|膽鹼酶|donepezil|rivastigmine|galantamine/.test(x)){if(/rivastigmine/.test(t)&&/cyp|代謝/.test(t))return 'Rivastigmine 主要由膽鹼酯酶水解代謝，並非依賴 CYP2D6／CYP3A4；相較 donepezil，CYP交互作用較少。';if(/donepezil/.test(t)&&/cyp|代謝/.test(t))return 'Donepezil 主要經 CYP2D6 與 CYP3A4 代謝；合併抑制／誘導藥物或肝功能變化時需考慮暴露量改變。';if(/galantamine/.test(t)&&/irreversible|不可逆/.test(t))return 'Galantamine 是可逆性乙醯膽鹼酯酶抑制劑，並具菸鹼型受體調節作用；「不可逆」是把藥理機轉說錯。';if(/半衰期|half.life/.test(t))return '半衰期與藥效持續時間不是同一概念；Rivastigmine 血漿半衰期短，但對酵素的抑制較持久，Galantamine 半衰期較長。';if(/分次|once daily|每日一次|最高劑量/.test(t))return '不同膽鹼酯酶抑制劑的劑型與給藥頻次不同：Donepezil 通常每日一次，Rivastigmine 口服分次或貼片每日一次，Galantamine 依即放／緩釋劑型安排。';}
if(/安寧|緩和醫療|末期病人/.test(x)){if(/三萬元以下|3萬元以下|三萬.*以下/.test(t))return '《安寧緩和醫療條例》第11條對違反第9條病歷記載／文件保存規定的罰鍰為新臺幣3萬元以上、15萬元以下；「3萬元以下」把下限方向寫反。';if(/連同病歷保存|病歷保存/.test(t))return '條例第9條要求相關事項詳實記載病歷，意願書或同意書也須連同病歷保存；本選項描述的是正確法定要求。';if(/二位醫師|兩位醫師|心肺復甦/.test(t))return '條例第7條要求兩位醫師診斷為末期病人，並有意願人簽署意願書（法定例外另論），才可不施行心肺復甦或維生醫療；題目這裡列出的程序符合該原則。';if(/靈性|身體.*心理|痛苦/.test(t))return '安寧緩和照護目標包括減輕身體、心理、社會及靈性痛苦，因此靈性照顧屬整體緩和照護。';if(/親屬|姻親/.test(t))return '條例第7條列明最近親屬包括一親等直系姻親；這是法定範圍，不能依日常口語自行擴大或縮小。';if(/停業|第七條|一年/.test(t))return '《安寧緩和醫療條例》第10條規定醫師違反第7條者，得處一個月以上一年以下停業處分（亦有罰鍰或廢照規定）；選項所述「一年以下」方向正確。';if(/安寧照顧|hospice|選項之一/.test(t))return '緩和照護可作為晚期失智症照護模式之一，著重症狀舒適、預立照護規劃與家屬支持，不等同停止所有照護。';}
if(/末期失智|advanced dementia|fast:|mmse≤|fast\s*7/.test(x)){if(/mmse/.test(t))return '末期失智的臨床／長照分期不是單一 MMSE 分數切點；功能依賴、語言、移動、吞嚥及併發症比單次量表更能描述晚期。';if(/fast|6c|7級/.test(t))return 'FAST 第7期代表嚴重功能依賴（依序涉及語言、行動、坐立、微笑及頭部控制等）；末期照護判定還須看整體臨床狀況，不能只把6c當統一定義。';if(/肺炎|發燒|飲食/.test(t))return '晚期失智常見感染、發燒、進食及吞嚥困難，這些併發症會增加住院及死亡風險；照護目標需同時涵蓋舒適與預立意願。';}
if(/老年妄想|晚發型.*精神病|vloslp|妄想症/.test(t)){if(/視力|感官/.test(t))return '感官缺損（尤其視力下降）可能增加晚年精神病／妄想風險，也會讓錯認或知覺經驗惡化；改善感官與環境是鑑別及照護的一環。';if(/移民|社經|低社經/.test(t))return '晚發精神病的流行病學風險與移民、社會隔離及低社經處境有關；把這些族群因素寫成「較不易」通常需再核對方向。';if(/白質|white matter|再測驗|neuropsych/.test(t))return '老年妄想症研究可見白質高訊號與執行／社會認知弱點；其神經心理表現和思覺失調症可能重疊，再測驗差異不明顯，因此不宜用單項測驗區分。';}
if(/邊緣型人格|borderline personality/.test(t))return '病前人格特質可作為晚年妄想症的易感背景，但「特定人格疾患是已確立的直接病因」說得過度確定；需和感官、腦部及社會因素一併看。';
if(/移民|低社經|low socioeconomic/.test(t))return /不易|較少|lower|less likely/.test(t)?'移民身分與低社經處境在部分研究中是晚發精神病的風險關聯；選項說「較不易」把方向寫反。':'此項描述的是族群／社會處境的風險關聯，不能直接當成個人診斷，但可用來理解晚發精神病的流行病學。';
if(/white matter hyperintens|白質高亮度/.test(t))return '老年妄想症研究曾報告較多白質高訊號，可能反映額葉—皮質下網絡連結受影響；這是群體影像關聯，不是個人確診標記。';
if(/視力喪失|視力下降|視覺缺損/.test(t))return '視力喪失與晚年妄想症／知覺錯認有研究上的關聯；感官輸入減少會增加誤認機會，臨床仍須檢查眼科、藥物及神經病因。';
if(/再測驗|retest/.test(t)&&/神經心理|neuropsych|思覺失調|妄想症/.test(t))return '晚年妄想症與思覺失調症的神經心理弱點可有重疊，研究所述的再測驗表現差異不明顯；單靠測驗不能可靠區分兩者。';
if(/失智症病人|dementia patient/.test(t)&&/ect|electroconvulsive|電痙攣/.test(t))return /認知/.test(t)?'ECT 可治療失智症患者合併的重度憂鬱或其他明確適應症，但不能據此宣稱會改善失智認知；治療中還須監測短期記憶與譫妄風險。':'失智症本身不是 ECT 的治療目標；若合併嚴重憂鬱，須按憂鬱適應症、認知風險及患者目標個別評估。';
if(/parkinson|巴金森|pd\s*病人/.test(t)&&/ssri|tca|maoi|ect|均有效|都有效/.test(t))return '題目所引治療文獻將 SSRI、TCA、MAOI 與 ECT 列為可用於巴金森病合併憂鬱的治療選項；這表示各類可考慮，不代表療效、耐受性或對運動症狀的影響完全相同。';
if(/\bect\b|electroconvulsive|電痙攣/.test(t))return /不到\s*50|低於\s*50|無效|禁忌/.test(t)?'老年憂鬱症 ECT 的療效通常不止題目所稱的低門檻；嚴重、精神病性、拒食或需快速改善時可評估，並管理麻醉與認知風險。':'ECT 可用於嚴重或需快速治療的憂鬱症（例如拒食致身體惡化）；年齡本身不是排除理由，仍須評估個別風險。';
if(/lithium augmentation|鋰鹽.*增強/.test(t))return '低劑量 lithium 增強治療有老年難治型憂鬱的試驗證據；須監測血中濃度、腎功能、甲狀腺、鈉與交互作用，因脫水或利尿劑等可能迅速提高毒性。';
if(/aripiprazole/.test(t)&&/venlafaxine|augmentation|增強|加強/.test(t))return '老年難治型憂鬱研究支持在 venlafaxine 反應不足時評估 aripiprazole 增強；須觀察靜坐不能、錐體外症狀、代謝與跌倒風險。';
if(/combinations? of different antidepressants|不同抗憂鬱劑|抗憂鬱劑.*合併/.test(t))return '多種抗憂鬱劑併用不等同有足夠的老年難治型憂鬱證據；先確認足量足期、依從性及診斷，再選有試驗支持的增強策略並檢查交互作用。';
if(/bupropion/.test(t)&&/added|add-on|ssri|增強|加上/.test(t))return 'Bupropion 加在 SSRI 後是常見臨床策略，但該老年難治型憂鬱考題的證據組合未把它列為已充分支持的選項；不能只以一般成人經驗外推。';
if(/omega.?3|中藥|herbal/.test(t)&&/憂鬱|depress/.test(t))return 'Omega-3 或中藥的研究不能視為已確立的失智症合併憂鬱治療；需區分初步／異質證據與標準治療，並檢查產品交互作用及品質。';
if(/parkinson|巴金森|pd病人/.test(t)&&/ssri|tca|maoi|ect|均有效|都有效/.test(t))return '巴金森病合併憂鬱可考慮多種抗憂鬱治療，但 SSRI、TCA、MAOI 與 ECT 的證據、耐受性及運動症狀影響並不完全相同；「全部均有效」需按考題所引文獻理解，不能當成等效宣稱。';
if(/失智症病人|dementia patient/.test(t)&&/cbt|認知行為/.test(t))return '失智症患者的心理治療可透過調整後的 CBT 改善情緒與因應；認知缺損程度會限制介入方式，不能把認知分數提升當成必然效果。';
if(/抗精神病劑|atypical antipsychotic/.test(t)&&/憂鬱|效果不佳/.test(t))return '抗精神病藥不是失智症憂鬱的一般首選；若題目談的是 BPSD 或增強治療，適應症和風險不同，不能用「效果不佳」概括所有情境。';
if(/焦慮症|老年焦慮/.test(x)&&/cognitive behavior|cognitive behavioural|\bcbt\b|認知行為治療/.test(t))return 'CBT 是老年焦慮常用的心理治療，放鬆技巧只是多個治療成分之一；通常還包括心理教育、認知重整與暴露／行為練習，因此不能把放鬆說成唯一最重要成分。';
if(/三萬元以下|3萬元以下|三萬.*以下/.test(t))return '《安寧緩和醫療條例》第11條對違反第9條病歷記載／保存規定的罰鍰為新臺幣3萬元以上、15萬元以下；「3萬元以下」將法定下限方向寫反。';
if(/意願書或同意書未連同病歷保存/.test(t))return '條例第9條要求意願書或同意書連同病歷保存；違反此保存規定適用第11條，罰鍰為新臺幣3萬元以上、15萬元以下，因此選項錯在寫成「三萬元以下」。';
if(/augmentation|單一治療無效/.test(t))return '單一治療反應不足時，可先確認診斷、劑量、療程、依從性與共病，再討論轉換或增強策略；題目說「需考慮」增強是合宜的治療步驟，不表示所有人都必須加藥。';
if(/cognitive behavior|cognitive behavioural|\bcbt\b|認知行為治療/.test(t)){if(/75|frail|衰弱/.test(t))return 'CBT 對老年憂鬱有實證支持，但極高齡或衰弱族群的試驗資料較有限；「已足夠證明對所有此族群有效」是把證據說得過滿。';return 'CBT 是老年憂鬱常用且有實證支持的心理治療；依認知、聽視力、體力及患者目標調整節奏與作業。';}
if(/benzodiazepine|苯二氮|鎮靜劑/.test(t))return '高齡者使用 benzodiazepine 需考慮鎮靜、跌倒、譫妄、認知影響及依賴；是否使用取決於適應症、劑量、療程與停藥計畫，不能把風險等同絕對禁用。';
if(/廣泛焦慮症\(gad\)|\bgad\b/.test(t))return '題目所述的流行病學研究把 GAD 列為老年常見焦慮疾患，並指出其與憂鬱及其他精神疾患共病；這是研究族群的趨勢，非每個患者的必然病程。';
if(/強迫症/.test(t)&&/第一次|初發|年輕時|延續|症狀/.test(t))return '強迫症常在較早年齡起病並延續至老年，老年期初發較少；題目說老年病例表現與年輕患者相近，符合其描述的病程特徵。';
if(/恐慌症/.test(t)&&/比較嚴重|症狀會比較嚴重/.test(t))return '恐慌症晚年初發較少，且心血管共病使胸悶、呼吸困難等身體表現更需鑑別；但這不能推出恐慌症狀本身必然比年輕人嚴重，故本選項把「呈現不同」錯推成「嚴重度較高」。';
if(/\d+\s*%/.test(t)&&/失智症|憂鬱症/.test(t))return '這些比例是早期特定研究中失智症、重鬱症與焦慮症狀共現的估計；可用來說明共病常見，但受樣本、量表和年代影響，不是現行所有族群都適用的固定盛行率。';
if(/焦慮|恐慌|panic|強迫症|ocd|廣泛焦慮|\bgad\b/.test(x)){if(/強迫症|ocd/.test(t))return '強迫症多在較早年齡起病並延續，晚年初發較少；若晚年才出現強迫症狀，需排除神經認知疾病、藥物及其他器質性原因。';if(/廣泛焦慮|\bgad\b/.test(t))return 'GAD 是老年常見焦慮疾患，且常與憂鬱或其他焦慮疾患共病；題目描述的是族群研究趨勢，不表示每位晚年初發者都會合併憂鬱。';if(/老年期第一次|首次|初發|發病/.test(t))return '晚年首次出現焦慮或恐慌樣症狀時，須先排除心肺／內分泌疾病、藥物效應、戒斷、譫妄及失智；不能僅因年齡推定是原發焦慮疾患。';if(/嚴重|不同|症狀/.test(t))return /比較嚴重|more severe|severity/.test(t)?'老年恐慌常有與心肺疾病重疊的身體症狀，但不能據此說典型症狀必然比年輕患者更嚴重；「症狀不同」和「嚴重度更高」是兩個命題。':'老年恐慌可能呈胸悶、呼吸困難、暈眩等身體症狀，與心血管疾病重疊；應先做醫療鑑別。';if(/%|比例|失智症|憂鬱症/.test(t))return '焦慮在失智症或憂鬱症中常見，但盛行率會隨診斷標準、樣本與研究年代變動；題目引用的百分比是特定研究估計，不能當成固定個人風險。';if(/serotonin|血清素|ssri|snri|正腎上腺/.test(t))return 'SSRI／SNRI 是老年焦慮疾患常用的一線藥物選擇，需從低劑量開始並觀察低鈉、出血、跌倒、交互作用及停藥症狀。';if(/放鬆|relaxation|cbt|認知行為/.test(t))return 'CBT 常含心理教育、認知重整、暴露／行為實驗與放鬆等元素；放鬆訓練有用，但不是唯一或必然「最重要」的核心成分。';if(/另類|正念|太極|瑜珈|氣功|拳擊/.test(t))return '身心介入可作為偏好導向的輔助選擇，但不同方法的老年焦慮研究量和品質不一；「尚缺乏足夠實證」不等於已證明無效。';if(/單一治療|augmentation|加強|增強/.test(t))return '單一治療反應不足時可先確認診斷、劑量、療程、依從性與共病，再討論轉換或增強；不是所有患者都應直接加藥。';}
if(q.tag==='depression'||/憂鬱|depress/.test(t)){if(/身體抱怨|somatic/.test(t))return '老年憂鬱可用疼痛、疲倦或其他身體主訴呈現；要同時詢問情緒、興趣、睡眠、食慾和功能，不能只看外顯悲傷。';if(/記憶|認知|memory/.test(t))return '憂鬱會造成注意力與提取效率下降，形成主觀記憶抱怨；需依起病、功能、知情者觀察及追蹤區分憂鬱相關認知變化與神經退化。';if(/拒絕.*飲食|拒食|進食/.test(t))return '因重度憂鬱拒食並造成身體惡化屬需快速治療的臨床情境，可評估 ECT；同時處理脫水、營養與自殺風險。';if(/減少服用|減少.*鎮靜|減少.*藥物/.test(t))return '身體抱怨、記憶困難、拒食或飲酒增加可伴隨憂鬱；「減少服用鎮靜藥物」本身不是典型的憂鬱症狀表現，因此本題把它列為例外。';if(/飲酒|鎮靜|藥物/.test(t))return '飲酒增加或服藥改變可能是憂鬱的伴隨線索，但不是診斷本身；應查明時間關係、用藥安全及是否有物質使用或戒斷。';}
if(/影像|mri|ct scan|computed tomography|tomography|pet|spect/.test(x)){if(/突然失去意識|意識.*突然/.test(t))return '急性意識改變需快速排除出血等急症，初步常用無顯影 CT；顯影劑不是一般突發意識改變的首選理由。';if(/新.*中風|舊.*中風|新的中風/.test(t))return '急性梗塞與舊病灶的時間判讀以 MRI DWI/ADC 尤其有助；CT 對出血及快速初評實用，但顯影 CT 不是最佳區分方式。';if(/腦下垂體|pituitary/.test(t))return '腦下垂體微小病灶通常以專用 MRI（常需顯影）較適合評估；無顯影 CT 對軟組織細節不足。';if(/海馬|hippocamp/.test(t))return 'MRI 可評估海馬與內側顳葉體積，常用於認知障礙鑑別；須依年齡、總腦萎縮及臨床病程解讀。';if(/中腦出血|韋尼克|wernicke/.test(t))return 'MRI 對韋尼克腦病變的典型區域訊號及出血性病灶有較佳軟組織對比；影像不能延誤疑似硫胺素缺乏時的治療。';}
if(/prolactin|泌乳激素/.test(t))return '老年男性泌乳激素可有輕微增加，此項符合題目採用的老化內分泌趨勢；它和女性、藥物引起的高泌乳素血症需分開判讀。';
if(/renin|腎素/.test(t))return '老化時腎素活性通常下降，體位改變後的反應也可能變鈍；題目若說老年人腎素上升，方向便與典型老化生理不符。';
if(/aldosterone|醛固酮/.test(t))return '老化時腎素—醛固酮系統活性通常降低，醛固酮分泌及對體位刺激的反應可能減弱；須和腎素分開看，不能把兩者當作同步上升。';
if(/dhea|dehydroepiandrosterone/.test(t))return 'DHEA 與 DHEAS 隨年齡增加通常下降，反映腎上腺網狀帶老化；選項所述方向若為增加，便與典型趨勢相反。';
if(/igf-1/.test(t))return '循環 IGF-1 通常隨年齡增加而下降，與生長激素軸變化相關；不能把這種族群趨勢直接解讀為每位個體的固定值。';
if(/parathyroid|副甲狀腺|pth/.test(t))return '老年人副甲狀腺素可能因維生素D不足、腎功能及鈣吸收變化而升高；須把生理老化趨勢與可治療的代謝異常一併評估。';
if(/甲狀腺素|thyroid/.test(t))return '甲狀腺檢驗需依 TSH、游離甲狀腺素、共病及用藥分別判讀；老化不能簡化成所有甲狀腺激素都同方向改變。';
if(/餵食管|管灌|feeding tube/.test(t))return '晚期失智患者的管灌不保證預防吸入性肺炎或提升生活品質，且可能帶來管路不適與約束；應依患者價值和照護目標討論舒適餵食。';
if(/運動|physical activity|exercise/.test(t))return '依身體能力調整的運動可支持老年人的功能及健康；衰弱或高齡不等於「運動完全無效」，需個別評估安全與可行性。';
if(/睡眠呼吸|osa|ahi|rbd|cbt-i|睡眠限制|刺激控制/.test(t)){if(/rbd|rem/.test(t))return 'RBD 是 REM 期肌張力抑制消失而出現夢境演出，可能是 α-synuclein 疾病的前驅線索；須優先降低受傷風險。';if(/osa|呼吸中止|ahi/.test(t))return 'OSA 由反覆上呼吸道阻塞造成睡眠呼吸事件，診斷依睡眠檢查及臨床症狀；單靠打鼾不能確診。';return 'CBT-I 的核心包含刺激控制、睡眠限制與認知策略；睡眠衛生可輔助，不能取代完整 CBT-I。';}
if(/apoe/.test(t)&&/ε4|e4/.test(t))return 'APOE ε4（包括 ε4/ε4）會提高阿茲海默病風險，但不是阿茲海默病專有或必然致病的基因型；許多帶因者不會在一生中發病，診斷需靠臨床與病理證據。';
if(/periodic sharp wave|周期性尖銳複合波/.test(t))return '週期性尖銳波／複合波常見於 CJD，但嚴重或非典型的 AD 也可能出現，因此「CJD 可有、AD 絕不會有」的絕對說法不成立。';
if(/低血鈉|hyponatremia|115\s*[-–]\s*120/.test(t))return '慢性低血鈉若逐漸形成，腦部可部分適應，症狀可能不明顯；但 115–120 mEq/L 仍屬嚴重低鈉，需緊急找病因並緩慢矯正，避免腦水腫或滲透性脫髓鞘。';
if(/鈣和鎂|calcium.*magnesium|鈣.*鎂/.test(t))return '鈣或鎂異常可干擾神經元興奮性並造成急性精神狀態改變、譫妄或精神病樣症狀；出現新發症狀時應納入可逆代謝病因評估。';
if(/amiodarone|胺碘酮|estrogen|雌激素/.test(t)&&/tsh/.test(t))return '胺碘酮會影響甲狀腺合成、轉換與釋放，雌激素則改變甲狀腺結合球蛋白；用藥者解讀 TSH／甲狀腺檢驗需連同藥物機轉與檢驗指標判讀。';
if(/病因之一|causes?|因果/.test(t)&&/失智|dementia/.test(t))return '此研究是觀察性資料，只報告成人 ADHD 與失智風險同時出現的關聯；未隨機分派暴露，不能由此斷定 ADHD 是失智病因。';
if(/methylphenidate|利他能/.test(t)&&/預防|prevent/.test(t))return '題幹沒有比較 methylphenidate 使用與否，也沒有預防介入結果；藥物是否能預防失智不能從 ADHD—失智的相關性推得。';
if(/男性|女性|male|female/.test(t)&&/風險|risk/.test(t)&&/失智|dementia/.test(t))return '題幹只給成人 ADHD 與失智風險的整體相關，沒有性別分層或男女比較資料，因此不能推出男性風險較高。';
if(/兒童|childhood|children/.test(t)&&/失智|dementia/.test(t))return '研究對象限定為成人 ADHD；把結論延伸到兒童 ADHD 是超出樣本年齡範圍，資料不足以支持。';
if(/association|相關性/.test(t)&&/失智|dementia/.test(t))return '在題幹給定的健保資料庫觀察結果下，最穩妥的結論是成人 ADHD 與失智風險有統計相關；這不代表因果或藥物預防效果。';
if(/association|相關性/.test(t)&&/失智|dementia/.test(t))return '在題幹給定的健保資料庫觀察結果下，最穩妥的結論是成人 ADHD 與失智風險有統計相關；這不代表因果或藥物預防效果。';
if(/行為能力|民法|刑法|違法|意思表示|監護宣告|未成年人已結婚|無意識|精神錯亂/.test(t)){if(/對錯/.test(t))return '民法上的行為能力是法律行為能否有效的身分／能力概念，不是判斷道德對錯；刑法辨識違法能力則是另一個問題。';if(/監護宣告/.test(t))return '受監護宣告者依民法第15條為無行為能力人；這是法院宣告的民事法律效果，不能由臨床診斷直接取代法院程序。';if(/不能辨識.*違法|行為違法/.test(t))return '「不能辨識行為違法或欠缺依辨識而行為能力」屬刑法第19條的刑事責任能力判斷，不等於民法上的行為能力；本題需注意它把兩種法律概念放在同一題比較。';if(/未成年人已結婚/.test(t))return '這是舊年度法規題：107年考題依當時民法的未成年人婚姻成年效果作答；現行法已改為滿18歲成年，不能把舊答案直接套到現行法律。';if(/無意識|精神錯亂/.test(t))return '民法第75條規定，即使不是無行為能力人，若意思表示當時處於無意識或精神錯亂，該意思表示仍無效；重點是表示當時狀態，不是事後診斷本身。';if(/意思表示|辨識/.test(t))return '民法監護／輔助宣告看能否為或受意思表示、辨識其效果；臨床決策能力則是特定醫療決定的理解、體認、推理與表達，兩套評估不可混用。';}
if(/人格五因素|neuroticism|外向性|開放性|友善性|嚴謹性|conscientiousness/.test(x))return '五因素模型為神經質、外向性、開放性、友善性與嚴謹性；認知退化可能影響特質表現，但各向度方向需依研究及病型核對，不能把所有向度都判為上升。';
const claim=s.replace(/\s+/g,' ').trim(),short=claim.length>170?claim.slice(0,167)+'…':claim,topicNotes={basics:'正常老化通常是器官儲備與處理速度下降，不代表功能必然喪失；判斷機轉時要分清相關性、假說與因果證據。',assessment:'評估工具只測量特定構念；需連同基線、教育與語言、感官、功能及知情者資料判讀。',labs:'檢查結果要先看檢體／影像種類、病程時點及檢查能回答的問題，單一異常通常不能獨立確診病因。',nonlab:'臨床表型要和病前基線及日常功能變化對照；量表分數不能代替病程與功能訪談。',teamcare:'照護決策要依個案目標、團隊角色及交班內容整合，不能把單一職類或家屬意見當成全部評估。',longterm:'照護原則先找症狀誘因和安全需求，再依患者偏好選擇居家、社區或機構支持並定期檢討。',dementia:'失智病型依病程、主要認知域、功能與神經特徵共同判斷；不同病理可共存，單一線索不能定診。',delirium:'譫妄是急性／波動的注意與認知改變，先找促發病因；鎮靜或約束不能替代病因處置。',psychosis:'晚年新發精神病症狀先排除譫妄、失智、藥物／物質及感官缺損，再考慮原發精神疾患。',depression:'老年情緒症狀可能以認知、身體或功能主訴呈現；治療需同時看嚴重度、自殺風險、共病及副作用。',anxiety:'焦慮症狀可能與心肺疾病、藥物或戒斷重疊；晚年初發時先完成醫療鑑別，再選擇心理與藥物治療。',sleep:'先區分睡眠架構變化、失眠、呼吸障礙與異睡症；治療要對準病因，避免將所有睡眠問題都當失眠。',personality:'人格疾患是長期、跨情境的特質模式；晚年新出現的改變需鑑別神經認知疾病、情緒疾患及環境因素。',substance:'高齡物質使用要區分使用量、戒斷及功能後果，並納入肝腎功能、藥物交互作用和跌倒風險。',ethics:'法律行為能力、特定醫療決策能力與刑事責任能力是不同概念；評估須對準決定、時間及適用法規。',sexual:'性健康與司法評估需分開看生理功能、同意能力、脆弱性、情境和法律要件。'},note=topicNotes[q.tag]||topicNotes.assessment;
return '此選項的逐項詳解尚未完成，請勿把題目答案或章節概述當成本選項的判斷理由。';}
function questionCard(q){
const topic=labelFor(q.tag),isReview=q.year==='考訊',yearLabel=isReview?'考訊整理題':`${q.year} 年`,answerChoice=(q.options||[]).find(o=>o.n===Number(q.answer)),comboChoices=(q.options||[]).some(o=>/^[A-F](?:\s*[+＋,、]\s*[A-F])+$/.test(o.text.trim())),opts=(comboChoices?(q.statements||[]):(q.options?.length?q.options:q.statements||[])).map(o=>({letter:String(o.letter??o.n),text:o.text})),combo=!!(answerChoice&&/^[A-F](?:\s*[+＋,、]\s*[A-F])+$/.test(answerChoice.text.trim())),chosen=combo?new Set(answerChoice.text.match(/[A-F]/g)):null;
let allText=(q.text||'').replace(new RegExp('^\\s*'+q.number+'[.．、]\\s*'),'');
const firstAlpha=allText.search(/(?:^|\n)\s*A[.．、）)]\s*/),firstNum=allText.search(/(?:^|\n)\s*1[.．、）)]\s*/);
const stem=(firstAlpha>=0?allText.slice(0,firstAlpha):firstNum>=0?allText.slice(0,firstNum):allText.split(/\n\s*選項/)[0]).replace(/\n\s*選項\s*[:：]?\s*/g,' ');
const asksFalse=/錯誤|錯的|為非|不正確|最不|不包含|不是|何者非|並非|有誤|不適合|不適當|不適切|不妥當/.test(stem),exact=reviewReasonMap(q);
const items=opts.map(o=>{const isCombo=!!chosen,selected=isCombo?chosen.has(o.letter):Number(o.letter)===Number(q.answer),truthMap=window.DETAILED_OPTION_TRUTH?.[`${q.year}-${q.number}`],hasTruth=!!truthMap&&Object.prototype.hasOwnProperty.call(truthMap,o.letter),isTrue=hasTruth?truthMap[o.letter]:(isCombo?(asksFalse?!selected:selected):null),isUnknown=!!window.DETAILED_OPTION_UNDETERMINED?.[`${q.year}-${q.number}`]?.[o.letter];let verdict;if(isUnknown)verdict='原卷留白，無法判定';else if(isTrue!==null)verdict=isTrue?'正確敘述':'錯誤敘述';else if(selected)verdict=asksFalse?'錯誤敘述':'正確敘述';else verdict=asksFalse?'正確敘述':'錯誤敘述';const sourceExplanation=exact[o.letter],why=isUnknown?'原始公告題目未提供這個選項的命題內容；網站保留空白資訊，不推測其正誤。':sourceExplanation&&sourceExplanation.length>18?`考訊原始逐項說明：${sourceExplanation}`:optionKnowledge(q,o.text,isTrue!==null?isTrue:selected,asksFalse);return {o,isCombo,selected,isTrue,isUnknown,verdict,why};});
const counts=new Map();for(const item of items)counts.set(item.why,(counts.get(item.why)||0)+1);
const breakdown=items.map(({o,isCombo,selected,isTrue,isUnknown,verdict,why})=>{if(counts.get(why)>1&&!isUnknown){const claim=o.text.replace(/\s+/g,' ').trim(),focus=claim.length>125?claim.slice(0,122)+'…':claim;const conclusion=isTrue!==null?(isTrue?'本項命題成立。':'本項命題不成立。'):(asksFalse?(selected?'題目問錯誤敘述；本項命題為錯。':'題目問錯誤敘述；本項命題為正確。'):(selected?'公告答案選此項；本項命題為正確。':'公告答案未選此項；本項命題不正確。'));why+=` 本選項另聚焦「${focus}」；${conclusion}`;}const state=isUnknown?'is-unknown':(isTrue!==null?(isTrue?'is-right':'is-wrong'):(selected?'is-right':'is-wrong'));return `<div class="option-analysis ${state}"><div class="option-top"><b>${esc(o.letter)}.</b><span>${esc(verdict)}</span></div><p class="option-statement">${esc(o.text)}</p><p class="option-why"><b>判斷理由：</b>${esc(why)}</p></div>`}).join('');
return `<article class="qcard"><div class="qhead"><strong>${yearLabel}　第 ${q.number} 題</strong><span class="tag">${esc(topic)}${isReview?' · '+esc(q.code||'文獻導讀'):''}</span></div><div class="qbody"><div class="qtext full-question">${esc(q.text)}</div><div class="answer-line"><span class="official">${isReview?'考訊答案':'公告答案'}：選項 ${esc(q.answer)}${answerChoice?'（'+esc(answerChoice.text)+'）':''}${window.DETAILED_OPTION_KEY_MISMATCH?.[`${q.year}-${q.number}`]?'　⚠ 逐項核對發現公告答案與選項內容／參考資料有不一致或歧義，請看各項說明。':''}</span></div><h4 class="option-heading">每個選項的判定與理由</h4><div class="option-list">${breakdown||'此題未能拆出選項，請核對原卷。'}</div>${isReview&&q.explanation?`<details class="source-exp"><summary>查看考訊原始詳解</summary><pre>${esc(q.explanation)}</pre></details>`:''}<p class="source-line">來源：${isReview?'考訊彙整 PDF，領域 '+esc(q.code||'文獻導讀'):`${q.year} 年公告版／釋疑版考題`}。非考訊題目只有公告答案時，逐項理由為依教材整合的說明；如教材未能確認，會明示此限制。</p></div></article>`}

window.openTopic=openTopic;window.showView=showView;window.showQuestions=showQuestions;window.goPage=goPage;buildNav();renderTopics();
