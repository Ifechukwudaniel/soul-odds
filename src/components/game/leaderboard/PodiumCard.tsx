import Image from "next/image";
import { cn } from "@/utils";
import { StatPill } from "./StatPill";
import type { PodiumUser } from "@/types";
import {Slime} from "@/components/assets/characters/Slime"

 
type Place = 1 | 2 | 3;
 
interface PodiumCardProps {
  user: PodiumUser;
  place: Place;
}
 
const PLACE_STYLES: Record<
  Place,
  { badge: string; ring: string; avatarSize: number; lift: string }
> = {
  1: { badge: "👑", ring: "ring-amber-400/70", avatarSize: 144, lift: "-mt-6" },
  2: { badge: "🥈", ring: "ring-white/20", avatarSize: 112, lift: "" },
  3: { badge: "🥉", ring: "ring-orange-400/40", avatarSize: 112, lift: "" },
};
 
export function PodiumCard({ user, place }: PodiumCardProps) {
  const style = PLACE_STYLES[place];
 
  return (
    <div className={cn("flex w-28 flex-col items-center sm:w-40", style.lift)}>
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-2xl bg-white/5 ring-2",
          style.ring
        )}
        style={{ height: style.avatarSize, width: style.avatarSize }}
      >
        <Slime className="h-[72%] w-[72%]" />
        <span
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-2xl"
          aria-hidden
        >
          {style.badge}
        </span>
      </div>
 
      <p className="mt-4 max-w-full truncate text-base font-[700] text-white">
        {user.username}
      </p>
 
      <div className="mt-4 w-full">
        <StatPill
          title="Prize"
          icon={<span aria-hidden>💎</span>}
          count={user.prize.toLocaleString()}
        />
      </div>
    </div>
  );
}
 