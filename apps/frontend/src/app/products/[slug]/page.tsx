import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductSlugs, getProductReviews, getStrapiImageUrl } from "@/lib/strapi";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ProductCard } from "@/components/product/ProductCard";
import { formatPrice } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getProductSlugs().catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const title = product.seo?.metaTitle || product.name;
  const description = product.seo?.metaDescription || product.shortDescription || `Buy ${product.name} at Chic Clique`;
  const imageUrl = product.seo?.ogImage?.url || product.images?.[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [getStrapiImageUrl(imageUrl)] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const reviewsRes = await getProductReviews(slug).catch(() => ({ data: [], meta: {} }));
  const reviews = reviewsRes.data || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description,
    image: product.images?.map((img) => getStrapiImageUrl(img.url)),
    sku: product.sku,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`,
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.averageRating,
        reviewCount: product.reviewCount,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs
          items={[
            ...(product.category
              ? [{ label: product.category.name, href: `/categories/${product.category.slug}` }]
              : []),
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6">
          <ProductGallery
            images={product.images || []}
            productName={product.name}
          />
          <ProductInfo product={product} />
        </div>

        <div className="mt-12">
          <ProductTabs product={product} reviews={reviews} />
        </div>
      </div>
    </>
  );
}
