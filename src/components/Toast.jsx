import React, { useEffect, useState } from "react";

const Toast = React.memo(({ message, onClose, type = "success" }) => {
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    if (!message) return;

    setHiding(false);

    const showTimer = setTimeout(() => {
      setHiding(true);
    }, 2700);

    const hideTimer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999]  /* 👈 always on top & centered */
        flex items-center gap-3 rounded-xl shadow-lg px-4 py-3 text-white transition-all duration-300
        ${hiding ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"} 
        ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
    >
      <div className="flex-shrink-0">
        {type === "success" ? (
          <svg
            viewBox="0 0 52 52"
            className="w-6 h-6 text-white stroke-current"
            fill="none"
            strokeWidth="4"
          >
            <circle cx="26" cy="26" r="24" className="opacity-50" />
            <path d="M14 27l7 7 16-16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 52 52"
            className="w-6 h-6 text-white stroke-current"
            fill="none"
            strokeWidth="4"
          >
            <circle cx="26" cy="26" r="24" className="opacity-50" />
            <line x1="16" y1="16" x2="36" y2="36" strokeLinecap="round" />
            <line x1="36" y1="16" x2="16" y2="36" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
});

export default Toast;
