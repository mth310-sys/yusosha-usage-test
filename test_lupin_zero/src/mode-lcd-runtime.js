import { GameMode } from './game-flow-spec.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.game) throw new Error('LUPIN ZERO runtime is required');
const core = app.core;
function view(){ return app.game.scene.getScene('LupinView'); }

function draw(snapshot = core.snapshot()) {
  const s = snapshot;
  if ([GameMode.GOLDEN_TIME, GameMode.TREASURE_RUSH, GameMode.EXTRA_BONUS, GameMode.GOLD_RUSH, GameMode.LEGEND_GATE].includes(s.mode)) return false;
  if (s.mode === GameMode.NORMAL) {
    if (s.raiunHighGamesRemaining > 0) return view().showModeHud({ mode:'RAIUN_HIGH', label:'雷雲高確', meta:`RANK ${s.raiunHighRank ?? 'LOW'}`, counter:`残り ${s.raiunHighGamesRemaining}G` });
    return view().showModeHud({ mode:'NORMAL', label:'消されたルパン', meta:`雷雲 ${s.raiunPoints ?? 0}pt`, counter:s.wantedTriggerGame ? `WANTED ${s.normalGamesSinceWantedReset ?? 0}/${s.wantedTriggerGame}G` : '' });
  }
  if (s.mode === GameMode.WANTED_CHANCE) return view().showModeHud({ mode:'WANTED_CHANCE', counter:`残り ${s.modeGamesRemaining ?? 0}G`, meta:'CHANCE EYE HIGH RATE' });
  if (s.mode === GameMode.RAIUN_MODE) return view().showModeHud({ mode:'RAIUN_MODE', counter:`残り ${s.modeGamesRemaining ?? 0}G`, meta:'7揃いで GOLDEN TIME' });
  if (s.mode === GameMode.ODOROBO_ZONE) return view().showModeHud({ mode:'ODOROBO_ZONE', counter:`残り ${s.modeGamesRemaining ?? 0}G`, meta:'奇数揃いを狙え' });
  if (s.mode === GameMode.FUJIKO_ZONE) return view().showModeHud({ mode:'FUJIKO_ZONE', counter:`残り ${s.modeGamesRemaining ?? 0}G`, meta:'奇数揃いを狙え' });
  if (s.mode === GameMode.LUPIN_BONUS) {
    const remaining = s.modeGamesRemaining ?? 0;
    return view().showModeHud({ mode:'LUPIN_BONUS', label:remaining <= 5 ? '銭形バトル' : 'LUPIN BONUS', counter:`残り ${remaining}G`, meta:remaining <= 5 ? '撃破で GOLDEN TIME' : '30G + FINAL BATTLE 5G' });
  }
  return false;
}

core.addEventListener('mode-enter', (event)=>draw(event.detail.snapshot));
core.addEventListener('mode-exit', (event)=>draw(event.detail.snapshot));
core.addEventListener('mode-game-advanced', (event)=>draw(event.detail.snapshot));
core.addEventListener('normal-progression-advanced', (event)=>draw(event.detail.snapshot));
core.addEventListener('raiun-points-added', (event)=>draw(event.detail.snapshot));
core.addEventListener('raiun-points-set', (event)=>draw(event.detail.snapshot));
core.addEventListener('raiun-high-enter', (event)=>draw(event.detail.snapshot));
core.addEventListener('raiun-high-game-resolved', (event)=>draw(event.detail.snapshot));
core.addEventListener('raiun-mode-game-settled', (event)=>draw(event.detail.snapshot));
core.addEventListener('lupin-bonus-game-settled', (event)=>draw(event.detail.snapshot));
core.addEventListener('change', (event)=>{
  const s = event.detail.snapshot;
  if (![GameMode.GOLDEN_TIME,GameMode.TREASURE_RUSH,GameMode.EXTRA_BONUS,GameMode.GOLD_RUSH,GameMode.LEGEND_GATE].includes(s.mode)) draw(s);
});

draw();
app.refreshModeLcd = draw;
