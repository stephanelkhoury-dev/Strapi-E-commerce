import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { getProducts, getCategories, getStrapiImageUrl } from "@/lib/strapi";
import { ProductCard } from "@/components/product/ProductCard";

export default async function HomePage() {
  const [productsRes, categoriesRes] = await Promise.all([
    getProducts({ pageSize: 8, sort: "createdAt:desc" }).catch(() => ({ data: [], meta: {} })),
    getCategories().catch(() => ({ data: [], meta: {} })),
  ]);

  const products = productsRes.data || [];
  const categories = categoriesRes.data || [];
  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);
  const newArrivals = products.slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ShopNow",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    potentialAction: {
      "@type": "SearchAction",
      target: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Discover Premium Products for Every Lifestyle
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8">
              Shop our curated collection of high-quality products. Free shipping on orders over $50.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Shop Now
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
              { icon: Shield, title: "Secure Payment", desc: "Stripe & PayPal" },
              { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
              { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
            ].map((feature) => (
              <div key={feature.title} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                  <feature.icon size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-muted mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16" aria-labelledby="categories-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 id="categories-heading" className="text-2xl sm:text-3xl font-bold">
                Shop by Category
              </h2>
              <Link href="/categories" className="text-primary font-medium hover:underline flex items-center gap-1">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.documentId}
                  href={`/categories/${category.slug}`}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100"
                >
                  {category.image ? (
                    <Image
                      src={getStrapiImageUrl(category.image.url)}
                      alt={category.image.alternativeText || category.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900/50" aria-labelledby="featured-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="featured-heading" className="text-2xl sm:text-3xl font-bold mb-8">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.documentId} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-16" aria-labelledby="arrivals-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 id="arrivals-heading" className="text-2xl sm:text-3xl font-bold">
                New Arrivals
              </h2>
              <Link href="/categories?sort=createdAt:desc" className="text-primary font-medium hover:underline flex items-center gap-1">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.documentId} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-lg text-indigo-100 max-w-2xl mx-auto mb-8">
            Join thousands of satisfied customers. Find everything you need at prices you&apos;ll love.
          </p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            Browse All Products
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
