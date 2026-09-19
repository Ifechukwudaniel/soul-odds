import React, { useState } from "react";
import Image from "next/image";
import { ClaimReward } from "../ClaimReward";
import { ReferralQuestsList } from "./ReferralQuest";
import { DoubleCoinIcon } from "@/components/assets/DoubleCoinIcon";
import { useAppStore } from "@/services/store/store";

export const ReferralButton: React.FC<ReferralQuestsList> = ({ count, reward, completed, claimed }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const balance = useAppStore(state => state.user.balance);
  const updateBalance = useAppStore(state => state.updateBalance);
  const updateTotalReferedCliamed = useAppStore(state => state.updateTotalReferedCliamed);

  const openModal = () => {
    if (claimed) return;
    setIsModalOpen(true);
    updateBalance(balance + reward);
    updateTotalReferedCliamed(count);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-[#293641] py-3 px-4 rounded-[6px] h-full flex items-center justify-between">
      <div className="flex items-center">
        <Image src={"/img/ref.svg"} width={40} height={40} alt="Referral Icon" priority={true} />
        <div className="ml-3">
          <h3 className="text-[0.8rem] font-[500] leading-[1.8] text-[#AFAFAF]">{count} Invite</h3>
          <div className="text-[0.75rem] font-medium flex items-center">
            <DoubleCoinIcon width="14" height="14" />
            <span className="ml-1">{reward}</span>
          </div>
        </div>
        <ClaimReward onClose={closeModal} isOpen={isModalOpen} reward={reward} />
      </div>
      <button
        onClick={openModal}
        disabled={!completed}
        className={`${
          !completed || claimed ? "bg-[#A7A7A7]" : "bg-[#FCFCFC]"
        } text-sm  text-black py-2 px-2 rounded-lg font-medium `}
      >
        {claimed ? "claimed" : "claim"}
      </button>
    </div>
  );
};
