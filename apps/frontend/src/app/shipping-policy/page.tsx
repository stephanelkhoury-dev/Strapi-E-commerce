import { Metadata } from "next";
import { getLegalPages } from "@/lib/strapi";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Learn about our shipping methods, delivery times, and costs.",
};

export default async function ShippingPolicyPage() {
  const res = await getLegalPages().catch(() => ({ data: null }));
  const page = res.data;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumbs items={[{ label: "Shipping Policy" }]} />
      <h1 className="text-3xl font-bold mt-4 mb-8">Shipping Policy</h1>
      {page?.shippingPolicy ? (
        <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: page.shippingPolicy }} />
      ) : (
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h2>Shipping Methods</h2>
          <p>We offer standard (5-7 business days) and express (2-3 business days) shipping options.</p>
          <h2>Shipping Costs</h2>
          <p>Shipping costs are calculated at checkout based on your location and the weight of your order.</p>
          <h2>Free Shipping</h2>
          <p>Orders over $50 qualify for free standard shipping within the continental US.</p>
          <h2>International Shipping</h2>
          <p>We ship to select international destinations. Customs duties and taxes are the responsibility of the buyer.</p>
        </div>
      )}
    </div>
  );
}
