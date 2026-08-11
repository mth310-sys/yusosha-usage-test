import { drawWantedInitialZone } from './wanted-profile.js?v=step4a';
import { HoldQueue } from './hold-queue.js?v=step4a';
import { drawCzLength } from './cz-profile.js?v=step4a';

const DIRECT_ZONE_EVENTS = new Set(['DOROBO_ZONE','FUJIKO_ZONE','SEVEN_ZONE']);

// Step 4A: DOROBO_ZONE gets a real CZ game container with verified 10G/20G duration draw.
// CZ success lottery is intentionally not implemented yet.
export class NormalSystem {
  constructor(rng, setting = 1) {
    this.rng = rng;
    this.setting = Number(setting);
    this.mode = 'NORMAL';
    this.gameCount = 0;
    this.wantedCount = 0;
    this.wantedCycle = 'INITIAL';
    this.wantedTargetZone = drawWantedInitialZone(rng);
    this.wantedState = 'COUNTING';
    this.wantedEntrySource = null;
    this.wantedChanceGameCount = 0;
    this.holdCapacity = null;
    this.holdQueue = null;
    this.lastConsumedHold = null;
    this.pendingReward = null;
    this.transitionSource = null;
    this.cz = null;
    this.lastEvent = null;
  }

  setSetting(setting) {
    this.setting = Number(setting);
  }

  closeWantedHolds() {
    this.holdCapacity = null;
    this.holdQueue = null;
  }

  startDoroboZone(source) {
    const totalGames = drawCzLength(this.setting, this.rng);
    this.mode = 'DOROBO_ZONE';
    this.cz = {
      type:'DOROBO_ZONE',
      state:'ACTIVE',
      gameCount:0,
      totalGames,
      remainingGames:totalGames,
      lengthSource:'VERIFIED_SETTING_TABLE',
      transitionSource:source
    };
  }

  applyConsumedHold(hold) {
    if (!hold?.reservedEvent) return false;

    if (DIRECT_ZONE_EVENTS.has(hold.reservedEvent)) {
      this.wantedState = 'SUSPENDED';
      this.transitionSource = `HOLD_${hold.type}`;
      this.pendingReward = null;
      this.closeWantedHolds();

      if (hold.reservedEvent === 'DOROBO_ZONE') {
        this.startDoroboZone(this.transitionSource);
      } else {
        this.mode = hold.reservedEvent;
        this.cz = null;
      }

      this.lastEvent = `ENTER_${hold.reservedEvent}`;
      return true;
    }

    this.pendingReward = {
      type:hold.reservedEvent,
      source:`HOLD_${hold.type}`,
      guarantee:hold.guarantee,
      status:'PENDING_DESTINATION_IMPLEMENTATION'
    };
    this.transitionSource = `HOLD_${hold.type}`;
    this.lastEvent = `RESERVE_${hold.reservedEvent}`;
    return true;
  }

  completeGame() {
    this.lastEvent = null;
    this.lastConsumedHold = null;
    this.gameCount += 1;

    if (this.mode === 'NORMAL') {
      this.wantedCount += 1;
      if (this.wantedState === 'COUNTING' && this.wantedCount >= this.wantedTargetZone.min) this.wantedState = 'ARMED';
      if (this.wantedCount >= this.wantedTargetZone.max) {
        this.mode = 'WANTED_CHANCE';
        this.wantedState = 'ACTIVE';
        this.wantedEntrySource = 'PROVISIONAL_WINDOW_END';
        this.wantedChanceGameCount = 0;
        this.holdCapacity = 8;
        this.holdQueue = new HoldQueue(this.holdCapacity);
        this.holdQueue.fill();
        this.lastEvent = 'WANTED_CHANCE_START';
      }
    } else if (this.mode === 'WANTED_CHANCE') {
      this.wantedChanceGameCount += 1;
      this.holdCapacity = 8;
      if (!this.holdQueue) {
        this.holdQueue = new HoldQueue(this.holdCapacity);
        this.holdQueue.fill();
      }
      const holdResult = this.holdQueue.consumeAndRefill();
      this.lastConsumedHold = holdResult.consumed;
      if (!this.applyConsumedHold(this.lastConsumedHold)) this.lastEvent = 'WANTED_CHANCE_HOLD_CONSUME';
    } else if (this.mode === 'DOROBO_ZONE') {
      if (this.cz?.state === 'ACTIVE') {
        this.cz.gameCount += 1;
        this.cz.remainingGames = Math.max(0, this.cz.totalGames - this.cz.gameCount);
        if (this.cz.remainingGames === 0) {
          this.cz.state = 'END_PENDING_SUCCESS_ROUTING';
          this.lastEvent = 'DOROBO_ZONE_END_PENDING';
        } else {
          this.lastEvent = 'DOROBO_ZONE_GAME';
        }
      } else {
        this.lastEvent = 'DOROBO_ZONE_END_PENDING';
      }
    } else {
      this.lastEvent = `${this.mode}_GAME_UNIMPLEMENTED`;
    }
    return this.snapshot();
  }

  injectHoldForTest(type) {
    if (this.mode !== 'WANTED_CHANCE' || !this.holdQueue) return false;
    this.holdQueue.injectNext(type);
    this.lastEvent = `DEBUG_HOLD_INJECT_${type}`;
    return true;
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
      holdQueue:this.holdQueue ? this.holdQueue.snapshot() : [],
      lastConsumedHold:this.lastConsumedHold ? { ...this.lastConsumedHold } : null,
      pendingReward:this.pendingReward ? { ...this.pendingReward } : null,
      transitionSource:this.transitionSource,
      cz:this.cz ? { ...this.cz } : null,
      lastEvent:this.lastEvent
    };
  }
}
