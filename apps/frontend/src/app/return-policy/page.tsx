import { Metadata } from "next";
import { getLegalPages } from "@/lib/strapi";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "Return Policy",
  description: "Learn about our return and refund policies.",
};

export default async function ReturnPolicyPage() {
  const res = await getLegalPages().catch(() => ({ data: null }));
  const page = res.data;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumbs items={[{ label: "Return Policy" }]} />
      <h1 className="text-3xl font-bold mt-4 mb-8">Return Policy</h1>
      {page?.returnPolicy ? (
        <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: page.returnPolicy }} />
      ) : (
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h2>30-Day Returns</h2>
          <p>We accept returns within 30 days of delivery for most items in their original condition with tags attached.</p>
          <h2>How to Return</h2>
          <p>Contact our support team to initiate a return. We&apos;ll provide a prepaid shipping label.</p>
          <h2>Refunds</h2>
          <p>Refunds are processed within 5-7 business days of receiving your return. The refund will be credited to your original payment method.</p>
          <h2>Exceptions</h2>
          <p>Sale items, digital products, and gift cards are final sale and cannot be returned.</p>
        </div>
      )}
    </div>
  );
}
