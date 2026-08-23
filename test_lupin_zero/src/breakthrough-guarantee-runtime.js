import { resolveBreakthroughGuarantee } from './breakthrough-guarantee-resolver.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');
const core = app.core;
const message = document.querySelector('#message');

function applyBreakthroughGuarantee(type) {
  const resolution = resolveBreakthroughGuarantee(type);
  if (!resolution) return false;
  const snapshot = core.snapshot();
  const before = snapshot.goldenTimeStockCount ?? 0;
  const after = before + resolution.minimumGtStockAward;
  core.kernelState = Object.freeze({
    ...core.kernelState,
    goldenTimeStockCount: after
  });
  core.emit('breakthrough-guarantee-applied', {
    ...resolution,
    stockBefore: before,
    stockAfter: after
  });
  if (message) message.textContent = `${resolution.label} — GT STOCK +${resolution.minimumGtStockAward}`;
  return true;
}

app.applyBreakthroughGuarantee = applyBreakthroughGuarantee;
app.resolveBreakthroughGuarantee = resolveBreakthroughGuarantee;
