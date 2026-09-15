import {QuestList} from "@/types";
import { useCallback } from "react";


export const checkIfMoreThanADay = (date:Date) => {
    if (!date) return false;
    const now = new Date();
    const lastDate = new Date(date); // Ensure date is converted to Date object
    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 1;
};

export const secondsDiffrence = (date:Date, target:number) => {
  if (!date) return false;
  const lastDate = new Date(date); 
  const now = new Date();
  const seconds =  ((now.getTime() - lastDate.getTime() ) / 1000 ) as number ;
  return seconds > target;
};

export  const getPreviousDay = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  };

export const calculateTotalReward = (quest:QuestList) => {
    let totalReward = 0;
    for (const task of quest.tasks) {
      totalReward += task.reward;
    }
    return totalReward;
};

