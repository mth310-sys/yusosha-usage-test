// Step 3F: HOLD queue skeleton for WANTED CHANCE.
// Contents are intentionally NORMAL placeholders until verified hold distributions are implemented.

export class HoldQueue {
  constructor(capacity = 8) {
    this.capacity = capacity;
    this.nextId = 1;
    this.items = [];
  }

  createPlaceholder() {
    return {
      id:this.nextId++,
      type:'NORMAL',
      source:'PLACEHOLDER_UNVERIFIED'
    };
  }

  fill() {
    while (this.items.length < this.capacity) {
      this.items.push(this.createPlaceholder());
    }
    return this.snapshot();
  }

  consumeAndRefill() {
    if (!this.items.length) this.fill();
    const consumed = this.items.shift() ?? null;
    this.items.push(this.createPlaceholder());
    return {
      consumed:consumed ? { ...consumed } : null,
      queue:this.snapshot()
    };
  }

  snapshot() {
    return this.items.map(item => ({ ...item }));
  }
}
