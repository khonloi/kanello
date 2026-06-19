import { apiFetch } from "./client";

export interface Invitation {
  _id: string;
  boardId: string;
  cardId?: string;
  board_owner_id: string;
  member_id: string;
  email_member?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
}

export async function inviteUserToBoard(boardId: string, member_id: string, email_member: string): Promise<Invitation> {
  return apiFetch(`/boards/${boardId}/invite`, {
    method: "POST",
    body: JSON.stringify({ member_id, email_member }),
  });
}

export async function getInvitations(): Promise<Invitation[]> {
  return apiFetch("/invitations");
}

export async function getSentInvitations(): Promise<Invitation[]> {
  return apiFetch("/invitations/sent");
}

export async function acceptBoardInvitation(boardId: string): Promise<{ message: string, invitation: Invitation }> {
  return apiFetch(`/boards/${boardId}/invite/accept`, { method: "POST" });
}

export async function declineBoardInvitation(boardId: string): Promise<{ message: string, invitation: Invitation }> {
  return apiFetch(`/boards/${boardId}/invite/decline`, { method: "POST" });
}
