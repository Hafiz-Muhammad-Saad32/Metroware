import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import TicketCard from '../../components/TicketCard';
import { getMyTickets } from '../../services/ticketService';
import { Ticket } from '../../types';

export default function MyTickets() {
  const router = useRouter();
  const { booked } = useLocalSearchParams<{ booked?: string }>();
  const [list, setList] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

    useFocusEffect(
    useCallback(() => {
      getMyTickets()
        .then((l) => setList(l))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [])
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0B7A5E" />;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: '#F4F6F5' }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}
      data={list}
      keyExtractor={(t) => String(t.ticketId)}
      ListHeaderComponent={
        booked ? (
          <View style={s.banner}>
            <Ionicons name="checkmark-circle" size={22} color="#0B7A5E" />
            <Text style={s.bannerText}>{booked} ticket(s) booked successfully</Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={s.empty}>
          <Ionicons name="ticket-outline" size={56} color="#9FB0AA" />
          <Text style={s.emptyText}>No tickets yet</Text>
          <Pressable style={s.button} onPress={() => router.replace('/book-ticket' as any)}>
            <Text style={s.buttonText}>Book a ticket</Text>
          </Pressable>
        </View>
      }
      renderItem={({ item }) => <TicketCard ticket={item} />}
    />
  );
}

const s = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#DDF1EA',
    padding: 12, borderRadius: 12, marginBottom: 4,
  },
  bannerText: { color: '#0B7A5E', fontWeight: '700' },
  empty: { alignItems: 'center', gap: 10, paddingTop: 60 },
  emptyText: { fontSize: 16, color: '#4A5A55' },
  button: { height: 48, paddingHorizontal: 24, borderRadius: 12, backgroundColor: '#0B7A5E', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});