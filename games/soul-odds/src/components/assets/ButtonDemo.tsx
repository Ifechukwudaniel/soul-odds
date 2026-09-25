import { GoldArtImage } from '@/components/assets/GoldArtImage';
import buttonFrame from '@/public/img/button-frame.png';
import { serifFont } from '@/styles/serif-font';

// ✦ The PNG is 790×316 with transparent padding above and below the plaque (rows 63–236 hold it), so
//   the box is cropped to the plaque's own 790×174 and the image is shifted up to match.
//   The two wing ornaments leave a clear gap between x≈190 and x≈600, which is where the label goes.

/**
 * The gold plaque button face: the frame art with the label centred between its two wings.
 *
 * Sized by percentage padding and drawn with an SVG label, not `aspect-ratio` and container query
 * units: iOS Safari collapses the former inside a `<button>`, which left the plaque squashed with
 * its label riding the top edge. Fill the parent's width; the height follows.
 */
export const ButtonDemo = (props: { label?: string }) => (
  <span className="relative block w-full overflow-hidden">
    {/* ✦ 174 / 790: the plaque's own height over its width. Percentage padding is relative to width. */}
    <span aria-hidden="true" className="block pb-[22.025%]" />
    <GoldArtImage
      src={buttonFrame}
      alt=""
      priority
      sizes="380px"
      className="absolute top-[-36.2%] left-0 h-[181.6%] w-full"
    />
    {/* ✦ A 790 x 174 drawing space, so the label scales with the plaque. The wings leave a clear gap from x 190 to 600. */}
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 790 174"
      className={`${serifFont.className} pointer-events-none absolute inset-0 size-full`}
    >
      <text
        x="395"
        y="88.5"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="38"
        fontWeight="700"
        letterSpacing="2"
        fill="rgba(255,236,170,0.55)"
      >
        {(props.label ?? 'Summon a soul').toUpperCase()}
      </text>
      <text
        x="395"
        y="87"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="38"
        fontWeight="700"
        letterSpacing="2"
        fill="#3a2708"
      >
        {(props.label ?? 'Summon a soul').toUpperCase()}
      </text>
    </svg>
  </span>
);
