"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/forms";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { timings } from "@/lib/sim/timings";
import type { PrototypeRole } from "@/types";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { PresenterPanel } from "@/components/demo/PresenterPanel";
import { cn } from "@/lib/cn";

export function CombinedLogin({ initialRole = "admin" }: { initialRole?: PrototypeRole }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const session = useAppStore((s) => s.session);
  const login = useAppStore((s) => s.login);

  const [role, setRole] = useState<PrototypeRole>(initialRole);
  const [step, setStep] = useState<"phone" | "otp" | "pin" | "bound">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hydrated || !session.isLoggedIn) return;
    router.replace(session.role === "admin" ? "/admin" : "/app");
  }, [hydrated, session, router]);

  const switchRole = (next: PrototypeRole) => {
    if (next === role) return;
    setRole(next);
    setStep("phone");
    setPhone("");
    setOtp("");
    setPin("");
    setError("");
    setLoading(false);
  };

  const sendOtp = async () => {
    if (phone.length !== 10) {
      setError("Enter a 10-digit mobile number.");
      return;
    }
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, timings.otpSend));
    setLoading(false);
    setStep("otp");
  };

  const verifyOtp = async () => {
    if (otp === "000000") {
      setError("Incorrect OTP. Try again.");
      return;
    }
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, timings.otpVerify));
    setLoading(false);
    if (role === "admin") {
      login("admin");
      router.replace("/admin");
    } else {
      setStep("pin");
    }
  };

  const verifyPin = async () => {
    if (pin === "0000") {
      setError("Incorrect PIN.");
      return;
    }
    if (pin.length !== 4) {
      setError("Enter your 4-digit PIN.");
      return;
    }
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, timings.pinVerify));
    setLoading(false);
    setStep("bound");
    await new Promise((r) => setTimeout(r, 900));
    login("employee");
    router.replace("/app");
  };

  const isAdmin = role === "admin";

  return (
    <DeviceFrame side={<PresenterPanel docked />}>
      <div className="flex h-full flex-col overflow-y-auto bg-canvas px-5 pb-8 pt-[max(1.25rem,var(--sb))]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#EEF3EA] to-transparent" />

        {/* Brand */}
        <div className="relative mt-4 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[18px] bg-primary-700 text-white shadow-md">
            <Leaf className="h-7 w-7" />
          </div>
          <h1 className="font-display text-[28px] font-extrabold tracking-tight text-primary-900">EV Network</h1>
          <p className="mt-1 t-body text-ink-500">Internal Operations Platform</p>
        </div>

        {/* Role segmented control */}
        <div className="relative mt-7 rounded-2xl bg-surface-muted p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => switchRole("admin")}
              className={cn(
                "flex h-11 items-center justify-center gap-2 rounded-xl t-label transition",
                isAdmin ? "bg-surface text-primary-800 shadow-xs" : "text-ink-500",
              )}
            >
              <Shield className="h-4 w-4" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => switchRole("employee")}
              className={cn(
                "flex h-11 items-center justify-center gap-2 rounded-xl t-label transition",
                !isAdmin ? "bg-surface text-primary-800 shadow-xs" : "text-ink-500",
              )}
            >
              <Smartphone className="h-4 w-4" />
              Employee
            </button>
          </div>
        </div>

        {/* Selected role card */}
        <div
          className={cn(
            "relative mt-6 flex items-center gap-3.5 rounded-2xl border px-4 py-3.5",
            isAdmin
              ? "border-primary-100 bg-primary-50/70"
              : "border-sage-300 bg-sage-100/60",
          )}
        >
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-xs",
              isAdmin ? "bg-primary-700 text-white" : "bg-sage-600 text-white",
            )}
          >
            {isAdmin ? <Shield className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <div className="font-display text-[17px] font-bold leading-tight text-ink-900">
              {isAdmin ? "Login as Admin" : "Login as Employee"}
            </div>
            <div className="mt-0.5 t-caption text-ink-500">
              {isAdmin ? "Owner / Super Admin" : "Operations & Field Staff"}
            </div>
          </div>
        </div>

        {/* Auth steps */}
        <div className="relative mt-6 space-y-4">
          {step === "phone" ? (
            <>
              <TextField
                label="Work mobile (+91)"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setError("");
                }}
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel"
                placeholder="10-digit mobile number"
                error={error || undefined}
              />
              <Button fullWidth loading={loading} onClick={sendOtp} disabled={phone.length !== 10}>
                Send OTP
              </Button>
              {isAdmin ? (
                <p className="t-caption text-ink-500">
                  Approvals still need PIN or biometric at the moment of decision.
                </p>
              ) : (
                <p className="t-caption text-ink-500">
                  Field staff use OTP + PIN with device binding.
                </p>
              )}
            </>
          ) : null}

          {step === "otp" ? (
            <>
              <TextField
                label="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                hint="Demo: any 6 digits except 000000"
                error={error || undefined}
              />
              <Button fullWidth loading={loading} onClick={verifyOtp}>
                Verify OTP
              </Button>
              <button
                type="button"
                className="w-full t-caption text-primary-700"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError("");
                }}
              >
                Change mobile number
              </button>
            </>
          ) : null}

          {step === "pin" ? (
            <>
              <TextField
                label="App PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                maxLength={4}
                autoComplete="one-time-code"
                hint="Demo: any 4 digits except 0000"
                error={error || undefined}
              />
              <Button fullWidth loading={loading} onClick={verifyPin}>
                Unlock
              </Button>
            </>
          ) : null}

          {step === "bound" ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-ok-bg text-ok-fg font-display text-[28px] font-bold">
                ✓
              </div>
              <div className="font-display text-[20px] font-bold">Device bound</div>
              <p className="mt-1 t-body text-ink-500">Signing you in…</p>
            </div>
          ) : null}
        </div>

        <p className="relative mt-auto pt-8 text-center t-caption text-ink-300">
          Prototype · simulated authentication
        </p>
      </div>
    </DeviceFrame>
  );
}
