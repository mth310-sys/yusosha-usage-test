const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
const message = document.querySelector('#message');
const stateValue = document.querySelector('#stateValue');

export const SEVEN_TENPAI_FAILURE_POLICY = Object.freeze({
  trigger: 'SEVEN_TENPAI_CONTINUOUS_PRESENTATION_FAILURE',
  consequence: 'NEXT_INITIAL_HIT_GOLDEN_TIME_CONFIRMED',
  evidenceStatus: 'PUBLISHED_ANALYSIS',
  naturalOccurrenceRateResolved: false,
  presentationSelectionRateResolved: false,
  oneShotReservation: true
});

function registerSevenTenpaiFailure(source = 'SEVEN_TENPAI_CONTINUOUS_FAILURE') {
  if (typeof app.forceNextGoldenTime !== 'function') return false;
  const reservation = app.forceNextGoldenTime(source);
  core.emit('seven-tenpai-continuous-failed', {
    nextDestination: reservation.destination,
    reservation,
    evidenceStatus: SEVEN_TENPAI_FAILURE_POLICY.evidenceStatus
  });
  if (stateValue) stateValue.textContent = '次回GT確定';
  if (message) message.textContent = '7テンパイ連続演出失敗 — 次回GOLDEN TIME確定';
  return reservation;
}

app.registerSevenTenpaiFailure = registerSevenTenpaiFailure;
app.sevenTenpaiFailurePolicy = SEVEN_TENPAI_FAILURE_POLICY;
