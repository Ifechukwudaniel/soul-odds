/** Rank points per token staked, earned whether the bet wins or loses — playing itself always counts for something. */
const PARTICIPATION_RATE = 0.5;
/** Extra rank points per token won, on top of participation. Kept at 1 so the bonus equals the bet's own net win. */
const WIN_BONUS_RATE = 1;

/**
 * Rank points for one settled bet: participation credit on the stake alone (win or lose, so playing
 * always counts) plus a win bonus scaled by the payout. Never negative; the stake was already the
 * cost of losing.
 */
export function computeBetSkill(options: { stake: number; won: boolean; odds: number }): number {
  const { stake, won, odds } = options;
  const participation = stake * PARTICIPATION_RATE;
  const winBonus = won ? stake * (odds - 1) * WIN_BONUS_RATE : 0;
  return participation + winBonus;
}

/**
 * Skill is a running total that only moves up (`computeBetSkill` is never negative), floored at 0
 * so a player carrying an old negative balance climbs back to zero on their next round.
 */
export function accumulateSkill(currentTotal: number, delta: number): number {
  return Math.max(0, currentTotal + delta);
}
