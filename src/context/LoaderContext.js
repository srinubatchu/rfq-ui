import React, { createContext, useState, useContext } from "react";

// Create the context
const LoaderContext = createContext();

// Export the provider component
export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  return (
    <LoaderContext.Provider value={{ loading, showLoader, hideLoader }}>
      {children}
    </LoaderContext.Provider>
  );
};

// Custom hook to use the context
export const useLoader = () => {
  return useContext(LoaderContext);
};
