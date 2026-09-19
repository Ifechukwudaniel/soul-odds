import { cn } from "@/utils";
import { StatPill } from "./StatPill";
import type { PodiumUser } from "@/types";
import { getRandomAvatarForUser } from "@/components/assets/characters/avatars";
import { SilverBadge } from "@/components/assets/SilverBadge";
import { GoldBadge } from "@/components/assets/GoldBadge";
import { BronzeBadge } from "@/components/assets/BronzeBadge";
import { Podium } from "@/components/assets/Podium";

type Place = 1 | 2 | 3;

interface PodiumCardProps {
  user: PodiumUser;
  place: Place;
}

const PLACE_STYLES: Record<
  Place,
  {
    Badge: typeof GoldBadge;
    ring: string;
    avatarSize: number;
    lift: string;
    podiumHeight: string;
  }
> = {
  1: {
    Badge: GoldBadge,
    ring: "ring-amber-400/70",
    avatarSize: 144,
    lift: "-mt-6",
    podiumHeight: "h-64",
  },
  2: {
    Badge: SilverBadge,
    ring: "ring-white/20",
    avatarSize: 112,
    lift: "",
    podiumHeight: "h-52",
  },
  3: {
    Badge: BronzeBadge,
    ring: "ring-orange-400/40",
    avatarSize: 112,
    lift: "",
    podiumHeight: "h-44",
  },
};

export function PodiumCard({ user, place }: PodiumCardProps) {
  const style = PLACE_STYLES[place];
  const Badge = style.Badge;
  const AvatarIcon = getRandomAvatarForUser(user.id).Icon;

  return (
    <div className={cn("flex w-44 flex-col items-center sm:w-64", style.lift)}>
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-white/5 ring-1 ring-[#ffffff20]"
        style={{ height: style.avatarSize, width: style.avatarSize }}
      >
        <AvatarIcon className="h-[72%] w-[72%]" />
      </div>

      <p className="mt-4 max-w-full truncate text-base font-[700] text-white">
        {user.username}
      </p>

      <div className={cn("relative mt-14 w-full", style.podiumHeight)}>
        <Podium className="absolute inset-0 h-full w-full" />

        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <Badge className="h-10 w-10" />
        </div>


        <div className="absolute left-1/2 top-8 w-[75%] -translate-x-1/2">
          <StatPill
            title="Prize"
            icon={<span aria-hidden>💎</span>}
            count={user.prize.toLocaleString()}
            align="center"
          />
        </div>
      </div>
    </div>
  );
}