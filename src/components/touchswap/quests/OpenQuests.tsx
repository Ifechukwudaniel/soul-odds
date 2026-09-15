import React from "react";
import { QuestCard } from "./QuestCard";

type OpenQuestsList = {
  title: string;
  page: string;
};

export const openQuestsLists: OpenQuestsList[] = [
  {
    title: "Social Media Madness!",
    page: "social",
  },
  {
    title: "Wallet Connect Fun",
    page: "wallet",
  },
];

export const OpenQuests = () => {
  return (
    <div className="grid gap-4">
      {openQuestsLists.map(({ title, page }, index) => {
        return <QuestCard title={title} key={index} page={page} />;
      })}
    </div>
  );
};
