"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import { useAuthStore } from "@/lib/store/auth";
import { formatPrice } from "@/lib/utils";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CreditCard, Truck, User, CheckCircle, Loader2 } from "lucide-react";

type Step = "contact" | "shipping" | "payment" | "review";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const { user, token } = useAuthStore();

  const [step, setStep] = useState<Step>("contact");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [contact, setContact] = useState({
    email: user?.email || "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [shipping, setShipping] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);

  const sub = subtotal();
  const shippingCost = 0; // Calculated server-side
  const total = sub - couponDiscount + shippingCost;

  const steps: { key: Step; label: string; icon: typeof User }[] = [
    { key: "contact", label: "Contact", icon: User },
    { key: "shipping", label: "Shipping", icon: Truck },
    { key: "payment", label: "Payment", icon: CreditCard },
    { key: "review", label: "Review", icon: CheckCircle },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

  function handleContactSubmit(e: FormEvent) {
    e.preventDefault();
    setStep("shipping");
  }

  function handleShippingSubmit(e: FormEvent) {
    e.preventDefault();
    setStep("payment");
  }

  function handlePaymentSubmit(e: FormEvent) {
    e.preventDefault();
    setStep("review");
  }

  async function handlePlaceOrder() {
    setLoading(true);
    setError("");

    const orderData = {
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        slug: item.slug,
      })),
      customerEmail: contact.email,
      customerName: `${contact.firstName} ${contact.lastName}`,
      shippingAddress: { ...shipping, firstName: contact.firstName, lastName: contact.lastName, phone: contact.phone },
      billingAddress: { ...shipping, firstName: contact.firstName, lastName: contact.lastName, phone: contact.phone },
      couponCode: couponCode || undefined,
    };

    try {
      if (paymentMethod === "stripe") {
        const res = await fetch(`${STRAPI_URL}/api/checkout/stripe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        throw new Error(data.error?.message || "Failed to create Stripe session");
      } else {
        const res = await fetch(`${STRAPI_URL}/api/checkout/paypal/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });
        const data = await res.json();
        if (data.approvalUrl) {
          window.location.href = data.approvalUrl;
          return;
        }
        throw new Error(data.error?.message || "Failed to create PayPal order");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <a href="/categories" className="text-primary hover:underline">Continue shopping</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />

      {/* Step indicator */}
      <nav aria-label="Checkout steps" className="mt-6 mb-8">
        <ol className="flex items-center justify-center gap-2 sm:gap-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === stepIndex;
            const isCompleted = i < stepIndex;
            return (
              <li key={s.key} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => i < stepIndex && setStep(s.key)}
                  disabled={i > stepIndex}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : isCompleted
                      ? "text-primary hover:bg-primary/10"
                      : "text-muted"
                  }`}
                  aria-current={isActive ? "step" : undefined}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < steps.length - 1 && (
                  <span className={`w-8 h-px ${i < stepIndex ? "bg-primary" : "bg-border"}`} aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form area */}
        <div className="flex-1">
          {/* Contact step */}
          {step === "contact" && (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={contact.email}
                  onChange={(e) => setContact({...contact, email: e.target.value})}
                  className="w-full rounded-lg border border-border px-4 py-2.5"
                  autoComplete="email"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-1">First name</label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={contact.firstName}
                    onChange={(e) => setContact({...contact, firstName: e.target.value})}
                    className="w-full rounded-lg border border-border px-4 py-2.5"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last name</label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={contact.lastName}
                    onChange={(e) => setContact({...contact, lastName: e.target.value})}
                    className="w-full rounded-lg border border-border px-4 py-2.5"
                    autoComplete="family-name"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => setContact({...contact, phone: e.target.value})}
                  className="w-full rounded-lg border border-border px-4 py-2.5"
                  autoComplete="tel"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:opacity-90"
              >
                Continue to Shipping
              </button>
            </form>
          )}

          {/* Shipping step */}
          {step === "shipping" && (
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
              <div>
                <label htmlFor="street" className="block text-sm font-medium mb-1">Street address</label>
                <input
                  id="street"
                  type="text"
                  required
                  value={shipping.street}
                  onChange={(e) => setShipping({...shipping, street: e.target.value})}
                  className="w-full rounded-lg border border-border px-4 py-2.5"
                  autoComplete="street-address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
                  <input
                    id="city"
                    type="text"
                    required
                    value={shipping.city}
                    onChange={(e) => setShipping({...shipping, city: e.target.value})}
                    className="w-full rounded-lg border border-border px-4 py-2.5"
                    autoComplete="address-level2"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium mb-1">State / Province</label>
                  <input
                    id="state"
                    type="text"
                    required
                    value={shipping.state}
                    onChange={(e) => setShipping({...shipping, state: e.target.value})}
                    className="w-full rounded-lg border border-border px-4 py-2.5"
                    autoComplete="address-level1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium mb-1">ZIP / Postal code</label>
                  <input
                    id="zip"
                    type="text"
                    required
                    value={shipping.zip}
                    onChange={(e) => setShipping({...shipping, zip: e.target.value})}
                    className="w-full rounded-lg border border-border px-4 py-2.5"
                    autoComplete="postal-code"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium mb-1">Country</label>
                  <select
                    id="country"
                    value={shipping.country}
                    onChange={(e) => setShipping({...shipping, country: e.target.value})}
                    className="w-full rounded-lg border border-border px-4 py-2.5"
                    autoComplete="country"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("contact")}
                  className="flex-1 border border-border py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:opacity-90"
                >
                  Continue to Payment
                </button>
              </div>
            </form>
          )}

          {/* Payment step */}
          {step === "payment" && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <fieldset>
                <legend className="sr-only">Select payment method</legend>
                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === "stripe" ? "border-primary bg-primary/5" : "border-border hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="stripe"
                      checked={paymentMethod === "stripe"}
                      onChange={() => setPaymentMethod("stripe")}
                      className="accent-primary"
                    />
                    <CreditCard size={24} aria-hidden="true" />
                    <div>
                      <p className="font-medium">Credit / Debit Card</p>
                      <p className="text-sm text-muted">Powered by Stripe. Secure and encrypted.</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === "paypal" ? "border-primary bg-primary/5" : "border-border hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={() => setPaymentMethod("paypal")}
                      className="accent-primary"
                    />
                    <span className="text-2xl" aria-hidden="true">🅿️</span>
                    <div>
                      <p className="font-medium">PayPal</p>
                      <p className="text-sm text-muted">Pay with your PayPal account.</p>
                    </div>
                  </label>
                </div>
              </fieldset>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep("shipping")}
                  className="flex-1 border border-border py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:opacity-90"
                >
                  Review Order
                </button>
              </div>
            </form>
          )}

          {/* Review step */}
          {step === "review" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Review Your Order</h2>

              <div className="rounded-xl border border-border p-4 space-y-2">
                <h3 className="font-semibold text-sm text-muted uppercase">Contact</h3>
                <p>{contact.firstName} {contact.lastName}</p>
                <p className="text-sm text-muted">{contact.email}</p>
                {contact.phone && <p className="text-sm text-muted">{contact.phone}</p>}
                <button type="button" onClick={() => setStep("contact")} className="text-sm text-primary hover:underline">Edit</button>
              </div>

              <div className="rounded-xl border border-border p-4 space-y-2">
                <h3 className="font-semibold text-sm text-muted uppercase">Shipping</h3>
                <p>{shipping.street}</p>
                <p>{shipping.city}, {shipping.state} {shipping.zip}</p>
                <p>{shipping.country}</p>
                <button type="button" onClick={() => setStep("shipping")} className="text-sm text-primary hover:underline">Edit</button>
              </div>

              <div className="rounded-xl border border-border p-4 space-y-2">
                <h3 className="font-semibold text-sm text-muted uppercase">Payment</h3>
                <p>{paymentMethod === "stripe" ? "Credit / Debit Card (Stripe)" : "PayPal"}</p>
                <button type="button" onClick={() => setStep("payment")} className="text-sm text-primary hover:underline">Edit</button>
              </div>

              {error && (
                <div role="alert" className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("payment")}
                  className="flex-1 border border-border py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:w-96">
          <div className="border border-border rounded-xl p-6 bg-white dark:bg-gray-900 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId || ""}`} className="flex justify-between text-sm">
                  <span className="text-muted">
                    {item.name} <span className="text-xs">×{item.quantity}</span>
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(sub)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span className="text-muted">Calculated at payment</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-border pt-4 mt-4">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
