"use client";

import { useEffect, useState } from "react";
import type { SetStateAction } from "react";
import { formatUnits } from "viem";
import { getAvatarById } from "@/components/assets/characters/avatars";
import { GameHeader } from "@/components/game/home/GameHeader";
import { ProfileModal } from "@/components/game/home/profile/ProfileModal";
import { Menubar } from "@/components/Menubar";
import { Scroller } from "@/components/Scroller";
import { useCasinoHostContext } from "@/components/provider/AppWalletProvider";
import {
  BadgesScreen,
  BoostScreen,
  ConnectQuestScreen,
  HomeScreen,
  QuestScreen,
  RefsScreen,
  SocialQuestScreen,
  StatsScreen,
  RankScreen
} from "@/components/screens";
import { useMortalOddsPlayer } from "@/hooks/useMortalOddsPlayer";
import { badgesLists } from "@/services/data/badgeData";
import { socketInstance } from "@/services/socket";
import { useAppStore } from "@/services/store/store";
import { formatAddress } from "@/utils";
import { notification } from "@/utils/notifications";

export default function GamePage() {
  const [, setIsConnected] = useState(false);
  const [, setTransport] = useState("N/A");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const screen = useAppStore((state) => state.screen);
  const setScreen = useAppStore((state) => state.setScreen);
  const updateUser = useAppStore((state) => state.updateUser);
  const user = useAppStore((state) => state.user);
  const player = useMortalOddsPlayer();
  const { snapshot } = useCasinoHostContext();

  console.log(snapshot, "snap")

  const screens = {
    badges: <BadgesScreen />,
    boost: <BoostScreen />,
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
    formatUnits(BigInt(snapshot?.balances.smartVaultBalance ?? "0"), snapshot?.token.decimals ?? 18),
  );

  /** Mirrors the host's real balance into the store; only reruns when the host's own number changes. */
  useEffect(() => {
    updateUser({ balance: hostBalance });
  }, [hostBalance, updateUser]);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setTransport(socketInstance.io.engine.transport.name);
      socketInstance.io.engine.on("upgrade", (transport: { name: SetStateAction<string> }) => {
        setTransport(transport.name);
      });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setTransport("N/A");
      notification.error("Disconnected", { duration: 30000 });
    };

    if (socketInstance.connected) handleConnect();

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);

    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
    };
  }, []);

  const AvatarIcon = getAvatarById(user.avatarId).Icon;
  const displayName = user.username || formatAddress(user.address);
  // `user.rank` is the index of the highest coin-tier badge claimed, not the display label.
  const rankTitle = badgesLists[user.rank]?.title ?? badgesLists[0]!.title;

  return (
    <div className="flex h-screen w-full flex-col">
      <GameHeader
        balance={user.balance}
        currency={snapshot?.token.symbol ?? "deben"}
        avatar={<AvatarIcon width={24} height="24" />}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <Scroller className="min-h-0 flex-1">{screenRender}</Scroller>
      <div className="container mx-auto px-6">
        <Menubar />
      </div>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        username={displayName}
        handle={displayName}
        rank={rankTitle}
        leaderboardRank={42881}
        onViewRankPage={() => setScreen("ranks")}
      />
    </div>
  );
}
