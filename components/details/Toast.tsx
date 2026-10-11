"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Outcome } from "../export/delivery";
import { cx } from "../ui/Button";

interface ToastValue {
  show: (outcome: Outcome) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

/** Bottom-centre confirmation / error messages, announced politely to screen readers. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(Outcome & { id: number }) | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const counter = useRef(0);

  const show = useCallback((outcome: Outcome) => {
    window.clearTimeout(timer.current);
    setToast({ ...outcome, id: ++counter.current });
    timer.current = window.setTimeout(() => setToast(null), outcome.ok ? 2400 : 5000);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className={cx(
                "flex max-w-[460px] items-center gap-2 rounded-[10px] px-3 py-2 text-[12px] leading-4 font-medium text-white shadow-card-hover",
                toast.ok ? "bg-ink" : "bg-[#b3261e]",
              )}
            >
              <span aria-hidden className={cx("size-1.5 shrink-0 rounded-full", toast.ok ? "bg-accent" : "bg-white")} />
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
