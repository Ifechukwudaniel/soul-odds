import type { Price } from "@/types";

export const PayoutLabel = (props: { price: Price | undefined; chipSize: number }) => {
  if (!props.price || props.price.odds === null) {
    return <span className="text-white/40 text-xs">Closed</span>;
  }

  return (
    <span className="flex flex-col items-end gap-0.5">
      <span className="text-white/50 text-xs">{props.price.tag}</span>
      <span className="font-bold text-[#9181F0] text-sm">Win {(props.chipSize * props.price.odds).toFixed(2)}</span>
    </span>
  );
};
