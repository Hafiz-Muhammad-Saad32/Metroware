import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';
import { changePassword, updateProfile } from '../services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuth();

  const [name, setName] = useState(user?.userName ?? '');
  const [email, setEmail] = useState(user?.userEmail ?? '');
  const [infoMsg, setInfoMsg] = useState('');
  const [infoErr, setInfoErr] = useState('');
  const [infoBusy, setInfoBusy] = useState(false);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const router = useRouter();

  if (!user) return null;

  const saveInfo = async () => {
    setInfoMsg('');
    setInfoErr('');
    if (!name.trim() || !email.trim()) return setInfoErr('Name and email are required');
    setInfoBusy(true);
    try {
      const updated = await updateProfile({ userName: name, userEmail: email });
      await updateUser(updated);
      setInfoMsg('Profile updated');
    } catch (e: any) {
      setInfoErr(e.message);
    } finally {
      setInfoBusy(false);
    }
  };

  const savePassword = async () => {
    setPwMsg('');
    setPwErr('');
    if (!current || !next) return setPwErr('Fill all password fields');
    if (next.length < 4) return setPwErr('New password must be at least 4 characters');
    if (next !== confirm) return setPwErr('New passwords do not match');
    setPwBusy(true);
    try {
      await changePassword(current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      setPwMsg('Password changed');
    } catch (e: any) {
      setPwErr(e.message);
    } finally {
      setPwBusy(false);
    }
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <View style={s.hero}>
        <Avatar name={user.userName} size={84} />
        <Text style={s.name}>{user.userName}</Text>
        <Text style={s.muted}>User ID: {user.userId}</Text>
        <Text style={[s.pill, user.userRole === 'admin' ? s.admin : s.user]}>
          {user.userRole === 'admin' ? 'Admin' : 'User'}
        </Text>
      </View>

      {user.userRole === 'user' && (
        <Pressable style={s.link} onPress={() => router.push('/my-tickets' as any)}>
          <View style={s.linkIcon}>
            <Ionicons name="ticket" size={22} color="#0B7A5E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.linkTitle}>My tickets</Text>
            <Text style={s.muted}>View all your booked tickets</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#4A5A55" />
        </Pressable>
      )}

      <View style={s.card}>
        <Text style={s.section}>Profile info</Text>
        <Text style={s.label}>Name</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Full name" />
        <Text style={s.label}>Email</Text>
        <TextInput
          style={s.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {!!infoErr && <Text style={s.error}>{infoErr}</Text>}
        {!!infoMsg && <Text style={s.ok}>{infoMsg}</Text>}
        <Pressable style={s.button} onPress={saveInfo} disabled={infoBusy}>
          {infoBusy ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Save changes</Text>}
        </Pressable>
      </View>

      <View style={s.card}>
        <Text style={s.section}>Change password</Text>
        <Text style={s.label}>Current password</Text>
        <TextInput style={s.input} value={current} onChangeText={setCurrent} secureTextEntry placeholder="Current password" />
        <Text style={s.label}>New password</Text>
        <TextInput style={s.input} value={next} onChangeText={setNext} secureTextEntry placeholder="New password" />
        <Text style={s.label}>Confirm new password</Text>
        <TextInput style={s.input} value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="Repeat new password" />
        {!!pwErr && <Text style={s.error}>{pwErr}</Text>}
        {!!pwMsg && <Text style={s.ok}>{pwMsg}</Text>}
        <Pressable style={s.button} onPress={savePassword} disabled={pwBusy}>
          {pwBusy ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Update password</Text>}
        </Pressable>
      </View>

      <Pressable style={s.logout} onPress={logout}>
        <Text style={s.logoutText}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F5' },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  hero: { alignItems: 'center', gap: 4, paddingVertical: 8 },
  name: { fontSize: 22, fontWeight: '700', color: '#10201C', marginTop: 8 },
  muted: { fontSize: 13, color: '#4A5A55' },
  pill: { fontSize: 12, fontWeight: '700', paddingHorizontal: 12, paddingVertical: 3, borderRadius: 99, overflow: 'hidden', marginTop: 4 },
  admin: { backgroundColor: '#E5EDFD', color: '#2563EB' },
  user: { backgroundColor: '#DDF1EA', color: '#0B7A5E' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 8, borderWidth: 1, borderColor: '#E3EAE7' },
  section: { fontSize: 16, fontWeight: '700', color: '#10201C', marginBottom: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#10201C' },
  input: {
    height: 46, borderWidth: 1, borderColor: '#9FB0AA', borderRadius: 12,
    paddingHorizontal: 14, fontSize: 16, backgroundColor: '#fff',
  },
  error: { color: '#B3261E' },
  ok: { color: '#0B7A5E', fontWeight: '600' },
  button: {
    height: 50, borderRadius: 12, backgroundColor: '#0B7A5E', alignItems: 'center',
    justifyContent: 'center', marginTop: 6,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logout: {
    height: 50, borderRadius: 12, borderWidth: 2, borderColor: '#B3261E',
    alignItems: 'center', justifyContent: 'center',
  },
  logoutText: { color: '#B3261E', fontSize: 16, fontWeight: '600' },
  link: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row',
    alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E3EAE7',
  },
  linkIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#DDF1EA',
    alignItems: 'center', justifyContent: 'center',
  },
  linkTitle: { fontSize: 16, fontWeight: '700', color: '#10201C' },
});