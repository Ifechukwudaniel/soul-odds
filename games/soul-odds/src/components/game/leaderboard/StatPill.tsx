import type { ReactNode } from "react";

interface StatPillProps {
  title: string;
  icon: ReactNode;
  count: string | number;
}

export function StatPill({ title, icon, count }: StatPillProps) {
  return (
    <div className="green-gradient-shine py-4 px-3 rounded-lg h-full">
      <h3 className="text-[0.8rem] font-[500] mb-[6px] leading-[1.8] text-[#AFAFAF] tracking-[-0.14px]">
        {title}
      </h3>
      <div className="text-base font-[700] flex items-center">
        <span className="mr-2">{icon}</span> {count}
      </div>
    </div>
  );
}