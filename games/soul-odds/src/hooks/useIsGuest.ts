"use client";

import { useEffect, useState } from "react";
import { isStandalone } from "@/lib/demo-host";

/** True when the game runs outside the casino host, where the wallet is one generated for this browser rather than the player's own. */
export function useIsGuest(): boolean {
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    setGuest(isStandalone());
  }, []);

  return guest;
}
