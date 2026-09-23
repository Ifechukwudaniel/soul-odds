import { NextResponse } from "next/server";
import { requireApiSecret } from "@/libs/ApiAuth";
import { findUser } from "@/services/db/user";


export async function GET(request: Request, props: { params: Promise<{ address: string }> }) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { address } = await props.params;
    const user = await findUser(address);
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: "Method not allowed" }, { status: 500 });
  }
}
