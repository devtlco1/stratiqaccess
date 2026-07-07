export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "dark",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  tone?: "dark" | "light";
}) {
  const alignClass = align === "center" ? "text-center items-center mx-auto" : "text-left items-start";
  const titleColor = tone === "light" ? "text-white" : "text-navy";
  const subtitleColor = tone === "light" ? "text-white/75" : "text-slate";
  const eyebrowColor = tone === "light" ? "text-stratiq-blue" : "text-stratiq-blue";

  return (
    <div className={`flex flex-col gap-4 ${alignClass} max-w-2xl`}>
      {eyebrow && (
        <span className={`text-xs font-semibold tracking-[0.2em] uppercase ${eyebrowColor}`}>
          {eyebrow}
        </span>
      )}
      <h2 className={`font-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight ${titleColor}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-base sm:text-lg leading-relaxed ${subtitleColor}`}>{subtitle}</p>
      )}
    </div>
  );
}
