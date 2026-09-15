import { getAllTasks  } from "@/services/db/task";
import { findUser, updateTaskes } from "@/services/db/user";
import "@/services/firebase";
import { NextApiRequest, NextApiResponse } from "next";
import {UserTask} from '@/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { userId } = req.query;
      const user =  await findUser(userId as string);
      if(!user)  return res.status(500).json({ message: "Invalid Parmeter" });
      const taskes = await getAllTasks();
      const foundTaskObject = user.taskesCompleted.reduce((a, v) => ({ ...a, [v]: true}), {});
      let parsedData: UserTask[] =  taskes.map(task=>{
        if(foundTaskObject[task.id]) return {...task, reward:task.reward , completed:true, button:null}
        return { ...task, completed:false, button:null}
      }) 

      return res.status(200).json(parsedData);
    } catch (error: any) {
      return res.status(500).json({ message: "Method not allowed" });
    }
  }

  if (req.method === "POST") {
     try {
       const {userId, taskId} = req.body;
       if(!userId || !taskId)  return res.status(500).json({ message: "Invalid Parmeter" });
       let user = await findUser(userId as string )
       if(!user) return res.status(500).json({ message: "Invalid Parmeter" });
       const taskes =  user.taskesCompleted.concat(taskId)
       await updateTaskes(userId, taskes)
       return res.status(200).send({})
     } catch (error) {
      return res.status(500).json({ message: "Method not allowed" });
     }
  }
}
