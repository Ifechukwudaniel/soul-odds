import { formatAddress } from "@/utils";

/** Tells a player on a generated wallet what that means, since their account lives only in this browser. */
export const GuestNotice = (props: { address: string; onDismiss: () => void }) => (
  <div role="status" className="mx-4 mb-2 flex items-start gap-3 rounded bg-[#81DBE233] px-4 py-3 text-[0.8rem] leading-[1.6]">
    <p className="flex-1">
      <span className="font-[600]">Guest account.</span> This wallet{props.address ? ` (${formatAddress(props.address)})` : ""} was created for this browser and your
      balance is play money. If you clear your browser data you lose this account, your rank and your referrals.
    </p>
    <button type="button" onClick={props.onDismiss} className="shrink-0 font-[600] underline">
      Got it
    </button>
  </div>
);
