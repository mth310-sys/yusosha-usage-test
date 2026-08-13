import { getHoldDefinition } from './hold-profile.js?v=step6u';

// Step 6U: HOLD queue + verified hold catalog + automatic LCD chance-eye outcomes.
export class HoldQueue {
  constructor(capacity = 8) { this.capacity=capacity;this.nextId=1;this.items=[]; }
  createHold(type='NORMAL',sourceOverride=null,metadata=null){const def=getHoldDefinition(type);if(!def)return null;return {id:this.nextId++,...def,source:sourceOverride??def.source,...(metadata??{})};}
  fill(){while(this.items.length<this.capacity){const hold=this.createHold('NORMAL');if(!hold)break;this.items.push(hold);}return this.snapshot();}
  injectNext(type,sourceOverride='DEBUG_INJECT',metadata=null){if(!this.items.length)this.fill();const hold=this.createHold(type,sourceOverride,metadata);if(!hold)return null;this.items[0]=hold;return {...this.items[0]};}
  consumeAndRefill(){if(!this.items.length)this.fill();const consumed=this.items.shift()??null;const refill=this.createHold('NORMAL');if(refill)this.items.push(refill);return {consumed:consumed?{...consumed}:null,queue:this.snapshot()};}
  snapshot(){return this.items.map(item=>({...item}));}
}
