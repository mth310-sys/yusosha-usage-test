// Step 6Z: audit WANTED hold queue: consume exactly one, append exactly one, preserve capacity/order.
import { HoldQueue } from './hold-queue.js?v=step6s';

if(!HoldQueue.prototype.__step6zIntegrityPatched){
  const originalConsume=HoldQueue.prototype.consumeAndRefill;
  HoldQueue.prototype.consumeAndRefill=function(...args){
    const before=this.snapshot();
    const beforeNextId=this.nextId;
    const out=originalConsume.apply(this,args);
    const after=this.snapshot();
    const consumed=out?.consumed??null;
    const capacityValid=before.length===this.capacity&&after.length===this.capacity;
    const consumedHead=!!consumed&&before[0]?.id===consumed.id;
    const orderShiftValid=before.slice(1).every((item,i)=>after[i]?.id===item.id);
    const oneNewTail=after.length>0&&after[after.length-1]?.id===beforeNextId&&this.nextId===beforeNextId+1;
    const uniqueIds=new Set(after.map(x=>x.id));
    const idsUnique=uniqueIds.size===after.length;
    const refillNormal=after[after.length-1]?.type==='NORMAL';
    const resultQueueMatches=Array.isArray(out?.queue)&&out.queue.map(x=>x.id).join('|')===after.map(x=>x.id).join('|');
    const checks={capacityValid,consumedHead,orderShiftValid,oneNewTail,idsUnique,refillNormal,resultQueueMatches};
    const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
    this.lastIntegrity={status:failed.length?'ERROR_HOLD_QUEUE_INTEGRITY':'OK',checks,failed,consumedId:consumed?.id??null,beforeIds:before.map(x=>x.id),afterIds:after.map(x=>x.id),capacity:this.capacity};
    return out;
  };
  const originalSnapshot=HoldQueue.prototype.snapshot;
  HoldQueue.prototype.integritySnapshot=function(){return this.lastIntegrity?{...this.lastIntegrity}:null;};
  HoldQueue.prototype.__step6zIntegrityPatched=true;
}
