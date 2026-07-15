"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:5000";

export function useSocket(userId: string | undefined, onNotification: (notification: unknown) => void) {
  const socketRef = useRef<Socket | null>(null);

  const handleNotification = useCallback((notification: unknown) => {
    onNotification(notification);
  }, [onNotification]);

  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      socket.emit("join", userId);
    });

    socket.on("notification:new", handleNotification);

    socketRef.current = socket;

    return () => {
      socket.off("notification:new", handleNotification);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, handleNotification]);

  return socketRef;
}
