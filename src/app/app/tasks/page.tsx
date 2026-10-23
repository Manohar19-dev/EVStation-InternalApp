"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card, EmptyState } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Chip, ChipGroup, SearchBar } from "@/components/ui/forms";
import { dateOf } from "@/lib/format";
import type { TaskStatus } from "@/types";

export default function TasksPage() {
  const session = useAppStore((s) => s.session);
  const tasks = useAppStore((s) => s.tasks);
  const stations = useAppStore((s) => s.stations);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TaskStatus | "all">("all");

  const list = useMemo(() => {
    return tasks
      .filter((t) => t.assigneeId === session.personaId || true)
      .filter((t) => (status === "all" ? true : t.status === status))
      .filter((t) => !q || t.title.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => (a.status === "overdue" ? -1 : b.status === "overdue" ? 1 : 0));
  }, [tasks, session.personaId, status, q]);

  const mine = list.filter((t) => t.assigneeId === session.personaId);

  return (
    <div className="mx-auto max-w-lg space-y-4 lg:max-w-3xl">
      <div>
        <h1 className="t-h1">Tasks</h1>
        <p className="t-body text-ink-500">{mine.length} assigned to you</p>
      </div>
      <SearchBar value={q} onChange={setQ} placeholder="Search tasks…" />
      <ChipGroup>
        {(["all", "open", "in_progress", "overdue", "completed"] as const).map((s) => (
          <Chip key={s} selected={status === s} onClick={() => setStatus(s)}>
            {s === "all" ? "All" : s.replace("_", " ")}
          </Chip>
        ))}
      </ChipGroup>
      {!mine.length ? (
        <Card className="rounded-2xl">
          <EmptyState title="No tasks" body="You're all clear for now." />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {mine.map((t) => (
            <Link key={t.id} href={`/app/tasks/${t.id}`}>
              <Card className="rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="t-label text-ink-900">{t.title}</div>
                    <div className="mt-1 t-caption text-ink-500">
                      {stations.find((s) => s.id === t.stationId)?.shortName} · Due {dateOf(t.dueAt)}
                      {t.recurring ? " · Recurring" : ""}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={t.status} />
                    <StatusBadge status={t.priority} />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
