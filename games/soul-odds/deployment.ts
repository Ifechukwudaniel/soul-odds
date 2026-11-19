// Read by the chain.wtf developer platform. Keep it self-contained: types only.
//
// ⬢ This copy is for a platform project rooted at games/soul-odds. When the project is rooted at
//   the repository, the platform reads ../../deployment.ts instead; keep the two in step.
//
// The title is a graph: era (chance) → prediction (decision) → settlement (table). It is built
// from src/config/mortal-odds/soul-odds-title.json by chain/title.ts.
import type { DeploymentInput } from '@chain-protocol/casino-sdk';

// ✦ The platform picks npm when the build directory has no lockfile; this repo is a pnpm
//   workspace (pnpm-lock.yaml at the root, `file:` links between packages), where npm install
//   crashes. These commands run pnpm from wherever the build starts.

export default {
  kind: 'graph',
  name: 'Mortal Odds',
  title: 'chain/title.ts',
  frontend: {
    framework: 'nextjs',
    installCommand: 'npx --yes pnpm@10.33.0 install --frozen-lockfile --filter soulodds...',
    buildCommand: 'npx --yes pnpm@10.33.0 run build:next',
  },
} satisfies DeploymentInput;
