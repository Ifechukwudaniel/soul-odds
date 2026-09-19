# Where the casino SDK lives in this repo

The SDK, the local dev harness, and the local blockchain tooling are all part of this app now —
there's no separate `@chain/casino-sdk` package or npm workspace anymore.

## Contents

| Path                                | What it is                                                                        |
| ------------------------------------ | --------------------------------------------------------------------------------- |
| `src/libs/casino-sdk/types.ts`       | `HostSnapshotV1`, `HostApiV1`, `GuestApiV1`, manifest types.                      |
| `src/libs/casino-sdk/manifest.ts`    | `validateCasinoGameManifest`, `canonicalCasinoGameId`, `resolveManifestMetadata`. |
| `src/libs/casino-sdk/guest.ts` / `host.ts` | Penpal bridge connectors (iframe + parent).                                 |
| `src/libs/casino-sdk/index.ts`       | Re-exports types + manifest helpers.                                              |
| `src/components/casino-simulator/`  | The local dev harness UI, served at `/casino-simulator`.                          |
| `src/components/casino-coinflip/`   | The Coinflip example game, served at `/casino/coinflip`.                          |
| `blockchain/contracts/`             | Local Hardhat contracts, including `ICasinoGameV2.sol`.                           |
| `blockchain/local-node/`            | Deploys the harness's local chain + test contracts (`bun run blockchain:node`).   |
| `blockchain/verify-network/`        | Local VRF simulator (`bun run blockchain:verify-network`).                        |
| `public/casino/coinflip/game.manifest.json` | Example `game.manifest.json` shape the host validates.                    |
| `docs/casino/CHAIN_WTF_CASINO_GAMES.md` | Main integration guide (host/guest, bridge, ABI patterns).                    |
| `docs/casino/CONTRACT_CONSTRAINTS.md`   | On-chain facet and `ICasinoGameV2` constraints.                               |
| `docs/casino/SLOTS_RISK_AND_RESERVES.md`| Slots-specific `quoteRiskParams`, tiered reserve, examples.                   |
| `docs/casino/VISUAL_AND_UX.md`          | Iframe, manifest, snapshot UX expectations.                                   |

## No shared "game repo" structure

There is **no** required folder layout, toolchain, or release process for third-party games. Each
title is expected to live in **its own repository** (or vendor setup), with its **own** build, test,
and **release pipeline**. The platform only needs a **deployed URL** the host can load in an
**iframe** plus the on-chain game contract and catalog wiring on our side.

Games differ (slots vs. table games, stack choices, asset pipelines), so treat these docs as
**reference** for integrating with the Chain.wtf host, not a template to mirror wholesale.
