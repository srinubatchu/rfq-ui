import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { label: "RFQ Summary", path: "/rfq-summary" },
    { label : "User Mangement" , path : "/users"}
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      ></div>

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-100 z-50 transform transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-lg`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <h2 className="text-lg font-bold">Menu</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            ✕
          </button>
        </div>
        <ul className="flex flex-col gap-2 p-4">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`block p-2 rounded hover:bg-blue-100 ${
                  location.pathname === item.path ? "bg-blue-200 font-semibold" : ""
                }`}
                onClick={onClose} // close sidebar after click
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;
