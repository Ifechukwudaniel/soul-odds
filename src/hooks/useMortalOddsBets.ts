import { useReducer } from "react";
import type { Bet } from "@/types";

type BetsState = Record<string, Bet>;

type Action =
  | { type: "set-choice"; marketId: string; optionId: string; stake: number }
  | { type: "set-death-year"; guessYear: number; stake: number }
  | { type: "remove"; marketId: string }
  | { type: "reset" };

function reducer(state: BetsState, action: Action): BetsState {
  switch (action.type) {
    case "set-choice":
      return { ...state, [action.marketId]: { marketId: action.marketId, kind: "choice", optionId: action.optionId, stake: action.stake } };
    case "set-death-year":
      return { ...state, dy: { marketId: "dy", kind: "range", guessYear: action.guessYear, stake: action.stake } };
    case "remove": {
      const next = { ...state };
      delete next[action.marketId];
      return next;
    }
    case "reset":
      return {};
  }
}

/** The bet slip: one pick per market, added and removed as the player steps through the pager. */
export function useMortalOddsBets(): {
  bets: BetsState;
  setChoice: (marketId: string, optionId: string, stake: number) => void;
  setDeathYear: (guessYear: number, stake: number) => void;
  remove: (marketId: string) => void;
  reset: () => void;
} {
  const [bets, dispatch] = useReducer(reducer, {});

  return {
    bets,
    setChoice: (marketId, optionId, stake) => dispatch({ type: "set-choice", marketId, optionId, stake }),
    setDeathYear: (guessYear, stake) => dispatch({ type: "set-death-year", guessYear, stake }),
    remove: (marketId) => dispatch({ type: "remove", marketId }),
    reset: () => dispatch({ type: "reset" }),
  };
}

export type MortalOddsBets = ReturnType<typeof useMortalOddsBets>;
