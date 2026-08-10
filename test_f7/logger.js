/* =========================================================
   F7 Screenshot Performance Logger
   画面内ログ専用。CSV/JSON出力なし。
========================================================= */
(function initScreenshotLogger(){
  const style=document.createElement('style');
  style.textContent=`
    .perf-log{margin-top:10px;border:1px solid #343943;border-radius:10px;background:#0d0f14;overflow:hidden;box-shadow:inset 0 0 18px #000}
    .perf-log-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;border-bottom:1px solid #272c34;background:linear-gradient(180deg,#171a20,#0d0f13)}
    .perf-log-title small{display:block;color:#a8afb8;font-size:8px;letter-spacing:.18em}.perf-log-title strong{display:block;margin-top:2px;font-size:14px;letter-spacing:.08em;color:#ffe06b}
    .perf-log-state{font-size:9px;font-weight:900;padding:5px 8px;border:1px solid #4b515b;border-radius:99px;color:#b8bec7}.perf-log-state.recording{color:#fff1b5;border-color:#9c7109;box-shadow:0 0 9px #ffb00066}
    .perf-log-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;padding:7px}
    .perf-log-actions button{border:1px solid #51441b;background:#15130b;color:#ffe176;border-radius:7px;padding:7px 3px;font-size:9px;font-weight:900}
    .perf-log-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;padding:0 7px 7px}
    .perf-log-card{background:#12151b;border:1px solid #292e36;border-radius:7px;padding:6px;min-width:0}.perf-log-card span{display:block;font-size:7px;color:#8f97a2;letter-spacing:.08em}.perf-log-card strong{display:block;margin-top:2px;font-size:12px;white-space:nowrap;color:#f7f8fa}
    .perf-log-condition{margin:0 7px 7px;padding:7px;border:1px solid #2a3038;border-radius:7px;background:#090b0e;font-size:8px;line-height:1.6;color:#c7cbd1;word-spacing:.12em}
    .perf-log-condition b{color:#ffe06b}
    .perf-log-table-wrap{padding:0 7px 8px}.perf-log-table{width:100%;border-collapse:collapse;table-layout:fixed;font-variant-numeric:tabular-nums}.perf-log-table th,.perf-log-table td{padding:4px 2px;border-bottom:1px solid #23272e;text-align:right;font-size:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.perf-log-table th{color:#858d97;font-weight:700}.perf-log-table th:first-child,.perf-log-table td:first-child{text-align:left}.perf-log-table td{color:#d7dbe0}.perf-log-table td.state{text-align:left;color:#ffd95a}
    .perf-log-foot{padding:0 8px 8px;color:#6f7680;font-size:7px;line-height:1.4}
  `;
  document.head.appendChild(style);

  const panel=document.createElement('section');
  panel.className='perf-log';
  panel.setAttribute('aria-label','スクリーンショット用パフォーマンスログ');
  panel.innerHTML=`
    <div class="perf-log-head">
      <div class="perf-log-title"><small>SCREENSHOT PERFORMANCE LOG</small><strong>F7 PERF LOG</strong></div>
      <span id="logState" class="perf-log-state">READY</span>
    </div>
    <div class="perf-log-actions">
      <button id="logStart" type="button">LOG START</button>
      <button id="logStop" type="button">LOG STOP</button>
      <button id="logReset" type="button">LOG RESET</button>
    </div>
    <div class="perf-log-summary">
      <div class="perf-log-card"><span>TIME</span><strong id="logTime">0 s</strong></div>
      <div class="perf-log-card"><span>SAMPLES</span><strong id="logSamples">0</strong></div>
      <div class="perf-log-card"><span>DOM</span><strong id="logDom">--</strong></div>
      <div class="perf-log-card"><span>AVG FPS</span><strong id="logAvgFps">--</strong></div>
      <div class="perf-log-card"><span>MIN FPS</span><strong id="logMinFps">--</strong></div>
      <div class="perf-log-card"><span>AVG FRAME</span><strong id="logAvgFrame">--</strong></div>
      <div class="perf-log-card"><span>MAX FRAME</span><strong id="logMaxFrame">--</strong></div>
      <div class="perf-log-card"><span>MAX INPUT</span><strong id="logMaxInput">--</strong></div>
      <div class="perf-log-card"><span>LONG TASK</span><strong id="logLong">--</strong></div>
    </div>
    <div id="logCondition" class="perf-log-condition"><b>STATE</b> READY</div>
    <div class="perf-log-table-wrap">
      <table class="perf-log-table" aria-label="直近計測サンプル">
        <thead><tr><th>t</th><th>FPS</th><th>Frame</th><th>Input</th><th>State</th></tr></thead>
        <tbody id="logRows"><tr><td colspan="5" style="text-align:center;color:#666">NO DATA</td></tr></tbody>
      </table>
    </div>
    <div class="perf-log-foot">1秒間隔で採取。LOG STOP後、このパネル全体をスクリーンショットしてChatGPTへ貼付する。</div>`;

  const controls=document.querySelector('.test-controls');
  controls.insertAdjacentElement('afterend',panel);

  const els={
    state:document.getElementById('logState'),time:document.getElementById('logTime'),samples:document.getElementById('logSamples'),dom:document.getElementById('logDom'),
    avgFps:document.getElementById('logAvgFps'),minFps:document.getElementById('logMinFps'),avgFrame:document.getElementById('logAvgFrame'),maxFrame:document.getElementById('logMaxFrame'),maxInput:document.getElementById('logMaxInput'),long:document.getElementById('logLong'),condition:document.getElementById('logCondition'),rows:document.getElementById('logRows')
  };

  let recording=false,timer=null,startAt=0,samples=[];
  const num=(text)=>{const n=parseFloat(String(text).replace(/[^0-9.\-]/g,''));return Number.isFinite(n)?n:null;};
  const avg=(arr,key)=>{const v=arr.map(x=>x[key]).filter(Number.isFinite);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null;};
  const min=(arr,key)=>{const v=arr.map(x=>x[key]).filter(Number.isFinite);return v.length?Math.min(...v):null;};
  const max=(arr,key)=>{const v=arr.map(x=>x[key]).filter(Number.isFinite);return v.length?Math.max(...v):null;};

  function stateLabel(){
    const bits=[];
    bits.push(typeof fullLoad!=='undefined'&&fullLoad?'FULL':'NORMAL');
    if(typeof bonusActive!=='undefined'&&bonusActive)bits.push('BONUS');
    if(typeof isSpinning!=='undefined'&&isSpinning)bits.push('REELS');
    if(typeof ledOn!=='undefined')bits.push(ledOn?'LED':'LED-OFF');
    if(typeof displayHeavy!=='undefined'&&displayHeavy)bits.push('DISPLAY');
    return bits.join('+');
  }

  function sample(){
    if(!recording)return;
    const s={
      t:Math.round((performance.now()-startAt)/1000),
      fps:num(document.getElementById('fps').textContent),
      frame:num(document.getElementById('frameMs').textContent),
      input:num(document.getElementById('inputLag').textContent),
      dom:parseInt(document.getElementById('domCount').textContent,10)||0,
      long:parseInt(document.getElementById('longTasks').textContent,10)||0,
      state:stateLabel(),
      bonus:(typeof bonusGet!=='undefined'?bonusGet:0)
    };
    samples.push(s);
    if(samples.length>600)samples.shift();
    render();
  }

  function render(){
    const elapsed=recording?Math.round((performance.now()-startAt)/1000):(samples.length?samples[samples.length-1].t:0);
    els.time.textContent=`${elapsed} s`;els.samples.textContent=samples.length;els.dom.textContent=samples.length?samples[samples.length-1].dom:document.querySelectorAll('*').length;
    const aF=avg(samples,'fps'),miF=min(samples,'fps'),aFr=avg(samples,'frame'),maFr=max(samples,'frame'),maI=max(samples,'input');
    els.avgFps.textContent=aF==null?'--':aF.toFixed(1);els.minFps.textContent=miF==null?'--':miF.toFixed(1);els.avgFrame.textContent=aFr==null?'--':`${aFr.toFixed(1)} ms`;els.maxFrame.textContent=maFr==null?'--':`${maFr.toFixed(1)} ms`;els.maxInput.textContent=maI==null?'--':`${maI.toFixed(1)} ms`;els.long.textContent=samples.length?samples[samples.length-1].long:'--';
    const current=stateLabel();
    els.condition.innerHTML=`<b>STATE</b> ${current} &nbsp; | &nbsp; BONUS GET ${typeof bonusGet!=='undefined'?bonusGet:0}/240 &nbsp; | &nbsp; PAY ${typeof payout!=='undefined'?payout:0}`;
    const recent=samples.slice(-7).reverse();
    els.rows.innerHTML=recent.length?recent.map(s=>`<tr><td>${s.t}s</td><td>${s.fps==null?'--':s.fps.toFixed(1)}</td><td>${s.frame==null?'--':s.frame.toFixed(1)}</td><td>${s.input==null?'--':s.input.toFixed(1)}</td><td class="state">${s.state}</td></tr>`).join(''):`<tr><td colspan="5" style="text-align:center;color:#666">NO DATA</td></tr>`;
  }

  function start(){
    if(recording)return;
    samples=[];startAt=performance.now();recording=true;els.state.textContent='RECORDING';els.state.classList.add('recording');sample();timer=setInterval(sample,1000);
  }
  function stop(){
    if(!recording)return;
    recording=false;clearInterval(timer);timer=null;els.state.textContent='STOPPED';els.state.classList.remove('recording');render();
  }
  function reset(){
    recording=false;if(timer)clearInterval(timer);timer=null;samples=[];startAt=0;els.state.textContent='READY';els.state.classList.remove('recording');render();
  }

  document.getElementById('logStart').addEventListener('click',start);
  document.getElementById('logStop').addEventListener('click',stop);
  document.getElementById('logReset').addEventListener('click',reset);
  render();
})();
