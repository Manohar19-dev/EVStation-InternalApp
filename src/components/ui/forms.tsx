"use client";

import {
  useRef,
  useState,
  type ClipboardEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

export function TextField({
  label,
  hint,
  error,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string; error?: string }) {
  return (
    <label className={cn("flex w-full flex-col gap-1.5", className)}>
      {label ? <span className="t-label text-ink-700">{label}</span> : null}
      <input
        className={cn(
          "h-12 w-full rounded-2xl border border-line-strong bg-surface px-3 text-ink-900 outline-none placeholder:text-ink-300 focus:border-ink-500",
          error && "border-err-icon",
        )}
        {...props}
      />
      {error ? <span className="t-caption text-err-fg">{error}</span> : hint ? <span className="t-caption text-ink-500">{hint}</span> : null}
    </label>
  );
}

export function TextArea({
  label,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className={cn("flex w-full flex-col gap-1.5", className)}>
      {label ? <span className="t-label text-ink-700">{label}</span> : null}
      <textarea
        className="min-h-24 w-full rounded-2xl border border-line-strong bg-surface px-3 py-2.5 text-ink-900 outline-none placeholder:text-ink-300 focus:border-ink-500"
        {...props}
      />
    </label>
  );
}

export function SelectField({
  label,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; children: ReactNode }) {
  return (
    <label className={cn("flex w-full flex-col gap-1.5", className)}>
      {label ? <span className="t-label text-ink-700">{label}</span> : null}
      <select
        className="h-12 w-full rounded-2xl border border-line-strong bg-surface px-3 text-ink-900 outline-none focus:border-ink-500"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function OtpInput({
  length = 6,
  onComplete,
  error,
  disabled,
  onChange,
}: {
  length?: number;
  onComplete: (code: string) => void;
  error?: boolean;
  disabled?: boolean;
  onChange?: (code: string) => void;
}) {
  const [vals, setVals] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const commit = (next: string[]) => {
    setVals(next);
    const code = next.join("");
    onChange?.(code);
    if (code.length === length && next.every(Boolean)) onComplete(code);
  };
  const setAt = (i: number, ch: string) => {
    const next = [...vals];
    next[i] = ch;
    commit(next);
  };
  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (vals[i]) setAt(i, "");
      else if (i > 0) {
        refs.current[i - 1]?.focus();
        setAt(i - 1, "");
      }
    } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
  };
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    e.preventDefault();
    const next = Array(length)
      .fill("")
      .map((_, i) => text[i] ?? "");
    commit(next);
    refs.current[Math.min(text.length, length - 1)]?.focus();
  };

  return (
    <div className={cn("flex justify-between gap-2", error && "shake")} role="group" aria-label="One-time code">
      {vals.map((v, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={v}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          autoFocus={i === 0}
          onPaste={onPaste}
          onKeyDown={(e) => onKey(i, e)}
          onChange={(e) => {
            const ch = e.target.value.replace(/\D/g, "").slice(-1);
            if (!ch) return;
            setAt(i, ch);
            if (i < length - 1) refs.current[i + 1]?.focus();
          }}
          className={cn(
            "h-14 min-w-0 flex-1 rounded-[14px] border-[1.5px] bg-surface text-center font-display text-[18px] font-bold text-ink-900 outline-none transition-colors",
            error ? "border-err-icon" : v ? "border-ink-500" : "border-line-strong",
          )}
        />
      ))}
    </div>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-line bg-surface py-2 pl-10 pr-3 text-[14px] outline-none placeholder:text-ink-300 focus:border-ink-500"
      />
    </div>
  );
}

export function Chip({
  selected,
  children,
  onClick,
}: {
  selected?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 t-label transition",
        selected ? "border-primary-700 bg-primary-50 text-primary-800" : "border-line bg-surface text-ink-700 hover:bg-surface-muted",
      )}
    >
      {children}
    </button>
  );
}

export function ChipGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap gap-2", className)}>{children}</div>;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-md bg-surface-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "h-9 rounded-[10px] px-3.5 t-label transition",
            value === o.value ? "bg-surface text-ink-900 shadow-xs" : "text-ink-500 hover:text-ink-700",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
