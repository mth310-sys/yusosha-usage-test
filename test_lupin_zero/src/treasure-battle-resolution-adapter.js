import { resolveGoldenTimeContinuation } from './golden-time-resolver.js';
import {
  TREASURE_BATTLE_REUSE_POLICY,
  getReusableTreasureBattlePresentationProfile
} from './treasure-battle-reuse-adapter.js';

export const TREASURE_BATTLE_RESOLUTION_POLICY = Object.freeze({
  outcomeResolver: 'golden-time-resolver.js#resolveGoldenTimeContinuation',
  presentationProfile: TREASURE_BATTLE_REUSE_POLICY.sourceModule,
  outcomeLotteryBasis: 'EXACT_PUBLISHED_TREASURE_CONTINUATION_TABLE_POINT',
  unsupportedTreasurePolicy: 'UNRESOLVED_NO_WIN_LOSS',
  hiddenOutcomeUntilPresentationResult: true,
  opponentDistributionUsedForOutcome: false,
  chanceUpDistributionUsedForOutcome: false,
  automaticBattleEntryImplementedHere: false,
  duplicateContinuationTableImplemented: false
});

export function prepareTreasureBattleResolution(randomSource, treasure) {
  const continuation = resolveGoldenTimeContinuation(randomSource, treasure);
  if (continuation.eligible === false) {
    return Object.freeze({
      eligible: false,
      treasure,
      hiddenOutcome: null,
      continuation,
      presentationGamesCandidate: getReusableTreasureBattlePresentationProfile().totalGames,
      presentationEvidenceStatus: TREASURE_BATTLE_REUSE_POLICY.presentationStructureStatus,
      evidenceStatus: 'UNRESOLVED'
    });
  }

  return Object.freeze({
    eligible: true,
    treasure,
    hiddenOutcome: continuation.continued ? 'WIN' : 'LOSE',
    continuation,
    presentationGamesCandidate: getReusableTreasureBattlePresentationProfile().totalGames,
    presentationEvidenceStatus: TREASURE_BATTLE_REUSE_POLICY.presentationStructureStatus,
    evidenceStatus: continuation.evidenceStatus
  });
}
