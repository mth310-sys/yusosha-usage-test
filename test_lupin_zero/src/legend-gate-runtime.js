import { GameMode } from './game-flow-spec.js';
import { resolveLegendGateTrigger, createLegendGateEntry } from './legend-gate-resolver.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.physicalRoleSession) throw new Error('LUPIN ZERO core and physical role session are required');

const core = app.core;
const originalStop = core.stop.bind(core);
const message = document.querySelector('#message');
const stateValue = document.querySelector('#stateValue');
const phaseBadge = document.querySelector('#phaseBadge');
let armedEntry = null;

function currentTrigger() {
  const session = app.physicalRoleSession.snapshot();
  return resolveLegendGateTrigger(session?.production ?? null);
}

function armLegendGateBeforeFinalStop(reelIndex) {
  const snapshot = core.snapshot();
  if (![GameMode.NORMAL, GameMode.WANTED_CHANCE].includes(snapshot.mode)) return null;
  if (snapshot.stopped?.[reelIndex]) return null;
  const stoppedAfter = snapshot.stopped.map((stopped, index) => index === reelIndex ? true : stopped);
  if (!stoppedAfter.every(Boolean)) return null;

  const trigger = currentTrigger();
  const entry = createLegendGateEntry(trigger);
  if (!entry) return null;

  armedEntry = Object.freeze({ ...entry, trigger });
  core.kernelState = Object.freeze({
    ...core.kernelState,
    mode: GameMode.LEGEND_GATE,
    modeGamesRemaining: 0,
    modeEvidenceStatus: entry.evidenceStatus,
    modeResult: null,
    modeResultEvidenceStatus: null
  });
  return armedEntry;
}

core.stop = (reelIndex) => {
  armLegendGateBeforeFinalStop(reelIndex);
  return originalStop(reelIndex);
};

core.addEventListener('spin-end', () => {
  if (!armedEntry || core.snapshot().mode !== GameMode.LEGEND_GATE) return;
  const entry = armedEntry;
  armedEntry = null;

  core.emit('long-freeze', {
    triggerRole: entry.trigger.role,
    destination: GameMode.LEGEND_GATE,
    evidenceStatus: entry.evidenceStatus
  });
  core.emit('mode-enter', {
    mode: GameMode.LEGEND_GATE,
    games: 0,
    evidenceStatus: entry.evidenceStatus
  });

  if (phaseBadge) phaseBadge.textContent = 'LEGEND GATE';
  if (stateValue) stateValue.textContent = 'LEGEND GATE';
  if (message) message.textContent = 'LONG FREEZE — LEGEND GATE';

  core.kernelState = Object.freeze({
    ...core.kernelState,
    modeResult: 'PENDING_GOLDEN_TIME',
    modeResultEvidenceStatus: entry.evidenceStatus
  });

  core.emit('legend-gate-art-guaranteed', {
    triggerRole: entry.trigger.role,
    destination: GameMode.GOLDEN_TIME,
    medalLotteryStatus: 'UNRESOLVED_NOT_INVENTED',
    evidenceStatus: entry.evidenceStatus
  });

  if (typeof app.enterGoldenTime === 'function') app.enterGoldenTime();
});

app.resolveLegendGateTrigger = resolveLegendGateTrigger;
app.legendGateSpec = Object.freeze({
  automaticMedalLotteryImplemented: false,
  automaticStockAwardImplemented: false
});
