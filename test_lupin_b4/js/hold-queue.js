import { getHoldDefinition } from './hold-profile.js?v=step6u';

// Step 6U: HOLD queue + verified hold catalog + automatic LCD chance-eye outcomes.
export class HoldQueue {
  constructor(capacity = 8) { this.capacity=capacity;this.nextId=1;this.items=[]; }
  createHold(type='NORMAL',sourceOverride=null,metadata=null){const def=getHoldDefinition(type);return {id:this.nextId++,...def,source:sourceOverride??def.source,...(metadata??{})};}
  fill(){while(this.items.length<this.capacity)this.items.push(this.createHold('NORMAL'));return this.snapshot();}
  injectNext(type,sourceOverride='DEBUG_INJECT',metadata=null){if(!this.items.length)this.fill();this.items[0]=this.createHold(type,sourceOverride,metadata);return {...this.items[0]};}
  consumeAndRefill(){if(!this.items.length)this.fill();const consumed=this.items.shift()??null;this.items.push(this.createHold('NORMAL'));return {consumed:consumed?{...consumed}:null,queue:this.snapshot()};}
  snapshot(){return this.items.map(item=>({...item}));}
}
