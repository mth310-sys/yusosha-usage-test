import { SeededRandomSource } from './random-source.js';
import { resolveRizeZoneOutcome, resolveSevenZoneOutcome, PRECURSOR_ZONE_POLICY } from './precursor-zone-resolver.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
const rizeRandom = new SeededRandomSource(0x20160818);
const message = document.querySelector('#message');
const stateValue = document.querySelector('#stateValue');
const phaseBadge = document.querySelector('#phaseBadge');

function emitPresentation(zone, result) {
  core.emit('precursor-zone-enter', { zone, result, evidenceStatus: result.evidenceStatus });
  if (phaseBadge) phaseBadge.textContent = zone === 'SEVEN_ZONE' ? 'SEVEN ZONE' : 'RIZE ZONE';
  if (stateValue) stateValue.textContent = zone === 'SEVEN_ZONE' ? 'GT確定' : '前兆';
  if (message) message.textContent = zone === 'SEVEN_ZONE' ? 'SEVEN ZONE — GOLDEN TIME' : 'RIZE ZONE';
  return result;
}

function enterRizeZone() {
  const result = resolveRizeZoneOutcome(rizeRandom);
  emitPresentation('RIZE_ZONE', result);
  core.emit('precursor-zone-resolved', { zone: 'RIZE_ZONE', result, evidenceStatus: result.evidenceStatus });
  return result;
}

function enterSevenZone() {
  const result = resolveSevenZoneOutcome();
  emitPresentation('SEVEN_ZONE', result);
  core.emit('precursor-zone-resolved', { zone: 'SEVEN_ZONE', result, evidenceStatus: result.evidenceStatus });
  return result;
}

app.rizeZoneRandom = rizeRandom;
app.enterRizeZone = enterRizeZone;
app.enterSevenZone = enterSevenZone;
app.precursorZonePolicy = PRECURSOR_ZONE_POLICY;
