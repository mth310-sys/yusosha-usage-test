// Step 6Z: isolated integrity UI bridge so the large/minified ui.js does not need risky replacement.
function ensureBaseIntegrityPanel(){
  let panel=document.getElementById('baseGameIntegrityPanel');
  if(panel)return panel;
  const grid=document.querySelector('.grid');
  if(!grid)return null;
  panel=document.createElement('section');
  panel.className='panel';
  panel.id='baseGameIntegrityPanel';
  panel.innerHTML='<h2>BASE GAME INTEGRITY / STEP 6Z</h2><pre id="baseGameIntegrityState">NO COMPLETED GAME YET</pre>';
  grid.parentNode.insertBefore(panel,grid.nextSibling);
  return panel;
}
export function renderReelIntegrity(core){
  const snap=core?.snapshot?.();
  const reels=snap?.reels;
  const integrity=reels?.integrity;
  const status=document.getElementById('reelIntegrity');
  const stopped=document.getElementById('reelStopped');
  if(status) status.textContent=integrity?.status??'---';
  if(stopped) stopped.textContent=`${integrity?.stoppedCount??0}/3`;
  ensureBaseIntegrityPanel();
  const root=document.getElementById('baseGameIntegrityState');
  if(!root)return;
  const boundary=snap?.lastGameBoundaryIntegrity;
  const invalid=snap?.lastInvalidOperationIntegrity;
  const overall=boundary?.status??'NO COMPLETED GAME';
  root.textContent=[
    `OVERALL          ${overall}`,
    `RESULT           ${boundary?.result?.status??'---'}`,
    `BET              ${boundary?.bet?.status??'---'}`,
    `GAME COUNTER     ${boundary?.counter?.status??'---'}`,
    `STOP / COUNTER   ${boundary?.stopCounter?.status??'---'}`,
    `PHASE            ${boundary?.phase?.status??'---'}`,
    `LIVE REEL        ${integrity?.status??'---'} (${integrity?.stoppedCount??0}/3)`,
    `INVALID OP       ${invalid?.status??'NOT TESTED'}`,
    `INVALID TYPE     ${invalid?.operation??'---'}`
  ].join('\n');
}
