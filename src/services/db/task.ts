import { eq } from 'drizzle-orm';
import { db } from '.';
import { type Task, taskSchema } from './Schema';

export type { Task };

export async function createTask(link: string, title: string, reward: number): Promise<Task> {
  const [task] = await db.insert(taskSchema).values({ link, title, reward }).returning();
  return task!;
}

export async function updateTask(
  id: number,
  link: string,
  title: string,
  reward: number,
): Promise<Task | undefined> {
  const [task] = await db
    .update(taskSchema)
    .set({ link, title, reward })
    .where(eq(taskSchema.id, id))
    .returning();
  return task;
}

export async function deleteTask(id: number): Promise<Task | undefined> {
  const [task] = await db.delete(taskSchema).where(eq(taskSchema.id, id)).returning();
  return task;
}

export async function getAllTasks(): Promise<Task[]> {
  return db.select().from(taskSchema);
}

export async function getTaskById(id: number): Promise<Task | undefined> {
  const [task] = await db.select().from(taskSchema).where(eq(taskSchema.id, id)).limit(1);
  return task;
}
