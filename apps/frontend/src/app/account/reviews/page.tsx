"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth";
import { Star, ChevronRight } from "lucide-react";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

interface Review {
  documentId: string;
  rating: number;
  title: string;
  body: string;
  approved: boolean;
  createdAt: string;
  product?: { name: string; slug: string };
}

export default function ReviewsPage() {
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
      return;
    }

    async function fetchReviews() {
      try {
        const res = await fetch(
          `${STRAPI_URL}/api/reviews?filters[author][id][$eq]=${user?.id}&populate=product&sort=createdAt:desc`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setReviews(data.data || []);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [token, user, isAuthenticated, router]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 text-sm text-muted mb-4">
        <Link href="/account" className="hover:text-primary">Account</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span>Reviews</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">My Reviews</h1>

      {loading ? (
        <div className="text-center py-16 text-muted">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16">
          <Star size={48} className="mx-auto text-muted mb-4" aria-hidden="true" />
          <p className="text-lg font-medium mb-2">No reviews yet</p>
          <p className="text-muted">Share your thoughts on products you&apos;ve purchased!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.documentId} className="p-5 rounded-xl border border-border bg-white dark:bg-gray-900">
              <div className="flex items-start justify-between">
                <div>
                  {review.product && (
                    <Link href={`/products/${review.product.slug}`} className="text-sm text-primary hover:underline font-medium">
                      {review.product.name}
                    </Link>
                  )}
                  <div className="flex items-center gap-1 mt-1" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    review.approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {review.approved ? "Published" : "Pending"}
                  </span>
                  <p className="text-xs text-muted mt-1">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {review.title && <p className="font-semibold mt-2">{review.title}</p>}
              {review.body && <p className="text-sm text-muted mt-1">{review.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
