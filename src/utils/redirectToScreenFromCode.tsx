// qrHandler.ts
import { NextRouter } from "next/router";
import { TScreenPayload, TScreens } from "@/services/store/store";
import { notification } from "./notifications";

// ToDo. Notification not working on external scanner / direct # url
export const redirectToScreenFromCode = (
  code: string,
  setScreen: (action: TScreens, payload?: TScreenPayload | null | undefined) => void,
  router: NextRouter,
  reload = true,
) => {
  // Remove liveUrl from the result
  const [action, payload] = code.split("#");

  switch (action) {
    case "home":
      setScreen("home");
      break;
    case "badges":
      setScreen("badges");
      break;
    case "stats":
       setScreen("stats")
       break;
    case "quest":
      setScreen("quests")
      break;
    case "refs":
       setScreen("refs")
       break;
    default:
      notification.error(`Unknown QR ${action}`);
  }
};