"use client";

import { useState } from "react";

export type TimeRange =
  | "today"
  | "yesterday"
  | "7d"
  | "month"
  | "year"
  | "all"
  | "custom";

export interface DateRange {
  from: Date;
  to: Date;
  label: TimeRange;
}

function getRange(label: TimeRange): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (label) {
    case "today":
      return { from: today, to: now, label };
    case "yesterday": {
      const y = new Date(today); y.setDate(y.getDate() - 1);
      const ye = new Date(today); ye.setMilliseconds(-1);
      return { from: y, to: ye, label };
    }
    case "7d": {
      const f = new Date(today); f.setDate(f.getDate() - 6);
      return { from: f, to: now, label };
    }
    case "month": {
      const f = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: f, to: now, label };
    }
    case "year": {
      const f = new Date(now.getFullYear(), 0, 1);
      return { from: f, to: now, label };
    }
    case "all":
    default:
      return { from: new Date(2020, 0, 1), to: now, label: "all" };
  }
}

const PRESETS: { label: TimeRange; display: string }[] = [
  { label: "today",     display: "Today"       },
  { label: "yesterday", display: "Yesterday"   },
  { label: "7d",        display: "Last 7 Days" },
  { label: "month",     display: "This Month"  },
  { label: "year",      display: "This Year"   },
  { label: "all",       display: "All Time"    },
];

function toDateInputValue(d: Date) {
  return d.toISOString().split("T")[0];
}

interface TimeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function TimeFilter({ value, onChange }: TimeFilterProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [customFrom, setCustomFrom] = useState(toDateInputValue(value.from));
  const [customTo,   setCustomTo]   = useState(toDateInputValue(value.to));

  function selectPreset(label: TimeRange) {
    setShowCalendar(false);
    onChange(getRange(label));
  }

  function applyCustom() {
    const from = new Date(customFrom + "T00:00:00");
    const to   = new Date(customTo   + "T23:59:59");
    if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) return;
    onChange({ from, to, label: "custom" });
    setShowCalendar(false);
  }

  const activeLabel = value.label;

  return (
    <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      {/* Preset pills */}
      {PRESETS.map((p) => (
        <button
          key={p.label}
          onClick={() => selectPreset(p.label)}
          style={{
            padding: "5px 14px", borderRadius: 999, border: "1.5px solid",
            borderColor: activeLabel === p.label ? "var(--blue)" : "var(--border, rgba(0,0,0,.12))",
            background: activeLabel === p.label ? "var(--blue-dim)" : "transparent",
            color: activeLabel === p.label ? "var(--blue)" : "var(--text-2)",
            fontWeight: activeLabel === p.label ? 700 : 500,
            fontSize: 13, cursor: "pointer", transition: "all .12s",
            fontFamily: "inherit",
          }}
        >
          {p.display}
        </button>
      ))}

      {/* Calendar toggle */}
      <button
        onClick={() => setShowCalendar((v) => !v)}
        title="Custom date range"
        style={{
          padding: "5px 12px", borderRadius: 999, border: "1.5px solid",
          borderColor: activeLabel === "custom" ? "var(--blue)" : "var(--border, rgba(0,0,0,.12))",
          background: activeLabel === "custom" ? "var(--blue-dim)" : "transparent",
          color: activeLabel === "custom" ? "var(--blue)" : "var(--text-2)",
          fontWeight: 500, fontSize: 13, cursor: "pointer", display: "flex",
          alignItems: "center", gap: 6, fontFamily: "inherit", transition: "all .12s",
        }}
      >
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {activeLabel === "custom"
          ? `${customFrom} → ${customTo}`
          : "Custom"}
      </button>

      {/* Calendar popover */}
      {showCalendar && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 100,
          background: "var(--bg-card, #fff)", border: "1px solid var(--border-card, rgba(0,0,0,.1))",
          borderRadius: 14, padding: "20px", boxShadow: "0 12px 40px rgba(0,0,0,.15)",
          minWidth: 280,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
            Custom Date Range
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 5 }}>
                From
              </label>
              <input
                type="date"
                value={customFrom}
                max={customTo}
                onChange={(e) => setCustomFrom(e.target.value)}
                style={{
                  width: "100%", padding: "8px 10px", borderRadius: 8,
                  border: "1.5px solid var(--border, rgba(0,0,0,.12))",
                  background: "var(--input-bg)", color: "var(--text)", fontSize: 13,
                  fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 5 }}>
                To
              </label>
              <input
                type="date"
                value={customTo}
                min={customFrom}
                max={toDateInputValue(new Date())}
                onChange={(e) => setCustomTo(e.target.value)}
                style={{
                  width: "100%", padding: "8px 10px", borderRadius: 8,
                  border: "1.5px solid var(--border, rgba(0,0,0,.12))",
                  background: "var(--input-bg)", color: "var(--text)", fontSize: 13,
                  fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={applyCustom}
                style={{
                  flex: 1, padding: "9px", borderRadius: 8, border: "none",
                  background: "var(--blue)", color: "#fff", fontWeight: 700, fontSize: 13,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Apply Range
              </button>
              <button
                onClick={() => setShowCalendar(false)}
                style={{
                  padding: "9px 14px", borderRadius: 8,
                  border: "1.5px solid var(--border)", background: "none",
                  color: "var(--text-2)", fontWeight: 600, fontSize: 13,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { getRange };
