'use client';

import dynamic from 'next/dynamic';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/700-italic.css';
import '@fontsource/poppins/800.css';
import '@fontsource/poppins/800-italic.css';
import '@fontsource/poppins/900.css';
import '@fontsource/rubik/400.css';
import '@fontsource/rubik/500.css';
import '@/components/casino-coinflip/styles/index.css';

// Guest-side game UI: connects to the host iframe bridge on mount, so it must
// never run during SSR.
const CoinflipApp = dynamic(
  async () => await import('@/components/casino-coinflip/App').then((mod) => mod.App),
  { ssr: false },
);

export default function CoinflipGamePage() {
  return <CoinflipApp />;
}
