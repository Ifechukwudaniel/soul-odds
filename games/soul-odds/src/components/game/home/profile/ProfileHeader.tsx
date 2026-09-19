import { FaPen } from "react-icons/fa";
import { getAvatarById } from "@/components/assets/characters/avatars";
import { RankBadge } from "@/components/game/home/profile/RankBadge";
import { playClickSound } from "@/utils/playClickSound";

export const ProfileHeader = (props: {
  username: string;
  handle: string;
  rank: string;
  avatarId: string;
  onEditAvatar?: () => void;
}) => {
  const AvatarIcon = getAvatarById(props.avatarId).Icon;

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-black p-1"
          style={{
            background:
              "conic-gradient(from 180deg, #FDE991, #B07464, #7B6A72, #5F6166, #BAAF7F, #FDE991)",
          }}
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950">
            <AvatarIcon width={56} height="56" />
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            playClickSound();
            props.onEditAvatar?.();
          }}
          className="accent-gradient absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full border border-black"
        >
          <FaPen className="h-3 w-3 text-white" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div>
          <p className="text-xl font-bold text-white">{props.username}</p>
          <p className="text-sm text-white/50">@{props.handle}</p>
        </div>
        <RankBadge label={props.rank} />
      </div>
    </div>
  );
};
