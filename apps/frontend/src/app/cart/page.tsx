"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, Tag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { getStrapiImageUrl } from "@/lib/strapi";
import { formatPrice } from "@/lib/utils";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<{
    valid: boolean;
    discount: number;
    message: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const sub = subtotal();
  const discount = couponStatus?.valid ? couponStatus.discount : 0;
  const total = sub - discount;

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/checkout/validate-coupon`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: couponCode, subtotal: sub }),
        }
      );
      const data = await res.json();
      if (data.valid) {
        setCouponStatus({ valid: true, discount: data.discount, message: `Coupon applied: -${formatPrice(data.discount)}` });
      } else {
        setCouponStatus({ valid: false, discount: 0, message: "Invalid or expired coupon code." });
      }
    } catch {
      setCouponStatus({ valid: false, discount: 0, message: "Could not validate coupon." });
    } finally {
      setCouponLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={[{ label: "Cart" }]} />
        <div className="text-center py-20">
          <ShoppingBag size={64} className="mx-auto text-muted mb-4" aria-hidden="true" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted mb-6">Looks like you haven&apos;t added anything yet.</p>
          <Link
            href="/categories"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumbs items={[{ label: "Cart" }]} />
      <h1 className="text-2xl font-bold mt-4 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items */}
        <div className="flex-1">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId || ""}`}
                className="flex gap-4 p-4 border border-border rounded-xl bg-white dark:bg-gray-900"
              >
                <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={getStrapiImageUrl(item.image)}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-medium hover:text-primary line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  {item.variantName && (
                    <p className="text-sm text-muted">{item.variantName}</p>
                  )}
                  <p className="font-semibold mt-1">{formatPrice(item.price)}</p>

                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1), item.variantId)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-lg"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm font-medium min-w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-r-lg"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-red-500 hover:text-red-700 p-1"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="font-semibold text-right">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="mt-4 text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Clear cart
          </button>
        </div>

        {/* Order summary */}
        <div className="lg:w-96">
          <div className="border border-border rounded-xl p-6 bg-white dark:bg-gray-900 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-4">
              <label htmlFor="coupon" className="text-sm font-medium mb-1 block">
                Coupon code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
                  <input
                    id="coupon"
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="w-full rounded-lg border border-border pl-9 pr-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponLoading}
                  className="rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
              {couponStatus && (
                <p className={`text-sm mt-1 ${couponStatus.valid ? "text-green-600" : "text-red-500"}`}>
                  {couponStatus.message}
                </p>
              )}
            </div>

            <div className="space-y-2 text-sm border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(sub)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span className="text-muted">Calculated at checkout</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-lg border-t border-border pt-4 mt-4">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Link
              href="/checkout"
              className="block mt-6 w-full text-center bg-primary text-white py-3 rounded-lg font-medium hover:opacity-90"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/categories"
              className="block mt-3 w-full text-center border border-border py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
