import { NextRequest, NextResponse } from "next/server";
import { getAllTasks } from "@/services/db/task";
import { findUser, updateTaskes } from "@/services/db/user";
import "@/services/firebase";
import { UserTask } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const user = await findUser(userId as string);
    if (!user) return NextResponse.json({ message: "Invalid Parmeter" }, { status: 500 });
    const taskes = await getAllTasks();
    const foundTaskObject = user.taskesCompleted.reduce((a, v) => ({ ...a, [v]: true }), {});
    const parsedData: UserTask[] = taskes.map((task) => {
      if (foundTaskObject[task.id]) return { ...task, reward: task.reward, completed: true, button: null };
      return { ...task, completed: false, button: null };
    });

    return NextResponse.json(parsedData);
  } catch (error) {
    return NextResponse.json({ message: "Method not allowed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, taskId } = await request.json();
    if (!userId || !taskId) return NextResponse.json({ message: "Invalid Parmeter" }, { status: 500 });
    const user = await findUser(userId as string);
    if (!user) return NextResponse.json({ message: "Invalid Parmeter" }, { status: 500 });
    const taskes = user.taskesCompleted.concat(taskId);
    await updateTaskes(userId, taskes);
    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({ message: "Method not allowed" }, { status: 500 });
  }
}
