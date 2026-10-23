"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/forms";
import { dateTime, relativeAge } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";

export default function AuditPage() {
  const audit = useAppStore((s) => s.audit);
  const stations = useAppStore((s) => s.stations);
  const [q, setQ] = useState("");

  const list = useMemo(
    () =>
      audit.filter(
        (a) =>
          !q ||
          a.action.toLowerCase().includes(q.toLowerCase()) ||
          a.userName.toLowerCase().includes(q.toLowerCase()) ||
          (a.reference ?? "").toLowerCase().includes(q.toLowerCase()),
      ),
    [audit, q],
  );

  return (
    <div className="space-y-4 pb-2">
      <p className="t-body text-ink-500">Immutable trail of actions</p>
      <SearchBar value={q} onChange={setQ} placeholder="Search audit…" />
      <div className="space-y-2">
        {list.slice(0, 50).map((a) => (
          <Card key={a.id} className="rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="t-label text-ink-900">{a.action}</div>
                <div className="t-caption text-ink-500">
                  {a.userName} · {a.module}
                  {a.stationId ? ` · ${stations.find((s) => s.id === a.stationId)?.shortName ?? ""}` : ""}
                </div>
                <div className="mt-1 t-caption text-ink-300">
                  {dateTime(a.at)} · {a.device}
                </div>
                {a.reference ? <div className="mt-1 t-caption text-ink-500">{a.reference}</div> : null}
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={a.status === "success" ? "completed" : a.status === "failed" ? "rejected" : "submitted"} />
                <span className="t-caption text-ink-300">{relativeAge(a.at)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
