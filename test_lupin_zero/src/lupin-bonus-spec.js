export const LUPIN_BONUS_SPEC = Object.freeze({
  category: 'PSEUDO_BONUS_ART',
  entryTrigger: 'ODD_SYMBOL_ALIGNED',
  pureIncreaseCoinsPerGame: 2.0,
  gamesApprox: 35,
  episodeCount: 11,
  goldenTimeExpectedRatePercentApprox: 50,
  progression: Object.freeze({
    narrativeEpisodes: true,
    finalBattle: Object.freeze({
      opponent: 'ZENIGATA',
      games: 5,
      winEffect: 'GOLDEN_TIME_ENTRY',
      loseEffect: 'BONUS_END_OR_POST_BONUS_FLOW'
    })
  }),
  goldenTimeLottery: Object.freeze({
    occursDuringBonus: true,
    finalBattleIsMainResultPresentation: true,
    exactPerRoleHitTable: null,
    exactInternalStateTable: null,
    exactBattleBranchRates: null,
    note: 'Published guides confirm GT success is decided during LUPIN BONUS and mainly presented by the final 5G Zenigata battle, but exact per-role/internal lottery tables remain unresolved.'
  }),
  presentation: Object.freeze({
    typewriterHighProbabilityIsStrongCue: true,
    exactCueProbability: null
  }),
  evidence: Object.freeze({
    baseProfile: 'MULTI_SOURCE_MATCH',
    episodeCount: 'MULTI_SOURCE_MATCH',
    finalFiveGameBattle: 'MULTI_SOURCE_MATCH',
    goldenTimeExpectedRate: 'MULTI_SOURCE_MATCH',
    goldenTimeLotteryDuringBonus: 'PUBLISHED_ANALYSIS',
    exactPerRoleHitTable: 'UNRESOLVED',
    exactInternalStateTable: 'UNRESOLVED',
    exactBattleBranchRates: 'UNRESOLVED',
    typewriterHighProbabilityCue: 'PUBLISHED_ANALYSIS'
  }),
  policy: Object.freeze({
    inferPerRoleHitRates: false,
    inferInternalStateRates: false,
    inferBattleBranchRates: false,
    convertApproxExpectationToExactProbability: false
  })
});
