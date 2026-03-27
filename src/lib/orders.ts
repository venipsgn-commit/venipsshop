export interface Order {
  id: string;
  createdAt: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  pays: string;
  paiement: string;
  transiteur: string;
  dateLivraison: string; // ISO date string
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  statut: 'en_attente' | 'en_transit' | 'livree';
  alertDismissed: boolean;
}

export const saveOrder = (order: Order): void => {
  const existing = getOrders();
  existing.push(order);
  localStorage.setItem('venipsshop-orders', JSON.stringify(existing));
};

export const getOrders = (): Order[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('venipsshop-orders') ?? '[]') as Order[];
  } catch {
    return [];
  }
};

export const dismissOrderAlert = (orderId: string): void => {
  const orders = getOrders();
  const updated = orders.map((o) =>
    o.id === orderId ? { ...o, alertDismissed: true } : o
  );
  localStorage.setItem('venipsshop-orders', JSON.stringify(updated));
};

export const getPendingAlerts = (): Order[] => {
  const orders = getOrders();
  const now = new Date();
  return orders.filter((o) => {
    if (o.alertDismissed || o.statut === 'livree') return false;
    const deliveryDate = new Date(o.dateLivraison);
    return deliveryDate <= now;
  });
};
