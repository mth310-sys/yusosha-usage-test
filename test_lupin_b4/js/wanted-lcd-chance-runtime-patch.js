// Natural WANTED CHANCE LCD chance-eye generation using the already verified Step 6U table.
// Visual step-up/hold-change presentation remains UNVERIFIED; this patch only generates
// the verified blue/red/7 chance holds and their verified hit destinations.
import { NormalSystem } from './normal.js?v=step6w';
import { rollLcdChance } from './lcd-chance-profile.js?v=step6u';

function makeWantedHold(normal){
  const queue=normal?.holdQueue;
  if(!queue)return null;
  const hit=rollLcdChance('WANTED_CHANCE',normal.rng);
  if(!hit)return queue.createHold('NORMAL','VERIFIED_WANTED_LCD_CHANCE_AUTO');
  return queue.createHold(hit.holdType,'VERIFIED_WANTED_LCD_CHANCE_AUTO',{
    lcdChance:{
      key:hit.key,
      mode:hit.mode,
      won:Boolean(hit.won),
      destination:hit.destination??null,
      denominator:hit.denominator,
      expectationPct:hit.expectationPct,
      source:hit.source
    }
  });
}

function seedWantedQueue(normal){
  const queue=normal?.holdQueue;
  if(!queue||!Number.isInteger(queue.capacity)||queue.capacity<=0)return false;
  queue.items=[];
  for(let i=0;i<queue.capacity;i+=1){
    const hold=makeWantedHold(normal);
    if(!hold)return false;
    queue.items.push(hold);
  }
  return true;
}

function replaceNewestRefill(normal){
  const queue=normal?.holdQueue;
  if(!queue||!queue.items.length)return false;
  const newest=queue.items[queue.items.length-1];
  if(newest?.type!=='NORMAL'||newest?.source!=='BASE')return false;
  const hold=makeWantedHold(normal);
  if(!hold)return false;
  queue.items[queue.items.length-1]=hold;
  return true;
}

if(!NormalSystem.prototype.__wantedLcdChanceRuntimePatched){
  const originalStartWantedChance=NormalSystem.prototype.startWantedChance;
  NormalSystem.prototype.startWantedChance=function startWantedChanceWithNaturalLcd(...args){
    const out=originalStartWantedChance.apply(this,args);
    seedWantedQueue(this);
    this.wantedLcdChanceSource='VERIFIED_WANTED_LCD_CHANCE_APPEARANCE_EXPECTATION_DESTINATION_TABLE';
    return out;
  };

  const originalCompleteGame=NormalSystem.prototype.completeGame;
  NormalSystem.prototype.completeGame=function completeGameWithNaturalWantedLcd(...args){
    const wasWanted=this.mode==='WANTED_CHANCE';
    const out=originalCompleteGame.apply(this,args);
    if(wasWanted&&this.mode==='WANTED_CHANCE'&&this.holdQueue){
      replaceNewestRefill(this);
      return this.snapshot();
    }
    return out;
  };

  NormalSystem.prototype.__wantedLcdChanceRuntimePatched=true;
}
