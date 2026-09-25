'use client';

import { useEffect, useRef, useState } from 'react';
import type { SetStateAction } from 'react';
import { formatUnits } from 'viem';
import {
  DEFAULT_AVATAR_ID,
  getAvatarById,
  LEGACY_DEFAULT_AVATAR_ID,
} from '@/components/assets/characters/avatars';
import { GameHeader } from '@/components/game/home/GameHeader';
import { FirstVisitHowItWorks } from '@/components/game/HowItWorksDialog';
import { ProfileModal } from '@/components/game/home/profile/ProfileModal';
import { Menubar } from '@/components/Menubar';
import { useCasinoHostContext } from '@/components/provider/AppWalletProvider';
import {
  BadgesScreen,
  badgesLists,
  BetHistoryScreen,
  ConnectQuestScreen,
  HomeScreen,
  QuestScreen,
  RefsScreen,
  SocialQuestScreen,
  StatsScreen,
  RankScreen,
} from '@/components/screens';
import { Scroller } from '@/components/Scroller';
import { useIsGuest } from '@/hooks/useIsGuest';
import { useMortalOddsPlayer } from '@/hooks/useMortalOddsPlayer';
import { getUser, registerUser, setUserAvatar } from '@/services/data/user';
import { socketInstance } from '@/services/socket';
import { useAppStore } from '@/services/store/store';
import { formatAddress } from '@/utils';
import { notification } from '@/utils/notifications';

export default function GamePage() {
  const [, setIsConnected] = useState(false);
  const [, setTransport] = useState('N/A');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isGuest = useIsGuest();
  const screen = useAppStore((state) => state.screen);
  const setScreen = useAppStore((state) => state.setScreen);
  const updateUser = useAppStore((state) => state.updateUser);
  const user = useAppStore((state) => state.user);
  const player = useMortalOddsPlayer();
  const { snapshot } = useCasinoHostContext();

  console.log(snapshot, 'snap');

  const screens = {
    badges: <BadgesScreen />,
    history: <BetHistoryScreen />,
    home: <HomeScreen player={player} />,
    refs: <RefsScreen />,
    stats: <StatsScreen />,
    quests: <QuestScreen />,
    social: <SocialQuestScreen />,
    wallet: <ConnectQuestScreen />,
    ranks: <RankScreen />,
  };

  const screenRender = screens[screen];

  const hostBalance = Number(
    formatUnits(
      BigInt(snapshot?.balances.smartVaultBalance ?? '0'),
      snapshot?.token.decimals ?? 18,
    ),
  );

  /** Mirrors the host's real balance into the store; only reruns when the host's own number changes. */
  useEffect(() => {
    updateUser({ balance: hostBalance });
  }, [hostBalance, updateUser]);

  const walletAddress = snapshot?.wallet.address;
  const syncedAddressRef = useRef<string | undefined>(undefined);

  /**
   * Registers the connected wallet as a user and re-syncs its balance on every login, once per
   * address per app entry.
   */
  useEffect(() => {
    if (!walletAddress || syncedAddressRef.current === walletAddress) return;
    syncedAddressRef.current = walletAddress;
    updateUser({ address: walletAddress });
    // ✦ Invite links carry `?ref=<inviter's address>`; only a new user's first registration records
    //   it.
    const referrer = new URLSearchParams(window.location.search).get('ref') ?? undefined;
    registerUser(walletAddress, referrer, hostBalance)
      .then(() => getUser(walletAddress))
      .then((dbUser) => {
        // ✦ The saved avatar wins so it follows the player across devices. With none saved yet, a
        //   deliberate local pick is pushed up so the leaderboard shows the same face; the old default
        //   is not a pick, so it moves to the new default and nothing is saved (the leaderboard shows
        //   the default for anyone with none).
        if (dbUser.avatarId) {
          updateUser({ freeRedraws: dbUser.freeRedraws, avatarId: dbUser.avatarId });
          return;
        }
        const localAvatarId = useAppStore.getState().user.avatarId;
        if (localAvatarId === LEGACY_DEFAULT_AVATAR_ID) {
          updateUser({ freeRedraws: dbUser.freeRedraws, avatarId: DEFAULT_AVATAR_ID });
          return;
        }
        updateUser({ freeRedraws: dbUser.freeRedraws });
        return setUserAvatar(walletAddress, localAvatarId);
      })
      .catch(() => {
        // ✦ Already logged in by the data layer; a failed sync just leaves free redraws and the avatar at their last known values.
      });
  }, [walletAddress, hostBalance, updateUser]);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setTransport(socketInstance.io.engine.transport.name);
      socketInstance.io.engine.on('upgrade', (transport: { name: SetStateAction<string> }) => {
        setTransport(transport.name);
      });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setTransport('N/A');
      notification.error('Disconnected', { duration: 30000 });
    };

    if (socketInstance.connected) handleConnect();

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);

    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
    };
  }, []);

  const AvatarIcon = getAvatarById(user.avatarId).Icon;
  const displayName = user.username || formatAddress(user.address);
  // ✦ `user.rank` is the index of the highest coin-tier badge claimed, not the display label.
  const rankTitle = badgesLists[user.rank]?.title ?? badgesLists[0]!.title;

  return (
    <div className="flex h-dvh w-full flex-col">
      <GameHeader
        balance={user.balance}
        currency={snapshot?.token.symbol ?? 'chUSD'}
        avatar={<AvatarIcon width={24} height="24" />}
        isDemo={isGuest}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <Scroller className="min-h-0 flex-1 max-md:relative max-md:z-20">{screenRender}</Scroller>
      <div className="container mx-auto px-6 max-md:px-3">
        <Menubar />
      </div>

      {/* ✦ Only for a brand-new player on the home screen: nothing played on this device (no rounds, no skill points). */}
      <FirstVisitHowItWorks
        eligible={screen === 'home' && player.stats.rounds === 0 && user.skill === 0}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        username={displayName}
        handle={displayName}
        rank={rankTitle}
        onViewRankPage={() => setScreen('ranks')}
      />
    </div>
  );
}
