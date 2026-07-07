export function PageHero({ title, image }: { title: string; image: string }) {
  return (
    <section className="relative bg-white pt-32 pb-10 lg:pt-40 lg:pb-12">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        <h1
          className="bg-cover bg-center bg-clip-text text-transparent font-sans text-center text-[clamp(3.5rem,14vw,12.5rem)] font-bold tracking-[-0.09em] leading-none"
          style={{ backgroundImage: `url(${image})` }}
        >
          {title}
        </h1>
      </div>
    </section>
  );
}
