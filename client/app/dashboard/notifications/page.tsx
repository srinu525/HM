"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [message, setMessage] = useState("");

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch {}
  };

  useEffect(() => {
    async function load() {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    }
    load();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setMessage("All notifications marked as read");
      fetchNotifications();
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread notification(s)` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {message && (
        <div className="p-3 rounded-md text-sm bg-green-50 text-green-700">{message}</div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No notifications yet</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 flex items-start justify-between ${
                    !notif.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {notif.type}
                      </Badge>
                      {!notif.isRead && (
                        <Badge className="text-xs bg-blue-500">New</Badge>
                      )}
                    </div>
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsRead(notif.id)}
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
