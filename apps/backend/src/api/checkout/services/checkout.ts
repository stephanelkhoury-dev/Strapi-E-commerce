import type { Core } from '@strapi/strapi';
import crypto from 'crypto';

export default ({ strapi }: { strapi: Core.Strapi }): Record<string, (...args: any[]) => any> => ({
  async calculateOrderTotals(items: any[], couponCode?: string) {
    let subtotal = 0;

    for (const item of items) {
      const product = await strapi.documents('api::product.product').findOne({
        documentId: item.productId,
        populate: ['variants'],
      });

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      let price = product.price;
      let stock = product.stock;

      if (item.variantId) {
        const variant = await strapi.documents('api::product-variant.product-variant').findOne({
          documentId: item.variantId,
        });
        if (variant) {
          price = variant.price;
          stock = variant.stock;
        }
      }

      if (stock !== undefined && stock !== null && stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${stock}`);
      }

      subtotal += price * item.quantity;
    }

    // Apply coupon
    let discount = 0;
    if (couponCode) {
      const coupons = await strapi.documents('api::coupon.coupon').findMany({
        filters: { code: couponCode, active: true },
      });
      const coupon = coupons[0];

      if (coupon) {
        const now = new Date();
        const startValid = !coupon.startDate || new Date(coupon.startDate) <= now;
        const endValid = !coupon.endDate || new Date(coupon.endDate) >= now;
        const usesValid = !coupon.maxUses || (coupon.usedCount ?? 0) < coupon.maxUses;
        const minOrderValid = !coupon.minOrderAmount || subtotal >= coupon.minOrderAmount;

        if (startValid && endValid && usesValid && minOrderValid) {
          if (coupon.type === 'percentage') {
            discount = subtotal * (coupon.value / 100);
          } else {
            discount = Math.min(coupon.value, subtotal);
          }
        }
      }
    }

    // Get global tax rate
    const globalSettings = await strapi.documents('api::global-setting.global-setting').findFirst({});
    const taxRate = globalSettings?.taxRate ?? 0;
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * (taxRate / 100);
    const total = taxableAmount + tax;

    return { subtotal, discount, tax, total, taxRate };
  },

  async createOrder(data: {
    items: any[];
    customerEmail: string;
    customerName?: string;
    customerId?: string;
    shippingAddress: any;
    billingAddress: any;
    paymentMethod: 'stripe' | 'paypal';
    paymentIntentId: string;
    couponCode?: string;
    shippingCost?: number;
    notes?: string;
  }) {
    const { subtotal, discount, tax, total } = await this.calculateOrderTotals(
      data.items,
      data.couponCode
    );

    const orderNumber = `ORD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const finalTotal = total + (data.shippingCost ?? 0);

    // Create the order
    const order = await strapi.documents('api::order.order').create({
      data: {
        orderNumber,
        status: 'pending',
        subtotal,
        discount,
        tax,
        shippingCost: data.shippingCost ?? 0,
        total: finalTotal,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        paymentMethod: data.paymentMethod,
        paymentIntentId: data.paymentIntentId,
        customer: data.customerId ? { id: data.customerId } : undefined,
        notes: data.notes,
      } as any,
    });

    // Create order items and decrement stock
    for (const item of data.items) {
      const product = await strapi.documents('api::product.product').findOne({
        documentId: item.productId,
      });

      if (!product) continue;

      let unitPrice = product.price;
      if (item.variantId) {
        const variant = await strapi.documents('api::product-variant.product-variant').findOne({
          documentId: item.variantId,
        });
        if (variant) unitPrice = variant.price;
      }

      await strapi.documents('api::order-item.order-item').create({
        data: {
          quantity: item.quantity,
          unitPrice,
          total: unitPrice * item.quantity,
          productName: product.name,
          productSlug: product.slug,
          variantName: item.variantName || null,
          sku: item.sku || product.sku,
          product: item.productId,
          variant: item.variantId || null,
          order: order.documentId,
        } as any,
      });

      // Decrement stock
      if (item.variantId) {
        const variant = await strapi.documents('api::product-variant.product-variant').findOne({
          documentId: item.variantId,
        });
        if (variant) {
          await strapi.documents('api::product-variant.product-variant').update({
            documentId: item.variantId,
            data: { stock: Math.max(0, (variant.stock ?? 0) - item.quantity) } as any,
          });
        }
      } else {
        await strapi.documents('api::product.product').update({
          documentId: item.productId,
          data: { stock: Math.max(0, (product.stock ?? 0) - item.quantity) } as any,
        });
      }
    }

    // Increment coupon usage
    if (data.couponCode) {
      const coupons = await strapi.documents('api::coupon.coupon').findMany({
        filters: { code: data.couponCode },
      });
      const coupon = coupons[0];
      if (coupon) {
        await strapi.documents('api::coupon.coupon').update({
          documentId: coupon.documentId,
          data: { usedCount: (coupon.usedCount ?? 0) + 1 } as any,
        });
      }
    }

    return order;
  },

  async updateOrderStatus(orderDocumentId: string, status: string, trackingNumber?: string) {
    const updateData: any = { status };
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    const order = await strapi.documents('api::order.order').update({
      documentId: orderDocumentId,
      data: updateData,
    });

    // If cancelled, re-stock items
    if (status === 'cancelled') {
      const orderItems = await strapi.documents('api::order-item.order-item').findMany({
        filters: { order: { documentId: orderDocumentId } },
        populate: ['product', 'variant'],
      });

      for (const item of orderItems) {
        if ((item as any).variant) {
          const variant = await strapi.documents('api::product-variant.product-variant').findOne({
            documentId: (item as any).variant.documentId,
          });
          if (variant) {
            await strapi.documents('api::product-variant.product-variant').update({
              documentId: variant.documentId,
              data: { stock: (variant.stock ?? 0) + item.quantity } as any,
            });
          }
        } else if ((item as any).product) {
          const product = await strapi.documents('api::product.product').findOne({
            documentId: (item as any).product.documentId,
          });
          if (product) {
            await strapi.documents('api::product.product').update({
              documentId: product.documentId,
              data: { stock: (product.stock ?? 0) + item.quantity } as any,
            });
          }
        }
      }
    }

    return order;
  },
});
