import { DemoBadge } from '@/components/game/home/DemoBadge';
import { GameLogo } from '@/components/game/home/GameLogo';
import { ProfileMenuButton } from '@/components/game/home/ProfileMenuButton';
import { SoundToggleButton } from '@/components/game/home/SoundToggleButton';
import { WalletBalanceBadge } from '@/components/game/home/WalletBalanceBadge';

export const GameHeader = (props: {
  balance: number;
  currency: string;
  avatar: React.ReactNode;
  isDemo?: boolean;
  onOpenProfile?: () => void;
}) => (
  <header className="container mx-auto flex h-[calc(var(--hud-h)+env(safe-area-inset-top))] shrink-0 items-center justify-between gap-2 px-3 pt-[env(safe-area-inset-top)] md:h-[10dvh] md:flex-wrap md:gap-4 md:px-4 md:pt-0">
    <div className="flex items-center gap-2">
      <GameLogo />
      {props.isDemo && <DemoBadge />}
    </div>
    <div className="ml-auto flex items-center gap-2 md:gap-3">
      <SoundToggleButton />
      <WalletBalanceBadge amount={props.balance} currency={props.currency} />
      <ProfileMenuButton avatar={props.avatar} onClick={props.onOpenProfile} />
    </div>
  </header>
);
