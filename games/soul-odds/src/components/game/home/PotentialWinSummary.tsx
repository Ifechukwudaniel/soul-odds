import { GiSunbeams } from 'react-icons/gi';
import { LuSun } from "react-icons/lu";

import { serifFont } from '@/styles/serif-font';

export const PotentialWinSummary = (props: {
  amount: number;
  currency: string;
  betCount: number;
}) => (
  <div className="flex items-center justify-between">
    <div>
      <p
        className={`${serifFont.className} flex items-center gap-1.5 text-[0.8rem] text-white/90 uppercase`}
      >
        <LuSun  className="mr-1 text-lg gold-icon" />
       <span>Potential win</span> 
      </p>
      <p className="font-medium text-[#F5B83D]">
        {props.amount.toFixed(2)} {props.currency}
      </p>
    </div>
  </div>
);
