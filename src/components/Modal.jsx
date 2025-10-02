import React from "react";

const Modal = ({
  isOpen = false,
  title = "",
  children,
  footer = null,
  onClose = () => {},
  width = "500px",
  height = "auto",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden"
        style={{ width, height }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Header */}
        {title && (
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-4 flex-1 overflow-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-4 py-3 border-t border-gray-200">{footer}</div>
        )}
      </div>
    </div>
  );
};

export default Modal;
