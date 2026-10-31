import { useState } from 'react';
import { Image, ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { s } from './login';

export default function Signup() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name || !email || password.length < 4) return setError('Fill all fields (password min 4 chars)');
    setError('');
    setBusy(true);
    try {
      await signup(name, email, password);
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

      <Text style={s.label}>Name</Text>
      <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Full name" />

      <Text style={s.label}>Email</Text>
      <TextInput style={s.input} value={email} onChangeText={setEmail}
        placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" />

      <Text style={s.label}>Password</Text>
      <TextInput style={s.input} value={password} onChangeText={setPassword}
        placeholder="Password" secureTextEntry />

      {!!error && <Text style={s.error}>{error}</Text>}

      <Pressable style={s.button} onPress={submit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Sign up</Text>}
      </Pressable>

      <Text style={s.foot}>
        Already registered? <Link href="/login" style={s.link}>Log in</Link>
      </Text>
    </View>
  );
}