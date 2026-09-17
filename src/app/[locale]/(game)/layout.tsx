import type { Viewport } from "next";
import Script from "next/script";
import { GameProviders } from "@/components/provider/GameProviders";
import "@/styles/globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function GameLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
      <Script id="prevent-pinch-zoom" strategy="afterInteractive">
        {`
          document.addEventListener('touchmove', function (event) {
            if (event.scale !== 1) { event.preventDefault(); }
          }, { passive: false });
        `}
      </Script>
      <GameProviders>{props.children}</GameProviders>
    </>
  );
}
