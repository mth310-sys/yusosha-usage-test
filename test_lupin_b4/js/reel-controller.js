// Step 2 physical-reel mechanism test.
// Exact B4 reel strips are not yet verified, so non-MB stop patterns are PROVISIONAL.

const MISS_SYMBOLS = ['LUPIN','JIGEN','GOEMON','BAR','CHERRY','COIN','REPLAY'];
const KNOWN_ROLE_TRIPLETS = new Set([
  'JIGEN|GOEMON|LUPIN',
  'REPLAY|REPLAY|REPLAY',
  'COIN|COIN|CHERRY',
  'COIN|COIN|COIN',
  'BAR|COIN|COIN'
]);

function missTriplet(rng) {
  // Provisional visual-only MISS pattern. Never let it exactly imitate one of the
  // currently mapped role displays; exact B4 reel strips/control remain unverified.
  for (let attempt=0;attempt<32;attempt+=1) {
    const triplet=[0,1,2].map(() => MISS_SYMBOLS[Math.floor(rng.next() * MISS_SYMBOLS.length)]);
    if(!KNOWN_ROLE_TRIPLETS.has(triplet.join('|')))return triplet;
  }
  return ['LUPIN','BAR','CHERRY'];
}

export class ReelController {
  constructor(rng) {
    this.rng = rng;
    this.reset();
  }

  reset() {
    this.spinning = [false,false,false];
    this.stopped = [false,false,false];
    this.stopOrder = [];
    this.result = ['---','---','---'];
    this.target = ['---','---','---'];
    this.activeRole = null;
  }

  start(role) {
    this.reset();
    this.activeRole = role?.name ?? null;
    this.spinning = [true,true,true];
    this.target = this.makeTarget(role);
  }

  makeTarget(role) {
    switch (role.name) {
      case 'MB': return ['JIGEN','GOEMON','LUPIN']; // verified MB stop-form concept
      case 'REPLAY': return ['REPLAY','REPLAY','REPLAY'];
      case '3COIN': return ['COIN','COIN','CHERRY'];
      case '9COIN': return ['COIN','COIN','COIN'];
      case '10COIN': return ['BAR','COIN','COIN'];
      default: return missTriplet(this.rng);
    }
  }

  stop(index) {
    index = Number(index);
    if (!Number.isInteger(index) || index < 0 || index > 2) return null;
    if (!this.spinning[index] || this.stopped[index]) return null;
    this.spinning[index] = false;
    this.stopped[index] = true;
    this.result[index] = this.target[index];
    this.stopOrder.push(index);
    return this.result[index];
  }

  get allStopped() {
    return this.stopped.every(Boolean);
  }

  integritySnapshot() {
    const uniqueOrder=new Set(this.stopOrder);
    const stopOrderValid=this.stopOrder.every(i=>Number.isInteger(i)&&i>=0&&i<=2)&&uniqueOrder.size===this.stopOrder.length;
    const stoppedCount=this.stopped.filter(Boolean).length;
    const orderCountMatches=stoppedCount===this.stopOrder.length;
    const stoppedMatchTarget=this.result.every((symbol,i)=>this.stopped[i]?symbol===this.target[i]:symbol==='---');
    const allStoppedConsistent=this.allStopped=== (stoppedCount===3);
    const status=stopOrderValid&&orderCountMatches&&stoppedMatchTarget&&allStoppedConsistent?'OK':'ERROR_REEL_STATE_MISMATCH';
    return {status,activeRole:this.activeRole,stopOrderValid,orderCountMatches,stoppedMatchTarget,allStoppedConsistent,stoppedCount};
  }

  snapshot() {
    return {
      spinning:[...this.spinning],
      stopped:[...this.stopped],
      result:[...this.result],
      target:[...this.target],
      stopOrder:[...this.stopOrder],
      activeRole:this.activeRole,
      allStopped:this.allStopped,
      integrity:this.integritySnapshot()
    };
  }
}
