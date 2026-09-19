import type { RefObject } from "react";
import Image from "next/image";
import {cn} from "@/utils"
import type { LeaderboardUser } from "@/types";

interface LeaderboardTableProps {
  users: LeaderboardUser[];
  currentUserId?: string;
  /** Attached to the current user's row so it can be scrolled into view. */
  currentUserRowRef?: RefObject<HTMLTableRowElement>;
}

const COLUMNS = ["Rank", "User name", "Followers", "Point", "Reward"] as const;

export function LeaderboardTable({
  users,
  currentUserId,
  currentUserRowRef,
}: LeaderboardTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/5">
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
                <td className="px-6 py-4 font-[700] text-white">{user.rank}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-9 w-9 overflow-hidden rounded-full">
                      <Image
                        src={user.avatarUrl}
                        alt={user.username}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-[600] text-white">{user.username}</p>
                      <p className="text-sm text-[#AFAFAF]">@{user.handle}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-white">
                  {user.followers.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-white">
                  {user.points.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-3 py-1 font-[600] text-blue-400">
                    <span aria-hidden>💎</span> {user.reward.toLocaleString()}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}