import { GOLDEN_TIME_PROFILE } from './golden-time-profile.js?v=step6z';
import { GOLD_CHANCE_PROFILE, EXTRA_BONUS_PROFILE } from './extra-bonus-profile.js?v=step6z-gc-boundary1';

export const EXTRA_TIMING_DIAGNOSTIC = Object.freeze((()=>{
  const setGames=Number(GOLDEN_TIME_PROFILE.setGamesApprox);
  const averageExtraGames=Number(EXTRA_BONUS_PROFILE.averageGames);
  const averageGoldChanceAddedGames=Number(GOLD_CHANCE_PROFILE.averageAddedGames);
  const impliedAverageRemainingGames=averageExtraGames-averageGoldChanceAddedGames;
  const impliedAverageReachGame=setGames-impliedAverageRemainingGames;
  return {
    setGames,
    averageExtraGames,
    averageGoldChanceAddedGames,
    impliedAverageRemainingGames,
    impliedAverageReachGame,
    arithmeticInvariantStatus:
      Math.abs((impliedAverageRemainingGames+averageGoldChanceAddedGames)-averageExtraGames)<1e-9?'PASS':'FAIL',
    interpretation:'AGGREGATE_DIAGNOSTIC_ONLY_NOT_A_REACH_TIMING_DISTRIBUTION',
    calibrationPolicy:'DO_NOT_FORCE_CURRENT_UNRESOLVED_TREASURE_AWARD_DISTRIBUTIONS_TO_MATCH_THIS_SINGLE_DERIVED_MEAN',
    note:'Published aggregate averages imply about 11.4 ART games remaining when 1M is reached, corresponding to about game 28.6 within the verified ~40G set. This is a consistency diagnostic only because the underlying 1M routes and award distributions are not fully recovered.'
  };
})());
