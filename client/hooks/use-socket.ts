"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) return;

    const user = JSON.parse(userStr);
    
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      socketRef.current?.emit("join", user.id);
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
    });

    socketRef.current.on("low-stock-alert", (alert) => {
      setLowStockAlerts((prev) => [...prev, alert]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const clearAlerts = () => setLowStockAlerts([]);

  return {
    isConnected,
    lowStockAlerts,
    clearAlerts,
  };
}