"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Leaf } from "lucide-react";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { PresenterPanel } from "@/components/demo/PresenterPanel";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { timings } from "@/lib/sim/timings";

export function SplashScreen() {
  const router = useRouter();
  const hydrated = useHydrated();
  const session = useAppStore((s) => s.session);

  useEffect(() => {
    if (!hydrated) return;
    const id = setTimeout(() => {
      if (session.isLoggedIn) {
        router.replace(session.role === "admin" ? "/admin" : "/app");
      } else {
        router.replace("/login");
      }
    }, timings.splash);
    return () => clearTimeout(id);
  }, [hydrated, session.isLoggedIn, session.role, router]);

  return (
    <DeviceFrame side={<PresenterPanel docked />}>
      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-canvas">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#EEF5F0_0%,transparent_55%)]" />
        <div className="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full bg-primary-100/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-32 h-64 w-64 rounded-full bg-sage-100/80 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 0.8, 0.3, 1] }}
          className="relative flex flex-col items-center px-8 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mb-5 flex h-20 w-20 items-center justify-center rounded-[22px] bg-primary-700 text-white shadow-md"
          >
            <Leaf className="h-10 w-10" strokeWidth={2} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.45 }}
          >
            <h1 className="font-display text-[28px] font-extrabold tracking-tight text-primary-900">EV Network</h1>
            <p className="mt-1.5 t-body text-ink-500">Internal Operations Platform</p>
          </motion.div>
        </motion.div>

        <div className="absolute inset-x-14 bottom-16">
          <div className="h-[3px] overflow-hidden rounded-full bg-primary-100">
            <motion.div
              className="h-full rounded-full bg-primary-700"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: timings.splash / 1000, ease: "easeInOut" }}
            />
          </div>
          <p className="mt-3 text-center t-caption text-ink-300">Loading workspace…</p>
        </div>
      </div>
    </DeviceFrame>
  );
}
