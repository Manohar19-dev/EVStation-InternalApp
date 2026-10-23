"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { dateOf } from "@/lib/format";

export default function MaintenancePage() {
  const tickets = useAppStore((s) => s.tickets);
  const stations = useAppStore((s) => s.stations);
  const vendors = useAppStore((s) => s.vendors);

  return (
    <div className="mx-auto max-w-lg space-y-4 lg:max-w-3xl">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="t-h1">Maintenance</h1>
          <p className="t-body text-ink-500">Faults, incidents & preventive work</p>
        </div>
        <Link href="/app/maintenance/new">
          <Button size="md" leftIcon={<Plus className="h-4 w-4" />}>Raise issue</Button>
        </Link>
      </div>

      <Card className="p-0">
        {tickets.slice(0, 20).map((t) => (
          <Link key={t.id} href={`/app/maintenance/${t.id}`} className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 last:border-0 hover:bg-surface-muted/40">
            <div className="min-w-0">
              <div className="t-label">{t.title}</div>
              <div className="t-caption text-ink-500">
                {stations.find((s) => s.id === t.stationId)?.shortName} · {t.kind.replace("_", " ")} · {dateOf(t.createdAt)}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={t.status} />
              <StatusBadge status={t.priority} />
            </div>
          </Link>
        ))}
      </Card>

      <Card>
        <div className="t-label mb-2">Vendors / AMC</div>
        {vendors.map((v) => (
          <div key={v.id} className="flex justify-between border-b border-line py-2 last:border-0">
            <div>
              <div className="t-label">{v.name}</div>
              <div className="t-caption text-ink-500">{v.type.toUpperCase()} · {v.phone}</div>
            </div>
            <div className="t-caption text-ink-500">{v.amcExpiry ? `AMC ${dateOf(v.amcExpiry)}` : "—"}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}
