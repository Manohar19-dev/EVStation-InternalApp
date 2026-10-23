"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Card, SectionHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { REQUEST_TYPE_LABELS } from "@/lib/labels";
import { dateTime, inr } from "@/lib/format";

export default function RequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const requests = useAppStore((s) => s.requests);
  const stations = useAppStore((s) => s.stations);
  const r = requests.find((x) => x.id === requestId);

  if (!r) {
    return (
      <div>
        <h1 className="t-h1">Request not found</h1>
        <Link href="/app/requests" className="t-label text-primary-700">Back</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <Link href="/app/requests" className="t-caption text-primary-700">← Requests</Link>
      <StatusBadge status={r.status} />
      <h1 className="t-h1">{r.title}</h1>
      <p className="t-body text-ink-700">{r.description}</p>
      <Card className="space-y-2 t-body">
        <div className="flex justify-between"><span className="text-ink-500">Type</span><span>{REQUEST_TYPE_LABELS[r.type]}</span></div>
        <div className="flex justify-between"><span className="text-ink-500">Amount</span><span className="num font-semibold">{r.amount ? inr(r.amount) : "—"}</span></div>
        <div className="flex justify-between"><span className="text-ink-500">Station</span><span>{stations.find((s) => s.id === r.stationId)?.shortName}</span></div>
        <div className="flex justify-between"><span className="text-ink-500">Bill</span><span>{r.billAttached ? "Attached" : "None"}</span></div>
        {r.ownerRemark ? <div className="rounded-md bg-surface-muted p-3"><div className="t-label">Owner remark</div><p>{r.ownerRemark}</p></div> : null}
        {r.managerRemark ? <div className="rounded-md bg-clay-100/60 p-3"><div className="t-label">Manager remark</div><p>{r.managerRemark}</p></div> : null}
        {r.utr ? <div className="t-caption text-ink-500">Historical UTR (read-only): {r.utr}</div> : null}
      </Card>
      <div>
        <SectionHeader title="Timeline" />
        <ol className="space-y-3 border-l-2 border-line pl-4">
          {r.timeline.map((t) => (
            <li key={t.id}>
              <div className="t-label">{t.label}</div>
              <div className="t-caption text-ink-500">{dateTime(t.at)}{t.by ? ` · ${t.by}` : ""}</div>
              {t.note ? <div className="t-caption text-ink-700">{t.note}</div> : null}
            </li>
          ))}
        </ol>
      </div>
      <p className="t-caption text-ink-500">Only the Owner can approve or release payment. There is no approve action on the employee side.</p>
    </div>
  );
}
