"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth";
import { ProductCard } from "@/components/product/ProductCard";
import { Heart, ChevronRight } from "lucide-react";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export default function WishlistPage() {
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
      return;
    }

    async function fetchWishlist() {
      try {
        const res = await fetch(
          `${STRAPI_URL}/api/wishlists?filters[user][id][$eq]=${user?.id}&populate[products][populate][0]=images&populate[products][populate][1]=category&populate[products][populate][2]=brand`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        const wishlist = data.data?.[0];
        setProducts(wishlist?.products || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, [token, user, isAuthenticated, router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 text-sm text-muted mb-4">
        <Link href="/account" className="hover:text-primary">Account</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span>Wishlist</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>

      {loading ? (
        <div className="text-center py-16 text-muted">Loading wishlist...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={48} className="mx-auto text-muted mb-4" aria-hidden="true" />
          <p className="text-lg font-medium mb-2">Your wishlist is empty</p>
          <p className="text-muted mb-4">Save products you love for later.</p>
          <Link href="/categories" className="text-primary hover:underline font-medium">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.documentId} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
