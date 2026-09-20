import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { network } from 'hardhat';
import { type Address, decodeAbiParameters, type Hex, keccak256, parseEther, toHex, zeroAddress } from 'viem';
import {
  encodePrediction,
  generateSoul,
  loadTitleFile,
  matchesPrediction,
  maxPayout,
  minimumPredictionProbabilityWad,
  predictionPayout,
  predictionProbabilityWad,
  type SoulPrediction,
  validCrimeMasks,
  varianceWad,
} from '../src/index.ts';

const WAITING_RANDOMNESS = 1;
const WAITING_PLAYER_ACTION = 2;
const SETTLED = 3;
const EXAMPLE_TITLE = new URL('../example/title.json', import.meta.url).pathname;

const randomnessForRoll = (roll: bigint) => toHex(roll, { size: 32 });

const sessionContext = (wager: bigint, gameData: Hex, gameState: Hex = '0x') => ({
  sessionId: 1n,
  player: zeroAddress,
  vault: zeroAddress,
  wagerBase: wager,
  escrowedStake: wager,
  reservedProfit: 0n,
  step: 0,
  gameData,
  gameState,
});

const settledGameStateAbi = [
  { type: 'tuple', components: [
    { type: 'uint8', name: 'gender' },
    { type: 'uint8', name: 'lifespanBucket' },
    { type: 'bool', name: 'sins' },
    { type: 'uint8', name: 'crimeMask' },
  ] },
  { type: 'tuple', components: [
    { type: 'uint8', name: 'gender' },
    { type: 'uint16', name: 'age' },
    { type: 'uint8', name: 'lifespanBucket' },
    { type: 'uint8', name: 'crimeMask' },
  ] },
  { type: 'bool' },
] as const;

function decodeSettledGameState(data: Hex) {
  const [prediction, result, won] = decodeAbiParameters(settledGameStateAbi, data);
  return { prediction, result, won };
}

describe('SoulOddsEngine', async () => {
  const { viem } = await network.getOrCreate();
  const publicClient = await viem.getPublicClient();
  const [council, stranger] = await viem.getWalletClients();

  const example = loadTitleFile(EXAMPLE_TITLE).betConfigurations[0];
  let deployer: Awaited<ReturnType<typeof deploySoulOddsTitleDeployer>>;
  let exampleTitle: Address;

  async function deploySoulOddsTitleDeployer() {
    return viem.deployContract('SoulOddsTitleDeployer', [council.account.address]);
  }

  before(async () => {
    deployer = await deploySoulOddsTitleDeployer();
    const hash = await deployer.write.deployTitle([example.input]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const [deployedLog] = await publicClient.getContractEvents({
      address: deployer.address,
      abi: deployer.abi,
      eventName: 'SoulOddsTitleDeployed',
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });
    exampleTitle = (deployedLog.args as { title: Address }).title;
  });

  describe('example title', () => {
    it('stores exactly the configuration that was deployed', async () => {
      const title = await viem.getContractAt('SoulOddsEngine', exampleTitle);
      const onChain = await title.read.betConfiguration([0]);
      assert.equal(onChain.era, example.input.era);
      assert.equal(onChain.minBirthYear, example.input.minBirthYear);
      assert.equal(onChain.maxBirthYear, example.input.maxBirthYear);
      assert.equal(onChain.maleWeight, example.input.maleWeight);
      assert.equal(onChain.femaleWeight, example.input.femaleWeight);
      assert.equal(onChain.rtpWad, example.input.rtpWad);
      assert.equal(await title.read.betConfigurationCount(), 1n);
      assert.equal(await title.read.titleRtpWad(), example.input.rtpWad);
      assert.equal(await title.read.rtpWad([0]), example.input.rtpWad);
    });

    it('quotes risk figures matching the TS mirror', async () => {
      const title = await viem.getContractAt('SoulOddsEngine', exampleTitle);
      const wager = parseEther('3');
      const [maxPayoutOnChain, probabilityWad, , bodyVarianceScaled] = await title.read.quoteRiskParams([
        wager,
        '0x',
      ]);
      assert.equal(maxPayoutOnChain, maxPayout(example.configuration, wager));
      assert.equal(probabilityWad, minimumPredictionProbabilityWad(example.configuration));
      assert.equal(bodyVarianceScaled, wager * wager * varianceWad(example.configuration));
      assert.deepEqual(await title.read.quoteCaps([wager, '0x']), [
        wager,
        maxPayoutOnChain > wager ? maxPayoutOnChain - wager : 0n,
      ]);
    });

    it('generates the same soul as the TS mirror across many randomness values, and pays the same amount for a fixed prediction', async () => {
      const title = await viem.getContractAt('SoulOddsEngine', exampleTitle);
      const wager = parseEther('1');
      // Gender + bucket + no-crime: common enough (~10%) to reliably hit within 300 draws, while
      // every draw below still cross-checks the full contract/TS agreement regardless of outcome.
      const prediction: SoulPrediction = { gender: 0, lifespanBucket: 1, sins: false, crimeMask: 0 };
      const context = sessionContext(wager, '0x', encodePrediction(prediction));

      let randomness = keccak256(toHex('soul-odds-engine'));
      let hits = 0;
      for (let i = 0; i < 300; i++) {
        randomness = keccak256(randomness);
        const expectedResult = generateSoul(example.configuration, randomness);
        const expectedWon = matchesPrediction(prediction, expectedResult);
        const expectedPayout = expectedWon
          ? predictionPayout(example.configuration, wager, prediction)
          : 0n;

        const settled = await title.read.onRandomness([context, randomness]);
        const { result, won } = decodeSettledGameState(settled.newGameState);
        assert.equal(settled.nextPhase, SETTLED);
        assert.equal(settled.payout, expectedPayout);
        assert.equal(won, expectedWon);
        assert.equal(result.gender, expectedResult.gender);
        assert.equal(result.lifespanBucket, expectedResult.lifespanBucket);
        assert.equal(result.crimeMask, expectedResult.crimeMask);
        if (expectedWon) hits++;
      }
      assert.ok(hits > 0, 'the fixed prediction should hit at least once in 300 draws');
    });

    it('opens into WAITING_PLAYER_ACTION without requesting randomness, then requests it on the player action', async () => {
      const title = await viem.getContractAt('SoulOddsEngine', exampleTitle);
      const wager = parseEther('1');
      const opened = await title.read.onSessionStart([sessionContext(wager, '0x')]);
      assert.equal(opened.nextPhase, WAITING_PLAYER_ACTION);
      assert.equal(opened.requestRandomnessNow, false);

      const prediction: SoulPrediction = { gender: 1, lifespanBucket: 2, sins: false, crimeMask: 0 };
      const action = encodePrediction(prediction);
      const acted = await title.read.onPlayerAction([sessionContext(wager, '0x'), action]);
      assert.equal(acted.nextPhase, WAITING_RANDOMNESS);
      assert.equal(acted.requestRandomnessNow, true);
      assert.equal(acted.newGameState, action);
      assert.equal(
        acted.reservedProfitDelta,
        predictionPayout(example.configuration, wager, prediction) - wager,
      );
    });

    it('rejects invalid predictions', async () => {
      const title = await viem.getContractAt('SoulOddsEngine', exampleTitle);
      const context = sessionContext(1n, '0x');
      const invalid = [
        encodePrediction({ gender: 2, lifespanBucket: 0, sins: false, crimeMask: 0 }),
        encodePrediction({ gender: 0, lifespanBucket: 4, sins: false, crimeMask: 0 }),
        encodePrediction({ gender: 0, lifespanBucket: 0, sins: true, crimeMask: 0 }),
        encodePrediction({ gender: 0, lifespanBucket: 0, sins: false, crimeMask: 0b0111 }),
      ] as const;
      for (const action of invalid) {
        await viem.assertions.revertWithCustomError(
          title.read.onPlayerAction([context, action]),
          title,
          'SoulOddsEngine__InvalidPrediction',
        );
      }
    });

    it('has no forfeit value and rejects unknown bet configurations', async () => {
      const title = await viem.getContractAt('SoulOddsEngine', exampleTitle);
      const context = sessionContext(1n, '0x');
      assert.equal(await title.read.quoteForfeitPayout([context]), 0n);
      await viem.assertions.revertWithCustomErrorWithArgs(
        title.read.quoteCaps([1n, '0x01']),
        title,
        'SoulOddsEngine__UnknownBetConfiguration',
        [1n],
      );
      await viem.assertions.revertWithCustomError(
        title.read.quoteCaps([1n, '0x0000']),
        title,
        'SoulOddsEngine__InvalidGameData',
      );
    });

    it('every valid crime mask carries a positive probability, matching the TS sweep', () => {
      for (const mask of validCrimeMasks()) {
        const probability = predictionProbabilityWad(example.configuration, {
          gender: 0,
          lifespanBucket: 1,
          sins: mask !== 0,
          crimeMask: mask,
        });
        assert.ok(probability > 0n, `mask ${mask} should be reachable`);
      }
    });
  });

  describe('the engine itself', () => {
    it('is not a game', async () => {
      const engine = await viem.getContractAt('SoulOddsEngine', await deployer.read.engine());
      await viem.assertions.revertWithCustomError(
        engine.read.quoteCaps([1n, '0x']),
        engine,
        'SoulOddsEngine__NotATitle',
      );
    });
  });

  describe('deploy-time validation', () => {
    it('rejects deployment from anyone but the owner', async () => {
      await viem.assertions.revertWithCustomError(
        deployer.write.deployTitle([example.input], { account: stranger.account }),
        deployer,
        'OwnableUnauthorizedAccount',
      );
    });

    it('rejects an invalid era', async () => {
      // Solidity decodes the calldata `era` straight into the `SoulEra` enum, so an out-of-range
      // value (6, past `Contemporary`) reverts as an enum-conversion panic before `_validateEra`'s
      // own check ever runs — the explicit check only guards internal/memory-struct call sites.
      await assert.rejects(deployer.write.deployTitle([{ ...example.input, era: 6 }]));
    });

    it('rejects an inverted or out-of-range birth year range', async () => {
      await viem.assertions.revertWithCustomError(
        deployer.write.deployTitle([{ ...example.input, minBirthYear: 100, maxBirthYear: 50 }]),
        deployer,
        'SoulOddsTitleDeployer__InvalidBirthRange',
      );
      await viem.assertions.revertWithCustomError(
        deployer.write.deployTitle([{ ...example.input, minBirthYear: -7000 }]),
        deployer,
        'SoulOddsTitleDeployer__BirthYearTooEarly',
      );
      await viem.assertions.revertWithCustomError(
        deployer.write.deployTitle([{ ...example.input, maxBirthYear: 3000 }]),
        deployer,
        'SoulOddsTitleDeployer__BirthYearTooLate',
      );
    });

    it('rejects zero gender weights', async () => {
      await viem.assertions.revertWithCustomError(
        deployer.write.deployTitle([{ ...example.input, maleWeight: 0, femaleWeight: 0 }]),
        deployer,
        'SoulOddsTitleDeployer__InvalidGenderWeights',
      );
    });

    it('rejects an RTP outside the [93%, 98%] band', async () => {
      await viem.assertions.revertWithCustomError(
        deployer.write.deployTitle([{ ...example.input, rtpWad: (90n * 10n ** 18n) / 100n }]),
        deployer,
        'SoulOddsTitleDeployer__RtpTooLow',
      );
      await viem.assertions.revertWithCustomError(
        deployer.write.deployTitle([{ ...example.input, rtpWad: (99n * 10n ** 18n) / 100n }]),
        deployer,
        'SoulOddsTitleDeployer__RtpTooHigh',
      );
    });

    it('rejects a malformed lifespan or crime', async () => {
      const badLifespans = example.input.lifespans.map((lifespan, index) =>
        index === 0 ? { ...lifespan, minYears: 10, maxYears: 5 } : lifespan,
      ) as unknown as typeof example.input.lifespans;
      await viem.assertions.revertWithCustomErrorWithArgs(
        deployer.write.deployTitle([{ ...example.input, lifespans: badLifespans }]),
        deployer,
        'SoulOddsTitleDeployer__InvalidLifespan',
        [0n],
      );

      const badCrimes = example.input.crimes.map((crime, index) =>
        index === 2 ? { ...crime, selectionWeight: 0 } : crime,
      ) as unknown as typeof example.input.crimes;
      await viem.assertions.revertWithCustomErrorWithArgs(
        deployer.write.deployTitle([{ ...example.input, crimes: badCrimes }]),
        deployer,
        'SoulOddsTitleDeployer__InvalidCrime',
        [2n],
      );
    });
  });
});
