// Deploys a Soul Odds title onto the running simulator chain and plays real sessions through the
// VRF node, checking each settlement against the reference TS mirror. Needs `vp run start`.
import { parseArgs } from 'node:util';
import { type Hex, parseAbi, parseEther, parseEventLogs } from 'viem';
import {
  encodePrediction,
  generateSoul,
  matchesPrediction,
  predictionPayout,
  type SoulPrediction,
} from '../src/index.ts';
import {
  deployTitleToSimulator,
  EXAMPLE_TITLE_PATH,
  localCasinoHostAbi,
  readSimulatorDeployment,
  SIMULATOR_DEPLOYMENT_PATH,
} from './local-title.ts';

const SETTLEMENT_TIMEOUT_MS = 60_000;
const tokenAbi = parseAbi(['function approve(address spender, uint256 amount) returns (bool)']);

const { values } = parseArgs({
  options: {
    deployed: { type: 'string', default: SIMULATOR_DEPLOYMENT_PATH },
    title: { type: 'string', default: EXAMPLE_TITLE_PATH },
    sessions: { type: 'string', default: '25' },
  },
});

/** Cycles through a spread of valid predictions: both genders, every bucket, 0/1/2 crimes. */
function predictionForRound(round: number): SoulPrediction {
  const gender = round % 2;
  const lifespanBucket = Math.floor(round / 2) % 4;
  const crimeMasks = [0, 0b0001, 0b0011, 0b0110, 0b1000];
  const crimeMask = crimeMasks[round % crimeMasks.length];
  return { gender, lifespanBucket, sins: crimeMask !== 0, crimeMask };
}

async function main() {
  const deployment = readSimulatorDeployment(values.deployed);
  const { deployer, title, onChain, publicClient, walletClient } = await deployTitleToSimulator(
    deployment,
    values.title,
  );
  const base = title.betConfigurations[0];
  console.log(`deployer ${deployer}`);
  console.log(`title    ${onChain.title}  RTP ${Number(base.configuration.rtpWad) / 1e16}%`);

  const write = async (hash: Hex) => publicClient.waitForTransactionReceipt({ hash });
  await write(
    await walletClient.writeContract({
      address: deployment.token,
      abi: tokenAbi,
      functionName: 'approve',
      args: [deployment.host, parseEther('1000000')],
    }),
  );

  const wager = parseEther('1');
  let wagered = 0n;
  let paid = 0n;
  for (let i = 0; i < Number(values.sessions); i++) {
    const prediction = predictionForRound(i);

    const openedReceipt = await write(
      await walletClient.writeContract({
        address: deployment.host,
        abi: localCasinoHostAbi,
        functionName: 'openSession',
        args: [onChain.title, deployment.vault, wager, '0x'],
      }),
    );
    const [opened] = parseEventLogs({
      abi: localCasinoHostAbi,
      eventName: 'CasinoSessionOpened',
      logs: openedReceipt.logs,
    });
    const [advanced] = parseEventLogs({
      abi: localCasinoHostAbi,
      eventName: 'CasinoSessionAdvanced',
      logs: openedReceipt.logs,
    });

    await write(
      await walletClient.writeContract({
        address: deployment.host,
        abi: localCasinoHostAbi,
        functionName: 'submitAction',
        args: [advanced.args.session, encodePrediction(prediction)],
      }),
    );

    const settled = await waitForSettlement(opened.args.sessionId, openedReceipt.blockNumber);

    const expectedResult = generateSoul(base.configuration, settled.randomness);
    const expectedWon = matchesPrediction(prediction, expectedResult);
    const expectedPayout = expectedWon ? predictionPayout(base.configuration, wager, prediction) : 0n;
    if (settled.payout !== expectedPayout) {
      throw new Error(
        `session ${opened.args.sessionId}: chain paid ${settled.payout}, ` +
          `reference expects ${expectedPayout} for age ${expectedResult.age}`,
      );
    }
    wagered += wager;
    paid += settled.payout;
    console.log(
      `session ${opened.args.sessionId}  ${expectedWon ? 'won' : 'lost'}  age ${expectedResult.age}`,
    );
  }
  if (wagered === 0n) return;
  console.log(
    `\n${values.sessions} sessions settled and matched the reference sampler. ` +
      `Realized RTP ${((Number(paid) / Number(wagered)) * 100).toFixed(1)}% against a title RTP of ` +
      `${Number(base.configuration.rtpWad) / 1e16}%.`,
  );

  async function waitForSettlement(sessionId: bigint, fromBlock: bigint) {
    const deadline = Date.now() + SETTLEMENT_TIMEOUT_MS;
    while (Date.now() < deadline) {
      const logs = await publicClient.getContractEvents({
        address: deployment.host,
        abi: localCasinoHostAbi,
        eventName: 'CasinoSessionSettled',
        args: { sessionId },
        fromBlock,
      });
      if (logs.length > 0) return logs[0].args as Required<(typeof logs)[0]['args']>;
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    throw new Error(`session ${sessionId} did not settle within ${SETTLEMENT_TIMEOUT_MS} ms`);
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
