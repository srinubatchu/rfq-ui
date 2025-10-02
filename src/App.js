import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import SetPassword from "./pages/SetPassword";
import CreateRFQForm from "./pages/CreateRFQForm";
import UserManagement from "./pages/UserManagement";
import RFQSummary from "./pages/RFQSummary";
import BidDetails from "./pages/BidDetailsScreen";

// Socket
import { initializeSocket, disconnectSocket } from "./utils/socketManager";

// Layout
import AppLayout from "./pages/AppLayout";

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem("authToken");
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

function App() {
  useEffect(() => {
    const userEmail = localStorage.getItem("email")
    const userRole = localStorage.getItem("role")
    // 🔌 Initialize socket connection when app mounts
    initializeSocket(userEmail , userRole);

    // 🔌 Disconnect when app unmounts
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/set-password" element={<SetPassword />} />

        {/* Protected Routes with Layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/create-rfq" element={<CreateRFQForm />} />
          <Route path="/rfq-summary" element={<RFQSummary />} />
          <Route path="/bid-details/:rfqId" element={<BidDetails />} />
          <Route path="/users" element={<UserManagement />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
