// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

enum SoulEra {
    Ancient,
    Medieval,
    EarlyModern,
    Industrial,
    Modern,
    Contemporary
}

struct SoulCrime {
    uint32 selectionWeight;
    uint32 commitWeight;
}

struct SoulLifespan {
    uint16 minYears;
    uint16 maxYears;
    uint32 weight;
    uint32 noCrimeWeight;
}

struct SoulConfiguration {
    SoulEra era;
    // Inclusive birth year range.
    int16 minBirthYear;
    int16 maxBirthYear;
    uint32 lifespanTotalWeight;
    uint32 maleWeight;
    uint32 femaleWeight;
    // Exactly four lifespan buckets:
    //
    // 0-5
    // 5-29
    // 29-50
    // 50+
    SoulLifespan[4] lifespans;
    // Anonymous crime slots.
    //
    // The contract knows these as slot 0..3.
    // It does NOT know their semantic names.
    SoulCrime[4] crimes;
}

library SoulOddsTitleArgs {
    uint256 internal constant ERA_COUNT = uint256(type(SoulEra).max) + 1;

    uint256 internal constant LIFESPAN_COUNT = 4;
    uint256 internal constant CRIME_COUNT = 4;

    /*
     * Record layout:
     *
     * era                  1 byte
     * minBirthYear         2 bytes
     * maxBirthYear         2 bytes
     * lifespanTotalWeight  4 bytes
     * maleWeight           4 bytes
     * femaleWeight         4 bytes
     * crimeCount           1 byte
     *
     * Header = 18 bytes
     *
     * Each lifespan:
     * minYears             2 bytes
     * maxYears             2 bytes
     * weight               4 bytes
     * noCrimeWeight        4 bytes
     *
     * Lifespan = 12 bytes
     *
     * Each anonymous crime:
     * selectionWeight       4 bytes
     * commitWeight          4 bytes
     *
     * Crime = 8 bytes
     */

    uint256 internal constant RECORD_HEAD_BYTES = 18;
    uint256 internal constant LIFESPAN_BYTES = 12;
    uint256 internal constant CRIME_BYTES = 8;

    error SoulOddsTitleArgs__OutOfBounds();
    error SoulOddsTitleArgs__TooLarge();
    error SoulOddsTitleArgs__InvalidEra();
    error SoulOddsTitleArgs__InvalidConfigurationCount();
    error SoulOddsTitleArgs__InvalidBirthYearRange();
    error SoulOddsTitleArgs__InvalidLifespan();
    error SoulOddsTitleArgs__InvalidWeights();

    function encode(
        SoulConfiguration[] memory configurations
    ) internal pure returns (bytes memory args) {
        uint256 count = configurations.length;

        if (count != ERA_COUNT) {
            revert SoulOddsTitleArgs__InvalidConfigurationCount();
        }

        if (count > type(uint8).max) {
            revert SoulOddsTitleArgs__TooLarge();
        }

        bytes memory offsets;
        bytes memory records;

        uint256 recordsStart = 1 + count * 2;

        for (uint256 i = 0; i < count; i++) {
            SoulConfiguration memory configuration = configurations[i];

            if (uint256(configuration.era) >= ERA_COUNT) {
                revert SoulOddsTitleArgs__InvalidEra();
            }

            if (configuration.minBirthYear > configuration.maxBirthYear) {
                revert SoulOddsTitleArgs__InvalidBirthYearRange();
            }

            uint256 recordOffset = recordsStart + records.length;

            if (recordOffset > type(uint16).max) {
                revert SoulOddsTitleArgs__TooLarge();
            }

            offsets = bytes.concat(offsets, bytes2(uint16(recordOffset)));

            records = bytes.concat(records, _encodeRecord(configuration));
        }

        args = bytes.concat(bytes1(uint8(count)), offsets, records);
    }

    function configurationCount(
        bytes memory args
    ) internal pure returns (uint256) {
        return _read(args, 0, 1);
    }

    function decode(
        bytes memory args,
        uint256 index
    ) internal pure returns (SoulConfiguration memory configuration) {
        uint256 count = configurationCount(args);

        if (index >= count) {
            revert SoulOddsTitleArgs__OutOfBounds();
        }

        uint256 record = _read(args, 1 + index * 2, 2);

        configuration.era = SoulEra(_read(args, record, 1));

        if (uint256(configuration.era) >= ERA_COUNT) {
            revert SoulOddsTitleArgs__InvalidEra();
        }

        configuration.minBirthYear = int16(uint16(_read(args, record + 1, 2)));

        configuration.maxBirthYear = int16(uint16(_read(args, record + 3, 2)));

        if (configuration.minBirthYear > configuration.maxBirthYear) {
            revert SoulOddsTitleArgs__InvalidBirthYearRange();
        }

        configuration.lifespanTotalWeight = uint32(_read(args, record + 5, 4));

        configuration.maleWeight = uint32(_read(args, record + 9, 4));

        configuration.femaleWeight = uint32(_read(args, record + 13, 4));

        uint256 crimeCount = _read(args, record + 17, 1);

        if (crimeCount != CRIME_COUNT) {
            revert SoulOddsTitleArgs__InvalidWeights();
        }

        uint256 cursor = record + RECORD_HEAD_BYTES;

        for (uint256 i = 0; i < LIFESPAN_COUNT; i++) {
            uint16 minYears = uint16(_read(args, cursor, 2));

            uint16 maxYears = uint16(_read(args, cursor + 2, 2));

            uint32 weight = uint32(_read(args, cursor + 4, 4));

            uint32 noCrimeWeight = uint32(_read(args, cursor + 8, 4));

            if (minYears > maxYears) {
                revert SoulOddsTitleArgs__InvalidLifespan();
            }

            if (noCrimeWeight > 10_000) {
                revert SoulOddsTitleArgs__InvalidWeights();
            }

            configuration.lifespans[i] = SoulLifespan({
                minYears: minYears,
                maxYears: maxYears,
                weight: weight,
                noCrimeWeight: noCrimeWeight
            });

            cursor += LIFESPAN_BYTES;
        }

        for (uint256 i = 0; i < CRIME_COUNT; i++) {
            uint32 selectionWeight = uint32(_read(args, cursor, 4));

            uint32 commitWeight = uint32(_read(args, cursor + 4, 4));

            if (selectionWeight == 0 || commitWeight > 10_000) {
                revert SoulOddsTitleArgs__InvalidWeights();
            }

            configuration.crimes[i] = SoulCrime({
                selectionWeight: selectionWeight,
                commitWeight: commitWeight
            });

            cursor += CRIME_BYTES;
        }
    }

    function _encodeRecord(
        SoulConfiguration memory configuration
    ) private pure returns (bytes memory record) {
        if (uint256(configuration.era) >= ERA_COUNT) {
            revert SoulOddsTitleArgs__InvalidEra();
        }

        if (configuration.minBirthYear > configuration.maxBirthYear) {
            revert SoulOddsTitleArgs__InvalidBirthYearRange();
        }

        if (configuration.lifespanTotalWeight == 0) {
            revert SoulOddsTitleArgs__InvalidWeights();
        }

        if (configuration.maleWeight == 0 && configuration.femaleWeight == 0) {
            revert SoulOddsTitleArgs__InvalidWeights();
        }

        for (uint256 i = 0; i < LIFESPAN_COUNT; i++) {
            SoulLifespan memory lifespan = configuration.lifespans[i];

            if (lifespan.minYears > lifespan.maxYears) {
                revert SoulOddsTitleArgs__InvalidLifespan();
            }

            if (lifespan.weight == 0 || lifespan.noCrimeWeight > 10_000) {
                revert SoulOddsTitleArgs__InvalidWeights();
            }
        }

        record = abi.encodePacked(
            uint8(configuration.era),
            configuration.minBirthYear,
            configuration.maxBirthYear,
            configuration.lifespanTotalWeight,
            configuration.maleWeight,
            configuration.femaleWeight,
            uint8(CRIME_COUNT)
        );

        for (uint256 i = 0; i < LIFESPAN_COUNT; i++) {
            SoulLifespan memory lifespan = configuration.lifespans[i];

            record = bytes.concat(
                record,
                abi.encodePacked(
                    lifespan.minYears,
                    lifespan.maxYears,
                    lifespan.weight,
                    lifespan.noCrimeWeight
                )
            );
        }

        for (uint256 i = 0; i < CRIME_COUNT; i++) {
            SoulCrime memory crime = configuration.crimes[i];

            if (crime.selectionWeight == 0 || crime.commitWeight > 10_000) {
                revert SoulOddsTitleArgs__InvalidWeights();
            }

            record = bytes.concat(
                record,
                abi.encodePacked(crime.selectionWeight, crime.commitWeight)
            );
        }
    }

    function _read(
        bytes memory data,
        uint256 offset,
        uint256 size
    ) private pure returns (uint256 value) {
        if (offset + size > data.length) {
            revert SoulOddsTitleArgs__OutOfBounds();
        }

        assembly ("memory-safe") {
            value := shr(
                sub(256, mul(size, 8)),
                mload(add(add(data, 32), offset))
            )
        }
    }
}
