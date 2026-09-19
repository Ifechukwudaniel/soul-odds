import { Leaderboard } from "@/components/game/leaderboard/Leaderboard";
import type { LeaderboardUser, PodiumEntry } from "@/types";

const RESET_AT = new Date("2026-09-28T00:00:00Z");
 
const USERS: LeaderboardUser[] = [
  {
    id: "1",
    rank: 1,
    username: "Jolie Joie",
    handle: "joliejoie",
    followers: 40200,
    points: 2_500_000,
    reward: 100_000,
  },
  {
    id: "2",
    rank: 2,
    username: "Brian Ngo",
    handle: "brianngo",
    followers: 31000,
    points: 2_200_000,
    reward: 50_000,
  },
  {
    id: "3",
    rank: 3,
    username: "David Do",
    handle: "davidgo",
    followers: 28500,
    points: 2_100_000,
    reward: 20_000,
  },
  {
    id: "4",
    rank: 4,
    username: "Henrietta O'Connell",
    handle: "henrietta",
    followers: 12241,
    points: 2_114_424,
    reward: 1000,
  },
  {
    id: "5",
    rank: 5,
    username: "Darrel Bins",
    handle: "darrel",
    followers: 12241,
    points: 2_114_424,
    reward: 1000,
  },
];
 
const CURRENT_USER: LeaderboardUser = {
  id: "47",
  rank: 47,
  username: "You",
  handle: "you",
  followers: 892,
  points: 154_200,
  reward: 250,
};
 

export const RankScreen = () => {
  return (
    <Leaderboard users={USERS} currentUser={CURRENT_USER} resetAt={RESET_AT} />
  );
}