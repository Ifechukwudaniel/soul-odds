import { describe, expect, it } from 'vitest';
import { slipTotals } from '@/lib/mortal-odds/bets';
import type { Bet, MarketPrices, Price } from '@/types';

const price = (odds: number | null): Price => ({ p: 0.5, odds, tag: 'Toss-up' });
const priceDeathYear = () => price(4);
const prices: MarketPrices = { sex: { girl: price(2) }, age: { young: price(null) } };

const bets: Record<string, Bet> = {
  sex: { marketId: 'sex', kind: 'choice', optionId: 'girl', stake: 5 },
  age: { marketId: 'age', kind: 'choice', optionId: 'young', stake: 5 },
  dy: { marketId: 'dy', kind: 'range', guessYear: 1500, stake: 2 },
};

describe('slipTotals', () => {
  it('sums potential wins across priced picks', () => {
    const totals = slipTotals({ bets, prices, priceDeathYear, charges: [], requiredBets: 3 });
    expect(totals.potentialWins).toEqual([10, null, 8]);
    expect(totals.totalPotentialWin).toBe(18);
  });

  it('returns no potential win while prices are missing', () => {
    const totals = slipTotals({ bets, prices: null, priceDeathYear, charges: [], requiredBets: 3 });
    expect(totals.totalPotentialWin).toBe(0);
  });

  it('adds every charge to the stake at risk', () => {
    const charges = [
      { id: 'stake', label: 'Stake', amount: 10, kind: 'stake' as const },
      { id: 'redraw-1', label: 'Redraw', amount: 5, kind: 'fee' as const },
    ];
    const totals = slipTotals({ bets: {}, prices, priceDeathYear, charges, requiredBets: 3 });
    expect(totals.atRisk).toBe(15);
  });

  it('counts the picks still to make', () => {
    const totals = slipTotals({ bets, prices, priceDeathYear, charges: [], requiredBets: 5 });
    expect(totals.unpicked).toBe(2);
  });

  it('never reports a negative unpicked count', () => {
    const totals = slipTotals({ bets, prices, priceDeathYear, charges: [], requiredBets: 1 });
    expect(totals.unpicked).toBe(0);
  });
});
