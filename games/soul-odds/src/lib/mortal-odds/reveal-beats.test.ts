import { describe, expect, it } from "vitest";
import { revealBeats, visibleBetCount } from "@/lib/mortal-odds/reveal-beats";
import type { BetResult } from "@/types";

function result(marketId: string): BetResult {
  return {
    marketId,
    marketLabel: marketId,
    won: true,
    pickLabel: "yes",
    outcomeLabel: "yes",
    stake: 10,
    net: 5,
    skill: 1,
    bookieP: 0.5,
    realP: 0.5,
  };
}

describe("revealBeats", () => {
  it("brackets the bets with a life beat and a total beat", () => {
    const beats = revealBeats([result("sex"), result("age")]);
    expect(beats).toEqual([{ kind: "life" }, { kind: "bet", index: 0 }, { kind: "bet", index: 1 }, { kind: "total" }]);
  });

  it("still opens and closes when no bets were placed", () => {
    expect(revealBeats([])).toEqual([{ kind: "life" }, { kind: "total" }]);
  });
});

describe("visibleBetCount", () => {
  const beats = revealBeats([result("sex"), result("age")]);

  it("shows no bets on the life beat", () => {
    expect(visibleBetCount({ beats, beat: 0 })).toBe(0);
  });

  it("accumulates one bet per beat", () => {
    expect(visibleBetCount({ beats, beat: 1 })).toBe(1);
    expect(visibleBetCount({ beats, beat: 2 })).toBe(2);
  });

  it("keeps every bet on screen at the total", () => {
    expect(visibleBetCount({ beats, beat: beats.length - 1 })).toBe(2);
  });
});
