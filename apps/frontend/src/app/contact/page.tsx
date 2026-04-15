import { Metadata } from "next";
import { getContactPage } from "@/lib/strapi";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ContactForm } from "@/components/ui/ContactForm";
import { Mail, Phone, MapPin } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const res = await getContactPage().catch(() => ({ data: null }));
  const page = res.data;
  return {
    title: page?.seo?.metaTitle || "Contact Us",
    description: page?.seo?.metaDescription || "Get in touch with our team.",
  };
}

export default async function ContactPage() {
  const res = await getContactPage().catch(() => ({ data: null }));
  const page = res.data;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumbs items={[{ label: "Contact" }]} />

      <h1 className="text-3xl font-bold mt-4 mb-6">{page?.title || "Contact Us"}</h1>

      {page?.content && (
        <div
          className="prose dark:prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact info */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Get in Touch</h2>
          <div className="space-y-4">
            {(page?.email || true) && (
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-primary mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href={`mailto:${page?.email || "support@example.com"}`} className="text-muted hover:text-primary">
                    {page?.email || "support@example.com"}
                  </a>
                </div>
              </div>
            )}
            {(page?.phone || true) && (
              <div className="flex items-start gap-3">
                <Phone size={20} className="text-primary mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium">Phone</p>
                  <a href={`tel:${page?.phone || "+1234567890"}`} className="text-muted hover:text-primary">
                    {page?.phone || "+1 (234) 567-890"}
                  </a>
                </div>
              </div>
            )}
            {(page?.address || true) && (
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-primary mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-muted">{page?.address || "123 Commerce St, Suite 100, New York, NY 10001"}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact form */}
        <ContactForm />
      </div>
    </div>
  );
}
