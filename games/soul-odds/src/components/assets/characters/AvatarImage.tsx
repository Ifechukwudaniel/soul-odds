import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import type { IconProps } from '@/types/icontypes';

const DEFAULT_SIZE = 32;

function toSize(value: string | number | undefined): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SIZE;
}

/**
 * A character drawn from a PNG, fitted into the square every avatar slot gives it. Unlike the
 * square Skull artwork these are tall or wide cut-outs, so they are cropped (`object-cover`, held on
 * the face) or shrunk to fit (`fit: 'contain'`) instead of being stretched.
 */
export const AvatarImage = (
  props: IconProps & {
    src: StaticImageData;
    alt: string;
    /** CSS object-position of the crop, e.g. `50% 8%` to hold the top of a tall image. */
    focus?: string;
    /** `contain` shows the whole picture with a little breathing room; `cover` fills the circle. */
    fit?: 'cover' | 'contain';
    /** Painted behind the cut-out, for artwork too dark to read on the avatar's dark frame. */
    backdrop?: string;
  },
) => {
  const size = toSize(props.width ?? props.height);
  const contain = props.fit === 'contain';

  return (
    <Image
      src={props.src}
      alt={props.alt}
      width={size}
      height={size}
      // ✦ aspect-square: the global `img { height: auto }` would otherwise size a tall picture by its own shape.
      className={`${props.className ?? ''} aspect-square ${contain ? 'scale-90 object-contain' : 'object-cover'} rounded-full`}
      style={{ objectPosition: props.focus, background: props.backdrop }}
      priority
    />
  );
};
