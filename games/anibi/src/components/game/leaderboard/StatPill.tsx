import type { ReactNode } from "react";
<<<<<<< HEAD
import { cn } from "@/utils";
=======
>>>>>>> aa77441 (changes)

interface StatPillProps {
  title: string;
  icon: ReactNode;
  count: string | number;
<<<<<<< HEAD
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
=======
}

export function StatPill({ title, icon, count }: StatPillProps) {
  return (
    <div className="green-gradient-shine py-4 px-3 rounded-lg h-full">
      <h3 className="text-[0.8rem] font-[500] mb-[6px] leading-[1.8] text-[#AFAFAF] tracking-[-0.14px]">
        {title}
      </h3>
      <div className="text-base font-[700] flex items-center">
>>>>>>> aa77441 (changes)
        <span className="mr-2">{icon}</span> {count}
      </div>
    </div>
  );
}