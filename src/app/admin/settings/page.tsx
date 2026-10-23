"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { ROLE_TEMPLATES } from "@/lib/rbac/permissions";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SegmentedControl, TextField } from "@/components/ui/forms";
import { useToast } from "@/components/ui/overlays";
import { Modal } from "@/components/ui/overlays";
import type { LanguageCode } from "@/types";

export default function SettingsPage() {
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const { toast } = useToast();
  const [importOpen, setImportOpen] = useState(false);
  const [roleId, setRoleId] = useState(ROLE_TEMPLATES[0]?.id);

  const selected = ROLE_TEMPLATES.find((r) => r.id === roleId) ?? ROLE_TEMPLATES[0]!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="t-h1">Settings</h1>
        <p className="t-body text-ink-500">Roles, approval rules, integrations</p>
      </div>

      <section>
        <SectionHeader title="Roles & permissions" />
        <p className="mb-3 t-caption text-ink-500">
          Proposal roles shown for future RBAC. Prototype login uses Admin / Employee only.
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1 p-2">
            {ROLE_TEMPLATES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRoleId(r.id)}
                className={`block w-full rounded-md px-3 py-2.5 text-left t-label ${roleId === r.id ? "bg-primary-50 text-primary-800" : "hover:bg-surface-muted"}`}
              >
                {r.name}
              </button>
            ))}
          </Card>
          <Card className="lg:col-span-2">
            <div className="t-h3">{selected.name}</div>
            <p className="mt-1 t-body text-ink-500">{selected.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {selected.permissions.slice(0, 24).map((p) => (
                <span key={p} className="rounded-full bg-surface-muted px-2.5 py-1 t-caption text-ink-700">
                  {p}
                </span>
              ))}
              {selected.permissions.length > 24 ? (
                <span className="t-caption text-ink-500">+{selected.permissions.length - 24} more</span>
              ) : null}
            </div>
            <p className="mt-4 t-caption text-ink-500">
              Scope: station · cluster · all. Money approve/release locked to Owner.
            </p>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader title="Approval rules" />
          <TextField
            label="Age reminder (hours)"
            type="number"
            value={String(settings.approvalAgeHours)}
            onChange={(e) => setSettings({ approvalAgeHours: Number(e.target.value) || 24 })}
          />
          <TextField
            className="mt-3"
            label="Budget alert %"
            type="number"
            value={String(settings.budgetAlertPercent)}
            onChange={(e) => setSettings({ budgetAlertPercent: Number(e.target.value) || 80 })}
          />
          <label className="mt-4 flex items-center justify-between gap-3">
            <div>
              <div className="t-label">Delegate approver</div>
              <div className="t-caption text-ink-500">Off by default · value cap + expiry</div>
            </div>
            <input
              type="checkbox"
              checked={settings.delegateEnabled}
              onChange={(e) => setSettings({ delegateEnabled: e.target.checked })}
              className="h-5 w-5 accent-primary-700"
            />
          </label>
          {settings.delegateEnabled ? (
            <TextField
              className="mt-3"
              label="Delegate cap (₹)"
              type="number"
              value={String(settings.delegateCap)}
              onChange={(e) => setSettings({ delegateCap: Number(e.target.value) || 0 })}
            />
          ) : null}
        </Card>

        <Card>
          <SectionHeader title="Language" />
          <SegmentedControl
            value={settings.language}
            onChange={(v) => {
              setSettings({ language: v as LanguageCode });
              toast(v === "en" ? "English" : "Language preference saved (UI labels demo EN)", "info");
            }}
            options={[
              { value: "en", label: "English" },
              { value: "te", label: "తెలుగు" },
              { value: "hi", label: "हिन्दी" },
            ]}
          />
          <div className="mt-6">
            <SectionHeader title="Data migration" />
            <Button variant="secondary" onClick={() => setImportOpen(true)}>
              Import from Excel
            </Button>
          </div>
        </Card>
      </section>

      <Card>
        <SectionHeader title="Integrations status" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["SMS (DLT)", "Configured · simulated"],
            ["WhatsApp Business", "Configured · simulated"],
            ["Google Maps geo-fence", "Simulated"],
            ["Bank payout API", "Phase 2"],
            ["Tally export", "Phase 2"],
            ["Proposal 2 revenue", "Read-only linked"],
          ].map(([name, status]) => (
            <div key={name} className="rounded-md border border-line px-3 py-3">
              <div className="t-label">{name}</div>
              <div className="t-caption text-ink-500">{status}</div>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Import from Excel">
        <p className="t-body text-ink-500">Simulate migration of stations and employees from client sheets.</p>
        <Button
          className="mt-4"
          fullWidth
          onClick={() => {
            toast("Import queued (prototype)", "success");
            setImportOpen(false);
          }}
        >
          Upload spreadsheet
        </Button>
      </Modal>
    </div>
  );
}
