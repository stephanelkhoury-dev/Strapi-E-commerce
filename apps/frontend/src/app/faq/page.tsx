import { Metadata } from "next";
import { getFaqPage } from "@/lib/strapi";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { FAQAccordion } from "@/components/ui/FAQAccordion";

export async function generateMetadata(): Promise<Metadata> {
  const res = await getFaqPage().catch(() => ({ data: null }));
  const page = res.data;
  return {
    title: page?.seo?.metaTitle || "Frequently Asked Questions",
    description: page?.seo?.metaDescription || "Find answers to common questions about our store.",
  };
}

export default async function FAQPage() {
  const res = await getFaqPage().catch(() => ({ data: null }));
  const page = res.data;
  const items = page?.items || [];

  const faqJsonLd = items.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item: any) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer?.replace(/<[^>]+>/g, "") || "",
      },
    })),
  } : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumbs items={[{ label: "FAQ" }]} />

      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <h1 className="text-3xl font-bold mt-4 mb-8">{page?.title || "Frequently Asked Questions"}</h1>

      {items.length > 0 ? (
        <FAQAccordion items={items} />
      ) : (
        <div className="space-y-6">
          <FAQAccordion
            items={[
              { question: "What payment methods do you accept?", answer: "We accept all major credit/debit cards via Stripe and PayPal." },
              { question: "How long does shipping take?", answer: "Standard shipping takes 5-7 business days. Express shipping is available at checkout." },
              { question: "What is your return policy?", answer: "We offer a 30-day return policy on all unworn and unused items with original tags." },
              { question: "Do you ship internationally?", answer: "Yes! We ship to select countries. Shipping rates and delivery times vary by destination." },
              { question: "How can I track my order?", answer: "Once your order ships, you'll receive an email with a tracking number. You can also track orders from your account dashboard." },
            ]}
          />
        </div>
      )}
    </div>
  );
}
