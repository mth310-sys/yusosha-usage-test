import { GameMode } from './game-flow-spec.js';
import { getArtPresentationGuarantee, resolveGoldTSymbolMinimum } from './art-presentation-guarantee-resolver.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');
const core = app.core;
const message = document.querySelector('#message');

function applyGoldTSymbolGuarantee() {
  const s = core.snapshot();
  if (s.mode !== GameMode.GOLDEN_TIME || s.modeResult) return false;
  const resolution = resolveGoldTSymbolMinimum(s.goldenTimeTreasure ?? 0);
  core.kernelState = Object.freeze({ ...core.kernelState, goldenTimeTreasure: resolution.treasureTo });
  core.emit('art-presentation-guarantee-applied', {
    key: resolution.key,
    minimumTreasure: resolution.minimumTreasure,
    treasureFrom: resolution.treasureFrom,
    treasureTo: resolution.treasureTo,
    evidenceStatus: resolution.evidenceStatus
  });
  if (message) message.textContent = `金T図柄 — ${Math.round(resolution.minimumTreasure / 10000)}万T以上`;
  return true;
}

app.getArtPresentationGuarantee = getArtPresentationGuarantee;
app.applyGoldTSymbolGuarantee = applyGoldTSymbolGuarantee;
app.artPresentationGuaranteePolicy = Object.freeze({
  goldTSymbolNaturalOccurrenceRateKnown: false,
  ambiguousAlternativeBranchesAutoSelected: false
});
