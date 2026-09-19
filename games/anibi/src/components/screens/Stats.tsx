import React, { useEffect, useState } from "react";
import { Loader } from "../Loader";
import { CrownIcon } from "../assets/CrownIcon";
import { DoubleCoinIcon } from "../assets/DoubleCoinIcon";
import { HeartIcon } from "../assets/Hearticon";
import { TimerIcon } from "../assets/TimerIcon";
import { StatsCard } from "../touchswap/StatsCard";
import { RefeshInterval } from "@/constants";
import { getStats } from "@/services/data/stats";
import numeral from "numeral";

type StatsCardList = {
  title: string;
  icon?: React.ReactNode;
  count: string;
};

const initialStatsCardLists: StatsCardList[] = [
  {
    title: "Total Share Balance",
    icon: <DoubleCoinIcon width="17" height="16" />,
    count: "Loading...",
  },
  {
    title: "Total Touches",
    icon: <TimerIcon />,
    count: "Loading...",
  },
  {
    title: "Total Players",
    icon: <CrownIcon />,
    count: "Loading...",
  },
  {
    title: "Daily Users",
    icon: <HeartIcon />,
    count: "Loading...",
  },
  {
    title: "Online Players",
    icon: <HeartIcon />,
    count: "Loading...",
  },
];

const fetchStats = async (): Promise<StatsCardList[]> => {
  try {
    const stats = await getStats();
    return [
      {
        title: "Total Share Balance",
        icon: <DoubleCoinIcon width="17" height="16" />,
        count: numeral(stats.totalTokens).format("O.Oa"),
      },
      {
        title: "Total Touches",
        icon: <TimerIcon />,
        count: stats.totalTouches.toLocaleString(),
      },
      {
        title: "Total Players",
        icon: <CrownIcon />,
        count: stats.totalUsers.toLocaleString(),
      },
      {
        title: "Daily Users",
        icon: <HeartIcon />,
        count: stats.totalDailyUsers.toLocaleString(),
      }, 
    ];
  } catch {
    return initialStatsCardLists;
  }
};

export const StatsScreen = () => {
  const [statsCardLists, setStatsCardLists] = useState<StatsCardList[]>(initialStatsCardLists);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const interval = setInterval(async () => setStatsCardLists(await fetchStats()), RefeshInterval * 10);

    if (loading) {
      setTimeout(async () => {
        const statsData = await fetchStats();
        setLoading(false);
        setStatsCardLists(statsData);
      }, 500);
    }
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="flex flex-col h-screen justify-center items-center">
        <Loader />
      </section>
    );
  }

  return (
    <section className="flex flex-col h-screen overflow-hidden">
      <div className="container mx-auto px-4 my-5">
        <h2 className="text-2xl font-bold mb-3 tracking-tight">Statistics</h2>
        <p className="text-sm text-white my-3 font-medium">
          This are our application stats
        </p>
        <div className="bg-gray-800 h-px w-full my-5" />
        <div className="mt-3">
          <div className="grid grid-cols-2 gap-2">
            {statsCardLists.map(({ title, icon, count }, index) => (
              <StatsCard title={title} key={index} icon={icon} count={count} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
