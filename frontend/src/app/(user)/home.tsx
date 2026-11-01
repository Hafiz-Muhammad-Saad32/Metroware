import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppHeader, { useHeaderOffset } from '../../components/AppHeader';
import { useAuth } from '../../context/AuthContext';

const items: { title: string; sub: string; path: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { title: 'Bus routes', sub: 'Pick a bus, see its route', path: '/routes', icon: 'bus' },
  { title: 'Nearest stop', sub: 'Where to board and get off', path: '/nearest', icon: 'location' },
  { title: 'Complaints', sub: 'Report a metro problem', path: '/complaints', icon: 'chatbox-ellipses' },
  { title: 'Lost & Found', sub: 'Post or find items', path: '/lostfound', icon: 'search' },
];

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const offset = useHeaderOffset();

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={[s.content, { paddingTop: offset + 16 }]}>
        <View style={s.greet}>
          <Text style={s.muted}>Welcome</Text>
          <Text style={s.title}>Hi, {user?.userName}</Text>
        </View>

        <Pressable style={s.featured} onPress={() => router.push('/book-ticket' as any)}>
          <View style={s.featIcon}>
            <Ionicons name="ticket" size={28} color="#0B7A5E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.featTitle}>Book ticket</Text>
            <Text style={s.featSub}>Buy tickets online · Cash or Easypaisa</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </Pressable>

        <View style={s.grid}>
          {items.map((it) => (
            <Pressable key={it.path} style={s.card} onPress={() => router.push(it.path as any)}>
              <View style={s.iconWrap}>
                <Ionicons name={it.icon} size={28} color="#0B7A5E" />
              </View>
              <Text style={s.cardTitle}>{it.title}</Text>
              <Text style={s.sub}>{it.sub}</Text>
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
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  greet: { marginBottom: 6 },
  title: { fontSize: 26, fontWeight: '700', color: '#10201C' },
  muted: { fontSize: 14, color: '#4A5A55' },
  featured: {
    backgroundColor: '#0B7A5E', borderRadius: 18, padding: 18, flexDirection: 'row',
    alignItems: 'center', gap: 14,
  },
  featIcon: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  featTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  featSub: { color: '#CFEDE3', fontSize: 13, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '96%', height: 160, backgroundColor: '#6eec7a', borderRadius: 16, padding: 14,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  iconWrap: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#DDF1EA',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#10201C', textAlign: 'center' },
  sub: { fontSize: 13, color: '#4A5A55', textAlign: 'center' },
});