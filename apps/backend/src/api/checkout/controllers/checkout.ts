import type { Core } from '@strapi/strapi';
import crypto from 'crypto';

const STRIPE_API = 'https://api.stripe.com/v1';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * POST /api/checkout/stripe - Create a Stripe checkout session
   */
  async createStripeSession(ctx: any) {
    const { items, customerEmail, shippingAddress, billingAddress, couponCode } = ctx.request.body;

    if (!items?.length || !customerEmail) {
      return ctx.badRequest('Missing required fields: items, customerEmail');
    }

    const checkoutService = strapi.service('api::checkout.checkout') as any;
    const { subtotal, discount, tax, total } = await checkoutService.calculateOrderTotals(items, couponCode);

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return ctx.internalServerError('Stripe is not configured');
    }

    // Create Stripe Checkout Session via API
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', `${process.env.FRONTEND_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`);
    params.append('cancel_url', `${process.env.FRONTEND_URL}/cart`);
    params.append('customer_email', customerEmail);
    params.append('metadata[couponCode]', couponCode || '');
    params.append('metadata[shippingAddress]', JSON.stringify(shippingAddress || {}));
    params.append('metadata[billingAddress]', JSON.stringify(billingAddress || {}));

    lineItems.forEach((item: any, i: number) => {
      params.append(`line_items[${i}][price_data][currency]`, item.price_data.currency);
      params.append(`line_items[${i}][price_data][product_data][name]`, item.price_data.product_data.name);
      params.append(`line_items[${i}][price_data][unit_amount]`, String(item.price_data.unit_amount));
      params.append(`line_items[${i}][quantity]`, String(item.quantity));
    });

    // Add items metadata for order creation
    items.forEach((item: any, i: number) => {
      params.append(`metadata[item_${i}_productId]`, item.productId);
      params.append(`metadata[item_${i}_quantity]`, String(item.quantity));
      if (item.variantId) params.append(`metadata[item_${i}_variantId]`, item.variantId);
    });
    params.append('metadata[itemCount]', String(items.length));

    const response = await fetch(`${STRIPE_API}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session: any = await response.json();

    if (!response.ok) {
      strapi.log.error('Stripe session creation failed', session);
      return ctx.internalServerError('Failed to create checkout session');
    }

    ctx.body = {
      sessionId: session.id,
      url: session.url,
    };
  },

  /**
   * POST /api/checkout/stripe/webhook - Handle Stripe webhooks
   */
  async stripeWebhook(ctx: any) {
    const sig = ctx.request.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return ctx.badRequest('Missing signature or webhook secret');
    }

    // Verify webhook signature
    const payload = (ctx.request as any).body?.[Symbol.for('unparsedBody')] || JSON.stringify(ctx.request.body);
    const timestamp = sig.split(',').find((s: string) => s.startsWith('t='))?.split('=')[1];
    const sigHash = sig.split(',').find((s: string) => s.startsWith('v1='))?.split('=')[1];

    if (!timestamp || !sigHash) {
      return ctx.badRequest('Invalid signature format');
    }

    const signedPayload = `${timestamp}.${payload}`;
    const expectedSig = crypto.createHmac('sha256', webhookSecret).update(signedPayload).digest('hex');

    if (expectedSig !== sigHash) {
      return ctx.unauthorized('Invalid webhook signature');
    }

    const event = typeof ctx.request.body === 'string' ? JSON.parse(ctx.request.body) : ctx.request.body;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const metadata = session.metadata;

        // Reconstruct items from metadata
        const itemCount = parseInt(metadata.itemCount || '0');
        const items = [];
        for (let i = 0; i < itemCount; i++) {
          items.push({
            productId: metadata[`item_${i}_productId`],
            quantity: parseInt(metadata[`item_${i}_quantity`]),
            variantId: metadata[`item_${i}_variantId`] || null,
          });
        }

        const checkoutService = strapi.service('api::checkout.checkout') as any;
        await checkoutService.createOrder({
          items,
          customerEmail: session.customer_email,
          shippingAddress: JSON.parse(metadata.shippingAddress || '{}'),
          billingAddress: JSON.parse(metadata.billingAddress || '{}'),
          paymentMethod: 'stripe',
          paymentIntentId: session.payment_intent,
          couponCode: metadata.couponCode || undefined,
        });
        break;
      }
    }

    ctx.body = { received: true };
  },

  /**
   * POST /api/checkout/paypal/create - Create a PayPal order
   */
  async createPayPalOrder(ctx: any) {
    const { items, customerEmail, shippingAddress, billingAddress, couponCode } = ctx.request.body;

    if (!items?.length || !customerEmail) {
      return ctx.badRequest('Missing required fields: items, customerEmail');
    }

    const checkoutService = strapi.service('api::checkout.checkout') as any;
    const { total } = await checkoutService.calculateOrderTotals(items, couponCode);

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return ctx.internalServerError('PayPal is not configured');
    }

    const baseURL = process.env.PAYPAL_SANDBOX === 'true'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    // Get PayPal access token
    const authResponse = await fetch(`${baseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const authData: any = await authResponse.json();

    if (!authResponse.ok) {
      strapi.log.error('PayPal auth failed', authData);
      return ctx.internalServerError('PayPal authentication failed');
    }

    // Create PayPal order
    const orderResponse = await fetch(`${baseURL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: total.toFixed(2),
          },
        }],
        application_context: {
          return_url: `${process.env.FRONTEND_URL}/order/success`,
          cancel_url: `${process.env.FRONTEND_URL}/cart`,
        },
      }),
    });

    const orderData: any = await orderResponse.json();

    if (!orderResponse.ok) {
      strapi.log.error('PayPal order creation failed', orderData);
      return ctx.internalServerError('Failed to create PayPal order');
    }

    ctx.body = {
      orderId: orderData.id,
      approvalUrl: orderData.links?.find((l: any) => l.rel === 'approve')?.href,
    };
  },

  /**
   * POST /api/checkout/paypal/capture - Capture a PayPal payment
   */
  async capturePayPalOrder(ctx: any) {
    const { paypalOrderId, items, customerEmail, customerName, shippingAddress, billingAddress, couponCode } = ctx.request.body;

    if (!paypalOrderId) {
      return ctx.badRequest('Missing PayPal order ID');
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const baseURL = process.env.PAYPAL_SANDBOX === 'true'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    // Get access token
    const authResponse = await fetch(`${baseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const authData: any = await authResponse.json();

    // Capture payment
    const captureResponse = await fetch(`${baseURL}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData: any = await captureResponse.json();

    if (captureData.status !== 'COMPLETED') {
      return ctx.badRequest('Payment capture failed');
    }

    // Create order in our system
    const checkoutService = strapi.service('api::checkout.checkout') as any;
    const order = await checkoutService.createOrder({
      items,
      customerEmail,
      customerName,
      shippingAddress,
      billingAddress,
      paymentMethod: 'paypal',
      paymentIntentId: paypalOrderId,
      couponCode,
    });

    ctx.body = { order };
  },

  /**
   * POST /api/checkout/validate-coupon - Validate a coupon code
   */
  async validateCoupon(ctx: any) {
    const { code, subtotal } = ctx.request.body;

    if (!code) {
      return ctx.badRequest('Missing coupon code');
    }

    const coupons = await strapi.documents('api::coupon.coupon').findMany({
      filters: { code, active: true },
    });
    const coupon = coupons[0];

    if (!coupon) {
      return ctx.notFound('Invalid coupon code');
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return ctx.badRequest('Coupon is not yet active');
    }
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return ctx.badRequest('Coupon has expired');
    }
    if (coupon.maxUses && (coupon.usedCount ?? 0) >= coupon.maxUses) {
      return ctx.badRequest('Coupon usage limit reached');
    }
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return ctx.badRequest(`Minimum order amount is $${coupon.minOrderAmount}`);
    }

    let discount = 0;
    if (subtotal) {
      discount = coupon.type === 'percentage'
        ? subtotal * (coupon.value / 100)
        : Math.min(coupon.value, subtotal);
    }

    ctx.body = {
      valid: true,
      type: coupon.type,
      value: coupon.value,
      discount,
    };
  },
});
