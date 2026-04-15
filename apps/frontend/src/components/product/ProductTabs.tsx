"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { Product, Review } from "shared/src/types";

interface ProductTabsProps {
  product: Product;
  reviews: Review[];
}

export function ProductTabs({ product, reviews }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "reviews">("description");

  const tabs = [
    { id: "description" as const, label: "Description" },
    { id: "specifications" as const, label: "Specifications", count: product.specifications?.length },
    { id: "reviews" as const, label: "Reviews", count: reviews.length },
  ];

  return (
    <div>
      {/* Tab buttons */}
      <div role="tablist" aria-label="Product information" className="border-b border-border">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1.5 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab panels */}
      <div className="py-8">
        {/* Description */}
        <div
          role="tabpanel"
          id="panel-description"
          hidden={activeTab !== "description"}
          className="prose dark:prose-invert max-w-none"
        >
          {product.description ? (
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          ) : (
            <p className="text-muted">No description available.</p>
          )}
        </div>

        {/* Specifications */}
        <div
          role="tabpanel"
          id="panel-specifications"
          hidden={activeTab !== "specifications"}
        >
          {product.specifications && product.specifications.length > 0 ? (
            <table className="w-full max-w-2xl">
              <tbody>
                {product.specifications.map((spec, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/50" : ""}>
                    <td className="px-4 py-3 font-medium text-sm w-1/3">{spec.key}</td>
                    <td className="px-4 py-3 text-sm text-muted">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted">No specifications available.</p>
          )}
        </div>

        {/* Reviews */}
        <div
          role="tabpanel"
          id="panel-reviews"
          hidden={activeTab !== "reviews"}
        >
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.documentId} className="border-b border-border pb-6 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex" aria-label={`${review.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    {review.author && (
                      <span className="text-sm font-medium">{review.author.username}</span>
                    )}
                    <span className="text-xs text-muted">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.title && <h4 className="font-medium mb-1">{review.title}</h4>}
                  <p className="text-sm text-muted leading-relaxed">{review.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No reviews yet. Be the first to review this product!</p>
          )}
        </div>
      </div>
    </div>
  );
}
