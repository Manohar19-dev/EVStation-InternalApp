"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";
import { SelectField, TextArea, TextField } from "@/components/ui/forms";
import { useToast } from "@/components/ui/overlays";
import { REQUEST_TYPE_LABELS } from "@/lib/labels";
import { timings } from "@/lib/sim/timings";
import type { RequestType } from "@/types";

const CREATABLE: RequestType[] = [
  "expense",
  "petty_cash",
  "purchase",
  "salary_advance",
  "vendor_bill",
  "leave",
  "incentive",
];

export default function NewRequestPage() {
  const router = useRouter();
  const session = useAppStore((s) => s.session);
  const employees = useAppStore((s) => s.employees);
  const stations = useAppStore((s) => s.stations);
  const createRequest = useAppStore((s) => s.createRequest);
  const { toast } = useToast();
  const me = employees.find((e) => e.id === session.personaId);

  const [type, setType] = useState<RequestType>("expense");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("1850");
  const [stationId, setStationId] = useState(me?.homeStationId ?? "stn-hitec");
  const [bill, setBill] = useState(false);
  const [leaveDays, setLeaveDays] = useState("2");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!me || !title.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, timings.submit));
    const id = createRequest({
      type,
      title: title.trim(),
      description: description.trim() || title.trim(),
      amount: type === "leave" ? 0 : Number(amount) || 0,
      stationId,
      requesterId: me.id,
      billAttached: bill,
      leaveDays: type === "leave" ? Number(leaveDays) || 1 : undefined,
    });
    setLoading(false);
    toast("Request submitted to owner Approval Desk", "success");
    router.replace(`/app/requests/${id}`);
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="t-h1">Request money</h1>
        <p className="t-body text-ink-500">Routes to Owner for approval. You cannot approve.</p>
      </div>
      <SelectField label="Type" value={type} onChange={(e) => setType(e.target.value as RequestType)}>
        {CREATABLE.map((t) => (
          <option key={t} value={t}>{REQUEST_TYPE_LABELS[t]}</option>
        ))}
      </SelectField>
      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short summary" />
      <SelectField label="Station" value={stationId} onChange={(e) => setStationId(e.target.value)}>
        {stations.slice(0, 16).map((s) => (
          <option key={s.id} value={s.id}>{s.shortName}</option>
        ))}
      </SelectField>
      {type === "leave" ? (
        <TextField
          label="Days"
          value={leaveDays}
          onChange={(e) => setLeaveDays(e.target.value.replace(/\D/g, "").slice(0, 3))}
          inputMode="numeric"
          maxLength={3}
        />
      ) : (
        <TextField
          label="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1").slice(0, 10))}
          inputMode="decimal"
        />
      )}
      <TextArea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      {type !== "leave" ? (
        <Button variant="secondary" fullWidth onClick={() => { setBill(true); toast("Bill / photo attached (simulated)", "info"); }}>
          {bill ? "Bill attached" : "Attach bill / photo"}
        </Button>
      ) : null}
      <Button fullWidth loading={loading} disabled={!title.trim()} onClick={submit}>
        Submit request
      </Button>
    </div>
  );
}
