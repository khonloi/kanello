import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBoardDetails,
  getCards,
  getTasks,
  getBoardMembers,
  getBoards,
  searchUsers,
  inviteUserToBoard,
  deleteBoard,
  moveTask,
  createCard,
  updateCard,
  deleteCard,
  createTask,
  type Board,
  type Card,
  type Task,
  type User,
} from "../../../api";

export const useBoardData = (boardId: string | undefined) => {
  const navigate = useNavigate();

  const [board, setBoard] = useState<Board | null>(null);
  const [userBoards, setUserBoards] = useState<Board[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [tasks, setTasks] = useState<{ [cardId: string]: Task[] }>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Decode token to get userId
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.userId);
      } catch (e) {
        console.error("Failed to parse token", e);
      }
    }
  }, []);

  const fetchBoardData = useCallback(async () => {
    if (!boardId) return;
    try {
      const [fetchedBoard, fetchedMembers, fetchedBoards, fetchedCards] =
        await Promise.all([
          getBoardDetails(boardId),
          getBoardMembers(boardId),
          getBoards(),
          getCards(boardId),
        ]);
      setBoard(fetchedBoard);
      setMembers(fetchedMembers);
      setUserBoards(fetchedBoards);
      setCards(fetchedCards);

      const tasksMap: { [key: string]: Task[] } = {};
      await Promise.all(
        fetchedCards.map(async (c) => {
          const t = await getTasks(boardId, c._id);
          tasksMap[c._id] = t;
        }),
      );
      setTasks(tasksMap);
    } catch (err) {
      console.error("Failed to load board data", err);
      navigate("/");
    }
  }, [boardId, navigate]);

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  const handleDropTask = async (
    taskId: string,
    sourceCardId: string,
    targetCardId: string,
  ) => {
    if (!boardId) return;

    // Optimistic UI update
    setTasks((prev) => {
      const sourceTasks = prev[sourceCardId] || [];
      const targetTasks = prev[targetCardId] || [];
      const taskToMove = sourceTasks.find((t) => t._id === taskId);

      if (!taskToMove) return prev;

      return {
        ...prev,
        [sourceCardId]: sourceTasks.filter((t) => t._id !== taskId),
        [targetCardId]: [
          ...targetTasks,
          { ...taskToMove, cardId: targetCardId },
        ],
      };
    });

    try {
      await moveTask(boardId, sourceCardId, taskId, targetCardId);
    } catch (err) {
      console.error("Failed to move task", err);
      // Revert on error
      fetchBoardData();
      alert("Failed to move task. You might not have permission.");
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");
    if (!boardId || !inviteEmail.trim()) return;

    try {
      const users = await searchUsers(inviteEmail.trim());
      if (users.length === 0) {
        setInviteError("User not found.");
        return;
      }
      const userToInvite = users[0];
      await inviteUserToBoard(boardId, userToInvite._id, userToInvite.email);
      setInviteSuccess("Invitation sent!");
      setInviteEmail("");
    } catch (err: any) {
      setInviteError(err.message || "Failed to invite user.");
    }
  };

  const handleDeleteBoard = useCallback(async () => {
    if (!boardId) return;
    if (
      window.confirm(
        "Are you sure you want to close this board? This action cannot be undone.",
      )
    ) {
      try {
        await deleteBoard(boardId);
        navigate("/");
      } catch (err: any) {
        alert(err.message || "Failed to delete board.");
      }
    }
  }, [boardId, navigate]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardId || !newListName.trim()) return;

    try {
      await createCard(boardId, newListName.trim(), "No description");
      setNewListName("");
      setIsCreatingList(false);
      fetchBoardData(); // Refresh board to show new list
    } catch (err: any) {
      alert(err.message || "Failed to create list.");
    }
  };

  const handleUpdateCard = async (cardId: string, name?: string, description?: string) => {
    if (!boardId) return;
    try {
      await updateCard(boardId, cardId, name, description);
      fetchBoardData();
    } catch (err: any) {
      alert(err.message || "Failed to update list.");
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!boardId) return;
    try {
      await deleteCard(boardId, cardId);
      fetchBoardData();
    } catch (err: any) {
      alert(err.message || "Failed to delete list.");
    }
  };

  const handleCreateTask = async (cardId: string, title: string) => {
    if (!boardId) return;
    try {
      await createTask(boardId, cardId, title);
      fetchBoardData();
    } catch (err: any) {
      alert(err.message || "Failed to create task.");
    }
  };

  return {
    board,
    userBoards,
    members,
    cards,
    tasks,
    selectedTask,
    setSelectedTask,
    isInviteModalOpen,
    setIsInviteModalOpen,
    inviteEmail,
    setInviteEmail,
    inviteError,
    inviteSuccess,
    isCreatingList,
    setIsCreatingList,
    newListName,
    setNewListName,
    currentUserId,
    fetchBoardData,
    handleDropTask,
    handleInvite,
    handleDeleteBoard,
    handleCreateList,
    handleUpdateCard,
    handleDeleteCard,
    handleCreateTask,
  };
};
