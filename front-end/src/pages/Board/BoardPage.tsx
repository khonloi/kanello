import { useParams, useOutletContext } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import TaskDetailsModal from "./TaskDetailsModal";
import Modal from "../../components/ui/Modal/Modal";
import Grid from "../../components/ui/Grid/Grid";
import CardItem from "./components/CardItem";
import { useBoardData } from "./hooks/useBoardData";
import { BoardContext } from "./context/BoardContext";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import Textarea from "../../components/ui/Textarea/Textarea";
import { useEffect } from "react";
import type { LayoutContextType } from "../../App";
import "./BoardPage.css";

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();

  const boardData = useBoardData(boardId);
  const {
    board,
    userBoards,
    members,
    cards,
    selectedTask,
    setSelectedTask,
    isInviteModalOpen,
    setIsInviteModalOpen,
    inviteEmail,
    setInviteEmail,
    inviteError,
    inviteSuccess,
    isEditBoardModalOpen,
    setIsEditBoardModalOpen,
    editBoardName,
    setEditBoardName,
    editBoardDescription,
    setEditBoardDescription,
    isCreatingList,
    setIsCreatingList,
    newListName,
    setNewListName,
    currentUserId,
    handleInvite,
    handleDeleteBoard,
    handleUpdateBoard,
    handleCreateList,
  } = boardData;

  const {
    setUserBoards,
    setBoardId,
    setMembers,
    setIsOwner,
    setOnDeleteBoard,
  } = useOutletContext<LayoutContextType>();

  const isOwner = board ? currentUserId === board.userId : false;

  useEffect(() => {
    if (board) {
      setUserBoards(userBoards);
      setBoardId(boardId);
      setMembers(members);
      setIsOwner(isOwner);
      setOnDeleteBoard(() => handleDeleteBoard);
    }
  }, [
    board,
    userBoards,
    boardId,
    members,
    isOwner,
    handleDeleteBoard,
    setUserBoards,
    setBoardId,
    setMembers,
    setIsOwner,
    setOnDeleteBoard,
  ]);

  if (!board) return <div className="p-5 text-white">Loading...</div>;

  return (
    <BoardContext.Provider value={boardData}>
      <DndProvider backend={HTML5Backend}>
        <main className="board-content d-flex flex-column flex-grow-1 overflow-hidden h-100">
          {/* Secondary Header */}
          <header className="board-header d-flex align-items-center justify-content-between text-white">
            <h2 
              className={`board-title m-0 text-white${isOwner ? " clickable" : ""}`}
              onClick={isOwner ? () => setIsEditBoardModalOpen(true) : undefined}
              title={isOwner ? "Click to edit board name or description" : undefined}
            >
              {board.name}
            </h2>
            {isOwner && (
              <Button
                variant="ghost"
                className="board-invite-btn text-white rounded d-flex align-items-center gap-2"
                onClick={() => setIsInviteModalOpen(true)}
              >
                <i className="bi bi-person-plus-fill"></i> Invite member
              </Button>
            )}
          </header>

          {/* Kanban Canvas */}
          <Grid
            className="board-canvas flex-grow-1 d-flex overflow-x-auto align-items-start align-content-start"
            wrap={false}
            gap={3}
          >
            {cards.map((card) => (
              <CardItem key={card._id} card={card} />
            ))}

            {isOwner && (
              <div className="board-add-list-wrapper">
                {!isCreatingList ? (
                  <Button
                    variant="ghost"
                    fullWidth
                    className="board-add-list-btn text-start fw-medium d-flex align-items-center"
                    onClick={() => setIsCreatingList(true)}
                  >
                    <i className="bi bi-plus"></i> Add another list
                  </Button>
                ) : (
                  <form className="add-list-form" onSubmit={handleCreateList}>
                    <Input
                      type="text"
                      className="form-control-sm"
                      containerClassName="mb-2"
                      placeholder="Enter list title..."
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      autoFocus
                    />
                    <div className="d-flex gap-2 align-items-center">
                      <Button
                        type="submit"
                        size="sm"
                        className="add-form-submit-btn"
                      >
                        Add List
                      </Button>
                      <button
                        type="button"
                        className="btn-close btn-close-white btn-sm"
                        onClick={() => {
                          setIsCreatingList(false);
                          setNewListName("");
                        }}
                      ></button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </Grid>
        </main>

        {/* Invite Modal */}
        <Modal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          title="Invite Member"
        >
          <form onSubmit={handleInvite}>
            <Input
              containerClassName="mb-3"
              label="Email address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              placeholder="user@example.com"
            />
            {inviteError && (
              <div className="text-danger small mb-3">{inviteError}</div>
            )}
            {inviteSuccess && (
              <div className="text-success small mb-3">{inviteSuccess}</div>
            )}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              className="fw-bold"
              disabled={!inviteEmail.trim()}
            >
              Send Invitation
            </Button>
          </form>
        </Modal>

        {/* Edit Board Modal */}
        <Modal
          isOpen={isEditBoardModalOpen}
          onClose={() => setIsEditBoardModalOpen(false)}
          title="Edit Board"
        >
          <form onSubmit={handleUpdateBoard}>
            <Input
              containerClassName="mb-3"
              label="Board Name"
              type="text"
              value={editBoardName}
              onChange={(e) => setEditBoardName(e.target.value)}
              required
              placeholder="Board Name"
            />
            <Textarea
              containerClassName="mb-3"
              label="Board Description"
              value={editBoardDescription}
              onChange={(e) => setEditBoardDescription(e.target.value)}
              placeholder="Board Description"
              rows={4}
            />
            <Button
              type="submit"
              variant="primary"
              fullWidth
              className="fw-bold"
              disabled={!editBoardName.trim()}
            >
              Update Board
            </Button>
          </form>
        </Modal>

        {/* Task Details Modal */}
        <TaskDetailsModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          card={
            selectedTask
              ? cards.find((c) => c._id === selectedTask.cardId)
              : undefined
          }
        />
      </DndProvider>
    </BoardContext.Provider>
  );
}
