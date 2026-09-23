import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/libs/ApiAuth";
import { SOCIAL_TASK_IDS, SOCIAL_TASKS } from "@/lib/social-quests";
import { findUser, updateTasks } from "@/services/db/user";

import { UserTask } from "@/types";

export async function GET(request: NextRequest) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const address = request.nextUrl.searchParams.get("address");
    const user = await findUser(address as string);
    if (!user) return NextResponse.json({ message: "Invalid Parameter" }, { status: 500 });
    const parsedData: UserTask[] = SOCIAL_TASKS.map((task) => ({
      ...task,
      completed: user.tasksCompleted.includes(task.id),
    }));

    return NextResponse.json(parsedData);
  } catch (error) {
    return NextResponse.json({ message: "Method not allowed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { address, taskId } = await request.json();
    if (!address || !SOCIAL_TASK_IDS.includes(taskId)) return NextResponse.json({ message: "Invalid Parameter" }, { status: 400 });
    const user = await findUser(address as string);
    if (!user) return NextResponse.json({ message: "Invalid Parameter" }, { status: 500 });
    const tasks = user.tasksCompleted.concat(taskId);
    await updateTasks(address, tasks);
    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({ message: "Method not allowed" }, { status: 500 });
  }
}
