"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "tonal" | "ghost" | "destructive";
export type ButtonSize = "lg" | "md" | "sm";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-800 disabled:bg-sage-300 disabled:text-ink-500",
  secondary: "bg-surface text-ink-900 border-[1.5px] border-line-strong hover:bg-surface-muted disabled:text-ink-500",
  tonal: "bg-primary-50 text-primary-800 hover:bg-primary-100 disabled:text-ink-500",
  ghost: "bg-transparent text-primary-700 hover:bg-primary-50 disabled:text-ink-500",
  destructive: "bg-[#B3301F] text-white hover:bg-[#992818] disabled:bg-sage-300 disabled:text-ink-500",
};

const sizes: Record<ButtonSize, string> = {
  lg: "h-14 px-6 text-[14px] rounded-[16px]",
  md: "h-12 px-5 text-[13px] rounded-[14px]",
  sm: "h-9 px-3.5 text-[12px] rounded-[12px]",
};

export const Spinner = ({ size = 18, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("spin", className)} aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "lg",
    loading,
    loadingLabel = "Processing…",
    leftIcon,
    rightIcon,
    fullWidth,
    className,
    children,
    disabled,
    type = "button",
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 font-semibold transition-[transform,background-color,opacity] duration-150 active:scale-[0.98] disabled:active:scale-100",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <>
          <Spinner />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          {leftIcon}
          <span>{children}</span>
          {rightIcon}
        </>
      )}
    </button>
  );
});

export function IconButton({
  label,
  children,
  className,
  onClick,
  dot,
  disabled,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  dot?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-900 transition hover:bg-surface-muted active:scale-95 disabled:opacity-50",
        className,
      )}
    >
      {children}
      {dot ? <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-primary-500" /> : null}
    </button>
  );
}
