// ===== Product Types =====
export interface StrapiImage {
  id: number;
  url: string;
  alternativeText: string | null;
  width: number;
  height: number;
  formats?: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
}

export interface StrapiImageFormat {
  url: string;
  width: number;
  height: number;
}

export interface SEO {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: StrapiImage;
  canonicalURL?: string;
  noIndex?: boolean;
}

export interface Product {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  barcode?: string;
  stock: number;
  isDigital: boolean;
  digitalFileURL?: string;
  weight?: number;
  dimensions?: { length?: number; width?: number; height?: number };
  featured: boolean;
  images?: StrapiImage[];
  category?: Category;
  brand?: Brand;
  variants?: ProductVariant[];
  reviews?: Review[];
  specifications?: Specification[];
  seo?: SEO;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ProductVariant {
  id: number;
  documentId: string;
  name: string;
  sku?: string;
  price: number;
  stock: number;
  attributes?: Record<string, string>;
  image?: StrapiImage;
}

export interface Specification {
  key: string;
  value: string;
}

// ===== Category Types =====
export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  image?: StrapiImage;
  parent?: Category;
  children?: Category[];
  products?: Product[];
  position: number;
  seo?: SEO;
}

// ===== Brand Types =====
export interface Brand {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  logo?: StrapiImage;
  description?: string;
}

// ===== Review Types =====
export interface Review {
  id: number;
  documentId: string;
  rating: number;
  title?: string;
  body: string;
  approved: boolean;
  author?: { id: number; username: string };
  createdAt: string;
}

// ===== Order Types =====
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface Order {
  id: number;
  documentId: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: 'stripe' | 'paypal';
  paymentIntentId?: string;
  customerEmail: string;
  customerName?: string;
  items?: OrderItem[];
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  documentId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productName: string;
  productSlug?: string;
  variantName?: string;
  sku?: string;
}

// ===== Cart Types =====
export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image?: string;
  variantName?: string;
  sku?: string;
  stock: number;
}

// ===== Address Types =====
export interface Address {
  id?: number;
  documentId?: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

// ===== Coupon Types =====
export interface Coupon {
  id: number;
  documentId: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  active: boolean;
}

// ===== Shipping Types =====
export interface ShippingRate {
  name: string;
  minWeight?: number;
  maxWeight?: number;
  price: number;
  estimatedDays?: string;
}

export interface ShippingZone {
  id: number;
  documentId: string;
  name: string;
  countries: string[];
  rates: ShippingRate[];
}

// ===== Page Types =====
export interface HeroSection {
  title: string;
  subtitle?: string;
  image: StrapiImage;
  ctaText?: string;
  ctaLink?: string;
}

export interface BannerSection {
  title: string;
  description?: string;
  image?: StrapiImage;
  link?: string;
  position: number;
}

export interface TestimonialSection {
  name: string;
  quote: string;
  avatar?: StrapiImage;
  role?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Homepage {
  hero?: HeroSection;
  featuredProducts?: { title: string; products: Product[] };
  banners?: BannerSection[];
  testimonials?: TestimonialSection[];
  newArrivalsTitle?: string;
  newsletterTitle?: string;
  newsletterDescription?: string;
  seo?: SEO;
}

export interface GlobalSettings {
  siteName: string;
  siteDescription?: string;
  logo?: StrapiImage;
  favicon?: StrapiImage;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  socialLinks?: { facebook?: string; instagram?: string; twitter?: string; youtube?: string };
  footerText?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  defaultSeo?: SEO;
}

// ===== API Response Types =====
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: {};
}
