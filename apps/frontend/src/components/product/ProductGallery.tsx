"use client";

import Image from "next/image";
import { useState } from "react";
import { getStrapiImageUrl } from "@/lib/strapi";
import type { StrapiImage } from "@/types";

interface ProductGalleryProps {
  images: StrapiImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-muted">No image available</p>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
        <Image
          src={getStrapiImageUrl(selectedImage.url)}
          alt={selectedImage.alternativeText || `${productName} - Image ${selectedIndex + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2" role="tablist" aria-label="Product images">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setSelectedIndex(index)}
              role="tab"
              aria-selected={index === selectedIndex}
              aria-label={`View image ${index + 1} of ${images.length}`}
              className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                index === selectedIndex
                  ? "border-primary"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <Image
                src={getStrapiImageUrl(image.url)}
                alt={image.alternativeText || `${productName} thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
