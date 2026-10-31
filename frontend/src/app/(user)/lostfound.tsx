import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { addLostFound, getLostFound } from '../../services/lostFoundService';
import { LostFoundItem } from '../../types';
import { formatDate } from '../../utils/formate';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';

type Type = 'lost' | 'found';

export default function LostFound() {
  const { user } = useAuth();
  const [list, setList] = useState<LostFoundItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [itemType, setItemType] = useState<Type>('lost');
  const [filter, setFilter] = useState<'all' | Type>('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setList(await getLostFound());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!itemName.trim() || !description.trim()) return setError('Item name and description are required');
    if (!user) return;
    setError('');
    setBusy(true);
    await addLostFound(user.userId, { itemName, description, itemType });
    setItemName('');
    setDescription('');
    await load();
    setBusy(false);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#00fa32" />;

  const shown = filter === 'all' ? list : list.filter((i) => i.itemType === filter);

  return (
    <FlatList
      style={s.screen}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      data={shown}
      keyExtractor={(i) => String(i.itemId)}
      ListHeaderComponent={
        <View style={{ gap: 12, marginBottom: 8 }}>
          <Text style={s.label}>Item name</Text>
          <TextInput style={s.input} value={itemName} onChangeText={setItemName} placeholder="e.g. Black wallet" />
          <Text style={s.label}>Description</Text>
          <TextInput style={s.input} value={description} onChangeText={setDescription} placeholder="Colour, where, when" />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable onPress={() => setItemType('lost')}
              style={[s.toggle, itemType === 'lost' && { backgroundColor: '#ff3e34', borderColor: '#fa4a41' }]}>
              <Text style={[s.toggleText, itemType === 'lost' && { color: '#fff' }]}>Lost</Text>
            </Pressable>
            <Pressable onPress={() => setItemType('found')}
              style={[s.toggle, itemType === 'found' && { backgroundColor: '#00fa32', borderColor: '#0B7A5E' }]}>
              <Text style={[s.toggleText, itemType === 'found' && { color: '#fff' }]}>Found</Text>
            </Pressable>
          </View>

          {!!error && <Text style={s.error}>{error}</Text>}
          <Pressable style={s.button} onPress={submit} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Post</Text>}
          </Pressable>

          <Text style={[s.label, { marginTop: 8 }]}>Posted by others</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['all', 'lost', 'found'] as const).map((f) => (
              <Pressable key={f} onPress={() => setFilter(f)} style={[s.chip, filter === f && s.chipActive]}>
                <Text style={[s.chipText, filter === f && { color: '#fff' }]}>{f[0].toUpperCase() + f.slice(1)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      }
      renderItem={({ item }) => {
        const lost = item.itemType === 'lost';
        const color = lost ? '#fd3f35' : '#0B7A5E';
        return (
          <View style={[s.card, { borderLeftColor: color }]}>
            <View style={s.cardHead}>
              <View style={[s.iconWrap, { backgroundColor: lost ? '#FBE9E7' : '#DDF1EA' }]}>
                <Ionicons name={lost ? 'help-circle' : 'checkmark-circle'} size={24} color={color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>{item.itemName}</Text>
                <Text style={s.muted}>{formatDate(item.date)}</Text>
              </View>
              <Text style={[s.pill, lost ? s.lost : s.found]}>{lost ? 'Lost' : 'Found'}</Text>
            </View>
            <Text style={s.body}>{item.description}</Text>
            <View style={s.footer}>
              <Avatar name={item.userName} size={24} />
              <Text style={s.muted}>Posted by {item.userName ?? 'User'}</Text>
            </View>
          </View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F5' },
  label: { fontSize: 13, fontWeight: '600', color: '#10201C' },
  input: {
    height: 46, borderWidth: 1, borderColor: '#9FB0AA', borderRadius: 12, paddingHorizontal: 14,
    fontSize: 16, backgroundColor: '#fff'
  },
  toggle: {
    flex: 1, height: 46, borderRadius: 12, borderWidth: 2, borderColor: '#9FB0AA',
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center'
  },
  toggleText: { fontWeight: '700', color: '#10201C' },
  error: { color: '#fc483f' },
  button: { height: 50, borderRadius: 12, backgroundColor: '#00fa32', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  chip: {
    paddingHorizontal: 16, height: 36, borderRadius: 18, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#9FB0AA', justifyContent: 'center'
  },
  chipActive: { backgroundColor: '#00fa32', borderColor: '#00fa32' },
  chipText: { fontWeight: '600', color: '#10201C' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 10,
    borderWidth: 1, borderColor: '#E3EAE7', borderLeftWidth: 5
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: '#10201C' },
  body: { fontSize: 15, lineHeight: 22, color: '#10201C' },
  muted: { fontSize: 13, color: '#4A5A55' },
  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1,
    borderTopColor: '#E3EAE7', paddingTop: 10
  },
  pill: { fontSize: 12, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99, overflow: 'hidden' },
  lost: { backgroundColor: '#FBE9E7', color: '#f7372d' },
  found: { backgroundColor: '#DDF1EA', color: '#00fa32' },
});