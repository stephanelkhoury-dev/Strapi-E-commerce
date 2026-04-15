import { Metadata } from "next";
import { getLegalPages } from "@/lib/strapi";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const res = await getLegalPages().catch(() => ({ data: null }));
  const page = res.data;
  return {
    title: page?.seo?.metaTitle || "Privacy Policy",
    description: page?.seo?.metaDescription || "Our privacy policy and how we handle your data.",
  };
}

export default async function PrivacyPolicyPage() {
  const res = await getLegalPages().catch(() => ({ data: null }));
  const page = res.data;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
      <h1 className="text-3xl font-bold mt-4 mb-8">Privacy Policy</h1>
      {page?.privacyPolicy ? (
        <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: page.privacyPolicy }} />
      ) : (
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p>This privacy policy outlines how we collect, use, and protect your personal information when you use our website and services.</p>
          <h2>Information We Collect</h2>
          <p>We collect information you provide directly, such as when creating an account, making a purchase, or contacting us.</p>
          <h2>How We Use Your Information</h2>
          <p>We use your information to process orders, improve our services, and communicate with you about your account and orders.</p>
          <h2>Data Protection</h2>
          <p>We implement industry-standard security measures to protect your personal information.</p>
        </div>
      )}
    </div>
  );
}
