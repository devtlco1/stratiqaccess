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
        "group relative overflow-hidden rounded-md border border-ivory-100/10 bg-navy-800/50 p-8 transition-all duration-300 hover:border-gold-500/35 hover:bg-navy-800/80",
        className,
      )}
    >
      {children}
    </div>
  );
}
