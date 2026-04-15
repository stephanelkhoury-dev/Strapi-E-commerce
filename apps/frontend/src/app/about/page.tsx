import { Metadata } from "next";
import Image from "next/image";
import { getAboutPage, getStrapiImageUrl } from "@/lib/strapi";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const res = await getAboutPage().catch(() => ({ data: null }));
  const page = res.data;
  return {
    title: page?.seo?.metaTitle || "About Us",
    description: page?.seo?.metaDescription || "Learn more about our store and mission.",
  };
}

export default async function AboutPage() {
  const res = await getAboutPage().catch(() => ({ data: null }));
  const page = res.data;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumbs items={[{ label: "About" }]} />

      <h1 className="text-3xl font-bold mt-4 mb-6">{page?.title || "About Us"}</h1>

      {page?.image?.url && (
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-8">
          <Image
            src={getStrapiImageUrl(page.image.url)}
            alt={page.title || "About us"}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {page?.content ? (
        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      ) : (
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p>
            We are a passionate team dedicated to delivering the best products and shopping experience.
            Our mission is to provide high-quality items at fair prices, with exceptional customer service.
          </p>
          <p>
            Founded with a vision to make online shopping simple, enjoyable, and reliable,
            we carefully curate our collection to ensure every product meets our standards.
          </p>
        </div>
      )}

      {page?.mission && (
        <div className="mt-10 p-8 rounded-2xl bg-primary/5 border border-primary/10">
          <h2 className="text-xl font-bold mb-3">Our Mission</h2>
          <p className="text-muted">{page.mission}</p>
        </div>
      )}
    </div>
  );
}
