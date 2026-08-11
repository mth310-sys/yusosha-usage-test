// Step 6O: LUPIN BONUS verified presentation details + calibrated overall ART outcome.
// Verified public specs: about 35G, pure increase about 2.0/G, ART expectation about 50%.
// The episode portion advances through 11 episodes; hold changes signal battle chance,
// typewriter appearance is very strong, and if no ART is won within the first 30G,
// the final Zenigata battle decides the result. Bullet evasion means ART; arrest can still revive via shutter.
// Exact per-role ART lottery / early-battle trigger / chance-up appearance rates are not verified here.
export const LUPIN_BONUS_PROFILE = Object.freeze({
  totalGamesApprox:35,
  bodyGames:30,
  finalBattleGames:5,
  pureIncreaseApprox:2.0,
  artExpectationPctApprox:50,
  episodeCount:11,
  episodeAdvanceTiming:null,
  holdChangeMeaning:'BATTLE_CHANCE',
  typewriterMeaning:'VERY_HIGH_EXPECTATION',
  finalBattleOpponent:'ZENIGATA',
  finalBattleVerifiedCues:Object.freeze({
    BULLET_EVASION:'ART_CONFIRMED',
    ARREST:'BASIC_FAIL_BUT_REVIVAL_POSSIBLE',
    SHUTTER_OPEN_AFTER_ARREST:'ART_REVIVAL_CONFIRMED'
  }),
  earlyBattleWinDestination:'GOLDEN_TIME',
  earlyBattleTriggerRate:null,
  holdChangeRate:null,
  typewriterRate:null,
  artLotteryByRole:null,
  calibratedOutcomeModel:'SINGLE_HIDDEN_50PCT_REVEALED_AT_FINAL_BATTLE_UNLESS_VERIFIED_EARLY_WIN_DEBUG_ROUTE',
  failureMayRouteToRevengeChance:true,
  source:'VERIFIED_PRESENTATION_STRUCTURE_PLUS_CALIBRATED_50PCT_OUTCOME'
});

export function rollCalibratedLupinBonusArt(rng){
  return rng.next() < (LUPIN_BONUS_PROFILE.artExpectationPctApprox/100);
}
