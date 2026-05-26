import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet, Alert, TextInput,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';
import { orderApi, promoApi } from '../api/api';

export default function CartScreen({ navigation }: any) {
  const { items, removeItem, updateQty, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountAmt, setDiscountAmt] = useState(0);
  const [payMethod, setPayMethod] = useState<'WAVE' | 'ORANGE_MONEY' | 'ESPECES'>('WAVE');
  const [loading, setLoading] = useState(false);

  const shipping = totalPrice > 500000 ? 0 : 50000;
  const finalTotal = totalPrice - discountAmt + shipping;

  const validatePromo = async () => {
    try {
      const res = await (promoApi as any).validate(promoCode, totalPrice);
      if (res.valid) {
        setDiscount(res.discount);
        setDiscountAmt(res.discountAmount ?? Math.round(totalPrice * res.discount / 100));
        Alert.alert('✅ Code appliqué', `Réduction de ${res.discount}%`);
      } else {
        Alert.alert('❌ Code invalide', 'Ce code promo n\'est pas valide.');
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de valider le code promo.');
    }
  };

  const placeOrder = async () => {
    if (!user) { navigation.navigate('Auth', { screen: 'Connexion' }); return; }
    if (items.length === 0) return;

    setLoading(true);
    try {
      const order = await orderApi.create({
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        paymentMethod: payMethod,
        promoCode: promoCode || undefined,
      });
      clearCart();
      Alert.alert('✅ Commande passée !', `Numéro : ${order.orderNumber}`, [
        { text: 'Voir mes commandes', onPress: () => navigation.navigate('Compte', { screen: 'Commandes' }) },
        { text: 'OK' },
      ]);
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Impossible de passer la commande.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ fontSize: 64 }}>🛒</Text>
        <Text style={styles.emptyTitle}>Votre panier est vide</Text>
        <Text style={styles.emptySub}>Ajoutez des produits depuis le catalogue</Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Catalogue')}>
          <Text style={styles.emptyBtnText}>Découvrir nos produits</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Items */}
      {items.map(({ product, quantity }) => (
        <View key={product.id} style={styles.item}>
          <Image source={{ uri: product.images[0] }} style={styles.itemImg} resizeMode="contain" />
          <View style={styles.itemInfo}>
            <Text style={styles.itemBrand}>{product.brand}</Text>
            <Text style={styles.itemName} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.itemPrice}>{formatPrice(product.price)}</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(product.id, quantity - 1)}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyVal}>{quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(product.id, quantity + 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(product.id)}>
                <Text style={styles.removeBtnText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.itemTotal}>{formatPrice(product.price * quantity)}</Text>
        </View>
      ))}

      {/* Promo */}
      <View style={styles.promoSection}>
        <Text style={styles.sectionTitle}>Code promo</Text>
        <View style={styles.promoRow}>
          <TextInput
            style={styles.promoInput}
            placeholder="NOEL25"
            value={promoCode}
            onChangeText={setPromoCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.promoBtn} onPress={validatePromo}>
            <Text style={styles.promoBtnText}>Appliquer</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment method */}
      <View style={styles.paySection}>
        <Text style={styles.sectionTitle}>Mode de paiement</Text>
        {(['WAVE', 'ORANGE_MONEY', 'ESPECES'] as const).map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.payOption, payMethod === m && styles.payOptionActive]}
            onPress={() => setPayMethod(m)}
          >
            <View style={[styles.radio, payMethod === m && styles.radioActive]} />
            <Text style={styles.payLabel}>
              {m === 'WAVE' ? '📱 Wave' : m === 'ORANGE_MONEY' ? '🟠 Orange Money' : '💵 Espèces'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Récapitulatif</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sous-total</Text>
          <Text style={styles.summaryVal}>{formatPrice(totalPrice)}</Text>
        </View>
        {discountAmt > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: '#16a34a' }]}>Réduction ({discount}%)</Text>
            <Text style={[styles.summaryVal, { color: '#16a34a' }]}>-{formatPrice(discountAmt)}</Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Livraison</Text>
          <Text style={styles.summaryVal}>{shipping === 0 ? 'Gratuit' : formatPrice(shipping)}</Text>
        </View>
        <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 12, marginTop: 4 }]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalVal}>{formatPrice(finalTotal)}</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.orderBtn, loading && { opacity: 0.7 }]} onPress={placeOrder} disabled={loading}>
        <Text style={styles.orderBtnText}>{loading ? 'Traitement...' : '✅ Commander maintenant'}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginTop: 16 },
  emptySub: { color: '#6b7280', marginTop: 8, textAlign: 'center' },
  emptyBtn: { backgroundColor: '#14b8a6', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 13, marginTop: 24 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  item: { backgroundColor: '#fff', flexDirection: 'row', padding: 14, marginBottom: 1, alignItems: 'center' },
  itemImg: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#f3f4f6' },
  itemInfo: { flex: 1, marginHorizontal: 12 },
  itemBrand: { fontSize: 10, color: '#14b8a6', fontWeight: '700', textTransform: 'uppercase' },
  itemName: { fontSize: 13, fontWeight: '600', color: '#111', marginVertical: 3 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#111' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 18, color: '#374151', lineHeight: 22 },
  qtyVal: { fontSize: 15, fontWeight: '700', color: '#111', minWidth: 20, textAlign: 'center' },
  removeBtn: { marginLeft: 8 },
  removeBtnText: { fontSize: 18 },
  itemTotal: { fontSize: 14, fontWeight: '800', color: '#111' },
  promoSection: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 12 },
  promoRow: { flexDirection: 'row', gap: 10 },
  promoInput: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontFamily: 'monospace', fontSize: 14 },
  promoBtn: { backgroundColor: '#0f172a', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  promoBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  paySection: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 16 },
  payOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 12 },
  payOptionActive: { backgroundColor: '#f0fdfa' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#d1d5db' },
  radioActive: { borderColor: '#14b8a6', backgroundColor: '#14b8a6' },
  payLabel: { fontSize: 14, color: '#111', fontWeight: '500' },
  summary: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16 },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: '#6b7280' },
  summaryVal: { fontSize: 14, fontWeight: '600', color: '#111' },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#111' },
  totalVal: { fontSize: 20, fontWeight: '900', color: '#111' },
  orderBtn: { backgroundColor: '#22c55e', marginHorizontal: 16, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  orderBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
