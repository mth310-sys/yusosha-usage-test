// Step 2 physical-reel mechanism test.
// Exact B4 reel strips are not yet verified, so non-MB stop patterns are PROVISIONAL.

const MISS_SYMBOLS = ['LUPIN','JIGEN','GOEMON','BAR','CHERRY','COIN','REPLAY'];

function missTriplet(rng) {
  return [0,1,2].map(() => MISS_SYMBOLS[Math.floor(rng.next() * MISS_SYMBOLS.length)]);
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
  }

  start(role) {
    this.reset();
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

  snapshot() {
    return {
      spinning:[...this.spinning],
      stopped:[...this.stopped],
      result:[...this.result],
      stopOrder:[...this.stopOrder]
    };
  }
}
