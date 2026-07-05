import Link from "next/link";
import { cn } from "@/lib/utils";

export const fieldClasses =
  "w-full border border-white/15 bg-navy-900/50 px-4 py-2.5 text-sm text-silver-100 placeholder:text-silver-500 focus:border-gold-500/60 focus:outline-none";
export const labelClasses = "mb-1.5 block text-xs uppercase tracking-wide text-silver-400";

export function AdminButton({
  href,
  variant = "primary",
  className,
  children,
  ...props
}: {
  href?: string;
  variant?: "primary" | "outline" | "danger";
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary: "bg-gold-500 text-navy-950 hover:bg-gold-400",
    outline: "border border-white/15 text-silver-200 hover:border-gold-500/40 hover:text-gold-400",
    danger: "border border-red-500/40 text-red-400 hover:bg-red-500/10",
  }[variant];

  const classes = cn(
    "inline-flex items-center justify-center px-5 py-2.5 text-xs uppercase tracking-wide transition-colors disabled:opacity-50",
    styles,
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl text-silver-100">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-silver-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-white/10 bg-navy-900/50 p-6">
      <p className="text-xs uppercase tracking-wide text-silver-400">{label}</p>
      <p className="mt-3 font-display text-3xl text-gold-400">{value}</p>
    </div>
  );
}

export function StatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "bad" }) {
  const tones = {
    neutral: "border-silver-400/30 text-silver-300",
    good: "border-emerald-400/40 text-emerald-400",
    warn: "border-gold-400/40 text-gold-400",
    bad: "border-red-400/40 text-red-400",
  }[tone];
  return (
    <span className={cn("inline-block border px-2.5 py-1 text-[11px] uppercase tracking-wide", tones)}>
      {children}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-white/15 p-12 text-center text-sm text-silver-400">
      {message}
    </div>
  );
}

export function AdminTable({
  columns,
  children,
}: {
  columns: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto border border-white/10">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-navy-900/60 text-left">
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 text-xs uppercase tracking-wide text-silver-400">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">{children}</tbody>
      </table>
    </div>
  );
}
