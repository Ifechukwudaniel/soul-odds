import Image from 'next/image';
import buttonFrame from '@/public/img/button-frame.png';
import { serifFont } from '@/styles/serif-font';

// ✦ The PNG is 790×316 with transparent padding above and below the plaque (rows 63–236 hold it), so
//   the box is cropped to the plaque's own 790×174 and the image is shifted up to match.
//   The two wing ornaments leave a clear gap between x≈190 and x≈600, which is where the label goes.

/** The gold plaque button face: the frame art with the label centred between its two wings. */
export const ButtonDemo = (props: { label?: string }) => (
  <span className="@container relative block aspect-790/174 w-[340px] max-w-full overflow-hidden">
    <Image
      src={buttonFrame}
      alt=""
      priority
      sizes="340px"
      className="absolute top-[-36.2%] left-0 h-[181.6%] w-full max-w-none select-none"
    />
    <span
      className={`${serifFont.className} absolute inset-y-0 right-[24%] left-[24%] flex items-center justify-center text-[4.8cqw] leading-none font-bold tracking-[0.05em] whitespace-nowrap text-[#3a2708] uppercase [text-shadow:0_1px_0_rgba(255,236,170,0.55)]`}
    >
      {props.label ?? 'Summon a soul'}
    </span>
  </span>
);
