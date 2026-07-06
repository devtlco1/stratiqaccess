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
        "glow-card-hover group relative overflow-hidden rounded-xl border border-ivory-100/8 bg-navy-800/40 p-8 backdrop-blur-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
