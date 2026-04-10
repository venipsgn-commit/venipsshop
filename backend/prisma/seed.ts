import { PrismaClient, Role, ProductBadge, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed...');

  // ── Admin ─────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@venips2024', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@venips.gn' },
    update: {},
    create: {
      email: 'admin@venips.gn',
      password: adminPassword,
      prenom: 'Admin',
      nom: 'Venips',
      telephone: '+224628880354',
      role: Role.ADMIN,
    },
  });
  console.log('✅ Admin créé:', admin.email);

  // ── Utilisateur test ──────────────────────────────────────────
  const userPassword = await bcrypt.hash('User@venips2024', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@venips.gn' },
    update: {},
    create: {
      email: 'test@venips.gn',
      password: userPassword,
      prenom: 'Mamadou',
      nom: 'Camara',
      telephone: '+224621000001',
      role: Role.USER,
    },
  });
  console.log('✅ Utilisateur test créé:', testUser.email);

  // ── Catégories ────────────────────────────────────────────────
  const categories = [
    { name: 'Smartphones', slug: 'smartphones', description: 'Téléphones et accessoires', icon: '📱' },
    { name: 'Ordinateurs', slug: 'ordinateurs', description: 'PC, laptops et accessoires', icon: '💻' },
    { name: 'Audio', slug: 'audio', description: 'Casques, écouteurs et enceintes', icon: '🎧' },
    { name: 'TV & Écrans', slug: 'tv-ecrans', description: 'Télévisions et moniteurs', icon: '📺' },
    { name: 'Gaming', slug: 'gaming', description: 'Consoles et jeux vidéo', icon: '🎮' },
    { name: 'Électroménager', slug: 'electromenager', description: 'Appareils pour la maison', icon: '🏠' },
    { name: 'Accessoires', slug: 'accessoires', description: 'Câbles, coques et plus', icon: '🔌' },
    { name: 'Mode & Beauté', slug: 'mode-beaute', description: 'Vêtements et cosmétiques', icon: '👗' },
  ];

  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories[cat.slug] = created.id;
  }
  console.log('✅ Catégories créées:', categories.length);

  // ── Produits ──────────────────────────────────────────────────
  const products = [
    {
      name: 'iPhone 15 Pro 256GB',
      slug: 'iphone-15-pro-256gb',
      description: 'Le dernier iPhone avec puce A17 Pro, écran Super Retina XDR 6.1", appareil photo 48MP et châssis en titane. Compatible avec les réseaux Guinée.',
      shortDesc: 'Smartphone Apple haut de gamme avec puce A17 Pro',
      price: 8500000,
      originalPrice: 9800000,
      stock: 15,
      categorySlug: 'smartphones',
      brand: 'Apple',
      badge: ProductBadge.PROMO,
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800'],
      features: ['Écran 6.1" Super Retina XDR', 'Puce A17 Pro', 'Appareil photo 48MP', 'Châssis Titane', 'USB-C', 'Autonomie 23h vidéo'],
      specs: { processeur: 'A17 Pro', stockage: '256GB', ram: '8GB', os: 'iOS 17', couleurs: ['Titane Noir', 'Titane Blanc', 'Titane Bleu'] },
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24-ultra',
      description: 'Flaghship Samsung avec S Pen intégré, écran Dynamic AMOLED 6.8" 120Hz, appareil photo 200MP et intelligence artificielle Galaxy AI.',
      shortDesc: 'Le meilleur Samsung avec S Pen et IA Galaxy',
      price: 7200000,
      originalPrice: null,
      stock: 8,
      categorySlug: 'smartphones',
      brand: 'Samsung',
      badge: ProductBadge.NOUVEAU,
      images: ['https://images.unsplash.com/photo-1706899236214-2edy9f8f5k6?w=800'],
      features: ['Écran 6.8" 120Hz', 'S Pen intégré', 'Appareil photo 200MP', 'Galaxy AI', 'Batterie 5000mAh', 'IP68'],
      specs: { processeur: 'Snapdragon 8 Gen 3', stockage: '256GB', ram: '12GB', os: 'Android 14' },
    },
    {
      name: 'MacBook Air M3 13"',
      slug: 'macbook-air-m3-13',
      description: 'Le MacBook Air le plus fin jamais conçu avec la puce M3 révolutionnaire. Autonomie de 18h, écran Liquid Retina 13.6" et silencieux sans ventilateur.',
      shortDesc: 'Laptop ultra-fin Apple avec puce M3',
      price: 12500000,
      originalPrice: 13500000,
      stock: 6,
      categorySlug: 'ordinateurs',
      brand: 'Apple',
      badge: ProductBadge.POPULAIRE,
      images: ['https://images.unsplash.com/photo-1611186871525-67c11e02de26?w=800'],
      features: ['Puce M3', 'Écran 13.6" Liquid Retina', 'Autonomie 18h', 'Sans ventilateur', '8GB RAM', '256GB SSD'],
      specs: { processeur: 'Apple M3', ram: '8GB', stockage: '256GB SSD', os: 'macOS Sonoma', poids: '1.24kg' },
    },
    {
      name: 'Sony WH-1000XM5',
      slug: 'sony-wh-1000xm5',
      description: 'Casque Bluetooth à réduction de bruit leader du marché. Son haute résolution, 30h d\'autonomie et appels cristallins grâce aux 8 micros.',
      shortDesc: 'Meilleur casque ANC du marché',
      price: 1850000,
      originalPrice: 2200000,
      stock: 20,
      categorySlug: 'audio',
      brand: 'Sony',
      badge: ProductBadge.BEST_SELLER,
      images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800'],
      features: ['ANC industrie', 'Autonomie 30h', 'USB-C', '8 micros', 'Son Hi-Res', 'Léger 250g'],
      specs: { connexion: 'Bluetooth 5.2', autonomie: '30h', poids: '250g', recharge: 'USB-C' },
    },
    {
      name: 'Samsung 65" QLED 4K',
      slug: 'samsung-65-qled-4k',
      description: 'Téléviseur QLED 65 pouces avec processeur Neural Quantum 4K, Tizen OS et compatibilité HDR10+. Image époustouflante pour votre salon.',
      shortDesc: 'TV QLED 65" avec Smart TV Tizen',
      price: 9800000,
      originalPrice: 11500000,
      stock: 4,
      categorySlug: 'tv-ecrans',
      brand: 'Samsung',
      badge: ProductBadge.PROMO,
      images: ['https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800'],
      features: ['Écran QLED 65"', '4K 120Hz', 'HDR10+', 'Smart TV Tizen', 'HDMI 2.1', 'Dolby Atmos'],
      specs: { taille: '65 pouces', resolution: '4K (3840x2160)', os: 'Tizen', hdmi: '4x HDMI 2.1' },
    },
    {
      name: 'PlayStation 5 Slim',
      slug: 'playstation-5-slim',
      description: 'La nouvelle PlayStation 5 Slim, 30% plus compacte. SSD ultra-rapide, ray-tracing en temps réel, et DualSense avec retour haptique.',
      shortDesc: 'Console next-gen Sony plus compacte',
      price: 5500000,
      originalPrice: null,
      stock: 3,
      categorySlug: 'gaming',
      brand: 'Sony',
      badge: ProductBadge.GAMING,
      images: ['https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800'],
      features: ['SSD 1TB ultra-rapide', 'Ray-tracing', 'DualSense haptique', '4K 120fps', 'Bluetooth 5.1', '30% plus compact'],
      specs: { stockage: '1TB SSD', resolution: '4K 120fps', processeur: 'AMD Zen 2 + RDNA 2' },
    },
    {
      name: 'Xiaomi Redmi Note 13 Pro',
      slug: 'xiaomi-redmi-note-13-pro',
      description: 'Meilleur rapport qualité-prix avec écran AMOLED 6.67" 120Hz, appareil photo 200MP et charge rapide 67W. Idéal pour la Guinée.',
      shortDesc: 'Meilleur rapport qualité-prix 200MP',
      price: 1650000,
      originalPrice: 1900000,
      stock: 25,
      categorySlug: 'smartphones',
      brand: 'Xiaomi',
      badge: ProductBadge.POPULAIRE,
      images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800'],
      features: ['Écran AMOLED 6.67" 120Hz', 'Appareil photo 200MP', 'Charge 67W', 'Batterie 5100mAh', 'NFC', 'IP54'],
      specs: { processeur: 'Snapdragon 7s Gen 2', ram: '8GB', stockage: '256GB', os: 'MIUI 14 / Android 13' },
    },
    {
      name: 'AirPods Pro 2ème génération',
      slug: 'airpods-pro-2eme-generation',
      description: 'Écouteurs Apple avec ANC adaptatif, audio spatial personnalisé et boîtier MagSafe USB-C. Son exceptionnel dans un format compact.',
      shortDesc: 'Écouteurs Apple ANC premium',
      price: 2100000,
      originalPrice: 2400000,
      stock: 18,
      categorySlug: 'audio',
      brand: 'Apple',
      badge: ProductBadge.EXCLUSIF,
      images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800'],
      features: ['ANC adaptatif', 'Audio spatial', 'USB-C MagSafe', 'Autonomie 6h (30h boîtier)', 'Résistance IPX4', 'Puce H2'],
      specs: { connexion: 'Bluetooth 5.3', autonomie: '6h + 24h boîtier', resistance: 'IPX4', recharge: 'MagSafe / USB-C' },
    },
  ];

  for (const p of products) {
    const { categorySlug, ...productData } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...productData,
        categoryId: createdCategories[categorySlug],
        specs: productData.specs as any,
      },
    });
  }
  console.log('✅ Produits créés:', products.length);

  // ── Codes promo ────────────────────────────────────────────────
  const promoCodes = [
    { code: 'VENIPS10', discount: 10, minOrder: 500000, maxUses: 100 },
    { code: 'BIENVENUE', discount: 15, minOrder: 1000000, maxUses: 50 },
    { code: 'GUINEE20', discount: 20, minOrder: 2000000, maxUses: 30 },
  ];

  for (const promo of promoCodes) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      update: {},
      create: promo,
    });
  }
  console.log('✅ Codes promo créés:', promoCodes.length);

  console.log('\n🎉 Seed terminé avec succès!');
  console.log('─────────────────────────────────────');
  console.log('Admin:  admin@venips.gn / Admin@venips2024');
  console.log('Test:   test@venips.gn  / User@venips2024');
  console.log('─────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
