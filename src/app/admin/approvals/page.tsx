"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { Card, EmptyState, MoneyText, SectionHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Chip, ChipGroup, SearchBar } from "@/components/ui/forms";
import { ConfirmPinModal, Drawer, useToast } from "@/components/ui/overlays";
import { REQUEST_TYPE_LABELS } from "@/lib/labels";
import { dateTime, inr, relativeAge } from "@/lib/format";
import type { MoneyRequest, RequestType } from "@/types";
import { Can } from "@/lib/rbac/Can";

function ApprovalsInner() {
  const hydrated = useHydrated();
  const params = useSearchParams();
  const requests = useAppStore((s) => s.requests);
  const employees = useAppStore((s) => s.employees);
  const stations = useAppStore((s) => s.stations);
  const ownerId = useAppStore((s) => s.ownerId);
  const decideRequest = useAppStore((s) => s.decideRequest);
  const demo = useAppStore((s) => s.demo);
  const settings = useAppStore((s) => s.settings);
  const { toast } = useToast();

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"age" | "value">("value");
  const [selectedId, setSelectedId] = useState<string | null>(params.get("id"));
  const [pinOpen, setPinOpen] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<"approved" | null>(null);
  const [remark, setRemark] = useState("");
  const [bulkIds, setBulkIds] = useState<string[]>([]);

  const pending = useMemo(() => {
    let list = requests.filter((r) => r.status === "submitted" || r.status === "under_review");
    if (params.get("aged") === "1" || demo.agedApprovals) {
      list = list.filter((r) => Date.now() - new Date(r.createdAt).getTime() > settings.approvalAgeHours * 3600000);
    }
    if (q) {
      const qq = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(qq) ||
          r.id.toLowerCase().includes(qq) ||
          REQUEST_TYPE_LABELS[r.type].toLowerCase().includes(qq),
      );
    }
    return [...list].sort((a, b) => (sort === "value" ? b.amount - a.amount : +new Date(a.createdAt) - +new Date(b.createdAt)));
  }, [requests, q, sort, params, demo.agedApprovals, settings.approvalAgeHours]);

  const selected = requests.find((r) => r.id === selectedId) ?? null;
  const requesterHistory = (r: MoneyRequest) =>
    requests.filter((x) => x.requesterId === r.requesterId && x.id !== r.id).slice(0, 4);
  const stationOf = (id: string) => stations.find((s) => s.id === id);
  const empOf = (id: string) => employees.find((e) => e.id === id);

  const applyDecision = (decision: "approved" | "rejected" | "returned") => {
    if (!selected) return;
    if (decision === "approved") {
      setPendingDecision("approved");
      setPinOpen(true);
      return;
    }
    decideRequest({
      id: selected.id,
      decision,
      remark: remark || (decision === "returned" ? "Please update and resubmit." : "Not approved."),
      ownerName: "Rajesh Varma",
      ownerId,
    });
    toast(`Request ${decision}`, decision === "rejected" ? "error" : "info");
    setSelectedId(null);
    setRemark("");
  };

  const confirmApprove = () => {
    if (!selected) return;
    decideRequest({
      id: selected.id,
      decision: "approved",
      remark: remark || "Approved by owner.",
      ownerName: "Rajesh Varma",
      ownerId,
    });
    toast("Request approved", "success");
    setSelectedId(null);
    setRemark("");
    setPendingDecision(null);
  };

  const confirmBulk = () => {
    bulkIds.forEach((id) =>
      decideRequest({ id, decision: "approved", remark: "Bulk approved", ownerName: "Rajesh Varma", ownerId }),
    );
    toast(`${bulkIds.length} requests approved`, "success");
    setBulkIds([]);
  };

  if (!hydrated) return <div className="t-body text-ink-500">Loading…</div>;

  return (
    <div className="space-y-4 pb-2">
      <p className="t-body text-ink-500">Owner-only money decisions · {pending.length} waiting</p>

      <div className="flex flex-wrap gap-2">
        <SearchBar value={q} onChange={setQ} placeholder="Search requests…" className="min-w-0 flex-1" />
      </div>
      <ChipGroup>
        <Chip selected={sort === "value"} onClick={() => setSort("value")}>By value</Chip>
        <Chip selected={sort === "age"} onClick={() => setSort("age")}>By age</Chip>
      </ChipGroup>

      <Can permission="approve.requests.all">
        {bulkIds.length > 0 ? (
          <Button
            size="md"
            fullWidth
            onClick={() => {
              setSelectedId(null);
              setPendingDecision("approved");
              setPinOpen(true);
            }}
          >
            Bulk approve ({bulkIds.length})
          </Button>
        ) : null}
      </Can>

      {pending.length === 0 ? (
        <Card className="rounded-2xl">
          <EmptyState title="All caught up" body="No requests waiting for owner approval." />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {pending.map((r) => {
            const agedItem = Date.now() - new Date(r.createdAt).getTime() > settings.approvalAgeHours * 3600000;
            const routine = r.amount > 0 && r.amount <= 5000 && r.type !== "salary_release";
            return (
              <div
                key={r.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(r.id)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedId(r.id)}
                className="rounded-2xl border border-line bg-surface p-4 shadow-xs active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  {routine ? (
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 accent-primary-700"
                      checked={bulkIds.includes(r.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        setBulkIds((ids) => (e.target.checked ? [...ids, r.id] : ids.filter((x) => x !== r.id)))
                      }
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="t-label text-ink-900">{r.title}</div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="mt-1 t-caption text-ink-500">
                      {empOf(r.requesterId)?.name} · {stationOf(r.stationId)?.shortName}
                    </div>
                    <div className="mt-1 t-caption text-ink-500">{REQUEST_TYPE_LABELS[r.type as RequestType]}</div>
                    <div className="mt-3 flex items-center justify-between">
                      <MoneyText amount={r.amount} className="text-[15px]" />
                      <span className={`t-caption ${agedItem || demo.agedApprovals ? "font-semibold text-warn-fg" : "text-ink-500"}`}>
                        {relativeAge(r.createdAt)}
                        <ChevronRight className="ml-1 inline h-4 w-4 text-ink-300" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Drawer open={!!selected} onClose={() => setSelectedId(null)} title="Review request">
        {selected ? (
          <div className="space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={selected.status} />
                <span className="t-caption text-ink-500">{selected.id}</span>
              </div>
              <h3 className="mt-2 font-display text-[18px] font-bold">{selected.title}</h3>
              <p className="mt-1 t-body text-ink-500">{selected.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Info label="Type" value={REQUEST_TYPE_LABELS[selected.type]} />
              <Info label="Amount" value={inr(selected.amount)} />
              <Info label="Station" value={stationOf(selected.stationId)?.shortName ?? "—"} />
              <Info label="Requester" value={empOf(selected.requesterId)?.name ?? "—"} />
              <Info label="Submitted" value={dateTime(selected.createdAt)} />
              <Info label="Bill / photo" value={selected.billAttached ? "Attached" : "None"} />
            </div>

            {selected.refundSessionId ? (
              <Card className="rounded-2xl bg-info-bg/50">
                <div className="t-label text-info-fg">Proposal 2 refund override</div>
                <div className="t-caption text-ink-700">Session {selected.refundSessionId}</div>
              </Card>
            ) : null}

            {(() => {
              const st = stationOf(selected.stationId);
              if (!st) return null;
              const p = Math.round((st.budgetUsed / st.budgetMonthly) * 100);
              return (
                <div>
                  <SectionHeader title="Station budget" />
                  <div className="mb-1 flex justify-between t-caption">
                    <span>
                      {inr(st.budgetUsed)} / {inr(st.budgetMonthly)}
                    </span>
                    <span className={p >= 80 ? "text-warn-fg" : ""}>{p}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                    <div className={`h-full ${p >= 80 ? "bg-warn-icon" : "bg-primary-500"}`} style={{ width: `${Math.min(100, p)}%` }} />
                  </div>
                </div>
              );
            })()}

            {selected.managerRemark ? (
              <Card className="rounded-2xl bg-clay-100/60">
                <div className="t-label">Manager remark</div>
                <p className="mt-1 t-body text-ink-700">{selected.managerRemark}</p>
              </Card>
            ) : null}

            <div>
              <SectionHeader title="Requester history" />
              <div className="space-y-2">
                {requesterHistory(selected).map((h) => (
                  <div key={h.id} className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5">
                    <div>
                      <div className="t-label">{h.title}</div>
                      <div className="t-caption text-ink-500">{REQUEST_TYPE_LABELS[h.type]}</div>
                    </div>
                    <StatusBadge status={h.status} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionHeader title="Timeline" />
              <ol className="space-y-3 border-l-2 border-line pl-4">
                {selected.timeline.map((t) => (
                  <li key={t.id}>
                    <div className="t-label text-ink-900">{t.label}</div>
                    <div className="t-caption text-ink-500">
                      {dateTime(t.at)}
                      {t.by ? ` · ${t.by}` : ""}
                    </div>
                    {t.note ? <div className="t-caption text-ink-700">{t.note}</div> : null}
                  </li>
                ))}
              </ol>
            </div>

            <label className="block">
              <span className="t-label text-ink-700">Owner comment</span>
              <textarea
                className="mt-1.5 min-h-20 w-full rounded-2xl border border-line-strong px-3 py-2.5"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Optional remark"
              />
            </label>

            <Can permission="approve.requests.all">
              <div className="flex flex-col gap-2 border-t border-line pt-4">
                <Button fullWidth onClick={() => applyDecision("approved")}>
                  Approve
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" onClick={() => applyDecision("returned")}>
                    Return
                  </Button>
                  <Button variant="destructive" onClick={() => applyDecision("rejected")}>
                    Reject
                  </Button>
                </div>
                <p className="t-caption text-ink-500">Approve requires PIN / biometric. Payout is Phase 2.</p>
              </div>
            </Can>
          </div>
        ) : null}
      </Drawer>

      <ConfirmPinModal
        open={pinOpen}
        onClose={() => {
          setPinOpen(false);
          setPendingDecision(null);
        }}
        onConfirm={() => {
          if (bulkIds.length > 0 && pendingDecision === "approved" && !selectedId) confirmBulk();
          else if (pendingDecision === "approved" && selectedId) confirmApprove();
        }}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-muted px-3 py-2.5">
      <div className="t-caption text-ink-500">{label}</div>
      <div className="t-label text-ink-900">{value}</div>
    </div>
  );
}

export default function ApprovalsPage() {
  return (
    <Suspense>
      <ApprovalsInner />
    </Suspense>
  );
}
