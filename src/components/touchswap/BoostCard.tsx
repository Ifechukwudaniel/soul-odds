import React, { useEffect, useState } from "react";
import { Balance } from "../Balance";
import { Modal } from "../ModalBase";
import { OpenBtnIcon } from "../assets/OpenBtnIcon";
import { TBoost, useAppStore } from "@/services/store/store";
/* import { HapticFeedback, initHapticFeedback, isSSR } from "@tma.js/sdk-react";
 */
type BoostCardProps = {
  title: string;
  desc: string;
  icon?: React.ReactNode;
  initialCost: number;
  id: number;
  noLevel?: boolean; // Ensure noLevel is optional
};

export const BoostCard: React.FC<BoostCardProps> = ({ title, icon, desc, initialCost, id, noLevel = false }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentBoost, setCurrentBoost] = useState<TBoost | null>(null);

  const balance = useAppStore(state => state.user!.balance);
  const boosts = useAppStore(state => state.paidBoosts);
  const updateBalance = useAppStore(state => state.updateBalance);
  const updateBoostLevel = useAppStore(state => state.updatePaidBoostLevel);
  const increaseMaxEnergy = useAppStore(state => state.increaseMaxEnergy);
  const increaseTap = useAppStore(state => state.increaseTap);
  const activateAutoClick = useAppStore(state => state.activateAutoClick);

  const [hapticFeedback, setHapticFeedback] = useState<HapticFeedback | null>(null);

  useEffect(() => {
    const foundBoost = boosts.find(boost => boost.boostId === id);
    setCurrentBoost(foundBoost || null);
  }, [boosts, id]);

  const openModal = () => {
    hapticFeedback?.impactOccurred("heavy");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleBuyBoost = () => {
    if (currentBoost) {
      const { cost, level, maximumLevel, boostId } = currentBoost;
      const totalCost = cost!;

      if (boostId === 6) {
        updateBalance(balance - totalCost);
        activateAutoClick();
        hapticFeedback?.impactOccurred("rigid");
        closeModal();
        return;
      }

      if (cost !== undefined && level !== undefined && maximumLevel !== undefined) {
        if (balance >= totalCost && level < maximumLevel) {
          updateBalance(balance - totalCost);
          updateBoostLevel(boostId, level + 1);
          if (boostId === 5) increaseMaxEnergy();
          if (boostId === 4) increaseTap();
          hapticFeedback?.impactOccurred("rigid");
          closeModal();
        }
      }
    }
  };

  if (!currentBoost) {
    return null;
  }

  const { level, maximumLevel, cost } = currentBoost;
  const levelEnded = level! === maximumLevel!;

  return (
    <div className="border-[0.5px] border-[#49485C] p-[4px] rounded-lg dark-blue-gradient h-full">
      <div className="light-green-gradient py-7 px-4 rounded h-full relative pb-12" onClick={openModal}>
        <div className="mb-3">{icon}</div>
        <h3 className="text-[0.8rem] font-[500] mb-2 leading-[1.6]">{title}</h3>
        <Balance size="base" count={cost || initialCost} noCost={levelEnded} singleCost={noLevel} />
        {!levelEnded && cost && <p className="text-[0.8rem] mt-3 font-[500]">{`Level ${level}/${maximumLevel}`}</p>}
        <div className="absolute bottom-5 right-3">
          <OpenBtnIcon />
        </div>
      </div>
      <Modal
        title={title}
        text={desc}
        onClose={closeModal}
        isOpen={isModalOpen}
        icon={icon}
        cost={currentBoost.cost!}
        onClick={handleBuyBoost}
        maxLevel={currentBoost.maximumLevel!}
        level={currentBoost.level!}
        noLevel={noLevel}
      />
    </div>
  );
};
