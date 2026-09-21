import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllArticles,
  getArticleBySlug,
  getAdjacentArticles,
} from "@/lib/docs/data";
import { DocsPagination } from "@/components/docs/DocsPagination";
import { DocsFeedback } from "@/components/docs/DocsFeedback";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: "Article Not Found · Bridge3 Academy Documentation",
    };
  }

  return {
    title: `${article.title} · Bridge3 Academy Documentation`,
    description: article.summary,
    openGraph: {
      title: `${article.title} · Bridge3 Academy Documentation`,
      description: article.summary,
    },
  };
}

export default function DocArticlePage({ params }: Props) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const { prev, next } = getAdjacentArticles(article.slug);

  // Generate URL slug anchor from heading
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  return (
    <div className="flex items-start gap-12">
      {/* Main Article Reader */}
      <article className="min-w-0 flex-1 max-w-3xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-ink-muted">
          <Link href="/docs" className="hover:text-ink">
            Docs
          </Link>
          <span>/</span>
          <span>{article.categoryLabel}</span>
          <span>/</span>
          <span className="font-semibold text-ink line-clamp-1">
            {article.title}
          </span>
        </nav>

        {/* Title Header */}
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-tint px-2.5 py-0.5 text-[11px] font-semibold text-accent">
              {article.categoryLabel}
            </span>
            <span className="text-[11px] text-ink-muted">
              • {article.readTime}
            </span>
            <span className="text-[11px] text-ink-muted">
              • Updated {article.updatedAt}
            </span>
          </div>

          <h1 className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink">
            {article.title}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-ink-muted leading-relaxed">
            {article.summary}
          </p>
        </div>

        {/* Key Takeaways Card */}
        {article.keyTakeaways && article.keyTakeaways.length > 0 && (
          <div className="mt-8 rounded-xl border border-[#C5A059]/40 bg-[#FCFBF7] dark:bg-paper-raised p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#8C6D37]">
              Key Takeaways
            </p>
            <ul className="mt-2.5 space-y-2">
              {article.keyTakeaways.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-ink">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Article Body Sections */}
        <div className="mt-10 space-y-10">
          {article.content.sections.map((section, sIndex) => {
            const sectionId = slugify(section.heading);

            return (
              <section key={sIndex} id={sectionId} className="scroll-mt-24">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                  {section.heading}
                </h2>

                <div className="mt-3 space-y-3 text-sm text-ink-soft leading-relaxed">
                  {section.body.map((p, pIndex) => (
                    <p key={pIndex}>{p}</p>
                  ))}
                </div>

                {/* Bullets */}
                {section.bullets && (
                  <ul className="mt-4 space-y-2 pl-4 border-l-2 border-border/80">
                    {section.bullets.map((bullet, bIndex) => (
                      <li
                        key={bIndex}
                        className="text-xs sm:text-sm text-ink-soft leading-relaxed"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Callout Box */}
                {section.callout && (
                  <div
                    className={`mt-5 rounded-xl border p-4 text-xs sm:text-sm leading-relaxed ${
                      section.callout.type === "tip"
                        ? "border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                        : section.callout.type === "warning"
                        ? "border-red-200 bg-red-50/70 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
                        : section.callout.type === "important"
                        ? "border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                        : "border-blue-200 bg-blue-50/70 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-base shrink-0">
                        {section.callout.type === "tip" && "💡"}
                        {section.callout.type === "warning" && "⚠️"}
                        {section.callout.type === "important" && "⚡"}
                        {section.callout.type === "note" && "ℹ️"}
                      </span>
                      <div>
                        <span className="font-bold uppercase tracking-wider text-[11px] block">
                          {section.callout.type}
                        </span>
                        <p className="mt-0.5">{section.callout.text}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Code Block */}
                {section.codeBlock && (
                  <div className="mt-5 overflow-hidden rounded-xl border border-border bg-[#1E293B] text-slate-50 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-700/60 bg-[#0F172A] px-4 py-1.5 text-[11px] font-mono text-slate-400">
                      <span>{section.codeBlock.language}</span>
                      <span>Bridge3 Snippet</span>
                    </div>
                    <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed">
                      <code>{section.codeBlock.code}</code>
                    </pre>
                  </div>
                )}

                {/* Table */}
                {section.table && (
                  <div className="mt-5 overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-border bg-paper-raised font-semibold text-ink">
                        <tr>
                          {section.table.headers.map((h, hIndex) => (
                            <th key={hIndex} className="p-3">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {section.table.rows.map((row, rIndex) => (
                          <tr key={rIndex} className="hover:bg-paper-hover/50">
                            {row.map((cell, cIndex) => (
                              <td key={cIndex} className="p-3 text-ink-soft">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Tags */}
        <div className="mt-12 flex flex-wrap items-center gap-1.5 pt-6 border-t border-border">
          <span className="text-[11px] font-semibold text-ink-muted">Tags:</span>
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-paper-raised px-2 py-0.5 text-[10px] text-ink-soft border border-border"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Next / Previous Pagination */}
        <DocsPagination prev={prev} next={next} />

        {/* Was this article helpful? */}
        <DocsFeedback articleTitle={article.title} />
      </article>

      {/* On This Page Sidebar (Desktop XL only) */}
      <div className="hidden xl:block w-56 shrink-0 sticky top-24">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
          On this page
        </p>
        <ul className="mt-3 space-y-2 border-l border-border pl-3 text-xs">
          {article.content.sections.map((section, idx) => {
            const id = slugify(section.heading);
            return (
              <li key={idx}>
                <a
                  href={`#${id}`}
                  className="text-ink-muted hover:text-accent transition-colors block line-clamp-1"
                >
                  {section.heading}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 pt-6 border-t border-border">
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
