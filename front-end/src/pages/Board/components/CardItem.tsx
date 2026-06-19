import React, { useState, useRef, useEffect } from "react";
import { useDrop } from "react-dnd";
import UICard from "../../../components/ui/Card/Card";
import TaskItem, { ItemTypes } from "./TaskItem";
import { type Card } from "../../../api";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Textarea from "../../../components/ui/Textarea/Textarea";
import CardDetailsModal from "./CardDetailsModal";
import { useBoardContext } from "../context/BoardContext";

interface CardItemProps {
  card: Card;
}

const CardItem = ({ card }: CardItemProps) => {
  const {
    tasks: allTasks,
    handleDropTask: onDropTask,
    handleUpdateCard: onUpdateCard,
    handleDeleteCard: onDeleteCard,
    handleCreateTask: onCreateTask,
    board,
    currentUserId,
  } = useBoardContext();

  const isOwner = board ? currentUserId === board.userId : false;
  const tasks = allTasks[card._id] || [];

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(card.name);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ItemTypes.TASK,
      drop: (item: { id: string; cardId: string }) => {
        if (item.cardId !== card._id) {
          onDropTask(item.id, item.cardId, card._id);
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [card._id, onDropTask],
  );

  const handleRename = () => {
    if (editName.trim() && editName.trim() !== card.name) {
      onUpdateCard(card._id, editName.trim());
    } else {
      setEditName(card.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setEditName(card.name);
      setIsEditing(false);
    }
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onCreateTask(card._id, newTaskTitle.trim());
      setNewTaskTitle("");
      setIsAddingTask(false);
    }
  };

  return (
    <>
      <UICard
        ref={drop as any}
        className={`board-list d-flex flex-column mh-100 ${isOver ? "active" : ""}`}
      >
        <div className="board-list-header text-white fw-bold d-flex justify-content-between align-items-center">
          {isEditing ? (
            <Input
              variant="none"
              className="form-control-sm"
              containerClassName="flex-grow-1"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          ) : (
            <span
              className="board-list-title m-0 text-white flex-grow-1"
              onClick={() => isOwner && setIsEditing(true)}
              style={{ cursor: isOwner ? "pointer" : "default" }}
              title={isOwner ? "Click to rename" : ""}
            >
              {card.name}
            </span>
          )}
          {isOwner && !isEditing && (
            <div className="position-relative" ref={menuRef}>
              <i
                className="bi bi-three-dots text-secondary card-menu-trigger"
                title="List options"
                style={{ cursor: "pointer", padding: "4px", marginLeft: "8px" }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              ></i>
              {isMenuOpen && (
                <div
                  className="dropdown-menu show bg-dark border-secondary p-1 position-absolute shadow card-dropdown-menu"
                  style={{
                    zIndex: 1000,
                    minWidth: "140px",
                    right: 0,
                    top: "100%",
                  }}
                >
                  <button
                    type="button"
                    className="dropdown-item text-white bg-dark d-flex align-items-center gap-2 py-2 card-dropdown-item"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsDetailsModalOpen(true);
                    }}
                  >
                    <i className="bi bi-info-circle small"></i>
                    <span style={{ fontSize: "14px" }}>View details</span>
                  </button>
                  <button
                    type="button"
                    className="dropdown-item text-danger bg-dark d-flex align-items-center gap-2 py-2 card-dropdown-item"
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (
                        window.confirm(
                          "Are you sure you want to delete this list?",
                        )
                      ) {
                        onDeleteCard(card._id);
                      }
                    }}
                  >
                    <i className="bi bi-trash small"></i>
                    <span style={{ fontSize: "14px" }}>Delete list</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="board-list-cards p-0 overflow-y-auto flex-grow-1 d-flex flex-column">
          {tasks.map((task) => (
            <TaskItem key={task._id} task={task} />
          ))}
        </div>
        <div className="board-list-footer pt-2">
          {isOwner &&
            (!isAddingTask ? (
              <Button
                variant="ghost"
                fullWidth
                className="board-add-card-btn d-flex align-items-center text-start rounded"
                onClick={() => setIsAddingTask(true)}
              >
                <i className="bi bi-plus"></i> Add a card
              </Button>
            ) : (
              <form onSubmit={handleCreateTaskSubmit} className="add-card-form">
                <Textarea
                  variant="none"
                  className="form-control-sm"
                  containerClassName="mb-2"
                  placeholder="Enter a title for this card..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  autoFocus
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCreateTaskSubmit(e);
                    } else if (e.key === "Escape") {
                      setIsAddingTask(false);
                      setNewTaskTitle("");
                    }
                  }}
                />
                <div className="d-flex gap-2 align-items-center">
                  <Button
                    type="submit"
                    size="sm"
                    className="add-form-submit-btn"
                  >
                    Add Card
                  </Button>
                  <button
                    type="button"
                    className="btn-close btn-close-white btn-sm"
                    onClick={() => {
                      setIsAddingTask(false);
                      setNewTaskTitle("");
                    }}
                  ></button>
                </div>
              </form>
            ))}
        </div>
      </UICard>
      {isDetailsModalOpen && (
        <CardDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          card={card}
        />
      )}
    </>
  );
};

export default CardItem;
