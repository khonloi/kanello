import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { getBoards, createBoard, type Board } from "../../api";
import "./Home.css";
import Card from "../../components/ui/Card/Card";
import Grid from "../../components/ui/Grid/Grid";
import Modal from "../../components/ui/Modal/Modal";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import Textarea from "../../components/ui/Textarea/Textarea";
import type { LayoutContextType } from "../../App";

export default function Home() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDesc, setNewBoardDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const {
    setUserBoards,
    setBoardId,
    setMembers,
    setIsOwner,
    setOnDeleteBoard,
  } = useOutletContext<LayoutContextType>();

  useEffect(() => {
    fetchBoards();
  }, []);

  useEffect(() => {
    setUserBoards(boards);
    setBoardId(undefined);
    setMembers([]);
    setIsOwner(false);
    setOnDeleteBoard(undefined);
  }, [
    boards,
    setUserBoards,
    setBoardId,
    setMembers,
    setIsOwner,
    setOnDeleteBoard,
  ]);

  const fetchBoards = async () => {
    try {
      const fetchedBoards = await getBoards();
      setBoards(fetchedBoards);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    setIsCreating(true);
    try {
      const created = await createBoard(
        newBoardName,
        newBoardDesc || "No description",
      );
      setBoards([...boards, created]);
      setIsModalOpen(false);
      setNewBoardName("");
      setNewBoardDesc("");
    } catch (err) {
      console.error(err);
      alert("Failed to create board");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="home-content flex-grow-1 p-5 overflow-auto">
      <h6 className="home-section-title text-secondary mb-4 fw-bold">
        YOUR WORKSPACES
      </h6>

      <Grid gap={3}>
        {/* Existing Boards */}
        {!isLoading &&
          boards.map((board) => (
            <Card
              key={board._id}
              className="home-board-card"
              onClick={() => navigate(`/board/${board._id}`)}
            >
              <h6 className="text-dark fw-bold m-0">{board.name}</h6>
            </Card>
          ))}

        {/* Loading State */}
        {isLoading && (
          <div className="text-secondary d-flex align-items-center p-3">
            Loading boards...
          </div>
        )}

        {/* Create New Board Button */}
        <Card
          className="home-create-card d-flex flex-column align-items-center justify-content-center"
          onClick={() => setIsModalOpen(true)}
        >
          <span className="home-create-text text-secondary fw-medium">
            + Create a new board
          </span>
        </Card>
      </Grid>

      {/* Create Board Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create new board"
      >
        <form onSubmit={handleCreateBoard}>
          <Input
            containerClassName="mb-3"
            label={
              <>
                Board title <span className="text-danger">*</span>
              </>
            }
            type="text"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            required
            autoFocus
          />
          <Textarea
            containerClassName="mb-4"
            label="Description"
            value={newBoardDesc}
            onChange={(e) => setNewBoardDesc(e.target.value)}
            rows={3}
          />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            className="home-btn-primary fw-bold"
            disabled={isCreating || !newBoardName.trim()}
            isLoading={isCreating}
          >
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </form>
      </Modal>
    </main>
  );
}
