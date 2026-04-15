export const ORDER_STATUSES = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
} as const;

export const PAYMENT_METHODS = {
  stripe: 'Credit Card',
  paypal: 'PayPal',
} as const;

export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_CURRENCY_SYMBOL = '$';

export const ITEMS_PER_PAGE = 12;
export const MAX_CART_QUANTITY = 99;

export const SORT_OPTIONS = [
  { label: 'Newest', value: 'createdAt:desc' },
  { label: 'Price: Low to High', value: 'price:asc' },
  { label: 'Price: High to Low', value: 'price:desc' },
  { label: 'Name: A-Z', value: 'name:asc' },
  { label: 'Best Rating', value: 'averageRating:desc' },
] as const;
