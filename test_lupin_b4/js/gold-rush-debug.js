import { GOLD_RUSH_PROFILE, getGoldRushBreakthroughMinimumStocks, rollGoldRushContinuation } from './extra-bonus-profile.js?v=step6z-extra3';

const RESULT_STOCK_FLOORS=Object.freeze({
  NORMAL_RED:GOLD_RUSH_PROFILE.redAlignmentMinimumStocks,
  ABSOLUTE_BREAKTHROUGH:getGoldRushBreakthroughMinimumStocks('ABSOLUTE_BREAKTHROUGH'),
  LIMIT_BREAKTHROUGH:getGoldRushBreakthroughMinimumStocks('LIMIT_BREAKTHROUGH')
});

function freshDebugState(){return {nextResult:null,lastResult:null,lastStocks:null,manualGames:0,lastLedgerBefore:null,lastLedgerAfter:null,lastLedgerDelta:null,lastRushBefore:null,lastRushAfter:null,lastRushDelta:null,ledgerCheck:'NOT_RUN',policy:'ONE_RESULT_PER_G_NO_AUTO_PLUS_ONE_DUPLICATION'};}

export function installGoldRushDebug({core,onChange=()=>{}}={}){
  const gt=core?.goldenTime;
  if(!gt)return {render:()=>{}};
  if(!gt.__goldRushDebugInstalled){
    gt.__goldRushDebugInstalled=true;
    gt.__goldRushDebug=freshDebugState();
    const originalReset=gt.reset.bind(gt);
    gt.reset=(...args)=>{const out=originalReset(...args);gt.__goldRushDebug=freshDebugState();return out;};
    const originalComplete=gt.completeGoldRushGame.bind(gt);
    gt.completeGoldRushGame=()=>{
      const d=gt.__goldRushDebug;
      if(gt.state!=='GOLD_RUSH_ACTIVE'||!d.nextResult)return originalComplete();
      const key=d.nextResult;
      d.nextResult=null;
      const stocks=RESULT_STOCK_FLOORS[key];
      if(!Number.isInteger(stocks)||stocks<1)return originalComplete();
      const ledgerBefore=Number(gt.guaranteedStocks)||0;
      const rushBefore=Number(gt.goldRushStocks)||0;
      gt.goldRushGameCount+=1;
      gt.goldRushStocks+=stocks;
      gt.recordStockAdd(stocks,`GOLD_RUSH_DEBUG_${key}_MIN_${stocks}`);
      const ledgerAfter=Number(gt.guaranteedStocks)||0;
      const rushAfter=Number(gt.goldRushStocks)||0;
      d.lastResult=key;d.lastStocks=stocks;d.manualGames+=1;
      d.lastLedgerBefore=ledgerBefore;d.lastLedgerAfter=ledgerAfter;d.lastLedgerDelta=ledgerAfter-ledgerBefore;
      d.lastRushBefore=rushBefore;d.lastRushAfter=rushAfter;d.lastRushDelta=rushAfter-rushBefore;
      d.ledgerCheck=d.lastLedgerDelta===stocks&&d.lastRushDelta===stocks?'PASS':'MISMATCH';
      if(gt.goldRushGameCount>=GOLD_RUSH_PROFILE.initialGames&&!rollGoldRushContinuation(gt.rng)){
        gt.pendingGoldRush=false;gt.goldRushResult='END_RETURN_EXTRA';
        if((gt.extraRemainingGames??0)>0){gt.state='EXTRA_BONUS_ACTIVE';gt.extraResult='ACTIVE_RESUMED_AFTER_GOLD_RUSH';gt.lastEvent=`GOLD_RUSH_DEBUG_${key}_${stocks}_STOCK_END_RESUME_EXTRA_LEDGER_${d.ledgerCheck}`;return gt.snapshot();}
        return gt.finishExtraToGuaranteedNextSet();
      }
      gt.lastEvent=`GOLD_RUSH_DEBUG_${key}_${stocks}_STOCK_CONTINUE_LEDGER_${d.ledgerCheck}`;
      return gt.snapshot();
    };
  }
  const gameLog=document.getElementById('log')?.closest('.panel');
  if(!gameLog)return {render:()=>{}};
  let panel=document.getElementById('goldRushDebugPanel');
  if(!panel){
    panel=document.createElement('section');panel.className='panel';panel.id='goldRushDebugPanel';
    panel.innerHTML=`<h2>GOLD RUSH / STEP 6Z MANUAL RESULT</h2><p class="note">1Gにつき赤図柄結果を1回だけ指定する。通常/絶対突破は最低1個、限界突破は最低2個。突破選択率と2個超の振り分けは未回収のため自動抽選しない。指定しない場合は従来の最低+1処理。手動結果はARTストック台帳とRUSH内獲得数の両方を差分検証する。</p><div class="panel-head"><button id="goldRushNormalRed" type="button">NEXT G NORMAL RED / +1</button><button id="goldRushAbsolute" type="button">NEXT G 絶対突破 / +1+</button><button id="goldRushLimit" type="button">NEXT G 限界突破 / +2+</button></div><pre id="goldRushDebugState">NOT RUN</pre>`;
    gameLog.parentNode.insertBefore(panel,gameLog);
  }
  const normal=document.getElementById('goldRushNormalRed'),absolute=document.getElementById('goldRushAbsolute'),limit=document.getElementById('goldRushLimit'),state=document.getElementById('goldRushDebugState');
  const choose=key=>{if(core.phase!=='WAIT_BET'||gt.state!=='GOLD_RUSH_ACTIVE')return;gt.__goldRushDebug.nextResult=key;render();onChange();};
  normal?.addEventListener('click',()=>choose('NORMAL_RED'));absolute?.addEventListener('click',()=>choose('ABSOLUTE_BREAKTHROUGH'));limit?.addEventListener('click',()=>choose('LIMIT_BREAKTHROUGH'));
  const render=()=>{const d=gt.__goldRushDebug,enabled=core.phase==='WAIT_BET'&&gt.state==='GOLD_RUSH_ACTIVE';if(normal)normal.disabled=!enabled;if(absolute)absolute.disabled=!enabled;if(limit)limit.disabled=!enabled;if(state)state.textContent=`STATE        ${gt.state}\nRUSH GAME    ${gt.goldRushGameCount}\nNEXT RESULT  ${d.nextResult??'AUTO MIN +1'}\nLAST RESULT  ${d.lastResult??'---'}\nLAST STOCKS  ${d.lastStocks??'---'}\nLEDGER       ${d.lastLedgerBefore??'---'} → ${d.lastLedgerAfter??'---'} / Δ${d.lastLedgerDelta??'---'}\nRUSH STOCKS  ${d.lastRushBefore??'---'} → ${d.lastRushAfter??'---'} / Δ${d.lastRushDelta??'---'}\nLEDGER CHECK ${d.ledgerCheck}\nMANUAL G     ${d.manualGames}\nPOLICY       ${d.policy}\nSELECTION    UNRESOLVED / MANUAL ONLY\nMULTI STOCK  UNRESOLVED / FLOOR ONLY`;};
  render();return {render};
}
