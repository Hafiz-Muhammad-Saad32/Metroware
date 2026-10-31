import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import AppHeader, { useHeaderOffset } from '../../components/AppHeader';

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
  sub: { fontSize: 13, color: '#3d3d3d', textAlign: 'center' },
});