import { animate } from "framer-motion";
import { useEffect, useReducer, useRef } from "react";
import { bookieCurves, DEATH_WINDOW, erasConfig, marketsConfig, placesConfig, PRICING_CONFIG, SIMS, worldPopCurve } from "@/lib/mortal-odds/config";
import { drawBirth, pickPlace, placeContext as buildPlaceContext } from "@/lib/mortal-odds/draw";
import type { BookieLife } from "@/lib/mortal-odds/model";
import { simulateBookie } from "@/lib/mortal-odds/model";
import { computeMarketPrices, deathYearP, medianDeathYear, priceFromP } from "@/lib/mortal-odds/pricing";
import { createRng } from "@/lib/mortal-odds/rng";
import { playClickSound } from "@/utils/playClickSound";
import type { Draw, EraFilter, MarketPrices, PlaceContext, Price } from "@/types";

const CURRENT_YEAR = new Date().getFullYear();
const SPIN_DURATION_S = 0.75;
const SPIN_YEAR_RANGE = CURRENT_YEAR + 12000;

export type MortalOddsDrawPhase = "idle" | "drawing" | "drawn";

type State = {
  phase: MortalOddsDrawPhase;
  era: EraFilter;
  draw: Draw | null;
  context: PlaceContext | null;
  displayYear: number | null;
  samples: BookieLife[] | null;
  prices: MarketPrices | null;
  defaultDeathGuess: number | null;
};

type Action =
  | { type: "set-era"; era: EraFilter }
  | {
      type: "start-draw";
      draw: Draw;
      context: PlaceContext;
      samples: BookieLife[];
      prices: MarketPrices;
      defaultDeathGuess: number;
    }
  | { type: "tick"; year: number }
  | { type: "finish" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set-era":
      return state.phase === "drawing" ? state : { ...state, era: action.era };
    case "start-draw":
      return {
        ...state,
        phase: "drawing",
        draw: action.draw,
        context: action.context,
        samples: action.samples,
        prices: action.prices,
        defaultDeathGuess: action.defaultDeathGuess,
        displayYear: null,
      };
    case "tick":
      return { ...state, displayYear: action.year };
    case "finish":
      return { ...state, phase: "drawn", displayYear: null };
  }
}

const initialState: State = {
  phase: "idle",
  era: "all",
  draw: null,
  context: null,
  displayYear: null,
  samples: null,
  prices: null,
  defaultDeathGuess: null,
};

/** Drives the idle -> drawing -> drawn stage: picks a human, prices every market, then spins before landing. */
export function useMortalOddsDraw(options: { reducedMotion: boolean }): {
  phase: MortalOddsDrawPhase;
  era: EraFilter;
  draw: Draw | null;
  context: PlaceContext | null;
  displayYear: number | null;
  currentYear: number;
  prices: MarketPrices | null;
  priceDeathYear: (guessYear: number) => Price;
  defaultDeathGuess: number | null;
  setEra: (era: EraFilter) => void;
  drawHuman: () => void;
} {
  const [state, dispatch] = useReducer(reducer, initialState);
  const spin = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => () => spin.current?.stop(), []);

  const drawHuman = () => {
    if (state.phase === "drawing") return;
    playClickSound();

    const rng = createRng();
    const { year, region } = drawBirth({ era: state.era, rng, erasConfig, currentYear: CURRENT_YEAR });
    const place = pickPlace({ region, rng, placesConfig });
    const draw: Draw = { year, region, place };
    const context = buildPlaceContext({ draw, erasConfig, worldPopCurve, currentYear: CURRENT_YEAR });
    const samples = simulateBookie({ year, rng, curves: bookieCurves, sims: SIMS });
    const prices = computeMarketPrices({ markets: marketsConfig, samples, config: PRICING_CONFIG });
    const defaultDeathGuess = medianDeathYear(samples);

    dispatch({ type: "start-draw", draw, context, samples, prices, defaultDeathGuess });

    if (options.reducedMotion) {
      dispatch({ type: "finish" });
      return;
    }

    spin.current = animate(0, 1, {
      duration: SPIN_DURATION_S,
      ease: "linear",
      onUpdate: () => {
        const fakeYear = Math.floor(rng() * SPIN_YEAR_RANGE) - 12000;
        dispatch({ type: "tick", year: fakeYear });
      },
      onComplete: () => dispatch({ type: "finish" }),
    });
  };

  const priceDeathYear = (guessYear: number): Price => {
    if (!state.samples) return { p: 0, odds: null, tag: "Long shot" };
    const p = deathYearP({ samples: state.samples, guess: guessYear, window: DEATH_WINDOW });
    return priceFromP({ p, config: PRICING_CONFIG });
  };

  return {
    phase: state.phase,
    era: state.era,
    draw: state.draw,
    context: state.context,
    displayYear: state.displayYear,
    currentYear: CURRENT_YEAR,
    prices: state.prices,
    priceDeathYear,
    defaultDeathGuess: state.defaultDeathGuess,
    setEra: (era) => dispatch({ type: "set-era", era }),
    drawHuman,
  };
}

export type MortalOddsRound = ReturnType<typeof useMortalOddsDraw>;
