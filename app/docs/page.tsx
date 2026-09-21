import type { Metadata } from "next";
import Link from "next/link";
import { DOC_CATEGORIES, getArticlesByCategory } from "@/lib/docs/data";

export const metadata: Metadata = {
  title: "Documentation & Knowledge Base · Bridge3 Academy",
  description:
    "Comprehensive guides, curriculum architecture, workshop submission rubrics, and certification standards for Bridge3 Academy scholars and mentors.",
};

export default function DocsHomePage() {
  return (
    <div className="max-w-4xl">
      {/* Header / Hero */}
      <div>
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span>Academy</span>
          <span>/</span>
          <span className="font-semibold text-ink">Documentation</span>
        </div>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl text-ink tracking-tight">
          Bridge3 Academy Documentation
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base text-ink-muted leading-relaxed">
          The single source of truth for prospective scholars, enrolled students, mentors, and ecosystem partners. Explore our curriculum syllabus, workshop rubrics, grading standards, and cryptographic verification specifications.
        </p>
      </div>

      {/* Quick Start Cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Link
          href="/docs/welcome"
          className="group rounded-xl border border-border bg-paper-raised p-5 transition-all hover:border-accent hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-tint text-accent text-lg">
            🚀
          </div>
          <h3 className="mt-4 text-sm font-bold text-ink group-hover:text-accent">
            New Student? Start Here
          </h3>
          <p className="mt-1 text-xs text-ink-muted leading-relaxed">
            Understand how our four-step module cadence takes you from foundational theory to approved code.
          </p>
          <span className="mt-3 inline-flex items-center text-xs font-semibold text-accent">
            Read Introduction →
          </span>
        </Link>

        <Link
          href="/docs/curriculum-overview"
          className="group rounded-xl border border-border bg-paper-raised p-5 transition-all hover:border-accent hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C5A059]/15 text-[#8C6D37] text-lg">
            📚
          </div>
          <h3 className="mt-4 text-sm font-bold text-ink group-hover:text-accent">
            Curriculum &amp; Tracks
          </h3>
          <p className="mt-1 text-xs text-ink-muted leading-relaxed">
            Detailed breakdowns of General, Ecosystem, Developer (Clarity), Creative (UI/UX), and Growth tracks.
          </p>
          <span className="mt-3 inline-flex items-center text-xs font-semibold text-accent">
            Explore Syllabus →
          </span>
        </Link>

        <Link
          href="/docs/certification-standards"
          className="group rounded-xl border border-border bg-paper-raised p-5 transition-all hover:border-accent hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-lg">
            🎓
          </div>
          <h3 className="mt-4 text-sm font-bold text-ink group-hover:text-accent">
            Certification Standards
          </h3>
          <p className="mt-1 text-xs text-ink-muted leading-relaxed">
            Learn the graduation criteria, SHA-256 verification engine, and how to verify certificates publicly.
          </p>
          <span className="mt-3 inline-flex items-center text-xs font-semibold text-accent">
            View Standards →
          </span>
        </Link>
      </div>

      {/* Structured Category Directory */}
      <div className="mt-14 space-y-12">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">
            Knowledge Base Categories
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            Browse guides and technical documentation organized by topic.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {DOC_CATEGORIES.map((category) => {
            const articles = getArticlesByCategory(category.id);

            return (
              <div
                key={category.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-paper p-6 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{category.icon}</span>
                    <h3 className="font-display text-base font-bold text-ink">
                      {category.label}
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                    {category.description}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {articles.map((article) => (
                      <li key={article.slug}>
                        <Link
                          href={`/docs/${article.slug}`}
                          className="group flex items-start justify-between gap-2 text-xs text-ink-soft hover:text-accent"
                        >
                          <span className="font-medium group-hover:underline line-clamp-1">
                            {article.title}
                          </span>
                          <span className="shrink-0 text-[10px] text-ink-muted">
                            {article.readTime}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-ink-muted">
                    {articles.length} {articles.length === 1 ? "article" : "articles"}
                  </span>
                  {articles.length > 0 && (
                    <Link
                      href={`/docs/${articles[0].slug}`}
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      Start Section →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Track Quick Links Banner */}
      <div className="mt-14 rounded-2xl border border-accent/30 bg-accent-tint/40 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
              Ready to begin?
            </span>
            <h3 className="mt-1 font-display text-xl font-bold text-ink">
              Enroll in a Specialization Track
            </h3>
            <p className="mt-1 text-xs text-ink-muted max-w-lg leading-relaxed">
              Bridge3 Academy is free for students across Africa. Sign in with Google to access lessons, take quizzes, and build your verified Web3 portfolio.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-xs font-bold text-accent-contrast shadow-sm transition-colors hover:bg-accent-hover"
            >
              Start Learning Free →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
