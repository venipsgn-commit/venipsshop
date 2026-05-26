import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Product } from '../api/api';
import { formatPrice } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface Props {
  product: Product;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: Props) {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const wished = has(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.images[0] }} style={styles.image} resizeMode="cover" />
        {discount && discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        )}
        {product.badge && (
          <View style={[styles.badge, { backgroundColor: getBadgeColor(product.badge) }]}>
            <Text style={styles.badgeText}>{product.badge}</Text>
          </View>
        )}
        <TouchableOpacity style={[styles.wishBtn, wished && styles.wishBtnActive]} onPress={() => toggle(product.id)}>
          <Text style={{ fontSize: 14 }}>{wished ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
        {product.stock > 0 && product.stock <= 5 && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>⚡ {product.stock} restants</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        {/* Stars */}
        <View style={styles.stars}>
          {[1,2,3,4,5].map(s => (
            <Text key={s} style={{ fontSize: 10, color: s <= Math.round(product.rating) ? '#facc15' : '#d1d5db' }}>★</Text>
          ))}
          <Text style={styles.reviewCount}>({product.reviewCount})</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          {product.originalPrice && (
            <Text style={styles.oldPrice}>{formatPrice(product.originalPrice)}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.addBtn, product.stock === 0 && styles.addBtnDisabled]}
          onPress={() => product.stock > 0 && addItem(product)}
          disabled={product.stock === 0}
        >
          <Text style={styles.addBtnText}>{product.stock === 0 ? 'Rupture' : '+ Panier'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function getBadgeColor(badge: string): string {
  const map: Record<string, string> = {
    Nouveau: '#10b981', NOUVEAU: '#10b981',
    Promo: '#ef4444', PROMO: '#ef4444',
    Populaire: '#3b82f6', POPULAIRE: '#3b82f6',
    Gaming: '#7c3aed', GAMING: '#7c3aed',
  };
  return map[badge] || '#374151';
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    height: 160,
    backgroundColor: '#f9fafb',
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 20,
  },
  discountText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  badge: {
    position: 'absolute', top: 8, left: 8,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 20,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  wishBtn: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20, width: 30, height: 30,
    alignItems: 'center', justifyContent: 'center',
  },
  wishBtnActive: { backgroundColor: '#fee2e2' },
  stockBadge: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(20,184,166,0.9)',
    paddingVertical: 3,
  },
  stockText: { color: '#fff', fontSize: 10, textAlign: 'center', fontWeight: '600' },
  info: { padding: 10 },
  brand: { fontSize: 10, color: '#14b8a6', fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  name: { fontSize: 12, color: '#111827', fontWeight: '600', marginBottom: 4, lineHeight: 17 },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 1, marginBottom: 6 },
  reviewCount: { fontSize: 9, color: '#9ca3af', marginLeft: 3 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  price: { fontSize: 14, fontWeight: '800', color: '#111827' },
  oldPrice: { fontSize: 11, color: '#9ca3af', textDecorationLine: 'line-through' },
  addBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 10, paddingVertical: 7,
    alignItems: 'center',
  },
  addBtnDisabled: { backgroundColor: '#e5e7eb' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
