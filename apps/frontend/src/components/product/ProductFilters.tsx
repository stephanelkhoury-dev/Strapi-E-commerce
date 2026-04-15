"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Brand } from "@/types";
import { SORT_OPTIONS } from "@/constants";
import { useState, useCallback } from "react";

interface Props {
  brands: Brand[];
  currentBrand?: string;
  currentSort: string;
  currentMinPrice?: number;
  currentMaxPrice?: number;
  basePath: string;
}

export function ProductFilters({
  brands,
  currentBrand,
  currentSort,
  currentMinPrice,
  currentMaxPrice,
  basePath,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minPrice, setMinPrice] = useState(currentMinPrice?.toString() || "");
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice?.toString() || "");

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page"); // Reset page on filter change
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.push(`${basePath}?${params.toString()}`);
    },
    [router, searchParams, basePath]
  );

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <label htmlFor="sort" className="block text-sm font-semibold mb-2">
          Sort by
        </label>
        <select
          id="sort"
          value={currentSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-white dark:bg-gray-900"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <fieldset>
        <legend className="text-sm font-semibold mb-2">Price range</legend>
        <div className="flex gap-2">
          <div>
            <label htmlFor="minPrice" className="sr-only">
              Minimum price
            </label>
            <input
              id="minPrice"
              type="number"
              placeholder="Min"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="maxPrice" className="sr-only">
              Maximum price
            </label>
            <input
              id="maxPrice"
              type="number"
              placeholder="Max"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => updateParams({ minPrice: minPrice || undefined, maxPrice: maxPrice || undefined })}
          className="mt-2 w-full rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Apply
        </button>
      </fieldset>

      {/* Brands */}
      {brands.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold mb-2">Brand</legend>
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() => updateParams({ brand: undefined })}
                className={`w-full text-left px-3 py-1.5 rounded text-sm ${
                  !currentBrand ? "font-bold text-primary" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                All brands
              </button>
            </li>
            {brands.map((b) => (
              <li key={b.documentId}>
                <button
                  type="button"
                  onClick={() => updateParams({ brand: b.slug })}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm ${
                    currentBrand === b.slug
                      ? "font-bold text-primary"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {b.name}
                </button>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      {/* Clear filters */}
      <button
        type="button"
        onClick={() => {
          setMinPrice("");
          setMaxPrice("");
          router.push(basePath);
        }}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        Clear all filters
      </button>
    </div>
  );
}
