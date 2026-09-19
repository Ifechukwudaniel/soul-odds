import React, { useState } from "react";
import { OpenQuests } from "../touchswap/quests/OpenQuests";
import { QuestTab } from "../touchswap/quests/QuestTab";
import { ReferralQuests } from "../touchswap/quests/ReferralQuest";

type OpenQuestsList = {
  title: string;
};

export const openQuestsLists: OpenQuestsList[] = [
  {
    title: "Social Media Madness!",
  },
  {
    title: "Wallet Connect Fun",
  },
];

export const referralQuestsLists: OpenQuestsList[] = [
  {
    title: "Refer a Friend Quest",
  },
  {
    title: "Share on Social Media Quest",
  },
];

export const QuestScreen = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <section>
      <div className="container mx-auto px-4 my-4 pb-32">
        <h2 className="text-2xl font-[500] mb-3">Quests</h2>
        <p className="text-sm text-white leading-[1.7]">Participate in quests and earn rewards for your efforts.</p>
        <div className="mt-8">
          <QuestTab activeTab={activeTab} setActiveTab={setActiveTab} />
          {activeTab === 0 ? <OpenQuests /> : <ReferralQuests />}
        </div>
      </div>
    </section>
  );
};
