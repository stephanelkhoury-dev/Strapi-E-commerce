export default {
  routes: [
    {
      method: 'POST',
      path: '/checkout/stripe',
      handler: 'checkout.createStripeSession',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/checkout/stripe/webhook',
      handler: 'checkout.stripeWebhook',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/checkout/paypal/create',
      handler: 'checkout.createPayPalOrder',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/checkout/paypal/capture',
      handler: 'checkout.capturePayPalOrder',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/checkout/validate-coupon',
      handler: 'checkout.validateCoupon',
      config: { auth: false },
    },
  ],
};
