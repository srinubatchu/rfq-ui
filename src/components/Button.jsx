import React from "react";

const Button = ({ children, label = "", onClick, variant = "", type = "button", className = "", title = "", disabled = false }) => {
  const baseStyles = "px-4 py-2 rounded font-medium transition";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-300 text-black hover:bg-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    warning: "bg-yellow-500 text-black hover:bg-yellow-600",
    info: "bg-teal-500 text-white hover:bg-teal-600",
    light: "bg-white text-black border border-gray-300 hover:bg-gray-50",
    dark: "bg-gray-800 text-white hover:bg-gray-900",
    outlinePrimary: "border border-blue-600 text-blue-600 hover:bg-blue-50",
    outlineDanger: "border border-red-600 text-red-600 hover:bg-red-50",
  };

  return (
    <button
      title={title || label}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className}`}
    >
      {label}{children}
    </button>
  );
};

export default Button;
