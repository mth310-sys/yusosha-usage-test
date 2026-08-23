import { SeededRandomSource } from './random-source.js';
import { resolveIkukanAward, IKUKAN_SPEC } from './ikukan-resolver.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
const random = new SeededRandomSource(0x20160814);
const originalAddGoldenTimeTreasure = core.addGoldenTimeTreasure.bind(core);

core.addGoldenTimeTreasure = (acquisition) => {
  const stage = app.getGoldenTimeStageState?.().stage ?? null;
  if (stage !== 'IKUKAN') return originalAddGoldenTimeTreasure(acquisition);
  const ikukanAward = resolveIkukanAward(random);
  const accepted = originalAddGoldenTimeTreasure(ikukanAward);
  if (accepted) {
    core.emit('ikukan-treasure-awarded', {
      treasure: ikukanAward.treasure,
      stage,
      evidenceStatus: ikukanAward.evidenceStatus,
      replaceable: true
    });
  }
  return accepted;
};

core.addEventListener('golden-time-stage-upgraded', (event) => {
  if (event.detail.stage !== 'IKUKAN') return;
  core.emit('ikukan-enter', {
    games: IKUKAN_SPEC.games,
    averageTreasure: IKUKAN_SPEC.publishedAverageTreasure,
    evidenceStatus: 'MULTI_SOURCE_MATCH'
  });
});

app.ikukanSpec = IKUKAN_SPEC;
app.ikukanRandom = random;
