import type { HostSnapshotV1 } from '@chain/casino-sdk/guest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { connectDemoHost } from '@/lib/demo-host';
import { encodeMortalOddsPrediction, isTerminalPhase } from '@/lib/mortal-odds/soul-odds-contract';

const store = new Map<string, string>();
const WAGER = (10n * 10n ** 18n).toString();
const PREDICTION = encodeMortalOddsPrediction({
  sex: { marketId: 'sex', kind: 'choice', optionId: 'girl', stake: 1 },
  age: { marketId: 'age', kind: 'choice', optionId: 'm', stake: 1 },
  sins: { marketId: 'sins', kind: 'choice', optionId: 'none', stake: 1 },
});

/** Connects a fresh demo host, as a page load would, and tracks the latest snapshot it pushes. */
const load = async () => {
  const latest: { snapshot: HostSnapshotV1 | null } = { snapshot: null };
  const hostApi = await connectDemoHost((snapshot) => {
    latest.snapshot = snapshot;
  });
  return { hostApi, latest };
};

beforeEach(() => {
  store.clear();
  vi.useFakeTimers();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('connectDemoHost persistence', () => {
  it('keeps an open round and its escrowed wager across a reload', async () => {
    const first = await load();
    const opening = first.hostApi.openSession({ wager: WAGER, gameData: '0x' });
    await vi.runAllTimersAsync();
    const { sessionKey } = await opening;

    const second = await load();
    const row = second.latest.snapshot?.sessions.items.find(
      (item) => item.sessionKey === sessionKey,
    );
    expect(row?.isSettled).toBe(false);
    expect(BigInt(second.latest.snapshot?.balances.smartVaultBalance ?? '0')).toBe(
      990n * 10n ** 18n,
    );
  });

  it('keeps a settled round, its result and the payout across a reload', async () => {
    const first = await load();
    const opening = first.hostApi.openSession({ wager: WAGER, gameData: '0x' });
    await vi.runAllTimersAsync();
    const { sessionKey } = await opening;
    const sessionId =
      first.latest.snapshot?.sessions.items.find((item) => item.sessionKey === sessionKey)
        ?.sessionId ?? '';
    const submitting = first.hostApi.submitAction({ sessionId, actionData: PREDICTION });
    await vi.runAllTimersAsync();
    await submitting;

    const second = await load();
    const row = second.latest.snapshot?.sessions.items.find(
      (item) => item.sessionKey === sessionKey,
    );
    expect(row?.isSettled && isTerminalPhase(row.phase) && row.raw.gameState).toBeTruthy();
    expect(second.latest.snapshot?.balances.smartVaultBalance).toBe(
      first.latest.snapshot?.balances.smartVaultBalance,
    );
  });

  it('comes back already settled when reloaded while the result was still being revealed', async () => {
    const first = await load();
    const opening = first.hostApi.openSession({ wager: WAGER, gameData: '0x' });
    await vi.advanceTimersByTimeAsync(300);
    const { sessionKey } = await opening;
    const sessionId =
      first.latest.snapshot?.sessions.items.find((item) => item.sessionKey === sessionKey)
        ?.sessionId ?? '';
    void first.hostApi.submitAction({ sessionId, actionData: PREDICTION });
    await vi.advanceTimersByTimeAsync(0);

    const second = await load();
    const row = second.latest.snapshot?.sessions.items.find(
      (item) => item.sessionKey === sessionKey,
    );
    expect(row?.isSettled).toBe(true);
  });

  it('starts fresh when nothing usable is saved', async () => {
    store.set('soul-odds-demo-host:v1', '{broken');
    const { latest } = await load();
    expect(latest.snapshot?.balances.smartVaultBalance).toBe((1000n * 10n ** 18n).toString());
    expect(latest.snapshot?.sessions.items).toEqual([]);
  });
});
