import { NextResponse } from "next/server";
import { findUser } from "@/services/db/user";


export async function GET(_request: Request, props: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await props.params;
    const user = await findUser(address);
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: "Method not allowed" }, { status: 500 });
  }
}
