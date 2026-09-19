import React from "react";
import { ExtraTapIcon } from "../assets/ExtraTapIcon";

type Props = {
  left: number;
  total: number;
};

export const ExtraTap: React.FC<Props> = ({ left = 3, total = 3 }) => {
  return (
    <div>
      <p className="text-[0.8rem] mb-1 text-white text-left pl-2 font-medium">
        Extra <br /> Taps
      </p>
      <div className="relative z-[40]">
        <div
          className="absolute purple-gradient bottom-0 left-[50%] px-2 rounded-2xl transform translate-x-[-60%] text-[0.8rem] translate-y-[50%]"
          style={{
            boxShadow: `0.88px 2.63px 1.32px 0px #FFFFFF47 inset
            `,
          }}
        >
          <span>
            {left}/{total}
          </span>
        </div>
        <ExtraTapIcon />
      </div>
    </div>
  );
};
