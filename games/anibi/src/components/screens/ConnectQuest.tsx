import React from "react";
import { OpenQuestDetailScreen } from "./OpenQuestDetails";
import { QuestList } from "@/types";
import { calculateTotalReward } from "@/utils";
import {TonConnectButton} from "@tonconnect/ui-react";
import { useAppStore } from "@/services/store/store";


export const connectQuestsLists: QuestList = {
  id: "wallet",
  title: "Wallet Connect Fun",
  desc: "Connect Touchswap to your ton wallet, be careful! Once connected, any rewards would be sent to the connected wallet.",
  tasks: [
    {
      title: "Connect Wallet",
      completed: false,
      link: "",
      reward: 10000,
    },
  ],
  claimed: false,
};


export const ConnectQuestScreen = () => {
  const balance = useAppStore(state=> state.user!.balance)
  const updateBalance = useAppStore(state=> state.updateBalance)
  const walletCliamed = useAppStore(state=>state.walletCliamed) 
  

  const totalReward = calculateTotalReward(connectQuestsLists);
  const handleClaim = () => {};

  const handleTaskOpen = (index: number) => {
      console.log(index)
  };

  return (
    <OpenQuestDetailScreen
      quest={connectQuestsLists}
      handleClaim={handleClaim}
      handleTaskOpen={handleTaskOpen}
      reward={totalReward}
      claimed={walletCliamed}
      walletTask={true}
    />
  );
};
