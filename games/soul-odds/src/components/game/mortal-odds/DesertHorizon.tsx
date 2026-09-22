const DESERT_RUINS = "url('/img/desert-ruins.png')";

export const DesertHorizon = () => (
  <div className="pointer-events-none fixed inset-x-0 bottom-0 z-0 select-none" aria-hidden="true">
    <div
      className="absolute inset-x-0 bottom-0 h-[62dvh] opacity-70"
      style={{
        backgroundImage: DESERT_RUINS,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "bottom center",
        backgroundSize: "cover",
        filter: "brightness(0.7) saturate(0.9)",
      }}
    />
    <div className="absolute inset-x-0 bottom-0 h-[62dvh] bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
  </div>
);
