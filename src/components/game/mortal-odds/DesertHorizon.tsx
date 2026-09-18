const SAND_MOUNTAINS = "url('/egypt/Bg/SandMountains_Bg.png')";

export const DesertHorizon = () => (
  <div className="pointer-events-none fixed inset-x-0 bottom-0 z-0 select-none" aria-hidden="true">
    <div
      className="absolute inset-x-0 bottom-0 h-[42dvh] opacity-5"
      style={{
        backgroundImage: SAND_MOUNTAINS,
        backgroundRepeat: "repeat-x",
        backgroundPosition: "bottom left 38%",
        backgroundSize: "auto 82%",
        imageRendering: "pixelated",
        filter: "blur(1px) saturate(0.8)",
      }}
    />
    <div
      className="absolute inset-x-0 bottom-0 h-[46dvh] opacity-20"
      style={{
        backgroundImage: SAND_MOUNTAINS,
        backgroundRepeat: "repeat-x",
        backgroundPosition: "bottom left",
        backgroundSize: "auto 100%",
        imageRendering: "pixelated",
      }}
    />
    <div className="absolute inset-x-0 bottom-0 h-[54dvh] bg-gradient-to-t from-[#c9822c]/18 via-[#8a5f1f]/6 to-transparent" />
  </div>
);
