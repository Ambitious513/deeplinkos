import type { HTMLAttributes, PropsWithChildren } from "react";

type BadgeProps = PropsWithChildren<HTMLAttributes<HTMLSpanElement>>;

export function Badge({ children, className = "", ...props }: BadgeProps) {
  return (
    <span className={`badge ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
