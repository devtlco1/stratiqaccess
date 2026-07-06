"use client";

import { useEffect, useState } from "react";

export function SectionRail({
  sections,
}: {
  sections: { id: string; label: string }[];
}) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Section navigation"
      className="fixed end-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-5 lg:flex"
    >
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="group flex items-center gap-3"
        >
          <span
            className={`text-[11px] font-medium uppercase tracking-[0.14em] transition-all duration-300 ${
              active === s.id
                ? "translate-x-0 text-gold-300 opacity-100 rtl:translate-x-0"
                : "translate-x-1 text-muted-600 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 rtl:-translate-x-1 rtl:group-hover:translate-x-0"
            }`}
          >
            {s.label}
          </span>
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full border transition-all duration-300 ${
              active === s.id
                ? "border-gold-400 bg-gold-400"
                : "border-ivory-100/25 bg-transparent group-hover:border-gold-400/60"
            }`}
          />
        </a>
      ))}
    </nav>
  );
}
