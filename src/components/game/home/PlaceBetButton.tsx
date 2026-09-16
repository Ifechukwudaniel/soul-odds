export const PlaceBetButton = (props: { label: string; onClick?: () => void }) => (
  <button
    type="button"
    onClick={props.onClick}
    className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 font-bold text-slate-950 hover:bg-white/90 cursor-pointer"
  >
    {props.label}
    <span>→</span>
  </button>
);
