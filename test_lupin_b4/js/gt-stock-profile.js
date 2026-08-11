// Step 6K: GOLDEN TIME ART stock policy.
// Verified analysis: stocked ART has no continuation rate of its own and disappears on battle entry.
// Therefore one stock is consumed to guarantee the next set before Treasure Battle is entered.
export const GT_STOCK_PROFILE = Object.freeze({
  stockHasContinuationRate:false,
  consumeTiming:'SET_END_BEFORE_TREASURE_BATTLE',
  battleEntryPolicy:'ANY_REMAINING_STOCK_EXPIRES',
  extraBonusStockHitDenominator:4924.3,
  goldRushAverageStocksPerGame:1.01,
  source:'VERIFIED_ANALYSIS_PLUS_EXPLICIT_SAFETY_INVARIANT'
});
