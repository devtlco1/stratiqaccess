import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";

export function CTASection({
  title,
  body,
  button,
}: {
  title: string;
  body: string;
  button: string;
}) {
  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-navy-900/50">
      <div className="absolute -bottom-32 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-gold-500/10 blur-[120px]" />
      <Container className="relative py-24 text-center">
        <FadeIn>
          <h2 className="mx-auto max-w-2xl font-display text-3xl leading-tight text-silver-100 sm:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-silver-300">
            {body}
          </p>
          <div className="mt-9">
            <Button href="/contact">{button}</Button>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
