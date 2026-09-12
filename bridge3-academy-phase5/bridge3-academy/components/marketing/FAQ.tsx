"use client";

import { useState } from "react";

const FAQS = [
  {
    question: "Is Bridge3 free?",
    answer:
      "The General Track is free to join. Some specialized tracks may introduce costs as the platform grows, with scholarship consideration available for early members.",
  },
  {
    question: "Do I need coding knowledge?",
    answer:
      "No. The General Track starts from zero knowledge. Coding is only introduced later, for students who choose a builder-focused path.",
  },
  {
    question: "Is certification recognized?",
    answer:
      "Your certificate is a verifiable on-chain credential issued by Bridge3 Academy, showing exactly what you completed and when. It's not a substitute for formal academic accreditation, but it's built to be checkable and shareable with employers and ecosystem partners.",
  },
  {
    question: "Who is this for?",
    answer:
      "University students, graduates, self-taught learners, and anyone across Africa looking to move from curious about Web3 to actually participating in it.",
  },
  {
    question: "How long does it take?",
    answer:
      "It depends on the track and how much time you put in each week. Exact durations for each track will be published on the docs site.",
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
