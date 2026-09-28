import axios from 'axios';
import { Env } from '@/lib/Env';

export const apiClient = axios.create({
  headers: Env.NEXT_PUBLIC_API_SECRET ? { 'x-api-secret': Env.NEXT_PUBLIC_API_SECRET } : undefined,
});
