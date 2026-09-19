import { NextRequest, NextResponse } from "next/server";
import { createUser, findAllUsers, findUser } from "@/services/db/user";


export async function GET() {
  const users = await findAllUsers();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  try {
    const { username, id, referedBy, first, last, lang } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    if (isNaN(id)) return NextResponse.json({ error: "Is Not A Number." }, { status: 400 });

    const user = await findUser(id);

    if (user?.id) {
      return new NextResponse(null, { status: 204 });
    }

    const newUser = await createUser(id, referedBy, username, first, last, lang);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating  new  user:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred while creating the user." },
      { status: 500 },
    );
  }
}
