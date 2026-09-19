import React from "react";
import { DoubleCoinIcon } from "./assets/DoubleCoinIcon";

type BalanceProps = {
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl";
  count: number;
  noCost?: boolean;
  singleCost?: boolean;
};

const coinSizeMap = {
  xs: 6,
  sm: 15,
  base: 20,
  lg: 22,
  xl: 25,
  "2xl": 30,
};

export const Balance: React.FC<BalanceProps> = ({ size = "2xl", count, noCost = false, singleCost = false }) => {
  return (
    <div className={`text-${size} font-[600] flex items-center`}>
      <DoubleCoinIcon width={coinSizeMap[size]} height="29" />
      <span className="ml-1 text-${size}">{noCost && singleCost ? "∞" : count.toLocaleString()}</span>
    </div>
  );
};
