/** Emoji stand-in for an icon/image asset that hasn't been designed yet — swap the emoji for a real icon or `next/image` later. */
export const PlaceholderIcon = (props: { emoji: string; className?: string }) => (
  <span
    className={`inline-flex items-center justify-center rounded-full bg-white/10 leading-none ${props.className ?? 'h-6 w-6 text-sm'}`}
  >
    {props.emoji}
  </span>
);
