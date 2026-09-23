import axios from "axios";
import { Env } from "@/libs/Env";

/** Axios instance for calling this app's own `/api/*` routes, carrying the shared `x-api-secret`. */
export const apiClient = axios.create({
  headers: Env.NEXT_PUBLIC_API_SECRET ? { "x-api-secret": Env.NEXT_PUBLIC_API_SECRET } : undefined,
});
