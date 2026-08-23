import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../test_lupin_zero/index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../test_lupin_zero/cabinet-enhancements.css', import.meta.url), 'utf8');

assert.match(html, /cabinet-enhancements\.css/);
assert.match(html, /cabinet-rib-left/);
assert.match(html, /control-deck/);
assert.match(html, /panel-emblem/);
assert.match(html, /id="betBtn"/);
assert.match(html, /id="maxBetBtn"/);
assert.match(html, /id="startBtn"/);
assert.match(html, /data-reel="0"/);
assert.match(html, /data-reel="1"/);
assert.match(html, /data-reel="2"/);
assert.match(css, /\.cabinet-rib/);
assert.match(css, /\.control-deck/);
assert.match(css, /\.stop/);
assert.match(css, /\.lower-panel/);
assert.doesNotMatch(css, /credit\s*:/i);
assert.doesNotMatch(css, /probability|random|kernelState|goldenTimeTreasure/i);
