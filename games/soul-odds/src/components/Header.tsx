import React from "react";
import { EnergyBar } from "./touchswap/EnergyBar";
import { RankHeader } from "./touchswap/RankHeader";

export const Header = () => {
  return (
    <header>
      <div className="container px-6 py-8 pt-[4%] flex justify-between items-start text-sm ">
        <EnergyBar />
        <RankHeader />
      </div>
    </header> 
  );
};
