"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function PresenterPanel({ docked = false }: { docked?: boolean }) {
  const router = useRouter();
  const demo = useAppStore((s) => s.demo);
  const setDemo = useAppStore((s) => s.setDemo);
  const switchRole = useAppStore((s) => s.switchRole);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const session = useAppStore((s) => s.session);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("presenter") === "1") setDemo({ presenterOpen: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setDemo({ presenterOpen: !useAppStore.getState().demo.presenterOpen });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setDemo]);

  if (!demo.presenterOpen) {
    if (!docked) return null;
    return (
      <button
        type="button"
        onClick={() => setDemo({ presenterOpen: true })}
        className="hidden rounded-full border border-line bg-surface px-4 py-2 t-caption text-ink-500 shadow-xs md:block"
      >
        Presenter · Ctrl+Shift+D
      </button>
    );
  }

  const Toggle = ({ flag, label }: { flag: keyof typeof demo; label: string }) => (
    <label className="flex items-center justify-between gap-3 py-1.5 t-caption">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={!!demo[flag]}
        onChange={(e) => setDemo({ [flag]: e.target.checked })}
        className="h-4 w-4 accent-primary-700"
      />
    </label>
  );

  const panel = (
    <div
      className={cn(
        "z-[70] w-[280px] rounded-2xl border border-line bg-surface p-4 shadow-md",
        docked ? "hidden md:block" : "fixed bottom-4 right-4",
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="t-badge text-ink-300">Presenter</div>
          <div className="t-label text-ink-900">Demo controls</div>
        </div>
        <button type="button" className="t-caption text-ink-500" onClick={() => setDemo({ presenterOpen: false })}>
          Close
        </button>
      </div>

      <div className="mb-3 rounded-xl bg-surface-muted p-2 t-caption text-ink-500">
        Role: <span className="font-semibold text-ink-900">{session.role ?? "logged out"}</span>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant={session.role === "admin" ? "primary" : "secondary"}
          onClick={() => {
            switchRole("admin");
            router.push("/admin");
          }}
        >
          Admin
        </Button>
        <Button
          size="sm"
          variant={session.role === "employee" ? "primary" : "secondary"}
          onClick={() => {
            switchRole("employee");
            router.push("/app");
          }}
        >
          Employee
        </Button>
      </div>

      <div className="mb-3 space-y-1 border-t border-line pt-2">
        <div className="t-badge text-ink-300">Jump</div>
        {[
          ["/admin", "Admin home"],
          ["/admin/approvals", "Approvals"],
          ["/admin/audit", "Audit"],
          ["/app", "Employee home"],
          ["/app/attendance", "Check in"],
          ["/app/checklists", "Checklist"],
          ["/app/requests/new", "New request"],
        ].map(([href, label]) => (
          <button
            key={href}
            type="button"
            className="block w-full rounded-lg px-2 py-1.5 text-left t-caption hover:bg-surface-muted"
            onClick={() => router.push(href)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-3 space-y-1 border-t border-line pt-2">
        <div className="t-badge text-ink-300">Scenarios</div>
        <Toggle flag="outsideGeoFence" label="Outside geo-fence" />
        <Toggle flag="offline" label="Offline mode" />
        <Toggle flag="chargerFaultAlert" label="Charger fault alert" />
        <Toggle flag="overdueEscalation" label="Overdue escalation" />
        <Toggle flag="agedApprovals" label="Aged approvals" />
      </div>

      <Button
        size="sm"
        variant="secondary"
        fullWidth
        onClick={() => {
          resetDemo();
          router.push("/");
        }}
      >
        Reset mock data
      </Button>
    </div>
  );

  return panel;
}
