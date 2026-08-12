import { TREASURE_AWARD_PROFILE } from './treasure-award-profile.js?v=step6z-award1';
import { ART_STAGE_PROFILE } from './art-stage-profile.js?v=step6z-stage1';
import { applyTreasureAwardToGoldChanceThreshold } from './treasure-threshold.js?v=step6z-threshold1';

function freshState(){return {normalResolved:0,ikukanResolvedGames:0,lastNormalAward:null,lastIkukanAward:null,lastResult:'IDLE'};}

export function installArtTreasureAwardDebug({core,onChange=()=>{}}={}){
  const gt=core?.goldenTime;if(!gt)return {render:()=>{}};
  if(!gt.__artTreasureAwardDebug){
    gt.__artTreasureAwardDebug=freshState();
    const originalSnapshot=gt.snapshot.bind(gt);
    gt.snapshot=()=>({...originalSnapshot(),artTreasureAwardDebug:{...gt.__artTreasureAwardDebug,policy:'MANUAL_AMOUNT_RESOLUTION_ONLY_NO_SYNTHETIC_DISTRIBUTION'}});
    const originalReset=gt.reset.bind(gt);
    gt.reset=(...args)=>{const out=originalReset(...args);gt.__artTreasureAwardDebug=freshState();return out;};

    gt.resolvePendingNormalTreasureAwardForTest=(points)=>{
      const award=Number(points),min=TREASURE_AWARD_PROFILE.normalTAlignment.minimumPoints,max=TREASURE_AWARD_PROFILE.normalTAlignment.maximumPoints;
      if(gt.state!=='ACTIVE_SET'||gt.pendingTreasureAwardEvents<=0||!Number.isFinite(award)||award<min||award>max)return false;
      const threshold=applyTreasureAwardToGoldChanceThreshold(gt,award,{eventPrefix:'NORMAL_T_DEBUG'});if(!threshold)return false;
      gt.pendingTreasureAwardEvents=Math.max(0,gt.pendingTreasureAwardEvents-1);
      gt.__artTreasureAwardDebug.normalResolved+=1;gt.__artTreasureAwardDebug.lastNormalAward=award;gt.__artTreasureAwardDebug.lastResult=threshold.reachedOneMillion?'NORMAL_T_1M_GOLD_CHANCE_PENDING':'NORMAL_T_APPLIED';
      if(!threshold.reachedOneMillion)gt.lastEvent=`NORMAL_T_DEBUG_PLUS_${award}_PENDING_${gt.pendingTreasureAwardEvents}`;
      return gt.snapshot();
    };

    gt.resolvePendingIkukanTreasureAwardForTest=(points)=>{
      const award=Number(points),min=ART_STAGE_PROFILE.stages.IKUKAN.minimumTreasurePerGame,x=gt.__artTreasureAwardDebug;
      const allowedState=gt.state==='ACTIVE_SET'||gt.state==='IKUKAN_EXIT_PENDING_RETURN_STAGE_MODEL';
      if(!allowedState||gt.ikukanGameCount<=x.ikukanResolvedGames||!Number.isFinite(award)||award<min)return false;
      const threshold=applyTreasureAwardToGoldChanceThreshold(gt,award,{eventPrefix:'IKUKAN_DEBUG'});if(!threshold)return false;
      x.ikukanResolvedGames+=1;x.lastIkukanAward=award;x.lastResult=threshold.reachedOneMillion?'IKUKAN_1M_GOLD_CHANCE_PENDING':'IKUKAN_GAME_APPLIED';
      if(!threshold.reachedOneMillion){
        if(gt.state==='IKUKAN_EXIT_PENDING_RETURN_STAGE_MODEL')gt.state='IKUKAN_EXIT_PENDING_RETURN_STAGE_MODEL';
        else gt.state='ACTIVE_SET';
        gt.lastEvent=`IKUKAN_DEBUG_G${x.ikukanResolvedGames}_PLUS_${award}`;
      }
      return gt.snapshot();
    };
  }

  const gameLog=document.getElementById('log')?.closest('.panel');if(!gameLog)return {render:()=>{}};
  let panel=document.getElementById('artTreasureAwardDebugPanel');
  if(!panel){panel=document.createElement('section');panel.className='panel';panel.id='artTreasureAwardDebugPanel';panel.innerHTML=`<h2>ART TREASURE AWARD / STEP 6Z MANUAL</h2><p class="note">通常T揃いは10万〜100万T、異空間は1G最低5万Tまで確認済み。正確な振り分け表は未回収なので、発生済みイベントの金額だけ手動解決し、100万判定は共通Treasure処理へ渡す。</p><div class="panel-head"><input id="normalTreasureAward" type="number" min="100000" max="1000000" step="50000" value="100000" inputmode="numeric"><button id="normalTreasureAwardApply" type="button" disabled>RESOLVE NEXT NORMAL T</button></div><div class="panel-head"><input id="ikukanTreasureAward" type="number" min="50000" step="50000" value="50000" inputmode="numeric"><button id="ikukanTreasureAwardApply" type="button" disabled>RESOLVE NEXT IKUKAN G</button></div><pre id="artTreasureAwardDebugState">NOT RUN</pre>`;gameLog.parentNode.insertBefore(panel,gameLog);}
  const normalInput=document.getElementById('normalTreasureAward'),normalApply=document.getElementById('normalTreasureAwardApply'),ikukanInput=document.getElementById('ikukanTreasureAward'),ikukanApply=document.getElementById('ikukanTreasureAwardApply'),state=document.getElementById('artTreasureAwardDebugState');
  const render=()=>{const x=gt.snapshot().artTreasureAwardDebug;const canNormal=core.phase==='WAIT_BET'&&gt.state==='ACTIVE_SET'&&gt.pendingTreasureAwardEvents>0;const unresolvedIkukan=Math.max(0,(gt.ikukanGameCount||0)-x.ikukanResolvedGames);const canIkukan=core.phase==='WAIT_BET'&&(gt.state==='ACTIVE_SET'||gt.state==='IKUKAN_EXIT_PENDING_RETURN_STAGE_MODEL')&&unresolvedIkukan>0;if(normalApply)normalApply.disabled=!canNormal;if(ikukanApply)ikukanApply.disabled=!canIkukan;if(state)state.textContent=`CORE STATE       ${gt.state}\nTREASURE         ${gt.treasurePoints}\nNORMAL PENDING   ${gt.pendingTreasureAwardEvents}\nNORMAL RESOLVED  ${x.normalResolved}\nNORMAL LAST      ${x.lastNormalAward??'---'}\nIKUKAN GENERATED ${gt.ikukanGameCount}\nIKUKAN RESOLVED  ${x.ikukanResolvedGames}\nIKUKAN PENDING   ${unresolvedIkukan}\nIKUKAN LAST      ${x.lastIkukanAward??'---'}\nLAST RESULT      ${x.lastResult}\nAUTO AMOUNT      DISABLED`;};
  normalApply?.addEventListener('click',()=>{gt.resolvePendingNormalTreasureAwardForTest(Number(normalInput.value));render();onChange();});
  ikukanApply?.addEventListener('click',()=>{gt.resolvePendingIkukanTreasureAwardForTest(Number(ikukanInput.value));render();onChange();});
  render();return {render};
}
