import { getHoldDefinition } from './hold-profile.js?v=step3g';

// Step 3G: HOLD queue + verified hold catalog support.
// Random appearance distributions are intentionally not implemented yet.
export class HoldQueue {
  constructor(capacity = 8) {
    this.capacity = capacity;
    this.nextId = 1;
    this.items = [];
  }

  createHold(type = 'NORMAL', sourceOverride = null) {
    const def = getHoldDefinition(type);
    return {
      id:this.nextId++,
      ...def,
      source:sourceOverride ?? def.source
    };
  }

  fill() {
    while (this.items.length < this.capacity) this.items.push(this.createHold('NORMAL'));
    return this.snapshot();
  }

  injectNext(type) {
    if (!this.items.length) this.fill();
    this.items[0] = this.createHold(type, 'DEBUG_INJECT');
    return { ...this.items[0] };
  }

  consumeAndRefill() {
    if (!this.items.length) this.fill();
    const consumed = this.items.shift() ?? null;
    this.items.push(this.createHold('NORMAL'));
    return { consumed:consumed ? { ...consumed } : null, queue:this.snapshot() };
  }

  snapshot() {
    return this.items.map(item => ({ ...item }));
  }
}
