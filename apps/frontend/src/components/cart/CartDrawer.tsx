"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and Escape key
  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const cartSubtotal = subtotal();

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 z-70 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold">
            Shopping Cart ({items.length})
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <ShoppingBag size={48} className="text-muted mb-4" />
            <p className="text-lg font-medium mb-2">Your cart is empty</p>
            <p className="text-muted text-sm mb-6">
              Looks like you haven&apos;t added anything yet.
            </p>
            <Link
              href="/categories"
              onClick={onClose}
              className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.variantId || ""}`}
                  className="flex gap-4 py-3 border-b border-border last:border-0"
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={onClose}
                      className="text-sm font-medium hover:text-primary line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    {item.variantName && (
                      <p className="text-xs text-muted mt-0.5">
                        {item.variantName}
                      </p>
                    )}
                    <p className="text-sm font-bold mt-1">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1,
                              item.variantId
                            )
                          }
                          disabled={item.quantity <= 1}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus size={14} />
                        </button>
                        <span
                          className="px-3 text-sm font-medium min-w-8 text-center"
                          aria-label={`Quantity: ${item.quantity}`}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1,
                              item.variantId
                            )
                          }
                          disabled={item.quantity >= item.stock}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          removeItem(item.productId, item.variantId)
                        }
                        className="text-xs text-error hover:underline ml-auto"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="border-t border-border px-6 py-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-bold">{formatPrice(cartSubtotal)}</span>
              </div>
              <p className="text-xs text-muted">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-center border border-border rounded-lg font-medium text-sm hover:bg-card-hover transition-colors"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-center bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
