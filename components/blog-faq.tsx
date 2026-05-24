"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface BlogFaqProps {
  items: FaqItem[];
}

export function BlogFaq({ items }: BlogFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!items.length) return null;

  return (
    <section className="blog-faq" aria-labelledby="faq-heading" id="faq">
      <h2 className="blog-faq__heading" id="faq-heading">
        Frequently Asked Questions
      </h2>

      <div className="blog-faq__list" role="list">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          const answerId = `faq-answer-${i}`;
          const btnId    = `faq-btn-${i}`;

          return (
            <div
              key={i}
              className={`faq-item${isOpen ? " is-open" : ""}`}
              role="listitem"
            >
              <button
                id={btnId}
                className="faq-item__q"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={answerId}
              >
                <span>{item.question}</span>
                <span className="faq-item__icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              <div
                id={answerId}
                className="faq-item__a"
                role="region"
                aria-labelledby={btnId}
                hidden={!isOpen}
              >
                <p>{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
