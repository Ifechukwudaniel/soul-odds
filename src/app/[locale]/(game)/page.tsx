"use client";

import { useEffect, useState } from "react";
import type { SetStateAction } from "react";
import toost from "react-hot-toast";
import { Slime } from "@/components/assets/characters/Slime";
import { DevLogin } from "@/components/DevLogin";
import { GameHeader } from "@/components/game/home/GameHeader";
import { ProfileModal } from "@/components/game/home/profile/ProfileModal";
import { Loader } from "@/components/Loader";
import { Menubar } from "@/components/Menubar";
import {
  BadgesScreen,
  BoostScreen,
  ConnectQuestScreen,
  HomeScreen,
  QuestScreen,
  RefsScreen,
  SocialQuestScreen,
  StatsScreen,
} from "@/components/screens";
import { ONE_SECOND } from "@/constants";
import { useMortalOddsPlayer } from "@/hooks/useMortalOddsPlayer";
import { getFreeBoost, getNoLevelBoost, getPayedBoost } from "@/services/data/boost";
import type { Boost } from "@/services/db/boost";
import { getUser } from "@/services/data/user";
import { socketInstance } from "@/services/socket";
import { type TBoost, type TUser, useAppStore } from "@/services/store/store";

function normalizeBoost(boost: Boost): TBoost {
  return {
    type: boost.type,
    boostId: boost.boostId,
    userId: boost.userId,
    cost: boost.cost ?? undefined,
    lastUsed: boost.lastUsed ?? undefined,
    left: boost.left ?? undefined,
    level: boost.level ?? undefined,
    maximumLevel: boost.maximumLevel ?? undefined,
    totalPerDay: boost.totalPerDay ?? undefined,
  };
}
import { checkIfMoreThanADay } from "@/utils";
import { notification } from "@/utils/notifications";

export default function GamePage() {
  const [, setIsConnected] = useState(false);
  const [, setTransport] = useState("N/A");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const screen = useAppStore((state) => state.screen);
  const setScreen = useAppStore((state) => state.setScreen);
  const setUser = useAppStore((state) => state.updateUser);
  const setPaidBoosts = useAppStore((state) => state.setPaidBoosts);
  const setFreeBoosts = useAppStore((state) => state.setFreeBoosts);
  const updateEnergyByTime = useAppStore((state) => state.updateEnergyByTime);
  const [foundState, setFoundState] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const state = useAppStore((state) => state);
  const freeBoost = useAppStore((state) => state.freeBoosts);
  const player = useMortalOddsPlayer();

  const screens = {
    badges: <BadgesScreen />,
    boost: <BoostScreen />,
    home: <HomeScreen player={player} />,
    refs: <RefsScreen />,
    stats: <StatsScreen />,
    quests: <QuestScreen />,
    social: <SocialQuestScreen />,
    wallet: <ConnectQuestScreen />,
  };

  const screenRender = screens[screen];

  const setUpState = (id: number) => {
    setLoginLoading(true);
    setLoginError(null);
    socketInstance.emit("login", id);
    Promise.all([getUser(id), getFreeBoost(id), getPayedBoost(id), getNoLevelBoost(id)])
      .then(([user, freeBoost, payedBoost, noLevelBoost]) => {
        if (!user) {
          setLoginLoading(false);
          setLoginError("User not found. Try a different ID.");
          setNeedsLogin(true);
          return;
        }
        setUser({
          ...user,
          connectionId: user.connectionId ?? undefined,
        });
        setPaidBoosts([...payedBoost, ...noLevelBoost].map(normalizeBoost));
        setFreeBoosts(freeBoost.map(normalizeBoost));
        setNeedsLogin(false);
        setLoginLoading(false);
        localStorage.setItem("user_id", String(id));
        setFoundState(true);
      })
      .catch(() => {
        setLoginLoading(false);
        setLoginError("Error occurred. Try again.");
        setNeedsLogin(true);
        toost.error("Error occurred");
      });
  };

  useEffect(() => {
    if (freeBoost.length > 0) {
      const boostData = freeBoost.map((boost) => {
        if (checkIfMoreThanADay(boost.lastUsed!)) {
          return { ...boost, left: boost.totalPerDay };
        }
        return boost;
      });
      setFreeBoosts(boostData);
    }
  }, []);

  useEffect(() => {
    if (state.hasData) {
      setFoundState(true);
    } else {
      const savedUserId = localStorage.getItem("user_id");
      if (savedUserId) {
        setUpState(Number(savedUserId));
      } else {
        setNeedsLogin(true);
      }
    }

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

  useEffect(() => {
    const interval = setInterval(updateEnergyByTime, ONE_SECOND * 2);
    return () => clearInterval(interval);
  }, [updateEnergyByTime]);

  if (needsLogin) {
    return <DevLogin onSubmit={setUpState} loading={loginLoading} error={loginError} />;
  }

  if (!foundState) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col">
      <GameHeader
        balance={player.stats.bankroll}
        currency="deben"
        avatar={<Slime width={24} height="24" />}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">{screenRender}</div>

      <div className="container mx-auto px-6">
        <Menubar />
      </div>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        username="ceeriil"
        handle="ceeriil"
        rank="Silver"
        leaderboardRank={42881}
        onViewRankPage={() => setScreen("badges")}
      />
    </div>
  );
}
