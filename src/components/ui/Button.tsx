import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-[15px] font-medium transition-all duration-300 px-7 py-3.5 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-blue-600 to-cyan-500 text-ivory-100 shadow-[0_8px_30px_-8px_rgba(59,130,246,0.55)] hover:shadow-[0_12px_40px_-8px_rgba(34,211,238,0.6)] hover:-translate-y-0.5",
  outline:
    "border border-ivory-100/15 bg-ivory-100/[0.02] text-ivory-100 backdrop-blur-sm hover:border-cyan-400/50 hover:bg-cyan-400/5 hover:text-cyan-300",
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
