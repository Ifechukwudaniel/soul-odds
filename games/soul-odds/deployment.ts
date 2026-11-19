// Read by the chain.wtf developer platform. Keep it self-contained: types only.
//
// ⬢ This copy is for a platform project rooted at games/soul-odds. When the project is rooted at
//   the repository, the platform reads ../../deployment.ts instead; keep the two in step.
//
// The title is a graph: era (chance) → prediction (decision) → settlement (table). It is built
// from src/config/mortal-odds/soul-odds-title.json by chain/title.ts.
import type { DeploymentInput } from '@chain-protocol/casino-sdk';

export default {
  kind: 'graph',
  name: 'Mortal Odds',
  title: 'chain/title.ts',
  frontend: { framework: 'nextjs', buildCommand: 'pnpm run build:next' },
} satisfies DeploymentInput;
