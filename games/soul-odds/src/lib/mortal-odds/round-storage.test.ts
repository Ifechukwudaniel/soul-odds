import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearRound, readRound, roundStorageKey, toResumablePhase, writeRound } from "@/lib/mortal-odds/round-storage";
import type { StoredRound } from "@/lib/mortal-odds/round-storage";
import type { HostSnapshotV1 } from "@chain/casino-sdk/guest";

const round = (overrides: Partial<StoredRound> = {}): StoredRound => ({
  version: 1,
  sessionKey: "0xabc",
  wagerWei: "10000000000000000000",
  phase: "predicting",
  era: "all",
  draw: { year: 1850, region: "eur", place: { name: "Lyon, Europe", share: 0.1, lat: 45.7, lon: 4.8 } },
  story: "A story.",
  samplesSeed: 7,
  bets: { sex: { marketId: "sex", kind: "choice", optionId: "girl", stake: 3 } },
  charges: [{ id: "stake", label: "Stake", amount: 10, kind: "stake" }],
  chipSize: 10,
  reveal: null,
  ...overrides,
});

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("readRound / writeRound / clearRound", () => {
  it("round-trips a saved round", () => {
    writeRound("k", round());
    expect(readRound("k")).toEqual(round());
  });

  it("returns null when nothing is saved", () => {
    expect(readRound("k")).toBeNull();
  });

  it("forgets a cleared round", () => {
    writeRound("k", round());
    clearRound("k");
    expect(readRound("k")).toBeNull();
  });

  it("ignores unparseable data", () => {
    store.set("k", "{not json");
    expect(readRound("k")).toBeNull();
  });

  it("ignores a round saved by another version", () => {
    store.set("k", JSON.stringify({ ...round(), version: 2 }));
    expect(readRound("k")).toBeNull();
  });

  it.each([
    ["a non-numeric wager", { wagerWei: "ten" }],
    ["an unknown phase", { phase: "idle" }],
    ["a missing draw", { draw: undefined }],
    ["a missing session key", { sessionKey: undefined }],
    ["a reveal before the reveal phase", { reveal: {} }],
  ])("ignores a round with %s", (_name, override) => {
    store.set("k", JSON.stringify({ ...round(), ...override }));
    expect(readRound("k")).toBeNull();
  });

  it("requires a reveal in the revealed phase", () => {
    store.set("k", JSON.stringify({ ...round(), phase: "revealed", reveal: null }));
    expect(readRound("k")).toBeNull();
  });

  it("survives storage that throws", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    });
    expect(readRound("k")).toBeNull();
    expect(() => writeRound("k", round())).not.toThrow();
    expect(() => clearRound("k")).not.toThrow();
  });
});

describe("toResumablePhase", () => {
  it("saves a spinning draw as the year reveal", () => {
    expect(toResumablePhase("drawing")).toBe("when");
  });

  it("keeps every mid-round phase as is", () => {
    for (const phase of ["when", "where", "predicting", "confirming", "settling", "revealed"] as const) {
      expect(toResumablePhase(phase)).toBe(phase);
    }
  });

  it("has nothing to save when idle", () => {
    expect(toResumablePhase("idle")).toBeNull();
  });
});

describe("roundStorageKey", () => {
  const snapshot = (wallet: HostSnapshotV1["wallet"]): HostSnapshotV1 => ({
    apiVersion: 1,
    integration: { chainId: 7, slug: "s", gameAddress: "0x0000000000000000000000000000000000000002", manifest: { schemaVersion: 1, gameId: "g", apiVersion: 1, defaultLocale: "en", locales: {} } },
    wallet,
    token: {},
    balances: {},
    sessions: { items: [] },
    ui: { locale: "en", theme: "dark" },
  });

  it("is scoped to chain, game and wallet", () => {
    const a = roundStorageKey(snapshot({ status: "ready", smartVaultAddress: "0x00000000000000000000000000000000000000a1" }));
    const b = roundStorageKey(snapshot({ status: "ready", smartVaultAddress: "0x00000000000000000000000000000000000000b2" }));
    expect(a).toContain(":7:");
    expect(a).not.toBe(b);
  });

  it("has no key without a wallet", () => {
    expect(roundStorageKey(snapshot({ status: "disconnected" }))).toBeNull();
  });
});
