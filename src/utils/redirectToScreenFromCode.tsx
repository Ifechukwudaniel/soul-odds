// qrHandler.ts
import { TScreenPayload, TScreens } from "@/services/store/store";
import { notification } from "./notifications";

// ToDo. Notification not working on external scanner / direct # url
export const redirectToScreenFromCode = (
  code: string,
  setScreen: (action: TScreens, payload?: TScreenPayload | null | undefined) => void,
) => {
  // Remove liveUrl from the result
  const [action] = code.split("#");

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
    case "ranks":
        setScreen("ranks")
        break;
    default:
      notification.error(`Unknown QR ${action}`);
  }
};
