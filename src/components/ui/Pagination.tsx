import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";

const PAGE_SIZE = 10;

export { PAGE_SIZE };

// Plain server-rendered links (?page=N) — no client JS needed. Page 1 links
// to the bare basePath so the canonical/no-query URL stays the default entry
// point. Renders nothing when everything fits on one page.
export function Pagination({
  currentPage,
  totalPages,
  basePath,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (page: number) => (page === 1 ? basePath : `${basePath}?page=${page}`);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className="mt-16 flex items-center justify-center gap-2">
      {currentPage > 1 ? (
        <Link
          href={hrefFor(currentPage - 1)}
          aria-label="Previous page"
          className="inline-flex size-9 items-center justify-center rounded-md text-ink/60 hover:bg-paper hover:text-navy transition-colors"
        >
          <Icon name="arrow-right" className="size-4 rotate-180 rtl:rotate-0" />
        </Link>
      ) : (
        <span className="inline-flex size-9 items-center justify-center rounded-md text-ink/20">
          <Icon name="arrow-right" className="size-4 rotate-180 rtl:rotate-0" />
        </span>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={hrefFor(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`inline-flex size-9 items-center justify-center rounded-md text-sm font-semibold transition-colors ${
            page === currentPage
              ? "bg-stratiq-blue text-white"
              : "text-ink/70 hover:bg-paper hover:text-navy"
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages ? (
        <Link
          href={hrefFor(currentPage + 1)}
          aria-label="Next page"
          className="inline-flex size-9 items-center justify-center rounded-md text-ink/60 hover:bg-paper hover:text-navy transition-colors"
        >
          <Icon name="arrow-right" className="size-4 rtl:rotate-180" />
        </Link>
      ) : (
        <span className="inline-flex size-9 items-center justify-center rounded-md text-ink/20">
          <Icon name="arrow-right" className="size-4 rtl:rotate-180" />
        </span>
      )}
    </nav>
  );
}
