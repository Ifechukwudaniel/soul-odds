// Read by the chain.wtf developer platform. Keep it self-contained: types only.
//
// ⬢ The repository root copy, with paths from the root. games/soul-odds/deployment.ts is the same
//   deployment for a platform project rooted there; keep the two in step.
//
// The title is a graph: era (chance) → prediction (decision) → settlement (table). It is built
// from games/soul-odds/src/config/mortal-odds/soul-odds-title.json by chain/title.ts.
import type { DeploymentInput } from '@chain-protocol/casino-sdk';

export default {
  kind: 'graph',
  name: 'Mortal Odds',
  title: 'games/soul-odds/chain/title.ts',
  frontend: {
    directory: 'games/soul-odds',
    framework: 'nextjs',
    buildCommand: 'pnpm run build:next',
  },
} satisfies DeploymentInput;
