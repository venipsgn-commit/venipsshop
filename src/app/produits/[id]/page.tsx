import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById, getProductsByCategory, products, formatPrice, categoryInfo } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import AddToCartButton from '@/components/AddToCartButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) notFound();

  const related = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const info = categoryInfo[product.category];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">Accueil</Link>
        <span>/</span>
        <Link href={`/categorie/${product.category}`} className="hover:text-blue-600 transition-colors">
          {info.label}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product detail */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative h-80 lg:h-auto min-h-96 bg-gray-50">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              unoptimized
              priority
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.badge && (
                <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                  {product.badge}
                </span>
              )}
              {discount && (
                <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-8 flex flex-col">
            <div className="mb-2">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                {product.subcategory}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
              </div>
              <span className="text-gray-500 text-sm">{product.rating}/5 ({product.reviews} avis)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-extrabold text-blue-600">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
              )}
              {discount && (
                <span className="text-sm font-bold text-red-500">Économisez {formatPrice(product.originalPrice! - product.price)}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

            {/* Features */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Caractéristiques</h3>
              <ul className="space-y-2">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              {product.stock > 10 ? (
                <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />
                  En stock ({product.stock} disponibles)
                </span>
              ) : product.stock > 0 ? (
                <span className="text-sm text-orange-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-orange-500 rounded-full inline-block" />
                  Stock limité — plus que {product.stock} !
                </span>
              ) : (
                <span className="text-sm text-red-600 font-medium">Rupture de stock</span>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <AddToCartButton product={product} />
              <Link
                href={`/categorie/${product.category}`}
                className="flex-1 border border-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                Continuer les achats
              </Link>
            </div>

            {/* Trust */}
            <div className="flex gap-4 mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500">
              <span className="flex items-center gap-1">🚚 Livraison rapide</span>
              <span className="flex items-center gap-1">↩️ Retours 30j</span>
              <span className="flex items-center gap-1">🔒 Paiement sécurisé</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Produits similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
