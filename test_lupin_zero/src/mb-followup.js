import { VERIFIED_SPEC } from './verified-spec.js';

export function getMbFollowupGameSettlement() {
  return Object.freeze({
    accepted: true,
    creditDelta: VERIFIED_SPEC.mb.payoutEachGame,
    gamesPerMb: VERIFIED_SPEC.mb.followupGames,
    betCoinsPerGame: 3,
    evidenceStatus: VERIFIED_SPEC.evidence.mbStopPattern,
    sourceRelation: 'MB_FOLLOWUP_PAYOUT',
    note: 'MB成立後は3枚掛けで10枚払い出しが2G連続。通常小役抽選とは分離して扱う。'
  });
}

export const MB_FOLLOWUP_POLICY = Object.freeze({
  followupGames: VERIFIED_SPEC.mb.followupGames,
  payoutEachGame: VERIFIED_SPEC.mb.payoutEachGame,
  betCoinsPerGame: 3,
  netGainPerMb: VERIFIED_SPEC.mb.followupGames * (VERIFIED_SPEC.mb.payoutEachGame - 3),
  normalRoleLotteryRunsDuringFollowup: false,
  liquidChanceEyeLotteryRunsDuringFollowup: false,
  exactPhysicalStopPatternDuringFollowupKnown: false
});
