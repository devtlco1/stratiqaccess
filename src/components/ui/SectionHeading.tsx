import { Badge } from "./Badge";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && <Badge className={align === "center" ? "justify-center" : ""}>{eyebrow}</Badge>}
      <h2 className="mt-6 text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-ivory-100 sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-lg leading-relaxed text-muted-500">
          {description}
        </p>
      )}
    </div>
  );
}
