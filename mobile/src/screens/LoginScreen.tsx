import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Erreur', 'Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigation.getParent()?.goBack();
    } catch (e: any) {
      Alert.alert('Connexion échouée', e.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient colors={['#020B3A', '#041459']} style={styles.header}>
          <Text style={styles.logo}>Venips</Text>
          <Text style={styles.subtitle}>La tech à votre portée</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.title}>Connexion</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="votre@email.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Inscription')} style={styles.switchRow}>
            <Text style={styles.switchText}>Pas de compte ? <Text style={styles.switchLink}>Créer un compte</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
  logo: { fontSize: 36, fontWeight: '900', color: '#00D8D8' },
  subtitle: { color: '#bfdbfe', fontSize: 14, marginTop: 6 },
  form: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20, padding: 28 },
  title: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 24 },
  field: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#111' },
  btn: { backgroundColor: '#14b8a6', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switchRow: { marginTop: 20, alignItems: 'center' },
  switchText: { fontSize: 14, color: '#6b7280' },
  switchLink: { color: '#14b8a6', fontWeight: '700' },
});
