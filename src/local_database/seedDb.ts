import fs from "fs";
import path from "path";
import { db } from "@/services/db";
import { createUser, User } from "@/services/db/user";
import "@/services/firebase";


export async function seedDatabase() {
  const existingUsers = await db.users.all();
  if (existingUsers.length > 0) {
    console.log("*** Local firebase is not empty. Skipping seed import...");
    return;
  }

  const USER_SEED_DATA = path.join(process.cwd(), "src/local_database/users.json");
  const seedUsers = JSON.parse(fs.readFileSync(USER_SEED_DATA, "utf8")) as User[];
  
   seedUsers.forEach(async (userData)=> {
        const { username,id, first,last, lang, referedBy } = userData as User;
         await createUser(id,referedBy,username,first,last,lang);
   })
   
}