import Image from 'next/image';

/** Anubis-and-obelisks art pinned to the top of a `relative isolate` card, fading out towards the bottom. */
export const AnubisBackdrop = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-2/3 max-h-128 mask-[linear-gradient(to_bottom,black_35%,transparent)]"
  >
    <Image
      src="/img/annibals.png"
      alt=""
      fill
      sizes="(min-width: 768px) 600px, 100vw"
      className="-translate-y-4 object-cover object-top-left opacity-80"
    />
  </div>
);
