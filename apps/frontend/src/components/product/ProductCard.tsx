"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getStrapiImageUrl } from "@/lib/strapi";
import { useCartStore } from "@/lib/store/cart";
import { toast } from "@/components/ui/Toaster";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const imageUrl = product.images?.[0]
    ? getStrapiImageUrl(product.images[0].url)
    : "/images/placeholder.jpg";

  const imageAlt =
    product.images?.[0]?.alternativeText || product.name;

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.documentId,
      name: product.name,
      slug: product.slug,
      price: product.price,
      quantity: 1,
      image: imageUrl,
      stock: product.stock,
    });

    toast(`${product.name} added to cart`, "success");
  };

  return (
    <article className="group relative bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-error text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercent}%
            </span>
          )}
          {product.featured && (
            <span className="bg-secondary text-white text-xs font-bold px-2 py-1 rounded">
              Featured
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            aria-label={`Add ${product.name} to wishlist`}
          >
            <Heart size={18} className="text-gray-600" />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <p className="text-xs text-muted uppercase tracking-wide mb-1">
            {product.category.name}
          </p>
        )}

        {/* Name */}
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
          <Link href={`/products/${product.slug}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </h3>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex" aria-label={`Rating: ${product.averageRating} out of 5`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={
                    star <= Math.round(product.averageRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-xs text-muted">({product.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingCart size={16} aria-hidden="true" />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
