import { cn } from '@/lib/utils'

/**
 * Shared DeepLinkOS brand icon — "Link Arrow" mark.
 * A single chain-link oval (rotated 45°) with a bold arrow threading through it,
 * representing smart deep routing through a link.
 *
 * Usage: drop this SVG inside any container. The icon uses `currentColor`
 * so it inherits text color from the parent. Works on both dark and light bg.
 *
 * width/height HTML attributes act as a size floor — prevents browsers from
 * rendering at the 300px SVG default when Tailwind classes aren't yet applied.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      width="20"
      height="20"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-5', className)}
      aria-hidden
    >
      {/* Chain-link oval — rotated 45° to create the diagonal diamond-link shape */}
      <ellipse
        cx="12"
        cy="12"
        rx="6.5"
        ry="3.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        transform="rotate(45 12 12)"
      />
      {/* Arrow threading horizontally through the center of the link */}
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 9l3 3-3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
