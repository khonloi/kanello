import { useState, useEffect } from "react";
import Modal from "../../../components/ui/Modal/Modal";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Textarea from "../../../components/ui/Textarea/Textarea";
import type { Card, User } from "../../../api";
import { useBoardContext } from "../context/BoardContext";

interface CardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card;
}

export default function CardDetailsModal({
  isOpen,
  onClose,
  card,
}: CardDetailsModalProps) {
  const {
    members,
    handleUpdateCard: onUpdateCard,
    tasks: allTasks,
    board,
    currentUserId,
  } = useBoardContext();

  const isOwner = board ? currentUserId === board.userId : false;
  const taskCount = (allTasks[card._id] || []).length;
  const [name, setName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [description, setDescription] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  useEffect(() => {
    setName(card.name || "");
    setDescription(card.description || "");
  }, [card]);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (name.trim() && name !== card.name) {
      onUpdateCard(card._id, name.trim(), undefined);
    } else {
      setName(card.name);
    }
  };

  const handleDescSave = () => {
    setIsEditingDesc(false);
    if (description !== card.description) {
      onUpdateCard(card._id, undefined, description);
    }
  };

  // Resolve list members from board members
  const resolvedMembers = (card.list_member || [])
    .map((memberId) => members.find((m) => m._id === memberId))
    .filter((member): member is User => !!member);

  const modalTitle = (
    <div className="d-flex align-items-center gap-2 w-100">
      <i className="bi bi-card-heading text-secondary modal-header-icon"></i>
      <div className="w-100 d-flex align-items-center">
        {isEditingName && isOwner ? (
          <Input
            variant="none"
            className="fw-bold text-white bg-transparent border-0 p-0 shadow-none m-0 w-100 modal-title-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => e.key === "Enter" && handleNameBlur()}
            autoFocus
          />
        ) : (
          <h4
            className="m-0 text-white w-100 modal-title-text"
            style={{
              cursor: isOwner ? "pointer" : "default",
            }}
            onClick={() => isOwner && setIsEditingName(true)}
            title={isOwner ? "Click to edit list name" : ""}
          >
            {card.name}
          </h4>
        )}
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
      <div className="row g-4">
        {/* Left side details */}
        <div className="col-12 col-md-8">
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
                    className="p-3 bg-dark text-white border-secondary description-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    autoFocus
                  />
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      className="fw-bold"
                      onClick={handleDescSave}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setIsEditingDesc(false);
                        setDescription(card.description || "");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={`p-3 rounded border border-transparent description-display ${card.description ? "" : "empty"}`}
                  style={{
                    cursor: isOwner ? "pointer" : "default",
                  }}
                  onClick={() => isOwner && setIsEditingDesc(true)}
                  title={isOwner ? "Click to edit description" : ""}
                >
                  {card.description ? (
                    <span
                      style={{ whiteSpace: "pre-wrap" }}
                      className="text-white-50"
                    >
                      {card.description}
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

        {/* Right side metadata */}
        <div className="col-12 col-md-4 border-start border-secondary ps-md-4">
          <h6 className="text-secondary small mb-3">LIST INFORMATION</h6>

          <div className="mb-3">
            <div className="text-secondary small">Total Tasks</div>
            <div className="fw-bold text-white fs-5">{taskCount}</div>
          </div>

          <div className="mb-3">
            <div className="text-secondary small">Created At</div>
            <div className="text-white small">
              {card.createdAt
                ? new Date(card.createdAt).toLocaleString()
                : "N/A"}
            </div>
          </div>

          <div className="mb-3">
            <div className="text-secondary small">Last Updated</div>
            <div className="text-white small">
              {card.updatedAt
                ? new Date(card.updatedAt).toLocaleString()
                : "N/A"}
            </div>
          </div>

          {resolvedMembers.length > 0 && (
            <div className="mb-3">
              <div className="text-secondary small mb-2">List Members</div>
              <div className="d-flex flex-wrap gap-2">
                {resolvedMembers.map((member) => (
                  <div
                    key={member._id}
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold member-badge"
                    title={member.email}
                  >
                    {member.email.substring(0, 2).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
