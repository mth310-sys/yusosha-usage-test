// Step 6Z: isolated UI bridge so the large/minified ui.js does not need risky replacement.
export function renderReelIntegrity(core){
  const snap=core?.snapshot?.();
  const reels=snap?.reels;
  const integrity=reels?.integrity;
  const status=document.getElementById('reelIntegrity');
  const stopped=document.getElementById('reelStopped');
  if(status) status.textContent=integrity?.status??'---';
  if(stopped) stopped.textContent=`${integrity?.stoppedCount??0}/3`;
}
