"use client";

import { useEffect, useRef, useState } from "react";

const routes = [
  { label: "iOS — App Installed",    sublabel: "Opens app directly",      color: "#6366f1", delay: 0    },
  { label: "iOS — No App",           sublabel: "App Store redirect",       color: "#8b5cf6", delay: 120  },
  { label: "Android — App Installed",sublabel: "Opens app directly",      color: "#ef7a22", delay: 240  },
  { label: "Android — No App",       sublabel: "Play Store redirect",      color: "#f59e0b", delay: 360  },
  { label: "Desktop",                sublabel: "Web fallback page",        color: "#10b981", delay: 480  },
];

export function RoutingDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="routing-diagram" ref={ref} aria-label="How DeepLinkOS routes one link to five destinations">
      {/* Left — URL pill */}
      <div className={`rd-source${visible ? " rd-source--visible" : ""}`}>
        <div className="rd-source-label">Your link</div>
        <div className="rd-source-pill">
          <span className="rd-source-dot" />
          dlnk.os/r/abc123
        </div>
      </div>

      {/* Centre — DeepLinkOS node */}
      <div className={`rd-node${visible ? " rd-node--visible" : ""}`}>
        <div className="rd-node-ring" aria-hidden="true" />
        <div className="rd-node-core">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" aria-hidden="true">
            <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 4.93" />
            <path d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07L13 19.07" />
          </svg>
        </div>
        <span className="rd-node-label">DeepLinkOS</span>
      </div>

      {/* Right — route destinations */}
      <div className="rd-routes">
        {routes.map((route, i) => (
          <div
            key={route.label}
            className={`rd-route${visible ? " rd-route--visible" : ""}`}
            style={{
              transitionDelay: visible ? `${route.delay}ms` : "0ms",
            }}
          >
            <div className="rd-route-line" style={{ background: route.color }} aria-hidden="true" />
            <div className="rd-route-card">
              <span className="rd-route-dot" style={{ background: route.color }} />
              <div>
                <div className="rd-route-label">{route.label}</div>
                <div className="rd-route-sub">{route.sublabel}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
