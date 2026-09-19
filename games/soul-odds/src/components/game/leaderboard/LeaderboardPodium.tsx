import { PodiumCard } from "./PodiumCard";
import { WeeklyCountdown } from "./WeeklyCountdown";
import type { PodiumEntry } from "@/types";

<<<<<<< HEAD

=======
>>>>>>> aa77441 (changes)
interface LeaderboardPodiumProps {
  /** [1st place, 2nd place, 3rd place] */
  podium: PodiumEntry;
  resetAt: Date;
}

export function LeaderboardPodium({ podium, resetAt }: LeaderboardPodiumProps) {
  const [first, second, third] = podium;

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full items-end justify-center gap-4 sm:gap-8">
        <PodiumCard user={second} place={2} />
        <PodiumCard user={first} place={1} />
        <PodiumCard user={third} place={3} />
      </div>
      <div className="mt-8">
        <WeeklyCountdown resetAt={resetAt} />
      </div>
    </div>
  );
}