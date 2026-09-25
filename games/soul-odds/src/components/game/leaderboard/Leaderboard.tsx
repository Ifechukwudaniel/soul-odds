'use client';

import { useEffect, useRef, useState } from 'react';
import type { LeaderboardUser } from '@/types';
import { CurrentUserJumpBar } from './CurrentUserJumpBar';
import { LeaderboardTable } from './LeaderboardTable';
import { WeeklyCountdown } from './WeeklyCountdown';

interface LeaderboardProps {
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
      ([entry]) => setIsRowVisible(entry?.isIntersecting ?? true),
      {
        threshold: 0.3,
      },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [currentUser]);

  const handleJumpToMe = () => {
    currentUserRowRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <h2 className="mb-3 text-2xl font-[500] max-md:text-xl">Leaderboard</h2>
      <p className="text-sm leading-[1.7] text-white max-md:text-[0.8rem] max-md:leading-[1.5] max-md:text-white/70">
        See how you stack up against everyone else this week and climb the ranks.
      </p>

      <div className="mt-8 max-md:mt-4">
        <WeeklyCountdown resetAt={resetAt} />
      </div>

      <div className="mt-10 max-md:mt-5 max-md:pb-4">
        <LeaderboardTable
          users={users}
          currentUserId={currentUser?.id}
          currentUserRowRef={currentUserRowRef}
        />
      </div>

      {currentUser && (
        <CurrentUserJumpBar user={currentUser} visible={!isRowVisible} onJump={handleJumpToMe} />
      )}
    </div>
  );
}
