import React, { useState } from "react";
import { ReferralButton } from "./ReferralButton";
import { useAppStore } from "@/services/store/store";

export type ReferralQuestsList = {
  count: number;
  reward: number;
  claimed?: boolean;
  completed?: boolean;
};

export const referralQuestsLists: ReferralQuestsList[] = [
  {
    count: 1,
    reward: 1200,
    claimed: true,
    completed: true,
  },
  {
    count: 5,
    reward: 5000,
    claimed: true,
    completed: true,
  },
  {
    count: 10,
    reward: 15000,
    claimed: true,
    completed: true,
  },
  {
    count: 25,
    reward: 50000,
    claimed: false,
    completed: true,
  },
  {
    count: 100,
    reward: 100000,
    claimed: false,
    completed: false,
  },
  {
    count: 200,
    reward: 150000,
    claimed: false,
    completed: false,
  },
  {
    count: 500,
    reward: 250000,
    claimed:false,
    completed:false
  },
  {
    count:1000,
    reward: 500000,
    claimed:false,
    completed:false
  },
  {
    count: 100000,
    reward: 5000000,
    claimed:false,
    completed:false
  },
  {
    count:250000,
    reward: 25000000,
    claimed:false,
    completed:false
  }
];

export const ReferralQuests = () => {
  const totalRefer = useAppStore(state => state.user.totalRefered);
  const totalRefersCliamed = useAppStore(state => state.user.totalReferedCliamed);
  const refersUserData = referralQuestsLists.map(refer => {
    return { ...refer, completed: totalRefer >= refer.count, claimed: totalRefersCliamed >= refer.count };
  });

  return (
    <div className="grid gap-2">
      {refersUserData.map(({ count, reward, claimed, completed }, index) => (
        <ReferralButton count={count} reward={reward} claimed={claimed} completed={completed} key={index} />
      ))}
    </div>
  );
};
