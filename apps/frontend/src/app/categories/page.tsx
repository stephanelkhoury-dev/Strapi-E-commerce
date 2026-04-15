import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCategories, getStrapiImageUrl } from "@/lib/strapi";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "All Categories",
  description: "Browse all product categories in our store.",
};

export default async function CategoriesPage() {
  const res = await getCategories().catch(() => ({ data: [] }));
  const categories = res.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumbs items={[{ label: "Categories" }]} />
      <h1 className="text-3xl font-bold mt-4 mb-8">All Categories</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.documentId}
            href={`/categories/${cat.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-border bg-white dark:bg-gray-900 transition-shadow hover:shadow-lg"
          >
            <div className="aspect-4/3 relative bg-gray-100 dark:bg-gray-800">
              {cat.image?.url ? (
                <Image
                  src={getStrapiImageUrl(cat.image.url)}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted">
                  <span className="text-4xl">📦</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {cat.name}
              </h2>
              {cat.description && (
                <p className="text-sm text-muted mt-1 line-clamp-2">{cat.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="text-center text-muted py-16">No categories found.</p>
      )}
    </div>
  );
}
