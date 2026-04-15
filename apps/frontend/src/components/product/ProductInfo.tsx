"use client";

import { useState } from "react";
import { ShoppingCart, Heart, Minus, Plus, Star, Check, Truck } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { getStrapiImageUrl } from "@/lib/strapi";
import { toast } from "@/components/ui/Toaster";
import { formatPrice } from "@/lib/utils";
import type { Product, ProductVariant } from "shared/src/types";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  const currentPrice = selectedVariant?.price ?? product.price;
  const currentStock = selectedVariant?.stock ?? product.stock;
  const inStock = currentStock > 0;

  const handleAddToCart = () => {
    addItem({
      productId: product.documentId,
      variantId: selectedVariant?.documentId,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      quantity,
      image: product.images?.[0] ? getStrapiImageUrl(product.images[0].url) : undefined,
      variantName: selectedVariant?.name,
      sku: selectedVariant?.sku || product.sku,
      stock: currentStock,
    });
    toast(`${product.name} added to cart!`, "success");
  };

  return (
    <div className="space-y-6">
      {/* Brand */}
      {product.brand && (
        <p className="text-sm text-primary font-medium uppercase tracking-wide">
          {product.brand.name}
        </p>
      )}

      {/* Name */}
      <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>

      {/* Rating */}
      {product.reviewCount > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex" aria-label={`${product.averageRating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={18}
                className={
                  star <= Math.round(product.averageRating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="text-sm text-muted">
            {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
          </span>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold">{formatPrice(currentPrice)}</span>
        {product.compareAtPrice && product.compareAtPrice > currentPrice && (
          <>
            <span className="text-xl text-muted line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-sm font-medium rounded">
              Save {Math.round((1 - currentPrice / product.compareAtPrice) * 100)}%
            </span>
          </>
        )}
      </div>

      {/* Short Description */}
      {product.shortDescription && (
        <p className="text-muted leading-relaxed">{product.shortDescription}</p>
      )}

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Select Option</h3>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.documentId}
                onClick={() => setSelectedVariant(variant)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  selectedVariant?.documentId === variant.documentId
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-gray-400"
                } ${variant.stock === 0 ? "opacity-50 line-through" : ""}`}
                disabled={variant.stock === 0}
                aria-label={`${variant.name}${variant.stock === 0 ? " - Out of stock" : ""}`}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Quantity</h3>
        <div className="flex items-center border border-border rounded-lg w-fit">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val >= 1 && val <= currentStock) setQuantity(val);
            }}
            min={1}
            max={currentStock}
            className="w-16 text-center bg-transparent font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Quantity"
          />
          <button
            onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
            disabled={quantity >= currentStock}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>
        <p className="text-xs text-muted mt-2">
          {inStock ? `${currentStock} available` : "Out of stock"}
        </p>
      </div>

      {/* Add to Cart */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={20} />
          {inStock ? "Add to Cart" : "Out of Stock"}
        </button>
        <button
          className="p-3.5 border border-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart size={20} />
        </button>
      </div>

      {/* Features */}
      <div className="border-t border-border pt-6 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Truck size={18} className="text-primary" />
          <span>Free shipping on orders over $50</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Check size={18} className="text-success" />
          <span>30-day easy returns</span>
        </div>
        {product.sku && (
          <p className="text-xs text-muted">SKU: {selectedVariant?.sku || product.sku}</p>
        )}
      </div>
    </div>
  );
}
