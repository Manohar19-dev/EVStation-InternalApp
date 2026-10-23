"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Fingerprint, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { timings } from "@/lib/sim/timings";

function FramePortal({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setNode(document.getElementById("overlay-root") ?? document.body);
  }, []);
  if (!node) return null;
  return createPortal(<div className="pointer-events-auto absolute inset-0 z-[80]">{children}</div>, node);
}

/** Bottom sheet — primary mobile pattern */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <FramePortal>
      <AnimatePresence>
        <div className="absolute inset-0 flex flex-col justify-end">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-[rgba(20,32,25,0.4)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className={cn(
              "relative z-10 max-h-[88%] overflow-auto rounded-t-[28px] bg-surface px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-sheet",
              className,
            )}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line-strong" />
            <div className="mb-4 flex items-start justify-between gap-3">
              {title ? <h2 className="font-display text-[17px] font-bold text-ink-900">{title}</h2> : <span />}
              <button type="button" aria-label="Close dialog" onClick={onClose} className="rounded-full p-1.5 text-ink-500 hover:bg-surface-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      </AnimatePresence>
    </FramePortal>
  );
}

/** Full-height slide-up detail sheet */
export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <FramePortal>
      <AnimatePresence>
        <div className="absolute inset-0 flex flex-col">
          <motion.button
            type="button"
            aria-label="Close drawer"
            className="absolute inset-0 bg-[rgba(20,32,25,0.4)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="relative z-10 mt-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[28px] bg-surface shadow-sheet"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-[16px] font-bold text-ink-900">{title}</h2>
              <button type="button" aria-label="Close" onClick={onClose} className="rounded-full p-1.5 text-ink-500 hover:bg-surface-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="scroll-hide min-h-0 flex-1 overflow-y-auto px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{children}</div>
          </motion.aside>
        </div>
      </AnimatePresence>
    </FramePortal>
  );
}

export function ConfirmPinModal({
  open,
  onClose,
  onConfirm,
  title = "Confirm Approval",
  subtitle = "Owner approval requires PIN or biometric confirmation.",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  subtitle?: string;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setPin("");
      setError("");
      setLoading(false);
    }
  }, [open]);

  const succeed = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, timings.pinVerify));
    setLoading(false);
    onConfirm();
    onClose();
  };

  const submitPin = async () => {
    if (pin === "0000") {
      setError("Incorrect PIN. Try again.");
      return;
    }
    if (pin.length !== 4) {
      setError("Enter a 4-digit PIN.");
      return;
    }
    setError("");
    await succeed();
  };

  const biometric = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, timings.biometric));
    setLoading(false);
    onConfirm();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="t-body text-ink-500">{subtitle}</p>
      <div className="mt-5">
        <div className="t-label text-ink-700">Enter PIN</div>
        <div className="mt-2 flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "flex h-14 flex-1 items-center justify-center rounded-2xl border text-xl font-semibold",
                pin.length > i ? "border-ink-500 bg-surface" : "border-line-strong bg-surface-muted",
              )}
            >
              {pin.length > i ? "•" : ""}
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((k, idx) =>
            k === "" ? (
              <div key={idx} />
            ) : (
              <button
                key={k}
                type="button"
                className="h-12 rounded-2xl border border-line bg-surface t-h3 active:bg-surface-muted"
                onClick={() => {
                  if (k === "⌫") setPin((p) => p.slice(0, -1));
                  else setPin((p) => (p + k).slice(0, 4));
                }}
              >
                {k}
              </button>
            ),
          )}
        </div>
        {error ? <p className="mt-2 t-caption text-err-fg">{error}</p> : null}
      </div>
      <div className="mt-5 flex flex-col gap-2">
        <Button fullWidth loading={loading} onClick={submitPin}>
          Confirm with PIN
        </Button>
        <Button fullWidth variant="secondary" leftIcon={<Fingerprint className="h-5 w-5" />} loading={loading} onClick={biometric}>
          Use biometric
        </Button>
      </div>
      <p className="mt-3 t-caption text-ink-500">Demo: any 4 digits except 0000 succeed.</p>
    </Modal>
  );
}

type ToastTone = "success" | "info" | "error";
type ToastItem = { id: string; message: string; tone: ToastTone };

const ToastCtx = createContext<{ toast: (message: string, tone?: ToastTone) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const toast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = String(Date.now());
    setItems((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <ToastHost items={items} />
    </ToastCtx.Provider>
  );
}

function ToastHost({ items }: { items: ToastItem[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Avoid SSR/client HTML mismatch: render nothing until after mount, and skip empty hosts.
  if (!mounted || items.length === 0) return null;

  const node = document.getElementById("overlay-root");
  const content = (
    <div
      className={cn(
        "pointer-events-none z-[90] flex flex-col gap-2",
        node ? "absolute inset-x-3 bottom-24" : "fixed inset-x-3 bottom-24 md:left-1/2 md:w-[360px] md:-translate-x-1/2",
      )}
      aria-live="polite"
    >
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={cn(
              "rounded-2xl border px-4 py-3 t-label shadow-md",
              t.tone === "success" && "border-ok-bg bg-ok-bg text-ok-fg",
              t.tone === "error" && "border-err-bg bg-err-bg text-err-fg",
              t.tone === "info" && "border-line bg-surface text-ink-900",
            )}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return createPortal(content, node ?? document.body);
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) return { toast: (_m: string, _t?: ToastTone) => {} };
  return ctx;
}
