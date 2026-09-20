import { parseAbi } from 'viem';

const structs = [
  'struct SoulLifespan { uint16 minYears; uint16 maxYears; uint32 weight; uint32 noCrimeWeight; }',
  'struct SoulCrime { uint32 selectionWeight; uint32 commitWeight; }',
  'struct SoulConfiguration { uint8 era; int16 minBirthYear; int16 maxBirthYear; uint32 lifespanTotalWeight; uint32 maleWeight; uint32 femaleWeight; uint64 rtpWad; SoulLifespan[4] lifespans; SoulCrime[4] crimes; }',
  'struct SoulConfigurationInput { uint8 era; int16 minBirthYear; int16 maxBirthYear; uint32 maleWeight; uint32 femaleWeight; uint64 rtpWad; SoulLifespan[4] lifespans; SoulCrime[4] crimes; }',
] as const;

export const soulOddsTitleAbi = parseAbi([
  ...structs,
  'function betConfigurationCount() view returns (uint256)',
  'function betConfiguration(uint8 index) view returns (SoulConfiguration)',
  'function rtpWad(uint8 index) view returns (uint256)',
  'function titleRtpWad() view returns (uint256)',
  'function quoteCaps(uint256 wager, bytes gameData) view returns (uint256 maxEscrowStake, uint256 maxReservedProfit)',
  'function quoteRiskParams(uint256 wager, bytes gameData) view returns (uint256 maxPayout, uint256 probabilityWad, uint256 expectedPayout, uint256 bodyVarianceScaled)',
  'error SoulOddsEngine__NotATitle()',
  'error SoulOddsEngine__InvalidGameData()',
  'error SoulOddsEngine__InvalidPrediction()',
  'error SoulOddsEngine__UnknownBetConfiguration(uint256 index)',
  'error SoulOddsEngine__NoPlayerActions()',
]);

export const soulOddsTitleDeployerAbi = parseAbi([
  ...structs,
  'function engine() view returns (address)',
  'function deployTitle(SoulConfigurationInput input) returns (address title)',
  'function validateConfiguration(SoulConfigurationInput input) pure returns (SoulConfiguration configuration)',
  'event SoulOddsTitleDeployed(address indexed title, uint8 era, int16 minBirthYear, int16 maxBirthYear, uint256 rtpWad)',
  'error SoulOddsTitleDeployer__InvalidEra()',
  'error SoulOddsTitleDeployer__InvalidBirthRange()',
  'error SoulOddsTitleDeployer__BirthYearTooEarly()',
  'error SoulOddsTitleDeployer__BirthYearTooLate()',
  'error SoulOddsTitleDeployer__InvalidGenderWeights()',
  'error SoulOddsTitleDeployer__InvalidLifespan(uint256 index)',
  'error SoulOddsTitleDeployer__InvalidLifespanWeight(uint256 index)',
  'error SoulOddsTitleDeployer__InvalidNoCrimeWeight(uint256 index)',
  'error SoulOddsTitleDeployer__InvalidCrime(uint256 index)',
  'error SoulOddsTitleDeployer__InvalidCrimeWeight(uint256 index)',
  'error SoulOddsTitleDeployer__InvalidRtp()',
  'error SoulOddsTitleDeployer__RtpTooHigh(uint256 rtpWad)',
  'error SoulOddsTitleDeployer__RtpTooLow(uint256 rtpWad)',
]);
