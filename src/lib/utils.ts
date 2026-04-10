export const formatPrice = (amount: number): string =>
  new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', maximumFractionDigits: 0 }).format(amount);

export const formatPriceShort = (amount: number): string => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1).replace('.0', '')}M GNF`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}K GNF`;
  return `${amount} GNF`;
};

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  EN_ATTENTE:     { label: 'En attente',     color: 'yellow' },
  CONFIRME:       { label: 'Confirmée',      color: 'blue'   },
  EN_PREPARATION: { label: 'En préparation', color: 'teal'   },
  EXPEDIE:        { label: 'Expédiée',       color: 'indigo' },
  LIVRE:          { label: 'Livrée',         color: 'green'  },
  ANNULE:         { label: 'Annulée',        color: 'red'    },
};

export const getStatusLabel = (status: string) => STATUS_MAP[status] ?? { label: status, color: 'gray' };
