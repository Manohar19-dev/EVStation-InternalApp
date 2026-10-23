"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/overlays";
import { dateTime } from "@/lib/format";

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const tickets = useAppStore((s) => s.tickets);
  const stations = useAppStore((s) => s.stations);
  const vendors = useAppStore((s) => s.vendors);
  const updateTicketStatus = useAppStore((s) => s.updateTicketStatus);
  const { toast } = useToast();
  const t = tickets.find((x) => x.id === ticketId);

  if (!t) {
    return (
      <div>
        <h1 className="t-h1">Ticket not found</h1>
        <Link href="/app/maintenance" className="t-label text-primary-700">Back</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <Link href="/app/maintenance" className="t-caption text-primary-700">← Maintenance</Link>
      <div className="flex flex-wrap gap-2">
        <StatusBadge status={t.status} />
        <StatusBadge status={t.priority} />
      </div>
      <h1 className="t-h1">{t.title}</h1>
      <p className="t-body text-ink-700">{t.description}</p>
      <Card className="space-y-2 t-body">
        <Row label="ID" value={t.id} />
        <Row label="Station" value={stations.find((s) => s.id === t.stationId)?.shortName ?? "—"} />
        <Row label="Kind" value={t.kind.replace("_", " ")} />
        <Row label="Incident" value={t.incidentType?.replace("_", " ") ?? "—"} />
        <Row label="Downtime" value={`${t.downtimeHours} h`} />
        <Row label="Parts" value={t.partsUsed.join(", ") || "None"} />
        <Row label="Vendor" value={vendors.find((v) => v.id === t.vendorId)?.name ?? "—"} />
        <Row label="Photo" value={t.photoAttached ? "Attached" : "None"} />
        <Row label="Opened" value={dateTime(t.createdAt)} />
      </Card>
      {t.status !== "resolved" && t.status !== "closed" ? (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => { updateTicketStatus(t.id, "in_progress"); toast("In progress", "info"); }}>Start work</Button>
          <Button onClick={() => { updateTicketStatus(t.id, "resolved"); toast("Ticket resolved", "success"); }}>Resolve</Button>
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-ink-500">{label}</span>
      <span className="text-right text-ink-900">{value}</span>
    </div>
  );
}
