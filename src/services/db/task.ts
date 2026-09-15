import { db, toResult, Result, Schema } from "@/services/db";
import "@/services/firebase";

export interface Task {
  id:number,
  title: string;
  link: string;
  reward:number; 
}

export type TaskDoc = Schema["tasks"]["Doc"];
export type TaskResult = Result<Task>;


export async function createTask(link:string, title:string, reward:number): Promise<TaskResult> {
   let count = (await db.tasks.all()).length
   const task = await db.tasks.add({ id: count + 1 , link,title, reward})
   return toResult<Task>(await db.tasks.get(task.id));
}

export async function updateTask(id:number, link:string, title:string, reward:number ): Promise<TaskResult> {
    const tasksFound = await db.tasks.query(($)=> $.field("id").eq(id));
    if(tasksFound.length < 0) return toResult(null)
    tasksFound[0].update({id,link,title,reward})
    return toResult<Task>(await db.tasks.get(tasksFound[0].ref.id));
}

export async function deleteTask(id:number): Promise<TaskResult> {
    const tasksFound = await db.tasks.query(($)=> $.field("id").eq(id));
    if(tasksFound.length < 0) return  toResult(null)
    let task =  toResult<Task>(await db.tasks.get(tasksFound[0].ref.id));
    await db.tasks.remove(tasksFound[0].ref.id)
    return task
}

export async function getAllTasks(): Promise<TaskResult[]> {
  return (await db.tasks.all()).map(value =>toResult(value))
}

export async function getTaskById(id:number):Promise<TaskResult> {
    const tasksFound = await db.tasks.query(($)=> $.field("id").eq(id));
    if(tasksFound.length < 0) return  toResult(null)
    return toResult<TaskResult>(tasksFound[0])
}