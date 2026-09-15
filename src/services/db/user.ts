import { createUserBoost } from "./boost";
import { Result, Schema, db, toResult } from "@/services/db";
//import { secondsDiffrence } from "@/utils";
import { Typesaurus } from "typesaurus";

export interface User {
  id: number;
  creationTimestamp: Typesaurus.ServerDate;
  username: string;
  rank: number;
  balance: number;
  touches: number;
  wallet?: string;
  social?: SocialLinks;
  online: boolean;
  lastOnline: Typesaurus.ServerDate;
  lang: string;
  first: string;
  last: string;
  referedBy?: number;
  energy: Energy;
  connectionId?: string;
  totalCoinsMined: number;
  totalRefered: number;
  totalReferedCliamed: number;
  taskesCompleted:number[],
  lastExtraTap: Date | null;
  lastRefillTap: Date | null;
}
export interface Energy {
  maxEnergy: number;
  energyLeft: number;
}

export interface SocialLinks {
  twitter: string;
  discord: string;
}

export interface AllActiveUserCount {
  count: number;
}

export interface TotalTokenInCirclation {
  total: number;
}

export interface TotalTouchesByAllUser {
  touches: number;
}

export interface AllDailyUser {
  dailyUsers: number;
}

export type UserDoc = Schema["users"]["Doc"];
export type UserResult = Result<User>;

export async function login(id: string, connectionId: string) {
  const users = await db.users.query($ => $.field("id").eq(Number(id)));
  const userRef = await users[0].ref.id;
  await db.users.update(userRef, $ => [
    $.field("online").set(true),
    $.field("lastOnline").set($.serverDate()),
    $.field("connectionId").set(connectionId),
  ]);
}

export async function logout(id: string) {
  const users = await db.users.query($ => $.field("connectionId").eq(id));
  if(users.length <= 0) return
  const userRef =  users[0].ref.id
  await db.users.update(userRef, ($)=> [
    $.field("online").set(false),
    $.field("lastOnline").set($.serverDate()),
    $.field("connectionId").set($.remove())
  ])
}

export async function userClick(id: string) {
  const users = await db.users.query($ => $.field("id").eq(Number(id)));
  const user = users[0];
  const userId = user.ref.id;
  const { touches, balance } = user.data;
  if (user) {
    throw new Error("User Does not exist");
  }
  await db.users.update(userId, $ => [$.field("touches").set(touches + 1), $.field("balance").set(balance + 1)]);
}

export async function getUserRefers(id: string): Promise<UserResult[]> {
  const user = await findUser(id);
  const referedUsers = (await db.users.query($ => $.field("referedBy").eq(user.id))).map(user => toResult<User>(user));
  return referedUsers;
}

export async function useTokens(id: string, amount: number) {
  const users = await db.users.query($ => $.field("id").eq(Number(id)));
  const user = users[0];
  const userId = user.ref.id;
  if (user.data.balance < amount) {
    throw new Error("User Does not have enough tokens");
  }
  await db.users.update(userId, $ => [$.field("balance").set(user.data.balance - amount)]);
}

export async function getAllTokensInCircluation(): Promise<TotalTokenInCirclation> {
  const usersSnaphot = await db.users.all();
  const totalBalance = usersSnaphot.reduce((total, user) => total + toResult<User>(user).balance, 0);
  return { total: totalBalance };
}

export async function getAllTouchesByAllUsers(): Promise<TotalTouchesByAllUser> {
  const usersSnaphot = await db.users.all();
  const totalTouches = usersSnaphot.reduce((total, user) => total + toResult<User>(user).touches, 0);
  return { touches: totalTouches };
}

export async function getOnlineUserCount(): Promise<AllActiveUserCount> {
  const usersSnaphot = await db.users.all();
  const activeUserCount = usersSnaphot.filter(user => toResult<User>(user).online == true).length;
  return { count: activeUserCount };
}

export async function getDailyUsers(): Promise<AllDailyUser> {
  const usersSnaphot = await db.users.all();
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const totalDailyUsers = usersSnaphot.reduce((total, user) => {
      let lastOnlineDate = new Date(toResult<User>(user).lastOnline);
      let lastSeenYear = lastOnlineDate.getFullYear();
      let lastSeenMonth = lastOnlineDate.getMonth();
      let lastSeenDay = lastOnlineDate.getDate();

      return total + (lastSeenYear === todayYear && lastSeenMonth === todayMonth && lastSeenDay === todayDate ? 1 : 0);
  }, 0);

  return { dailyUsers: totalDailyUsers };
}

export async function findAllUsers(): Promise<UserResult[]> {
  const usersSnaphot = await db.users.all();
  const users = usersSnaphot.map(user => toResult<User>(user));
  return users;
}

export async function findUser(id: string): Promise<UserResult> {
  let userQuery = await db.users.query($ => $.field("id").eq(Number(id)));
  if(userQuery.length < 0) return toResult<User>(null);
  let userData = toResult<User>(userQuery[0])
  // if (userData.exist) { 
  //   if(userData.lastOnline) {
  //       const timePassed = secondsDiffrence(userData.lastOnline!, userData.energy.maxEnergy)
  //       console.log(timePassed)
  //   }
  // }
  return userData
}

export async function createUser(
  id: number,
  referedBy: number | undefined,
  username: string | "",
  first: string | "",
  last: string | "",
  lang: string | "en",
): Promise<UserResult> {
  const ref = await db.users.add($ => ({
    id,
    creationTimestamp: $.serverDate(),
    username,
    first,
    last,
    touches: 0,
    balance: 1000,
    lastOnline: $.serverDate(),
    online: false,
    lang,
    rank: 0,
    referedBy,
    energy: {
      maxEnergy: 1000,
      energyLeft: 500,
    },
    totalCoinsMined: 1000,
    totalRefered: 0,
    totalReferedCliamed: 0,
    taskesCompleted:[],
    lastExtraTap:  null,
    lastRefillTap:null,
  }));
  const userSnapshot = await db.users.get(ref.id);
  createUserBoost(id);
  if(referedBy !== null) {
    let refedUser =  (await db.users.query(($)=> $.field("id").gte(referedBy!))).at(0)
     if(!refedUser){
      return toResult<User>(userSnapshot);
     }
     else {
      await db.users.update(refedUser.ref.id,{totalRefered:refedUser.data.totalRefered +1})
     }
  }
  return toResult<User>(userSnapshot);
}

export async function updateUser(user:any) {
  const userFound = await db.users.query(($)=> $.field("id").eq(user.id));
  if(userFound.length < 0) return
  userFound[0].update({...user})
}

export async function updateTaskes(userId:number, ids:number[]) {
  const userFound = await db.users.query(($)=> $.field("id").eq(userId));
  if(userFound.length < 0) return
  const user = userFound[0]
  ids = Array.from(new Set(ids))
  user.update({taskesCompleted:ids})
}