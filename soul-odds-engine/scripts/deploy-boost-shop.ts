// Deploys BoostShop to the local simulator chain, mirroring deploy-mortal-odds-title.ts but for
// a standalone contract with no title/game registration step.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { createSimulatorClients, readSimulatorDeployment, SIMULATOR_DEPLOYMENT_PATH } from '../e2e/local-title.ts';

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

const deployment = readSimulatorDeployment();
const { account, publicClient, walletClient } = createSimulatorClients(deployment);

const artifact = JSON.parse(
  readFileSync(resolve(import.meta.dirname, '../artifacts/contracts/BoostShop.sol/BoostShop.json'), 'utf8'),
);

const deployHash = await walletClient.deployContract({
  abi: artifact.abi,
  bytecode: artifact.bytecode,
  args: [account.address, deployment.token],
});
const { contractAddress } = await publicClient.waitForTransactionReceipt({ hash: deployHash });
if (!contractAddress) throw new Error('BoostShop deployment failed');

console.log(`BoostShop deployed at ${contractAddress}, owned by ${account.address}, paid in ${deployment.token}`);
