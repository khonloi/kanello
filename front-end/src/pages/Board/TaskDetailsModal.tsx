import { useState, useEffect } from "react";
import Modal from "../../components/ui/Modal/Modal";
import {
  updateTask,
  assignMemberToTask,
  removeMemberFromTask,
} from "../../api";
import type { Task, Card } from "../../api";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import Textarea from "../../components/ui/Textarea/Textarea";
import { useBoardContext } from "./context/BoardContext";
import GithubAttachments from "./components/GithubAttachments";

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  card: Card | undefined;
}

export default function TaskDetailsModal({
  isOpen,
  onClose,
  task,
  card,
}: TaskDetailsModalProps) {
  const { board, members, fetchBoardData, setSelectedTask, currentUserId } =
    useBoardContext();

  const boardId = board?._id || "";
  const isOwner = board ? currentUserId === board.userId : false;
  const [description, setDescription] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [title, setTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showMembersDropdown, setShowMembersDropdown] = useState(false);

  useEffect(() => {
    if (task) {
      setDescription(task.description || "");
      setTitle(task.title || "");
    }
  }, [task]);

  if (!task || !card) return null;

  const handleUpdate = async (updates: Partial<Task>) => {
    try {
      const updatedTask = await updateTask(
        boardId,
        card._id,
        task._id,
        updates,
      );
      setSelectedTask(updatedTask);
      fetchBoardData();
    } catch (err: any) {
      alert(err.message || "Failed to update task");
    }
  };

  const handleDescBlur = () => {
    setIsEditingDesc(false);
    if (description !== task.description) {
      handleUpdate({ description });
    }
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== task.title) {
      handleUpdate({ title: title.trim() });
    } else {
      setTitle(task.title);
    }
  };

  const toggleMember = async (memberId: string) => {
    const isAssigned = task.memberId?.includes(memberId);
    try {
      let updatedTask;
      if (isAssigned) {
        updatedTask = await removeMemberFromTask(
          boardId,
          card._id,
          task._id,
          memberId,
        );
      } else {
        updatedTask = await assignMemberToTask(
          boardId,
          card._id,
          task._id,
          memberId,
        );
      }
      setSelectedTask(updatedTask);
      fetchBoardData();
    } catch (err: any) {
      alert(err.message || "Failed to update members");
    }
  };

  const modalTitle = (
    <div className="d-flex align-items-center gap-2 w-100">
      <i className="bi bi-card-checklist text-secondary modal-header-icon"></i>
      <div className="w-100 d-flex align-items-center">
        {isEditingTitle && isOwner ? (
          <Input
            variant="none"
            className="fw-bold text-white bg-transparent border-0 p-0 shadow-none m-0 w-100 modal-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
            autoFocus
          />
        ) : (
          <h4
            className="m-0 text-white w-100 modal-title-text"
            style={{
              cursor: isOwner ? "pointer" : "default",
            }}
            onClick={() => isOwner && setIsEditingTitle(true)}
          >
            {task.title}
          </h4>
        )}
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
      <div className="row">
        {/* Main Content: Left Column */}
        <div className="col-md-8">
          {/* Members */}
          {((task.memberId && task.memberId.length > 0) || isOwner) && (
            <div className="mb-4">
              <h6 className="text-secondary small mb-2">Members</h6>
              <div className="d-flex flex-wrap align-items-center gap-2">
                {task.memberId?.map((mId) => {
                  const member = members.find((m) => m._id === mId);
                  return member ? (
                    <div
                      key={mId}
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold member-badge"
                      title={member.email}
                    >
                      {member.email.substring(0, 2).toUpperCase()}
                    </div>
                  ) : null;
                })}
                {isOwner && (
                  <div className="position-relative">
                    <Button
                      variant="secondary"
                      className="rounded-circle d-flex align-items-center justify-content-center p-0"
                      style={{
                        width: "32px",
                        height: "32px",
                      }}
                      onClick={() => setShowMembersDropdown(!showMembersDropdown)}
                      title="Add or remove members"
                    >
                      <i
                        className="bi bi-plus-lg"
                        style={{ fontSize: "16px" }}
                      ></i>
                    </Button>
                    {showMembersDropdown && (
                      <div
                        className="dropdown-menu show bg-dark border-secondary p-2 position-absolute mt-1 shadow"
                        style={{
                          zIndex: 1000,
                          minWidth: "220px",
                          left: 0,
                          top: "100%",
                        }}
                      >
                        <h6 className="dropdown-header text-secondary text-center border-bottom border-secondary pb-2 mb-2">
                          Members
                        </h6>
                        {members.map((member) => (
                          <button
                            key={member._id}
                            className="dropdown-item text-white bg-dark d-flex align-items-center gap-2 py-2"
                            onClick={() => toggleMember(member._id)}
                          >
                            <div
                              className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                              style={{
                                width: "24px",
                                height: "24px",
                                fontSize: "10px",
                              }}
                            >
                              {member.email.substring(0, 2).toUpperCase()}
                            </div>
                            <span
                              className="text-truncate"
                              style={{ fontSize: "14px" }}
                            >
                              {member.email}
                            </span>
                            {task.memberId?.includes(member._id) && (
                              <i className="bi bi-check ms-auto"></i>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-4">
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-justify-left text-secondary modal-header-icon"></i>
              <h6 className="m-0 fw-bold text-white">Description</h6>
            </div>
            <div>
              {isEditingDesc && isOwner ? (
                <div>
                  <Textarea
                    containerClassName="mb-2"
                    className="p-3 mb-3 bg-dark text-white border-secondary description-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    autoFocus
                  />
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      className="fw-bold"
                      onClick={handleDescBlur}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setIsEditingDesc(false);
                        setDescription(task.description || "");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={`p-3 rounded border border-transparent description-display ${task.description ? "" : "empty"}`}
                  style={{
                    cursor: isOwner ? "pointer" : "default",
                  }}
                  onClick={() => isOwner && setIsEditingDesc(true)}
                >
                  {task.description ? (
                    <span style={{ whiteSpace: "pre-wrap" }}>
                      {task.description}
                    </span>
                  ) : (
                    <span className="text-white-50">
                      Add a more detailed description...
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Right Column */}
        <div className="col-md-4">
          {/* GitHub Attachments */}
          <GithubAttachments
            boardId={boardId}
            cardId={card._id}
            taskId={task._id}
            isOwner={isOwner}
          />
        </div>
      </div>
    </Modal>
  );
}
