<<<<<<< HEAD
import { cn } from "@/utils";
import { StatPill } from "./StatPill";
import type { PodiumUser } from "@/types";
import { Slime } from "@/components/assets/characters/Slime";
import { SilverBadge } from "@/components/assets/SilverBadge";
import { Goldbadge } from "@/components/assets/GoldBadge";
import { BronzeBadge } from "@/components/assets/BronzeBadge";
import { Podium } from "@/components/assets/Podium";
=======
import Image from "next/image";
import { cn } from "@/utils";
import { StatPill } from "./StatPill";
import type { PodiumUser } from "@/types";
>>>>>>> aa77441 (changes)

type Place = 1 | 2 | 3;

interface PodiumCardProps {
  user: PodiumUser;
  place: Place;
}

<<<<<<< HEAD
const PLACE_STYLES: Record<
  Place,
  {
    Badge: typeof Goldbadge;
    ring: string;
    avatarSize: number;
    lift: string;
    podiumHeight: string;
  }
> = {
  1: {
    Badge: Goldbadge,
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
=======
// Placeholder emoji badges — swap for real medal/crown assets when ready.
const PLACE_STYLES: Record<
  Place,
  { badge: string; ring: string; avatarSize: number; lift: string }
> = {
  1: { badge: "👑", ring: "ring-amber-400/70", avatarSize: 144, lift: "-mt-6" },
  2: { badge: "🥈", ring: "ring-white/20", avatarSize: 112, lift: "" },
  3: { badge: "🥉", ring: "ring-orange-400/40", avatarSize: 112, lift: "" },
>>>>>>> aa77441 (changes)
};

export function PodiumCard({ user, place }: PodiumCardProps) {
  const style = PLACE_STYLES[place];
<<<<<<< HEAD
  const Badge = style.Badge;

  return (
    <div className={cn("flex w-44 flex-col items-center sm:w-64", style.lift)}>
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-white/5 ring-1 ring-[#ffffff20]"
        style={{ height: style.avatarSize, width: style.avatarSize }}
      >
        <Slime className="h-[72%] w-[72%]" />
=======

  return (
    <div className={cn("flex w-28 flex-col items-center sm:w-40", style.lift)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl ring-2",
          style.ring
        )}
        style={{ height: style.avatarSize, width: style.avatarSize }}
      >
        <Image
          src={user.avatarUrl}
          alt={user.username}
          fill
          sizes="144px"
          className="object-cover"
        />
        <span
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-2xl"
          aria-hidden
        >
          {style.badge}
        </span>
>>>>>>> aa77441 (changes)
      </div>

      <p className="mt-4 max-w-full truncate text-base font-[700] text-white">
        {user.username}
      </p>

<<<<<<< HEAD
      {/* Podium sits directly under the avatar/name; height (not width) is
          what actually grows the rendered platform, since Podium scales to
          fit its box while keeping its own aspect ratio — a wider box just
          letterboxes and leaves empty space either side. Width stays at the
          card's own width so the graphic and the overlay stay lined up. */}
      <div className={cn("relative mt-14 w-full", style.podiumHeight)}>
        <Podium className="absolute inset-0 h-full w-full" />

        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <Badge className="h-10 w-10" />
        </div>

        {/* Centered with a fixed width, same technique as the badge above,
            instead of inset-x-3 — inset-x assumes the podium fills the box
            edge-to-edge, which it doesn't. */}
        <div className="absolute left-1/2 top-8 w-[75%] -translate-x-1/2">
          <StatPill
            title="Prize"
            icon={<span aria-hidden>💎</span>}
            count={user.prize.toLocaleString()}
            align="center"
          />
        </div>
=======
      <div className="mt-4 w-full">
        <StatPill
          title="Prize"
          icon={<span aria-hidden>💎</span>}
          count={user.prize.toLocaleString()}
        />
>>>>>>> aa77441 (changes)
      </div>
    </div>
  );
}