import { notFound } from 'next/navigation';
import { getProductsByCategory, categoryInfo, Category } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return [
    { slug: 'ordinateurs' },
    { slug: 'telephones' },
    { slug: 'accessoires' },
  ];
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  if (!(slug in categoryInfo)) {
    notFound();
  }

  const category = slug as Category;
  const info = categoryInfo[category];
  const allProducts = getProductsByCategory(category);

  const subcategories = Array.from(new Set(allProducts.map((p) => p.subcategory)));

  const colorMap: Record<string, string> = {
    blue: 'from-blue-600 to-blue-800',
    purple: 'from-purple-600 to-purple-800',
    emerald: 'from-emerald-600 to-emerald-800',
  };

  return (
    <div>
      {/* Banner */}
      <section className={`bg-gradient-to-r ${colorMap[info.color]} text-white py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white">{info.label}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{info.icon}</span>
            <div>
              <h1 className="text-3xl font-bold">{info.label}</h1>
              <p className="text-white/80 mt-1">{info.description} — {allProducts.length} produits</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Subcategory filters */}
        {subcategories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="text-sm font-medium text-gray-500 self-center mr-2">Filtrer :</span>
            {subcategories.map((sub) => (
              <span
                key={sub}
                className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-sm text-gray-600 shadow-sm"
              >
                {sub} ({allProducts.filter((p) => p.subcategory === sub).length})
              </span>
            ))}
          </div>
        )}

        {/* Products by subcategory */}
        {subcategories.map((sub) => {
          const subProducts = allProducts.filter((p) => p.subcategory === sub);
          return (
            <div key={sub} className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-5 pb-3 border-b border-gray-200">
                {sub}
                <span className="ml-2 text-sm font-normal text-gray-400">({subProducts.length} produits)</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {subProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
