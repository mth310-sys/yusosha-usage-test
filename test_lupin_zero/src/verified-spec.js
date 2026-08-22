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
      1: 25.28,
      2: 25.46,
      3: 25.62,
      4: 25.78,
      5: 25.94,
      6: 26.11
    }),
    tenCoinBySetting: Object.freeze({
      1: 26.27,
      2: 25.18,
      3: 24.28,
      4: 23.45,
      5: 22.67,
      6: 21.94
    })
  }),
  mb: Object.freeze({
    stopLine: 'MIDDLE',
    stopSymbols: Object.freeze(['次元', '五エ門', 'ルパン']),
    followupGames: 2,
    payoutEachGame: 10
  }),
  evidence: Object.freeze({
    normalRoleDenominators: 'MULTI_SOURCE_MATCH',
    mbStopPattern: 'MULTI_SOURCE_MATCH',
    fullPhysicalReelStrips: 'UNRESOLVED'
  }),
  policy: Object.freeze({
    fullPhysicalReelStrips: 'DO_NOT_INVENT',
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
  return null;
}
