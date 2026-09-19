import React, { useState, useEffect } from "react";
import { OpenQuestDetailScreen } from "./OpenQuestDetails";
import {  QuestList } from "@/types";
import { calculateTotalReward } from "@/utils";
import { getUserTasks, postUserTasks } from "@/services/data/task";
import { useAppStore } from "@/services/store/store";
import { Loader } from "../Loader";




export const socialQuestsLists: QuestList = {
  id: "social",
  title: "Social Media Madness!",
  desc: "Our Social media accounts are amazing places! Check them out, follow us!",
  tasks: [],
  claimed: false,
};


export const SocialQuestScreen = () => {
  const user = useAppStore(state=> state.user)
  const [claimed, setClaimed] = useState(socialQuestsLists.claimed);
  const [loading, setLoading] = useState(true);
  const balance = useAppStore(state=> state.user!.balance)
  const updateBalance = useAppStore(state=> state.updateBalance)

  const handleClaim = () => {
    const tasksCompleted = socialQuestsLists.tasks.every(task => task.completed);
    if (tasksCompleted) {
      setClaimed(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
       let userTask =  await getUserTasks(user.id.toString());
       socialQuestsLists.tasks = userTask;
       setLoading(false)
      } catch (error) {
        socialQuestsLists.tasks = [];
        console.error("Error fetching user tasks:", error);
        setLoading(false)
      }
    };
    fetchData();
  }, []);

  const totalReward = calculateTotalReward(socialQuestsLists);

  const handleTaskOpen = async (index: number) => {
    if(window !== null) {
      window.open(socialQuestsLists.tasks[index].link,"_blank");
      socialQuestsLists.tasks[index].completed = true
      await postUserTasks(user.id,index)
    }
  };

  if(loading) {
     return (
      <section className="flex flex-col h-screen justify-center items-center">
        <Loader />
    </section>
     )
  }
  return (

    <OpenQuestDetailScreen
      quest={socialQuestsLists}
      handleClaim={handleClaim}
      handleTaskOpen={handleTaskOpen}
      claimed={claimed}
      reward={totalReward}
      walletTask={false}
    />
  );
};
