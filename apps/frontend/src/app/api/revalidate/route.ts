import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidation-secret");

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  let body: { model?: string; entry?: { slug?: string } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const model = body.model;
  const slug = body.entry?.slug;

  // Map Strapi content types to cache tags
  const tagMap: Record<string, string[]> = {
    product: slug ? ["products", `product-${slug}`] : ["products"],
    category: slug ? ["categories", `category-${slug}`] : ["categories"],
    brand: ["brands"],
    review: slug ? [`reviews-${slug}`] : [],
    order: [],
    homepage: ["homepage"],
    "global-setting": ["global-settings"],
    "about-page": ["about-page"],
    "contact-page": ["contact-page"],
    "faq-page": ["faq-page"],
    "legal-page": ["legal-pages"],
    "shipping-zone": ["shipping"],
  };

  const tags = model ? tagMap[model] || [] : [];

  if (tags.length === 0) {
    return NextResponse.json({ revalidated: false, message: "No tags to revalidate" });
  }

  for (const tag of tags) {
    revalidateTag(tag, "default");
  }

  return NextResponse.json({ revalidated: true, tags });
}
