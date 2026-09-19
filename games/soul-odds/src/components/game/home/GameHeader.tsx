import { GameLogo } from "@/components/game/home/GameLogo";
import { ProfileMenuButton } from "@/components/game/home/ProfileMenuButton";
import { SoundToggleButton } from "@/components/game/home/SoundToggleButton";
import { WalletBalanceBadge } from "@/components/game/home/WalletBalanceBadge";

export const GameHeader = (props: {
  balance: number;
  currency: string;
  avatar: React.ReactNode;
  onOpenProfile?: () => void;
}) => (
  <header className="container mx-auto flex h-[10dvh] shrink-0 flex-wrap items-center justify-between gap-4 px-4">
    <GameLogo />
    <div className="flex items-center gap-3">
      <SoundToggleButton />
      <WalletBalanceBadge amount={props.balance} currency={props.currency} />
      <ProfileMenuButton avatar={props.avatar} onClick={props.onOpenProfile} />
    </div>
  </header>
);
