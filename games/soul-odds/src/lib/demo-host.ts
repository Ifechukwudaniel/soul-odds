import { type HostApiV1, type HostSnapshotV1, SessionPhase } from '@chain/casino-sdk/guest';
import {
  decodePrediction,
  generateSoul,
  matchBreakdown,
  pickConfigurationIndex,
  predictionPayout,
  validatePrediction,
} from '@chain/soul-odds-engine/soul';
import { decodeAbiParameters, encodeAbiParameters, type Hex, parseUnits, toHex } from 'viem';
import { settledGameStateAbi, soulOddsConfigurations } from '@/lib/mortal-odds/soul-odds-contract';

type Session = HostSnapshotV1['sessions']['items'][number];

const DECIMALS = 18;
const STARTING_BALANCE = parseUnits('1000', DECIMALS);
const SMALLEST_CHIP = parseUnits('1', DECIMALS);
const OPEN_LATENCY_MS = 250;
const SETTLE_LATENCY_MS = 800;
const DEMO_GAME = '0x0000000000000000000000000000000000000002';

const STORAGE_KEY = 'soul-odds-demo-host:v1';
const WALLET_STORAGE_KEY = 'soul-odds-demo-host:wallet';
const MAX_SAVED_SESSIONS = 20;

const randomAddress = (): `0x${string}` => toHex(crypto.getRandomValues(new Uint8Array(20)));

/** Every guest gets their own demo wallet, persisted per browser instead of a shared constant. */
function loadOrCreateWallet(): `0x${string}` {
  try {
    const saved = localStorage.getItem(WALLET_STORAGE_KEY);
    if (saved && /^0x[0-9a-f]{40}$/.test(saved)) return saved as `0x${string}`;
  } catch {
    // storage unavailable: fall through to a wallet that just won't persist across reloads
  }

  const address = randomAddress();
  try {
    localStorage.setItem(WALLET_STORAGE_KEY, address);
  } catch {
    // storage unavailable: the demo still plays, it just gets a new identity on refresh
  }
  return address;
}

type SavedDemoHost = { balance: string; nextSessionId: number; sessions: Session[] };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function loadSaved(): SavedDemoHost | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    const { balance, nextSessionId, sessions } = parsed;
    const valid =
      typeof balance === 'string' &&
      /^\d+$/.test(balance) &&
      typeof nextSessionId === 'number' &&
      Array.isArray(sessions);
    return valid ? { balance, nextSessionId, sessions } : null;
  } catch {
    return null;
  }
}

function save(state: SavedDemoHost): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: the demo still plays, it just resets on refresh */
  }
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const randomHex32 = (): Hex => toHex(crypto.getRandomValues(new Uint8Array(32)));

function buildSnapshot(
  wallet: `0x${string}`,
  balance: bigint,
  sessions: Session[],
): HostSnapshotV1 {
  return {
    apiVersion: 1,
    integration: {
      chainId: 0,
      slug: 'soul-odds',
      gameAddress: DEMO_GAME,
      manifest: {
        schemaVersion: 1,
        gameId: 'SoulOddsGame',
        apiVersion: 1,
        defaultLocale: 'en',
        locales: { en: { name: 'Soul Odds' } },
      },
    },
    wallet: { address: wallet, smartVaultAddress: wallet, status: 'ready' },
    token: { symbol: 'chUSD', decimals: DECIMALS },
    balances: { smartVaultBalance: balance.toString() },
    sessions: { items: sessions },
    ui: { locale: 'en', theme: 'dark' },
  };
}

/**
 * Stands in for the chain.wtf host when the game is opened outside its iframe: keeps a play-money
 * balance and settles rounds locally with the same SoulOddsEngine odds and payout maths the deployed
 * contract uses, and pushes each change to `publish` the way the real host pushes snapshots.
 */
export function connectDemoHost(publish: (snapshot: HostSnapshotV1) => void): Promise<HostApiV1> {
  const wallet = loadOrCreateWallet();
  const saved = loadSaved();
  let balance = saved ? BigInt(saved.balance) : STARTING_BALANCE;
  let nextSessionId = saved?.nextSessionId ?? 1;
  let sessions: Session[] = saved?.sessions ?? [];

  const push = () => publish(buildSnapshot(wallet, balance, sessions));
  const persist = () =>
    save({
      balance: balance.toString(),
      nextSessionId,
      sessions: sessions.slice(0, MAX_SAVED_SESSIONS),
    });

  const patchSession = (sessionId: string, patch: Partial<Session>) => {
    sessions = sessions.map((session) =>
      session.sessionId === sessionId ? { ...session, ...patch } : session,
    );
  };

  const hostApi: HostApiV1 = {
    async openSession(input) {
      await delay(OPEN_LATENCY_MS);
      const wager = BigInt(input.wager);
      if (wager <= 0n || wager > balance)
        throw new Error('Not enough demo balance for that wager.');

      const sessionId = String(nextSessionId++);
      const sessionKey = randomHex32();
      // Like the real engine, the era configuration is fixed when the session starts, before any prediction.
      const configurationIndex = pickConfigurationIndex(
        randomHex32(),
        soulOddsConfigurations.length,
      );
      const now = Math.floor(Date.now() / 1000);
      balance -= wager;
      sessions = [
        {
          sessionId,
          sessionKey,
          gameAddress: DEMO_GAME,
          phase: SessionPhase.WAITING_PLAYER_ACTION,
          phaseName: 'WAITING_PLAYER_ACTION',
          wager: wager.toString(),
          stake: wager.toString(),
          isSettled: false,
          openedAt: now,
          lastEventTimestamp: now,
          raw: {
            gameData: '0x',
            gameState: encodeAbiParameters([{ type: 'uint256' }], [BigInt(configurationIndex)]),
          },
        },
        ...sessions,
      ];
      persist();
      push();
      return { sessionKey, transactionHash: randomHex32() };
    },

    async submitAction(input) {
      const session = sessions.find((item) => item.sessionId === input.sessionId);
      if (session?.phase !== SessionPhase.WAITING_PLAYER_ACTION)
        throw new Error('This round is no longer open.');

      const prediction = decodePrediction(input.actionData);
      validatePrediction(prediction);

      patchSession(session.sessionId, {
        phase: SessionPhase.WAITING_RANDOMNESS,
        phaseName: 'WAITING_RANDOMNESS',
      });
      push();

      const wager = BigInt(session.wager ?? '0');
      const randomness = randomHex32();
      const [configurationIndex] = decodeAbiParameters(
        [{ type: 'uint256' }],
        session.raw.gameState as Hex,
      );
      const configuration =
        soulOddsConfigurations[Number(configurationIndex)] ?? soulOddsConfigurations[0];
      if (!configuration)
        throw new Error('Mortal Odds title has no era configurations to draw from.');
      const result = generateSoul(configuration, randomness);
      const breakdown = matchBreakdown(prediction, result);
      const payout = predictionPayout(configuration, wager, prediction, result);
      const now = Math.floor(Date.now() / 1000);

      // A demo player who busts gets a fresh bankroll instead of a dead end.
      balance += payout;
      if (balance < SMALLEST_CHIP) balance = STARTING_BALANCE;

      patchSession(session.sessionId, {
        phase: SessionPhase.SETTLED,
        phaseName: 'SETTLED',
        payout: payout.toString(),
        isSettled: true,
        settledAt: now,
        lastEventTimestamp: now,
        raw: {
          ...session.raw,
          gameState: encodeAbiParameters(settledGameStateAbi, [
            prediction,
            result,
            payout > 0n,
            breakdown,
          ]),
        },
      });
      // Saved before the settle delay, so a refresh mid-wait comes back to an already-settled round.
      persist();

      await delay(SETTLE_LATENCY_MS);
      push();
      return { transactionHash: randomHex32() };
    },

    async cancelStuckRandomness() {
      throw new Error('Nothing can get stuck in demo mode.');
    },

    async revealOutcome() {},
  };

  push();
  return Promise.resolve(hostApi);
}

/** Whether the page is the top-level document, i.e. opened directly rather than inside the host iframe. */
export const isStandalone = (): boolean => window.parent === window;
