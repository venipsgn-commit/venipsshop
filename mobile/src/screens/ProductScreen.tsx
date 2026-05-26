import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { productApi, Product } from '../api/api';
import { formatPrice } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

const { width } = Dimensions.get('window');

export default function ProductScreen({ route, navigation }: any) {
  const { slug } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();

  useEffect(() => {
    setLoading(true);
    productApi.get(slug)
      .then(setProduct)
      .catch(() => navigation.goBack())
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <ActivityIndicator color="#14b8a6" style={{ flex: 1, marginTop: 80 }} />;
  if (!product) return null;

  const inWishlist = has(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Gallery */}
        <View style={styles.gallery}>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => setActiveImg(Math.round(e.nativeEvent.contentOffset.x / width))}
          >
            {product.images.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={{ width, height: 320 }} resizeMode="contain" />
            ))}
          </ScrollView>
          {/* Dots */}
          {product.images.length > 1 && (
            <View style={styles.dots}>
              {product.images.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeImg && styles.dotActive]} />
              ))}
            </View>
          )}
          {/* Badges */}
          <View style={styles.badges}>
            {product.badge && (
              <View style={[styles.badge, { backgroundColor: getBadgeColor(product.badge) }]}>
                <Text style={styles.badgeText}>{product.badge}</Text>
              </View>
            )}
            {discount > 0 && (
              <View style={[styles.badge, { backgroundColor: '#ef4444' }]}>
                <Text style={styles.badgeText}>-{discount}%</Text>
              </View>
            )}
          </View>
          {/* Wishlist */}
          <TouchableOpacity style={styles.wishBtn} onPress={() => toggle(product.id)}>
            <Text style={{ fontSize: 22 }}>{inWishlist ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Info */}
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1,2,3,4,5].map(s => (
                <Text key={s} style={{ fontSize: 14, color: s <= Math.round(product.rating) ? '#facc15' : '#d1d5db' }}>★</Text>
              ))}
            </View>
            <Text style={styles.ratingText}>{product.rating} · {product.reviewCount} avis</Text>
            <View style={[styles.stockTag, { backgroundColor: product.stock > 10 ? '#dcfce7' : product.stock > 0 ? '#fef9c3' : '#fee2e2' }]}>
              <Text style={[styles.stockText, { color: product.stock > 10 ? '#16a34a' : product.stock > 0 ? '#ca8a04' : '#dc2626' }]}>
                {product.stock > 10 ? '● En stock' : product.stock > 0 ? `⚡ ${product.stock} restants` : '● Rupture'}
              </Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.originalPrice && <Text style={styles.oldPrice}>{formatPrice(product.originalPrice)}</Text>}
            {discount > 0 && <View style={styles.discBadge}><Text style={styles.discText}>-{discount}%</Text></View>}
          </View>
          {product.originalPrice && (
            <Text style={styles.saving}>Vous économisez {formatPrice(product.originalPrice - product.price)} 🎉</Text>
          )}

          {product.shortDesc && <Text style={styles.shortDesc}>{product.shortDesc}</Text>}

          {/* Features */}
          {product.features.slice(0, 4).map(f => (
            <View key={f} style={styles.featureItem}>
              <View style={styles.featureCheck}><Text style={{ fontSize: 10, color: '#14b8a6', fontWeight: '700' }}>✓</Text></View>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}

          {/* Qty + Add */}
          <View style={styles.actions}>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyVal}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.min(product.stock, q + 1))}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.addBtn, (product.stock === 0 || added) && { backgroundColor: added ? '#10b981' : '#e5e7eb' }]}
              onPress={handleAddToCart}
              disabled={product.stock === 0}
            >
              <Text style={[styles.addBtnText, product.stock === 0 && { color: '#9ca3af' }]}>
                {added ? '✓ Ajouté !' : product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Garanties */}
          <View style={styles.guarantees}>
            {[['🔒', 'Paiement sécurisé'], ['🚚', 'Livraison Guinée'], ['↩️', 'Retours 30j']].map(([icon, label]) => (
              <View key={label} style={styles.guarantee}>
                <Text style={{ fontSize: 22 }}>{icon}</Text>
                <Text style={styles.guaranteeText}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {(['desc', 'specs', 'reviews'] as const).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'desc' ? 'Description' : tab === 'specs' ? 'Caractéristiques' : `Avis (${product.reviews?.length ?? 0})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab content */}
          <View style={styles.tabContent}>
            {activeTab === 'desc' && (
              <View>
                <Text style={styles.descText}>{product.description}</Text>
                {product.features.length > 0 && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={styles.subTitle}>Points forts</Text>
                    {product.features.map(f => (
                      <View key={f} style={[styles.featureItem, { backgroundColor: '#f0fdfa', borderRadius: 10, padding: 10, marginBottom: 6 }]}>
                        <View style={styles.featureCheck}><Text style={{ fontSize: 10, color: '#14b8a6', fontWeight: '700' }}>✓</Text></View>
                        <Text style={styles.featureText}>{f}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
            {activeTab === 'specs' && (
              <View>
                {Object.entries(product.specs).length === 0 ? (
                  <Text style={{ color: '#9ca3af', textAlign: 'center', paddingVertical: 20 }}>Aucune caractéristique disponible.</Text>
                ) : Object.entries(product.specs).map(([key, val], i) => (
                  <View key={key} style={[styles.specRow, { backgroundColor: i % 2 === 0 ? '#f9fafb' : '#fff' }]}>
                    <Text style={styles.specKey}>{key}</Text>
                    <Text style={styles.specVal}>{String(val)}</Text>
                  </View>
                ))}
              </View>
            )}
            {activeTab === 'reviews' && (
              <View>
                {(product.reviews ?? []).length === 0 ? (
                  <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                    <Text style={{ fontSize: 40 }}>💬</Text>
                    <Text style={{ color: '#6b7280', marginTop: 8 }}>Aucun avis pour le moment</Text>
                  </View>
                ) : (product.reviews ?? []).map(r => (
                  <View key={r.id} style={styles.review}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{r.user ? r.user.prenom[0] : 'C'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewName}>{r.user ? `${r.user.prenom} ${r.user.nom}` : 'Client'}</Text>
                        <View style={{ flexDirection: 'row' }}>
                          {[1,2,3,4,5].map(s => <Text key={s} style={{ color: s <= r.rating ? '#facc15' : '#d1d5db', fontSize: 12 }}>★</Text>)}
                        </View>
                      </View>
                      <Text style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</Text>
                    </View>
                    {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function getBadgeColor(badge: string): string {
  const map: Record<string, string> = {
    Nouveau: '#10b981', NOUVEAU: '#10b981',
    Promo: '#ef4444', PROMO: '#ef4444',
    Populaire: '#3b82f6', POPULAIRE: '#3b82f6',
  };
  return map[badge] || '#374151';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  gallery: { backgroundColor: '#f9fafb', position: 'relative' },
  dots: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#d1d5db', marginHorizontal: 3 },
  dotActive: { width: 16, backgroundColor: '#14b8a6' },
  badges: { position: 'absolute', top: 16, left: 16, gap: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  wishBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 24, padding: 8 },
  body: { padding: 20 },
  brand: { fontSize: 12, color: '#14b8a6', fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  name: { fontSize: 22, fontWeight: '800', color: '#111', lineHeight: 30, marginBottom: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  stars: { flexDirection: 'row' },
  ratingText: { fontSize: 13, color: '#6b7280' },
  stockTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  stockText: { fontSize: 11, fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  price: { fontSize: 30, fontWeight: '900', color: '#111' },
  oldPrice: { fontSize: 16, color: '#9ca3af', textDecorationLine: 'line-through' },
  discBadge: { backgroundColor: '#ef4444', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  discText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  saving: { color: '#16a34a', fontSize: 13, fontWeight: '600', marginBottom: 16 },
  shortDesc: { color: '#4b5563', fontSize: 14, lineHeight: 22, marginBottom: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  featureCheck: { width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(20,184,166,0.1)', alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1, fontSize: 13, color: '#374151' },
  actions: { marginTop: 20, gap: 12 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, overflow: 'hidden', alignSelf: 'flex-start' },
  qtyBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 22, color: '#374151', fontWeight: '300' },
  qtyVal: { paddingHorizontal: 16, fontSize: 16, fontWeight: '700', color: '#111' },
  addBtn: { backgroundColor: '#22c55e', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  guarantees: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, padding: 16, backgroundColor: '#f9fafb', borderRadius: 14 },
  guarantee: { alignItems: 'center', gap: 4 },
  guaranteeText: { fontSize: 11, color: '#374151', fontWeight: '600', textAlign: 'center' },
  tabs: { flexDirection: 'row', marginTop: 24, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#14b8a6' },
  tabText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  tabTextActive: { color: '#14b8a6', fontWeight: '700' },
  tabContent: { paddingVertical: 16 },
  descText: { fontSize: 14, color: '#374151', lineHeight: 22 },
  subTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 10 },
  specRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 4 },
  specKey: { flex: 2, fontSize: 13, fontWeight: '600', color: '#374151' },
  specVal: { flex: 3, fontSize: 13, color: '#6b7280' },
  review: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 14, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#14b8a6', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  reviewName: { fontWeight: '600', fontSize: 14, color: '#111' },
  reviewComment: { fontSize: 13, color: '#4b5563', lineHeight: 20 },
});
