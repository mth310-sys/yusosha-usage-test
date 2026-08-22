import { resolveNormalRole } from './normal-role-resolver.js';
import { adaptNormalRoleForProduction } from './normal-role-production-adapter.js';
import { VERIFIED_SPEC } from './verified-spec.js';

const MB_STOP = Object.freeze([...VERIFIED_SPEC.mb.stopSymbols]);

export function getPhysicalStopPlan(roleResolution) {
  const role = roleResolution?.role ?? null;
  if (role === 'MB') {
    return Object.freeze({
      role,
      status: VERIFIED_SPEC.evidence.mbStopPattern,
      middleLineSymbols: MB_STOP,
      exactFullReelPositionsKnown: false,
      note: 'Published MB middle-line stop pattern only; complete strips remain unresolved.'
    });
  }

  return Object.freeze({
    role,
    status: 'UNRESOLVED',
    middleLineSymbols: null,
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

  snapshot() {
    return this.current;
  }
}

export const PHYSICAL_ROLE_SESSION_POLICY = Object.freeze({
  roleLotteryRunsEveryNormalGame: true,
  mbPhysicalStopPatternConnected: true,
  nonMbPhysicalStopPatternsInvented: false,
  completeReelStripsRequiredForExactStops: true
});
