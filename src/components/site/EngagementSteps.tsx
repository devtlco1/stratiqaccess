import { FadeIn } from "@/components/ui/FadeIn";

export function EngagementSteps({
  steps,
}: {
  steps: { step: string; title: string; body: string }[];
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-4">
      {steps.map((s, i) => (
        <FadeIn key={s.step} delay={i * 0.08} className="relative">
          <span className="font-display text-4xl text-gold-500/40">
            {s.step}
          </span>
          <h3 className="mt-4 text-lg text-silver-100">{s.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-silver-300">
            {s.body}
          </p>
          {i < steps.length - 1 && (
            <span className="absolute right-[-1rem] top-6 hidden h-px w-8 bg-gold-500/30 lg:block" />
          )}
        </FadeIn>
      ))}
    </div>
  );
}
