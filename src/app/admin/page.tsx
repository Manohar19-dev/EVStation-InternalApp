"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, ArrowRight, ChevronRight, Clock, Inbox, Zap } from "lucide-react";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { stationStats } from "@/data/stations";
import { Card, SectionHeader, Skeleton } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { inr, inrShort, relativeAge, pct } from "@/lib/format";
import { DEMO_TODAY } from "@/data/employees";

export default function AdminDashboardPage() {
  const hydrated = useHydrated();
  const stations = useAppStore((s) => s.stations);
  const attendance = useAppStore((s) => s.attendance);
  const checklistRuns = useAppStore((s) => s.checklistRuns);
  const tasks = useAppStore((s) => s.tasks);
  const tickets = useAppStore((s) => s.tickets);
  const requests = useAppStore((s) => s.requests);
  const notifications = useAppStore((s) => s.notifications);
  const audit = useAppStore((s) => s.audit);
  const demo = useAppStore((s) => s.demo);
  const settings = useAppStore((s) => s.settings);

  const stats = useMemo(() => stationStats(stations), [stations]);
  const pending = requests.filter((r) => r.status === "submitted" || r.status === "under_review");
  const pendingValue = pending.reduce((a, r) => a + r.amount, 0);
  const aged = pending.filter((r) => Date.now() - new Date(r.createdAt).getTime() > settings.approvalAgeHours * 3600000);
  const budgetAlerts = stations.filter((s) => s.budgetMonthly > 0 && s.budgetUsed / s.budgetMonthly >= settings.budgetAlertPercent / 100);
  const criticalFaults = tickets.filter((t) => t.status === "open" && (t.priority === "critical" || t.priority === "high"));
  const todayAtt = attendance.filter((a) => a.date === DEMO_TODAY);
  const absent = todayAtt.filter((a) => a.status === "absent").length;
  const todayChecklists = checklistRuns.filter((c) => c.date === DEMO_TODAY);
  const checklistRate = todayChecklists.length
    ? Math.round((todayChecklists.filter((c) => c.status === "completed").length / todayChecklists.length) * 100)
    : 0;
  const overdueTasks = tasks.filter((t) => t.status === "overdue" || demo.overdueEscalation);
  const digitalAttendance = todayAtt.length ? Math.round(((todayAtt.length - absent) / todayAtt.length) * 100) : 100;

  if (!hydrated) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-2">
      <div>
        <p className="t-caption text-ink-500">23 Oct 2026</p>
        <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight text-ink-900">
          Good morning
        </h1>
        <p className="mt-1 t-body text-ink-500">Here&apos;s today&apos;s network overview</p>
      </div>

      {/* Network health — horizontal snap carousel + 2x2 */}
      <section>
        <SectionHeader title="Network health" />
        <div className="scroll-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {[
            { label: "Stations", value: String(stats.total), hint: `${stats.live} live` },
            { label: "Chargers free", value: `${stats.chargerAvailable}`, hint: `of ${stats.chargerTotal}` },
            { label: "Sessions", value: String(stats.activeSessions), hint: "live now" },
            { label: "Revenue", value: inrShort(stats.todayRevenue), hint: "today" },
          ].map((k) => (
            <div key={k.label} className="min-w-[132px] shrink-0 rounded-2xl border border-line bg-surface p-4 shadow-xs">
              <div className="t-caption text-ink-500">{k.label}</div>
              <div className="mt-1 font-display text-[24px] font-bold num text-ink-900">{k.value}</div>
              <div className="t-caption text-ink-500">{k.hint}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <MiniStat label="Maintenance" value={stats.maintenance} tone="warn" />
          <MiniStat label="Closed" value={stats.closed} />
          <MiniStat label="Open tickets" value={tickets.filter((t) => t.status === "open" || t.status === "in_progress").length} />
          <MiniStat label="Overdue tasks" value={overdueTasks.length} tone={overdueTasks.length ? "err" : undefined} />
        </div>
      </section>

      {/* Needs attention */}
      <section>
        <SectionHeader title="Needs your attention" />
        <div className="space-y-2">
          <AttentionRow
            href="/admin/approvals"
            icon={<Inbox className="h-5 w-5" />}
            title={`${pending.length} pending approvals`}
            body={`${inr(pendingValue)} waiting for owner`}
            tone="primary"
          />
          <AttentionRow
            href="/admin/approvals?aged=1"
            icon={<Clock className="h-5 w-5" />}
            title={`${demo.agedApprovals ? Math.max(aged.length, 3) : aged.length} aged over 24h`}
            body="Remind owner · turnaround target"
            tone="warn"
          />
          <AttentionRow
            href="/admin/operations?tab=maintenance"
            icon={<AlertTriangle className="h-5 w-5" />}
            title={`${criticalFaults.length + (demo.chargerFaultAlert ? 1 : 0)} critical faults`}
            body="High-priority maintenance open"
            tone="err"
          />
          {budgetAlerts.length ? (
            <AttentionRow
              href="/admin/stations?budget=1"
              icon={<Zap className="h-5 w-5" />}
              title={`${budgetAlerts.length} stations over ${settings.budgetAlertPercent}% budget`}
              body={budgetAlerts[0]?.shortName ?? ""}
              tone="warn"
            />
          ) : null}
        </div>
      </section>

      {/* Station status */}
      <section>
        <SectionHeader
          title="Station status"
          action={
            <Link href="/admin/stations" className="inline-flex items-center gap-0.5 t-label text-primary-700">
              All <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="space-y-2">
          {stations.slice(0, 5).map((s) => {
            const avail = s.chargers.reduce((a, c) => a + c.available, 0);
            const total = s.chargers.reduce((a, c) => a + c.connectors, 0);
            const sessions = s.chargers.reduce((a, c) => a + c.activeSessions, 0);
            return (
              <Link key={s.id} href={`/admin/stations/${s.id}`}>
                <Card className="flex items-center gap-3 rounded-2xl p-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="t-label text-ink-900">{s.shortName}</span>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="mt-0.5 t-caption text-ink-500">
                      {avail}/{total} chargers · {sessions} sessions · {s.openIssues} issues
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="t-label num">{inrShort(s.todayRevenue)}</div>
                    <ChevronRight className="ml-auto mt-0.5 h-4 w-4 text-ink-300" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* KPIs */}
      <section>
        <SectionHeader title="Success KPIs" />
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Checklists" value={`${checklistRate}%`} hint="Target ≥95%" ok={checklistRate >= 95} />
          <KpiCard label="Approvals" value="<18h" hint="Target <24h" ok />
          <KpiCard label="Unapproved $" value="0" hint="Target zero" ok />
          <KpiCard label="Attendance" value={`${digitalAttendance}%`} hint="Digital capture" ok={digitalAttendance >= 95} />
        </div>
      </section>

      {/* Activity */}
      <section>
        <SectionHeader
          title="Recent activity"
          action={
            <Link href="/admin/audit" className="t-label text-primary-700">
              Audit
            </Link>
          }
        />
        <Card className="space-y-0 rounded-2xl p-0">
          {audit.slice(0, 4).map((a) => (
            <div key={a.id} className="border-b border-line px-4 py-3 last:border-0">
              <div className="flex justify-between gap-2">
                <div className="t-label text-ink-900">{a.action}</div>
                <span className="shrink-0 t-caption text-ink-300">{relativeAge(a.at)}</span>
              </div>
              <div className="t-caption text-ink-500">
                {a.userName} · {a.module}
              </div>
            </div>
          ))}
        </Card>
      </section>

      <section>
        <SectionHeader
          title="Notifications"
          action={
            <Link href="/admin/notifications" className="t-label text-primary-700">
              All
            </Link>
          }
        />
        <Card className="rounded-2xl p-0">
          {notifications
            .filter((n) => n.audience === "admin" || n.audience === "all")
            .slice(0, 3)
            .map((n) => (
              <div key={n.id} className="border-b border-line px-4 py-3 last:border-0">
                <div className={`t-label ${n.read ? "text-ink-700" : "text-ink-900"}`}>{n.title}</div>
                <div className="t-caption text-ink-500">{n.body}</div>
              </div>
            ))}
        </Card>
      </section>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone?: "warn" | "err" }) {
  return (
    <div
      className={`rounded-2xl border p-3.5 ${
        tone === "warn" ? "border-warn-bg bg-warn-bg/40" : tone === "err" ? "border-err-bg bg-err-bg/40" : "border-line bg-surface"
      }`}
    >
      <div className="t-caption text-ink-500">{label}</div>
      <div className="mt-0.5 font-display text-[22px] font-bold num">{value}</div>
    </div>
  );
}

function AttentionRow({
  href,
  icon,
  title,
  body,
  tone,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  tone: "primary" | "warn" | "err";
}) {
  const tint =
    tone === "primary"
      ? "bg-primary-50 text-primary-700"
      : tone === "warn"
        ? "bg-warn-bg text-warn-fg"
        : "bg-err-bg text-err-fg";
  return (
    <Link href={href} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-xs active:scale-[0.99]">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tint}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="t-label text-ink-900">{title}</div>
        <div className="t-caption text-ink-500">{body}</div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
    </Link>
  );
}

function KpiCard({ label, value, hint, ok }: { label: string; value: string; hint: string; ok?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3.5 ${ok ? "border-ok-bg bg-ok-bg/30" : "border-warn-bg bg-warn-bg/30"}`}>
      <div className="t-caption text-ink-500">{label}</div>
      <div className="mt-0.5 font-display text-[22px] font-bold num text-ink-900">{value}</div>
      <div className="t-caption text-ink-500">{hint}</div>
    </div>
  );
}
