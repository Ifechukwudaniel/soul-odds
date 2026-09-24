import React from 'react';
import { RefillIcon } from '../assets/Refill-Icon';

type Props = {
  left: number;
  total: number;
};

export const Refill: React.FC<Props> = ({ left = 0, total = 3 }) => {
  return (
    <div>
      <p className="mb-1 pr-2 text-right text-[0.8rem] font-medium text-white">
        Daily
        <br />
        Refill
      </p>
      <div className="relative z-[40]">
        <div
          className="purple-gradient absolute bottom-0 left-[50%] translate-x-[-50%] translate-y-[50%] transform rounded-2xl px-2 text-[0.8rem]"
          style={{
            boxShadow: `0.88px 2.63px 1.32px 0px #FFFFFF47 inset
            `,
          }}
        >
          <span>
            {left}/{total}
          </span>
        </div>
        <RefillIcon />
      </div>
    </div>
  );
};
