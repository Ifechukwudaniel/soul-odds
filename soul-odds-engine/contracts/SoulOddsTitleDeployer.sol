// SPDX-License-Identifier: MIT

pragma solidity ^0.8.30;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";

import {SoulEra, SoulCrime, SoulLifespan, SoulConfiguration, SoulOddsTitleArgs} from "./SoulTitleArgs.sol";

import {SoulOddsEngine} from "./SoulOddsEngine.sol";

/// @notice Deploys Soul Odds titles as minimal clones with immutable configuration.
///
/// The configuration contains:
/// - historical era
/// - birth-year range
/// - gender weights
/// - exactly four lifespan buckets
/// - exactly four anonymous crime slots
///
/// Crime slots intentionally have no semantic IDs. The frontend maps
/// slot 0..3 to the displayed crime names.
///
/// Example:
/// slot 0 -> Murder
/// slot 1 -> Fraud
/// slot 2 -> Theft
/// slot 3 -> Heresy
///
/// The engine never receives those names.
contract SoulOddsTitleDeployer is Ownable {
    using SafeCast for uint256;

    uint256 internal constant WAD = 1e18;
    uint256 internal constant BPS = 10_000;

    uint256 internal constant LIFESPAN_COUNT = 4;
    uint256 internal constant CRIME_COUNT = 4;

    int256 internal constant MIN_BIRTH_YEAR = type(int16).min;
    int256 internal constant MAX_BIRTH_YEAR = 2026;

    uint256 internal constant MIN_RTP_WAD = 93e16;
    uint256 internal constant MAX_RTP_WAD = 98e16;

    address public immutable engine;

    error SoulOddsTitleDeployer__InvalidEra();
    error SoulOddsTitleDeployer__InvalidBirthRange();
    error SoulOddsTitleDeployer__BirthYearTooEarly();
    error SoulOddsTitleDeployer__BirthYearTooLate();

    error SoulOddsTitleDeployer__InvalidGenderWeights();

    error SoulOddsTitleDeployer__InvalidLifespan(uint256 index);

    error SoulOddsTitleDeployer__InvalidLifespanWeight(uint256 index);

    error SoulOddsTitleDeployer__InvalidNoCrimeWeight(uint256 index);

    error SoulOddsTitleDeployer__InvalidCrime(uint256 index);

    error SoulOddsTitleDeployer__InvalidCrimeWeight(uint256 index);

    error SoulOddsTitleDeployer__InvalidRtp();

    error SoulOddsTitleDeployer__RtpTooHigh(uint256 rtpWad);

    error SoulOddsTitleDeployer__RtpTooLow(uint256 rtpWad);

    error SoulOddsTitleDeployer__NoConfigurations();

    error SoulOddsTitleDeployer__TooManyConfigurations(uint256 count);

    /// @notice `eras[i]`/`rtpWads[i]` describe the era config the engine can
    ///         randomly pick at index `i`; a session reveals which one it
    ///         landed on before the player predicts.
    event SoulOddsTitleDeployed(
        address indexed title,
        SoulEra[] eras,
        uint256[] rtpWads
    );

    struct SoulConfigurationInput {
        SoulEra era;
        int16 minBirthYear;
        int16 maxBirthYear;
        uint32 maleWeight;
        uint32 femaleWeight;
        uint64 rtpWad;
        SoulLifespan[4] lifespans;
        SoulCrime[4] crimes;
    }

    constructor(address owner_) Ownable(owner_) {
        engine = address(new SoulOddsEngine());
    }

    /// @notice Deploys a title covering one or more eras. The engine picks
    ///         one of `inputs` at random per session (revealed to the
    ///         player before they predict), so every included era needs
    ///         its own complete, independently valid configuration.
    function deployTitle(
        SoulConfigurationInput[] calldata inputs
    ) external onlyOwner returns (address title) {
        uint256 count = inputs.length;

        if (count == 0) {
            revert SoulOddsTitleDeployer__NoConfigurations();
        }

        if (count > SoulOddsTitleArgs.ERA_COUNT) {
            revert SoulOddsTitleDeployer__TooManyConfigurations(count);
        }

        SoulConfiguration[] memory configurations = new SoulConfiguration[](
            count
        );

        SoulEra[] memory eras = new SoulEra[](count);

        uint256[] memory rtpWads = new uint256[](count);

        for (uint256 i; i < count; ++i) {
            SoulConfiguration memory configuration = _buildConfiguration(
                inputs[i]
            );

            configurations[i] = configuration;

            eras[i] = configuration.era;

            rtpWads[i] = configuration.rtpWad;
        }

        bytes memory args = SoulOddsTitleArgs.encode(configurations);

        title = Clones.cloneWithImmutableArgs(engine, args);

        emit SoulOddsTitleDeployed(title, eras, rtpWads);
    }

    function validateConfiguration(
        SoulConfigurationInput calldata input
    ) external pure returns (SoulConfiguration memory configuration) {
        configuration = _buildConfiguration(input);
    }

    function _buildConfiguration(
        SoulConfigurationInput calldata input
    ) private pure returns (SoulConfiguration memory configuration) {
        _validateEra(input.era);

        _validateBirthRange(input.minBirthYear, input.maxBirthYear);

        _validateGenderWeights(input.maleWeight, input.femaleWeight);

        _validateRtp(input.rtpWad);

        configuration.era = input.era;

        configuration.minBirthYear = input.minBirthYear;

        configuration.maxBirthYear = input.maxBirthYear;

        configuration.maleWeight = input.maleWeight;

        configuration.femaleWeight = input.femaleWeight;

        configuration.rtpWad = input.rtpWad;

        uint256 lifespanTotalWeight;

        for (uint256 i; i < LIFESPAN_COUNT; ++i) {
            SoulLifespan calldata lifespan = input.lifespans[i];

            _validateLifespan(lifespan, i);

            configuration.lifespans[i] = lifespan;

            lifespanTotalWeight += lifespan.weight;
        }

        configuration.lifespanTotalWeight = lifespanTotalWeight.toUint32();

        for (uint256 i; i < CRIME_COUNT; ++i) {
            SoulCrime calldata crime = input.crimes[i];

            _validateCrime(crime, i);

            configuration.crimes[i] = crime;
        }
    }

    function _validateEra(SoulEra era) private pure {
        if (uint8(era) > uint8(SoulEra.Contemporary)) {
            revert SoulOddsTitleDeployer__InvalidEra();
        }
    }

    function _validateBirthRange(
        int16 minBirthYear,
        int16 maxBirthYear
    ) private pure {
        if (minBirthYear > maxBirthYear) {
            revert SoulOddsTitleDeployer__InvalidBirthRange();
        }

        if (int256(minBirthYear) < MIN_BIRTH_YEAR) {
            revert SoulOddsTitleDeployer__BirthYearTooEarly();
        }

        if (int256(maxBirthYear) > MAX_BIRTH_YEAR) {
            revert SoulOddsTitleDeployer__BirthYearTooLate();
        }
    }

    function _validateGenderWeights(
        uint32 maleWeight,
        uint32 femaleWeight
    ) private pure {
        if (maleWeight == 0 || femaleWeight == 0) {
            revert SoulOddsTitleDeployer__InvalidGenderWeights();
        }
    }

    function _validateLifespan(
        SoulLifespan calldata lifespan,
        uint256 index
    ) private pure {
        if (lifespan.maxYears < lifespan.minYears) {
            revert SoulOddsTitleDeployer__InvalidLifespan(index);
        }

        if (lifespan.weight == 0) {
            revert SoulOddsTitleDeployer__InvalidLifespanWeight(index);
        }

        if (lifespan.noCrimeWeight > BPS) {
            revert SoulOddsTitleDeployer__InvalidNoCrimeWeight(index);
        }
    }

    function _validateCrime(
        SoulCrime calldata crime,
        uint256 index
    ) private pure {
        if (crime.selectionWeight == 0) {
            revert SoulOddsTitleDeployer__InvalidCrime(index);
        }

        if (crime.commitWeight > BPS) {
            revert SoulOddsTitleDeployer__InvalidCrimeWeight(index);
        }
    }

    /// @dev The payout model pays `wager * RTP / probability(prediction)` for
    ///      every prediction, so RTP is a fixed design input chosen by the
    ///      deployer, not a value derivable from the weight distribution.
    function _validateRtp(uint256 rtpWad) private pure {
        if (rtpWad == 0) {
            revert SoulOddsTitleDeployer__InvalidRtp();
        }

        if (rtpWad < MIN_RTP_WAD) {
            revert SoulOddsTitleDeployer__RtpTooLow(rtpWad);
        }

        if (rtpWad > MAX_RTP_WAD) {
            revert SoulOddsTitleDeployer__RtpTooHigh(rtpWad);
        }
    }
}
