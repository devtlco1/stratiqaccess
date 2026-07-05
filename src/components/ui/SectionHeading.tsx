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
      <h2 className="mt-5 font-display text-3xl leading-tight text-silver-100 sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-base leading-relaxed text-silver-300">
          {description}
        </p>
      )}
    </div>
  );
}
