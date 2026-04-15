/**
 * This file forces TypeScript to copy schema.json files to the dist directory.
 * Without these imports, tsc only compiles .ts files and the JSON schemas
 * needed by Strapi's content-type loader would be missing from dist/.
 */
import './api/about-page/content-types/about-page/schema.json';
import './api/address/content-types/address/schema.json';
import './api/brand/content-types/brand/schema.json';
import './api/category/content-types/category/schema.json';
import './api/contact-page/content-types/contact-page/schema.json';
import './api/coupon/content-types/coupon/schema.json';
import './api/faq-page/content-types/faq-page/schema.json';
import './api/global-setting/content-types/global-setting/schema.json';
import './api/homepage/content-types/homepage/schema.json';
import './api/legal-page/content-types/legal-page/schema.json';
import './api/newsletter-subscriber/content-types/newsletter-subscriber/schema.json';
import './api/order-item/content-types/order-item/schema.json';
import './api/order/content-types/order/schema.json';
import './api/product-variant/content-types/product-variant/schema.json';
import './api/product/content-types/product/schema.json';
import './api/review/content-types/review/schema.json';
import './api/shipping-zone/content-types/shipping-zone/schema.json';
import './api/wishlist/content-types/wishlist/schema.json';

// Component schemas
import './components/product/specification.json';
import './components/sections/banner.json';
import './components/sections/faq-item.json';
import './components/sections/featured-products.json';
import './components/sections/hero.json';
import './components/sections/testimonial.json';
import './components/shared/media.json';
import './components/shared/seo.json';
import './components/shipping/rate.json';
