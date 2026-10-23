"use client";

import { cn } from "@/lib/cn";

const tones = {
  ok: "bg-ok-bg text-ok-fg",
  warn: "bg-warn-bg text-warn-fg",
  err: "bg-err-bg text-err-fg",
  info: "bg-info-bg text-info-fg",
  neutral: "bg-surface-muted text-ink-700",
  clay: "bg-clay-100 text-clay-700",
} as const;

type Tone = keyof typeof tones;

const STATUS_MAP: Record<string, { label: string; tone: Tone }> = {
  live: { label: "Live", tone: "ok" },
  under_maintenance: { label: "Maintenance", tone: "warn" },
  closed: { label: "Closed", tone: "neutral" },
  available: { label: "Available", tone: "ok" },
  charging: { label: "Charging", tone: "info" },
  faulted: { label: "Faulted", tone: "err" },
  offline: { label: "Offline", tone: "neutral" },
  draft: { label: "Draft", tone: "neutral" },
  submitted: { label: "Submitted", tone: "info" },
  under_review: { label: "Under review", tone: "clay" },
  approved: { label: "Approved", tone: "ok" },
  rejected: { label: "Rejected", tone: "err" },
  returned: { label: "Returned", tone: "warn" },
  paid: { label: "Paid", tone: "ok" },
  open: { label: "Open", tone: "info" },
  in_progress: { label: "In progress", tone: "clay" },
  completed: { label: "Completed", tone: "ok" },
  overdue: { label: "Overdue", tone: "err" },
  waiting_parts: { label: "Waiting parts", tone: "warn" },
  resolved: { label: "Resolved", tone: "ok" },
  closed_ticket: { label: "Closed", tone: "neutral" },
  checked_in: { label: "Checked in", tone: "ok" },
  checked_out: { label: "Checked out", tone: "neutral" },
  late: { label: "Late", tone: "warn" },
  absent: { label: "Absent", tone: "err" },
  on_leave: { label: "On leave", tone: "info" },
  off: { label: "Off", tone: "neutral" },
  critical: { label: "Critical", tone: "err" },
  high: { label: "High", tone: "warn" },
  medium: { label: "Medium", tone: "info" },
  low: { label: "Low", tone: "neutral" },
  active: { label: "Active", tone: "ok" },
  inactive: { label: "Inactive", tone: "neutral" },
  verified: { label: "KYC verified", tone: "ok" },
  pending: { label: "Pending", tone: "warn" },
};

export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 t-badge", tones[tone], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status === "closed" && className?.includes("ticket") ? "closed_ticket" : status;
  const mapped = STATUS_MAP[key] ?? STATUS_MAP[status] ?? { label: status.replace(/_/g, " "), tone: "neutral" as Tone };
  return (
    <Badge tone={mapped.tone} className={className}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {mapped.label}
    </Badge>
  );
}
