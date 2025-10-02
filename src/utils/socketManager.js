import { io } from "socket.io-client";

let socket = null;
let listeners = {}; // store event -> [callbacks]

export const initializeSocket = (userEmail , userRole) => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);

      // Register this user with backend
      if (userEmail && userRole) {
        socket.emit("register", {email : userEmail , role : userRole});
      }
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    // Generic handler: forward any event to registered listeners
    socket.onAny((event, payload) => {
      console.log(`📡 Event received: ${event}`, payload);
      if (listeners[event]) {
        listeners[event].forEach((cb) => cb(payload));
      }
    });
  }
};

// 👉 Register listener for any socket event
export const onSocketEvent = (event, callback) => {
  if (!listeners[event]) {
    listeners[event] = [];
  }
  if (!listeners[event].includes(callback)) {
    listeners[event].push(callback);
  }
};

// 👉 Emit event to backend
export const emitSocketEvent = (event, payload) => {
  if (socket && socket.connected) {
    socket.emit(event, payload);
    console.log(`📤 Emitted ${event}:`, payload);
  } else {
    console.warn("⚠️ Socket not connected, cannot emit:", event);
  }
};

// 👉 Disconnect
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    listeners = {};
    console.log("🔌 Socket disconnected");
  }
};


export const removeSocketEvent = (event, callback) => {
  if (socket) {
    socket.off(event, callback);
  }
};

