"use client";

import { useState } from "react";

const FAQS = [
  {
    question: "Is Bridge3 free for students?",
    answer:
      "Yes. The foundational curriculum and waitlist access are completely free for students. Our programs are supported through ecosystem partnerships and sponsors who invest in open public goods education and emerging talent across Africa.",
  },
  {
    question: "How do I join the academy?",
    answer:
      "Join our verified waitlist on this page. Once you verify your email and complete your onboarding tasks, you are reserved for early cohort access. Official student registration opens by cohort batch, and verified scholars receive direct notification to begin their studies.",
  },
  {
    question: "What skills and tracks can I learn?",
    answer:
      "Beyond core blockchain fundamentals, our Skill set Track prepares students for high-demand digital roles: Content creation/writing, Community Management, Designer (UI/UX, Web, Graphics and more), Social Media Manager, Prompt Engineering, Technical/Growth Writing, Developer (Depend on partnership) and much more.",
  },
  {
    question: "Do I need prior coding experience?",
    answer:
      "No prior coding experience is required. The curriculum begins with practical fundamentals that anyone can follow. Technical development is tailored for those choosing developer pathways, while other tracks focus on creative, operational, and growth roles.",
  },
  {
    question: "Why do blockchain ecosystems and protocols sponsor Bridge3?",
    answer:
      "For sponsoring partners, it means reaching students at the exact moment they're learning the habits and tools they'll use for years. Protocols sponsor cohorts to build long-term ecosystem awareness, support university developer communities, and hire verified builders.",
  },
  {
    question: "How are certificates verified?",
    answer:
      "Every graduate receives an official certificate backed by a cryptographic verification hash and a public verification link. Employers and partners can independently inspect the student record, completed assignments, and track competencies at any time.",
  },
  {
    question: "Who is eligible to apply?",
    answer:
      "University students, recent graduates, self-taught creators, and tech enthusiasts across Africa looking to build genuine competence and verifiable proof of work in the global digital economy.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="border-b border-border py-20">
      <div className="mx-auto max-w-content px-6">
        <h2 className="font-display text-3xl text-ink">FAQs</h2>

        <div className="mt-8 flex flex-col divide-y divide-border border-y border-border">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between py-5 text-left"
                >
                  <span className="font-sans text-base font-medium text-ink">{item.question}</span>
                  <span className="ml-4 text-xl text-ink-muted">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <p className="max-w-prose pb-5 text-sm text-ink-muted">{item.answer}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
