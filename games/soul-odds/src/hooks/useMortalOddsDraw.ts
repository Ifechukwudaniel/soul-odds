import { animate } from "framer-motion";
import { useEffect, useReducer, useRef } from "react";
import {
  bookieCurves,
  DEATH_WINDOW,
  erasConfig,
  jobsConfig,
  marketsConfig,
  placesConfig,
  PRICING_CONFIG,
  regionModifiersConfig,
  shocksConfig,
  SIMS,
  SINS_PER_ROUND,
  sinsConfig,
  worldPopCurve,
} from "@/lib/mortal-odds/config";
import { drawBirth, pickPlace, placeContext as buildPlaceContext } from "@/lib/mortal-odds/draw";
import { buildLifespanHistogram, medianAge } from "@/lib/mortal-odds/lifespan";
import type { LifespanHistogram } from "@/lib/mortal-odds/lifespan";
import type { BookieLife, FullModelConfig } from "@/lib/mortal-odds/model";
import { drawSex, sampleLife, simulateBookie, simulateFull } from "@/lib/mortal-odds/model";
import { computeMarketPrices, computeTrueProbabilities, deathYearP, medianDeathYear, priceFromP } from "@/lib/mortal-odds/pricing";
import { createRng } from "@/lib/mortal-odds/rng";
import type { Rng } from "@/lib/mortal-odds/rng";
import { resolveBets } from "@/lib/mortal-odds/settle";
import { pickSinOptions } from "@/lib/mortal-odds/sins";
import { tellStory } from "@/lib/mortal-odds/story";
import { playClickSound } from "@/utils/playClickSound";
import type { Bet, BetResult, Draw, EraFilter, Life, MarketConfig, MarketPrices, PlaceContext, Price } from "@/types";

/**
 * Narrows the "sins" market to a random hand of options for this soul (plus "Clean"), instead
 * of pricing the whole catalog every round. A stand-in for the eventual backend-driven pick.
 */
function buildRoundMarkets(options: { year: number; rng: Rng }): MarketConfig[] {
  const candidates = pickSinOptions({ sins: sinsConfig, year: options.year, rng: options.rng, count: SINS_PER_ROUND });
  const sinsOptions = [{ id: "none", label: "Clean" }, ...candidates.map((sin) => ({ id: sin.id, label: sin.label }))];
  return marketsConfig.map((market) => (market.id === "sins" ? { ...market, options: sinsOptions } : market));
}

const CURRENT_YEAR = new Date().getFullYear();
const SPIN_DURATION_S = 0.75;
const SPIN_YEAR_RANGE = CURRENT_YEAR + 12000;

const fullModelConfig: FullModelConfig = { curves: bookieCurves, mods: regionModifiersConfig, shocks: shocksConfig, sins: sinsConfig };

export type MortalOddsDrawPhase = "idle" | "drawing" | "when" | "where" | "predicting" | "confirming" | "revealed";

/** The beats a player steps through after the year lands, in order. Add a beat here and the nav follows. */
const SEQUENCE: MortalOddsDrawPhase[] = ["when", "where", "predicting", "confirming"];

function stepSequence(phase: MortalOddsDrawPhase, delta: number): MortalOddsDrawPhase {
  const index = SEQUENCE.indexOf(phase);
  if (index === -1) return phase;
  return SEQUENCE[index + delta] ?? phase;
}

export type RevealResult = {
  life: Life;
  results: BetResult[];
  net: number;
  skill: number;
  story: string;
  lifespan: LifespanHistogram;
  realMedianAge: number;
  bookieMedianAge: number;
};

type State = {
  phase: MortalOddsDrawPhase;
  era: EraFilter;
  draw: Draw | null;
  context: PlaceContext | null;
  displayYear: number | null;
  samples: BookieLife[] | null;
  prices: MarketPrices | null;
  defaultDeathGuess: number | null;
  reveal: RevealResult | null;
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
  | { type: "finish" }
  | { type: "advance" }
  | { type: "retreat" }
  | { type: "reveal"; reveal: RevealResult };

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
        reveal: null,
      };
    case "tick":
      return { ...state, displayYear: action.year };
    case "finish":
      return { ...state, phase: "when", displayYear: null };
    case "advance":
      return { ...state, phase: stepSequence(state.phase, 1) };
    case "retreat":
      return { ...state, phase: stepSequence(state.phase, -1) };
    case "reveal":
      return { ...state, phase: "revealed", reveal: action.reveal };
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
  reveal: null,
};

/** Drives the idle -> drawing -> when -> where -> predicting -> confirming -> revealed round: picks a human, prices every market, then settles bets against a real simulated life. */
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
  reveal: RevealResult | null;
  setEra: (era: EraFilter) => void;
  drawHuman: () => void;
  advance: () => void;
  retreat: () => void;
  placeBets: (bets: Record<string, Bet>) => { net: number; skill: number; totalStake: number } | null;
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
    const samples = simulateBookie({ year, rng, curves: bookieCurves, sins: sinsConfig, sims: SIMS });
    const prices = computeMarketPrices({ markets: buildRoundMarkets({ year, rng }), samples, config: PRICING_CONFIG });
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

  const placeBets = (bets: Record<string, Bet>): { net: number; skill: number; totalStake: number } | null => {
    if (state.phase !== "confirming" || !state.draw || !state.prices || !state.samples) return null;

    const { draw, prices, samples: bookieSamples } = state;
    const rng = createRng();
    const life = sampleLife({ year: draw.year, region: draw.region, sex: drawSex(rng), withHistory: true, rng, config: fullModelConfig });
    const truthSamples = simulateFull({ year: draw.year, region: draw.region, rng, config: fullModelConfig, sims: SIMS });
    const trueProbabilities = computeTrueProbabilities({ markets: marketsConfig, samples: truthSamples });
    const { results, net, skill } = resolveBets({ life, bets, prices, priceDeathYear, trueProbabilities, truthSamples });
    const totalStake = Object.values(bets).reduce((sum, bet) => sum + bet.stake, 0);
    const childDeathShare = truthSamples.filter((s) => s.age < 5).length / truthSamples.length;
    const story = tellStory({ life, place: draw.place, currentYear: CURRENT_YEAR, childDeathShare, jobs: jobsConfig, rng });
    const lifespan = buildLifespanHistogram({ truthSamples, bookieSamples });
    const realMedianAge = medianAge(truthSamples);
    const bookieMedianAge = medianAge(bookieSamples);

    dispatch({ type: "reveal", reveal: { life, results, net, skill, story, lifespan, realMedianAge, bookieMedianAge } });
    return { net, skill, totalStake };
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
    reveal: state.reveal,
    setEra: (era) => dispatch({ type: "set-era", era }),
    drawHuman,
    advance: () => dispatch({ type: "advance" }),
    retreat: () => dispatch({ type: "retreat" }),
    placeBets,
  };
}

export type MortalOddsRound = ReturnType<typeof useMortalOddsDraw>;
