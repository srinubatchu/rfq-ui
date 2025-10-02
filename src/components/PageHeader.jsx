import React from "react";

const PageHeader = ({ title, children, childrenPosition = "right" }) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>

      {children && (
        <div
          className={`flex items-center ${
            childrenPosition === "left" ? "mr-4 order-first" : ""
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
