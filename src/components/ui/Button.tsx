import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm tracking-wide uppercase transition-colors duration-300 px-7 py-3.5 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-gold-500 text-navy-950 hover:bg-gold-400 font-medium",
  outline:
    "border border-gold-500/60 text-gold-400 hover:border-gold-400 hover:text-gold-300",
  ghost: "text-silver-200 hover:text-gold-400",
};

export function Button({
  variant = "primary",
  className,
  href,
  children,
  type = "button",
  ...props
}: {
  variant?: Variant;
  className?: string;
  href?: string;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = cn(base, variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
