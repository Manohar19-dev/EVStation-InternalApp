"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Chip, ChipGroup, SearchBar } from "@/components/ui/forms";
import { CLUSTER_LABELS } from "@/data/stations";
import { inrShort } from "@/lib/format";
import type { ClusterId, StationStatus } from "@/types";

function StationsInner() {
  const params = useSearchParams();
  const stations = useAppStore((s) => s.stations);
  const settings = useAppStore((s) => s.settings);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StationStatus | "all">("all");
  const [cluster, setCluster] = useState<ClusterId | "all">("all");

  const filtered = useMemo(() => {
    return stations.filter((s) => {
      if (params.get("budget") === "1" && s.budgetUsed / s.budgetMonthly < settings.budgetAlertPercent / 100) return false;
      if (status !== "all" && s.status !== status) return false;
      if (cluster !== "all" && s.cluster !== cluster) return false;
      if (q) {
        const qq = q.toLowerCase();
        if (!s.name.toLowerCase().includes(qq) && !s.area.toLowerCase().includes(qq)) return false;
      }
      return true;
    });
  }, [stations, q, status, cluster, params, settings.budgetAlertPercent]);

  return (
    <div className="space-y-4 pb-2">
      <p className="t-body text-ink-500">{filtered.length} of {stations.length} stations</p>
      <SearchBar value={q} onChange={setQ} placeholder="Search stations…" />
      <div className="scroll-hide -mx-4 overflow-x-auto px-4">
        <ChipGroup className="flex-nowrap">
          {(["all", "live", "under_maintenance", "closed"] as const).map((s) => (
            <Chip key={s} selected={status === s} onClick={() => setStatus(s)}>
              {s === "all" ? "All" : s === "under_maintenance" ? "Maint." : s}
            </Chip>
          ))}
        </ChipGroup>
      </div>
      <div className="scroll-hide -mx-4 overflow-x-auto px-4">
        <ChipGroup className="flex-nowrap">
          <Chip selected={cluster === "all"} onClick={() => setCluster("all")}>All clusters</Chip>
          {(Object.keys(CLUSTER_LABELS) as ClusterId[]).map((c) => (
            <Chip key={c} selected={cluster === c} onClick={() => setCluster(c)}>
              {CLUSTER_LABELS[c]}
            </Chip>
          ))}
        </ChipGroup>
      </div>

      <div className="space-y-2.5">
        {filtered.map((s) => {
          const avail = s.chargers.reduce((a, c) => a + c.available, 0);
          const total = s.chargers.reduce((a, c) => a + c.connectors, 0);
          const sessions = s.chargers.reduce((a, c) => a + c.activeSessions, 0);
          return (
            <Link key={s.id} href={`/admin/stations/${s.id}`}>
              <Card className="rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="t-label text-ink-900">{s.shortName}</div>
                    <div className="t-caption text-ink-500">
                      {s.area} · {CLUSTER_LABELS[s.cluster]}
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="t-caption text-ink-500">
                    {avail}/{total} chargers · {sessions} sessions
                    {s.openIssues ? ` · ${s.openIssues} issues` : ""}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="t-label num">{inrShort(s.todayRevenue)}</span>
                    <ChevronRight className="h-4 w-4 text-ink-300" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <StationsInner />
    </Suspense>
  );
}
