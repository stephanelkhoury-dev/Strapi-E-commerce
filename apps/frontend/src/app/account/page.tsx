"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth";
import { Package, Heart, MapPin, User, Star, LogOut } from "lucide-react";

const links = [
  { href: "/account/orders", label: "My Orders", icon: Package, desc: "View your order history and track shipments" },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart, desc: "Products you've saved for later" },
  { href: "/account/addresses", label: "Addresses", icon: MapPin, desc: "Manage your shipping addresses" },
  { href: "/account/profile", label: "Profile", icon: User, desc: "Update your personal information" },
  { href: "/account/reviews", label: "My Reviews", icon: Star, desc: "Reviews you've written" },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Account</h1>
          <p className="text-muted mt-1">Welcome back, {user.username || user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => { logout(); router.push("/"); }}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium"
        >
          <LogOut size={16} aria-hidden="true" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex gap-4 p-5 rounded-xl border border-border bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
          >
            <Icon size={24} className="text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">{label}</p>
              <p className="text-sm text-muted mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
