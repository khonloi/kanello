import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "lg" | "xl";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      tabIndex={-1}
    >
      <div
        className={`modal-dialog modal-dialog-centered ${size ? `modal-${size}` : ""}`}
      >
        <div className="modal-content bg-dark text-white border-secondary">
          <div
            className="modal-header border-secondary border-bottom-0 position-relative"
            style={{ padding: "1.5rem" }}
          >
            <h5 className="modal-title fw-bold w-100 pe-4">{title}</h5>
            <button
              type="button"
              className="btn-close btn-close-white position-absolute"
              style={{ top: "1.5rem", right: "1.5rem" }}
              onClick={onClose}
            ></button>
          </div>
          <div
            className="modal-body"
            style={{ padding: "0 1.5rem 1.5rem 1.5rem" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
