import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import AppHeader, { useHeaderOffset } from '../../components/AppHeader';
import { useAuth } from '../../context/AuthContext';
import { getUsers } from '../../services/adminService';
import { getComplaints } from '../../services/complaintService';
import { getLostFound } from '../../services/lostFoundService';
import { getRoutes } from '../../services/routeService';

const items: {
  key: 'complaints' | 'lostFound' | 'routes' | 'users';
  title: string;
  path: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'complaints', title: 'Complaints', path: '/all-complaints', icon: 'chatbox-ellipses' },
  { key: 'lostFound', title: 'Lost & Found', path: '/all-lostfound', icon: 'search' },
  { key: 'routes', title: 'Manage routes', path: '/manage-routes', icon: 'git-branch' },
  { key: 'users', title: 'All users', path: '/users', icon: 'people' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const offset = useHeaderOffset();
  const [counts, setCounts] = useState({ complaints: 0, lostFound: 0, routes: 0, users: 0 });

  useFocusEffect(
    useCallback(() => {
      Promise.all([getComplaints(), getLostFound(), getRoutes(), getUsers()]).then(([c, l, r, u]) =>
        setCounts({ complaints: c.length, lostFound: l.length, routes: r.length, users: u.length })
      );
    }, [])
  );

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={[s.content, { paddingTop: offset + 16 }]}>
        <View style={s.greet}>
          <Text style={s.muted}>Admin panel</Text>
          <Text style={s.title}>Hi, {user?.userName}</Text>
        </View>

        <View style={s.grid}>
          {items.map((it) => (
            <Pressable key={it.key} style={s.card} onPress={() => router.push(it.path as any)}>
              <View style={s.iconWrap}>
                <Ionicons name={it.icon} size={28} color="#0B7A5E" />
              </View>
              <Text style={s.cardTitle}>{it.title}</Text>
              <Text style={s.sub}>{counts[it.key]} total</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <AppHeader />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F5' },
  content: { padding: 20, paddingBottom: 40 },
  greet: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '700', color: '#10201C' },
  muted: { fontSize: 14, color: '#4A5A55' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '96%', height: 160, backgroundColor: '#6fcd6a', borderRadius: 16, padding: 14,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  iconWrap: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#DDF1EA',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#10201C', textAlign: 'center' },
  sub: { fontSize: 13, color: '#4A5A55', textAlign: 'center' },
});