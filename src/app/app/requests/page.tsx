"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { REQUEST_TYPE_LABELS } from "@/lib/labels";
import { inr, relativeAge } from "@/lib/format";
import { Can } from "@/lib/rbac/Can";
import { TextField } from "@/components/ui/forms";
import { useState } from "react";
import { useToast } from "@/components/ui/overlays";

export default function RequestsPage() {
  const session = useAppStore((s) => s.session);
  const requests = useAppStore((s) => s.requests);
  const verifyRequest = useAppStore((s) => s.verifyRequest);
  const employees = useAppStore((s) => s.employees);
  const me = employees.find((e) => e.id === session.personaId);
  const { toast } = useToast();
  const [remark, setRemark] = useState("");

  const mine = requests.filter((r) => r.requesterId === session.personaId);
  const toVerify = requests.filter((r) => r.status === "submitted" && r.requesterId !== session.personaId).slice(0, 5);

  return (
    <div className="mx-auto max-w-lg space-y-5 lg:max-w-3xl">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="t-h1">Requests</h1>
          <p className="t-body text-ink-500">Track status · owner decides money</p>
        </div>
        <Link href="/app/requests/new">
          <Button size="md" leftIcon={<Plus className="h-4 w-4" />}>New</Button>
        </Link>
      </div>

      {!mine.length ? (
        <Card className="rounded-2xl">
          <EmptyState title="No requests yet" body="Submit an expense, advance or leave request." />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {mine.map((r) => (
            <Link key={r.id} href={`/app/requests/${r.id}`}>
              <Card className="rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="t-label">{r.title}</div>
                    <div className="mt-1 t-caption text-ink-500">
                      {REQUEST_TYPE_LABELS[r.type]}
                      {r.amount ? ` · ${inr(r.amount)}` : ""}
                    </div>
                    <div className="mt-1 t-caption text-ink-300">{relativeAge(r.createdAt)}</div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Can permission="verify.requests.cluster">
        <div>
          <h2 className="t-h3 mb-2">Verify & recommend</h2>
          <p className="mb-3 t-caption text-ink-500">Ops Manager capability — you can verify/comment, not approve.</p>
          <Card className="space-y-3">
            {toVerify.map((r) => (
              <div key={r.id} className="rounded-md border border-line p-3">
                <div className="flex justify-between gap-2">
                  <div className="t-label">{r.title}</div>
                  <MoneyOrZero amount={r.amount} />
                </div>
                <div className="t-caption text-ink-500">{REQUEST_TYPE_LABELS[r.type]}</div>
                <TextField
                  className="mt-2"
                  label="Remark"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Verified — recommend approve"
                />
                <Button
                  size="sm"
                  className="mt-2"
                  variant="secondary"
                  onClick={() => {
                    verifyRequest(r.id, remark || "Verified — recommend approve.", me?.name ?? "Manager");
                    setRemark("");
                    toast("Verification sent to owner desk", "success");
                  }}
                >
                  Verify & add remark
                </Button>
              </div>
            ))}
            {!toVerify.length ? <p className="t-caption text-ink-500">Nothing to verify</p> : null}
          </Card>
        </div>
      </Can>
    </div>
  );
}

function MoneyOrZero({ amount }: { amount: number }) {
  return <span className="t-label num">{amount ? inr(amount) : "—"}</span>;
}
