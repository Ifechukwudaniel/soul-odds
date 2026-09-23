import { describe, expect, it } from "vitest";
import { addEntry, MAX_HISTORY_ENTRIES, type BetHistoryEntry } from "./bet-history";

function entry(id: string, options: Partial<BetHistoryEntry> = {}): BetHistoryEntry {
  return {
    id,
    settledAt: 0,
    placeName: "Thebes",
    lat: 25.7,
    lon: 32.6,
    name: null,
    story: "A short life.",
    bornYear: -1200,
    deathYear: -1170,
    age: 30,
    sex: "girl",
    sin: null,
    wager: 10,
    fees: 0,
    net: 0,
    roundNet: 0,
    skill: 0,
    bets: [],
    ...options,
  };
}

describe("addEntry", () => {
  it("puts the newest round first", () => {
    expect(addEntry([entry("a")], entry("b")).map((item) => item.id)).toEqual(["b", "a"]);
  });

  it("replaces an earlier record of the same round", () => {
    const next = addEntry([entry("a", { net: 1 })], entry("a", { net: 2 }));
    expect(next).toHaveLength(1);
    expect(next[0]?.net).toBe(2);
  });

  it("drops the oldest rounds past the cap", () => {
    const full = Array.from({ length: MAX_HISTORY_ENTRIES }, (_, index) => entry(`old-${index}`));
    const next = addEntry(full, entry("new"));
    expect(next).toHaveLength(MAX_HISTORY_ENTRIES);
    expect(next[0]?.id).toBe("new");
    expect(next.at(-1)?.id).toBe(`old-${MAX_HISTORY_ENTRIES - 2}`);
  });
});
