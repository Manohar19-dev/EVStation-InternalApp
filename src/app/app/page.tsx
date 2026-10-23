"use client";

import Link from "next/link";
import { AlertTriangle, Banknote, CheckSquare, ChevronRight, LogIn } from "lucide-react";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { Card, Skeleton } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DEMO_TODAY } from "@/data/employees";
import { inr, relativeAge } from "@/lib/format";
import { REQUEST_TYPE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/cn";

export default function EmployeeHomePage() {
  const hydrated = useHydrated();
  const session = useAppStore((s) => s.session);
  const employees = useAppStore((s) => s.employees);
  const stations = useAppStore((s) => s.stations);
  const attendance = useAppStore((s) => s.attendance);
  const checklistRuns = useAppStore((s) => s.checklistRuns);
  const tasks = useAppStore((s) => s.tasks);
  const tickets = useAppStore((s) => s.tickets);
  const requests = useAppStore((s) => s.requests);
  const notifications = useAppStore((s) => s.notifications);
  const demo = useAppStore((s) => s.demo);

  const me = employees.find((e) => e.id === session.personaId);
  const station = stations.find((s) => s.id === me?.homeStationId);
  const todayAtt = attendance.find((a) => a.employeeId === me?.id && a.date === DEMO_TODAY);
  const checkedIn = todayAtt?.status === "checked_in" || todayAtt?.status === "late";
  const checklist = checklistRuns.find((c) => c.employeeId === me?.id && c.date === DEMO_TODAY);
  const myTasks = tasks
    .filter((t) => t.assigneeId === me?.id && t.status !== "completed")
    .sort((a, b) => (a.status === "overdue" ? -1 : b.status === "overdue" ? 1 : 0));
  const myTickets = tickets.filter((t) => t.reporterId === me?.id || t.assigneeId === me?.id).slice(0, 2);
  const myRequests = requests.filter((r) => r.requesterId === me?.id).slice(0, 3);
  const myNotifs = notifications
    .filter((n) => n.audience === "employee" && (!n.employeeId || n.employeeId === me?.id))
    .slice(0, 2);

  if (!hydrated) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  const actions = [
    { href: "/app/attendance", label: "Check In", icon: LogIn, tint: "bg-primary-50 text-primary-700" },
    { href: "/app/checklists", label: "Today's Checklist", icon: CheckSquare, tint: "bg-sage-100 text-sage-600" },
    { href: "/app/maintenance/new", label: "Raise Issue", icon: AlertTriangle, tint: "bg-warn-bg text-warn-fg" },
    { href: "/app/requests/new", label: "Request Money", icon: Banknote, tint: "bg-clay-100 text-clay-700" },
  ];

  return (
    <div className="space-y-5 pb-2">
      {demo.offline ? (
        <div className="rounded-2xl bg-warn-bg px-3 py-2.5 t-caption text-warn-fg">Offline · captures will sync later</div>
      ) : null}

      {/* Hero */}
      <div className="overflow-hidden rounded-[24px] bg-gradient-to-br from-primary-900 to-primary-700 p-5 text-white shadow-md">
        <div className="text-[12px] text-white/70">
          {station?.shortName} · {me?.shiftPattern}
        </div>
        <div className="mt-2 font-display text-[20px] font-bold leading-tight">
          {checkedIn ? "You're checked in" : "Not checked in yet"}
        </div>
        <p className="mt-1 text-[12px] text-white/80">
          {checkedIn
            ? `Since ${todayAtt?.checkInAt ? new Date(todayAtt.checkInAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) : "—"}`
            : "Geo-fence + selfie required"}
        </p>
        <Link href="/app/attendance" className="mt-4 inline-flex">
          <Button size="md" className="bg-white text-primary-900 hover:bg-primary-50">
            {checkedIn ? "View attendance" : "Check in now"}
          </Button>
        </Link>
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="mb-3 font-display text-[13px] font-bold uppercase tracking-[0.06em] text-ink-500">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex min-h-[112px] flex-col items-start justify-between gap-3 rounded-2xl border border-line bg-surface p-4 shadow-xs active:scale-[0.98]"
            >
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", a.tint)}>
                <a.icon className="h-5 w-5" />
              </div>
              <span className="t-label leading-snug text-ink-900">{a.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Progress */}
      <Card className="rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="t-label">Today&apos;s checklist</div>
          <Link href="/app/checklists" className="t-caption text-primary-700">
            Open
          </Link>
        </div>
        <div className="mt-2 flex items-end justify-between">
          <div className="font-display text-[24px] font-bold num">{checklist?.completedPercent ?? 0}%</div>
          <StatusBadge status={checklist?.status === "completed" ? "completed" : "in_progress"} />
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-primary-700 transition-all" style={{ width: `${checklist?.completedPercent ?? 0}%` }} />
        </div>
      </Card>

      {/* Tasks */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.06em] text-ink-500">My tasks</h2>
          <Link href="/app/tasks" className="t-caption text-primary-700">
            See all
          </Link>
        </div>
        <div className="space-y-2">
          {myTasks.slice(0, 3).map((t) => (
            <Link key={t.id} href={`/app/tasks/${t.id}`}>
              <Card className="flex items-center gap-3 rounded-2xl p-3.5">
                <div className="min-w-0 flex-1">
                  <div className="t-label text-ink-900">{t.title}</div>
                  <div className="t-caption text-ink-500">{t.priority} priority</div>
                </div>
                <StatusBadge status={t.status} />
                <ChevronRight className="h-4 w-4 text-ink-300" />
              </Card>
            </Link>
          ))}
          {!myTasks.length ? <p className="t-caption text-ink-500">No open tasks</p> : null}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.06em] text-ink-500">Maintenance</h2>
          <Link href="/app/maintenance" className="t-caption text-primary-700">
            All
          </Link>
        </div>
        <div className="space-y-2">
          {myTickets.map((t) => (
            <Link key={t.id} href={`/app/maintenance/${t.id}`}>
              <Card className="flex items-center justify-between rounded-2xl p-3.5">
                <div className="min-w-0">
                  <div className="truncate t-label">{t.title}</div>
                  <div className="t-caption text-ink-500">{t.id}</div>
                </div>
                <StatusBadge status={t.status} />
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.06em] text-ink-500">My requests</h2>
          <Link href="/app/requests" className="t-caption text-primary-700">
            All
          </Link>
        </div>
        <div className="space-y-2">
          {myRequests.map((r) => (
            <Link key={r.id} href={`/app/requests/${r.id}`}>
              <Card className="flex items-center justify-between rounded-2xl p-3.5">
                <div className="min-w-0">
                  <div className="truncate t-label">{r.title}</div>
                  <div className="t-caption text-ink-500">
                    {REQUEST_TYPE_LABELS[r.type]}
                    {r.amount ? ` · ${inr(r.amount)}` : ""}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.06em] text-ink-500">Alerts</h2>
          <Link href="/app/notifications" className="t-caption text-primary-700">
            All
          </Link>
        </div>
        <Card className="rounded-2xl p-0">
          {myNotifs.map((n) => (
            <div key={n.id} className="border-b border-line px-4 py-3 last:border-0">
              <div className="flex justify-between gap-2">
                <div className={`t-label ${n.read ? "text-ink-700" : "text-ink-900"}`}>{n.title}</div>
                <span className="t-caption text-ink-300">{relativeAge(n.at)}</span>
              </div>
              <div className="t-caption text-ink-500">{n.body}</div>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
