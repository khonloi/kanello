import { apiFetch } from "./client";

export interface Card {
  _id: string;
  boardId: string;
  name: string;
  description: string;
  task_count: number;
  list_member: string[];
  createdAt: string;
  updatedAt: string;
}

export async function getCards(boardId: string): Promise<Card[]> {
  return apiFetch(`/boards/${boardId}/cards`);
}

export async function createCard(boardId: string, name: string, description: string): Promise<Card> {
  return apiFetch(`/boards/${boardId}/cards`, {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

export async function updateCard(boardId: string, cardId: string, name?: string, description?: string): Promise<Card> {
  return apiFetch(`/boards/${boardId}/cards/${cardId}`, {
    method: "PUT",
    body: JSON.stringify({ name, description }),
  });
}

export async function deleteCard(boardId: string, cardId: string): Promise<{ message: string }> {
  return apiFetch(`/boards/${boardId}/cards/${cardId}`, { method: "DELETE" });
}
