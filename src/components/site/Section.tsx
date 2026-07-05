import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

export function Section({
  className,
  containerClassName,
  children,
}: {
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("py-20 lg:py-28", className)}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
