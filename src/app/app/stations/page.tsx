"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { SearchBar } from "@/components/ui/forms";
import { CLUSTER_LABELS } from "@/data/stations";

export default function EmployeeStationsPage() {
  const stations = useAppStore((s) => s.stations);
  const [q, setQ] = useState("");
  const list = useMemo(
    () => stations.filter((s) => !q || s.shortName.toLowerCase().includes(q.toLowerCase()) || s.area.toLowerCase().includes(q.toLowerCase())),
    [stations, q],
  );

  return (
    <div className="mx-auto max-w-lg space-y-4 lg:max-w-3xl">
      <h1 className="t-h1">Stations</h1>
      <SearchBar value={q} onChange={setQ} placeholder="Search…" />
      <Card className="p-0">
        {list.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 last:border-0">
            <div>
              <div className="t-label">{s.shortName}</div>
              <div className="t-caption text-ink-500">
                {CLUSTER_LABELS[s.cluster]} · {s.area}
              </div>
            </div>
            <StatusBadge status={s.status} />
          </div>
        ))}
      </Card>
    </div>
  );
}
