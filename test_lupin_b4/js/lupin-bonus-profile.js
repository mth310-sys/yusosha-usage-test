// Step 6N: LUPIN BONUS verified shell + calibrated overall ART outcome.
// Verified public specs: about 35G, pure increase about 2.0/G, ART expectation about 50%,
// and if ART has not been won earlier, a mandatory Zenigata battle occupies the last 5G.
// Exact per-role ART lottery / early-battle trigger rates are not verified here.
export const LUPIN_BONUS_PROFILE = Object.freeze({
  totalGamesApprox:35,
  bodyGames:30,
  finalBattleGames:5,
  pureIncreaseApprox:2.0,
  artExpectationPctApprox:50,
  episodeCount:11,
  finalBattleOpponent:'ZENIGATA',
  earlyBattleTriggerRate:null,
  artLotteryByRole:null,
  calibratedOutcomeModel:'SINGLE_HIDDEN_50PCT_REVEALED_AT_FINAL_BATTLE',
  failureMayRouteToRevengeChance:true,
  source:'VERIFIED_STRUCTURE_PLUS_CALIBRATED_50PCT_OUTCOME'
});

export function rollCalibratedLupinBonusArt(rng){
  return rng.next() < (LUPIN_BONUS_PROFILE.artExpectationPctApprox/100);
}
