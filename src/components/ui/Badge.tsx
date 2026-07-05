import { cn } from "@/lib/utils";

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-sm font-medium uppercase tracking-[0.12em] text-gold-400",
        className,
      )}
    >
      <span className="h-px w-7 bg-gold-500/70" />
      {children}
    </span>
  );
}
