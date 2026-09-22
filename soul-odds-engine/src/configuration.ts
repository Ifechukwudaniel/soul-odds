import { parseUnits } from 'viem';
import { SOUL_ERAS, type SoulConfiguration, type SoulEraName } from './soul.ts';

export type SoulLifespanDefinition = {
  minYears: number;
  maxYears: number;
  weight: number;
  noCrimeWeight: number;
};

export type SoulCrimeDefinition = {
  /**
   * Off-chain only, for the CLI/frontend to key against; the contract knows crime slots only by
   * index (0-3) and never sees this. A human-readable name is a title's own concern, resolved by
   * whatever API/config serves that title (e.g. `SIN_CATEGORIES` in games/soul-odds), not stored here.
   */
  id: number;
  selectionWeight: number;
  commitWeight: number;
};

export type SoulConfigurationDefinition = {
  name: string;
  era: SoulEraName;
  minBirthYear: number;
  maxBirthYear: number;
  maleWeight: number;
  femaleWeight: number;
  /** Decimal string, e.g. "0.95" for a 95% RTP. */
  rtpWad: string;
  lifespans: [
    SoulLifespanDefinition,
    SoulLifespanDefinition,
    SoulLifespanDefinition,
    SoulLifespanDefinition,
  ];
  crimes: [SoulCrimeDefinition, SoulCrimeDefinition, SoulCrimeDefinition, SoulCrimeDefinition];
};

export type SoulTitleDefinition = {
  name: string;
  betConfigurations: SoulConfigurationDefinition[];
};

export type SoulConfigurationInput = {
  era: number;
  minBirthYear: number;
  maxBirthYear: number;
  maleWeight: number;
  femaleWeight: number;
  rtpWad: bigint;
  lifespans: readonly [
    { minYears: number; maxYears: number; weight: number; noCrimeWeight: number },
    { minYears: number; maxYears: number; weight: number; noCrimeWeight: number },
    { minYears: number; maxYears: number; weight: number; noCrimeWeight: number },
    { minYears: number; maxYears: number; weight: number; noCrimeWeight: number },
  ];
  crimes: readonly [
    { selectionWeight: number; commitWeight: number },
    { selectionWeight: number; commitWeight: number },
    { selectionWeight: number; commitWeight: number },
    { selectionWeight: number; commitWeight: number },
  ];
};

export type CompiledSoulConfiguration = {
  definition: SoulConfigurationDefinition;
  input: SoulConfigurationInput;
  configuration: SoulConfiguration;
};

function eraIndex(era: SoulEraName): number {
  const index = SOUL_ERAS.indexOf(era);
  if (index === -1) throw new Error(`Unknown era "${era}"; expected one of ${SOUL_ERAS.join(', ')}`);
  return index;
}

export function toConfigurationInput(definition: SoulConfigurationDefinition): SoulConfigurationInput {
  return {
    era: eraIndex(definition.era),
    minBirthYear: definition.minBirthYear,
    maxBirthYear: definition.maxBirthYear,
    maleWeight: definition.maleWeight,
    femaleWeight: definition.femaleWeight,
    rtpWad: parseUnits(definition.rtpWad, 18),
    lifespans: definition.lifespans,
    crimes: definition.crimes.map(crime => ({
      selectionWeight: crime.selectionWeight,
      commitWeight: crime.commitWeight,
    })) as unknown as SoulConfigurationInput['crimes'],
  };
}

export function toConfiguration(input: SoulConfigurationInput): SoulConfiguration {
  const lifespanTotalWeight = input.lifespans.reduce((sum, lifespan) => sum + lifespan.weight, 0);
  return {
    era: input.era,
    minBirthYear: input.minBirthYear,
    maxBirthYear: input.maxBirthYear,
    lifespanTotalWeight: BigInt(lifespanTotalWeight),
    maleWeight: BigInt(input.maleWeight),
    femaleWeight: BigInt(input.femaleWeight),
    rtpWad: input.rtpWad,
    lifespans: input.lifespans.map(lifespan => ({
      minYears: lifespan.minYears,
      maxYears: lifespan.maxYears,
      weight: BigInt(lifespan.weight),
      noCrimeWeight: BigInt(lifespan.noCrimeWeight),
    })) as unknown as SoulConfiguration['lifespans'],
    crimes: input.crimes.map(crime => ({
      selectionWeight: BigInt(crime.selectionWeight),
      commitWeight: BigInt(crime.commitWeight),
    })) as unknown as SoulConfiguration['crimes'],
  };
}
