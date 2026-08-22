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
  modeProfiles: Object.freeze({
    wantedChance: Object.freeze({
      baseGames: 10,
      holdSlots: 8,
      decrementPausesForChangedHold: true,
      wantedCounterMaxGames: 480
    }),
    raiunHigh: Object.freeze({
      entryCounterPoints: 100,
      games: 7,
      successCondition: 'BLUE_SYMBOL_ALIGNED'
    }),
    raiunMode: Object.freeze({
      games: 20,
      artExpectedRatePercent: 23,
      artTrigger: 'SEVEN_SYMBOL_ALIGNED',
      pureIncreaseCoinsPerGame: 2.0
    }),
    lupinBonus: Object.freeze({
      gamesApprox: 35,
      artExpectedRatePercentApprox: 50,
      pureIncreaseCoinsPerGame: 2.0,
      finalBattleGames: 5,
      artTrigger: 'ZENIGATA_BATTLE_WIN'
    }),
    goldenTime: Object.freeze({
      setGamesApprox: 40,
      pureIncreaseCoinsPerGame: 2.0,
      continuationExpectationPercent: Object.freeze({ min: 80.4, max: 83.3 }),
      expectedSets: Object.freeze({ min: 5.1, max: 6.0 })
    })
  }),
  chanceZones: Object.freeze({
    entryLotteryTrigger: 'CHANCE_EYE',
    odoroboZone: Object.freeze({
      category: 'SELF_CLEAR_CZ',
      games: Object.freeze([10, 20]),
      expectedRatePercent: Object.freeze({ min: 39.6, max: 43.2 }),
      successCondition: 'ODD_SYMBOL_ALIGNED',
      successDestination: 'LUPIN_BONUS_OR_GOLDEN_TIME',
      canUpgradeTo: 'FUJIKO_ZONE'
    }),
    fujikoZone: Object.freeze({
      category: 'SELF_CLEAR_CZ',
      games: Object.freeze([10, 20]),
      expectedRatePercent: Object.freeze({ min: 58.8, max: 63.2 }),
      successCondition: 'ODD_SYMBOL_ALIGNED',
      successDestination: 'LUPIN_BONUS_OR_GOLDEN_TIME'
    }),
    rizeZone: Object.freeze({
      category: 'PRECURSOR_ZONE',
      progressionRule: 'STEP_UP_INCREASES_EXPECTATION',
      successDestination: 'LUPIN_BONUS_OR_GOLDEN_TIME',
      games: null,
      automaticEntryProbability: null
    }),
    sevenZone: Object.freeze({
      category: 'CONFIRMED_ART_PRECURSOR',
      confirmedDestination: 'GOLDEN_TIME',
      games: null,
      automaticEntryProbability: null
    })
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
    targetPrompt: Object.freeze({
      label: 'メインリールを狙え',
      target: 'SPECIAL_SYMBOL',
      successConsequence: 'LONG_FREEZE_AND_LEGEND_GATE',
      exactSpecialSymbolArtwork: null,
      exactStopPattern: null
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
    wantedChanceProfile: 'MULTI_SOURCE_MATCH',
    raiunHighProfile: 'PUBLISHED_ANALYSIS',
    raiunModeProfile: 'MULTI_SOURCE_MATCH',
    lupinBonusProfile: 'MULTI_SOURCE_MATCH',
    goldenTimeProfile: 'MULTI_SOURCE_MATCH',
    chanceZoneTypes: 'MULTI_SOURCE_MATCH',
    chanceZoneEntryTrigger: 'PUBLISHED_ANALYSIS',
    odoroboZoneProfile: 'MULTI_SOURCE_MATCH',
    fujikoZoneProfile: 'MULTI_SOURCE_MATCH',
    rizeZoneProfile: 'MULTI_SOURCE_MATCH',
    sevenZoneProfile: 'MULTI_SOURCE_MATCH',
    liquidReelChanceEyeRules: 'MULTI_SOURCE_MATCH',
    liquidReelChanceEyeRates: 'MULTI_SOURCE_MATCH',
    liquidReelAlignedEffects: 'MULTI_SOURCE_MATCH',
    physicalMainReelCharacterSymbols: 'PUBLISHED_ANALYSIS_AND_MACHINE_VISUALS',
    mainReelTargetPrompt: 'PUBLISHED_MACHINE_GUIDE',
    mainReelSpecialSymbolArtwork: 'UNRESOLVED',
    mainReelSpecialSymbolStopPattern: 'UNRESOLVED',
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
    mainReelSpecialSymbolArtwork: 'DO_NOT_INVENT',
    mainReelSpecialSymbolStopPattern: 'DO_NOT_INVENT',
    rareRolePhysicalStopPatterns: 'DO_NOT_INVENT',
    unlistedProbabilities: 'DO_NOT_INTERPOLATE',
    unresolvedChanceZoneEntryRates: 'DO_NOT_INVENT'
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
