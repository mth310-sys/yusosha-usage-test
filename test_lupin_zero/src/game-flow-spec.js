import { VERIFIED_SPEC } from './verified-spec.js';

export const FlowEvidence = Object.freeze({
  VERIFIED_LINK: 'VERIFIED_LINK',
  DESTINATION_ONLY: 'DESTINATION_ONLY',
  UNRESOLVED: 'UNRESOLVED'
});

export const GameMode = Object.freeze({
  NORMAL: 'NORMAL',
  WANTED_CHANCE: 'WANTED_CHANCE',
  ODOROBO_ZONE: 'ODOROBO_ZONE',
  FUJIKO_ZONE: 'FUJIKO_ZONE',
  RAIUN_MODE: 'RAIUN_MODE',
  LUPIN_BONUS: 'LUPIN_BONUS',
  GOLDEN_TIME: 'GOLDEN_TIME',
  LEGEND_GATE: 'LEGEND_GATE'
});

// This graph intentionally stores only links supported by the current
// VerifiedSpec. Unknown automatic-entry routes/probabilities are absent.
export const GAME_FLOW_SPEC = Object.freeze({
  modes: Object.freeze(Object.values(GameMode)),
  links: Object.freeze([
    Object.freeze({
      from: GameMode.NORMAL,
      trigger: 'CHANCE_EYE_OUTCOME_ODOROBO_ZONE',
      to: GameMode.ODOROBO_ZONE,
      evidence: FlowEvidence.VERIFIED_LINK
    }),
    Object.freeze({
      from: GameMode.NORMAL,
      trigger: 'CHANCE_EYE_OUTCOME_FUJIKO_ZONE',
      to: GameMode.FUJIKO_ZONE,
      evidence: FlowEvidence.VERIFIED_LINK
    }),
    Object.freeze({
      from: GameMode.NORMAL,
      trigger: 'LIQUID_REEL_RED_SYMBOL_ALIGNED',
      to: GameMode.LUPIN_BONUS,
      evidence: FlowEvidence.VERIFIED_LINK
    }),
    Object.freeze({
      from: GameMode.NORMAL,
      trigger: 'LIQUID_REEL_BLUE_SYMBOL_ALIGNED',
      to: GameMode.RAIUN_MODE,
      evidence: FlowEvidence.VERIFIED_LINK
    }),
    Object.freeze({
      from: GameMode.NORMAL,
      trigger: 'LIQUID_REEL_SEVEN_SYMBOL_ALIGNED',
      to: GameMode.GOLDEN_TIME,
      evidence: FlowEvidence.VERIFIED_LINK
    }),
    Object.freeze({
      from: GameMode.NORMAL,
      trigger: 'MAIN_REEL_SPECIAL_SYMBOL_SUCCESS',
      to: GameMode.LEGEND_GATE,
      sideEffect: 'LONG_FREEZE',
      evidence: FlowEvidence.VERIFIED_LINK
    })
  ]),
  knownButUnresolved: Object.freeze([
    Object.freeze({
      mode: GameMode.WANTED_CHANCE,
      fact: 'LIQUID_REEL_CHANCE_EYE_RATES_KNOWN',
      evidence: 'MULTI_SOURCE_MATCH',
      automaticEntryRoute: null,
      automaticEntryProbability: null
    }),
    Object.freeze({
      mode: GameMode.ODOROBO_ZONE,
      fact: 'SUCCESS_DESTINATION_IS_LUPIN_BONUS_OR_GOLDEN_TIME',
      evidence: 'MULTI_SOURCE_MATCH',
      exactBonusVsArtSplit: null
    }),
    Object.freeze({
      mode: GameMode.FUJIKO_ZONE,
      fact: 'SUCCESS_DESTINATION_IS_LUPIN_BONUS_OR_GOLDEN_TIME',
      evidence: 'MULTI_SOURCE_MATCH',
      exactBonusVsArtSplit: null
    })
  ]),
  policy: Object.freeze({
    inferMissingLinks: false,
    inferAutomaticEntryProbability: false,
    interpolateUnknownTransitionRates: false
  })
});

export function getVerifiedFlowLinks(fromMode) {
  return GAME_FLOW_SPEC.links.filter((link) => link.from === fromMode);
}

export function getChanceEyeDenominator(level, mode = GameMode.NORMAL) {
  const eye = VERIFIED_SPEC.liquidReel.chanceEyes[level];
  if (!eye) return null;
  if (mode === GameMode.NORMAL) return eye.normalDenominator;
  if (mode === GameMode.WANTED_CHANCE) return eye.wantedChanceDenominator;
  return null;
}
