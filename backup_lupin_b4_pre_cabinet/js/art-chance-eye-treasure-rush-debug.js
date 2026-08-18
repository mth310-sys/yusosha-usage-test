import { ART_CHANCE_EYE_TREASURE_RUSH_PROFILE, getArtChanceEyeTreasureRushRow } from './art-chance-eye-treasure-rush-profile.js?v=step6z-ce1';

function freshState(){return {key:null,result:'IDLE',source:null};}

export function installArtChanceEyeTreasureRushDebug({core,onChange=()=>{}}={}){
  const gt=core?.goldenTime;if(!gt)return {render:()=>{}};
  if(!gt.__artChanceEyeTreasureRushDebug){
    gt.__artChanceEyeTreasureRushDebug=freshState();
    const originalSnapshot=gt.snapshot.bind(gt);
    gt.snapshot=()=>({...originalSnapshot(),artChanceEyeTreasureRushDebug:{...gt.__artChanceEyeTreasureRushDebug,profile:ART_CHANCE_EYE_TREASURE_RUSH_PROFILE}});
    const originalReset=gt.reset.bind(gt);
    gt.reset=(...args)=>{const out=originalReset(...args);gt.__artChanceEyeTreasureRushDebug=freshState();return out;};
    gt.resolveArtChanceEyeTreasureRushForTest=(key,hit)=>{
      const row=getArtChanceEyeTreasureRushRow(key);
      if(gt.state!=='ACTIVE_SET'||!row)return false;
      const x=gt.__artChanceEyeTreasureRushDebug;
      x.key=key;x.source=`ART_CHANCE_EYE_${key}`;
      if(!hit){x.result='MISS_RETURN_ACTIVE_SET';gt.lastEvent=`ART_CHANCE_EYE_${key}_TREASURE_RUSH_MISS_DEBUG`;return gt.snapshot();}
      x.result='HIT_TREASURE_RUSH_DURATION_PENDING';
      gt.__treasureRushPendingSource=`ART_CHANCE_EYE_${key}_VERIFIED_PRECURSOR_DEBUG_HIT`;
      gt.state='TREASURE_RUSH_DURATION_PENDING';
      gt.lastEvent=`ART_CHANCE_EYE_${key}_TREASURE_RUSH_HIT_DURATION_PENDING`;
      return gt.snapshot();
    };
  }

  const gameLog=document.getElementById('log')?.closest('.panel');if(!gameLog)return {render:()=>{}};
  let panel=document.getElementById('artChanceEyeTreasureRushDebugPanel');
  if(!panel){
    panel=document.createElement('section');panel.className='panel';panel.id='artChanceEyeTreasureRushDebugPanel';
    panel.innerHTML=`<h2>ART CHANCE-EYE → TREASURE RUSH / STEP 6Z</h2><p class="note">ART中チャンス目からTreasure RUSH前兆へ進む導線を接続。種類別の正確なRUSH当選率は画像表未回収なので、チャンス目発生後のHIT/MISSだけ手動解決する。HIT後はTreasure RUSHのDURATION PENDINGへ直結。</p><div class="panel-head"><select id="artChanceEyeKey"><option value="WEAK_BLUE">BLUE EVEN / 弱</option><option value="MIDDLE_RED">RED ODD / 中以上</option><option value="STRONG_7">7 / 強</option></select><button id="artChanceEyeMiss" type="button">MISS</button><button id="artChanceEyeHit" type="button">HIT → RUSH PENDING</button></div><pre id="artChanceEyeTreasureRushState">NOT RUN</pre>`;
    gameLog.parentNode.insertBefore(panel,gameLog);
  }
  const key=document.getElementById('artChanceEyeKey'),miss=document.getElementById('artChanceEyeMiss'),hit=document.getElementById('artChanceEyeHit'),state=document.getElementById('artChanceEyeTreasureRushState');
  const render=()=>{const x=gt.snapshot().artChanceEyeTreasureRushDebug;const canResolve=core.phase==='WAIT_BET'&&gt.state==='ACTIVE_SET';if(miss)miss.disabled=!canResolve;if(hit)hit.disabled=!canResolve;if(state)state.textContent=`CORE STATE  ${gt.state}\nLAST KEY    ${x.key??'---'}\nRESULT      ${x.result}\nSOURCE      ${x.source??'---'}\nBLUE RATE   UNRESOLVED\nRED RATE    UNRESOLVED / MEANINGFULLY HOT\n7 RATE      UNRESOLVED / HOT OR HIGHER\nAUTO DRAW   DISABLED`;};
  miss?.addEventListener('click',()=>{gt.resolveArtChanceEyeTreasureRushForTest(key.value,false);render();onChange();});
  hit?.addEventListener('click',()=>{gt.resolveArtChanceEyeTreasureRushForTest(key.value,true);render();onChange();});
  render();return {render};
}
