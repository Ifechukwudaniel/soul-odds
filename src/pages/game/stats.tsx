import { useAppStore } from "@/services/store/store";
import { redirectToScreenFromCode } from "@/utils/redirectToScreenFromCode";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Stats() {
  const router = useRouter();
  const setScreen = useAppStore(state => state.setScreen);

  useEffect(() => {
    const code = router.asPath.replace(/^\/game\/?/, "");
    redirectToScreenFromCode(code, setScreen, router);
    router.push("/game");
  }, [router, setScreen, router.asPath, router.push]);

  return null; 
}
