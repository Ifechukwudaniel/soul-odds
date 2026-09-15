import React, { useState } from "react";
import { ClaimReward } from "./ClaimReward";
import numeral from "numeral";

type BadgeCardProps = {
  title: string;
  reward: number;
  isUnlocked: boolean;
  requiredCoin: number;
  unlockedIcon?: React.ReactNode;
  lockedIcon?: React.ReactNode;
  tokenMinned: number;
  cliamed: boolean;
  onCliam: () => void;
};

export const BadgeCard: React.FC<BadgeCardProps> = ({
  title,
  reward,
  isUnlocked,
  lockedIcon,
  unlockedIcon,
  requiredCoin,
  tokenMinned,
  cliamed = false,
  onCliam,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const openModal = () => {
    setIsModalOpen(true);
    onCliam();
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div key={title} className="flex flex-col items-center justify-center">
      <div className="w-[85px] h-[85px] mb-4 flex justify-center items-center relative">
        {isUnlocked ? unlockedIcon : lockedIcon}
        {cliamed && (
          <button
            className="text-[0.65rem] px-2 purple-gradient rounded-full  py-[2px] border border-black absolute bottom-0 font-[500]"
            onClick={openModal}
            style={{
              boxShadow: `0.88px 2.63px 1.32px 0px #FFFFFF47 inset
            `,
            }}
          >
            Claim
          </button>
        )}
      </div>
      <h3 className="text-[0.8rem] sf-pro-medium"> {isUnlocked ? title : "???"}</h3>

      <p className="text-[0.72rem] text-center mt-1 text-[#B0AEB5] sf-pro-medium">
        {isUnlocked || !cliamed
          ? `${numeral(tokenMinned).format("Oa")} of ${numeral(requiredCoin).format("0a")} coins`
          : "??"}
      </p>

      <div className="w-[100px] rounded-xl h-[3px] mt-[10px] bg-white">
        <div
          className="font-medium text-white text-center h-full leading-none rounded-xl flex justify-center items-center bg-[#EAAD65] "
          style={{ width: `100%` }}
        ></div>
      </div>

      <ClaimReward onClose={closeModal} isOpen={isModalOpen} reward={reward} />
    </div>
  );
};
