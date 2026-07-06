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
        "inline-flex items-center gap-2.5 text-[13px] font-medium uppercase tracking-[0.16em] text-gold-400",
        className,
      )}
    >
      <span className="h-px w-7 shrink-0 bg-gold-500/70" />
      {children}
    </span>
  );
}
