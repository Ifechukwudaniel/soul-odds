import { PlaceholderIcon } from "@/components/game/home/PlaceholderIcon";

export const ProfileMenuButton = (props: { avatarLabel: string }) => (
  <button type="button" className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 py-1 pr-2 pl-1">
    <PlaceholderIcon emoji={props.avatarLabel} className="h-8 w-8 bg-white/10 text-base" />
    <span className="text-white/50">▾</span>
  </button>
);
