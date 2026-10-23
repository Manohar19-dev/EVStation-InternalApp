"use client";

import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { relativeAge } from "@/lib/format";

export default function AdminNotificationsPage() {
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAll = useAppStore((s) => s.markAllNotificationsRead);
  const list = notifications.filter((n) => n.audience === "admin" || n.audience === "all");

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="t-h1">Notifications</h1>
          <p className="t-body text-ink-500">Approvals, faults, checklist alerts</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => markAll("admin")}>Mark all read</Button>
      </div>
      <Card className="p-0">
        {!list.length ? <EmptyState title="No notifications" /> : null}
        {list.map((n) => (
          <div key={n.id} className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 last:border-0">
            <button type="button" className="min-w-0 flex-1 text-left" onClick={() => markNotificationRead(n.id)}>
              <div className={`t-label ${n.read ? "text-ink-700" : "text-ink-900"}`}>{n.title}</div>
              <div className="t-caption text-ink-500">{n.body}</div>
              <div className="mt-1 flex gap-2">
                <span className="rounded-full bg-surface-muted px-2 py-0.5 t-badge text-ink-500">{n.channel}</span>
                <span className="t-caption text-ink-300">{relativeAge(n.at)}</span>
              </div>
            </button>
            {n.href ? <Link href={n.href} className="t-label text-primary-700">Open</Link> : null}
          </div>
        ))}
      </Card>
    </div>
  );
}
