import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import Avatar from '../../components/Avatar';
import { getUsers } from '../../services/adminService';
import { getComplaints } from '../../services/complaintService';
import { getLostFound } from '../../services/lostFoundService';
import { getAllTickets } from '../../services/ticketService';
import { Complaint, LostFoundItem, SessionUser, Ticket } from '../../types';

export default function Users() {
  const [list, setList] = useState<SessionUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [items, setItems] = useState<LostFoundItem[]>([]);

  useEffect(() => {
    Promise.all([getUsers(), getAllTickets(), getComplaints(), getLostFound()]).then(([u, t, c, l]) => {
      setList(u);
      setTickets(t);
      setComplaints(c);
      setItems(l);
      setLoading(false);
    });
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
        const mine = tickets.filter((t) => t.userId === item.userId);
        const perBus: Record<string, number> = {};
        mine.forEach((t) => {
          const k = t.busNumber ?? 'Unknown';
          perBus[k] = (perBus[k] ?? 0) + 1;
        });
        const complaintCount = complaints.filter((c) => c.userId === item.userId).length;
        const itemCount = items.filter((i) => i.userId === item.userId).length;
        const travel = Object.entries(perBus).map(([bus, n]) => `${bus} × ${n}`).join('  ·  ');

        return (
          <View style={[s.card, { borderLeftColor: admin ? '#2563EB' : '#0B7A5E' }]}>
            <View style={s.rowTop}>
              <Avatar name={item.userName} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={s.bold}>{item.userName}</Text>
                <Text style={s.muted}>{item.userEmail}</Text>
                <Text style={s.muted}>User ID: {item.userId}</Text>
              </View>
              <Text style={[s.pill, admin ? s.admin : s.user]}>{admin ? 'Admin' : 'User'}</Text>
            </View>

            <View style={s.chips}>
              <View style={s.chip}><Text style={s.chipNum}>{mine.length}</Text><Text style={s.chipLabel}>Trips</Text></View>
              <View style={s.chip}><Text style={s.chipNum}>{complaintCount}</Text><Text style={s.chipLabel}>Complaints</Text></View>
              <View style={s.chip}><Text style={s.chipNum}>{itemCount}</Text><Text style={s.chipLabel}>Lost/Found</Text></View>
            </View>

            <Text style={s.muted}>Travelled: {travel || 'no trips yet'}</Text>
          </View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 10,
    borderWidth: 1, borderColor: '#E3EAE7', borderLeftWidth: 5,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { flex: 1, backgroundColor: '#F4F6F5', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  chipNum: { fontSize: 18, fontWeight: '800', color: '#10201C' },
  chipLabel: { fontSize: 12, color: '#4A5A55' },
  bold: { fontSize: 16, fontWeight: '700', color: '#10201C' },
  muted: { fontSize: 13, color: '#4A5A55' },
  pill: { fontSize: 12, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99, overflow: 'hidden' },
  admin: { backgroundColor: '#E5EDFD', color: '#2563EB' },
  user: { backgroundColor: '#DDF1EA', color: '#0B7A5E' },
});