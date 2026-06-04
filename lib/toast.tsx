"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  useEffect(() => {
    const t = setTimeout(onRemove, 3500);
    return () => clearTimeout(t);
  }, [onRemove]);

  const colors: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: { bg: "var(--bg-card)", border: "#22c55e", icon: "✓" },
    error:   { bg: "var(--bg-card)", border: "#ef4444", icon: "✕" },
    info:    { bg: "var(--bg-card)", border: "var(--blue)", icon: "ℹ" },
  };
  const { bg, border, icon } = colors[toast.type];

  return (
    <div
      onClick={onRemove}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        borderRadius: 10,
        background: bg,
        border: `1px solid ${border}`,
        boxShadow: "0 4px 20px rgba(0,0,0,.18)",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 500,
        color: "var(--text-1)",
        maxWidth: 320,
        animation: "toast-in .22s ease",
        userSelect: "none" as const,
      }}
    >
      <span
        style={{
          width: 20, height: 20, borderRadius: "50%",
          background: border, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}
      >
        {icon}
      </span>
      {toast.message}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  function remove(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {/* Toast portal — fixed above mobile bottom nav */}
      <div
        style={{
          position: "fixed",
          bottom: 88,          /* clears the mobile bottom tab bar */
          right: 16,
          left: 16,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: "auto" }}>
            <ToastItem toast={t} onRemove={() => remove(t.id)} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px) scale(.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
