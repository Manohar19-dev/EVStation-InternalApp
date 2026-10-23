"use client";

import { useState } from "react";
import { Camera, MapPin } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";
import { Card, SectionHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/overlays";
import { DEMO_TODAY } from "@/data/employees";
import { dateOf, timeOf } from "@/lib/format";
import { timings } from "@/lib/sim/timings";

export default function AttendancePage() {
  const session = useAppStore((s) => s.session);
  const employees = useAppStore((s) => s.employees);
  const stations = useAppStore((s) => s.stations);
  const attendance = useAppStore((s) => s.attendance);
  const demo = useAppStore((s) => s.demo);
  const checkIn = useAppStore((s) => s.checkIn);
  const checkOut = useAppStore((s) => s.checkOut);
  const { toast } = useToast();

  const me = employees.find((e) => e.id === session.personaId);
  const station = stations.find((s) => s.id === me?.homeStationId);
  const today = attendance.find((a) => a.employeeId === me?.id && a.date === DEMO_TODAY);
  const history = attendance.filter((a) => a.employeeId === me?.id).slice(0, 14);
  const checkedIn = today?.status === "checked_in" || today?.status === "late";

  const [selfie, setSelfie] = useState(false);
  const [loading, setLoading] = useState(false);

  const doCheckIn = async () => {
    if (!me?.homeStationId) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, timings.checkIn));
    if (!selfie) {
      setLoading(false);
      toast("Capture selfie to continue", "error");
      return;
    }
    const res = checkIn({ employeeId: me.id, stationId: me.homeStationId, selfie: true });
    setLoading(false);
    if (!res.ok) toast(res.reason ?? "Check-in failed", "error");
    else toast("Checked in successfully", "success");
  };

  const doCheckOut = async () => {
    if (!me) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, timings.checkIn));
    checkOut(me.id);
    setLoading(false);
    toast("Checked out", "success");
  };

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <h1 className="t-h1">Attendance</h1>
        <p className="t-body text-ink-500">{station?.shortName} · {me?.shiftPattern}</p>
      </div>

      <Card>
        <div className="flex items-center gap-2 text-ink-500">
          <MapPin className="h-4 w-4" />
          <span className="t-caption">
            Simulated geo-fence · {demo.outsideGeoFence ? "≈240 m outside" : "≈18 m inside"}
          </span>
        </div>
        <div className="mt-3 t-h3">{checkedIn ? "On shift" : "Ready to check in"}</div>
        {today?.checkInAt ? <div className="t-caption text-ink-500">In {timeOf(today.checkInAt)}</div> : null}

        {!checkedIn ? (
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={async () => {
                await new Promise((r) => setTimeout(r, timings.selfie));
                setSelfie(true);
                toast("Selfie captured (simulated)", "info");
              }}
              className="flex w-full items-center gap-3 rounded-lg border border-dashed border-line-strong bg-surface-muted px-4 py-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-primary-700">
                <Camera className="h-6 w-6" />
              </div>
              <div className="text-left">
                <div className="t-label">{selfie ? "Selfie ready" : "Capture selfie"}</div>
                <div className="t-caption text-ink-500">Required for geo-fenced check-in</div>
              </div>
            </button>
            <Button fullWidth loading={loading} onClick={doCheckIn}>
              Check in
            </Button>
          </div>
        ) : (
          <Button fullWidth className="mt-4" variant="secondary" loading={loading} onClick={doCheckOut}>
            Check out
          </Button>
        )}
      </Card>

      <div>
        <SectionHeader title="History" />
        <Card className="p-0">
          {history.map((a) => (
            <div key={a.id} className="flex items-center justify-between border-b border-line px-4 py-3 last:border-0">
              <div>
                <div className="t-label">{dateOf(a.date)}</div>
                <div className="t-caption text-ink-500">
                  {a.checkInAt ? timeOf(a.checkInAt) : "—"}
                  {a.selfieCaptured ? " · selfie" : ""}
                  {a.geoOk ? " · geo OK" : ""}
                </div>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
