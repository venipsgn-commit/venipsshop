import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [prenom, setPrenom]     = useState('');
  const [nom, setNom]           = useState('');
  const [email, setEmail]       = useState('');
  const [telephone, setTel]     = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);

  const handleRegister = async () => {
    if (!prenom || !nom || !email || !password) { Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires.'); return; }
    if (password !== confirm) { Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.'); return; }
    if (password.length < 6) { Alert.alert('Erreur', 'Le mot de passe doit faire au moins 6 caractères.'); return; }

    setLoading(true);
    try {
      await register({ prenom, nom, email: email.trim(), password, telephone: telephone || undefined });
      navigation.getParent()?.goBack();
    } catch (e: any) {
      Alert.alert('Inscription échouée', e.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient colors={['#020B3A', '#041459']} style={styles.header}>
          <Text style={styles.logo}>Venips</Text>
          <Text style={styles.subtitle}>Créer votre compte</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.title}>Inscription</Text>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Prénom *</Text>
              <TextInput style={styles.input} placeholder="Jean" placeholderTextColor="#9ca3af" value={prenom} onChangeText={setPrenom} />
            </View>
            <View style={{ width: 12 }} />
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Nom *</Text>
              <TextInput style={styles.input} placeholder="Diallo" placeholderTextColor="#9ca3af" value={nom} onChangeText={setNom} />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email *</Text>
            <TextInput style={styles.input} placeholder="votre@email.com" placeholderTextColor="#9ca3af" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput style={styles.input} placeholder="+224 620 00 00 00" placeholderTextColor="#9ca3af" value={telephone} onChangeText={setTel} keyboardType="phone-pad" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mot de passe *</Text>
            <TextInput style={styles.input} placeholder="Min. 6 caractères" placeholderTextColor="#9ca3af" value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirmer le mot de passe *</Text>
            <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#9ca3af" value={confirm} onChangeText={setConfirm} secureTextEntry />
          </View>

          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Création...' : "Créer mon compte"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Connexion')} style={styles.switchRow}>
            <Text style={styles.switchText}>Déjà un compte ? <Text style={styles.switchLink}>Se connecter</Text></Text>
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
  row: { flexDirection: 'row' },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#111' },
  btn: { backgroundColor: '#14b8a6', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switchRow: { marginTop: 20, alignItems: 'center' },
  switchText: { fontSize: 14, color: '#6b7280' },
  switchLink: { color: '#14b8a6', fontWeight: '700' },
});
