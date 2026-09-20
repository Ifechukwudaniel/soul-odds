import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { network } from 'hardhat';
import { type Address, decodeAbiParameters, type Hex, keccak256, parseEther, toHex, zeroAddress } from 'viem';
import {
  encodePrediction,
  generateSoul,
  loadTitleFile,
  matchBreakdown,
  maxPayout,
  minimumPredictionProbabilityWad,
  pickConfigurationIndex,
  predictionMaxPayout,
  predictionPayout,
  predictionProbabilityWad,
  type SoulPrediction,
  titleAverageRtpWad,
  validCrimeMasks,
  varianceWad,
  worstCaseConfiguration,
} from '../src/index.ts';

const WAITING_RANDOMNESS = 1;
const WAITING_PLAYER_ACTION = 2;
const SETTLED = 3;
const EXAMPLE_TITLE = new URL('../example/title.json', import.meta.url).pathname;

// `0 % N === 0` for any era count, so this deterministically reveals configuration index 0.
const ZERO_RANDOMNESS = toHex(0n, { size: 32 });

const configurationIndexAbi = [{ type: 'uint256' }] as const;

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
    { type: 'int16', name: 'birthYear' },
    { type: 'uint8', name: 'lifespanBucket' },
    { type: 'uint8', name: 'crimeMask' },
  ] },
  { type: 'bool' },
  { type: 'tuple', components: [
    { type: 'bool', name: 'genderMatch' },
    { type: 'bool', name: 'lifespanMatch' },
    { type: 'bool', name: 'crimeMatch' },
  ] },
] as const;

function decodeSettledGameState(data: Hex) {
  const [prediction, result, won, breakdown] = decodeAbiParameters(settledGameStateAbi, data);
  return { prediction, result, won, breakdown };
}

describe('SoulOddsEngine', async () => {
  const { viem } = await network.getOrCreate();
  const publicClient = await viem.getPublicClient();
  const [council, stranger] = await viem.getWalletClients();

  const exampleTitleFile = loadTitleFile(EXAMPLE_TITLE);
  const example = exampleTitleFile.betConfigurations[0];
  const allInputs = exampleTitleFile.betConfigurations.map(betConfiguration => betConfiguration.input);
  const allConfigurations = exampleTitleFile.betConfigurations.map(
    betConfiguration => betConfiguration.configuration,
  );

  let deployer: Awaited<ReturnType<typeof deploySoulOddsTitleDeployer>>;
  let exampleTitle: Address;

  async function deploySoulOddsTitleDeployer() {
    return viem.deployContract('SoulOddsTitleDeployer', [council.account.address]);
  }

  before(async () => {
    deployer = await deploySoulOddsTitleDeployer();
    const hash = await deployer.write.deployTitle([allInputs]);
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
    it('stores exactly the configurations that were deployed', async () => {
      const title = await viem.getContractAt('SoulOddsEngine', exampleTitle);
      assert.equal(await title.read.betConfigurationCount(), BigInt(allInputs.length));
      for (let index = 0; index < allInputs.length; index++) {
        const input = allInputs[index];
        const onChain = await title.read.betConfiguration([index]);
        assert.equal(onChain.era, input.era);
        assert.equal(onChain.minBirthYear, input.minBirthYear);
        assert.equal(onChain.maxBirthYear, input.maxBirthYear);
        assert.equal(onChain.maleWeight, input.maleWeight);
        assert.equal(onChain.femaleWeight, input.femaleWeight);
        assert.equal(onChain.rtpWad, input.rtpWad);
        assert.equal(await title.read.rtpWad([index]), input.rtpWad);
      }
      assert.equal(await title.read.titleRtpWad(), titleAverageRtpWad(allConfigurations));
    });

    it('quotes risk figures matching the TS mirror, worst-case across every era', async () => {
      const title = await viem.getContractAt('SoulOddsEngine', exampleTitle);
      const wager = parseEther('3');
      const worst = worstCaseConfiguration(allConfigurations);
      const [maxPayoutOnChain, probabilityWad, expectedPayout, bodyVarianceScaled] =
        await title.read.quoteRiskParams([wager, '0x']);
      assert.equal(maxPayoutOnChain, maxPayout(worst, wager));
      assert.equal(probabilityWad, minimumPredictionProbabilityWad(worst));
      assert.equal(expectedPayout, (wager * titleAverageRtpWad(allConfigurations)) / 10n ** 18n);
      assert.equal(bodyVarianceScaled, wager * wager * varianceWad(worst));
      assert.deepEqual(await title.read.quoteCaps([wager, '0x']), [
        wager,
        maxPayoutOnChain > wager ? maxPayoutOnChain - wager : 0n,
      ]);
    });

    it('rejects non-empty game data on the entry points', async () => {
      const title = await viem.getContractAt('SoulOddsEngine', exampleTitle);
      await viem.assertions.revertWithCustomError(
        title.read.quoteCaps([1n, '0x01']),
        title,
        'SoulOddsEngine__InvalidGameData',
      );
      await viem.assertions.revertWithCustomError(
        title.read.quoteRiskParams([1n, '0x01']),
        title,
        'SoulOddsEngine__InvalidGameData',
      );
      await viem.assertions.revertWithCustomError(
        title.read.onSessionStart([sessionContext(1n, '0x01')]),
        title,
        'SoulOddsEngine__InvalidGameData',
      );
    });

    it('reveals an era before the player predicts, then generates the same soul as the TS mirror and pays the same partial credit', async () => {
      const title = await viem.getContractAt('SoulOddsEngine', exampleTitle);
      const wager = parseEther('1');

      const started = await title.read.onSessionStart([sessionContext(wager, '0x')]);
      assert.equal(started.nextPhase, WAITING_RANDOMNESS);
      assert.equal(started.requestRandomnessNow, true);

      // Deterministically reveal configuration index 0 (the example/Ancient era) for a stable cross-check.
      const revealed = await title.read.onRandomness([sessionContext(wager, '0x', '0x'), ZERO_RANDOMNESS]);
      assert.equal(revealed.nextPhase, WAITING_PLAYER_ACTION);
      assert.equal(revealed.requestRandomnessNow, false);
      const [revealedIndex] = decodeAbiParameters(configurationIndexAbi, revealed.newGameState);
      assert.equal(revealedIndex, 0n);

      // Gender + bucket + no-crime: common enough (~10%) to reliably hit within 300 draws, while
      // every draw below still cross-checks the full contract/TS agreement regardless of outcome.
      const prediction: SoulPrediction = { gender: 0, lifespanBucket: 1, sins: false, crimeMask: 0 };
      const acted = await title.read.onPlayerAction([
        sessionContext(wager, '0x', revealed.newGameState),
        encodePrediction(prediction),
      ]);
      assert.equal(acted.nextPhase, WAITING_RANDOMNESS);
      assert.equal(acted.requestRandomnessNow, true);
      assert.equal(
        acted.reservedProfitDelta,
        predictionMaxPayout(example.configuration, wager, prediction) - wager,
      );

      const context = sessionContext(wager, '0x', acted.newGameState);
      let randomness = keccak256(toHex('soul-odds-engine'));
      let hits = 0;
      for (let i = 0; i < 300; i++) {
        randomness = keccak256(randomness);
        const expectedResult = generateSoul(example.configuration, randomness);
        const expectedBreakdown = matchBreakdown(prediction, expectedResult);
        const expectedPayout = predictionPayout(example.configuration, wager, prediction, expectedResult);
        const expectedWon = expectedPayout > 0n;

        const settled = await title.read.onRandomness([context, randomness]);
        const { result, won, breakdown } = decodeSettledGameState(settled.newGameState);
        assert.equal(settled.nextPhase, SETTLED);
        assert.equal(settled.payout, expectedPayout);
        assert.equal(won, expectedWon);
        assert.equal(result.gender, expectedResult.gender);
        assert.equal(result.lifespanBucket, expectedResult.lifespanBucket);
        assert.equal(result.crimeMask, expectedResult.crimeMask);
        assert.equal(result.birthYear, expectedResult.birthYear);
        assert.equal(breakdown.genderMatch, expectedBreakdown.genderMatch);
        assert.equal(breakdown.lifespanMatch, expectedBreakdown.lifespanMatch);
        assert.equal(breakdown.crimeMatch, expectedBreakdown.crimeMatch);
        if (expectedWon) hits++;
      }
      assert.ok(hits > 0, 'the fixed prediction should hit at least once in 300 draws');
    });

    it('picks eras matching the TS mirror, and reaches every era across enough draws', async () => {
      const title = await viem.getContractAt('SoulOddsEngine', exampleTitle);
      const wager = parseEther('1');
      const count = allInputs.length;
      const seenIndices = new Set<number>();
      let randomness = keccak256(toHex('era-pick'));
      for (let i = 0; i < 40; i++) {
        randomness = keccak256(randomness);
        const revealed = await title.read.onRandomness([sessionContext(wager, '0x', '0x'), randomness]);
        const [onChainIndex] = decodeAbiParameters(configurationIndexAbi, revealed.newGameState);
        assert.equal(Number(onChainIndex), pickConfigurationIndex(randomness, count));
        seenIndices.add(Number(onChainIndex));
      }
      assert.equal(seenIndices.size, count, 'every era should be reachable within 40 draws');
    });

    it('rejects invalid predictions', async () => {
      const title = await viem.getContractAt('SoulOddsEngine', exampleTitle);
      const wager = 1n;
      const revealed = await title.read.onRandomness([sessionContext(wager, '0x', '0x'), ZERO_RANDOMNESS]);
      const context = sessionContext(wager, '0x', revealed.newGameState);
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

    it('has no forfeit value and rejects an unknown bet configuration index', async () => {
      const title = await viem.getContractAt('SoulOddsEngine', exampleTitle);
      const context = sessionContext(1n, '0x');
      assert.equal(await title.read.quoteForfeitPayout([context]), 0n);
      await viem.assertions.revertWithCustomErrorWithArgs(
        title.read.betConfiguration([99]),
        title,
        'SoulOddsEngine__UnknownBetConfiguration',
        [99n],
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
        deployer.write.deployTitle([allInputs], { account: stranger.account }),
        deployer,
        'OwnableUnauthorizedAccount',
      );
    });

    it('rejects an empty configuration list', async () => {
      await viem.assertions.revertWithCustomError(
        deployer.write.deployTitle([[]]),
        deployer,
        'SoulOddsTitleDeployer__NoConfigurations',
      );
    });

    it('rejects an invalid era', async () => {
      // Solidity decodes the calldata `era` straight into the `SoulEra` enum, so an out-of-range
      // value (6, past `Contemporary`) reverts as an enum-conversion panic before `_validateEra`'s
      // own check ever runs — the explicit check only guards internal/memory-struct call sites.
      await assert.rejects(deployer.write.deployTitle([[{ ...example.input, era: 6 }]]));
    });

    it('rejects an inverted or out-of-range birth year range', async () => {
      await viem.assertions.revertWithCustomError(
        deployer.write.deployTitle([[{ ...example.input, minBirthYear: 100, maxBirthYear: 50 }]]),
        deployer,
        'SoulOddsTitleDeployer__InvalidBirthRange',
      );
      await viem.assertions.revertWithCustomError(
        deployer.write.deployTitle([[{ ...example.input, minBirthYear: -7000 }]]),
        deployer,
        'SoulOddsTitleDeployer__BirthYearTooEarly',
      );
      await viem.assertions.revertWithCustomError(
        deployer.write.deployTitle([[{ ...example.input, maxBirthYear: 3000 }]]),
        deployer,
        'SoulOddsTitleDeployer__BirthYearTooLate',
      );
    });

    it('rejects zero gender weights', async () => {
      await viem.assertions.revertWithCustomError(
        deployer.write.deployTitle([[{ ...example.input, maleWeight: 0, femaleWeight: 0 }]]),
        deployer,
        'SoulOddsTitleDeployer__InvalidGenderWeights',
      );
    });

    it('rejects an RTP outside the [93%, 98%] band', async () => {
      await viem.assertions.revertWithCustomError(
        deployer.write.deployTitle([[{ ...example.input, rtpWad: (90n * 10n ** 18n) / 100n }]]),
        deployer,
        'SoulOddsTitleDeployer__RtpTooLow',
      );
      await viem.assertions.revertWithCustomError(
        deployer.write.deployTitle([[{ ...example.input, rtpWad: (99n * 10n ** 18n) / 100n }]]),
        deployer,
        'SoulOddsTitleDeployer__RtpTooHigh',
      );
    });

    it('rejects a malformed lifespan or crime', async () => {
      const badLifespans = example.input.lifespans.map((lifespan, index) =>
        index === 0 ? { ...lifespan, minYears: 10, maxYears: 5 } : lifespan,
      ) as unknown as typeof example.input.lifespans;
      await viem.assertions.revertWithCustomErrorWithArgs(
        deployer.write.deployTitle([[{ ...example.input, lifespans: badLifespans }]]),
        deployer,
        'SoulOddsTitleDeployer__InvalidLifespan',
        [0n],
      );

      const badCrimes = example.input.crimes.map((crime, index) =>
        index === 2 ? { ...crime, selectionWeight: 0 } : crime,
      ) as unknown as typeof example.input.crimes;
      await viem.assertions.revertWithCustomErrorWithArgs(
        deployer.write.deployTitle([[{ ...example.input, crimes: badCrimes }]]),
        deployer,
        'SoulOddsTitleDeployer__InvalidCrime',
        [2n],
      );
    });
  });
});
