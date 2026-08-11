// Step 3B: NORMAL base state + WANTED counter only.
// WANTED CHANCE entry / RAIUN / HOLD are intentionally not implemented yet.

export class NormalSystem {
  constructor() {
    this.mode = 'NORMAL';
    this.gameCount = 0;
    this.wantedCount = 0;
  }

  completeGame() {
    this.gameCount += 1;
    this.wantedCount += 1;
    return this.snapshot();
  }

  snapshot() {
    return {
      mode:this.mode,
      gameCount:this.gameCount,
      wantedCount:this.wantedCount
    };
  }
}
