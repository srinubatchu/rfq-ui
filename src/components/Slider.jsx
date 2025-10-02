import React from "react";

const Slider = ({ isSliderOpen = false, title, children, onClose, width = "50%" }) => {
  if (!isSliderOpen) return null; // Don't render at all when closed

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Background overlay */}
      <div
        className="flex-1 bg-black bg-opacity-40"
        onClick={onClose}
      ></div>

      {/* Sliding Panel */}
      <div
        className={`bg-white h-full shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSliderOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width }}
      >
        {/* Header with title + close button */}
        {(title || onClose) && (
          <div className="flex items-center justify-between border-b px-4 py-3">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-600 text-2xl leading-none hover:text-black"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="p-4 overflow-y-auto h-full">{children}</div>
      </div>
    </div>
  );
};

export default Slider;
