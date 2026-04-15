import type { Schema, Struct } from '@strapi/strapi';

export interface ProductSpecification extends Struct.ComponentSchema {
  collectionName: 'components_product_specification';
  info: {
    description: 'Product specification key-value pair';
    displayName: 'Specification';
    icon: 'list';
  };
  attributes: {
    key: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsBanner extends Struct.ComponentSchema {
  collectionName: 'components_sections_banner';
  info: {
    description: 'Promotional banner section';
    displayName: 'Banner';
    icon: 'picture';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    link: Schema.Attribute.String;
    position: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_sections_faq_item';
  info: {
    description: 'Question and answer pair';
    displayName: 'FAQ Item';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.RichText & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsFeaturedProducts extends Struct.ComponentSchema {
  collectionName: 'components_sections_featured_products';
  info: {
    description: 'Featured products section';
    displayName: 'Featured Products';
    icon: 'grid';
  };
  attributes: {
    products: Schema.Attribute.Relation<'oneToMany', 'api::product.product'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_hero';
  info: {
    description: 'Hero banner section';
    displayName: 'Hero';
    icon: 'star';
  };
  attributes: {
    ctaLink: Schema.Attribute.String;
    ctaText: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsTestimonial extends Struct.ComponentSchema {
  collectionName: 'components_sections_testimonial';
  info: {
    description: 'Customer testimonial';
    displayName: 'Testimonial';
    icon: 'quote';
  };
  attributes: {
    avatar: Schema.Attribute.Media<'images'>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    quote: Schema.Attribute.Text & Schema.Attribute.Required;
    role: Schema.Attribute.String;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    description: 'Image with alt text';
    displayName: 'Media';
    icon: 'image';
  };
  attributes: {
    alt: Schema.Attribute.String & Schema.Attribute.Required;
    file: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seo';
  info: {
    description: 'SEO metadata for pages and content';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    metaDescription: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    noIndex: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    ogImage: Schema.Attribute.Media<'images'>;
  };
}

export interface ShippingRate extends Struct.ComponentSchema {
  collectionName: 'components_shipping_rate';
  info: {
    description: 'Shipping rate tier';
    displayName: 'Shipping Rate';
    icon: 'truck';
  };
  attributes: {
    estimatedDays: Schema.Attribute.String;
    maxWeight: Schema.Attribute.Decimal;
    minWeight: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    price: Schema.Attribute.Decimal & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'product.specification': ProductSpecification;
      'sections.banner': SectionsBanner;
      'sections.faq-item': SectionsFaqItem;
      'sections.featured-products': SectionsFeaturedProducts;
      'sections.hero': SectionsHero;
      'sections.testimonial': SectionsTestimonial;
      'shared.media': SharedMedia;
      'shared.seo': SharedSeo;
      'shipping.rate': ShippingRate;
    }
  }
}
