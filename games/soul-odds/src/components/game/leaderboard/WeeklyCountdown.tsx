'use client';

import { useEffect, useState } from 'react';
import { TimerIcon } from '@/components/assets/TimerIcon';

interface WeeklyCountdownProps {
  /** Timestamp the current weekly cycle ends and points reset. */
  resetAt: Date;
}

interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeParts(target: Date): TimeParts {
  const diffMs = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diffMs / 86_400_000),
    hours: Math.floor((diffMs % 86_400_000) / 3_600_000),
    minutes: Math.floor((diffMs % 3_600_000) / 60_000),
    seconds: Math.floor((diffMs % 60_000) / 1000),
  };
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function WeeklyCountdown({ resetAt }: WeeklyCountdownProps) {
  // Lazy init avoids a first render showing 0s before the effect runs.
  const [time, setTime] = useState(() => getTimeParts(resetAt));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeParts(resetAt)), 1000);
    return () => clearInterval(id);
  }, [resetAt]);

  return (
    <div className="flex flex-row items-center gap-1 text-left">
      <TimerIcon className="h-[30px] w-[28px]" />
      <p className="mr-3 ml-1 text-[0.75rem] text-[#AFAFAF]">Resets in:</p>
      <p className="text-base font-[500] text-white tabular-nums">
        {time.days}d {pad(time.hours)}h {pad(time.minutes)}m {pad(time.seconds)}s
      </p>
    </div>
  );
}
