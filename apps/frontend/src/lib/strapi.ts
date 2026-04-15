import type {
  Product,
  Category,
  Brand,
  Homepage,
  GlobalSettings,
  StrapiResponse,
  Order,
  ShippingZone,
  Review,
} from "shared/src/types";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const API_TOKEN = process.env.STRAPI_API_TOKEN;

interface FetchOptions {
  method?: string;
  body?: unknown;
  tags?: string[];
  revalidate?: number;
  cache?: RequestCache;
}

async function fetchStrapi<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = "GET", body, tags, revalidate, cache } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (API_TOKEN) {
    headers["Authorization"] = `Bearer ${API_TOKEN}`;
  }

  const fetchOptions: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {
    method,
    headers,
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  if (tags || revalidate !== undefined) {
    fetchOptions.next = {};
    if (tags) fetchOptions.next.tags = tags;
    if (revalidate !== undefined) fetchOptions.next.revalidate = revalidate;
  }

  if (cache) {
    fetchOptions.cache = cache;
  }

  const res = await fetch(`${STRAPI_URL}/api${path}`, fetchOptions);

  if (!res.ok) {
    throw new Error(`Strapi API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ===== Products =====
export async function getProducts(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  search?: string;
}) {
  const searchParams = new URLSearchParams();
  searchParams.set("populate", "images,category,brand,seo");

  if (params?.page) searchParams.set("pagination[page]", String(params.page));
  if (params?.pageSize) searchParams.set("pagination[pageSize]", String(params.pageSize));
  if (params?.sort) searchParams.set("sort", params.sort);
  if (params?.category) searchParams.set("filters[category][slug][$eq]", params.category);
  if (params?.brand) searchParams.set("filters[brand][slug][$eq]", params.brand);
  if (params?.minPrice) searchParams.set("filters[price][$gte]", String(params.minPrice));
  if (params?.maxPrice) searchParams.set("filters[price][$lte]", String(params.maxPrice));
  if (params?.featured) searchParams.set("filters[featured][$eq]", "true");
  if (params?.search) searchParams.set("filters[$or][0][name][$containsi]", params.search);

  return fetchStrapi<StrapiResponse<Product[]>>(
    `/products?${searchParams.toString()}`,
    { tags: ["products"], revalidate: 60 }
  );
}

export async function getProductBySlug(slug: string) {
  const searchParams = new URLSearchParams();
  searchParams.set("filters[slug][$eq]", slug);
  searchParams.set("populate[images]", "*");
  searchParams.set("populate[category]", "*");
  searchParams.set("populate[brand]", "*");
  searchParams.set("populate[variants]", "*");
  searchParams.set("populate[reviews][populate]", "author");
  searchParams.set("populate[specifications]", "*");
  searchParams.set("populate[seo][populate]", "ogImage");

  const res = await fetchStrapi<StrapiResponse<Product[]>>(
    `/products?${searchParams.toString()}`,
    { tags: [`product-${slug}`], revalidate: 60 }
  );

  return res.data?.[0] || null;
}

export async function getProductSlugs() {
  const searchParams = new URLSearchParams();
  searchParams.set("fields[0]", "slug");
  searchParams.set("pagination[pageSize]", "1000");

  const res = await fetchStrapi<StrapiResponse<{ slug: string }[]>>(
    `/products?${searchParams.toString()}`,
    { revalidate: 3600 }
  );

  return res.data.map((p) => p.slug);
}

// ===== Categories =====
export async function getCategories() {
  return fetchStrapi<StrapiResponse<Category[]>>(
    "/categories?populate=image,children,parent,seo&sort=position:asc",
    { tags: ["categories"], revalidate: 3600 }
  );
}

export async function getCategoryBySlug(slug: string) {
  const res = await fetchStrapi<StrapiResponse<Category[]>>(
    `/categories?filters[slug][$eq]=${slug}&populate=image,seo,children,parent`,
    { tags: [`category-${slug}`], revalidate: 3600 }
  );
  return res.data?.[0] || null;
}

export async function getCategorySlugs() {
  const res = await fetchStrapi<StrapiResponse<{ slug: string }[]>>(
    "/categories?fields[0]=slug&pagination[pageSize]=500",
    { revalidate: 3600 }
  );
  return res.data.map((c) => c.slug);
}

// ===== Brands =====
export async function getBrands() {
  return fetchStrapi<StrapiResponse<Brand[]>>(
    "/brands?populate=logo&sort=name:asc",
    { tags: ["brands"], revalidate: 3600 }
  );
}

// ===== Homepage =====
export async function getHomepage() {
  return fetchStrapi<{ data: Homepage }>(
    "/homepage?populate[hero][populate]=image&populate[featuredProducts][populate][products][populate]=images,category&populate[banners][populate]=image&populate[testimonials][populate]=avatar&populate[seo][populate]=ogImage",
    { tags: ["homepage"], revalidate: 60 }
  );
}

// ===== Global Settings =====
export async function getGlobalSettings() {
  return fetchStrapi<{ data: GlobalSettings }>(
    "/global-setting?populate=logo,favicon,defaultSeo.ogImage",
    { tags: ["global-settings"], revalidate: 3600 }
  );
}

// ===== Reviews =====
export async function getProductReviews(productSlug: string) {
  return fetchStrapi<StrapiResponse<Review[]>>(
    `/reviews?filters[product][slug][$eq]=${productSlug}&filters[approved][$eq]=true&populate=author&sort=createdAt:desc`,
    { tags: [`reviews-${productSlug}`], revalidate: 60 }
  );
}

// ===== Shipping =====
export async function getShippingZones() {
  return fetchStrapi<StrapiResponse<ShippingZone[]>>(
    "/shipping-zones?populate=rates",
    { tags: ["shipping"], revalidate: 3600 }
  );
}

// ===== Pages =====
export async function getAboutPage() {
  return fetchStrapi<{ data: any }>(
    "/about-page?populate=image,seo.ogImage",
    { tags: ["about-page"], revalidate: 3600 }
  );
}

export async function getContactPage() {
  return fetchStrapi<{ data: any }>(
    "/contact-page?populate=seo.ogImage",
    { tags: ["contact-page"], revalidate: 3600 }
  );
}

export async function getFaqPage() {
  return fetchStrapi<{ data: any }>(
    "/faq-page?populate=items,seo.ogImage",
    { tags: ["faq-page"], revalidate: 3600 }
  );
}

export async function getLegalPages() {
  return fetchStrapi<{ data: any }>(
    "/legal-page?populate=seo.ogImage",
    { tags: ["legal-pages"], revalidate: 3600 }
  );
}

// ===== Orders =====
export async function getOrderByNumber(orderNumber: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetchStrapi<StrapiResponse<Order[]>>(
    `/orders?filters[orderNumber][$eq]=${orderNumber}&populate=items`,
    { cache: "no-store" }
  );
  return res.data?.[0] || null;
}

// ===== Checkout =====
export async function createStripeCheckout(data: {
  items: any[];
  customerEmail: string;
  shippingAddress?: any;
  billingAddress?: any;
  couponCode?: string;
}) {
  return fetchStrapi<{ sessionId: string; url: string }>(
    "/checkout/stripe",
    { method: "POST", body: data, cache: "no-store" }
  );
}

export async function createPayPalOrder(data: {
  items: any[];
  customerEmail: string;
  couponCode?: string;
}) {
  return fetchStrapi<{ orderId: string; approvalUrl: string }>(
    "/checkout/paypal/create",
    { method: "POST", body: data, cache: "no-store" }
  );
}

export async function capturePayPalOrder(data: {
  paypalOrderId: string;
  items: any[];
  customerEmail: string;
  customerName?: string;
  shippingAddress?: any;
  billingAddress?: any;
  couponCode?: string;
}) {
  return fetchStrapi<{ order: Order }>(
    "/checkout/paypal/capture",
    { method: "POST", body: data, cache: "no-store" }
  );
}

export async function validateCoupon(code: string, subtotal: number) {
  return fetchStrapi<{
    valid: boolean;
    type: string;
    value: number;
    discount: number;
  }>("/checkout/validate-coupon", {
    method: "POST",
    body: { code, subtotal },
    cache: "no-store",
  });
}

// ===== Newsletter =====
export async function subscribeNewsletter(email: string) {
  return fetchStrapi<any>("/newsletter-subscribers", {
    method: "POST",
    body: { data: { email } },
    cache: "no-store",
  });
}

// ===== Auth =====
export async function login(identifier: string, password: string) {
  const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  return res.json();
}

export async function register(data: {
  username: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export function getStrapiImageUrl(url?: string): string {
  if (!url) return "/images/placeholder.svg";
  if (url.startsWith("http")) return url;
  return `${STRAPI_URL}${url}`;
}
