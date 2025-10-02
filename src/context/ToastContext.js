// src/context/ToastContext.js
import React, { createContext, useCallback, useContext, useState } from "react";
import Toast from "../components/Toast.jsx"; // your custom component

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toastData, setToastData] = useState({
    message: "",
    type: "success",
  });

  const showToast = useCallback((message, type = "success") => {
    console.log(message , type)
    setToastData({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToastData({ ...toastData, message: "" });
  }, [toastData]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        message={toastData.message}
        type={toastData.type}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
