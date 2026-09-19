import type { ReactNode } from "react";
import { cn } from "@/utils";

interface StatPillProps {
  title: string;
  icon: ReactNode;
  count: string | number;
  align?: "left" | "center";
  className?: string;
}

export function StatPill({ title, icon, count, align = "left", className }: StatPillProps) {
  const centered = align === "center";

  return (
    <div className={cn(" py-4 px-3 rounded-lg h-full", className)}>
      <h3
        className={cn(
          "text-[0.8rem] font-[500] mb-[6px] leading-[1.8] text-[#AFAFAF] tracking-[-0.14px]",
          centered && "text-center"
        )}
      >
        {title}
      </h3>
      <div
        className={cn(
          "text-base font-[700] flex items-center",
          centered && "justify-center"
        )}
      >
        <span className="mr-2">{icon}</span> {count}
      </div>
    </div>
  );
}