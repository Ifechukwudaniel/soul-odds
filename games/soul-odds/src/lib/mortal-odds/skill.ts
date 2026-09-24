/** Rank points per token staked, earned whether the bet wins or loses — playing itself always counts for something. */
const PARTICIPATION_RATE = 0.5;
/** Extra rank points per token won, on top of participation. Kept at 1 so the bonus equals the bet's own net win. */
const WIN_BONUS_RATE = 1;

/**
 * Rank points for one settled bet: participation credit on the stake alone (win or lose, so a player who
 * keeps staking keeps climbing and never loses ground for losing), plus a win bonus on top scaled by the
 * payout, so a win always counts for more than just playing. Never negative — losing costs nothing here,
 * the stake itself was already the cost.
 */
export function computeBetSkill(options: { stake: number; won: boolean; odds: number }): number {
  const { stake, won, odds } = options;
  const participation = stake * PARTICIPATION_RATE;
  const winBonus = won ? stake * (odds - 1) * WIN_BONUS_RATE : 0;
  return participation + winBonus;
}

/**
 * Skill/rank is a running total that only ever moves up: a round's points are added (computeBetSkill never
 * returns a negative number, so there's nothing to subtract), and the result is floored at 0 so a player
 * carrying an old negative balance climbs back to zero on their very next round instead of staying stuck.
 */
export function accumulateSkill(currentTotal: number, delta: number): number {
  return Math.max(0, currentTotal + delta);
}
