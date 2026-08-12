import { TREASURE_HUNT_PROFILE, getTreasureHuntHoldGuarantee, getTreasureHuntScenario } from './treasure-hunt-profile.js?v=step6z-th1';

function freshState(){return {active:false,scenario:null,hold:null,result:'IDLE',destination:null,awardPoints:null,artStock:false,source:null};}

export function installTreasureHuntDebug({core,onChange=()=>{}}={}){
  const gt=core?.goldenTime;
  if(!gt)return {render:()=>{}};
  if(!gt.__treasureHuntDebug){
    gt.__treasureHuntDebug=freshState();
    const originalSnapshot=gt.snapshot.bind(gt);
    gt.snapshot=()=>({...originalSnapshot(),treasureHuntDebug:{...gt.__treasureHuntDebug,profile:TREASURE_HUNT_PROFILE,policy:'DEBUG_MANUAL_ONLY_NO_SYNTHETIC_ENTRY_SUCCESS_OR_DESTINATION_SPLIT'}});
    const originalReset=gt.reset.bind(gt);
    gt.reset=(...args)=>{const out=originalReset(...args);gt.__treasureHuntDebug=freshState();return out;};

    gt.startTreasureHuntForTest=(scenario='BRIDGE_JUMP',hold=null)=>{
      if(gt.state!=='ACTIVE_SET'||!getTreasureHuntScenario(scenario))return false;
      if(hold&&!getTreasureHuntHoldGuarantee(hold))return false;
      gt.__treasureHuntDebug={active:true,scenario,hold,result:'ACTIVE',destination:null,awardPoints:null,artStock:false,source:'DEBUG_MANUAL_TREASURE_HUNT'};
      gt.state='TREASURE_HUNT_DEBUG_ACTIVE';
      gt.lastEvent=`TREASURE_HUNT_DEBUG_START_${scenario}${hold?`_${hold}`:''}`;
      return gt.snapshot();
    };

    gt.resolveTreasureHuntForTest=({success,destination='TREASURE',awardPoints=null,artStock=false}={})=>{
      const x=gt.__treasureHuntDebug;if(gt.state!=='TREASURE_HUNT_DEBUG_ACTIVE'||!x.active)return false;
      const guarantee=x.hold?getTreasureHuntHoldGuarantee(x.hold):null;
      const scenario=getTreasureHuntScenario(x.scenario);
      if((guarantee?.successGuaranteed||scenario?.successGuaranteesTreasureRush)&&success===false)return false;
      if(!success){x.active=false;x.result='FAIL';gt.state='ACTIVE_SET';gt.lastEvent='TREASURE_HUNT_DEBUG_FAIL_RETURN_ACTIVE_SET';return gt.snapshot();}
      if(scenario?.successGuaranteesTreasureRush&&destination!=='TREASURE_RUSH')return false;
      if(destination==='TREASURE_RUSH'){
        x.active=false;x.result='SUCCESS';x.destination='TREASURE_RUSH';x.artStock=Boolean(artStock);
        gt.state='ACTIVE_SET';gt.lastEvent='TREASURE_HUNT_DEBUG_SUCCESS_TREASURE_RUSH_READY_FOR_MANUAL_RUSH_START';
        if(artStock)gt.recordStockAdd?.(1,'TREASURE_HUNT_IMMORTAL_BOND_DEBUG_STOCK');
        return gt.snapshot();
      }
      const award=Number(awardPoints);const floor=guarantee?.minimumTreasurePoints??0;
      if(!Number.isFinite(award)||award<floor||award<0)return false;
      x.active=false;x.result='SUCCESS';x.destination='TREASURE';x.awardPoints=award;x.artStock=Boolean(artStock);
      gt.treasurePoints=(Number(gt.treasurePoints)||0)+award;
      if(artStock)gt.recordStockAdd?.(1,'TREASURE_HUNT_DEBUG_STOCK');
      gt.state='ACTIVE_SET';gt.lastEvent=`TREASURE_HUNT_DEBUG_SUCCESS_TREASURE_PLUS_${award}`;
      return gt.snapshot();
    };
  }
  return {render:()=>{onChange();}};
}
