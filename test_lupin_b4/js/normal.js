import { drawWantedInitialZone } from './wanted-profile.js?v=step3e';

// Step 3E: NORMAL + WANTED target window + WANTED CHANCE base gameplay.
// Public analysis confirms WANTED CHANCE expands the hold display to 8.
// Success lottery / exit condition / exact intra-band entry timing are not implemented yet.
export class NormalSystem {
  constructor(rng) {
    this.mode = 'NORMAL';
    this.gameCount = 0;
    this.wantedCount = 0;
    this.wantedCycle = 'INITIAL';
    this.wantedTargetZone = drawWantedInitialZone(rng);
    this.wantedState = 'COUNTING';
    this.wantedEntrySource = null;
    this.wantedChanceGameCount = 0;
    this.holdCapacity = null;
    this.lastEvent = null;
  }

  completeGame() {
    this.lastEvent = null;
    this.gameCount += 1;

    if (this.mode === 'NORMAL') {
      this.wantedCount += 1;

      if (this.wantedState === 'COUNTING' && this.wantedCount >= this.wantedTargetZone.min) {
        this.wantedState = 'ARMED';
      }

      if (this.wantedCount >= this.wantedTargetZone.max) {
        this.mode = 'WANTED_CHANCE';
        this.wantedState = 'ACTIVE';
        this.wantedEntrySource = 'PROVISIONAL_WINDOW_END';
        this.wantedChanceGameCount = 0;
        this.holdCapacity = 8;
        this.lastEvent = 'WANTED_CHANCE_START';
      }
    } else if (this.mode === 'WANTED_CHANCE') {
      this.wantedChanceGameCount += 1;
      this.holdCapacity = 8;
      this.lastEvent = 'WANTED_CHANCE_GAME';
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
      wantedChanceGameCount:this.wantedChanceGameCount,
      holdCapacity:this.holdCapacity,
      lastEvent:this.lastEvent
    };
  }
}
