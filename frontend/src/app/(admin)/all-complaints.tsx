import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import Avatar from '../../components/Avatar';
import { deleteComplaint, getComplaints } from '../../services/complaintService';
import { Complaint } from '../../types';
import { confirmDelete } from '../../utils/confirm';
import { formatDate } from '../../utils/formate';

export default function AllComplaints() {
  const [list, setList] = useState<Complaint[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    getComplaints().then((l) => { setList(l); setLoading(false); });
  }, []);

  useFocusEffect(load);

  const term = q.trim().toLowerCase();
  const shown = list.filter(
    (c) =>
      !term ||
      String(c.userId) === term ||
      c.complaintText.toLowerCase().includes(term) ||
      (c.userName ?? '').toLowerCase().includes(term)
  );

  const remove = async (id: number) => {
    if (await confirmDelete('Delete this complaint?')) {
      await deleteComplaint(id);
      load();
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0B7A5E" />;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: '#F4F6F5' }}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      data={shown}
      keyExtractor={(c) => String(c.complaintId)}
      ListHeaderComponent={
        <View style={{ gap: 8, marginBottom: 4 }}>
          <TextInput style={s.input} value={q} onChangeText={setQ} placeholder="Search by user ID, name or text" />
          <Text style={s.muted}>{shown.length} complaint(s)</Text>
        </View>
      }
      ListEmptyComponent={<Text style={s.muted}>Nothing found</Text>}
      renderItem={({ item }) => (
        <View style={s.card}>
          <View style={s.head}>
            <Avatar name={item.userName} />
            <View style={{ flex: 1 }}>
              <Text style={s.name}>User ID: {item.userId}</Text>
              <Text style={s.muted}>{item.userName} · {formatDate(item.complaintDate)}</Text>
            </View>
            <Pressable onPress={() => remove(item.complaintId)} hitSlop={10}>
              <Ionicons name="trash-outline" size={22} color="#B3261E" />
            </Pressable>
          </View>
          <Text style={s.body}>{item.complaintText}</Text>
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  input: {
    height: 46, borderWidth: 1, borderColor: '#9FB0AA', borderRadius: 12,
    paddingHorizontal: 14, fontSize: 16, backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 10, borderWidth: 1,
    borderColor: '#E3EAE7', borderLeftWidth: 5, borderLeftColor: '#F2A93B',
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 15, fontWeight: '700', color: '#10201C' },
  body: { fontSize: 15, lineHeight: 22, color: '#10201C' },
  muted: { fontSize: 13, color: '#4A5A55' },
});