export const PIXEL_ID = '2374817293008435';

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

const fbq = (...args: unknown[]) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq(...args);
  }
};

export const pixel = {
  pageView: () =>
    fbq('track', 'PageView'),

  viewContent: (product: { id: string; name: string; price: number }) =>
    fbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price,
      currency: 'GNF',
    }),

  addToCart: (product: { id: string; name: string; price: number }) =>
    fbq('track', 'AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price,
      currency: 'GNF',
    }),

  purchase: (orderNumber: string, value: number, numItems: number) =>
    fbq('track', 'Purchase', {
      value,
      currency: 'GNF',
      order_id: orderNumber,
      num_items: numItems,
    }),
};
