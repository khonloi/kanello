import React, { createContext } from "react";

export const ModalContext = createContext(false);

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
    <ModalContext.Provider value={true}>
      <div
        className="modal d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        tabIndex={-1}
      >
      <div
        className={`modal-dialog modal-dialog-centered ${size ? `modal-${size}` : ""}`}
      >
        <div
          className="modal-content text-white border-0"
          style={{
            backgroundColor: "#272d33",
            padding: "20px",
            position: "relative",
            border: "none",
          }}
        >
          <div
            className="modal-header border-0"
            style={{ padding: 0 }}
          >
            <h5
              className="modal-title w-100 pe-4"
              style={{ fontSize: "19px", fontWeight: 700 }}
            >
              {title}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white position-absolute"
              style={{ top: "20px", right: "20px" }}
              onClick={onClose}
            ></button>
          </div>
          <div
            className="modal-body"
            style={{ padding: 0, marginTop: "15px" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
    </ModalContext.Provider>
  );
}
