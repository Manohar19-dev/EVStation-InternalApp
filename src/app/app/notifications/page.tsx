"use client";

import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { relativeAge } from "@/lib/format";

export default function EmployeeNotificationsPage() {
  const session = useAppStore((s) => s.session);
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAll = useAppStore((s) => s.markAllNotificationsRead);

  const list = notifications.filter(
    (n) =>
      (n.audience === "employee" || n.audience === "all") &&
      (!n.employeeId || n.employeeId === session.personaId),
  );

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="t-h1">Notifications</h1>
          <p className="t-body text-ink-500">Push · SMS · WhatsApp (simulated)</p>
        </div>
        <Button size="sm" variant="ghost" onClick={() => markAll("employee", session.personaId ?? undefined)}>
          Mark all read
        </Button>
      </div>
      <Card className="p-0">
        {!list.length ? <EmptyState title="All caught up" /> : null}
        {list.map((n) => (
          <button
            key={n.id}
            type="button"
            className="block w-full border-b border-line px-4 py-3 text-left last:border-0 hover:bg-surface-muted/40"
            onClick={() => markNotificationRead(n.id)}
          >
            <div className="flex justify-between gap-2">
              <div className={`t-label ${n.read ? "text-ink-700" : "text-ink-900"}`}>{n.title}</div>
              <span className="t-caption text-ink-300">{relativeAge(n.at)}</span>
            </div>
            <div className="t-caption text-ink-500">{n.body}</div>
            <div className="mt-1 flex gap-2">
              <span className="rounded-full bg-surface-muted px-2 py-0.5 t-badge text-ink-500">{n.channel}</span>
              {n.href ? (
                <Link href={n.href} className="t-caption text-primary-700" onClick={(e) => e.stopPropagation()}>
                  Open
                </Link>
              ) : null}
            </div>
          </button>
        ))}
      </Card>
    </div>
  );
}
