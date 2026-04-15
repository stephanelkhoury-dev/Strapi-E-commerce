import { Metadata } from "next";
import { getProducts, getBrands } from "@/lib/strapi";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ITEMS_PER_PAGE } from "@/constants";
import { Search as SearchIcon } from "lucide-react";

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const q = sp.q || "";
  return {
    title: q ? `Search results for "${q}"` : "Search Products",
    description: q ? `Find products matching "${q}"` : "Search our product catalog.",
    robots: { index: false },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q || "";
  const page = parseInt(sp.page || "1");
  const sort = sp.sort || "createdAt:desc";
  const brand = sp.brand;
  const minPrice = sp.minPrice ? parseFloat(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? parseFloat(sp.maxPrice) : undefined;

  const productsRes = q
    ? await getProducts({ search: q, page, pageSize: ITEMS_PER_PAGE, sort, brand, minPrice, maxPrice })
    : null;

  const brandsRes = await getBrands().catch(() => ({ data: [], meta: {} }));
  const products = productsRes?.data || [];
  const pagination = productsRes?.meta?.pagination;
  const brands = brandsRes.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumbs items={[{ label: "Search" }]} />

      {/* Search form */}
      <form action="/search" method="GET" className="mt-4 mb-8">
        <label htmlFor="search-input" className="sr-only">
          Search products
        </label>
        <div className="relative max-w-xl">
          <input
            id="search-input"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search products..."
            autoFocus
            className="w-full rounded-xl border border-border px-4 py-3 pl-12 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <SearchIcon
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            size={20}
            aria-hidden="true"
          />
        </div>
      </form>

      {q ? (
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <ProductFilters
              brands={brands}
              currentBrand={brand}
              currentSort={sort}
              currentMinPrice={minPrice}
              currentMaxPrice={maxPrice}
              basePath="/search"
            />
          </aside>

          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-6">
              {pagination ? `${pagination.total} result${pagination.total !== 1 ? "s" : ""} for` : "Results for"}{" "}
              &ldquo;{q}&rdquo;
            </h1>

            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.documentId} product={product} />
                  ))}
                </div>

                {pagination && pagination.pageCount > 1 && (
                  <nav aria-label="Search results pagination" className="mt-10 flex justify-center gap-2">
                    {Array.from({ length: pagination.pageCount }, (_, i) => i + 1).map((p) => (
                      <a
                        key={p}
                        href={`/search?q=${encodeURIComponent(q)}&page=${p}&sort=${sort}${brand ? `&brand=${brand}` : ""}${minPrice ? `&minPrice=${minPrice}` : ""}${maxPrice ? `&maxPrice=${maxPrice}` : ""}`}
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
                <p className="text-lg text-muted">No products found matching your search.</p>
                <p className="text-sm text-muted mt-2">Try a different search term or adjust your filters.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <SearchIcon size={48} className="mx-auto text-muted mb-4" aria-hidden="true" />
          <p className="text-lg text-muted">Enter a search term to find products.</p>
        </div>
      )}
    </div>
  );
}
