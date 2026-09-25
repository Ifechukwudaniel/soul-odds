import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';
import { GameButton } from '@/components/game/GameButton';
import { useAppStore } from '@/services/store/store';
import { LinkTask, QuestList } from '@/types';
import { playClickSound } from '@/utils/playClickSound';
import { ClaimReward } from '../soulodds/ClaimReward';

type Props = {
  quest: QuestList;
  handleClaim: () => Promise<boolean>;
  handleTaskOpen: (index: number) => void;
  claimed: boolean;
  reward: number | string;
  walletTask: boolean;
};

const Tasks = ({
  tasks,
  onTaskOpen,
  onClaim,
  claimed,
  reward,
  walletTask,
}: {
  tasks: LinkTask[];
  onTaskOpen: (index: number) => void;
  onClaim: () => Promise<boolean>;
  claimed: boolean;
  reward: number | string;
  walletTask: boolean;
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const openModal = async () => {
    if (claimed) return;
    if (await onClaim()) setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  function renderButtonOrStatus(
    completed: boolean,
    onTaskOpen: (index: number) => void,
    index: number,
  ) {
    if (completed) {
      return <button className="text-[0.8rem] font-bold">Done</button>;
    }

    return (
      <GameButton
        variant="papyrus"
        onClick={() => onTaskOpen(index)}
        className="px-4 py-1.5 text-sm"
      >
        Start
      </GameButton>
    );
  }

  const allTasksCompleted = tasks.every((task) => task.completed);

  return (
    <div>
      <div className="grid gap-2 pb-12">
        {tasks.map(({ title, completed }, index) => {
          return (
            <div
              className="flex h-full items-center justify-between rounded-lg bg-[#293641] px-4 py-3"
              key={index}
            >
              <div className="">
                <h3 className="text-[0.8rem] leading-[1.8] font-[500] text-[#AFAFAF]">{title}</h3>
              </div>
              <div>
                {walletTask ? (
                  <button className="rounded-lg px-2 py-2 text-sm font-medium text-black">
                    {' '}
                    Connect Wallet
                  </button>
                ) : (
                  renderButtonOrStatus(completed, (index) => onTaskOpen(index), index)
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ClaimReward onClose={closeModal} isOpen={isModalOpen} reward={reward} />
      {allTasksCompleted && !claimed ? (
        <GameButton variant="papyrus" onClick={openModal} className="w-full py-4 text-base">
          Claim Reward
        </GameButton>
      ) : (
        <GameButton
          variant="papyrus"
          disabled
          onClick={openModal}
          className="w-full py-4 text-base"
        >
          {claimed ? 'Claimed' : 'Complete all tasks'}
        </GameButton>
      )}
    </div>
  );
};

export const OpenQuestDetailScreen: React.FC<Props> = ({
  quest,
  handleTaskOpen,
  handleClaim,
  claimed,
  reward,
  walletTask,
}) => {
  const setScreen = useAppStore((store) => store.setScreen);

  const goBack = () => {
    playClickSound();
    setScreen('quests');
  };
  return (
    <section className="overflow-y-auto pb-32 max-md:pb-4">
      <div className="container mx-auto my-8 px-5">
        <div className="container mb-6 flex h-10">
          <button onClick={goBack} className="rounded-lg bg-[#293641] p-3 hover:bg-[#182027]">
            <ChevronLeftIcon width={20} />
          </button>
        </div>
        <h2 className="mb-3 text-2xl font-[500]">{quest.title}</h2>
        <p className="text-[13px] leading-[1.7] text-white max-md:text-[0.8rem] max-md:leading-[1.5] max-md:text-white/70">
          {quest.desc}
        </p>
        <div className="mt-8">
          <Tasks
            tasks={quest.tasks}
            onTaskOpen={handleTaskOpen}
            onClaim={handleClaim}
            claimed={claimed}
            reward={reward}
            walletTask={walletTask}
          />
        </div>
      </div>
    </section>
  );
};
