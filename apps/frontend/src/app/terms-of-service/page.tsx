import { Metadata } from "next";
import { getLegalPages } from "@/lib/strapi";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const res = await getLegalPages().catch(() => ({ data: null }));
  const page = res.data;
  return {
    title: page?.seo?.metaTitle || "Terms of Service",
    description: page?.seo?.metaDescription || "Our terms and conditions for using our services.",
  };
}

export default async function TermsOfServicePage() {
  const res = await getLegalPages().catch(() => ({ data: null }));
  const page = res.data;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumbs items={[{ label: "Terms of Service" }]} />
      <h1 className="text-3xl font-bold mt-4 mb-8">Terms of Service</h1>
      {page?.termsOfService ? (
        <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: page.termsOfService }} />
      ) : (
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p>By using our website and services, you agree to comply with these terms and conditions.</p>
          <h2>Use of Service</h2>
          <p>You must be at least 18 years old to use our services. You agree to use them only for lawful purposes.</p>
          <h2>Accounts</h2>
          <p>You are responsible for maintaining the security of your account credentials.</p>
          <h2>Purchases</h2>
          <p>All purchases are subject to product availability and acceptance of your order.</p>
        </div>
      )}
    </div>
  );
}
