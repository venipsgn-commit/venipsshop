import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Product } from '@/lib/api';
import ProductPageClient from './ProductPageClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://venipsshop-production.up.railway.app/api/v1';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://venips.com';

async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchRelated(categorySlug: string, excludeId: string): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products?category=${encodeURIComponent(categorySlug)}&limit=5`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products || []).filter((p: Product) => p.id !== excludeId).slice(0, 4);
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    return {
      title: 'Produit introuvable | VenipShop',
      description: 'Ce produit n’est pas disponible.',
      robots: { index: false, follow: false },
    };
  }

  const title = `${product.name} – ${product.brand} | VenipShop`;
  const description =
    product.shortDesc?.trim() ||
    product.description?.replace(/\s+/g, ' ').trim().slice(0, 160) ||
    `Achetez ${product.name} (${product.brand}) sur VenipShop. Livraison partout en Guinée.`;
  const url = `${SITE_URL}/produit/${product.slug}`;
  const image = product.images?.[0];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'VenipShop',
      type: 'website',
      locale: 'fr_FR',
      images: image ? [{ url: image, width: 1200, height: 630, alt: product.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) notFound();

  const related = product.category?.slug
    ? await fetchRelated(product.category.slug, product.id)
    : [];

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    brand: { '@type': 'Brand', name: product.brand },
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/produit/${product.slug}`,
      priceCurrency: 'GNF',
      price: product.price,
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };

  if (product.reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient product={product} related={related} />
    </>
  );
}
