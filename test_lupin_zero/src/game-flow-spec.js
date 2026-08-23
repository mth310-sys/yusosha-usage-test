import { VERIFIED_SPEC } from './verified-spec.js';

export const FlowEvidence = Object.freeze({
  VERIFIED_LINK: 'VERIFIED_LINK',
  DESTINATION_ONLY: 'DESTINATION_ONLY',
  UNRESOLVED: 'UNRESOLVED'
});

export const GameMode = Object.freeze({
  NORMAL: 'NORMAL', WANTED_CHANCE: 'WANTED_CHANCE', ODOROBO_ZONE: 'ODOROBO_ZONE', FUJIKO_ZONE: 'FUJIKO_ZONE', RAIUN_MODE: 'RAIUN_MODE', LUPIN_BONUS: 'LUPIN_BONUS', GOLDEN_TIME: 'GOLDEN_TIME', TREASURE_RUSH: 'TREASURE_RUSH', EXTRA_BONUS: 'EXTRA_BONUS', GOLD_RUSH: 'GOLD_RUSH', REVENGE_CHANCE: 'REVENGE_CHANCE', LEGEND_GATE: 'LEGEND_GATE'
});

export const GAME_FLOW_SPEC = Object.freeze({
  modes: Object.freeze(Object.values(GameMode)),
  links: Object.freeze([
    Object.freeze({ from: GameMode.NORMAL, trigger: 'CHANCE_EYE_OUTCOME_ODOROBO_ZONE', to: GameMode.ODOROBO_ZONE, evidence: FlowEvidence.VERIFIED_LINK }),
    Object.freeze({ from: GameMode.NORMAL, trigger: 'CHANCE_EYE_OUTCOME_FUJIKO_ZONE', to: GameMode.FUJIKO_ZONE, evidence: FlowEvidence.VERIFIED_LINK }),
    Object.freeze({ from: GameMode.NORMAL, trigger: 'LIQUID_REEL_RED_SYMBOL_ALIGNED', to: GameMode.LUPIN_BONUS, evidence: FlowEvidence.VERIFIED_LINK }),
    Object.freeze({ from: GameMode.NORMAL, trigger: 'LIQUID_REEL_BLUE_SYMBOL_ALIGNED', to: GameMode.RAIUN_MODE, evidence: FlowEvidence.VERIFIED_LINK }),
    Object.freeze({ from: GameMode.NORMAL, trigger: 'LIQUID_REEL_SEVEN_SYMBOL_ALIGNED', to: GameMode.GOLDEN_TIME, evidence: FlowEvidence.VERIFIED_LINK }),
    Object.freeze({ from: GameMode.NORMAL, trigger: 'MAIN_REEL_SPECIAL_SYMBOL_SUCCESS', to: GameMode.LEGEND_GATE, sideEffect: 'LONG_FREEZE', evidence: FlowEvidence.VERIFIED_LINK }),
    Object.freeze({ from: GameMode.GOLDEN_TIME, trigger: 'TREASURE_HUNT_SUCCESS', to: GameMode.TREASURE_RUSH, evidence: FlowEvidence.DESTINATION_ONLY }),
    Object.freeze({ from: GameMode.GOLDEN_TIME, trigger: 'TREASURE_REACHES_1000000', to: GameMode.EXTRA_BONUS, evidence: FlowEvidence.VERIFIED_LINK }),
    Object.freeze({ from: GameMode.EXTRA_BONUS, trigger: 'GOLD_SEVEN_ALIGNED', to: GameMode.GOLD_RUSH, evidence: FlowEvidence.VERIFIED_LINK }),
    Object.freeze({ from: GameMode.GOLDEN_TIME, trigger: 'TREASURE_BATTLE_LOSS_PULLBACK_HIT', to: GameMode.REVENGE_CHANCE, evidence: FlowEvidence.VERIFIED_LINK }),
    Object.freeze({ from: GameMode.REVENGE_CHANCE, trigger: 'PULLBACK_ANNOUNCEMENT_COMPLETE', to: GameMode.LUPIN_BONUS, evidence: FlowEvidence.VERIFIED_LINK }),
    Object.freeze({ from: GameMode.LUPIN_BONUS, trigger: 'ZENIGATA_BATTLE_WIN_OR_REVIVAL', to: GameMode.GOLDEN_TIME, evidence: FlowEvidence.VERIFIED_LINK })
  ]),
  knownButUnresolved: Object.freeze([
    Object.freeze({ mode: GameMode.WANTED_CHANCE, fact: 'LIQUID_REEL_CHANCE_EYE_RATES_KNOWN', evidence: 'MULTI_SOURCE_MATCH', automaticEntryRoute: null, automaticEntryProbability: null }),
    Object.freeze({ mode: GameMode.ODOROBO_ZONE, fact: 'SUCCESS_DESTINATION_IS_LUPIN_BONUS_OR_GOLDEN_TIME', evidence: 'MULTI_SOURCE_MATCH', exactBonusVsArtSplit: null }),
    Object.freeze({ mode: GameMode.FUJIKO_ZONE, fact: 'SUCCESS_DESTINATION_IS_LUPIN_BONUS_OR_GOLDEN_TIME', evidence: 'MULTI_SOURCE_MATCH', exactBonusVsArtSplit: null }),
    Object.freeze({
      mode: GameMode.TREASURE_RUSH,
      fact: 'ENTRY_ON_TREASURE_HUNT_SUCCESS',
      evidence: 'MULTI_SOURCE_MATCH',
      automaticTreasureHuntOccurrenceRate: null,
      treasureHuntSuccessRate: null,
      exactRoleByRoleLottery: null,
      productionCalibration: Object.freeze({
        denominator: 175,
        source: 'SETTING6_SHOWROOM_1750_ART_GAMES_EXCLUDING_SPECIAL_ZONES_10_TREASURE_RUSHES',
        triggerObservation: 'MOST_RECORDED_ENTRIES_GREEN_CHANCE_EYE',
        evidence: 'INFERRED_HIGH_CONFIDENCE',
        replaceable: true
      })
    }),
    Object.freeze({ mode: GameMode.REVENGE_CHANCE, fact: 'TEN_GAME_PULLBACK_ANNOUNCEMENT_AFTER_TREASURE_BATTLE_LOSS', evidence: 'PUBLISHED_ANALYSIS', perGameSuccessRate: null }),
    Object.freeze({ mode: GameMode.LUPIN_BONUS, fact: 'FAILURE_MAY_ROUTE_TO_REVENGE_CHANCE', evidence: 'MULTI_SOURCE_MATCH', revengeEntryRate: null }),
    Object.freeze({ mode: GameMode.LUPIN_BONUS, fact: 'ART_EXPECTATION_ABOUT_50_PERCENT_BUT_EXACT_PER_ROLE_LOTTERY_UNRESOLVED', evidence: 'PUBLISHED_ANALYSIS', exactPerRoleLottery: null })
  ]),
  policy: Object.freeze({
    inferMissingLinks: false,
    inferAutomaticEntryProbability: false,
    allowDocumentedHighConfidenceProductionCalibration: true,
    requireCalibrationReplaceable: true,
    interpolateUnknownTransitionRates: false
  })
});

export function getVerifiedFlowLinks(fromMode) { return GAME_FLOW_SPEC.links.filter((link) => link.from === fromMode); }
export function getChanceEyeDenominator(level, mode = GameMode.NORMAL) {
  const eye = VERIFIED_SPEC.liquidReel.chanceEyes[level];
  if (!eye) return null;
  if (mode === GameMode.NORMAL) return eye.normalDenominator;
  if (mode === GameMode.WANTED_CHANCE) return eye.wantedChanceDenominator;
  return null;
}
