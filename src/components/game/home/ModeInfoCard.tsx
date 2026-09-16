import { GameCard } from "@/components/game/home/GameCard";

export const ModeInfoCard = (props: { title: string; description: string }) => (
  <GameCard>
    <h2 className="font-bold text-white">{props.title}</h2>
    <p className="mt-1 text-sm text-white/60">{props.description}</p>
  </GameCard>
);
