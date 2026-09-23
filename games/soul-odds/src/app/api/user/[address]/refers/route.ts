import { NextResponse } from "next/server";
import { requireApiSecret } from "@/libs/ApiAuth";
import { getUserRefers } from "@/services/db/user";


export async function GET(request: Request, props: { params: Promise<{ address: string }> }) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { address } = await props.params;
    const user = await getUserRefers(address);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error userRefers", error);
    return NextResponse.json(
      { message: "An unexpected error occurred while getting user stats." },
      { status: 500 },
    );
  }
}
