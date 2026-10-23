"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Card, SectionHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { CLUSTER_LABELS } from "@/data/stations";
import { inr, dateOf } from "@/lib/format";

export default function StationDetailPage() {
  const { stationId } = useParams<{ stationId: string }>();
  const stations = useAppStore((s) => s.stations);
  const employees = useAppStore((s) => s.employees);
  const tickets = useAppStore((s) => s.tickets);
  const s = stations.find((x) => x.id === stationId);

  if (!s) {
    return (
      <div className="space-y-2">
        <h1 className="t-h1">Station not found</h1>
        <Link href="/admin/stations" className="t-label text-primary-700">
          Back to stations
        </Link>
      </div>
    );
  }

  const staff = employees.filter((e) => e.stationIds.includes(s.id) || e.homeStationId === s.id);
  const openTickets = tickets.filter((t) => t.stationId === s.id && t.status !== "closed" && t.status !== "resolved");
  const budgetPct = Math.round((s.budgetUsed / s.budgetMonthly) * 100);

  return (
    <div className="space-y-5 pb-2">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={s.status} />
        <span className="t-caption text-ink-500">{CLUSTER_LABELS[s.cluster]}</span>
      </div>
      <div>
        <h1 className="font-display text-[24px] font-bold leading-tight text-ink-900">{s.shortName}</h1>
        <p className="mt-1 t-body text-ink-500">{s.address}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Capacity" value={`${s.capacityKw} kW`} />
        <Stat label="Today ₹" value={inr(s.todayRevenue)} hint="Proposal 2" />
        <Stat label="Budget" value={`${budgetPct}%`} />
        <Stat label="Open issues" value={String(s.openIssues)} />
      </div>

      <section>
        <SectionHeader title="Chargers" />
        <div className="space-y-2">
          {s.chargers.map((c) => (
            <Card key={c.id} className="rounded-2xl p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="t-label">
                  {c.name} · {c.current} {c.maxKw} kW
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="mt-1 t-caption text-ink-500">
                {c.connectorType} · {c.available}/{c.connectors} free · {c.activeSessions} sessions
                {c.startMode === "assisted" ? " · Assisted" : ""}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Card className="rounded-2xl">
        <SectionHeader title="Lease & geo-fence" />
        <dl className="space-y-2.5 t-body">
          <Row label="Landlord" value={s.landlord} />
          <Row label="Lease expiry" value={dateOf(s.leaseExpiry)} />
          <Row label="Geo-fence" value={`${s.geoFence.radiusM} m`} />
          <Row label="Hours" value={s.hours} />
          <Row label="Phone" value={s.phone} />
        </dl>
      </Card>

      <Card className="rounded-2xl">
        <SectionHeader title={`Staff (${staff.length})`} />
        <div className="space-y-2">
          {staff.slice(0, 6).map((e) => (
            <Link
              key={e.id}
              href={`/admin/employees/${e.id}`}
              className="flex justify-between rounded-xl border border-line px-3 py-2.5"
            >
              <span className="t-label">{e.name}</span>
              <span className="t-caption text-ink-500">{e.jobRole.replace(/_/g, " ")}</span>
            </Link>
          ))}
        </div>
      </Card>

      <Card className="rounded-2xl">
        <SectionHeader title={`Open issues (${openTickets.length})`} />
        {openTickets.slice(0, 5).map((t) => (
          <div key={t.id} className="flex items-center justify-between border-b border-line py-2.5 last:border-0">
            <div>
              <div className="t-label">{t.title}</div>
              <div className="t-caption text-ink-500">{t.id}</div>
            </div>
            <StatusBadge status={t.status} />
          </div>
        ))}
        {!openTickets.length ? <p className="t-caption text-ink-500">No open issues</p> : null}
      </Card>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3.5">
      <div className="t-caption text-ink-500">{label}</div>
      <div className="mt-0.5 font-display text-[18px] font-bold num">{value}</div>
      {hint ? <div className="t-caption text-ink-300">{hint}</div> : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-right text-ink-900">{value}</dd>
    </div>
  );
}
