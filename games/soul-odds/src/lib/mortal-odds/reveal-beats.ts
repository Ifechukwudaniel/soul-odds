import type { BetResult } from "@/types";

export type RevealBeat = { kind: "life" } | { kind: "bet"; index: number } | { kind: "total" };

/** The reveal, one beat at a time: the life first, then each settled bet, then the round's net. */
export function revealBeats(results: readonly BetResult[]): RevealBeat[] {
  return [
    { kind: "life" },
    ...results.map((_result, index): RevealBeat => ({ kind: "bet", index })),
    { kind: "total" },
  ];
}

/** How many bet rows are on screen once the player has reached a given beat. */
export function visibleBetCount(options: { beats: readonly RevealBeat[]; beat: number }): number {
  const { beats, beat } = options;
  return beats.slice(0, beat + 1).filter((entry) => entry.kind === "bet").length;
}
