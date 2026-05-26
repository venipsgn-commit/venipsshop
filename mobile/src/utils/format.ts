export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-GN', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  EN_ATTENTE:      'En attente',
  CONFIRME:        'Confirmée',
  EN_PREPARATION:  'En préparation',
  EXPEDIE:         'Expédiée',
  LIVRE:           'Livrée',
  ANNULE:          'Annulée',
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  EN_ATTENTE:      '#f59e0b',
  CONFIRME:        '#3b82f6',
  EN_PREPARATION:  '#8b5cf6',
  EXPEDIE:         '#06b6d4',
  LIVRE:           '#10b981',
  ANNULE:          '#ef4444',
};
