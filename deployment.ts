// Read by the chain.wtf developer platform. Keep it self-contained: types only.
//
// ⬢ The repository root copy, with paths from the root. games/soul-odds/deployment.ts is the same
//   deployment for a platform project rooted there; keep the two in step.
//
// The title is a graph: era (chance) → prediction (decision) → settlement (table). It is built
// from games/soul-odds/src/config/mortal-odds/soul-odds-title.json by chain/title.ts.
import type { DeploymentInput } from '@chain-protocol/casino-sdk';

// ✦ The platform picks npm when the build directory has no lockfile; this repo is a pnpm
//   workspace (pnpm-lock.yaml at the root, `file:` links between packages), where npm install
//   crashes. These commands run pnpm from wherever the build starts.

export default {
  kind: 'graph',
  name: 'Mortal Odds',
  title: 'games/soul-odds/chain/title.ts',
  frontend: {
    directory: 'games/soul-odds',
    framework: 'nextjs',
    installCommand: 'npx --yes pnpm@10.33.0 install --frozen-lockfile --filter soulodds...',
    buildCommand: 'npx --yes pnpm@10.33.0 run build:next',
  },
} satisfies DeploymentInput;
