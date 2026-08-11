import { GOLDEN_TIME_PROFILE } from './golden-time-profile.js?v=step6a';

export class GoldenTimeSystem {
  constructor(){
    this.reset();
  }

  reset(){
    this.state='IDLE';
    this.setNo=0;
    this.gameInSet=0;
    this.remainingGames=null;
    this.guaranteedStocks=0;
    this.entrySource=null;
    this.lastEvent=null;
    this.result='UNRESOLVED';
  }

  start({guaranteedStocks=0,source='DEBUG_DIRECT_ENTRY'}={}){
    this.state='ACTIVE_SET';
    this.setNo=1;
    this.gameInSet=0;
    this.remainingGames=GOLDEN_TIME_PROFILE.setGamesApprox;
    this.guaranteedStocks=Math.max(0,Number(guaranteedStocks)||0);
    this.entrySource=source;
    this.lastEvent='GOLDEN_TIME_START';
    this.result='UNRESOLVED';
    return true;
  }

  addStocks(count,source='DEBUG_ONLY'){
    if(this.state==='IDLE')return false;
    const add=Math.max(0,Number(count)||0);
    this.guaranteedStocks+=add;
    this.lastEvent=`GT_STOCK_PLUS_${add}_${source}`;
    return true;
  }

  completeGame(){
    this.lastEvent=null;
    if(this.state!=='ACTIVE_SET'){
      this.lastEvent=`GOLDEN_TIME_${this.state}`;
      return this.snapshot();
    }
    this.gameInSet+=1;
    this.remainingGames=Math.max(0,GOLDEN_TIME_PROFILE.setGamesApprox-this.gameInSet);
    if(this.remainingGames>0){
      this.lastEvent='GOLDEN_TIME_GAME';
      return this.snapshot();
    }
    if(this.guaranteedStocks>0){
      this.guaranteedStocks-=1;
      this.setNo+=1;
      this.gameInSet=0;
      this.remainingGames=GOLDEN_TIME_PROFILE.setGamesApprox;
      this.lastEvent='GOLDEN_TIME_CONTINUE_BY_STOCK';
      return this.snapshot();
    }
    this.state='BATTLE_PENDING_TREASURE_MODEL';
    this.lastEvent='GOLDEN_TIME_SET_END_PENDING_TREASURE_BATTLE';
    return this.snapshot();
  }

  snapshot(){
    return {
      state:this.state,
      setNo:this.setNo,
      gameInSet:this.gameInSet,
      remainingGames:this.remainingGames,
      guaranteedStocks:this.guaranteedStocks,
      entrySource:this.entrySource,
      result:this.result,
      lastEvent:this.lastEvent,
      profile:GOLDEN_TIME_PROFILE
    };
  }
}
