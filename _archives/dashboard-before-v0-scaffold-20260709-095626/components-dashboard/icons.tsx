// Dashboard icon map — inline SVG, no external deps.
// All icons render at the size of their container (width/height via className or style).

import type { ReactNode } from "react";

type IconProps = { className?: string; "aria-hidden"?: boolean };

function Icon({ d, className, ...rest }: IconProps & { d: string | ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={rest["aria-hidden"] ?? true}
    >
      {typeof d === "string" ? <path d={d} /> : d}
    </svg>
  );
}

export function OverviewIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </>
      }
    />
  );
}

export function LinksIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </>
      }
    />
  );
}

export function AnalyticsIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </>
      }
    />
  );
}

export function QrIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <rect x="3" y="3" width="5" height="5" rx="0.5" />
          <rect x="16" y="3" width="5" height="5" rx="0.5" />
          <rect x="3" y="16" width="5" height="5" rx="0.5" />
          <path d="M16 16h.01M16 19h.01M19 16h.01M19 19h.01M13 3v5M13 10h2M13 13h5M10 13v2M10 17v4" />
        </>
      }
    />
  );
}

export function ProfileIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </>
      }
    />
  );
}

export function BillingIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </>
      }
    />
  );
}

export function DomainsIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a15 15 0 0 1 0 18M3 12h18" />
          <path d="M12 3c-2.5 3-4 5.7-4 9s1.5 6 4 9" />
          <path d="M12 3c2.5 3 4 5.7 4 9s-1.5 6-4 9" />
        </>
      }
    />
  );
}

export function PixelsIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </>
      }
    />
  );
}

export function CollapseIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 9l-3 3 3 3" />
        </>
      }
    />
  );
}

export function ExpandIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M12 9l3 3-3 3" />
        </>
      }
    />
  );
}

export function MenuIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </>
      }
    />
  );
}

export function PlusIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </>
      }
    />
  );
}

export function SunIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </>
      }
    />
  );
}

export function MoonIcon(p: IconProps) {
  return <Icon {...p} d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />;
}

export function SearchIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </>
      }
    />
  );
}

export function CopyIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </>
      }
    />
  );
}

export function PauseIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </>
      }
    />
  );
}

export function PlayIcon(p: IconProps) {
  return <Icon {...p} d="M5 3l14 9-14 9V3z" />;
}

export function TrashIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </>
      }
    />
  );
}

export function CheckIcon(p: IconProps) {
  return <Icon {...p} d="M20 6L9 17l-5-5" />;
}

export function CloseIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      }
    />
  );
}

export function MoreIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="19" r="1" />
        </>
      }
    />
  );
}

export function MoreHorizIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <circle cx="5" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
        </>
      }
    />
  );
}

export function SignOutIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </>
      }
    />
  );
}

export function DownloadIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </>
      }
    />
  );
}

export function SparkleIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
        </>
      }
    />
  );
}

export function AlertIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </>
      }
    />
  );
}

export function TrendUpIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </>
      }
    />
  );
}

export function TrendDownIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
          <polyline points="17 18 23 18 23 12" />
        </>
      }
    />
  );
}

export function ExternalLinkIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </>
      }
    />
  );
}

export function ShieldIcon(p: IconProps) {
  return <Icon {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
}

export function KeyIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </>
      }
    />
  );
}

export function VerifyIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </>
      }
    />
  );
}

export function InfoIcon(p: IconProps) {
  return (
    <Icon
      {...p}
      d={
        <>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </>
      }
    />
  );
}
