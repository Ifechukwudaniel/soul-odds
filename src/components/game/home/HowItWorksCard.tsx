import { GameCard } from "@/components/game/home/GameCard";

export const HowItWorksCard = (props: { steps: string[] }) => (
  <GameCard>
    <h3 className="flex items-center gap-2 font-bold text-white">
      <span className="text-white/50">ⓘ</span>
      How it works
    </h3>
    <ol className="mt-3 flex flex-col gap-2">
      {props.steps.map((step, index) => (
        <li key={step} className="flex items-center gap-3 text-sm text-white/70">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
            {index + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  </GameCard>
);
