"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth";
import { formatPrice } from "@/lib/utils";
import { Package, ChevronRight } from "lucide-react";

interface Order {
  documentId: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items?: { id: number }[];
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function OrdersPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
      return;
    }

    async function fetchOrders() {
      try {
        const res = await fetch(
          `${STRAPI_URL}/api/orders?sort=createdAt:desc&populate=items`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setOrders(data.data || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [token, isAuthenticated, router]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 text-sm text-muted mb-4">
        <Link href="/account" className="hover:text-primary">Account</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span>Orders</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {loading ? (
        <div className="text-center py-16 text-muted">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-muted mb-4" aria-hidden="true" />
          <p className="text-lg font-medium mb-2">No orders yet</p>
          <p className="text-muted mb-4">When you place an order, it will appear here.</p>
          <Link href="/categories" className="text-primary hover:underline font-medium">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.documentId}
              href={`/account/orders/${order.documentId}`}
              className="block p-5 rounded-xl border border-border bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Order #{order.orderNumber}</p>
                  <p className="text-sm text-muted mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                    {order.items && ` · ${order.items.length} item${order.items.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                    {order.status}
                  </span>
                  <p className="font-semibold mt-1">{formatPrice(order.total)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
