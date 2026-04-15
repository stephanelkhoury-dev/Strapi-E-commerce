import { Metadata } from "next";
import Link from "next/link";
import { getOrderByNumber } from "@/lib/strapi";
import { formatPrice } from "@/lib/utils";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

interface Props {
  params: Promise<{ orderNumber: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Order #${orderNumber} Confirmed`,
    robots: { index: false },
  };
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber).catch(() => null);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
        <p className="text-muted mb-6">We couldn&apos;t find an order with that number.</p>
        <Link href="/" className="text-primary hover:underline font-medium">Go to Homepage</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <CheckCircle size={64} className="mx-auto text-green-500 mb-6" aria-hidden="true" />
      <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
      <p className="text-lg text-muted mb-1">Your order has been placed successfully.</p>
      <p className="text-muted mb-8">
        Order <span className="font-mono font-semibold">#{order.orderNumber}</span>
      </p>

      {/* Order summary */}
      <div className="text-left border border-border rounded-xl p-6 mb-8 bg-white dark:bg-gray-900">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <Package size={18} aria-hidden="true" />
          Order Details
        </h2>

        {order.items && order.items.length > 0 && (
          <div className="space-y-2 mb-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.productName}
                  {item.variantName ? ` – ${item.variantName}` : ""}
                  {" "}
                  <span className="text-muted">×{item.quantity}</span>
                </span>
                <span className="font-medium">{formatPrice(item.total)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-border pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted">Shipping</span>
            <span>{formatPrice(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Tax</span>
            <span>{formatPrice(order.tax)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t border-border pt-2 mt-2">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/account/orders"
          className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90"
        >
          View My Orders
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 border border-border px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
