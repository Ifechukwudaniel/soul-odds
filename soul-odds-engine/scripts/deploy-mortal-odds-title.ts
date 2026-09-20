// Deploys the Mortal Odds title (games/soul-odds) to the local simulator chain, mirroring
// example/start.ts but pointed at that app's title definition instead of the reference example.
// Runs from soul-odds-engine's own checkout — not imported as a dependency elsewhere — so
// `deployTitleToSimulator`'s relative paths (the simulator dir, the compiled deployer artifact)
// resolve against this package and not against a pnpm `file:` link, which only copies git-tracked
// files and therefore never includes the gitignored `artifacts/` build output.
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import {
  deployTitleToSimulator,
  readSimulatorDeployment,
  SIMULATOR_DEPLOYMENT_PATH,
} from '../e2e/local-title.ts';

const TITLE_PATH = resolve(
  import.meta.dirname,
  '../../games/soul-odds/src/config/mortal-odds/soul-odds-title.json',
);
const startedAt = Date.now();

async function waitForSimulatorNode() {
  while (
    !existsSync(SIMULATOR_DEPLOYMENT_PATH) ||
    statSync(SIMULATOR_DEPLOYMENT_PATH).mtimeMs < startedAt
  ) {
    await sleep(500);
  }
}

console.log('waiting for the simulator node…');
await waitForSimulatorNode();
const { onChain, title } = await deployTitleToSimulator(readSimulatorDeployment(), TITLE_PATH);
const titleRtpWad = title.betConfigurations[0]?.configuration.rtpWad;
console.log(`${title.name} deployed at ${onChain.title}, title RTP ${Number(titleRtpWad) / 1e16}%`);
