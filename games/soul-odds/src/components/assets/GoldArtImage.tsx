import Image from 'next/image';
import type { StaticImageData } from 'next/image';

/**
 * A gold-artwork PNG re-tinted to the brand gold gradient (cream, gold, bronze, left to right). The
 * artwork keeps its own shading and texture: a gentle filter softens it, one masked layer imposes the
 * gradient's hue, and another its lightness sweep. Both layers use the image as their mask, so the
 * tint never spills onto transparent areas. Positioned by `className`; give it an `absolute` box.
 */
export const GoldArtImage = (props: {
  src: StaticImageData;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) => {
  // ✦ Both prefixed and standard forms are set: Safari only honours -webkit-mask-image.
  const mask = { maskImage: `url(${props.src.src})`, WebkitMaskImage: `url(${props.src.src})` };

  return (
    <span className={`gold-art ${props.className ?? ''}`}>
      <Image
        src={props.src}
        alt={props.alt}
        sizes={props.sizes}
        priority={props.priority}
        className="gold-art-img size-full max-w-none select-none"
      />
      <span aria-hidden="true" className="gold-art-layer gold-art-hue" style={mask} />
      <span aria-hidden="true" className="gold-art-layer gold-art-light" style={mask} />
    </span>
  );
};
