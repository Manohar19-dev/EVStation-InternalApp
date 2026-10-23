"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";
import { SelectField, TextArea, TextField } from "@/components/ui/forms";
import { useToast } from "@/components/ui/overlays";
import { timings } from "@/lib/sim/timings";
import type { IncidentType, TaskPriority } from "@/types";

export default function RaiseIssuePage() {
  const router = useRouter();
  const session = useAppStore((s) => s.session);
  const employees = useAppStore((s) => s.employees);
  const stations = useAppStore((s) => s.stations);
  const raiseIssue = useAppStore((s) => s.raiseIssue);
  const { toast } = useToast();
  const me = employees.find((e) => e.id === session.personaId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stationId, setStationId] = useState(me?.homeStationId ?? "stn-hitec");
  const [incidentType, setIncidentType] = useState<IncidentType>("charger_fault");
  const [priority, setPriority] = useState<TaskPriority>("high");
  const [photo, setPhoto] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title.trim() || !me) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, timings.submit));
    const id = raiseIssue({
      title: title.trim(),
      description: description.trim() || title.trim(),
      stationId,
      reporterId: me.id,
      kind: incidentType === "charger_fault" ? "charger_fault" : "incident",
      incidentType,
      priority,
      photoAttached: photo,
    });
    setLoading(false);
    toast("Issue submitted", "success");
    router.replace(`/app/maintenance/${id}`);
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="t-h1">Raise issue</h1>
        <p className="t-body text-ink-500">Fault, safety, theft or damage</p>
      </div>
      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. CH-02 display blank" />
      <SelectField label="Station" value={stationId} onChange={(e) => setStationId(e.target.value)}>
        {stations.map((s) => (
          <option key={s.id} value={s.id}>{s.shortName}</option>
        ))}
      </SelectField>
      <SelectField label="Issue type" value={incidentType} onChange={(e) => setIncidentType(e.target.value as IncidentType)}>
        <option value="charger_fault">Charger fault</option>
        <option value="safety">Safety</option>
        <option value="theft">Theft</option>
        <option value="damage">Damage</option>
      </SelectField>
      <SelectField label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </SelectField>
      <TextArea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What happened?" />
      <Button
        variant="secondary"
        fullWidth
        onClick={() => {
          setPhoto(true);
          toast("Photo attached (simulated)", "info");
        }}
      >
        {photo ? "Photo attached" : "Attach photo"}
      </Button>
      <Button fullWidth loading={loading} disabled={!title.trim()} onClick={submit}>
        Submit issue
      </Button>
    </div>
  );
}
