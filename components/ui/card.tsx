import type { HTMLAttributes, PropsWithChildren } from "react";

type CardProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    tone?: "default" | "muted" | "accent";
  }
>;

export function Card({ children, className = "", tone = "default", ...props }: CardProps) {
  return (
    <div className={`card card--${tone} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
