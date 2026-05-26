import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { productApi, Product } from '../api/api';
import { formatPrice } from '../utils/format';

export default function WishlistScreen({ navigation }: any) {
  const { user } = useAuth();
  const { ids, toggle } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (ids.length === 0) { setProducts([]); return; }
    setLoading(true);
    productApi.getWishlist()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [user, ids.join(',')]);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 50 }}>❤️</Text>
        <Text style={styles.centerTitle}>Connectez-vous</Text>
        <Text style={styles.centerSub}>Pour sauvegarder vos produits favoris</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Auth', { screen: 'Connexion' })}>
          <Text style={styles.loginBtnText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) return <ActivityIndicator color="#14b8a6" style={{ flex: 1, marginTop: 60 }} />;

  if (products.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 56 }}>❤️</Text>
        <Text style={styles.centerTitle}>Wishlist vide</Text>
        <Text style={styles.centerSub}>Cliquez sur le cœur d'un produit pour l'ajouter</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Catalogue')}>
          <Text style={styles.loginBtnText}>Découvrir les produits</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.count}>{products.length} produit{products.length > 1 ? 's' : ''} dans votre wishlist</Text>
      <FlatList
        data={products}
        keyExtractor={p => p.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const disc = item.originalPrice ? Math.round((1 - item.price / item.originalPrice) * 100) : 0;
          return (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.imgContainer}
                onPress={() => navigation.navigate('Produit', { slug: item.slug || item.id })}
              >
                <Image source={{ uri: item.images[0] }} style={styles.img} resizeMode="contain" />
                {disc > 0 && <View style={styles.discBadge}><Text style={styles.discText}>-{disc}%</Text></View>}
              </TouchableOpacity>
              <View style={styles.info}>
                <Text style={styles.brand}>{item.brand}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Produit', { slug: item.slug || item.id })}>
                  <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                </TouchableOpacity>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{formatPrice(item.price)}</Text>
                  {item.originalPrice && <Text style={styles.oldPrice}>{formatPrice(item.originalPrice)}</Text>}
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.addBtn, item.stock === 0 && styles.addBtnDisabled]}
                    onPress={() => item.stock > 0 && addItem(item)}
                    disabled={item.stock === 0}
                  >
                    <Text style={[styles.addBtnText, item.stock === 0 && { color: '#9ca3af' }]}>
                      {item.stock === 0 ? 'Rupture' : 'Ajouter au panier'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.removeBtn} onPress={() => toggle(item.id)}>
                    <Text style={styles.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  centerTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginTop: 16 },
  centerSub: { color: '#6b7280', marginTop: 8, textAlign: 'center' },
  loginBtn: { backgroundColor: '#14b8a6', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 13, marginTop: 24 },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  count: { paddingHorizontal: 16, paddingTop: 12, fontSize: 13, color: '#6b7280' },
  card: { backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row', padding: 12, marginBottom: 12, alignItems: 'center' },
  imgContainer: { width: 90, height: 90, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f9fafb', position: 'relative' },
  img: { width: '100%', height: '100%' },
  discBadge: { position: 'absolute', top: 4, left: 4, backgroundColor: '#ef4444', borderRadius: 6, paddingHorizontal: 4, paddingVertical: 2 },
  discText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  info: { flex: 1, marginLeft: 14 },
  brand: { fontSize: 11, color: '#14b8a6', fontWeight: '700', textTransform: 'uppercase' },
  name: { fontSize: 13, fontWeight: '600', color: '#111', marginTop: 3, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  price: { fontSize: 15, fontWeight: '800', color: '#111' },
  oldPrice: { fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  addBtn: { flex: 1, backgroundColor: '#14b8a6', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  addBtnDisabled: { backgroundColor: '#e5e7eb' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  removeBtn: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: '#fca5a5', alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: '#ef4444', fontWeight: '700' },
});
