import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[4px] text-[15px] font-medium transition-colors duration-200 px-7 py-3.5 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-gold-500 text-navy-950 hover:bg-gold-400",
  outline:
    "border border-ivory-100/25 text-ivory-100 hover:border-gold-500/60 hover:text-gold-400",
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
