"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "mentor_approval" | "mentor_revision" | "certificate_issued" | "announcement" | "system";
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

function iconForType(type: NotificationItem["type"]) {
  switch (type) {
    case "mentor_approval":
      return "🎉";
    case "mentor_revision":
      return "📝";
    case "certificate_issued":
      return "🎓";
    case "announcement":
      return "📢";
    default:
      return "🔔";
  }
}

export function NotificationDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Best-effort
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Close on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ markAllRead: true }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Best-effort
    }
  };

  const handleClickItem = async (item: NotificationItem) => {
    if (!item.is_read) {
      try {
        const { data: sessionData } = await supabaseBrowser.auth.getSession();
        const token = sessionData.session?.access_token;
        if (token) {
          fetch("/api/notifications", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ notificationId: item.id }),
          });
          setNotifications((prev) =>
            prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch {
        // Best-effort
      }
    }

    setOpen(false);
    if (item.link_url) {
      router.push(item.link_url);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) fetchNotifications();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded border border-border text-ink-soft transition-colors hover:border-accent hover:text-ink"
      >
        <span className="text-base leading-none">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-paper-raised shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-paper">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-semibold text-ink">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 dark:bg-red-950 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-300">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[11px] font-medium text-accent-hover hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-border/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-ink-muted">
                <p className="text-2xl mb-1">📭</p>
                <p className="text-xs">No notifications yet.</p>
                <p className="text-[11px] mt-0.5 text-ink-soft">
                  You&apos;ll be notified when mentors review your work or awards are unlocked.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleClickItem(item)}
                  className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 hover:bg-paper ${
                    !item.is_read ? "bg-accent-tint/30" : "bg-paper-raised"
                  }`}
                >
                  <span className="text-lg shrink-0 mt-0.5">{iconForType(item.type)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs ${!item.is_read ? "font-bold text-ink" : "font-medium text-ink-soft"}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-ink-muted shrink-0">
                        {timeAgo(item.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                  {!item.is_read && (
                    <span className="h-2 w-2 rounded-full bg-accent shrink-0 mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-2 bg-paper/50 text-center">
            <Link
              href="/dashboard/community"
              onClick={() => setOpen(false)}
              className="text-[11px] font-medium text-ink-muted hover:text-ink transition-colors"
            >
              Visit Community &amp; Announcements →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
