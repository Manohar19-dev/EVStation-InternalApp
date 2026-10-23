"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { BatteryFull, SignalHigh, Wifi } from "lucide-react";

function StatusBarMock() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[60] hidden h-11 items-center justify-between px-8 text-ink-900 md:flex"
        aria-hidden="true"
      >
        <span className="font-display text-[13px] font-bold">9:41</span>
        <span className="flex items-center gap-1.5 text-ink-900">
          <SignalHigh size={16} strokeWidth={2.2} />
          <Wifi size={16} strokeWidth={2.2} />
          <BatteryFull size={20} strokeWidth={1.8} />
        </span>
      </div>
      <span
        className="pointer-events-none absolute left-1/2 top-2.5 z-[61] hidden h-[26px] w-[96px] -translate-x-1/2 rounded-full bg-[#1B241F] md:block"
        aria-hidden="true"
      />
    </>
  );
}

/**
 * < 768px: app fills viewport.
 * >= 768px: centered 390×844 phone, scaled to fit; optional side panel (presenter).
 */
export function DeviceFrame({ children, side }: { children: ReactNode; side?: ReactNode }) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const f = () => setScale(Math.max(0.55, Math.min(1, (window.innerHeight - 40) / 864)));
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  return (
    <div
      className="h-dvh w-full md:stage-bg md:flex md:items-center md:justify-center md:gap-10 md:overflow-hidden"
      style={{ "--fs": scale } as CSSProperties}
    >
      <div className="h-full w-full md:relative md:h-[calc(864px*var(--fs))] md:w-[calc(410px*var(--fs))] md:shrink-0">
        <div className="h-full w-full md:absolute md:left-0 md:top-0 md:h-[864px] md:w-[410px] md:origin-top-left md:scale-[var(--fs)] md:rounded-[56px] md:bg-[#1B241F] md:p-[10px] md:shadow-[0_30px_80px_-20px_rgba(20,32,25,0.35)]">
          <div className="relative isolate flex h-full w-full flex-col overflow-hidden bg-canvas md:rounded-[46px] md:[--sb:44px]">
            <StatusBarMock />
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
            <div id="overlay-root" className="pointer-events-none absolute inset-0 z-[70]" />
          </div>
        </div>
      </div>
      {side}
    </div>
  );
}
