import type { RefObject } from "react";
import {cn} from "@/utils"
import type { LeaderboardUser } from "@/types";
import { getRandomAvatarForUser } from "@/components/assets/characters/avatars";
import { CurrencyCoinIcon } from "@/components/assets/CurrencyCoinIcon";
import { SilverBadge } from "@/components/assets/SilverBadge";
import { GoldBadge } from "@/components/assets/GoldBadge";
import { BronzeBadge } from "@/components/assets/BronzeBadge";
import { GameCard } from "@/components/game/home/GameCard";
 
interface LeaderboardTableProps {
    users: LeaderboardUser[];
    currentUserId?: string;
    currentUserRowRef?: RefObject<HTMLTableRowElement>;
  }
   
  const COLUMNS = ["Rank", "User name", "Point", "Profit"] as const;

  const RANK_BADGES: Record<number, typeof GoldBadge> = {
    1: GoldBadge,
    2: SilverBadge,
    3: BronzeBadge,
  };

  const RANK_AVATAR_RING: Record<number, string> = {
    1: "ring-2 ring-amber-400/70",
    2: "ring-2 ring-white/30",
    3: "ring-2 ring-orange-400/40",
  };
   
  export function LeaderboardTable({
    users,
    currentUserId,
    currentUserRowRef,
  }: LeaderboardTableProps) {
    return (
      <GameCard className="overflow-x-auto" containerClassName="w-full max-h-[20rem] overflow-y-scroll">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-[#AFAFAF]">
              {COLUMNS.map((column) => (
                <th key={column} className="px-6 py-3 font-[500]">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isCurrentUser = user.id === currentUserId;
              const RankBadge = RANK_BADGES[user.rank];
              const AvatarIcon = getRandomAvatarForUser(user.id).Icon;
              return (
                <tr
                  key={user.id}
                  ref={isCurrentUser ? currentUserRowRef : undefined}
                  className={cn(
                    "border-t border-white/5",
                    isCurrentUser
                      ? "bg-blue-500/10 ring-1 ring-inset ring-blue-500/40"
                      : "bg-white/[0.02]"
                  )}
                >
                  <td className="px-6 py-4 font-[700] text-white">
                    {RankBadge ? <RankBadge className="h-8 w-8" /> : user.rank}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "accent-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-full p-[2px] ring-offset-2 ring-offset-[#18131F]",
                          RANK_AVATAR_RING[user.rank]
                        )}
                      >
                        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-black/70 bg-slate-950">
                          <AvatarIcon className="h-[68%] w-[68%]" />
                        </div>
                      </div>
                      <p className="font-[500] text-white">@{user.handle}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">
                    {user.points.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 rounded-md  px-3 py-1 font-[600] ">
                      <CurrencyCoinIcon width={16} height="16" /> {user.reward.toLocaleString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GameCard>
    );
  }
