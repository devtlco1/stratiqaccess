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
    <section className="relative overflow-hidden border-t border-ivory-100/8 bg-navy-950">
      <div className="absolute -bottom-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gold-500/8 blur-[140px]" />
      <Container className="relative py-24 text-center">
        <FadeIn>
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-[1.15] text-ivory-100 sm:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-500">
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
