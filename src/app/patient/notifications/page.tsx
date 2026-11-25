"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { NotificationItem } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Bell, CheckCheck, Info, CheckCircle2 } from "lucide-react";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications-list"],
    queryFn: () => apiFetch<NotificationItem[]>("/notifications"),
  });

  const notifications = (data?.data as any) || [];

  const markAllRead = async () => {
    try {
      await apiFetch("/notifications/read-all", { method: "PATCH" });
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries({ queryKey: ["notifications-list"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to mark notifications");
    }
  };

  const markSingleRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
      queryClient.invalidateQueries({ queryKey: ["notifications-list"] });
    } catch {}
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System & Dispatch Alerts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time status updates on ambulance dispatch, hospital triage, and payment settlements.
          </p>
        </div>
        {notifications.some((n: NotificationItem) => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-1.5 h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : notifications.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-2">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-lg">No notifications</h3>
            <p className="text-xs text-muted-foreground">
              You are all caught up!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n: NotificationItem) => (
            <Card
              key={n.id}
              onClick={() => !n.isRead && markSingleRead(n.id)}
              className={`transition cursor-pointer ${
                !n.isRead ? "border-red-500/40 bg-red-500/5" : "opacity-80 hover:opacity-100"
              }`}
            >
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{n.title}</span>
                    {!n.isRead && (
                      <Badge variant="critical" className="text-[10px] px-1.5 py-0">NEW</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
