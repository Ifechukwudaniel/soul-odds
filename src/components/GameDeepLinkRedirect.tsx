"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "@/libs/I18nNavigation";
import { redirectToScreenFromCode } from "@/utils/redirectToScreenFromCode";
import { useAppStore } from "@/services/store/store";

/** Sets the requested screen from a `/game/<code>` deep link, then redirects to the game home. */
export const GameDeepLinkRedirect = () => {
  const router = useRouter();
  const pathname = usePathname();
  const setScreen = useAppStore((state) => state.setScreen);

  useEffect(() => {
    const code = pathname.replace(/^\/game\/?/, "");
    redirectToScreenFromCode(code, setScreen);
    router.push("/game");
  }, [pathname, router, setScreen]);

  return null;
};
