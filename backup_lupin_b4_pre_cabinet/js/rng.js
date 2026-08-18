export class RNG {
  constructor(seed = Date.now()) {
    this.state = (Number(seed) >>> 0) || 0x6d2b79f5;
  }
  next() {
    let x = this.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return this.state / 0x100000000;
  }
}
