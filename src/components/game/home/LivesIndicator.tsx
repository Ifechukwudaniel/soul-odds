import { Heart } from "@/components/assets/Heart";
import { GameCard } from "@/components/game/home/GameCard";

export const LivesIndicator = (props: { lives: number; maxLives: number }) => (
  <GameCard className="flex items-center gap-2">
    {Array.from({ length: props.maxLives }).map((_, index) => (
      <Heart
        key={`life-${index}`}
        width={24}
        height="24"
        className={index < props.lives ? "" : "opacity-20 grayscale"}
      />
    ))}
  </GameCard>
);
