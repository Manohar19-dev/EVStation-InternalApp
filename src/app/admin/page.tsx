"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, ArrowRight, ChevronRight, Clock, Inbox, Zap } from "lucide-react";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { stationStats } from "@/data/stations";
import { Card, SectionHeader, Skeleton } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { inr, inrShort, relativeAge } from "@/lib/format";
import { DEMO_TODAY } from "@/data/employees";

export default function AdminDashboardPage() {
  const hydrated = useHydrated();
  const stations = useAppStore((s) => s.stations);
  const attendance = useAppStore((s) => s.attendance);
  const checklistRuns = useAppStore((s) => s.checklistRuns);
  const tasks = useAppStore((s) => s.tasks);
  const tickets = useAppStore((s) => s.tickets);
  const requests = useAppStore((s) => s.requests);
  const audit = useAppStore((s) => s.audit);
  const demo = useAppStore((s) => s.demo);
  const settings = useAppStore((s) => s.settings);

  const stats = useMemo(() => stationStats(stations), [stations]);
  const pending = requests.filter((r) => r.status === "submitted" || r.status === "under_review");
  const pendingValue = pending.reduce((a, r) => a + r.amount, 0);
  const aged = pending.filter((r) => Date.now() - new Date(r.createdAt).getTime() > settings.approvalAgeHours * 3600000);
  const budgetAlerts = stations.filter((s) => s.budgetMonthly > 0 && s.budgetUsed / s.budgetMonthly >= settings.budgetAlertPercent / 100);
  const criticalFaults = tickets.filter((t) => t.status === "open" && (t.priority === "critical" || t.priority === "high"));
  const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;
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
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-[22px] font-bold leading-tight tracking-tight text-ink-900">
            Good morning
          </h1>
          <p className="mt-0.5 t-body text-ink-500">Network overview</p>
        </div>
        <p className="shrink-0 pt-1 t-caption text-ink-500">23 Oct 2026</p>
      </div>

      {/* Compact network snapshot */}
      <section className="grid grid-cols-2 gap-2.5">
        <SnapCard label="Stations" value={`${stats.live}/${stats.total}`} hint="live" />
        <SnapCard label="Sessions" value={String(stats.activeSessions)} hint={`${stats.chargerAvailable} free`} />
        <SnapCard label="Revenue" value={inrShort(stats.todayRevenue)} hint="today" />
        <SnapCard
          label="Issues"
          value={String(openTickets + overdueTasks.length)}
          hint={`${overdueTasks.length} overdue`}
          tone={openTickets + overdueTasks.length ? "warn" : undefined}
        />
      </section>

      {/* Needs attention */}
      <section>
        <SectionHeader title="Needs attention" />
        <div className="space-y-2">
          <AttentionRow
            href="/admin/approvals"
            icon={<Inbox className="h-4 w-4" />}
            title={`${pending.length} approvals`}
            body={inr(pendingValue)}
            tone="primary"
          />
          {(demo.agedApprovals || aged.length > 0) && (
            <AttentionRow
              href="/admin/approvals?aged=1"
              icon={<Clock className="h-4 w-4" />}
              title={`${demo.agedApprovals ? Math.max(aged.length, 3) : aged.length} aged >24h`}
              body="Needs owner review"
              tone="warn"
            />
          )}
          {(criticalFaults.length > 0 || demo.chargerFaultAlert) && (
            <AttentionRow
              href="/admin/operations?tab=maintenance"
              icon={<AlertTriangle className="h-4 w-4" />}
              title={`${criticalFaults.length + (demo.chargerFaultAlert ? 1 : 0)} critical faults`}
              body="Maintenance"
              tone="err"
            />
          )}
          {budgetAlerts.length > 0 && (
            <AttentionRow
              href="/admin/stations?budget=1"
              icon={<Zap className="h-4 w-4" />}
              title={`${budgetAlerts.length} over budget`}
              body={budgetAlerts[0]?.shortName ?? ""}
              tone="warn"
            />
          )}
        </div>
      </section>

      {/* KPI strip */}
      <section className="flex gap-2 overflow-x-auto scroll-hide -mx-4 px-4">
        <KpiChip label="Checklists" value={`${checklistRate}%`} ok={checklistRate >= 95} />
        <KpiChip label="Approvals" value="<18h" ok />
        <KpiChip label="Attendance" value={`${digitalAttendance}%`} ok={digitalAttendance >= 95} />
      </section>

      {/* Stations */}
      <section>
        <SectionHeader
          title="Stations"
          action={
            <Link href="/admin/stations" className="inline-flex items-center gap-0.5 t-label text-primary-700">
              All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <div className="space-y-2">
          {stations.slice(0, 4).map((s) => {
            const avail = s.chargers.reduce((a, c) => a + c.available, 0);
            const total = s.chargers.reduce((a, c) => a + c.connectors, 0);
            const sessions = s.chargers.reduce((a, c) => a + c.activeSessions, 0);
            return (
              <Link key={s.id} href={`/admin/stations/${s.id}`}>
                <Card className="flex items-center gap-3 rounded-2xl p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="t-label text-ink-900">{s.shortName}</span>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="mt-0.5 t-caption text-ink-500">
                      {avail}/{total} free · {sessions} live
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
        <Card className="rounded-2xl p-0">
          {audit.slice(0, 3).map((a) => (
            <div key={a.id} className="border-b border-line px-3.5 py-2.5 last:border-0">
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
    </div>
  );
}

function SnapCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "warn";
}) {
  return (
    <div
      className={`rounded-2xl border p-3 ${
        tone === "warn" ? "border-warn-bg bg-warn-bg/40" : "border-line bg-surface shadow-xs"
      }`}
    >
      <div className="t-caption text-ink-500">{label}</div>
      <div className="mt-0.5 font-display text-[18px] font-bold num text-ink-900">{value}</div>
      <div className="t-caption text-ink-500">{hint}</div>
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
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-xs active:scale-[0.99]"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tint}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="t-label text-ink-900">{title}</div>
        <div className="t-caption text-ink-500">{body}</div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
    </Link>
  );
}

function KpiChip({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div
      className={`shrink-0 rounded-full border px-3 py-1.5 ${
        ok ? "border-ok-bg bg-ok-bg/40 text-ok-fg" : "border-warn-bg bg-warn-bg/40 text-warn-fg"
      }`}
    >
      <span className="t-caption">{label}</span>
      <span className="ml-1.5 t-label num">{value}</span>
    </div>
  );
}
