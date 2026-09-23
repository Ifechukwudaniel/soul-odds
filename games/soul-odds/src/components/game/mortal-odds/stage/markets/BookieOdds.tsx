/** The odds of the currently picked option, shown under a market's title; a dash until something is picked. */
export const BookieOdds = (props: { odds: number | null | undefined }) => (
  <>
    <p className="mt-1 text-white/40 text-[11px]">Bookie odds</p>
    <p className="font-bold text-2xl text-[#F5B83D] leading-tight">{props.odds === null || props.odds === undefined ? "—" : props.odds.toFixed(2)}</p>
  </>
);
