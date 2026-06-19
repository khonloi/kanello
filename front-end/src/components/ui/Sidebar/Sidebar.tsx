import { useNavigate } from "react-router-dom";
import type { Board, User } from "../../../api";
import Button from "../Button/Button";
import "./Sidebar.css";

interface SidebarProps {
  // Board specific props
  userBoards?: Board[];
  boardId?: string;
  members?: User[];
  isOwner?: boolean;
  onDeleteBoard?: () => void;
}

export default function Sidebar({
  userBoards = [],
  boardId,
  members,
  isOwner,
  onDeleteBoard,
}: SidebarProps) {
  const navigate = useNavigate();

  // If boardId is provided, only display that board. Otherwise, display all boards.
  const displayedBoards = boardId
    ? userBoards.filter((b) => b._id === boardId)
    : userBoards;

  return (
    <aside className="ui-sidebar p-3 d-flex flex-column">
      <div className="flex-grow-1 overflow-auto">
        <ul className="list-unstyled d-flex flex-column gap-2 mt-4">
          <li className="text-secondary small fw-bold px-2 mb-1">
            YOUR BOARDS
          </li>
          {displayedBoards.map((b) => (
            <li key={b._id}>
              <Button
                variant="ghost"
                fullWidth
                className={`ui-sidebar-btn text-start text-white d-flex align-items-center gap-2 py-2 px-3 ${b._id === boardId ? "active" : ""}`}
                onClick={() => navigate(`/board/${b._id}`)}
              >
                <i className="bi bi-folder-fill"></i>
                <span className="fw-medium text-truncate">{b.name}</span>
              </Button>
            </li>
          ))}
        </ul>

        {members && members.length > 0 && (
          <ul className="list-unstyled d-flex flex-column gap-2 mt-4">
            <li className="text-secondary small fw-bold px-2 mb-1">MEMBERS</li>
            {members.map((member) => (
              <li key={member._id}>
                <div
                  className="ui-sidebar-btn btn w-100 text-start text-white d-flex align-items-center gap-2 py-2 px-3"
                  style={{ cursor: "default" }}
                >
                  <div
                    className="board-member-avatar"
                    style={{ width: "20px", height: "20px", fontSize: "10px" }}
                  >
                    {member.email.substring(0, 2).toUpperCase()}
                  </div>
                  <span
                    className="fw-medium text-truncate"
                    style={{ fontSize: "13px" }}
                  >
                    {member.email}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {boardId && (
        <div className="mt-auto pt-3">
          <p className="text-secondary small px-2 mb-3">
            You can't find and reopen closed boards if close the board
          </p>
          {isOwner && onDeleteBoard && (
            <Button variant="danger" className="board-close-btn" onClick={onDeleteBoard}>
              Close
            </Button>
          )}
        </div>
      )}
    </aside>
  );
}
