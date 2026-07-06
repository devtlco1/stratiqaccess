import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-[15px] font-medium transition-all duration-300 px-7 py-3.5 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-gold-600 to-gold-400 text-navy-950 shadow-[0_10px_30px_-10px_rgba(200,163,90,0.45)] hover:shadow-[0_14px_36px_-10px_rgba(200,163,90,0.55)] hover:-translate-y-0.5",
  outline:
    "border border-ivory-100/15 bg-ivory-100/[0.02] text-ivory-100 backdrop-blur-sm hover:border-gold-400/50 hover:bg-gold-400/5 hover:text-gold-300",
  ghost: "text-muted-500 hover:text-ivory-100",
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
      <Link href={href} className={classes} onClick={props.onClick as never}>
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
