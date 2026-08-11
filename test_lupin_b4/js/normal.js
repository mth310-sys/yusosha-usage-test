import { drawWantedInitialZone } from './wanted-profile.js?v=step3c';

// Step 3C: NORMAL + WANTED counter + verified initial target-zone draw.
// WANTED CHANCE entry itself is intentionally not implemented yet.
export class NormalSystem {
  constructor(rng) {
    this.mode = 'NORMAL';
    this.gameCount = 0;
    this.wantedCount = 0;
    this.wantedCycle = 'INITIAL';
    this.wantedTargetZone = drawWantedInitialZone(rng);
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
      wantedCount:this.wantedCount,
      wantedCycle:this.wantedCycle,
      wantedTargetZone:{ ...this.wantedTargetZone }
    };
  }
}
