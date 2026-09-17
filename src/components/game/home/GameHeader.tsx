import { GameLogo } from "@/components/game/home/GameLogo";
import { ModeSwitcher } from "@/components/game/home/ModeSwitcher";
import { ProfileMenuButton } from "@/components/game/home/ProfileMenuButton";
import type { GameMode } from "@/components/game/home/types";
import { WalletBalanceBadge } from "@/components/game/home/WalletBalanceBadge";

export const GameHeader = (props: {
  activeMode: GameMode;
  blitzTimeLabel: string;
  onSelectMode: (mode: GameMode) => void;
  balance: number;
  currency: string;
  avatar: React.ReactNode;
  onOpenProfile?: () => void;
}) => (
  <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-6">
    <GameLogo />
    <ModeSwitcher
      activeMode={props.activeMode}
      blitzTimeLabel={props.blitzTimeLabel}
      onSelectMode={props.onSelectMode}
    />
    <div className="flex items-center gap-3">
      <WalletBalanceBadge amount={props.balance} currency={props.currency} />
      <ProfileMenuButton avatar={props.avatar} onClick={props.onOpenProfile} />
    </div>
  </header>
);
