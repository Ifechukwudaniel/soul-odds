import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { createUser, findAllUsers, findUser } from "@/services/db/user";


export async function GET() {
  const users = await findAllUsers();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  try {
    const { address, referredBy } = await request.json();
    if (!address) return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    if (!isAddress(address, { strict: false })) {
      return NextResponse.json({ error: "Is Not An Address." }, { status: 400 });
    }

    const user = await findUser(address);

    if (user) {
      return new NextResponse(null, { status: 204 });
    }

    const validReferrer =
      referredBy && isAddress(referredBy, { strict: false }) && referredBy.toLowerCase() !== address.toLowerCase()
        ? referredBy
        : undefined;

    const newUser = await createUser(address, validReferrer);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating  new  user:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred while creating the user." },
      { status: 500 },
    );
  }
}
