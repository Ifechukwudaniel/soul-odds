import { type HostApi, type HostSnapshot, SessionPhase } from '@chain-protocol/casino-sdk/guest';
import { decodeAbiParameters, type Hex, toHex } from 'viem';
import {
  DEMO_DECIMALS,
  DEMO_GAME,
  DEMO_MAX_SAVED_SESSIONS,
  DEMO_OPEN_LATENCY_MS,
  DEMO_SETTLE_LATENCY_MS,
  DEMO_SMALLEST_CHIP,
  DEMO_STARTING_BALANCE,
} from '@/constants/demo-host';
import { DEMO_HOST_STORAGE_KEY, DEMO_HOST_WALLET_STORAGE_KEY } from '@/constants/storage';
import { configurationIndexFromSession } from '@/lib/mortal-odds/soul-odds-contract';
import { PREDICTION_COUNT, prizeDenominator } from '../../chain/soul-math';
import { settleTier } from '../../chain/soul-settle';

type Session = HostSnapshot['sessions']['items'][number];

const randomAddress = (): `0x${string}` => toHex(crypto.getRandomValues(new Uint8Array(20)));

/** Every guest gets their own demo wallet, persisted per browser instead of a shared constant. */
function loadOrCreateWallet(): `0x${string}` {
  try {
    const saved = localStorage.getItem(DEMO_HOST_WALLET_STORAGE_KEY);
    if (saved && /^0x[0-9a-f]{40}$/.test(saved)) return saved as `0x${string}`;
  } catch {
    // ✦ storage unavailable: fall through to a wallet that just won't persist across reloads
  }

  const address = randomAddress();
  try {
    localStorage.setItem(DEMO_HOST_WALLET_STORAGE_KEY, address);
  } catch {
    // ✦ storage unavailable: the demo still plays, it just gets a new identity on refresh
  }
  return address;
}

type SavedDemoHost = { balance: string; nextSessionId: number; sessions: Session[] };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function loadSaved(): SavedDemoHost | null {
  try {
    const raw = localStorage.getItem(DEMO_HOST_STORAGE_KEY);
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
    localStorage.setItem(DEMO_HOST_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ✦ storage unavailable: the demo still plays, it just resets on refresh */
  }
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const randomHex32 = (): Hex => toHex(crypto.getRandomValues(new Uint8Array(32)));

function buildSnapshot(wallet: `0x${string}`, balance: bigint, sessions: Session[]): HostSnapshot {
  return {
    sdkVersion: '0.7.0',
    integration: {
      chainId: 0,
      slug: 'soul-odds',
      gameAddress: DEMO_GAME,
      manifest: {
        schemaVersion: 1,
        gameId: 'SoulOddsGame',
        defaultLocale: 'en',
        locales: { en: { name: 'Soul Odds' } },
      },
    },
    wallet: { address: wallet, smartWalletAddress: wallet, status: 'ready' },
    token: { symbol: 'chUSD', decimals: DEMO_DECIMALS },
    balances: { smartWalletBalance: balance.toString() },
    sessions: { items: sessions },
    ui: { locale: 'en', theme: 'dark' },
  };
}

/**
 * Stands in for the chain.wtf host when the game is opened outside its iframe: keeps a play-money
 * balance and settles rounds locally with the deployed contract's odds and payout maths, pushing
 * each change through `publish` like the real host.
 */
export function connectDemoHost(publish: (snapshot: HostSnapshot) => void): Promise<HostApi> {
  const wallet = loadOrCreateWallet();
  const saved = loadSaved();
  let balance = saved ? BigInt(saved.balance) : DEMO_STARTING_BALANCE;
  let nextSessionId = saved?.nextSessionId ?? 1;
  let sessions: Session[] = saved?.sessions ?? [];

  const push = () => publish(buildSnapshot(wallet, balance, sessions));
  const persist = () =>
    save({
      balance: balance.toString(),
      nextSessionId,
      sessions: sessions.slice(0, DEMO_MAX_SAVED_SESSIONS),
    });

  const patchSession = (sessionId: string, patch: Partial<Session>) => {
    sessions = sessions.map((session) =>
      session.sessionId === sessionId ? { ...session, ...patch } : session,
    );
  };

  const hostApi: HostApi = {
    // ✦ Play money has no vault to cap it; the only limit is the demo balance.
    async getMaxWager() {
      return { kind: 'no-limit' };
    },

    async openSession(input) {
      await delay(DEMO_OPEN_LATENCY_MS);
      const wager = BigInt(input.wager);
      if (wager <= 0n || wager > balance)
        throw new Error('Not enough demo balance for that wager.');

      const sessionId = String(nextSessionId++);
      const sessionKey = randomHex32();
      // ✦ Like the real title, the era is drawn when the session opens, before any prediction: the
      //   first VRF word picks it.
      const eraWord = randomHex32();
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
            randomness: eraWord,
            randomnessRequests: [
              { nonce: '0', requestId: randomHex32(), randomness: eraWord, fulfilled: true },
            ],
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

      const [predictionIndex] = decodeAbiParameters([{ type: 'uint256' }], input.actionData);
      if (predictionIndex >= BigInt(PREDICTION_COUNT)) throw new Error('Not a valid prediction.');

      patchSession(session.sessionId, {
        phase: SessionPhase.WAITING_RANDOMNESS,
        phaseName: 'WAITING_RANDOMNESS',
      });
      push();

      const wager = BigInt(session.wager ?? '0');
      const settleWord = randomHex32();
      const eraIndex = configurationIndexFromSession(session.raw);
      if (eraIndex === null) throw new Error('This round has no era to settle against.');
      const tier = settleTier(eraIndex, Number(predictionIndex), settleWord);
      const payout = (wager * tier.prizeUnits) / prizeDenominator();
      const now = Math.floor(Date.now() / 1000);

      // ✦ A demo player who busts gets a fresh bankroll instead of a dead end.
      balance += payout;
      if (balance < DEMO_SMALLEST_CHIP) balance = DEMO_STARTING_BALANCE;

      patchSession(session.sessionId, {
        phase: SessionPhase.SETTLED,
        phaseName: 'SETTLED',
        payout: payout.toString(),
        isSettled: true,
        settledAt: now,
        lastEventTimestamp: now,
        raw: {
          ...session.raw,
          randomnessRequests: [
            ...(session.raw.randomnessRequests ?? []),
            { nonce: '1', requestId: randomHex32(), randomness: settleWord, fulfilled: true },
          ],
          actions: [{ step: '1', actionData: input.actionData }],
        },
      });
      // ✦ Saved before the settle delay, so a refresh mid-wait comes back to an already-settled round.
      persist();

      await delay(DEMO_SETTLE_LATENCY_MS);
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
