import { GameCard } from "@/components/game/home/GameCard";

export const StatTile = (props: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex-1">
    <GameCard containerClassName="h-full" className="h-full">
      {props.icon}
      <p className="mt-2 text-xs text-white/50">{props.label}</p>
      <p className="font-bold text-white">{props.value}</p>
    </GameCard>
  </div>
);
