import { useState, useEffect } from "react";
import Modal from "../../components/ui/Modal/Modal";
import Button from "../../components/ui/Button/Button";
import {
  getInvitations,
  getSentInvitations,
  acceptBoardInvitation,
  declineBoardInvitation,
  type Invitation,
} from "../../api";
import "./InvitationsModal.css";

interface InvitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvitationHandled?: () => void; // Optional callback to refresh data globally if needed
}

export default function InvitationsModal({
  isOpen,
  onClose,
  onInvitationHandled,
}: InvitationsModalProps) {
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [receivedInvites, setReceivedInvites] = useState<Invitation[]>([]);
  const [sentInvites, setSentInvites] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchInvitations();
    }
  }, [isOpen]);

  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
      const [received, sent] = await Promise.all([
        getInvitations(),
        getSentInvitations(),
      ]);
      setReceivedInvites(received.filter((inv) => inv.status === "pending"));
      setSentInvites(sent.filter((inv) => inv.status === "pending"));
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (boardId: string) => {
    try {
      await acceptBoardInvitation(boardId);
      await fetchInvitations();
      if (onInvitationHandled) onInvitationHandled();
    } catch (error) {
      alert("Failed to accept invitation");
    }
  };

  const handleDecline = async (boardId: string) => {
    try {
      await declineBoardInvitation(boardId);
      await fetchInvitations();
      if (onInvitationHandled) onInvitationHandled();
    } catch (error) {
      alert("Failed to decline invitation");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invitations">
      <ul className="nav nav-tabs mb-3 mt-3 border-secondary">
        <li className="nav-item">
          <button
            className={`nav-link fw-medium ${activeTab === "received" ? "active" : "text-secondary"}`}
            onClick={() => setActiveTab("received")}
            style={activeTab === "received" ? { color: "#fff", borderColor: "#fff", borderBottomColor: "transparent" } : {}}
          >
            Received
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-medium ${activeTab === "sent" ? "active" : "text-secondary"}`}
            onClick={() => setActiveTab("sent")}
            style={activeTab === "sent" ? { color: "#fff", borderColor: "#fff", borderBottomColor: "transparent" } : {}}
          >
            Sent
          </button>
        </li>
      </ul>

      <div className="invitations-list overflow-auto" style={{ maxHeight: '60vh' }}>
        {isLoading ? (
          <div className="text-center text-secondary py-3">Loading...</div>
        ) : activeTab === "received" ? (
          receivedInvites.length > 0 ? (
            receivedInvites.map((inv) => (
              <div key={inv._id} className="invitation-card p-3 mb-3 rounded border border-secondary" style={{ backgroundColor: '#2a2b2d' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold mb-1 text-white">Board Invitation</h6>
                    <span className="small text-secondary">
                      From: {inv.board_owner_id}
                    </span>
                  </div>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="primary" onClick={() => handleAccept(inv.boardId)}>
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDecline(inv.boardId)}>
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-secondary py-4">No received invitations</div>
          )
        ) : sentInvites.length > 0 ? (
          sentInvites.map((inv) => (
            <div key={inv._id} className="invitation-card p-3 mb-3 rounded border border-secondary" style={{ backgroundColor: '#2a2b2d' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="fw-bold mb-1 text-white">Board Invitation</h6>
                  <span className="small text-secondary">
                    To: {inv.email_member || "Unknown"}
                  </span>
                </div>
                <span className="badge bg-warning text-dark">Pending</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-secondary py-4">No sent invitations</div>
        )}
      </div>
    </Modal>
  );
}
