import { CrownIcon } from "@/components/assets/CrownIcon";
import { Fire } from "@/components/assets/Fire";
import { HowItWorksCard } from "@/components/game/home/HowItWorksCard";
import { LivesIndicator } from "@/components/game/home/LivesIndicator";
import { ModeInfoCard } from "@/components/game/home/ModeInfoCard";
import { StatTile } from "@/components/game/home/StatTile";

export const GameSidebarLeft = (props: {
  modeTitle: string;
  modeDescription: string;
  lives: number;
  maxLives: number;
  currentStreak: number;
  maxWin: string;
  howItWorksSteps: string[];
}) => (
  <div className="flex w-full flex-col gap-4 lg:w-72 lg:shrink-0">
    <ModeInfoCard title={props.modeTitle} description={props.modeDescription} />
    <LivesIndicator lives={props.lives} maxLives={props.maxLives} />
    <div className="flex gap-4">
      <StatTile
        icon={<Fire width={24} height="24" />}
        label="Current Streak"
        value={String(props.currentStreak)}
      />
      <StatTile
        icon={<CrownIcon />}
        label="Max Win"
        value={props.maxWin}
      />
    </div>
    <HowItWorksCard steps={props.howItWorksSteps} />
  </div>
);
