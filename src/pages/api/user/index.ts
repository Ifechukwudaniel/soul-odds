import { NextApiRequest, NextApiResponse } from "next";
import { createUser, findAllUsers, findUser } from "@/services/db/user";
import "@/services/firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const users = await findAllUsers();
    return res.status(200).json(users);
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed." });
  }

  try {
    const { username, id,referedBy, first , last, lang } = req.body;
    if (!id ) return res.status(400).json({ error: "Missing required fields." });
    if(isNaN(id)) return res.status(400).json({ error: "Is Not A Number." });

    const user = await findUser(id);

    if (user?.id) {
      res.status(204).end();
      return;
    }

    const newUser = await createUser(id,referedBy,username,first,last, lang);
    // Respond with the new  user
    res.status(201).json(newUser);
  } catch (error: any) {
    console.error("Error creating  new  user:", error);
    res.status(500).json({ message: "An unexpected error occurred while creating the user." });
  }
}