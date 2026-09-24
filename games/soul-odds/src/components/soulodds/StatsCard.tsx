import React from 'react';

type StatsCardProps = {
  title: string;
  count: string;
  icon?: React.ReactNode;
};

export const StatsCard: React.FC<StatsCardProps> = ({ title, icon, count }) => {
  return (
    <div className="green-gradient-shine h-full rounded-lg px-3 py-4">
      <h3 className="mb-[6px] text-[0.8rem] leading-[1.8] font-[500] tracking-[-0.14px] text-[#AFAFAF]">
        {title}
      </h3>
      <div className={`flex items-center text-base font-[700]`}>
        <span className="mr-2">{icon}</span> {count}
      </div>
    </div>
  );
};
