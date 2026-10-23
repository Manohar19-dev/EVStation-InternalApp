"use client";

import { Camera, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { CHECKLIST_TEMPLATES, SECTION_LABELS } from "@/data/checklists";
import { Button } from "@/components/ui/Button";
import { Card, SectionHeader } from "@/components/ui/Card";
import { useToast } from "@/components/ui/overlays";
import { DEMO_TODAY } from "@/data/employees";
import { cn } from "@/lib/cn";
import type { ChecklistSection } from "@/types";

export default function ChecklistsPage() {
  const session = useAppStore((s) => s.session);
  const checklistRuns = useAppStore((s) => s.checklistRuns);
  const toggleChecklistItem = useAppStore((s) => s.toggleChecklistItem);
  const completeChecklist = useAppStore((s) => s.completeChecklist);
  const { toast } = useToast();

  const run = checklistRuns.find((c) => c.employeeId === session.personaId && c.date === DEMO_TODAY);

  if (!run) {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="t-h1">Today&apos;s checklist</h1>
        <p className="mt-2 t-body text-ink-500">No checklist assigned for today.</p>
      </div>
    );
  }

  const sections = (Object.keys(SECTION_LABELS) as ChecklistSection[]).map((section) => ({
    section,
    items: CHECKLIST_TEMPLATES.filter((t) => t.section === section),
  }));

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <h1 className="t-h1">Today&apos;s checklist</h1>
        <p className="t-body text-ink-500">{run.shiftLabel} · {run.completedPercent}% complete</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full bg-primary-700 transition-all" style={{ width: `${run.completedPercent}%` }} />
        </div>
      </div>

      {sections.map(({ section, items }) => (
        <div key={section}>
          <SectionHeader title={SECTION_LABELS[section]} />
          <Card className="space-y-1 rounded-2xl p-2">
            {items.map((t) => {
              const item = run.items.find((i) => i.templateId === t.id);
              const done = !!item?.done;
              return (
                <div key={t.id} className={cn("rounded-xl px-3 py-3.5", done && "bg-ok-bg/40")}>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => toggleChecklistItem(run.id, t.id)}
                      className="mt-1 h-5 w-5 accent-primary-700"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="t-label text-ink-900">{t.label}</div>
                      {t.requiresPhoto ? <div className="t-caption text-ink-500">Photo required</div> : null}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {t.requiresPhoto ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 t-caption"
                            onClick={() => {
                              toggleChecklistItem(run.id, t.id, { photoAttached: true, done: true });
                              toast("Photo attached (simulated)", "info");
                            }}
                          >
                            <Camera className="h-3.5 w-3.5" />
                            {item?.photoAttached ? "Photo added" : "Add photo"}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 t-caption text-warn-fg"
                          onClick={() => {
                            toggleChecklistItem(run.id, t.id, { issueRaised: true, note: "Issue flagged from checklist" });
                            toast("Issue marked — open Maintenance to file ticket", "info");
                          }}
                        >
                          <AlertTriangle className="h-3.5 w-3.5" /> Mark issue
                        </button>
                      </div>
                    </div>
                  </label>
                </div>
              );
            })}
          </Card>
        </div>
      ))}

      <Button
        fullWidth
        onClick={() => {
          completeChecklist(run.id);
          toast("Checklist completed", "success");
        }}
      >
        Mark all complete
      </Button>
    </div>
  );
}
