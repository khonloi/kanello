import { apiFetch } from "./client";
import type { User } from "./users";

export interface Board {
  _id: string;
  name: string;
  description: string;
  userId: string;
  list_member: string[];
  createdAt: string;
  updatedAt: string;
}

export async function getBoards(): Promise<Board[]> {
  return apiFetch("/boards");
}

export async function createBoard(
  name: string,
  description: string,
): Promise<Board> {
  return apiFetch("/boards", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

export async function getBoardDetails(boardId: string): Promise<Board> {
  return apiFetch(`/boards/${boardId}`);
}

export async function updateBoard(boardId: string, name: string, description: string): Promise<Board> {
  return apiFetch(`/boards/${boardId}`, {
    method: "PUT",
    body: JSON.stringify({ name, description }),
  });
}

export async function deleteBoard(boardId: string): Promise<{ message: string }> {
  return apiFetch(`/boards/${boardId}`, { method: "DELETE" });
}

export async function getBoardMembers(boardId: string): Promise<User[]> {
  return apiFetch(`/boards/${boardId}/members`);
}
