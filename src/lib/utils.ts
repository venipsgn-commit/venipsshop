export const formatPrice = (amount: number): string =>
  new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', maximumFractionDigits: 0 }).format(amount);

export const formatPriceShort = (amount: number): string => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1).replace('.0', '')}M GNF`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}K GNF`;
  return `${amount} GNF`;
};

export const STATUS_MAP: Record<string, { label: string; color: string; classes: string }> = {
  EN_ATTENTE:     { label: 'En attente',     color: 'yellow', classes: 'bg-yellow-100 text-yellow-700' },
  CONFIRME:       { label: 'Confirmée',      color: 'blue',   classes: 'bg-blue-100 text-blue-700'   },
  EN_PREPARATION: { label: 'En préparation', color: 'teal',   classes: 'bg-teal-100 text-teal-700'   },
  EXPEDIE:        { label: 'Expédiée',       color: 'indigo', classes: 'bg-indigo-100 text-indigo-700' },
  LIVRE:          { label: 'Livrée',         color: 'green',  classes: 'bg-green-100 text-green-700'  },
  ANNULE:         { label: 'Annulée',        color: 'red',    classes: 'bg-red-100 text-red-700'    },
};

export const getStatusLabel = (status: string) =>
  STATUS_MAP[status] ?? { label: status, color: 'gray', classes: 'bg-gray-100 text-gray-700' };
