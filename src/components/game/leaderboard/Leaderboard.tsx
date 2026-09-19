"use client";

import { useEffect, useRef, useState } from "react";
import { LeaderboardPodium } from "./LeaderboardPodium";
import { LeaderboardTable } from "./LeaderboardTable";
import { CurrentUserJumpBar } from "./CurrentUserJumpBar";
import type { LeaderboardUser, PodiumEntry } from "types";

interface LeaderboardProps {
  /** [1st place, 2nd place, 3rd place] */
  podium: PodiumEntry;
  /** Ranks 4-100 */
  rest: LeaderboardUser[];
  currentUser?: LeaderboardUser;
  resetAt: Date;
}

export function Leaderboard({ podium, rest, currentUser, resetAt }: LeaderboardProps) {
  const currentUserRowRef = useRef<HTMLTableRowElement>(null);
  const [isRowVisible, setIsRowVisible] = useState(true);

  const isOnPodium = currentUser
    ? podium.some((entry) => entry.id === currentUser.id)
    : false;

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
    <div className="mx-auto max-w-5xl px-4 py-10">
      <LeaderboardPodium podium={podium} resetAt={resetAt} />

      <div className="mt-10">
        <LeaderboardTable
          users={rest}
          currentUserId={currentUser?.id}
          currentUserRowRef={currentUserRowRef}
        />
      </div>

      {currentUser && !isOnPodium && (
        <CurrentUserJumpBar
          user={currentUser}
          visible={!isRowVisible}
          onJump={handleJumpToMe}
        />
      )}
    </div>
  );
}