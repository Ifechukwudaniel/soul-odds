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
    // A soul can commit 0, 1, or 2 of the 4 anonymous crimes: 1 + 4 + C(4,2).
    uint256 internal constant VALID_CRIME_STATE_COUNT = 11;

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
        int16 birthYear;
        uint8 lifespanBucket;
        uint8 crimeMask;
    }

    /// @notice Per-field breakdown of a prediction against the generated
    ///         soul, so a losing player can see exactly what they missed.
    struct SoulMatchBreakdown {
        bool genderMatch;
        bool lifespanMatch;
        bool crimeMatch;
    }

    /// @notice A title may bundle several era configurations; the engine
    ///         picks one at random per session (revealed to the player
    ///         before they predict), so pre-bet quotes must assume the
    ///         worst era among all of them.
    function quoteCaps(
        uint256 wager,
        bytes calldata gameData
    )
        external
        view
        returns (uint256 maxEscrowStake, uint256 maxReservedProfit)
    {
        _requireEmptyGameData(gameData);

        SoulConfiguration memory worst = _worstCaseConfiguration();

        maxEscrowStake = wager;

        uint256 maxPayout = _maxPayout(worst, wager);

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
        _requireEmptyGameData(gameData);

        SoulConfiguration memory worst = _worstCaseConfiguration();

        maxPayout = _maxPayout(worst, wager);

        probabilityWad = _minimumPredictionProbability(worst);

        expectedPayout = Math.mulDiv(wager, _titleAverageRtpWad(), WAD);

        bodyVarianceScaled = wager * wager * _varianceWad(worst);
    }

    /// @dev Requests randomness immediately to pick the era; the player
    ///      hasn't predicted anything yet, so nothing is reserved.
    function onSessionStart(
        SessionContext calldata ctx
    ) external pure returns (StepResult memory stepResult) {
        _requireEmptyGameData(ctx.gameData);

        stepResult.nextPhase = SessionPhase.WAITING_RANDOMNESS;

        stepResult.requestRandomnessNow = true;

        stepResult.reservedProfitDelta = 0;
    }

    function onPlayerAction(
        SessionContext calldata ctx,
        bytes calldata action
    ) external view returns (StepResult memory stepResult) {
        uint256 configurationIndex = abi.decode(ctx.gameState, (uint256));

        SoulConfiguration memory configuration = _configurationAt(
            configurationIndex
        );

        SoulPrediction memory prediction = _decodePrediction(action);

        _validatePrediction(configuration, prediction);

        stepResult.newGameState = abi.encode(configurationIndex, prediction);

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

    /// @dev Called twice per session. The first call (empty `gameState`,
    ///      right after `onSessionStart`) picks the era and hands control
    ///      back to the player. The second call (`gameState` holding the
    ///      chosen era index and the player's prediction, set by
    ///      `onPlayerAction`) generates the soul and settles.
    function onRandomness(
        SessionContext calldata ctx,
        bytes32 randomness
    ) external view returns (StepResult memory stepResult) {
        if (ctx.gameState.length == 0) {
            uint256 configurationCount = SoulOddsTitleArgs.configurationCount(
                _titleArgs()
            );

            uint256 pickedConfigurationIndex = uint256(randomness) %
                configurationCount;

            stepResult.newGameState = abi.encode(pickedConfigurationIndex);

            stepResult.nextPhase = SessionPhase.WAITING_PLAYER_ACTION;

            stepResult.requestRandomnessNow = false;

            return stepResult;
        }

        (uint256 configurationIndex, SoulPrediction memory prediction) = abi
            .decode(ctx.gameState, (uint256, SoulPrediction));

        SoulConfiguration memory configuration = _configurationAt(
            configurationIndex
        );

        SoulResult memory result = _generateSoul(configuration, randomness);

        SoulMatchBreakdown memory breakdown = _matchBreakdown(
            prediction,
            result
        );

        uint256 payout = _predictionPayout(
            configuration,
            ctx.escrowedStake,
            prediction,
            breakdown
        );

        bool won = payout > 0;

        stepResult.newGameState = abi.encode(
            prediction,
            result,
            won,
            breakdown
        );

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

    /// @notice Average RTP across every era this title could randomly pick,
    ///         assuming a uniform pick — informational only; the payout an
    ///         individual session gets is always that session's own era.
    function titleRtpWad() external view returns (uint256) {
        return _titleAverageRtpWad();
    }

    function _titleArgs() private view returns (bytes memory) {
        if (address(this) == ENGINE) {
            revert SoulOddsEngine__NotATitle();
        }

        return Clones.fetchCloneArgs(address(this));
    }

    function _requireEmptyGameData(bytes calldata gameData) private pure {
        if (gameData.length != 0) {
            revert SoulOddsEngine__InvalidGameData();
        }
    }

    /// @dev The era configuration among all of the title's that maximizes
    ///      the worst-case payout, used to size pre-bet caps/risk before
    ///      the session's actual era has been randomly picked.
    function _worstCaseConfiguration()
        private
        view
        returns (SoulConfiguration memory worst)
    {
        bytes memory args = _titleArgs();

        uint256 count = SoulOddsTitleArgs.configurationCount(args);

        uint256 bestPayoutAtRefWager;

        for (uint256 i; i < count; ++i) {
            SoulConfiguration memory candidate = SoulOddsTitleArgs.decode(
                args,
                i
            );

            uint256 payoutAtRefWager = _maxPayout(candidate, WAD);

            if (payoutAtRefWager >= bestPayoutAtRefWager) {
                bestPayoutAtRefWager = payoutAtRefWager;
                worst = candidate;
            }
        }
    }

    function _titleAverageRtpWad() private view returns (uint256) {
        bytes memory args = _titleArgs();

        uint256 count = SoulOddsTitleArgs.configurationCount(args);

        uint256 sum;

        for (uint256 i; i < count; ++i) {
            sum += SoulOddsTitleArgs.decode(args, i).rtpWad;
        }

        return sum / count;
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

        // Flavor only: birth year never affects a prediction's odds or
        // payout, so it is drawn from independent, domain-separated
        // entropy rather than another slice of `random`.
        uint256 birthYearRandom = uint256(
            keccak256(abi.encode(randomness, uint256(1)))
        );

        result.birthYear = _sampleBirthYear(configuration, birthYearRandom);
    }

    function _sampleBirthYear(
        SoulConfiguration memory configuration,
        uint256 random
    ) private pure returns (int16) {
        int256 minYear = configuration.minBirthYear;
        int256 maxYear = configuration.maxBirthYear;

        if (maxYear == minYear) {
            return int16(minYear);
        }

        uint256 span = uint256(maxYear - minYear + 1);

        return int16(minYear + int256(random % span));
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

    /// @dev A crime prediction only counts as a match on the exact mask, but
    ///      a losing player still learns whether they at least called
    ///      "committed a crime or not" correctly via `prediction.sins`.
    function _matchBreakdown(
        SoulPrediction memory prediction,
        SoulResult memory result
    ) private pure returns (SoulMatchBreakdown memory breakdown) {
        breakdown.genderMatch = prediction.gender == result.gender;

        breakdown.lifespanMatch =
            prediction.lifespanBucket == result.lifespanBucket;

        breakdown.crimeMatch =
            prediction.sins == (result.crimeMask != 0) &&
            prediction.crimeMask == result.crimeMask;
    }

    function _rtpWad(
        SoulConfiguration memory configuration
    ) private pure returns (uint256) {
        return configuration.rtpWad;
    }

    function _validCrimeMasks()
        private
        pure
        returns (uint8[VALID_CRIME_STATE_COUNT] memory masks)
    {
        masks[0] = 0;

        uint256 cursor = 1;

        for (uint8 i; i < CRIME_COUNT; ++i) {
            masks[cursor++] = uint8(1 << i);
        }

        for (uint8 a; a < CRIME_COUNT; ++a) {
            for (uint8 b = a + 1; b < CRIME_COUNT; ++b) {
                masks[cursor++] = uint8((1 << a) | (1 << b));
            }
        }
    }

    /// @dev The three independent marginal probabilities `_generateSoul`
    ///      draws from: gender and lifespan bucket are weighted picks, and
    ///      the crime state depends on the bucket's no-crime weight and the
    ///      anonymous crime slot distribution.
    function _categoryProbabilities(
        SoulConfiguration memory configuration,
        SoulPrediction memory prediction
    )
        private
        pure
        returns (
            uint256 genderProbabilityWad,
            uint256 lifespanProbabilityWad,
            uint256 crimeProbabilityWad
        )
    {
        uint256 genderWeight = prediction.gender == 0
            ? configuration.maleWeight
            : configuration.femaleWeight;

        uint256 genderTotal = uint256(configuration.maleWeight) +
            configuration.femaleWeight;

        genderProbabilityWad = Math.mulDiv(genderWeight, WAD, genderTotal);

        SoulLifespan memory lifespan = configuration.lifespans[
            prediction.lifespanBucket
        ];

        lifespanProbabilityWad = Math.mulDiv(
            lifespan.weight,
            WAD,
            configuration.lifespanTotalWeight
        );

        crimeProbabilityWad = _crimeStateProbabilityWad(
            configuration,
            lifespan,
            prediction.crimeMask
        );
    }

    /// @dev Exact probability that a randomly generated soul matches
    ///      `prediction` on all three categories at once (the full-house
    ///      event), i.e. the product of the three marginals.
    function _predictionProbabilityWad(
        SoulConfiguration memory configuration,
        SoulPrediction memory prediction
    ) private pure returns (uint256) {
        (
            uint256 genderProbabilityWad,
            uint256 lifespanProbabilityWad,
            uint256 crimeProbabilityWad
        ) = _categoryProbabilities(configuration, prediction);

        return
            Math.mulDiv(
                Math.mulDiv(genderProbabilityWad, lifespanProbabilityWad, WAD),
                crimeProbabilityWad,
                WAD
            );
    }

    /// @dev Each category gets an equal third of `wager` and pays out at
    ///      its OWN odds: `(wager/3) * RTP / p_i`. Unlike splitting stake by
    ///      probability, this makes a common category (e.g. gender, near a
    ///      coin flip) pay a small amount and a rare category (e.g. an
    ///      exact crime state) pay a large one — each category's own
    ///      rarity sets its own price. Every category's expected value is
    ///      still exactly `(wager/3) * RTP`, so the split stays fair
    ///      regardless of what was predicted.
    function _categoryPayout(
        uint256 wager,
        uint256 rtpWadValue,
        uint256 probabilityWad
    ) private pure returns (uint256) {
        // A category with 0 probability (e.g. a crime state impossible in
        // this bucket) can never be matched, so it never pays.
        if (probabilityWad == 0) {
            return 0;
        }

        return
            Math.mulDiv(
                wager,
                rtpWadValue,
                probabilityWad * 3,
                Math.Rounding.Ceil
            );
    }

    /// @dev The (gender, lifespan, crime) marginal triple that maximizes
    ///      the total payout if all three hit, i.e. the riskiest bet this
    ///      configuration allows under the per-category payout model above.
    ///      Found by evaluating every valid prediction directly (rather
    ///      than trying to combine three separately-minimized marginals),
    ///      since the crime marginal depends on which bucket was paired
    ///      with it.
    function _worstCaseCategoryProbabilities(
        SoulConfiguration memory configuration
    )
        private
        pure
        returns (
            uint256 genderProbabilityWad,
            uint256 lifespanProbabilityWad,
            uint256 crimeProbabilityWad
        )
    {
        uint256 rtp = _rtpWad(configuration);

        uint256 maxPayoutAtRefWager;

        uint8[VALID_CRIME_STATE_COUNT] memory crimeMasks = _validCrimeMasks();

        for (uint8 gender; gender < 2; ++gender) {
            for (uint8 bucket; bucket < LIFESPAN_COUNT; ++bucket) {
                for (uint256 i; i < crimeMasks.length; ++i) {
                    uint8 mask = crimeMasks[i];

                    SoulPrediction memory prediction = SoulPrediction({
                        gender: gender,
                        lifespanBucket: bucket,
                        sins: mask != 0,
                        crimeMask: mask
                    });

                    (
                        uint256 g,
                        uint256 l,
                        uint256 c
                    ) = _categoryProbabilities(configuration, prediction);

                    // Payout scales linearly with wager, so ranking combos
                    // by their payout at any fixed reference wager (here
                    // WAD) picks the same combo as at the real wager.
                    uint256 payoutAtRefWager = _categoryPayout(
                        WAD,
                        rtp,
                        g
                    ) +
                        _categoryPayout(WAD, rtp, l) +
                        _categoryPayout(WAD, rtp, c);

                    if (payoutAtRefWager > maxPayoutAtRefWager) {
                        maxPayoutAtRefWager = payoutAtRefWager;
                        genderProbabilityWad = g;
                        lifespanProbabilityWad = l;
                        crimeProbabilityWad = c;
                    }
                }
            }
        }
    }

    /// @dev Variance per unit wager^2 of the total payout (the sum of three
    ///      independent Bernoulli categories, each with its own payout) at
    ///      the riskiest prediction this configuration allows.
    function _varianceWad(
        SoulConfiguration memory configuration
    ) private pure returns (uint256) {
        (
            uint256 g,
            uint256 l,
            uint256 c
        ) = _worstCaseCategoryProbabilities(configuration);

        uint256 rtp = _rtpWad(configuration);

        return
            _categoryVarianceTermWad(rtp, g) +
            _categoryVarianceTermWad(rtp, l) +
            _categoryVarianceTermWad(rtp, c);
    }

    /// @dev Var(X_i * payout_i)/wager^2 for one Bernoulli(p_i) category
    ///      worth `payout_i = RTP/(3 p_i)` per unit wager.
    function _categoryVarianceTermWad(
        uint256 rtpWadValue,
        uint256 probabilityWad
    ) private pure returns (uint256) {
        // A category that never happens (Bernoulli(0)) contributes no
        // variance, and would otherwise divide by zero below.
        if (probabilityWad == 0) {
            return 0;
        }

        uint256 ratioWad = Math.mulDiv(
            rtpWadValue,
            WAD,
            probabilityWad * 3,
            Math.Rounding.Ceil
        );

        uint256 ratioSquaredWad = Math.mulDiv(
            ratioWad,
            ratioWad,
            WAD,
            Math.Rounding.Ceil
        );

        uint256 bernoulliVarianceWad = Math.mulDiv(
            probabilityWad,
            WAD - probabilityWad,
            WAD
        );

        return
            Math.mulDiv(
                ratioSquaredWad,
                bernoulliVarianceWad,
                WAD,
                Math.Rounding.Ceil
            );
    }

    /// @dev Worst case for `prediction`: every category hits.
    function _predictionMaxPayout(
        SoulConfiguration memory configuration,
        uint256 wager,
        SoulPrediction memory prediction
    ) private pure returns (uint256) {
        (
            uint256 g,
            uint256 l,
            uint256 c
        ) = _categoryProbabilities(configuration, prediction);

        uint256 rtp = _rtpWad(configuration);

        return
            _categoryPayout(wager, rtp, g) +
            _categoryPayout(wager, rtp, l) +
            _categoryPayout(wager, rtp, c);
    }

    function _predictionPayout(
        SoulConfiguration memory configuration,
        uint256 wager,
        SoulPrediction memory prediction,
        SoulMatchBreakdown memory breakdown
    ) private pure returns (uint256) {
        (
            uint256 g,
            uint256 l,
            uint256 c
        ) = _categoryProbabilities(configuration, prediction);

        uint256 rtp = _rtpWad(configuration);

        uint256 payout;

        if (breakdown.genderMatch) {
            payout += _categoryPayout(wager, rtp, g);
        }

        if (breakdown.lifespanMatch) {
            payout += _categoryPayout(wager, rtp, l);
        }

        if (breakdown.crimeMatch) {
            payout += _categoryPayout(wager, rtp, c);
        }

        return payout;
    }

    /// @dev Worst case across every valid prediction: the riskiest category
    ///      triple, with every category hitting.
    function _maxPayout(
        SoulConfiguration memory configuration,
        uint256 wager
    ) private pure returns (uint256) {
        (
            uint256 g,
            uint256 l,
            uint256 c
        ) = _worstCaseCategoryProbabilities(configuration);

        uint256 rtp = _rtpWad(configuration);

        return
            _categoryPayout(wager, rtp, g) +
            _categoryPayout(wager, rtp, l) +
            _categoryPayout(wager, rtp, c);
    }

    /// @dev Probability of the full-house event (all three categories hit)
    ///      at the riskiest prediction, i.e. the event that realizes
    ///      `_maxPayout`.
    function _minimumPredictionProbability(
        SoulConfiguration memory configuration
    ) private pure returns (uint256) {
        (
            uint256 g,
            uint256 l,
            uint256 c
        ) = _worstCaseCategoryProbabilities(configuration);

        return Math.mulDiv(Math.mulDiv(g, l, WAD), c, WAD);
    }

    /// @dev Probability of an exact crime state within `lifespan`, mirroring
    ///      `_sampleNoCrime` and `_sampleCrimes`.
    function _crimeStateProbabilityWad(
        SoulConfiguration memory configuration,
        SoulLifespan memory lifespan,
        uint8 crimeMask
    ) private pure returns (uint256) {
        if (crimeMask == 0) {
            return Math.mulDiv(lifespan.noCrimeWeight, WAD, BPS);
        }

        uint256 hasCrimeProbabilityWad = WAD -
            Math.mulDiv(lifespan.noCrimeWeight, WAD, BPS);

        uint256 selectionTotal;

        for (uint256 i; i < CRIME_COUNT; ++i) {
            selectionTotal += configuration.crimes[i].selectionWeight;
        }

        uint256 maskProbabilityWad = _crimeMaskProbabilityWad(
            configuration,
            selectionTotal,
            crimeMask
        );

        return Math.mulDiv(hasCrimeProbabilityWad, maskProbabilityWad, WAD);
    }

    /// @dev Probability of an exact crime mask, conditional on a crime
    ///      having occurred. `_sampleCrimes` always draws a first crime,
    ///      then 25% of the time draws a second, weighted the same way; if
    ///      that second draw collides with the first it shifts forward to
    ///      the next unset slot instead of rerolling.
    function _crimeMaskProbabilityWad(
        SoulConfiguration memory configuration,
        uint256 selectionTotal,
        uint8 crimeMask
    ) private pure returns (uint256) {
        uint256 first = CRIME_COUNT;
        uint256 second = CRIME_COUNT;

        for (uint256 i; i < CRIME_COUNT; ++i) {
            if ((crimeMask & (1 << i)) != 0) {
                if (first == CRIME_COUNT) {
                    first = i;
                } else {
                    second = i;
                }
            }
        }

        if (second == CRIME_COUNT) {
            return
                _singleCrimeProbabilityWad(configuration, selectionTotal, first);
        }

        return
            _pairCrimeProbabilityWad(
                configuration,
                selectionTotal,
                first,
                second
            );
    }

    function _singleCrimeProbabilityWad(
        SoulConfiguration memory configuration,
        uint256 selectionTotal,
        uint256 index
    ) private pure returns (uint256) {
        uint256 probabilityWad = Math.mulDiv(
            configuration.crimes[index].selectionWeight,
            WAD,
            selectionTotal
        );

        // No second draw happens 75% of the time. The remaining 25% also
        // stays single when the second draw lands back on this slot and it
        // is the last one, since there is no next slot to shift into.
        uint256 stayedSingleWad = Math.mulDiv(probabilityWad, 3, 4);

        if (index == CRIME_COUNT - 1) {
            stayedSingleWad += Math.mulDiv(
                Math.mulDiv(probabilityWad, probabilityWad, WAD),
                1,
                4
            );
        }

        return stayedSingleWad;
    }

    function _pairCrimeProbabilityWad(
        SoulConfiguration memory configuration,
        uint256 selectionTotal,
        uint256 first,
        uint256 second
    ) private pure returns (uint256) {
        uint256 probabilityA = Math.mulDiv(
            configuration.crimes[first].selectionWeight,
            WAD,
            selectionTotal
        );

        uint256 probabilityB = Math.mulDiv(
            configuration.crimes[second].selectionWeight,
            WAD,
            selectionTotal
        );

        // Either slot can be drawn first, with the other added second. A
        // second draw that collides with the first shifts forward one slot,
        // so it also lands on `second` whenever second == first + 1.
        uint256 numeratorWad = Math.mulDiv(probabilityA, probabilityB, WAD) *
            2;

        if (second == first + 1) {
            numeratorWad += Math.mulDiv(probabilityA, probabilityA, WAD);
        }

        return numeratorWad / 4;
    }
}
