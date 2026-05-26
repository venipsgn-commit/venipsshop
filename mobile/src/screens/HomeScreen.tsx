import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, TextInput, FlatList, ActivityIndicator, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { productApi, categoryApi, Product, Category } from '../api/api';
import { formatPrice } from '../utils/format';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { key: 'telephones',  label: 'Téléphones',  icon: '📱' },
  { key: 'ordinateurs', label: 'Ordinateurs', icon: '💻' },
  { key: 'accessoires', label: 'Accessoires', icon: '🎧' },
  { key: 'gaming',      label: 'Gaming',      icon: '🎮' },
  { key: 'tv-audio',   label: 'TV & Audio',  icon: '📺' },
];

export default function HomeScreen({ navigation }: any) {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [promoProducts, setPromoProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { totalItems } = useCart();

  useEffect(() => {
    Promise.all([
      productApi.list({ sort: 'createdAt_desc', limit: 8 }),
      productApi.list({ badge: 'PROMO', limit: 6 }),
      categoryApi.list(),
    ]).then(([newRes, promoRes, cats]) => {
      setNewArrivals(newRes.products);
      setPromoProducts(promoRes.products);
      setCategories(cats.slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    if (search.trim()) navigation.navigate('Catalogue', { q: search.trim() });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient colors={['#020B3A', '#041459', '#020B3A']} style={styles.hero}>
        <View style={styles.heroContent}>
          <Text style={styles.heroBadge}>🚚 Livraison partout en Guinée</Text>
          <Text style={styles.heroTitle}>La tech à votre portée,{'\n'}
            <Text style={{ color: '#00D8D8' }}>au meilleur prix</Text>
          </Text>
          <Text style={styles.heroSub}>Téléphones, ordinateurs et accessoires high-tech de qualité.</Text>

          {/* Search */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un produit..."
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <Text style={{ color: '#fff', fontSize: 18 }}>🔍</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('Catalogue')}>
            <Text style={styles.heroBtnText}>Explorer le catalogue →</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[['500+', 'Produits'], ['50+', 'Marques'], ['10k+', 'Clients'], ['4.8★', 'Note']].map(([val, lbl]) => (
          <View key={lbl} style={styles.statItem}>
            <Text style={styles.statVal}>{val}</Text>
            <Text style={styles.statLbl}>{lbl}</Text>
          </View>
        ))}
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nos Catégories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {(categories.length > 0 ? categories.map(c => ({ key: c.slug, label: c.name, icon: c.icon || '📦' })) : CATEGORIES).map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={styles.catCard}
              onPress={() => navigation.navigate('Catalogue', { cat: cat.key })}
            >
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={styles.catLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Nouveautés */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nouveautés</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Catalogue')}>
            <Text style={styles.seeAll}>Voir tout →</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator color="#14b8a6" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.grid}>
            {newArrivals.slice(0, 4).map(p => (
              <ProductCard
                key={p.id} product={p}
                onPress={() => navigation.navigate('Produit', { slug: p.slug || p.id })}
              />
            ))}
          </View>
        )}
      </View>

      {/* Promo banner */}
      <View style={styles.promoBanner}>
        <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.promoBannerGrad}>
          <View>
            <Text style={styles.promoLabel}>OFFRE SPÉCIALE</Text>
            <Text style={styles.promoTitle}>Jusqu'à -25%</Text>
            <Text style={styles.promoSub}>Code : <Text style={styles.promoCode}>NOEL25</Text></Text>
          </View>
          <TouchableOpacity style={styles.promoCta} onPress={() => navigation.navigate('Catalogue')}>
            <Text style={styles.promoCtaText}>Profiter →</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Promos */}
      {promoProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.promoHead}>
              <Text style={styles.promoHeadText}>🔥 Promotions</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Catalogue', { badge: 'PROMO' })}>
              <Text style={[styles.seeAll, { color: '#ef4444' }]}>Voir tout →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {promoProducts.map(p => {
              const disc = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={styles.promoCard}
                  onPress={() => navigation.navigate('Produit', { slug: p.slug || p.id })}
                >
                  <View style={styles.promoCardImg}>
                    <Image source={{ uri: p.images[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    {disc > 0 && <View style={styles.discBadge}><Text style={styles.discText}>-{disc}%</Text></View>}
                  </View>
                  <View style={{ padding: 10 }}>
                    <Text style={{ fontSize: 10, color: '#ef4444', fontWeight: '700' }}>{p.brand}</Text>
                    <Text style={{ fontSize: 11, color: '#111', fontWeight: '600', marginTop: 2 }} numberOfLines={2}>{p.name}</Text>
                    <Text style={{ fontSize: 13, color: '#ef4444', fontWeight: '800', marginTop: 4 }}>{formatPrice(p.price)}</Text>
                    {p.originalPrice && <Text style={{ fontSize: 10, color: '#9ca3af', textDecorationLine: 'line-through' }}>{formatPrice(p.originalPrice)}</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Features */}
      <View style={[styles.section, { backgroundColor: '#f9fafb', padding: 20, marginHorizontal: 0 }]}>
        {[
          ['🚚', 'Livraison Rapide', '24-48h sur Conakry'],
          ['🔒', 'Paiement Sécurisé', 'Wave, Orange Money'],
          ['↩️', 'Retours Gratuits', '30 jours'],
          ['💬', 'Support 7j/7', 'Chat et téléphone'],
        ].map(([icon, title, desc]) => (
          <View key={title} style={styles.featureRow}>
            <Text style={{ fontSize: 28 }}>{icon}</Text>
            <View style={{ marginLeft: 14 }}>
              <Text style={{ fontWeight: '700', color: '#111', fontSize: 14 }}>{title}</Text>
              <Text style={{ color: '#6b7280', fontSize: 12 }}>{desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  hero: { paddingTop: 20, paddingBottom: 40, paddingHorizontal: 20 },
  heroContent: {},
  heroBadge: { color: '#00D8D8', fontSize: 12, fontWeight: '600', marginBottom: 12 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#fff', lineHeight: 36, marginBottom: 10 },
  heroSub: { color: '#bfdbfe', fontSize: 14, marginBottom: 20, lineHeight: 20 },
  searchRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  searchInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, color: '#111', fontSize: 14 },
  searchBtn: { backgroundColor: '#14b8a6', paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  heroBtn: { backgroundColor: '#22c55e', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  heroBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '900', color: '#14b8a6' },
  statLbl: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  section: { paddingHorizontal: 16, paddingTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 14 },
  seeAll: { fontSize: 13, color: '#14b8a6', fontWeight: '600' },
  catScroll: { marginBottom: 8 },
  catCard: {
    backgroundColor: '#1f2937', borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 20,
    marginRight: 12, alignItems: 'center', minWidth: 90,
  },
  catIcon: { fontSize: 28, marginBottom: 6 },
  catLabel: { color: '#fff', fontWeight: '700', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  promoBanner: { marginHorizontal: 16, marginTop: 24, borderRadius: 20, overflow: 'hidden' },
  promoBannerGrad: { padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  promoLabel: { color: '#fca5a5', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  promoTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginVertical: 4 },
  promoSub: { color: '#fca5a5', fontSize: 13 },
  promoCode: { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: '700', fontFamily: 'monospace' },
  promoCta: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  promoCtaText: { color: '#ef4444', fontWeight: '700', fontSize: 13 },
  promoHead: { backgroundColor: '#ef4444', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center' },
  promoHeadText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  promoCard: {
    width: 160, backgroundColor: '#fff', borderRadius: 16,
    marginRight: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  promoCardImg: { height: 130, backgroundColor: '#f9fafb', position: 'relative' },
  discBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#ef4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  discText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
});
