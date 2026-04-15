"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
  ChevronDown,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useAuthStore } from "@/lib/store/auth";
import { CartDrawer } from "@/components/cart/CartDrawer";

const navigation = [
  { name: "Shop", href: "/categories" },
  { name: "New Arrivals", href: "/categories?sort=createdAt:desc" },
  { name: "Featured", href: "/categories?featured=true" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const totalItems = useCartStore((s) => s.totalItems());
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-border shadow-sm">
        {/* Top bar */}
        <div className="bg-primary text-white text-center text-sm py-1.5 px-4">
          10% OFF ON YOUR FIRST ORDER — USE CODE: CC10
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="shrink-0 text-2xl font-bold text-primary"
            >
              Chic Clique
            </Link>

            {/* Desktop Navigation */}
            <nav
              className="hidden md:flex items-center space-x-8"
              aria-label="Main navigation"
            >
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-foreground/80 hover:text-primary font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Search + Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <form
                onSubmit={handleSearch}
                className="hidden sm:flex items-center"
                role="search"
              >
                <label htmlFor="search-input" className="sr-only">
                  Search products
                </label>
                <div className="relative">
                  <input
                    id="search-input"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-48 lg:w-64 pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    size={16}
                    aria-hidden="true"
                  />
                </div>
              </form>

              {/* Wishlist */}
              {isAuthenticated && (
                <Link
                  href="/account/wishlist"
                  className="p-2 text-foreground/70 hover:text-primary transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart size={22} />
                </Link>
              )}

              {/* Account */}
              <Link
                href={isAuthenticated ? "/account" : "/auth/login"}
                className="p-2 text-foreground/70 hover:text-primary transition-colors"
                aria-label={isAuthenticated ? "Account" : "Sign in"}
              >
                <User size={22} />
              </Link>

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-foreground/70 hover:text-primary transition-colors"
                aria-label={`Shopping cart, ${totalItems} items`}
              >
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-foreground/70"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-4 py-3 space-y-2">
              {/* Mobile search */}
              <form onSubmit={handleSearch} role="search" className="mb-3">
                <label htmlFor="mobile-search" className="sr-only">
                  Search products
                </label>
                <div className="relative">
                  <input
                    id="mobile-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary"
                  />
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    size={16}
                    aria-hidden="true"
                  />
                </div>
              </form>

              <nav aria-label="Mobile navigation">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-foreground/80 hover:text-primary font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
