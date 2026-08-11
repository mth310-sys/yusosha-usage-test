// Step 3A: NORMAL base state only.
// WANTED / RAIUN / HOLD are intentionally not implemented yet.

export class NormalSystem {
  constructor() {
    this.mode = 'NORMAL';
    this.gameCount = 0;
  }

  completeGame() {
    this.gameCount += 1;
    return this.snapshot();
  }

  snapshot() {
    return {
      mode:this.mode,
      gameCount:this.gameCount
    };
  }
}
