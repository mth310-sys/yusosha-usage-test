import { drawWantedInitialZone } from './wanted-profile.js?v=step4f';
import { HoldQueue } from './hold-queue.js?v=step4f';
import { drawCzLength, drawCzScenario } from './cz-profile.js?v=step4f';
import { RIZE_PROFILE, getRizeConfidence } from './rize-profile.js?v=step4f';

const DIRECT_ZONE_EVENTS = new Set(['DOROBO_ZONE','FUJIKO_ZONE','SEVEN_ZONE']);
const SUPPORTED_CZ_TYPES = new Set(['DOROBO_ZONE','FUJIKO_ZONE']);

// Step 4F: adds RIZE_ZONE as a separate premonition container.
// Published analysis: entry rate about 1/2980.1, overall expectation 44.66%, background confidence tables,
// and SHIN_RIZE as a stronger variant. Duration and background-upgrade probabilities are not verified.
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
    this.rize = null;
    this.lastEvent = null;
  }

  setSetting(setting) { this.setting = Number(setting); }
  closeWantedHolds() { this.holdCapacity = null; this.holdQueue = null; }

  startCz(type, source) {
    if (!SUPPORTED_CZ_TYPES.has(type)) return false;
    const totalGames = drawCzLength(this.setting, this.rng);
    const scenario = drawCzScenario(this.setting, this.rng);
    this.mode = type;
    this.rize = null;
    this.cz = {
      type,
      state:'ACTIVE',
      result:'UNRESOLVED',
      resultSource:null,
      gameCount:0,
      totalGames,
      remainingGames:totalGames,
      scenario,
      lengthSource:'VERIFIED_SETTING_TABLE',
      scenarioSource:'VERIFIED_SETTING_TABLE',
      successModel:'UNIMPLEMENTED_PER_GAME_RATE_UNKNOWN',
      publishedOverallExpectation:type === 'DOROBO_ZONE' ? '39.6-43.2%' : '58.8-63.2%',
      transitionSource:source
    };
    return true;
  }

  startSevenZone(source) {
    this.mode = 'SEVEN_ZONE';
    this.rize = null;
    this.cz = {
      type:'SEVEN_ZONE',
      state:'ART_GUARANTEED',
      result:'SUCCESS',
      resultSource:'VERIFIED_ZONE_ENTRY_GUARANTEE',
      gameCount:null,
      totalGames:null,
      remainingGames:null,
      scenario:null,
      successModel:'GUARANTEED_ON_ENTRY',
      publishedOverallExpectation:'100%',
      transitionSource:source
    };
    this.pendingReward = {
      type:'GOLDEN_TIME',
      source:'SEVEN_ZONE_ENTRY',
      guarantee:'ART_CONFIRMED',
      status:'PENDING_GOLDEN_TIME_IMPLEMENTATION'
    };
    this.lastEvent = 'ENTER_SEVEN_ZONE_ART_GUARANTEED';
  }

  startRizeZone(variant='RIZE', source='DEBUG_ONLY') {
    if (!['RIZE','SHIN_RIZE'].includes(variant)) return false;
    this.mode = 'RIZE_ZONE';
    this.cz = null;
    this.pendingReward = null;
    this.transitionSource = source;
    this.rize = {
      type:'RIZE_ZONE',
      variant,
      state:'ACTIVE_PREMONITION',
      result:'UNRESOLVED',
      resultSource:null,
      background:'BLUE',
      backgroundConfidence:getRizeConfidence(variant,'BLUE'),
      entryRate:variant === 'RIZE' ? `1/${RIZE_PROFILE.entryRate}` : 'UNVERIFIED_VARIANT_ENTRY_RATE',
      publishedOverallExpectation:variant === 'RIZE' ? `${RIZE_PROFILE.overallExpectation}%` : 'BACKGROUND_TABLE_ONLY',
      duration:'UNVERIFIED',
      upgradeModel:'UNVERIFIED',
      transitionSource:source
    };
    this.lastEvent = `ENTER_${variant}`;
    return true;
  }

  setRizeBackgroundForTest(background) {
    if (this.mode !== 'RIZE_ZONE' || !this.rize) return false;
    if (!RIZE_PROFILE.backgrounds.includes(background)) return false;
    this.rize.background = background;
    this.rize.backgroundConfidence = getRizeConfidence(this.rize.variant, background);
    this.lastEvent = `DEBUG_RIZE_BACKGROUND_${background}`;
    return true;
  }

  resolveRizeForTest(result) {
    if (this.mode !== 'RIZE_ZONE' || !this.rize) return false;
    if (!['SUCCESS','FAIL'].includes(result)) return false;
    this.rize.result = result;
    this.rize.resultSource = 'DEBUG_ONLY';
    if (result === 'SUCCESS') {
      this.rize.state = 'SUCCESS_PENDING_DESTINATION';
      this.pendingReward = {
        type:'LB_OR_GT',
        source:`${this.rize.variant}_${this.rize.background}_DEBUG`,
        guarantee:'LB_OR_GT',
        status:'PENDING_DESTINATION_IMPLEMENTATION'
      };
      this.lastEvent = 'DEBUG_RIZE_SUCCESS_ROUTED';
    } else {
      this.rize.state = 'FAIL_PENDING_RETURN';
      this.pendingReward = null;
      this.lastEvent = 'DEBUG_RIZE_FAIL_ROUTED';
    }
    return true;
  }

  resolveCzForTest(result) {
    if (!SUPPORTED_CZ_TYPES.has(this.mode) || !this.cz) return false;
    if (!['SUCCESS','FAIL'].includes(result)) return false;
    this.cz.result = result;
    this.cz.resultSource = 'DEBUG_ONLY';
    this.cz.remainingGames = 0;
    if (result === 'SUCCESS') {
      this.cz.state = 'SUCCESS_PENDING_DESTINATION';
      this.pendingReward = {
        type:'LB_OR_GT',
        source:`${this.cz.type}_NUMBER_ALIGNMENT_DEBUG`,
        guarantee:'LB_OR_GT',
        status:'PENDING_DESTINATION_IMPLEMENTATION'
      };
      this.lastEvent = `DEBUG_${this.cz.type}_SUCCESS_ROUTED`;
    } else {
      this.cz.state = 'FAIL_PENDING_RETURN';
      this.pendingReward = null;
      this.lastEvent = `DEBUG_${this.cz.type}_FAIL_ROUTED`;
    }
    return true;
  }

  applyConsumedHold(hold) {
    if (!hold?.reservedEvent) return false;
    if (DIRECT_ZONE_EVENTS.has(hold.reservedEvent)) {
      this.wantedState = 'SUSPENDED';
      this.transitionSource = `HOLD_${hold.type}`;
      this.pendingReward = null;
      this.closeWantedHolds();
      if (SUPPORTED_CZ_TYPES.has(hold.reservedEvent)) {
        this.startCz(hold.reservedEvent, this.transitionSource);
        this.lastEvent = `ENTER_${hold.reservedEvent}`;
      } else if (hold.reservedEvent === 'SEVEN_ZONE') {
        this.startSevenZone(this.transitionSource);
      }
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
      if (!this.holdQueue) { this.holdQueue = new HoldQueue(this.holdCapacity); this.holdQueue.fill(); }
      const holdResult = this.holdQueue.consumeAndRefill();
      this.lastConsumedHold = holdResult.consumed;
      if (!this.applyConsumedHold(this.lastConsumedHold)) this.lastEvent = 'WANTED_CHANCE_HOLD_CONSUME';
    } else if (SUPPORTED_CZ_TYPES.has(this.mode)) {
      if (this.cz?.state === 'ACTIVE') {
        this.cz.gameCount += 1;
        this.cz.remainingGames = Math.max(0, this.cz.totalGames - this.cz.gameCount);
        if (this.cz.remainingGames === 0) {
          this.cz.state = 'END_PENDING_VERIFIED_SUCCESS_MODEL';
          this.lastEvent = `${this.cz.type}_END_PENDING_MODEL`;
        } else this.lastEvent = `${this.cz.type}_GAME`;
      } else this.lastEvent = `${this.mode}_${this.cz?.state ?? 'UNKNOWN'}`;
    } else if (this.mode === 'SEVEN_ZONE') {
      this.lastEvent = 'SEVEN_ZONE_ART_GUARANTEED_PENDING_GT';
    } else if (this.mode === 'RIZE_ZONE') {
      this.lastEvent = `RIZE_ZONE_${this.rize?.state ?? 'UNKNOWN'}`;
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
      rize:this.rize ? { ...this.rize } : null,
      lastEvent:this.lastEvent
    };
  }
}
