import { drawWantedInitialZone } from './wanted-profile.js?v=step3d';

// Step 3D: NORMAL + WANTED target window + WANTED CHANCE entry skeleton.
// Public analysis gives a 32G target band, not the exact game inside that band.
// Therefore the temporary entry point is the final game of the selected band and
// is explicitly marked PROVISIONAL_WINDOW_END until exact intra-band data is found.
export class NormalSystem {
  constructor(rng) {
    this.mode = 'NORMAL';
    this.gameCount = 0;
    this.wantedCount = 0;
    this.wantedCycle = 'INITIAL';
    this.wantedTargetZone = drawWantedInitialZone(rng);
    this.wantedState = 'COUNTING';
    this.wantedEntrySource = null;
    this.lastEvent = null;
  }

  completeGame() {
    this.lastEvent = null;

    if (this.mode === 'NORMAL') {
      this.gameCount += 1;
      this.wantedCount += 1;

      if (this.wantedState === 'COUNTING' && this.wantedCount >= this.wantedTargetZone.min) {
        this.wantedState = 'ARMED';
      }

      if (this.wantedCount >= this.wantedTargetZone.max) {
        this.mode = 'WANTED_CHANCE';
        this.wantedState = 'ACTIVE';
        this.wantedEntrySource = 'PROVISIONAL_WINDOW_END';
        this.lastEvent = 'WANTED_CHANCE_START';
      }
    }

    return this.snapshot();
  }

  seekWantedForTest() {
    if (this.mode !== 'NORMAL') return false;
    this.wantedCount = Math.max(0, this.wantedTargetZone.max - 1);
    this.wantedState = this.wantedCount >= this.wantedTargetZone.min ? 'ARMED' : 'COUNTING';
    this.lastEvent = 'DEBUG_WANTED_SEEK';
    return true;
  }

  snapshot() {
    return {
      mode:this.mode,
      gameCount:this.gameCount,
      wantedCount:this.wantedCount,
      wantedCycle:this.wantedCycle,
      wantedTargetZone:{ ...this.wantedTargetZone },
      wantedState:this.wantedState,
      wantedEntrySource:this.wantedEntrySource,
      lastEvent:this.lastEvent
    };
  }
}
