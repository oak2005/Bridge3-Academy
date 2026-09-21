import Link from "next/link";

interface Props {
  prev?: { slug: string; title: string };
  next?: { slug: string; title: string };
}

export function DocsPagination({ prev, next }: Props) {
  if (!prev && !next) return null;

  return (
    <div className="mt-10 grid gap-4 pt-6 border-t border-border sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/docs/${prev.slug}`}
          className="group flex flex-col justify-center rounded-xl border border-border bg-paper p-4 transition-all hover:border-accent hover:bg-paper-raised"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted group-hover:text-accent">
            ← Previous Article
          </span>
          <span className="mt-1 text-xs font-semibold text-ink line-clamp-1 group-hover:text-accent">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/docs/${next.slug}`}
          className="group flex flex-col justify-center text-right rounded-xl border border-border bg-paper p-4 transition-all hover:border-accent hover:bg-paper-raised sm:text-right"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted group-hover:text-accent">
            Next Article →
          </span>
          <span className="mt-1 text-xs font-semibold text-ink line-clamp-1 group-hover:text-accent">
            {next.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
