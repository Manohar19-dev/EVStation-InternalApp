"use client";

import type { ReactNode } from "react";
import { ArrowLeft, Bell, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/Button";

export function MobileHeader({
  title,
  subtitle,
  showBack,
  onMenu,
  onBell,
  bellDot,
  right,
  transparent,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onMenu?: () => void;
  onBell?: () => void;
  bellDot?: boolean;
  right?: ReactNode;
  transparent?: boolean;
}) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex shrink-0 items-center gap-2 px-3 pb-2 pt-[max(0.5rem,var(--sb))]",
        transparent ? "bg-transparent" : "border-b border-line/80 bg-canvas/95 backdrop-blur-md",
      )}
    >
      {showBack ? (
        <IconButton label="Back" onClick={() => router.back()} className="border-0 bg-transparent shadow-none">
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
      ) : onMenu ? (
        <IconButton label="Menu" onClick={onMenu} className="border-0 bg-transparent shadow-none">
          <Menu className="h-5 w-5" />
        </IconButton>
      ) : (
        <div className="w-11" />
      )}

      <div className="min-w-0 flex-1 text-center">
        <div className="truncate font-display text-[17px] font-bold tracking-tight text-ink-900">{title}</div>
        {subtitle ? <div className="truncate t-caption text-ink-500">{subtitle}</div> : null}
      </div>

      <div className="flex w-11 shrink-0 justify-end">
        {right}
        {!right && onBell ? (
          <IconButton label="Notifications" dot={bellDot} onClick={onBell} className="border-0 bg-transparent shadow-none">
            <Bell className="h-5 w-5" />
          </IconButton>
        ) : !right ? (
          <div className="w-11" />
        ) : null}
      </div>
    </header>
  );
}
