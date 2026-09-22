// Deploys a Soul Odds title onto the running simulator chain and plays real sessions through the
// VRF node, checking each settlement against the reference TS mirror. Needs `vp run start`.
import { parseArgs } from 'node:util';
import { decodeAbiParameters, type Hex, parseAbi, parseEther, parseEventLogs } from 'viem';
import {
  encodePrediction,
  generateSoul,
  matchBreakdown,
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
import { crimeName } from '../example/crime-names.ts';

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
  console.log(`deployer ${deployer}`);
  console.log(`title    ${onChain.title}  ${title.betConfigurations.length} era(s)`);

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

    // Session start only requests randomness for the era reveal — wait for the VRF node to fulfill
    // it and hand control back to WAITING_PLAYER_ACTION (step 2) before predicting.
    const eraRevealed = await waitForAdvancedStep(opened.args.sessionId, openedReceipt.blockNumber, 2);
    const revealedSession = await publicClient.readContract({
      address: deployment.host,
      abi: localCasinoHostAbi,
      functionName: 'decodeSession',
      args: [eraRevealed.session],
    });
    const [configurationIndex] = decodeAbiParameters(
      [{ type: 'uint256' }],
      revealedSession.gameState,
    );
    const era = title.betConfigurations[Number(configurationIndex)];

    await write(
      await walletClient.writeContract({
        address: deployment.host,
        abi: localCasinoHostAbi,
        functionName: 'submitAction',
        args: [eraRevealed.session, encodePrediction(prediction)],
      }),
    );

    const settled = await waitForSettlement(opened.args.sessionId, openedReceipt.blockNumber);

    const expectedResult = generateSoul(era.configuration, settled.randomness);
    const expectedPayout = predictionPayout(era.configuration, wager, prediction, expectedResult);
    const expectedWon = expectedPayout > 0n;
    if (settled.payout !== expectedPayout) {
      throw new Error(
        `session ${opened.args.sessionId}: chain paid ${settled.payout}, ` +
          `reference expects ${expectedPayout} for age ${expectedResult.age}`,
      );
    }
    wagered += wager;
    paid += settled.payout;

    const breakdown = matchBreakdown(prediction, expectedResult);
    const crimeIds = era.definition.crimes.map(crime => crime.id);
    const crimeLabel = (mask: number) =>
      mask === 0
        ? 'no crime'
        : crimeIds
            .filter((_, index) => (mask & (1 << index)) !== 0)
            .map(id => crimeName(era.definition.name, id))
            .join(' + ');

    console.log(
      `session ${opened.args.sessionId}  era ${era.definition.era}  ${expectedWon ? 'won' : 'lost'}  payout ${settled.payout}\n` +
        `  bet:  ${prediction.gender === 0 ? 'male' : 'female'}, bucket ${prediction.lifespanBucket}, ${crimeLabel(prediction.crimeMask)}\n` +
        `  soul: ${expectedResult.gender === 0 ? 'male' : 'female'}, born ${expectedResult.birthYear}, ` +
        `died at ${expectedResult.age}, bucket ${expectedResult.lifespanBucket}, ${crimeLabel(expectedResult.crimeMask)}\n` +
        `  matched: gender ${breakdown.genderMatch ? '✓' : '✗'}  lifespan ${breakdown.lifespanMatch ? '✓' : '✗'}  crimes ${breakdown.crimeMatch ? '✓' : '✗'}`,
    );
  }
  if (wagered === 0n) return;
  console.log(
    `\n${values.sessions} sessions settled and matched the reference sampler. ` +
      `Realized RTP ${((Number(paid) / Number(wagered)) * 100).toFixed(1)}% across the title's ` +
      `${title.betConfigurations.length} era(s).`,
  );

  async function waitForAdvancedStep(sessionId: bigint, fromBlock: bigint, step: number) {
    const deadline = Date.now() + SETTLEMENT_TIMEOUT_MS;
    while (Date.now() < deadline) {
      const logs = await publicClient.getContractEvents({
        address: deployment.host,
        abi: localCasinoHostAbi,
        eventName: 'CasinoSessionAdvanced',
        args: { sessionId, step },
        fromBlock,
      });
      if (logs.length > 0) return logs[0].args as Required<(typeof logs)[0]['args']>;
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    throw new Error(`session ${sessionId} did not advance to step ${step} within ${SETTLEMENT_TIMEOUT_MS} ms`);
  }

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
