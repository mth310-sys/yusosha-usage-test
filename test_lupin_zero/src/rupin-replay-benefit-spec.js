export const RUPIN_REPLAY_BENEFIT_SPEC = Object.freeze({
  A: Object.freeze({
    role: 'RUPIN_REPLAY_A',
    guaranteedBonus: false,
    guaranteedArt: false,
    guaranteedLegendGate: false,
    exactDownstreamLotteryKnown: false,
    evidenceStatus: 'PUBLISHED_OCCURRENCE_AND_STOP_PATTERN_ONLY'
  }),
  B: Object.freeze({
    role: 'RUPIN_REPLAY_B',
    guaranteedBonus: false,
    guaranteedArt: false,
    guaranteedLegendGate: false,
    exactDownstreamLotteryKnown: false,
    evidenceStatus: 'PUBLISHED_OCCURRENCE_AND_STOP_PATTERN_ONLY'
  }),
  C: Object.freeze({
    role: 'RUPIN_REPLAY_C',
    guaranteedBonus: false,
    guaranteedArt: false,
    guaranteedLegendGate: false,
    exactDownstreamLotteryKnown: false,
    evidenceStatus: 'PUBLISHED_OCCURRENCE_AND_STOP_PATTERN_ONLY'
  }),
  D: Object.freeze({
    role: 'PREMIUM',
    guaranteedBonus: false,
    guaranteedArt: true,
    guaranteedLegendGate: true,
    longFreeze: true,
    exactDownstreamLotteryKnown: true,
    evidenceStatus: 'MULTI_SOURCE_MATCH'
  })
});

export function getRupinReplayBenefit(role) {
  if (role === 'RUPIN_REPLAY_A') return RUPIN_REPLAY_BENEFIT_SPEC.A;
  if (role === 'RUPIN_REPLAY_B') return RUPIN_REPLAY_BENEFIT_SPEC.B;
  if (role === 'RUPIN_REPLAY_C') return RUPIN_REPLAY_BENEFIT_SPEC.C;
  if (role === 'PREMIUM') return RUPIN_REPLAY_BENEFIT_SPEC.D;
  return null;
}

export const RUPIN_REPLAY_BENEFIT_POLICY = Object.freeze({
  abcAutomaticBonusOrArtLotteryImplemented: false,
  abcGuaranteedDestinationInvented: false,
  dLongFreezeAndLegendGateConnected: true,
  futureVerifiedDownstreamLotteryMayReplaceUnknowns: true
});
