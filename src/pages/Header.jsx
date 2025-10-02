import React, { useState, useEffect, useCallback } from "react";
import Button from "../components/Button";
import { useHttp } from "../utils/axiosService";
import { useNavigate } from "react-router-dom";
import { onSocketEvent, removeSocketEvent } from "../utils/socketManager.js";

const Header = ({ onMenuClick }) => {
  const { getCall, postCall } = useHttp();
  const navigate = useNavigate();

  const userName = localStorage.getItem("username");
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  const userEmail = localStorage.getItem("email");

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ Memoize fetch function so it can be added/removed as socket listener
  const fetchUnreadCount = useCallback(async () => {
    if (!localStorage.getItem("email")) return; // avoid after logout
    try {
      const res = await getCall(`/v1/rfqs/unread-notifications-count`);
      if (res?.status === "success") {
        setUnreadCount(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, [getCall]);

  // ✅ Register socket listener only while logged in
  useEffect(() => {
    if (!userEmail) return;
    onSocketEvent("notificationTrigger", fetchUnreadCount);
    return () => {
      removeSocketEvent("notificationTrigger", fetchUnreadCount);
    };
  }, [userEmail, fetchUnreadCount]);

  // ✅ Initial unread count
  useEffect(() => {
    if (userEmail) {
      fetchUnreadCount();
    }
  }, [userEmail]);

  const handleMouseEnter = async () => {
    if (!userEmail) return;
    setShowDropdown(true);
    try {
      const res = await getCall(`/v1/rfqs/notifications`);
      if (res?.status === "success") {
        setNotifications(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleMouseLeave = async () => {
    setShowDropdown(false);
    if (!userEmail) return;

    const unreadIds = notifications
      .filter((n) => !n.seen_by.includes(userEmail))
      .map((n) => n._id);

    if (unreadIds.length > 0) {
      try {
        await postCall(`/v1/rfqs/mark-notifications-read`, {
          notifications: unreadIds,
        });
        setUnreadCount(0);
        setNotifications((prev) =>
          prev.map((n) =>
            unreadIds.includes(n._id)
              ? { ...n, seen_by: [...n.seen_by, userEmail] }
              : n
          )
        );
      } catch (err) {
        console.error("Failed to mark notifications as read:", err);
      }
    }
  };

  const onClickLogOut = async () => {
    try {
      const res = await postCall("/v1/auth/logout");
      if (res.status === "success") {
        // ✅ Cleanup before redirect
        removeSocketEvent("notificationTrigger", fetchUnreadCount);
        setUnreadCount(0);
        setNotifications([]);
        localStorage.clear();
        navigate("/login");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const onClickHome = () => {
    navigate("/rfq-summary");
  };

  return (
    <header className="w-full bg-blue-600 text-white flex items-center justify-between p-4 shadow">
      <div className="flex items-center gap-4">
        <Button
          label="☰"
          onClick={onMenuClick}
          className="p-2"
          title="Menu"
        />
        <h1 className="text-xl font-bold">
          {userName || `${firstName || ""} ${lastName || ""}`}
        </h1>
      </div>

      <nav className="hidden md:flex items-center gap-4 relative">
        {/* Notification Bell */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            type="button"
            className="relative p-2 rounded-full hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6 text-gray-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a1.5 1.5 0 01-.857.918V19.5a1.5 1.5 0 11-3 0v-1.5a1.5 1.5 0 01-.857-.918M18 8.25a6 6 0 10-12 0c0 3.5-1.5 5.25-3 6h18c-1.5-0.75-3-2.5-3-6z"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-black shadow-lg rounded-lg overflow-hidden z-50">
              {notifications.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No notifications</div>
              ) : (
                <ul className="max-h-96 overflow-y-auto">
                  {notifications.map((n) => {
                    const isUnread = !n.seen_by.includes(userEmail);
                    return (
                      <li
                        key={n._id}
                        className={`p-3 text-sm border-b last:border-none ${
                          isUnread ? "bg-gray-100 font-semibold" : "bg-white"
                        }`}
                      >
                        {n.notification}
                        <div className="text-xs text-gray-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        <Button onClick={onClickHome} label="Home" />
        <Button onClick={onClickLogOut} label="Logout" />
      </nav>
    </header>
  );
};

export default Header;
