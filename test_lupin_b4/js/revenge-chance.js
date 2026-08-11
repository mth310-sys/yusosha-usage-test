import { REVENGE_CHANCE_PROFILE } from './revenge-chance-profile.js?v=step6m';

export class RevengeChanceSystem {
  constructor(){this.reset();}
  reset(){this.state='IDLE';this.source=null;this.gameCount=0;this.remainingGames=null;this.result='UNRESOLVED';this.destination=null;this.lastEvent=null;}
  offer(source='TREASURE_BATTLE_LOSE'){if(this.state!=='IDLE')return false;this.state='ENTRY_PENDING_UNVERIFIED_RATE';this.source=source;this.lastEvent='REVENGE_CHANCE_ENTRY_RATE_UNVERIFIED';return true;}
  startForTest(){if(this.state!=='ENTRY_PENDING_UNVERIFIED_RATE')return false;this.state='ACTIVE';this.gameCount=0;this.remainingGames=REVENGE_CHANCE_PROFILE.games;this.result='UNRESOLVED';this.lastEvent='REVENGE_CHANCE_START_10G_DEBUG_ENTRY';return true;}
  skipForTest(){if(this.state!=='ENTRY_PENDING_UNVERIFIED_RATE')return false;this.state='FAIL';this.result='NO_ENTRY';this.remainingGames=0;this.lastEvent='REVENGE_CHANCE_SKIPPED_ENTRY_RATE_UNVERIFIED';return true;}
  resolveForTest(destination){if(this.state!=='ACTIVE'||!REVENGE_CHANCE_PROFILE.successDestinations.includes(destination))return false;this.state='SUCCESS';this.result='SUCCESS';this.destination=destination;this.lastEvent=`REVENGE_CHANCE_SUCCESS_${destination}_DEBUG_ROUTE`;return true;}
  completeGame(){if(this.state!=='ACTIVE')return this.snapshot();this.gameCount+=1;this.remainingGames=Math.max(0,REVENGE_CHANCE_PROFILE.games-this.gameCount);if(this.remainingGames===0){this.state='FAIL';this.result='FAIL';this.lastEvent='REVENGE_CHANCE_10G_EXPIRED';}else this.lastEvent='REVENGE_CHANCE_GAME';return this.snapshot();}
  snapshot(){return{state:this.state,source:this.source,gameCount:this.gameCount,remainingGames:this.remainingGames,result:this.result,destination:this.destination,lastEvent:this.lastEvent,profile:REVENGE_CHANCE_PROFILE};}
}
