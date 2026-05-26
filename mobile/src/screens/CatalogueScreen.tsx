import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  FlatList, StyleSheet, ActivityIndicator, Dimensions,
} from 'react-native';
import { productApi, categoryApi, Product, Category } from '../api/api';
import ProductCard from '../components/ProductCard';

const SORTS = [
  { value: 'createdAt_desc', label: 'Nouveautés' },
  { value: 'price_asc',      label: 'Prix ↑' },
  { value: 'price_desc',     label: 'Prix ↓' },
  { value: 'rating_desc',    label: 'Mieux notés' },
];

export default function CatalogueScreen({ route, navigation }: any) {
  const initCat   = route.params?.cat   ?? 'all';
  const initQ     = route.params?.q     ?? '';
  const initBadge = route.params?.badge ?? '';

  const [q,          setQ]          = useState(initQ);
  const [searchText, setSearchText] = useState(initQ);
  const [cat,        setCat]        = useState(initCat);
  const [sort,       setSort]       = useState('createdAt_desc');
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);

  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => {});
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params: Record<string, string | number> = { page, limit: 12, sort };
    if (cat !== 'all') params.category = cat;
    if (q.trim())      params.search   = q.trim();
    if (initBadge)     params.badge    = initBadge;

    productApi.list(params)
      .then(res => {
        setProducts(res.products);
        setTotalPages(res.pagination.pages);
        setTotal(res.pagination.total);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [cat, q, sort, page, initBadge]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = () => { setQ(searchText); setPage(1); };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={{ color: '#fff' }}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={{ paddingHorizontal: 16 }}>
        <TouchableOpacity
          style={[styles.tab, cat === 'all' && styles.tabActive]}
          onPress={() => { setCat('all'); setPage(1); }}
        >
          <Text style={[styles.tabText, cat === 'all' && styles.tabTextActive]}>Tout</Text>
        </TouchableOpacity>
        {categories.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[styles.tab, cat === c.slug && styles.tabActive]}
            onPress={() => { setCat(c.slug); setPage(1); }}
          >
            <Text style={[styles.tabText, cat === c.slug && styles.tabTextActive]}>{c.icon} {c.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sorts} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {SORTS.map(s => (
          <TouchableOpacity
            key={s.value}
            style={[styles.sortBtn, sort === s.value && styles.sortBtnActive]}
            onPress={() => { setSort(s.value); setPage(1); }}
          >
            <Text style={[styles.sortText, sort === s.value && styles.sortTextActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.totalText}>{total} produit{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}</Text>

      {/* Products grid */}
      {loading ? (
        <ActivityIndicator color="#14b8a6" style={{ marginTop: 40 }} />
      ) : products.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>🔍</Text>
          <Text style={styles.emptyText}>Aucun produit trouvé</Text>
          <TouchableOpacity onPress={() => { setCat('all'); setQ(''); setSearchText(''); }}>
            <Text style={styles.resetBtn}>Réinitialiser les filtres</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={p => p.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('Produit', { slug: item.slug || item.id })}
            />
          )}
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={styles.pagination}>
                <TouchableOpacity
                  onPress={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={[styles.pageBtn, page === 1 && { opacity: 0.4 }]}
                >
                  <Text style={styles.pageBtnText}>← Précédent</Text>
                </TouchableOpacity>
                <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
                <TouchableOpacity
                  onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={[styles.pageBtn, page === totalPages && { opacity: 0.4 }]}
                >
                  <Text style={styles.pageBtnText}>Suivant →</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  searchBar: { flexDirection: 'row', margin: 16, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  searchInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 11, color: '#111', fontSize: 14 },
  searchBtn: { backgroundColor: '#14b8a6', paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  tabs: { maxHeight: 44, marginBottom: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  tabActive: { backgroundColor: '#14b8a6', borderColor: '#14b8a6' },
  tabText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  sorts: { maxHeight: 38, marginBottom: 8 },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  sortBtnActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  sortText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  sortTextActive: { color: '#fff', fontWeight: '700' },
  totalText: { paddingHorizontal: 16, fontSize: 12, color: '#6b7280', marginBottom: 4 },
  row: { justifyContent: 'space-between' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#111', marginTop: 12 },
  resetBtn: { color: '#14b8a6', fontWeight: '600', marginTop: 12, fontSize: 14 },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  pageBtn: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  pageBtnText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  pageInfo: { fontSize: 13, color: '#6b7280' },
});
