# Soul Odds engine

Casino SDK add-on: one shared, immutable sampler for Soul Odds titles. A title configures a
historical era, a birth-year range, gender weights, exactly four lifespan buckets and four
anonymous crime slots, deployed as a clone of the engine; no Solidity is written per title.

A round is a prediction, not a spin: the player picks a gender, a lifespan bucket, and up to two
of the four crime slots, then the engine generates a soul from the title's weights and pays
`wager * titleRtp / probability(prediction)` if it matches.

- `bun run start` runs the local stack (simulator node + the `example/` title + its reference
  guest UI on Vite).
- `bun run test` runs the contract tests, including a randomness sweep that cross-checks
  `src/soul.ts`'s TS mirror against the live contract bit-for-bit.
- `bun run cli compile example/title.json` prints every valid prediction's odds and payout
  multiplier for a title definition.

See `example/title.json` for the JSON schema a title definition follows, and
`example/frontend/` for a minimal reference UI built on `@chain/casino-sdk/guest`.
