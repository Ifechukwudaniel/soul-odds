import React, { useState,  } from "react";
import { ClaimReward } from "../soulodds/ClaimReward";
import { useAppStore } from "@/services/store/store";
import { LinkTask, QuestList } from "@/types";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { GameButton } from "@/components/game/GameButton";
import { playClickSound } from "@/utils/playClickSound";

type Props = {
  quest: QuestList;
  handleClaim: () => Promise<boolean>;
  handleTaskOpen: (index: number) => void;
  claimed: boolean;
  reward: number | string;
  walletTask:boolean;
};

const renderer = ({
  days,
  hours,
  minutes,
  seconds,
  completed,
}: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
}) => {
  if (completed) {
    return "Quest is Live";
  } else {
    return (
      <span>
        {days}d {hours}h {minutes}m {seconds}secs
      </span>
    );
  }
};

const Tasks = ({
  tasks,
  onTaskOpen,
  onClaim,
  claimed,
  reward,
  walletTask
}: {
  tasks: LinkTask[];
  onTaskOpen: (index: number) => void;
  onClaim: () => Promise<boolean>;
  claimed: boolean;
  reward: number | string;
  walletTask:boolean
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const openModal = async () => {
    if (claimed) return;
    if (await onClaim()) setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  function renderButtonOrStatus( completed:boolean, onTaskOpen:(index:number)=>void, index:number) {
    if (completed) {
      return <button className="text-[0.8rem] font-bold">Done</button>;
    }
  
    return (
      <GameButton variant="papyrus" onClick={() => onTaskOpen(index)} className="px-4 py-1.5 text-sm">
        Start
      </GameButton>
    );
  }
  

  const allTasksCompleted = tasks.every(task => task.completed);

  return (
    <div>
      <div className="grid gap-2 pb-12">
        {tasks.map(({ title, completed}, index) => {
          return (
            <div className="bg-[#293641] py-3 px-4 rounded-lg h-full flex items-center justify-between" key={index}>
              <div className="">
                <h3 className="text-[0.8rem] font-[500] leading-[1.8] text-[#AFAFAF]">{title}</h3>
              </div>
               <div>
                  { walletTask ? 
                    ( <button className="text-sm text-black py-2 px-2 rounded-lg font-medium" > Connect Wallet</button>)
                  :
                    renderButtonOrStatus(completed,(index)=>onTaskOpen(index),index)
                  }
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
        <GameButton variant="papyrus" disabled onClick={openModal} className="w-full py-4 text-base">
          {claimed ? "Claimed" : "Complete all tasks"}
        </GameButton>
      )}
    </div>
  );
};

export const OpenQuestDetailScreen: React.FC<Props> = ({ quest, handleTaskOpen, handleClaim, claimed, reward, walletTask}) => {
  const setScreen = useAppStore(store => store.setScreen);

  const goBack = () => {
    playClickSound();
    setScreen("quests");
  };
  return (
    <section className="pb-32 overflow-y-auto">
      <div className="container mx-auto px-5 my-8">
        <div className="flex container h-10  mb-6">
          <button onClick={goBack} className="p-3 hover:bg-[#182027] bg-[#293641] rounded-lg ">
            <ChevronLeftIcon width={20} />
          </button>
        </div>
        <h2 className="text-2xl font-[500] mb-3">{quest.title}</h2>
        <p className="text-[13px] text-white leading-[1.7]">{quest.desc}</p>
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
