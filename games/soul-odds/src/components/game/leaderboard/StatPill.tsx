import type { ReactNode } from 'react';

interface StatPillProps {
  title: string;
  icon: ReactNode;
  count: string | number;
}

export function StatPill({ title, icon, count }: StatPillProps) {
  return (
    <div className="green-gradient-shine h-full rounded-lg px-3 py-4">
      <h3 className="mb-[6px] text-[0.8rem] leading-[1.8] font-[500] tracking-[-0.14px] text-[#AFAFAF]">
        {title}
      </h3>
      <div className="flex items-center text-base font-[700]">
        <span className="mr-2">{icon}</span> {count}
      </div>
    </div>
  );
}
