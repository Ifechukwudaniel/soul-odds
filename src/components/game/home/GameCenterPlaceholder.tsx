/** Reserves the space where the actual game will render — the game itself hasn't been decided yet. */
export const GameCenterPlaceholder = () => (
  <div className="flex min-h-80 w-full flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 text-white/40">
    <p className="font-bold">Game area</p>
    <p className="text-sm">The puzzle/game mechanic goes here once it's decided.</p>
  </div>
);
