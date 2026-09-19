import React,{useEffect} from "react";
import { EnergyBarHead } from "../assets/EnergyBarHead";
import { useAppStore } from "@/services/store/store";
import { ONE_SECOND } from "@/constants";

interface EnergyBarProps {
  barWidth?: string;
  barHeight?: string;
  headWidth?: string;
  headHeight?: string;
}

export const EnergyBar: React.FC<EnergyBarProps> = ({
  barWidth = "124px",
  barHeight = "18px",
  headWidth = "35",
  headHeight = "35",
}) => {
   
  const rechargeSpeed = useAppStore(state => state.rechargeSpeed)
  const updateEnergyByTime = useAppStore(state => state.updateEnergyByTime)
  const energyLeft = useAppStore(state => state.user!.energy.energyLeft || 0);
  const maxEnergy = useAppStore(state => state.user!.energy.maxEnergy || 0);
  
  
  const energyPercentage = (energyLeft / maxEnergy) * 100;

  return (
    <div className="relative mt-3" style={{ width: barWidth }}>
      <div className="w-full rounded bg-[#8C7EAD66] relative left-3 " style={{ height: barHeight }}>
        <div className="flex w-full energy-text z-40 absolute inset-0 justify-center ">
          <p className="text-white font-semibold">{`${energyLeft}/${maxEnergy}`}</p>
        </div>
        <div className="dark-green-gradient top-[-3px] left-0 bottom-[-3px] w-full absolute rounded" />
        <div
          className="green-gradient text-white text-center leading-none rounded absolute flex justify-center items-center energy-text"
          style={{ width: `${energyPercentage}%`, height: "100%" }}
        />
      </div>

      <EnergyBarHead
        width={headWidth}
        height={headHeight}
        className="absolute left-[-35%] top-[50%] translate-y-[-50%] translate-x-[100%]"
      />
    </div>
  );
};
