"use client";

import Link from "next/link";
import { AlertTriangle, CheckSquare, ListTodo } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { DEMO_TODAY } from "@/data/employees";

export default function MyWorkPage() {
  const session = useAppStore((s) => s.session);
  const checklistRuns = useAppStore((s) => s.checklistRuns);
  const tasks = useAppStore((s) => s.tasks);
  const tickets = useAppStore((s) => s.tickets);

  const checklist = checklistRuns.find((c) => c.employeeId === session.personaId && c.date === DEMO_TODAY);
  const openTasks = tasks.filter((t) => t.assigneeId === session.personaId && t.status !== "completed").length;
  const openTickets = tickets.filter(
    (t) => (t.reporterId === session.personaId || t.assigneeId === session.personaId) && t.status !== "closed" && t.status !== "resolved",
  ).length;

  const tiles = [
    { href: "/app/checklists", label: "Checklists", hint: `${checklist?.completedPercent ?? 0}% today`, icon: CheckSquare },
    { href: "/app/tasks", label: "Tasks", hint: `${openTasks} open`, icon: ListTodo },
    { href: "/app/maintenance", label: "Maintenance", hint: `${openTickets} active`, icon: AlertTriangle },
  ];

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="t-h1">My Work</h1>
        <p className="t-body text-ink-500">Checklist, tasks and tickets in one place</p>
      </div>
      <div className="space-y-3">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href}>
            <Card className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                <t.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="t-label">{t.label}</div>
                <div className="t-caption text-ink-500">{t.hint}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
