/**
 * Defines the gold gradient once so icons can use it: react-icons are plain SVG paths, so text
 * gradients (`background-clip: text`) can't reach them, but an SVG `fill` can point at this. Use the
 * `gold-icon` class (or `gold-icon-stroke` for outline icons). Mount it once, near the app root.
 */
export const GoldGradientDefs = () => (
  // ✦ Sized 0×0, not display: none, because some browsers drop gradients referenced from a hidden svg.
  <svg aria-hidden="true" focusable="false" width="0" height="0" className="absolute">
    <defs>
      {/* ✦ Same stops as .gold-text-2 in globals.css, left to right. Keep the two in step. */}
      <linearGradient id="gold-icon-gradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#FFEDCE" />
        <stop offset="0.41" stopColor="#F0C868" />
        <stop offset="0.75" stopColor="#D09A5D" />
        <stop offset="0.96" stopColor="#E5B864" />
      </linearGradient>
    </defs>
  </svg>
);
