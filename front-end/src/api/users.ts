import { apiFetch } from "./client";

export interface User {
  _id: string;
  email: string;
}

export async function searchUsers(email: string): Promise<User[]> {
  return apiFetch(`/auth/users?email=${encodeURIComponent(email)}`);
}
