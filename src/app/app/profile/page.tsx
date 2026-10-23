"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Avatar, Card, SectionHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/forms";
import { JOB_ROLE_SHORT } from "@/lib/labels";
import { useToast } from "@/components/ui/overlays";
import type { LanguageCode } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const session = useAppStore((s) => s.session);
  const employees = useAppStore((s) => s.employees);
  const stations = useAppStore((s) => s.stations);
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const demo = useAppStore((s) => s.demo);
  const logout = useAppStore((s) => s.logout);
  const { toast } = useToast();
  const me = employees.find((e) => e.id === session.personaId);

  if (!me) return null;

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="flex items-center gap-4">
        <Avatar initials={me.avatarInitials} size={64} />
        <div>
          <h1 className="t-h1">{me.name}</h1>
          <p className="t-body text-ink-500">
            {JOB_ROLE_SHORT[me.jobRole]} · {stations.find((s) => s.id === me.homeStationId)?.shortName}
          </p>
        </div>
      </div>

      <Card>
        <SectionHeader title="Language" />
        <SegmentedControl
          value={settings.language}
          onChange={(v) => {
            setSettings({ language: v as LanguageCode });
            toast("Preference saved", "info");
          }}
          options={[
            { value: "en", label: "EN" },
            { value: "te", label: "TE" },
            { value: "hi", label: "HI" },
          ]}
        />
      </Card>

      <Card className="space-y-2 t-body">
        <div className="flex justify-between"><span className="text-ink-500">Phone</span><span>{me.phone}</span></div>
        <div className="flex justify-between"><span className="text-ink-500">Email</span><span className="truncate pl-4">{me.email}</span></div>
        <div className="flex justify-between"><span className="text-ink-500">Device</span><span>Bound · Android</span></div>
        <div className="flex justify-between"><span className="text-ink-500">Sync</span><span>{demo.offline ? "Pending queue" : "Up to date"}</span></div>
      </Card>

      <Button
        variant="secondary"
        fullWidth
        onClick={() => {
          logout();
          router.push("/");
        }}
      >
        Sign out
      </Button>
    </div>
  );
}
