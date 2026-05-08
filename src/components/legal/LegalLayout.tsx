import Link from 'next/link';

export default function LegalLayout({
  title,
  lastUpdate,
  children,
}: {
  title: string;
  lastUpdate: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white min-h-screen">
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-teal-500 transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">{title}</span>
          </nav>
        </div>
      </div>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">{title}</h1>
        <p className="text-sm text-gray-400 mb-10">Dernière mise à jour : {lastUpdate}</p>
        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_li]:text-gray-700 [&_a]:text-teal-600 [&_a]:underline [&_strong]:text-gray-900">
          {children}
        </div>
      </article>
    </div>
  );
}
