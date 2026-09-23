import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/libs/ApiAuth";
import { getAllTasks } from "@/services/db/task";
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
    const tasks = await getAllTasks();
    const foundTaskObject = user.tasksCompleted.reduce<Record<number, boolean>>(
      (a, v) => ({ ...a, [v]: true }),
      {},
    );
    const parsedData: UserTask[] = tasks.map((task) => {
      if (foundTaskObject[task.id]) return { ...task, reward: task.reward, completed: true, button: null };
      return { ...task, completed: false, button: null };
    });

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
    if (!address || !taskId) return NextResponse.json({ message: "Invalid Parameter" }, { status: 500 });
    const user = await findUser(address as string);
    if (!user) return NextResponse.json({ message: "Invalid Parameter" }, { status: 500 });
    const tasks = user.tasksCompleted.concat(taskId);
    await updateTasks(address, tasks);
    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({ message: "Method not allowed" }, { status: 500 });
  }
}
