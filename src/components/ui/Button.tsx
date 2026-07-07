import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  showArrow?: boolean;
};

const variants = {
  primary: "bg-stratiq-blue text-white hover:bg-navy",
  outline: "border border-white/40 text-white hover:bg-white hover:text-navy",
  ghost: "border border-navy/20 text-navy hover:bg-navy hover:text-white",
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  showArrow = true,
}: ButtonProps) {
  const isAnchor = href.startsWith("#");
  const classes = `inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide uppercase transition-colors duration-300 ${variants[variant]} ${className}`;

  if (isAnchor) {
    return (
      <a href={href} className={classes}>
        {children}
        {showArrow && <Icon name="arrow-right" className="size-4" />}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
      {showArrow && <Icon name="arrow-right" className="size-4" />}
    </Link>
  );
}
