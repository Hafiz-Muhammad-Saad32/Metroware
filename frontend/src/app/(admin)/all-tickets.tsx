import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import TicketCard, { ticketCode } from '../../components/TicketCard';
import { getAllTickets, markBookingPaid } from '../../services/ticketService';
import { Ticket } from '../../types';

export default function AllTickets() {
    const [list, setList] = useState<Ticket[]>([]);
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        getAllTickets().then((l) => { setList(l); setLoading(false); });
    }, []);

    useFocusEffect(load);

    const markPaid = async (bookingId: number) => {
        await markBookingPaid(bookingId);
        load();
    };

    const busStats = useMemo(() => {
        const map = new Map<string, { bus: string; route: string; tickets: number; users: Set<number>; paid: number; pending: number }>();
        list.forEach((t) => {
            const key = t.busNumber ?? 'Unknown';
            const e = map.get(key) ?? { bus: key, route: t.routeName ?? '', tickets: 0, users: new Set<number>(), paid: 0, pending: 0 };
            e.tickets += 1;
            e.users.add(t.userId);
            if (t.paymentStatus === 'paid') e.paid += t.price;
            else e.pending += t.price;
            map.set(key, e);
        });
        return [...map.values()].sort((a, b) => b.paid - a.paid);
    }, [list]);

    const term = q.trim().toLowerCase();
    const shown = list.filter(
        (t) =>
            !term ||
            String(t.userId) === term ||
            (t.userName ?? '').toLowerCase().includes(term) ||
            ticketCode(t.ticketId).toLowerCase().includes(term) ||
            (t.busNumber ?? '').toLowerCase().includes(term)
    );

    const collected = list.filter((t) => t.paymentStatus === 'paid').reduce((sum, t) => sum + t.price, 0);

    if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0B7A5E" />;

    return (
        <FlatList
            style={{ flex: 1, backgroundColor: '#F4F6F5' }}
            contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}
            data={shown}
            keyExtractor={(t) => String(t.ticketId)}
            ListHeaderComponent={
                <View style={{ gap: 10 }}>
                    <View style={s.stats}>
                        <View style={s.stat}>
                            <Text style={s.muted}>Tickets</Text>
                            <Text style={s.num}>{list.length}</Text>
                        </View>
                        <View style={s.stat}>
                            <Text style={s.muted}>Collected (paid)</Text>
                            <Text style={s.num}>Rs {collected}</Text>
                        </View>

                    </View>

                    <Text style={s.section}>Bus-wise summary</Text>
                    {busStats.map((b) => (
                        <View key={b.bus} style={s.busCard}>
                            <View style={s.busHead}>
                                <Ionicons name="bus" size={20} color="#0B7A5E" />
                                <Text style={s.busName}>{b.bus}</Text>
                                <Text style={s.muted}>{b.route}</Text>
                            </View>
                            <View style={s.busRow}>
                                <Mini label="Tickets" value={String(b.tickets)} />
                                <Mini label="Passengers" value={String(b.users.size)} />
                                <Mini label="Collected" value={`Rs ${b.paid}`} />
                                <Mini label="Pending" value={`Rs ${b.pending}`} />
                            </View>
                        </View>
                    ))}

                    <TextInput
                        style={s.input}
                        value={q}
                        onChangeText={setQ}
                        placeholder="Search by user ID, name, ticket ID or bus"
                    />
                    <Text style={s.muted}>{shown.length} ticket(s)</Text>
                </View>
            }
            ListEmptyComponent={<Text style={s.muted}>Nothing found</Text>}
            renderItem={({ item }) => {
                const pendingCount = list.filter(
                    (x) => x.bookingId === item.bookingId && x.paymentStatus === 'pending'
                ).length;
                return (
                    <View style={{ gap: 8 }}>
                        <TicketCard ticket={item} />
                        {item.paymentStatus === 'pending' && (
                            <Pressable style={s.markPaid} onPress={() => markPaid(item.bookingId)}>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                <Text style={s.markPaidText}>
                                    Mark as paid ({pendingCount} ticket{pendingCount > 1 ? 's' : ''}, cash received)
                                </Text>
                            </Pressable>
                        )}
                    </View>
                );
            }}
        />
    );
}

function Mini({ label, value }: { label: string; value: string }) {
    return (
        <View style={{ flex: 1 }}>
            <Text style={s.miniLabel}>{label}</Text>
            <Text style={s.miniValue}>{value}</Text>
        </View>
    );
}

const s = StyleSheet.create({
    stats: { flexDirection: 'row', gap: 10 },
    stat: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#E3EAE7' },
    num: { fontSize: 22, fontWeight: '800', color: '#10201C' },
    muted: { fontSize: 13, color: '#4A5A55' },
    input: {
        height: 46, borderWidth: 1, borderColor: '#9FB0AA', borderRadius: 12,
        paddingHorizontal: 14, fontSize: 16, backgroundColor: '#fff',
    },
    section: { fontSize: 16, fontWeight: '700', color: '#10201C', marginTop: 4 },
    busCard: {
        backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 10, borderWidth: 1,
        borderColor: '#E3EAE7', borderLeftWidth: 5, borderLeftColor: '#0B7A5E',
    },
    busHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    busName: { fontSize: 16, fontWeight: '800', color: '#10201C' },
    busRow: { flexDirection: 'row', gap: 8 },
    miniLabel: { fontSize: 11, fontWeight: '700', color: '#7A8A85' },
    miniValue: { fontSize: 15, fontWeight: '700', color: '#10201C' },
    markPaid: {
        height: 46, borderRadius: 12, backgroundColor: '#0B7A5E', flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    markPaidText: { color: '#fff', fontWeight: '700' },
});