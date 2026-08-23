import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../test_lupin_zero/index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../test_lupin_zero/cabinet-enhancements.css', import.meta.url), 'utf8');

assert.match(html, /crown-wing-left/);
assert.match(html, /crown-wing-right/);
assert.match(html, /crown-crest/);
assert.match(html, /prism-housing/);
for (const id of ['betBtn','maxBetBtn','startBtn']) assert.match(html, new RegExp(`id="${id}"`));
assert.equal((html.match(/class="stop"/g) ?? []).length, 3);
assert.match(css, /@media \(max-width:370px\)/);
assert.match(css, /@media \(max-height:720px\)/);
assert.match(css, /\.prism-housing/);
assert.match(css, /\.crown-wing/);

export const CABINET_SILHOUETTE_POLICY = Object.freeze({
  targetWidthPx: 390,
  narrowPhoneBreakpointPx: 370,
  presentationOnly: true,
  changesGameLogic: false,
  preservesControlIds: true
});
