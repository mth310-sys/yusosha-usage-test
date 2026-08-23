import { GameMode } from './game-flow-spec.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.game) throw new Error('LUPIN ZERO runtime is required');

const core = app.core;
function view() { return app.game.scene.getScene('LupinView'); }
function stageState() { return app.getGoldenTimeStageState?.() ?? null; }

function draw(modeLabel = '') {
  const s = core.snapshot();
  const stage = stageState();
  if (![GameMode.GOLDEN_TIME, GameMode.TREASURE_RUSH].includes(s.mode)) return false;
  return view().showGoldenTimeHud({
    stage: stage?.stage ?? 'JAPAN_A',
    treasure: s.goldenTimeTreasure ?? 0,
    modeLabel,
    holds: app.getTreasureHuntHoldView?.() ?? ['NORMAL','NORMAL','NORMAL','NORMAL']
  });
}

core.addEventListener('mode-enter', (event) => {
  if (event.detail.mode === GameMode.GOLDEN_TIME) draw('');
  else if (event.detail.mode === GameMode.TREASURE_RUSH) draw('TREASURE RUSH');
  else if (![GameMode.EXTRA_BONUS, GameMode.GOLD_RUSH].includes(event.detail.mode)) view().hideGoldenTimeHud();
});
core.addEventListener('golden-time-stage-configured', () => draw(''));
core.addEventListener('golden-time-stage-upgraded', (event) => draw(event.detail.stage === 'IKUKAN' ? '異空間' : ''));
core.addEventListener('golden-time-treasure-acquired', () => draw(view().gtMode?.text ?? ''));
core.addEventListener('lupin-rush-enter', (event) => draw(`LUPIN RUSH ${String(event.detail.pattern ?? '').replaceAll('_',' ')}`));
core.addEventListener('lupin-rush-ended', () => draw(''));
core.addEventListener('treasure-hunt-enter', () => draw('TREASURE HUNT'));
core.addEventListener('treasure-hunt-presentation', (event) => draw(String(event.detail.label ?? 'TREASURE HUNT')));
core.addEventListener('treasure-hunt-success', () => draw('TREASURE HUNT SUCCESS'));
core.addEventListener('treasure-rush-game-settled', () => draw('TREASURE RUSH'));
core.addEventListener('treasure-rush-ended', () => draw(''));
core.addEventListener('ikukan-enter', () => draw('異空間'));
core.addEventListener('ikukan-game-settled', () => draw('異空間'));
core.addEventListener('extra-bonus-enter', () => view().setGoldenTimeModeLabel('EXTRA BONUS'));
core.addEventListener('golden-time-ended', () => view().hideGoldenTimeHud());
core.addEventListener('change', () => {
  const s = core.snapshot();
  if ([GameMode.GOLDEN_TIME, GameMode.TREASURE_RUSH].includes(s.mode) && view().gtVisible) {
    view().gtTreasure?.setText(`${Math.round((s.goldenTimeTreasure ?? 0) / 10000)}万T`);
  }
});

app.refreshGoldenTimeLcd = draw;
