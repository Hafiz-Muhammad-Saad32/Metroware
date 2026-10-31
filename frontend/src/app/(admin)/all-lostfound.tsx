import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import Avatar from '../../components/Avatar';
import { deleteLostFound, getLostFound } from '../../services/lostFoundService';
import { LostFoundItem } from '../../types';
import { confirmDelete } from '../../utils/confirm';
import { formatDate } from '../../utils/formate';

export default function AllLostFound() {
  const [list, setList] = useState<LostFoundItem[]>([]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    getLostFound().then((l) => { setList(l); setLoading(false); });
  }, []);

  useFocusEffect(load);

  const term = q.trim().toLowerCase();
  const shown = list.filter(
    (i) =>
      (filter === 'all' || i.itemType === filter) &&
      (!term ||
        String(i.userId) === term ||
        i.itemName.toLowerCase().includes(term) ||
        i.description.toLowerCase().includes(term))
  );

  const remove = async (id: number) => {
    if (await confirmDelete('Delete this post?')) {
      await deleteLostFound(id);
      load();
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0B7A5E" />;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: '#F4F6F5' }}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      data={shown}
      keyExtractor={(i) => String(i.itemId)}
      ListHeaderComponent={
        <View style={{ gap: 10, marginBottom: 4 }}>
          <TextInput style={s.input} value={q} onChangeText={setQ} placeholder="Search by user ID, item or text" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['all', 'lost', 'found'] as const).map((f) => (
              <Pressable key={f} onPress={() => setFilter(f)} style={[s.chip, filter === f && s.chipActive]}>
                <Text style={[s.chipText, filter === f && { color: '#fff' }]}>{f[0].toUpperCase() + f.slice(1)}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={s.muted}>{shown.length} post(s)</Text>
        </View>
      }
      ListEmptyComponent={<Text style={s.muted}>Nothing found</Text>}
      renderItem={({ item }) => {
        const lost = item.itemType === 'lost';
        const color = lost ? '#B3261E' : '#0B7A5E';
        return (
          <View style={[s.card, { borderLeftColor: color }]}>
            <View style={s.head}>
              <View style={[s.iconWrap, { backgroundColor: lost ? '#FBE9E7' : '#DDF1EA' }]}>
                <Ionicons name={lost ? 'help-circle' : 'checkmark-circle'} size={24} color={color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>{item.itemName}</Text>
                <Text style={s.muted}>{formatDate(item.date)}</Text>
              </View>
              <Text style={[s.pill, lost ? s.lost : s.found]}>{lost ? 'Lost' : 'Found'}</Text>
              <Pressable onPress={() => remove(item.itemId)} hitSlop={10}>
                <Ionicons name="trash-outline" size={22} color="#B3261E" />
              </Pressable>
            </View>
            <Text style={s.body}>{item.description}</Text>
            <View style={s.footer}>
              <Avatar name={item.userName} size={24} />
              <Text style={s.muted}>User ID: {item.userId} · {item.userName}</Text>
            </View>
          </View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  input: {
    height: 46, borderWidth: 1, borderColor: '#9FB0AA', borderRadius: 12,
    paddingHorizontal: 14, fontSize: 16, backgroundColor: '#fff',
  },
  chip: {
    paddingHorizontal: 16, height: 36, borderRadius: 18, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#9FB0AA', justifyContent: 'center',
  },
  chipActive: { backgroundColor: '#0B7A5E', borderColor: '#0B7A5E' },
  chipText: { fontWeight: '600', color: '#10201C' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 10, borderWidth: 1,
    borderColor: '#E3EAE7', borderLeftWidth: 5,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: '#10201C' },
  body: { fontSize: 15, lineHeight: 22, color: '#10201C' },
  muted: { fontSize: 13, color: '#4A5A55' },
  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1,
    borderTopColor: '#E3EAE7', paddingTop: 10,
  },
  pill: { fontSize: 12, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99, overflow: 'hidden' },
  lost: { backgroundColor: '#FBE9E7', color: '#B3261E' },
  found: { backgroundColor: '#DDF1EA', color: '#0B7A5E' },
});