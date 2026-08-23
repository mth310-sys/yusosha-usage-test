import { ReuseEvidenceStatus } from './reuse-registry.js';
import { VERIFIED_SPEC } from './verified-spec.js';

const PAYOUTS = Object.freeze({ THREE_COIN:3,NINE_COIN:9,TEN_COIN:10,MB:0,RUPIN_REPLAY_A:0,RUPIN_REPLAY_B:0,RUPIN_REPLAY_C:0,PREMIUM:0,LEGEND:0,NO_PAYOUT_OTHER:0 });

export function getNormalRoleSettlement(roleResolution, maxBet = 3) {
  const role = roleResolution?.role ?? null;
  if (!role) return Object.freeze({ accepted:false,reason:'NO_ROLE' });
  if (role === 'REPLAY') return Object.freeze({ accepted:true,role,creditDelta:0,replayAutoBet:maxBet,mbFollowupGames:0,evidenceStatus:ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,inference:'Replay preserves the next 3-coin game without consuming additional credit; represented as an automatic ready bet.',replaceable:true });
  if (!(role in PAYOUTS)) return Object.freeze({ accepted:false,reason:'UNKNOWN_ROLE',role });
  return Object.freeze({ accepted:true,role,creditDelta:PAYOUTS[role],replayAutoBet:0,mbFollowupGames:role==='MB'?VERIFIED_SPEC.mb.followupGames:0,evidenceStatus:role==='NO_PAYOUT_OTHER'?ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE:(roleResolution.evidenceStatus??'PUBLISHED_ANALYSIS'),replaceable:role==='NO_PAYOUT_OTHER' });
}

export const NORMAL_ROLE_SETTLEMENT_POLICY = Object.freeze({ publishedCoinPayoutsConnected:true,replayAutoBetEvidenceStatus:ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,replayAutoBetMayBePromotedToVerifiedAutomatically:false,mbFollowupGamesReservedFromVerifiedSpec:VERIFIED_SPEC.mb.followupGames,mbFollowupPayoutExecutionImplementedHere:false,premiumAndLegendDownstreamModeEffectsImplementedHere:false,rupinReplayABCZeroPayoutKnownRoles:true });
