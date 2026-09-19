import React, { ReactNode, useState, useEffect } from "react";
import { ClaimReward } from "../touchswap/ClaimReward";
import { useAppStore } from "@/services/store/store";
import { LinkTask, QuestList } from "@/types";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react";

type Props = {
  quest: QuestList;
  handleClaim: () => void;
  handleTaskOpen: (index: number) => void;
  claimed: boolean;
  reward: number;
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
  onClaim: () => void;
  claimed: boolean;
  reward: number;
  walletTask:boolean
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const balance = useAppStore(state => state.user.balance);
  const updateBalance = useAppStore(state => state.updateBalance);


const [tonConnectUI] = useTonConnectUI();

  useEffect(() =>
    tonConnectUI.onStatusChange(wallet => {
        if(wallet)  return alert("connected")
        else return alert("disconnected")
        // if (wallet.connectItems?.tonProof && 'proof' in wallet.connectItems.tonProof) {
        //     checkProofInYourBackend(wallet.connectItems.tonProof.proof, wallet.account);
        // }
  }), []);

  const openModal = () => {
    if (claimed) return;
    setIsModalOpen(true);
    updateBalance(balance + reward);
    onClaim();
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  function renderButtonOrStatus( completed:boolean, onTaskOpen:(index:number)=>void, index:number) {
    if (completed) {
      return <button className="text-[0.8rem] font-bold">Done</button>;
    }
  
    return (
      <button
        onClick={() => onTaskOpen(index)}
        className="text-sm bg-white text-black py-2 px-2 rounded-lg font-medium"
      >
        Start
      </button>
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
                    ( <TonConnectButton className="text-sm text-black py-2 px-2 rounded-lg font-medium" />)
                  :
                    renderButtonOrStatus(completed,(index)=>onTaskOpen(index),index)
                  }
                </div>
              </div>  
          );
        })}
      </div>

      <ClaimReward onClose={closeModal} isOpen={isModalOpen} reward={reward} />
      {allTasksCompleted && claimed == false ? (
        <button
          onClick={openModal}
          className="btn bg-white w-full text-black py-4 font-[500] rounded-lg align-baseline"
        >
          Claim Reward
        </button>
      ) : (
        <button disabled className="btn bg-[#A7A7A7] w-full text-black py-4 font-[500] rounded-lg align-baseline">
           All Cliamed
        </button>
      )}
    </div>
  );
};

export const OpenQuestDetailScreen: React.FC<Props> = ({ quest, handleTaskOpen, handleClaim, claimed, reward, walletTask}) => {
  const setScreen = useAppStore(store => store.setScreen);

  const goBack = () => {
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
