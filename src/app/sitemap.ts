import type { MetadataRoute } from 'next';
import type { Product, Category } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://venipsshop-production.up.railway.app/api/v1';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://venips.com';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/catalogue`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/a-propos`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/auth/connexion`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/auth/inscription`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/cgv`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/confidentialite`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/cookies`, changeFrequency: 'yearly', priority: 0.4 },
  ];

  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const res = await fetch(`${API_URL}/products?limit=1000`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      products = data.products || [];
    }
  } catch {}

  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 3600 } });
    if (res.ok) categories = await res.json();
  } catch {}

  const productEntries: MetadataRoute.Sitemap = products.map(p => ({
    url: `${SITE_URL}/produit/${p.slug}`,
    lastModified: p.createdAt ? new Date(p.createdAt) : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map(c => ({
    url: `${SITE_URL}/catalogue?cat=${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
