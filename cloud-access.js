/* The public reader transfers marks only after the user opens their private reader. */
(() => {
 'use strict';
 const CLOUD='https://geriatric-study-cloud.buffitem2.chatgpt.site';
 const button=document.createElement('button');button.className='pill-button sync-launcher';button.type='button';button.textContent='跨裝置同步';button.setAttribute('aria-controls','sync-panel');button.setAttribute('aria-expanded','false');
 document.querySelector('.top-actions')?.append(button);
 const panel=document.createElement('section');panel.id='sync-panel';panel.className='sync-panel';panel.hidden=true;panel.setAttribute('aria-label','跨裝置同步');
 panel.innerHTML='<div class="sync-panel-head"><h2>跨裝置閱讀重點</h2><button type="button" data-sync="close" aria-label="關閉同步面板">關閉</button></div><p>先在平常畫記的電腦瀏覽器，把現有標記移到私人同步版。之後手機、平板開啟同步版，以同一ChatGPT帳號登入即可。</p><p class="sync-count"></p><button class="sync-primary" type="button" data-sync="transfer">移轉標記並進入同步版</button><p><a class="sync-open" target="_blank" rel="noopener">開啟私人同步版 →</a></p><p class="sync-feedback" role="status" aria-live="polite"></p><details><summary>移轉沒有成功？</summary><p>先下載標記備份，再到同步版的「標記同步」匯入此檔。匯入會合併標記，不會清除原有標記。</p><button type="button" data-sync="export">下載標記備份</button></details><p class="sync-help">原網站的標記會保留。登入同步版後的新增、刪除才會自動同步；本頁仍使用裝置上的標記。</p>';
 panel.querySelector('.sync-open').href=CLOUD+'/';document.body.append(panel);
 let child=null,timeout=0;
 const feedback=panel.querySelector('.sync-feedback');
 function close(){panel.hidden=true;button.setAttribute('aria-expanded','false');}
 function marks(){return window.StudyHighlights?.get()||[];}
 function refresh(){panel.querySelector('.sync-count').textContent='這個瀏覽器目前有 '+marks().length+' 筆螢光標記。';}
 button.addEventListener('click',()=>{panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)refresh();});
 panel.addEventListener('click',event=>{
  const action=event.target.closest('[data-sync]')?.dataset.sync;
  if(action==='close')close();
  if(action==='transfer'){
   child=window.open(CLOUD+'/reader/index.html?migrate=1','study-cloud-migration');
   feedback.textContent=child?'請在新分頁登入，並暫時保留本頁。標記會在登入後自動合併。':'瀏覽器未開啟新分頁。請允許開啟分頁後再試，或使用下方備份檔移轉。';
   clearTimeout(timeout);timeout=setTimeout(()=>{if(child)feedback.textContent='若新分頁已登入卻尚未完成移轉，請下載下方標記備份，再到同步版匯入。';},120000);
  }
  if(action==='export'){
   const blob=new Blob([JSON.stringify({version:1,highlights:marks(),exportedAt:new Date().toISOString()},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=url;a.download='老年精神醫學-標記備份-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
   feedback.textContent='已準備標記備份檔，請在同步版的「標記同步」匯入。';
  }
 });
 window.addEventListener('message',event=>{
  if(event.origin!==CLOUD||!child||event.source!==child)return;
  if(event.data?.type==='study-sync-ready')child.postMessage({type:'study-sync-import',data:{version:1,highlights:marks()}},CLOUD);
  if(event.data?.type==='study-sync-imported'){clearTimeout(timeout);child=null;feedback.textContent='已完成移轉，雲端已儲存 '+Number(event.data.count||0)+' 筆標記。之後請使用私人同步版閱讀。';}
 });
 window.addEventListener('study-highlights-changed',refresh);
 document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
 document.addEventListener('pointerdown',event=>{if(!panel.hidden&&!panel.contains(event.target)&&!button.contains(event.target))close();});
})();
