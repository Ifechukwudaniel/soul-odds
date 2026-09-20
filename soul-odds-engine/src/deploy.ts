import { type Address, parseEventLogs, type PublicClient, type WalletClient } from 'viem';
import { soulOddsTitleAbi, soulOddsTitleDeployerAbi } from './abi.ts';
import type { SoulConfigurationInput } from './configuration.ts';

export type DeployTitleParams = {
  publicClient: PublicClient;
  walletClient: WalletClient;
  deployer: Address;
  configuration: SoulConfigurationInput;
};

export type DeployedTitle = { title: Address };

/**
 * Deploys one bet configuration as a title clone, then reads it back to confirm the chain stored
 * exactly what was sent. `SoulOddsTitleDeployer.deployTitle` takes a single configuration — unlike
 * slot titles, a Soul Odds title has no concept of multiple bet configurations.
 */
export async function deployTitle(params: DeployTitleParams): Promise<DeployedTitle> {
  const { publicClient, walletClient, deployer, configuration } = params;
  const account = walletClient.account;
  if (account === undefined) throw new Error('walletClient needs an account');

  const hash = await walletClient.writeContract({
    address: deployer,
    abi: soulOddsTitleDeployerAbi,
    functionName: 'deployTitle',
    args: [configuration],
    account,
    chain: walletClient.chain,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const [deployed] = parseEventLogs({
    abi: soulOddsTitleDeployerAbi,
    eventName: 'SoulOddsTitleDeployed',
    logs: receipt.logs,
  });
  const title = deployed.args.title;

  const onChain = await publicClient.readContract({
    address: title,
    abi: soulOddsTitleAbi,
    functionName: 'betConfiguration',
    args: [0],
  });
  const mismatches = configurationMismatches(configuration, onChain);
  if (mismatches.length > 0) {
    throw new Error(`Deployed title differs from the input: ${mismatches.join('; ')}`);
  }

  return { title };
}

function configurationMismatches(
  input: SoulConfigurationInput,
  onChain: Awaited<ReturnType<PublicClient['readContract']>>,
): string[] {
  const chain = onChain as unknown as {
    era: number;
    minBirthYear: number;
    maxBirthYear: number;
    maleWeight: number;
    femaleWeight: number;
    rtpWad: bigint;
    lifespans: readonly { minYears: number; maxYears: number; weight: number; noCrimeWeight: number }[];
    crimes: readonly { selectionWeight: number; commitWeight: number }[];
  };
  const mismatches: string[] = [];
  if (chain.era !== input.era) mismatches.push(`era: sent ${input.era}, chain has ${chain.era}`);
  if (chain.minBirthYear !== input.minBirthYear) mismatches.push('minBirthYear differs');
  if (chain.maxBirthYear !== input.maxBirthYear) mismatches.push('maxBirthYear differs');
  if (chain.maleWeight !== input.maleWeight) mismatches.push('maleWeight differs');
  if (chain.femaleWeight !== input.femaleWeight) mismatches.push('femaleWeight differs');
  if (chain.rtpWad !== input.rtpWad) mismatches.push(`rtpWad: sent ${input.rtpWad}, chain has ${chain.rtpWad}`);
  input.lifespans.forEach((lifespan, index) => {
    const onChainLifespan = chain.lifespans[index];
    if (
      onChainLifespan.minYears !== lifespan.minYears ||
      onChainLifespan.maxYears !== lifespan.maxYears ||
      onChainLifespan.weight !== lifespan.weight ||
      onChainLifespan.noCrimeWeight !== lifespan.noCrimeWeight
    ) {
      mismatches.push(`lifespan ${index} differs`);
    }
  });
  input.crimes.forEach((crime, index) => {
    const onChainCrime = chain.crimes[index];
    if (
      onChainCrime.selectionWeight !== crime.selectionWeight ||
      onChainCrime.commitWeight !== crime.commitWeight
    ) {
      mismatches.push(`crime ${index} differs`);
    }
  });
  return mismatches;
}
