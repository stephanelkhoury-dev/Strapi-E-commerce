"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth";
import { MapPin, Plus, Trash2, ChevronRight, Loader2 } from "lucide-react";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

interface Address {
  documentId: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    phone: "",
    isDefault: false,
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
      return;
    }
    fetchAddresses();
  }, [token, isAuthenticated, router]);

  async function fetchAddresses() {
    try {
      const res = await fetch(
        `${STRAPI_URL}/api/addresses?filters[user][id][$eq]=${user?.id}&sort=isDefault:desc,createdAt:desc`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setAddresses(data.data || []);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`${STRAPI_URL}/api/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: { ...form, user: user?.id } }),
      });
      setShowForm(false);
      setForm({ firstName: "", lastName: "", street: "", city: "", state: "", zip: "", country: "US", phone: "", isDefault: false });
      await fetchAddresses();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`${STRAPI_URL}/api/addresses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setAddresses((prev) => prev.filter((a) => a.documentId !== id));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 text-sm text-muted mb-4">
        <Link href="/account" className="hover:text-primary">Account</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span>Addresses</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Addresses</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
        >
          <Plus size={16} aria-hidden="true" />
          Add Address
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-8 p-6 rounded-xl border border-border bg-white dark:bg-gray-900 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="addr-fn" className="block text-sm font-medium mb-1">First name</label>
              <input id="addr-fn" type="text" required value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} className="w-full rounded-lg border border-border px-4 py-2.5" />
            </div>
            <div>
              <label htmlFor="addr-ln" className="block text-sm font-medium mb-1">Last name</label>
              <input id="addr-ln" type="text" required value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} className="w-full rounded-lg border border-border px-4 py-2.5" />
            </div>
          </div>
          <div>
            <label htmlFor="addr-street" className="block text-sm font-medium mb-1">Street</label>
            <input id="addr-street" type="text" required value={form.street} onChange={(e) => setForm({...form, street: e.target.value})} className="w-full rounded-lg border border-border px-4 py-2.5" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="addr-city" className="block text-sm font-medium mb-1">City</label>
              <input id="addr-city" type="text" required value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="w-full rounded-lg border border-border px-4 py-2.5" />
            </div>
            <div>
              <label htmlFor="addr-state" className="block text-sm font-medium mb-1">State</label>
              <input id="addr-state" type="text" required value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} className="w-full rounded-lg border border-border px-4 py-2.5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="addr-zip" className="block text-sm font-medium mb-1">ZIP</label>
              <input id="addr-zip" type="text" required value={form.zip} onChange={(e) => setForm({...form, zip: e.target.value})} className="w-full rounded-lg border border-border px-4 py-2.5" />
            </div>
            <div>
              <label htmlFor="addr-country" className="block text-sm font-medium mb-1">Country</label>
              <select id="addr-country" value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} className="w-full rounded-lg border border-border px-4 py-2.5">
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="AU">Australia</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({...form, isDefault: e.target.checked})} className="accent-primary" />
            Set as default address
          </label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-border py-2.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-primary text-white py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
              Save
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-16 text-muted">Loading addresses...</div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <MapPin size={48} className="mx-auto text-muted mb-4" aria-hidden="true" />
          <p className="text-lg font-medium mb-2">No saved addresses</p>
          <p className="text-muted">Add an address for faster checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.documentId} className="p-5 rounded-xl border border-border bg-white dark:bg-gray-900 relative">
              {addr.isDefault && (
                <span className="absolute top-3 right-3 bg-primary text-white text-xs px-2 py-0.5 rounded-full">Default</span>
              )}
              <p className="font-semibold">{addr.firstName} {addr.lastName}</p>
              <p className="text-sm text-muted mt-1">{addr.street}</p>
              <p className="text-sm text-muted">{addr.city}, {addr.state} {addr.zip}</p>
              <p className="text-sm text-muted">{addr.country}</p>
              {addr.phone && <p className="text-sm text-muted">{addr.phone}</p>}
              <button
                type="button"
                onClick={() => handleDelete(addr.documentId)}
                className="mt-3 text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                aria-label={`Delete address for ${addr.firstName} ${addr.lastName}`}
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
