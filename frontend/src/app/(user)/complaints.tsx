import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { addComplaint, getComplaints } from '../../services/complaintService';
import { Complaint } from '../../types';
import { formatDate } from '../../utils/formate';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';

export default function Complaints() {
  const { user } = useAuth();
  const [list, setList] = useState<Complaint[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setList(await getComplaints());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!text.trim()) return setError('Write your complaint first');
    if (!user) return;
    setError('');
    setBusy(true);
    await addComplaint(user.userId, text);
    setText('');
    await load();
    setBusy(false);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#00fa32" />;

  return (
    <FlatList
      style={s.screen}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      data={list}
      keyExtractor={(i) => String(i.complaintId)}
      ListHeaderComponent={
        <View style={{ gap: 12, marginBottom: 8 }}>
          <Text style={s.label}>Complaint</Text>
          <TextInput
            style={[s.input, { height: 90, paddingTop: 10, textAlignVertical: 'top' }]}
            value={text}
            onChangeText={setText}
            placeholder="What went wrong?"
            multiline
          />
          {!!error && <Text style={s.error}>{error}</Text>}
          <Pressable style={s.button} onPress={submit} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Submit complaint</Text>}
          </Pressable>
          <Text style={[s.label, { marginTop: 8 }]}>All complaints</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={s.card}>
          <View style={s.cardHead}>
            <Avatar name={item.userName} />
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{item.userName ?? 'User'}</Text>
              <Text style={s.muted}>{formatDate(item.complaintDate)}</Text>
            </View>
            <Ionicons name="alert-circle" size={22} color="#F2A93B" />
          </View>
          <Text style={s.body}>{item.complaintText}</Text>
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F5' },
  label: { fontSize: 13, fontWeight: '600', color: '#10201C' },
  input: {
    borderWidth: 1, borderColor: '#9FB0AA', borderRadius: 12, paddingHorizontal: 14,
    fontSize: 16, backgroundColor: '#fff'
  },
  error: { color: '#B3261E' },
  button: { height: 50, borderRadius: 12, backgroundColor: '#00fa32', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 10,
    borderWidth: 1, borderColor: '#E3EAE7', borderLeftWidth: 5, borderLeftColor: '#F2A93B'
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 15, fontWeight: '700', color: '#10201C' },
  body: { fontSize: 15, lineHeight: 22, color: '#10201C' },
  muted: { fontSize: 13, color: '#4A5A55' },
});