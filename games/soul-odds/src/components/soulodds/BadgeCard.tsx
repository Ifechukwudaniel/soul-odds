import numeral from 'numeral';
import React, { useState } from 'react';
import { ClaimReward } from './ClaimReward';

type BadgeCardProps = {
  title: string;
  reward: number;
  isUnlocked: boolean;
  requiredCoin: number;
  unlockedIcon?: React.ReactNode;
  lockedIcon?: React.ReactNode;
  tokenMinned: number;
  claimed: boolean;
  onClaim: () => void;
};

export const BadgeCard: React.FC<BadgeCardProps> = ({
  title,
  reward,
  isUnlocked,
  lockedIcon,
  unlockedIcon,
  requiredCoin,
  tokenMinned,
  claimed = false,
  onClaim,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const openModal = () => {
    setIsModalOpen(true);
    onClaim();
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div key={title} className="flex flex-col items-center justify-center">
      <div className="relative mb-4 flex h-[85px] w-[85px] items-center justify-center">
        {isUnlocked ? unlockedIcon : lockedIcon}
        {claimed && (
          <button
            className="purple-gradient absolute bottom-0 rounded-full border border-black px-2 py-[2px] text-[0.65rem] font-[500]"
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
      <h3 className="sf-pro-medium text-[0.8rem]"> {isUnlocked ? title : '???'}</h3>

      <p className="sf-pro-medium mt-1 text-center text-[0.72rem] text-[#B0AEB5]">
        {isUnlocked || !claimed
          ? `${numeral(tokenMinned).format('Oa')} of ${numeral(requiredCoin).format('0a')} coins`
          : '??'}
      </p>

      <div className="mt-[10px] h-[3px] w-[100px] rounded-xl bg-white">
        <div
          className="flex h-full items-center justify-center rounded-xl bg-[#EAAD65] text-center leading-none font-medium text-white"
          style={{ width: `100%` }}
        ></div>
      </div>

      <ClaimReward onClose={closeModal} isOpen={isModalOpen} reward={reward} />
    </div>
  );
};
