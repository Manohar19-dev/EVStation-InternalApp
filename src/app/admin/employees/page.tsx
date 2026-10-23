"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Avatar, Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Chip, ChipGroup, SearchBar, TextField, SelectField } from "@/components/ui/forms";
import { Button } from "@/components/ui/Button";
import { Modal, useToast } from "@/components/ui/overlays";
import { JOB_ROLE_SHORT } from "@/lib/labels";
import type { JobRole } from "@/types";

export default function EmployeesPage() {
  const employees = useAppStore((s) => s.employees);
  const stations = useAppStore((s) => s.stations);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<JobRole | "all">("all");
  const [open, setOpen] = useState(false);
  const [newMobile, setNewMobile] = useState("");
  const { toast } = useToast();

  const list = useMemo(
    () =>
      employees.filter((e) => {
        if (role !== "all" && e.jobRole !== role) return false;
        if (!q) return true;
        const qq = q.toLowerCase();
        return e.name.toLowerCase().includes(qq) || e.phone.includes(q);
      }),
    [employees, q, role],
  );

  return (
    <div className="space-y-4 pb-2">
      <div className="flex items-center justify-between gap-3">
        <p className="t-body text-ink-500">{list.length} people</p>
        <Button size="sm" onClick={() => setOpen(true)}>
          Add
        </Button>
      </div>
      <SearchBar value={q} onChange={setQ} placeholder="Search name or phone…" />
      <div className="scroll-hide -mx-4 overflow-x-auto px-4">
        <ChipGroup className="flex-nowrap">
          <Chip selected={role === "all"} onClick={() => setRole("all")}>All</Chip>
          {(Object.keys(JOB_ROLE_SHORT) as JobRole[]).map((r) => (
            <Chip key={r} selected={role === r} onClick={() => setRole(r)}>
              {JOB_ROLE_SHORT[r]}
            </Chip>
          ))}
        </ChipGroup>
      </div>

      <div className="space-y-2">
        {list.map((e) => (
          <Link key={e.id} href={`/admin/employees/${e.id}`}>
            <Card className="flex items-center gap-3 rounded-2xl p-3.5">
              <Avatar initials={e.avatarInitials} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="t-label text-ink-900">{e.name}</span>
                  <StatusBadge status={e.status} />
                </div>
                <div className="t-caption text-ink-500">
                  {JOB_ROLE_SHORT[e.jobRole]} · {stations.find((s) => s.id === e.homeStationId)?.shortName ?? "—"}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-ink-300" />
            </Card>
          </Link>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setNewMobile("");
        }}
        title="Add employee"
      >
        <div className="space-y-3">
          <TextField label="Full name" placeholder="Name" />
          <TextField
            label="Mobile (+91)"
            value={newMobile}
            onChange={(e) => setNewMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit mobile number"
          />
          <SelectField label="Role" defaultValue="station_attendant">
            {(Object.keys(JOB_ROLE_SHORT) as JobRole[])
              .filter((r) => r !== "owner")
              .map((r) => (
                <option key={r} value={r}>
                  {JOB_ROLE_SHORT[r]}
                </option>
              ))}
          </SelectField>
          <SelectField label="Home station" defaultValue="stn-hitec">
            {stations.slice(0, 12).map((s) => (
              <option key={s.id} value={s.id}>
                {s.shortName}
              </option>
            ))}
          </SelectField>
          <Button
            fullWidth
            onClick={() => {
              toast("Employee saved (prototype)", "success");
              setOpen(false);
              setNewMobile("");
            }}
          >
            Save employee
          </Button>
        </div>
      </Modal>
    </div>
  );
}
