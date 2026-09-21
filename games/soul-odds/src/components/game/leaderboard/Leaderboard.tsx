"use client";

import { useEffect, useRef, useState } from "react";
import { LeaderboardTable } from "./LeaderboardTable";
import { CurrentUserJumpBar } from "./CurrentUserJumpBar";
import { WeeklyCountdown } from "./WeeklyCountdown";
import type { LeaderboardUser } from "@/types";

interface LeaderboardProps {
  /** Full ranked list, rank 1-100 */
  users: LeaderboardUser[];
  currentUser?: LeaderboardUser;
  resetAt: Date;
}

export function Leaderboard({ users, currentUser, resetAt }: LeaderboardProps) {
  const currentUserRowRef = useRef<HTMLDivElement>(null);
  const [isRowVisible, setIsRowVisible] = useState(true);

  useEffect(() => {
    const node = currentUserRowRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsRowVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [currentUser]);

  const handleJumpToMe = () => {
    currentUserRowRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <div className="mx-auto container  px-4 py-4">
      <h2 className="text-2xl font-[500] mb-3">Leaderboard</h2>
      <p className="text-sm text-white leading-[1.7]">
        See how you stack up against everyone else this week and climb the ranks.
      </p>

      <div className="mt-8">
        <WeeklyCountdown resetAt={resetAt} />
      </div>

      <div className="mt-10  ">
        <LeaderboardTable
          users={users}
          currentUserId={currentUser?.id}
          currentUserRowRef={currentUserRowRef}
        />
      </div>

      {currentUser && (
        <CurrentUserJumpBar
          user={currentUser}
          visible={!isRowVisible}
          onJump={handleJumpToMe}
        />
      )}
    </div>
  );
}