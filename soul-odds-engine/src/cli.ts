#!/usr/bin/env tsx
import { parseArgs } from 'node:util';
import { type Address, createPublicClient, createWalletClient, formatUnits, type Hex, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { soulOddsTitleAbi } from './abi.ts';
import { deployTitle } from './deploy.ts';
import {
  maxPayout,
  minimumPredictionProbabilityWad,
  predictionMaxPayout,
  predictionProbabilityWad,
  type SoulConfiguration,
  validCrimeMasks,
} from './soul.ts';
import type { CompiledSoulConfiguration } from './configuration.ts';
import { loadTitleFile } from './title.ts';

const USAGE = `soul-odds-engine <command>

  compile <title.json>                          print the base configuration's exact odds
  deploy <title.json> --rpc <url> --deployer <address>
                                                needs SOUL_ODDS_ENGINE_PRIVATE_KEY
  decode <title address> --rpc <url>            print the on-chain base configuration
  balance <account address> --rpc <url> --token <address>
                                                print the account's token balance`;

const ERC20_BALANCE_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;

function percent(wad: bigint): string {
  return `${(Number(wad) / 1e16).toFixed(4)}%`;
}

function crimeLabel(ids: readonly number[], mask: number): string {
  if (mask === 0) return 'no crime';
  const picked = ids.filter((_, index) => (mask & (1 << index)) !== 0);
  return picked.map(id => `crime ${id}`).join(' + ');
}

function describe(compiled: CompiledSoulConfiguration): string {
  const { definition, configuration } = compiled;
  const crimeIds = definition.crimes.map(crime => crime.id);
  const genderTotal = configuration.maleWeight + configuration.femaleWeight;
  const lines = [
    `${definition.name} (${definition.era}, ${definition.minBirthYear}..${definition.maxBirthYear})`,
    `  RTP            ${percent(configuration.rtpWad)}`,
    `  gender         male ${percent((configuration.maleWeight * 10n ** 18n) / genderTotal)}, ` +
      `female ${percent((configuration.femaleWeight * 10n ** 18n) / genderTotal)}`,
  ];
  configuration.lifespans.forEach((lifespan, index) => {
    const probabilityWad = (lifespan.weight * 10n ** 18n) / configuration.lifespanTotalWeight;
    lines.push(
      `  lifespan ${index}      ${lifespan.minYears}-${lifespan.maxYears}y  ` +
        `${percent(probabilityWad)}  no-crime ${(Number(lifespan.noCrimeWeight) / 100).toFixed(2)}%`,
    );
  });
  lines.push('  predictions (gender × lifespan × crimes):');
  for (let gender = 0; gender < 2; gender++) {
    for (let bucket = 0; bucket < 4; bucket++) {
      for (const mask of validCrimeMasks()) {
        const prediction = { gender, lifespanBucket: bucket, sins: mask !== 0, crimeMask: mask };
        const probabilityWad = predictionProbabilityWad(configuration, prediction);
        if (probabilityWad === 0n) continue;
        const payout = predictionMaxPayout(configuration, 10n ** 18n, prediction);
        lines.push(
          `    ${gender === 0 ? 'male' : 'female'}, bucket ${bucket}, ${crimeLabel(crimeIds, mask)}` +
            `  odds ${percent(probabilityWad)}  pays ${(Number(payout) / 1e18).toFixed(4)}x`,
        );
      }
    }
  }
  const rarest = minimumPredictionProbabilityWad(configuration);
  lines.push(
    `  rarest prediction odds ${percent(rarest)}, max payout ${(Number(maxPayout(configuration, 10n ** 18n)) / 1e18).toFixed(4)}x`,
  );
  return lines.join('\n');
}

function requireOption(value: string | undefined, name: string): string {
  if (value === undefined) throw new Error(`Missing --${name}\n\n${USAGE}`);
  return value;
}

function describeOnChain(configuration: SoulConfiguration): string {
  return [
    `era ${configuration.era}, birth years ${configuration.minBirthYear}..${configuration.maxBirthYear}`,
    `RTP ${percent(configuration.rtpWad)}`,
    `gender weights male ${configuration.maleWeight}, female ${configuration.femaleWeight}`,
    ...configuration.lifespans.map(
      (lifespan, index) =>
        `lifespan ${index}: ${lifespan.minYears}-${lifespan.maxYears}y weight ${lifespan.weight} no-crime ${lifespan.noCrimeWeight}bps`,
    ),
    ...configuration.crimes.map(
      (crime, index) =>
        `crime slot ${index}: selection weight ${crime.selectionWeight}, commit weight ${crime.commitWeight}bps`,
    ),
  ].join('\n');
}

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: { rpc: { type: 'string' }, deployer: { type: 'string' }, token: { type: 'string' } },
  });
  const [command, target] = positionals;
  if (command === undefined || target === undefined) throw new Error(USAGE);

  if (command === 'compile' || command === 'deploy') {
    const title = loadTitleFile(target);
    console.log(`${title.name}\n`);
    for (const configuration of title.betConfigurations) {
      console.log(describe(configuration));
      console.log();
    }

    if (command === 'deploy') {
      const privateKey = process.env.SOUL_ODDS_ENGINE_PRIVATE_KEY;
      if (privateKey === undefined) throw new Error('Set SOUL_ODDS_ENGINE_PRIVATE_KEY');
      const transport = http(requireOption(values.rpc, 'rpc'));
      const publicClient = createPublicClient({ transport });
      const chain = { id: await publicClient.getChainId() } as never;
      const deployed = await deployTitle({
        publicClient,
        walletClient: createWalletClient({
          transport,
          chain,
          account: privateKeyToAccount(requireOption(privateKey, 'private key') as Hex),
        }),
        deployer: requireOption(values.deployer, 'deployer') as Address,
        configurations: title.betConfigurations.map(betConfiguration => betConfiguration.input),
      });
      console.log(`title ${deployed.title}`);
    }
    return;
  }

  if (command === 'decode') {
    const client = createPublicClient({ transport: http(requireOption(values.rpc, 'rpc')) });
    const onChain = await client.readContract({
      address: target as Address,
      abi: soulOddsTitleAbi,
      functionName: 'betConfiguration',
      args: [0],
    });
    console.log(describeOnChain(onChain as unknown as SoulConfiguration));
    return;
  }

  if (command === 'balance') {
    const client = createPublicClient({ transport: http(requireOption(values.rpc, 'rpc')) });
    const token = requireOption(values.token, 'token') as Address;
    const account = target as Address;
    const [raw, decimals] = await Promise.all([
      client.readContract({ address: token, abi: ERC20_BALANCE_ABI, functionName: 'balanceOf', args: [account] }),
      client.readContract({ address: token, abi: ERC20_BALANCE_ABI, functionName: 'decimals' }),
    ]);
    console.log(`${formatUnits(raw, decimals)} (${raw} base units)`);
    return;
  }

  throw new Error(USAGE);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
