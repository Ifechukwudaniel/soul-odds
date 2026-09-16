import React from "react";

export type LinkTask = {
  title: string;
  completed: boolean;
  reward: number;
  link: string;
};

export type QuestList = {
  title: string;
  desc: string;
  tasks: LinkTask[];
  id: string;
  claimed: boolean;
};


export type UserTask = {
  id:number,
  title: string;
  link: string;
  reward:number;
  completed:boolean 
}