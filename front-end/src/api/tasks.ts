import { apiFetch } from "./client";

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  cardId: string;
  memberId: string[];
  createdAt: string;
  updatedAt: string;
}

export async function getTasks(boardId: string, cardId: string): Promise<Task[]> {
  return apiFetch(`/boards/${boardId}/cards/${cardId}/tasks`);
}

export async function createTask(
  boardId: string,
  cardId: string,
  title: string,
  description: string = "No description",
  status: string = "To Do"
): Promise<Task> {
  return apiFetch(`/boards/${boardId}/cards/${cardId}/tasks`, {
    method: "POST",
    body: JSON.stringify({ title, description, status }),
  });
}

export async function moveTask(boardId: string, oldCardId: string, taskId: string, newCardId: string): Promise<Task> {
  return apiFetch(`/boards/${boardId}/cards/${oldCardId}/tasks/${taskId}/move`, {
    method: "PUT",
    body: JSON.stringify({ newCardId }),
  });
}

export async function updateTask(boardId: string, cardId: string, taskId: string, updates: Partial<Task>): Promise<Task> {
  return apiFetch(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteTask(boardId: string, cardId: string, taskId: string): Promise<{ message: string }> {
  return apiFetch(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}`, {
    method: "DELETE",
  });
}

export async function assignMemberToTask(boardId: string, cardId: string, taskId: string, memberId: string): Promise<Task> {
  return apiFetch(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}/assign`, {
    method: "POST",
    body: JSON.stringify({ memberId }),
  });
}

export async function removeMemberFromTask(boardId: string, cardId: string, taskId: string, memberId: string): Promise<Task> {
  const response = await apiFetch(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}/assign/${memberId}`, {
    method: "DELETE",
  });
  return response.task;
}
