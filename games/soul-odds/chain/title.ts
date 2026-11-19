// The Mortal Odds title for chain.wtf's graph engine.
//
// ⬢ Round flow, same as before the move off the Soul Odds engine
//   1. Opening a session draws the era at random (a chance node, one outcome per era).
//   2. The player sees the era, then picks one of 88 predictions (a decision node).
//   3. One draw settles it (a table node, one tier per combination of categories that hit).
//
// ✦ Edge labels carry meaning for the UI: an era chance's label is the era index, a decision's
//   label is the prediction index, and a table tier's label is its `flags` (see soul-math.ts).
import type { GraphGameDefinition } from '@chain-protocol/casino-sdk/graph-engine';
import { ERAS, PREDICTION_COUNT, predictionTable, prizeDenominator } from './soul-math';

export type State =
  | { at: 'era' }
  | { at: 'predict'; era: number }
  | { at: 'draw'; era: number; prediction: number };

const title: GraphGameDefinition<State> = {
  prizeDenominator: prizeDenominator(),
  roots: [{ at: 'era' }],
  key: (state) =>
    state.at === 'era'
      ? 'era'
      : state.at === 'predict'
        ? `predict:${state.era}`
        : `draw:${state.era}:${state.prediction}`,
  expand: (state) => {
    if (state.at === 'era') {
      return {
        kind: 'chance',
        outcomes: ERAS.map((_era, era) => ({
          state: { at: 'predict', era } as State,
          weight: 1n,
          label: era,
        })),
      };
    }
    if (state.at === 'predict') {
      return {
        kind: 'decision',
        actions: Array.from({ length: PREDICTION_COUNT }, (_unused, prediction) => ({
          state: { at: 'draw', era: state.era, prediction } as State,
          label: prediction,
        })),
      };
    }
    return {
      kind: 'table',
      tiers: predictionTable(state.era, state.prediction).map((tier) => ({
        prize: tier.prizeUnits,
        weight: tier.weight,
        label: tier.flags,
      })),
    };
  },
};

export default title;
