import { ProfileMenuItem } from "@/components/game/home/profile/ProfileMenuItem";
import type { ProfileMenuAction } from "@/components/game/home/profile/types";

export const ProfileMenuList = (props: { actions: ProfileMenuAction[] }) => (
  <div className="flex flex-col gap-2">
    {props.actions.map((action) => (
      <ProfileMenuItem key={action.id} {...action} />
    ))}
  </div>
);
