# Mortal Odds: build handoff for Claude Code

This is the spec for rebuilding the Mortal Odds MVP inside the Lyph app.

The single-file MVP is at `reference/mortal-odds-mvp.html`. Treat it as the **behaviour reference, not the code to copy**. It proves the game loop, the model and the UX. It is one 1,000-line file with global state, and the rebuild should look nothing like that structurally.

---

## 0. How to work on this

1. **Explore before writing anything.** Read the existing Lyph app and report back on:
   - the framework and router
   - the styling system and design tokens
   - state management and data fetching
   - the component folder layout and test setup
   - how the existing shell pieces are built: header, wallet pill, bet panel, leaderboard card and bottom dock.
2. **Match the repo, not the MVP.** Wherever this doc and the repo's conventions disagree, the repo wins. The only exception is the house rules in section 1. Reuse existing tokens, primitives (Button, Card, Pill and so on) and the existing shell components. Do not introduce a second styling approach.
3. **Propose a plan and wait for approval** before creating files. Use the phases in section 8.
4. **Work one phase at a time.** Each phase ends with passing tests and a short summary of what changed.

---

## 1. House rules (always apply)

- **Section banners.** Every code file is split into labeled sections, in this exact form:
  ```ts
  // =====================================
  // ⬢  Section Name
  // =====================================
  ```
  Typical sections: Constants, Types, Utils, Hooks, Components, Main.
- **Component grouping.** Inside a component, group state, handlers and derived values under short inline comments.
- **One header comment.** A complex file or block gets one explanatory comment at its start, not many scattered inline comments.
- **Small functions.** Keep functions short, keep the code DRY, and keep concerns separated. A long file is fine if every block can be scanned on its own.
- **Folder rules.**
  - `hooks/` holds all hooks, and never goes in `lib/`.
  - `lib/` holds pure, non-React logic only.
- **Types.** There is **one central types file**. New types go into it and are delivered as one merge-ready block. Never create per-feature `types.ts` files.
- **Data as JSON config.** Use JSON wherever it keeps the design swappable, so one wrong table can be replaced without touching code. Validate config at load time.

---

## 2. What the game is

A random human is drawn from all of history, weighted by how many people were ever born in each era and region. The player bets on that person's fate, then watches the life play out.

**Why it works.** The bookie prices every bet from the **birth year alone**. The real outcome also uses:
- region
- sex
- historical catastrophes such as the Black Death and the World Wars.

A player who knows history can spot mispriced bets. That gap is the whole game. Do not "fix" the bookie to use the full model.

**Round loop**

1. **Draw.** Pick a year, a region and a specific place. Show the place context: local population then, years ago, the historical period, and world population then as a share of all humans ever.
2. **Bet.** Show one market per screen in a pager (Back / Next). The markets are:
   - girl or boy
   - age-at-death bracket
   - learns to read
   - lives in a city
   - year of death (within ±5 years).

   Payouts are shown in plain language: a chance tag (Likely, Toss-up, Unlikely or Long shot) plus "Win X" for the selected chip size. **Never show decimal odds.** A bet slip lists each pick, with a stepper to change its stake.
3. **Reveal reel.** This is the anticipation sequence:
   - The sex flips between Boy and Girl, then settles.
   - The age counts up along a 0–100 lifeline while the year ticks forward.
   - Each bet goes "Live", then settles **the moment its outcome becomes certain**. An age bracket is lost as soon as the person outlives it; a year-of-death bet shows "In window", then settles.
   - A ✕ drops at death, then reading and city resolve, then the net result appears.
   - The wallet and stats stay frozen until the reel ends, so the header can't spoil the result. The reel can be skipped.
4. **Result pages**, in this order:
   - **Their life:** a short story, key facts, and a lifespan chart comparing the real spread with what the bookie assumed.
   - **Your bets:** a table of each bet with bookie chance, real chance, net result and skill.
   - Then "Next human".

**No modes.** Survival and Blitz were removed.

**Leaderboard = skill points.** Each bet's skill is `stake × (realChance × payout − 1)`, its expected value at the real odds, so luck doesn't count. Do not rank by accuracy, number of rounds or winnings.

**Currency.** Play chips only. Keep the currency in a single config value. **Do not connect USDC or any wallet.** Real-money wagering needs legal review, and needs the server-side resolution described in section 6.

**Desktop layout.** The page fits the viewport with no scrolling. The stage is the left column and the bet slip plus leaderboard are the right column. The existing bottom dock stays. On mobile the layout stacks and scrolls.

---

## 3. Target architecture

Folder names below are suggestions; fit them into the repo's real structure.

```
packages/mortal-odds-core/     framework-agnostic; importable by the frontend now and the backend later
  (holds config/ and lib/ below; no React, no DOM, no browser APIs)

config/mortal-odds/            JSON, validated at load
  eras.json                    births per era, regional shares, sampling skew
  places.json                  sub-regions per region (name, continent, weight)
  curves.json                  child mortality, adult lifespan, literacy, urbanisation, world population
  region-modifiers.json        child mortality, lifespan, literacy and city multipliers by period
  shocks.json                  catastrophes: years, regions, death rate, sex and age filters, labels
  markets.json                 market definitions (id, kind, options, copy)
  jobs.json                    occupation pools
  game.json                    house edge, number of simulations, chip sizes, fees, currency, reel timing

lib/mortal-odds/               pure TypeScript, no React
  rng.ts                       seedable RNG (mulberry32 or similar); nothing calls Math.random directly
  config.ts                    loads and validates the JSON (zod or the repo's validator)
  curves.ts                    interpolation helpers
  draw.ts                      drawBirth, pickPlace, placeContext
  model.ts                     sampleLife (the full model) and sampleLifeBookie (year only)
  shocks.ts                    applyShocks
  simulate.ts                  batch simulation (runs in a Web Worker)
  pricing.ts                   probabilities, odds, chance tags, payout
  markets/
    registry.ts                maps a market id to its resolver
    choice.ts                  generic resolver for options (sex, age, reading, city)
    range.ts                   the year-of-death resolver
  settle.ts                    resolveBets, skill calculation
  reel.ts                      buildReelTimeline(life, bets) → ordered event list (pure)
  story.ts                     tellStory and fact lines

hooks/
  useRound.ts                  round state machine (see section 4)
  useBetSlip.ts                picks, stakes, chip size, totals
  useReel.ts                   plays a timeline with cancel and skip; respects reduced motion
  useBankroll.ts               balance and stats, read and written only through PlayerService
  useLeaderboard.ts            skill board, read only through LeaderboardService

services/mortal-odds/          the only place that knows where data comes from
  engine/
    RoundEngine.ts             the interface (section 7)
    LocalRoundEngine.ts        v1: runs the core package in a Web Worker, returns the same DTOs a server would
    RemoteRoundEngine.ts       later: calls the backend; same interface
    simulation.worker.ts       used only by LocalRoundEngine
  PlayerService.ts             interface + LocalPlayerService (browser storage) now, RemotePlayerService later
  LeaderboardService.ts        interface + MockLeaderboardService now, RemoteLeaderboardService later
  schemas.ts                   zod schemas for every DTO; used to validate responses in both engines
  index.ts                     picks implementations from one env flag

components/mortal-odds/
  MortalOddsScreen             composes everything inside the existing Lyph shell
  stage/  DrawHero, PlaceContext, EraFilter, HistoryTimeline, StatusChips
  markets/ MarketPager, ChoiceMarket, RangeMarket, PayoutLabel, ChanceTag
  slip/   BetSlip, SlipRow, ChipSelector, SlipTotals
  reveal/ RevealPager, RevealReel, LifeLine, VerdictBadge, LifePage, LifespanChart, BetsBreakdown
  board/  SkillLeaderboard
```

**Extension points (this is the point of the rebuild)**

- **New market:** add an entry to `markets.json` and a resolver in the registry. The pager, slip, reel and breakdown table pick it up automatically.
  - The reel needs each market's `settleRule`: settle immediately, settle when an age threshold is crossed, or settle at death.
  - The market component is chosen by `kind`, which is `choice` or `range`.
- **New catastrophe, place or curve:** edit JSON only.
- **New reveal page** (for example a cause-of-death breakdown): add a page component to the reveal page list, with no changes to the pager.
- **Swapping the engine or data source:** components talk only to hooks, and hooks talk only to the service interfaces in section 3b. Changing one environment flag moves the game from local to backend.

---

## 3b. Backend-ready boundary (v1 is frontend-only, but must not depend on that)

The first version runs everything in the browser. It must be built so the backend can take over the data, the model and the outcomes without touching any component or hook. These rules make that possible.

**1. The server owns the round.**
- `draw` returns a `roundId`, the public draw, the prices, and a `commitment` (a hash of the hidden seed).
- `resolve` takes only the `roundId` and the bets. The client never sends the draw back and is never trusted about it.
- The resolved result includes the revealed seed, so the commitment can be checked.
- `LocalRoundEngine` follows the same shape, keeping rounds in memory by id.

**2. The UI never runs the model.**
- Components and hooks import only DTO types and the `services/` layer. **Only the engine imports the core package.**
- Everything the UI shows comes from DTOs:
  - the place context text
  - chance tags and payouts
  - the lifespan chart data
  - real vs bookie chances
  - the story.

**3. Year-of-death pricing works without the simulation samples.**
- `draw` returns a `deathYearPricing` table: the bookie probability for each possible guess year, plus the house edge. The slider prices locally from that table.
- `resolve` re-prices every bet on the server. The client's price is only a display value.
- If a price differs by more than a tolerance, the bet is rejected with a `PRICE_CHANGED` error, and the UI handles that error.

**4. Results carry everything the reveal needs.**
- `RoundResult` includes:
  - the life
  - each bet's result (with bookie and real chances, net and skill)
  - the story
  - both lifespan histograms (real and bookie)
  - the new player stats after the round.
- The reel timeline is built from this data with a pure function, so it works the same with either engine.

**5. Money and scores never live in components.**
- Balance, stats and skill are read and written only through `PlayerService`.
- The leaderboard comes only from `LeaderboardService`.
- The v1 implementations use browser storage and mock data. The remote implementations call the API.
- The UI shows the stats returned by the engine or service. It never adds up the balance itself.

**6. One contract, validated on both sides.**
- Every DTO has a zod schema (or the repo's validator) in `schemas.ts`. Both engines validate their output against it.
- DTOs carry a `contractVersion`.
- A contract test runs `LocalRoundEngine` and checks that every response passes the schemas. The backend team runs the same test against the real API.

**7. Config can come from the backend.**
- The core package reads config through a `ConfigSource`:
  - `BundledConfigSource` (the JSON files) now
  - `RemoteConfigSource` later.
- Each round's DTO records which `configVersion` produced it.

**8. Errors are typed.**
- The engine and services return typed errors:
  - `INSUFFICIENT_BALANCE`
  - `PRICE_CHANGED`
  - `ROUND_EXPIRED`
  - `MARKET_CLOSED`
  - `NETWORK`.
- The UI handles each one. It never assumes a call succeeds.

**Suggested API shape for the backend team.** This is only a suggestion; `RemoteRoundEngine` maps onto it.
```
POST /mortal-odds/rounds                    { eraFilter, seed? }                -> DrawResponse
POST /mortal-odds/rounds/:roundId/skip                                          -> PlayerStats
POST /mortal-odds/rounds/:roundId/resolve   { bets }                            -> RoundResult
GET  /mortal-odds/player                                                        -> PlayerStats
POST /mortal-odds/player/reset                                                  -> PlayerStats
GET  /mortal-odds/leaderboard?period=week                                       -> LeaderboardEntry[]
GET  /mortal-odds/config                                                        -> { configVersion, ...config }
```

---

## 4. Round state machine

```
idle ──draw──▶ drawing ──simulated──▶ betting ──place──▶ revealing ──reel done / skip──▶ revealed ──next──▶ drawing
                                        │                                                        │
                                        └──skip human (fee)──▶ drawing                            └──broke──▶ idle (reset)
```

- Implement this as a typed reducer or the repo's state tool. **No hidden boolean flags.**
- The round outcome is committed to state when bets are placed.
- The *displayed* balance and stats come from a snapshot until the reel finishes.
- The era filter is locked while in `drawing` and `betting`.

---

## 5. Model rules to preserve exactly

Port these from the reference file. Numbers move to JSON; behaviour must not change.

1. **Birth draw.** Pick the era by births-ever-born weight. Within the era, the year is `from + span × u^(1/skew)`. The region comes from the era's shares; the place comes from the region's weights.
2. **Lifespan.** Draw death before age 5 with the child-mortality rate for the year, adjusted by region and sex. Otherwise draw the adult age from a truncated normal distribution (ages 5–105) with a region and sex shift.
3. **Catastrophes.** Apply them only in the full model. For each catastrophe that overlaps the person's life, filtered by region, age window and sex multiplier, the chance of dying in it is `rate × exposure fraction`. The first catastrophe that strikes sets the age at death.
4. **Reading.** Only possible if the person reached age 10. The probability is the curve value × region multiplier × sex multiplier. **City** is the curve value × region multiplier.
5. **Bookie.** Year-only simulation. Sex is fixed at 50/50.
   - payout = `(1 − houseEdge) / p`, clamped to between 1.05× and 60×
   - `p < 0.003` → the market is closed
6. **Year of death.** p = the share of simulations dying within ±5 years of the guess.
7. **Lives running past the current year** resolve on their projected end, and are shown as "still living".
8. **Chart.** The lifespan chart caps infant-death bars at twice the tallest adult bin, with a percentage label on capped bars.

**Data honesty.** Every figure is a rough estimate and must stay labelled as such in the UI.
- Do not add model-invented statistics, such as cause-of-death percentages, without a cited source table.
- Place population shares are static weights and need an era-aware table later. Leave a TODO in `places.json`'s schema description.

---

## 6. Things the MVP got wrong on purpose (fix in this build)

- **Randomness.** Replace `Math.random` everywhere with the seeded RNG. This enables deterministic tests and a future daily run where everyone gets the same humans.
- **Main-thread work.** The 10,000 simulations per draw move to a Web Worker, owned by `LocalRoundEngine` only.
- **Client-side outcomes.** Fine for play chips in v1, but only behind the boundary in section 3b. The server will own the seed and the resolution later, using commit-reveal or VRF.
- **Global DOM rendering.** Replace it with components. `innerHTML` is not allowed.
- **Accessibility:**
  - focus moves to the new content on each pager step
  - `aria-live` announces verdicts
  - the reel respects `prefers-reduced-motion` (instant)
  - every control works from the keyboard.

---

## 7. Types (merge into the central types file)

```ts
// =====================================
// ⬢  Mortal Odds
// =====================================
export type RegionId = 'ssa' | 'mena' | 'eur' | 'sas' | 'eas' | 'sea' | 'ame';
export type EraFilter = 'all' | 'ce' | 'modern';
export type Sex = 'girl' | 'boy';
export type ChanceTag = 'Likely' | 'Toss-up' | 'Unlikely' | 'Long shot';

export interface Place { name: string; continent: string; share: number }
export interface Draw { year: number; region: RegionId; place: Place }

export interface Shock {
  id: string; label: string; phrase: string;
  from: number; to: number;
  rate: Partial<Record<RegionId | 'all', number>>;
  sexMultiplier?: Partial<Record<Sex, number>>;
  ages?: [number, number];
}

export interface Life {
  year: number; region: RegionId; place: Place; sex: Sex;
  age: number; deathYear: number; shock: Shock | null;
  literate: boolean; city: boolean;
}

export type MarketKind = 'choice' | 'range';
export type SettleRule =
  | { type: 'immediate' }                          // e.g. sex
  | { type: 'age-threshold' }                      // age bracket, year window
  | { type: 'after-death'; delayMs: number };      // reading, city

export interface MarketOption { id: string; label: string; ageRange?: [number, number] }
export interface MarketDef {
  id: string; kind: MarketKind; title: string; note?: string;
  options: MarketOption[];                         // empty for range markets
  settle: SettleRule;
  fixedBookieP?: Record<string, number>;           // e.g. sex at 50/50
}

export interface Price { p: number; odds: number | null; tag: ChanceTag }
export type MarketPrices = Record<string, Record<string, Price>>;

export type Bet =
  | { marketId: string; kind: 'choice'; optionId: string; stake: number }
  | { marketId: string; kind: 'range'; guessYear: number; stake: number };

export interface BetResult {
  marketId: string; won: boolean; stake: number; net: number; skill: number;
  pickLabel: string; outcomeLabel: string; bookieP: number; realP: number;
}

export interface PlaceContext { where: string; local: string; when: string }
export interface LifespanHistogram { binSize: number; real: number[]; bookie: number[] }   // shares per bin, 0–105

export interface DeathYearPricing {
  fromYear: number;               // birth year
  windowYears: number;            // ±N
  houseEdge: number;
  bookieP: number[];              // index = guessYear - fromYear
}

export interface DrawResponse {
  contractVersion: string; configVersion: string;
  roundId: string; commitment: string; expiresAt: string;
  draw: Draw; placeContext: PlaceContext;
  prices: MarketPrices; deathYearPricing: DeathYearPricing;
  defaultDeathGuess: number;
}

export interface RoundResult {
  contractVersion: string; configVersion: string;
  roundId: string; revealedSeed: string;
  life: Life; results: BetResult[]; net: number; skill: number;
  story: string; lifespan: LifespanHistogram;
  stats: PlayerStats;             // authoritative stats after this round
}

export type MortalOddsErrorCode = 'INSUFFICIENT_BALANCE' | 'PRICE_CHANGED' | 'ROUND_EXPIRED' | 'MARKET_CLOSED' | 'NETWORK';
export interface MortalOddsError { code: MortalOddsErrorCode; message: string; details?: unknown }
export type Result<T> = { ok: true; value: T } | { ok: false; error: MortalOddsError };

export interface LeaderboardEntry { rank: number; name: string; points: number; isYou: boolean }

export type ReelEvent =
  | { at: number; type: 'sex-reveal'; sex: Sex }
  | { at: number; type: 'age'; age: number }
  | { at: number; type: 'live'; marketId: string; label?: string }
  | { at: number; type: 'settle'; marketId: string }
  | { at: number; type: 'death'; age: number }
  | { at: number; type: 'done' };

export type RoundPhase = 'idle' | 'drawing' | 'betting' | 'revealing' | 'revealed';

export interface PlayerStats { bankroll: number; rounds: number; bestRound: number; streak: number; skill: number }

export interface RoundEngine {
  draw(filter: EraFilter, seed?: string): Promise<Result<DrawResponse>>;
  skip(roundId: string): Promise<Result<PlayerStats>>;                 // charges the skip fee
  resolve(roundId: string, bets: Bet[]): Promise<Result<RoundResult>>;
}

export interface PlayerService {
  getStats(): Promise<Result<PlayerStats>>;
  reset(): Promise<Result<PlayerStats>>;
}

export interface LeaderboardService {
  getBoard(period: 'week' | 'all'): Promise<Result<LeaderboardEntry[]>>;
}

export interface ConfigSource { load(): Promise<Result<{ configVersion: string; config: unknown }>> }
```

---

## 8. Phases

Each phase ends with the listed acceptance criteria met and tests green.

**Phase 0: Recon and plan.**
- Report the repo conventions from section 0.
- Map every MVP piece to a target file.
- List the existing shell components that will be reused.
- *Accept when:* the plan is approved.

**Phase 1: Config and pure model.**
- Build the JSON config with validation, plus `lib/mortal-odds/*`.
- Unit tests:
  - the same seed gives the same draws and lives
  - bookie probabilities sum to 1
  - catastrophes only fire inside their window and region
  - sex bookie odds equal the house-edge formula
  - `buildReelTimeline` settles an age bracket at the crossing age.
- *Accept when:* there is no React, the code is deterministic, and coverage on `lib/` is ≥ 90%.

**Phase 2: Engine, worker and hooks.**
- Build the DTO schemas, `LocalRoundEngine` (with its worker), `LocalPlayerService`, `MockLeaderboardService`, then the hooks `useRound`, `useBetSlip`, `useBankroll` and `useReel`.
- *Accept when:*
  - reducer tests cover every transition
  - `useReel` is tested for skip and cancel on unmount
  - the contract test passes (every engine response validates against the schemas)
  - a lint rule or test fails if anything under `components/` or `hooks/` imports the core package directly.

**Phase 3: Betting UI.**
- Build the stage, the market pager, payout labels and the slip, using the existing design tokens and primitives.
- *Accept when:* a desktop at 1280×720 shows no page scroll, the flow works keyboard-only, and no decimal odds appear anywhere.

**Phase 4: Reveal.**
- Build the reel, lifeline, verdicts, life page, lifespan chart and bets breakdown.
- *Accept when:* stats stay frozen until the reel ends, skip works, reduced motion is instant, and the chart matches the reference.

**Phase 5: Leaderboard and persistence.**
- Build the skill leaderboard (mock data behind a data hook) and persistence through the repo's storage or API layer.
- *Accept when:* reset clears stats, and the leaderboard ranks by skill.

**Later (not in this build):**
- a daily seeded run with a share grid
- a history atlas / collection
- `RemoteRoundEngine`, `RemotePlayerService`, `RemoteLeaderboardService` and `RemoteConfigSource` (the UI stays unchanged)
- a sourced cause-of-death reveal page
- era-aware place populations.

---

## 9. Do not

- Show decimal odds.
- Let the bookie see region, sex or catastrophes.
- Connect real money or a wallet.
- Add unsourced statistics.
- Put hooks in `lib/`, or create feature-level `types.ts` files.
- Import the core package, or touch browser storage, from a component or hook.
- Send the draw back to `resolve`, or trust a price quoted by the client.
- Copy the MVP's single-file structure or its `innerHTML` rendering.