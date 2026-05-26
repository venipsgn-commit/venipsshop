import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { orderApi, Order } from '../api/api';
import { formatPrice, formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '../utils/format';

export default function AccountScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (user) {
      setLoadingOrders(true);
      orderApi.myOrders().then(r => setOrders(r.orders)).catch(() => {}).finally(() => setLoadingOrders(false));
    }
  }, [user]);

  if (!user) {
    return (
      <View style={styles.notLogged}>
        <Text style={{ fontSize: 64 }}>👤</Text>
        <Text style={styles.notLoggedTitle}>Connectez-vous</Text>
        <Text style={styles.notLoggedSub}>Pour accéder à votre compte, commandes et wishlist</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Auth', { screen: 'Connexion' })}>
          <Text style={styles.loginBtnText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Auth', { screen: 'Inscription' })}>
          <Text style={styles.registerBtnText}>Créer un compte</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.prenom[0]}{user.nom[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{user.prenom} {user.nom}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.telephone && <Text style={styles.userPhone}>📞 {user.telephone}</Text>}
        </View>
        {user.role === 'ADMIN' && (
          <View style={styles.adminBadge}><Text style={styles.adminText}>Admin</Text></View>
        )}
      </View>

      {/* Quick actions */}
      <View style={styles.quickActions}>
        {[
          { icon: '❤️', label: 'Wishlist', onPress: () => navigation.navigate('Wishlist') },
          { icon: '📦', label: 'Commandes', onPress: () => {} },
          { icon: '📍', label: 'Adresses', onPress: () => {} },
          { icon: '🔒', label: 'Sécurité', onPress: () => {} },
        ].map(({ icon, label, onPress }) => (
          <TouchableOpacity key={label} style={styles.quickAction} onPress={onPress}>
            <Text style={{ fontSize: 26 }}>{icon}</Text>
            <Text style={styles.quickLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes dernières commandes</Text>
        {loadingOrders ? (
          <Text style={{ color: '#9ca3af', textAlign: 'center', padding: 20 }}>Chargement...</Text>
        ) : orders.length === 0 ? (
          <View style={styles.emptyOrders}>
            <Text style={{ fontSize: 40 }}>📦</Text>
            <Text style={{ color: '#6b7280', marginTop: 8 }}>Aucune commande pour l'instant</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Catalogue')}>
              <Text style={{ color: '#14b8a6', fontWeight: '600', marginTop: 12 }}>Commencer vos achats →</Text>
            </TouchableOpacity>
          </View>
        ) : orders.slice(0, 5).map(order => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
              <View style={[styles.statusBadge, { backgroundColor: ORDER_STATUS_COLOR[order.status] + '20' }]}>
                <Text style={[styles.statusText, { color: ORDER_STATUS_COLOR[order.status] }]}>
                  {ORDER_STATUS_LABEL[order.status]}
                </Text>
              </View>
            </View>
            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
            <View style={styles.orderItems}>
              {order.items.slice(0, 3).map(item => (
                <Text key={item.id} style={styles.orderItemText} numberOfLines={1}>
                  · {item.name} ×{item.quantity}
                </Text>
              ))}
              {order.items.length > 3 && <Text style={{ color: '#9ca3af', fontSize: 12 }}>et {order.items.length - 3} autres...</Text>}
            </View>
            <View style={styles.orderFooter}>
              <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
              <Text style={styles.payMethod}>{order.paymentMethod.replace('_', ' ')}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Se déconnecter</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  notLogged: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  notLoggedTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginTop: 16 },
  notLoggedSub: { color: '#6b7280', marginTop: 8, textAlign: 'center', lineHeight: 22 },
  loginBtn: { backgroundColor: '#14b8a6', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, marginTop: 24, width: '100%', alignItems: 'center' },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  registerBtn: { borderWidth: 2, borderColor: '#14b8a6', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 13, marginTop: 12, width: '100%', alignItems: 'center' },
  registerBtnText: { color: '#14b8a6', fontWeight: '700', fontSize: 16 },
  profileCard: { backgroundColor: '#fff', margin: 16, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#14b8a6', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 22 },
  userName: { fontSize: 18, fontWeight: '700', color: '#111' },
  userEmail: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  userPhone: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  adminBadge: { backgroundColor: '#ccfbf1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  adminText: { color: '#0f766e', fontWeight: '700', fontSize: 12 },
  quickActions: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 20, padding: 16, justifyContent: 'space-around' },
  quickAction: { alignItems: 'center', gap: 6 },
  quickLabel: { fontSize: 12, color: '#374151', fontWeight: '500' },
  section: { margin: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#111', marginBottom: 14 },
  emptyOrders: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  orderCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderNumber: { fontWeight: '700', fontSize: 15, color: '#111' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderDate: { fontSize: 12, color: '#9ca3af', marginBottom: 10 },
  orderItems: { gap: 2, marginBottom: 10 },
  orderItemText: { fontSize: 13, color: '#6b7280' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10 },
  orderTotal: { fontWeight: '800', fontSize: 16, color: '#111' },
  payMethod: { fontSize: 12, color: '#9ca3af' },
  logoutBtn: { marginHorizontal: 16, borderWidth: 1, borderColor: '#fca5a5', borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: '#fff' },
  logoutText: { color: '#ef4444', fontWeight: '700', fontSize: 15 },
});
