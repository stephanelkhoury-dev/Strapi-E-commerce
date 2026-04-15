"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth";
import { formatPrice } from "@/lib/utils";
import { ChevronRight, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { use } from "react";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

interface OrderItem {
  id: number;
  productName: string;
  productSlug: string;
  variantName?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface OrderDetail {
  documentId: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod: string;
  trackingNumber?: string;
  addresses?: { shipping?: any; billing?: any };
  items?: OrderItem[];
  createdAt: string;
}

const statusSteps = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
      return;
    }

    async function fetchOrder() {
      try {
        const res = await fetch(
          `${STRAPI_URL}/api/orders/${id}?populate=items`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setOrder(data.data || null);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id, token, isAuthenticated, router]);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-center text-muted">Loading order...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-lg font-medium">Order not found</p>
        <Link href="/account/orders" className="text-primary hover:underline mt-2 inline-block">Back to orders</Link>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled" || order.status === "refunded";
  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 text-sm text-muted mb-4">
        <Link href="/account" className="hover:text-primary">Account</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <Link href="/account/orders" className="hover:text-primary">Orders</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span>#{order.orderNumber}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-sm text-muted mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
        {order.trackingNumber && (
          <p className="text-sm">
            Tracking: <span className="font-mono font-medium">{order.trackingNumber}</span>
          </p>
        )}
      </div>

      {/* Status timeline */}
      {!isCancelled ? (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {statusSteps.map((s, i) => {
              const Icon = s.icon;
              const isActive = i <= currentStepIndex;
              return (
                <div key={s.key} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700 text-muted"
                  }`}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-xs mt-1 ${isActive ? "font-semibold" : "text-muted"}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
          <div className="relative h-1 bg-gray-200 dark:bg-gray-700 rounded mt-2 mx-5">
            <div
              className="absolute top-0 left-0 h-full bg-primary rounded transition-all"
              style={{ width: `${Math.max(0, currentStepIndex) / (statusSteps.length - 1) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center gap-3 text-red-600">
          <XCircle size={20} />
          <span className="font-medium capitalize">This order has been {order.status}.</span>
        </div>
      )}

      {/* Order items */}
      <div className="rounded-xl border border-border overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="text-left px-4 py-3 font-medium">Product</th>
              <th className="text-center px-4 py-3 font-medium">Qty</th>
              <th className="text-right px-4 py-3 font-medium">Price</th>
              <th className="text-right px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link href={`/products/${item.productSlug}`} className="hover:text-primary font-medium">
                    {item.productName}
                  </Link>
                  {item.variantName && <p className="text-xs text-muted">{item.variantName}</p>}
                  <p className="text-xs text-muted">SKU: {item.sku}</p>
                </td>
                <td className="px-4 py-3 text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-right">{formatPrice(item.unitPrice)}</td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1" />
        <div className="lg:w-80">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{formatPrice(order.shippingCost)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Tax</span><span>{formatPrice(order.tax)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t border-border pt-2 mt-2">
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
