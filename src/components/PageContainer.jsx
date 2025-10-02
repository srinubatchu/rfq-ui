import React from "react";

const PageContainer = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-6">
      {children}
    </div>
  );
};

export default PageContainer;
