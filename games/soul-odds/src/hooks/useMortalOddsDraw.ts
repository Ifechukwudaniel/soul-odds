"use client";

import { animate } from "framer-motion";
import { useEffect, useReducer, useRef, useState } from "react";
import { SessionPhase } from "@chain/casino-sdk/guest";
import { parseUnits } from "viem";
import {
  bookieCurves,
  DEATH_WINDOW,
  erasConfig,
  jobsConfig,
  placesConfig,
  PRICING_CONFIG,
  REDRAW_COST,
  regionModifiersConfig,
  shocksConfig,
  SIMS,
  sinsConfig,
  worldPopCurve,
} from "@/lib/mortal-odds/config";
import { drawBirth, pickPlace, placeContext } from "@/lib/mortal-odds/draw";
import { fetchEra } from "@/lib/mortal-odds/era";
import { eraFor } from "@/lib/mortal-odds/geo";
import { fetchPlace } from "@/lib/mortal-odds/place";
import { buildLifespanHistogram, medianAge } from "@/lib/mortal-odds/lifespan";
import type { LifespanHistogram } from "@/lib/mortal-odds/lifespan";
import type { BookieLife, FullModelConfig } from "@/lib/mortal-odds/model";
import { sampleLife, simulateFull } from "@/lib/mortal-odds/model";
import { deathYearP, priceFromP } from "@/lib/mortal-odds/pricing";
import { createRng, pickWeighted, randomSeed } from "@/lib/mortal-odds/rng";
import { deriveRoundData } from "@/lib/mortal-odds/round-data";
import type { StoredRound } from "@/lib/mortal-odds/round-storage";
import { resolveBets } from "@/lib/mortal-odds/settle";
import { buildFlavorSin } from "@/lib/mortal-odds/sins";
import {
  ageBucketIndex,
  categoryFromCrimeMask,
  decodeSettledSoul,
  encodeMortalOddsPrediction,
  isTerminalPhase,
  previewCategoryPrices,
  previewSinsPrices,
  toTrueProbabilities,
} from "@/lib/mortal-odds/soul-odds-contract";
import { pickEpitaph } from "@/lib/mortal-odds/epitaph";
import { buildSpinTimeline, CHART_INTRO_MS } from "@/lib/mortal-odds/spin-timeline";
import type { SpinEvent } from "@/lib/mortal-odds/spin-timeline";
import { tellStory } from "@/lib/mortal-odds/story";
import { pickTimeStory } from "@/lib/mortal-odds/time-story";
import { useCasinoHost } from "@/hooks/useCasinoHost";
import { playSound } from "@/utils/playSound";
import type { Bet, BetResult, Draw, EraFilter, Life, MarketPrices, PlaceContext, Price, RegionId, Sex } from "@/types";

const CURRENT_YEAR = new Date().getFullYear();
const RECENT_EPITAPHS_KEPT = 8;
const RECENT_TIME_STORIES_KEPT = 6;
const SPIN_MIN_YEAR = -12000;

const fullModelConfig: FullModelConfig = { curves: bookieCurves, mods: regionModifiersConfig, shocks: shocksConfig, sins: sinsConfig };

export type MortalOddsDrawPhase = "idle" | "drawing" | "when" | "where" | "predicting" | "confirming" | "settling" | "revealed";

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
  epitaph: string;
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
  samplesSeed: number | null;
  reveal: RevealResult | null;
  error: string | null;
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
      samplesSeed: number;
    }
  | { type: "restore"; stored: StoredRound; context: PlaceContext; samples: BookieLife[]; prices: MarketPrices; defaultDeathGuess: number }
  | { type: "tick"; year: number }
  | { type: "finish" }
  | { type: "redraw-place"; draw: Draw; context: PlaceContext }
  | { type: "advance" }
  | { type: "retreat" }
  | { type: "await-settlement" }
  | { type: "reveal"; reveal: RevealResult }
  | { type: "fail"; error: string };

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
        samplesSeed: action.samplesSeed,
        displayYear: null,
        reveal: null,
        error: null,
      };
    case "restore":
      return {
        ...state,
        phase: action.stored.phase,
        era: action.stored.era,
        draw: action.stored.draw,
        context: action.context,
        samples: action.samples,
        prices: action.prices,
        defaultDeathGuess: action.defaultDeathGuess,
        samplesSeed: action.stored.samplesSeed,
        displayYear: null,
        reveal: action.stored.reveal,
        error: null,
      };
    case "tick":
      return { ...state, displayYear: action.year };
    case "finish":
      return { ...state, phase: "when", displayYear: null };
    case "redraw-place":
      return { ...state, draw: action.draw, context: action.context };
    case "advance":
      return { ...state, phase: stepSequence(state.phase, 1) };
    case "retreat":
      return { ...state, phase: stepSequence(state.phase, -1) };
    case "await-settlement":
      return { ...state, phase: "settling", error: null };
    case "reveal":
      return { ...state, phase: "revealed", reveal: action.reveal };
    case "fail":
      return { ...state, phase: "idle", error: action.error };
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
  samplesSeed: null,
  reveal: null,
  error: null,
};

type Session = { key: string; id?: string; wagerWei: bigint };

/**
 * Drives the idle -> drawing -> when -> where -> predicting -> confirming -> settling -> revealed
 * round. Opening a fresh round escrows the whole chip stake as one casino-host session; the
 * player's sex/age/sins picks become a single on-chain prediction submitted at "confirming", and
 * the soul the deployed SoulOddsEngine title returns is the actual settlement truth. Everything
 * else about the soul (year, region, place, job, story) stays a local flavor draw the chain never
 * sees — the on-chain soul only decides who won, and how much.
 */
export function useMortalOddsDraw(options: { reducedMotion: boolean }): {
  phase: MortalOddsDrawPhase;
  era: EraFilter;
  draw: Draw | null;
  context: PlaceContext | null;
  displayYear: number | null;
  currentYear: number;
  prices: MarketPrices | null;
  priceDeathYear: (guessYear: number) => Price;
  priceSins: (lifespanBucket: number) => Record<string, Price>;
  defaultDeathGuess: number | null;
  reveal: RevealResult | null;
  error: string | null;
  isOpeningSession: boolean;
  sessionKey: string | null;
  wagerWei: string | null;
  samplesSeed: number | null;
  restore: (stored: StoredRound) => Promise<void>;
  setEra: (era: EraFilter) => void;
  drawHuman: (chipSize: number) => void;
  redrawLocation: () => void;
  advance: () => void;
  retreat: () => void;
  placeBets: (bets: Record<string, Bet>) => void;
} {
  const [state, dispatch] = useReducer(reducer, initialState);
  const spin = useRef<ReturnType<typeof animate> | null>(null);
  const { hostApi, snapshot } = useCasinoHost();
  const [session, setSession] = useState<Session | null>(null);
  const pendingBets = useRef<Record<string, Bet> | null>(null);
  const submittedFor = useRef<string | null>(null);
  const recentEpitaphs = useRef<string[]>([]);
  const recentTimeStories = useRef<string[]>([]);
  const [isOpeningSession, setIsOpeningSession] = useState(false);
  const openingSession = useRef(false);
  const decimals = snapshot?.token.decimals ?? 18;

  useEffect(() => () => spin.current?.stop(), []);

  const startDrawSequence = async (wagerWei: bigint) => {
    const rng = createRng();
    const { year, region } = drawBirth({ era: state.era, rng, erasConfig, currentYear: CURRENT_YEAR });
    // Prefer the backend's real data for this year (Cliopatria place, and the on-chain SoulEra
    // name for its era); fall back to the local synthetic model if a request fails, so a network
    // hiccup never blocks the round.
    const [place, era] = await Promise.all([
      fetchPlace(year).catch(() => pickPlace({ region, rng, placesConfig })),
      fetchEra(year).catch(() => eraFor({ year, erasConfig })),
    ]);
    const draw: Draw = { year, region, place };
    const timeStory = pickTimeStory({ year, rng, recent: recentTimeStories.current });
    recentTimeStories.current = [timeStory.id, ...recentTimeStories.current].slice(0, RECENT_TIME_STORIES_KEPT);
    const samplesSeed = randomSeed();
    const { context, samples, prices, defaultDeathGuess } = deriveRoundData({ draw, era, wagerWei, samplesSeed, story: timeStory.text, currentYear: CURRENT_YEAR });

    dispatch({ type: "start-draw", draw, context, samples, prices, defaultDeathGuess, samplesSeed });

    if (options.reducedMotion) {
      dispatch({ type: "finish" });
      return;
    }

    // One timeline drives the reel (year events), the tick sounds and the lock; the clock runs in milliseconds.
    // The chart draws itself in only on a round's first draw (it mounts then); a redraw finds it already on screen.
    // "where" never reaches here — redrawing the land alone is `redrawLocation`, which keeps the year fixed.
    const isRedraw = state.phase === "when";
    const timeline = buildSpinTimeline({ targetYear: year, minYear: SPIN_MIN_YEAR, maxYear: CURRENT_YEAR, rng, introMs: isRedraw ? 0 : CHART_INTRO_MS });
    const playSpinEvent = (event: SpinEvent) => {
      if (event.type === "year") {
        dispatch({ type: "tick", year: event.year });
      } else if (event.type === "tick") {
        playSound({ name: "search-tick", step: event.step });
      } else {
        playSound({ name: "search-lock" });
      }
    };

    let nextEvent = 0;
    spin.current = animate(0, timeline.totalMs, {
      duration: timeline.totalMs / 1000,
      ease: "linear",
      onUpdate: (elapsedMs) => {
        let event = timeline.events[nextEvent];
        while (event && event.atMs <= elapsedMs) {
          playSpinEvent(event);
          nextEvent += 1;
          event = timeline.events[nextEvent];
        }
      },
      onComplete: () => dispatch({ type: "finish" }),
    });
  };

  /**
   * Rerolls only the land, holding the year fixed — "who else was alive in this same year", not
   * a new year. The region rerolls with it (a place belongs to a region, and the local fallback
   * needs one to pick from), but the era, the story and every year-derived number stay untouched.
   */
  const redrawLocation = async () => {
    if (state.phase !== "where" || !state.draw || !state.context) return;
    const { year } = state.draw;
    const rng = createRng();
    const era = await fetchEra(year).catch(() => eraFor({ year, erasConfig }));
    const regionIds = Object.keys(era.shares) as RegionId[];
    const region = pickWeighted({ items: regionIds, weight: (id) => era.shares[id], rng });
    const place = await fetchPlace(year).catch(() => pickPlace({ region, rng, placesConfig }));
    const draw: Draw = { year, region, place };
    const context: PlaceContext = { ...placeContext({ draw, era, worldPopCurve, currentYear: CURRENT_YEAR }), story: state.context.story };
    dispatch({ type: "redraw-place", draw, context });
  };

  const restore = async (stored: StoredRound) => {
    const wagerWei = BigInt(stored.wagerWei);
    const era = await fetchEra(stored.draw.year).catch(() => eraFor({ year: stored.draw.year, erasConfig }));
    const data = deriveRoundData({ draw: stored.draw, era, wagerWei, samplesSeed: stored.samplesSeed, story: stored.story, currentYear: CURRENT_YEAR });
    const submitted = stored.phase === "settling" || stored.phase === "revealed";
    setSession({ key: stored.sessionKey, wagerWei });
    pendingBets.current = stored.phase === "settling" ? stored.bets : null;
    submittedFor.current = submitted ? stored.sessionKey : null;
    dispatch({ type: "restore", stored, ...data });
  };

  const drawHuman = (chipSize: number) => {
    if (state.phase === "drawing" || openingSession.current) return;

    // A redraw only rerolls the local flavor (year/region/place) — the round's session and its
    // already-escrowed wager, opened on the first draw, stay exactly as they are.
    const isRedraw = state.phase === "when" || state.phase === "where";
    if (isRedraw && session) {
      playSound({ name: "spend", amount: REDRAW_COST });
      void startDrawSequence(session.wagerWei);
      return;
    }

    if (!hostApi) return;
    const wagerWei = parseUnits(String(chipSize), decimals);
    openingSession.current = true;
    setIsOpeningSession(true);
    void hostApi
      .openSession({ wager: wagerWei.toString(), gameData: "0x" })
      .then(async ({ sessionKey }) => {
        setSession({ key: sessionKey, wagerWei });
        playSound({ name: "spend", amount: chipSize });
        await startDrawSequence(wagerWei);
      })
      .catch((cause) => {
        dispatch({ type: "fail", error: cause instanceof Error ? cause.message : "Failed to open the round." });
      })
      .finally(() => {
        openingSession.current = false;
        setIsOpeningSession(false);
      });
  };

  // Once the opened session's row appears, capture its sessionId for the later submitAction.
  useEffect(() => {
    if (!session || session.id || !snapshot) return;
    const row = snapshot.sessions.items.find((item) => item.sessionKey === session.key);
    if (!row) return;
    setSession((current) => (current && current.key === session.key ? { ...current, id: row.sessionId } : current));
  }, [session, snapshot]);

  // A round the host cancelled or forfeited while the player was away can never settle; drop it instead of hanging.
  useEffect(() => {
    if (state.phase === "idle" || state.phase === "revealed" || !session || !snapshot) return;
    const row = snapshot.sessions.items.find((item) => item.sessionKey === session.key);
    if (row?.phase === SessionPhase.FORFEITED || row?.phase === SessionPhase.CANCELLED) {
      dispatch({ type: "fail", error: "This round was cancelled." });
    }
  }, [snapshot, state.phase, session]);

  const placeBets = (bets: Record<string, Bet>) => {
    if (state.phase !== "confirming" || !hostApi || !session?.id || submittedFor.current === session.key) return;
    submittedFor.current = session.key;
    pendingBets.current = bets;
    dispatch({ type: "await-settlement" });
    void hostApi.submitAction({ sessionId: session.id, actionData: encodeMortalOddsPrediction(bets) }).catch((cause) => {
      submittedFor.current = null;
      dispatch({ type: "fail", error: cause instanceof Error ? cause.message : "Failed to submit the prediction." });
    });
  };

  // Settle the active round once the host's session list shows it terminal.
  useEffect(() => {
    if (state.phase !== "settling" || !session?.id || !snapshot || !state.draw || !state.samples) return;
    const row = snapshot.sessions.items.find((item) => item.sessionKey === session.key);
    if (!row || !(row.isSettled || isTerminalPhase(row.phase)) || !row.raw.gameState) return;

    const bets = pendingBets.current;
    if (!bets) return;

    try {
      const { draw, samples: bookieSamples } = state;
      const { result } = decodeSettledSoul(row.raw.gameState);
      const sex: Sex = result.gender === 1 ? "girl" : "boy";
      const deathYear = draw.year + result.age;
      const category = categoryFromCrimeMask(result.crimeMask);

      const rng = createRng();
      // The chain settles sex/age/crime-category; region, literacy, city and cause-of-death stay
      // a locally-drawn flavor conditioned on the same year/region/sex, purely for narrative color.
      const flavor = sampleLife({ year: draw.year, region: draw.region, sex, withHistory: true, rng, config: fullModelConfig });
      const sin = category ? buildFlavorSin({ category, year: draw.year, deathYear, rng, sins: sinsConfig }) : null;
      const life: Life = { ...flavor, sex, age: result.age, deathYear, sin };

      // Crime-category odds are conditioned on the bucket the player's own prediction paired
      // them with, not the soul's actual result bucket — see `previewSinsPrices`.
      const ageBet = bets.age;
      const predictedBucket = ageBet?.kind === "choice" ? ageBucketIndex(ageBet.optionId) : 0;
      const prices = previewCategoryPrices(session.wagerWei, predictedBucket);
      const trueProbabilities = toTrueProbabilities(prices);
      const { results, net, skill } = resolveBets({ life, bets, prices, priceDeathYear, trueProbabilities, truthSamples: [] });

      const truthSamples = simulateFull({ year: draw.year, region: draw.region, rng, config: fullModelConfig, sims: SIMS });
      const childDeathShare = truthSamples.filter((s) => s.age < 5).length / truthSamples.length;
      const story = tellStory({ life, place: draw.place, currentYear: CURRENT_YEAR, childDeathShare, jobs: jobsConfig, rng });
      const epitaph = pickEpitaph({ life, currentYear: CURRENT_YEAR, placeName: draw.place.name, rng, recent: recentEpitaphs.current });
      recentEpitaphs.current = [epitaph.id, ...recentEpitaphs.current].slice(0, RECENT_EPITAPHS_KEPT);
      const lifespan = buildLifespanHistogram({ truthSamples, bookieSamples });
      const realMedianAge = medianAge(truthSamples);
      const bookieMedianAge = medianAge(bookieSamples);

      pendingBets.current = null;
      dispatch({ type: "reveal", reveal: { life, results, net, skill, story, epitaph: epitaph.text, lifespan, realMedianAge, bookieMedianAge } });
    } catch {
      // The deployed title's bytecode doesn't match this app's expected game-state shape (e.g. a
      // stale local chain still running an older SoulOddsEngine) — surface it, don't crash.
      pendingBets.current = null;
      dispatch({ type: "fail", error: "Could not read the settled soul — redeploy the title against the current contract." });
    }
  }, [snapshot, state.phase, session, state.draw, state.samples]);

  const priceDeathYear = (guessYear: number): Price => {
    if (!state.samples) return { p: 0, odds: null, tag: "Long shot" };
    const p = deathYearP({ samples: state.samples, guess: guessYear, window: DEATH_WINDOW });
    return priceFromP({ p, config: PRICING_CONFIG });
  };

  // Crime-category odds depend on which age bucket the player paired them with (see
  // `previewSinsPrices`), so the "sins" step re-prices live once the age bet is known instead of
  // reusing the draw-time preview, which only ever reflected the placeholder bucket 0.
  const priceSins = (lifespanBucket: number): Record<string, Price> => previewSinsPrices(session?.wagerWei ?? 0n, lifespanBucket);

  return {
    phase: state.phase,
    era: state.era,
    draw: state.draw,
    context: state.context,
    displayYear: state.displayYear,
    currentYear: CURRENT_YEAR,
    prices: state.prices,
    priceDeathYear,
    priceSins,
    defaultDeathGuess: state.defaultDeathGuess,
    reveal: state.reveal,
    error: state.error,
    isOpeningSession,
    sessionKey: session?.key ?? null,
    wagerWei: session ? session.wagerWei.toString() : null,
    samplesSeed: state.samplesSeed,
    restore,
    setEra: (era) => dispatch({ type: "set-era", era }),
    drawHuman,
    redrawLocation: () => void redrawLocation(),
    advance: () => dispatch({ type: "advance" }),
    retreat: () => dispatch({ type: "retreat" }),
    placeBets,
  };
}

export type MortalOddsRound = ReturnType<typeof useMortalOddsDraw>;
