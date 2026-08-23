import { GameMode } from './game-flow-spec.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');
const core = app.core;
const machineRoot = document.querySelector('.machine');

export const CHANCE_EYE_INITIAL_HIT_POLICY = Object.freeze({
  triggerDestination: 'BONUS_OR_ART_UNRESOLVED',
  destinationDecisionSource: 'PRESELECTED_NEXT_INITIAL_HIT_RESERVATION',
  rerollOnChanceEyeHit: false,
  presentationByReservedDestination: Object.freeze({
    [GameMode.LUPIN_BONUS]: 'RED',
    [GameMode.GOLDEN_TIME]: 'SEVEN'
  }),
  evidenceStatus: 'PUBLISHED_ANALYSIS'
});

function routeResolvedDirectHit(detail) {
  const outcome = detail?.outcome;
  if (!outcome?.hit || outcome.destination !== CHANCE_EYE_INITIAL_HIT_POLICY.triggerDestination) return false;
  const snapshot = core.snapshot();
  if (![GameMode.NORMAL, GameMode.WANTED_CHANCE].includes(snapshot.mode) || snapshot.modeResult) return false;

  const reservation = app.nextInitialHitReservation;
  if (!reservation) return false;
  const alignment = CHANCE_EYE_INITIAL_HIT_POLICY.presentationByReservedDestination[reservation.destination];
  if (!alignment) return false;

  app.showLiquidReelAlignment?.(alignment);
  core.emit('chance-eye-direct-hit-ready', {
    chanceEyeKind: outcome.kind,
    context: outcome.context,
    reservedDestination: reservation.destination,
    alignment,
    evidenceStatus: CHANCE_EYE_INITIAL_HIT_POLICY.evidenceStatus
  });

  return app.consumeConfirmedPresentation?.(`CHANCE_EYE_${String(outcome.kind ?? '').toUpperCase()}_DIRECT_HIT`) ?? false;
}

machineRoot?.addEventListener('chance-eye-presented', (event) => {
  routeResolvedDirectHit(event.detail);
});

app.routeChanceEyeDirectHit = routeResolvedDirectHit;
app.chanceEyeInitialHitPolicy = CHANCE_EYE_INITIAL_HIT_POLICY;
