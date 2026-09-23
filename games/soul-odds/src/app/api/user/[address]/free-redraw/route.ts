import { NextResponse } from "next/server";
import { requireApiSecret } from "@/libs/ApiAuth";
import { consumeFreeRedraw } from "@/services/db/user";

export async function POST(request: Request, props: { params: Promise<{ address: string }> }) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  const { address } = await props.params;
  const freeRedraws = await consumeFreeRedraw(address);
  if (freeRedraws === undefined) {
    return NextResponse.json({ message: "No free redraws left." }, { status: 409 });
  }

  return NextResponse.json({ freeRedraws });
}
