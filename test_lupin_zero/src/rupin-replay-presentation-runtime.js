const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.physicalRoleSession) throw new Error('LUPIN ZERO core and physical role session are required');

const core = app.core;
const session = app.physicalRoleSession;
const lcdShell = document.querySelector('.lcd-shell');
const message = document.querySelector('#message');
const stopButtons = [...document.querySelectorAll('.stop')];

const style = document.createElement('style');
style.textContent = `
.rupin-replay-overlay{position:absolute;inset:0;z-index:12;pointer-events:none;display:none;align-items:center;justify-content:center;flex-direction:column;gap:10px;background:radial-gradient(circle at 50% 40%,rgba(180,20,20,.30),rgba(0,0,0,.72));font-family:sans-serif;text-align:center}
.rupin-replay-overlay.is-active{display:flex}
.rupin-replay-overlay .rr-title{font-weight:900;font-size:21px;letter-spacing:2px;color:#fff;text-shadow:0 0 8px #f00,0 0 18px #f00}
.rupin-replay-overlay .rr-sub{font-size:13px;color:#ffd875;text-shadow:0 0 8px #000}
.rupin-replay-overlay .rr-reels{display:flex;gap:10px}
.rupin-replay-overlay .rr-reel{min-width:62px;padding:7px 5px;border:1px solid rgba(255,255,255,.45);border-radius:8px;background:rgba(0,0,0,.55);font-size:11px;color:#aaa}
.rupin-replay-overlay .rr-reel.hit{color:#fff3ad;border-color:#ffd24b;box-shadow:0 0 12px rgba(255,204,0,.75);font-weight:900}
.rupin-replay-overlay.is-freeze{background:rgba(255,255,255,.92)}
.rupin-replay-overlay.is-freeze .rr-title{font-size:27px;color:#111;text-shadow:none}
.stop[data-rupin-next='true']{box-shadow:0 0 0 3px rgba(255,215,64,.45),0 0 18px rgba(255,70,40,.95)!important}
`;
document.head.appendChild(style);

const overlay = document.createElement('div');
overlay.className = 'rupin-replay-overlay';
overlay.innerHTML = '<div class="rr-title">逆押しカットイン</div><div class="rr-sub">ルパン図柄を狙え</div><div class="rr-reels"><div class="rr-reel" data-r="0">左</div><div class="rr-reel" data-r="1">中</div><div class="rr-reel" data-r="2">右</div></div>';
lcdShell?.appendChild(overlay);

const reelCells = [...overlay.querySelectorAll('.rr-reel')];
let active = false;
let targetReels = [];
let stopped = new Set();
let longFreeze = false;
let clearTimer = null;

function clearStopGuidance() {
  stopButtons.forEach((button) => delete button.dataset.rupinNext);
}

function guideReverseOrder() {
  clearStopGuidance();
  if (!active) return;
  const next = [2, 1, 0].find((index) => !stopped.has(index));
  if (next !== undefined && stopButtons[next]) stopButtons[next].dataset.rupinNext = 'true';
}

function resetPresentation() {
  active = false;
  targetReels = [];
  stopped = new Set();
  longFreeze = false;
  overlay.classList.remove('is-active', 'is-freeze');
  reelCells.forEach((cell) => { cell.classList.remove('hit'); cell.textContent = ['左','中','右'][Number(cell.dataset.r)]; });
  clearStopGuidance();
  if (clearTimer) window.clearTimeout(clearTimer);
  clearTimer = null;
}

function begin(plan) {
  resetPresentation();
  active = true;
  targetReels = [...(plan.targetReelsWithLupinSymbol ?? [])];
  longFreeze = Boolean(plan.longFreezeOnLupinAlignment);
  overlay.classList.add('is-active');
  if (message) message.textContent = '逆押しカットイン — ルパン図柄を狙え';
  guideReverseOrder();
}

core.addEventListener('spin-start', () => {
  const plan = session.snapshot()?.stopPlan;
  if (!plan?.reversePushCutIn) {
    resetPresentation();
    return;
  }
  begin(plan);
});

core.addEventListener('reel-stop', (event) => {
  if (!active) return;
  const reelIndex = event.detail.reelIndex;
  stopped.add(reelIndex);
  const cell = reelCells[reelIndex];
  if (cell) {
    const hit = targetReels.includes(reelIndex);
    cell.classList.toggle('hit', hit);
    cell.textContent = hit ? `${['左','中','右'][reelIndex]}: LUPIN` : `${['左','中','右'][reelIndex]}: —`;
  }
  guideReverseOrder();

  if (stopped.size === 3 && longFreeze && targetReels.length === 3) {
    overlay.querySelector('.rr-title').textContent = 'LUPIN × 3';
    overlay.querySelector('.rr-sub').textContent = 'LONG FREEZE';
  }
});

core.addEventListener('long-freeze', () => {
  if (!active || !longFreeze) return;
  overlay.classList.add('is-freeze');
  overlay.querySelector('.rr-title').textContent = 'LONG FREEZE';
  overlay.querySelector('.rr-sub').textContent = 'LEGEND GATE';
  clearStopGuidance();
});

core.addEventListener('spin-end', () => {
  if (!active || longFreeze) return;
  clearStopGuidance();
  clearTimer = window.setTimeout(resetPresentation, 700);
});

core.addEventListener('mode-enter', (event) => {
  if (event.detail.mode === 'LEGEND_GATE') {
    clearTimer = window.setTimeout(resetPresentation, 900);
  }
});

app.rupinReplayPresentationPolicy = Object.freeze({
  presentationOnly: true,
  selectionSource: 'RESOLVED_PHYSICAL_ROLE_SESSION',
  reversePushOrderGuidanceOnly: true,
  pushOrderForced: false,
  exactStopRowInvented: false,
  exactFullReelPositionsInvented: false,
  longFreezeOnlyForRupinReplayD: true
});
