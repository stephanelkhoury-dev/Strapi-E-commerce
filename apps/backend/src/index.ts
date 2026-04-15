import type { Core } from '@strapi/strapi';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    // Register custom fields, middlewares, etc.
  },
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Bootstrap lifecycle hook — runs after Strapi is ready
  },
};
