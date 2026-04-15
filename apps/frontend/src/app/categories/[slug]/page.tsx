import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getCategorySlugs, getProducts, getBrands, getStrapiImageUrl } from "@/lib/strapi";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ITEMS_PER_PAGE } from "shared/src/constants";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function generateStaticParams() {
  const slugs = await getCategorySlugs().catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.seo?.metaTitle || category.name,
    description: category.seo?.metaDescription || category.description || `Browse ${category.name} products`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = parseInt(sp.page || "1");
  const sort = sp.sort || "createdAt:desc";
  const minPrice = sp.minPrice ? parseFloat(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? parseFloat(sp.maxPrice) : undefined;
  const brand = sp.brand;

  const productsRes = await getProducts({
    category: slug,
    page,
    pageSize: ITEMS_PER_PAGE,
    sort,
    minPrice,
    maxPrice,
    brand,
  });

  const brandsRes = await getBrands().catch(() => ({ data: [], meta: {} }));
  const products = productsRes.data || [];
  const pagination = productsRes.meta?.pagination;
  const brands = brandsRes.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumbs items={[{ label: "Categories", href: "/categories" }, { label: category.name }]} />

      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        {/* Sidebar filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <ProductFilters
            brands={brands}
            currentBrand={brand}
            currentSort={sort}
            currentMinPrice={minPrice}
            currentMaxPrice={maxPrice}
            basePath={`/categories/${slug}`}
          />
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">{category.name}</h1>
            {pagination && (
              <p className="text-sm text-muted">
                {pagination.total} product{pagination.total !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.documentId} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pageCount > 1 && (
                <nav aria-label="Pagination" className="mt-10 flex justify-center gap-2">
                  {Array.from({ length: pagination.pageCount }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={`/categories/${slug}?page=${p}&sort=${sort}${brand ? `&brand=${brand}` : ""}${minPrice ? `&minPrice=${minPrice}` : ""}${maxPrice ? `&maxPrice=${maxPrice}` : ""}`}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        p === page
                          ? "bg-primary text-white"
                          : "border border-border hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                      aria-current={p === page ? "page" : undefined}
                    >
                      {p}
                    </a>
                  ))}
                </nav>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted">No products found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
