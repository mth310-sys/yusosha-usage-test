import { resolveConfirmedPresentation, CONFIRMED_PRESENTATION_SPEC } from './confirmed-presentation-resolver.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
const message = document.querySelector('#message');
const stateValue = document.querySelector('#stateValue');
const phaseBadge = document.querySelector('#phaseBadge');

function triggerConfirmedPresentation(trigger) {
  const resolution = resolveConfirmedPresentation(trigger);
  if (!resolution.confirmed) return resolution;

  core.emit('confirmed-presentation', {
    trigger,
    destinationFamily: resolution.destinationFamily,
    evidenceStatus: resolution.evidenceStatus
  });

  if (phaseBadge) phaseBadge.textContent = 'CONFIRMED';
  if (stateValue) stateValue.textContent = 'BONUS / GT 確定';
  if (message) message.textContent = `${trigger.replaceAll('_', ' ')} — 確定`;

  const consumed = typeof app.consumeConfirmedPresentation === 'function'
    ? app.consumeConfirmedPresentation(`CONFIRMED_PRESENTATION:${trigger}`)
    : false;

  return Object.freeze({ ...resolution, consumed });
}

app.triggerConfirmedPresentation = triggerConfirmedPresentation;
app.confirmedPresentationSpec = CONFIRMED_PRESENTATION_SPEC;
