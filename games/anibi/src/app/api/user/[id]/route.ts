import { NextResponse } from "next/server";
import { findUser } from "@/services/db/user";


export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const user = await findUser(id);
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: "Method not allowed" }, { status: 500 });
  }
}
