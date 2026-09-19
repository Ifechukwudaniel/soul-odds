import { GiSparkles } from "react-icons/gi";

export const PotentialWinSummary = (props: { amount: number; currency: string; betCount: number }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="flex items-center gap-1.5 text-sm text-white/50">
        <GiSparkles className="text-[#F5B83D]"/>
        Potential win
      </p>
      <p className="font-bold text-[#F5B83D]">
        {props.amount.toFixed(2)} {props.currency}
      </p>
    </div>

  </div>
);
