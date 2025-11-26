import React, { useEffect } from "react";
import "./Modal.css";

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = "medium",
  className = "",
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.keyCode === 27 && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalClass = `modal modal--${size} ${className}`.trim();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
            {showCloseButton && (
              <button
                className="modal-close"
                onClick={onClose}
                aria-label="Close modal"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
