/** The odds of the currently picked option, shown under a market's title; a dash until something is picked. */
export const BookieOdds = (props: { odds: number | null | undefined }) => (
  <>
    <p className="mt-1 text-[11px] text-white/40">Bookie odds</p>
    <p className="text-2xl leading-tight font-bold text-[#F5B83D]">
      {props.odds === null || props.odds === undefined ? '—' : props.odds.toFixed(2)}
    </p>
  </>
);
