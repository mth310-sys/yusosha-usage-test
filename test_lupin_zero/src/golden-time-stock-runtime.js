import { createGoldenTimeSetProfile } from './golden-time-resolver.js';
import { resolveGoldenTimeContinuationPriority } from './golden-time-stock-resolver.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
const originalResolve = core.resolveGoldenTimeContinuation.bind(core);

core.resolveGoldenTimeContinuation = (resolution, profile = createGoldenTimeSetProfile()) => {
  const snapshot = core.snapshot();
  const priority = resolveGoldenTimeContinuationPriority(snapshot);
  if (priority.route !== 'STOCK') return originalResolve(resolution, profile);

  core.kernelState = Object.freeze({
    ...core.kernelState,
    modeGamesRemaining: profile.games,
    modeResult: null,
    modeResultEvidenceStatus: null,
    goldenTimeTreasure: profile.initialTreasure,
    goldenTimeSetNumber: snapshot.goldenTimeSetNumber + 1,
    goldenTimeStockCount: priority.stockAfter,
    goldenTimeLastContinuation: Object.freeze({
      source: 'STOCK',
      continued: true,
      evidenceStatus: priority.evidenceStatus
    })
  });

  core.emit('golden-time-stock-consumed', {
    stockBefore: priority.stockBefore,
    stockAfter: priority.stockAfter,
    setNumber: core.kernelState.goldenTimeSetNumber,
    evidenceStatus: priority.evidenceStatus
  });
  core.emit('golden-time-continued', {
    treasure: snapshot.goldenTimeTreasure,
    continuationPercent: 100,
    setNumber: core.kernelState.goldenTimeSetNumber,
    evidenceStatus: priority.evidenceStatus,
    source: 'STOCK'
  });
  return true;
};

core.addEventListener('golden-time-stock-consumed', (event) => {
  const message = document.querySelector('#message');
  if (message) message.textContent = `GT STOCK使用 — 残り${event.detail.stockAfter}`;
});

window.__LUPIN_ZERO__.resolveGoldenTimeContinuationPriority = resolveGoldenTimeContinuationPriority;
