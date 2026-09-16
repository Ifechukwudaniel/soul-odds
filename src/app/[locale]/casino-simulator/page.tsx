'use client';

import dynamic from 'next/dynamic';

// Browser-only harness: touches localStorage/window on first render, so it
// must never run during SSR.
const CasinoSimulatorApp = dynamic(
  async () => await import('@/components/casino-simulator/App').then((mod) => mod.App),
  { ssr: false },
);

export default function CasinoSimulatorPage() {
  return <CasinoSimulatorApp />;
}
