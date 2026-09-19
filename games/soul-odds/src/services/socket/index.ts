import { io } from "socket.io-client";

export const isBrowser = typeof window !== "undefined";

export const socketInstance = io();