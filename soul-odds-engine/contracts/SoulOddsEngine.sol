// SPDX-License-Identifier: MIT

pragma solidity ^0.8.30;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

import {ICasinoGameV2, SessionContext, SessionPhase, StepResult} from "@chain/casino-sdk/contracts/ICasinoGameV2.sol";

import {SoulEra, SoulCrime, SoulLifespan, SoulConfiguration, SoulOddsTitleArgs} from "./SoulTitleArgs.sol";

contract SoulOddsEngine is ICasinoGameV2 {
    uint256 internal constant WAD = 1e18;
    uint256 internal constant BPS = 10_000;

    uint256 internal constant CRIME_COUNT = 4;
    uint256 internal constant LIFESPAN_COUNT = 4;

    address private immutable ENGINE = address(this);

    error SoulOddsEngine__NotATitle();
    error SoulOddsEngine__InvalidGameData();
    error SoulOddsEngine__InvalidPrediction();
    error SoulOddsEngine__UnknownBetConfiguration(uint256 index);
    error SoulOddsEngine__NoPlayerActions();

    struct SoulPrediction {
        uint8 gender;
        uint8 lifespanBucket;
        bool sins;
        uint8 crimeMask;
    }

    struct SoulResult {
        uint8 gender;
        uint16 age;
        uint8 lifespanBucket;
        uint8 crimeMask;
    }

    function quoteCaps(
        uint256 wager,
        bytes calldata gameData
    )
        external
        view
        returns (uint256 maxEscrowStake, uint256 maxReservedProfit)
    {
        SoulConfiguration memory configuration = _configuration(gameData);

        maxEscrowStake = wager;

        uint256 maxPayout = _maxPayout(configuration, wager);

        maxReservedProfit = maxPayout > wager ? maxPayout - wager : 0;
    }

    function quoteRiskParams(
        uint256 wager,
        bytes calldata gameData
    )
        external
        view
        returns (
            uint256 maxPayout,
            uint256 probabilityWad,
            uint256 expectedPayout,
            uint256 bodyVarianceScaled
        )
    {
        SoulConfiguration memory configuration = _configuration(gameData);

        maxPayout = _maxPayout(configuration, wager);

        probabilityWad = _minimumPredictionProbability(configuration);

        expectedPayout = Math.mulDiv(wager, _rtpWad(configuration), WAD);

        bodyVarianceScaled = wager * wager * _varianceWad(configuration);
    }

    function onSessionStart(
        SessionContext calldata ctx
    ) external view returns (StepResult memory stepResult) {
        _configuration(ctx.gameData);

        stepResult.nextPhase = SessionPhase.WAITING_RANDOMNESS;

        stepResult.requestRandomnessNow = false;

        stepResult.reservedProfitDelta = 0;
    }

    function onPlayerAction(
        SessionContext calldata ctx,
        bytes calldata action
    ) external view returns (StepResult memory stepResult) {
        SoulConfiguration memory configuration = _configuration(ctx.gameData);

        SoulPrediction memory prediction = _decodePrediction(action);

        _validatePrediction(configuration, prediction);

        stepResult.newGameState = action;

        stepResult.nextPhase = SessionPhase.WAITING_RANDOMNESS;

        stepResult.requestRandomnessNow = true;

        uint256 maxPayout = _predictionMaxPayout(
            configuration,
            ctx.escrowedStake,
            prediction
        );

        stepResult.reservedProfitDelta = int256(
            maxPayout > ctx.escrowedStake ? maxPayout - ctx.escrowedStake : 0
        );
    }

    function onRandomness(
        SessionContext calldata ctx,
        bytes32 randomness
    ) external view returns (StepResult memory stepResult) {
        SoulConfiguration memory configuration = _configuration(ctx.gameData);

        SoulPrediction memory prediction = _decodePrediction(ctx.gameState);

        SoulResult memory result = _generateSoul(configuration, randomness);

        bool won = _matches(prediction, result);

        uint256 payout;

        if (won) {
            payout = _predictionPayout(
                configuration,
                ctx.escrowedStake,
                prediction
            );
        }

        stepResult.newGameState = abi.encode(prediction, result, won);

        stepResult.nextPhase = SessionPhase.SETTLED;

        stepResult.payout = payout;
    }

    function quoteForfeitPayout(
        SessionContext calldata
    ) external pure returns (uint256) {
        return 0;
    }

    function betConfigurationCount() external view returns (uint256) {
        return SoulOddsTitleArgs.configurationCount(_titleArgs());
    }

    function betConfiguration(
        uint8 index
    ) external view returns (SoulConfiguration memory) {
        return _configurationAt(index);
    }

    function rtpWad(uint8 index) external view returns (uint256) {
        return _rtpWad(_configurationAt(index));
    }

    function titleRtpWad() external view returns (uint256) {
        return _rtpWad(_configurationAt(0));
    }

    function _titleArgs() private view returns (bytes memory) {
        if (address(this) == ENGINE) {
            revert SoulOddsEngine__NotATitle();
        }

        return Clones.fetchCloneArgs(address(this));
    }

    function _configuration(
        bytes calldata gameData
    ) private view returns (SoulConfiguration memory) {
        if (gameData.length > 1) {
            revert SoulOddsEngine__InvalidGameData();
        }

        uint256 index = gameData.length == 0 ? 0 : uint8(gameData[0]);

        return _configurationAt(index);
    }

    function _configurationAt(
        uint256 index
    ) private view returns (SoulConfiguration memory) {
        bytes memory args = _titleArgs();

        if (index >= SoulOddsTitleArgs.configurationCount(args)) {
            revert SoulOddsEngine__UnknownBetConfiguration(index);
        }

        return SoulOddsTitleArgs.decode(args, index);
    }

    function _decodePrediction(
        bytes calldata data
    ) private pure returns (SoulPrediction memory prediction) {
        if (data.length != 3) {
            revert SoulOddsEngine__InvalidPrediction();
        }

        prediction.gender = uint8(data[0]);

        prediction.lifespanBucket = uint8(data[1]);

        uint8 flags = uint8(data[2]);

        prediction.sins = (flags & 1) != 0;

        prediction.crimeMask = flags >> 1;
    }

    function _validatePrediction(
        SoulConfiguration memory configuration,
        SoulPrediction memory prediction
    ) private pure {
        if (prediction.gender > 1) {
            revert SoulOddsEngine__InvalidPrediction();
        }

        if (prediction.lifespanBucket >= LIFESPAN_COUNT) {
            revert SoulOddsEngine__InvalidPrediction();
        }

        if (prediction.crimeMask >= (1 << CRIME_COUNT)) {
            revert SoulOddsEngine__InvalidPrediction();
        }

        uint256 committed;

        uint8 mask = prediction.crimeMask;

        for (uint256 i; i < CRIME_COUNT; ++i) {
            if ((mask & (1 << i)) != 0) {
                ++committed;
            }
        }

        if (committed > 2) {
            revert SoulOddsEngine__InvalidPrediction();
        }

        bool hasCrime = prediction.crimeMask != 0;

        if (prediction.sins != hasCrime) {
            revert SoulOddsEngine__InvalidPrediction();
        }

        configuration;
    }

    function _generateSoul(
        SoulConfiguration memory configuration,
        bytes32 randomness
    ) private pure returns (SoulResult memory result) {
        uint256 random = uint256(randomness);

        result.gender = _sampleGender(configuration, random);

        result.lifespanBucket = _sampleLifespan(configuration, random >> 32);

        SoulLifespan memory lifespan = configuration.lifespans[
            result.lifespanBucket
        ];

        result.age = _sampleAge(lifespan, random >> 64);

        bool noCrime = _sampleNoCrime(lifespan, random >> 96);

        if (noCrime) {
            result.crimeMask = 0;
        } else {
            result.crimeMask = _sampleCrimes(configuration, random >> 128);
        }
    }

    function _sampleGender(
        SoulConfiguration memory configuration,
        uint256 random
    ) private pure returns (uint8) {
        uint256 total = uint256(configuration.maleWeight) +
            configuration.femaleWeight;

        uint256 roll = random % total;

        return roll < configuration.maleWeight ? 0 : 1;
    }

    function _sampleLifespan(
        SoulConfiguration memory configuration,
        uint256 random
    ) private pure returns (uint8) {
        uint256 roll = random % configuration.lifespanTotalWeight;

        uint256 cumulative;

        for (uint256 i; i < LIFESPAN_COUNT; ++i) {
            cumulative += configuration.lifespans[i].weight;

            if (roll < cumulative) {
                return uint8(i);
            }
        }

        return 3;
    }

    function _sampleAge(
        SoulLifespan memory lifespan,
        uint256 random
    ) private pure returns (uint16) {
        if (lifespan.maxYears == lifespan.minYears) {
            return lifespan.minYears;
        }

        uint256 span = uint256(lifespan.maxYears) - lifespan.minYears + 1;

        return uint16(uint256(lifespan.minYears) + (random % span));
    }

    function _sampleNoCrime(
        SoulLifespan memory lifespan,
        uint256 random
    ) private pure returns (bool) {
        return random % BPS < lifespan.noCrimeWeight;
    }

    function _sampleCrimes(
        SoulConfiguration memory configuration,
        uint256 random
    ) private pure returns (uint8 mask) {
        uint256 selectionTotal;

        for (uint256 i; i < CRIME_COUNT; ++i) {
            selectionTotal += configuration.crimes[i].selectionWeight;
        }

        uint256 first = random % selectionTotal;

        uint256 cumulative;

        for (uint256 i; i < CRIME_COUNT; ++i) {
            cumulative += configuration.crimes[i].selectionWeight;

            if (first < cumulative) {
                mask |= uint8(1 << i);
                break;
            }
        }

        uint256 secondRandom = uint256(keccak256(abi.encode(random)));

        uint256 secondChance = secondRandom % BPS;

        if (secondChance < 2500) {
            uint256 second = secondRandom % selectionTotal;

            cumulative = 0;

            for (uint256 i; i < CRIME_COUNT; ++i) {
                cumulative += configuration.crimes[i].selectionWeight;

                if (second < cumulative && (mask & (1 << i)) == 0) {
                    mask |= uint8(1 << i);
                    break;
                }
            }
        }
    }

    function _matches(
        SoulPrediction memory prediction,
        SoulResult memory result
    ) private pure returns (bool) {
        if (prediction.gender != result.gender) {
            return false;
        }

        if (prediction.lifespanBucket != result.lifespanBucket) {
            return false;
        }

        if (prediction.sins != (result.crimeMask != 0)) {
            return false;
        }

        if (prediction.crimeMask != result.crimeMask) {
            return false;
        }

        return true;
    }

    function _rtpWad(SoulConfiguration memory) private pure returns (uint256) {
        return 98e16;
    }

    function _minimumPredictionProbability(
        SoulConfiguration memory
    ) private pure returns (uint256) {
        return 1e16;
    }

    function _varianceWad(
        SoulConfiguration memory
    ) private pure returns (uint256) {
        return 1e18;
    }

    function _predictionMaxPayout(
        SoulConfiguration memory configuration,
        uint256 wager,
        SoulPrediction memory prediction
    ) private pure returns (uint256) {
        uint256 probability = _predictionProbabilityWad(
            configuration,
            prediction
        );

        if (probability == 0) {
            return 0;
        }

        return Math.mulDiv(wager, 98e16, probability);
    }

    function _predictionPayout(
        SoulConfiguration memory configuration,
        uint256 wager,
        SoulPrediction memory prediction
    ) private pure returns (uint256) {
        return _predictionMaxPayout(configuration, wager, prediction);
    }

    function _maxPayout(
        SoulConfiguration memory configuration,
        uint256 wager
    ) private pure returns (uint256) {
        return
            Math.mulDiv(
                wager,
                98e16,
                _minimumPredictionProbability(configuration)
            );
    }

    function _predictionProbabilityWad(
        SoulConfiguration memory,
        SoulPrediction memory
    ) private pure returns (uint256) {
        // TODO:
        // derive exact probability from:
        //
        // gender
        // lifespan bucket
        // no-crime probability
        // anonymous crime slot distribution
        //
        // This must be completed before production deployment.

        return 1e16;
    }
}
