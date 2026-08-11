import { drawWantedInitialZone } from './wanted-profile.js?v=step3h';
import { HoldQueue } from './hold-queue.js?v=step3h';

const DIRECT_ZONE_EVENTS = new Set(['DOROBO_ZONE','FUJIKO_ZONE','SEVEN_ZONE']);

// Step 3H: verified HOLD consumption now drives real mode transitions for known zone holds.
// LB/GT and PREMIUM holds remain pending reservations until those destination systems exist.
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
    this.holdQueue = null;
    this.lastConsumedHold = null;
    this.pendingReward = null;
    this.transitionSource = null;
    this.lastEvent = null;
  }

  closeWantedHolds() {
    this.holdCapacity = null;
    this.holdQueue = null;
  }

  applyConsumedHold(hold) {
    if (!hold?.reservedEvent) return false;

    if (DIRECT_ZONE_EVENTS.has(hold.reservedEvent)) {
      this.mode = hold.reservedEvent;
      this.wantedState = 'SUSPENDED';
      this.transitionSource = `HOLD_${hold.type}`;
      this.pendingReward = null;
      this.closeWantedHolds();
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
      if (!this.applyConsumedHold(this.lastConsumedHold)) {
        this.lastEvent = 'WANTED_CHANCE_HOLD_CONSUME';
      }
    } else {
      // Destination gameplay is intentionally deferred to later steps.
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
      lastEvent:this.lastEvent
    };
  }
}
