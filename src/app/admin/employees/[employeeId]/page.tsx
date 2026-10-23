"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Avatar, Card, SectionHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { JOB_ROLE_SHORT } from "@/lib/labels";
import { dateOf, inr } from "@/lib/format";
import { DEMO_TODAY } from "@/data/employees";

export default function EmployeeDetailPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const employees = useAppStore((s) => s.employees);
  const stations = useAppStore((s) => s.stations);
  const attendance = useAppStore((s) => s.attendance);
  const e = employees.find((x) => x.id === employeeId);

  if (!e) {
    return (
      <div>
        <h1 className="t-h1">Employee not found</h1>
        <Link href="/admin/employees" className="t-label text-primary-700">Back</Link>
      </div>
    );
  }

  const today = attendance.find((a) => a.employeeId === e.id && a.date === DEMO_TODAY);

  return (
    <div className="space-y-6">
      <Link href="/admin/employees" className="t-caption text-primary-700">← Employees</Link>
      <div className="flex items-center gap-4">
        <Avatar initials={e.avatarInitials} size={64} />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="t-h1">{e.name}</h1>
            <StatusBadge status={e.status} />
          </div>
          <p className="t-body text-ink-500">{JOB_ROLE_SHORT[e.jobRole]} · {e.phone}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader title="Assignment" />
          <dl className="space-y-2 t-body">
            <div className="flex justify-between"><dt className="text-ink-500">Home station</dt><dd>{stations.find((s) => s.id === e.homeStationId)?.shortName ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">Shift</dt><dd>{e.shiftPattern}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">KYC</dt><dd><StatusBadge status={e.kycStatus} /></dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">Onboarding</dt><dd className="capitalize">{e.onboardingStatus.replace("_", " ")}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">Joined</dt><dd>{dateOf(e.joinedAt)}</dd></div>
          </dl>
        </Card>
        <Card>
          <SectionHeader title="Salary structure" />
          <dl className="space-y-2 t-body">
            <div className="flex justify-between"><dt className="text-ink-500">Basic</dt><dd className="num">{inr(e.salary.basic)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">Allowance</dt><dd className="num">{inr(e.salary.allowance)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">Incentive eligible</dt><dd>{e.salary.incentiveEligible ? "Yes" : "No"}</dd></div>
          </dl>
          <div className="mt-4 rounded-md bg-surface-muted p-3">
            <div className="t-label">Emergency contact</div>
            <div className="t-body">{e.emergencyContact.name} · {e.emergencyContact.phone}</div>
            <div className="t-caption text-ink-500">{e.emergencyContact.relation}</div>
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Today's attendance" />
        {today ? <StatusBadge status={today.status} /> : <span className="t-caption text-ink-500">No record</span>}
      </Card>
    </div>
  );
}
