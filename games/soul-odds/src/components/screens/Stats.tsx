import numeral from 'numeral';
import React, { useEffect, useState } from 'react';
import { RefeshInterval } from '@/constants/app';
import { getStats } from '@/services/data/stats';
import { CrownIcon } from '../assets/CrownIcon';
import { DoubleCoinIcon } from '../assets/DoubleCoinIcon';
import { Loader } from '../Loader';
import { StatsCard } from '../soulodds/StatsCard';

type StatsCardList = {
  title: string;
  icon?: React.ReactNode;
  count: string;
};

const initialStatsCardLists: StatsCardList[] = [
  {
    title: 'Total Share Balance',
    icon: <DoubleCoinIcon width="17" height="16" />,
    count: 'Loading...',
  },
  {
    title: 'Total Players',
    icon: <CrownIcon />,
    count: 'Loading...',
  },
];

const fetchStats = async (): Promise<StatsCardList[]> => {
  try {
    const stats = await getStats();
    return [
      {
        title: 'Total Share Balance',
        icon: <DoubleCoinIcon width="17" height="16" />,
        count: numeral(stats.totalTokens).format('O.Oa'),
      },
      {
        title: 'Total Players',
        icon: <CrownIcon />,
        count: stats.totalUsers.toLocaleString(),
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
    const interval = setInterval(
      async () => setStatsCardLists(await fetchStats()),
      RefeshInterval * 10,
    );

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
    return <Loader className="h-full" />;
  }

  return (
    <section className="flex h-screen flex-col overflow-hidden">
      <div className="container mx-auto my-5 px-4">
        <h2 className="mb-3 text-2xl font-bold tracking-tight">Statistics</h2>
        <p className="my-3 text-sm font-medium text-white">This are our application stats</p>
        <div className="my-5 h-px w-full bg-gray-800" />
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
