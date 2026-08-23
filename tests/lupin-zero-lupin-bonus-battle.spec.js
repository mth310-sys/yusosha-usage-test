import assert from 'node:assert/strict';
import { LUPIN_BONUS_BATTLE_SPEC, createLupinBonusBattleState, advanceLupinBonusBattle } from '../test_lupin_zero/src/lupin-bonus-battle-resolver.js';
import { LUPIN_BONUS_SPEC } from '../test_lupin_zero/src/lupin-bonus-resolver.js';

assert.equal(LUPIN_BONUS_BATTLE_SPEC.games, 5);
assert.equal(LUPIN_BONUS_BATTLE_SPEC.opponent, 'ZENIGATA');
assert.equal(LUPIN_BONUS_BATTLE_SPEC.overallArtExpectationPercent, 50);
assert.equal(LUPIN_BONUS_BATTLE_SPEC.exactPerRoleLotteryKnown, false);
assert.equal(LUPIN_BONUS_BATTLE_SPEC.exactPerGameWinRateKnown, false);
assert.equal(LUPIN_BONUS_BATTLE_SPEC.resultSource, 'PREDETERMINED_LUPIN_BONUS_OUTCOME');
assert.equal(LUPIN_BONUS_SPEC.finalBattleGames, 5);
assert.equal(LUPIN_BONUS_SPEC.artExpectationPercent, 50);

let win = createLupinBonusBattleState({ artHit: true });
for (let step = 1; step <= 5; step++) {
  win = advanceLupinBonusBattle(win);
  assert.equal(win.step, step);
  assert.equal(win.gamesRemaining, 5 - step);
  assert.equal(win.revealed, step === 5);
  if (step < 5) assert.equal(win.result, null);
}
assert.equal(win.result, 'WIN');
assert.equal(win.destination, 'GOLDEN_TIME');

let lose = createLupinBonusBattleState({ artHit: false });
for (let step = 1; step <= 5; step++) lose = advanceLupinBonusBattle(lose);
assert.equal(lose.result, 'LOSE');
assert.equal(lose.destination, null);

console.log('lupin-zero-lupin-bonus-battle.spec: ok');
