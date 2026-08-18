import { GOLDEN_TIME_PROFILE } from './golden-time-profile.js?v=step6z-active30';
import { GOLD_CHANCE_PROFILE, EXTRA_BONUS_PROFILE } from './extra-bonus-profile.js?v=step6z-gc-boundary1';

export const EXTRA_TIMING_DIAGNOSTIC = Object.freeze((()=>{
  const activeSetGames=Number(GOLDEN_TIME_PROFILE.activeSetGames);
  const fullSetGamesApprox=Number(GOLDEN_TIME_PROFILE.fullSetGamesApprox);
  const averageExtraGames=Number(EXTRA_BONUS_PROFILE.averageGames);
  const averageGoldChanceAddedGames=Number(GOLD_CHANCE_PROFILE.averageAddedGames);
  const impliedAverageRemainingGames=averageExtraGames-averageGoldChanceAddedGames;
  const impliedAverageReachGame=activeSetGames-impliedAverageRemainingGames;
  return {
    activeSetGames,
    fullSetGamesApprox,
    averageExtraGames,
    averageGoldChanceAddedGames,
    impliedAverageRemainingGames,
    impliedAverageReachGame,
    arithmeticInvariantStatus:
      Math.abs((impliedAverageRemainingGames+averageGoldChanceAddedGames)-averageExtraGames)<1e-9?'PASS':'FAIL',
    interpretation:'AGGREGATE_DIAGNOSTIC_ONLY_NOT_A_REACH_TIMING_DISTRIBUTION',
    calibrationPolicy:'DO_NOT_FORCE_CURRENT_UNRESOLVED_TREASURE_AWARD_DISTRIBUTIONS_TO_MATCH_THIS_SINGLE_DERIVED_MEAN',
    note:'Published aggregate averages imply about 11.4 ACTIVE_SET games remaining when 1M is reached. Against the explicit 30G Treasure-acquisition section this corresponds to about game 18.6. The separate ~40G published figure is retained only as the approximate full ART-set overview including separately modeled surrounding phases; it must not be used as ACTIVE_SET remaining games.'
  };
})());
