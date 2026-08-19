import Link from 'next/link';
import clsx from 'clsx';

export function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
  );

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      {pages.map((page, idx) => {
        const prevPage = pages[idx - 1];
        const showEllipsis = prevPage && page - prevPage > 1;
        return (
          <span key={page} className="flex items-center gap-1">
            {showEllipsis && <span className="px-2 text-ink/40">…</span>}
            <Link
              href={buildHref(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={clsx(
                'flex h-9 min-w-9 items-center justify-center rounded border px-2 text-sm tabular-figure',
                page === currentPage
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line text-ink/70 hover:border-ink',
              )}
            >
              {page}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
