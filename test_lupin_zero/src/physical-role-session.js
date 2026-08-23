import { resolveNormalRole } from './normal-role-resolver.js';
import { adaptNormalRoleForProduction } from './normal-role-production-adapter.js';
import { VERIFIED_SPEC } from './verified-spec.js';

const MB_STOP = Object.freeze([...VERIFIED_SPEC.mb.stopSymbols]);
const RUPIN_REPLAY_TARGET_REELS = Object.freeze({
  RUPIN_REPLAY_A: Object.freeze([0]),
  RUPIN_REPLAY_B: Object.freeze([1, 2]),
  RUPIN_REPLAY_C: Object.freeze([0, 2]),
  PREMIUM: Object.freeze([0, 1, 2])
});

export function getPhysicalStopPlan(roleResolution) {
  const role = roleResolution?.role ?? null;
  if (role === 'MB') {
    return Object.freeze({
      role,
      status: VERIFIED_SPEC.evidence.mbStopPattern,
      middleLineSymbols: MB_STOP,
      reversePushCutIn: false,
      targetReelsWithLupinSymbol: Object.freeze([]),
      longFreezeOnLupinAlignment: false,
      exactLupinStopRowKnown: true,
      exactFullReelPositionsKnown: false,
      note: 'Published MB middle-line stop pattern only; complete strips remain unresolved.'
    });
  }

  const targetReels = RUPIN_REPLAY_TARGET_REELS[role] ?? null;
  if (targetReels) {
    const isD = role === 'PREMIUM';
    return Object.freeze({
      role,
      status: VERIFIED_SPEC.evidence.rupinReplayStopPatterns,
      middleLineSymbols: null,
      reversePushCutIn: true,
      targetReelsWithLupinSymbol: targetReels,
      longFreezeOnLupinAlignment: isD,
      exactLupinStopRowKnown: false,
      exactFullReelPositionsKnown: false,
      note: isD
        ? 'RUPIN REPLAY D: published three-reel Lupin-symbol alignment and long-freeze consequence; exact stop row and full strips remain unresolved.'
        : 'Published RUPIN REPLAY reel-presence pattern only; exact stop row and full strips remain unresolved.'
    });
  }

  return Object.freeze({
    role,
    status: 'UNRESOLVED',
    middleLineSymbols: null,
    reversePushCutIn: false,
    targetReelsWithLupinSymbol: Object.freeze([]),
    longFreezeOnLupinAlignment: false,
    exactLupinStopRowKnown: false,
    exactFullReelPositionsKnown: false,
    note: 'No physical stop pattern is invented for this role.'
  });
}

export class PhysicalRoleSession {
  constructor({ randomSource, setting = 1 } = {}) {
    if (!randomSource || typeof randomSource.nextFloat !== 'function') {
      throw new TypeError('randomSource.nextFloat() is required');
    }
    this.randomSource = randomSource;
    this.setting = setting;
    this.current = null;
  }

  start(spinId) {
    const raw = resolveNormalRole(this.randomSource, this.setting);
    const production = adaptNormalRoleForProduction(raw);
    const stopPlan = getPhysicalStopPlan(production);
    this.current = Object.freeze({ spinId, raw, production, stopPlan });
    return this.current;
  }

  stopSymbol(reelIndex) {
    if (!this.current || !Number.isInteger(reelIndex) || reelIndex < 0 || reelIndex > 2) return null;
    return this.current.stopPlan.middleLineSymbols?.[reelIndex] ?? null;
  }

  hasVerifiedLupinSymbolOnReel(reelIndex) {
    if (!this.current || !Number.isInteger(reelIndex) || reelIndex < 0 || reelIndex > 2) return false;
    return this.current.stopPlan.targetReelsWithLupinSymbol?.includes(reelIndex) ?? false;
  }

  snapshot() {
    return this.current;
  }
}

export const PHYSICAL_ROLE_SESSION_POLICY = Object.freeze({
  roleLotteryRunsEveryNormalGame: true,
  mbPhysicalStopPatternConnected: true,
  rupinReplayReelPresencePatternsConnected: true,
  rupinReplayExactStopRowInvented: false,
  nonMbPhysicalStopPatternsInvented: false,
  completeReelStripsRequiredForExactStops: true
});
