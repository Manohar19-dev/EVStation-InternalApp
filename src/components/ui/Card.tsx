"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { inr } from "@/lib/format";

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-line bg-surface p-4 text-left shadow-xs",
        onClick && "transition hover:border-line-strong hover:bg-surface-muted/60 active:scale-[0.99]",
        className,
      )}
    >
      {children}
    </Comp>
  );
}

export function SectionHeader({
  title,
  action,
  className,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <h2 className="t-h3 text-ink-900">{title}</h2>
      {action}
    </div>
  );
}

export function ListRow({
  title,
  subtitle,
  trailing,
  leading,
  onClick,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  leading?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 border-b border-line px-1 py-3 text-left last:border-b-0",
        onClick && "hover:bg-surface-muted/50",
        className,
      )}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <div className="t-label text-ink-900">{title}</div>
        {subtitle ? <div className="t-caption text-ink-500">{subtitle}</div> : null}
      </div>
      {trailing}
    </Comp>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-line", className)} />;
}

export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      {icon ? <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sage-100 text-sage-600">{icon}</div> : null}
      <div>
        <div className="t-h3 text-ink-900">{title}</div>
        {body ? <p className="mt-1 t-body text-ink-500">{body}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} />;
}

export function MoneyText({ amount, className }: { amount: number; className?: string }) {
  return <span className={cn("num font-semibold text-ink-900", className)}>{inr(amount)}</span>;
}

export function Avatar({ initials, size = 40, className }: { initials: string; size?: number; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-800",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials}
    </div>
  );
}

export function KpiTile({
  label,
  value,
  hint,
  tone,
  onClick,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "warn" | "ok" | "err";
  onClick?: () => void;
}) {
  const toneCls =
    tone === "warn"
      ? "border-warn-bg bg-warn-bg/40"
      : tone === "ok"
        ? "border-ok-bg bg-ok-bg/40"
        : tone === "err"
          ? "border-err-bg bg-err-bg/40"
          : "border-line bg-surface";
  return (
    <Card onClick={onClick} className={cn("min-w-0", toneCls)}>
      <div className="t-caption text-ink-500">{label}</div>
      <div className="mt-1 t-h2 num text-ink-900">{value}</div>
      {hint ? <div className="mt-1 t-caption text-ink-500">{hint}</div> : null}
    </Card>
  );
}
