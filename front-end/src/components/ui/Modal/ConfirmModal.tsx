import Modal from "./Modal";
import Button from "../Button/Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="d-flex flex-column gap-4">
        <p className="text-white-50 m-0" style={{ fontSize: "15px" }}>
          {message}
        </p>
        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={onClose} size="sm">
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            size="sm"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
