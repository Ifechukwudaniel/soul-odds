import { NextResponse } from "next/server";
import { getUserRefers } from "@/services/db/user";


export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const user = await getUserRefers(id);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error userRefers", error);
    return NextResponse.json(
      { message: "An unexpected error occurred while getting user stats." },
      { status: 500 },
    );
  }
}
