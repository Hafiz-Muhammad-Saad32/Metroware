import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import Avatar from '../../components/Avatar';
import { getUsers } from '../../services/adminService';
import { SessionUser } from '../../types';

export default function Users() {
  const [list, setList] = useState<SessionUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers().then((u) => { setList(u); setLoading(false); });
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0B7A5E" />;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: '#F4F6F5' }}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      data={list}
      keyExtractor={(u) => String(u.userId)}
      renderItem={({ item }) => {
        const admin = item.userRole === 'admin';
        return (
          <View style={[s.card, { borderLeftColor: admin ? '#2563EB' : '#0B7A5E' }]}>
            <Avatar name={item.userName} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={s.bold}>{item.userName}</Text>
              <Text style={s.muted}>{item.userEmail}</Text>
              <Text style={s.muted}>User ID: {item.userId}</Text>
            </View>
            <Text style={[s.pill, admin ? s.admin : s.user]}>{admin ? 'Admin' : 'User'}</Text>
          </View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center',
    gap: 12, borderWidth: 1, borderColor: '#E3EAE7', borderLeftWidth: 5,
  },
  bold: { fontSize: 16, fontWeight: '700', color: '#10201C' },
  muted: { fontSize: 13, color: '#4A5A55' },
  pill: { fontSize: 12, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99, overflow: 'hidden' },
  admin: { backgroundColor: '#E5EDFD', color: '#2563EB' },
  user: { backgroundColor: '#DDF1EA', color: '#0B7A5E' },
});