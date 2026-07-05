import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden border border-white/10 bg-navy-900/60 p-8 transition-colors duration-300 hover:border-gold-500/40",
        className,
      )}
    >
      {children}
    </div>
  );
}
