"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Avatar, Card } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/forms";
import { JOB_ROLE_SHORT } from "@/lib/labels";

export default function EmployeeDirectoryPage() {
  const employees = useAppStore((s) => s.employees);
  const stations = useAppStore((s) => s.stations);
  const [q, setQ] = useState("");
  const list = useMemo(
    () => employees.filter((e) => e.jobRole !== "owner").filter((e) => !q || e.name.toLowerCase().includes(q.toLowerCase())),
    [employees, q],
  );

  return (
    <div className="mx-auto max-w-lg space-y-4 lg:max-w-3xl">
      <h1 className="t-h1">Employees</h1>
      <SearchBar value={q} onChange={setQ} placeholder="Search…" />
      <Card className="p-0">
        {list.slice(0, 40).map((e) => (
          <div key={e.id} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0">
            <Avatar initials={e.avatarInitials} size={40} />
            <div className="min-w-0 flex-1">
              <div className="t-label">{e.name}</div>
              <div className="t-caption text-ink-500">
                {JOB_ROLE_SHORT[e.jobRole]} · {stations.find((s) => s.id === e.homeStationId)?.shortName}
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
