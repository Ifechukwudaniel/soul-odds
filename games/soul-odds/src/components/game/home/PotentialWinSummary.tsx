import { LuSun } from "react-icons/lu";

export const PotentialWinSummary = (props: { amount: number; currency: string; betCount: number }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="flex items-center gap-1.5 text-[0.8rem] text-white/90 uppercase">
        <LuSun className="text-[#F5B83D] text-xl mr-1"/>
        Potential win
      </p>
      <p className="font-medium text-[#F5B83D]">
        {props.amount.toFixed(2)} {props.currency}
      </p>
    </div>

  </div>
);
