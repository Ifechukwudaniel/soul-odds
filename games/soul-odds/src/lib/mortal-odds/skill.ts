/**
 * Skill is a bet's expected value at the *real* odds, not the bookie's: stake * (realP * odds - 1).
 * A smart bet that lost still scores (realP * odds > 1 even though this draw didn't land), and a
 * lucky longshot doesn't. Stake is already a linear factor, so a bigger bet earns or costs more.
 * The result is signed on purpose: a bad bet subtracts, it isn't just floored at zero.
 */
export function computeBetSkill(options: { stake: number; realP: number; odds: number }): number {
  const { stake, realP, odds } = options;
  return stake * (realP * odds - 1);
}

/**
 * Skill is a running total, not a one-way counter: a round's delta is added even when it's
 * negative, so the leaderboard number reflects genuine net skill (e.g. a player who reads bets
 * well nets up toward the tens of thousands over time; one who doesn't can sit low or negative).
 */
export function accumulateSkill(currentTotal: number, delta: number): number {
  return currentTotal + delta;
}
