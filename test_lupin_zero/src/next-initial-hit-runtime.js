import { GameMode } from './game-flow-spec.js';
import { resolveNextInitialHit } from './next-initial-hit-resolver.js';
import { createGoldenTimeSetProfile } from './golden-time-resolver.js';
import { SeededRandomSource } from './random-source.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
const random = new SeededRandomSource(0x20160810);
const setting = app.machineSetting ?? 1;
let reserved = resolveNextInitialHit(random, setting, 'INITIAL_BOOT');
let forcedNextDestination = null;

function publishReservation() {
  app.nextInitialHitReservation = forcedNextDestination
    ? Object.freeze({ ...reserved, destination: forcedNextDestination, forced: true, forceReason: app.nextInitialHitForceReason ?? null, evidenceStatus: 'PUBLISHED_ANALYSIS' })
    : reserved;
  return app.nextInitialHitReservation;
}

function reserveNext(context = 'AFTER_BONUS_OR_ART') {
  reserved = resolveNextInitialHit(random, setting, context);
  forcedNextDestination = null;
  app.nextInitialHitForceReason = null;
  const published = publishReservation();
  core.emit('next-initial-hit-reserved', { reservation: published });
  return published;
}

function forceNextGoldenTime(reason = 'SEVEN_TENPAI_CONTINUOUS_FAILURE') {
  forcedNextDestination = GameMode.GOLDEN_TIME;
  app.nextInitialHitForceReason = reason;
  const published = publishReservation();
  core.emit('next-initial-hit-forced', { destination: GameMode.GOLDEN_TIME, reason, reservation: published, evidenceStatus: 'PUBLISHED_ANALYSIS' });
  return published;
}

function selectedReservation() {
  return publishReservation();
}

function enterReservedDestination(source = 'CHANCE_ZONE_SUCCESS') {
  const s = core.snapshot();
  if (s.modeResult !== 'PENDING_BONUS_OR_ART') return false;
  const selected = selectedReservation();

  if (selected.destination === GameMode.GOLDEN_TIME) {
    core.kernelState = Object.freeze({
      ...core.kernelState,
      modeResult: 'PENDING_GOLDEN_TIME',
      modeResultEvidenceStatus: selected.evidenceStatus
    });
    const profile = createGoldenTimeSetProfile();
    const entered = core.enterGoldenTime(profile);
    if (entered) {
      core.emit('next-initial-hit-consumed', { source, destination: GameMode.GOLDEN_TIME, reservation: selected });
      forcedNextDestination = null;
      app.nextInitialHitForceReason = null;
    }
    return entered;
  }

  if (typeof app.enterLupinBonus !== 'function') return false;
  const entered = app.enterLupinBonus(source);
  if (entered) core.emit('next-initial-hit-consumed', { source, destination: GameMode.LUPIN_BONUS, reservation: selected });
  return entered;
}

function consumeConfirmedPresentation(source = 'CONFIRMED_PRESENTATION') {
  const s = core.snapshot();
  if (![GameMode.NORMAL, GameMode.WANTED_CHANCE].includes(s.mode) || s.modeResult) return false;
  core.kernelState = Object.freeze({
    ...core.kernelState,
    modeResult: 'PENDING_BONUS_OR_ART',
    modeResultEvidenceStatus: 'PUBLISHED_ANALYSIS'
  });
  core.emit('confirmed-initial-hit-ready', { source, reservation: selectedReservation(), evidenceStatus: 'PUBLISHED_ANALYSIS' });
  return enterReservedDestination(source);
}

core.addEventListener('chance-zone-success', () => {
  enterReservedDestination('CHANCE_ZONE_SUCCESS');
});

// The next reservation is selected only after the resulting initial hit sequence finishes.
// LB success flows into GT, so only a failed LB ends the sequence here; successful LB waits for GT end.
core.addEventListener('lupin-bonus-failed', () => reserveNext());
core.addEventListener('golden-time-ended', () => reserveNext());

app.nextInitialHitRandom = random;
publishReservation();
app.reserveNextInitialHit = reserveNext;
app.forceNextGoldenTime = forceNextGoldenTime;
app.enterReservedInitialHit = enterReservedDestination;
app.consumeConfirmedPresentation = consumeConfirmedPresentation;
