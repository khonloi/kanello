import { useState } from "react";
import "./Navbar.css";

import { Link } from "react-router-dom";
import logo from "../../../assets/logo.png";
import InvitationsModal from "../../../pages/Board/InvitationsModal";

interface NavbarProps {
  userEmail: string;
  onLogout: () => void;
  onToggleSidebar?: () => void;
}

export default function Navbar({ userEmail, onLogout, onToggleSidebar }: NavbarProps) {
  const [isInvitationsOpen, setIsInvitationsOpen] = useState(false);

  return (
    <>
      <nav className="ui-navbar d-flex justify-content-between align-items-center px-4">
        <div className="d-flex align-items-center gap-3">
          <div 
            className="navbar-icon-btn d-md-none" 
            onClick={onToggleSidebar}
          >
            <i className="bi bi-list text-secondary fs-4"></i>
          </div>
          <div className="navbar-icon-btn d-none d-md-flex">
            <i className="bi bi-grid-3x3-gap text-secondary fs-5"></i>
          </div>
          <Link to="/" className="d-flex align-items-center">
            <img src={logo} alt="Logo" style={{ height: "24px", display: "block" }} />
          </Link>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div 
            className="navbar-icon-btn position-relative" 
            onClick={() => setIsInvitationsOpen(true)}
            title="Invitations"
            style={{ cursor: "pointer" }}
          >
            <i className="bi bi-bell text-secondary fs-5"></i>
          </div>
          <i className="bi bi-megaphone text-secondary fs-5"></i>
          <div
            className="ui-avatar rounded-circle d-flex align-items-center justify-content-center text-white"
            title={`Logged in as ${userEmail}`}
            onClick={onLogout}
            style={{ cursor: "pointer" }}
          >
            {userEmail.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </nav>

      <InvitationsModal 
        isOpen={isInvitationsOpen} 
        onClose={() => setIsInvitationsOpen(false)} 
      />
    </>
  );
}
