"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface Props {
  items: FAQItem[];
}

export function FAQAccordion({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const headingId = `faq-heading-${index}`;
        const panelId = `faq-panel-${index}`;

        return (
          <div
            key={index}
            className="border border-border rounded-xl overflow-hidden bg-white dark:bg-gray-900"
          >
            <h3>
              <button
                type="button"
                id={headingId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between px-5 py-4 text-left font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span>{item.question}</span>
                <ChevronDown
                  size={18}
                  className={`flex-shrink-0 ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headingId}
              hidden={!isOpen}
              className="px-5 pb-4"
            >
              {item.answer.startsWith("<") ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              ) : (
                <p className="text-sm text-muted">{item.answer}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
