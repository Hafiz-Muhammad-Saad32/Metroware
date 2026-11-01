import { useState } from 'react';
import { Image, ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !password) return setError('Email and password are required');
    setError('');
    setBusy(true);
    try {
      await login(email, password);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={s.screen}>
      <Image
        source={require('../../assets/images/logo-full.png')}
        style={{ width: 240, height: 151, alignSelf: 'center', marginBottom: 12 }}
        resizeMode="contain"
      />
      <Text style={s.sub}>Sign in to book tickets and track bus routes.</Text>

      <Text style={s.label}>Email</Text>
      <TextInput style={s.input} value={email} onChangeText={setEmail}
        placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" />

      <Text style={s.label}>Password</Text>
      <TextInput style={s.input} value={password} onChangeText={setPassword}
        placeholder="Password" secureTextEntry />

      {!!error && <Text style={s.error}>{error}</Text>}

      <Pressable style={s.button} onPress={submit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Log in</Text>}
      </Pressable>

      <Text style={s.foot}>
        No account? <Link href="/signup" style={s.link}>Sign up</Link>
      </Text>
    </View>
  );
}

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F5', padding: 24, justifyContent: 'center' },
  brand: { fontSize: 36, fontWeight: '700', color: '#0B7A5E', marginBottom: 6 },
  sub: { fontSize: 14, color: '#4A5A55', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#10201C', marginBottom: 6 },
  input: {
    height: 48, borderWidth: 1, borderColor: '#9FB0AA', borderRadius: 12,
    paddingHorizontal: 14, fontSize: 16, backgroundColor: '#fff', marginBottom: 16
  },
  error: { color: '#B3261E', marginBottom: 12 },
  button: {
    height: 52, borderRadius: 12, backgroundColor: '#0B7A5E',
    alignItems: 'center', justifyContent: 'center', marginTop: 4
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  foot: { textAlign: 'center', marginTop: 20, color: '#4A5A55' },
  link: { color: '#0B7A5E', fontWeight: '600' },
  hint: { textAlign: 'center', marginTop: 12, fontSize: 12, color: '#7A8A85' },
});