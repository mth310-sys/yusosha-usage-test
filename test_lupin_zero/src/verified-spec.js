export const VERIFIED_SPEC = Object.freeze({
  machine: Object.freeze({
    title: 'パチスロ ルパン三世～消されたルパン～',
    model: 'ルパン三世消されたルパン/B4',
    releaseDate: '2016-08-01'
  }),
  normalRoleDenominators: Object.freeze({
    replay: 7.30,
    threeCoin: 99.99,
    mb: 27.31,
    nineCoinBySetting: Object.freeze({
      1: 25.28, 2: 25.46, 3: 25.62, 4: 25.78, 5: 25.94, 6: 26.11
    }),
    tenCoinBySetting: Object.freeze({
      1: 26.27, 2: 25.18, 3: 24.28, 4: 23.45, 5: 22.67, 6: 21.94
    }),
    premiumBySetting: Object.freeze({
      1: 65536.00, 2: 65536.00, 3: 65536.00, 4: 65536.00, 5: 32768.00, 6: 21845.33
    }),
    legendBySetting: Object.freeze({
      1: 65536.00, 2: 65536.00, 3: 65536.00, 4: 65536.00, 5: 32768.00, 6: 32768.00
    })
  }),
  play: Object.freeze({
    normalFreeStopAllowed: true,
    normalPushOrderPenalty: false,
    rareRoleFamilies: Object.freeze(['青チャンス目', '赤チャンス目', '金チャンス目']),
    gamesPer50Coins: Object.freeze({ min: 46.1, max: 48.7 })
  }),
  liquidReel: Object.freeze({
    chanceEyes: Object.freeze({
      weak: Object.freeze({ label: '青チャンス目', visualRule: 'BLUE_SAME_COLOR', normalDenominator: 53.6, wantedChanceDenominator: 13.9 }),
      middle: Object.freeze({ label: '赤チャンス目', visualRule: 'RED_SAME_COLOR', normalDenominator: 149.2, wantedChanceDenominator: 7.3 }),
      strong: Object.freeze({ label: '金チャンス目', visualRule: 'GOLD_7_PRESENT', normalDenominator: 3857, wantedChanceDenominator: 45.7 })
    }),
    alignedEffects: Object.freeze({
      redSymbol: 'LUPIN_BONUS',
      blueSymbol: 'RAIUN_MODE',
      sevenSymbol: 'GOLDEN_TIME'
    })
  }),
  physicalMainReels: Object.freeze({
    confirmedSymbols: Object.freeze(['ルパン', '次元', '五エ門']),
    confirmedMiddleLinePattern: Object.freeze({
      role: 'MB',
      left: '次元',
      center: '五エ門',
      right: 'ルパン'
    }),
    fullStrips: null,
    stripLength: null,
    symbolOrder: null,
    note: 'Only directly published/observable physical-reel facts are stored. Complete reel strips remain unresolved.'
  }),
  mb: Object.freeze({
    stopLine: 'MIDDLE',
    stopSymbols: Object.freeze(['次元', '五エ門', 'ルパン']),
    followupGames: 2,
    payoutEachGame: 10
  }),
  evidence: Object.freeze({
    normalRoleDenominators: 'MULTI_SOURCE_MATCH',
    premiumLegendDenominators: 'MULTI_SOURCE_MATCH',
    normalPlayRules: 'PUBLISHED_ANALYSIS',
    rareRoleFamilies: 'PUBLISHED_ANALYSIS',
    liquidReelChanceEyeRules: 'MULTI_SOURCE_MATCH',
    liquidReelChanceEyeRates: 'MULTI_SOURCE_MATCH',
    liquidReelAlignedEffects: 'MULTI_SOURCE_MATCH',
    physicalMainReelCharacterSymbols: 'PUBLISHED_ANALYSIS_AND_MACHINE_VISUALS',
    mbStopPattern: 'MULTI_SOURCE_MATCH',
    fullPhysicalReelStrips: 'UNRESOLVED',
    physicalReelStripLength: 'UNRESOLVED',
    physicalReelSymbolOrder: 'UNRESOLVED',
    rareRolePhysicalStopPatterns: 'UNRESOLVED'
  }),
  policy: Object.freeze({
    fullPhysicalReelStrips: 'DO_NOT_INVENT',
    physicalReelStripLength: 'DO_NOT_INVENT',
    physicalReelSymbolOrder: 'DO_NOT_INVENT',
    rareRolePhysicalStopPatterns: 'DO_NOT_INVENT',
    unlistedProbabilities: 'DO_NOT_INTERPOLATE'
  })
});

export function getNormalRoleDenominator(role, setting = 1) {
  if (!Number.isInteger(setting) || setting < 1 || setting > 6) return null;
  if (role === 'REPLAY') return VERIFIED_SPEC.normalRoleDenominators.replay;
  if (role === 'THREE_COIN') return VERIFIED_SPEC.normalRoleDenominators.threeCoin;
  if (role === 'MB') return VERIFIED_SPEC.normalRoleDenominators.mb;
  if (role === 'NINE_COIN') return VERIFIED_SPEC.normalRoleDenominators.nineCoinBySetting[setting] ?? null;
  if (role === 'TEN_COIN') return VERIFIED_SPEC.normalRoleDenominators.tenCoinBySetting[setting] ?? null;
  if (role === 'PREMIUM') return VERIFIED_SPEC.normalRoleDenominators.premiumBySetting[setting] ?? null;
  if (role === 'LEGEND') return VERIFIED_SPEC.normalRoleDenominators.legendBySetting[setting] ?? null;
  return null;
}
