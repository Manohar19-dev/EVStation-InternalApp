"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Chip, ChipGroup } from "@/components/ui/forms";
import { DEMO_TODAY } from "@/data/employees";
import { dateOf } from "@/lib/format";

type Tab = "tasks" | "maintenance" | "attendance" | "checklists";

function OpsInner() {
  const params = useSearchParams();
  const initial = (params.get("tab") as Tab) || "tasks";
  const [tab, setTab] = useState<Tab>(initial);
  const tasks = useAppStore((s) => s.tasks);
  const tickets = useAppStore((s) => s.tickets);
  const attendance = useAppStore((s) => s.attendance);
  const checklistRuns = useAppStore((s) => s.checklistRuns);
  const employees = useAppStore((s) => s.employees);
  const stations = useAppStore((s) => s.stations);

  const todayAtt = useMemo(() => attendance.filter((a) => a.date === DEMO_TODAY), [attendance]);
  const todayCl = useMemo(() => checklistRuns.filter((c) => c.date === DEMO_TODAY), [checklistRuns]);

  return (
    <div className="space-y-4 pb-2">
      <div className="scroll-hide -mx-4 overflow-x-auto px-4">
        <ChipGroup className="flex-nowrap">
          {(
            [
              ["tasks", "Tasks"],
              ["maintenance", "Maintenance"],
              ["attendance", "Attendance"],
              ["checklists", "Checklists"],
            ] as const
          ).map(([v, l]) => (
            <Chip key={v} selected={tab === v} onClick={() => setTab(v)}>
              {l}
            </Chip>
          ))}
        </ChipGroup>
      </div>

      {tab === "tasks" ? (
        <div className="space-y-2">
          {tasks.slice(0, 25).map((t) => (
            <Card key={t.id} className="rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="t-label">{t.title}</div>
                  <div className="t-caption text-ink-500">
                    {stations.find((s) => s.id === t.stationId)?.shortName} · {employees.find((e) => e.id === t.assigneeId)?.name}
                  </div>
                  <div className="mt-1 t-caption text-ink-500">Due {dateOf(t.dueAt)}</div>
                </div>
                <StatusBadge status={t.status} />
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {tab === "maintenance" ? (
        <div className="space-y-2">
          {tickets.slice(0, 25).map((t) => (
            <Card key={t.id} className="rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="t-label">{t.title}</div>
                  <div className="t-caption text-ink-500">
                    {stations.find((s) => s.id === t.stationId)?.shortName} · {t.kind.replace("_", " ")}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {tab === "attendance" ? (
        <div className="space-y-2">
          {todayAtt.slice(0, 40).map((a) => (
            <Card key={a.id} className="flex items-center justify-between rounded-2xl p-3.5">
              <div>
                <Link href={`/admin/employees/${a.employeeId}`} className="t-label text-primary-800">
                  {employees.find((e) => e.id === a.employeeId)?.name}
                </Link>
                <div className="t-caption text-ink-500">{stations.find((s) => s.id === a.stationId)?.shortName}</div>
              </div>
              <StatusBadge status={a.status} />
            </Card>
          ))}
        </div>
      ) : null}

      {tab === "checklists" ? (
        <div className="space-y-2">
          {todayCl.map((c) => (
            <Card key={c.id} className="rounded-2xl p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="t-label">{stations.find((s) => s.id === c.stationId)?.shortName}</div>
                  <div className="t-caption text-ink-500">
                    {employees.find((e) => e.id === c.employeeId)?.name} · {c.completedPercent}%
                  </div>
                </div>
                <StatusBadge status={c.status === "completed" ? "completed" : c.status === "missed" ? "overdue" : "in_progress"} />
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full bg-primary-700" style={{ width: `${c.completedPercent}%` }} />
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <OpsInner />
    </Suspense>
  );
}
